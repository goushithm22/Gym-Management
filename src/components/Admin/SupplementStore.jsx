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

// import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast.js';
import { supabase } from '@/integrations/supabase/client';
import { logOperation } from '@/contexts/AuthContext.jsx';
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  DollarSign, 
  Package,
  TrendingUp
} from 'lucide-react';

const ReportExport = () => {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    { value: 'members', label: 'Member Report', icon: Users, description: 'Complete member information and statistics' },
    { value: 'billing', label: 'Billing Report', icon: DollarSign, description: 'Payment history and revenue analysis' },
    { value: 'supplements', label: 'Supplement Sales', icon: Package, description: 'Supplement store sales data' },
    { value: 'attendance', label: 'Attendance Report', icon: TrendingUp, description: 'Member visit patterns and trends' }
  ];

  const generateReport = async () => {
    if (!reportType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      let data, filename;
      
      switch (reportType) {
        case 'members':
          const { data: membersData } = await supabase
            .from('members')
            .select('*')
            .order('created_at', { ascending: false });
          data = membersData;
          filename = 'members-report';
          break;
          
        case 'billing':
          const { data: billsData } = await supabase
            .from('bills')
            .select(`
              *,
              members (full_name, email)
            `)
            .order('created_at', { ascending: false });
          data = billsData;
          filename = 'billing-report';
          break;
          
        case 'supplements':
          const { data: supplementsData } = await supabase
            .from('supplements')
            .select('*')
            .order('created_at', { ascending: false });
          data = supplementsData;
          filename = 'supplements-report';
          break;
          
        default:
          data = [];
          filename = 'report';
      }

      /* Generate CSV
      if (data && data.length > 0) {
        const csv = generateCSV(data);
        downloadCSV(csv, `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
        
        logOperation('Generate Report', { 
          type: reportType, 
          recordCount: data.length,
          dateRange: dateRange 
        });
        
        toast({
          title: "Success",
          description: "Report generated and downloaded successfully",
        });
      } else {
        toast({
          title: "Info",
          description: "No data found for the selected criteria",
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCSV = (data) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    ).join('\n');
    
    return `${headers}\n${rows}`;
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Reports & Analytics</h2>
        <p className="text-green-100">Generate and export comprehensive reports for your gym.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Report
          </CardTitle>
          <CardDescription>Select report type and date range to generate export</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */} /*
          <div className="space-y-4">
            <label className="text-sm font-medium">Report Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((type) => (
                <div
                  key={type.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    reportType === type.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setReportType(type.value)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      reportType === type.value 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <type.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{type.label}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */} /*
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </div>
          </div>

          <Button 
            onClick={generateReport} 
            disabled={isGenerating || !reportType}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate & Download Report'}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */} /*
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">$45,600</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Supplement Sales</p>
                <p className="text-2xl font-bold">$2,340</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Attendance</p>
                <p className="text-2xl font-bold">89/day</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportExport;  */

