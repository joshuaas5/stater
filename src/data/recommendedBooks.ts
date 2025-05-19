export interface Book {
  id: string;
  title: string;
  author: string;
  amazonLink: string;
  category: 'economics' | 'coaching' | 'finance' | 'self-help';
  description?: string; // Optional short description
  coverImageUrl?: string; // Optional direct image link if available
}

const recommendedBooks: Book[] = [
  // Economics
  {
    id: 'rb001',
    title: 'Pai Rico, Pai Pobre',
    author: 'Robert T. Kiyosaki',
    amazonLink: 'https://www.amazon.com.br/dp/8550801488',
    category: 'finance',
    description: 'Transforme sua mentalidade financeira e aprenda a fazer o dinheiro trabalhar para você.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/81D9bTj2wSL._SY466_.jpg'
  },
  {
    id: 'rb002',
    title: 'Os Segredos da Mente Milionária',
    author: 'T. Harv Eker',
    amazonLink: 'https://www.amazon.com.br/dp/8575422391',
    category: 'finance',
    description: 'Aprenda a identificar e modificar seus modelos de dinheiro para alcançar a riqueza.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/81ZnJcgjA7L._SY466_.jpg'
  },
  {
    id: 'rb003',
    title: 'Rápido e Devagar: Duas Formas de Pensar',
    author: 'Daniel Kahneman',
    amazonLink: 'https://www.amazon.com.br/dp/853900383X',
    category: 'economics',
    description: 'Uma exploração fascinante sobre os dois sistemas que moldam nosso julgamento e nossas decisões.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/71QUd+L2mrL._SY466_.jpg'
  },
  {
    id: 'rb004',
    title: 'O Investidor Inteligente',
    author: 'Benjamin Graham',
    amazonLink: 'https://www.amazon.com.br/dp/8595080801',
    category: 'finance',
    description: 'A bíblia do investimento no valor, ensinando princípios atemporais para o sucesso financeiro.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/71XyV+aW5kL._SY466_.jpg'
  },
  // Coaching & Self-Help
  {
    id: 'rb005',
    title: 'O Poder do Hábito',
    author: 'Charles Duhigg',
    amazonLink: 'https://www.amazon.com.br/dp/8539004119',
    category: 'self-help',
    description: 'Descubra a ciência por trás da formação de hábitos e como transformá-los.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/71KeO2tkF5L._SY466_.jpg'
  },
  {
    id: 'rb006',
    title: 'Mindset: A Nova Psicologia do Sucesso',
    author: 'Carol S. Dweck',
    amazonLink: 'https://www.amazon.com.br/dp/8547000240',
    category: 'coaching',
    description: 'Entenda como o mindset de crescimento pode impulsionar todas as áreas da sua vida.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/613u2s2gH-L._SY466_.jpg'
  },
  {
    id: 'rb007',
    title: 'As Armas da Persuasão',
    author: 'Robert B. Cialdini',
    amazonLink: 'https://www.amazon.com.br/dp/857542761X',
    category: 'coaching',
    description: 'Aprenda os princípios psicológicos que levam as pessoas a dizer sim.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/81q5KDHsemL._SY466_.jpg'
  },
  {
    id: 'rb008',
    title: 'Comece Pelo Porquê',
    author: 'Simon Sinek',
    amazonLink: 'https://www.amazon.com.br/dp/8543102919',
    category: 'coaching',
    description: 'Inspire pessoas e equipes a agir descobrindo o seu propósito fundamental.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/6135q77U87L._SY466_.jpg'
  },
  {
    id: 'rb009',
    title: 'Inteligência Emocional',
    author: 'Daniel Goleman',
    amazonLink: 'https://www.amazon.com.br/dp/8539007428',
    category: 'coaching',
    description: 'A teoria revolucionária que redefiniu o que é ser inteligente.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/611aD4i5zFL._SY466_.jpg'
  },
  {
    id: 'rb010',
    title: 'Quem Pensa Enriquece',
    author: 'Napoleon Hill',
    amazonLink: 'https://www.amazon.com.br/dp/8539004739',
    category: 'finance',
    description: 'A obra clássica sobre como alcançar o sucesso e a riqueza através do poder do pensamento.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/71j6Z0A4xNL._SY466_.jpg'
  }
];

/**
 * Calculates the week number of the year for a given date.
 * Ensures that the week starts on Sunday.
 * @param d The date.
 * @returns The week number (1-53).
 */
function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

export function getCurrentBookOfTheWeek(): Book {
  const now = new Date();
  const weekOfYear = getWeekNumber(now);
  const bookIndex = (weekOfYear - 1) % recommendedBooks.length; // -1 because week is 1-indexed
  return recommendedBooks[bookIndex];
}

// Example: Log the current book of the week for testing
// console.log('Book of the week:', getCurrentBookOfTheWeek().title);
