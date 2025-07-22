// convert-firebase-json-to-env.js

const fs = require('fs');

// Step 1: Read original JSON file
const rawJson = fs.readFileSync('firebase-service-account.json', 'utf-8');
const serviceAccount = JSON.parse(rawJson);

// Step 2: Escape newlines in private_key
serviceAccount.private_key = serviceAccount.private_key.replace(/\n/g, '\\n');

// Step 3: Convert to single-line JSON string
const escapedJsonString = JSON.stringify(serviceAccount);

// Step 4: Wrap in FIREBASE_SERVICE_ACCOUNT='...'
const envVariable = `FIREBASE_SERVICE_ACCOUNT='${escapedJsonString}'`;

console.log('\n✅ Copy and paste this into your .env.local file:\n');
console.log(envVariable);