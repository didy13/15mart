import '../../public/css/style.css'; // Verify this path is correct
import Head from '../components/Head';
import Nav from '../components/Nav';
import { useState } from 'react';

function Admin() {
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for statistics (you can update these later)
  const [stats, setStats] = useState({
    revenue: 0,
    customers: 0,
    total: 0
  });

  // State for form data
  const [formData, setFormData] = useState({
    custName: '',
    service: '',
    date: '',
    time: ''
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle save appointment
  const handleSaveAppointment = () => {
    console.log('Saving appointment:', formData);
    // Add your save logic here
    setIsModalOpen(false);
    // Reset form
    setFormData({
      custName: '',
      service: '',
      date: '',
      time: ''
    });
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
              className="btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              + Novi termin
            </button>
          </header>
          
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
          
          <div id="appointment-list">
            {/* Appointment list will go here */}
          </div>
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="modal-overlay"
          onClick={(e) => {
            // Close modal when clicking overlay
            if (e.target.className === 'modal-overlay') {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="modal-content">
            <h2>Novi termin</h2>
            
            <input
              type="text"
              id="custName"
              placeholder="Ime klijenta"
              value={formData.custName}
              onChange={handleInputChange}
            />
            
            <select
              id="serviceSelect"
              value={formData.service}
              onChange={handleInputChange}
            >
              <option value="">Izaberite uslugu</option>
              <option value="sisanje">Šišanje</option>
              <option value="brijanje">Brijanje</option>
              <option value="farbanje">Farbanje</option>
            </select>
            
            <input
              type="date"
              id="appDate"
              value={formData.date}
              onChange={handleInputChange}
            />
            
            <input
              type="time"
              id="appTime"
              value={formData.time}
              onChange={handleInputChange}
            />
            
            <button
              className="btn-primary"
              id="saveBtn"
              onClick={handleSaveAppointment}
            >
              Sačuvaj
            </button>
            
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                marginTop: "10px",
                width: "100%"
              }}
            >
              Odustani
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Admin;