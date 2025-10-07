"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Edit, Trash2, User, Phone, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Database } from "@/lib/supabase"
import Link from "next/link"
import { toast } from 'sonner'
import { DeleteDoctorDialog } from './delete-doctor-dialog'

type Doctor = Database['public']['Tables']['doctors']['Row'] & {
  user_profiles?: {
    full_name: string | null
    email: string
    phone: string | null
  }
}

interface DoctorsDataTableProps {
  doctors: Doctor[]
  isAdmin?: boolean
  onDoctorDeleted?: (doctorId: string) => void
}

export function DoctorsDataTable({ doctors, isAdmin = false, onDoctorDeleted }: DoctorsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [doctorToDelete, setDoctorToDelete] = React.useState<Doctor | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  const handleDeleteDoctor = (doctor: Doctor) => {
    setDoctorToDelete(doctor)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirmed = async (doctorId: string) => {
    try {
      const response = await fetch(`/api/doctors/${doctorId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete doctor')
      }

      toast.success('Doctor deleted successfully')
      onDoctorDeleted?.(doctorId)
    } catch (error) {
      console.error('Error deleting doctor:', error)
      toast.error('Failed to delete doctor')
    } finally {
      setDeleteDialogOpen(false)
      setDoctorToDelete(null)
    }
  }

  // Responsive column visibility
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 768) {
        // Mobile: hide less important columns
        setColumnVisibility({
          license_number: false,
          years_of_experience: false,
          consultation_fee: false,
          created_at: false,
        })
      } else if (width < 1024) {
        // Tablet: hide some columns
        setColumnVisibility({
          license_number: false,
          created_at: false,
        })
      } else {
        // Desktop: show all columns
        setColumnVisibility({})
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const columns: ColumnDef<Doctor>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "user_profiles.full_name",
      id: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Doctor Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const fullName = row.original.user_profiles?.full_name
        return (
          <div className="font-medium">
            {fullName || "N/A"}
          </div>
        )
      },
    },
    {
      accessorKey: "specialization",
      header: "Specialization",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
          {row.getValue("specialization")}
        </Badge>
      ),
    },
    {
      accessorKey: "license_number",
      header: "License Number",
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.getValue("license_number")}
        </div>
      ),
    },
    {
      accessorKey: "years_of_experience",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Experience
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("years_of_experience")} years
        </div>
      ),
    },
    {
      accessorKey: "consultation_fee",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Fee
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const fee = row.getValue("consultation_fee") as number
        return (
          <div className="font-medium">
            ${fee?.toFixed(2) || "0.00"}
          </div>
        )
      },
    },
    {
      accessorKey: "user_profiles.email",
      id: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.original.user_profiles?.email
        return email ? (
          <a
            href={`mailto:${email}`}
            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            <Mail className="h-3 w-3" />
            {email}
          </a>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )
      },
    },
    {
      accessorKey: "user_profiles.phone",
      id: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.original.user_profiles?.phone
        return phone ? (
          <a
            href={`tel:${phone}`}
            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            <Phone className="h-3 w-3" />
            {phone}
          </a>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"))
        return <div className="text-sm text-muted-foreground">{date.toLocaleDateString()}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const doctor = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(doctor.id)}
              >
                Copy doctor ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isAdmin ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/doctors/${doctor.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit doctor
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteDoctor(doctor)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete doctor
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href={`/doctors/${doctor.id}`}>
                    <User className="mr-2 h-4 w-4" />
                    View details
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: doctors,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter doctors..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {doctorToDelete && (
        <DeleteDoctorDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          doctor={doctorToDelete as any}
          onDoctorDeleted={handleDeleteConfirmed}
        />
      )}
    </div>
  )
}