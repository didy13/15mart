async function load() {
    const res = await fetch('/api/services');
    const data = await res.json();
    document.getElementById('cService').innerHTML = data.map(s => `<option value="${s.name}">${s.name} (${s.price} RSD)</option>`).join('');
}
async function book() {
    const body = { customer_name: document.getElementById('cName').value, service: document.getElementById('cService').value, date: document.getElementById('cDate').value, time: document.getElementById('cTime').value };
    const res = await fetch('/api/appointments', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    if(res.ok) { document.getElementById('booking-form').style.display='none'; document.getElementById('success-msg').style.display='block'; }
}
load();