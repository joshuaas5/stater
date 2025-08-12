import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, Download, FileText, ChevronLeft, FileType2, FileOutput } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PageHeader from '@/components/header/PageHeader';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { exportReport, ExportConfig } from '@/utils/reportExporter';
import { generateSimplePDF } from '@/utils/basicPdfExporter';
import { generateExcelLikePDF } from '@/utils/simpleExcelPdfExporter';
import { getCurrentUser, getTransactions, getBills } from '@/utils/localStorage';

const ExportReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [includeTransactions, setIncludeTransactions] = useState<boolean>(true);
  const [includeBills, setIncludeBills] = useState<boolean>(true);
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'pdf' | 'ofx' | 'csv'>('xlsx');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Função para gerar uma dica financeira baseada nos dados
  const getFinancialTip = (income: number, expense: number, expensesByCategory: Record<string, number>) => {
    // Se as despesas forem maiores que 90% da receita
    if (expense > income * 0.9) {
      return "Atenção! Suas despesas estão muito próximas da sua receita. Considere reduzir gastos não essenciais.";
    }
    
    // Se houver uma categoria que consome mais de 40% do total de despesas
    const categories = Object.entries(expensesByCategory);
    if (categories.length > 0) {
      const [largestCategory, largestAmount] = categories.reduce((max, current) => {
        return current[1] > max[1] ? current : max;
      });
      
      if (largestAmount > expense * 0.4) {
        return `A categoria '${largestCategory}' representa mais de 40% dos seus gastos. Considere revisar esses gastos para um orçamento mais equilibrado.`;
      }
    }
    
    // Se a economia for superior a 30% da receita
    if (income - expense > income * 0.3) {
      return "Parabéns! Você está economizando mais de 30% da sua receita. Considere investir esse valor para fazer seu dinheiro trabalhar por você.";
    }
    
    // Dica padrão
    return "Dica: Estabeleça metas financeiras claras e revise seu orçamento regularmente para manter suas finanças saudáveis.";
  };
  
  const handleExport = async () => {
    try {
      setIsGenerating(true);
      toast({
        title: 'Gerando relatório',
        description: 'Por favor, aguarde enquanto geramos seu relatório...',
      });
      
      // Configurar a exportação
      const config: ExportConfig = {
        startDate,
        endDate,
        includeTransactions,
        includeBills,
        format: exportFormat
      };
      
      // Obter dados diretamente das fontes para garantir que temos tudo
      const currentUser = getCurrentUser();
      const allTransactions = getTransactions();
      const allBills = getBills();
      
      // Filtrar transações e contas pelo período selecionado
      let filteredTransactions = [...allTransactions];
      let filteredBills = [...allBills];
      
      // Ajusta a data de início para o começo do dia
      const filterStartDate = new Date(startDate);
      filterStartDate.setHours(0, 0, 0, 0);
      
      // Ajusta a data final para incluir todo o dia
      const filterEndDate = new Date(endDate);
      filterEndDate.setHours(23, 59, 59, 999);
      
      // Aplicar filtros de data
      filteredTransactions = filteredTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= filterStartDate && transactionDate <= filterEndDate;
      });
      
      filteredBills = filteredBills.filter(b => {
        const billDate = new Date(b.dueDate);
        return billDate >= filterStartDate && billDate <= filterEndDate;
      });
      
      // Separar transações entre entradas e saídas
      const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
      const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
      
      // Calcular totais
      const incomeTotal = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const expenseTotal = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
      const balance = incomeTotal - expenseTotal;
      
      // Calcular distribuição de gastos por categoria
      const expensesByCategory: { [category: string]: number } = {};
      expenseTransactions.forEach(t => {
        const category = t.category || 'Sem categoria';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + t.amount;
      });
      
      // Preparar dados para o relatório
      const reportData = {
        userName: currentUser?.email || 'Usuário',
        startDate: filterStartDate,
        endDate: filterEndDate,
        incomeTotal,
        expenseTotal,
        balance,
        incomeTransactions,
        expenseTransactions,
        bills: filteredBills,
        expensesByCategory,
        // Dica financeira baseada nos dados
        financialTip: getFinancialTip(incomeTotal, expenseTotal, expensesByCategory),
      };
      
      // Gerar o blob do relatório usando o exportador
      let blob = await exportReport(config);
      
      // Definir o nome do arquivo baseado no formato
      const filename = `relatorio_financeiro_${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      
      if (!blob) {
        throw new Error('Não foi possível gerar o relatório.');
      }
      
      // Criar um URL para o blob e fazer o download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Relatório gerado com sucesso',
        description: `Seu relatório foi baixado como ${filename}`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: 'Erro ao gerar relatório',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao gerar seu relatório. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
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
              onClick={() => navigate(-1)}
              className="p-2 text-white hover:text-white hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-300"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">
                Exportar Relatório Financeiro
              </h1>
              <p className="text-sm text-white/70">
                Selecione o período e formato para gerar seu relatório
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 p-4">
        <div className="w-full max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-white">
              <FileText className="h-5 w-5" />
              Exportar Relatório Financeiro
            </CardTitle>
            <CardDescription className="text-white/70">
              Selecione o período e o formato para exportar seu relatório financeiro personalizado.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Seleção de período */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white">Data inicial</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={date => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Data final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={date => date && setEndDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Opções de conteúdo */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white">Conteúdo do relatório</h3>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="transactions" 
                    checked={includeTransactions}
                    onCheckedChange={(checked) => setIncludeTransactions(checked === true)}
                  />
                  <Label htmlFor="transactions" className="text-white">Incluir transações</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="bills" 
                    checked={includeBills}
                    onCheckedChange={(checked) => setIncludeBills(checked === true)}
                  />
                  <Label htmlFor="bills" className="text-white">Incluir contas a pagar/receber</Label>
                </div>
              </div>
            </div>
            
            {/* Seleção de formato */}
            <div className="grid grid-cols-1 gap-4 mt-6">
              <div className="bg-white/5 backdrop-blur-[8px] rounded-lg border border-white/20 p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">Formato de exportação</h3>
                  <p className="text-sm text-white/70">
                    Selecione o formato para exportar seu relatório financeiro.
                  </p>
                </div>
                <div>
                  <RadioGroup value={exportFormat} onValueChange={(value) => setExportFormat(value as 'xlsx' | 'pdf' | 'ofx' | 'csv')} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="xlsx" id="format-xlsx" />
                      <Label htmlFor="format-xlsx" className="flex items-center cursor-pointer text-white">
                        <FileType2 className="h-5 w-5 mr-2 text-green-400" />
                        <div>
                          <p className="font-medium">Excel (XLSX)</p>
                          <p className="text-sm text-white/60">Planilha formatada compatível com Microsoft Excel</p>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pdf" id="format-pdf" />
                      <Label htmlFor="format-pdf" className="flex items-center cursor-pointer text-white">
                        <FileOutput className="h-5 w-5 mr-2 text-red-400" />
                        <div>
                          <p className="font-medium">PDF</p>
                          <p className="text-sm text-white/60">Documento formatado com layout profissional</p>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ofx" id="format-ofx" />
                      <Label htmlFor="format-ofx" className="flex items-center cursor-pointer text-white">
                        <FileType2 className="h-5 w-5 mr-2 text-blue-400" />
                        <div>
                          <p className="font-medium">OFX</p>
                          <p className="text-sm text-white/60">Formato para importação em softwares financeiros e bancos</p>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="csv" id="format-csv" />
                      <Label htmlFor="format-csv" className="flex items-center cursor-pointer text-white">
                        <FileText className="h-5 w-5 mr-2 text-gray-400" />
                        <div>
                          <p className="font-medium">CSV</p>
                          <p className="text-sm text-white/60">Arquivo de texto com valores separados por vírgula</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={handleExport} 
              disabled={isGenerating || !includeTransactions && !includeBills}
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white backdrop-blur-[8px] border border-blue-500/30"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Gerando relatório...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Gerar e baixar relatório
                </>
              )}
            </Button>
          </CardFooter>
        </div>
      </div>
      
    </div>
  );
};

export default ExportReportPage;
