import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Search, 
  TrendingUp, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  X,
  CreditCard,
  Bell,
  FileText,
  ClipboardList,
  AlertTriangle,
  Clock,
  Filter,
  Check,
  QrCode,
  Copy,
  Printer,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Financeiro } from '../types';
import QRCode from 'qrcode';
import { generatePixPayload } from '../lib/pix';

export const FinanceiroView: React.FC = () => {
  const { financeiro, addFinanceiro, editFinanceiro, ordensServico, fornecedores, company, updateCompany } = useApp();

  const [searchDesc, setSearchDesc] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Todas' | 'Receita' | 'Despesa' | 'RemindersActive'>('Todas');

  // Dynamic PIX billing states for Financeiro module faturas
  const [pixSelectedReceivable, setPixSelectedReceivable] = useState<Financeiro | null>(null);
  const [financeiroPixQrDataUrl, setFinanceiroPixQrDataUrl] = useState<string>('');
  const [financeiroPixString, setFinanceiroPixString] = useState<string>('');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // States for simulated approval and partial payments
  const [pixAmountToApproveStr, setPixAmountToApproveStr] = useState<string>('');
  const [pixPaymentReceipt, setPixPaymentReceipt] = useState<{
    id: string;
    originalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    date: string;
    type: 'Integral' | 'Parcial';
    title: string;
    category: string;
    txId: string;
  } | null>(null);

  // Auto-fill and reset simulation states when receivable is set
  useEffect(() => {
    if (pixSelectedReceivable) {
      setPixAmountToApproveStr(pixSelectedReceivable.amount.toString());
      setPixPaymentReceipt(null);
    } else {
      setPixAmountToApproveStr('');
      setPixPaymentReceipt(null);
    }
  }, [pixSelectedReceivable]);

  // Editable PIX States
  const [showPixConfig, setShowPixConfig] = useState(false);
  const [tempPixKey, setTempPixKey] = useState('');
  const [tempPixBeneficiary, setTempPixBeneficiary] = useState('');
  const [tempPixCity, setTempPixCity] = useState('');
  const [pixFeedback, setPixFeedback] = useState('');
  const [modalEditPix, setModalEditPix] = useState(false);

  useEffect(() => {
    if (company) {
      setTempPixKey(company.pixKey || 'cleciotecnologia@gmail.com');
      setTempPixBeneficiary(company.pixBeneficiary || company.name || 'AutoPrecision Premium');
      setTempPixCity(company.pixCity || 'SAO PAULO');
    }
  }, [company]);

  const handleSavePixConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCompany({
        pixKey: tempPixKey,
        pixBeneficiary: tempPixBeneficiary,
        pixCity: tempPixCity,
      });
      setPixFeedback('Dados bancários salvos com sucesso!');
      setTimeout(() => setPixFeedback(''), 3000);
    } catch (err) {
      console.error(err);
      setPixFeedback('Erro ao salvar os dados.');
    }
  };

  const [isGeneratingPix, setIsGeneratingPix] = useState(false);

  useEffect(() => {
    const loadOrGeneratePix = async () => {
      if (!pixSelectedReceivable) {
        setFinanceiroPixString('');
        setFinanceiroPixQrDataUrl('');
        return;
      }
      
      // 1. If document already contains computed PIX details from previous generation, load immediately:
      if (pixSelectedReceivable.pixTxid && pixSelectedReceivable.qrCode) {
        setFinanceiroPixString(pixSelectedReceivable.copiaECola || '');
        setFinanceiroPixQrDataUrl(pixSelectedReceivable.qrCode || '');
        return;
      }

      // 2. Otherwise request dynamic PIX generation via Express backend (with qrcode bundling):
      setIsGeneratingPix(true);
      try {
        const res = await fetch('/api/pix/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            empresaId: pixSelectedReceivable.empresaId,
            clienteId: pixSelectedReceivable.clienteId || 'cli_anonymous',
            ordemServicoId: pixSelectedReceivable.ordemServicoId || '',
            descricao: pixSelectedReceivable.description,
            valor: pixSelectedReceivable.amount,
            dataVencimento: pixSelectedReceivable.dueDate,
          })
        });

        if (res.ok) {
          const data = await res.json();
          setFinanceiroPixString(data.copiaECola);
          setFinanceiroPixQrDataUrl(data.qrcode);
          
          // Securely append coordinates on the actual Firestore document:
          await editFinanceiro(pixSelectedReceivable.id, {
            pixTxid: data.txid,
            qrCode: data.qrcode,
            copiaECola: data.copiaECola,
            webhookRecebido: false,
          });
        }
      } catch (err) {
        console.error("Dynamic PIX Backend Generation failed, fallback to client-side payload:", err);
        // Offline / dev fallback:
        const pKey = company?.pixKey || 'cleciotecnologia@gmail.com';
        const pBeneficiary = company?.pixBeneficiary || company?.name || 'AutoPrecision Premium';
        const pCity = company?.pixCity || 'SAO PAULO';
        const cleanedDesc = pixSelectedReceivable.description
          ? pixSelectedReceivable.description.normalize("NFD").replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 15)
          : 'Fatura';
        try {
          const payload = generatePixPayload({
            chave: pKey,
            beneficiario: pBeneficiary,
            cidade: pCity,
            valor: pixSelectedReceivable.amount,
            descricao: cleanedDesc
          });
          setFinanceiroPixString(payload);
          const url = await QRCode.toDataURL(payload, { margin: 1 });
          setFinanceiroPixQrDataUrl(url);
        } catch (e2) {
          console.error(e2);
        }
      } finally {
        setIsGeneratingPix(false);
      }
    };

    loadOrGeneratePix();
  }, [pixSelectedReceivable, company]);

  // 3. Reactive Webhook & Payment listener
  useEffect(() => {
    if (pixSelectedReceivable) {
      const currentTrack = financeiro.find(f => f.id === pixSelectedReceivable.id);
      if (currentTrack && (currentTrack.status === 'Pago' || currentTrack.status === 'PAGO')) {
        setPixPaymentReceipt({
          id: `REC-${currentTrack.pixTxid?.substring(0, 8) || 'ONLINE'}`,
          originalAmount: currentTrack.amount,
          paidAmount: currentTrack.valorPago || currentTrack.amount,
          remainingAmount: 0,
          date: currentTrack.dataPagamento || new Date().toISOString(),
          type: 'Integral',
          title: currentTrack.description,
          category: currentTrack.category,
          txId: currentTrack.pixTxid || 'ONLINE_TX'
        });
      }
    }
  }, [financeiro, pixSelectedReceivable]);

  // Monochrome Printer & PDF Engine to resolve Complaint 1 (empty printed/PDF view)
  const handlePrintReceipt = () => {
    const printStyle = document.createElement('style');
    printStyle.innerHTML = `
      @media print {
        body {
          background: white !important;
          color: black !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        #root, header, nav, aside, footer, button, .no-print, [id^="btn-"], .lucide, #pix-billing-screen-modal button {
          display: none !important;
        }
        #pix-billing-screen-modal {
          background: white !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          height: auto !important;
          display: block !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          padding: 0 !important;
        }
        #pix-billing-screen-modal > div {
          background: white !important;
          color: black !important;
          border: none !important;
          box-shadow: none !important;
          width: 100% !important;
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .print-container-target {
          display: block !important;
          width: 100% !important;
          background: white !important;
          color: black !important;
          border: none !important;
          padding: 20px !important;
        }
        .print-container-target * {
          background: white !important;
          color: black !important;
          border-color: #e2e8f0 !important;
        }
      }
    `;
    document.head.appendChild(printStyle);
    window.print();
    setTimeout(() => {
      if (document.head.contains(printStyle)) {
        document.head.removeChild(printStyle);
      }
    }, 1000);
  };

  // Add transaction states
  const [isAdding, setIsAdding] = useState(false);
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'Receita' | 'Despesa'>('Receita');
  const [amountStr, setAmountStr] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Serviços');
  const [status, setStatus] = useState<'Pago' | 'Pendente'>('Pendente');

  // New operational accounts payable & invoice states
  const [invoiceNumberInput, setInvoiceNumberInput] = useState('');
  const [purchaseOrderInput, setPurchaseOrderInput] = useState('');
  const [reminderEnabledInput, setReminderEnabledInput] = useState(false);
  const [reminderDaysBeforeInput, setReminderDaysBeforeInput] = useState(3);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');

  // Duplicatas and Parcelamento (Installments) custom configurations
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentsCount, setInstallmentsCount] = useState<number>(3);
  const [installmentsInterval, setInstallmentsInterval] = useState<number>(30);

  // Categories lists
  const categoriesInflow = ['Serviços', 'Vendas Peças', 'Investimento', 'Ajuste Caixa'];
  const categoriesOutflow = ['Compra de Peças', 'Infraestrutura', 'Serviços Básicos', 'Salários', 'Impostos'];

  // Calculate totals
  const totalInflow = financeiro
    .filter(f => f.type === 'Receita' && f.status === 'Pago')
    .reduce((sum, item) => sum + item.amount, 0);

  const pendingInflow = financeiro
    .filter(f => f.type === 'Receita' && f.status === 'Pendente')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalOutflow = financeiro
    .filter(f => f.type === 'Despesa')
    .reduce((sum, item) => sum + item.amount, 0);

  const financialBalance = totalInflow - totalOutflow;

  // Mechanics commissions calculator helper
  const calculateMechanicCommission = (mechName: string, pct: number) => {
    return ordensServico
      .filter(os => os.mechanicName.toLowerCase().includes(mechName.toLowerCase()) && os.status === 'Finalizada')
      .reduce((sum, os) => {
        // Sum price of services
        const servicesSum = os.services.reduce((acc, s) => acc + s.price, 0);
        return sum + (servicesSum * pct) / 100;
      }, 0);
  };

  // Live Accounts Payable Reminder Analyzer (relative to actual local clock)
  const getDaysRemainingInfo = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse dueDateStr safely
    const [year, month, day] = dueDateStr.split('-').map(Number);
    const due = new Date(year, month - 1, day, 12, 0, 0); // avoid time zone bias shift
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { 
        days: diffDays, 
        colorClass: 'text-red-500 bg-red-950/20 border-red-900/40', 
        badgeClass: 'bg-red-500 text-white',
        text: `⚠️ Vencido há ${Math.abs(diffDays)} dia(s)` 
      };
    } else if (diffDays === 0) {
      return { 
        days: diffDays, 
        colorClass: 'text-amber-500 bg-amber-955/20 border-amber-900/45 animate-pulse', 
        badgeClass: 'bg-amber-500 text-black',
        text: `⚡ Vence HOJE!` 
      };
    } else if (diffDays <= 3) {
      return { 
        days: diffDays, 
        colorClass: 'text-amber-400 bg-amber-950/10 border-amber-900/25', 
        badgeClass: 'bg-amber-400 text-black',
        text: `⏳ Falta(m) ${diffDays} dia(s)` 
      };
    } else {
      return { 
        days: diffDays, 
        colorClass: 'text-cyan-400 bg-cyan-950/10 border-cyan-900/20', 
        badgeClass: 'bg-cyan-600 text-white',
        text: `📅 Daqui a ${diffDays} dia(s)` 
      };
    }
  };

  // Submit transaction supporting standard and duplicate installments loops
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amountStr || !dueDate) {
      alert("Por favor, preencha a Descrição, Valor e Data de Vencimento.");
      return;
    }

    const totalAmount = parseFloat(amountStr) || 0;
    const matchedSupplier = fornecedores?.find(f => f.id === selectedSupplierId);

    if (isInstallment) {
      // Loop to generate consecutive duplicate installments entries
      for (let i = 1; i <= installmentsCount; i++) {
        // Calculate shifted due date per installment
        const [year, month, day] = dueDate.split('-').map(Number);
        const installmentDate = new Date(year, month - 1, day, 12, 0, 0);
        installmentDate.setDate(installmentDate.getDate() + (i - 1) * installmentsInterval);
        
        const pad = (n: number) => String(n).padStart(2, '0');
        const calculatedDueDate = `${installmentDate.getFullYear()}-${pad(installmentDate.getMonth() + 1)}-${pad(installmentDate.getDate())}`;

        const installmentAmount = Number((totalAmount / installmentsCount).toFixed(2));
        const installmentInvoice = invoiceNumberInput 
          ? `${invoiceNumberInput}/${pad(i)}` 
          : undefined;

        await addFinanceiro({
          description: `${desc} (Parc. ${i}/${installmentsCount})`,
          type,
          amount: installmentAmount,
          dueDate: calculatedDueDate,
          category,
          status,
          invoiceNumber: installmentInvoice,
          purchaseOrder: purchaseOrderInput ? `${purchaseOrderInput} - Parcela ${i}` : undefined,
          reminderEnabled: reminderEnabledInput,
          reminderDaysBefore: reminderEnabledInput ? reminderDaysBeforeInput : undefined,
          supplierId: selectedSupplierId || undefined,
          supplierName: matchedSupplier ? matchedSupplier.name : undefined
        });
      }
      alert(`Cadastrado(s) com sucesso ${installmentsCount} parcelas/duplicatas consecutivas de R$ ${(totalAmount / installmentsCount).toFixed(2)} cada!`);
    } else {
      // Single transaction
      await addFinanceiro({
        description: desc,
        type,
        amount: totalAmount,
        dueDate,
        category,
        status,
        invoiceNumber: invoiceNumberInput || undefined,
        purchaseOrder: purchaseOrderInput || undefined,
        reminderEnabled: reminderEnabledInput,
        reminderDaysBefore: reminderEnabledInput ? reminderDaysBeforeInput : undefined,
        supplierId: selectedSupplierId || undefined,
        supplierName: matchedSupplier ? matchedSupplier.name : undefined
      });
      alert(`Lançamento único registrado com sucesso no DRE!`);
    }

    // Reset standard, custom & parcelamento states
    setDesc('');
    setAmountStr('');
    setDueDate('');
    setInvoiceNumberInput('');
    setPurchaseOrderInput('');
    setReminderEnabledInput(false);
    setReminderDaysBeforeInput(3);
    setSelectedSupplierId('');
    setIsInstallment(false);
    setInstallmentsCount(3);
    setInstallmentsInterval(30);
    setIsAdding(false);
  };

  // Toggle paid status
  const handleTogglePaidStatus = async (item: Financeiro) => {
    const next = item.status === 'Pago' ? 'Pendente' : 'Pago';
    await editFinanceiro(item.id, { status: next });
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
            💵 FLUXO DE CAIXA E FINANCEIRO
          </h1>
          <p className="text-xs text-gray-400 font-mono">Consolidação de DRE operacional, contas a pagar, contas a receber e apuração de comissões técnico.</p>
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl text-white font-mono text-xs font-semibold flex items-center gap-1 cursor-pointer self-stretch sm:self-auto justify-center shadow-lg"
        >
          <Plus className="w-4 h-4" /> Nova Célula Financeira
        </button>
      </div>

      {/* DADOS BANCÁRIOS / PARÂMETROS PIX CONFIGURATION BAR */}
      <div className="bg-slate-950/40 p-4 sm:p-5 rounded-2xl border border-gray-850 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-650/10 text-red-500 border border-red-900/30 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <div className="text-left font-sans">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-mono select-all bg-red-950/30 text-red-400 border border-red-900/40 px-2 py-0.5 rounded uppercase font-extrabold tracking-wider">
                DADOS BANCÁRIOS CONFIGURADOS
              </span>
              <span className="text-[9px] font-mono text-gray-400">
                Chave: <strong className="text-white select-all">{company?.pixKey || 'cleciotecnologia@gmail.com'}</strong>
              </span>
            </div>
            <h3 className="text-white font-extrabold text-sm font-display block mt-1">Gerência de Dados para Cobrança Automática PIX</h3>
            <p className="text-[10px] text-gray-450 font-mono mt-0.5 max-w-xl text-gray-400">
              Configure os seus dados bancários para poder gerar os QR Codes e o Pix Copia e Cola dinamicamente nas ordens de serviço (DRE) e venda PDV.
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto shrink-0 font-mono">
          <button
            type="button"
            onClick={() => setShowPixConfig(!showPixConfig)}
            className="w-full md:w-auto py-2 px-4 rounded-xl bg-gray-900 border border-gray-855 border-gray-800 hover:border-gray-700 text-white text-xs font-bold leading-none flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all duration-200 select-none"
          >
            <Settings className="w-4 h-4 text-gray-400" /> {showPixConfig ? "OCULTAR DADOS" : "CADASTRAR DADOS PIX"}
          </button>
        </div>
      </div>

      {showPixConfig && (
        <form onSubmit={handleSavePixConfig} className="bg-[#0c1223] border border-gray-800 p-5 rounded-2xl flex flex-col gap-4 animate-fade-in text-left">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Chave PIX (E-mail, CPF/CNPJ, Telefone ou Aleatória)</label>
              <input 
                type="text" 
                required
                placeholder="Ex e-mail: celciotecnologia@gmail.com"
                value={tempPixKey}
                onChange={e => setTempPixKey(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-550 text-xs font-mono focus:border-red-500" 
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Nome Exato do Beneficiário / Titular da Conta</label>
              <input 
                type="text" 
                required
                placeholder="Ex Nome: AutoPrecision LTDA"
                value={tempPixBeneficiary}
                onChange={e => setTempPixBeneficiary(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-550 text-xs focus:border-red-500" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Cidade da Conta Corrente (Banco Central)</label>
              <input 
                type="text" 
                required
                placeholder="Ex Cidade: SAO PAULO"
                value={tempPixCity}
                onChange={e => setTempPixCity(e.target.value.toUpperCase())}
                className="bg-slate-950 border border-slate-850 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-510 text-xs uppercase focus:border-red-500" 
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-gray-850 pt-3">
            <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
              * Ao salvar, a geração de QR Code em faturas a receber, ordens de serviços finalizadas e no PDV usará estes dados imediatamente.
            </p>
            <div className="flex items-center gap-2.5 w-full sm:w-auto font-mono shrink-0">
              {pixFeedback && (
                <span className="text-emerald-400 text-xs font-bold leading-normal animate-pulse shrink-0">
                  {pixFeedback}
                </span>
              )}
              <button 
                type="submit"
                className="w-full sm:w-auto py-2.5 px-4 bg-gradient-to-r from-red-650 to-red-700 bg-red-600 hover:from-red-600 hover:to-red-650 text-white font-bold text-xs rounded-xl shadow cursor-pointer tracking-wide border-0"
              >
                SALVAR DADOS DE COBRANÇA
              </button>
            </div>
          </div>
        </form>
      )}

      {/* OPERATIONAL ACCOUNTS PAYABLE REMINDERS & ALERTS BANNER MODULE */}
      {financeiro.filter(f => f.type === 'Despesa' && f.status === 'Pendente').length > 0 && (() => {
        const APG_alerts = financeiro.filter(f => {
          if (f.type !== 'Despesa' || f.status !== 'Pendente') return false;
          const remaining = getDaysRemainingInfo(f.dueDate);
          return f.reminderEnabled || remaining.days <= 10;
        }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        if (APG_alerts.length === 0) return null;

        return (
          <div className="bg-[#0b101d] border-l-4 border-amber-500 rounded-r-2xl p-5 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-850 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-900/30">
                  <Bell className="w-4.5 h-4.5 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm text-white">SISTEMA OPERACIONAL DE LEMBRETES & APG (CONTAS A PAGAR)</h3>
                  <span className="text-[10px] text-gray-400 font-mono">Lista automatizada de contas pendentes, vencidas ou com avisos programados de email/sistema.</span>
                </div>
              </div>
              
              <span className="text-[10px] font-mono font-bold bg-amber-950/40 text-amber-500 border border-amber-900/40 px-2.5 py-1 rounded">
                Ref. Tempo: {new Date().toLocaleDateString('pt-BR')} • {APG_alerts.length} Lembretes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[190px] overflow-y-auto pr-1">
              {APG_alerts.map((f) => {
                const info = getDaysRemainingInfo(f.dueDate);
                return (
                  <div key={f.id} className="p-3 bg-gray-950/40 rounded-xl border border-gray-850 flex flex-col justify-between gap-2 text-xs relative group hover:border-amber-500/30 transition-all">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-sans font-bold text-white truncate max-w-[170px]" title={f.description}>
                          {f.description}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono font-bold border shrink-0 ${info.colorClass}`}>
                          {info.text}
                        </span>
                      </div>

                      {f.supplierName ? (
                        <span className="text-[9.5px] text-gray-400 mt-0.5 block truncate">
                          🏢 Fornecedor: <span className="text-gray-300 font-medium">{f.supplierName}</span>
                        </span>
                      ) : (
                        <span className="text-[9.5px] text-gray-500 block truncate">🏢 Sem fornecedor cadastrado</span>
                      )}

                      <div className="flex flex-wrap gap-1 mt-1">
                        {f.invoiceNumber && (
                          <span className="text-[8.5px] bg-[#0c1223] text-gray-400 border border-gray-850 rounded px-1 py-0.1 font-mono flex items-center gap-0.5">
                            <FileText className="w-3 h-3 text-red-550 text-red-500" /> NF: {f.invoiceNumber}
                          </span>
                        )}
                        {f.purchaseOrder && (
                          <span className="text-[8.5px] bg-[#0c1223] text-gray-400 border border-gray-850 rounded px-1 py-0.1 font-mono flex items-center gap-0.5">
                            <ClipboardList className="w-3 h-3 text-cyan-500" /> Ped: {f.purchaseOrder}
                          </span>
                        )}
                        {f.reminderEnabled && (
                          <span className="text-[8.5px] bg-amber-950/10 text-amber-500 border border-amber-900/20 rounded px-1 py-0.1 font-mono flex items-center gap-0.5 animate-pulse">
                            🔔 Alerta {f.reminderDaysBefore} dias antes
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-gray-900 pt-2">
                      <span className="font-mono text-amber-500 font-bold">
                        R$ {f.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      
                      <button
                        onClick={() => handleTogglePaidStatus(f)}
                        className="px-2 py-0.5 bg-green-500 hover:bg-green-600 text-black rounded text-[9px] font-mono font-bold flex items-center gap-0.5 cursor-pointer shadow transition-all shrink-0 uppercase"
                      >
                        <Check className="w-3 h-3 text-black stroke-[3px]" /> Liquidar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* SUMMARY BOX Indicator grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Box 1: Receitas pagas */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-4 shrink-0 flex flex-col justify-between hover:border-green-850/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-mono">RECEITAS CONSOLIDADAS (PAGAS)</span>
            <div className="p-1.5 rounded-lg bg-green-950/40 text-green-500">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5">
            <span className="text-xl font-display font-bold text-white">R$ {totalInflow.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-[9px] text-green-500 block font-mono mt-0.5">✓ Receitas liquidadas do caixa</span>
          </div>
        </div>

        {/* Box 2: Receitas pendentes */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-4 shrink-0 flex flex-col justify-between hover:border-yellow-850/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-mono font-medium">LANCAMENTOS A RECEBER</span>
            <span className="text-xs font-semibold px-2 py-0.5 text-yellow-500 bg-yellow-950/30 rounded font-mono">R$ {pendingInflow.toFixed(2)}</span>
          </div>
          <div className="mt-3.5">
            <span className="text-xl font-display font-medium text-white">Orçamentos OS Abertos</span>
            <span className="text-[9px] text-yellow-500 block font-mono mt-0.5">Previsão de fechamento semanal</span>
          </div>
        </div>

        {/* Box 3: Despesas consolidadas */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-4 shrink-0 flex flex-col justify-between hover:border-red-850/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-mono">DESPESAS / CONTAS A PAGAR</span>
            <div className="p-1.5 rounded-lg bg-red-950/40 text-red-500">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5">
            <span className="text-xl font-display font-bold text-white">R$ {totalOutflow.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-[9px] text-red-400 block font-mono mt-0.5">Fornecedores, aluguel, salários</span>
          </div>
        </div>

        {/* Box 4: Saldo Operacional DRE */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-4 shrink-0 flex flex-col justify-between hover:border-cyan-850/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-mono">SALDO OPERACIONAL (LÍQUIDO)</span>
            <div className={`p-1 box-content w-3 h-3 rounded-full ${financialBalance >= 0 ? 'bg-cyan-500/10' : 'bg-red-500/10'}`}></div>
          </div>
          <div className="mt-3.5">
            <span className={`text-xl font-display font-black ${financialBalance >= 0 ? 'text-cyan-400' : 'text-red-500'}`}>
              R$ {financialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[9px] text-gray-500 block font-mono mt-0.5">Resultado real da oficina</span>
          </div>
        </div>

      </div>

      {/* COMMISSIONS CALCULATOR GRID */}
      <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 text-left">
        <div className="border-b border-gray-850 pb-3 mb-4 flex justify-between items-center">
          <div>
            <h3 className="font-display font-extrabold text-white text-sm">Apuração Sistemática de Comissões de Mecânicos</h3>
            <span className="text-[10px] text-gray-500 font-mono block">Apuração automática de 45% sobre mão de obra de ordens de serviço marcadas como "Finalizada".</span>
          </div>
          <span className="text-[10px] bg-red-950/40 text-red-500 font-bold border border-red-900/30 px-3 py-1 rounded">
            Percentual Padrão: 45%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-950/20 rounded-xl border border-gray-900 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Marcio Rezende</span>
              <span className="text-[9px] text-gray-500">Mecânico Sênior</span>
            </div>
            <span className="font-mono text-sm text-cyan-400 font-bold">R$ {calculateMechanicCommission("Marcio", 45).toFixed(2)}</span>
          </div>
          
          <div className="p-3 bg-gray-950/20 rounded-xl border border-gray-900 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Gerson 'Geleia' Souza</span>
              <span className="text-[9px] text-gray-500">Mecânico Assistente</span>
            </div>
            <span className="font-mono text-sm text-cyan-400 font-bold">R$ {calculateMechanicCommission("Gerson", 45).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-[#0a0f1d] p-4 rounded-xl border border-gray-900">
        <div className="relative sm:col-span-8 mr-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Filtre listagem por descrição do lançamento, NF, nº de pedido ou fornecedores..."
            value={searchDesc}
            onChange={(e) => setSearchDesc(e.target.value)}
            className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2 px-4 pl-10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full bg-[#080c16] border border-gray-800 py-2.5 px-3 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer text-left font-mono"
          >
            <option value="Todas">Fluxo: Todas as Células (Entrada/Saída)</option>
            <option value="Receita">Apenas Receitas (Entradas)</option>
            <option value="Despesa">Apenas Despesas (Saídas)</option>
            <option value="RemindersActive">🚨 Contas APG Ativas (Lembretes/Vencidos)</option>
          </select>
        </div>
      </div>

      {/* TRANSACTION TIMELINE table */}
      <div className="bg-[#0c1223] rounded-2xl border border-gray-800 overflow-x-auto shadow-sm">
        <table className="w-full text-left font-mono text-xs text-slate-300">
          <thead className="bg-[#080d19] border-b border-gray-800 text-[10px] text-gray-400 uppercase">
            <tr>
              <th className="p-4">Vencimento</th>
              <th className="p-4">Lançamento / Origem / Detalhes</th>
              <th className="p-4">Fluxo</th>
              <th className="p-4">Documento / Nota Fiscal / Pedido</th>
              <th className="p-4">Valor Nominal</th>
              <th className="p-4 col-span-1">Status</th>
              <th className="p-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-850">
            {financeiro
              .filter(f => {
                const searchNormal = searchDesc.toLowerCase();
                const matchDesc = f.description.toLowerCase().includes(searchNormal) || 
                                  (f.invoiceNumber && f.invoiceNumber.toLowerCase().includes(searchNormal)) ||
                                  (f.purchaseOrder && f.purchaseOrder.toLowerCase().includes(searchNormal)) ||
                                  (f.supplierName && f.supplierName.toLowerCase().includes(searchNormal));
                
                let matchType = false;
                if (typeFilter === 'Todas') {
                  matchType = true;
                } else if (typeFilter === 'Receita') {
                  matchType = f.type === 'Receita';
                } else if (typeFilter === 'Despesa') {
                  matchType = f.type === 'Despesa';
                } else if (typeFilter === 'RemindersActive') {
                  const info = getDaysRemainingInfo(f.dueDate);
                  matchType = f.type === 'Despesa' && f.status === 'Pendente' && (f.reminderEnabled || info.days <= 10);
                }
                
                return matchDesc && matchType;
              })
              .map((item) => {
                const isOverdueAlert = item.type === 'Despesa' && item.status === 'Pendente';
                const remainingInfo = isOverdueAlert ? getDaysRemainingInfo(item.dueDate) : null;

                return (
                  <tr key={item.id} className="hover:bg-gray-950/20 transition-all">
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white font-bold">{item.dueDate}</span>
                        {remainingInfo && (
                          <span className={`text-[8.5px] font-mono whitespace-nowrap`}>
                            {remainingInfo.text}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-white font-sans font-semibold text-xs flex items-center gap-1.5 leading-snug">
                          {item.description}
                          {item.reminderEnabled && (
                            <span className="text-[9px] text-amber-500 flex items-center gap-0.5" title={`Alerta ativado para ${item.reminderDaysBefore} dias antes`}>
                              <Bell className="w-3 h-3 text-amber-500 animate-pulse shrink-0" />
                            </span>
                          )}
                        </span>
                        
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500 font-mono mt-0.5">
                          <span>Categoria: <span className="text-gray-450 text-gray-400 font-medium">{item.category}</span></span>
                          {item.supplierName && (
                            <span className="flex items-center gap-0.5 border-l border-gray-800 pl-1.5">
                              Fornecedor: <span className="text-red-400 font-semibold">{item.supplierName}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {item.type === 'Receita' ? (
                        <span className="text-green-500 font-bold bg-green-950/20 px-2 py-0.5 border border-green-900/30 rounded text-[10px]">ENTRADA</span>
                      ) : (
                        <span className="text-red-500 font-bold bg-red-950/20 px-2 py-0.5 border border-red-900/30 rounded text-[10px]">SAÍDA</span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-1 font-mono text-[10px]">
                        {item.invoiceNumber ? (
                          <span className="text-gray-300 font-medium flex items-center gap-1 bg-[#090e1a] border border-gray-800 px-1.5 py-0.5 rounded w-fit">
                            <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" /> NF-e-{item.invoiceNumber}
                          </span>
                        ) : (
                          <span className="text-gray-600 italic">Nota Fiscal N/D</span>
                        )}

                        {item.purchaseOrder ? (
                          <span className="text-gray-400 flex items-center gap-1 bg-[#090e1a] border border-gray-850 px-1.5 py-0.5 rounded w-fit">
                            <ClipboardList className="w-3.5 h-3.5 text-cyan-500 shrink-0" /> Ped: {item.purchaseOrder}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-[9px] italic">Sem Pedido Vinculado</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-white font-bold text-xs font-mono">
                      R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="p-4 select-none">
                      <button 
                        onClick={() => handleTogglePaidStatus(item)}
                        className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded cursor-pointer border transition-colors ${
                          item.status === 'Pago' 
                            ? 'border-green-900/40 bg-green-950/20 text-green-400 hover:bg-green-600 hover:text-black hover:border-green-500' 
                            : 'border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-650 hover:text-white hover:border-red-500'
                        }`}
                      >
                        {item.status === 'Pago' ? "✔ PAGO" : "⚠ PENDENTE"}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-mono">
                        {item.type === 'Receita' && item.status === 'Pendente' && (
                          <button
                            type="button"
                            onClick={() => setPixSelectedReceivable(item)}
                            className="bg-red-950/25 hover:bg-red-650 text-red-400 hover:text-white border border-red-900/40 hover:border-red-500 px-2 py-1 rounded cursor-pointer text-[10px] font-bold flex items-center gap-1 transition-all"
                            title="Visualizar ou imprimir QR Code PIX para esta fatura"
                          >
                            <QrCode className="w-3 h-3 text-red-500 hover:text-white shrink-0" /> PIX
                          </button>
                        )}
                        <button 
                          onClick={() => handleTogglePaidStatus(item)}
                          className="text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 px-2.5 py-1 rounded cursor-pointer text-[10px] transition-colors"
                        >
                          Alternar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>

      {/* DIALOG ADD MANUALLY TRANSACTION MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <form 
            onSubmit={handleCreateTransaction}
            className="bg-[#0c1223] border border-gray-800 text-white max-w-lg w-full rounded-2xl p-6 shadow-2xl relative text-left flex flex-col gap-4 font-sans"
          >
            <div className="flex justify-between items-center border-b border-gray-850 pb-3">
              <span className="font-display font-bold text-base text-white flex items-center gap-1.5 uppercase">
                <CreditCard className="w-5 h-5 text-red-500" /> Nova Célula Financeira / Documento
              </span>
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs font-mono">
              
              {/* Row 1: Tipo lançamentos */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Tipo de Lançamento / Fluxo de Caixa</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setType('Receita');
                      setCategory('Serviços');
                    }}
                    className={`py-2 rounded font-bold border font-mono transition-colors text-xs ${type === 'Receita' ? 'border-green-500 bg-green-950/20 text-white' : 'border-gray-800 text-gray-500'}`}
                  >
                    📈 RECEITA (ENTRADA)
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setType('Despesa');
                      setCategory('Compra de Peças');
                    }}
                    className={`py-2 rounded font-bold border font-mono transition-colors text-xs ${type === 'Despesa' ? 'border-red-500 bg-red-950/20 text-white' : 'border-gray-800 text-gray-500'}`}
                  >
                    📉 DESPESA / CONTA PAGAR (SAÍDA)
                  </button>
                </div>
              </div>

              {/* Row 2: Descritivo do lançamento */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold">Descritivo do Lançamento *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Fornecimento de Peças NGK Sênior"
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 font-sans"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                />
              </div>

              {/* Row 3: Categoria */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 uppercase font-bold">Categoria de Relatório DRE</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-2 text-white cursor-pointer focus:outline-none focus:border-red-500"
                >
                  {type === 'Receita' 
                    ? categoriesInflow.map((c, i) => <option key={i} value={c}>{c}</option>)
                    : categoriesOutflow.map((c, i) => <option key={i} value={c}>{c}</option>)
                  }
                </select>
              </div>

              {/* Row 4: Valor & data de vencimento */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold">Valor Nominal R$ *</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 450.00"
                    step="0.01"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white font-mono focus:outline-none focus:border-red-500"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold">Vencimento da Fatura *</label>
                  <input 
                    type="date" 
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-2 text-white focus:outline-none focus:border-red-500 focus:text-white"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Opção de Parcelamento / Duplicatas */}
              <div className="bg-[#090e1a] border border-gray-850 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-gray-300 font-bold uppercase flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-cyan-400" /> Cadastrar Duplicatas / Parcelar
                    </span>
                    <span className="text-[9px] text-gray-500 font-sans block mt-0.5">Gerar faturas parceladas sequenciais automáticas</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isInstallment}
                      onChange={(e) => setIsInstallment(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>

                {isInstallment && (
                  <div className="flex flex-col gap-2.5 mt-2 border-t border-gray-800/60 pt-2 font-mono text-[9px] text-gray-400">
                    <div className="grid grid-cols-2 gap-3 animate-fade-in">
                      <div className="flex flex-col gap-1 text-left">
                        <span className="font-bold uppercase text-[9px]">Nº de Parcelas</span>
                        <select
                          value={installmentsCount}
                          onChange={(e) => setInstallmentsCount(Number(e.target.value) || 2)}
                          className="bg-[#050810] border border-gray-800 rounded px-2 py-1 text-white focus:outline-none focus:border-cyan-500 font-mono text-[10px]"
                        >
                          {[2, 3, 4, 5, 6, 8, 10, 12, 18, 24].map(n => (
                            <option key={n} value={n}>{n}x (Vezes)</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1 text-left">
                        <span className="font-bold uppercase text-[9px]">Periodicidade</span>
                        <select
                          value={installmentsInterval}
                          onChange={(e) => setInstallmentsInterval(Number(e.target.value) || 30)}
                          className="bg-[#050810] border border-gray-800 rounded px-2 py-1 text-white focus:outline-none focus:border-cyan-500 font-mono text-[10px]"
                        >
                          <option value="30">Mensal (a cada 30 dias)</option>
                          <option value="15">Quinzenal (a cada 15 dias)</option>
                          <option value="7">Semanal (a cada 7 dias)</option>
                          <option value="60">Bimestral (a cada 60 dias)</option>
                          <option value="90">Trimestral (a cada 90 dias)</option>
                        </select>
                      </div>
                    </div>

                    {/* Preview do desmembramento */}
                    {amountStr && dueDate && (
                      <div className="p-2.5 bg-black/40 border border-gray-900 rounded-lg flex flex-col gap-1 mt-1 font-sans">
                        <span className="font-bold font-mono text-[9px] text-cyan-400 uppercase">📋 Preview das Duplicatas no DRE:</span>
                        <div className="max-h-[85px] overflow-y-auto space-y-1.5 mt-1 pr-1 font-mono text-[9.5px]">
                          {Array.from({ length: Math.min(6, installmentsCount) }).map((_, idx) => {
                            const i = idx + 1;
                            const totalAmount = parseFloat(amountStr) || 0;
                            const installmentAmount = (totalAmount / installmentsCount).toFixed(2);
                            
                            // Calculate shifted due date per installment for preview
                            const [year, month, day] = dueDate.split('-').map(Number);
                            const installmentDate = new Date(year, month - 1, day, 12, 0, 0);
                            installmentDate.setDate(installmentDate.getDate() + (i - 1) * installmentsInterval);
                            const pad = (n: number) => String(n).padStart(2, '0');
                            const calculatedDueDate = `${pad(installmentDate.getDate())}/${pad(installmentDate.getMonth() + 1)}/${installmentDate.getFullYear()}`;

                            return (
                              <div key={i} className="flex justify-between text-gray-400 border-b border-gray-900/50 pb-0.5">
                                <span>Duplicata Parcela {i}/{installmentsCount}</span>
                                <span className="font-bold text-slate-300">R$ {parseFloat(installmentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em {calculatedDueDate}</span>
                              </div>
                            );
                          })}
                          {installmentsCount > 6 && (
                            <span className="text-[8px] text-gray-500 block text-center pt-0.5">... e mais {installmentsCount - 6} parcelas adicionais</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Row 5: Nota Fiscal & Pedido */}
              <div className="grid grid-cols-2 gap-3 border-t border-gray-850 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
                    <FileText className="w-3 h-3 text-red-500" /> Nota Fiscal (NF-e)
                  </span>
                  <input 
                    type="text" 
                    placeholder="Nº da nota, Ex: NF-8119"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 font-mono"
                    value={invoiceNumberInput}
                    onChange={(e) => setInvoiceNumberInput(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">
                    <ClipboardList className="w-3 h-3 text-cyan-500" /> Número de Pedido
                  </span>
                  <input 
                    type="text" 
                    placeholder="Nº do pedido, Ex: PED-908"
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 font-mono"
                    value={purchaseOrderInput}
                    onChange={(e) => setPurchaseOrderInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 6: Vincular Fornecedor (for accounts payable saídas) */}
              {type === 'Despesa' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold">Vincular Fornecedor Credor</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-2 text-white cursor-pointer focus:outline-none focus:border-red-500"
                  >
                    <option value="">Selecione parceiro fornecedor (Opcional)</option>
                    {fornecedores?.map(f => (
                      <option key={f.id} value={f.id}>🏢 {f.name} (CNPJ: {f.cnpj || 'Simples'})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Row 7: Lembretes settings */}
              {type === 'Despesa' && (
                <div className="bg-[#090e1a] border border-gray-850 rounded-xl p-3 flex flex-col gap-2 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-300 font-bold uppercase flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-amber-500 animate-pulse" /> Ativar Alertas de Vencimento
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={reminderEnabledInput}
                        onChange={(e) => setReminderEnabledInput(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-650 peer-checked:bg-red-600"></div>
                    </label>
                  </div>

                  {reminderEnabledInput && (
                    <div className="flex items-center justify-between gap-4 mt-1 border-t border-gray-800/60 pt-1.5">
                      <span className="text-[9px] text-gray-400">Dias de aviso prévio requisitado:</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="range" 
                          min="1" 
                          max="15" 
                          className="w-24 accent-red-600 focus:outline-none"
                          value={reminderDaysBeforeInput}
                          onChange={(e) => setReminderDaysBeforeInput(parseInt(e.target.value) || 3)}
                        />
                        <span className="text-amber-500 font-bold font-mono text-xs">{reminderDaysBeforeInput} Dia(s)</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Row 8: Status do lançamento */}
              <div className="flex flex-col gap-1 border-t border-gray-850 pt-2">
                <label className="text-[10px] text-gray-400 uppercase font-bold">Status Inicial</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-1 text-white cursor-pointer focus:outline-none focus:border-red-500"
                >
                  <option value="Pendente">Aberto / Pagável Pendente (APG)</option>
                  <option value="Pago">Quitado / Pago do Saldo Operacional</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 py-3 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl text-white font-bold text-xs font-sans shadow-md"
              >
                💾 CONFIRMAR LANÇAMENTO NO DRE
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DYNAMIC RECEIVABLE PIX QR CODE DIALOG MODAL & COMPROVANTE SIMULATOR */}
      {pixSelectedReceivable && (
        <div id="pix-billing-screen-modal" className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-[#0c1223] border border-gray-800 text-white max-w-sm w-full rounded-2xl p-6 shadow-2xl relative flex flex-col items-center gap-4 font-sans focus:outline-none">
            
            <button 
              type="button"
              id="btn-close-pix-billing"
              onClick={() => {
                setPixSelectedReceivable(null);
                setPixPaymentReceipt(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {isGeneratingPix ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center w-full">
                <QrCode className="w-12 h-12 text-red-500 animate-spin" />
                <span className="text-sm font-mono text-gray-300">Registrando Cobrança Dinâmica no Banco...</span>
                <span className="text-[10px] text-gray-500">Gerando assinatura TxID e QRCode seguro...</span>
              </div>
            ) : !pixPaymentReceipt ? (
              // 1. BILLING & SIMULATOR VIEW (WHEN NOT PAID YET)
              <div className="flex flex-col gap-4 w-full animate-fade-in">
                <div className="flex items-center gap-2 text-red-500 font-mono text-[10px] font-bold uppercase tracking-wider self-start border-b border-gray-850 pb-2 w-full text-left">
                  <QrCode className="w-5 h-5 animate-pulse shrink-0" />
                  <span>COBRANÇA DIGITAL AUTOMÁTICA PIX</span>
                </div>

                <div className="flex flex-col gap-1 w-full text-left">
                  <span className="text-[9.5px] text-[#94a3b8] font-mono uppercase">Lançamento / DRE Fatura:</span>
                  <span className="text-white font-bold text-sm leading-snug">{pixSelectedReceivable.description}</span>
                  <span className="text-amber-500 font-mono text-[10px] font-semibold mt-1 flex items-center gap-1 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/30 w-fit">
                    <Calendar className="w-3 h-3 text-amber-500" /> Vencimento: {pixSelectedReceivable.dueDate}
                  </span>
                </div>

                {/* QR Code container */}
                <div className="text-center w-full my-1">
                  {financeiroPixQrDataUrl ? (
                    <div className="p-3 bg-white rounded-xl shadow-2xl border border-gray-200 inline-block">
                      <img 
                      src={financeiroPixQrDataUrl} 
                        alt="QR Code PIX Fatura" 
                        id="pix-qrcode-image"
                        className="w-40 h-40 object-contain mx-auto"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-40 border border-gray-800 rounded-xl flex items-center justify-center text-gray-400 text-xs font-mono mx-auto">
                      Gerando QR Code...
                    </div>
                  )}
                </div>

                {/* Dynamic details */}
                <div className="flex flex-col gap-1 w-full text-left font-mono text-xs bg-[#090e1a] border border-gray-850 rounded-xl p-3">
                  <div className="flex justify-between items-center text-[9.5px] border-b border-gray-800/40 pb-1 mb-1 text-gray-400">
                    <span>Beneficiário:</span>
                    <span className="text-white font-bold shrink-0 truncate max-w-[170px]">{company?.pixBeneficiary || company?.name || 'AutoPrecision Premium'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9.5px] border-b border-gray-800/40 pb-1 mb-1 text-gray-400">
                    <span>Chave PIX:</span>
                    <span className="text-white font-bold break-all select-all font-mono">{company?.pixKey || 'cleciotecnologia@gmail.com'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9.5px] border-b border-gray-800/40 pb-1 mb-1 text-gray-400">
                    <span>Cidade:</span>
                    <span className="text-white font-bold font-mono text-[10px]">{company?.pixCity || 'SAO PAULO'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-extrabold text-white pt-1">
                    <span>Valor Cobrado:</span>
                    <span className="text-red-500 text-sm font-bold">R$ {pixSelectedReceivable.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Simulated payment panel calling real back-end routes */}
                <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 flex flex-col gap-3 font-sans">
                  <span className="text-[9.5px] font-mono text-cyan-400 font-extrabold tracking-wider block uppercase">💻 SIMULADOR DE INTEGRAÇÃO BANCÁRIA (PIX API)</span>
                  
                  <div className="flex flex-col gap-1.5 text-left">
                    <label htmlFor="pix-simulation-value" className="text-[9px] text-gray-400 uppercase font-mono tracking-wider font-semibold">Valor Recebido do Cliente (Confirmável)</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-xs text-slate-500 font-mono">R$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        id="pix-simulation-value"
                        className="w-full bg-black/60 border border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                        value={pixAmountToApproveStr}
                        onChange={(e) => setPixAmountToApproveStr(e.target.value)}
                        placeholder="Ex: 150.00"
                      />
                    </div>
                    <span className="text-[8px] text-gray-500 block">Este simulador dispara um Webhook real que liquida a fatura e atualiza a O.S. vinculada instantaneamente!</span>
                  </div>

                  <div className="flex gap-2 font-mono">
                    <button
                      type="button"
                      id="btn-approve-full-pix"
                      onClick={async () => {
                        const original = pixSelectedReceivable.amount;
                        // Execute transaction complete simulation calling backend API proxy
                        if (!pixSelectedReceivable.pixTxid) {
                          alert("Aguarde a atribuição de um TxID.");
                          return;
                        }
                        try {
                          const responseSim = await fetch('/api/pix/simulate-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              txid: pixSelectedReceivable.pixTxid,
                              amount: original
                            })
                          });
                          if (responseSim.ok) {
                            alert("Sucesso! Pagamento de compensação processado pelo Webhook do banco.");
                          } else {
                            const { liquidarPixNoClientSide } = await import('../services/pixService');
                            const resFallback = await liquidarPixNoClientSide(pixSelectedReceivable.pixTxid, original);
                            if (resFallback.success) {
                              alert("Sucesso! Pagamento compensado via contingência local.");
                            } else {
                              alert("Falha ao notificar o simulador de pagamento.");
                            }
                          }
                        } catch (simErr) {
                          console.error(simErr);
                          alert("Simulando offline por erro de rede...");
                          // Safe client fallback
                          const { liquidarPixNoClientSide } = await import('../services/pixService');
                          await liquidarPixNoClientSide(pixSelectedReceivable.pixTxid, original);
                        }
                      }}
                      className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border-none"
                    >
                      <Check className="w-3.5 h-3.5 shrink-0" /> PAGO INTEGRAL
                    </button>

                    <button
                      type="button"
                      id="btn-approve-partial-pix"
                      onClick={async () => {
                        const enteredVal = parseFloat(pixAmountToApproveStr) || 0;
                        if (enteredVal <= 0) {
                          alert("Digite um valor válido maior que R$ 0,00 para simular.");
                          return;
                        }

                        const original = pixSelectedReceivable.amount;
                        if (enteredVal >= original) {
                          alert(`Este valor (R$ ${enteredVal}) quita integralmente a fatura.`);
                          try {
                            const responseSim = await fetch('/api/pix/simulate-payment', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                txid: pixSelectedReceivable.pixTxid,
                                amount: original
                              })
                            });
                            if (!responseSim.ok) {
                              const { liquidarPixNoClientSide } = await import('../services/pixService');
                              await liquidarPixNoClientSide(pixSelectedReceivable.pixTxid, original);
                            }
                          } catch (e) {
                            const { liquidarPixNoClientSide } = await import('../services/pixService');
                            await liquidarPixNoClientSide(pixSelectedReceivable.pixTxid, original);
                          }
                          return;
                        }

                        // Split payment logic
                        const remains = original - enteredVal;
                        try {
                          // Complete this part and create subsequent collection documents
                          await editFinanceiro(pixSelectedReceivable.id, {
                            status: 'Pago',
                            amount: enteredVal,
                            description: `${pixSelectedReceivable.description} (Lote Pago Parcial)`
                          });

                          await addFinanceiro({
                            description: `${pixSelectedReceivable.description} (Saldo Remanescente Fatura)`,
                            type: 'Receita',
                            amount: Number(remains.toFixed(2)),
                            dueDate: pixSelectedReceivable.dueDate,
                            category: pixSelectedReceivable.category,
                            status: 'Pendente',
                            invoiceNumber: pixSelectedReceivable.invoiceNumber ? `${pixSelectedReceivable.invoiceNumber}-PARC` : undefined,
                            purchaseOrder: pixSelectedReceivable.purchaseOrder
                          });

                          // Call real webhook register to audit the logs
                          if (pixSelectedReceivable.pixTxid) {
                            try {
                              const responseSim = await fetch('/api/pix/simulate-payment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  txid: pixSelectedReceivable.pixTxid,
                                  amount: enteredVal
                                })
                              });
                              if (!responseSim.ok) {
                                console.warn("Simulação de webhook no servidor ignorada. Atualizando fluxos locais offline.");
                              }
                            } catch (e) {
                              console.warn("Utilizando compensação offline para split parciais:", e);
                            }
                          }
                        } catch (errSpl) {
                          console.error(errSpl);
                        }
                      }}
                      className="flex-1 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-750 text-white text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border-none"
                    >
                      <Layers className="w-3.5 h-3.5 shrink-0 text-white" /> PAGO PARCIAL
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 w-full text-left font-mono">
                  <div className="flex gap-2 w-full">
                    <input 
                      type="text" 
                      readOnly 
                      value={financeiroPixString} 
                      className="bg-black/50 border border-gray-800 rounded-lg px-2.5 py-1.5 text-[8.5px] text-gray-400 select-all truncate flex-1 outline-none text-left"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(financeiroPixString);
                          setCopiedText(true);
                          setTimeout(() => setCopiedText(false), 2000);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-750 rounded-lg font-bold text-[9.5px] uppercase tracking-wide text-white flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" /> {copiedText ? "COPIADO!" : "COPIAR"}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 w-full font-mono mt-1">
                  <button
                    type="button"
                    onClick={handlePrintReceipt}
                    className="flex-1 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-750 text-white text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> IMPRIMIR QR
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setModalEditPix(!modalEditPix);
                    }}
                    className="py-1.5 px-2 rounded-xl border border-gray-800 text-[10px] hover:bg-slate-900 transition-all font-bold cursor-pointer font-mono text-gray-300"
                  >
                     {modalEditPix ? "Fechar" : "⚙️ Dados PIX"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPixSelectedReceivable(null)}
                    className="px-3 py-1.5 rounded-xl border border-gray-850 text-gray-300 hover:text-white text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    VOLTAR
                  </button>
                </div>

                {modalEditPix && (
                  <div className="bg-[#080d1a] border border-gray-850 rounded-xl p-3 w-full flex flex-col gap-2.5 text-left font-mono text-[9px] animate-fade-in animate-scale-up">
                    <span className="text-gray-400 font-bold uppercase text-[8px] block border-b border-gray-800 pb-1">Configurações Chave PIX</span>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400">Chave PIX:</span>
                      <input 
                        type="text" 
                        value={tempPixKey} 
                        onChange={e => setTempPixKey(e.target.value)}
                        placeholder="E-mail ou CPF"
                        className="bg-black/60 border border-gray-800 rounded px-2 py-1 text-white text-[9px] focus:outline-none focus:border-red-500 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400">Beneficiário:</span>
                      <input 
                        type="text" 
                        value={tempPixBeneficiary} 
                        onChange={e => setTempPixBeneficiary(e.target.value)}
                        placeholder="Nome do Titular"
                        className="bg-black/60 border border-gray-800 rounded px-2 py-1 text-white text-[9px] focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await updateCompany({
                            pixKey: tempPixKey,
                            pixBeneficiary: tempPixBeneficiary
                          });
                          setModalEditPix(false);
                        } catch (err) {
                          console.error("Erro inline:", err);
                        }
                      }}
                      className="w-full mt-1 py-1 bg-red-600 hover:bg-red-750 text-white font-bold rounded text-[9px]"
                    >
                      Confirmar Chave
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // 2. COMPROVANTE DE PAGAMENTO PIX (RECONCILATION PRINTABLE TICKET)
              <div id="pix-receipt-container" className="print-container-target flex flex-col gap-4 w-full text-left font-sans animate-fade-in">
                
                <div className="flex flex-col items-center text-center gap-2 pb-3 border-b border-gray-800/80">
                  {company?.logoUrl && (
                    <img 
                      src={company.logoUrl} 
                      alt="Logo" 
                      className="w-12 h-12 object-contain rounded-lg border border-gray-800 print:border-slate-300 mb-1"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="w-11 h-11 rounded-full bg-emerald-950/60 border border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-widest block uppercase">COMPROVANTE DE PAGAMENTO PIX</span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">Banco Central do Brasil - Liquidação Comercial</span>
                  </div>
                </div>

                <div className="bg-[#050810] border border-slate-900 rounded-xl p-4 flex flex-col gap-3 font-mono text-[10.5px]">
                  
                  <div className="flex justify-between items-center text-[10px] border-b border-gray-900/50 pb-1.5">
                    <span className="text-gray-500">Beneficiário:</span>
                    <span className="text-white font-bold uppercase truncate max-w-[170px]">{company?.name || 'AutoPrecision'}</span>
                  </div>

                  <div className="flex justify-between items-start text-[10px] border-b border-gray-950/50 pb-1.5 flex-col gap-0.5">
                    <span className="text-gray-500">Serviço/Fatura:</span>
                    <span className="text-white font-bold">{pixPaymentReceipt.title}</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] border-b border-gray-900/50 pb-1.5">
                    <span className="text-gray-500 font-bold uppercase text-[9px] text-emerald-400">Status Quitação:</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase ${pixPaymentReceipt.type === 'Integral' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-900/40' : 'bg-amber-950 text-amber-500 border border-amber-900'}`}>
                      {pixPaymentReceipt.type === 'Integral' ? 'PAGO' : 'PAGO PARCIAL'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] border-b border-gray-900/50 pb-1.5">
                    <span className="text-gray-500">Valor da Fatura:</span>
                    <span className="text-white font-bold">R$ {pixPaymentReceipt.originalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-gray-900 font-extrabold text-[#10b981]">
                    <span>VALOR PAGO:</span>
                    <span className="text-sm">R$ {pixPaymentReceipt.paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>

                  {pixPaymentReceipt.type === 'Parcial' && (
                    <div className="flex justify-between items-center text-[10px] text-amber-500 pt-0.5 border-b border-gray-900/50 pb-1.5">
                      <span>Restante em Aberto:</span>
                      <span className="font-extrabold">R$ {pixPaymentReceipt.remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1 pt-1 text-[9px] text-gray-500 leading-tight">
                    <div>
                      <span>Controle ID Transação:</span>
                      <span className="text-gray-400 block break-all font-semibold font-mono mt-0.5">{pixPaymentReceipt.txId}</span>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <span>Protocolo:</span>
                      <span className="text-gray-400 font-bold font-mono">{pixPaymentReceipt.id}</span>
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span>Data/Hora:</span>
                      <span className="text-gray-400 font-bold font-mono">{new Date(pixPaymentReceipt.date).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                {pixPaymentReceipt.type === 'Parcial' && (
                  <p className="text-[9px] text-[#f59e0b] leading-tight italic bg-amber-950/20 border border-amber-900/35 p-2 rounded-lg font-sans">
                    💡 <strong>Desmembrado:</strong> O saldo de <strong>R$ {pixPaymentReceipt.remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> foi lançado automaticamente como pendente no DRE para acompanhamento.
                  </p>
                )}

                <p className="text-[8px] text-slate-500 text-center font-sans tracking-wide">
                  Lançamento efetuado via AutoPrecision Premium Cloud
                </p>

                <div className="flex flex-col gap-2 w-full font-mono">
                  <div className="flex gap-2 w-full">
                    <button
                      type="button"
                      onClick={handlePrintReceipt}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-750 text-white text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer border-none"
                    >
                      <Printer className="w-3.5 h-3.5 shrink-0 text-white" /> IMPRIMIR RECEIPT (PDF)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const messageText = `*COMPROVANTE DE PAGAMENTO PIX*\n\n` +
                          `*Beneficiário:* ${company?.name || 'AutoPrecision'}\n` +
                          `*Serviço/Fatura:* ${pixPaymentReceipt.title}\n` +
                          `*Status:* ${pixPaymentReceipt.type === 'Integral' ? 'PAGO' : 'PAGO PARCIAL'}\n` +
                          `*Valor Cobrado:* R$ ${pixPaymentReceipt.originalAmount.toFixed(2)}\n` +
                          `*Valor Pago:* R$ ${pixPaymentReceipt.paidAmount.toFixed(2)}\n` +
                          `*ID Transação:* ${pixPaymentReceipt.txId}\n` +
                          `*Protocolo:* ${pixPaymentReceipt.id}\n` +
                          `*Data/Hora:* ${new Date(pixPaymentReceipt.date).toLocaleString('pt-BR')}\n\n` +
                          `_Enviado de forma automática por AutoPrecision Premium ERP_`;
                        const encodedText = encodeURIComponent(messageText);
                        window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-950 text-white text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer border-none"
                    >
                      💬 ZAP COMPARTILHAR
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPixSelectedReceivable(null);
                      setPixPaymentReceipt(null);
                    }}
                    className="w-full py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    CONCLUIR
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
