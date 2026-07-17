import React, { useState, useEffect } from "react";
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  Receipt, 
  Clipboard, 
  Activity, 
  DollarSign, 
  Clock, 
  HeartHandshake,
  LogOut,
  Database,
  DatabaseZap
} from "lucide-react";

// API Services
import { api } from "./services/api";

// Components
import Login from "./components/Login";
import PatientRegistration from "./components/PatientRegistration";
import DoctorManagement from "./components/DoctorManagement";
import AppointmentBooking from "./components/AppointmentBooking";
import BillingInvoice from "./components/BillingInvoice";
import MedicalRecords from "./components/MedicalRecords";

export default function App() {
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem("hms_token") || null);
  const [user, setUser] = useState(null);
  
  // App Core State
  const [activeTab, setActiveTab] = useState("Patients");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState({});
  const [invoices, setInvoices] = useState([]);
  
  // UX State
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState(false);

  // Shared navigation state
  const [selectedPatientId, setSelectedPatientId] = useState("");

  // Validate Token and Retrieve User Profile on mount
  useEffect(() => {
    if (token) {
      api.auth.verify()
        .then(data => {
          setUser(data.user);
          loadAllData();
        })
        .catch(() => {
          // Token expired or invalid
          handleLogout();
        });
    }
  }, [token]);

  // Bulk load data from MySQL REST API
  const loadAllData = async () => {
    setLoading(true);
    setDbError(false);
    try {
      const [patList, docList, aptList, invList, recMap] = await Promise.all([
        api.patients.getAll(),
        api.doctors.getAll(),
        api.appointments.getAll(),
        api.invoices.getAll(),
        api.records.getAll()
      ]);

      setPatients(patList);
      setDoctors(docList);
      setAppointments(aptList);
      setInvoices(invList);
      setMedicalRecords(recMap);
    } catch (err) {
      console.error("API error loading records:", err.message);
      setDbError(true);
    } finally {
      setLoading(false);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (newToken, authUser) => {
    localStorage.setItem("hms_token", newToken);
    setToken(newToken);
    setUser(authUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("hms_token");
    setToken(null);
    setUser(null);
    // Clear data
    setPatients([]);
    setDoctors([]);
    setAppointments([]);
    setInvoices([]);
    setMedicalRecords({});
  };

  // State manipulation Handlers
  const handleAddPatient = async (patient) => {
    try {
      const newPatient = await api.patients.create(patient);
      setPatients((prev) => [...prev, newPatient]);
      // Initialize records structure for this new patient locally
      setMedicalRecords((prev) => ({ ...prev, [newPatient.id]: [] }));
    } catch (err) {
      alert("Failed to register patient: " + err.message);
    }
  };

  const handleAddDoctor = async (doctor) => {
    try {
      const newDoctor = await api.doctors.create(doctor);
      setDoctors((prev) => [...prev, newDoctor]);
    } catch (err) {
      alert("Failed to add doctor: " + err.message);
    }
  };

  const handleToggleDoctorAvailability = async (docId) => {
    const doc = doctors.find((d) => d.id === docId);
    if (!doc) return;

    try {
      const nextStatus = doc.availability === "Active" ? "Inactive" : "Active";
      await api.doctors.toggleAvailability(docId, doc.availability);
      
      setDoctors((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, availability: nextStatus } : d))
      );
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleBookAppointment = async (apt) => {
    try {
      const newApt = await api.appointments.create(apt);
      setAppointments((prev) => [...prev, newApt]);
    } catch (err) {
      alert("Failed to book appointment: " + err.message);
    }
  };

  const handleUpdateAppointmentStatus = async (aptId, status) => {
    try {
      await api.appointments.updateStatus(aptId, status);
      setAppointments((prev) =>
        prev.map((a) => (a.id === aptId ? { ...a, status } : a))
      );
    } catch (err) {
      alert("Failed to update appointment: " + err.message);
    }
  };

  const handleAddInvoice = async (invoice) => {
    try {
      const newInvoice = await api.invoices.create(invoice);
      setInvoices((prev) => [...prev, newInvoice]);
    } catch (err) {
      alert("Failed to log billing invoice: " + err.message);
    }
  };

  const handleAddMedicalRecord = async (patId, record) => {
    try {
      const result = await api.records.create(patId, record);
      
      // Re-map the new record layout to local state
      const newLocalRecord = {
        id: result.id,
        date: record.date,
        doctorName: record.doctorName,
        diagnosis: record.diagnosis,
        vitals: record.vitals,
        notes: record.notes,
        prescription: record.prescription
      };

      const currentRecords = medicalRecords[patId] || [];
      setMedicalRecords((prev) => ({
        ...prev,
        [patId]: [...currentRecords, newLocalRecord]
      }));
    } catch (err) {
      alert("Failed to append medical file entry: " + err.message);
    }
  };

  // Navigation coupling handler
  const handleNavigateToMedicalRecords = (patId) => {
    setSelectedPatientId(patId);
    setActiveTab("Medical Records");
  };

  // Render Login page if not authenticated
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Stats calculations
  const totalPatients = patients.length;
  const activeDoctorsCount = doctors.filter((d) => d.availability === "Active").length;
  const pendingAppointments = appointments.filter((a) => a.status === "Scheduled").length;
  const totalInvoiced = invoices.reduce((acc, curr) => acc + Number(curr.total), 0);

  // Sidebar navigation menu items
  const navItems = [
    { name: "Patients", icon: Users, color: "text-teal-600 bg-teal-50" },
    { name: "Doctors", icon: Stethoscope, color: "text-indigo-600 bg-indigo-50" },
    { name: "Appointments", icon: Calendar, color: "text-blue-600 bg-blue-50" },
    { name: "Billing", icon: Receipt, color: "text-sky-600 bg-sky-50" },
    { name: "Medical Records", icon: Clipboard, color: "text-emerald-600 bg-emerald-50" }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-white border-r border-slate-100 p-6 flex flex-col shrink-0 print:hidden">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 pb-8 border-b border-slate-50">
          <div className="p-2.5 bg-gradient-to-tr from-teal-500 to-indigo-600 text-white rounded-xl shadow-md">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-slate-800 uppercase">Care Clinic</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider">Health Management</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? "bg-slate-800 text-white" : item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Database Status indicator */}
        <div className="my-2 border-t border-slate-50 pt-4 pb-2">
          {dbError ? (
            <div className="flex items-center gap-2 text-[10px] text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl font-bold animate-pulse">
              <DatabaseZap className="w-4 h-4" />
              MySQL Offline
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[10px] text-teal-600 bg-teal-50 border border-teal-100 px-3 py-2 rounded-xl font-bold">
              <Database className="w-4 h-4" />
              MySQL Connected
            </div>
          )}
        </div>

        {/* Log Out Option */}
        <div className="pt-4 border-t border-slate-50 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 smooth-transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-700">Staff Portal</p>
              <p className="text-[9px] font-semibold text-slate-400">MySQL Backend</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-x-hidden">
        
        {/* Connection Error Banner */}
        {dbError && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden animate-bounce">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <DatabaseZap className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-700 leading-normal">
                <span className="font-bold block">Local MySQL Connection Offline!</span>
                Ensure that your MySQL Server instance is running, that <code>hms_db</code> exists, and credentials in <code>server/.env</code> are correct.
              </div>
            </div>
            <button
              onClick={loadAllData}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl smooth-transition shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 print:hidden">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{activeTab}</h1>
            <p className="text-xs text-slate-500 font-medium">Manage clinical files, staffing schedules, and client billing</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-right text-xs font-semibold text-slate-500 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-xs self-start sm:self-auto">
              System Date: <span className="text-indigo-600 font-bold">July 16, 2026</span>
            </div>
            {user && (
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-1">
                Active Session: {user.username}
              </span>
            )}
          </div>
        </header>

        {/* Global Statistics Panel */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Patients</span>
              <p className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {loading ? "..." : totalPatients}
              </p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Staff</span>
              <p className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {loading ? "..." : activeDoctorsCount}
              </p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Appts</span>
              <p className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {loading ? "..." : pendingAppointments}
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoiced Total</span>
              <p className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {loading ? "..." : `$${totalInvoiced.toFixed(2)}`}
              </p>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Loading Overlay */}
        {loading && (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fetching clinical files...</span>
          </div>
        )}

        {/* Conditional Component View Area */}
        {!loading && (
          <section className="bg-slate-50/30 p-1.5 rounded-2xl">
            {activeTab === "Patients" && (
              <PatientRegistration 
                patients={patients} 
                onAddPatient={handleAddPatient} 
                onViewMedicalRecords={handleNavigateToMedicalRecords} 
              />
            )}

            {activeTab === "Doctors" && (
              <DoctorManagement 
                doctors={doctors} 
                onAddDoctor={handleAddDoctor} 
                onToggleAvailability={handleToggleDoctorAvailability} 
              />
            )}

            {activeTab === "Appointments" && (
              <AppointmentBooking 
                patients={patients} 
                doctors={doctors} 
                appointments={appointments} 
                onBookAppointment={handleBookAppointment} 
                onUpdateAppointmentStatus={handleUpdateAppointmentStatus} 
              />
            )}

            {activeTab === "Billing" && (
              <BillingInvoice 
                patients={patients} 
                doctors={doctors} 
                invoices={invoices} 
                onAddInvoice={handleAddInvoice} 
              />
            )}

            {activeTab === "Medical Records" && (
              <MedicalRecords 
                patients={patients} 
                medicalRecords={medicalRecords} 
                onAddMedicalRecord={handleAddMedicalRecord} 
                selectedPatientId={selectedPatientId}
                setSelectedPatientId={setSelectedPatientId}
              />
            )}
          </section>
        )}
      </main>
    </div>
  );
}
