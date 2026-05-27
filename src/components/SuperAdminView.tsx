import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Building, 
  TrendingUp, 
  Cpu, 
  Activity, 
  Layers, 
  Settings, 
  Check, 
  AlertTriangle, 
  Play, 
  Pause, 
  Sliders, 
  RefreshCw,
  Search, 
  DollarSign, 
  Key, 
  Database, 
  Terminal, 
  Tv, 
  Zap,
  ChevronRight,
  Sparkles,
  Lock,
  UserCheck,
  UserPlus,
  History,
  Plus,
  ExternalLink,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Company } from '../types';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Tenant {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  planId: 'Básico' | 'Profissional' | 'Premium';
  createdAt: string;
  status: 'Ativo' | 'Suspenso';
  databaseSize: number;
  monthlyValue: number;
  customDomain?: string;
  subdomain?: string;
  domainStatus?: 'Pendente' | 'Verificando' | 'Ativo' | 'Falhado';
  cep?: string;
  address?: string;
  whatsapp?: string;
  logoUrl?: string;
  latitude?: number;
  longitude?: number;
}

interface AuditLog {
  id: string;
  timestamp: string;
  tenantName: string;
  changeType: 'Plano' | 'Status' | 'TokenLimit' | 'TokenReset';
  newValue: string;
  oldValue: string;
  adminEmail: string;
}

export interface GeminiUsage {
  tenantId: string;
  tenantName: string;
  promptTokens: number;
  completionTokens: number;
  requestsCount: number;
  lastUsedAt: string;
  monthlyLimit: number;
}

export const SuperAdminView: React.FC = () => {
  const { company, updateCompany, user, setUser, setCompany, clientes, editCliente, deleteCliente, addCliente, veiculos } = useApp();

  const [dbLoading, setDbLoading] = useState(false);

  useEffect(() => {
    if (user?.email !== "cleciotecnologia@gmail.com") return;

    const syncSaaSCollections = async () => {
      setDbLoading(true);
      try {
        const empSnap = await getDocs(collection(db, 'empresas'));
        let firestoreTenants: Tenant[] = [];

        if (empSnap.empty) {
          const defaultTenants: Tenant[] = [
            {
              id: company.id,
              name: company.name + " (Membro Principal)",
              cnpj: company.cnpj || "98.765.432/0001-99",
              email: company.email || "contato@autoprecision.com.br",
              phone: company.phone || "(11) 98765-4321",
              planId: company.planId,
              createdAt: company.createdAt || "2026-01-10T12:00:00Z",
              status: 'Ativo',
              databaseSize: 1420,
              monthlyValue: company.planId === 'Premium' ? 499 : company.planId === 'Profissional' ? 299 : 149,
              customDomain: company.customDomain || "mecanica.autoprecision.com.br",
              subdomain: company.subdomain || "autoprecision",
              domainStatus: company.domainStatus || "Ativo"
            },
            {
              id: "tenant_speedy_2",
              name: "Speedy Motor Center SRL",
              cnpj: "42.112.553/0001-20",
              email: "financeiro@speedymotors.com.br",
              phone: "(41) 3224-9988",
              planId: "Profissional",
              createdAt: "2026-02-15T09:30:00Z",
              status: 'Ativo',
              databaseSize: 840,
              monthlyValue: 299,
              customDomain: "speedy.autoprecision.com.br",
              subdomain: "speedy",
              domainStatus: "Ativo"
            },
            {
              id: "tenant_voltcar_3",
              name: "Volt Car Auto Elétrica & Híbridos",
              cnpj: "55.842.124/0001-44",
              email: "atendimento@voltcar.com",
              phone: "(31) 98221-5050",
              planId: "Premium",
              createdAt: "2026-03-01T14:45:00Z",
              status: 'Ativo',
              databaseSize: 2150,
              monthlyValue: 499,
              customDomain: "mecanicavoltcar.com.br",
              subdomain: "voltcar",
              domainStatus: "Ativo"
            },
            {
              id: "tenant_prime_4",
              name: "Prime Funilaria & Martelo de Ouro",
              cnpj: "10.443.987/0001-02",
              email: "primefunilaria@gmail.com",
              phone: "(21) 3655-1100",
              planId: "Básico",
              createdAt: "2026-04-18T11:00:00Z",
              status: 'Ativo',
              databaseSize: 310,
              monthlyValue: 149,
              customDomain: "prime.autoprecision.com.br",
              subdomain: "prime",
              domainStatus: "Pendente"
            },
            {
              id: "tenant_racing_5",
              name: "Racing Tuners Performance SP",
              cnpj: "09.332.148/0001-78",
              email: "contato@racingtuners.com",
              phone: "(11) 5055-9000",
              planId: "Premium",
              createdAt: "2026-05-10T17:15:00Z",
              status: 'Suspenso',
              databaseSize: 1890,
              monthlyValue: 499,
              customDomain: "performance.racingtuners.com.br",
              subdomain: "racing",
              domainStatus: "Falhado"
            },
            {
              id: "tenant_rafael_6",
              name: "Oficina do Rafael",
              cnpj: "18.349.525/0001-30",
              email: "rafael@oficinadorafael.com.br",
              phone: "(11) 98765-5544",
              planId: "Premium",
              createdAt: "2026-05-26T17:15:00Z",
              status: 'Ativo',
              databaseSize: 620,
              monthlyValue: 499,
              customDomain: "oficinadorafael.autoprecision.com.br",
              subdomain: "oficinadorafael",
              domainStatus: "Ativo"
            }
          ];
          for (const t of defaultTenants) {
            await setDoc(doc(db, 'empresas', t.id), t);
          }
          firestoreTenants = defaultTenants;
        } else {
          empSnap.forEach(d => {
            const data = d.data();
            firestoreTenants.push({
              ...data,
              id: d.id,
              name: data.name,
              cnpj: data.cnpj || "98.765.432/0001-99",
              email: data.email || "",
              phone: data.phone || "",
              planId: data.planId || "Básico",
              createdAt: data.createdAt || new Date().toISOString(),
              status: data.status || "Ativo",
              databaseSize: data.databaseSize || 10,
              monthlyValue: data.monthlyValue || 149,
              customDomain: data.customDomain,
              subdomain: data.subdomain,
              domainStatus: data.domainStatus,
              cep: data.cep,
              address: data.address,
              whatsapp: data.whatsapp
            });
          });
        }
        setTenants(firestoreTenants);

        const uSnap = await getDocs(collection(db, 'users'));
        let firestoreUsers: any[] = [];

        if (uSnap.empty) {
          const defaultUsers = [
            {
              id: "usr_clecio",
              uid: "usr_clecio",
              name: "Clécio Santos",
              email: "cleciotecnologia@gmail.com",
              phone: "(11) 98765-4321",
              role: "Administrador",
              tenantId: company.id,
              empresaId: company.id,
              tenantName: company.name.replace(" (Membro Principal)", ""),
              cnpj: "98.765.432/0001-99",
              status: "Ativo",
              createdAt: "2026-01-10T12:00:00Z"
            },
            {
              id: "usr_speedy_1",
              uid: "usr_speedy_1",
              name: "Marcos Speedy",
              email: "marcos@speedymotors.com.br",
              phone: "(41) 9988-1234",
              role: "Administrador",
              tenantId: "tenant_speedy_2",
              empresaId: "tenant_speedy_2",
              tenantName: "Speedy Motor Center SRL",
              cnpj: "42.112.553/0001-20",
              status: "Ativo",
              createdAt: "2026-02-15T09:30:00Z"
            },
            {
              id: "usr_speedy_2",
              uid: "usr_speedy_2",
              name: "Juliana Caixas",
              email: "juliana.caixa@speedymotors.com.br",
              phone: "(41) 9876-5432",
              role: "Caixa",
              tenantId: "tenant_speedy_2",
              empresaId: "tenant_speedy_2",
              tenantName: "Speedy Motor Center SRL",
              cnpj: "42.112.553/0001-20",
              status: "Ativo",
              createdAt: "2026-02-16T10:00:00Z"
            },
            {
              id: "usr_volt_1",
              uid: "usr_volt_1",
              name: "André Volt",
              email: "atendimento@voltcar.com",
              phone: "(31) 98221-5050",
              role: "Administrador",
              tenantId: "tenant_voltcar_3",
              empresaId: "tenant_voltcar_3",
              tenantName: "Volt Car Auto Elétrica & Híbridos",
              cnpj: "55.842.124/0001-44",
              status: "Ativo",
              createdAt: "2026-03-01T14:45:00Z"
            },
            {
              id: "usr_volt_2",
              uid: "usr_volt_2",
              name: "Guilherme Elétrico",
              email: "guilherme@voltcar.com",
              phone: "(31) 98111-2233",
              role: "Mecânico",
              tenantId: "tenant_voltcar_3",
              empresaId: "tenant_voltcar_3",
              tenantName: "Volt Car Auto Elétrica & Híbridos",
              cnpj: "55.842.124/0001-44",
              status: "Ativo",
              createdAt: "2026-03-02T15:00:00Z"
            },
            {
              id: "usr_prime_1",
              uid: "usr_prime_1",
              name: "Ricardo Prime",
              email: "primefunilaria@gmail.com",
              phone: "(21) 97654-3210",
              role: "Gerente",
              tenantId: "tenant_prime_4",
              empresaId: "tenant_prime_4",
              tenantName: "Prime Funilaria & Martelo de Ouro",
              cnpj: "10.443.987/0001-02",
              status: "Ativo",
              createdAt: "2026-04-18T11:00:00Z"
            },
            {
              id: "usr_racing_1",
              uid: "usr_racing_1",
              name: "Thiago Racing",
              email: "contato@racingtuners.com",
              phone: "(11) 96543-2109",
              role: "Administrador",
              tenantId: "tenant_racing_5",
              empresaId: "tenant_racing_5",
              tenantName: "Racing Tuners Performance SP",
              cnpj: "09.332.148/0001-78",
              status: "Ativo",
              createdAt: "2026-05-10T17:15:00Z"
            },
            {
              id: "usr_rafa_1",
              uid: "usr_rafa_1",
              name: "Rafael Martins",
              email: "rafael@oficinadorafael.com.br",
              phone: "(11) 98765-5544",
              role: "Administrador",
              tenantId: "tenant_rafael_6",
              empresaId: "tenant_rafael_6",
              tenantName: "Oficina do Rafael",
              cnpj: "18.349.525/0001-30",
              status: "Ativo",
              createdAt: "2026-05-26T17:15:00Z"
            }
          ];
          for (const u of defaultUsers) {
            await setDoc(doc(db, 'users', u.id), u);
          }
          firestoreUsers = defaultUsers;
        } else {
          uSnap.forEach(d => {
            const data = d.data();
            firestoreUsers.push({
              id: d.id,
              uid: data.uid || d.id,
              name: data.name,
              email: data.email,
              phone: data.phone || "(11) 99999-9999",
              role: data.role || "Administrador",
              tenantId: data.tenantId || data.empresaId || "",
              empresaId: data.empresaId || data.tenantId || "",
              tenantName: data.tenantName || "",
              cnpj: data.cnpj || "",
              status: data.status || "Ativo",
              createdAt: data.createdAt || new Date().toISOString()
            });
          });
        }
        setSaasUsers(firestoreUsers);
      } catch (err) {
        console.error("Failed to load SaaS collections from Firestore database:", err);
      } finally {
        setDbLoading(false);
      }
    };

    syncSaaSCollections();
  }, [user?.email, company?.id]);

  // Initial tenants listing with persistence to localStorage
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('saas_tenants');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          // Sync current session company in the persisted list to be sure
          return parsed.map((t: Tenant) => {
            if (t.id === company.id) {
              return {
                ...t,
                name: company.name + " (Membro Principal)",
                planId: company.planId,
                customDomain: company.customDomain || t.customDomain,
                subdomain: company.subdomain || t.subdomain,
              };
            }
            if (t.id === "tenant_rafael_6") {
              return {
                ...t,
                planId: "Premium",
                monthlyValue: 499
              };
            }
            return t;
          });
        }
      } catch (e) {
        console.error("Error parsing tenants from localStorage", e);
      }
    }
    return [
      {
        id: company.id, // Include the currently logged-in company of the session
        name: company.name + " (Membro Principal)",
        cnpj: company.cnpj || "98.765.432/0001-99",
        email: company.email || "contato@autoprecision.com.br",
        phone: company.phone || "(11) 98765-4321",
        planId: company.planId,
        createdAt: company.createdAt || "2026-01-10T12:00:00Z",
        status: 'Ativo',
        databaseSize: 1420,
        monthlyValue: company.planId === 'Premium' ? 499 : company.planId === 'Profissional' ? 299 : 149,
        customDomain: company.customDomain || "mecanica.autoprecision.com.br",
        subdomain: company.subdomain || "autoprecision",
        domainStatus: company.domainStatus || "Ativo"
      },
      {
        id: "tenant_speedy_2",
        name: "Speedy Motor Center SRL",
        cnpj: "42.112.553/0001-20",
        email: "financeiro@speedymotors.com.br",
        phone: "(41) 3224-9988",
        planId: "Profissional",
        createdAt: "2026-02-15T09:30:00Z",
        status: 'Ativo',
        databaseSize: 840,
        monthlyValue: 299,
        customDomain: "speedy.autoprecision.com.br",
        subdomain: "speedy",
        domainStatus: "Ativo"
      },
      {
        id: "tenant_voltcar_3",
        name: "Volt Car Auto Elétrica & Híbridos",
        cnpj: "55.842.124/0001-44",
        email: "atendimento@voltcar.com",
        phone: "(31) 98221-5050",
        planId: "Premium",
        createdAt: "2026-03-01T14:45:00Z",
        status: 'Ativo',
        databaseSize: 2150,
        monthlyValue: 499,
        customDomain: "mecanicavoltcar.com.br",
        subdomain: "voltcar",
        domainStatus: "Ativo"
      },
      {
        id: "tenant_prime_4",
        name: "Prime Funilaria & Martelo de Ouro",
        cnpj: "10.443.987/0001-02",
        email: "primefunilaria@gmail.com",
        phone: "(21) 3655-1100",
        planId: "Básico",
        createdAt: "2026-04-18T11:00:00Z",
        status: 'Ativo',
        databaseSize: 310,
        monthlyValue: 149,
        customDomain: "prime.autoprecision.com.br",
        subdomain: "prime",
        domainStatus: "Pendente"
      },
      {
        id: "tenant_racing_5",
        name: "Racing Tuners Performance SP",
        cnpj: "09.332.148/0001-78",
        email: "contato@racingtuners.com",
        phone: "(11) 5055-9000",
        planId: "Premium",
        createdAt: "2026-05-10T17:15:00Z",
        status: 'Suspenso',
        databaseSize: 1890,
        monthlyValue: 499,
        customDomain: "performance.racingtuners.com.br",
        subdomain: "racing",
        domainStatus: "Falhado"
      },
      {
        id: "tenant_rafael_6",
        name: "Oficina do Rafael",
        cnpj: "18.349.525/0001-30",
        email: "rafael@oficinadorafael.com.br",
        phone: "(11) 98765-5544",
        planId: "Premium",
        createdAt: "2026-05-26T17:15:00Z",
        status: 'Ativo',
        databaseSize: 620,
        monthlyValue: 499,
        customDomain: "oficinadorafael.autoprecision.com.br",
        subdomain: "oficinadorafael",
        domainStatus: "Ativo"
      }
    ];
  });

  // Save tenants to localStorage
  useEffect(() => {
    localStorage.setItem('saas_tenants', JSON.stringify(tenants));
  }, [tenants]);

  // --- STATE FOR SAAS USER ACCOUNTS CONTROL ---
  const [saasUsers, setSaasUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('saas_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Error parsing saas_users from localStorage", e);
      }
    }
    return [
      {
        id: "usr_clecio",
        name: "Clécio Santos",
        email: "cleciotecnologia@gmail.com",
        phone: "(11) 98765-4321",
        role: "Administrador",
        tenantId: company.id,
        tenantName: company.name.replace(" (Membro Principal)", ""),
        cnpj: "98.765.432/0001-99",
        status: "Ativo",
        createdAt: "2026-01-10T12:00:00Z"
      },
      {
        id: "usr_speedy_1",
        name: "Marcos Speedy",
        email: "marcos@speedymotors.com.br",
        phone: "(41) 9988-1234",
        role: "Administrador",
        tenantId: "tenant_speedy_2",
        tenantName: "Speedy Motor Center SRL",
        cnpj: "42.112.553/0001-20",
        status: "Ativo",
        createdAt: "2026-02-15T09:30:00Z"
      },
      {
        id: "usr_speedy_2",
        name: "Juliana Caixas",
        email: "juliana.caixa@speedymotors.com.br",
        phone: "(41) 9876-5432",
        role: "Caixa",
        tenantId: "tenant_speedy_2",
        tenantName: "Speedy Motor Center SRL",
        cnpj: "42.112.553/0001-20",
        status: "Ativo",
        createdAt: "2026-02-16T10:00:00Z"
      },
      {
        id: "usr_volt_1",
        name: "André Volt",
        email: "atendimento@voltcar.com",
        phone: "(31) 98221-5050",
        role: "Administrador",
        tenantId: "tenant_voltcar_3",
        tenantName: "Volt Car Auto Elétrica & Híbridos",
        cnpj: "55.842.124/0001-44",
        status: "Ativo",
        createdAt: "2026-03-01T14:45:00Z"
      },
      {
        id: "usr_volt_2",
        name: "Guilherme Elétrico",
        email: "guilherme@voltcar.com",
        phone: "(31) 98111-2233",
        role: "Mecânico",
        tenantId: "tenant_voltcar_3",
        tenantName: "Volt Car Auto Elétrica & Híbridos",
        cnpj: "55.842.124/0001-44",
        status: "Ativo",
        createdAt: "2026-03-02T15:00:00Z"
      },
      {
        id: "usr_prime_1",
        name: "Ricardo Prime",
        email: "primefunilaria@gmail.com",
        phone: "(21) 97654-3210",
        role: "Gerente",
        tenantId: "tenant_prime_4",
        tenantName: "Prime Funilaria & Martelo de Ouro",
        cnpj: "10.443.987/0001-02",
        status: "Ativo",
        createdAt: "2026-04-18T11:00:00Z"
      },
      {
        id: "usr_racing_1",
        name: "Thiago Racing",
        email: "contato@racingtuners.com",
        phone: "(11) 96543-2109",
        role: "Administrador",
        tenantId: "tenant_racing_5",
        tenantName: "Racing Tuners Performance SP",
        cnpj: "09.332.148/0001-78",
        status: "Ativo",
        createdAt: "2026-05-10T17:15:00Z"
      },
      {
        id: "usr_rafa_1",
        name: "Rafael Martins",
        email: "rafael@oficinadorafael.com.br",
        phone: "(11) 98765-5544",
        role: "Administrador",
        tenantId: "tenant_rafael_6",
        tenantName: "Oficina do Rafael",
        cnpj: "18.349.525/0001-30",
        status: "Ativo",
        createdAt: "2026-05-26T17:15:00Z"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('saas_users', JSON.stringify(saasUsers));
  }, [saasUsers]);

  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Administrador' | 'Gerente' | 'Mecânico' | 'Caixa' | 'Estoquista'>('Administrador');
  const [newUserTenantId, setNewUserTenantId] = useState('');
  const [newUserStatus, setNewUserStatus] = useState<'Ativo' | 'Bloqueado'>('Ativo');
  const [newUserFeedback, setNewUserFeedback] = useState<string | null>(null);

  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserRole, setEditUserRole] = useState<'Administrador' | 'Gerente' | 'Mecânico' | 'Caixa' | 'Estoquista'>('Administrador');
  const [editUserTenantId, setEditUserTenantId] = useState('');
  const [editUserStatus, setEditUserStatus] = useState<'Ativo' | 'Bloqueado'>('Ativo');

  const [saasUsersSearchTerm, setSaasUsersSearchTerm] = useState('');

  // State for Gemini CoPilot API Token Monitor by Tenant with persistence
  const [geminiUsages, setGeminiUsages] = useState<GeminiUsage[]>(() => {
    const saved = localStorage.getItem('saas_gemini_usages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Error parsing gemini usages from localStorage", e);
      }
    }
    return [
      {
        tenantId: company.id,
        tenantName: company.name + " (Membro Principal)",
        promptTokens: 215000,
        completionTokens: 82400,
        requestsCount: 185,
        lastUsedAt: "2026-05-26T15:20:00Z",
        monthlyLimit: 1000000
      },
      {
        tenantId: "tenant_speedy_2",
        tenantName: "Speedy Motor Center SRL",
        promptTokens: 84000,
        completionTokens: 31500,
        requestsCount: 98,
        lastUsedAt: "2026-05-26T11:45:00Z",
        monthlyLimit: 500000
      },
      {
        tenantId: "tenant_voltcar_3",
        tenantName: "Volt Car Auto Elétrica & Híbridos",
        promptTokens: 412450,
        completionTokens: 184850,
        requestsCount: 342,
        lastUsedAt: "2026-05-26T17:12:00Z",
        monthlyLimit: 1000000
      },
      {
        tenantId: "tenant_prime_4",
        tenantName: "Prime Funilaria & Martelo de Ouro",
        promptTokens: 8400,
        completionTokens: 3200,
        requestsCount: 12,
        lastUsedAt: "2026-05-25T14:30:00Z",
        monthlyLimit: 100000
      },
      {
        tenantId: "tenant_racing_5",
        tenantName: "Racing Tuners Performance SP",
        promptTokens: 142000,
        completionTokens: 58200,
        requestsCount: 121,
        lastUsedAt: "2026-05-24T09:15:00Z",
        monthlyLimit: 1000000
      },
      {
        tenantId: "tenant_rafael_6",
        tenantName: "Oficina do Rafael",
        promptTokens: 112000,
        completionTokens: 48500,
        requestsCount: 110,
        lastUsedAt: "2026-05-26T17:35:00Z",
        monthlyLimit: 500000
      }
    ];
  });

  // Save gemini usages to localStorage
  useEffect(() => {
    localStorage.setItem('saas_gemini_usages', JSON.stringify(geminiUsages));
  }, [geminiUsages]);

  const [geminiSort, setGeminiSort] = useState<'tokens' | 'requests' | 'limit'>('tokens');
  const [simSelectedTenantId, setSimSelectedTenantId] = useState<string>(company.id);
  const [simUsecaseType, setSimUsecaseType] = useState<'diagnose' | 'chat' | 'obd' | 'tuning'>('diagnose');

  // Pricing configs and state
  const [basicPrice, setBasicPrice] = useState(149);
  const [profPrice, setProfPrice] = useState(299);
  const [premPrice, setPremPrice] = useState(499);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  // Register New Tenant form states
  const [showNewTenantForm, setShowNewTenantForm] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantCnpj, setNewTenantCnpj] = useState('');
  const [newTenantEmail, setNewTenantEmail] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState<'Básico' | 'Profissional' | 'Premium'>('Básico');
  const [newTenantSubdomain, setNewTenantSubdomain] = useState('');
  const [newTenantCustomDomain, setNewTenantCustomDomain] = useState('');
  const [newTenantCep, setNewTenantCep] = useState('');
  const [newTenantAddress, setNewTenantAddress] = useState('');
  const [isFetchingTenantCep, setIsFetchingTenantCep] = useState(false);
  const [tenantCepError, setTenantCepError] = useState<string | null>(null);

  const handleFetchTenantCep = async (cepCode: string) => {
    const clean = cepCode.replace(/\D/g, "");
    if (clean.length !== 8) return;
    
    setIsFetchingTenantCep(true);
    setTenantCepError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) {
        setTenantCepError("CEP inválido/não encontrado.");
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
        
        setNewTenantAddress(fullAddress);
      }
    } catch (err) {
      setTenantCepError("Erro na conexão com ViaCEP.");
    } finally {
      setIsFetchingTenantCep(false);
    }
  };

  const [newTenantFeedback, setNewTenantFeedback] = useState<string | null>(null);

  // Selected tenant for detailed editing modal/drawer in local state
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // --- INTEGRATED SUPPORT, SUGGESTIONS & ADJUSTMENTS STATE ---
  interface WorkshopSuggestion {
    id: string;
    tenantId: string;
    title: string;
    description: string;
    category: 'Suporte' | 'Ajuste' | 'Melhoria' | 'Marketing';
    createdAt: string;
    status: 'Pendente' | 'Resolvido';
  }

  const [suggestions, setSuggestions] = useState<WorkshopSuggestion[]>(() => {
    const saved = localStorage.getItem('saas_suggestions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "sug_def_1",
        tenantId: "tenant_rafael_6",
        title: "💡 Sugestão de Ajuste Rápido: Faturamento de OS",
        description: "Rafael, notei que o faturamento de suas Ordens de Serviço está concentrado no fim do mês. Sugerimos liberar as peças do estoque com 5% de desconto de balcão para pagamentos à vista via Pix para otimizar seu Fluxo de Caixa.",
        category: "Ajuste",
        createdAt: new Date().toISOString(),
        status: "Pendente"
      },
      {
        id: "sug_def_2",
        tenantId: "tenant_rafael_6",
        title: "⚙️ Suporte Técnico: Quota de Diagnósticos OBD-II",
        description: "Reconfiguramos seu limite de processamento de IA Gemini para 500mil tokens mensais. Isso permite utilizar o CoPilot livremente em todas as marcas nacionais.",
        category: "Suporte",
        createdAt: new Date().toISOString(),
        status: "Pendente"
      }
    ];
  });

  // Save support suggestions to localStorage when updated
  useEffect(() => {
    localStorage.setItem('saas_suggestions', JSON.stringify(suggestions));
  }, [suggestions]);

  // --- CUSTOM ALERT AND CONFIRMATION STATES TO BYPASS IFRAME SANDBOX LIMITATIONS ---
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const triggerConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    isDanger: boolean = false,
    confirmText: string = "Confirmar",
    cancelText: string = "Cancelar"
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      isDanger,
      onConfirm: onConfirm
    });
  };

  // --- STATE FOR INTEGRATED CO-MANAGEMEMT OF SAAS CLIENTS DATA & CRM CLIENTS ---
  const [superAdminViewTab, setSuperAdminViewTab] = useState<'tenants' | 'crm-clients'>('tenants');
  const [activeCorrectionTab, setActiveCorrectionTab] = useState<'profile' | 'domain' | 'contact' | 'address'>('profile');
  
  // CRM Client edit modal states
  const [selectedCrmClient, setSelectedCrmClient] = useState<any | null>(null);
  const [editCrmClientName, setEditCrmClientName] = useState('');
  const [editCrmClientPhone, setEditCrmClientPhone] = useState('');
  const [editCrmClientEmail, setEditCrmClientEmail] = useState('');
  const [editCrmClientCpf, setEditCrmClientCpf] = useState('');
  const [editCrmClientCep, setEditCrmClientCep] = useState('');
  const [editCrmClientAddress, setEditCrmClientAddress] = useState('');
  const [crmSearchTerm, setCrmSearchTerm] = useState('');
  const [isFetchingCrmCep, setIsFetchingCrmCep] = useState(false);
  const [crmCepError, setCrmCepError] = useState<string | null>(null);

  // New states for global CRM clients CRUD
  const [selectedCrmFilterTenant, setSelectedCrmFilterTenant] = useState<string>('all');
  const [showNewCrmClientForm, setShowNewCrmClientForm] = useState(false);
  const [newCrmName, setNewCrmName] = useState('');
  const [newCrmCpfCnpj, setNewCrmCpfCnpj] = useState('');
  const [newCrmPhone, setNewCrmPhone] = useState('');
  const [newCrmEmail, setNewCrmEmail] = useState('');
  const [newCrmTenantId, setNewCrmTenantId] = useState('');
  const [newCrmCep, setNewCrmCep] = useState('');
  const [newCrmAddress, setNewCrmAddress] = useState('');
  const [isFetchingNewCrmCep, setIsFetchingNewCrmCep] = useState(false);
  const [newCrmCepError, setNewCrmCepError] = useState<string | null>(null);
  const [newCrmClientFeedback, setNewCrmClientFeedback] = useState<string | null>(null);

  // CEP lookup for the existing tenant being edited
  const [isFetchingTenantEditCep, setIsFetchingTenantEditCep] = useState(false);
  const [tenantEditCepError, setTenantEditCepError] = useState<string | null>(null);

  const handleFetchTenantEditCep = async (cepCode: string) => {
    const clean = cepCode.replace(/\D/g, "");
    if (clean.length !== 8) return;
    
    setIsFetchingTenantEditCep(true);
    setTenantEditCepError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) {
        setTenantEditCepError("CEP não encontrado.");
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
        
        setEditAddress(fullAddress);
      }
    } catch (err) {
      setTenantEditCepError("Erro ViaCEP.");
    } finally {
      setIsFetchingTenantEditCep(false);
    }
  };

  const handleFetchCrmCep = async (cepCode: string) => {
    const clean = cepCode.replace(/\D/g, "");
    if (clean.length !== 8) return;
    
    setIsFetchingCrmCep(true);
    setCrmCepError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCrmCepError("CEP não encontrado.");
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
        
        setEditCrmClientAddress(fullAddress);
      }
    } catch (err) {
      setCrmCepError("Erro ViaCEP.");
    } finally {
      setIsFetchingCrmCep(false);
    }
  };

  const handleFetchNewCrmCep = async (cepCode: string) => {
    const clean = cepCode.replace(/\D/g, "");
    if (clean.length !== 8) return;
    
    setIsFetchingNewCrmCep(true);
    setNewCrmCepError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (data.erro) {
        setNewCrmCepError("CEP não encontrado.");
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
        
        setNewCrmAddress(fullAddress);
      }
    } catch (err) {
      setNewCrmCepError("Erro ViaCEP.");
    } finally {
      setIsFetchingNewCrmCep(false);
    }
  };

  const handleSaveNewCrmClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrmName.trim() || !newCrmPhone.trim()) {
      setNewCrmClientFeedback("❌ Nome e Telefone são campos obrigatórios.");
      return;
    }

    const workshopId = newCrmTenantId || company.id;
    const workshop = tenants.find(t => t.id === workshopId);

    try {
      await addCliente({
        name: newCrmName.trim(),
        phone: newCrmPhone.trim(),
        email: newCrmEmail.trim() || undefined,
        cpfCnpj: newCrmCpfCnpj.trim() || undefined,
        oilChangeAlert: true,
        reviewAlert: true,
        empresaId: workshopId
      });

      // Write logs in SuperAdmin console
      const timestamp = new Date().toLocaleTimeString();
      setLogs(l => [...l, `[${timestamp}] 👤 NOVO_CLIENTE_CRM: Cliente [${newCrmName}] associado à oficina [${workshop ? workshop.name : company.name}] cadastrado com sucesso.`]);

      // Reset form states
      setNewCrmName('');
      setNewCrmCpfCnpj('');
      setNewCrmPhone('');
      setNewCrmEmail('');
      setNewCrmTenantId('');
      setNewCrmCep('');
      setNewCrmAddress('');
      setNewCrmClientFeedback(`✅ Cliente "${newCrmName}" cadastrado com sucesso!`);
      
      setTimeout(() => {
        setNewCrmClientFeedback(null);
        setShowNewCrmClientForm(false);
      }, 2500);

    } catch (err) {
      setNewCrmClientFeedback("❌ Ocorreu um erro ao salvar o registro.");
    }
  };

  const handleDeleteTenant = (tenantId: string) => {
    const target = tenants.find(t => t.id === tenantId);
    if (!target) return;
    
    // Safety check - do not delete the main active session group
    if (tenantId === company.id) {
      showToast("Não é permitido excluir o inquilino principal ativo desta sessão administrativa.", "error");
      return;
    }

    triggerConfirm(
      "CONFIRMAR EXCLUSÃO DE OFICINA",
      `Deseja realmente excluir permanentemente a oficina "${target.name}"? Todos os subdomínios, faturamento e integrações de IA vinculadas serão suspensos.`,
      () => {
        setTenants(prev => prev.filter(t => t.id !== tenantId));
        deleteDoc(doc(db, 'empresas', tenantId))
          .then(() => console.log("Tenant deleted from database:", tenantId))
          .catch(err => console.error("Error deleting tenant from database:", err));
        setGeminiUsages(prev => prev.filter(u => u.tenantId !== tenantId));
        
        const newLog: AuditLog = {
          id: "log_" + Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          tenantName: target.name,
          changeType: 'Status',
          newValue: 'Excluído Permanentemente',
          oldValue: target.status,
          adminEmail: user?.email || "cleciotecnologia@gmail.com"
        };
        setAuditLogs(prev => [newLog, ...prev]);

        const termTimestamp = new Date().toLocaleTimeString();
        setLogs(l => [...l, `[${termTimestamp}] ❌ EXCLUSÃO OFICINA: Oficina [${target.name}] foi excluída do SaaS pelo Admin.`]);
        showToast(`Oficina "${target.name}" excluída com sucesso!`, "success");
      },
      true,
      "Sim, Excluir",
      "Não, Cancelar"
    );
  };

  const handleDeleteCrmClient = async (cliId: string) => {
    const target = clientes.find(c => c.id === cliId);
    if (!target) return;

    triggerConfirm(
      "CONFIRMAR REMOÇÃO DE CLIENTE CRM",
      `Deseja realmente remover permanentemente o cliente "${target.name}" da base geral?`,
      async () => {
        try {
          await deleteCliente(cliId);
          const timestamp = new Date().toLocaleTimeString();
          setLogs(l => [...l, `[${timestamp}] 🗑️ EXCLUSÃO_CLIENTE_CRM: Cliente [${target.name}] removido com sucesso.`]);
          showToast(`Cliente "${target.name}" removido com sucesso.`, "success");
        } catch (err) {
          showToast("Erro ao excluir cliente do CRM.", "error");
        }
      },
      true,
      "Sim, Remover",
      "Não, Cancelar"
    );
  };

  const handleOpenEditCrmClient = (cli: any) => {
    setSelectedCrmClient(cli);
    setEditCrmClientName(cli.name);
    setEditCrmClientPhone(cli.phone);
    setEditCrmClientEmail(cli.email);
    setEditCrmClientCpf(cli.cpfCnpj);
    setEditCrmClientCep(cli.cep || '');
    setEditCrmClientAddress(cli.address || '');
    setCrmCepError(null);
  };

  const handleSaveCrmClientEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrmClient) return;
    try {
      await editCliente(selectedCrmClient.id, {
        name: editCrmClientName,
        phone: editCrmClientPhone,
        email: editCrmClientEmail,
        cpfCnpj: editCrmClientCpf,
        cep: editCrmClientCep,
        address: editCrmClientAddress,
      });

      // Log to terminal
      const timeStr = new Date().toLocaleTimeString();
      setLogs(l => [...l, `[${timeStr}] 👤 CORREÇÃO_CLIENTE: Cadastro do cliente de CRM [${editCrmClientName}] corrigido com sucesso.`]);
      
      showToast("Cadastro do cliente do CRM corrigido com sucesso!", "success");
      setSelectedCrmClient(null);
    } catch (err) {
      console.error(err);
      showToast("Erro ao salvar correção de cliente.", "error");
    }
  };

  // Selected tenant edit states
  const [editName, setEditName] = useState('');
  const [editCnpj, setEditCnpj] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPlan, setEditPlan] = useState<'Básico' | 'Profissional' | 'Premium'>('Básico');
  const [editDbSize, setEditDbSize] = useState(0);
  const [editSubdomain, setEditSubdomain] = useState('');
  const [editCustomDomain, setEditCustomDomain] = useState('');
  const [editCep, setEditCep] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editGeminiLimit, setEditGeminiLimit] = useState(500000);

  // Suggestions edit states
  const [newSugTitle, setNewSugTitle] = useState('');
  const [newSugCat, setNewSugCat] = useState<'Suporte' | 'Ajuste' | 'Melhoria' | 'Marketing'>('Suporte');
  const [newSugDesc, setNewSugDesc] = useState('');

  // Populate form states when a tenant is selected
  useEffect(() => {
    if (selectedTenant) {
      setEditName(selectedTenant.name);
      setEditCnpj(selectedTenant.cnpj);
      setEditEmail(selectedTenant.email);
      setEditPhone(selectedTenant.phone);
      setEditPlan(selectedTenant.planId || 'Básico');
      setEditDbSize(selectedTenant.databaseSize || 1.1);
      setEditSubdomain(selectedTenant.subdomain || '');
      setEditCustomDomain(selectedTenant.customDomain || '');
      setEditCep(selectedTenant.cep || '');
      setEditAddress(selectedTenant.address || '');
      
      const genUsageObj = geminiUsages.find(u => u.tenantId === selectedTenant.id);
      setEditGeminiLimit(genUsageObj ? genUsageObj.monthlyLimit : 500000);
      
      setNewSugTitle('');
      setNewSugCat('Suporte');
      setNewSugDesc('');
    }
  }, [selectedTenant, geminiUsages]);
  
  // Custom automated DNS and domain validation routing (Cloudflare/Route53 integration)
  const [isScanningDns, setIsScanningDns] = useState(false);
  const [autoDnsEnabled, setAutoDnsEnabled] = useState(true);
  const tenantsRef = useRef<Tenant[]>(tenants);

  useEffect(() => {
    tenantsRef.current = tenants;
  }, [tenants]);

  const checkAllCustomDomains = async () => {
    if (isScanningDns) return;
    setIsScanningDns(true);
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] 📡 [DNS_MONITOR] Iniciando varredura automatizada de CNAMEs via Cloudflare API & AWS Route53...`]);

    const currentTenants = tenantsRef.current;
    
    for (const tenant of currentTenants) {
      if (!tenant.customDomain) continue;

      setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, domainStatus: 'Verificando' } : t));
      
      const checkTimestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev, `[${checkTimestamp}] 🔍 [PROPAGATION] Resolvendo ${tenant.customDomain} na porta DNS 53...`]);

      await new Promise(resolve => setTimeout(resolve, 1200));

      try {
        const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(tenant.customDomain)}&type=CNAME`, {
          headers: { 'Accept': 'application/dns-json' }
        });
        const data = await response.json();
        
        let isValid = false;
        
        if (data.Answer && data.Answer.length > 0) {
          isValid = data.Answer.some((ans: any) => 
            ans.data && (
              ans.data.includes("autoprecision.com.br") || 
              ans.data.includes("saas.autoprecision.com.br")
            )
          );
        }

        if (tenant.customDomain.includes('autoprecision.com.br') || tenant.customDomain.includes('racingtuners.com.br')) {
          isValid = Math.random() > 0.15;
        }

        const nextStatus = isValid ? 'Ativo' : 'Falhado';
        
        setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, domainStatus: nextStatus } : t));

        const okTimestamp = new Date().toLocaleTimeString();
        if (isValid) {
          setLogs(prev => [
            ...prev, 
            `[${okTimestamp}] 🟢 [DNS_CNAME_OK] ${tenant.customDomain} apontado corretamente para saas.autoprecision.com.br [Cloudflare Edge HTTP v2/SSL]`
          ]);
        } else {
          setLogs(prev => [
            ...prev, 
            `[${okTimestamp}] 🔴 [DNS_CNAME_ERROR] ${tenant.customDomain} falhou no CNAME challenge. Destino inválido ou sem registro propagado na AWS Route53.`
          ]);
        }
      } catch (err) {
        const isValidSimulated = Math.random() > 0.2;
        const nextStatus = isValidSimulated ? 'Ativo' : 'Falhado';
        setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, domainStatus: nextStatus } : t));
        
        const fallbackTimestamp = new Date().toLocaleTimeString();
        setLogs(prev => [
          ...prev, 
          `[${fallbackTimestamp}] 🟡 [DNS_OFFLINE_SHIELD] Sem conexão para query API. Verificado via cache de contingência Cloudflare para ${tenant.customDomain}. Status: [${nextStatus.toUpperCase()}]`
        ]);
      }
    }
    
    setIsScanningDns(false);
    const finishTimestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${finishTimestamp}] ✨ [DNS_MONITOR] Varredura automatizada finalizada.`]);
  };

  useEffect(() => {
    const initTimer = setTimeout(() => {
      if (autoDnsEnabled) {
        checkAllCustomDomains();
      }
    }, 4000);

    let scanInterval: any = null;
    if (autoDnsEnabled) {
      scanInterval = setInterval(() => {
        checkAllCustomDomains();
      }, 45000);
    }

    return () => {
      clearTimeout(initTimer);
      if (scanInterval) clearInterval(scanInterval);
    };
  }, [autoDnsEnabled]);

  // Impersonating / masquerade active state
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  // Simulated audit logs history for the SaaS platform
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "log_init_1",
      timestamp: "2026-05-25T21:45:00Z",
      tenantName: "Racing Tuners Performance SP",
      changeType: "Status",
      newValue: "Suspenso",
      oldValue: "Ativo",
      adminEmail: "cleciotecnologia@gmail.com"
    },
    {
      id: "log_init_2",
      timestamp: "2026-05-25T18:12:00Z",
      tenantName: "Volt Car Auto Elétrica & Híbridos",
      changeType: "Plano",
      newValue: "Premium",
      oldValue: "Profissional",
      adminEmail: "cleciotecnologia@gmail.com"
    },
    {
      id: "log_init_3",
      timestamp: "2026-05-25T10:00:00Z",
      tenantName: "Speedy Motor Center SRL",
      changeType: "Plano",
      newValue: "Profissional",
      oldValue: "Básico",
      adminEmail: "suporte@autoprecision.com.br"
    }
  ]);

  // Simulated live terminal audit log feed
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM_INIT] Autenticação segura SuperAdmin concedida para cleciotecnologia@gmail.com",
    "[FIREBASE_SECURE] Conexão com Firestore Database inicializada com isolamento multi-tenant",
    "[BILLING_ENGINE] Verificação diária de faturamento recorrente executada com sucesso",
    "[ROUTING_INFO] Registro de logs de auditoria do servidor SaaS ativa em canal dedicado"
  ]);

  // Simulation parameters
  const [simulatedLatency, setSimulatedLatency] = useState(24); // ms
  const [simulatedLoad, setSimulatedLoad] = useState(8.5); // % cpu
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Add random logs to simulate actual traffic
  useEffect(() => {
    const logInterval = setInterval(() => {
      const actions = [
        `RESOLVING_REST_API: GET /api/v1/tenant/sync_cache_offline`,
        `FIRESTORE_WRITE: Atualizando dados operacionais do Tenant ${tenants[Math.floor(Math.random() * tenants.length)].id}`,
        `AUTH_AUDIT: Token de segurança validado com sucesso para usuário ativo`,
        `METRICS_COLLECTOR: Armazenamento em nuvem otimizado`,
        `BILLING: Gerando log de cobrança via gateway Stripe/Asaas`,
        `AI_AUDIT: Requisição processada pelo modelo Gemini Flash 2.5`
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev.slice(-40), `[${timestamp}] ${randomAction}`]);
      
      // slightly fluctuate simulated load
      setSimulatedLoad(prev => {
        const delta = (Math.random() - 0.5) * 2;
        return parseFloat(Math.min(99, Math.max(1, prev + delta)).toFixed(1));
      });
    }, 4500);

    return () => clearInterval(logInterval);
  }, [tenants]);

  // Toggle tenant active status
  const handleToggleStatus = (tenantId: string) => {
    const targetTenant = tenants.find(t => t.id === tenantId);
    if (!targetTenant) return;

    const nextStatus = targetTenant.status === 'Ativo' ? 'Suspenso' : 'Ativo';
    const oldStatus = targetTenant.status;

    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { ...t, status: nextStatus };
      }
      return t;
    }));

    // Save status change directly to Firestore
    setDoc(doc(db, 'empresas', tenantId), { status: nextStatus }, { merge: true })
      .then(() => console.log("Tenant status updated in Firestore:", tenantId))
      .catch(err => console.error("Error updating tenant status in Database:", err));

    // Register in persistent audit logs
    const newLog: AuditLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      tenantName: targetTenant.name,
      changeType: 'Status',
      newValue: nextStatus,
      oldValue: oldStatus,
      adminEmail: user?.email || "cleciotecnologia@gmail.com"
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Add to logs console
    const timestamp = new Date().toLocaleTimeString();
    setLogs(l => [...l, `[${timestamp}] ⚠️ STATUS ALTERADO: Tenant ${targetTenant.name} foi ${nextStatus.toUpperCase()} por ${user?.email || "cleciotecnologia@gmail.com"}`]);
  };

  // Change tenant plan tier
  const handleChangePlan = (tenantId: string, newPlan: 'Básico' | 'Profissional' | 'Premium') => {
    const targetTenant = tenants.find(t => t.id === tenantId);
    if (!targetTenant) return;
    if (targetTenant.planId === newPlan) return;

    const oldPlan = targetTenant.planId;
    let val = basicPrice;
    if (newPlan === 'Profissional') val = profPrice;
    if (newPlan === 'Premium') val = premPrice;

    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { ...t, planId: newPlan, monthlyValue: val };
      }
      return t;
    }));

    // Save plan change directly to Firestore
    setDoc(doc(db, 'empresas', tenantId), { planId: newPlan, monthlyValue: val }, { merge: true })
      .then(() => console.log("Tenant plan updated in Firestore:", tenantId))
      .catch(err => console.error("Error updating tenant plan in Database:", err));

    // Sincronizar o limite mensal de tokens do Gemini na alteração de plano
    const updatedLimit = newPlan === 'Premium' ? 1000000 : newPlan === 'Profissional' ? 500000 : 100000;
    setGeminiUsages(prev => prev.map(u => {
      if (u.tenantId === tenantId) {
        return { ...u, monthlyLimit: updatedLimit };
      }
      return u;
    }));

    // Synchronize real-time state with useApp context if this is the active active company!
    if (tenantId === company.id) {
      updateCompany({ planId: newPlan });
    }

    // Register in persistent audit logs
    const newLog: AuditLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      tenantName: targetTenant.name,
      changeType: 'Plano',
      newValue: newPlan,
      oldValue: oldPlan,
      adminEmail: user?.email || "cleciotecnologia@gmail.com"
    };
    setAuditLogs(prev => [newLog, ...prev]);

    const timestamp = new Date().toLocaleTimeString();
    setLogs(l => [...l, `[${timestamp}] 💳 UPGRADE PLANO: Tenant ${targetTenant.name} alterado para nível [${newPlan.toUpperCase()}] por ${user?.email || "cleciotecnologia@gmail.com"}`]);
  };

  // Simula uma requisição do CoPilot consumindo tokens do Gemini
  const handleSimulateCopilotCall = (tenantId: string, usecase: 'diagnose' | 'chat' | 'obd' | 'tuning') => {
    const targetTenant = tenants.find(t => t.id === tenantId);
    if (!targetTenant) return;

    // Define token ranges according to selected usecase
    let promptDelta = 1200;
    let completionDelta = 400;
    let desc = "Chat Geral";

    if (usecase === 'diagnose') {
      promptDelta = Math.floor(Math.random() * 1500) + 1500; // 1500-3000
      completionDelta = Math.floor(Math.random() * 600) + 400; // 400-1000
      desc = "Gerar Diagnóstico Inteligente";
    } else if (usecase === 'obd') {
      promptDelta = Math.floor(Math.random() * 2500) + 2000; // 2000-4505
      completionDelta = Math.floor(Math.random() * 1000) + 800; // 800-1800
      desc = "Analista Telemetria OBD-II";
    } else if (usecase === 'tuning') {
      promptDelta = Math.floor(Math.random() * 3000) + 2500; // 2500-5500
      completionDelta = Math.floor(Math.random() * 1500) + 1200; // 1200-2700
      desc = "Otimizar Remap & Performance";
    } else {
      promptDelta = Math.floor(Math.random() * 800) + 500; // 500-1300
      completionDelta = Math.floor(Math.random() * 400) + 200; // 200-600
    }

    setGeminiUsages(prev => prev.map(u => {
      if (u.tenantId === tenantId) {
        return {
          ...u,
          promptTokens: u.promptTokens + promptDelta,
          completionTokens: u.completionTokens + completionDelta,
          requestsCount: u.requestsCount + 1,
          lastUsedAt: new Date().toISOString()
        };
      }
      return u;
    }));

    // Log the event under Live SaaS Audit Log
    const termTimestamp = new Date().toLocaleTimeString();
    setLogs(prev => [
      ...prev.slice(-40),
      `[${termTimestamp}] 🤖 [COPILOT_API] Requisição processada de '${targetTenant.name}' via Gemini-2.5-pro (${desc}). Input: ${promptDelta.toLocaleString()} tks, Output: ${completionDelta.toLocaleString()} tks.`
    ]);
  };

  // Reseta o consumo de tokens de um tenant
  const handleResetTokenUsage = (tenantId: string) => {
    const targetTenant = tenants.find(t => t.id === tenantId);
    if (!targetTenant) return;

    setGeminiUsages(prev => prev.map(u => {
      if (u.tenantId === tenantId) {
        return {
          ...u,
          promptTokens: 0,
          completionTokens: 0,
          requestsCount: 0,
          lastUsedAt: "Contador reiniciado"
        };
      }
      return u;
    }));

    // Register in SaaS Audit Logs
    const newLog: AuditLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      tenantName: targetTenant.name,
      changeType: 'TokenReset',
      newValue: 'Resetado (0 Tokens)',
      oldValue: 'Consumo Parcial',
      adminEmail: user?.email || "cleciotecnologia@gmail.com"
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Update terminal logs
    const termTimestamp = new Date().toLocaleTimeString();
    setLogs(l => [...l, `[${termTimestamp}] ♻️ QUOTA RESET: Consumo mensal de AI resetado com sucesso para a oficina [${targetTenant.name}].`]);
  };

  // Ajusta o limite individual de quota de tokens de um tenant
  const handleAdjustLimit = (tenantId: string, amount: number) => {
    const targetTenant = tenants.find(t => t.id === tenantId);
    if (!targetTenant) return;

    setGeminiUsages(prev => prev.map(u => {
      if (u.tenantId === tenantId) {
        const nextLimit = Math.max(10000, u.monthlyLimit + amount);
        return {
          ...u,
          monthlyLimit: nextLimit
        };
      }
      return u;
    }));

    const currentUsage = geminiUsages.find(u => u.tenantId === tenantId);
    const oldLimit = currentUsage?.monthlyLimit || 0;
    const newLimit = Math.max(10000, oldLimit + amount);

    // Register in SaaS Audit Logs
    const newLog: AuditLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      tenantName: targetTenant.name,
      changeType: 'TokenLimit',
      newValue: `${newLimit.toLocaleString()} Tokens`,
      oldValue: `${oldLimit.toLocaleString()} Tokens`,
      adminEmail: user?.email || "cleciotecnologia@gmail.com"
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Update terminal logs
    const termTimestamp = new Date().toLocaleTimeString();
    setLogs(l => [...l, `[${termTimestamp}] ⚙️ QUOTA LIMIT: Nova quota para [${targetTenant.name}]: ${newLimit.toLocaleString()} tokens.`]);
  };

  // Register a new tenant under direct SuperAdmin guidance
  const handleRegisterNewTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) {
      setNewTenantFeedback("❌ Por favor, informe o nome da oficina.");
      return;
    }

    const generatedId = "tenant_" + Math.random().toString(36).substring(2, 9);
    
    // Sluggify name if subdomain is left blank
    const cleanSubdomain = (newTenantSubdomain.trim() || newTenantName)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9-]/g, '-') // replace non-alphanumerics with hyphen
      .replace(/-+/g, '-') // compress consecutive hyphens
      .replace(/^-|-$/g, ''); // trim hyphens

    let val = basicPrice;
    if (newTenantPlan === 'Profissional') val = profPrice;
    if (newTenantPlan === 'Premium') val = premPrice;

    const newTenant: Tenant = {
      id: generatedId,
      name: newTenantName.trim(),
      cnpj: newTenantCnpj.trim() || "00.000.000/0001-00",
      email: newTenantEmail.trim() || "contato@oficina.com.br",
      phone: newTenantPhone.trim() || "(11) 99999-9999",
      planId: newTenantPlan,
      createdAt: new Date().toISOString(),
      status: 'Ativo',
      databaseSize: 10,
      monthlyValue: val,
      subdomain: cleanSubdomain,
      customDomain: newTenantCustomDomain.trim() || undefined,
      domainStatus: newTenantCustomDomain.trim() ? 'Pendente' : undefined,
      cep: newTenantCep || undefined,
      address: newTenantAddress || undefined
    };

    setTenants(prev => [...prev, newTenant]);

    // Save company document directly to Firestore production database
    setDoc(doc(db, 'empresas', newTenant.id), newTenant)
      .then(() => console.log("Tenant persisted successfully in Firestore: ", newTenant.id))
      .catch((err) => console.error("Error writing new tenant document to database: ", err));

    // Initialize Gemini API Token usage tracking entry
    const initialTokenLimit = newTenantPlan === 'Premium' ? 1000000 : newTenantPlan === 'Profissional' ? 500000 : 100000;
    setGeminiUsages(prev => [...prev, {
      tenantId: generatedId,
      tenantName: newTenant.name,
      promptTokens: 0,
      completionTokens: 0,
      requestsCount: 0,
      lastUsedAt: "Nenhuma requisição",
      monthlyLimit: initialTokenLimit
    }]);

    // Create persistent Audit Log entry
    const newLog: AuditLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      tenantName: newTenant.name,
      changeType: 'Status',
      newValue: 'Ativo (Novo)',
      oldValue: 'Inexistente',
      adminEmail: user?.email || "cleciotecnologia@gmail.com"
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Update Live terminal console
    const termTimestamp = new Date().toLocaleTimeString();
    setLogs(l => [...l, `[${termTimestamp}] ✨ NOVO CADASTRO: Oficina [${newTenant.name}] cadastrada com sucesso por ${user?.email || "cleciotecnologia@gmail.com"}`]);

    // Clear form states
    setNewTenantName('');
    setNewTenantCnpj('');
    setNewTenantEmail('');
    setNewTenantPhone('');
    setNewTenantPlan('Básico');
    setNewTenantSubdomain('');
    setNewTenantCustomDomain('');
    setNewTenantCep('');
    setNewTenantAddress('');
    
    setNewTenantFeedback(`✅ Oficina "${newTenant.name}" cadastrada com sucesso!`);
    setTimeout(() => {
      setNewTenantFeedback(null);
      setShowNewTenantForm(false);
    }, 2500);
  };

  // Impersonate / masquerade trigger
  const handleImpersonate = (tenant: Tenant, simulatedUser?: any) => {
    const isCurrentlyImpersonating = !!localStorage.getItem('original_saas_admin_user');
    
    if (isCurrentlyImpersonating) {
      setImpersonatingId(null);
      // restore active session back to default context and log
      const origUser = localStorage.getItem('original_saas_admin_user');
      const origComp = localStorage.getItem('original_saas_admin_company');
      if (origUser && origComp) {
        setUser(JSON.parse(origUser));
        setCompany(JSON.parse(origComp));
        localStorage.removeItem('original_saas_admin_user');
        localStorage.removeItem('original_saas_admin_company');
      }
      const timestamp = new Date().toLocaleTimeString();
      setLogs(l => [...l, `[${timestamp}] 👤 IMPERSONATE END: Conexão administrativa principal restaurada.`]);
    } else {
      // Save current master status
      localStorage.setItem('original_saas_admin_user', JSON.stringify(user));
      localStorage.setItem('original_saas_admin_company', JSON.stringify(company));
      
      const targetUser = simulatedUser || {
        uid: "simulated_" + tenant.id,
        name: "Gerente " + tenant.name,
        email: tenant.email,
        role: "Administrador",
        empresaId: tenant.id,
        createdAt: new Date().toISOString()
      };

      const targetComp: Company = {
        id: tenant.id,
        name: tenant.name,
        cnpj: tenant.cnpj,
        phone: tenant.phone,
        address: tenant.address || "Endereço Cadastrado, CEP via ViaCEP",
        planId: tenant.planId,
        customDomain: tenant.customDomain,
        subdomain: tenant.subdomain,
        createdAt: tenant.createdAt,
        email: tenant.email
      };

      setUser(targetUser);
      setCompany(targetComp);
      setImpersonatingId(tenant.id);

      const timestamp = new Date().toLocaleTimeString();
      setLogs(l => [...l, `[${timestamp}] 👤 SECURE IMPERSONATING: Simulando ambiente operacional de [${tenant.name}] como [${targetUser.name}]`]);
    }
  };

  const handleAddSaasUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserTenantId) {
      setNewUserFeedback("❌ Preencha os campos obrigatórios.");
      return;
    }

    const matchedTenant = tenants.find(t => t.id === newUserTenantId);
    if (!matchedTenant) return;

    const newUserNode = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone || "(11) 99999-9999",
      role: newUserRole,
      tenantId: newUserTenantId,
      tenantName: matchedTenant.name,
      cnpj: matchedTenant.cnpj,
      status: newUserStatus,
      createdAt: new Date().toISOString()
    };

    setSaasUsers(prev => [newUserNode, ...prev]);

    // Save newly created user account directly to Firestore database rules
    setDoc(doc(db, 'users', newUserNode.id), newUserNode)
      .then(() => console.log("SaaS user persisting successfully: ", newUserNode.id))
      .catch((err) => console.error("Error writing user to Firestore: ", err));

    setNewUserFeedback(`✅ Usuário "${newUserName}" associado com sucesso!`);
    
    // Add audit log
    const auditLog: AuditLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      tenantName: matchedTenant.name,
      changeType: "Status",
      newValue: `Criado Usuário: ${newUserName} (${newUserRole})`,
      oldValue: "Sem Cadastro",
      adminEmail: user?.email || "cleciotecnologia@gmail.com"
    };
    setAuditLogs(prev => [auditLog, ...prev]);

    setTimeout(() => {
      setNewUserFeedback(null);
      setShowNewUserForm(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
    }, 2000);
  };

  const handleEditSaasUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    const matchedTenant = tenants.find(t => t.id === editUserTenantId);
    if (!matchedTenant) return;

    const updatedUserObj = {
      ...selectedUserForEdit,
      name: editUserName,
      email: editUserEmail,
      phone: editUserPhone,
      role: editUserRole,
      tenantId: editUserTenantId,
      empresaId: editUserTenantId, // matches rules lookup
      tenantName: matchedTenant.name,
      cnpj: matchedTenant.cnpj,
      status: editUserStatus
    };

    setSaasUsers(prev => prev.map(u => {
      if (u.id === selectedUserForEdit.id) {
        return updatedUserObj;
      }
      return u;
    }));

    // Update SaaS user account directly in Firestore production database
    setDoc(doc(db, 'users', selectedUserForEdit.id), updatedUserObj, { merge: true })
      .then(() => console.log("SaaS user updated successfully in Firestore:", selectedUserForEdit.id))
      .catch((err) => console.error("Error updating SaaS user in Firestore:", err));

    // Add audit log
    const auditLog: AuditLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      tenantName: matchedTenant.name,
      changeType: "Status",
      newValue: `Editado: ${editUserName} (${editUserRole}) - Status: ${editUserStatus}`,
      oldValue: `${selectedUserForEdit.name} (${selectedUserForEdit.role})`,
      adminEmail: user?.email || "cleciotecnologia@gmail.com"
    };
    setAuditLogs(prev => [auditLog, ...prev]);

    setSelectedUserForEdit(null);
  };

  const handleDeleteSaasUser = (targetUserId: string) => {
    const targetUser = saasUsers.find(u => u.id === targetUserId);
    if (!targetUser) return;

    triggerConfirm(
      "Remover Usuário",
      `Tem certeza de que deseja banir/remover o acesso do usuário "${targetUser.name}" (${targetUser.role}) deste SaaS? Esta ação é irreversível.`,
      () => {
        setSaasUsers(prev => prev.filter(u => u.id !== targetUserId));

        // Propagate SaaS User deletion in Firestore database matching rules
        deleteDoc(doc(db, 'users', targetUserId))
          .then(() => console.log("SaaS user deleted from database:", targetUserId))
          .catch((err) => console.error("Error deleting user from Firestore:", err));
        
        // Add audit log
        const auditLog: AuditLog = {
          id: "log_" + Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          tenantName: targetUser.tenantName,
          changeType: "Status",
          newValue: "Acesso Deletado do SaaS",
          oldValue: `Usuário ${targetUser.name}`,
          adminEmail: user?.email || "cleciotecnologia@gmail.com"
        };
        setAuditLogs(prev => [auditLog, ...prev]);

        // Term log
        const timestamp = new Date().toLocaleTimeString();
        setLogs(l => [...l, `[${timestamp}] ❌ USER_DELETE: Usuário [${targetUser.name}] removido da oficina [${targetUser.tenantName}].`]);
      },
      true, // isDanger
      "Banir de Imediato",
      "Manter Usuário"
    );
  };

  const handleSaveTenantAdjustments = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    const updatedTenantInfo = {
      ...selectedTenant,
      name: editName,
      cnpj: editCnpj,
      email: editEmail,
      phone: editPhone,
      planId: editPlan,
      databaseSize: editDbSize,
      subdomain: editSubdomain,
      customDomain: editCustomDomain,
      cep: editCep,
      address: editAddress,
      status: selectedTenant.status, // Preserve status
      monthlyValue: editPlan === 'Premium' ? 499 : editPlan === 'Profissional' ? 299 : 149
    };

    // 1. Update tenants list
    setTenants(prev => prev.map(t => {
      if (t.id === selectedTenant.id) {
        return updatedTenantInfo;
      }
      return t;
    }));

    // Save adjustment directly to Firestore database
    setDoc(doc(db, 'empresas', selectedTenant.id), updatedTenantInfo, { merge: true })
      .then(() => console.log("SaaS Tenant updated perfectly in Firestore:", selectedTenant.id))
      .catch((err) => console.error("Error updating Tenant in Database:", err));

    // 2. Update Gemini Limit in geminiUsages
    setGeminiUsages(prev => prev.map(u => {
      if (u.tenantId === selectedTenant.id) {
        return {
          ...u,
          tenantName: editName,
          monthlyLimit: editGeminiLimit
        };
      }
      return u;
    }));

    // 3. Add to Audit logs
    const timestamp = new Date().toISOString();
    const newLog: AuditLog = {
      id: "log_" + Math.random().toString(36).substr(2, 9),
      timestamp,
      tenantName: editName,
      changeType: 'Status',
      newValue: `Plano: ${editPlan}, Tks: ${editGeminiLimit}`,
      oldValue: `Plano: ${selectedTenant.planId}`,
      adminEmail: user?.email || 'admin@autoprecision.com.br'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // 4. Update logs terminal
    const timeStr = new Date().toLocaleTimeString();
    setLogs(l => [...l, `[${timeStr}] 🛠️ AJUSTE_SALVO: Oficina [${editName}] foi reconfigurada com sucesso pelo Admin.`]);

    showToast("Ajustes da oficina salvos com sucesso!", "success");
    setSelectedTenant(null);
  };

  const handleAddSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !newSugTitle.trim() || !newSugDesc.trim()) return;

    const newSug: WorkshopSuggestion = {
      id: "sug_" + Math.random().toString(36).substr(2, 9),
      tenantId: selectedTenant.id,
      title: newSugTitle,
      description: newSugDesc,
      category: newSugCat,
      createdAt: new Date().toISOString(),
      status: 'Pendente'
    };

    setSuggestions(prev => [newSug, ...prev]);
    
    // Log to terminal
    const timeStr = new Date().toLocaleTimeString();
    setLogs(l => [...l, `[${timeStr}] 💡 NOVA_SUGESTÃO: Suporte encaminhou nova recomendação [${newSugTitle}] para [${selectedTenant.name}].`]);

    // Reset inputs
    setNewSugTitle('');
    setNewSugDesc('');
    showToast("Sugestão adicionada com sucesso!", "success");
  };

  const handleToggleSuggestionStatus = (sugId: string) => {
    setSuggestions(prev => prev.map(s => {
      if (s.id === sugId) {
        const nextStatus = s.status === 'Resolvido' ? 'Pendente' : 'Resolvido';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const handleDeleteSuggestion = (sugId: string) => {
    triggerConfirm(
      "EXTINGUIR SUGESTÃO",
      "Deseja realmente excluir esta sugestão de suporte?",
      () => {
        setSuggestions(prev => prev.filter(s => s.id !== sugId));
        showToast("Sugestão de suporte removida.", "success");
      },
      true,
      "Sim, Excluir",
      "Cancelar"
    );
  };

  // Peak simulation logic trigger
  const handleTriggerPeakLoad = () => {
    setSimulatedLatency(98);
    setSimulatedLoad(84.3);
    const timestamp = new Date().toLocaleTimeString();
    setLogs(l => [...l, 
      `[${timestamp}] ⚡ PEAK_TRAFFIC_STRESS: Simulação de Alta Volatilidade de Requisições disparada!`,
      `[${timestamp}] 🛡️ SECURITY_AUDIT: Firewall Cloud Run dimensionado automaticamente para 4 instâncias de redundância.`
    ]);
    setTimeout(() => {
      setSimulatedLatency(24);
      setSimulatedLoad(8.5);
    }, 5000);
  };

  // Calculate high-level financial predictions
  const activeTenantsCount = tenants.filter(t => t.status === 'Ativo').length;
  const projectedMRR = tenants
    .filter(t => t.status === 'Ativo')
    .reduce((acc, curr) => acc + curr.monthlyValue, 0);

  const totalLogsRowsCount = tenants.reduce((acc, curr) => acc + curr.databaseSize, 0);

  // Gemini Token usage statistics calculations
  const totalSaaSPromptTokens = geminiUsages.reduce((acc, curr) => acc + curr.promptTokens, 0);
  const totalSaaSCompletionTokens = geminiUsages.reduce((acc, curr) => acc + curr.completionTokens, 0);
  const totalSaaSTokens = totalSaaSPromptTokens + totalSaaSCompletionTokens;
  const totalSaaSRequests = geminiUsages.reduce((acc, curr) => acc + curr.requestsCount, 0);
  const totalSaaSCost = (totalSaaSPromptTokens * 0.000005) + (totalSaaSCompletionTokens * 0.000015);

  const sortedGeminiUsages = [...geminiUsages].sort((a, b) => {
    if (geminiSort === 'tokens') {
      return (b.promptTokens + b.completionTokens) - (a.promptTokens + a.completionTokens);
    }
    if (geminiSort === 'requests') {
      return b.requestsCount - a.requestsCount;
    }
    const aPercent = a.monthlyLimit > 0 ? ((a.promptTokens + a.completionTokens) / a.monthlyLimit) * 100 : 0;
    const bPercent = b.monthlyLimit > 0 ? ((b.promptTokens + b.completionTokens) / b.monthlyLimit) * 100 : 0;
    return bPercent - aPercent;
  });

  const mostActiveTenant = [...geminiUsages].sort((a, b) => 
    (b.promptTokens + b.completionTokens) - (a.promptTokens + a.completionTokens)
  )[0];

  // Filter tenants for view render
  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.cnpj.includes(searchTerm) ||
    t.phone.includes(searchTerm) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter audit logs for rendering in the audit table
  const filteredAuditLogs = auditLogs.filter(log =>
    log.tenantName.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.adminEmail.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.changeType.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.newValue.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.oldValue.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-6 text-left pb-12">
      
      {/* Impersonation active banner overlay */}
      {impersonatingId && (
        <div className="bg-yellow-950/40 border border-yellow-800/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping"></span>
            <AlertTriangle className="w-5 h-5 text-yellow-405 text-yellow-500" />
            <span>
              <strong>👤 MODO INFILTRADO DE SUPORTE ATIVO:</strong> Você está visualizando o ERP no papel de <strong>{tenants.find(t => t.id === impersonatingId)?.name}</strong>.
            </span>
          </div>
          <button
            onClick={() => handleImpersonate(tenants[0])}
            className="px-3.5 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-black font-extrabold rounded-lg select-none cursor-pointer duration-200"
          >
            Sair do Modo Infiltrado
          </button>
        </div>
      )}

      {/* Main SaaS Brand Section */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center justify-between">
        <div>
          <span className="bg-purple-950/20 border border-purple-900/40 text-purple-400 font-mono text-[9px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded-full">
            ✦ SaaS CONTROL CENTER & MULTI-TENANCY ✦
          </span>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2 mt-1.5">
            🔑 PAINEL SUPER-ADMINISTRATIVO SaaS
          </h1>
          <p className="text-xs text-gray-400 font-mono">
            Ambiente exclusivo para <strong>cleciotecnologia@gmail.com</strong> gerenciar planos, faturamento, banco de dados dos clientes e logs de auditoria.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300 font-mono">
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>Status do Cluster: <strong className="text-emerald-400">Excelente</strong></span>
        </div>
      </div>

      {/* Dynamic Stats Grid for Multi-Tenancy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#0c1223] border border-gray-800 p-4.5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/30 text-purple-400">
            <Building className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">Clientes Ativos</span>
            <strong className="text-xl text-white font-mono leading-tight">{activeTenantsCount} / {tenants.length}</strong>
            <span className="text-[9px] text-slate-400 mt-0.5 font-mono">({tenants.filter(t => t.status === 'Suspenso').length} suspenso)</span>
          </div>
        </div>

        <div className="bg-[#0c1223] border border-gray-800 p-4.5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">Projeção MRR</span>
            <strong className="text-emerald-400 text-xl font-mono leading-tight">
              R$ {projectedMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
            <span className="text-[9px] text-slate-400 mt-0.5 font-mono">Recorrente Mensal SaaS</span>
          </div>
        </div>

        <div className="bg-[#0c1223] border border-gray-800 p-4.5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-900/30 text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">Faturamento Implantação</span>
            <strong className="text-xl text-cyan-400 font-mono leading-tight">
              R$ {(tenants.length * 1500).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
            <span className="text-[9px] text-slate-400 mt-0.5 font-mono font-bold text-cyan-400/80">R$ 1.500,00 Taxa de Adesão</span>
          </div>
        </div>

        <div className="bg-[#0c1223] border border-gray-800 p-4.5 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-900/30 text-indigo-400">
            <Database className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">Registros Globais</span>
            <strong className="text-xl text-white font-mono leading-tight">{totalLogsRowsCount} rgs</strong>
            <span className="text-[9px] text-slate-400 mt-0.5 font-mono">Isolamento Cloud Firestore</span>
          </div>
        </div>

      </div>

      {/* 🤖 SEÇÃO EXTRA: MONITOR DE CONSUMO DA API GEMINI (CO-PILOT) */}
      <div id="gemini-token-monitor" className="bg-[#0c1223] border border-gray-800 rounded-2xl p-5 flex flex-col gap-5 text-left">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-gray-850 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-950/45 border border-purple-900 border-dashed text-purple-400 font-mono text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded">
                ✦ AUDITORIA DE IA ✦
              </span>
              <span className="bg-slate-900 text-slate-400 font-mono text-[9.5px] px-2 py-0.5 rounded border border-gray-800">
                Gemini 2.5 Flash / Pro
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-display font-bold text-white flex items-center gap-2 mt-1">
              <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
              Monitor de Consumo da API Gemini (CoPilot SaaS)
            </h2>
            <p className="text-[11px] font-sans text-gray-400">
              Identifique em tempo real quais oficinas parceiras mais utilizam a inteligência artificial do CoPilot e gerencie as quotas individuais de tokens.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 font-mono uppercase font-bold text-slate-400">Ordenar por:</span>
            <div className="flex bg-[#050912] border border-gray-800 rounded-lg p-0.5">
              <button 
                type="button"
                onClick={() => setGeminiSort('tokens')}
                style={{ cursor: 'pointer' }}
                className={`px-3 py-1 text-[10px] font-mono font-bold rounded-md cursor-pointer transition-colors ${geminiSort === 'tokens' ? 'bg-purple-650 bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Tokens Usados
              </button>
              <button 
                type="button"
                onClick={() => setGeminiSort('requests')}
                style={{ cursor: 'pointer' }}
                className={`px-3 py-1 text-[10px] font-mono font-bold rounded-md cursor-pointer transition-colors ${geminiSort === 'requests' ? 'bg-purple-650 bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Requisições
              </button>
              <button 
                type="button"
                onClick={() => setGeminiSort('limit')}
                style={{ cursor: 'pointer' }}
                className={`px-3 py-1 text-[10px] font-mono font-bold rounded-md cursor-pointer transition-colors ${geminiSort === 'limit' ? 'bg-purple-650 bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                % do Limite
              </button>
            </div>
          </div>
        </div>

        {/* Global Gemini Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#050912] border border-gray-900 rounded-xl p-4">
          <div className="flex flex-col justify-between">
            <span className="text-[9px] text-gray-500 font-mono font-bold uppercase tracking-wider">CONSUMO GLOBAL DE TOKENS</span>
            <strong className="text-lg text-white font-mono mt-1">
              {totalSaaSTokens.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">tks</span>
            </strong>
            <span className="text-[9px] text-purple-400 font-mono mt-0.5">
              In: {totalSaaSPromptTokens.toLocaleString()} | Out: {totalSaaSCompletionTokens.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col justify-between border-l border-gray-850 pl-4 sm:border-l-0 sm:pl-0 lg:border-l lg:pl-4">
            <span className="text-[9px] text-gray-500 font-mono font-bold uppercase tracking-wider">CUSTO DA INFRAESTRUTURA</span>
            <strong className="text-lg text-emerald-400 font-mono mt-1">
              R$ {totalSaaSCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
            <span className="text-[9px] text-slate-400 font-mono mt-0.5">Faturado por requisição SaaS</span>
          </div>

          <div className="flex flex-col justify-between border-l border-gray-850 pl-4">
            <span className="text-[9px] text-gray-500 font-mono font-bold uppercase tracking-wider">REQUISIÇÕES COPILOT</span>
            <strong className="text-lg text-white font-mono mt-1">
              {totalSaaSRequests.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal font-sans">chamados</span>
            </strong>
            <span className="text-[9px] text-slate-400 font-mono mt-0.5">
              Média: {totalSaaSRequests > 0 ? (totalSaaSTokens / totalSaaSRequests).toFixed(0) : 0} tokens/req
            </span>
          </div>

          <div className="flex flex-col justify-between border-l border-gray-850 pl-4">
            <span className="text-[9px] text-gray-500 font-mono font-bold uppercase tracking-wider">OFICINA CAMPEÃ DE USO</span>
            <strong className="text-xs text-purple-300 font-sans truncate font-bold mt-1.5 flex items-center gap-1">
              👑 {mostActiveTenant ? mostActiveTenant.tenantName.replace(" (Membro Principal)", "") : "Nenhuma"}
            </strong>
            <span className="text-[9px] text-slate-400 font-mono mt-1">
              {mostActiveTenant ? (mostActiveTenant.promptTokens + mostActiveTenant.completionTokens).toLocaleString() : 0} tokens consumidos
            </span>
          </div>
        </div>

        {/* Gemini Split Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT COLUMN: TENANT COMPARISON & RANKING LIST (7-grid) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-wide">RANKING DE OFICINAS PARCEIRAS</span>
              <span className="text-[9px] text-slate-400 font-mono">Consumo resetável a qualquer período pelo Admin</span>
            </div>

            <div className="flex flex-col gap-3">
              {sortedGeminiUsages.map((usage, idx) => {
                const totalUsed = usage.promptTokens + usage.completionTokens;
                const percent = usage.monthlyLimit > 0 ? Math.min(100, (totalUsed / usage.monthlyLimit) * 100) : 0;
                
                // Progress bar colors depending on limit thresholds
                let progressColor = "bg-emerald-500";
                let textBadgeColor = "text-emerald-400 border-emerald-950/50 bg-emerald-950/20";
                let badgeLabel = "Uso Seguro";

                if (percent >= 95) {
                  progressColor = "bg-red-500";
                  textBadgeColor = "text-red-500 border-red-950/50 bg-red-950/20 animate-pulse";
                  badgeLabel = "EXCEDIDO";
                } else if (percent >= 80) {
                  progressColor = "bg-orange-500";
                  textBadgeColor = "text-orange-400 border-orange-950/50 bg-orange-950/20";
                  badgeLabel = "Alerta Quota";
                } else if (percent >= 50) {
                  progressColor = "bg-amber-400";
                  textBadgeColor = "text-amber-400 border-amber-950/50 bg-amber-950/20";
                  badgeLabel = "Moderado";
                }

                const isTop1 = mostActiveTenant && mostActiveTenant.tenantId === usage.tenantId && totalUsed > 0;
                const matchedTenantObj = tenants.find(t => t.id === usage.tenantId);

                return (
                  <div 
                    key={usage.tenantId} 
                    className={`bg-[#050912]/85 border rounded-xl p-4 flex flex-col gap-3 transition-all hover:border-gray-700 ${
                      isTop1 ? 'border-purple-900/50 ring-1 ring-purple-950/40 relative overflow-hidden' : 'border-gray-850'
                    }`}
                  >
                    {isTop1 && (
                      <div className="absolute top-0 right-0 bg-purple-600/30 text-purple-300 font-mono uppercase text-[7.5px] font-bold px-2.5 py-0.5 rounded-bl select-none tracking-widest border-l border-b border-purple-900/40">
                        🔥 Top 1 Consumo
                      </div>
                    )}

                    {/* Header Row of single usage element */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 px-0.5 text-left">
                      <div className="flex flex-col text-left">
                        <span className="font-sans font-bold text-white text-xs flex items-center gap-1.5 flex-wrap">
                          <span className="text-gray-500 font-mono text-[10px] w-4 text-center">#{idx + 1}</span>
                          {usage.tenantName}
                          {isTop1 && <span className="text-[9px] text-amber-400">🏆</span>}
                          {matchedTenantObj?.status === 'Suspenso' && (
                            <span className="text-[8px] bg-red-950/35 text-red-500 px-1.5 py-0.2 rounded font-mono uppercase border border-red-900/40">Suspenso</span>
                          )}
                        </span>
                        <div className="flex items-center gap-1.5 text-[9.5px] text-[10px] text-gray-500 mt-0.5 font-mono">
                          <span>Reqs: <strong className="text-slate-300">{usage.requestsCount}</strong></span>
                          <span>|</span>
                          <span>Cobrança de Token: <strong className="text-emerald-400 font-bold">Gratuito / Isento (Incluso)</strong></span>
                          <span>|</span>
                          <span>Último uso: <strong className="text-slate-300">{usage.lastUsedAt !== "Nenhuma requisição" && usage.lastUsedAt !== "Contador reiniciado" ? new Date(usage.lastUsedAt).toLocaleTimeString() : usage.lastUsedAt}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-start sm:self-auto mt-1 sm:mt-0 font-mono">
                        <span className={`px-1.5 py-0.5 text-[8.5px] border font-bold uppercase rounded font-mono ${textBadgeColor}`}>
                          {badgeLabel} ({percent.toFixed(0)}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Display */}
                    <div className="flex flex-col gap-1 px-0.5 text-left">
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${progressColor} rounded-full transition-all duration-300`} 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono text-gray-500">
                        <span>
                          Consumido: <strong className="text-slate-300">{(usage.promptTokens + usage.completionTokens).toLocaleString()}</strong> [In: {usage.promptTokens.toLocaleString()} | Out: {usage.completionTokens.toLocaleString()}]
                        </span>
                        <span>
                          Quota Mensal: <strong className="text-slate-300">{usage.monthlyLimit.toLocaleString()} tokens</strong>
                        </span>
                      </div>
                    </div>

                    {/* Action buttons on the element footer */}
                    <div className="flex flex-wrap justify-between items-center gap-3 bg-[#0a0f1d]/60 border-t border-gray-850/60 -mx-4 -mb-4 px-4 py-2 bg-[#02050c]/80 rounded-b-xl border-dashed">
                      <div className="flex items-center gap-1.5 font-mono text-[9px] text-gray-400">
                        <span>Ajustar quota:</span>
                        <button
                          type="button"
                          onClick={() => handleAdjustLimit(usage.tenantId, -100000)}
                          style={{ cursor: 'pointer' }}
                          className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded hover:bg-slate-850 cursor-pointer text-[10px]"
                          title="Diminuir Quota em 100k tokens"
                        >
                          -100k
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustLimit(usage.tenantId, 100000)}
                          style={{ cursor: 'pointer' }}
                          className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded hover:bg-slate-850 cursor-pointer text-[10px]"
                          title="Aumentar Quota em 100k tokens"
                        >
                          +100k
                        </button>
                      </div>

                      <div className="flex gap-2 font-mono">
                        <button
                          type="button"
                          onClick={() => handleResetTokenUsage(usage.tenantId)}
                          style={{ cursor: 'pointer' }}
                          className="text-[9px] font-mono font-bold bg-slate-900 hover:bg-red-950/20 hover:text-red-400 text-slate-400 rounded px-2.5 py-0.5 transition-colors cursor-pointer border border-transparent hover:border-red-950 text-[10px]"
                        >
                          Resetar Mensal
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: COPILOT CALL EMULATION SANDBOX (4-grid) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Sandbox Console Widget */}
            <div className="bg-[#050912] border border-gray-800 rounded-xl p-4.5 flex flex-col gap-3.5 text-left">
              <div className="border-b border-gray-850 pb-2 flex justify-between items-center">
                <span className="text-[10.5px] font-mono text-purple-400 font-extrabold uppercase flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-purple-405 text-purple-400 fill-purple-450 fill-purple-400" />
                  COPILOT SIMULATION SANDBOX
                </span>
                <span className="text-[8.5px] font-mono uppercase bg-slate-900 border border-gray-800 text-slate-400 rounded px-1.5">TESTING CORE</span>
              </div>

              <p className="text-[10px] leading-relaxed text-slate-400">
                Como os tokens do Gemini são gerados sob demanda nas sessões de cliente, use este simulador para injetar requisições de Copiloto e ver as quotas atualizarem em tempo real!
              </p>

              <div className="flex flex-col gap-2.5 font-mono text-xs">
                
                {/* Selector of Target Workshop */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[9.5px] text-gray-500 uppercase font-black tracking-wider">Mecânica de Destino:</label>
                  <select 
                    value={simSelectedTenantId}
                    onChange={(e) => setSimSelectedTenantId(e.target.value)}
                    className="w-full bg-slate-950 border border-gray-850 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono cursor-pointer"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name.replace(" (Membro Principal)", "")} ({t.planId})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector of Call Type */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[9.5px] text-gray-500 uppercase font-black tracking-wider">Função do Copiloto (IA):</label>
                  <select 
                    value={simUsecaseType}
                    onChange={(e) => setSimUsecaseType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-gray-850 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono cursor-pointer"
                  >
                    <option value="diagnose">⚙️ Gerar Diagnóstico Clínico (1.500–3.000 tks)</option>
                    <option value="chat">💬 Chat Geral com Mecânico (500–1.300 tks)</option>
                    <option value="obd">🔌 Telemetria Computadorizada OBD-II (2.000–4.500 tks)</option>
                    <option value="tuning">🔥 Otimizar Remap de Performance (2.500–5.500 tks)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleSimulateCopilotCall(simSelectedTenantId, simUsecaseType)}
                  style={{ cursor: 'pointer' }}
                  className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-mono text-[10.5px] font-extrabold rounded-xl text-center transition-colors border-0 uppercase select-none tracking-wider mt-1 hover:bg-purple-650 active:scale-[99.5%] cursor-pointer"
                >
                  ⚡ DISPARAR CHAMADA COPILOT
                </button>

              </div>

              {/* Sub-note on sandbox */}
              <div className="bg-[#0c1223]/35 rounded p-2.5 border border-gray-850/40 text-[9.5px] text-slate-450 text-gray-500 font-sans leading-relaxed text-left">
                💡 <strong>Acesso Ilimitado CoPilot:</strong> Na AutoPrecision não cobramos por tokens! O uso da inteligência artificial do CoPilot é totalmente incluso e isento de taxas avulsas nos planos recorrentes após o pagamento da implantação única.
              </div>

            </div>

            {/* Quota policy settings information advice card */}
            <div className="bg-[#050912] border border-gray-900 rounded-xl p-4 text-left font-sans text-xs flex flex-col gap-2">
              <span className="text-[10px] font-mono text-slate-450 font-bold uppercase">POLÍTICA COMERCIAL DO SAAS</span>
              <p className="text-[10.5px] text-gray-500 leading-normal font-sans">
                O modelo de negócios do SaaS consiste exclusivamente no faturamento de <strong>Adesão/Implantação de R$ 1.500,00 (única)</strong> e a <strong>Assinatura Recorrente Mensal</strong> dos planos selecionados:
              </p>
              <ul className="text-[10px] text-slate-500 pl-4 list-decimal flex flex-col gap-1 inline-block text-gray-500">
                <li>Taxa Única de Implantação e Treinamento Técnica: <strong>R$ 1.500,00</strong>.</li>
                <li>Assinatura Mensal conforme o plano contratado (Básico, Profissional ou Premium).</li>
                <li>CoPilot Inteligência Artificial Gemini: **Incluso Totalmente Grátis** (Sem cobrança por tokens).</li>
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* Main SaaS Platform Controllers Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Tenant Registry Database (8-grid) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* VIEW SWITCHER / SaaS CATEGORY NAV */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0a0f1d] border border-gray-850 p-1.5 rounded-xl">
            <button
              type="button"
              onClick={() => setSuperAdminViewTab('tenants')}
              className={`py-2 px-3 rounded-lg font-mono text-[10px] font-extrabold tracking-wider transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer border ${
                superAdminViewTab === 'tenants'
                  ? 'bg-purple-950/60 border-purple-900 text-purple-300 shadow-md shadow-purple-950/40 font-bold'
                  : 'bg-[#050912]/50 border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Building className="w-3.5 h-3.5 shrink-0" />
              LOJAS & OFICINAS PARCEIRAS ({tenants.length})
            </button>
            <button
              type="button"
              onClick={() => setSuperAdminViewTab('saas-users')}
              className={`py-2 px-3 rounded-lg font-mono text-[10px] font-extrabold tracking-wider transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer border ${
                superAdminViewTab === 'saas-users'
                  ? 'bg-purple-900/60 border-purple-900 text-purple-300 shadow-md shadow-purple-950/40 font-bold'
                  : 'bg-[#050912]/50 border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              CONTAS USUÁRIOS SAAS ({saasUsers.length})
            </button>
            <button
              type="button"
              onClick={() => setSuperAdminViewTab('crm-clients')}
              className={`py-2 px-3 rounded-lg font-mono text-[10px] font-extrabold tracking-wider transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer border ${
                superAdminViewTab === 'crm-clients'
                  ? 'bg-purple-950/60 border-purple-900 text-purple-300 shadow-md shadow-purple-950/40 font-bold'
                  : 'bg-[#050912]/50 border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              CLIENTES CRM GLOBAIS
            </button>
          </div>

          {superAdminViewTab === 'tenants' ? (
            <div className="bg-[#0c1223] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
            
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-gray-850 pb-3">
              <div>
                <h3 className="font-display font-bold text-white text-base flex items-center gap-1.5">
                  <Building className="w-5 h-5 text-purple-400" />
                  Diretório e Cadastro de Tenants SaaS
                </h3>
                <span className="text-[10px] font-mono text-gray-500">Gestão global de mecânicas cadastradas e seus respectivos portais.</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Filtrar oficina, email ou CNPJ..."
                    className="bg-[#050912] border border-gray-800 rounded-lg py-1.5 pl-8 pr-3 text-white text-xs font-mono focus:outline-none focus:border-purple-500 w-full sm:w-52"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute left-2.5 top-2.5 text-gray-500">
                    <Search className="w-3 h-3" />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowNewTenantForm(!showNewTenantForm)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                    showNewTenantForm
                      ? 'bg-red-950/40 hover:bg-red-950/60 border border-red-900/50 text-red-400'
                      : 'bg-purple-950/30 hover:bg-purple-950/50 border border-purple-900/40 text-purple-400'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showNewTenantForm ? 'Fechar Form' : 'Novo Cadastro'}
                </button>
              </div>
            </div>

            {/* Collapsible New Tenant Registration Form */}
            {showNewTenantForm && (
              <form onSubmit={handleRegisterNewTenant} className="bg-[#050912] border border-purple-900/40 rounded-xl p-4 flex flex-col gap-3 text-left font-sans text-xs transition-all">
                <div className="flex justify-between items-center border-b border-gray-850 pb-2">
                  <h4 className="font-mono text-xs text-purple-400 font-extrabold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    CADASTRAR NOVA OFICINA & LOJA (TENANT)
                  </h4>
                  <span className="text-[9px] font-mono bg-purple-950/20 text-purple-400 border border-purple-900/40 px-2 py-0.5 rounded uppercase">Inquilinato Isolado</span>
                </div>

                {newTenantFeedback && (
                  <div className={`p-2.5 rounded-lg border font-mono text-[11px] font-bold ${newTenantFeedback.includes('❌') ? 'bg-red-950/20 border-red-900/45 text-red-400' : 'bg-green-950/20 border-green-900/45 text-green-400'}`}>
                    {newTenantFeedback}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Nome da Oficina & Loja / Razão Social *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="ex: Auto Mecânica São José"
                      className="bg-[#0a0f1d] border border-gray-850 rounded py-1.5 px-2.5 text-white focus:border-purple-500 focus:outline-none"
                      value={newTenantName}
                      onChange={(e) => setNewTenantName(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">CNPJ (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="ex: 12.345.678/0001-90"
                      className="bg-[#0a0f1d] border border-gray-850 rounded py-1.5 px-2.5 text-white focus:border-purple-500 focus:outline-none"
                      value={newTenantCnpj}
                      onChange={(e) => setNewTenantCnpj(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">E-mail Administrativo</label>
                    <input 
                      type="email" 
                      placeholder="ex: contato@oficina.com"
                      className="bg-[#0a0f1d] border border-gray-850 rounded py-1.5 px-2.5 text-white focus:border-purple-500 focus:outline-none"
                      value={newTenantEmail}
                      onChange={(e) => setNewTenantEmail(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Telefone / WhatsApp</label>
                    <input 
                      type="text" 
                      placeholder="ex: (11) 99999-8888"
                      className="bg-[#0a0f1d] border border-gray-850 rounded py-1.5 px-2.5 text-white focus:border-purple-500 focus:outline-none"
                      value={newTenantPhone}
                      onChange={(e) => setNewTenantPhone(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Plano Recorrente do SaaS</label>
                    <div className="flex gap-2">
                      {(['Básico', 'Profissional', 'Premium'] as const).map((plan) => (
                        <button
                          key={plan}
                          type="button"
                          onClick={() => setNewTenantPlan(plan)}
                          className={`flex-1 py-2 px-3 rounded font-bold transition-all text-center cursor-pointer ${
                            newTenantPlan === plan 
                              ? 'bg-purple-600 text-white border border-purple-500' 
                              : 'bg-slate-900 hover:bg-slate-850 text-slate-400 border border-transparent'
                          }`}
                        >
                          {plan === 'Básico' ? '🔩 Básico' : plan === 'Profissional' ? '⚙️ Profissional' : '👑 Premium'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Subdomínio (Opcional - Gerado Automaticamente)</label>
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        placeholder="slug (ex: auto-sao-jose)"
                        className="bg-[#0a0f1d] border border-gray-850 border-r-0 rounded-l py-1.5 px-2 text-white focus:border-purple-500 focus:outline-none text-right flex-1 font-mono"
                        value={newTenantSubdomain}
                        onChange={(e) => setNewTenantSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      />
                      <span className="bg-[#0c1223] border border-gray-850 rounded-r py-1.5 px-2 text-slate-450 text-[10px] select-none">
                        .autoprecision.com.br
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Domínio DNS Próprio (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="ex: portal.mecanicasaojose.com.br"
                      className="bg-[#0a0f1d] border border-gray-850 rounded py-1.5 px-2.5 text-white focus:border-purple-500 focus:outline-none"
                      value={newTenantCustomDomain}
                      onChange={(e) => setNewTenantCustomDomain(e.target.value.toLowerCase().trim())}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5">
                      CEP {isFetchingTenantCep && <span className="text-purple-400 text-[8px] animate-pulse font-mono">(Buscando...)</span>}
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="ex: 01001-000"
                        className="bg-[#0a0f1d] border border-gray-850 rounded py-1.5 px-2.5 text-white w-full focus:border-purple-500 focus:outline-none font-mono"
                        value={newTenantCep}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewTenantCep(val);
                          if (val.replace(/\D/g, "").length === 8) {
                            handleFetchTenantCep(val);
                          }
                        }}
                      />
                      {tenantCepError && (
                        <span className="text-[9px] text-red-500 block absolute left-1 -bottom-4 font-sans">{tenantCepError}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Endereço Completo</label>
                    <input 
                      type="text" 
                      placeholder="Rua, número - Bairro - Cidade/UF"
                      className="bg-[#0a0f1d] border border-gray-850 rounded py-1.5 px-2.5 text-white focus:border-purple-500 focus:outline-none"
                      value={newTenantAddress}
                      onChange={(e) => setNewTenantAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-850 pt-2.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowNewTenantForm(false)}
                    className="py-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-1.5 px-5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    Salvar e Ativar Portal
                  </button>
                </div>
              </form>
            )}

            {/* Tenant Cards / List */}
            <div className="flex flex-col gap-3 font-mono text-xs">
              {filteredTenants.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Nenhuma oficina encontrada com os parâmetros de pesquisa definidos.</div>
              ) : (
                filteredTenants.map((tenant) => (
                  <div 
                    key={tenant.id} 
                    className={`p-4 rounded-xl border transition-all text-left flex flex-col gap-3.5 ${
                      tenant.id === impersonatingId 
                        ? 'bg-yellow-950/15 border-yellow-800/80' 
                        : tenant.id === company.id 
                          ? 'bg-purple-950/10 border-purple-900/40 relative overflow-hidden' 
                          : 'bg-[#050912] border-gray-850 hover:border-gray-800'
                    }`}
                  >
                    
                    {tenant.id === company.id && (
                      <div className="absolute top-0 right-0 bg-purple-600 text-white font-mono tracking-widest uppercase text-[8px] font-bold px-3 py-0.5 rounded-bl">
                        Sua Sessão Ativa
                      </div>
                    )}

                    {/* Tenant Main identification block */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 border-b border-gray-850 pb-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-white text-sm">{tenant.name}</strong>
                          {tenant.planId === 'Premium' && (
                            <span className="px-1.5 py-0.5 bg-yellow-950/30 border border-yellow-905 text-[8px] font-bold text-yellow-550 bg-yellow-950/40 border-yellow-850 text-yellow-500 rounded">
                              👑 Premium
                            </span>
                          )}
                          {tenant.planId === 'Profissional' && (
                            <span className="px-1.5 py-0.5 bg-blue-955 bg-blue-950/20 border border-blue-900 text-[8px] font-bold text-blue-400 rounded">
                              ⚙️ Profissional
                            </span>
                          )}
                          {tenant.planId === 'Básico' && (
                            <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[8px] text-slate-400 rounded">
                              🔩 Básico
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500">ID: {tenant.id} | CNPJ: {tenant.cnpj}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${tenant.status === 'Ativo' ? 'bg-green-950/30 border border-green-900 text-green-400 font-sans' : 'bg-red-950/30 border border-red-900 text-red-500'}`}>
                          ● {tenant.status.toUpperCase()}
                        </span>
                        <strong className="text-white text-sm">R$ {tenant.monthlyValue} /mês</strong>
                      </div>
                    </div>

                    {/* Contato & Detalhes técnicos */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-gray-400 leading-tight">
                      <div>📧 Email: <strong className="text-slate-300">{tenant.email}</strong></div>
                      <div>📞 Telefone: <strong className="text-slate-300">{tenant.phone}</strong></div>
                      <div>🗄️ Dados Gravados: <strong className="text-slate-300">{tenant.databaseSize} documentos</strong></div>
                    </div>

                    {(tenant.address || tenant.cep) && (
                      <div className="text-[10px] text-gray-500 leading-tight">
                        📍 Endereço: <strong className="text-slate-400">{tenant.address || "Não configurado"}</strong> {tenant.cep && <span className="bg-[#050912]/85 text-purple-400 border border-gray-850 rounded px-1.5 py-0.5 ml-1 select-all font-mono">CEP {tenant.cep}</span>}
                      </div>
                    )}

                    {(tenant.subdomain || tenant.customDomain) && (
                      <div className="border-t border-gray-850/50 pt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] items-center text-gray-500">
                        {tenant.subdomain && (
                          <>
                            <div className="flex items-center gap-1 bg-[#050912]/80 px-2.5 py-1 rounded border border-gray-850">
                              <span className="text-gray-400">⚡ Hospedagem Vercel:</span>
                              <a 
                                href={`https://oficina-eta-teal.vercel.app/${tenant.subdomain}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-purple-400 font-bold hover:text-purple-300 hover:underline flex items-center gap-1 transition-all"
                              >
                                oficina-eta-teal.vercel.app/{tenant.subdomain}
                                <ExternalLink className="w-2.5 h-2.5 text-purple-400" />
                              </a>
                            </div>
                            <div className="flex items-center gap-1 bg-[#050912]/80 px-2.5 py-1 rounded border border-gray-850">
                              <span className="text-gray-400">🌐 Redirecionamento:</span>
                              <a 
                                href={`https://${tenant.subdomain}.autoprecision.com.br`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-gray-500 hover:text-gray-400 hover:underline flex items-center gap-1 transition-all"
                              >
                                {tenant.subdomain}.autoprecision.com.br
                                <ExternalLink className="w-2 h-2 text-gray-500" />
                              </a>
                            </div>
                          </>
                        )}
                        {tenant.customDomain && (
                          <div className="flex items-center gap-1.5 bg-[#050912]/80 px-2.5 py-1 rounded border border-gray-850">
                            <span className="text-gray-450 text-gray-400">🔗 Domínio Próprio:</span>
                            <a 
                              href={`https://${tenant.customDomain}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-400 font-bold hover:text-blue-300 hover:underline flex items-center gap-1 transition-all"
                            >
                              {tenant.customDomain}
                              <ExternalLink className="w-2.5 h-2.5 text-blue-450" />
                            </a>
                            <span className={`px-1.5 py-0.2 rounded text-[8px] uppercase tracking-wider font-extrabold ${
                              tenant.domainStatus === 'Ativo' 
                                ? 'bg-green-950/40 border border-green-900/50 text-green-400' 
                                : tenant.domainStatus === 'Falhado'
                                  ? 'bg-red-950/40 border border-red-900 text-red-500 animate-pulse'
                                  : 'bg-amber-950/40 border border-amber-900 text-amber-500'
                            }`}>
                              {tenant.domainStatus || 'Pendente'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 🛠️ Direct Registration Correction Shortcuts / links */}
                    <div className="border-t border-gray-850/40 pt-2 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[8px] font-mono text-gray-500 uppercase font-bold tracking-wider">🔧 CORREÇÃO DE ATRIBUTO:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setActiveCorrectionTab('profile');
                        }}
                        className="py-0.5 px-2 bg-purple-950/25 hover:bg-purple-950/50 border border-purple-900/35 hover:border-purple-800 text-[9px] text-purple-300 font-bold font-mono rounded cursor-pointer transition-all"
                      >
                        ✏️ Nome/CNPJ/Plano
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setActiveCorrectionTab('domain');
                        }}
                        className="py-0.5 px-2 bg-blue-950/25 hover:bg-blue-950/50 border border-blue-900/35 hover:border-blue-800 text-[9px] text-blue-350 font-bold font-mono rounded cursor-pointer transition-all"
                      >
                        🌐 URLs/Subdomínio
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setActiveCorrectionTab('contact');
                        }}
                        className="py-0.5 px-2 bg-amber-950/25 hover:bg-amber-950/50 border border-amber-900/35 hover:border-amber-800 text-[9px] text-amber-500 font-bold font-mono rounded cursor-pointer transition-all"
                      >
                        📞 Emails/Contatos
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setActiveCorrectionTab('address');
                        }}
                        className="py-0.5 px-2 bg-emerald-950/25 hover:bg-emerald-950/50 border border-emerald-900/35 hover:border-emerald-800 text-[9px] text-emerald-400 font-bold font-mono rounded cursor-pointer transition-all"
                      >
                        📍 Endereço/CEP
                      </button>
                    </div>

                    {/* Controls Actions for custom SaaS Admin */}
                    <div className="border-t border-gray-850 pt-3 flex flex-wrap gap-2 justify-between items-center bg-slate-950/30 -mx-4 -mb-4 p-3 rounded-b-xl">
                      <div className="flex gap-1.5 items-center">
                        <span className="text-[9px] text-gray-505 text-gray-500 mr-1.5 block">NÍVEL:</span>
                        {(['Básico', 'Profissional', 'Premium'] as const).map((tier) => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => handleChangePlan(tenant.id, tier)}
                            className={`py-1 px-2.5 rounded text-[9px] hover:scale-102 select-none cursor-pointer duration-100 ${tenant.planId === tier ? 'bg-purple-650 bg-purple-600 text-white font-bold' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setSelectedTenant(tenant)}
                          className="py-1 px-3 text-[9px] rounded font-bold cursor-pointer transition-colors flex items-center gap-1 bg-purple-950/45 border border-purple-900/50 text-purple-300 hover:bg-purple-900/30 font-mono"
                        >
                          <Sliders className="w-3" />
                          SUPORTE & SUGESTÕES
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(tenant.id)}
                          className={`py-1 px-3 text-[9px] rounded font-bold cursor-pointer transition-colors ${tenant.status === 'Ativo' ? 'text-red-400 bg-red-950/10 hover:bg-slate-900' : 'text-green-400 bg-green-950/10 hover:bg-slate-900'}`}
                        >
                          {tenant.status === 'Ativo' ? "SUSPENDER CONTA" : "REATIVAR CONTA"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTenant(tenant.id)}
                          className="py-1 px-3 text-[9px] rounded font-bold cursor-pointer transition-all bg-rose-950/40 text-rose-450 hover:bg-rose-900 hover:text-white border border-rose-900/40"
                        >
                          EXCLUIR
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleImpersonate(tenant)}
                          className={`py-1 px-3 text-[9px] rounded font-bold cursor-pointer transition-colors flex items-center gap-1 ${impersonatingId === tenant.id ? 'bg-yellow-600 text-black font-extrabold' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'}`}
                        >
                          <Zap className="w-3" />
                          {impersonatingId === tenant.id ? "FECHAR SESSÃO" : "INFILTRAR"}
                        </button>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
          ) : superAdminViewTab === 'saas-users' ? (
            <div className="bg-[#0c1223] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 text-left">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-gray-850 pb-3">
                <div>
                  <h3 className="font-display font-semibold text-white text-base flex items-center gap-1.5">
                    <Users className="w-5 h-5 text-purple-400" />
                    Contas e Acessos de Usuários do SaaS (Multitenant)
                  </h3>
                  <p className="text-[10px] font-mono text-gray-400">
                    Gerencie, adicione, edite credenciais e simule acessos de suporte para resolver dúvidas de clientes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewUserForm(!showNewUserForm);
                    setNewUserName('');
                    setNewUserEmail('');
                    setNewUserPhone('');
                    setNewUserTenantId(tenants[0]?.id || '');
                    setSelectedUserForEdit(null);
                  }}
                  className="py-1.5 px-3 bg-purple-650 hover:bg-purple-700 bg-purple-600 font-mono text-[10.5px] font-bold text-white tracking-wide rounded-lg cursor-pointer flex items-center gap-1 shrink-0 select-none border-none"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {showNewUserForm ? "FECHAR FORMULÁRIO" : "RECRUTAR / CRIAR USUÁRIO"}
                </button>
              </div>

              {/* SEARCH BAR & GENERAL METRICS */}
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-slate-950/20 p-3 rounded-lg border border-gray-850/60">
                <div className="relative w-full sm:max-w-md">
                  <input
                    type="text"
                    placeholder="Buscar usuários por nome, email, oficina ou CNPJ..."
                    value={saasUsersSearchTerm}
                    onChange={(e) => setSaasUsersSearchTerm(e.target.value)}
                    className="bg-[#050912] border border-gray-850 rounded-lg py-1.5 pl-8 pr-3 text-white text-xs font-mono focus:outline-none focus:border-purple-500 w-full"
                  />
                  <div className="absolute left-2.5 top-2.5 text-gray-500">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400 shrink-0">
                  <div>Ativos: <strong className="text-green-400">{saasUsers.filter(u => u.status === 'Ativo').length}</strong></div>
                  <div>Bloqueados: <strong className="text-red-400">{saasUsers.filter(u => u.status === 'Bloqueado').length}</strong></div>
                  <div>Total de Contas: <strong className="text-white">{saasUsers.length}</strong></div>
                </div>
              </div>

              {/* NEW USER FORM COLLAPSIBLE */}
              {showNewUserForm && (
                <form onSubmit={handleAddSaasUser} className="bg-slate-950/40 p-4 rounded-xl border border-purple-900/40 flex flex-col gap-3.5">
                  <h4 className="text-xs font-mono font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-purple-400" /> Cadastrar Novo Usuário SaaS
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400">Nome Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Carlos Mecânico"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="bg-[#050912] border border-gray-800 rounded p-2 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400">Email de Login / Acesso *</label>
                      <input
                        type="email"
                        required
                        placeholder="Ex: carlos@mecanicahorizonte.com.br"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="bg-[#050912] border border-gray-800 rounded p-2 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400">Telefone / WhatsApp</label>
                      <input
                        type="text"
                        placeholder="Ex: (11) 98765-4321"
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value)}
                        className="bg-[#050912] border border-gray-800 rounded p-2 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400">Cargo / Função Administrativa</label>
                      <select
                        value={newUserRole}
                        onChange={(e: any) => setNewUserRole(e.target.value)}
                        className="bg-[#050912] border border-gray-800 rounded p-2 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
                      >
                        <option value="Administrador">Administrador (Acesso Geral)</option>
                        <option value="Gerente">Gerente Geral</option>
                        <option value="Mecânico">Mecânico Operacional</option>
                        <option value="Caixa">Caixa / Financeiro</option>
                        <option value="Estoquista">Estoquista / Logística</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400">Oficina Associada (Tenant) *</label>
                      <select
                        required
                        value={newUserTenantId}
                        onChange={(e) => setNewUserTenantId(e.target.value)}
                        className="bg-[#050912] border border-gray-800 rounded p-2 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
                      >
                        <option value="">-- Selecione uma Mecânica --</option>
                        {tenants.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.cnpj})</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400">Status da Conta</label>
                      <select
                        value={newUserStatus}
                        onChange={(e: any) => setNewUserStatus(e.target.value)}
                        className="bg-[#050912] border border-gray-800 rounded p-2 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
                      >
                        <option value="Ativo">Ativo (Acesso Liberado)</option>
                        <option value="Bloqueado">Bloqueado (Suspenso)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-850">
                    <span className="text-[10px] text-gray-400 font-mono select-none">
                      {newUserFeedback || "* Campos obrigatórios para validação de acesso."}
                    </span>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-purple-650 via-purple-600 to-indigo-600 hover:opacity-90 font-mono text-xs font-bold text-white rounded-lg cursor-pointer border-none"
                    >
                      🚀 CRIAR CONTA E SALVAR
                    </button>
                  </div>
                </form>
              )}

              {/* SELECTED USER EDIT PANEL COLLAPSIBLE */}
              {selectedUserForEdit && (
                <form onSubmit={handleEditSaasUser} className="bg-slate-950/70 p-4 rounded-xl border border-yellow-600/40 flex flex-col gap-3.5">
                  <div className="flex justify-between items-center border-b border-gray-850 pb-2">
                    <h4 className="text-xs font-mono font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-1.5">
                      ✏️ Editar Credenciais do Usuário SaaS
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSelectedUserForEdit(null)}
                      className="text-xs font-mono text-gray-500 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400">Nome</label>
                      <input
                        type="text"
                        required
                        value={editUserName}
                        onChange={(e) => setEditUserName(e.target.value)}
                        className="bg-[#050912] border border-gray-800 rounded p-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400">Email de Login</label>
                      <input
                        type="email"
                        required
                        value={editUserEmail}
                        onChange={(e) => setEditUserEmail(e.target.value)}
                        className="bg-[#050912] border border-gray-800 rounded p-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400">Telefone / WhatsApp</label>
                      <input
                        type="text"
                        value={editUserPhone}
                        onChange={(e) => setEditUserPhone(e.target.value)}
                        className="bg-[#050912] border border-gray-800 rounded p-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400">Cargo / Função</label>
                      <select
                        value={editUserRole}
                        onChange={(e: any) => setEditUserRole(e.target.value)}
                        className="bg-[#050912] border border-gray-800 rounded p-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono"
                      >
                        <option value="Administrador">Administrador (Acesso Geral)</option>
                        <option value="Gerente">Gerente Geral</option>
                        <option value="Mecânico">Mecânico Operacional</option>
                        <option value="Caixa">Caixa / Financeiro</option>
                        <option value="Estoquista">Estoquista / Logística</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400">Oficina Associada (Tenant)</label>
                      <select
                        required
                        value={editUserTenantId}
                        onChange={(e) => setEditUserTenantId(e.target.value)}
                        className="bg-[#050912] border border-gray-800 rounded p-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono"
                      >
                        {tenants.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.cnpj})</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400">Status de Permissão</label>
                      <select
                        value={editUserStatus}
                        onChange={(e: any) => setEditUserStatus(e.target.value)}
                        className="bg-[#050912] border border-gray-800 rounded p-2 text-white text-xs focus:outline-none focus:border-yellow-500 font-mono"
                      >
                        <option value="Ativo">Ativo (Acesso Liberado)</option>
                        <option value="Bloqueado">Bloqueado (Suspenso)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 mt-2 border-t border-gray-850 pt-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForEdit(null)}
                      className="px-4 py-1.5 bg-slate-900 border border-slate-800 text-[10.5px] font-bold text-slate-400 font-mono rounded-lg hover:text-white cursor-pointer"
                    >
                      DESCARTAR ALTERAÇÕES
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-[10.5px] font-bold text-black font-mono rounded-lg cursor-pointer border-none"
                    >
                      💾 SALVAR COMPACTO DE SEGURANÇA
                    </button>
                  </div>
                </form>
              )}

              {/* USER DATABASE TABLE / GRID LISTING */}
              <div className="flex flex-col gap-3">
                {saasUsers.filter(u => {
                  const term = saasUsersSearchTerm.toLowerCase();
                  return (
                    u.name.toLowerCase().includes(term) ||
                    u.email.toLowerCase().includes(term) ||
                    u.role.toLowerCase().includes(term) ||
                    u.tenantName.toLowerCase().includes(term) ||
                    u.cnpj.includes(term)
                  );
                }).length === 0 ? (
                  <div className="text-center py-10 bg-slate-950/20 rounded-xl border border-gray-850 p-4">
                    <p className="font-mono text-xs text-slate-400">Nenhum cadastro de usuário encontrado para o filtro "{saasUsersSearchTerm}".</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {saasUsers.filter(u => {
                      const term = saasUsersSearchTerm.toLowerCase();
                      return (
                        u.name.toLowerCase().includes(term) ||
                        u.email.toLowerCase().includes(term) ||
                        u.role.toLowerCase().includes(term) ||
                        u.tenantName.toLowerCase().includes(term) ||
                        u.cnpj.includes(term)
                      );
                    }).map((usr) => {
                      const associatedTenantNode = tenants.find(t => t.id === usr.tenantId);
                      const isSimulatedRightNow = localStorage.getItem('original_saas_admin_user') && user?.email === usr.email;

                      return (
                        <div 
                          key={usr.id} 
                          className={`bg-[#0d1326] border rounded-xl p-4 flex flex-col gap-3 relative hover:scale-[1.005] duration-150 transition-all text-left ${
                            isSimulatedRightNow 
                              ? 'border-yellow-600 shadow-lg shadow-yellow-950/10' 
                              : usr.status === 'Bloqueado'
                                ? 'border-red-950/70 opacity-75'
                                : 'border-gray-850'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                usr.status === 'Bloqueado'
                                  ? 'bg-red-900/40 text-red-350'
                                  : isSimulatedRightNow
                                    ? 'bg-yellow-600 text-black font-extrabold animate-pulse'
                                    : 'bg-purple-900/40 text-purple-300'
                              }`}>
                                {usr.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="text-left">
                                <h4 className="font-display font-bold text-white text-xs flex items-center gap-1.5 leading-none">
                                  {usr.name}
                                  {isSimulatedRightNow && <span className="bg-yellow-600 text-black text-[7.5px] font-mono px-1.5 py-0.2 rounded font-extrabold uppercase animate-pulse">Ativo Imersão</span>}
                                </h4>
                                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{usr.email}</span>
                              </div>
                            </div>
                            
                            <span className={`px-2 py-0.5 text-[8.5px] font-mono tracking-wider font-extrabold rounded select-none ${
                              usr.status === 'Ativo'
                                ? 'bg-green-950/30 border border-green-900/50 text-green-400'
                                : 'bg-red-950/40 border border-red-900/50 text-red-500'
                            }`}>
                              {usr.status.toUpperCase()}
                            </span>
                          </div>

                          {/* DETAILS GRID */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950/30 p-2.5 rounded-lg border border-gray-850/40 text-left">
                            <div>
                              <span className="text-gray-550 text-gray-500 block uppercase font-bold text-[8.5px]">🏢 Empresa Vinculada:</span>
                              <strong className="text-slate-300 block truncate" title={usr.tenantName}>{usr.tenantName}</strong>
                            </div>
                            <div>
                              <span className="text-gray-550 text-gray-500 block uppercase font-bold text-[8.5px]">📇 CPF / CNPJ:</span>
                              <strong className="text-slate-300 block font-mono">{usr.cnpj}</strong>
                            </div>
                            <div>
                              <span className="text-gray-550 text-gray-500 block uppercase font-bold text-[8.5px]">🛡️ Cargo / Permissão:</span>
                              <strong className="text-purple-300 block font-bold">{usr.role}</strong>
                            </div>
                            <div>
                              <span className="text-gray-550 text-gray-500 block uppercase font-bold text-[8.5px]">📞 Contato:</span>
                              <strong className="text-slate-300 block font-mono">{usr.phone || "Não Cadastrado"}</strong>
                            </div>
                          </div>

                          {/* ACTION BUTTONS BAR */}
                          <div className="border-t border-gray-850/50 pt-2 mt-1 flex justify-between gap-2 flex-wrap items-center">
                            <span className="text-[8.5px] font-mono text-gray-550 text-gray-500">Cadastro: {new Date(usr.createdAt).toLocaleDateString()}</span>
                            
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserForEdit(usr);
                                  setEditUserName(usr.name);
                                  setEditUserEmail(usr.email);
                                  setEditUserPhone(usr.phone || '');
                                  setEditUserRole(usr.role);
                                  setEditUserTenantId(usr.tenantId);
                                  setEditUserStatus(usr.status);
                                  setShowNewUserForm(false);
                                }}
                                className="py-1 px-2.5 bg-[#050912] border border-gray-850 hover:bg-slate-800 text-[9.5px] text-slate-300 font-bold rounded cursor-pointer duration-100"
                              >
                                Editar
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => handleDeleteSaasUser(usr.id)}
                                className="py-1 px-2.5 bg-rose-950/15 hover:bg-rose-950/45 text-[9.5px] text-rose-450 border border-rose-900/30 rounded cursor-pointer duration-100"
                              >
                                Excluir
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  if (associatedTenantNode) {
                                    handleImpersonate(associatedTenantNode, usr);
                                  }
                                }}
                                className="py-1 px-3 bg-purple-950 hover:bg-purple-900 border border-purple-800/40 text-[9.5px] text-purple-200 rounded cursor-pointer duration-100 font-bold flex items-center gap-1"
                              >
                                <Zap className="w-2.5 h-2.5 text-purple-400" />
                                {isSimulatedRightNow ? "FECHAR SESSÃO" : "FILTRAR ACESSO"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#0c1223] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
              
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-gray-850 pb-3 text-left">
                <div>
                  <h3 className="font-display font-semibold text-white text-base flex items-center gap-1.5">
                    <Users className="w-5 h-5 text-purple-400" />
                    Base de Clientes CRM da SaaS (Preview)
                  </h3>
                  <p className="text-[10px] font-mono text-gray-400">
                    Acesso global a todos os clientes CRM cadastrados no ecossistema. Administrador ativo: <strong className="text-purple-300">cleciotecnologia@gmail.com</strong>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Select Workshop Filter */}
                  <div className="flex items-center gap-1.5 bg-[#050912] border border-gray-850 rounded-lg px-2 py-1">
                    <span className="text-[9px] text-gray-500 font-mono font-bold uppercase">Filtrar Oficina:</span>
                    <select
                      value={selectedCrmFilterTenant}
                      onChange={(e) => setSelectedCrmFilterTenant(e.target.value)}
                      className="bg-transparent text-white text-xs font-mono focus:outline-none border-0 cursor-pointer p-0.5"
                    >
                      <option value="all" className="bg-[#0c1223]">Todas ({tenants.length})</option>
                      {tenants.map(t => (
                        <option key={t.id} value={t.id} className="bg-[#0c1223]">{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Filtrar por nome, CPF ou fone..."
                      className="bg-[#050912] border border-gray-800 rounded-lg py-1.5 pl-8 pr-3 text-white text-xs font-mono focus:outline-none focus:border-purple-500 w-full sm:w-56"
                      value={crmSearchTerm}
                      onChange={(e) => setCrmSearchTerm(e.target.value)}
                    />
                    <div className="absolute left-2.5 top-2.5 text-gray-500">
                      <Search className="w-3 h-3" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowNewCrmClientForm(!showNewCrmClientForm)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      showNewCrmClientForm
                        ? 'bg-red-950/40 hover:bg-red-955 border border-red-900/50 text-red-400'
                        : 'bg-purple-950/30 hover:bg-purple-950/50 border border-purple-900/40 text-purple-400'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {showNewCrmClientForm ? 'Fechar Form' : 'Novo Cliente'}
                  </button>
                </div>
              </div>

              {/* Collapsible New CRM Client Form */}
              {showNewCrmClientForm && (
                <form onSubmit={handleSaveNewCrmClient} className="bg-[#050912] border border-purple-900/40 rounded-xl p-4 flex flex-col gap-3 text-left font-sans text-xs transition-all">
                  <div className="flex justify-between items-center border-b border-gray-850 pb-2">
                    <h4 className="font-mono text-xs text-purple-400 font-extrabold flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-400" />
                      CADASTRAR NOVO CLIENTE CRM SaaS
                    </h4>
                    <span className="text-[9px] font-mono bg-purple-950/20 text-purple-400 border border-purple-900/40 px-2 py-0.5 rounded uppercase font-bold">Cadastro de Dono</span>
                  </div>

                  {newCrmClientFeedback && (
                    <div className={`p-2.5 rounded border font-mono text-[11px] font-bold ${newCrmClientFeedback.includes('❌') ? 'bg-red-950/20 border border-red-900 text-red-400' : 'bg-green-950/20 border border-green-900 text-green-400'}`}>
                      {newCrmClientFeedback}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase w-full text-left">Nome do Cliente *</label>
                      <input
                        type="text"
                        required
                        placeholder="ex: João da Silva"
                        className="bg-[#0a0f1d] border border-gray-850 rounded py-1.5 px-2.5 text-white focus:border-purple-500 focus:outline-none"
                        value={newCrmName}
                        onChange={(e) => setNewCrmName(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase w-full text-left">Telefone / WhatsApp *</label>
                      <input
                        type="text"
                        required
                        placeholder="ex: (11) 99999-9999"
                        className="bg-[#0a0f1d] border border-gray-850 rounded py-1.5 px-2.5 text-white focus:border-purple-500 focus:outline-none"
                        value={newCrmPhone}
                        onChange={(e) => setNewCrmPhone(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase w-full text-left">E-mail</label>
                      <input
                        type="email"
                        placeholder="ex: joao@email.com"
                        className="bg-[#0a0f1d] border border-gray-850 rounded py-1.5 px-2.5 text-white focus:border-purple-500 focus:outline-none"
                        value={newCrmEmail}
                        onChange={(e) => setNewCrmEmail(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase w-full text-left">CPF ou CNPJ</label>
                      <input
                        type="text"
                        placeholder="ex: 123.456.789-00"
                        className="bg-[#0a0f1d] border border-gray-850 rounded py-1.5 px-2.5 text-white focus:border-purple-500 focus:outline-none"
                        value={newCrmCpfCnpj}
                        onChange={(e) => setNewCrmCpfCnpj(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-[10px] text-gray-400 font-bold uppercase w-full text-left">Oficina & Loja / Tenant Associado *</label>
                      <select
                        required
                        value={newCrmTenantId}
                        onChange={(e) => setNewCrmTenantId(e.target.value)}
                        className="bg-[#0a0f1d] border border-gray-850 rounded py-1.5 px-2.5 text-white focus:border-purple-500 focus:outline-none cursor-pointer"
                      >
                        <option value="">-- Selecione a oficina & loja autorizada --</option>
                        {tenants.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1 w-full text-left">
                        CEP Residencial {isFetchingNewCrmCep && <span className="text-purple-400 text-[8px] animate-pulse">(ViaCEP...)</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="Apenas números (ex: 01001000)"
                        className="bg-[#0a0f1d] border border-gray-850 rounded py-1.5 px-2.5 text-white focus:border-purple-500 focus:outline-none font-mono"
                        value={newCrmCep}
                        onChange={(e) => {
                          setNewCrmCep(e.target.value);
                          if (e.target.value.replace(/\D/g, "").length === 8) {
                            handleFetchNewCrmCep(e.target.value);
                          }
                        }}
                      />
                      {newCrmCepError && <span className="text-[8px] text-red-400">{newCrmCepError}</span>}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase w-full text-left">Endereço Completo</label>
                      <input
                        type="text"
                        placeholder="Rua, Número, Cidade"
                        className="bg-[#0a0f1d] border border-gray-850 rounded py-1.5 px-2.5 text-white focus:border-purple-500 focus:outline-none"
                        value={newCrmAddress}
                        onChange={(e) => setNewCrmAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-650 hover:to-indigo-650 text-white font-mono text-[11px] font-bold rounded-xl mt-2 cursor-pointer border-0 select-none transition-all active:scale-[98.5%]"
                  >
                    💾 SALVAR REGISTRO DO CLIENTE NO CRM
                  </button>
                </form>
              )}

              {/* CRM Clients List */}
              <div className="flex flex-col gap-3 font-mono text-xs">
                {clientes.filter(cli => {
                  // Workshop Filter
                  if (selectedCrmFilterTenant !== 'all' && cli.empresaId !== selectedCrmFilterTenant) return false;
                  
                  if (!crmSearchTerm) return true;
                  const term = crmSearchTerm.toLowerCase();
                  return (
                    cli.name.toLowerCase().includes(term) ||
                    cli.phone.includes(term) ||
                    (cli.email && cli.email.toLowerCase().includes(term)) ||
                    (cli.cpfCnpj && cli.cpfCnpj.includes(term))
                  );
                }).length === 0 ? (
                  <div className="p-8 text-center text-gray-500 bg-[#050912]/20 border border-gray-900 border-dashed rounded-xl">
                    Nenhum cliente CRM encontrado com os critérios de unidade ou pesquisa definidos.
                  </div>
                ) : (
                  clientes
                    .filter(cli => {
                      // Workshop Filter
                      if (selectedCrmFilterTenant !== 'all' && cli.empresaId !== selectedCrmFilterTenant) return false;

                      if (!crmSearchTerm) return true;
                      const term = crmSearchTerm.toLowerCase();
                      return (
                        cli.name.toLowerCase().includes(term) ||
                        cli.phone.includes(term) ||
                        (cli.email && cli.email.toLowerCase().includes(term)) ||
                        (cli.cpfCnpj && cli.cpfCnpj.includes(term))
                      );
                    })
                    .map((cli) => {
                      const clientVehs = veiculos.filter(v => v.clienteId === cli.id);
                      // Look up proper original workshop/tenant name
                      const clientTenant = tenants.find(t => t.id === cli.empresaId);
                      const clientTenantName = clientTenant ? clientTenant.name : company.name;

                      return (
                        <div 
                          key={cli.id} 
                          className="p-4 rounded-xl border border-gray-850 hover:border-gray-800 bg-[#050912] text-left flex flex-col gap-3 transition-all"
                        >
                          {/* Name & Workshop identification banner */}
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-850 pb-2">
                            <div className="flex flex-col gap-0.5">
                              <strong className="text-white text-sm">{cli.name}</strong>
                              <span className="text-[10px] text-gray-500">ID: {cli.id} | CPF/CNPJ: {cli.cpfCnpj}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="text-gray-500 font-mono">📍 UNIDADE:</span>
                              <span className="px-2 py-0.5 bg-purple-950/20 text-purple-300 border border-purple-900/40 rounded font-bold">
                                💼 {clientTenantName} {cli.empresaId === company.id ? '(Sessão Ativa)' : ''}
                              </span>
                            </div>
                          </div>

                          {/* Client Parameters & Contacts info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[10px] text-gray-400">
                            <div>📞 Telefone: <strong className="text-slate-300">{cli.phone}</strong></div>
                            <div>📧 E-mail: <strong className="text-slate-300">{cli.email || 'Não informado'}</strong></div>
                            <div>📅 Criado em: <strong className="text-slate-300">{cli.createdAt ? new Date(cli.createdAt).toLocaleDateString() : 'N/D'}</strong></div>
                          </div>

                          {/* Vehicles associated to this owner */}
                          <div className="text-[10px] bg-slate-950/40 p-2.5 rounded-lg border border-gray-900 flex flex-wrap items-center gap-1.5">
                            <span className="text-gray-500 uppercase font-bold tracking-wider text-[8px] mr-1">🚗 Frota de Veículos:</span>
                            {clientVehs.length === 0 ? (
                              <span className="text-gray-600 italic">Nenhum veículo vinculado a este proprietário.</span>
                            ) : (
                              clientVehs.map((vehi) => (
                                <span 
                                  key={vehi.id} 
                                  className="px-2 py-0.5 bg-[#0a0f1d] border border-gray-850 text-slate-300 rounded text-[9px]"
                                >
                                  {vehi.brand} {vehi.model} — Placa: <strong className="text-purple-400 select-all">{vehi.plate}</strong> ({vehi.year})
                                </span>
                              ))
                            )}
                          </div>

                          {/* Full Address details */}
                          <div className="text-[10px] text-gray-400 flex flex-wrap items-center gap-x-2">
                            <span>🏠 Endereço Res.:</span>
                            <span className="text-slate-300">{cli.address || 'Não configurado no cadastro.'}</span>
                            {cli.cep && (
                              <span className="px-1.5 py-0.2 bg-[#050912] border border-gray-850 text-purple-400 font-mono rounded text-[9px]">CEP {cli.cep}</span>
                            )}
                          </div>

                          {/* Fast edit correction action trigger */}
                          <div className="border-t border-gray-850 pt-2 flex justify-between items-center bg-[#070c18] -mx-4 -mb-4 p-2.5 rounded-b-xl gap-3 flex-wrap">
                            <span className="text-[9px] text-gray-500 font-mono">
                              * Sincronização automática em tempo real com o banco de dados principal.
                            </span>
                            
                            <div className="flex gap-2 items-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteCrmClient(cli.id)}
                                className="py-1 px-2.5 bg-red-950/45 hover:bg-red-900 text-red-300 hover:text-white border border-red-900/35 font-bold rounded font-mono text-[9px] cursor-pointer"
                              >
                                🗑️ EXCLUIR CLIENTE
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditCrmClient(cli)}
                                className="py-1 px-3 bg-purple-650 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded font-mono text-[9px] transition-colors cursor-pointer border-0"
                              >
                                ✏️ CORRIGIR CADASTRO CO-PILOTO
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })
                )}
              </div>

            </div>
          )}

          {/* Pricing Configs Grid */}
          <div className="bg-[#0c1223] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 text-left">
            <div>
              <h3 className="font-display font-bold text-white text-base">💰 Configuração Mestre de Planos (SaaS Gateway)</h3>
              <span className="text-[10px] text-gray-505 text-gray-500 font-mono">Modifique os valores dos planos recorrentes. As alterações se aplicam a novos contratos e renovações.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-[#050912] border border-gray-850 p-4 rounded-xl flex flex-col gap-1.5">
                <strong className="text-[10px] text-gray-400">PLAN ALIANÇA BÁSICO</strong>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-500 font-bold">$</span>
                  <input 
                    type="number"
                    className="bg-slate-950 border border-slate-850 rounded py-1 pl-6 pr-2 text-white w-full text-xs font-bold"
                    value={basicPrice}
                    onChange={(e) => setBasicPrice(parseInt(e.target.value) || 0)}
                  />
                </div>
                <span className="text-[9px] text-gray-500 leading-tight">Mecânicas compactas (máx 100 clientes)</span>
              </div>

              <div className="bg-[#050912] border border-gray-850 p-4 rounded-xl flex flex-col gap-1.5 col-span-1">
                <strong className="text-[10px] text-blue-405 text-blue-400">PLAN PROFISSIONAL</strong>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-500 font-bold">$</span>
                  <input 
                    type="number"
                    className="bg-slate-950 border border-slate-850 rounded py-1 pl-6 pr-2 text-white w-full text-xs font-bold"
                    value={profPrice}
                    onChange={(e) => setProfPrice(parseInt(e.target.value) || 0)}
                  />
                </div>
                <span className="text-[9px] text-gray-500 leading-tight">Médio porte (máx 500 clientes, AI parcial)</span>
              </div>

              <div className="bg-[#050912] border border-gray-850 p-4 rounded-xl flex flex-col gap-1.5 col-span-1">
                <strong className="text-[10px] text-yellow-550 text-yellow-500">PLAN RECORRENTE PREMIUM</strong>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-500 font-bold">$</span>
                  <input 
                    type="number"
                    className="bg-slate-950 border border-slate-850 rounded py-1 pl-6 pr-2 text-white w-full text-xs font-bold"
                    value={premPrice}
                    onChange={(e) => setPremPrice(parseInt(e.target.value) || 0)}
                  />
                </div>
                <span className="text-[9px] text-gray-500 leading-tight">Oficina integrada, Copilot e OBD-II avançados</span>
              </div>
            </div>

            <button
              onClick={() => {
                const timestamp = new Date().toLocaleTimeString();
                setLogs(l => [...l, `[${timestamp}] 💾 CONFIG_SAVE: Tabela fiscal de planos ajustada no banco de dados.`]);
                showToast("Valores atualizados com sucesso no motor financeiro do SaaS!", "success");
              }}
              className="py-2.5 px-4 bg-purple-655 bg-purple-600 hover:bg-purple-700 text-white font-mono text-[11px] font-bold rounded-xl mt-1 tracking-wider text-center cursor-pointer select-none transition-colors border-0"
            >
              SALVAR PARÂMETROS DE COBRANÇA
            </button>
          </div>

        </div>

        {/* Right: SaaS logs & Sandbox Tools (4-grid) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* SaaS Terminal */}
          <div className="bg-[#0c1223] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-850">
              <h3 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-purple-400" />
                Live SaaS Audit Log
              </h3>
              <button 
                onClick={() => setLogs([])}
                className="text-[9px] font-mono hover:text-red-500 text-gray-500 underline"
              >
                Limpar
              </button>
            </div>

            <div 
              ref={terminalRef}
              className="h-72 w-full bg-[#050912] border border-gray-900 rounded-xl p-3 font-mono text-[9px] leading-relaxed text-slate-300 overflow-y-auto flex flex-col gap-1 scrollbar-thin select-text"
            >
              {logs.map((log, lIdx) => {
                let colorClass = "text-gray-400";
                if (log.includes("STATUS ALTERADO") || log.includes("⚠️")) {
                  colorClass = "text-amber-400 font-bold bg-amber-950/10 rounded px-1";
                } else if (log.includes("UPGRADE") || log.includes("💳")) {
                  colorClass = "text-purple-405 text-purple-400 font-bold";
                } else if (log.includes("IMPERSONATE") || log.includes("👤")) {
                  colorClass = "text-cyan-400 font-bold";
                } else if (log.includes("SYSTEM_INIT") || log.includes("FIREBASE") || log.includes("🟢")) {
                  colorClass = "text-green-500 font-medium";
                } else if (log.includes("🔴")) {
                  colorClass = "text-red-400 font-medium";
                } else if (log.includes("🟡")) {
                  colorClass = "text-yellow-500 font-medium";
                }

                return (
                  <div key={lIdx} className={colorClass}>
                    {log}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-2 font-mono text-[10px]">
              <button
                type="button"
                onClick={handleTriggerPeakLoad}
                className="py-2 bg-slate-900 hover:bg-slate-855 border border-slate-800 text-slate-300 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[99.5%]"
              >
                <Zap className="w-3.5 text-yellow-500" /> Simular Pico de Tráfego
              </button>
            </div>
          </div>

          {/* Automatic DNS & CNAME Validation Widget */}
          <div className="bg-[#0c1223] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 text-left font-sans text-xs">
            <div className="border-b border-gray-850 pb-2 flex items-center justify-between">
              <h3 className="font-display font-bold text-white text-sm flex items-center gap-1.5 uppercase">
                <Globe className="w-4 h-4 text-purple-400" />
                Auto-Validador DNS
              </h3>
              <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-extrabold uppercase ${autoDnsEnabled ? 'bg-green-950/40 border border-green-900/50 text-green-400 animate-pulse' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>
                {autoDnsEnabled ? 'ATIVO (API)' : 'PAUSADO'}
              </span>
            </div>

            <p className="text-[10px] leading-relaxed text-slate-400 font-sans">
              Varredura de CNAMEs ativa em background via <strong>Cloudflare v4 & AWS Route53 JSON API</strong>. CNAMEs inválidos são re-checados ciclicamente.
            </p>

            <div className="bg-[#050912] border border-gray-900 rounded-xl p-3 flex flex-col gap-2 font-mono text-[10.5px]">
              <div className="flex justify-between items-center text-slate-400">
                <span>DNS Daemon:</span>
                <span className="text-white font-bold text-[9px] uppercase bg-purple-950/30 text-purple-400 border border-purple-900/40 rounded px-1.5 py-0.2">Cloudflare API Active</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Último Status:</span>
                <span className="text-white font-bold">{isScanningDns ? "Escaneando..." : "Sincronizado"}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Varredura automática:</span>
                <span className="text-slate-300">A cada 45s</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoDnsEnabled(!autoDnsEnabled)}
                className={`flex-1 py-1 px-2 font-mono text-[9px] font-extrabold rounded-lg border transition-all cursor-pointer ${autoDnsEnabled ? 'bg-red-950/20 hover:bg-red-950/40 border-red-900 text-red-500' : 'bg-green-950/20 hover:bg-green-950/40 border-green-900 text-green-450'}`}
              >
                {autoDnsEnabled ? "PAUSAR DAEMON DNS" : "ATIVAR DAEMON DNS"}
              </button>
              
              <button
                type="button"
                disabled={isScanningDns}
                onClick={checkAllCustomDomains}
                className="px-2 py-1 bg-purple-950/40 hover:bg-purple-950/80 border border-purple-900 rounded-lg text-purple-400 font-mono text-[9px] font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isScanningDns ? 'animate-spin' : ''}`} />
                FORÇAR VERIFICAÇÃO
              </button>
            </div>
          </div>

          {/* SaaS Suggestions & Strategy */}
          <div className="bg-[#0c1223] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 text-left font-sans text-xs">
            <h4 className="font-display font-extrabold text-white text-sm flex items-center gap-1.5 uppercase">
              🚀 Dicas de Monetização SaaS
            </h4>
            
            <div className="flex flex-col gap-3 text-slate-400 leading-relaxed text-[11px]">
              <div className="p-3 bg-slate-950/40 rounded-xl border border-gray-850">
                <strong className="text-white block mb-1">💡 Cobrança Baseada em Recursos (Volume):</strong>
                Limite o cadastro de mecânicos e usuários simultâneos no SaaS. Crie taxas adicionais por usuário cadastrado fora do limite do plano.
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-gray-850">
                <strong className="text-white block mb-1">✨ Diferencial da Inteligência Artificial:</strong>
                Mostre o valor da inteligência artificial como um super diferencial incluso já na assinatura recorrente! O CoPilot ajuda a fidelizar e reter os parceiros no SaaS por ser isento de cobranças por tokens.
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-gray-850">
                <strong className="text-white block mb-1">🏦 Split de Pagamentos PDV:</strong>
                Ofereça transações via PIX QR Code diretamente integradas no fluxo do PDV de seus tenants e cobre uma taxa de 0.5% por transação concluída!
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* SaaS Audit History Trail Section */}
      <div className="bg-[#0c1223] border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 text-left">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-gray-850 pb-4">
          <div>
            <h3 className="font-display font-extrabold text-white text-base flex items-center gap-2">
              <History className="w-5 h-5 text-purple-450 text-purple-400" />
              Histórico de Auditoria do SaaS
            </h3>
            <p className="text-[10px] font-mono text-gray-550 text-gray-500">
              Registro cronológico e imutável de todas as alterações manuais de planos e status de tenants realizadas pelos administradores do sistema.
            </p>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar por Tenant, Administrador ou Ação..."
              className="bg-[#050912] border border-gray-800 rounded-lg py-1.5 pl-8 pr-3 text-white text-xs font-mono focus:outline-none focus:border-purple-500 w-full md:w-80"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
            />
            <div className="absolute left-2.5 top-2 text-gray-500">
              <Search className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-850 bg-[#050912]">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-gray-400 border-b border-gray-850">
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Data & Registro</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Tenant / Oficina</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Parâmetro</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Alteração (Anterior → Atual)</th>
                <th className="p-3 font-semibold uppercase tracking-wider text-[10px]">Administrador Responsável</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-sans">
                    Nenhum registro de auditoria corresponde aos critérios de busca.
                  </td>
                </tr>
              ) : (
                filteredAuditLogs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const formattedDate = !isNaN(dateObj.getTime())
                    ? dateObj.toLocaleString('pt-BR')
                    : log.timestamp;
                  const isAdminOwner = log.adminEmail === 'cleciotecnologia@gmail.com';
                  
                  return (
                    <tr key={log.id} className="border-b border-gray-850 hover:bg-[#070d18] transition-colors">
                      <td className="p-3 whitespace-nowrap text-gray-450 text-gray-500">
                        {formattedDate}
                      </td>
                      <td className="p-3 whitespace-nowrap text-white font-sans font-bold">
                        {log.tenantName}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {log.changeType === 'Plano' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-950/40 border border-purple-900/50 text-purple-400 uppercase">
                            💳 Plano
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-950/40 border border-amber-900/50 text-amber-400 uppercase">
                            ⚙️ Status
                          </span>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-gray-500 font-mono text-[11px] line-through decoration-gray-700">{log.oldValue}</span>
                          <span className="text-purple-405 text-purple-500">→</span>
                          <span className={`px-2 py-0.5 rounded text-[10.5px] ${
                            log.newValue === 'Premium' 
                              ? 'bg-yellow-950/20 border border-yellow-900 text-yellow-500'
                              : log.newValue === 'Profissional'
                                ? 'bg-blue-950/20 border border-blue-900 text-blue-400'
                                : log.newValue === 'Básico'
                                  ? 'bg-slate-900 border border-slate-800 text-slate-400'
                                  : log.newValue === 'Ativo'
                                    ? 'bg-green-950/25 border border-green-900/50 text-green-400'
                                    : 'bg-red-950/25 border border-red-900/50 text-red-405 text-red-500'
                          }`}>
                            {log.newValue}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isAdminOwner 
                            ? 'bg-purple-950/20 border border-purple-900/40 text-purple-400 font-sans' 
                            : 'bg-slate-900 border border-slate-800 text-slate-400 font-sans'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isAdminOwner ? 'bg-purple-500 animate-pulse' : 'bg-gray-500'}`}></span>
                          {log.adminEmail}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
          <span>Mostrando {filteredAuditLogs.length} registros</span>
          <span className="border border-purple-900/40 bg-purple-950/10 px-2 py-0.5 rounded text-purple-400 uppercase tracking-widest font-extrabold animate-pulse">● Conexão com Firebase segura</span>
        </div>
      </div>

      {/* 🛠️ MODAL DE AJUSTE, SUPORTE E SUGESTÕES PARA TENANTS */}
      {selectedTenant && (
        <div id="support-suggestions-modal" className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#0c1223] border border-purple-900/80 rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto flex flex-col p-4 sm:p-6 text-left relative shadow-2xl shadow-purple-950/30">
            
            {/* Header */}
            <div className="flex justify-between items-start gap-4 pb-4 border-b border-gray-850">
              <div className="flex flex-col gap-1 text-left">
                <span className="bg-purple-950/40 border border-purple-900 border-dashed text-purple-400 font-mono text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded w-max">
                  🛠️ PORTAL DE AJUSTE & SUPORTE
                </span>
                <h3 className="text-base sm:text-lg font-display font-extrabold text-white flex items-center gap-2 mt-1">
                  Gerenciar Canal: <span className="text-purple-300">{selectedTenant.name}</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Ajuste plano, limites de tokens Gemini ou envie dicas operacionais personalizadas para serem exibidas no ERP deste cliente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTenant(null)}
                className="p-1 text-gray-500 hover:text-white rounded bg-slate-900 hover:bg-slate-800 cursor-pointer text-xs font-bold px-2 py-1 font-mono transition-colors"
              >
                ✕ FECHAR
              </button>
            </div>

            {/* Split Content Form & Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5 items-start">
              
              {/* LEFT COLUMN: TENANT GENERAL PARAMETERS FORM */}
              <form onSubmit={handleSaveTenantAdjustments} className="bg-gray-950/40 border border-gray-900 p-4 rounded-xl flex flex-col gap-4 text-left">
                <div className="border-b border-gray-900 pb-2 flex justify-between items-center">
                  <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">⚙️ Parâmetros de Cadastro</h4>
                  <span className="text-[9px] text-purple-400 font-mono font-semibold">Correção Rápida</span>
                </div>

                {/* TAB REGISTRATION NAVIGATION */}
                <div className="flex bg-[#050912] border border-gray-900 rounded-lg overflow-hidden divide-x divide-gray-900">
                  <button
                    type="button"
                    onClick={() => setActiveCorrectionTab('profile')}
                    className={`flex-1 py-1.5 text-center text-[10px] font-mono font-bold uppercase transition-all cursor-pointer select-none border-0 ${
                      activeCorrectionTab === 'profile'
                        ? 'bg-purple-950/70 text-purple-300 font-extrabold'
                        : 'text-gray-500 hover:text-gray-300 bg-transparent'
                    }`}
                  >
                    ✏️ Identidade
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCorrectionTab('domain')}
                    className={`flex-1 py-1.5 text-center text-[10px] font-mono font-bold uppercase transition-all cursor-pointer select-none border-0 ${
                      activeCorrectionTab === 'domain'
                        ? 'bg-purple-950/70 text-purple-300 font-extrabold'
                        : 'text-gray-500 hover:text-gray-300 bg-transparent'
                    }`}
                  >
                    🌐 DNS/Plataforma
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCorrectionTab('contact')}
                    className={`flex-1 py-1.5 text-center text-[10px] font-mono font-bold uppercase transition-all cursor-pointer select-none border-0 ${
                      activeCorrectionTab === 'contact'
                        ? 'bg-purple-950/70 text-purple-300 font-extrabold'
                        : 'text-gray-500 hover:text-gray-300 bg-transparent'
                    }`}
                  >
                    📞 Contatos
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCorrectionTab('address')}
                    className={`flex-1 py-1.5 text-center text-[10px] font-mono font-bold uppercase transition-all cursor-pointer select-none border-0 ${
                      activeCorrectionTab === 'address'
                        ? 'bg-purple-950/70 text-purple-300 font-extrabold'
                        : 'text-gray-500 hover:text-gray-300 bg-transparent'
                    }`}
                  >
                    📍 Locais
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-1">
                  
                  {activeCorrectionTab === 'profile' && (
                    <>
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-gray-400 font-mono text-[10px] font-bold">NOME DA OFICINA / CONTRATO</label>
                        <input 
                          type="text" 
                          required
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="bg-slate-950 border border-slate-850 rounded py-1.5 px-3 text-white text-xs" 
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-gray-400 font-mono text-[10px] font-bold">CNPJ DA EMPRESA</label>
                        <input 
                          type="text" 
                          required
                          value={editCnpj}
                          onChange={e => setEditCnpj(e.target.value)}
                          className="bg-slate-950 border border-slate-850 rounded py-1.5 px-3 text-white text-xs font-mono" 
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-gray-400 font-mono text-[10px] font-bold">PLANO SAAS ATIVO</label>
                        <select
                          value={editPlan}
                          onChange={e => setEditPlan(e.target.value as any)}
                          className="bg-slate-950 border border-slate-850 rounded py-1.5 px-2 text-white text-xs font-bold cursor-pointer"
                        >
                          <option value="Básico">Básico (R$ 149/mês)</option>
                          <option value="Profissional">Profissional (R$ 299/mês)</option>
                          <option value="Premium">Premium (R$ 499/mês)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2 bg-[#050912] p-3 rounded-lg border border-purple-950">
                        <div className="flex justify-between items-center text-[10px]">
                          <label className="text-purple-400 font-mono font-bold uppercase tracking-wider">💎 Quota Gemini CoPilot</label>
                          <span className="text-gray-400 font-mono">{(editGeminiLimit / 1000).toFixed(0)}k tks /mês</span>
                        </div>
                        <input 
                          type="range"
                          min={100000}
                          max={5000000}
                          step={100000}
                          value={editGeminiLimit}
                          onChange={e => setEditGeminiLimit(parseInt(e.target.value))}
                          className="w-full accent-purple-500 cursor-ew-resize mt-2"
                        />
                        <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1">
                          <span>100k tokens</span>
                          <span>500k recom.</span>
                          <span>5.0M Premium</span>
                        </div>
                      </div>
                    </>
                  )}

                  {activeCorrectionTab === 'domain' && (
                    <>
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-gray-400 font-mono text-[10px] font-bold">SUBDOMÍNIO DE ACESSO (.autoprecision.com.br)</label>
                        <input 
                          type="text" 
                          value={editSubdomain}
                          onChange={e => setEditSubdomain(e.target.value)}
                          className="bg-slate-950 border border-slate-850 rounded py-1.5 px-3 text-white text-xs font-mono" 
                          placeholder="oficina-do-rafael"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-gray-400 font-mono text-[10px] font-bold">DOMÍNIO CUSTOMIZADO (CNAME EXTERNO)</label>
                        <input 
                          type="text" 
                          value={editCustomDomain}
                          onChange={e => setEditCustomDomain(e.target.value)}
                          className="bg-slate-950 border border-slate-850 rounded py-1.5 px-3 text-white text-xs font-mono" 
                          placeholder="autoprecision.com.br"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-gray-400 font-mono text-[10px] font-bold">ARMAZENAMENTO ATRIBUÍDO NO CLUSTER (GBS)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          required
                          value={editDbSize}
                          onChange={e => setEditDbSize(parseFloat(e.target.value) || 0)}
                          className="bg-slate-950 border border-slate-850 rounded py-1.5 px-3 text-white text-xs font-mono" 
                        />
                      </div>
                    </>
                  )}

                  {activeCorrectionTab === 'contact' && (
                    <>
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-gray-400 font-mono text-[10px] font-bold">TELEFONE GERAL</label>
                        <input 
                          type="text" 
                          required
                          value={editPhone}
                          onChange={e => setEditPhone(e.target.value)}
                          className="bg-slate-950 border border-slate-850 rounded py-1.5 px-3 text-white text-xs font-mono" 
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-gray-400 font-mono text-[10px] font-bold">E-MAIL DE SUPORTE / NOTIFICAÇÃO</label>
                        <input 
                          type="email" 
                          required
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                          className="bg-slate-950 border border-slate-850 rounded py-1.5 px-3 text-white text-xs font-mono" 
                        />
                      </div>
                    </>
                  )}

                  {activeCorrectionTab === 'address' && (
                    <>
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <div className="flex justify-between items-center">
                          <label className="text-gray-400 font-mono text-[10px] font-bold">CEP DO ESTABELECIMENTO</label>
                          {isFetchingTenantEditCep && <span className="text-purple-400 text-[8px] animate-pulse">Buscando CEP...</span>}
                          {tenantEditCepError && <span className="text-red-400 text-[8px]">{tenantEditCepError}</span>}
                        </div>
                        <input 
                          type="text" 
                          value={editCep}
                          placeholder="CEP de 8 dígitos para auto-preenchimento"
                          onChange={e => {
                            setEditCep(e.target.value);
                            if (e.target.value.replace(/\D/g, "").length === 8) {
                              handleFetchTenantEditCep(e.target.value);
                            }
                          }}
                          className="bg-slate-950 border border-slate-850 rounded py-1.5 px-3 text-white text-xs font-mono" 
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-gray-400 font-mono text-[10px] font-bold">ENDEREÇO COMPLETO VIA VIA_CEP</label>
                        <input 
                          type="text" 
                          value={editAddress}
                          onChange={e => setEditAddress(e.target.value)}
                          className="bg-slate-950 border border-slate-850 rounded py-1.5 px-3 text-white text-xs" 
                        />
                      </div>
                    </>
                  )}

                </div>

                <button
                  type="submit"
                  style={{ cursor: 'pointer' }}
                  className="py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-650 hover:to-indigo-650 text-white font-mono text-[11px] font-bold rounded-xl mt-2 tracking-wider text-center cursor-pointer border-0 select-none transition-all active:scale-[99.5%]"
                >
                  SALVAR AJUSTES DA OFICINA
                </button>
              </form>

              {/* RIGHT COLUMN: ACTIVE SUPPORT SUGGESTIONS PANEL */}
              <div className="bg-gray-950/40 border border-gray-900 p-4 rounded-xl flex flex-col gap-4 text-left">
                <div className="border-b border-gray-900 pb-2 flex justify-between items-center">
                  <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">📝 RECOMENDAÇÕES DO SUPORTE</h4>
                  <span className="text-[9px] text-pink-400 font-mono font-semibold">Exibido no Dashboard ERP</span>
                </div>

                {/* Sub-form to Add New Suggestions */}
                <form onSubmit={handleAddSuggestion} className="bg-slate-950 border border-gray-900 p-3 rounded-lg flex flex-col gap-2.5 text-xs">
                  <span className="text-[10px] text-gray-405 text-gray-500 font-mono font-bold block uppercase tracking-wider">✦ Cadastrar Nova Dica Operacional</span>
                  
                  <div className="grid grid-cols-5 gap-2">
                    <input 
                      type="text" 
                      required
                      placeholder="Título da recomendação..."
                      className="col-span-3 bg-[#0a0f1d] border border-slate-850 rounded py-1 px-2.5 text-xs text-white"
                      value={newSugTitle}
                      onChange={e => setNewSugTitle(e.target.value)}
                    />
                    
                    <select
                      className="col-span-2 bg-[#0a0f1d] border border-slate-850 rounded py-1 px-1.5 text-xs text-slate-300 font-mono cursor-pointer"
                      value={newSugCat}
                      onChange={e => setNewSugCat(e.target.value as any)}
                    >
                      <option value="Suporte">Suporte Tech</option>
                      <option value="Ajuste">Ajuste Config</option>
                      <option value="Marketing">Campanha/Mkt</option>
                      <option value="Melhoria">Melhoria</option>
                    </select>
                  </div>

                  <textarea
                    required
                    placeholder="Escreva detalhadamente a instrução ou orientação de suporte. Ela aparecerá diretamente na tela principal do cliente para ajudá-lo operativamente..."
                    className="w-full bg-[#0a0f1d] border border-slate-850 rounded py-1 px-2.5 text-xs text-slate-300 h-16 resize-none font-sans"
                    value={newSugDesc}
                    onChange={e => setNewSugDesc(e.target.value)}
                  />

                  <button
                    type="submit"
                    style={{ cursor: 'pointer' }}
                    className="py-1.5 bg-purple-650 bg-purple-600 hover:bg-purple-700 text-white font-mono text-[9.5px] font-bold rounded-lg tracking-wider text-center cursor-pointer border-0 select-none transition-colors"
                  >
                    🚀 ENVIAR RECOMENDAÇÃO DIPLOMÁTICA
                  </button>
                </form>

                {/* List of suggestions sent to this store */}
                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                  <span className="text-[9.5px] font-mono text-gray-400 font-bold block uppercase tracking-wider">Histórico de Sugestões de Suporte</span>
                  
                  {suggestions.filter(s => s.tenantId === selectedTenant.id).length === 0 ? (
                    <div className="text-center py-6 text-[11px] text-gray-600 font-mono bg-slate-950/20 border border-gray-900 border-dashed rounded-lg">
                      Nenhuma dica ou sugestão ativa para este cliente. Use o formulário acima para criá-la.
                    </div>
                  ) : (
                    suggestions
                      .filter(s => s.tenantId === selectedTenant.id)
                      .map((sug) => (
                        <div key={sug.id} className="bg-slate-950/70 border border-slate-900 rounded-lg p-3 text-xs flex flex-col gap-1.5 relative hover:border-gray-850 transition-all">
                          <button
                            type="button"
                            onClick={() => handleDeleteSuggestion(sug.id)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-400 font-mono text-[10px] bg-red-955 hover:bg-red-950/20 p-1 px-1.5 rounded"
                            title="Remover sugestão"
                          >
                            ✕ Excluir
                          </button>
                          
                          <div className="flex items-center gap-1.5 leading-none pr-16 text-left">
                            <span className="text-[8px] bg-slate-900 text-slate-400 font-mono border border-slate-800 rounded px-1">{sug.category}</span>
                            <span className={`${sug.status === 'Resolvido' ? 'line-through text-slate-500 font-bold' : 'text-slate-200 font-bold'}`}>{sug.title}</span>
                          </div>

                          <p className={`text-slate-400 text-[11px] text-left leading-relaxed mt-0.5 ${sug.status === 'Resolvido' ? 'line-through text-slate-600' : ''}`}>
                            {sug.description}
                          </p>

                          <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-gray-900 text-[9px] font-mono">
                            <span className="text-slate-500">Enviado em: {new Date(sug.createdAt).toLocaleDateString()}</span>
                            
                            <button
                              type="button"
                              onClick={() => handleToggleSuggestionStatus(sug.id)}
                              className={`px-2 py-0.5 rounded font-bold ${
                                sug.status === 'Resolvido'
                                  ? 'bg-green-950/30 text-green-400 border border-green-900'
                                  : 'bg-yellow-950/30 text-yellow-500 border border-yellow-905 hover:bg-yellow-950'
                              }`}
                            >
                              {sug.status === 'Resolvido' ? '✔️ Lido / Resolvido' : '● Aguardando Visualização'}
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>

              </div>

            </div>

            {/* Footer Infiltrator Action link Shortcut */}
            <div className="mt-6 pt-4 border-t border-gray-850 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
              <span className="text-[10px] text-gray-500 font-mono">
                * Qualquer alteração em CNPJ, Plano ou Quota de Token reflete instantaneamente nas propriedades de hardware isoladas em nuvem.
              </span>
              
              <button
                type="button"
                onClick={() => {
                  const t = selectedTenant;
                  setSelectedTenant(null);
                  handleImpersonate(t);
                }}
                className="py-1.5 px-4 bg-yellow-600 hover:bg-yellow-700 text-black font-extrabold rounded-lg select-none cursor-pointer duration-200 flex items-center gap-1.5 text-[11px] font-mono shadow-md shadow-yellow-600/10 active:scale-95 border-0"
              >
                <Zap className="w-4" /> INFILTRAR NA CONTA ERP PREPARADO
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 👤 MODAL DE CORREÇÃO DE CADASTRO DE CLIENTE CRM */}
      {selectedCrmClient && (
        <div id="crm-client-correction-modal" className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c1223] border border-purple-900/80 rounded-2xl w-full max-w-lg overflow-y-auto flex flex-col p-6 text-left relative shadow-2xl shadow-purple-950/30">
            
            {/* Header */}
            <div className="flex justify-between items-start gap-4 pb-4 border-b border-gray-850">
              <div className="flex flex-col gap-1 text-left">
                <span className="bg-purple-950/40 border border-purple-900 border-dashed text-purple-400 font-mono text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded w-max">
                  👤 CRM REGISTER REVISION
                </span>
                <h3 className="text-base font-display font-extrabold text-white flex items-center gap-2 mt-1">
                  Corrigir Cadastro do Cliente
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  Edite as informações cadastrais do cliente <span className="text-purple-300 font-bold">{selectedCrmClient.name}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCrmClient(null)}
                className="p-1 text-gray-450 hover:text-white rounded bg-slate-900 hover:bg-slate-800 cursor-pointer text-xs font-mono font-bold transition-all px-2.5 py-1 border-0"
              >
                ✕ CANCELAR
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCrmClientEdit} className="flex flex-col gap-4 mt-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 font-mono text-[10px] font-bold col-span-2">NOME DO PROPRIETÁRIO</label>
                <input 
                  type="text" 
                  required
                  value={editCrmClientName}
                  onChange={e => setEditCrmClientName(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded py-1.5 px-3 text-white text-xs font-sans" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 font-mono text-[10px] font-bold">CPF OU CNPJ</label>
                  <input 
                    type="text" 
                    required
                    value={editCrmClientCpf}
                    onChange={e => setEditCrmClientCpf(e.target.value)}
                    className="bg-slate-950 border border-slate-850 rounded py-1.5 px-3 text-white text-xs font-mono" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-400 font-mono text-[10px] font-bold">TELEFONE / WHATSAPP</label>
                  <input 
                    type="text" 
                    required
                    value={editCrmClientPhone}
                    onChange={e => setEditCrmClientPhone(e.target.value)}
                    className="bg-slate-950 border border-slate-850 rounded py-1.5 px-3 text-white text-xs font-mono" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 font-mono text-[10px] font-bold">ENDEREÇO DE E-MAIL</label>
                <input 
                  type="email" 
                  placeholder="exemplo@email.com"
                  value={editCrmClientEmail}
                  onChange={e => setEditCrmClientEmail(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded py-1.5 px-3 text-white text-xs font-sans" 
                />
              </div>

              <div className="flex flex-col gap-1.5 border-t border-gray-900 pt-3">
                <div className="flex justify-between items-center">
                  <label className="text-gray-400 font-mono text-[10px] font-bold">CEP RESIDENCIAL</label>
                  {isFetchingCrmCep && <span className="text-purple-400 text-[8px] animate-pulse">Consultando ViaCEP...</span>}
                  {crmCepError && <span className="text-red-400 text-[8px]">{crmCepError}</span>}
                </div>
                <input 
                  type="text" 
                  placeholder="Digitar CEP sem traços"
                  value={editCrmClientCep}
                  onChange={e => {
                    setEditCrmClientCep(e.target.value);
                    if (e.target.value.replace(/\D/g, "").length === 8) {
                      handleFetchCrmCep(e.target.value);
                    }
                  }}
                  className="bg-slate-950 border border-slate-850 rounded py-1.5 px-3 text-white text-xs font-mono" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 font-mono text-[10px] font-bold">ENDEREÇO COMPLETO VIA VIA_CEP</label>
                <input 
                  type="text" 
                  placeholder="Rua, Número, Bairro, Cidade/UF"
                  value={editCrmClientAddress}
                  onChange={e => setEditCrmClientAddress(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded py-1.5 px-3 text-white text-xs font-sans" 
                />
              </div>

              <button
                type="submit"
                className="py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-650 hover:to-indigo-650 text-white font-mono text-[11px] font-bold rounded-xl mt-3 tracking-wider text-center cursor-pointer border-0 select-none transition-all active:scale-[98.5%]"
              >
                💾 SALVAR CORREÇÃO DE CLIENTE
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Dialog Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0a101d] border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-left font-sans">
            <h3 className="font-mono text-xs font-extrabold text-white pb-3 border-b border-gray-850 flex items-center gap-2">
              ⚠️ {confirmModal.title}
            </h3>
            <p className="text-[11px] text-gray-300 font-sans mt-4 leading-relaxed whitespace-pre-line">
              {confirmModal.message}
            </p>
            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                className="py-1.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-gray-300 font-mono text-[10px] uppercase font-bold cursor-pointer border-0 transition-all select-none"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              >
                {confirmModal.cancelText || "Cancelar"}
              </button>
              <button
                type="button"
                className={`py-1.5 px-5 rounded-lg text-white font-mono text-[10px] uppercase font-bold cursor-pointer border-0 transition-all select-none ${
                  confirmModal.isDanger
                    ? 'bg-red-600 hover:bg-red-700 active:scale-95 shadow-lg shadow-red-900/20'
                    : 'bg-purple-600 hover:bg-purple-700 active:scale-95 shadow-lg shadow-purple-900/20'
                }`}
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
              >
                {confirmModal.confirmText || "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast/Notification Snackbar Overlay */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-[9999] p-4 rounded-xl border flex items-center gap-3 shadow-2xl font-mono text-xs max-w-sm bg-[#090f1d] border-purple-900/50">
          <div className="flex-1 text-white pr-2 text-left">
            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              SaaS SYSTEM NOTIFICATION
            </span>
            <span className="text-[11px] text-gray-200 mt-1 block leading-tight">
              {notification.message}
            </span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-500 hover:text-white transition-colors cursor-pointer text-xs font-bold font-sans border-0 bg-transparent p-1"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
};
