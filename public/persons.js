// Person Database View Logic
// This script runs on person-database.html and extends app.js

// Wire up local search input to filter person table in real-time
document.addEventListener('DOMContentLoaded', () => {
    const personSearchInput = document.getElementById('personSearchInput');
    if (personSearchInput) {
        personSearchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            const filtered = personsData.filter(p => {
                const emailList = (p.emails || (p.email ? [p.email] : [])).join(' ').toLowerCase();
                const phoneList = (p.phones || (p.phone ? [p.phone] : [])).join(' ').toLowerCase();
                const leadsList = (p.leadsId || []).join(' ').toLowerCase();
                const tagsList = (Array.isArray(p.tags) ? p.tags.join(' ') : (p.tags || '')).toLowerCase();
                return (p.name || '').toLowerCase().includes(term) ||
                    (p.customId || '').toLowerCase().includes(term) ||
                    (p.companyName || '').toLowerCase().includes(term) ||
                    (p.location || p.companyLocation || '').toLowerCase().includes(term) ||
                    emailList.includes(term) ||
                    phoneList.includes(term) ||
                    leadsList.includes(term) ||
                    tagsList.includes(term);
            });
            renderPersons(filtered);
        });
    }
    const limitSelect = document.getElementById('personLimitSelect');
    if (limitSelect) {
        const savedLimit = localStorage.getItem('personLimit') || '500';
        limitSelect.value = savedLimit;
        limitSelect.addEventListener('change', async (e) => {
            localStorage.setItem('personLimit', e.target.value);
            await fetchPersons();
        });
    }
});


async function fetchPersons() {
    try {
        const limit = localStorage.getItem('personLimit') || '500';
        const response = await fetch(`${API_BASE}/persons?limit=${limit}`);
        personsData = await response.json();
        renderPersons(personsData);
    } catch (error) {
        console.error('Error fetching persons:', error);
    }
}

// Render contacts list table dynamically with action buttons
function renderPersons(persons) {
    const list = document.getElementById('personDatabaseList');
    if (!list) return;
    list.innerHTML = '';

    persons.forEach(p => {
        const tr = document.createElement('tr');
        const emailList = p.emails || (p.email ? [p.email] : []);
        const phoneList = p.phones || (p.phone ? [p.phone] : []);
        const leadsList = p.leadsId || [];

        tr.innerHTML = `
            <td><strong>${p.name}</strong><br><small class="text-muted">${p.customId || ''}</small></td>
            <td>
                ${p.companyName || '-'}<br>
                <small class="text-muted">${p.location || p.companyLocation || ''}</small>
            </td>
            <td>
                <div class="contact-info-small">
                    ${phoneList.map(ph => `<div><i class="fas fa-phone"></i> ${ph}</div>`).join('')}
                    ${emailList.map(em => `<div><i class="fas fa-envelope"></i> ${em}</div>`).join('')}
                </div>
            </td>
            <td>
                <div class="tags-container">
                    ${leadsList.map(l => `<span class="tag-pill">${l}</span>`).join('')}
                </div>
            </td>
            <td>
                <div class="lead-actions">
                    <button class="btn-icon" onclick="editPerson('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon" onclick="deletePerson('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        list.appendChild(tr);
    });
}

// Manage dynamic modal opening, text fields loading, and dynamic list components rendering
function openPersonModal(p = null) {
    const modal = document.getElementById('personModal');
    if (!modal) return;

    document.getElementById('personForm').reset();
    document.getElementById('personIdInternal').value = p ? p.id : '';
    document.getElementById('personName').value = p ? p.name : '';
    document.getElementById('personCustomId').value = p ? (p.customId || '') : '';
    document.getElementById('personCompanyName').value = p ? (p.companyName || '') : '';
    document.getElementById('personCompanyId').value = p ? (p.companyId || '') : '';
    if (document.getElementById('personCountry') || document.getElementById('personState') || document.getElementById('personCity') || document.getElementById('personLocation')) {
        const country = p ? (p.country || p.companyCountry || '') : '';
        const state = p ? (p.state || p.companyState || '') : '';
        const city = p ? (p.city || p.companyCity || '') : '';
        const location = p ? (p.location || p.companyLocation || '') : '';
        
        let finalCountry = country;
        let finalState = state;
        let finalCity = city;
        
        // Fallback parsing if fields are missing/empty but location is present
        if (!finalCountry && !finalState && !finalCity && location) {
            const parts = location.split(',').map(p => p.trim()).filter(Boolean);
            if (parts.length === 1) {
                finalCity = parts[0];
            } else if (parts.length === 2) {
                finalCity = parts[0];
                finalState = parts[1];
            } else if (parts.length >= 3) {
                finalCity = parts[0];
                finalState = parts[1];
                finalCountry = parts.slice(2).join(', ');
            }
        }
        
        if (document.getElementById('personCountry')) document.getElementById('personCountry').value = finalCountry;
        if (document.getElementById('personState')) document.getElementById('personState').value = finalState;
        if (document.getElementById('personCity')) document.getElementById('personCity').value = finalCity;
        if (document.getElementById('personLocation')) document.getElementById('personLocation').value = location;
    }
    document.getElementById('personCompanyWebsite').value = p ? (p.companyWebsite || '') : '';
    document.getElementById('personLeadsId').value = p ? (p.leadsId || []).join(', ') : '';

    const phoneCont = document.getElementById('personPhoneContainer');
    if (phoneCont) {
        phoneCont.innerHTML = '';
        const list = p && p.phones ? p.phones : [''];
        list.forEach((val, i) => {
            const div = document.createElement('div');
            div.className = 'input-group mb-2';
            div.innerHTML = `
                <input type="tel" class="person-phone-input" placeholder="Mobile ${i + 1}" value="${val}">
                ${i === 0 ? `<button type="button" class="btn-icon add-field-btn" onclick="addField('personPhoneContainer', 'person-phone')"><i class="fas fa-plus"></i></button>` : `<button type="button" class="btn-icon remove-field-btn" onclick="this.parentElement.remove()"><i class="fas fa-minus"></i></button>`}
            `;
            phoneCont.appendChild(div);
        });
    }

    const emailCont = document.getElementById('personEmailContainer');
    if (emailCont) {
        emailCont.innerHTML = '';
        const list = p && p.emails ? p.emails : [''];
        list.forEach((val, i) => {
            const div = document.createElement('div');
            div.className = 'input-group mb-2';
            div.innerHTML = `
                <input type="email" class="person-email-input" placeholder="Email ${i + 1}" value="${val}">
                ${i === 0 ? `<button type="button" class="btn-icon add-field-btn" onclick="addField('personEmailContainer', 'person-email')"><i class="fas fa-plus"></i></button>` : `<button type="button" class="btn-icon remove-field-btn" onclick="this.parentElement.remove()"><i class="fas fa-minus"></i></button>`}
            `;
            emailCont.appendChild(div);
        });
    }

    openModal(modal);
}

// Handle submission of the Add/Edit Person form
const personForm = document.getElementById('personForm');
if (personForm) personForm.addEventListener('submit', async (e) => {
    // 1. Prevent default form submission reload behavior
    e.preventDefault();
    
    // 2. Fetch the internal ID (if empty, we are creating a new person; if populated, we are editing)
    const id = document.getElementById('personIdInternal').value;
    
    // 3. Scan the dynamic input containers and gather all phone numbers and emails into arrays, filtering out empty values
    const phones = Array.from(document.querySelectorAll('.person-phone-input')).map(i => i.value.trim()).filter(v => v);
    const emails = Array.from(document.querySelectorAll('.person-email-input')).map(i => i.value.trim()).filter(v => v);

    // 4. Construct the structured data payload matching our contact schema
    const data = {
        name: document.getElementById('personName').value,
        customId: document.getElementById('personCustomId').value, // Custom unique UID (e.g., P-J0013)
        phones,
        emails,
        companyName: document.getElementById('personCompanyName').value,
        companyId: document.getElementById('personCompanyId').value,
        country: (document.getElementById('personCountry') || {}).value || '',
        state: (document.getElementById('personState') || {}).value || '',
        city: (document.getElementById('personCity') || {}).value || '',
        location: (() => {
            const country = (document.getElementById('personCountry') || {}).value || '';
            const state = (document.getElementById('personState') || {}).value || '';
            const city = (document.getElementById('personCity') || {}).value || '';
            const locInput = (document.getElementById('personLocation') || {}).value || '';
            if (locInput) return locInput;
            return [city, state, country].filter(Boolean).join(', ');
        })(),
        companyWebsite: document.getElementById('personCompanyWebsite').value,
        // Parse comma-separated list of associated Lead IDs into an array
        leadsId: document.getElementById('personLeadsId').value.split(',').map(s => s.trim()).filter(s => s)
    };

    // 5. Route dynamically: use PUT to update an existing person, or POST to create a new person
    const url = id ? `${API_BASE}/persons/${id}` : `${API_BASE}/persons`;
    const method = id ? 'PUT' : 'POST';

    // 6. Submit the payload to the local backend CRM API
    await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    // 7. Close the modal dialog on successful submission
    closeModal(document.getElementById('personModal'));
    
    // 8. Refresh the visible persons table view with the updated database values
    fetchPersons();
});

// Bind close and cancel modal actions
const closePersonModalBtn = document.getElementById('closePersonModal');
const cancelPersonBtn = document.getElementById('cancelPersonBtn');
[closePersonModalBtn, cancelPersonBtn].forEach(b => { if (b) b.onclick = () => closeModal(document.getElementById('personModal')); });

window.editPerson = (id) => {
    const p = personsData.find(x => x.id === id);
    if (p) openPersonModal(p);
};

window.deletePerson = async (id) => {
    if (!confirm('Delete this person?')) return;
    await fetch(`${API_BASE}/persons/${id}`, { method: 'DELETE' });
    fetchPersons();
};
