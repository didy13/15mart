import '../../public/css/style.css';
import Head from '../components/Head';
import Nav from '../components/Nav';
import { useState } from 'react'; // Add this import

function Usluge() {
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State for form data
  const [serviceName, setServiceName] = useState('');

  // Save service function
  const saveService = () => {
    // Add your logic here
    console.log('Saving service:', serviceName);
    // Close modal after saving
    setIsModalOpen(false);
    // Clear input
    setServiceName('');
  };

  return (
    <>
      <Head pageTitle="Usluge" styleTitle="admin-style"/>
      <div className="app-container">
        <Nav/>
        
        
        <main className="main-content">
            <header style={{
              display: "flex", 
              justifyContent: "space-between", 
              marginBottom: "2rem"
            }}>
                <h1>Usluge</h1>
                <button 
                  className="btn-primary" 
                  onClick={() => setIsModalOpen(true)} // Fixed
                >
                  + Nova usluga
                </button>
            </header>
            
            <div id="services-list"></div>
        </main>
      </div>

      {/* Modal - conditionally rendered based on state */}
      {isModalOpen && (
        <div 
          id="modalOverlay" 
          className="modal-overlay"
          onClick={(e) => {
            // Close modal when clicking overlay
            if (e.target.className === 'modal-overlay') {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="modal-content">
            <h2>Dodaj uslugu</h2>
            <input 
              type="text" 
              id="sName" 
              placeholder="Naziv" 
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)} // Track input
            />
            <button 
              className="btn-primary" 
              onClick={saveService} // Fixed
            >
              Sačuvaj
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => setIsModalOpen(false)}
              style={{marginTop: "10px"}}
            >
              Otkaži
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Usluge;