import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Dynamic admin password hashing for local library compatibility
(async () => {
  try {
    // Generate salt and hash locally
    const hashed = await bcrypt.hash("password", 10);
    const [users] = await db.query("SELECT * FROM users WHERE username = 'admin'");
    if (users.length === 0) {
      await db.query(
        "INSERT INTO users (id, username, password_hash, name) VALUES (?, ?, ?, ?)",
        ["usr-1", "admin", hashed, "Administrator"]
      );
      console.log("Seeded default admin user with dynamically hashed password.");
    } else {
      await db.query(
        "UPDATE users SET password_hash = ? WHERE username = 'admin'",
        [hashed]
      );
      console.log("Updated admin password hash for local bcrypt compatibility.");
    }
  } catch (err) {
    console.warn("Could not sync default admin user (Database might be starting up).");
  }
})();

// Helper to generate sequential IDs (e.g. pat-6, doc-6, apt-4)
async function getNextId(table, prefix) {
  try {
    const [rows] = await db.query(`SELECT id FROM ${table}`);
    let maxNum = 0;
    rows.forEach((row) => {
      // Extract numeric suffix
      const suffix = row.id.split("-").pop();
      const num = parseInt(suffix);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    });
    return `${prefix}${maxNum + 1}`;
  } catch (error) {
    console.error(`Error generating ID for ${table}:`, error.message);
    return `${prefix}${Date.now().toString().slice(-4)}`;
  }
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. Auth token required." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || "care_clinic_jwt_secret_key_2026");
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
};

// ==========================================
// 1. Authentication Routes
// ==========================================
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Please enter all fields." });
  }

  try {
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    // Sign Token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "care_clinic_jwt_secret_key_2026",
      { expiresIn: "12h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify token check for app mount
app.get("/api/auth/verify", authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});


// ==========================================
// 2. Patient Directory API
// ==========================================
app.get("/api/patients", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM patients");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/patients", authenticateToken, async (req, res) => {
  const { name, age, gender, phone, bloodGroup } = req.body;
  if (!name || !age || !gender || !phone || !bloodGroup) {
    return res.status(400).json({ error: "Please enter all fields." });
  }

  try {
    const newId = await getNextId("patients", "pat-");
    await db.query(
      "INSERT INTO patients (id, name, age, gender, phone, bloodGroup) VALUES (?, ?, ?, ?, ?, ?)",
      [newId, name, age, gender, phone, bloodGroup]
    );
    res.status(201).json({ id: newId, name, age, gender, phone, bloodGroup });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// 3. Doctors API
// ==========================================
app.get("/api/doctors", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM doctors");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/doctors", authenticateToken, async (req, res) => {
  const { name, specialization, email, phone, experience, room } = req.body;
  if (!name || !specialization || !email || !phone || !experience || !room) {
    return res.status(400).json({ error: "Please enter all fields." });
  }

  try {
    const newId = await getNextId("doctors", "doc-");
    await db.query(
      "INSERT INTO doctors (id, name, specialization, availability, email, phone, experience, room) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [newId, name, specialization, "Active", email, phone, experience, room]
    );
    res.status(201).json({ id: newId, name, specialization, availability: "Active", email, phone, experience, room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/doctors/:id/availability", authenticateToken, async (req, res) => {
  const { availability } = req.body;
  const { id } = req.params;

  if (!availability) {
    return res.status(400).json({ error: "Availability status is required" });
  }

  try {
    await db.query("UPDATE doctors SET availability = ? WHERE id = ?", [availability, id]);
    res.json({ message: "Availability updated successfully", id, availability });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// 4. Appointments API
// ==========================================
app.get("/api/appointments", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM appointments");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/appointments", authenticateToken, async (req, res) => {
  const { patientId, patientName, doctorId, doctorName, date, time, reason } = req.body;
  if (!patientId || !patientName || !doctorId || !doctorName || !date || !time || !reason) {
    return res.status(400).json({ error: "Please enter all fields." });
  }

  try {
    const newId = await getNextId("appointments", "apt-");
    await db.query(
      "INSERT INTO appointments (id, patientId, patientName, doctorId, doctorName, date, time, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [newId, patientId, patientName, doctorId, doctorName, date, time, reason, "Scheduled"]
    );
    res.status(201).json({ id: newId, patientId, patientName, doctorId, doctorName, date, time, reason, status: "Scheduled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/appointments/:id/status", authenticateToken, async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    await db.query("UPDATE appointments SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Appointment status updated", id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// 5. Billing Invoices API
// ==========================================
app.get("/api/invoices", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM invoices");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/invoices", authenticateToken, async (req, res) => {
  const { patientId, patientName, doctorId, doctorName, date, consultingFee, treatmentFee, medicineFee, taxRate, taxAmount, total, status } = req.body;
  
  if (!patientId || !patientName || !doctorId || !doctorName || !date || consultingFee === undefined || total === undefined) {
    return res.status(400).json({ error: "Please enter all fields." });
  }

  try {
    const newId = await getNextId("invoices", "inv-");
    await db.query(
      "INSERT INTO invoices (id, patientId, patientName, doctorId, doctorName, date, consultingFee, treatmentFee, medicineFee, taxRate, taxAmount, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [newId, patientId, patientName, doctorId, doctorName, date, consultingFee, treatmentFee, medicineFee, taxRate, taxAmount, total, status || "Paid"]
    );
    res.status(201).json({ id: newId, patientId, patientName, doctorId, doctorName, date, consultingFee, treatmentFee, medicineFee, taxRate, taxAmount, total, status: status || "Paid" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// 6. Medical Records API
// ==========================================
app.get("/api/records", authenticateToken, async (req, res) => {
  try {
    // Return records grouped by patientId
    const [records] = await db.query("SELECT * FROM medical_records");
    const [prescriptions] = await db.query("SELECT * FROM prescriptions");

    const recordMap = {};
    records.forEach((rec) => {
      // Parse vitals JSON structure
      const parsedRecord = {
        id: rec.id,
        date: rec.date,
        doctorName: rec.doctorName,
        diagnosis: rec.diagnosis,
        vitals: {
          bp: rec.bp,
          hr: rec.hr,
          temp: rec.temp,
          wt: rec.wt
        },
        notes: rec.notes,
        prescription: prescriptions
          .filter((p) => p.recordId === rec.id)
          .map((p) => ({ name: p.name, dosage: p.dosage, frequency: p.frequency, duration: p.duration }))
      };

      if (!recordMap[rec.patientId]) {
        recordMap[rec.patientId] = [];
      }
      recordMap[rec.patientId].push(parsedRecord);
    });

    res.json(recordMap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/records/:patientId", authenticateToken, async (req, res) => {
  const { patientId } = req.params;
  const { doctorName, diagnosis, vitals, prescription, notes, date } = req.body;

  if (!doctorName || !diagnosis || !vitals) {
    return res.status(400).json({ error: "Missing required clinical entries." });
  }

  const recordDate = date || new Date().toISOString().split("T")[0];

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const newRecId = await getNextId("medical_records", "rec-");

    // Insert medical record row
    await connection.query(
      "INSERT INTO medical_records (id, patientId, date, doctorName, diagnosis, bp, hr, temp, wt, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [newRecId, patientId, recordDate, doctorName, diagnosis, vitals.bp || "--", vitals.hr || "--", vitals.temp || "--", vitals.wt || "--", notes || ""]
    );

    // Insert prescription entries
    if (prescription && prescription.length > 0) {
      for (const p of prescription) {
        if (p.name && p.name.trim() !== "") {
          await connection.query(
            "INSERT INTO prescriptions (recordId, name, dosage, frequency, duration) VALUES (?, ?, ?, ?, ?)",
            [newRecId, p.name, p.dosage || "", p.frequency || "", p.duration || ""]
          );
        }
      }
    }

    await connection.commit();
    res.status(201).json({ message: "Record logged successfully", id: newRecId });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

app.listen(PORT, () => {
  console.log(`HMS API Server listening on port ${PORT}`);
});
