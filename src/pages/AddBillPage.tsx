import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PageHeader from '@/components/header/PageHeader';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bill, CardItem, EXPENSE_CATEGORIES } from '@/types';
import { getCurrentUser, saveBill } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CreditCard, Plus, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  amount: z.string().min(1, "Valor é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
  isRecurring: z.boolean().default(false),
  totalInstallments: z.string().optional(),
  isCardBill: z.boolean().default(false),
  notificationsEnabled: z.boolean().default(true)
});

const AddBillPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cardItems, setCardItems] = useState<CardItem[]>([]);
  const [cardItemDescription, setCardItemDescription] = useState('');
  const [cardItemAmount, setCardItemAmount] = useState('');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      amount: '',
      category: 'outros',
      dueDate: '',
      isRecurring: false,
      totalInstallments: '',
      isCardBill: false,
      notificationsEnabled: true
    }
  });
  
  const isCardBill = form.watch('isCardBill');
  
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
    
    const originalDueDate = new Date(values.dueDate + 'T00:00:00'); // Garantir que a hora não afete a data
    const totalInstallments = values.totalInstallments ? parseInt(values.totalInstallments) : 1;
    const recurringDay = originalDueDate.getDate(); // Usar o dia da data de vencimento original como o dia de recorrência

    if (values.isRecurring && totalInstallments > 1) {
      // Lógica para criar múltiplas contas parceladas
      const billsToSave: Bill[] = [];
      const originalBillIdForAllInstallments = uuidv4(); // ID comum para agrupar as parcelas

      for (let i = 0; i < totalInstallments; i++) {
        const installmentDueDate = new Date(originalDueDate);
        installmentDueDate.setMonth(originalDueDate.getMonth() + i);
        // Garante que o dia do mês seja o dia de recorrência, ajustando se necessário (ex: Fev tem menos dias)
        const lastDayOfMonth = new Date(installmentDueDate.getFullYear(), installmentDueDate.getMonth() + 1, 0).getDate();
        installmentDueDate.setDate(Math.min(recurringDay, lastDayOfMonth));

        const billInstallment: Bill = {
          id: uuidv4(), // ID único para cada parcela
          originalBillId: originalBillIdForAllInstallments, // ID para agrupar parcelas
          title: `${values.title} (${i + 1}/${totalInstallments})`,
          amount,
          dueDate: installmentDueDate,
          isRecurring: true, // Cada parcela individual não é 'mãe' de outras recorrências
          category: values.category,
          userId: user.id,
          isPaid: false,
          totalInstallments: totalInstallments, 
          currentInstallment: i + 1,
          notificationsEnabled: values.notificationsEnabled,
          isCardBill: values.isCardBill,
          cardItems: values.isCardBill && i === 0 ? cardItems : undefined, // Adicionar itens do cartão apenas à primeira parcela
          recurringDay: recurringDay // Adicionando recurringDay para consistência
        };
        billsToSave.push(billInstallment);
      }
      // Aqui, em vez de saveBill(newBill), você chamaria uma função que salva um array de bills
      // Por enquanto, vamos assumir que saveBill pode ser modificada ou uma nova saveMultipleBills é criada
      billsToSave.forEach(b => saveBill(b)); // Simulação, idealmente seria uma transação ou batch save

    } else {
      // Conta única (não recorrente, ou recorrente sem parcelas definidas, ou primeira parcela de uma futura série)
      const newBill: Bill = {
        id: uuidv4(),
        title: values.isRecurring && totalInstallments > 1 ? `${values.title} (1/${totalInstallments})` : values.title,
        amount,
        dueDate: originalDueDate,
        isRecurring: values.isRecurring,
        category: values.category,
        userId: user.id,
        isPaid: false,
        totalInstallments: values.isRecurring && totalInstallments > 1 ? totalInstallments : undefined,
        currentInstallment: values.isRecurring && totalInstallments > 1 ? 1 : undefined,
        notificationsEnabled: values.notificationsEnabled,
        isCardBill: values.isCardBill,
        cardItems: values.isCardBill ? cardItems : undefined,
        recurringDay: values.isRecurring ? recurringDay : undefined
      };
      saveBill(newBill);
    }
    
    toast({
      title: "Conta adicionada",
      description: "A conta foi adicionada com sucesso."
    });
    
    navigate('/bills');
  };

  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader title="Adicionar Conta" showSearch={false} />
      
      <div className="px-4 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-galileo-text">Título</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Aluguel, Conta de Luz..." 
                      {...field} 
                      className="bg-galileo-accent text-white placeholder:text-gray-300"
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
                    <FormLabel className="text-galileo-text">Valor</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="R$ 0,00" 
                        {...field} 
                        className="bg-galileo-accent text-white placeholder:text-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="text-galileo-text font-medium mb-2">Itens da Fatura</h3>
                  
                  {cardItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center mb-2 p-2 bg-galileo-accent rounded">
                      <div className="text-galileo-text">{item.description}</div>
                      <div className="flex items-center">
                        <span className="text-galileo-text mr-2">
                          R$ {item.amount.toFixed(2).replace('.', ',')}
                        </span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveCardItem(item.id)}
                          className="text-galileo-negative"
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
                      className="bg-galileo-accent text-white placeholder:text-gray-300"
                    />
                    <Input
                      placeholder="R$ 0,00"
                      value={cardItemAmount}
                      onChange={(e) => setCardItemAmount(e.target.value)}
                      className="bg-galileo-accent text-white placeholder:text-gray-300"
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleAddCardItem}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-galileo-text font-medium">Total</span>
                    <span className="text-galileo-text font-medium">
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
                  <FormLabel className="text-galileo-text">Categoria</FormLabel>
                  <FormControl>
                    <Select 
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="bg-galileo-accent text-white">
                        <SelectValue placeholder="Selecione uma categoria" className="text-white" />
                      </SelectTrigger>
                      <SelectContent className="bg-galileo-card text-galileo-text">
                        {EXPENSE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category.toLowerCase()}>
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
                  <FormLabel className="text-galileo-text">Data de Vencimento</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="date"
                        {...field}
                        className="bg-galileo-accent text-white placeholder:text-gray-300 appearance-none"
                      />
                      <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-galileo-text">Conta Recorrente</FormLabel>
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
            
            <FormField
              control={form.control}
              name="totalInstallments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-galileo-text">Número de Parcelas (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ex: 12"
                      {...field}
                      className="bg-galileo-accent text-white placeholder:text-gray-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notificationsEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-galileo-text">Notificações</FormLabel>
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
              className="w-full bg-galileo-accent hover:bg-galileo-secondaryText text-galileo-text"
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
