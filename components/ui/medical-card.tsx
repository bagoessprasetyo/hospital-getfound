import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReactNode } from 'react'

interface MedicalCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  icon?: ReactNode
}

export function MedicalCard({ 
  title, 
  description, 
  children, 
  className, 
  status,
  icon 
}: MedicalCardProps) {
  return (
    <Card className={cn('card-medical', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 bg-primary-100 rounded-lg">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="text-sm text-gray-600 mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {status && (
            <Badge className={`status-badge status-badge-${status}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}