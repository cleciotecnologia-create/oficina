import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where,
  getDocFromServer
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { 
  Cliente, 
  Veiculo, 
  Produto, 
  Servico,
  OrdemServico, 
  Financeiro, 
  Caixa, 
  Fornecedor, 
  UserProfile, 
  Company, 
  Venda,
  AutoBackupItem,
  LocalAuditLog
} from '../types';
import { 
  INITIAL_COMPANY, 
  MOCK_CLIENTS, 
  MOCK_VEHICLES, 
  MOCK_PRODUCTS, 
  MOCK_SERVICES,
  MOCK_OS, 
  MOCK_FINANCE, 
  MOCK_FORNECEDORES 
} from '../lib/mockData';

interface AppContextType {
  user: UserProfile | null;
  company: Company;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setCompany: React.Dispatch<React.SetStateAction<Company>>;
  clientes: Cliente[];
  veiculos: Veiculo[];
  produtos: Produto[];
  servicos: Servico[];
  ordensServico: OrdemServico[];
  financeiro: Financeiro[];
  fornecedores: Fornecedor[];
  caixaStatus: Caixa | null;
  vendas: Venda[];
  loading: boolean;
  aiLoading: boolean;
  loginError: string | null;
  
  // Actions
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Modules management
  addCliente: (c: Omit<Cliente, 'id' | 'empresaId' | 'createdAt'> & { empresaId?: string }) => Promise<void>;
  editCliente: (id: string, c: Partial<Cliente>) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;
  addVeiculo: (v: Omit<Veiculo, 'id' | 'empresaId'>) => Promise<void>;
  editVeiculo: (id: string, v: Partial<Veiculo>) => Promise<void>;
  deleteVeiculo: (id: string) => Promise<void>;
  addProduto: (p: Omit<Produto, 'id' | 'empresaId'>) => Promise<void>;
  updateProdutoStock: (id: string, qty: number) => Promise<void>;
  editProduto: (id: string, p: Partial<Produto>) => Promise<void>;
  deleteProduto: (id: string) => Promise<void>;
  addServico: (s: Omit<Servico, 'id' | 'empresaId'>) => Promise<void>;
  editServico: (id: string, s: Partial<Servico>) => Promise<void>;
  deleteServico: (id: string) => Promise<void>;
  addOS: (os: Omit<OrdemServico, 'id' | 'empresaId' | 'createdAt'>) => Promise<void>;
  editOS: (id: string, os: Partial<OrdemServico>) => Promise<void>;
  deleteOS: (id: string) => Promise<void>;
  addVenda: (v: Omit<Venda, 'id' | 'empresaId' | 'date'>) => Promise<void>;
  addFinanceiro: (f: Omit<Financeiro, 'id' | 'empresaId' | 'createdAt'>) => Promise<void>;
  editFinanceiro: (id: string, f: Partial<Financeiro>) => Promise<void>;
  abrirCaixa: (amount: number) => Promise<void>;
  fecharCaixa: (closedDetails?: Partial<Caixa> & Record<string, any>) => Promise<void>;
  addFornecedor: (f: Omit<Fornecedor, 'id' | 'empresaId'>) => Promise<void>;
  editFornecedor: (id: string, f: Partial<Fornecedor>) => Promise<void>;
  deleteFornecedor: (id: string) => Promise<void>;
  updateCompany: (c: Partial<Company>) => Promise<void>;

  // AI Integration
  getSmartDiagnosis: (model: string, plate: string, problem: string) => Promise<any>;
  sendChatMessage: (messages: { role: 'user' | 'assistant'; text: string }[]) => Promise<string>;

  // Offline Synchronization & Network Status
  isOnline: boolean;
  pendingActionsCount: number;
  syncPendingActions: () => Promise<void>;
  syncing: boolean;

  // Daily Automatic Backups
  autoBackups: AutoBackupItem[];
  triggerDailyBackup: (isManual?: boolean) => void;
  deleteAutoBackup: (id: string) => void;

  // Local Audit Logs
  localAuditLogs: LocalAuditLog[];
  addLocalAuditLog: (action: string, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & Org State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company>(INITIAL_COMPANY);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Network, Sync and Pending Offline Queues
  const [isOnline, setIsOnline] = useState<boolean>(typeof window !== 'undefined' ? navigator.onLine : true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [pendingActionsCount, setPendingActionsCount] = useState<number>(0);

  // Business Entities State
  const [clientes, setClientes] = useState<Cliente[]>(MOCK_CLIENTS);
  const [veiculos, setVeiculos] = useState<Veiculo[]>(MOCK_VEHICLES);
  const [produtos, setProdutos] = useState<Produto[]>(MOCK_PRODUCTS);
  const [servicos, setServicos] = useState<Servico[]>(MOCK_SERVICES);
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>(MOCK_OS);
  const [financeiro, setFinanceiro] = useState<Financeiro[]>(MOCK_FINANCE);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(MOCK_FORNECEDORES);
  const [caixaStatus, setCaixaStatus] = useState<Caixa | null>({
    id: "cx_default",
    empresaId: INITIAL_COMPANY.id,
    status: "Fechado",
    initialAmount: 0,
    currentAmount: 0,
    openedAt: ""
  });
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [autoBackups, setAutoBackups] = useState<AutoBackupItem[]>([]);
  const [localAuditLogs, setLocalAuditLogs] = useState<LocalAuditLog[]>([]);

  // Sandbox data seeder for first-use / new multi-tenant SaaS trial sandbox
  const seedSandboxData = async (empId: string) => {
    try {
      // 1. Seed Company
      const freshCompanyNode: Company = {
        id: empId,
        name: "AutoPrecision Premium",
        cnpj: "12.345.678/0001-90",
        phone: "(11) 98765-4321",
        address: "Av. das Nações Unidas, 1040 - São Paulo, SP",
        planId: "Premium",
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "empresas", empId), freshCompanyNode);

      // 2. Seed Clientes
      for (const c of MOCK_CLIENTS) {
        await setDoc(doc(db, "clientes", c.id), { ...c, data: {}, empresaId: empId });
      }

      // 3. Seed Veiculos
      for (const v of MOCK_VEHICLES) {
        await setDoc(doc(db, "veiculos", v.id), { ...v, empresaId: empId });
      }

      // 4. Seed Produtos
      for (const p of MOCK_PRODUCTS) {
        await setDoc(doc(db, "produtos", p.id), { ...p, empresaId: empId });
      }

      // Seeding Serviços
      for (const s of MOCK_SERVICES) {
        await setDoc(doc(db, "servicos", s.id), { ...s, empresaId: empId });
      }

      // 5. Seed OS
      for (const os of MOCK_OS) {
        await setDoc(doc(db, "ordens_servico", os.id), { ...os, empresaId: empId });
      }

      // 6. Seed Financeiro
      for (const f of MOCK_FINANCE) {
        await setDoc(doc(db, "financeiro", f.id), { ...f, empresaId: empId });
      }

      // 7. Seed Caixa Session
      const initialCaixa = {
        id: "cx_" + new Date().toISOString().substring(0, 10),
        empresaId: empId,
        status: "Aberto" as const,
        initialAmount: 250,
        currentAmount: 250,
        openedAt: new Date().toISOString()
      };
      await setDoc(doc(db, "caixa", initialCaixa.id), initialCaixa);
      console.log(`Successfully provisioned tenant workspace ${empId} in Firestore!`);
    } catch (error) {
      console.error("Failed to seed multi-tenant trial sandbox databases: ", error);
    }
  };

  // Offline Pending Operations interface
  interface PendingAction {
    id: string;
    collection: string;
    docId: string;
    payload: any;
    operation: 'set' | 'merge';
    createdAt: string;
  }

  // 1. Direct write helper with network fallback & offline local queueing
  const executeWrite = async (
    collectionName: string,
    docId: string,
    payload: any,
    operation: 'set' | 'merge' = 'set'
  ): Promise<boolean> => {
    // If online, write to Firestore
    if (navigator.onLine && auth.currentUser) {
      try {
        const docRef = doc(db, collectionName, docId);
        if (operation === 'merge') {
          await setDoc(docRef, payload, { merge: true });
        } else {
          await setDoc(docRef, payload);
        }
        return true; // Succeeded online
      } catch (err) {
        console.warn(`Direct write failed for ${collectionName}/${docId}, queueing offline...`, err);
      }
    }

    // Offline or failed online: queue inside localStorage
    if (auth.currentUser) {
      try {
        const stored = localStorage.getItem("autotech_pending_actions");
        const currentQueue: PendingAction[] = stored ? JSON.parse(stored) : [];
        
        // Remove prior pending actions rewriting the exact same doc to avoid duplicating queue bloat
        const refinedQueue = currentQueue.filter(act => !(act.collection === collectionName && act.docId === docId));

        const newAction: PendingAction = {
          id: "act_" + Math.random().toString(36).substr(2, 9),
          collection: collectionName,
          docId,
          payload,
          operation,
          createdAt: new Date().toISOString()
        };

        refinedQueue.push(newAction);
        localStorage.setItem("autotech_pending_actions", JSON.stringify(refinedQueue));
        setPendingActionsCount(refinedQueue.length);
        console.log(`Action added to local offline backup queue:`, newAction);
      } catch (e) {
        console.error("Local Storage backing fail for offline queue: ", e);
      }
    }
    return false; // Queued or offline fallback
  };

  // 2. Synchronize all operations in context
  const syncPendingActions = async () => {
    if (syncing) return;
    if (!navigator.onLine) return; // Halt if offline

    setSyncing(true);
    try {
      const stored = localStorage.getItem("autotech_pending_actions");
      if (!stored) {
        setSyncing(false);
        return;
      }

      const queue: PendingAction[] = JSON.parse(stored);
      if (queue.length === 0) {
        localStorage.removeItem("autotech_pending_actions");
        setPendingActionsCount(0);
        setSyncing(false);
        return;
      }

      console.log(`Synchronizing ${queue.length} pending local transaction(s) to Firestore...`);
      const remaining: PendingAction[] = [];
      let stopSync = false;

      for (const action of queue) {
        if (stopSync) {
          remaining.push(action);
          continue;
        }

        try {
          const docRef = doc(db, action.collection, action.docId);
          if (action.operation === 'merge') {
            await setDoc(docRef, action.payload, { merge: true });
          } else {
            await setDoc(docRef, action.payload);
          }
          console.log(`Successfully synced action ${action.id} to ${action.collection}/${action.docId}`);
        } catch (err: any) {
          console.error(`Syncing operation ${action.id} failed: `, err);
          stopSync = true;
          remaining.push(action);
        }
      }

      if (remaining.length > 0) {
        localStorage.setItem("autotech_pending_actions", JSON.stringify(remaining));
        setPendingActionsCount(remaining.length);
      } else {
        localStorage.removeItem("autotech_pending_actions");
        setPendingActionsCount(0);
      }
    } catch (err) {
      console.error("Error occurred while syncing offline transactions: ", err);
    } finally {
      setSyncing(false);
    }
  };

  // 3. Network connection event handlers & synchronization cycle
  useEffect(() => {
    // Check initial count
    try {
      const stored = localStorage.getItem("autotech_pending_actions");
      if (stored) {
        const queue = JSON.parse(stored);
        setPendingActionsCount(queue.length);
      }
    } catch (e) {
      console.error(e);
    }

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check triggers
    if (navigator.onLine && firebaseUser) {
      syncPendingActions();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [firebaseUser]);

  // Authenticate user changes and sync profile and company
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setLoading(true);

      if (u) {
        setFirebaseUser(u);

        try {
          const userRef = doc(db, 'users', u.uid);
          const userSnap = await getDocFromServer(userRef);

          let activeProfile: UserProfile;

          if (userSnap.exists()) {
            activeProfile = userSnap.data() as UserProfile;
          } else {
            // Profile does not exist yet. Provision a secure isolated workspace
            const sandboxEmpId = "emp_" + Math.random().toString(36).substring(2, 11);
            activeProfile = {
              uid: u.uid,
              name: u.displayName || "Admin Autotech",
              email: u.email || "membro@autotech.com",
              role: "Administrador",
              empresaId: sandboxEmpId,
              createdAt: new Date().toISOString()
            };

            // Provision profile first
            await setDoc(userRef, activeProfile);
            // Provision full workspace asynchronously to load immediately
            await seedSandboxData(sandboxEmpId);
          }

          setUser(activeProfile);

          // Get and sync corporate properties
          const compRef = doc(db, 'empresas', activeProfile.empresaId);
          const compSnap = await getDocFromServer(compRef);
          if (compSnap.exists()) {
            setCompany({ id: compSnap.id, ...compSnap.data() } as Company);
          }

        } catch (e) {
          console.error("Firestore Loading error, using secure fallback mode: ", e);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Reactive Multi-tenant Real-time subscriptions triggered dynamically by active company/user changes
  useEffect(() => {
    if (!user || !company?.id) return;

    let activeUnsubs: (() => void)[] = [];

    const cleanAllListeners = () => {
      activeUnsubs.forEach(unsub => {
        try {
          unsub();
        } catch (err) {
          console.warn("Unsubscribe listener error: ", err);
        }
      });
      activeUnsubs = [];
    };

    const targetEmpId = company.id;

    try {
      // Real-time Reactive isolated multi-tenant sync subscriptions with RLS approval
      const unsubClientes = onSnapshot(
        query(collection(db, 'clientes'), where('empresaId', '==', targetEmpId)),
        (snap) => {
          const list: Cliente[] = [];
          snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Cliente));
          if (list.length > 0) setClientes(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, "clientes")
      );
      activeUnsubs.push(unsubClientes);

      const unsubVeiculos = onSnapshot(
        query(collection(db, 'veiculos'), where('empresaId', '==', targetEmpId)),
        (snap) => {
          const list: Veiculo[] = [];
          snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Veiculo));
          if (list.length > 0) setVeiculos(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, "veiculos")
      );
      activeUnsubs.push(unsubVeiculos);

      const unsubProdutos = onSnapshot(
        query(collection(db, 'produtos'), where('empresaId', '==', targetEmpId)),
        (snap) => {
          const list: Produto[] = [];
          snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Produto));
          if (list.length > 0) setProdutos(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, "produtos")
      );
      activeUnsubs.push(unsubProdutos);

      const unsubServicos = onSnapshot(
        query(collection(db, 'servicos'), where('empresaId', '==', targetEmpId)),
        (snap) => {
          const list: Servico[] = [];
          snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Servico));
          if (list.length > 0) setServicos(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, "servicos")
      );
      activeUnsubs.push(unsubServicos);

      const unsubOS = onSnapshot(
        query(collection(db, 'ordens_servico'), where('empresaId', '==', targetEmpId)),
        (snap) => {
          const list: OrdemServico[] = [];
          snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as OrdemServico));
          if (list.length > 0) setOrdensServico(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, "ordens_servico")
      );
      activeUnsubs.push(unsubOS);

      const unsubFin = onSnapshot(
        query(collection(db, 'financeiro'), where('empresaId', '==', targetEmpId)),
        (snap) => {
          const list: Financeiro[] = [];
          snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Financeiro));
          if (list.length > 0) setFinanceiro(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, "financeiro")
      );
      activeUnsubs.push(unsubFin);

      const unsubCaixa = onSnapshot(
        query(collection(db, 'caixa'), where('empresaId', '==', targetEmpId)),
        (snap) => {
          const list: Caixa[] = [];
          snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Caixa));
          if (list.length > 0) {
            setCaixaStatus(list[0]);
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, "caixa")
      );
      activeUnsubs.push(unsubCaixa);

      const unsubVendas = onSnapshot(
        query(collection(db, 'vendas'), where('empresaId', '==', targetEmpId)),
        (snap) => {
          const list: Venda[] = [];
          snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Venda));
          if (list.length > 0) setVendas(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, "vendas")
      );
      activeUnsubs.push(unsubVendas);

      const unsubFornecedores = onSnapshot(
        query(collection(db, 'fornecedores'), where('empresaId', '==', targetEmpId)),
        (snap) => {
          const list: Fornecedor[] = [];
          snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() } as Fornecedor));
          if (list.length > 0) setFornecedores(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, "fornecedores")
      );
      activeUnsubs.push(unsubFornecedores);

    } catch (e) {
      console.error("Firestore loading subscription error: ", e);
    }

    return () => {
      cleanAllListeners();
    };
  }, [user?.uid, company?.id]);

  // Login actions
  const loginWithGoogle = async () => {
    setLoading(true);
    setLoginError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Authentication Error: ", error);
      setLoginError(error.message || "Erro ao conectar com Google Auth.");
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    setLoginError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Login Error: ", error);
      let translatedMessage = "Erro ao autenticar. Verifique suas credenciais.";
      if (error?.code === "auth/user-not-found" || error?.code === "auth/wrong-password" || error?.code === "auth/invalid-credential") {
        translatedMessage = "E-mail ou senha incorretos.";
      } else if (error?.code === "auth/invalid-email") {
        translatedMessage = "E-mail informado é inválido.";
      }
      setLoginError(translatedMessage);
      throw new Error(translatedMessage);
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    setLoginError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
      }
    } catch (error: any) {
      console.error("Registration Error: ", error);
      let translatedMessage = "Erro ao cadastrar usuário.";
      if (error?.code === "auth/email-already-in-use") {
        translatedMessage = "Este e-mail já está em uso.";
      } else if (error?.code === "auth/weak-password") {
        translatedMessage = "A senha deve ter pelo menos 6 caracteres.";
      } else if (error?.code === "auth/invalid-email") {
        translatedMessage = "E-mail informado é inválido.";
      }
      setLoginError(translatedMessage);
      throw new Error(translatedMessage);
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async () => {
    setLoading(true);
    setLoginError(null);
    try {
      // Login Anonymously to trigger dynamic firebase session
      await signInAnonymously(auth);
    } catch (error: any) {
      console.log("Proceeding with full Client Offline Mode", error);
      // Fallback: Mock login
      setUser({
        uid: "demo_user_id",
        name: "Clécio Santos",
        email: "cleciotecnologia@gmail.com",
        role: "Administrador",
        empresaId: INITIAL_COMPANY.id,
        createdAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout Error: ", error);
    } finally {
      setLoading(false);
    }
  };

  // ERP Actions implementation
  const addCliente = async (c: Omit<Cliente, 'id' | 'empresaId' | 'createdAt'> & { empresaId?: string }) => {
    const id = "cli_" + Math.random().toString(36).substr(2, 9);
    const { empresaId, ...clientData } = c;
    const newCliente: Cliente = {
      ...clientData,
      id,
      empresaId: empresaId || company.id,
      createdAt: new Date().toISOString()
    };

    setClientes(prev => [newCliente, ...prev]);

    if (firebaseUser) {
      await executeWrite("clientes", id, newCliente, 'set');
    }
  };

  const editCliente = async (id: string, updatedFields: Partial<Cliente>) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));

    if (firebaseUser) {
      await executeWrite("clientes", id, updatedFields, 'merge');
    }
  };

  const deleteCliente = async (id: string) => {
    const currentCli = clientes.find(c => c.id === id);
    const cliName = currentCli ? currentCli.name : id;
    addLocalAuditLog("Exclusão de Cliente", `Cliente '${cliName}' excluído do sistema.`);

    if (firebaseUser) {
      setClientes(prev => prev.filter(c => c.id !== id));
      try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        if (navigator.onLine) {
          await deleteDoc(doc(db, "clientes", id));
        }
      } catch (err) {
        console.warn("Direct online deletion failed, local cache updated.", err);
      }
    } else {
      setClientes(prev => prev.filter(c => c.id !== id));
    }
  };

  const addVeiculo = async (v: Omit<Veiculo, 'id' | 'empresaId'>) => {
    const id = "vei_" + Math.random().toString(36).substr(2, 9);
    const newVeiculo: Veiculo = {
      ...v,
      id,
      empresaId: company.id
    };

    setVeiculos(prev => [newVeiculo, ...prev]);

    if (firebaseUser) {
      await executeWrite("veiculos", id, newVeiculo, 'set');
    }
  };

  const editVeiculo = async (id: string, updatedFields: Partial<Veiculo>) => {
    setVeiculos(prev => prev.map(v => v.id === id ? { ...v, ...updatedFields } : v));

    if (firebaseUser) {
      await executeWrite("veiculos", id, updatedFields, 'merge');
    }
  };

  const deleteVeiculo = async (id: string) => {
    const currentV = veiculos.find(v => v.id === id);
    const vInfo = currentV ? `${currentV.brand} ${currentV.model} (${currentV.plate})` : id;
    addLocalAuditLog("Exclusão de Veículo", `Veículo '${vInfo}' excluído do cadastro.`);

    if (firebaseUser) {
      setVeiculos(prev => prev.filter(v => v.id !== id));
      try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        if (navigator.onLine) {
          await deleteDoc(doc(db, "veiculos", id));
        }
      } catch (err) {
        console.warn("Direct online deletion failed, local cache updated.", err);
      }
    } else {
      setVeiculos(prev => prev.filter(v => v.id !== id));
    }
  };

  const addProduto = async (p: Omit<Produto, 'id' | 'empresaId'>) => {
    const id = "prod_" + Math.random().toString(36).substr(2, 9);
    const newProduto: Produto = {
      ...p,
      id,
      empresaId: company.id
    };

    setProdutos(prev => [newProduto, ...prev]);

    if (firebaseUser) {
      await executeWrite("produtos", id, newProduto, 'set');
    }
  };

  const updateProdutoStock = async (id: string, qty: number) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, quantity: qty } : p));

    if (firebaseUser) {
      await executeWrite("produtos", id, { quantity: qty }, 'merge');
    }
  };

  const editProduto = async (id: string, updatedFields: Partial<Produto>) => {
    const currentProd = produtos.find(p => p.id === id);
    if (currentProd && updatedFields.sellPrice !== undefined && updatedFields.sellPrice !== currentProd.sellPrice) {
      addLocalAuditLog("Alteração de Preço de Venda", `Preço de venda de '${currentProd.name}' modificado de R$ ${currentProd.sellPrice} para R$ ${updatedFields.sellPrice}`);
    } else {
      const pName = currentProd ? currentProd.name : id;
      addLocalAuditLog("Alteração de Produto", `Cadastro do produto '${pName}' atualizado.`);
    }

    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields } : p));

    if (firebaseUser) {
      await executeWrite("produtos", id, updatedFields, 'merge');
    }
  };

  const deleteProduto = async (id: string) => {
    const currentProd = produtos.find(p => p.id === id);
    const prodName = currentProd ? currentProd.name : id;
    addLocalAuditLog("Exclusão de Produto", `Produto/Peça '${prodName}' excluído do estoque.`);

    if (firebaseUser) {
      setProdutos(prev => prev.filter(p => p.id !== id));
      try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        if (navigator.onLine) {
          await deleteDoc(doc(db, "produtos", id));
        }
      } catch (err) {
        console.warn("Direct online deletion failed, local cache updated.", err);
      }
    } else {
      setProdutos(prev => prev.filter(p => p.id !== id));
    }
  };

  const addServico = async (s: Omit<Servico, 'id' | 'empresaId'>) => {
    const id = "srv_" + Math.random().toString(36).substr(2, 9);
    const newServico: Servico = {
      ...s,
      id,
      empresaId: company.id
    };

    setServicos(prev => [newServico, ...prev]);

    if (firebaseUser) {
      await executeWrite("servicos", id, newServico, 'set');
    }
  };

  const editServico = async (id: string, updatedFields: Partial<Servico>) => {
    setServicos(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));

    if (firebaseUser) {
      await executeWrite("servicos", id, updatedFields, 'merge');
    }
  };

  const deleteServico = async (id: string) => {
    if (firebaseUser) {
      // Deletar localmente
      setServicos(prev => prev.filter(s => s.id !== id));
      try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        if (navigator.onLine) {
          await deleteDoc(doc(db, "servicos", id));
        }
      } catch (err) {
        console.warn("Direct online deletion failed, local cache updated.", err);
      }
    } else {
      setServicos(prev => prev.filter(s => s.id !== id));
    }
  };

  const addOS = async (os: Omit<OrdemServico, 'id' | 'empresaId' | 'createdAt'>) => {
    const id = "OS-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900);
    const newOS: OrdemServico = {
      ...os,
      id,
      empresaId: company.id,
      createdAt: new Date().toISOString()
    };

    addLocalAuditLog("Abertura de OS", `Nova Ordem de Serviço criada: ${id} para veículo placa ${os.plate}`);

    setOrdensServico(prev => [newOS, ...prev]);

    // Deduct items used on OS from stock parts
    os.parts.forEach(p => {
      const product = produtos.find(item => item.id === p.id);
      if (product) {
        updateProdutoStock(product.id, Math.max(0, product.quantity - p.quantity));
      }
    });

    if (firebaseUser) {
      await executeWrite("ordens_servico", id, newOS, 'set');
    }
  };

  const editOS = async (id: string, fields: Partial<OrdemServico>) => {
    const currentOS = ordensServico.find(o => o.id === id);
    if (currentOS && fields.status && fields.status !== currentOS.status) {
      addLocalAuditLog("Alteração de Status de OS", `OS #${id} (Placa ${currentOS.plate}) alterada de '${currentOS.status}' para '${fields.status}'`);
    } else {
      addLocalAuditLog("Edição de OS", `Dados da Ordem de Serviço #${id} atualizados.`);
    }

    const updatedWithTime = {
      ...fields,
      updatedAt: new Date().toISOString()
    };

    setOrdensServico(prev => prev.map(item => item.id === id ? { ...item, ...updatedWithTime } : item));

    if (firebaseUser) {
      await executeWrite("ordens_servico", id, updatedWithTime, 'merge');
    }
  };

  const deleteOS = async (id: string) => {
    const currentOS = ordensServico.find(o => o.id === id);
    const details = currentOS ? `OS #${id} (Placa ${currentOS.plate}, Cliente: ${currentOS.clienteName || "Não Informado"}) excluída permanentemente.` : `OS #${id} excluída.`;
    addLocalAuditLog("Exclusão de OS", details);

    setOrdensServico(prev => prev.filter(o => o.id !== id));

    if (firebaseUser) {
      try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        if (navigator.onLine) {
          await deleteDoc(doc(db, "ordens_servico", id));
        }
      } catch (err) {
        console.warn("Direct online deletion failed, local cache updated.", err);
      }
    }
  };

  const addVenda = async (v: Omit<Venda, 'id' | 'empresaId' | 'date'>) => {
    const id = "vnd_" + Math.random().toString(36).substr(2, 9);
    const newVenda: Venda = {
      ...v,
      id,
      empresaId: company.id,
      date: new Date().toISOString()
    };

    addLocalAuditLog("Nova Venda Balcão", `Venda Balcão #${id.toUpperCase()} registrada no total de R$ ${v.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`);

    // Create a financial entry for cash income
    const finId = "fin_" + Math.random().toString(36).substr(2, 9);
    const salesIncome: Financeiro = {
      id: finId,
      empresaId: company.id,
      description: `Venda PDV Balcão #${id.substr(4, 5).toUpperCase()}`,
      type: "Receita",
      amount: v.total,
      dueDate: new Date().toISOString().split('T')[0],
      status: "Pago",
      category: "Vendas Peças",
      createdAt: new Date().toISOString()
    };
    
    setVendas(prev => [newVenda, ...prev]);
    setFinanceiro(prev => [salesIncome, ...prev]);

    // Deduct sold items from stock
    v.items.forEach(sold => {
      const product = produtos.find(p => p.id === sold.produtoId);
      if (product) {
        updateProdutoStock(product.id, Math.max(0, product.quantity - sold.quantity));
      }
    });

    // Update current cash register balance
    if (caixaStatus && caixaStatus.status === "Aberto") {
      setCaixaStatus(prev => prev ? {
        ...prev,
        currentAmount: prev.currentAmount + v.total
      } : null);
    }

    if (firebaseUser) {
      await executeWrite("vendas", id, newVenda, 'set');
      await executeWrite("financeiro", finId, salesIncome, 'set');

      if (caixaStatus && caixaStatus.status === "Aberto") {
        const openedCaixaId = caixaStatus.id;
        const newAmt = caixaStatus.currentAmount + v.total;
        await executeWrite("caixa", openedCaixaId, { currentAmount: newAmt }, 'merge');
      }
    }
  };

  const addFinanceiro = async (f: Omit<Financeiro, 'id' | 'empresaId' | 'createdAt'>) => {
    const id = "fin_" + Math.random().toString(36).substr(2, 9);
    const newEntry: Financeiro = {
      ...f,
      id,
      empresaId: company.id,
      createdAt: new Date().toISOString()
    };

    addLocalAuditLog("Inserção Financeira", `Novo lançamento de ${f.type === 'Receita' ? 'Receita' : 'Despesa'}: '${f.description}' de R$ ${f.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`);

    setFinanceiro(prev => [newEntry, ...prev]);

    if (firebaseUser) {
      await executeWrite("financeiro", id, newEntry, 'set');
    }
  };

  const editFinanceiro = async (id: string, fields: Partial<Financeiro>) => {
    addLocalAuditLog("Edição Financeira", `Lançamento financeiro #${id} foi atualizado.`);
    setFinanceiro(prev => prev.map(f => f.id === id ? { ...f, ...fields } : f));

    if (firebaseUser) {
      await executeWrite("financeiro", id, fields, 'merge');
    }
  };

  const abrirCaixa = async (amount: number) => {
    const updatedCaixa: Caixa = {
      id: "cx_" + new Date().toISOString().substring(0, 10),
      empresaId: company.id,
      status: "Aberto",
      initialAmount: amount,
      currentAmount: amount,
      openedAt: new Date().toISOString()
    };

    addLocalAuditLog("Abertura de Caixa", `Operador de caixa iniciou o caixa com R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

    setCaixaStatus(updatedCaixa);

    if (firebaseUser) {
      await executeWrite("caixa", updatedCaixa.id, updatedCaixa, 'set');
    }
  };

  const fecharCaixa = async (closedDetails?: Partial<Caixa> & Record<string, any>) => {
    if (!caixaStatus) return;
    const closedCaixa: Caixa = {
      ...caixaStatus,
      ...closedDetails,
      status: "Fechado",
      closedAt: new Date().toISOString()
    };

    addLocalAuditLog("Fechamento de Caixa", `Operador fechou o caixa com o saldo de R$ ${closedCaixa.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

    setCaixaStatus(closedCaixa);

    if (firebaseUser) {
      await executeWrite("caixa", closedCaixa.id, closedCaixa, 'merge');
    }
  };

  const addFornecedor = async (f: Omit<Fornecedor, 'id' | 'empresaId'>) => {
    const id = "for_" + Math.random().toString(36).substr(2, 9);
    const newFornecedor: Fornecedor = {
      ...f,
      id,
      empresaId: company.id
    };

    setFornecedores(prev => [newFornecedor, ...prev]);

    if (firebaseUser) {
      await executeWrite("fornecedores", id, newFornecedor, 'set');
    }
  };

  const editFornecedor = async (id: string, updatedFields: Partial<Fornecedor>) => {
    setFornecedores(prev => prev.map(f => f.id === id ? { ...f, ...updatedFields } : f));

    if (firebaseUser) {
      await executeWrite("fornecedores", id, updatedFields, 'merge');
    }
  };

  const deleteFornecedor = async (id: string) => {
    if (firebaseUser) {
      // Deletar localmente
      setFornecedores(prev => prev.filter(f => f.id !== id));
      try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        if (navigator.onLine) {
          await deleteDoc(doc(db, "fornecedores", id));
        }
      } catch (err) {
        console.warn("Direct online deletion failed, local cache updated.", err);
      }
    } else {
      setFornecedores(prev => prev.filter(f => f.id !== id));
    }
  };

  const updateCompany = async (updatedFields: Partial<Company>) => {
    setCompany(prev => ({ ...prev, ...updatedFields }));
    if (firebaseUser) {
      try {
        const { updateDoc, doc } = await import('firebase/firestore');
        if (navigator.onLine) {
          const compRef = doc(db, 'empresas', user?.empresaId || company.id);
          await updateDoc(compRef, updatedFields);
        }
      } catch (err) {
        console.warn("Direct online company update failed, local state modified.", err);
      }
    }
  };

  // AI API Integrations call server side proxy
  const getSmartDiagnosis = async (model: string, plate: string, problem: string) => {
    setAiLoading(true);
    try {
      const response = await fetch("/api/gemini/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, plate, problemDescription: problem })
      });
      return await response.json();
    } catch (e) {
      console.error("AI service error, pulling fallback", e);
      return {
        diagnosis: "Sintoma de falha mecânica genérica ou leitura instável do atuador de vácuo. Proceda para teste analógico.",
        suggestedParts: [{ name: "Kit de Filtros de Ar e Combustível Bosch", confidence: "70%", estCost: "R$ 150,00", qtyNeeded: 1 }],
        suggestedServices: [{ description: "Análise computadorizada OBD", estHours: "1h", estLaborCost: "R$ 90,00" }],
        estimatedTotal: "R$ 240,00",
        urgency: "Média"
      };
    } finally {
      setAiLoading(false);
    }
  };

  const sendChatMessage = async (messages: { role: 'user' | 'assistant'; text: string }[]) => {
    setAiLoading(true);
    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });
      const data = await response.json();
      return data.text || "Assistente temporariamente indisponível.";
    } catch (e) {
      return "Erro na rede. Por favor, tente enviar novamente.";
    } finally {
      setAiLoading(false);
    }
  };

  const triggerDailyBackup = (isManual?: boolean) => {
    try {
      const backupPayload = {
        metadata: {
          appName: "AutoTech ERP",
          exportedAt: new Date().toISOString(),
          tenantId: company.id,
          companyName: company.name,
          backupType: isManual ? "Manual (Disparado Audit)" : "Automático (Diário)",
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

      const payloadStr = JSON.stringify(backupPayload, null, 2);
      const sizeKb = parseFloat((payloadStr.length / 1024).toFixed(2));
      const formattedDate = new Date().toISOString().substring(0, 10);
      const formattedTime = new Date().toLocaleTimeString('pt-BR');
      
      const newBackup: AutoBackupItem = {
        id: "backup_" + Math.random().toString(36).substring(2, 11),
        date: `${formattedDate} ${formattedTime}`,
        totalRecords: backupPayload.metadata.totalRecords,
        fileName: `autotech_auto_backup_${isManual ? 'manual' : 'diario'}_${formattedDate}_${Date.now()}.json`,
        sizeKb,
        payload: payloadStr
      };

      let existing: AutoBackupItem[] = [];
      const stored = localStorage.getItem("autotech_auto_backups");
      if (stored) {
        try {
          existing = JSON.parse(stored);
        } catch (_) {}
      }

      const updated = [newBackup, ...existing];
      localStorage.setItem("autotech_auto_backups", JSON.stringify(updated));
      setAutoBackups(updated);
      
      if (!isManual) {
        localStorage.setItem("autotech_last_auto_backup_date", formattedDate);
      }
    } catch (err) {
      console.error("Failed to run automatic backup:", err);
    }
  };

  const deleteAutoBackup = (id: string) => {
    const stored = localStorage.getItem("autotech_auto_backups");
    if (stored) {
      try {
        const existing: AutoBackupItem[] = JSON.parse(stored);
        const filtered = existing.filter(b => b.id !== id);
        localStorage.setItem("autotech_auto_backups", JSON.stringify(filtered));
        setAutoBackups(filtered);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addLocalAuditLog = (action: string, details: string) => {
    try {
      const timestamp = new Date().toISOString();
      const newLog: LocalAuditLog = {
        id: "log_" + Math.random().toString(36).substring(2, 11),
        empresaId: company.id || "sandbox",
        action,
        details,
        userName: user?.name || "Visitante / Sandbox",
        userEmail: user?.email || "sandbox@mecanica.com",
        timestamp
      };

      let existing: LocalAuditLog[] = [];
      const stored = localStorage.getItem("autotech_local_audit_logs");
      if (stored) {
        try {
          existing = JSON.parse(stored);
        } catch (_) {}
      }

      const updated = [newLog, ...existing].slice(0, 50);
      localStorage.setItem("autotech_local_audit_logs", JSON.stringify(updated));
      setLocalAuditLogs(updated);
    } catch (err) {
      console.error("Failed to add local audit log:", err);
    }
  };

  // Load local audit logs on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem("autotech_local_audit_logs");
      if (stored) {
        setLocalAuditLogs(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load local audit logs:", err);
    }
  }, []);

  // Load and check daily automatic backup trigger on startup and updates
  useEffect(() => {
    try {
      const stored = localStorage.getItem("autotech_auto_backups");
      if (stored) {
        setAutoBackups(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to parse auto backup history", err);
    }

    const checkDailyBackup = () => {
      const todayDate = new Date().toISOString().substring(0, 10);
      const lastBackupDate = localStorage.getItem("autotech_last_auto_backup_date");
      
      if (lastBackupDate !== todayDate) {
        console.log("⏱️ Automatic daily database backup triggered.");
        triggerDailyBackup(false);
      }
    };

    const timer = setTimeout(checkDailyBackup, 3000);
    return () => clearTimeout(timer);
  }, [clientes, veiculos, produtos, ordensServico, financeiro, fornecedores, vendas, company]);

  return (
    <AppContext.Provider value={{
      user,
      company,
      setUser,
      setCompany,
      clientes,
      veiculos,
      produtos,
      servicos,
      ordensServico,
      financeiro,
      fornecedores,
      caixaStatus,
      vendas,
      loading,
      aiLoading,
      loginError,
      
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      loginDemo,
      logout,
      
      addCliente,
      editCliente,
      deleteCliente,
      addVeiculo,
      editVeiculo,
      deleteVeiculo,
      addProduto,
      updateProdutoStock,
      editProduto,
      deleteProduto,
      addServico,
      editServico,
      deleteServico,
      addOS,
      editOS,
      addVenda,
      addFinanceiro,
      editFinanceiro,
      abrirCaixa,
      fecharCaixa,
      addFornecedor,
      editFornecedor,
      deleteFornecedor,
      updateCompany,
      
      getSmartDiagnosis,
      sendChatMessage,

      // Offline properties
      isOnline,
      pendingActionsCount,
      syncPendingActions,
      syncing,

      // Daily Automatic Backups
      autoBackups,
      triggerDailyBackup,
      deleteAutoBackup,

      // Local Audit Logs
      localAuditLogs,
      addLocalAuditLog
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
