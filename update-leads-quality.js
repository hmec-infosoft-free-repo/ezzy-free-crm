const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'local-data', 'leads', 'yearwise-leads');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

for (const file of files) {
    const filePath = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    data.forEach(lead => {
        if (lead.quality === undefined || lead.quality === null || lead.quality === '') {
            lead.quality = 3;
        }
        if (lead.qualityVal === undefined || lead.qualityVal === null || lead.qualityVal === '') {
            lead.qualityVal = 3;
        }
    });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('Updated ' + file);
}

