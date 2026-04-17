/**
 * Mock patient and visit history for MVP. No backend—all data lives in frontend.
 * Now with state management for add/edit/delete operations.
 */

export type Patient = {
  id: string;
  name: string;
  dob: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  lastVisit?: string;
  createdAt: string;
};

export type VisitRecord = {
  id: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  status: 'completed' | 'draft';
};

export type ConsultationRecord = {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  status: 'completed' | 'draft' | 'in-progress';
  summary?: string;
};

// In-memory state (will reset on page refresh)
let patients: Record<string, Patient> = {
  P001: {
    id: 'P001',
    name: 'Jane Doe',
    dob: '1972-05-15',
    age: 52,
    gender: 'female',
    phone: '(555) 123-4567',
    email: 'jane.doe@email.com',
    status: 'active',
    lastVisit: '2024-03-01',
    createdAt: '2023-01-15',
  },
  P002: {
    id: 'P002',
    name: 'John Smith',
    dob: '1965-11-20',
    age: 59,
    gender: 'male',
    phone: '(555) 987-6543',
    email: 'john.smith@email.com',
    status: 'active',
    lastVisit: '2024-02-01',
    createdAt: '2023-03-20',
  },
  P003: {
    id: 'P003',
    name: 'Maria Garcia',
    dob: '1988-08-12',
    age: 36,
    gender: 'female',
    phone: '(555) 456-7890',
    status: 'active',
    lastVisit: '2024-02-28',
    createdAt: '2023-06-10',
  },
  P004: {
    id: 'P004',
    name: 'Robert Johnson',
    dob: '1950-03-25',
    age: 74,
    gender: 'male',
    phone: '(555) 321-0987',
    email: 'r.johnson@email.com',
    status: 'inactive',
    lastVisit: '2023-12-15',
    createdAt: '2022-11-05',
  },
};

let visitHistory: Record<string, VisitRecord[]> = {
  P001: [
    {
      id: 'V001',
      date: '2024-01-15',
      subjective: 'Cutting down on smoking, still about 5 cigarettes per day.',
      objective: 'BP 118/78, HR 72.',
      assessment: 'Hypertension, improved. Smoking cessation in progress.',
      plan: 'Continue lisinopril. Follow up in 4 weeks.',
      status: 'completed',
    },
    {
      id: 'V002',
      date: '2024-02-10',
      subjective: 'Less smoking, down to 2–3 per day. Some knee pain in the morning.',
      objective: 'BP 122/80, HR 74.',
      assessment: 'Hypertension stable. Knee pain, likely osteoarthritis.',
      plan: 'Ibuprofen PRN. Consider PT if worse.',
      status: 'completed',
    },
    {
      id: 'V003',
      date: '2024-03-01',
      subjective: 'Knee pain worse in mornings. Quit smoking today.',
      objective: 'BP 124/82.',
      assessment: 'Knee pain. Smoking cessation—quit date today.',
      plan: 'Support cessation. X-ray knee if no improvement.',
      status: 'completed',
    },
  ],
  P002: [
    {
      id: 'V004',
      date: '2024-02-01',
      subjective: 'Recurrent headaches, stress at work.',
      objective: 'BP 128/84.',
      assessment: 'Headache, tension-type. Hypertension.',
      plan: 'Lifestyle, consider migraine diary. Recheck BP.',
      status: 'completed',
    },
  ],
  P003: [
    {
      id: 'V005',
      date: '2024-02-28',
      subjective: 'Annual checkup, no complaints.',
      objective: 'BP 110/70, HR 68, Weight 145 lb.',
      assessment: 'Healthy, no concerns.',
      plan: 'Continue current lifestyle. Annual follow-up.',
      status: 'completed',
    },
  ],
};

let recentConsultations: ConsultationRecord[] = [
  {
    id: 'C001',
    patientId: 'P001',
    patientName: 'Jane Doe',
    date: '2024-03-01',
    status: 'completed',
    summary: 'Knee pain follow-up, smoking cessation support',
  },
  {
    id: 'C002',
    patientId: 'P003',
    patientName: 'Maria Garcia',
    date: '2024-02-28',
    status: 'completed',
    summary: 'Annual wellness checkup',
  },
  {
    id: 'C003',
    patientId: 'P002',
    patientName: 'John Smith',
    date: '2024-02-01',
    status: 'completed',
    summary: 'Tension headache evaluation',
  },
];

// Read operations
export function getPatientById(id: string): Patient | null {
  return patients[id] ?? null;
}

export function getVisitHistory(patientId: string): VisitRecord[] {
  return visitHistory[patientId] ?? [];
}

export function listPatients(): Patient[] {
  return Object.values(patients).sort((a, b) => a.name.localeCompare(b.name));
}

export function getActivePatients(): Patient[] {
  return listPatients().filter((p) => p.status === 'active');
}

export function getRecentConsultations(): ConsultationRecord[] {
  return recentConsultations;
}

// Write operations
export function addPatient(data: Omit<Patient, 'id' | 'createdAt'>): Patient {
  const id = `P${String(Object.keys(patients).length + 1).padStart(3, '0')}`;
  const patient: Patient = {
    ...data,
    id,
    createdAt: new Date().toISOString().split('T')[0],
  };
  patients[id] = patient;
  return patient;
}

export function updatePatient(id: string, data: Partial<Patient>): Patient | null {
  if (!patients[id]) return null;
  patients[id] = { ...patients[id], ...data };
  return patients[id];
}

export function deletePatient(id: string): boolean {
  if (!patients[id]) return false;
  delete patients[id];
  delete visitHistory[id];
  return true;
}

export function addVisit(patientId: string, visit: Omit<VisitRecord, 'id'>): VisitRecord | null {
  if (!patients[patientId]) return null;
  
  const id = `V${String(Object.values(visitHistory).flat().length + 1).padStart(3, '0')}`;
  const newVisit: VisitRecord = { ...visit, id };
  
  if (!visitHistory[patientId]) {
    visitHistory[patientId] = [];
  }
  visitHistory[patientId].unshift(newVisit);
  
  // Update patient's last visit
  patients[patientId].lastVisit = visit.date;
  
  return newVisit;
}

export function addConsultation(consultation: Omit<ConsultationRecord, 'id'>): ConsultationRecord {
  const id = `C${String(recentConsultations.length + 1).padStart(3, '0')}`;
  const newConsultation: ConsultationRecord = { ...consultation, id };
  recentConsultations.unshift(newConsultation);
  return newConsultation;
}

// Stats
export function getDashboardStats() {
  const allPatients = listPatients();
  const activeCount = allPatients.filter((p) => p.status === 'active').length;
  const consultationsThisMonth = recentConsultations.filter((c) => {
    const date = new Date(c.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  
  return {
    totalPatients: allPatients.length,
    activePatients: activeCount,
    consultationsThisMonth,
    pendingNotes: recentConsultations.filter((c) => c.status === 'draft').length,
    insightsGenerated: 12, // Mock number
  };
}

// Helper to calculate age from DOB
export function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Generate next patient ID
export function getNextPatientId(): string {
  return `P${String(Object.keys(patients).length + 1).padStart(3, '0')}`;
}
