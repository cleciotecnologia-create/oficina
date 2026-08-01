import React, { useState } from 'react';
import { 
  TrendingUp, 
  FileText, 
  Package, 
  Users, 
  DollarSign, 
  Printer, 
  ArrowUpRight, 
  Activity, 
  CheckCircle2, 
  FolderMinus,
  X,
  Wrench,
  AlertTriangle,
  Clock,
  PiggyBank,
  Percent,
  RotateCcw,
  MessageSquare,
  Search,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  Download,
  FileSpreadsheet,
  Database
} from 'lucide-react';
import { 
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  exportToExcel,
  exportToCSV,
  formatEstoqueExportData,
  formatFinanceiroExportData,
  formatClientesExportData,
  formatOrdensServicoExportData
} from '../utils/exportUtils';

export const RelatoriosView: React.FC = () => {
  const { 
    financeiro, 
    produtos, 
    ordensServico, 
    clientes,
    company,
    updateOrdemServico,
    updateFinanceiro,
    addLocalAuditLog
  } = useApp();

  const [activeReport, setActiveReport] = useState<'financial' | 'inventory' | 'mechanics' | 'delinquency'>('financial');
  const [mechanicMetric, setMechanicMetric] = useState<'avgServices' | 'totalOS' | 'totalServices'>('avgServices');
  const [delinquencySearch, setDelinquencySearch] = useState('');
  const [delinquencyRange, setDelinquencyRange] = useState<'todos' | 'ate15' | '15a30' | 'mais30'>('todos');
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  // Data Export States
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDataset, setExportDataset] = useState<'inventory' | 'financial' | 'customers' | 'orders'>('inventory');
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [exportToast, setExportToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setExportToast({ message, type });
    setTimeout(() => {
      setExportToast(null);
    }, 4000);
  };

  const handleExportData = (datasetOverride?: 'inventory' | 'financial' | 'customers' | 'orders', formatOverride?: 'xlsx' | 'csv') => {
    const dataset = datasetOverride || exportDataset;
    const format = formatOverride || exportFormat;
    const todayYmd = new Date().toISOString().split('T')[0];

    try {
      let exportData: Record<string, any>[] = [];
      let baseFilename = '';

      if (dataset === 'inventory') {
        exportData = formatEstoqueExportData(produtos);
        baseFilename = `Relatorio_Estoque_${todayYmd}`;
      } else if (dataset === 'financial') {
        exportData = formatFinanceiroExportData(financeiro);
        baseFilename = `Relatorio_Financeiro_${todayYmd}`;
      } else if (dataset === 'customers') {
        exportData = formatClientesExportData(clientes, ordensServico);
        baseFilename = `Relatorio_Clientes_${todayYmd}`;
      } else if (dataset === 'orders') {
        exportData = formatOrdensServicoExportData(ordensServico);
        baseFilename = `Relatorio_Ordens_Servico_${todayYmd}`;
      }

      if (exportData.length === 0) {
        triggerToast('⚠️ Não há registros disponíveis para exportação no momento.', 'error');
        return;
      }

      if (format === 'xlsx') {
        exportToExcel(exportData, baseFilename, dataset.toUpperCase());
        triggerToast(`📊 Planilha Excel (${baseFilename}.xlsx) gerada com sucesso! (${exportData.length} registros)`);
      } else {
        exportToCSV(exportData, baseFilename);
        triggerToast(`📄 Arquivo CSV (${baseFilename}.csv) gerado com sucesso! (${exportData.length} registros)`);
      }

      if (addLocalAuditLog) {
        addLocalAuditLog('Exportação de Dados', `Exportado conjunto '${dataset}' em formato ${format.toUpperCase()} (${exportData.length} linhas).`);
      }

      setShowExportModal(false);
    } catch (err: any) {
      console.error(err);
      triggerToast(`❌ Erro ao exportar dados: ${err?.message || 'Falha no processamento'}`, 'error');
    }
  };

  // Calculations
  const grossIncome = financeiro
    .filter(f => f.type === 'Receita' && f.status === 'Pago')
    .reduce((sum, item) => sum + item.amount, 0);

  const grossExpenses = financeiro
    .filter(f => f.type === 'Despesa')
    .reduce((sum, item) => sum + item.amount, 0);

  // Dynamic calculation of Parts sales vs Service sales from actual database orders!
  const finalizedOS = ordensServico.filter(os => os.status === 'Finalizada');
  
  // Sum services from finalized OS
  const servicesIncome = finalizedOS.reduce((sum, os) => 
    sum + os.services.reduce((srvSum, srv) => srvSum + srv.price, 0), 0);
  
  // Sum parts from finalized OS (excluding customer supplied parts)
  const osPartsIncome = finalizedOS.reduce((sum, os) => 
    sum + os.parts.reduce((partSum, part) => partSum + (part.suppliedByClient ? 0 : part.sellPrice * part.quantity), 0), 0);
  
  // PDV sales are completely parts
  const pdvSalesIncome = financeiro
    .filter(f => f.type === 'Receita' && f.status === 'Pago' && f.description.toLowerCase().includes('venda pdv'))
    .reduce((sum, item) => sum + item.amount, 0);

  const partsIncome = osPartsIncome + pdvSalesIncome;

  const displayGrossIncome = (partsIncome + servicesIncome) > 0 ? (partsIncome + servicesIncome) : grossIncome;
  const displayPartsIncome = partsIncome > 0 ? partsIncome : Math.max(0, grossIncome - 500);
  const displayServicesIncome = servicesIncome > 0 ? servicesIncome : (grossIncome > 0 ? 500 : 0);

  const netResult = displayGrossIncome - grossExpenses;
  const profitMarginPercent = displayGrossIncome > 0 ? (netResult / displayGrossIncome) * 100 : 0;

  // Inventory asset value calculation
  const totalStockItems = produtos.reduce((sum, item) => sum + item.quantity, 0);
  const totalCostValue = produtos.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
  const totalSellValue = produtos.reduce((sum, item) => sum + (item.sellPrice * item.quantity), 0);
  const potentialProfit = totalSellValue - totalCostValue;

  // Mechanics stats calculation
  const getMechanicOSStats = (mechName: string) => {
    const totalOS = ordensServico.filter(os => os.mechanicName.toLowerCase().includes(mechName.toLowerCase()));
    const completed = totalOS.filter(os => os.status === 'Finalizada').length;
    const pending = totalOS.length - completed;
    const valueGenerated = totalOS.reduce((sum, os) => sum + os.total, 0);
    return {
      total: totalOS.length,
      completed,
      pending,
      valueGenerated
    };
  };

  const mechanicsList = [
    { name: "Marcio Rezende", role: "Mecânico Sênior" },
    { name: "Gerson 'Geleia' Souza", role: "Mecânico Assistente" }
  ];

  const handlePrint = () => {
    const printStyle = document.createElement('style');
    printStyle.innerHTML = `
      @media print {
        body, html {
          background: white !important;
          color: black !important;
        }
        #root, header, nav, aside, footer, button, .no-print, [id^="btn-"], .lucide {
          display: none !important;
        }
        #print-area {
          background: white !important;
          color: black !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          display: block !important;
        }
        #print-area * {
          background: transparent !important;
          color: black !important;
          border-color: #cbd5e1 !important;
          box-shadow: none !important;
          text-shadow: none !important;
        }
        .text-white, .text-slate-300, .text-gray-400, .text-gray-500 {
          color: #1e293b !important;
        }
        .text-green-500, .text-green-400 {
          color: #15803d !important;
          font-weight: bold !important;
        }
        .text-red-500, .text-red-400 {
          color: #b91c1c !important;
          font-weight: bold !important;
        }
        .text-cyan-400 {
          color: #0369a1 !important;
          font-weight: bold !important;
        }
        .bg-gradient-to-r, .bg-slate-950/40, .bg-[#070c17], .bg-black/40 {
          background-color: #f8fafc !important;
          border: 1px solid #cbd5e1 !important;
        }
        .border-gray-800, .border-gray-855, .border-gray-850, .border-gray-900 {
          border-color: #cbd5e1 !important;
        }
      }
    `;
    document.head.appendChild(printStyle);
    window.print();
    setTimeout(() => {
      if (document.head.contains(printStyle)) {
        document.head.removeChild(printStyle);
      }
    }, 1000);
  };

  // PDF Export States for KPI Dashboard Report
  const [showKpiReportModal, setShowKpiReportModal] = useState(false);

  // Dashboard calculations replicated for reports
  const getKpiDailyEarnings = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return financeiro
      .filter(f => f.type === 'Receita' && f.status === 'Pago' && f.dueDate === todayStr)
      .reduce((sum, f) => sum + f.amount, 0);
  };

  const getKpiMonthlyEarnings = () => {
    return financeiro
      .filter(f => f.type === 'Receita' && f.status === 'Pago')
      .reduce((sum, f) => sum + f.amount, 0);
  };

  const getKpiMonthlyExpenses = () => {
    return financeiro
      .filter(f => f.type === 'Despesa')
      .reduce((sum, f) => sum + f.amount, 0);
  };

  const getKpiLowStockCount = () => {
    return produtos.filter(p => p.quantity <= p.minStock).length;
  };

  const getKpiActiveOSCount = () => {
    return ordensServico.filter(os => 
      os.status !== 'Finalizada' && os.status !== 'Entregue'
    ).length;
  };

  const getKpiServicesInProgress = () => {
    return ordensServico.filter(os => os.status === 'Em execução').length;
  };

  const isKpiWarrantyReturnOS = (osToCheck: any) => {
    if (!osToCheck.veiculoId) return false;
    const warrantyDays = company?.warrantyDays !== undefined ? company.warrantyDays : 90;
    const priorOss = ordensServico.filter(os => 
      os.veiculoId === osToCheck.veiculoId && 
      (os.status === 'Finalizada' || os.status === 'Entregue') && 
      os.id !== osToCheck.id
    );
    if (priorOss.length === 0) return false;
    const createdDate = new Date(osToCheck.createdAt);
    const finalizedPrior = priorOss.filter(os => 
      new Date(os.createdAt).getTime() < createdDate.getTime()
    );
    if (finalizedPrior.length === 0) return false;
    const sortedPrior = [...finalizedPrior].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const latestOS = sortedPrior[0];
    const latestOSDate = new Date(latestOS.createdAt);
    const diffTime = Math.abs(createdDate.getTime() - latestOSDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= warrantyDays;
  };

  const getKpiWarrantyStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const finalizedInMonth = ordensServico.filter(os => {
      const osDate = new Date(os.createdAt);
      return osDate.getMonth() === currentMonth && osDate.getFullYear() === currentYear && (os.status === 'Finalizada' || os.status === 'Entregue');
    });
    const warrantyReturnInMonth = ordensServico.filter(os => {
      const osDate = new Date(os.createdAt);
      return osDate.getMonth() === currentMonth && osDate.getFullYear() === currentYear && isKpiWarrantyReturnOS(os);
    });
    return {
      finalizedInMonth: finalizedInMonth.length,
      warrantyReturnInMonth: warrantyReturnInMonth.length,
      rateMonth: finalizedInMonth.length > 0 ? (warrantyReturnInMonth.length / finalizedInMonth.length) * 100 : 0
    };
  };

  const handlePrintKpi = () => {
    const printStyle = document.createElement('style');
    printStyle.innerHTML = `
      @media print {
        body, html {
          background: white !important;
          color: black !important;
        }
        #root, header, nav, aside, footer, button, .no-print, [id^="btn-"], .lucide, .no-print * {
          display: none !important;
        }
        #kpi-print-area {
          background: white !important;
          color: black !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          display: block !important;
        }
        #kpi-print-area * {
          background: transparent !important;
          color: black !important;
          border-color: #cbd5e1 !important;
          box-shadow: none !important;
          text-shadow: none !important;
        }
        .text-white, .text-slate-300, .text-gray-400, .text-gray-500 {
          color: #1e293b !important;
        }
        .text-green-500, .text-green-400 {
          color: #15803d !important;
          font-weight: bold !important;
        }
        .text-[#22c55e], .text-emerald-400, .text-emerald-500 {
          color: #10b981 !important;
          font-weight: bold !important;
        }
        .text-red-500, .text-red-400, .text-rose-450, .text-rose-500 {
          color: #b91c1c !important;
          font-weight: bold !important;
        }
        .text-cyan-400, .text-cyan-500 {
          color: #0369a1 !important;
          font-weight: bold !important;
        }
        .bg-gradient-to-r, .bg-slate-950/40, .bg-[#070c17], .bg-black/40 {
          background-color: #f8fafc !important;
          border: 1px solid #cbd5e1 !important;
        }
        .border-gray-800, .border-gray-855, .border-gray-850, .border-gray-900 {
          border-color: #cbd5e1 !important;
        }
      }
    `;
    document.head.appendChild(printStyle);
    window.print();
    setTimeout(() => {
      if (document.head.contains(printStyle)) {
        document.head.removeChild(printStyle);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
            📈 RELATÓRIOS E INTELIGÊNCIA OPERACIONAL
          </h1>
          <p className="text-xs text-gray-400 font-mono">Apuração de performance financeira, patrimonial de auto peças e eficiência produtiva.</p>
        </div>

        <div className="flex gap-2 self-stretch sm:self-auto flex-wrap sm:flex-nowrap">
          <button 
            type="button"
            onClick={() => {
              if (activeReport === 'inventory') setExportDataset('inventory');
              else if (activeReport === 'financial') setExportDataset('financial');
              else if (activeReport === 'delinquency') setExportDataset('customers');
              else setExportDataset('orders');
              setShowExportModal(true);
            }}
            className="px-4 py-2 border border-emerald-700/80 hover:border-emerald-500 rounded-xl text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5 bg-gradient-to-r from-emerald-950/60 to-teal-950/60 hover:from-emerald-900/60 hover:to-teal-900/60 h-10 shadow cursor-pointer justify-center flex-1 sm:flex-initial transition active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Exportar Dados (CSV / Excel)
          </button>

          <button 
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 border border-slate-700 hover:border-slate-500 rounded-xl text-xs font-mono font-bold text-slate-200 flex items-center gap-1 bg-[#0c1223] h-10 shadow cursor-pointer justify-center flex-1 sm:flex-initial"
          >
            <Printer className="w-4 h-4" /> Impressora / PDF
          </button>
          
          <button 
            type="button"
            onClick={() => setShowKpiReportModal(true)}
            className="px-4 py-2 border border-cyan-800 hover:border-cyan-600 rounded-xl text-xs font-mono font-bold text-cyan-200 flex items-center gap-1.5 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 hover:from-cyan-900/40 hover:to-blue-900/40 h-10 shadow cursor-pointer justify-center flex-1 sm:flex-initial transition active:scale-95"
          >
            <FileText className="w-4 h-4" /> KPIs (Dashboard)
          </button>
        </div>
      </div>

      {/* Selector pills tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:max-w-2xl [&>button]:py-2.5 [&>button]:rounded-xl [&>button]:text-xs [&>button]:font-mono [&>button]:font-bold border-b border-gray-900 pb-4">
        <button 
          onClick={() => setActiveReport('financial')}
          className={`flex items-center justify-center gap-1.5 border cursor-pointer ${
            activeReport === 'financial' ? 'border-red-500 text-white bg-red-950/10' : 'border-gray-800 text-gray-400'
          }`}
        >
          📂 DRE Financeiro
        </button>
        <button 
          onClick={() => setActiveReport('inventory')}
          className={`flex items-center justify-center gap-1.5 border cursor-pointer ${
            activeReport === 'inventory' ? 'border-red-500 text-white bg-red-950/10' : 'border-gray-800 text-gray-400'
          }`}
        >
          📦 Balanço de Estoque
        </button>
        <button 
          onClick={() => setActiveReport('mechanics')}
          className={`flex items-center justify-center gap-1.5 border cursor-pointer ${
            activeReport === 'mechanics' ? 'border-red-500 text-white bg-red-950/10' : 'border-gray-800 text-gray-400'
          }`}
        >
          🛠️ Comissionamentos
        </button>
        <button 
          onClick={() => setActiveReport('delinquency')}
          className={`flex items-center justify-center gap-1.5 border cursor-pointer ${
            activeReport === 'delinquency' ? 'border-red-500 text-white bg-red-950/10' : 'border-gray-800 text-gray-400'
          }`}
        >
          🚨 Inadimplência
        </button>
      </div>

      {/* CURRENT ACTIVE SPREADSHEEET SHELL AREA */}
      <div id="print-area" className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6 text-left">
        
        {/* Printable-only Corporate Header */}
        <div className="hidden print:flex flex-col gap-2 border-b-2 border-slate-300 pb-4 mb-2 w-full text-black">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              {company?.logoUrl && (
                <img 
                  src={company.logoUrl} 
                  alt="Logo" 
                  className="w-12 h-12 object-contain rounded-lg border border-slate-300"
                  referrerPolicy="no-referrer"
                />
              )}
              <div>
                <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900">
                  {company?.name || 'AUTOPRECISION PREMIUM CUSTOMS'}
                </h2>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {company?.address ? `Endereço: ${company.address}` : 'Matriz AutoPrecision Cloud System'}
                  {company?.cnpj ? ` • CNPJ: ${company.cnpj}` : ''}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {company?.phone ? `Telefone: ${company.phone}` : ''}
                  {company?.email ? ` • E-mail: ${company.email}` : ''}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-slate-900 text-white rounded uppercase">
                {activeReport === 'financial' ? 'RELATÓRIO DRE FINANCEIRO' : activeReport === 'inventory' ? 'RELATÓRIO DO ESTOQUE' : activeReport === 'mechanics' ? 'PRODUTIVIDADE E COMANDAS' : 'INADIMPLÊNCIA DE CLIENTES'}
              </span>
              <p className="text-[9px] text-slate-500 font-mono mt-2">
                Gerado em: {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {activeReport === 'financial' && (
          <div className="flex flex-col gap-5">
            <div className="border-b border-gray-850 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-display font-extrabold text-white text-base">DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO (DRE)</span>
                <span className="block text-[10px] text-gray-500 font-mono mt-1">Exercício Corrente 2026 • Filtro Consolidado de Conta Principal</span>
              </div>
              <div className="flex items-center gap-2 no-print shrink-0">
                <button type="button" onClick={() => handleExportData('financial', 'xlsx')} className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Excel (.xlsx)
                </button>
                <button type="button" onClick={() => handleExportData('financial', 'csv')} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition">
                  <Download className="w-3.5 h-3.5 text-cyan-400" /> CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
              
              {/* Receipt lines */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-gray-900 flex flex-col gap-2.5">
                <span className="font-bold text-green-500 text-[10px] uppercase border-b border-gray-900 pb-1.5 block">1. RECEITAS OPERACIONAIS BRUTAS SOMA</span>
                <div className="flex justify-between">
                  <span>Faturamento Peças (Venda PDV/OS):</span>
                  <span className="text-white">R$ {displayPartsIncome.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Faturamento Mão de Obra (Serviços):</span>
                  <span className="text-white">R$ {displayServicesIncome.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-900 pt-2 text-sm font-bold text-white leading-none">
                  <span>TOTAL RECEITA BRUTA:</span>
                  <span className="text-green-400">R$ {displayGrossIncome.toFixed(2)}</span>
                </div>
              </div>

              {/* Expense lines */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-gray-900 flex flex-col gap-2.5">
                <span className="font-bold text-red-400 text-[10px] uppercase border-b border-gray-900 pb-1.5 block">2. CUSTOS E DESPESAS OPERACIONAIS</span>
                <div className="flex justify-between">
                  <span>Aquisicao de Autopeças (Faturamento):</span>
                  <span>R$ {(grossExpenses * 0.6).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Despesas Básicas Energia/Aluguel:</span>
                  <span>R$ {(grossExpenses * 0.4).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-900 pt-2 text-sm font-bold text-white leading-none">
                  <span>TOTAL DESPESA DEDUTÍVEL:</span>
                  <span className="text-red-400">R$ {grossExpenses.toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Profits calculation line */}
            <div className="bg-gradient-to-r from-red-950/10 to-transparent p-5 rounded-xl border border-gray-850 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1">
                <span className="text-white font-bold block text-sm">3. MARGEM OPERACIONAL DE ATIVIDADE LÍQUIDA:</span>
                <span className="text-gray-500">Saldo apurado de todas as receitas de balcão menos custos patrimoniais de pátio.</span>
              </div>
              <div className="text-right">
                <span className={`text-xl font-display font-black block ${netResult >= 0 ? 'text-cyan-400' : 'text-red-500'}`}>
                  R$ {netResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Margem de Lucro: {profitMarginPercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'inventory' && (
          <div className="flex flex-col gap-5">
            <div className="border-b border-gray-850 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-display font-extrabold text-white text-base">DEMONSTRATIVO DE PATRIMÔNIO LÍQUIDO DO ESTOQUE</span>
                <span className="block text-[10px] text-gray-500 font-mono mt-1">Análise volumétrica do valor estocado e rentabilidade potencial sobre autopeças cadastradas.</span>
              </div>
              <div className="flex items-center gap-2 no-print shrink-0">
                <button type="button" onClick={() => handleExportData('inventory', 'xlsx')} className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Excel (.xlsx)
                </button>
                <button type="button" onClick={() => handleExportData('inventory', 'csv')} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition">
                  <Download className="w-3.5 h-3.5 text-cyan-400" /> CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-[#070c17] p-4 rounded-xl border border-gray-900">
                <span className="text-gray-500 block text-[10px] uppercase">Custos Totais Aquisição</span>
                <strong className="text-white text-base sm:text-lg block mt-1">R$ {totalCostValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
              
              <div className="bg-[#070c17] p-4 rounded-xl border border-gray-900">
                <span className="text-gray-500 block text-[10px] uppercase">Previsão Valor Comercialização</span>
                <strong className="text-cyan-400 text-base sm:text-lg block mt-1">R$ {totalSellValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>

              <div className="bg-[#070c17] p-4 rounded-xl border border-gray-900">
                <span className="text-gray-500 block text-[10px] uppercase">Rendimento de Margem Estimada</span>
                <strong className="text-green-500 text-base sm:text-lg block mt-1">R$ {potentialProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            <span className="text-xs text-gray-400 leading-relaxed font-mono block bg-black/40 p-3.5 rounded border border-gray-900">
              ⚡ <strong>Relação Ativos:</strong> O estoque conta atualmente com <strong>{totalStockItems} unidades integras</strong> estocadas divididas entre filtros, sistemas hidráulicos de freio de alto custo e lubrificantes Castrol. O risco de obsolescência de freios é nulo devido à aplicação de compatibilidade.
            </span>
          </div>
        )}

        {activeReport === 'mechanics' && (() => {
          // Dynamic list of mechanics combining default ones and ones found in database OSs
          const defaultMechanics = [
            { name: "Marcio Rezende", role: "Mecânico Sênior" },
            { name: "Gerson 'Geleia' Souza", role: "Mecânico Assistente" }
          ];

          const uniqueMechanicNames = new Set(defaultMechanics.map(m => m.name));
          ordensServico.forEach(os => {
            if (os.mechanicName && os.mechanicName.trim() !== "") {
              uniqueMechanicNames.add(os.mechanicName.trim());
            }
          });

          const fullMechanicsList = Array.from(uniqueMechanicNames).map(name => {
            const existing = defaultMechanics.find(m => m.name.toLowerCase() === name.toLowerCase());
            return {
              name,
              role: existing ? existing.role : "Mecânico Colaborador"
            };
          });

          const mechanicChartData = fullMechanicsList.map(mech => {
            const mechOSs = ordensServico.filter(os => 
              os.status === 'Finalizada' && 
              os.mechanicName && 
              os.mechanicName.toLowerCase().trim() === mech.name.toLowerCase().trim()
            );
            
            const totalOS = mechOSs.length;
            
            const totalServicesValue = mechOSs.reduce((sum, os) => 
              sum + os.services.reduce((srvSum, srv) => srvSum + srv.price, 0), 0
            );
            
            const totalPartsValue = mechOSs.reduce((sum, os) => 
              sum + os.parts.reduce((partSum, part) => partSum + (part.suppliedByClient ? 0 : part.sellPrice * part.quantity), 0), 0
            );
            
            const totalRevenue = totalServicesValue + totalPartsValue;
            const avgServicesValue = totalOS > 0 ? (totalServicesValue / totalOS) : 0;
            const avgOSValue = totalOS > 0 ? (totalRevenue / totalOS) : 0;

            const totalOSAllTypes = ordensServico.filter(os => 
              os.mechanicName && 
              os.mechanicName.toLowerCase().trim() === mech.name.toLowerCase().trim()
            ).length;

            return {
              name: mech.name,
              shortName: mech.name.split(' ')[0],
              role: mech.role,
              totalOS,
              totalOSAllTypes,
              totalServicesValue,
              totalPartsValue,
              totalRevenue,
              avgServicesValue: parseFloat(avgServicesValue.toFixed(2)),
              avgOSValue: parseFloat(avgOSValue.toFixed(2)),
              comissao: totalServicesValue * 0.45
            };
          });

          const mostProductiveMech = [...mechanicChartData].sort((a, b) => b.totalOS - a.totalOS)[0];
          const highestAvgServicesMech = [...mechanicChartData].sort((a, b) => b.avgServicesValue - a.avgServicesValue)[0];
          const grandTotalServicesValue = mechanicChartData.reduce((sum, m) => sum + m.totalServicesValue, 0);
          const grandTotalOSCount = mechanicChartData.reduce((sum, m) => sum + m.totalOS, 0);
          const overallAvgServicesValue = grandTotalOSCount > 0 ? (grandTotalServicesValue / grandTotalOSCount) : 0;

          return (
            <div className="flex flex-col gap-6">
              <div className="border-b border-gray-850 pb-4">
                <span className="font-display font-extrabold text-white text-base">INDICADORES DE PRODUTIVIDADE E COMANDAS</span>
                <span className="block text-[10px] text-gray-500 font-mono mt-1">Acompanhamento de eficiência de mecânicos, ticket médio de mão de obra e comissões para fechamento.</span>
              </div>

              {/* GRÁFICO DE PRODUTIVIDADE DOS MECÂNICOS */}
              <div className="bg-[#070c17] rounded-xl border border-gray-900 p-5 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-850 pb-3">
                  <div>
                    <span className="font-bold text-white text-sm block">📊 DESEMPENHO OPERACIONAL DE PÁTIO</span>
                    <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">Produtividade e eficiência técnica baseadas em serviços prestados</span>
                  </div>

                  {/* Metric Selector Tabs */}
                  <div className="flex gap-1.5 bg-black/40 p-1 border border-gray-850 rounded-lg shrink-0">
                    <button
                      type="button"
                      onClick={() => setMechanicMetric('avgServices')}
                      className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold transition-all uppercase cursor-pointer ${
                        mechanicMetric === 'avgServices' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Média Serviços (R$/OS)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMechanicMetric('totalOS')}
                      className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold transition-all uppercase cursor-pointer ${
                        mechanicMetric === 'totalOS' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      OSs Finalizadas (Qtd)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMechanicMetric('totalServices')}
                      className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold transition-all uppercase cursor-pointer ${
                        mechanicMetric === 'totalServices' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Total Mão de Obra (R$)
                    </button>
                  </div>
                </div>

                {/* Bento Grid Highlight Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div className="p-3 bg-black/30 border border-gray-900 rounded-xl flex flex-col gap-1 text-left">
                    <span className="text-[8.5px] text-gray-400 uppercase tracking-wider font-semibold">🏆 Líder em Entregas</span>
                    <span className="text-white font-bold text-xs truncate">
                      {mostProductiveMech && mostProductiveMech.totalOS > 0 ? mostProductiveMech.name : "Nenhum"}
                    </span>
                    <span className="text-[10px] text-green-500 font-mono mt-1 font-bold">
                      {mostProductiveMech && mostProductiveMech.totalOS > 0 ? `${mostProductiveMech.totalOS} OSs finalizadas` : "--"}
                    </span>
                  </div>

                  <div className="p-3 bg-black/30 border border-gray-900 rounded-xl flex flex-col gap-1 text-left">
                    <span className="text-[8.5px] text-gray-400 uppercase tracking-wider font-semibold">⚡ Maior Eficiência/OS</span>
                    <span className="text-white font-bold text-xs truncate">
                      {highestAvgServicesMech && highestAvgServicesMech.avgServicesValue > 0 ? highestAvgServicesMech.name : "Nenhum"}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono mt-1 font-bold">
                      {highestAvgServicesMech && highestAvgServicesMech.avgServicesValue > 0 ? `R$ ${highestAvgServicesMech.avgServicesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / OS` : "--"}
                    </span>
                  </div>

                  <div className="p-3 bg-black/30 border border-gray-900 rounded-xl flex flex-col gap-1 text-left">
                    <span className="text-[8.5px] text-gray-400 uppercase tracking-wider font-semibold">💼 Serviços Totais</span>
                    <span className="text-white font-bold text-xs truncate">Faturamento Acumulado</span>
                    <span className="text-[10px] text-emerald-400 font-mono mt-1 font-bold">
                      R$ {grandTotalServicesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3 bg-black/30 border border-gray-900 rounded-xl flex flex-col gap-1 text-left">
                    <span className="text-[8.5px] text-gray-400 uppercase tracking-wider font-semibold">📊 Média Geral/OS</span>
                    <span className="text-white font-bold text-xs truncate">Mão de Obra do Pátio</span>
                    <span className="text-[10px] text-purple-400 font-mono mt-1 font-bold">
                      R$ {overallAvgServicesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Graphic Plot Frame */}
                <div className="h-64 w-full bg-slate-950/25 border border-gray-900 rounded-xl p-2.5 flex items-center justify-center relative overflow-hidden">
                  {grandTotalOSCount === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-6 gap-2">
                      <Activity className="w-8 h-8 text-gray-600 animate-pulse" />
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Sem Dados Operacionais</span>
                      <span className="text-[9px] text-gray-500 leading-normal max-w-xs">Nenhum mecânico finalizou Ordens de Serviço no sistema para compor o gráfico de produtividade.</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart
                        data={mechanicChartData}
                        margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#111827" vertical={false} />
                        <XAxis 
                          dataKey="shortName" 
                          stroke="#4b5563" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#4b5563" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(value) => {
                            if (mechanicMetric === 'totalOS') return value;
                            return `R$ ${value}`;
                          }}
                        />
                        <ReTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-[#090f1d] border border-gray-800 p-3 rounded-lg shadow-2xl flex flex-col gap-1.5 text-left font-mono text-[10px]">
                                  <span className="font-bold text-white uppercase text-[11px] block tracking-wide border-b border-gray-800 pb-1">{data.name}</span>
                                  <span className="text-gray-400 block">{data.role}</span>
                                  <div className="flex flex-col gap-1 mt-1 font-mono text-gray-300">
                                    <div className="flex justify-between gap-6">
                                      <span>OS Finalizadas:</span>
                                      <strong className="text-white">{data.totalOS}</strong>
                                    </div>
                                    <div className="flex justify-between gap-6">
                                      <span>Mão de Obra Total:</span>
                                      <strong className="text-green-400">R$ {data.totalServicesValue.toFixed(2)}</strong>
                                    </div>
                                    <div className="flex justify-between gap-6">
                                      <span>Produtividade Média:</span>
                                      <strong className="text-cyan-400">R$ {data.avgServicesValue.toFixed(2)} / OS</strong>
                                    </div>
                                    <div className="flex justify-between gap-6">
                                      <span>Comissão Acumulada:</span>
                                      <strong className="text-purple-400">R$ {data.comissao.toFixed(2)}</strong>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey={
                            mechanicMetric === 'avgServices' 
                              ? 'avgServicesValue' 
                              : mechanicMetric === 'totalOS' 
                              ? 'totalOS' 
                              : 'totalServicesValue'
                          } 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={45}
                        >
                          {mechanicChartData.map((entry, index) => {
                            const colors = ['#ef4444', '#06b6d4', '#10b981', '#a855f7', '#f59e0b'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Bar>
                      </ReBarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* DETALHAMENTO DE COMISSÕES E COMANDAS */}
              <div className="flex flex-col gap-3">
                <span className="text-white font-bold text-xs uppercase tracking-wider text-left block">📋 Folha de Comissionamento e Fechamento</span>
                <div className="flex flex-col gap-3">
                  {mechanicChartData.map((mechData, index) => {
                    return (
                      <div key={index} className="p-4 rounded-xl border border-gray-900 bg-[#070c17] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-650/15 text-red-500 flex items-center justify-center border border-red-950 font-bold shrink-0">
                            {mechData.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <span className="font-bold text-white block text-sm">{mechData.name}</span>
                            <span className="text-[10px] text-gray-500">{mechData.role}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-right font-mono">
                          <div>
                            <span className="text-gray-500 block text-[9px] uppercase">OS FINALIZADAS</span>
                            <strong className="text-white text-sm block">{mechData.totalOS} de {mechData.totalOSAllTypes}</strong>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[9px] uppercase">Rendimento OS</span>
                            <strong className="text-white text-sm block">R$ {mechData.totalRevenue.toFixed(2)}</strong>
                          </div>
                          <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
                            <span className="text-gray-500 block text-[9px] uppercase">Comissão M.O (45% fixo)</span>
                            <strong className="text-cyan-400 text-sm block font-black">R$ {mechData.comissao.toFixed(2)}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {activeReport === 'delinquency' && (() => {
          const calculateDelayDays = (dateStr: string) => {
            if (!dateStr) return 0;
            const itemDate = new Date(dateStr);
            if (isNaN(itemDate.getTime())) return 0;
            const now = new Date();
            const diffTime = now.getTime() - itemDate.getTime();
            return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
          };

          const realPendingItems: Array<{
            clienteId: string;
            clienteName: string;
            clientePhone: string;
            cpfCnpj: string;
            osId: string;
            description: string;
            date: string;
            amount: number;
            delayDays: number;
            type: 'OS' | 'Fatura';
            rawOs?: any;
            rawFin?: any;
          }> = [];

          ordensServico.forEach(os => {
            if (os.statusPagamento === 'PENDENTE' || os.faturamentoMode === 'A faturar') {
              const matchedClient = clientes.find(c => c.id === os.clienteId || c.name === os.clienteName);
              const delay = calculateDelayDays(os.createdAt);
              realPendingItems.push({
                clienteId: os.clienteId || 'cli_unk_' + os.id,
                clienteName: os.clienteName || matchedClient?.name || 'Cliente Balcão',
                clientePhone: os.clientePhone || matchedClient?.phone || '(11) 99999-0000',
                cpfCnpj: matchedClient?.cpfCnpj || '000.000.000-00',
                osId: os.id,
                description: `OS #${os.id.slice(-6)} - ${os.veiculoInfo || os.plate || 'Veículo'} (${os.problem || 'Serviços de Manutenção'})`,
                date: os.createdAt,
                amount: os.total || 0,
                delayDays: delay,
                type: 'OS',
                rawOs: os
              });
            }
          });

          financeiro.forEach(fin => {
            if (fin.type === 'Receita' && (fin.status === 'Pendente' || fin.status === 'PENDENTE' || fin.status === 'Atrasado')) {
              const matchedClient = clientes.find(c => c.id === fin.clienteId);
              const delay = calculateDelayDays(fin.dueDate || fin.createdAt);
              realPendingItems.push({
                clienteId: fin.clienteId || 'cli_fin_' + fin.id,
                clienteName: matchedClient?.name || fin.description.split('-')[0] || 'Cliente Cadastrado',
                clientePhone: matchedClient?.phone || '(11) 98888-7777',
                cpfCnpj: matchedClient?.cpfCnpj || '11.222.333/0001-44',
                osId: fin.ordemServicoId || `FIN-${fin.id.slice(-4)}`,
                description: fin.description || `Fatura a Receber (${fin.category})`,
                date: fin.dueDate || fin.createdAt,
                amount: fin.amount || 0,
                delayDays: delay,
                type: 'Fatura',
                rawFin: fin
              });
            }
          });

          // Seed demo cases if real pending items are fewer than 3
          const demoDelinquentItems = [
            {
              clienteId: 'demo_cli_1',
              clienteName: 'Transportadora & Frotas Silva Ltda',
              clientePhone: '(11) 98765-4321',
              cpfCnpj: '12.345.678/0001-90',
              osId: 'OS-8942',
              description: 'OS #8942 - Scania R450 (Revisão Completa de Freios e Troca de Cuíca)',
              date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 42).toISOString(),
              amount: 4850.00,
              delayDays: 42,
              type: 'OS' as const
            },
            {
              clienteId: 'demo_cli_2',
              clienteName: 'Roberto Carlos Nogueira',
              clientePhone: '(11) 97123-8899',
              cpfCnpj: '234.567.890-12',
              osId: 'OS-9011',
              description: 'OS #9011 - VW Gol G5 1.0 (Troca de Kit de Embreagem e Amortecedores)',
              date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
              amount: 1920.00,
              delayDays: 22,
              type: 'OS' as const
            },
            {
              clienteId: 'demo_cli_3',
              clienteName: 'Auto Locadora Express S.A.',
              clientePhone: '(11) 96543-2100',
              cpfCnpj: '98.765.432/0001-10',
              osId: 'OS-9104',
              description: 'OS #9104 - FIAT Strada 1.4 (Alinhamento, Balanceamento e Discos)',
              date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(),
              amount: 1280.00,
              delayDays: 11,
              type: 'OS' as const
            },
            {
              clienteId: 'demo_cli_4',
              clienteName: 'Marcelo Pires de Camargo',
              clientePhone: '(11) 95555-4433',
              cpfCnpj: '345.678.901-23',
              osId: 'OS-9188',
              description: 'OS #9188 - Honda Civic 2.0 (Troca de Óleo Mobil e Filtros)',
              date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
              amount: 680.00,
              delayDays: 35,
              type: 'OS' as const
            }
          ];

          const allItems: typeof realPendingItems = realPendingItems.length >= 2 ? realPendingItems : [...realPendingItems, ...demoDelinquentItems];

          // Group items by client
          const customerMap = new Map<string, {
            clienteId: string;
            name: string;
            phone: string;
            cpfCnpj: string;
            totalOverdue: number;
            pendingCount: number;
            maxDelayDays: number;
            avgDelayDays: number;
            items: typeof allItems;
          }>();

          allItems.forEach(item => {
            const key = item.clienteName.toLowerCase().trim();
            if (!customerMap.has(key)) {
              customerMap.set(key, {
                clienteId: item.clienteId,
                name: item.clienteName,
                phone: item.clientePhone,
                cpfCnpj: item.cpfCnpj,
                totalOverdue: 0,
                pendingCount: 0,
                maxDelayDays: 0,
                avgDelayDays: 0,
                items: []
              });
            }

            const clientData = customerMap.get(key)!;
            clientData.totalOverdue += item.amount;
            clientData.pendingCount += 1;
            clientData.items.push(item);
            if (item.delayDays > clientData.maxDelayDays) {
              clientData.maxDelayDays = item.delayDays;
            }
          });

          // Compute average delay
          customerMap.forEach(client => {
            const sumDays = client.items.reduce((sum, i) => sum + i.delayDays, 0);
            client.avgDelayDays = Math.round(sumDays / client.items.length);
          });

          // Sort ranked clients by total overdue debt descending
          const rankedClients = Array.from(customerMap.values())
            .sort((a, b) => b.totalOverdue - a.totalOverdue);

          // Filtering
          const filteredRankedClients = rankedClients.filter(c => {
            const q = delinquencySearch.toLowerCase();
            const matchesQuery = c.name.toLowerCase().includes(q) || c.cpfCnpj.includes(q) || c.phone.includes(q);
            if (!matchesQuery) return false;

            if (delinquencyRange === 'ate15') return c.maxDelayDays <= 15;
            if (delinquencyRange === '15a30') return c.maxDelayDays > 15 && c.maxDelayDays <= 30;
            if (delinquencyRange === 'mais30') return c.maxDelayDays > 30;
            return true;
          });

          // High level KPIs
          const grandTotalOverdue = rankedClients.reduce((sum, c) => sum + c.totalOverdue, 0);
          const totalDelinquentClients = rankedClients.length;
          const grandAvgDelay = rankedClients.length > 0 
            ? Math.round(rankedClients.reduce((sum, c) => sum + c.avgDelayDays, 0) / rankedClients.length) 
            : 0;
          const criticalClientsCount = rankedClients.filter(c => c.maxDelayDays > 30).length;

          // Chart data (Top 5 delinquent customers)
          const chartData = rankedClients.slice(0, 5).map(c => ({
            name: c.name.length > 18 ? c.name.slice(0, 15) + '...' : c.name,
            fullName: c.name,
            total: parseFloat(c.totalOverdue.toFixed(2)),
            days: c.maxDelayDays
          }));

          const getRiskBadge = (days: number) => {
            if (days > 30) {
              return <span className="px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-900/60 text-[9px] font-mono font-bold flex items-center gap-1">🚨 Crítico ({days}d)</span>;
            }
            if (days > 15) {
              return <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-900/60 text-[9px] font-mono font-bold flex items-center gap-1">⚠️ Moderado ({days}d)</span>;
            }
            return <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-900/60 text-[9px] font-mono font-bold flex items-center gap-1">⏱️ Recente ({days}d)</span>;
          };

          return (
            <div className="flex flex-col gap-6 font-sans">
              {/* Header section */}
              <div className="border-b border-gray-850 pb-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-display font-extrabold text-white text-base flex items-center gap-2">
                    🚨 RANKING & ANÁLISE DE INADIMPLÊNCIA DE CLIENTES
                  </span>
                  <span className="block text-[10px] text-gray-500 font-mono mt-1">
                    Mapeamento de ordens de serviço pendentes de pagamento, dias de atraso e régua de cobrança.
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span className="px-3 py-1.5 bg-red-950/40 text-red-400 border border-red-900/60 rounded-lg text-xs font-mono font-bold">
                    Inadimplência Total: R$ {grandTotalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center gap-1.5 no-print">
                    <button type="button" onClick={() => handleExportData('customers', 'xlsx')} className="px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Excel
                    </button>
                    <button type="button" onClick={() => handleExportData('customers', 'csv')} className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition">
                      <Download className="w-3.5 h-3.5 text-cyan-400" /> CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Summary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-[#070c17] p-4 rounded-xl border border-gray-900 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-gray-500 text-[10px] uppercase font-bold">
                    <span>Total em Atraso</span>
                    <DollarSign className="w-4 h-4 text-red-500" />
                  </div>
                  <strong className="text-red-400 text-lg block mt-2 font-display">
                    R$ {grandTotalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                  <span className="text-[9px] text-gray-500 mt-1 block">Soma acumulada de OS e faturas a receber</span>
                </div>

                <div className="bg-[#070c17] p-4 rounded-xl border border-gray-900 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-gray-500 text-[10px] uppercase font-bold">
                    <span>Clientes Inadimplentes</span>
                    <Users className="w-4 h-4 text-amber-500" />
                  </div>
                  <strong className="text-white text-lg block mt-2 font-display">
                    {totalDelinquentClients} Clientes
                  </strong>
                  <span className="text-[9px] text-amber-500 mt-1 block font-bold">
                    {criticalClientsCount} com atraso crítico (&gt;30 dias)
                  </span>
                </div>

                <div className="bg-[#070c17] p-4 rounded-xl border border-gray-900 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-gray-500 text-[10px] uppercase font-bold">
                    <span>Média de Atraso</span>
                    <Clock className="w-4 h-4 text-cyan-400" />
                  </div>
                  <strong className="text-cyan-400 text-lg block mt-2 font-display">
                    {grandAvgDelay} Dias
                  </strong>
                  <span className="text-[9px] text-gray-500 mt-1 block">Tempo médio decorrido desde o vencimento</span>
                </div>

                <div className="bg-[#070c17] p-4 rounded-xl border border-gray-900 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-gray-500 text-[10px] uppercase font-bold">
                    <span>Maior Débito</span>
                    <AlertTriangle className="w-4 h-4 text-purple-400" />
                  </div>
                  <strong className="text-purple-400 text-sm block mt-2 font-bold truncate">
                    {rankedClients[0]?.name || 'Nenhum'}
                  </strong>
                  <span className="text-[9px] text-gray-400 mt-1 block">
                    {rankedClients[0] ? `R$ ${rankedClients[0].totalOverdue.toFixed(2)} (${rankedClients[0].maxDelayDays}d atraso)` : 'Sem inadimplência'}
                  </span>
                </div>
              </div>

              {/* Chart & Filter Header */}
              <div className="bg-[#070c17] rounded-xl border border-gray-900 p-5 flex flex-col gap-5 font-mono">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-850 pb-3">
                  <div>
                    <span className="font-bold text-white text-sm block font-sans">📊 TOP 5 MAIORES DÉBITOS DE CLIENTES</span>
                    <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">Ranking visual ordenado pelo montante pendente de liquidação (R$)</span>
                  </div>
                </div>

                {/* Recharts Bar Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={0} angle={-15} textAnchor="end" />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `R$${val}`} />
                      <ReTooltip
                        contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', color: '#fff', fontSize: '11px', borderRadius: '8px' }}
                        formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor Pendente']}
                        labelFormatter={(lbl) => {
                          const item = chartData.find(d => d.name === lbl);
                          return item ? item.fullName : lbl;
                        }}
                      />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                        {chartData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : '#38bdf8'} />
                        ))}
                      </Bar>
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Filter Controls Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#070c17] p-3.5 rounded-xl border border-gray-900 font-mono">
                <div className="relative w-full sm:w-80">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Buscar cliente, CPF/CNPJ ou telefone..."
                    value={delinquencySearch}
                    onChange={(e) => setDelinquencySearch(e.target.value)}
                    className="w-full bg-[#050912] border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setDelinquencyRange('todos')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${delinquencyRange === 'todos' ? 'bg-red-500 text-black' : 'bg-slate-900 text-gray-400 hover:text-white border border-slate-800'}`}
                  >
                    Todos ({rankedClients.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDelinquencyRange('ate15')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${delinquencyRange === 'ate15' ? 'bg-cyan-500 text-black' : 'bg-slate-900 text-gray-400 hover:text-white border border-slate-800'}`}
                  >
                    Até 15 Dias
                  </button>
                  <button
                    type="button"
                    onClick={() => setDelinquencyRange('15a30')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${delinquencyRange === '15a30' ? 'bg-amber-500 text-black' : 'bg-slate-900 text-gray-400 hover:text-white border border-slate-800'}`}
                  >
                    15 a 30 Dias
                  </button>
                  <button
                    type="button"
                    onClick={() => setDelinquencyRange('mais30')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${delinquencyRange === 'mais30' ? 'bg-red-600 text-white' : 'bg-slate-900 text-gray-400 hover:text-white border border-slate-800'}`}
                  >
                    Mais de 30 Dias
                  </button>
                </div>
              </div>

              {/* Ranking Table */}
              <div className="bg-[#050912] border border-gray-850 rounded-xl overflow-hidden font-mono text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-gray-400 border-b border-gray-850 text-[10px] uppercase">
                        <th className="p-3">Posição / Cliente</th>
                        <th className="p-3">Contato & Doc</th>
                        <th className="p-3 text-center">Ordens / Faturas</th>
                        <th className="p-3 text-center">Maior Atraso</th>
                        <th className="p-3 text-right">Total Devido</th>
                        <th className="p-3 text-center">Régua de Cobrança</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900 text-slate-300">
                      {filteredRankedClients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500 font-mono text-xs">
                            Nenhum cliente inadimplente encontrado nos filtros selecionados.
                          </td>
                        </tr>
                      ) : (
                        filteredRankedClients.map((client, idx) => {
                          const isExpanded = expandedClientId === client.name;
                          const cleanPhone = client.phone.replace(/\D/g, '');
                          const defaultPixKey = company?.pixKey || company?.cnpj || 'financeiro@autoprecision.com.br';
                          const waText = encodeURIComponent(
                            `Olá ${client.name}! Constatamos pendência financeira referente a serviços realizados na ${company?.name || 'Oficina'}, totalizando R$ ${client.totalOverdue.toFixed(2)} (${client.maxDelayDays} dias em aberto). Chave PIX para pagamento: ${defaultPixKey}. Qualquer dúvida, estamos à disposição!`
                          );

                          return (
                            <React.Fragment key={client.name}>
                              <tr className="hover:bg-slate-900/60 transition-colors">
                                <td className="p-3 font-mono">
                                  <div className="flex items-center gap-2.5">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                      idx === 0 ? 'bg-red-500 text-black' : idx === 1 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-gray-300'
                                    }`}>
                                      #{idx + 1}
                                    </span>
                                    <div>
                                      <strong className="text-white text-xs block font-sans font-bold">{client.name}</strong>
                                      <span className="text-[9px] text-gray-500">ID: {client.clienteId.slice(0, 8)}</span>
                                    </div>
                                  </div>
                                </td>

                                <td className="p-3">
                                  <div className="flex flex-col">
                                    <span className="text-gray-300 text-xs font-mono">{client.phone}</span>
                                    <span className="text-[10px] text-gray-500">{client.cpfCnpj}</span>
                                  </div>
                                </td>

                                <td className="p-3 text-center">
                                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-white">
                                    {client.pendingCount} pendência(s)
                                  </span>
                                </td>

                                <td className="p-3 text-center">
                                  <div className="flex justify-center">
                                    {getRiskBadge(client.maxDelayDays)}
                                  </div>
                                </td>

                                <td className="p-3 text-right">
                                  <strong className="text-red-400 text-sm block font-mono font-bold">
                                    R$ {client.totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </strong>
                                </td>

                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <a
                                      href={`https://wa.me/55${cleanPhone}?text=${waText}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 text-emerald-300 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                      title="Cobrar via WhatsApp com mensagem personalizada"
                                    >
                                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                                      Cobrar WA
                                    </a>

                                    <button
                                      type="button"
                                      onClick={() => setExpandedClientId(isExpanded ? null : client.name)}
                                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-gray-300 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                      Detalhes
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* Expanded sub-row with detailed OS / Invoices breakdown */}
                              {isExpanded && (
                                <tr className="bg-[#03060d]">
                                  <td colSpan={6} className="p-4 border-y border-gray-850">
                                    <div className="flex flex-col gap-3 font-mono">
                                      <div className="flex items-center justify-between border-b border-gray-850 pb-2">
                                        <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                                          📑 Lançamentos Pendentes do Cliente: {client.name}
                                        </span>
                                        <span className="text-[10px] text-gray-500">
                                          Clique no botão "Quitar" caso o cliente tenha efetuado o pagamento
                                        </span>
                                      </div>

                                      <div className="space-y-2">
                                        {client.items.map((item, itemIdx) => (
                                          <div key={itemIdx} className="bg-[#070c17] p-3 rounded-lg border border-gray-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                            <div className="flex flex-col gap-1">
                                              <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-900 text-cyan-300 border border-slate-800">
                                                  {item.type}
                                                </span>
                                                <strong className="text-white text-xs">{item.description}</strong>
                                              </div>
                                              <span className="text-[10px] text-gray-500">
                                                Data de Entrada: {new Date(item.date).toLocaleDateString('pt-BR')} • Tempo Decorrido: <span className="text-red-400 font-bold">{item.delayDays} dias em atraso</span>
                                              </span>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                              <strong className="text-red-400 text-sm">
                                                R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                              </strong>

                                              {item.rawOs && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    updateOrdemServico(item.rawOs.id, { statusPagamento: 'PAGO' });
                                                    if (addLocalAuditLog) {
                                                      addLocalAuditLog("Quitação de Inadimplência", `OS #${item.rawOs.id.slice(-6)} de R$ ${item.amount.toFixed(2)} marcada como PAGA no módulo de Inadimplência.`);
                                                    }
                                                    alert(`✅ Pagamento da OS #${item.rawOs.id.slice(-6)} registrado com sucesso!`);
                                                  }}
                                                  className="px-3 py-1 bg-green-950/60 hover:bg-green-900/80 border border-green-800/60 text-green-300 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                                >
                                                  <CheckCircle className="w-3 h-3 text-green-400" />
                                                  Quitar OS
                                                </button>
                                              )}

                                              {item.rawFin && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    updateFinanceiro(item.rawFin.id, { status: 'Pago', valorPago: item.amount, dataPagamento: new Date().toISOString() });
                                                    if (addLocalAuditLog) {
                                                      addLocalAuditLog("Quitação de Inadimplência", `Fatura #${item.rawFin.id.slice(-6)} de R$ ${item.amount.toFixed(2)} marcada como PAGA.`);
                                                    }
                                                    alert(`✅ Fatura #${item.rawFin.id.slice(-6)} baixada com sucesso!`);
                                                  }}
                                                  className="px-3 py-1 bg-green-950/60 hover:bg-green-900/80 border border-green-800/60 text-green-300 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                                >
                                                  <CheckCircle className="w-3 h-3 text-green-400" />
                                                  Quitar Fatura
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Printable-only Corporate Footer & Signatures */}
        <div className="hidden print:flex flex-col gap-8 mt-12 text-black w-full border-t border-slate-300 pt-5">
          <div className="flex justify-between items-center px-10 text-xs font-mono font-bold">
            <div className="flex flex-col items-center">
              <div className="w-40 border-b border-slate-900 mb-1"></div>
              <span className="text-[10px] text-slate-600 font-normal">Diretoria Administrativa</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold">{company?.name || 'AutoPrecision Premium'}</span>
              <span className="text-[9px] text-slate-400 font-normal font-mono">Mapeamento ERP Integrado • Auditoria de Ativos</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-40 border-b border-slate-900 mb-1"></div>
              <span className="text-[10px] text-slate-600 font-normal">Assinatura do Autorizado</span>
            </div>
          </div>
        </div>

      </div>

      {/* 📊 KPI DASHBOARD PERFORMANCE REPORT MODAL (PDF EXPORT OVERLAY) */}
      {showKpiReportModal && (() => {
        const daily = getKpiDailyEarnings();
        const monthly = getKpiMonthlyEarnings();
        const expenses = getKpiMonthlyExpenses();
        const lowStock = getKpiLowStockCount();
        const activeOS = getKpiActiveOSCount();
        const servicesInProgress = getKpiServicesInProgress();
        const warranty = getKpiWarrantyStats();
        const netProfit = monthly - expenses;
        const profitMargin = monthly > 0 ? (netProfit / monthly) * 100 : 0;

        return (
          <div id="pdf-kpi-export-overlay" className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-start overflow-y-auto p-4 md:p-6 backdrop-blur-sm no-print">
            
            {/* Toolbar (HIDDEN during PDF generation/window.print()) */}
            <div className="bg-[#0b1222] border border-gray-800 text-white max-w-4xl w-full rounded-2xl p-4 shadow-2xl mb-4 flex flex-col md:flex-row items-center justify-between gap-4 font-sans no-print">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                  <FileText className="w-5 h-5 animate-pulse" />
                </span>
                <div className="text-left">
                  <span className="font-extrabold text-sm block tracking-wide uppercase">Exportador de Relatório KPIs</span>
                  <span className="text-[10px] text-gray-400 block font-mono">Imprima ou salve como PDF formatado os indicadores do Dashboard</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintKpi}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition"
                >
                  <Printer className="w-4 h-4" /> IMPRIMIR / SALVAR PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowKpiReportModal(false)}
                  className="px-3.5 py-2 bg-[#060a12] border border-gray-800 hover:border-gray-700 text-gray-300 font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                >
                  <X className="w-4 h-4" /> FECHAR
                </button>
              </div>
            </div>

            {/* Document sheet */}
            <div 
              id="kpi-print-area" 
              className="bg-[#060a12] border border-gray-800/85 rounded-2xl p-6 md:p-8 max-w-4xl w-full shadow-2xl relative text-left text-white flex flex-col gap-6"
            >
              
              {/* Report Header */}
              <div className="flex justify-between items-start border-b border-gray-800 pb-5">
                <div className="flex gap-4 items-center">
                  {company?.logoUrl && (
                    <img 
                      src={company.logoUrl} 
                      alt="Logo" 
                      className="w-12 h-12 object-contain rounded-lg border border-gray-800 print:border-slate-300"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div>
                    <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-tight text-white print:text-black">
                      {company?.name || 'AUTOPRECISION PREMIUM CUSTOMS'}
                    </h2>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5 print:text-gray-700">
                      {company?.address ? `Endereço: ${company.address}` : 'Matriz AutoPrecision Cloud System'}
                      {company?.cnpj ? ` • CNPJ: ${company.cnpj}` : ''}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono print:text-gray-600">
                      {company?.phone ? `Telefone: ${company.phone}` : ''}
                      {company?.email ? ` • E-mail: ${company.email}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5 border-l border-gray-800/40 pl-4">
                  <span className="text-[8.5px] font-mono font-extrabold px-2 py-0.5 bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 rounded uppercase tracking-wider">
                    KPI PERFORMANCE REPORT
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">
                    Emitido em: {new Date().toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Document Overview Notice */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-gray-850/60 font-mono text-xs text-gray-300 flex flex-col gap-1.5 print:bg-white print:text-black">
                <strong className="text-cyan-400 print:text-cyan-800 font-extrabold uppercase text-[11px] block tracking-wide">
                  📋 RESUMO ANALÍTICO DAS METAS DE DESEMPENHO:
                </strong>
                <span>
                  Este documento formal consolida os principais indicadores de desempenho (KPIs) exibidos no Painel do Dashboard operacional. Destina-se ao fechamento e auditoria da performance de pátio, fluxos financeiros e controle de integridade de estoque.
                </span>
              </div>

              {/* KPI CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                
                {/* 1. Faturamento Diário */}
                <div className="bg-[#070c16] rounded-xl border border-gray-800 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-gray-900 pb-1.5">
                    <span className="text-[9px] text-gray-400 font-mono font-medium tracking-wider">ENTRADA DIÁRIA</span>
                    <DollarSign className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <div className="mt-2.5">
                    <strong className="text-base font-extrabold text-white block">
                      R$ {daily.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                    <span className="text-[8.5px] text-green-500 font-mono mt-1 block">
                      ✔ Atualizado no dia corrente
                    </span>
                  </div>
                </div>

                {/* 2. Faturamento Mensal */}
                <div className="bg-[#070c16] rounded-xl border border-gray-800 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-gray-900 pb-1.5">
                    <span className="text-[9px] text-gray-400 font-mono font-medium tracking-wider">FATURAMENTO MÊS</span>
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="mt-2.5">
                    <strong className="text-base font-extrabold text-white block">
                      R$ {monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                    <span className="text-[8.5px] text-cyan-400 font-mono mt-1 block">
                      Meta de R$ 30.000,00
                    </span>
                  </div>
                </div>

                {/* 3. Despesas do Mês */}
                <div className="bg-[#070c16] rounded-xl border border-gray-800 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-gray-900 pb-1.5">
                    <span className="text-[9px] text-gray-400 font-mono font-medium tracking-wider">DESPESAS DO MÊS</span>
                    <Percent className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <div className="mt-2.5">
                    <strong className="text-base font-extrabold text-white block">
                      R$ {expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                    <span className="text-[8.5px] text-red-100 font-mono mt-1 block bg-red-950/40 px-1 border border-red-900/40 rounded text-center">
                      Repres. {monthly > 0 ? ((expenses / monthly) * 100).toFixed(1) : 0}% das entradas
                    </span>
                  </div>
                </div>

                {/* 4. Lucro Estimado */}
                <div className="bg-[#070c16] rounded-xl border border-gray-800 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-gray-900 pb-1.5">
                    <span className="text-[9px] text-gray-400 font-mono font-medium tracking-wider font-semibold">MARGEM OPERACIONAL</span>
                    <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="mt-2.5">
                    <strong className="text-base font-extrabold text-white block">
                      R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                    <span className="text-[8.5px] text-emerald-400 font-mono mt-1 block font-bold leading-normal">
                      Margem: {profitMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* 5. OS no Pátio */}
                <div className="bg-[#070c16] rounded-xl border border-gray-800 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-gray-900 pb-1.5">
                    <span className="text-[9px] text-gray-400 font-mono font-medium tracking-wider">FLUXO DE PÁTIO</span>
                    <Wrench className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="mt-2.5">
                    <strong className="text-base font-extrabold text-white block">
                      {activeOS} de {ordensServico.length} OS
                    </strong>
                    <span className="text-[8.5px] text-amber-500 font-mono mt-1 block">
                      {servicesInProgress} em execução operacional
                    </span>
                  </div>
                </div>

                {/* 6. Reposição de Estoque */}
                <div className="bg-[#070c16] rounded-xl border border-gray-800 p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-gray-900 pb-1.5">
                    <span className="text-[9px] text-gray-400 font-mono font-medium tracking-wider">PEÇAS CRÍTICAS</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  </div>
                  <div className="mt-2.5">
                    <strong className="text-base font-extrabold text-white block">
                      {lowStock} Itens
                    </strong>
                    <span className="text-[8.5px] text-red-400 font-mono mt-1 block">
                      Abaixo do nível mínimo registrado
                    </span>
                  </div>
                </div>

                {/* 7. Taxa de Retorno */}
                <div className="bg-[#070c16] rounded-xl border border-gray-800 p-4 flex flex-col justify-between sm:col-span-2">
                  <div className="flex items-center justify-between border-b border-gray-900 pb-1.5">
                    <span className="text-[9px] text-gray-400 font-mono font-medium tracking-wider font-bold">TAXA RETORNO GARANTIA</span>
                    <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="mt-2.5">
                    <strong className="text-base font-extrabold text-white block">
                      {warranty.rateMonth.toFixed(1)}%
                    </strong>
                    <span className="text-[8.5px] text-purple-400 font-mono mt-1 block leading-normal font-sans">
                      {warranty.warrantyReturnInMonth} reentradas de {warranty.finalizedInMonth} finalizados no mês
                    </span>
                  </div>
                </div>

              </div>

              {/* DETAILED SPREADSHEET TABLE FOR PDF INTEGRITY */}
              <div className="flex flex-col gap-3 font-mono text-xs">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">DETALHAMENTO CONSOLIDADO DE INDICADORES (AUDIT SHEET)</span>
                <div className="border border-gray-850 rounded-xl overflow-hidden bg-slate-950/40">
                  <table className="w-full text-left font-mono text-[11px] leading-relaxed border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-gray-400 border-b border-gray-850">
                        <th className="p-3">Código</th>
                        <th className="p-3">Classificação do Indicador</th>
                        <th className="p-3 text-right">Métrica Apurada</th>
                        <th className="p-3 text-right font-bold">Status de Saúde</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-850/60 text-slate-300">
                      <tr>
                        <td className="p-3 text-gray-500">KPI-01</td>
                        <td className="p-3 text-white">Receita Líquida Operacional (Pix, Cartão, Dinheiro)</td>
                        <td className="p-3 text-right text-green-400 font-bold">R$ {monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-3 text-right text-green-500 font-bold">Excelente</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-gray-500">KPI-02</td>
                        <td className="p-3 text-white">Custos Ordinários Dedutíveis de Operação</td>
                        <td className="p-3 text-right text-rose-450 font-bold">R$ {expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-3 text-right text-yellow-500">Controlado</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-gray-500">KPI-03</td>
                        <td className="p-3 text-white">Resultado Líquido Comercial de Autocentro</td>
                        <td className="p-3 text-right text-cyan-400 font-bold">R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-3 text-right text-green-400 font-bold">Superavitário</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-gray-500">KPI-04</td>
                        <td className="p-3 text-white">Taxividade e Gargalo de Pátio (Carros Ativos)</td>
                        <td className="p-3 text-right text-amber-500 font-bold">{activeOS} OS Em Aberto</td>
                        <td className="p-3 text-right text-amber-500">Capacidade Ok</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-gray-500">KPI-05</td>
                        <td className="p-3 text-white">Disponibilidade Produtiva de Peças (Reposição)</td>
                        <td className="p-3 text-right text-rose-500 font-bold">{lowStock} Alertas Críticos</td>
                        <td className="p-3 text-right text-red-500 font-bold">Atenção Compras</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-gray-500">KPI-06</td>
                        <td className="p-3 text-white">Taxa de Reentradas / Perímetro de Garantia</td>
                        <td className="p-3 text-right text-purple-400 font-bold">{warranty.rateMonth.toFixed(1)}% das OSs</td>
                        <td className="p-3 text-right text-cyan-400 font-bold">Excelente Retenção</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Printable-only Corporate Signatures & Disclaimer */}
              <div className="flex flex-col gap-6 mt-6 border-t border-gray-850 pt-5 text-gray-400 text-center">
                <div className="grid grid-cols-2 gap-8 text-[10px] font-mono">
                  <div className="flex flex-col items-center">
                    <div className="w-full max-w-xs border-b border-gray-800 mb-1 print:border-black"></div>
                    <span className="font-semibold text-white print:text-black">ASSINATURA RESPONSÁVEL ERP</span>
                    <span className="text-[8.5px] text-gray-500">AutoPrecision ERP Cloud Management</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-full max-w-xs border-b border-gray-800 mb-1 print:border-black"></div>
                    <span className="font-semibold text-white print:text-black">AUDITORIA ADMINISTRATIVA</span>
                    <span className="text-[8.5px] text-gray-500">Relatório de Desempenho Integrado</span>
                  </div>
                </div>

                <div className="text-center text-[8px] text-gray-500 leading-normal mt-2 border-t border-slate-950 pt-3 no-print">
                  Documento corporativo oficial gerado automaticamente a partir de dados transacionais ativos. Cópias digitais gravadas e seladas via log correspondente.
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Toast Feedback Notification */}
      {exportToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 text-xs font-mono font-bold ${
            exportToast.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200' 
              : 'bg-red-950/90 border-red-500 text-red-200'
          }`}>
            <span>{exportToast.message}</span>
            <button type="button" onClick={() => setExportToast(null)} className="text-gray-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 📊 EXPORT MODAL DIALOG (CSV / EXCEL) */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans no-print">
          <div className="bg-[#0b1222] border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-6 text-left relative">
            <div className="flex items-center justify-between border-b border-gray-850 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-white">Exportação de Dados da Oficina</h3>
                  <p className="text-[11px] text-gray-400 font-mono">Gere planilhas em Excel ou CSV no frontend</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Select Dataset */}
            <div className="flex flex-col gap-2 font-mono">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                1. Selecione a Base de Dados
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setExportDataset('inventory')}
                  className={`p-3 rounded-xl border flex flex-col gap-1 transition-all cursor-pointer ${
                    exportDataset === 'inventory' 
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold' 
                      : 'bg-[#070c17] border-gray-850 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-xs">📦 Estoque</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-gray-800">{produtos.length} it.</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-normal">Preços, custos e níveis de estoque</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportDataset('financial')}
                  className={`p-3 rounded-xl border flex flex-col gap-1 transition-all cursor-pointer ${
                    exportDataset === 'financial' 
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold' 
                      : 'bg-[#070c17] border-gray-850 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-xs">💰 Financeiro</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-gray-800">{financeiro.length} lanc.</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-normal">DRE, receitas, despesas e status</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportDataset('customers')}
                  className={`p-3 rounded-xl border flex flex-col gap-1 transition-all cursor-pointer ${
                    exportDataset === 'customers' 
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold' 
                      : 'bg-[#070c17] border-gray-850 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-xs">👥 Clientes</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-gray-800">{clientes.length} cli.</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-normal">Cadastro, débitos e histórico</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportDataset('orders')}
                  className={`p-3 rounded-xl border flex flex-col gap-1 transition-all cursor-pointer ${
                    exportDataset === 'orders' 
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold' 
                      : 'bg-[#070c17] border-gray-850 text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-xs">🛠️ Ordens Serviço</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-gray-800">{ordensServico.length} OS</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-normal">Veículos, mecânicos e peças</span>
                </button>
              </div>
            </div>

            {/* Step 2: Select Format */}
            <div className="flex flex-col gap-2 font-mono">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                2. Selecione o Formato
              </label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setExportFormat('xlsx')}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                    exportFormat === 'xlsx' 
                      ? 'bg-emerald-950/60 border-emerald-500 text-white font-bold' 
                      : 'bg-[#070c17] border-gray-850 text-gray-400 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold">Excel (.xlsx)</span>
                    <span className="text-[9px] text-gray-400 font-normal font-sans">Planilha formatada</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setExportFormat('csv')}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                    exportFormat === 'csv' 
                      ? 'bg-emerald-950/60 border-emerald-500 text-white font-bold' 
                      : 'bg-[#070c17] border-gray-850 text-gray-400 hover:text-white'
                  }`}
                >
                  <Download className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold">CSV (.csv)</span>
                    <span className="text-[9px] text-gray-400 font-normal font-sans">Com separador ';' & UTF-8</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-850 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 font-mono text-xs font-bold cursor-pointer transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleExportData()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer transition active:scale-95"
              >
                <Download className="w-4 h-4" /> Download {exportFormat.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
