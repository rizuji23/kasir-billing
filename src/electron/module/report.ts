import { ipcMain } from "electron";
import Responses from "../lib/responses.js";
import { prisma } from "../database.js";
import { strukFilter } from "../lib/utils.js";
import {
  generateExcelReport,
  generateExcelReportCafe,
  generatePDFReport,
  generatePDFReportCafe,
} from "./report/generate-report.js";

export interface SalesItem {
  menuName: string;
  totalSold: number;
}

export interface SalesByCategory {
  [category: string]: SalesItem[];
}

export default function ReportModule() {
  ipcMain.handle(
    "rincian_transaction",
    async (
      _,
      filter: { period: string; start_date?: string; end_date?: string },
      shift: string,
    ) => {
      try {
        const struk_filter = await strukFilter(filter, shift);

        const struk = await prisma.struk.findMany({
          where: { ...struk_filter.where, status: "PAID" },
          orderBy: {
            updated_at: "desc",
          },
        });

        const total_all = struk.reduce((sum, item) => sum + item.total, 0);
        const total_booking = struk.reduce(
          (sum, item) => sum + (item.total_billing || 0),
          0,
        );
        const total_cafe = struk.reduce(
          (sum, item) => sum + (item.total_cafe || 0),
          0,
        );

        return Responses({
          code: 200,
          detail_message: "Success",
          data: {
            struk,
            total_all,
            total_booking,
            total_cafe,
            period: struk_filter.period,
          },
        });
      } catch (err) {
        if (err instanceof Error) {
          return Responses({
            code: 500,
            detail_message: `Terjadi Kesalahan: ${err.message}`,
          });
        }
        return Responses({ code: 500, detail_message: "Terjadi Kesalahan" });
      }
    },
  );

  ipcMain.handle("detail_transaction", async (_, id_struk: string) => {
    try {
      const struk = await prisma.struk.findFirst({
        where: {
          id_struk: id_struk,
        },
        include: {
          orderId: {
            include: {
              menucafe: true,
            },
          },
          bookingId: {
            include: {
              detail_booking: {
                include: {
                  paket: true,
                },
              },
              table: true,
              order_cafe: {
                include: {
                  menucafe: true,
                },
              },
              paket: true,
            },
          },
        },
      });

      if (!struk) {
        return Responses({
          code: 404,
          detail_message: "Struk tidak ditemukan",
        });
      }

      return Responses({
        code: 200,
        data: struk,
      });
    } catch (err) {
      console.error("Error fetching struk:", err);
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Terjadi Kesalahan: ${err.message}`,
        });
      }
      return Responses({ code: 500, detail_message: "Terjadi Kesalahan" });
    }
  });

  ipcMain.handle(
    "export_report",
    async (
      _,
      type_export: string,
      start_date: string,
      end_date: string,
      shift: string,
    ) => {
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

        const check_data = await prisma.struk.findMany({
          where: {
            updated_at: {
              gte: startDateTime.toISOString(),
              lte: endDateTime.toISOString(),
            },
          },
        });

        if (check_data.length === 0) {
          return Responses({
            code: 404,
            detail_message: "Struk tidak ditemukan",
          });
        }

        if (type_export === "excel") {
          await generateExcelReport(start_date, end_date);
        } else if (type_export === "pdf") {
          await generatePDFReport(start_date, end_date, shift);
        }

        return Responses({
          code: 201,
          detail_message: "Export berhasil dilakukan",
        });
      } catch (err) {
        if (err instanceof Error) {
          return Responses({
            code: 500,
            detail_message: `Terjadi Kesalahan: ${err.message}`,
          });
        }
        return Responses({ code: 500, detail_message: "Terjadi Kesalahan" });
      }
    },
  );

  ipcMain.handle(
    "export_report_cafe",
    async (
      _,
      type_export: string,
      start_date: string,
      end_date: string,
      shift: string,
    ) => {
      try {
        const startDateTime = new Date(`${start_date}T00:00:00Z`);
        const endDateTime = new Date(`${end_date}T23:59:59.999Z`);

        endDateTime.setUTCDate(endDateTime.getUTCDate() + 1);
        endDateTime.setUTCHours(5, 0, 0, 0);

        console.log("startDateTime", startDateTime.toISOString());
        console.log("endDateTime", endDateTime.toISOString());

        const check_data = await prisma.orderCafe.findMany({
          where: {
            updated_at: {
              gte: startDateTime.toISOString(),
              lte: endDateTime.toISOString(),
            },
          },
        });

        if (check_data.length === 0) {
          return Responses({
            code: 404,
            detail_message: "Order Cafe tidak ditemukan",
          });
        }

        if (type_export === "excel") {
          await generateExcelReportCafe(start_date, end_date);
        } else if (type_export === "pdf") {
          await generatePDFReportCafe(start_date, end_date, shift);
        }

        return Responses({
          code: 201,
          detail_message: "Export berhasil dilakukan",
        });
      } catch (err) {
        if (err instanceof Error) {
          return Responses({
            code: 500,
            detail_message: `Terjadi Kesalahan: ${err.message}`,
          });
        }
        return Responses({ code: 500, detail_message: "Terjadi Kesalahan" });
      }
    },
  );

  ipcMain.handle(
    "summary_report",
    async (
      _,
      filter: { period: string; start_date?: string; end_date?: string },
    ) => {
      try {
        const struk_filter = await strukFilter(filter, "all");

        const totalSummary = await prisma.struk.aggregate({
          where: struk_filter.where,
          _sum: {
            total: true,
            total_billing: true,
            total_cafe: true,
          },
        });

        const pagiSummary = await prisma.struk.aggregate({
          where: { ...struk_filter.where, shift: "Pagi" },
          _sum: {
            total: true,
          },
        });

        const malamSummary = await prisma.struk.aggregate({
          where: { ...struk_filter.where, shift: "Malam" },
          _sum: {
            total: true,
          },
        });

        const summary = {
          total: totalSummary._sum.total || 0,
          total_billing: totalSummary._sum.total_billing || 0,
          total_cafe: totalSummary._sum.total_cafe || 0,
          total_pagi: pagiSummary._sum.total || 0,
          total_malam: malamSummary._sum.total || 0,
          period: struk_filter.period,
        };

        return Responses({
          code: 200,
          detail_message: "Success",
          data: summary,
        });
      } catch (err) {
        if (err instanceof Error) {
          return Responses({
            code: 500,
            detail_message: `Terjadi Kesalahan: ${err.message}`,
          });
        }
        return Responses({ code: 500, detail_message: "Terjadi Kesalahan" });
      }
    },
  );

  ipcMain.handle(
    "billing_report",
    async (
      _,
      filter: { period: string; start_date?: string; end_date?: string },
      shift: string,
    ) => {
      try {
        const struk_filter = await strukFilter(filter, shift);

        const booking = await prisma.booking.findMany({
          where: { ...struk_filter.where, status: "PAID" },
          include: {
            table: true,
          },
        });

        const total_all = booking.reduce(
          (sum, item) => sum + item.total_price,
          0,
        );

        const total_duration = booking.reduce(
          (sum, item) => sum + item.duration,
          0,
        );

        return Responses({
          code: 200,
          detail_message: "Success",
          data: {
            booking,
            total_all,
            period: struk_filter.period,
            total_duration,
          },
        });
      } catch (err) {
        if (err instanceof Error) {
          return Responses({
            code: 500,
            detail_message: `Terjadi Kesalahan: ${err.message}`,
          });
        }
        return Responses({ code: 500, detail_message: "Terjadi Kesalahan" });
      }
    },
  );

  ipcMain.handle(
    "reset_report",
    async (
      _,
      filter: { period: string; start_date?: string; end_date?: string },
      shift: string,
    ) => {
      try {
        const struk_filter = await strukFilter(filter, shift);

        const booking = await prisma.booking.findMany({
          where: { ...struk_filter.where, status: "RESET" },
          include: {
            table: true,
          },
          orderBy: {
            id: "desc",
          },
        });

        const total_all = booking.reduce(
          (sum, item) => sum + item.total_price,
          0,
        );

        const total_duration = booking.reduce(
          (sum, item) => sum + item.duration,
          0,
        );

        return Responses({
          code: 200,
          detail_message: "Success",
          data: {
            booking,
            total_all,
            period: struk_filter.period,
            total_duration,
          },
        });
      } catch (err) {
        if (err instanceof Error) {
          return Responses({
            code: 500,
            detail_message: `Terjadi Kesalahan: ${err.message}`,
          });
        }
        return Responses({ code: 500, detail_message: "Terjadi Kesalahan" });
      }
    },
  );

  ipcMain.handle(
    "cafe_report",
    async (
      _,
      filter: { period: string; start_date?: string; end_date?: string },
      shift: string,
    ) => {
      try {
        const struk_filter = await strukFilter(filter, shift);

        const order_cafe = await prisma.orderCafe.findMany({
          where: { ...struk_filter.where, status: "PAID" },
          include: {
            menucafe: true,
          },
          orderBy: {
            updated_at: "desc",
          },
        });

        const total_all = order_cafe.reduce(
          (sum, item) => sum + item.subtotal,
          0,
        );

        return Responses({
          code: 200,
          detail_message: "Success",
          data: {
            order_cafe,
            total_all,
            period: struk_filter.period,
          },
        });
      } catch (err) {
        if (err instanceof Error) {
          return Responses({
            code: 500,
            detail_message: `Terjadi Kesalahan: ${err.message}`,
          });
        }
        return Responses({ code: 500, detail_message: "Terjadi Kesalahan" });
      }
    },
  );

  ipcMain.handle("top_sale_cafe", async () => {
    try {
      const sales = await prisma.orderCafe.groupBy({
        by: ["menu_cafe"],
        where: { status: "PAID" }, // Filter only PAID orders
        _sum: { qty: true }, // Sum total quantity sold
        orderBy: { _sum: { qty: "desc" } }, // Order by highest quantity sold
        take: 5, // Limit to top 5
      });

      const result = await Promise.all(
        sales.map(async (item) => {
          const menu = await prisma.menuCafe.findUnique({
            where: { id: item.menu_cafe },
            include: { category_menu: true },
          });

          return {
            category: menu?.category_menu?.name || "Uncategorized",
            menuName: menu?.name || "Unknown",
            totalSold: item._sum.qty || 0,
          };
        }),
      );

      // Group results by category
      const groupedResults = result.reduce(
        (acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = [];
          }
          acc[item.category].push(item);
          return acc;
        },
        {} as Record<string, { menuName: string; totalSold: number }[]>,
      );

      return Responses({
        code: 200,
        detail_message: "Success",
        data: groupedResults,
      });
    } catch (err) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Terjadi Kesalahan: ${err.message}`,
        });
      }
      return Responses({ code: 500, detail_message: "Terjadi Kesalahan" });
    }
  });

  ipcMain.handle("top_sale_billiard", async () => {
    try {
      // Fetch all tables first
      const tables = await prisma.tableBilliard.findMany({
        select: { id: true, name: true },
      });

      // Fetch total revenue per table from bookings
      const bookings = await prisma.booking.groupBy({
        by: ["tableId"],
        _sum: { total_price: true },
        where: {
          status: "PAID",
        },
      });

      // Create a lookup for booking revenue
      const revenueMap = new Map(
        bookings.map((b) => [b.tableId, b._sum.total_price || 0]),
      );

      // Format the final response by merging tables with their revenue
      const tableResult = tables
        .map((table) => ({
          tableName: table.name,
          totalRevenue: revenueMap.get(table.id) || 0, // If no bookings, show 0
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue); // Sort by highest revenue

      return Responses({
        code: 200,
        detail_message: "Success",
        data: tableResult,
      });
    } catch (err) {
      if (err instanceof Error) {
        return Responses({
          code: 500,
          detail_message: `Terjadi Kesalahan: ${err.message}`,
        });
      }
      return Responses({ code: 500, detail_message: "Terjadi Kesalahan" });
    }
  });
}
