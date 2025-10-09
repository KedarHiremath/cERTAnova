// import fs from "fs";
// import path from "path";
// import { create } from "ipfs-http-client";

// const client = create({ url: "http://127.0.0.1:5001/api/v0" });

// async function uploadAllCertificates() {
//   const certDir = "./mock_certs";

//   if (!fs.existsSync(certDir)) {
//     console.error("❌ Directory 'mock_certs' not found!");
//     return;
//   }

//   const files = fs.readdirSync(certDir);
//   if (files.length === 0) {
//     console.log("⚠️ No certificates found in mock_certs/");
//     return;
//   }

//   console.log(`\n📁 Found ${files.length} files in ${certDir}\n`);

//   const cidMap = [];
//   const fileObjects = files.map((file) => {
//     const filePath = path.join(certDir, file);
//     const data = fs.readFileSync(filePath);
//     return { path: `mock_certs/${file}`, content: data };
//   });

//   // Upload as a directory
//   let rootCid = "";
//   for await (const file of client.addAll(fileObjects, { wrapWithDirectory: true, pin: true })) {
//     if (file.path === "") rootCid = file.cid.toString();
//     else {
//       cidMap.push({ path: path.basename(file.path), cid: file.cid.toString() });
//       console.log(`✅ Uploaded: ${path.basename(file.path)}\n   → CID: ${file.cid.toString()}\n`);
//     }
//   }

//   fs.writeFileSync("cid_registry.json", JSON.stringify(cidMap, null, 2));
//   console.log("📄 All CIDs saved in cid_registry.json");
//   console.log(`📦 Root directory CID: ${rootCid}`);
//   console.log(`🌐 View it: http://127.0.0.1:8080/ipfs/${rootCid}`);
// }

// uploadAllCertificates()
//   .then(() => console.log("\n🚀 Upload completed!"))
//   .catch(console.error);


import fs from "fs";
import path from "path";
import { create } from "ipfs-http-client";

// Connect to your local IPFS daemon
const client = create({ url: "http://127.0.0.1:5001/api/v0" });

async function uploadAllCertificates() {
  const certDir = "./mock_certs";

  if (!fs.existsSync(certDir)) {
    console.error("❌ Directory 'mock_certs' not found!");
    return;
  }

  const files = fs.readdirSync(certDir);
  if (files.length === 0) {
    console.log("⚠️ No certificates found in mock_certs/");
    return;
  }

  console.log(`\n📁 Found ${files.length} files in ${certDir}\n`);

  const cidMap = [];
  const fileObjects = files.map((file) => {
    const filePath = path.join(certDir, file);
    const data = fs.readFileSync(filePath);
    return { path: file, content: data };
  });

  let rootCid = "";

  for await (const file of client.addAll(fileObjects, { wrapWithDirectory: true, pin: true })) {
    if (!file.path || file.path === "") {
      rootCid = file.cid.toString();
    } else {
      cidMap.push({ filename: path.basename(file.path), cid: file.cid.toString() });
      console.log(`✅ Uploaded: ${path.basename(file.path)}\n   → CID: ${file.cid.toString()}\n`);
    }
  }

  fs.writeFileSync("cid_registry.json", JSON.stringify(cidMap, null, 2));
  console.log("\n📄 All CIDs saved in cid_registry.json");
  console.log(`📦 Root Directory CID: ${rootCid}`);
  console.log(`🌐 View it locally: http://127.0.0.1:8080/ipfs/${rootCid}`);

  // Add to IPFS Mutable File System so it appears in GUI
if (rootCid) {
  const mfsPath = `/certificates_${Date.now()}`;
  await client.files.cp(`/ipfs/${rootCid}`, mfsPath);
  console.log(`📂 Certificates also mounted to MFS at ${mfsPath}`);
  console.log(`🖥️  Now visible in IPFS Web UI under 'Files' tab`);
}

}

uploadAllCertificates()
  .then(() => console.log("\n🚀 Upload completed!"))
  .catch((err) => console.error("❌ Upload failed:", err.message));
