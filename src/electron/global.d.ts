import { IResponses } from "./lib/responses";
import {
  Booking,
  CategoryMenu,
  ILogs,
  IMachine,
  IMenu,
  IPaymentData,
  IPriceType,
  ITableBilliard,
  IVoucher,
  OrderCafe,
  PaketSegment,
  PriceBilling,
  ServersList,
  Settings,
  Shift,
  Struk,
  TableBilliard,
  TableRevenue,
  User,
  UserData,
} from "./types/index.js";
import { IBookingCheckout } from "./module/booking.ts";
import { IpcRendererEvent } from "electron";
import { SalesByCategory } from "./module/report.ts";

interface UpdateAPI {
  checkForUpdates: () => void;
  downloadUpdate: () => void;
  quitAndInstall: () => void;
  onUpdateAvailable: (
    callback: (info: { version: string; releaseNotes: string }) => void,
  ) => void;
  onUpdateNotAvailable: (callback: () => void) => void;
  onUpdateDownloaded: (callback: () => void) => void;
  onUpdateError: (callback: (error: Error) => void) => void;
  onDownloadProgress: (
    callback: (progress: {
      percent: number;
      bytesPerSecond: number;
      transferred: number;
      total: number;
    }) => void,
  ) => void;
  get_version: () => string;
}

interface ApiAPI {
  login: (username: string, password: string) => Promise<IResponses<string>>;
  table_list: () => Promise<IResponses<ITableBilliard[]>>;
  table_list_only: () => Promise<IResponses<ITableBilliard[]>>;
  onTableUpdate: (callback: (data: TableBilliard[]) => void) => void;
  onSendKitchen: (callback: (data: string) => void) => void;
  removeTableUpdateListener: () => void;
  onNavigate: (
    callback: (event: IpcRendererEvent, path: string) => void,
  ) => void;
  onPrintStruk: (callback: (data: Struk) => void) => void;
  removePrintStruk: () => void;
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
    payment_method: string,
    name: string,
    no_meja: string,
    keterangan: string,
  ) => Promise<IResponses<Struk>>;
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
  update_voucher: (data: unknown, id: number) => Promise<IResponses<IVoucher>>;
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
  payment_booking: (
    data: IPaymentData,
  ) => Promise<IResponses<{ id_struk: string }>>;
  test_struk: () => Promise<void>;
  network_scan: (port: number) => Promise<{ ip: string; hostname: string }[]>;
  my_ip: () => Promise<string | null>;
  save_network: (data: {
    ip: string;
    hostname: string;
    number: string;
    type_server: TypeServer;
  }) => Promise<IResponses<unknown>>;
  opsi_network: (
    ip: string,
    opsi: "delete" | "check",
  ) => Promise<IResponses<unknown>>;
  list_network: () => Promise<
    IResponses<{
      cashier: ServersList[];
      kitchen: ServersList[];
    }>
  >;
  rincian_transaction: (
    filter: {
      period: string;
      start_date?: string;
      end_date?: string;
    },
    shift: string | null,
  ) => Promise<
    IResponses<{
      struk: Struk[];
      total_all: number;
      total_booking: number;
      total_cafe: number;
      period: string;
    }>
  >;
  detail_transaction: (id_struk: string) => Promise<IResponses<Struk>>;
  export_report: (
    type_export: string,
    start_date: string,
    end_date: string,
    shift: string,
  ) => Promise<IResponses<unknown>>;
  summary_report: (filter: {
    period: string;
    start_date?: string;
    end_date?: string;
  }) => Promise<
    IResponses<{
      total: number;
      total_billing: number;
      total_cafe: number;
      total_pagi: number;
      total_malam: number;
      period: string;
    }>
  >;
  billing_report: (
    filter: {
      period: string;
      start_date?: string;
      end_date?: string;
    },
    shift: string | null,
  ) => Promise<
    IResponses<{
      booking: Booking[];
      total_all: number;
      period: string;
      total_duration: number;
    }>
  >;
  cafe_report: (
    filter: {
      period: string;
      start_date?: string;
      end_date?: string;
    },
    shift: string | null,
  ) => Promise<
    IResponses<{
      order_cafe: OrderCafe[];
      total_all: number;
      period: string;
    }>
  >;
  cashier_name: (name: string) => Promise<IResponses<unknown>>;
  get_cashier_name: () => Promise<IResponses<Settings | null>>;
  confirm: (title?: string) => Promise<boolean>;
  send_chat: (message: string) => Promise<IResponses<unknown>>;
  reconnect_box: () => Promise<IResponses<{ status: "SUCCESS" | "FAILED" }>>;
  get_user: () => Promise<IResponses<User[]>>;
  create_user: (data: {
    name: string;
    username: string;
    password: string;
  }) => Promise<IResponses<unknown>>;
  update_user: (data: {
    name: string;
    username: string;
    password: string;
    id_user: number;
  }) => Promise<IResponses<unknown>>;
  delete_user: (id_user: number) => Promise<IResponses<unknown>>;
  get_price_list: () => Promise<IResponses<PriceBilling[]>>;
  update_price: (data: {
    id_price: string;
    price: number;
    start_from: string;
    end_from: string;
  }) => Promise<IResponses<unknown>>;
  get_shift: () => Promise<IResponses<Shift[]>>;
  update_shift: (data: {
    id_shift: number;
    start_hours: Date;
    end_hours: Date;
  }) => Promise<IResponses<unknown>>;
  reset_table: (
    id_booking: string,
    id_table: string,
  ) => Promise<IResponses<unknown>>;
  print_struk_temp: (data: IPaymentData) => Promise<IResponses<unknown>>;
  table_list_not_used: () => Promise<IResponses<ITableBilliard[]>>;
  change_table: (
    id_curr_table: string,
    id_to_table: string,
    id_booking: string,
  ) => Promise<IResponses<unknown>>;
  send_blink: (number: string) => Promise<IResponses<unknown>>;
  open_url: (url: string) => Promise<void>;
  show_message_box: (
    type: "none" | "info" | "error" | "question" | "warning",
    message: string,
  ) => void;
  run_migration: (migrationName: string) => Promise<string>;
  top_sale_cafe: () => Promise<IResponses<SalesByCategory>>;
  print_struk: (id_struk: string) => Promise<IResponses<unknown>>;
  onMessage: (callback: (msg: string) => void) => void;
  removeAllMessageListeners: () => void;
  top_sale_billiard: () => Promise<IResponses<TableRevenue[]>>;
  export_report_cafe: (
    type_export: string,
    start_date: string,
    end_date: string,
    shift: string,
  ) => Promise<IResponses<unknown>>;
  middleware: () => Promise<IResponses<UserData>>;
  save_url: (
    id: string,
    label_settings: string,
    content: string,
  ) => Promise<IResponses<unknown>>;
  logout: () => Promise<IResponses<null>>;
  get_paket: () => Promise<IResponses<PaketSegment[]>>;
  get_paket_by_id: (
    id: string,
  ) => Promise<IResponses<PaketSegment | null | undefined>>;
  save_paket_segment: (data: {
    name: string;
    start_hours: string;
    end_hours: string;
  }) => Promise<IResponses<unknown>>;
  update_paket_segment: (data: {
    id_paket_segment: string;
    name: string;
    start_hours: string;
    end_hours: string;
  }) => Promise<IResponses<unknown>>;
  save_paket: (data: {
    id_paket_segment: string;
    name: string;
    duration: number;
    price: number;
    is_last_call?: boolean;
    last_call_hours?: string;
  }) => Promise<IResponses<unknown>>;
  update_paket: (data: {
    id_paket: string;
    id_paket_segment: string;
    name: string;
    duration: number;
    price: number;
    is_last_call?: boolean;
    last_call_hours?: string;
  }) => Promise<IResponses<unknown>>;
  delete_paket_segment: (id: string) => Promise<IResponses<unknown>>;
  delete_paket: (id: string) => Promise<IResponses<unknown>>;
}

declare global {
  interface Window {
    update: UpdateAPI;
    api: ApiAPI;
  }
}
