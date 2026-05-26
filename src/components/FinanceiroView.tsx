import React, { useState } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Search, 
  TrendingUp, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  X,
  CreditCard,
  Bell,
  FileText,
  ClipboardList,
  AlertTriangle,
  Clock,
  Filter,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Financeiro } from '../types';

export const FinanceiroView: React.FC = () => {
  const { financeiro, addFinanceiro, editFinanceiro, ordensServico, fornecedores } = useApp();

  const [searchDesc, setSearchDesc] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Todas' | 'Receita' | 'Despesa' | 'RemindersActive'>('Todas');

  // Add transaction states
  const [isAdding, setIsAdding] = useState(false);
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'Receita' | 'Despesa'>('Receita');
  const [amountStr, setAmountStr] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Serviços');
  const [status, setStatus] = useState<'Pago' | 'Pendente'>('Pendente');

  // New operational accounts payable & invoice states
  const [invoiceNumberInput, setInvoiceNumberInput] = useState('');
  const [purchaseOrderInput, setPurchaseOrderInput] = useState('');
  const [reminderEnabledInput, setReminderEnabledInput] = useState(false);
  const [reminderDaysBeforeInput, setReminderDaysBeforeInput] = useState(3);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');

  // Categories lists
  const categoriesInflow = ['Serviços', 'Vendas Peças', 'Investimento', 'Ajuste Caixa'];
  const categoriesOutflow = ['Compra de Peças', 'Infraestrutura', 'Serviços Básicos', 'Salários', 'Impostos'];

  // Calculate totals
  const totalInflow = financeiro
    .filter(f => f.type === 'Receita' && f.status === 'Pago')
    .reduce((sum, item) => sum + item.amount, 0);

  const pendingInflow = financeiro
    .filter(f => f.type === 'Receita' && f.status === 'Pendente')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalOutflow = financeiro
    .filter(f => f.type === 'Despesa')
    .reduce((sum, item) => sum + item.amount, 0);

  const financialBalance = totalInflow - totalOutflow;

  // Mechanics commissions calculator helper
  const calculateMechanicCommission = (mechName: string, pct: number) => {
    return ordensServico
      .filter(os => os.mechanicName.toLowerCase().includes(mechName.toLowerCase()) && os.status === 'Finalizada')
      .reduce((sum, os) => {
        // Sum price of services
        const servicesSum = os.services.reduce((acc, s) => acc + s.price, 0);
        return sum + (servicesSum * pct) / 100;
      }, 0);
  };

  // Live Accounts Payable Reminder Analyzer (relative to 2026-05-26)
  const getDaysRemainingInfo = (dueDateStr: string) => {
    const today = new Date('2026-05-26');
    const due = new Date(dueDateStr);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { 
        days: diffDays, 
        colorClass: 'text-red-500 bg-red-950/20 border-red-900/40', 
        badgeClass: 'bg-red-500 text-white',
        text: `⚠️ Vencido há ${Math.abs(diffDays)} dia(s)` 
      };
    } else if (diffDays === 0) {
      return { 
        days: diffDays, 
        colorClass: 'text-amber-500 bg-amber-950/20 border-amber-900/45 animate-pulse', 
        badgeClass: 'bg-amber-500 text-black',
        text: `⚡ Vence HOJE!` 
      };
    } else if (diffDays <= 3) {
      return { 
        days: diffDays, 
        colorClass: 'text-amber-400 bg-amber-950/10 border-amber-900/25', 
        badgeClass: 'bg-amber-400 text-black',
        text: `⏳ Falta(m) ${diffDays} dia(s)` 
      };
    } else {
      return { 
        days: diffDays, 
        colorClass: 'text-cyan-400 bg-cyan-950/10 border-cyan-900/20', 
        badgeClass: 'bg-cyan-600 text-white',
        text: `📅 Daqui a ${diffDays} dia(s)` 
      };
    }
  };

  // Submit transaction
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amountStr || !dueDate) {
      alert("Por favor, preencha a Descrição, Valor e Data de Vencimento.");
      return;
    }

    const matchedSupplier = fornecedores?.find(f => f.id === selectedSupplierId);

    await addFinanceiro({
      description: desc,
      type,
      amount: parseFloat(amountStr) || 0,
      dueDate,
      category,
      status,
      invoiceNumber: invoiceNumberInput || undefined,
      purchaseOrder: purchaseOrderInput || undefined,
      reminderEnabled: reminderEnabledInput,
      reminderDaysBefore: reminderEnabledInput ? reminderDaysBeforeInput : undefined,
      supplierId: selectedSupplierId || undefined,
      supplierName: matchedSupplier ? matchedSupplier.name : undefined
    });

    // Reset standard & custom states
    setDesc('');
    setAmountStr('');
    setDueDate('');
    setInvoiceNumberInput('');
    setPurchaseOrderInput('');
    setReminderEnabledInput(false);
    setReminderDaysBeforeInput(3);
    setSelectedSupplierId('');
    setIsAdding(false);
  };

  // Toggle paid status
  const handleTogglePaidStatus = async (item: Financeiro) => {
    const next = item.status === 'Pago' ? 'Pendente' : 'Pago';
    await editFinanceiro(item.id, { status: next });
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
            💵 FLUXO DE CAIXA E FINANCEIRO
          </h1>
          <p className="text-xs text-gray-400 font-mono">Consolidação de DRE operacional, contas a pagar, contas a receber e apuração de comissões técnico.</p>
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl text-white font-mono text-xs font-semibold flex items-center gap-1 cursor-pointer self-stretch sm:self-auto justify-center shadow-lg"
        >
          <Plus className="w-4 h-4" /> Nova Célula Financeira
        </button>
      </div>

      {/* OPERATIONAL ACCOUNTS PAYABLE REMINDERS & ALERTS BANNER MODULE */}
      {financeiro.filter(f => f.type === 'Despesa' && f.status === 'Pendente').length > 0 && (() => {
        const APG_alerts = financeiro.filter(f => {
          if (f.type !== 'Despesa' || f.status !== 'Pendente') return false;
          const remaining = getDaysRemainingInfo(f.dueDate);
          return f.reminderEnabled || remaining.days <= 10;
        }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        if (APG_alerts.length === 0) return null;

        return (
          <div className="bg-[#0b101d] border-l-4 border-amber-500 rounded-r-2xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-850 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-900/30">
                  <Bell className="w-4.5 h-4.5 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm text-white">SISTEMA OPERACIONAL DE LEMBRETES & APG (CONTAS A PAGAR)</h3>
                  <span className="text-[10px] text-gray-400 font-mono">Lista automatizada de contas pendentes, vencidas ou com avisos programados de email/sistema.</span>
                </div>
              </div>
              
              <span className="text-[10px] font-mono font-bold bg-amber-950/40 text-amber-500 border border-amber-900/40 px-2.5 py-1 rounded">
                Ref. Tempo: 26/05/2026 • {APG_alerts.length} Lembretes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[190px] overflow-y-auto pr-1">
              {APG_alerts.map((f) => {
                const info = getDaysRemainingInfo(f.dueDate);
                return (
                  <div key={f.id} className="p-3 bg-gray-950/40 rounded-xl border border-gray-850 flex flex-col justify-between gap-2 text-xs relative group hover:border-amber-500/30 transition-all">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-sans font-bold text-white truncate max-w-[170px]" title={f.description}>
                          {f.description}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono font-bold border shrink-0 ${info.colorClass}`}>
                          {info.text}
                        </span>
                      </div>

                      {f.supplierName ? (
                        <span className="text-[9.5px] text-gray-400 mt-0.5 block truncate">
                          🏢 Fornecedor: <span className="text-gray-300 font-medium">{f.supplierName}</span>
                        </span>
                      ) : (
                        <span className="text-[9.5px] text-gray-500 block truncate">🏢 Sem fornecedor cadastrado</span>
                      )}

                      <div className="flex flex-wrap gap-1 mt-1">
                        {f.invoiceNumber && (
                          <span className="text-[8.5px] bg-[#0c1223] text-gray-400 border border-gray-850 rounded px-1 py-0.1 font-mono flex items-center gap-0.5">
                            <FileText className="w-3 h-3 text-red-550 text-red-500" /> NF: {f.invoiceNumber}
                          </span>
                        )}
                        {f.purchaseOrder && (
                          <span className="text-[8.5px] bg-[#0c1223] text-gray-400 border border-gray-850 rounded px-1 py-0.1 font-mono flex items-center gap-0.5">
                            <ClipboardList className="w-3 h-3 text-cyan-500" /> Ped: {f.purchaseOrder}
                          </span>
                        )}
                        {f.reminderEnabled && (
                          <span className="text-[8.5px] bg-amber-950/10 text-amber-500 border border-amber-900/20 rounded px-1 py-0.1 font-mono flex items-center gap-0.5 animate-pulse">
                            🔔 Alerta {f.reminderDaysBefore} dias antes
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-gray-900 pt-2">
                      <span className="font-mono text-amber-500 font-bold">
                        R$ {f.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      
                      <button
                        onClick={() => handleTogglePaidStatus(f)}
                        className="px-2 py-0.5 bg-green-500 hover:bg-green-600 text-black rounded text-[9px] font-mono font-bold flex items-center gap-0.5 cursor-pointer shadow transition-all shrink-0 uppercase"
                      >
                        <Check className="w-3 h-3 text-black stroke-[3px]" /> Liquidar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* SUMMARY BOX Indicator grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Box 1: Receitas pagas */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-4 shrink-0 flex flex-col justify-between hover:border-green-850/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-mono">RECEITAS CONSOLIDADAS (PAGAS)</span>
            <div className="p-1.5 rounded-lg bg-green-950/40 text-green-500">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5">
            <span className="text-xl font-display font-bold text-white">R$ {totalInflow.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-[9px] text-green-500 block font-mono mt-0.5">✓ Receitas liquidadas do caixa</span>
          </div>
        </div>

        {/* Box 2: Receitas pendentes */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-4 shrink-0 flex flex-col justify-between hover:border-yellow-850/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-mono font-medium">LANCAMENTOS A RECEBER</span>
            <span className="text-xs font-semibold px-2 py-0.5 text-yellow-500 bg-yellow-950/30 rounded font-mono">R$ {pendingInflow.toFixed(2)}</span>
          </div>
          <div className="mt-3.5">
            <span className="text-xl font-display font-medium text-white">Orçamentos OS Abertos</span>
            <span className="text-[9px] text-yellow-500 block font-mono mt-0.5">Previsão de fechamento semanal</span>
          </div>
        </div>

        {/* Box 3: Despesas consolidadas */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-4 shrink-0 flex flex-col justify-between hover:border-red-850/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-mono">DESPESAS / CONTAS A PAGAR</span>
            <div className="p-1.5 rounded-lg bg-red-950/40 text-red-500">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5">
            <span className="text-xl font-display font-bold text-white">R$ {totalOutflow.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-[9px] text-red-400 block font-mono mt-0.5">Fornecedores, aluguel, salários</span>
          </div>
        </div>

        {/* Box 4: Saldo Operacional DRE */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-4 shrink-0 flex flex-col justify-between hover:border-cyan-850/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-mono">SALDO OPERACIONAL (LÍQUIDO)</span>
            <div className={`p-1 box-content w-3 h-3 rounded-full ${financialBalance >= 0 ? 'bg-cyan-500/10' : 'bg-red-500/10'}`}></div>
          </div>
          <div className="mt-3.5">
            <span className={`text-xl font-display font-black ${financialBalance >= 0 ? 'text-cyan-400' : 'text-red-500'}`}>
              R$ {financialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[9px] text-gray-500 block font-mono mt-0.5">Resultado real da oficina</span>
          </div>
        </div>

      </div>

      {/* COMMISSIONS CALCULATOR GRID */}
      <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 text-left">
        <div className="border-b border-gray-850 pb-3 mb-4 flex justify-between items-center">
          <div>
            <h3 className="font-display font-extrabold text-white text-sm">Apuração Sistemática de Comissões de Mecânicos</h3>
            <span className="text-[10px] text-gray-500 font-mono block">Apuração automática de 45% sobre mão de obra de ordens de serviço marcadas como "Finalizada".</span>
          </div>
          <span className="text-[10px] bg-red-950/40 text-red-500 font-bold border border-red-900/30 px-3 py-1 rounded">
            Percentual Padrão: 45%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-950/20 rounded-xl border border-gray-900 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Marcio Rezende</span>
              <span className="text-[9px] text-gray-500">Mecânico Sênior</span>
            </div>
            <span className="font-mono text-sm text-cyan-400 font-bold">R$ {calculateMechanicCommission("Marcio", 45).toFixed(2)}</span>
          </div>
          
          <div className="p-3 bg-gray-950/20 rounded-xl border border-gray-900 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Gerson 'Geleia' Souza</span>
              <span className="text-[9px] text-gray-500">Mecânico Assistente</span>
            </div>
            <span className="font-mono text-sm text-cyan-400 font-bold">R$ {calculateMechanicCommission("Gerson", 45).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-[#0a0f1d] p-4 rounded-xl border border-gray-900">
        <div className="relative sm:col-span-8 mr-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Filtre listagem por descrição do lançamento, NF, nº de pedido ou fornecedores..."
            value={searchDesc}
            onChange={(e) => setSearchDesc(e.target.value)}
            className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2 px-4 pl-10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full bg-[#080c16] border border-gray-800 py-2.5 px-3 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer text-left font-mono"
          >
            <option value="Todas">Fluxo: Todas as Células (Entrada/Saída)</option>
            <option value="Receita">Apenas Receitas (Entradas)</option>
            <option value="Despesa">Apenas Despesas (Saídas)</option>
            <option value="RemindersActive">🚨 Contas APG Ativas (Lembretes/Vencidos)</option>
          </select>
        </div>
      </div>

      {/* TRANSACTION TIMELINE table */}
      <div className="bg-[#0c1223] rounded-2xl border border-gray-800 overflow-x-auto shadow-sm">
        <table className="w-full text-left font-mono text-xs text-slate-300">
          <thead className="bg-[#080d19] border-b border-gray-800 text-[10px] text-gray-400 uppercase">
            <tr>
              <th className="p-4">Vencimento</th>
              <th className="p-4">Lançamento / Origem / Detalhes</th>
              <th className="p-4">Fluxo</th>
              <th className="p-4">Documento / Nota Fiscal / Pedido</th>
              <th className="p-4">Valor Nominal</th>
              <th className="p-4 col-span-1">Status</th>
              <th className="p-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-850">
            {financeiro
              .filter(f => {
                const searchNormal = searchDesc.toLowerCase();
                const matchDesc = f.description.toLowerCase().includes(searchNormal) || 
                                  (f.invoiceNumber && f.invoiceNumber.toLowerCase().includes(searchNormal)) ||
                                  (f.purchaseOrder && f.purchaseOrder.toLowerCase().includes(searchNormal)) ||
                                  (f.supplierName && f.supplierName.toLowerCase().includes(searchNormal));
                
                let matchType = false;
                if (typeFilter === 'Todas') {
                  matchType = true;
                } else if (typeFilter === 'Receita') {
                  matchType = f.type === 'Receita';
                } else if (typeFilter === 'Despesa') {
                  matchType = f.type === 'Despesa';
                } else if (typeFilter === 'RemindersActive') {
                  const info = getDaysRemainingInfo(f.dueDate);
                  matchType = f.type === 'Despesa' && f.status === 'Pendente' && (f.reminderEnabled || info.days <= 10);
                }
                
                return matchDesc && matchType;
              })
              .map((item) => {
                const isOverdueAlert = item.type === 'Despesa' && item.status === 'Pendente';
                const remainingInfo = isOverdueAlert ? getDaysRemainingInfo(item.dueDate) : null;

                return (
                  <tr key={item.id} className="hover:bg-gray-950/20 transition-all">
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white font-bold">{item.dueDate}</span>
                        {remainingInfo && (
                          <span className={`text-[8.5px] font-mono whitespace-nowrap`}>
                            {remainingInfo.text}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white font-sans font-semibold text-xs flex items-center gap-1.5 leading-snug">
                          {item.description}
                          {item.reminderEnabled && (
                            <span className="text-[9px] text-amber-500 flex items-center gap-0.5" title={`Alerta ativado para ${item.reminderDaysBefore} dias antes`}>
                              <Bell className="w-3 h-3 text-amber-500 animate-pulse shrink-0" />
                            </span>
                          )}
                        </span>
                        
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500 font-mono mt-0.5">
                          <span>Categoria: <span className="text-gray-450 text-gray-400 font-medium">{item.category}</span></span>
                          {item.supplierName && (
                            <span className="flex items-center gap-0.5 border-l border-gray-800 pl-1.5">
                              Fornecedor: <span className="text-red-400 font-semibold">{item.supplierName}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {item.type === 'Receita' ? (
                        <span className="text-green-500 font-bold bg-green-950/20 px-2 py-0.5 border border-green-900/30 rounded text-[10px]">ENTRADA</span>
                      ) : (
                        <span className="text-red-500 font-bold bg-red-950/20 px-2 py-0.5 border border-red-900/30 rounded text-[10px]">SAÍDA</span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-1 font-mono text-[10px]">
                        {item.invoiceNumber ? (
                          <span className="text-gray-300 font-medium flex items-center gap-1 bg-[#090e1a] border border-gray-800 px-1.5 py-0.5 rounded w-fit">
                            <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" /> NF-e-{item.invoiceNumber}
                          </span>
                        ) : (
                          <span className="text-gray-600 italic">Nota Fiscal N/D</span>
                        )}

                        {item.purchaseOrder ? (
                          <span className="text-gray-400 flex items-center gap-1 bg-[#090e1a] border border-gray-850 px-1.5 py-0.5 rounded w-fit">
                            <ClipboardList className="w-3.5 h-3.5 text-cyan-500 shrink-0" /> Ped: {item.purchaseOrder}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-[9px] italic">Sem Pedido Vinculado</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-white font-bold text-xs font-mono">
                      R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="p-4 select-none">
                      <button 
                        onClick={() => handleTogglePaidStatus(item)}
                        className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded cursor-pointer border transition-colors ${
                          item.status === 'Pago' 
                            ? 'border-green-900/40 bg-green-950/20 text-green-400 hover:bg-green-600 hover:text-black hover:border-green-500' 
                            : 'border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-650 hover:text-white hover:border-red-500'
                        }`}
                      >
                        {item.status === 'Pago' ? "✔ PAGO" : "⚠ PENDENTE"}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleTogglePaidStatus(item)}
                        className="text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-2.5 py-1 rounded cursor-pointer text-[10px] transition-colors"
                      >
                        Alternar
                      </button>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>

      {/* DIALOG ADD MANUALLY TRANSACTION MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <form 
            onSubmit={handleCreateTransaction}
            className="bg-[#0c1223] border border-gray-800 text-white max-w-lg w-full rounded-2xl p-6 shadow-2xl relative text-left flex flex-col gap-4 font-sans"
          >
            <div className="flex justify-between items-center border-b border-gray-850 pb-3">
              <span className="font-display font-bold text-base text-white flex items-center gap-1.5 uppercase">
                <CreditCard className="w-5 h-5 text-red-500" /> Nova Célula Financeira / Documento
              </span>
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs font-mono">
              
              {/* Row 1: Tipo lançamentos */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Tipo de Lançamento / Fluxo de Caixa</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setType('Receita');
                      setCategory('Serviços');
                    }}
                    className={`py-2 rounded font-bold border font-mono transition-colors text-xs ${type === 'Receita' ? 'border-green-500 bg-green-950/20 text-white' : 'border-gray-800 text-gray-500'}`}
                  >
                    📈 RECEITA (ENTRADA)
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setType('Despesa');
                      setCategory('Compra de Peças');
                    }}
                    className={`py-2 rounded font-bold border font-mono transition-colors text-xs ${type === 'Despesa' ? 'border-red-500 bg-red-950/20 text-white' : 'border-gray-800 text-gray-500'}`}
                  >
                    📉 DESPESA / CONTA PAGAR (SAÍDA)
                  </button>
                </div>
              </div>

              {/* Row 2: Descritivo do lançamento */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold">Descritivo do Lançamento *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Fornecimento de Peças NGK Sênior"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 font-sans"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                />
              </div>

              {/* Row 3: Categoria */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold">Categoria de Relatório DRE</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-2 text-white cursor-pointer focus:outline-none focus:border-red-500"
                >
                  {type === 'Receita' 
                    ? categoriesInflow.map((c, i) => <option key={i} value={c}>{c}</option>)
                    : categoriesOutflow.map((c, i) => <option key={i} value={c}>{c}</option>)
                  }
                </select>
              </div>

              {/* Row 4: Valor & data de vencimento */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold">Valor Nominal R$ *</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 450.00"
                    step="0.01"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white font-mono focus:outline-none focus:border-red-500"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold">Vencimento da Fatura *</label>
                  <input 
                    type="date" 
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-2 text-white focus:outline-none focus:border-red-500 focus:text-white"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 5: Nota Fiscal & Pedido */}
              <div className="grid grid-cols-2 gap-3 border-t border-gray-850 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
                    <FileText className="w-3 h-3 text-red-500" /> Nota Fiscal (NF-e)
                  </span>
                  <input 
                    type="text" 
                    placeholder="Nº da nota, Ex: NF-8119"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 font-mono"
                    value={invoiceNumberInput}
                    onChange={(e) => setInvoiceNumberInput(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
                    <ClipboardList className="w-3 h-3 text-cyan-500" /> Número de Pedido
                  </span>
                  <input 
                    type="text" 
                    placeholder="Nº do pedido, Ex: PED-908"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 font-mono"
                    value={purchaseOrderInput}
                    onChange={(e) => setPurchaseOrderInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 6: Vincular Fornecedor (for accounts payable saídas) */}
              {type === 'Despesa' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold">Vincular Fornecedor Credor</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-2 text-white cursor-pointer focus:outline-none focus:border-red-500"
                  >
                    <option value="">Selecione parceiro fornecedor (Opcional)</option>
                    {fornecedores?.map(f => (
                      <option key={f.id} value={f.id}>🏢 {f.name} (CNPJ: {f.cnpj || 'Simples'})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Row 7: Lembretes settings */}
              {type === 'Despesa' && (
                <div className="bg-[#090e1a] border border-gray-850 rounded-xl p-3 flex flex-col gap-2 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-300 font-bold uppercase flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-amber-500 animate-pulse" /> Ativar Alertas de Vencimento
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={reminderEnabledInput}
                        onChange={(e) => setReminderEnabledInput(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-650 peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  {reminderEnabledInput && (
                    <div className="flex items-center justify-between gap-4 mt-1 border-t border-gray-800/60 pt-1.5">
                      <span className="text-[9px] text-gray-400">Dias de aviso prévio requisitado:</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" 
                          min="1" 
                          max="15" 
                          className="w-24 accent-red-600 focus:outline-none"
                          value={reminderDaysBeforeInput}
                          onChange={(e) => setReminderDaysBeforeInput(parseInt(e.target.value) || 3)}
                        />
                        <span className="text-amber-500 font-bold font-mono text-xs">{reminderDaysBeforeInput} Dia(s)</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Row 8: Status do lançamento */}
              <div className="flex flex-col gap-1 border-t border-gray-850 pt-2">
                <label className="text-[10px] text-gray-400 uppercase font-bold">Status Inicial</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-1 text-white cursor-pointer focus:outline-none focus:border-red-500"
                >
                  <option value="Pendente">Aberto / Pagável Pendente (APG)</option>
                  <option value="Pago">Quitado / Pago do Saldo Operacional</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 py-3 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl text-white font-bold text-xs font-sans shadow-md"
              >
                💾 CONFIRMAR LANÇAMENTO NO DRE
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
