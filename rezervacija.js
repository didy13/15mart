// 1. Učitaj usluge u dropdown čim se stranica otvori
async function loadServicesForClient() {
    try {
        const res = await fetch('/api/services');
        const services = await res.json();
        const select = document.getElementById('clientService');
        
        if (services.length === 0) {
            select.innerHTML = '<option value="">Trenutno nema dostupnih usluga</option>';
            return;
        }

        select.innerHTML = '<option value="">-- Izaberite uslugu --</option>';
        services.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.name;
            opt.innerText = `${s.name} (${s.price} RSD)`;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error("Greška:", err);
    }
}

// 2. Funkcija za slanje rezervacije
async function bookAppointment() {
    const name = document.getElementById('clientName').value;
    const service = document.getElementById('clientService').value;
    const time = document.getElementById('clientTime').value;

    if (!name || !service || !time) {
        alert("Molimo vas da popunite sva polja.");
        return;
    }

    const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            customer_name: name,
            service: service,
            time: time
        })
    });

    if (response.ok) {
        // Sakrij formu i prikaži poruku o uspehu
        document.getElementById('booking-form').style.display = 'none';
        document.getElementById('success-msg').style.display = 'block';
    } else {
        alert("Došlo je do greške. Pokušajte ponovo.");
    }
}

// Pokreni učitavanje
loadServicesForClient();