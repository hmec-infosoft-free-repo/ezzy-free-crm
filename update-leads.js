const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'local-data', 'leads', 'yearwise-leads');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

for (const file of files) {
    const filePath = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let modified = false;

    data.forEach(lead => {
        if (lead.source === undefined) lead.source = '';
        if (lead.requirement === undefined) lead.requirement = '';
        if (lead.source_tags === undefined) lead.source_tags = [];
        if (lead.requirement_tags === undefined) lead.requirement_tags = [];

        const isPrerak = 
            (lead.source || '').toLowerCase().includes('prerak') ||
            (lead.sourceTag || '').toLowerCase().includes('prerak') ||
            (Array.isArray(lead.source_tags) ? lead.source_tags.join(' ').toLowerCase() : (lead.source_tags || '').toLowerCase()).includes('prerak') ||
            (Array.isArray(lead.tags) ? lead.tags.join(' ').toLowerCase() : (lead.tags || '').toLowerCase()).includes('prerak');

        if (!isPrerak) {
            if (Array.isArray(lead.source_tags)) {
                if (!lead.source_tags.includes('harshal') && !lead.source_tags.includes('Harshal')) {
                    lead.source_tags.push('harshal');
                }
            } else if (typeof lead.source_tags === 'string') {
                if (!lead.source_tags.toLowerCase().includes('harshal')) {
                    lead.source_tags = lead.source_tags ? lead.source_tags + ', harshal' : 'harshal';
                }
            }
        }
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('Updated ' + file);
}

