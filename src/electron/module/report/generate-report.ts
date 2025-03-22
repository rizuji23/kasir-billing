import { prisma } from "../../database.js";
import ExcelJS from "exceljs";
import { dialog } from "electron";
import fs from "fs";
import PDFDocument from "pdfkit";
import { convertRupiah } from "../../lib/utils.js";

export async function generateExcelReport(
  start_date: string,
  end_date: string,
) {
  try {
    const startDateTime = new Date(`${start_date}T00:00:00Z`);
    const endDateTime = new Date(`${end_date}T23:59:59.999Z`);

    endDateTime.setUTCDate(endDateTime.getUTCDate() + 1);
    endDateTime.setUTCHours(5, 0, 0, 0);

    const strukData = await prisma.struk.findMany({
      where: {
        updated_at: {
          gte: startDateTime,
          lte: endDateTime,
        },
      },
      orderBy: {
        updated_at: "desc",
      },
      include: {
        orderId: true,
      },
    });

    const workbook = new ExcelJS.Workbook();

    // Function to add data to a worksheet
    const addWorksheet = (name: string, data: typeof strukData) => {
      const worksheet = workbook.addWorksheet(name);
      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "ID Order", key: "id_struk", width: 15 },
        { header: "Nama", key: "name", width: 20 },
        { header: "Total Billing", key: "total_billing", width: 15 },
        { header: "Total Cafe", key: "total_cafe", width: 15 },
        { header: "Total", key: "total", width: 15 },
        { header: "Pembayaran", key: "cash", width: 15 },
        { header: "Kembalian", key: "change", width: 15 },
        { header: "Metode Pembayaran", key: "payment_method", width: 20 },
        { header: "Tanggal", key: "tanggal", width: 20 },
      ];

      // Format header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { horizontal: "center", vertical: "middle" };

      // Insert data
      data.forEach((struk, index) => {
        const row = worksheet.addRow({
          no: index + 1,
          id_struk: struk.id_struk,
          name: struk.name,
          total_billing: struk.total_billing,
          total_cafe: struk.total_cafe,
          total: struk.total,
          cash: struk.cash,
          change: struk.change,
          payment_method: struk.payment_method,
          tanggal: new Date(struk.created_at).toLocaleString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        });

        row.getCell("no").alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        row.getCell("tanggal").alignment = {
          horizontal: "center",
          vertical: "middle",
        };
      });

      // Compute totals
      const total = data.reduce((sum, struk) => sum + struk.total, 0);
      const total_billing = data.reduce(
        (sum, struk) => sum + (struk.total_billing || 0),
        0,
      );
      const total_cafe = data.reduce(
        (sum, struk) => sum + (struk.total_cafe || 0),
        0,
      );

      // Insert TOTAL row
      const totalRow = worksheet.addRow({
        no: "",
        id_struk: "TOTAL",
        name: "",
        total_billing: total_billing,
        total_cafe: total_cafe,
        total: total,
        cash: "",
        change: "",
        payment_method: "",
        tanggal: "",
      });

      worksheet.addRow([]);

      // Style TOTAL row
      totalRow.font = { bold: true };
      totalRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF00" },
        };
      });
    };

    // Create worksheets
    addWorksheet("Semua Transaksi", strukData);
    addWorksheet(
      "Pagi",
      strukData.filter((struk) => struk.shift === "Pagi"),
    );
    addWorksheet(
      "Malam",
      strukData.filter((struk) => struk.shift === "Malam"),
    );

    // Save file
    const { filePath } = await dialog.showSaveDialog({
      title: "Save Excel File",
      defaultPath: `Laporan Omset ${start_date} - ${end_date}.xlsx`,
      filters: [
        { name: "Excel Files", extensions: ["xlsx"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (!filePath) return;

    await workbook.xlsx.writeFile(filePath);

    return filePath;
  } catch (err) {
    return err;
  }
}

export async function generatePDFReport(
  start_date: string,
  end_date: string,
  shift: string = "all",
) {
  try {
    const startDateTime = new Date(`${start_date}T00:00:00Z`);
    const endDateTime = new Date(`${end_date}T23:59:59.999Z`);

    let whereClause: {
      created_at: {
        gte: Date;
        lte: Date;
      };
      shift?: string;
    } = {
      created_at: {
        gte: startDateTime,
        lte: endDateTime,
      },
    };

    if (shift && shift !== "all") {
      whereClause = {
        created_at: {
          gte: startDateTime,
          lte: endDateTime,
        },
        shift: shift,
      };
    }

    const strukData = await prisma.struk.findMany({
      where: whereClause,
      orderBy: {
        created_at: "desc",
      },
      include: {
        orderId: true,
      },
    });

    // Show save dialog
    const { filePath } = await dialog.showSaveDialog({
      title: "Save PDF File",
      defaultPath: `Laporan Omset ${start_date} - ${end_date} ${
        shift === "all" ? "Semua" : shift === "Pagi" ? "Pagi" : "Malam"
      }.pdf`,
      filters: [{ name: "PDF Files", extensions: ["pdf"] }],
    });

    if (!filePath) return null;

    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 30,
    });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text(
        `Laporan Omset ${
          shift === "all" ? "Semua" : shift === "Pagi" ? "Pagi" : "Malam"
        }`,
        { align: "center" },
      );
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`${start_date} - ${end_date}`, { align: "center" });
    doc.moveDown(2);

    // Define table column positions (X positions)
    const tableStartX = 30;
    const colWidths = [40, 120, 80, 80, 80, 80, 80, 120, 120]; // No ID Order
    const rowHeight = 20; // Keep row spacing consistent

    // Function to draw table headers
    const drawTableHeader = (y: number) => {
      let x = tableStartX;
      doc.font("Helvetica-Bold").fontSize(10);
      const headers = [
        "No",
        "Nama",
        "Total Billing",
        "Total Cafe",
        "Total",
        "Pembayaran",
        "Kembalian",
        "Metode Pembayaran",
        "Tanggal",
      ];

      headers.forEach((header, i) => {
        doc.text(header, x, y, { width: colWidths[i], align: "center" });
        x += colWidths[i]; // Move X position for the next column
      });

      // Draw line under headers
      doc
        .moveTo(tableStartX, y + rowHeight)
        .lineTo(800, y + rowHeight)
        .stroke();
    };

    // Function to draw a row of data
    const drawTableRow = (data: string[], y: number) => {
      let x = tableStartX;
      doc.font("Helvetica").fontSize(9);
      data.forEach((text, i) => {
        doc.text(text, x, y, { width: colWidths[i], align: "center" });
        x += colWidths[i];
      });

      // Draw line below each row
      doc
        .moveTo(tableStartX, y + rowHeight)
        .lineTo(800, y + rowHeight)
        .stroke();
    };

    // Draw table headers
    let rowY = doc.y;
    drawTableHeader(rowY);
    rowY += rowHeight + 5;

    // Compute totals
    const totalAmount = strukData.reduce((sum, struk) => sum + struk.total, 0);
    const totalBilling = strukData.reduce(
      (sum, struk) => sum + (struk.total_billing || 0),
      0,
    );
    const totalCafe = strukData.reduce(
      (sum, struk) => sum + (struk.total_cafe || 0),
      0,
    );

    // Insert table data
    strukData.forEach((struk, index) => {
      if (rowY > 500) {
        doc.addPage();
        rowY = doc.y;
        drawTableHeader(rowY);
        rowY += rowHeight + 5;
      }

      drawTableRow(
        [
          (index + 1).toString(),
          struk.name,
          convertRupiah(struk.total_billing?.toString() || "0"),
          convertRupiah(struk.total_cafe?.toString() || "0"),
          convertRupiah(struk.total.toString()),
          convertRupiah(struk.cash.toString()),
          convertRupiah(struk.change.toString()),
          struk.payment_method,
          new Date(struk.created_at).toLocaleString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        ],
        rowY,
      );

      rowY += rowHeight + 5;
    });

    // Insert totals row at the bottom
    doc.moveDown(1);
    drawTableRow(
      [
        "TOTAL",
        "",
        convertRupiah(totalBilling.toString()),
        convertRupiah(totalCafe.toString()),
        convertRupiah(totalAmount.toString()),
        "",
        "",
        "",
        "",
      ],
      rowY,
    );

    doc.end();
    return filePath;
  } catch (err) {
    return err;
  }
}
