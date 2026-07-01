/* eslint-disable */
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Real coordinates for major Dhaka bus stops based on internal knowledge
const realCoords = {
  "Kalshi": { lat: 23.8223, lng: 90.3654 },
  "Mirpur-12": { lat: 23.8242, lng: 90.3664 },
  "Mirpur-11": { lat: 23.8166, lng: 90.3672 },
  "Mirpur-10": { lat: 23.8069, lng: 90.3687 },
  "Kazipara": { lat: 23.7963, lng: 90.3737 },
  "Shewrapara": { lat: 23.7885, lng: 90.3756 },
  "Agargaon": { lat: 23.7777, lng: 90.3776 },
  "Khamar Bari": { lat: 23.7594, lng: 90.3850 },
  "Farmgate": { lat: 23.7561, lng: 90.3872 },
  "Karwan Bazar": { lat: 23.7495, lng: 90.3950 },
  "Banglamotor": { lat: 23.7425, lng: 90.3957 },
  "Shahbag": { lat: 23.7383, lng: 90.3957 },
  "Press Club": { lat: 23.7319, lng: 90.4070 },
  "Gulistan": { lat: 23.7277, lng: 90.4137 },
  "Motijheel": { lat: 23.7270, lng: 90.4187 },
  "Tikatuli": { lat: 23.7176, lng: 90.4262 },
  "Sayedabad": { lat: 23.7126, lng: 90.4402 },
  "Jatrabari": { lat: 23.7088, lng: 90.4503 },
  "Signboard": { lat: 23.7046, lng: 90.4682 },
  "Kanchpur Bridge": { lat: 23.7042, lng: 90.5230 },
  "Kanchpur": { lat: 23.7042, lng: 90.5230 },
  "Uttara": { lat: 23.8759, lng: 90.3976 },
  "House Building": { lat: 23.8765, lng: 90.3995 },
  "Azampur": { lat: 23.8687, lng: 90.4010 },
  "Rajlakshmi": { lat: 23.8631, lng: 90.4025 },
  "Jashimuddin": { lat: 23.8569, lng: 90.4037 },
  "Airport": { lat: 23.8475, lng: 90.4026 },
  "Khilkhet": { lat: 23.8277, lng: 90.4206 },
  "Bishwa Road": { lat: 23.8180, lng: 90.4258 },
  "Kuril Bishwa Road": { lat: 23.8180, lng: 90.4258 },
  "Jamuna Future Park": { lat: 23.8130, lng: 90.4239 },
  "Notun Bazar": { lat: 23.7990, lng: 90.4230 },
  "Badda": { lat: 23.7806, lng: 90.4266 },
  "Middle Badda": { lat: 23.7788, lng: 90.4256 },
  "Merul Badda": { lat: 23.7719, lng: 90.4243 },
  "Rampura Bridge": { lat: 23.7651, lng: 90.4223 },
  "Rampura": { lat: 23.7618, lng: 90.4200 },
  "Malibagh": { lat: 23.7483, lng: 90.4150 },
  "Mouchak": { lat: 23.7441, lng: 90.4137 },
  "Kakrail": { lat: 23.7383, lng: 90.4093 },
  "Paltan": { lat: 23.7317, lng: 90.4116 },
  "Nadda": { lat: 23.8073, lng: 90.4237 },
  "Gulshan-1": { lat: 23.7804, lng: 90.4162 },
  "Gulshan-2": { lat: 23.7937, lng: 90.4144 },
  "Banani": { lat: 23.7940, lng: 90.4043 },
  "Kakali": { lat: 23.7997, lng: 90.4024 },
  "Mohakhali": { lat: 23.7770, lng: 90.4023 },
  "Moghbazar": { lat: 23.7490, lng: 90.4063 },
  "Dhanmondi-27": { lat: 23.7523, lng: 90.3753 },
  "Dhanmondi-32": { lat: 23.7505, lng: 90.3755 },
  "Asad Gate": { lat: 23.7594, lng: 90.3732 },
  "Shyamoli": { lat: 23.7725, lng: 90.3664 },
  "Kalyanpur": { lat: 23.7797, lng: 90.3606 },
  "Darussalam": { lat: 23.7845, lng: 90.3524 },
  "Technical": { lat: 23.7877, lng: 90.3475 },
  "Gabtoli": { lat: 23.7840, lng: 90.3421 },
  "Mirpur-1": { lat: 23.7956, lng: 90.3537 },
  "Mirpur-2": { lat: 23.8037, lng: 90.3592 },
  "Sony Cinema Hall": { lat: 23.8028, lng: 90.3541 },
  "Science Lab": { lat: 23.7384, lng: 90.3845 },
  "New Market": { lat: 23.7329, lng: 90.3840 },
  "Azimpur": { lat: 23.7275, lng: 90.3853 },
  "Nilkhet": { lat: 23.7335, lng: 90.3876 },
  "Katabon": { lat: 23.7382, lng: 90.3905 },
  "Bata Signal": { lat: 23.7388, lng: 90.3920 },
  "Hatirjheel": { lat: 23.7661, lng: 90.4069 }
};

let updatedStops = 0;

data.routes.forEach(r => {
  let prevCoord = null;
  r.stops.forEach((s, index) => {
    // Find matching real coord
    // check exact match
    let match = realCoords[s.name.en];
    if (!match) {
      // check partial match
      for (const [key, val] of Object.entries(realCoords)) {
        if (s.name.en.toLowerCase().includes(key.toLowerCase())) {
          match = val;
          break;
        }
      }
    }
    
    if (match) {
      s.lat = match.lat;
      s.lng = match.lng;
      prevCoord = match;
      updatedStops++;
    } else {
      // Optionally apply a very tiny jitter around the previous coordinate just so the map connects them if we really want to draw a full line,
      // But it's better to just delete them so the polyline only draws between known real coordinates!
      delete s.lat;
      delete s.lng;
    }
  });
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Successfully mapped ${updatedStops} real stop coordinates in data.json!`);
