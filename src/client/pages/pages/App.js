import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Usluge from './Usluge';
import Rezervacija from './Rezervacija';
import Nav from '../components/Nav';
import '../../public/css/style.css';
import Head from '../components/Head';
import Admin from '../pages/Admin';
import { useState } from 'react';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element = {<Admin />} />
        <Route path="/usluge" element={<Usluge />} />
        <Route path="/rezervacija" element={<Rezervacija />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;