import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Search, Droplet, Wrench, Shield, CheckCircle2, AlertTriangle, 
  Printer, ArrowRight, Gauge, Cpu, BookOpen, Send, HelpCircle, 
  ChevronRight, Car, Sliders, RefreshCw, FileText
} from 'lucide-react';

interface Part {
  name: string;
  category: string;
  oemReference: string;
  shortDescription: string;
}

interface VehicleSpecs {
  oilViscosity: string;
  oilSpecification: string;
  oilCapacity: string;
  oilType: string;
  oilAdditionalNotes: string;
  commonParts: Part[];
  technicalNotes: string;
}

const POPULAR_SUGGESTIONS = [
  { model: 'Honda Civic', year: '2018', motor: '2.0 16V Flex / Turbo' },
  { model: 'Toyota Corolla', year: '2020', motor: '2.0 Dynamic Force / Hybrid' },
  { model: 'Chevrolet Onix', year: '2021', motor: '1.0 Turbo 3-Cilindros Banhado' },
  { model: 'VW Gol L', year: '2015', motor: '1.6 8V EA111 TEC' },
  { model: 'Hyundai HB20', year: '2019', motor: '1.0 12V 3-Cilindros Kappa' }
];

export default function EngenhariaView() {
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [motor, setMotor] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VehicleSpecs | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Q&A State
  const [qaInput, setQaInput] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaFeed, setQaFeed] = useState<Array<{ q: string; a: string }>>([]);

  const handleSearch = async (targetModel: string, targetYear: string, targetMotor: string) => {
    if (!targetModel.trim() || !targetYear.trim()) {
      setError('Por favor, digite o modelo do veículo e o ano de fabricação.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setQaFeed([]);

    try {
      const response = await fetch('/api/gemini/specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetModel,
          year: targetYear,
          motor: targetMotor
        })
      });

      if (!response.ok) {
        throw new Error('Falha técnica ao consultar nossa matriz de engenharia.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Incapaz de conectar com a central de engenharia por rede neural.');
    } finally {
      setLoading(false);
    }
  };

  const executeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(model, year, motor);
  };

  const handleApplySuggestion = (sug: typeof POPULAR_SUGGESTIONS[0]) => {
    setModel(sug.model);
    setYear(sug.year);
    setMotor(sug.motor);
    handleSearch(sug.model, sug.year, sug.motor);
  };

  const handleAskQuickQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaInput.trim() || !result) return;

    const queryText = qaInput;
    setQaInput('');
    setQaLoading(true);

    const newQuestion = { q: queryText, a: 'Consultando nossos engenheiros de IA...' };
    setQaFeed(prev => [...prev, newQuestion]);

    try {
      // Create contextualized chat message for the existing generic chat API
      const contextMessage = `Você é um Engenheiro Mecânico Automotivo sênior. Responda de forma sucinta e direta (máximo 4 linhas) em português à seguinte dúvida técnica: "${queryText}" para o veículo ${model} (Ano ${year}, Motorização: ${motor || 'Padrão'}). Concentre-se em fatos empíricos de oficina, valores de torque se conhecidos, locais práticos de filtros de cabine ou procedimentos de reset de painel relevantes.`;

      const chatResponse = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', text: contextMessage }]
        })
      });

      if (!chatResponse.ok) {
        throw new Error();
      }

      const chatData = await chatResponse.json();
      setQaFeed(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last) {
          last.a = chatData.text || 'Ocorreu um erro ao gerar a explicação.';
        }
        return copy;
      });
    } catch (err) {
      setQaFeed(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last) {
          last.a = 'Desculpe, o assistente inteligente está em modo contingência técnica offline. Verifique o manual ou tente novamente.';
        }
        return copy;
      });
    } finally {
      setQaLoading(false);
    }
  };

  const printSpecsSheet = () => {
    if (!result) return;
    
    const printStyle = document.createElement('style');
    printStyle.innerHTML = `
      @media print {
        body {
          background-color: #ffffff !important;
          color: #000000 !important;
          font-family: system-ui, -apple-system, sans-serif !important;
        }
        #root, header, nav, aside, footer, button, .no-print {
          display: none !important;
        }
        html, body {
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        #print-specs-container {
          display: block !important;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 24px;
          background: #ffffff !important;
          color: #000000 !important;
        }
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
          margin-bottom: 24px;
        }
        .print-table th, .print-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .print-table th {
          background-color: #f5f5f5 !important;
          color: #000000 !important;
          font-weight: bold;
        }
        .print-heading-2 {
          border-bottom: 2px solid #000;
          padding-bottom: 4px;
          margin-top: 24px;
          margin-bottom: 12px;
          font-size: 16px;
          font-weight: bold;
          text-transform: uppercase;
        }
      }
    `;

    document.head.appendChild(printStyle);
    window.print();
    
    // Cleanup in timeout just to allow browser spooling
    setTimeout(() => {
      if (document.head.contains(printStyle)) {
        document.head.removeChild(printStyle);
      }
    }, 1000);
  };

  return (
    <div className="flex-grow flex flex-col gap-6 w-full text-left max-w-7xl mx-auto pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-red-950/20 to-slate-900 border border-gray-850 shadow-inner">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-sans text-white flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-red-500 shrink-0" /> Engenharia Assistida por IA
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-mono">
            Matriz inteligente Gemini 3.5 para lookup instantâneo de especificações de óleos lubrificantes e peças OEM
          </p>
        </div>
        
        {result && (
          <button 
            type="button"
            onClick={printSpecsSheet}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono text-white bg-slate-800 hover:bg-slate-750 border border-gray-700 hover:border-gray-650 transition-all rounded-xl shadow cursor-pointer no-print"
          >
            <Printer className="w-4 h-4 text-red-500" /> IMPRIMIR FICHA TÉCNICA
          </button>
        )}
      </div>

      {/* SEARCH FORM AND SUGGESTIONS BENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
        
        {/* Specification Lookup Form */}
        <div className="lg:col-span-7 bg-[#0c1223] border border-gray-850 p-6 rounded-2xl flex flex-col justify-between">
          <form onSubmit={executeSearch} className="space-y-4">
            <h2 className="text-xs font-bold font-mono tracking-wider text-red-500 uppercase flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Especificador Técnico de Veículos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-slate-400">Modelo do Carro *</label>
                <div className="relative">
                  <Car className="w-4 h-4 text-slate-550 absolute left-3 top-3" />
                  <input 
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Ex: Civic, Corolla, Onix, Gol"
                    className="w-full bg-[#070b13] border border-gray-800 focus:border-red-650 rounded-xl py-2 px-3 pl-9 text-xs text-white placeholder-slate-650 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-3 flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-slate-400">Ano *</label>
                <input 
                  type="number"
                  required
                  min="1950"
                  max="2027"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Ex: 2018"
                  className="w-full bg-[#070b13] border border-gray-800 focus:border-red-650 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-650 focus:outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-slate-400">Motorização (Opcional)</label>
                <input 
                  type="text"
                  value={motor}
                  onChange={(e) => setMotor(e.target.value)}
                  placeholder="Ex: 2.0 16V / 1.0 Turbo"
                  className="w-full bg-[#070b13] border border-gray-800 focus:border-red-650 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-650 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-xs text-white font-bold font-mono tracking-wide rounded-xl shadow-[0_4px_12px_rgba(220,38,38,0.25)] transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  CONSULTANDO ENGENHARIA AUTOMOTIVA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  IDENTIFICAR ÓLEO E PEÇAS COM INTELIGÊNCIA ARTIFICIAL
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl flex items-start gap-2 text-rose-450 text-xs leading-relaxed font-mono animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Quick Suggestions Bento */}
        <div className="lg:col-span-5 bg-[#0c1223] border border-gray-850 p-6 rounded-2xl flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-red-500" /> Atalhos Clássicos de Oficina
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
              Clique para preencher e gerar automaticamente os dados com base nos modelos de rotação intensa das garagens brasileiras.
            </p>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[180px] pr-1">
            {POPULAR_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplySuggestion(sug)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#070b13] hover:bg-[#0f182c] border border-gray-850 hover:border-slate-800 transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-red-950/40 border border-red-900/20 text-red-400">
                    <Car className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{sug.model} <span className="text-[10px] text-slate-500">({sug.year})</span></span>
                    <span className="text-[9px] text-slate-500 font-mono block mt-0.5">{sug.motor}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* LOADER PLACEHOLDER */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 bg-[#0c1223] border border-gray-850 rounded-2xl no-print">
          <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-slate-900/50 border-t-red-500 animate-spin" />
            <Droplet className="w-6 h-6 text-red-500 animate-pulse" />
          </div>
          <span className="font-mono text-xs tracking-wider text-slate-300 animate-pulse">Sintonizando Rede Neural Automotiva...</span>
          <p className="text-[10px] text-slate-505 font-mono text-slate-500 mt-2 text-center max-w-md">
            Mapeando viscosidade ideal do lubrificante, certificações internacionais, capacidades volumétricas do cárter e listando componentes críticos sob demanda.
          </p>
        </div>
      )}

      {/* MAIN RESULT DISPLAY AND MINI SPEC SHEET */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            
            {/* PRINT AREA CONTAINER */}
            <div id="print-specs-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full text-left">
              
              {/* PRINT ONLY HEADER */}
              <div className="hidden print:block w-full border-b-2 border-slate-350 pb-4 mb-4 col-span-12">
                <div className="flex justify-between items-center text-black">
                  <div>
                    <span className="font-mono font-bold text-lg tracking-wider text-red-750 uppercase">AUTOTECH ASSISTENCIAL ADVISOR</span>
                    <span className="block text-xs text-slate-650 font-mono mt-0.5">Laudo de Engenharia Inteligente - Ficha Técnica de Manutenção</span>
                  </div>
                  <div className="text-right text-[10px] font-mono leading-tight">
                    <span>Emissão: {new Date().toLocaleDateString('pt-BR')}</span>
                    <span className="block">Status: HOMOLOGADO IA</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-slate-100/50 border border-slate-200 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Veículo / Fabricante</span>
                    <span className="text-sm font-bold text-black uppercase">{model}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Ano de Fabricação</span>
                    <span className="text-sm font-bold text-black">{year}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Motorização Especificada</span>
                    <span className="text-sm font-bold text-black uppercase">{motor || 'Não Declarado'}</span>
                  </div>
                </div>
              </div>

              {/* LUBRICANT CORE SPECIFICATIONS CARD */}
              <div className="lg:col-span-5 bg-[#0c1223] border border-gray-850 p-6 rounded-2xl flex flex-col gap-6 print:border-none print:bg-white print:p-0 col-span-12">
                <div className="no-print">
                  <span className="text-[10px] font-mono text-red-500 uppercase font-bold tracking-wider block">RECOMENDAÇÃO DE LUBRIFICAÇÃO</span>
                  <h3 className="text-sm font-bold text-white font-sans mt-1">Ficha de Óleo de Motor</h3>
                </div>

                <div className="hidden print:block print-heading-2">
                  Especificações de Lubrificação do Motor
                </div>

                {/* VISUAL VISCOSITY GLYPH */}
                <div className="p-4 bg-gradient-to-br from-slate-900 to-[#070b13] border border-gray-850 rounded-xl flex items-center gap-4 print:border-slate-300 print:bg-slate-50">
                  <div className="w-12 h-12 rounded-xl bg-red-955 bg-red-950/30 border border-red-900/30 flex items-center justify-center shrink-0 text-red-400">
                    <Droplet className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase text-slate-500 block">Viscosidade Ótima do Fabricante</span>
                    <span className="text-lg font-bold font-mono text-white print:text-black tracking-tight block">
                      {result.oilViscosity}
                    </span>
                  </div>
                </div>

                {/* CRITICAL ATTRIBUTES */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#070b13] border border-gray-850 rounded-xl print:border-slate-250 print:bg-transparent">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block pl-0.5">Capacidade Total</span>
                    <span className="text-xs font-bold text-slate-100 print:text-black font-mono block mt-1">
                      {result.oilCapacity}
                    </span>
                  </div>

                  <div className="p-3 bg-[#070b13] border border-gray-850 rounded-xl print:border-slate-250 print:bg-transparent">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block pl-0.5">Tipo de Base</span>
                    <span className="text-xs font-bold text-slate-100 print:text-black font-mono block mt-1">
                      {result.oilType}
                    </span>
                  </div>

                  <div className="col-span-2 p-3 bg-[#070b13] border border-gray-850 rounded-xl print:border-slate-250 print:bg-transparent">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block pl-0.5">Homologação / Certificado Técnico</span>
                    <span className="text-xs font-bold text-slate-100 print:text-black font-mono block mt-1 italic">
                      {result.oilSpecification}
                    </span>
                  </div>
                </div>

                {/* OIL ADDITIONAL BULLETINS */}
                <div className="p-4 bg-orange-950/15 border border-orange-900/20 text-orange-400 text-xs rounded-xl space-y-1.5 leading-relaxed print:text-black print:bg-slate-50 print:border-slate-300">
                  <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] tracking-wide text-orange-500 print:text-black">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> BOLETIM DE SEGURANÇA DE LUBRIFICANTES
                  </div>
                  <p className="font-mono text-[10px] pl-0.5 mt-1 text-slate-300 print:text-black leading-tight">
                    {result.oilAdditionalNotes}
                  </p>
                </div>

              </div>

              {/* RECOMMENDED KEY CONSUMABLES AND PARTS TABLE */}
              <div className="lg:col-span-7 bg-[#0c1223] border border-gray-850 p-6 rounded-2xl flex flex-col gap-4 print:border-none print:bg-white print:p-0 col-span-12">
                
                <div className="no-print">
                  <span className="text-[10px] font-mono text-red-500 uppercase font-bold tracking-wider block">PLANILHA DE AUTOPEÇAS RECOMENDADAS</span>
                  <h3 className="text-sm font-bold text-white font-sans mt-0.5">Suprimento Periódico & Filtros</h3>
                </div>

                <div className="hidden print:block print-heading-2">
                  Kit de Peças de Reposição Recomendadas (Sugestão IA)
                </div>

                {/* PARTS ACCORDION TABLE */}
                <div className="overflow-x-auto w-full no-print">
                  <table className="w-full text-xs text-left text-slate-300">
                    <thead className="bg-[#070b13] font-mono text-[9px] uppercase text-slate-500 border-b border-gray-850">
                      <tr>
                        <th className="py-2 px-3">Peça do Motor / Chassi</th>
                        <th className="py-2 px-3">Categoria</th>
                        <th className="py-2 px-3">Código OEM / Referência</th>
                        <th className="py-2 px-3">Notas Rápidas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-850">
                      {result.commonParts && result.commonParts.length > 0 ? (
                        result.commonParts.map((part, index) => (
                          <tr key={index} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-200">
                              {part.name}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                                {part.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[10px] text-red-400">
                              {part.oemReference}
                            </td>
                            <td className="py-2.5 px-3 text-[10px] text-slate-400 leading-tight">
                              {part.shortDescription}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center font-mono text-slate-500">
                            Nenhum componente específico retornado pela central.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PRINT ONLY TABLE */}
                <div className="hidden print:block">
                  <table className="print-table text-xs">
                    <thead>
                      <tr>
                        <th>Nome da Peça</th>
                        <th>Categoria</th>
                        <th>Código OEM / Recomendado</th>
                        <th>Nota Técnica de Troca</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.commonParts && result.commonParts.map((part, index) => (
                        <tr key={index}>
                          <td style={{ fontWeight: 'bold' }}>{part.name}</td>
                          <td>{part.category}</td>
                          <td>{part.oemReference}</td>
                          <td>{part.shortDescription}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* TECHNICAL NOTES & CRITICAL REVEAL */}
                <div className="p-4 rounded-xl bg-slate-900/45 border border-gray-850 print:bg-transparent print:border-slate-350 print:p-3">
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wide flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-red-500" /> DIRETRIZES TÉCNICAS E NOTAS DE ENGENHARIA DE FÁBRICA
                  </span>
                  <p className="text-xs text-slate-300 print:text-black leading-relaxed font-sans mt-2">
                    {result.technicalNotes}
                  </p>
                </div>

              </div>

              {/* PRINT ONLY FOOTER */}
              <div className="hidden print:block w-full border-t border-slate-300 mt-20 pt-4 text-[9px] font-mono text-slate-500 text-center col-span-12">
                <span>** Ficha gerada via IA Copilot Autotech Engenharia em {new Date().toLocaleDateString('pt-BR')}. Confirmar pressões e marcas originais de fábrica nos manuais oficiais da montadora. **</span>
              </div>

            </div>

            {/* MINI INTERACTIVE RE-INQUIRY VEHICLE CHAT SPECIFIC BOX - NO PRINT */}
            <div className="bg-[#0c1223] border border-gray-850 p-6 rounded-2xl space-y-4 text-left no-print">
              <div>
                <h3 className="text-xs font-bold font-mono tracking-wider text-red-500 uppercase flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" /> Dúvidas Avançadas sobre este Veículo ({model})
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Inicie consultas específicas de montagem sobre este carro. Pergunte sobre torque de parafusos, localização de atuadores, reset de avisos de painel, ou quantidade exata de fluidos de transmissão.
                </p>
              </div>

              {/* Chat Output Feed */}
              {qaFeed.length > 0 && (
                <div className="space-y-3 max-h-[250px] overflow-y-auto p-3.5 bg-[#070b13] border border-gray-850 rounded-xl text-xs">
                  {qaFeed.map((item, i) => (
                    <div key={i} className="space-y-1.5 border-b border-gray-900 last:border-b-0 pb-2.5 last:pb-0 text-left">
                      <div className="flex items-center gap-1.5 font-bold text-slate-400 font-mono text-[10px]">
                        <span className="text-red-500">Q:</span> {item.q}
                      </div>
                      <div className="leading-relaxed text-slate-205 pl-3.5 text-slate-300 font-sans border-l border-red-950">
                        {item.a}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Ask Input Form */}
              <form onSubmit={handleAskQuickQuestion} className="flex gap-2">
                <input 
                  type="text"
                  required
                  value={qaInput}
                  onChange={(e) => setQaInput(e.target.value)}
                  placeholder={`Ex: Qual o torque do cabeçote ou vela deste motor de ${model}?`}
                  className="flex-grow bg-[#070b13] border border-gray-805 border-gray-800 focus:border-red-650 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
                <button 
                  type="submit"
                  disabled={qaLoading || !qaInput.trim()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 disabled:bg-slate-900 text-xs font-bold text-white font-mono rounded-xl shrink-0 flex items-center gap-1.5 border border-gray-750 cursor-pointer disabled:cursor-not-allowed"
                >
                  {qaLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-red-500" />}
                  <span>Perguntar</span>
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* NO SEARCH YET JUMBOTRON - NO PRINT */}
      {!result && !loading && (
        <div className="no-print flex flex-col items-center justify-center p-12 bg-[#0c1223] border border-slate-850/60 rounded-2xl text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-900/10 to-slate-900 border border-gray-850 flex items-center justify-center text-red-500 mb-4 animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-bold text-slate-200">Aguardando Especificação de Veículo</h2>
          <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed font-mono">
            Digite a fabricante/modelo, o ano do veículo e motor acima, ou selecione um dos atalhos clássicos para consultar nossa IA de Engenharia Automotiva.
          </p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg text-left text-[10px] font-mono text-slate-500">
            <div className="p-2 border border-slate-850 rounded-xl bg-[#070b13]/40 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0" /> Viscosidade Correta
            </div>
            <div className="p-2 border border-slate-850 rounded-xl bg-[#070b13]/40 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0" /> Códigos de Filtros
            </div>
            <div className="p-2 border border-slate-850 rounded-xl bg-[#070b13]/40 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0" /> Notas de Torque
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
