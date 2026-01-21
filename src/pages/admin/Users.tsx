import { useState, useEffect } from "react";
import { Search, MoreVertical, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { adminApi, User } from "@/api/admin";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSuspend = async (userId: string) => {
    try {
      await adminApi.updateUserApproval(userId, true);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isApproved: true } : u))
      );
      toast({ title: "User banned", description: "User has been banned successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to ban user", variant: "destructive" });
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      await adminApi.updateUserApproval(userId, false);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isApproved: false } : u))
      );
      toast({ title: "User activated", description: "User has been activated successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to activate user", variant: "destructive" });
    }
  };

  const customers = filteredUsers.filter((u) => u.role === "customer");
  const vendors = filteredUsers.filter((u) => u.role === "vendor");

  const UserTable = ({ users }: { users: User[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={!user.isApproved ? "default" : "destructive"}>
                {!user.isApproved ? "active" : "banned"}
              </Badge>
            </TableCell>
            <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!user.isApproved ? (
                    <DropdownMenuItem onClick={() => handleSuspend(user.id)}>
                      <Ban className="h-4 w-4 mr-2" />
                      Ban User
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => handleActivate(user.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate User
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage vendors and customers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vendors</CardTitle>
            <div className="text-2xl font-bold">{vendors.length}</div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs sm:text-sm">All ({filteredUsers.length})</TabsTrigger>
              <TabsTrigger value="customers" className="text-xs sm:text-sm">Customers ({customers.length})</TabsTrigger>
              <TabsTrigger value="vendors" className="text-xs sm:text-sm">Vendors ({vendors.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <UserTable users={filteredUsers} />
            </TabsContent>
            <TabsContent value="customers" className="mt-4">
              <UserTable users={customers} />
            </TabsContent>
            <TabsContent value="vendors" className="mt-4">
              <UserTable users={vendors} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
