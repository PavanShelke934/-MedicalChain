# 🏥 MedicalChain — Secure Blockchain-Based Medical Records

MedicalChain is a decentralized application (DApp) designed to provide a **secure, transparent, and permission-based medical record management system** using blockchain technology.

The application allows patients to manage access to their medical records while authorized doctors can add medical records to the blockchain. Ethereum Sepolia is used as the blockchain network, with MetaMask providing wallet-based authentication.

---

## 📌 Project Overview

Traditional medical record systems often depend on centralized databases, which can introduce risks such as:

- Unauthorized access
- Data manipulation
- Centralized points of failure
- Lack of patient control
- Difficulty maintaining an auditable history

MedicalChain addresses these challenges by using **blockchain-based access control and record verification**.

Patients can grant or revoke access to registered doctors, while doctors can add medical records for patients who have authorized them.

> **Important:** Actual medical files are not stored directly on the blockchain. Instead, a cryptographic hash of the file is stored, helping verify the integrity of the associated file.

---

## ✨ Features

### 👤 Patient Portal

- Register as a patient
- View patient profile
- Connect using MetaMask
- Grant medical-record access to doctors
- Revoke doctor access
- View doctors who currently have access
- View medical record statistics
- Search and view authorized medical records

### 👨‍⚕️ Doctor Portal

- Register as a doctor
- Add specialization and license number
- View authorized patients
- Add medical records
- Upload a medical file
- Generate a cryptographic hash for the file
- Store record metadata and hash on the blockchain

### 🔐 Blockchain Security

- Ethereum Sepolia testnet
- Solidity smart contract
- MetaMask wallet authentication
- Patient-controlled access permissions
- Immutable blockchain records
- Cryptographic file hashing
- Permission-based record retrieval

---

## 🏗️ Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend |
| Vite | Development and build tool |
| JavaScript | Application logic |
| CSS | UI/UX |
| Solidity | Smart contract |
| Ethereum | Blockchain platform |
| Sepolia | Ethereum test network |
| ethers.js | Blockchain interaction |
| MetaMask | Wallet & authentication |
| Remix IDE | Smart contract deployment |
| Git/GitHub | Version control |

---

## 🧩 System Architecture

```text
                    ┌─────────────────────┐
                    │      Patient        │
                    │      / Doctor       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      MetaMask       │
                    │   Wallet / Identity │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    React + Vite     │
                    │     Frontend        │
                    └──────────┬──────────┘
                               │
                         ethers.js
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Solidity Smart      │
                    │     Contract        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Ethereum Sepolia    │
                    │     Blockchain      │
                    └─────────────────────┘
```

---

## 🔄 How MedicalChain Works

### 1. Connect Wallet

The user connects MetaMask to the MedicalChain application.

### 2. Registration

The user registers either as:

- Patient
- Doctor

The wallet address acts as the blockchain identity.

### 3. Patient Grants Access

A patient enters a registered doctor's wallet address and grants access.

```text
Patient
   │
   ▼
Doctor Wallet Address
   │
   ▼
Grant Access
   │
   ▼
Blockchain
```

### 4. Doctor Adds Medical Record

Once authorized, the doctor can add a medical record for the patient.

The record contains:

- Record ID
- Patient address
- Doctor address
- Record type
- Description
- File hash
- Timestamp

### 5. File Hash Generation

When a medical file is selected, the application generates a cryptographic hash.

```text
Medical File
     │
     ▼
Hash Generation
     │
     ▼
Cryptographic Hash
     │
     ▼
Blockchain Record
```

The hash can later be used to verify whether the associated file has been modified.

### 6. Revoke Access

The patient can revoke a doctor's access at any time.

```text
Patient
   │
   ▼
Revoke Access
   │
   ▼
Doctor loses access
```

---

## 📜 Smart Contract

The project uses a Solidity smart contract named:

```text
MedicalRecords
```

The contract provides functionality for:

### Patient Management

```solidity
registerPatient()
isPatientRegistered()
getPatientCount()
getPatientRecordCount()
```

### Doctor Management

```solidity
registerDoctor()
isDoctorRegistered()
getDoctorCount()
getDoctorRecordCount()
```

### Access Control

```solidity
grantAccess()
revokeAccess()
getPatientDoctors()
getDoctorPatients()
getPatientDoctorRecordCount()
```

### Medical Records

```solidity
addMedicalRecord()
getRecordCount()
getRecord()
```

---

## 🔐 Access Control Model

MedicalChain follows a **patient-controlled authorization model**.

```text
                  Patient
                     │
              Grants Access
                     │
                     ▼
                  Doctor
                     │
              Adds Record
                     │
                     ▼
               Blockchain
```

A doctor cannot add a medical record unless:

1. The doctor is registered.
2. The patient is registered.
3. The patient has granted the doctor access.

---

## 📦 Medical Record Structure

Each blockchain record contains:

```text
Record ID
Patient Wallet Address
Doctor Wallet Address
Record Type
Description
Record Hash
Timestamp
```

The blockchain stores the **record metadata and cryptographic hash**, rather than the actual medical file.

---

## 🚀 Getting Started

### Prerequisites

Install the following:

- Node.js
- npm
- MetaMask
- Git

You also need a MetaMask wallet configured for the **Ethereum Sepolia testnet**.

---

## 📥 Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Navigate into the project:

```bash
cd MedicalChain
```

Install dependencies:

```bash
npm install
```

---

## ⚙️ Smart Contract Configuration

The frontend communicates with the deployed Solidity contract through:

```text
src/contract.js
```

The file contains:

```javascript
export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

and the contract ABI.

Replace the address with the deployed MedicalRecords contract address if setting up the project from scratch.

---

## ▶️ Run the Application

Start the Vite development server:

```bash
npm run dev
```

The application will provide a local development URL, typically:

```text
http://localhost:5173
```

Open the URL in your browser and connect MetaMask.

---

## 🌐 Blockchain Network

MedicalChain currently uses:

```text
Network: Ethereum Sepolia
Wallet: MetaMask
Smart Contract: MedicalRecords
```

Make sure MetaMask is connected to **Sepolia Testnet** before interacting with the DApp.

---

## 📁 Project Structure

```text
MedicalChain/
│
├── public/
│
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── contract.js
│
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

---

## 🛡️ Security Approach

MedicalChain uses several mechanisms to improve security:

### Blockchain Immutability

Once a transaction is confirmed on the blockchain, the stored record cannot simply be modified like a normal database entry.

### Wallet-Based Identity

Users interact using their Ethereum wallet address rather than a traditional username/password.

### Patient-Controlled Permissions

Patients decide which registered doctors can access their records.

### Cryptographic Hashing

Medical files are represented by cryptographic hashes, allowing file integrity to be checked.

### Access Verification

The smart contract verifies authorization before allowing medical records to be added or accessed.

---

## ⚠️ Important Security Consideration

This project is an **academic/educational DApp** and should not be used as a production healthcare system without additional security, privacy, legal, and regulatory controls.

Medical information is highly sensitive. A production implementation would require appropriate:

- Encryption
- Secure off-chain storage
- Key management
- Identity verification
- Audit mechanisms
- Healthcare privacy compliance
- Backup and recovery mechanisms

---

## 🔮 Future Scope

Possible improvements include:

- IPFS-based decentralized file storage
- End-to-end encryption
- Hospital/clinic accounts
- Multiple healthcare providers
- Patient appointment management
- Prescription management
- Laboratory report integration
- QR-code based record sharing
- Mobile application
- Multi-signature authorization
- Advanced audit logs
- Layer-2 blockchain deployment
- Integration with healthcare standards such as FHIR

---

## 🎯 Project Objectives

The main objectives of MedicalChain are:

1. Provide secure medical record management.
2. Give patients control over record access.
3. Reduce dependence on centralized record systems.
4. Maintain an auditable history of medical records.
5. Prevent unauthorized record access.
6. Verify the integrity of medical files using cryptographic hashes.
7. Demonstrate the practical use of blockchain in healthcare.

---

## 📸 Application Screens

The application contains:

- 🏠 Landing Page
- 🔐 Wallet Login
- 👤 Patient Dashboard
- 👨‍⚕️ Doctor Dashboard
- 🪪 Patient Profile
- 🩺 Doctor Access Management
- 📄 Medical Record Management
- 🔗 Blockchain Verification
- 📁 File Hash Generation

---

## 👥 User Roles

### Patient

```text
Register
   ↓
Connect Wallet
   ↓
Manage Doctors
   ↓
Grant / Revoke Access
   ↓
View Medical Records
```

### Doctor

```text
Register
   ↓
Connect Wallet
   ↓
View Authorized Patients
   ↓
Add Medical Records
   ↓
Generate File Hash
   ↓
Store Record on Blockchain
```

---

## 🧪 Testing

The application was tested for the major workflows:

| Test | Expected Result |
|---|---|
| Connect MetaMask | Wallet connected |
| Patient registration | Patient registered |
| Doctor registration | Doctor registered |
| Grant access | Doctor receives access |
| Revoke access | Doctor access removed |
| Add medical record | Record stored on blockchain |
| File upload | Hash generated |
| Unauthorized access | Transaction/view rejected |
| Record retrieval | Authorized record displayed |

---

## 📚 Academic Project

**Project Title:**

> Develop a Blockchain Based Application for Health Related Medical Records

**Project Name:**

> MedicalChain — Secure Blockchain-Based Medical Records Management System

**Domain:**

> Blockchain + Healthcare + Web3

---

## 👨‍💻 Author

**Pavan Shelke**

Computer Engineering  
Sinhgad Institute of Technology & Science (SITS), Narhe, Pune

---

## 📄 License

This project is developed for **educational and academic purposes**.

---

⭐ If you find this project useful, consider giving the repository a star!
