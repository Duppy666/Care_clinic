import React, { useState, useEffect } from "react";
import { PlusCircle, Search, Clipboard, User, Heart, Activity, Thermometer, Weight, Plus, Trash2, Calendar, Pill } from "lucide-react";

export default function MedicalRecords({ patients, medicalRecords, onAddMedicalRecord, selectedPatientId, setSelectedPatientId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    doctorName: "",
    diagnosis: "",
    bp: "",
    hr: "",
    temp: "",
    wt: "",
    notes: ""
  });
  
  // Dynamic list of prescription items: { name, dosage, frequency, duration }
  const [prescriptions, setPrescriptions] = useState([
    { name: "", dosage: "", frequency: "", duration: "" }
  ]);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  // Select first patient on mount if nothing is pre-selected
  useEffect(() => {
    if (!selectedPatientId && patients.length > 0) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId, setSelectedPatientId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const addPrescriptionRow = () => {
    setPrescriptions([...prescriptions, { name: "", dosage: "", frequency: "", duration: "" }]);
  };

  const removePrescriptionRow = (index) => {
    const updated = prescriptions.filter((_, i) => i !== index);
    setPrescriptions(updated.length > 0 ? updated : [{ name: "", dosage: "", frequency: "", duration: "" }]);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.doctorName.trim()) newErrors.doctorName = "Doctor name is required";
    if (!formData.diagnosis.trim()) newErrors.diagnosis = "Diagnosis summary is required";
    
    // Vitals validations
    if (formData.bp && !/^\d{2,3}\/\d{2,3}$/.test(formData.bp)) {
      newErrors.bp = "Format: SYS/DIA (e.g., 120/80)";
    }
    if (formData.hr && (isNaN(Number(formData.hr)) || Number(formData.hr) <= 0)) {
      newErrors.hr = "Invalid pulse rate";
    }
    if (formData.temp && (isNaN(Number(formData.temp)) || Number(formData.temp) <= 0)) {
      newErrors.temp = "Invalid temperature";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Filter out blank prescriptions
    const validPrescriptions = prescriptions.filter((p) => p.name.trim() !== "");

    const newRecord = {
      id: `rec-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split("T")[0],
      doctorName: formData.doctorName.startsWith("Dr.") ? formData.doctorName.trim() : `Dr. ${formData.doctorName.trim()}`,
      diagnosis: formData.diagnosis.trim(),
      vitals: {
        bp: formData.bp.trim() || "--",
        hr: formData.hr.trim() || "--",
        temp: formData.temp.trim() || "--",
        wt: formData.wt.trim() || "--"
      },
      prescription: validPrescriptions,
      notes: formData.notes.trim() || "No additional clinician notes added."
    };

    onAddMedicalRecord(selectedPatientId, newRecord);

    // Reset Form
    setFormData({
      doctorName: "",
      diagnosis: "",
      bp: "",
      hr: "",
      temp: "",
      wt: "",
      notes: ""
    });
    setPrescriptions([{ name: "", dosage: "", frequency: "", duration: "" }]);
    
    setSuccessMsg("Medical record log appended!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Find active patient details
  const activePatient = patients.find((p) => p.id === selectedPatientId);
  const activeRecords = selectedPatientId ? medicalRecords[selectedPatientId] || [] : [];

  // Filter patients listed in sidebar by search term
  const sidebarPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Patient Selector Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Search Patient Directory
          </label>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition"
            />
          </div>

          <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
            {sidebarPatients.map((pat) => (
              <button
                key={pat.id}
                onClick={() => setSelectedPatientId(pat.id)}
                className={`w-full text-left p-3 rounded-xl smooth-transition border flex items-center justify-between ${
                  selectedPatientId === pat.id
                    ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                    : "bg-white border-slate-100/50 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div>
                  <div className="font-bold text-xs leading-snug">{pat.name}</div>
                  <div className={`text-[10px] ${selectedPatientId === pat.id ? "text-teal-100" : "text-slate-400"}`}>
                    ID: {pat.id} • {pat.gender}
                  </div>
                </div>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${
                    selectedPatientId === pat.id
                      ? "bg-teal-700 border-teal-500 text-teal-50"
                      : "bg-red-50 border-red-100 text-red-700"
                  }`}
                >
                  {pat.bloodGroup}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Medical Records Panel */}
      <div className="lg:col-span-3 space-y-8">
        {activePatient ? (
          <>
            {/* Header Detail Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{activePatient.name}</h2>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-100">
                    Active File
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Patient Reference: {activePatient.id} • {activePatient.age} yrs old • {activePatient.gender} • Blood Group {activePatient.bloodGroup}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                <div>
                  <span className="block text-slate-400 font-medium">Contact:</span>
                  <span className="font-semibold text-slate-700">{activePatient.phone}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              {/* History Timeline */}
              <div className="xl:col-span-3 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Consultation & Health History</h3>
                  {activeRecords.length > 0 ? (
                    <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-6">
                      {activeRecords.slice().reverse().map((rec) => (
                        <div key={rec.id} className="relative group">
                          {/* Dot indicator */}
                          <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-teal-500 border-2 border-white group-hover:scale-110 smooth-transition" />
                          
                          <div className="bg-white rounded-xl p-4 border border-slate-100/80 card-shadow space-y-3">
                            {/* Record Header */}
                            <div className="flex justify-between items-center flex-wrap gap-2">
                              <span className="font-bold text-slate-800 text-sm">{rec.diagnosis}</span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {rec.date}
                              </span>
                            </div>
                            
                            <p className="text-xs text-slate-400 font-semibold">Consulting: {rec.doctorName}</p>

                            {/* Vitals Summary */}
                            <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg text-center">
                              <div>
                                <span className="block text-[9px] text-slate-400 font-medium">BP</span>
                                <span className="text-xs font-bold text-slate-700">{rec.vitals.bp}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-slate-400 font-medium">Pulse (bpm)</span>
                                <span className="text-xs font-bold text-slate-700">{rec.vitals.hr}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-slate-400 font-medium">Temp (°F)</span>
                                <span className="text-xs font-bold text-slate-700">{rec.vitals.temp}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-slate-400 font-medium">Weight (kg)</span>
                                <span className="text-xs font-bold text-slate-700">{rec.vitals.wt}</span>
                              </div>
                            </div>

                            {/* Notes */}
                            <div className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg leading-relaxed">
                              <span className="font-bold text-slate-700">Clinical Notes: </span>
                              {rec.notes}
                            </div>

                            {/* Prescription */}
                            {rec.prescription && rec.prescription.length > 0 && (
                              <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                  <Pill className="w-3 h-3 text-teal-600" />
                                  Prescribed Medications
                                </span>
                                <div className="space-y-1">
                                  {rec.prescription.map((med, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs bg-slate-50/40 px-2.5 py-1.5 rounded-md border border-slate-100/50">
                                      <span className="font-bold text-slate-700">{med.name}</span>
                                      <span className="text-slate-500 font-medium text-[11px]">
                                        {med.dosage} • {med.frequency} ({med.duration})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-8 border border-slate-100 text-center text-slate-400 text-xs shadow-xs">
                      No clinical notes or consultations recorded for this patient.
                    </div>
                  )}
                </div>
              </div>

              {/* Append Clinical Report Form */}
              <div className="xl:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sticky top-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clipboard className="w-5 h-5 text-teal-600" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">Add Clinical Entry</h4>
                      <p className="text-[10px] text-slate-400">Append new report to patient history</p>
                    </div>
                  </div>

                  {successMsg && (
                    <div className="mb-3 p-2.5 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-100 animate-pulse">
                      {successMsg}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                        Consulting Physician Name
                      </label>
                      <input
                        type="text"
                        name="doctorName"
                        value={formData.doctorName}
                        onChange={handleInputChange}
                        placeholder="e.g., Dr. Elena Rostova"
                        className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition ${
                          errors.doctorName ? "border-red-500 bg-red-50/10" : "border-slate-200"
                        }`}
                      />
                      {errors.doctorName && <p className="text-[10px] text-red-500 mt-0.5">{errors.doctorName}</p>}
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                        Diagnosis / Medical Evaluation
                      </label>
                      <input
                        type="text"
                        name="diagnosis"
                        value={formData.diagnosis}
                        onChange={handleInputChange}
                        placeholder="e.g., Seasonal Flu, Sore throat"
                        className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition ${
                          errors.diagnosis ? "border-red-500 bg-red-50/10" : "border-slate-200"
                        }`}
                      />
                      {errors.diagnosis && <p className="text-[10px] text-red-500 mt-0.5">{errors.diagnosis}</p>}
                    </div>

                    {/* Vitals Grid */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                      <span className="block font-bold text-slate-500 text-[10px] uppercase tracking-wider">Patient Vitals</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-slate-400 font-medium">BP (sys/dia)</label>
                          <input
                            type="text"
                            name="bp"
                            value={formData.bp}
                            onChange={handleInputChange}
                            placeholder="120/80"
                            className={`w-full px-2 py-1 text-xs border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
                              errors.bp ? "border-red-500" : "border-slate-200"
                            }`}
                          />
                          {errors.bp && <p className="text-[9px] text-red-500">{errors.bp}</p>}
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-medium">Pulse (bpm)</label>
                          <input
                            type="number"
                            name="hr"
                            value={formData.hr}
                            onChange={handleInputChange}
                            placeholder="72"
                            className={`w-full px-2 py-1 text-xs border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
                              errors.hr ? "border-red-500" : "border-slate-200"
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-medium">Temp (°F)</label>
                          <input
                            type="number"
                            step="0.1"
                            name="temp"
                            value={formData.temp}
                            onChange={handleInputChange}
                            placeholder="98.6"
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-400 font-medium">Weight (kg)</label>
                          <input
                            type="number"
                            name="wt"
                            value={formData.wt}
                            onChange={handleInputChange}
                            placeholder="70"
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Prescription Section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-500 uppercase tracking-wider">Prescriptions</span>
                        <button
                          type="button"
                          onClick={addPrescriptionRow}
                          className="text-teal-600 hover:text-teal-700 flex items-center gap-0.5 font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Row
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                        {prescriptions.map((med, index) => (
                          <div key={index} className="flex gap-1.5 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <div className="flex-1 space-y-1">
                              <input
                                type="text"
                                placeholder="Medicine Name"
                                value={med.name}
                                onChange={(e) => handlePrescriptionChange(index, "name", e.target.value)}
                                className="w-full px-2 py-0.5 border border-slate-200 rounded-md bg-white text-xs"
                              />
                              <div className="grid grid-cols-3 gap-1">
                                <input
                                  type="text"
                                  placeholder="Dosage (e.g. 500mg)"
                                  value={med.dosage}
                                  onChange={(e) => handlePrescriptionChange(index, "dosage", e.target.value)}
                                  className="px-1 py-0.5 border border-slate-200 rounded-md bg-white text-[10px]"
                                />
                                <input
                                  type="text"
                                  placeholder="Freq (e.g. 1-0-1)"
                                  value={med.frequency}
                                  onChange={(e) => handlePrescriptionChange(index, "frequency", e.target.value)}
                                  className="px-1 py-0.5 border border-slate-200 rounded-md bg-white text-[10px]"
                                />
                                <input
                                  type="text"
                                  placeholder="Dur (e.g. 5 days)"
                                  value={med.duration}
                                  onChange={(e) => handlePrescriptionChange(index, "duration", e.target.value)}
                                  className="px-1 py-0.5 border border-slate-200 rounded-md bg-white text-[10px]"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removePrescriptionRow(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg smooth-transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                        Clinical Assessment Notes
                      </label>
                      <textarea
                        name="notes"
                        rows="3"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Detail patient concerns, follow-up timelines, physical activity recommendations..."
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-3 rounded-lg font-bold shadow-sm hover:shadow smooth-transition mt-2 flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Append Record
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center text-slate-400 text-sm shadow-sm">
            Select a patient from the sidebar directory list to review and log clinical history details.
          </div>
        )}
      </div>
    </div>
  );
}
