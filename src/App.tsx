import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { PDVView } from './components/PDVView';
import { EstoqueView } from './components/EstoqueView';
import { ServicosView } from './components/ServicosView';
import { OSView } from './components/OSView';
import { CRMView } from './components/CRMView';
import { FinanceiroView } from './components/FinanceiroView';
import { RelatoriosView } from './components/RelatoriosView';
import { ConfigView } from './components/ConfigView';
import { SuperAdminView } from './components/SuperAdminView';
import { ManualView } from './components/ManualView';
import { CustomerPortal } from './components/CustomerPortal';
import EngenhariaView from './components/EngenhariaView';

import { 
  Wrench, 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Sparkles, 
  MessageSquare, 
  Send, 
  X, 
  Lock, 
  Cpu, 
  UserPlus, 
  Menu,
  ChevronRight,
  ChevronLeft,
  Wifi,
  ShieldAlert,
  WifiOff,
  RefreshCw,
  Hammer,
  Mail,
  User,
  BookOpen,
  Bell,
  AlertCircle,
  Keyboard,
  Command,
  Search,
  Car
} from 'lucide-react';

function AppContent() {
  const { 
    user, 
    company, 
    setUser,
    setCompany,
    loginWithGoogle, 
    loginWithEmail,
    registerWithEmail,
    loginDemo, 
    logout, 
    loading, 
    sendChatMessage, 
    aiLoading,
    loginError,
    isOnline,
    pendingActionsCount,
    syncPendingActions,
    syncing,
    ordensServico,
    produtos
  } = useApp();

  const [activeRoute, setActiveRoute] = useState<'landing' | 'dashboard' | 'pdv' | 'stock' | 'services' | 'os' | 'crm' | 'finance' | 'reports' | 'settings' | 'superadmin' | 'manual' | 'engineering'>('landing');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Calculate critical products count (stock <= minStock) for the warning badge
  const criticalProductsCount = (produtos || []).filter(
    p => p.quantity <= (p.minStock ?? 0)
  ).length;

  // States for header global/plate quick-search
  const [globalSearchPlate, setGlobalSearchPlate] = useState('');
  const [headerSearchPlate, setHeaderSearchPlate] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Customer tracking portal state with URL params observer
  const [customerPortalOpen, setCustomerPortalOpen] = useState(false);
  const [portalCpf, setPortalCpf] = useState('');
  const [portalOsId, setPortalOsId] = useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cpfParam = params.get('cpf');
    const osIdParam = params.get('osId');
    const oficinaIdParam = params.get('oficinaId');
    if (cpfParam || osIdParam || oficinaIdParam) {
      setPortalCpf(cpfParam || '');
      setPortalOsId(osIdParam || '');
      setCustomerPortalOpen(true);
    }
  }, []);

  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in text inputs or textareas to prevent interfering
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true' ||
        activeEl.tagName === 'SELECT'
      )) {
        if (e.key === 'Escape') {
          (activeEl as HTMLElement).blur();
        }
        return;
      }

      // Block normal action if not logged in
      if (!user) return;

      const isCtrl = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;

      // 1. Nova O.S.: Ctrl + N or Alt + N
      if ((isCtrl && e.key.toLowerCase() === 'n') || (isAlt && e.key.toLowerCase() === 'n')) {
        e.preventDefault();
        setActiveRoute('os');
        setMobileSidebarOpen(false);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('open-new-os'));
        }, 80);
        return;
      }

      // 2. Estoque (Stock): Ctrl + S or Alt + S or Alt + E
      if ((isCtrl && e.key.toLowerCase() === 's') || (isAlt && e.key.toLowerCase() === 's') || (isAlt && e.key.toLowerCase() === 'e')) {
        e.preventDefault();
        setActiveRoute('stock');
        setMobileSidebarOpen(false);
        return;
      }

      // 3. Dashboard: Ctrl + D or Alt + D
      if ((isCtrl && e.key.toLowerCase() === 'd') || (isAlt && e.key.toLowerCase() === 'd')) {
        e.preventDefault();
        setActiveRoute('dashboard');
        setMobileSidebarOpen(false);
        return;
      }

      // 4. PDV: Ctrl + P or Alt + P
      if ((isCtrl && e.key.toLowerCase() === 'p') || (isAlt && e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        setActiveRoute('pdv');
        setMobileSidebarOpen(false);
        return;
      }

      // 5. Financeiro: Ctrl + F or Alt + F
      if ((isCtrl && e.key.toLowerCase() === 'f') || (isAlt && e.key.toLowerCase() === 'f')) {
        e.preventDefault();
        setActiveRoute('finance');
        setMobileSidebarOpen(false);
        return;
      }

      // 6. CRM (Clientes): Ctrl + C or Alt + C
      if ((isCtrl && e.key.toLowerCase() === 'c') || (isAlt && e.key.toLowerCase() === 'c')) {
        e.preventDefault();
        setActiveRoute('crm');
        setMobileSidebarOpen(false);
        return;
      }

      // 7. Configurações: Ctrl + G or Alt + G
      if ((isCtrl && e.key.toLowerCase() === 'g') || (isAlt && e.key.toLowerCase() === 'g')) {
        e.preventDefault();
        setActiveRoute('settings');
        setMobileSidebarOpen(false);
        return;
      }

      // 8. Cheat Sheet / Quick Help Modal toggle: Alt + K or Ctrl + M or just ?
      if ((isAlt && e.key.toLowerCase() === 'k') || (isCtrl && e.key.toLowerCase() === 'm') || e.key === '?') {
        e.preventDefault();
        setIsShortcutModalOpen(prev => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [user]);
  
  // Email & Password Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authFeedback, setAuthFeedback] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Olá! Sou o Assistente Técnico Integrado AutoTech. Posso tirar dúvidas sobre torque de cabeçote, diagnósticos OBD-II, compatibilidade de peças e até sugerir mensagens de WhatsApp de cobrança. Como posso te auxiliar?' }
  ]);

  // Handle active content renders
  const renderActiveView = () => {
    switch (activeRoute) {
      case 'dashboard': return <DashboardView />;
      case 'pdv': return <PDVView />;
      case 'stock': return <EstoqueView />;
      case 'services': return <ServicosView />;
      case 'os': return <OSView initialSearchPlate={globalSearchPlate} onClearInitialSearch={() => setGlobalSearchPlate('')} />;
      case 'crm': return <CRMView />;
      case 'finance': return <FinanceiroView />;
      case 'reports': return <RelatoriosView />;
      case 'manual': return <ManualView />;
      case 'engineering': return <EngenhariaView />;
      case 'settings': return <ConfigView />;
      case 'superadmin': return <SuperAdminView />;
      default: return <DashboardView />;
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user' as const, text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Fetch from AI endpoint in context
    const response = await sendChatMessage([...chatMessages, userMsg]);
    setChatMessages(prev => [...prev, { role: 'assistant', text: response }]);
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthFeedback("Por favor, preencha todos os campos.");
      return;
    }
    if (authMode === 'register' && !userName) {
      setAuthFeedback("Por favor, preencha seu nome.");
      return;
    }
    setAuthSubmitting(true);
    setAuthFeedback(null);
    try {
      if (authMode === 'login') {
        await loginWithEmail(email, password);
        setActiveRoute('dashboard');
      } else {
        await registerWithEmail(email, password, userName);
        setActiveRoute('dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setAuthFeedback(err.message || "Erro de credenciais ou rede.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  // 0. Customer Portal override (direct URL param tracking or customer status check)
  if (customerPortalOpen) {
    return (
      <CustomerPortal 
        initialCpf={portalCpf} 
        initialOsId={portalOsId} 
        onClose={() => {
          setCustomerPortalOpen(false);
          // Remove query params from browser address bar smoothly
          const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.pushState({ path: cleanUrl }, '', cleanUrl);
        }} 
      />
    );
  }

  // 1. Loading Overlay state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060913] text-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-red-650 bg-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse mb-6">
          <Wrench className="w-8 h-8 text-white text-white rotate-45" />
        </div>
        <span className="font-mono text-xs tracking-widest text-slate-400">CARREGANDO SISTEMA OFICINA PDV...</span>
      </div>
    );
  }

  // 2. Landing Page render state
  if (activeRoute === 'landing' && !user) {
    return (
      <LandingPage 
        onEnterApp={() => setActiveRoute('dashboard')} 
        onEnterDemo={async () => {
          await loginDemo();
          setActiveRoute('dashboard');
        }} 
      />
    );
  }

  // 3. Auth login lock screen state
  if (!user) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col justify-center items-center p-4 bg-radial-[circle_at_bottom_left] from-red-950/10 via-[#060913]">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-gray-800 shadow-2xl relative text-left bg-[#0c1223]/90 backdrop-blur-md">
          
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-650 bg-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.4)]">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white">AUTO<span className="text-red-500">TECH</span></span>
              <span className="block text-[8px] text-gray-500 font-mono leading-none tracking-widest">ERP COMPLETO</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex bg-[#050812] p-1 rounded-lg border border-gray-900 mb-2">
              <button
                type="button"
                id="btn-switch-login"
                onClick={() => {
                  setAuthMode('login');
                  setAuthFeedback(null);
                }}
                className={`flex-1 py-1.5 text-center text-xs font-mono font-bold uppercase rounded-md transition-all cursor-pointer ${authMode === 'login' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white bg-transparent'}`}
              >
                Fazer Login
              </button>
              <button
                type="button"
                id="btn-switch-register"
                onClick={() => {
                  setAuthMode('register');
                  setAuthFeedback(null);
                }}
                className={`flex-1 py-1.5 text-center text-xs font-mono font-bold uppercase rounded-md transition-all cursor-pointer ${authMode === 'register' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white bg-transparent'}`}
              >
                Criar Conta
              </button>
            </div>

            <div className="text-center mb-1">
              <h2 className="text-md font-bold text-white font-sans">
                {authMode === 'login' ? 'Identifique-se para acessar' : 'Crie sua nova conta de oficina'}
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {authMode === 'login' 
                  ? 'Acesse com suas credenciais ou integre com Google.' 
                  : 'Preencha seus dados para habilitar sua sandbox isolada.'}
              </p>
            </div>

            <form onSubmit={handleEmailAuthSubmit} className="flex flex-col gap-3">
              {authMode === 'register' && (
                <div className="flex flex-col gap-1">
                  <label htmlFor="reg-name" className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wider">Seu Nome</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      id="reg-name"
                      type="text"
                      placeholder="Ex: Clécio Santos"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-[#050810] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label htmlFor="auth-email" className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wider">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="email@mecanica.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#050810] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="auth-pass" className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wider">Sua Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
                  <input
                    id="auth-pass"
                    type="password"
                    placeholder="Sua senha secreta"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#050810] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {(authFeedback || loginError) && (
                <div className="text-[10px] text-red-400 font-mono bg-red-950/25 p-2.5 rounded-lg border border-red-900/35 leading-tight">
                  ⚠️ {authFeedback || loginError}
                </div>
              )}

              <button
                type="submit"
                id="btn-auth-submit"
                disabled={authSubmitting}
                className="w-full mt-1.5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs tracking-widest font-mono cursor-pointer shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-2"
              >
                {authSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : authMode === 'login' ? (
                  '🔐 ENTRAR COM EMAIL & SENHA'
                ) : (
                  '🚀 CADASTRAR & INICIALIZAR PATIO'
                )}
              </button>
            </form>

            <div className="relative my-1">
              <span className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-850"></span></span>
              <span className="relative bg-[#0c1223] px-3 text-[9px] text-gray-500 font-mono uppercase block text-center">Conexão Rapida & Opções</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                id="btn-login-google"
                onClick={loginWithGoogle}
                className="py-2.5 bg-[#050810] hover:bg-slate-900 text-white font-medium rounded-xl text-[10px] flex items-center justify-center gap-1.5 border border-gray-800 shadow-sm cursor-pointer transition-colors"
              >
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                Google Login
              </button>

              <button 
                type="button"
                id="btn-login-demo"
                onClick={async () => {
                  await loginDemo();
                  setActiveRoute('dashboard');
                }}
                className="py-2.5 bg-[#050810] hover:bg-slate-900 text-cyan-400 hover:text-cyan-300 font-medium rounded-xl text-[10px] flex items-center justify-center gap-1.5 border border-gray-800 cursor-pointer transition-colors"
              >
                ⚡ Modo Demo
              </button>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // 4. MAIN WORKSPACE AND LAYOUT DRAWER ASSEMBLAGE
  return (
    <div className="min-h-screen bg-[#060913] text-gray-100 flex flex-col font-sans">
      
      {/* IMPERSONATION BANNER CARD */}
      {localStorage.getItem('original_saas_admin_user') && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 border-b border-purple-650 px-4 py-2.5 text-center flex flex-col sm:flex-row items-center justify-between gap-2.5 z-50 text-[11px] font-mono shadow-md shadow-purple-950/20">
          <div className="flex items-center gap-2 text-purple-200">
            <ShieldAlert className="w-4 h-4 text-purple-300 animate-pulse shrink-0" />
            <span>
              🔧 <strong>MODO SUPORTE DE ADMINISTRAÇÃO SAAS ATIVO:</strong> Simulando acesso à empresa <strong>{company.name}</strong> (CPF/CNPJ: {company.cnpj}) como o funcionário <strong>{user?.name}</strong>.
            </span>
          </div>
          <button
            onClick={() => {
              const origUser = localStorage.getItem('original_saas_admin_user');
              const origComp = localStorage.getItem('original_saas_admin_company');
              if (origUser && origComp) {
                setUser(JSON.parse(origUser));
                setCompany(JSON.parse(origComp));
                localStorage.removeItem('original_saas_admin_user');
                localStorage.removeItem('original_saas_admin_company');
                setActiveRoute('superadmin');
              }
            }}
            className="px-3 py-1 bg-red-650 hover:bg-red-700 bg-red-650 rounded text-[10px] text-white tracking-wider cursor-pointer border-none transition-all active:scale-95 shrink-0"
          >
            🔒 ENCERRAR SIMULAÇÃO DE ACESSO
          </button>
        </div>
      )}

      {/* GLOBAL ADMINISTRATIVE TOP NAV HEADER */}
      <header className="bg-[#080d1a] border-b border-gray-850 px-4 py-3 sticky top-0 z-40 flex justify-between items-center">
        
        {/* Left section logo */}
        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden text-white p-1 rounded hover:bg-white/5"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-2">
            {company.logoUrl ? (
              <img 
                src={company.logoUrl} 
                alt="Logo Empresa" 
                className="w-8 h-8 rounded-lg object-cover bg-slate-950 border border-gray-800" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-red-650 bg-red-600 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white rotate-45" />
              </div>
            )}
            <div>
              <span className="font-display font-bold text-sm tracking-tight text-white">
                SISTEMA OFICINA <span className="text-red-500">PDV</span>
              </span>
              <span className="block text-[8px] text-gray-500 font-mono tracking-widest leading-none">SOFTWARE DE GESTÃO</span>
            </div>
          </div>
          
          <span className="hidden sm:inline-block ml-4 text-[10px] font-mono bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-400">
            🏢 {company.name} / White-Label Ativo
          </span>
        </div>

        {/* Global Plate Search Bar */}
        <div className="relative flex-1 max-w-[120px] xs:max-w-[160px] sm:max-w-xs md:max-w-md mx-2 font-mono text-xs z-50">
          <div className="relative">
            <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Placa ou veículo... (BRA2E19)"
              value={headerSearchPlate}
              onChange={(e) => {
                setHeaderSearchPlate(e.target.value);
                setIsSearchFocused(true);
              }}
              className="w-full bg-[#0a0f1d] border border-gray-800 rounded-full py-1.5 px-8 text-[11px] text-white placeholder-slate-505 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-all font-mono tracking-wider"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
            />
            {headerSearchPlate && (
              <button
                type="button"
                onClick={() => setHeaderSearchPlate('')}
                className="absolute right-2.5 top-1.5 p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && headerSearchPlate && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0e1628] border border-gray-850 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-60 overflow-y-auto z-55">
              {(() => {
                const query = headerSearchPlate.toLowerCase();
                const matches = ordensServico ? ordensServico.filter(os => 
                  os.plate.toLowerCase().includes(query) || 
                  (os.clienteName && os.clienteName.toLowerCase().includes(query)) ||
                  (os.veiculoInfo && os.veiculoInfo.toLowerCase().includes(query))
                ) : [];

                if (matches.length === 0) {
                  return (
                    <div className="p-4 text-center text-gray-500 text-[10px] font-mono uppercase">
                      Nenhum veículo com "{headerSearchPlate.toUpperCase()}"
                    </div>
                  );
                }

                return matches.map((os) => {
                  const statusColors: Record<string, string> = {
                    'Aberta': 'border-blue-900 bg-blue-950/40 text-blue-400',
                    'Em análise': 'border-yellow-905 bg-yellow-950/40 text-yellow-500',
                    'Aguardando peça': 'border-orange-950 bg-orange-950/40 text-orange-400',
                    'Em execução': 'border-red-955 bg-red-950/20 text-red-500',
                    'Finalizada': 'border-green-900 bg-green-950/20 text-green-400',
                    'Entregue': 'border-emerald-600 bg-emerald-950/20 text-emerald-400'
                  };
                  const colorClass = statusColors[os.status] || 'border-slate-850 text-slate-400 bg-slate-900/40';

                  return (
                    <button
                      key={os.id}
                      type="button"
                      onMouseDown={() => {
                        setGlobalSearchPlate(os.plate);
                        setActiveRoute('os');
                        setHeaderSearchPlate('');
                      }}
                      className="w-full p-2.5 hover:bg-slate-900/60 transition-colors text-left border-b border-gray-850/50 flex justify-between items-center bg-transparent border-0 cursor-pointer"
                    >
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Brazilian formatted license plate */}
                          <span className="inline-flex items-center gap-1 border border-blue-500 bg-[#0f172a] text-blue-400 font-bold px-1.5 py-0.5 rounded text-[8.5px] leading-tight font-mono tracking-wider shrink-0">
                            <span className="w-1 h-1 rounded-full bg-blue-500" />
                            {os.plate.toUpperCase()}
                          </span>
                          <span className="text-white font-bold text-[10px] truncate max-w-[110px]">
                            {os.clienteName || 'Consumidor Final'}
                          </span>
                        </div>
                        <span className="text-[9px] text-gray-400 font-sans truncate block">
                          🚗 {os.veiculoInfo || 'Veículo não informado'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                        <span className={`text-[8px] px-1 py-0.5 rounded border ${colorClass} font-mono uppercase font-black leading-none`}>
                          {os.status}
                        </span>
                        <span className="text-[7.5px] text-gray-500 font-mono">
                          #{os.id.substring(0, 8)}
                        </span>
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* Right header shortcuts */}
        <div className="flex items-center gap-3">
          
          {/* Connection / Sync Indicator */}
          {!isOnline ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/40 text-amber-500 border border-amber-900/40 text-[10px] font-bold font-mono">
              <WifiOff className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> OFFLINE {pendingActionsCount > 0 && `(${pendingActionsCount})`}
            </div>
          ) : pendingActionsCount > 0 ? (
            <button 
              onClick={() => syncPendingActions()}
              disabled={syncing}
              title="Clique para forçar sincronização"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-955 bg-[#091b35] hover:bg-blue-900 border border-blue-900/60 text-[10px] font-bold font-mono text-blue-400 cursor-pointer animate-bounce shadow-inner transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'SINCRONIZANDO...' : `SINCRONIZAR (${pendingActionsCount})`}
            </button>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-952 bg-green-950/20 text-green-400 border border-green-900/30 text-[10px] font-bold font-mono">
              <Wifi className="w-3.5 h-3.5 text-green-500" /> ONLINE
            </div>
          )}

          {/* Notification Bell with 'Aguardando peça' trigger */}
          {(() => {
            const waitingPartsOS = ordensServico ? ordensServico.filter(os => os.status === 'Aguardando peça') : [];
            return (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  title="Alertas de Peças em Falta"
                  className={`p-2 rounded-full relative transition-all cursor-pointer outline-none ${
                    isNotificationOpen 
                      ? 'bg-orange-950/35 text-orange-400 border border-orange-900/40' 
                      : 'bg-slate-900 hover:bg-slate-800 text-gray-400 hover:text-white border border-gray-850'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {waitingPartsOS.length > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                      <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-orange-600 text-[8px] font-mono font-bold text-white flex items-center justify-center px-1 rounded-full border border-gray-950 shadow-md">
                        {waitingPartsOS.length}
                      </span>
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationOpen && (
                    <>
                      {/* Invisible backdrop to close dropdown */}
                      <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-[#0c1223] border border-gray-800 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] z-50 p-4 flex flex-col gap-3 text-left overflow-hidden"
                      >
                        {/* Header of dropdown */}
                        <div className="flex justify-between items-center border-b border-gray-850 pb-2.5">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                              Peças em Falta ({waitingPartsOS.length})
                            </span>
                          </div>
                          <span className="text-[9px] bg-orange-950/40 text-orange-400 border border-orange-900/30 rounded px-1.5 py-0.5 font-mono font-medium">
                            Aguardando Peça
                          </span>
                        </div>

                        {/* List container */}
                        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                          {waitingPartsOS.length > 0 ? (
                            waitingPartsOS.map((os) => (
                              <div 
                                key={os.id}
                                className="p-3 bg-gray-950/40 rounded-xl border border-gray-900 hover:border-orange-900/30 transition-all flex flex-col gap-2 relative group"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-white font-mono">{os.id}</span>
                                    <span className="text-[10px] text-gray-400 mt-0.5 font-sans">
                                      👤 {os.clienteName || "Sem cliente"}
                                    </span>
                                  </div>
                                  <span className="text-[8px] font-mono text-gray-500">
                                    {new Date(os.createdAt).toLocaleDateString()}
                                  </span>
                                </div>

                                <div className="p-2 bg-[#050912]/80 border border-gray-900 rounded-lg text-[10px] text-gray-400 font-mono">
                                  <div className="text-[9px] text-gray-500 uppercase font-extrabold pb-0.5">Veículo:</div>
                                  <div className="text-white truncate">{os.veiculoInfo || os.plate || "N/A"}</div>
                                  <div className="text-[9px] text-gray-500 uppercase font-extrabold pt-1.5 pb-0.5">Diagnóstico Técnico:</div>
                                  <div className="text-slate-300 truncate">{os.diagnosis || os.problem || "Falta especificação de peça"}</div>
                                </div>

                                <div className="flex items-center gap-1.5 mt-1">
                                  <button
                                    onClick={() => {
                                      setActiveRoute('os');
                                      setIsNotificationOpen(false);
                                    }}
                                    className="flex-1 py-1.5 px-3 bg-orange-950/20 hover:bg-orange-950/40 border border-orange-900/30 text-[9px] font-mono font-bold text-orange-400 hover:text-white rounded-lg text-center transition-all cursor-pointer"
                                  >
                                    📞 Entrar em contato / Follow-Up Fornecedor
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 flex flex-col items-center gap-2 text-gray-500 font-sans">
                              <span className="p-2.5 rounded-full bg-green-950/20 text-green-500 border border-green-900/20">✔️</span>
                              <span className="text-xs">Nenhuma O.S. pendente de peças!</span>
                              <span className="text-[9px] font-mono text-gray-600">Oficina fluindo a 100% no pátio</span>
                            </div>
                          )}
                        </div>

                        {/* Footer message explaining */}
                        <div className="text-[9px] text-gray-500 font-mono border-t border-gray-850 pt-2 flex items-center gap-1.5 leading-tight">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                          <span>Monitore faturamento, compre reposições a tempo e reduza dias ociosos no elevador!</span>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            );
          })()}

          {/* Keyboard Shortcuts Trigger Button */}
          <button 
            onClick={() => setIsShortcutModalOpen(true)}
            title="Atalhos do Teclado (Alt+K ou ?)"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-900/60 text-[10px] font-bold font-mono text-emerald-400 cursor-pointer shadow-inner transition-all hover:scale-[102%]"
          >
            <Keyboard className="w-3.5 h-3.5 text-emerald-500" /> ATALHOS
          </button>

          {/* AI CoPilot Toggle Button */}
          <button 
            onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-[10px] font-bold font-mono text-red-100 animate-pulse cursor-pointer shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-500" /> ✨ ASSISTENTE MECÂNICO COPILOT
          </button>

          {/* User profile identifier */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[11px] font-semibold text-white leading-none">{user.name}</span>
              <span className="text-[8px] text-gray-500 font-mono tracking-wide">{user.role}</span>
            </div>
            
            <button 
              onClick={logout}
              title="Encerrar sessão"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </header>

      {/* CONNECTION STATUS & SYNC ALERTS */}
      {!isOnline && (
        <div className="bg-amber-950/45 border-b border-amber-900/30 text-amber-400 text-xs py-2 px-6 flex items-center justify-between font-mono animate-pulse z-40 relative">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>⚙️ Modo de Operação Offline Ativo:</strong> Conexão perdida. Suas ações estão salvaguardadas de forma segura em armazenamento local e serão sincronizadas logo que a internet retornar.
            </span>
          </div>
          {pendingActionsCount > 0 && (
            <span className="bg-amber-950/90 text-amber-400 border border-amber-800/60 rounded px-2.5 py-0.5 text-[10px] ml-4 font-bold shrink-0">
              {pendingActionsCount} ALTERAÇÃO(ÕES) EM CACHE LOCAL
            </span>
          )}
        </div>
      )}

      {isOnline && pendingActionsCount > 0 && (
        <div className="bg-[#091b35] border-b border-blue-900 text-blue-300 text-xs py-2 px-6 flex items-center justify-between font-mono z-40 relative">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
            <span>
              <strong>📶 Rede Restabelecida:</strong> Você tem <strong>{pendingActionsCount} operações pendentes</strong> em cache local para envio.
            </span>
          </div>
          <button 
            onClick={() => syncPendingActions()}
            disabled={syncing}
            className="bg-blue-600 hover:bg-blue-700 active:scale-[97%] text-white font-bold rounded-lg px-3 py-1 text-[10px] uppercase cursor-pointer shrink-0 transition-transform ml-4"
          >
            {syncing ? 'Sincronizando...' : 'Enviar para o Firestore'}
          </button>
        </div>
      )}

      {/* CORE FRAMEWORK WRAPPERS CONTAINER */}
      <div className="flex-grow flex relative">
        
        {/* RESPONSIVE LEFT SIDEBAR MENU PANEL */}
        <aside className={`
          fixed md:sticky top-[57px] h-[calc(100vh-57px)] z-30
          w-60 bg-[#080d19] border-r border-gray-850 flex flex-col justify-between p-4 shrink-0
          transition-transform duration-300 md:translate-x-0
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          
          <div className="flex flex-col gap-1.5 font-mono text-xs">
            <span className="text-[10px] text-slate-600 block pl-3 py-1 font-bold">MÓDULOS DE GESTÃO</span>

            <button 
              onClick={() => { setActiveRoute('dashboard'); setMobileSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left ${activeRoute === 'dashboard' ? 'bg-red-950/20 text-red-500 border border-red-900/40 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" /> Dashboard Geral
            </button>

            <button 
              onClick={() => { setActiveRoute('pdv'); setMobileSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left ${activeRoute === 'pdv' ? 'bg-red-950/20 text-red-500 border border-red-900/40 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" /> PDV Loja & Oficina
            </button>

            <button 
              onClick={() => { setActiveRoute('stock'); setMobileSidebarOpen(false); }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left ${activeRoute === 'stock' ? 'bg-red-950/20 text-red-500 border border-red-900/40 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 shrink-0" />
                <span>Estoque de Peças</span>
              </div>
              {criticalProductsCount > 0 && (
                <span className="bg-red-600 text-white font-mono font-extrabold text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0 animate-pulse border border-red-500/30 shadow-md shadow-red-950/40" title={`${criticalProductsCount} itens em ponto crítico de estoque!`}>
                  <span className="w-1 h-1 rounded-full bg-white block"></span>
                  {criticalProductsCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => { setActiveRoute('services'); setMobileSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left ${activeRoute === 'services' ? 'bg-red-950/20 text-red-500 border border-red-900/40 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Hammer className="w-4 h-4 shrink-0" /> Catálogo de Serviços
            </button>

            <button 
              onClick={() => { setActiveRoute('os'); setMobileSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left ${activeRoute === 'os' ? 'bg-red-950/20 text-red-500 border border-red-900/40 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Wrench className="w-4 h-4 shrink-0" /> Ordens de Serviço
            </button>

            <button 
              onClick={() => { setActiveRoute('crm'); setMobileSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left ${activeRoute === 'crm' ? 'bg-red-950/20 text-red-500 border border-red-900/40 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Users className="w-4 h-4 shrink-0" /> CRM Clientes & Autos
            </button>

            <button 
              onClick={() => { setActiveRoute('finance'); setMobileSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left ${activeRoute === 'finance' ? 'bg-red-950/20 text-red-500 border border-red-900/40 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <DollarSign className="w-4 h-4 shrink-0" /> Fluxo Financeiro DRE
            </button>

            <button 
              onClick={() => { setActiveRoute('reports'); setMobileSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left ${activeRoute === 'reports' ? 'bg-red-950/20 text-red-500 border border-red-900/40 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" /> Relatórios / PDFs
            </button>

            <button 
              onClick={() => { setActiveRoute('engineering'); setMobileSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left ${activeRoute === 'engineering' ? 'bg-red-950/20 text-red-500 border border-red-900/40 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Cpu className="w-4 h-4 shrink-0 text-red-400" /> Engenharia Assistida IA
            </button>

            <button 
              onClick={() => { setActiveRoute('manual'); setMobileSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left ${activeRoute === 'manual' ? 'bg-red-950/20 text-red-500 border border-red-900/40 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <BookOpen className="w-4 h-4 shrink-0" /> Manual do Sistema (eBook)
            </button>

            <button 
              onClick={() => { setActiveRoute('settings'); setMobileSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left ${activeRoute === 'settings' ? 'bg-red-950/20 text-red-500 border border-red-900/40 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Settings className="w-4 h-4 shrink-0" /> Configurações Gerais
            </button>

            {user?.email === 'cleciotecnologia@gmail.com' && (
              <>
                <div className="border-t border-gray-850 my-2 pt-2">
                  <span className="text-[10px] text-purple-400 block pl-3 pb-1 font-bold tracking-wider font-mono">SAAS ADMIN</span>
                  <button 
                    onClick={() => { setActiveRoute('superadmin'); setMobileSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left border ${activeRoute === 'superadmin' ? 'bg-purple-950/20 text-purple-450 border-purple-900/50 font-bold text-purple-400' : 'text-purple-300 hover:text-white border-transparent bg-purple-950/10 hover:bg-purple-950/20'}`}
                  >
                    <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 animate-pulse" /> SaaS SuperAdmin
                  </button>
                </div>
              </>
            )}

          </div>

          {/* Sidebar Footer info */}
          <div className="border-t border-gray-850 pt-3 text-[10px] font-mono text-slate-500 text-left ">
            <span>Licença Sistema Oficina PDV</span>
            <span className="block mt-1">Status: ✦ Versão Premium ✦</span>
          </div>

        </aside>

        {/* ACTIVE MODULE CONTAINER SHEET */}
        <main className="flex-grow p-4 lg:p-8 overflow-x-hidden min-h-[calc(100vh-57px)] relative z-10 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRoute}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="flex-grow flex flex-col w-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* SLIDING GOOGLE GEMINI CHAT COPILOT DRAWER (RIGHT PANEL) */}
        {isAiDrawerOpen && (
          <div className="fixed sm:sticky right-0 top-[57px] h-[calc(100vh-57px)] w-80 sm:w-96 bg-[#070c17] border-l border-gray-850 z-50 flex flex-col shadow-2xl">
            
            <div className="p-4 bg-[#0a101f] border-b border-gray-850 flex items-center justify-between text-left">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-400 animate-spin" />
                <div>
                  <span className="font-bold text-white text-xs block font-mono">SISTEMA OFICINA CO-PILOT</span>
                  <span className="text-[9px] text-red-400 font-mono block">Inteligência Artificial Gemini Conectada</span>
                </div>
              </div>
              
              <button 
                onClick={() => setIsAiDrawerOpen(false)}
                className="p-1.5 rounded hover:bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4 text-xs">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex flex-col gap-1 text-left ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[8px] font-mono text-gray-500 uppercase">
                    {msg.role === 'user' ? 'Mecânico (Você)' : 'Autotech AI'}
                  </span>
                  
                  <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-red-650 bg-red-600 text-white rounded-br-none' 
                      : 'bg-slate-950/60 border border-gray-900 text-slate-200 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex items-center gap-2 text-slate-450 text-gray-500 italic mt-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  <span>O CoPilot está raciocinando...</span>
                </div>
              )}
            </div>

            {/* Chat bottom trigger input */}
            <form onSubmit={handleSendChatMessage} className="p-3 bg-[#0a101f] border-t border-gray-850 flex gap-2">
              <input 
                type="text" 
                placeholder="Pergunte torque cabeçote Civic, diagnostico..."
                className="flex-grow bg-[#050810] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-red-500"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button 
                type="submit"
                className="p-2.5 rounded-xl bg-red-650 bg-red-600 text-white hover:bg-red-700 flex items-center justify-center shrink-0 cursor-pointer shadow"
              >
                <Send className="w-4 h-4 fill-white text-white" />
              </button>
            </form>

          </div>
        )}

      </div>

      {/* GLOBAL KEYBOARD SHORTCUTS CHEAT SHEET MODAL */}
      <AnimatePresence>
        {isShortcutModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c1223] border border-gray-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-left"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-850 flex justify-between items-center bg-[#080d1a]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 rounded-xl">
                    <Keyboard className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-sm sm:text-base">Atalhos Globais do Teclado</h3>
                    <span className="text-[10px] text-gray-500 font-mono block">Navegação rápida sem tocar no mouse</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShortcutModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Shortcuts Grid List */}
              <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto font-mono text-xs text-gray-300">
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-gray-800 transition-all">
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                      <span className="text-gray-200">Dashboard de Indicadores</span>
                    </div>
                    <div className="flex gap-1.5">
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold text-white shadow-sm">Ctrl</kbd>
                      <span className="text-gray-500 self-center">+</span>
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold text-white shadow-sm">D</kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-gray-800 transition-all">
                    <div className="flex items-center gap-2.5">
                      <Wrench className="w-4 h-4 text-red-500" />
                      <div>
                        <span className="text-gray-200 block">Abrir Nova OS / Ordem</span>
                        <span className="text-[9px] text-gray-500 block">Monta o formulário de cadastro direto</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold text-white shadow-sm">Ctrl</kbd>
                      <span className="text-gray-500 self-center">+</span>
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold text-white shadow-sm">N</kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-gray-800 transition-all">
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-amber-500" />
                      <span className="text-gray-200">Estoque de Alerta / Peças</span>
                    </div>
                    <div className="flex gap-1.5">
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold text-white shadow-sm">Ctrl</kbd>
                      <span className="text-gray-500 self-center">+</span>
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold text-white shadow-sm">S</kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-gray-800 transition-all">
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                      <span className="text-gray-200">PDV Loja & Caixa</span>
                    </div>
                    <div className="flex gap-1.5">
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold text-white shadow-sm">Ctrl</kbd>
                      <span className="text-gray-500 self-center">+</span>
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold text-white shadow-sm">P</kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-gray-800 transition-all">
                    <div className="flex items-center gap-2.5">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-gray-200">Fluxo Financeiro DRE</span>
                    </div>
                    <div className="flex gap-1.5">
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold text-white shadow-sm">Ctrl</kbd>
                      <span className="text-gray-500 self-center">+</span>
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold text-white shadow-sm">F</kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-gray-800 transition-all">
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-200">CRM Clientes & Autos</span>
                    </div>
                    <div className="flex gap-1.5">
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold text-white shadow-sm">Ctrl</kbd>
                      <span className="text-gray-500 self-center">+</span>
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold text-white shadow-sm">C</kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-gray-800 transition-all">
                    <div className="flex items-center gap-2.5">
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span className="text-gray-200">Painel de Configurações</span>
                    </div>
                    <div className="flex gap-1.5">
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold text-white shadow-sm">Ctrl</kbd>
                      <span className="text-gray-500 self-center">+</span>
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold text-white shadow-sm">G</kbd>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-gray-800 transition-all">
                    <div className="flex items-center gap-2.5">
                      <Command className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-gray-200">Alternar Guia de Atalho</span>
                    </div>
                    <div className="flex gap-1.5">
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold text-white shadow-sm">Alt</kbd>
                      <span className="text-gray-500 self-center">+</span>
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-750 rounded text-[10px] font-bold text-white shadow-sm">K</kbd>
                    </div>
                  </div>
                </div>
                
                <div className="text-[10px] text-gray-500 leading-normal border-t border-gray-850 pt-3 flex flex-col gap-1 select-none font-sans mt-2">
                  <span>💡 <strong>Dica dos Desenvolvedores:</strong> Segurar <kbd className="px-1 py-0.5 border border-gray-800 bg-gray-950 font-mono font-bold rounded text-[9px]">Alt</kbd> em vez de <kbd className="px-1 py-0.5 border border-gray-800 bg-gray-950 font-mono font-bold rounded text-[9px]">Ctrl</kbd> funciona da mesma forma para todos os comandos! </span>
                  <span>💡 Pressione <kbd className="px-1 py-0.5 border border-gray-800 bg-gray-950 font-mono font-bold rounded text-[9px]">Esc</kbd> em qualquer momento para sair de campos de digitação.</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
