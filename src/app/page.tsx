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
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');

  const handleLogin = () => {
    let isAuthenticated = false;
    if (role === 'member' && password === MEMBER_PASSWORD) {
      isAuthenticated = true;
    } else if (role === 'admin' && password === ADMIN_PASSWORD) {
      isAuthenticated = true;
    }

    if (isAuthenticated) {
      setError('');
      try {
        const session = { authenticated: true, role };
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
          <CardDescription>Please select your role and enter the password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="member" onValueChange={(value) => setRole(value as 'member' | 'admin')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="member"><User className="mr-2 h-4 w-4" /> Member</TabsTrigger>
              <TabsTrigger value="admin"><Shield className="mr-2 h-4 w-4" /> Admin</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
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
