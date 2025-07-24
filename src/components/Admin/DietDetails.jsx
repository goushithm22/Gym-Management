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
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast.js';
import { supabase } from '@/integrations/supabase/client';
import { logOperation } from '@/contexts/AuthContext.jsx';
import { Apple, Plus, Edit, Trash2, Search } from 'lucide-react';

const DietDetails = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      member_id: '',
      plan_name: '',
      description: '',
      meal_plan: '',
      calories_per_day: 0,
      diet_type: 'weight-loss',
      status: 'active',
    },
  });

  // Fetch diet plans
  const { data: dietPlans = [], isLoading } = useQuery({
    queryKey: ['diet-plans'],
    queryFn: async () => {
      logOperation('Fetch Diet Plans', {});
      const { data, error } = await supabase
        .from('diet_plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(plan => ({
        ...plan,
        member_name: 'Member', // Default since no relation exists
        calories_per_day: plan.calories_per_day || 0,
        diet_type: plan.diet_type || 'weight-loss'
      }));
    },
  });

  // Fetch members for dropdown
  const { data: members = [] } = useQuery({
    queryKey: ['members-for-diet'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('id, full_name')
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    },
  });

  // Add diet plan mutation
  const addDietPlanMutation = useMutation({
    mutationFn: async (planData) => {
      logOperation('Add Diet Plan', { memberId: planData.member_id });
      const { data, error } = await supabase
        .from('diet_plans')
        .insert([planData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Diet plan added successfully",
        description: "New diet plan has been created for the member.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding diet plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update diet plan mutation
  const updateDietPlanMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      logOperation('Update Diet Plan', { planId: id });
      const { error } = await supabase
        .from('diet_plans')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      setEditingPlan(null);
      form.reset();
      toast({
        title: "Diet plan updated successfully",
        description: "Diet plan has been updated.",
      });
    },
  });

  // Delete diet plan mutation
  const deleteDietPlanMutation = useMutation({
    mutationFn: async (id) => {
      logOperation('Delete Diet Plan', { planId: id });
      const { error } = await supabase
        .from('diet_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      toast({
        title: "Diet plan deleted successfully",
        description: "Diet plan has been removed.",
      });
    },
  });

  const onSubmit = (data) => {
    if (editingPlan) {
      updateDietPlanMutation.mutate({ id: editingPlan.id, data });
    } else {
      addDietPlanMutation.mutate(data);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    form.reset({
      member_id: plan.member_id,
      plan_name: plan.plan_name,
      description: plan.description,
      meal_plan: plan.meal_plan,
      calories_per_day: plan.calories_per_day,
      diet_type: plan.diet_type,
      status: plan.status,
    });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this diet plan?')) {
      deleteDietPlanMutation.mutate(id);
    }
  };

  const filteredPlans = dietPlans.filter(plan =>
    plan.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.plan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.diet_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Diet & Nutrition</h2>
          <p className="text-muted-foreground">Manage member diet plans and nutrition guidance</p>
        </div>
        <Dialog open={isAddDialogOpen || !!editingPlan} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingPlan(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Diet Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit Diet Plan' : 'Create New Diet Plan'}</DialogTitle>
              <DialogDescription>
                {editingPlan ? 'Update diet plan information' : 'Create a personalized diet plan for a member'}
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
                  name="plan_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter plan name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of the plan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meal_plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meal Plan Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed meal plan (breakfast, lunch, dinner, snacks)" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="calories_per_day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Calories</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2000" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="diet_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diet Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select diet type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weight-loss">Weight Loss</SelectItem>
                            <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="keto">Ketogenic</SelectItem>
                            <SelectItem value="vegetarian">Vegetarian</SelectItem>
                            <SelectItem value="vegan">Vegan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingPlan(null);
                    form.reset();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addDietPlanMutation.isPending || updateDietPlanMutation.isPending}>
                    {editingPlan ? 'Update' : 'Create'} Plan
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diet Plans</CardTitle>
          <CardDescription>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search by member name, plan name, or diet type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading diet plans...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Diet Type</TableHead>
                  <TableHead>Daily Calories</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.member_name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{plan.plan_name}</p>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {plan.diet_type.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{plan.calories_per_day} cal</TableCell>
                    <TableCell>
                      <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                        {plan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(plan.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

export default DietDetails;