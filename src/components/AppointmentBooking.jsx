import React, { useState } from "react";
import { PlusCircle, Calendar, Clock, MessageSquare, User, Stethoscope, CheckCircle, XCircle, AlertCircle, Sparkles } from "lucide-react";

export default function AppointmentBooking({ patients, doctors, appointments, onBookAppointment, onUpdateAppointmentStatus }) {
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    reason: ""
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const activeDoctors = doctors.filter((doc) => doc.availability === "Active");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientId) newErrors.patientId = "Please select a patient";
    if (!formData.doctorId) newErrors.doctorId = "Please select a doctor";
    if (!formData.date) newErrors.date = "Please select an appointment date";
    if (!formData.time) newErrors.time = "Please select a time slot";
    if (!formData.reason.trim()) newErrors.reason = "Please enter the reason for the visit";

    // Validate that appointment date is not in the past
    if (formData.date) {
      const selectedDate = new Date(formData.date + "T" + (formData.time || "00:00"));
      const now = new Date();
      if (selectedDate < now && formData.date !== now.toISOString().split("T")[0]) {
        newErrors.date = "Appointment cannot be scheduled in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedPatient = patients.find((p) => p.id === formData.patientId);
    const selectedDoctor = doctors.find((d) => d.id === formData.doctorId);

    onBookAppointment({
      patientId: formData.patientId,
      patientName: selectedPatient ? selectedPatient.name : "Unknown Patient",
      doctorId: formData.doctorId,
      doctorName: selectedDoctor ? selectedDoctor.name : "Unknown Doctor",
      date: formData.date,
      time: formData.time,
      reason: formData.reason.trim(),
      status: "Scheduled"
    });

    setFormData({
      patientId: "",
      doctorId: "",
      date: "",
      time: "",
      reason: ""
    });

    setSuccessMsg("Appointment scheduled successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Scheduled":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Cancelled":
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Appointment Booking Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Book Appointment</h2>
              <p className="text-xs text-slate-500">Schedule a patient consultation</p>
            </div>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-100 animate-pulse">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Select Patient
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 smooth-transition bg-white ${
                    errors.patientId ? "border-red-500 bg-red-50/10" : ""
                  }`}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((pat) => (
                    <option key={pat.id} value={pat.id}>
                      {pat.name} ({pat.id})
                    </option>
                  ))}
                </select>
              </div>
              {errors.patientId && <p className="text-xs text-red-500 mt-1">{errors.patientId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Select Available Doctor
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 smooth-transition bg-white ${
                    errors.doctorId ? "border-red-500 bg-red-50/10" : ""
                  }`}
                >
                  <option value="">-- Choose Doctor --</option>
                  {activeDoctors.length > 0 ? (
                    activeDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} - {doc.specialization}
                      </option>
                    ))
                  ) : (
                    <option disabled>No Doctors Available (On Duty)</option>
                  )}
                </select>
              </div>
              {activeDoctors.length === 0 && (
                <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  All doctors are currently set to Off Duty
                </div>
              )}
              {errors.doctorId && <p className="text-xs text-red-500 mt-1">{errors.doctorId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 smooth-transition ${
                      errors.date ? "border-red-500 bg-red-50/10" : "border-slate-200"
                    }`}
                  />
                </div>
                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Time Slot
                </label>
                <div className="relative">
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 smooth-transition ${
                      errors.time ? "border-red-500 bg-red-50/10" : "border-slate-200"
                    }`}
                  />
                </div>
                {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Reason for Visit
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  name="reason"
                  rows="3"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="e.g., Annual checkup, hypertension assessment..."
                  className={`w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 smooth-transition ${
                    errors.reason ? "border-red-500 bg-red-50/10" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
            </div>

            <button
              type="submit"
              disabled={activeDoctors.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-xl font-medium text-sm shadow-sm hover:shadow smooth-transition mt-4 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Schedule Appointment
            </button>
          </form>
        </div>
      </div>

      {/* Appointments List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Appointment Dashboard</h2>
            <p className="text-xs text-slate-500">Real-time schedule of consultations</p>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {appointments.length > 0 ? (
              appointments.slice().reverse().map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-xl p-4 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/10 smooth-transition flex flex-col md:flex-row md:items-center justify-between gap-4 card-shadow"
                >
                  <div className="flex-1 space-y-2">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 text-sm">{apt.patientName}</span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-xs text-slate-500 font-medium">with {apt.doctorName}</span>
                      <span
                        className={`ml-auto md:ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(
                          apt.status
                        )}`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    {/* Meta details */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        {apt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {apt.time}
                      </span>
                    </div>

                    {/* Reason */}
                    <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                      <span className="font-medium text-slate-700">Reason: </span>
                      {apt.reason}
                    </div>
                  </div>

                  {/* Actions */}
                  {apt.status === "Scheduled" && (
                    <div className="flex md:flex-col items-center justify-end gap-2 border-t md:border-t-0 border-slate-50 pt-2.5 md:pt-0">
                      <button
                        onClick={() => onUpdateAppointmentStatus(apt.id, "Completed")}
                        className="flex-1 md:w-32 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-200/50 smooth-transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Complete
                      </button>
                      <button
                        onClick={() => onUpdateAppointmentStatus(apt.id, "Cancelled")}
                        className="flex-1 md:w-32 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-200/50 smooth-transition flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No appointments booked in the system.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
