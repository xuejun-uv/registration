import QRCode from 'qrcode';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const domain = process.env.DOMAIN || 'https://registration-orpin-alpha.vercel.app';
// Updated to 11 booths to match the UI (4+3+4)
const booths = ['booth1', 'booth2', 'booth3', 'booth4', 'booth5', 'booth6', 'booth7', 'booth8', 'booth9', 'booth10', 'booth11'];
const userIdPlaceholder = 'USER_ID';

console.log(`Generating QR codes for domain: ${domain}`);
console.log(`Total booths: ${booths.length}`);

booths.forEach(async (booth) => {
  const url = `${domain}/stamps?id=${userIdPlaceholder}&booth=${booth}`;
  const path = `./qr-${booth}.png`;
  await QRCode.toFile(path, url, { width: 300 });
  console.log(`Generated QR for ${booth}: ${path}`);
  console.log(`QR URL: ${url}`);
});