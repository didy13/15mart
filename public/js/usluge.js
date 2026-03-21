async function load() {
    const res = await fetch('/api/services');
    const data = await res.json();
    document.getElementById('services-list').innerHTML = data.map(s => `
        <div class="appointment-card">
            <div style="flex-grow:1"><h4>${s.name}</h4><p>${s.price} RSD</p></div>
            <button onclick="del(${s.id})" style="color:red; background:none; border:none; cursor:pointer">Obriši</button>
        </div>
    `).join('');
}

async function saveService() {
    const body = { name: document.getElementById('sName').value, price: document.getElementById('sPrice').value };
    await fetch('/api/services', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    location.reload();
}

async function del(id) {
    await fetch(`/api/services/${id}`, {method:'DELETE'});
    load();
}

// Modal za dodavanje termina
document.getElementById('openModalBtnServices').onclick = async () => {
    document.getElementById('appointmentModalOverlay').style.display = 'flex';
    
    const servicesRes = await fetch('/api/services');
    const services = await servicesRes.json();
    const serviceSelect = document.getElementById('serviceSelect');
    if (services.length === 0) {
        serviceSelect.innerHTML = '<option value="">Prvo dodajte uslugu!</option>';
    } else {
        serviceSelect.innerHTML = services.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
    }

    const mastersRes = await fetch('/api/masters');
    const masters = await mastersRes.json();
    const masterSelect = document.getElementById('masterSelectServices');
    if (masters.length === 0) {
        masterSelect.innerHTML = '<option value="">Nema dostupnih majstora</option>';
    } else {
        masterSelect.innerHTML = '<option value="">Izaberite majstora (opciono)</option>' +
            masters.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
    }
};

document.getElementById('saveAppointmentBtn').onclick = async () => {
    const name = document.getElementById('custName').value;
    const service = document.getElementById('serviceSelect').value;
    const master = document.getElementById('masterSelectServices').value;
    const date = document.getElementById('appDate').value;
    const time = document.getElementById('appTime').value;

    if (!name || !service || !date || !time) {
        alert("Ime, usluga, datum i vreme su obavezni!");
        return;
    }

    const body = { customer_name: name, service, master_name: master || null, date, time };
    
    const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (response.ok) {
        document.getElementById('appointmentModalOverlay').style.display = 'none';
        document.getElementById('custName').value = '';
        document.getElementById('appDate').value = '';
        document.getElementById('appTime').value = '';
        alert('Termin uspešno dodat!');
    } else {
        alert('Došlo je do greške.');
    }
};

window.onclick = function(event) {
    const modal = document.getElementById('appointmentModalOverlay');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

load();