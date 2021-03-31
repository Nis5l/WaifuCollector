import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import Navbar from './components/Navbar';

import Home from './pages/Home';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/Profile';
import Pack from './pages/Pack';

import Login from './pages/loggedout/Login';

import './App.scss';

function App() {
  return (

    <>

      <Router>

        <Navbar />

        <main className="content">

          <Switch>

            <Route path="/" exact component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/pack" component={Pack} />

            {/*Dashboard */}
            <Route path="/dashboard" component={Dashboard} />

            { /* Profile others */}
            <Route path="/profile/:id" component={Profile} />

          </Switch>

        </main>

      </Router>

    </>

  );
}

export default App;
