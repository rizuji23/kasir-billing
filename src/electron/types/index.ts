// ======== ENUMS ========
export enum TableStatus {
  ACTIVE = "ACTIVE",
  USED = "USED",
  AVAILABLE = "AVAILABLE",
}

export enum TypeMember {
  PREMIUM = "PREMIUM",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
}

export enum StatusMember {
  ACTIVE = "ACTIVE",
  NOTACTIVE = "NOTACTIVE",
}

export enum TypeBooking {
  REGULAR = "REGULAR",
  LOSS = "LOSS",
}

export enum StatusBooking {
  ACTIVE = "ACTIVE",
  PAID = "PAID",
  RESET = "RESET",
  NOPAID = "NOPAID",
}

export enum TypeBill {
  ALL = "ALL",
  SPLITBILL = "SPLITBILL",
}

export enum StatusTransaction {
  PAID = "PAID",
  NOPAID = "NOPAID",
}

export enum SendType {
  KASIR1 = "KASIR1",
  KASIR2 = "KASIR2",
}

export enum TypeActivity {
  BOOKING = "BOOKING",
  ADDDURATION = "ADDDURATION",
  ORDERCAFE = "ORDERCAFE",
  MANUALLAMP = "MANUALLAMP",
  PAYMENT = "PAYMENT",
  PAYMENTSPLITBILL = "PAYMENTSPLITBILL",
  ADDMEMBER = "ADDMEMBER",
}

export enum PaymentMethod {
  CASH = "CASH",
  QRIS = "QRIS",
  GOPAY = "GOPAY",
  SHOPEEPAY = "SHOPEEPAY",
  DANA = "DANA",
}

export enum StatusOrder {
  PENDING = "PENDING",
  ONGOING = "ONGOING",
  DONE = "DONE",
}

export enum TypePlay {
  LOSS = "LOSS",
  REGULAR = "REGULAR",
  NONE = "NONE",
}

export enum StatusMachine {
  CONNECTED = "CONNECTED",
  RECONNECTED = "RECONNECTED",
  DISCONNECTED = "DISCONNECTED",
}

// ======== INTERFACES ========
export interface User {
  id: number;
  name: string;
  username: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  order_cafe: OrderCafe[];
  split_bill: SplitBill[];
  activities: Activity[];
}

export interface TableBilliard {
  id: number;
  id_table: string;
  name: string;
  duration: string;
  status: TableStatus;
  type_play: TypePlay;
  timer?: Date | null;
  number?: string | null;
  power?: "ON" | "OFF";
  created_at: Date;
  updated_at: Date;
  bookings: Booking[];
  remainingTime?: string;
}

export interface Members {
  id: number;
  id_member: string;
  kode_member: string;
  name: string;
  no_telp: string;
  email: string;
  type_member: TypeMember;
  start_date: Date;
  end_date: Date;
  playing: number;
  status: StatusMember;
  discount: number;
  created_at: Date;
  updated_at: Date;
  bookings: Booking[];
}

export interface Booking {
  id: number;
  id_booking: string;
  memberId: number;
  member: Members;
  name: string;
  tableId: number;
  table: TableBilliard;
  duration: number;
  total_price: number;
  status: StatusBooking;
  created_at: Date;
  updated_at: Date;
  detail_booking: DetailBooking[];
  order_cafe: OrderCafe[];
  split_bill: SplitBill[];
}

export interface DetailBooking {
  id: number;
  bookingId: number;
  booking: Booking;
  price: number;
  duration: number;
  status: StatusBooking;
  start_duration: Date;
  end_duration: Date;
  type_bill: TypeBill;
  created_at: Date;
  updated_at: Date;
  split_bill_detail: SplitBillDetail[];
}

export interface SplitBillDetail {
  id: number;
  splitBillId: number;
  split_bill: SplitBill;
  menu_cafe?: number;
  menucafe?: MenuCafe;
  detail_booking_id: number;
  detail_booking: DetailBooking;
  sub_total: number;
  status_bill: StatusTransaction;
  created_at: Date;
  updated_at: Date;
}

export interface PriceMember {
  id: number;
  price: number;
  discount: number;
  playing: number;
  type_member: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CategoryMenu {
  id?: number;
  name: string;
  created_at: Date;
  updated_at: Date;
  menucafe: MenuCafe[];
}

export interface ICart {
  id: number;
  name: string;
  price: number;
  qty: string;
  subtotal: number;
}

export interface IMenu {
  id?: number;
  name: string;
  price: number;
  categoryMenuId?: number;
  category_menu?: CategoryMenu;
  price_profit: number;
  price_modal: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface MenuCafe {
  id: number;
  name: string;
  price: number;
  categoryMenuId?: number;
  category_menu?: CategoryMenu;
  price_sell: number;
  price_modal: number;
  created_at: Date;
  updated_at: Date;
  ordercafe: OrderCafe[];
  split_bill_detail: SplitBillDetail[];
  orderinmenu: OrderInMenu[];
}

export interface OrderCafe {
  id: number;
  id_order_cafe: string;
  menu_cafe: number;
  menucafe: MenuCafe;
  total: number;
  cash: number;
  change: number;
  bookingId: number;
  booking: Booking;
  status: StatusTransaction;
  userId: number;
  user_in: User;
  created_at: Date;
  updated_at: Date;
}

export interface Settings {
  id: number;
  id_settings: string;
  label_settings: string;
  url: string;
  content?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Shift {
  id: number;
  shift: string;
  start_hours: Date;
  end_hours: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SplitBill {
  id: number;
  id_split_bill: string;
  bookingId: number;
  booking: Booking;
  name: string;
  total: number;
  type_bill: TypeBill;
  userId: number;
  user: User;
  created_at: Date;
  updated_at: Date;
  split_bill_detail: SplitBillDetail[];
}

export interface Chat {
  id: number;
  text: string;
  send_by: SendType;
  created_at: Date;
  updated_at: Date;
}

export interface Activity {
  id: number;
  activity: string;
  userId: number;
  user: User;
  type_activity: TypeActivity;
  created_at: Date;
  updated_at: Date;
}

export interface TableNumber {
  id: number;
  id_table: string;
  number: number;
  created_at: Date;
  updated_at: Date;
  orderin: OrderIn[];
}

export interface OrderIn {
  id: number;
  id_order_in: string;
  token_qr: string;
  name: string;
  noTableId: number;
  table: TableNumber;
  payment_method: PaymentMethod;
  sub_total: number;
  total: number;
  nominal: number;
  change: number;
  status: StatusTransaction;
  status_order: StatusOrder;
  created_at: Date;
  updated_at: Date;
  orderinmenu: OrderInMenu[];
}

export interface OrderInMenu {
  id: number;
  id_order_in_menu: string;
  orderInId: number;
  orderIdIn: OrderIn;
  menuId: number;
  menu: MenuCafe;
  qty: number;
  created_at: Date;
  updated_at: Date;
}

export interface IPrinters {
  description: string;
  displayName: string;
  name: string;
  isDefault: boolean;
  status: number;
}

export interface SerialPortInfo {
  friendlyName?: string;
  locationId?: string;
  manufacturer?: string;
  path: string;
  pnpId?: string;
  productId?: string;
  serialNumber?: string;
  vendorId?: string;
}

export enum ILogsStatus {
  WARNING = "WARNING",
  LOG = "LOG",
  ERROR = "ERROR",
}

export interface ILogs {
  id: number;
  activity: string;
  status: ILogsStatus;
  created_at: Date;
  updated_at: Date;
}

export interface IVoucher {
  id: number;
  id_voucher: string;
  kode_voucher: string;
  discount: number;
  start_date: Date;
  end_date: Date;
  status: StatusMember;
  created_at: Date;
  updated_at: Date;
}

export interface IModalRow<T> {
  open: boolean;
  row: T | null;
}

export interface IPriceType {
  id: number;
  id_price_billing_type: string;
  type_price: string;
  created_at: Date;
  updated_at: Date;
}

export interface IMachine {
  id: number;
  id_machine: string;
  status: StatusMachine;
  created_at: Date;
  updated_at: Date;
}
