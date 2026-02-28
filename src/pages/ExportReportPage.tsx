import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, Download, FileText, ChevronLeft, 
  FileSpreadsheet, File, Database, Table2, Check, Sparkles 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { exportReport, ExportConfig } from '@/utils/reportExporter';
import { ReportDownloadLimitManager } from '@/utils/reportDownloadLimit';
import { useAuth } from '@/contexts/AuthContext';
import { usePaywallModal } from '@/components/ui/PaywallModal';

const ExportReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { openPaywall } = usePaywallModal();
  
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [includeTransactions, setIncludeTransactions] = useState<boolean>(true);
  const [includeBills, setIncludeBills] = useState<boolean>(true);
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'pdf' | 'ofx' | 'csv'>('pdf');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const formatOptions = [
    { 
      id: 'pdf' as const, 
      name: 'PDF', 
      ext: 'PDF',
      icon: File, 
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      description: 'Documento profissional com logo e gráficos'
    },
    { 
      id: 'xlsx' as const, 
      name: 'Excel', 
      ext: 'XLSX',
      icon: FileSpreadsheet, 
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      description: 'Planilha editável e organizada'
    },
    { 
      id: 'csv' as const, 
      name: 'CSV', 
      ext: 'CSV',
      icon: Table2, 
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-500/20',
      borderColor: 'border-violet-500/30',
      textColor: 'text-violet-400',
      description: 'Texto limpo para importação'
    },
    { 
      id: 'ofx' as const, 
      name: 'OFX', 
      ext: 'OFX',
      icon: Database, 
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      description: 'Compatível com bancos e apps'
    },
  ];
  
  const handleExport = async () => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Faça login para continuar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const downloadLimit = await ReportDownloadLimitManager.canDownloadReport(user.id);
      
      if (!downloadLimit.allowed) {
        if (downloadLimit.reason === 'limit_reached') {
          openPaywall('reports');
          return;
        } else if (downloadLimit.reason === 'error') {
          toast({
            title: 'Erro',
            description: 'Erro interno. Tente novamente.',
            variant: 'destructive',
          });
          return;
        }
      }

      setIsGenerating(true);
      
      const config: ExportConfig = {
        startDate,
        endDate,
        includeTransactions,
        includeBills,
        format: exportFormat
      };
      
      const blob = await exportReport(config);
      const filename = `stater_relatorio_${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      
      if (!blob) {
        throw new Error('Não foi possível gerar o relatório.');
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      await ReportDownloadLimitManager.incrementDownloadCount(user.id);
      
      toast({
        title: '✅ Relatório gerado!',
        description: filename,
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: 'Erro ao gerar relatório',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-24">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-4 pb-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-400" />
                Exportar Relatório
              </h1>
              <p className="text-sm text-white/60">
                Gere relatórios profissionais em segundos
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            
            {/* Card: Período */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Período</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Data inicial</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 rounded-xl h-12"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-white/60" />
                        {format(startDate, 'dd/MM/yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={date => date && setStartDate(date)}
                        locale={ptBR}
                        className="rounded-xl"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Data final</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 rounded-xl h-12"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-white/60" />
                        {format(endDate, 'dd/MM/yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={date => date && setEndDate(date)}
                        locale={ptBR}
                        className="rounded-xl"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Card: Conteúdo */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Conteúdo</h2>
              </div>
              
              <div className="space-y-3">
                <label 
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    includeTransactions 
                      ? 'bg-blue-500/20 border border-blue-500/30' 
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setIncludeTransactions(!includeTransactions)}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    includeTransactions ? 'bg-blue-500' : 'bg-white/10'
                  }`}>
                    {includeTransactions && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Transações</p>
                    <p className="text-sm text-white/50">Receitas e despesas do período</p>
                  </div>
                </label>

                <label 
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    includeBills 
                      ? 'bg-purple-500/20 border border-purple-500/30' 
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setIncludeBills(!includeBills)}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    includeBills ? 'bg-purple-500' : 'bg-white/10'
                  }`}>
                    {includeBills && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Contas</p>
                    <p className="text-sm text-white/50">Contas a pagar e receber</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Card: Formato */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Download className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Formato</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {formatOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = exportFormat === option.id;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => setExportFormat(option.id)}
                      className={`relative p-4 rounded-xl text-left transition-all ${
                        isSelected 
                          ? `${option.bgColor} ${option.borderColor} border-2` 
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-3`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      
                      <p className={`font-bold text-base ${isSelected ? option.textColor : 'text-white'}`}>
                        {option.name}
                      </p>
                      <p className="text-xs text-white/50 mt-0.5">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Export Button */}
            <Button 
              onClick={handleExport} 
              disabled={isGenerating || (!includeTransactions && !includeBills)}
              className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Gerando relatório...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Gerar e Baixar
                </div>
              )}
            </Button>

            {/* Info */}
            <p className="text-center text-xs text-white/40">
              Relatório gerado com marca STATER • Qualidade profissional
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportReportPage;
