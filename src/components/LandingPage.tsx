import React, { useState } from 'react';
import { 
  Wrench, 
  ShieldAlert, 
  Cpu, 
  TrendingUp, 
  Percent, 
  UserCheck, 
  MessageSquare, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown, 
  Menu, 
  X,
  Play,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onEnterApp: () => void;
  onEnterDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onEnterDemo }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const plans = [
    {
      name: "Básico",
      price: "129",
      period: "mês",
      desc: "Ideal para oficinas iniciantes e pequenos mecânicos autônomos.",
      features: [
        "Até 100 Clientes Cadastrados",
        "Módulo de Ordem de Serviço Simples",
        "Controle de Estoque Básico",
        "Suporte por Web Semanal",
        "1 Usuário Ativo"
      ],
      popular: false,
      cta: "Assinar Básico"
    },
    {
      name: "Profissional",
      price: "249",
      period: "mês",
      desc: "O plano mais vendido. Perfeito para oficinas e auto peças em crescimento.",
      features: [
        "Clientes & Veículos Ilimitados",
        "PDV de Venda Rápida Frente de Caixa",
        "Cadastro de Produtos & Alerta Estoque Mínimo",
        "Contas a Pagar/Receber e Fluxo de Caixa",
        "Relatórios Faturamento e DRE",
        "IA Sugestão e Diagnóstico de Peças (30/mês)",
        "Até 5 Usuários com Permissões específicas"
      ],
      popular: true,
      cta: "Experimentar Profissional"
    },
    {
      name: "Premium (Corporativo)",
      price: "489",
      period: "mês",
      desc: "Excelente para centros automotivos, troca de óleo de escala e autocenters multiempresa.",
      features: [
        "Tudo do plano Profissional",
        "Módulo Multiempresa & White-Label",
        "IA Inteligente Ilimitada / Diagnósticos Integrados",
        "Assinatura Digital de OS via Link",
        "Disparo Automático de Alertas WhatsApp (Troca de Óleo)",
        "Fidelidade Cashback para Clientes",
        "Painel TV para sala de espera de Oficina",
        "Usuários Administrativos Ilimitados"
      ],
      popular: false,
      cta: "Falar com Consultor"
    }
  ];

  const faqs = [
    {
      q: "O ERP AutoTech funciona offline se minha internet cair?",
      a: "Sim! Desenvolvemos o sistema com tecnologia offline-first resiliente. Você pode continuar abrindo ordens de serviço e registrando vendas no PDV. Assim que a conexão for reestabelecida, os dados serão sincronizados de forma transparente e segura no Firebase."
    },
    {
      q: "Como funciona a sugestão de peças com Inteligência Artificial?",
      a: "O sistema conecta-se ao Gemini AI da Google. Ao preencher o problema relatado pelo cliente (ex: 'ruído metálico suspensão dianteira'), a IA analisa a compatibilidade do modelo de carro e sugere as peças exatas a serem substituídas da sua loja e os códigos de erro prováveis, diminuindo erros de diagnóstico em até 85%."
    },
    {
      q: "Posso gerenciar mais de uma unidade/filial no mesmo cadastro?",
      a: "Sim! Nosso plano Premium suporta multiempresa. Você pode monitorar faturamento consolidado, alternar estoques e emitir ordens de serviço de filiais distintas em um único painel administrativo central."
    },
    {
      q: "O disparo de lembretes no WhatsApp é automático mesmo?",
      a: "Correto! O sistema monitora a quilometragem média e a data da última troca de óleo ou revisão. Com base nisso, calcula preventivamente o período ideal e envia notificações automáticas via WhatsApp API estimulando o cliente a realizar o agendamento."
    }
  ];

  return (
    <div className="min-h-screen bg-[#060913] text-gray-100 flex flex-col font-sans">
      
      {/* 1. HEADER */}
      <header className="sticky top-0 z-50 bg-[#060913]/90 backdrop-blur-md border-b border-gray-800/80 px-4 py-3 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              <Wrench className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-display font-bold text-lg lg:text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                AUTO<span className="text-red-500">TECH</span>
              </span>
              <span className="block text-[9px] text-gray-500 font-mono tracking-widest uppercase">ERP Premium</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <a href="#beneficios" className="hover:text-red-400 transition-colors">Benefícios</a>
            <a href="#funcionalidades" className="hover:text-red-400 transition-colors">Funcionalidades</a>
            <a href="#planos" className="hover:text-red-400 transition-colors">Planos</a>
            <a href="#faq" className="hover:text-red-400 transition-colors">Perguntas</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={onEnterApp}
              className="text-sm font-semibold hover:text-white text-gray-300 px-4 py-2 hover:bg-white/15 rounded-lg transition-all cursor-pointer"
            >
              Acessar Painel
            </button>
            <button 
              onClick={onEnterDemo}
              className="px-4 py-2 text-xs lg:text-sm font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-[0_4px_14px_rgba(220,38,38,0.4)] glow-btn transition-all"
            >
              Fazer Demonstração Grátis
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button 
            className="md:hidden text-white hover:text-red-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[100%] left-0 w-full bg-[#080d1a] border-b border-gray-800/90 py-4 px-6 flex flex-col gap-4 shadow-xl">
            <a href="#beneficios" onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white">Benefícios</a>
            <a href="#funcionalidades" onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white">Funcionalidades</a>
            <a href="#planos" onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white">Planos</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white">Dúvidas</a>
            <div className="pt-2 border-t border-gray-800 flex flex-col gap-2">
              <button onClick={onEnterApp} className="w-full text-center text-sm py-2 bg-white/5 rounded-lg">Acessar Painel</button>
              <button onClick={onEnterDemo} className="w-full text-center text-sm py-2 bg-red-600 text-white rounded-lg font-bold">Teste Demonstrativo</button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 lg:px-8 border-b border-gray-900 bg-radial-[circle_at_bottom_left] from-red-950/15 via-[#060913] to-[#060913]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 self-center lg:self-start bg-red-950/40 border border-red-900/60 px-3 py-1 rounded-full text-xs text-red-400 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-red-500 animate-spin" />
              SaaS AUTOMOTIVO FUTURISTA COORDENADO POR IA
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight leading-none text-white">
              Acelere sua <span className="text-red-500">Loja de Peças</span> e <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Oficina Mecânica</span>
            </h1>

            <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              Gerencie ordens de serviço, estoque mínimo inteligente de componentes, faturamento diário com frente de caixa PDV premium e conte com diagnósticos preditivos impulsionados pela tecnologia Gemini AI da Google.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-2">
              <button 
                onClick={onEnterDemo}
                className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
              >
                <Play className="w-4  h-4 fill-white text-white" />
                Experimentar Versão Beta
              </button>
              <a 
                href="https://wa.me/5511987654321?text=Quero%20uma%20demonstracao%20do%20SaaS%20AutoTech"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-xl border border-gray-700 hover:border-green-500 text-gray-300 hover:text-green-400 flex items-center justify-center gap-2 transition-all font-semibold"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
                WhatsApp Consultor
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-900 max-w-md mx-auto lg:mx-0">
              <div>
                <span className="block text-2xl font-bold text-white font-display">+450</span>
                <span className="text-xs text-gray-500">Oficinas Ativas</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-white font-display">99.9%</span>
                <span className="text-xs text-gray-500">Sincronia Online</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-red-500 font-display">85%</span>
                <span className="text-xs text-gray-500">Tempo Salvo no Estoque</span>
              </div>
            </div>
          </div>

          {/* 3. HERO MOCKUP SCREEN */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-600/10 rounded-full blur-3xl"></div>
            
            <div className="w-full max-w-lg glass-panel p-2 rounded-2xl border border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-900 bg-gray-950/40 text-xs text-gray-500 font-mono">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
                <span className="ml-2 text-[10px] text-gray-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-red-500" />
                  AutoTech ERP // Painel Geral
                </span>
              </div>

              {/* Dashboard visual container mockup */}
              <div className="p-4 bg-[#0a0f1d] shrink-0 text-left">
                <div className="grid grid-cols-3 gap-2 [&>div]:p-2.5 [&>div]:rounded-lg [&>div]:border [&>div]:border-gray-800">
                  <div className="bg-[#0e162b]">
                    <span className="text-[9px] text-gray-500 block">Faturamento Diário</span>
                    <span className="text-sm font-bold text-white block">R$ 4.290,50</span>
                    <span className="text-[8px] text-green-500 block">✦ +12% vs ontem</span>
                  </div>
                  <div className="bg-[#0e162b]">
                    <span className="text-[9px] text-gray-500 block">OS no Pátio</span>
                    <span className="text-sm font-bold text-red-400 block">8 Ativas</span>
                    <span className="text-[8px] text-gray-500 block">3 Aguardando peças</span>
                  </div>
                  <div className="bg-[#0e162b] border-red-950">
                    <span className="text-[9px] text-red-400 block flex items-center gap-1 font-semibold">
                      <ShieldAlert className="w-2.5 h-2.5 text-red-500 animate-bounce" /> Sub-Estoque
                    </span>
                    <span className="text-sm font-bold text-red-500 block">3 Produtos</span>
                    <span className="text-[8px] text-red-400 block">Alerta de ressuprimento</span>
                  </div>
                </div>

                {/* Gemini AI mock interface in Hero */}
                <div className="mt-4 p-3 rounded-xl border border-red-500/10 bg-red-950/10 flex flex-col gap-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-red-400 font-mono flex items-center gap-1 font-semibold">
                      <Cpu className="w-3.5 h-3.5 text-red-500 animate-spin" />
                      Gemini Auto-Diagnose
                    </span>
                    <span className="text-[8px] text-gray-500 font-mono">100% Compatível</span>
                  </div>
                  <div className="text-[10px] text-gray-300 italic bg-gray-950/40 p-2 rounded border border-gray-900 leading-tight">
                    "Identificamos folga na barra estabilizadora e pastilha de freio gasta. Recomendado substituir kit coifa + buchas traseiras."
                  </div>
                </div>
                
                {/* Button Mock */}
                <div className="mt-4 flex justify-between items-center bg-[#0d1428] rounded-xl p-2.5 py-1.5 border border-gray-800">
                  <span className="text-[10px] text-gray-400 font-mono">PDV Frente de Caixa</span>
                  <div className="px-2.5 py-1 bg-red-600 rounded text-[9px] font-bold">CAIXA ABERTO</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BENEFÍCIOS SECTION */}
      <section id="beneficios" className="py-20 px-4 lg:px-8 bg-[#090d19] border-b border-gray-900">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-3">
            <span className="text-red-500 font-mono text-xs tracking-widest font-semibold uppercase">BENEFÍCIOS DE ENGENHARIAL</span>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-white">
              Sua oficina transformada em um Centro de Alta Performance
            </h2>
            <p className="text-gray-400 text-sm">
              Chega de planilhas desatualizadas e rasuras em papéis. Controle completo da recepção até a emissão da nota e saída do carro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="p-6 bg-[#0c1223] rounded-2xl border border-gray-800/80 hover:border-red-900/40 group transition-all">
              <div className="w-12 h-12 rounded-xl bg-red-600/15 text-red-500 flex items-center justify-center mb-6 border border-red-900/30 group-hover:scale-110 transition-all">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-display mb-2">Controle Financeiro Total</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Relatórios detalhados de contas a pagar, comissões de mecânicos integradas, fluxo de caixa diário e faturamento consolidado por filial.
              </p>
            </div>

            <div className="p-6 bg-[#0c1223] rounded-2xl border border-gray-800/80 hover:border-red-900/40 group transition-all">
              <div className="w-12 h-12 rounded-xl bg-red-600/15 text-red-500 flex items-center justify-center mb-6 border border-red-900/30 group-hover:scale-110 transition-all">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-display mb-2">Automação Inteligente</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Diagnóstico inteligente Gemini, geração instantânea de textos para aprovação de orçamentos via WhatsApp e faturas simplificadas.
              </p>
            </div>

            <div className="p-6 bg-[#0c1223] rounded-2xl border border-gray-800/80 hover:border-red-900/40 group transition-all">
              <div className="w-12 h-12 rounded-xl bg-red-600/15 text-red-500 flex items-center justify-center mb-6 border border-red-900/30 group-hover:scale-110 transition-all">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-display mb-2">Estoque Inteligente</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Sinais automáticos de estoque abaixo do mínimo. Compatibilidade de produtos entre montadoras e marcas de peças para compras mais assertivas.
              </p>
            </div>

            <div className="p-6 bg-[#0c1223] rounded-2xl border border-gray-800/80 hover:border-red-900/40 group transition-all">
              <div className="w-12 h-12 rounded-xl bg-red-600/15 text-red-500 flex items-center justify-center mb-6 border border-red-900/30 group-hover:scale-110 transition-all">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white font-display mb-2">PDV Frente de Caixa</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Venda de balcão de forma ultra rápida com suporte a scanner de código de barras, PIX QR Code integrado e relatórios de comissionamento de balconistas.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FUNCIONALIDADES DETALHADAS */}
      <section id="funcionalidades" className="py-20 px-4 lg:px-8 bg-[#060913] border-b border-gray-900">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-12 text-center mb-10 flex flex-col gap-3">
              <span className="text-red-500 font-mono text-xs tracking-widest font-semibold uppercase">ECSSISTEMA ERP DE PONTA</span>
              <h2 className="text-2xl sm:text-4xl font-display font-bold text-white">Desenvolvido sob Medida para Mecânica Moderna</h2>
            </div>

            {/* Feature row 1 */}
            <div className="lg:col-span-6 flex flex-col gap-5 text-left">
              <div className="w-10 h-10 rounded-lg bg-red-600/15 flex items-center justify-center border border-red-950">
                <CheckCircle2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-white">Ordem de Serviço (OS) com checklist digital integrado</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Acompanhe o status físico do veículo pela oficina. Desde o checklist rigoroso de entrada (fluido de freio, pneus, bateria), tirando fotos direto do celular para documentar o estado do automóvel, até a assinatura eletrônica do cliente.
              </p>
              <ul className="flex flex-col gap-2 text-sm text-gray-300 font-mono">
                <li className="flex items-center gap-2">✔️ Status visíveis: Em análise, Aguardando peça, Finalizada</li>
                <li className="flex items-center gap-2">✔️ Compartilhamento e Aprovação via link do WhatsApp</li>
                <li className="flex items-center gap-2">✔️ Histórico do veículo vitalício amarrado à placa</li>
              </ul>
            </div>

            <div className="lg:col-span-6 bg-[#0b0f19] p-4 rounded-xl border border-gray-800 relative">
              {/* Checklist Visual Mock */}
              <div className="flex flex-col gap-2 p-3 bg-slate-950/50 rounded-lg text-xs">
                <span className="font-bold text-white border-b border-gray-900 pb-1.5 block">CHECKLIST DE RECEPÇÃO VEICULAR</span>
                <div className="flex items-center justify-between text-green-400">
                  <span>🟢 Luzes e Lanternas Traseiras</span>
                  <span className="font-mono bg-green-950/40 px-1 border border-green-900 rounded">OK</span>
                </div>
                <div className="flex items-center justify-between text-red-400">
                  <span>🔴 Espessura da Pastilha de Freio Dianteiro</span>
                  <span className="font-mono bg-red-950/40 px-1 border border-red-900 rounded">REPROVADO</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>⚪ Alinhamento e Balanceamento das Rodas</span>
                  <span className="font-mono bg-gray-900 px-1 rounded">N/A</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. PLANOS */}
      <section id="planos" className="py-20 px-4 lg:px-8 bg-[#090d19] border-b border-gray-900">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-3">
            <span className="text-red-500 font-mono text-xs tracking-widest font-semibold uppercase">TABELA DE PREÇOS TRANSPARENTE</span>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-white">Preços escaláveis para o seu tamanho</h2>
            <p className="text-gray-400 text-sm">
              Sem taxas ocultas, cancele quando quiser. Escolha o plano que melhor se adequa à realidade financeira da sua operação.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((p, idx) => (
              <div 
                key={idx}
                className={`p-8 bg-[#0c1223] rounded-2xl border transition-all flex flex-col justify-between ${
                  p.popular 
                    ? 'border-red-500 shadow-[0_5px_22px_rgba(239,68,68,0.2)] lg:scale-[1.03] scale-100 z-10' 
                    : 'border-gray-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold font-display text-white">{p.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
                    </div>
                    {p.popular && (
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase font-mono tracking-wider animate-bounce">
                        Mais Vendido
                      </span>
                    )}
                  </div>

                  <div className="my-6">
                    <span className="text-4xl font-extrabold text-white font-display">R$ {p.price}</span>
                    <span className="text-gray-500 text-xs ml-1">/ {p.period}</span>
                  </div>

                  <ul className="flex flex-col gap-3 border-t border-gray-800/80 pt-6">
                    {p.features.map((f, fIdx) => (
                      <li key={fIdx} className="text-xs sm:text-sm text-gray-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800/40">
                  <button 
                    onClick={onEnterDemo}
                    className={`w-full py-3 px-4 rounded-xl font-bold transition-all text-sm cursor-pointer ${
                      p.popular 
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-950/40' 
                        : 'border border-gray-700 hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    {p.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. DEPOIMENTOS */}
      <section className="py-20 px-4 lg:px-8 bg-[#060913] border-b border-gray-900">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-3">
            <span className="text-red-500 font-mono text-xs tracking-widest font-semibold uppercase">CLIENTES REAIS</span>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-white">Quem usa, aprova e recomenda</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 bg-[#0c1223] rounded-2xl border border-gray-800/60 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-sm">
                  JD
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Juliano Dias</h4>
                  <span className="text-[10px] text-gray-500 block">Proprietário da Dias Autocenter</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 italic leading-relaxed">
                "Uso o ERP AutoTech há 4 meses e a rotina da oficina mudou por completo. A facilidade do checklist de entrada e o PDV rápido poupam muitas horas de retrabalho todos os dias."
              </p>
            </div>

            <div className="p-6 bg-[#0c1223] rounded-2xl border border-gray-800/60 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[#ef4444] text-sm">
                  AM
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Adauto Medina</h4>
                  <span className="text-[10px] text-gray-500 block">Gerente da Auto Peças Importcar</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 italic leading-relaxed">
                "O controle de estoque inteligente com alerta de quantidade mínima evitou que perdêssemos vendas de pastilhas e filtros. A integração Gemini AI para sugerir marcas é fenomenal."
              </p>
            </div>

            <div className="p-6 bg-[#0c1223] rounded-2xl border border-gray-800/60 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-sm">
                  CS
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Camila Severo</h4>
                  <span className="text-[10px] text-gray-500 block">Troca de Óleo LubriCheck</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 italic leading-relaxed">
                "Os lembretes do WhatsApp de troca de óleo automática aumentaram em 35% nosso retorno de clientes. Eles recebem o alerta, clicam e fazem um agendamento rápido."
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="py-20 px-4 lg:px-8 bg-[#090d19] border-b border-gray-900">
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-16 flex flex-col gap-3">
            <span className="text-red-500 font-mono text-xs tracking-widest font-semibold uppercase">SUPORTE E PERGUNTAS</span>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-white">Perguntas Frequentes</h2>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, fIdx) => (
              <div 
                key={fIdx}
                className="bg-[#0c1223] rounded-xl border border-gray-800/80 overflow-hidden text-left transition-all"
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === fIdx ? null : fIdx)}
                  className="w-full flex justify-between items-center px-6 py-4 text-sm sm:text-base font-bold text-white hover:text-red-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeFaq === fIdx ? 'rotate-180 text-red-500' : 'text-gray-500'}`} />
                </button>
                {activeFaq === fIdx && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-400 border-t border-gray-900 leading-relaxed bg-[#0b0f19]/30">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-[#04060c] pt-16 pb-8 px-4 lg:px-8 border-t border-gray-950 text-gray-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-base lg:text-lg tracking-tight text-white">
                AUTO<span className="text-red-500">TECH</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm">
              Plataforma completa de ERP automotivo gerido de forma inteligente para sua oficina faturar mais e eliminar gargalos. Versão certificada para revendedores autorizados.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono mb-4">Navegação</h5>
            <ul className="flex flex-col gap-2 text-xs">
              <li><a href="#beneficios" className="hover:text-gray-300">Benefícios</a></li>
              <li><a href="#funcionalidades" className="hover:text-gray-300">Funcionalidades</a></li>
              <li><a href="#planos" className="hover:text-gray-300">Planos de Assinatura</a></li>
              <li><a href="#faq" className="hover:text-gray-300">Dúvidas Frequentes</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono mb-4">Contato & Suporte</h5>
            <ul className="flex flex-col gap-2 text-xs font-mono">
              <li>✉️ suporte@autotecherp.com.br</li>
              <li>📞 (11) 4004-9883 - Suporte 24h</li>
              <li>💬 Atendimento WhatsApp integrado</li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono mb-4">Pronto para acelerar?</h5>
            <button 
              onClick={onEnterDemo}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs rounded-lg font-bold"
            >
              INICIAR AUTO-TESTE
            </button>
            <span className="text-[10px] text-gray-600 block text-center">Incluso banco de dados teste.</span>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-900/60 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <span>&copy; 2026 AutoTech Premium ERP Sistemas Ltda. Todos os direitos reservados. CNPJ 12.345.678/0001-90.</span>
          <div className="flex gap-4">
            <span className="hover:text-gray-400 cursor-pointer">Termos de Uso</span>
            <span className="hover:text-gray-400 cursor-pointer">Política de Privacidade</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
