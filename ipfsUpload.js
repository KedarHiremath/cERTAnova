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
    return { path: `mock_certs/${file}`, content: data };
  });

  // Upload as directory
  let rootCid = "";
  for await (const file of client.addAll(fileObjects, { wrapWithDirectory: true })) {
    if (file.path === "") {
      rootCid = file.cid.toString();
    } else {
      const cid = file.cid.toString();
      cidMap.push({ path: path.basename(file.path), cid });
      console.log(`✅ Uploaded: ${path.basename(file.path)}\n   → CID: ${cid}\n`);

      // 🔹 Pin each file so it appears in your WebUI
      await client.pin.add(cid);
    }
  }

  // 🔹 Also pin the root folder CID
  if (rootCid) {
    await client.pin.add(rootCid);
    console.log(`📌 Root directory pinned: ${rootCid}`);
  }

  fs.writeFileSync("cid_registry.json", JSON.stringify(cidMap, null, 2));
  console.log("📄 All CIDs saved in cid_registry.json");
  console.log(`🌐 View folder: http://127.0.0.1:8080/ipfs/${rootCid}`);
}

uploadAllCertificates()
  .then(() => console.log("\n🚀 Upload completed and all files pinned!"))
  .catch(console.error);
