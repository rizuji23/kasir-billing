import { Route, Routes, useNavigate } from 'react-router'
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
import { WebSocketProvider } from './components/context/WebsocketContext'
import KitchenPage from './app/kitchen/Kitchen'
import { useEffect } from 'react'
import AdminPage from './app/admin/Admin'
import { ChatProvider } from './components/context/ChatContext'
import Login from './app/Login'

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleNavigate = (_: Electron.IpcRendererEvent, path: string) => {
      navigate(path);
    };

    window.api.onNavigate(handleNavigate);

    return () => {
      window.api.onNavigate(handleNavigate); // Pass the same callback
    };
  }, [navigate]);

  return (
    <>
      <TableBilliardProvider>
        <WebSocketProvider>
          <ChatProvider>
            <Routes>
              <Route path="/" element={<Login />}></Route>

              <Route path="/dashboard" element={<DashboardPage />}></Route>
              {/* <Route path="/" element={<DashboardPage />}></Route> */}
              <Route path="/order" element={<OrderPage />}></Route>
              <Route path="/menu" element={<Menu />}></Route>
              <Route path="/member" element={<MemberPage />}></Route>
              <Route path="/report" element={<ReportPage />}></Route>
              <Route path="/stock" element={<StockPage />}></Route>
              <Route path="/manual" element={<ManualLamp />}></Route>
              <Route path="/settings" element={<SettingsPage />}></Route>
              <Route path="/struk" element={<StrukView />}></Route>
              <Route path="/kitchen" element={<KitchenPage />}></Route>
              <Route path='/admin' element={<AdminPage />}></Route>

            </Routes>
          </ChatProvider>
        </WebSocketProvider>
      </TableBilliardProvider>

    </>
  )
}

export default App
