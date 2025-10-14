// main.js
import path from "path";
import { processAndUploadCertificates } from "./utils/processAndUpload.js";

const baseDir = path.resolve();

(async () => {
  console.log("🚀 Starting Certificate Processing & Upload...");
  const results = await processAndUploadCertificates(baseDir);

  console.log("\n🧾 Summary:");
  results.forEach(r => {
    console.log(`• ${r.issuer}/${r.file}`);
    console.log(`   ↳ CID: ${r.cid}`);
    console.log(`   ↳ Key: ${r.encryptionKey.slice(0, 20)}...`);
  });
})();
