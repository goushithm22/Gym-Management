import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, UserCheck, Phone, Mail } from 'lucide-react';

const MemberDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  const members = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      membershipType: 'Premium',
      status: 'Active',
      joinDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 987-6543',
      membershipType: 'Basic',
      status: 'Active',
      joinDate: '2024-02-20'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike.wilson@email.com',
      phone: '+1 (555) 456-7890',
      membershipType: 'Premium',
      status: 'Inactive',
      joinDate: '2023-11-10'
    }
  ];

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Member Directory</h1>
        <p className="text-muted-foreground">Browse and manage all gym members</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Search Members</CardTitle>
          <CardDescription>Find members by name or email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <div className="grid gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {member.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {member.phone}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={member.membershipType === 'Premium' ? 'default' : 'secondary'}>
                    {member.membershipType}
                  </Badge>
                  <Badge variant={member.status === 'Active' ? 'default' : 'destructive'}>
                    {member.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No members found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MemberDirectory;