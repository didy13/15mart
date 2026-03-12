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
async function del(id) { await fetch(`/api/services/${id}`, {method:'DELETE'}); load(); }
load();