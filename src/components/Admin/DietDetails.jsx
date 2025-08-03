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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logOperation } from '@/contexts/AuthContext.jsx';
import { Apple, Plus, Edit, Trash2, Search, Clock } from 'lucide-react';

const DietDetails = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDiet, setEditingDiet] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      meal_type: 'breakfast',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      instructions: '',
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
      return data || [];
    },
  });

  // Add diet plan mutation
  const addDietMutation = useMutation({
    mutationFn: async (dietData) => {
      logOperation('Add Diet Plan', { name: dietData.name });
      const { data, error } = await supabase
        .from('diet_plans')
        .insert([dietData])
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
        description: "New diet plan has been created.",
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
  const updateDietMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      logOperation('Update Diet Plan', { dietId: id });
      const { error } = await supabase
        .from('diet_plans')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
      setEditingDiet(null);
      form.reset();
      toast({
        title: "Diet plan updated successfully",
        description: "Diet plan information has been updated.",
      });
    },
  });

  // Delete diet plan mutation
  const deleteDietMutation = useMutation({
    mutationFn: async (id) => {
      logOperation('Delete Diet Plan', { dietId: id });
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
    if (editingDiet) {
      updateDietMutation.mutate({ id: editingDiet.id, data });
    } else {
      addDietMutation.mutate(data);
    }
  };

  const handleEdit = (diet) => {
    setEditingDiet(diet);
    form.reset({
      name: diet.name,
      description: diet.description,
      meal_type: diet.meal_type,
      calories: diet.calories,
      protein: diet.protein,
      carbs: diet.carbs,
      fats: diet.fats,
      instructions: diet.instructions,
      status: diet.status,
    });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this diet plan?')) {
      deleteDietMutation.mutate(id);
    }
  };

  const filteredDietPlans = dietPlans.filter(diet =>
    diet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diet.meal_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMealTypeColor = (type) => {
    switch (type) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-800';
      case 'lunch': return 'bg-orange-100 text-orange-800';
      case 'dinner': return 'bg-blue-100 text-blue-800';
      case 'snack': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Diet Plans</h2>
          <p className="text-muted-foreground">Manage nutrition plans for members</p>
        </div>
        <Dialog open={isAddDialogOpen || !!editingDiet} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingDiet(null);
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
              <DialogTitle>{editingDiet ? 'Edit Diet Plan' : 'Add New Diet Plan'}</DialogTitle>
              <DialogDescription>
                {editingDiet ? 'Update diet plan information' : 'Create a new nutrition plan for members'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
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
                    name="meal_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select meal type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="breakfast">Breakfast</SelectItem>
                            <SelectItem value="lunch">Lunch</SelectItem>
                            <SelectItem value="dinner">Dinner</SelectItem>
                            <SelectItem value="snack">Snack</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calories</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="protein"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Protein (g)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="carbs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carbs (g)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fats (g)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter cooking/preparation instructions" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                    setEditingDiet(null);
                    form.reset();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addDietMutation.isPending || updateDietMutation.isPending}>
                    {editingDiet ? 'Update' : 'Add'} Diet Plan
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diet Plans Management</CardTitle>
          <CardDescription>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search diet plans by name or meal type..."
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
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Meal Type</TableHead>
                  <TableHead>Nutrition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDietPlans.map((diet) => (
                  <TableRow key={diet.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{diet.name}</p>
                        <p className="text-sm text-muted-foreground">{diet.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getMealTypeColor(diet.meal_type)}>
                        {diet.meal_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{diet.calories} cal</p>
                        <p className="text-muted-foreground">
                          P: {diet.protein}g | C: {diet.carbs}g | F: {diet.fats}g
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={diet.status === 'active' ? 'default' : 'secondary'}>
                        {diet.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(diet)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(diet.id)}
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