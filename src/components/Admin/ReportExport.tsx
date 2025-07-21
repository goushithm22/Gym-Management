
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logOperation } from '@/contexts/AuthContext';
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

      // Generate CSV
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

  const generateCSV = (data: any[]) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    ).join('\n');
    
    return `${headers}\n${rows}`;
  };

  const downloadCSV = (csvContent: string, filename: string) => {
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
          {/* Report Type Selection */}
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

          {/* Date Range */}
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

      {/* Quick Stats */}
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

export default ReportExport;
