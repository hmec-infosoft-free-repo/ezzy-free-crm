const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'local-data', 'leads', 'yearwise-leads');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

function extractRequirementTags(reqStr) {
    if (!reqStr) return [];
    reqStr = reqStr.toLowerCase();
    const tags = new Set();
    
    // Core Machines
    if (reqStr.includes('capping')) {
        tags.add('capping machine');
        if (reqStr.includes('screw')) tags.add('screw capping machine');
        if (reqStr.includes('ropp')) tags.add('ropp capping machine');
        if (reqStr.includes('single head')) tags.add('single head capping machine');
        if (reqStr.includes('single head screw')) tags.add('single head screw capping machine');
    }
    if (reqStr.includes('filling')) {
        tags.add('filling machine');
        if (reqStr.includes('liquid')) tags.add('liquid filling machine');
        if (reqStr.includes('powder')) tags.add('powder filling machine');
        if (reqStr.includes('semi automatic')) tags.add('semi automatic filling machine');
    }
    if (reqStr.includes('labeling') || reqStr.includes('labelling')) {
        tags.add('labeling machine');
        if (reqStr.includes('sticker')) tags.add('sticker labeling machine');
        if (reqStr.includes('wrap')) tags.add('wrap around labeling machine');
    }
    if (reqStr.includes('washing')) {
        tags.add('washing machine');
        if (reqStr.includes('bottle')) tags.add('bottle washing machine');
        if (reqStr.includes('rotary')) tags.add('rotary washing machine');
    }
    if (reqStr.includes('counting')) {
        tags.add('counting machine');
        if (reqStr.includes('tablet') || reqStr.includes('capsule')) tags.add('tablet counting machine');
    }
    if (reqStr.includes('turnkey') || reqStr.includes('line')) {
        tags.add('turnkey line');
    }
    if (reqStr.includes('packaging')) {
        tags.add('packaging machine');
    }
    
    return Array.from(tags);
}

function extractSourceTags(sourceStr, sourceTagStr, existingTags) {
    const s = (sourceStr || '').toLowerCase();
    const st = (sourceTagStr || '').toLowerCase();
    const tags = new Set(existingTags || []);

    // Method tags
    if (s.includes('direct') || st.includes('direct')) tags.add('direct');
    if (s.includes('call') || st.includes('call')) tags.add('call');
    if (s.includes('whatsapp') || st.includes('whatsapp')) tags.add('whatsapp');
    if (s.includes('mail') || st.includes('mail')) tags.add('mail');
    
    // Exhibition tags
    if (s.includes('exhibition') || st.includes('exhibition')) {
        tags.add('exhibition');
        if (st.includes('pmec')) tags.add('pmec');
        if (st.includes('pharmalytica')) tags.add('pharmalytica');
        if (st.includes('packplus')) tags.add('packplus');
        if (st.includes('propak')) tags.add('propak');
        
        // Extract year (2010 - 2030)
        const yearMatch = st.match(/(20[1-3][0-9])/);
        if (yearMatch) {
            const year = yearMatch[0];
            if (st.includes('pmec')) tags.add('pmec ' + year);
            if (st.includes('pharmalytica')) tags.add('pharmalytica ' + year);
        }
    }

    // Portal tags
    if (s.includes('indiamart') || st.includes('indiamart')) tags.add('indiamart');
    if (s.includes('tradeindia') || st.includes('tradeindia')) tags.add('tradeindia');
    if (s.includes('exporter') || st.includes('exporter')) tags.add('exporter india');
    
    // Agent tags
    if (s.includes('prerak') || st.includes('prerak')) {
        tags.add('prerak');
        tags.delete('harshal');
    } else {
        tags.add('harshal');
    }

    return Array.from(tags);
}

for (const file of files) {
    const filePath = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const formattedData = data.map(lead => {
        // Old tags are mostly requirement tags according to user.
        let existingOldTags = [];
        if (Array.isArray(lead.tags)) existingOldTags = lead.tags;
        else if (typeof lead.tags === 'string') existingOldTags = lead.tags.split(',').map(t=>t.trim()).filter(Boolean);
        
        // Combine old tags and intelligent requirement extraction
        const newReqTags = new Set([...existingOldTags.map(t=>t.toLowerCase()), ...extractRequirementTags(lead.requirement)]);
        lead.requirement_tags = Array.from(newReqTags);
        
        // Build robust source tags
        lead.source_tags = extractSourceTags(lead.source, lead.sourceTag, lead.source_tags);
        
        return lead;
    });

    fs.writeFileSync(filePath, JSON.stringify(formattedData, null, 2));
    console.log('Smart Tagged ' + file);
}

