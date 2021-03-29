import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import Navbar from './components/Navbar';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

import './App.scss';

function App() {
  return (

    <>
    
      <Router>

        <Navbar />

        <main className="content">

          <Switch>

            <Route path="/" exact component={Home}/>
            <Route path="/dashboard" component={Dashboard}/>

          </Switch>

        </main>

      </Router>

    </>

  );
}

export default App;
