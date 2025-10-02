"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { KeyRound, Shield, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MEMBER_PASSWORD = 'abhinavashishclass11';
const ADMIN_PASSWORD = 'abhiabhiabhiabhi';
const AUTH_KEY = 'boardprep_session';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');

  const handleLogin = () => {
    setError('');
    let isAuthenticated = false;
    const adminName = 'Abhinav Yadav';

    if (role === 'member') {
      if (!name.trim()) {
        setError('Please enter your name.');
        return;
      }
      if (password === MEMBER_PASSWORD) {
        isAuthenticated = true;
      }
    } else if (role === 'admin') {
      if (password === ADMIN_PASSWORD) {
        isAuthenticated = true;
      }
    }

    if (isAuthenticated) {
      try {
        const session = { authenticated: true, role, name: role === 'member' ? name : adminName };
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/home');
        }
      } catch (e) {
        setError('Could not save session. Please enable cookies/localStorage.');
      }
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <KeyRound className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">Welcome to BoardPrep Pro</CardTitle>
          <CardDescription>Please select your role and enter your credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="member" onValueChange={(value) => {
            setRole(value as 'member' | 'admin');
            setError('');
            setPassword('');
            setName('');
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="member"><User className="mr-2 h-4 w-4" /> Member</TabsTrigger>
              <TabsTrigger value="admin"><Shield className="mr-2 h-4 w-4" /> Admin</TabsTrigger>
            </TabsList>
            <TabsContent value="member" className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-member">Password</Label>
                <Input
                  id="password-member"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your password"
                />
              </div>
            </TabsContent>
            <TabsContent value="admin" className="pt-6 space-y-4">
               <div className="space-y-2">
                <Label htmlFor="name-admin">Name</Label>
                <Input
                  id="name-admin"
                  type="text"
                  value="Abhinav Yadav"
                  readOnly
                  className="bg-muted"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="password-admin">Password</Label>
                <Input
                  id="password-admin"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter admin password"
                />
              </div>
            </TabsContent>
          </Tabs>
          {error && <p className="text-sm text-destructive pt-2">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
