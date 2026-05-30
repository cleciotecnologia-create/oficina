import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Calendar, 
  Phone, 
  Mail, 
  Coins, 
  Bell, 
  MessageSquare, 
  AlertCircle, 
  Car, 
  Hash, 
  FileText,
  BadgeAlert,
  Sliders,
  Award,
  Droplet,
  Copy,
  Check,
  MapPin,
  Edit2,
  Trash2,
  ShoppingBag,
  Printer
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Cliente, Veiculo, OrdemServico } from '../types';
import { AUTO_SUGGESTIONS } from '../lib/autoSuggestions';

interface OilRecommendation {
  oilType: string;
  recommendation: string;
  status: 'critical' | 'warning' | 'ok' | 'unknown';
  kmRodados: number | null;
  lastChangeKm: number | null;
  message: string;
  badgeStyle: string;
}

const analyzeVehicleOil = (veh: Veiculo, ordens: OrdemServico[]): OilRecommendation => {
  // Find all service orders for this vehicle
  const vehicleOrders = ordens.filter(os => 
    (os.veiculoId === veh.id || os.plate.toUpperCase().trim() === veh.plate.toUpperCase().trim()) &&
    (os.status === 'Finalizada' || os.status === 'Entregue')
  );

  const oilChangeOrders = vehicleOrders.filter(os => {
    const hasOilPart = os.parts?.some(p => p.name.toLowerCase().includes('óleo') || p.name.toLowerCase().includes('oleo') || p.name.toLowerCase().includes('lubrificante'));
    const hasOilServ = os.services?.some(s => s.description.toLowerCase().includes('óleo') || s.description.toLowerCase().includes('oleo') || s.description.toLowerCase().includes('troca de lubrificante') || s.description.toLowerCase().includes('troca de filtro'));
    return hasOilPart || hasOilServ;
  });

  let lastChangeKm: number | null = null;
  if (oilChangeOrders.length > 0) {
    const sortedByDate = [...oilChangeOrders].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    lastChangeKm = sortedByDate[0].km;
  }

  let oilType = "";
  let recommendation = "";
  const currentKm = veh.km || 0;

  if (currentKm < 50000) {
    oilType = "5W30 Sintético";
    recommendation = "Motor novo de baixa rodagem. Óleos 100% sintéticos de baixa viscosidade como 5W30 ou 0W20 evitam atrito interno severo, garantindo economia térmica e proteção milimétrica a frio.";
  } else if (currentKm >= 50000 && currentKm < 100000) {
    oilType = "10W40 Semi-Sintético";
    recommendation = "Média quilometragem. Lubrificantes semi-sintéticos garantem estabilidade de viscosidade térmica face às folgas uniformes do motor amaciado, protegendo os pistões contra desgaste e fuligem.";
  } else {
    oilType = "15W40 Mineral ou 20W50";
    recommendation = "Motor com alta quilometragem (+100.000 KM). Ideal óleo mineral robusto ou aditivos de selagem 'High Mileage' para vedar retentores, amortecer tuchos acústicos e conter vazamentos ou consumo acelerado de fumaça.";
  }

  if (lastChangeKm === null) {
    return {
      oilType,
      recommendation,
      status: 'unknown',
      kmRodados: null,
      lastChangeKm: null,
      message: "⚠️ Sem histórico anterior de troca de óleo nesta oficina. Recomendável efetuar por segurança preventiva.",
      badgeStyle: "bg-amber-950/40 text-amber-500 border border-amber-900/40"
    };
  }

  const kmRodados = currentKm - lastChangeKm;

  if (kmRodados >= 10000) {
    return {
      oilType,
      recommendation,
      status: 'critical',
      kmRodados,
      lastChangeKm,
      message: `🚨 Troca Crítica Vencida! Rodou ${kmRodados.toLocaleString()} KM desde a última troca aos ${lastChangeKm.toLocaleString()} KM. Alto risco de borra e falhas!`,
      badgeStyle: "bg-red-950/60 text-red-400 border border-red-900/60 animate-pulse"
    };
  } else if (kmRodados >= 8000) {
    return {
      oilType,
      recommendation,
      status: 'warning',
      kmRodados,
      lastChangeKm,
      message: `⚠️ Troca Recomendada Próxima! Rodou ${kmRodados.toLocaleString()} KM desde os ${lastChangeKm.toLocaleString()} KM. Agendamento preventivo instruído.`,
      badgeStyle: "bg-yellow-950/40 text-yellow-500 border border-yellow-900/40"
    };
  } else {
    return {
      oilType,
      recommendation,
      status: 'ok',
      kmRodados,
      lastChangeKm,
      message: `✅ Sistema Saudável! Rodou ${kmRodados.toLocaleString()} KM desde a última troca (${lastChangeKm.toLocaleString()} KM).`,
      badgeStyle: "bg-green-950/40 text-green-400 border border-green-900/40"
    };
  }
};

export const CRMView: React.FC = () => {
  const { 
    clientes, 
    veiculos, 
    addCliente, 
    editCliente, 
    deleteCliente,
    addVeiculo, 
    editVeiculo, 
    deleteVeiculo,
    ordensServico,
    vendas,
    company
  } = useApp();

  const printSaleReceiptDirect = (v: any, comp: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Por favor, desative o bloqueador de popups para imprimir.");
      return;
    }

    const itemsHtml = v.items.map((it: any) => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
        <span style="font-weight: 500;">${it.name}</span>
        <span>${it.quantity}x R$ ${it.sellPrice.toFixed(2)}</span>
      </div>
    `).join('');

    const estornoHtml = v.status === 'estornada' ? `
      <div style="margin: 8px 0; padding: 6px; border: 2px solid #dc2626; background: #fee2e2; color: #991b1b; text-align: center; border-radius: 4px; font-weight: bold; font-size: 11px;">
        ⚠️ CUPOM ESTORNADO / CANCELADO ⚠️
        <div style="font-size: 9px; font-weight: normal; margin-top: 2px; text-transform: none;">
          motivo: "${v.justification || 'não informado'}"
        </div>
      </div>
    ` : '';

    const discountValue = v.discount || 0;
    const discountHtml = discountValue > 0 ? `
      <div style="display: flex; justify-content: space-between; color: red;">
        <span>Desconto:</span>
        <span>- R$ ${discountValue.toFixed(2)}</span>
      </div>
    ` : '';

    const subtotalText = (v.total + discountValue).toFixed(2);
    const totalPaidText = v.total.toFixed(2);
    const dateText = new Date(v.date).toLocaleString('pt-BR');
    const paymentMethodText = v.paymentMethod;
    const clientNameText = v.clienteName || 'Consumidor Final';
    const clientCpfText = v.clienteCpfCnpj || 'Consumidor Final';

    const content = `
      <html>
        <head>
          <title>Reimpressão Cupom #${v.id}</title>
          <style>
            body {
              font-family: monospace;
              padding: 20px;
              color: black;
              background: white;
              max-width: 300px;
              margin: 0 auto;
              font-size: 11px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid black;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .dashed-line {
              border-bottom: 1px dashed black;
              margin: 8px 0;
            }
            .total {
              font-weight: bold;
              font-size: 13px;
              display: flex;
              justify-content: space-between;
              margin-top: 6px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <strong style="font-size: 13px;">${comp.name.toUpperCase()}</strong><br/>
            <span>${comp.address || 'Av. das Nações Unidas, 1040'}</span><br/>
            <span>CNPJ: ${comp.cnpj || '12.345.678/0001-90'} • Fone: ${comp.phone || '(11) 98765-4321'}</span>
          </div>

          ${estornoHtml}

          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>REIMPRESSÃO CUPOM</span>
            <span>ID #${v.id}</span>
          </div>
          <div>Data/Hora: ${dateText}</div>
          <div class="dashed-line"></div>

          <div style="background: #f3f4f6; padding: 4px; font-size: 10px; border-radius: 3px;">
            <strong>CLIENTE:</strong> ${clientNameText}<br/>
            CPF/CNPJ: ${clientCpfText}
          </div>

          <div class="dashed-line"></div>
          <div style="font-weight: bold; margin-bottom: 4px;">ITENS:</div>
          ${itemsHtml}
          <div class="dashed-line"></div>

          <div style="display: flex; justify-content: space-between;">
            <span>Subtotal:</span>
            <span>R$ ${subtotalText}</span>
          </div>
          ${discountHtml}

          <div class="total">
            <span>TOTAL PAGO:</span>
            <span>R$ ${totalPaidText}</span>
          </div>
          <div style="margin-top: 4px; text-transform: uppercase;">Método: <strong>${paymentMethodText}</strong></div>

          <div class="dashed-line"></div>
          <div style="text-align: center; margin-top: 20px; font-size: 10px;">
            Agradecemos a preferência!<br/>
            AutoTech Software Integrado
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const [activeTab, setActiveTab] = useState<'clientes' | 'veiculos' | 'fidelidade' | 'campanhas' | 'lembretes'>('clientes');

  // Automated maintenance reminders states
  const [reminderKmThreshold, setReminderKmThreshold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('autotech_reminder_km_threshold');
      return saved ? parseInt(saved, 10) : 9000;
    } catch {
      return 9000;
    }
  });

  const [reminderTemplate, setReminderTemplate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('autotech_reminder_template');
      return saved || 'Olá, {nome_cliente}! Seu {modelo_veiculo} ({placa_veiculo}) rodou {km_rodados} KM desde a última troca de óleo preventiva que ocorreu aos {ultima_troca_km} KM (KM Atual: {km_atual} KM). Recomendamos agendar a manutenção preventiva! Quer alinhar um horário?';
    } catch {
      return 'Olá, {nome_cliente}! Seu {modelo_veiculo} ({placa_veiculo}) rodou {km_rodados} KM desde a última troca de óleo preventiva que ocorreu aos {ultima_troca_km} KM (KM Atual: {km_atual} KM). Recomendamos agendar a manutenção preventiva! Quer alinhar um horário?';
    }
  });

  const [scheduledReminders, setScheduledReminders] = useState<{
    id: string;
    clientId: string;
    vehicleId: string;
    clientName: string;
    vehicleName: string;
    plate: string;
    lastOilChangeKm: number;
    currentKm: number;
    kmDelta: number;
    status: 'Agendado' | 'Enviado' | 'Cancelado';
    scheduledDate: string;
    sentDate?: string;
  }[]>(() => {
    try {
      const saved = localStorage.getItem('autotech_scheduled_reminders');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: "rem_1",
        clientId: "cli_1",
        vehicleId: "veh_1",
        clientName: "Alexandre Pires",
        vehicleName: "Honda Civic 2.0 LXR",
        plate: "CVX-4591",
        lastOilChangeKm: 42000,
        currentKm: 51200,
        kmDelta: 9200,
        status: "Agendado",
        scheduledDate: "2026-06-05 09:30"
      },
      {
        id: "rem_2",
        clientId: "cli_2",
        vehicleId: "veh_2",
        clientName: "Mariana Souza Santos",
        vehicleName: "Toyota Corolla GLi",
        plate: "BRA-2C99",
        lastOilChangeKm: 85000,
        currentKm: 94500,
        kmDelta: 9505,
        status: "Enviado",
        scheduledDate: "2026-05-28 14:00",
        sentDate: "2026-05-28 14:05"
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('autotech_reminder_km_threshold', reminderKmThreshold.toString());
    } catch (e) {
      console.error(e);
    }
  }, [reminderKmThreshold]);

  useEffect(() => {
    try {
      localStorage.setItem('autotech_reminder_template', reminderTemplate);
    } catch (e) {
      console.error(e);
    }
  }, [reminderTemplate]);

  useEffect(() => {
    try {
      localStorage.setItem('autotech_scheduled_reminders', JSON.stringify(scheduledReminders));
    } catch (e) {
      console.error(e);
    }
  }, [scheduledReminders]);

  const [filterReminderStatus, setFilterReminderStatus] = useState<'Todos' | 'Agendado' | 'Enviado' | 'Cancelado'>('Todos');
  const [newReminderScheduledDate, setNewReminderScheduledDate] = useState('2026-06-01');
  const [newReminderScheduledTime, setNewReminderScheduledTime] = useState('10:00');
  const [selectedReminderVehicleId, setSelectedReminderVehicleId] = useState('');
  const [reminderSearchQuery, setReminderSearchQuery] = useState('');
  const [showAutoReminderSavedToast, setShowAutoReminderSavedToast] = useState(false);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [copiedAnalysisId, setCopiedAnalysisId] = useState<string | null>(null);

  // Edit & Delete states
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Cliente | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Veiculo | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Veiculo | null>(null);
  const [vehicleModalTab, setVehicleModalTab] = useState<'cadastro' | 'historico'>('cadastro');

  // Edit Client Form Fields
  const [editCliName, setEditCliName] = useState('');
  const [editCliPhone, setEditCliPhone] = useState('');
  const [editCliEmail, setEditCliEmail] = useState('');
  const [editCliCpfCnpj, setEditCliCpfCnpj] = useState('');
  const [editCliCep, setEditCliCep] = useState('');
  const [editCliAddress, setEditCliAddress] = useState('');
  const [editCliOilAlert, setEditCliOilAlert] = useState(true);
  const [editCliReviewAlert, setEditCliReviewAlert] = useState(true);
  const [isFetchingEditCliCep, setIsFetchingEditCliCep] = useState(false);
  const [editCliCepError, setEditCliCepError] = useState<string | null>(null);

  // Edit Vehicle Form Fields
  const [editVehClient, setEditVehClient] = useState('');
  const [editVehBrand, setEditVehBrand] = useState('');
  const [editVehModel, setEditVehModel] = useState('');
  const [editVehYear, setEditVehYear] = useState('');
  const [editVehEngine, setEditVehEngine] = useState('');
  const [editVehPlate, setEditVehPlate] = useState('');
  const [editVehChassi, setEditVehChassi] = useState('');
  const [editVehKm, setEditVehKm] = useState('');

  const startEditClient = (cli: Cliente) => {
    setEditingClient(cli);
    setEditCliName(cli.name);
    setEditCliPhone(cli.phone);
    setEditCliEmail(cli.email || '');
    setEditCliCpfCnpj(cli.cpfCnpj || '');
    setEditCliCep(cli.cep || '');
    setEditCliAddress(cli.address || '');
    setEditCliOilAlert(cli.oilChangeAlert !== false);
    setEditCliReviewAlert(cli.reviewAlert !== false);
  };

  const startEditVehicle = (veh: Veiculo) => {
    setEditingVehicle(veh);
    setEditVehClient(veh.clienteId);
    setEditVehBrand(veh.brand);
    setEditVehModel(veh.model);
    setEditVehYear(veh.year);
    setEditVehEngine(veh.engine || '');
    setEditVehPlate(veh.plate);
    setEditVehChassi(veh.chassi || '');
    setEditVehKm(String(veh.km || 0));
    setVehicleModalTab('cadastro');

    const matchBrand = AUTO_SUGGESTIONS.find(s => s.name.toLowerCase() === veh.brand.toLowerCase());
    if (matchBrand) {
      setEditCrmModelsList(matchBrand.models);
    } else {
      setEditCrmModelsList([]);
    }
  };

  const handleFetchEditClientCep = async (cepCode: string) => {
    const clean = cepCode.replace(/\D/g, "");
    if (clean.length !== 8) return;
    
    setIsFetchingEditCliCep(true);
    setEditCliCepError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) {
        setEditCliCepError("CEP inválido/não encontrado.");
      } else {
        const logradouro = data.logradouro || "";
        const bairro = data.bairro || "";
        const localidade = data.localidade || "";
        const uf = data.uf || "";
        
        let fullAddress = "";
        if (logradouro) fullAddress += logradouro;
        if (bairro) fullAddress += `, ${bairro}`;
        if (localidade) fullAddress += ` - ${localidade}`;
        if (uf) fullAddress += `/${uf}`;
        
        setEditCliAddress(fullAddress);
      }
    } catch (err) {
      setEditCliCepError("Erro na conexão com ViaCEP.");
    } finally {
      setIsFetchingEditCliCep(false);
    }
  };

  const handleEditClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    if (!editCliName || !editCliPhone) {
      alert("Por favor, preencha o Nome e WhatsApp correspondente do cliente.");
      return;
    }

    await editCliente(editingClient.id, {
      name: editCliName,
      phone: editCliPhone,
      email: editCliEmail,
      cpfCnpj: editCliCpfCnpj,
      cep: editCliCep || undefined,
      address: editCliAddress || undefined,
      oilChangeAlert: editCliOilAlert,
      reviewAlert: editCliReviewAlert
    });

    setEditingClient(null);
    alert("Cliente atualizado com sucesso!");
  };

  const handleEditVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    if (!editVehClient || !editVehPlate || !editVehBrand || !editVehModel) {
      alert("Campos básicos obrigatórios ausentes para o cadastro veicular.");
      return;
    }

    await editVeiculo(editingVehicle.id, {
      clienteId: editVehClient,
      brand: editVehBrand,
      model: editVehModel,
      year: editVehYear,
      engine: editVehEngine,
      plate: editVehPlate.toUpperCase().trim(),
      chassi: editVehChassi,
      km: parseInt(editVehKm) || 0
    });

    setEditingVehicle(null);
    alert("Veículo atualizado com sucesso!");
  };

  const handleConfirmDeleteClient = async () => {
    if (!clientToDelete) return;
    await deleteCliente(clientToDelete.id);
    setClientToDelete(null);
    alert("Cliente removido com sucesso!");
  };

  const handleConfirmDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    await deleteVeiculo(vehicleToDelete.id);
    setVehicleToDelete(null);
    alert("Veículo removido com sucesso!");
  };
  
  // Queries
  const [clientQuery, setClientQuery] = useState('');
  const [vehicleQuery, setVehicleQuery] = useState('');

  // New Client Fields
  const [cliName, setCliName] = useState('');
  const [cliPhone, setCliPhone] = useState('');
  const [cliEmail, setCliEmail] = useState('');
  const [cliCpfCnpj, setCliCpfCnpj] = useState('');
  const [cliCep, setCliCep] = useState('');
  const [cliAddress, setCliAddress] = useState('');
  const [isFetchingCliCep, setIsFetchingCliCep] = useState(false);
  const [cliCepError, setCliCepError] = useState<string | null>(null);

  const handleFetchClientCep = async (cepCode: string) => {
    const clean = cepCode.replace(/\D/g, "");
    if (clean.length !== 8) return;
    
    setIsFetchingCliCep(true);
    setCliCepError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCliCepError("CEP inválido/não encontrado.");
      } else {
        const logradouro = data.logradouro || "";
        const bairro = data.bairro || "";
        const localidade = data.localidade || "";
        const uf = data.uf || "";
        
        let fullAddress = "";
        if (logradouro) fullAddress += logradouro;
        if (bairro) fullAddress += `, ${bairro}`;
        if (localidade) fullAddress += ` - ${localidade}`;
        if (uf) fullAddress += `/${uf}`;
        
        setCliAddress(fullAddress);
      }
    } catch (err) {
      setCliCepError("Erro na conexão com ViaCEP.");
    } finally {
      setIsFetchingCliCep(false);
    }
  };

  const [cliOilAlert, setCliOilAlert] = useState(true);
  const [cliReviewAlert, setCliReviewAlert] = useState(true);

  // New Vehicle Fields
  const [vehClient, setVehClient] = useState('');
  const [vehBrand, setVehBrand] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehYear, setVehYear] = useState('');
  const [vehEngine, setVehEngine] = useState('');
  const [vehPlate, setVehPlate] = useState('');
  const [vehChassi, setVehChassi] = useState('');
  const [vehKm, setVehKm] = useState('');
  const [crmModelsList, setCrmModelsList] = useState<string[]>([]);
  const [editCrmModelsList, setEditCrmModelsList] = useState<string[]>([]);

  // Loyalty rewards mocks
  const [loyaltyLedger, setLoyaltyLedger] = useState([
    { id: "lo_1", clientId: "cli_1", name: "Alexandre Pires", totalSpend: 2350.00, points: 235, cashback: 47.00 },
    { id: "lo_2", clientId: "cli_2", name: "Mariana Souza Santos", totalSpend: 1540.90, points: 154, cashback: 30.80 },
    { id: "lo_3", clientId: "cli_3", name: "Roberto Carlos Almeida", totalSpend: 890.00, points: 89, cashback: 17.80 }
  ]);

  // Campaign creation state
  const [selectedCampaignType, setSelectedCampaignType] = useState('oil');
  const [customMsgText, setCustomMsgText] = useState('Lembrete de segurança: Identificamos que já faz 6 meses desde sua última vistoria em nossa oficina. Que tal agendar uma revisão preventiva rápida esta semana?');
  const [campaignOutputs, setCampaignOutputs] = useState<string[]>([]);

  // Submits
  const handleCreateClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliName || !cliPhone) {
      alert("Por favor, preencha o Nome e WhatsApp correspondente do cliente.");
      return;
    }
    
    await addCliente({
      name: cliName,
      phone: cliPhone,
      email: cliEmail || 'sem@email.com',
      cpfCnpj: cliCpfCnpj || '000.000.000-00',
      oilChangeAlert: cliOilAlert,
      reviewAlert: cliReviewAlert,
      cep: cliCep || undefined,
      address: cliAddress || undefined
    });

    setCliName('');
    setCliPhone('');
    setCliEmail('');
    setCliCpfCnpj('');
    setCliCep('');
    setCliAddress('');
    alert("Cliente registrado com êxito!");
  };

  const handleCreateVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehClient || !vehPlate || !vehBrand || !vehModel) {
      alert("Campos básicos obrigatórios ausentes para o cadastro veicular.");
      return;
    }

    await addVeiculo({
      clienteId: vehClient,
      brand: vehBrand,
      model: vehModel,
      year: vehYear || '2020',
      engine: vehEngine || '1.0 Flex',
      plate: vehPlate.toUpperCase().trim(),
      chassi: vehChassi || 'NÃO CONFIGURADO',
      km: parseInt(vehKm) || 0
    });

    setVehClient('');
    setVehBrand('');
    setVehModel('');
    setVehYear('');
    setVehEngine('');
    setVehPlate('');
    setVehChassi('');
    setVehKm('');
    alert("Veículo atrelado e registrado!");
  };

  // Launch campaign mock
  const handleLaunchCampaign = () => {
    let triggeredCount = 0;
    const outputsList: string[] = [];
    
    clientes.forEach(cli => {
      if (selectedCampaignType === 'oil' && cli.oilChangeAlert) {
        triggeredCount++;
        outputsList.push(`[WhatsApp Disparo API] Enviado para ${cli.name} (${cli.phone}) -> "Olá ${cli.name}, identificamos prazo próximo para troca de óleo preventiva Castrol. Agende voltando com desconto de 10%!"`);
      } else if (selectedCampaignType === 'review' && cli.reviewAlert) {
        triggeredCount++;
        outputsList.push(`[WhatsApp Disparo API] Enviado para ${cli.name} (${cli.phone}) -> "Revisão AutoTech: ${customMsgText}"`);
      }
    });

    setCampaignOutputs(outputsList);
    alert(`Disparador de Campanha Automatizado com Sucesso para ${triggeredCount} clientes que possuem alerta ativado!`);
  };

  // Helpers to fetch linked cars count
  const getLinkedVehiclesCount = (clientId: string) => {
    return veiculos.filter(v => v.clienteId === clientId).length;
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
            👥 RELACIONAMENTO CRM E VEÍCULOS
          </h1>
          <p className="text-xs text-gray-400 font-mono">Gerencie a base de clientes, frotas, histórico de revisões automáticas e cartões fidelidade.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#080d19] p-1 rounded-xl border border-gray-800 self-stretch sm:self-auto [&>button]:px-3.5 [&>button]:py-1.5 [&>button]:text-xs [&>button]:font-mono [&>button]:rounded-lg">
          <button 
            onClick={() => setActiveTab('clientes')}
            className={activeTab === 'clientes' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
          >
            Clientes
          </button>
          <button 
            onClick={() => setActiveTab('veiculos')}
            className={activeTab === 'veiculos' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
          >
            Veículos Cadastro
          </button>
          <button 
            onClick={() => setActiveTab('fidelidade')}
            className={activeTab === 'fidelidade' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
          >
            Programa Cashback
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('campanhas')}
            className={activeTab === 'campanhas' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
          >
            Ações WhatsApp
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('lembretes')}
            className={activeTab === 'lembretes' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
          >
            Lembretes Automáticos
          </button>
        </div>
      </div>

      {activeTab === 'clientes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CLIENTS DIRECT LISTINGS */}
          <div className="col-span-12 lg:col-span-8 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-gray-850 pb-4">
              <span className="font-display font-bold text-sm text-white">BASE DE CLIENTES CADASTRADOS</span>
              
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Filtrar por nome, telefone..."
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                  className="w-full bg-[#080c16] border border-gray-800 rounded-lg py-1 px-3 pl-8 text-xs text-white"
                />
              </div>
            </div>

            {/* List items */}
            <div className="flex flex-col gap-3.5 max-h-[500px] overflow-y-auto pr-1">
              {clientes.filter(cli => 
                cli.name.toLowerCase().includes(clientQuery.toLowerCase()) ||
                cli.phone.includes(clientQuery) ||
                cli.cpfCnpj.includes(clientQuery)
              ).map((cli) => {
                const spendingStat = loyaltyLedger.find(l => l.clientId === cli.id);
                const carsCount = getLinkedVehiclesCount(cli.id);
                const isExpanded = expandedClientId === cli.id;
                const clientVehicles = veiculos.filter(v => v.clienteId === cli.id);

                return (
                  <div key={cli.id} className="flex flex-col rounded-xl border border-gray-900 bg-[#080d19]/25 hover:border-gray-800 transition-all overflow-hidden divide-y divide-gray-900">
                    <div 
                      onClick={() => setExpandedClientId(isExpanded ? null : cli.id)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-950/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 shrink-0">
                          <Users className="w-4.5 h-4.5 text-red-500" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-white text-xs sm:text-sm flex items-center gap-2">
                            {cli.name}
                            {clientVehicles.some(vh => {
                              const check = analyzeVehicleOil(vh, ordensServico);
                              return check.status === 'critical';
                            }) && (
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">CPF/CNPJ: {cli.cpfCnpj} • ID: {cli.id}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono bg-[#0b101c] border border-gray-800 px-1.5 py-0.5 rounded text-gray-300">
                              🚗 {carsCount} carro(s) vinculado(s)
                            </span>
                            {spendingStat && (
                              <span className="text-[10px] font-mono bg-cyan-950/30 border border-cyan-900/30 px-1.5 py-0.5 rounded text-cyan-400 flex items-center gap-1">
                                <Coins className="w-3 h-3 text-cyan-400" /> CB: R$ {spendingStat.cashback.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-1.5 text-xs font-mono text-gray-400 shrink-0">
                        <div className="flex items-center gap-1 leading-none text-left sm:text-right">
                          <Phone className="w-3.5 h-3.5 text-green-500" /> {cli.phone}
                        </div>
                        <div className="text-[10px] text-gray-500">{cli.email}</div>
                        
                        {/* Notifications alarm checkboxes indicators & Action Buttons */}
                        <div className="flex flex-col gap-2 mt-2 w-full">
                          <div className="flex justify-between items-center gap-4 flex-wrap">
                            <div className="flex gap-1 text-[8px] font-bold">
                              <span className={`px-1 rounded ${cli.oilChangeAlert ? 'bg-green-950/40 text-green-500 border border-green-900/20' : 'bg-slate-900 text-slate-500'}`}>
                                💬 LUBRI-ALERTA
                              </span>
                              <span className={`px-1 rounded ${cli.reviewAlert ? 'bg-green-950/40 text-green-500 border border-green-900/20' : 'bg-slate-900 text-slate-500'}`}>
                                🔔 REVISÃO-ALERTA
                              </span>
                            </div>
                            <span className="text-[10px] text-red-400 hover:text-red-300 select-none font-bold shrink-0">
                              {isExpanded ? '▲ Recolher' : '▼ Analisar Óleo'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-gray-900/60 justify-start sm:justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditClient(cli);
                              }}
                              className="text-[10px] font-mono font-bold text-slate-300 hover:text-white flex items-center gap-1 bg-[#121c33] hover:bg-[#1a2b4d] px-2.5 py-1 rounded border border-gray-800 transition-all cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-cyan-400" /> EDITAR
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setClientToDelete(cli);
                              }}
                              className="text-[10px] font-mono font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-950/30 hover:bg-red-950/50 px-2.5 py-1 rounded border border-red-900/30 hover:border-red-900/50 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" /> EXCLUIR
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-[#050912]/80 flex flex-col gap-4 text-left">
                        {(cli.address || cli.cep) && (
                          <div className="bg-[#0b1020] border border-gray-850 p-3 rounded-xl flex items-start gap-2.5 text-xs">
                            <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Endereço Residencial / Entrega</span>
                              <p className="text-white text-xs font-sans">
                                {cli.address || "Endereço não preenchido"}
                                {cli.cep && (
                                  <span className="bg-[#050912] border border-gray-800 text-purple-400 font-mono text-[10px] px-2 py-0.5 rounded ml-2 font-bold select-all">
                                    CEP {cli.cep}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                          <h4 className="text-xs font-mono font-bold text-red-400 flex items-center gap-1.5 uppercase">
                            <Droplet className="w-4 h-4 text-red-500" /> Diagnóstico de Troca de Óleo e Viscosidades
                          </h4>
                          <span className="text-[9px] font-mono text-gray-600">AutoTech Telemetria Preventiva</span>
                        </div>

                        {clientVehicles.length === 0 ? (
                          <p className="text-gray-500 text-xs italic py-2">
                            🚘 Nenhum veículo cadastrado na frota deste cliente. Vincule um carro usando a aba "Veículos Cadastro" para habilitar o algoritmo.
                          </p>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {clientVehicles.map(vh => {
                              const analise = analyzeVehicleOil(vh, ordensServico);
                              
                              const messageText = `Olá, ${cli.name}! 🔧 Passando para avisar que analisamos o plano preventivo do seu veículo ${vh.brand} ${vh.model} (${vh.plate}). ` +
                                (analise.lastChangeKm !== null 
                                  ? `Identificamos que já rodou ${analise.kmRodados?.toLocaleString()} KM desde a última troca registrada (${analise.lastChangeKm?.toLocaleString()} KM). `
                                  : `Verificamos que ainda não consta registro de troca no banco de dados. `) +
                                `Com quilometragem atual em ${vh.km.toLocaleString()} KM, o óleo recomendado para o desgaste do seu motor é o *${analise.oilType}*. ` +
                                `${analise.status === 'critical' ? '🚨 Sua troca já está vencida (+10.000 KM)!' : '⚠️ Sugerimos efetuar uma visita em breve.'} Deseja agendar hoje?`;

                              return (
                                <div key={vh.id} className="bg-gray-950/40 p-4 rounded-xl border border-gray-900 flex flex-col gap-3">
                                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#0f172a] pb-2">
                                    <div>
                                      <span className="font-bold text-gray-100 text-xs uppercase block">{vh.brand} {vh.model}</span>
                                      <span className="text-[10px] text-gray-500">Motor: {vh.engine} • Ano: {vh.year}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono bg-cyan-950/20 border border-cyan-900/30 px-2 py-0.5 rounded text-cyan-400 text-[10px] font-bold">
                                        {vh.plate}
                                      </span>
                                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${analise.badgeStyle}`}>
                                        {analise.status === 'critical' ? '🚨 VENCIDO' : analise.status === 'warning' ? '⚠️ PRÓXIMO' : analise.status === 'ok' ? '✅ EM DIA' : '⬜ SEM REGISTRO'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-1.5 font-mono text-[10px]">
                                    <div className="flex justify-between text-gray-400">
                                      <span>Última troca na OS: <strong>{analise.lastChangeKm !== null ? `${analise.lastChangeKm.toLocaleString()} KM` : 'Nenhuma'}</strong></span>
                                      <span>KM Atual do Veículo: <strong>{vh.km.toLocaleString()} KM</strong></span>
                                    </div>

                                    {analise.lastChangeKm !== null && (
                                      <div className="w-full bg-[#080d16] border border-gray-900 h-2 rounded-full overflow-hidden flex">
                                        <div 
                                          className={`h-full rounded-full transition-all ${
                                            analise.status === 'critical' ? 'bg-red-500' : analise.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                                          }`}
                                          style={{ width: `${Math.min(100, ((analise.kmRodados || 0) / 10000) * 100)}%` }}
                                        />
                                      </div>
                                    )}

                                    <p className="text-[10px] text-gray-300 font-sans mt-1">
                                      {analise.message}
                                    </p>
                                  </div>

                                  <div className="bg-[#0b1020] border border-gray-850 p-2.5 rounded-lg flex flex-col gap-1 text-xs">
                                    <span className="text-[9px] text-red-400 font-bold block uppercase tracking-wider">Combinação e Sugestão Recomendada:</span>
                                    <strong className="text-white text-xs block font-display">{analise.oilType}</strong>
                                    <p className="text-[10px] text-gray-400 font-sans leading-relaxed mt-1">
                                      {analise.recommendation}
                                    </p>
                                  </div>

                                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-900 justify-end">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(messageText);
                                        setCopiedAnalysisId(vh.id);
                                        setTimeout(() => setCopiedAnalysisId(null), 2500);
                                      }}
                                      className="py-1 px-3 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 text-[10px] font-mono flex items-center gap-1 transition-all"
                                    >
                                      {copiedAnalysisId === vh.id ? (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-green-500" /> Copiado!
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3.5 h-3.5 text-gray-400" /> Copiar Alerta
                                        </>
                                      )}
                                    </button>
                                    <a 
                                      href={`https://api.whatsapp.com/send?phone=55${cli.phone.replace(/\D/g, "")}&text=${encodeURIComponent(messageText)}`}
                                      target="_blank"
                                      rel="noreferrer noopener"
                                      onClick={(e) => e.stopPropagation()}
                                      className="py-1 px-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[10px] font-semibold flex items-center gap-1 transition-all"
                                    >
                                      💬 WhatsApp Direto
                                    </a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 🛍️ HISTÓRICO DE COMPRAS (PDV) DO CLIENTE */}
                        <div className="border-t border-gray-900 pt-4 mt-2">
                          <div className="flex items-center justify-between border-b border-gray-900 pb-2 mb-3">
                            <h4 className="text-xs font-mono font-bold text-red-500 flex items-center gap-1.5 uppercase">
                              <ShoppingBag className="w-4 h-4 text-red-500" /> Histórico de Compras no PDV ({vendas.filter(vl => vl.clienteId === cli.id).length})
                            </h4>
                            <span className="text-[9px] font-mono text-gray-500">Fluxo Integrado de Frente de Loja</span>
                          </div>

                          {(() => {
                            const clientSales = vendas.filter(vl => vl.clienteId === cli.id);
                            if (clientSales.length === 0) {
                              return (
                                <p className="text-gray-500 text-xs italic py-1 text-left">
                                  🛍️ Nenhuma compra registrada no PDV Balcão para este cliente.
                                </p>
                              );
                            }
                            return (
                              <div className="flex flex-col gap-2.5">
                                {clientSales.map(v => {
                                  const isEstornada = v.status === 'estornada';
                                  return (
                                    <div key={v.id} className={`bg-[#070b14]/50 p-3 rounded-xl border border-gray-900 flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${isEstornada ? 'opacity-55' : ''}`}>
                                      <div className="text-left font-mono text-xs">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-bold text-white uppercase">{v.id}</span>
                                          <span className="text-[10px] text-gray-500">{new Date(v.date).toLocaleString('pt-BR')}</span>
                                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                            v.paymentMethod === 'PIX' ? 'bg-cyan-950/45 text-cyan-400' :
                                            v.paymentMethod === 'Cartão' ? 'bg-purple-950/45 text-purple-400' :
                                            'bg-emerald-950/45 text-emerald-400'
                                          }`}>
                                            {v.paymentMethod}
                                          </span>
                                          {isEstornada && (
                                            <span className="bg-red-950/55 text-red-400 border border-red-900/40 text-[8.5px] px-1 rounded font-bold uppercase">
                                              🚨 ESTORNADA
                                            </span>
                                          )}
                                        </div>
                                        
                                        <div className="mt-1.5 flex flex-col gap-0.5 text-gray-400 text-[10.5px] font-sans">
                                          {v.items.map((it: any, idx: number) => (
                                            <div key={idx} className="flex gap-1">
                                              <span>• {it.name}</span>
                                              <span className="text-gray-500">({it.quantity}x de R$ {it.sellPrice.toFixed(2)})</span>
                                            </div>
                                          ))}
                                          {v.justification && (
                                            <div className="text-[9.5px] text-red-400 mt-1 italic font-sans normal-case block text-left">
                                              Motivo do Estorno: "{v.justification}"
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
                                        <div className="text-right font-mono">
                                          <span className="text-[9px] text-gray-400 block uppercase">VALOR TOTAL</span>
                                          <span className="text-xs text-white font-extrabold">R$ {v.total.toFixed(2)}</span>
                                        </div>
                                        
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            printSaleReceiptDirect(v, company);
                                          }}
                                          className="py-1 px-2.5 rounded bg-gray-900 hover:bg-[#121c33] border border-gray-800 hover:border-cyan-900 text-[10px] font-mono text-gray-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 uppercase font-bold"
                                        >
                                          <Printer className="w-3.5 h-3.5 text-cyan-400" /> Cupom
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ADD REGISTER CLIENT FORM (4 columns) */}
          <div className="col-span-12 lg:col-span-4 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 text-left">
            <h3 className="font-display font-bold text-white text-base border-b border-gray-850 pb-3 mb-5">
              NOVO CLIENTE
            </h3>

            <form onSubmit={handleCreateClientSubmit} className="flex flex-col gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">NOME EX COMPLETO *</label>
                <input 
                  type="text" 
                  placeholder="Nome do cliente"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                  value={cliName}
                  onChange={(e) => setCliName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">WHATSAPP / CELULAR *</label>
                <input 
                  type="text" 
                  placeholder="(11) 99122-3344"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                  value={cliPhone}
                  onChange={(e) => setCliPhone(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">EMAIL CORRESPONDÊNCIA</label>
                <input 
                  type="email" 
                  placeholder="cliente@gmail.com"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                  value={cliEmail}
                  onChange={(e) => setCliEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">CPF OU CNPJ DO CLIENTE</label>
                <input 
                  type="text" 
                  placeholder="321.456.987-11"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                  value={cliCpfCnpj}
                  onChange={(e) => setCliCpfCnpj(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 flex items-center gap-1">
                  CEP DO CLIENTE {isFetchingCliCep && <span className="text-red-500 text-[8px] animate-pulse font-mono">(Buscando...)</span>}
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ex: 01001-000"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white w-full"
                    value={cliCep}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCliCep(val);
                      if (val.replace(/\D/g, "").length === 8) {
                        handleFetchClientCep(val);
                      }
                    }}
                  />
                  {cliCepError && (
                    <span className="text-[9px] text-red-500 block absolute left-1 -bottom-4 font-sans">{cliCepError}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">ENDEREÇO / LOGRADOURO</label>
                <input 
                  type="text" 
                  placeholder="Rua, número - Bairro - Cidade/UF"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                  value={cliAddress}
                  onChange={(e) => setCliAddress(e.target.value)}
                />
              </div>

              {/* Toggle alert options */}
              <div className="bg-black/30 p-3 rounded-lg border border-gray-900 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-300">Alerta Troca de Óleo por WhatsApp</span>
                  <input 
                    type="checkbox" 
                    checked={cliOilAlert}
                    onChange={(e) => setCliOilAlert(e.target.checked)}
                    className="w-4 h-4 checked:bg-red-500 rounded border-gray-800 bg-[#080c16]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-300">SMS / WhatsApp Revisões Periódicas</span>
                  <input 
                    type="checkbox" 
                    checked={cliReviewAlert}
                    onChange={(e) => setCliReviewAlert(e.target.checked)}
                    className="w-4 h-4 checked:bg-red-500 rounded border-gray-800 bg-[#080c16]"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 py-3 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl text-white font-bold text-xs font-sans shadow-md shadow-red-950/40 cursor-pointer"
              >
                💾 REGISTRAR FICHA CLIENTE
              </button>
            </form>
          </div>

        </div>
      )}

      {activeTab === 'veiculos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          
          {/* VEHICLES DIRECT LIST */}
          <div className="col-span-12 lg:col-span-8 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-gray-850 pb-4">
              <span className="font-display font-bold text-sm text-white">FROTA DE VEÍCULOS MECÂNICA</span>
              
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Pesquise por placa do carro..."
                  value={vehicleQuery}
                  onChange={(e) => setVehicleQuery(e.target.value)}
                  className="w-full bg-[#080c16] border border-gray-800 rounded-lg py-1 px-3 pl-8 text-xs text-white uppercase font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {veiculos.filter(veh => 
                veh.plate.toLowerCase().includes(vehicleQuery.toLowerCase()) ||
                veh.model.toLowerCase().includes(vehicleQuery.toLowerCase()) ||
                veh.brand.toLowerCase().includes(vehicleQuery.toLowerCase())
              ).map((veh) => {
                const owner = clientes.find(c => c.id === veh.clienteId);
                const activeOS = ordensServico.filter(os => os.plate === veh.plate);
                return (
                  <div key={veh.id} className="p-4 rounded-xl border border-gray-900 bg-gray-950/30 flex flex-col justify-between hover:border-red-500/20 transition-all text-xs">
                    <div>
                      <div className="flex justify-between items-start mb-2 border-b border-gray-900 pb-2">
                        <span className="font-bold text-xs sm:text-sm text-white uppercase">{veh.brand} {veh.model}</span>
                        <span className="text-[10px] font-mono font-black bg-cyan-950/30 text-cyan-400 border border-cyan-900/30 px-2 py-0.5 rounded">
                          {veh.plate}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 font-mono text-[10px] text-gray-400 mb-3">
                        <span>Motor: <strong className="text-gray-200">{veh.engine}</strong></span>
                        <span>Ano Montagem: <strong className="text-gray-200">{veh.year}</strong></span>
                        <span>Última Quilometragem: <strong className="text-gray-200">{veh.km.toLocaleString()} KM</strong></span>
                        <span>Nº Chassis: <strong className="text-gray-500">{veh.chassi}</strong></span>
                      </div>

                      {/* Oil analysis summary in vehicle card view */}
                      {(() => {
                        const analise = analyzeVehicleOil(veh, ordensServico);
                        return (
                          <div className="mb-3 pt-2 border-t border-gray-900/60 flex flex-col gap-1.5 text-[10px] font-mono text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider flex items-center gap-1">
                                <Droplet className="w-3.5 h-3.5 text-red-500" /> Lubrificação Recomendada:
                              </span>
                              <span className={`px-2 py-0.2 rounded-full text-[8px] font-bold shrink-0 ${analise.badgeStyle}`}>
                                {analise.status === 'critical' ? '🚨 VENCIDO' : analise.status === 'warning' ? '⚠️ ALERTA' : analise.status === 'ok' ? '✅ OK' : '⬜ N/A'}
                              </span>
                            </div>
                            <div className="bg-black/40 p-2 rounded border border-gray-900 flex flex-col gap-1">
                              <span className="text-white font-extrabold text-[10px]">{analise.oilType}</span>
                              <span className="text-[9px] text-gray-400 leading-tight block">{analise.message}</span>
                            </div>
                          </div>
                        );
                      })()}

                    </div>

                    <div className="border-t border-gray-900 pt-2 flex flex-col gap-2.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-red-400">Dono: {owner?.name || "Desconhecido"}</span>
                        <span className="text-gray-600 bg-black/40 px-1.5 py-0.5 rounded text-[8px]">{activeOS.length} OS registradas</span>
                      </div>
                      
                      <div className="flex items-center gap-2 justify-end pt-1 bg-black/10 rounded">
                        <button
                          type="button"
                          onClick={() => startEditVehicle(veh)}
                          className="text-[10px] font-mono font-bold text-slate-350 hover:text-white flex items-center gap-1 bg-slate-900 hover:bg-[#1a2b4d] px-2.5 py-1 rounded border border-gray-800/80 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-cyan-400" /> EDITAR
                        </button>
                        <button
                          type="button"
                          onClick={() => setVehicleToDelete(veh)}
                          className="text-[10px] font-mono font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-950/20 hover:bg-red-950/50 px-2.5 py-1 rounded border border-red-900/30 hover:border-red-900/50 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" /> EXCLUIR
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REGISTER VEHICLE FORM (4 columns) */}
          <div className="col-span-12 lg:col-span-4 bg-[#0c1223] rounded-2xl border border-gray-800 p-6">
            <h3 className="font-display font-bold text-white text-base border-b border-gray-850 pb-3 mb-5">
              CADASTRAR CARRO / VEÍCULO
            </h3>

            <form onSubmit={handleCreateVehicleSubmit} className="flex flex-col gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">DONO / CLIENTE DETENTOR *</label>
                <select 
                  value={vehClient}
                  onChange={(e) => setVehClient(e.target.value)}
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                  required
                >
                  <option value="">-- Vincular Cliente --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400">PLACA *</label>
                  <input 
                    type="text" 
                    placeholder="GOLF-2018"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white uppercase"
                    value={vehPlate}
                    onChange={(e) => setVehPlate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400">MARCA *</label>
                  <input 
                    type="text" 
                    placeholder="Volkswagen"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                    value={vehBrand}
                    onChange={(e) => {
                      setVehBrand(e.target.value);
                      const matched = AUTO_SUGGESTIONS.find(s => s.name.toLowerCase() === e.target.value.toLowerCase());
                      if (matched) {
                        setCrmModelsList(matched.models);
                      }
                    }}
                    required
                  />
                </div>
              </div>

              {/* CRM Brand selection suggestions */}
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pb-1.5 pt-0.5 border-b border-gray-850/20">
                {AUTO_SUGGESTIONS.map(sug => (
                  <button
                    key={sug.name}
                    type="button"
                    onClick={() => {
                      setVehBrand(sug.name);
                      setCrmModelsList(sug.models);
                      setVehModel('');
                    }}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono transition-colors border cursor-pointer flex items-center gap-1 ${
                      vehBrand === sug.name
                        ? "bg-red-950/40 border-red-500/80 text-red-400 font-bold"
                        : "bg-slate-950/40 border-gray-900 text-gray-400 hover:text-white hover:border-gray-800"
                    }`}
                  >
                    <span>{sug.emoji}</span> {sug.name}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">MODELO DO CARRO *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Polo TSI Comfortline"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                  value={vehModel}
                  onChange={(e) => setVehModel(e.target.value)}
                  required
                />
              </div>

              {/* CRM Model selection suggestions */}
              {crmModelsList.length > 0 && (
                <div className="flex flex-col gap-1 pb-1">
                  <span className="text-[8.5px] font-mono text-gray-500 uppercase">Sugestões de Modelos:</span>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {crmModelsList.map(md => (
                      <button
                        key={md}
                        type="button"
                        onClick={() => setVehModel(md)}
                        className={`px-2 py-0.5 rounded text-[9px] font-medium transition-colors border cursor-pointer ${
                          vehModel === md
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

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400">MOTORIZAÇÃO</label>
                  <input 
                    type="text" 
                    placeholder="1.4 TSI Flex"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                    value={vehEngine}
                    onChange={(e) => setVehEngine(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400">ANO FABRICAÇÃO</label>
                  <input 
                    type="text" 
                    placeholder="2018"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                    value={vehYear}
                    onChange={(e) => setVehYear(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400">KM DE ENTRADA</label>
                  <input 
                    type="number" 
                    placeholder="68500"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                    value={vehKm}
                    onChange={(e) => setVehKm(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400">NÚMERO CHASSI</label>
                  <input 
                    type="text" 
                    placeholder="9BWAB..."
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                    value={vehChassi}
                    onChange={(e) => setVehChassi(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 py-3 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl text-white font-bold text-xs font-sans shadow-md shadow-red-950/40 cursor-pointer"
              >
                💾 REGISTRAR VEÍCULO NA FROTA
              </button>
            </form>
          </div>

        </div>
      )}

      {activeTab === 'fidelidade' && (
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6 text-left">
          <div>
            <h3 className="font-display font-extrabold text-white text-base">Fidelidade Cashback & Pontuação de Balcão</h3>
            <p className="text-[10px] text-gray-400 font-mono">Regras automáticas de recompensa AutoTech. Cada 1 Real gasto equivale a 0.2 pontos virtuais. Resgate automático em abatimentos de faturas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loyaltyLedger.map(card => (
              <div key={card.id} className="p-4 rounded-xl border border-yellow-900/30 bg-gradient-to-br from-yellow-950/10 to-transparent flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute right-2.5 top-2.5">
                  <Award className="w-8 h-8 text-yellow-500/10" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-yellow-500 font-bold block tracking-widest leading-none">AUTO-RECOMPENSAS</span>
                  <span className="font-bold text-white text-sm sm:text-base block mt-2.5">{card.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-gray-900 pt-3 text-[10px] font-mono">
                  <div>
                    <span className="text-gray-500 block">Total Gasto</span>
                    <strong className="text-white">R$ {card.totalSpend.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Pontos</span>
                    <strong className="text-yellow-500 font-extrabold">{card.points} pts</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Saldo Cashback</span>
                    <strong className="text-cyan-400 font-bold">R$ {card.cashback.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'campanhas' && (
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6 w-full text-left font-mono">
          <div>
            <h3 className="font-display font-extrabold text-white text-base">Criador de Campanhas de Disparos em Lote WhatsApp</h3>
            <p className="text-[10px] text-gray-400 font-mono">Realize disparos em massa para reter frotas ou avisar motoristas sobre troca de lubrificantes periódicos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Campaign Parameters inputs (4 columns) */}
            <div className="md:col-span-1 border border-gray-900 bg-gray-950/20 p-4 rounded-xl flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400">OBJETIVO DA NOTIFICAÇÃO</label>
                <select 
                  value={selectedCampaignType}
                  onChange={(e) => setSelectedCampaignType(e.target.value)}
                  className="bg-[#080c16] border border-gray-850 rounded py-2 px-1 text-white"
                >
                  <option value="oil">Troca de Óleo Periódica (Lubri Alerta)</option>
                  <option value="review">Vistoria e Alinhamento Periódico</option>
                </select>
              </div>

              {selectedCampaignType === 'review' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400">MENSAGEM DA REVISÃO PERSONALIZADA</label>
                  <textarea 
                    rows={4}
                    value={customMsgText}
                    onChange={(e) => setCustomMsgText(e.target.value)}
                    className="bg-[#080c16] border border-gray-850 rounded p-2 text-white text-[11px]"
                  />
                </div>
              )}

              <button 
                type="button" 
                onClick={handleLaunchCampaign}
                className="w-full py-3 bg-green-600 hover:bg-green-700 font-bold text-white font-sans text-xs rounded-xl"
              >
                🚀 LANÇAR DISPAROS MASSA
              </button>
            </div>

            {/* Campaign Terminal Outputs Log */}
            <div className="md:col-span-2 border border-gray-900 p-4 rounded-xl bg-slate-950 flex flex-col gap-3 min-h-[220px]">
              <span className="text-[10px] text-gray-500 font-bold block border-b border-gray-900 pb-2.5">🖧 OUTPUT LOGS DE INTEGRAÇÃO WHATSAPP WEBHOOK:</span>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto font-mono text-[10px] text-green-500 dark:text-green-500">
                {campaignOutputs.map((out, idx) => (
                  <span key={idx}>{out}</span>
                ))}
                {campaignOutputs.length === 0 && (
                  <span className="text-gray-500 italic">Pronto para processar lista de transmissão...</span>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'lembretes' && (
        <div className="flex flex-col gap-6 w-full text-left font-mono">
          
          {/* TOAST ON SAVING RULES */}
          {showAutoReminderSavedToast && (
            <div className="p-4 bg-green-950/80 border border-green-500 rounded-xl text-xs text-green-400 font-bold mb-2 flex items-center justify-between animate-pulse">
              <span>✓ Regras e templates de manutenção salvos com sucesso! O motor de agendamentos foi atualizado.</span>
              <button type="button" onClick={() => setShowAutoReminderSavedToast(false)} className="text-white hover:text-green-300">✕</button>
            </div>
          )}

          {/* TWO PANEL TOP CONFIG: RULE CONFIG AND PREVIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Rule settings */}
            <div className="lg:col-span-7 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-4">
              <div className="border-b border-gray-850 pb-3 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="font-display font-extrabold text-white text-base">Configurar Regras de Manutenção</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Defina os parâmetros analíticos para os canais de disparos integrados.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] text-gray-400 uppercase font-black">Intervalo de Alerta Preventivo (KM)</label>
                  <input 
                    type="number"
                    value={reminderKmThreshold}
                    onChange={(e) => setReminderKmThreshold(parseInt(e.target.value) || 0)}
                    className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-red-500"
                    placeholder="Ex: 9000"
                  />
                  <span className="text-[9px] text-gray-500 leading-normal">
                    Recomendamos <strong>9000 KM</strong> (o limite crítico padrão do sistema de lubrificação é de 10.000 KM). Isto provê margem segura de aviso.
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 text-left justify-end">
                  <div className="p-3 bg-[#0d1627] border border-gray-900 rounded-xl text-[10px] text-gray-400 leading-normal">
                    💡 <strong>Tags Dinâmicas Suportadas:</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      <li><code>{`{nome_cliente}`}</code> - Nome completo do cliente</li>
                      <li><code>{`{modelo_veiculo}`}</code> - Modelo do carro</li>
                      <li><code>{`{placa_veiculo}`}</code> - Placa do veículo</li>
                      <li><code>{`{km_rodados}`}</code> - KM rodados desde a última troca</li>
                      <li><code>{`{ultima_troca_km}`}</code> - KM da última troca registrada</li>
                      <li><code>{`{km_atual}`}</code> - KM atual registrado no veículo</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 flex-1 text-left">
                <label className="text-[10px] text-gray-400 uppercase font-black">Corpo da Mensagem de Notificação (Template WhatsApp)</label>
                <textarea 
                  rows={4}
                  value={reminderTemplate}
                  onChange={(e) => setReminderTemplate(e.target.value)}
                  className="bg-[#080c16] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 font-sans leading-relaxed w-full"
                  placeholder="Escreva a mensagem usando as tags necessárias..."
                />
              </div>

              <div className="flex justify-end mt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setShowAutoReminderSavedToast(true);
                    setTimeout(() => setShowAutoReminderSavedToast(false), 5000);
                  }}
                  className="px-6 py-2.5 bg-red-650 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl font-sans transition-colors"
                >
                  Gravar Configurações & Template
                </button>
              </div>
            </div>

            {/* Smart Preview */}
            <div className="lg:col-span-5 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-4">
              <div className="border-b border-gray-850 pb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-500" />
                <div>
                  <h3 className="font-display font-extrabold text-white text-base">Visualização de Amostra (WhatsApp)</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Assim será exibida a mensagem final enviada ao celular do cliente.</p>
                </div>
              </div>

              {/* Chat frame */}
              <div className="bg-[#060c15] rounded-2xl border border-gray-900 p-4 flex flex-col gap-4 relative min-h-[220px]">
                {/* Header chat style */}
                <div className="flex items-center gap-2.5 border-b border-gray-900 pb-2.5 text-left">
                  <div className="w-8 h-8 rounded-full bg-green-900 text-green-400 font-bold flex items-center justify-center text-[11px]">
                    AT
                  </div>
                  <div>
                    <span className="text-white text-xs font-bold block leading-none">AutoTech Suporte Preventivo</span>
                    <span className="text-[9px] text-green-500 font-bold block mt-1">● Online</span>
                  </div>
                </div>

                {/* Bubble message */}
                <div className="max-w-[85%] self-start bg-emerald-950/40 border border-emerald-900/40 p-3 rounded-2xl rounded-tl-none text-[11px] text-gray-305 text-gray-300 text-left font-sans shadow-md">
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {(() => {
                      const sampleClient = "Carlos Eduardo Souza";
                      const sampleVehicle = "Renault Sandero 1.6 Stepway";
                      const samplePlate = "REK-3H20";
                      const lastChange = 61000;
                      const current = 70250;
                      const delta = current - lastChange;
                      
                      return reminderTemplate
                        .replace('{nome_cliente}', `*${sampleClient}*`)
                        .replace('{modelo_veiculo}', `*${sampleVehicle}*`)
                        .replace('{placa_veiculo}', `*${samplePlate}*`)
                        .replace('{km_rodados}', `*${delta.toLocaleString()}*`)
                        .replace('{km_atual}', `*${current.toLocaleString()}*`)
                        .replace('{ultima_troca_km}', `*${lastChange.toLocaleString()}*`);
                    })()}
                  </div>
                  <span className="text-[8px] text-emerald-500/80 font-mono text-right block mt-1.5 font-bold">12:35 PM • WhatsApp Cloud API</span>
                </div>
              </div>
            </div>

          </div>

          {/* TWO PANEL BOTTOM CORRESPONDENT: REALTIME RECOMMENDATION DETECTOR AND SCHEDULE REMINDERS MANUAL SCHEDULER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Automatic detector from DB */}
            <div className="col-span-12 lg:col-span-7 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-4">
              <div className="border-b border-[#1c2236] pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="font-display font-extrabold text-white text-base">Fila de Alertas de Óleo (KM Excedido)</h3>
                    <p className="text-[10px] text-gray-400 font-mono">Clientes e veículos cujas quilometragens rodadas superaram o limite estipulado.</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 text-[10px] text-amber-400 border border-amber-900/30 rounded bg-amber-950/20 font-bold uppercase animate-pulse">
                  Análise Real-Time
                </div>
              </div>

              {/* Table / List representation */}
              <div className="flex flex-col gap-3.5 max-h-[480px] overflow-y-auto pr-1">
                {(() => {
                  const compileTemplateMessage = (templateText: string, clientName: string, vehicleModel: string, plateStr: string, kmRodadosVal: number | string, currentKmVal: string | number, lastChangeKmVal: string | number) => {
                    return templateText
                      .replace('{nome_cliente}', clientName)
                      .replace('{modelo_veiculo}', vehicleModel)
                      .replace('{placa_veiculo}', plateStr)
                      .replace('{km_rodados}', kmRodadosVal.toLocaleString())
                      .replace('{km_atual}', currentKmVal.toLocaleString())
                      .replace('{ultima_troca_km}', lastChangeKmVal.toLocaleString());
                  };

                  // Get vehicles whose delta exceeds threshold
                  const alertVehicles = (veiculos || []).map(vh => {
                    const analise = analyzeVehicleOil(vh, ordensServico);
                    const client = clientes.find(c => c.id === vh.clienteId);
                    
                    return {
                      vehicle: vh,
                      analise,
                      client,
                      kmDelta: analise.kmRodados !== null ? analise.kmRodados : (vh.km || 0)
                    };
                  }).filter(item => {
                    return item.kmDelta >= reminderKmThreshold || item.analise.status === 'critical' || item.analise.status === 'unknown';
                  });

                  if (alertVehicles.length === 0) {
                    return (
                      <div className="text-center py-12 bg-black/10 rounded-xl border border-dashed border-gray-850">
                        <span className="text-gray-500 font-bold block text-xs">Nenhum veículo em atraso crítico de lubrificação!</span>
                        <p className="text-[10px] text-gray-400 mt-1">Todos os carros com passagens registradas encontram-se abaixo de {reminderKmThreshold} KM rodados.</p>
                      </div>
                    );
                  }

                  return alertVehicles.map(item => {
                    const clientName = item.client ? item.client.name : 'Cliente Avulso';
                    const isAlreadyScheduled = scheduledReminders.some(r => r.vehicleId === item.vehicle.id && r.status === 'Agendado');
                    const phone = item.client ? item.client.phone : '';
                    
                    return (
                      <div key={item.vehicle.id} className="p-4 bg-black/15 hover:bg-[#070c16] rounded-xl border border-gray-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                        <div className="flex flex-col gap-1 text-xs text-left">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-white text-[11px] uppercase tracking-wide">
                              {item.vehicle.brand} {item.vehicle.model}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan-950/30 text-cyan-400 border border-cyan-900/35 leading-tight">
                              {item.vehicle.plate}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold shrink-0 ${item.analise.badgeStyle}`}>
                              {item.analise.status === 'critical' ? '🔴 CRÍTICO' : item.analise.status === 'unknown' ? '🚨 SEM HISTÓRICO' : '🟡 ATENÇÃO'}
                            </span>
                          </div>
                          
                          <div className="text-[10px] text-gray-400 leading-normal font-sans pt-0.5">
                            Cliente: <strong className="text-gray-300 font-mono">{clientName}</strong> • {phone || 'Sem telefone'}
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1 text-[10px] tracking-tight bg-slate-950/35 p-2 rounded border border-gray-900/40 font-mono">
                            <span>KM Atual: <strong className="text-white font-mono">{item.vehicle.km?.toLocaleString()} KM</strong></span>
                            <span>Última Troca: <strong className="text-white font-mono">{item.analise.lastChangeKm !== null ? `${item.analise.lastChangeKm?.toLocaleString()} KM` : 'Sem histórico'}</strong></span>
                            <span className="col-span-2 text-cyan-400 font-sans mt-0.5">
                              Rodou: <strong className="text-white font-mono">{item.kmDelta?.toLocaleString()} KM</strong> desde o histórico prévio.
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-stretch sm:items-end gap-1.5 min-w-[130px]">
                          {isAlreadyScheduled ? (
                            <div className="px-3 py-1.5 text-center bg-green-950/20 text-green-500 border border-green-900/40 text-[10px] font-extrabold uppercase rounded-lg font-mono">
                              ✓ Agendado
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReminderVehicleId(item.vehicle.id);
                                const nextWeek = new Date();
                                nextWeek.setDate(nextWeek.getDate() + 2);
                                setNewReminderScheduledDate(nextWeek.toISOString().split('T')[0]);
                                setNewReminderScheduledTime('10:00');
                              }}
                              className="px-3 py-1.5 text-center text-red-500 hover:text-white bg-red-950/20 hover:bg-red-900 border border-red-900/40 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer"
                            >
                              🕒 Agendar Alerta
                            </button>
                          )}

                          <button 
                            type="button"
                            onClick={() => {
                              const plainPhone = phone.replace(/\D/g, '');
                              const msg = compileTemplateMessage(
                                reminderTemplate, 
                                clientName, 
                                `${item.vehicle.brand} ${item.vehicle.model}`,
                                item.vehicle.plate,
                                item.kmDelta,
                                item.vehicle.km,
                                item.analise.lastChangeKm !== null ? item.analise.lastChangeKm : 'Sem anterior'
                              );
                              const whatsappLink = `https://api.whatsapp.com/send?phone=55${plainPhone}&text=${encodeURIComponent(msg)}`;
                              window.open(whatsappLink, '_blank');
                              
                              // Track in sent list immediately
                              const newRem = {
                                id: `rem_auto_${Date.now()}`,
                                clientId: item.vehicle.clienteId,
                                vehicleId: item.vehicle.id,
                                clientName,
                                vehicleName: `${item.vehicle.brand} ${item.vehicle.model}`,
                                plate: item.vehicle.plate,
                                lastOilChangeKm: item.analise.lastChangeKm !== null ? item.analise.lastChangeKm : 0,
                                currentKm: item.vehicle.km,
                                kmDelta: item.kmDelta,
                                status: 'Enviado' as const,
                                scheduledDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
                                sentDate: new Date().toISOString().replace('T', ' ').substring(0, 16)
                              };
                              setScheduledReminders([newRem, ...scheduledReminders]);
                            }}
                            className="px-3 py-1.5 text-center bg-green-600 hover:bg-green-750 text-white rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer shadow font-mono"
                          >
                            <span>WhatsApp Agora</span>
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Quick Manual Reminder scheduler */}
            <div className="col-span-12 lg:col-span-5 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-4">
              <div className="border-b border-gray-850 pb-3 text-left">
                <span className="font-sans font-extrabold text-white text-sm uppercase flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-500" /> Agendar Alerta de Manutenção Manual
                </span>
                <p className="text-[10px] text-gray-500 leading-normal mt-0.5 font-sans">
                  Use este formulário para agendar um contato futuro. O CRM criará a tarefa na fila para disparo programado.
                </p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!selectedReminderVehicleId) return;
                  
                  const targetVehObj = veiculos.find(v => v.id === selectedReminderVehicleId);
                  if (!targetVehObj) return;

                  const clientObj = clientes.find(c => c.id === targetVehObj.clienteId);
                  const analise = analyzeVehicleOil(targetVehObj, ordensServico);
                  const clientName = clientObj ? clientObj.name : 'Cliente Avulso';

                  const newRem = {
                    id: `rem_man_${Date.now()}`,
                    clientId: targetVehObj.clienteId,
                    vehicleId: targetVehObj.id,
                    clientName,
                    vehicleName: `${targetVehObj.brand} ${targetVehObj.model}`,
                    plate: targetVehObj.plate,
                    lastOilChangeKm: analise.lastChangeKm || 0,
                    currentKm: targetVehObj.km,
                    kmDelta: analise.kmRodados !== null ? analise.kmRodados : targetVehObj.km,
                    status: 'Agendado' as const,
                    scheduledDate: `${newReminderScheduledDate} ${newReminderScheduledTime}`
                  };

                  setScheduledReminders([newRem, ...scheduledReminders]);
                  setSelectedReminderVehicleId('');
                  
                  setShowAutoReminderSavedToast(true);
                  setTimeout(() => setShowAutoReminderSavedToast(false), 3000);
                }}
                className="flex flex-col gap-4 text-xs font-mono"
              >
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase">Selecione o Veículo</label>
                  <select
                    value={selectedReminderVehicleId}
                    onChange={(e) => setSelectedReminderVehicleId(e.target.value)}
                    className="bg-[#080c16] border border-gray-850 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-red-500 font-mono w-full"
                    required
                  >
                    <option value="">-- Escolha um Veículo em Alerta --</option>
                    {(veiculos || []).map(v => {
                      const client = clientes.find(c => c.id === v.clienteId);
                      const text = `${v.brand} ${v.model} (${v.plate}) • ${client ? client.name : 'Cliente avulso'}`;
                      return (
                        <option key={v.id} value={v.id}>{text}</option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">Data Agendada</label>
                    <input 
                      type="date"
                      value={newReminderScheduledDate}
                      onChange={(e) => setNewReminderScheduledDate(e.target.value)}
                      className="bg-[#080c16] border border-gray-850 rounded-xl py-2.5 px-3 text-white font-mono focus:outline-none w-full"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">Hora Programada</label>
                    <input 
                      type="time"
                      value={newReminderScheduledTime}
                      onChange={(e) => setNewReminderScheduledTime(e.target.value)}
                      className="bg-[#080c16] border border-gray-850 rounded-xl py-2.5 px-3 text-white font-mono focus:outline-none w-full"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedReminderVehicleId}
                  className={`w-full py-3 rounded-xl font-bold font-sans text-xs uppercase shadow transition-all ${
                    selectedReminderVehicleId 
                      ? 'bg-red-650 bg-red-600 hover:bg-red-700 text-white cursor-pointer' 
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-850'
                  }`}
                >
                  Confirmar Agendamento CRM
                </button>
              </form>
            </div>

          </div>

          {/* HISTORIC TAB AND ACTION FIELD LOGS */}
          <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-5 text-left">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-850 pb-4">
              <div>
                <h3 className="font-display font-extrabold text-white text-base">Fila de Agendamentos e Histórico de Envio</h3>
                <p className="text-[10px] text-gray-400 font-mono">Gerencie alertas agendados para disparos futuros ou revise envios concluídos ou cancelados.</p>
              </div>

              {/* Filtering block in toolbar list */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 uppercase font-bold shrink-0">Filtrar Status:</span>
                <div className="flex bg-[#080d19] p-0.5 rounded-lg border border-gray-850 text-[10px] [&>button]:px-2.5 [&>button]:py-1">
                  {(['Todos', 'Agendado', 'Enviado', 'Cancelado'] as const).map(st => (
                    <button 
                      key={st}
                      type="button"
                      onClick={() => setFilterReminderStatus(st)}
                      className={`font-mono font-bold rounded ${
                        filterReminderStatus === st 
                          ? 'bg-red-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Searching toolbar filter */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Filtrar por nome de cliente, modelo de veículo ou placa..."
                value={reminderSearchQuery}
                onChange={(e) => setReminderSearchQuery(e.target.value)}
                className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2 px-4 pl-10 text-xs text-white focus:outline-none focus:border-red-500 font-sans"
              />
            </div>

            {/* List representation */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#080d19] border-b border-gray-850 text-gray-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Cliente / Contato</th>
                    <th className="p-4">Veículo / Placa</th>
                    <th className="p-4 text-center">Início Período</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4">Programado Para</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850">
                  {(() => {
                    const compileTemplateMessage = (templateText: string, clientName: string, vehicleModel: string, plateStr: string, kmRodadosVal: number | string, currentKmVal: string | number, lastChangeKmVal: string | number) => {
                      return templateText
                        .replace('{nome_cliente}', clientName)
                        .replace('{modelo_veiculo}', vehicleModel)
                        .replace('{placa_veiculo}', plateStr)
                        .replace('{km_rodados}', kmRodadosVal.toLocaleString())
                        .replace('{km_atual}', currentKmVal.toLocaleString())
                        .replace('{ultima_troca_km}', lastChangeKmVal.toLocaleString());
                    };

                    return scheduledReminders
                      .filter(rem => {
                        const matchSt = filterReminderStatus === 'Todos' || rem.status === filterReminderStatus;
                        const qLower = reminderSearchQuery.toLowerCase();
                        const matchQu = !reminderSearchQuery || 
                                        rem.clientName.toLowerCase().includes(qLower) || 
                                        rem.vehicleName.toLowerCase().includes(qLower) || 
                                        rem.plate.toLowerCase().includes(qLower);
                        return matchSt && matchQu;
                      })
                      .map(rem => {
                        const clientInfo = clientes.find(c => c.id === rem.clientId);
                        const isAgendado = rem.status === 'Agendado';
                        
                        return (
                          <tr key={rem.id} className="hover:bg-gray-950/25">
                            <td className="p-4">
                              <div className="flex flex-col text-left">
                                <span className="font-sans font-semibold text-white">{rem.clientName}</span>
                                <span className="text-[10px] text-gray-400">{clientInfo?.phone || 'Sem celular'}</span>
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="flex flex-col text-left">
                                <span className="text-gray-100 font-bold">{rem.vehicleName}</span>
                                <span className="text-[10px] text-rose-500 font-black">{rem.plate}</span>
                              </div>
                            </td>

                            <td className="p-4 text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-gray-350">Delta: +{rem.kmDelta?.toLocaleString()} KM</span>
                                <span className="text-[9px] text-gray-500 font-sans">desde os {rem.lastOilChangeKm?.toLocaleString()} KM</span>
                              </div>
                            </td>

                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                rem.status === 'Agendado' 
                                  ? 'bg-amber-900/40 text-amber-500 border border-amber-900/60' 
                                  : rem.status === 'Enviado' 
                                  ? 'bg-green-900/40 text-green-400 border border-green-900/60' 
                                  : 'bg-gray-800 text-gray-500 border border-gray-850'
                              }`}>
                                {rem.status}
                              </span>
                            </td>

                            <td className="p-4 text-gray-305 text-gray-400">
                              <div className="flex flex-col text-left">
                                <span>📅 {rem.scheduledDate}</span>
                                {rem.sentDate && (
                                  <span className="text-[10px] text-green-500 font-bold pt-0.5">Enviado em: {rem.sentDate}</span>
                                )}
                              </div>
                            </td>

                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isAgendado && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const phoneForSend = clientInfo?.phone || '';
                                        const plainPhone = phoneForSend.replace(/\D/g, '');
                                        const msg = compileTemplateMessage(
                                          reminderTemplate, 
                                          rem.clientName, 
                                          rem.vehicleName, 
                                          rem.plate, 
                                          rem.kmDelta, 
                                          rem.currentKm, 
                                          rem.lastOilChangeKm
                                        );
                                        const link = `https://api.whatsapp.com/send?phone=55${plainPhone}&text=${encodeURIComponent(msg)}`;
                                        window.open(link, '_blank');

                                        // Mark as Sent
                                        setScheduledReminders(scheduledReminders.map(r => r.id === rem.id ? {
                                          ...r,
                                          status: 'Enviado',
                                          sentDate: new Date().toISOString().replace('T', ' ').substring(0, 16)
                                        } : r));
                                      }}
                                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded animate-pulse font-mono text-[10px] select-none cursor-pointer"
                                      title="Disparar mensagem no WhatsApp agora"
                                    >
                                      Disparar WhatsApp
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setScheduledReminders(scheduledReminders.map(r => r.id === rem.id ? {
                                          ...r,
                                          status: 'Cancelado'
                                        } : r));
                                      }}
                                      className="p-1 text-gray-400 hover:text-red-500 transition-colors font-bold text-[10px] hover:underline"
                                      title="Cancelar agendamento"
                                    >
                                      ✕ Cancelar
                                    </button>
                                  </>
                                )}
                                
                                {rem.status === 'Cancelado' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setScheduledReminders(scheduledReminders.map(r => r.id === rem.id ? {
                                        ...r,
                                        status: 'Agendado'
                                      } : r));
                                    }}
                                    className="text-[10px] text-cyan-400 hover:underline"
                                    title="Reativar agendamento"
                                  >
                                    Reativar
                                  </button>
                                )}

                                {rem.status === 'Enviado' && (
                                  <span className="text-[10px] text-gray-500 italic block py-1 font-sans">Enviado</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      });
                  })()}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* 📝 EDITAR CLIENTE MODAL */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 max-w-lg w-full text-left flex flex-col gap-5 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-850 pb-3">
              <h3 className="font-display font-extrabold text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" /> EDITAR REGISTRO DE CLIENTE
              </h3>
              <button 
                type="button"
                onClick={() => setEditingClient(null)}
                className="text-gray-400 hover:text-white transition-colors text-sm font-sans cursor-pointer focus:outline-none"
              >
                ✕ Fechar
              </button>
            </div>

            <form onSubmit={handleEditClientSubmit} className="flex flex-col gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">NOME INTEGRAL *</label>
                <input 
                  type="text" 
                  placeholder="Nome do cliente"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                  value={editCliName}
                  onChange={(e) => setEditCliName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400">WHATSAPP / CELULAR *</label>
                  <input 
                    type="text" 
                    placeholder="(11) 99122-3344"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                    value={editCliPhone}
                    onChange={(e) => setEditCliPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400">CPF OU CNPJ</label>
                  <input 
                    type="text" 
                    placeholder="321.456.987-11"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                    value={editCliCpfCnpj}
                    onChange={(e) => setEditCliCpfCnpj(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">EMAIL CORRESPONDÊNCIA</label>
                <input 
                  type="email" 
                  placeholder="cliente@gmail.com"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                  value={editCliEmail}
                  onChange={(e) => setEditCliEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 flex items-center gap-1">
                  CEP DO CLIENTE {isFetchingEditCliCep && <span className="text-red-500 text-[8px] animate-pulse font-mono">(Buscando...)</span>}
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ex: 01001-000"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white w-full"
                    value={editCliCep}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditCliCep(val);
                      if (val.replace(/\D/g, "").length === 8) {
                        handleFetchEditClientCep(val);
                      }
                    }}
                  />
                  {editCliCepError && (
                    <span className="text-[9px] text-red-500 block absolute left-1 -bottom-4 font-sans">{editCliCepError}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">ENDEREÇO / LOGRADOURO</label>
                <input 
                  type="text" 
                  placeholder="Rua, número - Bairro - Cidade/UF"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white"
                  value={editCliAddress}
                  onChange={(e) => setEditCliAddress(e.target.value)}
                />
              </div>

              {/* Toggle alert options */}
              <div className="bg-black/30 p-3 rounded-lg border border-gray-900 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-350">Alerta Troca de Óleo por WhatsApp</span>
                  <input 
                    type="checkbox" 
                    checked={editCliOilAlert}
                    onChange={(e) => setEditCliOilAlert(e.target.checked)}
                    className="w-4 h-4 checked:bg-red-500 rounded border-gray-800 bg-[#080c16] cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-350">SMS / WhatsApp Revisões Periódicas</span>
                  <input 
                    type="checkbox" 
                    checked={editCliReviewAlert}
                    onChange={(e) => setEditCliReviewAlert(e.target.checked)}
                    className="w-4 h-4 checked:bg-red-500 rounded border-gray-800 bg-[#080c16] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button 
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-gray-800 cursor-pointer"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit"
                  className="w-1/2 py-2.5 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl text-white font-bold text-xs shadow-md shadow-red-950/45 cursor-pointer"
                >
                  SALVAR ALTERAÇÕES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚗 EDITAR VEÍCULO MODAL */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 max-w-xl w-full text-left flex flex-col gap-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-850 pb-3">
              <h3 className="font-display font-extrabold text-white text-base flex items-center gap-2">
                <Car className="w-5 h-5 text-red-500" /> VEÍCULO OPERACIONAL
              </h3>
              <button 
                type="button"
                onClick={() => setEditingVehicle(null)}
                className="text-gray-400 hover:text-white transition-colors text-sm font-sans cursor-pointer focus:outline-none"
              >
                ✕ Fechar
              </button>
            </div>

            {/* Modal Internal Tabs */}
            <div className="flex bg-[#080d19] p-1 rounded-xl border border-gray-850 [&>button]:px-4 [&>button]:py-2 [&>button]:text-xs [&>button]:font-mono [&>button]:rounded-lg gap-1">
              <button
                type="button"
                onClick={() => setVehicleModalTab('cadastro')}
                className={vehicleModalTab === 'cadastro' ? 'bg-red-650 bg-red-600 text-white font-bold' : 'text-gray-450 text-gray-400 hover:text-white transition-colors'}
              >
                📝 Cadastro & Modificação
              </button>
              <button
                type="button"
                onClick={() => setVehicleModalTab('historico')}
                className={vehicleModalTab === 'historico' ? 'bg-red-650 bg-red-600 text-white font-bold' : 'text-gray-455 text-gray-400 hover:text-white transition-colors'}
              >
                ⏳ Histórico de O.S. ({ (ordensServico || []).filter(os => os.plate?.toUpperCase().trim() === editingVehicle.plate?.toUpperCase().trim()).length })
              </button>
            </div>

            {vehicleModalTab === 'cadastro' ? (
              <form onSubmit={handleEditVehicleSubmit} className="flex flex-col gap-4 text-xs font-mono">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">DONO / CLIENTE DETENTOR *</label>
                  <select 
                    value={editVehClient}
                    onChange={(e) => setEditVehClient(e.target.value)}
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    required
                  >
                    <option value="">-- Vincular Cliente --</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">PLACA *</label>
                    <input 
                      type="text" 
                      placeholder="GOLF-2018"
                      className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white uppercase focus:outline-none focus:border-red-500 transition-colors"
                      value={editVehPlate}
                      onChange={(e) => setEditVehPlate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">MARCA *</label>
                    <input 
                      type="text" 
                      placeholder="Volkswagen"
                      className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                      value={editVehBrand}
                      onChange={(e) => {
                        setEditVehBrand(e.target.value);
                        const matched = AUTO_SUGGESTIONS.find(s => s.name.toLowerCase() === e.target.value.toLowerCase());
                        if (matched) {
                          setEditCrmModelsList(matched.models);
                        }
                      }}
                      required
                    />
                  </div>
                </div>

                {/* CRM Edit Brand selection suggestions */}
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pb-1.5 pt-0.5 border-b border-gray-850/20">
                  {AUTO_SUGGESTIONS.map(sug => (
                    <button
                      key={sug.name}
                      type="button"
                      onClick={() => {
                        setEditVehBrand(sug.name);
                        setEditCrmModelsList(sug.models);
                        setEditVehModel('');
                      }}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono transition-colors border cursor-pointer flex items-center gap-1 ${
                        editVehBrand === sug.name
                          ? "bg-red-950/40 border-red-500/80 text-red-400 font-bold"
                          : "bg-slate-950/40 border-gray-900 text-gray-400 hover:text-white hover:border-gray-800"
                      }`}
                    >
                      <span>{sug.emoji}</span> {sug.name}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">MODELO DO CARRO *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Polo TSI Comfortline"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                    value={editVehModel}
                    onChange={(e) => setEditVehModel(e.target.value)}
                    required
                  />
                </div>

                {/* CRM Edit Model selection suggestions */}
                {editCrmModelsList.length > 0 && (
                  <div className="flex flex-col gap-1 pb-1">
                    <span className="text-[8.5px] font-mono text-gray-500 uppercase">Sugestões de Modelos:</span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {editCrmModelsList.map(md => (
                        <button
                          key={md}
                          type="button"
                          onClick={() => setEditVehModel(md)}
                          className={`px-2 py-0.5 rounded text-[9px] font-medium transition-colors border cursor-pointer ${
                            editVehModel === md
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">MOTORIZAÇÃO</label>
                    <input 
                      type="text" 
                      placeholder="1.4 TSI Flex"
                      className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                      value={editVehEngine}
                      onChange={(e) => setEditVehEngine(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">ANO FABRICAÇÃO</label>
                    <input 
                      type="text" 
                      placeholder="2018"
                      className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                      value={editVehYear}
                      onChange={(e) => setEditVehYear(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">KM ATUAL</label>
                    <input 
                      type="number" 
                      placeholder="68500"
                      className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                      value={editVehKm}
                      onChange={(e) => setEditVehKm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">NÚMERO CHASSI</label>
                    <input 
                      type="text" 
                      placeholder="9BWAB..."
                      className="bg-[#080c16] border border-gray-805 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                      value={editVehChassi}
                      onChange={(e) => setEditVehChassi(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-2 border-t border-gray-850 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingVehicle(null)}
                    className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-gray-800 cursor-pointer text-center"
                  >
                    CANCELAR
                  </button>
                  <button 
                    type="submit"
                    className="w-1/2 py-2.5 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl text-white font-bold text-xs shadow-md shadow-red-950/45 cursor-pointer text-center"
                  >
                    SALVAR ALTERAÇÕES
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-3 font-sans">
                {(() => {
                  const selectPlate = editingVehicle.plate.toUpperCase().trim();
                  const linkedOSList = (ordensServico || []).filter(os => 
                    os.plate?.toUpperCase().trim() === selectPlate
                  );

                  const sortedLinkedOS = [...linkedOSList].sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  );

                  const totalBilling = linkedOSList.reduce((sum, os) => sum + (os.total || 0), 0);

                  if (sortedLinkedOS.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-gray-800 rounded-xl bg-gray-950/20 text-center text-gray-400 gap-2.5">
                        <FileText className="w-8 h-8 text-gray-700" />
                        <span className="font-semibold text-xs text-white">Nenhum registro encontrado</span>
                        <p className="text-[11px] text-gray-500 max-w-[280px] leading-relaxed">
                          Nenhuma Ordem de Serviço foi identificada ou atrelada à placa <strong className="text-gray-300 font-mono">{editingVehicle.plate}</strong> ainda.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-4">
                      {/* Financial & Volume Analytics Bento row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-gray-950/40 border border-gray-900 flex flex-col gap-0.5 text-left">
                          <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">Total de Visitas</span>
                          <span className="text-base font-extrabold text-white font-mono">{linkedOSList.length} O.S.</span>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-950/40 border border-gray-900 flex flex-col gap-0.5 text-left">
                          <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">Investimento Acumulado</span>
                          <span className="text-base font-extrabold text-emerald-450 text-emerald-400 font-mono">
                            {totalBilling.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      </div>

                      {/* OS scrollable sequence container */}
                      <div className="flex flex-col gap-3 max-h-[290px] overflow-y-auto pr-1">
                        {sortedLinkedOS.map(os => {
                          const dateObj = new Date(os.createdAt);
                          const formattedDate = isNaN(dateObj.getTime()) ? os.createdAt : dateObj.toLocaleDateString('pt-BR');
                          
                          return (
                            <div key={os.id} className="p-3 rounded-xl bg-[#080d19]/60 border border-gray-850 hover:border-gray-800 transition-all flex flex-col gap-2">
                              {/* Title / status row */}
                              <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-gray-900/40 text-[11px]">
                                <span className="font-mono font-black text-white">O.S. #{os.id}</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase ${
                                  os.status === 'Aberta' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/35' :
                                  os.status === 'Em análise' ? 'bg-yellow-950/40 text-yellow-500 border border-yellow-900/30' :
                                  os.status === 'Aguardando peça' ? 'bg-orange-950/40 text-orange-400 border border-orange-900/30 animate-pulse' :
                                  os.status === 'Em execução' ? 'bg-sky-950/40 text-sky-400 border border-sky-900/30' :
                                  os.status === 'Finalizada' || os.status === 'Entregue' ? 'bg-purple-950/40 text-purple-400 border border-purple-900/30' :
                                  'bg-slate-900 text-slate-400 border border-slate-800'
                                }`}>
                                  {os.status}
                                </span>
                              </div>

                              {/* Details details */}
                              <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 leading-normal font-sans text-left">
                                <div>
                                  📅 Abertura: <strong className="text-gray-300">{formattedDate}</strong>
                                </div>
                                <div className="text-right">
                                  🚗 KM Indicada: <strong className="text-gray-300">{os.km ? `${os.km.toLocaleString()} KM` : "N/A"}</strong>
                                </div>
                                
                                {os.problem && (
                                  <div className="col-span-2 border-t border-gray-900/40 pt-1.5 mt-0.5">
                                    <span className="text-gray-450 font-semibold block mb-0.5">Sintoma Informado pelo Cliente:</span>
                                    <p className="text-gray-300 text-[10px] leading-tight font-sans bg-[#050912] p-2 rounded border border-gray-900">{os.problem}</p>
                                  </div>
                                )}
                                
                                {os.diagnosis && (
                                  <div className="col-span-2">
                                    <span className="text-gray-450 font-semibold block mb-0.5">Diagnóstico Técnico da Oficina:</span>
                                    <p className="text-gray-350 text-[10px] leading-tight font-sans bg-[#050912]/50 p-2 rounded border border-gray-900/60 ">{os.diagnosis}</p>
                                  </div>
                                )}
                              </div>

                              {/* Services or parts list inside each OS */}
                              {(os.services?.length > 0 || os.parts?.length > 0) && (
                                <div className="flex flex-col gap-1 border-t border-gray-900/30 pt-1.5 font-sans text-[10px] text-gray-500">
                                  {os.services?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 items-center">
                                      <span className="font-semibold text-gray-400 shrink-0">🛠️ Serviços:</span>
                                      <span className="text-gray-350">{os.services.map(s => s.description).join(', ')}</span>
                                    </div>
                                  )}
                                  {os.parts?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 items-center">
                                      <span className="font-semibold text-gray-400 shrink-0">📦 Peças:</span>
                                      <span className="text-gray-350">{os.parts.map(p => p.name).join(', ')}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Footer of the card item */}
                              <div className="flex justify-between items-center border-t border-gray-900/40 pt-1.5 text-[10px] font-mono leading-none">
                                <span className="text-gray-500">Resp: <strong className="text-gray-300">{os.mechanicName || "Mecânico Geral"}</strong></span>
                                <span className="text-emerald-400 font-bold">Total: R$ {(os.total || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Close Button Only */}
                <div className="flex gap-3 mt-2 border-t border-gray-850 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingVehicle(null)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-gray-800 cursor-pointer text-center uppercase font-mono"
                  >
                    FECHAR HISTÓRICO
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ⚠️ EXCLUIR CLIENTE CONFIRMAÇÃO MODAL */}
      {clientToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1223] rounded-2xl border border-red-900/30 p-6 max-w-sm w-full text-left flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center gap-2.5 text-red-500">
              <AlertCircle className="w-6 h-6 animate-pulse" />
              <h3 className="font-display font-extrabold text-white text-sm uppercase">Excluir Cliente</h3>
            </div>
            
            <p className="text-gray-400 text-xs font-mono leading-relaxed">
              Tem certeza que deseja remover permanentemente o cliente <strong className="text-white">{clientToDelete.name}</strong>?
              Isso atualizará o índice offline e removerá seu cadastro físico da base de dados.
            </p>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="w-1/2 py-2 bg-slate-900 text-slate-300 rounded-lg text-xs font-mono border border-gray-800 cursor-pointer font-bold"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteClient}
                className="w-1/2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono cursor-pointer font-bold"
              >
                SIM, REMOVER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ EXCLUIR VEÍCULO CONFIRMAÇÃO MODAL */}
      {vehicleToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1223] rounded-2xl border border-red-900/30 p-6 max-w-sm w-full text-left flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center gap-2.5 text-red-500">
              <AlertCircle className="w-6 h-6 animate-pulse" />
              <h3 className="font-display font-extrabold text-white text-sm uppercase">Excluir Veículo</h3>
            </div>
            
            <p className="text-gray-400 text-xs font-mono leading-relaxed">
              Tem certeza que deseja remover permanentemente o veículo <strong className="text-white">{vehicleToDelete.brand} {vehicleToDelete.model} ({vehicleToDelete.plate})</strong> da frota?
            </p>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setVehicleToDelete(null)}
                className="w-1/2 py-2 bg-slate-900 text-slate-300 rounded-lg text-xs font-mono border border-gray-800 cursor-pointer font-bold"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteVehicle}
                className="w-1/2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-mono cursor-pointer font-bold"
              >
                SIM, REMOVER
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
