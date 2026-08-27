function formatTitleCase(str) {
    if (!str) return '';
    return str.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function parseLocationDetails(providedCountry, providedState, locationStr) {
    let country = (providedCountry || '').trim();
    let state = (providedState || '').trim();
    const loc = (locationStr || '').trim();

    if (!country && !state && (!loc || loc.toLowerCase() === 'not specified')) {
        return { country: 'Not Specified', state: 'Not Specified' };
    }

    const locLower = loc.toLowerCase();

    // If country is missing, derive it from the location string
    if (!country) {
        if (locLower.includes('india') || locLower.includes('gujarat') || locLower.includes('maharashtra') || locLower.includes('mumbai') || locLower.includes('ahmedabad') || locLower.includes('delhi') || locLower.includes('telangana') || locLower.includes('hyderabad') || locLower.includes('karnataka') || locLower.includes('bangalore') || locLower.includes('rajasthan') || locLower.includes('kota') || locLower.includes('bihar') || locLower.includes('patna') || locLower.includes('haryana') || locLower.includes('gurugram') || locLower.includes('faridabad') || locLower.includes('punjab') || locLower.includes('mohali') || locLower.includes('indore') || locLower.includes('m.p') || locLower.includes('mp') || locLower.includes('haridwar') || locLower.includes('noida') || locLower.includes('baddi') || locLower.includes('h.p') || locLower.includes('hp') || locLower.includes('vadodara') || locLower.includes('rajkot') || locLower.includes('gandhinagar') || locLower.includes('panchmahal') || locLower.includes('bidar') || locLower.includes('secunderabad') || locLower.includes('bhuvn') || locLower.includes('sika') || locLower.includes('dholka') || locLower.includes('chennai') || locLower.includes('tamil nadu')) {
            country = 'India';
        } else if (locLower.includes('uae') || locLower.includes('dubai') || locLower.includes('abu dhabi')) {
            country = 'UAE';
        } else if (locLower.includes('pakistan') || locLower.includes('karachi') || locLower.includes('lahore')) {
            country = 'Pakistan';
        } else if (locLower.includes('sri lanka') || locLower.includes('horana')) {
            country = 'Sri Lanka';
        } else if (locLower.includes('myanmar') || locLower.includes('yangon')) {
            country = 'Myanmar';
        } else if (locLower.includes('nepal') || locLower.includes('kathmandu')) {
            country = 'Nepal';
        } else if (locLower.includes('morocco') || locLower.includes('casablanca')) {
            country = 'Morocco';
        } else if (locLower.includes('bangladesh') || locLower.includes('dhaka')) {
            country = 'Bangladesh';
        } else if (loc.includes(',')) {
            country = loc.split(',').pop().trim();
        } else {
            country = loc;
        }
    }

    country = formatTitleCase(country);

    // If state is missing, derive it from the location string
    if (!state) {
        if (country === 'India') {
            if (locLower.includes('gujarat') || locLower.includes('ahmedabad') || locLower.includes('vadodara') || locLower.includes('rajkot') || locLower.includes('gandhinagar') || locLower.includes('panchmahal') || locLower.includes('dholka') || locLower.includes('surat') || locLower.includes('ankleshwar') || locLower.includes('vapi')) {
                state = 'Gujarat';
            } else if (locLower.includes('maharashtra') || locLower.includes('mumbai') || locLower.includes('navi mumbai') || locLower.includes('pune') || locLower.includes('thane') || locLower.includes('nashik')) {
                state = 'Maharashtra';
            } else if (locLower.includes('delhi') || locLower.includes('new delhi')) {
                state = 'Delhi';
            } else if (locLower.includes('telangana') || locLower.includes('hyderabad') || locLower.includes('secunderabad')) {
                state = 'Telangana';
            } else if (locLower.includes('karnataka') || locLower.includes('bidar') || locLower.includes('bangalore') || locLower.includes('bengaluru')) {
                state = 'Karnataka';
            } else if (locLower.includes('rajasthan') || locLower.includes('kota') || locLower.includes('jaipur') || locLower.includes('udaipur')) {
                state = 'Rajasthan';
            } else if (locLower.includes('bihar') || locLower.includes('patna')) {
                state = 'Bihar';
            } else if (locLower.includes('haryana') || locLower.includes('gurugram') || locLower.includes('faridabad') || locLower.includes('panipat')) {
                state = 'Haryana';
            } else if (locLower.includes('punjab') || locLower.includes('mohali') || locLower.includes('chandigarh') || locLower.includes('ludhiana')) {
                state = 'Punjab';
            } else if (locLower.includes('m.p') || locLower.includes('mp') || locLower.includes('indore') || locLower.includes('madhya pradesh') || locLower.includes('bhopal')) {
                state = 'Madhya Pradesh';
            } else if (locLower.includes('h.p') || locLower.includes('hp') || locLower.includes('baddi') || locLower.includes('solan') || locLower.includes('himachal pradesh') || locLower.includes('kala amb')) {
                state = 'Himachal Pradesh';
            } else if (locLower.includes('uttar pradesh') || locLower.includes('noida') || locLower.includes('greater noida') || locLower.includes('ghaziabad') || locLower.includes('lucknow')) {
                state = 'Uttar Pradesh';
            } else if (locLower.includes('haridwar') || locLower.includes('uttarakhand') || locLower.includes('roorkee') || locLower.includes('dehradun')) {
                state = 'Uttarakhand';
            } else if (locLower.includes('tamil nadu') || locLower.includes('chennai') || locLower.includes('coimbatore')) {
                state = 'Tamil Nadu';
            } else if (locLower.includes('west bengal') || locLower.includes('kolkata')) {
                state = 'West Bengal';
            } else if (locLower.includes('sikkim')) {
                state = 'Sikkim';
            } else if (locLower.includes('assam') || locLower.includes('guwahati')) {
                state = 'Assam';
            } else {
                const parts = loc.split(',');
                if (parts.length > 1) {
                    state = parts[parts.length - 2].trim();
                } else {
                    state = 'Others';
                }
            }
        } else {
            const parts = loc.split(',');
            if (parts.length > 1) {
                state = parts[parts.length - 2].trim();
            } else {
                state = country;
            }
        }
    }

    state = formatTitleCase(state);

    // Final Normalization: Resolve overlaps
    if (state.toLowerCase() === 'india' && !country) {
        country = 'India';
        state = 'Others';
    } else if (state.toLowerCase() === 'india' || state.toLowerCase() === country.toLowerCase()) {
        state = 'Others';
    }

    return { country, state };
}

if (typeof window !== 'undefined') {
    window.parseLocationDetails = parseLocationDetails;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseLocationDetails };
}
