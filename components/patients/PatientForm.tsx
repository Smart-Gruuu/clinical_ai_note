'use client';

import { useState, useEffect } from 'react';
import { Modal, FormGroup, Button } from '../ui';
import type { Patient } from '@/lib/mockData';

export type PatientFormData = {
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  status: 'active' | 'inactive';
};

const emptyForm: PatientFormData = {
  name: '',
  dob: '',
  gender: 'male',
  phone: '',
  email: '',
  status: 'active',
};

interface PatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => void;
  patient?: Patient | null;
}

export default function PatientForm({ isOpen, onClose, onSubmit, patient }: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>(emptyForm);

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name,
        dob: patient.dob,
        gender: patient.gender,
        phone: patient.phone || '',
        email: patient.email || '',
        status: patient.status,
      });
    } else {
      setFormData(emptyForm);
    }
  }, [patient, isOpen]);

  function handleChange(field: keyof PatientFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.dob) return;
    onSubmit(formData);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={patient ? 'Edit Patient' : 'Add New Patient'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {patient ? 'Save Changes' : 'Add Patient'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <FormGroup label="Full Name *" htmlFor="name">
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="form-control"
            required
          />
        </FormGroup>

        <div className="form-row">
          <FormGroup label="Date of Birth *" htmlFor="dob">
            <input
              id="dob"
              type="date"
              value={formData.dob}
              onChange={(e) => handleChange('dob', e.target.value)}
              className="form-control"
              required
            />
          </FormGroup>
          <FormGroup label="Gender" htmlFor="gender">
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value as 'male' | 'female' | 'other')}
              className="form-control"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </FormGroup>
        </div>

        <FormGroup label="Phone" htmlFor="phone">
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="form-control"
            placeholder="(555) 123-4567"
          />
        </FormGroup>

        <FormGroup label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="form-control"
            placeholder="patient@email.com"
          />
        </FormGroup>

        <FormGroup label="Status" htmlFor="status" style={{ marginBottom: 0 }}>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as 'active' | 'inactive')}
            className="form-control"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FormGroup>
      </form>
    </Modal>
  );
}
