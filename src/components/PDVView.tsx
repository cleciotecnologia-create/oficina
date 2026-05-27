import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Trash2, 
  Barcode, 
  Plus, 
  Minus, 
  CreditCard, 
  QrCode, 
  DollarSign, 
  Printer, 
  Check, 
  TrendingDown, 
  Lock, 
  Layers,
  User,
  UserPlus,
  Wrench,
  Tag,
  Briefcase,
  AlertCircle,
  Percent,
  CheckCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Produto, Servico, Cliente, SaleItem } from '../types';

export const PDVView: React.FC = () => {
  const { 
    produtos, 
    servicos,
    clientes,
    addCliente,
    caixaStatus, 
    abrirCaixa, 
    fecharCaixa, 
    addVenda, 
    user,
    company,
    ordensServico,
    editOS
  } = useApp();

  // Catalogue states
  const [activeTab, setActiveTab] = useState<'produtos' | 'servicos'>('produtos');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [basket, setBasket] = useState<SaleItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Cartão' | 'Dinheiro'>('PIX');
  const [commissionPct, setCommissionPct] = useState(5); // Default 5% seller fee
  
  // Workshop linked OS tracking
  const [linkedOSId, setLinkedOSId] = useState<string | null>(null);

  // Import open OS to POS checkout basket
  const handleImportOS = (osId: string) => {
    if (!osId) return;
    const os = ordensServico.find(o => o.id === osId);
    if (!os) return;

    // Map services
    const loadedServices: SaleItem[] = os.services.map(s => ({
      produtoId: s.id || `srv_dummy_${Math.random()}`,
      name: `🛠️ ${s.description}`,
      sellPrice: s.price,
      quantity: 1,
      subtotal: s.price
    }));

    // Map parts
    const loadedParts: SaleItem[] = os.parts.map(p => ({
      produtoId: p.id || `prt_dummy_${Math.random()}`,
      name: `📦 ${p.name}`,
      sellPrice: p.sellPrice,
      quantity: p.quantity,
      subtotal: p.sellPrice * p.quantity
    }));

    setBasket([...loadedServices, ...loadedParts]);
    
    // Set client
    if (os.clienteId) {
      setSelectedClienteId(os.clienteId);
    }
    
    setLinkedOSId(os.id);
  };
  
  // Attendant/seller chosen for commission attribution
  const [selectedSeller, setSelectedSeller] = useState<string>(user?.name || 'Clécio Santos');

  // Customer states inside POS
  const [selectedClienteId, setSelectedClienteId] = useState<string>('unidentified');
  const [isQuickAddingClient, setIsQuickAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientCpfCnpj, setNewClientCpfCnpj] = useState('');
  const [newClientSuccessMsg, setNewClientSuccessMsg] = useState('');

  // Register opening state
  const [openingAmountStr, setOpeningAmountStr] = useState('150.00');
  
  // Checkout & invoice state
  const [saleFinished, setSaleFinished] = useState(false);
  const [lastFinishedSale, setLastFinishedSale] = useState<any | null>(null);

  // Resolved active customer object
  const activeCustomer = useMemo(() => {
    if (selectedClienteId === 'unidentified') return null;
    return clientes.find(c => c.id === selectedClienteId) || null;
  }, [selectedClienteId, clientes]);

  // Filters computed based on tab
  const filteredProducts = useMemo(() => {
    return produtos.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.barcode.includes(searchQuery) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.compatibility && p.compatibility.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.internalSku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [produtos, searchQuery]);

  const filteredServices = useMemo(() => {
    return servicos.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [servicos, searchQuery]);

  // Adding Item (either Product or Service) to basket
  const handleAddToBasket = (p: Produto) => {
    if (p.quantity <= 0) {
      alert(`Alerta: Peça "${p.name}" está sem estoque físico em prateleira. A venda será registrada mesmo offline.`);
    }
    const exists = basket.find(item => item.produtoId === p.id);
    if (exists) {
      setBasket(prev => prev.map(item => 
        item.produtoId === p.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.sellPrice } 
          : item
      ));
    } else {
      setBasket(prev => [...prev, {
        produtoId: p.id,
        name: `📦 ${p.name}`,
        sellPrice: p.sellPrice,
        quantity: 1,
        subtotal: p.sellPrice
      }]);
    }
  };

  const handleAddServiceToBasket = (s: Servico) => {
    const exists = basket.find(item => item.produtoId === s.id);
    if (exists) {
      setBasket(prev => prev.map(item => 
        item.produtoId === s.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.sellPrice } 
          : item
      ));
    } else {
      setBasket(prev => [...prev, {
        produtoId: s.id,
        name: `🛠️ ${s.name}`,
        sellPrice: s.price,
        quantity: 1,
        subtotal: s.price
      }]);
    }
  };

  // Quick scan simulation
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const found = produtos.find(p => p.barcode === barcodeInput || p.internalSku.toLowerCase() === barcodeInput.toLowerCase());
    if (found) {
      handleAddToBasket(found);
      setBarcodeInput('');
    } else {
      alert("Nenhuma peça cadastrada com este código de barras ou SKU!");
    }
  };

  // Change quantity
  const handleQtyChange = (produtoId: string, delta: number) => {
    setBasket(prev => prev.map(item => {
      if (item.produtoId === produtoId) {
        const newQty = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: newQty,
          subtotal: newQty * item.sellPrice
        };
      }
      return item;
    }));
  };

  // Remove item
  const handleRemoveItem = (produtoId: string) => {
    setBasket(prev => prev.filter(item => item.produtoId !== produtoId));
  };

  // Financial aggregates
  const subtotal = basket.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const grandTotal = Math.max(0, subtotal - discountAmount);
  const commissionCost = (grandTotal * commissionPct) / 100;

  // Inline Client Quick Registration
  const handleQuickCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    try {
      const generatedId = "cli_pos_" + Math.floor(Math.random() * 100000);
      await addCliente({
        name: newClientName,
        phone: newClientPhone || '(00) 00000-0000',
        email: 'pos_customer@autotech.com',
        cpfCnpj: newClientCpfCnpj || '000.000.000-00',
        oilChangeAlert: false,
        reviewAlert: false,
      });

      // Find recently registered client (it might not be in list immediately if writing offline, but we simulate it cleanly)
      setNewClientSuccessMsg(`Cliente "${newClientName}" cadastrado com sucesso!`);
      
      // Auto select the newly provisioned name
      setSelectedClienteId("unidentified"); // Will select "new simulated offline/online"
      
      // We will look up by phone or name temporarily to anchor the context
      setTimeout(() => {
        // Find by name in refreshed context or fallback
        const freshlyCreated = clientes.find(c => c.name.toLowerCase() === newClientName.toLowerCase());
        if (freshlyCreated) {
          setSelectedClienteId(freshlyCreated.id);
        } else {
          // Fallback UI helper
          setSelectedClienteId("last_added");
        }
        setNewClientName('');
        setNewClientPhone('');
        setNewClientCpfCnpj('');
        setIsQuickAddingClient(false);
        setNewClientSuccessMsg('');
      }, 800);

    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar cliente.");
    }
  };

  // Register Checkout Sale
  const handleFinalizeSale = async () => {
    if (basket.length === 0) return;
    
    const saleId = "VND-" + Math.floor(100000 + Math.random() * 900000);
    
    // Resolve final client metadata
    let finalClientName = "Consumidor Final";
    let finalClientCpf = "000.000.000-00";
    if (selectedClienteId === 'last_added') {
      finalClientName = "Novo Cliente Balcão";
    } else if (activeCustomer) {
      finalClientName = activeCustomer.name;
      finalClientCpf = activeCustomer.cpfCnpj;
    }

    const saleDetails = {
      id: saleId,
      items: [...basket],
      discount: discountAmount,
      total: grandTotal,
      paymentMethod,
      commission: commissionCost,
      sellerId: user?.uid || "seller_demo",
      sellerName: selectedSeller,
      clienteId: selectedClienteId !== 'unidentified' ? selectedClienteId : undefined,
      clienteName: finalClientName,
      clienteCpfCnpj: finalClientCpf,
      linkedOSId: linkedOSId || undefined
    };

    await addVenda(saleDetails);

    if (linkedOSId) {
      try {
        await editOS(linkedOSId, { status: 'Entregue' });
      } catch (err) {
        console.error("Erro ao atualizar status da OS ligada:", err);
      }
    }

    setLastFinishedSale(saleDetails);
    setBasket([]);
    setDiscountPercent(0);
    setLinkedOSId(null);
    setSaleFinished(true);
  };

  if (!caixaStatus || caixaStatus.status === 'Fechado') {
    return (
      <div className="max-w-md mx-auto my-12 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 text-left shadow-lg">
        <div className="flex items-center gap-3 border-b border-gray-850 pb-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-650/10 text-red-500 flex items-center justify-center border border-red-900/30">
            <Lock className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">Abertura de Caixa Requerida</h3>
            <p className="text-xs text-gray-400 font-mono">Abra o caixa diário unificado antes de iniciar as operações integradas da loja e oficina.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2 font-bold">VALOR DE ABERTURA EM DINHEIRO (SUPRIMENTO DE TROCO)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-gray-500 text-sm font-semibold">R$</span>
              <input 
                type="number"
                value={openingAmountStr}
                onChange={(e) => setOpeningAmountStr(e.target.value)}
                className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2 px-4 pl-10 text-sm focus:outline-none focus:border-red-500 font-mono text-white text-lg font-bold"
              />
            </div>
          </div>

          <button 
            type="button"
            onClick={() => abrirCaixa(parseFloat(openingAmountStr) || 0)}
            className="w-full mt-2 py-4 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl font-bold text-white shadow-lg shadow-red-950/40 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            🔓 ABRIR CAIXA UNIFICADO (LOJA & OFICINA)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left items-start">
      
      {/* LEFT COLUMN: POS Catalogue (7 columns) */}
      <div className="col-span-12 xl:col-span-7 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-4">
        
        {/* Header containing Name and Quick Barcode Scanner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4">
          <div>
            <h2 className="font-display font-extrabold text-xl text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-red-500" /> PDV INTEGRADO (LOJA & OFICINA)
            </h2>
            <span className="text-[10px] text-gray-500 font-mono block uppercase">Frente de Caixa Rápido e Unificado: Peças, Consumíveis e Serviços Técnicos da Oficina</span>
          </div>

          {/* Barcode Quick Submission Filter */}
          <form onSubmit={handleBarcodeSubmit} className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Barcode className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Código de barras ou SKU..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 pl-9 text-xs focus:outline-none focus:border-red-500 text-white font-mono w-full sm:w-48 placeholder-gray-600"
              />
            </div>
            <button 
              type="submit" 
              className="px-3 bg-red-950/20 text-red-400 text-xs font-bold font-mono rounded-lg border border-red-900/40 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
            >
              BUSCAR
            </button>
          </form>
        </div>

        {/* Tab Controls: Products / Services */}
        <div className="flex bg-[#080b13] p-1 rounded-xl border border-gray-800">
          <button
            type="button"
            onClick={() => { setActiveTab('produtos'); setSearchQuery(''); }}
            className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'produtos' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/20 font-extrabold' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <span>📦</span> MÓDULO PEÇAS & FLUIDOS ({produtos.length})
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('servicos'); setSearchQuery(''); }}
            className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'servicos' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/20 font-extrabold' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <span>🛠️</span> SERVIÇOS & MÃO DE OBRA ({servicos.length})
          </button>
        </div>

        {/* Search input field */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder={
              activeTab === 'produtos' 
                ? "Pesquise produto por nome, SKU interno, marca ou chassi/aplicação de veículos..."
                : "Pesquise serviço express por nome, descrição ou categoria mecânica..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-4 pl-10 text-xs text-white focus:outline-none focus:border-red-500 placeholder-gray-600"
          />
        </div>

        {/* Dynamic Catalogue Results */}
        {activeTab === 'produtos' ? (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => (
              <div 
                key={p.id}
                onClick={() => handleAddToBasket(p)}
                className="p-3.5 bg-gray-950/30 rounded-xl border border-gray-900 flex justify-between items-center group hover:border-red-500/30 hover:bg-red-950/5 cursor-pointer transition-all shrink-0 text-left"
              >
                <div className="flex flex-col gap-0.5 truncate pr-2">
                  <span className="text-xs font-bold text-white group-hover:text-red-400 transition-colors truncate">{p.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono truncate">SKU: {p.internalSku} • Marca: <span className="text-gray-300">{p.brand}</span></span>
                  {p.compatibility && (
                    <span className="text-[9px] text-slate-500 block truncate" title={p.compatibility}>
                      Aplica: {p.compatibility}
                    </span>
                  )}
                  <span className={`text-[9px] font-mono mt-1 ${p.quantity <= p.minStock ? 'text-red-500 font-bold bg-red-950/20 px-1 py-0.2 rounded w-fit' : 'text-green-500 font-medium'}`}>
                    Estoque: {p.quantity} un {p.quantity <= p.minStock ? '(Crítico!)' : ''}
                  </span>
                </div>
                <div className="text-right flex flex-col gap-1.5 items-end shrink-0">
                  <span className="text-xs text-gray-500 font-mono line-through text-[10px]">R$ {(p.sellPrice * 1.1).toFixed(2)}</span>
                  <span className="text-sm font-bold text-white font-mono">R$ {p.sellPrice.toFixed(2)}</span>
                  <div className="w-6 h-6 rounded-lg bg-red-950/20 border border-red-900/40 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all text-xs font-bold">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-1 sm:col-span-2 text-center py-16 text-xs text-gray-500 font-mono">
                Nenhum produto cadastrado coincide com a pesquisa "{searchQuery}".
              </div>
            )}
          </div>
        ) : (
          /* Services list */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto pr-1">
            {filteredServices.map((s) => (
              <div 
                key={s.id}
                onClick={() => handleAddServiceToBasket(s)}
                className="p-3.5 bg-gray-950/30 rounded-xl border border-gray-900 flex justify-between items-center group hover:border-red-500/30 hover:bg-red-950/5 cursor-pointer transition-all shrink-0 text-left"
              >
                <div className="flex flex-col gap-0.5 truncate pr-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase bg-purple-950/30 text-purple-400 border border-purple-900/30 rounded px-1.5 py-0.2 font-mono">Mão de Obra</span>
                    <span className="text-[9px] font-mono text-gray-500">{s.category}</span>
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-red-400 transition-colors truncate mt-0.5">{s.name}</span>
                  <p className="text-[10px] text-gray-400 leading-snug line-clamp-2 mt-0.5" title={s.desc}>
                    {s.description || "Sem descrição cadastrada."}
                  </p>
                  {s.duration && (
                    <span className="text-[9px] text-gray-500 font-mono block mt-1">🕒 Estimado: {s.duration}</span>
                  )}
                </div>
                <div className="text-right flex flex-col gap-1 items-end shrink-0">
                  <span className="text-sm font-extrabold text-purple-400 font-mono">R$ {s.price.toFixed(2)}</span>
                  <div className="w-6 h-6 rounded-lg bg-red-950/20 border border-red-900/40 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all text-xs font-bold">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
            {filteredServices.length === 0 && (
              <div className="col-span-1 sm:col-span-2 text-center py-16 text-xs text-gray-500 font-mono">
                Nenhum serviço técnico coincide com a pesquisa "{searchQuery}".
              </div>
            )}
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: CLIENT INTEGRATION & SHOPPING CART (5 columns) */}
      <div className="col-span-12 xl:col-span-5 flex flex-col gap-5">
        
        {/* Module OS: VINCULAR ORDEM DE SERVIÇO */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-5 flex flex-col gap-3.5">
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <h3 className="text-xs font-bold text-white font-mono flex items-center gap-1.5 uppercase">
              <Wrench className="w-4 h-4 text-red-500 animate-pulse" /> 🎛️ VINCULAR ORDEM DE SERVIÇO
            </h3>
            {linkedOSId && (
              <span className="text-[10px] bg-red-650/20 text-red-400 font-bold px-2 py-0.5 rounded font-mono animate-pulse">
                OS ATIVA
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2.5 text-xs text-left">
            <label className="text-[10px] font-mono text-gray-400">SELECIONE UMA OS PARA ADICIONAR AO CAIXA:</label>
            <select
              value={linkedOSId || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  setLinkedOSId(null);
                  setBasket([]);
                } else {
                  handleImportOS(val);
                }
              }}
              className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono focus:outline-none focus:border-red-500 cursor-pointer text-left"
            >
              <option value="">-- Selecione a OS para faturar --</option>
              {ordensServico
                .filter(o => o.status !== 'Entregue')
                .map(o => (
                  <option key={o.id} value={o.id}>
                    🔧 {o.id} - {o.veiculoInfo || o.plate} ({o.clienteName || 'Sem nome'}) - R$ {o.total.toFixed(2)} [Status: {o.status}]
                  </option>
                ))}
            </select>

            {linkedOSId && (() => {
              const matchedOS = ordensServico.find(o => o.id === linkedOSId);
              if (!matchedOS) return null;
              return (
                <div className="mt-1 p-3 rounded-xl bg-red-950/15 border border-red-900/35 flex flex-col gap-1.5 text-xs font-mono leading-normal">
                  <div className="flex justify-between items-center text-white font-bold">
                    <span className="text-red-400 font-sans">🛠️ CONTEXTO DE OFICINA VINCULADO</span>
                    <button
                      type="button"
                      onClick={() => {
                        setLinkedOSId(null);
                        setBasket([]);
                      }}
                      className="text-[9px] text-red-400 hover:text-white underline cursor-pointer"
                    >
                      Remover Vínculo
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 text-[11px] text-gray-300 mt-0.5">
                    <span>Ordem de Serviço: <strong className="text-white">{matchedOS.id}</strong></span>
                    <span>Automóvel: <strong className="text-white">{matchedOS.veiculoInfo || matchedOS.plate}</strong></span>
                    <span>Cliente: <strong className="text-white">{matchedOS.clienteName || 'Balcão'}</strong></span>
                    <span className="text-amber-400 font-bold">Total faturando no Caixa: R$ {matchedOS.total.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 leading-snug mt-1 pt-1.5 border-t border-red-950/60 font-sans">
                    💡 <em>Nota: Fechar esta venda marcará a OS #{matchedOS.id} como <strong>Entregue (Paga e Encerrada)</strong> e gerará o cupom fiscal de peças e serviços unificados.</em>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Module A: CUSTOMER DESIGN & INTEGRATION */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-5 flex flex-col gap-3.5">
          
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <h3 className="text-xs font-bold text-white font-mono flex items-center gap-1.5 uppercase">
              <User className="w-4 h-4 text-red-500" /> 1. IDENTIFICAÇÃO DO CLIENTE
            </h3>
            
            <button
              type="button"
              onClick={() => {
                setIsQuickAddingClient(!isQuickAddingClient);
                setNewClientSuccessMsg('');
              }}
              className="text-[10px] font-mono font-bold text-red-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-red-500" />
              {isQuickAddingClient ? "CANCELAR" : "CADASTRAR RÁPIDO"}
            </button>
          </div>

          {/* Quick client registration drawer inside POS */}
          {isQuickAddingClient ? (
            <form onSubmit={handleQuickCreateClient} className="bg-gray-950/40 p-4 rounded-xl border border-gray-800 flex flex-col gap-3 font-sans text-xs">
              <span className="text-[10px] font-mono font-bold text-red-450 text-red-400 uppercase">NOVO REGISTRO RÁPIDO EM PDV</span>
              
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono text-gray-400">NOME DO CLIENTE *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nome completo..."
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="bg-[#050810] border border-gray-800 rounded-lg p-2 text-white text-xs text-left"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-gray-400">CELULAR / WHATSAPP</label>
                  <input 
                    type="text" 
                    placeholder="(11) 99999-9999"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="bg-[#050810] border border-gray-800 rounded-lg p-2 text-white text-xs text-left"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-gray-400">CPF OU CNPJ</label>
                  <input 
                    type="text" 
                    placeholder="000.000.000-00"
                    value={newClientCpfCnpj}
                    onChange={(e) => setNewClientCpfCnpj(e.target.value)}
                    className="bg-[#050810] border border-gray-800 rounded-lg p-2 text-white text-xs text-left"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-red-650 hover:bg-red-700 bg-red-650 bg-red-600 text-white font-bold rounded-lg text-xs tracking-wider cursor-pointer font-mono"
              >
                SALVAR E SELECIONAR CLIENTE
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-gray-400">BUSQUE OU SELECIONE CLIENTE:</label>
              <div className="flex gap-2">
                <select
                  value={selectedClienteId}
                  onChange={(e) => setSelectedClienteId(e.target.value)}
                  className="flex-1 bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="unidentified">Consumidor Balcão (Não identificado)</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      👤 {c.name.substring(0, 24)} {c.name.length > 24 ? '...' : ''} ({c.cpfCnpj || 'Balcão'})
                    </option>
                  ))}
                  {selectedClienteId === 'last_added' && (
                    <option value="last_added">✨ Novo Cliente Cadastrado (Não sincronizado)</option>
                  )}
                </select>
              </div>

              {/* Selected Customer Data Card */}
              {activeCustomer && (
                <div className="mt-1.5 p-3 rounded-lg bg-red-950/10 border border-red-900/20 text-xs font-mono text-left flex flex-col gap-1 leading-normal">
                  <div className="flex items-center gap-1.5 text-red-400 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>CLIENTE SELECIONADO</span>
                  </div>
                  <span className="text-white font-bold">{activeCustomer.name}</span>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>Telefone: {activeCustomer.phone}</span>
                    <span>Documento: {activeCustomer.cpfCnpj}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {newClientSuccessMsg && (
            <div className="p-2 border border-green-900/60 bg-green-950/20 text-green-400 text-[10px] font-mono rounded flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-500 shrink-0" />
              <span>{newClientSuccessMsg}</span>
            </div>
          )}

        </div>

        {/* Module B: COMPREHENSIVE SHOPPING BASKET */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-5 flex flex-col justify-between min-h-[480px]">
          
          <div>
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <span className="text-xs font-bold text-white font-mono uppercase flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-red-500" />
                2. CARRINHO DE VENDA
              </span>
              <span className="text-[10px] bg-red-950/40 text-red-500 font-bold px-2 py-0.5 rounded font-mono">
                {basket.length} ITENS
              </span>
            </div>

            {/* Scrollable list items */}
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {basket.map((item) => (
                <div key={item.produtoId} className="flex justify-between items-center p-2.5 rounded-xl bg-gray-950/40 border border-gray-900 text-xs text-left group">
                  <div className="flex-grow pr-2 truncate">
                    <span className="font-semibold text-white block truncate">{item.name}</span>
                    <span className="text-[10px] text-gray-500 block font-mono">Unitário: R$ {item.sellPrice.toFixed(2)}</span>
                  </div>
                  
                  {/* Quantity controls */}
                  <div className="flex items-center gap-1 shrink-0 mx-2">
                    <button 
                      type="button"
                      onClick={() => handleQtyChange(item.produtoId, -1)}
                      className="w-5.5 h-5.5 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-white cursor-pointer active:scale-95 transition-all"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="w-6.5 text-center font-mono font-bold text-white">{item.quantity}</span>
                    <button 
                      type="button"
                      onClick={() => handleQtyChange(item.produtoId, 1)}
                      className="w-5.5 h-5.5 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-white cursor-pointer active:scale-95 transition-all"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <div className="text-right shrink-0 pr-1 mr-2 w-20">
                    <span className="font-mono text-white font-bold block">R$ {item.subtotal.toFixed(2)}</span>
                  </div>

                  <button 
                    type="button"
                    onClick={() => handleRemoveItem(item.produtoId)}
                    className="p-1 rounded text-gray-500 hover:text-red-500 hover:bg-red-950/15 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {basket.length === 0 && (
                <div className="text-center py-20 text-gray-500 font-mono flex flex-col items-center justify-center gap-3">
                  <Layers className="w-10 h-10 text-slate-850 text-gray-800" />
                  <span className="text-xs">CARRINHO DE COMPRAS VAZIO</span>
                  <span className="text-[9px] text-gray-600">Adicione peças ou serviços ao lado para iniciar.</span>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Controls and Calculations */}
          {basket.length > 0 && (
            <div className="mt-6 border-t border-gray-850 pt-4 flex flex-col gap-4 text-left">
              
              {/* Payment Methods selector */}
              <div>
                <label className="text-[9px] font-mono text-gray-400 block mb-2 font-bold uppercase">MÉTODOS DE PAGAMENTO DE FRENTE DE CAIXA</label>
                <div className="grid grid-cols-3 gap-2 [&>button]:py-2.5 [&>button]:rounded-xl [&>button]:text-xs [&>button]:font-bold [&>button]:font-mono">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      paymentMethod === 'PIX' ? 'border-red-500 text-white bg-red-950/20 shadow' : 'border-gray-800 text-gray-400 bg-transparent'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 text-red-500" /> PIX
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('Cartão')}
                    className={`flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      paymentMethod === 'Cartão' ? 'border-red-500 text-white bg-red-950/20 shadow' : 'border-gray-800 text-gray-400 bg-transparent'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-red-500" /> Cartão
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('Dinheiro')}
                    className={`flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      paymentMethod === 'Dinheiro' ? 'border-red-500 text-white bg-red-950/20 shadow' : 'border-gray-800 text-gray-400 bg-transparent'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5 text-red-500" /> Dinheiro
                  </button>
                </div>
              </div>

              {/* Commission Seller Assignee */}
              <div>
                <label className="text-[9px] font-mono text-gray-400 block mb-1.5 font-bold uppercase">ATRIBUIR VENDA FILIADA (VENDEDOR / ATENDENTE)</label>
                <select
                  value={selectedSeller}
                  onChange={(e) => setSelectedSeller(e.target.value)}
                  className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value={user?.name || 'Administrador'}>👤 Logado: {user?.name || 'Administrador'}</option>
                  <option value="Clécio Santos">👤 Clécio Santos (Sócio-Técnico)</option>
                  <option value="Lucas Almeida">👤 Lucas Almeida (Mecânico Sênior)</option>
                  <option value="Thiago Ramos">👤 Thiago Ramos (Auxiliar de Pátio)</option>
                  <option value="Marcos Lima">👤 Marcos Lima (Mecânico Diesel)</option>
                </select>
              </div>

              {/* Discount inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-mono text-gray-400 block mb-1 font-bold uppercase">DESCONTO DE BALCÃO (%)</label>
                  <div className="relative">
                    <Percent className="absolute right-3 top-2 w-3.5 h-3.5 text-gray-500" />
                    <input 
                      type="number" 
                      min="0" 
                      max="75"
                      placeholder="Desconto"
                      value={discountPercent || ''}
                      onChange={(e) => setDiscountPercent(Math.min(75, parseFloat(e.target.value) || 0))}
                      className="w-full bg-[#080c16] border border-gray-800 rounded-lg py-1.5 px-3 pl-3 text-xs text-white font-mono text-left"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-mono text-gray-400 block mb-1 font-bold uppercase">TAXA DE COMISSÃO (%)</label>
                  <div className="relative">
                    <Percent className="absolute right-3 top-2 w-3.5 h-3.5 text-gray-500" />
                    <input 
                      type="number" 
                      min="0" 
                      max="30"
                      value={commissionPct}
                      onChange={(e) => setCommissionPct(Math.min(30, parseFloat(e.target.value) || 0))}
                      className="w-full bg-[#080c16] border border-gray-800 rounded-lg py-1.5 px-3 pl-3 text-xs text-white font-mono text-left"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing breakdown details with beautiful high contrast */}
              <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-900 text-xs font-mono flex flex-col gap-2">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal bruto</span>
                  <span className="text-white">R$ {subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-amber-500 font-bold">
                    <span>Desconto ({discountPercent}%)</span>
                    <span>- R$ {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500 text-[10px]">
                  <span>Comissão para {selectedSeller.split(' ')[0]} ({commissionPct}%)</span>
                  <span>R$ {commissionCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black border-t border-gray-900 pt-2.5 text-white">
                  <span className="text-gray-300">TOTAL COBRANÇA</span>
                  <span className="text-red-500 font-display text-base">R$ {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleFinalizeSale}
                className="w-full py-4 bg-red-650 hover:bg-red-700 bg-red-600 text-white font-bold rounded-xl text-xs sm:text-xs tracking-widest font-mono cursor-pointer shadow-lg shadow-red-950/40 text-center active:scale-98 transition-transform uppercase"
              >
                📥 REGISTRAR E IMPRIMIR VENDA
              </button>

            </div>
          )}

        </div>

        {/* Closing Register Widget */}
        <div className="bg-[#0b0f19] p-4 rounded-xl border border-gray-900 text-xs flex justify-between items-center text-left">
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-400 block font-semibold leading-none uppercase text-[8.5px] font-mono tracking-wider">Caixa Unificado Loja & Oficina</span>
            <span className="text-[10px] text-gray-500 font-mono">Abertura: R$ {caixaStatus.initialAmount.toFixed(2)}</span>
            <span className="text-xs text-white font-mono font-bold mt-0.5">Dinheiro em Caixa: <strong className="text-red-400 font-display">R$ {caixaStatus.currentAmount.toFixed(2)}</strong></span>
          </div>
          <button 
            type="button"
            onClick={fecharCaixa}
            className="px-3 py-2 rounded-lg border border-red-900 bg-red-950/20 text-red-400 hover:bg-red-600 hover:text-white transition-all font-bold font-mono text-[10px] cursor-pointer"
          >
            🔒 FECHAR CAIXA DO DIA
          </button>
        </div>

      </div>

      {/* DYNAMIC THERMAL PRINTER RECEIPT DIALOG MODAL */}
      {saleFinished && lastFinishedSale && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white text-black max-w-sm w-full rounded-2xl p-6 shadow-2xl relative text-left">
            
            <button 
              type="button"
              onClick={() => {
                setSaleFinished(false);
                setLastFinishedSale(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center font-mono text-xs border-b-2 border-black pb-3">
              <span className="font-extrabold text-sm block tracking-widest">{company.name.toUpperCase()}</span>
              <span className="text-[10px] block mt-0.5">{company.address || "Av. das Nações Unidas, 1040 - São Paulo, SP"}</span>
              <span className="text-[10px] block">CNPJ: {company.cnpj || "12.345.678/0001-90"} • Fone: {company.phone || "(11) 98765-4321"}</span>
            </div>
            
            <div className="my-4 font-mono text-[11px] flex flex-col gap-1">
              <div className="flex justify-between font-bold">
                <span>CUPOM NÃO FISCAL</span>
                <span>PDV #{lastFinishedSale.id}</span>
              </div>
              <span>Data/Hora: {new Date().toLocaleString()}</span>
              <span className="border-b border-dashed border-black my-1"></span>
              
              {/* Customer Space */}
              <div className="bg-neutral-100 p-2 rounded text-[10px] flex flex-col gap-0.5 text-neutral-850">
                <span className="font-bold">CLIENTE:</span>
                <span>{lastFinishedSale.clienteName}</span>
                <span>CPF/CNPJ: {lastFinishedSale.clienteCpfCnpj || "Consumidor Final"}</span>
              </div>

              {/* Seller / Commission tracking */}
              {lastFinishedSale.sellerName && (
                <div className="text-[10px] text-gray-600 mt-1 pl-1">
                  <span>Atendente: <strong>{lastFinishedSale.sellerName}</strong></span>
                </div>
              )}

              {lastFinishedSale.linkedOSId && (
                <div className="bg-red-50 p-2 rounded text-[10px] mt-1 text-red-800 border border-red-200">
                  <span className="font-bold">ORDEM DE SERVIÇO:</span>
                  <span className="block font-semibold">{lastFinishedSale.linkedOSId}</span>
                </div>
              )}

              <span className="border-b border-dashed border-black my-1"></span>
              
              {/* Product and Labor list inside Ticket */}
              <div className="flex flex-col gap-1.5 font-sans">
                <span className="font-bold font-mono text-[10px] uppercase text-neutral-650 block">ITENS COMPRADOS / CÓDIGOS:</span>
                {lastFinishedSale.items.map((it: any, index: number) => (
                  <div key={index} className="flex justify-between items-start text-xs leading-tight">
                    <span className="pr-2">{it.quantity}x {it.name}</span>
                    <span className="font-mono text-right whitespace-nowrap">R$ {it.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <span className="border-b border-dashed border-black my-1.5"></span>
              
              {/* Financial calculations */}
              <div className="flex justify-between text-xs">
                <span>Subtotal bruto:</span>
                <span>R$ {(lastFinishedSale.total + lastFinishedSale.discount).toFixed(2)}</span>
              </div>

              {lastFinishedSale.discount > 0 && (
                <div className="flex justify-between text-red-650 font-bold text-xs">
                  <span>Desconto de Balcão:</span>
                  <span>- R$ {lastFinishedSale.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-sm border-t border-neutral-300 pt-1 mt-1 font-mono text-black">
                <span>TOTAL A PAGAR:</span>
                <span>R$ {lastFinishedSale.total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-[10px] text-neutral-600 mt-1 pl-1 font-mono">
                <span>Modalidade de Pago:</span>
                <span className="font-bold text-black uppercase">{lastFinishedSale.paymentMethod}</span>
              </div>
            </div>

            <div className="text-center text-[10px] font-mono border-t border-black pt-3 flex flex-col gap-0.5 text-neutral-505 text-gray-600">
              <span>Volte sempre! Obrigado pela preferência.</span>
              <span className="block italic text-[8.5px] text-neutral-500">AutoTech Cloud ERP Systems Software v1.2</span>
            </div>

            {/* Action buttons inside Ticket receipt popup */}
            <div className="mt-6 flex gap-2 font-mono">
              <button 
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all active:scale-[98%]"
              >
                <Printer className="w-4 h-4 text-white" /> Imprimir Cupom
              </button>
              <button 
                type="button"
                onClick={() => {
                  setSaleFinished(false);
                  setLastFinishedSale(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs text-neutral-800 font-bold cursor-pointer transition-all active:scale-[98%] text-center"
              >
                Fechar Recibo
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
