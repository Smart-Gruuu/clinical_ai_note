'use client';

import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/layout';
import { Card, CardHeader, CardTitle, Button, Modal, FormGroup } from '@/components/ui';
import { PatientTable, PatientForm, type PatientFormData } from '@/components/patients';
import {
  listPatients,
  addPatient,
  updatePatient,
  deletePatient,
  calculateAge,
  type Patient,
} from '@/lib/mockData';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load patients
  useEffect(() => {
    setPatients(listPatients());
  }, []);

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function openAddModal() {
    setEditingPatient(null);
    setShowModal(true);
  }

  function openEditModal(patient: Patient) {
    setEditingPatient(patient);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingPatient(null);
  }

  function handleSubmit(data: PatientFormData) {
    const age = calculateAge(data.dob);

    if (editingPatient) {
      updatePatient(editingPatient.id, { ...data, age });
    } else {
      addPatient({ ...data, age });
    }

    setPatients(listPatients());
    closeModal();
  }

  function handleDelete(id: string) {
    deletePatient(id);
    setPatients(listPatients());
    setDeleteConfirm(null);
  }

  return (
    <AppShell>
      <PageHeader
        title="Patients"
        subtitle="Manage your patient records"
        actions={
          <Button variant="primary" onClick={openAddModal}>
            <span>➕</span> Add Patient
          </Button>
        }
      />

      <div className="page-body">
        {/* Filters */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <div className="form-row">
            <FormGroup label="Search" htmlFor="search" style={{ marginBottom: 0, flex: 2 }}>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or ID..."
                className="form-control"
              />
            </FormGroup>
            <FormGroup label="Status" htmlFor="status-filter" style={{ marginBottom: 0, flex: 1 }}>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="form-control"
              >
                <option value="all">All Patients</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </FormGroup>
          </div>
        </Card>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredPatients.length} Patient{filteredPatients.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <PatientTable
            patients={filteredPatients}
            onEdit={openEditModal}
            onDelete={(id) => setDeleteConfirm(id)}
          />
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <PatientForm
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        patient={editingPatient}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Patient?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete Patient
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete this patient? This action cannot be undone and will
          remove all associated visit history.
        </p>
      </Modal>
    </AppShell>
  );
}
