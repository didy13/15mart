async function loadSchedules() {
    const res = await fetch('/api/schedules');
    const schedules = await res.json();
    const list = document.getElementById('schedules-list');
    if (schedules.length === 0) {
        list.innerHTML = '<p style="color: #a1a1aa; padding: 20px; text-align: center;">Nema definisanih rasporeda.</p>';
        return;
    }
    list.innerHTML = schedules.map(s => {
        const dateObj = new Date(s.date + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('sr-RS');
        return `
        <div class="appointment-card">
            <div style="flex-grow:1">
                <h4 style="margin:0;">${formattedDate}</h4>
                <p style="margin:4px 0 0; color: #a1a1aa;">${s.start_time} - ${s.end_time} (svakih ${s.slot_duration} min)</p>
            </div>
            <button onclick="deleteSchedule(${s.id})" style="color:red; background:none; border:none; cursor:pointer; font-size:1.2rem;">Obriši</button>
        </div>
        `;
    }).join('');
}

async function saveSchedule() {
    const date = document.getElementById('scheduleDate').value;
    const start = document.getElementById('startTime').value;
    const end = document.getElementById('endTime').value;
    const duration = document.getElementById('slotDuration').value;

    if (!date || !start || !end || !duration) {
        alert('Sva polja su obavezna!');
        return;
    }
    if (start >= end) {
        alert('Krajnje vreme mora biti posle početnog!');
        return;
    }

    const body = { date, start_time: start, end_time: end, slot_duration: parseInt(duration) };
    const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (res.ok) {
        document.getElementById('modalOverlay').style.display = 'none';
        loadSchedules();
    } else {
        alert('Greška pri čuvanju.');
    }
}

async function deleteSchedule(id) {
    if (confirm('Da li ste sigurni da želite da obrišete ovaj raspored?')) {
        await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
        loadSchedules();
    }
}

document.getElementById('openModalBtn').onclick = () => {
    document.getElementById('modalOverlay').style.display = 'flex';
    // Reset polja
    document.getElementById('scheduleDate').value = '';
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
    document.getElementById('slotDuration').value = '30';
};

document.getElementById('saveScheduleBtn').onclick = saveSchedule;

// Zatvaranje modala klikom na pozadinu
window.onclick = function(event) {
    const modal = document.getElementById('modalOverlay');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

loadSchedules();