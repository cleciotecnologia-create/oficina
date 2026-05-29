import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Cpu, 
  Phone, 
  FileCheck, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  User, 
  Car, 
  ChevronRight, 
  Printer, 
  X,
  MessageSquare,
  Sparkles,
  Bell,
  CalendarRange,
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrdemServico, ServiceItem, PartUsed, Cliente, Veiculo, Servico } from '../types';
import { AUTO_SUGGESTIONS } from '../lib/autoSuggestions';

export const OSView: React.FC = () => {
  const { 
    ordensServico, 
    addOS, 
    editOS, 
    deleteOS,
    addVeiculo,
    clientes, 
    veiculos, 
    produtos, 
    servicos,
    getSmartDiagnosis, 
    aiLoading 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'lista' | 'nova'>('lista');
  const [searchPlate, setSearchPlate] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todas');

  // Quick vehicle registration inside new OS creation
  const [showQuickVehicle, setShowQuickVehicle] = useState(false);
  const [quickBrand, setQuickBrand] = useState('');
  const [quickModel, setQuickModel] = useState('');
  const [quickYear, setQuickYear] = useState('2022');
  const [quickEngine, setQuickEngine] = useState('1.6 Flex');
  const [quickPlate, setQuickPlate] = useState('');
  const [quickKm, setQuickKm] = useState('');
  const [quickModelsList, setQuickModelsList] = useState<string[]>([]);
  const [quickVehSuccess, setQuickVehSuccess] = useState<string | null>(null);

  // New OS form states
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Veiculo | null>(null);
  const [problemText, setProblemText] = useState('');
  const [diagnosisText, setDiagnosisText] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('Marcio Rezende');
  const [kmStr, setKmStr] = useState('');

  // Reminder configurations
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [vencimentoDays, setVencimentoDays] = useState(30);
  const [reminderDays, setReminderDays] = useState(3);

  // Checklist states
  const [checklist, setChecklist] = useState([
    { label: "Nível de Óleo do Motor", status: "ok" as const },
    { label: "Nível do Fluido de Freio", status: "ok" as const },
    { label: "Inspeção de Pastilhas/Discos", status: "ok" as const },
    { label: "Luzes de Sinalização", status: "ok" as const },
    { label: "Água do Radiador", status: "ok" as const },
    { label: "Estado do Filtro de Cabine", status: "na" as const }
  ]);

  // Added items in current OS builder
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [parts, setParts] = useState<PartUsed[]>([]);
  
  // Custom manual service inputs
  const [selectedSrvId, setSelectedSrvId] = useState('');
  const [manualServiceDesc, setManualServiceDesc] = useState('');
  const [manualServicePrice, setManualServicePrice] = useState('');

  // Custom manual parts input selector
  const [selectedProdId, setSelectedProdId] = useState('');
  const [selectedProdQty, setSelectedProdQty] = useState('1');

  // Print/Share modal states
  const [activeOSForModal, setActiveOSForModal] = useState<OrdemServico | null>(null);
  const [whatsappTextCreated, setWhatsappTextCreated] = useState('');
  const [customSignName, setCustomSignName] = useState('');

  // AI Diagnostic output helper
  const [aiDiagnosticSummary, setAiDiagnosticSummary] = useState<any | null>(null);

  // Status Colors Mapping
  const statusColors: Record<string, string> = {
    'Aberta': 'border-blue-900 bg-blue-950/20 text-blue-400',
    'Em análise': 'border-yellow-900 bg-yellow-950/20 text-yellow-400',
    'Aguardando peça': 'border-orange-950 bg-orange-950/20 text-orange-400',
    'Em execução': 'border-red-950 bg-red-950/25 text-red-500 font-bold',
    'Finalizada': 'border-green-900 bg-green-950/20 text-green-400'
  };

  // Filter OS list
  const filteredOS = ordensServico.filter(os => {
    const matchSearch = os.plate.toLowerCase().includes(searchPlate.toLowerCase()) || 
                        os.clienteName.toLowerCase().includes(searchPlate.toLowerCase()) ||
                        os.id.toLowerCase().includes(searchPlate.toLowerCase());
    const matchStatus = statusFilter === 'Todas' || os.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Call Gemini AI Auto Diagnosis
  const handleAiAutoDiagnosis = async () => {
    if (!selectedVehicle || !problemText) {
      alert("Por favor, selecione primeiro um Veículo de cliente e preencha o campo de Sinais/Problemas para que a inteligência do Gemini possa interpretar os erros!");
      return;
    }
    
    const specCar = `${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.year} - ${selectedVehicle.engine}`;
    
    // Call Context API Gemini Endpoint
    const result = await getSmartDiagnosis("gemini-2.5-flash", selectedVehicle.plate, `Veículo: ${specCar}. Sintomas relatados: ${problemText}`);
    
    if (result) {
      setAiDiagnosticSummary(result);
      setDiagnosisText(result.diagnosis || "Surgiram indicações de fadiga estrutural nos componentes mecânicos analisados.");
      
      // Inject suggested service if available
      if (result.suggestedServices && result.suggestedServices.length > 0) {
        const mappedSrvs: ServiceItem[] = result.suggestedServices.map((apiSrv: any, index: number) => ({
          id: "srv_ai_" + index,
          description: apiSrv.description || "Inspeção Mecânica Relacionada",
          price: parseFloat(String(apiSrv.estLaborCost).replace(/[^0-9.]/g, '')) || 90
        }));
        setServices(prev => [...prev, ...mappedSrvs]);
      }
    }
  };

  // Auto-select newly created vehicle in OS flow when veiculos array updates
  useEffect(() => {
    if (showQuickVehicle && !selectedVehicle && veiculos.length > 0 && selectedClient) {
      const clientVehicles = veiculos.filter(v => v.clienteId === selectedClient.id);
      if (clientVehicles.length > 0) {
        const lastCreated = clientVehicles[clientVehicles.length - 1];
        setSelectedVehicle(lastCreated);
      }
    }
  }, [veiculos]);

  const handleQuickVehicleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      alert("Por favor, selecione primeiro um cliente integrado.");
      return;
    }
    if (!quickPlate || !quickBrand || !quickModel) {
      alert("Preencha Placa, Marca e Modelo do carro.");
      return;
    }

    try {
      const newVehObj = {
        clienteId: selectedClient.id,
        brand: quickBrand,
        model: quickModel,
        year: quickYear || '2022',
        engine: quickEngine || '1.6 Flex',
        plate: quickPlate.toUpperCase().trim(),
        chassi: 'CADASTRO RÁPIDO OS',
        km: parseInt(quickKm) || 0
      };

      await addVeiculo(newVehObj);

      setQuickVehSuccess(`🎉 Veículo ${quickBrand} ${quickModel} (${quickPlate.toUpperCase()}) cadastrado e vinculado com sucesso!`);
      
      setQuickBrand('');
      setQuickModel('');
      setQuickPlate('');
      setQuickKm('');
      setQuickModelsList([]);
      
      setTimeout(() => {
        setQuickVehSuccess(null);
        setShowQuickVehicle(false);
      }, 2500);
      
    } catch (err: any) {
      alert("Houve um problema ao cadastrar o veículo: " + (err.message || err));
    }
  };

  // Add Catalog service row
  const handleAddCatalogService = (srvId: string) => {
    if (!srvId) return;
    const srv = servicos.find(s => s.id === srvId);
    if (!srv) return;
    const item: ServiceItem = {
      id: "srv_cat_" + Math.random().toString(36).substr(2, 5),
      description: srv.name,
      price: srv.price
    };
    setServices(prev => [...prev, item]);
    setSelectedSrvId('');
  };

  // Add Manual service row
  const handleAddManualService = () => {
    if (!manualServiceDesc || !manualServicePrice) return;
    const item: ServiceItem = {
      id: "srv_" + Math.random().toString(36).substr(2, 5),
      description: manualServiceDesc,
      price: parseFloat(manualServicePrice) || 0
    };
    setServices(prev => [...prev, item]);
    setManualServiceDesc('');
    setManualServicePrice('');
  };

  // Add Part to OS
  const handleAddPartToOS = () => {
    if (!selectedProdId) return;
    const prod = produtos.find(p => p.id === selectedProdId);
    if (!prod) return;

    const qty = parseInt(selectedProdQty) || 1;
    const item: PartUsed = {
      id: prod.id,
      name: prod.name,
      sellPrice: prod.sellPrice,
      quantity: qty
    };

    setParts(prev => [...prev, item]);
    setSelectedProdId('');
    setSelectedProdQty('1');
  };

  // Handle Checklist Status change click
  const toggleChecklistStatus = (index: number, nextStatus: 'ok' | 'fail' | 'na') => {
    setChecklist(prev => prev.map((item, idx) => 
      idx === index ? { ...item, status: nextStatus } : item
    ));
  };

  // Total current sum
  const osCalculatedTotal = () => {
    const srvTotal = services.reduce((sum, item) => sum + item.price, 0);
    const prtTotal = parts.reduce((sum, item) => sum + (item.sellPrice * item.quantity), 0);
    return srvTotal + prtTotal;
  };

  // Save full Order Servico
  const handleSaveOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !selectedVehicle || !problemText) {
      alert("Campos Obrigatórios ausentes (Cliente, Veículo ou Descrição do Sintoma).");
      return;
    }

    const payload = {
      clienteId: selectedClient.id,
      clienteName: selectedClient.name,
      clientePhone: selectedClient.phone,
      veiculoId: selectedVehicle.id,
      veiculoInfo: `${selectedVehicle.brand} ${selectedVehicle.model} - (${selectedVehicle.plate})`,
      plate: selectedVehicle.plate,
      km: parseInt(kmStr) || selectedVehicle.km,
      problem: problemText,
      diagnosis: diagnosisText || "Aguardando diagnóstico mecânico detalhado.",
      status: "Aberta" as const,
      mechanicId: "staff_2",
      mechanicName: assignedStaff,
      services: [...services],
      parts: [...parts],
      checklist: [...checklist],
      total: osCalculatedTotal(),
      reminderEnabled,
      vencimentoDays: Number(vencimentoDays),
      reminderDays: Number(reminderDays)
    };

    await addOS(payload);

    // Reset Form
    setSelectedClient(null);
    setSelectedVehicle(null);
    setProblemText('');
    setDiagnosisText('');
    setKmStr('');
    setServices([]);
    setParts([]);
    setReminderEnabled(true);
    setVencimentoDays(30);
    setReminderDays(3);
    setChecklist([
      { label: "Nível de Óleo do Motor", status: "ok" as const },
      { label: "Nível do Fluido de Freio", status: "ok" as const },
      { label: "Inspeção de Pastilhas/Discos", status: "ok" as const },
      { label: "Luzes de Sinalização", status: "ok" as const },
      { label: "Água do Radiador", status: "ok" as const },
      { label: "Estado do Filtro de Cabine", status: "na" as const }
    ]);
    setAiDiagnosticSummary(null);
    setActiveTab('lista');
  };

  // Build WhatsApp template text link
  const createWhatsAppShare = (os: OrdemServico) => {
    const isReady = os.services.length > 0 || os.parts.length > 0;
    const msg = `Olá *${os.clienteName}*! Tudo bem? 

Sua Ordem de Serviço *${os.id}* do veículo *${os.veiculoInfo}* foi avaliada por nossa equipe de mecânicos.

🔍 *Diagnóstico Técnico:*
"${os.problem}"

🛠️ *Serviços/Peças Propostos:*
${os.services.map(s => `- ${s.description}: R$ ${s.price.toFixed(2)}`).join('\n')}
${os.parts.map(p => `- Peça ${p.name} (x${p.quantity}): R$ ${(p.sellPrice * p.quantity).toFixed(2)}`).join('\n')}

💵 *Valor Total Orçado:*
*R$ ${os.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*

Por gentileza, acesse este canal ou responda essa mensagem para aprovar a execução dos serviços! Obrigado.`;

    setWhatsappTextCreated(msg);
    setActiveOSForModal(os);
  };

  // Execute client digital authorization footprint sign
  const handleDigitalSignOS = async () => {
    if (!activeOSForModal) return;
    const signString = `Assinado Digitalmente por ${customSignName || activeOSForModal.clienteName} em ${new Date().toLocaleString()} - IP Autorizado Token OS_SIGN_${Math.floor(100+Math.random()*900)}`;
    
    await editOS(activeOSForModal.id, { 
      signature: signString,
      status: "Em execução"
    });

    setCustomSignName('');
    setActiveOSForModal(null);
    alert("Ordem de serviço devidamente assinada! O status mudou automaticamente para 'Em execução'.");
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
            🛠️ ORDENS DE SERVIÇO (OS)
          </h1>
          <p className="text-xs text-gray-400 font-mono">Checklists de pátio, orçamentos, inteligência mecânica de diagnóstico e assinaturas.</p>
        </div>

        <div className="flex bg-[#080d19] p-1 rounded-xl border border-gray-800 self-stretch sm:self-auto [&>button]:px-3.5 [&>button]:py-1.5 [&>button]:text-xs [&>button]:font-mono [&>button]:rounded-lg">
          <button 
            onClick={() => setActiveTab('lista')}
            className={activeTab === 'lista' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
          >
            Fila Ativa de OS
          </button>
          <button 
            onClick={() => setActiveTab('nova')}
            className={activeTab === 'nova' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
          >
            + Abrir Nova OS
          </button>
        </div>
      </div>

      {activeTab === 'lista' && (
        <>
          {/* List filter tools */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#0a0f1d] p-4 rounded-xl border border-gray-905 border-gray-900">
            <div className="relative md:col-span-8">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Pesquise por placa do carro, código de OS, ou nome do cliente..."
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value)}
                className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2 px-4 pl-10 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="md:col-span-4">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#080c16] border border-gray-800 py-2.5 px-3 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              >
                <option value="Todas">Status: Todas</option>
                <option value="Aberta">Aberta</option>
                <option value="Em análise">Em análise</option>
                <option value="Aguardando peça">Aguardando peça</option>
                <option value="Em execução">Em execução</option>
                <option value="Finalizada">Finalizada</option>
              </select>
            </div>
          </div>

          {/* OS Listing Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOS.map((os) => (
              <div 
                key={os.id}
                className="p-5 bg-[#0c1223] rounded-2xl border border-gray-800 flex flex-col justify-between hover:border-red-500/20 transition-all text-left relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white tracking-widest">{os.id}</span>
                      <span className={`text-[9px] font-mono border px-1.5 py-0.5 rounded ${statusColors[os.status] || 'border-slate-800'}`}>
                        {os.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 block mt-1 font-sans font-semibold">🚙 {os.veiculoInfo}</span>
                  </div>

                  <span className="text-sm font-mono font-extrabold text-white">
                    R$ {os.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="text-xs text-slate-400 line-clamp-2 my-2.5 italic border-l-2 border-red-500/30 pl-2">
                  "{os.problem}"
                </div>

                {/* Sub features checklist indicators */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-500 my-2">
                  <span>Mecânico: <strong className="text-gray-300">{os.mechanicName}</strong></span>
                  <span>Clientes: <strong className="text-gray-300">{os.clienteName}</strong></span>
                  <span>Trocas/Peças: <strong className="text-gray-300">{os.parts.length} itens</strong></span>
                  <span>Serviços: <strong className="text-gray-300">{os.services.length}</strong></span>
                </div>

                {/* WhatsApp Reminder configuration details */}
                {os.reminderEnabled && (
                  <div className="mt-2.5 p-2.5 bg-slate-950/40 border border-gray-850 rounded-xl flex items-center justify-between text-[10.5px] font-mono">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-purple-400" />
                      Lembrete: WhatsApp ({os.reminderDays}d antes)
                    </span>
                    <span className="text-purple-400 font-bold">
                      Disparo: {(() => {
                        const date = new Date(os.createdAt);
                        date.setDate(date.getDate() + (os.vencimentoDays || 30) - (os.reminderDays || 3));
                        return date.toLocaleDateString('pt-BR');
                      })()}
                    </span>
                  </div>
                )}

                {/* Footer buttons of each card */}
                <div className="mt-4 pt-3 border-t border-gray-850 flex items-center justify-between gap-3 font-mono text-[10px]">
                  
                  <div>
                    {os.signature ? (
                      <span className="text-green-500 font-bold">✓ ASSINADO DIGITALMENTE</span>
                    ) : (
                      <span className="text-yellow-500">⚠ AGUARDANDO ASSINATURA</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => createWhatsAppShare(os)}
                      className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-green-400 flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" /> Enviar Orçamento
                    </button>
                    
                    <select 
                      value={os.status}
                      onChange={async (e) => {
                        await editOS(os.id, { status: e.target.value as any });
                      }}
                      className="bg-black/40 border border-gray-800 rounded px-2 py-1 text-[9px] font-mono text-slate-300"
                    >
                      <option value="Aberta">Mudar: Aberta</option>
                      <option value="Em análise">Mudar: Em análise</option>
                      <option value="Aguardando peça">Mudar: Em peça</option>
                      <option value="Em execução">Mudar: Em execução</option>
                      <option value="Finalizada">Mudar: Finalizada</option>
                    </select>

                    <button
                      type="button"
                      id={`btn-delete-os-${os.id}`}
                      onClick={async () => {
                        if (confirm(`Tem certeza que deseja excluir permanentemente a Ordem de Serviço #${os.id}?`)) {
                          await deleteOS(os.id);
                        }
                      }}
                      className="p-1.5 rounded bg-slate-900 border border-red-950 hover:bg-red-950/20 text-red-500 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                      title="Excluir OS"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            ))}
            {filteredOS.length === 0 && (
              <div className="col-span-2 text-center py-20 text-gray-500">
                Nenhuma Ordem de Serviço conditizente localizada nesta consulta.
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'nova' && (
        <form onSubmit={handleSaveOS} className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6 w-full">
          <div className="border-b border-gray-850 pb-4">
            <h3 className="font-display font-extrabold text-white text-base">ABRIR NOVA ORDEM DE SERVIÇO</h3>
            <span className="text-xs text-gray-400 font-mono">Associe o cadastro de clientes, execute vistorias físicas e defina o pátio de execução.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* Passenger Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-gray-400 uppercase">1. ASSOCIE CLIENTE INTEGRADO</label>
              <select 
                value={selectedClient?.id || ''}
                onChange={(e) => {
                  const found = clientes.find(c => c.id === e.target.value);
                  setSelectedClient(found || null);
                }}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white"
                required
              >
                <option value="">-- Selecione Cliente --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.cpfCnpj})</option>
                ))}
              </select>
            </div>

            {/* Vehicle spec linkage */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-gray-400 uppercase">2. VINCULE O VEÍCULO DE ENTRADA</label>
                {selectedClient && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickVehicle(prev => !prev);
                      setQuickVehSuccess(null);
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer bg-red-950/10 hover:bg-red-950/20 py-1 px-2.5 rounded-lg border border-red-950/50"
                  >
                    {showQuickVehicle ? "✕ Cancelar Registro" : "+ Cadastrar Veículo Rápido"}
                  </button>
                )}
              </div>

              {showQuickVehicle ? (
                <div className="bg-[#050912]/90 border border-red-950/60 rounded-xl p-4 flex flex-col gap-3 text-left">
                  <div className="flex items-center gap-2 text-red-400 font-mono text-[10px] font-bold uppercase tracking-widest border-b border-red-950/40 pb-1.5">
                    <span>🚗 Novo Cadastro Integrado</span>
                  </div>

                  {quickVehSuccess && (
                    <div className="p-2.5 bg-green-950/30 border border-green-800 rounded-lg text-xs text-green-300 font-mono animate-fadeIn">
                      {quickVehSuccess}
                    </div>
                  )}

                  {!quickVehSuccess && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-gray-400 font-mono">PLACA *</label>
                          <input
                            type="text"
                            placeholder="GOLF-2018"
                            value={quickPlate}
                            onChange={(e) => setQuickPlate(e.target.value.toUpperCase())}
                            maxLength={9}
                            className="bg-black/40 border border-gray-800 rounded-lg py-1.5 px-2.5 text-xs text-white uppercase outline-none focus:border-red-500 font-mono text-center"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-gray-400 font-mono">KM ATUAL</label>
                          <input
                            type="number"
                            placeholder="Ex: 50000"
                            value={quickKm}
                            onChange={(e) => setQuickKm(e.target.value)}
                            className="bg-black/40 border border-gray-800 rounded-lg py-1.5 px-2.5 text-xs text-white outline-none focus:border-red-550 font-mono text-center"
                          />
                        </div>
                      </div>

                      {/* Brand suggestions panel */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] text-gray-400 font-mono">MARCA *</label>
                          {quickBrand && (
                            <span className="text-[9px] text-red-400 font-mono font-bold uppercase">{quickBrand} selecionada</span>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Volkswagen"
                          value={quickBrand}
                          onChange={(e) => {
                            setQuickBrand(e.target.value);
                            const foundSug = AUTO_SUGGESTIONS.find(s => s.name.toLowerCase() === e.target.value.toLowerCase());
                            if (foundSug) {
                              setQuickModelsList(foundSug.models);
                            }
                          }}
                          className="bg-black/40 border border-gray-800 rounded-lg py-1.5 px-2.5 text-xs text-white outline-none focus:border-red-500"
                          required
                        />

                        {/* Brand quick pills */}
                        <div className="flex flex-wrap gap-1 mt-1 pb-1 max-h-24 overflow-y-auto pr-1">
                          {AUTO_SUGGESTIONS.map((sug) => (
                            <button
                              key={sug.name}
                              type="button"
                              onClick={() => {
                                setQuickBrand(sug.name);
                                setQuickModelsList(sug.models);
                                setQuickModel(''); // reset model when brand changes
                              }}
                              className={`px-2 py-1 rounded-lg text-[9.5px] font-medium font-sans transition-all flex items-center gap-1 cursor-pointer border ${
                                quickBrand === sug.name
                                  ? "bg-red-950/40 border-red-500/80 text-red-400 font-bold"
                                  : "bg-slate-900/60 border-gray-850 text-gray-400 hover:text-white hover:border-gray-750"
                              }`}
                            >
                              <span>{sug.emoji}</span> {sug.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Model suggestions panel */}
                      <div className="flex flex-col gap-1 mt-1">
                        <label className="text-[9px] text-gray-400 font-mono">MODELO *</label>
                        <input
                          type="text"
                          placeholder="Ex: Polo TSI"
                          value={quickModel}
                          onChange={(e) => setQuickModel(e.target.value)}
                          className="bg-black/40 border border-gray-800 rounded-lg py-1.5 px-2.5 text-xs text-white outline-none focus:border-red-500"
                          required
                        />

                        {/* Model suggestions pills */}
                        {quickModelsList.length > 0 && (
                          <div className="flex flex-col gap-1 mt-1.5">
                            <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">💡 Modelos Sugeridos para {quickBrand}:</span>
                            <div className="flex flex-wrap gap-1 max-h-18 overflow-y-auto pr-1">
                              {quickModelsList.map((md) => (
                                <button
                                  key={md}
                                  type="button"
                                  onClick={() => setQuickModel(md)}
                                  className={`px-2 py-0.5 rounded-md text-[9px] font-sans transition-all cursor-pointer border ${
                                    quickModel === md
                                      ? "bg-cyan-950/40 border-cyan-500/80 text-cyan-400 font-bold"
                                      : "bg-slate-950 border-gray-900 text-gray-500 hover:text-gray-300 hover:border-gray-800"
                                  }`}
                                >
                                  {md}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 mt-1">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-gray-400 font-mono">ANO FABR.</label>
                          <input
                            type="text"
                            placeholder="2022"
                            value={quickYear}
                            onChange={(e) => setQuickYear(e.target.value)}
                            className="bg-black/40 border border-gray-800 rounded-lg py-1.5 px-2.5 text-xs text-white outline-none focus:border-red-550 font-mono text-center"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-gray-400 font-mono">MOTORIZAÇÃO</label>
                          <input
                            type="text"
                            placeholder="2.0 Turbo"
                            value={quickEngine}
                            onChange={(e) => setQuickEngine(e.target.value)}
                            className="bg-black/40 border border-gray-800 rounded-lg py-1.5 px-2.5 text-xs text-white outline-none focus:border-red-550 font-mono text-center"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleQuickVehicleSave}
                        className="py-2.5 px-4 bg-red-600 hover:bg-red-700 hover:scale-[1.01] transition-all text-white font-mono text-xs font-bold rounded-lg mt-2 flex justify-center items-center gap-2 cursor-pointer border border-transparent shadow-lg shadow-red-950/30"
                      >
                        ✅ SALVAR E ATRELAR AUTOMÓVEL
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <select 
                  value={selectedVehicle?.id || ''}
                  disabled={!selectedClient}
                  onChange={(e) => {
                    const found = veiculos.find(v => v.id === e.target.value);
                    setSelectedVehicle(found || null);
                  }}
                  className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white disabled:opacity-40 focus:outline-none focus:border-gray-700"
                  required
                >
                  <option value="">-- Selecione Automóvel --</option>
                  {veiculos
                    .filter(v => !selectedClient || v.clienteId === selectedClient.id)
                    .map(v => (
                      <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>
                    ))
                  }
                </select>
              )}
            </div>

            {/* Kilometer entry */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-gray-400">QUILOMETRAGEM ATUAL (KM)</label>
                  <input 
                    type="number"
                    placeholder="Ex: 68500"
                    value={kmStr}
                    onChange={(e) => setKmStr(e.target.value)}
                    className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-xs text-white font-mono"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-gray-400">DEFINIR MECÂNICO ALOCADO</label>
                  <select 
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono"
                  >
                    <option value="Marcio Rezende">Marcio Rezende</option>
                    <option value="Gerson Geleia Souza">Gerson "Geleia" Souza</option>
                    <option value="Clécio Santos">Clécio Santos (Admin)</option>
                  </select>
                </div>

                <div className="flex justify-end items-end pb-1.5">
                  <span className="text-[10px] text-gray-500 font-mono italic">Os custos de mecânica consideram hora-técnica padrão.</span>
                </div>
              </div>
            </div>

            {/* Symptoms Description */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-mono text-gray-400 uppercase">3. SINTOMAS E RECLAMAÇÃO DO CLIENTE</label>
              <textarea 
                rows={3}
                placeholder="Ex Nomeadamente: Ruído agudo ao frear em descidas acentuadas, luz do motor amarela acesa no painel do carro."
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                className="w-full bg-[#080c16] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>

            {/* DYNAMIC INTEGRATED AI ENGINE MODULE PREDICTION */}
            <div className="md:col-span-2 p-4.5 bg-red-950/10 border border-red-900/30 rounded-2xl flex flex-col gap-3 relative">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-red-950 pb-2.5">
                <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-semibold">
                  <Sparkles className="w-4 h-4 text-red-500 animate-spin" />
                  PREDIÇÃO MECÂNICA E ORÇAMENTAL POR IA (GEMINI 2.5 FLASH)
                </div>
                <button 
                  type="button"
                  onClick={handleAiAutoDiagnosis}
                  disabled={aiLoading}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white font-mono text-[10px] rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                >
                  {aiLoading ? "Carregando..." : "✨ ANALISAR SINTOMAS POR IA"}
                </button>
              </div>

              {aiDiagnosticSummary ? (
                <div className="text-xs transition-opacity duration-300">
                  <div className="bg-black/40 p-3 rounded-lg border border-red-950/30 mb-3 leading-relaxed">
                    <span className="font-bold text-red-400 block mb-1">Diagnóstico estimado pela IA:</span>
                    {aiDiagnosticSummary.diagnosis}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono mb-2">
                    <div className="bg-[#0b0c13] p-2.5 rounded border border-gray-900">
                      <span className="text-red-400 font-bold block mb-1">Peça Estimada Necessária:</span>
                      {aiDiagnosticSummary.suggestedParts?.[0]?.name || "Nenhuma peça específica sugerida"} ({aiDiagnosticSummary.suggestedParts?.[0]?.confidence || '90%'} confiança)
                    </div>
                    <div className="bg-[#0b0c13] p-2.5 rounded border border-gray-900">
                      <span className="text-cyan-400 font-bold block mb-1">Mão de obra média sugerida:</span>
                      {aiDiagnosticSummary.suggestedServices?.[0]?.description || "Diagnóstico Computorizado"} - {aiDiagnosticSummary.suggestedServices?.[0]?.estLaborCost || "R$ 150,00"}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 italic block font-sans">** Diagnóstico gerivo gerado por Inteligência Artificial baseado na biblioteca técnica do carro. Verifique fisicamente no elevador.</span>
                </div>
              ) : (
                <span className="text-[11px] text-gray-400 leading-relaxed font-sans">
                  Insira o modelo de carro e clique na análise inteligente para que o assistente Gemini AI calcule probabilidade de fadiga, consulte manuais de marcas oficiais e injete automaticamente serviços e peças recomendadas ao orçamento!
                </span>
              )}
            </div>

            {/* Checklist of reception */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-[10px] font-mono text-gray-400 uppercase">4. CHECKLIST MECÂNICO DE RECEPÇÃO</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {checklist.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 rounded-xl border border-gray-900 bg-[#080c16]">
                    <span className="text-[11px] text-gray-300 font-medium ">{item.label}</span>
                    <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-gray-800">
                      <button 
                        type="button" 
                        onClick={() => toggleChecklistStatus(idx, 'ok')}
                        className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded ${item.status === 'ok' ? 'bg-green-600 text-white' : 'text-gray-500'}`}
                      >
                        OK
                      </button>
                      <button 
                        type="button" 
                        onClick={() => toggleChecklistStatus(idx, 'fail')}
                        className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded ${item.status === 'fail' ? 'bg-red-650 bg-red-650 bg-red-600 text-white' : 'text-gray-500'}`}
                      >
                        REPR
                      </button>
                      <button 
                        type="button" 
                        onClick={() => toggleChecklistStatus(idx, 'na')}
                        className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded ${item.status === 'na' ? 'bg-slate-700 text-white' : 'text-gray-500'}`}
                      >
                        N/A
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual ADD Services proposed */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-gray-400 uppercase">5. DEFINE LABOR / MÃO DE OBRA ADICIONAL</label>
              <div className="bg-[#080c16] p-4 rounded-xl border border-gray-900 flex flex-col gap-3">
                
                {/* Cataloged predefined services */}
                <div className="border-b border-gray-850 pb-3 mb-1 flex flex-col gap-1.5">
                  <span className="text-[9px] font-mono text-gray-500 uppercase">SELECIONAR DE SERVIÇO DO CATÁLOGO</span>
                  <div className="flex gap-2">
                    <select
                      value={selectedSrvId}
                      onChange={(e) => setSelectedSrvId(e.target.value)}
                      className="flex-grow bg-[#050810] border border-gray-800 rounded py-1.5 px-2 text-xs text-white"
                    >
                      <option value="">-- Escolha um Serviço Pré-Cadastrado --</option>
                      {servicos.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (R$ {s.price.toFixed(2)})</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAddCatalogService(selectedSrvId)}
                      className="px-4 py-1.5 bg-red-650 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded font-mono"
                    >
                      VINCULAR
                    </button>
                  </div>
                </div>

                <span className="text-[9px] font-mono text-gray-500 uppercase">OU REGISTRAR MÃO DE OBRA AVULSA</span>
                <input 
                  type="text" 
                  placeholder="Descrição do serviço (ex: Troca óleo motor)"
                  className="w-full bg-[#050810] border border-gray-800 rounded py-1.5 px-3 text-xs text-white"
                  value={manualServiceDesc}
                  onChange={(e) => setManualServiceDesc(e.target.value)}
                />
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Preço (R$)"
                    className="w-28 bg-[#050810] border border-gray-800 rounded py-1.5 px-3 text-xs text-white font-mono"
                    value={manualServicePrice}
                    onChange={(e) => setManualServicePrice(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={handleAddManualService}
                    className="flex-grow py-1.5 px-3 bg-slate-800 text-white text-xs font-semibold rounded hover:bg-slate-700 font-mono"
                  >
                    + ADICIONAR MÃO DE OBRA
                  </button>
                </div>

                {/* Services attached */}
                {services.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-2 bg-black/40 p-2.5 rounded border border-gray-950 font-mono text-[11px]">
                    <span className="font-bold text-gray-400 block mb-1">MÃOS DE OBRA INCLUSAS:</span>
                    {services.map((srv, idx) => (
                      <div key={srv.id} className="flex justify-between items-center text-slate-350 text-slate-300">
                        <span>• {srv.description}</span>
                        <div className="flex items-center gap-1">
                          <span>R$ {srv.price.toFixed(2)}</span>
                          <button 
                            type="button" 
                            onClick={() => setServices(prev => prev.filter(s => s.id !== srv.id))}
                            className="text-red-500 font-bold ml-1 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Select parts registered from Inventory */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-gray-400 uppercase">6. VINCULAR PEÇAS DO ESTOQUE INTERNO</label>
              <div className="bg-[#080c16] p-4 rounded-xl border border-gray-900 flex flex-col gap-3">
                <select 
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  className="w-full bg-[#050810] border border-gray-800 rounded py-1.5 px-2 text-xs text-white"
                >
                  <option value="">-- Selecione Peça do Estoque --</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (R$ {p.sellPrice}) - Saldo: {p.quantity} un</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500 font-mono">Qtd:</span>
                    <input 
                      type="number" 
                      min="1" 
                      className="w-16 bg-[#050810] border border-gray-800 rounded py-1.5 px-2 text-xs text-white font-mono text-center"
                      value={selectedProdQty}
                      onChange={(e) => setSelectedProdQty(e.target.value)}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddPartToOS}
                    className="flex-grow py-1.5 px-3 bg-slate-800 text-white text-xs font-semibold rounded hover:bg-slate-700 font-mono"
                  >
                    + ASSOCIAR PEÇA
                  </button>
                </div>

                {/* Parts attached list */}
                {parts.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-2 bg-black/40 p-2.5 rounded border border-gray-950 font-mono text-[11px]">
                    <span className="font-bold text-gray-400 block mb-1">PEÇAS RESERVADAS EM ESTOQUE:</span>
                    {parts.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-300">
                        <span>• ({p.quantity}x) {p.name}</span>
                        <div className="flex items-center gap-1">
                          <span>R$ {(p.sellPrice * p.quantity).toFixed(2)}</span>
                          <button 
                            type="button" 
                            onClick={() => setParts(prev => prev.filter((it, index) => index !== idx))}
                            className="text-red-500 font-bold ml-1 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Total Budget calculation box */}
            <div className="md:col-span-2 bg-[#080d19] rounded-2xl border border-gray-800 p-4.5 flex justify-between items-center my-2">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 block font-mono">VALOR ESTIMADO DO ORÇAMENTO TRABALHOS:</span>
                <span className="text-[10px] text-gray-500 block">Calculado dinamicamente com base nas peças incluídas + serviços.</span>
              </div>
              <span className="text-xl sm:text-2xl font-display font-black text-white">R$ {osCalculatedTotal().toFixed(2)}</span>
            </div>

            {/* Manual Diagnosis */}
            <div className="flex flex-col gap-2 md:col-span-2 font-mono">
              <label className="text-[10px] font-mono text-gray-450 uppercase">7. DIAGNÓSTICO DO MECÂNICO E LAUDO FINAL</label>
              <textarea 
                rows={2}
                placeholder="Ex Nomeadamente: Constatado sulcos excessivos no disco de freio Fremax, obrigando lixamento ou substituição do par dianteiro."
                value={diagnosisText}
                onChange={(e) => setDiagnosisText(e.target.value)}
                className="w-full bg-[#080c16] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            {/* 8. CONFIGURAÇÕES DE LEMBRETE DE WHATSAPP */}
            <div className="md:col-span-2 bg-[#09101f] border border-gray-800/80 rounded-2xl p-5 flex flex-col gap-4 font-sans text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-850 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className={`w-5 h-5 ${reminderEnabled ? 'text-red-500 animate-bounce' : 'text-gray-500'}`} />
                  <div>
                    <h4 className="text-sm font-semibold text-white uppercase font-display tracking-tight">8. Configurações de Lembrete</h4>
                    <p className="text-[11px] text-gray-400">Defina quantos dias antes do vencimento o cliente deve ser alertado via WhatsApp.</p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={reminderEnabled} 
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-950 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-550 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  <span className="ml-2.5 text-xs font-bold text-gray-300">{reminderEnabled ? "ATIVADO" : "DESATIVADO"}</span>
                </label>
              </div>

              {reminderEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Prazos */}
                  <div className="md:col-span-6 flex flex-col gap-1.5 text-xs text-gray-300">
                    <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">PRAZO DE VALIDADE DA ORDEM/GARANTIA</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[15, 30, 90].map((d) => (
                        <button 
                          key={d}
                          type="button"
                          onClick={() => setVencimentoDays(d)}
                          className={`py-2 px-3 border rounded-xl font-mono font-bold transition-all cursor-pointer ${
                            vencimentoDays === d 
                              ? 'bg-red-600/15 border-red-550 text-white' 
                              : 'bg-slate-950/40 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                          }`}
                        >
                          {d} dias
                        </button>
                      ))}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 font-mono">Ou dias personalizados:</span>
                      <input 
                        type="number" 
                        min="1"
                        value={vencimentoDays}
                        onChange={(e) => setVencimentoDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 bg-[#080c16] border border-gray-800 rounded-lg py-1 px-2 text-[11px] font-mono text-white text-center"
                      />
                    </div>
                  </div>

                  {/* Antecedência */}
                  <div className="md:col-span-6 flex flex-col gap-1.5 text-xs text-gray-300">
                    <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">ENVIAR DISPARO NO WHATSAPP QUANTO TEMPO ANTES?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 3, 5].map((d) => (
                        <button 
                          key={d}
                          type="button"
                          onClick={() => setReminderDays(d)}
                          className={`py-2 px-3 border rounded-xl font-mono font-bold transition-all cursor-pointer ${
                            reminderDays === d 
                              ? 'bg-purple-950/20 border-purple-500 text-white' 
                              : 'bg-slate-950/40 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                          }`}
                        >
                          {d} {d === 1 ? 'dia' : 'dias'} antes
                        </button>
                      ))}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 font-mono">Diferente antes:</span>
                      <input 
                        type="number" 
                        min="1"
                        max={vencimentoDays - 1}
                        value={reminderDays}
                        onChange={(e) => setReminderDays(Math.min(vencimentoDays - 1, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-16 bg-[#080c16] border border-gray-805 rounded-lg py-1 px-2 text-[11px] font-mono text-white text-center"
                      />
                    </div>
                  </div>

                  {/* Realtime scheduler calendar line */}
                  <div className="md:col-span-12 bg-slate-950/80 border border-gray-800/60 p-4 rounded-xl flex flex-col gap-2.5">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-extrabold flex items-center gap-1">
                      <CalendarRange className="w-3.5 h-3.5" />
                      CRONOGRAMA DE DISPAROS DE MONITORAMENTO ATUALIZADO
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 text-xs">
                      <div className="bg-[#0c1223] rounded-lg p-2.5 border border-gray-900 flex flex-col gap-0.5">
                        <span className="text-gray-500 block text-[9px] font-mono">Abertura OS (Hoje)</span>
                        <span className="font-mono text-white font-bold">{new Date().toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      <div className="bg-red-950/15 rounded-lg p-2.5 border border-red-900/30 flex flex-col gap-0.5">
                        <span className="text-red-400/80 block text-[9px] font-mono font-bold">🔔 Dia de Alerta WhatsApp</span>
                        <span className="font-mono text-white font-bold flex items-center gap-1 text-red-400">
                          {(() => {
                            const date = new Date();
                            date.setDate(date.getDate() + vencimentoDays - reminderDays);
                            return date.toLocaleDateString('pt-BR');
                          })()} 
                          <span className="text-[10px] text-gray-400 font-normal">({reminderDays}d antes)</span>
                        </span>
                      </div>
                      
                      <div className="bg-[#0b101d] rounded-lg p-2.5 border border-gray-850 flex flex-col gap-0.5">
                        <span className="text-gray-500 block text-[9px] font-mono font-bold">📅 Vencimento de Validade</span>
                        <span className="font-mono text-white font-bold text-gray-300">
                          {(() => {
                            const date = new Date();
                            date.setDate(date.getDate() + vencimentoDays);
                            return date.toLocaleDateString('pt-BR');
                          })()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-1 flex flex-col gap-1 border-t border-gray-900/60 pt-2.5">
                      <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-wider block">PREVIEW DO LEMBRETE AUTOMÁTICO</span>
                      <div className="p-2.5 bg-black/30 border border-gray-900 rounded-lg text-[11px] text-gray-300 leading-normal font-mono select-none">
                        "Prezado(a) *{selectedClient?.name || "Cliente Teste"}*, informamos que o orçamento ou os termos da garantia da sua *OS #{new Date().getFullYear() + "-XXXX"}* ({selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : "Veículo"}) expira em *{(() => {
                          const date = new Date();
                          date.setDate(date.getDate() + vencimentoDays);
                          return date.toLocaleDateString('pt-BR');
                        })()}* (vence em {reminderDays} {reminderDays === 1 ? 'dia' : 'dias'}). Favor entrar em contato para validação!"
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          <button 
            type="submit"
            className="w-full mt-4 py-4.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs sm:text-sm font-bold rounded-xl tracking-wider shadow-lg shadow-red-950/40"
          >
            💾 SALVAR E EMITIR ORDEM DE SERVIÇO
          </button>
        </form>
      )}

      {/* WHATSAPP SHARE & DIGITAL SIGNATURE PORT MODAL DIALOG */}
      {activeOSForModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0c1223] border border-gray-800 text-white max-w-lg w-full rounded-2xl p-6 shadow-2xl relative text-left flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-gray-850 pb-3">
              <span className="font-display font-bold text-base text-white flex items-center gap-1.5">
                <MessageSquare className="w-5 h-5 text-green-500" /> APROVAÇÃO E ASSINATURA DIGITAL
              </span>
              <button 
                onClick={() => setActiveOSForModal(null)}
                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab 1: Whatsapp template copy */}
            <div className="flex flex-col gap-2 font-mono text-[11px]">
              <span className="text-gray-400 font-sans font-bold">DISPARAR ORÇAMENTO INTEGRADO VIA WHATSAPP CANAL:</span>
              <textarea 
                rows={6}
                className="w-full bg-[#080c16] border border-gray-800 rounded-lg p-3 text-xs text-slate-300 focus:outline"
                value={whatsappTextCreated}
                readOnly
              />
              
              <a 
                href={`https://wa.me/${activeOSForModal.clientePhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappTextCreated)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-center font-sans hover:scale-[1.01] transition-all"
              >
                💬 CLIQUE PARA ENVIAR ORÇAMENTO VIA WHATSAPP AGORA
              </a>
            </div>

            {/* Tab 2: Capture Digital Sign token footprint */}
            <div className="border-t border-gray-850 pt-4 flex flex-col gap-3 font-sans">
              <span className="text-xs text-gray-400 font-bold block bg-gray-950 p-2 border border-gray-900 rounded font-mono">
                🖋️ ASSINATURA DIGITAL DO CLIENTE (COLETA DE CONSENTIMENTO)
              </span>
              <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
                Ao prescrever o nome do cliente abaixo, o sistema valida a autorização e tokeniza o carimbo de IP e horário, permitindo o avanço e dedução imediata das peças do estoque para o pátio de execução do reparo.
              </p>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Nome do cliente completo autorizando..."
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-xs text-white font-mono flex-grow focus:outline-none focus:border-red-500"
                  value={customSignName}
                  onChange={(e) => setCustomSignName(e.target.value)}
                />
                
                <button 
                  onClick={handleDigitalSignOS}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-bold font-mono text-white shrink-0"
                >
                  FILMAR CARIMBO
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
