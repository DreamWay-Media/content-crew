import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Users,
  FileText,
  Search as SearchIcon,
  Download,
  ShieldCheck,
  Edit,
  Trash,
  AlertTriangle,
  Shield,
  UserPlus,
  Filter,
  ArrowLeft,
  FileImage,
  Clock,
  Calendar,
  Mail,
  UserCircle
} from "lucide-react";

// Secret admin token - this would normally be handled more securely
const ADMIN_TOKEN = "AICCSecretAdmin2024";

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  
  // Mock data for development - these would come from API calls in production
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [downloads, setDownloads] = useState<any[]>([]);
  const [searches, setSearches] = useState<any[]>([]);
  
  // State for edit/delete modals
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isViewingUser, setIsViewingUser] = useState(false);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "Basic"
  });

  // Check if user is authorized to access admin page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    
    if (tokenParam && tokenParam === ADMIN_TOKEN) {
      setIsAuthorized(true);
      setToken(tokenParam);
      localStorage.setItem('adminToken', tokenParam);
    } else {
      const savedToken = localStorage.getItem('adminToken');
      if (savedToken && savedToken === ADMIN_TOKEN) {
        setIsAuthorized(true);
        setToken(savedToken);
      } else {
        setIsAuthorized(false);
      }
    }
    
    setLoading(false);
  }, []);

  // Fetch data when authorized
  useEffect(() => {
    if (isAuthorized) {
      fetchData();
    }
  }, [isAuthorized]);
  
  // Filter users based on search term and role
  useEffect(() => {
    // First filter by role if needed
    let roleFiltered = users;
    if (roleFilter !== "all") {
      roleFiltered = users.filter(user => user.role === roleFilter);
    }
    
    // Then filter by search term if present
    if (userSearchTerm === "") {
      setFilteredUsers(roleFiltered);
    } else {
      const lowercaseSearchTerm = userSearchTerm.toLowerCase();
      const filtered = roleFiltered.filter(user => 
        user.username.toLowerCase().includes(lowercaseSearchTerm) ||
        user.firstName.toLowerCase().includes(lowercaseSearchTerm) ||
        user.lastName.toLowerCase().includes(lowercaseSearchTerm) ||
        user.role.toLowerCase().includes(lowercaseSearchTerm)
      );
      setFilteredUsers(filtered);
    }
  }, [users, userSearchTerm, roleFilter]);

  const fetchData = async () => {
    try {
      // These would be actual API calls in production
      const usersResponse = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      const downloadsResponse = await fetch('/api/admin/downloads', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (downloadsResponse.ok) {
        const downloadsData = await downloadsResponse.json();
        setDownloads(downloadsData);
      }

      const searchesResponse = await fetch('/api/admin/searches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (searchesResponse.ok) {
        const searchesData = await searchesResponse.json();
        setSearches(searchesData);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      // For development, set mock data
      setUsers([
        { id: 1, username: "admin@example.com", firstName: "Admin", lastName: "User", role: "Admin" },
        { id: 2, username: "user1@example.com", firstName: "John", lastName: "Doe", role: "Basic" },
        { id: 3, username: "user2@example.com", firstName: "Jane", lastName: "Smith", role: "Standard" }
      ]);
      
      setDownloads([
        { id: 1, email: "user1@example.com", articleTitle: "AI SEO Strategies", createdAt: "2024-03-22", downloadSent: true },
        { id: 2, email: "user2@example.com", articleTitle: "Machine Learning Basics", createdAt: "2024-03-21", downloadSent: false }
      ]);
      
      setSearches([
        { id: 1, searchTerm: "AI SEO", createdAt: "2024-03-22", summariesCount: 8 },
        { id: 2, searchTerm: "Machine Learning", createdAt: "2024-03-21", summariesCount: 10 }
      ]);
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setIsDeleteUserOpen(true);
  };

  const confirmEditUser = async () => {
    try {
      // Make the actual API call to update the user
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(selectedUser)
      });
      
      if (!response.ok) {
        throw new Error("Failed to update user");
      }
      
      const updatedUser = await response.json();
      
      // Update the UI with the response data
      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
      
      toast({
        title: "User updated",
        description: `${selectedUser.firstName} ${selectedUser.lastName}'s account has been updated.`,
      });
      
      setIsEditUserOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteUser = async () => {
    try {
      // Make the actual API call to delete the user
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      
      // Update the UI
      setUsers(users.filter(u => u.id !== selectedUser.id));
      
      toast({
        title: "User deleted",
        description: `${selectedUser.firstName} ${selectedUser.lastName}'s account has been removed.`,
      });
      
      setIsDeleteUserOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleViewUser = async (user: any) => {
    try {
      setLoadingUserDetail(true);
      setSelectedUser(user);
      
      // Make the actual API call to fetch user details
      const response = await fetch(`/api/admin/users/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      
      const userDetailData = await response.json();
      
      // Set user detail and show the detail view
      setUserDetail(userDetailData);
      setIsViewingUser(true);
      setLoadingUserDetail(false);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setLoadingUserDetail(false);
      toast({
        title: "Error",
        description: "Failed to fetch user details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async () => {
    try {
      // Make the actual API call to create a new user
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });
      
      if (!response.ok) {
        throw new Error("Failed to add user");
      }
      
      const createdUser = await response.json();
      
      // Update the UI with the newly created user
      setUsers([...users, createdUser]);
      
      toast({
        title: "User added",
        description: `${newUser.firstName} ${newUser.lastName}'s account has been created.`,
      });
      
      setIsAddUserOpen(false);
      setNewUser({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "Basic"
      });
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: "Failed to add user. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Admin Authentication
            </CardTitle>
            <CardDescription>
              This area is restricted to authorized personnel only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="token">Admin Token</Label>
                <Input 
                  id="token" 
                  type="password" 
                  placeholder="Enter your admin token" 
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={() => {
                  if (token === ADMIN_TOKEN) {
                    setIsAuthorized(true);
                    localStorage.setItem('adminToken', token);
                  } else {
                    toast({
                      title: "Access denied",
                      description: "Invalid admin token provided.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Authenticate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render admin dashboard if authorized
  return (
    <AppLayout activePage="dashboard">
      <div className="container px-6 py-8 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" />
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Admin Access
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="users" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-1">
                <SearchIcon className="h-4 w-4" />
                Stats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts and permissions.</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddUserOpen(true)} className="flex items-center gap-1">
                    <UserPlus className="h-4 w-4" />
                    Add User
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          className="pl-8"
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <div className="w-[150px]">
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Basic">Basic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(userSearchTerm || roleFilter !== "all") && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setUserSearchTerm("");
                            setRoleFilter("all");
                          }}
                          className="h-9 px-2"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {filteredUsers.length === users.length 
                          ? `${users.length} total users` 
                          : `${filteredUsers.length} of ${users.length} users`}
                      </div>
                      
                      <div className="flex gap-2">
                        {roleFilter !== "all" && (
                          <Badge className="flex items-center gap-1" variant="outline">
                            <Filter className="h-3 w-3" />
                            Role: {roleFilter}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setRoleFilter("all")}
                              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                            >
                              <span className="sr-only">Clear role filter</span>
                              ×
                            </Button>
                          </Badge>
                        )}
                        
                        {userSearchTerm && (
                          <Badge className="flex items-center gap-1" variant="outline">
                            <SearchIcon className="h-3 w-3" />
                            Search: {userSearchTerm}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setUserSearchTerm("")}
                              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                            >
                              <span className="sr-only">Clear search</span>
                              ×
                            </Button>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-md border">
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.id}</TableCell>
                              <TableCell 
                                className="cursor-pointer hover:text-primary hover:underline"
                                onClick={() => handleViewUser(user)}
                              >
                                {user.username}
                              </TableCell>
                              <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={user.role === "Admin" ? "destructive" : user.role === "Standard" ? "default" : "secondary"}
                                >
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleEditUser(user)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    onClick={() => handleDeleteUser(user)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-primary" />
                      Downloads
                    </CardTitle>
                    <CardDescription>
                      All user content downloads in the system.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <ScrollArea className="h-[300px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {downloads.map((download) => (
                              <TableRow key={download.id}>
                                <TableCell>{download.id}</TableCell>
                                <TableCell>{download.email}</TableCell>
                                <TableCell className="max-w-[150px] truncate">{download.articleTitle}</TableCell>
                                <TableCell>{new Date(download.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Badge variant={download.downloadSent ? "default" : "secondary"}>
                                    {download.downloadSent ? "Sent" : "Pending"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SearchIcon className="h-5 w-5 text-primary" />
                      Searches
                    </CardTitle>
                    <CardDescription>
                      Recent search terms and results.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <ScrollArea className="h-[300px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Search Term</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Results</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {searches.map((search) => (
                              <TableRow key={search.id}>
                                <TableCell>{search.id}</TableCell>
                                <TableCell>{search.searchTerm}</TableCell>
                                <TableCell>{new Date(search.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{search.summariesCount}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Statistics</CardTitle>
                  <CardDescription>Overview of system activity and performance.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground">
                          {users.filter(u => u.role === "Admin").length} Admins, {users.filter(u => u.role === "Standard").length} Standard, {users.filter(u => u.role === "Basic").length} Basic
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{downloads.length}</div>
                        <p className="text-xs text-muted-foreground">
                          {downloads.filter(d => d.downloadSent).length} sent, {downloads.filter(d => !d.downloadSent).length} pending
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{searches.length}</div>
                        <p className="text-xs text-muted-foreground">
                          Avg. {searches.reduce((acc, s) => acc + s.summariesCount, 0) / searches.length || 0} summaries per search
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user account details.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={selectedUser.firstName} 
                    onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={selectedUser.lastName} 
                    onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={selectedUser.username} 
                  onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(value) => setSelectedUser({...selectedUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Basic">Basic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
            <Button onClick={confirmEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && `Are you sure you want to delete ${selectedUser.firstName} ${selectedUser.lastName}'s account? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account in the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="newFirstName">First Name</Label>
                <Input 
                  id="newFirstName" 
                  value={newUser.firstName} 
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newLastName">Last Name</Label>
                <Input 
                  id="newLastName" 
                  value={newUser.lastName} 
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newEmail">Email</Label>
              <Input 
                id="newEmail" 
                type="email"
                value={newUser.username} 
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Password</Label>
              <Input 
                id="newPassword" 
                type="password"
                value={newUser.password} 
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newRole">Role</Label>
              <Select 
                value={newUser.role} 
                onValueChange={(value) => setNewUser({...newUser, role: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail View */}
      {isViewingUser && userDetail && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <UserCircle className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{userDetail.firstName} {userDetail.lastName}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {userDetail.username}
                    <Badge variant={userDetail.role === "Admin" ? "destructive" : userDetail.role === "Standard" ? "default" : "secondary"}>
                      {userDetail.role}
                    </Badge>
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsViewingUser(false)} className="rounded-full h-8 w-8 p-0">
                <span className="sr-only">Close</span>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 flex-1 overflow-auto">
              <div className="grid gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    Downloaded Content
                  </h3>
                  {userDetail.content?.downloads?.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userDetail.content.downloads.map((download: any) => (
                            <TableRow key={download.id}>
                              <TableCell className="font-medium">{download.articleTitle}</TableCell>
                              <TableCell>{new Date(download.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge variant={download.downloadSent ? "default" : "secondary"}>
                                  {download.downloadSent ? "Sent" : "Pending"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-muted/50 rounded-md">
                      <div className="flex justify-center mb-2">
                        <Download className="h-10 w-10 text-muted-foreground opacity-50" />
                      </div>
                      <p className="text-muted-foreground">No downloaded content found.</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <SearchIcon className="h-5 w-5 text-primary" />
                    Search History
                  </h3>
                  {userDetail.content?.searches?.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Search Term</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Summaries</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userDetail.content.searches.map((searchItem: any) => (
                            <TableRow key={searchItem.search.id}>
                              <TableCell className="font-medium">{searchItem.search.searchTerm}</TableCell>
                              <TableCell>{new Date(searchItem.search.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>{searchItem.summaries.length}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-muted/50 rounded-md">
                      <div className="flex justify-center mb-2">
                        <SearchIcon className="h-10 w-10 text-muted-foreground opacity-50" />
                      </div>
                      <p className="text-muted-foreground">No search history found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsViewingUser(false)}>Close</Button>
              <Button variant="outline" onClick={() => handleEditUser(userDetail)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading overlay for user detail */}
      {loadingUserDetail && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="text-sm font-medium">Loading user details...</p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}