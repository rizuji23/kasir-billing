import { Route, Routes } from 'react-router'
import DashboardPage from './app/dashboard/Dashboard'
import Menu from './app/menu/Menu'
import MemberPage from './app/member/Member'
import ReportPage from './app/report/Report'
import StockPage from './app/stock/Stock'
import ManualLamp from './app/manual/ManualLamp'
import SettingsPage from './app/settings/Settings'
import OrderPage from './app/order/Order'
import { TableBilliardProvider } from './components/context/TableContext'
import StrukView from './app/struk/Struk'

function App() {

  return (
    <>
      <TableBilliardProvider>
        <Routes>
          {/* <Route path="/" element={<Login />}></Route> */}

          <Route path="/dashboard" element={<DashboardPage />}></Route>
          <Route path="/" element={<DashboardPage />}></Route>
          <Route path="/order" element={<OrderPage />}></Route>
          <Route path="/menu" element={<Menu />}></Route>
          <Route path="/member" element={<MemberPage />}></Route>
          <Route path="/report" element={<ReportPage />}></Route>
          <Route path="/stock" element={<StockPage />}></Route>
          <Route path="/manual" element={<ManualLamp />}></Route>
          <Route path="/settings" element={<SettingsPage />}></Route>
          <Route path="/struk" element={<StrukView />}></Route>

        </Routes>
      </TableBilliardProvider>

    </>
  )
}

export default App
