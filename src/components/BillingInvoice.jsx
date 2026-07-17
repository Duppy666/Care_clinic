import React, { useState } from "react";
import { PlusCircle, FileText, User, Stethoscope, DollarSign, Printer, X, Receipt, ShieldAlert } from "lucide-react";

export default function BillingInvoice({ patients, doctors, invoices, onAddInvoice }) {
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    consultingFee: "",
    treatmentFee: "",
    medicineFee: ""
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

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
    
    const consult = Number(formData.consultingFee);
    const treat = Number(formData.treatmentFee || 0);
    const med = Number(formData.medicineFee || 0);

    if (!formData.consultingFee) {
      newErrors.consultingFee = "Consulting fee is required";
    } else if (isNaN(consult) || consult < 0) {
      newErrors.consultingFee = "Must be a positive number";
    }

    if (formData.treatmentFee && (isNaN(treat) || treat < 0)) {
      newErrors.treatmentFee = "Must be a positive number";
    }

    if (formData.medicineFee && (isNaN(med) || med < 0)) {
      newErrors.medicineFee = "Must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedPatient = patients.find((p) => p.id === formData.patientId);
    const selectedDoctor = doctors.find((d) => d.id === formData.doctorId);

    const consultingFee = parseFloat(formData.consultingFee);
    const treatmentFee = parseFloat(formData.treatmentFee || 0);
    const medicineFee = parseFloat(formData.medicineFee || 0);
    const subtotal = consultingFee + treatmentFee + medicineFee;
    
    const taxRate = 18; // 18% GST / Healthcare Tax
    const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
    const total = parseFloat((subtotal + taxAmount).toFixed(2));

    const newInvoice = {
      id: `inv-${Date.now().toString().slice(-4)}`,
      patientId: formData.patientId,
      patientName: selectedPatient ? selectedPatient.name : "Unknown",
      doctorId: formData.doctorId,
      doctorName: selectedDoctor ? selectedDoctor.name : "Unknown",
      date: new Date().toISOString().split("T")[0],
      consultingFee,
      treatmentFee,
      medicineFee,
      taxRate,
      taxAmount,
      total,
      status: "Paid" // Default to paid for this simplified presentation utility
    };

    onAddInvoice(newInvoice);

    setFormData({
      patientId: "",
      doctorId: "",
      consultingFee: "",
      treatmentFee: "",
      medicineFee: ""
    });

    setSuccessMsg("Invoice generated successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
    
    // Automatically trigger receipt preview
    setSelectedInvoice(newInvoice);
  };

  const handlePrint = () => {
    // Print triggers page print. We have CSS @media print overrides in index.css
    // that hide everything except the element with id="print-area-root".
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Billing Input Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">New Bill Invoice</h2>
              <p className="text-xs text-slate-500">Calculate consulting & treatment fees</p>
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
                  className={`w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition bg-white ${
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
                Attending Doctor
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition bg-white ${
                    errors.doctorId ? "border-red-500 bg-red-50/10" : ""
                  }`}
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} - {doc.specialization}
                    </option>
                  ))}
                </select>
              </div>
              {errors.doctorId && <p className="text-xs text-red-500 mt-1">{errors.doctorId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Consulting Fee ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  name="consultingFee"
                  value={formData.consultingFee}
                  onChange={handleInputChange}
                  placeholder="e.g., 50.00"
                  className={`w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition ${
                    errors.consultingFee ? "border-red-500 bg-red-50/10" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.consultingFee && <p className="text-xs text-red-500 mt-1">{errors.consultingFee}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Treatment / Lab Fee ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  name="treatmentFee"
                  value={formData.treatmentFee}
                  onChange={handleInputChange}
                  placeholder="e.g., 120.00 (Optional)"
                  className={`w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition ${
                    errors.treatmentFee ? "border-red-500 bg-red-50/10" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.treatmentFee && <p className="text-xs text-red-500 mt-1">{errors.treatmentFee}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Medication Charges ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  name="medicineFee"
                  value={formData.medicineFee}
                  onChange={handleInputChange}
                  placeholder="e.g., 35.00 (Optional)"
                  className={`w-full pl-10 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 smooth-transition ${
                    errors.medicineFee ? "border-red-500 bg-red-50/10" : "border-slate-200"
                  }`}
                />
              </div>
              {errors.medicineFee && <p className="text-xs text-red-500 mt-1">{errors.medicineFee}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 px-4 rounded-xl font-medium text-sm shadow-sm hover:shadow smooth-transition mt-4 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Generate & Print Invoice
            </button>
          </form>
        </div>
      </div>

      {/* Invoice Directory */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Billing History</h2>
            <p className="text-xs text-slate-500">Record logs of completed billing invoices</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Patient & Doctor</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {invoices.length > 0 ? (
                  invoices.slice().reverse().map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 smooth-transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-500 text-xs">
                        {inv.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-semibold text-slate-700">{inv.patientName}</div>
                          <div className="text-xs text-slate-400">Dr. {inv.doctorName.replace("Dr. ", "")}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {inv.date}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 text-xs">
                        ${Number(inv.total).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 rounded-md border border-emerald-100">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800 smooth-transition bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-100/50"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                      No invoices found. Generate a new bill to populate.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PRINTABLE RECEIPT MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Actions Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between print:hidden">
              <span className="font-bold text-sm text-slate-700 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-teal-600" />
                Invoice Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm smooth-transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Receipt
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 smooth-transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Area */}
            <div id="print-area-root" className="p-8 space-y-6">
              {/* Receipt Header */}
              <div className="flex justify-between items-start pb-6 border-b border-slate-100">
                <div>
                  <h1 className="text-xl font-extrabold text-teal-600 tracking-tight">CARE CLINIC HMS</h1>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Health Management Solutions</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    100 Medical Plaza, Suite 400<br />
                    San Francisco, CA 94107<br />
                    Ph: +1 (555) 010-0099
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">
                    Official Receipt
                  </span>
                  <p className="text-xs text-slate-400 mt-3">Invoice No:</p>
                  <p className="text-sm font-bold text-slate-800">{selectedInvoice.id}</p>
                  <p className="text-xs text-slate-400 mt-1">Date Issued:</p>
                  <p className="text-xs font-semibold text-slate-700">{selectedInvoice.date}</p>
                </div>
              </div>

              {/* Patient & Doctor details */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-slate-400 font-medium">Billed To (Patient):</p>
                  <p className="font-bold text-slate-800 mt-1">{selectedInvoice.patientName}</p>
                  <p className="text-slate-500 mt-0.5">Patient ID: {selectedInvoice.patientId}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Attending Specialist:</p>
                  <p className="font-bold text-slate-800 mt-1">{selectedInvoice.doctorName}</p>
                </div>
              </div>

              {/* Fee Breakdown Table */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Charge Breakdown</h3>
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                      <tr>
                        <td className="py-2.5 px-3">Professional Consultation Fee</td>
                        <td className="py-2.5 px-3 text-right">${Number(selectedInvoice.consultingFee).toFixed(2)}</td>
                      </tr>
                      {Number(selectedInvoice.treatmentFee) > 0 && (
                        <tr>
                          <td className="py-2.5 px-3">Diagnostic Lab / Treatment Procedures</td>
                          <td className="py-2.5 px-3 text-right">${Number(selectedInvoice.treatmentFee).toFixed(2)}</td>
                        </tr>
                      )}
                      {Number(selectedInvoice.medicineFee) > 0 && (
                        <tr>
                          <td className="py-2.5 px-3">Medications & Pharmacy Items</td>
                          <td className="py-2.5 px-3 text-right">${Number(selectedInvoice.medicineFee).toFixed(2)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total calculations */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <div className="w-52 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>
                      $
                      {(
                        Number(selectedInvoice.consultingFee) +
                        Number(selectedInvoice.treatmentFee) +
                        Number(selectedInvoice.medicineFee)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Healthcare Tax ({selectedInvoice.taxRate}%):</span>
                    <span>${Number(selectedInvoice.taxAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800 text-sm border-t border-slate-100 pt-2">
                    <span>Amount Due (Paid):</span>
                    <span className="text-teal-600">${Number(selectedInvoice.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footers and details */}
              <div className="pt-6 text-center border-t border-slate-100 text-[10px] text-slate-400 space-y-2">
                <p>Thank you for choosing Care Clinic. Get well soon!</p>
                <p className="font-semibold text-slate-500 text-[9px] uppercase tracking-wider">Powered by Care Clinic HMS • Presentation Copy</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
