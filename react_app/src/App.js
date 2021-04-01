import React, {useState, useEffect} from 'react';
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';

import Navbar from './components/Navbar';

import Home from './pages/Home';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/Profile';

import Login from './pages/loggedout/Login';

import Cookies from 'js-cookie';

import './App.scss';

function App() {

  const requireAuth = (nextState, replace) => {

    if(!token){

      replace({
        pathname: "/login",
        state: { nextPathname: nextState.location.pathname }
      });

    }
  
  }

  const [token, setToken] = useState(Cookies.get("token"));

  let setTokenHandler = (newToken) => { setToken(newToken); Cookies.set("token", token, { expires: 30 * 12 * 30 }) };

  return (

    <>
    
      <Router>

        <Navbar />

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

            {/*Dashboard */ }
            <Route path="/dashboard">

              {!token ? <Redirect to="/login" /> : <Dashboard />}

            </Route>

            { /* Profile others */ }
            <Route path="/profile/:id" component={Profile} />

          </Switch>

        </main>

      </Router>

    </>

  );
}

export default App;
