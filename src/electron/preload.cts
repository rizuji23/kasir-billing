const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  login: (username: any, password: any) =>
    ipcRenderer.invoke("login", username, password),
  table_list: () => ipcRenderer.invoke("table_list"),
  table_list_only: () => ipcRenderer.invoke("table_list_only"),
  onTableUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on("update_table_list", (_: any, data: any) => callback(data));
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
  checkout_menu: (cash: number, data: any[], payment_method: string) =>
    ipcRenderer.invoke("checkout_menu", cash, data, payment_method),
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
});
