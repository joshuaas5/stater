import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getBillsDueSummary } from '@/utils/billNotifications';
import { AlertTriangle, Clock, Calendar, CheckCircle2 } from 'lucide-react';

const BillsDueWidget = () => {
  const { dueToday, dueThisWeek, overdue } = getBillsDueSummary();

  const totalDueToday = dueToday.reduce((sum, bill) => sum + bill.amount, 0);
  const totalDueThisWeek = dueThisWeek.reduce((sum, bill) => sum + bill.amount, 0);

  // Não mostrar contas em atraso no dashboard (apenas hoje e esta semana)
  if (dueToday.length === 0 && dueThisWeek.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-none shadow-sm">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Tudo em dia!</p>
            <p className="text-xs text-gray-500">Nenhuma conta para pagar hoje ou nesta semana.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Contas que Vencem Hoje */}
      {dueToday.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-orange-500 shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 rounded-full">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Vencem Hoje</span>
              </div>
              <span className="text-lg font-bold text-gray-900">R$ {totalDueToday.toFixed(2)}</span>
            </div>
            
            <div className="space-y-2">
              {dueToday.slice(0, 3).map(bill => (
                <div key={bill.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium truncate max-w-[60%]">{bill.title}</span>
                  <span className="text-gray-900 font-semibold">R$ {bill.amount.toFixed(2)}</span>
                </div>
              ))}
              {dueToday.length > 3 && (
                <p className="text-xs text-center text-gray-500 mt-1">
                  +{dueToday.length - 3} outras contas...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contas que Vencem Esta Semana */}
      {dueThisWeek.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-yellow-500 shadow-sm overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-yellow-100 rounded-full">
                  <Calendar className="h-4 w-4 text-yellow-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Vencem Esta Semana</span>
              </div>
              <span className="text-lg font-bold text-gray-900">R$ {totalDueThisWeek.toFixed(2)}</span>
            </div>
            
            <div className="space-y-2">
              {dueThisWeek.slice(0, 3).map(bill => (
                <div key={bill.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium truncate max-w-[60%]">{bill.title}</span>
                  <span className="text-gray-900 font-semibold">R$ {bill.amount.toFixed(2)}</span>
                </div>
              ))}
              {dueThisWeek.length > 3 && (
                <p className="text-xs text-center text-gray-500 mt-1">
                  +{dueThisWeek.length - 3} outras contas...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BillsDueWidget;
