'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: number
  title: string
  description: string
}

interface BookingProgressIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function BookingProgressIndicator({ 
  steps, 
  currentStep, 
  className 
}: BookingProgressIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isUpcoming = step.id > currentStep

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200',
                    {
                      'bg-blue-600 border-blue-600 text-white': isCompleted,
                      'bg-blue-100 border-blue-600 text-blue-600': isCurrent,
                      'bg-white border-gray-300 text-gray-400': isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                
                {/* Step Labels */}
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      'text-sm font-medium transition-colors duration-200',
                      {
                        'text-blue-600': isCompleted || isCurrent,
                        'text-gray-400': isUpcoming,
                      }
                    )}
                  >
                    {step.title}
                  </div>
                  <div
                    className={cn(
                      'text-xs mt-1 transition-colors duration-200',
                      {
                        'text-gray-600': isCompleted || isCurrent,
                        'text-gray-400': isUpcoming,
                      }
                    )}
                  >
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 mt-[-2rem]">
                  <div
                    className={cn(
                      'h-0.5 transition-colors duration-200',
                      {
                        'bg-blue-600': step.id < currentStep,
                        'bg-gray-300': step.id >= currentStep,
                      }
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}