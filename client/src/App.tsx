import { AuthProvider } from './context/AuthProvider'

import Sidebar from './components/navigation/Sidebar'

import Home from './pages/home/Home'
import Dashboard from './pages/dashboard/Dashboard'
import Profile from './pages/profile/Profile'
import Pack from './pages/pack/Pack'
import Inventory from './pages/inventory/Inventory'
import CardPage from './pages/card/CardPage'
import Trade from './pages/trade/Trade'
import TradeInventory from './pages/tradeinventory/TradeInventory'
import SuggestInventory from './pages/suggestInventory/SuggestInventory'
import Users from './pages/users/Users'
import Settings from './pages/settings/Settings'
import Privacy from './pages/privacy/Privacy'

import Login from './pages/admission/Login'

import './App.scss'
import Register from './pages/admission/Register'

import Verify from './pages/verify/Verify'
import VerifyMail from './pages/verifymail/VerifyMail'
import LogOut from './pages/admission/Logout'
import RememberMe from './components/RememberMe'
import { getRememberMe } from './utils/utils'
import { useState } from 'react'
import Navigation from './components/navigation/Navigation'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import RequireAuth from './components/routes/RequireAuth'
import RequireNoAuth from './components/routes/RequireNoAuth'

function App() {
  let [ remembered, setRemembered ] = useState(false);

  return (

    <>

      <AuthProvider>
        <BrowserRouter>
          { getRememberMe() && !remembered ? <RememberMe remembered={() => setRemembered(true)} /> : ( <>
            <Navigation />
                <Routes>

                  <Route element={
                    <div style={{height: "100%", width: "100%", display: "flex"}}>
                      <main className='content'>
                        <Outlet />
                      </main>
                    </div>
                  }>
                    <Route path="/" element={<Home />} />
                    <Route path="/privacy" element={<Privacy />} />

                    <Route path="/users" element={<Users />} />

                    { /* Profile others */}
                    <Route path="/profile/:id" element={<Profile />} />

                    {/* Not logged in user */}
                    <Route element={<RequireNoAuth />}>
                      <Route path="/login" element={<Login/>} />
                      <Route path="/register" element={<Register />}></Route>
                    </Route>
                  </Route>

                  {/* Logged in User */}
                  <Route element={<RequireAuth />}>

                    <Route element={
                      <div style={{height: "100%", width: "100%", display: "flex"}}>
                        <main className='content'>
                          <Outlet />
                        </main>
                      </div>
                    }>
                      <Route path="/logout" element={<LogOut />} />

                      <Route path="/verify/mail" element={<VerifyMail />} />
                      <Route path="/verify" element={<Verify />} />

                      <Route path="/settings" element={<Settings />} />
                    </Route>

                    {/* Collector Player */}
                    <Route element={
                      <div style={{height: "100%", width: "100%", display: "flex"}}>
                        <Sidebar />
                        <main className='content'>
                          <Outlet />
                        </main>
                      </div>
                    }>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/pack" element={<Pack />} />
                      <Route path="/card/:id" element={<CardPage />} />
                      
                      <Route path="/inventory/:id" element={<Inventory />} />
                      <Route path="/inventory" element={<Inventory />} />

                      <Route path="/tradeinventory/:id" element={<TradeInventory />} />
                      <Route path="/suggestcard/:id" element={<SuggestInventory />} />
                      <Route path="/trade/:id" element={<Trade />} />
                    </Route>
                  </Route>

                </Routes>
            </> )
          }

        </BrowserRouter>
      </AuthProvider>

    </>

  );
}

export default App;
