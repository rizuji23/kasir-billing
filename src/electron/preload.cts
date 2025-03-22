const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("update", {
  checkForUpdates: () => ipcRenderer.send("check-for-updates"),
  downloadUpdate: () => ipcRenderer.send("download-update"),
  quitAndInstall: () => ipcRenderer.send("quit-and-install"),
  onUpdateAvailable: (
    callback: (info: { version: string; releaseNotes: string }) => void,
  ) =>
    ipcRenderer.on("update-available", (_: any, info: any) => callback(info)),
  onUpdateNotAvailable: (callback: () => void) =>
    ipcRenderer.on("update-not-available", () => callback()),
  onUpdateDownloaded: (callback: () => void) =>
    ipcRenderer.on("update-downloaded", () => callback()),
  onUpdateError: (callback: (error: Error) => void) =>
    ipcRenderer.on("update-error", (_: any, error: any) => callback(error)),
  onDownloadProgress: (
    callback: (progress: {
      percent: number;
      bytesPerSecond: number;
      transferred: number;
      total: number;
    }) => void,
  ) =>
    ipcRenderer.on("download-progress", (_: any, progress: any) =>
      callback(progress),
    ),
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
  total_booking: () => ipcRenderer.invoke("total_booking"),
  checkout_menu: (
    cash: number,
    data: any[],
    payment_method: string,
    name: string,
    no_meja: string,
  ) =>
    ipcRenderer.invoke(
      "checkout_menu",
      cash,
      data,
      payment_method,
      name,
      no_meja,
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
  checkout_menu_table: (data: unknown) =>
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
  cafe_report: (filter: string, shift: string) =>
    ipcRenderer.invoke("cafe_report", filter, shift),
  cashier_name: (name: string) => ipcRenderer.invoke("cashier_name", name),
  get_cashier_name: () => ipcRenderer.invoke("get_cashier_name"),
  confirm: (title?: string) => ipcRenderer.invoke("confirm", title),
  send_chat: (message: string) => ipcRenderer.invoke("send_chat", message),
  reconnect_box: () => ipcRenderer.invoke("reconnect_box"),
  onNavigate: (callback: void) => ipcRenderer.on("navigate", callback),
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
});
