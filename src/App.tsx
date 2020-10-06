import React from 'react'; // importing FunctionComponent
import Settings from './Settings';
import Scanner from './Scanner';
import './App.scss';
import { BrowserRouter as Router, Route, Link} from 'react-router-dom';


function Home() {
  return (
    <div>
      <h1>Home</h1>
    <span>The purpose of this application is to retreive intraday data on stocks by using TD Ameritrade's api. In order to use this application you need have an authorized TD Ameritrade account.</span>
    <span>NOTE: API credentials are stored in local storage. You should only use this application on a trusted computer.</span>

    </div>
  );
}




export default function App() {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link className="nav-link" to="/Home">Home</Link>
          </li>
          <li>
            <Link className="nav-link"  to="/Scanner">Scanner</Link>
          </li>
          <li>
            <Link className="nav-link"  to="/Settings">Settings</Link>
          </li>
        </ul>

        <hr />

        <div className="container">
          <Route path="/Home" component={Home} />
          <Route path="/Scanner" component={Scanner} />
          <Route path="/Settings" component={Settings} />
        </div>

      </div>
    </Router>
  );
}