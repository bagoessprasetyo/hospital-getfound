'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from '@/components/ui/image-upload';
import { useToast } from '@/hooks/use-toast';
import { DoctorWithHospitals } from '@/lib/types/doctor';
import { getHospitals } from '@/lib/supabase/hospitals';
import { toast } from 'sonner';

const doctorSchema = z.object({
  specialization: z.string().min(1, 'Specialization is required'),
  license_number: z.string().min(1, 'License number is required'),
  years_of_experience: z.coerce.number().min(0, 'Years of experience must be 0 or greater'),
  bio: z.string().optional(),
  consultation_fee: z.coerce.number().min(0, 'Consultation fee must be 0 or greater'),
  image_url: z.string().optional().nullable(),
  hospital_ids: z.array(z.string()).min(1, 'At least one hospital must be selected'),
  primary_hospital_id: z.string().min(1, 'Primary hospital is required'),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

interface DoctorFormDialogProps {
  doctor?: DoctorWithHospitals;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const specializations = [
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'General Surgery',
  'Internal Medicine',
  'Neurology',
  'Obstetrics and Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Otolaryngology',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Urology',
];

export function DoctorFormDialog({ doctor, children, open, onOpenChange }: DoctorFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Array<{ id: string; name: string }>>([]);
  const router = useRouter();
  const { toast: shadcnToast } = useToast();

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema) as any,
    defaultValues: {
      specialization: doctor?.specialization || '',
      license_number: doctor?.license_number || '',
      years_of_experience: doctor?.years_of_experience || 0,
      bio: doctor?.bio || '',
      consultation_fee: doctor?.consultation_fee || 0,
      image_url: doctor?.image_url || null,
      hospital_ids: doctor?.doctor_hospitals.map(dh => dh.hospital_id) || [],
      primary_hospital_id: doctor?.doctor_hospitals.find(dh => dh.is_primary)?.hospital_id || '',
    },
  });

  const watchedHospitalIds = form.watch('hospital_ids');

  useEffect(() => {
    async function fetchHospitals() {
      try {
        const hospitalData = await getHospitals();
        setHospitals(hospitalData);
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
        shadcnToast({
          title: 'Error',
          description: 'Failed to load hospitals',
          variant: 'destructive',
        });
      }
    }
    fetchHospitals();
  }, [shadcnToast]);

  // Reset primary hospital if it's not in selected hospitals
  useEffect(() => {
    const primaryHospitalId = form.getValues('primary_hospital_id');
    if (primaryHospitalId && !watchedHospitalIds.includes(primaryHospitalId)) {
      form.setValue('primary_hospital_id', '');
    }
  }, [watchedHospitalIds, form]);

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
    
    if (!newOpen) {
      form.reset();
    }
  };

  const onSubmit = async (values: DoctorFormValues) => {
    setIsLoading(true);
    try {
      const url = doctor ? `/api/doctors/${doctor.id}` : '/api/doctors';
      const method = doctor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save doctor');
      }

      toast.success(doctor ? 'Doctor updated successfully!' : 'Doctor created successfully!', {
        description: doctor 
          ? `Dr. ${values.specialization} has been updated.`
          : `Dr. ${values.specialization} has been added to the system.`
      });

      handleOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error saving doctor:', error);
      toast.error(doctor ? 'Failed to update doctor' : 'Failed to create doctor', {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dialogOpen = open !== undefined ? open : isOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{doctor ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
          <DialogDescription>
            {doctor ? 'Update doctor information and hospital assignments.' : 'Add a new doctor to the system.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specializations.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="MD123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="years_of_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="consultation_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultation Fee ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="150.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      bucket="doctor-images"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the doctor's background and expertise..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hospital_ids"
                render={() => (
                  <FormItem>
                    <FormLabel>Hospital Assignments</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {hospitals.map((hospital) => (
                        <FormField
                          key={hospital.id}
                          control={form.control}
                          name="hospital_ids"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={hospital.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(hospital.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, hospital.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== hospital.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {hospital.name}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primary_hospital_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Hospital</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary hospital" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hospitals
                          .filter((hospital) => watchedHospitalIds.includes(hospital.id))
                          .map((hospital) => (
                            <SelectItem key={hospital.id} value={hospital.id}>
                              {hospital.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="btn-medical-primary">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {doctor ? 'Update Doctor' : 'Create Doctor'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}