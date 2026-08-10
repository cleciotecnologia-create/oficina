import React, { useState, Component, ReactNode } from 'react';
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
import FerramentasView from './components/FerramentasView';
import { PatioAgendaView } from './components/PatioAgendaView';

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
  Car,
  GraduationCap,
  Upload,
  Link,
  Image,
  Check,
  History,
  Sliders
} from 'lucide-react';

interface TutorialStep {
  shortcut: string;
  badge: string;
  title: string;
  description: string;
  highlights: string[];
  moduleName: string;
}

const SHORTCUT_TUTORIALS: Record<string, TutorialStep> = {
  n: {
    shortcut: "Ctrl + N",
    badge: "Nova Ordem de Serviço",
    title: "Onboarding: Cadastro de O.S. via Atalho",
    description: "Você usou o atalho para criar uma Ordem de Serviço. Esse painel gerencia a entrada de veículos, diagnósticos e orçamentos da sua oficina.",
    highlights: [
      "📍 Quilometragens: Digite o KM Atual e a Etiqueta Anterior para o cálculo de manutenção preventiva.",
      "✨ Assistente Gemini: Fornece o laudo preditivo e sugere peças e serviços automaticamente.",
      "📝 Checklist de Entrada: Marque as condições estéticas do veículo para segurança da oficina."
    ],
    moduleName: "os"
  },
  s: {
    shortcut: "Ctrl + S",
    badge: "Controle de Estoque",
    title: "Onboarding: Gestão de Peças e Filtro de Alerta",
    description: "Você acessou o Estoque de Peças. Aqui você visualiza o oxigênio financeiro do estoque ativo da sua oficina.",
    highlights: [
      "⚠️ Alerta de Estoque Mínimo: Itens destacados em vermelho estão abaixo do limite operacional.",
      "🔍 Pesquisa e Filtros Rápidos: Localize marcas, OEMs e compatibilidade de motores.",
      "📈 Registrar Entrada: Utilize para registrar novos lotes fornecidos por distribuidores."
    ],
    moduleName: "stock"
  },
  d: {
    shortcut: "Ctrl + D",
    badge: "Dashboard de Indicadores",
    title: "Onboarding: Análise de Indicadores de Oficina",
    description: "Você acessou a central estatística. Este painel resume a saúde financeira e operacional em tempo real.",
    highlights: [
      "💰 Indicador DRE: Acompanhe lucros decorrentes da proporção entre peças e serviços prestados.",
      "📈 Ticket Médio: Saiba o valor médio gasto por cliente que entra no pátio da sua oficina.",
      "🕒 Tempo Médico de Permanência: Indica se os carros estão sendo liberados devidamente sem travar elevadores."
    ],
    moduleName: "dashboard"
  },
  p: {
    shortcut: "Ctrl + P",
    badge: "Ponto de Venda (PDV)",
    title: "Onboarding: Terminal de Vendas e Caixa Rápido",
    description: "Você ativou o PDV da loja. Um checkout unificado desenhado para vendas de balcão e produtos.",
    highlights: [
      "🏷️ Venda Balcão Clássica: Permite pesquisa rápida de itens do catálogo e adição instantânea ao carrinho.",
      "💵 Pagamento Flexível: Opções integradas para Pix (geração automática de QR Code), cartões ou dinheiro.",
      "🖨️ Recibo de 80mm: Emissão rápida formatada especialmente para impressoras térmicas de cupom."
    ],
    moduleName: "pdv"
  },
  f: {
    shortcut: "Ctrl + F",
    badge: "Fluxo Financeiro",
    title: "Onboarding: DRE, Entrada e Saída de Caixa",
    description: "Você entrou na área Financeira. Onde cada centavo pago ou recebido é classificado de modo estruturado.",
    highlights: [
      "📥 Receitas Automáticas: Lançamentos automáticos gerados pelo PDV e finalizações de ordens de serviço.",
      "💸 Lançamento de Custos: Registre despesas operacionais da oficina, comissões de mecânicos e insumos.",
      "🏦 Caixa Atual: Monitoramento de saldos consolidados e saldo disponível em bancos ou gaveta."
    ],
    moduleName: "finance"
  },
  c: {
    shortcut: "Ctrl + C",
    badge: "CRM Clientes & Autos",
    title: "Onboarding: Cadastro e Retenção de Clientes",
    description: "O CRM é o repositório de contatos, dados cadastrais e histórico veicular dos clientes da oficina.",
    highlights: [
      "🚙 Histórico Geral: Veja quando o carro esteve na oficina e quais serviços foram realizados nele anteriormente.",
      "📱 Comunicação Direta: Envie alertas de revisão e links do Portal do Cliente via WhatsApp com 1 clique.",
      "📊 Foco em Retorno: Classificação por data de última visita para manter a base sempre aquecida."
    ],
    moduleName: "crm"
  },
  g: {
    shortcut: "Ctrl + G",
    badge: "Configurações Gerais",
    title: "Onboarding: Parametrização e Limites de Inteligência",
    description: "Painel de Configurações do sistema. Ajuste os pilares tecnológicos do SaaS de oficina.",
    highlights: [
      "🏢 Dados da Oficina: Insira CNPJ, link de logotipo que aparecerá nos relatórios e contatos oficiais.",
      "🧠 Limite do Gemini: Controle a quantidade mensal e consumo de requisições de IA preventiva.",
      "💾 Backup Manual: Exporte todos os dados da oficina em Excel/JSON com total segurança."
    ],
    moduleName: "settings"
  }
};

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
    produtos,
    highContrast,
    updateCompany
  } = useApp();

  const [activeRoute, setActiveRoute] = useState<'landing' | 'dashboard' | 'pdv' | 'stock' | 'services' | 'os' | 'patio' | 'crm' | 'finance' | 'reports' | 'settings' | 'superadmin' | 'manual' | 'engineering' | 'tools'>('landing');

  // Automatic HTTP -> HTTPS redirection check for custom domain security (e.g., www.oficinadorafael.com.br)
  React.useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'http:' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1' &&
      !window.location.hostname.includes('.run.app')
    ) {
      console.log('🔒 Redirecionando conexão HTTP para HTTPS seguro...');
      window.location.replace(`https://${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`);
    }
  }, []);

  // Training Mode & Interactive Onboarding States for keyboard shortcuts
  const [isTrainingMode, setIsTrainingMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('saas_training_mode_active');
    return saved !== null ? saved === 'true' : true;
  });

  const [usedShortcuts, setUsedShortcuts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('saas_used_shortcuts_keys');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  const [activeTutorialKey, setActiveTutorialKey] = useState<string | null>(null);
  const [tutorialStepIndex, setTutorialStepIndex] = useState<number>(0);
  const [showTrainingToast, setShowTrainingToast] = useState<{message: string, shortcut: string} | null>(null);

  React.useEffect(() => {
    localStorage.setItem('saas_training_mode_active', String(isTrainingMode));
  }, [isTrainingMode]);

  React.useEffect(() => {
    localStorage.setItem('saas_used_shortcuts_keys', JSON.stringify(usedShortcuts));
  }, [usedShortcuts]);

  const triggerShortcutTutorial = (key: string) => {
    if (!isTrainingMode) return;
    const lowercaseKey = key.toLowerCase();
    const isFirstTime = !usedShortcuts.includes(lowercaseKey);
    
    if (isFirstTime) {
      setUsedShortcuts(prev => [...prev, lowercaseKey]);
    }

    setActiveTutorialKey(lowercaseKey);
    setTutorialStepIndex(0);

    setShowTrainingToast({
      message: isFirstTime 
        ? `🎓 Primeiro uso do atalho detectado! Iniciando tutorial passo a passo...`
        : `🎓 Carregando tutorial interativo de atalho...`,
      shortcut: lowercaseKey
    });

    setTimeout(() => {
      setShowTrainingToast(null);
    }, 4500);
  };
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // States & handlers for inline header logo updater
  const [isLogoPopupOpen, setIsLogoPopupOpen] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState(company?.logoUrl || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUpdateError, setLogoUpdateError] = useState<string | null>(null);
  const [logoUpdateSuccess, setLogoUpdateSuccess] = useState(false);

  // Advanced adjustment / cropping states
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [cropX, setCropX] = useState<number>(0);
  const [cropY, setCropY] = useState<number>(0);
  const [cropShape, setCropShape] = useState<'circle' | 'square'>('square');
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (company?.logoUrl) {
      setLogoUrlInput(company.logoUrl);
    }
  }, [company?.logoUrl]);

  // Redraw logo preview on canvas whenever adjustment states change
  React.useEffect(() => {
    if (!tempImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      
      // Draw background
      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (cropShape === 'circle') {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#050811';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const aspect = img.width / img.height;
      let drawW = canvas.width;
      let drawH = canvas.height;

      if (aspect >= 1) {
        drawH = canvas.height * zoom;
        drawW = canvas.height * aspect * zoom;
      } else {
        drawW = canvas.width * zoom;
        drawH = (canvas.width / aspect) * zoom;
      }

      // Center + offset
      const x = (canvas.width - drawW) / 2 + cropX;
      const y = (canvas.height - drawH) / 2 + cropY;

      ctx.drawImage(img, x, y, drawW, drawH);
      ctx.restore();
    };
    img.onerror = () => {
      console.warn("Failed to load temp image in canvas (likely CORS blocked layout)");
    };
    img.src = tempImage;
  }, [tempImage, zoom, cropX, cropY, cropShape]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setIsUploadingLogo(true);
    setLogoUpdateError(null);
    setLogoUpdateSuccess(false);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      // Instead of saving directly, open crop tools with the base64 string
      setTempImage(base64);
      setZoom(1);
      setCropX(0);
      setCropY(0);
      setCropShape('square');
    } catch (err: any) {
      console.error("Erro ao fazer upload da logo:", err);
      setLogoUpdateError("Erro ao processar imagem.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleLogoUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoUrlInput.trim()) return;
    
    setLogoUpdateError(null);
    setLogoUpdateSuccess(false);
    
    // Instead of saving directly, open crop tools with original URL
    setTempImage(logoUrlInput);
    setZoom(1);
    setCropX(0);
    setCropY(0);
    setCropShape('square');
  };

  const handleEditCurrentLogo = () => {
    if (company?.logoUrl) {
      setTempImage(company.logoUrl);
      setZoom(1);
      setCropX(0);
      setCropY(0);
      setCropShape('square');
    }
  };

  const handleSaveOriginalUrl = async () => {
    if (!tempImage) return;
    setIsUploadingLogo(true);
    setLogoUpdateError(null);
    try {
      await updateCompany({ logoUrl: tempImage });
      setLogoUpdateSuccess(true);
      setTempImage(null);
      setTimeout(() => {
        setLogoUpdateSuccess(false);
        setIsLogoPopupOpen(false);
      }, 1500);
    } catch (err) {
      console.error("Erro ao salvar url original:", err);
      setLogoUpdateError("Erro ao salvar original sem ajuste.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Calculate critical products count (stock <= minStock) for the warning badge
  const criticalProductsCount = (produtos || []).filter(
    p => p.quantity <= (p.minStock ?? 0)
  ).length;

  // States for header global/plate quick-search
  const [globalSearchPlate, setGlobalSearchPlate] = useState('');
  const [headerSearchPlate, setHeaderSearchPlate] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Recent searched plates history (stores up to 5 unique plates)
  const [recentSearches, setRecentSearches] = useState<{
    plate: string;
    clienteName?: string;
    veiculoInfo?: string;
    timestamp: number;
  }[]>(() => {
    try {
      const saved = localStorage.getItem('autoprecision_recent_plates');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Error loading recent plates:', err);
      return [];
    }
  });

  const addRecentSearch = (plate: string, clienteName?: string, veiculoInfo?: string) => {
    if (!plate || !plate.trim()) return;
    const normalizedPlate = plate.trim().toUpperCase();
    
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.plate.toUpperCase() !== normalizedPlate);
      const updated = [
        {
          plate: normalizedPlate,
          clienteName,
          veiculoInfo,
          timestamp: Date.now(),
        },
        ...filtered,
      ].slice(0, 5);

      try {
        localStorage.setItem('autoprecision_recent_plates', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving recent searches:', err);
      }
      return updated;
    });
  };

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
        triggerShortcutTutorial('n');
        return;
      }

      // 2. Estoque (Stock): Ctrl + S or Alt + S or Alt + E
      if ((isCtrl && e.key.toLowerCase() === 's') || (isAlt && e.key.toLowerCase() === 's') || (isAlt && e.key.toLowerCase() === 'e')) {
        e.preventDefault();
        setActiveRoute('stock');
        setMobileSidebarOpen(false);
        triggerShortcutTutorial('s');
        return;
      }

      // 3. Dashboard: Ctrl + D or Alt + D
      if ((isCtrl && e.key.toLowerCase() === 'd') || (isAlt && e.key.toLowerCase() === 'd')) {
        e.preventDefault();
        setActiveRoute('dashboard');
        setMobileSidebarOpen(false);
        triggerShortcutTutorial('d');
        return;
      }

      // 4. PDV: Ctrl + P or Alt + P
      if ((isCtrl && e.key.toLowerCase() === 'p') || (isAlt && e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        setActiveRoute('pdv');
        setMobileSidebarOpen(false);
        triggerShortcutTutorial('p');
        return;
      }

      // 5. Financeiro: Ctrl + F or Alt + F
      if ((isCtrl && e.key.toLowerCase() === 'f') || (isAlt && e.key.toLowerCase() === 'f')) {
        e.preventDefault();
        setActiveRoute('finance');
        setMobileSidebarOpen(false);
        triggerShortcutTutorial('f');
        return;
      }

      // 6. CRM (Clientes): Ctrl + C or Alt + C
      if ((isCtrl && e.key.toLowerCase() === 'c') || (isAlt && e.key.toLowerCase() === 'c')) {
        e.preventDefault();
        setActiveRoute('crm');
        setMobileSidebarOpen(false);
        triggerShortcutTutorial('c');
        return;
      }

      // 7. Configurações: Ctrl + G or Alt + G
      if ((isCtrl && e.key.toLowerCase() === 'g') || (isAlt && e.key.toLowerCase() === 'g')) {
        e.preventDefault();
        setActiveRoute('settings');
        setMobileSidebarOpen(false);
        triggerShortcutTutorial('g');
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
  }, [user, isTrainingMode, usedShortcuts]);
  
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
      case 'tools': return <FerramentasView />;
      case 'services': return <ServicosView />;
      case 'os': return <OSView initialSearchPlate={globalSearchPlate} onClearInitialSearch={() => setGlobalSearchPlate('')} />;
      case 'patio': return <PatioAgendaView onNavigateToOS={(osId) => { if (osId) setGlobalSearchPlate(osId); setActiveRoute('os'); }} />;
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
                (() => {
                  const errText = authFeedback || loginError || '';
                  const isUnauthorizedDomain = errText.includes('unauthorized-domain');
                  if (isUnauthorizedDomain) {
                    return (
                      <div className="text-xs text-amber-200 font-sans bg-amber-950/40 p-3 rounded-xl border border-amber-800/60 leading-relaxed flex flex-col gap-2 my-1 text-left">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono text-[11px]">
                          <span>⚠️ Domínio Não Autorizado no Firebase Auth</span>
                        </div>
                        <p className="text-[10.5px] text-amber-100/90">
                          O Firebase bloqueou a autenticação porque o domínio <code className="text-white bg-slate-900 px-1 rounded font-bold">{typeof window !== 'undefined' ? window.location.hostname : 'atual'}</code> não foi adicionado à lista de domínios autorizados do seu projeto.
                        </p>
                        <div className="bg-[#050810] p-2.5 rounded-lg border border-amber-900/40 font-mono text-[10px] space-y-1 text-gray-300">
                          <p className="font-bold text-amber-300 font-sans">Passo a Passo para Liberar no Firebase Console:</p>
                          <ol className="list-decimal pl-4 space-y-1 leading-snug">
                            <li>
                              Acesse <a href="https://console.firebase.google.com/u/0/project/project-7e67bad4-9088-4537-aa1/authentication/settings" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-bold">Firebase Console ➔ Configurações do Authentication</a>
                            </li>
                            <li>Clique na aba <strong>Domínios Autorizados</strong> (Authorized Domains).</li>
                            <li>Clique em <strong>Adicionar domínio</strong> e insira: <code className="text-emerald-300 font-bold">{typeof window !== 'undefined' ? window.location.hostname : 'oficinadorafael.com.br'}</code></li>
                            <li>Clique em <strong>Salvar</strong>. O login funcionará imediatamente!</li>
                          </ol>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            await loginDemo();
                            setActiveRoute('dashboard');
                          }}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10.5px] font-mono cursor-pointer transition-colors shadow flex items-center justify-center gap-1.5"
                        >
                          ⚡ Acessar em Modo Demo Sem Login (Temporário)
                        </button>
                      </div>
                    );
                  }
                  return (
                    <div className="text-[10px] text-red-400 font-mono bg-red-950/25 p-2.5 rounded-lg border border-red-900/35 leading-tight">
                      ⚠️ {errText}
                    </div>
                  );
                })()
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
    <div className={`min-h-screen bg-[#060913] text-gray-100 flex flex-col font-sans ${highContrast ? 'high-contrast' : ''}`}>
      
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
          
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => setIsLogoPopupOpen(!isLogoPopupOpen)}
              title="Clique para atualizar o logotipo"
              className="flex items-center gap-2 text-left hover:bg-white/5 active:scale-95 focus:outline-none focus:ring-1 focus:ring-red-500 rounded-lg p-1.5 transition-all relative group cursor-pointer"
            >
              {company.logoUrl ? (
                <div className="relative">
                  <img 
                    src={company.logoUrl} 
                    alt="Logo Empresa" 
                    className="w-9 h-9 rounded-lg object-cover bg-slate-950 border border-gray-850" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-3 h-3 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg bg-red-650 bg-red-600 flex items-center justify-center relative">
                  <Wrench className="w-4 h-4 text-white rotate-45" />
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
              <div>
                <span className="font-display font-bold text-sm tracking-tight text-white block">
                  SISTEMA OFICINA <span className="text-red-500">PDV</span>
                </span>
                <span className="block text-[8px] text-gray-500 font-mono tracking-widest leading-none mt-0.5">SOFTWARE DE GESTÃO</span>
              </div>
            </button>

            {/* FLOATING LOGO UPDATER DROPDOWN POPOVER */}
            {isLogoPopupOpen && (
              <div 
                id="header-logo-popover" 
                className="absolute top-14 left-0 z-50 w-72 bg-[#090f1d] border border-gray-850 rounded-xl p-4 shadow-2xl flex flex-col gap-3 font-sans text-left"
              >
                {!tempImage ? (
                  <>
                    <div className="flex justify-between items-center border-b border-gray-855 pb-2">
                      <span className="text-[10px] font-bold font-mono tracking-wide text-white uppercase flex items-center gap-1.5">
                        <Image className="w-3.5 h-3.5 text-red-500" /> Logotipo da Oficina
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsLogoPopupOpen(false)}
                        className="text-gray-400 hover:text-white p-0.5 cursor-pointer rounded hover:bg-white/5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {logoUpdateError && (
                      <div className="p-2 bg-red-950/20 border border-red-900/40 rounded text-red-400 font-mono text-[9px]">
                        ⚠️ {logoUpdateError}
                      </div>
                    )}

                    {logoUpdateSuccess && (
                      <div className="p-2 bg-green-950/20 border border-green-900/40 rounded text-green-400 font-mono text-[9px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Logotipo atualizado com sucesso!
                      </div>
                    )}

                    {/* Option 1: Upload local logo file */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">Opção 1: Enviar Arquivo</label>
                      <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-800 hover:border-red-500/40 bg-black/40 rounded-lg cursor-pointer transition text-center hover:bg-slate-900/40">
                        <Upload className="w-4 h-4 text-gray-500 group-hover:text-red-400" />
                        <span className="text-[10px] text-gray-300 font-semibold mt-1">Carregar imagem...</span>
                        <span className="text-[8px] text-gray-500 mt-0.5">PNG, JPG, SVG ou WEBP</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={isUploadingLogo}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-gray-850"></div>
                      <span className="flex-shrink mx-2 text-[8px] text-gray-600 font-mono uppercase">OU</span>
                      <div className="flex-grow border-t border-gray-850"></div>
                    </div>

                    {/* Option 2: Image URL field */}
                    <form 
                      onSubmit={handleLogoUrlSubmit} 
                      className="flex flex-col gap-1.5"
                    >
                      <label className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">Opção 2: Endereço (URL)</label>
                      <div className="flex gap-1.5">
                        <div className="relative flex-1">
                          <Link className="absolute left-2 top-2.5 w-3 h-3 text-slate-500" />
                          <input
                            type="url"
                            placeholder="https://suaoficina.com/logo.png"
                            value={logoUrlInput}
                            onChange={(e) => setLogoUrlInput(e.target.value)}
                            className="w-full bg-black/50 border border-gray-850 rounded-lg py-1.5 pl-6.5 pr-1.5 text-[10px] text-white focus:outline-none focus:border-red-500 transition-all font-mono"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isUploadingLogo}
                          className="px-2.5 py-1.5 bg-red-650 hover:bg-red-600 rounded-lg text-[10px] font-mono font-bold text-white transition active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
                        >
                          Ajustar
                        </button>
                      </div>
                    </form>

                    {company.logoUrl && (
                      <div className="pt-2 border-t border-gray-855 flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={handleEditCurrentLogo}
                          className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-850 text-gray-300 font-mono text-[9px] font-bold rounded-lg uppercase flex items-center justify-center gap-1.5 border border-slate-800 transition active:scale-[0.98] cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5 text-red-500" /> Ajustar Logotipo Atual
                        </button>
                      </div>
                    )}

                    {/* Info disclaimer */}
                    <div className="text-[8px] text-gray-500 font-sans leading-normal pt-1.5 border-t border-gray-850">
                      💡 O logotipo alterado será sincronizado instantaneamente na barra de cabeçalho, orçamentos, ordens de serviço e relatórios.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center border-b border-gray-855 pb-2">
                      <span className="text-[10px] font-bold font-mono tracking-wide text-white uppercase flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Recortar & Ajustar Logo
                      </span>
                      <button
                        type="button"
                        onClick={() => setTempImage(null)}
                        className="text-gray-400 hover:text-white p-0.5 cursor-pointer rounded hover:bg-white/5"
                        title="Cancelar e voltar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {logoUpdateError && (
                      <div className="p-2 bg-red-955 bg-red-950/30 border border-red-900/40 rounded text-red-400 font-mono text-[9px] flex flex-col gap-1.5 leading-relaxed">
                        <span>⚠️ {logoUpdateError}</span>
                        {String(logoUpdateError).includes("CORS") && (
                          <button
                            type="button"
                            onClick={handleSaveOriginalUrl}
                            className="bg-red-800 hover:bg-red-700 text-white font-mono font-bold text-[8px] py-1 px-2 rounded tracking-wider uppercase transition-all"
                          >
                            Salvar Sem Ajuste (Original)
                          </button>
                        )}
                      </div>
                    )}

                    {/* Interactive crop canvas preview */}
                    <div className="flex flex-col items-center justify-center py-2 bg-black/60 rounded-xl relative overflow-hidden border border-gray-850/60">
                      <canvas
                        ref={canvasRef}
                        width={200}
                        height={200}
                        className={`w-28 h-28 bg-[#080d1a] border border-gray-800 ${cropShape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}
                      />
                      <span className="text-[8px] text-gray-500 mt-1 pb-1 font-mono uppercase tracking-wider">
                        Ajuste ({cropShape === 'circle' ? 'Arco de Círculo' : 'Quadrado'})
                      </span>
                    </div>

                    {/* Shape Selector */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[8.5px] font-mono text-gray-400 uppercase font-bold tracking-widest">Formato</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCropShape('square')}
                          className={`py-1 rounded font-mono text-[8.5px] font-bold border transition ${cropShape === 'square' ? 'bg-red-950/30 border-red-500 text-red-400' : 'bg-transparent border-gray-800 text-gray-500 hover:text-white'}`}
                        >
                          Quadrado
                        </button>
                        <button
                          type="button"
                          onClick={() => setCropShape('circle')}
                          className={`py-1 rounded font-mono text-[8.5px] font-bold border transition ${cropShape === 'circle' ? 'bg-red-950/30 border-red-500 text-red-400' : 'bg-transparent border-gray-800 text-gray-500 hover:text-white'}`}
                        >
                          Célula Circular
                        </button>
                      </div>
                    </div>

                    {/* Controls & sliders */}
                    <div className="flex flex-col gap-2">
                      {/* Zoom control */}
                      <div className="flex flex-col gap-0.5">
                        <div className="flex justify-between items-center text-[8px] font-mono text-gray-400 uppercase">
                          <span>Zoom (Escala)</span>
                          <span className="text-white font-bold">{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="3"
                          step="0.05"
                          value={zoom}
                          onChange={(e) => setZoom(parseFloat(e.target.value))}
                          className="w-full h-1 bg-gray-850 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                      </div>

                      {/* Offset X control */}
                      <div className="flex flex-col gap-0.5">
                        <div className="flex justify-between items-center text-[8px] font-mono text-gray-400 uppercase">
                          <span>Eixo Horizontal (X)</span>
                          <span className="text-white font-bold">{cropX}px</span>
                        </div>
                        <input
                          type="range"
                          min="-150"
                          max="150"
                          step="1"
                          value={cropX}
                          onChange={(e) => setCropX(parseInt(e.target.value))}
                          className="w-full h-1 bg-gray-850 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                      </div>

                      {/* Offset Y control */}
                      <div className="flex flex-col gap-0.5">
                        <div className="flex justify-between items-center text-[8px] font-mono text-gray-400 uppercase">
                          <span>Eixo Vertical (Y)</span>
                          <span className="text-white font-bold">{cropY}px</span>
                        </div>
                        <input
                          type="range"
                          min="-150"
                          max="150"
                          step="1"
                          value={cropY}
                          onChange={(e) => setCropY(parseInt(e.target.value))}
                          className="w-full h-1 bg-gray-850 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                      </div>
                    </div>

                    {/* Save adjust & Go back buttons */}
                    <div className="grid grid-cols-2 gap-2 border-t border-gray-850 pt-2.5 mt-0.5">
                      <button
                        type="button"
                        onClick={() => setTempImage(null)}
                        className="py-1.5 bg-[#0c1223] border border-gray-800 hover:border-gray-700 hover:text-white rounded-lg text-[9px] font-mono font-bold text-gray-400 transition active:scale-95 text-center cursor-pointer"
                      >
                        Voltar
                      </button>
                      <button
                        type="button"
                        disabled={isUploadingLogo || !tempImage}
                        onClick={async () => {
                          if (canvasRef.current) {
                            try {
                              setIsUploadingLogo(true);
                              setLogoUpdateError(null);
                              // Export canvas
                              const editedBase64 = canvasRef.current.toDataURL('image/png');
                              await updateCompany({ logoUrl: editedBase64 });
                              setLogoUpdateSuccess(true);
                              setTempImage(null);
                              setTimeout(() => {
                                setLogoUpdateSuccess(false);
                                setIsLogoPopupOpen(false);
                              }, 1500);
                            } catch (err: any) {
                              console.error("Erro ao salvar imagem recortada:", err);
                              if (err.message && err.message.includes("tainted")) {
                                setLogoUpdateError("CORS: Não foi possível recortar esta imagem externa devido a restrições de segurança do site de origem.");
                              } else {
                                setLogoUpdateError("Erro ao recortar imagem.");
                              }
                            } finally {
                              setIsUploadingLogo(false);
                            }
                          }
                        }}
                        className="py-1.5 bg-green-650 hover:bg-green-600 rounded-lg text-[9px] font-mono font-bold text-white transition active:scale-95 disabled:opacity-50 text-center cursor-pointer flex items-center justify-center gap-1"
                      >
                        {isUploadingLogo ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "Confirmar"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = headerSearchPlate.trim();
                  if (query) {
                    const normQuery = query.toLowerCase();
                    const bestMatch = ordensServico ? ordensServico.find(os => 
                      os.plate.toLowerCase() === normQuery ||
                      os.plate.toLowerCase().includes(normQuery) ||
                      (os.clienteName && os.clienteName.toLowerCase().includes(normQuery)) ||
                      (os.veiculoInfo && os.veiculoInfo.toLowerCase().includes(normQuery))
                    ) : null;

                    if (bestMatch) {
                      addRecentSearch(bestMatch.plate, bestMatch.clienteName, bestMatch.veiculoInfo);
                      setGlobalSearchPlate(bestMatch.plate);
                    } else {
                      addRecentSearch(query.toUpperCase());
                      setGlobalSearchPlate(query.toUpperCase());
                    }
                    setActiveRoute('os');
                    setHeaderSearchPlate('');
                    (e.target as HTMLInputElement).blur();
                  }
                }
              }}
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

          {/* Autocomplete & Recent Searches Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0e1628] border border-gray-850 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-60 overflow-y-auto z-55">
              {headerSearchPlate ? (
                (() => {
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
                      'Entregue': 'border-emerald-600 bg-emerald-950/20 text-emerald-400',
                      'Agendada': 'border-purple-900 bg-purple-950/40 text-purple-400'
                    };
                    const colorClass = statusColors[os.status] || 'border-slate-850 text-slate-400 bg-slate-900/40';

                    return (
                      <button
                        key={os.id}
                        type="button"
                        onMouseDown={() => {
                          addRecentSearch(os.plate, os.clienteName, os.veiculoInfo);
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
                })()
              ) : (
                /* Recent Searches dropdown format */
                <div className="flex flex-col">
                  <div className="flex justify-between items-center px-3 py-2 bg-slate-950/40 border-b border-gray-850">
                    <span className="text-[8.5px] font-bold font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1">
                      <History className="w-3 h-3 text-red-500" /> Buscas Recentes (Últimas 5)
                    </span>
                    {recentSearches.length > 0 && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setRecentSearches([]);
                          try {
                            localStorage.removeItem('autoprecision_recent_plates');
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="text-[8px] font-bold font-mono text-red-500 hover:text-red-400 uppercase transition-colors bg-transparent border-0 cursor-pointer"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  {recentSearches.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-[10px] font-mono leading-relaxed">
                      💡 HISTÓRICO DE BUSCAS VAZIO<br />
                      CONSULTE PLACAS OU NOMES DE CLIENTES PARA SALVAR.
                    </div>
                  ) : (
                    recentSearches.map((item, index) => {
                      return (
                        <button
                          key={`${item.plate}-${index}`}
                          type="button"
                          onMouseDown={() => {
                            setGlobalSearchPlate(item.plate);
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
                                {item.plate.toUpperCase()}
                              </span>
                              {item.clienteName && (
                                <span className="text-white font-bold text-[10px] truncate max-w-[110px]">
                                  {item.clienteName}
                                </span>
                              )}
                            </div>
                            {item.veiculoInfo && (
                              <span className="text-[9px] text-gray-400 font-sans truncate block">
                                🚗 {item.veiculoInfo}
                              </span>
                            )}
                          </div>
                          
                          <div className="shrink-0 ml-2">
                            <Search className="w-3.5 h-3.5 text-slate-500 hover:text-white" />
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
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
                            waitingPartsOS.map((os, index) => (
                              <motion.div 
                                key={os.id}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.25, delay: index * 0.05, ease: "easeOut" }}
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
                              </motion.div>
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

          {/* Training Mode Onboarding Button */}
          <button 
            type="button"
            onClick={() => {
              setIsTrainingMode(prev => !prev);
              setActiveTutorialKey(null);
            }}
            title="Ativar/Desativar modo de treinamento interativo com dicas pop-up nos atalhos"
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold font-mono transition-all cursor-pointer shadow-inner active:scale-95 ${
              isTrainingMode 
                ? 'bg-rose-950/35 border-rose-900/60 text-rose-400 hover:bg-rose-950/50' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GraduationCap className={`w-3.5 h-3.5 ${isTrainingMode ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
            MODO TREINAMENTO: {isTrainingMode ? 'ATIVO 🎓' : 'INATIVO'}
          </button>

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
          transition-transform duration-300 md:translate-x-0 overflow-y-auto
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
              onClick={() => { setActiveRoute('tools'); setMobileSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left ${activeRoute === 'tools' ? 'bg-red-950/20 text-red-500 border border-red-900/40 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Wrench className="w-4 h-4 shrink-0" /> Controle de Ferramentas
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
              onClick={() => { setActiveRoute('patio'); setMobileSidebarOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left ${activeRoute === 'patio' ? 'bg-red-950/20 text-red-500 border border-red-900/40 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Calendar className="w-4 h-4 shrink-0 text-amber-400" /> Agenda de Pátio
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
                  <div 
                    onClick={() => {
                      setActiveRoute('dashboard');
                      setMobileSidebarOpen(false);
                      setIsShortcutModalOpen(false);
                      triggerShortcutTutorial('d');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-cyan-500/30 hover:bg-slate-900/40 cursor-pointer transition-all active:scale-[99%]"
                    title="Clique para acessar o Dashboard de Indicadores"
                  >
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

                  <div 
                    onClick={() => {
                      setActiveRoute('os');
                      setMobileSidebarOpen(false);
                      setIsShortcutModalOpen(false);
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('open-new-os'));
                      }, 80);
                      triggerShortcutTutorial('n');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-red-500/30 hover:bg-slate-900/40 cursor-pointer transition-all active:scale-[99%]"
                    title="Clique para abrir nova Ordem de Serviço"
                  >
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

                  <div 
                    onClick={() => {
                      setActiveRoute('stock');
                      setMobileSidebarOpen(false);
                      setIsShortcutModalOpen(false);
                      triggerShortcutTutorial('s');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-amber-500/30 hover:bg-slate-900/40 cursor-pointer transition-all active:scale-[99%]"
                    title="Clique para acessar o Estoque"
                  >
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

                  <div 
                    onClick={() => {
                      setActiveRoute('pdv');
                      setMobileSidebarOpen(false);
                      setIsShortcutModalOpen(false);
                      triggerShortcutTutorial('p');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-emerald-500/30 hover:bg-slate-900/40 cursor-pointer transition-all active:scale-[99%]"
                    title="Clique para acessar o PDV"
                  >
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

                  <div 
                    onClick={() => {
                      setActiveRoute('finance');
                      setMobileSidebarOpen(false);
                      setIsShortcutModalOpen(false);
                      triggerShortcutTutorial('f');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-green-500/30 hover:bg-slate-900/40 cursor-pointer transition-all active:scale-[99%]"
                    title="Clique para ver o Fluxo Financeiro"
                  >
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

                  <div 
                    onClick={() => {
                      setActiveRoute('crm');
                      setMobileSidebarOpen(false);
                      setIsShortcutModalOpen(false);
                      triggerShortcutTutorial('c');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-blue-500/30 hover:bg-slate-900/40 cursor-pointer transition-all active:scale-[99%]"
                    title="Clique para ir ao CRM"
                  >
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

                  <div 
                    onClick={() => {
                      setActiveRoute('settings');
                      setMobileSidebarOpen(false);
                      setIsShortcutModalOpen(false);
                      triggerShortcutTutorial('g');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-slate-500/30 hover:bg-slate-900/40 cursor-pointer transition-all active:scale-[99%]"
                    title="Clique para ir às Configurações"
                  >
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

                  <div 
                    onClick={() => {
                      setIsShortcutModalOpen(false);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-950/40 border border-gray-900 hover:border-emerald-500/30 hover:bg-slate-900/40 cursor-pointer transition-all active:scale-[99%]"
                    title="Clique para fechar o Guia de Atalhos"
                  >
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

      {/* TRAINING MODE STEP-BY-STEP TUTORIAL POPUP */}
      <AnimatePresence>
        {activeTutorialKey && SHORTCUT_TUTORIALS[activeTutorialKey] && (() => {
          const tutorial = SHORTCUT_TUTORIALS[activeTutorialKey];
          return (
            <div className="fixed bottom-6 right-6 z-[9999] max-w-sm sm:max-w-md w-full px-4 sm:px-0">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                className="bg-[#0c1223] border-2 border-rose-600/60 rounded-3xl overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.8)] text-left flex flex-col relative"
              >
                {/* Glow bar top */}
                <div className="h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500 w-full" />
                
                {/* Header */}
                <div className="p-4 bg-[#0a0f1d] border-b border-gray-850 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-rose-500/10 text-rose-400">
                      <GraduationCap className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest font-mono">Modo de Treinamento</span>
                      <h4 className="text-xs font-bold text-gray-300 font-mono leading-none">{tutorial.badge}</h4>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTutorialKey(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content Body */}
                <div className="p-5 flex flex-col gap-4">
                  <div>
                    <h3 className="font-display font-medium text-white text-sm tracking-tight mb-1">
                      {tutorial.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-sans">
                      {tutorial.description}
                    </p>
                  </div>

                  {/* Highlights Step List */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">
                      Dicas Importantes ({tutorialStepIndex + 1}/3):
                    </span>
                    
                    {tutorial.highlights.map((highlight, index) => {
                      const isActive = index === tutorialStepIndex;
                      return (
                        <motion.div
                          key={index}
                          animate={{ 
                            opacity: isActive ? 1 : 0.45,
                            scale: isActive ? 1.01 : 0.98,
                            x: isActive ? 4 : 0
                          }}
                          className={`p-3 rounded-xl border transition-all text-xs flex gap-2.5 items-start ${
                            isActive 
                              ? 'bg-[#150f1d] border-rose-500/40 text-rose-200 font-medium' 
                              : 'bg-gray-950/20 border-gray-900/50 text-gray-400'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center shrink-0 font-bold ${
                            isActive ? 'bg-rose-500 text-white' : 'bg-gray-900 text-gray-500'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="leading-snug">{highlight}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Control Action Footer */}
                <div className="p-4 bg-[#080d1a] border-t border-gray-850 flex justify-between items-center">
                  <div className="flex gap-1">
                    {tutorial.highlights.map((_, index) => (
                      <span 
                        key={index} 
                        className={`block h-1.5 rounded-full transition-all duration-300 ${
                          index === tutorialStepIndex ? 'w-5 bg-rose-500' : 'w-1.5 bg-gray-850'
                        }`} 
                      />
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {tutorialStepIndex > 0 && (
                      <button
                        type="button"
                        onClick={() => setTutorialStepIndex(prev => prev - 1)}
                        className="px-3 py-1.5 rounded-xl border border-gray-850 bg-slate-900 text-xs font-mono text-gray-300 cursor-pointer"
                      >
                        Anterior
                      </button>
                    )}
                    
                    {tutorialStepIndex < 2 ? (
                      <button
                        type="button"
                        onClick={() => setTutorialStepIndex(prev => prev + 1)}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-xs font-bold font-mono text-white cursor-pointer transition-all shadow-md"
                      >
                        Próximo
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTutorialKey(null);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-110 active:scale-95 text-xs font-bold font-mono text-white cursor-pointer transition-all shadow-md"
                      >
                        Pronto! 🚀
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* TRAINING MODE FIRST-TIME SUCCESS TOAST */}
      <AnimatePresence>
        {showTrainingToast && (
          <div className="fixed top-20 right-6 z-[99999] max-w-sm w-full px-4 sm:px-0">
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="p-4 rounded-2xl bg-[#0e172a] border border-rose-500/40 shadow-2xl flex items-center gap-3.5 text-left text-xs font-mono"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 animate-bounce">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-white font-bold truncate leading-snug">
                  {showTrainingToast.message}
                </p>
                <span className="text-[10px] text-gray-400">
                  Dica de atalho: clique nos itens ou use o teclado!
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTrainingToast(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// 5. SECURE CRASH RECOVERY SHIELD (ErrorBoundary) TO PREVENT BLACK SCREENS IN ANY DEPLOYMENT
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  props: { children: ReactNode };
  state = { hasError: false, error: null };

  constructor(props: { children: ReactNode }) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an uncaught exception on load:", error, errorInfo);
  }

  handleRestart = () => {
    try {
      localStorage.clear();
      window.location.search = ""; // remove parameters that could be causing portal crashes
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div id="crash-screen" className="min-h-screen bg-[#060913] text-gray-100 flex flex-col justify-center items-center p-6 text-center select-none font-sans">
          <div className="max-w-md w-full bg-[#0c1223]/95 border border-red-500/30 rounded-3xl p-8 shadow-2xl relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-red-650 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              <span className="text-white text-xl font-bold font-mono">⚠️</span>
            </div>
            
            <h1 className="text-lg font-bold font-display text-white mt-4 tracking-tight leading-tight uppercase">
              Sistema em Manutenção / Instabilidade
            </h1>
            <p className="text-[11px] text-gray-400 mt-2.5 leading-relaxed">
              O sistema está temporariamente fora de serviço ou passando por manutenção rápida para correção de instabilidades. <strong>Nossa equipe técnica já está trabalhando ativamente para solucionar este problema e restabelecer o acesso 100% normalizado o mais breve possível.</strong>
            </p>
            <p className="text-[10px] text-emerald-450 text-emerald-400 font-semibold mt-1">
              🛠️ Suporte técnico alertado e monitorando em tempo real.
            </p>

            <div className="my-5 p-4 bg-[#050810] border border-gray-800 rounded-xl max-h-40 overflow-y-auto text-left">
              <span className="text-[9px] font-mono block text-red-400 uppercase tracking-wider font-bold mb-1">Diagnóstico Técnico:</span>
              <p className="font-mono text-[9.5px] text-gray-300 leading-snug break-all whitespace-pre-wrap">
                {this.state.error?.stack || this.state.error?.message || "Erro desconhecido na renderização."}
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={this.handleRestart}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs tracking-wider font-mono cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-red-950/40 border-none"
              >
                🔄 LIMPAR CACHE E REINICIAR SISTEMA
              </button>
              
              <button
                type="button"
                onClick={() => { (this as any).setState({ hasError: false, error: null }); window.location.reload(); }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-gray-300 rounded-xl text-[10px] uppercase font-bold tracking-wider cursor-pointer border border-gray-800 transition-colors"
              >
                Voltar ao Início / Recarregar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
