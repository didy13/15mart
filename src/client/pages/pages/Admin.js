import '../../public/css/style.css'; 
import Head from '../components/Head';
import Nav from '../components/Nav';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const navigate = useNavigate();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({ revenue: 0, customers: 0, total: 0 });
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({ custName: '', service: '', date: '', time: '' });

  useEffect(() => {
    const checkAndLoad = async () => {
      try {
        // Proveri sesiju
        const res = await fetch('http://localhost:3001/api/checkSession', {
          credentials: 'include'
        });
        const data = await res.json();

        if (!data.loggedIn || !data.isAdmin) {
          navigate('/signin'); // ako nije logovan
          return;
        }

        // Ako jeste logovan, učitaj podatke
        await loadDashboard();
        await loadServices();

      } catch (err) {
        console.error('Greška pri proveri sesije:', err);
        navigate('/signin');
      }
    };

    checkAndLoad();
  }, [navigate]);

  // Load dashboard: stats + appointments
  const loadDashboard = async () => {
    try {
      const statsRes = await fetch('http://localhost:3001/api/stats', { credentials: 'include' });
      if (!statsRes.ok) throw new Error("Greška pri učitavanju statistike");
      const statsData = await statsRes.json();
      setStats({
        revenue: statsData.revenue || 0,
        customers: statsData.customers || 0,
        total: statsData.total || 0
      });

      const aRes = await fetch('http://localhost:3001/api/appointments', { credentials: 'include' });
      if (!aRes.ok) throw new Error("Greška pri učitavanju termina");
      const appointmentsData = await aRes.json();
      setAppointments(appointmentsData);
    } catch (err) {
      console.error(err);
    }
  };

  // Load services
  const loadServices = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/services', { credentials: 'include' });
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error(err);
    }
  };


  // Form input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nameToStateMap = { custName: 'custName', serviceSelect: 'service', appDate: 'date', appTime: 'time' };
    const stateKey = nameToStateMap[name];
    if (stateKey) {
      setFormData(prev => ({ ...prev, [stateKey]: value }));
    }
  };

  // Save appointment
  const handleSaveAppointment = async () => {
    const { custName, service, date, time } = formData;
    if (!custName || !service || !date || !time) {
      alert("Sva polja su obavezna!");
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customer_name: custName, service, date, time })
      });

      if (!res.ok) throw new Error("Greška pri čuvanju termina");

      setIsModalOpen(false);
      setFormData({ custName: '', service: '', date: '', time: '' });
      loadDashboard();
    } catch (err) {
      console.error(err);
      alert("Greška pri čuvanju termina");
    }
  };

  // Complete appointment
  const handleComplete = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/appointments/${id}/complete`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Greška pri završavanju termina");
      loadDashboard();
    } catch (err) {
      console.error(err);
      alert("Greška pri završavanju termina");
    }
  };

  const handleAccept = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/appointments/${id}/accept`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Greška pri prihvatanju termina");
      }
      loadDashboard();
    } catch (err) {
      console.error(err);
      alert(err.message || "Greška pri prihvatanju termina");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/appointments/${id}/reject`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Greška pri odbijanju termina");
      }
      loadDashboard();
    } catch (err) {
      console.error(err);
      alert(err.message || "Greška pri odbijanju termina");
    }
  };

  // Delete appointment
  const handleDeleteClick = (id) => { setDeleteId(id); setShowConfirm(true); };

  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/appointments/${deleteId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Greška pri brisanju termina");
      setShowConfirm(false);
      loadDashboard();
    } catch (err) {
      console.error(err);
      alert("Greška pri brisanju termina");
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('sr-RS', { year: 'numeric', month: '2-digit', day: '2-digit' });

  return (
    <>
      <Head pageTitle="Admin" styleTitle="admin-style" />
      <div className="app-container">
        <Nav />
        <main className="main-content">
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <h1>Dashboard</h1>
            <button id="openModalBtn" className="btn-primary" onClick={() => setIsModalOpen(true)}>+ Novi termin</button>
          </header>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card"><p>PRIHOD</p><h3>{stats.revenue} RSD</h3></div>
            <div className="stat-card"><p>KLIJENTI</p><h3>{stats.customers}</h3></div>
            <div className="stat-card"><p>UKUPNO</p><h3>{stats.total}</h3></div>
          </div>

          {/* Appointments */}
          <div id="appointment-list" className="appointments-list">
            {appointments.length === 0 ? (
              <p style={{ color: '#a1a1aa', padding: '20px', textAlign: 'center' }}>Trenutno nema zakazanih termina u bazi.</p>
            ) : appointments.map(appt => (
              <div key={appt.id} className={`appointment-card ${appt.status === 'Završen' ? 'completed' : ''}`} style={{ display: 'flex', padding: '15px', background: '#1e293b', marginBottom: '10px', borderRadius: '8px', alignItems: 'center' }}>
                <div style={{ width: '70px', fontWeight: 'bold', color: '#6366f1' }}>{appt.time}</div>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ margin: 0, color: '#fafafa' }}>{appt.customer_name}</h4>
                  <p style={{ margin: '4px 0 0', color: '#a1a1aa', fontSize: '0.85rem' }}>{appt.service} — {formatDate(appt.date)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {appt.status === 'Na čekanju' ? (
                    <>
                      <button onClick={() => handleAccept(appt.id)} style={{ padding: '5px 10px', background: '#4ade80', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#000', fontWeight: 'bold' }}>Prihvati</button>
                      <button onClick={() => handleReject(appt.id)} style={{ padding: '5px 10px', background: '#f87171', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#fff', fontWeight: 'bold' }}>Odbij</button>
                    </>
                  ) : appt.status === 'Prihvaćen' ? (
                    <button className="btn-complete" onClick={() => handleComplete(appt.id)} style={{ padding: '5px 10px', background: '#4ade80', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#000', fontWeight: 'bold' }}>Završi</button>
                  ) : appt.status === 'Odbijen' ? (
                    <span style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 'bold' }}>ODBIJEN</span>
                  ) : (
                    <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 'bold' }}>ISPLAĆENO</span>
                  )}
                  <button onClick={() => handleDeleteClick(appt.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.5rem', lineHeight: '1', padding: '0 5px' }}>×</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modalovi */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={e => { if (e.target.className.includes('modal-overlay')) setIsModalOpen(false); }}>
          <div className="modal-content" style={{ background: '#1e293b', padding: '30px', borderRadius: '8px', width: '400px', border: '1px solid #4a5568' }}>
            <h2 style={{ marginTop: 0, color: '#fafafa' }}>Novi termin</h2>
            <input type="text" name="custName" placeholder="Ime klijenta" value={formData.custName} onChange={handleInputChange} style={{ width: '100%', padding: '10px', marginBottom: '15px', background: '#2d3748', border: '1px solid #4a5568', borderRadius: '4px', color: 'white', boxSizing: 'border-box' }} />
            <select name="serviceSelect" value={formData.service} onChange={handleInputChange} style={{ width: '100%', padding: '10px', marginBottom: '15px', background: '#2d3748', border: '1px solid #4a5568', borderRadius: '4px', color: 'white', boxSizing: 'border-box' }}>
              <option value="">Izaberite uslugu</option>
              {services.length === 0 ? <option value="">Prvo dodajte usluge u meniju!</option> : services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <input type="date" name="appDate" value={formData.date || ''} onChange={handleInputChange} style={{ width: '100%', padding: '10px', marginBottom: '15px', background: '#2d3748', border: '1px solid #4a5568', borderRadius: '4px', color: 'white', boxSizing: 'border-box' }} />
            <input type="time" name="appTime" value={formData.time || ''} onChange={handleInputChange} style={{ width: '100%', padding: '10px', marginBottom: '20px', background: '#2d3748', border: '1px solid #4a5568', borderRadius: '4px', color: 'white', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', background: '#4b5563', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Odustani</button>
              <button className="btn-primary" onClick={handleSaveAppointment} style={{ padding: '10px 20px', background: '#6366f1', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Sačuvaj</button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: '#1e293b', padding: '30px', borderRadius: '8px', width: '300px', textAlign: 'center', border: '1px solid #4a5568' }}>
            <p style={{ color: '#fafafa', marginBottom: '20px' }}>Da li ste sigurni da želite da obrišete ovaj termin?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={handleConfirmDelete} style={{ padding: '8px 20px', background: '#ef4444', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Da</button>
              <button onClick={() => setShowConfirm(false)} style={{ padding: '8px 20px', background: '#4b5563', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Ne</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Admin;