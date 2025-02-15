import { Route, Routes } from 'react-router'
import Login from './app/Login'
import DashboardPage from './app/dashboard/Dashboard'
import Menu from './app/menu/Menu'
import MemberPage from './app/member/Member'
import ReportPage from './app/report/Report'
import StockPage from './app/stock/Stock'
import ManualLamp from './app/manual/ManualLamp'
import SettingsPage from './app/settings/Settings'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/dashboard" element={<DashboardPage />}></Route>
        <Route path="/menu" element={<Menu />}></Route>
        <Route path="/member" element={<MemberPage />}></Route>
        <Route path="/report" element={<ReportPage />}></Route>
        <Route path="/stock" element={<StockPage />}></Route>
        <Route path="/manual" element={<ManualLamp />}></Route>
        <Route path="/settings" element={<SettingsPage />}></Route>

      </Routes>
    </>
  )
}

export default App
