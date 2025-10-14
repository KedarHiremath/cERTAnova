// utils/processAndUpload.js
import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
import { create } from "ipfs-http-client";

const __dirname = path.resolve();
const ipfs = create({ url: "http://127.0.0.1:5001/api/v0" });

export async function processAndUploadCertificates(baseDir) {
  const registryPath = path.join(baseDir, "onChainRegistry.json");
  let registry = {};

  // Read or create registry file
  if (fs.existsSync(registryPath)) {
    const content = await fs.readFile(registryPath, "utf-8");
    registry = content ? JSON.parse(content) : {};
  } else {
    await fs.writeFile(registryPath, JSON.stringify({}, null, 2));
  }

  const issuersDir = path.join(baseDir, "Issuers");
  const results = [];

  for (const issuer of await fs.readdir(issuersDir)) {
    const certDir = path.join(issuersDir, issuer, "Certificates");
    const proofDir = path.join(issuersDir, issuer, "Proof");
    const encryptionDir = path.join(issuersDir, issuer, "EncryptionCID");
    const metadataDir = path.join(issuersDir, issuer, "MetaData");

    await fs.ensureDir(encryptionDir);
    await fs.ensureDir(metadataDir);

    if (!(await fs.pathExists(certDir))) continue;

    const certFiles = (await fs.readdir(certDir)).filter(f => f.endsWith(".json"));

    for (const file of certFiles) {
      const certPath = path.join(certDir, file);
      if (registry[file]) continue; // already processed

      console.log(`🪶 Processing ${file} for issuer ${issuer}`);

      // Read certificate JSON
      const certificate = JSON.parse(await fs.readFile(certPath, "utf-8"));

      // Generate proof
      const proof = {
        type: "EcdsaSecp256k1Signature2019",
        created: new Date().toISOString(),
        proofPurpose: "assertionMethod",
        verificationMethod: `did:example:${issuer}#key-1`,
        jws: crypto.randomBytes(32).toString("hex")
      };

      const proofFileName = `${issuer}Proof${file.match(/\d+/)[0]}.json`;
      const proofPath = path.join(proofDir, proofFileName);
      await fs.ensureDir(proofDir);
      await fs.writeFile(proofPath, JSON.stringify(proof, null, 2));

      // Concatenate certificate + proof
      const combined = { certificate, proof };
      const combinedData = JSON.stringify(combined, null, 2);

      // Encrypt data
      const key = crypto.randomBytes(32); // AES-256
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
      let encrypted = cipher.update(combinedData, "utf8", "base64");
      encrypted += cipher.final("base64");
      const authTag = cipher.getAuthTag().toString("hex");

      const encryptedJSON = { iv: iv.toString("hex"), authTag, data: encrypted };
      const encryptedFileName = `${file.replace(".json", ".enc.json")}`;

      // Write to MFS path
      const mfsPath = `/certificates/${issuer}/${encryptedFileName}`;
      await ipfs.files.mkdir(`/certificates/${issuer}`, { parents: true }).catch(() => {});
      await ipfs.files.write(mfsPath, Buffer.from(JSON.stringify(encryptedJSON, null, 2)), { create: true, truncate: true });

      // Pin the MFS file
      const stat = await ipfs.files.stat(mfsPath);
      await ipfs.pin.add(stat.cid);

      console.log(`📡 Uploaded & pinned → MFS: ${mfsPath} → CID: ${stat.cid}`);

      // 1️⃣ Save EncryptionCID
      const encFileName = `${issuer}EncryptionCID${file.match(/\d+/)[0]}.json`;
      const encJSON = {
        cid: stat.cid.toString(),
        encryptionKey: key.toString("base64"),
        iv: iv.toString("hex"),
        authTag
      };
      await fs.writeFile(path.join(encryptionDir, encFileName), JSON.stringify(encJSON, null, 2));

      // 2️⃣ Save MetaData
      const metaFileName = `${issuer}MetaData${file.match(/\d+/)[0]}.json`;
      const hashedCID = "0x" + crypto.createHash("sha256").update(stat.cid.toString()).digest("hex");
      const metaJSON = {
        credentialID: `A${file.match(/\d+/)[0].padStart(3, "0")}`,
        hashedCID,
        certificateType: issuer === "aadhaar" ? "Aadhaar" : "Passport",
        issuer: `did:example:${issuer}`,
        issuerName: issuer === "aadhaar" ? "Government of India - Aadhaar Authority" : "Government of India - Passport Authority",
        issuanceTimestamp: new Date().toISOString(),
        schemaId: issuer === "aadhaar" ? "AadhaarCredentialV1" : "PassportCredentialV1",
        sensitivity: "PII",
        displayLabel: issuer === "aadhaar" ? "Aadhaar (masked)" : "Passport (masked)"
      };
      await fs.writeFile(path.join(metadataDir, metaFileName), JSON.stringify(metaJSON, null, 2));

      // Store results
      results.push({
        issuer,
        file,
        cid: stat.cid.toString(),
        encryptionKey: key.toString("base64"),
        iv: iv.toString("hex"),
        authTag
      });

      // Update registry
      registry[file] = true;
      await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
    }
  }

  console.log(`✅ Done. Processed ${results.length} new certificates.`);
  return results;
}
