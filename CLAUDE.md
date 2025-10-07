# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## Project Architecture

This is a Next.js 14 hospital management system built with:

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: Supabase Auth with role-based access control
- **Styling**: Tailwind CSS with shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **State Management**: Zustand for client state
- **Icons**: Lucide React

### Core Architecture

#### Database Schema
The system has three main entities:
- **Hospitals**: Basic hospital information and management
- **Doctors**: Doctor profiles with specializations, linked to hospitals via `doctor_hospitals` junction table
- **User Profiles**: Authentication and role management (admin, doctor, patient)
- **Availability**: Doctor scheduling system with time slots

#### Authentication & Authorization
- Multi-role system: admin, doctor, patient
- RLS policies enforce data access based on user roles
- Admin users can manage hospitals and doctors
- Doctors can manage their own profiles and availability
- Patients can view public information

#### App Structure
- **`/app`**: Next.js App Router pages
  - `/admin/*`: Admin dashboard and management pages
  - `/api/*`: API routes for data operations
  - `/auth/*`: Authentication pages (login, signup, verify)
  - `/doctors`, `/hospitals`: Public listing pages
- **`/components`**: Reusable UI components organized by feature
  - `/ui`: shadcn/ui base components
  - `/admin`, `/doctors`, `/hospitals`: Feature-specific components
- **`/lib`**: Utility functions and API clients
  - `/supabase/*`: Database API functions
  - `/types/*`: TypeScript type definitions
  - `/auth/*`: Authentication utilities

#### Key Patterns
- API routes use Supabase server client with service role for admin operations
- Client components use Supabase client for authenticated requests
- Form validation with Zod schemas
- Responsive design with Tailwind CSS utilities
- shadcn/ui components for consistent UI patterns

#### Database Relationships
- Doctors can be associated with multiple hospitals via `doctor_hospitals`
- Each doctor has a primary hospital designation
- Availability slots are tied to specific doctor-hospital combinations
- RLS policies prevent unauthorized access to sensitive data

## Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Migration Management
Database migrations are in `/supabase/migrations/` - apply them sequentially for proper schema setup.