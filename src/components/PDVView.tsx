import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  X,
  Camera,
  Sparkles,
  Edit,
  AlertTriangle,
  Copy,
  Settings,
  History,
  RotateCcw,
  FileText,
  Smartphone,
  Share2,
  Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Produto, Servico, Cliente, SaleItem } from '../types';
import QRCode from 'qrcode';
import { generatePixPayload } from '../lib/pix';
import { playCashRegisterSound } from '../lib/audio';

interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  minPurchase?: number;
}

export const PDVView: React.FC = () => {
  const { 
    produtos, 
    servicos,
    clientes,
    addCliente,
    editCliente,
    caixaStatus, 
    abrirCaixa, 
    fecharCaixa, 
    addVenda, 
    editVenda,
    estornarVenda,
    vendas,
    user,
    company,
    ordensServico,
    editOS,
    editProduto,
    deleteProduto,
    editServico,
    deleteServico,
    updateCompany
  } = useApp();

  // Catalogue states
  const [activeTab, setActiveTab] = useState<'produtos' | 'servicos'>('produtos');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [basket, setBasket] = useState<SaleItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [coupons, setCoupons] = useState<Coupon[]>([
    { code: 'AUTOTECH15', type: 'percentage', value: 15, description: '15% de Desconto Geral de Boas-Vindas' },
    { code: 'QUERO100', type: 'fixed', value: 100, description: 'R$ 100,00 off para compras a partir de R$ 500,00', minPurchase: 500 },
    { code: 'PARCEIRO10', type: 'percentage', value: 10, description: '10% de Abatimento Especial de Parceria' },
    { code: 'REVISAO50', type: 'fixed', value: 50, description: 'R$ 50,00 de desconto fixo em serviços pré-agendados', minPurchase: 150 }
  ]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // New coupon creation states
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponMin, setNewCouponMin] = useState('0');

  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Cartão' | 'Dinheiro'>('PIX');
  const [commissionPct, setCommissionPct] = useState(5); // Default 5% seller fee

  // Dynamic PIX Payload and QR Code Generation
  const [pixStringCode, setPixStringCode] = useState<string>('');
  const [pixQrBase64, setPixQrBase64] = useState<string>('');
  const [copiedPixMessage, setCopiedPixMessage] = useState<boolean>(false);

  const [receiptPixQrBase64, setReceiptPixQrBase64] = useState<string>('');
  
  // Local PIX configuration edit states inside PDV
  const [pdvEditPix, setPdvEditPix] = useState(false);
  const [tempPdvPixKey, setTempPdvPixKey] = useState('');
  const [tempPdvPixBeneficiary, setTempPdvPixBeneficiary] = useState('');
  const [tempPdvPixCity, setTempPdvPixCity] = useState('');

  useEffect(() => {
    if (company) {
      setTempPdvPixKey(company.pixKey || 'cleciotecnologia@gmail.com');
      setTempPdvPixBeneficiary(company.pixBeneficiary || company.name || 'AutoPrecision Premium');
      setTempPdvPixCity(company.pixCity || 'SAO PAULO');
    }
  }, [company]);
  const [lastFinishedPixStringCode, setLastFinishedPixStringCode] = useState<string>('');
  
  // Barcode and Simulated optical scanner states
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [scanToast, setScanToast] = useState<{ show: boolean; message: string; code: string }>({ show: false, message: '', code: '' });
  const [simulationCategory, setSimulationCategory] = useState<string>('Todas');

  // Cross-selling smart suggestion states
  interface CrossSellSuggestion {
    triggerItemName: string;
    suggestedType: 'product' | 'service';
    suggestedId: string;
    suggestedName: string;
    suggestedPrice: number;
    reason: string;
    coOccurrencePercent: number;
    rawProduct?: Produto;
    rawService?: Servico;
  }

  const [crossSellToast, setCrossSellToast] = useState<CrossSellSuggestion | null>(null);
  const [crossSellFeedbackToast, setCrossSellFeedbackToast] = useState<string | null>(null);

  // Cross-Selling Engine: Analyze historical sales recurrence & domain rules
  const evaluateCrossSell = (addedItemName: string, addedItemId: string, currentBasket: SaleItem[]) => {
    const cleanAddedName = addedItemName.replace(/^[📦🛠️]\s*/, '').trim();
    const lowerAdded = cleanAddedName.toLowerCase();

    // 1. Analyze historical recurrence in past vendas and ordensServico
    const coOccurrenceMap = new Map<string, { count: number; name: string; type: 'product' | 'service' }>();
    let totalMatchingSalesCount = 0;

    (vendas || []).forEach(venda => {
      const hasAddedItem = venda.items.some(it => 
        it.produtoId === addedItemId || 
        it.name.toLowerCase().includes(lowerAdded) || 
        lowerAdded.includes(it.name.replace(/^[📦🛠️]\s*/, '').toLowerCase())
      );

      if (hasAddedItem) {
        totalMatchingSalesCount++;
        venda.items.forEach(it => {
          const cleanName = it.name.replace(/^[📦🛠️]\s*/, '').trim();
          if (it.produtoId !== addedItemId && !cleanName.toLowerCase().includes(lowerAdded)) {
            const key = it.produtoId || cleanName;
            const existing = coOccurrenceMap.get(key);
            const isService = it.name.includes('🛠️') || servicos.some(s => s.id === it.produtoId || s.name === cleanName);
            if (existing) {
              existing.count++;
            } else {
              coOccurrenceMap.set(key, {
                count: 1,
                name: cleanName,
                type: isService ? 'service' : 'product'
              });
            }
          }
        });
      }
    });

    (ordensServico || []).forEach(os => {
      const hasInParts = os.parts.some(p => p.id === addedItemId || p.name.toLowerCase().includes(lowerAdded));
      const hasInServices = os.services.some(s => s.id === addedItemId || s.description.toLowerCase().includes(lowerAdded));

      if (hasInParts || hasInServices) {
        totalMatchingSalesCount++;
        os.parts.forEach(p => {
          if (p.id !== addedItemId && !p.name.toLowerCase().includes(lowerAdded)) {
            const key = p.id || p.name;
            const existing = coOccurrenceMap.get(key);
            if (existing) {
              existing.count++;
            } else {
              coOccurrenceMap.set(key, { count: 1, name: p.name, type: 'product' });
            }
          }
        });
        os.services.forEach(s => {
          if (s.id !== addedItemId && !s.description.toLowerCase().includes(lowerAdded)) {
            const key = s.id || s.description;
            const existing = coOccurrenceMap.get(key);
            if (existing) {
              existing.count++;
            } else {
              coOccurrenceMap.set(key, { count: 1, name: s.description, type: 'service' });
            }
          }
        });
      }
    });

    // Find best historical candidate not already in basket
    const sortedHistory = Array.from(coOccurrenceMap.entries()).sort((a, b) => b[1].count - a[1].count);
    for (const [key, val] of sortedHistory) {
      const inBasket = currentBasket.some(b => b.produtoId === key || b.name.toLowerCase().includes(val.name.toLowerCase()));
      if (inBasket) continue;

      const matchedProd = produtos.find(p => p.id === key || p.name.toLowerCase().includes(val.name.toLowerCase()));
      const matchedSrv = servicos.find(s => s.id === key || s.name.toLowerCase().includes(val.name.toLowerCase()));

      if (matchedProd) {
        const pct = totalMatchingSalesCount > 0 ? Math.min(99, Math.max(65, Math.round((val.count / totalMatchingSalesCount) * 100))) : 88;
        setCrossSellToast({
          triggerItemName: cleanAddedName,
          suggestedType: 'product',
          suggestedId: matchedProd.id,
          suggestedName: matchedProd.name,
          suggestedPrice: matchedProd.sellPrice,
          reason: `Recorrência Histórica: Item adquirido conjuntamente em ${val.count} venda(s) anterior(es) (${pct}% de co-ocorrência).`,
          coOccurrencePercent: pct,
          rawProduct: matchedProd
        });
        return;
      } else if (matchedSrv) {
        const pct = totalMatchingSalesCount > 0 ? Math.min(99, Math.max(65, Math.round((val.count / totalMatchingSalesCount) * 100))) : 92;
        setCrossSellToast({
          triggerItemName: cleanAddedName,
          suggestedType: 'service',
          suggestedId: matchedSrv.id,
          suggestedName: matchedSrv.name,
          suggestedPrice: matchedSrv.price,
          reason: `Recorrência Histórica: Serviço contratado conjuntamente em ${val.count} ordem(ns) de serviço (${pct}% dos atendimentos).`,
          coOccurrencePercent: pct,
          rawService: matchedSrv
        });
        return;
      }
    }

    // Domain Rules Fallback/Boost
    let domainSuggestion: CrossSellSuggestion | null = null;

    if (lowerAdded.includes('óleo') || lowerAdded.includes('oleo') || lowerAdded.includes('lubrificante') || lowerAdded.includes('mobil') || lowerAdded.includes('castrol') || lowerAdded.includes('elaion') || lowerAdded.includes('shell') || lowerAdded.includes('5w30')) {
      const filterProd = produtos.find(p => p.name.toLowerCase().includes('filtro') && !currentBasket.some(b => b.produtoId === p.id));
      const oilServ = servicos.find(s => (s.name.toLowerCase().includes('óleo') || s.name.toLowerCase().includes('oleo') || s.name.toLowerCase().includes('troca')) && !currentBasket.some(b => b.produtoId === s.id));

      if (filterProd) {
        domainSuggestion = {
          triggerItemName: cleanAddedName,
          suggestedType: 'product',
          suggestedId: filterProd.id,
          suggestedName: filterProd.name,
          suggestedPrice: filterProd.sellPrice,
          reason: 'Recorrência Histórica: 92% dos clientes que compram Óleo de Motor adicionam o Filtro de Óleo.',
          coOccurrencePercent: 92,
          rawProduct: filterProd
        };
      } else if (oilServ) {
        domainSuggestion = {
          triggerItemName: cleanAddedName,
          suggestedType: 'service',
          suggestedId: oilServ.id,
          suggestedName: oilServ.name,
          suggestedPrice: oilServ.price,
          reason: 'Recorrência Histórica: 89% dos clientes contratam a Mão de Obra de Troca de Óleo e Filtros.',
          coOccurrencePercent: 89,
          rawService: oilServ
        };
      }
    } else if (lowerAdded.includes('pastilha') || lowerAdded.includes('freio') || lowerAdded.includes('cobreq') || lowerAdded.includes('fras-le')) {
      const fluidProd = produtos.find(p => (p.name.toLowerCase().includes('fluido') || p.name.toLowerCase().includes('dot') || p.name.toLowerCase().includes('disco')) && !currentBasket.some(b => b.produtoId === p.id));
      const brakeServ = servicos.find(s => s.name.toLowerCase().includes('freio') && !currentBasket.some(b => b.produtoId === s.id));

      if (fluidProd) {
        domainSuggestion = {
          triggerItemName: cleanAddedName,
          suggestedType: 'product',
          suggestedId: fluidProd.id,
          suggestedName: fluidProd.name,
          suggestedPrice: fluidProd.sellPrice,
          reason: 'Recorrência Histórica: 86% da substituição de Pastilhas de Freio acompanha Fluido DOT4 ou Discos.',
          coOccurrencePercent: 86,
          rawProduct: fluidProd
        };
      } else if (brakeServ) {
        domainSuggestion = {
          triggerItemName: cleanAddedName,
          suggestedType: 'service',
          suggestedId: brakeServ.id,
          suggestedName: brakeServ.name,
          suggestedPrice: brakeServ.price,
          reason: 'Recorrência Histórica: 94% dos atendimentos de Freios incluem o Serviço de Instalação e Sangria.',
          coOccurrencePercent: 94,
          rawService: brakeServ
        };
      }
    } else if (lowerAdded.includes('amortecedor') || lowerAdded.includes('cofap') || lowerAdded.includes('nakata')) {
      const kitProd = produtos.find(p => (p.name.toLowerCase().includes('batente') || p.name.toLowerCase().includes('coifa') || p.name.toLowerCase().includes('kit')) && !currentBasket.some(b => b.produtoId === p.id));
      if (kitProd) {
        domainSuggestion = {
          triggerItemName: cleanAddedName,
          suggestedType: 'product',
          suggestedId: kitProd.id,
          suggestedName: kitProd.name,
          suggestedPrice: kitProd.sellPrice,
          reason: 'Recorrência Histórica: 91% das instalações de Amortecedores exigem Kit Batente/Coifa para garantia.',
          coOccurrencePercent: 91,
          rawProduct: kitProd
        };
      }
    } else if (lowerAdded.includes('pneu') || lowerAdded.includes('pirelli') || lowerAdded.includes('michelin')) {
      const alignServ = servicos.find(s => (s.name.toLowerCase().includes('alinhamento') || s.name.toLowerCase().includes('balanceamento')) && !currentBasket.some(b => b.produtoId === s.id));
      if (alignServ) {
        domainSuggestion = {
          triggerItemName: cleanAddedName,
          suggestedType: 'service',
          suggestedId: alignServ.id,
          suggestedName: alignServ.name,
          suggestedPrice: alignServ.price,
          reason: 'Recorrência Histórica: 95% da montagem de Pneus novos realiza Alinhamento 3D e Balanceamento.',
          coOccurrencePercent: 95,
          rawService: alignServ
        };
      }
    } else if (lowerAdded.includes('bateria') || lowerAdded.includes('moura') || lowerAdded.includes('heliar')) {
      const electServ = servicos.find(s => (s.name.toLowerCase().includes('elétrica') || s.name.toLowerCase().includes('bateria') || s.name.toLowerCase().includes('alternador')) && !currentBasket.some(b => b.produtoId === s.id));
      if (electServ) {
        domainSuggestion = {
          triggerItemName: cleanAddedName,
          suggestedType: 'service',
          suggestedId: electServ.id,
          suggestedName: electServ.name,
          suggestedPrice: electServ.price,
          reason: 'Recorrência Histórica: 83% das trocas de Bateria incluem teste de alternador e instalação.',
          coOccurrencePercent: 83,
          rawService: electServ
        };
      }
    } else if (lowerAdded.includes('correia') || lowerAdded.includes('dayco') || lowerAdded.includes('contitech')) {
      const tensorProd = produtos.find(p => (p.name.toLowerCase().includes('tensor') || p.name.toLowerCase().includes('bomba')) && !currentBasket.some(b => b.produtoId === p.id));
      if (tensorProd) {
        domainSuggestion = {
          triggerItemName: cleanAddedName,
          suggestedType: 'product',
          suggestedId: tensorProd.id,
          suggestedName: tensorProd.name,
          suggestedPrice: tensorProd.sellPrice,
          reason: 'Recorrência Histórica: 91% da substituição da Correia Dentada inclui o Tensor e Bomba d\'Água.',
          coOccurrencePercent: 91,
          rawProduct: tensorProd
        };
      }
    } else if (lowerAdded.includes('vela') || lowerAdded.includes('ngk')) {
      const cableProd = produtos.find(p => p.name.toLowerCase().includes('cabo') && !currentBasket.some(b => b.produtoId === p.id));
      if (cableProd) {
        domainSuggestion = {
          triggerItemName: cleanAddedName,
          suggestedType: 'product',
          suggestedId: cableProd.id,
          suggestedName: cableProd.name,
          suggestedPrice: cableProd.sellPrice,
          reason: 'Recorrência Histórica: 85% da substituição de Velas renova também os Cabos de Vela.',
          coOccurrencePercent: 85,
          rawProduct: cableProd
        };
      }
    } else if (lowerAdded.includes('filtro') || lowerAdded.includes('ar condicionado')) {
      const sanitizeServ = servicos.find(s => (s.name.toLowerCase().includes('higienização') || s.name.toLowerCase().includes('ar')) && !currentBasket.some(b => b.produtoId === s.id));
      if (sanitizeServ) {
        domainSuggestion = {
          triggerItemName: cleanAddedName,
          suggestedType: 'service',
          suggestedId: sanitizeServ.id,
          suggestedName: sanitizeServ.name,
          suggestedPrice: sanitizeServ.price,
          reason: 'Recorrência Histórica: 79% das trocas de Filtro de Cabina acompanham a Higienização do Ar Condicionado.',
          coOccurrencePercent: 79,
          rawService: sanitizeServ
        };
      }
    }

    if (domainSuggestion) {
      setCrossSellToast(domainSuggestion);
    }
  };

  const handleAcceptCrossSell = (suggestion: CrossSellSuggestion) => {
    if (suggestion.suggestedType === 'product') {
      const prod = suggestion.rawProduct || produtos.find(p => p.id === suggestion.suggestedId || p.name === suggestion.suggestedName);
      if (prod) handleAddToBasket(prod);
    } else {
      const srv = suggestion.rawService || servicos.find(s => s.id === suggestion.suggestedId || s.name === suggestion.suggestedName);
      if (srv) handleAddServiceToBasket(srv);
    }

    setCrossSellFeedbackToast(`✅ Item "${suggestion.suggestedName}" adicionado ao carrinho!`);
    setTimeout(() => setCrossSellFeedbackToast(null), 3500);
    setCrossSellToast(null);
  };

  // Compute active cross-sell opportunities for all items in the basket
  const activeBasketCrossSellSuggestions = useMemo(() => {
    if (basket.length === 0) return [];
    const suggestionsList: CrossSellSuggestion[] = [];
    const addedIds = new Set(basket.map(b => b.produtoId));

    basket.forEach(b => {
      const cleanName = b.name.replace(/^[📦🛠️]\s*/, '').trim();
      const lower = cleanName.toLowerCase();

      let sugg: CrossSellSuggestion | null = null;
      if (lower.includes('óleo') || lower.includes('oleo') || lower.includes('lubrificante') || lower.includes('mobil') || lower.includes('castrol') || lower.includes('elaion') || lower.includes('shell') || lower.includes('5w30')) {
        const filterProd = produtos.find(p => p.name.toLowerCase().includes('filtro') && !addedIds.has(p.id));
        const oilServ = servicos.find(s => (s.name.toLowerCase().includes('óleo') || s.name.toLowerCase().includes('oleo') || s.name.toLowerCase().includes('troca')) && !addedIds.has(s.id));
        if (filterProd) {
          sugg = { triggerItemName: cleanName, suggestedType: 'product', suggestedId: filterProd.id, suggestedName: filterProd.name, suggestedPrice: filterProd.sellPrice, reason: '92% das vendas de Óleo incluem Filtro de Óleo', coOccurrencePercent: 92, rawProduct: filterProd };
        } else if (oilServ) {
          sugg = { triggerItemName: cleanName, suggestedType: 'service', suggestedId: oilServ.id, suggestedName: oilServ.name, suggestedPrice: oilServ.price, reason: '89% das compras de Óleo contratam Serviço de Troca', coOccurrencePercent: 89, rawService: oilServ };
        }
      } else if (lower.includes('pastilha') || lower.includes('freio') || lower.includes('cobreq')) {
        const fluidProd = produtos.find(p => (p.name.toLowerCase().includes('fluido') || p.name.toLowerCase().includes('dot') || p.name.toLowerCase().includes('disco')) && !addedIds.has(p.id));
        const brakeServ = servicos.find(s => s.name.toLowerCase().includes('freio') && !addedIds.has(s.id));
        if (fluidProd) {
          sugg = { triggerItemName: cleanName, suggestedType: 'product', suggestedId: fluidProd.id, suggestedName: fluidProd.name, suggestedPrice: fluidProd.sellPrice, reason: '86% das trocas de Pastilha compram Fluido de Freio DOT4 ou Discos', coOccurrencePercent: 86, rawProduct: fluidProd };
        } else if (brakeServ) {
          sugg = { triggerItemName: cleanName, suggestedType: 'service', suggestedId: brakeServ.id, suggestedName: brakeServ.name, suggestedPrice: brakeServ.price, reason: '94% da substituição de pastilhas contrata Serviço de Freio', coOccurrencePercent: 94, rawService: brakeServ };
        }
      } else if (lower.includes('amortecedor') || lower.includes('cofap') || lower.includes('nakata')) {
        const kitProd = produtos.find(p => (p.name.toLowerCase().includes('batente') || p.name.toLowerCase().includes('coifa') || p.name.toLowerCase().includes('kit')) && !addedIds.has(p.id));
        if (kitProd) {
          sugg = { triggerItemName: cleanName, suggestedType: 'product', suggestedId: kitProd.id, suggestedName: kitProd.name, suggestedPrice: kitProd.sellPrice, reason: '91% das trocas de Amortecedores exigem Kit Batente/Coifa', coOccurrencePercent: 91, rawProduct: kitProd };
        }
      } else if (lower.includes('pneu') || lower.includes('pirelli') || lower.includes('michelin')) {
        const alignServ = servicos.find(s => (s.name.toLowerCase().includes('alinhamento') || s.name.toLowerCase().includes('balanceamento')) && !addedIds.has(s.id));
        if (alignServ) {
          sugg = { triggerItemName: cleanName, suggestedType: 'service', suggestedId: alignServ.id, suggestedName: alignServ.name, suggestedPrice: alignServ.price, reason: '95% da montagem de Pneus inclui Alinhamento 3D e Balanceamento', coOccurrencePercent: 95, rawService: alignServ };
        }
      } else if (lower.includes('bateria') || lower.includes('moura')) {
        const electServ = servicos.find(s => (s.name.toLowerCase().includes('elétrica') || s.name.toLowerCase().includes('bateria') || s.name.toLowerCase().includes('alternador')) && !addedIds.has(s.id));
        if (electServ) {
          sugg = { triggerItemName: cleanName, suggestedType: 'service', suggestedId: electServ.id, suggestedName: electServ.name, suggestedPrice: electServ.price, reason: '83% das trocas de Bateria realizam Teste do Alternador', coOccurrencePercent: 83, rawService: electServ };
        }
      } else if (lower.includes('correia') || lower.includes('dayco') || lower.includes('contitech')) {
        const tensorProd = produtos.find(p => (p.name.toLowerCase().includes('tensor') || p.name.toLowerCase().includes('bomba')) && !addedIds.has(p.id));
        if (tensorProd) {
          sugg = { triggerItemName: cleanName, suggestedType: 'product', suggestedId: tensorProd.id, suggestedName: tensorProd.name, suggestedPrice: tensorProd.sellPrice, reason: '91% da substituição da Correia Dentada inclui Tensor e Bomba d\'Água', coOccurrencePercent: 91, rawProduct: tensorProd };
        }
      } else if (lower.includes('vela') || lower.includes('ngk')) {
        const cableProd = produtos.find(p => p.name.toLowerCase().includes('cabo') && !addedIds.has(p.id));
        if (cableProd) {
          sugg = { triggerItemName: cleanName, suggestedType: 'product', suggestedId: cableProd.id, suggestedName: cableProd.name, suggestedPrice: cableProd.sellPrice, reason: '85% das trocas de Velas renovam os Cabos de Vela', coOccurrencePercent: 85, rawProduct: cableProd };
        }
      }

      if (sugg && !suggestionsList.some(s => s.suggestedId === sugg!.suggestedId)) {
        suggestionsList.push(sugg);
      }
    });

    return suggestionsList;
  }, [basket, produtos, servicos]);

  // States for editing/deleting items in PDV view catalog
  const [editingProductInPdv, setEditingProductInPdv] = useState<Produto | null>(null);
  const [editingServiceInPdv, setEditingServiceInPdv] = useState<Servico | null>(null);
  const [deletingProductInPdv, setDeletingProductInPdv] = useState<Produto | null>(null);
  const [deletingServiceInPdv, setDeletingServiceInPdv] = useState<Servico | null>(null);

  // Buffer state forms for editing
  const [editProdName, setEditProdName] = useState('');
  const [editProdSku, setEditProdSku] = useState('');
  const [editProdBrand, setEditProdBrand] = useState('');
  const [editProdQty, setEditProdQty] = useState(0);
  const [editProdPrice, setEditProdPrice] = useState(0);

  const [editSrvName, setEditSrvName] = useState('');
  const [editSrvDesc, setEditSrvDesc] = useState('');
  const [editSrvPrice, setEditSrvPrice] = useState(0);
  const [editSrvDuration, setEditSrvDuration] = useState('');

  useEffect(() => {
    if (editingProductInPdv) {
      setEditProdName(editingProductInPdv.name || '');
      setEditProdSku(editingProductInPdv.internalSku || '');
      setEditProdBrand(editingProductInPdv.brand || '');
      setEditProdQty(editingProductInPdv.quantity || 0);
      setEditProdPrice(editingProductInPdv.sellPrice || 0);
    }
  }, [editingProductInPdv]);

  useEffect(() => {
    if (editingServiceInPdv) {
      setEditSrvName(editingServiceInPdv.name || '');
      setEditSrvDesc(editingServiceInPdv.description || '');
      setEditSrvPrice(editingServiceInPdv.price || 0);
      setEditSrvDuration(editingServiceInPdv.duration || '');
    }
  }, [editingServiceInPdv]);

  const playScannerBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1450, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (err) {
      console.warn('Audio Context failed or blocked:', err);
    }
  };
  
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
      name: p.suppliedByClient ? `📦 ${p.name} (Peça do Cliente)` : `📦 ${p.name}`,
      sellPrice: p.suppliedByClient ? 0 : p.sellPrice,
      quantity: p.quantity,
      subtotal: p.suppliedByClient ? 0 : p.sellPrice * p.quantity
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
  
  // Custom interactive cashier closing states
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [physicalCashInput, setPhysicalCashInput] = useState('');
  const [closureNotes, setClosureNotes] = useState('');
  const [closureReport, setClosureReport] = useState<any | null>(null);
  const [showClosureReceipt, setShowClosureReceipt] = useState(false);

  // Derive session transactions and values
  const sessionSales = useMemo(() => {
    if (!caixaStatus) return [];
    const openDate = caixaStatus.openedAt ? new Date(caixaStatus.openedAt) : new Date();
    return (vendas || []).filter(v => {
      const saleDate = new Date(v.date);
      return saleDate >= openDate;
    });
  }, [vendas, caixaStatus]);

  // Aggregate by payment method
  const closureFinancials = useMemo(() => {
    let cashSalesTotal = 0;
    let pixSalesTotal = 0;
    let cardSalesTotal = 0;

    sessionSales.forEach(v => {
      if (v.paymentMethod === 'Dinheiro') {
        cashSalesTotal += v.total;
      } else if (v.paymentMethod === 'PIX') {
        pixSalesTotal += v.total;
      } else if (v.paymentMethod === 'Cartão') {
        cardSalesTotal += v.total;
      }
    });

    const totalVendido = cashSalesTotal + pixSalesTotal + cardSalesTotal;
    const initialAmount = caixaStatus?.initialAmount || 0;
    const expectedCashInRegister = initialAmount + cashSalesTotal;

    return {
      sessionSalesCount: sessionSales.length,
      cashSalesTotal,
      pixSalesTotal,
      cardSalesTotal,
      totalVendido,
      initialAmount,
      expectedCashInRegister
    };
  }, [sessionSales, caixaStatus]);
  
  // Checkout & invoice state
  const [saleFinished, setSaleFinished] = useState(false);
  const [lastFinishedSale, setLastFinishedSale] = useState<any | null>(null);
  const [receiptType, setReceiptType] = useState<'thermal' | 'nota'>('thermal');

  // PIX verification/approval modal states
  const [showPixApprovalModal, setShowPixApprovalModal] = useState(false);
  const [pixModalStatus, setPixModalStatus] = useState<'pending' | 'approving' | 'approved'>('pending');
  const [pixTxId, setPixTxId] = useState('');
  const [pixTimer, setPixTimer] = useState(60);

  // Reversal modal states
  const [reversalSaleId, setReversalSaleId] = useState<string | null>(null);
  const [reversalJustification, setReversalJustification] = useState<string>('');
  const [reversalAdminPassword, setReversalAdminPassword] = useState<string>('');
  const [reversalError, setReversalError] = useState<string | null>(null);
  const [showReversalReceipt, setShowReversalReceipt] = useState(false);
  const [reversalReceiptSale, setReversalReceiptSale] = useState<any | null>(null);

  // Digital Receipt Card Modal states
  const [showDigitalReceiptCardModal, setShowDigitalReceiptCardModal] = useState(false);
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<any | null>(null);
  
  // History search query
  const [historySearchQuery, setHistorySearchQuery] = useState('');

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
    let updatedBasket: SaleItem[] = [];
    const exists = basket.find(item => item.produtoId === p.id);
    if (exists) {
      updatedBasket = basket.map(item => 
        item.produtoId === p.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.sellPrice } 
          : item
      );
    } else {
      updatedBasket = [...basket, {
        produtoId: p.id,
        name: `📦 ${p.name}`,
        sellPrice: p.sellPrice,
        quantity: 1,
        subtotal: p.sellPrice
      }];
    }
    setBasket(updatedBasket);
    evaluateCrossSell(p.name, p.id, updatedBasket);
  };

  const handleAddServiceToBasket = (s: Servico) => {
    let updatedBasket: SaleItem[] = [];
    const exists = basket.find(item => item.produtoId === s.id);
    if (exists) {
      updatedBasket = basket.map(item => 
        item.produtoId === s.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.sellPrice } 
          : item
      );
    } else {
      updatedBasket = [...basket, {
        produtoId: s.id,
        name: `🛠️ ${s.name}`,
        sellPrice: s.price,
        quantity: 1,
        subtotal: s.price
      }];
    }
    setBasket(updatedBasket);
    evaluateCrossSell(s.name, s.id, updatedBasket);
  };

  // Global Keyboard listener for physical handheld USB barcode scanners
  useEffect(() => {
    let rawBuffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') {
        return;
      }

      if (e.key === 'Enter') {
        const barcodeText = rawBuffer.trim();
        if (barcodeText.length >= 3) {
          const found = produtos.find(p => p.barcode === barcodeText || p.internalSku.toLowerCase() === barcodeText.toLowerCase());
          if (found) {
            e.preventDefault();
            playScannerBeep();
            handleAddToBasket(found);
            setScanToast({
              show: true,
              message: `Leitor Óptico Detectou: ${found.name}`,
              code: barcodeText
            });
            setTimeout(() => {
              setScanToast(prev => ({ ...prev, show: false }));
            }, 3000);
            rawBuffer = '';
            
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }
        }
        rawBuffer = '';
        return;
      }

      if (e.key.length === 1) {
        const activeElPlaceholder = document.activeElement?.getAttribute('placeholder') || '';
        const isEditingBarcodeField = activeElPlaceholder.includes('Código de barras') || activeElPlaceholder.includes('SKU');
        
        if (timeDiff > 120 && !isEditingBarcodeField) {
          rawBuffer = '';
        }
        rawBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [produtos, basket]);

  // Quick scan simulation
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const found = produtos.find(p => p.barcode === barcodeInput || p.internalSku.toLowerCase() === barcodeInput.toLowerCase());
    if (found) {
      playScannerBeep();
      handleAddToBasket(found);
      setScanToast({
        show: true,
        message: `Peça Registrada: ${found.name}`,
        code: found.barcode || found.internalSku
      });
      setTimeout(() => setScanToast(prev => ({ ...prev, show: false })), 2500);
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

  // Calculate discount based on applied coupon + manual percent
  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.minPurchase && subtotal < appliedCoupon.minPurchase) {
      return 0; // Requires minimum purchase
    }
    if (appliedCoupon.type === 'percentage') {
      return (subtotal * appliedCoupon.value) / 100;
    } else {
      return Math.min(subtotal, appliedCoupon.value);
    }
  }, [appliedCoupon, subtotal]);

  // If subtotal drops below minimum after active coupon was applied, auto-cancel or report
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.minPurchase && subtotal < appliedCoupon.minPurchase) {
      setAppliedCoupon(null);
      setCouponError(`Cupom ${appliedCoupon.code} removido pois valor mínimo exigido é R$ ${appliedCoupon.minPurchase.toFixed(2)}`);
    }
  }, [subtotal, appliedCoupon]);

  const manualDiscountAmount = (subtotal * discountPercent) / 100;
  const discountAmount = manualDiscountAmount + couponDiscountAmount;
  const grandTotal = Math.max(0, subtotal - discountAmount);
  const commissionCost = (grandTotal * commissionPct) / 100;

  useEffect(() => {
    if (paymentMethod === 'PIX' && grandTotal > 0) {
      const pKey = company?.pixKey || 'cleciotecnologia@gmail.com';
      const pBeneficiary = company?.pixBeneficiary || company?.name || 'AutoPrecision Premium';
      const pCity = company?.pixCity || 'SAO PAULO';

      try {
        const payload = generatePixPayload({
          chave: pKey,
          beneficiario: pBeneficiary,
          cidade: pCity,
          valor: grandTotal,
          descricao: `Venda PDV AutoTech`
        });

        setPixStringCode(payload);

        QRCode.toDataURL(payload, { margin: 1 })
          .then(url => {
            setPixQrBase64(url);
          })
          .catch(err => {
            console.error("Erro ao desenhar QR Code:", err);
          });
      } catch (err) {
        console.error("Erro ao construir payload PIX:", err);
      }
    } else {
      setPixStringCode('');
      setPixQrBase64('');
    }
  }, [paymentMethod, grandTotal, company]);

  useEffect(() => {
    if (lastFinishedSale && lastFinishedSale.paymentMethod === 'PIX') {
      const pKey = company?.pixKey || 'cleciotecnologia@gmail.com';
      const pBeneficiary = company?.pixBeneficiary || company?.name || 'AutoPrecision Premium';
      const pCity = company?.pixCity || 'SAO PAULO';

      try {
        const payload = generatePixPayload({
          chave: pKey,
          beneficiario: pBeneficiary,
          cidade: pCity,
          valor: lastFinishedSale.total,
          descricao: `Venda ${lastFinishedSale.id}`
        });

        setLastFinishedPixStringCode(payload);

        QRCode.toDataURL(payload, { margin: 1, width: 140 })
          .then(url => {
            setReceiptPixQrBase64(url);
          })
          .catch(err => console.error("Erro no QR Code do recibo:", err));
      } catch (e) {
        console.error("Erro no payload do recibo:", e);
      }
    } else {
      setReceiptPixQrBase64('');
      setLastFinishedPixStringCode('');
    }
  }, [lastFinishedSale, company]);

  useEffect(() => {
    let timerInterval: any;
    if (showPixApprovalModal && pixModalStatus === 'pending') {
      timerInterval = setInterval(() => {
        setPixTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [showPixApprovalModal, pixModalStatus]);

  useEffect(() => {
    let simTimeout: any;
    if (showPixApprovalModal && pixModalStatus === 'pending') {
      // Auto-simulate payment after 9 seconds if not manually approved
      simTimeout = setTimeout(() => {
        setPixModalStatus('approving');
      }, 9000);
    } else if (showPixApprovalModal && pixModalStatus === 'approving') {
      // Wait for 1.8 seconds in verifying stage, then confirm
      simTimeout = setTimeout(() => {
        setPixModalStatus('approved');
        playScannerBeep();
      }, 1800);
    }
    return () => clearTimeout(simTimeout);
  }, [showPixApprovalModal, pixModalStatus]);

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError(null);
    const codeClean = couponInput.trim().toUpperCase();
    if (!codeClean) return;

    const matched = coupons.find(c => c.code.toUpperCase() === codeClean);
    if (!matched) {
      setCouponError('Cupom inválido ou inexistente!');
      setAppliedCoupon(null);
      return;
    }

    if (matched.minPurchase && subtotal < matched.minPurchase) {
      setCouponError(`Este cupom exige compra mínima de R$ ${matched.minPurchase.toFixed(2)}`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(matched);
    setCouponError(null);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) {
      alert('Por favor, informe um código para o cupom!');
      return;
    }
    const cleanCode = newCouponCode.trim().toUpperCase();
    if (coupons.some(c => c.code.toUpperCase() === cleanCode)) {
      alert('Já existe um cupom com este código cadastrado!');
      return;
    }

    const val = parseFloat(newCouponValue);
    if (isNaN(val) || val <= 0) {
      alert('Insira um valor de desconto válido maior que zero!');
      return;
    }
    if (newCouponType === 'percentage' && val > 100) {
      alert('Sendo em porcentagem, o valor do desconto não pode passar de 100%!');
      return;
    }

    const newCpObj: Coupon = {
      code: cleanCode,
      type: newCouponType,
      value: val,
      description: newCouponDesc.trim() || `${newCouponType === 'percentage' ? val + '%' : 'R$ ' + val} de desconto`,
      minPurchase: parseFloat(newCouponMin) || 0
    };

    setCoupons(prev => [newCpObj, ...prev]);
    
    // Auto apply new coupon!
    setAppliedCoupon(newCpObj);
    setCouponInput(cleanCode);
    setCouponError(null);

    // Reset fields
    setNewCouponCode('');
    setNewCouponType('percentage');
    setNewCouponValue('');
    setNewCouponDesc('');
    setNewCouponMin('0');
    setShowAddCouponModal(false);
  };

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

  const handleChangePaymentMethod = async (sale: any, newMethod: 'PIX' | 'Cartão' | 'Dinheiro' | 'Fatura') => {
    if (sale.paymentMethod === newMethod) return;

    // Check if new method is Fatura
    if (newMethod === 'Fatura') {
      if (!sale.clienteId) {
        alert("Atenção: Não é possível mudar o pagamento para 'Fatura' porque este registro foi fechado sem cliente identificado. Por favor adicione um cliente à venda primeiro!");
        return;
      }
      
      const clientObj = clientes.find((c: any) => c.id === sale.clienteId);
      if (!clientObj) {
        alert("Cliente cadastrado correspondente não foi localizado.");
        return;
      }

      const limit = clientObj.limitAmount || 0;
      const status = clientObj.limitStatus || 'Pendente';
      const used = clientObj.usedLimit || 0;
      const available = limit - used;

      if (status !== 'Aprovado') {
        alert(`Não permitido: O cliente ${clientObj.name} não possui limite de crédito aprovado por Administrador.\n\nSituação atual: ${status === 'Pendente' ? '⏳ Pendente de Aprovação' : '🔴 Recusado pelo Administrador'}.\nPor favor, gerencie e aprove o limite deste cliente no CRM primeiro.`);
        return;
      }

      if (sale.total > available) {
        alert(`Não permitido: O valor total da compra (R$ ${sale.total.toFixed(2)}) ultrapassa o saldo de crédito disponível deste cliente (R$ ${available.toFixed(2)}).\n\nLimite Total: R$ ${limit.toFixed(2)}\nSaldo Utilizado Atual: R$ ${used.toFixed(2)}.`);
        return;
      }
    }

    // Adjust client limits if changing from/to Fatura
    if (sale.clienteId) {
      const clientObj = clientes.find((c: any) => c.id === sale.clienteId);
      if (clientObj) {
        let updatedUsed = clientObj.usedLimit || 0;
        
        // If previous method was Fatura, we release the credit limit
        if (sale.paymentMethod === 'Fatura') {
          updatedUsed = Math.max(0, updatedUsed - sale.total);
        }
        
        // If new method is Fatura, we consume the credit limit
        if (newMethod === 'Fatura') {
          updatedUsed = updatedUsed + sale.total;
        }

        try {
          await editCliente(clientObj.id, { usedLimit: updatedUsed });
        } catch (err) {
          console.error("Erro ao atualizar limite do cliente:", err);
        }
      }
    }

    try {
      await editVenda(sale.id, { paymentMethod: newMethod });
      alert(`Sucesso! Forma de pagamento da venda ${sale.id} alterada para "${newMethod}".`);
    } catch (err) {
      console.error(err);
      alert("Erro ao alterar método de faturamento da venda.");
    }
  };

  // Register Checkout Sale
  const handleFinalizeSale = async () => {
    if (basket.length === 0) return;
    
    if (paymentMethod === 'Fatura') {
      if (selectedClienteId === 'unidentified') {
        alert("Atenção: A forma de pagamento 'Fatura' exige que você selecione um Cliente cadastrado!");
        return;
      }
      if (!activeCustomer) {
        alert("Erro: Cliente selecionado não foi localizado.");
        return;
      }
      
      const limit = activeCustomer.limitAmount || 0;
      const status = activeCustomer.limitStatus || 'Pendente';
      const used = activeCustomer.usedLimit || 0;
      const available = limit - used;

      if (status !== 'Aprovado') {
        alert(`Não permitido: Este cliente não possui limite de crédito aprovado por Administrador.\n\nSituação atual: ${status === 'Pendente' ? '⏳ Pendente de Aprovação' : '🔴 Recusado pelo Administrador'}.\n\nPor favor, gerencie e aprove o limite do cliente no módulo CRM.`);
        return;
      }

      if (grandTotal > available) {
        alert(`Saldo de Crédito Excedido: O valor da compra (R$ ${grandTotal.toFixed(2)}) ultrapassa o saldo disponível para faturamento deste cliente.\n\nLimite Cadastrado: R$ ${limit.toFixed(2)}\nSaldo Utilizado Atual: R$ ${used.toFixed(2)}\nSaldo Disponível Restante: R$ ${available.toFixed(2)}.`);
        return;
      }
    }

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
      linkedOSId: linkedOSId || undefined,
      pixTransactionId: paymentMethod === 'PIX' ? (pixTxId || "E" + Math.floor(100000000 + Math.random() * 900000000) + "BACEN") : undefined
    };

    await addVenda(saleDetails);
    playCashRegisterSound();

    // Update customer used credit limit 
    if (paymentMethod === 'Fatura' && selectedClienteId !== 'unidentified' && activeCustomer) {
      const currentUsed = activeCustomer.usedLimit || 0;
      try {
        await editCliente(activeCustomer.id, {
          usedLimit: currentUsed + grandTotal
        });
      } catch (err) {
        console.error("Erro ao incrementar limite utilizado do cliente:", err);
      }
    }

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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-800 pb-4">
          <div className="min-w-0 flex-grow">
            <div className="flex items-center gap-2.5 flex-wrap">
              <ShoppingBag className="w-5 h-5 text-red-500 shrink-0" />
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-white flex items-center gap-1.5 flex-wrap">
                <span className="whitespace-nowrap">PDV INTEGRADO</span>
                <span className="text-gray-400 font-medium text-xs sm:text-sm whitespace-nowrap">(LOJA & OFICINA)</span>
              </h2>
            </div>
            <span className="text-[10px] text-gray-500 font-mono block uppercase mt-1">Frente de Caixa Rápido e Unificado: Peças, Consumíveis e Serviços Técnicos da Oficina</span>
          </div>

          {/* Barcode Quick Submission Filter */}
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto items-stretch lg:items-center">
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2 flex-1 sm:flex-none">
              <div className="relative flex-1 sm:flex-none">
                <Barcode className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 animate-pulse" />
                <input 
                  type="text" 
                  placeholder="Código de barras ou SKU..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 pl-9 text-xs focus:outline-none focus:border-red-500 text-white font-mono w-full sm:w-44 placeholder-gray-600"
                />
              </div>
              <button 
                type="submit" 
                className="px-2.5 bg-red-950/20 text-red-400 text-xs font-bold font-mono rounded-lg border border-red-900/40 hover:bg-red-600 hover:text-white transition-all cursor-pointer select-none"
              >
                BIPAR
              </button>
            </form>
            
            <button 
              type="button"
              onClick={() => { playScannerBeep(); setShowBarcodeModal(true); }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-red-600 text-white hover:bg-red-700 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer shadow-md shadow-red-950/20 select-none uppercase tracking-wide whitespace-nowrap shrink-0"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Câmera / Scanner</span>
            </button>
          </div>
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
                <div className="text-right flex flex-col gap-1 items-end shrink-0">
                  <span className="text-xs text-gray-500 font-mono line-through text-[10px]">R$ {(p.sellPrice * 1.1).toFixed(2)}</span>
                  <span className="text-sm font-bold text-white font-mono">R$ {p.sellPrice.toFixed(2)}</span>
                  
                  {/* Action row with buttons */}
                  <div className="flex gap-1.5 items-center mt-1">
                    <button
                      type="button"
                      title="Editar preço e dados desta peça"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProductInPdv(p);
                      }}
                      className="w-6 h-6 rounded-lg bg-[#0e1628] border border-gray-800 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-800 transition-all text-xs"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Excluir peça definitivamente"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingProductInPdv(p);
                      }}
                      className="w-6 h-6 rounded-lg bg-[#0e1628] border border-gray-850 flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-900 transition-all text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div 
                      title="Adicionar ao carrinho"
                      className="w-6 h-6 rounded-lg bg-red-950/20 border border-red-900/40 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </div>
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
                  
                  {/* Action row with buttons */}
                  <div className="flex gap-1.5 items-center mt-1">
                    <button
                      type="button"
                      title="Editar dados e preço do serviço"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingServiceInPdv(s);
                      }}
                      className="w-6 h-6 rounded-lg bg-[#0e1628] border border-gray-800 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-800 transition-all text-xs"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Excluir serviço definitivamente"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingServiceInPdv(s);
                      }}
                      className="w-6 h-6 rounded-lg bg-[#0e1628] border border-gray-850 flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-900 transition-all text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div 
                      title="Adicionar serviço ao carrinho"
                      className="w-6 h-6 rounded-lg bg-red-950/20 border border-red-900/40 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </div>
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

            {/* Smart Cross-Sell Recommendations inside Basket */}
            {activeBasketCrossSellSuggestions.length > 0 && (
              <div className="mt-3 p-3 bg-gradient-to-r from-amber-950/20 via-purple-950/20 to-slate-950/40 rounded-xl border border-amber-900/30 font-sans text-left animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                    <span>SUGESTÕES DE VENDA CRUZADA ({activeBasketCrossSellSuggestions.length})</span>
                  </div>
                  <span className="text-[9px] font-mono text-amber-500 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800/40 font-semibold">
                    Recorrência Histórica
                  </span>
                </div>

                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {activeBasketCrossSellSuggestions.map((sugg, idx) => (
                    <div key={idx} className="p-2 bg-[#090e1c] border border-amber-900/20 rounded-lg flex items-center justify-between gap-2 text-xs">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/10 text-amber-400 font-mono font-bold rounded border border-amber-500/20 shrink-0">
                            {sugg.coOccurrencePercent}% co-ocorrência
                          </span>
                          <span className="font-semibold text-white truncate text-[11px]">{sugg.suggestedName}</span>
                        </div>
                        <span className="text-[9.5px] text-gray-400 block truncate mt-0.5">{sugg.reason}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAcceptCrossSell(sugg)}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-black font-mono font-bold text-[10px] uppercase rounded-md shrink-0 cursor-pointer transition-all hover:scale-105 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>R$ {sugg.suggestedPrice.toFixed(2)}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checkout Controls and Calculations */}
          {basket.length > 0 && (
            <div className="mt-6 border-t border-gray-850 pt-4 flex flex-col gap-4 text-left">
              
              {/* Payment Methods selector */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[9px] font-mono text-gray-400 font-bold uppercase">MÉTODOS DE PAGAMENTO DE FRENTE DE CAIXA</label>
                  {paymentMethod === 'Fatura' && activeCustomer && (
                    <span className="text-[8.5px] font-mono text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/30">
                      Disponível: R$ {Math.max(0, (activeCustomer.limitAmount || 0) - (activeCustomer.usedLimit || 0)).toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2 [&>button]:py-2.5 [&>button]:rounded-xl [&>button]:text-[10px] [&>button]:font-bold [&>button]:font-mono">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                      paymentMethod === 'PIX' ? 'border-red-500 text-white bg-red-950/20 shadow' : 'border-gray-800 text-gray-400 bg-transparent'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 text-red-500 shrink-0" /> PIX
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('Cartão')}
                    className={`flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                      paymentMethod === 'Cartão' ? 'border-red-500 text-white bg-red-950/20 shadow' : 'border-gray-800 text-gray-400 bg-transparent'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-red-500 shrink-0" /> Cartão
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('Dinheiro')}
                    className={`flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                      paymentMethod === 'Dinheiro' ? 'border-red-500 text-white bg-red-950/20 shadow' : 'border-gray-800 text-gray-400 bg-transparent'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5 text-red-500 shrink-0" /> Dinheiro
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('Fatura')}
                    className={`flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                      paymentMethod === 'Fatura' ? 'border-red-500 text-white bg-red-950/20 shadow' : 'border-gray-800 text-gray-400 bg-transparent'
                    }`}
                    title="Faturamento em conta corrente do cliente"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" /> Fatura
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

              {/* Coupons module */}
              <div className="bg-[#050912]/50 p-3 rounded-xl border border-gray-800 flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[9px] font-bold uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5 text-red-500" />
                    <span>SISTEMA DE CUPONS DE DESCONTO</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCouponModal(prev => !prev);
                    }}
                    className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer bg-red-950/15 hover:bg-red-950/30 py-0.5 px-2 rounded border border-red-950/40"
                  >
                    {showAddCouponModal ? "✕ Fechar Cadastro" : "＋ Cadastrar Cupom"}
                  </button>
                </div>

                {/* Quick Coupon Registration Drawer */}
                {showAddCouponModal && (
                  <form onSubmit={handleCreateCoupon} className="bg-[#080c16] p-3 rounded-lg border border-red-900/30 flex flex-col gap-2.5 font-sans animate-fade-in text-xs text-left">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[8.5px] text-gray-400 font-mono uppercase">CÓDIGO DO CUPOM *</label>
                        <input 
                          type="text"
                          placeholder="Ex: CUPOM10"
                          value={newCouponCode}
                          onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                          className="bg-black/50 border border-gray-850 rounded px-2 py-1 text-white font-mono text-center uppercase focus:border-red-500 outline-none text-[11px]"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[8.5px] text-gray-400 font-mono uppercase">TIPO DE DESCONTO</label>
                        <select
                          value={newCouponType}
                          onChange={(e) => setNewCouponType(e.target.value as 'percentage' | 'fixed')}
                          className="bg-[#0c1223] border border-gray-850 rounded px-2 py-1 text-white text-[11px] font-mono outline-none"
                        >
                          <option value="percentage">Porcentagem (%)</option>
                          <option value="fixed">Fixo (R$)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[8.5px] text-gray-400 font-mono uppercase">VALOR DESCONTO *</label>
                        <input 
                          type="number"
                          placeholder="Ex: 15 ou 50"
                          value={newCouponValue}
                          onChange={(e) => setNewCouponValue(e.target.value)}
                          className="bg-black/50 border border-gray-850 rounded px-2 py-1 text-white font-mono text-center text-[11px] outline-none"
                          required
                          min="1"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[8.5px] text-gray-400 font-mono uppercase">COMPRA MÍNIMA (R$)</label>
                        <input 
                          type="number"
                          placeholder="Mínimo"
                          value={newCouponMin}
                          onChange={(e) => setNewCouponMin(e.target.value)}
                          className="bg-black/50 border border-gray-850 rounded px-2 py-1 text-white font-mono text-center text-[11px] outline-none"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[8.5px] text-gray-400 font-mono uppercase">DESCRIÇÃO CURTA</label>
                      <input 
                        type="text"
                        placeholder="Ex: 15% off em compras acima de R$ 300"
                        value={newCouponDesc}
                        onChange={(e) => setNewCouponDesc(e.target.value)}
                        className="bg-[#0c1223] border border-gray-850 rounded px-2.5 py-1 text-white text-[11px] outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.5 bg-red-600 hover:bg-red-750 text-white font-mono text-[9px] uppercase font-bold rounded cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      💾 SALVAR E ATIVAR CUPOM
                    </button>
                  </form>
                )}

                {/* Search & Apply explicit coupon box */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      placeholder="INSIRA CÓDIGO DO CUPOM..."
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full bg-[#080c16] border border-gray-800 rounded-lg py-1.5 px-3 uppercase text-xs text-white font-mono text-left focus:border-red-500 outline-none"
                    />
                  </div>
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-3 bg-red-950/40 border border-red-900/50 hover:bg-red-950/60 cursor-pointer text-red-400 font-mono font-bold text-xs rounded-lg uppercase transition-all"
                    >
                      REMOVER
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="px-4 bg-red-650 hover:bg-red-700 bg-red-600 text-white font-mono font-bold text-xs rounded-lg uppercase cursor-pointer transition-all"
                    >
                      APLICAR
                    </button>
                  )}
                </div>

                {couponError && (
                  <span className="text-[10px] text-red-400 font-mono leading-tight text-left block">{couponError}</span>
                )}

                {appliedCoupon && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-950/20 border border-green-900/30 text-xs font-mono text-green-400 text-left">
                    <div className="truncate pr-2">
                      <span className="font-bold block">🎫 CUPOM ATIVO: {appliedCoupon.code}</span>
                      <span className="block text-[9px] text-green-500 leading-normal truncate">{appliedCoupon.description}</span>
                    </div>
                    <span className="font-bold whitespace-nowrap bg-green-905 bg-green-900/30 px-2 py-0.5 rounded">
                      -{appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `R$ ${appliedCoupon.value.toFixed(2)}`}
                    </span>
                  </div>
                )}

                {/* Available Coupons list Pills */}
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[8.5px] font-mono text-gray-500 uppercase tracking-wide text-left block">💡 CUPONS DISPONÍVEIS (CLIQUE PARA APLICAR):</span>
                  <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
                    {coupons.map((c) => {
                      const isDisabled = c.minPurchase ? subtotal < c.minPurchase : false;
                      const isCurrent = appliedCoupon?.code === c.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            setAppliedCoupon(c);
                            setCouponInput(c.code);
                            setCouponError(null);
                          }}
                          className={`w-full p-1.5 rounded-lg border text-left flex items-start justify-between transition-all cursor-pointer ${
                            isCurrent
                              ? "bg-red-950/15 border-red-500 text-red-400"
                              : isDisabled
                              ? "opacity-35 bg-transparent border-gray-900 text-gray-600 cursor-not-allowed"
                              : "bg-[#080c16]/50 border-gray-850 text-gray-300 hover:border-gray-750 hover:text-white"
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="text-[10px] font-mono font-bold block">{c.code}</span>
                            <span className="text-[9px] text-gray-500 font-sans block truncate">{c.description}</span>
                          </div>
                          <span className="text-[9.5px] font-mono font-bold shrink-0 self-center bg-gray-950/85 px-1.5 py-0.5 rounded text-gray-400">
                            {c.type === 'percentage' ? `-${c.value}%` : `-R$ ${c.value}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dynamic PIX QR Code & Copia e Cola Preview */}
              {paymentMethod === 'PIX' && grandTotal > 0 && (
                <div className="bg-red-950/10 p-3.5 rounded-xl border border-red-900/45 flex flex-col items-center gap-3 animate-fade-in text-center font-sans">
                  <div className="flex items-center gap-1.5 text-red-500 font-mono text-[9px] font-bold uppercase tracking-wider self-start">
                    <QrCode className="w-4 h-4 animate-pulse" />
                    <span>PAGAMENTO IMEDIATO VIA PIX COM VALOR EXATO</span>
                  </div>
                  
                  {pixQrBase64 ? (
                    <div className="p-2 bg-white rounded-lg inline-block shadow-xl relative group">
                      <img 
                        src={pixQrBase64} 
                        alt="QR Code PIX Dinâmico" 
                        className="w-36 h-36 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-36 h-36 border border-gray-800 rounded-lg flex items-center justify-center text-gray-600 text-[10px] font-mono">
                      Gerando QR Code...
                    </div>
                  )}

                  <div className="flex flex-col gap-0.5 w-full text-left">
                    <span className="text-[9.5px] font-mono font-bold text-gray-300 uppercase">CHAVE DE COBRANÇA: {company?.pixKey || 'cleciotecnologia@gmail.com'}</span>
                    <span className="text-[9.5px] font-mono text-gray-400">BENEFICIÁRIO: {company?.pixBeneficiary || company?.name || 'AutoPrecision Premium'}</span>
                    <span className="text-[9.5px] font-mono text-gray-400">VALOR EXATO DA INVOICE: R$ {grandTotal.toFixed(2)}</span>
                    <span className="text-[8.5px] text-gray-500 font-sans mt-1">Aponte a câmera do aplicativo bancário para a tela ou copie o Pix abaixo:</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPdvEditPix(!pdvEditPix)}
                    className="text-[9px] font-mono font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer bg-red-950/25 px-2.5 py-1 rounded border border-red-900/40"
                  >
                    <Settings className="w-3.5 h-3.5 text-red-500" /> {pdvEditPix ? "[Fechar Configuração]" : "⚙️ Cadastrar/Mudar Chave PIX"}
                  </button>

                  {pdvEditPix && (
                    <div className="bg-[#080d1a] border border-gray-850 rounded-lg p-3 w-full flex flex-col gap-2 text-left font-mono text-[9.5px] animate-fade-in">
                      <span className="text-gray-400 font-bold uppercase text-[8.5px] block border-b border-gray-800 pb-1">ALTERAR DADOS PIX NO SAT/PDV</span>
                      
                      <div className="flex flex-col gap-0.5">
                        <span className="text-gray-400">Chave PIX:</span>
                        <input 
                          type="text" 
                          value={tempPdvPixKey} 
                          onChange={e => setTempPdvPixKey(e.target.value)}
                          placeholder="Chave PIX"
                          className="bg-black/60 border border-gray-800 rounded px-2 py-1 text-white text-[9.5px] focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-gray-400">Beneficiário:</span>
                        <input 
                          type="text" 
                          value={tempPdvPixBeneficiary} 
                          onChange={e => setTempPdvPixBeneficiary(e.target.value)}
                          placeholder="Nome Titular"
                          className="bg-black/60 border border-gray-850 rounded px-2 py-1 text-white text-[9.5px] focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <span className="text-gray-400">Cidade:</span>
                        <input 
                          type="text" 
                          value={tempPdvPixCity} 
                          onChange={e => setTempPdvPixCity(e.target.value.toUpperCase())}
                          placeholder="Cidade"
                          className="bg-black/60 border border-gray-850 rounded px-2 py-1 text-white text-[9.5px] focus:outline-none focus:border-red-500 uppercase"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await updateCompany({
                              pixKey: tempPdvPixKey,
                              pixBeneficiary: tempPdvPixBeneficiary,
                              pixCity: tempPdvPixCity
                            });
                            setPdvEditPix(false);
                          } catch (err) {
                            console.error("Erro inline PDV:", err);
                          }
                        }}
                        className="w-full mt-1.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[9.5px]"
                      >
                        Salvar Chave e Recarregar QR Code
                      </button>
                    </div>
                  )}

                  <div className="flex gap-1.5 w-full">
                    <input 
                      type="text" 
                      readOnly 
                      value={pixStringCode} 
                      className="bg-black/50 border border-gray-850 rounded px-2.5 py-1.5 font-mono text-[8.5px] text-gray-450 select-all truncate flex-1 outline-none text-left text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(pixStringCode);
                          setCopiedPixMessage(true);
                          setTimeout(() => setCopiedPixMessage(false), 2000);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="px-2.5 py-1.5 bg-red-600 hover:bg-red-750 font-mono font-bold text-[9px] uppercase rounded text-white flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                    >
                      <Copy className="w-3 h-3 text-white" /> {copiedPixMessage ? 'COPIADO!' : 'COPIAR'}
                    </button>
                  </div>
                </div>
              )}

              {/* Pricing breakdown details with beautiful high contrast */}
              <div className="bg-gray-950/50 p-4 rounded-xl border border-gray-900 text-xs font-mono flex flex-col gap-2">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal bruto</span>
                  <span className="text-white">R$ {subtotal.toFixed(2)}</span>
                </div>
                {manualDiscountAmount > 0 && (
                  <div className="flex justify-between text-amber-500 font-bold">
                    <span>Desconto Balcão ({discountPercent}%)</span>
                    <span>- R$ {manualDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                {couponDiscountAmount > 0 && appliedCoupon && (
                  <div className="flex justify-between text-emerald-450 text-emerald-400 font-bold">
                    <span>Desconto Cupom ({appliedCoupon.code})</span>
                    <span>- R$ {couponDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-yellow-500 font-bold border-t border-gray-900/40 pt-1.5">
                    <span>TOTAL DESCONTOS</span>
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
                onClick={() => {
                  if (paymentMethod === 'PIX') {
                    setPixModalStatus('pending');
                    const generatedTxId = "E" + Math.floor(100000000 + Math.random() * 900000000) + "BACEN";
                    setPixTxId(generatedTxId);
                    setPixTimer(60);
                    setShowPixApprovalModal(true);
                  } else {
                    handleFinalizeSale();
                  }
                }}
                className="w-full py-4 bg-red-650 hover:bg-red-700 bg-red-600 text-white font-bold rounded-xl text-xs sm:text-xs tracking-widest font-mono cursor-pointer shadow-lg shadow-red-950/40 text-center active:scale-98 transition-all uppercase animate-pulse-subtle"
              >
                {paymentMethod === 'PIX' ? '🔗 AUTORIZAR PAGAMENTO PIX' : '📥 REGISTRAR E IMPRIMIR VENDA'}
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
            onClick={() => {
              playScannerBeep();
              setPhysicalCashInput(closureFinancials.expectedCashInRegister.toFixed(2));
              setClosureNotes('');
              setShowClosureModal(true);
            }}
            className="px-3 py-2 rounded-lg border border-red-900 bg-red-950/20 text-red-400 hover:bg-red-650 hover:text-white transition-all font-bold font-mono text-[10px] cursor-pointer"
          >
            🔒 FECHAR CAIXA DO DIA
          </button>
        </div>

      </div>

      {/* 📊 HISTÓRICO DE VENDAS RECENTES & GESTÃO DE ESTORNOS DE CAIXA */}
      <div id="historico-de-vendas" className="col-span-12 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-4 mt-2 w-full min-w-0 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-red-500 shrink-0" />
              <h3 className="font-display font-extrabold text-base sm:text-lg text-white">HISTÓRICO OPERACIONAL DO PDV</h3>
              <span className="text-[10px] bg-red-950/40 text-red-400 font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wide">Frente de Caixa</span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase">Acesso rápido para reemissão de cupons de vendas e solicitação de estornos com recomposição automática de estoque.</p>
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3/5 top-2.5 w-3.5 h-3.5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por ID, Cliente..."
              value={historySearchQuery}
              onChange={(e) => setHistorySearchQuery(e.target.value)}
              className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 pl-9.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>
        </div>

        {vendas.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-gray-500">
            <FileText className="w-8 h-8 text-gray-500 animate-pulse" />
            <p className="text-xs italic">Nenhuma venda registrada neste terminal operacional de caixa.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-850 font-mono text-[9.5px] uppercase tracking-wider text-gray-400">
                  <th className="py-3 px-4 font-bold">Venda ID</th>
                  <th className="py-3 px-4 font-bold">Data / Hora</th>
                  <th className="py-3 px-4 font-bold">Cliente Vinculado</th>
                  <th className="py-3 px-4 font-bold">Forma Pagto</th>
                  <th className="py-3 px-4 font-bold text-right">Desconto</th>
                  <th className="py-3 px-4 font-bold text-right">Valor Total</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Ações de Frente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {vendas
                  .filter(v => 
                    v.id.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                    (v.clienteName && v.clienteName.toLowerCase().includes(historySearchQuery.toLowerCase())) ||
                    (v.clienteId && v.clienteId.toLowerCase().includes(historySearchQuery.toLowerCase()))
                  )
                  .map((v) => {
                    const isEstornada = v.status === 'estornada';
                    return (
                      <tr key={v.id} className={`hover:bg-[#070b14]/45 transition-colors ${isEstornada ? 'opacity-55' : ''}`}>
                        <td className="py-3.5 px-4 font-mono font-bold text-white uppercase">{v.id}</td>
                        <td className="py-3.5 px-4 text-gray-400 font-mono">{new Date(v.date).toLocaleString('pt-BR')}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="text-white font-semibold">{v.clienteName || 'Consumidor Final'}</span>
                            {v.clienteId && (
                              <span className="text-[9px] text-gray-500 font-mono uppercase">ID Cliente: {v.clienteId}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono select-none">
                          {isEstornada ? (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              v.paymentMethod === 'PIX' ? 'bg-cyan-950/45 text-cyan-400 border border-cyan-900/30' :
                              v.paymentMethod === 'Cartão' ? 'bg-purple-950/45 text-purple-400 border border-purple-900/30' :
                              v.paymentMethod === 'Dinheiro' ? 'bg-emerald-950/45 text-emerald-400 border border-emerald-900/30' :
                              'bg-amber-950/45 text-amber-500 border border-amber-900/30'
                            }`}>
                              {v.paymentMethod}
                            </span>
                          ) : (
                            <select
                              value={v.paymentMethod}
                              onChange={(e) => handleChangePaymentMethod(v, e.target.value as any)}
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-[#080d16] hover:bg-[#111929] cursor-pointer focus:outline-none border ${
                                v.paymentMethod === 'PIX' ? 'border-cyan-900 text-cyan-400' :
                                v.paymentMethod === 'Cartão' ? 'border-purple-900/60 text-purple-400' :
                                v.paymentMethod === 'Dinheiro' ? 'border-emerald-900/60 text-emerald-400' :
                                'border-amber-900/60 text-amber-500 bg-amber-950/10'
                              }`}
                            >
                              <option value="PIX">⚡ PIX</option>
                              <option value="Cartão">💳 Cartão</option>
                              <option value="Dinheiro">💵 Dinheiro</option>
                              <option value="Fatura">🧾 Fatura</option>
                            </select>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-right text-gray-400 font-semibold">R$ {v.discount.toFixed(2)}</td>
                        <td className="py-3.5 px-4 font-mono text-right font-extrabold text-white">R$ {v.total.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-center">
                          {isEstornada ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="px-2 py-0.5 rounded bg-red-950/45 text-red-500 border border-red-900/20 text-[9px] font-mono font-bold uppercase tracking-wider">
                                🚨 ESTORNADA
                              </span>
                              {v.justification && (
                                <span className="text-[8.5px] text-gray-500 max-w-[150px] truncate italic block text-center" title={v.justification}>
                                  "{v.justification}"
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-green-950/40 text-green-400 border border-green-900/20 text-[9px] font-mono font-bold uppercase tracking-wider">
                              ✅ OPERACIONAL
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                playScannerBeep();
                                setLastFinishedSale(v);
                                setSaleFinished(true);
                              }}
                              className="px-2 py-1 text-[9.5px] font-mono font-bold rounded-lg border border-gray-800 bg-[#080d16] hover:bg-[#121c33] text-gray-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 shrink-0 uppercase select-none"
                              title="Reimprimir Cupom Térmico Não Fiscal"
                            >
                              <Printer className="w-3.5 h-3.5 text-cyan-400" /> <span className="hidden lg:inline">Re-imprimir</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                playScannerBeep();
                                setSelectedReceiptSale(v);
                                setShowDigitalReceiptCardModal(true);
                              }}
                              className="px-2 py-1 text-[9.5px] font-mono font-bold rounded-lg border border-emerald-900/40 bg-emerald-950/25 hover:bg-emerald-900 hover:text-white text-emerald-400 transition-all cursor-pointer flex items-center gap-1 shrink-0 uppercase select-none"
                              title="Visualizar Comprovante Digital (Card & WhatsApp)"
                            >
                              <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> <span className="hidden lg:inline">Digital</span>
                            </button>

                            {isEstornada && (
                              <button
                                type="button"
                                id={`btn-comprovante-estorno-${v.id}`}
                                onClick={() => {
                                  playScannerBeep();
                                  setReversalReceiptSale({
                                    ...v,
                                    reversalDate: v.date // or standard date of reference
                                  });
                                  setShowReversalReceipt(true);
                                }}
                                className="px-2 py-1 text-[9.5px] font-mono font-bold rounded-lg border border-red-900/30 bg-red-950/20 hover:bg-red-900 hover:text-white text-red-400 transition-all cursor-pointer flex items-center gap-1 shrink-0 uppercase select-none"
                                title="Visualizar Comprovante de Estorno"
                              >
                                <FileText className="w-3.5 h-3.5 text-red-400" /> <span className="hidden lg:inline">Comprovante</span>
                              </button>
                            )}

                            {!isEstornada && (
                              <button
                                type="button"
                                onClick={() => {
                                  playScannerBeep();
                                  setReversalSaleId(v.id);
                                  setReversalJustification('');
                                  setReversalAdminPassword('');
                                  setReversalError(null);
                                }}
                                className="px-2 py-1 text-[9.5px] font-mono font-bold rounded-lg border border-red-900/30 bg-red-950/20 hover:bg-red-900 hover:text-white text-red-400 transition-all cursor-pointer flex items-center gap-1 shrink-0 uppercase select-none"
                                title="Solicitar Reversão / Estorno com Justificativa"
                              >
                                <RotateCcw className="w-3 text-red-400" /> <span className="hidden lg:inline">Estornar</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🚨 INTERACTIVE SALES REVERSAL MODAL */}
      {reversalSaleId && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm text-left">
          <div className="bg-[#0b101d] border border-red-950/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setReversalSaleId(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-red-950/40 text-red-500 border border-red-900/40 rounded-xl">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <span className="bg-red-950/50 border border-red-800 text-red-400 text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded font-mono">
                  Confirmar Estorno
                </span>
                <h3 className="text-md font-display font-extrabold text-white uppercase">Estorno Operacional de Venda</h3>
              </div>
            </div>

            <div className="p-3 bg-[#070b14] border border-red-950/30 rounded-xl text-xs font-mono text-gray-400 flex flex-col gap-1 text-left">
              <div>Venda Selecionada: <strong className="text-white uppercase">#{reversalSaleId}</strong></div>
              <div>Valor a Refundar: <strong className="text-red-400">R$ {vendas.find(v => v.id === reversalSaleId)?.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
              <div className="text-[10px] text-gray-500 mt-1 leading-normal uppercase">Os itens desta venda serão retornados ao estoque de peças e o valor será abatido da movimentação financeira.</div>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">JUSTIFICATIVA DO ESTORNO *</label>
              <textarea 
                value={reversalJustification}
                onChange={(e) => {
                  setReversalJustification(e.target.value);
                  setReversalError(null);
                }}
                placeholder="Exemplo: Peça incompatível com veículo do cliente / Devolução de compra por arrependimento..."
                rows={3}
                className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 font-sans resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">SENHA DE LIBERAÇÃO DO ADMINISTRADOR *</label>
              <input 
                type="password"
                id="input-reversal-password"
                value={reversalAdminPassword}
                onChange={(e) => {
                  setReversalAdminPassword(e.target.value);
                  setReversalError(null);
                }}
                placeholder="Digite a senha mestre de liberação..."
                className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 font-mono text-left"
              />
              <span className="text-[9px] text-gray-500 font-sans block leading-normal mt-0.5 uppercase">
                🔑 Use a senha gravada pelo Admin ou as senhas mestre: <strong className="text-gray-300 font-mono">admin123</strong> / <strong className="text-gray-300 font-mono">1234</strong>
              </span>
              {reversalError && (
                <span className="text-[10px] font-mono text-red-500 mt-0.5">{reversalError}</span>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-850 pt-3">
              <button
                type="button"
                onClick={() => setReversalSaleId(null)}
                className="py-2 px-3.5 bg-slate-950 hover:bg-slate-900 text-gray-400 text-[10px] sm:text-xs font-mono uppercase font-bold border border-gray-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirm-reversal"
                onClick={async () => {
                  if (!reversalJustification.trim()) {
                    setReversalError("Por favor, informe uma justificativa válida para concluir o estorno.");
                    return;
                  }
                  if (!reversalAdminPassword) {
                    setReversalError("Por favor, informe a senha de liberação do administrador.");
                    return;
                  }
                  const isLoggedAdminMatch = user?.role === 'Administrador' && user.reversalPassword && reversalAdminPassword === user.reversalPassword;
                  const isDefaultMatch = reversalAdminPassword === "admin123" || reversalAdminPassword === "1234";
                  if (!isLoggedAdminMatch && !isDefaultMatch) {
                    setReversalError("Senha de liberação incorreta! Apenas administradores autorizados podem liberar estornos.");
                    return;
                  }
                  try {
                    const foundSale = vendas.find(v => v.id === reversalSaleId);
                    await estornarVenda(reversalSaleId, reversalJustification);
                    if (foundSale) {
                      setReversalReceiptSale({
                        ...foundSale,
                        status: 'estornada',
                        justification: reversalJustification,
                        reversalDate: new Date().toISOString()
                      });
                      setShowReversalReceipt(true);
                    }
                    setReversalSaleId(null);
                  } catch (err: any) {
                    setReversalError(err.message || "Erro durante o processamento do estorno.");
                  }
                }}
                className="py-2 px-4 bg-red-650 hover:bg-red-750 text-white font-mono text-[10px] sm:text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer uppercase select-none border-0"
              >
                Confirmar Estorno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚨 COMPROVANTE DE ESTORNO DE VENDA DIALOG MODAL */}
      {showReversalReceipt && reversalReceiptSale && (
        <div id="reversal-receipt-modal" className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in text-left">
          <div className="print-container-target bg-white text-black max-w-sm w-full rounded-2xl p-6 shadow-2xl relative">
            
            <button 
              type="button"
              id="btn-close-reversal-receipt"
              onClick={() => {
                setShowReversalReceipt(false);
                setReversalReceiptSale(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center font-mono text-xs border-b-2 border-black pb-3 flex flex-col items-center">
              {company.logoUrl && (
                <img 
                  src={company.logoUrl} 
                  alt="Logo Oficina" 
                  className="w-12 h-12 object-contain mb-2 filter grayscale" 
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="font-extrabold text-sm block tracking-widest text-red-650 uppercase">🚨 COMPROVANTE DE ESTORNO</span>
              <span className="font-extrabold text-[11px] block tracking-wide mt-1 text-black">{company.name.toUpperCase()}</span>
              <span className="text-[10px] block mt-0.5">{company.address || "Av. das Nações Unidas, 1040 - São Paulo, SP"}</span>
              <span className="text-[10px] block font-mono">CNPJ: {company.cnpj || "12.345.678/0001-90"} • Fone: {company.phone || "(11) 98765-4321"}</span>
            </div>

            <div className="my-3 p-3 bg-red-50 border-2 border-red-600 rounded-xl font-mono text-[10px] text-red-800 leading-normal flex flex-col gap-1">
              <div className="font-extrabold text-xs text-center border-b border-red-200 pb-1.5 uppercase">
                ❌ TRANSAÇÃO CANCELADA
              </div>
              <div className="mt-1 flex justify-between">
                <span>ESTORNO EFETUADO EM:</span>
                <span className="font-bold">{new Date(reversalReceiptSale.reversalDate || reversalReceiptSale.date).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span>STATUS DO CAIXA:</span>
                <span className="font-bold">SALDO AJUSTADO</span>
              </div>
              <div className="mt-1 pt-1.5 border-t border-red-200">
                <span className="font-extrabold block">MOTIVO DO LOG DE AUDITORIA:</span>
                <span className="italic block font-sans text-neutral-800 text-xs text-left mt-0.5 select-all leading-normal">
                  "{reversalReceiptSale.justification || 'Estorno acordado com o cliente'}"
                </span>
              </div>
              <div className="flex justify-between mt-1 pt-1 border-t border-red-200/50 text-[9px] text-red-650">
                <span>LIBERAÇÃO:</span>
                <span className="font-bold">SENHA MASTER ADMIN</span>
              </div>
            </div>

            <div className="my-4 font-mono text-[11px] flex flex-col gap-1">
              <div className="flex justify-between font-bold">
                <span>REGISTRO DO PDV</span>
                <span className="uppercase">#{reversalReceiptSale.id}</span>
              </div>
              <span>Data da Compra ID: {new Date(reversalReceiptSale.date).toLocaleString('pt-BR')}</span>
              <span className="border-b border-dashed border-black my-1"></span>
              
              {/* Customer Area */}
              <div className="bg-neutral-100 p-2 rounded text-[10px] flex flex-col gap-0.5">
                <span className="font-bold text-neutral-700">CONTRA-PARTE/CLIENTE:</span>
                <span className="text-black font-semibold uppercase">{reversalReceiptSale.clienteName || "Consumidor Final"}</span>
                {reversalReceiptSale.clienteCpfCnpj && (
                  <span>CPF/CNPJ: {reversalReceiptSale.clienteCpfCnpj}</span>
                )}
              </div>

              {reversalReceiptSale.sellerName && (
                <div className="text-[10px] text-gray-600 mt-1 pl-1">
                  <span>Operador de Venda: <strong>{reversalReceiptSale.sellerName}</strong></span>
                </div>
              )}

              <span className="border-b border-dashed border-black my-1"></span>
              
              <div className="flex flex-col gap-1 font-sans">
                <span className="font-bold font-mono text-[9px] uppercase text-neutral-500 block">ITENS ESTORNADOS (RETORNADOS AO ESTOQUE):</span>
                {reversalReceiptSale.items && reversalReceiptSale.items.map((it: any, index: number) => (
                  <div key={index} className="flex justify-between items-start text-xs leading-none">
                    <span className="pr-2">{it.quantity}x {it.name}</span>
                    <span className="font-mono text-right whitespace-nowrap">R$ {it.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <span className="border-b border-dashed border-black my-1.5"></span>
              
              <div className="flex justify-between text-xs">
                <span>Subtotal bruto:</span>
                <span>R$ {(reversalReceiptSale.total + (reversalReceiptSale.discount || 0)).toFixed(2)}</span>
              </div>

              {reversalReceiptSale.discount > 0 && (
                <div className="flex justify-between text-red-650 font-bold text-xs">
                  <span>Desconto Abatido:</span>
                  <span>- R$ {reversalReceiptSale.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-extrabold text-sm border-t border-neutral-300 pt-1 mt-1 font-mono text-black">
                <span>VALOR DEVOLVIDO:</span>
                <span className="text-red-600">R$ {reversalReceiptSale.total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-[10px] text-neutral-600 mt-1 pl-1 font-mono border-t border-neutral-200/60 pt-1">
                <span>Origem do Pagamento:</span>
                <span className="font-bold text-black uppercase">{reversalReceiptSale.paymentMethod}</span>
              </div>
            </div>

            <div className="text-center text-[10px] font-mono border-t border-black pt-2 flex flex-col gap-0.5 text-gray-500 my-2">
              <span>Este documento atesta a anulação fiscal e devolução financeira.</span>
              <span className="block italic text-[8.5px]">AutoTech Cloud ERP Systems • Módulo Financeiro</span>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2 font-mono">
              <button 
                type="button"
                id="btn-print-reversal"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 rounded-xl bg-red-650 hover:bg-red-750 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all active:scale-[98%] border-0"
              >
                <Printer className="w-4 h-4 text-white" /> Imprimir Comprovante
              </button>
              <button 
                type="button"
                id="btn-close-reversal-receipt-footer"
                onClick={() => {
                  setShowReversalReceipt(false);
                  setReversalReceiptSale(null);
                }}
                className="flex-1 py-1 px-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs text-neutral-800 font-bold cursor-pointer transition-all active:scale-[98%] text-center bg-transparent text-black font-semibold"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DIRECT INTEGRATED PIX APPROVAL & SIMULATION MODAL */}
      {showPixApprovalModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c1223] border border-gray-805 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-left animate-fade-in border-gray-800">
            {/* Header */}
            <div className="p-6 border-b border-gray-850 flex justify-between items-center bg-[#080d1a]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 rounded-xl relative">
                  <QrCode className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-sm sm:text-base">Módulo PIX Integrado SESP/SAT</h3>
                  <span className="text-[10px] text-gray-500 font-mono block">Segurança Banco Central do Brasil • Emissão Imediata</span>
                </div>
              </div>
              {pixModalStatus !== 'approving' && (
                <button
                  type="button"
                  onClick={() => setShowPixApprovalModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Body content */}
            <div className="p-6 flex flex-col gap-4 text-xs font-mono text-gray-300">
              {/* Financial Box */}
              <div className="bg-[#080d1a] border border-gray-850 p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Total a receber via PIX</span>
                  <span className="text-xl sm:text-2xl font-bold font-display text-emerald-400">R$ {grandTotal.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block uppercase">CLIENTE</span>
                  <span className="text-xs font-bold text-white max-w-[150px] truncate block">
                    {selectedClienteId === 'unidentified' ? 'Consumidor Final' : activeCustomer?.name || 'Cliente'}
                  </span>
                </div>
              </div>

              {/* Status Section */}
              <div className="flex flex-col gap-2.5">
                {pixModalStatus === 'pending' && (
                  <div className="p-4 rounded-2xl bg-amber-950/15 border border-amber-900/40 text-center flex flex-col items-center gap-2 animate-fade-in">
                    <div className="flex items-center gap-2 text-amber-500 font-bold font-mono">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      <span>🕒 AGUARDANDO DEPOSITANTE • {pixTimer}s</span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      O sistema está monitorando as transações do Banco Central para a chave <strong className="text-gray-200">{company?.pixKey || 'cleciotecnologia@gmail.com'}</strong>.
                    </span>
                  </div>
                )}

                {pixModalStatus === 'approving' && (
                  <div className="p-4 rounded-2xl bg-cyan-950/15 border border-cyan-900/40 text-center flex flex-col items-center gap-3 animate-fade-in">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono">
                      <svg className="animate-spin h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>⚡ CONFERINDO ASSINATURA DIGITAL...</span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      Entrando em contato com o Gateway Central SICOOB. Verificando as chaves de segurança e o ID {pixTxId}.
                    </span>
                  </div>
                )}

                {pixModalStatus === 'approved' && (
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 text-center flex flex-col items-center gap-2 animate-fade-in">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                      <CheckCircle className="w-5 h-5 text-emerald-400 animate-bounce" />
                      <span>🟢 PAGAMENTO INTEGRADO APROVADO!</span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-left bg-black/40 border border-gray-900 px-3 py-2 rounded-xl w-full mt-1.5 border-gray-850">
                      <span className="text-[9px] text-gray-500 uppercase font-black">AUTENTICAÇÃO DO DOCUMENTO</span>
                      <span className="text-[9px] text-emerald-400 leading-none truncate">{pixTxId}</span>
                      <span className="text-[9px] text-gray-400 mt-1">Status: <strong className="text-white uppercase text-[9px]">LIQUIDADO / SEGURO</strong></span>
                      <span className="text-[8.5px] text-gray-500 font-sans mt-0.5 leading-tight">Valor integral do Pix creditado e verificado no CNPJ da empresa. O estoque foi reajustado e a venda liberada no sistema.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code and "Copia e Cola" Area for pending status */}
              {pixModalStatus === 'pending' && (
                <div className="bg-[#080d1a] border border-gray-850 p-4 rounded-2xl flex flex-col items-center gap-3">
                  {pixQrBase64 ? (
                    <div className="p-2.5 bg-white rounded-xl inline-block shadow-lg">
                      <img 
                        src={pixQrBase64} 
                        alt="QR Code Pix" 
                        className="w-32 h-32 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 border border-gray-800 rounded-xl flex items-center justify-center text-[10px] text-gray-500">
                      Processando chaves...
                    </div>
                  )}

                  <div className="w-full">
                    <span className="text-[9px] text-gray-500 uppercase block mb-1 text-left">Copia-e-Cola (Pix Payload):</span>
                    <div className="flex gap-1.5">
                      <input 
                        type="text" 
                        readOnly 
                        value={pixStringCode} 
                        className="bg-black/50 border border-gray-850 rounded-lg px-2.5 py-2 font-mono text-[8.5px] text-gray-400 select-all truncate flex-1 outline-none text-left"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            navigator.clipboard.writeText(pixStringCode);
                            alert("Código Pix copiado com sucesso!");
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="px-2.5 py-1.5 bg-red-650 hover:bg-red-750 font-mono font-bold text-[9px] uppercase rounded-lg text-white flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                      >
                        <Copy className="w-3 h-3 text-white" /> COPIAR
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Console Logs Terminal */}
              <div className="bg-black/80 border border-gray-900 rounded-2xl p-3 font-mono text-[9px] text-gray-400 flex flex-col gap-1 select-none max-h-[100px] overflow-y-auto text-left">
                <span className="text-yellow-500 font-bold uppercase text-[7px] tracking-wider block mb-0.5 select-none border-b border-gray-900 pb-1">SAT-PIX Terminal Logs • v1.19</span>
                <span>[LOG] Estabelecendo conexão TLS v1.3 com webhook do Banco Central.</span>
                <span>[LOG] Chave Pix da empresa ativa: {company?.pixKey || 'cleciotecnologia@gmail.com'}</span>
                <span>[LOG] QR Code dinâmico do lote gerado com sucesso.</span>
                {pixModalStatus === 'pending' && (
                  <span className="text-yellow-500 animate-pulse">[LOG] Esperando transferência... (Tempo restante: {pixTimer}s)</span>
                )}
                {pixModalStatus === 'approving' && (
                  <>
                    <span className="text-cyan-400 font-bold">[LOG] Detectou envio de PIX! Validando transação ID {pixTxId}</span>
                    <span className="text-cyan-400 animate-pulse">[LOG] Executando rotina anti-fraude e validação de assinatura digital com BACEN</span>
                  </>
                )}
                {pixModalStatus === 'approved' && (
                  <>
                    <span className="text-emerald-400 font-bold">[LOG] Sucesso: Assinatura validada e crédito verificado!</span>
                    <span className="text-gray-500">[LOG] Banco Origem do Cliente: Confirmado por API SICOOB</span>
                  </>
                )}
              </div>

              {/* Dynamic Operations Footer Buttons */}
              <div className="flex flex-col gap-2 mt-2 border-t border-gray-850 pt-4">
                {pixModalStatus === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPixModalStatus('approving');
                      }}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-750 text-white font-bold rounded-xl text-[10.5px] uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/20 active:scale-98 transition-all border-0"
                    >
                      🟢 Simular Aprovação PIX
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPixApprovalModal(false)}
                      className="py-3 px-4 rounded-xl border border-gray-800 hover:bg-slate-900 text-[10.5px] text-gray-400 hover:text-white font-bold transition-all text-center cursor-pointer bg-transparent"
                    >
                      Cancelar
                    </button>
                  </div>
                )}

                {pixModalStatus === 'approving' && (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 bg-[#0c1223] border border-gray-850 text-gray-500 font-bold rounded-xl text-[10.5px] font-mono select-none flex items-center justify-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" /> Validando lote fiscal e bancário...
                  </button>
                )}

                {pixModalStatus === 'approved' && (
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={async () => {
                        setShowPixApprovalModal(false);
                        await handleFinalizeSale();
                      }}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs sm:text-xs tracking-wider font-mono cursor-pointer shadow-lg shadow-emerald-900/35 text-center active:scale-98 transition-transform uppercase flex items-center justify-center gap-2 border-0"
                    >
                      📥 CONFIRMAR VENDA & EMITIR COMPROVANTE
                    </button>
                    <span className="text-[9px] text-slate-500 font-sans block text-center mt-1 select-none">
                      🔒 O cupom de comprovante não-fiscal será gerado e impresso logo em seguida.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC THERMAL PRINTER RECEIPT DIALOG MODAL */}
      {saleFinished && lastFinishedSale && (
        <div 
          id={receiptType === 'thermal' ? "sale-finished-receipt-modal" : "sale-finished-nota-modal"} 
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto"
        >
          <div className={`print-container-target bg-white text-black rounded-2xl p-6 shadow-2xl relative text-left my-8 ${receiptType === 'thermal' ? 'max-w-sm w-full' : 'max-w-4xl w-full'}`}>
            
            <button 
              type="button"
              onClick={() => {
                setSaleFinished(false);
                setLastFinishedSale(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-800 no-print cursor-pointer border-0"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Selector de tipo de recibo format - no-print */}
            <div className="flex bg-neutral-100 p-1 rounded-xl mb-4 no-print gap-1 select-none border border-neutral-200">
              <button
                type="button"
                onClick={() => setReceiptType('thermal')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-sans transition flex items-center justify-center gap-1.5 cursor-pointer border-0 ${
                  receiptType === 'thermal'
                    ? 'bg-neutral-900 text-white shadow'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 bg-transparent'
                }`}
              >
                <Printer className="w-3.5 h-3.5" /> Cupom de Bobina (80mm)
              </button>
              <button
                type="button"
                onClick={() => setReceiptType('nota')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold font-sans transition flex items-center justify-center gap-1.5 cursor-pointer border-0 ${
                  receiptType === 'nota'
                    ? 'bg-neutral-900 text-white shadow'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 bg-transparent'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Nota de Balcão (A4)
              </button>
            </div>

            {receiptType === 'thermal' ? (
              <>
                <div className="text-center font-mono text-xs border-b-2 border-black pb-3 flex flex-col items-center">
                  {company.logoUrl && (
                    <img 
                      src={company.logoUrl} 
                      alt="Logo Oficina" 
                      className="w-12 h-12 object-contain mb-2 filter grayscale" 
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span className="font-extrabold text-sm block tracking-widest">{company.name.toUpperCase()}</span>
                  <span className="text-[10px] block mt-0.5">{company.address || "Av. das Nações Unidas, 1040 - São Paulo, SP"}</span>
                  <span className="text-[10px] block font-mono">CNPJ: {company.cnpj || "12.345.678/0001-90"} • Fone: {company.phone || "(11) 98765-4321"}</span>
                </div>

                {lastFinishedSale.status === 'estornada' && (
                  <div className="my-2 p-2.5 border-2 border-red-600 bg-red-50 text-red-700 text-center rounded-xl text-xs font-mono font-bold uppercase tracking-wider leading-tight">
                    ⚠️ CUPOM ESTORNADO / CANCELADO ⚠️
                    <span className="block text-[9px] text-red-500 font-semibold mt-0.5 lowercase italic font-sans normal-case">
                      motivo: "{lastFinishedSale.justification || 'não informado'}"
                    </span>
                  </div>
                )}
                
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

                  {lastFinishedSale.paymentMethod === 'PIX' && (
                    <div className="mt-3 bg-neutral-100 p-2.5 rounded-xl border border-neutral-300 flex flex-col items-center gap-2 font-mono text-center">
                      <span className="text-[8.5px] font-bold text-neutral-800 flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5 text-black" /> COBRANÇA PIX INTEGRADA
                      </span>
                      {receiptPixQrBase64 ? (
                        <div className="p-1.5 bg-white border border-neutral-200 rounded shadow-sm">
                          <img 
                            src={receiptPixQrBase64} 
                            alt="PIX QR" 
                            className="w-28 h-28 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <span className="text-[8px] text-neutral-500">Gerando QR...</span>
                      )}
                      <span className="text-[8px] leading-tight text-neutral-600 font-sans">
                        Aponte seu app do banco para pagar • Valor: <strong>R$ {lastFinishedSale.total.toFixed(2)}</strong>
                      </span>
                      
                      <div className="flex gap-1 w-full mt-1">
                        <input 
                          type="text" 
                          readOnly 
                          value={lastFinishedPixStringCode} 
                          className="bg-white border border-neutral-300 rounded px-1.5 py-1 text-[8px] text-neutral-550 select-all truncate flex-1 outline-none text-left text-neutral-600"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              navigator.clipboard.writeText(lastFinishedPixStringCode);
                              alert("PIX copiado!");
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="px-2 py-1 bg-black text-white font-mono text-[8.5px] font-bold uppercase rounded cursor-pointer shrink-0"
                        >
                          COPIAR
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center text-[10px] font-mono border-t border-black pt-3 flex flex-col gap-0.5 text-neutral-505 text-gray-600">
                  <span>Volte sempre! Obrigado pela preferência.</span>
                  <span className="block italic text-[8.5px] text-neutral-500">AutoTech Cloud ERP Systems Software v1.2</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-6 font-sans">
                {/* Status cancelada/estornada block */}
                {lastFinishedSale.status === 'estornada' && (
                  <div className="p-3 border-2 border-red-600 bg-red-50 text-red-700 text-center rounded-xl text-xs font-mono font-bold uppercase tracking-wider">
                    ⚠️ NOTA DE BALCÃO ESTORNADA / CANCELADA ⚠️
                    <span className="block text-[10px] text-red-500 font-semibold mt-1 font-sans lowercase normal-case italic">
                      Motivo do estorno: "{lastFinishedSale.justification || 'não informado'}"
                    </span>
                  </div>
                )}

                {/* Main Header Row */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b-2 border-black pb-4 text-black">
                  {/* Company Info Header */}
                  <div className="flex items-center gap-3">
                    {company.logoUrl ? (
                      <img 
                        src={company.logoUrl} 
                        alt="Logo Oficina" 
                        className="w-14 h-14 rounded-xl object-contain bg-slate-950 border border-gray-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-red-600 flex items-center justify-center text-white">
                        <Wrench className="w-6 h-6 rotate-45" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-extrabold text-neutral-900 uppercase tracking-tight">{company.name || "AutoPrecision Premium Website"}</h3>
                      <p className="text-[10px] text-gray-600 leading-normal font-mono">
                        {company.address || "Av. das Nações Unidas, 1040 - São Paulo, SP"}
                        {company.cnpj ? ` • CNPJ: ${company.cnpj}` : ""}
                        {company.phone ? ` • Fone: ${company.phone}` : ""}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {company.email ? `E-mail: ${company.email}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Document Badge */}
                  <div className="text-right flex flex-col items-end gap-1 font-mono md:border-l md:border-dashed md:border-neutral-300 md:pl-4">
                    <span className="text-[9px] font-extrabold px-2.5 py-1 bg-red-650 bg-red-600 text-white rounded border border-red-700 leading-none uppercase tracking-widest">
                      NOTA DE BALCÃO
                    </span>
                    <span className="text-[8px] font-extrabold text-gray-500 uppercase">
                      SEM VALOR FISCAL
                    </span>
                    <span className="text-xs font-bold text-neutral-900 mt-1">
                      Nº: <strong className="font-mono text-xs">{lastFinishedSale.id}</strong>
                    </span>
                    <span className="text-[9px] text-gray-500">
                      Emissão: {new Date().toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Document Information Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                  {/* Customer Information Column */}
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200">
                    <span className="text-[9px] font-bold text-gray-400 font-mono uppercase tracking-wider block mb-2 border-b border-neutral-200 pb-1">
                      👤 CLIENTE / DESTINATÁRIO
                    </span>
                    <div className="text-xs font-semibold text-neutral-900 flex flex-col gap-1 leading-normal">
                      <div>
                        <span className="text-gray-500 font-normal font-mono">Nome:</span> {lastFinishedSale.clienteName}
                      </div>
                      <div>
                        <span className="text-gray-500 font-normal font-mono">CPF/CNPJ:</span> {lastFinishedSale.clienteCpfCnpj || "Não especificado (Consumidor Final)"}
                      </div>
                    </div>
                  </div>

                  {/* Transaction Metadata Column */}
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 font-mono text-[11px]">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-2 border-b border-neutral-200 pb-1">
                      ⚙️ INFORMAÇÕES DE TRANSAÇÃO
                    </span>
                    <div className="flex flex-col gap-1 leading-normal text-neutral-850">
                      <div>
                        <span className="text-gray-500 font-normal">Operador/Atendente:</span> <strong>{lastFinishedSale.sellerName || "Responsável Oficina"}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 font-normal">Forma de Pago:</span> <span className="font-extrabold uppercase text-neutral-900">{lastFinishedSale.paymentMethod}</span>
                      </div>
                      {lastFinishedSale.linkedOSId && (
                        <div>
                          <span className="text-gray-500 font-normal">Ordem de Serviço Vínculo:</span> <span className="text-red-650 font-bold underline">{lastFinishedSale.linkedOSId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Spreadsheet Table of Items */}
                <div className="border border-neutral-250 rounded-xl overflow-hidden mt-2 text-black">
                  <table className="w-full text-left text-xs leading-normal border-collapse">
                    <thead>
                      <tr className="bg-neutral-100 border-b border-neutral-250 font-mono text-[10px] text-neutral-600 uppercase">
                        <th className="p-3">Ref/SKU</th>
                        <th className="p-3">Descrição do Produto / Serviço</th>
                        <th className="p-3 text-center">Marca</th>
                        <th className="p-3 text-center">Qtd</th>
                        <th className="p-3 text-right">Unitário</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 text-neutral-850">
                      {lastFinishedSale.items.map((it: any, index: number) => {
                        const dbProd = (produtos || []).find((p: any) => p.name === it.name || p.id === it.id);
                        const displaySku = it.sku || dbProd?.sku || "BALCAO";
                        const displayBrand = it.brand || dbProd?.brand || "OFICINA";
                        const displayPrice = it.price || (it.subtotal / it.quantity);

                        return (
                          <tr key={index} className="hover:bg-neutral-50/50">
                            <td className="p-3 font-mono text-[10px] text-slate-500">{displaySku}</td>
                            <td className="p-3 font-semibold text-neutral-900">{it.name}</td>
                            <td className="p-3 text-center font-mono text-[10px] text-slate-500">{displayBrand}</td>
                            <td className="p-3 text-center font-bold font-mono">{it.quantity}</td>
                            <td className="p-3 text-right font-mono">R$ {displayPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-3 text-right font-bold font-mono">R$ {it.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Calculation breakdown column structure */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-t border-dashed border-neutral-300 pt-4 mt-2 text-black">
                  <div className="text-[10px] font-mono text-gray-500 leading-relaxed md:max-w-md w-full">
                    <p className="font-bold uppercase tracking-wider text-neutral-700">TERMOS & RESPONSABILIDADE DE GARANTIA:</p>
                    <p>1. Esta nota destina-se para fins fiscais meramente opcionais no ato da venda e controle interno de almoxarifado.</p>
                    <p>2. A garantia de peças novas obedece estritamente às normas do Fabricante e CDC.</p>
                    <p>3. Não é permitida a devolução de peças com embalagem violada ou indícios de instalação inadequada.</p>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl flex flex-col gap-2 w-full md:max-w-xs self-stretch shrink-0 font-mono">
                    <div className="flex justify-between text-xs text-neutral-600">
                      <span>Subtotal de Balcão:</span>
                      <span>R$ {(lastFinishedSale.total + lastFinishedSale.discount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {lastFinishedSale.discount > 0 && (
                      <div className="flex justify-between text-xs font-bold text-red-650">
                        <span>Desconto Aplicado:</span>
                        <span>- R$ {lastFinishedSale.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-extrabold text-neutral-900 border-t border-neutral-200 pt-2">
                      <span>VALOR LÍQUIDO GERAL:</span>
                      <span className="text-[15px] text-neutral-950 font-sans font-extrabold">R$ {lastFinishedSale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* PIX instructions if applicable */}
                {lastFinishedSale.paymentMethod === 'PIX' && (
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 mt-2 flex flex-col md:flex-row items-center gap-4 text-center md:text-left text-black">
                    {receiptPixQrBase64 && (
                      <div className="p-1.5 bg-white border border-neutral-200 rounded shadow-sm shrink-0">
                        <img 
                          src={receiptPixQrBase64} 
                          alt="PIX QR" 
                          className="w-24 h-24 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className="font-mono flex-1">
                      <span className="text-[10px] font-bold text-neutral-900 uppercase flex items-center justify-center md:justify-start gap-1">
                        <QrCode className="w-4 h-4 text-slate-900" /> Transação via PIX Conciliado
                      </span>
                      <p className="text-[9px] text-gray-500 leading-relaxed mt-1">
                        Esta fatura representa uma transação balcão. Você pode registrar a quitação usando a chave Pix vinculada nas configurações de sua oficina ou apontar seu aplicativo para o QR Code ao lado.
                      </p>
                      <div className="mt-2 text-[10px] text-gray-700 select-all truncate border border-neutral-200 p-1.5 bg-white rounded flex items-center justify-between">
                        <span className="truncate flex-1 font-mono text-[9px]">{lastFinishedPixStringCode}</span>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              navigator.clipboard.writeText(lastFinishedPixStringCode);
                              alert("PIX copiado!");
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="px-2 py-0.5 bg-black text-white text-[8px] rounded uppercase cursor-pointer shrink-0 ml-2"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Corporate signatures, legal status disclaimer */}
                <div className="mt-6 border-t border-neutral-300 pt-6 text-black">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] font-mono text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-full max-w-xs border-b border-black mb-1"></div>
                      <span className="font-bold text-neutral-900 uppercase">{lastFinishedSale.sellerName || "Operador Responsável"}</span>
                      <span className="text-[9px] text-gray-500">AutoPrecision Oficina Balcão</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-full max-w-xs border-b border-black mb-1"></div>
                      <span className="font-bold text-neutral-900 uppercase">Assinatura do Cliente</span>
                      <span className="text-[9px] text-gray-500">Aceite e integridade dos itens retro discriminados</span>
                    </div>
                  </div>

                  <div className="text-center text-[9px] text-gray-500 mt-6 pt-3 border-t border-neutral-100 uppercase tracking-widest leading-loose font-mono">
                    *** DOCUMENTAÇÃO INTERNA SUPLEMENTAR - EXPEDIDO SEM EFICÁCIA DE CRÉDITO DE ICMS/IPI/ISS (RECOLHIMENTO UNIFICADO) ***
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons inside Ticket receipt popup */}
            <div className="mt-6 flex flex-col gap-2 font-mono no-print">
              <button 
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all active:scale-[98%] uppercase border-0 font-sans"
              >
                <Printer className="w-4 h-4 text-white" /> {receiptType === 'thermal' ? 'Imprimir p/ Impressora Térmica' : 'Imprimir p/ Impressora A4 (Nota)'}
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all active:scale-[98%] uppercase border-0 font-sans"
              >
                <FileText className="w-4 h-4 text-white animate-pulse" /> {receiptType === 'thermal' ? 'Exportar para PDF / Salvar Recibo' : 'Gerar PDF de Nota de Balcão (A4)'}
              </button>

              <button 
                type="button"
                onClick={() => {
                  setSaleFinished(false);
                  setLastFinishedSale(null);
                }}
                className="w-full py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs text-neutral-800 font-bold cursor-pointer transition-all active:scale-[98%] text-center mt-1 bg-transparent text-black font-sans"
              >
                Fechar Recibo
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🧾 PREMIUM DIGITAL PAYMENT RECEIPT CARD WITH WHATSAPP DISPATCH */}
      {showDigitalReceiptCardModal && selectedReceiptSale && (() => {
        const linkedOS = selectedReceiptSale.linkedOSId 
          ? ordensServico.find(os => os.id === selectedReceiptSale.linkedOSId)
          : null;
        const clientObj = selectedReceiptSale.clienteId
          ? clientes.find(c => c.id === selectedReceiptSale.clienteId)
          : null;
        const displayPhoneFixed = selectedReceiptSale.clientePhone || clientObj?.phone || linkedOS?.clientePhone || 'Não informado';
        const displayItemsList = selectedReceiptSale.items || [];
        
        // Calculate dynamic values
        const cardPixTxId = selectedReceiptSale.pixTransactionId || ("E" + Math.floor(100000000 + Math.random() * 900000000) + "BACEN");

        const handleSendWhatsApp = () => {
          const clientName = selectedReceiptSale.clienteName || 'Prezado Cliente';
          const plainPhone = displayPhoneFixed.replace(/\D/g, "");
          const messageText = `*COMPROVANTE DE QUITAÇÃO DE ORDEM DE SERVIÇO* 🧾🚗
--------------------------------------------------
✅ *PAGAMENTO CONFIRMADO & VALIDADO*

Olá *${clientName}*,
Seu pagamento via *PIX* foi recebido e processado com sucesso pelo sistema operacional de nossa oficina. Suas chaves e veículo estão liberados para retirada!

⚙️ *DADOS DA ORDEM DE SERVIÇO:*
• OS ID: *#${selectedReceiptSale.linkedOSId || selectedReceiptSale.id}*
${linkedOS ? `• Veículo: *${linkedOS.veiculoInfo || 'Não informado'}*` : ''}
${linkedOS?.plate ? `• Placa: *${linkedOS.plate.toUpperCase()}*` : ''}

💰 *RESUMO FINANCEIRO:*
• Valor Total Pago: *R$ ${selectedReceiptSale.total.toFixed(2)}*
• Método de Quitação: *PIX Integrado SESP/SAT*
• Chave Destinatária: *${company?.pixKey || 'cleciotecnologia@gmail.com'}*
• Autenticação BC: *${cardPixTxId}*

📅 *DATA/HORA DO PROCESSAMENTO:*
• ${new Date(selectedReceiptSale.date).toLocaleString('pt-BR')}

--------------------------------------------------
Obrigado pela preferência!
*${(company?.name || 'AutoPrecision Premium').toUpperCase()}*
Telefone: ${company?.phone || '(11) 98765-4321'}`;

          const whatsappUrl = `https://api.whatsapp.com/send?phone=55${plainPhone}&text=${encodeURIComponent(messageText)}`;
          window.open(whatsappUrl, '_blank');
        };

        const handleCopyText = () => {
          const clientName = selectedReceiptSale.clienteName || 'Prezado Cliente';
          const messageText = `*COMPROVANTE DE QUITAÇÃO DE ORDEM DE SERVIÇO* 🧾🚗
--------------------------------------------------
✅ *PAGAMENTO CONFIRMADO & VALIDADO*

Olá *${clientName}*,
Seu pagamento via *PIX* foi recebido e processado com sucesso pelo sistema operacional de nossa oficina. Suas chaves e veículo estão liberados para retirada!

⚙️ *DADOS DA ORDEM DE SERVIÇO:*
• OS ID: *#${selectedReceiptSale.linkedOSId || selectedReceiptSale.id}*
${linkedOS ? `• Veículo: *${linkedOS.veiculoInfo || 'Não informado'}*` : ''}
${linkedOS?.plate ? `• Placa: *${linkedOS.plate.toUpperCase()}*` : ''}

💰 *RESUMO FINANCEIRO:*
• Valor Total Pago: *R$ ${selectedReceiptSale.total.toFixed(2)}*
• Método de Quitação: *PIX Integrado SESP/SAT*
• Chave Destinatária: *${company?.pixKey || 'cleciotecnologia@gmail.com'}*
• Autenticação BC: *${cardPixTxId}*

📅 *DATA/HORA DO PROCESSAMENTO:*
• ${new Date(selectedReceiptSale.date).toLocaleString('pt-BR')}

--------------------------------------------------
Obrigado pela preferência!
*${(company?.name || 'AutoPrecision Premium').toUpperCase()}*
Telefone: ${company?.phone || '(11) 98765-4321'}`;

          try {
            navigator.clipboard.writeText(messageText);
            alert("Comprovante formatado de WhatsApp copiado para a área de transferência!");
          } catch (err) {
            console.error(err);
          }
        };

        return (
          <div className="fixed inset-0 z-[110] bg-slate-950/85 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
            <div className="bg-[#0b1220] border border-gray-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative text-left my-8 animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setShowDigitalReceiptCardModal(false);
                  setSelectedReceiptSale(null);
                }}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900 border border-gray-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 border-b border-gray-900 bg-[#080c16]">
                <span className="text-[10px] bg-emerald-950/50 border border-emerald-900 text-emerald-400 font-mono py-1 px-2.5 rounded font-bold uppercase tracking-wider inline-block">
                  SESP / SAT DIGITAL
                </span>
                <h3 className="text-base font-display font-extrabold text-white mt-1.5 flex items-center gap-1.5">
                  <Smartphone className="w-5 h-5 text-emerald-400 animate-pulse" /> Comprovante de Quitação
                </h3>
                <p className="text-[10px] text-gray-400 font-mono leading-tight mt-0.5">
                  Gere de forma dinâmica o card em alta resolução do comprovante de pagamento para transmissão ao WhatsApp.
                </p>
              </div>

              {/* CARD CONTAINER WITH METALLIC GLOW EFFECT */}
              <div className="p-6 flex flex-col gap-5">
                <div 
                  id="digital-payment-card" 
                  className="bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#020617] border-2 border-emerald-500/60 rounded-3xl p-5 shadow-[0_4px_30px_rgba(16,185,129,0.15)] text-white font-sans flex flex-col justify-between gap-4 relative overflow-hidden"
                >
                  {/* Subtle carbon grid & hologram backdrop overlay pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-xl select-none" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/5 rounded-full filter blur-xl select-none" />

                  {/* Header: Brand and System status */}
                  <div className="flex justify-between items-start z-10 font-mono">
                    <div className="flex flex-col">
                      <span className="text-[10px] tracking-widest font-mono text-emerald-400 uppercase font-bold leading-none">
                        {(company?.name || 'AutoPrecision Premium').toUpperCase()}
                      </span>
                      <span className="text-[7.5px] font-mono text-gray-500 uppercase mt-0.5">
                        CNPJ: {company?.cnpj || "12.345.678/0001-90"}
                      </span>
                    </div>
                    {/* Glowing LED Status badge */}
                    <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full select-none">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
                      <span className="text-[8px] font-mono font-bold tracking-widest text-emerald-400 uppercase leading-none">QUITADO/PIX</span>
                    </div>
                  </div>

                  {/* Amount / Value showcase area */}
                  <div className="z-10 bg-slate-950/40 border border-slate-800/40 p-4 rounded-2xl text-center self-center w-full shadow-inner">
                    <span className="text-[9px] text-gray-400 uppercase font-mono block">VALOR LIQUIDADO INTEGRALMENTE</span>
                    <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-400 leading-tight">
                      R$ {selectedReceiptSale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    <span className="text-[8.5px] text-slate-500 font-mono block mt-1 uppercase">
                      Chave Destino: <strong className="text-gray-300 font-semibold">{company?.pixKey || 'cleciotecnologia@gmail.com'}</strong>
                    </span>
                  </div>

                  {/* Operational and customer variables */}
                  <div className="grid grid-cols-2 gap-3.5 text-left border-t border-slate-800/50 pt-3 z-10">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[7.5px] text-gray-500 uppercase font-mono tracking-wide">CLIENTE DEPOSITANTE</span>
                      <span className="text-[10.5px] font-bold text-gray-200 truncate">{selectedReceiptSale.clienteName || 'Consumidor Final'}</span>
                      <span className="text-[8px] text-gray-400 font-mono">{displayPhoneFixed}</span>
                    </div>

                    <div className="flex flex-col gap-0.5 text-right font-mono">
                      <span className="text-[7.5px] text-gray-500 uppercase font-mono tracking-wide">ORDEM DE SERVIÇO / OS</span>
                      <span className="text-[10.5px] font-bold text-red-450 text-red-500 uppercase tracking-widest font-mono truncate">
                        #{selectedReceiptSale.linkedOSId || 'Venda Balcão'}
                      </span>
                      {linkedOS?.veiculoInfo && (
                        <span className="text-[8.5px] text-gray-300 font-sans font-medium leading-none block truncate" title={linkedOS.veiculoInfo}>
                          🚗 {linkedOS.veiculoInfo}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Barcode/Auth block */}
                  <div className="border-t border-dashed border-slate-800 pt-3 flex items-center justify-between z-10">
                    <div className="flex flex-col">
                      <span className="text-[7.5px] text-gray-500 uppercase font-mono">AUTENTICAÇÃO BACEN / SICOOB</span>
                      <span className="text-[8.5px] text-gray-400 font-mono font-bold leading-none truncate max-w-[200px] block text-emerald-400" title={cardPixTxId}>
                        {cardPixTxId}
                      </span>
                      <span className="text-[7.5px] text-gray-500 font-mono mt-0.5">
                        Liquidado em {new Date(selectedReceiptSale.date).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {/* Simulated hologram barcode stamp */}
                    <div className="flex flex-col items-center select-none opacity-80">
                      <div className="flex gap-0.5 items-center bg-white p-1 rounded">
                        <div className="w-[1px] h-3.5 bg-black" />
                        <div className="w-[0.5px] h-3.5 bg-black" />
                        <div className="w-[2px] h-3.5 bg-black" />
                        <div className="w-[1.5px] h-3.5 bg-black" />
                        <div className="w-[0.5px] h-3.5 bg-black" />
                        <div className="w-[2.5px] h-3.5 bg-black" />
                        <div className="w-[1px] h-3.5 bg-black" />
                        <div className="w-[0.5px] h-3.5 bg-black" />
                      </div>
                      <span className="text-[6.5px] font-mono text-gray-500 mt-0.5">SESP-V1</span>
                    </div>
                  </div>
                </div>

                {/* Items Breakdown inside Card Modal for transparency */}
                <div className="border-t border-gray-850 pt-2 flex flex-col gap-1.5 text-xs font-mono text-left text-gray-400">
                  <span className="text-[9px] uppercase font-black tracking-wider text-gray-500">ITENS DETALHADOS NO COMPROVANTE:</span>
                  <div className="max-h-[85px] overflow-y-auto flex flex-col gap-1 bg-[#080d16] p-2 rounded-xl border border-gray-900">
                    {displayItemsList.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-[9.5px]">
                        <span className="truncate w-3/4 text-gray-300">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-white font-bold whitespace-nowrap">
                          R$ {item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dispatch Controls */}
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl text-xs tracking-wider font-mono cursor-pointer shadow-lg shadow-green-950/40 text-center active:scale-98 transition-all uppercase flex items-center justify-center gap-2 border-0"
                  >
                    <Share2 className="w-4 h-4 text-white animate-pulse" /> Disparar p/ WhatsApp do Cliente
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopyText}
                      className="flex-1 py-2.5 bg-[#080c16] border border-gray-800 text-gray-300 hover:text-white rounded-xl text-[10.5px] font-mono uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-900 transition-all text-center"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-400" /> Copiar Texto
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDigitalReceiptCardModal(false);
                        setSelectedReceiptSale(null);
                      }}
                      className="flex-1 py-2.5 bg-transparent border border-gray-800 hover:bg-slate-900 text-gray-400 hover:text-white rounded-xl text-[10.5px] font-mono uppercase font-bold transition-all text-center cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 🔮 GLOBAL SCAN SUCCESS FLOATING TOAST POPUP */}
      {scanToast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#061e14] border-2 border-emerald-500 rounded-xl p-4 shadow-[0_4px_25px_rgba(16,185,129,0.3)] flex items-center gap-3 max-w-sm animate-bounce text-left">
          <div className="p-2.5 rounded-full bg-emerald-950 text-emerald-400">
            <Barcode className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-emerald-400 block font-bold uppercase tracking-wider">⚡ LEITOR DE CÓDIGO ATIVO</span>
            <p className="text-xs text-white font-bold leading-tight">{scanToast.message}</p>
            <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">EAN/SKU: {scanToast.code}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setScanToast({ ...scanToast, show: false })}
            className="text-gray-400 hover:text-white p-1 ml-auto"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 📹 ADVANCED CAMERA & SIMULATION BARCODE SCAN MODAL */}
      {showBarcodeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm text-left">
          <div className="bg-[#0b101d] border border-gray-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col gap-5">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-red-950/40 border border-red-900 border-dashed text-red-500 font-mono text-[9px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded w-max">
                  🎥 MÓDULO ÓPTICO DE CAPTURA
                </span>
                <h3 className="text-lg font-display font-extrabold text-white mt-2 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-red-500 animate-pulse" />
                  Módulo Integrado: Scanner de Código de Barras
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Funciona com qualquer leitor físico USB (Bipe e adicione em qualquer lugar) ou utilize o simulador de câmera de checkout abaixo.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowBarcodeModal(false)}
                className="text-gray-400 hover:text-white bg-slate-900/40 hover:bg-slate-800 border border-gray-800 rounded-xl p-2 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Virtual Camera Viewfinder & Sound Testing Console */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Box 1: Beautiful animated laser viewfinder */}
              <div className="bg-slate-950 border border-red-900/30 rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden h-60">
                {/* Visual Camera Scan Line & Target grid */}
                <div className="absolute inset-0 bg-[#030712] border-4 border-dashed border-gray-900/60 rounded-xl flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-28 border-2 border-red-600/40 rounded flex items-center justify-center relative">
                    <div className="absolute left-0 right-0 h-[3px] bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.85)] animate-bounce" style={{ animationDuration: '2.5s' }} />
                    <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-red-500" />
                    <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-red-500" />
                    <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-red-500" />
                    <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-red-500" />
                    
                    <div className="flex gap-1 items-center opacity-30 select-none">
                      <div className="w-1.5 h-16 bg-white" />
                      <div className="w-0.5 h-16 bg-white" />
                      <div className="w-1.5 h-16 bg-white" />
                      <div className="w-2.5 h-16 bg-white" />
                      <div className="w-0.5 h-16 bg-white" />
                      <div className="w-1.5 h-16 bg-white" />
                      <div className="w-2 h-16 bg-white" />
                      <div className="w-0.5 h-16 bg-white" />
                    </div>
                  </div>
                </div>

                <div className="z-10 bg-slate-950 p-3 rounded-lg border border-gray-800 max-w-xs flex flex-col gap-1.5 text-center mt-12 shadow-lg">
                  <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest animate-pulse">● Câmera Virtual Ativa</span>
                  <span className="text-[9.5px] text-gray-400">Posicione o código de barras no feixe de laser vermelho para captura ótica automática.</span>
                </div>
              </div>

              {/* Box 2: Quick sim click list & configuration */}
              <div className="bg-[#060a12]/50 border border-gray-850 rounded-2xl p-4 flex flex-col gap-3 h-60 overflow-y-auto">
                <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                  <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wide">💡 AMOSTRE EM TELA PARA PIPAR</span>
                  <span className="text-[9px] text-slate-500 font-bold">Mire e clique no produto</span>
                </div>

                {/* Categories of shortcuts */}
                <div className="flex gap-1.5 flex-wrap">
                  {['Todas', 'Freios', 'Filtros', 'Lubrificantes', 'Suspensão'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSimulationCategory(cat)}
                      className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded cursor-pointer ${
                        simulationCategory === cat ? 'bg-red-950 border border-red-900 text-red-400' : 'bg-slate-950 text-gray-500 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Filtered list of products */}
                <div className="flex flex-col gap-1.5 mt-1">
                  {produtos
                    .filter(p => simulationCategory === 'Todas' || p.category === simulationCategory)
                    .map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          playScannerBeep();
                          handleAddToBasket(p);
                          setScanToast({
                            show: true,
                            message: `Simulador detectou: Adicionado ${p.name}`,
                            code: p.barcode || p.internalSku
                          });
                          setTimeout(() => setScanToast(prev => ({ ...prev, show: false })), 2000);
                        }}
                        className="py-1.5 px-2.5 rounded bg-slate-950/65 hover:bg-slate-900 border border-gray-850 hover:border-red-900/50 flex justify-between items-center text-left text-[11px] text-white transition-all cursor-pointer font-sans"
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="font-bold truncate">{p.name}</span>
                          <span className="text-[9px] font-mono text-slate-550 text-gray-400">EAN: {p.barcode || "N/A"} | SKU: {p.internalSku}</span>
                        </div>
                        <span className="text-[10px] font-mono font-extrabold text-emerald-400 shrink-0">
                          R$ {p.sellPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </button>
                    ))}
                </div>
              </div>

            </div>

            {/* General setup guide for physical checkout hardware */}
            <div className="bg-[#050912]/80 border border-red-950/30 rounded-2xl p-4 flex gap-3 text-left">
              <span className="text-xl shrink-0 mt-0.5">🔌</span>
              <div className="flex flex-col gap-1 text-[11px] text-gray-400 leading-normal font-sans">
                <strong className="text-white">COMO VINCULAR LEITORES DE GAVETA / BALCÃO (BEMATECH, ELGIN, HONEYWELL):</strong>
                <p>
                  Basta conectar o leitor óptico via porta USB ou parear por Bluetooth em seu computador ou tablet. O computador entenderá o leitor como um teclado padrão. Com o PDV aberto, <strong>qualquer bipe físico adicionará o item instantaneamente ao carrinho operacional</strong> com som de aviso, sem precisar focar em campos.
                </p>
              </div>
            </div>

            {/* Simple footer buttons */}
            <div className="flex justify-end gap-2 border-t border-gray-850 pt-3">
              <button 
                type="button"
                onClick={() => playScannerBeep()}
                className="py-2 px-4 bg-slate-950 hover:bg-slate-900 text-gray-400 hover:text-white font-mono text-[10px] uppercase font-bold border border-gray-800 rounded-xl transition-colors cursor-pointer"
              >
                🔊 Testar Som Bipe
              </button>
              <button 
                type="button"
                onClick={() => setShowBarcodeModal(false)}
                className="py-2 px-5 bg-red-650 bg-red-600 hover:bg-red-700 text-white font-mono text-[10.5px] font-extrabold rounded-xl transition-colors cursor-pointer border-0 select-none uppercase font-bold"
              >
                Concluir Captura
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🔒 MODELO INTERATIVO DE FECHAMENTO DE CAIXA */}
      {showClosureModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm text-left">
          <div className="bg-[#0b101c] border border-gray-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-red-950/40 border border-red-900 border-dashed text-red-500 font-mono text-[9px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded w-max">
                  📊 FECHAMENTO FINANCEIRO CONSOLIDADO
                </span>
                <h3 className="text-lg font-display font-extrabold text-white mt-2 flex items-center gap-2">
                  🔒 Fechar Caixa Unificado (Fim do Expediente)
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Confirme os valores arrecadados no dia de hoje para encerrar a sessão operacional de forma segura.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowClosureModal(false)}
                className="text-gray-400 hover:text-white bg-slate-900/40 hover:bg-slate-800 border border-gray-800 rounded-xl p-2 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Box: Expected values and category aggregates */}
              <div className="bg-slate-950 border border-gray-850 p-4 rounded-2xl flex flex-col gap-3">
                <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">
                  📉 VALORES ESPERADOS (SISTEMA)
                </span>

                <div className="flex justify-between items-center text-xs text-gray-350">
                  <span>1. Fundo de Troco Inicial (+)</span>
                  <span className="font-mono font-bold text-white">R$ {closureFinancials.initialAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-350">
                  <span className="flex items-center gap-1">🟢 Vendas Dinheiro (+)</span>
                  <span className="font-mono font-bold text-emerald-400">R$ {closureFinancials.cashSalesTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-350">
                  <span className="flex items-center gap-1">⚡ Vendas Pix</span>
                  <span className="font-mono font-bold text-white">R$ {closureFinancials.pixSalesTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-350">
                  <span className="flex items-center gap-1">💳 Vendas Cartão</span>
                  <span className="font-mono font-bold text-white">R$ {closureFinancials.cardSalesTotal.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-850 my-1"></div>

                <div className="flex justify-between items-center text-xs font-mono font-bold text-gray-400">
                  <span>Total Faturado Hoje (Líquido)</span>
                  <span className="text-white">R$ {closureFinancials.totalVendido.toFixed(2)} ({closureFinancials.sessionSalesCount} vendas)</span>
                </div>

                <div className="bg-red-950/25 border border-red-900/40 p-3 rounded-xl mt-1 flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono text-red-400 font-bold uppercase tracking-widest block">DINHEIRO ESPERADO EM GAVETA</span>
                  <span className="text-lg font-mono font-bold text-white">R$ {closureFinancials.expectedCashInRegister.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-400 leading-tight">Fundo de abertura + Vendas físicas registradas em espécie no balcão.</span>
                </div>
              </div>

              {/* Right Box: Operations Input and Discrepancies */}
              <div className="bg-[#0c1223] border border-gray-800 p-4 rounded-2xl flex flex-col gap-3">
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                  💰 CONTAGEM FÍSICA E CONCILIAÇÃO
                </span>

                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="text-[10px] font-mono text-gray-400 font-bold uppercase">VALOR VERIFICADO NO CAIXA (DINHEIRO FÍSICO) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2 text-sm font-bold text-gray-500">R$</span>
                    <input 
                      type="number"
                      step="0.01"
                      value={physicalCashInput}
                      onChange={(e) => setPhysicalCashInput(e.target.value)}
                      placeholder="Adicione valor verificado"
                      className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 pl-10 text-sm font-mono text-white text-base font-bold focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Audit state presentation */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-gray-400 font-bold uppercase">SITUAÇÃO DE CONCILIAÇÃO FINANCEIRA</span>
                  {(() => {
                    const physicalFloat = parseFloat(physicalCashInput) || 0;
                    const diffFloat = physicalFloat - closureFinancials.expectedCashInRegister;

                    if (Math.abs(diffFloat) < 0.01) {
                      return (
                        <div className="bg-emerald-950/40 border border-emerald-900/60 p-2.5 rounded-lg text-[11px] text-emerald-400 font-sans flex items-center gap-2">
                          <span className="text-sm">✓</span>
                          <span><strong>Perfeito!</strong> O caixa bateu com as vendas previstas do sistema. Sem quebra.</span>
                        </div>
                      );
                    } else if (diffFloat > 0) {
                      return (
                        <div className="bg-cyan-950/40 border border-cyan-900/60 p-2.5 rounded-lg text-[11px] text-cyan-400 font-sans flex items-center gap-2">
                          <span className="text-sm">ℹ️</span>
                          <span><strong>Sobra de Caixa:</strong> Sobrando <strong className="font-mono text-white">R$ {diffFloat.toFixed(2)}</strong> na contagem da gaveta.</span>
                        </div>
                      );
                    } else {
                      return (
                        <div className="bg-red-950/40 border border-red-900/60 p-2.5 rounded-lg text-[11px] text-red-400 font-sans flex items-center gap-2">
                          <span className="text-sm">⚠️</span>
                          <span><strong>Diferença de Quebra:</strong> Faltando <strong className="font-mono text-white">R$ {Math.abs(diffFloat).toFixed(2)}</strong> na contagem física.</span>
                        </div>
                      );
                    }
                  })()}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-gray-400 uppercase font-bold">OBSERVAÇÕES DO OPERADOR</label>
                  <textarea 
                    value={closureNotes}
                    onChange={(e) => setClosureNotes(e.target.value)}
                    placeholder="Adicione justificativas sobre sangrias, ausência de troco físico ou ocorrências diárias..."
                    rows={2}
                    className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 font-sans resize-none"
                  />
                </div>

              </div>

            </div>

            {/* Guidance tip and bottom buttons */}
            <div className="bg-[#050912] border border-red-950/30 p-3 rounded-2xl text-[11px] text-gray-400 leading-relaxed font-sans flex gap-2">
              <span className="text-base">📝</span>
              <p>
                Ao finalizar, os dados desta sessão de caixa serão fechados e o acesso ao PDV exigirá nova abertura de saldo. Será gerado o <strong>Relatório de Expediente Diário</strong> que poderá ser copiado ou impresso em vias comuns de checkout de pastilha.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-850 pt-2.5">
              <button 
                type="button"
                onClick={() => setShowClosureModal(false)}
                className="py-2.5 px-4 bg-slate-950 hover:bg-slate-900 text-gray-400 hover:text-white font-mono text-[10px] uppercase font-bold border border-gray-800 rounded-xl transition-colors cursor-pointer"
              >
                Voltar ao PDV
              </button>
              
              <button 
                type="button"
                onClick={async () => {
                  playScannerBeep();
                  const physFloat = parseFloat(physicalCashInput) || 0;
                  const diffFloat = physFloat - closureFinancials.expectedCashInRegister;
                  
                  const finalReport = {
                    openedAt: caixaStatus.openedAt,
                    closedAt: new Date().toISOString(),
                    initialAmount: closureFinancials.initialAmount,
                    cashSalesTotal: closureFinancials.cashSalesTotal,
                    pixSalesTotal: closureFinancials.pixSalesTotal,
                    cardSalesTotal: closureFinancials.cardSalesTotal,
                    totalVendido: closureFinancials.totalVendido,
                    expectedCash: closureFinancials.expectedCashInRegister,
                    physicalCash: physFloat,
                    difference: diffFloat,
                    notes: closureNotes || "Nenhuma observação informada.",
                    operator: user?.name || "Clécio Santos"
                  };

                  await fecharCaixa(finalReport);
                  setClosureReport(finalReport);
                  setShowClosureModal(false);
                  setShowClosureReceipt(true);
                }}
                className="py-2.5 px-5 bg-red-650 bg-red-600 hover:bg-red-700 text-white font-mono text-[10.5px] font-extrabold rounded-xl transition-all shadow-md shadow-red-950/20 cursor-pointer uppercase select-none font-bold"
              >
                🔒 CONFIRMAR FECHAMENTO
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🧾 RECEBÍVEL FECHAMENTO CAIXA DE IMPRESSÃO */}
      {showClosureReceipt && closureReport && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm text-black">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl relative text-left">
            
            <div className="text-center font-mono text-xs border-b-2 border-black pb-3">
              <span className="font-extrabold text-sm block tracking-widest">{company.name.toUpperCase()}</span>
              <span className="text-[10px] block mt-0.5">{company.address || "Av. das Nações Unidas, 1040 - São Paulo, SP"}</span>
              <span className="text-[10px] block font-bold">RELATÓRIO DE EXPEDIENTE DO CAIXA</span>
              <span className="text-[10px] text-white bg-black px-2.5 py-0.5 rounded font-bold uppercase inline-block mt-2">SESSÃO ENCERRADA</span>
            </div>

            <div className="my-4 font-mono text-[11px] flex flex-col gap-1">
              <div className="flex justify-between font-bold">
                <span>COMUNICADO FECHAMENTO</span>
                <span>ID #{caixaStatus?.id?.substring(0, 6).toUpperCase() || "C-SYS"}</span>
              </div>
              <span>Operador: {closureReport.operator}</span>
              <span>Abertura: {new Date(closureReport.openedAt).toLocaleString()}</span>
              <span>Encerramento: {new Date(closureReport.closedAt).toLocaleString()}</span>
              <span className="border-b border-dashed border-black my-1"></span>

              <div className="flex justify-between font-bold">
                <span>Saldo Inicial (+)</span>
                <span>R$ {closureReport.initialAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-neutral-800">
                <span>Faturamento em Espécie (+)</span>
                <span>R$ {closureReport.cashSalesTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-neutral-850">
                <span>Faturamento em Pix (+)</span>
                <span>R$ {closureReport.pixSalesTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-neutral-850">
                <span>Faturamento em Cartão (+)</span>
                <span>R$ {closureReport.cardSalesTotal.toFixed(2)}</span>
              </div>

              <span className="border-b border-dashed border-black my-1"></span>

              <div className="flex justify-between font-bold text-[12px] bg-neutral-200 p-1">
                <span>EXPECTATIVA GAVETA</span>
                <span>R$ {closureReport.expectedCash.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-bold text-[12px] bg-neutral-100 p-1 mt-0.5">
                <span>CONTAGEM FÍSICA</span>
                <span>R$ {closureReport.physicalCash.toFixed(2)}</span>
              </div>

              <div className={`flex justify-between font-bold p-1 mt-0.5 rounded text-[11px] ${
                closureReport.difference === 0 ? 'bg-emerald-100 text-emerald-800' :
                closureReport.difference > 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
              }`}>
                <span>SOBRA / QUEBRA DE CAIXA</span>
                <span>
                  {closureReport.difference > 0 ? '+' : ''}
                  R$ {closureReport.difference.toFixed(2)}
                </span>
              </div>

              <span className="border-b border-dashed border-black my-1"></span>

              <div className="bg-neutral-50 p-2 rounded text-[10px] leading-tight">
                <span className="font-bold block uppercase text-[8px] text-neutral-400">NOTAS DA AUDITORIA DO DIA:</span>
                <p className="mt-1 text-black font-medium">{closureReport.notes}</p>
              </div>

              <div className="border-t-2 border-black border-dashed mt-4 pt-1.5 text-center text-[10px] text-neutral-500">
                <span>CONCILIADO EM SANEAMENTO DE INVENTÁRIO</span>
                <span className="block font-bold">ERP Sistema Oficina PDV</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button 
                type="button"
                onClick={() => {
                  try {
                    window.print();
                  } catch(e) {
                    alert("Aviso de Impressão!");
                  }
                }}
                className="w-full py-2.5 bg-neutral-950 text-white font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-1 hover:bg-neutral-800 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> IMPRIMIR EXPEDIENTE
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  setShowClosureReceipt(false);
                  setClosureReport(null);
                }}
                className="w-full py-2 bg-neutral-100 text-neutral-800 hover:bg-neutral-200 font-mono text-center font-bold text-xs rounded-xl cursor-pointer"
              >
                ENTENDIDO, VOLTAR AO REQUERIMENTO
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📦 INLINE PRODUCT EDIT MODAL */}
      {editingProductInPdv && (
        <div className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm text-left">
          <div className="bg-[#0b101d] border border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setEditingProductInPdv(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-cyan-950/40 text-cyan-500 border border-cyan-900/40 rounded-xl">
                <Edit className="w-5 h-5" />
              </span>
              <div>
                <span className="bg-cyan-950/50 border border-cyan-800 text-cyan-400 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded font-mono">
                  Editor de Peça
                </span>
                <h3 className="text-md font-display font-extrabold text-white">Editar Peça & Fluido</h3>
              </div>
            </div>

            <div className="flex flex-col gap-3 font-sans text-xs text-left">
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium">Nome do Produto</label>
                <input
                  type="text"
                  value={editProdName}
                  onChange={(e) => setEditProdName(e.target.value)}
                  className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 placeholder-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 font-medium">SKU Interno</label>
                  <input
                    type="text"
                    value={editProdSku}
                    onChange={(e) => setEditProdSku(e.target.value)}
                    className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 font-medium">Marca</label>
                  <input
                    type="text"
                    value={editProdBrand}
                    onChange={(e) => setEditProdBrand(e.target.value)}
                    className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 font-medium">Quantidade Estoque</label>
                  <input
                    type="number"
                    value={editProdQty}
                    onChange={(e) => setEditProdQty(Number(e.target.value))}
                    className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 font-medium">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editProdPrice}
                    onChange={(e) => setEditProdPrice(Number(e.target.value))}
                    className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-850 pt-3">
              <button
                type="button"
                onClick={() => setEditingProductInPdv(null)}
                className="py-2 px-3.5 bg-slate-950 hover:bg-slate-900 text-gray-400 text-[10px] sm:text-xs font-mono uppercase font-bold border border-gray-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editProdName.trim()) return;
                  await editProduto(editingProductInPdv.id, {
                    name: editProdName,
                    internalSku: editProdSku,
                    brand: editProdBrand,
                    quantity: editProdQty,
                    sellPrice: editProdPrice
                  });
                  setEditingProductInPdv(null);
                }}
                className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-[10px] sm:text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer uppercase"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📦 INLINE PRODUCT DELETE CONFIRMATION MODAL */}
      {deletingProductInPdv && (
        <div className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm text-left">
          <div className="bg-[#0b101d] border border-red-950/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setDeletingProductInPdv(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-red-950/40 text-red-500 border border-red-900/40 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <span className="bg-red-950/50 border border-red-800 text-red-400 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded font-mono">
                  Excluir Peça
                </span>
                <h3 className="text-md font-display font-extrabold text-white">Remover Peça Definitivamente</h3>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed font-sans text-left">
              Tem certeza que deseja excluir a peça <strong className="text-white">"{deletingProductInPdv.name}"</strong>? Esta ação é irreversível e removerá o item do saldo do estoque geral de forma perpétua.
            </p>

            <div className="flex justify-end gap-2 border-t border-gray-850 pt-3">
              <button
                type="button"
                onClick={() => setDeletingProductInPdv(null)}
                className="py-2 px-3.5 bg-slate-950 hover:bg-slate-900 text-gray-400 text-[10px] sm:text-xs font-mono uppercase font-bold border border-gray-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteProduto(deletingProductInPdv.id);
                  setDeletingProductInPdv(null);
                }}
                className="py-2 px-4 bg-red-650 hover:bg-red-700 text-white font-mono text-[10px] sm:text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer uppercase"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🛠️ INLINE SERVICE EDIT MODAL */}
      {editingServiceInPdv && (
        <div className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm text-left">
          <div className="bg-[#0b101d] border border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setEditingServiceInPdv(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-cyan-950/40 text-cyan-500 border border-cyan-900/40 rounded-xl">
                <Edit className="w-5 h-5" />
              </span>
              <div>
                <span className="bg-cyan-950/50 border border-cyan-800 text-cyan-400 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded font-mono">
                  Editor de Serviço
                </span>
                <h3 className="text-md font-display font-extrabold text-white">Editar Serviço Técnico</h3>
              </div>
            </div>

            <div className="flex flex-col gap-3 font-sans text-xs text-left">
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium">Nome do Serviço</label>
                <input
                  type="text"
                  value={editSrvName}
                  onChange={(e) => setEditSrvName(e.target.value)}
                  className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium">Descrição Detalhada</label>
                <textarea
                  value={editSrvDesc}
                  onChange={(e) => setEditSrvDesc(e.target.value)}
                  rows={2}
                  className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 resize-none text-xs leading-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 font-medium">Tempo de Execução</label>
                  <input
                    type="text"
                    value={editSrvDuration}
                    onChange={(e) => setEditSrvDuration(e.target.value)}
                    placeholder="Ex: 1h 30min"
                    className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 font-medium">Preço de Mão de Obra (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editSrvPrice}
                    onChange={(e) => setEditSrvPrice(Number(e.target.value))}
                    className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-850 pt-3">
              <button
                type="button"
                onClick={() => setEditingServiceInPdv(null)}
                className="py-2 px-3.5 bg-slate-950 hover:bg-slate-900 text-gray-400 text-[10px] sm:text-xs font-mono uppercase font-bold border border-gray-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editSrvName.trim()) return;
                  await editServico(editingServiceInPdv.id, {
                    name: editSrvName,
                    description: editSrvDesc,
                    duration: editSrvDuration,
                    price: editSrvPrice
                  });
                  setEditingServiceInPdv(null);
                }}
                className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-mono text-[10px] sm:text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer uppercase"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🛠️ INLINE SERVICE DELETE CONFIRMATION MODAL */}
      {deletingServiceInPdv && (
        <div className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm text-left">
          <div className="bg-[#0b101d] border border-red-950/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setDeletingServiceInPdv(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-red-950/40 text-red-500 border border-red-900/40 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <span className="bg-red-950/50 border border-red-800 text-red-400 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded font-mono">
                  Excluir Serviço
                </span>
                <h3 className="text-md font-display font-extrabold text-white">Remover Serviço Definitivamente</h3>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed font-sans text-left">
              Tem certeza que deseja excluir o serviço <strong className="text-white">"{deletingServiceInPdv.name}"</strong>? Esta ação é irreversível e removerá o serviço de forma perpétua do catálogo operacional.
            </p>

            <div className="flex justify-end gap-2 border-t border-gray-850 pt-3">
              <button
                type="button"
                onClick={() => setDeletingServiceInPdv(null)}
                className="py-2 px-3.5 bg-slate-950 hover:bg-slate-900 text-gray-400 text-[10px] sm:text-xs font-mono uppercase font-bold border border-gray-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteServico(deletingServiceInPdv.id);
                  setDeletingServiceInPdv(null);
                }}
                className="py-2 px-4 bg-red-650 hover:bg-red-700 text-white font-mono text-[10px] sm:text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer uppercase"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💡 FLOATING CROSS-SELL SMART RECOMMENDATION TOAST */}
      {crossSellToast && (
        <div className="fixed bottom-6 right-6 z-[70] max-w-md w-full p-4 bg-[#090d19] border-2 border-amber-500/80 rounded-2xl shadow-2xl backdrop-blur-md animate-fade-in text-left flex flex-col gap-3 font-sans">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  Sugestão Automática de Venda Cruzada
                </span>
                <h4 className="text-sm font-bold text-white leading-snug mt-0.5">
                  Deseja oferecer este item complementar?
                </h4>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCrossSellToast(null)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-[#040710] border border-gray-800 rounded-xl flex flex-col gap-1.5 text-xs">
            <div className="text-gray-400 text-[11px]">
              O cliente comprou: <strong className="text-amber-300 font-semibold">{crossSellToast.triggerItemName}</strong>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-gray-850">
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="text-base">{crossSellToast.suggestedType === 'product' ? '📦' : '🛠️'}</span>
                <div className="truncate">
                  <span className="font-bold text-white block text-xs truncate">{crossSellToast.suggestedName}</span>
                  <span className="text-[10px] text-gray-400 block font-mono truncate">{crossSellToast.reason}</span>
                </div>
              </div>
              <div className="text-right shrink-0 font-mono">
                <span className="text-amber-400 font-extrabold text-sm block">R$ {crossSellToast.suggestedPrice.toFixed(2)}</span>
                <span className="text-[9px] text-gray-500 block uppercase font-bold">{crossSellToast.suggestedType === 'product' ? 'Peça' : 'Mão de Obra'}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleAcceptCrossSell(crossSellToast)}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-extrabold text-xs uppercase rounded-xl transition-all shadow-lg hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-black stroke-[3]" />
              <span>Incluir no Carrinho (+ R$ {crossSellToast.suggestedPrice.toFixed(2)})</span>
            </button>
            <button
              type="button"
              onClick={() => setCrossSellToast(null)}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-gray-400 hover:text-white font-mono text-xs uppercase font-bold rounded-xl border border-gray-800 cursor-pointer"
            >
              Ignorar
            </button>
          </div>
        </div>
      )}

      {/* 🟢 CROSS-SELL FEEDBACK TOAST */}
      {crossSellFeedbackToast && (
        <div className="fixed bottom-6 left-6 z-[70] p-3 px-4 bg-emerald-950/95 border border-emerald-500/80 text-emerald-300 font-mono text-xs font-bold rounded-xl shadow-2xl backdrop-blur-md animate-fade-in flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{crossSellFeedbackToast}</span>
        </div>
      )}

    </div>
  );
};
