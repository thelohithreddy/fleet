import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Signup from './Signup.jsx';
import Signin from './Signin.jsx';
import Adminsignin from './Adminsignin.jsx';
import Logo from './Logo.jsx';
import Fleetlogo from '../../../public/greylogo.png';

const Maincontent = () => {
  const location = useLocation();

  return (
    <main>
      <header className='header'>
        <img src={Fleetlogo} alt="Fleet Logo" />
        <h1>FLEET</h1>
      </header>
      <div className='mainsnippet'>
        <Logo />
        {location.pathname === '/signup' && <Signup />}
        {location.pathname === '/signin' && <Signin />}
        {location.pathname === '/adminsignin' && <Adminsignin />}
      </div>
    </main>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<Maincontent />} />
      </Routes>
    </Router>
 );
}


export default App;