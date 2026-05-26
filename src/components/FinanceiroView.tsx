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
  CreditCard
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Financeiro } from '../types';

export const FinanceiroView: React.FC = () => {
  const { financeiro, addFinanceiro, editFinanceiro, ordensServico } = useApp();

  const [searchDesc, setSearchDesc] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Todas' | 'Receita' | 'Despesa'>('Todas');

  // Add transaction states
  const [isAdding, setIsAdding] = useState(false);
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'Receita' | 'Despesa'>('Receita');
  const [amountStr, setAmountStr] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Serviços');
  const [status, setStatus] = useState<'Pago' | 'Pendente'>('Pendente');

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

  // Submit transaction
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amountStr || !dueDate) {
      alert("Por favor, preencha a Descrição, Valor e Data de Vencimento.");
      return;
    }

    await addFinanceiro({
      description: desc,
      type,
      amount: parseFloat(amountStr) || 0,
      dueDate,
      category,
      status
    });

    setDesc('');
    setAmountStr('');
    setDueDate('');
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
          className="px-4 py-2 bg-red-650 hover:bg-red-700 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl text-white font-mono text-xs font-semibold flex items-center gap-1 cursor-pointer self-stretch sm:self-auto justify-center shadow-lg"
        >
          <Plus className="w-4 h-4" /> Nova Célula Financeira
        </button>
      </div>

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
        <div className="relative sm:col-span-8">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Filtre listagem por descrição do lançamento, NF ou fornecedores..."
            value={searchDesc}
            onChange={(e) => setSearchDesc(e.target.value)}
            className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2 px-4 pl-10 text-xs text-white"
          />
        </div>

        <div className="sm:col-span-4">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full bg-[#080c16] border border-gray-800 py-2.5 px-3 rounded-xl text-xs text-white"
          >
            <option value="Todas">Fluxo: Todas as Células</option>
            <option value="Receita">Lançamentos - Receitas</option>
            <option value="Despesa">Lançamentos - Despesas</option>
          </select>
        </div>
      </div>

      {/* TRANSACTION TIMELINE table */}
      <div className="bg-[#0c1223] rounded-2xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs text-slate-300">
          <thead className="bg-[#080d19] border-b border-gray-800 text-[10px] text-gray-400 uppercase">
            <tr>
              <th className="p-4">Data Vencimento</th>
              <th className="p-4">Lançamento / Categoria</th>
              <th className="p-4">Fluxo</th>
              <th className="p-4">Valor Nominal</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-850">
            {financeiro
              .filter(f => {
                const matchDesc = f.description.toLowerCase().includes(searchDesc.toLowerCase());
                const matchType = typeFilter === 'Todas' || f.type === typeFilter;
                return matchDesc && matchType;
              })
              .map((item) => (
                <tr key={item.id} className="hover:bg-gray-950/20">
                  <td className="p-4">{item.dueDate}</td>
                  
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-white font-sans font-semibold text-xs">{item.description}</span>
                      <span className="text-[10px] text-gray-500 font-mono">Categoria: {item.category}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    {item.type === 'Receita' ? (
                      <span className="text-green-500 font-bold bg-green-950/30 px-2 py-0.5 border border-green-900/30 rounded">ENTRADA</span>
                    ) : (
                      <span className="text-red-550 text-red-550 text-red-500 font-bold bg-red-950/30 px-2 py-0.5 border border-red-900/30 rounded">SAÍDA</span>
                    )}
                  </td>

                  <td className="p-4 text-white font-bold text-xs">
                    R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="p-4">
                    <button 
                      onClick={() => handleTogglePaidStatus(item)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer border ${
                        item.status === 'Pago' 
                          ? 'border-green-900/40 bg-green-950/20 text-green-450 text-green-400' 
                          : 'border-red-900/40 bg-red-950/20 text-red-400'
                      }`}
                    >
                      {item.status === 'Pago' ? "✔ PAGO" : "⚠ PENDENTE"}
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleTogglePaidStatus(item)}
                      className="text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-2.5 py-1 rounded"
                    >
                      Alternar
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* DIALOG ADD MANUALLY TRANSACTION MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <form 
            onSubmit={handleCreateTransaction}
            className="bg-[#0c1223] border border-gray-800 text-white max-w-sm w-full rounded-2xl p-6 shadow-2xl relative text-left flex flex-col gap-5"
          >
            <div className="flex justify-between items-center border-b border-gray-850 pb-3">
              <span className="font-display font-bold text-base text-white flex items-center gap-1.5">
                <CreditCard className="w-5 h-5 text-red-500" /> NOVA CÉLULA FINANCEIRA
              </span>
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">TIPO DE LANÇAMENTO</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setType('Receita');
                      setCategory('Serviços');
                    }}
                    className={`py-2 rounded font-bold border ${type === 'Receita' ? 'border-green-500 bg-green-950/20 text-white' : 'border-gray-800 text-gray-500'}`}
                  >
                    RECEITA (+)
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setType('Despesa');
                      setCategory('Compra de Peças');
                    }}
                    className={`py-2 rounded font-bold border ${type === 'Despesa' ? 'border-red-500 bg-red-950/20 text-white' : 'border-gray-800 text-gray-500'}`}
                  >
                    DESPESA (-)
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">DESCRITIVO DO LANÇAMENTO *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Pagamento Fornecimento Velas NGK"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 py-2 px-3 text-white"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">CATEGORIA DE GESTÃO</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-1 text-white"
                >
                  {type === 'Receita' 
                    ? categoriesInflow.map((c, i) => <option key={i} value={c}>{c}</option>)
                    : categoriesOutflow.map((c, i) => <option key={i} value={c}>{c}</option>)
                  }
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400">VALOR NOMINAL *</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 450.00"
                    step="0.01"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white font-mono"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400">VENCIMENTO *</label>
                  <input 
                    type="date" 
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-2 text-white"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">STATUS INICIAL</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-1 text-white"
                >
                  <option value="Pendente">Aberto / Pendente de caixa</option>
                  <option value="Pago">Quitado / Pago do saldo</option>
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
