/**
 * Type declarations for the Auto Parts Store & Mechanic Shop ERP SaaS.
 */

export type UserRole = 'Administrador' | 'Gerente' | 'Mecânico' | 'Caixa' | 'Estoquista';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  empresaId: string;
  createdAt: string;
  reversalPassword?: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  address: string;
  planId: 'Básico' | 'Profissional' | 'Premium';
  createdAt: string;
  logoUrl?: string;
  email?: string;
  whatsapp?: string;
  latitude?: number;
  longitude?: number;
  customDomain?: string;
  subdomain?: string;
  domainStatus?: 'Pendente' | 'Verificando' | 'Ativo' | 'Falhado';
  cep?: string;
  pixKey?: string;
  pixBeneficiary?: string;
  pixCity?: string;
  defaultMarkup?: number;
  customPortalSlug?: string;
  warrantyDays?: number;
  fiscalNfseEnabled?: boolean;
  fiscalNfeEnabled?: boolean;
  fiscalStateUf?: string;
  fiscalCertificateUploaded?: boolean;
  fiscalCertificateName?: string;
  fiscalPassword?: string;
  fiscalTokenProvider?: string;
  fiscalEnvironment?: 'Homologação' | 'Produção';
  fiscalMunicipalKey?: string;
  fiscalIM?: string;
  fiscalIE?: string;
  fiscalWebhookUrl?: string;
  fiscalServiceSeries?: string;
  fiscalServiceInitialNum?: number;
  fiscalAutoEmitOnOSClose?: boolean;
  fiscalSeriesList?: FiscalSeries[];
  fiscalTaxRules?: FiscalTaxRule[];
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSecure?: boolean;
}

export interface FiscalSeries {
  id: string;
  type: 'NFS-e' | 'NF-e' | 'NFC-e';
  series: string;
  nextNumber: number;
  isActive: boolean;
}

export interface FiscalTaxRule {
  id: string;
  uf: string;
  cfop: string;
  icmsAliquota: number;
  ipiAliquota: number;
  description: string;
  isActive: boolean;
}

export interface Cliente {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpfCnpj: string;
  empresaId: string;
  oilChangeAlert: boolean; // Automatic notification on oil cycles
  reviewAlert: boolean;    // Next review date tracking
  createdAt: string;
  cep?: string;
  address?: string;
  nextReviewDate?: string; // Next scheduled/recommended preventive review date (YYYY-MM-DD)
  limitAmount?: number;    // Credit limit for "Fatura" payment option
  limitStatus?: 'Pendente' | 'Aprovado' | 'Recusado'; // Admin approval status for credit limit
  usedLimit?: number;      // Current credit amount used
}

export interface Veiculo {
  id: string;
  clienteId: string;
  brand: string;
  model: string;
  year: string;
  engine: string; // e.g. "1.0 Turbo", "2.0 Flex"
  plate: string;
  chassi?: string;
  km: number;
  empresaId: string;
}

export interface Produto {
  id: string;
  name: string;
  brand: string;
  internalSku: string;
  barcode: string;
  category: string;
  compatibility: string; // Compatible car models
  manufacturer: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;
  minStock: number;
  photo?: string;
  empresaId: string;
  fornecedorId?: string;
}

export interface SaleItem {
  produtoId: string;
  name: string;
  sellPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Venda {
  id: string;
  empresaId: string;
  date: string;
  clienteId?: string;
  clienteName?: string;
  items: SaleItem[];
  discount: number;
  total: number;
  paymentMethod: 'PIX' | 'Cartão' | 'Dinheiro' | 'Fatura';
  commission: number; // calculated seller fee
  sellerId: string;
  sellerName?: string;
  linkedOSId?: string;
  status?: 'paga' | 'estornada';
  justification?: string;
  pixTransactionId?: string;
}

export interface ChecklistItem {
  label: string;
  status: 'ok' | 'fail' | 'na';
}

export interface ServiceItem {
  id: string;
  description: string;
  price: number;
}

export interface Servico {
  id: string;
  name: string;
  description: string;
  price: number;
  duration?: string; // e.g. "1h", "2h", "45min"
  category: string;  // e.g. "Mecanica", "Eletrica", "Suspencao", "Injecao", "Funilaria"
  empresaId: string;
}

export interface PartUsed {
  id: string;
  name: string;
  sellPrice: number;
  quantity: number;
  suppliedByClient?: boolean;
  origin?: 'estoque' | 'cliente' | 'terceiros';
  supplierName?: string;
}

export type OSStatus = 'Aberta' | 'Em análise' | 'Aguardando peça' | 'Em execução' | 'Finalizada' | 'Entregue' | 'Garantia Reaberta' | 'Agendada';

export interface OSHistoryEntry {
  status: OSStatus;
  user: string;
  timestamp: string;
  notes?: string;
}

export interface OrdemServico {
  id: string;
  empresaId: string;
  clienteId: string;
  clienteName?: string;
  clientePhone?: string;
  veiculoId: string;
  veiculoInfo?: string; // e.g., "VW Gol - BRA2E19"
  plate: string;
  km: number;
  kmAnteriorEtiqueta?: number;
  problem: string;
  diagnosis: string;
  status: OSStatus;
  mechanicId: string;
  mechanicName?: string;
  services: ServiceItem[];
  parts: PartUsed[];
  checklist: ChecklistItem[];
  signature?: string; // base64 or digital sign string
  photoUrls?: string[];
  total: number;
  createdAt: string;
  updatedAt?: string;
  reminderEnabled?: boolean;
  vencimentoDays?: number;
  reminderDays?: number;
  reopenCount?: number;
  reopenedAt?: string;
  reopenReason?: string;
  statusHistory?: OSHistoryEntry[];
  statusPagamento?: 'PENDENTE' | 'PAGO';
  financeiroId?: string;
  faturamentoMode?: 'Balcão' | 'A faturar';
  scheduledDate?: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:MM
  priority?: boolean;
}

export interface Fornecedor {
  id: string;
  name: string;
  cnpj?: string;
  phone: string;
  email?: string;
  empresaId: string;
}

export interface Financeiro {
  id: string;
  empresaId: string;
  clienteId?: string;
  ordemServicoId?: string;
  description: string;
  type: 'Receita' | 'Despesa';
  amount: number;
  dueDate: string;
  status: 'Pago' | 'Pendente' | 'Cancelado' | 'PENDENTE' | 'PAGO' | 'CANCELADO';
  category: string;
  createdAt: string;
  updatedAt?: string;
  invoiceNumber?: string;       // Número da Nota Fiscal (NF-e)
  purchaseOrder?: string;       // Número do Pedido de Compra / Venda
  reminderEnabled?: boolean;    // Lembrete de vencimento ativo
  reminderDaysBefore?: number;  // Dias para alertar antes do vencimento
  supplierId?: string;          // Fornecedor vinculado (se houver)
  supplierName?: string;        // Nome amigável do Fornecedor vinculado
  pixTxid?: string;
  qrCode?: string;
  copiaECola?: string;
  valorPago?: number;
  webhookRecebido?: boolean;
  dataPagamento?: string;
}

export interface Notificacao {
  id: string;
  empresaId: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  createdAt: string;
}

export interface PixLog {
  id: string;
  empresaId: string;
  txid: string;
  evento: string;
  payload: any;
  createdAt: string;
}

export interface Caixa {
  id: string;
  empresaId: string;
  status: 'Aberto' | 'Fechado';
  initialAmount: number;
  currentAmount: number;
  openedAt: string;
  closedAt?: string;
  transactions?: {
    type: 'Suprimento' | 'Sangria' | 'Venda';
    amount: number;
    description: string;
    timestamp: string;
  }[];
}

export interface AutoBackupItem {
  id: string;
  date: string;
  totalRecords: number;
  fileName: string;
  sizeKb: number;
  payload: string; // stringified JSON
}

export interface LocalAuditLog {
  id: string;
  empresaId: string;
  action: string;
  details: string;
  userName: string;
  userEmail: string;
  timestamp: string;
}

export interface FerramentaMovimentacao {
  id: string;
  type: 'Empréstimo' | 'Devolução' | 'Manutenção' | 'Calibração';
  userName: string;
  date: string;
  details: string;
}

export interface Ferramenta {
  id: string;
  empresaId: string;
  name: string;
  code: string; // Ex: PAT-0123
  category: 'Diagnóstico' | 'Pneumática' | 'Especiais' | 'Pesadas' | 'Manuais' | 'Outros';
  status: 'Disponível' | 'Em Uso' | 'Manutenção' | 'Calibração';
  condition: 'Novo' | 'Excelente' | 'Bom' | 'Desgastado' | 'Danificado';
  location: string; // Ex: Prateleira B1, Carrinho 2
  lastCalibrationDate?: string; // YYYY-MM-DD
  nextCalibrationDate?: string; // YYYY-MM-DD
  currentUser?: string; // Nome do mecânico que retirou
  currentUserId?: string;
  notes?: string;
  history: FerramentaMovimentacao[];
}



