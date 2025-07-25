// Test script to validate the FIREBASE_SERVICE_ACCOUNT value
const fs = require('fs');
const path = require('path');

// Read the .env file
const envContent = fs.readFileSync('.env', 'utf-8');
console.log('Reading .env file...');

// Extract the FIREBASE_SERVICE_ACCOUNT value
const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT=(.*)/);
if (!match) {
  console.error('FIREBASE_SERVICE_ACCOUNT not found in .env file');
  process.exit(1);
}

const value = match[1];
console.log('Extracted value:', value);

try {
  // Try to parse the value
  const parsed = JSON.parse(value);
  console.log('✅ Successfully parsed JSON:', Object.keys(parsed));
} catch (error) {
  console.error('❌ Failed to parse JSON:', error.message);
  console.error('Error at position:', error.message.match(/position (\d+)/)?.[1]);
}
