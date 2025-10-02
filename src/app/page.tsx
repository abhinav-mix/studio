"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BookOpenCheck, Shield, User as UserIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';


const ADMIN_EMAIL = 'admin@boardprep.pro';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [name, setName] = useState('');

  // Redirect if user is already logged in
  useEffect(() => {
    if (!isUserLoading && user) {
        if (user.email === ADMIN_EMAIL) {
             router.push('/admin');
        } else {
             router.push('/home');
        }
    }
  }, [user, isUserLoading, router]);


  const handleLogin = async () => {
    setError('');
    let loginEmail = email;

    if (role === 'admin') {
      loginEmail = ADMIN_EMAIL;
      if (!password) {
        setError('Please enter the admin password.');
        return;
      }
    } else { // role === 'member'
      if (!email) {
        setError('Please enter an email.');
        return;
      }
      if (!password) {
        setError('Please enter a password.');
        return;
      }
      if (!name.trim()) {
        setError('Please enter your name.');
        return;
      }
    }
    
    try {
        await signInWithEmailAndPassword(auth, loginEmail, password);
         toast({
            title: "Login Successful!",
            description: "Redirecting...",
        });

    } catch (e: any) {
        if (e.code === 'auth/user-not-found' && role === 'member') {
             try {
                const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, password);
                await updateProfile(userCredential.user, { displayName: name });
                
                toast({
                    title: "Account Created!",
                    description: "You've been signed up and logged in.",
                });
             } catch (signUpError: any) {
                setError(signUpError.message);
                toast({ variant: 'destructive', title: 'Sign Up Failed', description: signUpError.message });
             }
        } else if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
            setError('Incorrect email or password. Please try again.');
            toast({ variant: 'destructive', title: 'Login Failed', description: 'Incorrect email or password.'});
        } else {
             setError(e.message);
             toast({ variant: 'destructive', title: 'Login Failed', description: e.message });
        }
    }
  };
  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  if (isUserLoading || (!isUserLoading && user)) {
      return <div className="flex items-center justify-center min-h-screen bg-background">Loading...</div>
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="hidden bg-gradient-primary-to-accent lg:flex lg:flex-col items-center justify-center text-primary-foreground p-12">
        <div className="text-center space-y-4">
            <BookOpenCheck className="h-20 w-20 mx-auto" />
            <h1 className="text-5xl font-bold font-headline">Welcome to BoardPrep Pro</h1>
            <p className="text-xl text-primary-foreground/80">
              Your journey to board exam excellence starts here. Login to access tailored quizzes and track your progress.
            </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md mx-auto shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Sign In</CardTitle>
            <CardDescription>Select your role and enter your credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="member" onValueChange={(value) => {
              setRole(value as 'member' | 'admin');
              setError('');
              setPassword('');
              setEmail('');
              setName('');
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="member"><UserIcon className="mr-2 h-4 w-4" /> Member</TabsTrigger>
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
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-member">Email</Label>
                  <Input
                    id="email-member"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="name@example.com"
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
                 <p className="text-xs text-center text-muted-foreground pt-2">
                  If you don't have an account, one will be created for you automatically.
                </p>
              </TabsContent>

              <TabsContent value="admin" className="pt-6 space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="name-admin">Name</Label>
                  <Input
                    id="name-admin"
                    type="text"
                    value="Abhinav Yadav"
                    disabled
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
            {error && <p className="text-sm text-center text-destructive pt-4">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button onClick={handleLogin} className="w-full text-lg">
              Login / Sign Up
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
