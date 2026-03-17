# Kasir Billing & Billiard Management System

A comprehensive, open-source Point of Sale (POS) and Billing management system specifically designed for billiard arenas and cafes. Built with Electron, React, and Prisma for high performance and reliability on desktop environments.

![App Screenshot](https://via.placeholder.com/800x450?text=Kasir+Billing+Preview)

## 🚀 Key Features

### 🎱 Billiard Management
- **Table Control**: Real-time management of billiard tables (Available, Occupied, Maintenance).
- **Hardware Integration**: Control table lighting/power directly via Serial Port (Box Billing).
- **Flexible Billing**: Support for regular hourly rates, fixed-package pricing, and membership rates.
- **Blink Alert**: Visual indicator for tables nearing end of session.

### ☕ Cafe & POS
- **Integrated POS**: Seamlessly add food and beverage orders to a billiard session or standalone sales.
- **Kitchen Display**: Real-time order status tracking (Pending, Cooking, Ready, Served).
- **Menu Management**: Categorized menu with profit tracking and modal price management.
- **QR Order**: Support for customers to scan QR codes at tables to place orders.

### 👥 Member & Shift Management
- **Membership**: Tiered membership system (Premium/Regular) with automated discounts.
- **Shift System**: Multi-shift support (e.g., Pagi/Malam) with detailed rekap reports per shift.
- **User Roles**: Secure access for Admins and Cashiers.

### 📊 Reporting & Accounting
- **Daily Rekap**: Automated closing reports.
- **Detailed Logs**: Track all activities and system events.
- **Export Options**: Export reports to PDF and Excel for offline auditing.

## 💻 Technical Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [HeroUI](https://heroui.com/) (NextUI v3), [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Desktop**: [Electron 34](https://www.electronjs.org/)
- **Database & ORM**: [SQLite](https://www.sqlite.org/) with [Prisma ORM](https://www.prisma.io/)
- **Communication**: [Socket.io](https://socket.io/) (Real-time updates), [SerialPort](https://serialport.io/) (Hardware control)

## 🛠️ Minimum System Requirements

To ensure smooth operation, especially when running multiple billiard tables and real-time sockets:

| Component | Minimum Specification | Recommended Specification |
|-----------|-----------------------|---------------------------|
| **OS** | Windows 10/11 (64-bit) | Windows 10/11 (64-bit) |
| **Processor** | Dual Core 2.0 GHz | Intel Core i3 / Ryzen 3 or better |
| **RAM** | 4 GB | 8 GB |
| **Storage** | 500 MB Free Space | 1 GB SSD |
| **Display** | 1366 x 768 Resolution | 1920 x 1080 (HD) |

### 🖨️ Thermal Printer Specifications
- **Type**: ESC/POS Thermal Printer.
- **Width**: 58mm or 80mm.
- **Interface**: USB or Network (via Windows Driver).
- **Prerequisite**: Printer must be installed and named in the application settings.

## 📦 Installation & Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/kasir-billing.git
   cd kasir-billing
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Database Setup**:
   ```bash
   npx prisma generate
   npm run migrate
   ```

4. **Run in Development mode**:
   ```bash
   npm run dev
   ```

5. **Build for Windows**:
   ```bash
   npm run dist:win
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Created with ❤️ for the Billiard Community.*
