import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";
import "./App.css";

function LoadingOverlay({ message }) {
  return (
    <div className="loading-overlay">
      <div className="loading-box">

        <div className="spinner"></div>

        <h3>{message}</h3>

        <p>
          Your request is being processed on the
          Ethereum Sepolia test network.
        </p>
        <div className="loading-network">⛓ Ethereum Sepolia Testnet</div>

      </div>
    </div>
  );
}

function TransactionStatus({ txHash }) {
  if (!txHash) return null;

  return (
    <div className="transaction-status">
      <div className="transaction-status-icon">✓</div>
      <div className="transaction-status-content">
        <strong>Blockchain transaction confirmed</strong>
        <span>{txHash.slice(0, 12)}...{txHash.slice(-10)}</span>
      </div>
      <a
        className="etherscan-btn"
        href={`https://sepolia.etherscan.io/tx/${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        View on Etherscan ↗
      </a>
    </div>
  );
}

function Notification({ notification, onClose }) {
  if (!notification) return null;

  return (
    <div className={`app-notification ${notification.type}`} role={notification.type === "error" ? "alert" : "status"}>
      <div className="app-notification-icon">
        {notification.type === "error" ? "!" : notification.type === "pending" ? "⏳" : "✓"}
      </div>
      <div className="app-notification-content">
        <strong>{notification.title}</strong>
        <span>{notification.message}</span>
      </div>
      <button type="button" className="app-notification-close" onClick={onClose} aria-label="Close notification">×</button>
    </div>
  );
}

function RecordDisplay({ record }) {
  return (
    <div className="record">

      <div className="record-header">
        <h3>Medical Record #{record.id}</h3>

        <span>
          Blockchain Verified
        </span>
      </div>

      <div className="record-grid">

        <div>
          <label>Patient</label>
          <p>{record.patient}</p>
        </div>

        <div>
          <label>Doctor</label>
          <p>{record.doctor}</p>
        </div>

        <div>
          <label>Record Type</label>
          <p>{record.recordType}</p>
        </div>

        <div>
          <label>Description</label>
          <p>{record.description}</p>
        </div>

        <div>
          <label>Record Hash</label>
          <p className="hash">
            {record.recordHash}
          </p>
        </div>

        <div>
          <label>Timestamp</label>
          <p>{record.timestamp}</p>
        </div>

      </div>

    </div>
  );
}

function App() {
  const [page, setPage] = useState("home");

  const [account, setAccount] = useState("");
  const [network, setNetwork] = useState("");
  const [status, setStatus] = useState("Wallet not connected");
  const [loading, setLoading] = useState(false);
  const [lastTxHash, setLastTxHash] = useState("");
  const [notification, setNotification] = useState(null);
  const [transactionError, setTransactionError] = useState("");

  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [patientInfo, setPatientInfo] = useState(null);

  const [doctorName, setDoctorName] = useState("");
  const [doctorSpecialization, setDoctorSpecialization] = useState("");
  const [doctorLicense, setDoctorLicense] = useState("");
  const [doctorInfo, setDoctorInfo] = useState(null);

  // Dashboard data (loaded from MedicalRecords4)
  const [patientDoctors, setPatientDoctors] = useState([]);
  const [patientRecordTotal, setPatientRecordTotal] = useState(0);
  const [doctorPatients, setDoctorPatients] = useState([]);
  const [doctorRecordTotal, setDoctorRecordTotal] = useState(0);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const [doctorAddress, setDoctorAddress] = useState("");

  const [recordPatient, setRecordPatient] = useState("");
  const [recordType, setRecordType] = useState("");
  const [recordDescription, setRecordDescription] = useState("");
  const [recordHash, setRecordHash] = useState("");
  const [recordFile, setRecordFile] = useState(null);
  const [hashSource, setHashSource] = useState("");
  const [hashingFile, setHashingFile] = useState(false);

  const [recordId, setRecordId] = useState("");
  const [record, setRecord] = useState(null);

  const showNotification = (type, title, message) => {
    setNotification({ type, title, message });
  };

  const clearNotification = () => setNotification(null);

  const getReadableError = (error) => {
    if (!error) return "Transaction failed.";

    if (error.code === "ACTION_REJECTED" || error.code === 4001 || error?.info?.error?.code === 4001) {
      return "Transaction was rejected in MetaMask.";
    }

    const message =
      error.reason ||
      error.shortMessage ||
      error.info?.error?.message ||
      error.data?.message ||
      error.error?.message ||
      error.message;

    if (message) {
      return String(message)
        .replace(/^execution reverted:?\s*/i, "")
        .replace(/^VM Exception while processing transaction:?\s*/i, "")
        .trim();
    }

    return "Transaction failed. Check MetaMask and try again.";
  };

  const handleOperationError = (error, title = "Transaction failed") => {
    console.error(title, error);
    const message = getReadableError(error);
    setStatus(message);
    showNotification("error", title, message);
  };


  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    return new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );
  };

useEffect(() => {
  if (!window.ethereum) return;

  let previousAccount = "";

  const checkWalletAccount = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts"
      });

      const currentAccount =
        accounts.length > 0 ? accounts[0].toLowerCase() : "";

      // First check — just remember the account
      if (!previousAccount) {
        previousAccount = currentAccount;
        return;
      }

      // Account changed
      if (currentAccount !== previousAccount) {
        console.log("MetaMask account changed");

        previousAccount = currentAccount;

        // Clear previous user's data
        setAccount("");
        setNetwork("");
        setRecord(null);
        setPatientInfo(null);
        setDoctorInfo(null);
        setLastTxHash("");

        // Logout
        setPage("home");

        setStatus(
          currentAccount
            ? "Account changed. Please login again."
            : "Wallet disconnected."
        );
      }

    } catch (error) {
      console.error("Wallet check failed:", error);
    }
  };

  // Check immediately
  checkWalletAccount();

  // Check every 500ms
  const interval = setInterval(
    checkWalletAccount,
    500
  );

  return () => {
    clearInterval(interval);
  };

}, []);

  const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask.");
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);

    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    const networkInfo = await provider.getNetwork();

   setAccount(address);
    setNetwork(networkInfo.chainId.toString());
    setRecord(null);

    setStatus("Wallet connected successfully");

    return address;

  } catch (error) {
    handleOperationError(error, "Wallet connection failed");
    return null;
  }
};

  const logout = () => {
    setAccount("");
    setNetwork("");
    setPatientInfo(null);
    setDoctorInfo(null);
    setRecord(null);
    setLastTxHash("");
    setDoctorAddress("");
    setRecordPatient("");
    setRecordType("");
    setRecordDescription("");
    setRecordHash("");
    setRecordFile(null);
    setHashSource("");
    setRecordId("");
    setStatus("Wallet disconnected");
    setPage("home");
  };

  const registerPatient = async () => {
  if (!patientName || !patientAge || !patientGender) {
    alert("Please fill all patient details.");
    return;
  }

  try {
    setLoading(true);
    setLastTxHash("");
    setStatus("Registering patient...");

    const contract = await getContract();

    const tx = await contract.registerPatient(
      patientName,
      patientAge,
      patientGender
    );

    setStatus("Waiting for blockchain confirmation...");

    await tx.wait();
    setLastTxHash(tx.hash);

    // Get the connected wallet
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    // Store patient information for dashboard
    setPatientInfo({
      name: patientName,
      age: patientAge.toString(),
      gender: patientGender,
      registered: true
    });

    setAccount(address);

    setStatus("Patient registered successfully! ✅");

    // Clear form
    setPatientName("");
    setPatientAge("");
    setPatientGender("");

    // Automatically open dashboard
    setPage("patient-dashboard");

  } catch (error) {
    handleOperationError(error, "Patient registration failed");
  } finally {
    setLoading(false);
  }
};

const registerDoctor = async () => {
  if (
    !doctorName ||
    !doctorSpecialization ||
    !doctorLicense
  ) {
    alert("Please fill all doctor details.");
    return;
  }

  try {
    setLoading(true);
    setLastTxHash("");
    setStatus("Registering doctor...");

    const contract = await getContract();

    const tx = await contract.registerDoctor(
      doctorName,
      doctorSpecialization,
      doctorLicense
    );

    setStatus("Waiting for blockchain confirmation...");

    await tx.wait();
    setLastTxHash(tx.hash);

    const provider = new ethers.BrowserProvider(
      window.ethereum
    );

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    setDoctorInfo({
      name: doctorName,
      specialization: doctorSpecialization,
      licenseNumber: doctorLicense,
      registered: true
    });

    setAccount(address);

    setStatus("Doctor registered successfully! ✅");

    setDoctorName("");
    setDoctorSpecialization("");
    setDoctorLicense("");

    setPage("doctor-dashboard");

  } catch (error) {
    handleOperationError(error, "Doctor registration failed");
  } finally {
    setLoading(false);
  }
};

  const loadPatientDashboardData = async (patientAddress = account) => {
    if (!patientAddress || !window.ethereum) return;

    try {
      setDashboardLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const [doctorAddresses, totalRecords] = await Promise.all([
        contract.getPatientDoctors(patientAddress),
        contract.getPatientRecordCount(patientAddress)
      ]);

      const doctors = await Promise.all(
        doctorAddresses.map(async (address) => {
          const [doctor, recordTotal] = await Promise.all([
            contract.doctors(address),
            contract.getPatientDoctorRecordCount(patientAddress, address)
          ]);

          return {
            address,
            name: doctor[0],
            specialization: doctor[1],
            licenseNumber: doctor[2],
            recordCount: recordTotal.toString()
          };
        })
      );

      setPatientDoctors(doctors);
      setPatientRecordTotal(totalRecords.toString());
    } catch (error) {
      console.error("Unable to load patient dashboard data", error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadDoctorDashboardData = async (doctorAddressValue = account) => {
    if (!doctorAddressValue || !window.ethereum) return;

    try {
      setDashboardLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const [patientAddresses, totalRecords] = await Promise.all([
        contract.getDoctorPatients(doctorAddressValue),
        contract.getDoctorRecordCount(doctorAddressValue)
      ]);

      const patients = await Promise.all(
        patientAddresses.map(async (address) => {
          const [patient, recordTotal] = await Promise.all([
            contract.patients(address),
            contract.getPatientDoctorRecordCount(address, doctorAddressValue)
          ]);

          return {
            address,
            name: patient[0],
            age: patient[1].toString(),
            gender: patient[2],
            recordCount: recordTotal.toString()
          };
        })
      );

      setDoctorPatients(patients);
      setDoctorRecordTotal(totalRecords.toString());
    } catch (error) {
      console.error("Unable to load doctor dashboard data", error);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (page === "patient-dashboard" && account) {
      loadPatientDashboardData(account);
    }
    if (page === "doctor-dashboard" && account) {
      loadDoctorDashboardData(account);
    }
  }, [page, account]);

  const grantAccess = async () => {
    if (!ethers.isAddress(doctorAddress)) {
      showNotification("error", "Invalid doctor address", "Enter a valid doctor wallet address.");
      return;
    }

    try {
      setLoading(true);
      setLastTxHash("");
      setStatus("Granting doctor access...");

      const contract = await getContract();

      const tx = await contract.grantAccess(
        doctorAddress
      );

      setStatus("Waiting for blockchain confirmation...");

      await tx.wait();
      setLastTxHash(tx.hash);

      setStatus("Doctor access granted successfully! ✅");
      showNotification("success", "Doctor access granted", "The doctor can now access your medical records.");
      setDoctorAddress("");
      await loadPatientDashboardData(account);

    } catch (error) {
      handleOperationError(error, "Grant access failed");
    } finally {
      setLoading(false);
    }
  };

  const revokeAccessForDoctor = async (targetDoctor) => {
    if (!ethers.isAddress(targetDoctor)) return;
    try {
      setLoading(true);
      setLastTxHash("");
      setStatus("Revoking doctor access...");
      const contract = await getContract();
      const tx = await contract.revokeAccess(targetDoctor);
      setStatus("Waiting for blockchain confirmation...");
      await tx.wait();
      setLastTxHash(tx.hash);
      setStatus("Doctor access revoked successfully! ✅");
      showNotification("success", "Doctor access revoked", "The doctor can no longer access your medical records.");
      setDoctorAddress("");
      await loadPatientDashboardData(account);
    } catch (error) {
      handleOperationError(error, "Revoke access failed");
    } finally {
      setLoading(false);
    }
  };

  const revokeAccess = async () => {
    if (!ethers.isAddress(doctorAddress)) {
      showNotification("error", "Invalid doctor address", "Enter a valid doctor wallet address.");
      return;
    }

    try {
      setLoading(true);
      setLastTxHash("");
      setStatus("Revoking doctor access...");

      const contract = await getContract();

      const tx = await contract.revokeAccess(
        doctorAddress
      );

      setStatus("Waiting for blockchain confirmation...");

      await tx.wait();
      setLastTxHash(tx.hash);

      setStatus("Doctor access revoked successfully! ✅");
      showNotification("success", "Doctor access revoked", "The doctor can no longer access your medical records.");
      setDoctorAddress("");
      await loadPatientDashboardData(account);

    } catch (error) {
      handleOperationError(error, "Revoke access failed");
    } finally {
      setLoading(false);
    }
  };

  const sha256 = async (data) => {
    const digest = await crypto.subtle.digest("SHA-256", data);
    return ethers.hexlify(new Uint8Array(digest));
  };

  const generateRecordHash = async () => {
    if (!ethers.isAddress(recordPatient)) {
      throw new Error("Enter a valid patient wallet address.");
    }

    if (!recordType.trim() || !recordDescription.trim()) {
      throw new Error("Please fill Record Type and Description.");
    }

    if (recordFile) {
      setHashingFile(true);
      try {
        const fileBuffer = await recordFile.arrayBuffer();
        const hash = await sha256(fileBuffer);
        setHashSource(`File: ${recordFile.name}`);
        setRecordHash(hash);
        return hash;
      } finally {
        setHashingFile(false);
      }
    }

    const payload = JSON.stringify({
      patient: recordPatient.toLowerCase(),
      doctor: account.toLowerCase(),
      recordType: recordType.trim(),
      description: recordDescription.trim(),
      timestamp: new Date().toISOString(),
      nonce: crypto.randomUUID()
    });

    const hash = await sha256(new TextEncoder().encode(payload));
    setHashSource("Record details (no file uploaded)");
    setRecordHash(hash);
    return hash;
  };

  const handleRecordFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setRecordFile(null);
      setRecordHash("");
      setHashSource("");
      return;
    }

    setRecordFile(file);
    setRecordHash("");
    setHashSource("");
    setHashingFile(true);

    try {
      const fileBuffer = await file.arrayBuffer();
      const hash = await sha256(fileBuffer);
      setRecordHash(hash);
      setHashSource(`File: ${file.name}`);
    } catch (error) {
      console.error(error);
      setRecordFile(null);
      setRecordHash("");
      setHashSource("");
      showNotification("error", "File hash failed", "Unable to generate the SHA-256 hash for this file. Please try again.");
    } finally {
      setHashingFile(false);
    }
  };

  const clearRecordFile = () => {
    setRecordFile(null);
    setRecordHash("");
    setHashSource("");
  };

  const addMedicalRecord = async () => {
    if (!window.ethereum) {
      showNotification("error", "MetaMask not found", "Please install MetaMask and connect your wallet.");
      return;
    }

    if (!ethers.isAddress(recordPatient)) {
      showNotification("error", "Invalid patient address", "Enter the patient's valid MetaMask wallet address.");
      return;
    }

    if (!recordType.trim() || !recordDescription.trim()) {
      showNotification("error", "Missing record details", "Please enter the record type and description.");
      return;
    }

    if (hashingFile) {
      showNotification("pending", "Hashing file", "Please wait for the medical file hash to finish generating.");
      return;
    }

    try {
      setLoading(true);
      setLastTxHash("");
      setNotification(null);
      setTransactionError("");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const networkInfo = await provider.getNetwork();

      if (networkInfo.chainId !== 11155111n) {
        throw new Error("Wrong network. Please switch MetaMask to Ethereum Sepolia Test Network.");
      }

      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      setAccount(signerAddress);

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setStatus("Checking doctor registration...");
      const doctorRegistered = await contract.isDoctorRegistered(signerAddress);
      if (!doctorRegistered) {
        throw new Error("This wallet is not registered as a doctor. Register the doctor first.");
      }

      setStatus("Checking patient registration...");
      const patientRegistered = await contract.isPatientRegistered(recordPatient);
      if (!patientRegistered) {
        throw new Error("This patient wallet is not registered on MedicalChain.");
      }

      setStatus("Checking patient access permission...");
      const doctorHasAccess = await contract.hasAccess(recordPatient, signerAddress);
      if (!doctorHasAccess) {
        const message = "Doctor does not have access. Ask the patient to grant access to this doctor wallet first.";
        setTransactionError(message);
        showNotification("error", "Access denied", message);
        setStatus(message);
        return;
      }

      setStatus(recordFile ? "Generating file hash..." : "Generating record hash...");
      const generatedHash = recordHash || await generateRecordHash();

      if (!generatedHash) {
        throw new Error("Unable to generate the medical record hash.");
      }

      // Simulate the exact contract call first. This catches Solidity require()
      // failures before opening MetaMask, so the user gets a useful message.
      setStatus("Validating blockchain transaction...");
      await contract.addMedicalRecord.staticCall(
        recordPatient,
        recordType.trim(),
        recordDescription.trim(),
        generatedHash
      );

      setStatus("MetaMask confirmation required...");
      showNotification(
        "pending",
        "Confirm in MetaMask",
        "Review the medical record transaction in MetaMask and click Confirm."
      );

      const tx = await contract.addMedicalRecord(
        recordPatient,
        recordType.trim(),
        recordDescription.trim(),
        generatedHash
      );

      setLastTxHash(tx.hash);
      setStatus("Transaction submitted. Waiting for Sepolia confirmation...");
      showNotification(
        "pending",
        "Transaction submitted",
        `Waiting for blockchain confirmation: ${tx.hash.slice(0, 12)}...${tx.hash.slice(-8)}`
      );

      await tx.wait();

      setStatus("Medical record added successfully! ✅");
      showNotification(
        "success",
        "Medical record added",
        "The record has been confirmed on Ethereum Sepolia. You can view the transaction below."
      );

      setRecordType("");
      setRecordDescription("");
      setRecordHash("");
      setRecordFile(null);
      setHashSource("");

    } catch (error) {
      console.error("Add medical record error:", error);
      const message = getReadableError(error);
      setStatus(message);
      setTransactionError(message);
      showNotification("error", "Medical record transaction failed", message);
    } finally {
      setLoading(false);
    }
  };

  const viewMedicalRecord = async () => {
    if (!recordId || Number(recordId) <= 0) {
      showNotification("error", "Invalid record ID", "Enter a valid positive record ID.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Fetching medical record...");

      const contract = await getContract();

      const result = await contract.getRecord(recordId);

      setRecord({
        id: result[0].toString(),
        patient: result[1],
        doctor: result[2],
        recordType: result[3],
        description: result[4],
        recordHash: result[5],
        timestamp: new Date(
          Number(result[6]) * 1000
        ).toLocaleString()
      });

      setStatus("Medical record loaded successfully! ✅");

    } catch (error) {
      handleOperationError(error, "Unable to fetch record");
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="app">

    {loading && <LoadingOverlay message={status} />}
    <TransactionStatus txHash={lastTxHash} />
    <Notification notification={notification} onClose={() => setNotification(null)} />

    {transactionError && (
      <div className="transaction-error-modal" role="alertdialog" aria-modal="true">
        <div className="transaction-error-card">
          <div className="transaction-error-icon">!</div>
          <div className="transaction-error-content">
            <h3>Medical Record Not Added</h3>
            <p>{transactionError}</p>
            <button
              className="transaction-error-close"
              onClick={() => setTransactionError("")}
            >
              OK, Got It
            </button>
          </div>
        </div>
      </div>
    )}

    {/* NAVBAR */}
    <header className="header">
      <div className="brand" onClick={() => setPage("home")}>
        <div className="brand-icon">🏥</div>

        <div>
          <h1>MedicalChain</h1>
          <p>Blockchain-Based Medical Records</p>
        </div>
      </div>

      <button
        className="connect-btn"
        onClick={connectWallet}
      >
        {account
          ? `${account.slice(0, 6)}...${account.slice(-4)}`
          : "Connect MetaMask"}
      </button>
    </header>


    {/* ================= HOME ================= */}

    {page === "home" && (
      <main className="home">

        <section className="hero">

          <div className="hero-content">

            <div className="badge">
              🔐 Secure • Decentralized • Private
            </div>

            <h2>
              Your Medical Records.
              <br />
              <span>Secured by Blockchain.</span>
            </h2>

            <p>
              MedicalChain provides a secure way to manage
              medical records using blockchain technology.
              Patients control access to their records while
              doctors can access authorized information.
            </p>

            <div className="hero-buttons">

              <button
                className="hero-btn patient"
                onClick={() => setPage("patient-login")}
              >
                👤 Patient Login
              </button>

              <button
                className="hero-btn doctor"
                onClick={() => setPage("doctor-login")}
              >
                👨‍⚕️ Doctor Login
              </button>

            </div>

          </div>

          <div className="hero-visual">
            <div className="blockchain-card">

              <div className="chain-icon">
                ⛓️
              </div>

              <h3>Blockchain Protected</h3>

              <p>
                Your medical record access is controlled
                by smart contracts on Ethereum.
              </p>

              <div className="security-item">
                ✓ Tamper resistant
              </div>

              <div className="security-item">
                ✓ Patient controlled access
              </div>

              <div className="security-item">
                ✓ Decentralized verification
              </div>

            </div>
          </div>

        </section>


        {/* FEATURES */}

        <section className="features">

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure</h3>
            <p>
              Blockchain-based access control
              protects medical records.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>Patient Control</h3>
            <p>
              Patients decide which doctors
              can access their records.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⛓️</div>
            <h3>Blockchain</h3>
            <p>
              Records are verified through
              Ethereum smart contracts.
            </p>
          </div>

        </section>

      </main>
    )}


    {/* ================= PATIENT LOGIN ================= */}

    {page === "patient-login" && (
      <main className="login-page">

        <div className="login-card">

          <div className="login-icon">
            👤
          </div>

          <h2>Patient Login</h2>

          <p>
            Connect your MetaMask wallet to access
            your medical records.
          </p>

          <button
            className="primary-btn login-btn"
            onClick={async () => {

            setLoading(true);
            setStatus("Connecting wallet...");

            try {
              const address = await connectWallet();

              if (!address) return;
              setStatus("Checking patient registration...");

              const provider = new ethers.BrowserProvider(
                window.ethereum
              );

              const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                provider
              );

              const registered =
                await contract.isPatientRegistered(address);

              if (registered) {
                const patient = await contract.patients(address);

                setPatientInfo({
                  name: patient[0],
                  age: patient[1].toString(),
                  gender: patient[2],
                  registered: patient[3]
                });

                setStatus("Patient verified successfully! ✅");
                setPage("patient-dashboard");
              } else {
                setStatus("Patient is not registered.");
                alert(
                  "This wallet is not registered as a patient. Please register first."
                );
              }

            } catch (error) {
              handleOperationError(error, "Unable to verify patient");
            } finally {
              setLoading(false);
            }

          }}
            disabled={loading}
          >
            🦊 Connect MetaMask
          </button>

          <button
            className="back-btn"
            onClick={() => setPage("home")}
          >
            ← Back to Home
          </button>

          <button
            className="register-link"
            onClick={() => setPage("patient-register")}
          >
            New patient? Register here
          </button>

        </div>

      </main>
    )}


    {/* ================= DOCTOR LOGIN ================= */}

    {page === "doctor-login" && (
      <main className="login-page">

        <div className="login-card">

          <div className="login-icon doctor-icon">
            👨‍⚕️
          </div>

          <h2>Doctor Login</h2>

          <p>
            Connect your MetaMask wallet to access
            authorized patient records.
          </p>

          <button
            className="primary-btn login-btn"
            onClick={async () => {

              setLoading(true);
              setStatus("Connecting wallet...");

              try {
                const address = await connectWallet();

                if (!address) return;
                setStatus("Checking doctor registration...");

                const provider = new ethers.BrowserProvider(
                  window.ethereum
                );

                const contract = new ethers.Contract(
                  CONTRACT_ADDRESS,
                  CONTRACT_ABI,
                  provider
                );

                const registered =
                  await contract.isDoctorRegistered(address);

                if (registered) {

                  const doctor =
                    await contract.doctors(address);

                  setDoctorInfo({
                    name: doctor[0],
                    specialization: doctor[1],
                    licenseNumber: doctor[2],
                    registered: doctor[3]
                  });

                  setStatus(
                    "Doctor verified successfully! ✅"
                  );

                  setPage("doctor-dashboard");

                } else {

                  setStatus("Doctor is not registered.");

                  alert(
                    "This wallet is not registered as a doctor. Please register first."
                  );

                }

              } catch (error) {

                console.error(error);

                setStatus(
                  error.reason ||
                  error.shortMessage ||
                  "Unable to verify doctor."
                );

              } finally {

                setLoading(false);

              }

            }}
            disabled={loading}
          >
            🦊 Connect MetaMask
          </button>

          <button
            className="back-btn"
            onClick={() => setPage("home")}
          >
            ← Back to Home
          </button>

          <button
            className="register-link"
            onClick={() => setPage("doctor-register")}
          >
            New doctor? Register here
        </button>

        </div>

      </main>
    )}


    {/* ================= PATIENT DASHBOARD ================= */}

    {page === "patient-dashboard" && (
      <main className="dashboard">

        <div className="dashboard-heading">
          <div>
            <span className="label">PATIENT PORTAL</span>
            <h2>Welcome back{patientInfo?.name ? `, ${patientInfo.name}` : ""} 👋</h2>
            <div className="wallet-bar">
              <span className="wallet-dot"></span>
              <span className="wallet-label">Connected wallet</span>
              <code>{account}</code>
              <span className="network-pill">Sepolia</span>
            </div>
          </div>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="dashboard-grid">
          <section className="card profile-card dashboard-card-wide">
            <div className="section-title">
              <span>👤</span>
              <div>
                <h2>Patient Profile</h2>
                <p>Your verified blockchain identity</p>
              </div>
            </div>

            {patientInfo && (
              <div className="profile-grid">
                <div className="profile-item">
                  <label>NAME</label>
                  <strong>{patientInfo.name}</strong>
                </div>
                <div className="profile-item">
                  <label>AGE</label>
                  <strong>{patientInfo.age}</strong>
                </div>
                <div className="profile-item">
                  <label>GENDER</label>
                  <strong>{patientInfo.gender}</strong>
                </div>
                <div className="profile-item">
                  <label>STATUS</label>
                  <strong className="verified">✓ Blockchain Verified</strong>
                </div>
                <div className="profile-item wallet-item">
                  <label>WALLET ADDRESS</label>
                  <strong>{account}</strong>
                </div>
              </div>
            )}
          </section>

          <section className="card">
            <div className="section-title">
              <span>🔐</span>
              <div>
                <h2>Doctor Access</h2>
                <p>Control which doctors can access your records</p>
              </div>
            </div>

            <input
              className="full-input"
              type="text"
              placeholder="Doctor Wallet Address"
              value={doctorAddress}
              onChange={(e) => setDoctorAddress(e.target.value)}
            />

            <div className="button-row">
              <button className="primary-btn" onClick={grantAccess} disabled={loading}>
                Grant Access
              </button>
              <button className="danger-btn" onClick={revokeAccess} disabled={loading}>
                Revoke Access
              </button>
            </div>
          </section>

          <section className="card">
            <div className="section-title">
              <span>📄</span>
              <div>
                <h2>My Medical Record</h2>
                <p>View your blockchain medical record</p>
              </div>
            </div>

            <div className="search-row">
              <input
                type="number"
                placeholder="Enter Record ID"
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
              />
              <button className="primary-btn" onClick={viewMedicalRecord} disabled={loading}>
                View Record
              </button>
            </div>

            {record && <RecordDisplay record={record} />}
          </section>

          <section className="card dashboard-card-wide">
            <div className="section-title">
              <span>📊</span>
              <div>
                <h2>Patient Overview</h2>
                <p>Your current access and medical record statistics</p>
              </div>
            </div>

            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">👨‍⚕️</div>
                <div>
                  <strong>{dashboardLoading ? "…" : patientDoctors.length}</strong>
                  <span>Authorized Doctors</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📄</div>
                <div>
                  <strong>{dashboardLoading ? "…" : patientRecordTotal}</strong>
                  <span>Total Medical Records</span>
                </div>
              </div>
            </div>
          </section>

          <section className="card dashboard-card-wide">
            <div className="section-title">
              <span>🔐</span>
              <div>
                <h2>Doctors With Access</h2>
                <p>Doctors currently authorized to view your records</p>
              </div>
            </div>

            {patientDoctors.length === 0 ? (
              <div className="empty-state">
                <span>👨‍⚕️</span>
                <strong>No doctors have access yet</strong>
                <p>Grant access using the Doctor Wallet Address above.</p>
              </div>
            ) : (
              <div className="access-list">
                {patientDoctors.map((doctor) => (
                  <div className="access-person-card" key={doctor.address}>
                    <div className="person-card-top">
                      <div className="person-avatar">👨‍⚕️</div>
                      <div className="person-main">
                        <strong>{doctor.name}</strong>
                        <span>{doctor.specialization}</span>
                      </div>
                      <span className="access-badge">✓ ACCESS GRANTED</span>
                    </div>
                    <div className="person-details">
                      <div>
                        <label>LICENSE</label>
                        <span>{doctor.licenseNumber}</span>
                      </div>
                      <div>
                        <label>RECORDS</label>
                        <span>{doctor.recordCount}</span>
                      </div>
                      <div className="address-detail">
                        <label>WALLET</label>
                        <code>{doctor.address}</code>
                      </div>
                    </div>
                    <button
                      className="danger-btn revoke-card-btn"
                      disabled={loading}
                      onClick={() => { setDoctorAddress(doctor.address); revokeAccessForDoctor(doctor.address); }}
                    >
                      Revoke Access
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    )}


    {/* ================= DOCTOR DASHBOARD ================= */}

    {page === "doctor-dashboard" && (
      <main className="dashboard">

        <div className="dashboard-heading">
          <div>
            <span className="label">DOCTOR PORTAL</span>
            <h2>Doctor Dashboard 👨‍⚕️</h2>
            <div className="wallet-bar">
              <span className="wallet-dot"></span>
              <span className="wallet-label">Connected wallet</span>
              <code>{account}</code>
              <span className="network-pill">Sepolia</span>
            </div>
          </div>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="dashboard-grid">
          <section className="card profile-card dashboard-card-wide">
            <div className="section-title">
              <span>👨‍⚕️</span>
              <div>
                <h2>Doctor Profile</h2>
                <p>Your verified blockchain identity</p>
              </div>
            </div>

            {doctorInfo && (
              <div className="profile-grid">
                <div className="profile-item">
                  <label>NAME</label>
                  <strong>{doctorInfo.name}</strong>
                </div>
                <div className="profile-item">
                  <label>SPECIALIZATION</label>
                  <strong>{doctorInfo.specialization}</strong>
                </div>
                <div className="profile-item">
                  <label>LICENSE NUMBER</label>
                  <strong>{doctorInfo.licenseNumber}</strong>
                </div>
                <div className="profile-item">
                  <label>STATUS</label>
                  <strong className="verified">✓ Blockchain Verified</strong>
                </div>
                <div className="profile-item wallet-item">
                  <label>WALLET ADDRESS</label>
                  <strong>{account}</strong>
                </div>
              </div>
            )}
          </section>

          <section className="card">
            <div className="section-title">
              <span>📄</span>
              <div>
                <h2>Add Medical Record</h2>
                <p>Add a record for an authorized patient</p>
              </div>
            </div>

            <input
              className="full-input"
              type="text"
              placeholder="Patient Wallet Address"
              value={recordPatient}
              onChange={(e) => setRecordPatient(e.target.value)}
            />

            <div className="form-grid">
              <input
                type="text"
                placeholder="Record Type"
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
              />
              <input
                type="text"
                placeholder="Description"
                value={recordDescription}
                onChange={(e) => setRecordDescription(e.target.value)}
              />
            </div>

            <div className="file-upload-section">
              <div className="file-upload-heading">
                <div>
                  <strong>Medical Document</strong>
                  <span>Optional • The file stays off-chain</span>
                </div>
                {recordFile && (
                  <button
                    type="button"
                    className="clear-file-btn"
                    onClick={clearRecordFile}
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </div>

              {!recordFile ? (
                <label className="file-dropzone">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt"
                    onChange={handleRecordFile}
                    disabled={loading}
                  />
                  <span className="file-upload-icon">📎</span>
                  <strong>Upload medical document</strong>
                  <span>Optional • PDF, image, DOC/DOCX or TXT</span>
                </label>
              ) : (
                <div className="selected-file">
                  <div className="selected-file-icon">📄</div>
                  <div className="selected-file-info">
                    <strong>{recordFile.name}</strong>
                    <span>{(recordFile.size / 1024).toFixed(1)} KB • SHA-256 hash generated</span>
                  </div>
                </div>
              )}
            </div>

            <div className="generated-hash-box">
              <div className="generated-hash-heading">
                <div>
                  <strong>Generated Record Hash</strong>
                  <span>Automatically generated before the blockchain transaction</span>
                </div>
                {recordHash && <span className="hash-ready">✓ Ready</span>}
              </div>

              <code className={recordHash ? "hash-value" : "hash-placeholder"}>
                {hashingFile
                  ? "Generating SHA-256 hash..."
                  : recordHash || "Hash will be generated automatically"}
              </code>

              {hashSource && !hashingFile && (
                <span className="hash-source">Source: {hashSource}</span>
              )}
            </div>

            <button
              className="primary-btn full-action-btn"
              onClick={addMedicalRecord}
              disabled={loading || hashingFile}
            >
              {loading ? "Processing..." : "Add Medical Record"}
            </button>
          </section>

          <section className="card">
            <div className="section-title">
              <span>🔎</span>
              <div>
                <h2>View Patient Record</h2>
                <p>View records for patients who have granted you access</p>
              </div>
            </div>

            <div className="search-row">
              <input
                type="number"
                placeholder="Enter Record ID"
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
              />
              <button className="primary-btn" onClick={viewMedicalRecord} disabled={loading}>
                View Record
              </button>
            </div>

            {record && <RecordDisplay record={record} />}
          </section>

          <section className="card dashboard-card-wide">
            <div className="section-title">
              <span>📊</span>
              <div>
                <h2>Doctor Overview</h2>
                <p>Your authorized patients and record activity</p>
              </div>
            </div>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon">👤</div>
                <div><strong>{dashboardLoading ? "…" : doctorPatients.length}</strong><span>Authorized Patients</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div><strong>{dashboardLoading ? "…" : doctorRecordTotal}</strong><span>Records Added</span></div>
              </div>
            </div>
          </section>

          <section className="card dashboard-card-wide">
            <div className="section-title">
              <span>👥</span>
              <div>
                <h2>My Authorized Patients</h2>
                <p>Patients who have granted your wallet access</p>
              </div>
            </div>
            {doctorPatients.length === 0 ? (
              <div className="empty-state">
                <span>👤</span>
                <strong>No patients have authorized you yet</strong>
                <p>Ask a registered patient to grant access to your doctor wallet.</p>
              </div>
            ) : (
              <div className="access-list">
                {doctorPatients.map((patient) => (
                  <div className="access-person-card" key={patient.address}>
                    <div className="person-card-top">
                      <div className="person-avatar patient-avatar">👤</div>
                      <div className="person-main">
                        <strong>{patient.name}</strong>
                        <span>{patient.age} years • {patient.gender}</span>
                      </div>
                      <span className="access-badge">✓ AUTHORIZED</span>
                    </div>
                    <div className="person-details">
                      <div><label>RECORDS BY YOU</label><span>{patient.recordCount}</span></div>
                      <div className="address-detail"><label>PATIENT WALLET</label><code>{patient.address}</code></div>
                    </div>
                    <button className="secondary-card-btn" onClick={() => setRecordPatient(patient.address)}>
                      Add Record for Patient
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    )}

{/* ================= DOCTOR REGISTER ================= */}

    {page === "doctor-register" && (
      <main className="login-page">

        <div className="login-card">

          <div className="login-icon doctor-icon">
            👨‍⚕️
          </div>

          <h2>Doctor Registration</h2>

          <p>
            Create your blockchain-based doctor identity.
          </p>

          <input
            type="text"
            placeholder="Full Name"
            value={doctorName}
            onChange={(e) =>
              setDoctorName(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Specialization"
            value={doctorSpecialization}
            onChange={(e) =>
              setDoctorSpecialization(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Medical License Number"
            value={doctorLicense}
            onChange={(e) =>
              setDoctorLicense(e.target.value)
            }
          />

          <button
            className="primary-btn login-btn"
            onClick={async () => {

              const address = await connectWallet();

              if (!address) return;

              await registerDoctor();

            }}
            disabled={loading}
          >
            Register Doctor
          </button>

          <button
            className="back-btn"
            onClick={() =>
              setPage("doctor-login")
            }
          >
            ← Back to Doctor Login
          </button>

        </div>

      </main>
    )}



  {/* ================= PATIENT REGISTER ================= */}

    {page === "patient-register" && (
        <main className="login-page">

          <div className="login-card">

            <div className="login-icon">
              📝
            </div>

            <h2>Patient Registration</h2>

            <p>
              Create your blockchain-based patient identity.
            </p>

            <input
              type="text"
              placeholder="Full Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />

            <input
              type="number"
              placeholder="Age"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
            />

            <input
              type="text"
              placeholder="Gender"
              value={patientGender}
              onChange={(e) => setPatientGender(e.target.value)}
            />

            <button
              className="primary-btn login-btn"
              onClick={async () => {

                const address = await connectWallet();

                if (!address) return;

                await registerPatient();

              }}
              disabled={loading}
            >
              Register Patient
            </button>

            <button
              className="back-btn"
              onClick={() => setPage("patient-login")}
            >
              ← Back to Patient Login
            </button>

          </div>

        </main>
      )}

    <footer>
      MedicalChain • Ethereum Sepolia Testnet
    </footer>

  </div>
);
}

export default App;