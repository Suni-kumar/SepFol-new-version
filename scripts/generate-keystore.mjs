import forge from 'node-forge';
import fs from 'fs';
import path from 'path';

console.log('Generating persistent debug.keystore (PKCS#12)...');

// 1. Generate RSA keypair
const keys = forge.pki.rsa.generateKeyPair(2048);

// 2. Create Certificate
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01' + Date.now().toString(16);
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 30); // 30 years validity

const attrs = [
  { name: 'commonName', value: 'Android Debug' },
  { name: 'organizationName', value: 'SepFol' },
  { name: 'countryName', value: 'US' }
];

cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions([
  { name: 'basicConstraints', cA: true },
  {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }
]);

// Self-sign certificate
cert.sign(keys.privateKey, forge.md.sha256.create());

// 3. Create PKCS#12 Keystore
const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
  keys.privateKey,
  [cert],
  'android',
  {
    algorithm: '3des',
    friendlyName: 'androiddebugkey',
    generateLocalKeyId: true
  }
);

const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
const p12Buffer = Buffer.from(p12Der, 'binary');

const keystorePath = path.join(process.cwd(), 'android', 'debug.keystore');
fs.writeFileSync(keystorePath, p12Buffer);

console.log(`✅ Successfully generated permanent debug.keystore at ${keystorePath} (${p12Buffer.length} bytes)!`);
