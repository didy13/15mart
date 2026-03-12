async function loadServices() {
    const res = await fetch('/api/services');
    const data = await res.json();
    const select = document.getElementById('cService');
    if (data.length === 0) {
        select.innerHTML = '<option value="">Trenutno nema usluga</option>';
        select.disabled = true;
    } else {
        select.innerHTML = data.map(s => `<option value="${s.name}">${s.name} (${s.price} RSD)</option>`).join('');
        select.disabled = false;
    }
}

// Generisanje vremenskih slotova na osnovu rasporeda i zauzetih termina
async function loadAvailableTimes() {
    const dateInput = document.getElementById('cDate');
    const timeSelect = document.getElementById('cTime');
    const date = dateInput.value;
    if (!date) {
        timeSelect.innerHTML = '<option value="">Prvo izaberite datum</option>';
        timeSelect.disabled = true;
        return;
    }

    // Dohvati raspored za taj dan
    const scheduleRes = await fetch(`/api/schedules?date=${date}`);
    const schedules = await scheduleRes.json();
    if (schedules.length === 0) {
        timeSelect.innerHTML = '<option value="">Nema rasporeda za ovaj dan</option>';
        timeSelect.disabled = true;
        return;
    }
    const schedule = schedules[0]; // uzmi prvi (ako ih ima više, može se doraditi)

    // Dohvati već zakazane termine za taj dan
    const appRes = await fetch(`/api/appointments?date=${date}`);
    const appointments = await appRes.json();
    const bookedTimes = appointments.map(a => a.time);

    // Generiši slotove
    const start = schedule.start_time;
    const end = schedule.end_time;
    const duration = schedule.slot_duration;

    const slots = generateTimeSlots(start, end, duration);
    const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

    if (availableSlots.length === 0) {
        timeSelect.innerHTML = '<option value="">Nema slobodnih termina</option>';
        timeSelect.disabled = true;
    } else {
        timeSelect.innerHTML = availableSlots.map(slot => `<option value="${slot}">${slot}</option>`).join('');
        timeSelect.disabled = false;
    }
}

function generateTimeSlots(start, end, durationMinutes) {
    const slots = [];
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    let current = new Date();
    current.setHours(startHour, startMin, 0, 0);
    const endDate = new Date();
    endDate.setHours(endHour, endMin, 0, 0);

    while (current < endDate) {
        const hours = current.getHours().toString().padStart(2, '0');
        const minutes = current.getMinutes().toString().padStart(2, '0');
        slots.push(`${hours}:${minutes}`);
        current.setMinutes(current.getMinutes() + durationMinutes);
    }
    return slots;
}

async function book() {
    const name = document.getElementById('cName').value;
    const service = document.getElementById('cService').value;
    const date = document.getElementById('cDate').value;
    const time = document.getElementById('cTime').value;

    if (!name || !service || !date || !time) {
        alert("Sva polja su obavezna!");
        return;
    }

    const body = { customer_name: name, service, date, time };
    const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (res.ok) {
        document.getElementById('booking-form').style.display = 'none';
        document.getElementById('success-msg').style.display = 'block';
    } else {
        alert('Došlo je do greške pri zakazivanju.');
    }
}

// Postavi minimalni datum na danas
const today = new Date().toISOString().split('T')[0];
document.getElementById('cDate').setAttribute('min', today);

// Event listener za promenu datuma
document.getElementById('cDate').addEventListener('change', loadAvailableTimes);

// Inicijalno učitavanje usluga
loadServices();