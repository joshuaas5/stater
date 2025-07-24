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
import { Bill, CardItem, EXPENSE_CATEGORIES } from '@/types';
import { getCurrentUser, saveBill } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, CreditCard, Plus, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NavBar from '@/components/navigation/NavBar';
import { UserPlanManager } from '@/utils/userPlanManager';

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
  const [userId] = useState<string>('user_001'); // TODO: Pegar do contexto de auth
  
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
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
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
      billsToSave.forEach(b => saveBill(b));
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
    }
    
    // REMOVIDO: Incremento de uso movido para o AddBillModal para evitar duplicação
    // UserPlanManager.incrementUsage(userId, 'billsAdded').catch(error => {
    //   console.error('Erro ao incrementar uso de bills:', error);
    // });
    
    // Navegar de volta para a página de bills (sem toast de notificação)
    navigate('/bills');
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-20" style={{ background: '#31518b' }}>
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
        <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">Título</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Aluguel, Conta de Luz..." 
                        {...field} 
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
            <FormField
              control={form.control}
              name="isCardBill"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-galileo-text">Fatura de Cartão de Crédito</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
                    <FormLabel className="text-white font-medium">Valor</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="R$ 0,00" 
                        {...field} 
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-xl p-4">
                  <h3 className="text-white font-medium mb-2">Itens da Fatura</h3>
                  
                  {cardItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center mb-2 p-2 bg-white/10 border-white/20 rounded">
                      <div className="text-white">{item.description}</div>
                      <div className="flex items-center">
                        <span className="text-white mr-2">
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
                  <FormLabel className="text-white font-medium">Categoria</FormLabel>
                  <FormControl>
                    <Select 
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-white/40">
                        <SelectValue placeholder="Selecione uma categoria" className="text-white" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#31518b] border-white/20">
                        {EXPENSE_CATEGORIES.map((category) => (
                          <SelectItem 
                            key={category} 
                            value={category.toLowerCase()}
                            className="text-white hover:bg-white/10 focus:bg-white/10"
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <FormLabel className="text-white font-medium">Data de Vencimento</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="date"
                        {...field}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 appearance-none"
                      />
                      <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-white/40" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/20 bg-white/10 p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-white font-medium">Conta Recorrente</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
                    <FormItem className="bg-white/10 border-white/20 p-4 rounded-lg border shadow">
                      <FormLabel className="text-white font-medium">Número de Parcelas</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder={isInfiniteRecurrence ? "Não aplicável (Sem Fim Definido)" : "Ex: 12"} 
                          {...field}
                          value={field.value || ''}
                          disabled={isInfiniteRecurrence}
                          className={`bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 ${isInfiniteRecurrence ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                      </FormControl>
                      {!isInfiniteRecurrence && (
                        <FormDescription className="text-xs text-white/70">
                          Deixe em branco para uma única parcela.
                        </FormDescription>
                      )}
                      <FormMessage />
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/20 bg-white/10 p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-white font-medium">Notificações</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-white text-[#31518b] hover:bg-white/90 font-semibold py-3 rounded-lg transition-all duration-300"
            >
              Salvar Conta
            </Button>
            </form>
          </Form>
        </div>
      </div>
      <NavBar />
    </div>
  );
};

export default AddBillPage;
