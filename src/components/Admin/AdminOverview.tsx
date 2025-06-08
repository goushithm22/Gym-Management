
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  UserPlus,
  CreditCard,
  Bell,
  Target
} from 'lucide-react';

const AdminOverview = () => {
  const stats = [
    {
      title: "Total Members",
      value: "1,234",
      change: "+12%",
      changeType: "increase",
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Monthly Revenue",
      value: "$45,600",
      change: "+8%",
      changeType: "increase",
      icon: DollarSign,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Active Today",
      value: "89",
      change: "+5%",
      changeType: "increase",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Pending Payments",
      value: "23",
      change: "-3%",
      changeType: "decrease",
      icon: CreditCard,
      color: "from-orange-500 to-orange-600"
    }
  ];

  const quickActions = [
    { icon: UserPlus, label: "Add New Member", color: "from-blue-500 to-blue-600" },
    { icon: CreditCard, label: "Create Bill", color: "from-green-500 to-green-600" },
    { icon: Bell, label: "Send Notification", color: "from-purple-500 to-purple-600" },
    { icon: Target, label: "View Reports", color: "from-orange-500 to-orange-600" }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, Admin!</h2>
        <p className="text-blue-100">Here's what's happening at your gym today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className={`text-xs mt-1 ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Commonly used admin functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors group"
              >
                <div className={`p-3 rounded-full bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Member Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">John Doe joined the gym</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { task: "Send monthly payment reminders", time: "Today, 3:00 PM" },
                { task: "Equipment maintenance check", time: "Tomorrow, 9:00 AM" },
                { task: "Staff meeting", time: "Friday, 10:00 AM" },
                { task: "Review member feedback", time: "Monday, 2:00 PM" }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.task}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
