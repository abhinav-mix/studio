import type { Question, QuizCategory } from './types';

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
];

// Note: In a real application, these would be fetched from a database.
// This is a sample set of 20 questions for each of the 6 categories.

export const allQuestions: Question[] = [
  // Physics Questions (20)
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `phy-${i + 1}`,
    questionText: `What is the SI unit of electric current? Sample question ${i + 1}.`,
    options: ['Volt', 'Ampere', 'Ohm', 'Watt'],
    correctAnswerIndex: 1,
    explanation: 'The SI unit of electric current is the Ampere (A). It is named after André-Marie Ampère, a French mathematician and physicist.',
    category: 'physics',
  })),
  // Chemistry Questions (20)
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `chem-${i + 1}`,
    questionText: `What is the chemical formula for water? Sample question ${i + 1}.`,
    options: ['CO2', 'O2', 'H2O', 'NaCl'],
    correctAnswerIndex: 2,
    explanation: 'The chemical formula for water is H2O, which indicates that each molecule of water contains two hydrogen atoms and one oxygen atom.',
    category: 'chemistry',
  })),
  // Biology Questions (20)
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `bio-${i + 1}`,
    questionText: `What is the powerhouse of the cell? Sample question ${i + 1}.`,
    options: ['Nucleus', 'Ribosome', 'Mitochondrion', 'Chloroplast'],
    correctAnswerIndex: 2,
    explanation: 'Mitochondria are known as the powerhouses of the cell. They are organelles that act like a digestive system which takes in nutrients, breaks them down, and creates energy rich molecules for the cell.',
    category: 'biology',
  })),
  // Mathematics Questions (20)
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `math-${i + 1}`,
    questionText: `What is the value of Pi (π) to two decimal places? Sample question ${i + 1}.`,
    options: ['3.12', '3.14', '3.16', '3.18'],
    correctAnswerIndex: 1,
    explanation: 'The value of Pi (π) is approximately 3.14159. To two decimal places, it is rounded to 3.14.',
    category: 'mathematics',
  })),
  // History Questions (20)
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `hist-${i + 1}`,
    questionText: `Who was the first President of the United States? Sample question ${i + 1}.`,
    options: ['Abraham Lincoln', 'Thomas Jefferson', 'George Washington', 'John Adams'],
    correctAnswerIndex: 2,
    explanation: 'George Washington was the first President of the United States, serving from 1789 to 1797.',
    category: 'history',
  })),
  // Geography Questions (20)
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `geo-${i + 1}`,
    questionText: `What is the longest river in the world? Sample question ${i + 1}.`,
    options: ['Amazon River', 'Nile River', 'Yangtze River', 'Mississippi River'],
    correctAnswerIndex: 1,
    explanation: 'The Nile River is traditionally considered the longest river in the world, flowing for about 6,650 kilometers (4,132 miles).',
    category: 'geography',
  })),
];

// To make questions slightly more unique for demonstration
allQuestions[0].questionText = "What is the SI unit of force?";
allQuestions[0].options = ["Joule", "Watt", "Newton", "Pascal"];
allQuestions[0].correctAnswerIndex = 2;
allQuestions[0].explanation = "The SI unit of force is the Newton (N), named after Sir Isaac Newton. It's defined as the force needed to accelerate one kilogram of mass at the rate of one meter per second squared.";

allQuestions[20].questionText = "Which element has the atomic number 1?";
allQuestions[20].options = ["Helium", "Oxygen", "Hydrogen", "Carbon"];
allQuestions[20].correctAnswerIndex = 2;
allQuestions[20].explanation = "Hydrogen has the atomic number 1, meaning it has one proton in its nucleus. It is the simplest and most abundant element in the universe.";

allQuestions[40].questionText = "Which part of the plant is responsible for photosynthesis?";
allQuestions[40].options = ["Root", "Stem", "Flower", "Leaf"];
allQuestions[40].correctAnswerIndex = 3;
allQuestions[40].explanation = "Leaves are the primary sites for photosynthesis in most plants. They contain chlorophyll, the pigment that captures light energy.";

allQuestions[60].questionText = "What is the square root of 144?";
allQuestions[60].options = ["10", "11", "12", "14"];
allQuestions[60].correctAnswerIndex = 2;
allQuestions[60].explanation = "The square root of 144 is 12, because 12 multiplied by 12 equals 144.";

allQuestions[80].questionText = "In which year did the World War I begin?";
allQuestions[80].options = ["1914", "1918", "1939", "1945"];
allQuestions[80].correctAnswerIndex = 0;
allQuestions[80].explanation = "World War I began in 1914 after the assassination of Archduke Franz Ferdinand of Austria.";

allQuestions[100].questionText = "Which is the largest continent by land area?";
allQuestions[100].options = ["Africa", "North America", "Asia", "Europe"];
allQuestions[100].correctAnswerIndex = 2;
allQuestions[100].explanation = "Asia is the largest continent by both land area and population. It covers about 30% of Earth's total land area.";
