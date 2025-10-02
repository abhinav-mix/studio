"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { KeyRound } from 'lucide-react';

const CORRECT_PASSWORD = 'abhinavashishclass11';
const AUTH_KEY = 'boardprep_authenticated';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === CORRECT_PASSWORD) {
      setError('');
      try {
        localStorage.setItem(AUTH_KEY, 'true');
        router.push('/home');
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
          <CardDescription>Please enter the password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
