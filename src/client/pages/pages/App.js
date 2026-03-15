import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Usluge from './Usluge';
import Rezervacija from './Rezervacija';
import '../../public/css/style.css';
import Admin from '../pages/Admin';

function App() {
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