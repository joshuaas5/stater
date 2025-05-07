// Lista das 10 moedas mais importantes/utilizadas no mundo
export const CURRENCIES = [
  { code: 'BRL', symbol: 'R$', name: 'Real', countries: ['BR', 'BRA'] },
  { code: 'USD', symbol: '$', name: 'Dólar Americano', countries: ['US', 'USA', 'UM', 'EC', 'SV', 'GU', 'MH', 'FM', 'MP', 'PW', 'PR', 'TC', 'VG'] },
  { code: 'EUR', symbol: '€', name: 'Euro', countries: ['PT', 'ES', 'FR', 'DE', 'IT', 'NL', 'BE', 'AT', 'FI', 'IE', 'GR', 'LU', 'SI', 'SK', 'EE', 'LV', 'LT', 'CY', 'MT'] },
  { code: 'GBP', symbol: '£', name: 'Libra Esterlina', countries: ['GB', 'UK', 'IM', 'GG', 'JE'] },
  { code: 'JPY', symbol: '¥', name: 'Iene Japonês', countries: ['JP'] },
  { code: 'CNY', symbol: '¥', name: 'Yuan Chinês', countries: ['CN'] },
  { code: 'AUD', symbol: 'A$', name: 'Dólar Australiano', countries: ['AU'] },
  { code: 'CAD', symbol: 'C$', name: 'Dólar Canadense', countries: ['CA'] },
  { code: 'CHF', symbol: 'Fr', name: 'Franco Suíço', countries: ['CH', 'LI'] },
  { code: 'INR', symbol: '₹', name: 'Rúpia Indiana', countries: ['IN'] }
];

// Função para sugerir moeda a partir do país
export function suggestCurrencyByCountry(countryCode: string): string {
  const found = CURRENCIES.find(cur => cur.countries.includes(countryCode.toUpperCase()));
  return found ? found.code : 'USD';
}
