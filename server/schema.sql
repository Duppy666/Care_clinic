-- Create Database
CREATE DATABASE IF NOT EXISTS hms_db;
USE hms_db;

-- Drop Tables if they exist for clean initialization
DROP TABLE IF EXISTS prescriptions;
DROP TABLE IF EXISTS medical_records;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL
);

-- Seed default user (username: admin, password: password)
INSERT INTO users (id, username, password_hash, name) VALUES 
('usr-1', 'admin', '$2a$10$N9qo8uLOtv0sqY8g9bT.D.x1Ff8tJ.K0GgK6F2WqQ.pT6mN1gR6i2', 'Administrator');

-- 2. Doctors Table
CREATE TABLE doctors (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  availability VARCHAR(20) NOT NULL DEFAULT 'Active',
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  experience VARCHAR(50) NOT NULL,
  room VARCHAR(50) NOT NULL
);

-- Seed Doctors
INSERT INTO doctors (id, name, specialization, availability, email, phone, experience, room) VALUES 
('doc-1', 'Dr. Sarah Jenkins', 'Cardiology', 'Active', 'sarah.jenkins@hospital.com', '+1 (555) 019-2834', '12 years', 'Cabin 302'),
('doc-2', 'Dr. Marcus Chen', 'Pediatrics', 'Active', 'marcus.chen@hospital.com', '+1 (555) 014-9821', '8 years', 'Cabin 105'),
('doc-3', 'Dr. Elena Rostova', 'General Medicine', 'Active', 'elena.rostova@hospital.com', '+1 (555) 017-3847', '15 years', 'Cabin 101'),
('doc-4', 'Dr. David Kim', 'Orthopedics', 'Inactive', 'david.kim@hospital.com', '+1 (555) 012-7743', '10 years', 'Cabin 204'),
('doc-5', 'Dr. Amanda Ross', 'Neurology', 'Active', 'amanda.ross@hospital.com', '+1 (555) 011-2394', '14 years', 'Cabin 308');

-- 3. Patients Table
CREATE TABLE patients (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INT NOT NULL,
  gender VARCHAR(20) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  bloodGroup VARCHAR(10) NOT NULL
);

-- Seed Patients
INSERT INTO patients (id, name, age, gender, phone, bloodGroup) VALUES
('pat-1', 'Robert Miller', 45, 'Male', '+1 (555) 019-9922', 'O+'),
('pat-2', 'Sophia Martinez', 29, 'Female', '+1 (555) 018-8833', 'A-'),
('pat-3', 'James Wilson', 62, 'Male', '+1 (555) 017-7744', 'B+'),
('pat-4', 'Emily Taylor', 8, 'Female', '+1 (555) 016-6655', 'AB+'),
('pat-5', 'Michael Brown', 35, 'Male', '+1 (555) 015-5566', 'O-');

-- 4. Appointments Table
CREATE TABLE appointments (
  id VARCHAR(50) PRIMARY KEY,
  patientId VARCHAR(50) NOT NULL,
  patientName VARCHAR(100) NOT NULL,
  doctorId VARCHAR(50) NOT NULL,
  doctorName VARCHAR(100) NOT NULL,
  date VARCHAR(20) NOT NULL,
  time VARCHAR(20) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Scheduled',
  FOREIGN KEY (patientId) REFERENCES patients(id),
  FOREIGN KEY (doctorId) REFERENCES doctors(id)
);

-- Seed Appointments
INSERT INTO appointments (id, patientId, patientName, doctorId, doctorName, date, time, reason, status) VALUES
('apt-1', 'pat-1', 'Robert Miller', 'doc-1', 'Dr. Sarah Jenkins', '2026-07-17', '10:30', 'Routine cardiovascular checkup, reports on cholesterol levels', 'Scheduled'),
('apt-2', 'pat-4', 'Emily Taylor', 'doc-2', 'Dr. Marcus Chen', '2026-07-17', '14:15', 'Mild fever and sore throat checkup', 'Scheduled'),
('apt-3', 'pat-3', 'James Wilson', 'doc-3', 'Dr. Elena Rostova', '2026-07-15', '09:00', 'General health follow-up post hypertension prescription', 'Completed');

-- 5. Medical Records Table
CREATE TABLE medical_records (
  id VARCHAR(50) PRIMARY KEY,
  patientId VARCHAR(50) NOT NULL,
  date VARCHAR(20) NOT NULL,
  doctorName VARCHAR(100) NOT NULL,
  diagnosis VARCHAR(255) NOT NULL,
  bp VARCHAR(20) NOT NULL,
  hr VARCHAR(20) NOT NULL,
  temp VARCHAR(20) NOT NULL,
  wt VARCHAR(20) NOT NULL,
  notes TEXT NOT NULL,
  FOREIGN KEY (patientId) REFERENCES patients(id)
);

-- Seed Medical Records
INSERT INTO medical_records (id, patientId, date, doctorName, diagnosis, bp, hr, temp, wt, notes) VALUES
('rec-1-1', 'pat-1', '2026-04-12', 'Dr. Sarah Jenkins', 'Mild Hypertension', '135/85', '78', '98.6', '82', 'Patient advised to reduce sodium intake and perform 30 minutes of light cardio daily.'),
('rec-2-1', 'pat-2', '2026-05-20', 'Dr. Elena Rostova', 'Acute Gastritis', '118/76', '72', '99.0', '60', 'Avoid spicy and acidic foods. Drink plenty of water.'),
('rec-3-1', 'pat-3', '2026-07-15', 'Dr. Elena Rostova', 'Essential Hypertension - Controlled', '124/80', '70', '98.4', '75', 'Blood pressure is well controlled on current regimen. Continue active lifestyle.'),
('rec-4-1', 'pat-4', '2026-01-10', 'Dr. Marcus Chen', 'Seasonal Allergies', '102/65', '88', '98.6', '26', 'Keep patient away from pollen and pets for a few weeks.');

-- 6. Prescriptions Table
CREATE TABLE prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recordId VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  dosage VARCHAR(50) NOT NULL,
  frequency VARCHAR(50) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  FOREIGN KEY (recordId) REFERENCES medical_records(id) ON DELETE CASCADE
);

-- Seed Prescriptions
INSERT INTO prescriptions (recordId, name, dosage, frequency, duration) VALUES
('rec-1-1', 'Lisinopril', '10mg', 'Once daily', '30 Days'),
('rec-2-1', 'Omeprazole', '20mg', 'Before breakfast', '14 Days'),
('rec-2-1', 'Antacid suspension', '10ml', 'Three times daily after meals', '5 Days'),
('rec-3-1', 'Amlodipine', '5mg', 'Once daily in morning', '90 Days'),
('rec-4-1', 'Cetirizine Syrup', '5ml', 'At bedtime', '10 Days');

-- 7. Invoices Table
CREATE TABLE invoices (
  id VARCHAR(50) PRIMARY KEY,
  patientId VARCHAR(50) NOT NULL,
  patientName VARCHAR(100) NOT NULL,
  doctorId VARCHAR(50) NOT NULL,
  doctorName VARCHAR(100) NOT NULL,
  date VARCHAR(20) NOT NULL,
  consultingFee DECIMAL(10,2) NOT NULL,
  treatmentFee DECIMAL(10,2) NOT NULL,
  medicineFee DECIMAL(10,2) NOT NULL,
  taxRate DECIMAL(5,2) NOT NULL,
  taxAmount DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Paid',
  FOREIGN KEY (patientId) REFERENCES patients(id),
  FOREIGN KEY (doctorId) REFERENCES doctors(id)
);

-- Seed Invoices
INSERT INTO invoices (id, patientId, patientName, doctorId, doctorName, date, consultingFee, treatmentFee, medicineFee, taxRate, taxAmount, total, status) VALUES
('inv-1', 'pat-3', 'James Wilson', 'doc-3', 'Dr. Elena Rostova', '2026-07-15', 50.00, 15.00, 25.00, 18.00, 16.20, 106.20, 'Paid');
