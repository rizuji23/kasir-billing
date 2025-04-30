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
import { EtcComponent } from './components/context/EtcContext'
import MiddlewareContext from './components/context/MiddlewareContext'
import PublicRoute from './components/context/PublicContext'

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
        <EtcComponent>
          <WebSocketProvider>
            <ChatProvider>
              <Routes>
                <Route path="/" element={<PublicRoute><Login /></PublicRoute>}></Route>

                <Route path="/dashboard" element={
                  <MiddlewareContext>
                    <DashboardPage />
                  </MiddlewareContext>
                }></Route>
                {/* <Route path="/" element={<DashboardPage />}></Route> */}
                <Route path="/order" element={
                  <MiddlewareContext>
                    <OrderPage />
                  </MiddlewareContext>
                }></Route>
                <Route path="/menu" element={
                  <MiddlewareContext>
                    <Menu />
                  </MiddlewareContext>
                }></Route>
                <Route path="/member" element={
                  <MiddlewareContext>
                    <MemberPage />
                  </MiddlewareContext>
                }></Route>
                <Route path="/report" element={
                  <MiddlewareContext>
                    <ReportPage />
                  </MiddlewareContext>
                }></Route>
                <Route path="/stock" element={
                  <MiddlewareContext>
                    <StockPage />
                  </MiddlewareContext>
                }></Route>
                <Route path="/manual" element={
                  <MiddlewareContext>
                    <ManualLamp />
                  </MiddlewareContext>
                }></Route>
                <Route path="/settings" element={
                  <MiddlewareContext>
                    <SettingsPage />
                  </MiddlewareContext>
                }></Route>
                <Route path="/struk" element={
                  <MiddlewareContext>
                    <StrukView />
                  </MiddlewareContext>
                }></Route>
                <Route path="/kitchen" element={
                  <MiddlewareContext>
                    <KitchenPage />
                  </MiddlewareContext>
                }></Route>
                <Route path='/admin' element={
                  <MiddlewareContext>
                    <AdminPage />
                  </MiddlewareContext>
                }></Route>

              </Routes>
            </ChatProvider>
          </WebSocketProvider>
        </EtcComponent>
      </TableBilliardProvider>

    </>
  )
}

export default App
