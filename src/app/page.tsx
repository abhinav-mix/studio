
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { BookOpenCheck, Shield, User as UserIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';

const ADMIN_EMAIL = 'admin@boardprep.pro';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // This function sets up the reCAPTCHA verifier.
  const setupRecaptcha = () => {
    if (!auth || !recaptchaContainerRef.current) return;
    
    // Clear any existing verifier to prevent conflicts
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
    }
    
    const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
      'size': 'invisible',
      'callback': (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        // This callback is usually used for auto-solving.
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
      }
    });
    (window as any).recaptchaVerifier = verifier;
  };

  useEffect(() => {
    if (!isUserLoading && user) {
        if (user.email === ADMIN_EMAIL) {
             router.push('/admin');
        } else {
             router.push('/home');
        }
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    // We set up reCAPTCHA as soon as the component loads and auth is available.
    // This ensures it's ready whenever the user decides to log in.
    if (auth) {
      // The setup needs the container to be rendered.
      // A small timeout ensures the DOM is ready.
      const timeoutId = setTimeout(() => setupRecaptcha(), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [auth, role]);


  const handleAdminLogin = async () => {
    setError('');
    if (!password) {
      setError('Please enter the admin password.');
      return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
      toast({ title: "Admin Login Successful!", description: "Redirecting..." });
    } catch (e: any) {
      setError('Incorrect admin password.');
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Incorrect password.' });
    }
  };

  const handlePhoneLogin = async () => {
    setError('');
    if (!phone.startsWith('+')) {
      setError('Phone number must include country code (e.g., +91).');
      return;
    }
    
    // Ensure verifier is set up if it's missing.
    if (!(window as any).recaptchaVerifier) {
        setupRecaptcha();
    }
    const verifier = (window as any).recaptchaVerifier;

    if (!verifier) {
      setError('Recaptcha not initialized. Please try again in a moment.');
      return;
    }

    try {
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmationResult(result);
      setOtpSent(true);
      toast({ title: "OTP Sent!", description: `An OTP has been sent to ${phone}` });
    } catch (e: any)
      {
      console.error(e);
      setError('Failed to send OTP. Please check the phone number or try again.');
      toast({ variant: 'destructive', title: 'OTP Error', description: 'Could not send OTP. You may need to refresh.' });
      // Reset reCAPTCHA on failure
      setupRecaptcha();
    }
  };

  const handleOtpConfirm = async () => {
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }
    if (!confirmationResult) {
      setError('Something went wrong. Please try sending the OTP again.');
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      const loggedInUser = result.user;

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
      setError('Invalid OTP or login failed.');
      toast({ variant: 'destructive', title: 'Login Failed', description: 'The OTP is incorrect.' });
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
              setPhone('');
              setOtp('');
              setOtpSent(false);
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="member"><UserIcon className="mr-2 h-4 w-4" /> Member</TabsTrigger>
                <TabsTrigger value="admin"><Shield className="mr-2 h-4 w-4" /> Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="member" className="pt-6 space-y-4">
                {!otpSent ? (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+919876543210"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter the 6-digit OTP"
                      maxLength={6}
                    />
                  </div>
                )}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                  />
                </div>
              </TabsContent>
            </Tabs>
            <div ref={recaptchaContainerRef}></div>
            {error && <p className="text-sm text-center text-destructive pt-4">{error}</p>}
          </CardContent>
          <CardFooter>
            {role === 'admin' ? (
              <Button onClick={handleAdminLogin} className="w-full text-lg">Login</Button>
            ) : !otpSent ? (
              <Button onClick={handlePhoneLogin} className="w-full text-lg">Send OTP</Button>
            ) : (
              <Button onClick={handleOtpConfirm} className="w-full text-lg">Confirm OTP & Login</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
