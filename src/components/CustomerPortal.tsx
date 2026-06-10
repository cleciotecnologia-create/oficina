import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { OrdemServico } from '../types';
import { 
  Wrench, 
  Search, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  User, 
  Car, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Phone, 
  FileText, 
  Info,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerPortalProps {
  initialCpf?: string;
  initialOsId?: string;
  onClose?: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ 
  initialCpf = '', 
  initialOsId = '', 
  onClose 
}) => {
  const { ordensServico, company } = useApp();

  const [cpfInput, setCpfInput] = useState(initialCpf);
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [matchedOSList, setMatchedOSList] = useState<OrdemServico[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Normalize string for safety comparison
  const normalizeNumeric = (str: string) => {
    return str.replace(/\D/g, '');
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchTriggered(true);

    const cleanInput = normalizeNumeric(cpfInput);
    if (!cleanInput) {
      setMatchedOSList([]);
      setSelectedOS(null);
      return;
    }

    // Filter service orders by CPF/CNPJ or specifically by matching ID
    const matches = ordensServico.filter(os => {
      // Find client info
      const clientCpf = os.clientePhone ? normalizeNumeric(os.clientePhone) : ''; // fallback field check if needed
      // Check if checklist or any custom metadata contains cpf
      // Let's match by input CPF or OS ID directly
      const plateMatch = os.plate.toLowerCase().replace(/\s/g, '') === cpfInput.toLowerCase().replace(/\s/g, '');
      const cleanOSIp = normalizeNumeric(os.id);
      
      // Let's search inside order properties
      const isIdMatch = cleanOSIp === cleanInput || os.id.toLowerCase() === cpfInput.toLowerCase();
      
      // In the mockup/context we saved clienteCpfCnpj if edited. Let's do a loose check on phone or customer name
      const isClienteMatch = os.clienteName?.toLowerCase().includes(cpfInput.toLowerCase()) || 
                              (os.clientePhone && normalizeNumeric(os.clientePhone).includes(cleanInput));

      return isIdMatch || isClienteMatch || plateMatch;
    });

    setMatchedOSList(matches);
    if (matches.length > 0) {
      // If there's initialOsId, prefer it. Otherwise select first
      const preferId = matches.find(os => os.id === initialOsId);
      setSelectedOS(preferId || matches[0]);
    } else {
      setSelectedOS(null);
    }
  };

  // Run search on initial fields load
  useEffect(() => {
    if (initialCpf || initialOsId) {
      handleSearch();
    }
  }, [initialCpf, initialOsId, ordensServico]);

  // Copy shareable tracking URL to clipboard
  const handleCopyLink = (os: OrdemServico) => {
    const directUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?cpf=${cpfInput || os.id}&osId=${os.id}`;
    navigator.clipboard.writeText(directUrl);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 3000);
  };

  // Status timeline nodes list with state color matches
  const timelinePhases = [
    { key: 'Aberta', label: 'Triagem', desc: 'Sua OS foi cadastrada na recepção da oficina.', color: 'text-blue-400' },
    { key: 'Em análise', label: 'Escanear Diagnóstico', desc: 'A equipe de engenharia analisa os módulos mecânicos.', color: 'text-yellow-400' },
    { key: 'Aguardando peça', label: 'Peças em Trânsito', desc: 'Reposições solicitadas diretamente à fábrica.', color: 'text-orange-400' },
    { key: 'Em execução', label: 'Mão de Obra do Pistão', desc: 'A mão de obra está ativa trabalhando no defeito.', color: 'text-rose-500 font-extrabold' },
    { key: 'Garantia Reaberta', label: 'Análise de Garantia', desc: 'Retornou ao pátio técnico para reavaliação minuciosa.', color: 'text-purple-400 font-extrabold' },
    { key: 'Finalizada', label: 'Testes Finais / Lavagem', desc: 'Regulagem eletrônica feita. Pronto para entrega!', color: 'text-green-400' },
    { key: 'Entregue', label: 'Histórico Concluído', desc: 'Veículo liberado e entregue com certificado técnico.', color: 'text-emerald-400' }
  ];

  const getStatusIndex = (status: string) => {
    const idx = timelinePhases.findIndex(p => p.key === status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="min-h-screen bg-[#050810] text-[#f8fafc] font-sans flex flex-col justify-between selection:bg-red-500 selection:text-white">
      {/* Header Bar */}
      <header className="border-b border-[#1e293b]/70 bg-[#070b16] px-4 py-3.5 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-650 to-red-500 flex items-center justify-center shadow-md">
              <Wrench className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-widest text-white uppercase block leading-none">ACOMPANHAMENTO</span>
              <span className="text-[10px] text-[#94a3b8] font-mono uppercase tracking-wider">{company.name.toUpperCase()}</span>
            </div>
          </div>

          {onClose && (
            <button 
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-[#1e293b] hover:bg-[#111c30] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-slate-300"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao ERP
            </button>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-6">
        
        {/* Verification query row */}
        <section className="bg-[#0b1329] border border-[#1e293b] rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-red-650/5 blur-3xl rounded-full"></div>
          <div className="absolute left-1/3 bottom-0 w-40 h-40 bg-purple-650/5 blur-3xl rounded-full"></div>

          <div className="max-w-md">
            <span className="text-[9.5px] font-mono text-red-400 font-bold uppercase tracking-widest block mb-1.5">🔬 CONSULTA DE STATUS EM REAL TIME</span>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">Consulte sua Ordem de Serviço</h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Consulte o status em tempo real da mão de obra do seu veículo inserindo o <strong className="text-slate-300">NOME DO CLIENTE, TELEFONE, PLACA ou CÓDIGO DA OS</strong>.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 mt-5">
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Nome, Telefone, Placa ou Ordem nº" 
                  value={cpfInput}
                  onChange={(e) => setCpfInput(e.target.value)}
                  className="w-full bg-[#050810] border border-[#1e293b] rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              <button 
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-lg shadow-red-950/20"
              >
                CONSULTAR
              </button>
            </form>
          </div>
        </section>

        {/* Results Area */}
        {searchTriggered && matchedOSList.length === 0 && (
          <div className="text-center py-16 bg-[#0a0f1d] border border-[#1e293b] rounded-2xl p-6">
            <AlertTriangle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <span className="font-mono font-extrabold text-sm block text-white uppercase">Nenhuma Ordem de Serviço Localizada</span>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
              Não encontramos nenhuma OS vinculada ao termo "<span className="text-slate-300 font-bold">{cpfInput}</span>". Verifique os dígitos e tente novamente ou entre em contato com nosso suporte técnico.
            </p>
          </div>
        )}

        {searchTriggered && matchedOSList.length > 0 && selectedOS && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Sidebar list of customer OSs */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-slate-500 font-extrabold uppercase tracking-wider block px-1">Ordens Vinculadas ({matchedOSList.length})</span>
              <div className="flex flex-col gap-2">
                {matchedOSList.map((os) => (
                  <button
                    key={os.id}
                    onClick={() => setSelectedOS(os)}
                    className={`p-4 rounded-xl border text-left flex flex-col gap-1.5 transition-all text-xs cursor-pointer ${selectedOS.id === os.id ? 'bg-[#111c30] border-red-500/50 shadow-md shadow-red-950/10' : 'bg-[#090e1a] border-[#1e293b] hover:bg-[#0e172a]'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-white uppercase">OS #{os.id}</span>
                      <span className={`text-[8.5px] font-mono border px-1.5 py-0.5 rounded uppercase font-bold 
                        ${os.status === 'Garantia Reaberta' ? 'border-purple-600 bg-purple-950/30 text-purple-400' :
                          os.status === 'Finalizada' || os.status === 'Entregue' ? 'border-green-600 bg-green-950/30 text-green-400' :
                          'border-slate-800 bg-slate-900 text-slate-300'}`}
                      >
                        {os.status}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      <span>Veículo: <strong className="text-slate-200">{os.veiculoInfo}</strong></span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Entrada: {new Date(os.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </button>
                ))}
              </div>

              {/* Quick WhatsApp Support Call */}
              <div className="bg-[#0b1329] border border-green-950/30 rounded-xl p-4 flex flex-col gap-3">
                <span className="text-[10px] font-mono text-green-400 font-bold uppercase tracking-wider block">💬 Fale Conosco Diretamente</span>
                <p className="text-[11px] text-slate-400 leading-normal font-sans">
                  Deseja acelerar a liberação de peças, fazer uma sugestão ou agendar a entrega técnica do veículo?
                </p>
                <a
                  href={`https://wa.me/${company.phone?.replace(/[^0-9]/g, '') || '5511987654321'}?text=${encodeURIComponent(`Olá! Gostaria de falar sobre a Ordem de Serviço #${selectedOS.id} do veículo ${selectedOS.veiculoInfo}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 rounded-lg bg-green-600 hover:bg-green-700 font-bold font-sans text-xs text-white text-center flex items-center justify-center gap-1.5 transition-all shadow shadow-green-950/40"
                >
                  <Phone className="w-3.5 h-3.5 text-white" /> Acionar WhatsApp da Oficina
                </a>
              </div>
            </div>

            {/* Detailed Tracking Workspace */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Active Header Card */}
              <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-mono font-extrabold text-sm tracking-widest uppercase">ORDEM DE SERVIÇO #{selectedOS.id}</span>
                    <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">Código Oficial Autenticado</span>
                  </div>
                  <span className="text-lg font-bold text-white mt-1">🚙 {selectedOS.veiculoInfo}</span>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                    <span>Placa do Carro: <strong className="text-slate-200 select-all">{selectedOS.plate.toUpperCase()}</strong></span>
                    <span>•</span>
                    <span>Odômetro: <strong className="text-slate-200">{selectedOS.km.toLocaleString('pt-BR')} KM</strong></span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1 font-mono text-right shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase">Investimento Total Estimado</span>
                  <span className="text-xl font-black text-white">
                    R$ {selectedOS.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    onClick={() => handleCopyLink(selectedOS)}
                    className="mt-2 text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 uppercase transition-colors"
                  >
                    <Link2 className="w-3 h-3 text-cyan-400" />
                    {copyFeedback ? 'Link Copiado!' : 'Copiar Link de Acompanhamento'}
                  </button>
                </div>
              </div>

              {/* Interactive Status Timeline Progress Track */}
              <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 relative shadow-lg overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-purple-650/5 blur-3xl rounded-full"></div>

                <span className="text-[10px] font-mono text-slate-500 font-extrabold uppercase tracking-wider block">📈 LINHA DO TEMPO DA MÃO DE OBRA AUTOMOTIVA</span>

                {/* Progress bar container */}
                <div className="relative mt-2">
                  
                  {/* Background Track Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#1e293b] -translate-y-1/2 hidden md:block rounded-full"></div>
                  
                  {/* Active Track Line progress percentage width */}
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-red-600 -translate-y-1/2 hidden md:block rounded-full transition-all duration-700"
                    style={{
                      width: `${(getStatusIndex(selectedOS.status) / (timelinePhases.length - 1)) * 100}%`
                    }}
                  ></div>

                  {/* Horizontal Nodes list */}
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-5 relative z-10">
                    {timelinePhases.map((phase, index) => {
                      const isCompleted = getStatusIndex(selectedOS.status) >= index;
                      const isActive = selectedOS.status === phase.key;

                      return (
                        <div key={phase.key} className="flex md:flex-col items-center gap-4 md:gap-2.5 text-center">
                          <div 
                            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all shrink-0 
                              ${isActive 
                                ? 'bg-red-950 border-red-500 text-red-400 ring-4 ring-red-950 animate-pulse' 
                                : isCompleted 
                                ? 'bg-[#111c30] border-red-650 text-red-500' 
                                : 'bg-[#050810] border-[#1e293b] text-slate-650'}`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-4.5 h-4.5" /> : <Clock className="w-4 h-4" />}
                          </div>

                          <div className="flex flex-col text-left md:text-center">
                            <span className={`text-[10.5px] font-mono font-extrabold block leading-normal ${isActive ? phase.color : isCompleted ? 'text-slate-350' : 'text-slate-500'}`}>
                              {phase.label}
                            </span>
                            <span className="text-[9px] text-slate-500 font-sans mt-0.5 max-w-[120px] md:mx-auto">
                              {phase.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Status Indicator Panel Alert banner */}
                <div className={`p-4 rounded-xl border leading-relaxed text-xs font-mono flex flex-col gap-1 
                  ${selectedOS.status === 'Garantia Reaberta' 
                    ? 'bg-purple-950/20 border-purple-900/50 text-purple-300' 
                    : selectedOS.status === 'Finalizada' || selectedOS.status === 'Entregue'
                    ? 'bg-green-950/20 border-green-950/50 text-green-300'
                    : 'bg-slate-950/30 border-slate-900 text-slate-300'}`}
                >
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    STATUS OPERACIONAL DO VEÍCULO: <strong className="underline">{selectedOS.status.toUpperCase()}</strong>
                  </div>
                  {selectedOS.status === 'Garantia Reaberta' ? (
                    <div className="mt-1 font-sans">
                      <p className="font-bold text-xs text-purple-200">
                        ⚠️ ATENÇÃO: Reabertura Técnica de Garantia em Andamento.
                      </p>
                      <p className="text-[11px] text-purple-400 mt-1 italic">
                        "Reaberta para garantir a repetição da mão de obra sem novos custos. Detalhe do sintoma: {selectedOS.reopenReason}"
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 font-sans text-slate-400 leading-normal">
                      Nosso time de mecânicos está atualizando os logs técnicos em tempo real. Você receberá uma notificação no WhatsApp assim que o veículo avançar nas etapas de manutenção.
                    </p>
                  )}
                </div>

              </div>

              {/* Handiwork components Parts and Handiwork service cost checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Labor Checklist Panel */}
                <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                  <span className="text-[9.5px] font-mono text-slate-500 font-extrabold uppercase tracking-wider block">🔧 SERVIÇOS E MÃO DE OBRA EXECUTADOS</span>
                  
                  {selectedOS.services.length === 0 ? (
                    <span className="text-[11px] font-sans font-medium text-slate-500 italic block py-4 text-center">Nenhum serviço prescrito nesta OS ainda.</span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {selectedOS.services.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs border-b border-[#1e293b]/50 pb-2">
                          <div className="flex items-start gap-1.5 font-sans">
                            <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-slate-200 font-medium block leading-tight">{it.name}</span>
                              <span className="text-[9px] text-slate-500 font-mono block uppercase">Mão de obra homologada</span>
                            </div>
                          </div>
                          <span className="font-mono text-slate-350 text-right font-medium">
                            R$ {it.subtotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Parts Replaced Panel */}
                <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-2xl p-5 shadow-lg flex flex-col gap-4">
                  <span className="text-[9.5px] font-mono text-slate-500 font-extrabold uppercase tracking-wider block">📦 PEÇAS DE REPOSIÇÃO CADASTRADAS</span>
                  
                  {selectedOS.parts.length === 0 ? (
                    <span className="text-[11px] font-sans font-medium text-slate-500 italic block py-4 text-center">Nenhuma peça de reposição incorporada até o momento.</span>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {selectedOS.parts.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs border-b border-[#1e293b]/50 pb-2">
                          <div className="font-sans flex flex-col gap-0.5">
                            <span className="text-slate-200 font-medium leading-tight">
                              {it.name} 
                              {it.suppliedByClient && (
                                <span className="text-[8.5px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded ml-1.5 font-mono uppercase font-bold">
                                  Trazida p/ Cliente
                                </span>
                              )}
                            </span>
                            <span className="text-[9.5px] text-slate-500 font-mono">Quant: {it.quantity}x • Código {it.id.substring(0, 5)}</span>
                          </div>
                          <span className="font-mono text-slate-350 font-medium">
                            R$ {it.suppliedByClient ? '0,00' : ((it.sellPrice || 0) * it.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Checklist visual feedback panel */}
              {selectedOS.checklist && selectedOS.checklist.length > 0 && (
                <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-2xl p-6 shadow-lg flex flex-col gap-4">
                  <span className="text-[9px] font-mono text-slate-500 font-extrabold uppercase tracking-wider block">🛡️ CERTIFICADO DE INSPEÇÃO DE SEGURANÇA</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedOS.checklist.map((c, idx) => (
                      <div key={idx} className="bg-[#050810] border border-[#1e293b] p-3 rounded-xl flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300 font-medium truncate pr-1">{c.label}</span>
                        <span className={`text-[8.5px] p-1 px-2.5 rounded font-bold uppercase leading-none shrink-0 
                          ${c.status === 'ok' ? 'bg-green-950/30 text-green-400 border border-green-950/40' : 
                            c.status === 'fail' ? 'bg-red-950/30 text-red-400 border border-red-950/40' : 
                            'bg-slate-900 text-slate-400'}`}
                        >
                          {c.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pre-existing damage entry photos gallery */}
              {selectedOS.photoUrls && selectedOS.photoUrls.length > 0 && (
                <div className="bg-[#0a0f1d] border border-[#1e293b] rounded-2xl p-6 shadow-lg flex flex-col gap-4 text-left">
                  <span className="text-[9.5px] font-mono text-slate-500 font-extrabold uppercase tracking-wider block">📸 REGISTROS FOTOGRÁFICOS DE RECEPÇÃO ({selectedOS.photoUrls.length})</span>
                  <p className="text-[11px] text-slate-400 font-sans leading-normal -mt-2">
                    Fotos registradas pela nossa recepção no momento da entrada do veículo para documentar o estado de conservação do carro e registrar danos ou riscos pré-existentes.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
                    {selectedOS.photoUrls.map((photo, pIdx) => (
                      <div 
                        key={pIdx} 
                        className="relative rounded-xl border border-[#1e293b] hover:border-orange-500/80 aspect-square overflow-hidden cursor-pointer transition-all duration-150 transform hover:scale-105 shadow-md bg-slate-950 flex items-center justify-center"
                        onClick={() => {
                          setActiveLightboxImage(photo);
                        }}
                        title="Clique para ampliar esta foto de entrada"
                      >
                        <img src={photo} alt={`Registro Entrada ${pIdx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[8.5px] font-mono text-orange-400 font-bold border border-[#1e293b]/40">
                          IMAGEM {pIdx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* Footer Branding Area */}
      <footer className="border-t border-[#1e293b]/30 bg-[#04070e] py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-bold uppercase">{company.name}</span>
            <span>•</span>
            <span className="text-[10px]">AutoTech Cloud ERP Portal</span>
          </div>
          <span className="text-[10px] text-slate-500 select-none">
            © {new Date().getFullYear()} AutoTech Systems. Ambientes integrados com Google Gemini AI e Firebase.
          </span>
        </div>
      </footer>

      {/* Lightbox Zoom Overlay for Photos */}
      {activeLightboxImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setActiveLightboxImage(null)}
        >
          <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
            <span className="text-[10px] text-gray-400 font-mono">Clique em qualquer lugar para fechar</span>
            <button
              type="button"
              className="p-2 rounded-full bg-slate-900 border border-slate-800 text-gray-300 hover:text-white transition cursor-pointer"
              onClick={() => setActiveLightboxImage(null)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="max-w-4xl w-full max-h-[85vh] flex items-center justify-center relative" onClick={(e) => e.stopPropagation()}>
            <img 
              src={activeLightboxImage} 
              alt="Ampliação da vistoria do veículo" 
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl border border-gray-800" 
            />
          </div>
        </div>
      )}

    </div>
  );
};
