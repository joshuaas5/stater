
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import { Bill } from '@/types';
import { getBills, isLoggedIn, markBillAsPaid } from '@/utils/localStorage';
import { formatCurrency, getOverdueBills, getBillsDueInNextDays } from '@/utils/dataProcessing';
import { useToast } from '@/hooks/use-toast';
import { CalendarCheck, Clock, CreditCard, FileText, FileMinus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BillsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [overdueBills, setOverdueBills] = useState<Bill[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<Bill[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue' | 'all'>('upcoming');
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
    markBillAsPaid(billId);
    toast({
      title: "Conta marcada como paga",
      description: "A conta foi marcada como paga com sucesso.",
    });
    loadBills();
  };
  
  const handleAddBill = () => {
    navigate('/add-bill');
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
        return <FileText className="text-galileo-text" size={24} />;
      case 'dívidas':
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

  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader title="Contas a Pagar" showSearch={false} />
      
      <div className="flex justify-between px-4 py-2">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md ${activeTab === 'upcoming' ? 'bg-galileo-accent text-galileo-text' : 'text-galileo-secondaryText'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            A Vencer
          </button>
          <button
            className={`px-3 py-1 rounded-md ${activeTab === 'overdue' ? 'bg-galileo-accent text-galileo-text' : 'text-galileo-secondaryText'}`}
            onClick={() => setActiveTab('overdue')}
          >
            Vencidas
          </button>
          <button
            className={`px-3 py-1 rounded-md ${activeTab === 'all' ? 'bg-galileo-accent text-galileo-text' : 'text-galileo-secondaryText'}`}
            onClick={() => setActiveTab('all')}
          >
            Todas
          </button>
        </div>
        
        <Button 
          size="sm" 
          variant="default" 
          className="bg-galileo-accent hover:bg-galileo-secondaryText text-galileo-text"
          onClick={handleAddBill}
        >
          <Plus size={16} className="mr-1" /> Nova
        </Button>
      </div>
      
      <div className="mt-4">
        {getBillsToDisplay().length > 0 ? (
          getBillsToDisplay().map((bill) => (
            <div key={bill.id} className="flex items-center gap-4 bg-galileo-background px-4 min-h-[72px] py-2 justify-between border-b border-galileo-border">
              <div className="flex items-center gap-4">
                <div className="text-galileo-text flex items-center justify-center rounded-lg bg-galileo-accent shrink-0 size-12">
                  {renderBillIcon(bill.category, bill.isCardBill)}
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-galileo-text text-base font-medium leading-normal line-clamp-1">
                    {bill.title}
                  </p>
                  <p className="text-galileo-secondaryText text-sm font-normal leading-normal">
                    {formatDueDate(bill.dueDate)}
                    {bill.totalInstallments && (
                      <span className="ml-2">
                        ({bill.currentInstallment}/{bill.totalInstallments})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-galileo-negative text-base font-normal leading-normal">
                  {formatCurrency(bill.amount)}
                </p>
                {!bill.isPaid && (
                  <button
                    onClick={() => handleMarkAsPaid(bill.id)}
                    className="text-galileo-positive text-sm flex items-center"
                  >
                    <CalendarCheck size={14} className="mr-1" /> Pagar
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-galileo-secondaryText">
            <p>Nenhuma conta {activeTab === 'upcoming' ? 'a vencer' : activeTab === 'overdue' ? 'vencida' : ''} encontrada</p>
          </div>
        )}
      </div>
      
      <NavBar />
    </div>
  );
};

export default BillsPage;
