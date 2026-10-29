// MedicalChain contract configuration
//
// IMPORTANT:
// Deploy MedicalRecords4.sol to Ethereum Sepolia first.
// Then replace CONTRACT_ADDRESS with the NEW deployment address.
// Do NOT use the old MedicalRecords3 address.

export const CONTRACT_ADDRESS =
  "0x119f426886f7e778FEC04bAb3b76d708A146f0bE";

export const CONTRACT_ABI = [
  // =========================
  // PATIENT
  // =========================

  "function registerPatient(string name, uint256 age, string gender)",

  "function patients(address) view returns (string name, uint256 age, string gender, bool registered)",

  "function isPatientRegistered(address patient) view returns (bool)",

  "function getPatientCount() view returns (uint256)",

  "function getPatientRecordCount(address patient) view returns (uint256)",


  // =========================
  // DOCTOR
  // =========================

  "function registerDoctor(string name, string specialization, string licenseNumber)",

  "function doctors(address) view returns (string name, string specialization, string licenseNumber, bool registered)",

  "function isDoctorRegistered(address doctor) view returns (bool)",

  "function getDoctorCount() view returns (uint256)",

  "function getDoctorRecordCount(address doctor) view returns (uint256)",


  // =========================
  // ACCESS CONTROL
  // =========================

  "function grantAccess(address doctor)",

  "function revokeAccess(address doctor)",

  "function hasAccess(address patient, address doctor) view returns (bool)",

  "function access(address, address) view returns (bool)",

  "function getPatientDoctors(address patient) view returns (address[])",

  "function getDoctorPatients(address doctor) view returns (address[])",

  "function getPatientDoctorRecordCount(address patient, address doctor) view returns (uint256)",


  // =========================
  // MEDICAL RECORDS
  // =========================

  "function addMedicalRecord(address patient, string recordType, string description, string recordHash)",

  "function getRecordCount() view returns (uint256)",

  "function getRecord(uint256 id) view returns (uint256 id, address patient, address doctor, string recordType, string description, string recordHash, uint256 timestamp)",


  // =========================
  // PUBLIC COUNTERS
  // =========================

  "function recordCount() view returns (uint256)"
];