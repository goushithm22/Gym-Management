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
import { useToast } from '@/hooks/use-toast.js';
import { supabase } from '@/integrations/supabase/client';
import { logOperation } from '@/contexts/AuthContext.jsx';
import { ShoppingCart, Plus, Edit, Trash2, Search } from 'lucide-react';

const SupplementStore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: 'protein',
      stock: 0,
      status: 'active',
    },
  });

  // Fetch supplements
  const { data: supplements = [], isLoading } = useQuery({
    queryKey: ['supplements'],
    queryFn: async () => {
      logOperation('Fetch Supplements', {});
      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Add supplement mutation
  const addSupplementMutation = useMutation({
    mutationFn: async (supplementData) => {
      logOperation('Add Supplement', { name: supplementData.name });
      const { data, error } = await supabase
        .from('supplements')
        .insert([supplementData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Supplement added successfully",
        description: "New supplement has been added to the store.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding supplement",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update supplement mutation
  const updateSupplementMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      logOperation('Update Supplement', { supplementId: id });
      const { error } = await supabase
        .from('supplements')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
      setEditingSupplement(null);
      form.reset();
      toast({
        title: "Supplement updated successfully",
        description: "Supplement information has been updated.",
      });
    },
  });

  // Delete supplement mutation
  const deleteSupplementMutation = useMutation({
    mutationFn: async (id) => {
      logOperation('Delete Supplement', { supplementId: id });
      const { error } = await supabase
        .from('supplements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplements'] });
      toast({
        title: "Supplement deleted successfully",
        description: "Supplement has been removed from the store.",
      });
    },
  });

  const onSubmit = (data) => {
    if (editingSupplement) {
      updateSupplementMutation.mutate({ id: editingSupplement.id, data });
    } else {
      addSupplementMutation.mutate(data);
    }
  };

  const handleEdit = (supplement) => {
    setEditingSupplement(supplement);
    form.reset({
      name: supplement.name,
      description: supplement.description,
      price: supplement.price,
      category: supplement.category,
      stock: supplement.stock,
      status: supplement.status,
    });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this supplement?')) {
      deleteSupplementMutation.mutate(id);
    }
  };

  const filteredSupplements = supplements.filter(supplement =>
    supplement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplement.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Supplement Store</h2>
          <p className="text-muted-foreground">Manage gym supplements and inventory</p>
        </div>
        <Dialog open={isAddDialogOpen || !!editingSupplement} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingSupplement(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSupplement ? 'Edit Supplement' : 'Add New Supplement'}</DialogTitle>
              <DialogDescription>
                {editingSupplement ? 'Update supplement information' : 'Add a new supplement to the store'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
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
                        <Input placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="protein">Protein</SelectItem>
                          <SelectItem value="vitamins">Vitamins</SelectItem>
                          <SelectItem value="pre-workout">Pre-Workout</SelectItem>
                          <SelectItem value="post-workout">Post-Workout</SelectItem>
                          <SelectItem value="creatine">Creatine</SelectItem>
                          <SelectItem value="bcaa">BCAA</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
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
                    setEditingSupplement(null);
                    form.reset();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addSupplementMutation.isPending || updateSupplementMutation.isPending}>
                    {editingSupplement ? 'Update' : 'Add'} Supplement
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplements Inventory</CardTitle>
          <CardDescription>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search supplements by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading supplements...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSupplements.map((supplement) => (
                  <TableRow key={supplement.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplement.name}</p>
                        <p className="text-sm text-muted-foreground">{supplement.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{supplement.category}</TableCell>
                    <TableCell>${supplement.price}</TableCell>
                    <TableCell>
                      <span className={supplement.stock < 10 ? 'text-red-600 font-medium' : ''}>
                        {supplement.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplement.status === 'active' ? 'default' : 'secondary'}>
                        {supplement.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(supplement)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(supplement.id)}
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

export default SupplementStore;