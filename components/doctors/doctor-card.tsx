'use client';

import { useState } from 'react';
import { Edit, Trash2, MapPin, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DoctorWithHospitals } from '@/lib/types/doctor';
import { DoctorFormDialog } from './doctor-form-dialog';
import { DeleteDoctorDialog } from './delete-doctor-dialog';
import { getDoctorFullName } from '@/lib/supabase/doctors';
import Link from 'next/link';

interface DoctorCardProps {
  doctor: DoctorWithHospitals;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <>
      <Card className="card-medical group hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={doctor.image_url} alt={getDoctorFullName(doctor)} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(getDoctorFullName(doctor))}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{getDoctorFullName(doctor)}</h3>
                <Badge variant="secondary" className="text-xs">
                  {doctor.specialization}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link href={`/admin/doctors/${doctor.id}/edit`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-primary" />
              <span className="truncate">
                {doctor.primary_hospital?.name || 'No primary hospital'}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-primary" />
              <span>{doctor.years_of_experience} years experience</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-2 text-primary" />
              <span>{formatCurrency(doctor.consultation_fee)} consultation</span>
            </div>
          </div>

          {doctor.bio && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {doctor.bio}
            </p>
          )}

          <div className="pt-2">
            <div className="text-xs text-gray-500 mb-2">
              License: {doctor.license_number}
            </div>
            <div className="flex flex-wrap gap-1">
              {doctor.doctor_hospitals.map((dh) => (
                <Badge
                  key={dh.id}
                  variant={dh.is_primary ? "default" : "outline"}
                  className="text-xs"
                >
                  {dh.hospital?.name}
                  {dh.is_primary && " (Primary)"}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteDoctorDialog
        doctor={doctor}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}