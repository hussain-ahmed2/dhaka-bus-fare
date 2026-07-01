/* eslint-disable */
const fs = require('fs');
const https = require('https');
const path = require('path');

const dataPath = path.join(__dirname, '../data/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Extract unique stops
const uniqueStops = new Set();
data.routes.forEach(r => {
    r.stops.forEach(s => uniqueStops.add(s.name.en));
});
const stopsArray = Array.from(uniqueStops);

console.log(`Starting geocoding for ${stopsArray.length} stops via Nominatim (1 request per second)...`);

const cachePath = path.join(__dirname, 'geocode_cache.json');
let cache = {};
if (fs.existsSync(cachePath)) {
    cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
}

async function geocode(stopName) {
    if (cache[stopName]) return cache[stopName];
    
    const query = `${stopName}, Dhaka, Bangladesh`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    
    return new Promise((resolve) => {
        https.get(url, { headers: { 'User-Agent': 'DhakaBusFareApp/1.0 (test@example.com)' } }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    if (result && result.length > 0) {
                        const coords = { lat: parseFloat(result[0].lat), lng: parseFloat(result[0].lon) };
                        cache[stopName] = coords;
                        resolve(coords);
                    } else {
                        cache[stopName] = null; // Mark as not found to avoid retrying
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < stopsArray.length; i++) {
        const stopName = stopsArray[i];
        if (cache[stopName] !== undefined) {
            if (cache[stopName]) successCount++;
            else failCount++;
            continue;
        }
        
        console.log(`[${i+1}/${stopsArray.length}] Geocoding: ${stopName}...`);
        const coords = await geocode(stopName);
        if (coords) {
            console.log(`  -> Found: ${coords.lat}, ${coords.lng}`);
            successCount++;
        } else {
            console.log(`  -> Not found`);
            failCount++;
        }
        
        // Save cache periodically
        if (i % 10 === 0) {
            fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
        }
        
        // Nominatim policy: max 1 request per second
        await sleep(1200);
    }
    
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    
    console.log(`\nGeocoding complete! Found: ${successCount}, Failed: ${failCount}`);
    
    // Now apply to data.json
    console.log('Applying coordinates to data.json...');
    let updatedStops = 0;
    data.routes.forEach(r => {
        r.stops.forEach(s => {
            const c = cache[s.name.en];
            if (c) {
                s.lat = c.lat;
                s.lng = c.lng;
                updatedStops++;
            } else {
                delete s.lat;
                delete s.lng;
            }
        });
    });
    
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log(`Successfully updated ${updatedStops} stop instances in data.json with real coordinates!`);
}

main();
