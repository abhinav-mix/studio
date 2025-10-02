
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { quizCategories } from '@/lib/questions';
import type { Question } from '@/lib/types';
import allQuestionsData from '@/lib/all-questions.json';
import { PlusCircle, Trash2, LogOut, Home, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// This is a placeholder for a real API call. In a real app, this would be a server action.
async function updateQuestions(questions: Question[]) {
  console.log("Updating questions (simulated):", questions);
  // In a real scenario, you'd make a POST request to a server-side endpoint.
  // For this example, we'll just log it. A more advanced version could write back to the filesystem (requires server-side code).
  alert("This is a demo. Question persistence is not implemented. Changes will be lost on refresh.");
}


export default function AdminPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>(allQuestionsData.questions);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserClass, setNewUserClass] = useState('');
  
  useEffect(() => {
    // Admin check logic will be updated later to be more robust
    if (!isUserLoading && (!user || user.email !== 'bhainew124@gmail.com')) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUserName || !newUserClass) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill out all fields for the new member.',
      });
      return;
    }

    const currentAdminUser = auth.currentUser;

    if (!currentAdminUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'Admin user not found.' });
        return;
    }
    const adminPassword = prompt("Please enter your admin password to confirm.");
    if (!adminPassword) return;


    try {
      // 1. Create the new user with the provided email and password.
      const userCredential = await createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword);
      const newUser = userCredential.user;

      // 2. Create the user's document in Firestore and mark them as paid.
      const userDocRef = doc(firestore, 'users', newUser.uid);
      await setDoc(userDocRef, {
        id: newUser.uid,
        email: newUserEmail,
        displayName: newUserName,
        userClass: newUserClass,
        hasPaid: true, // Admin-created users are marked as paid
      });

      toast({
        title: 'User Created Successfully!',
        description: `User ${newUserEmail} has been created and marked as paid.`,
      });
      
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserClass('');

    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Failed to create user.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The password is too weak. It should be at least 6 characters.';
      }
      toast({
        variant: 'destructive',
        title: 'Failed to Create User',
        description: errorMessage,
      });
    } finally {
        // Sign the admin back in to restore the admin session
        if (auth.currentUser?.email !== currentAdminUser.email) {
            try {
              await signInWithEmailAndPassword(auth, "bhainew124@gmail.com", adminPassword);
            } catch (reauthError: any) {
              toast({
                variant: "destructive",
                title: "Admin Re-authentication Failed",
                description: "Please log out and log back in.",
              });
              router.push('/');
            }
        }
    }
  };


  const handleAddQuestion = (category: string) => {
    const newQuestion: Question = {
      id: `new-${Date.now()}`,
      questionText: 'New Question',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswerIndex: 0,
      explanation: 'Explanation for the new question.',
      category,
    };
    setQuestions([newQuestion, ...questions]);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };
  
  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSaveChanges = async () => {
    try {
      await updateQuestions(questions);
      toast({
        title: 'Success!',
        description: 'Your changes have been saved (simulated).',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save changes.',
      });
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push('/');
  };
  
  if (isUserLoading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading Admin Panel...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin Panel</h1>
          <p className="text-muted-foreground">Welcome, {user.displayName || user.email}</p>
        </div>
        <div>
           <Button variant="ghost" asChild className="mr-4">
              <Link href="/home"><Home className="mr-2"/> Member View</Link>
           </Button>
           <Button onClick={handleLogout} variant="outline"><LogOut className="mr-2"/> Logout</Button>
        </div>
      </header>
      
      <div className="mb-6 flex justify-end">
        <Button onClick={handleSaveChanges} variant="default">Save All Changes</Button>
      </div>

      <Accordion type="multiple" defaultValue={['user-management']} className="w-full space-y-4">
        <AccordionItem value="user-management" className="border-none">
          <Card className="bg-secondary/30">
            <AccordionTrigger className="p-6 text-xl font-headline hover:no-underline">
              <div className="flex justify-between w-full items-center">
                <span>User Management</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
               <Card className="bg-background/80 w-full max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>Create New Paid Member</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <Label htmlFor="new-user-name">Member Name</Label>
                      <Input id="new-user-name" type="text" placeholder="Abhinav Yadav" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="new-user-class">Member Class</Label>
                      <Input id="new-user-class" type="text" placeholder="10th" value={newUserClass} onChange={(e) => setNewUserClass(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="new-user-email">Member Email</Label>
                      <Input id="new-user-email" type="email" placeholder="member@example.com" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-user-password">Member Password</Label>
                      <Input id="new-user-password" type="text" placeholder="Enter a temporary password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button onClick={handleAddUser}><UserPlus className="mr-2"/> Create Paid Member</Button>
                  </div>
                </CardContent>
               </Card>
            </AccordionContent>
          </Card>
        </AccordionItem>
        {quizCategories.map(category => {
          const categoryQuestions = questions.filter(q => q.category === category.slug);
          return (
            <AccordionItem value={category.slug} key={category.slug} className="border-none">
                <Card className="bg-secondary/30">
                   <AccordionTrigger className="p-6 text-xl font-headline hover:no-underline">
                        <div className="flex justify-between w-full items-center">
                           <span>{category.name} ({categoryQuestions.length} questions)</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                        <div className="space-y-6">
                            {categoryQuestions.map((q) => (
                              <Card key={q.id} className="bg-background/80">
                                <CardHeader>
                                  <CardTitle className="flex justify-between items-start">
                                    <Textarea
                                      value={q.questionText}
                                      onChange={(e) => handleQuestionChange(q.id, 'questionText', e.target.value)}
                                      className="text-lg font-semibold flex-grow mr-4 bg-background"
                                      rows={2}
                                    />
                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteQuestion(q.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {q.options.map((opt, index) => (
                                      <div key={index} className="flex items-center gap-2">
                                        <Label htmlFor={`${q.id}-opt-${index}`} className="w-20">Option {index + 1}</Label>
                                        <Input
                                          id={`${q.id}-opt-${index}`}
                                          value={opt}
                                          onChange={(e) => handleOptionChange(q.id, index, e.target.value)}
                                          className={q.correctAnswerIndex === index ? 'border-green-500 bg-green-50' : 'bg-background'}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                     <div>
                                        <Label htmlFor={`${q.id}-category`}>Category</Label>
                                        <Select
                                          value={q.category}
                                          onValueChange={(value) => handleQuestionChange(q.id, 'category', value)}
                                        >
                                          <SelectTrigger id={`${q.id}-category`} className="bg-background">
                                            <SelectValue placeholder="Select category" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {quizCategories.map(cat => (
                                               <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                     </div>
                                     <div>
                                        <Label htmlFor={`${q.id}-correct`}>Correct Answer</Label>
                                        <Select
                                          value={q.correctAnswerIndex.toString()}
                                          onValueChange={(value) => handleQuestionChange(q.id, 'correctAnswerIndex', parseInt(value))}
                                        >
                                          <SelectTrigger id={`${q.id}-correct`} className="bg-background">
                                            <SelectValue placeholder="Select correct answer" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {q.options.map((_, index) => (
                                              <SelectItem key={index} value={index.toString()}>Option {index + 1}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                     </div>
                                  </div>
                                  <div>
                                    <Label htmlFor={`${q.id}-explanation`}>Explanation</Label>
                                    <Textarea
                                      id={`${q.id}-explanation`}
                                      value={q.explanation}
                                      onChange={(e) => handleQuestionChange(q.id, 'explanation', e.target.value)}
                                      className="bg-background"
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                             <div className="mt-6 flex justify-start">
                                <Button onClick={() => handleAddQuestion(category.slug)}><PlusCircle className="mr-2"/> Add Question to {category.name}</Button>
                            </div>
                        </div>
                    </AccordionContent>
                </Card>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
