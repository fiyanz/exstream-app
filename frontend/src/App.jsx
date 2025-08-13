import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LandingOne from './Pages/Landing/Page';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Transaks from './Pages/Transaksi/Page';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingOne />} />
        <Route path="/about" element={<Transaks />} />
      </Routes>
    </Router>
  )
}

export default App
