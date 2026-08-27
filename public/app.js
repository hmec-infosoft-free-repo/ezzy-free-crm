async function loadCommonTemplates() {
    try {
        const sidebarRes = await fetch('site-hf/sidebar.html');
        const sidebarHtml = await sidebarRes.text();
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.innerHTML = sidebarHtml;

        const topbarRes = await fetch('site-hf/topbar.html');
        const topbarHtml = await topbarRes.text();
        const topbar = document.querySelector('.top-bar');
        if (topbar) topbar.innerHTML = topbarHtml;

        const footerRes = await fetch('site-hf/footer.html');
        const footerHtml = await footerRes.text();
        const mainContent = document.querySelector('.main-content');
        if (mainContent) mainContent.insertAdjacentHTML('beforeend', footerHtml);

        const path = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-menu a').forEach(a => {
            if (a.getAttribute('href') === path) {
                a.classList.add('active');
            } else {
                a.classList.remove('active');
            }
        });

        document.querySelectorAll('.appVersionDisplay').forEach(el => el.textContent = typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.0.1');

        // Re-bind sidebar/topbar elements
        navLeads = document.getElementById('nav-leads');
        navLeadDb = document.getElementById('nav-lead-db');
        navCompanies = document.getElementById('nav-companies');
        navDashboard = document.getElementById('nav-dashboard');
        navPersons = document.getElementById('nav-persons');

        // Re-bind navigation clicks
        if (navLeads) navLeads.onclick = (e) => { if (currentPage === 'leads-board.html') { e.preventDefault(); switchView('leads'); } };
        if (navLeadDb) navLeadDb.onclick = (e) => { if (currentPage === 'lead-database.html') { e.preventDefault(); switchView('lead-db'); } };
        if (navCompanies) navCompanies.onclick = (e) => { if (currentPage === 'company-database.html') { e.preventDefault(); switchView('companies'); } };
        if (navDashboard) navDashboard.onclick = (e) => { if (currentPage === 'index.html') { e.preventDefault(); switchView('dashboard'); } };
        if (navPersons) navPersons.onclick = (e) => { if (currentPage === 'person-database.html') { e.preventDefault(); switchView('person-db'); } };

        // Sidebar toggle logic
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle && sidebar) {
            // Check initial state from localStorage
            if (localStorage.getItem('sidebarCollapsed') === 'true') {
                sidebar.classList.add('collapsed');
            }
            
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
            });
        }

    } catch (e) {
        console.error('Error loading templates', e);
    }
}

function handleGlobalSearch(e) {
    const term = e.target.value.toLowerCase().trim();
    if (currentView === 'leads') {
        const filtered = leadsData.filter(l =>
            (l.name || '').toLowerCase().includes(term) ||
            (l.email && l.email.toLowerCase().includes(term)) ||
            (l.company && l.company.toLowerCase().includes(term)) ||
            (l.requirement && l.requirement.toLowerCase().includes(term)) ||
            (l.tags && l.tags.toLowerCase().includes(term)) ||
            (l.location && l.location.toLowerCase().includes(term))
        );
        renderLeads(filtered);
    } else if (currentView === 'lead-db') {
        applyLeadFilters();
    } else if (currentView === 'companies') {
        // Comprehensive Company Search: name, location, email, whatsapp, industry, address, subCompanies
        const filtered = companiesData.filter(c => {
            const subComps = Array.isArray(c.subCompanies) ? c.subCompanies.join(' ') : (c.subCompanies || '');
            return (c.name || '').toLowerCase().includes(term) ||
                (c.location || '').toLowerCase().includes(term) ||
                (c.industry || '').toLowerCase().includes(term) ||
                (c.email || '').toLowerCase().includes(term) ||
                (c.whatsapp || '').toLowerCase().includes(term) ||
                (c.address || '').toLowerCase().includes(term) ||
                subComps.toLowerCase().includes(term);
        });
        renderCompanies(filtered);
    } else if (currentView === 'person-db') {
        // Comprehensive Person Search: name, customId, phones, emails, companyName, companyLocation, leadsId, tags
        const filtered = personsData.filter(p => {
            const emailList = (p.emails || (p.email ? [p.email] : [])).join(' ').toLowerCase();
            const phoneList = (p.phones || (p.phone ? [p.phone] : [])).join(' ').toLowerCase();
            const leadsList = (p.leadsId || []).join(' ').toLowerCase();
            const tagsList = (Array.isArray(p.tags) ? p.tags.join(' ') : (p.tags || '')).toLowerCase();

            return (p.name || '').toLowerCase().includes(term) ||
                (p.customId || '').toLowerCase().includes(term) ||
                (p.companyName || '').toLowerCase().includes(term) ||
                (p.companyLocation || '').toLowerCase().includes(term) ||
                emailList.includes(term) ||
                phoneList.includes(term) ||
                leadsList.includes(term) ||
                tagsList.includes(term);
        });
        renderPersons(filtered);
    }
}

// Global helper for dynamic form fields
function addField(containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'input-group mb-2';
    const count = container.querySelectorAll('input').length + 1;
    const isEmail = type.includes('email');
    const classPrefix = type.includes('person') ? 'person' : 'lead';
    const fieldType = type.includes('phone') || type.includes('tel') ? 'tel' : (isEmail ? 'email' : 'text');
    const label = (fieldType === 'tel' ? 'Mobile' : (fieldType === 'email' ? 'Email' : 'Field'));

    div.innerHTML = `
        <input type="${fieldType}" 
               class="${classPrefix}-${isEmail ? 'email' : 'phone'}-input" 
               placeholder="${label} ${count}">
        <button type="button" class="btn-icon remove-field-btn" onclick="this.parentElement.remove()"><i class="fas fa-minus"></i></button>
    `;
    container.appendChild(div);
}

/**
 * ============================================================
 * Ezzy Free CRM - Main Application Script (app.js)
 * ============================================================
 * 
 * This script is shared across ALL pages (index.html, leads-board.html,
 * lead-database.html, company-database.html, settings.html).
 * 
 * Architecture: Multi-Page Application (MPA)
 * - Each page has its own HTML file with only the relevant view section visible.
 * - All pages share the same sidebar, CSS, and this JS file.
 * - DOM elements that don't exist on the current page will be null,
 *   so ALL event listeners and DOM access MUST be null-guarded.
 * 
 * Data Storage:
 * - Leads are stored in local-data/leads/yearwise-leads/YYYY-leads.json (year-wise)
 * - Companies are stored in local-data/leads/company-databse/company-database-*.json
 * - The server (server.js) handles all CRUD via /api/* endpoints.
 * ============================================================
 */

const API_BASE = '/api';
let leadsData = [];      // In-memory cache of all leads from the API
let companiesData = [];   // In-memory cache of all companies from the API
let personsData = [];     // In-memory cache of all persons from the API

// Detect which page we're on from the URL, then map it to a view name
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

const pageToViewMap = {
    'index.html': 'dashboard',
    'leads-board.html': 'leads',
    'lead-database.html': 'lead-db',
    'company-database.html': 'companies',
    'person-database.html': 'person-db',
    'settings.html': 'settings'
};

let currentView = pageToViewMap[currentPage] || 'dashboard';
console.log('CRM Page:', currentPage, 'View:', currentView);

// ============================================================
// DOM Element References
// NOTE: Many of these will be null depending on which page is loaded.
// e.g. leadForm is null on company-database.html.
// All usage MUST be null-guarded to prevent crashes.
// ============================================================

// DOM Elements - General (present on all pages)
let searchInput, addBtn, navLeads, navLeadDb, navCompanies, navDashboard, navPersons;
let leadsView, leadDatabaseView, companiesView, dashboardView, personDatabaseView;
let pageTitle, pageSubtitle;

// DOM Elements - Company Modal
// Note: companyModal is grabbed here so it's available to switchView / openModal on all pages.
// Full company form/modal logic is in companies.js
const companyModal = document.getElementById('companyModal');

// ============================================================
// Lead Modal Elements (loaded dynamically from lead-form.html)
// These are declared as `let` because they get assigned AFTER
// the template is fetched and injected into the DOM.
// ============================================================
let leadModal, closeLeadModal, cancelLeadBtn, leadForm;
let detailsModal, closeDetailsModal, addFollowUpBtn, followupFormContainer;
let followUpForm, cancelFuBtn, detEditBtn;
let togglePromptBtn, promptContainer, smartPromptInput, extractPromptBtn;
let btnAutoReply;

/**
 * Loads the shared lead-form.html template into the current page.
 * This avoids duplicating lead modal HTML across multiple pages.
 * Pages that need lead modals have a <div id="leadFormContainer"></div>.
 */
async function loadLeadFormTemplate() {
    const container = document.getElementById('leadFormContainer');
    if (!container) return; // Page doesn't need lead modals (e.g. settings, dashboard)

    try {
        const response = await fetch('lead-form.html');
        if (!response.ok) return;
        container.innerHTML = await response.text();

        // Now resolve all lead modal DOM references
        leadModal = document.getElementById('leadModal');
        closeLeadModal = document.getElementById('closeLeadModal');
        cancelLeadBtn = document.getElementById('cancelLeadBtn');
        leadForm = document.getElementById('leadForm');

        detailsModal = document.getElementById('detailsModal');
        closeDetailsModal = document.getElementById('closeDetailsModal');
        addFollowUpBtn = document.getElementById('addFollowUpBtn');
        followupFormContainer = document.getElementById('followupFormContainer');
        followUpForm = document.getElementById('followUpForm');
        cancelFuBtn = document.getElementById('cancelFuBtn');
        detEditBtn = document.getElementById('detEditBtn');

        togglePromptBtn = document.getElementById('togglePromptBtn');
        promptContainer = document.getElementById('promptContainer');
        smartPromptInput = document.getElementById('smartPromptInput');
        extractPromptBtn = document.getElementById('extractPromptBtn');
        btnAutoReply = document.getElementById('btn-auto-reply');

        // Bind event listeners now that the elements exist
        bindLeadModalEvents();
    } catch (e) {
        console.error('Failed to load lead form template:', e);
    }
}

// --- Navigation ---
function switchView(view) {
    console.log('Switching to view:', view);
    currentView = view;

    // UI Update - Reset
    const views = [leadsView, leadDatabaseView, companiesView, dashboardView, document.getElementById('personDatabaseView')];
    const navs = [navLeads, navLeadDb, navCompanies, navDashboard, document.getElementById('nav-persons')];

    views.forEach(v => v && v.classList.add('hidden'));
    navs.forEach(n => n && n.classList.remove('active'));
    if (addBtn) addBtn.classList.remove('hidden');

    if (view === 'person-db') {
        const navP = document.getElementById('nav-persons');
        const viewP = document.getElementById('personDatabaseView');
        if (navP) navP.classList.add('active');
        if (viewP) viewP.classList.remove('hidden');
        if (pageTitle) pageTitle.textContent = 'Person Database';
        if (pageSubtitle) pageSubtitle.textContent = 'Manage individual contacts and their associated companies/leads.';
        if (searchInput) searchInput.placeholder = 'Search contacts by name, UID, company, phone, email, tags...';
        const addP = document.getElementById('addPersonBtn');
        if (addP) addP.onclick = () => openPersonModal();
        fetchPersons();
    } else if (view === 'leads') {
        if (navLeads) navLeads.classList.add('active');
        if (leadsView) leadsView.classList.remove('hidden');
        if (pageTitle) pageTitle.textContent = 'Lead Management (Kanban)';
        if (pageSubtitle) pageSubtitle.textContent = 'Track, manage, and follow up with your potential clients.';
        if (searchInput) searchInput.placeholder = 'Search leads by name, email, phone, company, status...';
        if (addBtn) {
            addBtn.classList.remove('hidden');
            addBtn.innerHTML = '<i class="fas fa-plus"></i> New Lead';
        }
        fetchLeads();
    } else if (view === 'lead-db') {
        if (navLeadDb) navLeadDb.classList.add('active');
        if (leadDatabaseView) leadDatabaseView.classList.remove('hidden');
        if (pageTitle) pageTitle.textContent = 'Lead Database';
        if (pageSubtitle) pageSubtitle.textContent = 'Comprehensive list of all leads in your system.';
        if (searchInput) searchInput.placeholder = 'Search leads by name, email, phone, company, location...';
        if (addBtn) {
            addBtn.classList.remove('hidden');
            addBtn.innerHTML = '<i class="fas fa-plus"></i> New Lead';
        }
        fetchLeads();
    } else if (view === 'companies') {
        if (navCompanies) navCompanies.classList.add('active');
        if (companiesView) companiesView.classList.remove('hidden');
        if (pageTitle) pageTitle.textContent = 'Company Database';
        if (pageSubtitle) pageSubtitle.textContent = 'Manage your client companies and industrial partners.';
        if (searchInput) searchInput.placeholder = 'Search companies by name, location, email, sub-companies...';
        if (addBtn) {
            addBtn.classList.remove('hidden');
            addBtn.innerHTML = '<i class="fas fa-plus"></i> New Company';
        }
        fetchCompanies();
    } else if (view === 'dashboard') {
        if (navDashboard) navDashboard.classList.add('active');
        if (dashboardView) dashboardView.classList.remove('hidden');
        if (pageTitle) pageTitle.textContent = 'Business Dashboard';
        if (pageSubtitle) pageSubtitle.textContent = 'Performance metrics and recent activity overview.';
        if (searchInput) searchInput.placeholder = 'Search leads, companies, locations...';
        if (addBtn) addBtn.classList.add('hidden');
        renderDashboard();
    }
}

// Nav click handlers: Only prevent default if we're already on that page (avoids redundant reload).
// Otherwise, let the browser follow the <a href="..."> link to navigate to the other page.
// Navigation event listeners removed here, handled in loadCommonTemplates



// ============================================================
// Data Fetching
// Fetches leads/companies from the API and routes data to the
// correct render function based on which view is active.
// ============================================================
async function fetchLeads() {
    try {
        const limit = localStorage.getItem('leadLimit') || '500';
        const response = await fetch(`${API_BASE}/leads?limit=${limit}`);
        leadsData = await response.json();
        console.log('Fetched leads:', leadsData.length);
        if (currentView === 'leads') {
            renderLeads(leadsData);
        } else if (currentView === 'lead-db') {
            applyLeadFilters();
        }
    } catch (error) {
        console.error('Error fetching leads:', error);
    }
}

async function fetchCompanies() {
    try {
        const response = await fetch(`${API_BASE}/companies`);
        companiesData = await response.json();
        // renderCompanies is defined in companies.js — only call it if available
        if (typeof renderCompanies === 'function') renderCompanies(companiesData);
    } catch (error) {
        console.error('Error fetching companies:', error);
    }
}

async function fetchPersons() {
    try {
        const response = await fetch(`${API_BASE}/persons`);
        personsData = await response.json();
        // renderPersons is defined in persons.js — only call it if available
        if (typeof renderPersons === 'function') renderPersons(personsData);
    } catch (error) {
        console.error('Error fetching persons:', error);
    }
}


// --- Rendering ---
function renderLeads(leads) {
    ['New', 'Contacted', 'Qualified', 'Closed'].forEach(status => {
        const listEl = document.getElementById(`list-${status.toLowerCase()}`);
        if (listEl) listEl.innerHTML = '';
        const countEl = document.getElementById(`count-${status.toLowerCase()}`);
        if (countEl) countEl.textContent = '0';
    });

    const counts = { New: 0, Contacted: 0, Qualified: 0, Closed: 0 };

    const boardFilter = document.getElementById('boardFilterSelect')?.value || 'active';
    let filteredLeads = leads;

    if (boardFilter === 'active' && currentView === 'leads') {
        filteredLeads = leads.filter(l => {
            // Exclude raw untouched imports (e.g., from Exhibitions) from the active board
            const isImport = (l.source || '').toLowerCase() === 'exhibition';
            const isTouched = l.status !== 'New' || (l.followUps && l.followUps.length > 0) || (l.result && l.result !== 'Pending');

            // If it's a raw import and hasn't been touched, hide it from the active pipeline
            if (isImport && !isTouched) return false;

            return true;
        });
    }

    filteredLeads.forEach(lead => {
        const status = lead.status;
        if (counts.hasOwnProperty(status)) counts[status]++;

        const card = document.createElement('div');
        card.className = 'lead-card';
        card.setAttribute('data-status', status);
        const resultBadge = lead.result && lead.result !== 'Pending' ? `<span class="result-badge ${lead.result.toLowerCase()}">${lead.result}</span>` : '';
        card.innerHTML = `
            <div class="lead-card-header">
                <h4>${lead.name}</h4>
                ${resultBadge}
            </div>
            <div class="lead-company">${lead.company || 'No Company'}</div>
            <div class="lead-footer">
                <span title="${lead.email}"><i class="fas fa-envelope"></i></span>
                <div class="lead-actions">
                    <button class="btn-icon" onclick="editLead('${lead.id}', event)" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon" onclick="deleteLead('${lead.id}', event)" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        card.addEventListener('click', () => showDetails(lead));
        const listEl = document.getElementById(`list-${status.toLowerCase()}`);
        if (listEl) listEl.appendChild(card);
    });

    Object.keys(counts).forEach(status => {
        const countEl = document.getElementById(`count-${status.toLowerCase()}`);
        if (countEl) countEl.textContent = counts[status];
    });
}

function renderLeadDatabase(leads) {
    const list = document.getElementById('leadDatabaseList');
    if (!list) return;
    list.innerHTML = '';

    leads.forEach(lead => {
        const tr = document.createElement('tr');

        const dStr = lead.leadDate || lead.createdAt;
        const dateStr = dStr && !isNaN(new Date(dStr).getTime()) ? new Date(dStr).toLocaleDateString() : 'Unknown Date';
        let sourceText = lead.source || 'Direct';
        const sTag = lead.sourceTag || lead.exhibition || '';
        if (sTag) {
            sourceText += ` — ${sTag}`;
        }

        // Handle phones and emails arrays
        const phones = lead.phones && lead.phones.length > 0 ? lead.phones : (lead.phone ? [lead.phone] : []);
        const emails = lead.emails && lead.emails.length > 0 ? lead.emails : (lead.email ? [lead.email] : []);

        const phoneHtml = phones.length > 0 ? phones.map(p => `<div><i class="fas fa-phone text-muted"></i> ${p}</div>`).join('') : '<div class="text-muted">-</div>';
        const emailHtml = emails.length > 0 ? emails.map(e => `<div><i class="fas fa-envelope text-muted"></i> ${e}</div>`).join('') : '<div class="text-muted">-</div>';

        tr.innerHTML = `
            <td>
                <strong>${dateStr}</strong><br>
                <small class="text-muted">${sourceText}</small>
            </td>
            <td>
                <strong>${lead.name}</strong><br>
                <small class="text-muted">${lead.company || 'No Company'}</small>
            </td>
            <td>
                <div style="max-width: 250px; white-space: normal; overflow-wrap: break-word; font-size: 13px;">
                    ${lead.requirement || '-'}
                </div>
                ${lead.tags ? `<div class="mt-1"><span class="tag-pill" style="font-size: 11px; padding: 2px 6px;">${lead.tags}</span></div>` : ''}
            </td>
            <td>
                <div class="contact-info-small">
                    ${phoneHtml}
                    ${emailHtml}
                </div>
            </td>
            <td>
                <div class="lead-actions">
                    <button class="btn-icon" onclick="editLead('${lead.id}', event)"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon" onclick="deleteLead('${lead.id}', event)"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tr.addEventListener('click', () => showDetails(lead));
        list.appendChild(tr);
    });
}

function renderDashboard() {
    if (!leadsData.length) {
        // Fetch leads if not loaded
        const limit = localStorage.getItem('leadLimit') || '500';
        fetch(`${API_BASE}/leads?limit=${limit}`).then(r => r.json()).then(data => {
            leadsData = data;
            updateDashboardStats();
        });
    } else {
        updateDashboardStats();
    }
}

function updateDashboardStats() {
    const stats = {
        total: leadsData.length,
        won: leadsData.filter(l => l.result === 'Won').length,
        lost: leadsData.filter(l => l.result === 'Lost').length,
        pending: leadsData.filter(l => !l.result || l.result === 'Pending').length
    };

    const statsTotal = document.getElementById('stat-total-leads');
    if (statsTotal) statsTotal.textContent = stats.total;
    const statsWon = document.getElementById('stat-won-leads');
    if (statsWon) statsWon.textContent = stats.won;
    const statsLost = document.getElementById('stat-lost-leads');
    if (statsLost) statsLost.textContent = stats.lost;
    const statsPending = document.getElementById('stat-pending-leads');
    if (statsPending) statsPending.textContent = stats.pending;

    const recentList = document.getElementById('recent-leads-list');
    if (recentList) {
        recentList.innerHTML = '';
        [...leadsData].sort((a, b) => {
            const getTime = (l) => {
                const dStr = l.createdAt || l.leadDate;
                if (!dStr) return 0;
                const d = new Date(dStr);
                return isNaN(d.getTime()) ? 0 : d.getTime();
            };
            return getTime(b) - getTime(a);
        }).slice(0, 5).forEach(lead => {
            const item = document.createElement('div');
            item.className = 'recent-item';
            const dStr = lead.createdAt || lead.leadDate;
            const dateStr = dStr && !isNaN(new Date(dStr).getTime()) ? new Date(dStr).toLocaleDateString() : 'Unknown Date';
            item.innerHTML = `
                <div class="recent-item-info">
                    <h5>${lead.name}</h5>
                    <p>${lead.company || 'No Company'} • Added ${dateStr}</p>
                </div>
                <span class="status-badge ${lead.status}">${lead.status}</span>
            `;
            recentList.appendChild(item);
        });
    }
}


// --- Search & Filter ---
function applyLeadFilters() {
    if (currentView !== 'lead-db') return;

    const filterYear = document.getElementById('filterYear')?.value.trim() || '';
    const filterCompany = document.getElementById('filterCompany')?.value.trim() || '';
    const filterReq = document.getElementById('filterRequirement')?.value.trim() || '';
    const filterLoc = document.getElementById('filterLocation')?.value.trim() || '';
    const filterSrc = document.getElementById('filterSource')?.value || 'all';
    const sortVal = document.getElementById('sortSelect')?.value || 'latest';

    const searchInput = document.getElementById('searchInput');
    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

    let filtered = leadsData.filter(l => {
        // Global Search
        if (searchVal) {
            const emailsStr = (l.emails || [l.email || '']).join(' ').toLowerCase();
            const phonesStr = (l.phones || [l.phone || '']).join(' ').toLowerCase();
            const matchesSearch = l.name.toLowerCase().includes(searchVal) ||
                emailsStr.includes(searchVal) ||
                phonesStr.includes(searchVal) ||
                (l.company && l.company.toLowerCase().includes(searchVal)) ||
                (l.requirement && l.requirement.toLowerCase().includes(searchVal)) ||
                (l.tags && l.tags.toLowerCase().includes(searchVal)) ||
                (l.location && l.location.toLowerCase().includes(searchVal));
            if (!matchesSearch) return false;
        }

        // Year Filter
        if (filterYear) {
            const dStr = l.leadDate || l.createdAt;
            const yearStr = dStr && !isNaN(new Date(dStr).getTime()) ? new Date(dStr).getFullYear().toString() : '';
            const allowedYears = filterYear.split(',').map(y => y.trim()).filter(y => y);
            if (allowedYears.length > 0 && !allowedYears.includes(yearStr)) return false;
        }

        // Company Filter
        if (filterCompany) {
            const compStr = (l.company || '').toLowerCase();
            const terms = filterCompany.toLowerCase().split(',').map(s => s.trim()).filter(s => s);
            if (terms.length > 0) {
                const matches = terms.some(term => compStr.includes(term));
                if (!matches) return false;
            }
        }

        // Requirement Filter (checks req and tags)
        if (filterReq) {
            const reqStr = ((l.requirement || '') + ' ' + (l.tags || '')).toLowerCase();
            const terms = filterReq.toLowerCase().split(',').map(s => s.trim()).filter(s => s);
            if (terms.length > 0) {
                const matches = terms.some(term => reqStr.includes(term));
                if (!matches) return false;
            }
        }

        // Location Filter
        if (filterLoc) {
            const locStr = (l.location || '').toLowerCase();
            const terms = filterLoc.toLowerCase().split(',').map(s => s.trim()).filter(s => s);
            if (terms.length > 0) {
                const matches = terms.some(term => locStr.includes(term));
                if (!matches) return false;
            }
        }

        // Source Filter
        if (filterSrc !== 'all') {
            const srcLower = (l.source || '').toLowerCase();
            const tagLower = (l.sourceTag || l.exhibition || '').toLowerCase();

            if (filterSrc === 'exhibition') {
                if (srcLower !== 'exhibition') return false;
            } else if (filterSrc.startsWith('pmec') || filterSrc.startsWith('packplus')) {
                // If filtering by PMEC or PackPlus specifically
                if (srcLower !== 'exhibition' || !tagLower.includes(filterSrc)) return false;
            } else {
                if (srcLower !== filterSrc) return false;
            }
        }

        return true;
    });

    // Sort
    filtered.sort((a, b) => {
        const getTime = (lead) => {
            const dStr = lead.leadDate || lead.createdAt;
            if (!dStr) return 0;
            const d = new Date(dStr);
            return isNaN(d.getTime()) ? 0 : d.getTime();
        };
        const timeA = getTime(a);
        const timeB = getTime(b);

        if (sortVal === 'latest') {
            return timeB - timeA;
        } else if (sortVal === 'oldest') {
            return timeA - timeB;
        } else if (sortVal === 'value-high') {
            return (b.quality || 2) - (a.quality || 2);
        } else if (sortVal === 'value-low') {
            return (a.quality || 2) - (b.quality || 2);
        }
        return 0;
    });

    renderLeadDatabase(filtered);
}

['filterYear', 'filterCompany', 'filterRequirement', 'filterLocation'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', applyLeadFilters);
});

['filterSource', 'sortSelect'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', applyLeadFilters);
});

const boardFilterEl = document.getElementById('boardFilterSelect');
if (boardFilterEl) boardFilterEl.addEventListener('change', () => {
    // Re-trigger rendering using the current search term, or fallback to all leads
    const term = searchInput ? searchInput.value.toLowerCase() : '';
    if (term) {
        handleGlobalSearch({ target: { value: term } });
    } else {
        renderLeads(leadsData);
    }
});

// handleGlobalSearch is now called from loadCommonTemplates


// --- Modals Logic ---
function openModal(modal) { modal.classList.add('active'); }
function closeModal(modal) { modal.classList.remove('active'); }

function bindAddBtnEvent() {
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (currentView === 'leads' || currentView === 'lead-db') {
                if (!leadForm) return;
                document.getElementById('modalTitle').textContent = 'Add New Lead';
                leadForm.reset();
                if (document.getElementById('leadId')) document.getElementById('leadId').value = '';

                // Reset dynamic containers
                const emailContainer = document.getElementById('emailContainer');
                if (emailContainer) {
                    emailContainer.innerHTML = `
                        <div class="input-group mb-2">
                            <input type="email" class="lead-email-input" placeholder="Email 1">
                            <button type="button" class="btn-icon add-field-btn" onclick="addField('emailContainer', 'email')"><i class="fas fa-plus"></i></button>
                        </div>
                    `;
                }
                const phoneContainer = document.getElementById('phoneContainer');
                if (phoneContainer) {
                    phoneContainer.innerHTML = `
                        <div class="input-group mb-2">
                            <input type="tel" class="lead-phone-input" placeholder="Mobile 1">
                            <button type="button" class="btn-icon add-field-btn" onclick="addField('phoneContainer', 'phone')"><i class="fas fa-plus"></i></button>
                        </div>
                    `;
                }

                document.getElementById('leadDate').value = new Date().toISOString().split('T')[0];
                document.getElementById('leadQuality').value = 2;
                if (promptContainer) promptContainer.classList.add('hidden');
                if (smartPromptInput) smartPromptInput.value = '';
                openModal(leadModal);
            } else {
                const companyForm = document.getElementById('companyForm');
                if (!companyForm) return;
                document.getElementById('companyModalTitle').textContent = 'Add New Company';
                companyForm.reset();
                document.getElementById('companyId').value = '';
                openModal(companyModal);
            }
        });
    }
}

function bindLeadModalEvents() {
    // Lead Modal Close
    [closeLeadModal, cancelLeadBtn].forEach(b => { if (b) b.addEventListener('click', () => closeModal(leadModal)); });
    // Details Modal Close
    if (closeDetailsModal) closeDetailsModal.addEventListener('click', () => closeModal(detailsModal));

    // --- Smart Fill Logic ---
    if (togglePromptBtn) togglePromptBtn.addEventListener('click', () => {
        if (promptContainer) promptContainer.classList.toggle('hidden');
    });

    if (extractPromptBtn) extractPromptBtn.addEventListener('click', () => {
        const text = smartPromptInput ? smartPromptInput.value : '';
        if (!text) return;

        // Extraction Regex patterns
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const phoneRegex = /\+?(\d{1,4})?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
        const websiteRegex = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

        const emails = text.match(emailRegex);
        const phones = text.match(phoneRegex);
        const websites = text.match(websiteRegex);

        if (emails) {
            const container = document.getElementById('emailContainer');
            if (container) {
                container.innerHTML = '';
                emails.forEach((email, i) => {
                    const div = document.createElement('div');
                    div.className = 'input-group mb-2';
                    div.innerHTML = `
                    <input type="email" class="lead-email-input" placeholder="Email ${i + 1}" value="${email}">
                    ${i === 0 ? `<button type="button" class="btn-icon add-field-btn" onclick="addField('emailContainer', 'email')"><i class="fas fa-plus"></i></button>` : `<button type="button" class="btn-icon remove-field-btn" onclick="this.parentElement.remove()"><i class="fas fa-minus"></i></button>`}
                `;
                    container.appendChild(div);
                });
            }
        }

        if (phones) {
            const container = document.getElementById('phoneContainer');
            if (container) {
                container.innerHTML = '';
                phones.forEach((phone, i) => {
                    const div = document.createElement('div');
                    div.className = 'input-group mb-2';
                    div.innerHTML = `
                    <input type="tel" class="lead-phone-input" placeholder="Mobile ${i + 1}" value="${phone.trim()}">
                    ${i === 0 ? `<button type="button" class="btn-icon add-field-btn" onclick="addField('phoneContainer', 'phone')"><i class="fas fa-plus"></i></button>` : `<button type="button" class="btn-icon remove-field-btn" onclick="this.parentElement.remove()"><i class="fas fa-minus"></i></button>`}
                `;
                    container.appendChild(div);
                });
            }
        }

        if (websites) document.getElementById('leadWebsite').value = websites[0];

        // Basic heuristic for Company and Name
        const nameMatch = text.match(/(Name|Contact):\s*([^\n\r.]+)/i) || text.match(/^([^\n\r.]+)/);
        const companyMatch = text.match(/(Company|Organization|at|from):\s*([^\n\r.]+)/i);

        if (nameMatch) {
            let name = nameMatch[2] || nameMatch[1];
            document.getElementById('leadName').value = name.trim();
        }

        if (companyMatch) {
            let company = companyMatch[2] || companyMatch[1];
            document.getElementById('leadCompany').value = company.trim();
        } else {
            if (emails && emails[0]) {
                const domain = emails[0].split('@')[1];
                const genericDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
                if (!genericDomains.includes(domain)) {
                    const guessedCompany = domain.split('.')[0];
                    document.getElementById('leadCompany').value = guessedCompany.charAt(0).toUpperCase() + guessedCompany.slice(1);
                }
            }
        }

        document.getElementById('leadRequirement').value = text;
        if (promptContainer) promptContainer.classList.add('hidden');
    });

    // --- Form Submissions ---
    if (leadForm) leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('leadId').value || leadModal.getAttribute('data-edit-id');

        // Collect multiple emails and phones
        const emails = Array.from(document.querySelectorAll('.lead-email-input')).map(input => input.value.trim()).filter(v => v);
        const phones = Array.from(document.querySelectorAll('.lead-phone-input')).map(input => input.value.trim()).filter(v => v);

        const data = {
            name: document.getElementById('leadName').value,
            leadDate: document.getElementById('leadDate').value || new Date().toISOString().split('T')[0],
            emails: emails,
            email: emails[0] || '', // Maintain backward compatibility for single field use
            phones: phones,
            phone: phones[0] || '', // Maintain backward compatibility for single field use
            company: document.getElementById('leadCompany').value,
            companyId: document.getElementById('leadCompanyId').value,
            country: (document.getElementById('leadCountry') || {}).value || '',
            state: (document.getElementById('leadState') || {}).value || '',
            city: (document.getElementById('leadCity') || {}).value || '',
            location: (() => {
                const country = (document.getElementById('leadCountry') || {}).value || '';
                const state = (document.getElementById('leadState') || {}).value || '';
                const city = (document.getElementById('leadCity') || {}).value || '';
                const locInput = (document.getElementById('leadLocation') || {}).value || '';
                if (locInput) return locInput;
                return [city, state, country].filter(Boolean).join(', ');
            })(),
            website: document.getElementById('leadWebsite').value,
            status: document.getElementById('leadStatus').value,
            result: document.getElementById('leadResult').value,
            source: (document.getElementById('leadSource') || {}).value || 'Direct',
            sourceTag: (document.getElementById('leadSourceTag') || {}).value || '',
            requirement: document.getElementById('leadRequirement').value,
            tags: document.getElementById('leadTags').value,
            quality: parseInt(document.getElementById('leadQuality').value) || 2
        };

        const url = id ? `${API_BASE}/leads/${id}` : `${API_BASE}/leads`;
        const method = id ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        closeModal(leadModal);
        fetchLeads();
    });

    if (detEditBtn) detEditBtn.onclick = () => {
        const leadId = detailsModal.getAttribute('data-lead-id');
        const lead = leadsData.find(l => l.id === leadId);
        if (lead) {
            closeModal(detailsModal);
            editLead(leadId, { stopPropagation: () => { } });
        }
    };

    document.querySelectorAll('.btn-quick').forEach(btn => {
        btn.onclick = async () => {
            const leadId = detailsModal.getAttribute('data-lead-id');
            const action = btn.getAttribute('data-action');
            const summary = action === 'WhatsApped' ? 'Sent a WhatsApp message.' :
                action === 'Sent Email' ? 'Sent an email to the client.' :
                    action === 'Called' ? 'Had a phone call with the client.' :
                        action === 'Meeting' ? 'Met with the client.' : action;

            await fetch(`${API_BASE}/leads/${leadId}/followups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method: action, summary })
            });

            await fetchLeads();
            const updated = leadsData.find(l => l.id === leadId);
            if (updated) renderFollowUps(updated.followUps);
        };
    });

    if (addFollowUpBtn) addFollowUpBtn.addEventListener('click', () => { if (followupFormContainer) followupFormContainer.classList.toggle('hidden'); });
    if (cancelFuBtn) cancelFuBtn.addEventListener('click', () => { if (followupFormContainer) followupFormContainer.classList.add('hidden'); });

    if (followUpForm) followUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const leadId = document.getElementById('fuLeadId').value;
        const data = { method: document.getElementById('fuMethod').value, summary: document.getElementById('fuSummary').value };
        await fetch(`${API_BASE}/leads/${leadId}/followups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (followupFormContainer) followupFormContainer.classList.add('hidden');
        followUpForm.reset();
        await fetchLeads();
        const updated = leadsData.find(l => l.id === leadId);
        if (updated) renderFollowUps(updated.followUps);
    });

    if (btnAutoReply) btnAutoReply.onclick = () => {
        const leadId = detailsModal.getAttribute('data-lead-id');
        const lead = leadsData.find(l => l.id === leadId);
        if (lead) {
            const query = lead.requirement || lead.tags || '';
            const name = lead.name || '';
            const phone = (lead.phones && lead.phones[0]) || lead.phone || '';
            const email = (lead.emails && lead.emails[0]) || lead.email || '';
            const company = lead.company || '';
            const location = lead.location || '';

            // Redirect to machine-based-question tool with lead details in URL
            const params = new URLSearchParams({
                name,
                query,
                phone,
                email,
                company,
                location
            });
            window.location.href = `auto-reply/machine-based-question.html?${params.toString()}`;
        }
    };
} // end bindLeadModalEvents



// --- Actions (Edit/Delete) ---
window.editLead = (id, event) => {
    event.stopPropagation();
    const lead = leadsData.find(l => l.id === id);
    if (!lead) return;
    document.getElementById('modalTitle').textContent = 'Edit Lead';
    document.getElementById('leadId').value = lead.id;
    document.getElementById('leadName').value = lead.name;
    document.getElementById('leadDate').value = (lead.leadDate || lead.createdAt).split('T')[0];
    // Clear and populate dynamic emails
    const emailContainer = document.getElementById('emailContainer');
    if (emailContainer) {
        emailContainer.innerHTML = '';
        const emailList = lead.emails || (lead.email ? [lead.email] : []);
        if (emailList.length === 0) emailList.push('');
        emailList.forEach((email, i) => {
            const div = document.createElement('div');
            div.className = 'input-group mb-2';
            div.innerHTML = `
                <input type="email" class="lead-email-input" placeholder="Email ${i + 1}" value="${email}">
                ${i === 0 ? `<button type="button" class="btn-icon add-field-btn" onclick="addField('emailContainer', 'email')"><i class="fas fa-plus"></i></button>` : `<button type="button" class="btn-icon remove-field-btn" onclick="this.parentElement.remove()"><i class="fas fa-minus"></i></button>`}
            `;
            emailContainer.appendChild(div);
        });
    }

    // Clear and populate dynamic phones
    const phoneContainer = document.getElementById('phoneContainer');
    if (phoneContainer) {
        phoneContainer.innerHTML = '';
        const phoneList = lead.phones || (lead.phone ? [lead.phone] : []);
        if (phoneList.length === 0) phoneList.push('');
        phoneList.forEach((phone, i) => {
            const div = document.createElement('div');
            div.className = 'input-group mb-2';
            div.innerHTML = `
                <input type="tel" class="lead-phone-input" placeholder="Mobile ${i + 1}" value="${phone}">
                ${i === 0 ? `<button type="button" class="btn-icon add-field-btn" onclick="addField('phoneContainer', 'phone')"><i class="fas fa-plus"></i></button>` : `<button type="button" class="btn-icon remove-field-btn" onclick="this.parentElement.remove()"><i class="fas fa-minus"></i></button>`}
            `;
            phoneContainer.appendChild(div);
        });
    }

    document.getElementById('leadCompany').value = lead.company || '';
    if (document.getElementById('leadCompanyId')) document.getElementById('leadCompanyId').value = lead.companyId || '';
    if (document.getElementById('leadCountry') || document.getElementById('leadState') || document.getElementById('leadCity') || document.getElementById('leadLocation')) {
        const country = lead.country !== undefined ? (lead.country || '') : '';
        const state = lead.state !== undefined ? (lead.state || '') : '';
        const city = lead.city !== undefined ? (lead.city || '') : '';
        const location = lead.location || '';
        
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
        
        if (document.getElementById('leadCountry')) document.getElementById('leadCountry').value = finalCountry;
        if (document.getElementById('leadState')) document.getElementById('leadState').value = finalState;
        if (document.getElementById('leadCity')) document.getElementById('leadCity').value = finalCity;
        if (document.getElementById('leadLocation')) document.getElementById('leadLocation').value = location;
    }
    document.getElementById('leadWebsite').value = lead.website || '';
    document.getElementById('leadStatus').value = lead.status || 'New';
    document.getElementById('leadResult').value = lead.result || 'Pending';
    document.getElementById('leadRequirement').value = lead.requirement || '';
    document.getElementById('leadTags').value = lead.tags || '';
    document.getElementById('leadQuality').value = lead.quality !== undefined ? lead.quality : 2;

    // Lead Source fields
    const sourceEl = document.getElementById('leadSource');
    if (sourceEl) sourceEl.value = lead.source || 'Direct';

    const tagEl = document.getElementById('leadSourceTag');
    if (tagEl) tagEl.value = lead.sourceTag || lead.exhibition || '';

    openModal(leadModal);
};

window.deleteLead = async (id, event) => {
    event.stopPropagation();
    if (!confirm('Delete this lead?')) return;
    await fetch(`${API_BASE}/leads/${id}`, { method: 'DELETE' });
    fetchLeads();
};



// --- Lead Details ---
function showDetails(lead) {
    document.getElementById('detName').textContent = lead.name;
    document.getElementById('detCompany').textContent = lead.company ? (lead.location ? `${lead.company} — ${lead.location}` : lead.company) : (lead.location || 'No Company');
    // Multiple Emails & Phones display
    const detEmail = document.getElementById('detEmail');
    if (detEmail) {
        const emailList = lead.emails || (lead.email ? [lead.email] : []);
        detEmail.innerHTML = emailList.length > 0 ? emailList.map(e => `<div>${e}</div>`).join('') : '-';
    }

    const detPhone = document.getElementById('detPhone');
    if (detPhone) {
        const phoneList = lead.phones || (lead.phone ? [lead.phone] : []);
        detPhone.innerHTML = phoneList.length > 0 ? phoneList.map(p => `<div>${p}</div>`).join('') : '-';
    }

    document.getElementById('detWebsite').textContent = lead.website || '-';
    document.getElementById('detRequirement').textContent = lead.requirement || 'No requirements specified.';

    const tagsContainer = document.getElementById('detTags');
    tagsContainer.innerHTML = '';
    if (lead.tags) {
        (Array.isArray(lead.tags) ? lead.tags : lead.tags.split(',')).forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag-pill';
            span.textContent = tag.trim();
            tagsContainer.appendChild(span);
        });
    }

    const statusBadge = document.getElementById('detStatusBadge');
    statusBadge.textContent = lead.status;
    statusBadge.className = `status-badge ${lead.status} mt-2`;

    const resultBadge = document.getElementById('detResultBadge');
    resultBadge.textContent = lead.result || 'Pending';
    resultBadge.className = `status-badge ${(lead.result || 'Pending').toLowerCase()}`;

    // Lead Source display
    const detSource = document.getElementById('detSource');
    if (detSource) {
        let sourceText = lead.source || 'Direct';
        const sTag = lead.sourceTag || lead.exhibition || '';
        if (sTag) {
            sourceText += ` — ${sTag}`;
        }
        detSource.textContent = sourceText;
    }

    // Company ID display
    const detCompany = document.getElementById('detCompany');
    if (detCompany) {
        let compText = lead.company || 'No Company';
        if (lead.companyId) compText += ` [${lead.companyId}]`;
        if (lead.location) compText += ` — ${lead.location}`;
        detCompany.textContent = compText;
    }

    // Quality Stars
    const quality = lead.quality || 2;
    document.querySelector('#detQuality .rating-value').textContent = quality;
    const starsContainer = document.getElementById('detQualityStars');
    starsContainer.innerHTML = '';
    for (let i = 1; i <= 9; i++) {
        const star = document.createElement('i');
        star.className = i <= quality ? 'fas fa-star' : 'far fa-star';
        starsContainer.appendChild(star);
    }

    document.getElementById('fuLeadId').value = lead.id;
    renderFollowUps(lead.followUps || []);
    followupFormContainer.classList.add('hidden');

    // Set current lead for quick actions
    detailsModal.setAttribute('data-lead-id', lead.id);

    openModal(detailsModal);
}

// (detEditBtn and btn-quick logic moved to bindLeadModalEvents)

function renderFollowUps(followUps) {
    const timeline = document.getElementById('followUpTimeline');
    if (!timeline) return;
    timeline.innerHTML = followUps.length === 0 ? '<p class="text-muted">No follow-ups.</p>' : '';
    [...followUps].sort((a, b) => {
        const getTime = (fu) => {
            if (!fu.date) return 0;
            const d = new Date(fu.date);
            return isNaN(d.getTime()) ? 0 : d.getTime();
        };
        return getTime(b) - getTime(a);
    }).forEach(fu => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        const dateStr = fu.date && !isNaN(new Date(fu.date).getTime()) ? new Date(fu.date).toLocaleString() : 'Unknown Date';
        item.innerHTML = `
            <div class="timeline-icon"><i class="fas fa-sticky-note"></i></div>
            <div class="timeline-content">
                <div class="timeline-meta"><strong>${fu.method}</strong> <span>${dateStr}</span></div>
                <div class="timeline-text">${fu.summary}</div>
            </div>
        `;
        timeline.appendChild(item);
    });
}

// Initial Load
async function initApp() {
    // Initialize common view elements
    leadsView = document.getElementById('leadsView');
    leadDatabaseView = document.getElementById('leadDatabaseView');
    companiesView = document.getElementById('companiesView');
    dashboardView = document.getElementById('dashboardView');
    personDatabaseView = document.getElementById('personDatabaseView');

    pageTitle = document.querySelector('.header-titles h1');
    pageSubtitle = document.querySelector('.header-titles p');
    addBtn = document.getElementById('addLeadBtn');

    await loadCommonTemplates();
    await loadLeadFormTemplate();
    bindAddBtnEvent();

    // Bind Lead Limit Select if present on page
    const limitSelect = document.getElementById('leadLimitSelect');
    if (limitSelect) {
        const savedLimit = localStorage.getItem('leadLimit') || '500';
        limitSelect.value = savedLimit;
        limitSelect.addEventListener('change', async (e) => {
            const newLimit = e.target.value;
            localStorage.setItem('leadLimit', newLimit);
            await fetchLeads();
        });
    }

    switchView(currentView);
    // fetchCompanies() is called by switchView above when currentView === 'companies'
    // For other pages, pre-load companies into memory for lead linking (e.g. autocomplete)
    if (currentView !== 'companies') fetchCompanies();
    // Pre-load leads into memory for dashboard stats; skip if already fetched by switchView
    if (currentView !== 'leads' && currentView !== 'lead-db' && currentView !== 'person-db') fetchLeads();
}

window.addEventListener('DOMContentLoaded', initApp);
