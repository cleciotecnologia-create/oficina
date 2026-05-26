import React, { useState } from 'react';
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
  Layers 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Produto, SaleItem } from '../types';

export const PDVView: React.FC = () => {
  const { 
    produtos, 
    caixaStatus, 
    abrirCaixa, 
    fecharCaixa, 
    addVenda, 
    user 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [basket, setBasket] = useState<SaleItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Cartão' | 'Dinheiro'>('PIX');
  const [commissionPct, setCommissionPct] = useState(5); // Default 5% seller fee
  
  // Opening register helper
  const [openingAmountStr, setOpeningAmountStr] = useState('150.00');
  
  // Checkout states
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [saleFinished, setSaleFinished] = useState(false);
  const [lastFinishedSale, setLastFinishedSale] = useState<any | null>(null);

  // Search filter
  const filteredProducts = produtos.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.barcode.includes(searchQuery) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.compatibility && p.compatibility.toLowerCase().includes(searchQuery.toLowerCase())) ||
    p.internalSku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add Item
  const handleAddToBasket = (p: Produto) => {
    if (p.quantity <= 0) {
      alert("Alerta: Produto sem estoque físico disponível no momento!");
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
        name: p.name,
        sellPrice: p.sellPrice,
        quantity: 1,
        subtotal: p.sellPrice
      }]);
    }
  };

  // Barcode quick scan simulation
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = produtos.find(p => p.barcode === barcodeInput || p.internalSku.toLowerCase() === barcodeInput.toLowerCase());
    if (found) {
      handleAddToBasket(found);
      setBarcodeInput('');
    } else {
      alert("Produto com código de barras ou SKU não encontrado!");
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

  // Total summary
  const subtotal = basket.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const grandTotal = Math.max(0, subtotal - discountAmount);
  const commissionCost = (grandTotal * commissionPct) / 100;

  // Finalize Sale
  const handleFinalizeSale = async () => {
    if (basket.length === 0) return;
    
    const saleId = "VND-" + Math.floor(100000 + Math.random() * 900000);
    const mockSaleDetails = {
      id: saleId,
      items: [...basket],
      discount: discountAmount,
      total: grandTotal,
      paymentMethod,
      commission: commissionCost,
      sellerId: user?.uid || "seller_demo"
    };

    await addVenda(mockSaleDetails);
    setLastFinishedSale(mockSaleDetails);
    setBasket([]);
    setDiscountPercent(0);
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
            <p className="text-xs text-gray-400 font-mono">Abra o caixa diário antes de iniciar operações.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2">VALOR DE ABERTURA EM DINHEIRO (SUPRIMENTO)</label>
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
            onClick={() => abrirCaixa(parseFloat(openingAmountStr) || 0)}
            className="w-full mt-2 py-4 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl font-bold text-white shadow-lg shadow-red-950/40 text-sm transition-all flex items-center justify-center gap-2"
          >
            🔓 ABRIR CAIXA OPERACIONAL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left items-start">
      
      {/* LEFT COLUMN: POS Search Catalogue (8 columns) */}
      <div className="col-span-12 xl:col-span-7 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-5">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-display font-extrabold text-lg text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-red-500" /> FRENTE DE CAIXA PDV
            </h2>
            <span className="text-[10px] text-gray-500 font-mono block">Venda rápida de peças de balcão e lubrificantes.</span>
          </div>

          {/* Barcode scanner direct submit */}
          <form onSubmit={handleBarcodeSubmit} className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Barcode className="absolute left-3 top-2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Escaneie código barras..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-lg py-1.5 px-3 pl-9 text-xs focus:outline-none focus:border-red-500 text-white font-mono"
              />
            </div>
            <button type="submit" className="px-3 bg-slate-800 text-xs rounded-lg font-mono border border-slate-700 text-slate-200">
              OK
            </button>
          </form>
        </div>

        {/* Catalog Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Pesquise peça por nome, código interno SKU ou chapa de aplicação..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-4 pl-10 text-xs text-white focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Catalogue products items results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
          {filteredProducts.map((p) => (
            <div 
              key={p.id}
              onClick={() => handleAddToBasket(p)}
              className="p-3.5 bg-gray-950/20 rounded-xl border border-gray-900 flex justify-between items-center group hover:border-red-500/20 cursor-pointer transition-all shrink-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-white group-hover:text-red-400 transition-colors">{p.name}</span>
                <span className="text-[10px] text-gray-400 font-mono">SKU: {p.internalSku} • Marca: {p.brand}</span>
                {p.compatibility && (
                  <span className="text-[9px] text-gray-400 block truncate max-w-[200px]" title={p.compatibility}>
                    Aplicações: {p.compatibility}
                  </span>
                )}
                <span className={`text-[9px] font-mono mt-0.5 ${p.quantity <= p.minStock ? 'text-red-500 font-bold' : 'text-green-500'}`}>
                  Estoque: {p.quantity} un {p.quantity <= p.minStock ? '(Crítico!)' : ''}
                </span>
              </div>
              <div className="text-right flex flex-col gap-1 items-end shrink-0">
                <span className="text-sm font-bold text-white font-mono">R$ {p.sellPrice}</span>
                <div className="w-6 h-6 rounded-lg bg-red-650/10 border border-red-950 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all text-sm font-bold">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-2 text-center py-12 text-xs text-gray-500">
              Nenhum produto cadastrado coincide com a pesquisa atual.
            </div>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: POS BASKET CART (5 columns) */}
      <div className="col-span-12 xl:col-span-5 flex flex-col gap-6">
        
        {/* Active shopping basket */}
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col justify-between min-h-[500px]">
          
          <div>
            <div className="flex justify-between items-center border-b border-gray-850 pb-4 mb-4">
              <span className="text-xs font-bold text-white font-mono">CARRINHO DE COMPRA</span>
              <span className="text-[10px] bg-red-950/40 text-red-500 font-semibold px-2 py-0.5 rounded">
                {basket.length} itens inclusos
              </span>
            </div>

            {/* List items */}
            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
              {basket.map((item) => (
                <div key={item.produtoId} className="flex justify-between items-center p-2 rounded-xl bg-gray-950/40 border border-gray-900 text-xs">
                  <div className="flex-1 pr-2">
                    <span className="font-semibold text-white block">{item.name}</span>
                    <span className="text-[10px] text-gray-500 block font-mono">Unit: R$ {item.sellPrice.toFixed(2)}</span>
                  </div>
                  
                  {/* Quantity modifiers */}
                  <div className="flex items-center gap-1.5 shrink-0 mx-2">
                    <button 
                      onClick={() => handleQtyChange(item.produtoId, -1)}
                      className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-white"
                    >
                      <Minus className="w-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-white">{item.quantity}</span>
                    <button 
                      onClick={() => handleQtyChange(item.produtoId, 1)}
                      className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-white"
                    >
                      <Plus className="w-3" />
                    </button>
                  </div>

                  <div className="text-right shrink-0 pr-1 mr-2">
                    <span className="font-mono text-white font-bold block">R$ {item.subtotal.toFixed(2)}</span>
                  </div>

                  <button 
                    onClick={() => handleRemoveItem(item.produtoId)}
                    className="p-1 rounded text-gray-500 hover:text-red-500 hover:bg-red-950/15"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {basket.length === 0 && (
                <div className="text-center py-16 text-gray-500 font-mono flex flex-col items-center justify-center gap-2">
                  <Layers className="w-8 h-8 text-slate-800" />
                  <span>CARRINHO VAZIO</span>
                </div>
              )}
            </div>
          </div>

          {/* Calculating prices and cash parameters */}
          {basket.length > 0 && (
            <div className="mt-6 border-t border-gray-850 pt-4 flex flex-col gap-4">
              
              {/* Payment Methods selector */}
              <div>
                <label className="text-[10px] font-mono text-gray-400 block mb-2">FORMA DE PAGAMENTO</label>
                <div className="grid grid-cols-3 gap-2 [&>button]:py-2 [&>button]:rounded-lg [&>button]:text-xs [&>button]:font-semibold [&>button]:font-mono">
                  <button 
                    onClick={() => setPaymentMethod('PIX')}
                    className={`flex items-center justify-center gap-1.5 border ${
                      paymentMethod === 'PIX' ? 'border-red-500 text-white bg-red-950/10' : 'border-gray-800 text-gray-400 bg-transparent'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" /> PIX
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('Cartão')}
                    className={`flex items-center justify-center gap-1.5 border ${
                      paymentMethod === 'Cartão' ? 'border-red-500 text-white bg-red-950/10' : 'border-gray-800 text-gray-400 bg-transparent'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Cartão
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('Dinheiro')}
                    className={`flex items-center justify-center gap-1.5 border ${
                      paymentMethod === 'Dinheiro' ? 'border-red-500 text-white bg-red-950/10' : 'border-gray-800 text-gray-400 bg-transparent'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Dinheiro
                  </button>
                </div>
              </div>

              {/* Discount inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-mono text-gray-400 block mb-1">CUPOM DESCONTO (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="90"
                    placeholder="Desconto %"
                    value={discountPercent || ''}
                    onChange={(e) => setDiscountPercent(Math.min(90, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#080c16] border border-gray-800 rounded-lg py-1 px-3 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono text-gray-400 block mb-1">COMISSÃO VENDEDOR (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="20"
                    value={commissionPct}
                    onChange={(e) => setCommissionPct(Math.min(20, parseFloat(e.target.value) || 0))}
                    className="w-full bg-[#080c16] border border-gray-800 rounded-lg py-1 px-3 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Price list details */}
              <div className="bg-gray-950/50 p-3 rounded-xl border border-gray-900 text-xs font-mono flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">R$ {subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>Desconto ({discountPercent}%)</span>
                    <span>- R$ {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500 text-[10px]">
                  <span>Comissão Atendente ({commissionPct}%)</span>
                  <span>R$ {commissionCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-gray-900 pt-2 text-white">
                  <span>TOTAL COBRANÇA</span>
                  <span className="text-red-500 font-display">R$ {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleFinalizeSale}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-red-950/40 font-mono tracking-widest cursor-pointer"
              >
                📥 CONFIRMAR E REGISTRAR VENDA
              </button>

            </div>
          )}

        </div>

        {/* Caixa closing module safety */}
        <div className="bg-[#0b0f19] p-4 rounded-xl border border-gray-900 text-xs flex justify-between items-center text-left">
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-400 block font-semibold leading-none">CONTA OPERACIONAL</span>
            <span className="text-[10px] text-gray-500 font-mono">Fundo Suprimento: R$ {caixaStatus.initialAmount.toFixed(2)}</span>
            <span className="text-xs text-white font-mono font-bold">Total em Caixa: R$ {caixaStatus.currentAmount.toFixed(2)}</span>
          </div>
          <button 
            onClick={fecharCaixa}
            className="px-3 py-1.5 rounded border border-red-900 bg-red-950/10 text-red-500 hover:bg-red-600 hover:text-white transition-all font-bold font-mono"
          >
            🔒 FECHAR CAIXA
          </button>
        </div>

      </div>

      {/* TICKET RECEIPT PRINTING DIALOG MODAL IF LAST_SALE FINISHED */}
      {saleFinished && lastFinishedSale && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white text-black max-w-sm w-full rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-center font-mono font-bold text-lg tracking-wider border-b-2 border-black pb-3">
              AUTOTECH ERP SYSTEMS
            </h3>
            
            <div className="my-4 font-mono text-xs flex flex-col gap-1 text-left">
              <span>Rua das Flores, 1040 - São Paulo, SP</span>
              <span>CNPJ: 12.345.678/0001-90</span>
              <span className="border-b border-dashed border-black my-2"></span>
              <span>CUPOM FISCAL DE VENDA: #{lastFinishedSale.id}</span>
              <span>Data: {new Date().toLocaleString()}</span>
              <span className="border-b border-dashed border-black my-2"></span>
              
              <div className="flex flex-col gap-1 bg-neutral-100 p-2 rounded">
                <span className="font-bold block text-[10px] uppercase text-neutral-600">ITENS COMPRADOS:</span>
                {lastFinishedSale.items.map((it: any, index: number) => (
                  <div key={index} className="flex justify-between text-[11px]">
                    <span>{it.quantity}x {it.name.substring(0, 20)}...</span>
                    <span>R$ {it.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <span className="border-b border-dashed border-black my-2"></span>
              
              {lastFinishedSale.discount > 0 && (
                <div className="flex justify-between">
                  <span>Desconto Aplicado:</span>
                  <span>- R$ {lastFinishedSale.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL PAGO:</span>
                <span>R$ {lastFinishedSale.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                <span>Forma de Pagamento:</span>
                <span>{lastFinishedSale.paymentMethod}</span>
              </div>
            </div>

            <div className="text-center text-[10px] font-mono border-t border-black pt-3">
              <span>Obrigado pela preferência!</span>
              <span className="block italic text-[9px] mt-1 text-neutral-500">Desenvolvido por AutoTech ERP</span>
            </div>

            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 rounded bg-neutral-800 text-white text-xs font-semibold hover:bg-neutral-900 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Imprimir
              </button>
              <button 
                onClick={() => {
                  setSaleFinished(false);
                  setLastFinishedSale(null);
                }}
                className="flex-1 py-2 rounded border border-neutral-300 hover:bg-neutral-100 text-xs text-neutral-800 font-semibold"
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
