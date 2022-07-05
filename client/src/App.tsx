import React, {useState, useEffect} from 'react'
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom'

import { AuthProvider } from './context/AuthProvider'

import Navbar from './components/Navbar'

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

import Login from './pages/loggedout/Login'

import Cookies from 'js-cookie'

import './App.scss'
import Register from './pages/loggedout/Register'

import Verify from './pages/verify/Verify'
import VerifyMail from './pages/verifymail/VerifyMail'

function App() {

  const [token, setToken] = useState(Cookies.get("token"));

  let setTokenHandler = (newToken: string) => {

    setToken(newToken);

    Cookies.set("token", newToken, {expires: 30 * 12 * 30})

  };

  const userIDRaw: string | undefined = Cookies.get('userID');
  const userID: number = parseInt(userIDRaw != null ? userIDRaw : "0");

  return (

    <>

      <AuthProvider>

        <Router>

          <Navbar token={token} />

          <main className="content">

            <Switch>

              <Route path="/" exact component={Home} />
              <Route path="/privacy" component={Privacy} />

              <Route
                path="/login"
              >

                {token ? <Redirect to="/dashboard" /> : <Login
                  setToken={setTokenHandler}
                />
                }

              </Route>
              <Route
                path="/register"
              >

                {token ? <Redirect to="/dashboard" /> : <Register />}

              </Route>

              {/* Logged in User */}
              <Route path="/dashboard">

                {!token ? <Redirect to="/login" /> : <Route component={Dashboard} />}

              </Route>

              <Route path="/pack">

                {!token ? <Redirect to="/login" /> : <Pack />}

              </Route>

              <Route path="/card/:id">

                {!token ? <Redirect to="/login" /> : <Route component={CardPage} />}

              </Route>

              <Route path="/inventory/:id">

                { !token ? <Redirect to="/login" /> : <Route component={Inventory} /> }

              </Route>

              <Route path="/inventory">

                {!token ? <Redirect to="/login" /> : <Route
                  render={(props) => 
                    ( <Inventory userID={userID} {...props} /> )
                  }
                />}

              </Route>

              <Route path="/tradeinventory/:id">

                {!token ? <Redirect to="/login" /> : <Route component={TradeInventory} />}

              </Route>

              <Route path="/suggestcard/:id">

                {!token ? <Redirect to="/login" /> : <Route component={SuggestInventory} />}

              </Route>

              <Route path="/trade/:id">

                {!token ? <Redirect to="/login" /> : <Route component={Trade} />}

              </Route>

              { /* Profile others */}
              <Route path="/profile/:id" component={Profile} />

              <Route path="/logout">

                {!token ? <Redirect to="/login" /> : <LogOut setToken={setTokenHandler} />}

              </Route>

              <Route path="/verify/mail">

                {!token ? <Redirect to="/login" /> : <Route component={VerifyMail} />}

              </Route>

              <Route path="/verify">

                {!token ? <Redirect to="/login" /> : <Route component={Verify} />}

              </Route>

              <Route path="/users" component={Users} />

              <Route path="/admin/users" component={Settings} />

              <Route path="/settings" component={Settings} />

              <Route path="/privacy" component={Privacy} />

              <Route path="/friends">
                <Redirect to="dashboard" />
              </Route>

              <Route component={NoMatch} />

            </Switch>

          </main>

        </Router>
      </AuthProvider>

    </>

  );
}

function LogOut(props: any) {

  useEffect(() => props.setToken(""));

  Cookies.remove("token");
  Cookies.remove("userID");
  Cookies.remove("rank");

  return (

    <Redirect
      to="/"
    />

  );

}

export default App;
