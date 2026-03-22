import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./../../public/css/sajt/signIn.css";

function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/checkSession", { credentials: "include" });
        const data = await res.json();
        if (data.loggedIn) navigate("/admin"); // ako je već logovan
      } catch (err) {
        console.error(err);
      }
    };
    checkLogin();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) navigate("/admin");
      else alert("Pogrešan username ili lozinka");
    } catch (err) {
      console.error(err);
      alert("Došlo je do greške, pokušajte ponovo.");
    }
  };
  return (

        <div className="signin-page">
  <div className="forma_kontejner" id = "signin">
    <h1>Sign In</h1>
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Sign In</button>
    </form>
  </div>
</div>
 
    
  );
}

export default SignIn;