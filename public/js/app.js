// Global variable to store current filter date
let currentFilterDate = '';

// Load available dates for the filter dropdown
async function loadDateFilter() {
    try {
        const res = await fetch('/api/schedules/dates');
        const dates = await res.json();
        const select = document.getElementById('filterDate');
        // Keep the "Svi datumi" option
        select.innerHTML = '<option value="">Svi datumi</option>';
        dates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            // Format date for display (optional)
            const dateObj = new Date(date + 'T00:00:00');
            option.textContent = dateObj.toLocaleDateString('sr-RS');
            select.appendChild(option);
        });
        // Add event listener
        select.addEventListener('change', (e) => {
            currentFilterDate = e.target.value;
            loadDashboard(currentFilterDate);
        });
    } catch (err) {
        console.error('Greška pri učitavanju datuma:', err);
    }
}

async function loadDashboard(dateFilter = '') {
    try {
        // Build URL with optional date filter
        let url = '/api/appointments';
        if (dateFilter) {
            url += `?date=${dateFilter}`;
        }
        
        // 1. Učitaj statistiku (always overall, not filtered)
        const statsRes = await fetch('/api/stats');
        const stats = await statsRes.json();
        
        document.getElementById('stat-revenue').innerText = `${stats.revenue || 0} RSD`;
        document.getElementById('stat-customers').innerText = stats.customers || 0;
        document.getElementById('stat-total').innerText = stats.total || 0;

        // 2. Učitaj termine (filtered by date if selected)
        const aRes = await fetch(url);
        const appointments = await aRes.json();
        const list = document.getElementById('appointment-list');
        
        if (appointments.length === 0) {
            list.innerHTML = '<p style="color: #a1a1aa; padding: 20px; text-align: center;">Nema zakazanih termina' + 
                (dateFilter ? ' za izabrani datum.' : ' u bazi.') + '</p>';
            return;
        }

        list.innerHTML = appointments.map(a => {
            const status = a.status || 'Na čekanju'; 
            let actionButtons = '';
            
            if (status === 'Na čekanju') {
                actionButtons = `
                    <button class="btn-complete" style="background: #3b82f6;" onclick="acceptApp(${a.id})">Prihvati</button>
                    <button class="btn-complete" style="background: #ef4444;" onclick="cancelApp(${a.id})">Otkaži</button>
                `;
            } else if (status === 'Prihvaćen') {
                actionButtons = `
                    <button class="btn-complete" onclick="complete(${a.id})">Završi</button>
                    <button class="btn-complete" style="background: #ef4444;" onclick="cancelApp(${a.id})">Otkaži</button>
                `;
            } else if (status === 'Otkazan') {
                actionButtons = `<span style="color: #ef4444; font-size: 0.8rem; font-weight: bold;">OTKAZANO</span>`;
            } else if (status === 'Završen') {
                actionButtons = `<span style="color: #4ade80; font-size: 0.8rem; font-weight: bold;">ISPLAĆENO</span>`;
            }

            return `
            <div class="appointment-card ${status === 'Završen' ? 'completed' : ''}" style="${status === 'Otkazan' ? 'opacity: 0.5;' : ''}">
                <div style="width: 70px; font-weight: bold; color: ${status === 'Otkazan' ? '#ef4444' : '#6366f1'};">${a.time}</div>
                <div style="flex-grow: 1;">
                    <h4 style="margin: 0; color: #fafafa;">${a.customer_name}</h4>
                    <p style="margin: 4px 0 0; color: #a1a1aa; font-size: 0.85rem;">${a.service} — ${a.date}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    ${actionButtons}
                    <button onclick="del(${a.id})" style="background: none; border: none; color: #52525b; cursor: pointer; font-size: 1.5rem; margin-left: 10px;" title="Obriši trajno">&times;</button>
                </div>
            </div>
            `;
        }).join('');
    } catch (err) {
        console.error("Greška pri učitavanju dashboard-a:", err);
    }
}

// Funkcija za završavanje termina (Plaćeno)
async function complete(id) {
    await fetch(`/api/appointments/${id}/complete`, { method: 'PUT' });
    loadDashboard(currentFilterDate);
}

// Funkcija za prihvatanje termina
async function acceptApp(id) {
    await fetch(`/api/appointments/${id}/accept`, { method: 'PUT' });
    loadDashboard(currentFilterDate);
}

// Funkcija za otkazivanje termina
async function cancelApp(id) {
    if (confirm("Da li ste sigurni da želite da otkažete ovaj termin?")) {
        await fetch(`/api/appointments/${id}/cancel`, { method: 'PUT' });
        loadDashboard(currentFilterDate);
    }
}

// Funkcija za trajno brisanje termina (crveno X)
async function del(id) {
    if (confirm("Da li ste sigurni da želite trajno da obrišete ovaj termin iz baze?")) {
        await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
        loadDashboard(currentFilterDate);
    }
}

// Otvaranje modala za novi termin (Admin panel)
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

// Čuvanje novog termina iz admin panela
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
    document.getElementById('custName').value = '';
    // Reload with current filter
    loadDashboard(currentFilterDate);
    // Also refresh date filter dropdown (new date might appear if schedule exists)
    loadDateFilter();
};

// Pokretanje
loadDateFilter();
loadDashboard();