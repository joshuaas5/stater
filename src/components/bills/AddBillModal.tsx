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
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-lg shadow-lg relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={handleClose}>
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-galileo-text">Adicionar Conta</h2>
        {/* Formulário completo migrado de AddBillPage */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-galileo-text">Título</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Aluguel, Conta de Luz..." {...field} className="bg-galileo-accent text-white placeholder:text-gray-300 dark:text-white dark:placeholder:text-gray-400" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="isCardBill" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-galileo-text">Fatura de Cartão de Crédito</FormLabel>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />
            {!isCardBill ? (
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-galileo-text">Valor</FormLabel>
                  <FormControl>
                    <Input placeholder="R$ 0,00" {...field} className="bg-galileo-accent text-white placeholder:text-gray-300 dark:text-white dark:placeholder:text-gray-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="text-galileo-text font-medium mb-2">Itens da Fatura</h3>
                  {cardItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center mb-2 p-2 bg-galileo-accent rounded">
                      <div className="text-galileo-text">{item.description}</div>
                      <div className="flex items-center">
                        <span className="text-galileo-text mr-2">R$ {item.amount.toFixed(2).replace('.', ',')}</span>
                        <button type="button" onClick={() => handleRemoveCardItem(item.id)} className="text-galileo-negative">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 flex gap-2">
                    <Input placeholder="Descrição" value={cardItemDescription} onChange={(e) => setCardItemDescription(e.target.value)} className="bg-galileo-accent text-white placeholder:text-gray-300" />
                    <Input placeholder="R$ 0,00" value={cardItemAmount} onChange={(e) => setCardItemAmount(e.target.value)} className="bg-galileo-accent text-white placeholder:text-gray-300" />
                    <Button type="button" variant="outline" onClick={handleAddCardItem}><Plus size={16} /></Button>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-galileo-text font-medium">Total</span>
                    <span className="text-galileo-text font-medium">R$ {cardItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
            )}
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-galileo-text">Categoria</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
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
            <div className="flex justify-end">
              <Button type="submit" className="bg-galileo-primary text-white">Salvar Conta</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AddBillModal;
