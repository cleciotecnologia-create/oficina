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
  Clock,
  PiggyBank,
  Percent,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Trophy,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
    company,
    localAuditLogs
  } = useApp();

  const [selectedMetric, setSelectedMetric] = React.useState<'diario' | 'mensal' | 'despesas' | 'lucro' | 'ordens' | 'estoque' | 'garantia'>('mensal');

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

  // Load scheduled revisions to check for upcoming maintenance alerts
  const [revisionAlerts, setRevisionAlerts] = React.useState<any[]>([]);

  React.useEffect(() => {
    const listSaved = localStorage.getItem('autotech_scheduled_revisions');
    if (listSaved) {
      try {
        const parsed = JSON.parse(listSaved);
        if (Array.isArray(parsed)) {
          const now = new Date();
          const filteredAlerts = parsed.filter((rev: any) => {
            if (rev.status !== 'Agendado' && rev.status !== 'Pendente') return false;
            
            const veh = veiculos.find((v: any) => v.id === rev.vehicleId);
            const currentKm = veh ? (veh.km || 0) : rev.currentVehicleKm;
            const kmRemaining = rev.targetKm - currentKm;
            const isKmCritical = kmRemaining <= 1000;

            const targetDate = new Date(rev.estimatedDate);
            const diffTime = targetDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const isDateNear = diffDays <= 7;

            return isKmCritical || isDateNear;
          });
          setRevisionAlerts(filteredAlerts);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [veiculos]);

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

  // Helper to check if a vehicle is within warranty return period
  const isWarrantyReturnOS = (osToCheck: any) => {
    if (!osToCheck.veiculoId) return false;
    const warrantyDays = company?.warrantyDays !== undefined ? company.warrantyDays : 90;
    
    // Find all finalized/delivered OSs for this vehicle, excluding current OS
    const priorOss = ordensServico.filter(os => 
      os.veiculoId === osToCheck.veiculoId && 
      (os.status === 'Finalizada' || os.status === 'Entregue') && 
      os.id !== osToCheck.id
    );
    
    if (priorOss.length === 0) return false;
    
    // Find prior OSs that were finalised BEFORE this OS was created
    const createdDate = new Date(osToCheck.createdAt);
    
    const finalizedPrior = priorOss.filter(os => 
      new Date(os.createdAt).getTime() < createdDate.getTime()
    );
    
    if (finalizedPrior.length === 0) return false;
    
    // Find the most recent prior finalized/delivered OS
    const sortedPrior = [...finalizedPrior].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const latestOS = sortedPrior[0];
    const latestOSDate = new Date(latestOS.createdAt);
    const diffTime = Math.abs(createdDate.getTime() - latestOSDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= warrantyDays;
  };

  const getWarrantyStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Total OSs finalized or delivered in the current month
    const finalizedInMonth = ordensServico.filter(os => {
      const osDate = new Date(os.createdAt);
      const isThisMonth = osDate.getMonth() === currentMonth && osDate.getFullYear() === currentYear;
      const isFinalized = os.status === 'Finalizada' || os.status === 'Entregue';
      return isThisMonth && isFinalized;
    });

    // Total OSs with warranty return badge created in the current month
    const warrantyReturnInMonth = ordensServico.filter(os => {
      const osDate = new Date(os.createdAt);
      const isThisMonth = osDate.getMonth() === currentMonth && osDate.getFullYear() === currentYear;
      const isReturn = isWarrantyReturnOS(os);
      return isThisMonth && isReturn;
    });

    const rateMonth = finalizedInMonth.length > 0 
      ? (warrantyReturnInMonth.length / finalizedInMonth.length) * 100 
      : 0;

    // Direct all-time stats as additional context fallback
    const totalFinalizedAllTime = ordensServico.filter(os => os.status === 'Finalizada' || os.status === 'Entregue');
    const allWarrantyReturns = ordensServico.filter(os => isWarrantyReturnOS(os));
    const rateAllTime = totalFinalizedAllTime.length > 0
      ? (allWarrantyReturns.length / totalFinalizedAllTime.length) * 100
      : 0;

    return {
      finalizedInMonth: finalizedInMonth.length,
      warrantyReturnInMonth: warrantyReturnInMonth.length,
      rateMonth,
      totalFinalizedAllTime: totalFinalizedAllTime.length,
      allWarrantyReturns: allWarrantyReturns.length,
      rateAllTime
    };
  };

  const getMechanicRanking = () => {
    const baseNames = ["Marcio Rezende", "Gerson 'Geleia' Souza", "Clécio Santos (Administrador)"];
    const allNamesSet = new Set(baseNames);
    
    ordensServico.forEach(os => {
      if (os.mechanicName) {
        allNamesSet.add(os.mechanicName);
      }
    });

    const warrantyDays = company?.warrantyDays !== undefined ? company.warrantyDays : 90;

    const ranking = Array.from(allNamesSet).map(name => {
      const mechanicFinalized = ordensServico.filter(os => 
        os.mechanicName === name && 
        (os.status === 'Finalizada' || os.status === 'Entregue')
      );

      const totalFinalized = mechanicFinalized.length;
      let returnsCount = 0;

      mechanicFinalized.forEach(oldOs => {
        const subsequent = ordensServico.find(newOs => {
          if (newOs.veiculoId !== oldOs.veiculoId || newOs.id === oldOs.id) return false;
          
          const oldTime = new Date(oldOs.createdAt).getTime();
          const newTime = new Date(newOs.createdAt).getTime();
          
          if (newTime <= oldTime) return false;

          const diffDays = Math.ceil((newTime - oldTime) / (1000 * 60 * 60 * 24));
          return diffDays <= warrantyDays;
        });

        if (subsequent) {
          returnsCount++;
        }
      });

      const returnRate = totalFinalized > 0 ? (returnsCount / totalFinalized) * 100 : 0;
      const efficiencyRate = 100 - returnRate;

      return {
        name,
        totalFinalized,
        returnsCount,
        returnRate,
        efficiencyRate
      };
    });

    return ranking.sort((a, b) => {
      if (a.totalFinalized > 0 && b.totalFinalized === 0) return -1;
      if (a.totalFinalized === 0 && b.totalFinalized > 0) return 1;
      if (a.totalFinalized === 0 && b.totalFinalized === 0) return a.name.localeCompare(b.name);
      
      if (a.returnRate !== b.returnRate) {
        return a.returnRate - b.returnRate;
      }
      return b.totalFinalized - a.totalFinalized;
    });
  };

  const warrantyStats = getWarrantyStats();

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
      <AnimatePresence>
        {sugList.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="bg-gradient-to-r from-purple-950/20 to-indigo-950/15 border border-purple-900/40 rounded-2xl p-5 flex flex-col gap-4 text-left"
          >
            <div className="flex items-center gap-2 pb-2.5 border-b border-gray-850/60 font-sans">
              <span className="bg-purple-950/50 border border-purple-800 text-purple-400 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded font-mono">
                💡 CANAL DE SUPORTE SaaS
              </span>
              <strong className="text-white text-xs font-sans">
                Recomendações e Dicas Administrativas do SuperAdmin
              </strong>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sugList.map((sug, idx) => (
                <motion.div 
                  key={sug.id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.08 }}
                  className={`p-4 rounded-xl border transition-all text-xs flex flex-col gap-2 relative ${
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
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI CARDS */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4"
      >
        
        {/* Card 1: Faturamento Diário */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 15, scale: 0.98 },
            visible: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.2 } }
          }}
          whileHover={{ y: -4, scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          onClick={() => setSelectedMetric('diario')}
          className={`cursor-pointer rounded-2xl border p-4 flex flex-col justify-between transition-colors duration-300 ${
            selectedMetric === 'diario' 
              ? 'bg-[#0f2122]/40 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.15)] ring-1 ring-green-500/20' 
              : 'bg-[#0c1223] border-gray-800/80 hover:border-green-800/50 hover:bg-[#0c1223]/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-mono font-medium tracking-wider">DIÁRIO (ENTRADAS)</span>
            <div className={`p-2 rounded-lg transition-colors ${
              selectedMetric === 'diario' ? 'bg-green-500 text-black font-extrabold' : 'bg-green-950/40 text-green-500 border border-green-900/30'
            }`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-display font-extrabold text-white">
              R$ {dailyEarnings().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] text-green-500 font-mono mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +14.2% vs ontem
            </div>
          </div>
        </motion.div>

        {/* Card 2: Faturamento Mensal */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 15, scale: 0.98 },
            visible: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.2 } }
          }}
          whileHover={{ y: -4, scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          onClick={() => setSelectedMetric('mensal')}
          className={`cursor-pointer rounded-2xl border p-4 flex flex-col justify-between transition-colors duration-300 ${
            selectedMetric === 'mensal' 
              ? 'bg-[#0b1e2c]/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20' 
              : 'bg-[#0c1223] border-gray-800/80 hover:border-cyan-800/50 hover:bg-[#0c1223]/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-mono font-medium tracking-wider">ENTRADAS DO MÊS</span>
            <div className={`p-2 rounded-lg transition-colors ${
              selectedMetric === 'mensal' ? 'bg-cyan-500 text-black font-extrabold' : 'bg-cyan-950/40 text-cyan-400 border border-cyan-900/30'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-display font-extrabold text-white">
              R$ {monthlyEarnings().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] text-cyan-400 font-mono mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Meta de R$ 30k
            </div>
          </div>
        </motion.div>

        {/* Card 3: Despesas do Mês */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 15, scale: 0.98 },
            visible: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.2 } }
          }}
          whileHover={{ y: -4, scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          onClick={() => setSelectedMetric('despesas')}
          className={`cursor-pointer rounded-2xl border p-4 flex flex-col justify-between transition-colors duration-300 ${
            selectedMetric === 'despesas' 
              ? 'bg-[#29111c]/40 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/20' 
              : 'bg-[#0c1223] border-gray-800/80 hover:border-rose-900/50 hover:bg-[#0c1223]/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-mono font-medium tracking-wider">DESPESAS DO MÊS</span>
            <div className={`p-2 rounded-lg transition-colors ${
              selectedMetric === 'despesas' ? 'bg-rose-500 text-black font-extrabold' : 'bg-rose-950/40 text-rose-400 border border-rose-900/30'
            }`}>
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-display font-extrabold text-white">
              R$ {monthlyExpenses().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] text-rose-450 font-mono mt-1 flex items-center gap-1">
              <Percent className="w-3 h-3" /> do faturado: {monthlyEarnings() > 0 ? ((monthlyExpenses() / monthlyEarnings()) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </motion.div>

        {/* Card 4: Lucro Líquido Estimado */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 15, scale: 0.98 },
            visible: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.2 } }
          }}
          whileHover={{ y: -4, scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          onClick={() => setSelectedMetric('lucro')}
          className={`cursor-pointer rounded-2xl border p-4 flex flex-col justify-between transition-colors duration-300 ${
            selectedMetric === 'lucro' 
              ? 'bg-[#08201a]/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20' 
              : 'bg-[#0c1223] border-gray-800/80 hover:border-emerald-800/50 hover:bg-[#0c1223]/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-mono font-medium tracking-wider">LUCRO ESTIMADO</span>
            <div className={`p-2 rounded-lg transition-colors ${
              selectedMetric === 'lucro' ? 'bg-emerald-500 text-black font-extrabold' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30'
            }`}>
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-display font-extrabold text-white">
              R$ {(monthlyEarnings() - monthlyExpenses()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[9px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
              Margem: {monthlyEarnings() > 0 ? (((monthlyEarnings() - monthlyExpenses()) / monthlyEarnings()) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </motion.div>

        {/* Card 5: Ordens no Pátio */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 15, scale: 0.98 },
            visible: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.2 } }
          }}
          whileHover={{ y: -4, scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          onClick={() => setSelectedMetric('ordens')}
          className={`cursor-pointer rounded-2xl border p-4 flex flex-col justify-between transition-colors duration-300 ${
            selectedMetric === 'ordens' 
              ? 'bg-[#271d15]/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20' 
              : 'bg-[#0c1223] border-gray-800/80 hover:border-amber-850/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-mono font-medium tracking-wider">ORDENS NO PÁTIO</span>
            <div className={`p-2 rounded-lg transition-colors ${
              selectedMetric === 'ordens' ? 'bg-amber-500 text-black font-extrabold' : 'bg-amber-950/40 text-amber-500 border border-amber-900/30'
            }`}>
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-display font-extrabold text-white">
              {activeOSCount} de {ordensServico.length} OS
            </div>
            <div className="text-[9px] text-amber-500 font-mono mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" /> {servicesInProgress} em execução
            </div>
          </div>
        </motion.div>

        {/* Card 6: Alerta Reposição Estoque */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 15, scale: 0.98 },
            visible: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.2 } }
          }}
          whileHover={{ y: -4, scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          onClick={() => setSelectedMetric('estoque')}
          className={`cursor-pointer rounded-2xl border p-4 flex flex-col justify-between transition-colors duration-300 ${
            selectedMetric === 'estoque' 
              ? 'bg-[#291113]/40 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20' 
              : 'bg-[#0c1223] border-gray-800/80 hover:border-red-800/50 hover:bg-[#0c1223]/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-red-450 font-mono font-medium tracking-wider flex items-center gap-1">
              <Activity className="w-3 h-3 text-red-500 animate-pulse" /> REPOSIÇÃO
            </span>
            <div className={`p-2 rounded-lg transition-colors ${
              selectedMetric === 'estoque' ? 'bg-red-500 text-black font-extrabold' : 'bg-red-950/40 text-red-400 border border-red-900/30'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-display font-extrabold text-white">
              {lowStockCount} Itens
            </div>
            <div className="text-[9px] text-red-400 font-mono mt-1">
              Estoque crítico detectado
            </div>
          </div>
        </motion.div>

        {/* Card 7: Taxa de Retorno de Garantia */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 15, scale: 0.98 },
            visible: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.2 } }
          }}
          whileHover={{ y: -4, scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          onClick={() => setSelectedMetric('garantia')}
          className={`cursor-pointer rounded-2xl border p-4 flex flex-col justify-between transition-colors duration-300 ${
            selectedMetric === 'garantia' 
              ? 'bg-[#210f2c]/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/20' 
              : 'bg-[#0c1223] border-gray-800/80 hover:border-purple-800/50 hover:bg-[#0c1223]/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-mono font-medium tracking-wider">RETORNO GARANTIA</span>
            <div className={`p-2 rounded-lg transition-colors ${
              selectedMetric === 'garantia' ? 'bg-purple-600 text-white font-extrabold' : 'bg-purple-950/40 text-purple-400 border border-purple-900/30'
            }`}>
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-display font-extrabold text-white">
              {warrantyStats.rateMonth.toFixed(1)}%
            </div>
            <div className="text-[9px] text-purple-400 font-mono mt-1">
              {warrantyStats.warrantyReturnInMonth} ret. / {warrantyStats.finalizedInMonth} concl. (mês)
            </div>
          </div>
        </motion.div>

      </motion.div>

      {/* DETAILED INTERACTIVE DRAWER CONTEXTUAL */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMetric}
          initial={{ opacity: 0, height: 0, y: -8 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden bg-[#0a101d] border border-slate-800 rounded-2xl p-5 shadow-2xl relative"
        >
          {/* Subtle neon indicator top line */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] ${
            selectedMetric === 'diario' ? 'bg-green-500' :
            selectedMetric === 'mensal' ? 'bg-cyan-500' :
            selectedMetric === 'despesas' ? 'bg-rose-500' :
            selectedMetric === 'lucro' ? 'bg-emerald-500' :
            selectedMetric === 'ordens' ? 'bg-amber-500' :
            selectedMetric === 'estoque' ? 'bg-red-500' : 'bg-purple-500'
          }`} />

          {selectedMetric === 'diario' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center font-sans">
              <div className="md:col-span-8 space-y-1">
                <span className="text-[9px] font-mono tracking-widest bg-green-950/50 border border-green-800 text-green-400 px-2 py-0.5 rounded font-bold uppercase">Métrica ativa: Lançamentos Diários</span>
                <h3 className="text-white font-extrabold text-lg flex items-center gap-1.5 font-display pt-1">
                  ⚡ Fluxo de Caixa Diário Consolidado
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Sumarização em tempo real de todas as receitas processadas hoje na {company.name}. 
                  Pagamentos à vista via Pix e ordens de serviço finalizadas nas últimas 24 horas atualizam este balanço instantaneamente para controle de fechamento diário de caixa.
                </p>
                <div className="pt-2 font-mono text-[10px] text-gray-500">
                  Total de lançamentos registrados hoje: <span className="text-white font-bold">{financeiro.filter(f => f.dueDate === new Date().toISOString().split('T')[0]).length} operação(ões)</span>.
                </div>
              </div>
              <div className="md:col-span-4 flex flex-col justify-center bg-[#070b14] border border-gray-850 p-4 rounded-xl space-y-2">
                <div className="text-[10px] text-gray-400 font-mono">SALDO CONSOLIDADO:</div>
                <div className="text-2xl font-display font-extrabold text-green-405 text-green-400 text-left md:text-right">
                  R$ {dailyEarnings().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="border-t border-gray-800/65 pt-1.5 flex justify-between items-center text-[10px] text-green-400 font-mono">
                  <span>Meta Diária Estimada:</span>
                  <span>R$ 1.500,00</span>
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'mensal' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center font-sans">
              <div className="md:col-span-8 space-y-2">
                <span className="text-[9px] font-mono tracking-widest bg-cyan-950/50 border border-cyan-800 text-cyan-400 px-2 py-0.5 rounded font-bold uppercase">Métrica ativa: Entradas do Mês</span>
                <h3 className="text-white font-extrabold text-lg flex items-center gap-1.5 font-display">
                  📈 Objetivos de Faturamento do Mês
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Progresso geral do faturamento contra a meta estipulada de <strong>R$ 30.000,00</strong>. No plano SaaS atual, atingir este patamar destaca sua oficina na zona de excelente rentabilidade setorial para lojas mecânicas prêmio.
                </p>
                
                {/* Custom Goal Progress Bar */}
                <div className="pt-3 max-w-xl">
                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 mb-1">
                    <span>Progresso Atual: {Math.min(100, (monthlyEarnings() / 30000) * 100).toFixed(1)}%</span>
                    <span>Meta: R$ 30.000,00</span>
                  </div>
                  <div className="w-full bg-slate-900 border border-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (monthlyEarnings() / 30000) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="md:col-span-4 flex flex-col justify-center bg-[#070b14] border border-gray-850 p-4 rounded-xl space-y-2">
                <div className="text-[10px] text-cyan-400 font-mono">TOTAL RECEBIDO (ACUMULADO):</div>
                <div className="text-2xl font-display font-extrabold text-white text-left md:text-right">
                  R$ {monthlyEarnings().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="border-t border-gray-800/65 pt-1.5 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <span>Falta para Meta:</span>
                  <span className="text-white font-bold">R$ {Math.max(0, 30000 - monthlyEarnings()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'despesas' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center font-sans">
              <div className="md:col-span-8 space-y-1">
                <span className="text-[9px] font-mono tracking-widest bg-rose-950/50 border border-rose-800 text-rose-400 px-2 py-0.5 rounded font-bold uppercase">Métrica ativa: Despesas Consolidadas</span>
                <h3 className="text-white font-extrabold text-lg flex items-center gap-1.5 font-display pt-1">
                  🛑 Controle e Auditoria de Custos Mensais
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Total de saídas registradas relativas a pagamentos de peças, ferramentas, comissões de equipe, luz e assessoria especializada. Reduzir custos fixos não essenciais é a chave para sustentar fluxos de caixa otimizados nos fins de semana.
                </p>
                <div className="pt-2 font-mono text-[10px] text-rose-450 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                  Alerta: O coeficiente de despesa atual está em {(monthlyEarnings() > 0 ? ((monthlyExpenses() / monthlyEarnings()) * 100).toFixed(1) : 0)}% do faturamento. Limite prudencial: 60%.
                </div>
              </div>
              <div className="md:col-span-4 flex flex-col justify-center bg-[#070b14] border border-gray-850 p-4 rounded-xl space-y-2">
                <div className="text-[10px] text-rose-400 font-mono">TOTAL EM DESPESAS (DÉBITO):</div>
                <div className="text-2xl font-display font-extrabold text-[#ef4444] text-left md:text-right">
                  R$ {monthlyExpenses().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="border-t border-gray-800/65 pt-1.5 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <span>Lançamentos cadastrados:</span>
                  <span className="text-white font-bold">{financeiro.filter(f => f.type === 'Despesa').length} itens</span>
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'lucro' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center font-sans">
              <div className="md:col-span-8 space-y-1">
                <span className="text-[9px] font-mono tracking-widest bg-emerald-950/50 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">Métrica ativa: Lucratividade</span>
                <h3 className="text-white font-extrabold text-lg flex items-center gap-1.5 font-display pt-1">
                  💎 Saúde Financeira e Retorno Líquido
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Resultado líquido estimado no período (Receitas menos Custos Totais). Margens líquidas acima de <strong>20%</strong> são consideradas excelentes no segmento de Autotech e reparações mecânicas avançadas no Brasil.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                    ((monthlyEarnings() - monthlyExpenses()) / (monthlyEarnings() || 1)) >= 0.25 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/60' 
                      : 'bg-amber-950/50 text-amber-500 border border-amber-900/40'
                  }`}>
                    {((monthlyEarnings() - monthlyExpenses()) / (monthlyEarnings() || 1)) >= 0.25 ? 'EXCELENTE RENDIMENTO' : 'DENTRO DAS METAS OPERACIONAIS'}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Ticket Médio de OS: <strong className="text-white">R$ {(monthlyEarnings() / (ordensServico.length || 1)).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</strong>
                  </span>
                </div>
              </div>
              <div className="md:col-span-4 flex flex-col justify-center bg-[#070b14] border border-gray-850 p-4 rounded-xl space-y-2">
                <div className="text-[10px] text-emerald-400 font-mono font-bold">LUCRO LÍQUIDO RESIDUAL:</div>
                <div className="text-2xl font-display font-extrabold text-[#10b981] text-left md:text-right">
                  R$ {(monthlyEarnings() - monthlyExpenses()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="border-t border-gray-800/65 pt-1.5 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <span>Margem de Lucro Real:</span>
                  <span className="text-[#10b981] font-bold">
                    {monthlyEarnings() > 0 ? (((monthlyEarnings() - monthlyExpenses()) / monthlyEarnings()) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'ordens' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center font-sans">
              <div className="md:col-span-8 space-y-1">
                <span className="text-[9px] font-mono tracking-widest bg-amber-950/50 border border-amber-800 text-amber-500 px-2 py-0.5 rounded font-bold uppercase">Métrica ativa: Produção e Pátio</span>
                <h3 className="text-white font-extrabold text-lg flex items-center gap-1.5 font-display pt-1">
                  🛠️ Capacidade Produtiva e Alocação do Pátio
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Total de ordens de serviço ativas atualmente sob cuidados da sua equipe de mecânicos. Certifique-se de atualizar o progresso de "Em execução" para diminuir tempos de gargalo de veículos pendentes no pátio físico.
                </p>
                <div className="pt-2 grid grid-cols-4 gap-2 text-[10px] font-mono text-center">
                  <div className="bg-slate-900 border border-slate-850 p-1.5 rounded">
                    <span className="block text-blue-400 font-bold">{ordensServico.filter(o => o.status === 'Aberta').length}</span>
                    <span className="text-[8px] text-gray-500 uppercase">Abertas</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 p-1.5 rounded">
                    <span className="block text-yellow-500 font-bold">{ordensServico.filter(o => o.status === 'Em análise').length}</span>
                    <span className="text-[8px] text-gray-400 uppercase">Análise</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 p-1.5 rounded">
                    <span className="block text-orange-400 font-bold">{ordensServico.filter(o => o.status === 'Aguardando peça').length}</span>
                    <span className="text-[8px] text-gray-400 uppercase">Peças</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 p-1.5 rounded">
                    <span className="block text-red-500 font-bold">{ordensServico.filter(o => o.status === 'Em execução').length}</span>
                    <span className="text-[8px] text-gray-405 uppercase">Execução</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-4 flex flex-col justify-center bg-[#070b14] border border-gray-850 p-4 rounded-xl space-y-2">
                <div className="text-[10px] text-amber-500 font-mono">ORDENS ATIVAS HOJE:</div>
                <div className="text-3xl font-display font-extrabold text-white text-left md:text-right">
                  {activeOSCount}
                </div>
                <div className="border-t border-gray-800/65 pt-1.5 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <span>Total Histórico Geral:</span>
                  <span className="text-white font-bold">{ordensServico.length} OS</span>
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'estoque' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center font-sans">
              <div className="md:col-span-8 space-y-1">
                <span className="text-[9px] font-mono tracking-widest bg-red-950/50 border border-red-850 text-red-400 px-2 py-0.5 rounded font-bold uppercase">Métrica ativa: Alertas de Inventário</span>
                <h3 className="text-white font-extrabold text-lg flex items-center gap-1.5 font-display pt-1">
                  📦 Situação Crítica de Estoque de Reposição
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Número de peças e lubrificantes com quantidades em inventário iguais ou abaixo do limite mínimo configurado por segurança. Evitar rupturas é essencial para não atrasar a entrega de ordens de serviço complexas.
                </p>
                <div className="pt-2 font-mono text-[10px] text-gray-500">
                  Total de SKU cadastrados: <span className="text-white font-bold">{produtos.length} itens</span>. Itens regulares: <span className="text-green-500 font-bold">{produtos.length - lowStockCount} itens</span>.
                </div>
              </div>
              <div className="md:col-span-4 flex flex-col justify-center bg-[#070b14] border border-gray-850 p-4 rounded-xl space-y-2">
                <div className="text-[10px] text-red-400 font-mono font-bold">ITENS ABAIXO DO MÍNIMO:</div>
                <div className="text-2xl font-display font-extrabold text-[#ef4444] text-left md:text-right">
                  {lowStockCount} SKU(s)
                </div>
                <div className="border-t border-gray-800/65 pt-1.5 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <span>Percentual de Alerta:</span>
                  <span className="text-red-500 font-bold">{((lowStockCount / (produtos.length || 1)) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'garantia' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch font-sans">
              <div className="md:col-span-8 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono tracking-widest bg-purple-950/50 border border-purple-800 text-purple-400 px-2 py-0.5 rounded font-bold uppercase">
                    Métrica Ativa: Retorno de Garantia (Refugo Técnico)
                  </span>
                  <h3 className="text-white font-extrabold text-lg flex items-center gap-1.5 font-display pt-1">
                    🛡️ Índice / Taxa de Retorno de Garantia
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">
                    Reflete a qualidade técnica da oficina. Calculado dividindo o número no mês de ordens de serviço marcadas com badge de retorno de garantia (veículos que realizaram serviço anterior similar dentro de {company?.warrantyDays || 90} dias) pelo número total de ordens finalizadas/entregues no mesmo período.
                  </p>
                </div>

                {/* Sub-list of return OSs detected this month */}
                <div className="space-y-1.5 mt-2 max-h-48 overflow-y-auto pr-1">
                  <div className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">
                    OSs em Retorno Detectadas este Mês:
                  </div>
                  {(() => {
                    const now = new Date();
                    const currentMonth = now.getMonth();
                    const currentYear = now.getFullYear();
                    const returnsThisMonth = ordensServico.filter(os => {
                      const osDate = new Date(os.createdAt);
                      const isThisMonth = osDate.getMonth() === currentMonth && osDate.getFullYear() === currentYear;
                      return isThisMonth && isWarrantyReturnOS(os);
                    });

                    if (returnsThisMonth.length === 0) {
                      return (
                        <div className="text-[10.5px] font-mono text-green-500 bg-green-950/20 px-3 py-2 border border-green-950/55 rounded-xl">
                          🎉 Excelente! Nenhuma OS retornou em garantia este mês.
                        </div>
                      );
                    }

                    return (
                      <div className="flex flex-col gap-1.5">
                        {returnsThisMonth.map(os => (
                          <div key={os.id} className="p-2 border border-purple-950/65 bg-[#0e0c15] rounded-xl flex justify-between items-center text-[10.5px] font-mono text-slate-350">
                            <div>
                              <strong className="text-purple-300">#{os.id}</strong> - {os.veiculoInfo || os.plate} ({os.clienteName})
                              <div className="text-[9px] text-gray-500">
                                Diagnóstico atual: "{os.diagnosis || os.problem}" • Criada em: {new Date(os.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <span className="text-[8.5px] font-bold bg-purple-900/35 border border-purple-800 text-purple-400 px-2 py-0.5 rounded">
                              REVISÃO VINCULADA
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col justify-center bg-[#070b14] border border-purple-950 p-4 rounded-xl space-y-3.5">
                <div className="space-y-1">
                  <div className="text-[10px] text-purple-400 font-mono font-bold tracking-wider uppercase">
                    TAXA DE RETORNO DO MÊS:
                  </div>
                  <div className="text-3xl font-display font-extrabold text-[#c084fc]">
                    {warrantyStats.rateMonth.toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-1 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 leading-normal font-mono text-[10px] text-gray-400">
                  <div className="flex justify-between">
                    <span>Retornos no Mês:</span>
                    <strong className="text-white">{warrantyStats.warrantyReturnInMonth} OS</strong>
                  </div>
                  <div className="flex justify-between border-t border-gray-850/45 pt-1 mt-1">
                    <span>Finalizadas no Mês:</span>
                    <strong className="text-white">{warrantyStats.finalizedInMonth} OS</strong>
                  </div>
                </div>

                <div className="border-t border-purple-950/45 pt-2 flex flex-col gap-0.5 text-[8.5px] text-gray-500 font-mono leading-relaxed">
                  <div>* Limite saudável ideal tolerado: &lt; 5%</div>
                  <div>* Histórico acumulado geral: {warrantyStats.rateAllTime.toFixed(1)}% ({warrantyStats.allWarrantyReturns} retornos de {warrantyStats.totalFinalizedAllTime} OSs)</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* CHARTS GRAPHICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Chart: Fluxo de Caixa */}
        <motion.div 
          initial={{ opacity: 0, y: 15, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.99 }}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          transition={{ duration: 0.4 }}
          className="col-span-12 lg:col-span-8 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col justify-between"
        >
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
        </motion.div>

        {/* Right Chart: Mais vendidos */}
        <motion.div 
          initial={{ opacity: 0, y: 15, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.99 }}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="col-span-12 lg:col-span-4 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col justify-between"
        >
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
        </motion.div>

      </div>

      {/* 🚗 SEÇÃO DE ALERTAS DE REVISÕES PROGRAMADAS POR QUILOMETRAGEM */}
      {revisionAlerts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-500/30 rounded-2xl p-6 text-left shadow-lg font-mono"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-850 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-650 bg-red-600 rounded-xl text-white animate-pulse">
                <Wrench className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-white text-base">Alerta de Revisões Programadas por Quilometragem</h3>
                <p className="text-[10px] text-red-400">
                  Atenção! Há veículos com limite de odômetro próximo ou prazo estimado expirando.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-red-600 text-white font-bold px-3 py-1 rounded-full animate-bounce">
              {revisionAlerts.length} alertas urgentes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {revisionAlerts.map((rev) => {
              const veh = veiculos.find((v: any) => v.id === rev.vehicleId);
              const currentKm = veh ? (veh.km || 0) : rev.currentVehicleKm;
              const kmRemaining = rev.targetKm - currentKm;
              
              const targetDate = new Date(rev.estimatedDate);
              const now = new Date();
              const diffTime = targetDate.getTime() - now.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              let isKmViolated = kmRemaining <= 0;
              let isDateViolated = diffDays < 0;

              return (
                <div 
                  key={rev.id}
                  className="bg-[#080d19] border border-red-900/15 hover:border-red-500/30 rounded-xl p-4 flex flex-col gap-3 transition-all font-mono"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col text-left">
                      <span className="text-white font-bold text-xs uppercase tracking-tight">{rev.vehicleName}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">Cliente: {rev.clientName}</span>
                    </div>
                    <span className="text-[10px] font-bold border border-blue-500 bg-[#0f172a] text-blue-400 px-1.5 py-0.5 rounded leading-none shrink-0 uppercase">
                      {rev.plate}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/25 p-2.5 rounded border border-gray-900">
                    <div>
                      <span className="text-gray-505 text-gray-500 uppercase block">KM Atual</span>
                      <span className="text-white font-bold">{currentKm.toLocaleString()} KM</span>
                    </div>
                    <div>
                      <span className="text-gray-505 text-gray-500 uppercase block">KM Alvo</span>
                      <span className="text-red-400 font-bold">{rev.targetKm.toLocaleString()} KM</span>
                    </div>
                    <div className="col-span-2 pt-1.5 border-t border-gray-900 flex justify-between">
                      <span className="text-gray-400 font-sans">
                        {isKmViolated ? (
                          <span className="text-red-500 font-bold">🔴 EXCEDIDO EM {Math.abs(kmRemaining).toLocaleString()} KM</span>
                        ) : (
                          <span className="text-amber-500">🟡 Restam {kmRemaining.toLocaleString()} KM</span>
                        )}
                      </span>
                      <span className="text-gray-400 text-right">
                        {isDateViolated ? (
                          <span className="text-red-505 text-red-500 font-bold">Atraso ({Math.abs(diffDays)}d)</span>
                        ) : (
                          <span className="text-gray-300">Em {diffDays} dias</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="text-gray-400 text-[10px] font-sans truncate pr-2 text-left" title={rev.description}>
                      {rev.description}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[8.5px] uppercase bg-amber-950 text-amber-400 border border-amber-900/40 text-right leading-none shrink-0 font-bold">
                      {rev.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* LOW STOCK & RECENT SERVICES ROW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* List 1: Alerta Estoque Mínimo */}
        <motion.div 
          initial={{ opacity: 0, y: 15, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.99 }}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          transition={{ duration: 0.4 }}
          className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 text-left"
        >
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
            {produtos.filter(p => p.quantity <= p.minStock).map((prod, idx) => (
              <motion.div 
                key={prod.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: Math.min(5, idx) * 0.05 }}
                className="flex justify-between items-center p-3 rounded-xl border border-gray-900 bg-gray-950/30"
              >
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
              </motion.div>
            ))}
            {lowStockCount === 0 && (
              <div className="text-center py-8 text-xs text-gray-500">
                ✅ Tudo certo! Todos os produtos estão com estoque ideal.
              </div>
            )}
          </div>
        </motion.div>

        {/* List 2: OS Recentes */}
        <motion.div 
          initial={{ opacity: 0, y: 15, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.99 }}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 text-left"
        >
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
            {ordensServico.map((os, idx) => {
              const statusColor = (st: string) => {
                switch(st) {
                  case 'Aberta': return 'border-blue-900/40 bg-blue-950/20 text-blue-400';
                  case 'Em análise': return 'border-yellow-900/40 bg-yellow-950/20 text-yellow-400';
                  case 'Aguardando peça': return 'border-orange-950/40 bg-orange-950/20 text-orange-400';
                  case 'Em execução': return 'border-red-900/40 bg-red-950/20 text-red-500 font-bold';
                  default: return 'border-green-905/40 bg-green-950/20 text-green-400';
                }
              };
              return (
                <motion.div 
                  key={os.id} 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(5, idx) * 0.05 }}
                  className="flex justify-between items-center p-3 rounded-xl border border-gray-900 bg-gray-950/30"
                >
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
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* List 3: Ranking de Mecânicos por Menor Retorno de Garantia */}
        <motion.div 
          initial={{ opacity: 0, y: 15, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.99 }}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 text-left"
        >
          <div className="flex justify-between items-center border-b border-gray-850 pb-4 mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-purple-400 flex-shrink-0" /> Eficiência de Montagem
              </h3>
              <p className="text-[10px] text-gray-500 font-mono">Ranking de mecânicos por menor índice de retornos.</p>
            </div>
            <span className="text-[10px] font-mono bg-purple-950/40 text-purple-450 border border-purple-900/30 px-2.5 py-1 rounded">
              Índice de Acertabilidade
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
            {getMechanicRanking().map((mech, idx) => {
              const getPositionBadge = (i: number) => {
                if (i === 0) return { emoji: "🥇", textClass: "text-[#fbbf24]", bgClass: "bg-[#fbbf24]/10 border-[#fbbf24]/20" };
                if (i === 1) return { emoji: "🥈", textClass: "text-[#cbd5e1]", bgClass: "bg-[#cbd5e1]/10 border-[#cbd5e1]/20" };
                if (i === 2) return { emoji: "🥉", textClass: "text-[#b45309]", bgClass: "bg-[#b45309]/10 border-[#b45309]/20" };
                return { emoji: "👤", textClass: "text-slate-400", bgClass: "bg-slate-950/40 border-slate-900" };
              };
              const badge = getPositionBadge(idx);

              return (
                <motion.div 
                  key={mech.name} 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(5, idx) * 0.05 }}
                  className="flex flex-col p-3 rounded-xl border border-gray-900 bg-[#070b14]/45 gap-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`text-base px-1 py-0.5 rounded border ${badge.bgClass} flex items-center justify-center`} title={`${idx + 1}º Lugar`}>
                        {badge.emoji}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white">{mech.name}</span>
                        <span className="text-[9px] text-gray-550 font-mono">
                          {mech.totalFinalized} OS {mech.returnsCount > 0 ? `• ${mech.returnsCount} retornos` : '• nenhum retorno'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {mech.totalFinalized > 0 ? (
                        <>
                          <span className="text-xs font-bold text-white block">
                            {mech.efficiencyRate.toFixed(1)}% <span className="text-[9px] text-emerald-400 font-mono font-medium">acerto</span>
                          </span>
                          <span className="text-[8px] text-slate-500 block font-mono">
                            Índice ret: {mech.returnRate.toFixed(1)}%
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] text-gray-500 font-mono italic">
                          Sem histórico
                        </span>
                      )}
                    </div>
                  </div>

                  {mech.totalFinalized > 0 && (
                    <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          mech.efficiencyRate >= 95 ? 'bg-emerald-500' :
                          mech.efficiencyRate >= 80 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${mech.efficiencyRate}%` }}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>

      {/* List 3: Histórico de Auditoria Local */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.99 }}
        whileHover={{ y: -2, transition: { duration: 0.15 } }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-6 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 text-left col-span-12"
      >
        <div className="flex justify-between items-center border-b border-gray-850 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-950/20 text-orange-500 border border-orange-900/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Histórico de Auditoria de Ações Críticas</h3>
              <p className="text-[10px] text-gray-400 font-mono">Registro local em tempo real (últimas 10 ações registradas).</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-orange-950/40 text-orange-400 border border-orange-900/40 px-2.5 py-1 rounded">
            Segurança Ativa OS/Estoque
          </span>
        </div>

        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
          {localAuditLogs && localAuditLogs.length > 0 ? (
            localAuditLogs.slice(0, 10).map((log, idx) => (
              <motion.div 
                key={log.id} 
                id={`audit-log-item-${log.id}`} 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: Math.min(5, idx) * 0.04 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-xl border border-gray-900 bg-gray-950/20 hover:bg-gray-950/40 transition-all font-mono gap-2 text-xs"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-extrabold px-2 py-0.5 rounded bg-orange-950/30 text-[10px] text-orange-400 border border-orange-900/20">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      por: <strong className="text-slate-350 font-sans font-medium">{log.userName}</strong> ({log.userEmail})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-300 font-sans mt-0.5 font-medium">{log.details}</span>
                </div>
                
                <div className="text-right text-[10px] text-gray-500 self-end sm:self-center">
                  <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-gray-500 italic">
              Nenhuma ação crítica registrada na auditoria local de segurança ainda.
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
};
