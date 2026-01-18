import { dialog } from "electron";
import { formatPrismaDate } from "../../lib/formatTime.js";
import { GroupedData, IRekapModuleParams } from "../../types/index.js";
import { prisma } from "../../database.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import fs from "fs";

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export async function getRekapPenjualanCafe(data: IRekapModuleParams) {
  try {
    let customRange;
    if (data.periode === "custom" && data.custom) {
      customRange = {
        startDate: new Date(data.custom.start_date),
        endDate: new Date(data.custom.end_date),
      };
    }

    const { gte, lte } = formatPrismaDate(data.periode, customRange);

    const formatDateTimeIndo = (date: Date) => {
      return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };

    const periodeLabel = `${formatDateTimeIndo(gte)} - ${formatDateTimeIndo(lte)}`;

    const orderItems = await prisma.orderCafe.findMany({
      where: {
        created_at: { gte, lte },
        status: "PAID",
      },
      include: {
        menucafe: {
          include: { category_menu: true },
        },
      },
    });

    // 1. Siapkan penampung data
    const grouped: GroupedData = {}; // Untuk List Menu & Qty
    const category_totals: Record<string, number> = {}; // NEW: Untuk Total Uang per Kategori
    let grand_total_order = 0; // Untuk Total Keseluruhan

    orderItems.forEach((order) => {
      // Ambil nominal uang dari transaksi ini
      const nominal = order.subtotal ?? 0;

      // A. Tambahkan ke Grand Total
      grand_total_order += nominal;

      if (!order.menucafe) return;
      const category = order.menucafe.category_menu?.name || "Lainnya";
      const menuName = order.menucafe.name;
      const qty = order.qty;

      // B. Logic Grouping Item (Menu & Qty) -- Tetap seperti sebelumnya
      if (!grouped[category]) grouped[category] = [];

      const existing = grouped[category].find((m) => m.name === menuName);
      if (existing) {
        existing.total += qty; // Note: 'total' di object ini adalah QTY
      } else {
        grouped[category].push({ name: menuName, total: qty });
      }

      // C. Logic Total Per Category (NEW)
      // Jika kategori belum ada di penampung total, inisialisasi 0
      if (!category_totals[category]) category_totals[category] = 0;
      // Tambahkan nominal uang ke kategori tersebut
      category_totals[category] += nominal;
    });

    // Sorting Item berdasarkan Qty terbanyak (DESC)
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => b.total - a.total);
    });

    return {
      data_order: grouped,
      category_totals: category_totals, // Return data total per kategori
      period: periodeLabel,
      total_order: grand_total_order,
    };
  } catch (err) {
    dialog.showErrorBox("Error", `Gagal mengambil data: ${err}`);
    return null;
  }
}

export async function generateExcelRekapPenjualanCafe(
  data: GroupedData,
  category_totals: Record<string, number>, // Tambahan Parameter
  total_order: number, // Tambahan Parameter
  period: string,
  filePath: string,
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Rekap Penjualan");

  // --- 1. SETUP JUDUL ---
  sheet.mergeCells("A1:B1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "REKAP PENJUALAN CAFE";
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: "center" };

  sheet.mergeCells("A2:B2");
  const periodCell = sheet.getCell("A2");
  periodCell.value = `Periode: ${period}`;
  periodCell.alignment = { horizontal: "center" };

  let currentRow = 4;

  // --- 2. LOOP DATA KATEGORI ---
  for (const category of Object.keys(data)) {
    // A. Header Kategori & Total Rupiah Kategori
    // Kita TIDAK merge A dan B, agar kolom B bisa diisi nominal rupiah

    // Kolom A: Nama Kategori
    const catCell = sheet.getCell(`A${currentRow}`);
    catCell.value = category.toUpperCase();
    catCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDDDDDD" }, // Abu-abu muda
    };
    catCell.font = { bold: true };

    // Kolom B: Total Rupiah per Kategori
    const catTotalCell = sheet.getCell(`B${currentRow}`);
    const totalCat = category_totals[category] || 0;
    catTotalCell.value = formatRupiah(totalCat); // Tampilkan Rp...
    catTotalCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDDDDDD" },
    };
    catTotalCell.font = { bold: true };
    catTotalCell.alignment = { horizontal: "right" };

    currentRow++;

    // B. Header Table (Menu | Qty)
    const headerRow = sheet.getRow(currentRow);
    headerRow.values = ["Menu", "Terjual"];
    headerRow.font = { bold: true, italic: true };
    currentRow++;

    // C. Item Data
    data[category].forEach((item) => {
      const row = sheet.getRow(currentRow);
      row.values = [item.name, item.total];

      // Alignment kolom Qty ke kanan agar rapi
      row.getCell(2).alignment = { horizontal: "right" };

      currentRow++;
    });

    // Spasi antar kategori
    currentRow++;
  }

  // --- 3. GRAND TOTAL ---
  currentRow++; // Tambah spasi lagi biar tidak nempel

  // Label Grand Total
  const grandTotalLabel = sheet.getCell(`A${currentRow}`);
  grandTotalLabel.value = "TOTAL PENDAPATAN";
  grandTotalLabel.font = { bold: true, size: 12 };
  grandTotalLabel.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFFF00" }, // Kuning
  };

  // Value Grand Total
  const grandTotalValue = sheet.getCell(`B${currentRow}`);
  grandTotalValue.value = formatRupiah(total_order);
  grandTotalValue.font = { bold: true, size: 12 };
  grandTotalValue.alignment = { horizontal: "right" };
  grandTotalValue.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFFF00" }, // Kuning
  };

  // Border untuk Grand Total
  grandTotalLabel.border = {
    top: { style: "double" },
    bottom: { style: "double" },
  };
  grandTotalValue.border = {
    top: { style: "double" },
    bottom: { style: "double" },
  };

  // --- 4. FINISHING ---
  // Auto width kolom
  sheet.getColumn(1).width = 35; // Menu
  sheet.getColumn(2).width = 25; // Terjual / Nominal

  await workbook.xlsx.writeFile(filePath);
}

export async function generatePDFRekapPenjualanCafe(
  data: GroupedData,
  category_totals: Record<string, number>,
  total_order: number,
  period: string,
  filePath: string,
) {
  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // --- CONFIG LAYOUT ---
    const startX = 50;
    const tableWidth = 450;
    const qtyColWidth = 100;
    const menuColWidth = tableWidth - qtyColWidth;
    const rowHeight = 20;

    // --- JUDUL HALAMAN ---
    doc.fontSize(18).text("REKAP PENJUALAN CAFE", { align: "center" });
    doc.fontSize(12).text(`Periode: ${period}`, { align: "center" });
    doc.moveDown(2);

    // --- LOOP KATEGORI ---
    Object.keys(data).forEach((category) => {
      // 1. Cek Halaman sebelum print Judul Kategori
      if (doc.y > 700) {
        doc.addPage();
      }

      const catY = doc.y;

      // 2. JUDUL KATEGORI & TOTAL
      doc
        .fontSize(14)
        .fillColor("black")
        .font("Helvetica-Bold")
        .text(category.toUpperCase(), startX, catY, { underline: true });

      const catTotal = category_totals[category] || 0;
      doc.fontSize(12).text(formatRupiah(catTotal), startX, catY + 2, {
        width: tableWidth,
        align: "right",
      });

      doc.moveDown(0.5);

      // --- RENDER TABLE HEADER ---
      // Fungsi helper untuk gambar header (bisa dipanggil ulang saat ganti page)
      const drawTableHeader = (y: number) => {
        doc.rect(startX, y, tableWidth, rowHeight).fill("#eeeeee");

        doc
          .fillColor("black")
          .fontSize(10)
          .font("Helvetica-Bold")
          .text("MENU", startX + 10, y + 5, {
            width: menuColWidth,
            align: "left",
          });

        doc.text("TERJUAL", startX + menuColWidth, y + 5, {
          width: qtyColWidth - 10,
          align: "right",
        });

        // Kembalikan cursor ke bawah header
        doc.y = y + rowHeight;
      };

      // Gambar header pertama kali untuk kategori ini
      drawTableHeader(doc.y);

      // --- RENDER ISI TABLE (LOOP ITEMS) ---
      doc.font("Helvetica").fontSize(10);

      data[category].forEach((item) => {
        // --- PERBAIKAN LOGIKA PAGE BREAK DI SINI ---

        // Cek apakah sisa ruang cukup untuk 1 baris?
        if (doc.y + rowHeight > 750) {
          // Batas bawah halaman
          doc.addPage(); // Buat halaman baru

          // (Opsional) Gambar ulang Header Table di halaman baru agar rapi
          drawTableHeader(doc.y);

          // Set font lagi karena kadang reset setelah addPage
          doc.font("Helvetica").fontSize(10);
        }

        // Ambil posisi Y yang SUDAH PASTI BENAR (entah lanjut atau habis addPage)
        const currentY = doc.y;

        // 1. Gambar Garis Separator
        doc
          .moveTo(startX, currentY + rowHeight)
          .lineTo(startX + tableWidth, currentY + rowHeight)
          .lineWidth(0.5)
          .strokeColor("#cccccc")
          .stroke();

        // 2. Nama Menu
        doc.fillColor("black").text(item.name, startX + 10, currentY + 5, {
          width: menuColWidth - 10,
          align: "left",
          lineBreak: false,
          ellipsis: true,
        });

        // 3. Total Qty
        doc.text(item.total.toString(), startX + menuColWidth, currentY + 5, {
          width: qtyColWidth - 10,
          align: "right",
        });

        // Update doc.y untuk iterasi berikutnya
        doc.y = currentY + rowHeight;
      });

      doc.moveDown(2);
    });

    // --- GRAND TOTAL SECTION ---
    if (doc.y + 40 > 750) {
      doc.addPage();
    }

    const grandTotalY = doc.y;

    doc
      .rect(startX, grandTotalY, tableWidth, 30)
      .lineWidth(1)
      .strokeColor("black")
      .stroke();

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("black")
      .text("TOTAL PENDAPATAN", startX + 10, grandTotalY + 10, {
        align: "left",
      });

    doc.text(formatRupiah(total_order), startX, grandTotalY + 10, {
      width: tableWidth - 10,
      align: "right",
    });

    doc.end();

    stream.on("finish", () => resolve());
    stream.on("error", (err) => reject(err));
  });
}
