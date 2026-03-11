async function loadDashboard() {
    try {
        // 1. Učitaj statistiku
        const statsRes = await fetch('/api/stats');
        const stats = await statsRes.json();
        
        document.getElementById('stat-revenue').innerText = `${stats.revenue || 0} RSD`;
        document.getElementById('stat-customers').innerText = stats.customers || 0;
        document.getElementById('stat-total').innerText = stats.total || 0;

        // 2. Učitaj termine
        const aRes = await fetch('/api/appointments');
        const appointments = await aRes.json();
        const list = document.getElementById('appointment-list');
        
        if (appointments.length === 0) {
            list.innerHTML = '<p style="color: #a1a1aa; padding: 20px; text-align: center;">Trenutno nema zakazanih termina u bazi.</p>';
            return;
        }

        list.innerHTML = appointments.map(a => `
            <div class="appointment-card ${a.status === 'Završen' ? 'completed' : ''}">
                <div style="width: 70px; font-weight: bold; color: #6366f1;">${a.time}</div>
                <div style="flex-grow: 1;">
                    <h4 style="margin: 0; color: #fafafa;">${a.customer_name}</h4>
                    <p style="margin: 4px 0 0; color: #a1a1aa; font-size: 0.85rem;">${a.service} — ${a.date}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    ${a.status === 'Na čekanju' 
                        ? `<button class="btn-complete" onclick="complete(${a.id})">Završi</button>` 
                        : '<span style="color: #4ade80; font-size: 0.8rem; font-weight: bold;">ISPLAĆENO</span>'}
                    <button onclick="del(${a.id})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.2rem;">&times;</button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Greška pri učitavanju dashboard-a:", err);
    }
}

// Funkcija za završavanje termina
async function complete(id) {
    await fetch(`/api/appointments/${id}/complete`, { method: 'PUT' });
    loadDashboard();
}

// Funkcija za brisanje termina
async function del(id) {
    if (confirm("Da li ste sigurni da želite da obrišete ovaj termin?")) {
        await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
        loadDashboard();
    }
}

// Otvaranje modala i punjenje dropdown-a
document.getElementById('openModalBtn').onclick = async () => {
    document.getElementById('modalOverlay').style.display = 'flex';
    const res = await fetch('/api/services');
    const services = await res.json();
    const select = document.getElementById('serviceSelect');
    
    if (services.length === 0) {
        select.innerHTML = '<option value="">Prvo dodajte usluge u meniju!</option>';
    } else {
        select.innerHTML = services.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
    }
};

// Čuvanje novog termina
document.getElementById('saveBtn').onclick = async () => {
    const name = document.getElementById('custName').value;
    const service = document.getElementById('serviceSelect').value;
    const date = document.getElementById('appDate').value;
    const time = document.getElementById('appTime').value;

    if (!name || !service || !date || !time) {
        alert("Sva polja su obavezna!");
        return;
    }

    const body = { customer_name: name, service, date, time };
    
    await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    document.getElementById('modalOverlay').style.display = 'none';
    // Resetuj polja
    document.getElementById('custName').value = '';
    loadDashboard();
};

// Pokreni učitavanje
loadDashboard();