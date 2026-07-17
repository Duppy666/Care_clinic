import React, { useState } from "react";
import { PlusCircle, Stethoscope, User, Mail, Phone, Calendar, ToggleLeft, ToggleRight, Sparkles } from "lucide-react";

export default function DoctorManagement({ doctors, onAddDoctor, onToggleAvailability }) {
  const [formData, setFormData] = useState({
    name: "",
    specialization: "General Medicine",
    email: "",
    phone: "",
    experience: "",
    room: ""
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const specializations = [
    "General Medicine",
    "Pediatrics",
    "Cardiology",
    "Orthopedics",
    "Neurology",
    "Dermatology"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Doctor name is required";
    if (!formData.experience.trim()) newErrors.experience = "Experience details are required";
    if (!formData.room.trim()) newErrors.room = "Room / Cabin is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onAddDoctor({
      name: formData.name.startsWith("Dr.") ? formData.name.trim() : `Dr. ${formData.name.trim()}`,
      specialization: formData.specialization,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      experience: formData.experience.trim() + " years",
      room: formData.room.trim(),
      availability: "Active"
    });

    setFormData({
      name: "",
      specialization: "General Medicine",
      email: "",
      phone: "",
      experience: "",
      room: ""
    });

    setSuccessMsg("Doctor profile added successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Color mapping helper for specializations
  const getSpecialtyColor = (spec) => {
    switch (spec) {
      case "Cardiology":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "Pediatrics":
        return "bg-violet-50 text-violet-700 border-violet-100";
      case "General Medicine":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Orthopedics":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Neurology":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Doctor List Directory */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Available Doctors</h2>
          <p className="text-sm text-slate-500">Toggle active status or view availability details</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className={`bg-white rounded-2xl p-5 border smooth-transition card-shadow hover:shadow-md flex flex-col justify-between ${
                doc.availability === "Active" ? "border-slate-100" : "border-slate-200/60 bg-slate-50/40"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        doc.availability === "Active"
                          ? "bg-indigo-50 border-indigo-100 text-indigo-600"
                          : "bg-slate-100 border-slate-200 text-slate-400"
                      }`}
                    >
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm leading-tight">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">{doc.experience} Experience</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider border ${
                      doc.availability === "Active"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-slate-100 border-slate-200 text-slate-400"
                    }`}
                  >
                    {doc.availability === "Active" ? "On Duty" : "Off Duty"}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Specialty:</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold text-[11px] border ${getSpecialtyColor(
                        doc.specialization
                      )}`}
                    >
                      {doc.specialization}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Email:</span>
                    <span className="font-medium">{doc.email}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Phone:</span>
                    <span className="font-medium">{doc.phone}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Location:</span>
                    <span className="font-semibold text-slate-700">{doc.room}</span>
                  </div>
                </div>
              </div>

              {/* Action Toggle */}
              <div className="border-t border-slate-50 pt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Duty Status</span>
                <button
                  onClick={() => onToggleAvailability(doc.id)}
                  className={`flex items-center gap-1 text-xs font-bold transition-all ${
                    doc.availability === "Active"
                      ? "text-emerald-600 hover:text-emerald-700"
                      : "text-slate-400 hover:text-slate-500"
                  }`}
                >
                  {doc.availability === "Active" ? (
                    <span className="flex items-center gap-1">
                      Active
                      <ToggleRight className="w-6 h-6 text-emerald-500" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      Inactive
                      <ToggleLeft className="w-6 h-6 text-slate-300" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Doctor Form Card */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Add Doctor</h2>
              <p className="text-xs text-slate-500">Register new medical specialist</p>
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
                Doctor Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Sarah Jenkins"
                  className={`w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 smooth-transition ${
                    errors.name ? "border-red-500 bg-red-50/10" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Specialization
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 smooth-transition bg-white"
                >
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g., sarah.j@hospital.com"
                  className={`w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 smooth-transition ${
                    errors.email ? "border-red-500 bg-red-50/10" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Contact Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g., +1 (555) 019-2834"
                  className={`w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 smooth-transition ${
                    errors.phone ? "border-red-500 bg-red-50/10" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Years of Exp.
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="e.g., 10"
                  className={`w-full px-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 smooth-transition ${
                    errors.experience ? "border-red-500 bg-red-50/10" : "border-slate-200"
                  }`}
                />
                {errors.experience && <p className="text-xs text-red-500 mt-1">{errors.experience}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Cabin / Room
                </label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={handleInputChange}
                  placeholder="e.g., Cabin 302"
                  className={`w-full px-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 smooth-transition ${
                    errors.room ? "border-red-500 bg-red-50/10" : "border-slate-200"
                  }`}
                />
                {errors.room && <p className="text-xs text-red-500 mt-1">{errors.room}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl font-medium text-sm shadow-sm hover:shadow smooth-transition mt-4 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Add Doctor Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
