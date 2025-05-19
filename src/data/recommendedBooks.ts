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
  {
    id: 'af001',
    title: 'O jeito Warren Buffett de investir',
    author: 'Robert G. Hagstrom',
    amazonLink: 'https://amzn.to/3XzLpXq',
    category: 'finance',
    description: 'Descubra os princípios de investimento do bilionário Warren Buffett e como aplicá-los.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/41i25nS8xOL._SY445_SX342_.jpg'
  },
  {
    id: 'af002',
    title: 'Ações comuns, lucros incomuns',
    author: 'Philip A. Fisher',
    amazonLink: 'https://amzn.to/4aUEXqV',
    category: 'finance',
    description: 'Um guia clássico para encontrar empresas de crescimento e investir com visão de longo prazo.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/513u5oODTgL._SY445_SX342_.jpg'
  },
  {
    id: 'af003',
    title: 'O mais importante para o investidor',
    author: 'Howard Marks',
    amazonLink: 'https://amzn.to/4ezN9JJ',
    category: 'finance',
    description: 'Lições essenciais sobre risco, ciclos de mercado e a psicologia do investimento.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/41ZLzWzXG9L._SY445_SX342_.jpg'
  },
  {
    id: 'af004',
    title: 'Os segredos da mente milionária',
    author: 'T. Harv Eker',
    amazonLink: 'https://amzn.to/3Xyx7xN',
    category: 'finance',
    description: 'Aprenda a reprogramar seu mindset financeiro para alcançar a prosperidade.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/81ZnJcgjA7L._SY466_.jpg'
  },
  {
    id: 'af016',
    title: 'A Magia da Sequência de Fibonacci',
    author: 'João Vieira de Aguiar',
    amazonLink: 'https://amzn.to/3H4iz4n',
    category: 'finance',
    description: 'Descubra os segredos e aplicações da sequência de Fibonacci.',
    coverImageUrl: ''
  },
  {
    id: 'af006',
    title: 'Do mil ao milhão',
    author: 'Thiago Nigro',
    amazonLink: 'https://amzn.to/3Rwb0rF',
    category: 'finance',
    description: 'Um guia prático para quem quer sair das dívidas e começar a investir, sem cortar o cafezinho.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/71uM8nWkUrL._SY466_.jpg'
  },
  {
    id: 'af007',
    title: 'O investidor de bom senso',
    author: 'John C. Bogle',
    amazonLink: 'https://amzn.to/3RBi71P',
    category: 'finance',
    description: 'A estratégia de investimento em fundos de índice para construir riqueza a longo prazo.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/41u8nN5k+pL._SY445_SX342_.jpg'
  },
  {
    id: 'af008',
    title: 'O homem mais rico da Babilônia',
    author: 'George S. Clason',
    amazonLink: 'https://amzn.to/4aYx3M9',
    category: 'finance',
    description: 'Princípios milenares de gestão financeira e acúmulo de riqueza, contados através de parábolas.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/81tAyWa8oFL._SY466_.jpg'
  },
  {
    id: 'af009',
    title: 'A psicologia financeira',
    author: 'Morgan Housel',
    amazonLink: 'https://amzn.to/4aQnN6X',
    category: 'finance',
    description: 'Lições atemporais sobre como as emoções e o comportamento influenciam nossas decisões financeiras.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/71L05Qc1q5L._SY466_.jpg'
  },
  {
    id: 'af010',
    title: 'Quem pensa enriquece',
    author: 'Napoleon Hill',
    amazonLink: 'https://amzn.to/3Xz2jQj',
    category: 'finance',
    description: 'A filosofia clássica do sucesso, baseada nos hábitos de grandes realizadores.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/71e4kdy4L6L._SY466_.jpg'
  },
  {
    id: 'af011',
    title: 'Hackeando Tudo',
    author: 'Raiam Santos',
    amazonLink: 'https://amzn.to/4cjwQWR',
    category: 'coaching',
    description: '90 hábitos para otimizar sua vida e alcançar resultados exponenciais.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/51DBMDSYkLL._SY466_.jpg'
  },
  {
    id: 'af012',
    title: 'O poder do hábito',
    author: 'Charles Duhigg',
    amazonLink: 'https://amzn.to/4c2T2gq',
    category: 'self-help',
    description: 'Entenda a ciência por trás dos hábitos e como transformá-los para melhorar sua vida.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/71KeO2tkF5L._SY466_.jpg'
  },
  {
    id: 'af014',
    title: 'Os Axiomas de Zurique',
    author: 'Max Gunther',
    amazonLink: 'https://amzn.to/3zq4yLC',
    category: 'finance',
    description: 'As regras de ouro dos banqueiros suíços para investir e especular com sucesso.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/41oX1H6dJEL._SY445_SX342_.jpg'
  },
  {
    id: 'af015',
    title: 'Cartas a um Jovem Investidor',
    author: 'Gustavo Cerbasi',
    amazonLink: 'https://amzn.to/3KNcWfX',
    category: 'finance',
    description: 'Conselhos e estratégias de um dos maiores educadores financeiros do Brasil para iniciantes.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/41n7GgF0voL._SY445_SX342_.jpg'
  },
  {
    id: 'af013',
    title: 'Oportunidades Disfarçadas',
    author: 'Carlos Domingos',
    amazonLink: 'https://amzn.to/4mogUqk',
    category: 'coaching',
    description: 'Como transformar problemas em grandes oportunidades de negócio e inovação.',
    coverImageUrl: 'https://m.media-amazon.com/images/I/51Y9yFpQxAL._SY445_SX342_.jpg'
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
