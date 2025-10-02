
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BookOpenCheck, Shield, User as UserIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';

const ADMIN_EMAIL = 'admin@boardprep.pro';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  

  useEffect(() => {
    if (!isUserLoading && user) {
        if (user.email === ADMIN_EMAIL) {
             router.push('/admin');
        } else {
             router.push('/home');
        }
    }
  }, [user, isUserLoading, router]);


  const handleAdminLogin = async () => {
    setError('');
    if (!adminPassword) {
      setError('Please enter the admin password.');
      return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, adminPassword);
      toast({ title: "Admin Login Successful!", description: "Redirecting..." });
    } catch (e: any) {
      setError('Incorrect admin password.');
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Incorrect password.' });
    }
  };

  const handleMemberLogin = async () => {
    setError('');
    if (!email || !memberPassword) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, memberPassword);
      const loggedInUser = userCredential.user;

      const userDocRef = doc(firestore, 'users', loggedInUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists() || !userDoc.data()?.hasPaid) {
        await auth.signOut();
        setError('Login failed. Please contact admin for payment confirmation.');
        toast({ variant: 'destructive', title: 'Payment Required', description: 'Please contact the administrator to activate your account.' });
        return;
      }

      toast({ title: "Login Successful!", description: "Redirecting..." });
    } catch (e: any) {
      console.error(e);
      let errorMessage = 'Invalid credentials or login failed.';
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      }
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Login Failed', description: errorMessage });
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
              setAdminPassword('');
              setEmail('');
              setMemberPassword('');
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="member"><UserIcon className="mr-2 h-4 w-4" /> Member</TabsTrigger>
                <TabsTrigger value="admin"><Shield className="mr-2 h-4 w-4" /> Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="member" className="pt-6 space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="member@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-member">Password</Label>
                    <Input
                      id="password-member"
                      type="password"
                      value={memberPassword}
                      onChange={(e) => setMemberPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                  </div>
                 <p className="text-xs text-center text-muted-foreground pt-2">
                  An admin must create your account before you can log in.
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
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                  />
                </div>
              </TabsContent>
            </Tabs>
            {error && <p className="text-sm text-center text-destructive pt-4">{error}</p>}
          </CardContent>
          <CardFooter>
            {role === 'admin' ? (
              <Button onClick={handleAdminLogin} className="w-full text-lg">Login</Button>
            ) : (
              <Button onClick={handleMemberLogin} className="w-full text-lg">Login</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
