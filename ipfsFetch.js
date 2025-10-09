// import fs from "fs";
// import path from "path";
// import readline from "readline";
// import { create } from "ipfs-http-client";

// const client = create({ url: "http://127.0.0.1:5001/api/v0" });

// async function fetchCertificate(cid, filename) {
//   try {
//     const stream = client.cat(cid);

//     let data = [];
//     for await (const chunk of stream) data.push(chunk);

//     const fileBuffer = Buffer.concat(data);
//     const saveDir = "./retrieved";
//     fs.mkdirSync(saveDir, { recursive: true });

//     const savePath = path.join(saveDir, filename);
//     fs.writeFileSync(savePath, fileBuffer);

//     console.log(`✅ Certificate '${filename}' saved to ${savePath}`);
//   } catch (err) {
//     console.error(`❌ Failed to fetch '${filename}':`, err.message);
//   }
// }

// async function main() {
//   const cidFile = "cid_registry.json";

//   if (!fs.existsSync(cidFile)) {
//     console.error("❌ cid_registry.json not found!");
//     return;
//   }

//   const cidRegistry = JSON.parse(fs.readFileSync(cidFile));
//   console.log("\n📄 Available Certificates:\n");
//   cidRegistry.forEach((entry, index) => {
//     console.log(`${index + 1}. ${entry.path}`);
//   });

//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });

//   rl.question("\n👉 Enter the filename to retrieve: ", async (filename) => {
//     const entry = cidRegistry.find((e) => e.path === filename);

//     if (!entry) {
//       console.error("⚠️ File not found in cid_registry.json!");
//       rl.close();
//       return;
//     }

//     console.log(`\n📦 Fetching '${filename}' from IPFS...`);
//     await fetchCertificate(entry.cid, filename);
//     rl.close();
//   });
// }

// main();


import fs from "fs";
import path from "path";
import readline from "readline";
import { create } from "ipfs-http-client";

const client = create({ url: "http://127.0.0.1:5001/api/v0" });

async function fetchCertificate(cid, filename) {
  try {
    const stream = client.cat(cid);
    let chunks = [];

    for await (const chunk of stream) chunks.push(chunk);

    const fileBuffer = Buffer.concat(chunks);
    const saveDir = "./retrieved";
    fs.mkdirSync(saveDir, { recursive: true });

    const savePath = path.join(saveDir, filename);
    fs.writeFileSync(savePath, fileBuffer);

    console.log(`✅ Certificate '${filename}' saved to ${savePath}`);
  } catch (err) {
    console.error(`❌ Failed to fetch '${filename}': ${err.message}`);
  }
}

async function main() {
  const cidFile = "cid_registry.json";
  if (!fs.existsSync(cidFile)) {
    console.error("❌ cid_registry.json not found!");
    return;
  }

  const cidRegistry = JSON.parse(fs.readFileSync(cidFile));
  console.log("\n📜 Available Certificates:\n");
  cidRegistry.forEach((entry, index) => {
    console.log(`${index + 1}. ${entry.filename}`);
  });

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  rl.question("\n👉 Enter filename to retrieve: ", async (filename) => {
    const entry = cidRegistry.find((e) => e.filename === filename);

    if (!entry) {
      console.error("⚠️ File not found in registry!");
      rl.close();
      return;
    }

    console.log(`\n📦 Fetching '${filename}' from IPFS...`);
    await fetchCertificate(entry.cid, filename);
    rl.close();
  });
}

main();
