
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, logOperation } from '@/lib/supabase';
import { Receipt, Download, Calendar, DollarSign } from 'lucide-react';

interface Bill {
  id: string;
  amount: number;
  fee_package: string;
  billing_period: string;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  created_at: string;
}

const BillReceipts = () => {
  const { user } = useAuth();

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['member-bills', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      logOperation('Fetch Member Bills', { userId: user.id });
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('member_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Bill[];
    },
    enabled: !!user?.id,
  });

  const downloadReceipt = (bill: Bill) => {
    // Generate a simple receipt text
    const receiptContent = `
GYM RECEIPT
-----------
Receipt ID: ${bill.id}
Date: ${new Date(bill.created_at).toLocaleDateString()}
Billing Period: ${bill.billing_period}
Package: ${bill.fee_package.toUpperCase()}
Amount: $${bill.amount}
Due Date: ${new Date(bill.due_date).toLocaleDateString()}
Status: ${bill.status.toUpperCase()}

Thank you for your membership!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${bill.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logOperation('Download Receipt', { billId: bill.id });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Bill Receipts</h2>
        <p className="text-muted-foreground">View and download your payment receipts</p>
      </div>

      {bills.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Bills Found</h3>
            <p className="text-muted-foreground">You don't have any bills yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bills.map((bill) => (
            <Card key={bill.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Receipt className="h-5 w-5" />
                      <span>{bill.fee_package.toUpperCase()} Package</span>
                    </CardTitle>
                    <CardDescription>{bill.billing_period}</CardDescription>
                  </div>
                  <Badge variant={
                    bill.status === 'paid' ? 'default' :
                    bill.status === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {bill.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Amount</p>
                      <p className="text-lg font-bold">${bill.amount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Due Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(bill.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Bill Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(bill.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadReceipt(bill)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BillReceipts;
