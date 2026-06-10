import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  MapPin, 
  Calendar, 
  Layers, 
  Sliders, 
  Clipboard, 
  BookOpen, 
  Sparkles, 
  X, 
  HelpCircle,
  FileText,
  Activity,
  History,
  Trash2,
  Edit2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Ferramenta, FerramentaMovimentacao } from '../types';

export default function FerramentasView() {
  const { 
    ferramentas, 
    addFerramenta, 
    editFerramenta, 
    deleteFerramenta, 
    addFerramentaMovimentacao,
    sendChatMessage,
    aiLoading
  } = useApp();

  // Search, category & status filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | 'Diagnóstico' | 'Pneumática'| 'Especiais' | 'Pesadas' | 'Manuais' | 'Outros'>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<'Todos' | 'Disponível' | 'Em Uso' | 'Manutenção' | 'Calibração'>('Todos');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const [selectedTool, setSelectedTool] = useState<Ferramenta | null>(null);

  // New tool form state
  const [newTool, setNewTool] = useState({
    name: '',
    code: '',
    category: 'Diagnóstico' as Ferramenta['category'],
    condition: 'Excelente' as Ferramenta['condition'],
    location: '',
    notes: '',
    lastCalibrationDate: '',
    nextCalibrationDate: ''
  });

  // Edit tool form state
  const [editToolForm, setEditToolForm] = useState({
    name: '',
    code: '',
    category: 'Diagnóstico' as Ferramenta['category'],
    condition: 'Excelente' as Ferramenta['condition'],
    location: '',
    notes: '',
    lastCalibrationDate: '',
    nextCalibrationDate: ''
  });

  // Borrow/Return action state
  const [borrowerName, setBorrowerName] = useState('');
  const [loanDetails, setLoanDetails] = useState('');

  // AI Suggestion states
  const [aiSpecialty, setAiSpecialty] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [importedSugCount, setImportedSugCount] = useState(0);

  // Filtered tools
  const filteredTools = ferramentas.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.currentUser && t.currentUser.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Todos' || t.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Todos' || t.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Preset suggestions for quick import
  const CATEGORY_PRESETS = [
    {
      title: "Injeção Eletrônica e Diagnóstico",
      description: "Scanner OBD-II portátil secundário, Osciloscópio digital, multímetro de bancada, caneta de polaridade profissional.",
      tools: [
        { name: "Osciloscópio Automotivo Hantek 4 Canais USB", code: "PAT-0220", category: "Diagnóstico" as const, condition: "Excelente" as const, location: "Prateleira Eletrônica A", notes: "Acompanha sondas de ignição secundária e pinça indutiva." },
        { name: "Caneta de Polaridade Can-Tech Digital Pro", code: "PAT-0221", category: "Diagnóstico" as const, condition: "Excelente" as const, location: "Gaveta de Elétrica B", notes: "Com indicador de voltagem em tempo real e sinal sonoro." },
        { name: "Transdutor de Compressão Cilindro TVA/TVC", code: "PAT-0222", category: "Diagnóstico" as const, condition: "Excelente" as const, location: "Maleta Diagnóstico B", notes: "Uso em conjunto com o osciloscópio para análise de compressão dinâmica." }
      ]
    },
    {
      title: "Ar Condicionado e Climatização",
      description: "Manômetro manifold digital de alta/baixa, balança de precisão freon, detector de vazamento halogênio.",
      tools: [
        { name: "Balança Digital de Gás Refrigerante Mastercool", code: "PAT-0230", category: "Especiais" as const, condition: "Excelente" as const, location: "Carrinho de A/C", notes: "Resolução de 10g com desligamento automático e tara." },
        { name: "Conjunto de Manifold Digital Testo 550s com Bluetooth", code: "PAT-0231", category: "Diagnóstico" as const, condition: "Excelente" as const, location: "Carrinho de A/C", notes: "Com cálculos automáticos de superaquecimento e subresfriamento." },
        { name: "Detector de Vazamentos Ultrassônico Wurth", code: "PAT-0232", category: "Especiais" as const, condition: "Excelente" as const, location: "Painel Principal Elevador 02", notes: "Sensibilidade ultra alta para gás R134a e R1234yf." }
      ]
    },
    {
      title: "Suspensão, Freios e Alinhamento",
      description: "Extrator hidráulico de homocinética, relógio comparador com base magnética, encolhedor pneumático de molas McPherson.",
      tools: [
        { name: "Encolhedor Pneumático de Molas McPherson Raven 10350", code: "PAT-0240", category: "Pesadas" as const, condition: "Excelente" as const, location: "Parede Elevador 01", notes: "Encolhimento seguro com travamento triplo." },
        { name: "Relógio Comparador MITUTOYO com Base Magnética", code: "PAT-0241", category: "Especiais" as const, condition: "Excelente" as const, location: "Gabinete de Precisão", notes: "Indispensável na medição de empenamento de disco de freio e folga de cubo." },
        { name: "Extrator de Terminal de Direção e Pivô Gedore", code: "PAT-0242", category: "Manuais" as const, condition: "Bom" as const, location: "Painel de Suspensão", notes: "Forjado em aço cromo-vanádio." }
      ]
    }
  ];

  const handleImportPreset = async (presetTools: typeof CATEGORY_PRESETS[0]['tools']) => {
    for (const tool of presetTools) {
      await addFerramenta({
        name: tool.name,
        code: tool.code,
        category: tool.category,
        condition: tool.condition,
        location: tool.location,
        notes: tool.notes,
        lastCalibrationDate: '',
        nextCalibrationDate: ''
      });
    }
    setImportedSugCount(prev => prev + presetTools.length);
    setTimeout(() => setImportedSugCount(0), 4000);
  };

  const handleCreateTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTool.name || !newTool.code) return;

    await addFerramenta(newTool);
    setIsNewModalOpen(false);
    setNewTool({
      name: '',
      code: '',
      category: 'Diagnóstico',
      condition: 'Excelente',
      location: '',
      notes: '',
      lastCalibrationDate: '',
      nextCalibrationDate: ''
    });
  };

  const handleOpenEdit = (tool: Ferramenta) => {
    setSelectedTool(tool);
    setEditToolForm({
      name: tool.name,
      code: tool.code,
      category: tool.category,
      condition: tool.condition,
      location: tool.location || '',
      notes: tool.notes || '',
      lastCalibrationDate: tool.lastCalibrationDate || '',
      nextCalibrationDate: tool.nextCalibrationDate || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTool) return;

    await editFerramenta(selectedTool.id, editToolForm);
    setIsEditModalOpen(false);
    setSelectedTool(null);
  };

  const handleDeleteClick = async (tool: Ferramenta) => {
    if (window.confirm(`Tem certeza absoluta de que deseja remover a ferramenta '${tool.name}'?`)) {
      await deleteFerramenta(tool.id);
    }
  };

  const handleOpenBorrow = (tool: Ferramenta) => {
    setSelectedTool(tool);
    setBorrowerName('');
    setLoanDetails('');
    setIsBorrowModalOpen(true);
  };

  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTool || !borrowerName) return;

    await addFerramentaMovimentacao(selectedTool.id, {
      type: 'Empréstimo',
      userName: borrowerName,
      details: loanDetails || 'Sem observações adicionais.'
    });

    setIsBorrowModalOpen(false);
    setSelectedTool(null);
  };

  const handleReturnTool = async (tool: Ferramenta) => {
    if (window.confirm(`Confirmar devolução da ferramenta '${tool.name}'? Ela voltará ao estado de Disponível.`)) {
      await addFerramentaMovimentacao(tool.id, {
        type: 'Devolução',
        userName: tool.currentUser || 'Mecânico',
        details: 'Retornada ao armário geral em perfeitas condições.'
      });
    }
  };

  const handleManutencaoToggle = async (tool: Ferramenta) => {
    if (tool.status === 'Manutenção') {
      if (window.confirm(`Colocar a ferramenta '${tool.name}' de volta em Disponível?`)) {
        await addFerramentaMovimentacao(tool.id, {
          type: 'Devolução',
          userName: 'Sistema / Oficina',
          details: 'Saída da manutenção corretiva.'
        });
      }
    } else {
      if (window.confirm(`Enviar a ferramenta '${tool.name}' para Manutenção/Conserto?`)) {
        await addFerramentaMovimentacao(tool.id, {
          type: 'Manutenção',
          userName: 'Supervisor',
          details: 'Enviada para reparo preventivo/corretivo por mau funcionamento.'
        });
      }
    }
  };

  const handleCalibracaoToggle = async (tool: Ferramenta) => {
    if (window.confirm(`Registrar Calibração efetuada para a ferramenta '${tool.name}' hoje?`)) {
      await addFerramentaMovimentacao(tool.id, {
        type: 'Calibração',
        userName: 'Padrão / Certificadora',
        details: 'Aferição de precisão e aferimento de torque certificados.'
      });
    }
  };

  const handleAiConsultSuggestedTools = async () => {
    if (!aiSpecialty.trim()) return;
    try {
      setAiSuggestions([]);
      const prompt = `Você é o consultor master de engenharia mecânica da AutoTech ERP. 
O usuário tem uma oficina mecânica especializada em: "${aiSpecialty}".
Sua tarefa é sugerir uma lista de 5 a 6 ferramentas técnicas, equipamentos ou osciloscópios avançados cruciais para essa especialidade que deveriam ser monitorados e controlados por patrimônio.
Retorne APENAS um array JSON formatado de strings, sem qualquer outro texto de conversa, explicação ou marcação markdown (por exemplo: ["Chave de fenda", "Scanner Bosch"]).
Siga esse padrão e use o idioma português de forma impecável.`;

      const responseText = await sendChatMessage([{ role: 'user', text: prompt }]);
      
      // Parse the JSON array
      let finalJson = responseText;
      if (finalJson.includes('```')) {
        finalJson = finalJson.substring(finalJson.indexOf('['), finalJson.lastIndexOf(']') + 1);
      }
      const parsed = JSON.parse(finalJson);
      if (Array.isArray(parsed)) {
        setAiSuggestions(parsed);
      }
    } catch (e) {
      console.error("AI tools suggestion fail", e);
      setAiSuggestions(["Osciloscópio Digital de Bancada", "Scanner OBD-II Avançado de Conectividade Híbrida", "Equipamento Testador de Estanqueidade de Células de Lítio", "Multímetro isolado categoria CAT-IV", "Ferramenta de extração de rotores internos"]);
    }
  };

  const handleImportAiSuggestedTool = async (toolName: string) => {
    const code = "PAT-" + Math.floor(Math.random() * 9000 + 1000);
    await addFerramenta({
      name: toolName,
      code,
      category: 'Especiais',
      condition: 'Excelente',
      location: 'Prateleira de Precisão',
      notes: 'Sugerida pela IA de Engenharia da Oficina.',
      lastCalibrationDate: '',
      nextCalibrationDate: ''
    });
    setAiSuggestions(prev => prev.filter(item => item !== toolName));
    setImportedSugCount(prev => prev + 1);
    setTimeout(() => setImportedSugCount(0), 4000);
  };

  const getStatusColor = (status: Ferramenta['status']) => {
    switch (status) {
      case 'Disponível': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Em Uso': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Manutenção': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Calibração': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getConditionColor = (cond: Ferramenta['condition']) => {
    switch (cond) {
      case 'Novo': return 'text-violet-400';
      case 'Excelente': return 'text-emerald-400';
      case 'Bom': return 'text-sky-400';
      case 'Desgastado': return 'text-amber-400';
      case 'Danificado': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div id="ferramentas-dashboard" className="p-6 max-w-7xl mx-auto flex flex-col gap-6 text-slate-100 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-850 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-mono text-xs font-bold uppercase tracking-widest">
            <Wrench className="w-4 h-4 animate-wrench" /> Gestão de Ativos
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight mt-1">
            Controle de Ferramental da Oficina
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Controle retiradas, devoluções, datas de calibração, histórico de uso e preventivas de precisão de seus equipamentos.
          </p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 font-bold text-xs font-mono text-white cursor-pointer transition-all shadow-md shadow-rose-950/20"
        >
          <Plus className="w-4 h-4" /> Cadastrar Nova Ferramenta
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-gray-850 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold font-mono">Cadastradas</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">{ferramentas.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-gray-800 text-slate-400">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-gray-850 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold font-mono">Disponíveis</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {ferramentas.filter(t => t.status === 'Disponível').length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/35 border border-emerald-900/40 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-gray-850 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold font-mono">Em Uso Ativo</span>
            <div className="text-2xl font-bold font-mono text-amber-500 mt-1">
              {ferramentas.filter(t => t.status === 'Em Uso').length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/35 border border-amber-900/40 text-amber-500">
            <User className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-gray-850 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold font-mono">Impedidas (Manut./Cal.)</span>
            <div className="text-2xl font-bold font-mono text-red-400 mt-1">
              {ferramentas.filter(t => t.status === 'Manutenção' || t.status === 'Calibração').length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-red-950/35 border border-red-900/40 text-red-400">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
        </div>

      </div>

      {/* Main Board Grid with Left Sidebar filter and Right List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Filter Controls Sidebar & Suggestions Panel */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          
          {/* Quick Filters */}
          <div className="p-5 rounded-2xl border border-gray-850 bg-[#0c1223] flex flex-col gap-4">
            <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase pb-2 border-b border-gray-850">
              <Sliders className="w-4 h-4 text-rose-500" /> Filtros Rápidos
            </div>

            {/* Category Filter list */}
            <div className="flex flex-col gap-1.5 text-xs">
              <span className="text-[10px] text-gray-500 uppercase font-bold font-mono mb-1">Categoria</span>
              {(['Todos', 'Diagnóstico', 'Pneumática', 'Especiais', 'Pesadas', 'Manuais', 'Outros'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-left font-mono border transition-all ${
                    selectedCategory === cat 
                      ? 'bg-rose-950/20 border-rose-900/50 text-rose-400 font-bold' 
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-[10px] text-gray-500">
                    ({cat === 'Todos' ? ferramentas.length : ferramentas.filter(t => t.category === cat).length})
                  </span>
                </button>
              ))}
            </div>

            {/* Status Filter list */}
            <div className="flex flex-col gap-1.5 text-xs border-t border-gray-850 pt-4">
              <span className="text-[10px] text-gray-500 uppercase font-bold font-mono mb-1">Status Operacional</span>
              {(['Todos', 'Disponível', 'Em Uso', 'Manutenção', 'Calibração'] as const).map(stat => (
                <button
                  key={stat}
                  onClick={() => setSelectedStatus(stat)}
                  className={`w-full flex justify-between items-center px-3 py-2 rounded-xl text-left font-mono border transition-all ${
                    selectedStatus === stat 
                      ? 'bg-rose-950/20 border-rose-900/50 text-rose-400 font-bold' 
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>{stat}</span>
                  <span className="text-[10px] text-gray-500">
                    ({stat === 'Todos' ? ferramentas.length : ferramentas.filter(t => t.status === stat).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* AI / Segment Suggestions Card */}
          <div className="p-5 rounded-2xl border border-gray-850 bg-gradient-to-br from-[#120e23] to-[#0a0d1e] flex flex-col gap-4 shadow-xl">
            <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase pb-2 border-b border-purple-950/30">
              <Sparkles className="w-4 h-4 text-purple-400 animate-bounce" /> Sugestões Inteligentes
            </div>

            <p className="text-gray-400 text-[11px] leading-relaxed">
              Descubra ferramentas essenciais sugeridas conforme as marcas e especialidades da sua oficina.
            </p>

            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                placeholder="Ex. Reparo de Módulos e ECU, Suspensão Picape..." 
                value={aiSpecialty}
                onChange={(e) => setAiSpecialty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-800 bg-slate-950 text-xs text-white focus:outline-none focus:border-purple-500 font-mono transition-all"
              />
              <button
                type="button"
                disabled={aiLoading || !aiSpecialty.trim()}
                onClick={handleAiConsultSuggestedTools}
                className="w-full py-2 bg-purple-900/35 hover:bg-purple-900/50 text-purple-300 hover:text-purple-100 disabled:opacity-40 border border-purple-800/40 rounded-xl text-xs font-mono font-bold font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {aiLoading ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-t-transparent border-purple-300 rounded-full animate-spin" />
                ) : '🔍 Consultar Sugestões de IA'}
              </button>
            </div>

            {/* AI Results suggestions list */}
            {aiSuggestions.length > 0 && (
              <div className="flex flex-col gap-1.5 border-t border-purple-950/35 pt-4">
                <span className="text-[9px] text-purple-400 uppercase font-mono font-extrabold">Ferramental Recomendado:</span>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {aiSuggestions.map((sug, idx) => (
                    <div 
                      key={idx}
                      className="p-2 rounded-lg bg-purple-950/15 border border-purple-900/20 flex flex-col justify-between gap-1.5 hover:border-purple-500/30 transition-all text-[11px]"
                    >
                      <span className="text-gray-200 font-medium font-mono leading-snug">{sug}</span>
                      <button 
                        onClick={() => handleImportAiSuggestedTool(sug)}
                        className="self-end text-[9px] font-mono font-bold bg-purple-800 hover:bg-purple-700 text-white rounded px-2 py-0.5"
                      >
                        + Importar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Segment Presets */}
            <div className="flex flex-col gap-3 pt-2">
              <span className="text-[9px] text-gray-500 uppercase font-mono font-extrabold border-t border-gray-850 pt-4">Segmentos com 1 Clique:</span>
              <div className="flex flex-col gap-2">
                {CATEGORY_PRESETS.map((preset, pIdx) => (
                  <div 
                    key={pIdx}
                    className="p-3 rounded-xl border border-gray-850 bg-slate-900/30 text-left hover:border-rose-900/40 transition-all flex flex-col gap-1 text-[11px]"
                  >
                    <span className="text-gray-200 font-bold font-mono">{preset.title}</span>
                    <span className="text-[9px] text-gray-500 leading-snug font-sans">{preset.description}</span>
                    <button
                      onClick={() => handleImportPreset(preset.tools)}
                      className="mt-2 text-[9px] font-mono font-extrabold text-rose-400 hover:text-rose-300 text-right w-full block transition-colors"
                    >
                      📥 Importar Kit ({preset.tools.length} itens) &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Tools inventory list area */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Search bar & Filter summary info */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-gray-850 flex flex-col sm:flex-row shadow-inner justify-between items-center gap-3.5">
            <div className="w-full sm:w-80 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar ferramenta, código ou responsável..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-gray-800 focus:outline-none focus:border-rose-600 rounded-xl text-xs text-white placeholder-slate-500 font-mono"
              />
            </div>
            <div className="text-[10px] text-gray-500 font-mono">
              Mostrando <span className="font-bold text-white font-mono">{filteredTools.length}</span> ferramentas filtradas
            </div>
          </div>

          {/* Success Imports Feedback */}
          {importedSugCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-950/20 border border-rose-900/50 text-rose-400 rounded-xl text-xs font-mono text-center"
            >
              🎉 Sucesso! {importedSugCount} ferramentas importadas com sucesso para a oficina.
            </motion.div>
          )}

          {/* Tools Grid List */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTools.map((tool, index) => {
                const needsCalibration = tool.nextCalibrationDate && new Date(tool.nextCalibrationDate).getTime() < (Date.now() + 15 * 24 * 60 * 60 * 1000);
                
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    className="p-5 rounded-2xl border border-gray-850 bg-[#070b14]/75 hover:border-gray-800 hover:bg-[#090f1d] transition-all flex flex-col justify-between shadow-md relative group"
                  >
                    
                    {/* Top status & category tag */}
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[9px] font-bold font-mono px-2 py-0.5 bg-gray-900 border border-gray-800 text-gray-400 rounded">
                        {tool.category}
                      </span>

                      <div className="flex gap-1.5 items-center">
                        {needsCalibration && (
                          <span 
                            title="Atenção: Necessita de de Calibração Preventiva nos próximos dias!"
                            className="bg-red-950/35 text-red-500 border border-red-900/30 text-[9px] font-mono px-1.5 py-0.5 rounded animate-pulse"
                          >
                            ⚠️ REVISÃO EXIGIDA
                          </span>
                        )}
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 border rounded-lg ${getStatusColor(tool.status)}`}>
                          {tool.status}
                        </span>
                      </div>
                    </div>

                    {/* Tool Code SKU and Title */}
                    <div className="mt-3">
                      <span className="text-[10px] text-gray-500 font-mono block mb-0.5 font-bold">
                        Patrimônio: {tool.code}
                      </span>
                      <h3 className="text-white font-medium text-sm leading-snug select-all pr-4">
                        {tool.name}
                      </h3>
                    </div>

                    {/* Specifications drawer (location, condition, calibrations) */}
                    <div className="mt-4 p-3 rounded-xl bg-gray-950/35 border border-gray-900/60 text-xs flex flex-col gap-2">
                      {tool.location && (
                        <div className="flex items-center gap-2 text-gray-400 font-mono text-[10px]">
                          <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                          <span>Armário: <span className="text-white">{tool.location}</span></span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-400 font-mono text-[10px]">
                        <Activity className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span>Conservação: <span className={`font-bold uppercase ${getConditionColor(tool.condition)}`}>{tool.condition}</span></span>
                      </div>

                      {tool.currentUser && tool.status === 'Em Uso' && (
                        <div className="flex items-center gap-2 text-amber-400 font-mono text-[10px] bg-amber-950/15 p-1.5 rounded border border-amber-900/10">
                          <User className="w-3.5 h-3.5 shrink-0" />
                          <span>Com: <span className="font-bold text-white font-sans">{tool.currentUser}</span></span>
                        </div>
                      )}

                      {(tool.lastCalibrationDate || tool.nextCalibrationDate) && (
                        <div className="border-t border-gray-900 pt-2 flex flex-col gap-1.5 font-mono text-[9px]">
                          {tool.lastCalibrationDate && (
                            <div className="flex justify-between items-center text-gray-500">
                              <span>Última Calibração:</span>
                              <span className="text-slate-300">{new Date(tool.lastCalibrationDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {tool.nextCalibrationDate && (
                            <div className="flex justify-between items-center text-gray-500">
                              <span>Próxima Vencimento:</span>
                              <span className={`font-bold ${needsCalibration ? 'text-red-400' : 'text-slate-400'}`}>
                                {new Date(tool.nextCalibrationDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {tool.notes && (
                      <p className="mt-2.5 text-gray-500 text-[10px] leading-relaxed italic font-sans truncate" title={tool.notes}>
                        💡 {tool.notes}
                      </p>
                    )}

                    {/* Operational Actions section */}
                    <div className="mt-4 pt-3 border-t border-gray-850 flex flex-wrap gap-2 items-center justify-between">
                      
                      {/* Borrower operational buttons */}
                      <div className="flex gap-1.5">
                        {tool.status === 'Disponível' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenBorrow(tool)}
                            className="px-2.5 py-1.5 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 text-[10px] font-mono font-bold text-rose-400 rounded-lg cursor-pointer transition-all active:scale-95"
                          >
                            🤝 Empréstimo
                          </button>
                        ) : (
                          tool.status === 'Em Uso' && (
                            <button
                              type="button"
                              onClick={() => handleReturnTool(tool)}
                              className="px-2.5 py-1.5 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/40 text-[10px] font-mono font-bold text-emerald-400 rounded-lg cursor-pointer transition-all active:scale-95"
                            >
                              📥 Receber Devolução
                            </button>
                          )
                        )}

                        <button
                          type="button"
                          title="Enviar ou tirar da Manutenção"
                          onClick={() => handleManutencaoToggle(tool)}
                          className={`px-2 py-1.5 border rounded-lg text-[10px] font-mono cursor-pointer transition-all active:scale-95 ${
                            tool.status === 'Manutenção' 
                              ? 'bg-red-800 text-white border-red-700' 
                              : 'bg-slate-900 text-gray-400 hover:text-white border-gray-800 hover:bg-slate-800'
                          }`}
                        >
                          🔧 {tool.status === 'Manutenção' ? 'Liberar Manut.' : 'Enviar Manut.'}
                        </button>

                        {tool.category === 'Diagnóstico' || tool.category === 'Especiais' ? (
                          <button
                            type="button"
                            title="Registrar Calibração Realizada"
                            onClick={() => handleCalibracaoToggle(tool)}
                            className="px-2 py-1.5 bg-slate-900 text-gray-400 hover:text-white border border-gray-800 hover:bg-slate-800 rounded-lg text-[10px] font-mono cursor-pointer transition-all active:scale-95"
                          >
                            📏 Calibrar
                          </button>
                        ) : null}
                      </div>

                      {/* Edit, Delete, Log buttons */}
                      <div className="flex gap-1">
                        <button
                          type="button"
                          title="Ver Histórico de Movimentações"
                          onClick={() => {
                            setSelectedTool(tool);
                            setIsHistoryModalOpen(true);
                          }}
                          className="p-1.5 bg-slate-950 border border-gray-900 text-slate-400 hover:text-white hover:border-gray-800 rounded-lg cursor-pointer transition-all shrink-0"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          title="Editar Cadastro"
                          onClick={() => handleOpenEdit(tool)}
                          className="p-1.5 bg-slate-950 border border-gray-900 text-slate-400 hover:bg-slate-900 hover:text-white rounded-lg cursor-pointer transition-all shrink-0"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          title="Remover Ativo"
                          onClick={() => handleDeleteClick(tool)}
                          className="p-1.5 bg-slate-950 border border-gray-900 text-red-500 hover:bg-red-950/20 hover:border-red-900 rounded-lg cursor-pointer transition-all shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 border border-gray-850 rounded-2xl bg-slate-950/40 text-center flex flex-col items-center gap-3">
              <span className="p-3 bg-rose-950/25 border border-rose-900/30 text-rose-500 rounded-full animate-bounce">
                <Wrench className="w-6 h-6" />
              </span>
              <h3 className="font-bold text-white text-sm font-mono mt-1">Nenhum Ativo Localizado</h3>
              <p className="text-gray-500 text-xs leading-relaxed max-w-sm">
                Nenhuma ferramenta coincidiu com a busca atual ou filtros. Tente expandir os termos de pesquisa, ou importe os presets sugeridos com 1 clique.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* MODAL: REGISTRAR NOVA FERRAMENTA */}
      <AnimatePresence>
        {isNewModalOpen && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0c1223] border border-gray-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-left flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-850 flex justify-between items-center bg-[#080d1a]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-white text-base leading-snug">
                      Cadastrar Ferramenta de Patrimônio
                    </h3>
                    <span className="text-[10px] text-rose-400 font-mono uppercase tracking-wider font-bold">Oficina Segura & Integrada</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateTool} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Nome da Ferramenta/Equipamento *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Torquímetro de precisão digital Gedore"
                      value={newTool.name}
                      onChange={(e) => setNewTool({...newTool, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-600 transition-all font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Código de Patrimônio (Único) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: PAT-0155"
                      value={newTool.code}
                      onChange={(e) => setNewTool({...newTool, code: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-600 transition-all font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Tipo / Categoria *</label>
                    <select
                      value={newTool.category}
                      onChange={(e) => setNewTool({...newTool, category: e.target.value as Ferramenta['category']})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-600 transition-all font-mono"
                    >
                      <option value="Diagnóstico">Diagnóstico</option>
                      <option value="Pneumática">Pneumática</option>
                      <option value="Especiais">Especiais</option>
                      <option value="Pesadas">Pesadas</option>
                      <option value="Manuais">Manuais</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Local de Armazenamento</label>
                    <input
                      type="text"
                      placeholder="Ex: Armário A, Gaveta 3"
                      value={newTool.location}
                      onChange={(e) => setNewTool({...newTool, location: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-600 transition-all font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Estado Conservação</label>
                    <select
                      value={newTool.condition}
                      onChange={(e) => setNewTool({...newTool, condition: e.target.value as Ferramenta['condition']})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-600 transition-all font-mono"
                    >
                      <option value="Novo">Novo</option>
                      <option value="Excelente">Excelente</option>
                      <option value="Bom">Bom</option>
                      <option value="Desgastado">Desgastado</option>
                      <option value="Danificado">Danificado</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Última Calibração</label>
                    <input
                      type="date"
                      value={newTool.lastCalibrationDate}
                      onChange={(e) => setNewTool({...newTool, lastCalibrationDate: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-600 transition-all font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Vencimento Calibração</label>
                    <input
                      type="date"
                      value={newTool.nextCalibrationDate}
                      onChange={(e) => setNewTool({...newTool, nextCalibrationDate: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-600 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Observações / Instruções de Conservação</label>
                  <textarea
                    rows={3}
                    placeholder="Instruções de lubrificação, limites de tolerância..."
                    value={newTool.notes}
                    onChange={(e) => setNewTool({...newTool, notes: e.target.value})}
                    className="w-full p-4 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-600 transition-all font-mono"
                  />
                </div>

                {/* Submit footer */}
                <div className="mt-4 pt-4 border-t border-gray-850 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-gray-800 rounded-xl text-xs font-mono text-gray-300 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-xs font-bold font-mono text-white rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Salvar Ferramenta
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDITAR ATIVO */}
      <AnimatePresence>
        {isEditModalOpen && selectedTool && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0c1223] border border-gray-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-left flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-850 flex justify-between items-center bg-[#080d1a]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-white text-base leading-snug">
                      Editar dados da Ferramenta
                    </h3>
                    <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider font-bold">Alterar Parametrização</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Nome da Ferramenta *</label>
                    <input
                      type="text"
                      required
                      value={editToolForm.name}
                      onChange={(e) => setEditToolForm({...editToolForm, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-600 transition-all font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Código Patrimônio *</label>
                    <input
                      type="text"
                      required
                      value={editToolForm.code}
                      onChange={(e) => setEditToolForm({...editToolForm, code: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-600 transition-all font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Tipo / Categoria *</label>
                    <select
                      value={editToolForm.category}
                      onChange={(e) => setEditToolForm({...editToolForm, category: e.target.value as Ferramenta['category']})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-600 transition-all font-mono"
                    >
                      <option value="Diagnóstico">Diagnóstico</option>
                      <option value="Pneumática">Pneumática</option>
                      <option value="Especiais">Especiais</option>
                      <option value="Pesadas">Pesadas</option>
                      <option value="Manuais">Manuais</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Local</label>
                    <input
                      type="text"
                      value={editToolForm.location}
                      onChange={(e) => setEditToolForm({...editToolForm, location: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-600 transition-all font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Estado Conservação</label>
                    <select
                      value={editToolForm.condition}
                      onChange={(e) => setEditToolForm({...editToolForm, condition: e.target.value as Ferramenta['condition']})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-600 transition-all font-mono"
                    >
                      <option value="Novo">Novo</option>
                      <option value="Excelente">Excelente</option>
                      <option value="Bom">Bom</option>
                      <option value="Desgastado">Desgastado</option>
                      <option value="Danificado">Danificado</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Última Calibração</label>
                    <input
                      type="date"
                      value={editToolForm.lastCalibrationDate}
                      onChange={(e) => setEditToolForm({...editToolForm, lastCalibrationDate: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-600 transition-all font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Vencimento Calibração</label>
                    <input
                      type="date"
                      value={editToolForm.nextCalibrationDate}
                      onChange={(e) => setEditToolForm({...editToolForm, nextCalibrationDate: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-600 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Observações / Requisitos</label>
                  <textarea
                    rows={3}
                    value={editToolForm.notes}
                    onChange={(e) => setEditToolForm({...editToolForm, notes: e.target.value})}
                    className="w-full p-4 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-600 transition-all font-mono"
                  />
                </div>

                {/* Submit footer */}
                <div className="mt-4 pt-4 border-t border-gray-850 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-slate-900 text-xs font-mono text-gray-300 border border-gray-800 rounded-xl transition-all cursor-pointer animate-none"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-505 active:scale-95 text-xs font-bold font-mono text-white rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DISPARAR EMPRÉSTIMO */}
      <AnimatePresence>
        {isBorrowModalOpen && selectedTool && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c1223] border border-gray-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-left"
            >
              <div className="p-6 border-b border-gray-850 bg-[#080d1a] flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-white text-base">Registrar Retirada de Ferramenta</h3>
                    <span className="text-[10px] text-amber-400 font-mono font-bold tracking-wider block mt-0.5">{selectedTool.name}</span>
                  </div>
                </div>
                <button onClick={() => setIsBorrowModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBorrowSubmit} className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Colaborador / Mecânico Responsável *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo do mecânico que está retirando"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-550 transition-all font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">Vínculo com O.S. / Notas adicionais</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva o serviço correspondente para prestação de contas estruturada (Ex: O.S. #1024 - Cabeçote Corolla)"
                    value={loanDetails}
                    onChange={(e) => setLoanDetails(e.target.value)}
                    className="w-full p-4 bg-slate-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-550 transition-all font-mono"
                  />
                </div>

                <div className="mt-2 flex justify-end gap-3 pt-3 border-t border-gray-850">
                  <button
                    type="button"
                    onClick={() => setIsBorrowModalOpen(false)}
                    className="px-4 py-2 bg-slate-900 border border-gray-800 rounded-xl text-xs font-mono text-gray-300 transition-all"
                  >
                    Recusar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 active:scale-95 text-xs font-bold font-mono text-white rounded-xl transition-all shadow-md"
                  >
                    Aprovar Saída de Ativo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: HISTÓRICO DE MOVIMENTAÇÕES (TIMELINE) */}
      <AnimatePresence>
        {isHistoryModalOpen && selectedTool && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c1223] border border-gray-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-left"
            >
              <div className="p-6 border-b border-gray-850 bg-[#080d1a] flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-500/10 rounded-lg text-rose-450">
                    <History className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-white text-base">Rastreabilidade do Ativo</h3>
                    <span className="text-[10px] text-rose-400 font-mono font-bold block truncate max-w-xs">{selectedTool.name}</span>
                  </div>
                </div>
                <button onClick={() => {
                  setIsHistoryModalOpen(false);
                  setSelectedTool(null);
                }} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[50vh] overflow-y-auto flex flex-col gap-4">
                {selectedTool.history && selectedTool.history.length > 0 ? (
                  <div className="relative border-l-2 border-gray-800 pl-4 ml-2.5 flex flex-col gap-6 font-mono text-xs">
                    {selectedTool.history.map((item, hIdx) => (
                      <div key={item.id || hIdx} className="relative">
                        {/* Circle marker */}
                        <span className={`absolute -left-[23px] top-0.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#0c1223] ${
                          item.type === 'Empréstimo' ? 'bg-amber-500' :
                          item.type === 'Devolução' ? 'bg-emerald-500' :
                          item.type === 'Manutenção' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-white font-bold tracking-tight uppercase text-[10px]">
                            {item.type}
                          </span>
                          <span className="text-gray-500 text-[10px]">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1">
                          👤 Responsável/Executor: <span className="text-slate-200 font-bold font-sans">{item.userName}</span>
                        </div>
                        {item.details && (
                          <p className="mt-1.5 p-2 bg-slate-950/40 rounded border border-gray-900 text-gray-500 leading-normal font-sans text-[11px]">
                            {item.details}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 flex flex-col items-center gap-2">
                    <span>📋</span>
                    <span className="text-xs">Este patrimônio não registrou nenhuma movimentação física até o momento.</span>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-850 bg-[#080d1a] flex justify-end">
                <button
                  onClick={() => {
                    setIsHistoryModalOpen(false);
                    setSelectedTool(null);
                  }}
                  className="px-5 py-2 bg-slate-900 border border-gray-800 rounded-xl text-xs font-mono text-gray-300 cursor-pointer"
                >
                  Fechar Histórico
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
