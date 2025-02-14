import { Route, Routes } from 'react-router'
import Login from './app/Login'
import DashboardPage from './app/dashboard/Dashboard'
import Menu from './app/menu/Menu'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/dashboard" element={<DashboardPage />}></Route>
        <Route path="/menu" element={<Menu />}></Route>
      </Routes>
    </>
  )
}

export default App
