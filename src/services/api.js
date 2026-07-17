const API_URL = "http://localhost:5000/api";

// Helper to construct headers with the current JWT token
function getHeaders() {
  const token = localStorage.getItem("hms_token");
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// Global fetch wrapper with error handling
async function request(endpoint, options = {}) {
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    login: (username, password) => 
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      }),
    verify: () => request("/auth/verify", { method: "GET" })
  },

  // Patients
  patients: {
    getAll: () => request("/patients", { method: "GET" }),
    create: (patientData) => 
      request("/patients", {
        method: "POST",
        body: JSON.stringify(patientData)
      })
  },

  // Doctors
  doctors: {
    getAll: () => request("/doctors", { method: "GET" }),
    create: (doctorData) => 
      request("/doctors", {
        method: "POST",
        body: JSON.stringify(doctorData)
      }),
    toggleAvailability: (id, currentStatus) => {
      const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
      return request(`/doctors/${id}/availability`, {
        method: "PATCH",
        body: JSON.stringify({ availability: nextStatus })
      });
    }
  },

  // Appointments
  appointments: {
    getAll: () => request("/appointments", { method: "GET" }),
    create: (aptData) => 
      request("/appointments", {
        method: "POST",
        body: JSON.stringify(aptData)
      }),
    updateStatus: (id, status) => 
      request(`/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      })
  },

  // Invoices / Billing
  invoices: {
    getAll: () => request("/invoices", { method: "GET" }),
    create: (invoiceData) => 
      request("/invoices", {
        method: "POST",
        body: JSON.stringify(invoiceData)
      })
  },

  // Medical Records
  records: {
    getAll: () => request("/records", { method: "GET" }),
    create: (patientId, recordData) => 
      request(`/records/${patientId}`, {
        method: "POST",
        body: JSON.stringify(recordData)
      })
  }
};
