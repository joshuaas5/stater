import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from "@/components/ui/checkbox";
import { Bill, CardItem, EXPENSE_CATEGORIES } from '@/types';
import { getCurrentUser, saveBill } from '@/utils/localStorage';
import { Calendar, Plus, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (bill: any) => void;
}

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

const AddBillModal: React.FC<AddBillModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [cardItems, setCardItems] = useState<CardItem[]>([]);
  const [cardItemDescription, setCardItemDescription] = useState('');
  const [cardItemAmount, setCardItemAmount] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      amount: '',
      category: 'Outros',
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
      if (isNaN(amount)) return;
      const newItem: CardItem = { id: uuidv4(), description: cardItemDescription, amount };
      setCardItems([...cardItems, newItem]);
      setCardItemDescription('');
      setCardItemAmount('');
      const totalAmount = cardItems.reduce((sum, item) => sum + item.amount, 0) + amount;
      form.setValue('amount', totalAmount.toString());
    }
  };

  const handleRemoveCardItem = (id: string) => {
    const updatedItems = cardItems.filter(item => item.id !== id);
    setCardItems(updatedItems);
    const totalAmount = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    form.setValue('amount', totalAmount.toString());
  };

  const handleClose = () => {
    form.reset();
    setCardItems([]);
    setCardItemDescription('');
    setCardItemAmount('');
    onClose();
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const user = getCurrentUser();
    if (!user) {
      handleClose();
      return;
    }
    const amount = parseFloat(values.amount.replace(',', '.'));
    if (isNaN(amount)) return;
    const originalDueDate = new Date(values.dueDate + 'T00:00:00');
    const recurringDay = originalDueDate.getDate();
    const totalInstallments = values.isRecurring && !values.isInfiniteRecurrence && values.totalInstallments ? parseInt(values.totalInstallments) : 1;
    let savedBill: Bill | null = null;
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
      savedBill = billsToSave[0];
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
      savedBill = newBill;
    }
    if (onSuccess && savedBill) onSuccess(savedBill);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg relative mx-2 flex flex-col max-h-[90vh]" style={{ width: '95vw', maxWidth: 400 }}>
        {/* Header Section (Not scrollable) */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-semibold text-galileo-text">Adicionar Nova Conta</h2>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Section */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="billForm" className="flex-grow overflow-y-auto p-4 space-y-4">
            {/* Title Field */}
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-galileo-text">Título</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Conta de Luz" {...field} className="bg-galileo-accent text-white placeholder:text-gray-300" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Card Bill Switch */}
            <FormField control={form.control} name="isCardBill" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-galileo-text">Fatura de Cartão?</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />

            {/* Conditional Card Items Section */}
            {isCardBill && (
              <div className="space-y-3 p-3 border rounded-md">
                <h3 className="text-sm font-medium text-galileo-text">Itens da Fatura</h3>
                {cardItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-xs p-1.5 bg-galileo-accent/50 rounded">
                    <span>{item.description}</span>
                    <div className="flex items-center">
                      <span>R$ {item.amount.toFixed(2)}</span>
                      <button type="button" onClick={() => handleRemoveCardItem(item.id)} className="ml-2 text-red-400 hover:text-red-600">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 items-center mt-2">
                  <Input 
                    type="text" 
                    placeholder="Descrição do item"
                    value={cardItemDescription}
                    onChange={(e) => setCardItemDescription(e.target.value)}
                    className="bg-galileo-accent text-white placeholder:text-gray-300 text-sm p-1.5 flex-grow"
                  />
                  <Input 
                    type="text" 
                    placeholder="Valor"
                    value={cardItemAmount}
                    onChange={(e) => setCardItemAmount(e.target.value)}
                    className="bg-galileo-accent text-white placeholder:text-gray-300 text-sm p-1.5 w-20"
                  />
                  <Button type="button" onClick={handleAddCardItem} size="sm" className="p-1.5 bg-galileo-primary/80 hover:bg-galileo-primary">
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* Amount Field (conditionally disabled if card bill) */}
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-galileo-text">Valor</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: 150,00"
                    {...field} 
                    className="bg-galileo-accent text-white placeholder:text-gray-300"
                    disabled={isCardBill} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            {/* Category Field */}
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-galileo-text">Categoria</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-galileo-accent text-white">
                      <SelectValue placeholder="Selecione uma categoria" className="text-white" />
                    </SelectTrigger>
                    <SelectContent className="bg-galileo-card text-galileo-text">
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Due Date Field */}
            <FormField control={form.control} name="dueDate" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-galileo-text">Data de Vencimento</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="date" {...field} className="bg-galileo-accent text-white placeholder:text-gray-300 appearance-none" />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Recurring Bill Switch */}
            <FormField control={form.control} name="isRecurring" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-galileo-text">Conta Recorrente</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />

            {/* Conditional Recurring Options */}
            {isRecurring && (
              <>
                <FormField control={form.control} name="isInfiniteRecurrence" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-galileo-text">Recorrência Infinita</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
                {!isInfiniteRecurrence && (
                  <FormField control={form.control} name="totalInstallments" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-galileo-text">Número de Parcelas</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 12" {...field} className="bg-galileo-accent text-white placeholder:text-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </>
            )}

            {/* Notifications Switch */}
            <FormField control={form.control} name="notificationsEnabled" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-galileo-text">Notificações Ativadas</FormLabel>
                </div>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />
          </form>
        </Form>

        {/* Footer/Button Section (Not scrollable) */}
        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Button type="submit" form="billForm" className="bg-galileo-primary text-white w-full sm:w-auto">Adicionar Conta</Button>
        </div>
      </div>
    </div>
  );
};

export default AddBillModal;
