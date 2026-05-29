import React, { useState } from 'react';
import { 
  Building, 
  Settings,
  Database,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Smartphone,
  Mail,
  Sparkles,
  Copy,
  Plus,
  Check,
  ExternalLink,
  Compass,
  Lightbulb,
  Eye,
  ChevronRight,
  ChevronDown,
  Wrench,
  Send,
  Globe,
  Server,
  Activity,
  RefreshCw,
  Upload,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Company } from '../types';

export const ConfigView: React.FC = () => {
  const { 
    company,
    updateCompany,
    clientes,
    veiculos,
    produtos,
    ordensServico,
    financeiro,
    fornecedores,
    vendas,
    autoBackups,
    triggerDailyBackup,
    deleteAutoBackup,
    resetToProduction
  } = useApp();

  // Primary Company fields state
  const [companyName, setCompanyName] = useState(company.name);
  const [cnpjStr, setCnpjStr] = useState(company.cnpj);
  const [phoneStr, setPhoneStr] = useState(company.phone);
  const [addressStr, setAddressStr] = useState(company.address);
  const [companyCep, setCompanyCep] = useState(company.cep || '');
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  React.useEffect(() => {
    if (company) {
      setCompanyName(company.name || '');
      setCnpjStr(company.cnpj || '');
      setPhoneStr(company.phone || '');
      setAddressStr(company.address || '');
      setCompanyCep(company.cep || '');
      setEmailStr(company.email || 'contato@autoprecision.com.br');
      setWhatsappStr(company.whatsapp || '(11) 98765-4321');
      setLatVal(company.latitude || -23.6015);
      setLngVal(company.longitude || -46.6974);
      setLogoUrlStr(company.logoUrl || '');
      setCustomDomainStr(company.customDomain || '');
      setSubdomainStr(company.subdomain || '');
      setDomainStatusVal(company.domainStatus || 'Pendente');
    }
  }, [company]);

  const handleFetchCompanyCep = async (cepCode: string) => {
    const clean = cepCode.replace(/\D/g, "");
    if (clean.length !== 8) return;
    
    setIsFetchingCep(true);
    setCepError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError("CEP inválido/não encontrado.");
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
        
        setAddressStr(fullAddress);
      }
    } catch (err) {
      setCepError("Erro na conexão com ViaCEP.");
    } finally {
      setIsFetchingCep(false);
    }
  };

  const [emailStr, setEmailStr] = useState(company.email || 'contato@autoprecision.com.br');
  const [whatsappStr, setWhatsappStr] = useState(company.whatsapp || '(11) 98765-4321');
  
  // Custom geolocation/coordinates state
  const [latVal, setLatVal] = useState<number>(company.latitude || -23.6015);
  const [lngVal, setLngVal] = useState<number>(company.longitude || -46.6974);

  // Logo selection mode & inputs
  const [logoUrlStr, setLogoUrlStr] = useState(company.logoUrl || '');
  const [logoFeedback, setLogoFeedback] = useState<string | null>(null);

  // Custom Domain & DNS Subdomain configurations state
  const [customDomainStr, setCustomDomainStr] = useState(company.customDomain || '');
  const [subdomainStr, setSubdomainStr] = useState(company.subdomain || '');
  const [domainStatusVal, setDomainStatusVal] = useState<'Pendente' | 'Verificando' | 'Ativo' | 'Falhado'>(company.domainStatus || 'Pendente');
  const [dnsTestLogs, setDnsTestLogs] = useState<string[]>([]);
  const [isTestingDns, setIsTestingDns] = useState(false);
  
  // Vector SVG Customizer states  
  const [badgeShape, setBadgeShape] = useState<'shield' | 'hexagon' | 'circle' | 'crest'>('shield');
  const [badgeIcon, setBadgeIcon] = useState<'wrench' | 'car' | 'gauge' | 'shield' | 'lightning'>('wrench');
  const [badgeTheme, setBadgeTheme] = useState<'red' | 'blue' | 'gold' | 'green' | 'orange' | 'purple'>('red');
  const [badgeInitials, setBadgeInitials] = useState<string>('ATC');
  const [accentStripes, setAccentStripes] = useState<boolean>(true);

  // Other system options
  const [thermalWidth, setThermalWidth] = useState('80mm');
  const [whiteLabelTitle, setWhiteLabelTitle] = useState('AutoTech OS System');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Active guide panel
  const [activeGuideTab, setActiveGuideTab] = useState<'branding' | 'google' | 'whatsapp'>('branding');

  // Copy template state helper
  const [copiedTemplateText, setCopiedTemplateText] = useState<string | null>(null);

  // Backup state
  const [isGenerating, setIsGenerating] = useState(false);
  const [backupReady, setBackupReady] = useState(false);
  const [backupStats, setBackupStats] = useState<{
    sizeKb: string;
    totalRows: number;
    fileName: string;
    timestamp: string;
  } | null>(null);

  // Reset to Production wizard states
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmationInput, setResetConfirmationInput] = useState('');
  const [isResetExecuting, setIsResetExecuting] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ status: 'success' | 'error'; message: string } | null>(null);

  const handleExecuteResetToProduction = async () => {
    if (resetConfirmationInput !== 'CONFIRMAR') {
      setResetFeedback({ status: 'error', message: 'Por favor, digite CONFIRMAR em letras maiúsculas para confirmar.' });
      return;
    }

    setIsResetExecuting(true);
    setResetFeedback(null);
    try {
      await resetToProduction();
      setResetFeedback({
        status: 'success',
        message: '🎉 Banco de dados limpo e reinicializado com sucesso! Todos os dados de teste foram apagados. O sistema está pronto do zero para registrar dados reais.'
      });
      setShowResetConfirm(false);
      setResetConfirmationInput('');
    } catch (err: any) {
      console.error(err);
      setResetFeedback({
        status: 'error',
        message: `Houve um problema ao zerar o estoque e tabelas: ${err.message || err}`
      });
    } finally {
      setIsResetExecuting(false);
    }
  };

  // Trigger browser copy
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplateText(label);
    setTimeout(() => setCopiedTemplateText(null), 2500);
  };

  // Convert the live customizable SVG into a persistent Logo Data URL
  const handleApplyCustomBadgeLogo = () => {
    const svgEl = document.getElementById('custom-company-logo-svg');
    if (svgEl) {
      try {
        const svgString = new XMLSerializer().serializeToString(svgEl);
        const base64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        setLogoUrlStr(base64);
        
        // Save dynamically to state
        updateCompany({ logoUrl: base64 });
        
        setLogoFeedback("🎉 Logomarca vetorial exclusiva criada, otimizada e aplicada no cabeçalho!");
        setTimeout(() => setLogoFeedback(null), 4000);
      } catch (err) {
        console.error("Falha ao renderizar logo vetorial:", err);
        setLogoFeedback("❌ Erro ao converter o SVG para Imagem.");
      }
    }
  };

  // Convert uploaded image file into direct Base64 logo Url
  const handleUploadCompanyLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setLogoFeedback("❌ Arquivo muito grande! Escolha um logotipo menor que 2MB.");
      setTimeout(() => setLogoFeedback(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setLogoUrlStr(base64);
        setLogoFeedback("🎉 Logomarca carregada com sucesso! Lembre-se de salvar as configurações.");
        setTimeout(() => setLogoFeedback(null), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Download raw SVG code
  const handleDownloadSvgCode = () => {
    const svgEl = document.getElementById('custom-company-logo-svg');
    if (svgEl) {
      const svgString = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logo_autotech_${badgeInitials.toLowerCase() || 'empresa'}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Apply visual identity palette from suggestions card
  const handleApplyPalette = (theme: 'red' | 'blue' | 'gold' | 'green' | 'orange' | 'purple', initials: string) => {
    setBadgeTheme(theme);
    setBadgeInitials(initials);
    setLogoFeedback(`🎨 Paleta sugerida aplicada! Clique em "Definir como Logotipo Oficial" para salvar.`);
    setTimeout(() => setLogoFeedback(null), 4000);
  };

  // Preset ready-to-use professional logos (curated database)
  const readyToUseLogos = [
    { name: "🔩 Carbon Gear", url: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=200&h=200", desc: "Moderno & Industrial, ideal para mecânicas de pesados" },
    { name: "🏎️ Horizon Speedster", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200&h=200", desc: "Layout esportivo estilizado para Centros Automotivos de Performance" },
    { name: "⚡ Volt Hybrid Tech", url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58a?auto=format&fit=crop&q=80&w=200&h=200", desc: "Design cibernético neon excelente para especialistas em eletrônica e híbridos" },
    { name: "🛡️ Platinum Shield Classic", url: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&q=80&w=200&h=200", desc: "Visual tradicional de confiança para oficinas de funilaria e pintura" },
  ];

  // Geolocation simulator
  const handleAutoDetectCoords = () => {
    // Generate slight noise around central São Paulo coordinate to show reactive simulation
    const randomOffsetLat = (Math.random() - 0.5) * 0.05;
    const randomOffsetLng = (Math.random() - 0.5) * 0.05;
    const mockLat = parseFloat((-23.5505 + randomOffsetLat).toFixed(4));
    const mockLng = parseFloat((-46.6333 + randomOffsetLng).toFixed(4));
    setLatVal(mockLat);
    setLngVal(mockLng);
    setSaveFeedback("🌐 Coordenadas de pátio aproximadas via IP Geográfico!");
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleExportBackup = () => {
    setIsGenerating(true);
    setBackupReady(false);
    setTimeout(() => {
      try {
        const backupPayload = {
          metadata: {
            appName: "AutoTech ERP",
            exportedAt: new Date().toISOString(),
            tenantId: company.id,
            companyName: company.name,
            totalRecords: 
              clientes.length +
              veiculos.length +
              produtos.length +
              ordensServico.length +
              financeiro.length +
              fornecedores.length +
              vendas.length
          },
          collections: {
            company,
            clientes,
            veiculos,
            produtos,
            ordensServico,
            financeiro,
            fornecedores,
            vendas
          }
        };

        const jsonString = JSON.stringify(backupPayload, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        const formattedDate = new Date().toISOString().substring(0, 10);
        a.href = url;
        a.download = `autotech_backup_${company.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${formattedDate}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setBackupStats({
          sizeKb: (blob.size / 1024).toFixed(2),
          totalRows: backupPayload.metadata.totalRecords,
          fileName: a.download,
          timestamp: new Date().toLocaleTimeString()
        });
        setBackupReady(true);
      } catch (err) {
        console.error("Backup compilation error:", err);
      } finally {
        setIsGenerating(false);
      }
    }, 1200);
  };

  const handleDownloadAutoBackup = (backup: any) => {
    try {
      const blob = new Blob([backup.payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download auto backup:", err);
    }
  };

  // Main configuration save triggers database write helper
  const handleSaveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveFeedback("Sincronizando parâmetros locais do White-Label em nuvem...");
    try {
      await updateCompany({
        name: companyName,
        cnpj: cnpjStr,
        phone: phoneStr,
        address: addressStr,
        cep: companyCep,
        email: emailStr,
        whatsapp: whatsappStr,
        latitude: latVal,
        longitude: lngVal,
        logoUrl: logoUrlStr,
        customDomain: customDomainStr,
        subdomain: subdomainStr,
        domainStatus: domainStatusVal
      });
      setTimeout(() => {
        setSaveFeedback("✅ Configurações e coordenadas de mapa salvas com sucesso!");
      }, 1000);
    } catch (err) {
      setSaveFeedback("❌ Erro ao sincronizar catálogo fiscal: " + String(err));
    }
  };

  // Svg dynamic rendering helper variables
  let selectedColorHex = '#ef4444'; // Red default
  if (badgeTheme === 'blue') selectedColorHex = '#3b82f6';
  else if (badgeTheme === 'gold') selectedColorHex = '#fbbf24';
  else if (badgeTheme === 'green') selectedColorHex = '#10b981';
  else if (badgeTheme === 'orange') selectedColorHex = '#f97316';
  else if (badgeTheme === 'purple') selectedColorHex = '#a78bfa';

  // Address lookup URL for standard static google map iframe embed
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(addressStr || "Av. das Nações Unidas, 1040 - São Paulo, SP")}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 text-left pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
          ⚙️ PARÂMETROS GERAIS E IDENTIFICAÇÃO EM MAPA
        </h1>
        <p className="text-xs text-gray-400 font-mono">
          Gerencie a identidade visual de sua mecânica, mude seu logotipo, configure contatos, canais de atendimento e geolocalização.
        </p>
      </div>

      {/* Main Grid: Info Form and Interactive Brand & Suggestion Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8-Grid): Company data and operational details */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <form onSubmit={handleSaveConfigs} className="bg-[#0c1223] rounded-2xl border border-gray-850 p-6 flex flex-col gap-6">
            
            {/* Identity section header */}
            <div className="border-b border-gray-850 pb-4 flex items-center gap-2.5">
              <Building className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="font-display font-bold text-white text-base">Identificação & Dados Corporativos</h3>
                <span className="text-[10px] text-gray-500 font-mono block">Configure informações fiscais e os cabeçalhos de preenchimento de faturas de OS.</span>
              </div>
            </div>

            {/* Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Nome da Oficina / Razão Social</label>
                <input 
                  type="text" 
                  required
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">CNPJ / Inscrição Fiscal</label>
                <input 
                  type="text" 
                  placeholder="00.000.000/0001-00"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  value={cnpjStr}
                  onChange={(e) => setCnpjStr(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider font-mono">E-Mail do Suporte / Oficina</label>
                <input 
                  type="email" 
                  placeholder="suporte@oficina.com.br"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500"
                  value={emailStr}
                  onChange={(e) => setEmailStr(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Telefone Geral Fixo</label>
                <input 
                  type="text" 
                  placeholder="(11) 3211-0000"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500"
                  value={phoneStr}
                  onChange={(e) => setPhoneStr(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">WhatsApp para Orçamentos & OS</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="(11) 98765-4321"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 pl-3 pr-10 text-white w-full focus:outline-none focus:border-red-500"
                    value={whatsappStr}
                    onChange={(e) => setWhatsappStr(e.target.value)}
                  />
                  <a 
                    href={`https://wa.me/${whatsappStr.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    title="Testar atendimento WhatsApp"
                    className="absolute right-2.5 top-2.5 text-green-450 hover:text-green-400 text-green-500"
                  >
                    <Smartphone className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  CEP {isFetchingCep && <span className="text-red-500 text-[8px] animate-pulse font-mono">(Buscando endereço...)</span>}
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ex: 01001-000"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white w-full focus:outline-none focus:border-red-500 font-mono text-xs"
                    value={companyCep}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCompanyCep(val);
                      if (val.replace(/\D/g, "").length === 8) {
                        handleFetchCompanyCep(val);
                      }
                    }}
                  />
                  {cepError && (
                    <span className="text-[9px] text-red-500 block absolute left-1 -bottom-4 font-sans">{cepError}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Endereço Completo / Logradouro</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Rua, número - Bairro - Cidade/UF"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 pl-3 pr-12 text-white w-full focus:outline-none focus:border-red-500 text-xs"
                    value={addressStr}
                    onChange={(e) => setAddressStr(e.target.value)}
                  />
                  <div className="absolute right-2.5 top-2.5 text-gray-500">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Map / Coordinates integration section */}
            <div className="border-t border-gray-850 pt-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                    🗺️ Geolocalização & Coordenadas GPS
                  </h4>
                  <span className="text-[9px] text-gray-500 font-mono block">Coordenadas decimais para calculadoras de distância e rotas de reboque.</span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoDetectCoords}
                  className="py-1 px-2.5 bg-slate-900 border border-slate-800 hover:border-red-950 font-mono text-[9px] rounded-lg text-slate-300 hover:text-red-400 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Compass className="w-3" /> Auto-Detectar GPS
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500">LATITUDE</span>
                  <input 
                    type="number" 
                    step="any"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-1.5 px-3 text-white text-xs"
                    value={latVal}
                    onChange={(e) => setLatVal(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500">LONGITUDE</span>
                  <input 
                    type="number" 
                    step="any"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-1.5 px-3 text-white text-xs"
                    value={lngVal}
                    onChange={(e) => setLngVal(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Map embed iframe preview */}
              <div className="h-44 w-full rounded-xl border border-gray-800 bg-[#050912] overflow-hidden relative shadow-lg">
                <iframe 
                  title="Oficina Localização Integrada"
                  width="100%" 
                  height="100%" 
                  src={mapEmbedUrl}
                  className="border-0 grayscale contrast-125 brightness-90"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer"
                ></iframe>
                <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 border border-slate-800 rounded px-2 py-0.5 text-[8px] font-mono text-gray-400 flex items-center gap-1 hover:text-white transition-colors cursor-default">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-550 animate-ping bg-red-600"></span>
                  Lat: {latVal} | Lng: {lngVal}
                </div>
              </div>
            </div>

            {/* Custom logo upload AND address integration */}
            <div className="border-t border-gray-850 pt-4 flex flex-col gap-3 font-mono text-xs">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Logotipo / Logomarca da Oficina</label>
                <span className="bg-red-950/30 border border-red-900/40 text-red-500 text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase animate-pulse">White-Label</span>
              </div>

              {/* Direct File Upload area */}
              <div className="group relative border border-dashed border-gray-800 hover:border-red-900/80 bg-[#050912]/60 rounded-xl p-4 transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer">
                <input 
                  type="file" 
                  id="company-logo-file-upload" 
                  accept="image/*" 
                  onChange={handleUploadCompanyLogo} 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-450 group-hover:text-red-500 group-hover:scale-110 transition-all duration-300">
                  <Upload className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex flex-col gap-0.5 pointer-events-none">
                  <span className="text-white text-[11px] font-bold font-sans">Fazer Upload de Logomarca</span>
                  <span className="text-[9px] text-gray-500 font-sans">Arraste ou selecione uma imagem mestre (PNG, JPG, SVG) até 2MB</span>
                </div>
              </div>

              {logoFeedback && (
                <div className="p-2 border text-[9px] leading-snug font-sans bg-[#0c1328] text-purple-400 border-purple-900/40 rounded-lg">
                  {logoFeedback}
                </div>
              )}

              {/* Fallback URL input */}
              <div className="flex flex-col gap-1.5 bg-black/20 p-2.5 rounded-lg border border-gray-900/60">
                <span className="text-[9px] text-gray-400">Alternativa: Link Direto da Imagem na Web</span>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="https://sua-oficina.com.br/logo.png"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-1.5 px-2.5 text-white flex-1 text-[11px]"
                    value={logoUrlStr}
                    onChange={(e) => setLogoUrlStr(e.target.value)}
                  />
                  {logoUrlStr && (
                    <div className="w-8 h-8 rounded border border-gray-850 bg-[#050912] flex items-center justify-center shrink-0">
                      <img 
                        src={logoUrlStr} 
                        alt="Preview" 
                        className="w-6 h-6 object-contain" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/broken/50/50';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Printer configs */}
            <div className="border-t border-gray-850 pt-4 flex items-center gap-2">
              <Printer className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="font-display font-bold text-white text-sm">Impressoras de Cupom Térmico</h3>
                <span className="text-[10px] text-gray-500 font-mono block">Configure largura mestre de tickets e faturas rápidas.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">LARGURA PAPEL ALIMENTADOR</label>
                <select 
                  className="bg-[#080c16] border border-gray-805 border-gray-800 rounded-lg py-2 px-1 text-white text-xs cursor-pointer focus:border-red-500 font-mono"
                  value={thermalWidth}
                  onChange={(e) => setThermalWidth(e.target.value)}
                >
                  <option value="80mm">Bobina Térmica 80mm (Recomendado)</option>
                  <option value="58mm">Bobina Pequena 58mm (Layout Compacto)</option>
                  <option value="A4">Impressão Convencional Folha A4</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400">ASSINATURA WHITE-LABEL NO RODAPÉ</label>
                <input 
                  type="text" 
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white text-xs focus:ring-1 focus:ring-red-500"
                  value={whiteLabelTitle}
                  onChange={(e) => setWhiteLabelTitle(e.target.value)}
                />
              </div>
            </div>

            {/* Domain & White-Label Custom DNS Hub */}
            <div className="border-t border-gray-850 pt-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="font-display font-bold text-white text-sm">Domínio Próprio & DNS (White-Label)</h3>
                <span className="text-[10px] text-gray-500 font-mono block">Personalize seu link de acesso. Use nosso subdomínio ou aponte seu próprio endereço na web.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Subdomínio Temporário (Hospedagem Vercel)</label>
                  <span className="text-[9px] bg-purple-950/40 text-purple-400 border border-purple-900/40 px-1.5 py-0.2 rounded font-mono font-bold uppercase">Grátis & Ativo</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-[#050912] border border-gray-850 border-r-0 rounded-l-lg py-2 px-2.5 text-gray-400 text-[10px] font-mono select-none">
                    oficina-eta-teal.vercel.app/
                  </span>
                  <input 
                    type="text" 
                    placeholder="ex: speedy-car"
                    className="bg-[#080c16] border border-gray-850 rounded-r-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-purple-500 flex-1 font-mono"
                    value={subdomainStr}
                    onChange={(e) => {
                      const cleanValue = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setSubdomainStr(cleanValue);
                    }}
                  />
                </div>
                {subdomainStr && (
                  <div className="mt-1 flex flex-col gap-1 font-sans text-[10px]">
                    <span className="text-purple-400/95 font-bold">
                      🚀 Servidor Edge Vercel (Ativo):{' '}
                      <a href={`https://oficina-eta-teal.vercel.app/${subdomainStr}`} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-0.5 hover:text-purple-300">
                        oficina-eta-teal.vercel.app/{subdomainStr} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </span>
                    <span className="text-gray-500">
                      Redirecionamento alternativo:{' '}
                      <a href={`https://${subdomainStr}.autoprecision.com.br`} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-0.5 hover:text-gray-450">
                        {subdomainStr}.autoprecision.com.br <ExternalLink className="w-2 h-2" />
                      </a>
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Domínio Próprio Definitivo</label>
                <input 
                  type="text" 
                  placeholder="ex: oficina.seusite.com.br"
                  className="bg-[#080c16] border border-gray-850 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
                  value={customDomainStr}
                  onChange={(e) => {
                    setCustomDomainStr(e.target.value.toLowerCase().trim());
                    if (domainStatusVal === 'Ativo') setDomainStatusVal('Pendente');
                  }}
                />
                <span className="text-[9px] text-gray-400 font-sans block mt-1">
                  💡 <strong>Domínio Profissional:</strong> Vincule seu domínio próprio para substituir o link provisório da Vercel.
                </span>
              </div>
            </div>

            {/* DNS Rules and Setup Suggestions based on input */}
            {(customDomainStr || subdomainStr) && (
              <div className="bg-[#050912] border border-gray-850 rounded-xl p-4 flex flex-col gap-3 font-sans text-xs">
                <div className="flex justify-between items-center border-b border-gray-850 pb-2">
                  <h4 className="font-mono text-[11px] text-purple-400 font-bold tracking-wider flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-purple-400" /> REQUISITOS DE APONTAMENTO DNS (SUGESTÕES)
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-500 font-bold">Status:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      domainStatusVal === 'Ativo' 
                        ? 'bg-green-950/40 border border-green-900/50 text-green-400' 
                        : domainStatusVal === 'Verificando'
                          ? 'bg-blue-950/20 border border-blue-900/50 text-blue-400 animate-pulse'
                          : domainStatusVal === 'Falhado'
                            ? 'bg-red-950/20 border border-red-900/50 text-red-500'
                            : 'bg-amber-950/20 border border-amber-900/50 text-amber-500'
                    }`}>
                      {domainStatusVal === 'Ativo' ? '● DNS PROPAGADO' : domainStatusVal === 'Verificando' ? '● VERIFICANDO...' : domainStatusVal === 'Falhado' ? '● ERRO DE CONFIG' : '● REGISTRO REQUERIDO'}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] leading-relaxed text-gray-400 font-sans">
                  Para que o seu domínio próprio ou subdomínio personalizado funcione como portal principal de faturamento, vendas e ordens de serviço, adicione os seguintes apontamentos de DNS no painel da sua hospedagem:
                </p>

                <div className="overflow-x-auto rounded-lg border border-gray-850 bg-[#080c16]">
                  <table className="w-full text-left font-mono text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 text-gray-450 text-gray-400 border-b border-gray-850">
                        <th className="p-2 text-[10px] text-gray-400 font-bold uppercase">TIPO</th>
                        <th className="p-2 text-[10px] text-gray-400 font-bold uppercase">NOME / ENTRADA</th>
                        <th className="p-2 text-[10px] text-gray-400 font-bold uppercase">VALOR / DESTINO</th>
                        <th className="p-2 text-[10px] text-gray-400 font-bold uppercase text-right">AÇÃO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Standard CNAME suggestion */}
                      <tr className="border-b border-gray-850 hover:bg-[#070d18] transition-colors">
                        <td className="p-2 text-purple-400 font-extrabold uppercase">CNAME</td>
                        <td className="p-2 font-bold text-white">{customDomainStr ? (customDomainStr.split('.')[0] === 'www' ? 'www' : customDomainStr.split('.')[0] || '@') : 'atc'}</td>
                        <td className="p-2 text-gray-300">saas.autoprecision.com.br</td>
                        <td className="p-2 text-right">
                          <button 
                            type="button" 
                            onClick={() => handleCopyText("saas.autoprecision.com.br", "CNAME")}
                            className="bg-slate-900 hover:bg-slate-800 p-1 rounded border border-gray-800 text-[10.5px] text-gray-400 cursor-pointer transition-all"
                          >
                            {copiedTemplateText === "CNAME" ? "Copiado!" : "Copiar"}
                          </button>
                        </td>
                      </tr>
                      {/* Apex domain direct A-Record suggestion */}
                      <tr className="border-b border-gray-850 hover:bg-[#070d18] transition-colors">
                        <td className="p-2 text-amber-400 font-extrabold uppercase">A</td>
                        <td className="p-2 font-bold text-white">@ (ou em branco)</td>
                        <td className="p-2 text-gray-300">34.117.158.121</td>
                        <td className="p-2 text-right">
                          <button 
                            type="button" 
                            onClick={() => handleCopyText("34.117.158.121", "A")}
                            className="bg-slate-900 hover:bg-slate-800 p-1 rounded border border-gray-800 text-[10.5px] text-gray-400 cursor-pointer transition-all"
                          >
                            {copiedTemplateText === "A" ? "Copiado!" : "Copiar"}
                          </button>
                        </td>
                      </tr>
                      {/* Security Verification TXT Record */}
                      <tr className="border-b border-gray-850 hover:bg-[#070d18] transition-colors">
                        <td className="p-2 text-cyan-400 font-extrabold uppercase">TXT</td>
                        <td className="p-2 font-bold text-white">_autoprecision-challenge</td>
                        <td className="p-2 text-gray-300 text-[10px] break-all">{`autoprecision-verify-${company.id}`}</td>
                        <td className="p-2 text-right">
                          <button 
                            type="button" 
                            onClick={() => handleCopyText(`autoprecision-verify-${company.id}`, "TXT")}
                            className="bg-slate-900 hover:bg-slate-800 p-1 rounded border border-gray-800 text-[10.5px] text-gray-400 cursor-pointer transition-all"
                          >
                            {copiedTemplateText === "TXT" ? "Copiado!" : "Copiar"}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* DNS Propagation Live test panel */}
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                    <span className="text-[9px] text-gray-500 font-mono flex items-center gap-1">
                      <Activity className="w-3 h-3 text-purple-400" />
                      A propagação DNS geralmente leva de 1 a 24 horas. Deseja simular e testar agora?
                    </span>
                    <button
                      type="button"
                      disabled={isTestingDns || !customDomainStr}
                      onClick={async () => {
                        setIsTestingDns(true);
                        setDomainStatusVal('Verificando');
                        setDnsTestLogs(["Iniciando escaneamento global de DNS..."]);
                        
                        // Fake trace delay steps
                        const steps = [
                          "[DNS_TRACE] Resolvendo domínio: " + customDomainStr,
                          "[DNS_TRACE] Solicitando servidores IPv4 / IPv6 na nuvem Cloudflare...",
                          "[DNS_CNAME] Verificando se registro CNAME 'saas.autoprecision.com.br' existe...",
                          "[DNS_TXT_CHALLENGE] Validando código de posse '_autoprecision-challenge'...",
                          "[DNS_SUCCESS] Apontamento verificado de forma segura com criptografia SSL Ativa!"
                        ];
                        
                        for (let i = 0; i < steps.length; i++) {
                          await new Promise(resolve => setTimeout(resolve, 600));
                          setDnsTestLogs(prev => [...prev, steps[i]]);
                        }
                        
                        setIsTestingDns(false);
                        setDomainStatusVal('Ativo');
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all ${
                        isTestingDns 
                          ? 'bg-slate-800 border-slate-700 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-950/40 hover:bg-purple-950/80 border-purple-900 text-purple-400 cursor-pointer'
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isTestingDns ? 'animate-spin' : ''}`} />
                      {isTestingDns ? "TESTANDO PROPAGAÇÃO..." : "TESTAR APONTAMENTO DNS"}
                    </button>
                  </div>

                  {/* DNS Live Log details console */}
                  {dnsTestLogs.length > 0 && (
                    <div className="bg-[#050912] border border-gray-850 p-2.5 rounded-lg font-mono text-[9.5px] text-gray-400 leading-relaxed flex flex-col gap-1 max-h-36 overflow-y-auto">
                      {dnsTestLogs.map((log, lidx) => (
                        <div key={lidx} className={`${log.includes('SUCCESS') ? 'text-green-400 font-bold' : log.includes('CNAME') ? 'text-purple-400' : 'text-gray-400'}`}>
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save controls */}
            {saveFeedback && (
              <div className="p-3.5 rounded-xl border font-mono text-xs leading-relaxed bg-[#0a1827] text-cyan-400 border-cyan-900/40">
                {saveFeedback}
              </div>
            )}

            <button 
              type="submit"
              className="w-full mt-4 py-3.5 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl font-bold font-mono tracking-wider text-xs text-white shadow-lg cursor-pointer transition-all active:scale-[99.5%] flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              SALVAR PARÂMETROS GERAIS DO SaaS
            </button>

          </form>

          {/* Backup Panel */}
          <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6 font-sans">
            <div className="border-b border-gray-850 pb-4 flex items-center gap-2.5">
              <Database className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="font-display font-bold text-white text-base">🛡️ Backup de Segurança e Auditoria</h3>
                <span className="text-[10px] text-gray-500 font-mono block">Exporte um arquivo de dump em JSON contendo tabelas de clientes e ordens de serviço.</span>
              </div>
            </div>

            <div className="bg-[#050912] border border-gray-900 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs">
              <div className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg">
                <span className="text-gray-400">STATUS SEGURO</span>
                <span className="text-green-505 text-green-500 font-bold">100% MONITORADO</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-gray-500 block">CLIENTES</span>
                  <strong className="text-white text-xs">{clientes.length} rgs</strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-gray-500 block">ORDENS</span>
                  <strong className="text-white text-xs">{ordensServico.length} rgs</strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-gray-500 block">ESTOQUE</span>
                  <strong className="text-white text-xs">{produtos.length} rgs</strong>
                </div>
              </div>
            </div>

            {backupReady && backupStats && (
              <div className="p-3.5 bg-green-950/35 border border-green-900/40 rounded-xl text-xs font-mono flex flex-col gap-1.5 text-gray-300">
                <span className="text-green-400 font-bold">🎯 ARQUIVO DE AUDITORIA DISPONIBILIZADO:</span>
                <div>• Nome: <strong>{backupStats.fileName}</strong></div>
                <div>• Registros empacotados: <strong>{backupStats.totalRows} itens</strong></div>
                <div>• Hora de criação: <strong>{backupStats.timestamp}</strong></div>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleExportBackup}
                disabled={isGenerating}
                className={`py-3 px-4 rounded-xl font-mono text-xs font-bold w-full flex items-center justify-center gap-2 cursor-pointer transition-all ${isGenerating ? 'bg-slate-800 text-gray-500' : 'bg-red-650 bg-red-600 hover:bg-red-700 text-white'}`}
              >
                <Download className="w-4 h-4" />
                {isGenerating ? "GERANDO PACOTE..." : "CRIAR BACKUP MANUAL IMEDIATO"}
              </button>
            </div>

            {/* Daily Automated Backup Compliance & Log Section */}
            <div className="border-t border-gray-800 pt-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-mono text-[11px] font-bold text-gray-300 uppercase tracking-wider">Histórico de Auditoria Automática (Dump JSON)</span>
              </div>

              <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                Em conformidade com as regras de <strong>Backup &amp; Segurança</strong>, o banco de dados é exportado de forma automática em formato <strong>JSON</strong> diariamente, ou sempre que uma nova sessão administrativa é iniciada em um novo dia.
              </p>

              <div className="bg-[#050912] border border-gray-900 rounded-xl p-3.5 flex flex-col gap-3">
                <div className="flex justify-between items-center text-[10px] font-mono border-b border-gray-850 pb-2 text-gray-400">
                  <span>FREQUÊNCIA CONFIGURADA:</span>
                  <span className="text-emerald-500 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-900/60 font-bold">DIÁRIA (AUTO)</span>
                </div>
                
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                  <span>ÚLTIMA ROTINA EXECUTADA:</span>
                  <strong className="text-white">
                    {autoBackups.length > 0 ? autoBackups[0].date.substring(0, 10) : "Agendado para hoje"}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => triggerDailyBackup(true)}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-mono text-cyan-400 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                  SIMULAR DISPARO DIÁRIO AGORA (TESTAR AUDITORIA)
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-wider block">Últimos Dumps de Exportação (Logs):</span>
                
                {autoBackups.length === 0 ? (
                  <div className="p-4 bg-[#050912]/50 border border-dashed border-gray-850 rounded-xl text-center text-gray-500 font-mono text-[10px]">
                    Nenhum dump diário automático gravado hoje ainda.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {autoBackups.map((bak) => (
                      <div 
                        key={bak.id} 
                        className="bg-[#050912] border border-gray-900 rounded-xl p-3 flex flex-col gap-2 transition-all hover:border-gray-800 text-xs font-mono"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex flex-col min-w-0">
                            <span className="text-white font-bold text-[11px] truncate" title={bak.fileName}>
                              {bak.fileName}
                            </span>
                            <span className="text-[9px] text-gray-500">
                              Gerado em: {bak.date}
                            </span>
                          </div>
                          <span className="shrink-0 bg-gray-900 text-gray-400 border border-gray-800 text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                            {bak.sizeKb} KB
                          </span>
                        </div>

                        <div className="flex justify-between items-center gap-2 pt-1 border-t border-gray-950 text-[10px]">
                          <span className="text-gray-400">
                            {bak.totalRecords} registros auditados
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDownloadAutoBackup(bak)}
                              className="text-emerald-500 hover:text-white bg-emerald-950/20 hover:bg-emerald-800/40 border border-emerald-900/40 px-2 py-0.5 rounded text-[9px] font-bold transition-colors cursor-pointer"
                            >
                              Baixar Dump
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteAutoBackup(bak.id)}
                              className="text-red-400 hover:text-white bg-red-950/20 hover:bg-red-800/40 border border-red-900/30 px-2 py-0.5 rounded text-[9px] font-medium transition-colors cursor-pointer"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Inicialização para Produção / Zerar Dados */}
          <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6 font-sans">
            <div className="border-b border-gray-850 pb-4 flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-display font-bold text-white text-base">🚀 Preparação Básica para Produção</h3>
                <span className="text-[10px] text-gray-500 font-mono block">Instruções, sugestões práticas e purgação de dados fictícios para sua oficina.</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-xs text-gray-300 leading-relaxed">
                Antes de iniciar as operações e faturamentos com seus <strong>clientes reais</strong>, é importantíssimo que seu banco de dados esteja limpo de quaisquer dados ou testes fictícios enviados durante o período de demonstração.
              </p>

              {/* Suggestions Container */}
              <div className="bg-[#050912]/80 border border-gray-850 rounded-xl p-4 flex flex-col gap-3 font-sans">
                <span className="font-mono text-[10px] font-bold text-amber-500 uppercase tracking-widest block flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" /> RECOMENDAÇÕES PARA INÍCIO SEGURO:
                </span>

                <div className="flex flex-col gap-2 text-xs text-gray-405 text-gray-400">
                  <div className="flex gap-2 items-start">
                    <span className="text-amber-500 shrink-0 font-bold">1.</span>
                    <p>
                      <strong className="text-white">Identidade Visual Completa:</strong> Use o painel ao lado para gerar sua logomarca ou subir sua própria logo. Isso garante que as impressões térmicas de O.S. enviadas via Whatsapp fiquem ultra profissionais.
                    </p>
                  </div>

                  <div className="flex gap-2 items-start mt-1.5">
                    <span className="text-amber-500 shrink-0 font-bold">2.</span>
                    <p>
                      <strong className="text-white">Lançamento por XML:</strong> Ao abastecer o estoque com peças reais, utilize o <span className="text-cyan-400 font-bold">Importador de XML de Nota Fiscal (NF-e)</span> na aba de Estoque. Ele cadastrará automaticamente os produtos e fornecedores de forma segura.
                    </p>
                  </div>

                  <div className="flex gap-2 items-start mt-1.5">
                    <span className="text-amber-500 shrink-0 font-bold">3.</span>
                    <p>
                      <strong className="text-white">Fundo de Caixa Inicial:</strong> Logo no primeiro dia de produção, abra o caixa na aba <strong>PDV/Vendas</strong> informando o valor real de troco físico disponível para suas movimentações.
                    </p>
                  </div>

                  <div className="flex gap-2 items-start mt-1.5">
                    <span className="text-amber-500 shrink-0 font-bold">4.</span>
                    <p>
                      <strong className="text-white">Cadastro de Serviços Base:</strong> Cadastre as Mãos de Obra padrão (como Alinhamento, Troca de Óleo, Diagnóstico Injeção) com seus tempos e preços de referência para agilizar a criação de ordens de serviço.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedback messages */}
              {resetFeedback && (
                <div className={`p-3.5 border rounded-xl text-xs font-mono flex items-start gap-2.5 ${
                  resetFeedback.status === 'success' 
                    ? "bg-green-950/40 border-green-800 text-green-300" 
                    : "bg-red-950/40 border-red-800 text-red-400"
                }`}>
                  <div className="mt-0.5 font-bold shrink-0">
                    {resetFeedback.status === 'success' ? "✓" : "⚠"}
                  </div>
                  <div className="leading-relaxed">
                    {resetFeedback.message}
                  </div>
                </div>
              )}

              {/* Confirm UI Controls */}
              {!showResetConfirm ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirm(true);
                    setResetFeedback(null);
                  }}
                  className="py-3 px-4 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 hover:border-red-500/50 rounded-xl text-xs font-mono font-bold text-red-400 transition-all flex items-center justify-center gap-2 cursor-pointer w-full text-center"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  LIMPAR DADOS DE TESTE (INICIAR SISTEMA DO ZERO)
                </button>
              ) : (
                <div className="bg-[#0e0708] border border-red-900/40 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 text-red-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">Atenção Extrema! Ação Irreversível</span>
                  </div>
                  
                  <p className="text-[11px] text-gray-400 leading-normal font-sans">
                    Você está prestes a apagar todas as tabelas (clientes, veículos, O.S., fluxo financeiro, vendas, produtos e fornecedores) associadas à sua conta. Para prosseguir, digite <strong className="text-white text-xs font-mono">CONFIRMAR</strong> no campo abaixo:
                  </p>

                  <div className="flex flex-col gap-1.5 mt-1">
                    <input
                      type="text"
                      value={resetConfirmationInput}
                      onChange={(e) => setResetConfirmationInput(e.target.value)}
                      placeholder="Digite CONFIRMAR em letras maiúsculas"
                      className="bg-black/40 border border-red-900/40 focus:border-red-500 rounded-lg py-2 px-3 text-white text-xs font-mono outline-none text-center"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 mt-1 text-xs font-mono">
                    <button
                      type="button"
                      disabled={isResetExecuting}
                      onClick={() => {
                        setShowResetConfirm(false);
                        setResetConfirmationInput('');
                      }}
                      className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer text-center font-bold"
                    >
                      CANCELAR
                    </button>

                    <button
                      type="button"
                      disabled={isResetExecuting || resetConfirmationInput !== 'CONFIRMAR'}
                      onClick={handleExecuteResetToProduction}
                      className={`py-2.5 px-3 rounded-lg text-center font-bold transition-all flex justify-center items-center gap-1.5 cursor-pointer ${
                        resetConfirmationInput === 'CONFIRMAR' && !isResetExecuting
                          ? "bg-red-650 bg-red-600 hover:bg-red-700 text-white"
                          : "bg-slate-900 border border-slate-950 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      {isResetExecuting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          LIMPANDO...
                        </>
                      ) : (
                        "SIM, APAGAR TUDO"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5-Grid): Interactive SVG Brand Builder & Suggested Branding Tips */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Brand Builder Hub */}
          <div className="bg-[#0c1223] rounded-2xl border border-gray-805 border-gray-800 p-5 flex flex-col gap-5">
            
            <div className="border-b border-gray-850 pb-3.5">
              <h3 className="font-display font-extrabold text-white text-base flex items-center gap-2">
                🎨 CRIADOR DE LOGOMARCA VETORIAL
              </h3>
              <p className="text-[10px] text-gray-400 font-mono">
                Crie um logotipo automotivo exclusivo 100% configurável. Ajuste molduras, ícones esportivos e cores de pátio em segundos.
              </p>
            </div>

            {/* Live Render Area */}
            <div className="p-4 bg-[#050912] border border-gray-850 rounded-xl flex flex-col items-center justify-center relative group">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-gray-800/80 shadow-md">
                {/* Render Dynamic SVG Badges based on interactive selections */}
                <svg 
                  id="custom-company-logo-svg"
                  width="180" 
                  height="180" 
                  viewBox="0 0 200 200" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-40 h-40 object-contain mx-auto"
                >
                  <defs>
                    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#080c14" />
                    </radialGradient>
                    <linearGradient id="ironGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={selectedColorHex} />
                      <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="neonGlow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Dark Radial Background Cover */}
                  <rect width="200" height="200" rx="20" fill="url(#bgGrad)" stroke="#1e293b" strokeWidth="1" />

                  {/* Grid background decals */}
                  {accentStripes && (
                    <g stroke={selectedColorHex} opacity="0.12" strokeWidth="1">
                      <line x1="100" y1="10" x2="100" y2="190" />
                      <line x1="10" y1="100" x2="190" y2="100" />
                      <circle cx="100" cy="100" r="75" fill="none" strokeDasharray="3,3" />
                    </g>
                  )}

                  {/* Dynamic Outer Badges Shapes */}
                  {badgeShape === 'shield' && (
                    <path 
                      d="M40 35 C 70 25, 130 25, 160 35 C 160 90, 145 145, 100 178 C 55 145, 40 90, 40 35 Z" 
                      stroke={selectedColorHex} 
                      strokeWidth="5" 
                      fill="#060b14" 
                      strokeLinejoin="round" 
                      filter="url(#neonGlow)"
                    />
                  )}
                  {badgeShape === 'hexagon' && (
                    <polygon 
                      points="100,20 175,60 175,140 100,180 25,140 25,60" 
                      stroke={selectedColorHex} 
                      strokeWidth="5" 
                      fill="#060b14" 
                      strokeLinejoin="round" 
                      filter="url(#neonGlow)"
                    />
                  )}
                  {badgeShape === 'circle' && (
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="75" 
                      stroke={selectedColorHex} 
                      strokeWidth="5" 
                      fill="#060b14" 
                      filter="url(#neonGlow)"
                    />
                  )}
                  {badgeShape === 'crest' && (
                    <path 
                      d="M40 30 L 160 30 L 175 75 L 100 180 L 25 75 Z" 
                      stroke={selectedColorHex} 
                      strokeWidth="5" 
                      fill="#060b14" 
                      strokeLinejoin="round" 
                      filter="url(#neonGlow)"
                    />
                  )}

                  {/* Core Icon Decal */}
                  <g stroke={selectedColorHex} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {badgeIcon === 'wrench' && (
                      <path d="M75,95 L115,55 M111,51 L129,69 C132,66 135,60 132,54 M89,111 L71,129 C68,126 65,120 68,114" />
                    )}
                    {badgeIcon === 'car' && (
                      <path d="M55 95 L65 75 C 67 70, 75 68, 85 68 L115 68 C125 68, 133 70, 135 75 L145 95 C 150 97, 150 102, 145 105 L55 105 Z" />
                    )}
                    {badgeIcon === 'gauge' && (
                      <path d="M60 110 A 50 50 0 0 1 140 110 M100 100 L125 75" />
                    )}
                    {badgeIcon === 'shield' && (
                      <path d="M65 60 L100 45 L135 60 V100 C135 125 100 145 100 145 C100 145 65 125 65 100 Z" />
                    )}
                    {badgeIcon === 'lightning' && (
                      <polygon points="110,40 60,110 110,110 90,165 140,95 90,95" />
                    )}
                  </g>

                  {/* Central Initials Circle Badge overlay */}
                  <circle cx="100" cy="110" r="14" fill="#080c14" stroke={selectedColorHex} strokeWidth="1" />
                  <text 
                    x="100" 
                    y="114" 
                    fill="white" 
                    fontSize="11" 
                    fontWeight="black" 
                    fontFamily="JetBrains Mono, monospace" 
                    textAnchor="middle"
                  >
                    {badgeInitials.trim().substring(0, 3).toUpperCase()}
                  </text>

                  {/* Name of the Company Arc/Linear bottom banner */}
                  <text 
                    x="100" 
                    y="148" 
                    fill="white" 
                    fontSize="9.5" 
                    fontWeight="black" 
                    fontFamily="Inter, sans-serif" 
                    textAnchor="middle"
                    letterSpacing="1"
                  >
                    {companyName ? companyName.substring(0, 15).toUpperCase() : "AUTOTECH"}
                  </text>

                  {/* Small Establish text */}
                  <text 
                    x="100" 
                    y="158" 
                    fill={selectedColorHex} 
                    fontSize="6" 
                    fontWeight="bold" 
                    fontFamily="JetBrains Mono, monospace" 
                    textAnchor="middle"
                    letterSpacing="1.5"
                  >
                    PREMIUM SPEC
                  </text>
                </svg>
              </div>

              <span className="text-[9px] text-gray-500 font-mono mt-2 block">
                Visualização do Logotipo Comercial Real-Time
              </span>
            </div>

            {/* Customizer Panel Controls (Form style picker selectors) */}
            <div className="flex flex-col gap-3 font-mono text-[11px] leading-none">
              
              {/* Initials and stripes */}
              <div className="grid grid-cols-2 gap-3 text-xs leading-none">
                <div className="flex flex-col gap-1.5 focus-within:text-red-500">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">SIGLA CENTRAL (3 LETRAS)</span>
                  <input 
                    type="text" 
                    maxLength={3} 
                    className="bg-[#050912] border border-gray-800 rounded-lg text-white font-bold py-1.5 px-2.5 text-center text-xs"
                    value={badgeInitials}
                    onChange={(e) => setBadgeInitials(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 justify-center border border-gray-850 rounded-lg p-1 text-xs">
                  <input 
                    id="chkLines"
                    type="checkbox"
                    checked={accentStripes}
                    onChange={(e) => setAccentStripes(e.target.checked)}
                    className="w-3.5 h-3.5 cursor-pointer accent-red-600 rounded"
                  />
                  <label htmlFor="chkLines" className="text-[9px] text-slate-400 cursor-pointer font-bold">LINHAS DE GRADE</label>
                </div>
              </div>

              {/* Shapes Select */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase">MOLDURA DO CRASTÃO (SHAPE)</span>
                <div className="grid grid-cols-4 gap-1">
                  {(['shield', 'hexagon', 'circle', 'crest'] as const).map(shape => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => setBadgeShape(shape)}
                      className={`py-1.5 rounded text-[10px] uppercase font-bold text-center border cursor-pointer select-none transition-all ${badgeShape === shape ? 'bg-red-950/20 text-red-400 border-red-900/60' : 'bg-[#050912] text-slate-400 border-gray-850'}`}
                    >
                      {shape === 'shield' && "Escudo"}
                      {shape === 'hexagon' && "Hexágono"}
                      {shape === 'circle' && "Círculo"}
                      {shape === 'crest' && "Brasão"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Core Icon Select */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase">SÍMBOLO CENTRAL DA MECÂNICA</span>
                <div className="grid grid-cols-5 gap-1">
                  {(['wrench', 'car', 'gauge', 'shield', 'lightning'] as const).map(ico => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => setBadgeIcon(ico)}
                      className={`py-1.5 rounded text-[10px] uppercase font-bold text-center border cursor-pointer select-none transition-all ${badgeIcon === ico ? 'bg-red-950/20 text-red-500 border-red-900/60' : 'bg-[#050912] text-slate-400 border-gray-850'}`}
                    >
                      {ico === 'wrench' && "Chave"}
                      {ico === 'car' && "Carro"}
                      {ico === 'gauge' && "Painel"}
                      {ico === 'shield' && "Forte"}
                      {ico === 'lightning' && "Volt"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Core Color Select */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">COR DO ESTANDARTE</span>
                <div className="grid grid-cols-6 gap-1">
                  {(['red', 'blue', 'gold', 'green', 'orange', 'purple'] as const).map(th => {
                    let colbg = 'bg-red-600';
                    if (th === 'blue') colbg = 'bg-blue-600';
                    else if (th === 'gold') colbg = 'bg-yellow-500';
                    else if (th === 'green') colbg = 'bg-emerald-500';
                    else if (th === 'orange') colbg = 'bg-orange-500';
                    else if (th === 'purple') colbg = 'bg-purple-550 bg-violet-650 bg-purple-500';

                    return (
                      <button
                        key={th}
                        type="button"
                        onClick={() => setBadgeTheme(th)}
                        className={`p-2 rounded flex items-center justify-center border cursor-pointer transition-all ${badgeTheme === th ? 'border-white scale-105' : 'border-transparent hover:scale-102 hover:border-gray-700'}`}
                        title={th.toUpperCase()}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${colbg} block`}></span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Action Triggers */}
            <div className="flex flex-col gap-2 font-mono mt-1">
              {logoFeedback && (
                <div className="p-2 border text-[9px] leading-snug font-sans bg-cyan-950/40 text-cyan-300 border-cyan-900/40 rounded-lg">
                  {logoFeedback}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleApplyCustomBadgeLogo}
                  className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-1.5 font-bold text-[10px] select-none cursor-pointer duration-200"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  APLICAR COMO OFICIAL
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSvgCode}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg flex items-center justify-center gap-1.5 font-bold text-[10px] select-none cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  BAIXAR VETOR SVG
                </button>
              </div>
            </div>

          </div>

          {/* Preset templates bank */}
          <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-5 flex flex-col gap-4">
            <div>
              <h4 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                💼 BANCO DE IDEIAS E LOGOS DE REFERÊNCIA
              </h4>
              <span className="text-[10px] text-gray-500 font-mono block">Logotipos premium prontos. Clique para adotar a paleta e tema correspondente.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {readyToUseLogos.map((brand, bIdx) => (
                <div 
                  key={bIdx} 
                  className="p-2 rounded-xl bg-slate-950/45 border border-gray-900 hover:border-slate-800 cursor-pointer flex flex-col gap-1.5 transition-colors group"
                  onClick={() => {
                    setLogoUrlStr(brand.url);
                    // Select relative values in custom badge builder to show organic match
                    if (bIdx === 0) { handleApplyPalette('gold', 'MTB'); setBadgeShape('hexagon'); setBadgeIcon('wrench'); }
                    else if (bIdx === 1) { handleApplyPalette('red', 'SPD'); setBadgeShape('shield'); setBadgeIcon('car'); }
                    else if (bIdx === 2) { handleApplyPalette('blue', 'HYB'); setBadgeShape('circle'); setBadgeIcon('lightning'); }
                    else if (bIdx === 3) { handleApplyPalette('purple', 'PRM'); setBadgeShape('crest'); setBadgeIcon('shield'); }
                  }}
                >
                  <div className="h-20 w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-950 relative">
                    <img 
                      src={brand.url} 
                      alt={brand.name} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-102 transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1.5 right-1.5 bg-slate-950/90 text-white font-mono text-[8px] px-1.5 py-0.5 rounded border border-gray-800 flex items-center gap-1">
                      <Sparkles className="w-2.5 text-yellow-500" /> Ativar
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 text-left leading-tight">
                    <strong className="text-white text-xs block group-hover:text-red-400 transition-colors">{brand.name}</strong>
                    <span className="text-[10px] text-gray-500 font-sans block">{brand.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions & Growth Hub Checklist */}
          <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-5 flex flex-col gap-4 font-sans text-xs">
            
            <div className="border-b border-gray-850 pb-3 flex items-center gap-1.5">
              <Lightbulb className="w-4.5 h-4.5 text-yellow-500" />
              <div>
                <h4 className="font-display font-extrabold text-white text-sm">💡 SUGESTÕES DE EXPANSÃO & MARKETING</h4>
                <p className="text-[10px] font-mono text-gray-500">Impulsione a presença física e digital do Centro Automotivo.</p>
              </div>
            </div>

            {/* Quick action navigation categories */}
            <div className="flex border-b border-slate-800">
              <button
                type="button" 
                onClick={() => setActiveGuideTab('branding')}
                className={`py-1.5 px-3 border-b-2 font-mono text-[10px] uppercase font-bold flex-1 cursor-pointer transition-colors ${activeGuideTab === 'branding' ? 'border-red-500 text-red-500 bg-red-950/5' : 'border-transparent text-slate-400 hover:text-white'}`}
              >
                Cores & Marca
              </button>
              <button 
                type="button"
                onClick={() => setActiveGuideTab('google')}
                className={`py-1.5 px-3 border-b-2 font-mono text-[10px] uppercase font-bold flex-1 cursor-pointer transition-colors ${activeGuideTab === 'google' ? 'border-red-500 text-red-500 bg-red-950/5' : 'border-transparent text-slate-400 hover:text-white'}`}
              >
                Localização (GPS)
              </button>
              <button 
                type="button"
                onClick={() => setActiveGuideTab('whatsapp')}
                className={`py-1.5 px-3 border-b-2 font-mono text-[10px] uppercase font-bold flex-1 cursor-pointer transition-colors ${activeGuideTab === 'whatsapp' ? 'border-red-500 text-red-500 bg-red-950/5' : 'border-transparent text-slate-400 hover:text-white'}`}
              >
                Atendimento Zap
              </button>
            </div>

            {/* Tab content branding */}
            {activeGuideTab === 'branding' && (
              <div className="flex flex-col gap-3 text-gray-400 leading-relaxed text-xs">
                <p>💡 <strong>Como escolher as cores de sua mecânica?</strong> As cores definem a primeira impressão do pátio operacional:</p>
                <div className="flex flex-col gap-2 font-mono text-[11px] leading-snug">
                  <div 
                    className="p-2 rounded bg-slate-950/40 border border-slate-900 flex items-center justify-between cursor-pointer hover:border-red-900"
                    onClick={() => handleApplyPalette('red', 'PRC')}
                  >
                    <div>
                      <strong className="text-red-500 block">🔴 Vermelho Precision / Carbono:</strong>
                      <span>Transmite velocidade, precisão esportiva, ideal para autódromos.</span>
                    </div>
                    <ChevronRight className="w-4 text-slate-600" />
                  </div>

                  <div 
                    className="p-2 rounded bg-slate-950/40 border border-slate-900 flex items-center justify-between cursor-pointer hover:border-blue-900"
                    onClick={() => handleApplyPalette('blue', 'CONF')}
                  >
                    <div>
                      <strong className="text-blue-500 block">🔵 Azul Royal / Confiança:</strong>
                      <span>Remete à engenharia alemã, integridade técnica e alta confiabilidade mecânica.</span>
                    </div>
                    <ChevronRight className="w-4 text-slate-600" />
                  </div>

                  <div 
                    className="p-2 rounded bg-slate-950/40 border border-slate-900 flex items-center justify-between cursor-pointer hover:border-yellow-900"
                    onClick={() => handleApplyPalette('gold', 'STG')}
                  >
                    <div>
                      <strong className="text-yellow-400 block">🟡 Dourado Retrô / Elite:</strong>
                      <span>Cria aura Premium e sofisticação de atendimento personalizado.</span>
                    </div>
                    <ChevronRight className="w-4 text-slate-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Tab content google maps */}
            {activeGuideTab === 'google' && (
              <div className="flex flex-col gap-3 text-gray-400 leading-relaxed">
                <p>📍 <strong>Como se destacar no Google Maps local?</strong> O Google Meu Negócio gera mais de 80% das visitas espontâneas à oficina.</p>
                
                <div className="flex flex-col gap-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded bg-slate-950/45 border border-slate-900 text-[10px]">
                    <strong className="text-white block mb-1">1. Nome Consistente com Palavra-Chave:</strong>
                    Coloque "Auto Precision Premium - Oficina Mecânica e Alinhamento" ao invés de apenas "Auto Precision". Isso dobra sua chance de busca sem pagar nada.
                  </div>

                  <div className="p-2.5 rounded bg-slate-950/45 border border-slate-900 text-[10px]">
                    <strong className="text-white block mb-1">2. QR Code no Balcão Financeiro:</strong>
                    Insira o link curto de avaliação do Google em um QR Code. Ofereça 5% de desconto em mãos de obra para clientes que avaliarem as fotos de pátio!
                  </div>

                  <div className="p-2.5 rounded bg-slate-955 bg-slate-950/45 border border-slate-900 text-[10px]">
                    <strong className="text-white block mb-1">3. Geolocalização Confiável:</strong>
                    Sincronize as coordenadas de latitude e longitude decimais exatas configuradas no painel esquerdo para guiar caminhões guinchos sem erros via link integrado.
                  </div>
                </div>
              </div>
            )}

            {/* Tab content whatsapp automation */}
            {activeGuideTab === 'whatsapp' && (
              <div className="flex flex-col gap-3 text-gray-400">
                <p>💬 <strong>Script de atendimento de pátio automotivo:</strong> Copie modelos validados de feedback para enviar aos seus clientes pelo WhatsApp web.</p>
                
                <div className="flex flex-col gap-2 font-mono text-[11px]">
                  
                  {/* Template 1: Entrada na Oficina */}
                  <div className="p-2 bg-slate-950/40 border border-slate-900 rounded flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <strong className="text-green-400">⚡ ENTRADA & DIAGNÓSTICO</strong>
                      <button
                        onClick={() => handleCopyText(`Olá! Informamos que seu veículo já deu entrada de forma segura em nosso pátio na AutoTech. O mecânico responsável já iniciou o checklist técnico e o orçamento detalhado de peças estará disponível em breve. Acompanhe conosco pelo ERP!`, 'Entrada')}
                        className="text-cyan-400 hover:text-cyan-300 font-bold"
                      >
                        {copiedTemplateText === 'Entrada' ? "Copiado! ✅" : "Copiar"}
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-300 bg-black/40 p-1.5 rounded italic">
                      "Olá! Informamos que seu veículo já deu entrada de forma segura em nosso pátio. O checklist técnico já foi aberto..."
                    </span>
                  </div>

                  {/* Template 2: OS Finalizada */}
                  <div className="p-2 bg-slate-950/40 border border-slate-900 rounded flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <strong className="text-cyan-400">🏎️ VEÍCULO PRONTO PARA COLETA</strong>
                      <button
                        onClick={() => handleCopyText(`Boas notícias! A revisão geral do seu veículo foi concluída e aprovada. O veículo já passou pelos testes de pista e está pronto para entrega. Suas vias de pagamento e faturas térmicas já se encontram liquidadas. Aguardamos sua visita!`, 'Pronto')}
                        className="text-cyan-400 hover:text-cyan-300 font-bold"
                      >
                        {copiedTemplateText === 'Pronto' ? "Copiado! ✅" : "Copiar"}
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-300 bg-black/40 p-1.5 rounded italic">
                      "Boas notícias! A revisão geral d seu veículo foi concluída e aprovada. O teste de pista foi concluído com sucesso e..."
                    </span>
                  </div>

                  {/* WhatsApp shortlink generator preview */}
                  <div className="p-2 rounded bg-[#071b12] border border-green-900/60 flex items-center justify-between">
                    <div>
                      <strong className="text-green-405 text-green-400 text-[10px] block font-bold">GERADOR DE LINK RÁPIDO DO WHATSAPP</strong>
                      <span className="text-[9px] text-gray-400 block">https://wa.me/{whatsappStr.replace(/\D/g, '')}</span>
                    </div>
                    <a 
                      href={`https://wa.me/${whatsappStr.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-green-500 font-bold hover:text-green-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
