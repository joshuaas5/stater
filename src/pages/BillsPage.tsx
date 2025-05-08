
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import { Bill, CardItem } from '@/types';
import { getBills, isLoggedIn, markBillAsPaid, saveBill, updateBill } from '@/utils/localStorage';
import { formatCurrency, getOverdueBills, getBillsDueInNextDays } from '@/utils/dataProcessing';
import { useToast } from '@/hooks/use-toast';
import { 
  CalendarCheck, Clock, CreditCard, FileText, FileMinus, Plus, 
  Bell, BellOff, Edit, MoreVertical, Trash, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

const BillsPage: React.FC = () => {
  // ...
  const handleDeleteBill = (billId: string) => {
  console.log('Tentando excluir conta com id:', billId);
  if (window.confirm('Tem certeza que deseja excluir esta conta? Esta ação não poderá ser desfeita.')) {
    deleteBill(billId);
    setTimeout(() => {
      loadBills();
      console.log('Contas recarregadas após exclusão');
    }, 100);
    toast({
      title: 'Conta excluída',
      description: 'A conta foi removida com sucesso.',
    });
  }
};

  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [overdueBills, setOverdueBills] = useState<Bill[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<Bill[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue' | 'all'>('upcoming');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    // Carregar as contas do usuário
    loadBills();
  }, [navigate]);
  
  const loadBills = () => {
    const userBills = getBills();
    setBills(userBills);
    setOverdueBills(getOverdueBills(userBills));
    setUpcomingBills(getBillsDueInNextDays(userBills, 30));
  };
  
  const handleMarkAsPaid = (billId: string) => {
    markBillAsPaid(billId, (bill) => {
      toast({
        title: `Conta paga: ${bill.title}`,
        description: `A conta foi marcada como paga com sucesso.`,
      });
      loadBills();
    });
  };
  
  const handleAddBill = () => {
    navigate('/add-bill');
  };

  const handleToggleNotifications = (bill: Bill) => {
    const updatedBill = {
      ...bill,
      notificationsEnabled: !bill.notificationsEnabled
    };
    
    updateBill(updatedBill);
    setSelectedBill(updatedBill);
    loadBills();
    
    toast({
      title: updatedBill.notificationsEnabled ? "Notificações ativadas" : "Notificações desativadas",
      description: updatedBill.notificationsEnabled 
        ? "Você receberá notificações sobre esta conta."
        : "Você não receberá mais notificações sobre esta conta."
    });
  };
  
  const handleOpenNotificationSettings = (bill: Bill) => {
    setSelectedBill(bill);
    setShowNotificationSettings(true);
  };

  const handleUpdateNotificationDays = (days: number[]) => {
    if (!selectedBill) return;

    const updatedBill = {
      ...selectedBill,
      notificationDays: days
    };
    
    updateBill(updatedBill);
    setSelectedBill(updatedBill);
    
    toast({
      title: "Configurações atualizadas",
      description: "Suas preferências de notificação foram salvas."
    });
  };
  
  const getBillsToDisplay = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingBills;
      case 'overdue':
        return overdueBills;
      case 'all':
        return bills;
      default:
        return upcomingBills;
    }
  };
  
  const renderBillIcon = (category: string, isCardBill: boolean = false) => {
    if (isCardBill) {
      return <CreditCard className="text-galileo-text" size={24} />;
    }
    
    switch (category.toLowerCase()) {
      case 'moradia':
      case 'aluguel':
      case 'habitação':
        return <FileText className="text-galileo-text" size={24} />;
      case 'dívidas':
      case 'pagamentos de dívidas':
        return <FileMinus className="text-galileo-text" size={24} />;
      default:
        return <Clock className="text-galileo-text" size={24} />;
    }
  };
  
  const formatDueDate = (date: Date) => {
    const dueDate = new Date(date);
    const today = new Date();
    
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Vencida há ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'dia' : 'dias'}`;
    } else if (diffDays === 0) {
      return 'Vence hoje';
    } else if (diffDays === 1) {
      return 'Vence amanhã';
    } else {
      return `Vence em ${diffDays} dias`;
    }
  };

  // Notification checkbox handlers
  const [customDays, setCustomDays] = useState<number[]>([5, 3, 1]);
  const [newCustomDay, setNewCustomDay] = useState<number>(2);
  const [showAddCustomDay, setShowAddCustomDay] = useState(false);

  const handleToggleDay = (day: number) => {
    if (!selectedBill) return;
    
    const currentDays = selectedBill.notificationDays || [5, 1];
    let newDays: number[];
    
    if (currentDays.includes(day)) {
      newDays = currentDays.filter(d => d !== day);
    } else {
      newDays = [...currentDays, day].sort((a, b) => b - a);
    }
    
    handleUpdateNotificationDays(newDays);
  };

  const handleAddCustomDay = () => {
    if (!selectedBill || newCustomDay < 1) return;
    
    const currentDays = selectedBill.notificationDays || [5, 1];
    if (currentDays.includes(newCustomDay)) {
      toast({
        title: "Dia já incluído",
        description: `Notificação para ${newCustomDay} dia(s) antes já está ativa.`
      });
      return;
    }
    
    const newDays = [...currentDays, newCustomDay].sort((a, b) => b - a);
    handleUpdateNotificationDays(newDays);
    setNewCustomDay(2);
    setShowAddCustomDay(false);
  };

  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader title="Contas a Pagar" showSearch={false} />
      
      <div className="flex justify-between px-4 py-2 bg-galileo-background">
        <div className="flex bg-galileo-card rounded-lg p-1">
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'upcoming' ? 'bg-galileo-accent text-white' : 'text-galileo-secondaryText'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            A Vencer
          </button>
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'overdue' ? 'bg-galileo-negative text-white' : 'text-galileo-secondaryText'}`}
            onClick={() => setActiveTab('overdue')}
          >
            Vencidas
          </button>
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'all' ? 'bg-galileo-accent text-white' : 'text-galileo-secondaryText'}`}
            onClick={() => setActiveTab('all')}
          >
            Todas
          </button>
        </div>
        
        <Button 
          size="sm" 
          variant="default" 
          className="bg-galileo-accent hover:bg-galileo-accent/80 text-white"
          onClick={handleAddBill}
        >
          <Plus size={16} className="mr-1" /> Nova
        </Button>
      </div>
      
      <div className="mt-4 pb-16">
        {getBillsToDisplay().length > 0 ? (
          getBillsToDisplay().map((bill) => (
            <Card key={bill.id} className="mx-4 mb-3 overflow-hidden border border-galileo-border">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 px-4 py-3">
                  <div className={`text-white flex items-center justify-center rounded-lg ${bill.isPaid ? 'bg-green-500' : activeTab === 'overdue' ? 'bg-galileo-negative' : 'bg-galileo-accent'} shrink-0 size-12`}>
                    {renderBillIcon(bill.category, bill.isCardBill)}
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-galileo-text text-base font-medium leading-normal line-clamp-1">
                        {bill.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className={`text-base font-semibold leading-normal ${bill.isPaid ? 'text-green-500' : 'text-galileo-negative'}`}>
                          {formatCurrency(bill.amount)}
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
  <DropdownMenuItem onClick={() => handleOpenNotificationSettings(bill)}>
    <Bell className="mr-2 h-4 w-4" />
    <span>Configurar Notificações</span>
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => handleToggleNotifications(bill)}>
    {bill.notificationsEnabled ? (
      <>
        <BellOff className="mr-2 h-4 w-4" />
        <span>Desativar Notificações</span>
      </>
    ) : (
      <>
        <Bell className="mr-2 h-4 w-4" />
        <span>Ativar Notificações</span>
      </>
    )}
  </DropdownMenuItem>
  {!bill.isPaid && (
    <DropdownMenuItem onClick={() => handleMarkAsPaid(bill.id)}>
      <CalendarCheck className="mr-2 h-4 w-4" />
      <span>Marcar como Paga</span>
    </DropdownMenuItem>
  )}
  <DropdownMenuItem className="text-galileo-negative" onClick={() => handleDeleteBill(bill.id)}>
    <Trash className="mr-2 h-4 w-4" />
    <span>Excluir Conta</span>
  </DropdownMenuItem>
</DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex items-center flex-wrap gap-2 mt-1">
                      <Badge variant="outline" className="bg-galileo-card text-galileo-text text-xs">
                        {formatDueDate(bill.dueDate)}
                      </Badge>
                      
                      {bill.category && (
                        <Badge variant="outline" className="bg-galileo-card/50 text-galileo-secondaryText text-xs">
                          {bill.category}
                        </Badge>
                      )}
                      
                      {bill.isRecurring && (
                        <Badge variant="outline" className="bg-galileo-accent/10 text-galileo-accent text-xs flex items-center gap-1">
                          <Calendar size={12} />
                          {bill.recurringDay ? `Dia ${bill.recurringDay}` : 'Recorrente'}
                        </Badge>
                      )}
                      
                      {bill.totalInstallments && (
                        <Badge variant="outline" className="bg-galileo-accent/10 text-galileo-accent text-xs">
                          Parcela {bill.currentInstallment}/{bill.totalInstallments}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {bill.cardItems && bill.cardItems.length > 0 && (
                  <div className="px-4 pt-0 pb-3">
                    <Separator className="my-2" />
                    <p className="text-sm font-medium text-galileo-text mb-2">Itens da fatura:</p>
                    <div className="space-y-2">
                      {bill.cardItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-galileo-card/30 p-2 rounded-md">
                          <div className="flex-1">
                            <p className="text-sm text-galileo-text">{item.description}</p>
                            {item.installments && (
                              <p className="text-xs text-galileo-secondaryText">
                                Parcela {item.installments.current}/{item.installments.total}
                              </p>
                            )}
                          </div>
                          <p className="text-sm font-medium text-galileo-negative">
                            {formatCurrency(item.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {!bill.isPaid && (
                  <div className="flex border-t border-galileo-border">
                    <button
                      onClick={() => handleMarkAsPaid(bill.id)}
                      className="flex-1 py-2 text-white bg-green-500 hover:bg-green-600 font-medium flex items-center justify-center"
                    >
                      <CalendarCheck size={16} className="mr-1" /> Marcar como Pago
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-galileo-secondaryText">
            <FileText size={48} className="mb-2 opacity-40" />
            <p className="text-lg">Nenhuma conta {activeTab === 'upcoming' ? 'a vencer' : activeTab === 'overdue' ? 'vencida' : ''} encontrada</p>
            <p className="text-sm mt-1">Adicione novas contas para gerenciar seus pagamentos</p>
            <Button 
              onClick={handleAddBill}
              variant="outline" 
              className="mt-4"
            >
              <Plus size={16} className="mr-1" /> Adicionar Conta
            </Button>
          </div>
        )}
      </div>
      
      {/* Notification Settings Dialog */}
      <Dialog open={showNotificationSettings} onOpenChange={setShowNotificationSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações de Notificação</DialogTitle>
            <DialogDescription>
              Defina quando deseja receber alertas sobre esta conta
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="font-medium text-galileo-text mb-4">
              {selectedBill?.title} - {formatCurrency(selectedBill?.amount || 0)}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications-enabled" className="font-medium">Notificações Ativadas</Label>
                <Switch 
                  id="notifications-enabled" 
                  checked={selectedBill?.notificationsEnabled || false}
                  onCheckedChange={() => {
                    if (selectedBill) handleToggleNotifications(selectedBill);
                  }}
                />
              </div>
              
              {selectedBill?.notificationsEnabled && (
                <>
                  <div className="border rounded-lg p-4 bg-galileo-card/20">
                    <Label className="font-medium mb-2 block">Receber notificações:</Label>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="notify-5days" 
                          checked={(selectedBill?.notificationDays || [5, 1]).includes(5)}
                          onCheckedChange={() => handleToggleDay(5)}
                        />
                        <Label htmlFor="notify-5days">5 dias antes do vencimento</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="notify-3days" 
                          checked={(selectedBill?.notificationDays || [5, 1]).includes(3)}
                          onCheckedChange={() => handleToggleDay(3)}
                        />
                        <Label htmlFor="notify-3days">3 dias antes do vencimento</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="notify-1day" 
                          checked={(selectedBill?.notificationDays || [5, 1]).includes(1)}
                          onCheckedChange={() => handleToggleDay(1)}
                        />
                        <Label htmlFor="notify-1day">1 dia antes do vencimento</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="notify-0day" 
                          checked={(selectedBill?.notificationDays || [5, 1]).includes(0)}
                          onCheckedChange={() => handleToggleDay(0)}
                        />
                        <Label htmlFor="notify-0day">No dia do vencimento</Label>
                      </div>
                      
                      {/* Lista de dias customizados */}
                      {(selectedBill?.notificationDays || [])
                        .filter(d => ![0, 1, 3, 5].includes(d))
                        .map(day => (
                          <div key={day} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`notify-custom-${day}`} 
                              checked={true}
                              onCheckedChange={() => handleToggleDay(day)}
                            />
                            <Label htmlFor={`notify-custom-${day}`}>{day} dias antes do vencimento</Label>
                          </div>
                        ))
                      }
                      
                      {/* Adicionar dia customizado */}
                      {!showAddCustomDay ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setShowAddCustomDay(true)}
                        >
                          <Plus size={14} className="mr-1" /> Adicionar outro período
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 mt-2">
                          <Input 
                            type="number" 
                            min="1" 
                            max="30"
                            value={newCustomDay} 
                            onChange={(e) => setNewCustomDay(parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                          <span className="text-sm">dias antes</span>
                          <Button 
                            size="sm" 
                            onClick={handleAddCustomDay}
                            disabled={newCustomDay < 1}
                          >
                            Adicionar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowAddCustomDay(false)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setShowNotificationSettings(false)}
              className="bg-galileo-accent hover:bg-galileo-accent/80"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <NavBar />
    </div>
  );
};

export default BillsPage;
