export const initialDoctors = [
  {
    id: "doc-1",
    name: "Dr. Sarah Jenkins",
    specialization: "Cardiology",
    availability: "Active",
    email: "sarah.jenkins@hospital.com",
    phone: "+1 (555) 019-2834",
    experience: "12 years",
    room: "Cabin 302"
  },
  {
    id: "doc-2",
    name: "Dr. Marcus Chen",
    specialization: "Pediatrics",
    availability: "Active",
    email: "marcus.chen@hospital.com",
    phone: "+1 (555) 014-9821",
    experience: "8 years",
    room: "Cabin 105"
  },
  {
    id: "doc-3",
    name: "Dr. Elena Rostova",
    specialization: "General Medicine",
    availability: "Active",
    email: "elena.rostova@hospital.com",
    phone: "+1 (555) 017-3847",
    experience: "15 years",
    room: "Cabin 101"
  },
  {
    id: "doc-4",
    name: "Dr. David Kim",
    specialization: "Orthopedics",
    availability: "Inactive",
    email: "david.kim@hospital.com",
    phone: "+1 (555) 012-7743",
    experience: "10 years",
    room: "Cabin 204"
  },
  {
    id: "doc-5",
    name: "Dr. Amanda Ross",
    specialization: "Neurology",
    availability: "Active",
    email: "amanda.ross@hospital.com",
    phone: "+1 (555) 011-2394",
    experience: "14 years",
    room: "Cabin 308"
  }
];

export const initialPatients = [
  {
    id: "pat-1",
    name: "Robert Miller",
    age: 45,
    gender: "Male",
    phone: "+1 (555) 019-9922",
    bloodGroup: "O+"
  },
  {
    id: "pat-2",
    name: "Sophia Martinez",
    age: 29,
    gender: "Female",
    phone: "+1 (555) 018-8833",
    bloodGroup: "A-"
  },
  {
    id: "pat-3",
    name: "James Wilson",
    age: 62,
    gender: "Male",
    phone: "+1 (555) 017-7744",
    bloodGroup: "B+"
  },
  {
    id: "pat-4",
    name: "Emily Taylor",
    age: 8,
    gender: "Female",
    phone: "+1 (555) 016-6655",
    bloodGroup: "AB+"
  },
  {
    id: "pat-5",
    name: "Michael Brown",
    age: 35,
    gender: "Male",
    phone: "+1 (555) 015-5566",
    bloodGroup: "O-"
  }
];

export const initialAppointments = [
  {
    id: "apt-1",
    patientId: "pat-1",
    patientName: "Robert Miller",
    doctorId: "doc-1",
    doctorName: "Dr. Sarah Jenkins",
    date: "2026-07-17",
    time: "10:30",
    reason: "Routine cardiovascular checkup, reports on cholesterol levels",
    status: "Scheduled"
  },
  {
    id: "apt-2",
    patientId: "pat-4",
    patientName: "Emily Taylor",
    doctorId: "doc-2",
    doctorName: "Dr. Marcus Chen",
    date: "2026-07-17",
    time: "14:15",
    reason: "Mild fever and sore throat checkup",
    status: "Scheduled"
  },
  {
    id: "apt-3",
    patientId: "pat-3",
    patientName: "James Wilson",
    doctorId: "doc-3",
    doctorName: "Dr. Elena Rostova",
    date: "2026-07-15",
    time: "09:00",
    reason: "General health follow-up post hypertension prescription",
    status: "Completed"
  }
];

export const initialMedicalRecords = {
  "pat-1": [
    {
      id: "rec-1-1",
      date: "2026-04-12",
      doctorName: "Dr. Sarah Jenkins",
      diagnosis: "Mild Hypertension",
      vitals: { bp: "135/85", hr: "78", temp: "98.6", wt: "82" },
      prescription: [
        { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "30 Days" }
      ],
      notes: "Patient advised to reduce sodium intake and perform 30 minutes of light cardio daily."
    }
  ],
  "pat-2": [
    {
      id: "rec-2-1",
      date: "2026-05-20",
      doctorName: "Dr. Elena Rostova",
      diagnosis: "Acute Gastritis",
      vitals: { bp: "118/76", hr: "72", temp: "99.0", wt: "60" },
      prescription: [
        { name: "Omeprazole", dosage: "20mg", frequency: "Before breakfast", duration: "14 Days" },
        { name: "Antacid suspension", dosage: "10ml", frequency: "Three times daily after meals", duration: "5 Days" }
      ],
      notes: "Avoid spicy and acidic foods. Drink plenty of water."
    }
  ],
  "pat-3": [
    {
      id: "rec-3-1",
      date: "2026-07-15",
      doctorName: "Dr. Elena Rostova",
      diagnosis: "Essential Hypertension - Controlled",
      vitals: { bp: "124/80", hr: "70", temp: "98.4", wt: "75" },
      prescription: [
        { name: "Amlodipine", dosage: "5mg", frequency: "Once daily in morning", duration: "90 Days" }
      ],
      notes: "Blood pressure is well controlled on current regimen. Continue active lifestyle."
    }
  ],
  "pat-4": [
    {
      id: "rec-4-1",
      date: "2026-01-10",
      doctorName: "Dr. Marcus Chen",
      diagnosis: "Seasonal Allergies",
      vitals: { bp: "102/65", hr: "88", temp: "98.6", wt: "26" },
      prescription: [
        { name: "Cetirizine Syrup", dosage: "5ml", frequency: "At bedtime", duration: "10 Days" }
      ],
      notes: "Keep patient away from pollen and pets for a few weeks."
    }
  ],
  "pat-5": []
};

export const initialInvoices = [
  {
    id: "inv-1",
    patientId: "pat-3",
    patientName: "James Wilson",
    doctorId: "doc-3",
    doctorName: "Dr. Elena Rostova",
    date: "2026-07-15",
    consultingFee: 50,
    treatmentFee: 15,
    medicineFee: 25,
    taxRate: 18,
    taxAmount: 16.2,
    total: 106.2,
    status: "Paid"
  }
];
