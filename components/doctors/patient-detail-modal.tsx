'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin,
  Clock,
  Heart,
  AlertTriangle,
  FileText,
  Activity,
  X
} from 'lucide-react'
import { DoctorPatient, getPatientDetailForDoctor } from '@/lib/supabase/doctors'
import { format } from 'date-fns'

interface PatientDetailModalProps {
  patient: DoctorPatient
  doctorId: string
  isOpen: boolean
  onClose: () => void
}

function getStatusColor(status: string) {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getPatientInitials(patient: DoctorPatient): string {
  const fullName = patient.user_profiles?.full_name || ''
  if (!fullName) return 'P'
  
  return fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null
  
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export function PatientDetailModal({ 
  patient: initialPatient, 
  doctorId, 
  isOpen, 
  onClose 
}: PatientDetailModalProps) {
  const [patient, setPatient] = useState(initialPatient)
  const [appointmentHistory, setAppointmentHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load detailed patient data when modal opens
  useEffect(() => {
    if (isOpen && patient.id) {
      setIsLoading(true)
      getPatientDetailForDoctor(patient.id, doctorId)
        .then((detailedPatient) => {
          if (detailedPatient) {
            setPatient(detailedPatient)
            // @ts-ignore - appointment_history is added in the detailed fetch
            setAppointmentHistory(detailedPatient.appointment_history || [])
          }
        })
        .catch((error) => {
          console.error('Error loading patient details:', error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [isOpen, patient.id, doctorId])

  const fullName = patient.user_profiles?.full_name || 'Unknown Patient'
  const email = patient.user_profiles?.email || ''
  const phone = patient.user_profiles?.phone
  const age = calculateAge(patient.date_of_birth)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary-100 text-primary-700">
                  {getPatientInitials(patient)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{fullName}</DialogTitle>
                <DialogDescription className="text-sm">
                  Patient ID: {patient.id.slice(0, 8)}...
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-primary-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span>{email}</span>
                  </div>
                  {phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{phone}</span>
                    </div>
                  )}
                  {age !== null && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{age} years old</span>
                    </div>
                  )}
                  {patient.gender && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="capitalize">{patient.gender}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary-600" />
                  Visit Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Visits:</span>
                    <span className="font-medium">{patient.appointment_count}</span>
                  </div>
                  {patient.last_visit_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Visit:</span>
                      <span className="font-medium">
                        {format(new Date(patient.last_visit_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {patient.latest_appointment && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Next Visit:</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(patient.latest_appointment.status)}`}
                      >
                        {patient.latest_appointment.status}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary-600" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.emergency_contact ? (
                  <div className="text-sm">
                    <p>{patient.emergency_contact}</p>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No emergency contact provided
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Medical History */}
          {patient.medical_history && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary-600" />
                  Medical History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {patient.medical_history}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appointment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                Appointment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">Loading appointment history...</div>
                </div>
              ) : appointmentHistory.length > 0 ? (
                <div className="space-y-4">
                  {appointmentHistory.slice(0, 5).map((appointment, index) => (
                    <div key={appointment.id || index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {format(new Date(appointment.appointment_date), 'MMM d, yyyy')}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {appointment.appointment_time}
                            </span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(appointment.status)}`}
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                        {appointment.hospital && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{appointment.hospital.name}</span>
                          </div>
                        )}
                        {appointment.notes && (
                          <div className="text-sm text-muted-foreground">
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {appointmentHistory.length > 5 && (
                    <div className="text-center text-sm text-muted-foreground">
                      And {appointmentHistory.length - 5} more appointments...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">No appointment history found</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}