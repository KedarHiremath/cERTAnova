# 🌐 cERTAnova — Blockchain-Powered Certificate Authentication System

**cERTAnova** (read as *Certanova*) is a next-generation, blockchain-based certificate authentication and management platform.  
It acts as a **trust layer for digital documents**, allowing users, authorities, and institutions to issue, store, share, and verify certificates securely — powered by blockchain and decentralized storage.

---

## 🔍 Overview

Modern systems like DigiLocker enable users to store certificates digitally, but they rely on centralized infrastructures that can be vulnerable to tampering or misuse.

**cERTAnova** reimagines this concept using **blockchain** and **IPFS**, ensuring certificates are:
- **Authentic** (issued by verified authorities)
- **Immutable** (tamper-proof via on-chain hashing)
- **Traceable** (every action logged transparently)
- **Private yet Shareable** (through smart, time-bound sharing links or QR codes)

---

## ⚙️ System Architecture

### 🧩 Core Components
1. **Certificate Issuing Authorities (CIAs)**  
   Government or institutional authorities (e.g., Parivahan, Aadhaar, Universities) issue and upload certificates.

2. **cERTAnova App**  
   The central platform that connects all stakeholders — users, issuers, and verifiers.

3. **Blockchain Layer**  
   Stores certificate hashes, issue timestamps, and sharing metadata immutably.

4. **IPFS Storage Layer**  
   Stores encrypted certificate files and returns their content hash (CID).

5. **Certificate Requiring Authorities (CRAs)**  
   Entities that request certificate verification or access (e.g., job portals, government offices).

---

## 🔁 Workflow

1. **Certificate Issuance**
   - Authorized institution uploads the certificate → encrypted and stored on IPFS.  
   - Corresponding hash recorded on blockchain (with metadata like issuer, date, and type).

2. **User Access**
   - User logs in using a verified ID (e.g., Aadhaar or DID).
   - Their dashboard displays all linked certificates retrieved securely from the blockchain.

3. **Verification**
   - The authenticity of any document can be verified by matching its hash with the blockchain record.

4. **Smart Sharing**
   - **Soft Share:** Verifier checks specific eligibility details (e.g., age, disability) without accessing the full document.  
   - **Hard Share:** Full document shared with watermark, timestamp, and institution name — this event is also logged on-chain.  
   - Sharing link or QR code is **valid only for 5 minutes** (one-time use).

---

## 🔒 Security Features

- **Immutable Verification:** Blockchain ensures no certificate can be altered or forged.  
- **Encrypted Storage:** All files stored on IPFS are AES-encrypted before upload.  
- **On-Chain Audit Trail:** Every sharing or verification action is logged immutably.  
- **Revocation System:** Authorities can revoke or update invalid/expired certificates.  
- **Timestamped Watermarks:** Shared certificates are marked with access details, reducing misuse.

---

## 🧠 Future Enhancements

- ✅ Zero-Knowledge Proofs for privacy-preserving verification.  
- ✅ Decentralized Identity (DID) integration.  
- ✅ Batch certificate handling for universities and large issuers.  
- ✅ Cross-institution interoperability.  
- ✅ Offline QR verification module.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js / Next.js (Web), Flutter (Mobile) |
| **Backend** | Node.js / Express.js or Django REST |
| **Blockchain** | Ethereum / Polygon Testnet |
| **Smart Contracts** | Solidity |
| **Storage** | IPFS / Filecoin |
| **Database** | MongoDB |
| **Encryption** | AES / RSA Hybrid Encryption |
| **Wallet Integration** | MetaMask / Web3Auth |



