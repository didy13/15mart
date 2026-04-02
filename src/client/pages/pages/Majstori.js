import '../../public/css/style.css';
import Head from '../components/Head';
import Nav from '../components/Nav';
import adminStyles from '../../public/css/admin-style.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Majstori() {
  const navigate = useNavigate();
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State for loading and error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [masters, setMasters] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    image_url: ''
  });

  useEffect(() => {
    const bootstrap = async () => {
      const res = await fetch('http://localhost:3001/api/checkSession', { credentials: 'include' });
      const data = await res.json();
      if (!data.loggedIn || !data.isAdmin) {
        navigate('/signin');
        return;
      }
      loadMasters();
    };
    bootstrap();
  }, [navigate]);

  const loadMasters = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/masters');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setMasters(data);
    } catch (error) {
      console.error('Error loading masters:', error);
      setError('Failed to load masters');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id === 'masterName' ? 'name' : 'image_url']: value
    }));
  };

  const saveMaster = async () => {
    const name = formData.name?.trim();
    const image = formData.image_url?.trim();
    
    if (!name) {
      alert('Ime majstora je obavezno!');
      return;
    }
  
    const body = { 
      name, 
      image_url: image 
    };
  
    try {
      console.log('Sending request to:', 'http://localhost:3001/api/masters');
      console.log('With body:', body);
      
      const res = await fetch('http://localhost:3001/api/masters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
  
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      const responseText = await res.text();
      console.log('Response text:', responseText);
      
      try {
        JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', responseText);
        return;
      }
      
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: '', image_url: '' });
        loadMasters();
      }
    } catch (error) {
      console.error('Error saving master:', error);
      alert('Došlo je do greške pri čuvanju: ' + error.message);
    }
  };

  const deleteMaster = async (id) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovog majstora?')) {
      try {
        const res = await fetch(`http://localhost:3001/api/masters/${id}`, { method: 'DELETE', credentials: 'include' });
        if (res.ok) {
          loadMasters();
        } else {
          alert('Greška pri brisanju.');
        }
      } catch (error) {
        console.error('Error deleting master:', error);
        alert('Došlo je do greške pri brisanju.');
      }
    }
  };

  return (
    <>
      <div className={adminStyles['body-usluge']}>
        <Head pageTitle="Majstori" styleTitle="admin-style"/>
        <div className={adminStyles['app-container']}>
          <Nav/>
          
          <main className={adminStyles['main-content']}>
            <header style={{
              display: "flex", 
              justifyContent: "space-between", 
              marginBottom: "2rem"
            }}>
              <h1>Majstori</h1>
              <button 
                className={adminStyles['btn-primary']} 
                onClick={() => setIsModalOpen(true)}
              >
                + Novi majstor
              </button>
            </header>
            
            {/* Show loading state */}
            {isLoading && <p>Loading masters...</p>}
            
            {/* Show error if any */}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            
            <div id="masters-list">
              {masters.map(master => (
                <div className={adminStyles['appointment-card']} key={master.id}>
                  {master.image_url ? (
                    <img 
                      src={master.image_url} 
                      alt={master.name} 
                      style={{
                        width: '50px', 
                        height: '50px', 
                        borderRadius: '50%', 
                        objectFit: 'cover', 
                        marginRight: '15px'
                      }} 
                    />
                  ) : null}
                  <div style={{flexGrow: 1}}>
                    <h4 style={{margin: 0}}>{master.name}</h4>
                    {!master.image_url && (
                      <p style={{margin: '4px 0 0', color: '#a1a1aa'}}>(bez slike)</p>
                    )}
                  </div>
                  <button 
                    onClick={() => deleteMaster(master.id)} 
                    style={{
                      color: "red", 
                      background: "none", 
                      border: "none", 
                      cursor: "pointer",
                      fontSize: "1.2rem"
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
              if (e.target === e.currentTarget) {
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
              <h2>Dodaj majstora</h2>
              <input 
                type="text"
                id="masterName"
                placeholder="Ime i prezime" 
                value={formData.name}
                onChange={handleInputChange}
              />
              <input 
                type="text" 
                id="masterImage"
                placeholder="URL slike (opciono)" 
                value={formData.image_url}
                onChange={handleInputChange}
                style={{ marginTop: "10px" }}
              />
              <button 
                className={adminStyles['btn-primary']}
                onClick={saveMaster}
                style={{ marginTop: "10px" }}
              >
                Sačuvaj
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData({ name: '', image_url: '' });
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

export default Majstori;