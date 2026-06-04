import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  Trash2,
  RefreshCw,
  Link,
  History
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrdemServico, ServiceItem, PartUsed, Cliente, Veiculo, Servico } from '../types';
import { AUTO_SUGGESTIONS } from '../lib/autoSuggestions';

interface OSViewProps {
  initialSearchPlate?: string;
  onClearInitialSearch?: () => void;
}

export const OSView: React.FC<OSViewProps> = ({ initialSearchPlate = '', onClearInitialSearch }) => {
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
    aiLoading,
    company
  } = useApp();

  const [activeTab, setActiveTab] = useState<'lista' | 'nova' | 'orcamento'>('lista');
  const [pdfOSSelected, setPdfOSSelected] = useState<OrdemServico | null>(null);

  React.useEffect(() => {
    const handleOpenNewOS = () => {
      setActiveTab('nova');
    };
    window.addEventListener('open-new-os', handleOpenNewOS);
    return () => {
      window.removeEventListener('open-new-os', handleOpenNewOS);
    };
  }, []);

  React.useEffect(() => {
    if (initialSearchPlate) {
      setSearchPlate(initialSearchPlate);
      setActiveTab('lista');
      if (onClearInitialSearch) {
        onClearInitialSearch();
      }
    }
  }, [initialSearchPlate, onClearInitialSearch]);
  
  // Orçamento Fácil states
  const [easyClientName, setEasyClientName] = useState('');
  const [easyClientPhone, setEasyClientPhone] = useState('');
  const [easyClientEmail, setEasyClientEmail] = useState('');
  const [easyVehicleDesc, setEasyVehicleDesc] = useState('');
  const [easyVehiclePlate, setEasyVehiclePlate] = useState('');
  const [easyServices, setEasyServices] = useState<ServiceItem[]>([]);
  const [easyParts, setEasyParts] = useState<PartUsed[]>([]);
  const [easyDiscount, setEasyDiscount] = useState<number>(0);
  
  // Quick manual input fields for Orçamento Fácil
  const [easySelectedSrvId, setEasySelectedSrvId] = useState('');
  const [easyManualSrvDesc, setEasyManualSrvDesc] = useState('');
  const [easyManualSrvPrice, setEasyManualSrvPrice] = useState('');
  const [easySelectedProdId, setEasySelectedProdId] = useState('');
  const [easySelectedProdQty, setEasySelectedProdQty] = useState('1');
  const [easyManualPartName, setEasyManualPartName] = useState('');
  const [easyManualPartPrice, setEasyManualPartPrice] = useState('');
  const [easyManualPartQty, setEasyManualPartQty] = useState('1');

  // Sharing flows
  const [showEasyShareModal, setShowEasyShareModal] = useState(false);
  const [easyShareMsg, setEasyShareMsg] = useState('');
  const [easySavedOSId, setEasySavedOSId] = useState<string | null>(null);

  const [searchPlate, setSearchPlate] = useState(initialSearchPlate || '');
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [reopenOSId, setReopenOSId] = useState<string | null>(null);
  const [reopenReasonText, setReopenReasonText] = useState('');

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
    'Finalizada': 'border-green-900 bg-green-950/20 text-green-400',
    'Entregue': 'border-emerald-600 bg-emerald-950/20 text-emerald-400',
    'Garantia Reaberta': 'border-purple-600 bg-purple-950/35 text-purple-400 font-extrabold shadow-[0_0_10px_rgba(168,85,247,0.2)]'
  };

  // Filter and sort OS list chronologically
  const filteredOS = ordensServico.filter(os => {
    const matchSearch = os.plate.toLowerCase().includes(searchPlate.toLowerCase()) || 
                        os.clienteName.toLowerCase().includes(searchPlate.toLowerCase()) ||
                        os.id.toLowerCase().includes(searchPlate.toLowerCase());
    const matchStatus = statusFilter === 'Todas' || os.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
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
    const trackingUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?osId=${os.id}`;
    const msg = `Olá *${os.clienteName}*! Tudo bem? 

Sua Ordem de Serviço *${os.id}* do veículo *${os.veiculoInfo}* foi avaliada por nossa equipe de mecânicos.

🔍 *Diagnóstico Técnico:*
"${os.problem}"

🛠️ *Serviços/Peças Propostos:*
${os.services.map(s => `- ${s.description}: R$ ${s.price.toFixed(2)}`).join('\n')}
${os.parts.map(p => `- Peça ${p.name} (x${p.quantity}): R$ ${(p.sellPrice * p.quantity).toFixed(2)}`).join('\n')}

💵 *Valor Total Orçado:*
*R$ ${os.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*

📈 *Acompanhe em Tempo Real:*
${trackingUrl}

Por gentileza, acesse o link acima ou responda essa mensagem para aprovar a execução dos serviços! Obrigado.`;

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

  // --- Orçamento Fácil Action Helper Callbacks ---
  const addEasyService = (desc: string, price: number) => {
    if (!desc || isNaN(price) || price <= 0) {
      alert("Por favor, informe uma descrição válida e um preço numérico maior que zero para a mão de obra.");
      return;
    }
    const newItem: ServiceItem = {
      id: `srv_easy_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      description: desc,
      price: price
    };
    setEasyServices([...easyServices, newItem]);
    setEasyManualSrvDesc('');
    setEasyManualSrvPrice('');
    setEasySelectedSrvId('');
  };

  const addEasyPart = (name: string, price: number, qty: number) => {
    if (!name || isNaN(price) || price <= 0 || isNaN(qty) || qty <= 0) {
      alert("Por favor, preencha o nome do material, o valor unitário e uma quantidade positiva.");
      return;
    }
    const newItem: PartUsed = {
      id: `prt_easy_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name,
      sellPrice: price,
      quantity: qty
    };
    setEasyParts([...easyParts, newItem]);
    setEasyManualPartName('');
    setEasyManualPartPrice('');
    setEasyManualPartQty('1');
    setEasySelectedProdId('');
  };

  const easyServicesTotal = easyServices.reduce((acc, s) => acc + s.price, 0);
  const easyPartsTotal = easyParts.reduce((acc, p) => acc + (p.sellPrice * p.quantity), 0);
  const easySubtotal = easyServicesTotal + easyPartsTotal;
  const easyTotal = Math.max(0, easySubtotal - easyDiscount);

  const handleEasyWhatsAppShare = () => {
    const srvLines = easyServices.map(s => `• Mão de Obra: *${s.description}* - R$ ${s.price.toFixed(2)}`).join('\n');
    const prtLines = easyParts.map(p => `• Peça: *${p.name}* (x${p.quantity}) - R$ ${(p.sellPrice * p.quantity).toFixed(2)}`).join('\n');
    
    let msg = `⚡ *ORÇAMENTO PARCIAL - ${company?.name || 'AutoPrecision Premium'}* ⚡\n\n`;
    if (easyClientName) {
      msg += `Prezado(a) *${easyClientName}*,\n`;
    } else {
      msg += `Prezado Cliente,\n`;
    }
    msg += `Abaixo enviamos a simulação detalhada de orçamento para o seu veículo${easyVehicleDesc ? ` *${easyVehicleDesc}*` : ''}${easyVehiclePlate ? ` (Placa: ${easyVehiclePlate.toUpperCase()})` : ''}.\n\n`;
    
    if (easyServices.length > 0) {
      msg += `🛠️ *MÃO DE OBRA / SERVIÇOS:*\n${srvLines}\n\n`;
    }
    if (easyParts.length > 0) {
      msg += `📦 *PEÇAS / MATERIAIS DE REPOSIÇÃO:*\n${prtLines}\n\n`;
    }
    
    msg += `------------------------------------\n`;
    msg += `• Custo operacional: R$ ${easySubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (easyDiscount > 0) {
      msg += `• Desconto aplicado: R$ ${easyDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    }
    msg += `💰 *VALOR TOTAL: R$ ${easyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n`;
    msg += `_Este orçamento fácil é provisório de pátio técnico e válido por 10 dias._\n\n`;
    msg += `Deseja aprovar e dar início à execução rápida? Fale conosco!`;
    
    try {
      navigator.clipboard.writeText(msg);
    } catch (e) {
      console.warn("Clipboard access not fully permitted under iframe environment.");
    }
    
    const cleanPhone = easyClientPhone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone || ''}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleEasyEmailShare = () => {
    const srvLines = easyServices.map(s => `- Mão de Obra: ${s.description} - R$ ${s.price.toFixed(2)}`).join('\n');
    const prtLines = easyParts.map(p => `- Peça: ${p.name} (x${p.quantity}) - R$ ${(p.sellPrice * p.quantity).toFixed(2)}`).join('\n');
    
    const subject = encodeURIComponent(`Orçamento Rápido - ${easyVehicleDesc || 'Seu Veículo'} - ${company?.name || 'AutoPrecision'}`);
    let bodyText = `Olá${easyClientName ? ` ${easyClientName}` : ''},\n\n`;
    bodyText += `Seguem as tarifas e diagnósticos operacionais de orçamento provisório para o seu veículo${easyVehicleDesc ? ` (${easyVehicleDesc})` : ''}${easyVehiclePlate ? ` placa ${easyVehiclePlate.toUpperCase()}` : ''}.\n\n`;
    
    if (easyServices.length > 0) {
      bodyText += `--- SERVIÇOS E OPERAÇÕES ---\n${srvLines}\n\n`;
    }
    if (easyParts.length > 0) {
      bodyText += `--- PEÇAS E MATERIAIS DE REPOSIÇÃO ---\n${prtLines}\n\n`;
    }
    
    bodyText += `Subtotal: R$ ${easySubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (easyDiscount > 0) {
      bodyText += `Desconto Especial: R$ ${easyDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    }
    bodyText += `VALOR TOTAL ESTIMADO: R$ ${easyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n`;
    bodyText += `Responderemos imediatamente caso queira aprovar por este canal.\n\n`;
    bodyText += `Atenciosamente,\n${company?.name || 'AutoPrecision Premium'}\nContato Telefônico: ${company?.phone || '(11) 98765-4321'}`;
    
    const url = `mailto:${easyClientEmail || ''}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = url;
  };

  const handleConvertEasyToOS = async () => {
    let clientToUseId = "";
    if (easyClientName) {
      const match = clientes.find(c => 
        c.name.toLowerCase().includes(easyClientName.toLowerCase()) || 
        (easyClientPhone && c.phone.replace(/[^0-9]/g, '') === easyClientPhone.replace(/[^0-9]/g, ''))
      );
      if (match) {
        clientToUseId = match.id;
      } else {
        clientToUseId = clientes[0]?.id || "client_temp_123";
      }
    } else {
      clientToUseId = clientes[0]?.id || "client_temp_123";
    }

    const clientNameSelected = easyClientName || "Cliente Particular";
    const clientPhoneSelected = easyClientPhone || "(11) 99999-9999";

    const payload = {
      clienteId: clientToUseId,
      clienteName: clientNameSelected,
      clientePhone: clientPhoneSelected,
      veiculoId: "veh_temp_quick",
      veiculoInfo: easyVehicleDesc ? `${easyVehicleDesc} (${easyVehiclePlate.toUpperCase() || 'S/ PLACA'})` : "Veículo Orçado Provisório",
      plate: easyVehiclePlate || "ORC-9999",
      km: 0,
      problem: "Orçamento Fácil instantâneo convertido em Ordem de Serviço de pátio.",
      diagnosis: "Orçamento de peças/mão de obra simplificado de pátio técnico.",
      status: "Aberta" as const,
      mechanicId: "staff_2",
      mechanicName: "Marcio Rezende",
      services: [...easyServices],
      parts: [...easyParts],
      checklist: [],
      total: easyTotal,
      reminderEnabled: false,
      vencimentoDays: 30,
      reminderDays: 3
    };

    await addOS(payload);
    alert("✔️ Orçamento instantâneo convertido com sucesso em uma Ordem de Serviço oficial! Veja-a na fila ativa.");
    
    // Reset easy states
    setEasyClientName('');
    setEasyClientPhone('');
    setEasyClientEmail('');
    setEasyVehicleDesc('');
    setEasyVehiclePlate('');
    setEasyServices([]);
    setEasyParts([]);
    setEasyDiscount(0);
    
    setActiveTab('lista');
  };

  const handlePrintEasyBudget = () => {
    const placeholderOS: OrdemServico = {
      id: `SIMUL-${Math.floor(1000 + Math.random() * 9000)}`,
      empresaId: company?.id || 'company_1',
      clienteId: 'temp_cliente',
      clienteName: easyClientName || 'Cliente Particular',
      clientePhone: easyClientPhone || 'Não Informado',
      veiculoId: 'temp_veiculo',
      veiculoInfo: easyVehicleDesc || 'Veículo Sob Regulação',
      plate: easyVehiclePlate || 'PREVENTIVO',
      km: 0,
      problem: `Cotação de Serviços e Peças de Pátio executada em ${new Date().toLocaleDateString('pt-BR')}`,
      diagnosis: 'Diagnóstico mecânico e materiais orçados através do assistente de orçamento rápido.',
      status: 'Aberta',
      mechanicId: 'temp_mechanic',
      mechanicName: 'Consultor Técnico',
      services: [...easyServices],
      parts: [...easyParts],
      checklist: [],
      total: easyTotal,
      createdAt: new Date().toISOString()
    };
    setPdfOSSelected(placeholderOS);
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
          <button 
            onClick={() => setActiveTab('orcamento')}
            className={activeTab === 'orcamento' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
            id="tab-orcamento-facil"
          >
            ⚡ Orçamento Fácil
          </button>
        </div>
      </div>

      {activeTab === 'lista' && (
        <>
          {/* List filter tools */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#0a0f1d] p-4 rounded-xl border border-gray-900">
            <div className="relative md:col-span-6">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Pesquise por placa do carro, código de OS, ou nome do cliente..."
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value)}
                className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2 px-4 pl-10 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="md:col-span-3">
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

            <div className="md:col-span-3">
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full bg-[#080c16] border border-gray-800 py-2.5 px-3 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              >
                <option value="asc">⏱️ Fila (Mais Antigas Primeiro)</option>
                <option value="desc">⏱️ Recentes (Mais Novas Primeiro)</option>
              </select>
            </div>
          </div>

          {/* Cronograma/Fila indicativo de exemplos */}
          <div className="bg-[#0b1324] border border-blue-950/40 rounded-xl p-4 text-xs font-sans text-gray-400 flex flex-col gap-2">
            <span className="font-bold text-[#f87171] flex items-center gap-1.5 uppercase font-mono text-[10px] tracking-wider">
              📋 FILA DE ATENDIMENTO OPERACIONAL (ORDEM CRONOLÓGICA)
            </span>
            <p className="leading-relaxed">
              As Ordens de Serviço (OS) ativas são priorizadas pelo <strong>tempo de permanência/espera</strong> no pátio. Os veículos com maior tempo desde a entrada de pátio ficam posicionados no topo para evitar atrasos na entrega técnica.
            </p>
            <div className="mt-1 pt-2 border-t border-gray-800 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
              <span className="font-extrabold text-gray-400">Exemplos de Fluxo FIFO:</span>
              <span className="text-red-400 font-mono">1º OS #1005 (Há 3 dias - Prioridade Máxima)</span>
              <span className="text-gray-600">➔</span>
              <span className="text-amber-400 font-mono">2º OS #1008 (Há 1 dia - Em Espera)</span>
              <span className="text-gray-600">➔</span>
              <span className="text-green-400 font-mono">3º OS #1012 (Há 20 min - Recém-Criada)</span>
            </div>
          </div>

          {/* OS Listing Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOS.map((os, index) => (
              <motion.div 
                key={os.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.25) }}
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
                    <span className="text-[10px] text-gray-500 font-mono block mt-1 flex items-center gap-1">
                      <span>📅 Entrada:</span>
                      <strong className="text-gray-300">
                        {new Date(os.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </strong>
                      <span className="text-red-400/90 font-sans ml-1 text-[9px] font-bold uppercase p-0.5 px-1 bg-red-950/20 rounded border border-red-950/20">
                        {(() => {
                          const diffMs = new Date().getTime() - new Date(os.createdAt).getTime();
                          const diffMin = Math.floor(diffMs / 60000);
                          const diffHrs = Math.floor(diffMin / 60);
                          const diffDays = Math.floor(diffHrs / 24);
                          if (diffMin < 60) return `${diffMin}m atrás`;
                          if (diffHrs < 24) return `${diffHrs}h atrás`;
                          return `${diffDays}d atrás`;
                        })()}
                      </span>
                    </span>
                  </div>

                  <span className="text-sm font-mono font-extrabold text-white">
                    R$ {os.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="text-xs text-slate-400 line-clamp-2 my-2.5 italic border-l-2 border-red-500/30 pl-2">
                  "{os.problem}"
                </div>

                {os.reopenCount !== undefined && os.reopenCount > 0 && (
                  <div className="my-2.5 p-2 px-3 rounded-xl border border-purple-500/30 bg-purple-950/20 text-purple-300 text-[10.5px] leading-relaxed">
                    <span className="font-extrabold flex items-center gap-1 uppercase tracking-wide">
                      🚨 OS Reaberta em Garantia ({os.reopenCount}ª Intervenção)
                    </span>
                    {os.reopenReason && (
                      <p className="mt-0.5 text-[10px] text-purple-400 italic font-medium">
                        "{os.reopenReason}"
                      </p>
                    )}
                    {os.reopenedAt && (
                      <span className="text-[9px] text-gray-500 block mt-0.5">
                        Última reabertura técnica: {new Date(os.reopenedAt).toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                )}

                {/* Sub features checklist indicators */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-500 my-2">
                  <span>Mecânico: <strong className="text-gray-300">{os.mechanicName}</strong></span>
                  <span>Clientes: <strong className="text-gray-300">{os.clienteName}</strong></span>
                  <span>Trocas/Peças: <strong className="text-gray-300">{os.parts.length} itens</strong></span>
                  <span>Serviços: <strong className="text-gray-300">{os.services.length}</strong></span>
                </div>

                {/* Status History Log */}
                <div className="mt-3 border border-gray-850 bg-slate-950/20 rounded-xl overflow-hidden p-2.5">
                  <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1.5 select-none">
                    <History className="w-3.5 h-3.5 text-red-500" />
                    Histórico de Alterações de Status
                  </span>
                  
                  <div className="mt-2 pl-1.5 flex flex-col gap-2 max-h-[120px] overflow-y-auto font-mono text-[9.5px] border-l border-gray-800">
                    {os.statusHistory && os.statusHistory.length > 0 ? (
                      os.statusHistory.map((h, hIdx) => (
                        <div key={hIdx} className="relative flex flex-col gap-0.5">
                          <span className="absolute -left-[10px] top-[4px] w-1.5 h-1.5 rounded-full bg-red-500/85 border border-slate-950" />
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-gray-500 text-[8.5px] font-semibold">{new Date(h.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="px-1 py-[1px] bg-slate-900 text-slate-300 font-bold rounded uppercase border border-slate-800 text-[8px]">{h.status}</span>
                            <span className="text-gray-400">por {h.user}</span>
                          </div>
                          {h.notes && <span className="text-gray-500 italic text-[8.5px] mt-0.5">"{h.notes}"</span>}
                        </div>
                      ))
                    ) : (
                      <div className="relative flex flex-col gap-0.5">
                        <span className="absolute -left-[10px] top-[4px] w-1.5 h-1.5 rounded-full bg-red-500/85 border border-slate-950" />
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-gray-500 text-[8.5px] font-semibold">{new Date(os.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="px-1 py-[1px] bg-slate-900 text-slate-300 font-bold rounded uppercase border border-slate-800 text-[8px]">Aberta</span>
                          <span className="text-gray-400">por {os.mechanicName || 'Sistema'}</span>
                        </div>
                        <span className="text-gray-500 italic text-[8.5px] mt-0.5">"Abertura da Ordem de Serviço"</span>
                      </div>
                    )}
                  </div>
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
                <div className="mt-4 pt-3 border-t border-gray-850 flex items-center justify-between gap-3 flex-wrap font-mono text-[10px]">
                  
                  <div>
                    {os.signature ? (
                      <span className="text-green-500 font-bold flex items-center gap-0.5">✓ ASSINADA</span>
                    ) : (
                      <span className="text-yellow-500">⚠ AGUARDANDO ASSINATURA</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button 
                      onClick={() => createWhatsAppShare(os)}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-green-400 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Compartilhar orçamento via WhatsApp"
                    >
                      <Phone className="w-3 h-3" /> Enviar Orçamento
                    </button>

                    <button 
                      onClick={() => setPdfOSSelected(os)}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-amber-400 flex items-center gap-1.5 cursor-pointer transition-colors font-bold"
                      title="Visualizar e Exportar PDF Simplificado"
                    >
                      <Printer className="w-3 h-3 text-amber-400 animate-pulse" /> Exportar PDF
                    </button>

                    <button 
                      onClick={() => {
                        const sampleUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?cpf=${os.clienteCpfCnpj || ''}&osId=${os.id}`;
                        navigator.clipboard.writeText(sampleUrl);
                        alert(`🔗 Link de acompanhamento copiado com sucesso!\n\n${sampleUrl}\n\nVocê já pode enviar este link para o cliente no WhatsApp para acompanhar a mão de obra em tempo real.`);
                      }}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-cyan-400 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copiar link de acompanhamento com CPF"
                    >
                      <Link className="w-3 h-3 text-cyan-400" /> Link de Acompanhamento
                    </button>

                    {/* Reabrir em Garantia button */}
                    {(os.status === 'Finalizada' || os.status === 'Entregue') && (
                      <button
                        type="button"
                        id={`btn-reopen-os-${os.id}`}
                        onClick={() => {
                          setReopenOSId(os.id);
                          setReopenReasonText('');
                        }}
                        className="px-2.5 py-1 rounded border border-purple-500 bg-purple-950/20 hover:bg-purple-900 hover:text-white text-purple-300 cursor-pointer font-bold transition-all uppercase flex items-center gap-1"
                        title="Reabrir a mesma mão de obra por garantia técnica"
                      >
                        <RefreshCw className="w-3 h-3 text-purple-400 animate-spin-hover" /> Reabrir Garantia
                      </button>
                    )}
                    
                    <select 
                      value={os.status}
                      onChange={async (e) => {
                        await editOS(os.id, { status: e.target.value as any });
                      }}
                      className="bg-[#050812] border border-gray-800 rounded px-2 py-1 text-[9px] font-mono text-slate-300"
                    >
                      <option value="Aberta">Mudar: Aberta</option>
                      <option value="Em análise">Mudar: Em análise</option>
                      <option value="Aguardando peça">Mudar: Em peça</option>
                      <option value="Em execução">Mudar: Em execução</option>
                      <option value="Finalizada">Mudar: Finalizada</option>
                      <option value="Entregue">Mudar: Entregue</option>
                      <option value="Garantia Reaberta">Mudar: Garantia Reaberta</option>
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
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                </div>

              </motion.div>
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

      {activeTab === 'orcamento' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
          
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6">
            
            {/* Section 1: Client and Vehicle details */}
            <div className="flex flex-col gap-4 text-left">
              <div className="border-b border-gray-850 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-extrabold text-white text-base">⚡ GERADOR DE ORÇAMENTO RÁPIDO</h3>
                  <span className="text-xs text-gray-400 font-mono">Peças, mão de obra e compartilhamento em instantes.</span>
                </div>
                <div className="bg-red-500/10 text-red-500 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-red-500/20">
                  Easy Mode
                </div>
              </div>

              {/* Quick lookup of existing registered customer */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Preencher com Cliente Cadastrado (Opcional)</label>
                <select 
                  onChange={(e) => {
                    const found = clientes.find(c => c.id === e.target.value);
                    if (found) {
                      setEasyClientName(found.name);
                      setEasyClientPhone(found.phone);
                      setEasyClientEmail(found.email || '');
                      
                      // auto fetch corresponding vehicle if exists
                      const firstVeh = veiculos.find(v => v.clienteId === found.id);
                      if (firstVeh) {
                        setEasyVehicleDesc(`${firstVeh.brand} ${firstVeh.model} ${firstVeh.engine}`);
                        setEasyVehiclePlate(firstVeh.plate);
                      } else {
                        setEasyVehicleDesc('');
                        setEasyVehiclePlate('');
                      }
                    }
                  }}
                  className="bg-[#080c16] border border-gray-850 rounded-xl py-2 px-3 text-xs text-white cursor-pointer"
                >
                  <option value="">-- Puxar cliente cadastrado... --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">Nome do Cliente *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Clecio Tecnologia"
                    value={easyClientName}
                    onChange={(e) => setEasyClientName(e.target.value)}
                    className="bg-[#080c16] border border-gray-850 rounded-xl py-2.5 px-3 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">WhatsApp (Celular) *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: (11) 98765-4321"
                    value={easyClientPhone}
                    onChange={(e) => setEasyClientPhone(e.target.value)}
                    className="bg-[#080c16] border border-gray-850 rounded-xl py-2.5 px-3 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">E-mail do Cliente</label>
                  <input 
                    type="email" 
                    placeholder="Ex: cleciotecnologia@gmail.com"
                    value={easyClientEmail}
                    onChange={(e) => setEasyClientEmail(e.target.value)}
                    className="bg-[#080c16] border border-gray-850 rounded-xl py-2.5 px-3 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Veículo *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Civic 2.0"
                      value={easyVehicleDesc}
                      onChange={(e) => setEasyVehicleDesc(e.target.value)}
                      className="bg-[#080c16] border border-gray-850 rounded-xl py-2.5 px-3 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Placa</label>
                    <input 
                      type="text" 
                      placeholder="Ex: ABC-1234"
                      value={easyVehiclePlate}
                      onChange={(e) => setEasyVehiclePlate(e.target.value)}
                      className="bg-[#080c16] border border-gray-850 rounded-xl py-2.5 px-3 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Add services and labor */}
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-850 text-left">
              <h4 className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-red-500" /> 1. ADICIONAR MÃO DE OBRA / SERVIÇOS
              </h4>

              {/* Quick Select Catalogue */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-[#080c16] p-3 rounded-xl border border-gray-900">
                <div className="md:col-span-8 flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-gray-500">Selecionar do Catálogo de Serviços</span>
                  <select
                    value={easySelectedSrvId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setEasySelectedSrvId(id);
                      const found = servicos.find(s => s.id === id);
                      if (found) {
                        const newItem: ServiceItem = {
                          id: `srv_easy_${Date.now()}_${Math.floor(Math.random()*1000)}`,
                          description: found.name,
                          price: found.price
                        };
                        setEasyServices([...easyServices, newItem]);
                        setEasySelectedSrvId('');
                      }
                    }}
                    className="bg-[#04080e] border border-gray-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="">-- Escolher Serviço do Catálogo... --</option>
                    {servicos.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (R$ {s.price.toFixed(2)})</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4 text-center">
                  <span className="text-[9px] text-gray-500 font-mono block mb-1">ou adicionar manual abaixo</span>
                </div>
              </div>

              {/* Manual input */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mt-1">
                <div className="md:col-span-8">
                  <input 
                    type="text" 
                    placeholder="Descrição do serviço manual..."
                    value={easyManualSrvDesc}
                    onChange={(e) => setEasyManualSrvDesc(e.target.value)}
                    className="w-full bg-[#080c16] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div className="md:col-span-3">
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Preço R$"
                    value={easyManualSrvPrice}
                    onChange={(e) => setEasyManualSrvPrice(e.target.value)}
                    className="w-full bg-[#080c16] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addEasyService(easyManualSrvDesc, parseFloat(easyManualSrvPrice))}
                  className="md:col-span-1 py-2.5 bg-red-600/20 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 font-bold rounded-lg cursor-pointer flex items-center justify-center transition-all text-xs"
                  title="Anexar Serviço"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Section 3: Add Parts */}
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-850 text-left">
              <h4 className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-red-500" /> 2. ADICIONAR PEÇAS / MATERIAIS
              </h4>

              {/* Selector from Stock */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-[#080c16] p-3 rounded-xl border border-gray-900">
                <div className="md:col-span-7 flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-gray-500">Puxar do Almoxarifado / Estoque</span>
                  <select
                    value={easySelectedProdId}
                    onChange={(e) => setEasySelectedProdId(e.target.value)}
                    className="bg-[#04080e] border border-gray-800 rounded-lg p-2 text-xs text-gray-300"
                  >
                    <option value="">-- Escolher Peça em Estoque... --</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Qtd: {p.quantity} | R$ {p.sellPrice.toFixed(2)})</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3 flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-gray-500">Qtd</span>
                  <input
                    type="number"
                    min="1"
                    value={easySelectedProdQty}
                    onChange={(e) => setEasySelectedProdQty(e.target.value)}
                    className="bg-[#04080e] border border-gray-800 rounded-lg p-1.5 text-xs text-white w-full text-center"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const found = produtos.find(p => p.id === easySelectedProdId);
                    if (found) {
                      addEasyPart(found.name, found.sellPrice, parseInt(easySelectedProdQty) || 1);
                    }
                  }}
                  className="md:col-span-2 py-2 px-3 bg-red-600/30 border border-red-500/40 hover:bg-red-600 text-white rounded-lg text-xs font-bold font-mono text-center cursor-pointer transition-all"
                >
                  Anexar
                </button>
              </div>

              {/* Manual input */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mt-1">
                <div className="md:col-span-6">
                  <input 
                    type="text" 
                    placeholder="Descrição da peça manual..."
                    value={easyManualPartName}
                    onChange={(e) => setEasyManualPartName(e.target.value)}
                    className="w-full bg-[#080c16] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div className="md:col-span-3">
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Valor R$"
                    value={easyManualPartPrice}
                    onChange={(e) => setEasyManualPartPrice(e.target.value)}
                    className="w-full bg-[#080c16] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <input 
                    type="number" 
                    min="1"
                    placeholder="Qtd"
                    value={easyManualPartQty}
                    onChange={(e) => setEasyManualPartQty(e.target.value)}
                    className="w-full bg-[#080c16] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 text-center font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addEasyPart(easyManualPartName, parseFloat(easyManualPartPrice), parseInt(easyManualPartQty) || 1)}
                  className="md:col-span-1 py-2.5 bg-red-600/20 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 font-bold rounded-lg cursor-pointer flex items-center justify-center transition-all text-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Section 4: Discount */}
            <div className="pt-4 border-t border-gray-850 flex flex-col gap-2 text-left">
              <label className="text-[10px] font-mono text-gray-400 uppercase">3. DESCONTO ESPECIAL ADICIONAL (R$)</label>
              <div className="relative max-w-[200px]">
                <span className="absolute left-3.5 top-3 text-xs text-gray-500 font-mono">R$</span>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  value={easyDiscount || ''}
                  onChange={(e) => setEasyDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#080c16] border border-gray-850 rounded-xl py-2 px-3 pl-9 text-xs text-white focus:outline-none focus:border-red-500 font-mono font-bold text-red-400"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Real-Time Virtual Ticket Receipt */}
          <div className="lg:col-span-5 bg-[#080d1a] border border-gray-850 rounded-2xl p-6 shadow-xl flex flex-col gap-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-gray-850 pb-3">
              <span className="font-mono text-xs font-bold text-amber-500 tracking-widest uppercase flex items-center gap-1">
                <Printer className="w-4 h-4 text-amber-500 animate-pulse" /> COMPROVANTE GERAL DE ENTRADA
              </span>
              <span className="text-[9px] font-mono bg-slate-900 border border-gray-800 text-gray-405 px-2 py-0.5 rounded uppercase">
                Cotação Provisória
              </span>
            </div>

            {/* Virtual Invoice */}
            <div className="bg-white text-black p-5 rounded-xl border border-gray-200 flex flex-col gap-4 font-mono text-[10.5px] shadow-inner text-left">
              
              {/* Ticket header details */}
              <div className="text-center border-b border-dashed border-gray-300 pb-3">
                <span className="font-sans font-extrabold text-xs block uppercase tracking-wide">{company?.name || 'AUTOPRECISION OFFICE'}</span>
                <span className="text-[8.5px] text-gray-500 block leading-tight">{company?.address || "Avenida das Nações Unidas, 1040 - SP"}</span>
                <span className="text-[8.5px] text-gray-500 block font-bold">ORÇAMENTO DE PREVENÇÃO #EASY-{new Date().getSeconds()}{Math.floor(Math.random()*90)}</span>
              </div>

              {/* Client specifications */}
              <div className="flex flex-col gap-0.5 border-b border-dashed border-gray-200 pb-2">
                <div><span className="text-gray-500 uppercase font-bold">CLIENTE:</span> <strong className="text-black text-[11px] font-sans">{easyClientName || 'Cliente Particular'}</strong></div>
                {easyClientPhone && <div><span className="text-gray-500 uppercase font-bold">TELEFONE:</span> <span className="text-black">{easyClientPhone}</span></div>}
                {easyClientEmail && <div><span className="text-gray-500 uppercase font-bold">E-MAIL:</span> <span className="text-black lowercase">{easyClientEmail}</span></div>}
                <div><span className="text-gray-500 uppercase font-bold">VEÍCULO:</span> <strong className="text-black uppercase">{easyVehicleDesc || 'Não especificado'}</strong></div>
                {easyVehiclePlate && <div><span className="text-gray-500 uppercase font-bold">PLACA CARRO:</span> <span className="bg-blue-100 text-blue-900 px-1 border border-blue-200 rounded text-[9px] font-bold inline-block uppercase mt-0.5">{easyVehiclePlate.toUpperCase()}</span></div>}
              </div>

              {/* Services List */}
              <div>
                <span className="text-[10px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">🛠️ SERVIÇOS DE MÃO DE OBRA</span>
                {easyServices.length > 0 ? (
                  <div className="flex flex-col gap-1 pr-1 max-h-36 overflow-y-auto">
                    {easyServices.map((srv) => (
                      <div key={srv.id} className="flex justify-between items-center text-black font-sans py-0.5 border-b border-gray-100 last:border-0">
                        <span className="font-medium text-left truncate max-w-[150px]">{srv.description}</span>
                        <div className="flex items-center gap-1 font-mono">
                          <strong className="text-black">R$ {srv.price.toFixed(2)}</strong>
                          <button 
                            type="button"
                            onClick={() => setEasyServices(easyServices.filter(s => s.id !== srv.id))}
                            className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer p-0.5 font-bold"
                            title="Remover serviço"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 italic block pl-1 text-[9.5px]">Nenhum serviço inserido ou programado.</span>
                )}
              </div>

              {/* Parts List */}
              <div className="mt-2 border-t border-gray-100 pt-2">
                <span className="text-[10px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">📦 PEÇAS E MATERIAIS DE REPOSIÇÃO</span>
                {easyParts.length > 0 ? (
                  <div className="flex flex-col gap-1 pr-1 max-h-36 overflow-y-auto">
                    {easyParts.map((part) => (
                      <div key={part.id} className="flex justify-between items-center text-black font-sans py-0.5 border-b border-gray-100 last:border-0">
                        <div className="flex flex-col text-left">
                          <span className="font-medium truncate max-w-[150px]">{part.name}</span>
                          <span className="text-[8.5px] text-gray-500 italic block">{part.quantity} un. x R$ {part.sellPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono">
                          <strong className="text-black">R$ {(part.sellPrice * part.quantity).toFixed(2)}</strong>
                          <button 
                            type="button"
                            onClick={() => setEasyParts(easyParts.filter(p => p.id !== part.id))}
                            className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer p-0.5 font-bold"
                            title="Remover peça"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 italic block pl-1 text-[9.5px]">Nenhum componente ou óleo adicionado.</span>
                )}
              </div>

              {/* Totals Section */}
              <div className="border-t-2 border-black pt-3 mt-3 flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-gray-550">SUBTOTAL MÃO DE OBRA:</span>
                  <span>R$ {easyServicesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-550">SUBTOTAL PEÇAS/MATERIAIS:</span>
                  <span>R$ {easyPartsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                {easyDiscount > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>DESCONTO APLICADO:</span>
                    <span>- R$ {easyDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-black font-extrabold text-xs border-t border-gray-300 pt-1.5 mt-1">
                  <span>TOTAL CONSOLIDADO:</span>
                  <span className="text-red-650 bg-yellow-105 bg-amber-100 border border-amber-300 px-1.5 rounded">R$ {easyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[7.5px] text-gray-400 text-center uppercase leading-tight mt-3">
                AUTOTECH FACILITADOR • ESTE DOCUMENTO CONSTITUI APENAS UMA ESTIMATIVA NÃO VINCULANTE.
              </p>

            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 font-mono text-xs">
              
              <button
                type="button"
                onClick={handleEasyWhatsAppShare}
                disabled={easyServices.length === 0 && easyParts.length === 0}
                className="py-3 px-3 duration-200 transition-all text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Phone className="w-4 h-4 text-white" /> WhatsApp Rápido
              </button>

              <button
                type="button"
                onClick={handleEasyEmailShare}
                disabled={easyServices.length === 0 && easyParts.length === 0}
                className="py-3 px-3 duration-200 transition-all text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Bell className="w-4 h-4 text-white" /> Enviar por E-mail
              </button>

              <button
                type="button"
                onClick={handlePrintEasyBudget}
                disabled={easyServices.length === 0 && easyParts.length === 0}
                className="py-3 px-3 bg-[#0c1223] border border-gray-800 text-amber-400 hover:bg-slate-900 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4 text-amber-400" /> PDF / Imprimir
              </button>

              <button
                type="button"
                onClick={handleConvertEasyToOS}
                disabled={easyServices.length === 0 && easyParts.length === 0}
                className="py-3 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase"
              >
                <FileCheck className="w-4 h-4 text-white" /> Converter em OS
              </button>

            </div>

          </div>

        </div>
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

      {/* 🧾 OUTLINE PDF DOCUMENT EXPORT VIEW COMPONENT MODAL */}
      {pdfOSSelected && (
        <div id="pdf-os-export-overlay" className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-start overflow-y-auto p-4 md:p-6 backdrop-blur-sm no-print">
          
          {/* Print/Exit Toolbar (HIDDEN during window.print()) */}
          <div className="bg-[#0b1222] border border-gray-800 text-white max-w-4xl w-full rounded-2xl p-4 shadow-2xl mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans no-print">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Printer className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <span className="font-extrabold text-sm block tracking-wide uppercase">Exportação de Ordem de Serviço</span>
                <span className="text-[10px] text-gray-400 block font-mono">Visualize e salve o relatório PDF estruturado</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition-all hover:scale-[1.02]"
              >
                <Printer className="w-4 h-4 text-white" /> Imprimir / Salvar PDF
              </button>
              <button
                type="button"
                onClick={() => setPdfOSSelected(null)}
                className="py-2 px-3 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:bg-slate-900 font-bold text-xs cursor-pointer transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>

          {/* PRINTABLE AREA CONTAINER SHEET */}
          <div 
            id="print-os-document-sheet" 
            className="print-container-target bg-white text-black max-w-4xl w-full rounded-2xl p-8 md:p-10 shadow-2xl relative text-left flex flex-col font-sans"
            style={{ minHeight: '297mm' }}
          >
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-black pb-5 gap-4">
              <div className="flex flex-col gap-1 max-w-[70%] text-left">
                <h1 className="font-display font-extrabold text-lg sm:text-xl text-black leading-tight uppercase font-mono tracking-wide">
                  {company?.name || 'AutoPrecision Premium'}
                </h1>
                <p className="text-[10.5px] text-gray-700 leading-normal font-mono max-w-md">
                  {company?.address || "Avenida das Nações Unidas, 1040 - São Paulo, SP"}
                </p>
                <p className="text-[10px] text-gray-500 font-mono">
                  CNPJ: {company?.cnpj || "12.345.678/0001-90"} • Fone: {company?.phone || "(11) 98765-4321"}
                </p>
                {company?.email && (
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                    E-mail: {company.email}
                  </p>
                )}
              </div>

              <div className="flex flex-col md:items-end text-left md:text-right font-mono text-[10px] bg-gray-100 border border-gray-200 rounded-xl p-3 max-w-[280px] w-full md:w-auto">
                <span className="font-sans font-extrabold text-xs block text-red-600 tracking-widest uppercase mb-1">
                  ORDEM DE SERVIÇO
                </span>
                <div>
                  <span className="text-gray-500 font-bold block uppercase text-[8px]">Protocolo ID:</span>
                  <strong className="text-black text-sm block mb-1">#{pdfOSSelected.id}</strong>
                </div>
                <div>
                  <span className="text-gray-500 font-bold block uppercase text-[8px]">Status Atual:</span>
                  <span className="bg-red-100 text-red-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-red-200 inline-block uppercase mb-1">
                    {pdfOSSelected.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-bold block uppercase text-[8px]">Data de Entrada:</span>
                  <span className="text-black font-semibold">
                    {new Date(pdfOSSelected.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Identification Area */}
            <div className="mt-6">
              <h2 className="text-[11px] font-bold font-mono tracking-wider text-black bg-gray-100 px-3 py-1 text-left border-l-4 border-black uppercase mb-3">
                1. DADOS DOS PARTICIPANTES E VEÍCULO
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 font-mono text-xs border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <div>
                  <span className="text-gray-500 font-bold uppercase text-[9px] block">CLIENTE/PROPRIETÁRIO:</span>
                  <strong className="text-black text-[13px]">{pdfOSSelected.clienteName}</strong>
                </div>
                <div>
                  <span className="text-gray-500 font-bold uppercase text-[9px] block">CPF / CNPJ:</span>
                  <span className="text-black font-semibold">{pdfOSSelected.clienteCpfCnpj || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-bold uppercase text-[9px] block">TELEFONE CONTATO:</span>
                  <span className="text-black font-semibold">{pdfOSSelected.clientePhone}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-bold uppercase text-[9px] block">MECÂNICO OPERADOR RESPONSÁVEL:</span>
                  <strong className="text-black">{pdfOSSelected.mechanicName}</strong>
                </div>
                <div className="col-span-2 border-t border-gray-200 pt-2 mt-1">
                  <span className="text-gray-500 font-bold uppercase text-[9px] block">VEÍCULO / COR / DETALHAMENTO:</span>
                  <strong className="text-black text-[12px]">{pdfOSSelected.veiculoInfo}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 font-bold uppercase text-[9px] block font-mono">PLACA DO CARRO:</span>
                  <span className="text-xs font-bold font-mono bg-blue-100 text-blue-900 border border-blue-200 rounded px-1.5 py-0.5 inline-block uppercase mt-1">
                    {pdfOSSelected.plate.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Problem Area */}
            <div className="mt-6">
              <h2 className="text-[11px] font-bold font-mono tracking-wider text-black bg-gray-100 px-3 py-1 border-l-4 border-black uppercase mb-3 text-left">
                2. SINTOMÁTICA RECOLHIDA E DIAGNÓSTICO
              </h2>
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/20 font-mono text-xs">
                <div className="mb-3">
                  <strong className="text-gray-500 block text-[9.5px] uppercase font-bold mb-1">🚨 SINAIS E RECLAMAÇÕES INICIAIS:</strong>
                  <p className="text-black italic pl-3 border-l-2 border-red-500 leading-relaxed font-sans font-medium">
                    "{pdfOSSelected.problem}"
                  </p>
                </div>
                {pdfOSSelected.diagnosis && (
                  <div className="pt-3 border-t border-gray-100">
                    <strong className="text-red-650 block text-[9.5px] uppercase font-bold mb-1">🔧 RESPALDO DA AVALIAÇÃO MECÂNICA:</strong>
                    <p className="text-black pl-3 border-l-2 border-black leading-relaxed font-sans">
                      {pdfOSSelected.diagnosis}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Services Table */}
            <div className="mt-6">
              <h2 className="text-[11px] font-bold font-mono tracking-wider text-black bg-gray-100 px-3 py-1 border-l-4 border-black uppercase mb-3 text-left">
                3. DEMONSTRATIVO DE SERVIÇOS EFETUADOS
              </h2>

              {pdfOSSelected.services && pdfOSSelected.services.length > 0 ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full font-mono text-[11px]">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 text-left">
                        <th className="p-3">Descrição do Serviço / Mão de Obra</th>
                        <th className="p-3 text-right w-[155px]">Preço Líquido (R$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pdfOSSelected.services.map((srv, sIdx) => (
                        <tr key={srv.id || sIdx} className="text-black hover:bg-gray-50">
                          <td className="p-3 font-semibold text-left">{srv.description}</td>
                          <td className="p-3 text-right font-extrabold text-black">
                            R$ {srv.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic pl-3 font-mono">Nenhum serviço manual ou de catálogo anexado.</p>
              )}
            </div>

            {/* Parts Table */}
            <div className="mt-6">
              <h2 className="text-[11px] font-bold font-mono tracking-wider text-black bg-gray-100 px-3 py-1 border-l-4 border-black uppercase mb-3 text-left">
                4. SUPRIMENTO DE PEÇAS E MATERIAIS
              </h2>

              {pdfOSSelected.parts && pdfOSSelected.parts.length > 0 ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full font-mono text-[11px]">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 text-left">
                        <th className="p-3">Componente Aplicado</th>
                        <th className="p-3 text-center w-[80px]">Quant.</th>
                        <th className="p-3 text-right w-[140px]">Unitário (R$)</th>
                        <th className="p-3 text-right w-[140px]">Subtotal (R$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pdfOSSelected.parts.map((part, pIdx) => (
                        <tr key={part.id || pIdx} className="text-black hover:bg-gray-50">
                          <td className="p-3 font-semibold text-left">{part.name}</td>
                          <td className="p-3 text-center font-bold">{part.quantity}</td>
                          <td className="p-3 text-right">R$ {part.sellPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="p-3 text-right font-extrabold text-black">
                            R$ {(part.sellPrice * part.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic pl-3 font-mono">Nenhuma peça do almoxarifado foi aplicada.</p>
              )}
            </div>

            {/* Total Balance */}
            <div className="mt-6 p-4 border-2 border-black bg-gray-50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
              <div className="flex gap-4 flex-wrap text-gray-600 text-[11px] text-left">
                <div>
                  <span>Total Mão de Obra:</span>
                  <strong className="text-black block text-sm">
                    R$ {pdfOSSelected.services.reduce((acc, s) => acc + s.price, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div className="border-l border-gray-300 pl-4">
                  <span>Total Sobressalentes:</span>
                  <strong className="text-black block text-sm">
                    R$ {pdfOSSelected.parts.reduce((acc, p) => acc + (p.sellPrice * p.quantity), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              <div className="text-center sm:text-right bg-black text-white p-2 px-4 rounded-lg">
                <span className="text-[9px] uppercase tracking-wider block text-gray-400">VALOR TOTAL CONSOLIDADO:</span>
                <strong className="text-lg text-red-500 font-extrabold block">
                  R$ {pdfOSSelected.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            {/* Signature Stamps */}
            <div className="mt-12">
              {pdfOSSelected.signature ? (
                <div className="border-t border-dashed border-gray-300 pt-6 flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-500 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold font-mono text-emerald-600 tracking-wider block uppercase">AUTORIZAÇÃO DIGITAL CONFIRMADA</span>
                    <p className="text-[10px] text-gray-600 leading-normal max-w-lg font-mono">
                      {pdfOSSelected.signature}
                    </p>
                    {pdfOSSelected.signedAt && (
                      <span className="text-[8.5px] text-gray-500 block mt-0.5 font-mono">
                        Armazenado e validado via token em {new Date(pdfOSSelected.signedAt).toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-t border-dashed border-gray-300 pt-12 grid grid-cols-1 md:grid-cols-2 gap-10 font-mono text-[10px] text-center text-gray-600">
                  <div className="flex flex-col items-center">
                    <div className="w-full max-w-[280px] border-b border-black mb-1.5 h-[1px]"></div>
                    <span>Responsável Técnico / Oficina Autotech</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-full max-w-[280px] border-b border-black mb-1.5 h-[1px]"></div>
                    <span>Assinatura de Aprovação do Cliente</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Rules */}
            <p className="text-[8px] text-gray-400 text-center font-mono mt-12 border-t border-gray-100 pt-3 self-center">
              Este relatório é gerado em conformidade com as regras de orçamento técnico preventivo. A garantia legal para novos componentes aplicados é de 90 dias.
            </p>

          </div>
        </div>
      )}

      {reopenOSId && (
        <div id="warranty-reopen-modal" className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-[#0c1223] border border-purple-500/30 text-white max-w-md w-full rounded-2xl p-6 shadow-2xl relative flex flex-col gap-4">
            
            <button 
              type="button"
              id="btn-close-reopen-modal"
              onClick={() => {
                setReopenOSId(null);
                setReopenReasonText('');
              }}
              className="absolute top-4 right-4 p-1 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-gray-850 pb-3 flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-950/55 border border-purple-800 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <RefreshCw className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <span className="font-display font-extrabold text-sm block tracking-widest text-purple-400 uppercase">REABRIR OS (GARANTIA TÉCNICA)</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Retornar mão de obra ao pátio para reincidência</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
              Esta ação colocará a Ordem de Serviço #<strong>{reopenOSId}</strong> de volta ao status de <strong>"Garantia Reaberta"</strong>. A mão de obra e as peças correspondentes ficarão disponíveis para edição, possibilitando novos diagnósticos sem finalizar a ordem de serviço.
            </p>

            <div className="flex flex-col gap-1.5 font-sans">
              <label htmlFor="reopen-reason-input" className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wider">Descrição Detalhada do Defeito Reincidente</label>
              <textarea
                id="reopen-reason-input"
                rows={3}
                placeholder="Exemplo: Veículo retornou apresentando o mesmo barulho na pinça de freio dianteira esquerda..."
                value={reopenReasonText}
                onChange={(e) => setReopenReasonText(e.target.value)}
                className="w-full bg-[#080c16] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 font-mono"
              />
              <span className="text-[9px] text-gray-500 font-sans block leading-normal">
                Esta justificativa será armazenada de forma permanente no log de auditorias e exibida para acompanhamento no link de pós-venda do cliente.
              </span>
            </div>

            <div className="flex gap-2 font-mono mt-2">
              <button 
                type="button"
                id="btn-reopen-confirm"
                onClick={async () => {
                  if (!reopenReasonText.trim()) {
                    alert("Por favor, descreva qual o defeito reincidente apresentado pelo cliente.");
                    return;
                  }
                  const foundOS = ordensServico.find(o => o.id === reopenOSId);
                  if (foundOS) {
                    await editOS(reopenOSId, {
                      status: 'Garantia Reaberta',
                      reopenCount: (foundOS.reopenCount || 0) + 1,
                      reopenedAt: new Date().toISOString(),
                      reopenReason: reopenReasonText
                    });
                    setReopenOSId(null);
                    setReopenReasonText('');
                    alert("Ordem de Serviço reaberta em Garantia com sucesso! O pátio técnico de mão de obra já foi atualizado.");
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-750 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all border-0"
              >
                <RefreshCw className="w-4 h-4 text-white" /> Confirmar Reabertura
              </button>
              <button 
                type="button"
                id="btn-reopen-cancel"
                onClick={() => {
                  setReopenOSId(null);
                  setReopenReasonText('');
                }}
                className="flex-1 py-1.5 px-2.5 rounded-xl border border-neutral-800 hover:bg-slate-900 text-xs text-neutral-300 font-semibold cursor-pointer transition-all text-center bg-transparent"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
