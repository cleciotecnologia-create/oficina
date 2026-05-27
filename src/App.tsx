import React, { useState } from 'react';
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
  Hammer
} from 'lucide-react';

function AppContent() {
  const { 
    user, 
    company, 
    setUser,
    setCompany,
    loginWithGoogle, 
    loginDemo, 
    logout, 
    loading, 
    sendChatMessage, 
    aiLoading,
    loginError,
    isOnline,
    pendingActionsCount,
    syncPendingActions,
    syncing
  } = useApp();

  const [activeRoute, setActiveRoute] = useState<'landing' | 'dashboard' | 'pdv' | 'stock' | 'services' | 'os' | 'crm' | 'finance' | 'reports' | 'settings' | 'superadmin'>('landing');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  
  // AI Co-Pilot Chat
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
      case 'os': return <OSView />;
      case 'crm': return <CRMView />;
      case 'finance': return <FinanceiroView />;
      case 'reports': return <RelatoriosView />;
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

  // 1. Loading Overlay state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060913] text-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-red-650 bg-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse mb-6">
          <Wrench className="w-8 h-8 text-white text-white rotate-45" />
        </div>
        <span className="font-mono text-xs tracking-widest text-slate-400">CARREGANDO SISTEMA ERP AUTOTECH...</span>
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
        <div className="max-w-sm w-full glass-panel p-8 rounded-2xl border border-gray-800 shadow-2xl relative text-left">
          
          <div className="flex justify-center items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-red-650 bg-red-600 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white">AUTO<span className="text-red-500">TECH</span></span>
              <span className="block text-[8px] text-gray-500 font-mono leading-none tracking-widest">ERP COMPLETO</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-center">
            <h2 className="text-lg font-bold text-white font-sans">Acesse o Sistema Administrativo</h2>
            <p className="text-xs text-gray-400">Configure com o Google Auth para começar a gerenciar sua mecânica com persistência.</p>

            <button 
              onClick={loginWithGoogle}
              className="w-full mt-2 py-3 bg-white text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-gray-200 shadow-sm cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-red-500" />
              Entrar com Google Cloud Auth
            </button>

            <div className="relative my-2">
              <span className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-800"></span></span>
              <span className="relative bg-[#0c1223] px-3 text-[10px] text-gray-500 font-mono uppercase">Ou experimente o pátio</span>
            </div>

            <button 
              onClick={async () => {
                await loginDemo();
                setActiveRoute('dashboard');
              }}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs tracking-widest font-mono cursor-pointer shadow-lg shadow-red-950/40"
            >
              🔓 ENTRAR DE MODO DEMONSTRATIVO
            </button>

            {loginError && (
              <span className="text-[10px] text-red-400 font-mono bg-red-950/20 p-2.5 rounded border border-red-900/30">
                {loginError}
              </span>
            )}
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
                AUTO<span className="text-red-500">TECH</span>
              </span>
              <span className="block text-[8px] text-gray-500 font-mono tracking-widest leading-none">ERP PREMIUM</span>
            </div>
          </div>
          
          <span className="hidden sm:inline-block ml-4 text-[10px] font-mono bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-400">
            🏢 {company.name} / White-Label Ativo
          </span>
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

          {/* AI CoPilot Toggle Button */}
          <button 
            onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-[10px] font-bold font-mono text-red-400 animate-pulse cursor-pointer shadow-inner"
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left ${activeRoute === 'stock' ? 'bg-red-950/20 text-red-500 border border-red-900/40 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Package className="w-4 h-4 shrink-0" /> Estoque de Peças
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
            <span>Licença Gold AutoTech</span>
            <span className="block mt-1">Status: ✦ Versão Premium ✦</span>
          </div>

        </aside>

        {/* ACTIVE MODULE CONTAINER SHEET */}
        <main className="flex-grow p-4 lg:p-8 overflow-x-hidden min-h-[calc(100vh-57px)] relative z-10">
          {renderActiveView()}
        </main>

        {/* SLIDING GOOGLE GEMINI CHAT COPILOT DRAWER (RIGHT PANEL) */}
        {isAiDrawerOpen && (
          <div className="fixed sm:sticky right-0 top-[57px] h-[calc(100vh-57px)] w-80 sm:w-96 bg-[#070c17] border-l border-gray-850 z-50 flex flex-col shadow-2xl">
            
            <div className="p-4 bg-[#0a101f] border-b border-gray-850 flex items-center justify-between text-left">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-400 animate-spin" />
                <div>
                  <span className="font-bold text-white text-xs block font-mono">AUTOTECH MECHANIC CO-PILOT</span>
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
