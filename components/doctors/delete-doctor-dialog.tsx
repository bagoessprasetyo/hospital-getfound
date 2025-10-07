'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { DoctorWithHospitals } from '@/lib/types/doctor';
import { toast } from 'sonner';

interface DeleteDoctorDialogProps {
  doctor: DoctorWithHospitals;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDoctorDeleted?: (doctorId: string) => void;
}

export function DeleteDoctorDialog({ 
  doctor, 
  open, 
  onOpenChange, 
  onDoctorDeleted 
}: DeleteDoctorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast: shadcnToast } = useToast();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/doctors/${doctor.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete doctor');
      }

      toast.success('Doctor deleted successfully!', {
        description: `Dr. ${doctor.first_name} ${doctor.last_name} has been removed from the system.`
      });

      onOpenChange(false);
      
      // Call the callback to refresh data in parent component
      if (onDoctorDeleted) {
        onDoctorDeleted(doctor.id);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error('Failed to delete doctor', {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete Doctor
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete <strong>Dr. {doctor.first_name} {doctor.last_name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete the doctor's profile,
              hospital assignments, availability schedules, appointments, and all related data.
            </p>
            <div className="mt-3 p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Doctor details:</p>
              <ul className="text-sm text-muted-foreground mt-1">
                <li>• Name: Dr. {doctor.first_name} {doctor.last_name}</li>
                <li>• Specialization: {doctor.specialization}</li>
                <li>• License: {doctor.license_number}</li>
                <li>• Experience: {doctor.years_of_experience} years</li>
              </ul>
            </div>
            {doctor.doctor_hospitals.length > 0 && (
              <div className="mt-3 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Current hospital assignments:</p>
                <ul className="text-sm text-muted-foreground mt-1">
                  {doctor.doctor_hospitals.map((dh) => (
                    <li key={dh.id}>
                      • {dh.hospital?.name} {dh.is_primary && '(Primary)'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Doctor
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}