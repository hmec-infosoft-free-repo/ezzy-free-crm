// Companies Database View Logic
// This script runs on company-database.html and extends app.js

// Wire up local search input to filter company table in real-time
document.addEventListener('DOMContentLoaded', () => {
    const companySearchInput = document.getElementById('companySearchInput');
    if (companySearchInput) {
        companySearchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            const subCompsStr = (c) => Array.isArray(c.subCompanies) ? c.subCompanies.join(' ') : (c.subCompanies || '');
            const filtered = companiesData.filter(c =>
                (c.name || '').toLowerCase().includes(term) ||
                (c.location || '').toLowerCase().includes(term) ||
                (c.industry || '').toLowerCase().includes(term) ||
                (c.email || '').toLowerCase().includes(term) ||
                (c.whatsapp || '').toLowerCase().includes(term) ||
                (c.address || '').toLowerCase().includes(term) ||
                subCompsStr(c).toLowerCase().includes(term)
            );
            renderCompanies(filtered);
        });
    }
    const limitSelect = document.getElementById('companyLimitSelect');
    if (limitSelect) {
        const savedLimit = localStorage.getItem('companyLimit') || '500';
        limitSelect.value = savedLimit;
        limitSelect.addEventListener('change', async (e) => {
            localStorage.setItem('companyLimit', e.target.value);
            await fetchCompanies();
        });
    }
});


async function fetchCompanies() {
    try {
        const limit = localStorage.getItem('companyLimit') || '500';
        const response = await fetch(`${API_BASE}/companies?limit=${limit}`);
        companiesData = await response.json();
        renderCompanies(companiesData);
    } catch (error) {
        console.error('Error fetching companies:', error);
    }
}

// Render company table entries dynamically
function renderCompanies(companies) {
    const list = document.getElementById('companiesList');
    if (!list) return;
    list.innerHTML = '';
    companies.forEach(comp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong><a href="view-db-company/company-details.html?id=${comp.id}" target="_blank" style="color: var(--text-main); font-weight: 600; text-decoration: none; border-bottom: 1px dashed var(--primary); transition: var(--transition);">${comp.name}</a></strong><br><small class="text-muted">${comp.industry || ''}</small></td>
            <td>${comp.location || '-'}</td>
            <td>
                <div class="contact-info-small">
                    ${comp.email ? `<div><i class="fas fa-envelope"></i> ${comp.email}</div>` : ''}
                    ${comp.whatsapp ? `<div><i class="fab fa-whatsapp"></i> ${comp.whatsapp}</div>` : ''}
                </div>
            </td>
            <td>${comp.website ? `<a href="${comp.website.startsWith('http') ? comp.website : 'https://'+comp.website}" target="_blank">Link</a>` : '-'}</td>
            <td>
                <div class="lead-actions" style="display: flex; gap: 4px; align-items: center;">
                    <a href="view-db-company/company-details.html?id=${comp.id}" target="_blank" class="btn-icon" title="View Profile" style="color: var(--primary); display: inline-flex; align-items: center; justify-content: center;"><i class="fas fa-info-circle"></i></a>
                    <button class="btn-icon" onclick="editCompany('${comp.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon" onclick="deleteCompany('${comp.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        list.appendChild(tr);
    });
}

// Edit company details: Fill form and trigger modal
window.editCompany = (id) => {
    const comp = companiesData.find(c => c.id === id);
    if (!comp) return;
    document.getElementById('companyModalTitle').textContent = 'Edit Company';
    document.getElementById('companyId').value = comp.id;
    document.getElementById('compName').value = comp.name;
    
    if (document.getElementById('compCountry') || document.getElementById('compState') || document.getElementById('compCity') || document.getElementById('compLocation')) {
        const country = comp.country !== undefined ? (comp.country || '') : '';
        const state = comp.state !== undefined ? (comp.state || '') : '';
        const city = comp.city !== undefined ? (comp.city || '') : '';
        const location = comp.location || '';
        
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
        
        if (document.getElementById('compCountry')) document.getElementById('compCountry').value = finalCountry;
        if (document.getElementById('compState')) document.getElementById('compState').value = finalState;
        if (document.getElementById('compCity')) document.getElementById('compCity').value = finalCity;
        if (document.getElementById('compLocation')) document.getElementById('compLocation').value = location;
    }
    
    document.getElementById('compEmail').value = comp.email || '';
    document.getElementById('compWhatsapp').value = comp.whatsapp || '';
    document.getElementById('compWebsite').value = comp.website || '';
    document.getElementById('compAddress').value = comp.address || '';
    document.getElementById('compSubCompanies').value = (comp.subCompanies || []).join(', ');
    openModal(companyModal);
};

// Delete company with confirmation
window.deleteCompany = async (id) => {
    if (!confirm('Delete this company?')) return;
    await fetch(`${API_BASE}/companies/${id}`, { method: 'DELETE' });
    fetchCompanies();
};

// Bind Company Form submit handler
const companyFormEl = document.getElementById('companyForm');
if (companyFormEl) {
    companyFormEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('companyId').value;
        const data = {
            name: document.getElementById('compName').value,
            country: (document.getElementById('compCountry') || {}).value || '',
            state: (document.getElementById('compState') || {}).value || '',
            city: (document.getElementById('compCity') || {}).value || '',
            location: (() => {
                const country = (document.getElementById('compCountry') || {}).value || '';
                const state = (document.getElementById('compState') || {}).value || '';
                const city = (document.getElementById('compCity') || {}).value || '';
                const locInput = (document.getElementById('compLocation') || {}).value || '';
                if (locInput) return locInput;
                return [city, state, country].filter(Boolean).join(', ');
            })(),
            email: document.getElementById('compEmail').value,
            whatsapp: document.getElementById('compWhatsapp').value,
            website: document.getElementById('compWebsite').value,
            address: document.getElementById('compAddress').value,
            subCompanies: document.getElementById('compSubCompanies').value.split(',').map(s => s.trim()).filter(s => s)
        };

        const url = id ? `${API_BASE}/companies/${id}` : `${API_BASE}/companies`;
        const method = id ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        closeModal(companyModal);
        fetchCompanies();
    });
}

// Bind close and cancel modal actions
const closeCompanyModalBtn = document.getElementById('closeCompanyModal');
const cancelCompanyModalBtn = document.getElementById('cancelCompanyBtn');
[closeCompanyModalBtn, cancelCompanyModalBtn].forEach(b => { if (b) b.onclick = () => closeModal(companyModal); });

