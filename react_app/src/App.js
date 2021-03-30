import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import Navbar from './components/Navbar';

import Home from './pages/Home';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/Profile';

import './App.scss';

function App() {
  return (

    <>
    
      <Router>

        <Navbar />

        <main className="content">

          <Switch>

            <Route path="/" exact component={Home}/>

            {/*Dashboard */ }
            <Route path="/dashboard" component={Dashboard}/>

            { /* Profile others */ }
            <Route path="/profile/:id" component={Profile}/>

          </Switch>

        </main>

      </Router>

    </>

  );
}

export default App;
