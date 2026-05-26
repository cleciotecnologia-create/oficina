import React from 'react';
import { 
  TrendingUp, 
  Wrench, 
  AlertTriangle, 
  Activity, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Package, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { 
    clientes, 
    veiculos, 
    produtos, 
    ordensServico, 
    financeiro, 
    caixaStatus,
    company
  } = useApp();

  // Load administrative support suggestions for this workshop from localStorage with reactive status toggles
  const [sugList, setSugList] = React.useState<any[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('saas_suggestions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed)) {
          // Filter suggestions for this company
          const companySugs = parsed.filter((s: any) => s.tenantId === company.id);
          // If none are present and this is Oficina do Rafael, seed default suggestions
          if (companySugs.length === 0 && company.id === 'tenant_rafael_6') {
            const defaults = [
              {
                id: "sug_def_1",
                tenantId: "tenant_rafael_6",
                title: "💡 Sugestão de Ajuste Rápido: Faturamento de OS",
                description: "Rafael, notei que o faturamento de suas Ordens de Serviço está concentrado no fim do mês. Sugerimos liberar as peças do estoque com 5% de desconto de balcão para pagamentos à vista via Pix para otimizar seu Fluxo de Caixa.",
                category: "Ajuste",
                createdAt: new Date().toISOString(),
                status: "Pendente"
              },
              {
                id: "sug_def_2",
                tenantId: "tenant_rafael_6",
                title: "⚙️ Suporte Técnico: Quota de Diagnósticos OBD-II",
                description: "Reconfiguramos seu limite de processamento de IA Gemini para 500mil tokens mensais. Isso permite utilizar o CoPilot livremente em todas as marcas nacionais.",
                category: "Suporte",
                createdAt: new Date().toISOString(),
                status: "Pendente"
              }
            ];
            // Save defaults
            const updated = [...parsed, ...defaults];
            localStorage.setItem('saas_suggestions', JSON.stringify(updated));
            setSugList(defaults);
          } else {
            setSugList(companySugs);
          }
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // If no suggestions in localStorage at all, seed initial ones for all
      const initialSugs = [
        {
          id: "sug_def_1",
          tenantId: "tenant_rafael_6",
          title: "💡 Sugestão de Ajuste Rápido: Faturamento de OS",
          description: "Rafael, notei que o faturamento de suas Ordens de Serviço está concentrado no fim do mês. Sugerimos liberar as peças do estoque com 5% de desconto de balcão para pagamentos à vista via Pix para otimizar seu Fluxo de Caixa.",
          category: "Ajuste",
          createdAt: new Date().toISOString(),
          status: "Pendente"
        },
        {
          id: "sug_def_2",
          tenantId: "tenant_rafael_6",
          title: "⚙️ Suporte Técnico: Quota de Diagnósticos OBD-II",
          description: "Reconfiguramos seu limite de processamento de IA Gemini para 500mil tokens mensais. Isso permite utilizar o CoPilot livremente em todas as marcas nacionais.",
          category: "Suporte",
          createdAt: new Date().toISOString(),
          status: "Pendente"
        }
      ];
      localStorage.setItem('saas_suggestions', JSON.stringify(initialSugs));
      setSugList(initialSugs.filter((s: any) => s.tenantId === company.id));
    }
  }, [company.id]);

  const handleMarkAsResolved = (sugId: string) => {
    const saved = localStorage.getItem('saas_suggestions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed)) {
          const updated = parsed.map((s: any) => {
            if (s.id === sugId) {
              return { ...s, status: s.status === 'Resolvido' ? 'Pendente' : 'Resolvido' };
            }
            return s;
          });
          localStorage.setItem('saas_suggestions', JSON.stringify(updated));
          setSugList(updated.filter((s: any) => s.tenantId === company.id));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // 1. KPI Calculations
  const dailyEarnings = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return financeiro
      .filter(f => f.type === 'Receita' && f.status === 'Pago' && f.dueDate === todayStr)
      .reduce((sum, f) => sum + f.amount, 0);
  };

  const monthlyEarnings = () => {
    // Sum all incomes this month
    return financeiro
      .filter(f => f.type === 'Receita' && f.status === 'Pago')
      .reduce((sum, f) => sum + f.amount, 0);
  };

  const monthlyExpenses = () => {
    return financeiro
      .filter(f => f.type === 'Despesa')
      .reduce((sum, f) => sum + f.amount, 0);
  };

  const lowStockCount = produtos.filter(p => p.quantity <= p.minStock).length;
  
  const activeOSCount = ordensServico.filter(os => 
    os.status !== 'Finalizada' && os.status !== 'Entregue'
  ).length;

  const servicesInProgress = ordensServico.filter(os => os.status === 'Em execução').length;

  // 2. chart data configurations
  const cashFlowData = [
    { name: 'Jan', Entradas: 8400, Saídas: 4200 },
    { name: 'Fev', Entradas: 12500, Saídas: 6100 },
    { name: 'Mar', Entradas: 18900, Saídas: 9500 },
    { name: 'Abr', Entradas: 15400, Saídas: 11000 },
    { name: 'Mai', Entradas: dailyEarnings() + 19500, Saídas: monthlyExpenses() },
  ];

  const popularPartsData = [
    { name: 'Pastilha Freio', Vendas: 48 },
    { name: 'Filtro Óleo', Vendas: 82 },
    { name: 'Óleo Castrol', Vendas: 65 },
    { name: 'Vela Iridium', Vendas: 29 },
    { name: 'Amortecedor', Vendas: 18 },
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
            📊 PAINEL ADMINISTRATIVO 
          </h1>
          <p className="text-xs text-gray-400 font-mono">Status operacional e fluxo de caixa consolidado.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {company.name.includes("(Impersonado)") && (
            <span className="text-[10px] font-mono tracking-wider bg-yellow-950/45 border border-yellow-800 text-yellow-405 text-yellow-500 px-3 py-1.5 rounded-full font-bold animate-pulse">
              👤 ADMINISTRADOR INFILTRADO
            </span>
          )}
          <span className="text-[11px] font-mono tracking-widest bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-slate-400">
            Ficha: {caixaStatus?.status === 'Aberto' ? '🟢 CAIXA OPERACIONAL ABERTO' : '🔴 CAIXA FECHADO'}
          </span>
        </div>
      </div>

      {/* 💡 SAAS ADMINISTRATIVE SUPPORT SUGGESTIONS BOX */}
      {sugList.length > 0 && (
        <div className="bg-gradient-to-r from-purple-950/20 to-indigo-950/15 border border-purple-900/40 rounded-2xl p-5 flex flex-col gap-4 text-left">
          <div className="flex items-center gap-2 pb-2.5 border-b border-gray-850/60">
            <span className="bg-purple-950/50 border border-purple-800 text-purple-400 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded font-mono">
              💡 CANAL DE SUPORTE SaaS
            </span>
            <strong className="text-white text-xs font-sans">
              Recomendações e Dicas Administrativas do SuperAdmin
            </strong>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sugList.map((sug) => (
              <div 
                key={sug.id} 
                className={`p-4 rounded-xl border transition-all text-xs flex flex-col gap-2 ${
                  sug.status === 'Resolvido' 
                    ? 'bg-[#050912]/40 border-gray-900/50 opacity-60' 
                    : 'bg-[#070b16] border-purple-950 hover:border-purple-900/60'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      {sug.category === 'Marketing' && '📢'}
                      {sug.category === 'Ajuste' && '🛠️'}
                      {sug.category === 'Suporte' && '⚙️'}
                      {sug.category === 'Melhoria' && '📈'}
                      <span className={sug.status === 'Resolvido' ? 'line-through text-slate-500' : ''}>
                        {sug.title}
                      </span>
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">
                      Enviado em: {new Date(sug.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase ${
                    sug.status === 'Resolvido' 
                      ? 'bg-green-950/20 border border-green-950 text-green-600' 
                      : 'bg-amber-950/30 border border-amber-900/50 text-amber-400 animate-pulse'
                  }`}>
                    {sug.status === 'Resolvido' ? 'CONCLUÍDO' : 'PENDENTE'}
                  </span>
                </div>

                <p className={`text-slate-350 text-[11px] leading-relaxed ${sug.status === 'Resolvido' ? 'line-through text-slate-500' : ''}`}>
                  {sug.description}
                </p>

                <div className="flex justify-end mt-1 pt-2 border-t border-gray-850/30">
                  <button
                    type="button"
                    onClick={() => handleMarkAsResolved(sug.id)}
                    className={`py-1 px-2.5 rounded text-[9.5px] font-mono cursor-pointer transition-colors flex items-center gap-1.5 ${
                      sug.status === 'Resolvido'
                        ? 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/30 border border-purple-900/50 font-bold'
                    }`}
                  >
                    {sug.status === 'Resolvido' ? ' Reabrir Dica' : '✔️ Marcar como Lido'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Faturamento Diário */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800/80 p-4 shrink-0 flex flex-col justify-between hover:border-red-600/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-mono font-medium">FATURAMENTO DIÁRIO</span>
            <div className="p-2 rounded-lg bg-green-950/40 text-green-500 border border-green-900/30">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-display font-bold text-white">R$ {dailyEarnings().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[10px] text-green-500 font-mono mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs ontem
            </div>
          </div>
        </div>

        {/* Card 2: Faturamento Mensal */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800/80 p-4 shrink-0 flex flex-col justify-between hover:border-cyan-600/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-mono font-medium">RESUMO ENTRADAS MÊS</span>
            <div className="p-2 rounded-lg bg-cyan-950/40 text-cyan-500 border border-cyan-900/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-display font-bold text-white">R$ {monthlyEarnings().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[10px] text-cyan-400 font-mono mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Meta de R$ 30k (63%)
            </div>
          </div>
        </div>

        {/* Card 3: OS em Aberto */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800/80 p-4 shrink-0 flex flex-col justify-between hover:border-yellow-600/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-mono font-medium">ORDENS NO PÁTIO</span>
            <div className="p-2 rounded-lg bg-yellow-950/40 text-yellow-500 border border-yellow-900/30">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-display font-bold text-white">{activeOSCount} de {ordensServico.length} OS</div>
            <div className="text-[10px] text-yellow-500 font-mono mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {servicesInProgress} em execução ativa
            </div>
          </div>
        </div>

        {/* Card 4: Alerta Estoque Baixo */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800/80 p-4 shrink-0 flex flex-col justify-between hover:border-red-650/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-red-400 font-mono font-medium flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" /> ALERTA DE REPOSIÇÃO
            </span>
            <div className={`p-2 rounded-lg ${lowStockCount > 0 ? 'bg-red-950/40 text-red-500 border border-red-900/30' : 'bg-slate-900 text-slate-500'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-display font-bold text-white">{lowStockCount} Itens</div>
            <div className="text-[10px] text-red-400 font-mono mt-1">
              Abaixo do estoque mínimo configurado.
            </div>
          </div>
        </div>

      </div>

      {/* CHARTS GRAPHICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Chart: Fluxo de Caixa */}
        <div className="col-span-12 lg:col-span-8 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display font-bold text-base text-white">Fluxo de Caixa Mensal</h3>
              <span className="text-[10px] text-gray-500 font-mono block">Histórico de saídas de fornecedores vs ordens finalizadas.</span>
            </div>
            
            <div className="flex gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded bg-cyan-450 inline-block bg-cyan-500"></span> Entradas
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2.5 h-2.5 rounded bg-red-450 inline-block bg-red-500"></span> Saídas
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontStyle="mono" />
                <YAxis stroke="#64748b" fontSize={10} fontStyle="mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="Entradas" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorEntradas)" />
                <Area type="monotone" dataKey="Saídas" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSaidas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Mais vendidos */}
        <div className="col-span-12 lg:col-span-4 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="font-display font-bold text-base text-white">Peças Mais Demandadas</h3>
            <span className="text-[10px] text-gray-500 font-mono block">Quantidades comercializadas por categoria de reparação.</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularPartsData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Bar dataKey="Vendas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* LOW STOCK & RECENT SERVICES ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* List 1: Alerta Estoque Mínimo */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 text-left">
          <div className="flex justify-between items-center border-b border-gray-850 pb-4 mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-white">Alerta de Reposição Crítica</h3>
              <p className="text-[10px] text-gray-500 font-mono">Itens que precisam de solicitação para fornecedores.</p>
            </div>
            <span className="text-[10px] font-mono bg-red-950/40 text-red-500 border border-red-900/30 px-2.5 py-1 rounded">
              {lowStockCount} produtos com risco de ruptura
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
            {produtos.filter(p => p.quantity <= p.minStock).map((prod) => (
              <div key={prod.id} className="flex justify-between items-center p-3 rounded-xl border border-gray-900 bg-gray-950/30">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white">{prod.name}</span>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                    <span>SKU: {prod.internalSku}</span>
                    <span>•</span>
                    <span>Cat: {prod.category}</span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold text-red-400">{prod.quantity} un</span>
                    <span className="text-[9px] text-gray-500">Mín: {prod.minStock} un</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 border border-cyan-900/30 bg-cyan-950/20 px-2 py-1 rounded">
                    R$ {prod.sellPrice}
                  </span>
                </div>
              </div>
            ))}
            {lowStockCount === 0 && (
              <div className="text-center py-8 text-xs text-gray-500">
                ✅ Tudo certo! Todos os produtos estão com estoque ideal.
              </div>
            )}
          </div>
        </div>

        {/* List 2: OS Recentes */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 text-left">
          <div className="flex justify-between items-center border-b border-gray-850 pb-4 mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-white">Ordens de Serviço Ativas</h3>
              <p className="text-[10px] text-gray-500 font-mono">Status físico de veículos que estão no pátio de reparos.</p>
            </div>
            <span className="text-[10px] font-mono bg-cyan-950/40 text-cyan-500 border border-cyan-900/30 px-2.5 py-1 rounded">
              Pátio de Produção
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
            {ordensServico.map((os) => {
              const statusColor = (st: string) => {
                switch(st) {
                  case 'Aberta': return 'border-blue-900/40 bg-blue-950/20 text-blue-400';
                  case 'Em análise': return 'border-yellow-900/40 bg-yellow-950/20 text-yellow-400';
                  case 'Aguardando peça': return 'border-orange-950/40 bg-orange-950/20 text-orange-400';
                  case 'Em execução': return 'border-red-900/40 bg-red-950/20 text-red-500 font-bold';
                  default: return 'border-green-900/40 bg-green-950/20 text-green-400';
                }
              };
              return (
                <div key={os.id} className="flex justify-between items-center p-3 rounded-xl border border-gray-900 bg-gray-950/30">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{os.id}</span>
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 border rounded ${statusColor(os.status)}`}>
                        {os.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                      <span>Placa: {os.plate}</span>
                      <span>•</span>
                      <span>Cliente: {os.clienteName}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">R$ {os.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span className="text-[9px] text-gray-550 block font-mono">{new Date(os.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
