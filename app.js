async function loadAppointments() {
    const res = await fetch('/api/appointments');
    const data = await res.json();
    const list = document.getElementById('appointment-list');
    list.innerHTML = data.map(app => `
        <div class="appointment-card">
            <div class="time">${app.time}</div>
            <div class="info">
                <h4>${app.customer_name}</h4>
                <p>${app.service}</p>
            </div>
            <button onclick="deleteApp(${app.id})" class="btn-outline" style="color:red">Obriši</button>
        </div>
    `).join('');
}

async function populateDropdown() {
    const res = await fetch('/api/services');
    const services = await res.json();
    const select = document.getElementById('serviceSelect');
    select.innerHTML = services.map(s => `<option value="${s.name}">${s.name} (${s.price} RSD)</option>`).join('');
}

document.getElementById('saveBtn').onclick = async () => {
    const customer_name = document.getElementById('custName').value;
    const service = document.getElementById('serviceSelect').value;
    const time = document.getElementById('appTime').value;

    await fetch('/api/appointments', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ customer_name, service, time })
    });
    
    document.getElementById('modalOverlay').style.display = 'none';
    loadAppointments();
};

async function deleteApp(id) {
    if(confirm("Obriši?")) {
        await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
        loadAppointments();
    }
}

document.getElementById('openModalBtn').onclick = () => {
    document.getElementById('modalOverlay').style.display = 'flex';
    populateDropdown();
};
document.getElementById('closeModalBtn').onclick = () => document.getElementById('modalOverlay').style.display = 'none';

loadAppointments();