'use client'

import { useState } from 'react'
import { PatientsDataTable } from './patients-data-table'
import { PatientDetailModal } from './patient-detail-modal'
import { DoctorPatient } from '@/lib/supabase/doctors'

interface DoctorPatientsClientProps {
  patients: DoctorPatient[]
  doctorId: string
}

export function DoctorPatientsClient({ patients: initialPatients, doctorId }: DoctorPatientsClientProps) {
  const [patients, setPatients] = useState(initialPatients)
  const [selectedPatient, setSelectedPatient] = useState<DoctorPatient | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const handleViewPatient = (patient: DoctorPatient) => {
    setSelectedPatient(patient)
    setIsDetailModalOpen(true)
  }

  const handleScheduleAppointment = (patient: DoctorPatient) => {
    // TODO: Implement appointment scheduling
    console.log('Schedule appointment for patient:', patient.id)
    // This could open a scheduling modal or navigate to scheduling page
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedPatient(null)
  }

  return (
    <>
      <PatientsDataTable
        patients={patients}
        onViewPatient={handleViewPatient}
        onScheduleAppointment={handleScheduleAppointment}
      />
      
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          doctorId={doctorId}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
        />
      )}
    </>
  )
}