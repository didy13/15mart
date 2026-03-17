import '../../public/css/style.css'; 
import Head from '../components/Head';
import Nav from '../components/Nav';
import { useState, useEffect } from 'react';



function Admin() {
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for statistics
  const [stats, setStats] = useState({
    revenue: 0,
    customers: 0,
    total: 0
  });

  // State for appointments
  const [appointments, setAppointments] = useState([]);
  
  // State for services dropdown
  const [services, setServices] = useState([]);

  // State for delete confirmation
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errors, setErrors] = useState({});

  // State for form data
  const [formData, setFormData] = useState({
    custName: '',
    service: '',
    date: '',
    time: ''
  });

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboard();
    loadServices();
  }, []);

  // Load dashboard data (stats and appointments)
  const loadDashboard = async () => {
    try {
      // 1. Load statistics
      const statsRes = await fetch('http://localhost:3001/api/stats');
      const statsData = await statsRes.json();
      
      setStats({
        revenue: statsData.revenue || 0,
        customers: statsData.customers || 0,
        total: statsData.total || 0
      });

      // 2. Load appointments
      const aRes = await fetch('http://localhost:3001/api/appointments');
      const appointmentsData = await aRes.json();
      setAppointments(appointmentsData);
    } catch (err) {
      console.error("Greška pri učitavanju dashboard-a:", err);
    }
  };

  // Load services for dropdown
  const loadServices = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/services');
      const servicesData = await res.json();
      setServices(servicesData);
    } catch (err) {
      console.error("Greška pri učitavanju usluga:", err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Map the input names to formData properties
    const nameToStateMap = {
      'custName': 'custName',
      'serviceSelect': 'service',
      'appDate': 'date',
      'appTime': 'time'
    };
    
    const stateKey = nameToStateMap[name];
    
    if (stateKey) {
      setFormData(prev => ({
        ...prev,
        [stateKey]: value
      }));
    }
  }

  // Handle save appointment
  const handleSaveAppointment = async () => {
    const { custName, service, date, time } = formData;

    if (!custName || !service || !date || !time) {
      alert("Sva polja su obavezna!");
      return;
    }

    try {
      const body = { 
        customer_name: custName, 
        service, 
        date, 
        time 
      };
      
      await fetch('http://localhost:3001/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      // Close modal and reset form
      setIsModalOpen(false);
      setFormData({
        custName: '',
        service: '',
        date: '',
        time: ''
      });
      
      // Reload dashboard to show new appointment
      loadDashboard();
    } catch (err) {
      console.error("Greška pri čuvanju termina:", err);
    }
  };

  // Handle complete appointment
  const handleComplete = async (id) => {
    try {
      await fetch(`http://localhost:3001/api/appointments/${id}/complete`, { method: 'PUT' });
      loadDashboard();
    } catch (err) {
      console.error("Greška pri završavanju termina:", err);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      await fetch(`http://localhost:3001/api/appointments/${deleteId}`, { method: 'DELETE' });
      setShowConfirm(false);
      loadDashboard();
    } catch (err) {
      console.error("Greška pri brisanju termina:", err);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('sr-RS', options);
  };
    

  return (
    <>
      <Head pageTitle="Admin" styleTitle="admin-style" />
      
      <div className="app-container">
        <Nav/>
        
        <main className="main-content">
          <header style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem"
          }}>
            <h1>Dashboard</h1>
            <button 
              id="openModalBtn"
              className="btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              + Novi termin
            </button>
          </header>
          
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <p>PRIHOD</p>
              <h3 id="stat-revenue">{stats.revenue} RSD</h3>
            </div>
            <div className="stat-card">
              <p>KLIJENTI</p>
              <h3 id="stat-customers">{stats.customers}</h3>
            </div>
            <div className="stat-card">
              <p>UKUPNO</p>
              <h3 id="stat-total">{stats.total}</h3>
            </div>
          </div>
          
          {/* Appointments List */}
          <div id="appointment-list" className="appointments-list">
            {appointments.length === 0 ? (
              <p style={{ color: '#a1a1aa', padding: '20px', textAlign: 'center' }}>
                Trenutno nema zakazanih termina u bazi.
              </p>
            ) : (
              appointments.map(appointment => (
                <div 
                  key={appointment.id}
                  className={`appointment-card ${appointment.status === 'Završen' ? 'completed' : ''}`}
                  style={{ 
                    display: 'flex', 
                    padding: '15px', 
                    background: '#1e293b', 
                    marginBottom: '10px', 
                    borderRadius: '8px',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ width: '70px', fontWeight: 'bold', color: '#6366f1' }}>
                    {appointment.time}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ margin: 0, color: '#fafafa' }}>{appointment.customer_name}</h4>
                    <p style={{ margin: '4px 0 0', color: '#a1a1aa', fontSize: '0.85rem' }}>
                      {appointment.service} — {formatDate(appointment.date)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {appointment.status === 'Na čekanju' ? (
                      <button 
                        className="btn-complete"
                        onClick={() => handleComplete(appointment.id)}
                        style={{ 
                          padding: '5px 10px', 
                          background: '#4ade80', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          color: '#000',
                          fontWeight: 'bold'
                        }}
                      >
                        Završi
                      </button>
                    ) : (
                      <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        ISPLAĆENO
                      </span>
                    )}
                    <button 
                      onClick={() => handleDeleteClick(appointment.id)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#ef4444', 
                        cursor: 'pointer', 
                        fontSize: '1.5rem',
                        lineHeight: '1',
                        padding: '0 5px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Add Appointment Modal */}
      {isModalOpen && (
        <div 
          id="modalOverlay"
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={(e) => {
            if (e.target.className === 'modal-overlay' || e.target.id === 'modalOverlay') {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="modal-content" style={{
            background: '#1e293b',
            padding: '30px',
            borderRadius: '8px',
            width: '400px',
            border: '1px solid #4a5568'
          }}>
            <h2 style={{ marginTop: 0, color: '#fafafa' }}>Novi termin</h2>
            
            <input
              type="text"
              name="custName"
              placeholder="Ime klijenta"
              value={formData.custName}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                background: '#2d3748',
                border: '1px solid #4a5568',
                borderRadius: '4px',
                color: 'white',
                boxSizing: 'border-box'
              }}
            />
            
            <select
              name="serviceSelect"
              value={formData.service}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                background: '#2d3748',
                border: '1px solid #4a5568',
                borderRadius: '4px',
                color: 'white',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Izaberite uslugu</option>
              {services.length === 0 ? (
                <option value="">Prvo dodajte usluge u meniju!</option>
              ) : (
                services.map(service => (
                  <option key={service.id} value={service.name}>
                    {service.name}
                  </option>
                ))
              )}
            </select>
            
            <input
              type="date"
              name="appDate"
              value={formData.date || ''}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                background: '#2d3748',
                border: '1px solid #4a5568',
                borderRadius: '4px',
                color: 'white',
                boxSizing: 'border-box'
              }}
            />
            
            <input
              type="time"
              name="appTime"
              value={formData.time || ''}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '20px',
                background: '#2d3748',
                border: '1px solid #4a5568',
                borderRadius: '4px',
                color: 'white',
                boxSizing: 'border-box'
              }}
            />
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '10px 20px',
                  background: '#4b5563',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Odustani
              </button>
              <button
                className="btn-primary"
                id="saveBtn"
                onClick={handleSaveAppointment}
                style={{
                  padding: '10px 20px',
                  background: '#6366f1',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Sačuvaj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: '#1e293b',
            padding: '30px',
            borderRadius: '8px',
            width: '300px',
            textAlign: 'center',
            border: '1px solid #4a5568'
          }}>
            <p style={{ color: '#fafafa', marginBottom: '20px' }}>
              Da li ste sigurni da želite da obrišete ovaj termin?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: '8px 20px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Da
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '8px 20px',
                  background: '#4b5563',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Ne
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Admin;