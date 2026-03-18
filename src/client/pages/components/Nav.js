import { NavLink } from 'react-router-dom';


function Nav() {
  return (
    <aside className="sidebar">
          <a href="/"><div className="logo">Zakaži<span>SE</span></div></a>
            <nav>
                <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
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
            </nav>
      </aside>
  );
}

export default Nav;