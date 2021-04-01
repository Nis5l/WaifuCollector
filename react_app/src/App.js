import React, {useState} from 'react';
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';

import Navbar from './components/Navbar';

import Home from './pages/home/Home';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import Pack from './pages/pack/Pack';
import Inventory from './pages/inventory/Inventory';

import Login from './pages/loggedout/Login';

import Cookies from 'js-cookie';

import './App.scss';

function App() {

  const [token, setToken] = useState(Cookies.get("token"));

  let setTokenHandler = (newToken) => {setToken(newToken); Cookies.set("token", newToken, {expires: 30 * 12 * 30})};

  return (

    <>

      <Router>

        <Navbar token={token} />

        <main className="content">

          <Switch>

            <Route path="/" exact component={Home} />
            <Route
              path="/login"
            >

              {token ? <Redirect to="/dashboard" /> : <Login
                setToken={setTokenHandler}
              />
              }

            </Route>

            {/* Logged in User */}
            <Route path="/dashboard">

              {!token ? <Redirect to="/login" /> : <Dashboard />}

            </Route>

            <Route path="/pack">

              {!token ? <Redirect to="/login" /> : <Pack />}

            </Route>

            <Route path="/inventory">

              {!token ? <Redirect to="/login" /> : <Inventory />}

            </Route>

            { /* Profile others */}
            <Route path="/profile/:id" component={Profile} />

            <Route path="/logout">

              {!token ? <Redirect to="/login" /> : () => {setToken(""); Cookies.remove("token");}}

            </Route>

          </Switch>

        </main>

      </Router>

    </>

  );
}

export default App;
