/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

export interface IKitchenIncoming {
  id: number;
  order_type: string;
  ip: string;
  name_cashier: string;
  no_billiard: string;
  no_meja: string;
  status_kitchen: string;
  status_timer: string;
  start_timer?: Date | null;
  end_timer?: Date | null;
  created_at: Date;
  updated_at: Date;

  order: IOrderCafe[];
  item: IItemOrder[];
}

export interface IOrderCafe {
  id: number;
  id_order_cafe: string;
  menu_cafe: number;
  name: string;
  subtotal: number;
  qty: number;
  total: number;
  cash: number;
  change: number;
  status: string;
  shift: string;
  keterangan?: string | null;
  created_at: Date;
  updated_at: Date;

  kitchenDataId: number;
  kitchenData?: IKitchenIncoming;
}

export interface IItemOrder {
  id: number;
  id_order_cafe_item: string;
  name_menu: string;
  qty: number;
  created_at: Date;
  updated_at: Date;

  kitchenDataId: number;
  kitchenData?: IKitchenIncoming;
}

export interface IRejectIncoming {
  socket: string;
  reason: string;
  order: IKitchenIncoming;
}

export interface IBackupProgress {
  runId: string;
  status:
    | "idle"
    | "started"
    | "collecting"
    | "serializing"
    | "sending"
    | "success"
    | "error";
  step: number;
  totalSteps: number;
  message: string;
  endpoint?: string;
  payloadSizeKb?: number;
  durationMs?: number;
  error?: string;
  at: string;
}

export interface IManualLampWsResponse {
  type?: string;
  request_id?: string;
  command?: string;
  action?: string;
  target?: string;
  floorCode?: string;
  status?: string;
  note?: string;
  data?: {
    command?: string;
    action?: string;
    number?: string;
    target?: string;
    floorCode?: string;
    delivered?: number;
    websocket?: string;
  };
}

contextBridge.exposeInMainWorld("update", {
  checkForUpdates: () => ipcRenderer.send("check-for-updates"),
  downloadUpdate: () => ipcRenderer.send("download-update"),
  quitAndInstall: () => ipcRenderer.send("quit-and-install"),
  onUpdateAvailable: (
    callback: (info: { version: string; releaseNotes: string }) => void,
  ) => {
    const handler = (_: any, info: any) => callback(info);
    ipcRenderer.on("update-available", handler);
    return () => ipcRenderer.removeListener("update-available", handler);
  },
  onUpdateNotAvailable: (callback: () => void) =>
    {
      const handler = () => callback();
      ipcRenderer.on("update-not-available", handler);
      return () => ipcRenderer.removeListener("update-not-available", handler);
    },
  onUpdateDownloaded: (callback: () => void) =>
    {
      const handler = () => callback();
      ipcRenderer.on("update-downloaded", handler);
      return () => ipcRenderer.removeListener("update-downloaded", handler);
    },
  onUpdateError: (callback: (error: Error) => void) =>
    {
      const handler = (_: any, error: any) => callback(error);
      ipcRenderer.on("update-error", handler);
      return () => ipcRenderer.removeListener("update-error", handler);
    },
  onDownloadProgress: (
    callback: (progress: {
      percent: number;
      bytesPerSecond: number;
      transferred: number;
      total: number;
    }) => void,
  ) => {
    const handler = (_: any, progress: any) => callback(progress);
    ipcRenderer.on("download-progress", handler);
    return () => ipcRenderer.removeListener("download-progress", handler);
  },
  get_version: () => ipcRenderer.invoke("get_version"),
});

contextBridge.exposeInMainWorld("api", {
  login: (username: any, password: any) =>
    ipcRenderer.invoke("login", username, password),
  table_list: () => ipcRenderer.invoke("table_list"),
  table_list_only: () => ipcRenderer.invoke("table_list_only"),
  onTableUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on("update_table_list", (_: any, data: any) => callback(data));
  },
  onSendKitchen: (callback: (data: any) => void) => {
    ipcRenderer.on("send_kitchen", (_: any, data: string) => callback(data));
  },
  removeTableUpdateListener: () => {
    ipcRenderer.removeAllListeners("update_table_list");
  },
  onPrintStruk: (callback: (data: any) => void) => {
    ipcRenderer.on("print_struk", (_: any, data: any) => callback(data));
  },
  removePrintStruk: () => {
    ipcRenderer.removeAllListeners("print_struk");
  },
  menu_list: (filter: string) => ipcRenderer.invoke("menu_list", filter),
  add_menu: (data: any) => ipcRenderer.invoke("add_menu", data),
  list_category: () => ipcRenderer.invoke("list_category"),
  add_category: (name: any) => ipcRenderer.invoke("add_category", name),
  update_category: (name: string, id: number) =>
    ipcRenderer.invoke("update_category", name, id),
  delete_category: (id: number) => ipcRenderer.invoke("delete_category", id),
  delete_menu: (id: number) => ipcRenderer.invoke("delete_menu", id),
  update_menu: (id: number, data: any) =>
    ipcRenderer.invoke("update_menu", id, data),
  reject_order: (order_id: string[]) =>
    ipcRenderer.invoke("reject_order", order_id),
  total_booking: () => ipcRenderer.invoke("total_booking"),
  checkout_menu: (
    cash: number,
    data: any[],
    payment_method: string,
    name: string,
    no_meja: string,
    keterangan: string,
  ) =>
    ipcRenderer.invoke(
      "checkout_menu",
      cash,
      data,
      payment_method,
      name,
      no_meja,
      keterangan,
    ),
  get_printer: () => ipcRenderer.invoke("get_printer"),
  get_serialport: () => ipcRenderer.invoke("get_serialport"),
  get_type: (type_member: string) =>
    ipcRenderer.invoke("get_type", type_member),
  list_member: () => ipcRenderer.invoke("list_member"),
  add_member: (data: any) => ipcRenderer.invoke("add_member", data),
  delete_member: (id: number) => ipcRenderer.invoke("delete_member", id),
  update_member: (id: string | null, data: any) =>
    ipcRenderer.invoke("update_member", id, data),
  save_printer: (id: string | null, label_settings: string, content: string) =>
    ipcRenderer.invoke("save_printer", id, label_settings, content),
  save_port: (id: string | null, label_settings: string, content: string) =>
    ipcRenderer.invoke("save_port", id, label_settings, content),
  list_voucher: () => ipcRenderer.invoke("list_voucher"),
  add_voucher: (data: any) => ipcRenderer.invoke("add_voucher", data),
  update_voucher: (data: any, id: number) =>
    ipcRenderer.invoke("update_voucher", data, id),
  delete_voucher: (id: number) => ipcRenderer.invoke("delete_voucher", id),
  get_current_shift: () => ipcRenderer.invoke("get_current_shift"),
  get_price: (type_pricing: string, time: string) =>
    ipcRenderer.invoke("get_price", type_pricing, time),
  get_price_type: () => ipcRenderer.invoke("get_price_type"),
  get_status_machine: () => ipcRenderer.invoke("get_status_machine"),
  send_on: (data: { id_table: string; number: string }) =>
    ipcRenderer.invoke("send_on", data),
  send_off: (data: { id_table: string; number: string }) =>
    ipcRenderer.invoke("send_off", data),
  on_off_all: (status: string) => ipcRenderer.invoke("on_off_all", status),
  get_logging: () => ipcRenderer.invoke("get_logging"),
  booking_regular: (data: unknown) =>
    ipcRenderer.invoke("booking_regular", data),
  list_menu_table: (id_table: string) =>
    ipcRenderer.invoke("list_menu_table", id_table),
  checkout_menu_table: (data: any) =>
    ipcRenderer.invoke("checkout_menu_table", data),
  menu_table_qty: (id_order: number, type_qty: string) =>
    ipcRenderer.invoke("menu_table_qty", id_order, type_qty),
  detail_booking: (id_table: string) =>
    ipcRenderer.invoke("detail_booking", id_table),
  change_name: (data: { id_booking: string; name: string }) =>
    ipcRenderer.invoke("change_name", data),
  payment_booking: (data: unknown) =>
    ipcRenderer.invoke("payment_booking", data),
  test_struk: () => ipcRenderer.invoke("test_struk"),
  network_scan: (port: number) => ipcRenderer.invoke("network_scan", port),
  save_socket: (socket: string) => ipcRenderer.invoke("save_socket", socket),
  my_ip: () => ipcRenderer.invoke("my_ip"),
  save_network: (data: unknown) => ipcRenderer.invoke("save_network", data),
  opsi_network: (ip: string, opsi: "delete" | "check") =>
    ipcRenderer.invoke("opsi_network", ip, opsi),
  list_network: () => ipcRenderer.invoke("list_network"),
  rincian_transaction: (filter: string, shift: string) =>
    ipcRenderer.invoke("rincian_transaction", filter, shift),
  detail_transaction: (id_struk: string) =>
    ipcRenderer.invoke("detail_transaction", id_struk),
  export_report: (
    type_export: string,
    start_date: string,
    end_date: string,
    shift: string,
  ) =>
    ipcRenderer.invoke(
      "export_report",
      type_export,
      start_date,
      end_date,
      shift,
    ),
  summary_report: (filter: string) =>
    ipcRenderer.invoke("summary_report", filter),
  billing_report: (filter: string, shift: string) =>
    ipcRenderer.invoke("billing_report", filter, shift),
  reset_report: (filter: string, shift: string) =>
    ipcRenderer.invoke("reset_report", filter, shift),
  cafe_report: (filter: string, shift: string) =>
    ipcRenderer.invoke("cafe_report", filter, shift),
  cashier_name: (name: string) => ipcRenderer.invoke("cashier_name", name),
  get_cashier_name: () => ipcRenderer.invoke("get_cashier_name"),
  confirm: (title?: string) => ipcRenderer.invoke("confirm", title),
  send_chat: (message: string) => ipcRenderer.invoke("send_chat", message),
  reconnect_box: () => ipcRenderer.invoke("reconnect_box"),
  onNavigate: (callback: () => void) => ipcRenderer.on("navigate", callback),
  get_user: () => ipcRenderer.invoke("get_user"),
  create_user: (data: { name: string; username: string; password: string }) =>
    ipcRenderer.invoke("create_user", data),
  update_user: (data: {
    name: string;
    username: string;
    password: string;
    id_user: number;
  }) => ipcRenderer.invoke("update_user", data),
  delete_user: (id_user: number) => ipcRenderer.invoke("delete_user", id_user),
  get_price_list: () => ipcRenderer.invoke("get_price_list"),
  update_price: (data: {
    id_price: string;
    price: number;
    start_from: string;
    end_from: string;
  }) => ipcRenderer.invoke("update_price", data),
  get_shift: () => ipcRenderer.invoke("get_shift"),
  update_shift: (data: {
    id_shift: number;
    start_hours: Date;
    end_hours: Date;
  }) => ipcRenderer.invoke("update_shift", data),
  reset_table: (id_booking: string, id_table: string) =>
    ipcRenderer.invoke("reset_table", id_booking, id_table),
  print_struk_temp: (data: unknown) =>
    ipcRenderer.invoke("print_struk_temp", data),
  table_list_not_used: () => ipcRenderer.invoke("table_list_not_used"),
  change_table: (
    id_curr_table: string,
    id_to_table: string,
    id_booking: string,
  ) =>
    ipcRenderer.invoke("change_table", id_curr_table, id_to_table, id_booking),
  send_blink: (number: string) => ipcRenderer.invoke("send_blink", number),
  open_url: (url: string) => ipcRenderer.invoke("open_url", url),
  show_message_box: (
    type: "none" | "info" | "error" | "question" | "warning",
    message: string,
  ) => ipcRenderer.invoke("show_message_box", type, message),
  run_migration: (migrationName: string) =>
    ipcRenderer.invoke("run_migration", migrationName),
  migrate_now: () => ipcRenderer.invoke("migrate_now"),
  top_sale_cafe: () => ipcRenderer.invoke("top_sale_cafe"),
  print_struk: (id_struk: string) =>
    ipcRenderer.invoke("print_struk", id_struk),
  onMessage: (callback: (msg: string) => void) =>
    ipcRenderer.on("message", (_: any, msg: string) => callback(msg)),
  removeAllMessageListeners: () => {
    ipcRenderer.removeAllListeners("message");
  },
  top_sale_billiard: () => ipcRenderer.invoke("top_sale_billiard"),
  export_report_cafe: (
    type_export: string,
    start_date: string,
    end_date: string,
    shift: string,
  ) =>
    ipcRenderer.invoke(
      "export_report_cafe",
      type_export,
      start_date,
      end_date,
      shift,
    ),
  middleware: () => ipcRenderer.invoke("middleware"),
  logout: () => ipcRenderer.invoke("logout"),
  save_url: (id: string | null, label_settings: string, content: string) =>
    ipcRenderer.invoke("save_url", id, label_settings, content),
  get_paket: () => ipcRenderer.invoke("get_paket"),
  get_setting: (id: string) => ipcRenderer.invoke("get_setting", id),
  save_paket_segment: (data: any) =>
    ipcRenderer.invoke("save_paket_segment", data),
  update_paket_segment: (data: any) =>
    ipcRenderer.invoke("update_paket_segment", data),
  save_paket: (data: any) => ipcRenderer.invoke("save_paket", data),
  update_paket: (data: any) => ipcRenderer.invoke("update_paket", data),
  delete_paket_segment: (id: string) =>
    ipcRenderer.invoke("delete_paket_segment", id),
  delete_paket: (id: string) => ipcRenderer.invoke("delete_paket", id),
  get_paket_by_id: (id: string) => ipcRenderer.invoke("get_paket_by_id", id),
  rekap_penjualan_cafe: (data: {
    time: {
      periode: "today" | "yesterday" | "monthly" | "annual" | "custom";
      custom?: { start_date: string; end_date: string };
    };
    type_print: "PDF" | "EXCEL";
  }) => ipcRenderer.invoke("rekap_penjualan_cafe", data),
  test_backup_server: (endpoint?: string) =>
    ipcRenderer.invoke("test_backup_server", endpoint),
  backup_now: () => ipcRenderer.invoke("backup_now"),
  backup_auto_status: () => ipcRenderer.invoke("backup_auto_status"),
  backup_auto_stop: () => ipcRenderer.invoke("backup_auto_stop"),
  backup_auto_start: () => ipcRenderer.invoke("backup_auto_start"),
  backup_auto_reload: () => ipcRenderer.invoke("backup_auto_reload"),
  sync_master_now: () => ipcRenderer.invoke("sync_master_now"),
  sync_master_status: () => ipcRenderer.invoke("sync_master_status"),
  sync_master_reload: () => ipcRenderer.invoke("sync_master_reload"),
  test_table_status_wss: (url?: string) =>
    ipcRenderer.invoke("test_table_status_wss", url),
  onManualLampResponse: (cb: (data: IManualLampWsResponse) => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      data: IManualLampWsResponse,
    ) => cb(data);
    ipcRenderer.on("manual-lamp:response", listener);

    return () => {
      ipcRenderer.removeListener("manual-lamp:response", listener);
    };
  },
  onManualLampRequest: (cb: (data: IManualLampWsResponse) => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      data: IManualLampWsResponse,
    ) => cb(data);
    ipcRenderer.on("manual-lamp:request", listener);

    return () => {
      ipcRenderer.removeListener("manual-lamp:request", listener);
    };
  },
  onBackupProgress: (cb: (data: IBackupProgress) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: IBackupProgress) =>
      cb(data);
    ipcRenderer.on("backup:progress", listener);

    return () => {
      ipcRenderer.removeListener("backup:progress", listener);
    };
  },
});

contextBridge.exposeInMainWorld("socket", {
  onStatus: (cb: (connected: boolean) => void) => {
    const handler = (_: IpcRendererEvent, status: boolean) => {
      cb(status);
    };

    ipcRenderer.on("socket:status", handler);

    return () => {
      ipcRenderer.removeListener("socket:status", handler);
    };
  },

  getStatus: () => ipcRenderer.invoke("socket:get-status"),

  onKitchenUpdate: (cb: (data: IKitchenIncoming[]) => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      data: IKitchenIncoming[],
    ) => {
      cb(data);
    };

    ipcRenderer.on("kitchen:update", listener);

    return () => {
      ipcRenderer.removeListener("kitchen:update", listener);
    };
  },
  rendererReady: () => {
    ipcRenderer.send("renderer:ready");
  },
  onKitchenReject: (cb: (data: IRejectIncoming) => void) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      data: IRejectIncoming,
    ) => cb(data);
    ipcRenderer.on("kitchen:reject", listener);

    return () => {
      ipcRenderer.removeListener("kitchen:reject", listener);
    };
  },
});
