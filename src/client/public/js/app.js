import { useState, useEffect } from 'react';

export const useAppointments = () => {
  const [stats, setStats] = useState({ revenue: 0, customers: 0, total: 0 });
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    service: '',
    date: '',
    time: ''
  });

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      const statsRes = await fetch('http://localhost:3001/api/stats');
      const statsData = await statsRes.json();
      setStats({
        revenue: statsData.revenue || 0,
        customers: statsData.customers || 0,
        total: statsData.total || 0
      });

      const aRes = await fetch('http://localhost:3001/api/appointments');
      const appointmentsData = await aRes.json();
      setAppointments(appointmentsData);
    } catch (err) {
      console.error("Greška pri učitavanju dashboard-a:", err);
    }
  };

  const loadServices = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/services');
      const servicesData = await res.json();
      setServices(servicesData);
    } catch (err) {
      console.error("Greška pri učitavanju usluga:", err);
    }
  };

  const completeAppointment = async (id) => {
    try {
      await fetch(`http://localhost:3001/api/appointments/${id}/complete`, { method: 'PUT' });
      await loadDashboard();
    } catch (err) {
      console.error("Greška pri završavanju termina:", err);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      await fetch(`http://localhost:3001/api/appointments/${deleteId}`, { method: 'DELETE' });
      setIsConfirmOpen(false);
      await loadDashboard();
    } catch (err) {
      console.error("Greška pri brisanju termina:", err);
    }
  };

  const openModal = async () => {
    setIsModalOpen(true);
    await loadServices();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ customer_name: '', service: '', date: '', time: '' });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const saveAppointment = async () => {
    const { customer_name, service, date, time } = formData;

    if (!customer_name || !service || !date || !time) {
      alert("Sva polja su obavezna!");
      return;
    }

    try {
      await fetch('http://localhost:3001/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      closeModal();
      await loadDashboard();
    } catch (err) {
      console.error("Greška pri čuvanju termina:", err);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return {
    stats,
    appointments,
    services,
    isModalOpen,
    isConfirmOpen,
    formData,
    completeAppointment,
    confirmDelete,
    handleDelete,
    openModal,
    closeModal,
    handleInputChange,
    saveAppointment,
    setIsConfirmOpen
  };
};