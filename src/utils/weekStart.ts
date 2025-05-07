// Utilitário para obter o dia de início da semana baseado nas preferências do usuário
import { getUserPreferences } from '@/utils/localStorage';

export function getWeekStartDay(): 0 | 1 {
  // 0 = Domingo, 1 = Segunda
  const prefs = getUserPreferences();
  if (prefs && prefs.weekStartsOn === 'sunday') return 0;
  return 1;
}

// Função para gerar as semanas de um mês, respeitando o início configurado
type Week = { start: Date; end: Date; label: string };

export function getWeeksInMonth(month = new Date().getMonth(), year = new Date().getFullYear()): Week[] {
  const weekStart = getWeekStartDay();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let current = new Date(firstDay);
  const weeks: Week[] = [];

  // Ajusta para o início da semana
  while (current.getDay() !== weekStart) {
    current.setDate(current.getDate() - 1);
  }

  while (current <= lastDay) {
    const weekStartDate = new Date(current);
    const weekEndDate = new Date(current);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    weeks.push({
      start: new Date(weekStartDate),
      end: new Date(Math.min(weekEndDate.getTime(), lastDay.getTime())),
      label: `${weekStartDate.getDate()}/${weekStartDate.getMonth() + 1} - ${Math.min(weekEndDate.getDate(), lastDay.getDate())}/${weekEndDate.getMonth() + 1}`
    });
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}
