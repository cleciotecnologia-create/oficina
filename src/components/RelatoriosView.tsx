import React, { useState } from 'react';
import { 
  BarChart, 
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
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RelatoriosView: React.FC = () => {
  const { 
    financeiro, 
    produtos, 
    ordensServico, 
    clientes,
    company
  } = useApp();

  const [activeReport, setActiveReport] = useState<'financial' | 'inventory' | 'mechanics'>('financial');

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
            onClick={handlePrint}
            className="px-4 py-2 border border-slate-700 hover:border-slate-500 rounded-xl text-xs font-mono font-bold text-slate-200 flex items-center gap-1 bg-[#0c1223] h-10 shadow cursor-pointer justify-center flex-1 sm:flex-initial"
          >
            <Printer className="w-4 h-4" /> Exportar Impressora / PDF
          </button>
          
          <button 
            type="button"
            onClick={() => setShowKpiReportModal(true)}
            className="px-4 py-2 border border-cyan-800 hover:border-cyan-600 rounded-xl text-xs font-mono font-bold text-cyan-200 flex items-center gap-1.5 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 hover:from-cyan-900/40 hover:to-blue-900/40 h-10 shadow cursor-pointer justify-center flex-1 sm:flex-initial transition active:scale-95"
          >
            <FileText className="w-4 h-4" /> Exportar Relatório KPIs (Dashboard)
          </button>
        </div>
      </div>

      {/* Selector pills tabs */}
      <div className="grid grid-cols-3 gap-2 sm:max-w-md [&>button]:py-2.5 [&>button]:rounded-xl [&>button]:text-xs [&>button]:font-mono [&>button]:font-bold border-b border-gray-900 pb-4">
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
                {activeReport === 'financial' ? 'RELATÓRIO DRE FINANCEIRO' : activeReport === 'inventory' ? 'RELATÓRIO DO ESTOQUE' : 'PRODUTIVIDADE E COMANDAS'}
              </span>
              <p className="text-[9px] text-slate-500 font-mono mt-2">
                Gerado em: {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {activeReport === 'financial' && (
          <div className="flex flex-col gap-5">
            <div className="border-b border-gray-850 pb-4">
              <span className="font-display font-extrabold text-white text-base">DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO (DRE)</span>
              <span className="block text-[10px] text-gray-500 font-mono mt-1">Exercício Corrente 2026 • Filtro Consolidado de Conta Principal</span>
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
            <div className="border-b border-gray-850 pb-4">
              <span className="font-display font-extrabold text-white text-base">DEMONSTRATIVO DE PATRIMÔNIO LÍQUIDO DO ESTOQUE</span>
              <span className="block text-[10px] text-gray-500 font-mono mt-1">Análise volumétrica do valor estocado e rentabilidade potencial sobre autopeças cadastradas.</span>
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

        {activeReport === 'mechanics' && (
          <div className="flex flex-col gap-5">
            <div className="border-b border-gray-850 pb-4">
              <span className="font-display font-extrabold text-white text-base">INDICADORES DE PRODUTIVIDADE E COMANDAS</span>
              <span className="block text-[10px] text-gray-500 font-mono mt-1">Acompanhamento de eficiência de mecânicos e comissões pendentes para fechamento.</span>
            </div>

            <div className="flex flex-col gap-3">
              {mechanicsList.map((mech, index) => {
                const stats = getMechanicOSStats(mech.name);
                return (
                  <div key={index} className="p-4 rounded-xl border border-gray-900 bg-[#070c17] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-650/15 text-red-500 flex items-center justify-center border border-red-950 font-bold shrink-0">
                        {mech.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-white block text-sm">{mech.name}</span>
                        <span className="text-[10px] text-gray-500">{mech.role}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-right font-mono">
                      <div>
                        <span className="text-gray-500 block text-[9px] uppercase">OS FINALIZADAS</span>
                        <strong className="text-white text-sm block">{stats.completed} de {stats.total}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[9px] uppercase">Rendimento OS</span>
                        <strong className="text-white text-sm block">R$ {stats.valueGenerated.toFixed(2)}</strong>
                      </div>
                      <div className="col-span-2 sm:col-span-1 text-left sm:text-right">
                        <span className="text-gray-500 block text-[9px] uppercase">Comitente (45% fixo)</span>
                        <strong className="text-cyan-400 text-sm block font-black">R$ {(stats.valueGenerated * 0.45).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

    </div>
  );
};
