import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle,
  FileCode,
  Settings,
  AlertCircle,
  Clock,
  ShoppingBag,
  Calendar,
  Hourglass,
  Zap,
  Bot,
  Sparkles,
  DollarSign,
  Copy,
  FlaskConical,
  Wrench,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Scan
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Produto, Fornecedor, OrdemServico } from '../types';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

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

export interface StockPresetItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  sku: string;
  compatibility: string;
  manufacturer: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;
  minStock: number;
  group: 'eletrica' | 'quimica' | 'insumos' | 'geral';
  groupLabel: string;
}

export interface BarcodePartSample {
  barcode: string;
  name: string;
  brand: string;
  sku: string;
  category: string;
  compatibility: string;
  manufacturer: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;
  minStock: number;
  iconType: 'lamp' | 'glue' | 'spray' | 'filter' | 'plug' | 'relay';
}

export const BARCODE_PARTS_DATABASE: BarcodePartSample[] = [
  {
    barcode: "7891002003001",
    name: "Lâmpada H7 Halógena 12V 55W Philips Standard",
    brand: "Philips",
    sku: "LMP-H7-PHL",
    category: "Elétrica",
    compatibility: "Farol Baixo/Alto Universal 12V (VW, Fiat, GM, Ford, Hyundai, Renault)",
    manufacturer: "Philips Automotive",
    costPrice: 15.00,
    sellPrice: 38.00,
    quantity: 10,
    minStock: 4,
    iconType: 'lamp'
  },
  {
    barcode: "7894561230002",
    name: "Lâmpada H4 Halógena 12V 60/55W Osram Night Breaker",
    brand: "Osram",
    sku: "LMP-H4-OSR",
    category: "Elétrica",
    compatibility: "Farol Baixo/Alto Duplo - Gol, Uno, Palio, Ka, Corsa, Onix, HB20",
    manufacturer: "Osram GmbH",
    costPrice: 18.00,
    sellPrice: 42.00,
    quantity: 10,
    minStock: 4,
    iconType: 'lamp'
  },
  {
    barcode: "7898001002001",
    name: "Silicone RTV Alta Temperatura Cinza 50g Tekbond",
    brand: "Tekbond",
    sku: "SIL-RTV-50G",
    category: "Química & Insumos",
    compatibility: "Juntas de Motor, Cárter, Caixa de Câmbio, Bomba d'Água (Até 315°C)",
    manufacturer: "Tekbond Saint-Gobain",
    costPrice: 18.50,
    sellPrice: 38.00,
    quantity: 15,
    minStock: 5,
    iconType: 'glue'
  },
  {
    barcode: "7896001003001",
    name: "Cola Trava Rosca Média Torque 242 10g Loctite",
    brand: "Loctite",
    sku: "COL-LOC-242",
    category: "Química & Insumos",
    compatibility: "Fixação e Vedação de Parafusos M6 a M20 (Evita Afrouxamento por Vibração)",
    manufacturer: "Henkel Loctite",
    costPrice: 25.00,
    sellPrice: 55.00,
    quantity: 12,
    minStock: 3,
    iconType: 'glue'
  },
  {
    barcode: "7897001004001",
    name: "Desengripante e Lubrificante Spray WD-40 300ml",
    brand: "WD-40",
    sku: "SPR-WD40-300",
    category: "Química & Insumos",
    compatibility: "Remoção de Ferrugem, Destravamento de Porcas, Proteção Contra Umidade",
    manufacturer: "WD-40 Company",
    costPrice: 22.00,
    sellPrice: 45.00,
    quantity: 18,
    minStock: 4,
    iconType: 'spray'
  },
  {
    barcode: "7892201103002",
    name: "Filtro de Óleo Lubrificante Fram ExtraGuard PH5548",
    brand: "Fram",
    sku: "FLT-OIL-FRM",
    category: "Filtros",
    compatibility: "Linha Leve VW/Fiat 1.0, 1.4, 1.6 8V/16V",
    manufacturer: "Fram Filtration",
    costPrice: 18.00,
    sellPrice: 39.90,
    quantity: 25,
    minStock: 8,
    iconType: 'filter'
  },
  {
    barcode: "7893004005001",
    name: "Jogo de Velas de Ignição NGK Green Plug BKR6E-11",
    brand: "NGK",
    sku: "VEL-NGK-BKR6E",
    category: "Ignição",
    compatibility: "VW Gol, Fox, Voyage 1.0/1.6 TotalFlex, Fiat Palio 1.0 Fire",
    manufacturer: "NGK Spark Plug",
    costPrice: 58.00,
    sellPrice: 120.00,
    quantity: 12,
    minStock: 4,
    iconType: 'plug'
  },
  {
    barcode: "7895001006001",
    name: "Relé Auxiliar 4 Pinos 12V 40A DNI com Suporte",
    brand: "DNI",
    sku: "RLE-AUX-4P",
    category: "Elétrica",
    compatibility: "Buzina, Farol de Milha, Ventoinha, Bomba de Combustível 12V",
    manufacturer: "DNI Indústria",
    costPrice: 12.00,
    sellPrice: 28.00,
    quantity: 10,
    minStock: 3,
    iconType: 'relay'
  }
];

export const STOCK_PRESET_ITEMS: StockPresetItem[] = [
  // ⚡ LÂMPADAS & ELÉTRICA
  {
    id: 'prst_h7',
    name: 'Lâmpada H7 Halógena 12V 55W',
    category: 'Elétrica',
    brand: 'Philips',
    sku: 'LMP-H7-PHL',
    compatibility: 'Farol Baixo/Alto - Universal 12V (VW, Fiat, GM, Ford, Hyundai, Renault)',
    manufacturer: 'Philips Automotive',
    costPrice: 15.00,
    sellPrice: 38.00,
    quantity: 10,
    minStock: 4,
    group: 'eletrica',
    groupLabel: '⚡ Lâmpadas & Elétrica'
  },
  {
    id: 'prst_h4',
    name: 'Lâmpada H4 Halógena 12V 60/55W',
    category: 'Elétrica',
    brand: 'Osram',
    sku: 'LMP-H4-OSR',
    compatibility: 'Farol Baixo/Alto Duplo - Gol, Uno, Palio, Ka, Corsa, Onix, HB20',
    manufacturer: 'Osram GmbH',
    costPrice: 18.00,
    sellPrice: 42.00,
    quantity: 10,
    minStock: 4,
    group: 'eletrica',
    groupLabel: '⚡ Lâmpadas & Elétrica'
  },
  {
    id: 'prst_h1',
    name: 'Lâmpada H1 Halógena 12V 55W',
    category: 'Elétrica',
    brand: 'Philips',
    sku: 'LMP-H1-PHL',
    compatibility: 'Farol Alto / Farol de Milha - Linha Leve Universal 12V',
    manufacturer: 'Philips Automotive',
    costPrice: 14.00,
    sellPrice: 35.00,
    quantity: 8,
    minStock: 3,
    group: 'eletrica',
    groupLabel: '⚡ Lâmpadas & Elétrica'
  },
  {
    id: 'prst_h11',
    name: 'Lâmpada H11 Halógena 12V 55W (Farol de Milha)',
    category: 'Elétrica',
    brand: 'Osram',
    sku: 'LMP-H11-OSR',
    compatibility: 'Farol de Neblina / Milha - Honda Civic, Corolla, Renegade, Compass',
    manufacturer: 'Osram GmbH',
    costPrice: 22.00,
    sellPrice: 55.00,
    quantity: 6,
    minStock: 2,
    group: 'eletrica',
    groupLabel: '⚡ Lâmpadas & Elétrica'
  },
  {
    id: 'prst_t10',
    name: 'Lâmpada Pingão LED T10 12V W5W Branca',
    category: 'Elétrica',
    brand: 'Osram',
    sku: 'LMP-T10-LED',
    compatibility: 'Luz de Placa, Teto, Lanterna Dianteira - Universal 12V',
    manufacturer: 'Osram GmbH',
    costPrice: 4.50,
    sellPrice: 15.00,
    quantity: 20,
    minStock: 6,
    group: 'eletrica',
    groupLabel: '⚡ Lâmpadas & Elétrica'
  },
  {
    id: 'prst_p21w',
    name: 'Lâmpada P21W 1156 1 Polo Amarela (Seta/Pisca)',
    category: 'Elétrica',
    brand: 'Philips',
    sku: 'LMP-P21W-AMR',
    compatibility: 'Lanterna de Seta / Pisca / Ré - Universal 12V',
    manufacturer: 'Philips Automotive',
    costPrice: 3.00,
    sellPrice: 10.00,
    quantity: 20,
    minStock: 6,
    group: 'eletrica',
    groupLabel: '⚡ Lâmpadas & Elétrica'
  },
  {
    id: 'prst_fusivel_kit',
    name: 'Kit Fusíveis Lâmina Automotivo (10A, 15A, 20A, 30A)',
    category: 'Elétrica',
    brand: 'DNI',
    sku: 'FUS-LAM-KIT',
    compatibility: 'Caixa de Fusíveis de Veículos Leves e Utilitários 12V',
    manufacturer: 'DNI Indústria',
    costPrice: 1.20,
    sellPrice: 5.00,
    quantity: 50,
    minStock: 15,
    group: 'eletrica',
    groupLabel: '⚡ Lâmpadas & Elétrica'
  },
  {
    id: 'prst_rele_4p',
    name: 'Relé Auxiliar 4 Pinos 12V 40A com Suporte',
    category: 'Elétrica',
    brand: 'DNI',
    sku: 'RLE-AUX-4P',
    compatibility: 'Buzina, Farol de Milha, Ventoinha, Bomba de Combustível',
    manufacturer: 'DNI Indústria',
    costPrice: 12.00,
    sellPrice: 28.00,
    quantity: 10,
    minStock: 3,
    group: 'eletrica',
    groupLabel: '⚡ Lâmpadas & Elétrica'
  },
  {
    id: 'prst_limp_contato',
    name: 'Limpador de Contato Elétrico Spray 300ml',
    category: 'Elétrica',
    brand: 'Orbi Química',
    sku: 'LMP-CNT-300',
    compatibility: 'Limpeza de conectores, sensores MAP/MAF, relés e chicotes',
    manufacturer: 'Orbi Química',
    costPrice: 14.00,
    sellPrice: 32.00,
    quantity: 12,
    minStock: 4,
    group: 'eletrica',
    groupLabel: '⚡ Lâmpadas & Elétrica'
  },

  // 🧪 COLAS, SILICONES & QUÍMICOS
  {
    id: 'prst_sili_rtv_cinza',
    name: 'Silicone de Alta Temperatura RTV Cinza 50g',
    category: 'Química & Insumos',
    brand: 'Orbi Química',
    sku: 'SIL-RTV-CINZA',
    compatibility: 'Vedação de Cárter, Tampa de Válvula, Bomba d\'Água e Flanges',
    manufacturer: 'Orbi Química',
    costPrice: 11.50,
    sellPrice: 28.00,
    quantity: 12,
    minStock: 4,
    group: 'quimica',
    groupLabel: '🧪 Colas, Silicones & Química'
  },
  {
    id: 'prst_sili_rtv_preto',
    name: 'Silicone de Alta Temperatura RTV Preto 50g',
    category: 'Química & Insumos',
    brand: 'Tekbond',
    sku: 'SIL-RTV-PRETO',
    compatibility: 'Vedação de Cárter, Transmissão e Tampa de Válvula',
    manufacturer: 'Tekbond Saint-Gobain',
    costPrice: 11.50,
    sellPrice: 28.00,
    quantity: 12,
    minStock: 4,
    group: 'quimica',
    groupLabel: '🧪 Colas, Silicones & Química'
  },
  {
    id: 'prst_trava_242',
    name: 'Cola Trava Química Rosca Média 242 (Loctite / Tekbond 10g)',
    category: 'Química & Insumos',
    brand: 'Loctite',
    sku: 'TRV-LOCT-242',
    compatibility: 'Fixação e vedação de parafusos de motor, freios e suspensão',
    manufacturer: 'Henkel Loctite',
    costPrice: 22.00,
    sellPrice: 48.00,
    quantity: 8,
    minStock: 2,
    group: 'quimica',
    groupLabel: '🧪 Colas, Silicones & Química'
  },
  {
    id: 'prst_cola_instant',
    name: 'Adesivo/Cola Instantânea Cianoacrilato 20g',
    category: 'Química & Insumos',
    brand: 'Tekbond',
    sku: 'CLA-INST-20G',
    compatibility: 'Colagem rápida de borracha, plástico, frisos e acabamentos',
    manufacturer: 'Tekbond Saint-Gobain',
    costPrice: 6.00,
    sellPrice: 16.00,
    quantity: 15,
    minStock: 5,
    group: 'quimica',
    groupLabel: '🧪 Colas, Silicones & Química'
  },
  {
    id: 'prst_cola_parabrisa',
    name: 'Cola de Para-brisa Poliuretano PU 55 Preto 400g',
    category: 'Química & Insumos',
    brand: '3M',
    sku: 'CLA-PU55-PAR',
    compatibility: 'Colagem de vidro de para-brisa, vigias e vedação de carroceria',
    manufacturer: '3M do Brasil',
    costPrice: 28.00,
    sellPrice: 65.00,
    quantity: 6,
    minStock: 2,
    group: 'quimica',
    groupLabel: '🧪 Colas, Silicones & Química'
  },
  {
    id: 'prst_cola_junta',
    name: 'Cola Veda Junta de Motor Automotivo 73g',
    category: 'Química & Insumos',
    brand: '3M',
    sku: 'CLA-JNT-MTR',
    compatibility: 'Juntas de papel, cortiça e feltro de motores automotivos',
    manufacturer: '3M do Brasil',
    costPrice: 9.00,
    sellPrice: 22.00,
    quantity: 10,
    minStock: 3,
    group: 'quimica',
    groupLabel: '🧪 Colas, Silicones & Química'
  },

  // 🛠️ INSUMOS & SPRAY DA OFICINA
  {
    id: 'prst_desengri_wd40',
    name: 'Desengripante Spray WD-40 / White Lub 300ml',
    category: 'Química & Insumos',
    brand: 'WD-40',
    sku: 'DSG-WD40-300',
    compatibility: 'Lubrificação de dobradiças, soltar parafusos emperrados e proteção',
    manufacturer: 'WD-40 Company',
    costPrice: 18.00,
    sellPrice: 38.00,
    quantity: 15,
    minStock: 5,
    group: 'insumos',
    groupLabel: '🛠️ Insumos & Oficina'
  },
  {
    id: 'prst_fita_3m',
    name: 'Fita Isolante 19mm x 20m PVC Imperial 3M',
    category: 'Elétrica',
    brand: '3M',
    sku: 'FT-ISO-3M20',
    compatibility: 'Isolamento térmico e elétrico de chicotes automotivos até 600V',
    manufacturer: '3M do Brasil',
    costPrice: 5.50,
    sellPrice: 14.00,
    quantity: 25,
    minStock: 8,
    group: 'insumos',
    groupLabel: '🛠️ Insumos & Oficina'
  },
  {
    id: 'prst_fita_autofusao',
    name: 'Fita de Auto-Fusão 19mm x 5m 3M',
    category: 'Elétrica',
    brand: '3M',
    sku: 'FT-AUT-FUS',
    compatibility: 'Isolamento impermeável à prova d\'água em conexões elétricas externas',
    manufacturer: '3M do Brasil',
    costPrice: 16.00,
    sellPrice: 38.00,
    quantity: 8,
    minStock: 2,
    group: 'insumos',
    groupLabel: '🛠️ Insumos & Oficina'
  },
  {
    id: 'prst_limpa_tbi',
    name: 'Desengraxante / CarboCleaner Spray Limpa TBI 300ml',
    category: 'Química & Insumos',
    brand: 'Orbi Química',
    sku: 'LMP-TBI-300',
    compatibility: 'Desincrustação de borboleta TBI, carburadores e válvulas EGR',
    manufacturer: 'Orbi Química',
    costPrice: 15.00,
    sellPrice: 35.00,
    quantity: 12,
    minStock: 4,
    group: 'insumos',
    groupLabel: '🛠️ Insumos & Oficina'
  },
  {
    id: 'prst_graxa_litio',
    name: 'Graxa Branca com Lítio Spray 300ml',
    category: 'Lubrificantes',
    brand: 'White Lub',
    sku: 'GRX-LIT-300',
    compatibility: 'Lubrificação de fechaduras, canaletas, cabos e engrenagens',
    manufacturer: 'Orbi Química',
    costPrice: 13.00,
    sellPrice: 30.00,
    quantity: 10,
    minStock: 3,
    group: 'insumos',
    groupLabel: '🛠️ Insumos & Oficina'
  },

  // ⚙️ GERAL (PEÇAS E FLUIDOS)
  {
    id: 'prst_pastilha_freio',
    name: 'Pastilha de Freio Dianteira Cerâmica',
    category: 'Freios',
    brand: 'Bosch',
    sku: 'PST-BSH-CER',
    compatibility: 'VW Gol, Voyage, Fox, Polo 1.0/1.6 (2012 em diante)',
    manufacturer: 'Bosch GmbH',
    costPrice: 65.00,
    sellPrice: 140.00,
    quantity: 10,
    minStock: 3,
    group: 'geral',
    groupLabel: '⚙️ Freios, Filtros & Óleos'
  },
  {
    id: 'prst_filtro_oleo',
    name: 'Filtro de Óleo Lubrificante Motor 1.0/1.6',
    category: 'Filtros',
    brand: 'Tecfil',
    sku: 'FLT-TCF-01',
    compatibility: 'VW, Fiat, GM Linha Leve 1.0 e 1.6 Flex',
    manufacturer: 'Tecfil S/A',
    costPrice: 12.00,
    sellPrice: 28.00,
    quantity: 20,
    minStock: 5,
    group: 'geral',
    groupLabel: '⚙️ Freios, Filtros & Óleos'
  },
  {
    id: 'prst_oleo_5w30',
    name: 'Óleo de Motor 5W30 Sintético 1L',
    category: 'Lubrificantes',
    brand: 'Mobil',
    sku: 'OLE-5W30-MOB',
    compatibility: 'Atende especificações API SP / ILSAC GF-6 (GM, Ford, Fiat)',
    manufacturer: 'Mobil Super',
    costPrice: 24.00,
    sellPrice: 48.00,
    quantity: 24,
    minStock: 8,
    group: 'geral',
    groupLabel: '⚙️ Freios, Filtros & Óleos'
  }
];

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

const parseNfeXmlContent = (xmlText: string, defaultMarkup: number = 80): ParsedXMLDoc | null => {
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
          sellPrice: Math.round(vUnCom * (1 + defaultMarkup / 100)),
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
    deleteFornecedor,
    ordensServico,
    company
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
  const [showXmlImporterModal, setShowXmlImporterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [onlyCriticalFilter, setOnlyCriticalFilter] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

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

  // Check if SKU already exists in product database
  const duplicateNewProd = newProdSku.trim() 
    ? (produtos || []).find(p => p.internalSku?.trim().toUpperCase() === newProdSku.trim().toUpperCase()) 
    : null;

  const duplicateEditingProd = (editingProdSku.trim() && editingProdId) 
    ? (produtos || []).find(p => p.id !== editingProdId && p.internalSku?.trim().toUpperCase() === editingProdSku.trim().toUpperCase()) 
    : null;

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
  const categoriesList = ['Todas', 'Freios', 'Filtros', 'Lubrificantes', 'Suspensão', 'Ignição', 'Carroceria', 'Elétrica', 'Química & Insumos', 'Acessórios'];

  // Presets and Autocomplete states
  const [selectedPresetGroup, setSelectedPresetGroup] = useState<'all' | 'eletrica' | 'quimica' | 'insumos' | 'geral'>('all');
  const [showNameAutocomplete, setShowNameAutocomplete] = useState(false);
  const [presetSuccessNotice, setPresetSuccessNotice] = useState('');
  const [batchModeKeepCategory, setBatchModeKeepCategory] = useState(false);

  // Apply preset helper
  const applyStockPreset = (preset: StockPresetItem) => {
    setNewProdName(preset.name);
    setNewProdCategory(preset.category);
    setNewProdBrand(preset.brand);
    setNewProdManufacturer(preset.manufacturer || preset.brand);
    setNewProdSku(preset.sku);
    setNewProdCompatibility(preset.compatibility);
    setNewProdCost(preset.costPrice.toFixed(2));
    setNewProdSell(preset.sellPrice.toFixed(2));
    setNewProdQty(preset.quantity.toString());
    setNewProdMin(preset.minStock.toString());
    if (!newProdBarcode) {
      setNewProdBarcode("789" + Math.floor(1000000000 + Math.random() * 900000000));
    }
  };

  // Filtered presets
  const filteredPresets = STOCK_PRESET_ITEMS.filter(item => {
    if (selectedPresetGroup === 'all') return true;
    return item.group === selectedPresetGroup;
  });

  // Autocomplete matches based on newProdName
  const autocompleteMatches = newProdName.trim().length >= 2
    ? STOCK_PRESET_ITEMS.filter(item => 
        item.name.toLowerCase().includes(newProdName.toLowerCase()) ||
        item.brand.toLowerCase().includes(newProdName.toLowerCase()) ||
        item.category.toLowerCase().includes(newProdName.toLowerCase())
      )
    : [];

  // Movement logs
  const [movementsList, setMovementsList] = useState([
    { id: "mov_1", date: "2026-05-25 14:10", sku: "PST-BSH-01", type: "Saída (PDV)", qty: 1, balance: 14, user: "Aline Oliveira" },
    { id: "mov_2", date: "2026-05-24 10:00", sku: "FLT-FRM-02", type: "Entrada (Fornecedor)", qty: 20, balance: 42, user: "Felipe Castanhari" },
    { id: "mov_3", date: "2026-05-22 08:30", sku: "VEL-NGK-IRD", type: "Saída (OS-002)", qty: 4, balance: 5, user: "Marcio Rezende" }
  ]);

  // Selected Product for 6-Month Movement Line Chart
  const [selectedChartProdId, setSelectedChartProdId] = useState<string>('');

  // Helper to calculate 6-month entries and exits for a specific product
  const getMonthlyMovementsForProduct = (
    prod: Produto | undefined, 
    allOS: OrdemServico[], 
    allMovements: any[]
  ) => {
    if (!prod) return { monthsData: [], totalEntradas: 0, totalSaidas: 0, saldoLiquido: 0, mediaMensalSaida: 0 };

    const months = [];
    const now = new Date();
    
    // Generate past 6 months array (from 5 months ago to current month)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthShort = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      const monthLabel = monthShort.charAt(0).toUpperCase() + monthShort.slice(1);
      const yearShort = d.getFullYear().toString().slice(-2);
      const label = `${monthLabel}/${yearShort}`; // e.g. "Fev/26"
      
      const yearNum = d.getFullYear();
      const monthNum = d.getMonth(); // 0-indexed
      
      // Real movements in movementsList for this product & month
      const realMovementsInMonth = allMovements.filter(m => {
        if (!m.sku || m.sku.toLowerCase() !== prod.internalSku.toLowerCase()) return false;
        const mDate = new Date(m.date);
        return mDate.getFullYear() === yearNum && mDate.getMonth() === monthNum;
      });

      let realEntradas = 0;
      let realSaidas = 0;

      realMovementsInMonth.forEach(m => {
        if (m.type.startsWith('Entrada') || m.type.startsWith('Saldo') || m.type.includes('Estoque Inicial') || m.type.includes('Ajuste Entrada')) {
          realEntradas += (m.qty || 0);
        } else if (m.type.startsWith('Saída') || m.type.includes('Ajuste Saída') || m.type.includes('PDV') || m.type.includes('OS')) {
          realSaidas += (m.qty || 0);
        }
      });

      // Real OS parts consumed in this month
      allOS.forEach(os => {
        if (!os.createdAt) return;
        const osDate = new Date(os.createdAt);
        if (osDate.getFullYear() === yearNum && osDate.getMonth() === monthNum) {
          os.parts?.forEach(part => {
            if (part.id === prod.id || part.name.toLowerCase() === prod.name.toLowerCase()) {
              realSaidas += (part.quantity || 0);
            }
          });
        }
      });

      // Deterministic calculation for realistic historical trend curve
      let seed = 0;
      for (let c = 0; c < prod.id.length; c++) seed += prod.id.charCodeAt(c);
      
      const baseExitFactor = Math.max(1, Math.floor(((seed * (i + 4) * 7) % 8) + (prod.minStock * 0.7)));
      const baseEntryFactor = (i === 1 || i === 4) ? Math.floor(baseExitFactor * 2.2 + 3) : (i === 0 ? Math.floor(baseExitFactor * 1.5) : Math.floor(baseExitFactor * 0.3));

      const finalEntradas = realEntradas > 0 ? realEntradas : baseEntryFactor;
      const finalSaidas = realSaidas > 0 ? realSaidas : baseExitFactor;

      months.push({
        label,
        fullMonth: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        entradas: finalEntradas,
        saidas: finalSaidas,
        saldoMes: finalEntradas - finalSaidas
      });
    }

    const totalEntradas = months.reduce((acc, m) => acc + m.entradas, 0);
    const totalSaidas = months.reduce((acc, m) => acc + m.saidas, 0);
    const mediaEntradas = totalEntradas / 6;
    const mediaSaidas = totalSaidas / 6;
    const saldoLiquido = totalEntradas - totalSaidas;
    const mediaMensalSaida = parseFloat(mediaSaidas.toFixed(1));

    const anomaliesList: { month: string; type: 'Entrada' | 'Saída'; qty: number; reason: string; diffPct: number }[] = [];

    // Annotate months with automatic anomaly and spike detection
    const monthsWithAnomalies = months.map(m => {
      const diffEntradaPct = mediaEntradas > 0 ? Math.round(((m.entradas - mediaEntradas) / mediaEntradas) * 100) : 0;
      const diffSaidaPct = mediaSaidas > 0 ? Math.round(((m.saidas - mediaSaidas) / mediaSaidas) * 100) : 0;

      // Anomaly threshold: >= 40% above average and at least 3 units
      const isAnomalyEntrada = m.entradas >= 4 && m.entradas >= mediaEntradas * 1.4;
      const isAnomalySaida = m.saidas >= 3 && m.saidas >= mediaSaidas * 1.4;

      const anomalyReasonEntrada = isAnomalyEntrada 
        ? `Lote/Pico de Reabastecimento incomum (+${m.entradas} un, +${diffEntradaPct}% acima da média)` 
        : '';
      const anomalyReasonSaida = isAnomalySaida 
        ? `Pico de Consumo/Demanda Oficina (-${m.saidas} un, +${diffSaidaPct}% acima da média)` 
        : '';

      if (isAnomalyEntrada) {
        anomaliesList.push({
          month: m.label,
          type: 'Entrada',
          qty: m.entradas,
          reason: anomalyReasonEntrada,
          diffPct: diffEntradaPct
        });
      }
      if (isAnomalySaida) {
        anomaliesList.push({
          month: m.label,
          type: 'Saída',
          qty: m.saidas,
          reason: anomalyReasonSaida,
          diffPct: diffSaidaPct
        });
      }

      return {
        ...m,
        isAnomalyEntrada,
        isAnomalySaida,
        anomalyReasonEntrada,
        anomalyReasonSaida,
        diffEntradaPct,
        diffSaidaPct
      };
    });

    return {
      monthsData: monthsWithAnomalies,
      totalEntradas,
      totalSaidas,
      saldoLiquido,
      mediaMensalSaida,
      mediaEntradas: parseFloat(mediaEntradas.toFixed(1)),
      anomaliesList
    };
  };

  // Helper to calculate 12-month demand forecast and runout estimate for a product
  const calculate12MonthDemandForecast = (
    prod: Produto | undefined, 
    allOS: OrdemServico[], 
    allMovements: any[]
  ) => {
    if (!prod) {
      return {
        annualTotalExits: 0,
        monthlyAverageExits: 0,
        dailyAverageExits: 0,
        daysUntilStockout: 0,
        status: 'OUT_OF_STOCK' as const,
        suggestedReorderQty: 0,
        monthlyTrend: []
      };
    }

    const now = new Date();
    let annualTotalExits = 0;
    const monthlyTrend = [];

    // Past 12 months (i = 11 down to 0)
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearNum = d.getFullYear();
      const monthNum = d.getMonth();

      let realSaidasInMonth = 0;

      // Real OS consumption
      (allOS || []).forEach(os => {
        if (!os.createdAt) return;
        const osDate = new Date(os.createdAt);
        if (osDate.getFullYear() === yearNum && osDate.getMonth() === monthNum) {
          os.parts?.forEach(part => {
            if (part.id === prod.id || (part.name && part.name.toLowerCase() === prod.name.toLowerCase())) {
              realSaidasInMonth += (part.quantity || 0);
            }
          });
        }
      });

      // Real inventory exit movements
      (allMovements || []).forEach(m => {
        if (!m.sku || m.sku.toLowerCase() !== prod.internalSku.toLowerCase()) return;
        const mDate = new Date(m.date);
        if (mDate.getFullYear() === yearNum && mDate.getMonth() === monthNum) {
          if (m.type.startsWith('Saída') || m.type.includes('Ajuste Saída') || m.type.includes('PDV') || m.type.includes('OS')) {
            realSaidasInMonth += (m.qty || 0);
          }
        }
      });

      // Deterministic baseline trend based on product ID & minStock
      let seed = 0;
      for (let c = 0; c < prod.id.length; c++) seed += prod.id.charCodeAt(c);
      const baselineExit = Math.max(1, Math.floor(((seed * (i + 3) * 11) % 9) + (prod.minStock * 0.6)));

      const finalMonthExit = realSaidasInMonth > 0 ? realSaidasInMonth : baselineExit;
      annualTotalExits += finalMonthExit;

      monthlyTrend.push({
        monthLabel: d.toLocaleDateString('pt-BR', { month: 'short' }),
        exits: finalMonthExit
      });
    }

    const monthlyAverageExits = parseFloat((annualTotalExits / 12).toFixed(1));
    const dailyAverageExits = parseFloat((monthlyAverageExits / 30).toFixed(2));

    let daysUntilStockout = 0;
    if (prod.quantity === 0) {
      daysUntilStockout = 0;
    } else if (dailyAverageExits <= 0) {
      daysUntilStockout = 999;
    } else {
      daysUntilStockout = Math.round(prod.quantity / dailyAverageExits);
    }

    let status: 'OUT_OF_STOCK' | 'CRITICAL' | 'WARNING' | 'SAFE' | 'EXTENSIVE' = 'SAFE';
    if (prod.quantity === 0) {
      status = 'OUT_OF_STOCK';
    } else if (daysUntilStockout <= 15) {
      status = 'CRITICAL';
    } else if (daysUntilStockout <= 30) {
      status = 'WARNING';
    } else if (daysUntilStockout <= 90) {
      status = 'SAFE';
    } else {
      status = 'EXTENSIVE';
    }

    const target30DaysStock = Math.ceil(dailyAverageExits * 30);
    const suggestedReorderQty = Math.max(0, Math.max(prod.minStock * 2, target30DaysStock + prod.minStock) - prod.quantity);

    return {
      annualTotalExits,
      monthlyAverageExits,
      dailyAverageExits,
      daysUntilStockout,
      status,
      suggestedReorderQty,
      monthlyTrend
    };
  };

  // Demand Forecast Filter State ('all' | 'out_of_stock' | 'critical_15' | 'warning_30' | 'needs_reorder')
  const [demandForecastFilter, setDemandForecastFilter] = useState<'all' | 'out_of_stock' | 'critical_15' | 'warning_30' | 'needs_reorder'>('all');

  // Purchasing Assistant States (EOQ & Freight Cost Optimization)
  const [showPurchasingAssistantModal, setShowPurchasingAssistantModal] = useState(false);
  const [purchasingAverageFreight, setPurchasingAverageFreight] = useState<number>(45.00); // Average freight cost (R$)
  const [purchasingTargetDays, setPurchasingTargetDays] = useState<number>(30); // Target stock coverage days
  const [purchasingSupplierFilter, setPurchasingSupplierFilter] = useState<string>('all');
  const [purchasingScopeFilter, setPurchasingScopeFilter] = useState<'below_min' | 'critical' | 'all_reorder'>('below_min');
  const [purchasingCopyToast, setPurchasingCopyToast] = useState<string | null>(null);

  // Helper to calculate Purchasing Assistant Plan with EOQ & Freight Dilution
  const calculatePurchasingPlan = () => {
    // Candidates based on scope filter and supplier filter
    const candidates = (produtos || []).filter(p => {
      if (purchasingSupplierFilter !== 'all' && p.fornecedorId !== purchasingSupplierFilter) return false;
      if (purchasingScopeFilter === 'below_min') return p.quantity <= p.minStock;
      if (purchasingScopeFilter === 'critical') return p.quantity === 0 || p.quantity <= Math.ceil(p.minStock * 0.5);
      return true; // all_reorder
    });

    const items = candidates.map(p => {
      const forecast = calculate12MonthDemandForecast(p, ordensServico, movementsList);
      const supplier = fornecedores.find(f => f.id === p.fornecedorId);

      const dailyDemand = forecast.dailyAverageExits || 0.05;
      const monthlyDemand = forecast.monthlyAverageExits || 1;
      const annualDemand = Math.max(12, forecast.annualTotalExits || (monthlyDemand * 12));

      // Unit Cost
      const unitCost = p.costPrice > 0 ? p.costPrice : Math.max(10, (p.sellPrice || 20) * 0.6);

      // Deficit to reach target days of coverage + min stock safety buffer
      const targetCoverageQty = Math.ceil(dailyDemand * purchasingTargetDays);
      const deficitQty = Math.max(0, (targetCoverageQty + p.minStock) - p.quantity);

      // Economic Order Quantity (EOQ / Lote Econômico) formula considering Freight
      // Holding cost = 20% of unit cost per year
      const holdingCost = Math.max(0.5, unitCost * 0.20);
      const eoqRaw = Math.sqrt((2 * annualDemand * purchasingAverageFreight) / holdingCost);
      const eoqBatch = Math.max(1, Math.round(eoqRaw));

      // Ideal Quantity: Max of (Deficit, EOQ Batch, Min Stock)
      let idealPurchaseQty = Math.max(
        1,
        deficitQty > 0 ? deficitQty : 0,
        eoqBatch,
        p.minStock > 0 ? p.minStock * 2 : 2
      );

      if (p.quantity > p.minStock) {
        idealPurchaseQty = Math.max(1, idealPurchaseQty - (p.quantity - p.minStock));
      }

      const finalIdealQty = Math.max(1, Math.ceil(idealPurchaseQty));

      // Financials
      const totalPartsCost = finalIdealQty * unitCost;
      const freightPerUnit = purchasingAverageFreight / finalIdealQty;
      const totalCostWithFreight = totalPartsCost + purchasingAverageFreight;
      const unitCostDiluted = unitCost + freightPerUnit;
      const freightImpactPct = totalPartsCost > 0 ? parseFloat(((purchasingAverageFreight / totalPartsCost) * 100).toFixed(1)) : 0;

      // Comparison with buying minimum batch (1 or 2 units)
      const smallBatchFreightPerUnit = purchasingAverageFreight / Math.min(2, finalIdealQty);
      const freightSavingsPerUnit = Math.max(0, smallBatchFreightPerUnit - freightPerUnit);

      return {
        product: p,
        supplierName: supplier ? supplier.name : 'Não informado',
        supplierPhone: supplier ? supplier.phone : '',
        supplierCnpj: supplier ? supplier.cnpj : '',
        currentQuantity: p.quantity,
        minStock: p.minStock,
        dailyDemand,
        monthlyDemand,
        annualDemand,
        eoqBatch,
        deficitQty,
        idealPurchaseQty: finalIdealQty,
        unitCost,
        totalPartsCost,
        freightPerUnit,
        totalCostWithFreight,
        unitCostDiluted,
        freightImpactPct,
        freightSavingsPerUnit,
        daysUntilStockout: forecast.daysUntilStockout,
        status: forecast.status
      };
    });

    const totalPartsCostSum = items.reduce((acc, i) => acc + i.totalPartsCost, 0);
    const totalFreightCostSum = items.length > 0 ? purchasingAverageFreight : 0;
    const totalInvestmentSum = totalPartsCostSum + totalFreightCostSum;

    return {
      items,
      totalPartsCostSum,
      totalFreightCostSum,
      totalInvestmentSum
    };
  };

  const handleCopyPurchasingQuotation = (plan: ReturnType<typeof calculatePurchasingPlan>) => {
    let text = `📦 *PEDIDO DE COMPRA / COTAÇÃO - AUTO PEÇAS ERP*\n`;
    text += `📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
    text += `🚚 Frete Médio Considerado: R$ ${purchasingAverageFreight.toFixed(2)}\n`;
    text += `🎯 Meta de Cobertura: ${purchasingTargetDays} dias de consumo\n\n`;
    text += `*ITENS SOLICITADOS (LOTE IDEAL DE REPOSIÇÃO):*\n\n`;

    plan.items.forEach((item, index) => {
      text += `${index + 1}. *${item.product.name}*\n`;
      text += `   • SKU: ${item.product.internalSku} | Marca: ${item.product.brand || 'N/A'}\n`;
      text += `   • Qtd. Atual: ${item.currentQuantity} un | Mínimo: ${item.minStock} un\n`;
      text += `   • *QTD. IDEAL SUGERIDA: ${item.idealPurchaseQty} un*\n`;
      text += `   • Custo Unit. Ref: R$ ${item.unitCost.toFixed(2)} (Com frete diluído: R$ ${item.unitCostDiluted.toFixed(2)}/un)\n`;
      text += `   • Subtotal Est.: R$ ${item.totalPartsCost.toFixed(2)}\n`;
      if (item.supplierName !== 'Não informado') {
        text += `   • Fornecedor: ${item.supplierName}\n`;
      }
      text += `\n`;
    });

    text += `----------------------------------------\n`;
    text += `TOTAL EST. PEÇAS: R$ ${plan.totalPartsCostSum.toFixed(2)}\n`;
    text += `FRETE ESTIMADO: R$ ${purchasingAverageFreight.toFixed(2)}\n`;
    text += `INVESTIMENTO TOTAL: R$ ${plan.totalInvestmentSum.toFixed(2)}\n`;

    navigator.clipboard.writeText(text);
    setPurchasingCopyToast('📋 Cotação formatada com Lote Ideal copiada para a área de transferência!');
    setTimeout(() => setPurchasingCopyToast(null), 3500);
  };

  // CSV Import state
  const [csvFileSelected, setCsvFileSelected] = useState<boolean>(false);
  const [csvFeedback, setCsvFeedback] = useState<string | null>(null);

  // Modal 'Cadastro Rápido em Lote' via CSV states
  const [showCsvBatchModal, setShowCsvBatchModal] = useState(false);
  const [csvBatchFileName, setCsvBatchFileName] = useState('');
  const [csvBatchParsedItems, setCsvBatchParsedItems] = useState<Array<{
    id: string;
    selected: boolean;
    name: string;
    brand: string;
    sku: string;
    barcode: string;
    category: string;
    compatibility: string;
    costPrice: number;
    sellPrice: number;
    quantity: number;
    minStock: number;
    status: 'ok' | 'sku_exists' | 'invalid';
    statusMessage: string;
  }>>([]);
  const [csvBatchFeedback, setCsvBatchFeedback] = useState<string | null>(null);
  const [csvBatchSuccess, setCsvBatchSuccess] = useState(false);

  // Barcode helper states & quick scan simulated triggers
  const [showStockScannerModal, setShowStockScannerModal] = useState(false);
  const [stockScannerTarget, setStockScannerTarget] = useState<'new' | 'edit'>('new');
  const [stockScanToast, setStockScanToast] = useState<string | null>(null);

  // Camera & AI Photo Recognition states for Part Registration
  const [showAiPhotoScanModal, setShowAiPhotoScanModal] = useState(false);
  const [aiScanTarget, setAiScanTarget] = useState<'new' | 'edit'>('new');
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [aiScanError, setAiScanError] = useState<string | null>(null);
  const [aiScanResult, setAiScanResult] = useState<{
    name: string;
    brand: string;
    sku: string;
    barcode: string;
    category: string;
    compatibility: string;
    costPrice: number;
    sellPrice: number;
    quantity: number;
    minStock: number;
    confidence: string;
    notes: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startLiveCamera = async () => {
    try {
      setAiScanError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Câmera indisponível:", err);
      setAiScanError("⚠️ Câmera não detectada ou permissão negada. Utilize o envio de imagem ou uma das amostras para testar.");
      setCameraActive(false);
    }
  };

  const stopLiveCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Jpeg = canvas.toDataURL('image/jpeg', 0.85);
        stopLiveCamera();
        setPhotoPreviewUrl(base64Jpeg);
        analyzePartPhotoWithAi(base64Jpeg);
      }
    } catch (e) {
      setAiScanError("Erro ao capturar foto da câmera.");
    }
  };

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      stopLiveCamera();
      setPhotoPreviewUrl(base64);
      analyzePartPhotoWithAi(base64);
    };
    reader.readAsDataURL(file);
  };

  const analyzePartPhotoWithAi = async (base64Image: string) => {
    setIsAnalyzingPhoto(true);
    setAiScanError(null);
    setAiScanResult(null);

    try {
      const response = await fetch('/api/gemini/scan-part', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        throw new Error("Servidor de IA indisponível");
      }

      const data = await response.json();
      setAiScanResult(data);
    } catch (err: any) {
      console.error("Erro na leitura da imagem:", err);
      setAiScanError("Falha na análise da imagem pela Inteligência Artificial.");
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const applyAiScanToProductForm = () => {
    if (!aiScanResult) return;

    if (aiScanTarget === 'new') {
      setActiveTab('cadastro');
      setNewProdName(aiScanResult.name || '');
      setNewProdBrand(aiScanResult.brand || '');
      setNewProdSku(aiScanResult.sku || '');
      setNewProdBarcode(aiScanResult.barcode || '');
      setNewProdCategory(aiScanResult.category || 'Geral');
      setNewProdCompatibility(aiScanResult.compatibility || '');
      setNewProdCost((aiScanResult.costPrice || 0).toFixed(2));
      setNewProdSell((aiScanResult.sellPrice || 0).toFixed(2));
      setNewProdQty((aiScanResult.quantity || 10).toString());
      setNewProdMin((aiScanResult.minStock || 3).toString());
    } else {
      setEditingProdName(aiScanResult.name || '');
      setEditingProdBrand(aiScanResult.brand || '');
      setEditingProdSku(aiScanResult.sku || '');
      setEditingProdBarcode(aiScanResult.barcode || '');
      setEditingProdCategory(aiScanResult.category || 'Geral');
      setEditingProdCompatibility(aiScanResult.compatibility || '');
      setEditingProdCost((aiScanResult.costPrice || 0).toFixed(2));
      setEditingProdSell((aiScanResult.sellPrice || 0).toFixed(2));
      setEditingProdQty((aiScanResult.quantity || 10).toString());
      setEditingProdMin((aiScanResult.minStock || 3).toString());
    }

    setStockScanToast(`✨ Foto analisada! Cadastro de peça preenchido com (${aiScanResult.name}).`);
    setTimeout(() => setStockScanToast(null), 4500);
    setShowAiPhotoScanModal(false);
    stopLiveCamera();
  };

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

  // Auto-fill form fields by searching scanned barcode against catalog & sample database
  const lookupBarcodeAndAutofill = (barcodeToSearch: string, target: 'new' | 'edit') => {
    playStockBeeper();
    const cleanCode = barcodeToSearch.trim();
    if (!cleanCode) return false;

    // Search in BARCODE_PARTS_DATABASE or STOCK_PRESET_ITEMS
    const dbMatch = BARCODE_PARTS_DATABASE.find(b => b.barcode === cleanCode || b.sku.toLowerCase() === cleanCode.toLowerCase());
    const presetMatch = !dbMatch ? STOCK_PRESET_ITEMS.find(p => p.sku.toLowerCase() === cleanCode.toLowerCase() || p.id.toLowerCase() === cleanCode.toLowerCase()) : null;

    if (dbMatch) {
      if (target === 'new') {
        setNewProdName(dbMatch.name);
        setNewProdBrand(dbMatch.brand);
        setNewProdSku(dbMatch.sku);
        setNewProdBarcode(dbMatch.barcode);
        setNewProdCategory(dbMatch.category);
        setNewProdCompatibility(dbMatch.compatibility);
        setNewProdCost(dbMatch.costPrice.toFixed(2));
        setNewProdSell(dbMatch.sellPrice.toFixed(2));
        setNewProdQty(dbMatch.quantity.toString());
        setNewProdMin(dbMatch.minStock.toString());
      } else {
        setEditingProdName(dbMatch.name);
        setEditingProdBrand(dbMatch.brand);
        setEditingProdSku(dbMatch.sku);
        setEditingProdBarcode(dbMatch.barcode);
        setEditingProdCategory(dbMatch.category);
        setEditingProdCompatibility(dbMatch.compatibility);
        setEditingProdCost(dbMatch.costPrice.toFixed(2));
        setEditingProdSell(dbMatch.sellPrice.toFixed(2));
        setEditingProdQty(dbMatch.quantity.toString());
        setEditingProdMin(dbMatch.minStock.toString());
      }
      setStockScanToast(`✨ Peça RECONHECIDA (${dbMatch.name})! Todos os campos foram preenchidos automaticamente.`);
      setTimeout(() => setStockScanToast(null), 4000);
      return true;
    } else if (presetMatch) {
      if (target === 'new') {
        setNewProdName(presetMatch.name);
        setNewProdBrand(presetMatch.brand);
        setNewProdSku(presetMatch.sku);
        setNewProdBarcode(cleanCode);
        setNewProdCategory(presetMatch.category);
        setNewProdCompatibility(presetMatch.compatibility);
        setNewProdCost(presetMatch.costPrice.toFixed(2));
        setNewProdSell(presetMatch.sellPrice.toFixed(2));
        setNewProdQty(presetMatch.quantity.toString());
        setNewProdMin(presetMatch.minStock.toString());
      } else {
        setEditingProdName(presetMatch.name);
        setEditingProdBrand(presetMatch.brand);
        setEditingProdSku(presetMatch.sku);
        setEditingProdBarcode(cleanCode);
        setEditingProdCategory(presetMatch.category);
        setEditingProdCompatibility(presetMatch.compatibility);
        setEditingProdCost(presetMatch.costPrice.toFixed(2));
        setEditingProdSell(presetMatch.sellPrice.toFixed(2));
        setEditingProdQty(presetMatch.quantity.toString());
        setEditingProdMin(presetMatch.minStock.toString());
      }
      setStockScanToast(`✨ Modelo RECONHECIDO (${presetMatch.name})! Campos preenchidos automaticamente.`);
      setTimeout(() => setStockScanToast(null), 4000);
      return true;
    } else {
      if (target === 'new') {
        setNewProdBarcode(cleanCode);
      } else {
        setEditingProdBarcode(cleanCode);
      }
      setStockScanToast(`📷 Código EAN ${cleanCode} lido! Insira o nome do produto para concluir.`);
      setTimeout(() => setStockScanToast(null), 3000);
      return false;
    }
  };

  // Download template CSV file for batch imports
  const handleDownloadCsvTemplate = () => {
    const csvContent = "\uFEFFnome;marca;sku;codigo_barras;categoria;compatibilidade;preco_custo;preco_venda;quantidade;estoque_minimo\n" +
      "Lâmpada H7 LED Super Branca 12V;Philips;LMP-H7-LED;7891002003001;Elétrica;Universal Farol H7;35.00;89.90;15;4\n" +
      "Silicone RTV Alta Temp Cinza 50g;Tekbond;SIL-RTV-50G;7898001002001;Química & Insumos;Vedação de Cárter e Tampa de Válvula;18.50;38.00;20;5\n" +
      "Cola Trava Rosca Loctite 242 10g;Loctite;COL-LOC-242;7896001003001;Química & Insumos;Parafusos e Prisioneiros M6-M20;25.00;55.00;12;3\n" +
      "Desengripante Spray WD-40 300ml;WD-40;SPR-WD40-300;7897001004001;Química & Insumos;Lubrificação Geral e Desengripante;22.00;45.00;18;4\n" +
      "Filtro de Óleo Fram ExtraGuard;Fram;FLT-OIL-FRM;7892201103002;Filtros;Linha Leve VW 1.0/1.6 8V;18.00;39.90;25;8\n" +
      "Lâmpada H4 Halógena 12V 60/55W;Osram;LMP-H4-OSR;7894561230002;Elétrica;Farol Baixo/Alto Duplo Gol/Palio;18.00;42.00;10;4\n" +
      "Jogo Velas NGK Green Plug BKR6E;NGK;VEL-NGK-BKR6E;7893004005001;Ignição;VW Gol, Fox, Voyage 1.0/1.6 TotalFlex;58.00;120.00;12;4\n" +
      "Relé Auxiliar 4 Pinos 12V 40A;DNI;RLE-AUX-4P;7895001006001;Elétrica;Buzina, Farol Milha, Ventoinha 12V;12.00;28.00;10;3\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_cadastro_pecas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load 1-click sample batch for workshop testing
  const handleLoadSampleCsvBatch = () => {
    setCsvBatchSuccess(false);
    const sampleItems = BARCODE_PARTS_DATABASE.map((item, idx) => {
      const skuExists = produtos.some(p => p.internalSku?.toUpperCase() === item.sku.toUpperCase());
      return {
        id: `batch_sample_${idx}`,
        selected: true,
        name: item.name,
        brand: item.brand,
        sku: item.sku,
        barcode: item.barcode,
        category: item.category,
        compatibility: item.compatibility,
        costPrice: item.costPrice,
        sellPrice: item.sellPrice,
        quantity: item.quantity,
        minStock: item.minStock,
        status: skuExists ? ('sku_exists' as const) : ('ok' as const),
        statusMessage: skuExists ? '⚠️ SKU já cadastrado no catálogo' : '✨ Pronto para cadastrar'
      };
    });
    setCsvBatchParsedItems(sampleItems);
    setCsvBatchFileName('lote_exemplo_oficina_autotech.csv');
    setCsvBatchFeedback('✅ 8 produtos de exemplo carregados! Verifique a tabela abaixo e clique em Confirmar Importação.');
  };

  // Parse uploaded CSV file for batch imports
  const handleCsvBatchFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvBatchSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvBatchFileName(file.name);
    setCsvBatchFeedback('Lendo e analisando arquivo CSV...');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text || !text.trim()) {
        setCsvBatchFeedback('❌ O arquivo CSV está vazio.');
        return;
      }

      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length <= 1) {
        setCsvBatchFeedback('❌ O arquivo CSV precisa ter cabeçalho e pelo menos 1 linha de produto.');
        return;
      }

      // Detect delimiter (commas or semicolons)
      const firstLine = lines[0];
      const delimiter = firstLine.includes(';') ? ';' : ',';

      const items = lines.slice(1).map((line, idx) => {
        const cols = line.split(delimiter).map(c => c.replace(/^"|"$/g, '').trim());
        const name = cols[0] || `Produto ${idx + 1}`;
        const brand = cols[1] || 'Outros';
        const sku = cols[2] || `SKU-LOTE-${idx + 101}`;
        const barcode = cols[3] || '';
        const category = cols[4] || 'Geral';
        const compatibility = cols[5] || 'Universal';
        const costPrice = parseFloat((cols[6] || '0').replace('R$', '').replace('.', '').replace(',', '.')) || 10.0;
        const sellPrice = parseFloat((cols[7] || '0').replace('R$', '').replace('.', '').replace(',', '.')) || (costPrice * 2);
        const quantity = parseInt(cols[8] || '10', 10) || 10;
        const minStock = parseInt(cols[9] || '3', 10) || 3;

        const skuExists = produtos.some(p => p.internalSku?.toUpperCase() === sku.toUpperCase());
        const isValid = name.length >= 2;

        return {
          id: `batch_upload_${idx}_${Date.now()}`,
          selected: isValid,
          name,
          brand,
          sku,
          barcode,
          category,
          compatibility,
          costPrice,
          sellPrice,
          quantity,
          minStock,
          status: !isValid ? ('invalid' as const) : skuExists ? ('sku_exists' as const) : ('ok' as const),
          statusMessage: !isValid ? '❌ Nome inválido' : skuExists ? '⚠️ SKU existente no sistema' : '✨ Pronto para cadastrar'
        };
      });

      setCsvBatchParsedItems(items);
      setCsvBatchFeedback(`✅ Arquivo analisado com sucesso! ${items.length} itens encontrados para revisão.`);
    };

    reader.onerror = () => {
      setCsvBatchFeedback('❌ Erro de leitura do arquivo CSV.');
    };

    reader.readAsText(file);
  };

  // Commit selected batch items into database
  const handleConfirmCsvBatchImport = async () => {
    const selected = csvBatchParsedItems.filter(i => i.selected);
    if (selected.length === 0) {
      setCsvBatchFeedback('⚠️ Marque pelo menos 1 item na tabela para cadastrar.');
      return;
    }

    setCsvBatchFeedback(`Gravando ${selected.length} produtos no estoque...`);
    
    let addedCount = 0;
    for (const item of selected) {
      await addProduto({
        name: item.name,
        brand: item.brand,
        internalSku: item.sku,
        barcode: item.barcode,
        category: item.category,
        compatibility: item.compatibility,
        manufacturer: item.brand,
        costPrice: item.costPrice,
        sellPrice: item.sellPrice,
        quantity: item.quantity,
        minStock: item.minStock
      });
      addedCount++;
    }

    playStockBeeper();
    setCsvBatchSuccess(true);
    setCsvBatchFeedback(`🎉 Sucesso! ${addedCount} novos produtos foram adicionados ao estoque AutoTech.`);
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
          lookupBarcodeAndAutofill(barcodeText, editingProdId ? 'edit' : 'new');
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
    const matchMultiCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
    const matchCritical = !onlyCriticalFilter || (p.quantity <= p.minStock);

    let matchDemand = true;
    if (demandForecastFilter !== 'all') {
      const forecast = calculate12MonthDemandForecast(p, ordensServico, movementsList);
      if (demandForecastFilter === 'out_of_stock') {
        matchDemand = forecast.status === 'OUT_OF_STOCK';
      } else if (demandForecastFilter === 'critical_15') {
        matchDemand = forecast.status === 'CRITICAL' || forecast.status === 'OUT_OF_STOCK';
      } else if (demandForecastFilter === 'warning_30') {
        matchDemand = forecast.status === 'CRITICAL' || forecast.status === 'WARNING' || forecast.status === 'OUT_OF_STOCK';
      } else if (demandForecastFilter === 'needs_reorder') {
        matchDemand = forecast.suggestedReorderQty > 0 || forecast.status === 'OUT_OF_STOCK';
      }
    }

    return matchSearch && matchCategory && matchMultiCategory && matchCritical && matchDemand;
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

    if (batchModeKeepCategory) {
      // Keep category, brand, supplier, manufacturer for continuous fast entry
      const currentCat = newProdCategory;
      const currentBrand = newProdBrand;
      const currentSup = newProdFornecedorId;
      const currentManuf = newProdManufacturer;

      setNewProdName('');
      setNewProdSku('');
      setNewProdBarcode('');
      setNewProdCost('');
      setNewProdSell('');
      setNewProdQty('');
      setNewProdMin('');
      setNewProdCompatibility('');

      setNewProdCategory(currentCat);
      setNewProdBrand(currentBrand);
      setNewProdFornecedorId(currentSup);
      setNewProdManufacturer(currentManuf);

      setPresetSuccessNotice(`✅ "${payload.name}" cadastrado! Categoria e fornecedor mantidos para a próxima peça.`);
      setTimeout(() => setPresetSuccessNotice(''), 5000);
      return;
    }

    // Reset inputs
    setNewProdName('');
    setNewProdBrand('');
    setNewProdSku('');
    setNewProdBarcode('');
    setNewProdCategory('Elétrica');
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
    
    const markup = company?.defaultMarkup !== undefined ? company.defaultMarkup : 50;
    const parsed = parseNfeXmlContent(xmlText, markup);
    if (parsed) {
      setParsedXml(parsed);
      const duplicateItems = parsed.items.filter(item => 
        produtos.some(p => 
          p.internalSku.toLowerCase() === item.code.toLowerCase() || 
          (p.barcode && p.barcode === item.barcode)
        )
      );
      if (duplicateItems.length > 0) {
        setXmlFeedback(`⚠️ XML de Exemplo Carregado. Alerta: Detectamos duplicidade de SKU em ${duplicateItems.length} item(ns).`);
      } else {
        setXmlFeedback(`✅ XML de Exemplo (${parsed.emitName}) carregado com sucesso!`);
      }
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
      const markup = company?.defaultMarkup !== undefined ? company.defaultMarkup : 50;
      const parsed = parseNfeXmlContent(text, markup);
      if (parsed) {
        setParsedXml(parsed);
        const duplicateItems = parsed.items.filter(item => 
          produtos.some(p => 
            p.internalSku.toLowerCase() === item.code.toLowerCase() || 
            (p.barcode && p.barcode === item.barcode)
          )
        );
        if (duplicateItems.length > 0) {
          setXmlFeedback(`⚠️ NF-e Nº ${parsed.invoiceNumber} carregada. Alerta: Detectamos duplicidade de SKU para ${duplicateItems.length} item(ns) cadastrados no catálogo.`);
        } else {
          setXmlFeedback(`✅ NF-e Nº ${parsed.invoiceNumber} (${parsed.emitName}) analisada com sucesso!`);
        }
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
          <button 
            type="button"
            onClick={() => { playStockBeeper(); setShowAiPhotoScanModal(true); setAiScanTarget('new'); }}
            className="bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-500/40 font-bold flex items-center gap-1 shadow-sm px-3 py-1.5 rounded-lg text-xs font-mono"
            title="Cadastrar peça fotografando a embalagem, caixa ou produto com Inteligência Artificial"
          >
            <Camera className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            📷 Foto & Câmera IA
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#0a0f1d] p-4 rounded-xl border border-gray-900 items-center">
            <div className="relative md:col-span-6">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Pesquise peça por nome, SKU interno, marcas de montadoras, aplicação de veículos (Gol, Civic) ou barras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2 px-4 pl-10 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="md:col-span-3">
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

            <div className="md:col-span-3 flex gap-2">
              <button
                type="button"
                id="btn-scan-part-photo-ai"
                onClick={() => { playStockBeeper(); setShowAiPhotoScanModal(true); setAiScanTarget(editingProdId ? 'edit' : 'new'); }}
                className="flex-1 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-600 hover:to-indigo-600 text-white font-mono text-[10px] font-extrabold py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border border-purple-400/40 shadow-lg shadow-purple-950/30 uppercase"
                title="Fotografar peça com câmera do celular ou webcam para cadastro automático"
              >
                <Camera className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                Câmera IA
              </button>
              <button
                type="button"
                id="btn-import-csv-batch"
                onClick={() => { playStockBeeper(); setShowCsvBatchModal(true); }}
                className="flex-1 bg-emerald-650 hover:bg-emerald-700 bg-emerald-600 text-white font-mono text-[10px] font-extrabold py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border border-emerald-500/30 hover:border-emerald-500/60 shadow-lg shadow-emerald-950/20 uppercase"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Lote CSV
              </button>
              <button
                type="button"
                id="btn-import-xml-estoque"
                onClick={() => { playStockBeeper(); setShowXmlImporterModal(true); }}
                className="flex-1 bg-red-650 hover:bg-red-700 bg-red-600 text-white font-mono text-[10px] font-extrabold py-2.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border border-red-500/30 hover:border-red-500/60 shadow-lg shadow-red-950/20 uppercase"
              >
                <FileCode className="w-3.5 h-3.5" />
                XML NF-e
              </button>
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

                {/* Demand Prediction Live Indicator (12-Month Model) */}
                {(() => {
                  const currentEditingProduct = produtos.find(p => p.id === editingProdId);
                  if (!currentEditingProduct) return null;
                  const editForecast = calculate12MonthDemandForecast(currentEditingProduct, ordensServico, movementsList);
                  return (
                    <div className="col-span-1 sm:col-span-3 bg-[#0a101f] p-3.5 rounded-xl border border-purple-500/30 flex flex-col gap-2 font-mono text-xs shadow-inner">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <span className="font-extrabold text-purple-300 flex items-center gap-1.5 uppercase text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          Previsão de Demanda & Esgotamento (Histórico 12 Meses)
                        </span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 ${
                          editForecast.status === 'OUT_OF_STOCK' || editForecast.status === 'CRITICAL'
                            ? 'bg-red-950/80 text-red-300 border border-red-500/40 animate-pulse'
                            : editForecast.status === 'WARNING'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {editForecast.daysUntilStockout === 0 ? '🛑 ESGOTADO (0 DIAS)' : `⚡ RESTAM ~${editForecast.daysUntilStockout} DIAS`}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] text-gray-300 pt-1">
                        <div>
                          <span className="text-[10px] text-gray-500 block">SAÍDA ANUAL (12M):</span>
                          <strong className="text-white">{editForecast.annualTotalExits} un/ano</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block">MÉDIA MENSAL:</span>
                          <strong className="text-cyan-400">{editForecast.monthlyAverageExits} un/mês</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block">CONSUMO DIÁRIO:</span>
                          <strong className="text-amber-400">{editForecast.dailyAverageExits} un/dia</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block">SUGESTÃO RECOMPRA:</span>
                          <strong className="text-emerald-400">+{editForecast.suggestedReorderQty} un</strong>
                        </div>
                      </div>
                    </div>
                  );
                })()}
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
          <div className="bg-[#0c1223] rounded-2xl border border-gray-800">
            {/* DEMAND FORECAST & PURCHASING DASHBOARD CARDS (12 MONTH MODEL) */}
            {(() => {
              let countOutOfStock = 0;
              let countCritical15 = 0;
              let countWarning30 = 0;
              let totalReorderQtySum = 0;

              (produtos || []).forEach(p => {
                const f = calculate12MonthDemandForecast(p, ordensServico, movementsList);
                if (f.status === 'OUT_OF_STOCK') countOutOfStock++;
                if (f.status === 'CRITICAL') countCritical15++;
                if (f.status === 'WARNING') countWarning30++;
                totalReorderQtySum += f.suggestedReorderQty;
              });

              return (
                <div className="p-4 sm:p-5 border-b border-gray-850 bg-gradient-to-r from-[#090e1f] via-[#0d142b] to-[#090e1f] flex flex-col gap-3 font-mono">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-800/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-lg">
                        <Hourglass className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
                      </div>
                      <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                          Previsão de Demanda & Risco de Esgotamento (Histórico 12m)
                        </h4>
                        <p className="text-[10.5px] text-gray-400 font-sans mt-0.5">
                          Projeção preditiva baseada no ritmo de consumo e saídas de oficina/balcão dos últimos 365 dias.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => { playStockBeeper(); setShowPurchasingAssistantModal(true); }}
                        className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl border border-purple-400/40 shadow-lg shadow-purple-950/40 flex items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                        title="Abrir Assistente com Lote Econômico de Compra (EOQ) e Cálculo de Diluição de Frete"
                      >
                        <Bot className="w-3.5 h-3.5 text-amber-300" />
                        <span>Assistente de Compra Ideal (EOQ & Frete)</span>
                        <Sparkles className="w-3 h-3 text-amber-300" />
                      </button>

                      {demandForecastFilter !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setDemandForecastFilter('all')}
                          className="text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold px-2.5 py-1 rounded-lg border border-gray-700 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          ✕ Limpar Filtros
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {/* Card 1: Out of Stock */}
                    <div 
                      onClick={() => setDemandForecastFilter(demandForecastFilter === 'out_of_stock' ? 'all' : 'out_of_stock')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                        demandForecastFilter === 'out_of_stock'
                          ? 'bg-red-950/80 border-red-500 shadow-md shadow-red-950/40'
                          : 'bg-[#080d1a] border-red-900/30 hover:border-red-600/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-red-400 font-extrabold uppercase">
                        <span>🛑 Esgotados</span>
                        <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 text-[9px]">0 Dias</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-2xl font-black text-white">{countOutOfStock}</span>
                        <span className="text-[10px] text-gray-400">peças</span>
                      </div>
                      <span className="text-[9.5px] text-red-400/80 mt-0.5">Estoque zerado no pátio</span>
                    </div>

                    {/* Card 2: Critical < 15 days */}
                    <div 
                      onClick={() => setDemandForecastFilter(demandForecastFilter === 'critical_15' ? 'all' : 'critical_15')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                        demandForecastFilter === 'critical_15'
                          ? 'bg-red-950/80 border-red-500 shadow-md shadow-red-950/40'
                          : 'bg-[#080d1a] border-red-900/30 hover:border-red-600/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-red-300 font-extrabold uppercase">
                        <span>⚡ Esgotamento Iminente</span>
                        <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 text-[9px]">&lt; 15 Dias</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-2xl font-black text-white">{countCritical15}</span>
                        <span className="text-[10px] text-gray-400">peças</span>
                      </div>
                      <span className="text-[9.5px] text-red-300/80 mt-0.5">Risco alto de paralisação</span>
                    </div>

                    {/* Card 3: Warning 15 - 30 days */}
                    <div 
                      onClick={() => setDemandForecastFilter(demandForecastFilter === 'warning_30' ? 'all' : 'warning_30')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                        demandForecastFilter === 'warning_30'
                          ? 'bg-amber-950/80 border-amber-500 shadow-md shadow-amber-950/40'
                          : 'bg-[#080d1a] border-amber-900/30 hover:border-amber-600/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-amber-300 font-extrabold uppercase">
                        <span>⚠️ Reposição Recomendada</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px]">15 - 30 Dias</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-2xl font-black text-white">{countWarning30}</span>
                        <span className="text-[10px] text-gray-400">peças</span>
                      </div>
                      <span className="text-[9.5px] text-amber-300/80 mt-0.5">Programar pedido de compras</span>
                    </div>

                    {/* Card 4: Total Suggested Reorder Quantity */}
                    <div 
                      onClick={() => setDemandForecastFilter(demandForecastFilter === 'needs_reorder' ? 'all' : 'needs_reorder')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                        demandForecastFilter === 'needs_reorder'
                          ? 'bg-emerald-950/80 border-emerald-500 shadow-md shadow-emerald-950/40'
                          : 'bg-[#080d1a] border-emerald-900/30 hover:border-emerald-600/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-emerald-300 font-extrabold uppercase">
                        <span>📦 Sugestão de Compras</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px]">30d Cobertura</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-2xl font-black text-white">+{totalReorderQtySum}</span>
                        <span className="text-[10px] text-gray-400">unidades</span>
                      </div>
                      <span className="text-[9.5px] text-emerald-300/80 mt-0.5">Volume sugerido para reposição</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* MULTI-SELECT CATEGORY PIECE GROUPS FILTER */}
            <div className="p-4 sm:p-5 border-b border-gray-850/80 bg-slate-950/20 flex flex-col gap-3 font-mono">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-red-950/30 text-red-400 border border-red-900/40 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider shrink-0 animate-pulse">
                    Filtro Avançado Categorias
                  </span>
                  <span className="text-[11px] text-gray-500 hidden md:inline font-sans">
                    Selecione múltiplas famílias de autopeças para restringir a listagem de estoque atual.
                  </span>
                </div>

                {/* Dropdown Multi-Seleção container */}
                <div className="relative shrink-0 w-full sm:w-auto">
                  <button 
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="w-full sm:w-64 bg-[#080c16] border border-gray-800 rounded-xl px-4 py-2.5 text-xs flex items-center justify-between hover:border-gray-700 transition-all cursor-pointer text-white"
                  >
                    <span className="truncate">
                      {selectedCategories.length === 0 
                        ? '📂 Todas as Categorias Ativas' 
                        : `📂 ${selectedCategories.join(', ')}`}
                    </span>
                    <span className="text-[10px] text-gray-500 ml-1">▼</span>
                  </button>

                  {isCategoryDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#0a0f1d] border border-gray-800 rounded-xl shadow-2xl p-3 z-30 flex flex-col gap-2 animate-fade-in animate-duration-150">
                      <div className="flex justify-between items-center text-[10px] text-gray-400 border-b border-gray-850 pb-1.5 font-bold">
                        <span>SELECIONAR GRUPOS</span>
                        <div className="flex gap-1.5">
                          <button 
                            type="button"
                            onClick={() => setSelectedCategories([])}
                            className="text-red-400 hover:text-red-300 font-bold"
                          >
                            Limpar
                          </button>
                          <span className="text-gray-600">|</span>
                          <button 
                            type="button"
                            onClick={() => setSelectedCategories(['Freios', 'Filtros', 'Lubrificantes', 'Suspensão', 'Ignição', 'Carroceria', 'Elétrica'])}
                            className="text-cyan-400 hover:text-cyan-350 font-bold"
                          >
                            Todos
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pt-1 font-mono text-[11px]">
                        {['Freios', 'Filtros', 'Lubrificantes', 'Suspensão', 'Ignição', 'Carroceria', 'Elétrica'].map((cat) => {
                          const isSel = selectedCategories.includes(cat);
                          return (
                            <label 
                              key={cat} 
                              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-900/50 cursor-pointer text-gray-300 hover:text-white transition-colors"
                            >
                              <input 
                                type="checkbox"
                                checked={isSel}
                                onChange={() => {
                                  if (isSel) {
                                    setSelectedCategories(selectedCategories.filter(c => c !== cat));
                                  } else {
                                    setSelectedCategories([...selectedCategories, cat]);
                                  }
                                }}
                                className="w-3.5 h-3.5 bg-slate-950 border border-slate-800 rounded text-red-500 focus:ring-0 checked:bg-red-500"
                              />
                              <span>{cat}</span>
                            </label>
                          );
                        })}
                      </div>

                      <div className="border-t border-gray-850 pt-2 flex justify-end">
                        <button 
                          type="button"
                          onClick={() => setIsCategoryDropdownOpen(false)}
                          className="px-2.5 py-1 bg-red-650 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded"
                        >
                          Aplicar Filtro
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Show Pills/Badges of currently selected categories with quick delete action 'x' */}
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-900/40 pt-2 font-mono">
                  <span className="text-[9px] text-gray-400 uppercase font-black mr-1">Filtrando por:</span>
                  {selectedCategories.map((cat) => (
                    <span 
                      key={cat} 
                      className="px-2 py-0.5 rounded-lg bg-red-950/20 text-red-400 border border-red-900/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-red-950/40 hover:border-red-500/40 transition-all select-none"
                      onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))}
                    >
                      {cat} <span className="hover:text-white text-[9px] text-red-500 font-bold">✕</span>
                    </span>
                  ))}
                  <button 
                    type="button"
                    onClick={() => setSelectedCategories([])}
                    className="text-[9.5px] font-bold text-gray-500 hover:text-white underline transition-all leading-none ml-2"
                  >
                    Exibir Tudo
                  </button>
                </div>
              )}
            </div>

            {/* Donut Chart - Stock Category Density & Occupancy */}
            {(() => {
              const categoryDistribution: Record<string, number> = (produtos || []).reduce((acc: Record<string, number>, p) => {
                const qty = p.quantity || 0;
                const cat = p.category || 'Outros';
                acc[cat] = (acc[cat] || 0) + qty;
                return acc;
              }, {});

              const totalStockItems = Object.values(categoryDistribution).reduce((sum: number, val: number) => sum + val, 0);

              const chartData = (Object.entries(categoryDistribution) as [string, number][])
                .map(([name, value]) => ({
                  name,
                  value,
                  percentage: totalStockItems > 0 ? (value / totalStockItems) * 100 : 0
                }))
                .filter(item => item.value > 0)
                .sort((a, b) => b.value - a.value);

              if (totalStockItems === 0) {
                return null;
              }

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 border-b border-gray-850 bg-[#080d19]/10 items-center">
                  {/* Left Column - Donut Chart Representation */}
                  <div className="lg:col-span-5 flex flex-col items-center justify-center relative bg-gradient-to-b from-[#0e1628]/35 to-transparent p-4 rounded-2xl border border-gray-850/45 h-[240px]">
                    <div className="w-full h-full max-w-[200px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => {
                              const colors: Record<string, string> = {
                                'Freios': '#06b6d4',
                                'Filtros': '#ef4444',
                                'Lubrificantes': '#f59e0b',
                                'Suspensão': '#a855f7',
                                'Ignição': '#ec4899',
                                'Carroceria': '#3b82f6',
                                'Elétrica': '#10b981',
                              };
                              return (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={colors[entry.name] || '#6b7280'} 
                                />
                              );
                            })}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-[#0b101d] border border-gray-800 p-2 text-xs font-mono shadow-xl rounded-lg">
                                    <span className="text-gray-400 font-bold tracking-wider uppercase block text-[8px] mb-1">{data.name}</span>
                                    <div className="flex flex-col gap-0.5 text-white">
                                      <span>📦 Total: <strong>{data.value} un</strong></span>
                                      <span className="text-cyan-400">📊 Ocupação: <strong>{data.percentage.toFixed(1)}%</strong></span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Central Hole Label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wide">Volume Geral</span>
                        <span className="text-xl font-extrabold text-white font-mono mt-0.5">{totalStockItems}</span>
                        <span className="text-[9px] text-gray-400 font-mono">unidades</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Sector Breakdown Progress Analysis */}
                  <div className="lg:col-span-7 flex flex-col gap-3">
                    <div className="flex flex-col text-left">
                      <span className="text-[#94a3b8] text-[10px] sm:text-xs font-mono uppercase font-black tracking-wider">
                        📊 DISTRIBUIÇÃO FÍSICA E DENSIDADE DE CATEGORIAS
                      </span>
                      <p className="text-[11px] text-gray-500 font-sans mt-0.5 leading-normal">
                        Relação volumétrica de peças atualmente alocadas no estoque. Clique em qualquer categoria abaixo para filtrar a listagem de produtos ativa.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                      {chartData.map((item, idx) => {
                        const colors: Record<string, string> = {
                          'Freios': '#06b6d4',
                          'Filtros': '#ef4444',
                          'Lubrificantes': '#f59e0b',
                          'Suspensão': '#a855f7',
                          'Ignição': '#ec4899',
                          'Carroceria': '#3b82f6',
                          'Elétrica': '#10b981',
                        };
                        const color = colors[item.name] || '#6b7280';
                        const isSelectedInFilter = categoryFilter === item.name;

                        return (
                          <div 
                            key={idx} 
                            onClick={() => setCategoryFilter(isSelectedInFilter ? 'Todas' : item.name)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                              isSelectedInFilter 
                                ? "bg-[#0b1328] border-red-500/40 shadow-sm shadow-red-950/15 text-left" 
                                : "bg-black/15 border-gray-850 hover:border-gray-800 text-left"
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-mono leading-none">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                <span className="font-extrabold text-white text-[11px]">{item.name}</span>
                              </div>
                              <span className="text-gray-405 text-gray-400 font-bold">{item.percentage.toFixed(1)}%</span>
                            </div>

                            {/* Micro Progress Bar */}
                            <div className="w-full bg-gray-950/60 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${item.percentage}%`,
                                  backgroundColor: color 
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono leading-none">
                              <span>Estoque Físico</span>
                              <span className="text-gray-300 font-bold">{item.value} unidades</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#080d19] border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Produto / SKU</th>
                  <th className="p-4">Categoria / Fornecedor</th>
                  <th className="p-4">Marca/Fabr.</th>
                  <th className="p-4">Aplicações / Compatibilidade</th>
                  <th className="p-4">Indicadores Margem</th>
                  <th className="p-4 text-center">Quant. Física</th>
                  <th className="p-4 text-center">Previsão Esgotamento (12m)</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {filteredProducts.map((p, index) => {
                  const isLow = p.quantity <= p.minStock;
                  const supplier = fornecedores.find(sup => sup.id === p.fornecedorId);
                  const pricing = getMarginAndMarkup(p.costPrice, p.sellPrice);

                  return (
                    <motion.tr 
                      key={p.id} 
                      className={`hover:bg-gray-950/20 transition-colors ${isLow ? 'bg-red-950/10' : ''}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.2) }}
                    >
                      
                      <td className={`p-4 max-w-[200px] transition-all ${isLow ? 'border-l-[3px] border-l-red-600 bg-red-950/20 pl-3' : ''}`}>
                        <div className="flex flex-col gap-1">
                          <span className="font-sans text-xs font-semibold text-white flex items-center gap-1.5 flex-wrap">
                            {p.name}
                            {isLow && (
                              <span className="shrink-0 px-2 py-0.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/25 text-[8.5px] font-bold font-mono tracking-wider flex items-center gap-1 uppercase animate-pulse select-none" title={`Abaixo do estoque mínimo (${p.minStock})`}>
                                <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                                ESTOQUE MÍNIMO
                              </span>
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

                      {/* 12-Month Demand Forecast & Stockout Estimate */}
                      {(() => {
                        const forecast = calculate12MonthDemandForecast(p, ordensServico, movementsList);
                        return (
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center justify-center gap-1 font-mono">
                              {forecast.status === 'OUT_OF_STOCK' && (
                                <span className="px-2.5 py-1 rounded-lg bg-red-950/90 text-red-300 border border-red-500/50 text-[10px] font-black flex items-center gap-1 uppercase tracking-wider animate-pulse shadow-sm shadow-red-950/50">
                                  <Clock className="w-3 h-3 text-red-500 shrink-0" />
                                  0 DIAS (ESGOTADO)
                                </span>
                              )}
                              {forecast.status === 'CRITICAL' && (
                                <span className="px-2.5 py-1 rounded-lg bg-red-950/70 text-red-300 border border-red-500/40 text-[10px] font-black flex items-center gap-1 uppercase tracking-wider animate-pulse shadow-sm shadow-red-950/30" title="Risco iminente de esgotamento (< 15 dias)">
                                  <Clock className="w-3 h-3 text-red-400 shrink-0" />
                                  ~{forecast.daysUntilStockout} DIAS RESTANTES
                                </span>
                              )}
                              {forecast.status === 'WARNING' && (
                                <span className="px-2.5 py-1 rounded-lg bg-amber-950/70 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold flex items-center gap-1 uppercase tracking-wider shadow-sm" title="Programar pedido de compras (15 - 30 dias)">
                                  <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                                  ~{forecast.daysUntilStockout} DIAS RESTANTES
                                </span>
                              )}
                              {forecast.status === 'SAFE' && (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 text-[10px] font-bold flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                                  ~{forecast.daysUntilStockout} DIAS (ESTÁVEL)
                                </span>
                              )}
                              {forecast.status === 'EXTENSIVE' && (
                                <span className="px-2.5 py-1 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-900/30 text-[10px] font-bold flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-cyan-500 shrink-0" />
                                  {forecast.daysUntilStockout >= 999 ? '> 365 DIAS' : `~${forecast.daysUntilStockout} DIAS`}
                                </span>
                              )}

                              <span className="text-[9.5px] text-gray-400">
                                Demanda: <strong className="text-gray-200">~{forecast.monthlyAverageExits} un/mês</strong> ({forecast.dailyAverageExits}/dia)
                              </span>

                              {forecast.suggestedReorderQty > 0 && (
                                <span className="text-[9px] text-amber-300 font-bold flex items-center gap-1 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/25">
                                  <ShoppingBag className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                  Recompra: +{forecast.suggestedReorderQty} un
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })()}

                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button 
                            type="button"
                            onClick={() => handleStartEditProduct(p)}
                            className="p-1 text-[11px] bg-slate-900 border border-gray-800 text-slate-300 rounded hover:border-red-500 hover:text-red-500 transition-colors flex items-center gap-1 px-2 py-1 mt-auto"
                          >
                            <Edit className="w-3 h-3" /> Ficha
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              setSelectedChartProdId(p.id);
                              setActiveTab('movimentacoes');
                            }}
                            className="p-1 text-[11px] bg-slate-900 border border-gray-800 text-cyan-400 rounded hover:border-cyan-500 hover:text-cyan-300 transition-colors flex items-center gap-1 px-2 py-1 mt-auto font-mono cursor-pointer"
                            title="Ver gráfico de movimentação dos últimos 6 meses"
                          >
                            <TrendingUp className="w-3 h-3" /> Gráfico
                          </button>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[8px] font-mono font-black tracking-wider px-1.5 py-0.2 rounded bg-gradient-to-r from-red-650 to-red-900 text-white border border-red-500/20 shadow-sm animate-pulse uppercase">
                              Estoque: {p.quantity}
                            </span>
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
                        </div>
                      </td>

                    </motion.tr>
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
                               {/* CADASTRO TAB (Peça nova com presets inteligentes, seletores de margem e distribuidora) */}
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

      {/* CADASTRO TAB (Peça nova com presets inteligentes, seletores de margem e distribuidora) */}
      {activeTab === 'cadastro' && (
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
          
          {/* ASSISTENTE DE BUSCA POR CÂMERA & BANNER CSV LOTE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* CARD 1: ASSISTENTE DE CÂMERA / AUTO-FILL POR CÓDIGO DE BARRAS */}
            <div className="bg-gradient-to-br from-[#120f26] via-[#0d1226] to-[#0a0f1d] border border-purple-500/40 rounded-2xl p-4 shadow-xl relative overflow-hidden flex flex-col justify-between gap-3">
              <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-950 border border-purple-500/50 text-purple-400">
                      <Camera className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-white text-sm tracking-tight flex items-center gap-1.5">
                        ASSISTENTE DE CÂMERA & BARCODE
                      </h3>
                      <span className="text-[10px] text-purple-300/80 font-mono block">
                        Auto-preenchimento instantâneo de peças por código EAN
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-purple-950 text-purple-300 border border-purple-800">
                    ⚡ Câmera HD
                  </span>
                </div>

                <p className="text-xs text-gray-300 mt-2.5 leading-relaxed">
                  Aponte a câmera do celular ou leitor USB para a caixa do produto. O assistente identifica <strong>Lâmpadas (H7, H4, LED)</strong>, <strong>Colas (Loctite, Tekbond, Silicone RTV)</strong>, <strong>Sprays</strong> e <strong>Filtros</strong> e preenche automaticamente Marca, SKU, Categoria, Custo e Venda!
                </p>

                {/* Sample barcode chips */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[9.5px] text-gray-400 font-mono font-bold block w-full">TESTAR BIPAGEM DE EXEMPLO:</span>
                  {[
                    { label: "💡 Lâmpada H7 Philips", code: "7891002003001" },
                    { label: "🧪 Silicone RTV Tekbond", code: "7898001002001" },
                    { label: "🔒 Cola Trava Rosca Loctite", code: "7896001003001" },
                    { label: "🛢️ Filtro Óleo Fram", code: "7892201103002" }
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => lookupBarcodeAndAutofill(chip.code, 'new')}
                      className="px-2 py-1 rounded-lg bg-[#181135] hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-[10.5px] font-mono transition-all cursor-pointer hover:scale-105"
                      title={`Bipar ${chip.code}`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between gap-2">
                <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                  <Scan className="w-3.5 h-3.5 text-purple-400" /> Bipagem rápida ativa
                </span>
                <button
                  type="button"
                  onClick={() => { playStockBeeper(); setStockScannerTarget('new'); setShowStockScannerModal(true); }}
                  className="py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-[11px] font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-4 h-4" /> Bipar com a Câmera
                </button>
              </div>
            </div>

            {/* CARD 2: CADASTRO EM LOTE VIA CSV */}
            <div className="bg-gradient-to-br from-[#0c1e19] via-[#0a1714] to-[#07110e] border border-emerald-500/40 rounded-2xl p-4 shadow-xl relative overflow-hidden flex flex-col justify-between gap-3">
              <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-400">
                      <FileSpreadsheet className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-white text-sm tracking-tight flex items-center gap-1.5">
                        CADASTRO EM LOTE (CSV)
                      </h3>
                      <span className="text-[10px] text-emerald-300/80 font-mono block">
                        Importe dezenas de itens de uma só vez
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    📊 Excel / CSV
                  </span>
                </div>

                <p className="text-xs text-gray-300 mt-2.5 leading-relaxed">
                  Suba planilhas da oficina para cadastrar dezenas de produtos (lâmpadas, colas, silicones, buchas, filtros) em segundos. O sistema valida SKUs e valores antes de gravar.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadCsvTemplate}
                    className="px-2.5 py-1.5 rounded-lg bg-[#0d2820] hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[10.5px] font-mono transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Baixar Modelo .CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => { playStockBeeper(); handleLoadSampleCsvBatch(); setShowCsvBatchModal(true); }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#143d31] hover:bg-emerald-800/60 border border-emerald-400/40 text-emerald-200 text-[10.5px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    ⚡ Testar Lote Exemplo (8 Peças)
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between gap-2">
                <span className="text-[10px] text-gray-400 font-mono">
                  Compatível com Excel, Google Sheets, ERPs
                </span>
                <button
                  type="button"
                  onClick={() => { playStockBeeper(); setShowCsvBatchModal(true); }}
                  className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" /> Abrir Modal em Lote
                </button>
              </div>
            </div>

          </div>

          {/* BANNER / PAINEL DE MODELOS PRONTOS PARA CADASTRO RÁPIDO (LÂMPADAS, COLAS, ELÉTRICA & INSUMOS) */}
          <div className="bg-gradient-to-br from-[#0e172a] via-[#0c1324] to-[#080d19] rounded-2xl border border-cyan-500/30 p-5 shadow-2xl relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-inner">
                  <Sparkles className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-extrabold text-white text-sm sm:text-base tracking-tight">
                      CADASTRO RÁPIDO EM 1-CLIQUE (PRESETS DA OFICINA)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold uppercase bg-cyan-950 border border-cyan-500/50 text-cyan-300">
                      ⚡ Lâmpadas • Colas • Silicones • Sprays
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Selecione qualquer item comum da lista para preencher todo o formulário (marca, SKU, custo, venda e aplicação) em menos de 1 segundo!
                  </p>
                </div>
              </div>

              {/* Group Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto font-mono text-[10.5px]">
                <button
                  type="button"
                  onClick={() => setSelectedPresetGroup('all')}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
                    selectedPresetGroup === 'all'
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-md'
                      : 'bg-slate-900/80 text-gray-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  Todos ({STOCK_PRESET_ITEMS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPresetGroup('eletrica')}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold flex items-center gap-1 ${
                    selectedPresetGroup === 'eletrica'
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                      : 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/60'
                  }`}
                >
                  <Zap className="w-3 h-3" /> ⚡ Lâmpadas & Elétrica
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPresetGroup('quimica')}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold flex items-center gap-1 ${
                    selectedPresetGroup === 'quimica'
                      ? 'bg-purple-500 text-white border-purple-400 shadow-md'
                      : 'bg-purple-950/40 text-purple-300 border-purple-800/60 hover:bg-purple-900/60'
                  }`}
                >
                  <FlaskConical className="w-3 h-3" /> 🧪 Colas & Química
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPresetGroup('insumos')}
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold flex items-center gap-1 ${
                    selectedPresetGroup === 'insumos'
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60'
                  }`}
                >
                  <Wrench className="w-3 h-3" /> 🛠️ Insumos & Sprays
                </button>
              </div>
            </div>

            {/* Presets Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              {filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    applyStockPreset(preset);
                    setPresetSuccessNotice(`✨ Modelo "${preset.name}" aplicado! Ajuste se necessário e clique em Registrar.`);
                    setTimeout(() => setPresetSuccessNotice(''), 4000);
                  }}
                  className="group bg-[#080d1a] hover:bg-[#101930] border border-gray-800 hover:border-cyan-500/50 rounded-xl p-2.5 transition-all cursor-pointer flex flex-col justify-between gap-1.5 shadow-sm hover:shadow-cyan-950/30 active:scale-[98%]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`p-1.5 rounded-lg text-xs shrink-0 ${
                        preset.group === 'eletrica' 
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50' 
                          : preset.group === 'quimica'
                          ? 'bg-purple-950/80 text-purple-400 border border-purple-800/50'
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                      }`}>
                        {preset.group === 'eletrica' ? <Zap className="w-3.5 h-3.5" /> : preset.group === 'quimica' ? <FlaskConical className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {preset.name}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-mono block truncate">
                          {preset.brand} • {preset.sku}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 px-1.5 py-0.5 rounded shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      APLICAR
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10.5px] font-mono pt-1 border-t border-gray-800/60 text-gray-300">
                    <span>
                      Custo: <strong className="text-red-400">R$ {preset.costPrice.toFixed(2)}</strong>
                    </span>
                    <span>
                      Venda: <strong className="text-emerald-400">R$ {preset.sellPrice.toFixed(2)}</strong>
                    </span>
                    <span className="text-[9.5px] text-gray-400 font-sans">
                      Qtd: {preset.quantity} un
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FORMULARIO DE REGISTRO MANUAL */}
          <form onSubmit={handleCreateProduct} className="w-full bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6 shadow-xl">
            <div className="border-b border-gray-850 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-display font-extrabold text-white text-base">FORMULÁRIO DE CADASTRO MANUAL DE COMPONENTE</h3>
                <span className="text-xs text-gray-400">
                  Insira os custos de aquisição e a margem de faturamento para vendas no balcão e de ordens de serviço.
                </span>
              </div>
              {presetSuccessNotice && (
                <span className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold animate-pulse flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> {presetSuccessNotice}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* DENOMINACAO TECNICA COM AUTOCOMPLETE */}
              <div className="md:col-span-2 flex flex-col gap-1 relative">
                <label className="text-[10px] font-mono text-gray-400">DENOMINAÇÃO TÉCNICA DA PEÇA *</label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Ex: Lâmpada H7 12V 55W Philips ou Silicone RTV Cinza..."
                    value={newProdName}
                    onChange={(e) => {
                      setNewProdName(e.target.value);
                      setShowNameAutocomplete(true);
                    }}
                    onFocus={() => setShowNameAutocomplete(true)}
                    className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white w-full focus:border-cyan-500 focus:outline-none transition-colors"
                    required
                  />

                  {/* Autocomplete Dropdown if typing matches presets */}
                  {showNameAutocomplete && autocompleteMatches.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#090e1a] border border-cyan-500/50 rounded-xl shadow-2xl z-50 overflow-hidden max-h-56 overflow-y-auto custom-scrollbar">
                      <div className="px-3 py-1.5 bg-cyan-950/90 border-b border-cyan-800/40 text-[10px] font-mono font-bold text-cyan-300 flex items-center justify-between">
                        <span>💡 SUGESTÕES ENCONTRADAS (CLIQUE PARA PREENCHER):</span>
                        <button 
                          type="button" 
                          onClick={() => setShowNameAutocomplete(false)}
                          className="text-gray-400 hover:text-white text-[9px] underline cursor-pointer"
                        >
                          Fechar
                        </button>
                      </div>
                      {autocompleteMatches.map((match) => (
                        <div
                          key={match.id}
                          onClick={() => {
                            applyStockPreset(match);
                            setShowNameAutocomplete(false);
                            setPresetSuccessNotice(`✨ "${match.name}" carregado!`);
                            setTimeout(() => setPresetSuccessNotice(''), 3000);
                          }}
                          className="px-3 py-2.5 hover:bg-cyan-950/70 border-b border-gray-800/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-amber-400 shrink-0">⚡</span>
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate">{match.name}</div>
                              <div className="text-[10px] text-gray-400 font-mono truncate">{match.brand} • Categoria: {match.category}</div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 font-mono text-[11px] ml-2">
                            <div className="text-emerald-400 font-bold">R$ {match.sellPrice.toFixed(2)}</div>
                            <div className="text-[9px] text-gray-400">Custo R$ {match.costPrice.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                  placeholder="Ex: Philips, Osram, 3M, Loctite, Bosch, SKF"
                  value={newProdBrand}
                  onChange={(e) => setNewProdBrand(e.target.value)}
                  className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-gray-400">SKU INTERNO (CÓDIGO DE GESTÃO)</label>
                <input 
                  type="text"
                  placeholder="Ex: LMP-H7-PHL ou SIL-RTV-50G"
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
                  placeholder="Ex: Universal 12V, Linha Leve VW/Fiat/GM ou Vedação de Motor/Cárter"
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
                <label className="text-[10px] font-mono text-red-400">PREÇO DE CUSTO (FORNECEDOR R$)</label>
                <input 
                  type="number"
                  step="0.01"
                  placeholder="Ex: 15.00"
                  value={newProdCost}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewProdCost(val);
                    const parsedCost = parseFloat(val);
                    if (!isNaN(parsedCost) && parsedCost >= 0) {
                      const markup = company?.defaultMarkup !== undefined ? company.defaultMarkup : 50;
                      const suggestedSell = parsedCost + (parsedCost * markup / 100);
                      setNewProdSell(suggestedSell.toFixed(2));
                    } else {
                      setNewProdSell('');
                    }
                  }}
                  className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-green-400">PREÇO VENDA BALCÃO (R$) *</label>
                <input 
                  type="number"
                  step="0.01"
                  placeholder="Ex: 38.00"
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
                  placeholder="Ex: 10"
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
                  placeholder="Ex: 4"
                  value={newProdMin}
                  onChange={(e) => setNewProdMin(e.target.value)}
                  className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-gray-400">FABRICANTE (ORIGINAL)</label>
                <input 
                  type="text"
                  placeholder="Ex: Philips Automotive ou 3M"
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

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 border-t border-gray-850 pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 font-mono hover:text-white transition-colors">
                <input 
                  type="checkbox"
                  checked={batchModeKeepCategory}
                  onChange={(e) => setBatchModeKeepCategory(e.target.checked)}
                  className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-red-600 focus:ring-0 cursor-pointer"
                />
                <span>⚡ Cadastrar em Lote (manter Categoria, Fornecedor e Marca para o próximo item)</span>
              </label>

              <button 
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl font-bold font-mono text-white text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[98%] transition-all"
              >
                📥 REGISTRAR COMPONENTE NO ESTOQUE
              </button>
            </div>
          </form>

        </div>
      )}

      {/* MOVIMENTACOES TAB WITH 6-MONTH LINE CHART */}
      {activeTab === 'movimentacoes' && (() => {
        const currentChartProduct = produtos.find(p => p.id === (selectedChartProdId || produtos[0]?.id)) || produtos[0];
        const chartAnalytics = getMonthlyMovementsForProduct(currentChartProduct, ordensServico, movementsList);

        // Custom Dot component to render visual markers for abnormal spikes
        const renderCustomDot = (props: any, type: 'entradas' | 'saidas') => {
          const { cx, cy, payload } = props;
          if (cx == null || cy == null || !payload) return null;

          const isAnomaly = type === 'entradas' ? payload.isAnomalyEntrada : payload.isAnomalySaida;
          const normalColor = type === 'entradas' ? '#10b981' : '#ef4444';
          const anomalyColor = type === 'entradas' ? '#f59e0b' : '#ff0055';

          if (isAnomaly) {
            return (
              <g key={`dot-${type}-${payload.label}`}>
                {/* Outer pulsing ring */}
                <circle cx={cx} cy={cy} r={12} fill={anomalyColor} fillOpacity={0.25} className="animate-pulse" />
                <circle cx={cx} cy={cy} r={7.5} fill="#080c16" stroke={anomalyColor} strokeWidth={2.5} />
                <circle cx={cx} cy={cy} r={3.5} fill={anomalyColor} />
                
                {/* Spike indicator badge */}
                <g transform={`translate(${cx - 18}, ${cy - 24})`}>
                  <rect width="36" height="14" rx="4" fill="#080d19" stroke={anomalyColor} strokeWidth="1" />
                  <text x="18" y="10" textAnchor="middle" fill={anomalyColor} fontSize="8" fontWeight="bold" fontFamily="monospace">
                    ⚡ PICO
                  </text>
                </g>
              </g>
            );
          }

          return (
            <circle 
              key={`dot-${type}-${payload.label}`}
              cx={cx} 
              cy={cy} 
              r={4} 
              fill={normalColor} 
              stroke="#080c16" 
              strokeWidth={2} 
            />
          );
        };

        return (
          <div className="flex flex-col gap-6">
            {/* SECTION 1: LINE CHART FOR SPECIFIC PART MOVEMENT OVER PAST 6 MONTHS */}
            <div className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6 shadow-xl">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-850 pb-5">
                <div>
                  <h3 className="font-display font-extrabold text-white text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    MOVIMENTAÇÃO DE ENTRADAS E SAÍDAS (ÚLTIMOS 6 MESES)
                  </h3>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                    Acompanhamento do fluxo de reposição de estoque (entradas por NF) e consumo da oficina (saídas por OS/venda) por peça.
                  </p>
                </div>

                {/* Product Selector Dropdown */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto shrink-0">
                  <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider shrink-0">
                    Selecione a Peça:
                  </span>
                  <select
                    value={currentChartProduct?.id || ''}
                    onChange={(e) => setSelectedChartProdId(e.target.value)}
                    className="w-full sm:w-80 bg-[#080c16] border border-gray-750 text-white font-mono text-xs rounded-xl py-2.5 px-3 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>
                        [{p.internalSku}] {p.name} ({p.quantity} un em estoque)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Highlight KPI metrics for selected product */}
              {currentChartProduct && (() => {
                const forecast12m = calculate12MonthDemandForecast(currentChartProduct, ordensServico, movementsList);
                return (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                    <div className="p-3.5 bg-[#080d19] border border-gray-850 rounded-xl flex flex-col gap-1">
                      <span className="text-[9px] text-gray-400 font-mono uppercase font-bold tracking-wider">📥 Entradas (6m)</span>
                      <span className="text-emerald-400 font-mono font-extrabold text-lg">
                        +{chartAnalytics.totalEntradas} <span className="text-xs font-normal text-gray-400">un</span>
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono">Lotes & Compras</span>
                    </div>

                    <div className="p-3.5 bg-[#080d19] border border-gray-850 rounded-xl flex flex-col gap-1">
                      <span className="text-[9px] text-gray-400 font-mono uppercase font-bold tracking-wider">📤 Saídas (6m)</span>
                      <span className="text-red-400 font-mono font-extrabold text-lg">
                        -{chartAnalytics.totalSaidas} <span className="text-xs font-normal text-gray-400">un</span>
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono">Ordens de Serviço & Balcão</span>
                    </div>

                    <div className="p-3.5 bg-[#080d19] border border-gray-850 rounded-xl flex flex-col gap-1">
                      <span className="text-[9px] text-gray-400 font-mono uppercase font-bold tracking-wider">🔄 Média Mensal (12m)</span>
                      <span className="text-cyan-400 font-mono font-extrabold text-lg">
                        {forecast12m.monthlyAverageExits} <span className="text-xs font-normal text-gray-400">un/mês</span>
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono">Giro histórico anual</span>
                    </div>

                    <div className="p-3.5 bg-[#080d19] border border-gray-850 rounded-xl flex flex-col gap-1">
                      <span className="text-[9px] text-gray-400 font-mono uppercase font-bold tracking-wider">📦 Saldo Atual Físico</span>
                      <span className="text-white font-mono font-extrabold text-lg">
                        {currentChartProduct.quantity} <span className="text-xs font-normal text-gray-400">un</span>
                      </span>
                      <span className={`text-[9px] font-mono ${currentChartProduct.quantity <= currentChartProduct.minStock ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                        {currentChartProduct.quantity <= currentChartProduct.minStock ? '⚠️ Estoque Crítico' : `Estoque Mínimo: ${currentChartProduct.minStock} un`}
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#0a1024] border border-purple-500/30 rounded-xl flex flex-col gap-1 col-span-2 md:col-span-1">
                      <span className="text-[9px] text-purple-300 font-mono uppercase font-bold tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3 text-purple-400" />
                        Esgotamento (12m)
                      </span>
                      <span className={`font-mono font-extrabold text-lg ${
                        forecast12m.status === 'OUT_OF_STOCK' || forecast12m.status === 'CRITICAL' 
                          ? 'text-red-400' 
                          : forecast12m.status === 'WARNING' 
                          ? 'text-amber-400' 
                          : 'text-emerald-400'
                      }`}>
                        {forecast12m.daysUntilStockout === 0 ? '0 dias (Esgotado)' : `~${forecast12m.daysUntilStockout} dias`}
                      </span>
                      <span className="text-[9px] text-purple-300/80 font-mono">
                        {forecast12m.suggestedReorderQty > 0 ? `Recompra: +${forecast12m.suggestedReorderQty} un` : 'Estoque Coberto'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* ANOMALY DETECTION SUMMARY CARD */}
              {chartAnalytics.anomaliesList.length > 0 ? (
                <div className="bg-[#130b1e] border border-amber-500/40 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-xl shrink-0">
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="font-bold text-amber-300 text-sm block flex items-center gap-2">
                        Picos Incomuns Identificados ({chartAnalytics.anomaliesList.length} anomalias detectadas)
                      </span>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Identificação de variações de volume desproporcionais (+40% acima da média) para otimização de compras e prevenção de desabastecimento.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {chartAnalytics.anomaliesList.map((an, idx) => (
                      <div 
                        key={idx} 
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 ${
                          an.type === 'Entrada' 
                            ? 'bg-amber-950/70 border-amber-500/50 text-amber-300 shadow-sm' 
                            : 'bg-red-950/70 border-red-500/50 text-red-300 shadow-sm'
                        }`}
                      >
                        <span>{an.type === 'Entrada' ? '📥' : '📤'}</span>
                        <span><strong>{an.month}:</strong> {an.type} de {an.qty} un</span>
                        <span className="opacity-80">({an.diffPct > 0 ? `+${an.diffPct}%` : `${an.diffPct}%`})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[#080d1a] border border-gray-850 rounded-xl p-3 flex items-center gap-2 text-[11px] font-mono text-gray-400">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Nenhum pico atípico ou anomalia grave detectada para esta peça nos últimos 6 meses. Consumo e reposição regulares.</span>
                </div>
              )}

              {/* LINE CHART CONTAINER */}
              <div className="bg-[#080c16] rounded-xl border border-gray-850 p-4 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono px-1">
                  <span className="text-gray-300 font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span>
                    Gráfico de Movimentação: <strong className="text-white">{currentChartProduct?.name}</strong>
                  </span>

                  {/* VISUAL MARKER LEGEND EXPLANATION */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-gray-400 bg-[#060a13] px-3 py-1.5 rounded-lg border border-gray-850">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                      Entradas
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                      Saídas
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-300 font-bold border-l border-gray-800 pl-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block animate-ping"></span>
                      ⚡ Pico Incomun (Marcador)
                    </span>
                  </div>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartAnalytics.monthsData}
                      margin={{ top: 20, right: 25, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#182235" vertical={false} />
                      <XAxis 
                        dataKey="label" 
                        stroke="#6b7280" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        fontFamily="monospace"
                      />
                      <YAxis 
                        stroke="#6b7280" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        fontFamily="monospace"
                        tickFormatter={(val) => `${val} un`}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-[#090f1d] border border-gray-750 p-3.5 rounded-xl shadow-2xl flex flex-col gap-2 text-left font-mono text-xs max-w-xs">
                                <div className="flex justify-between items-center border-b border-gray-800 pb-1.5">
                                  <span className="font-bold text-white uppercase text-[11px] block">
                                    📅 {data.fullMonth || label}
                                  </span>
                                  {(data.isAnomalyEntrada || data.isAnomalySaida) && (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-bold flex items-center gap-1 animate-pulse">
                                      ⚡ Pico Incomun
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-col gap-1.5 mt-0.5">
                                  <div className="flex justify-between items-center gap-6">
                                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                      Entradas (NF / Lotes):
                                    </span>
                                    <strong className="text-emerald-400 text-sm">+{data.entradas} un</strong>
                                  </div>

                                  {data.isAnomalyEntrada && (
                                    <div className="bg-amber-950/60 border border-amber-500/30 p-1.5 rounded-lg text-amber-300 text-[10px] flex items-start gap-1 font-semibold leading-tight">
                                      <span>⚠️</span>
                                      <span>{data.anomalyReasonEntrada}</span>
                                    </div>
                                  )}

                                  <div className="flex justify-between items-center gap-6 mt-1">
                                    <span className="text-red-400 font-bold flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                      Saídas (OS / Balcão):
                                    </span>
                                    <strong className="text-red-400 text-sm">-{data.saidas} un</strong>
                                  </div>

                                  {data.isAnomalySaida && (
                                    <div className="bg-red-950/60 border border-red-500/30 p-1.5 rounded-lg text-red-300 text-[10px] flex items-start gap-1 font-semibold leading-tight">
                                      <span>⚠️</span>
                                      <span>{data.anomalyReasonSaida}</span>
                                    </div>
                                  )}

                                  <div className="flex justify-between items-center gap-6 border-t border-gray-850 pt-1.5 mt-1">
                                    <span className="text-gray-400">Balanço do Mês:</span>
                                    <strong className={data.saldoMes >= 0 ? 'text-cyan-400' : 'text-orange-400'}>
                                      {data.saldoMes >= 0 ? `+${data.saldoMes}` : data.saldoMes} un
                                    </strong>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontFamily: 'monospace' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="entradas" 
                        name="Entradas (Lotes/NF-e)" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        dot={(props: any) => renderCustomDot(props, 'entradas')}
                        activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2, fill: '#080c16' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="saidas" 
                        name="Saídas (OSs/Balcão)" 
                        stroke="#ef4444" 
                        strokeWidth={3} 
                        dot={(props: any) => renderCustomDot(props, 'saidas')}
                        activeDot={{ r: 8, stroke: '#ef4444', strokeWidth: 2, fill: '#080c16' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* SECTION 2: HISTÓRICO RECENTE DE TRANSAÇÕES */}
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
          </div>
        );
      })()}

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
                  <span className="text-[10px] text-slate-500 font-mono">Formatos suportados: .xml, .tmp (Padrão SEFAZ NF-e 4.00)</span>
                </div>

                <label className="mt-2 text-xs font-mono font-bold py-2 px-4 rounded border border-gray-800 hover:border-gray-700 bg-slate-950 text-slate-300 hover:text-white transition-colors cursor-pointer relative z-10">
                  {xmlFileSelected ? `📄 ${xmlFileName}` : "Selecionar Arquivo da Nota..."}
                  <input 
                    type="file" 
                    accept=".xml,.tmp" 
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

              {/* Duplicate SKU alert banner */}
              {(() => {
                const duplicateItems = parsedXml.items.filter(item => 
                  produtos.some(p => 
                    p.internalSku.toLowerCase() === item.code.toLowerCase() || 
                    (p.barcode && p.barcode === item.barcode)
                  )
                );
                if (duplicateItems.length === 0) return null;

                return (
                  <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl flex items-start gap-3 animate-fadeIn">
                    <div className="p-2 bg-amber-955/40 text-amber-500 bg-amber-950/40 border border-amber-900/30 rounded-lg shrink-0 flex items-center justify-center animate-pulse">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="text-left font-sans">
                      <h4 className="text-amber-400 text-xs font-bold font-mono uppercase tracking-wider">
                        ⚠️ Alerta de Duplicidade no Catálogo ({duplicateItems.length} {duplicateItems.length === 1 ? 'item detectado' : 'itens detectados'})
                      </h4>
                      <p className="text-[11.5px] text-gray-400 mt-1 leading-relaxed">
                        Detectamos que a nota fiscal contém {duplicateItems.length} produto(s) cujo SKU ou Código de barras já existem em seu catálogo interno:{" "}
                        <strong className="text-white font-mono text-[10.5px]">
                          {duplicateItems.map(item => item.code).join(", ")}
                        </strong>.
                        Caso prossiga com o processamento da entrada, o estoque desses itens será atualizado somando o saldo existente no ERP, garantindo a perfeita integridade dos lotes sem gerar cadastros desnecessários.
                      </p>
                    </div>
                  </div>
                );
              })()}

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

      {/* 📥 INVENTORY AUTOMATIC XML IMPORTER OVERLAY MODAL */}
      {showXmlImporterModal && (
        <div id="xml-importer-modal" className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-[#0b132b] border border-gray-805 border-gray-800 text-white rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl relative overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-850 bg-[#070b19] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-950/40 border border-red-500/30 rounded-xl">
                  <FileCode className="w-5 h-5 text-red-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm tracking-wide text-white uppercase flex items-center gap-2">
                    Importador Automático de XML (NF-e)
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono block">
                    Processamento inteligente de Notas Fiscais eletrônicas da SEFAZ para reabastecimento imediato de estoque
                  </span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setShowXmlImporterModal(false);
                }}
                className="px-3 py-1.5 bg-[#141d33] hover:bg-red-650 hover:bg-red-600 hover:text-white text-gray-400 border border-gray-800 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
              >
                Fechar (Esc)
              </button>
            </div>

            {/* XML Import Main Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar bg-[#091122]/40">
              
              {/* If XML is NOT loaded, show dropzone and samples */}
              {!parsedXml ? (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    
                    <div className="md:col-span-7 bg-[#0c1223] rounded-2xl border border-gray-850 border-gray-800 p-6 flex flex-col gap-5 justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-red-950/40 text-red-500 border border-red-900/30 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-red-400 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="text-white font-display font-extrabold text-base">Entrada de Mercadoria via XML</h3>
                          <p className="text-[11px] text-gray-400 font-mono">Arraste ou selecione o arquivo fiscal válido para início do parsing de produtos.</p>
                        </div>
                      </div>

                      <div className="bg-[#080c16] border-2 border-dashed border-gray-800 hover:border-red-500/30 transition-colors rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-center relative group">
                        <Upload className="w-10 h-10 text-gray-600 group-hover:text-red-400 transition-colors" />
                        
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-200 font-semibold">Arraste o XML de Nota Fiscal aqui</span>
                          <span className="text-[10px] text-slate-500 font-mono">Formatos suportados: .xml, .tmp (Padrão SEFAZ NF-e 4.00)</span>
                        </div>

                        <label className="mt-2 text-xs font-mono font-bold py-2 px-4 rounded border border-gray-800 hover:border-gray-700 bg-slate-950 text-slate-300 hover:text-white transition-colors cursor-pointer relative z-10">
                          {xmlFileSelected ? `📄 ${xmlFileName}` : "Selecionar Arquivo da Nota..."}
                          <input 
                            type="file" 
                            accept=".xml,.tmp" 
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
                        <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                          Para homologar o decodificador agora mesmo, simulamos notas completas com produtos de fabricantes padrão:
                        </p>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleLoadSampleXml('bosch')}
                          className="w-full text-left p-3 rounded-xl border border-gray-850 border-gray-800 hover:border-red-500/40 bg-slate-950/40 hover:bg-slate-950 text-xs flex justify-between items-center transition-all cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-white block">📦 NF-e Nº 008592 - Robert Bosch Ltda</span>
                            <span className="text-[9.5px] text-gray-500 font-mono">Velais Iridium, Pastilhas, Filtro de Óleo</span>
                          </div>
                          <Check className="w-4 h-4 text-emerald-500" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleLoadSampleXml('cofap')}
                          className="w-full text-left p-3 rounded-xl border border-gray-850 border-gray-800 hover:border-red-500/40 bg-slate-950/40 hover:bg-slate-950 text-xs flex justify-between items-center transition-all cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-white block">📦 NF-e Nº 014902 - Marelli Cofap</span>
                            <span className="text-[9.5px] text-gray-500 font-mono">Amortecedor, Rolamento SKF Traseiro</span>
                          </div>
                          <Check className="w-4 h-4 text-emerald-500" />
                        </button>
                      </div>

                      <div className="bg-[#050912] p-3 rounded-xl border border-gray-900 text-[10px] text-center text-gray-500 leading-normal font-mono">
                        💡 Nosso leitor reconhece CNPJ, SKU, quantidades e custos automaticamente!
                      </div>
                    </div>

                  </div>

                  {/* SUCCESS BANNER OVERVIEW OR GENERAL INFO */}
                  {xmlImportSuccess && (
                    <div className="bg-emerald-950/10 border border-emerald-900/30 p-4 rounded-xl flex items-center justify-between text-left animate-fadeIn">
                      <div>
                        <strong className="text-emerald-400 text-xs font-mono font-bold block uppercase">✅ IMPORTAÇÃO REALIZADA COM SUCESSO!</strong>
                        <span className="text-[11px] text-gray-400 block mt-0.5">Os faturamentos de balcão e fichas físicas de estoque foram reabesteados. Você já pode visualizar a movimentação na aba de logs.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowXmlImporterModal(false);
                          setActiveTab('geral');
                        }}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-mono font-bold text-[10px] uppercase cursor-pointer"
                      >
                        Concluído
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  
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
                      <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">Série: 1 • Situação: Autorizada</span>
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
                      <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">Módulo Fiscal Oficial</span>
                    </div>
                  </div>

                  {/* Duplicate SKU alert banner inside modal */}
                  {(() => {
                    const duplicateItems = parsedXml.items.filter(item => 
                      produtos.some(p => 
                        p.internalSku.toLowerCase() === item.code.toLowerCase() || 
                        (p.barcode && p.barcode === item.barcode)
                      )
                    );
                    if (duplicateItems.length === 0) return null;

                    return (
                      <div className="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl flex items-start gap-3 animate-fadeIn text-left">
                        <div className="p-2 bg-amber-950/40 border border-amber-900/30 rounded-lg shrink-0 flex items-center justify-center animate-pulse">
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <h4 className="text-amber-400 text-xs font-bold font-mono uppercase tracking-wider">
                            ⚠️ Alerta de Duplicidade detectada ({duplicateItems.length} {duplicateItems.length === 1 ? 'item' : 'itens'})
                          </h4>
                          <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                            Detectamos que {duplicateItems.length} SKU(s) / barras já constam no cadastro principal: {" "}
                            <strong className="text-white font-mono">{duplicateItems.map(item => item.code).join(", ")}</strong>.
                            Ao prosseguir, somaremos o novo saldo ao estoque existente de forma automática.
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Table of items inside modal */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-850">
                      <span className="text-white font-display font-semibold text-sm">Relação de Peças Fiscalizadas no XML</span>
                      <span className="text-[10px] text-gray-400 font-mono">{parsedXml.items.length} componentes identificados</span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-gray-850/80">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-gray-900 bg-slate-950/40 text-gray-400 text-[10px] font-mono uppercase tracking-wider">
                            <th className="py-3 px-3 text-center w-12">Selec.</th>
                            <th className="py-3 px-3">Código/EAN</th>
                            <th className="py-3 px-3">Peça / Produto Fiscal</th>
                            <th className="py-3 px-2 text-center w-16">Qtd XML</th>
                            <th className="py-3 px-3 text-right">Custo Un.</th>
                            <th className="py-3 px-3 text-right">Subtotal</th>
                            <th className="py-3 px-3">Destino ERP de Autopeças</th>
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
                              <tr key={idx} className="border-b border-gray-900/60 hover:bg-slate-950/10 transition-colors bg-slate-950/5">
                                
                                <td className="py-3.5 px-3 text-center">
                                  <input 
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => setSelectedXmlItems(prev => ({ ...prev, [item.code]: e.target.checked }))}
                                    className="w-4 h-4 rounded text-red-500 bg-slate-950 border-gray-850 focus:ring-0 cursor-pointer"
                                  />
                                </td>

                                <td className="py-3.5 px-3 font-mono text-gray-300">
                                  <span className="block font-bold">{item.code}</span>
                                  <span className="text-[9px] text-gray-500">EAN: {item.barcode || "Ausente"}</span>
                                </td>

                                <td className="py-3.5 px-3 text-slate-100 font-semibold max-w-xs truncate">
                                  {item.name}
                                  <span className="text-[9.5px] block text-purple-400 font-mono font-bold uppercase mt-0.5">{item.brand} • {item.unit}</span>
                                </td>

                                <td className="py-3.5 px-2 text-center font-mono font-bold text-white">
                                  {item.qty}
                                </td>

                                <td className="py-3.5 px-3 text-right font-mono text-gray-300">
                                  R$ {item.costPrice.toFixed(2)}
                                </td>

                                <td className="py-3.5 px-3 text-right font-mono text-gray-150 font-bold">
                                  R$ {(item.costPrice * item.qty).toFixed(2)}
                                </td>

                                <td className="py-3.5 px-3">
                                  {matchedProduct ? (
                                    <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-900/20 text-[10.5px] leading-tight flex flex-col gap-0.5 text-left">
                                      <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono uppercase text-[9px]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block" />
                                        Vincular ao Cadastro ERP
                                      </span>
                                      <span className="text-slate-350 block font-semibold truncate">{matchedProduct.name}</span>
                                      <span className="text-gray-400 font-mono text-[9px]">Saldo atual: <strong className="text-slate-200">{matchedProduct.quantity} un</strong> • Novo Saldo: <strong className="text-emerald-400">{matchedProduct.quantity + item.qty} un</strong></span>
                                    </div>
                                  ) : (
                                    <div className="bg-amber-950/20 p-2.5 rounded-xl border border-amber-900/30 text-[10.5px] leading-tight flex flex-col gap-1.5 text-left">
                                      <span className="text-amber-400 font-bold font-mono uppercase text-[9px] block">
                                        🛑 Novo Item (Será cadastrado)
                                      </span>
                                      
                                      <div className="grid grid-cols-2 gap-2">
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
                                          <span className="text-[9px] text-gray-500 font-mono block">PREÇO SUGERIDO (R$)</span>
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

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-950/30 p-4 rounded-xl border border-gray-900 text-xs bg-slate-950/40">
                      <div className="text-left leading-normal">
                        <span className="text-gray-400 block font-semibold">Considerações Importantes:</span>
                        <span className="text-[10px] text-gray-500 block font-mono">
                          - Apenas itens selecionados serão processados e integrados.<br />
                          - Novos custos unitários atualizarão as margens brutas do financeiro.
                        </span>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setXmlFileSelected(false);
                            setParsedXml(null);
                          }}
                          className="py-2.5 px-4 bg-gray-805 bg-gray-800 hover:bg-gray-750 text-gray-400 hover:text-white rounded-xl font-mono text-xs uppercase cursor-pointer"
                        >
                          Limpar e Voltar
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await handleConfirmXmlImport();
                          }}
                          className="py-2.5 px-5 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl font-bold font-mono text-white text-xs tracking-wider uppercase transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                        >
                          📥 INTEGRAR ENTRADA FISCAL
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              )}

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
              className="bg-[#0b101d] border border-red-950/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative flex flex-col gap-4 overflow-hidden"
            >
              {/* Sleek Warning Glow Background Gradient */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
              
              <div className="flex gap-4 items-start border-b border-gray-850 pb-4">
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

              {/* DEPENDENT OPEN SERVICE ORDERS LIST */}
              {(() => {
                const dependentOS = (ordensServico || []).filter(os => 
                  os.status !== 'Finalizada' && 
                  os.status !== 'Entregue' && 
                  os.parts?.some(part => part.id === productToDelete.id)
                );

                if (dependentOS.length === 0) return null;

                return (
                  <div className="flex flex-col gap-2 border border-red-950/45 rounded-2xl p-3 bg-red-950/5">
                    <div className="flex items-start gap-2 text-xs text-red-400">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5 text-left">
                        <strong className="font-bold">⚠️ ATENÇÃO: Ordens de Serviço Dependentes Ativas ({dependentOS.length})</strong>
                        <p className="text-[11px] text-gray-400 leading-normal">
                          Esta peça está alocada nas seguintes Ordens de Serviço abertas ou em andamento. Removê-la causará perda de rastreabilidade:
                        </p>
                      </div>
                    </div>

                    <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5 border border-gray-900 rounded-xl p-2 bg-[#050912]/80">
                      {dependentOS.map(os => {
                        const partDetail = os.parts.find(part => part.id === productToDelete.id);
                        return (
                          <div key={os.id} className="p-2.5 bg-[#080d1a] border border-gray-850 rounded-lg flex flex-col gap-1 text-[11px] font-sans">
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-bold text-white text-xs">O.S. #{os.id}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-orange-950/40 text-orange-400 border border-orange-900/30">
                                {os.status}
                              </span>
                            </div>
                            <div className="text-gray-400 leading-tight">
                              👤 Cliente: <strong className="text-gray-300">{os.clienteName || "Sem Nome"}</strong>
                            </div>
                            <div className="text-gray-450 text-gray-500 leading-none">
                              🚗 Veículo: {os.veiculoInfo || "N/A"} (Placa: {os.plate || "N/A"})
                            </div>
                            {partDetail && (
                              <div className="text-orange-400 font-mono text-[10px] mt-0.5 flex justify-between border-t border-gray-850/30 pt-1">
                                <span>Quantidade alocada nesta O.S.:</span>
                                <span className="font-bold">{partDetail.quantity} un</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

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

      {/* 🤖 ASSISTENTE INTELIGENTE DE COMPRA IDEAL (EOQ & DILUIÇÃO DE FRETE) MODAL */}
      <AnimatePresence>
        {showPurchasingAssistantModal && (() => {
          const plan = calculatePurchasingPlan();
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md text-left font-sans"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="bg-[#0b1224] border border-purple-500/30 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden text-gray-200"
              >
                {/* Header Top Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-400" />

                {/* Modal Header */}
                <div className="p-5 sm:p-6 border-b border-gray-800 flex items-start justify-between gap-4 bg-[#090e1f]">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-950/60 text-purple-300 border border-purple-500/40 rounded-2xl shadow-inner flex items-center justify-center shrink-0">
                      <Bot className="w-7 h-7 text-amber-300 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-display font-black text-white tracking-wide">
                          Assistente de Compra Ideal & Lote Econômico
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-300" /> EOQ + DILUIÇÃO DE FRETE
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                        Cálculo preditivo de pedido com base no histórico de saídas de 12 meses, estoque de segurança e otimização do custo de frete por lote.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPurchasingAssistantModal(false)}
                    className="text-gray-400 hover:text-white p-2 hover:bg-gray-800/80 rounded-xl transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Toast Notification inside modal if copied */}
                {purchasingCopyToast && (
                  <div className="bg-emerald-950/90 text-emerald-300 border-b border-emerald-500/40 px-6 py-2.5 font-mono text-xs font-bold flex items-center gap-2 animate-fadeIn">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {purchasingCopyToast}
                  </div>
                )}

                {/* Interactive Settings Bar */}
                <div className="p-4 sm:p-5 bg-[#0e162d] border-b border-gray-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                  {/* Freight Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10.5px] text-purple-300 font-bold uppercase flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-purple-400" />
                      Frete Médio Registrado (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 font-bold">R$</span>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={purchasingAverageFreight}
                        onChange={(e) => setPurchasingAverageFreight(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full bg-[#080d1a] border border-purple-500/30 rounded-xl py-2 pl-9 pr-3 text-white font-black text-sm focus:outline-none focus:border-purple-400 shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Target Coverage Days */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10.5px] text-cyan-300 font-bold uppercase flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      Meta Cobertura (Dias)
                    </label>
                    <select
                      value={purchasingTargetDays}
                      onChange={(e) => setPurchasingTargetDays(parseInt(e.target.value) || 30)}
                      className="w-full bg-[#080d1a] border border-cyan-500/30 rounded-xl py-2 px-3 text-white font-bold text-xs focus:outline-none focus:border-cyan-400 shadow-inner"
                    >
                      <option value={15}>15 dias (Giro Rápido)</option>
                      <option value={30}>30 dias (Padrão Recomendado)</option>
                      <option value={45}>45 dias (Estoque Médio)</option>
                      <option value={60}>60 dias (Reposição Preventiva)</option>
                      <option value={90}>90 dias (Lote Estendido)</option>
                    </select>
                  </div>

                  {/* Scope Filter */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10.5px] text-amber-300 font-bold uppercase flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      Filtro de Escopo
                    </label>
                    <select
                      value={purchasingScopeFilter}
                      onChange={(e) => setPurchasingScopeFilter(e.target.value as any)}
                      className="w-full bg-[#080d1a] border border-amber-500/30 rounded-xl py-2 px-3 text-white font-bold text-xs focus:outline-none focus:border-amber-400 shadow-inner"
                    >
                      <option value="below_min">Apenas Abaixo do Mínimo</option>
                      <option value="critical">Apenas Zerados / Críticos</option>
                      <option value="all_reorder">Todos para Análise EOQ</option>
                    </select>
                  </div>

                  {/* Supplier Filter */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10.5px] text-emerald-300 font-bold uppercase flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                      Fornecedor Parceiro
                    </label>
                    <select
                      value={purchasingSupplierFilter}
                      onChange={(e) => setPurchasingSupplierFilter(e.target.value)}
                      className="w-full bg-[#080d1a] border border-emerald-500/30 rounded-xl py-2 px-3 text-white font-bold text-xs focus:outline-none focus:border-emerald-400 shadow-inner"
                    >
                      <option value="all">Todos os Fornecedores</option>
                      {(fornecedores || []).map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Summary KPIs Banner */}
                <div className="px-5 py-3 bg-[#070b17] border-b border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 bg-[#0c142b] rounded-xl border border-gray-800 flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Itens p/ Reposição</span>
                    <span className="text-xl font-extrabold text-white">{plan.items.length} produtos</span>
                    <span className="text-[9.5px] text-gray-500">Lote mínimo calculado</span>
                  </div>

                  <div className="p-3 bg-[#0c142b] rounded-xl border border-gray-800 flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Subtotal Estimado Peças</span>
                    <span className="text-xl font-extrabold text-emerald-400">R$ {plan.totalPartsCostSum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-[9.5px] text-gray-500">Custo base dos fornecedores</span>
                  </div>

                  <div className="p-3 bg-[#0c142b] rounded-xl border border-purple-900/40 flex flex-col gap-0.5">
                    <span className="text-[10px] text-purple-300 uppercase font-bold">Frete Médio Diluído</span>
                    <span className="text-xl font-extrabold text-purple-300">R$ {plan.totalFreightCostSum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-[9.5px] text-purple-300/80">Rateado por lote ideal</span>
                  </div>

                  <div className="p-3 bg-gradient-to-br from-[#121c38] to-[#0d162d] rounded-xl border border-amber-500/30 flex flex-col gap-0.5 shadow-md">
                    <span className="text-[10px] text-amber-300 uppercase font-extrabold">Investimento Total Est.</span>
                    <span className="text-xl font-black text-amber-300">R$ {plan.totalInvestmentSum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-[9.5px] text-amber-300/80">Peças + Frete Otimizado</span>
                  </div>
                </div>

                {/* Main Modal Content: Items List */}
                <div className="p-5 overflow-y-auto max-h-[50vh] flex flex-col gap-3 font-sans">
                  {plan.items.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 font-mono text-xs flex flex-col items-center justify-center gap-2">
                      <CheckCircle className="w-10 h-10 text-emerald-400 opacity-60" />
                      <p className="font-bold text-sm text-gray-200">Nenhum produto necessita de compra para este escopo!</p>
                      <p className="text-gray-400 text-xs">Todos os itens filtrados possuem estoque suficiente para cobrir os {purchasingTargetDays} dias configurados.</p>
                    </div>
                  ) : (
                    plan.items.map((item, idx) => (
                      <div
                        key={item.product.id || idx}
                        className="bg-[#090e1d] border border-gray-800 hover:border-purple-500/40 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-md"
                      >
                        {/* Item Details */}
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2.5 bg-purple-950/40 border border-purple-500/30 rounded-xl text-purple-300 font-mono text-xs font-bold shrink-0 mt-0.5">
                            #{idx + 1}
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-white font-bold text-sm">{item.product.name}</h4>
                              <span className="text-[10px] font-mono bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700">
                                SKU: {item.product.internalSku}
                              </span>
                              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                                {item.product.brand || 'Sem Marca'}
                              </span>
                            </div>

                            <div className="text-xs text-gray-400 flex items-center gap-3 font-mono flex-wrap mt-0.5">
                              <span>Fornecedor: <strong className="text-gray-200">{item.supplierName}</strong></span>
                              <span>• Est. Atual: <strong className={item.currentQuantity <= item.minStock ? 'text-red-400 font-extrabold' : 'text-emerald-400'}>{item.currentQuantity} un</strong> (Mín: {item.minStock} un)</span>
                              <span>• Demanda Média: <strong className="text-cyan-400">{item.monthlyDemand} un/mês</strong> ({item.dailyDemand}/dia)</span>
                            </div>
                          </div>
                        </div>

                        {/* Ideal Purchase Badge & Financials */}
                        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-gray-800 pt-3 md:pt-0 md:pl-4 font-mono text-xs w-full md:w-auto justify-between md:justify-end">
                          <div className="flex flex-col items-start md:items-end gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-gray-400 uppercase">Qtd. Ideal Compra:</span>
                              <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-black text-sm shadow-md border border-purple-400/40">
                                {item.idealPurchaseQty} un
                              </span>
                            </div>
                            <span className="text-[9.5px] text-purple-300/90 font-mono">
                              EOQ Lote Econômico: {item.eoqBatch} un | Cobertura {purchasingTargetDays}d: {item.deficitQty} un
                            </span>
                          </div>

                          <div className="flex flex-col items-end gap-0.5 min-w-[130px]">
                            <span className="text-[10px] text-gray-400">Subtotal Peças:</span>
                            <span className="text-sm font-extrabold text-emerald-400">
                              R$ {item.totalPartsCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[9.5px] text-purple-300 font-semibold" title={`Frete de R$ ${purchasingAverageFreight.toFixed(2)} diluído entre ${item.idealPurchaseQty} unidades`}>
                              Frete Diluído: +R$ {item.freightPerUnit.toFixed(2)}/un
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="p-4 sm:p-5 border-t border-gray-800 bg-[#090e1f] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>O lote ideal evita faltas zeradas e economiza frete acumulado em pequenas compras repetitivas.</span>
                  </div>

                  <div className="flex gap-2.5 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setShowPurchasingAssistantModal(false)}
                      className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl font-bold uppercase cursor-pointer transition-colors"
                    >
                      Fechar
                    </button>

                    <button
                      type="button"
                      disabled={plan.items.length === 0}
                      onClick={() => handleCopyPurchasingQuotation(plan)}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-lg shadow-purple-950/50 uppercase flex items-center gap-2 cursor-pointer transition-all border border-purple-400/30"
                    >
                      <Copy className="w-4 h-4 text-amber-300" />
                      Copiar Cotação com Lote Ideal
                    </button>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* 📥 MODAL DE 'CADASTRO RÁPIDO EM LOTE' VIA CSV */}
      <AnimatePresence>
        {showCsvBatchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md text-left font-sans"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[#0b1328] border border-emerald-500/30 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden text-gray-200"
            >
              {/* Header Top Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />

              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-gray-800 flex items-start justify-between gap-4 bg-[#080e1c]">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-2xl shadow-inner flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-7 h-7 text-emerald-300 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-display font-black text-white tracking-wide">
                        Cadastro Rápido em Lote (Importador CSV)
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-500/40 uppercase">
                        ⚡ Lâmpadas, Colas, Silicones & Peças
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Suba planilhas ou teste com o lote pré-configurado da oficina. O sistema valida os campos, formata os preços e cadastra todos os itens automaticamente no estoque.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCsvBatchModal(false)}
                  className="text-gray-400 hover:text-white p-2 hover:bg-gray-800/80 rounded-xl transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Top Action Bar: Upload area & sample button */}
              <div className="p-4 sm:p-5 bg-[#0c162f] border-b border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Drag / File selector */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <label className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center gap-2 border border-emerald-400/40 shrink-0">
                    <Upload className="w-4 h-4" />
                    {csvBatchFileName ? `📄 ${csvBatchFileName}` : "Selecionar Planilha CSV..."}
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleCsvBatchFileUpload}
                      className="sr-only"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleDownloadCsvTemplate}
                    className="py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
                    title="Baixar arquivo de modelo preenchido com lâmpadas, colas e filtros"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    Baixar Modelo .CSV
                  </button>
                </div>

                {/* 1-Click Test Sample Batch */}
                <button
                  type="button"
                  onClick={handleLoadSampleCsvBatch}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 hover:from-emerald-900 hover:to-teal-900 border border-emerald-500/50 text-emerald-200 text-xs font-mono font-bold transition-all cursor-pointer shadow-md flex items-center gap-2 w-full md:w-auto justify-center"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" />
                  ⚡ Carregar Lote Exemplo (8 Peças Diversas)
                </button>
              </div>

              {/* Feedback Banner */}
              {csvBatchFeedback && (
                <div className={`px-6 py-3 font-mono text-xs flex items-center gap-2 border-b ${
                  csvBatchSuccess
                    ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
                    : csvBatchFeedback.startsWith('❌')
                    ? 'bg-red-950/80 text-red-300 border-red-500/30'
                    : 'bg-slate-900/90 text-cyan-300 border-cyan-500/30'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{csvBatchFeedback}</span>
                </div>
              )}

              {/* Items Table Preview */}
              <div className="p-5 overflow-y-auto max-h-[50vh] flex flex-col gap-3 custom-scrollbar">
                {csvBatchParsedItems.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 font-mono text-xs flex flex-col items-center justify-center gap-3">
                    <FileSpreadsheet className="w-12 h-12 text-emerald-400/40" />
                    <p className="font-bold text-sm text-gray-200">Nenhum lote de arquivo carregado ainda</p>
                    <p className="text-gray-400 text-xs max-w-md">
                      Clique em <strong>"Carregar Lote Exemplo"</strong> para simular 8 peças comuns da oficina (lâmpadas, colas, silicones, filtros) ou selecione um arquivo .CSV do seu computador.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#070d18]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-800 bg-[#091224] text-gray-400 text-[10px] font-mono uppercase tracking-wider">
                          <th className="py-3 px-3 text-center w-10">
                            <input
                              type="checkbox"
                              checked={csvBatchParsedItems.every(i => i.selected)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setCsvBatchParsedItems(prev => prev.map(i => ({ ...i, selected: checked })));
                              }}
                              className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-gray-800 focus:ring-0 cursor-pointer"
                            />
                          </th>
                          <th className="py-3 px-3">Peça / Descrição</th>
                          <th className="py-3 px-3">Marca</th>
                          <th className="py-3 px-3">SKU / Cód. Barras</th>
                          <th className="py-3 px-3">Categoria</th>
                          <th className="py-3 px-3 text-right">Custo</th>
                          <th className="py-3 px-3 text-right">Venda</th>
                          <th className="py-3 px-3 text-center">Qtd / Mín</th>
                          <th className="py-3 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvBatchParsedItems.map((item) => (
                          <tr key={item.id} className="border-b border-gray-800/60 hover:bg-slate-900/40 transition-colors">
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setCsvBatchParsedItems(prev => prev.map(i => i.id === item.id ? { ...i, selected: checked } : i));
                                }}
                                className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-gray-800 focus:ring-0 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-3 font-bold text-white max-w-xs truncate">
                              {item.name}
                              <span className="text-[9.5px] block text-gray-400 font-mono font-normal truncate">{item.compatibility}</span>
                            </td>
                            <td className="py-3 px-3 font-mono text-cyan-300 font-bold">
                              {item.brand}
                            </td>
                            <td className="py-3 px-3 font-mono text-gray-300">
                              <span className="block font-bold">{item.sku}</span>
                              <span className="text-[9px] text-gray-500">{item.barcode || 'Sem EAN'}</span>
                            </td>
                            <td className="py-3 px-3 font-mono text-gray-300">
                              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">
                                {item.category}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-red-400 font-bold">
                              R$ {item.costPrice.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">
                              R$ {item.sellPrice.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-bold text-white">
                              {item.quantity} un <span className="text-gray-500 text-[9px] font-normal">(mín {item.minStock})</span>
                            </td>
                            <td className="py-3 px-3 font-mono text-[10px]">
                              <span className={`px-2 py-0.5 rounded-full border font-bold ${
                                item.status === 'ok'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                  : item.status === 'sku_exists'
                                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                                  : 'bg-red-950 text-red-300 border-red-800'
                              }`}>
                                {item.statusMessage}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-gray-800 bg-[#080e1c] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
                <div className="text-gray-400 text-[11px] flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {csvBatchParsedItems.filter(i => i.selected).length} de {csvBatchParsedItems.length} produtos selecionados para gravação.
                  </span>
                </div>

                <div className="flex gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCsvBatchModal(false)}
                    className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl font-bold uppercase cursor-pointer transition-colors"
                  >
                    Fechar
                  </button>

                  <button
                    type="button"
                    disabled={csvBatchParsedItems.filter(i => i.selected).length === 0}
                    onClick={handleConfirmCsvBatchImport}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-950/50 uppercase flex items-center gap-2 cursor-pointer transition-all border border-emerald-400/30"
                  >
                    <Upload className="w-4 h-4 text-emerald-200" />
                    Confirmar Importação em Lote
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📸 MODAL DE 'CÂMERA & RECONHECIMENTO DE PEÇA COM IA' */}
      <AnimatePresence>
        {showAiPhotoScanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md text-left font-sans"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-[#0b1226] border border-purple-500/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden text-gray-200"
            >
              {/* Header Gradient Top Bar */}
              <div className="h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-400" />

              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-gray-800 bg-[#090e1f] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-950/60 border border-purple-500/40 text-purple-300 rounded-2xl shadow-inner">
                    <Camera className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-display font-extrabold text-white">
                        Cadastro Inteligente de Estoque por Foto & Câmera
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" /> Gemini Vision IA
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-sans mt-0.5">
                      Aponta a câmera para a caixa da peça, código de barras ou rótulo para preencher nome, marca, SKU e preços automaticamente!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    stopLiveCamera();
                    setShowAiPhotoScanModal(false);
                  }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">

                {/* AI Error Alert if any */}
                {aiScanError && (
                  <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-amber-300 text-xs flex items-center gap-2 font-mono">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{aiScanError}</span>
                  </div>
                )}

                {/* Section 1: Capture or Upload Image */}
                {!aiScanResult && !isAnalyzingPhoto && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Column 1: Live Webcam Feed */}
                    <div className="bg-[#070c1a] border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-between gap-4">
                      <div className="w-full flex items-center justify-between border-b border-gray-850 pb-2">
                        <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-2">
                          <Camera className="w-4 h-4 text-purple-400" /> CÂMERA AO VIVO DO DISPOSITIVO
                        </span>
                        {cameraActive && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> ATIVA
                          </span>
                        )}
                      </div>

                      {cameraActive ? (
                        <div className="relative w-full rounded-xl overflow-hidden border border-purple-500/30 bg-black aspect-video flex items-center justify-center">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                          {/* Target viewfinder box */}
                          <div className="absolute inset-8 border-2 border-dashed border-purple-400/60 rounded-xl pointer-events-none flex items-center justify-center">
                            <span className="bg-black/60 text-purple-200 px-3 py-1 rounded-full text-[10px] font-mono font-bold">
                              Posicione a embalagem ou rótulo no centro
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full aspect-video rounded-xl bg-black/40 border border-dashed border-gray-800 flex flex-col items-center justify-center gap-2 p-6 text-center">
                          <Camera className="w-10 h-10 text-gray-600" />
                          <p className="text-xs text-gray-400 font-sans">
                            Ative a câmera para escanear autopeças diretamente pela bancada ou pelo celular.
                          </p>
                          <button
                            type="button"
                            onClick={startLiveCamera}
                            className="mt-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all"
                          >
                            <Camera className="w-4 h-4" /> Abrir Câmera
                          </button>
                        </div>
                      )}

                      {cameraActive && (
                        <div className="flex gap-2 w-full">
                          <button
                            type="button"
                            onClick={capturePhotoFromCamera}
                            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-extrabold text-xs rounded-xl shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all border border-purple-400/30 uppercase"
                          >
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            Fotografar e Analisar Peça
                          </button>
                          <button
                            type="button"
                            onClick={stopLiveCamera}
                            className="px-3 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-mono font-bold cursor-pointer"
                          >
                            Parar
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Column 2: File Upload / Gallery Photo */}
                    <div className="bg-[#070c1a] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between gap-4">
                      <div className="w-full border-b border-gray-850 pb-2">
                        <span className="text-xs font-mono font-bold text-indigo-300 flex items-center gap-2">
                          <Upload className="w-4 h-4 text-indigo-400" /> ENVIAR FOTO / RÓTULO / CAIXA
                        </span>
                      </div>

                      <label className="flex-1 border-2 border-dashed border-indigo-500/30 hover:border-indigo-400/60 bg-indigo-950/10 hover:bg-indigo-950/20 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[160px]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoFileUpload}
                          className="hidden"
                        />
                        <Upload className="w-8 h-8 text-indigo-400 mb-2 animate-bounce" />
                        <span className="text-xs font-bold text-white font-sans">
                          Clique ou Arraste uma Foto da Peça
                        </span>
                        <span className="text-[11px] text-gray-400 font-sans mt-1">
                          PNG, JPG, WEBP ou foto tirada no celular
                        </span>
                      </label>

                      {/* Quick 1-Click Samples for Testing on Desktop */}
                      <div className="border-t border-gray-850 pt-3">
                        <span className="text-[10px] text-gray-400 font-mono font-bold uppercase block mb-2">
                          ⚡ Testar Reconhecimento Rápido (Exemplos de Peças):
                        </span>
                        <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                          {[
                            { name: "Lâmpada H7 Philips", tag: "LMP-H7-LED", bar: "7891002003001" },
                            { name: "Trava Rosca Loctite 242", tag: "COL-LOC-242", bar: "7896001003001" },
                            { name: "Silicone RTV Tekbond", tag: "SIL-RTV-50G", bar: "7898001002001" },
                            { name: "Filtro Óleo Fram", tag: "FLT-OIL-FRM", bar: "7892201103002" },
                          ].map((sample, sIdx) => (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => {
                                const dbMatch = BARCODE_PARTS_DATABASE.find(b => b.barcode === sample.bar);
                                if (dbMatch) {
                                  setAiScanResult({
                                    name: dbMatch.name,
                                    brand: dbMatch.brand,
                                    sku: dbMatch.sku,
                                    barcode: dbMatch.barcode,
                                    category: dbMatch.category,
                                    compatibility: dbMatch.compatibility,
                                    costPrice: dbMatch.costPrice,
                                    sellPrice: dbMatch.sellPrice,
                                    quantity: dbMatch.quantity,
                                    minStock: dbMatch.minStock,
                                    confidence: "98% (Identificado por rótulo)",
                                    notes: "Identificação confirmada via catálogo da montadora e embalagem oficial."
                                  });
                                }
                              }}
                              className="p-2 bg-gray-900/80 hover:bg-purple-950/50 border border-gray-800 hover:border-purple-500/40 rounded-lg text-left text-gray-300 hover:text-white transition-all cursor-pointer truncate"
                            >
                              <strong className="block truncate text-purple-300">{sample.name}</strong>
                              <span className="text-[9px] text-gray-500">Ref: {sample.tag}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Section 2: Loading State when Gemini AI is Analyzing Photo */}
                {isAnalyzingPhoto && (
                  <div className="p-12 bg-[#070c1a] border border-purple-500/30 rounded-2xl flex flex-col items-center justify-center gap-4 text-center">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                      <Sparkles className="w-6 h-6 text-amber-300 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-white font-extrabold text-base font-display">
                        Inteligência Artificial Analisando a Peça...
                      </h4>
                      <p className="text-xs text-gray-400 font-sans mt-1">
                        Lendo texto da caixa, código de barras EAN, marca do fabricante e especificações técnicas.
                      </p>
                    </div>
                  </div>
                )}

                {/* Section 3: AI Recognition Results Preview */}
                {aiScanResult && !isAnalyzingPhoto && (
                  <div className="space-y-4">
                    {/* Confidence & Confirmation Banner */}
                    <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-white font-display">
                              Peça Reconhecida com Sucesso!
                            </h4>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                              Confiança: {aiScanResult.confidence || '95%'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300 font-sans mt-0.5">
                            {aiScanResult.notes || "Dados extraídos e estruturados prontos para inserção no estoque de autopeças."}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAiScanResult(null);
                          setPhotoPreviewUrl(null);
                        }}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-mono font-bold cursor-pointer shrink-0"
                      >
                        🔄 Fotografar Outra
                      </button>
                    </div>

                    {/* Extracted Fields Detail Box */}
                    <div className="bg-[#070c1a] border border-gray-800 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
                      
                      <div className="sm:col-span-2">
                        <span className="text-[10px] text-gray-400 uppercase block">Nome / Descrição da Peça:</span>
                        <input
                          type="text"
                          value={aiScanResult.name}
                          onChange={(e) => setAiScanResult({ ...aiScanResult, name: e.target.value })}
                          className="w-full mt-1 bg-[#0a1020] border border-purple-500/30 rounded-xl p-2.5 text-white font-bold"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 uppercase block">Marca / Fabricante:</span>
                        <input
                          type="text"
                          value={aiScanResult.brand}
                          onChange={(e) => setAiScanResult({ ...aiScanResult, brand: e.target.value })}
                          className="w-full mt-1 bg-[#0a1020] border border-gray-700 rounded-xl p-2.5 text-white font-bold"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 uppercase block">SKU / Código Interno:</span>
                        <input
                          type="text"
                          value={aiScanResult.sku}
                          onChange={(e) => setAiScanResult({ ...aiScanResult, sku: e.target.value })}
                          className="w-full mt-1 bg-[#0a1020] border border-gray-700 rounded-xl p-2.5 text-white font-bold"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 uppercase block">Código de Barras EAN:</span>
                        <input
                          type="text"
                          value={aiScanResult.barcode}
                          onChange={(e) => setAiScanResult({ ...aiScanResult, barcode: e.target.value })}
                          className="w-full mt-1 bg-[#0a1020] border border-gray-700 rounded-xl p-2.5 text-purple-300 font-bold"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 uppercase block">Categoria:</span>
                        <select
                          value={aiScanResult.category}
                          onChange={(e) => setAiScanResult({ ...aiScanResult, category: e.target.value })}
                          className="w-full mt-1 bg-[#0a1020] border border-gray-700 rounded-xl p-2.5 text-white font-bold"
                        >
                          {categoriesList.filter(c => c !== 'Todas').map((c, i) => (
                            <option key={i} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <span className="text-[10px] text-gray-400 uppercase block">Compatibilidade / Aplicação em Veículos:</span>
                        <input
                          type="text"
                          value={aiScanResult.compatibility}
                          onChange={(e) => setAiScanResult({ ...aiScanResult, compatibility: e.target.value })}
                          className="w-full mt-1 bg-[#0a1020] border border-gray-700 rounded-xl p-2.5 text-gray-200"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-red-400 uppercase block">Preço de Custo (R$):</span>
                        <input
                          type="number"
                          step="0.01"
                          value={aiScanResult.costPrice}
                          onChange={(e) => setAiScanResult({ ...aiScanResult, costPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full mt-1 bg-[#0a1020] border border-gray-700 rounded-xl p-2.5 text-red-400 font-bold"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-emerald-400 uppercase block">Preço de Venda (R$):</span>
                        <input
                          type="number"
                          step="0.01"
                          value={aiScanResult.sellPrice}
                          onChange={(e) => setAiScanResult({ ...aiScanResult, sellPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full mt-1 bg-[#0a1020] border border-gray-700 rounded-xl p-2.5 text-emerald-400 font-bold"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-gray-400 uppercase block">Estoque Inicial (Qtd):</span>
                        <input
                          type="number"
                          value={aiScanResult.quantity}
                          onChange={(e) => setAiScanResult({ ...aiScanResult, quantity: parseInt(e.target.value) || 1 })}
                          className="w-full mt-1 bg-[#0a1020] border border-gray-700 rounded-xl p-2.5 text-white font-bold"
                        />
                      </div>

                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-gray-800 bg-[#090e1f] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
                <div className="text-gray-400 text-[11px] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Os dados preenchidos poderão ser revisados antes da gravação final no banco de dados.</span>
                </div>

                <div className="flex gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      stopLiveCamera();
                      setShowAiPhotoScanModal(false);
                    }}
                    className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl font-bold uppercase cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>

                  {aiScanResult && (
                    <button
                      type="button"
                      onClick={applyAiScanToProductForm}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-purple-950/50 uppercase flex items-center gap-2 cursor-pointer transition-all border border-purple-400/30"
                    >
                      <Check className="w-4 h-4 text-amber-300" />
                      Preencher Formulário de Estoque
                    </button>
                  )}
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
