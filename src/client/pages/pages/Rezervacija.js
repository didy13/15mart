import '../../public/css/style.css';
import { useState, useEffect } from 'react';
import Head from '../components/Head';
import clientStyles from '../../public/css/client-style.module.css';

function Rezervacija() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for form data
  const [formData, setFormData] = useState({
    cName: '',
    cService: '',
    cDate: '',
    cTime: ''
  });
  // State for UI visibility
  const [showSuccess, setShowSuccess] = useState(false);
  // State for loading
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    // First validate
    const isValid = validateForm();
    
    // Then book if valid
    if (isValid) {
      book2();
    }
  };
  

  // Handle input changes
   async function loadServices() {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:3001/api/services');
        
        if (!res.ok) {
          throw new Error('Failed to load services');
        }
        
        const data = await res.json();
        setServices(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error loading services:', err);
      } finally {
        setLoading(false);
      }
  }

  // Book function - replaces document.getElementById calls
  async function book2() {
    setIsSubmitting(true); // or setIsLoading(true) - be consistent
    
    try {
      // Find the selected service to get its price
      const selectedService = services.find(s => s.name === formData.cService);
      
      const body = { 
        customer_name: formData.name,
        service: formData.service,
        date: formData.date,
        time: formData.time
      };
      
      console.log(body);

      const res = await fetch('http://localhost:3001/api/appointments', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body) 
      });
      
      if (res.ok) { 
        setShowSuccess(true);
        // Clear form or show success message
      } else {
        // Handle error response
        console.error('Booking failed');
      }
    } catch (error) {
      console.error('Error booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Check if all fields are filled
    if (!formData.name) {
      newErrors.name = 'Ime je obavezno';
    }
    
    if (!formData.service) {
      newErrors.service = 'Izaberite uslugu';
    }
    
    if (!formData.date) {
      newErrors.date = 'Izaberite datum';
    }
    
    if (!formData.time) {
      newErrors.time = 'Izaberite vreme';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  // Reset form for new booking
  const resetForm = () => {
    setIsSuccess(false);
    setFormData({
      name: '',
      service: '',
      date: '',
      time: ''
    });
    setErrors({});
  };

  useEffect(() => {
    loadServices();
  }, []);

  return (
    <>
    <div className={clientStyles['body-rezervacija']}>
      <Head pageTitle="Zakaži" styleTitle="client-style" />
      
      <div className={clientStyles['client-card']}>
        <a href="/">
          <div className={clientStyles['logo']}>Zakaži<span>SE</span></div>
        </a>
        
        {!isSuccess ? (
          <div id="booking-form">
            {/* Show general error message if needed */}
            {Object.keys(errors).length > 0 && (
              <div style={{
                backgroundColor: '#fee',
                color: '#c00',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px',
                fontSize: '14px'
              }}>
                Molimo popunite sva polja
              </div>
            )}
            
            {/* Name input with error */}
            <div style={{ marginBottom: '15px' }}>
              <input 
                type="text" 
                id="name" 
                placeholder="Vaše ime" 
                value={formData.name}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#2d3748',
                  border: errors.name ? '2px solid #fc8181' : '1px solid #4a5568',
                  borderRadius: '4px',
                  color: 'white',
                  boxSizing: 'border-box'
                }}
              />
              {errors.name && (
                <p style={{ color: '#fc8181', fontSize: '12px', marginTop: '5px' }}>
                  {errors.name}
                </p>
              )}
            </div>
            
            {/* Service select with error */}
            <div style={{ marginBottom: '15px' }}>
            <select 
              id="service" 
              className="services"
              value={formData.service}
              onChange={handleInputChange}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                background: '#2d3748',
                border: errors.service ? '2px solid #fc8181' : '1px solid #4a5568',
                borderRadius: '4px',
                color: 'white',
                boxSizing: 'border-box'
              }}
            >
              {loading ? (
                <option value="">Učitavanje usluga...</option>
              ) : services.length === 0 ? (
                <option value="" disabled>Trenutno nema dostupnih usluga</option>
              ) : (
                <>
                  <option value="">Izaberite uslugu</option>
                  {services.map(service => (
                    <option key={service.id} value={service.name}>
                      {service.name} {service.price ? `(${service.price} RSD)` : ''}
                    </option>
                  ))}
                </>
              )}
            </select>
              {errors.service && (
                <p style={{ color: '#fc8181', fontSize: '12px', marginTop: '5px' }}>
                  {errors.service}
                </p>
              )}
            </div>
            
            {/* Date input with error */}
            <div style={{ marginBottom: '15px' }}>
              <input 
                type="date" 
                id="date" 
                value={formData.date}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#2d3748',
                  border: errors.date ? '2px solid #fc8181' : '1px solid #4a5568',
                  borderRadius: '4px',
                  color: 'white',
                  boxSizing: 'border-box'
                }}
              />
              {errors.date && (
                <p style={{ color: '#fc8181', fontSize: '12px', marginTop: '5px' }}>
                  {errors.date}
                </p>
              )}
            </div>
            
            {/* Time input with error */}
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="time" 
                id="time" 
                value={formData.time}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#2d3748',
                  border: errors.time ? '2px solid #fc8181' : '1px solid #4a5568',
                  borderRadius: '4px',
                  color: 'white',
                  boxSizing: 'border-box'
                }}
              />
              {errors.time && (
                <p style={{ color: '#fc8181', fontSize: '12px', marginTop: '5px' }}>
                  {errors.time}
                </p>
              )}
            </div>
            
            {/* Submit button */}
            <button 
              className={clientStyles['btn-book']} 
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'Slanje...' : 'Potvrdi'}
            </button>
          </div>
        ) : (
          <div id="success-msg" style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '15px' }}>Uspešno! 🎉</h2>
            <p style={{ marginBottom: '20px', color: '#a0aec0' }}>
              Vaš termin je zakazan za <br />
              <strong>{formData.date}</strong> u <strong>{formData.time}</strong>
            </p>
            <button 
              onClick={resetForm}
              style={{
                background: "none", 
                border: "1px solid #27272a", 
                color: "white", 
                padding: "10px 20px", 
                borderRadius: "10px", 
                marginTop: "10px", 
                cursor: "pointer", 
                width: "100%",
                transition: 'background 0.3s',
                fontSize: '16px'
              }}
              onMouseEnter={(e) => e.target.style.background = '#2d3748'}
              onMouseLeave={(e) => e.target.style.background = 'none'}
            >
              Zakaži ponovo
            </button>
          </div>
        )}
      </div>
      </div>
    </>
  );
}

export default Rezervacija;