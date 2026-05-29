import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Layers, 
  HelpCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Upload, 
  Tag, 
  Clipboard, 
  ShieldAlert,
  Truck,
  Trash2,
  Edit,
  Calculator,
  TrendingUp,
  MessageSquare,
  Barcode,
  Camera,
  FileText,
  Check,
  FileCode,
  Settings,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Produto, Fornecedor } from '../types';

export interface ParsedXmlItem {
  code: string;
  barcode: string;
  name: string;
  category: string;
  brand: string;
  qty: number;
  costPrice: number;
  sellPrice: number;
  unit: string;
}

export interface ParsedXMLDoc {
  invoiceNumber: string;
  emitName: string;
  emitCNPJ: string;
  totalValue: number;
  date: string;
  items: ParsedXmlItem[];
}

const SAMPLE_XML_BOSCH = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35260507567890000155550010001234561001234567" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>1234567</cNF>
        <natOp>Venda de mercadoria adquirida de terceiros</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>8592</nNF>
        <dhEmi>2026-05-28T14:30:00-03:00</dhEmi>
        <tpNF>1</tpNF>
      </ide>
      <emit>
        <CNPJ>07567890000155</CNPJ>
        <xNome>ROBERTO BOSCH LIMITADA</xNome>
        <xFant>BOSCH AUTO PECAS</xFant>
      </emit>
      <dest>
        <CNPJ>12345678000199</CNPJ>
        <xNome>AUTOTECH OFICINA MECANICA LTDA</xNome>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>VEL-NGK-IRD</cProd>
          <cEAN>7891002003001</cEAN>
          <xProd>Vela de Ignição Iridium NGK de Alta Performance</xProd>
          <NCM>85111000</NCM>
          <CFOP>5102</CFOP>
          <uCom>PC</uCom>
          <qCom>24.0000</qCom>
          <vUnCom>48.5000</vUnCom>
          <vProd>1164.00</vProd>
          <indTot>1</indTot>
        </prod>
      </det>
      <det nItem="2">
        <prod>
          <cProd>PST-BSH-01</cProd>
          <cEAN>7891102203301</cEAN>
          <xProd>Pastilha de Freio Dianteira Cerâmica Bosch Gol Uno</xProd>
          <NCM>87083019</NCM>
          <CFOP>5102</CFOP>
          <uCom>CJ</uCom>
          <qCom>15.0000</qCom>
          <vUnCom>85.0000</vUnCom>
          <vProd>1275.00</vProd>
          <indTot>1</indTot>
        </prod>
      </det>
      <det nItem="3">
        <prod>
          <cProd>FIL-OB-023</cProd>
          <cEAN>7892201103002</cEAN>
          <xProd>Filtro de Óleo Fram ExtraGuard Long Life</xProd>
          <NCM>84212300</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>50.0000</qCom>
          <vUnCom>18.9000</vUnCom>
          <vProd>945.00</vProd>
          <indTot>1</indTot>
        </prod>
      </det>
      <total>
        <ICMSTot>
          <vBC>3384.00</vBC>
          <vICMS>609.12</vICMS>
          <vProd>3384.00</vProd>
          <vNF>3384.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

const SAMPLE_XML_COFAP = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35260533042010000109550010008591231008591234" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>8591234</cNF>
        <natOp>Venda de autopeças de reposição</natOp>
        <mod>55</mod>
        <serie>2</serie>
        <nNF>14902</nNF>
        <dhEmi>2026-05-29T10:15:00-03:00</dhEmi>
        <tpNF>1</tpNF>
      </ide>
      <emit>
        <CNPJ>33042010000109</CNPJ>
        <xNome>MAGNETI MARELLI COFAP FABRICANTE S/A</xNome>
        <xFant>COFAP AMORTECEDORES</xFant>
      </emit>
      <dest>
        <CNPJ>12345678000199</CNPJ>
        <xNome>AUTOTECH OFICINA MECANICA LTDA</xNome>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>AMR-CFP-TR</cProd>
          <cEAN>7894506007001</cEAN>
          <xProd>Amortecedor Traseiro TurboGás Cofap Gol/Voyage</xProd>
          <NCM>87088000</NCM>
          <CFOP>5405</CFOP>
          <uCom>PR</uCom>
          <qCom>10.0000</qCom>
          <vUnCom>165.0000</vUnCom>
          <vProd>1650.00</vProd>
          <indTot>1</indTot>
        </prod>
      </det>
      <det nItem="2">
        <prod>
          <cProd>SKF-RL-3029</cProd>
          <cEAN>7894561230001</cEAN>
          <xProd>Rolamento de Roda Traseiro SKF Original</xProd>
          <NCM>84821010</NCM>
          <CFOP>5102</CFOP>
          <uCom>PC</uCom>
          <qCom>20.0000</qCom>
          <vUnCom>42.0000</vUnCom>
          <vProd>840.00</vProd>
          <indTot>1</indTot>
        </prod>
      </det>
      <total>
        <ICMSTot>
          <vProd>2490.00</vProd>
          <vNF>2490.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

const parseNfeXmlContent = (xmlText: string): ParsedXMLDoc | null => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    const nNF = xmlDoc.getElementsByTagName("nNF")[0]?.textContent || "S/N";
    const xNomeEmit = xmlDoc.getElementsByTagName("xNome")[0]?.textContent || "Emitente Desconhecido";
    const cnpjEmit = xmlDoc.getElementsByTagName("CNPJ")[0]?.textContent || "";
    const vNF = parseFloat(xmlDoc.getElementsByTagName("vNF")[0]?.textContent || "0");
    const dhEmi = xmlDoc.getElementsByTagName("dhEmi")[0]?.textContent || new Date().toISOString();
    
    const items: ParsedXmlItem[] = [];
    const detElements = xmlDoc.getElementsByTagName("det");
    
    for (let i = 0; i < detElements.length; i++) {
      const det = detElements[i];
      const prod = det.getElementsByTagName("prod")[0];
      if (prod) {
        const cProd = prod.getElementsByTagName("cProd")[0]?.textContent || "";
        const cEAN = prod.getElementsByTagName("cEAN")[0]?.textContent || "";
        const xProd = prod.getElementsByTagName("xProd")[0]?.textContent || "";
        const uCom = prod.getElementsByTagName("uCom")[0]?.textContent || "UN";
        const qCom = parseFloat(prod.getElementsByTagName("qCom")[0]?.textContent || "0");
        const vUnCom = parseFloat(prod.getElementsByTagName("vUnCom")[0]?.textContent || "0");
        
        let category = "Freios";
        const lowerName = xProd.toLowerCase();
        if (lowerName.includes("freio") || lowerName.includes("pastilha") || lowerName.includes("disco")) {
          category = "Freios";
        } else if (lowerName.includes("filtro")) {
          category = "Filtros";
        } else if (lowerName.includes("oleo") || lowerName.includes("lubrificante")) {
          category = "Lubrificantes";
        } else if (lowerName.includes("vela") || lowerName.includes("ignicao") || lowerName.includes("cabo")) {
          category = "Ignição";
        } else if (lowerName.includes("amortecedor") || lowerName.includes("rolamento") || lowerName.includes("suspensao")) {
          category = "Suspensão";
        } else if (lowerName.includes("lampada") || lowerName.includes("bateria") || lowerName.includes("eletrica")) {
          category = "Elétrica";
        }

        items.push({
          code: cProd,
          barcode: cEAN === "SEM GTIN" || !cEAN ? "" : cEAN,
          name: xProd,
          category,
          brand: xProd.includes("Bosch") ? "Bosch" : xProd.includes("Cofap") ? "Cofap" : xProd.includes("Fram") ? "Fram" : xProd.includes("SKF") ? "SKF" : "Outra",
          qty: qCom,
          costPrice: vUnCom,
          sellPrice: Math.round(vUnCom * 1.8),
          unit: uCom
        });
      }
    }
    
    return {
      invoiceNumber: nNF,
      emitName: xNomeEmit,
      emitCNPJ: cnpjEmit,
      totalValue: vNF,
      date: dhEmi,
      items
    };
  } catch (e) {
    console.error("Erro ao processar XML", e);
    return null;
  }
};

export const EstoqueView: React.FC = () => {
  const { 
    produtos, 
    addProduto, 
    updateProdutoStock, 
    editProduto,
    deleteProduto,
    fornecedores, 
    addFornecedor,
    editFornecedor,
    deleteFornecedor
  } = useApp();
  
  const [activeTab, setActiveTab ] = useState<'geral' | 'cadastro' | 'fornecedores' | 'movimentacoes' | 'csv' | 'xml'>('geral');

  // Custom Delete Product Confirmation Modal State
  const [productToDelete, setProductToDelete] = useState<Produto | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // XML Import states
  const [xmlContent, setXmlContent] = useState<string>('');
  const [xmlFileSelected, setXmlFileSelected] = useState<boolean>(false);
  const [xmlFileName, setXmlFileName] = useState<string>('');
  const [parsedXml, setParsedXml] = useState<ParsedXMLDoc | null>(null);
  const [xmlFeedback, setXmlFeedback] = useState<string | null>(null);
  const [xmlImportSuccess, setXmlImportSuccess] = useState<boolean>(false);
  const [selectedXmlItems, setSelectedXmlItems] = useState<Record<string, boolean>>({});
  const [customSellPrices, setCustomSellPrices] = useState<Record<string, string>>({});
  const [customCategories, setCustomCategories] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');

  // New product form states
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdBarcode, setNewProdBarcode] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Freios');
  const [newProdCompatibility, setNewProdCompatibility] = useState('');
  const [newProdManufacturer, setNewProdManufacturer] = useState('');
  const [newProdCost, setNewProdCost] = useState('');
  const [newProdSell, setNewProdSell] = useState('');
  const [newProdQty, setNewProdQty] = useState('');
  const [newProdMin, setNewProdMin] = useState('');
  const [newProdFornecedorId, setNewProdFornecedorId] = useState('');

  // Editing whole product state
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [editingProdName, setEditingProdName] = useState('');
  const [editingProdBrand, setEditingProdBrand] = useState('');
  const [editingProdSku, setEditingProdSku] = useState('');
  const [editingProdBarcode, setEditingProdBarcode] = useState('');
  const [editingProdCategory, setEditingProdCategory] = useState('');
  const [editingProdCompatibility, setEditingProdCompatibility] = useState('');
  const [editingProdManufacturer, setEditingProdManufacturer] = useState('');
  const [editingProdCost, setEditingProdCost] = useState('');
  const [editingProdSell, setEditingProdSell] = useState('');
  const [editingProdQty, setEditingProdQty] = useState('');
  const [editingProdMin, setEditingProdMin] = useState('');
  const [editingProdFornecedorId, setEditingProdFornecedorId] = useState('');

  // Fast stock adjustment quick edit
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockQty, setEditingStockQty] = useState('');

  // New Supplier form states
  const [newSupName, setNewSupName] = useState('');
  const [newSupCnpj, setNewSupCnpj] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupEmail, setNewSupEmail] = useState('');

  // Editing Supplier state
  const [editingSupId, setEditingSupId] = useState<string | null>(null);
  const [editingSupName, setEditingSupName] = useState('');
  const [editingSupCnpj, setEditingSupCnpj] = useState('');
  const [editingSupPhone, setEditingSupPhone] = useState('');
  const [editingSupEmail, setEditingSupEmail] = useState('');

  // Categories preset
  const categoriesList = ['Todas', 'Freios', 'Filtros', 'Lubrificantes', 'Suspensão', 'Ignição', 'Carroceria', 'Elétrica'];

  // Movement logs
  const [movementsList, setMovementsList] = useState([
    { id: "mov_1", date: "2026-05-25 14:10", sku: "PST-BSH-01", type: "Saída (PDV)", qty: 1, balance: 14, user: "Aline Oliveira" },
    { id: "mov_2", date: "2026-05-24 10:00", sku: "FLT-FRM-02", type: "Entrada (Fornecedor)", qty: 20, balance: 42, user: "Felipe Castanhari" },
    { id: "mov_3", date: "2026-05-22 08:30", sku: "VEL-NGK-IRD", type: "Saída (OS-002)", qty: 4, balance: 5, user: "Marcio Rezende" }
  ]);

  // CSV Import state
  const [csvFileSelected, setCsvFileSelected] = useState<boolean>(false);
  const [csvFeedback, setCsvFeedback] = useState<string | null>(null);

  // Barcode helper states & quick scan simulated triggers
  const [showStockScannerModal, setShowStockScannerModal] = useState(false);
  const [stockScannerTarget, setStockScannerTarget] = useState<'new' | 'edit'>('new');
  const [stockScanToast, setStockScanToast] = useState<string | null>(null);

  const playStockBeeper = () => {
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
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch(e){}
  };

  const handleGenerateEan = (target: 'new' | 'edit') => {
    let randCode = "789" + Math.floor(100000000 + Math.random() * 900000000).toString();
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(randCode[i]) * (i % 2 === 0 ? 1 : 3);
    }
    let checkDigit = (10 - (sum % 10)) % 10;
    randCode += checkDigit.toString();

    playStockBeeper();
    
    if (target === 'new') {
      setNewProdBarcode(randCode);
    } else {
      setEditingProdBarcode(randCode);
    }

    setStockScanToast(`Código Auto-Gerado: ${randCode}`);
    setTimeout(() => setStockScanToast(null), 2500);
  };

  // Keyboard rapid-typing scanner listener for physical gun inside inventory adding
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
          playStockBeeper();
          
          if (editingProdId) {
            setEditingProdBarcode(barcodeText);
            setStockScanToast(`Bipado (Edição): ${barcodeText}`);
            setTimeout(() => setStockScanToast(null), 3000);
          } else {
            setNewProdBarcode(barcodeText);
            setStockScanToast(`Bipado (Novo Cadastro): ${barcodeText}`);
            setTimeout(() => setStockScanToast(null), 3000);
          }
          rawBuffer = '';
          e.preventDefault();
        }
        rawBuffer = '';
        return;
      }

      if (e.key.length === 1) {
        const activeEl = document.activeElement;
        const isInput = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;
        
        if (timeDiff > 120 && !isInput) {
          rawBuffer = '';
        }
        rawBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [editingProdId]);

  // Filter products
  const filteredProducts = produtos.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.internalSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.barcode.includes(searchQuery) ||
                        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.compatibility && p.compatibility.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchCategory = categoryFilter === 'Todas' || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  // Calculate margin & markup helpers
  const getMarginAndMarkup = (cost: number, sell: number) => {
    if (!cost || !sell) return { margin: 0, markup: 0 };
    const profit = sell - cost;
    const margin = (profit / sell) * 100;
    const markup = (profit / cost) * 100;
    return { margin, markup };
  };

  // Submit new product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdSell || !newProdQty) {
      alert("Por favor, preencha os campos obrigatórios (Nome, Preço de Venda e Quantidade).");
      return;
    }

    const sku = newProdSku || "SKU-" + Math.floor(1000 + Math.random() * 9000);
    const barcode = newProdBarcode || "789" + Math.floor(1000000000 + Math.random() * 900000000);

    const payload = {
      name: newProdName,
      brand: newProdBrand || "Genérica",
      internalSku: sku,
      barcode,
      category: newProdCategory,
      compatibility: newProdCompatibility || "Universal",
      manufacturer: newProdManufacturer || "Outro",
      costPrice: parseFloat(newProdCost) || 0,
      sellPrice: parseFloat(newProdSell) || 0,
      quantity: parseInt(newProdQty) || 0,
      minStock: parseInt(newProdMin) || 2,
      fornecedorId: newProdFornecedorId || undefined
    };

    await addProduto(payload);

    // Track move log
    const newLog = {
      id: "mov_" + Math.random().toString(36).substr(2, 5),
      date: new Date().toISOString().substring(0, 16).replace('T', ' '),
      sku: sku,
      type: "Saldo Inicial",
      qty: payload.quantity,
      balance: payload.quantity,
      user: "Felipe Castanhari (Estoquista)"
    };
    setMovementsList(prev => [newLog, ...prev]);

    // Reset inputs
    setNewProdName('');
    setNewProdBrand('');
    setNewProdSku('');
    setNewProdBarcode('');
    setNewProdCategory('Freios');
    setNewProdCompatibility('');
    setNewProdManufacturer('');
    setNewProdCost('');
    setNewProdSell('');
    setNewProdQty('');
    setNewProdMin('');
    setNewProdFornecedorId('');
    setActiveTab('geral');
  };

  // Submit wholesale supplier quote request via pre-filled simulated modal or text template
  const handleSupplierQuoteMessage = (prod: Produto, supplier: Fornecedor) => {
    const text = `Olá ${supplier.name}, gostaria de solicitar orçamento para reposição imediata da peça: ${prod.name} (SKU: ${prod.internalSku}). Precisamos de um lote de reposição. Qual o preço cobrado e prazo atual de entrega? Obrigado!`;
    const encoded = encodeURIComponent(text);
    // Open in a safe manner
    window.open(`https://api.whatsapp.com/send?phone=${supplier.phone.replace(/\D/g, '')}&text=${encoded}`, '_blank');
  };

  // Quick Inline adjust stock count
  const handleUpdateStockSubmit = async (prod: Produto) => {
    const num = parseInt(editingStockQty);
    if (isNaN(num)) return;
    
    await updateProdutoStock(prod.id, num);
    
    // Add movement log
    const difference = num - prod.quantity;
    const logType = difference >= 0 ? "Ajuste Entrada" : "Ajuste Saída";
    
    const newLog = {
      id: "mov_" + Math.random().toString(36).substr(2, 5),
      date: new Date().toISOString().substring(0, 16).replace('T', ' '),
      sku: prod.internalSku,
      type: logType,
      qty: Math.abs(difference),
      balance: num,
      user: "Felipe Castanhari (Estoquista)"
    };
    setMovementsList(prev => [newLog, ...prev]);

    setEditingStockId(null);
    setEditingStockQty('');
  };

  // Launch full product editor
  const handleStartEditProduct = (p: Produto) => {
    setEditingProdId(p.id);
    setEditingProdName(p.name);
    setEditingProdBrand(p.brand);
    setEditingProdSku(p.internalSku);
    setEditingProdBarcode(p.barcode);
    setEditingProdCategory(p.category);
    setEditingProdCompatibility(p.compatibility || '');
    setEditingProdManufacturer(p.manufacturer || '');
    setEditingProdCost(String(p.costPrice));
    setEditingProdSell(String(p.sellPrice));
    setEditingProdQty(String(p.quantity));
    setEditingProdMin(String(p.minStock));
    setEditingProdFornecedorId(p.fornecedorId || '');
  };

  // Save whole product edit
  const handleSaveProductEdit = async () => {
    if (!editingProdId || !editingProdName || !editingProdSell) {
      alert("Por favor, informe ao menos o Nome e Preço de Venda.");
      return;
    }

    const costNum = parseFloat(editingProdCost) || 0;
    const sellNum = parseFloat(editingProdSell) || 0;
    const qtyNum = parseInt(editingProdQty) || 0;
    const minNum = parseInt(editingProdMin) || 2;

    const original = produtos.find(p => p.id === editingProdId);
    
    await editProduto(editingProdId, {
      name: editingProdName,
      brand: editingProdBrand,
      internalSku: editingProdSku,
      barcode: editingProdBarcode,
      category: editingProdCategory,
      compatibility: editingProdCompatibility,
      manufacturer: editingProdManufacturer,
      costPrice: costNum,
      sellPrice: sellNum,
      quantity: qtyNum,
      minStock: minNum,
      fornecedorId: editingProdFornecedorId || undefined
    });

    // Logging stock change if quantity differs
    if (original && original.quantity !== qtyNum) {
      const diff = qtyNum - original.quantity;
      const logType = diff >= 0 ? "Ajuste Entrada (Edit)" : "Ajuste Saída (Edit)";
      setMovementsList(prev => [{
        id: "mov_" + Math.random().toString(36).substr(2, 5),
        date: new Date().toISOString().substring(0, 16).replace('T', ' '),
        sku: editingProdSku,
        type: logType,
        qty: Math.abs(diff),
        balance: qtyNum,
        user: "Felipe Castanhari (Estoquista-Editor)"
      }, ...prev]);
    }

    setEditingProdId(null);
  };

  // Create Supplier
  const handleCreateSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName || !newSupPhone) {
      alert("Nome e Telefone celular/comercial são obrigatórios.");
      return;
    }
    await addFornecedor({
      name: newSupName,
      cnpj: newSupCnpj || undefined,
      phone: newSupPhone,
      email: newSupEmail || undefined
    });

    setNewSupName('');
    setNewSupCnpj('');
    setNewSupPhone('');
    setNewSupEmail('');
  };

  // Save Supplier Edit
  const handleSaveSupplierEdit = async (id: string) => {
    if (!editingSupName || !editingSupPhone) {
      alert("Nome e Telefone são obrigatórios.");
      return;
    }
    await editFornecedor(id, {
      name: editingSupName,
      cnpj: editingSupCnpj || undefined,
      phone: editingSupPhone,
      email: editingSupEmail || undefined
    });
    setEditingSupId(null);
  };

  const simulateCsvImport = () => {
    setCsvFeedback("Lendo arquivo CSV de estoque...");
    setTimeout(() => {
      addProduto({
        name: "Rolamento Traseiro SKF",
        brand: "SKF",
        internalSku: "SKF-RL-3029",
        barcode: "7894561230001",
        category: "Suspensão",
        compatibility: "Gol G5 G6, Polo 2012+",
        manufacturer: "SKF do Brasil",
        costPrice: 45.00,
        sellPrice: 110.00,
        quantity: 15,
        minStock: 4
      });
      addProduto({
        name: "Lâmpada H7 Super Branca Philips",
        brand: "Philips",
        internalSku: "LMP-PHL-H7",
        barcode: "7894561230002",
        category: "Elétrica",
        compatibility: "Farol Principal Comum H7",
        manufacturer: "Philips Lighting",
        costPrice: 35.00,
        sellPrice: 89.90,
        quantity: 12,
        minStock: 3
      });
      setCsvFeedback("✅ Importação executada com sucesso! 2 novos produtos adicionados ao estoque AutoTech.");
      setCsvFileSelected(false);
    }, 1500);
  };

  // Load Sample XML content
  const handleLoadSampleXml = (provider: 'bosch' | 'cofap') => {
    setXmlImportSuccess(false);
    const xmlText = provider === 'bosch' ? SAMPLE_XML_BOSCH : SAMPLE_XML_COFAP;
    setXmlContent(xmlText);
    setXmlFileSelected(true);
    setXmlFileName(provider === 'bosch' ? 'nota_fiscal_bosch_8592.xml' : 'nota_fiscal_cofap_14902.xml');
    
    const parsed = parseNfeXmlContent(xmlText);
    if (parsed) {
      setParsedXml(parsed);
      setXmlFeedback(`✅ XML de Exemplo (${parsed.emitName}) carregado com sucesso!`);
      // Select all items by default
      const defaultSelected: Record<string, boolean> = {};
      parsed.items.forEach(item => {
        defaultSelected[item.code] = true;
      });
      setSelectedXmlItems(defaultSelected);
    } else {
      setXmlFeedback("❌ Erro ao converter o XML de exemplo.");
    }
  };

  // Handle uploaded XML file
  const handleXmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setXmlImportSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    setXmlFileName(file.name);
    setXmlFileSelected(true);
    setXmlFeedback("Lendo arquivo XML da NF...");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setXmlContent(text);
      const parsed = parseNfeXmlContent(text);
      if (parsed) {
        setParsedXml(parsed);
        setXmlFeedback(`✅ NF-e Nº ${parsed.invoiceNumber} (${parsed.emitName}) analisada com sucesso!`);
        // Select all items by default
        const defaultSelected: Record<string, boolean> = {};
        parsed.items.forEach(item => {
          defaultSelected[item.code] = true;
        });
        setSelectedXmlItems(defaultSelected);
      } else {
        setXmlFeedback("❌ Erro ao analisar XML de NF-e. Certifique-se de que é um formato válido de NF-e brasileira da SEFAZ.");
        setParsedXml(null);
      }
    };
    reader.onerror = () => {
      setXmlFeedback("❌ Falha ao ler o arquivo XML.");
    };
    reader.readAsText(file);
  };

  // Confirm and commit XML stock replenishment
  const handleConfirmXmlImport = async () => {
    if (!parsedXml) return;

    setXmlFeedback("Processando e gravando itens da NF no estoque...");
    
    // Find or create supplier
    let supplierId = "";
    const matchedSupplier = fornecedores.find(f => f.cnpj?.replace(/\D/g, '') === parsedXml.emitCNPJ.replace(/\D/g, ''));
    if (matchedSupplier) {
      supplierId = matchedSupplier.id;
    } else {
      // Create a supplier if not existing
      const newSupId = "sup_" + Math.random().toString(36).substr(2, 5);
      await addFornecedor({
        name: parsedXml.emitName,
        cnpj: parsedXml.emitCNPJ,
        phone: "(11) 99999-9999",
        email: "compras@" + parsedXml.emitName.toLowerCase().replace(/\s+/g, '') + ".com.br"
      });
      supplierId = newSupId;
    }

    let addedCount = 0;
    let updatedCount = 0;
    const trackingLogs: any[] = [];

    // Cycle items
    for (const item of parsedXml.items) {
      if (!selectedXmlItems[item.code]) continue; // skipped

      // Search if product already exists by sku/code or barcode
      const existingProduct = produtos.find(p => 
        p.internalSku.toLowerCase() === item.code.toLowerCase() || 
        (p.barcode && p.barcode === item.barcode)
      );

      const resolvedCategory = customCategories[item.code] || item.category;
      const resolvedSellPrice = parseFloat(customSellPrices[item.code]) || item.sellPrice;

      if (existingProduct) {
        // Update stock
        const newQty = existingProduct.quantity + item.qty;
        await updateProdutoStock(existingProduct.id, newQty);
        
        // Also update cost price and supplier just in case
        await editProduto(existingProduct.id, {
          costPrice: item.costPrice,
          fornecedorId: supplierId || existingProduct.fornecedorId
        });

        updatedCount++;
        trackingLogs.push({
          id: "mov_" + Math.random().toString(36).substr(2, 5),
          date: new Date().toISOString().substring(0, 16).replace('T', ' '),
          sku: existingProduct.internalSku,
          type: `Entrada NF-e Nº ${parsedXml.invoiceNumber}`,
          qty: item.qty,
          balance: newQty,
          user: "Sistema (Importação XML)"
        });
      } else {
        // Register new product
        await addProduto({
          name: item.name,
          brand: item.brand,
          internalSku: item.code,
          barcode: item.barcode || "789" + Math.floor(1000000000 + Math.random() * 900000000),
          category: resolvedCategory,
          compatibility: "Universal / Conforme manual",
          manufacturer: item.brand,
          costPrice: item.costPrice,
          sellPrice: resolvedSellPrice,
          quantity: item.qty,
          minStock: 2,
          fornecedorId: supplierId
        });

        addedCount++;
        trackingLogs.push({
          id: "mov_" + Math.random().toString(36).substr(2, 5),
          date: new Date().toISOString().substring(0, 16).replace('T', ' '),
          sku: item.code,
          type: `Estoque Inicial por NF-e ${parsedXml.invoiceNumber}`,
          qty: item.qty,
          balance: item.qty,
          user: "Sistema (Importação XML)"
        });
      }
    }

    if (trackingLogs.length > 0) {
      setMovementsList(prev => [...trackingLogs, ...prev]);
    }

    playStockBeeper();
    setXmlFeedback(`✅ Reposição finalizada! ${updatedCount} produtos atualizados e ${addedCount} novos catalogados de forma integrada.`);
    setXmlImportSuccess(true);
    setXmlFileSelected(false);
    setParsedXml(null);
  };

  // Find low stock items that have suppliers linked
  const lowStockWithSuppliers = produtos.filter(p => p.quantity <= p.minStock && p.fornecedorId);

  return (
    <div className="flex flex-col gap-6 text-left" id="estoque-e-fornecedores">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
            📦 GESTÃO DE ESTOQUE, FORNECEDORES E MARGENS
          </h1>
          <p className="text-xs text-gray-400 font-mono">
            Controle integrado de compras, custos, faturamento de balcão e canais de fornecimento.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-[#080d19] p-1 rounded-xl border border-gray-800 self-stretch sm:self-auto overflow-x-auto gap-1 shrink-0 [&>button]:px-3 [&>button]:py-1.5 [&>button]:text-xs [&>button]:font-mono [&>button]:rounded-lg">
          <button 
            type="button"
            onClick={() => { setActiveTab('geral'); setEditingProdId(null); }}
            className={activeTab === 'geral' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
          >
            Fichas Gerais
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('cadastro'); setEditingProdId(null); }}
            className={activeTab === 'cadastro' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
          >
            + Cadastrar Peça
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('fornecedores'); setEditingProdId(null); }}
            className={activeTab === 'fornecedores' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
          >
            📋 Fornecedores ({fornecedores.length})
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('movimentacoes'); setEditingProdId(null); }}
            className={activeTab === 'movimentacoes' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
          >
            Movimentações
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('csv'); setEditingProdId(null); }}
            className={activeTab === 'csv' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
          >
            Importar CSV
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('xml'); setEditingProdId(null); }}
            className={activeTab === 'xml' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
          >
            Importar XML (NF-e)
          </button>
        </div>
      </div>

      {/* SUGGESTION / REPLENISHMENT ADVICE MODULE */}
      {activeTab === 'geral' && lowStockWithSuppliers.length > 0 && (
        <div className="bg-[#0f1b2b] p-4 rounded-xl border border-cyan-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/40 text-cyan-400 flex items-center justify-center border border-cyan-800/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Sugestão de Reposição de Estoque Balcão
              </h4>
              <p className="text-[11px] text-gray-300 font-sans mt-0.5">
                Há {lowStockWithSuppliers.length} itens críticos vinculados a fornecedores cadastrados. Deseja disparar mensagem pré-definida de cotação de atacado?
              </p>
            </div>
          </div>
          <div className="flex gap-2 self-stretch md:self-auto">
            {lowStockWithSuppliers.slice(0, 1).map((item) => {
              const sup = fornecedores.find(s => s.id === item.fornecedorId);
              if (!sup) return null;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSupplierQuoteMessage(item, sup)}
                  className="flex items-center justify-center gap-1 bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg transition-colors w-full"
                >
                  <MessageSquare className="w-3 h-3" /> Chamar {sup.name.split(' ')[0]} p/ {item.name.slice(0, 12)}...
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'geral' && (
        <>
          {/* SEARCH AND FILTERS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#0a0f1d] p-4 rounded-xl border border-gray-900">
            <div className="relative md:col-span-8">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Pesquise peça por nome, SKU interno, marcas de montadoras, aplicação de veículos (Gol, Civic) ou barras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2 px-4 pl-10 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="md:col-span-4">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-[#080c16] border border-gray-800 py-2.5 px-3 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              >
                {categoriesList.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* EDIT DETAILED PRODUCT INLINE BLOCK (visible when editingProdId set) */}
          {editingProdId && (
            <div className="bg-[#0b1328] p-5 rounded-2xl border border-red-500/20 flex flex-col gap-4 animate-fadeIn">
              <div className="border-b border-gray-800 pb-2.5 flex justify-between items-center">
                <span className="text-white font-display font-extrabold text-sm flex items-center gap-2">
                  <Edit className="w-4 h-4 text-red-500" /> EDITANDO DADOS DETALHADOS DA PEÇA
                </span>
                <span className="text-[10px] text-gray-400 font-mono">ID: {editingProdId}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="col-span-1 sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-gray-400">DENOMINAÇÃO DO PRODUTO</label>
                  <input 
                    type="text" 
                    value={editingProdName}
                    onChange={(e) => setEditingProdName(e.target.value)}
                    className="bg-[#080c16] border border-gray-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-gray-400">CATEGORIA</label>
                  <select 
                    value={editingProdCategory}
                    onChange={(e) => setEditingProdCategory(e.target.value)}
                    className="bg-[#080c16] border border-gray-700 rounded-lg p-2 text-xs text-white font-mono"
                  >
                    {categoriesList.filter(c => c !== 'Todas').map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-gray-400">MARCA</label>
                  <input 
                    type="text" 
                    value={editingProdBrand}
                    onChange={(e) => setEditingProdBrand(e.target.value)}
                    className="bg-[#080c16] border border-gray-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-gray-400">SKU INTERNO</label>
                  <input 
                    type="text" 
                    value={editingProdSku}
                    onChange={(e) => setEditingProdSku(e.target.value)}
                    className="bg-[#080c16] border border-gray-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono text-gray-400">CÓDIGO DE BARRAS (EAN)</label>
                    <button
                      type="button"
                      onClick={() => handleGenerateEan('edit')}
                      className="text-[9px] font-mono bg-purple-950/40 text-purple-300 border border-purple-900/40 hover:bg-purple-600 hover:text-white px-1.5 py-0.5 rounded transition-all cursor-pointer font-bold uppercase"
                      title="Auto-gerar código de barras"
                    >
                      ⚡ Gerar EAN
                    </button>
                  </div>
                  <div className="relative">
                    <Barcode className="absolute left-2.5 top-2.5 w-4 h-4 text-purple-500/60" />
                    <input 
                      type="text" 
                      value={editingProdBarcode}
                      onChange={(e) => setEditingProdBarcode(e.target.value)}
                      placeholder="Sem código [Digite ou Bipe]"
                      className="bg-[#080c16] border border-gray-750 border-gray-700 rounded-lg p-2 pl-9 text-xs text-white font-mono w-full"
                    />
                  </div>
                </div>

                <div className="col-span-1 sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-gray-400">COMPATIBILIDADE DE VEÍCULOS</label>
                  <input 
                    type="text" 
                    value={editingProdCompatibility}
                    onChange={(e) => setEditingProdCompatibility(e.target.value)}
                    className="bg-[#080c16] border border-gray-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-gray-400">FABRICANTE</label>
                  <input 
                    type="text" 
                    value={editingProdManufacturer}
                    onChange={(e) => setEditingProdManufacturer(e.target.value)}
                    className="bg-[#080c16] border border-gray-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-red-400">PREÇO DE CUSTO (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editingProdCost}
                    onChange={(e) => setEditingProdCost(e.target.value)}
                    className="bg-[#080c16] border border-gray-700 rounded-lg p-2 text-xs font-bold text-white font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-green-400">PREÇO DE VENDA NO BALCÃO (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editingProdSell}
                    onChange={(e) => setEditingProdSell(e.target.value)}
                    className="bg-[#080c16] border border-gray-700 rounded-lg p-2 text-xs font-bold text-white font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-cyan-400">FORNECEDOR</label>
                  <select 
                    value={editingProdFornecedorId}
                    onChange={(e) => setEditingProdFornecedorId(e.target.value)}
                    className="bg-[#080c16] border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="">-- Sem Fornecedor Vinculado --</option>
                    {fornecedores.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-gray-300">ESTOQUE FÍSICO</label>
                  <input 
                    type="number" 
                    value={editingProdQty}
                    onChange={(e) => setEditingProdQty(e.target.value)}
                    className="bg-[#080c16] border border-gray-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-gray-300">ESTOQUE MÍNIMO</label>
                  <input 
                    type="number" 
                    value={editingProdMin}
                    onChange={(e) => setEditingProdMin(e.target.value)}
                    className="bg-[#080c16] border border-gray-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>

                {/* Live Margin Calculation block */}
                <div className="col-span-1 sm:col-span-3 bg-gray-950/40 p-3 rounded-lg flex items-center justify-between text-[11px] font-mono border border-gray-800">
                  <div className="flex gap-4">
                    <span>
                      Markup: <strong className="text-cyan-400">{getMarginAndMarkup(parseFloat(editingProdCost)||0, parseFloat(editingProdSell)||0).markup.toFixed(1)}%</strong>
                    </span>
                    <span>
                      Margem Bruta: <strong className="text-green-400">{getMarginAndMarkup(parseFloat(editingProdCost)||0, parseFloat(editingProdSell)||0).margin.toFixed(1)}%</strong>
                    </span>
                    <span>
                      Lucro Nominal: <strong className="text-white">R$ {Math.max(0, (parseFloat(editingProdSell)||0) - (parseFloat(editingProdCost)||0)).toFixed(2)}</strong>
                    </span>
                  </div>
                  <span className="text-slate-500 font-sans hidden md:inline">Cálculo de margem real-time</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingProdId(null)}
                  className="bg-gray-800 hover:bg-gray-750 text-gray-400 text-xs py-2 px-4 rounded-lg font-mono"
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={handleSaveProductEdit}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs py-2 px-6 rounded-lg font-mono font-bold"
                >
                  Confirmar Alterações
                </button>
              </div>
            </div>
          )}

          {/* PRODUCTS STOCK TABLE */}
          <div className="bg-[#0c1223] rounded-2xl border border-gray-800 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#080d19] border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Produto / SKU</th>
                  <th className="p-4">Categoria / Fornecedor</th>
                  <th className="p-4">Marca/Fabr.</th>
                  <th className="p-4">Aplicações / Compatibilidade</th>
                  <th className="p-4">Indicadores Margem</th>
                  <th className="p-4 text-center">Quant. Física</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {filteredProducts.map((p) => {
                  const isLow = p.quantity <= p.minStock;
                  const supplier = fornecedores.find(sup => sup.id === p.fornecedorId);
                  const pricing = getMarginAndMarkup(p.costPrice, p.sellPrice);

                  return (
                    <tr key={p.id} className="hover:bg-gray-950/20">
                      
                      <td className="p-4 max-w-[200px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-sans text-xs font-semibold text-white flex items-center gap-1.5">
                            {p.name}
                            {isLow && (
                              <span className="shrink-0 w-2 h-2 rounded-full bg-red-500 animate-ping" title="Abaixo do estoque de segurança!"></span>
                            )}
                          </span>
                          <span className="text-[10px] text-gray-500">SKU: {p.internalSku} • EAN: {p.barcode}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-0.5 w-max rounded text-[10px] bg-sky-950/40 text-sky-400 border border-sky-900/35 font-sans">
                            {p.category}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-slate-500" />
                            {supplier ? supplier.name : <em className="text-gray-500">Sem vínculo</em>}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-gray-300 font-sans">
                        {p.brand} 
                        <span className="block text-[10px] text-gray-500">{p.manufacturer}</span>
                      </td>
                      
                      <td className="p-4 max-w-[150px] text-slate-400 text-[10px]" title={p.compatibility}>
                        <span className="font-sans text-xs leading-normal block">
                          {p.compatibility || <span className="text-gray-600">Universal/Geral</span>}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-red-400">Custo: R$ {p.costPrice.toFixed(2)}</span>
                          <span className="text-green-400 font-bold text-xs">Venda: R$ {p.sellPrice.toFixed(2)}</span>
                          <span className="text-[9px] text-gray-500 mt-0.5">
                            Margem Bruta: <strong className="text-white font-mono">{pricing.margin.toFixed(0)}%</strong>
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        {editingStockId === p.id ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <input 
                              type="number"
                              className="w-16 bg-[#080c16] border border-gray-700 rounded py-0.5 px-1.5 text-center text-white"
                              value={editingStockQty}
                              onChange={(e) => setEditingStockQty(e.target.value)}
                            />
                            <button 
                              type="button"
                              onClick={() => handleUpdateStockSubmit(p)}
                              className="px-1.5 py-0.5 rounded bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold"
                            >
                              OK
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setEditingStockId(p.id);
                              setEditingStockQty(String(p.quantity));
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full cursor-pointer text-[11px] font-bold ${
                              isLow 
                                ? 'bg-red-950/40 text-red-500 border border-red-900/30' 
                                : 'bg-[#0a1226] text-cyan-400 border border-cyan-900/20'
                            }`}
                            title="Clique para edição rápida do saldo físico"
                          >
                            <span>{p.quantity} un</span>
                            <span className="text-[9px] text-gray-500">/ mín: {p.minStock}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button 
                            type="button"
                            onClick={() => handleStartEditProduct(p)}
                            className="p-1 text-[11px] bg-slate-900 border border-gray-800 text-slate-300 rounded hover:border-red-500 hover:text-red-500 transition-colors flex items-center gap-1 px-2 py-1"
                          >
                            <Edit className="w-3 h-3" /> Ficha
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              setProductToDelete(p);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-350 bg-red-950/20 hover:bg-red-950/45 border border-red-900/35 hover:border-red-800/50 cursor-pointer transition-all flex items-center justify-center shadow-sm"
                            title="Remover peça definitivamente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                Nenhum produto cadastrado com os critérios vigentes nas prateleiras.
              </div>
            )}
          </div>
        </>
      )}

      {/* RENDER FORNECEDORES TAB */}
      {activeTab === 'fornecedores' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Supplier Register Form (4 cols) */}
          <div className="lg:col-span-4 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-4">
            <div className="border-b border-gray-800 pb-3 mb-1">
              <h3 className="font-display font-bold text-white text-sm uppercase flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-500" /> Cadastrar Novo Fornecedor
              </h3>
              <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                Fornecedores de autopeças, distribuidoras, marcas e intermediárias de insumos de pátio.
              </p>
            </div>

            <form onSubmit={handleCreateSupplierSubmit} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-gray-400">DENOMINAÇÃO SOCIAL / FANTASIA *</label>
                <input 
                  type="text"
                  placeholder="Ex: Distribuidora de Peças Dpaschoal"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-gray-400">CNPJ DA ENTIDADE</label>
                <input 
                  type="text"
                  placeholder="Ex: 00.123.456/0001-99"
                  value={newSupCnpj}
                  onChange={(e) => setNewSupCnpj(e.target.value)}
                  className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-white font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-gray-400">TELEFONE DE CONTATO / WHATSAPP *</label>
                <input 
                  type="text"
                  placeholder="Ex: (11) 99888-7766"
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                  className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-white font-mono"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-gray-400">E-MAIL COMERCIAL PARA COTAÇÕES</label>
                <input 
                  type="email"
                  placeholder="Ex: vendas@distribuidorax.com.br"
                  value={newSupEmail}
                  onChange={(e) => setNewSupEmail(e.target.value)}
                  className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-white"
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-2 py-3 bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs tracking-wider rounded-xl transition-all shadow-md shadow-red-950/40"
              >
                📥 REGISTRAR FORNECEDOR
              </button>
            </form>
          </div>

          {/* Suppliers list cards (8 cols) */}
          <div className="lg:col-span-8 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-4">
            <div className="border-b border-gray-850 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-display font-extrabold text-white text-base">Canais de Fornecimento Cadastrados</h3>
                <p className="text-[10px] text-gray-500 font-mono">
                  Lista de entidades homologadas para cotações por WhatsApp de atacado e faturamento de compras.
                </p>
              </div>
              <span className="text-xs text-red-500 bg-red-950/40 px-2.5 py-1 rounded-full border border-red-900/30 font-bold font-mono">
                {fornecedores.length} Unidades
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fornecedores.map((sup) => {
                const isEditing = editingSupId === sup.id;
                const productsCount = produtos.filter(p => p.fornecedorId === sup.id).length;

                return (
                  <div key={sup.id} className="p-4 bg-gray-950/20 border border-gray-900 rounded-xl flex flex-col justify-between gap-3 text-xs">
                    
                    {isEditing ? (
                      <div className="flex flex-col gap-2 font-mono">
                        <input 
                          type="text"
                          value={editingSupName}
                          onChange={(e) => setEditingSupName(e.target.value)}
                          className="bg-[#080c16] border border-gray-700 rounded p-1 text-white text-xs font-sans"
                        />
                        <input 
                          type="text"
                          value={editingSupCnpj}
                          onChange={(e) => setEditingSupCnpj(e.target.value)}
                          className="bg-[#080c16] border border-gray-700 rounded p-1 text-white text-[11px]"
                          placeholder="CNPJ"
                        />
                        <input 
                          type="text"
                          value={editingSupPhone}
                          onChange={(e) => setEditingSupPhone(e.target.value)}
                          className="bg-[#080c16] border border-gray-700 rounded p-1 text-white text-[11px]"
                          placeholder="Telefone"
                        />
                        <input 
                          type="text"
                          value={editingSupEmail}
                          onChange={(e) => setEditingSupEmail(e.target.value)}
                          className="bg-[#080c16] border border-gray-700 rounded p-1 text-white text-[11px]"
                          placeholder="E-mail"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-start">
                          <span className="font-sans font-extrabold text-[13px] text-white flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-cyan-500 shrink-0" /> {sup.name}
                          </span>
                          <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-gray-400">
                            {productsCount} peç.
                          </span>
                        </div>
                        {sup.cnpj && (
                          <span className="text-[11px] text-gray-500 font-mono">CNPJ: {sup.cnpj}</span>
                        )}
                        <span className="text-[11px] text-gray-300 font-mono">Telefone: {sup.phone}</span>
                        {sup.email && (
                          <span className="text-[11px] text-gray-300 font-sans block truncate" title={sup.email}>
                            Email: {sup.email}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end border-t border-gray-850 pt-3 mt-1 gap-2">
                      {isEditing ? (
                        <>
                          <button 
                            type="button"
                            onClick={() => handleSaveSupplierEdit(sup.id)}
                            className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold px-3 py-1 rounded"
                          >
                            Salvar
                          </button>
                          <button 
                            type="button"
                            onClick={() => setEditingSupId(null)}
                            className="bg-gray-800 text-gray-400 text-[10px] px-3 py-1 rounded"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            type="button"
                            onClick={() => {
                              setEditingSupId(sup.id);
                              setEditingSupName(sup.name);
                              setEditingSupCnpj(sup.cnpj || '');
                              setEditingSupPhone(sup.phone);
                              setEditingSupEmail(sup.email || '');
                            }}
                            className="text-gray-300 hover:text-white border border-gray-800 hover:border-red-550 rounded text-[10px] font-semibold px-2.5 py-1 text-center"
                          >
                            Editar
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja apagar o fornecedor "${sup.name}"?`)) {
                                deleteFornecedor(sup.id);
                              }
                            }}
                            className="text-gray-500 hover:text-red-500 p-1 rounded"
                            title="Deletar fornecedor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                );
              })}
              {fornecedores.length === 0 && (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  Nenhum fornecedor registrado. Cadastre as distribuidoras logo ao lado!
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* CADASTRO TAB (Peça nova com seletores de margem e distribuidora) */}
      {activeTab === 'cadastro' && (
        <form onSubmit={handleCreateProduct} className="max-w-4xl mx-auto w-full bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6">
          <div className="border-b border-gray-850 pb-4">
            <h3 className="font-display font-extrabold text-white text-base">CADASTRAR NOVO COMPONENTE NO ESTOQUE</h3>
            <span className="text-xs text-gray-400">
              Insira o custo de lote de aquisição e a margem de faturamento para vendas no de balcão e de ordens de serviço.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400">DENOMINAÇÃO TÉCNICA DA PEÇA *</label>
              <input 
                type="text"
                placeholder="Ex: Pastilha de Freio Dianteiro Bosch Cerâmica"
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400">CATEGORIA DE PEÇA</label>
              <select
                value={newProdCategory}
                onChange={(e) => setNewProdCategory(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-3 px-3 text-xs text-white font-mono"
              >
                {categoriesList.filter(c => c !== 'Todas').map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400">MARCA DO FABRICANTE</label>
              <input 
                type="text"
                placeholder="Ex: Bosch, SKF, Cofap, TRW"
                value={newProdBrand}
                onChange={(e) => setNewProdBrand(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400">SKU INTERNO (CÓDIGO DE GESTÃO)</label>
              <input 
                type="text"
                placeholder="Ex: PST-BSH-01"
                value={newProdSku}
                onChange={(e) => setNewProdSku(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-gray-400">CÓDIGO DE BARRAS (EAN)</label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleGenerateEan('new')}
                    className="text-[9px] font-mono bg-[#1a0f30]/60 text-purple-300 border border-purple-900/40 hover:bg-purple-600 hover:text-white px-2 py-0.5 rounded transition-all cursor-pointer font-bold uppercase"
                  >
                    ⚡ GERAR
                  </button>
                  <button
                    type="button"
                    onClick={() => { playStockBeeper(); setStockScannerTarget('new'); setShowStockScannerModal(true); }}
                    className="text-[9px] font-mono bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-650 hover:text-white px-2 py-0.5 rounded transition-all cursor-pointer font-bold uppercase flex items-center gap-0.5"
                  >
                    <Camera className="w-2.5 h-2.5" /> SCAN
                  </button>
                </div>
              </div>
              <div className="relative">
                <Barcode className="absolute left-3 top-3 w-4 h-4 text-red-500/60" />
                <input 
                  type="text"
                  placeholder="Bipe com leitor óptico ou digite..."
                  value={newProdBarcode}
                  onChange={(e) => setNewProdBarcode(e.target.value)}
                  className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 pl-9 text-xs text-white font-mono w-full font-bold"
                />
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-450">COMPATIBILIDADE (MODELOS APLICAÇÃO)</label>
              <input 
                type="text"
                placeholder="Ex: VW Golf 1.4 TSI 2017 a 2021, Audi A3 Sedan..."
                value={newProdCompatibility}
                onChange={(e) => setNewProdCompatibility(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400">FORNECEDOR VINCULADO</label>
              <select
                value={newProdFornecedorId}
                onChange={(e) => setNewProdFornecedorId(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-3 px-3 text-xs text-white"
              >
                <option value="">-- Sem Fornecedor / Outros --</option>
                {fornecedores.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-red-400">PREÇO DE CUSTO (FORNETECEDOR R$)</label>
              <input 
                type="number"
                step="0.01"
                placeholder="Ex: 120.00"
                value={newProdCost}
                onChange={(e) => setNewProdCost(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono font-bold"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-green-400">PREÇO VENDA BALCÃO (R$) *</label>
              <input 
                type="number"
                step="0.01;0.1"
                placeholder="Ex: 249.90"
                value={newProdSell}
                onChange={(e) => setNewProdSell(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono font-bold"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-300">SALDO EM ESTOQUE INICIAL *</label>
              <input 
                type="number"
                placeholder="Ex: 25"
                value={newProdQty}
                onChange={(e) => setNewProdQty(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400">ESTOQUE MÍNIMO DE SEGURANÇA</label>
              <input 
                type="number"
                placeholder="Ex: 5"
                value={newProdMin}
                onChange={(e) => setNewProdMin(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400">FABRICANTE (ORIGINAL)</label>
              <input 
                type="text"
                placeholder="Ex: Bosch GmbH"
                value={newProdManufacturer}
                onChange={(e) => setNewProdManufacturer(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white"
              />
            </div>

            {/* Price margin stats helper details */}
            <div className="md:col-span-3 bg-gray-950/40 p-4 rounded-xl border border-gray-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-mono">
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                <span>
                  Markup Presumido: <strong className="text-cyan-400">{getMarginAndMarkup(parseFloat(newProdCost)||0, parseFloat(newProdSell)||0).markup.toFixed(1)}%</strong>
                </span>
                <span>
                  Margem de Lucro: <strong className="text-green-500">{getMarginAndMarkup(parseFloat(newProdCost)||0, parseFloat(newProdSell)||0).margin.toFixed(1)}%</strong>
                </span>
                <span>
                  Lucro por Peça: <strong className="text-white">R$ {Math.max(0, (parseFloat(newProdSell)||0) - (parseFloat(newProdCost)||0)).toFixed(2)}</strong>
                </span>
              </div>
              <span className="text-gray-500 font-sans text-[11px] leading-tight flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-gray-600" /> Auto-cálculo de faturamento do ERP.
              </span>
            </div>

          </div>

          <div className="flex justify-end gap-3 mt-4 border-t border-gray-850 pt-4">
            <button 
              type="submit"
              className="px-6 py-3.5 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl font-bold font-mono text-white text-xs tracking-wider"
            >
              📥 REGISTRAR COMPONENTE NO ESTOQUE
            </button>
          </div>
        </form>
      )}

      {/* ORIGINAL MOVIMENTACOES TAB */}
      {activeTab === 'movimentacoes' && (
        <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-5">
          <div className="flex justify-between items-center border-b border-gray-850 pb-4">
            <div>
              <h3 className="font-display font-extrabold text-white text-base">Histórico de Transações de Estoque</h3>
              <p className="text-[10px] text-gray-500 font-mono">Movimentações atômicas de vendas no balcão de peças e deduções de ordens de serviço.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {movementsList.map((log) => (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-gray-900 bg-gray-950/20 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    log.type.startsWith('Entrada') || log.type.startsWith('Saldo')
                      ? 'bg-green-950/40 text-green-500 border border-green-900/30'
                      : 'bg-red-950/40 text-red-500 border border-red-900/30'
                    }`}>
                    {log.type.startsWith('Entrada') || log.type.startsWith('Saldo') ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-semibold text-white block">{log.type}</span>
                    <span className="text-[10px] text-gray-500 font-mono">Produto SKU: {log.sku} • {log.user}</span>
                  </div>
                </div>

                <div className="text-right mt-2 sm:mt-0 font-mono">
                  <span className={`font-bold block text-sm ${log.type.startsWith('Entrada') || log.type.startsWith('Saldo') ? 'text-green-500' : 'text-red-500'}`}>
                    {log.type.startsWith('Entrada') || log.type.startsWith('Saldo') ? '+' : '-'}{log.qty} un
                  </span>
                  <span className="text-[10px] text-gray-500">Saldo: {log.balance} un • {log.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORIGINAL IMPORTAR CSV TAB */}
      {activeTab === 'csv' && (
        <div className="max-w-xl mx-auto w-full bg-[#0c1223] rounded-2xl border border-gray-800 p-6 text-center flex flex-col gap-6 items-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 text-cyan-500 flex items-center justify-center border border-cyan-900/30">
            <Upload className="w-7 h-7 text-cyan-400" />
          </div>

          <div className="text-center">
            <h3 className="font-display font-bold text-lg text-white">Importador Sincronizado CSV</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Carregue toda a planilha de autopeças de distribuidoras externas. Compatível com formatos padrão de ERP (Sinca, Linx, Simplus, Excel).
            </p>
          </div>

          <div className="w-full bg-[#080c16] border-2 border-dashed border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center gap-3">
            <Tag className="w-8 h-8 text-slate-700" />
            <span className="text-xs text-slate-400 font-mono">Arraste a planilha .csv ou .xlsx aqui</span>
            
            <button 
              type="button"
              onClick={() => setCsvFileSelected(true)}
              className="mt-2 text-xs font-semibold py-2 px-4 rounded border border-gray-700 bg-slate-900 hover:bg-slate-800 text-slate-200"
            >
              {csvFileSelected ? "📄 planilha_estoque_auto.csv Selecionada" : "Selecionar Arquivo no Computador"}
            </button>
          </div>

          {csvFeedback && (
            <div className="w-full text-xs font-mono p-3 rounded-lg border border-cyan-900/20 bg-cyan-950/20 text-cyan-400">
              {csvFeedback}
            </div>
          )}

          <button 
            type="button"
            disabled={!csvFileSelected}
            onClick={simulateCsvImport}
            className={`w-full py-4 rounded-xl font-bold font-mono tracking-wider text-xs sm:text-sm ${
              csvFileSelected 
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer shadow-md' 
                : 'bg-slate-900 text-slate-600 cursor-not-allowed'
              }`}
          >
            🚀 PROCESSAR IMPORTAÇÃO DE PRODUTOS
          </button>
        </div>
      )}

      {/* IMPORTAR XML (NF-e) TAB */}
      {activeTab === 'xml' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          
          {/* Main dropzone & selection area */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            <div className="md:col-span-7 bg-[#0c1223] rounded-2xl border border-gray-805 border-gray-800 p-6 flex flex-col gap-5 justify-between">
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-950/40 text-red-500 border border-red-900/30 flex items-center justify-center">
                  <FileCode className="w-6 h-6 text-red-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-white font-display font-extrabold text-base">Entrada de Mercadoria via XML (NF-e)</h3>
                  <p className="text-[11px] text-gray-400 font-mono">Processamento de Nota Fiscal da SEFAZ para reabastecimento imediato de estoque.</p>
                </div>
              </div>

              <div className="bg-[#080c16] border-2 border-dashed border-gray-800 hover:border-red-500/30 transition-colors rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-center relative group">
                <Upload className="w-10 h-10 text-gray-600 group-hover:text-red-400 transition-colors" />
                
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-200 font-semibold">Arraste o XML da Nota Fiscal aqui</span>
                  <span className="text-[10px] text-slate-500 font-mono">Formatos suportados: .xml (Padrão SEFAZ NF-e 4.00)</span>
                </div>

                <label className="mt-2 text-xs font-mono font-bold py-2 px-4 rounded border border-gray-800 hover:border-gray-700 bg-slate-950 text-slate-300 hover:text-white transition-colors cursor-pointer relative z-10">
                  {xmlFileSelected ? `📄 ${xmlFileName}` : "Selecionar Arquivo da Nota..."}
                  <input 
                    type="file" 
                    accept=".xml" 
                    onChange={handleXmlFileUpload} 
                    className="sr-only" 
                  />
                </label>
              </div>

              {xmlFeedback && (
                <div className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 leading-relaxed ${
                  xmlFeedback.startsWith('❌') 
                    ? 'border-red-900/30 bg-red-950/15 text-red-400' 
                    : xmlFeedback.startsWith('✅') 
                    ? 'border-green-900/30 bg-green-950/15 text-green-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}>
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{xmlFeedback}</span>
                </div>
              )}

            </div>

            <div className="md:col-span-5 bg-[#0a0f1d] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between gap-4">
              <div>
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-extrabold flex items-center gap-1">
                  <Settings className="w-3.5 h-3.5" />
                  AMBIENTE DE TESTE ACELERADO
                </span>
                <h4 className="text-sm font-display font-extrabold text-white mt-1 border-b border-gray-850 pb-2">Como testar sem arquivos reais?</h4>
                <p className="text-[11px] text-gray-400 mt-2.5 leading-relaxed">
                  Para facilitar a homologação imediata do leitor de XML, disponibilizamos as notas fiscais completas fictícias de dois grandes fornecedores padrão brasileiros. Clique abaixo para simular as notas:
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => handleLoadSampleXml('bosch')}
                  className="w-full text-left p-3 rounded-xl border border-gray-800 hover:border-red-500/40 bg-slate-950/40 hover:bg-slate-950 text-xs flex justify-between items-center transition-all cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-white block">📦 NF-e Nº 008592 - Robert Bosch Ltda</span>
                    <span className="text-[9.5px] text-gray-500 font-mono">Itens: 3 (Velais Iridium, Pastilhas, Filtro de Óleo)</span>
                  </div>
                  <Check className="w-4 h-4 text-gray-600" />
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSampleXml('cofap')}
                  className="w-full text-left p-3 rounded-xl border border-gray-800 hover:border-red-500/40 bg-slate-950/40 hover:bg-slate-950 text-xs flex justify-between items-center transition-all cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-white block">📦 NF-e Nº 014902 - Magneti Marelli Cofap</span>
                    <span className="text-[9.5px] text-gray-500 font-mono">Itens: 2 (Amortecedor, Rolamento SKF Traseiro)</span>
                  </div>
                  <Check className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="bg-[#050912] p-3 rounded-xl border border-gray-900 text-[10px] text-center text-gray-500 leading-normal font-mono">
                💡 O decodificador lê tags <code className="text-gray-400">&lt;emit&gt;</code>, <code className="text-gray-400">&lt;det&gt;</code>, de quantidades <code className="text-gray-400">&lt;qCom&gt;</code> e custos <code className="text-gray-400">&lt;vUnCom&gt;</code> automaticamente!
              </div>

            </div>

          </div>

          {/* PARSED PANEL VIEW AND GRID */}
          {parsedXml && (
            <div className="bg-[#0b1122] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6 animate-fadeIn">
              
              {/* NF summary header card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#080d19] border border-gray-850 p-4 rounded-xl">
                <div>
                  <span className="text-[9px] font-mono text-gray-500 uppercase font-bold block">FORNECEDOR EMITENTE</span>
                  <span className="text-xs font-bold text-slate-100 uppercase mt-0.5 block truncate">{parsedXml.emitName}</span>
                  <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">CNPJ: {parsedXml.emitCNPJ}</span>
                </div>
                
                <div>
                  <span className="text-[9px] font-mono text-gray-500 uppercase font-bold block">NÚMERO DA NOTA FISCAL</span>
                  <span className="text-xs font-bold text-slate-100 uppercase mt-0.5 block">Nº {parsedXml.invoiceNumber}</span>
                  <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">Série: 1 • Modelo: 55</span>
                </div>

                <div>
                  <span className="text-[9px] font-mono text-gray-500 uppercase font-bold block">VALOR TOTAL DA NOTA</span>
                  <span className="text-sm font-extrabold text-red-400 uppercase mt-0.5 block">R$ {parsedXml.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">Incidência ICMS padrão</span>
                </div>

                <div>
                  <span className="text-[9px] font-mono text-gray-500 uppercase font-bold block">DATA DE EMISSÃO DA SEFAZ</span>
                  <span className="text-xs font-bold text-slate-100 uppercase mt-0.5 block">
                    {new Date(parsedXml.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">Situação: Autorizada</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-850">
                  <span className="text-white font-display font-semibold text-sm">Relação de Itens Descritos na Nota Fiscal</span>
                  <span className="text-[10px] text-gray-400 font-mono">{parsedXml.items.length} componentes identificados</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-900 bg-slate-950/40 text-gray-400 font-mono uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-3 text-center w-12">Selec.</th>
                        <th className="py-3 px-3">Código/EAN</th>
                        <th className="py-3 px-3">Peça / Produto Fiscal</th>
                        <th className="py-3 px-2 text-center w-16">Qtd XML</th>
                        <th className="py-3 px-3 text-right">Custo Un.</th>
                        <th className="py-3 px-3 text-right">Subtotal</th>
                        <th className="py-3 px-3">Correlação ERP & Destino de Estoque</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedXml.items.map((item, idx) => {
                        const isSelected = !!selectedXmlItems[item.code];
                        const matchedProduct = produtos.find(p => 
                          p.internalSku.toLowerCase() === item.code.toLowerCase() || 
                          (p.barcode && p.barcode === item.barcode)
                        );

                        return (
                          <tr key={idx} className="border-b border-gray-900/60 hover:bg-slate-950/10 transition-colors">
                            
                            {/* Checkbox */}
                            <td className="py-4 px-3 text-center">
                              <input 
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => setSelectedXmlItems(prev => ({ ...prev, [item.code]: e.target.checked }))}
                                className="w-4 h-4 rounded text-red-500 bg-slate-950 border-gray-800 focus:ring-0 cursor-pointer"
                              />
                            </td>

                            {/* Code / Sku */}
                            <td className="py-4 px-3 font-mono text-gray-300">
                              <span className="block font-bold">{item.code}</span>
                              <span className="text-[9px] text-gray-500">EAN: {item.barcode || "Ausente"}</span>
                            </td>

                            {/* Product Name */}
                            <td className="py-4 px-3 text-slate-100 font-semibold max-w-xs sm:max-w-md">
                              {item.name}
                              <span className="text-[9.5px] block text-purple-400 font-mono font-bold uppercase mt-0.5">{item.brand} • {item.unit}</span>
                            </td>

                            {/* XML quantity */}
                            <td className="py-4 px-2 text-center font-mono font-bold text-white">
                              {item.qty}
                            </td>

                            {/* Cost unit */}
                            <td className="py-4 px-3 text-right font-mono text-gray-300">
                              R$ {item.costPrice.toFixed(2)}
                            </td>

                            {/* Subtotal */}
                            <td className="py-4 px-3 text-right font-mono text-gray-150 font-bold">
                              R$ {(item.costPrice * item.qty).toFixed(2)}
                            </td>

                            {/* ERP stock matching */}
                            <td className="py-4 px-3">
                              {matchedProduct ? (
                                <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-900/20 text-[11px] leading-tight flex flex-col gap-0.5 text-left">
                                  <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono uppercase text-[9px]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block animate-pulse" />
                                    Produto Identificado
                                  </span>
                                  <span className="text-slate-350 block font-semibold truncate hover:text-white transition-colors">{matchedProduct.name}</span>
                                  <span className="text-gray-400 font-mono text-[9px]">SKU: {matchedProduct.internalSku} • Estoque atual: <strong className="text-slate-200">{matchedProduct.quantity} un</strong></span>
                                  <span className="text-green-500 font-mono text-[9px] mt-0.5 block font-bold">Novo Saldo ERP: {matchedProduct.quantity + item.qty} un</span>
                                </div>
                              ) : (
                                <div className="bg-amber-950/20 p-2.5 rounded-xl border border-amber-900/30 text-[11px] leading-tight flex flex-col gap-2 text-left">
                                  <span className="text-amber-400 font-bold font-mono uppercase text-[9px] block">
                                    🛑 Novo Componente Fiscal (Não Cadastrado)
                                  </span>
                                  <span className="text-[9.5px] text-gray-400">O item será cadastrado automaticamente como novo produto da oficina. Ajuste os dados se preferir:</span>
                                  
                                  <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div>
                                      <span className="text-[9px] text-gray-500 font-mono block">CATEGORIA</span>
                                      <select
                                        value={customCategories[item.code] || item.category}
                                        onChange={(e) => setCustomCategories(p => ({ ...p, [item.code]: e.target.value }))}
                                        className="w-full bg-[#080d19] border border-gray-800 text-[10px] rounded p-1 text-white font-mono"
                                      >
                                        {categoriesList.filter(c => c !== "Todas").map((cat, i) => (
                                          <option key={i} value={cat}>{cat}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <span className="text-[9px] text-gray-500 font-mono block">SUGESTÃO PREÇO VENDA (R$)</span>
                                      <input 
                                        type="number"
                                        step="0.1"
                                        value={customSellPrices[item.code] || item.sellPrice}
                                        onChange={(e) => setCustomSellPrices(p => ({ ...p, [item.code]: e.target.value }))}
                                        className="w-full bg-[#080d19] border border-gray-800 text-[10px] rounded p-1 text-white font-mono font-bold"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-950/30 p-4 rounded-xl border border-gray-900 mt-2 text-xs">
                  <div className="text-left">
                    <span className="text-gray-400 block font-semibold leading-relaxed">Considerações Importantes:</span>
                    <span className="text-[10.5px] text-gray-500 block">
                      - Apenas os itens marcados na caixa de seleção serão repostos ou cadastrados no estoque do sistema AutoTech.<br />
                      - O custo unitário informado pelo distribuidor substituirá o custo anterior para calibração exata de margens do financeiro.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmXmlImport}
                    className="py-3 px-6 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl font-bold font-mono text-white text-xs tracking-wider uppercase transition-all shadow-md shrink-0 flex items-center gap-1.5"
                  >
                    📥 PROCESSAR ENTRADA FISCAL E ATUALIZAR ESTOQUE
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* SUCCESS BANNER OR GENERAL INFOMESSAGE */}
          {!parsedXml && (
            <div className="bg-[#080d19] border border-gray-900 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-left">
                <span className="text-white font-display font-semibold text-xs uppercase block tracking-wider text-red-400">📊 NOTAS FISCAIS ELETRÔNICAS IMPORTADAS</span>
                <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                  Todas as notas importadas são salvas com auditoria. Veja as movimentações correspondentes na aba "Movimentações" para prestação de contas dos estoquistas de oficina em tempo real.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setActiveTab('movimentacoes')}
                className="py-1.5 px-3 bg-slate-950/60 border border-gray-800 text-[10px] uppercase font-bold hover:text-white font-mono text-gray-400 rounded-lg shrink-0 transition-colors"
              >
                Visualizar Movimentações
              </button>
            </div>
          )}

        </div>
      )}

      {/* 🚀 INVENTORY BARCODE SUCCESS TOAST POPUP */}
      {stockScanToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#160d2d] border-2 border-purple-500 rounded-xl p-4 shadow-[0_4px_25px_rgba(147,51,234,0.30)] flex items-center gap-3 max-w-sm animate-bounce text-left">
          <div className="p-2.5 rounded-full bg-purple-950 text-purple-300">
            <Barcode className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-purple-300 block font-bold uppercase tracking-wider">⚡ DETECTOR ASSISTIDO</span>
            <p className="text-xs text-white font-bold leading-tight">{stockScanToast}</p>
            <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">Pronto para cadastro / Gravação</span>
          </div>
        </div>
      )}

      {/* 📹 INVENTORY ADVANCED SIMULATOR BARCODE SCAN MODAL */}
      {showStockScannerModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm text-left">
          <div className="bg-[#0b101d] border border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative flex flex-col gap-5">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-purple-950/40 border border-purple-900 border-dashed text-purple-400 font-mono text-[9px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded w-max">
                  🎥 MÓDULO ÓPTICO RECEPTOR
                </span>
                <h3 className="text-base font-display font-extrabold text-white mt-2 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-400 animate-pulse" />
                  Escanear código de barras para {stockScannerTarget === 'new' ? 'Novo Produto' : 'Edição'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowStockScannerModal(false)}
                className="text-gray-400 hover:text-white bg-slate-900/40 hover:bg-slate-800 border border-gray-800 rounded-xl p-2 cursor-pointer transition-colors"
              >
                X
              </button>
            </div>

            {/* Visual Camera Scan Line & Target grid */}
            <div className="bg-slate-950 border border-purple-900/10 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden h-44">
              <div className="absolute inset-0 bg-[#030712] border-2 border-dashed border-purple-950/40 rounded-xl flex items-center justify-center pointer-events-none">
                <div className="w-40 h-20 border border-purple-500/30 rounded flex items-center justify-center relative">
                  <div className="absolute left-0 right-0 h-[2px] bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.7)] animate-bounce" style={{ animationDuration: '2s' }} />
                  <div className="flex gap-0.5 items-center opacity-25 select-none">
                    <div className="w-1 h-12 bg-white" />
                    <div className="w-0.5 h-12 bg-white" />
                    <div className="w-1 h-12 bg-white" />
                    <div className="w-1.5 h-12 bg-white" />
                    <div className="w-0.5 h-12 bg-white" />
                    <div className="w-1 h-12 bg-white" />
                  </div>
                </div>
              </div>
              
              <div className="z-10 bg-slate-900/90 p-2 rounded border border-gray-800 text-center mt-6">
                <span className="text-[9px] font-mono text-purple-300 uppercase tracking-widest block animate-pulse">● Câmera Ativa</span>
                <span className="text-[9px] text-gray-400 block max-w-[240px] leading-tight">Mire o código de barras ou use as amostras abaixo para importar.</span>
              </div>
            </div>

            {/* Simulated target shortcuts to instantly fill the input */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold text-gray-400">AMOSTRE UM PRODUTO PADRÃO DO MERCADO:</span>
              
              <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {[
                  { name: "Pastilhas de Freio Bosch Premium", code: "7891002003001" },
                  { name: "Filtro de Óleo Fram ExtraGuard", code: "7892201103002" },
                  { name: "Óleo de Motor Castrol Magnatec 5W30", code: "7891102203301" },
                  { name: "Jogo de Velas de Ignição NGK Iridium", code: "7893004005001" },
                  { name: "Bucha da Barra Estabilizadora Cofap", code: "7894506007001" }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      playStockBeeper();
                      if (stockScannerTarget === 'new') {
                        setNewProdBarcode(item.code);
                      } else {
                        setEditingProdBarcode(item.code);
                      }
                      setStockScanToast(`Código ${item.code} atribuído com sucesso!`);
                      setTimeout(() => setStockScanToast(null), 2500);
                      setShowStockScannerModal(false);
                    }}
                    className="p-2 rounded bg-[#0c1223] border border-gray-850 hover:border-purple-500/30 font-sans text-xs text-left text-white flex justify-between items-center transition-all cursor-pointer"
                  >
                    <div>
                      <span className="font-bold block">{item.name}</span>
                      <span className="text-[9px] text-gray-450 font-mono text-slate-400">Código EAN: {item.code}</span>
                    </div>
                    <span className="text-[10px] bg-purple-950 text-purple-400 px-2 py-0.5 rounded border border-purple-900/40 uppercase font-mono tracking-widest font-extrabold font-bold">
                      BIPAR
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-850 pt-3">
              <button 
                type="button"
                onClick={() => setShowStockScannerModal(false)}
                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-gray-400 hover:text-white font-mono text-[10px] uppercase font-bold border border-gray-800 rounded-xl transition-colors cursor-pointer"
              >
                Voltar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🛑 CUSTOM INTERACTIVE MODAL FOR CRITICAL CATALOG ITEM REMOVAL */}
      <AnimatePresence>
        {isDeleteModalOpen && productToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[#0b101d] border border-red-950/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative flex flex-col gap-5 overflow-hidden"
            >
              {/* Sleek Warning Glow Background Gradient */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
              
              <div className="flex gap-4 items-start border-b border-gray-850 pb-5">
                <div className="p-3 bg-red-950/30 text-red-500 border border-red-900/40 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-red-500 uppercase tracking-widest block">
                    AÇÃO IRREVERSÍVEL DETECTADA
                  </span>
                  <h3 className="text-lg font-display font-extrabold text-white mt-1">
                    Excluir Peça Crítica do Catálogo?
                  </h3>
                  <p className="text-xs text-gray-400 font-sans mt-1">
                    Esta ação apagará permanentemente o registro de estoque do sistema. Veja os impactos operacionais abaixo:
                  </p>
                </div>
              </div>

              {/* Product Profile Detail Card */}
              <div className="bg-[#050912]/80 border border-gray-900 rounded-2xl p-4 flex flex-col gap-2 font-sans text-xs">
                <div className="flex justify-between border-b border-gray-900 pb-2">
                  <span className="text-gray-500">Nome do Item:</span>
                  <span className="text-white font-bold">{productToDelete.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-900 pb-2">
                  <span className="text-gray-500">Marca / Fabricante:</span>
                  <span className="text-white font-medium">{productToDelete.brand || "Não Informada"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-900 pb-2">
                  <span className="text-gray-500">SKU / Código:</span>
                  <span className="text-slate-350 font-mono text-[11px]">{productToDelete.sku || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estoque Disponível:</span>
                  <span className="text-orange-400 font-bold">{productToDelete.quantity} unidades</span>
                </div>
              </div>

              {/* Side-by-Side Impact Analysis Bento Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-gray-950/30 border border-gray-900 flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    OS & Orçamentos
                  </span>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                    Esta peça deixará de constar nos controles de faturamento, vendas rápidas no PDV e pátio mecânico imediatamente.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-red-950/10 border border-red-900/10 flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    Impacto de Receita
                  </span>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                    Purga total do ativo avaliado em <strong className="text-white text-xs">R$ {(productToDelete.sellPrice * productToDelete.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> potenciais em caixa.
                  </p>
                </div>
              </div>

              {/* Warning Notice Banner */}
              <div className="p-3 rounded-xl bg-orange-950/15 border border-orange-900/20 text-[11px] text-orange-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-normal">
                  Todas as integrações da assistente de IA, históricos de movimentações físicas correspondentes e relatórios consolidados do painel administrativo exibirão as exclusões no log de auditoria.
                </p>
              </div>

              {/* Buttons Row */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 border-t border-gray-850 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setProductToDelete(null);
                  }}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-850 text-gray-400 hover:text-white font-mono text-[10px] uppercase font-bold border border-gray-800 rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancelar e Preservar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (productToDelete) {
                      await deleteProduto(productToDelete.id);
                      setIsDeleteModalOpen(false);
                      setProductToDelete(null);
                    }
                  }}
                  className="py-2.5 px-4 bg-red-650 hover:bg-red-700 text-white font-mono text-[10px] uppercase font-bold border border-red-800/20 rounded-xl shadow-[0_4px_10px_rgba(239,68,68,0.2)] hover:shadow-[0_4px_15px_rgba(239,68,68,0.35)] transition-all cursor-pointer text-center"
                >
                  Confirmar Exclusão
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
