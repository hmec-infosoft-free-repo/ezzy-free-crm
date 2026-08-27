const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 7900;
const DATA_DIR = path.join(__dirname, 'local-data');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const LEADS_DIR = path.join(DATA_DIR, 'leads');
const PERSONS_DIR = path.join(LEADS_DIR, 'person-database');
const COMPANIES_DIR = path.join(LEADS_DIR, 'company-databse');
const YEARWISE_LEADS_DIR = path.join(LEADS_DIR, 'yearwise-leads');

// Initialize data directories
[DATA_DIR, LEADS_DIR, PERSONS_DIR, COMPANIES_DIR, YEARWISE_LEADS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Database configuration
const collections = {
    leads: path.join(DATA_DIR, 'leads.json'),
    companies: path.join(DATA_DIR, 'companies.json'),
    persons: path.join(DATA_DIR, 'person-database.json'),
    settings: path.join(DATA_DIR, 'settings.json')
};

// Initialize settings if not exists
if (!fs.existsSync(collections.settings)) {
    fs.writeFileSync(collections.settings, JSON.stringify({
        appName: "Ezzy Free CRM",
        version: "1.0.0",
        port: 7900,
        currency: "USD",
        defaultStatus: "New"
    }, null, 2));
}

const readData = (collection) => {
    if (collection === 'leads') {
        if (!fs.existsSync(YEARWISE_LEADS_DIR)) return [];
        const files = fs.readdirSync(YEARWISE_LEADS_DIR).filter(f => f.endsWith('-leads.json'));
        let allLeads = [];
        files.forEach(file => {
            try {
                const content = JSON.parse(fs.readFileSync(path.join(YEARWISE_LEADS_DIR, file), 'utf8'));
                allLeads = allLeads.concat(content);
            } catch (e) {
                console.error(`Error reading ${file}:`, e);
            }
        });
        return allLeads;
    }
    if (collection === 'persons') {
        if (!fs.existsSync(PERSONS_DIR)) return [];
        const files = fs.readdirSync(PERSONS_DIR).filter(f => f.startsWith('person-database-') && f.endsWith('.json'));
        let allPersons = [];
        files.forEach(file => {
            try {
                const content = JSON.parse(fs.readFileSync(path.join(PERSONS_DIR, file), 'utf8'));
                allPersons = allPersons.concat(content);
            } catch (e) {
                console.error(`Error reading ${file}:`, e);
            }
        });
        
        allPersons.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        return allPersons;
    }
    if (collection === 'companies') {
        if (!fs.existsSync(COMPANIES_DIR)) return [];
        const files = fs.readdirSync(COMPANIES_DIR).filter(f => f.startsWith('company-database-') && f.endsWith('.json'));
        let allCompanies = [];
        files.forEach(file => {
            try {
                const content = JSON.parse(fs.readFileSync(path.join(COMPANIES_DIR, file), 'utf8'));
                allCompanies = allCompanies.concat(content);
            } catch (e) {
                console.error(`Error reading ${file}:`, e);
            }
        });
        
        allCompanies.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        return allCompanies;
    }
    const file = collections[collection];
    if (!file || !fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const writeData = (collection, data) => {
    if (collection === 'leads') {
        const grouped = {};
        data.forEach(lead => {
            const date = lead.leadDate || lead.createdAt || new Date().toISOString();
            const year = new Date(date).getFullYear() || 2026;
            if (!grouped[year]) grouped[year] = [];
            grouped[year].push(lead);
        });

        Object.keys(grouped).forEach(year => {
            fs.writeFileSync(path.join(YEARWISE_LEADS_DIR, `${year}-leads.json`), JSON.stringify(grouped[year], null, 2));
        });
        return;
    }
    if (collection === 'persons') {
        const grouped = {};
        
        data.forEach(person => {
            const name = (person.name || '').trim();
            let firstChar = 'O';
            if (name) {
                const c = name.charAt(0).toUpperCase();
                if (c >= 'A' && c <= 'Z') {
                    firstChar = c;
                }
            }
            
            if (!grouped[firstChar]) {
                grouped[firstChar] = [];
            }
            
            if (!person.customId) {
                const existingIds = data
                    .filter(p => p.customId && p.customId.startsWith(`P-${firstChar}`))
                    .map(p => {
                        const numPart = p.customId.substring(4);
                        return parseInt(numPart, 10) || 0;
                    });
                const maxNum = existingIds.length > 0 ? Math.max(...existingIds) : 0;
                const nextNum = maxNum + 1;
                const padNum = String(nextNum).padStart(4, '0');
                person.customId = `P-${firstChar}${padNum}`;
            }
            
            grouped[firstChar].push(person);
        });
        
        if (fs.existsSync(PERSONS_DIR)) {
            const existingSplitFiles = fs.readdirSync(PERSONS_DIR).filter(f => f.startsWith('person-database-') && f.endsWith('.json'));
            existingSplitFiles.forEach(file => {
                try {
                    fs.unlinkSync(path.join(PERSONS_DIR, file));
                } catch (e) {}
            });
        } else {
            fs.mkdirSync(PERSONS_DIR, { recursive: true });
        }
        
        Object.keys(grouped).forEach(letter => {
            const file_name = `person-database-${letter.toLowerCase()}.json`;
            fs.writeFileSync(path.join(PERSONS_DIR, file_name), JSON.stringify(grouped[letter], null, 2));
        });
        return;
    }
    if (collection === 'companies') {
        const grouped = {};
        
        data.forEach(company => {
            const name = (company.name || '').trim();
            let firstChar = 'O';
            if (name) {
                const c = name.charAt(0).toUpperCase();
                if (c >= 'A' && c <= 'Z') {
                    firstChar = c;
                }
            }
            
            if (!grouped[firstChar]) {
                grouped[firstChar] = [];
            }
            
            grouped[firstChar].push(company);
        });
        
        if (fs.existsSync(COMPANIES_DIR)) {
            const existingSplitFiles = fs.readdirSync(COMPANIES_DIR).filter(f => f.startsWith('company-database-') && f.endsWith('.json'));
            existingSplitFiles.forEach(file => {
                try {
                    fs.unlinkSync(path.join(COMPANIES_DIR, file));
                } catch (e) {}
            });
        } else {
            fs.mkdirSync(COMPANIES_DIR, { recursive: true });
        }
        
        Object.keys(grouped).forEach(letter => {
            const file_name = `company-database-${letter.toLowerCase()}.json`;
            fs.writeFileSync(path.join(COMPANIES_DIR, file_name), JSON.stringify(grouped[letter], null, 2));
        });
        return;
    }
    const file = collections[collection];
    if (!file) return;
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

const ensureCompany = (companyName, website) => {
    if (!companyName) return null;
    const companies = readData('companies');
    let company = companies.find(c => c.name.toLowerCase() === companyName.toLowerCase());
    if (!company) {
        company = {
            id: uuidv4(),
            name: companyName,
            website: website || '',
            location: '',
            email: '',
            whatsapp: '',
            address: '',
            subCompanies: [],
            createdAt: new Date().toISOString(),
            crmAddedDate: new Date().toISOString().split('T')[0]
        };
        companies.push(company);
        writeData('companies', companies);
    }
    return company.id;
};

// --- Leads API ---
app.get('/api/leads', (req, res) => {
    let leads = readData('leads');
    
    leads.sort((a, b) => {
        const timeA = new Date(a.leadDate || a.createdAt || 0).getTime();
        const timeB = new Date(b.leadDate || b.createdAt || 0).getTime();
        return timeB - timeA;
    });

    const limit = req.query.limit;
    if (limit && limit !== 'all') {
        const limitVal = parseInt(limit, 10);
        if (!isNaN(limitVal)) {
            leads = leads.slice(0, limitVal);
        }
    }
    res.json(leads);
});

app.post('/api/leads', (req, res) => {
    const leads = readData('leads');
    const companyId = ensureCompany(req.body.company, req.body.website);
    const newLead = {
        id: uuidv4(),
        ...req.body,
        companyId: companyId,
        createdAt: new Date().toISOString(),
        followUps: req.body.followUps || []
    };
    leads.push(newLead);
    writeData('leads', leads);
    res.status(201).json(newLead);
});

app.put('/api/leads/:id', (req, res) => {
    const leads = readData('leads');
    const index = leads.findIndex(l => l.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Lead not found' });
    
    const companyId = ensureCompany(req.body.company, req.body.website);
    leads[index] = { 
        ...leads[index], 
        ...req.body, 
        companyId: companyId || leads[index].companyId,
        updatedAt: new Date().toISOString() 
    };
    writeData('leads', leads);
    res.json(leads[index]);
});

app.delete('/api/leads/:id', (req, res) => {
    let leads = readData('leads');
    leads = leads.filter(l => l.id !== req.params.id);
    writeData('leads', leads);
    res.json({ message: 'Lead deleted' });
});

app.post('/api/leads/:id/followups', (req, res) => {
    const leads = readData('leads');
    const index = leads.findIndex(l => l.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Lead not found' });
    
    const newFollowUp = { id: uuidv4(), date: new Date().toISOString(), ...req.body };
    if (!leads[index].followUps) leads[index].followUps = [];
    leads[index].followUps.push(newFollowUp);
    writeData('leads', leads);
    res.status(201).json(newFollowUp);
});

// --- Companies API ---
app.get('/api/companies', (req, res) => {
    let companies = readData('companies');
    
    companies.sort((a, b) => {
        const timeA = new Date(a.crmAddedDate || a.createdAt || 0).getTime();
        const timeB = new Date(b.crmAddedDate || b.createdAt || 0).getTime();
        return timeB - timeA;
    });

    const limit = req.query.limit;
    if (limit && limit !== 'all') {
        const limitVal = parseInt(limit, 10);
        if (!isNaN(limitVal)) {
            companies = companies.slice(0, limitVal);
        }
    }
    res.json(companies);
});

app.post('/api/companies', (req, res) => {
    const companies = readData('companies');
    const newCompany = {
        id: uuidv4(),
        ...req.body,
        createdAt: new Date().toISOString(),
        crmAddedDate: req.body.crmAddedDate || new Date().toISOString().split('T')[0]
    };
    companies.push(newCompany);
    writeData('companies', companies);
    res.status(201).json(newCompany);
});

app.put('/api/companies/:id', (req, res) => {
    const companies = readData('companies');
    const index = companies.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Company not found' });
    
    companies[index] = { ...companies[index], ...req.body, updatedAt: new Date().toISOString() };
    writeData('companies', companies);
    res.json(companies[index]);
});

app.delete('/api/companies/:id', (req, res) => {
    let companies = readData('companies');
    companies = companies.filter(c => c.id !== req.params.id);
    writeData('companies', companies);
    res.json({ message: 'Company deleted' });
});

// --- Persons API ---
app.get('/api/persons', (req, res) => {
    let persons = readData('persons');
    
    persons.sort((a, b) => {
        const timeA = new Date(a.crmAddedDate || a.createdAt || 0).getTime();
        const timeB = new Date(b.crmAddedDate || b.createdAt || 0).getTime();
        return timeB - timeA;
    });

    const limit = req.query.limit;
    if (limit && limit !== 'all') {
        const limitVal = parseInt(limit, 10);
        if (!isNaN(limitVal)) {
            persons = persons.slice(0, limitVal);
        }
    }
    res.json(persons);
});

app.post('/api/persons', (req, res) => {
    const persons = readData('persons');
    const newPerson = {
        id: uuidv4(),
        ...req.body,
        createdAt: new Date().toISOString(),
        crmAddedDate: req.body.crmAddedDate || new Date().toISOString().split('T')[0]
    };
    persons.push(newPerson);
    writeData('persons', persons);
    res.status(201).json(newPerson);
});

app.put('/api/persons/:id', (req, res) => {
    const persons = readData('persons');
    const index = persons.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Person not found' });
    
    persons[index] = { ...persons[index], ...req.body, updatedAt: new Date().toISOString() };
    writeData('persons', persons);
    res.json(persons[index]);
});

app.delete('/api/persons/:id', (req, res) => {
    let persons = readData('persons');
    persons = persons.filter(p => p.id !== req.params.id);
    writeData('persons', persons);
    res.json({ message: 'Person deleted' });
});

app.listen(PORT, () => {
    console.log(`Ezzy Free CRM server running on http://localhost:${PORT}`);
});
