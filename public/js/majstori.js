async function loadMasters() {
    const res = await fetch('/api/masters');
    const masters = await res.json();
    const list = document.getElementById('masters-list');
    if (masters.length === 0) {
        list.innerHTML = '<p style="color: #a1a1aa; padding: 20px; text-align: center;">Nema dodatih majstora.</p>';
        return;
    }
    list.innerHTML = masters.map(m => `
        <div class="appointment-card" style="display: flex; align-items: center;">
            ${m.image_url ? `<img src="${m.image_url}" alt="${m.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; margin-right: 15px;">` : ''}
            <div style="flex-grow:1">
                <h4 style="margin:0;">${m.name}</h4>
                ${m.image_url ? '' : '<p style="margin:4px 0 0; color: #a1a1aa;">(bez slike)</p>'}
            </div>
            <button onclick="deleteMaster(${m.id})" style="color:red; background:none; border:none; cursor:pointer; font-size:1.2rem;">Obriši</button>
        </div>
    `).join('');
}

async function saveMaster() {
    const name = document.getElementById('masterName').value.trim();
    const image = document.getElementById('masterImage').value.trim();

    if (!name) {
        alert('Ime majstora je obavezno!');
        return;
    }

    const body = { name, image_url: image || null };
    const res = await fetch('/api/masters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (res.ok) {
        document.getElementById('modalOverlay').style.display = 'none';
        document.getElementById('masterName').value = '';
        document.getElementById('masterImage').value = '';
        loadMasters();
    } else {
        const err = await res.json();
        alert('Greška: ' + err.error);
    }
}

async function deleteMaster(id) {
    if (confirm('Da li ste sigurni da želite da obrišete ovog majstora?')) {
        const res = await fetch(`/api/masters/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadMasters();
        } else {
            alert('Greška pri brisanju.');
        }
    }
}

document.getElementById('openModalBtn').onclick = () => {
    document.getElementById('modalOverlay').style.display = 'flex';
    document.getElementById('masterName').value = '';
    document.getElementById('masterImage').value = '';
};

document.getElementById('saveMasterBtn').onclick = saveMaster;

window.onclick = function(event) {
    const modal = document.getElementById('modalOverlay');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

loadMasters();