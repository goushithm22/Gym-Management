import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { supabase } from '@/integrations/supabase/client';
import { logOperation } from '@/contexts/AuthContext.jsx';
import { Bell, Calendar, CheckCircle } from 'lucide-react';

const NotificationView = () => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      // Fetch all notifications for the member
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .in('target_audience', ['all', 'overdue'])
        .eq('status', 'sent')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Add read status (you might want to track this in a separate table)
      const notificationsWithReadStatus = (data || []).map(notification => ({
        ...notification,
        read: Math.random() > 0.3 // Mock read status
      }));
      
      setNotifications(notificationsWithReadStatus);
      logOperation('Fetch Member Notifications', { count: data?.length });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'payment': return 'bg-red-100 text-red-800';
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Bell className="h-6 w-6" />
          My Notifications
        </h2>
        <p className="text-blue-100">
          Stay updated with gym announcements and reminders.
          {unreadCount > 0 && (
            <span className="ml-2 bg-white text-blue-600 px-2 py-1 rounded-full text-sm font-medium">
              {unreadCount} unread
            </span>
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Your latest updates and announcements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`border rounded-lg p-4 space-y-2 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getTypeColor(notification.type)}>
                      {notification.type}
                    </Badge>
                    {notification.read && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
                <p className="text-gray-600">{notification.message}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(notification.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationView;
