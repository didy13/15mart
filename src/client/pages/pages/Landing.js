import { Link } from 'react-router-dom';
import '../../public/css/sajt/landing.css';
import logo from '../../public/logo.png';
import heroImage from '../../public/GreenDragon.jpg';

function Landing() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-logo">
          <img src={logo} alt="ZakažiME logo" />
          <span>ZakažiME</span>
        </div>
        <nav className="landing-nav">
          <a href="#pocetak">Home</a>
          <a href="#o_nama">About</a>
          <a href="#funkcije">Features</a>
          <a href="#kontakt">Contact</a>
        </nav>
        <Link className="landing-signin" to="/signin">Sign In</Link>
      </header>

      <section id="pocetak" className="glavna_sekcija">
        <h1>Green Dragon</h1>
        <img src={heroImage} alt="Slika" className="glavna_slika" />
      </section>

      <section id="o_nama" className="tekst_sekcija">
        <p>
          text text text text text text text text text text
          text text text text text text text text text text
        </p>
      </section>

      <section id="funkcije" className="kartice">
        <div className="kartica">
          <h2>Green Dragon</h2>
          <img src={heroImage} alt="Slika" className="slika" />
        </div>
        <div className="kartica">
          <h2>Green Dragon</h2>
          <img src={heroImage} alt="Slika" className="slika" />
        </div>
        <div className="kartica">
          <h2>Green Dragon</h2>
          <img src={heroImage} alt="Slika" className="slika" />
        </div>
      </section>

      <section className="podeljena_sekcija">
        <img src={heroImage} alt="Slika" className="podeljena_slika" />
        <div className="podeljen_tekst">
          <p>
            text text text text text text text text text text
            text text text text text text text text text text
          </p>
        </div>
      </section>

      <section id="kontakt" className="naslov_tekst">
        <h2>Contact</h2>
        <p>
          text text text text text text text text text text
          text text text text text text text text text text
        </p>
      </section>

      <footer>
        <p>
          text text text text text text text text text text
          text text text text text text text text text text
        </p>
      </footer>
    </div>
  );
}

export default Landing;
