import React, { useState } from "react";
import { PlusCircle, Search, User, Phone, Droplet, Hash, ChevronRight } from "lucide-react";

export default function PatientRegistration({ patients, onAddPatient, onViewMedicalRecords }) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    bloodGroup: "O+"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBloodGroup, setFilterBloodGroup] = useState("All");
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const bloodGroups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Patient name is required";
    if (!formData.age) {
      newErrors.age = "Age is required";
    } else if (Number(formData.age) <= 0 || Number(formData.age) > 120) {
      newErrors.age = "Please enter a valid age (1-120)";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Contact number is required";
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Invalid contact number format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onAddPatient({
      name: formData.name.trim(),
      age: parseInt(formData.age),
      gender: formData.gender,
      phone: formData.phone.trim(),
      bloodGroup: formData.bloodGroup
    });

    setFormData({
      name: "",
      age: "",
      gender: "Male",
      phone: "",
      bloodGroup: "O+"
    });
    
    setSuccessMsg("Patient registered successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBloodGroup =
      filterBloodGroup === "All" || patient.bloodGroup === filterBloodGroup;
    return matchesSearch && matchesBloodGroup;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Registration Form Card */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Register Patient</h2>
              <p className="text-xs text-slate-500">Add a new patient to the directory</p>
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
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe"
                  className={`w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition ${
                    errors.name ? "border-red-500 bg-red-50/10" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="e.g., 32"
                  className={`w-full px-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition ${
                    errors.age ? "border-red-500 bg-red-50/10" : "border-slate-200"
                  }`}
                />
                {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
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
                  placeholder="e.g., +1 (555) 012-3456"
                  className={`w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition ${
                    errors.phone ? "border-red-500 bg-red-50/10" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Blood Group
              </label>
              <div className="relative">
                <Droplet className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition bg-white"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 px-4 rounded-xl font-medium text-sm shadow-sm hover:shadow smooth-transition mt-4 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Register Patient
            </button>
          </form>
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Patient Directory</h2>
              <p className="text-xs text-slate-500">
                {filteredPatients.length} total records found
              </p>
            </div>
            
            {/* Search and Filters */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, phone, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition"
                />
              </div>

              <select
                value={filterBloodGroup}
                onChange={(e) => setFilterBloodGroup(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white smooth-transition text-slate-600 font-medium"
              >
                <option value="All">All Blood Groups</option>
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Patient Information</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-center">Blood Group</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((pat) => (
                    <tr key={pat.id} className="hover:bg-slate-50/50 smooth-transition group">
                      <td className="py-3.5 px-4 font-semibold text-slate-500 text-xs">
                        <span className="flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-slate-400" />
                          {pat.id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-semibold text-slate-700 group-hover:text-teal-600 smooth-transition">
                            {pat.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {pat.age} yrs • {pat.gender}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {pat.phone}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 rounded-full border border-red-100">
                          {pat.bloodGroup}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onViewMedicalRecords(pat.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800 smooth-transition bg-teal-50/60 hover:bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-100/50"
                        >
                          View Records
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                      No patients registered matching those criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
