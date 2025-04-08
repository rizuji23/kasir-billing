import { prisma } from "../../database.js";
import ExcelJS from "exceljs";
import { dialog } from "electron";
import fs from "fs";
import PDFDocument from "pdfkit";
import { convertRupiah } from "../../lib/utils.js";

export async function generateExcelReportCafe(
  start_date: string,
  end_date: string,
) {
  try {
    const startDateTime = new Date(`${start_date}T00:00:00Z`);
    const endDateTime = new Date(`${end_date}T23:59:59.999Z`);

    endDateTime.setUTCDate(endDateTime.getUTCDate() + 1);
    endDateTime.setUTCHours(5, 0, 0, 0);

    const orderData = await prisma.orderCafe.findMany({
      where: {
        updated_at: {
          gte: startDateTime.toISOString(),
          lte: endDateTime.toISOString(),
        },
        status: "PAID",
      },
      orderBy: {
        updated_at: "desc",
      },
      include: {
        menucafe: true,
      },
    });

    const workbook = new ExcelJS.Workbook();

    const addWorksheet = (name: string, data: typeof orderData) => {
      const worksheet = workbook.addWorksheet(name);
      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "Nama Menu", key: "name", width: 50 },
        { header: "Harga", key: "price", width: 20 },
        { header: "Qty", key: "qty", width: 5 },
        { header: "Total", key: "total_price", width: 20 },
        { header: "Tanggal", key: "tanggal", width: 20 },
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { horizontal: "center", vertical: "middle" };

      data.forEach((order, i) => {
        const row = worksheet.addRow({
          no: i + 1,
          name: order.menucafe.name,
          price: order.menucafe.price,
          qty: order.qty,
          total_price: order.subtotal,
          tanggal: new Date(order.updated_at).toLocaleString("id-ID", {
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

      const total_all = data.reduce((sum, order) => sum + order.subtotal, 0);
      const total_qty = data.reduce((sum, order) => sum + order.qty, 0);

      const totalRow = worksheet.addRow({
        no: "",
        name: "",
        price: "Total",
        qty: total_qty,
        total_price: total_all,
        tanggal: "",
      });

      worksheet.addRow([]);

      totalRow.font = { bold: true };
      totalRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF00" },
        };
      });
    };

    addWorksheet("Semua Transaksi", orderData);
    addWorksheet(
      "Pagi",
      orderData.filter((order) => order.shift === "Pagi"),
    );
    addWorksheet(
      "Malam",
      orderData.filter((order) => order.shift === "Malam"),
    );

    const { filePath } = await dialog.showSaveDialog({
      title: "Save Excel File",
      defaultPath: `Laporan Cafe ${start_date} - ${end_date}.xlsx`,
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

export async function generateExcelReport(
  start_date: string,
  end_date: string,
) {
  try {
    const timezoneOffset = new Date().getTimezoneOffset() * 60000; // Convert to milliseconds

    const startDateTime = new Date(`${start_date}T00:00:00`);
    const endDateTime = new Date(`${end_date}T23:59:59.999`);

    endDateTime.setDate(endDateTime.getDate() + 1);
    endDateTime.setHours(5, 0, 0, 0);

    // Convert to local time by subtracting timezone offset
    const localStart = new Date(startDateTime.getTime() - timezoneOffset);
    const localEnd = new Date(endDateTime.getTime() - timezoneOffset);

    console.log("Start Time (Local):", localStart);
    console.log("End Time (Local):", localEnd);

    const strukData = await prisma.struk.findMany({
      where: {
        updated_at: {
          gte: startDateTime.toISOString(),
          lte: endDateTime.toISOString(),
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
        { header: "Subtotal Billing", key: "subtotal_billing", width: 15 },
        { header: "Subtotal Cafe", key: "subtotal_cafe", width: 15 },
        { header: "Diskon Billing", key: "discount_billing", width: 9 },
        { header: "Diskon Cafe", key: "discount_cafe", width: 9 },
        { header: "Total Billing", key: "total_billing", width: 15 },
        { header: "Total Cafe", key: "total_cafe", width: 15 },
        { header: "Subtotal", key: "subtotal", width: 15 },
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
          subtotal_billing: struk.subtotal_billing || "0",
          subtotal_cafe: struk.subtotal_cafe || "0",
          discount_billing: struk.discount_billing || "0",
          discount_cafe: struk.discount_cafe || "0",
          total_billing: struk.total_billing,
          total_cafe: struk.total_cafe,
          subtotal: struk.subtotal,
          total: struk.total,
          cash: struk.cash,
          change: struk.change,
          payment_method: struk.payment_method,
          tanggal: new Date(struk.updated_at).toLocaleString("id-ID", {
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

      const subtotal_cafe = data.reduce(
        (sum, struk) => sum + (struk.subtotal_cafe || 0),
        0,
      );
      const subtotal_billing = data.reduce(
        (sum, struk) => sum + (struk.subtotal_billing || 0),
        0,
      );

      const subtotal = data.reduce(
        (sum, struk) => sum + (struk.subtotal || 0),
        0,
      );

      // Insert TOTAL row
      const totalRow = worksheet.addRow({
        no: "",
        id_struk: "TOTAL",
        name: "",
        subtotal_billing: subtotal_billing,
        subtotal_cafe: subtotal_cafe,
        discount_billing: "",
        discount_cafe: "",
        total_billing: total_billing,
        total_cafe: total_cafe,
        subtotal: subtotal,
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

    endDateTime.setUTCDate(endDateTime.getUTCDate() + 1);
    endDateTime.setUTCHours(5, 0, 0, 0);

    let whereClause: {
      updated_at: {
        gte: Date | string;
        lte: Date | string;
      };
      shift?: string;
    } = {
      updated_at: {
        gte: startDateTime.toISOString(),
        lte: endDateTime.toISOString(),
      },
    };

    if (shift && shift !== "all") {
      whereClause = {
        updated_at: {
          gte: startDateTime.toISOString(),
          lte: endDateTime.toISOString(),
        },
        shift: shift,
      };
    }

    const strukData = await prisma.struk.findMany({
      where: whereClause,
      orderBy: {
        updated_at: "desc",
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
          new Date(struk.updated_at).toLocaleString("id-ID", {
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

export async function generatePDFReportCafe(
  start_date: string,
  end_date: string,
  shift: string = "all",
) {
  try {
    const startDateTime = new Date(`${start_date}T00:00:00Z`);
    const endDateTime = new Date(`${end_date}T23:59:59.999Z`);

    endDateTime.setUTCDate(endDateTime.getUTCDate() + 1);
    endDateTime.setUTCHours(5, 0, 0, 0);

    const whereClause: {
      updated_at: {
        gte: Date | string;
        lte: Date | string;
      };
      shift?: string;
    } = {
      updated_at: {
        gte: startDateTime.toISOString(),
        lte: endDateTime.toISOString(),
      },
    };

    if (shift && shift !== "all") {
      whereClause["shift"] = shift;
    }

    const orderData = await prisma.orderCafe.findMany({
      where: {
        ...whereClause,
        status: "PAID",
      },
      orderBy: {
        updated_at: "desc",
      },
      include: {
        menucafe: true,
      },
    });

    const { filePath } = await dialog.showSaveDialog({
      title: "Save PDF File",
      defaultPath: `Laporan Cafe ${start_date} - ${end_date} ${
        shift === "all" ? "Semua" : shift
      }.pdf`,
      filters: [{ name: "PDF Files", extensions: ["pdf"] }],
    });

    if (!filePath) return null;

    const doc = new PDFDocument({
      size: "A4",
      layout: "portrait",
      margin: 30,
    });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(
        `Laporan Cafe ${
          shift === "all" ? "Semua" : shift === "Pagi" ? "Pagi" : "Malam"
        }`,
        {
          align: "center",
        },
      );
    doc.font("Helvetica").fontSize(12).text(`${start_date} - ${end_date}`, {
      align: "center",
    });
    doc.moveDown(2);

    const tableStartX = 30;
    const colWidths = [30, 100, 60, 60, 80, 100];
    const rowHeight = 18;

    const drawTableHeader = (y: number) => {
      let x = tableStartX;
      doc.font("Helvetica-Bold").fontSize(9);
      ["No", "Nama Menu", "Harga", "Qty", "Total", "Tanggal"].forEach(
        (header, i) => {
          doc.text(header, x, y, { width: colWidths[i], align: "center" });
          x += colWidths[i];
        },
      );
      doc
        .moveTo(tableStartX, y + rowHeight)
        .lineTo(550, y + rowHeight)
        .stroke();
    };

    const drawTableRow = (data: string[], y: number) => {
      let x = tableStartX;
      doc.font("Helvetica").fontSize(8);
      data.forEach((text, i) => {
        doc.text(text, x, y, { width: colWidths[i], align: "center" });
        x += colWidths[i];
      });
      doc
        .moveTo(tableStartX, y + rowHeight)
        .lineTo(550, y + rowHeight)
        .stroke();
    };

    let rowY = doc.y;
    drawTableHeader(rowY);
    rowY += rowHeight + 5;

    const total_all = orderData.reduce((sum, order) => sum + order.subtotal, 0);
    const total_qty = orderData.reduce((sum, order) => sum + order.qty, 0);

    orderData.forEach((order, index) => {
      if (rowY > 750) {
        doc.addPage();
        rowY = doc.y;
        drawTableHeader(rowY);
        rowY += rowHeight + 5;
      }

      drawTableRow(
        [
          (index + 1).toString(),
          order.menucafe.name,
          convertRupiah(order.menucafe.price.toString() || "0"),
          order.qty.toString(),
          convertRupiah(order.subtotal.toString()),
          new Date(order.updated_at).toLocaleString("id-ID", {
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

    doc.moveDown(1);
    drawTableRow(
      [
        "TOTAL",
        "",
        "",
        convertRupiah(total_qty.toString()),
        convertRupiah(total_all.toString()),
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
