import { Key } from "react";

// ======== ENUMS ========
export enum TableStatus {
  ACTIVE = "ACTIVE",
  USED = "USED",
  AVAILABLE = "AVAILABLE",
  MOSTLYEXPIRE = "MOSTLYEXPIRE",
  EXPIRE = "EXPIRE",
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

export enum Casier {
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

export enum CasierCasier {
  CASH = "CASH",
  TRANSFER = "TRANSFER",
  QRIS = "QRIS",
}

export enum TypeStruk {
  CAFEONLY = "CAFEONLY",
  TABLE = "TABLE",
  CAFEQR = "CAFEQR",
}

export enum TypeServer {
  CASHIER = "CASHIER",
  KITCHEN = "KITCHEN",
}

export enum StatusServer {
  CONNECTED = "CONNECTED",
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
  blink?: boolean;
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
  type_play: TypePlay;
  detail_booking?: DetailBooking[];
  order_cafe?: OrderCafe[];
  split_bill?: SplitBill[];
  shift?: string;
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
  send_to_kitchen: boolean;
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

export interface OrderCafeItem {
  id: number;
  id_order_cafe_item: string;
  orderId: number;
  orderCafe: OrderCafe;
  menu_cafe: number;
  menucafe: MenuCafe;
  price: number;
  created_at: Date;
  updated_at: Date;
}

export interface IOrderCafeNew {
  id: number;
  id_order: string;
  id_order_cafe: string;
  menu_cafe: number;
  subtotal: number;
  qty: number;
  total: number;
  cash: number;
  change: number;
  bookingId: number | null;
  status: string;
  userId: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderCafe {
  id: number;
  id_order_cafe: string;
  menu_cafe: number;
  menucafe: MenuCafe;
  total: number;
  subtotal: number;
  name: string;
  cash: number;
  change: number;
  qty: number;
  bookingId: number;
  booking: Booking;
  status: StatusTransaction;
  userId: number;
  user_in: User;
  created_at: Date;
  updated_at: Date;
  shift: string;
  orderCafeItem: OrderCafeItem[];
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
  payment_method: Casier;
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

export interface IPaymentSplitBill {
  selected_billing: Key[];
  selected_cafe: Key[];
  name: string;
}

export type PaymentMethodCasierType = "CASH" | "TRANSFER" | "QRIS";

export interface IPaymentData {
  id_table: string;
  id_booking: string;
  total: {
    total_billing: number;
    total_cafe: number;
    total_all: number;
  } | null;
  payment_cash: string;
  change: number;
  payment_method: "CASH" | "TRANSFER" | "QRIS" | string;
  is_split_bill: boolean;
  splitbill?: IPaymentSplitBill | null;
}

export interface Struk {
  id: number;
  id_struk: string;
  id_order?: number;
  id_order_in?: number;
  orderInId?: OrderIn;
  orderId?: OrderCafe[];
  id_booking?: number;
  bookingId?: Booking;
  name: string;
  total: number;
  total_cafe?: number;
  total_billing?: number;
  cash: number;
  change: number;
  payment_method: PaymentMethodCasierType;
  is_split_bill: boolean;
  type_struk: TypeStruk;
  status: StatusTransaction;
  created_at: Date;
  updated_at: Date;
  shift?: string;
}

export interface PriceBilling {
  id: number;
  id_price_billing: string;
  type_price_id: number;
  type_price: PriceBillingType;
  season: string;
  price: number;
  start_from: string;
  end_from: string;
  created_at: Date;
  updated_at: Date;
}

export interface PriceBillingType {
  id: number;
  id_price_billing_type: string;
  type_price: string;
  created_at: Date;
  updated_at: Date;
  typePricing: PriceBilling[];
  bookingId: Booking[];
}

export interface IIPList {
  ip: string;
  hostname: string;
}

export interface ServersList {
  id: number;
  id_local_server: string;
  ip: string;
  hostname: string;
  number: string;
  status: StatusServer;
  type_server: TypeServer;
  created_at: Date;
  updated_at: Date;
}
