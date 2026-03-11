const serviceModal = document.getElementById('serviceModal');
const servicesList = document.getElementById('services-list');

// 1. Funkcija za otvaranje modala
function showServiceModal() {
    serviceModal.style.display = 'flex';
}

// 2. Funkcija za zatvaranje modala
function closeServiceModal() {
    serviceModal.style.display = 'none';
    // Resetuj polja nakon zatvaranja
    document.getElementById('sName').value = '';
    document.getElementById('sPrice').value = '';
}

// 3. Funkcija za učitavanje usluga sa servera
async function loadServices() {
    try {
        const res = await fetch('/api/services');
        const data = await res.json();
        
        servicesList.innerHTML = ''; // Isprazni listu

        if (data.length === 0) {
            servicesList.innerHTML = '<p>Nema dodatih usluga. Dodajte prvu!</p>';
            return;
        }

        data.forEach(service => {
            const div = document.createElement('div');
            div.className = 'appointment-card';
            div.innerHTML = `
                <div class="info">
                    <h4>${service.name}</h4>
                    <p>Cena: <strong>${service.price} RSD</strong></p>
                </div>
                <button onclick="deleteService(${service.id})" class="btn-outline" style="color: #ef4444; border-color: #fca5a5;">Obriši</button>
            `;
            servicesList.appendChild(div);
        });
    } catch (err) {
        console.error("Greška pri učitavanju:", err);
    }
}

// 4. Funkcija za čuvanje nove usluge
async function saveService() {
    const name = document.getElementById('sName').value;
    const price = document.getElementById('sPrice').value;

    if (!name || !price) {
        alert("Molimo popunite sva polja!");
        return;
    }

    try {
        const response = await fetch('/api/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price })
        });

        if (response.ok) {
            closeServiceModal(); // Zatvori prozor
            loadServices();      // Osveži listu na ekranu
        }
    } catch (err) {
        alert("Greška pri čuvanju usluge.");
    }
}

// 5. Funkcija za brisanje usluge
async function deleteService(id) {
    if (confirm("Da li želite da obrišete ovu uslugu?")) {
        await fetch(`/api/services/${id}`, { method: 'DELETE' });
        loadServices();
    }
}

// Pokreni učitavanje čim se stranica otvori
loadServices();