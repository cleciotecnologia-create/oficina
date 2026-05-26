import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Building, 
  TrendingUp, 
  Cpu, 
  Activity, 
  Layers, 
  Settings, 
  Check, 
  AlertTriangle, 
  Play, 
  Pause, 
  Sliders, 
  RefreshCw,
  Search, 
  DollarSign, 
  Key, 
  Database, 
  Terminal, 
  Tv, 
  Zap,
  ChevronRight,
  Sparkles,
  Lock,
  UserCheck,
  History
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Company } from '../types';

interface Tenant {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  planId: 'Básico' | 'Profissional' | 'Premium';
  createdAt: string;
  status: 'Ativo' | 'Suspenso';
  databaseSize: number;
  monthlyValue: number;
  customDomain?: string;
  subdomain?: string;
  domainStatus?: 'Pendente' | 'Verificando' | 'Ativo' | 'Falhado';
}

interface AuditLog {
  id: string;
  timestamp: string;
  tenantName: string;
  changeType: 'Plano' | 'Status';
  newValue: string;
  oldValue: string;
  adminEmail: string;
}

export const SuperAdminView: React.FC = () => {
  const { company, updateCompany, user } = useApp();

  // Initial tenants listing
  const [tenants, setTenants] = useState<Tenant[]>([
    {
      id: company.id, // Include the currently logged-in company of the session
      name: company.name + " (Membro Principal)",
      cnpj: company.cnpj || "98.765.432/0001-99",
      email: company.email || "contato@autoprecision.com.br",
      phone: company.phone || "(11) 98765-4321",
      planId: company.planId,
      createdAt: company.createdAt || "2026-01-10T12:00:00Z",
      status: 'Ativo',
      databaseSize: 1420,
      monthlyValue: company.planId === 'Premium' ? 499 : company.planId === 'Profissional' ? 299 : 149,
      customDomain: company.customDomain || "mecanica.autoprecision.com.br",
      subdomain: company.subdomain || "autoprecision",
      domainStatus: company.domainStatus || "Ativo"
    },
    {
      id: "tenant_speedy_2",
      name: "Speedy Motor Center SRL",
      cnpj: "42.112.553/0001-20",
      email: "financeiro@speedymotors.com.br",
      phone: "(41) 3224-9988",
      planId: "Profissional",
      createdAt: "2026-02-15T09:30:00Z",
      status: 'Ativo',
      databaseSize: 840,
      monthlyValue: 299,
      customDomain: "speedy.autoprecision.com.br",
      subdomain: "speedy",
      domainStatus: "Ativo"
    },
    {
      id: "tenant_voltcar_3",
      name: "Volt Car Auto Elétrica & Híbridos",
      cnpj: "55.842.124/0001-44",
      email: "atendimento@voltcar.com",
      phone: "(31) 98221-5050",
      planId: "Premium",
      createdAt: "2026-03-01T14:45:00Z",
      status: 'Ativo',
      databaseSize: 2150,
      monthlyValue: 499,
      customDomain: "mecanicavoltcar.com.br",
      subdomain: "voltcar",
      domainStatus: "Ativo"
    },
    {
      id: "tenant_prime_4",
      name: "Prime Funilaria & Martelo de Ouro",
      cnpj: "10.443.987/0001-02",
      email: "primefunilaria@gmail.com",
      phone: "(21) 3655-1100",
      planId: "Básico",
      createdAt: "2026-04-18T11:00:00Z",
      status: 'Ativo',
      databaseSize: 310,
      monthlyValue: 149,
      customDomain: "prime.autoprecision.com.br",
      subdomain: "prime",
      domainStatus: "Pendente"
    },
    {
      id: "tenant_racing_5",
      name: "Racing Tuners Performance SP",
      cnpj: "09.332.148/0001-78",
      email: "contato@racingtuners.com",
      phone: "(11) 5055-9000",
      planId: "Premium",
      createdAt: "2026-05-10T17:15:00Z",
      status: 'Suspenso',
      databaseSize: 1890,
      monthlyValue: 499,
      customDomain: "performance.racingtuners.com.br",
      subdomain: "racing",
      domainStatus: "Falhado"
    }
  ]);

  // Pricing configs and state
  const [basicPrice, setBasicPrice] = useState(149);
  const [profPrice, setProfPrice] = useState(299);
  const [premPrice, setPremPrice] = useState(499);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  // Selected tenant for detailed editing modal/drawer in local state
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  
  // Impersonating / masquerade active state
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  // Simulated audit logs history for the SaaS platform
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "log_init_1",
      timestamp: "2026-05-25T21:45:00Z",
      tenantName: "Racing Tuners Performance SP",
      changeType: "Status",
      newValue: "Suspenso",
      oldValue: "Ativo",
      adminEmail: "cleciotecnologia@gmail.com"
    },
    {
      id: "log_init_2",
      timestamp: "2026-05-25T18:12:00Z",
      tenantName: "Volt Car Auto Elétrica & Híbridos",
      changeType: "Plano",
      newValue: "Premium",
      oldValue: "Profissional",
      adminEmail: "cleciotecnologia@gmail.com"
    },
    {
      id: "log_init_3",
      timestamp: "2026-05-25T10:00:00Z",
      tenantName: "Speedy Motor Center SRL",
      changeType: "Plano",
      newValue: "Profissional",
      oldValue: "Básico",
      adminEmail: "suporte@autoprecision.com.br"
    }
  ]);

  // Simulated live terminal audit log feed
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM_INIT] Autenticação segura SuperAdmin concedida para cleciotecnologia@gmail.com",
    "[FIREBASE_SECURE] Conexão com Firestore Database inicializada com isolamento multi-tenant",
    "[BILLING_ENGINE] Verificação diária de faturamento recorrente executada com sucesso",
    "[ROUTING_INFO] Registro de logs de auditoria do servidor SaaS ativa em canal dedicado"
  ]);

  // Simulation parameters
  const [simulatedLatency, setSimulatedLatency] = useState(24); // ms
  const [simulatedLoad, setSimulatedLoad] = useState(8.5); // % cpu
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Add random logs to simulate actual traffic
  useEffect(() => {
    const logInterval = setInterval(() => {
      const actions = [
        `RESOLVING_REST_API: GET /api/v1/tenant/sync_cache_offline`,
        `FIRESTORE_WRITE: Atualizando dados operacionais do Tenant ${tenants[Math.floor(Math.random() * tenants.length)].id}`,
        `AUTH_AUDIT: Token de segurança validado com sucesso para usuário ativo`,
        `METRICS_COLLECTOR: Armazenamento em nuvem otimizado`,
        `BILLING: Gerando log de cobrança via gateway Stripe/Asaas`,
        `AI_AUDIT: Requisição processada pelo modelo Gemini Flash 2.5`
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev.slice(-40), `[${timestamp}] ${randomAction}`]);
      
      // slightly fluctuate simulated load
      setSimulatedLoad(prev => {
        const delta = (Math.random() - 0.5) * 2;
        return parseFloat(Math.min(99, Math.max(1, prev + delta)).toFixed(1));
      });
    }, 4500);

    return () => clearInterval(logInterval);
  }, [tenants]);

  // Toggle tenant active status
  const handleToggleStatus = (tenantId: string) => {
    const targetTenant = tenants.find(t => t.id === tenantId);
    if (!targetTenant) return;

    const nextStatus = targetTenant.status === 'Ativo' ? 'Suspenso' : 'Ativo';
    const oldStatus = targetTenant.status;

    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { ...t, status: nextStatus };
      }
      return t;
    }));

    // Register in persistent audit logs
    const newLog: AuditLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      tenantName: targetTenant.name,
      changeType: 'Status',
      newValue: nextStatus,
      oldValue: oldStatus,
      adminEmail: user?.email || "cleciotecnologia@gmail.com"
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Add to logs console
    const timestamp = new Date().toLocaleTimeString();
    setLogs(l => [...l, `[${timestamp}] ⚠️ STATUS ALTERADO: Tenant ${targetTenant.name} foi ${nextStatus.toUpperCase()} por ${user?.email || "cleciotecnologia@gmail.com"}`]);
  };

  // Change tenant plan tier
  const handleChangePlan = (tenantId: string, newPlan: 'Básico' | 'Profissional' | 'Premium') => {
    const targetTenant = tenants.find(t => t.id === tenantId);
    if (!targetTenant) return;
    if (targetTenant.planId === newPlan) return;

    const oldPlan = targetTenant.planId;
    let val = basicPrice;
    if (newPlan === 'Profissional') val = profPrice;
    if (newPlan === 'Premium') val = premPrice;

    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { ...t, planId: newPlan, monthlyValue: val };
      }
      return t;
    }));

    // Synchronize real-time state with useApp context if this is the active active company!
    if (tenantId === company.id) {
      updateCompany({ planId: newPlan });
    }

    // Register in persistent audit logs
    const newLog: AuditLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      tenantName: targetTenant.name,
      changeType: 'Plano',
      newValue: newPlan,
      oldValue: oldPlan,
      adminEmail: user?.email || "cleciotecnologia@gmail.com"
    };
    setAuditLogs(prev => [newLog, ...prev]);

    const timestamp = new Date().toLocaleTimeString();
    setLogs(l => [...l, `[${timestamp}] 💳 UPGRADE PLANO: Tenant ${targetTenant.name} alterado para nível [${newPlan.toUpperCase()}] por ${user?.email || "cleciotecnologia@gmail.com"}`]);
  };

  // Impersonate / masquerade trigger
  const handleImpersonate = (tenant: Tenant) => {
    if (impersonatingId === tenant.id) {
      setImpersonatingId(null);
      // restore active session back to default context and log
      updateCompany({ 
        name: company.name.replace(" (Impersonado)", ""),
        planId: company.planId
      });
      const timestamp = new Date().toLocaleTimeString();
      setLogs(l => [...l, `[${timestamp}] 👤 IMPERSONATE END: Conexão administrativa principal restaurada.`]);
    } else {
      setImpersonatingId(tenant.id);
      // Impersonate the context's company dynamically
      updateCompany({
        name: tenant.name + " (Impersonado)",
        cnpj: tenant.cnpj,
        phone: tenant.phone,
        planId: tenant.planId,
        address: "Av. do Negócio Adjudicado Secundário, 100"
      });

      const timestamp = new Date().toLocaleTimeString();
      setLogs(l => [...l, `[${timestamp}] 👤 SECURE IMPERSONATING: Simulando ambiente operacional de [${tenant.name}]`]);
    }
  };

  // Peak simulation logic trigger
  const handleTriggerPeakLoad = () => {
    setSimulatedLatency(98);
    setSimulatedLoad(84.3);
    const timestamp = new Date().toLocaleTimeString();
    setLogs(l => [...l, 
      `[${timestamp}] ⚡ PEAK_TRAFFIC_STRESS: Simulação de Alta Volatilidade de Requisições disparada!`,
      `[${timestamp}] 🛡️ SECURITY_AUDIT: Firewall Cloud Run dimensionado automaticamente para 4 instâncias de redundância.`
    ]);
    setTimeout(() => {
      setSimulatedLatency(24);
      setSimulatedLoad(8.5);
    }, 5000);
  };

  // Calculate high-level financial predictions
  const activeTenantsCount = tenants.filter(t => t.status === 'Ativo').length;
  const projectedMRR = tenants
    .filter(t => t.status === 'Ativo')
    .reduce((acc, curr) => acc + curr.monthlyValue, 0);

  const totalLogsRowsCount = tenants.reduce((acc, curr) => acc + curr.databaseSize, 0);

  // Filter tenants for view render
  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.cnpj.includes(searchTerm) ||
    t.phone.includes(searchTerm) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter audit logs for rendering in the audit table
  const filteredAuditLogs = auditLogs.filter(log =>
    log.tenantName.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.adminEmail.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.changeType.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.newValue.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.oldValue.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-6 text-left pb-12">
      
      {/* Impersonation active banner overlay */}
      {impersonatingId && (
        <div className="bg-yellow-950/40 border border-yellow-800/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping"></span>
            <AlertTriangle className="w-5 h-5 text-yellow-405 text-yellow-500" />
            <span>
              <strong>👤 MODO INFILTRADO DE SUPORTE ATIVO:</strong> Você está visualizando o ERP no papel de <strong>{tenants.find(t => t.id === impersonatingId)?.name}</strong>.
            </span>
          </div>
          <button
            onClick={() => handleImpersonate(tenants[0])}
            className="px-3.5 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-black font-extrabold rounded-lg select-none cursor-pointer duration-200"
          >
            Sair do Modo Infiltrado
          </button>
        </div>
      )}

      {/* Main SaaS Brand Section */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center justify-between">
        <div>
          <span className="bg-purple-950/20 border border-purple-900/40 text-purple-400 font-mono text-[9px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded-full">
            ✦ SaaS CONTROL CENTER & MULTI-TENANCY ✦
          </span>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2 mt-1.5">
            🔑 PAINEL SUPER-ADMINISTRATIVO SaaS
          </h1>
          <p className="text-xs text-gray-400 font-mono">
            Ambiente exclusivo para <strong>cleciotecnologia@gmail.com</strong> gerenciar planos, faturamento, banco de dados dos clientes e logs de auditoria.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300 font-mono">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>Status do Cluster: <strong className="text-emerald-400">Excelente</strong></span>
        </div>
      </div>

      {/* Dynamic Stats Grid for Multi-Tenancy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#0c1223] border border-gray-800 p-4.5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/30 text-purple-400">
            <Building className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">Clientes Ativos</span>
            <strong className="text-xl text-white font-mono leading-tight">{activeTenantsCount} / {tenants.length}</strong>
            <span className="text-[9px] text-slate-400 mt-0.5 font-mono">({tenants.filter(t => t.status === 'Suspenso').length} suspenso)</span>
          </div>
        </div>

        <div className="bg-[#0c1223] border border-gray-800 p-4.5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">Projeção MRR</span>
            <strong className="text-emerald-400 text-xl font-mono leading-tight">
              R$ {projectedMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
            <span className="text-[9px] text-slate-400 mt-0.5 font-mono">Recorrente Mensal SaaS</span>
          </div>
        </div>

        <div className="bg-[#0c1223] border border-gray-800 p-4.5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-900/30 text-cyan-400">
            <Database className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">Registros Globais</span>
            <strong className="text-xl text-white font-mono leading-tight">{totalLogsRowsCount} rgs</strong>
            <span className="text-[9px] text-slate-400 mt-0.5 font-mono">Isolamento Cloud Firestore</span>
          </div>
        </div>

        <div className="bg-[#0c1223] border border-gray-800 p-4.5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/30 text-red-500">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">Latência API</span>
            <strong className="text-xl text-white font-mono leading-tight">{simulatedLatency} ms</strong>
            <span className="text-[9px] text-slate-400 mt-0.5 font-mono">Cpu: {simulatedLoad}%</span>
          </div>
        </div>

      </div>

      {/* Main SaaS Platform Controllers Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Tenant Registry Database (8-grid) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          <div className="bg-[#0c1223] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="font-display font-bold text-white text-base">🏢 Cadastro e Diretório de Tenants SaaS</h3>
                <span className="text-[10px] font-mono text-gray-500">Base total de mecânicas registradas integradas no ERP multi-inquilinato.</span>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Filtrar oficina ou CNPJ..."
                  className="bg-[#050912] border border-gray-800 rounded-lg py-1.5 pl-8 pr-3 text-white text-xs font-mono focus:outline-none focus:border-purple-500 w-full sm:w-56"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-2.5 top-2 text-gray-550 text-gray-550 text-gray-500">
                  <Search className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Tenant Cards / List */}
            <div className="flex flex-col gap-3 font-mono text-xs">
              {filteredTenants.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Nenhuma oficina encontrada com os parâmetros de pesquisa definidos.</div>
              ) : (
                filteredTenants.map((tenant) => (
                  <div 
                    key={tenant.id} 
                    className={`p-4 rounded-xl border transition-all text-left flex flex-col gap-3.5 ${
                      tenant.id === impersonatingId 
                        ? 'bg-yellow-950/15 border-yellow-800/80' 
                        : tenant.id === company.id 
                          ? 'bg-purple-950/10 border-purple-900/40 relative overflow-hidden' 
                          : 'bg-[#050912] border-gray-850 hover:border-gray-800'
                    }`}
                  >
                    
                    {tenant.id === company.id && (
                      <div className="absolute top-0 right-0 bg-purple-600 text-white font-mono tracking-widest uppercase text-[8px] font-bold px-3 py-0.5 rounded-bl">
                        Sua Sessão Ativa
                      </div>
                    )}

                    {/* Tenant Main identification block */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 border-b border-gray-850 pb-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-white text-sm">{tenant.name}</strong>
                          {tenant.planId === 'Premium' && (
                            <span className="px-1.5 py-0.5 bg-yellow-950/30 border border-yellow-905 text-[8px] font-bold text-yellow-550 bg-yellow-950/40 border-yellow-850 text-yellow-500 rounded">
                              👑 Premium
                            </span>
                          )}
                          {tenant.planId === 'Profissional' && (
                            <span className="px-1.5 py-0.5 bg-blue-955 bg-blue-950/20 border border-blue-900 text-[8px] font-bold text-blue-400 rounded">
                              ⚙️ Profissional
                            </span>
                          )}
                          {tenant.planId === 'Básico' && (
                            <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[8px] text-slate-400 rounded">
                              🔩 Básico
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500">ID: {tenant.id} | CNPJ: {tenant.cnpj}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${tenant.status === 'Ativo' ? 'bg-green-950/30 border border-green-900 text-green-400 font-sans' : 'bg-red-950/30 border border-red-900 text-red-500'}`}>
                          ● {tenant.status.toUpperCase()}
                        </span>
                        <strong className="text-white text-sm">R$ {tenant.monthlyValue} /mês</strong>
                      </div>
                    </div>

                    {/* Contato & Detalhes técnicos */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-gray-400 leading-tight">
                      <div>📧 Email: <strong className="text-slate-300">{tenant.email}</strong></div>
                      <div>📞 Telefone: <strong className="text-slate-300">{tenant.phone}</strong></div>
                      <div>🗄️ Dados Gravados: <strong className="text-slate-300">{tenant.databaseSize} documentos</strong></div>
                    </div>

                    {(tenant.subdomain || tenant.customDomain) && (
                      <div className="border-t border-gray-850/50 pt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] items-center text-gray-500">
                        {tenant.subdomain && (
                          <div>
                            🌐 Subdomínio SaaS: <span className="text-purple-400 font-bold">{tenant.subdomain}.autoprecision.com.br</span>
                          </div>
                        )}
                        {tenant.customDomain && (
                          <div className="flex items-center gap-1.5">
                            🔗 Domínio Próprio: <span className="text-blue-400 font-bold underline cursor-pointer">{tenant.customDomain}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[8px] uppercase tracking-wider font-extrabold ${
                              tenant.domainStatus === 'Ativo' 
                                ? 'bg-green-950/40 border border-green-900/50 text-green-400' 
                                : tenant.domainStatus === 'Falhado'
                                  ? 'bg-red-950/40 border border-red-900 text-red-500 animate-pulse'
                                  : 'bg-amber-950/40 border border-amber-900 text-amber-500'
                            }`}>
                              {tenant.domainStatus || 'Pendente'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Controls Actions for custom SaaS Admin */}
                    <div className="border-t border-gray-850 pt-3 flex flex-wrap gap-2 justify-between items-center bg-slate-950/30 -mx-4 -mb-4 p-3 rounded-b-xl">
                      <div className="flex gap-1.5 items-center">
                        <span className="text-[9px] text-gray-505 text-gray-500 mr-1.5 block">NÍVEL:</span>
                        {(['Básico', 'Profissional', 'Premium'] as const).map((tier) => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => handleChangePlan(tenant.id, tier)}
                            className={`py-1 px-2.5 rounded text-[9px] hover:scale-102 select-none cursor-pointer duration-100 ${tenant.planId === tier ? 'bg-purple-650 bg-purple-600 text-white font-bold' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(tenant.id)}
                          className={`py-1 px-3 text-[9px] rounded font-bold cursor-pointer transition-colors ${tenant.status === 'Ativo' ? 'text-red-400 bg-red-950/10 hover:bg-red-955' : 'text-green-400 bg-green-950/10 hover:bg-green-955'}`}
                        >
                          {tenant.status === 'Ativo' ? "SUSPENDER CONTA" : "REATIVAR CONTA"}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleImpersonate(tenant)}
                          className={`py-1 px-3 text-[9px] rounded font-bold cursor-pointer transition-colors flex items-center gap-1 ${impersonatingId === tenant.id ? 'bg-yellow-600 text-black font-extrabold' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'}`}
                        >
                          <Zap className="w-3" />
                          {impersonatingId === tenant.id ? "FECHAR SESSÃO" : "INFILTRAR"}
                        </button>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>

          {/* Pricing Configs Grid */}
          <div className="bg-[#0c1223] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 text-left">
            <div>
              <h3 className="font-display font-bold text-white text-base">💰 Configuração Mestre de Planos (SaaS Gateway)</h3>
              <span className="text-[10px] text-gray-505 text-gray-500 font-mono">Modifique os valores dos planos recorrentes. As alterações se aplicam a novos contratos e renovações.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-[#050912] border border-gray-850 p-4 rounded-xl flex flex-col gap-1.5">
                <strong className="text-[10px] text-gray-400">PLAN ALIANÇA BÁSICO</strong>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-500 font-bold">$</span>
                  <input 
                    type="number"
                    className="bg-slate-950 border border-slate-850 rounded py-1 pl-6 pr-2 text-white w-full text-xs font-bold"
                    value={basicPrice}
                    onChange={(e) => setBasicPrice(parseInt(e.target.value) || 0)}
                  />
                </div>
                <span className="text-[9px] text-gray-500 leading-tight">Mecânicas compactas (máx 100 clientes)</span>
              </div>

              <div className="bg-[#050912] border border-gray-850 p-4 rounded-xl flex flex-col gap-1.5 col-span-1">
                <strong className="text-[10px] text-blue-405 text-blue-400">PLAN PROFISSIONAL</strong>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-500 font-bold">$</span>
                  <input 
                    type="number"
                    className="bg-slate-950 border border-slate-850 rounded py-1 pl-6 pr-2 text-white w-full text-xs font-bold"
                    value={profPrice}
                    onChange={(e) => setProfPrice(parseInt(e.target.value) || 0)}
                  />
                </div>
                <span className="text-[9px] text-gray-500 leading-tight">Médio porte (máx 500 clientes, AI parcial)</span>
              </div>

              <div className="bg-[#050912] border border-gray-850 p-4 rounded-xl flex flex-col gap-1.5 col-span-1">
                <strong className="text-[10px] text-yellow-550 text-yellow-500">PLAN RECORRENTE PREMIUM</strong>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-500 font-bold">$</span>
                  <input 
                    type="number"
                    className="bg-slate-950 border border-slate-850 rounded py-1 pl-6 pr-2 text-white w-full text-xs font-bold"
                    value={premPrice}
                    onChange={(e) => setPremPrice(parseInt(e.target.value) || 0)}
                  />
                </div>
                <span className="text-[9px] text-gray-500 leading-tight">Oficina integrada, Copilot e OBD-II avançados</span>
              </div>
            </div>

            <button
              onClick={() => {
                const timestamp = new Date().toLocaleTimeString();
                setLogs(l => [...l, `[${timestamp}] 💾 CONFIG_SAVE: Tabela fiscal de planos ajustada no banco de dados.`]);
                alert("Valores atualizados com sucesso no motor financeiro do SaaS!");
              }}
              className="py-2.5 px-4 bg-purple-655 bg-purple-600 hover:bg-purple-700 text-white font-mono text-[11px] font-bold rounded-xl mt-1 tracking-wider text-center cursor-pointer select-none transition-colors border-0"
            >
              SALVAR PARÂMETROS DE COBRANÇA
            </button>
          </div>

        </div>

        {/* Right: SaaS logs & Sandbox Tools (4-grid) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* SaaS Terminal */}
          <div className="bg-[#0c1223] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-850">
              <h3 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-purple-400" />
                Live SaaS Audit Log
              </h3>
              <button 
                onClick={() => setLogs([])}
                className="text-[9px] font-mono hover:text-red-500 text-gray-500 underline"
              >
                Limpar
              </button>
            </div>

            <div 
              ref={terminalRef}
              className="h-72 w-full bg-[#050912] border border-gray-900 rounded-xl p-3 font-mono text-[9px] leading-relaxed text-slate-300 overflow-y-auto flex flex-col gap-1 scrollbar-thin select-text"
            >
              {logs.map((log, lIdx) => {
                let colorClass = "text-gray-400";
                if (log.includes("STATUS ALTERADO") || log.includes("⚠️")) {
                  colorClass = "text-amber-400 font-bold bg-amber-950/10 rounded px-1";
                } else if (log.includes("UPGRADE") || log.includes("💳")) {
                  colorClass = "text-purple-405 text-purple-400 font-bold";
                } else if (log.includes("IMPERSONATE") || log.includes("👤")) {
                  colorClass = "text-cyan-400 font-bold";
                } else if (log.includes("SYSTEM_INIT") || log.includes("FIREBASE")) {
                  colorClass = "text-green-500 font-medium";
                }

                return (
                  <div key={lIdx} className={colorClass}>
                    {log}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-2 font-mono text-[10px]">
              <button
                type="button"
                onClick={handleTriggerPeakLoad}
                className="py-2 bg-slate-900 hover:bg-slate-855 border border-slate-800 text-slate-300 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[99.5%]"
              >
                <Zap className="w-3.5 text-yellow-500" /> Simular Pico de Tráfego
              </button>
            </div>
          </div>

          {/* SaaS Suggestions & Strategy */}
          <div className="bg-[#0c1223] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 text-left font-sans text-xs">
            <h4 className="font-display font-extrabold text-white text-sm flex items-center gap-1.5 uppercase">
              🚀 Dicas de Monetização SaaS
            </h4>
            
            <div className="flex flex-col gap-3 text-slate-400 leading-relaxed text-[11px]">
              <div className="p-3 bg-slate-950/40 rounded-xl border border-gray-850">
                <strong className="text-white block mb-1">💡 Cobrança Baseada em Recursos (Volume):</strong>
                Limite o cadastro de mecânicos e usuários simultâneos no SaaS. Crie taxas adicionais por usuário cadastrado fora do limite do plano.
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-gray-850">
                <strong className="text-white block mb-1">✨ Módulo Inteligência Artificial Premium:</strong>
                Crie um add-on mensal de <strong>R$ 49,90/mês</strong> em seu modelo de faturamento para liberar requisições ilimitadas do copiloto inteligente para os mecânicos do parceiro.
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-gray-850">
                <strong className="text-white block mb-1">🏦 Split de Pagamentos PDV:</strong>
                Ofereça transações via PIX QR Code diretamente integradas no fluxo do PDV de seus tenants e cobre uma taxa de 0.5% por transação concluída!
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* SaaS Audit History Trail Section */}
      <div className="bg-[#0c1223] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 text-left">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-gray-850 pb-4">
          <div>
            <h3 className="font-display font-extrabold text-white text-base flex items-center gap-2">
              <History className="w-5 h-5 text-purple-450 text-purple-400" />
              Histórico de Auditoria do SaaS
            </h3>
            <p className="text-[10px] font-mono text-gray-550 text-gray-500">
              Registro cronológico e imutável de todas as alterações manuais de planos e status de tenants realizadas pelos administradores do sistema.
            </p>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar por Tenant, Administrador ou Ação..."
              className="bg-[#050912] border border-gray-800 rounded-lg py-1.5 pl-8 pr-3 text-white text-xs font-mono focus:outline-none focus:border-purple-500 w-full md:w-80"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
            />
            <div className="absolute left-2.5 top-2 text-gray-500">
              <Search className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-850 bg-[#050912]">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-gray-400 border-b border-gray-850">
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Data & Registro</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Tenant / Oficina</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Parâmetro</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Alteração (Anterior → Atual)</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Administrador Responsável</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-sans">
                    Nenhum registro de auditoria corresponde aos critérios de busca.
                  </td>
                </tr>
              ) : (
                filteredAuditLogs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const formattedDate = !isNaN(dateObj.getTime())
                    ? dateObj.toLocaleString('pt-BR')
                    : log.timestamp;
                  const isAdminOwner = log.adminEmail === 'cleciotecnologia@gmail.com';
                  
                  return (
                    <tr key={log.id} className="border-b border-gray-850 hover:bg-[#070d18] transition-colors">
                      <td className="p-3 whitespace-nowrap text-gray-450 text-gray-500">
                        {formattedDate}
                      </td>
                      <td className="p-3 whitespace-nowrap text-white font-sans font-bold">
                        {log.tenantName}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {log.changeType === 'Plano' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-950/40 border border-purple-900/50 text-purple-400 uppercase">
                            💳 Plano
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-950/40 border border-amber-900/50 text-amber-400 uppercase">
                            ⚙️ Status
                          </span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-gray-500 font-mono text-[11px] line-through decoration-gray-700">{log.oldValue}</span>
                          <span className="text-purple-405 text-purple-500">→</span>
                          <span className={`px-2 py-0.5 rounded text-[10.5px] ${
                            log.newValue === 'Premium' 
                              ? 'bg-yellow-950/20 border border-yellow-900 text-yellow-500'
                              : log.newValue === 'Profissional'
                                ? 'bg-blue-950/20 border border-blue-900 text-blue-400'
                                : log.newValue === 'Básico'
                                  ? 'bg-slate-900 border border-slate-800 text-slate-400'
                                  : log.newValue === 'Ativo'
                                    ? 'bg-green-950/25 border border-green-900/50 text-green-400'
                                    : 'bg-red-950/25 border border-red-900/50 text-red-405 text-red-500'
                          }`}>
                            {log.newValue}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isAdminOwner 
                            ? 'bg-purple-950/20 border border-purple-900/40 text-purple-400 font-sans' 
                            : 'bg-slate-900 border border-slate-800 text-slate-400 font-sans'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isAdminOwner ? 'bg-purple-500 animate-pulse' : 'bg-gray-500'}`}></span>
                          {log.adminEmail}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
          <span>Mostrando {filteredAuditLogs.length} registros</span>
          <span className="border border-purple-900/40 bg-purple-950/10 px-2 py-0.5 rounded text-purple-400 uppercase tracking-widest font-extrabold animate-pulse">● Conexão com Firebase segura</span>
        </div>
      </div>

    </div>
  );
};
