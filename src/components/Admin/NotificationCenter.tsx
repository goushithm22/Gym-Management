
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase, logOperation } from '@/lib/supabase';
import { Bell, Send, Calendar, Users, Plus } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'general' | 'announcement' | 'reminder';
  target_audience: 'all' | 'overdue' | 'specific';
  scheduled_date?: string;
  status: 'draft' | 'sent' | 'scheduled';
  created_at: string;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'general' as 'payment' | 'general' | 'announcement' | 'reminder',
    target_audience: 'all' as 'all' | 'overdue' | 'specific',
    scheduled_date: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
      logOperation('Fetch Notifications', { count: data?.length });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    }
  };

  const sendNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...newNotification,
          status: newNotification.scheduled_date ? 'scheduled' : 'sent',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setNotifications([data, ...notifications]);
      setNewNotification({
        title: '',
        message: '',
        type: 'general',
        target_audience: 'all',
        scheduled_date: ''
      });

      logOperation('Send Notification', { 
        type: newNotification.type,
        target: newNotification.target_audience 
      });

      toast({
        title: "Success",
        description: "Notification sent successfully",
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-red-100 text-red-800';
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Notification Center</h2>
        <p className="text-purple-100">Send notifications and announcements to gym members.</p>
      </div>

      {/* Create New Notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Notification
          </CardTitle>
          <CardDescription>Send notifications to gym members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Notification title"
            value={newNotification.title}
            onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
          />
          
          <Textarea
            placeholder="Notification message"
            value={newNotification.message}
            onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={newNotification.type}
              onValueChange={(value) => 
                setNewNotification({...newNotification, type: value as 'payment' | 'general' | 'announcement' | 'reminder'})
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="payment">Payment Reminder</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={newNotification.target_audience}
              onValueChange={(value) => 
                setNewNotification({...newNotification, target_audience: value as 'all' | 'overdue' | 'specific'})
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Target audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="overdue">Overdue Payments</SelectItem>
                <SelectItem value="specific">Specific Members</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="datetime-local"
              value={newNotification.scheduled_date}
              onChange={(e) => setNewNotification({...newNotification, scheduled_date: e.target.value})}
              placeholder="Schedule for later (optional)"
            />
          </div>

          <Button 
            onClick={sendNotification} 
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {newNotification.scheduled_date ? 'Schedule Notification' : 'Send Now'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{notification.title}</h3>
                  <div className="flex gap-2">
                    <Badge className={getTypeColor(notification.type)}>
                      {notification.type}
                    </Badge>
                    <Badge className={getStatusColor(notification.status)}>
                      {notification.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-600">{notification.message}</p>
                <div className="flex items-center text-sm text-gray-500 gap-4">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {notification.target_audience}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-center text-gray-500 py-8">No notifications sent yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
