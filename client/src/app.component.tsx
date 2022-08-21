import { AuthProvider } from './context/AuthProvider'

//TODO: pages index.ts
import HomeComponent from './pages/home'
import DashboardComponent from './pages/dashboard'
import ProfileComponent from './pages/profile'
import PackComponent from './pages/pack'
import InventoryComponent from './pages/inventory'
import CardComponent from './pages/card'
import TradeComponent, { TradeInventoryComponent, SuggestInventoryComponent } from './pages/trade'
import Users from './pages/users'
import SettingsComponent from './pages/settings'
import PrivacyComponent from './pages/privacy'

import { LoginComponent, LogoutComponent, RegisterComponent } from './pages/admission'

import './app.component.scss'

import VerifyComponent from './pages/verify'
import VerifyMailComponent from './pages/verify-mail'
import RememberMe from './components/RememberMe'
import { getRememberMe } from './utils'
import { useState } from 'react'
import { NavigationComponent, GameSidebarComponent, CollectorSidebarComponent } from './navigation'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import RequireAuth from './components/routes/RequireAuth'
import RequireNoAuth from './components/routes/RequireNoAuth'
import CollectorListComponent from './pages/collector/list'

function AppComponent() {
  let [ remembered, setRemembered ] = useState(false);

  return (

    <>

      <AuthProvider>
        <BrowserRouter>
          { getRememberMe() && !remembered ? <RememberMe remembered={() => setRemembered(true)} /> : ( <>
            <NavigationComponent />
                <Routes>

                  <Route element={
                    <div style={{height: "100%", width: "100%", display: "flex"}}>
                      <main className='content'>
                        <Outlet />
                      </main>
                    </div>
                  }>
                    <Route path="/" element={<HomeComponent />} />
                    <Route path="/privacy" element={<PrivacyComponent />} />

                    <Route path="/users" element={<Users />} />

                    { /* Profile others */}
                    <Route path="/profile/:id" element={<ProfileComponent />} />

                    {/* Not logged in user */}
                    <Route element={<RequireNoAuth />}>
                      <Route path="/login" element={<LoginComponent/>} />
                      <Route path="/register" element={<RegisterComponent />}></Route>
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
                      <Route path="/logout" element={<LogoutComponent />} />

                      <Route path="/verify/mail" element={<VerifyMailComponent />} />
                      <Route path="/verify" element={<VerifyComponent />} />

                      <Route path="/settings" element={<SettingsComponent />} />
                    </Route>

                    {/* Collector Player */}
                    <Route path="/collector" element={
                        <div style={{height: "100%", width: "100%", display: "flex"}}>
                          <CollectorSidebarComponent />
                          <main className='content'>
                            <Outlet />
                          </main>
                        </div>
                      }>
                        <Route index element={<CollectorListComponent />} /> 
                    </Route>

                    {/* Game Player */}
                    <Route element={
                      <div style={{height: "100%", width: "100%", display: "flex"}}>
                        <GameSidebarComponent />
                        <main className='content'>
                          <Outlet />
                        </main>
                      </div>
                    }>
                      <Route path="/dashboard" element={<DashboardComponent />} />
                      <Route path="/pack" element={<PackComponent />} />
                      <Route path="/card/:id" element={<CardComponent />} />
                      
                      <Route path="/inventory/:id" element={<InventoryComponent />} />
                      <Route path="/inventory" element={<InventoryComponent />} />

                      <Route path="/tradeinventory/:id" element={<TradeInventoryComponent />} />
                      <Route path="/suggestcard/:id" element={<SuggestInventoryComponent />} />
                      <Route path="/trade/:id" element={<TradeComponent />} />
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

export default AppComponent;
