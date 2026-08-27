const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
function uuidv4() { return crypto.randomUUID(); }

const dir = path.join(__dirname, 'local-data', 'leads', 'yearwise-leads');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

const schemaKeys = [
  'id', 'name', 'leadDate', 'email', 'emails', 'phone', 'phones', 
  'company', 'companyId', 'location', 'country', 'state', 'city', 
  'website', 'status', 'result', 'source', 'sourceTag', 'source_tags', 
  'requirement', 'requirement_tags', 'tags', 'quality', 'createdAt', 'updatedAt', 'followUps'
];

for (const file of files) {
    const filePath = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const formattedData = data.map(lead => {
        const newLead = {};
        
        schemaKeys.forEach(key => {
            if (key === 'id') newLead[key] = lead[key] || uuidv4();
            else if (key === 'name') newLead[key] = lead[key] || 'Unknown';
            else if (key === 'leadDate') newLead[key] = lead[key] || (lead.createdAt ? lead.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]);
            else if (key === 'emails' || key === 'phones' || key === 'followUps' || key === 'source_tags' || key === 'requirement_tags') {
                newLead[key] = Array.isArray(lead[key]) ? lead[key] : (lead[key] ? [lead[key]] : []);
            }
            else if (key === 'status') newLead[key] = lead[key] || 'New';
            else if (key === 'result') newLead[key] = lead[key] || 'Pending';
            else if (key === 'quality') newLead[key] = (lead[key] !== undefined && lead[key] !== null && lead[key] !== '') ? lead[key] : 3;
            else if (key === 'createdAt') newLead[key] = lead[key] || new Date().toISOString();
            else if (key === 'updatedAt') newLead[key] = lead[key] || '';
            else newLead[key] = lead[key] !== undefined ? lead[key] : (key === 'companyId' ? null : '');
        });

        for (const [k, v] of Object.entries(lead)) {
            if (!schemaKeys.includes(k)) {
                newLead[k] = v;
            }
        }
        
        if (Array.isArray(newLead.followUps)) {
            newLead.followUps = newLead.followUps.map(f => {
                return {
                    id: f.id || uuidv4(),
                    date: f.date || new Date().toISOString(),
                    method: f.method || 'Other',
                    summary: f.summary || ''
                };
            });
        }
        
        return newLead;
    });

    fs.writeFileSync(filePath, JSON.stringify(formattedData, null, 2));
    console.log('Formatted ' + file);
}

