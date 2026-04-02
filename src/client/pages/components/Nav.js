import { Link, NavLink } from 'react-router-dom';


function Nav() {
  return (
    <aside className="sidebar">
          <Link to="/"><div className="logo">Zakaži<span>SE</span></div></Link>
            <nav>
                <NavLink to="/admin" className={({ isActive }) => isActive ? "active" : ""}>
                    📊 Dashboard
                </NavLink>
                <NavLink to="/usluge" className={({ isActive }) => isActive ? "active" : ""}>
                    🛠️ Usluge
                </NavLink>
                <NavLink to="/majstori" className={({ isActive }) => isActive ? "active" : ""}>
                    👷‍♂️ Majstori
                </NavLink>
                <NavLink to="/rezervacija" className={({ isActive }) => isActive ? "active" : ""}>
                    📚 Rezervacija
                </NavLink>
                <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
                    ⬅️ Nazad na sajt
                </NavLink>
            </nav>
      </aside>
  );
}

export default Nav;