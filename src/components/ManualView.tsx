import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Award, 
  Sparkles, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  HelpCircle,
  Wrench,
  Package,
  ShoppingBag,
  DollarSign,
  Cpu,
  Bookmark,
  TrendingUp,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ProcedureStep {
  title: string;
  description: string;
  tip?: string;
}

interface Chapter {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  category: 'Operação' | 'Estoque' | 'Financeiro' | 'IA & Suporte';
  durationMin: number;
  steps: ProcedureStep[];
  simulatorTitle: string;
  simulatorTask: string;
  simulatorPlaceholder: string;
  simulatorTargetValue: string;
  successMessage: string;
}

export const ManualView: React.FC = () => {
  const { ordensServico, produtos, financeiro } = useApp();
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [simState, setSimState] = useState<{
    inputVal: string;
    stage: 'idle' | 'success' | 'error';
    feedback: string;
    score: number;
  }>({
    inputVal: '',
    stage: 'idle',
    feedback: '',
    score: 0
  });

  // Load manual stats from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('autotech_completed_manual_chapters');
    if (saved) {
      try {
        setCompletedChapters(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar progresso do manual", e);
      }
    }
    const savedScore = localStorage.getItem('autotech_manual_simulator_score');
    if (savedScore) {
      setSimState(prev => ({ ...prev, score: Number(savedScore) }));
    }
  }, []);

  const chapters: Chapter[] = [
    {
      id: 'chapter-os',
      icon: Wrench,
      title: 'Abertura & Gestão de Ordens de Serviço',
      subtitle: 'Aprenda a cadastrar orçamentos, aprovar serviços e atualizar o status mecânico.',
      category: 'Operação',
      durationMin: 5,
      steps: [
        {
          title: 'Vincular Cliente e Veículo',
          description: 'Acesse o menu CRM ou o atalho de nova OS. Encontre o cliente pelo nome ou placa do veículo correspondente cadastrado.',
          tip: 'Cadastre sempre o veículo antes com placa e modelo válidos para evitar inconsistências nos relatórios.'
        },
        {
          title: 'Adicionar Peças e Serviços executados',
          description: 'No formulário de OS, adicione os produtos/peças do estoque e especifique a mão de obra mecânica com os valores unitários pactuados.',
          tip: 'Não se preocupe: as peças utilizadas darão baixa automática do estoque assim que a OS for salva com sucesso!'
        },
        {
          title: 'Ciclo de Status da Oficina',
          description: 'O fluxo de trabalho padrão compreende os status: Aberta (Orçamento), Em análise, Aguardando peça, Em execução e Finalizada.',
          tip: 'Utilize o menu de atualização rápida na grade de OS para mudar o status sem precisar abrir a tela de edição.'
        }
      ],
      simulatorTitle: 'Simulador Mecânico: Atualizar Placa da OS',
      simulatorTask: 'Digite o status exato "Em execução" para simular a mudança de fase ativa da oficina para a OS #102:',
      simulatorPlaceholder: 'Digite: Em execução',
      simulatorTargetValue: 'Em execução',
      successMessage: 'Excelente! A OS avançou na linha de produção da oficina e gerou um log de auditoria automática.'
    },
    {
      id: 'chapter-stock',
      icon: Package,
      title: 'Controle de Estoque & Reposição Crítica',
      subtitle: 'Como gerenciar o estoque mínimo de peças e realizar entrada por arquivos XML/CSV.',
      category: 'Estoque',
      durationMin: 4,
      steps: [
        {
          title: 'Configurar Alerta de Estoque Mínimo',
          description: 'Ao cadastrar ou editar uma peça, configure o campo "Estoque Mínimo". Quando o estoque atual atingir ou ficar abaixo desse número, um alerta crítico será gerado.',
          tip: 'O painel administrativo possui um bento card com Alertas de Reposição Crítica que avisa sobre os desfalques.'
        },
        {
          title: 'Importar Notas Fiscais (NF-e via XML)',
          description: 'Evite digitação manual enfadonha. Faça o upload do arquivo XML da NF de compra do fornecedor para importar dezenas de peças com SKU e preço de custo originais de uma só vez.',
          tip: 'Verifique no resumo os preços de venda calculados de acordo com a margem configurada antes de confirmar a gravação.'
        },
        {
          title: 'Conferência Física e Ajustes',
          description: 'Utilize o Histórico de Auditoria para fiscalizar movimentações manuais e garantir que desvios não ocorram.',
          tip: 'Toda exclusão de peça do faturamento ou catálogo exige agora confirmação pelo modal interativo de segurança.'
        }
      ],
      simulatorTitle: 'Simulador de Reposição: Cadastrar Estoque Mínimo',
      simulatorTask: 'Digite um limite mínimo de segurança ideal "5" para as pastilhas para receber o alerta automático de perigo:',
      simulatorPlaceholder: 'Digite: 5',
      simulatorTargetValue: '5',
      successMessage: 'Correto! Agora o painel consolidará esta pastilha na lista de atenção imediata quando ela cair abaixo dessa quantidade.'
    },
    {
      id: 'chapter-pdv',
      icon: ShoppingBag,
      title: 'Operação de Caixa e Frente de Loja (PDV)',
      subtitle: 'Instruções para realizar vendas diretas no balcão e gerenciar a abertura e fechamento de fluxo.',
      category: 'Operação',
      durationMin: 4,
      steps: [
        {
          title: 'Iniciar o Dia com Fundo de Troco',
          description: 'Antes de realizar vendas, abra o caixa informando o valor do saldo inicial em dinheiro (fundo de troco). Isso assegura o controle rigoroso da movimentação física.',
          tip: 'A abertura do caixa fica gravada no histórico de auditoria para o administrador central da oficina.'
        },
        {
          title: 'Registrar Venda Direta (Balcão)',
          description: 'Adicione múltiplos itens na cesta do PDV, selecione a forma de pagamento (Dinheiro, PIX, Cartão de Crédito ou Débito) e confirme. Se houver OS associada, vincule-a para mudar seu status para entregue.',
          tip: 'Ao vender itens, o total é somado ao caixa físico e uma receita correspondente é criada de forma síncrona no financeiro.'
        },
        {
          title: 'Conclusão e Fechamento',
          description: 'No fim do expediente, acesse o painel do caixa, faça a contagem dos valores e execute o comando de fechamento. Divergências serão apontadas automaticamente.',
          tip: 'Um e-mail opcional ou relatório impresso pode ser copiado com o resumo do dia.'
        }
      ],
      simulatorTitle: 'Simulador Financeiro: Registrar Tipo de Pagamento',
      simulatorTask: 'Digite "PIX" para escolher a forma de pagamento recomendada de maior liquidez imediata no PDV:',
      simulatorPlaceholder: 'Digite: PIX',
      simulatorTargetValue: 'PIX',
      successMessage: 'Perfeito! Pagamentos via PIX caem instantaneamente, eliminando taxa de antecipação do cartão.'
    },
    {
      id: 'chapter-finance',
      icon: DollarSign,
      title: 'Fluxo Financeiro & Relatórios DRE',
      subtitle: 'Entenda como as contas a pagar, receitas do pátio e faturamento rápido geram a saúde financeira.',
      category: 'Financeiro',
      durationMin: 6,
      steps: [
        {
          title: 'Lançamentos de Receitas e Despesas',
          description: 'Classifique cada movimentação manual em categorias adequadas (Aluguel, Energia, Pro-labore, Ferramental, etc.).',
          tip: 'Cada registro altera em tempo real o lucro acumulado exposto no dashboard geral.'
        },
        {
          title: 'Análise de Lucratividade',
          description: 'Acompanhe o balanço geral dividindo as receitas mecânicas das peças do estoque. A margem sobre peças é um dos maiores vetores de faturamento.',
          tip: 'Faturamento bruto alto sem controle operacional de despesas é ilusão. Controle a inadimplência atualizando o status dos pagamentos.'
        }
      ],
      simulatorTitle: 'Simulador Financeiro: Lançar Receita de Serviço',
      simulatorTask: 'Escreva a palavra "Receita" para indicar a entrada de um saldo bruto na contabilidade mecânica:',
      simulatorPlaceholder: 'Digite: Receita',
      simulatorTargetValue: 'Receita',
      successMessage: 'Excelente! Receitas robustecem o fluxo de caixa, enquanto taxas e tributações são classificadas sob despesas.'
    },
    {
      id: 'chapter-ai',
      icon: Cpu,
      title: 'Uso do Assistente Mecânico CoPilot Gemini',
      subtitle: 'Como as consultas de tabelas técnicas, OBD-II e diagnósticos automatizados economizam tempo.',
      category: 'IA & Suporte',
      durationMin: 3,
      steps: [
        {
          title: 'Acionar a Inteligência no Painel Lateral',
          description: 'Clique no botão vermelho do cabeçalho "Assistente Mecânico CoPilot". O painel lateral se abrirá instantaneamente sem recarregar a sua página.',
          tip: 'O CoPilot é alimentado pela API do Google Gemini, oferecendo dados originais e precisos.'
        },
        {
          title: 'Fazer Perguntas Extremamente Específicas',
          description: 'Consulte especificações como torque de parafusos de cabeçote (ex: Honda Civic LXR 2.0 2016), códigos de erro OBD-II (ex: P0300) ou diagramas de correias.',
          tip: 'Diga à IA qual o veículo em atendimento para receber especificações sob medida.'
        },
        {
          title: 'Modelos de Mensagens para Clientes',
          description: 'Converta orçamentos em avisos persuasivos. Peça ao CoPilot para redigir mensagens profissionais de aprovação ou cobrança via WhatsApp.',
          tip: 'Copie e envie diretamente para aumentar a taxa de conversão em até 30%.'
        }
      ],
      simulatorTitle: 'Simulador de IA: Solicitar Código OBD-II',
      simulatorTask: 'Digite o código de falha crítico de ignição irregular "P0300" para simular a requisição de diagnóstico:',
      simulatorPlaceholder: 'Digite: P0300',
      simulatorTargetValue: 'P0300',
      successMessage: 'Genial! A IA identificaria falha de falecimento numa vela de ignição, bobina ou injetores automaticamente.'
    }
  ];

  // Search filter
  const filteredChapters = chapters.filter(c => {
    const q = searchQuery.toLowerCase();
    return c.title.toLowerCase().includes(q) || 
           c.subtitle.toLowerCase().includes(q) || 
           c.category.toLowerCase().includes(q) ||
           c.steps.some(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  });

  const activeChapter = chapters[activeChapterIndex] || chapters[0];

  const handleSimInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (simState.inputVal.trim().toLowerCase() === activeChapter.simulatorTargetValue.toLowerCase()) {
      const isNewlyCompleted = !completedChapters.includes(activeChapter.id);
      let updatedCompleted = [...completedChapters];
      if (isNewlyCompleted) {
        updatedCompleted.push(activeChapter.id);
        setCompletedChapters(updatedCompleted);
        localStorage.setItem('autotech_completed_manual_chapters', JSON.stringify(updatedCompleted));
      }

      const newScore = simState.score + (isNewlyCompleted ? 100 : 20);
      setSimState(prev => ({
        ...prev,
        stage: 'success',
        feedback: activeChapter.successMessage,
        score: newScore
      }));
      localStorage.setItem('autotech_manual_simulator_score', String(newScore));
    } else {
      setSimState(prev => ({
        ...prev,
        stage: 'error',
        feedback: `Ops! Resposta incorreta. Escreva exatamente: "${activeChapter.simulatorTargetValue}"`
      }));
    }
  };

  const handleNextChapter = () => {
    if (activeChapterIndex < chapters.length - 1) {
      setActiveChapterIndex(activeChapterIndex + 1);
      // Reset simulator panel
      setSimState(prev => ({ ...prev, inputVal: '', stage: 'idle', feedback: '' }));
    }
  };

  const handlePrevChapter = () => {
    if (activeChapterIndex > 0) {
      setActiveChapterIndex(activeChapterIndex - 1);
      // Reset simulator panel
      setSimState(prev => ({ ...prev, inputVal: '', stage: 'idle', feedback: '' }));
    }
  };

  const resetAllProgress = () => {
    if (confirm("Deseja realmente limpar seu progresso de aprendizado e pontos acumulados no simulador?")) {
      setCompletedChapters([]);
      localStorage.removeItem('autotech_completed_manual_chapters');
      setSimState({ inputVal: '', stage: 'idle', feedback: '', score: 0 });
      localStorage.removeItem('autotech_manual_simulator_score');
    }
  };

  // Calculations
  const calculatedProgressPercent = Math.round((completedChapters.length / chapters.length) * 100);

  return (
    <div className="flex flex-col gap-6 text-gray-100 font-sans pb-12">
      
      {/* HEADER SECTION WITH METRICS AND BADGE */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 bg-gradient-to-r from-[#0c1223] via-[#0e172a] to-[#0c1223] border border-gray-800 rounded-3xl gap-4 shadow-xl">
        <div className="flex items-center gap-3.5 text-left">
          <div className="p-3 bg-red-950/25 text-red-500 border border-red-900/35 rounded-2xl">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest block">AMBIENTE DE CAPACITAÇÃO EBOOK</span>
            <h2 className="text-xl font-display font-extrabold text-white mt-0.5">Manual Interativo do Sistema AutoTech</h2>
            <p className="text-xs text-gray-400">Aprenda a operar os recursos mais avançados da sua oficina mecânica e faturamento rápido.</p>
          </div>
        </div>

        {/* Dynamic Mastery Badge */}
        <div className="flex items-center gap-4 bg-[#050912]/80 border border-gray-900 px-5 py-3 rounded-2xl w-full lg:w-auto shrink-0 justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-orange-950/20 text-orange-500 border border-orange-900/20">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-left font-mono">
              <span className="text-[9px] text-gray-500 block uppercase">SISTEMA APRENDIDO</span>
              <span className="text-sm font-bold text-white block">{calculatedProgressPercent}% Completo</span>
            </div>
          </div>
          
          <div className="text-right font-mono">
            <span className="text-[9px] text-gray-500 block uppercase">PONTOS DO SIMULADOR</span>
            <span className="text-sm font-bold text-orange-400 block">{simState.score} XP</span>
          </div>
        </div>
      </div>

      {/* CORE WORKSPACE GRID Layout: Chapters list combined with active reading panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: NAVIGATION DRAWER OF CHAPTERS & SEARCH */}
        <div className="xl:col-span-4 flex flex-col gap-4 text-left">
          
          {/* Search Box Card */}
          <div className="bg-[#0c1223] border border-gray-800 p-4 rounded-2xl flex flex-col gap-3">
            <span className="text-[10px] font-mono text-gray-450 text-gray-500 uppercase tracking-wider font-extrabold">Busca no Manual</span>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: estoque mínimo, XML, OS..."
                className="w-full bg-[#050810] border border-gray-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          {/* Chapters List */}
          <div className="bg-[#0c1223] border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-[#0a1020] border-b border-gray-850 flex justify-between items-center">
              <span className="text-[10px] font-mono text-white tracking-widest font-bold">CONTEÚDO PROGRAMÁTICO</span>
              {completedChapters.length > 0 && (
                <button 
                  onClick={resetAllProgress}
                  className="flex items-center gap-1 text-[9px] font-mono text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Resgatar progresso para zero"
                >
                  <RotateCcw className="w-3 h-3" /> Limpar Progresso
                </button>
              )}
            </div>

            <div className="flex flex-col p-2 max-h-[450px] overflow-y-auto gap-1 divide-y divide-gray-900/40">
              {filteredChapters.map((ch, index) => {
                const isChapterCompleted = completedChapters.includes(ch.id);
                // Discover original overall index in chapters list
                const originalIndex = chapters.findIndex(c => c.id === ch.id);
                const isSelected = activeChapter.id === ch.id;
                
                return (
                  <button
                    key={ch.id}
                    id={`manual-chapter-tab-${ch.id}`}
                    onClick={() => {
                      setActiveChapterIndex(originalIndex);
                      setSimState(prev => ({ ...prev, inputVal: '', stage: 'idle', feedback: '' }));
                    }}
                    className={`w-full p-3.5 rounded-xl transition-all flex justify-between items-center text-left gap-3 border outline-none ${
                      isSelected 
                        ? 'bg-red-950/10 border-red-900/30 text-white' 
                        : 'bg-transparent border-transparent text-gray-450 hover:bg-[#070c17]/60 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-lg mt-0.5 ${
                        isSelected 
                          ? 'bg-red-500/15 text-red-500' 
                          : 'bg-gray-950/40 text-gray-500 group-hover:text-gray-300'
                      }`}>
                        <ch.icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-gray-500">Capítulo {originalIndex + 1} • {ch.durationMin} min</span>
                        <span className="text-xs font-bold leading-tight mt-0.5">{ch.title}</span>
                      </div>
                    </div>

                    {isChapterCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <Bookmark className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? 'text-red-900' : 'text-gray-800'}`} />
                    )}
                  </button>
                );
              })}

              {filteredChapters.length === 0 && (
                <div className="text-center py-12 text-xs text-gray-500 italic">
                  Nenhum procedimento encontrado para o termo pesquisado.
                </div>
              )}
            </div>

            <div className="p-3 bg-[#060a16] border-t border-gray-850">
              <div className="flex justify-between text-[11px] font-mono text-gray-500 mb-1.5 px-1">
                <span>Leitura Realizada</span>
                <span>{calculatedProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-650 to-orange-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${calculatedProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Shortcuts helpful box */}
          <div className="bg-[#0c1223] border border-gray-800 p-4 rounded-2xl flex flex-col gap-3 font-mono text-[11px]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-extrabold block">Atalhos Operacionais Rápidos</span>
            <div className="flex flex-col gap-1.5 text-gray-400">
              <div className="flex justify-between border-b border-gray-900 pb-1.5">
                <span>Adicionar Peça</span>
                <span className="text-[10px] text-red-400">Estoque de Peças</span>
              </div>
              <div className="flex justify-between border-b border-gray-900 pb-1.5">
                <span>Abrir Frente PDV</span>
                <span className="text-[10px] text-blue-450 text-blue-400">PDV Loja & Oficina</span>
              </div>
              <div className="flex justify-between">
                <span>Consultar CoPilot</span>
                <span className="text-[10px] text-orange-400 animate-pulse">Assistente CoPilot</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: ACTIVE READING BOOK CONTENT PANEL */}
        <div className="xl:col-span-8 flex flex-col gap-6 text-left">
          
          {/* Interactive E-Book Main Container Sheet */}
          <div className="bg-[#0c1223] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-80 h-80 bg-red-800/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-700/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Ebook Top Bar / Meta info */}
            <div className="p-5 bg-[#0a1020] border-b border-gray-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10 font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-gray-900 text-slate-400 text-[10px] font-bold uppercase border border-gray-800">
                  {activeChapter.category}
                </span>
                <span className="text-xs text-gray-500 font-bold">•</span>
                <span className="text-xs text-gray-400">Tempo de Estudo: ~{activeChapter.durationMin} min</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Lendo capítulo</span>
                <strong className="text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {chapters.findIndex(c => c.id === activeChapter.id) + 1} de {chapters.length}
                </strong>
              </div>
            </div>

            {/* Ebook Chapter Title Frame */}
            <div className="p-6 lg:p-8 border-b border-gray-850/60 relative z-10">
              <h1 className="text-xl lg:text-2xl font-display font-black text-white tracking-tight">
                {activeChapter.title}
              </h1>
              <p className="text-sm text-gray-400 mt-2 font-sans font-medium max-w-2xl leading-relaxed">
                {activeChapter.subtitle}
              </p>
            </div>

            {/* Procedural Process Timeline List */}
            <div className="p-6 lg:p-8 flex flex-col gap-8 relative z-10">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block -mb-2 font-extrabold">PROCEDIMENTO COMPLETO PASSO A PASSO</span>

              <div className="flex flex-col gap-6 relative before:absolute before:top-2 before:bottom-2 before:left-[15px] sm:before:left-[23px] before:w-[1px] before:bg-gray-800">
                {activeChapter.steps.map((st, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex gap-4 sm:gap-6 items-start relative group"
                  >
                    {/* Circle Indicator Index */}
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-[#050912] border border-gray-800 flex items-center justify-center shrink-0 font-mono text-xs text-white font-extrabold group-hover:border-red-500/40 group-hover:text-red-400 transition-all shadow-inner relative z-10">
                      {(index + 1).toString().padStart(2, '0')}
                    </div>

                    <div className="flex flex-col text-left gap-1 mt-0.5 sm:mt-1.5">
                      <h3 className="text-sm font-bold text-white leading-tight font-sans tracking-tight">
                        {st.title}
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">
                        {st.description}
                      </p>

                      {st.tip && (
                        <div className="mt-1.5 text-[10.5px] text-orange-400 font-mono font-medium flex gap-1.5 items-center bg-orange-950/10 border border-orange-900/10 py-1.5 px-3 rounded-lg max-w-xl">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Dica Técnica: {st.tip}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* INTERACTIVE SIMULATOR PLAYGROUND COMPONENT */}
            <div className="m-6 lg:m-8 p-5 rounded-2xl bg-gradient-to-br from-[#050810] to-[#080d19] border border-gray-850 text-left flex flex-col gap-4 relative">
              <div className="flex justify-between items-center border-b border-gray-900 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[10px] font-mono text-white tracking-widest font-extrabold">PRÁTICA NO SIMULADOR</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-orange-950/40 text-orange-400 border border-orange-900/40 text-[9px] font-mono font-bold animate-pulse">
                  +100 XP DE MASTERY
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white font-sans">{activeChapter.simulatorTitle}</h4>
                <p className="text-[11px] text-gray-400 font-mono leading-relaxed mt-1.5">{activeChapter.simulatorTask}</p>
              </div>

              {/* Simulation input form */}
              <form onSubmit={handleSimInputSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-grow">
                  <input
                    type="text"
                    value={simState.inputVal}
                    onChange={(e) => setSimState(prev => ({ ...prev, inputVal: e.target.value }))}
                    disabled={simState.stage === 'success'}
                    placeholder={activeChapter.simulatorPlaceholder}
                    className="w-full bg-[#03050a] border border-gray-800 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-700 font-mono focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-950 disabled:opacity-50 transition-all/colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={simState.stage === 'success'}
                  className="py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-[#070c17] disabled:text-gray-600 text-white font-mono text-[10.5px] uppercase font-extrabold rounded-xl transition-all cursor-pointer shadow flex items-center justify-center gap-1.5 group font-bold"
                >
                  <Play className="w-3.5 h-3.5 text-white/90 group-hover:scale-110 transition-transform" /> Validar Ação
                </button>
              </form>

              {/* Simulation feedback indicator block */}
              <AnimatePresence mode="wait">
                {simState.stage === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="p-3 bg-green-950/20 border border-green-900/35 text-green-400 text-xs rounded-xl flex items-start gap-2 animate-bounce"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>Parabéns! Procedimento Correto.</strong>
                      <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{simState.feedback}</p>
                    </div>
                  </motion.div>
                )}

                {simState.stage === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-red-950/25 border border-red-900/30 text-red-400 text-xs rounded-xl flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5 animate-bounce" />
                    <span>{simState.feedback}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Ebook Reader Navigation control bar footer */}
            <div className="p-4 bg-[#0a1020] border-t border-gray-850 flex justify-between items-center relative z-10">
              <button
                type="button"
                onClick={handlePrevChapter}
                disabled={activeChapterIndex === 0}
                className="py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-gray-400 hover:text-white font-mono text-[10px] uppercase font-bold border border-gray-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Anterior
              </button>

              {/* Display Reading Complete check */}
              {completedChapters.includes(activeChapter.id) ? (
                <span className="text-[10px] font-mono text-green-400 font-bold bg-green-950/25 border border-green-900/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> CAPÍTULO CONCLUÍDO
                </span>
              ) : (
                <span className="text-[10.5px] font-mono text-gray-500 shrink">
                  Complete o simulador acima para marcar progresso
                </span>
              )}

              {activeChapterIndex < chapters.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNextChapter}
                  className="py-2 px-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-mono text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer shadow shadow-red-950/40 transition-all hover:translate-x-0.5 font-bold"
                >
                  Próximo <ChevronRight className="w-3.5 h-3.5 text-white/90" />
                </button>
              ) : (
                <div className="text-[10.5px] font-mono font-bold text-orange-400 bg-orange-950/30 border border-orange-900/40 px-3 py-2 rounded-xl animate-pulse flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> MASTERY COMPLETA!
                </div>
              )}
            </div>

          </div>

          {/* Quick FAQ Interactive Section explaining system features */}
          <div className="bg-[#0c1223] border border-gray-800 rounded-3xl p-6 text-left relative overflow-hidden">
            <h3 className="font-display font-extrabold text-base text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-red-500" /> FAQ: Central de Procedimentos & Dúvidas Frequentes
            </h3>
            <p className="text-xs text-slate-450 text-gray-450 font-mono mt-1">Clique para conferir as soluções dos problemas mecânicos e operacionais do pátio.</p>

            <div className="mt-4 flex flex-col gap-3">
              <details className="bg-[#070c17]/65 border border-gray-900/30 rounded-xl p-3.5 font-sans text-xs group cursor-pointer transition-colors hover:border-gray-800">
                <summary className="font-bold text-white flex justify-between items-center outline-none">
                  <span>Como funciona a sincronização inteligente de dados Offline?</span>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 text-gray-400 leading-relaxed font-sans">
                  Quando há oscilação na fiação ou perda total de sinal (Modo Offline), o AutoTech salva síncronamente todas as faturas, O.S. e baixas no IndexedDB local de seu navegador. Com o retorno da conectividade, um botão pulsante surge no topo permitindo despachar o buffer consolidado ao banco Firebase Cloud em um clique.
                </p>
              </details>

              <details className="bg-[#070c17]/65 border border-gray-900/30 rounded-xl p-3.5 font-sans text-xs group cursor-pointer transition-colors hover:border-gray-800">
                <summary className="font-bold text-white flex justify-between items-center outline-none">
                  <span>Como o sistema aponta as pastilhas e óleos com estoque crítico?</span>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 text-gray-400 leading-relaxed font-sans">
                  Todo faturamento e venda direta realizada no PDV deduz imediatamente o saldo das quantidades gravadas. Ao igualar ou descer abaixo do limite operacional mínimo definido, a pastilha de freio ou peça é catalogada no painel de reposição na dashboard principal sob uma luz de aviso de perigo.
                </p>
              </details>

              <details className="bg-[#070c17]/65 border border-gray-900/30 rounded-xl p-3.5 font-sans text-xs group cursor-pointer transition-colors hover:border-gray-800">
                <summary className="font-bold text-white flex justify-between items-center outline-none">
                  <span>Posso integrar o logotipo corporativo e cores da minha oficina?</span>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 text-gray-400 leading-relaxed font-sans">
                  Sim! Através da aba de Configurações Gerais o operador insere a URL da marca corporativa. O logotipo substitui a engrenagem padrão em todo o cabeçalho superior e cabeçalhos de orçamentos criados.
                </p>
              </details>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
