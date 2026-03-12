import '../../public/css/style.css';
import Head from '../components/Head';
import { useState } from 'react';

function Rezervacija() {
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock book function
  const book = () => {
    // Add your booking logic here
    setIsSuccess(true);
  };

  return (
    <>
      <Head pageTitle="Zakaži" styleTitle="client-style" />
      
      <div className="client-card">
        <a href="/">
          <div className="logo">Zakaži<span>SE</span></div>
        </a>
        
        {!isSuccess ? (
          <div id="booking-form">
            <input type="text" id="cName" placeholder="Vaše ime" />
            <select id="cService">
              <option value="">Izaberite uslugu</option>
              {/* Add your service options here */}
            </select>
            <input type="date" id="cDate" />
            <input type="time" id="cTime" />
            <button className="btn-book" onClick={book}>
              Potvrdi
            </button>
          </div>
        ) : (
          <div id="success-msg">
            <h2>Uspešno! 🎉</h2>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                background: "none", 
                border: "1px solid #27272a", 
                color: "white", 
                padding: "10px", 
                borderRadius: "10px", 
                marginTop: "20px", 
                cursor: "pointer", 
                width: "100%"
              }}
            >
              Zakaži ponovo
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Rezervacija;