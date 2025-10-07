import { requireAuth, getUserProfile } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Hospital, 
  Users, 
  Calendar, 
  Activity,
  TrendingUp,
  Clock,
  ChevronRight,
  Home
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await requireAuth()
  const profile = await getUserProfile()

  if (!profile) {
    return <div>Loading...</div>
  }

  const getDashboardStats = () => {
    // Mock data - in real app, fetch from database
    if (profile.role === 'admin') {
      return [
        { title: 'Total Hospitals', value: '12', icon: Hospital, trend: '+2 this month', change: '+16.7%' },
        { title: 'Active Doctors', value: '156', icon: Users, trend: '+8 this week', change: '+5.4%' },
        { title: 'Today\'s Appointments', value: '89', icon: Calendar, trend: '+12% from yesterday', change: '+12%' },
        { title: 'System Health', value: '99.9%', icon: Activity, trend: 'All systems operational', change: '0%' }
      ]
    } else if (profile.role === 'doctor') {
      return [
        { title: 'Today\'s Patients', value: '8', icon: Users, trend: '2 pending', change: '+25%' },
        { title: 'This Week', value: '32', icon: Calendar, trend: '+4 from last week', change: '+14.3%' },
        { title: 'Next Appointment', value: '2:30 PM', icon: Clock, trend: 'John Doe - Checkup', change: '' },
        { title: 'Patient Satisfaction', value: '4.8/5', icon: TrendingUp, trend: 'Based on 24 reviews', change: '+0.2' }
      ]
    } else {
      return [
        { title: 'Upcoming Appointments', value: '2', icon: Calendar, trend: 'Next: Tomorrow 10 AM', change: '' },
        { title: 'Medical Records', value: '5', icon: Activity, trend: 'Last updated: 2 days ago', change: '' },
        { title: 'Favorite Doctors', value: '3', icon: Users, trend: 'Dr. Smith, Dr. Johnson...', change: '' },
        { title: 'Health Score', value: 'Good', icon: TrendingUp, trend: 'Keep up the good work!', change: '' }
      ]
    }
  }

  const stats = getDashboardStats()

  return (
    <>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Dashboard</span>
          </div>
        </div>
      </header>
      <Separator />
      
      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, {profile.full_name}!</h2>
            <p className="text-muted-foreground">
              {profile.role === 'admin' && 'Manage your hospital system efficiently'}
              {profile.role === 'doctor' && 'Ready to help your patients today'}
              {profile.role === 'patient' && 'Your health journey continues here'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="secondary" 
              className={`${
                profile.role === 'admin' ? 'bg-[#ADE3FF]/10 text-primary-800 border-[#ADE3FF]/20' :
                profile.role === 'doctor' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                'bg-green-100 text-green-800 border-green-200'
              }`}
            >
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} Account
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change && (
                    <span className={`inline-flex items-center ${
                      stat.change.startsWith('+') ? 'text-green-600' : 
                      stat.change.startsWith('-') ? 'text-red-600' : 
                      'text-muted-foreground'
                    }`}>
                      {stat.change.startsWith('+') && <TrendingUp className="h-3 w-3 mr-1" />}
                      {stat.change} 
                    </span>
                  )}
                  {stat.change && ' '}
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks for your role
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-6">
              <div className="space-y-4">
                {profile.role === 'admin' && (
                  <>
                    <Link href="/admin/hospitals" className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Manage Hospitals</p>
                        <p className="text-sm text-muted-foreground">Add, edit, or remove hospitals</p>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    <Link href="/admin/doctors" className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Manage Doctors</p>
                        <p className="text-sm text-muted-foreground">View and manage doctor profiles</p>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    <Link href="/admin/availability" className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Manage Availability</p>
                        <p className="text-sm text-muted-foreground">Set doctor schedules and availability</p>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </>
                )}
                {profile.role === 'doctor' && (
                  <>
                    <Link href="/doctor/schedule" className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">View Schedule</p>
                        <p className="text-sm text-muted-foreground">Check your appointments for today</p>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    <Link href="/doctor/appointments" className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Manage Appointments</p>
                        <p className="text-sm text-muted-foreground">Update appointment status</p>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </>
                )}
                {profile.role === 'patient' && (
                  <>
                    <Link href="/hospitals" className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Find Hospitals</p>
                        <p className="text-sm text-muted-foreground">Discover hospitals near you</p>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    <Link href="/doctors" className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Book Appointment</p>
                        <p className="text-sm text-muted-foreground">Schedule with available doctors</p>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-[#ADE3FF] rounded-full mt-2"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">System Update</p>
                    <p className="text-sm text-muted-foreground">New features available</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Profile Updated</p>
                    <p className="text-sm text-muted-foreground">Your profile information was updated</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-[#ADE3FF] rounded-full mt-2"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Welcome!</p>
                    <p className="text-sm text-muted-foreground">Welcome to Hospital Management System</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}