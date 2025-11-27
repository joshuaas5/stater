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
import { AdManager } from '@/utils/adManager';
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
    
    // 🎯 NOVA ESTRATÉGIA: Sistema de contador de bills para reward ads
    try {
      // Verificar se o usuário é premium
      const userPlan = await UserPlanManager.getUserPlan(user.id);
      const isPremium = userPlan.planType !== 'free';
      
      if (!isPremium) {
        // Para bills recorrentes, incrementar o contador apenas uma vez (não por parcela)
        const incrementCount = values.isRecurring && !values.isInfiniteRecurrence && totalInstallments > 1 ? 1 : billsAdded;
        
        // Incrementar contador baseado na quantidade de bills únicas criadas
        for (let i = 0; i < incrementCount; i++) {
          const counterResult = await BillCounter.incrementAndCheck(user.id);
          
          if (counterResult.shouldShowRewardAd) {
            console.log('🎬 [BILL_REWARD] Mostrando reward ad após 3 bills');
            
            // Mostrar reward ad específico para bills
            const adResult = await AdManager.showRewardedAd('bills');
            
            if (adResult.success) {
              console.log('✅ [BILL_REWARD] Reward ad assistido com sucesso');
              toast({
                title: '🎁 Recompensa obtida!',
                description: 'Você ganhou mais recursos por assistir o anúncio!',
              });
            } else {
              console.log('❌ [BILL_REWARD] Reward ad não assistido');
            }
            break; // Apenas um reward ad por operação
          } else {
            console.log(`📋 [BILL_COUNTER] ${counterResult.nextRewardAt} bills restantes para próximo reward ad`);
          }
        }
      }
    } catch (error) {
      console.error('❌ [BILL_REWARD] Erro ao processar contador:', error);
    }
    
    // Navegar de volta para a página de bills
    navigate('/bills');
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-32" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #31518b 50%, #4a6fa5 100%)' }}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-4 px-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/bills')}
            className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-300 group"
          >
            <ArrowLeft className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Nova Conta
            </h1>
            <p className="text-sm text-white/60 mt-0.5">
              Adicione uma conta a pagar
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Card Principal - Informações Básicas */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-5 space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/90 text-sm font-medium">Título da conta</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Aluguel, Luz, Internet..." 
                        {...field} 
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 focus:bg-white/10 rounded-xl h-12 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Toggle Fatura de Cartão */}
              <FormField
                control={form.control}
                name="isCardBill"
                render={({ field }) => (
                  <FormItem>
                    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${field.value ? 'bg-purple-500/20 border-purple-400/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      onClick={() => field.onChange(!field.value)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${field.value ? 'bg-purple-500/30' : 'bg-white/10'}`}>
                          <CreditCard className={`h-5 w-5 ${field.value ? 'text-purple-300' : 'text-white/60'}`} />
                        </div>
                        <span className={`font-medium ${field.value ? 'text-purple-200' : 'text-white/80'}`}>
                          Fatura de Cartão
                        </span>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              {/* Valor ou Itens do Cartão */}
              {!isCardBill ? (
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90 text-sm font-medium">Valor</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-sm font-medium">R$</span>
                          <Input 
                            placeholder="0,00" 
                            {...field} 
                            className="bg-white/5 border-white/10 text-white text-lg font-semibold placeholder:text-white/30 focus:border-white/30 focus:bg-white/10 rounded-xl h-14 pl-12 transition-all"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 text-sm font-medium">Itens da Fatura</span>
                    <span className="text-xs text-white/50">{cardItems.length} {cardItems.length === 1 ? 'item' : 'itens'}</span>
                  </div>
                  
                  {/* Lista de itens */}
                  {cardItems.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {cardItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 group">
                          <span className="text-white/90 text-sm truncate flex-1 mr-2">{item.description}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-sm whitespace-nowrap">
                              R$ {item.amount.toFixed(2).replace('.', ',')}
                            </span>
                            <button 
                              type="button"
                              onClick={() => handleRemoveCardItem(item.id)}
                              className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Adicionar item */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Descrição do item"
                      value={cardItemDescription}
                      onChange={(e) => setCardItemDescription(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-11 flex-1"
                    />
                    <Input
                      placeholder="0,00"
                      value={cardItemAmount}
                      onChange={(e) => setCardItemAmount(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-11 w-24"
                    />
                    <Button 
                      type="button"
                      onClick={handleAddCardItem}
                      className="h-11 w-11 p-0 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl"
                    >
                      <Plus size={18} className="text-white" />
                    </Button>
                  </div>
                  
                  {/* Total */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
                    <span className="text-white/80 font-medium">Total da Fatura</span>
                    <span className="text-white text-xl font-bold">
                      R$ {cardItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2).replace('.', ',')}
                    </span>
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
            </div>

            {/* Card Categoria e Data */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-5 space-y-4">
              {/* Categoria com dropdown melhorado */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/90 text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4 text-white/60" />
                      Categoria
                    </FormLabel>
                    <FormControl>
                      <div className="relative category-dropdown">
                        <button
                          type="button"
                          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                          className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl transition-all duration-200 outline-none text-white flex items-center justify-between hover:bg-white/10 focus:border-white/30"
                        >
                          <span className={field.value ? 'text-white' : 'text-white/40'}>
                            {field.value ? EXPENSE_CATEGORIES.find(cat => cat.toLowerCase() === field.value) || field.value : 'Selecione uma categoria'}
                          </span>
                          <ChevronDown className={`h-4 w-4 transition-transform text-white/50 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isCategoryDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-2 border border-white/20 rounded-xl shadow-2xl z-50 max-h-64 overflow-hidden bg-[#31518b]/98 backdrop-blur-xl">
                            <div className="p-3 border-b border-white/10">
                              <div className="relative">
                                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                                <input
                                  type="text"
                                  placeholder="Buscar..."
                                  value={categorySearchTerm}
                                  onChange={(e) => setCategorySearchTerm(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/10 border border-white/10 rounded-lg focus:border-white/30 outline-none text-white placeholder-white/40"
                                  autoFocus={isCategoryDropdownOpen}
                                />
                              </div>
                            </div>
                            
                            <div className="max-h-44 overflow-y-auto py-1">
                              {filteredCategories.length > 0 ? (
                                filteredCategories.map((category) => (
                                  <button
                                    key={category}
                                    type="button"
                                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                                      field.value === category.toLowerCase() 
                                        ? 'bg-white/20 text-white font-medium' 
                                        : 'text-white/80 hover:bg-white/10'
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
                                <div className="px-4 py-3 text-sm text-white/50 text-center">
                                  Nenhuma categoria
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
              
              {/* Data de Vencimento */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/90 text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-white/60" />
                      Data de Vencimento
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="bg-white/5 border-white/10 text-white focus:border-white/30 focus:bg-white/10 rounded-xl h-12 transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Card Opções */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-5 space-y-3">
              <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Opções</span>
              
              {/* Conta Recorrente */}
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem>
                    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${field.value ? 'bg-blue-500/20 border-blue-400/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      onClick={() => field.onChange(!field.value)}
                    >
                      <span className={`font-medium ${field.value ? 'text-blue-200' : 'text-white/80'}`}>
                        Conta Recorrente
                      </span>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
              
              {/* Opções de Recorrência */}
              {isRecurring && (
                <div className="space-y-3 pl-2 border-l-2 border-blue-400/30 ml-2">
                  <FormField
                    control={form.control}
                    name="totalInstallments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80 text-sm">Número de Parcelas</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder={isInfiniteRecurrence ? "Sem limite" : "Ex: 12"} 
                            {...field}
                            value={field.value || ''}
                            disabled={isInfiniteRecurrence}
                            className={`bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-11 ${isInfiniteRecurrence ? 'opacity-40' : ''}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isInfiniteRecurrence"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-3 py-1">
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
                              className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                            />
                          </FormControl>
                          <label 
                            htmlFor="isInfiniteRecurrenceCheckbox"
                            className="text-sm text-white/80 cursor-pointer"
                          >
                            Sem fim definido (assinatura)
                          </label>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Notificações */}
              <FormField
                control={form.control}
                name="notificationsEnabled"
                render={({ field }) => (
                  <FormItem>
                    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${field.value ? 'bg-emerald-500/20 border-emerald-400/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      onClick={() => field.onChange(!field.value)}
                    >
                      <span className={`font-medium ${field.value ? 'text-emerald-200' : 'text-white/80'}`}>
                        Receber Notificações
                      </span>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            {/* Botão Salvar */}
            <Button 
              type="submit" 
              className="w-full bg-white text-[#31518b] hover:bg-white/95 font-bold py-4 h-14 rounded-2xl transition-all duration-300 shadow-lg shadow-black/20 text-base"
            >
              Salvar Conta
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddBillPage;
