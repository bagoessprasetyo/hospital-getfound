import { cn } from '@/lib/utils'
import { Button, ButtonProps } from '@/components/ui/button'
import { forwardRef } from 'react'

interface MedicalButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  medical?: boolean
}

const MedicalButton = forwardRef<HTMLButtonElement, MedicalButtonProps>(
  ({ className, variant = 'primary', medical = true, ...props }, ref) => {
    return (
      <Button
        className={cn(
          medical && variant === 'primary' && 'btn-medical-primary',
          medical && variant === 'secondary' && 'btn-medical-secondary',
          className
        )}
        variant={medical ? 'default' : variant === 'primary' ? 'default' : variant}
        ref={ref}
        {...props}
      />
    )
  }
)
MedicalButton.displayName = 'MedicalButton'

export { MedicalButton }