import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './../../public/css/sajt/signIn.css';

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Sva polja su obavezna.');
      return;
    }
    if (form.password.length < 10) {
      setError('Lozinka mora imati najmanje 10 karaktera.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Lozinke se ne poklapaju.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Sign up nije uspeo.');
        return;
      }
      navigate('/signin');
    } catch (err) {
      setError('Došlo je do greške, pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="forma_kontejner" id="signup">
        <h1>Sign Up</h1>
        <form onSubmit={onSubmit}>
          <input type="text" name="username" placeholder="Username" value={form.username} onChange={onChange} required />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={onChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={onChange} required />
          <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Sign Up'}</button>
        </form>
        <p style={{ fontSize: 12, marginTop: 8, opacity: 0.85 }}>
          Lozinka: min 10 karaktera, veliko + malo slovo, broj i specijalni znak.
        </p>
        {error && <p style={{ color: 'salmon', marginTop: 8 }}>{error}</p>}
        <p style={{ marginTop: 12 }}>
          Već imate nalog? <Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
