import type { QuizCategory } from './types';
import allQuestionsData from './all-questions.json';

export const quizCategories: QuizCategory[] = [
  {
    slug: 'physics',
    name: 'Physics',
    description: 'Test your knowledge on motion, energy, electricity, and the laws that govern the universe.',
    imageId: 'physics-img',
  },
  {
    slug: 'chemistry',
    name: 'Chemistry',
    description: 'Explore chemical reactions, the periodic table, acids, bases, and the building blocks of matter.',
    imageId: 'chemistry-img',
  },
  {
    slug: 'biology',
    name: 'Biology',
    description: 'Dive into the world of living organisms, from cellular processes to complex ecosystems.',
    imageId: 'biology-img',
  },
  {
    slug: 'mathematics',
    name: 'Mathematics',
    description: 'Sharpen your skills in algebra, geometry, trigonometry, and statistical analysis.',
    imageId: 'math-img',
  },
  {
    slug: 'history',
    name: 'History',
    description: 'Journey through time and test your knowledge of major world events and civilizations.',
    imageId: 'history-img',
  },
  {
    slug: 'geography',
    name: 'Geography',
    description: 'Discover the Earth\'s landscapes, environments, and the relationship between people and their planet.',
    imageId: 'geography-img',
  },
  {
    slug: 'hindi',
    name: 'Hindi',
    description: 'Test your knowledge of Hindi grammar, vocabulary, and literature.',
    imageId: 'hindi-img',
  },
  {
    slug: 'english',
    name: 'English',
    description: 'Challenge your command of English grammar, vocabulary, and comprehension.',
    imageId: 'english-img',
  },
];

// Note: In a real application, these would be fetched from a database.
// The questions are now sourced from a JSON file to simulate a mutable data source.
export const allQuestions = allQuestionsData.questions;
