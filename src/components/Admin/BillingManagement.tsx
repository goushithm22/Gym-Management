
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase, logOperation } from '@/lib/supabase';
import { Receipt, Plus, Search, FileText } from 'lucide-react';

interface Bill {
  id: string;
  member_id: string;
  member_name: string;
  amount: number;
  fee_package: string;
  billing_period: string;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  created_at: string;
}

interface BillFormData {
  member_id: string;
  amount: number;
  fee_package: string;
  billing_period: string;
  due_date: string;
}

const BillingManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BillFormData>({
    defaultValues: {
      member_id: '',
      amount: 0,
      fee_package: 'basic',
      billing_period: '',
      due_date: '',
    },
  });

  // Fetch bills
  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      logOperation('Fetch Bills', {});
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          members (full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data?.map(bill => ({
        ...bill,
        member_name: bill.members?.full_name || 'Unknown'
      })) as Bill[];
    },
  });

  // Fetch members for dropdown
  const { data: members = [] } = useQuery({
    queryKey: ['members-for-billing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('id, full_name')
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    },
  });

  // Create bill mutation
  const createBillMutation = useMutation({
    mutationFn: async (billData: BillFormData) => {
      logOperation('Create Bill', { memberId: billData.member_id });
      const { data, error } = await supabase
        .from('bills')
        .insert([{
          ...billData,
          status: 'pending',
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Bill created successfully",
        description: "New bill has been generated for the member.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating bill",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update bill status mutation
  const updateBillStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      logOperation('Update Bill Status', { billId: id, status });
      const { error } = await supabase
        .from('bills')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast({
        title: "Bill status updated",
        description: "Bill status has been updated successfully.",
      });
    },
  });

  const onSubmit = (data: BillFormData) => {
    createBillMutation.mutate(data);
  };

  const filteredBills = bills.filter(bill =>
    bill.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.fee_package.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Billing Management</h2>
          <p className="text-muted-foreground">Create and manage member bills</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Bill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Bill</DialogTitle>
              <DialogDescription>
                Generate a new bill for a gym member
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="member_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fee_package"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee Package</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select package" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="basic">Basic - $29/month</SelectItem>
                          <SelectItem value="premium">Premium - $59/month</SelectItem>
                          <SelectItem value="vip">VIP - $99/month</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter amount" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billing_period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Period</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., January 2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createBillMutation.isPending}>
                    Create Bill
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bills Overview</CardTitle>
          <CardDescription>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search bills by member name or package..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading bills...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.member_name}</TableCell>
                    <TableCell className="capitalize">{bill.fee_package}</TableCell>
                    <TableCell>{bill.billing_period}</TableCell>
                    <TableCell>${bill.amount}</TableCell>
                    <TableCell>{new Date(bill.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        bill.status === 'paid' ? 'default' :
                        bill.status === 'pending' ? 'secondary' :
                        'destructive'
                      }>
                        {bill.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {bill.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateBillStatusMutation.mutate({ id: bill.id, status: 'paid' })}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingManagement;
