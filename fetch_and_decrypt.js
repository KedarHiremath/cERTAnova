// fetch_and_decrypt.js
import fs from "fs-extra";
import path from "path";
import { create } from "ipfs-http-client";
import crypto from "crypto";
import readline from "readline";

const ipfs = create({ url: "http://127.0.0.1:5001/api/v0" });
const USERS_DIR = path.join(process.cwd(), "User");

function question(promptText) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(promptText, ans => { rl.close(); res(ans); }));
}

function safeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function fetchCidContent(cid) {
  const chunks = [];
  for await (const chunk of ipfs.cat(cid)) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function decryptAes256Gcm(base64CipherText, keyBase64, ivHex, authTagHex) {
  const key = Buffer.from(keyBase64, "base64");
  if (key.length !== 32) throw new Error("Decryption key must be 32 bytes (base64 -> 32 bytes).");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(base64CipherText, "base64")),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
}

async function main() {
  console.log("=== Fetch & Decrypt (mock) ===");
  const username = (await question("Enter Username (e.g. User001): ")).trim();
  if (!username) { console.error("Username required"); process.exit(1); }

  const cid = (await question("Enter IPFS CID (Qm...): ")).trim();
  if (!cid) { console.error("CID required"); process.exit(1); }

  const keyBase64 = (await question("Enter decryption key (base64): ")).trim();
  if (!keyBase64) { console.error("Decryption key required"); process.exit(1); }

  try {
    console.log("\n🔎 Fetching content from IPFS for CID:", cid);
    const raw = await fetchCidContent(cid);
    // Expect valid JSON like: { iv: "<hex>", authTag: "<hex>", data: "<base64>" }
    const enc = JSON.parse(raw);
    if (!enc || !enc.iv || !enc.authTag || !enc.data) {
      throw new Error("IPFS content does not look like encrypted object { iv, authTag, data }");
    }

    console.log("🔐 Decrypting...");
    const plaintext = decryptAes256Gcm(enc.data, keyBase64, enc.iv, enc.authTag);
    // parse to JSON elegantly
    let parsed;
    try {
      parsed = JSON.parse(plaintext);
    } catch (e) {
      // Not JSON — still save the raw text
      parsed = plaintext;
    }

    // build user folder and filename
    const userDir = path.join(USERS_DIR, safeFilename(username));
    await fs.ensureDir(userDir);

    // attempt to derive filename from parsed content
    let outName = cid.replace(/\//g, "_");
    if (parsed && typeof parsed === "object") {
      // certificate id or credentialSubject.id
      if (parsed.certificate && parsed.certificate.id) outName = parsed.certificate.id;
      else if (parsed.credentialID) outName = parsed.credentialID;
      else if (parsed.certificate && parsed.certificate.credentialSubject && parsed.certificate.credentialSubject.id) {
        outName = parsed.certificate.credentialSubject.id;
      } else if (parsed.certificate && parsed.certificate.credentialSubject && parsed.certificate.credentialSubject.name) {
        outName = parsed.certificate.credentialSubject.name;
      }
    }
    outName = safeFilename(outName) + ".json";
    const outPath = path.join(userDir, outName);

    // write pretty JSON if parsed object, otherwise raw text
    if (typeof parsed === "object") {
      await fs.writeFile(outPath, JSON.stringify(parsed, null, 2), "utf8");
    } else {
      await fs.writeFile(outPath, parsed, "utf8");
    }

    console.log(`✅ Decrypted content saved to: ${outPath}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith("fetch_and_decrypt.js")) {
  main();
}
