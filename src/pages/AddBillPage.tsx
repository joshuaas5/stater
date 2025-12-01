import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from "@/components/ui/checkbox";
import { Bill, CardItem, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types';
import { getCurrentUser, saveBill } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, CreditCard, Plus, X, Tag, ChevronDown, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlanManager } from '@/utils/userPlanManager';
import { BillCounter } from '@/utils/billCounter';
import { scheduleBillNotifications } from '@/utils/pushNotifications';

const formSchema = z.object({
  title: z.string().min(2, { message: "Título deve ter pelo menos 2 caracteres." }),
  amount: z.string().refine(value => /^\d+([,\.]\d{1,2})?$/.test(value.replace(',', '.')), { message: "Valor inválido." }),
  category: z.string().min(1, { message: "Selecione uma categoria." }),
  dueDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Data inválida" }),
  isRecurring: z.boolean().default(false),
  isInfiniteRecurrence: z.boolean().default(false),
  totalInstallments: z.string().optional(),
  notificationsEnabled: z.boolean().default(true),
  isCardBill: z.boolean().default(false),
});

const AddBillPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cardItems, setCardItems] = useState<CardItem[]>([]);
  const [cardItemDescription, setCardItemDescription] = useState('');
  const [cardItemAmount, setCardItemAmount] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  
  // States para o sistema de dropdown de categorias (igual ao TransactionModal)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  
  // Filtrar categorias com base na busca
  const filteredCategories = EXPENSE_CATEGORIES.filter(category =>
    category.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );
  
  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.category-dropdown')) {
        setIsCategoryDropdownOpen(false);
        setCategorySearchTerm('');
      }
    };

    if (isCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryDropdownOpen]);
  
  // Inicializar usuário do Supabase
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Erro ao obter usuário:', error);
          navigate('/login');
          return;
        }
        
        setUserId(user.id);
        console.log('🔐 [ADD_BILL] Usuário autenticado:', user.id);
      } catch (error) {
        console.error('Erro na inicialização do usuário:', error);
        navigate('/login');
      }
    };

    initializeUser();
  }, [navigate]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      amount: '',
      category: 'outros',
      dueDate: '',
      isRecurring: false,
      isInfiniteRecurrence: false,
      totalInstallments: '',
      notificationsEnabled: true,
      isCardBill: false
    }
  });
  
  const isCardBill = form.watch('isCardBill');
  const isRecurring = form.watch('isRecurring');
  const isInfiniteRecurrence = form.watch('isInfiniteRecurrence');
  
  const handleAddCardItem = () => {
    if (cardItemDescription && cardItemAmount) {
      const amount = parseFloat(cardItemAmount.replace(',', '.'));
      
      if (isNaN(amount)) {
        toast({
          title: "Erro",
          description: "Valor inválido",
          variant: "destructive"
        });
        return;
      }
      
      const newItem: CardItem = {
        id: uuidv4(),
        description: cardItemDescription,
        amount
      };
      
      setCardItems([...cardItems, newItem]);
      setCardItemDescription('');
      setCardItemAmount('');
      
      // Atualizar o valor total da fatura
      const totalAmount = cardItems.reduce((sum, item) => sum + item.amount, 0) + amount;
      form.setValue('amount', totalAmount.toString());
    }
  };
  
  const handleRemoveCardItem = (id: string) => {
    const updatedItems = cardItems.filter(item => item.id !== id);
    setCardItems(updatedItems);
    
    // Atualizar o valor total da fatura
    const totalAmount = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    form.setValue('amount', totalAmount.toString());
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    
    const amount = parseFloat(values.amount.replace(',', '.'));
    
    if (isNaN(amount)) {
      toast({
        title: "Erro",
        description: "Valor inválido",
        variant: "destructive"
      });
      return;
    }
    
    const originalDueDate = new Date(values.dueDate + 'T00:00:00');
    const recurringDay = originalDueDate.getDate();
    const totalInstallments = values.isRecurring && !values.isInfiniteRecurrence && values.totalInstallments ? parseInt(values.totalInstallments) : 1;

    let billsAdded = 0;

    if (values.isRecurring && !values.isInfiniteRecurrence && totalInstallments > 1) {
      const billsToSave: Bill[] = [];
      const originalBillIdForAllInstallments = uuidv4();

      for (let i = 0; i < totalInstallments; i++) {
        const installmentDueDate = new Date(originalDueDate);
        installmentDueDate.setMonth(originalDueDate.getMonth() + i);
        const lastDayOfMonth = new Date(installmentDueDate.getFullYear(), installmentDueDate.getMonth() + 1, 0).getDate();
        installmentDueDate.setDate(Math.min(recurringDay, lastDayOfMonth));

        const billInstallment: Bill = {
          id: uuidv4(),
          originalBillId: originalBillIdForAllInstallments,
          title: `${values.title} (${i + 1}/${totalInstallments})`,
          amount,
          dueDate: installmentDueDate,
          isRecurring: true,
          category: values.category,
          userId: user.id,
          isPaid: false,
          totalInstallments: totalInstallments, 
          currentInstallment: i + 1,
          notificationsEnabled: values.notificationsEnabled,
          isCardBill: values.isCardBill,
          cardItems: values.isCardBill && i === 0 ? cardItems : undefined,
          recurringDay: recurringDay,
          isInfiniteRecurrence: false
        };
        billsToSave.push(billInstallment);
      }
      billsToSave.forEach(b => {
        saveBill(b);
        // Agendar notificações push para cada parcela
        if (b.notificationsEnabled) {
          scheduleBillNotifications(b).catch(console.error);
        }
      });
      billsAdded = billsToSave.length;
    } else {
      const newBill: Bill = {
        id: uuidv4(),
        title: values.title,
        amount,
        dueDate: originalDueDate,
        isRecurring: values.isRecurring,
        category: values.category,
        userId: user.id,
        isPaid: false,
        totalInstallments: values.isRecurring && !values.isInfiniteRecurrence && totalInstallments > 1 ? totalInstallments : undefined,
        currentInstallment: values.isRecurring && !values.isInfiniteRecurrence && totalInstallments > 1 ? 1 : undefined,
        notificationsEnabled: values.notificationsEnabled,
        isCardBill: values.isCardBill,
        cardItems: values.isCardBill ? cardItems : undefined,
        recurringDay: values.isRecurring ? recurringDay : undefined,
        isInfiniteRecurrence: values.isRecurring ? values.isInfiniteRecurrence : undefined
      };
      saveBill(newBill);
      billsAdded = 1;
      
      // Agendar notificações push para a conta
      if (newBill.notificationsEnabled) {
        scheduleBillNotifications(newBill).catch(console.error);
      }
    }
    
    // Incrementar contador para analytics
    try {
      const userPlan = await UserPlanManager.getUserPlan(user.id);
      const isPremium = userPlan.planType !== 'free';
      
      if (!isPremium) {
        const incrementCount = values.isRecurring && !values.isInfiniteRecurrence && totalInstallments > 1 ? 1 : billsAdded;
        for (let i = 0; i < incrementCount; i++) {
          await BillCounter.incrementAndCheck(user.id);
        }
      }
    } catch (error) {
      console.error('Erro ao processar contador:', error);
    }
    
    // Navegar de volta para a página de bills
    navigate('/bills');
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-32 bg-[#31518b] lg:bg-transparent">
      {/* Header */}
      <div className="relative z-10 bg-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/bills')}
              className="p-2 text-white hover:text-white hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">
                Adicionar Conta
              </h1>
              <p className="text-sm text-white/70">
                Cadastre uma nova conta a pagar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4">
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/90 font-semibold text-sm">Título</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Aluguel, Conta de Luz..." 
                        {...field} 
                        className="h-12 rounded-xl text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/30 transition-all"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.12)', 
                          border: '1.5px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
            
            <FormField
              control={form.control}
              name="isCardBill"
              render={({ field }) => (
                <FormItem 
                  className="flex flex-row items-center justify-between rounded-xl p-4"
                  style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1.5px solid rgba(255, 255, 255, 0.15)' }}
                >
                  <div className="space-y-0.5">
                    <FormLabel className="text-white font-semibold">Fatura de Cartão de Crédito</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {!isCardBill ? (
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/90 font-semibold text-sm">Valor</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="R$ 0,00" 
                        {...field} 
                        className="h-12 rounded-xl text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/30 transition-all text-lg font-medium"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.12)', 
                          border: '1.5px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl p-4" style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1.5px solid rgba(255, 255, 255, 0.15)' }}>
                  <h3 className="text-white font-semibold mb-3">Itens da Fatura</h3>
                  
                  {cardItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center mb-2 p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                      <div className="text-white">{item.description}</div>
                      <div className="flex items-center">
                        <span className="text-white font-medium mr-2">
                          R$ {item.amount.toFixed(2).replace('.', ',')}
                        </span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveCardItem(item.id)}
                          className="text-red-300 hover:text-red-200"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 flex gap-2">
                    <Input
                      placeholder="Descrição"
                      value={cardItemDescription}
                      onChange={(e) => setCardItemDescription(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                    <Input
                      placeholder="R$ 0,00"
                      value={cardItemAmount}
                      onChange={(e) => setCardItemAmount(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleAddCardItem}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-white font-medium">
                      R$ {cardItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-white flex items-center gap-2">
                    <Tag className="h-4 w-4 text-white/80" />
                    Categoria
                  </FormLabel>
                  <FormControl>
                    <div className="relative category-dropdown">
                      <button
                        type="button"
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all duration-200 outline-none font-medium text-white flex items-center justify-between border-white/20 focus:border-white/40 focus:shadow-lg focus:shadow-white/10`}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <span className={field.value ? 'text-white' : 'text-white/50'}>
                          {field.value ? EXPENSE_CATEGORIES.find(cat => cat.toLowerCase() === field.value) || field.value : 'Selecione uma categoria'}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform text-white/70 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isCategoryDropdownOpen && (
                        <div 
                          className="absolute top-full left-0 right-0 mt-1 border rounded-xl shadow-lg z-50 max-h-60 overflow-hidden"
                          style={{
                            background: 'rgba(49, 81, 139, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderColor: 'rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          {/* Campo de busca */}
                          <div className="p-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                            <div className="relative">
                              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                              <input
                                type="text"
                                placeholder="Buscar categoria..."
                                value={categorySearchTerm}
                                onChange={(e) => setCategorySearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:border-white/40 outline-none text-white placeholder-white/50"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  backdropFilter: 'blur(10px)',
                                  borderColor: 'rgba(255, 255, 255, 0.2)'
                                }}
                                autoFocus={isCategoryDropdownOpen}
                              />
                            </div>
                          </div>
                          
                          {/* Lista de categorias */}
                          <div className="max-h-40 overflow-y-auto">
                            {filteredCategories.length > 0 ? (
                              filteredCategories.map((category) => (
                                <button
                                  key={category}
                                  type="button"
                                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors ${
                                    field.value === category.toLowerCase() ? 'bg-white/20 text-white font-medium' : 'text-white/90'
                                  }`}
                                  onClick={() => {
                                    field.onChange(category.toLowerCase());
                                    setIsCategoryDropdownOpen(false);
                                    setCategorySearchTerm('');
                                  }}
                                >
                                  {category}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-white/60 text-center">
                                Nenhuma categoria encontrada
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/90 font-semibold text-sm">Data de Vencimento</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="date"
                        {...field}
                        className="h-12 rounded-xl text-white focus:ring-2 focus:ring-white/30 transition-all pr-10"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.12)', 
                          border: '1.5px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          colorScheme: 'dark'
                        }}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 pointer-events-none" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem 
                  className="flex flex-row items-center justify-between rounded-xl p-4"
                  style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1.5px solid rgba(255, 255, 255, 0.15)' }}
                >
                  <div className="space-y-0.5">
                    <FormLabel className="text-white font-semibold">Conta Recorrente</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {isRecurring && (
              <>
                {/* Campo Número de Parcelas - Aparece se isRecurring, mas fica desabilitado se isInfiniteRecurrence estiver marcado */}
                <FormField
                  control={form.control}
                  name="totalInstallments"
                  render={({ field }) => (
                    <FormItem 
                      className="p-4 rounded-xl"
                      style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1.5px solid rgba(255, 255, 255, 0.15)' }}
                    >
                      <FormLabel className="text-white/90 font-semibold text-sm">Número de Parcelas</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder={isInfiniteRecurrence ? "Não aplicável (Sem Fim Definido)" : "Ex: 12"} 
                          {...field}
                          value={field.value || ''}
                          disabled={isInfiniteRecurrence}
                          className={`h-12 rounded-xl text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/30 transition-all ${isInfiniteRecurrence ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.12)', 
                            border: '1.5px solid rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)'
                          }}
                        />
                      </FormControl>
                      {!isInfiniteRecurrence && (
                        <FormDescription className="text-xs text-white/60 mt-1">
                          Deixe em branco para uma única parcela.
                        </FormDescription>
                      )}
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />

                {/* Campo Sem Fim Definido - Aparece se isRecurring */}
                <FormField
                  control={form.control}
                  name="isInfiniteRecurrence"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 py-2 rounded-md">
                      <FormControl>
                        <Checkbox
                          id="isInfiniteRecurrenceCheckbox"
                          checked={field.value}
                          onCheckedChange={(checkedState) => {
                            const isChecked = Boolean(checkedState);
                            field.onChange(isChecked);
                            if (isChecked) {
                              form.setValue('totalInstallments', '', { shouldValidate: true });
                            }
                          }}
                          className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-[#31518b]"
                        />
                      </FormControl>
                      <div className="grid gap-1.5 leading-none">
                        <FormLabel 
                          htmlFor="isInfiniteRecurrenceCheckbox"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white cursor-pointer"
                        >
                          Sem Fim Definido
                        </FormLabel>
                        <FormDescription className="text-xs text-white/70">
                          Para contas sem um número fixo de parcelas (ex: assinatura).
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="notificationsEnabled"
              render={({ field }) => (
                <FormItem 
                  className="flex flex-row items-center justify-between rounded-xl p-4"
                  style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1.5px solid rgba(255, 255, 255, 0.15)' }}
                >
                  <div className="space-y-0.5">
                    <FormLabel className="text-white font-semibold">Notificações</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold rounded-xl transition-all duration-300 shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none'
              }}
            >
              Salvar Conta
            </Button>
            </form>
          </Form>
        </div>
      </div>
      
      {/* O NavBar foi movido para o PersistentLayout.tsx */}
    </div>
  );
};

export default AddBillPage;
