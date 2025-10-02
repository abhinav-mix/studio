"use client";

import Header from '@/components/Header';
import { quizCategories } from '@/lib/questions';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AUTH_KEY = 'boardprep_authenticated';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const isAuthenticated = localStorage.getItem(AUTH_KEY) === 'true';
      if (!isAuthenticated) {
        router.push('/');
      }
    } catch (e) {
      router.push('/');
    }
  }, [router]);

  const categoryImages = PlaceHolderImages.reduce((acc, img) => {
    acc[img.id] = img;
    return acc;
  }, {} as Record<string, (typeof PlaceHolderImages)[0]>);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-headline text-foreground">
                Welcome to BoardPrep Pro
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Your ultimate companion for Class 10 board exam preparation. Choose a category below to start your quiz.
              </p>
            </div>
          </div>
        </section>
        <section className="w-full pb-12 md:pb-24 lg:pb-32">
          <div className="container grid gap-6 md:gap-8 px-4 md:px-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {quizCategories.map((category) => {
                const image = categoryImages[category.imageId];
                return (
                  <Card
                    key={category.slug}
                    className="flex flex-col overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl rounded-xl group"
                  >
                    <div className="overflow-hidden">
                      {image && (
                        <Image
                          alt={category.name}
                          className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          height={225}
                          src={image.imageUrl}
                          width={400}
                          data-ai-hint={image.imageHint}
                        />
                      )}
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold font-headline">{category.name}</h3>
                      <p className="text-muted-foreground mt-2 flex-1">{category.description}</p>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      <Button asChild className="w-full" variant="default">
                        <Link href={`/quiz/${category.slug}`}>
                          Start Quiz <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center p-6 border-t bg-card">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} BoardPrep Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}
