'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Image from 'next/image'

interface ImageUploadProps {
  bucket: 'hospital-images' | 'doctor-images'
  value?: string | null
  onChange: (url: string | null) => void
  disabled?: boolean
  className?: string
  maxSizeMB?: number
  acceptedTypes?: string[]
}

export function ImageUpload({
  bucket,
  value,
  onChange,
  disabled = false,
  className = '',
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `File type not supported. Please upload: ${acceptedTypes.join(', ')}`
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `File size too large. Maximum size is ${maxSizeMB}MB`
    }

    return null
  }, [acceptedTypes, maxSizeMB])

  const generateFileName = useCallback((file: File): string => {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    return `${timestamp}-${randomString}.${extension}`
  }, [])

  const uploadFile = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      toast.error('Upload failed', { description: validationError })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const fileName = generateFileName(file)
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      onChange(publicUrl)
      toast.success('Image uploaded successfully!')
      
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error('Upload failed', { 
        description: error.message || 'Failed to upload image' 
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [bucket, onChange, supabase.storage, validateFile, generateFileName])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [uploadFile])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }, [uploadFile])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  const removeImage = useCallback(async () => {
    if (!value) return

    try {
      // Extract filename from URL
      const url = new URL(value)
      const pathParts = url.pathname.split('/')
      const fileName = pathParts[pathParts.length - 1]

      // Delete from storage
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName])

      if (error) {
        console.error('Delete error:', error)
        // Don't throw error, just log it as the file might already be deleted
      }

      onChange(null)
      toast.success('Image removed successfully!')
      
    } catch (error: any) {
      console.error('Remove error:', error)
      // Still remove from form even if storage deletion fails
      onChange(null)
      toast.success('Image removed from form')
    }
  }, [value, onChange, supabase.storage, bucket])

  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [disabled])

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {value ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-video w-full">
              <Image
                src={value}
                alt="Uploaded image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={`border-2 border-dashed transition-colors ${
            disabled ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-gray-400 cursor-pointer'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={openFileDialog}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-gray-600">
                  Uploading... {uploadProgress > 0 && `${uploadProgress}%`}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    {acceptedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase()} up to {maxSizeMB}MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  disabled={disabled}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}