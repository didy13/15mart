import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Usluge from './Usluge';
import Rezervacija from './Rezervacija';
import '../../public/css/style.css';
import Admin from '../pages/Admin';
import Majstori from '../pages/Majstori';
import SignIn from "../pages/SignIn";
import Signup from "../pages/Signup";
import Landing from "../pages/Landing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/usluge" element={<Usluge />} />
          <Route path="/majstori" element={<Majstori />} />
          <Route path="/rezervacija" element={<Rezervacija />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;