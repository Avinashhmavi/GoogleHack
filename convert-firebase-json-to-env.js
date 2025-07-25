// convert-firebase-json-to-env.js

const fs = require('fs');

// Step 1: Read original JSON file
const rawJson = fs.readFileSync('firebase-service-account.json', 'utf-8');
const serviceAccount = JSON.parse(rawJson);

// Step 2: Escape newlines in private_key with double backslashes
serviceAccount.private_key = serviceAccount.private_key.replace(/\n/g, '\\\\n');

// Step 3: Convert to single-line JSON string with proper escaping
const escapedJsonString = JSON.stringify(serviceAccount).replace(/\\/g, '\\\\');

// Step 4: Wrap in FIREBASE_SERVICE_ACCOUNT with proper escaping
const envVariable = `FIREBASE_SERVICE_ACCOUNT="${escapedJsonString.replace(/"/g, '\\"')}"`;

console.log('\n✅ Copy and paste this into your .env.local file:\n');
console.log(envVariable);
