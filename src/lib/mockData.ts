import { Cliente, Veiculo, Produto, Servico, OrdemServico, Financeiro, Fornecedor } from '../types';

export const MOCK_SERVICES: Servico[] = [
  { id: "srv_cat_1", name: "Revisão Geral Preventiva", description: "Inspeção de 40 itens incluindo sistema de arrefecimento, suspensão, freios e scanner elétrico.", price: 250.00, duration: "2h", category: "Mecânica", empresaId: "comp_demo_1" },
  { id: "srv_cat_2", name: "Alinhamento 3D + Balanceamento", description: "Alinhamento a laser computadorizado e balanceamento dinâmico de quatro rodas com chumbo.", price: 120.00, duration: "1h", category: "Alinhamento", empresaId: "comp_demo_1" },
  { id: "srv_cat_3", name: "Mão de Obra Troca de Pastilhas de Freio", description: "Serviço profissional de desmontagem, limpeza dos reparos e sangria para novas pastilhas.", price: 80.00, duration: "45min", category: "Freios", empresaId: "comp_demo_1" },
  { id: "srv_cat_4", name: "Mão de Obra de Troca de Óleo e Filtro", description: "Substituição sob as especificações do manual do fabricante, eliminação ecológica resíduos.", price: 50.00, duration: "30min", category: "Lubrificantes", empresaId: "comp_demo_1" },
  { id: "srv_cat_5", name: "Diagnóstico Computadorizado OBD-II Scanner", description: "Varredura de centrais de injeção direta, airbags, abs e redefinição de intervalos revisão.", price: 150.00, duration: "1h", category: "Elétrica", empresaId: "comp_demo_1" }
];

export const INITIAL_COMPANY = {
  id: "comp_demo_1",
  name: "AutoPrecision Premium",
  cnpj: "12.345.678/0001-90",
  phone: "(11) 98765-4321",
  address: "Av. das Nações Unidas, 1040 - São Paulo, SP",
  planId: "Premium" as const,
  createdAt: "2026-01-10T12:00:00Z",
  logoUrl: "https://picsum.photos/seed/autotech_logo/200/200",
  email: "contato@autoprecision.com.br",
  whatsapp: "(11) 98765-4321",
  latitude: -23.6015,
  longitude: -46.6974,
  customDomain: "mecanica.autoprecision.com.br",
  subdomain: "autoprecision",
  domainStatus: "Ativo" as const
};

export const MOCK_CLIENTS: Cliente[] = [
  {
    id: "cli_1",
    name: "Alexandre Pires",
    phone: "(11) 99122-3344",
    email: "alexandre.pires@gmail.com",
    cpfCnpj: "321.456.987-11",
    empresaId: "comp_demo_1",
    oilChangeAlert: true,
    reviewAlert: true,
    createdAt: "2026-02-15T14:30:00Z"
  },
  {
    id: "cli_2",
    name: "Mariana Souza Santos",
    phone: "(11) 98833-2211",
    email: "mariana.souza@outlook.com",
    cpfCnpj: "452.129.832-45",
    empresaId: "comp_demo_1",
    oilChangeAlert: false,
    reviewAlert: true,
    createdAt: "2026-03-01T09:15:00Z"
  },
  {
    id: "cli_3",
    name: "Roberto Carlos Almeida",
    phone: "(11) 97755-9988",
    email: "roberto.carlos@uol.com.br",
    cpfCnpj: "119.223.334-88",
    empresaId: "comp_demo_1",
    oilChangeAlert: true,
    reviewAlert: false,
    createdAt: "2026-03-10T11:45:00Z"
  },
  {
    id: "cli_4",
    name: "Transportadora Rápido SP",
    phone: "(11) 3344-5566",
    email: "contato@rapidosp.com.br",
    cpfCnpj: "10.231.455/0001-44",
    empresaId: "comp_demo_1",
    oilChangeAlert: true,
    reviewAlert: true,
    createdAt: "2026-04-05T16:20:00Z"
  }
];

export const MOCK_VEHICLES: Veiculo[] = [
  {
    id: "vei_1",
    clienteId: "cli_1",
    brand: "Volkswagen",
    model: "Golf 1.4 TSI Variant",
    year: "2018",
    engine: "1.4 TSI Flex",
    plate: "GOLF-2018",
    chassi: "9BWAB4532JE154320",
    km: 68500,
    empresaId: "comp_demo_1"
  },
  {
    id: "vei_2",
    clienteId: "cli_2",
    brand: "Honda",
    model: "Civic Touring 1.5",
    year: "2021",
    engine: "1.5 Turbo Petrol",
    plate: "HON-9876",
    chassi: "9BWAB4532JE998877",
    km: 34200,
    empresaId: "comp_demo_1"
  },
  {
    id: "vei_3",
    clienteId: "cli_3",
    brand: "Chevrolet",
    model: "Onix 1.0 Turbo LTZ",
    year: "2020",
    engine: "1.0 Active Turbo",
    plate: "ONX-4321",
    chassi: "9BWAB4532JE223344",
    km: 45100,
    empresaId: "comp_demo_1"
  },
  {
    id: "vei_4",
    clienteId: "cli_4",
    brand: "Ford",
    model: "Ranger Limited 3.2",
    year: "2019",
    engine: "3.2 Turbodiesel 4x4",
    plate: "RNG-0302",
    chassi: "9BWAB4532JE555666",
    km: 120400,
    empresaId: "comp_demo_1"
  }
];

export const MOCK_PRODUCTS: Produto[] = [
  {
    id: "prod_1",
    name: "Pastilha de Freio Dianteira Bosch",
    brand: "Bosch",
    internalSku: "PST-BSH-01",
    barcode: "7891002003001",
    category: "Freios",
    compatibility: "Golf 1.4, Polo TSI, T-Cross",
    manufacturer: "Bosch Ltda",
    costPrice: 95.00,
    sellPrice: 189.90,
    quantity: 14,
    minStock: 5,
    photo: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=200",
    empresaId: "comp_demo_1"
  },
  {
    id: "prod_2",
    name: "Filtro de Óleo Fram Premium",
    brand: "Fram",
    internalSku: "FLT-FRM-02",
    barcode: "7891002003002",
    category: "Filtros",
    compatibility: "Civic, Fit, HR-V, Onix",
    manufacturer: "Sogefi Group",
    costPrice: 18.50,
    sellPrice: 42.00,
    quantity: 42,
    minStock: 10,
    empresaId: "comp_demo_1"
  },
  {
    id: "prod_3",
    name: "Óleo Lubrificante 5W30 Castrol Edge",
    brand: "Castrol",
    internalSku: "LUB-CST-5W30",
    barcode: "7891002003003",
    category: "Lubrificantes",
    compatibility: "Todos Motores Flex Modernos",
    manufacturer: "Castrol International",
    costPrice: 28.00,
    sellPrice: 65.00,
    quantity: 3, // ALERTA DE ESTOQUE BAIXO!
    minStock: 8,
    empresaId: "comp_demo_1"
  },
  {
    id: "prod_4",
    name: "Amortecedor Dianteiro Cofap",
    brand: "Cofap",
    internalSku: "AMT-CFP-04",
    barcode: "7891002003004",
    category: "Suspensão",
    compatibility: "Civic 2017-2021, Corolla 2015+",
    manufacturer: "Magneti Marelli Cofap",
    costPrice: 210.00,
    sellPrice: 450.00,
    quantity: 8,
    minStock: 4,
    empresaId: "comp_demo_1"
  },
  {
    id: "prod_5",
    name: "Jogo de Vela Iridium NGK",
    brand: "NGK",
    internalSku: "VEL-NGK-IRD",
    barcode: "7891002003005",
    category: "Ignição",
    compatibility: "Motores Ecotec, TSI, VTEC",
    manufacturer: "NGK Spark Plug",
    costPrice: 145.00,
    sellPrice: 299.90,
    quantity: 5,
    minStock: 6, // ALERTA DE ESTOQUE BAIXO!
    empresaId: "comp_demo_1"
  }
];

export const MOCK_MECHANICS = [
  { id: "staff_1", name: "Clécio Santos (Administrador)", email: "cleciotecnologia@gmail.com", role: "Administrador" },
  { id: "staff_2", name: "Marcio Rezende", role: "Mecânico" },
  { id: "staff_3", name: "Gerson 'Geleia' Souza", role: "Mecânico" },
  { id: "staff_4", name: "Aline Oliveira", role: "Caixa" },
  { id: "staff_5", name: "Felipe Castanhari", role: "Estoquista" }
];

export const DEFAULT_CHECKLIST = [
  { label: "Nível de Óleo do Motor", status: "ok" as const },
  { label: "Nível do Fluido de Freio", status: "ok" as const },
  { label: "Inspeção Visual de Pastilhas/Discos", status: "fail" as const },
  { label: "Luzes de Direção e Faróis", status: "ok" as const },
  { label: "Pressão e Estado de Desgaste dos Pneus", status: "ok" as const },
  { label: "Integridade de Coifas e Amortecedores", status: "na" as const },
  { label: "Carga da Bateria (Voltímetro)", status: "ok" as const }
];

export const MOCK_OS: OrdemServico[] = [
  {
    id: "OS-2026-001",
    empresaId: "comp_demo_1",
    clienteId: "cli_1",
    clienteName: MOCK_CLIENTS[0].name,
    clientePhone: MOCK_CLIENTS[0].phone,
    veiculoId: "vei_1",
    veiculoInfo: `${MOCK_VEHICLES[0].brand} ${MOCK_VEHICLES[0].model} (${MOCK_VEHICLES[0].plate})`,
    plate: MOCK_VEHICLES[0].plate,
    km: 68500,
    problem: "Ruído metálico estridente ao pressionar pedal de freio e pedal esponjoso.",
    diagnosis: "Desgaste excessivo das pastilhas de freio dianteiras que atingiram o sensor físico de metal, danificando de forma concêntrica os discos de freio fremax dianteiros.",
    status: "Em execução" as const,
    mechanicId: MOCK_MECHANICS[1].id,
    mechanicName: MOCK_MECHANICS[1].name,
    services: [
      { id: "srv_1", description: "Substituição de pastilhas de freio dianteiras", price: 120.00 },
      { id: "srv_2", description: "Substituição de discos de freio dianteiros", price: 180.00 },
      { id: "srv_3", description: "Sangria e lavagem do reservatório de fluido de freio", price: 90.00 }
    ],
    parts: [
      { id: "prod_1", name: "Pastilha de Freio Dianteira Bosch", sellPrice: 189.90, quantity: 1 },
      { id: "prod_2", name: "Filtro de Óleo Fram (Cortesia)", sellPrice: 0.00, quantity: 1 }
    ],
    checklist: DEFAULT_CHECKLIST,
    signature: "Assinado eletronicamente por Alexandre Pires - Token: OS_SIGN_01a",
    photoUrls: [
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=200"
    ],
    total: 579.90,
    createdAt: "2026-05-24T10:00:00Z"
  },
  {
    id: "OS-2026-002",
    empresaId: "comp_demo_1",
    clienteId: "cli_2",
    clienteName: MOCK_CLIENTS[1].name,
    clientePhone: MOCK_CLIENTS[1].phone,
    veiculoId: "vei_2",
    veiculoInfo: `${MOCK_VEHICLES[1].brand} ${MOCK_VEHICLES[1].model} (${MOCK_VEHICLES[1].plate})`,
    plate: MOCK_VEHICLES[1].plate,
    km: 34200,
    problem: "Revisão periódica programada de 30.000 KM e troca de fluidos.",
    diagnosis: "Inspeção geral preventiva ok. Necessário troca de velas de ignição devido a oxidação natural pelo teor de combustível e fluidos básicos.",
    status: "Finalizada" as const,
    mechanicId: MOCK_MECHANICS[2].id,
    mechanicName: MOCK_MECHANICS[2].name,
    services: [
      { id: "srv_4", description: "Revisão preventiva sistemática", price: 250.00 },
      { id: "srv_5", description: "Mão de obra troca de velas", price: 80.00 }
    ],
    parts: [
      { id: "prod_5", name: "Jogo de Vela Iridium NGK", sellPrice: 299.90, quantity: 1 },
      { id: "prod_3", name: "Óleo Lubrificante Castrol Edge", sellPrice: 65.00, quantity: 4 }
    ],
    checklist: DEFAULT_CHECKLIST.map(item => ({ ...item, status: 'ok' as const })),
    signature: "Assinado eletronicamente por Mariana Souza Santos - Token: OS_SIGN_02b",
    total: 889.90,
    createdAt: "2026-05-20T08:30:00Z"
  },
  {
    id: "OS-2026-003",
    empresaId: "comp_demo_1",
    clienteId: "cli_3",
    clienteName: MOCK_CLIENTS[2].name,
    clientePhone: MOCK_CLIENTS[2].phone,
    veiculoId: "vei_3",
    veiculoInfo: `${MOCK_VEHICLES[2].brand} ${MOCK_VEHICLES[2].model} (${MOCK_VEHICLES[2].plate})`,
    plate: MOCK_VEHICLES[2].plate,
    km: 45100,
    problem: "Veículo perdendo potência sob aceleração íngreme, luz da injeção acesa constante.",
    diagnosis: "Código OBD-II indicado falha nas bobinas de bobinagem secundária. Peça sob orçamento.",
    status: "Aguardando peça" as const,
    mechanicId: MOCK_MECHANICS[1].id,
    mechanicName: MOCK_MECHANICS[1].name,
    services: [
      { id: "srv_6", description: "Varredura computadorizada de injeção", price: 150.00 }
    ],
    parts: [],
    checklist: DEFAULT_CHECKLIST,
    total: 150.00,
    createdAt: "2026-05-25T11:00:00Z"
  }
];

export const MOCK_FINANCE: Financeiro[] = [
  // Receitas (Ganhos de OS e PDV)
  { id: "fin_1", empresaId: "comp_demo_1", description: "Ordem de Serviço OS-2026-002", type: "Receita", amount: 889.90, dueDate: "2026-05-20", status: "Pago", category: "Serviços", createdAt: "2026-05-20T17:00:00Z", invoiceNumber: "NFS-4321", purchaseOrder: "PED-8871" },
  { id: "fin_2", empresaId: "comp_demo_1", description: "Venda PDV Balcão #1032", type: "Receita", amount: 379.80, dueDate: "2026-05-25", status: "Pago", category: "Vendas Peças", createdAt: "2026-05-25T14:10:00Z", invoiceNumber: "NFC-8910", purchaseOrder: "PED-1032" },
  { id: "fin_3", empresaId: "comp_demo_1", description: "Venda Dianteira Pastilhas Bosch", type: "Receita", amount: 189.90, dueDate: "2026-05-24", status: "Pago", category: "Vendas Peças", createdAt: "2026-05-24T11:30:00Z", invoiceNumber: "NFC-8911", purchaseOrder: "PED-1033" },
  // Despesas (Aluguel, Peças)
  { 
    id: "fin_4", 
    empresaId: "comp_demo_1", 
    description: "Fornecimento de Óleo Castrol Castrol Edge", 
    type: "Despesa", 
    amount: 560.00, 
    dueDate: "2026-06-05", 
    status: "Pendente", 
    category: "Compra de Peças", 
    createdAt: "2026-05-22T08:00:00Z",
    invoiceNumber: "NF-99812",
    purchaseOrder: "PED-44810",
    reminderEnabled: true,
    reminderDaysBefore: 3,
    supplierId: "for_3",
    supplierName: "LubriDistr Distribuidora Lubrificantes"
  },
  { 
    id: "fin_5", 
    empresaId: "comp_demo_1", 
    description: "Fatura Aluguel Galpão Oficina", 
    type: "Despesa", 
    amount: 2500.00, 
    dueDate: "2026-06-01", 
    status: "Pendente", 
    category: "Infraestrutura", 
    createdAt: "2026-05-01T09:00:00Z",
    invoiceNumber: "FAT-3312",
    purchaseOrder: "CON-010",
    reminderEnabled: true,
    reminderDaysBefore: 5
  },
  { 
    id: "fin_6", 
    empresaId: "comp_demo_1", 
    description: "Energia Elétrica Copel", 
    type: "Despesa", 
    amount: 480.00, 
    dueDate: "2026-05-28", 
    status: "Pendente", 
    category: "Serviços Básicos", 
    createdAt: "2026-05-18T10:00:00Z",
    invoiceNumber: "COP-88712",
    purchaseOrder: "INS-990",
    reminderEnabled: true,
    reminderDaysBefore: 2
  }
];

export const MOCK_FORNECEDORES: Fornecedor[] = [
  { id: "for_1", name: "DVP Distribuidora de Autopeças", cnpj: "44.111.453/0001-90", phone: "(11) 4004-9883", email: "pedidos@dvpautopecas.com.br", empresaId: "comp_demo_1" },
  { id: "for_2", name: "SulAmérica Comercial de Pneus", cnpj: "02.321.439/0002-34", phone: "(11) 3214-5555", email: "vendas@sulamerecapneus.com.br", empresaId: "comp_demo_1" },
  { id: "for_3", name: "LubriDistr Distribuidora Lubrificantes", cnpj: "11.231.990/0001-22", phone: "(11) 98111-2233", email: "contato@lubridistr.com.br", empresaId: "comp_demo_1" }
];
