import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getBillsDueSummary } from '@/utils/billNotifications';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';

const BillsDueWidget = () => {
  const { dueToday, dueThisWeek, overdue } = getBillsDueSummary();

  const totalDueToday = dueToday.reduce((sum, bill) => sum + bill.amount, 0);
  const totalDueThisWeek = dueThisWeek.reduce((sum, bill) => sum + bill.amount, 0);

  // Não mostrar contas em atraso no dashboard (apenas hoje e esta semana)
  if (dueToday.length === 0 && dueThisWeek.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Contas em Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600">
            ✅ Todas as suas contas estão em dia!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Contas que Vencem Hoje */}
      {dueToday.length > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Vencem Hoje ({dueToday.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-orange-600">
                R$ {totalDueToday.toFixed(2)}
              </p>
              <div className="space-y-1">
                {dueToday.slice(0, 3).map(bill => (
                  <div key={bill.id} className="text-xs text-orange-700 flex justify-between">
                    <span className="truncate">{bill.title}</span>
                    <span>R$ {bill.amount.toFixed(2)}</span>
                  </div>
                ))}
                {dueToday.length > 3 && (
                  <p className="text-xs text-orange-600">
                    +{dueToday.length - 3} outras contas...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contas que Vencem Esta Semana */}
      {dueThisWeek.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Vencem Esta Semana ({dueThisWeek.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-yellow-600">
                R$ {totalDueThisWeek.toFixed(2)}
              </p>
              <div className="space-y-1">
                {dueThisWeek.slice(0, 3).map(bill => (
                  <div key={bill.id} className="text-xs text-yellow-700 flex justify-between">
                    <span className="truncate">{bill.title}</span>
                    <span>R$ {bill.amount.toFixed(2)}</span>
                  </div>
                ))}
                {dueThisWeek.length > 3 && (
                  <p className="text-xs text-yellow-600">
                    +{dueThisWeek.length - 3} outras contas...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BillsDueWidget;
