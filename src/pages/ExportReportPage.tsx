import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, Download, FileText, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { exportFinancialReport } from '@/utils/reportExporter';

const ExportReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [includeTransactions, setIncludeTransactions] = useState<boolean>(true);
  const [includeBills, setIncludeBills] = useState<boolean>(true);
  const [includeCharts, setIncludeCharts] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  const handleExport = async () => {
    try {
      setIsGenerating(true);
      toast({
        title: 'Gerando relatório',
        description: 'Por favor, aguarde enquanto geramos seu relatório...',
      });
      
      const result = await exportFinancialReport({
        startDate,
        endDate,
        includeTransactions,
        includeBills,
        includeCharts,
      });
      
      const formattedDate = format(startDate, 'yyyy-MM-dd', { locale: ptBR });
      const filename = `relatorio-financeiro-${formattedDate}`;
      const blob = new Blob([result], { type: 'text/csv;charset=utf-8' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Relatório gerado com sucesso!',
        description: 'Seu relatório financeiro foi gerado e está sendo baixado.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: 'Erro ao gerar relatório',
        description: 'Ocorreu um erro ao gerar seu relatório. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader title="Exportar Relatório Financeiro" />
      
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          className="flex items-center mb-4" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="mr-1" size={16} />
          Voltar
        </Button>
        
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Exportar Relatório Financeiro
            </CardTitle>
            <CardDescription>
              Selecione o período e o formato para exportar seu relatório financeiro personalizado.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Seleção de período */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Data inicial</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP', { locale: ptBR }) : 'Selecione uma data'}
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
                <Label>Data final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP', { locale: ptBR }) : 'Selecione uma data'}
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
              <h3 className="text-sm font-medium">Conteúdo do relatório</h3>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="transactions" 
                    checked={includeTransactions}
                    onCheckedChange={(checked) => setIncludeTransactions(checked === true)}
                  />
                  <Label htmlFor="transactions">Incluir transações (receitas e despesas)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="bills" 
                    checked={includeBills}
                    onCheckedChange={(checked) => setIncludeBills(checked === true)}
                  />
                  <Label htmlFor="bills">Incluir contas a pagar/receber</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="charts" 
                    checked={includeCharts}
                    onCheckedChange={(checked) => setIncludeCharts(checked === true)}
                  />
                  <Label htmlFor="charts">Incluir gráficos</Label>
                </div>
              </div>
            </div>
            
            {/* Informação sobre o formato */}
            <div className="grid grid-cols-1 gap-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Formato de exportação</CardTitle>
                  <CardDescription>
                    Seu relatório financeiro será exportado em formato CSV.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Arquivo CSV (compatível com Excel e outras planilhas)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={handleExport} 
              disabled={isGenerating || !includeTransactions && !includeBills}
              className="w-full flex items-center justify-center bg-galileo-accent hover:bg-galileo-accent/90"
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
        </Card>
      </div>
      
      <NavBar />
    </div>
  );
};

export default ExportReportPage;
