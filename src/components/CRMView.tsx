import React, { useState } from 'react';
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
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Cliente, Veiculo, OrdemServico } from '../types';

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
    addVeiculo, 
    ordensServico 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'clientes' | 'veiculos' | 'fidelidade' | 'campanhas'>('clientes');
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [copiedAnalysisId, setCopiedAnalysisId] = useState<string | null>(null);
  
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
            onClick={() => setActiveTab('campanhas')}
            className={activeTab === 'campanhas' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
          >
            Ações WhatsApp
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
                        
                        {/* Notifications alarm checkboxes indicators */}
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-2 text-[8px] font-bold">
                            <span className={`px-1 rounded ${cli.oilChangeAlert ? 'bg-green-950/40 text-green-500 border border-green-900/20' : 'bg-slate-900 text-slate-500'}`}>
                              💬 LUBRI-ALERTA
                            </span>
                            <span className={`px-1 rounded ${cli.reviewAlert ? 'bg-green-950/40 text-green-500 border border-green-900/20' : 'bg-slate-900 text-slate-500'}`}>
                              🔔 REVISÃO-ALERTA
                            </span>
                          </div>
                          <span className="text-[10px] text-red-400 hover:text-red-300 select-none hidden sm:inline ml-1 font-semibold">
                            {isExpanded ? '▲ Recolher' : '▼ Analisar Óleo'}
                          </span>
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

                    <div className="border-t border-gray-900 pt-2 flex justify-between items-center text-[10px] font-mono">
                      <span className="text-red-400">Dono: {owner?.name || "Desconhecido"}</span>
                      <span className="text-gray-600 bg-black/40 px-1.5 py-0.5 rounded text-[8px]">{activeOS.length} OS registradas</span>
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
                    onChange={(e) => setVehBrand(e.target.value)}
                    required
                  />
                </div>
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

    </div>
  );
};
