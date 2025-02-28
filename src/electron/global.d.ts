import { PriceBilling, TableBilliard } from "@prisma/client";
import { IResponses } from "./lib/responses";
import {
  Booking,
  CategoryMenu,
  ILogs,
  IMachine,
  IMenu,
  IPriceType,
  ITableBilliard,
  IVoucher,
} from "./types/index.js";
import { IBookingCheckout } from "./module/booking.ts";

declare global {
  interface Window {
    api: {
      login: (
        username: string,
        password: string,
      ) => Promise<IResponses<string>>;
      table_list: () => Promise<IResponses<ITableBilliard[]>>;
      table_list_only: () => Promise<IResponses<ITableBilliard[]>>;
      onTableUpdate: (callback: (data: TableBilliard[]) => void) => void;
      removeTableUpdateListener: () => void;
      menu_list: (filter: string) => Promise<IResponses<IMenu[]>>;
      add_menu: (data: IMenu) => Promise<IResponses<IMenu>>;
      list_category: () => Promise<IResponses<CategoryMenu[]>>;
      add_category: (name: string) => Promise<IResponses<CategoryMenu>>;
      update_category: (
        name: string,
        id: number,
      ) => Promise<IResponses<CategoryMenu>>;
      delete_category: (id: number) => Promise<IResponses<CategoryMenu>>;
      delete_menu: (id: number) => Promise<IResponses<IMenu>>;
      update_menu: (id: number, data: unknown) => Promise<IResponses<IMenu>>;
      total_booking: () => Promise<
        IResponses<{ total_all: number; total_used: number }>
      >;
      checkout_menu: (
        cash: number,
        data: ICart[],
      ) => Promise<IResponses<{ cash: number; data: ICart[] }>>;
      get_printer: () => Promise<IResponses<unknown>>;
      get_serialport: () => Promise<IResponses<unknown>>;
      list_member: () => Promise<IResponses<Array[]>>;
      add_member: (data: unknown) => Promise<IResponses<unknown[]>>;
      delete_member: (id: number) => Promise<IResponses<unknown[]>>;
      update_member: (
        id: string | null,
        data: unknown,
      ) => Promise<IResponses<unknown[]>>;
      get_type: (type_member: string) => Promise<IResponses<unknown>>;
      save_printer: (
        id: string | null,
        label_settings: string,
        content: string,
      ) => Promise<IResponses<unknown>>;
      save_port: (
        id: string | null,
        label_settings: string,
        content: string,
      ) => Promise<IResponses<unknown>>;
      list_voucher: () => Promise<IResponses<IVoucher[]>>;
      add_voucher: (data: unknown) => Promise<IResponses<IVoucher>>;
      update_voucher: (
        data: unknown,
        id: number,
      ) => Promise<IResponses<IVoucher>>;
      delete_voucher: (id: number) => Promise<IResponses<IVoucher>>;
      get_current_shift: () => Promise<IResponses<string>>;
      get_price: (
        type_pricing: string,
        time: string,
      ) => Promise<IResponses<PriceBilling>>;
      get_price_type: () => Promise<IResponses<IPriceType[]>>;
      get_status_machine: () => Promise<IResponses<IMachine | undefined>>;
      send_on: (data: {
        id_table: string;
        number: string;
      }) => Promise<IResponses<ITableBilliard>>;
      send_off: (data: {
        id_table: string;
        number: string;
      }) => Promise<IResponses<ITableBilliard>>;
      on_off_all: (status: string) => Promise<IResponses<ITableBilliard>>;
      get_logging: () => Promise<IResponses<ILogs[]>>;
      booking_regular: (data: IBookingCheckout) => Promise<IResponses<unknown>>;
      list_menu_table: (id_table: string) => Promise<IResponses<unknown>>;
      checkout_menu_table: (data: unknown) => Promise<IResponses<unknown>>;
      menu_table_qty: (
        id_order: number,
        type_qty: string,
      ) => Promise<IResponses<unknown>>;
      detail_booking: (id_table: string) => Promise<
        IResponses<{
          table: ITableBilliard;
          booking: Booking;
        }>
      >;
      change_name: (data: {
        id_booking: string;
        name: string;
      }) => Promise<IResponses<Booking>>;
    };
  }
}
