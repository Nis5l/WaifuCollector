import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom'

import { AuthProvider } from './context/AuthProvider'

import Sidebar from './components/navigation/Sidebar'

import Home from './pages/home/Home'
import Dashboard from './pages/dashboard/Dashboard'
import Profile from './pages/profile/Profile'
import Pack from './pages/pack/Pack'
import Inventory from './pages/inventory/Inventory'
import CardPage from './pages/card/CardPage'
import NoMatch from './pages/nomatch/NoMatch'
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
import PrivateRoute from './components/PrivateRoute'
import useAuth from './hooks/useAuth'
import LogOut from './pages/admission/Logout'
import RememberMe from './components/RememberMe'
import { getRememberMe } from './utils/utils'
import { useState } from 'react'
import Navigation from './components/navigation/Navigation'

function App() {
  let { auth } = useAuth();
  let [ remembered, setRemembered ] = useState(false);

  return (

    <>

      <AuthProvider>
        <Router>
          { getRememberMe() && !remembered ? <RememberMe remembered={() => setRemembered(true)} /> : ( <>
            <Navigation />
            <div style={{height: "100%", width: "100%", display: "flex"}}>
              <Sidebar/>
              <main className="content">
                <Switch>
                  <Route path="/" exact component={Home} />
                  <Route path="/privacy" component={Privacy} />

                  <Route path="/login">{auth != null ? <Redirect to="/dashboard" /> : <Login/>}</Route>
                  <Route path="/register">{auth != null ? <Redirect to="/dashboard" /> : <Register />}</Route>

                  <Route path="/users" component={Users} />

                  { /* Profile others */}
                  <Route path="/profile/:id" component={Profile} />

                  {/* Logged in User */}
                  <PrivateRoute path="/dashboard">
                    <Route component={Dashboard} />
                  </PrivateRoute>

                  <PrivateRoute path="/pack">
                    <Pack />
                  </PrivateRoute>

                  <PrivateRoute path="/card/:id">
                    <Route component={CardPage} />
                  </PrivateRoute>

                  <PrivateRoute path="/inventory/:id">
                    <Route component={Inventory} />
                  </PrivateRoute>

                  <PrivateRoute path="/inventory">
                    <Route
                      render={(props) => {
                        return ( <Inventory {...props} /> )
                      }
                      }
                    />
                  </PrivateRoute>

                  <PrivateRoute path="/tradeinventory/:id">
                    <Route component={TradeInventory} />
                  </PrivateRoute>

                  <PrivateRoute path="/suggestcard/:id">
                    <Route component={SuggestInventory} />
                  </PrivateRoute>

                  <PrivateRoute path="/trade/:id">
                    <Route component={Trade} />
                  </PrivateRoute>

                  <PrivateRoute path="/logout">
                    <LogOut />
                  </PrivateRoute>

                  <PrivateRoute path="/verify/mail">
                    <Route component={VerifyMail} />
                  </PrivateRoute>

                  <PrivateRoute path="/verify">
                    <Route component={Verify} />
                  </PrivateRoute>

                  <PrivateRoute path="/settings">
                    <Settings />
                  </PrivateRoute>

                  <PrivateRoute path="/admin" allowedRoles={[1]}>
                    <h1>Admin</h1>
                  </PrivateRoute>

                  <Route component={NoMatch} />

                </Switch>
              </main>
            </div>
            </> )
          }

        </Router>
      </AuthProvider>

    </>

  );
}

export default App;
