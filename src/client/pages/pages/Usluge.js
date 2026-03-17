import '../../public/css/style.css';
import Head from '../components/Head';
import Nav from '../components/Nav';
import adminStyles from '../../public/css/admin-style.module.css';
import { useState, useEffect } from 'react';

function Usluge() {
  // State for services list
  const [services, setServices] = useState([]);
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State for form data
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  // State for loading and error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load services on component mount
  useEffect(() => {
    loadServices();
  }, []);

  // Load services from API
  const loadServices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add the port number to the URL
      const res = await fetch('http://localhost:3001/api/services');
      
      // Check if the response is OK (status in the range 200-299)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Save service to API
  const saveService = async () => {
    try {
      const body = { 
        name: serviceName, 
        price: servicePrice 
      };
      
      // Add the port number to the URL
      const res = await fetch('http://localhost:3001/api/services', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body) 
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      // Reload services list
      await loadServices();
      
      // Close modal and clear form
      setIsModalOpen(false);
      setServiceName('');
      setServicePrice('');
    } catch (error) {
      console.error('Error saving service:', error);
      setError(error.message);
    }
  };

  // Delete service
  const deleteService = async (id) => {
    try {
      // Add the port number to the URL
      const res = await fetch(`http://localhost:3001/api/services/${id}`, { 
        method: 'DELETE' 
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      await loadServices(); // Reload services after delete
    } catch (error) {
      console.error('Error deleting service:', error);
      setError(error.message);
    }
  };

  return (
    <>
    <div className={adminStyles['body-usluge']}>
      <Head pageTitle="Usluge" styleTitle="admin-style"/>
      <div className={adminStyles['app-container']}>
        <Nav/>
        
        <main className={adminStyles['main-content']}>
          <header style={{
            display: "flex", 
            justifyContent: "space-between", 
            marginBottom: "2rem"
          }}>
            <h1>Usluge</h1>
            <button 
              className={adminStyles['btn-primary']} 
              onClick={() => setIsModalOpen(true)}
            >
              + Nova usluga
            </button>
          </header>
          
          {/* Show loading state */}
          {isLoading && <p>Loading services...</p>}
          
          {/* Show error if any */}
          {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          
          <div id="services-list">
            {services.map(service => (
              <div className={adminStyles['appointment-card']} key={service.id}>
                <div style={{ flexGrow: 1 }}>
                  <h4>{service.name}</h4>
                  <p>{service.price} RSD</p>
                </div>
                <button 
                  onClick={() => deleteService(service.id)} 
                  style={{
                    color: "red", 
                    background: "none", 
                    border: "none", 
                    cursor: "pointer"
                  }}
                >
                  Obriši
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
      
      
      {/* Modal - conditionally rendered based on state */}
      {isModalOpen && (
        <div 
          id="modalOverlay" 
          className={adminStyles['modal-overlay']}
          onClick={(e) => {
            // Close modal when clicking overlay
            if (e.target.className === 'modal-overlay') {
              setIsModalOpen(false);
            }
          }}
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
        >
          <div className={adminStyles['modal-content']}>
            <h2>Dodaj uslugu</h2>
            <input 
              type="text" 
              placeholder="Naziv" 
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Cena" 
              value={servicePrice}
              onChange={(e) => setServicePrice(e.target.value)}
              style={{ marginTop: "10px" }}
            />
            <button 
              className={adminStyles['btn-primary']}
              onClick={saveService}
              style={{ marginTop: "10px" }}
            >
              Sačuvaj
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => {
                setIsModalOpen(false);
                setServiceName('');
                setServicePrice('');
              }}
              style={{ marginTop: "10px" }}
            >
              Otkaži
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default Usluge;