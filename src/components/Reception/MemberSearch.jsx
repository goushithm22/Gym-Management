import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { logOperation } from '@/contexts/AuthContext.jsx';
import { Search, User, Phone, Mail, MapPin, Calendar, CreditCard } from 'lucide-react';

const MemberSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['member-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      logOperation('Search Members', { searchTerm });
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: searchTerm.length >= 2,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is automatically triggered by the query
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Member Search</h2>
        <p className="text-muted-foreground">Search and view member information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Members</CardTitle>
          <CardDescription>
            Search by name, email, or phone number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter member name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchTerm.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {isLoading ? 'Searching...' : `Found ${searchResults.length} member(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Searching members...</div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No members found matching your search.
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{member.full_name}</h4>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-sm text-muted-foreground">{member.phone}</p>
                      </div>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Member Details */}
      {selectedMember && (
        <Card>
          <CardHeader>
            <CardTitle>Member Details</CardTitle>
            <CardDescription>
              Complete information for {selectedMember.full_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Full Name</p>
                    <p className="text-sm text-muted-foreground">{selectedMember.full_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{selectedMember.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{selectedMember.address}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Membership Type</p>
                    <p className="text-sm text-muted-foreground capitalize">{selectedMember.membership_type}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Join Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedMember.join_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 flex items-center justify-center">
                    <div className={`h-3 w-3 rounded-full ${
                      selectedMember.status === 'active' ? 'bg-green-500' :
                      selectedMember.status === 'inactive' ? 'bg-gray-500' :
                      'bg-red-500'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground capitalize">{selectedMember.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MemberSearch;
