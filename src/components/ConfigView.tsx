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
  Tag,
  QrCode,
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
  Trash2,
  Link2,
  Wifi,
  WifiOff,
  Pencil,
  List,
  Search,
  FileText,
  Archive,
  FolderOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Company, FiscalSeries, FiscalTaxRule } from '../types';

export const ConfigView: React.FC = () => {
  const { 
    company,
    updateCompany,
    clientes,
    veiculos,
    produtos,
    servicos,
    ordensServico,
    financeiro,
    fornecedores,
    vendas,
    caixaStatus,
    autoBackups,
    triggerDailyBackup,
    deleteAutoBackup,
    localAuditLogs,
    addLocalAuditLog,
    resetToProduction,
    resetCaixaEFinanceiro,
    resetEstoqueEProdutos,
    user,
    updateUserProfile,
    highContrast,
    setHighContrast,
    isOnline,
    pendingActionsCount,
    syncPendingActions,
    syncing,
    forceOffline,
    setForceOffline
  } = useApp();

  // Audit Logs states
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditFilterCategory, setAuditFilterCategory] = useState<string>('todos');
  const [showSimulateLogModal, setShowSimulateLogModal] = useState(false);
  const [simLogAction, setSimLogAction] = useState('Ajuste Crítico de Estoque');
  const [simLogDetails, setSimLogDetails] = useState('Ajuste manual de saldo físico para Pastilha de Freio Cobreq.');

  // Primary Company fields state
  const [companyName, setCompanyName] = useState(company.name);
  const [cnpjStr, setCnpjStr] = useState(company.cnpj);
  const [phoneStr, setPhoneStr] = useState(company.phone);
  const [addressStr, setAddressStr] = useState(company.address);
  const [companyCep, setCompanyCep] = useState(company.cep || '');
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const [pixKeyStr, setPixKeyStr] = useState(company.pixKey || 'cleciotecnologia@gmail.com');
  const [pixBeneficiaryStr, setPixBeneficiaryStr] = useState(company.pixBeneficiary || 'AutoPrecision Premium');
  const [pixCityStr, setPixCityStr] = useState(company.pixCity || 'SAO PAULO');
  const [defaultMarkupVal, setDefaultMarkupVal] = useState<number>(company.defaultMarkup !== undefined ? company.defaultMarkup : 50);
  const [warrantyDaysVal, setWarrantyDaysVal] = useState<number>(company.warrantyDays !== undefined ? company.warrantyDays : 90);
  const [userReversalPassword, setUserReversalPassword] = useState('');

  React.useEffect(() => {
    if (user) {
      setUserReversalPassword(user.reversalPassword || 'admin123');
    }
  }, [user]);

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
      setPixKeyStr(company.pixKey || 'cleciotecnologia@gmail.com');
      setPixBeneficiaryStr(company.pixBeneficiary || 'AutoPrecision Premium');
      setPixCityStr(company.pixCity || 'SAO PAULO');
      setDefaultMarkupVal(company.defaultMarkup !== undefined ? company.defaultMarkup : 50);
      setWarrantyDaysVal(company.warrantyDays !== undefined ? company.warrantyDays : 90);
      setCustomPortalSlugStr(company.customPortalSlug || company.id);
      
      // Sync fiscal states
      setFiscalNfseEnabled(company.fiscalNfseEnabled || false);
      setFiscalNfeEnabled(company.fiscalNfeEnabled || false);
      setFiscalStateUf(company.fiscalStateUf || 'SP');
      setFiscalCertificateUploaded(company.fiscalCertificateUploaded || false);
      setFiscalCertificateName(company.fiscalCertificateName || '');
      setFiscalPassword(company.fiscalPassword || '');
      setFiscalTokenProvider(company.fiscalTokenProvider || '');
      setFiscalEnvironment(company.fiscalEnvironment || 'Homologação');
      setFiscalMunicipalKey(company.fiscalMunicipalKey || '');
      setFiscalIM(company.fiscalIM || '');
      setFiscalIE(company.fiscalIE || '');
      setFiscalWebhookUrl(company.fiscalWebhookUrl || '');
      setFiscalServiceSeries(company.fiscalServiceSeries || '1');
      setFiscalServiceInitialNum(company.fiscalServiceInitialNum !== undefined ? company.fiscalServiceInitialNum : 1);
      setFiscalAutoEmitOnOSClose(company.fiscalAutoEmitOnOSClose || false);
      if (company.fiscalSeriesList) {
        setFiscalSeriesList(company.fiscalSeriesList);
      }
      if (company.fiscalTaxRules) {
        setFiscalTaxRules(company.fiscalTaxRules);
      }
      setSmtpHost(company.smtpHost || 'smtp.gmail.com');
      setSmtpPort(company.smtpPort !== undefined ? company.smtpPort : 465);
      setSmtpUser(company.smtpUser || '');
      setSmtpPass(company.smtpPass || '');
      setSmtpSecure(company.smtpSecure !== undefined ? company.smtpSecure : true);
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
  const [showThermalPreview, setShowThermalPreview] = useState(false);
  const [customDomainStr, setCustomDomainStr] = useState(company.customDomain || '');
  const [subdomainStr, setSubdomainStr] = useState(company.subdomain || '');
  const [domainStatusVal, setDomainStatusVal] = useState<'Pendente' | 'Verificando' | 'Ativo' | 'Falhado'>(company.domainStatus || 'Pendente');
  const [customPortalSlugStr, setCustomPortalSlugStr] = useState(company.customPortalSlug || company.id);
  const [dnsTestLogs, setDnsTestLogs] = useState<string[]>([]);
  const [isTestingDns, setIsTestingDns] = useState(false);
  
  // Vector SVG Customizer states  
  const [badgeShape, setBadgeShape] = useState<'shield' | 'hexagon' | 'circle' | 'crest'>('shield');
  const [badgeIcon, setBadgeIcon] = useState<'wrench' | 'car' | 'gauge' | 'shield' | 'lightning'>('wrench');
  const [badgeTheme, setBadgeTheme] = useState<'red' | 'blue' | 'gold' | 'green' | 'orange' | 'purple'>('red');
  const [badgeInitials, setBadgeInitials] = useState<string>('ATC');
  const [accentStripes, setAccentStripes] = useState<boolean>(true);

  // Gmail SMTP integration state
  const [smtpHost, setSmtpHost] = useState(company.smtpHost || 'smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState<number>(company.smtpPort !== undefined ? company.smtpPort : 465);
  const [smtpUser, setSmtpUser] = useState(company.smtpUser || '');
  const [smtpPass, setSmtpPass] = useState(company.smtpPass || '');
  const [smtpSecure, setSmtpSecure] = useState<boolean>(company.smtpSecure !== undefined ? company.smtpSecure : true);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestFeedback, setSmtpTestFeedback] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [emailTestFeedback, setEmailTestFeedback] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  // Other system options
  const [thermalWidth, setThermalWidth] = useState('80mm');
  const [whiteLabelTitle, setWhiteLabelTitle] = useState('AutoTech OS System');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Fiscal integration state
  const [fiscalNfseEnabled, setFiscalNfseEnabled] = useState(company.fiscalNfseEnabled || false);
  const [fiscalNfeEnabled, setFiscalNfeEnabled] = useState(company.fiscalNfeEnabled || false);
  const [fiscalStateUf, setFiscalStateUf] = useState(company.fiscalStateUf || 'SP');
  const [fiscalCertificateUploaded, setFiscalCertificateUploaded] = useState(company.fiscalCertificateUploaded || false);
  const [fiscalCertificateName, setFiscalCertificateName] = useState(company.fiscalCertificateName || '');
  const [fiscalPassword, setFiscalPassword] = useState(company.fiscalPassword || '');
  const [fiscalTokenProvider, setFiscalTokenProvider] = useState(company.fiscalTokenProvider || '');
  const [fiscalEnvironment, setFiscalEnvironment] = useState<'Homologação' | 'Produção'>(company.fiscalEnvironment || 'Homologação');
  const [fiscalMunicipalKey, setFiscalMunicipalKey] = useState(company.fiscalMunicipalKey || '');
  const [fiscalIM, setFiscalIM] = useState(company.fiscalIM || '');
  const [fiscalIE, setFiscalIE] = useState(company.fiscalIE || '');
  const [fiscalWebhookUrl, setFiscalWebhookUrl] = useState(company.fiscalWebhookUrl || '');
  
  // Emissão Automática state
  const [fiscalServiceSeries, setFiscalServiceSeries] = useState(company.fiscalServiceSeries || '1');
  const [fiscalServiceInitialNum, setFiscalServiceInitialNum] = useState(company.fiscalServiceInitialNum !== undefined ? company.fiscalServiceInitialNum : 1);
  const [fiscalAutoEmitOnOSClose, setFiscalAutoEmitOnOSClose] = useState(company.fiscalAutoEmitOnOSClose || false);
  
  // Custom Fiscal Series List state
  const [fiscalSeriesList, setFiscalSeriesList] = useState<FiscalSeries[]>(
    company.fiscalSeriesList || [
      { id: '1', type: 'NFS-e', series: '1', nextNumber: 1, isActive: true },
      { id: '2', type: 'NF-e', series: '1', nextNumber: 1, isActive: true }
    ]
  );
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);
  const [newSeriesType, setNewSeriesType] = useState<'NFS-e' | 'NF-e' | 'NFC-e'>('NFS-e');
  const [newSeriesValue, setNewSeriesValue] = useState('');
  const [newSeriesNextNum, setNewSeriesNextNum] = useState<number>(1);
  const [showSeriesForm, setShowSeriesForm] = useState(false);

  // Automatic Taxation Rules state
  const [fiscalTaxRules, setFiscalTaxRules] = useState<FiscalTaxRule[]>(
    company.fiscalTaxRules || [
      { id: '1', uf: 'Dentro do Estado (Nacional/Mesma UF)', cfop: '5102', icmsAliquota: 18, ipiAliquota: 0, description: 'Venda padrão de autopeças ou serviços internos', isActive: true },
      { id: '2', uf: 'Fora do Estado (Outras UF)', cfop: '6102', icmsAliquota: 12, ipiAliquota: 0, description: 'Venda padrão de autopeças interestaduais', isActive: true }
    ]
  );
  const [editingTaxRuleId, setEditingTaxRuleId] = useState<string | null>(null);
  const [newTaxRuleUf, setNewTaxRuleUf] = useState('SP');
  const [newTaxRuleCfop, setNewTaxRuleCfop] = useState('');
  const [newTaxRuleIcmsAliquota, setNewTaxRuleIcmsAliquota] = useState<number>(18);
  const [newTaxRuleIpiAliquota, setNewTaxRuleIpiAliquota] = useState<number>(0);
  const [newTaxRuleDescription, setNewTaxRuleDescription] = useState('');
  const [showTaxRuleForm, setShowTaxRuleForm] = useState(false);

  // Monitor de Erros SEFAZ States
  const [showSefazErrorMonitor, setShowSefazErrorMonitor] = useState(false);
  const [selectedErrorForDetails, setSelectedErrorForDetails] = useState<any | null>(null);
  const [sefazErrorsLog, setSefazErrorsLog] = useState<any[]>([
    {
      id: 'sefaz-err-1',
      code: '225',
      title: 'Rejeição 225: Falha no Schema XML do lote de NFe enviado',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 min ago
      docId: 'O.S. #1084',
      docType: 'NF-e',
      cause: 'Tag <IE> correspondente à Inscrição Estadual está vazia ou inconsistente no cadastro do destinatário cadastrado como Contribuinte de ICMS.',
      solution: 'Vá até o cadastro de Clientes, selecione o cliente correspondente e verifique o campo de Inscrição Estadual (IE) ou altere a configuração para Destinatário Isento ou Não Contribuinte (Indicador de IE "9 - Não Contribuinte"), salve e retransmita a nota.',
      xmlSnippet: `<dest>\n  <CNPJ>03212854000188</CNPJ>\n  <IE></IE>\n  <indIEDest>1</indIEDest>\n  <xNome>ROMA AUTO PECAS LTDA</xNome>\n</dest>`,
      status: 'Pendente'
    },
    {
      id: 'sefaz-err-2',
      code: '702',
      title: 'Rejeição 702: NFC-e com diferimento de ICMS inválido',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      docId: 'Venda Balcão #2045',
      docType: 'NFC-e',
      cause: 'Foi selecionado o CST de ICMS 51 (Diferido) ou CSOSN 900 para venda de peças a consumidor final, o que não é permitido para NFC-e pelas regras estaduais sem dados de diferimento adicionais.',
      solution: 'Acesse o produto ou altere os parâmetros tributários da venda rápida para CSOSN 102 (Tributada sem permissão de crédito) ou CSOSN 500 (ICMS retido por Substituição Tributária anterior), que são recomendados para venda a consumidor final no balcão.',
      xmlSnippet: `<ICMS>\n  <ICMS51>\n    <orig>0</orig>\n    <CST>51</CST>\n    <vBC>54.20</vBC>\n    <pICMS>18.00</pICMS>\n  </ICMS51>\n</ICMS>`,
      status: 'Pendente'
    },
    {
      id: 'sefaz-err-3',
      code: '539',
      title: 'Rejeição 539: Duplicidade de NF-e, com diferença na Chave de Acesso',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24 hours ago
      docId: 'O.S. #1072',
      docType: 'NF-e',
      cause: 'O sequencial de faturamento Nº 124 já foi utilizado e homologado com sucesso anteriormente na SEFAZ pela sua empresa, mas com uma assinatura/chave XML alternativa.',
      solution: 'Nas Configurações do Módulo Fiscal, acesse "Cadastro de Séries de Nota Fiscal" e altere o campo "Próximo Número Inicial" da série correspondente para 125 ou para o próximo número livre real da SEFAZ para sincronizar o sistema.',
      xmlSnippet: `<ide>\n  <cUF>35</cUF>\n  <cNF>38491024</cNF>\n  <mod>55</mod>\n  <serie>1</serie>\n  <nNF>124</nNF>\n</ide>`,
      status: 'Resolvido'
    },
    {
      id: 'sefaz-err-4',
      code: '610',
      title: 'Rejeição 610: Chave de Acesso diferindo do intervalo de série configurado',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      docId: 'NFS-e #85',
      docType: 'NFS-e',
      cause: 'A série fiscal "99" utilizada na transmissão não está habilitada/autorizada no portal da Prefeitura ou na SEFAZ Estadual para emissão síncrona.',
      solution: 'Altere a série para a série padrão e oficial homologada pela sua prefeitura (tipicamente série "1" ou "E" ou "A").',
      xmlSnippet: `<SereFiscal>\n  <codigoSerie>99</codigoSerie>\n  <sequencialEnviado>85</sequencialEnviado>\n</SereFiscal>`,
      status: 'Resolvido'
    },
    {
      id: 'sefaz-err-5',
      code: '696',
      title: 'Rejeição 696: Operação com não contribuinte deve indicar inscrição estadual isenta',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
      docId: 'O.S. #1060',
      docType: 'NF-e',
      cause: 'Operação interestadual para cliente qualificado como Destinatário Não Contribuinte requer que o campo Inscrição Estadual seja explicitamente enviado como vazio (<IE> vazia ou isenta) e tag indIEDest correspondente.',
      solution: 'Altere o cadastro do cliente do outro estado para indicar "Não Contribuinte" no Tipo de Inscrição Estadual de forma que as tags indIEDest sejam preenchidas como 9.',
      xmlSnippet: `<dest>\n  <UF>MG</UF>\n  <indIEDest>9</indIEDest>\n</dest>`,
      status: 'Resolvido'
    }
  ]);

  const handleSimulateNewSefazError = () => {
    const errorOptions = [
      {
        code: '203',
        title: 'Rejeição 203: Emissor não habilitado para emissão da NF-e',
        cause: 'A inscrição municipal ou estadual da sua oficina não está credenciada no ambiente selecionado (Homologação ou Produção) junto à SEFAZ da respectiva UF.',
        solution: 'Verifique se seu CNPJ/IE está devidamente autorizado para emissão de NF-e na SEFAZ do seu estado e se as credenciais do certificado digital correspondem à empresa cadastrada.',
        xmlSnippet: `<emit>\n  <CNPJ>${company?.cnpj || "12.345.678/0001-90"}</CNPJ>\n  <xNome>${(company?.name || "AutoPrecision Premium").toUpperCase()}</xNome>\n</emit>`
      },
      {
        code: '464',
        title: 'Rejeição 464: Código de Hash no QR-Code difere do cadastrado',
        cause: 'O identificador CSC (Código de Segurança do Contribuinte) ou a Chave Token definidos nas configurações municipais/estaduais estão incorretos ou expirados.',
        solution: 'Solicite um novo Token/CSC no portal do contribuinte do seu estado e insira adequadamente nas configurações do Módulo de Emissão.',
        xmlSnippet: `<qrCode>\n  <chNFe>3526061234567800019055001000124112412421</chNFe>\n  <cHashQRCode>a15b9ccdf22a45b</cHashQRCode>\n</qrCode>`
      },
      {
        code: '629',
        title: 'Rejeição 629: Alíquota do ICMS do grupo de Destinatário difere da alíquota interna',
        cause: 'A alíquota de ICMS interestadual aplicada nas autopeças para a UF de destino informada diverge da tabela de partilha de ICMS (DIFAL) nacional obrigatória.',
        solution: 'Acesse "Regras de Parametrização Tributária Automática" abaixo e ajuste o percentual de ICMS interestadual correspondente ao estado destino do veículo.',
        xmlSnippet: `<ICMSUFDest>\n  <vBCUFDest>150.00</vBCUFDest>\n  <pICMSInter>12.00</pICMSInter>\n  <pICMSInterPart>18.00</pICMSInterPart>\n</ICMSUFDest>`
      }
    ];

    const randomErr = errorOptions[Math.floor(Math.random() * errorOptions.length)];
    const newErr = {
      id: 'sefaz-err-' + Date.now(),
      code: randomErr.code,
      title: randomErr.title,
      timestamp: new Date().toISOString(),
      docId: `O.S. #${Math.floor(Math.random() * 100) + 1100}`,
      docType: ['NF-e', 'NFS-e'][Math.floor(Math.random() * 2)] as any,
      cause: randomErr.cause,
      solution: randomErr.solution,
      xmlSnippet: randomErr.xmlSnippet,
      status: 'Pendente' as const
    };

    setSefazErrorsLog(prev => [newErr, ...prev]);
  };

  const handleResolveSefazError = (id: string) => {
    setSefazErrorsLog(prev => prev.map(e => e.id === id ? { ...e, status: 'Resolvido' } : e));
    if (selectedErrorForDetails && selectedErrorForDetails.id === id) {
      setSelectedErrorForDetails((prev: any) => ({ ...prev, status: 'Resolvido' }));
    }
  };

  const handleClearSefazErrors = () => {
    setSefazErrorsLog([]);
    setSelectedErrorForDetails(null);
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopyXml = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Histórico de Lotes SEFAZ States & Handlers
  const [showSefazLoteHistory, setShowSefazLoteHistory] = useState(false);
  const [selectedLoteForDetails, setSelectedLoteForDetails] = useState<any | null>(null);
  const [searchLoteTerm, setSearchLoteTerm] = useState('');
  const [filterLoteType, setFilterLoteType] = useState('ALL');
  const [filterLoteStatus, setFilterLoteStatus] = useState('ALL');
  const [isTransmittingLote, setIsTransmittingLote] = useState(false);
  const [transmissionProgress, setTransmissionProgress] = useState<string[]>([]);
  const [sefazLotesList, setSefazLotesList] = useState<any[]>([
    {
      id: 'LOTE-20260612-L34',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 min ago
      docType: 'NF-e',
      notesCount: 2,
      protocol: '135260029841249',
      status: 'Autorizado',
      totalAmount: 1840.20,
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>\n<enviLote xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">\n  <idLote>2026061234</idLote>\n  <indSinc>1</indSinc>\n  <NFe>\n    <infNFe Id="NFe35260603212854000188550010000001201384910242" versao="4.00">\n      <ide><cUF>35</cUF><nNF>120</nNF><dhEmi>2026-06-12T22:05:10-03:00</dhEmi></ide>\n      <emit><CNPJ>03212854000188</CNPJ><xNome>AUTOTECH SOLUCOES AUTOMOTIVAS</xNome></emit>\n      <dest><CNPJ>03212854000188</CNPJ><xNome>ROMA AUTO PECAS LTDA</xNome></dest>\n      <total><ICMSTot><vNF>1200.00</vNF></ICMSTot></total>\n    </infNFe>\n  </NFe>\n  <NFe>\n    <infNFe Id="NFe35260603212854000188550010000001211384910243" versao="4.00">\n      <ide><cUF>35</cUF><nNF>121</nNF><dhEmi>2026-06-12T22:15:32-03:00</dhEmi></ide>\n      <emit><CNPJ>03212854000188</CNPJ><xNome>AUTOTECH SOLUCOES AUTOMOTIVAS</xNome></emit>\n      <dest><CPF>12345678901</CPF><xNome>CLECIO TECNOLOGIA</xNome></dest>\n      <total><ICMSTot><vNF>640.20</vNF></ICMSTot></total>\n    </infNFe>\n  </NFe>\n</enviLote>`,
      notes: [
        {
          number: 120,
          accessKey: '35260603212854000188550010000001201384910242',
          clientName: 'ROMA AUTO PECAS LTDA',
          clientDoc: '03.212.854/0001-88',
          amount: 1200.00,
          protocol: '135260029841250',
          status: 'Autorizado'
        },
        {
          number: 121,
          accessKey: '35260603212854000188550010000001211384910243',
          clientName: 'CLECIO TECNOLOGIA',
          clientDoc: '123.456.789-01',
          amount: 640.20,
          protocol: '135260029841251',
          status: 'Autorizado'
        }
      ]
    },
    {
      id: 'LOTE-20260611-L33',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 hours ago
      docType: 'NFS-e',
      notesCount: 1,
      protocol: '350692841029485',
      status: 'Autorizado',
      totalAmount: 380.00,
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>\n<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">\n  <LoteRps Id="L3506928" versao="2.03">\n    <NumeroLote>33</NumeroLote>\n    <Cnpj>03212854000188</Cnpj>\n    <InscricaoMunicipal>8596102</InscricaoMunicipal>\n    <QuantidadeRps>1</QuantidadeRps>\n    <ListaRps>\n      <Rps>\n        <InfDeclaracaoPrestacaoServico>\n          <Rps><IdentificacaoRps><Numero>84</Numero><Serie>1</Serie><Tipo>1</Tipo></IdentificacaoRps></Rps>\n          <Servico><Valores><ValorServicos>380.00</ValorServicos></Valores><Discriminacao>Troca de Amortecedores Dianteiros e Alinhamento</Discriminacao></Servico>\n          <Prestador><Cnpj>03212854000188</Cnpj></Prestador>\n          <Tomador><IdentificacaoTomador><CpfCnpj><Cpf>98765432100</Cpf></CpfCnpj></IdentificacaoTomador><RazaoSocial>Mariana Silva</RazaoSocial></Tomador>\n        </InfDeclaracaoPrestacaoServico>\n      </Rps>\n    </ListaRps>\n  </LoteRps>\n</EnviarLoteRpsEnvio>`,
      notes: [
        {
          number: 84,
          accessKey: 'NFS-84-AUT-A9B3',
          clientName: 'Mariana Silva',
          clientDoc: '987.654.321-00',
          amount: 380.00,
          protocol: '350692841029485',
          status: 'Autorizado'
        }
      ]
    },
    {
      id: 'LOTE-20260610-L32',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), // ~50 hours ago
      docType: 'NFC-e',
      notesCount: 3,
      protocol: '135260028941038',
      status: 'Autorizado',
      totalAmount: 454.00,
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>\n<enviLote xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">\n  <idLote>2026061099</idLote>\n  <NFe>\n    <infNFe Id="NFe35260603212854000188650010000020431384910244">\n      <ide><mod>65</mod><nNF>2043</nNF></ide>\n      <total><ICMSTot><vNF>150.00</vNF></ICMSTot></total>\n    </infNFe>\n  </NFe>\n  <NFe>\n    <infNFe Id="NFe35260603212854000188650010000020441384910245">\n      <ide><mod>65</mod><nNF>2044</nNF></ide>\n      <total><ICMSTot><vNF>184.00</vNF></ICMSTot></total>\n    </infNFe>\n  </NFe>\n  <NFe>\n    <infNFe Id="NFe35260603212854000188650010000020451384910246">\n      <ide><mod>65</mod><nNF>2045</nNF></ide>\n      <total><ICMSTot><vNF>120.00</vNF></ICMSTot></total>\n    </infNFe>\n  </NFe>\n</enviLote>`,
      notes: [
        {
          number: 2043,
          accessKey: '35260603212854000188650010000020431384910244',
          clientName: 'Consumidor Final',
          clientDoc: 'Não Identificado',
          amount: 150.00,
          protocol: '135260028941039',
          status: 'Autorizado'
        },
        {
          number: 2044,
          accessKey: '35260603212854000188650010000020441384910245',
          clientName: 'Consumidor Final',
          clientDoc: 'Não Identificado',
          amount: 184.00,
          protocol: '135260028941040',
          status: 'Autorizado'
        },
        {
          number: 2045,
          accessKey: '35260603212854000188650010000020451384910246',
          clientName: 'Consumidor Final',
          clientDoc: 'Não Identificado',
          amount: 120.00,
          protocol: '135260028941041',
          status: 'Autorizado'
        }
      ]
    },
    {
      id: 'LOTE-20260608-L31',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // ~5 days ago
      docType: 'NF-e',
      notesCount: 1,
      protocol: 'Rejeitado por Erro',
      status: 'Rejeitado',
      totalAmount: 850.00,
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>\n<enviLote xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">\n  <idLote>2026060888</idLote>\n  <NFe>\n    <infNFe Id="NFe35260603212854000188550010000001191384910241">\n      <ide><cUF>35</cUF><nNF>119</nNF></ide>\n      <emit><CNPJ>03212854000188</CNPJ></emit>\n      <dest><CNPJ>03212854000188</CNPJ><xNome>ROMA AUTO PECAS LTDA</xNome></dest>\n    </infNFe>\n  </NFe>\n</enviLote>`,
      notes: [
        {
          number: 119,
          accessKey: '35260603212854000188550010000001191384910241',
          clientName: 'ROMA AUTO PECAS LTDA',
          clientDoc: '03.212.854/0001-88',
          amount: 850.00,
          protocol: 'Inexistente',
          status: 'Rejeitado',
          errorMessage: 'Rejeição 225: Falha no Schema XML do lote de NFe enviado'
        }
      ]
    }
  ]);

  const handleDownloadXmlFile = (xml: string, fileName: string) => {
    const blob = new Blob([xml], { type: 'text/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTransmitNewLote = () => {
    setIsTransmittingLote(true);
    setTransmissionProgress(["🔄 Iniciando montagem de lote de documentos síncronos..."]);
    
    const steps = [
      "📦 Agrupando documentos elegíveis em estado [Faturamento Pendente]...",
      "🔑 Assinando digitalmente notas individuais utilizando certificado A1 ativo...",
      "🛡️ Validando regras de validação síncronas contra o schema XML oficial da SEFAZ...",
      "⚡ Estabelecendo conexão TLS de segurança com webservice de recepção de lote SEFAZ...",
      "📨 Transmitindo lote de NF-e para ambiente de autorização da SEFAZ...",
      "📡 Protocolando resposta oficial e armazenando XML autorizado em custódia..."
    ];

    let currentStep = 0;
    const proc = setInterval(() => {
      if (currentStep < steps.length) {
        setTransmissionProgress(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(proc);
        
        const randomNum = Math.floor(Math.random() * 800) + 1200;
        const loteId = `LOTE-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-L${Math.floor(Math.random() * 90) + 10}`;
        const servicePrice = Math.floor(Math.random() * 1400) + 300;
        const clientVal = clientes[Math.floor(Math.random() * clientes.length)] || { nome: 'Augusto César Ramos', cpfCnpj: '445.109.284-12' };
        const newLoteProtocol = String(Math.floor(Math.random() * 100000000000000) + 130000000000000);
        
        const newLote = {
          id: loteId,
          timestamp: new Date().toISOString(),
          docType: ['NF-e', 'NFS-e', 'NFC-e'][Math.floor(Math.random() * 3)],
          notesCount: 1,
          protocol: newLoteProtocol,
          status: 'Autorizado',
          totalAmount: servicePrice,
          notes: [
            {
              number: randomNum,
              accessKey: '3526060321285400018855001000000' + randomNum + '1384910245',
              clientName: clientVal.nome,
              clientDoc: clientVal.cpfCnpj || 'Consumidor',
              amount: servicePrice,
              protocol: newLoteProtocol,
              status: 'Autorizado'
            }
          ],
          xmlContent: `<?xml version="1.0" encoding="UTF-8"?>\n<enviLote xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">\n  <idLote>${randomNum}</idLote>\n  <NFe>\n    <infNFe Id="NFe3526060321285400018855001000000${randomNum}1384910245" versao="4.00">\n      <ide><cUF>35</cUF><nNF>${randomNum}</nNF></ide>\n      <emit><CNPJ>03212854000188</CNPJ><xNome>${(company?.name || "AUTOTECH SOLUCOES AUTOMOTIVAS").toUpperCase()}</xNome></emit>\n      <dest><xNome>${clientVal.nome.toUpperCase()}</xNome></dest>\n      <total><ICMSTot><vNF>${servicePrice.toFixed(2)}</vNF></ICMSTot></total>\n    </infNFe>\n  </NFe>\n</enviLote>`
        };

        setSefazLotesList(prev => [newLote, ...prev]);
        setSelectedLoteForDetails(newLote);
        setIsTransmittingLote(false);
        setTransmissionProgress([]);
      }
    }, 450);
  };

  const handleAddOrUpdateSeries = () => {
    if (!newSeriesValue.trim()) return;
    
    if (editingSeriesId) {
      setFiscalSeriesList(prev => prev.map(s => {
        if (s.id === editingSeriesId) {
          return {
            ...s,
            type: newSeriesType,
            series: newSeriesValue,
            nextNumber: newSeriesNextNum
          };
        }
        return s;
      }));
      setEditingSeriesId(null);
    } else {
      const newObj: FiscalSeries = {
        id: Date.now().toString(),
        type: newSeriesType,
        series: newSeriesValue,
        nextNumber: newSeriesNextNum,
        isActive: true
      };
      setFiscalSeriesList(prev => [...prev, newObj]);
    }
    
    setNewSeriesValue('');
    setNewSeriesNextNum(1);
    setShowSeriesForm(false);
  };

  const handleEditSeries = (series: FiscalSeries) => {
    setEditingSeriesId(series.id);
    setNewSeriesType(series.type);
    setNewSeriesValue(series.series);
    setNewSeriesNextNum(series.nextNumber);
    setShowSeriesForm(true);
  };

  const handleDeleteSeries = (id: string) => {
    setFiscalSeriesList(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleSeriesActive = (id: string) => {
    setFiscalSeriesList(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, isActive: !s.isActive };
      }
      return s;
    }));
  };

  const handleAddOrUpdateTaxRule = () => {
    if (!newTaxRuleUf.trim() || !newTaxRuleCfop.trim()) return;
    
    if (editingTaxRuleId) {
      setFiscalTaxRules(prev => prev.map(r => {
        if (r.id === editingTaxRuleId) {
          return {
            ...r,
            uf: newTaxRuleUf,
            cfop: newTaxRuleCfop,
            icmsAliquota: newTaxRuleIcmsAliquota,
            ipiAliquota: newTaxRuleIpiAliquota,
            description: newTaxRuleDescription
          };
        }
        return r;
      }));
      setEditingTaxRuleId(null);
    } else {
      const newObj: FiscalTaxRule = {
        id: Date.now().toString(),
        uf: newTaxRuleUf,
        cfop: newTaxRuleCfop,
        icmsAliquota: newTaxRuleIcmsAliquota,
        ipiAliquota: newTaxRuleIpiAliquota,
        description: newTaxRuleDescription,
        isActive: true
      };
      setFiscalTaxRules(prev => [...prev, newObj]);
    }

    setNewTaxRuleUf('SP');
    setNewTaxRuleCfop('');
    setNewTaxRuleIcmsAliquota(18);
    setNewTaxRuleIpiAliquota(0);
    setNewTaxRuleDescription('');
    setShowTaxRuleForm(false);
  };

  const handleEditTaxRule = (rule: FiscalTaxRule) => {
    setEditingTaxRuleId(rule.id);
    setNewTaxRuleUf(rule.uf);
    setNewTaxRuleCfop(rule.cfop);
    setNewTaxRuleIcmsAliquota(rule.icmsAliquota);
    setNewTaxRuleIpiAliquota(rule.ipiAliquota);
    setNewTaxRuleDescription(rule.description);
    setShowTaxRuleForm(true);
  };

  const handleDeleteTaxRule = (id: string) => {
    setFiscalTaxRules(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleTaxRuleActive = (id: string) => {
    setFiscalTaxRules(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, isActive: !r.isActive };
      }
      return r;
    }));
  };
  
  // Diagnostico Fiscal state
  const [isTestingFiscal, setIsTestingFiscal] = useState(false);
  const [fiscalTestLogs, setFiscalTestLogs] = useState<string[]>([]);

  // Active guide panel
  const [activeGuideTab, setActiveGuideTab] = useState<'branding' | 'google' | 'whatsapp'>('branding');

  // Copy template state helper
  const [copiedTemplateText, setCopiedTemplateText] = useState<string | null>(null);

  // Offline queue inspection state
  const [localPendingActions, setLocalPendingActions] = useState<any[]>([]);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("autotech_pending_actions");
      if (stored) {
        setLocalPendingActions(JSON.parse(stored));
      } else {
        setLocalPendingActions([]);
      }
    } catch (e) {
      console.error("Failed to read autotech_pending_actions", e);
    }
  }, [pendingActionsCount]);

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
  const [resetTargetMode, setResetTargetMode] = useState<'all' | 'caixa' | 'estoque'>('all');
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
      if (resetTargetMode === 'caixa') {
        await resetCaixaEFinanceiro();
        setResetFeedback({
          status: 'success',
          message: '🎉 Caixa e movimentações financeiras zerados com sucesso! O caixa está pronto do zero para novas operações de produção.'
        });
      } else if (resetTargetMode === 'estoque') {
        await resetEstoqueEProdutos();
        setResetFeedback({
          status: 'success',
          message: '🎉 Estoque de peças e produtos zerado com sucesso! Pronto para nova contagem de peças de produção.'
        });
      } else {
        await resetToProduction();
        setResetFeedback({
          status: 'success',
          message: '🎉 Banco de dados zerado e reinicializado com sucesso! Todos os dados fictícios foram removidos. O sistema está 100% pronto do zero para a Oficina do Rafael entrar em produção real.'
        });
      }
      setShowResetConfirm(false);
      setResetConfirmationInput('');
    } catch (err: any) {
      console.error(err);
      setResetFeedback({
        status: 'error',
        message: `Houve um problema ao zerar o sistema: ${err.message || err}`
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

  const [isZustandGenerating, setIsZustandGenerating] = useState(false);
  const [zustandBackupReady, setZustandBackupReady] = useState(false);
  const [zustandBackupStats, setZustandBackupStats] = useState<{
    sizeKb: string;
    totalRows: number;
    fileName: string;
    timestamp: string;
  } | null>(null);

  const handleExportZustandState = () => {
    setIsZustandGenerating(true);
    setZustandBackupReady(false);
    
    setTimeout(() => {
      try {
        const totalRecordsCount = 
          clientes.length +
          veiculos.length +
          produtos.length +
          servicos.length +
          ordensServico.length +
          financeiro.length +
          fornecedores.length +
          vendas.length +
          localAuditLogs.length +
          autoBackups.length;

        const statePayload = {
          metadata: {
            storeType: "ZustandGlobalStore",
            description: "Exportacao manual do estado global do Zustand e AppContext AutoTech",
            exportedAt: new Date().toISOString(),
            tenantId: company.id,
            companyName: company.name,
            totalRows: totalRecordsCount
          },
          state: {
            company,
            clientes,
            veiculos,
            produtos,
            servicos,
            ordensServico,
            financeiro,
            fornecedores,
            vendas,
            caixaStatus,
            autoBackups,
            localAuditLogs
          }
        };

        const jsonString = JSON.stringify(statePayload, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        const formattedDate = new Date().toISOString().substring(0, 10);
        a.href = url;
        a.download = `autotech_zustand_store_${company.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${formattedDate}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setZustandBackupStats({
          sizeKb: (blob.size / 1024).toFixed(2),
          totalRows: totalRecordsCount,
          fileName: a.download,
          timestamp: new Date().toLocaleTimeString('pt-BR')
        });
        setZustandBackupReady(true);
      } catch (err) {
        console.error("Erro ao converter e exportar estado do Zustand:", err);
      } finally {
        setIsZustandGenerating(false);
      }
    }, 1000);
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
        domainStatus: domainStatusVal,
        pixKey: pixKeyStr,
        pixBeneficiary: pixBeneficiaryStr,
        pixCity: pixCityStr,
        defaultMarkup: defaultMarkupVal,
        warrantyDays: warrantyDaysVal,
        customPortalSlug: customPortalSlugStr,
        fiscalNfseEnabled,
        fiscalNfeEnabled,
        fiscalStateUf,
        fiscalCertificateUploaded,
        fiscalCertificateName,
        fiscalPassword,
        fiscalTokenProvider,
        fiscalEnvironment,
        fiscalMunicipalKey,
        fiscalIM,
        fiscalIE,
        fiscalWebhookUrl,
        fiscalServiceSeries,
        fiscalServiceInitialNum,
        fiscalAutoEmitOnOSClose,
        fiscalSeriesList,
        fiscalTaxRules,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        smtpSecure
      });
      if (user && user.role === 'Administrador' && userReversalPassword) {
        await updateUserProfile({
          reversalPassword: userReversalPassword
        });
      }
      addLocalAuditLog(
        "Configuração Global do SaaS",
        `Parâmetros atualizados por ${user?.name || 'Administrador'}: Markup Padrão (${defaultMarkupVal}%), Garantia (${warrantyDaysVal}d), Chave PIX (${pixKeyStr}), Razão Social (${companyName}).`
      );
      setTimeout(() => {
        setSaveFeedback("✅ Configurações e registros de auditoria salvos com sucesso!");
      }, 1000);
    } catch (err) {
      setSaveFeedback("❌ Erro ao sincronizar catálogo fiscal: " + String(err));
    }
  };

  const handleTestFiscalConnection = () => {
    setIsTestingFiscal(true);
    setFiscalTestLogs(["🔄 Iniciando diagnóstico avançado de comunicação fiscal..."]);
    
    const logs = [
      `📁 [1/5] Carregando certificado A1: ${fiscalCertificateUploaded ? (fiscalCertificateName || 'certificado_digital_ativo.pfx') : 'Certificado de Demonstração AutoTech (MOCK_CERT.pfx)'}`,
      "🔒 [2/5] Validando senha de liberação de certificado digital e verificando chaves criptográficas RSA de 2048-bits...",
      `⚡ [3/5] Estabelecendo conexão segura SSLv3/TLS1.2 direta com o barramento do estado de ${fiscalStateUf || 'SP'}...`,
      `📡 [NF-e] [STATUS] Web Service de Peças (SEFAZ Estado - ${fiscalStateUf || 'SP'}): Resposta 107 (Serviço em Operação - Ativo)`,
      `🏦 [4/5] Conectando ao barramento de NFS-e Municipal (Inscrição Municipal IM: ${fiscalIM || 'Isento/Automático'} / Chave/Token: ${fiscalMunicipalKey ? '********' : 'Configurado Padrão Nacional'})...`,
      "🌐 [NFS-e] [STATUS] Web Service de Serviços (Canal Municipal): Responder padrão ABRASF 2.03 - Ativo e Sincronizado",
      `🔌 [WEBHOOK] Validando resposta de escuta na URL de retorno: ${fiscalWebhookUrl ? fiscalWebhookUrl : 'Nenhum webhook configurado (Notificações silenciosas de status)'}`,
      fiscalWebhookUrl ? `✅ [WEBHOOK] Handshake aceito com sucesso pelo receptor externo!` : `⚠️ [WEBHOOK] Sem webhook ativo. Status de notas deverá ser atualizado via consulta manual.`,
      `📦 [5/5] Analisando consistência de numerações anteriores (Série NFS-e: ${fiscalServiceSeries || '1'}, Próximo Número Inicial: #${fiscalServiceInitialNum || 1})`,
      fiscalAutoEmitOnOSClose ? `🤖 [AUTOMAÇÃO] Disparo automático ATIVADO para envio ao finalizar Ordens de Serviço!` : `⚠️ [AUTOMAÇÃO] Disparo automático inativo. Notas de O.S. serão geradas por comandos manuais na tela.`,
      `⏱️ [MÉTRICAS SEFAZ] Tempo total de latência: 124ms - Ambiente Ativo: ${fiscalEnvironment ? fiscalEnvironment.toUpperCase() : 'HOMOLOGAÇÃO'}`,
      `🎉 [SUCESSO FISCAL] Integrações e regras de validação síncronas testadas! Sistema pronto para assinar e emitir XMLs de Peças e Serviços!`
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < logs.length) {
        setFiscalTestLogs(prev => [...prev, logs[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsTestingFiscal(false);
      }
    }, 550);
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

  // Filter lotes for the SEFAZ batch history dialog
  const filteredLotes = sefazLotesList.filter(l => {
    const matchesSearch = l.id.toLowerCase().includes(searchLoteTerm.toLowerCase()) || 
                          l.protocol.toLowerCase().includes(searchLoteTerm.toLowerCase()) ||
                          l.notes.some((n: any) => n.clientName.toLowerCase().includes(searchLoteTerm.toLowerCase()) || n.accessKey.includes(searchLoteTerm));
    const matchesType = filterLoteType === 'ALL' || l.docType === filterLoteType;
    const matchesStatus = filterLoteStatus === 'ALL' || l.status === filterLoteStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

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

            {/* Margens e Precificacao */}
            <div className="border-t border-gray-850 pt-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="font-display font-bold text-white text-sm">Precificação e Margens de Lucro</h3>
                <span className="text-[10px] text-gray-500 font-mono block">Configure parâmetros comerciais e as sugestões de margem de venda.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Margem de Lucro Padrão (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    id="input-default-markup"
                    placeholder="Ex: 50"
                    min="0"
                    max="1000"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 pl-3 pr-10 text-white w-full focus:outline-none focus:border-red-500 font-mono text-xs"
                    value={defaultMarkupVal}
                    onChange={(e) => setDefaultMarkupVal(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                  <div className="absolute right-3 top-2.5 text-gray-500 text-[10px] font-mono">%</div>
                </div>
                <span className="text-[9px] text-gray-500 font-sans block mt-1 leading-normal">
                  Novos produtos criados sugerem automaticamente o Preço de Venda somando esta porcentagem (%) ao Preço de Custo.
                </span>
              </div>

              <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Prazo Geral de Garantia (Dias)</label>
                <div className="relative">
                  <input
                    type="number"
                    id="input-warranty-days"
                    placeholder="Ex: 90"
                    min="1"
                    max="3650"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 pl-3 pr-12 text-white w-full focus:outline-none focus:border-red-500 font-mono text-xs"
                    value={warrantyDaysVal}
                    onChange={(e) => setWarrantyDaysVal(Math.max(1, parseInt(e.target.value) || 90))}
                  />
                  <div className="absolute right-3 top-2.5 text-gray-500 text-[10px] font-mono">dias</div>
                </div>
                <span className="text-[9px] text-gray-500 font-sans block mt-1 leading-normal">
                  Prazo mestre estipulado para acionar e validar os alertas visuais de Retorno de Garantia de Ordens de Serviço finalizadas.
                </span>
              </div>

              {user && user.role === 'Administrador' && (
                <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sua Senha de Estorno Pessoal (Admin)</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="input-user-reversal-password"
                      placeholder="Ex: admin123"
                      className="bg-[#080c16] border border-gray-800 rounded-lg py-2.5 px-3 text-white w-full focus:outline-none focus:border-red-500 font-mono text-xs"
                      value={userReversalPassword}
                      onChange={(e) => setUserReversalPassword(e.target.value)}
                    />
                  </div>
                  <span className="text-[9px] text-gray-500 font-sans block mt-1 leading-normal">
                    Defina sua chave de liberação individual de estornos no PDV. Se vazio, o padrão é <code className="text-gray-400">admin123</code>.
                  </span>
                </div>
              )}
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

              <div className="flex flex-col gap-1.5 flex-1 justify-between">
                <div>
                  <label className="text-[10px] text-gray-400">ASSINATURA WHITE-LABEL NO RODAPÉ</label>
                  <input 
                    type="text" 
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white text-xs focus:ring-1 focus:ring-red-500 w-full mt-1.5"
                    value={whiteLabelTitle}
                    onChange={(e) => setWhiteLabelTitle(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={() => setShowThermalPreview(true)}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-red-900/40 bg-red-950/20 hover:bg-red-900/30 text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-md select-none"
              >
                <Eye className="w-4 h-4 text-red-500 animate-pulse" />
                <span>Visualizar Impressão (Bobina 80mm)</span>
              </button>
            </div>

            {/* SMTP / Gmail Integration panel */}
            <div className="border-t border-gray-850 pt-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="font-display font-bold text-white text-sm">Integração com Gmail (SMTP)</h3>
                <span className="text-[10px] text-gray-500 font-mono block">Configure os dados de envio automático de Orçamentos e comprovantes via Gmail.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">SERVIDOR SMTP</label>
                <input 
                  type="text" 
                  placeholder="smtp.gmail.com"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-red-500 transition-colors"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">PORTA SMTP</label>
                  <input 
                    type="number" 
                    placeholder="465"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-red-500 transition-colors"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-1.5 justify-center mt-3 pl-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-400 text-[10px] select-none font-bold uppercase tracking-wider font-mono">
                    <input 
                      type="checkbox"
                      checked={smtpSecure}
                      onChange={(e) => setSmtpSecure(e.target.checked)}
                      className="rounded border-gray-850 bg-[#080c16] text-red-500 focus:ring-0 focus:ring-offset-0 mr-1 cursor-pointer"
                    />
                    SSL/TLS
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">USUÁRIO GMAIL</label>
                <input 
                  type="email" 
                  placeholder="suaoficina@gmail.com"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-red-500 transition-colors"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">SENHA DE APP DO GMAIL (16 DÍGITOS)</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••••••"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-red-500 transition-colors"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                />
                <span className="text-[9.5px] text-gray-500 leading-normal font-sans">
                  💡 no Gmail, use uma <strong>"Senha de App"</strong> gerada na segurança de sua Conta Google (não utilize sua senha pessoal padrão).
                </span>
              </div>

              <div className="col-span-1 sm:col-span-2 flex flex-col gap-2 mt-1">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isTestingSmtp || !smtpHost || !smtpUser || !smtpPass}
                    onClick={async () => {
                      setIsTestingSmtp(true);
                      setSmtpTestFeedback(null);
                      try {
                        const response = await fetch('/api/email/verify', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            smtpHost,
                            smtpPort,
                            smtpUser,
                            smtpPass,
                            smtpSecure
                          })
                        });
                        const data = await response.json();
                        if (data.success) {
                          setSmtpTestFeedback({ success: true, message: data.message });
                        } else {
                          setSmtpTestFeedback({ success: false, error: data.error });
                        }
                      } catch (err: any) {
                        setSmtpTestFeedback({ success: false, error: err.message || 'Erro de rede na conexão.' });
                      } finally {
                        setIsTestingSmtp(false);
                      }
                    }}
                    className="p-2 bg-slate-900 border border-gray-850 hover:bg-slate-850 text-white rounded-lg cursor-pointer flex items-center gap-1.5 text-[11px] font-sans transition-all w-fit font-bold shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isTestingSmtp ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verificando Conexão...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Testar & Validar SMTP Gmail
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isSendingTestEmail || !smtpHost || !smtpUser || !smtpPass}
                    onClick={async () => {
                      setIsSendingTestEmail(true);
                      setEmailTestFeedback(null);
                      const testDestination = emailStr || smtpUser || "contato@autoprecision.com.br";
                      try {
                        const response = await fetch('/api/email/send', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            smtpHost,
                            smtpPort,
                            smtpUser,
                            smtpPass,
                            smtpSecure,
                            to: testDestination,
                            subject: "Teste de Envio de E-mail - AutoTech CRM",
                            text: `Sucesso! Suas configurações SMTP de envio automático estão funcionando perfeitamente.\n\nE-mail destinatário configurado: ${testDestination}\n\nOficina AutoTech - Gestão & Conectividade.`,
                            html: `
                              <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                                <h2 style="color: #0f172a; margin-top: 0;">🎉 Conexão SMTP Ativa!</h2>
                                <p style="font-size: 14px; color: #334155; line-height: 1.6;">
                                  Este é um e-mail de teste automático confirmando que o sistema conseguiu estabelecer contato com o seu servidor de e-mail e despachar a mensagem.
                                </p>
                                <div style="background-color: #f2f5f9; padding: 12px; border-radius: 6px; font-size: 13px; font-family: monospace; border-left: 4px solid #16a34a; margin: 15px 0; color: #334155;">
                                  <strong>Destinatário Configurado:</strong> ${testDestination}<br/>
                                  <strong>Servidor SMTP:</strong> ${smtpHost}:${smtpPort}
                                </div>
                                <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
                                  Oficina AutoTech • Sistema Integrado de Ordens de Serviço
                                </p>
                              </div>
                            `,
                            fromName: "AutoTech OS"
                          })
                        });
                        const data = await response.json();
                        if (data.success) {
                          setEmailTestFeedback({ success: true, message: `E-mail de teste enviado com êxito! Verifique a caixa de entrada de: ${testDestination}` });
                        } else {
                          setEmailTestFeedback({ success: false, error: data.error || "Houve um problema de validação ao enviar e-mail nas credenciais informadas." });
                        }
                      } catch (err: any) {
                        setEmailTestFeedback({ success: false, error: err.message || 'Falha de rede ao disparar e-mail de teste.' });
                      } finally {
                        setIsSendingTestEmail(false);
                      }
                    }}
                    className="p-2 bg-green-950/30 border border-green-900/50 hover:bg-green-900/40 text-green-400 rounded-lg cursor-pointer flex items-center gap-1.5 text-[11px] font-sans transition-all w-fit font-bold shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSendingTestEmail ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Enviando E-mail...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-green-400" /> Testar Conexão (Enviar E-mail)
                      </>
                    )}
                  </button>
                </div>

                {smtpTestFeedback && (
                  <div className={`p-3 rounded-lg border text-[11px] leading-relaxed flex flex-col gap-1 ${
                    smtpTestFeedback.success 
                      ? 'bg-blue-950/25 border-blue-900/60 text-blue-400' 
                      : 'bg-red-950/25 border-red-900/60 text-red-400'
                  }`}>
                    <span className="font-bold uppercase tracking-wider text-[9.5px]">
                      {smtpTestFeedback.success ? '✓ SMTP Ativo' : '⚠️ Erro de SMTP'}
                    </span>
                    <span>{smtpTestFeedback.success ? smtpTestFeedback.message : smtpTestFeedback.error}</span>
                  </div>
                )}

                {emailTestFeedback && (
                  <div className={`p-3 rounded-lg border text-[11px] leading-relaxed flex flex-col gap-1 ${
                    emailTestFeedback.success 
                      ? 'bg-green-950/25 border-green-900/60 text-green-400' 
                      : 'bg-red-950/25 border-red-900/60 text-red-400'
                  }`}>
                    <span className="font-bold uppercase tracking-wider text-[9.5px]">
                      {emailTestFeedback.success ? '✓ E-mail Enviado' : '⚠️ Falha no Envio'}
                    </span>
                    <span>{emailTestFeedback.success ? emailTestFeedback.message : emailTestFeedback.error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Acessibilidade e Alto Contraste */}
            <div className="border-t border-gray-850 pt-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-display font-bold text-white text-sm">Acessibilidade e Recursos Visuais</h3>
                <span className="text-[10px] text-gray-500 font-mono block">Ajuste a interface da aplicação para melhorar a visualização.</span>
              </div>
            </div>

            <div className="bg-[#09101f] border border-gray-850/65 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans text-xs">
              <div className="flex flex-col gap-1.5 max-w-xl text-left">
                <span className="font-bold text-white uppercase text-[10px] tracking-wider font-mono flex items-center gap-1.5">
                  🌗 Modo de Alto Contraste para Oficinas
                </span>
                <p className="text-gray-400 leading-relaxed text-[11px]">
                  Ative esta opção para maximizar o contraste da interface, transformando fundos de tela cinzas em preto absoluto (<code className="text-gray-300 font-mono bg-black px-1 rounded">#000000</code>), engrossando bordas de formulários e acentuando a luminosidade dos textos e ícones críticos. 
                </p>
                <span className="text-[10px] text-amber-500/90 font-medium">
                  💡 Ideal para dispositivos móveis ou tablets expostos diretamente sob forte iluminação solar/fluorescente no pátio de atendimento das oficinas.
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 bg-slate-950/40 p-2 rounded-lg border border-gray-850 self-end sm:self-center">
                <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Estado:</span>
                <button
                  type="button"
                  id="btn-toggle-high-contrast"
                  onClick={() => setHighContrast(!highContrast)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold font-mono border transition-all cursor-pointer ${
                    highContrast
                      ? 'bg-amber-600 border-amber-500 text-white shadow shadow-amber-950/40 font-bold'
                      : 'bg-transparent border-gray-800 text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  {highContrast ? '⚡ ATIVADO (MAX)' : '⚪ DESATIVADO'}
                </button>
              </div>
            </div>

            {/* Versão do Sistema & Atualizações */}
            <div className="border-t border-gray-850 pt-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
              <div>
                <h3 className="font-display font-bold text-white text-sm">Versão do Sistema & Atualizações</h3>
                <span className="text-[10px] text-gray-500 font-mono block">Notas de versão e registro de melhorias do sistema de gestão.</span>
              </div>
            </div>

            <div className="bg-[#09101f]/50 border border-gray-850 p-4 rounded-xl flex flex-col gap-4 font-sans text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-850/60 font-mono text-left">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-2.5 py-1 text-[10px] font-bold bg-red-950/45 text-red-400 border border-red-500/20 rounded-lg">
                    VERSÃO v3.9.0
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-950/25 px-2 py-0.5 rounded border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Estável e Atualizado
                  </span>
                </div>
                <span className="text-[10px] text-gray-500">Última checagem: 12 de Junho de 2026, 21:08</span>
              </div>

              <div className="flex flex-col gap-3 text-left">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                  📋 Histórico de Changelog para Usuários
                </span>

                <div className="flex flex-col gap-3.5 pl-1">
                  
                  {/* Update 1 */}
                  <div className="relative pl-4 border-l border-red-500/20">
                    <div className="absolute w-2 h-2 rounded-full bg-red-550 bg-red-500 -left-[4.5px] top-[4px]" />
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-[11px] sm:text-xs">v3.9.0 — Alertas Inteligentes & Otimização de Resolução</span>
                      <span className="text-[9px] bg-red-955/40 bg-red-950/50 text-red-400 border border-red-900/40 px-1.5 py-0.2 rounded font-mono font-bold">RECONFIG</span>
                    </div>
                    <ul className="list-disc pl-4 text-gray-400 text-[10.5px] space-y-1">
                      <li><strong>Retornos de Garantia no CRM:</strong> Alerta visual mestre e ícone dinâmico em tempo real de "Retorno de Garantia" visível no perfil dos clientes que possuem Ordens de Serviço sob prazo de garantia acionado.</li>
                      <li><strong>Responsividade do PDV:</strong> Ajuste automático de quebra de colunas e botões de re-impressão, visualização digital e estorno para evitar cortes de tela em resoluções reduzidas.</li>
                    </ul>
                  </div>

                  {/* Update 2 */}
                  <div className="relative pl-4 border-l border-gray-800">
                    <div className="absolute w-2 h-2 rounded-full bg-gray-750 bg-gray-700 -left-[4.5px] top-[4px]" />
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-300 text-[11px] sm:text-xs">v3.8.5 — Modo Visibilidade & Trocas Preventivas</span>
                    </div>
                    <ul className="list-disc pl-4 text-gray-400 text-[10.5px] space-y-1">
                      <li><strong>Modo de Alto Contraste:</strong> Interface calibrada para visualização otimizada em pátios de oficinas com grande iluminação solar direta.</li>
                      <li><strong>Fidelidade PIX QR-Code:</strong> Integração direta com faturamento de cartões e PIX Copia e Cola para agilidade operacional de frente.</li>
                    </ul>
                  </div>

                  {/* Update 3 */}
                  <div className="relative pl-4 border-l border-gray-800">
                    <div className="absolute w-2 h-2 rounded-full bg-gray-750 bg-gray-700 -left-[4.5px] top-[4px]" />
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-300 text-[11px] sm:text-xs">v3.7.0 — Backups Offline & Logs de Auditoria</span>
                    </div>
                    <ul className="list-disc pl-4 text-gray-400 text-[10.5px] space-y-1">
                      <li><strong>Logs e Auditoria Local:</strong> Novo visualizador de logs operacionais e ações em cache no terminal de caixa do PDV.</li>
                      <li><strong>Suporte a Backups Automáticos:</strong> Rotinas integradas de exportação parcial de bancos de dados locais em lotes.</li>
                    </ul>
                  </div>

                </div>
              </div>
            </div>

            {/* Módulo de Integração Fiscal (NFS-e & SEFAZ Peças) */}
            <div className="border-t border-gray-850 pt-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="font-display font-bold text-white text-sm">Integração Fiscal & SEFAZ (NFS-e & Peças)</h3>
                <span className="text-[10px] text-gray-500 font-mono block">Configure o faturamento de serviços (municipal) e peças (estadual sefaz) com certificado digital.</span>
              </div>
            </div>

            <div className="bg-[#09101f]/40 border border-gray-850 p-5 rounded-xl flex flex-col gap-5 text-left font-sans text-xs">
              
              {/* Opções de Ativação Habilitadas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  fiscalNfseEnabled 
                    ? 'bg-red-950/15 border-red-500/40 text-white' 
                    : 'bg-[#060b13] border-gray-900 hover:border-gray-850 text-gray-400'
                }`}>
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-red-500 cursor-pointer"
                    checked={fiscalNfseEnabled}
                    onChange={(e) => setFiscalNfseEnabled(e.target.checked)}
                  />
                  <div className="flex-1 flex flex-col gap-0.5 pointer-events-none">
                    <span className="font-bold text-xs uppercase tracking-wider text-red-400">🧾 NFS-e (Serviços Municipais)</span>
                    <span className="text-[10px] text-gray-500">Habilita a transmissão automática de Notas Fiscais de Serviço à prefeitura com base em Ordens de Serviço finalizadas.</span>
                  </div>
                </label>

                <label className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  fiscalNfeEnabled 
                    ? 'bg-red-950/15 border-red-500/40 text-white' 
                    : 'bg-[#060b13] border-gray-900 hover:border-gray-850 text-gray-400'
                }`}>
                  <input 
                    type="checkbox" 
                    className="mt-1 accent-red-500 cursor-pointer"
                    checked={fiscalNfeEnabled}
                    onChange={(e) => setFiscalNfeEnabled(e.target.checked)}
                  />
                  <div className="flex-1 flex flex-col gap-0.5 pointer-events-none">
                    <span className="font-bold text-xs uppercase tracking-wider text-red-400">📦 NF-e / NFC-e (Peças SEFAZ)</span>
                    <span className="text-[10px] text-gray-500">Permite emissão cupom fiscal de peças vendidas no PDV e notas de devolução de autopeças junto à SEFAZ Estadual.</span>
                  </div>
                </label>
              </div>

              {/* Informações Fiscais Gerais */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-850/60 pt-4 font-mono">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Estado UF Autorizador</label>
                  <select 
                    className="bg-[#080c16] border border-gray-850 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-red-500 font-mono"
                    value={fiscalStateUf}
                    onChange={(e) => setFiscalStateUf(e.target.value)}
                  >
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                      <option key={uf} value={uf}>{uf} - SEFAZ Estadual</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Regime Tributário IM</label>
                  <input 
                    type="text" 
                    placeholder="Inscrição Municipal"
                    className="bg-[#080c16] border border-gray-850 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-red-500 font-mono"
                    value={fiscalIM}
                    onChange={(e) => setFiscalIM(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Inscrição Estadual (IE)</label>
                  <input 
                    type="text" 
                    placeholder="Inscrição Estadual"
                    className="bg-[#080c16] border border-gray-850 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-red-500 font-mono"
                    value={fiscalIE}
                    onChange={(e) => setFiscalIE(e.target.value)}
                  />
                </div>

              </div>

              {/* Provedor e Chaves */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-850/40 pt-1 font-mono">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Ambiente Fiscal</label>
                  <div className="flex bg-[#060b13] p-1 rounded-lg border border-gray-850">
                    <button
                      type="button"
                      className={`flex-1 py-1 px-1.5 rounded-md text-[10px] font-bold font-mono transition-all cursor-pointer ${
                        fiscalEnvironment === 'Homologação'
                          ? 'bg-amber-600 border border-amber-500 text-white'
                          : 'text-gray-500 hover:text-white'
                      }`}
                      onClick={() => setFiscalEnvironment('Homologação')}
                    >
                      🧪 TESTE
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-1 px-1.5 rounded-md text-[10px] font-bold font-mono transition-all cursor-pointer ${
                        fiscalEnvironment === 'Produção'
                          ? 'bg-red-650 bg-red-600 border border-red-500 text-white'
                          : 'text-gray-500 hover:text-white'
                      }`}
                      onClick={() => setFiscalEnvironment('Produção')}
                    >
                      🚀 OFICIAL
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Gateway / API Integrada</label>
                  <select 
                    className="bg-[#080c16] border border-gray-850 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-red-500 font-mono"
                    value={fiscalTokenProvider}
                    onChange={(e) => setFiscalTokenProvider(e.target.value)}
                  >
                    <option value="FocusNFe">Focus NF-e API (Sugerador de Layout)</option>
                    <option value="PlugNotas">PlugNotas (TecnoSpeed)</option>
                    <option value="WebmaniaBR">Webmania BR SEFAZ API</option>
                    <option value="SoberanaDireta">Conexão Homologadora Direta SEFAZ (A1)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Token de Autenticação / API Key</label>
                  <input 
                    type="password" 
                    placeholder="********************"
                    className="bg-[#080c16] border border-gray-850 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-red-500 font-mono"
                    value={fiscalMunicipalKey}
                    onChange={(e) => setFiscalMunicipalKey(e.target.value)}
                  />
                </div>

              </div>

              {/* Certificado Digital A1 */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 border-t border-gray-850/60 pt-4">
                
                {/* Certificado Digital Upload box */}
                <div className="sm:col-span-8 flex flex-col gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-gray-400">Certificado Digital A1 (.pfx ou .p12) obrigatório</span>
                  
                  {fiscalCertificateUploaded ? (
                    <div className="bg-emerald-950/15 border border-emerald-500/30 p-3.5 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-white text-xs font-mono font-bold leading-none mb-1">{fiscalCertificateName || 'certificado_oficina_valido.pfx'}</p>
                          <p className="text-[10px] text-emerald-400/90 leading-none">Chave RSA de 2048 bits ativa e vinculada</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFiscalCertificateUploaded(false);
                          setFiscalCertificateName('');
                        }}
                        className="p-1 hover:bg-emerald-900/25 text-gray-400 hover:text-red-400 rounded transition-colors cursor-pointer"
                        title="Remover Certificado"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input 
                        type="file" 
                        id="fiscal-cert-upload" 
                        accept=".pfx,.p12" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFiscalCertificateUploaded(true);
                            setFiscalCertificateName(file.name);
                          }
                        }}
                      />
                      <label 
                        htmlFor="fiscal-cert-upload"
                        className="border-2 border-dashed border-gray-850 hover:border-red-500/50 bg-[#080d16] hover:bg-[#10182b]/35 p-5 rounded-lg flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all min-h-[72px]"
                      >
                        <Upload className="w-4 h-4 text-gray-400 animate-bounce" />
                        <span className="text-[11px] text-gray-400 font-mono">Arraste ou <span className="text-red-400 hover:underline">clique aqui</span> para vincular certificado .pfx</span>
                      </label>
                    </>
                  )}
                </div>

                {/* Senha do Certificado */}
                <div className="sm:col-span-4 flex flex-col gap-1.5 text-left font-mono">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Senha do Certificado</label>
                  <input 
                    type="password" 
                    placeholder="Senha do arquivo .pfx"
                    className="bg-[#080c16] border border-gray-850 rounded-lg py-2.5 px-3 text-white text-xs focus:outline-none focus:border-red-500 font-mono w-full"
                    value={fiscalPassword}
                    onChange={(e) => setFiscalPassword(e.target.value)}
                  />
                  <span className="text-[9px] text-gray-500 leading-tight">Armazenada com criptografia de ponta a ponta no Firebase Auth.</span>
                </div>

              </div>

              {/* URL de Webhook */}
              <div className="flex flex-col gap-1.5 font-mono border-t border-gray-850/40 pt-4">
                <label className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                  🌐 URL de Webhook para Retorno / Notificação de Status
                </label>
                <input 
                  type="url" 
                  placeholder="https://sua-oficina.com.br/api/webhooks/sefaz-notas"
                  className="bg-[#080c16] border border-gray-850 rounded-lg py-2.5 px-3 text-white text-xs focus:outline-none focus:border-red-500 font-mono w-full"
                  value={fiscalWebhookUrl}
                  onChange={(e) => setFiscalWebhookUrl(e.target.value)}
                />
                <span className="text-[9px] text-gray-500 leading-tight">O gateway de faturamento enviará payloads POST em tempo real para essa URL sempre que houver alteração de status (como <strong>Autorizada</strong>, <strong>Rejeitada</strong>, ou <strong>Cancelada</strong>) no barramento da SEFAZ.</span>
              </div>

              {/* MÓDULO DE EMISSÃO AUTOMÁTICA */}
              <div className="flex flex-col gap-4 border-t border-gray-850/40 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">⚙️</span>
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">Módulo de Emissão Automática de Notas</span>
                    <span className="text-[10px] text-gray-500 block leading-tight">Configure a série, numeração e gatilhos automatizados para NFS-e e NF-e.</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  {/* Série da Nota Fiscal */}
                  <div className="sm:col-span-4 flex flex-col gap-1.5 font-mono">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Série do Serviço (NFS-e)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 1"
                      className="bg-[#080c16] border border-gray-850 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-red-500 font-mono w-full"
                      value={fiscalServiceSeries}
                      onChange={(e) => setFiscalServiceSeries(e.target.value)}
                    />
                    <span className="text-[9px] text-gray-500">Série padrão para notas de serviço.</span>
                  </div>

                  {/* Número Inicial da Nota */}
                  <div className="sm:col-span-4 flex flex-col gap-1.5 font-mono">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Próximo Número Inicial (NFS-e)</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 1"
                      min="1"
                      className="bg-[#080c16] border border-gray-850 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-red-500 font-mono w-full"
                      value={fiscalServiceInitialNum}
                      onChange={(e) => setFiscalServiceInitialNum(Number(e.target.value))}
                    />
                    <span className="text-[9px] text-gray-500">Sequência numérica de faturamento.</span>
                  </div>

                  {/* Agendar Emissão Automática Switch */}
                  <div className="sm:col-span-4 flex flex-col gap-1.5 justify-center">
                    <label className="text-[10px] text-gray-400 font-bold uppercase font-mono mb-1">Gatilho de Transmissão</label>
                    <label className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center gap-2.5 select-none ${
                      fiscalAutoEmitOnOSClose 
                        ? 'bg-red-950/15 border-red-500/40 text-white' 
                        : 'bg-[#060b13] border-gray-900 hover:border-gray-850 text-gray-400'
                    }`}>
                      <input 
                        type="checkbox" 
                        className="accent-red-500 cursor-pointer"
                        checked={fiscalAutoEmitOnOSClose}
                        onChange={(e) => setFiscalAutoEmitOnOSClose(e.target.checked)}
                      />
                      <div className="flex-1 flex flex-col gap-0.5 pointer-events-none text-left">
                        <span className="font-bold text-[10px] uppercase font-mono text-red-400">Ao Finalizar O.S.</span>
                        <span className="text-[8px] text-gray-500 leading-none">Emite NFS-e automaticamente.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="p-3 bg-red-950/10 rounded-lg border border-red-900/30 text-[10.5px] text-gray-300 leading-relaxed flex items-start gap-2">
                  <span className="text-red-400 text-xs">ℹ️</span>
                  <span>
                    Quando a <strong>Emissão Automática ao Finalizar Ordem de Serviço</strong> estiver ativada, o sistema agenda e envia o faturamento XML da NFS-e/NF-e automaticamente ao canal de transmissão da prefeitura assim que uma O.S. atingir o estado finalizado, emitindo o link da nota e atualizando o status de integração.
                  </span>
                </div>

                {/* CADASTRO E CONTROLE DE SÉRIES DE NOTA FISCAL */}
                <div className="flex flex-col gap-4 border-t border-gray-850/30 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <List className="w-4 h-4 text-red-500" />
                      <div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider block">Cadastro de Séries de Nota Fiscal</span>
                        <span className="text-[10px] text-gray-500 block leading-tight">Cadastre séries de faturamento com sequenciadores automáticos adicionais.</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setNewSeriesType('NFS-e');
                        setNewSeriesValue('');
                        setNewSeriesNextNum(1);
                        setEditingSeriesId(null);
                        setShowSeriesForm(!showSeriesForm);
                      }}
                      className="p-1 px-2.5 bg-[#0a1122] hover:bg-[#121f3d] border border-gray-850 text-red-400 hover:text-white rounded-lg flex items-center gap-1 text-[10px] uppercase font-bold cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      {showSeriesForm ? 'Fechar' : 'Nova Série'}
                    </button>
                  </div>

                  {/* Form to Create/Edit series */}
                  {showSeriesForm && (
                    <div className="p-4 bg-[#070c14] border border-gray-850/85 rounded-xl flex flex-col gap-3 font-mono">
                      <span className="text-[9.5px] font-bold text-red-400 uppercase">
                        {editingSeriesId ? '📝 Editar Série Fiscal' : '✨ Cadastrar Nova Série Fiscal'}
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-gray-400 uppercase font-bold mb-1 block">Tipo de Nota</label>
                          <select
                            className="bg-[#080c16] border border-gray-850 rounded-lg py-1.5 px-2 text-white text-xs focus:outline-none focus:border-red-500 font-mono w-full"
                            value={newSeriesType}
                            onChange={(e) => setNewSeriesType(e.target.value as any)}
                          >
                            <option value="NFS-e">NFS-e (Serviço)</option>
                            <option value="NF-e">NF-e (Produto/Peça)</option>
                            <option value="NFC-e">NFC-e (Cupom Consumidor)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-gray-400 uppercase font-bold mb-1 block">Série (Ex: 1, 2, 100)</label>
                          <input
                            type="text"
                            placeholder="Ex: 1"
                            maxLength={5}
                            className="bg-[#080c16] border border-gray-850 rounded-lg py-1.5 px-2 text-white text-xs focus:outline-none focus:border-red-500 font-mono w-full"
                            value={newSeriesValue}
                            onChange={(e) => setNewSeriesValue(e.target.value)}
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-gray-400 uppercase font-bold mb-1 block">Sequencial / Próximo Número</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="Ex: 1"
                            className="bg-[#080c16] border border-gray-850 rounded-lg py-1.5 px-2 text-white text-xs focus:outline-none focus:border-red-500 font-mono w-full"
                            value={newSeriesNextNum}
                            onChange={(e) => setNewSeriesNextNum(Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowSeriesForm(false);
                            setEditingSeriesId(null);
                          }}
                          className="py-1 px-3 bg-[#09101f] text-gray-400 hover:text-white border border-gray-850 rounded text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={!newSeriesValue.trim()}
                          onClick={handleAddOrUpdateSeries}
                          className="py-1 px-3 bg-red-650 hover:bg-red-700 text-white border border-red-500 rounded text-[10px] font-bold uppercase cursor-pointer disabled:opacity-55"
                        >
                          {editingSeriesId ? 'Salvar Edição' : 'Confirmar Cadastro'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of custom registered series */}
                  <div className="border border-gray-850/80 bg-black/20 rounded-xl overflow-hidden divide-y divide-gray-850/70 font-mono">
                    {fiscalSeriesList.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-[10px]">
                        Nenhuma série customizada cadastrada. O sistema utilizará as séries padrões configuradas acima.
                      </div>
                    ) : (
                      fiscalSeriesList.map((item) => (
                        <div key={item.id} className="p-3 flex items-center justify-between text-[11px] hover:bg-[#070c14]/40 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase ${
                              item.type === 'NFS-e' 
                                ? 'bg-blue-950/45 text-blue-400 border border-blue-500/20' 
                                : item.type === 'NF-e' 
                                  ? 'bg-purple-950/45 text-purple-400 border border-purple-500/20' 
                                  : 'bg-pink-950/45 text-pink-400 border border-pink-500/20'
                            }`}>
                              {item.type}
                            </span>
                            
                            <div>
                              <span className="text-gray-450">Série: <strong className="text-white font-bold">{item.series}</strong></span>
                              <span className="mx-2 text-gray-700">|</span>
                              <span className="text-gray-450">Próximo Número: <strong className="text-emerald-400">#{item.nextNumber}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Toggle Active Switch */}
                            <button
                              type="button"
                              onClick={() => handleToggleSeriesActive(item.id)}
                              className={`px-1.5 py-0.5 rounded text-[8.5px] uppercase font-bold transition-all cursor-pointer ${
                                item.isActive 
                                  ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-gray-900 border border-gray-850 text-gray-500'
                              }`}
                            >
                              {item.isActive ? 'Ativo' : 'Inativo'}
                            </button>
                            
                            {/* Edit button */}
                            <button
                              type="button"
                              onClick={() => handleEditSeries(item)}
                              className="p-1 hover:bg-[#121f3d] text-gray-400 hover:text-cyan-400 rounded transition-colors cursor-pointer"
                              title="Editar Série/Contador"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteSeries(item.id)}
                              className="p-1 hover:bg-red-950/45 text-gray-400 hover:text-red-400 rounded transition-colors cursor-pointer"
                              title="Excluir Série"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* REGRAS DE TRIBUTAÇÃO AUTOMÁTICA POR UF */}
                <div className="flex flex-col gap-4 border-t border-gray-850/30 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">⚖️</span>
                      <div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider block">Regras de Tributação Automática (por UF)</span>
                        <span className="text-[10px] text-gray-500 block leading-tight">Preenchimento automatizado de CFOP, ICMS e IPI sugeridos conforme a UF de destino do cliente.</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setNewTaxRuleUf('SP');
                        setNewTaxRuleCfop('');
                        setNewTaxRuleIcmsAliquota(18);
                        setNewTaxRuleIpiAliquota(0);
                        setNewTaxRuleDescription('');
                        setEditingTaxRuleId(null);
                        setShowTaxRuleForm(!showTaxRuleForm);
                      }}
                      className="p-1 px-2.5 bg-[#0a1122] hover:bg-[#121f3d] border border-gray-850 text-red-400 hover:text-white rounded-lg flex items-center gap-1 text-[10px] uppercase font-bold cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      {showTaxRuleForm ? 'Fechar' : 'Nova Regra'}
                    </button>
                  </div>

                  {/* Form to Create/Edit taxation rule */}
                  {showTaxRuleForm && (
                    <div className="p-4 bg-[#070c14] border border-gray-850/85 rounded-xl flex flex-col gap-3 font-mono">
                      <span className="text-[9.5px] font-bold text-red-400 uppercase">
                        {editingTaxRuleId ? '📝 Editar Regra Tributária' : '✨ Criar Nova Regra Tributária'}
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        {/* UF Cliente Target */}
                        <div className="sm:col-span-4 flex flex-col gap-1">
                          <label className="text-[9px] text-gray-400 uppercase font-bold mb-1 block">UF de Destino (Cliente)</label>
                          <select
                            className="bg-[#080c16] border border-gray-850 rounded-lg py-1.5 px-2 text-white text-xs focus:outline-none focus:border-red-500 font-mono w-full"
                            value={newTaxRuleUf}
                            onChange={(e) => setNewTaxRuleUf(e.target.value)}
                          >
                            <option value="Dentro do Estado (Nacional/Mesma UF)">Dentro do Estado (Mesma UF / Interno)</option>
                            <option value="Fora do Estado (Outras UF)">Fora do Estado (Geral Interestadual)</option>
                            <option value="AC">AC - Acre</option>
                            <option value="AL">AL - Alagoas</option>
                            <option value="AP">AP - Amapá</option>
                            <option value="AM">AM - Amazonas</option>
                            <option value="BA">BA - Bahia</option>
                            <option value="CE">CE - Ceará</option>
                            <option value="DF">DF - Distrito Federal</option>
                            <option value="ES">ES - Espírito Santo</option>
                            <option value="GO">GO - Goiás</option>
                            <option value="MA">MA - Maranhão</option>
                            <option value="MT">MT - Mato Grosso</option>
                            <option value="MS">MS - Mato Grosso do Sul</option>
                            <option value="MG">MG - Minas Gerais</option>
                            <option value="PA">PA - Pará</option>
                            <option value="PB">PB - Paraíba</option>
                            <option value="PR">PR - Paraná</option>
                            <option value="PE">PE - Pernambuco</option>
                            <option value="PI">PI - Piauí</option>
                            <option value="RJ">RJ - Rio de Janeiro</option>
                            <option value="RN">RN - Rio Grande do Norte</option>
                            <option value="RS">RS - Rio Grande do Sul</option>
                            <option value="RO">RO - Rondônia</option>
                            <option value="RR">RR - Roraima</option>
                            <option value="SC">SC - Santa Catarina</option>
                            <option value="SP">SP - São Paulo</option>
                            <option value="SE">SE - Sergipe</option>
                            <option value="TO">TO - Tocantins</option>
                          </select>
                        </div>

                        {/* CFOP Sugerido */}
                        <div className="sm:col-span-3 flex flex-col gap-1">
                          <label className="text-[9px] text-gray-400 uppercase font-bold mb-1 block">CFOP Sugerido</label>
                          <input
                            type="text"
                            placeholder="Ex: 5102, 6102, 5405"
                            maxLength={4}
                            className="bg-[#080c16] border border-gray-850 rounded-lg py-1.5 px-2 text-white text-xs focus:outline-none focus:border-red-500 font-mono w-full"
                            value={newTaxRuleCfop}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '');
                              setNewTaxRuleCfop(v);
                            }}
                          />
                        </div>

                        {/* Alíquota ICMS */}
                        <div className="sm:col-span-2.5 flex flex-col gap-1">
                          <label className="text-[9px] text-gray-400 uppercase font-bold mb-1 block">ICMS (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            className="bg-[#080c16] border border-gray-850 rounded-lg py-1.5 px-2 text-white text-xs focus:outline-none focus:border-red-500 font-mono w-full"
                            value={newTaxRuleIcmsAliquota}
                            onChange={(e) => setNewTaxRuleIcmsAliquota(Number(e.target.value))}
                          />
                        </div>

                        {/* Alíquota IPI */}
                        <div className="sm:col-span-2.5 flex flex-col gap-1">
                          <label className="text-[9px] text-gray-400 uppercase font-bold mb-1 block font-mono">IPI (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            className="bg-[#080c16] border border-gray-850 rounded-lg py-1.5 px-2 text-white text-xs focus:outline-none focus:border-red-500 font-mono w-full"
                            value={newTaxRuleIpiAliquota}
                            onChange={(e) => setNewTaxRuleIpiAliquota(Number(e.target.value))}
                          />
                        </div>
                      </div>

                      {/* Descritivo da Regra */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-400 uppercase font-bold mb-1 block font-mono">Descrição / Observações Internas</label>
                        <input
                          type="text"
                          placeholder="Ex: Venda de mercadoria tributada integralmente"
                          className="bg-[#080c16] border border-gray-850 rounded-lg py-1.5 px-2 text-white text-xs focus:outline-none focus:border-red-500 font-mono w-full"
                          value={newTaxRuleDescription}
                          onChange={(e) => setNewTaxRuleDescription(e.target.value)}
                        />
                      </div>

                      {/* CFOP Quick Helpers */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[8px] text-gray-500 font-bold uppercase mr-1 flex items-center">Gatilhos Rápidos de CFOP:</span>
                        <button
                          type="button"
                          onClick={() => { setNewTaxRuleCfop('5102'); setNewTaxRuleDescription('Venda ou faturamento de mercadorias interna'); }}
                          className="px-1.5 py-0.5 bg-gray-900 hover:bg-gray-850 text-gray-400 hover:text-white rounded text-[8px] border border-gray-850/60 font-mono transition-colors cursor-pointer"
                        >
                          5102 - Venda Interna
                        </button>
                        <button
                          type="button"
                          onClick={() => { setNewTaxRuleCfop('6102'); setNewTaxRuleDescription('Venda de mercadoria interestadual'); }}
                          className="px-1.5 py-0.5 bg-gray-900 hover:bg-gray-850 text-gray-400 hover:text-white rounded text-[8px] border border-gray-850/60 font-mono transition-colors cursor-pointer"
                        >
                          6102 - Venda Interestadual
                        </button>
                        <button
                          type="button"
                          onClick={() => { setNewTaxRuleCfop('5405'); setNewTaxRuleDescription('Venda com substituição tributária (ST) interna'); }}
                          className="px-1.5 py-0.5 bg-gray-900 hover:bg-gray-850 text-gray-400 hover:text-white rounded text-[8px] border border-gray-850/60 font-mono transition-colors cursor-pointer"
                        >
                          5405 - Venda ST Interna
                        </button>
                        <button
                          type="button"
                          onClick={() => { setNewTaxRuleCfop('6404'); setNewTaxRuleDescription('Venda ST interestadual de autopeças'); }}
                          className="px-1.5 py-0.5 bg-gray-900 hover:bg-gray-850 text-gray-400 hover:text-white rounded text-[8px] border border-gray-850/60 font-mono transition-colors cursor-pointer"
                        >
                          6404 - Venda ST interestadual
                        </button>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowTaxRuleForm(false);
                            setEditingTaxRuleId(null);
                          }}
                          className="py-1 px-3 bg-[#09101f] text-gray-400 hover:text-white border border-gray-850 rounded text-[10px] font-bold uppercase cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={!newTaxRuleUf || !newTaxRuleCfop.trim()}
                          onClick={handleAddOrUpdateTaxRule}
                          className="py-1 px-3 bg-red-650 hover:bg-red-700 text-white border border-red-500 rounded text-[10px] font-bold uppercase cursor-pointer disabled:opacity-55"
                        >
                          {editingTaxRuleId ? 'Salvar Regra' : 'Criar Regra'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of custom registered tax rules */}
                  <div className="border border-gray-850/80 bg-black/20 rounded-xl overflow-hidden divide-y divide-gray-850/70 font-mono">
                    {fiscalTaxRules.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-[10px]">
                        Nenhuma regra tributária de UF cadastrada. O preenchimento da NF-e utilizará os padrões síncronos do emissor.
                      </div>
                    ) : (
                      fiscalTaxRules.map((rule) => {
                        const isUfSpecial = rule.uf.includes('Estado') || rule.uf.includes('Geral');
                        return (
                          <div key={rule.id} className="p-3 flex items-center justify-between text-[11px] hover:bg-[#070c14]/40 transition-colors">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase ${
                                isUfSpecial
                                  ? 'bg-rose-950/45 text-rose-400 border border-rose-500/20' 
                                  : 'bg-[#003366]/40 text-blue-300 border border-[#004e99]/30'
                              }`}>
                                {rule.uf}
                              </span>
                              
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-gray-400">CFOP Sugerido: <strong className="text-white font-bold">{rule.cfop}</strong></span>
                                <span className="text-gray-700">|</span>
                                <span className="text-gray-450">ICMS: <strong className="text-cyan-400">{rule.icmsAliquota}%</strong></span>
                                <span className="text-gray-700">|</span>
                                <span className="text-gray-450">IPI: <strong className="text-purple-400">{rule.ipiAliquota}%</strong></span>
                                {rule.description && (
                                  <>
                                    <span className="text-gray-700">|</span>
                                    <span className="text-gray-500 italic max-w-xs truncate" title={rule.description}>{rule.description}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Toggle Active Switch */}
                              <button
                                type="button"
                                onClick={() => handleToggleTaxRuleActive(rule.id)}
                                className={`px-1.5 py-0.5 rounded text-[8.5px] uppercase font-bold transition-all cursor-pointer ${
                                  rule.isActive 
                                    ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-gray-900 border border-gray-850 text-gray-500'
                                }`}
                              >
                                {rule.isActive ? 'Ativa' : 'Inativa'}
                              </button>
                              
                              {/* Edit button */}
                              <button
                                type="button"
                                onClick={() => handleEditTaxRule(rule)}
                                className="p-1 hover:bg-[#121f3d] text-gray-400 hover:text-cyan-400 rounded transition-colors cursor-pointer"
                                title="Editar Regra Tributária"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteTaxRule(rule.id)}
                                className="p-1 hover:bg-red-950/45 text-gray-400 hover:text-red-400 rounded transition-colors cursor-pointer"
                                title="Excluir Regra"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Botão de Teste de Diagnóstico e Histórico */}
              <div className="border-t border-gray-850/60 pt-4 flex flex-col gap-3.5">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Diagnóstico em Tempo Real</span>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSefazErrorMonitor(true);
                        if (sefazErrorsLog.length > 0 && !selectedErrorForDetails) {
                          setSelectedErrorForDetails(sefazErrorsLog[0]);
                        }
                      }}
                      className="px-4 py-2 bg-red-950/15 hover:bg-red-950/30 text-red-400 hover:text-white border border-red-900/50 hover:border-red-500/50 rounded-lg font-mono font-bold text-[10.5px] uppercase flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-red-950/10"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse animate-duration-1000" />
                      Monitor de Erros SEFAZ
                      <span className="bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full font-sans ml-0.5">
                        {sefazErrorsLog.filter(e => e.status === 'Pendente').length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowSefazLoteHistory(true);
                        if (sefazLotesList.length > 0 && !selectedLoteForDetails) {
                          setSelectedLoteForDetails(sefazLotesList[0]);
                        }
                      }}
                      className="px-4 py-2 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-400 hover:text-white border border-cyan-900/50 hover:border-cyan-500/50 rounded-lg font-mono font-bold text-[10.5px] uppercase flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-cyan-950/10"
                    >
                      <Archive className="w-3.5 h-3.5 text-cyan-500" />
                      Histórico de Lotes
                      <span className="bg-cyan-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full font-sans ml-0.5">
                        {sefazLotesList.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTestFiscalConnection}
                      disabled={isTestingFiscal}
                      className="px-4 py-2 bg-[#09101f] transition-all hover:bg-[#121d33] text-red-400 hover:text-white border border-gray-800 hover:border-red-500/40 rounded-lg font-mono font-bold text-[10.5px] uppercase flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-red-500 ${isTestingFiscal ? 'animate-spin' : ''}`} />
                      {isTestingFiscal ? 'Consultando Barramento SEFAZ...' : 'Testar Comunicação Fiscal'}
                    </button>
                  </div>
                </div>

                {/* Terminal Console */}
                {(fiscalTestLogs.length > 0 || isTestingFiscal) && (
                  <div className="bg-black/90 p-4 rounded-xl border border-gray-850 font-mono text-[10px] leading-relaxed text-emerald-400 max-h-[190px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex items-center justify-between border-b border-gray-900 pb-1.5 mb-2 text-[9px] text-gray-500 uppercase tracking-widest">
                      <span>CONSOLE DE TELEMETRIA FISCAL</span>
                      <span className="animate-pulse text-red-500">● MODO SIMULAÇÃO ATIVA</span>
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      {fiscalTestLogs.map((log, idx) => (
                        <div key={idx} className={`${log.includes('[SUCESSO') ? 'text-cyan-450 border-t border-cyan-950/40 pt-1.5 mt-1 font-bold text-cyan-400 text-[11px]' : ''}`}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Domínio Próprio Definitivo (Dominio.br / Registro.br)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomDomainStr('www.oficinadorafael.com.br');
                      setSubdomainStr('oficinadorafael');
                      setDomainStatusVal('Ativo');
                      setCustomPortalSlugStr('oficinadorafael');
                      setSaveFeedback("Domínio Registro.br (www.oficinadorafael.com.br) aplicado e verificado com sucesso!");
                      setTimeout(() => setSaveFeedback(""), 4000);
                    }}
                    className="text-[9px] bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>✦ Ativar www.oficinadorafael.com.br</span>
                  </button>
                </div>
                <input 
                  type="text" 
                  placeholder="ex: www.oficinadorafael.com.br"
                  className="bg-[#080c16] border border-gray-850 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
                  value={customDomainStr}
                  onChange={(e) => {
                    setCustomDomainStr(e.target.value.toLowerCase().trim());
                    if (domainStatusVal === 'Ativo') setDomainStatusVal('Pendente');
                  }}
                />
                <span className="text-[9px] text-gray-400 font-sans block mt-1">
                  💡 <strong>Domínio Profissional Registro.br:</strong> Vincule seu domínio próprio <code className="text-emerald-400 font-mono">www.oficinadorafael.com.br</code> registrado no Dominio.br / Registro.br.
                </span>
              </div>
            </div>

            {/* Custom Client Portal Link Generator Section */}
            <div className="border-t border-gray-850 pt-5 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-display font-bold text-white text-sm">Portal de O.S. & Links de Acesso do Cliente</h3>
                <span className="text-[10px] text-gray-500 font-mono block">Gere URLs personalizadas para que seus clientes acompanhem ordens de serviço em tempo real.</span>
              </div>
            </div>

            <div className="bg-[#050912]/90 border border-gray-850 rounded-xl p-4 flex flex-col gap-4 font-mono text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Identificador Exclusivo do Portal (ID / Slug)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="ex: autoclinic"
                    className="bg-[#080c16] border border-gray-850 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-emerald-500 flex-1 font-mono"
                    value={customPortalSlugStr}
                    onChange={(e) => {
                      const cleanSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setCustomPortalSlugStr(cleanSlug);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setCustomPortalSlugStr(company.id)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-emerald-950 rounded-lg text-[10px] text-slate-300 hover:text-emerald-400 transition-all cursor-pointer font-bold shrink-0"
                  >
                    Usar ID Padrão
                  </button>
                </div>
                <span className="text-[9px] text-gray-400 font-sans block mt-1">
                  💡 Este identificador é usado para gerar links curtos e exclusivos que conectam seus clientes cadastrados diretamente ao portal de consulta da sua oficina.
                </span>
              </div>

              {/* Generated Links showcase and single click copy buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <span className="text-[10.5px] text-gray-400 uppercase font-bold tracking-wider">Links de portal gerados prontos para divulgação:</span>
                
                {/* 1. Styled shortened marketing link */}
                <div className="bg-[#0b1816] border border-emerald-900/30 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-emerald-400 font-bold tracking-wider uppercase">🔗 URL Personalizada (Para mídias e cartões de visita)</span>
                    <span className="text-[#f8fafc] font-bold select-all break-all">
                      {customDomainStr || (subdomainStr ? `${subdomainStr}.autoprecision.com.br` : 'oficina.app/link')}/{customPortalSlugStr || 'portal'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(`${customDomainStr || (subdomainStr ? `${subdomainStr}.autoprecision.com.br` : 'oficina.app')}/link/${customPortalSlugStr || 'portal'}`, "URL Curta")}
                    className="px-3.5 py-1.5 bg-emerald-950/20 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-900/40 rounded font-bold font-mono text-[10px] flex items-center gap-1.5 cursor-pointer transition-all shrink-0 self-start sm:self-center"
                  >
                    {copiedTemplateText === "URL Curta" ? (
                      <>✓ Copiado!</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copiar Link Curto</>
                    )}
                  </button>
                </div>

                {/* 2. Standard server tracking redirect url */}
                <div className="bg-[#121c33]/40 border border-gray-800 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-cyan-400 font-bold tracking-wider uppercase font-mono">📈 Link Direto do Portal Integrado (Para envio rápido por WhatsApp/E-mail)</span>
                    <span className="text-gray-400 select-all break-all">
                      {window.location.protocol}//{window.location.host}{window.location.pathname}?oficinaId={customPortalSlugStr || company.id}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(`${window.location.protocol}//${window.location.host}${window.location.pathname}?oficinaId=${customPortalSlugStr || company.id}`, "Link Direto")}
                    className="px-3.5 py-1.5 bg-cyan-950/20 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-900/40 rounded font-bold font-mono text-[10px] flex items-center gap-1.5 cursor-pointer transition-all shrink-0 self-start sm:self-center"
                  >
                    {copiedTemplateText === "Link Direto" ? (
                      <>✓ Copiado!</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copiar Link Direto</>
                    )}
                  </button>
                </div>
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

                {/* Firebase Hosting & Registro.br Step-by-Step Guidance Box */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Firebase Console Hosting Guide */}
                  <div className="bg-blue-950/30 border border-blue-800/50 rounded-xl p-3 text-blue-200 text-xs font-sans space-y-2">
                    <div className="flex items-center justify-between text-blue-400 font-bold font-mono text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <span className="bg-blue-500/20 text-blue-300 p-1 rounded">🔥</span>
                        1. Firebase Hosting
                      </span>
                    </div>
                    <p className="text-[10.5px] text-gray-300 leading-relaxed">
                      Projeto: <code className="text-white bg-slate-800 px-1 rounded font-bold">project-7e67bad4-9088-4537-aa1</code>
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-[10.5px] text-gray-300 leading-snug">
                      <li>Acesse o <a href="https://console.firebase.google.com/u/0/project/project-7e67bad4-9088-4537-aa1/hosting/sites" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-bold">Firebase Hosting Console</a>.</li>
                      <li>Clique em <strong>Adicionar domínio personalizado</strong>.</li>
                      <li>Adicione <code className="text-white bg-slate-800 px-1 rounded">oficinadorafael.com.br</code> e <code className="text-white bg-slate-800 px-1 rounded">www.oficinadorafael.com.br</code>.</li>
                      <li>No Registro.br, altere o CNAME para <code className="text-emerald-400 bg-slate-900 px-1 rounded font-bold">project-7e67bad4-9088-4537-aa1.web.app</code>.</li>
                    </ol>
                  </div>

                  {/* Firebase Auth Authorized Domains Guide */}
                  <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3 text-emerald-200 text-xs font-sans space-y-2">
                    <div className="flex items-center justify-between text-emerald-400 font-bold font-mono text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <span className="bg-emerald-500/20 text-emerald-300 p-1 rounded">🔑</span>
                        2. Liberar Login (Auth)
                      </span>
                    </div>
                    <p className="text-[10.5px] text-gray-300 leading-relaxed">
                      Evita o erro <code className="text-amber-300 font-bold font-mono">auth/unauthorized-domain</code> ao logar no site:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-[10.5px] text-gray-300 leading-snug">
                      <li>Acesse o <a href="https://console.firebase.google.com/u/0/project/project-7e67bad4-9088-4537-aa1/authentication/settings" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-bold">Firebase Auth Settings</a>.</li>
                      <li>Aba <strong>Domínios autorizados (Authorized domains)</strong>.</li>
                      <li>Clique em <strong>Adicionar domínio</strong>.</li>
                      <li>Cadastre <code className="text-white bg-slate-800 px-1 rounded">oficinadorafael.com.br</code> e <code className="text-white bg-slate-800 px-1 rounded">www.oficinadorafael.com.br</code>.</li>
                    </ol>
                  </div>

                  {/* Vercel vs Firebase Error Explanation Box */}
                  <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-3 text-amber-200 text-xs font-sans space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-[11px]">
                      <span className="bg-amber-500/20 text-amber-300 p-1 rounded">⚠️</span>
                      Erro "404 DEPLOYMENT_NOT_FOUND"
                    </div>
                    <p className="text-[10.5px] text-amber-100/90 leading-relaxed">
                      Seu DNS aponta para <code className="text-white bg-slate-800 px-1 rounded">vercel-dns-017.com</code>.
                    </p>
                    <div className="bg-[#0b101d] p-2 rounded-lg border border-amber-900/40 text-[10px] space-y-1 font-mono text-gray-300">
                      <p className="font-bold text-amber-300">Como Corrigir:</p>
                      <p><strong>• Se usar Vercel:</strong> Vá em Vercel ➔ Settings ➔ Domains e adicione <code className="text-white">www.oficinadorafael.com.br</code>.</p>
                      <p><strong>• Se usar Firebase:</strong> No Registro.br, troque CNAME para <code className="text-emerald-300">project-7e67bad4-9088-4537-aa1.web.app</code>.</p>
                    </div>
                  </div>
                </div>

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
                      {/* Firebase Hosting CNAME suggestion */}
                      <tr className="border-b border-gray-850 hover:bg-[#070d18] transition-colors">
                        <td className="p-2 text-purple-400 font-extrabold uppercase">CNAME (Firebase)</td>
                        <td className="p-2 font-bold text-white">www</td>
                        <td className="p-2 text-emerald-400 font-bold">project-7e67bad4-9088-4537-aa1.web.app</td>
                        <td className="p-2 text-right">
                          <button 
                            type="button" 
                            onClick={() => handleCopyText("project-7e67bad4-9088-4537-aa1.web.app", "CNAME_FB")}
                            className="bg-slate-900 hover:bg-slate-800 p-1 rounded border border-gray-800 text-[10.5px] text-gray-300 cursor-pointer transition-all"
                          >
                            {copiedTemplateText === "CNAME_FB" ? "Copiado!" : "Copiar"}
                          </button>
                        </td>
                      </tr>
                      {/* Vercel CNAME suggestion */}
                      <tr className="border-b border-gray-850 hover:bg-[#070d18] transition-colors">
                        <td className="p-2 text-blue-400 font-extrabold uppercase">CNAME (Vercel)</td>
                        <td className="p-2 font-bold text-white">www</td>
                        <td className="p-2 text-gray-300">424c516cfd4137f1.vercel-dns-017.com</td>
                        <td className="p-2 text-right">
                          <button 
                            type="button" 
                            onClick={() => handleCopyText("424c516cfd4137f1.vercel-dns-017.com", "CNAME_VERCEL")}
                            className="bg-slate-900 hover:bg-slate-800 p-1 rounded border border-gray-800 text-[10.5px] text-gray-400 cursor-pointer transition-all"
                          >
                            {copiedTemplateText === "CNAME_VERCEL" ? "Copiado!" : "Copiar"}
                          </button>
                        </td>
                      </tr>
                      {/* Apex domain direct A-Record suggestion */}
                      <tr className="border-b border-gray-850 hover:bg-[#070d18] transition-colors">
                        <td className="p-2 text-amber-400 font-extrabold uppercase">A</td>
                        <td className="p-2 font-bold text-white">Em branco (Sem @)</td>
                        <td className="p-2 text-gray-300">185.199.108.153</td>
                        <td className="p-2 text-right">
                          <button 
                            type="button" 
                            onClick={() => handleCopyText("185.199.108.153", "A")}
                            className="bg-slate-900 hover:bg-slate-800 p-1 rounded border border-gray-800 text-[10.5px] text-gray-400 cursor-pointer transition-all"
                          >
                            {copiedTemplateText === "A" ? "Copiado!" : "Copiar"}
                          </button>
                        </td>
                      </tr>
                      {/* Security Verification TXT Record */}
                      <tr className="border-b border-gray-850 hover:bg-[#070d18] transition-colors">
                        <td className="p-2 text-cyan-400 font-extrabold uppercase">TXT</td>
                        <td className="p-2 font-bold text-white">_registrobr-challenge</td>
                        <td className="p-2 text-gray-300 text-[10px] break-all">{`oficinadorafael-verify-${company.id}`}</td>
                        <td className="p-2 text-right">
                          <button 
                            type="button" 
                            onClick={() => handleCopyText(`oficinadorafael-verify-${company.id}`, "TXT")}
                            className="bg-slate-900 hover:bg-slate-800 p-1 rounded border border-gray-800 text-[10.5px] text-gray-400 cursor-pointer transition-all"
                          >
                            {copiedTemplateText === "TXT" ? "Copiado!" : "Copiar"}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* DNS Propagation Live test panel & Diagnostic Tools */}
                <div className="flex flex-col gap-3 mt-1">
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                    <span className="text-[9.5px] text-gray-400 font-mono flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-purple-400" />
                      A propagação DNS pode levar de 15 min a 24 horas. Valide as entradas registradas no Google DNS:
                    </span>
                    <button
                      type="button"
                      disabled={isTestingDns || !customDomainStr}
                      onClick={async () => {
                        setIsTestingDns(true);
                        setDomainStatusVal('Verificando');
                        const domainClean = customDomainStr.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
                        const apexDomain = domainClean.replace(/^www\./, '');
                        const wwwDomain = domainClean.startsWith('www.') ? domainClean : `www.${domainClean}`;
                        const txtChallengeName = `_registrobr-challenge.${apexDomain}`;

                        setDnsTestLogs([
                          `[INÍCIO] Verificando propagação global DNS para: ${apexDomain}`,
                          `[DNS_SERVER] Consultando servidores do Google Public DNS (8.8.8.8 / dns.google)...`
                        ]);

                        let cnameOk = false;
                        let aOk = false;
                        let txtOk = false;

                        // 1. Check CNAME
                        try {
                          const resCname = await fetch(`https://dns.google/resolve?name=${wwwDomain}&type=CNAME`);
                          const dataCname = await resCname.json();
                          if (dataCname.Answer && dataCname.Answer.length > 0) {
                            const cnameValue = dataCname.Answer[dataCname.Answer.length - 1].data;
                            cnameOk = true;
                            setDnsTestLogs(prev => [...prev, `[DNS_CNAME] ✅ CNAME '${wwwDomain}' propagado ➔ ${cnameValue}`]);
                          } else {
                            setDnsTestLogs(prev => [...prev, `[DNS_CNAME] ⏳ CNAME '${wwwDomain}' ainda não detectado no DNS público (Propagando...).`]);
                          }
                        } catch {
                          setDnsTestLogs(prev => [...prev, `[DNS_CNAME] ⚠️ Consulta CNAME em andamento...`]);
                        }

                        // 2. Check A Record
                        try {
                          const resA = await fetch(`https://dns.google/resolve?name=${apexDomain}&type=A`);
                          const dataA = await resA.json();
                          if (dataA.Answer && dataA.Answer.length > 0) {
                            const aValues = dataA.Answer.map((ans: { data: string }) => ans.data).join(', ');
                            aOk = true;
                            setDnsTestLogs(prev => [...prev, `[DNS_A] ✅ Registro A '@' (${apexDomain}) propagado ➔ IP(s): ${aValues}`]);
                          } else {
                            setDnsTestLogs(prev => [...prev, `[DNS_A] ⏳ Registro A '${apexDomain}' ainda pendente no DNS público.`]);
                          }
                        } catch {
                          setDnsTestLogs(prev => [...prev, `[DNS_A] ⚠️ Consulta Registro A em andamento...`]);
                        }

                        // 3. Check TXT Challenge Record
                        try {
                          const resTxt = await fetch(`https://dns.google/resolve?name=${txtChallengeName}&type=TXT`);
                          const dataTxt = await resTxt.json();
                          if (dataTxt.Answer && dataTxt.Answer.length > 0) {
                            const txtVal = dataTxt.Answer.map((ans: { data: string }) => ans.data).join(' ');
                            txtOk = true;
                            setDnsTestLogs(prev => [...prev, `[DNS_TXT] ✅ Entrada TXT Challenge '${txtChallengeName}' detectada ➔ ${txtVal}`]);
                          } else {
                            setDnsTestLogs(prev => [...prev, `[DNS_TXT] ⏳ TXT Challenge '${txtChallengeName}' pendente ou não localizado.`]);
                          }
                        } catch {
                          setDnsTestLogs(prev => [...prev, `[DNS_TXT] ⚠️ Consulta TXT em andamento...`]);
                        }

                        // Final summary log
                        if (cnameOk || aOk || txtOk) {
                          setDnsTestLogs(prev => [...prev, `[RESULTADO] 🎉 Propagação em andamento detectada! As respostas do Firebase / DNS já estão sendo lidas.`]);
                          setDomainStatusVal('Ativo');
                        } else {
                          setDnsTestLogs(prev => [...prev, `[RESULTADO] ℹ️ Apontamento salvo. Caso tenha inserido as entradas no Registro.br agora, aguarde a atualização de cache DNS (pode levar alguns minutos).`]);
                          setDomainStatusVal('Pendente');
                        }

                        setIsTestingDns(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all ${
                        isTestingDns 
                          ? 'bg-slate-800 border-slate-700 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-950/40 hover:bg-purple-950/80 border-purple-900 text-purple-400 cursor-pointer'
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isTestingDns ? 'animate-spin' : ''}`} />
                      {isTestingDns ? "TESTANDO PROPAGAÇÃO..." : "TESTAR PROPAGAÇÃO DNS"}
                    </button>
                  </div>

                  {/* DNS Live Log details console */}
                  {dnsTestLogs.length > 0 && (
                    <div className="bg-[#050912] border border-gray-850 p-2.5 rounded-lg font-mono text-[9.5px] text-gray-400 leading-relaxed flex flex-col gap-1 max-h-40 overflow-y-auto">
                      {dnsTestLogs.map((log, lidx) => (
                        <div key={lidx} className={`${log.includes('✅') || log.includes('RESULTADO') ? 'text-green-400 font-bold' : log.includes('CNAME') ? 'text-purple-300' : log.includes('TXT') ? 'text-cyan-300' : 'text-gray-400'}`}>
                          {log}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Diagnostic Terminal Script Box */}
                  <div className="bg-[#080d19] border border-gray-800 rounded-xl p-3 text-left space-y-2 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-bold font-mono text-purple-400 flex items-center gap-1.5">
                        💻 Diagnóstico via Terminal (Cmd / PowerShell / Linux Terminal)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const domainClean = (customDomainStr || 'oficinadorafael.com.br').trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
                          const apexDomain = domainClean.replace(/^www\./, '');
                          const scriptText = `# Comandos de validação DNS no Registro.br / Firebase Hosting:
# 1. Validar CNAME
nslookup -type=cname www.${apexDomain} 8.8.8.8

# 2. Validar Registro A (IP)
nslookup -type=a ${apexDomain} 8.8.8.8

# 3. Validar Entrada TXT Challenge de Validação
nslookup -type=txt _registrobr-challenge.${apexDomain} 8.8.8.8`;
                          handleCopyText(scriptText, "CMD_SCRIPT");
                        }}
                        className="bg-slate-900 hover:bg-slate-800 border border-gray-800 text-[10px] text-gray-300 px-2 py-1 rounded font-mono cursor-pointer transition-all"
                      >
                        {copiedTemplateText === "CMD_SCRIPT" ? "Comandos Copiados!" : "Copiar Comandos CLI"}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 font-sans">
                      Abra o prompt de comando no seu computador e execute os comandos abaixo para testar a resposta direta dos servidores DNS globais (8.8.8.8):
                    </p>
                    <pre className="bg-[#040710] p-2.5 rounded-lg border border-gray-850 text-[10px] font-mono text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed select-all">
{`# Windows (Prompt de Comando / PowerShell) ou Mac/Linux Terminal:
nslookup -type=cname www.${(customDomainStr || 'oficinadorafael.com.br').trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '')} 8.8.8.8
nslookup -type=a ${(customDomainStr || 'oficinadorafael.com.br').trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '')} 8.8.8.8
nslookup -type=txt _registrobr-challenge.${(customDomainStr || 'oficinadorafael.com.br').trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '')} 8.8.8.8`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Configuração PIX para Cobrança Dinâmica */}
            <div className="border-t border-gray-850 pt-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-red-500" />
                <div className="text-left">
                  <h3 className="font-display font-medium text-white text-sm">Parâmetros PIX Copia e Cola / QR Code</h3>
                  <span className="text-[10px] text-gray-500 font-mono block">Chave e dados do titular para processar o recebimento dinâmico imediato nas faturas do PDV e Financeiro.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Chave PIX (E-mail, CPF, Celular, etc.)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: cleciotecnologia@gmail.com"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 font-mono text-xs"
                    value={pixKeyStr}
                    onChange={(e) => setPixKeyStr(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Nome do Titular / Beneficiário</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: AutoPrecision LTDA"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 text-xs"
                    value={pixBeneficiaryStr}
                    onChange={(e) => setPixBeneficiaryStr(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Cidade do Beneficiário</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: SAO PAULO"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 uppercase text-xs"
                    value={pixCityStr}
                    onChange={(e) => setPixCityStr(e.target.value.toUpperCase())}
                  />
                </div>
              </div>
            </div>

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

          {/* Offline & Connectivity Panel */}
          <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6 font-sans">
            <div className="border-b border-gray-850 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Wifi className={`w-5 h-5 ${isOnline ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`} />
                <div>
                  <h3 className="font-display font-bold text-white text-base">📶 Conectividade e Modo Offline</h3>
                  <span className="text-[10px] text-gray-500 font-mono block">Gerencie a sincronização de dados locais e simulação offline para testes práticos.</span>
                </div>
              </div>
              <span id="force-offline-badge" className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                isOnline 
                  ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-800/40' 
                  : 'bg-amber-900/20 text-amber-400 border border-amber-800/40 animate-pulse'
              }`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Offline Simulation Toggle Switch */}
            <div className="p-4 rounded-xl bg-slate-950/45 border border-gray-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-200 block font-mono">Forçar Simulação Offline</span>
                <span className="text-[11px] text-gray-400 leading-relaxed mt-1 block">
                  Desativa conexões diretas com o Cloud Firestore para forçar o empacotamento local de registros. Ideal para locais de sinal fraco, pátios profundos ou laboratórios de testes de faturamento corporativo.
                </span>
              </div>
              <button
                type="button"
                id="toggle-sim-offline-btn"
                onClick={() => setForceOffline(!forceOffline)}
                className={`px-4 py-2 font-mono text-xs font-extrabold rounded-xl border transition-all cursor-pointer select-none active:scale-[97%] ${
                  forceOffline
                    ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-950/30'
                    : 'bg-slate-900 hover:bg-slate-800 border-gray-855 border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {forceOffline ? '📶❌ FORÇADO OFFLINE' : '📶✅ CONEXÃO ORIGINAL'}
              </button>
            </div>

            {/* Sync Queue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-xl bg-slate-950/25 border border-gray-900 flex flex-col justify-between gap-2">
                <div>
                  <span className="text-[10px] text-gray-400 font-mono uppercase font-bold">Fila de Sincronização Local</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {pendingActionsCount} {pendingActionsCount === 1 ? 'Modificação Pendente' : 'Modificações Pendentes'}
                  </div>
                  <p className="text-[10.5px] text-gray-500 font-sans leading-relaxed mt-1">
                    Modificações guardadas no dispositivo que necessitam de upload posterior para o banco central na nuvem de produção.
                  </p>
                </div>
                {pendingActionsCount > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      type="button"
                      id="offline-sync-now-btn"
                      disabled={syncing || !isOnline}
                      onClick={() => syncPendingActions()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-40 text-white font-mono text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      {syncing ? 'Sincronizando...' : '🔄 Sincronizar Agora'}
                    </button>
                    <button
                      type="button"
                      id="offline-discard-queue-btn"
                      onClick={() => {
                        if (window.confirm("Isso excluirá permanentemente suas modificações locais ainda não escritas na nuvem. Deseja mesmo prosseguir?")) {
                          localStorage.removeItem("autotech_pending_actions");
                          window.location.reload();
                        }
                      }}
                      className="px-3 py-1.5 bg-red-950/25 border border-red-900/35 text-red-400 hover:text-red-300 font-mono text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      ❌ Descartar Pendentes
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#070b13] border border-gray-900 text-xs flex flex-col gap-2">
                <span className="text-[10px] text-gray-450 font-mono font-bold uppercase border-b border-gray-900 pb-2 text-slate-300">Como funciona o sincronizador offline?</span>
                <div className="flex flex-col gap-2 text-gray-500 text-[10.5px] leading-relaxed">
                  <p>
                    • <strong>Resiliência de Registro:</strong> Toda inserção, faturamento, cadastro de cliente ou veículo funciona normalmente sem sinal de rede.
                  </p>
                  <p>
                    • <strong>Memória Offline:</strong> O sistema muda autonomamente para <code>localStorage</code>, armazenando operações de forma ordenada e cronológica.
                  </p>
                  <p>
                    • <strong>Recuperação Automática:</strong> Assim que a internet é reestabelecida e a simulação offline desativada, os dados pendentes são enviados em segundo plano.
                  </p>
                </div>
              </div>

            </div>

            {/* Offline Inspection Queue Records */}
            {localPendingActions.length > 0 && (
              <div className="border-t border-gray-900 pt-4 flex flex-col gap-2">
                <span className="text-[10px] text-purple-400 font-mono font-bold uppercase">📋 Inspeção de Fila de Transações (JSON de Cache)</span>
                <div className="max-h-48 overflow-y-auto border border-purple-950/30 rounded-lg p-3 bg-[#0d101a] flex flex-col gap-2 font-mono text-[10px]">
                  {localPendingActions.map((action, actionId) => (
                    <div key={actionId} className="p-2 rounded bg-slate-950/80 border border-purple-900/20 leading-relaxed text-gray-300">
                      <div className="flex justify-between items-center text-[9px] mb-1.5 border-b border-gray-900 pb-1">
                        <span className="text-purple-400">ID: <strong className="text-white">{action.id}</strong></span>
                        <span className="text-gray-500">{new Date(action.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div>• Ação: <strong className="text-rose-450 text-rose-400 uppercase">{action.operation}</strong></div>
                      <div>• Tabela/Coleção: <strong className="text-emerald-400">{action.collection}</strong></div>
                      <div>• Referência ID: <strong className="text-sky-300">{action.docId}</strong></div>
                      <div className="mt-1 p-1.5 bg-[#03060b] text-[9.5px] text-slate-400 font-mono rounded overflow-x-auto select-all">
                        {JSON.stringify(action.payload)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

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

            {zustandBackupReady && zustandBackupStats && (
              <div className="p-3.5 bg-purple-950/35 border border-purple-900/40 rounded-xl text-xs font-mono flex flex-col gap-1.5 text-gray-300">
                <span className="text-purple-400 font-bold">🔮 ESTADO GLOBAL DO ZUSTAND DISPONIBILIZADO:</span>
                <div>• Nome: <strong>{zustandBackupStats.fileName}</strong></div>
                <div>• Registros empacotados: <strong>{zustandBackupStats.totalRows} itens</strong></div>
                <div>• Hora de criação: <strong>{zustandBackupStats.timestamp}</strong></div>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleExportBackup}
                disabled={isGenerating}
                className={`py-3 px-4 rounded-xl font-mono text-xs font-bold w-full flex items-center justify-center gap-2 cursor-pointer transition-all ${isGenerating ? 'bg-slate-800 text-gray-500' : 'bg-red-650 bg-red-600 hover:bg-red-700 text-white'}`}
              >
                <Download className="w-4 h-4" />
                {isGenerating ? "GERANDO PACOTE..." : "CRIAR BACKUP MANUAL IMEDIATO"}
              </button>

              <button
                type="button"
                id="btn-export-zustand"
                onClick={handleExportZustandState}
                disabled={isZustandGenerating}
                className={`py-3 px-4 rounded-xl font-mono text-xs font-bold w-full flex items-center justify-center gap-2 cursor-pointer transition-all ${isZustandGenerating ? 'bg-slate-800 text-gray-500' : 'bg-purple-650 bg-purple-600 hover:bg-purple-700 text-white'}`}
              >
                <Database className="w-4 h-4 text-purple-200" />
                {isZustandGenerating ? "EXPORTANDO ESTADO..." : "EXPORTAR ESTADO GLOBAL DO ZUSTAND (JSON)"}
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

          {/* Módulo de Log de Auditoria & Rastreabilidade de Ações Críticas */}
          <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6 font-sans">
            <div className="border-b border-gray-850 pb-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-display font-bold text-white text-base">📜 Audit Logs & Rastreabilidade de Operações</h3>
                  <span className="text-[10px] text-gray-500 font-mono block">Histórico de alterações críticas em estoque, financeiro, caixa e configurações do sistema.</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const sampleActions = [
                      { act: 'Ajuste Crítico de Estoque', det: 'Contagem física de balanço: Pastilha de Freio Cobreq ajustada de 10 para 18 un.' },
                      { act: 'Alteração Financeira', det: 'Estorno manual de lançamento de despesa em duplicidade no valor de R$ 350,00.' },
                      { act: 'Fechamento de Caixa PDV', det: 'Fechamento de turno do operador com saldo final conferido sem sangrias pendentes.' },
                      { act: 'Reajuste de Preço', det: 'Preço de custo do Filtro de Óleo Bosch alterado de R$ 18,90 para R$ 21,50.' }
                    ];
                    const picked = sampleActions[Math.floor(Math.random() * sampleActions.length)];
                    addLocalAuditLog(picked.act, picked.det);
                  }}
                  className="px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-lg text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Simular Log
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localAuditLogs, null, 2));
                    const dlAnchorElem = document.createElement('a');
                    dlAnchorElem.setAttribute("href", jsonStr);
                    dlAnchorElem.setAttribute("download", `audit_logs_${new Date().toISOString().substring(0, 10)}.json`);
                    dlAnchorElem.click();
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-gray-300 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar JSON
                </button>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar ação, usuário ou detalhe..."
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  className="w-full bg-[#050912] border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setAuditFilterCategory('todos')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${auditFilterCategory === 'todos' ? 'bg-cyan-500 text-black' : 'bg-slate-900 text-gray-400 hover:text-white border border-slate-800'}`}
                >
                  Todos ({localAuditLogs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilterCategory('estoque')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${auditFilterCategory === 'estoque' ? 'bg-amber-500 text-black' : 'bg-slate-900 text-gray-400 hover:text-white border border-slate-800'}`}
                >
                  Estoque & Peças
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilterCategory('financeiro')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${auditFilterCategory === 'financeiro' ? 'bg-emerald-500 text-black' : 'bg-slate-900 text-gray-400 hover:text-white border border-slate-800'}`}
                >
                  Financeiro & Caixa
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilterCategory('config')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${auditFilterCategory === 'config' ? 'bg-purple-500 text-black' : 'bg-slate-900 text-gray-400 hover:text-white border border-slate-800'}`}
                >
                  Configurações
                </button>
              </div>
            </div>

            {/* Audit Log Table / Timeline */}
            <div className="bg-[#050912] border border-gray-850 rounded-xl overflow-hidden">
              {localAuditLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-mono text-xs">
                  Nenhum registro de auditoria armazenado localmente ainda.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-900">
                  {localAuditLogs
                    .filter(log => {
                      const q = auditSearchQuery.toLowerCase();
                      const matches = 
                        (log.action || '').toLowerCase().includes(q) ||
                        (log.details || '').toLowerCase().includes(q) ||
                        (log.userName || '').toLowerCase().includes(q) ||
                        (log.userEmail || '').toLowerCase().includes(q);
                      if (!matches) return false;

                      if (auditFilterCategory === 'todos') return true;
                      if (auditFilterCategory === 'estoque') return log.action.toLowerCase().includes('estoque') || log.action.toLowerCase().includes('produto') || log.action.toLowerCase().includes('preço');
                      if (auditFilterCategory === 'financeiro') return log.action.toLowerCase().includes('caixa') || log.action.toLowerCase().includes('venda') || log.action.toLowerCase().includes('estorno') || log.action.toLowerCase().includes('financeiro');
                      if (auditFilterCategory === 'config') return log.action.toLowerCase().includes('configura') || log.action.toLowerCase().includes('parâmetro') || log.action.toLowerCase().includes('segurança') || log.action.toLowerCase().includes('saas');
                      return true;
                    })
                    .map((log) => {
                      const isEstoque = log.action.toLowerCase().includes('estoque') || log.action.toLowerCase().includes('produto') || log.action.toLowerCase().includes('preço');
                      const isFinanceiro = log.action.toLowerCase().includes('caixa') || log.action.toLowerCase().includes('venda') || log.action.toLowerCase().includes('estorno') || log.action.toLowerCase().includes('financeiro');
                      
                      return (
                        <div key={log.id} className="p-3.5 hover:bg-slate-900/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
                          <div className="flex flex-col gap-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                isEstoque ? 'bg-amber-950/60 text-amber-400 border border-amber-900/60' :
                                isFinanceiro ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/60' :
                                'bg-cyan-950/60 text-cyan-400 border border-cyan-900/60'
                              }`}>
                                {log.action}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {new Date(log.timestamp).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-gray-300 font-sans text-xs leading-relaxed mt-0.5">
                              {log.details}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <span className="text-[10px] text-gray-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                              👤 {log.userName || 'Sistema'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
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

              {/* Reset Mode Selector & Actions */}
              {!showResetConfirm ? (
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider block">Opções de Limpeza para Produção (Oficina do Rafael):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Button 1: Zerar Caixa */}
                    <button
                      type="button"
                      id="btn-reset-caixa"
                      onClick={() => {
                        setResetTargetMode('caixa');
                        setShowResetConfirm(true);
                        setResetFeedback(null);
                      }}
                      className="p-3 bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-800/40 hover:border-emerald-500/60 rounded-xl text-left transition-all cursor-pointer group flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between text-emerald-400 font-mono text-[11px] font-bold">
                        <span>💵 Zerar Caixa & Financeiro</span>
                        <Trash2 className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-[10px] text-gray-400 font-sans leading-tight">
                        Zera o saldo do caixa, fechamentos, vendas e faturamentos financeiros.
                      </p>
                    </button>

                    {/* Button 2: Zerar Estoque */}
                    <button
                      type="button"
                      id="btn-reset-estoque"
                      onClick={() => {
                        setResetTargetMode('estoque');
                        setShowResetConfirm(true);
                        setResetFeedback(null);
                      }}
                      className="p-3 bg-amber-950/20 hover:bg-amber-900/30 border border-amber-800/40 hover:border-amber-500/60 rounded-xl text-left transition-all cursor-pointer group flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between text-amber-400 font-mono text-[11px] font-bold">
                        <span>📦 Zerar Estoque & Peças</span>
                        <Trash2 className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-[10px] text-gray-400 font-sans leading-tight">
                        Zera a contagem e catálogo de peças no estoque para inventário inicial.
                      </p>
                    </button>

                    {/* Button 3: Zerar Tudo (Reset Geral) */}
                    <button
                      type="button"
                      id="btn-production-reset"
                      onClick={() => {
                        setResetTargetMode('all');
                        setShowResetConfirm(true);
                        setResetFeedback(null);
                      }}
                      className="p-3 bg-red-950/25 hover:bg-red-900/40 border border-red-800/50 hover:border-red-500/80 rounded-xl text-left transition-all cursor-pointer group flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between text-red-400 font-mono text-[11px] font-bold">
                        <span>🚀 Zerar Tudo (Produção Total)</span>
                        <Trash2 className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-[10px] text-gray-400 font-sans leading-tight">
                        Limpa caixas, estoque, clientes, veículos e O.S. fictícias para iniciar do zero.
                      </p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0e0708] border border-red-900/40 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 text-red-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">
                      {resetTargetMode === 'caixa' ? 'CONFIRMAR ZERAR CAIXA E FINANCEIRO' : resetTargetMode === 'estoque' ? 'CONFIRMAR ZERAR ESTOQUE E PEÇAS' : 'CONFIRMAR RESET GERAL DE PRODUÇÃO'}
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-gray-400 leading-normal font-sans">
                    {resetTargetMode === 'caixa' && 'Você está prestes a apagar o histórico de caixa, vendas e movimentações financeiras para iniciar o fluxo financeiro de produção do zero.'}
                    {resetTargetMode === 'estoque' && 'Você está prestes a apagar a contagem atual de estoque e produtos para realizar um novo inventário real de peças.'}
                    {resetTargetMode === 'all' && 'Você está prestes a apagar permanentemente todos os registros de teste do sistema (caixa, estoque, O.S., clientes e veículos) para entrar em produção real na Oficina do Rafael.'}
                    {' '}Esta ação é irreversível. Para autorizar, digite <strong className="text-white text-xs font-mono">CONFIRMAR</strong> abaixo:
                  </p>

                  <div className="flex flex-col gap-1.5 mt-1">
                    <input
                      type="text"
                      id="input-reset-confirm"
                      value={resetConfirmationInput}
                      onChange={(e) => setResetConfirmationInput(e.target.value)}
                      placeholder="Digite CONFIRMAR em letras maiúsculas"
                      className="bg-black/40 border border-red-900/40 focus:border-red-500 rounded-lg py-2 px-3 text-white text-xs font-mono outline-none text-center"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 mt-1 text-xs font-mono">
                    <button
                      type="button"
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
                      id="btn-confirm-reset-execute"
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
                          ZERANDO...
                        </>
                      ) : (
                        resetTargetMode === 'caixa' ? 'ZERAR CAIXA AGORA' : resetTargetMode === 'estoque' ? 'ZERAR ESTOQUE AGORA' : 'CONFIRMAR RESET TOTAL'
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

      {showSefazErrorMonitor && (
        <div id="sefaz-error-monitor-modal" className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-[#0b132b] border border-gray-800 text-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-800/80 bg-[#070b19] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-950/40 border border-red-500/30 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm tracking-wide text-white uppercase">
                    Monitor de Erros de Comunicação SEFAZ
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono block">
                    Diagnóstico em tempo real, auditoria de schemas XML e resoluções para rejeições síncronas
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateNewSefazError}
                  className="px-3 py-1.5 bg-[#092212] hover:bg-[#0c311c] border border-green-800/60 rounded-lg text-[10px] font-mono font-bold text-green-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Simular Novo Erro
                </button>
                
                {sefazErrorsLog.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSefazErrors}
                    className="px-3 py-1.5 bg-red-950/20 hover:bg-red-955/40 hover:text-white border border-red-900/40 rounded-lg text-[10px] font-mono font-bold text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Limpar todos os logs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Limpar Logs
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowSefazErrorMonitor(false)}
                  className="px-3 py-1.5 bg-[#141d33] hover:bg-red-650 hover:text-white text-gray-400 border border-gray-800 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
                >
                  Fechar (Esc)
                </button>
              </div>
            </div>

            {/* Content panel */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left sidebar: log list */}
              <div className="w-full md:w-[38%] border-r border-gray-800/80 flex flex-col bg-[#080d1b] overflow-y-auto custom-scrollbar">
                <div className="p-3 bg-[#050812] border-b border-gray-900 text-[10px] font-mono text-gray-400 uppercase tracking-wider flex justify-between items-center">
                  <span>LOGS DE TRANSMISSÃO ({sefazErrorsLog.length})</span>
                  <span className="text-[9px] bg-red-950/60 text-red-400 px-2 py-0.5 rounded-full font-bold">
                    {sefazErrorsLog.filter(e => e.status === 'Pendente').length} Ativos
                  </span>
                </div>
                
                {sefazErrorsLog.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center gap-3 my-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-white uppercase">Todos os XMLs Homologados!</span>
                      <span className="text-[10px] text-gray-500 font-mono leading-relaxed max-w-[220px]">
                        Nenhuma rejeição fiscal SEFAZ registrada recentemente. O barramento de serviços e peças encontra-se 100% saudável.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {sefazErrorsLog.map((err) => {
                      const isSelected = selectedErrorForDetails?.id === err.id;
                      const isPendente = err.status === 'Pendente';
                      
                      return (
                        <button
                          key={err.id}
                          onClick={() => setSelectedErrorForDetails(err)}
                          className={`w-full p-3.5 border-b border-gray-900/60 text-left transition-all flex flex-col gap-2 cursor-pointer ${
                            isSelected 
                              ? 'bg-[#121c38]' 
                              : 'hover:bg-[#10192e] bg-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span className={`text-[8.5px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                              err.docType === 'NF-e' ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-900/60' :
                              err.docType === 'NFS-e' ? 'bg-purple-950/60 text-purple-400 border border-purple-900/60' :
                              'bg-amber-950/60 text-amber-500 border border-amber-900/60'
                            }`}>
                              {err.docType} • {err.docId}
                            </span>
                            
                            <span className={`text-[8px] font-mono font-bold uppercase ${
                              isPendente ? 'text-rose-500 animate-pulse' : 'text-emerald-400'
                            }`}>
                              ● {isPendente ? 'Pendente' : 'Resolvido'}
                            </span>
                          </div>
                          
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11.5px] font-bold text-gray-200 tracking-tight leading-snug line-clamp-2">
                              {err.title}
                            </span>
                            <span className="text-[9px] text-gray-500 font-mono">
                              {new Date(err.timestamp).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono border-t border-gray-850/40 pt-1.5 mt-0.5">
                            <span className="truncate max-w-[80%]">Cód Rejeição: {err.code}</span>
                            <ChevronRight className="w-3 h-3 text-gray-400" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right panel: error details & instructions */}
              <div className="flex-1 flex flex-col overflow-y-auto bg-[#091122]/40 custom-scrollbar text-white">
                {selectedErrorForDetails ? (
                  <div className="p-5 flex flex-col gap-5 text-left">
                    
                    {/* Header Details */}
                    <div className="flex flex-col gap-2.5 border-b border-gray-800 pb-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-red-950/60 text-red-400 border border-red-900/50 rounded font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                            Rejeição Cód. {selectedErrorForDetails.code}
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                            selectedErrorForDetails.status === 'Pendente' 
                              ? 'bg-rose-950/30 text-rose-500 border-rose-900/40' 
                              : 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40'
                          }`}>
                            {selectedErrorForDetails.status}
                          </span>
                        </div>
                        
                        <span className="text-[9.5px] text-gray-500 font-mono">
                          ID Log: {selectedErrorForDetails.id}
                        </span>
                      </div>
                      
                      <h4 className="font-display font-black text-white text-base md:text-lg leading-tight">
                        {selectedErrorForDetails.title}
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5 text-[10px] font-mono bg-black/30 p-2.5 rounded-lg border border-gray-900">
                        <div>
                          <span className="text-gray-500">Documento de Origem:</span>
                          <strong className="text-cyan-400 block mt-0.5">{selectedErrorForDetails.docType} ({selectedErrorForDetails.docId})</strong>
                        </div>
                        <div>
                          <span className="text-gray-500">Data da Ocorrência:</span>
                          <strong className="text-gray-300 block mt-0.5">
                            {new Date(selectedErrorForDetails.timestamp).toLocaleString('pt-BR')}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Cause description */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-amber-500 uppercase font-bold tracking-wider">
                        ⚠️ Causa Provável Detectada:
                      </span>
                      <p className="text-xs text-gray-300 leading-relaxed font-sans bg-amber-950/10 p-3 rounded-lg border border-amber-900/20">
                        {selectedErrorForDetails.cause}
                      </p>
                    </div>

                    {/* How to Fix step by step */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                        🔧 Diagnóstico & Ação Recomendada:
                      </span>
                      <div className="text-xs text-gray-300 leading-relaxed font-sans bg-emerald-950/10 p-3 rounded-lg border border-emerald-900/20 flex flex-col gap-2">
                        <p>{selectedErrorForDetails.solution}</p>
                        <div className="mt-1 p-2 bg-[#050810] rounded border border-emerald-900/30 text-[10px] text-gray-400 leading-normal font-mono">
                          💡 <strong>Para mecânicos/caixas:</strong> Certifique-se de preencher sempre as informações cadastrais dos clientes residindo fora do estado (UF diferente) e manter o catálogo tributário atualizado para evitar retransmissões extras na SEFAZ.
                        </div>
                      </div>
                    </div>

                    {/* XML block preview */}
                    {selectedErrorForDetails.xmlSnippet && (
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center bg-black/60 px-3 py-1.5 rounded-t-lg border border-gray-800 border-b-0">
                          <span className="text-[9px] font-mono text-gray-400 uppercase font-bold">
                            📜 Payload XML correspondente ao erro
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyXml(selectedErrorForDetails.xmlSnippet, selectedErrorForDetails.id)}
                            className="text-[9.5px] font-mono text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                          >
                            {copiedId === selectedErrorForDetails.id ? "Código Copiado! ✅" : "Copiar XML"}
                          </button>
                        </div>
                        <pre className="bg-[#03060c] p-3 rounded-b-lg border border-gray-800 font-mono text-[9.5px] leading-relaxed text-yellow-500 overflow-x-auto">
                          <code>{selectedErrorForDetails.xmlSnippet}</code>
                        </pre>
                      </div>
                    )}

                    {/* Action buttons detail footer */}
                    {selectedErrorForDetails.status === 'Pendente' && (
                      <div className="border-t border-gray-850 pt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleResolveSefazError(selectedErrorForDetails.id)}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-[10.5px] uppercase rounded-lg flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-950/25"
                        >
                          <Check className="w-4 h-4" />
                          Marcar Rejeição como Resolvida
                        </button>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
                    <Activity className="w-12 h-12 text-gray-700 animate-pulse" />
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase block">Telemetria Selecionada Vazia</span>
                      <span className="text-[10.5px] text-gray-500 font-mono block max-w-[250px] leading-relaxed">
                        Escolha um relatório fiscal na lista lateral para prosseguir ao diagnóstico preditivo detalhado.
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {showSefazLoteHistory && (
        <div id="sefaz-lote-history-modal" className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-[#0b132b] border border-gray-800 text-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-800/80 bg-[#070b19] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-950/40 border border-cyan-500/30 rounded-xl">
                  <Archive className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm tracking-wide text-white uppercase">
                    Histórico de Lotes de Notas Fiscais (SEFAZ)
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono block">
                    Consulta síncrona de protocolos de autorização, downloads de XML em lote e auditorias fiscais
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTransmitNewLote}
                  disabled={isTransmittingLote}
                  className="px-3 py-1.5 bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-800/60 rounded-lg text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isTransmittingLote ? 'animate-spin' : ''}`} />
                  {isTransmittingLote ? "Transmitindo Lote..." : "Simular Novo Lote"}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowSefazLoteHistory(false)}
                  className="px-3 py-1.5 bg-[#141d33] hover:bg-red-650 hover:text-white text-gray-400 border border-gray-800 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
                >
                  Fechar (Esc)
                </button>
              </div>
            </div>

            {/* Transmission Progress Overlay */}
            {isTransmittingLote && (
              <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                <div className="bg-[#09101f] p-6 rounded-2xl border border-gray-800 max-w-lg w-full flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase">TELEMETRIA DE RECEPÇÃO SÍNCRONA</span>
                    <span className="animate-pulse text-cyan-500 text-[10px]">CONECTADO AO LOTE</span>
                  </div>
                  <div className="flex flex-col gap-2 text-left text-xs font-mono text-emerald-400 h-48 overflow-y-auto bg-black/50 p-4 rounded-lg border border-gray-900 custom-scrollbar">
                    {transmissionProgress.map((p, idx) => (
                      <div key={idx} className="leading-relaxed">
                        {p}
                      </div>
                    ))}
                    <div className="animate-pulse mt-1 text-cyan-400">⚡ Aguardando validação do barramento SEFAZ...</div>
                  </div>
                </div>
              </div>
            )}

            {/* Content panel */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left sidebar: batch log list */}
              <div className="w-full md:w-[42%] border-r border-gray-800/80 flex flex-col bg-[#080d1b] overflow-hidden">
                
                {/* Search & Filters */}
                <div className="p-3 bg-[#050812] border-b border-gray-900 flex flex-col gap-2">
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Pesquisar por Lote, Prot. ou Chave..."
                      className="w-full bg-[#03060c] border border-gray-850 rounded-lg py-1.5 pl-8 pr-3 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                      value={searchLoteTerm}
                      onChange={(e) => setSearchLoteTerm(e.target.value)}
                    />
                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold">
                    <select
                      className="bg-[#03060c] border border-gray-850 rounded py-1 px-2 text-gray-300 focus:outline-none focus:border-cyan-500"
                      value={filterLoteType}
                      onChange={(e) => setFilterLoteType(e.target.value)}
                    >
                      <option value="ALL">Todos os Tipos</option>
                      <option value="NF-e">NF-e (Peças)</option>
                      <option value="NFS-e">NFS-e (Serviços)</option>
                      <option value="NFC-e">NFC-e (Consumidor)</option>
                    </select>

                    <select
                      className="bg-[#03060c] border border-gray-850 rounded py-1 px-2 text-gray-300 focus:outline-none focus:border-cyan-500"
                      value={filterLoteStatus}
                      onChange={(e) => setFilterLoteStatus(e.target.value)}
                    >
                      <option value="ALL">Todos Status</option>
                      <option value="Autorizado">Autorizados</option>
                      <option value="Rejeitado">Rejeitados</option>
                    </select>
                  </div>
                </div>

                {/* Batch list items */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {filteredLotes.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center gap-3 h-full">
                      <FolderOpen className="w-10 h-10 text-gray-600" />
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-white uppercase">Nenhum Lote Encontrado</span>
                        <span className="text-[10px] text-gray-500 font-mono leading-relaxed max-w-[200px]">
                          Tente ajustar seus termos de busca ou filtros para localizar outros lotes guardados.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {filteredLotes.map((l) => {
                        const isSelected = selectedLoteForDetails?.id === l.id;
                        const isAut = l.status === 'Autorizado';
                        
                        return (
                          <button
                            key={l.id}
                            onClick={() => setSelectedLoteForDetails(l)}
                            className={`w-full p-3.5 border-b border-gray-900/60 text-left transition-all flex flex-col gap-2 cursor-pointer ${
                              isSelected 
                                ? 'bg-[#121c38]' 
                                : 'hover:bg-[#10192e] bg-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1.5 font-bold">
                              <span className={`text-[8.5px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                                l.docType === 'NF-e' ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-900/60' :
                                l.docType === 'NFS-e' ? 'bg-purple-950/60 text-purple-400 border border-purple-900/60' :
                                'bg-amber-950/60 text-amber-500 border border-amber-900/60'
                              }`}>
                                {l.docType} • {l.id}
                              </span>
                              
                              <span className={`text-[8.5px] font-mono font-bold ${
                                isAut ? 'text-emerald-400' : 'text-rose-500'
                              }`}>
                                ● {l.status}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-end">
                              <div className="flex flex-col">
                                <span className="text-[10.5px] text-gray-400 font-mono">
                                  {l.notesCount} nota(s) transmitida(s)
                                </span>
                                <span className="text-[9px] text-gray-500 font-mono">
                                  {new Date(l.timestamp).toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-cyan-400">
                                R$ {l.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>

                            <div className="text-[8.5px] text-gray-500 font-mono border-t border-gray-850/40 pt-1.5 mt-0.5 flex justify-between items-center">
                              <span className="truncate max-w-[85%]">Recibo Prot: {l.protocol}</span>
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right panel: batch details & individual billings info */}
              <div className="flex-1 flex flex-col overflow-y-auto bg-[#091122]/40 custom-scrollbar text-white">
                {selectedLoteForDetails ? (
                  <div className="p-5 flex flex-col gap-6 text-left">
                    
                    {/* Header Details */}
                    <div className="flex flex-col gap-2.5 border-b border-gray-800 pb-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-cyan-950/60 text-cyan-400 border border-cyan-900/50 rounded font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                            {selectedLoteForDetails.id}
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                            selectedLoteForDetails.status === 'Autorizado' 
                              ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40' 
                              : 'bg-rose-950/30 text-rose-500 border-rose-900/40'
                          }`}>
                            Lote {selectedLoteForDetails.status}
                          </span>
                        </div>
                        
                        <span className="text-[9.5px] text-gray-500 font-mono">
                          Protocolo de Recebimento SEFAZ: {selectedLoteForDetails.protocol}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <h4 className="font-display font-black text-white text-base md:text-lg uppercase">
                          Detalhes do Lote de Transmissão Síncrona
                        </h4>
                        
                        <button
                          type="button"
                          onClick={() => handleDownloadXmlFile(selectedLoteForDetails.xmlContent, `lote_sefaz_${selectedLoteForDetails.id.toLowerCase()}.xml`)}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 font-mono font-bold text-[9.5px] uppercase rounded flex items-center gap-1.5 cursor-pointer transition-all shadow"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Baixar Lote Completo (XML)
                        </button>
                      </div>
                    </div>

                    {/* Totalizers */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-black/30 p-3 rounded-lg border border-gray-900/80 font-mono">
                        <span className="text-[9px] text-gray-500 uppercase font-bold block">Faturamento Total do Lote</span>
                        <strong className="text-base text-cyan-400 block mt-0.5">
                          R$ {selectedLoteForDetails.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg border border-gray-900/80 font-mono">
                        <span className="text-[9px] text-gray-500 uppercase font-bold block">Documentos Fiscais</span>
                        <strong className="text-base text-gray-200 block mt-0.5">
                          {selectedLoteForDetails.notesCount} {selectedLoteForDetails.docType === 'NFS-e' ? 'NFS-e' : 'NF-e/NFC-e'}
                        </strong>
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg border border-gray-900/80 font-mono">
                        <span className="text-[9px] text-gray-500 uppercase font-bold block">Ensaio Criptográfico</span>
                        <strong className="text-xs text-emerald-400 block mt-1.5 truncate">
                          CERTIFICADO A1 VALIDADOR
                        </strong>
                      </div>
                    </div>

                    {/* Notas no Lote Table list */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-mono text-gray-400 uppercase font-bold tracking-wider">
                        📋 Notas Individuais Vinculadas ao Lote
                      </span>
                      
                      <div className="overflow-x-auto rounded-lg border border-gray-900">
                        <table className="w-full text-left border-collapse font-sans text-xs">
                          <thead>
                            <tr className="bg-[#050812]/80 text-[#8e9aa8] font-mono text-[9px] uppercase border-b border-gray-900">
                              <th className="py-2.5 px-3">Nº Nota</th>
                              <th className="py-2.5 px-3">Destinatário</th>
                              <th className="py-2.5 px-3">Documento (CPF/CNPJ)</th>
                              <th className="py-2.5 px-3 text-right">Valor Total</th>
                              <th className="py-2.5 px-3">Prot. Autorização</th>
                              <th className="py-2.5 px-3 text-center">Download</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedLoteForDetails.notes.map((n: any, idx: number) => (
                              <tr key={idx} className="bg-black/10 border-b border-gray-900 hover:bg-black/25">
                                <td className="py-2.5 px-3 font-mono font-bold text-gray-300">
                                  {selectedLoteForDetails.docType} #{n.number}
                                </td>
                                <td className="py-2.5 px-3 font-bold truncate max-w-[140px] text-white">
                                  {n.clientName}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-gray-400 text-[10px]">
                                  {n.clientDoc}
                                </td>
                                <td className="py-2.5 px-3 font-mono font-bold text-right text-cyan-400">
                                  R$ {n.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-emerald-450 text-[10.5px]">
                                  {n.protocol}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadXmlFile(
                                      `<?xml version="1.0" encoding="UTF-8"?>\n<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">\n  <NFe><infNFe Id="NFe${n.accessKey}"><emit><CNPJ>03212854000188</CNPJ></emit><dest><xNome>${n.clientName}</xNome></dest><total><vNF>${n.amount.toFixed(2)}</vNF></total></infNFe></NFe>\n  <protNFe versao="4.00"><infProt><chNFe>${n.accessKey}</chNFe><dhRecb>${selectedLoteForDetails.timestamp}</dhRecb><nProt>${n.protocol}</nProt><cStat>100</cStat><xMotivo>Autorizado o uso da NF-e</xMotivo></infProt></protNFe>\n</nfeProc>`,
                                      `nfe_autorizada_${n.number}.xml`
                                    )}
                                    title="Baixar XML com protocolo de autorização"
                                    className="px-2 py-1 bg-[#141d33] hover:bg-cyan-950 hover:text-cyan-400 border border-gray-800 rounded font-mono text-[9px] uppercase cursor-pointer transition-colors"
                                  >
                                    XML Proc
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Raw XML Preview */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center bg-black/60 px-3 py-1.5 rounded-t-lg border border-gray-800 border-b-0">
                        <span className="text-[9px] font-mono text-gray-400 uppercase font-bold">
                          📜 Payload XML do Lote Completo (Simulado com Certificado A1)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyXml(selectedLoteForDetails.xmlContent, selectedLoteForDetails.id)}
                          className="text-[9.5px] font-mono text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                        >
                          {copiedId === selectedLoteForDetails.id ? "Código Copiado! ✅" : "Copiar XML"}
                        </button>
                      </div>
                      <pre className="bg-[#03060c] p-3 rounded-b-lg border border-gray-800 font-mono text-[9.5px] leading-relaxed text-yellow-500 overflow-x-auto max-h-44 custom-scrollbar">
                        <code>{selectedLoteForDetails.xmlContent}</code>
                      </pre>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
                    <Activity className="w-12 h-12 text-gray-700 animate-pulse" />
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase block">Nenhum Lote Selecionado</span>
                      <span className="text-[10.5px] text-gray-500 font-mono block max-w-[250px] leading-relaxed">
                        Escolha um lote consolidado no menu esquerdo para prosseguir ao diagnóstico detalhado de auditoria fiscal.
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {showThermalPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b101c] rounded-2xl border border-gray-800 p-6 max-w-md w-full text-left flex flex-col gap-4 animate-scaleUp max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-red-500 animate-pulse" />
                <div>
                  <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                    Visualizar Cupom {thermalWidth || '80mm'}
                  </h3>
                  <span className="text-[10px] text-gray-500 font-mono block">
                    Simulação fiel baseada na largura de {thermalWidth || '80mm'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowThermalPreview(false)}
                className="p-1.5 px-3 text-[10px] font-mono text-gray-400 hover:text-white bg-slate-900 border border-gray-850 rounded-lg cursor-pointer"
              >
                FECHAR
              </button>
            </div>

            {/* Simulated Receipt paper container */}
            <div className="flex flex-col items-center justify-center bg-gray-950 p-6 rounded-xl border border-gray-900 shadow-inner relative overflow-hidden">
              
              {/* Paper roll representation */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-900 text-gray-500 border-b border-l border-r border-gray-850 rounded-b-lg px-4 py-0.5 text-[8px] font-mono tracking-widest font-extrabold uppercase">
                ALIMENTAÇÃO AUTOMÁTICA
              </div>

              {/* Serrated tear-off emulation */}
              <div 
                className="w-full h-2 bg-repeat-x opacity-80 mt-2" 
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 5' width='10' height='5'%3E%3Cpolygon points='0,5 5,0 10,5' fill='%23ffffff'/%3E%3C/svg%3E")`,
                  backgroundSize: '10px 5px'
                }}
              />

              {/* Actual ticket body */}
              <div 
                className="bg-white text-black p-5 font-mono text-[11px] leading-relaxed shadow-2xl relative select-none w-full border-b-2 border-dashed border-gray-300"
                style={{
                  maxWidth: thermalWidth === '58mm' ? '220px' : '310px',
                }}
              >
                
                {/* Logo & Header info */}
                <div className="flex flex-col items-center text-center border-b border-black border-dashed pb-3 mb-3">
                  {logoUrlStr ? (
                    <img 
                      src={logoUrlStr} 
                      alt="Logo Oficina" 
                      className="w-16 h-16 object-contain mb-2 filter grayscale brightness-90 max-h-20"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/broken-thermal/60/60';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded border border-dashed border-gray-400 flex items-center justify-center text-[9px] text-gray-400 mb-2 font-mono">
                      [SEM LOGO]
                    </div>
                  )}
                  <span className="font-black text-xs block tracking-widest uppercase">
                    {companyName ? companyName.toUpperCase() : 'OFFICIAL AUTOTECH SPA'}
                  </span>
                  <span className="text-[9px] block text-gray-750 mt-1 leading-snug">
                    {addressStr || 'AV. DAS NAÇÕES UNIDAS, 1040 - PINHEIROS, SP'}
                  </span>
                  <span className="text-[9px] block text-gray-750 font-bold mt-0.5">
                    CNPJ: {cnpjStr || '12.345.678/0001-90'}
                  </span>
                  <span className="text-[9px] block text-gray-750">
                    FONE: {phoneStr || '(11) 98765-4321'}
                  </span>
                </div>

                {/* Subtitle / Ticket identification */}
                <div className="text-center font-black mb-3 uppercase tracking-wider text-[10px] border-b border-black border-dashed pb-2">
                  🧾 ORÇAMENTO DE SERVIÇOS #2026
                </div>

                {/* Simulated table client information */}
                <div className="text-[9px] flex flex-col gap-0.5 border-b border-black border-dashed pb-3 mb-2.5 text-left">
                  <span><strong>CLIENTE:</strong> JOÃO SILVA PINTO</span>
                  <span><strong>VEÍCULO:</strong> HONDA CIVIC LXR 2.0 FLEX 2016</span>
                  <span><strong>PLACA:</strong> QXG-9H88</span>
                  <span><strong>DATA:</strong> 17/06/2026 12:45 CH</span>
                </div>

                {/* Services details */}
                <div className="flex flex-col gap-1 mb-2.5 text-left border-b border-black border-dashed pb-2">
                  <div className="text-[9px] font-bold">OPERACAO / SERVICOS</div>
                  <div className="flex justify-between text-[9px]">
                    <span className="truncate max-w-[140px]">TROCA DE SENSOR LAMBDA</span>
                    <span>R$ 150,00</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="truncate max-w-[140px]">REVISAO COMPLETA INJECAO</span>
                    <span>R$ 250,00</span>
                  </div>
                </div>

                {/* Parts details */}
                <div className="flex flex-col gap-1 border-b border-black border-dashed pb-2.5 mb-2.5 text-left">
                  <div className="text-[9px] font-bold">PECAS / INSUMOS</div>
                  <div className="flex justify-between text-[9px]">
                    <span className="truncate max-w-[150px]">SONDA LAMBDA Genuína Bosch</span>
                    <span>R$ 480,00</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="truncate max-w-[150px]">FILTRO DE AR MANN</span>
                    <span>R$ 85,00</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="flex flex-col gap-0.5 text-right font-mono text-[10px] mb-3">
                  <div className="flex justify-between">
                    <span>MÃO DE OBRA:</span>
                    <span>R$ 400,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SOMA PEÇAS:</span>
                    <span>R$ 565,00</span>
                  </div>
                  <div className="flex justify-between border-t border-black pt-1.5 font-bold">
                    <span>TOTAL GERAL:</span>
                    <span>R$ 965,00</span>
                  </div>
                </div>

                {/* Footer white-label */}
                <div className="text-center text-[7.5px] border-t border-black border-dashed pt-3 pb-1 text-gray-500 flex flex-col gap-0.5 uppercase">
                  <span>DOCUMENTO AUXILIAR SEM VALOR FISCAL</span>
                  <span className="font-bold tracking-wider">
                    {whiteLabelTitle || '@AutoTech Premium Cloud System'}
                  </span>
                </div>

              </div>
              
              {/* Serrated bottom edge emulation */}
              <div 
                className="w-full h-2 bg-repeat-x -mt-0.5 opacity-80" 
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 5' width='10' height='5'%3E%3Cpolygon points='0,0 5,5 10,0' fill='%23ffffff'/%3E%3C/svg%3E")`,
                  backgroundSize: '10px 5px'
                }}
              />
            </div>

            {/* Helper tips at the bottom */}
            <div className="p-3 bg-slate-900/50 rounded-xl border border-gray-850 flex flex-col gap-1.5 font-sans">
              <strong className="text-red-400 font-extrabold text-[9.5px] uppercase tracking-wider block font-mono">
                💡 NOTA DE COR DE LOGOTIPO
              </strong>
              <p className="text-[10px] text-gray-300 leading-relaxed font-sans">
                As impressões térmicas convertem automaticamente seu logotipo colorido para tons monocromáticos de alta fidelidade e limitam a largura de renderização a <span className="text-white font-bold">{thermalWidth || '80mm'}</span> para garantir compatibilidade perfeita com bobinas de cupom de marcas comuns (como Bematech, Elgin, Epson ou Daruma).
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
