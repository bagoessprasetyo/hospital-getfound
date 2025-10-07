'use client';

import { useState } from 'react';
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
import { Database } from '@/lib/supabase';
import { toast } from 'sonner';

type Hospital = Database['public']['Tables']['hospitals']['Row'];

interface DeleteHospitalDialogProps {
  hospital: Hospital;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHospitalDeleted?: (hospitalId: string) => void;
}

export function DeleteHospitalDialog({ 
  hospital, 
  open, 
  onOpenChange, 
  onHospitalDeleted 
}: DeleteHospitalDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/hospitals/${hospital.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete hospital');
      }

      toast.success('Hospital deleted successfully!', {
        description: `${hospital.name} has been removed from the system.`
      });

      onOpenChange(false);
      
      // Call the callback to refresh data in parent component
      if (onHospitalDeleted) {
        onHospitalDeleted(hospital.id);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred';
      toast.error('Failed to delete hospital', {
        description: errorMessage
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
            Delete Hospital
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete <strong>{hospital.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete the hospital's profile,
              all doctor assignments, availability schedules, appointments, and all related data.
            </p>
            <div className="mt-3 p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Hospital details:</p>
              <ul className="text-sm text-muted-foreground mt-1">
                <li>• Name: {hospital.name}</li>
                <li>• Address: {hospital.address}</li>
                {hospital.phone && <li>• Phone: {hospital.phone}</li>}
                {hospital.email && <li>• Email: {hospital.email}</li>}
              </ul>
            </div>
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
            Delete Hospital
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}