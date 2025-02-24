import { PriceBilling } from "@prisma/client";
import { IResponses } from "./lib/responses";
import {
  CategoryMenu,
  IMenu,
  IPriceType,
  ITableBilliard,
  IVoucher,
} from "./types/index.js";

declare global {
  interface Window {
    api: {
      login: (
        username: string,
        password: string,
      ) => Promise<IResponses<string>>;
      table_list: () => Promise<IResponses<ITableBilliard[]>>;
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
    };
  }
}
