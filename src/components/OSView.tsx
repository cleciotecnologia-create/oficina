import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Cpu, 
  Phone, 
  FileCheck, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  User, 
  Car, 
  ChevronRight, 
  Printer, 
  X,
  MessageSquare,
  Sparkles,
  Bell,
  CalendarRange,
  Calendar,
  Clock,
  Trash2,
  RefreshCw,
  Link,
  History,
  CreditCard,
  Kanban,
  List,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrdemServico, ServiceItem, PartUsed, Cliente, Veiculo, Servico, OSStatus } from '../types';
import { AUTO_SUGGESTIONS } from '../lib/autoSuggestions';
import { specsCache } from '../lib/specsCache';
import { playSuccessSound } from '../lib/audio';

interface OSViewProps {
  initialSearchPlate?: string;
  onClearInitialSearch?: () => void;
}

export const OSView: React.FC<OSViewProps> = ({ initialSearchPlate = '', onClearInitialSearch }) => {
  const { 
    ordensServico, 
    addOS, 
    editOS, 
    deleteOS,
    addVeiculo,
    clientes, 
    editCliente,
    veiculos, 
    produtos, 
    servicos,
    getSmartDiagnosis, 
    aiLoading,
    company
  } = useApp();

  const [activeTab, setActiveTab] = useState<'lista' | 'nova' | 'orcamento'>('lista');
  const [pdfOSSelected, setPdfOSSelected] = useState<OrdemServico | null>(null);
  const [pdfMode, setPdfMode] = useState<'os' | 'danfe-nfe' | 'danfe-nfse'>('os');
  const [simulateUf, setSimulateUf] = useState<string>('');
  const [isPrintSelectorOpen, setIsPrintSelectorOpen] = useState(false);

  React.useEffect(() => {
    const handleOpenNewOS = () => {
      setActiveTab('nova');
    };
    window.addEventListener('open-new-os', handleOpenNewOS);
    return () => {
      window.removeEventListener('open-new-os', handleOpenNewOS);
    };
  }, []);

  React.useEffect(() => {
    if (initialSearchPlate) {
      setSearchPlate(initialSearchPlate);
      setActiveTab('lista');
      if (onClearInitialSearch) {
        onClearInitialSearch();
      }
    }
  }, [initialSearchPlate, onClearInitialSearch]);
  
  // Orçamento Fácil states
  const [easyClientName, setEasyClientName] = useState('');
  const [easyClientPhone, setEasyClientPhone] = useState('');
  const [easyClientEmail, setEasyClientEmail] = useState('');
  const [easyVehicleDesc, setEasyVehicleDesc] = useState('');
  const [easyVehiclePlate, setEasyVehiclePlate] = useState('');
  const [easyServices, setEasyServices] = useState<ServiceItem[]>([]);
  const [easyParts, setEasyParts] = useState<PartUsed[]>([]);
  const [easyDiscount, setEasyDiscount] = useState<number>(0);
  
  // Budget direct SMTP email states
  const [isSendingBudgetEmail, setIsSendingBudgetEmail] = useState(false);
  const [emailBudgetFeedback, setEmailBudgetFeedback] = useState<string | null>(null);
  const [emailBudgetSuccess, setEmailBudgetSuccess] = useState<boolean | null>(null);
  
  // Quick manual input fields for Orçamento Fácil
  const [easySelectedSrvId, setEasySelectedSrvId] = useState('');
  const [easyManualSrvDesc, setEasyManualSrvDesc] = useState('');
  const [easyManualSrvPrice, setEasyManualSrvPrice] = useState('');
  const [easySelectedProdId, setEasySelectedProdId] = useState('');
  const [easySelectedProdQty, setEasySelectedProdQty] = useState('1');
  const [easyManualPartName, setEasyManualPartName] = useState('');
  const [easyManualPartPrice, setEasyManualPartPrice] = useState('');
  const [easyManualPartQty, setEasyManualPartQty] = useState('1');

  // Sharing flows
  const [showEasyShareModal, setShowEasyShareModal] = useState(false);
  const [easyShareMsg, setEasyShareMsg] = useState('');
  const [easySavedOSId, setEasySavedOSId] = useState<string | null>(null);

  const [searchPlate, setSearchPlate] = useState(initialSearchPlate || '');
  const [statusFilter, setStatusFilter] = useState('Todas');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [reopenOSId, setReopenOSId] = useState<string | null>(null);
  const [reopenReasonText, setReopenReasonText] = useState('');

  // Quick vehicle registration inside new OS creation
  const [showQuickVehicle, setShowQuickVehicle] = useState(false);
  const [quickBrand, setQuickBrand] = useState('');
  const [quickModel, setQuickModel] = useState('');
  const [quickYear, setQuickYear] = useState('2022');
  const [quickEngine, setQuickEngine] = useState('1.6 Flex');
  const [quickPlate, setQuickPlate] = useState('');
  const [quickKm, setQuickKm] = useState('');
  const [quickModelsList, setQuickModelsList] = useState<string[]>([]);
  const [quickVehSuccess, setQuickVehSuccess] = useState<string | null>(null);
  const [quickAiLoading, setQuickAiLoading] = useState(false);
  const [quickAiSpecs, setQuickAiSpecs] = useState<any | null>(null);
  const [quickAiError, setQuickAiError] = useState<string | null>(null);
  const [quickAiFeedback, setQuickAiFeedback] = useState<string | null>(null);
  const [quickAiIsFromCache, setQuickAiIsFromCache] = useState(false);

  // New OS form states
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Veiculo | null>(null);
  const [problemText, setProblemText] = useState('');
  const [diagnosisText, setDiagnosisText] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('Marcio Rezende');
  const [kmStr, setKmStr] = useState('');
  const [kmAnteriorEtiquetaStr, setKmAnteriorEtiquetaStr] = useState('');

  // Reminder configurations
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [vencimentoDays, setVencimentoDays] = useState(30);
  const [reminderDays, setReminderDays] = useState(3);
  const [faturamentoMode, setFaturamentoMode] = useState<'Balcão' | 'A faturar'>('Balcão');
  const [isOSPriority, setIsOSPriority] = useState(false);
  const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista');
  const [draggingOSId, setDraggingOSId] = useState<string | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<'Aguardando' | 'Em Execução' | 'Finalizado' | null>(null);

  // Scheduling states
  const [entryMode, setEntryMode] = useState<'imediata' | 'agendada'>('imediata');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('09:00');
  const [currentCalendarYear, setCurrentCalendarYear] = useState<number>(new Date().getFullYear());
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<number>(new Date().getMonth());

  // Camera capture states
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Camera capture states for license plate scanner
  const [showPlateScannerModal, setShowPlateScannerModal] = useState(false);
  const [plateScannerTarget, setPlateScannerTarget] = useState<'quick' | 'easy' | null>(null);
  const [plateScannerLoading, setPlateScannerLoading] = useState(false);
  const [plateScannerFeedback, setPlateScannerFeedback] = useState<string | null>(null);
  const [plateScannerError, setPlateScannerError] = useState<string | null>(null);
  const [plateCameraActive, setPlateCameraActive] = useState(false);
  const plateVideoRef = useRef<HTMLVideoElement | null>(null);
  const plateStreamRef = useRef<MediaStream | null>(null);

  const stopPlateCamera = () => {
    if (plateStreamRef.current) {
      plateStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (err) {
          console.error("Erro ao parar track da placa:", err);
        }
      });
      plateStreamRef.current = null;
    }
    setPlateCameraActive(false);
  };

  const startPlateCamera = async () => {
    setPlateScannerError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      plateStreamRef.current = stream;
      if (plateVideoRef.current) {
        plateVideoRef.current.srcObject = stream;
        plateVideoRef.current.play().catch(err => {
          console.error("Erro ao dar play no vídeo da placa:", err);
        });
      }
      setPlateCameraActive(true);
    } catch (err: any) {
      console.error("Erro ao acessar câmera para ler placa:", err);
      setPlateScannerError("Não foi possível acessar a câmera do dispositivo. Verifique as permissões de privacidade ou faça upload de uma foto do computador/celular.");
    }
  };

  const handlePlateCaptureAndProcess = async () => {
    if (!plateVideoRef.current) return;
    setPlateScannerLoading(true);
    setPlateScannerError(null);
    setPlateScannerFeedback("Capturando imagem...");
    try {
      const video = plateVideoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Não foi possível inicializar o canvas.");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      setPlateScannerFeedback("Analisando com a Inteligência Artificial do Gemini...");
      const res = await fetch("/api/gemini/scan-plate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl })
      });

      if (!res.ok) {
        throw new Error("Resposta inválida do servidor.");
      }

      const data = await res.json();
      if (data.plate) {
        const cleanedPlate = data.plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (plateScannerTarget === 'quick') {
          setQuickPlate(cleanedPlate);
          if (data.brand) {
            setQuickBrand(data.brand);
            const foundSug = AUTO_SUGGESTIONS.find(s => s.name.toLowerCase() === data.brand.toLowerCase());
            if (foundSug) {
              setQuickModelsList(foundSug.models);
            }
          }
          if (data.model) {
            setQuickModel(data.model);
          }
        } else if (plateScannerTarget === 'easy') {
          setEasyVehiclePlate(cleanedPlate);
          if (data.brand || data.model) {
            setEasyVehicleDesc(`${data.brand || ''} ${data.model || ''}`.trim());
          }
        }
        playSuccessSound();
        setPlateScannerFeedback(`Placa ${cleanedPlate} identificada com sucesso! (${data.confidence === 'Alto' ? 'Confiança Alta' : 'Confiança Média'})`);
        setTimeout(() => {
          stopPlateCamera();
          setShowPlateScannerModal(false);
          setPlateScannerFeedback(null);
        }, 2000);
      } else {
        throw new Error("Não foi possível identificar nenhuma placa de veículo na imagem.");
      }
    } catch (err: any) {
      console.error(err);
      setPlateScannerError(err.message || "Erro desconhecido ao ler a placa.");
    } finally {
      setPlateScannerLoading(false);
    }
  };

  const handlePlateFileUploadAndProcess = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setPlateScannerLoading(true);
    setPlateScannerError(null);
    setPlateScannerFeedback("Carregando arquivo...");

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      setPlateScannerFeedback("Analisando placa com a Inteligência Artificial do Gemini...");
      const res = await fetch("/api/gemini/scan-plate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 })
      });

      if (!res.ok) {
        throw new Error("Resposta inválida do servidor ao analisar arquivo.");
      }

      const data = await res.json();
      if (data.plate) {
        const cleanedPlate = data.plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (plateScannerTarget === 'quick') {
          setQuickPlate(cleanedPlate);
          if (data.brand) {
            setQuickBrand(data.brand);
            const foundSug = AUTO_SUGGESTIONS.find(s => s.name.toLowerCase() === data.brand.toLowerCase());
            if (foundSug) {
              setQuickModelsList(foundSug.models);
            }
          }
          if (data.model) {
            setQuickModel(data.model);
          }
        } else if (plateScannerTarget === 'easy') {
          setEasyVehiclePlate(cleanedPlate);
          if (data.brand || data.model) {
            setEasyVehicleDesc(`${data.brand || ''} ${data.model || ''}`.trim());
          }
        }
        playSuccessSound();
        setPlateScannerFeedback(`Placa ${cleanedPlate} identificada com sucesso!`);
        setTimeout(() => {
          stopPlateCamera();
          setShowPlateScannerModal(false);
          setPlateScannerFeedback(null);
        }, 2000);
      } else {
        throw new Error("Não foi possível identificar nenhuma placa nesta imagem. Tente outra foto mais nítida.");
      }
    } catch (err: any) {
      console.error(err);
      setPlateScannerError(err.message || "Erro ao processar imagem.");
    } finally {
      setPlateScannerLoading(false);
    }
  };

  // Stop camera feed helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (err) {
          console.error("Erro ao parar track:", err);
        }
      });
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Start camera feed helper
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Rear camera first
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error("Erro ao play no video:", err);
        });
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error("Erro ao acessar câmera:", err);
      setCameraError("Não foi possível acessar a câmera do dispositivo. Verifique as permissões de privacidade ou envie um arquivo diretamente.");
    }
  };

  // Capture frame as Base64 JPEG string
  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedPhotos(prev => [...prev, dataUrl]);
      }
    } catch (err) {
      console.error("Erro ao capturar foto:", err);
      setCameraError("Falha ao processar captura física do frame.");
    }
  };

  // Handle local file fallback uploads
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCapturedPhotos(prev => [...prev, reader.result as string]);
        }
      };
      reader.onerror = () => {
        setCameraError("Erro ao processar arquivo local de imagem.");
      };
      reader.readAsDataURL(file);
    });
  };

  // Delete specific capture index
  const deleteCapturedPhoto = (indexToDelete: number) => {
    setCapturedPhotos(prev => prev.filter((_, idx) => idx !== indexToDelete));
  };

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (plateStreamRef.current) {
        plateStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Checklist states
  const [checklist, setChecklist] = useState([
    { label: "Nível de Combustível", status: "ok" as const },
    { label: "Objetos no Carro", status: "ok" as const },
    { label: "Avarias Existentes", status: "na" as const },
    { label: "Nível de Óleo do Motor", status: "ok" as const },
    { label: "Nível do Fluido de Freio", status: "ok" as const },
    { label: "Inspeção de Pastilhas/Discos", status: "ok" as const },
    { label: "Luzes de Sinalização", status: "ok" as const },
    { label: "Água do Radiador", status: "ok" as const },
    { label: "Estado do Filtro de Cabine", status: "na" as const }
  ]);

  // Added items in current OS builder
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [parts, setParts] = useState<PartUsed[]>([]);
  
  // Custom manual service inputs
  const [selectedSrvId, setSelectedSrvId] = useState('');
  const [manualServiceDesc, setManualServiceDesc] = useState('');
  const [manualServicePrice, setManualServicePrice] = useState('');

  // Custom manual parts input selector
  const [selectedProdId, setSelectedProdId] = useState('');
  const [selectedProdQty, setSelectedProdQty] = useState('1');
  const [isPartClientSupplied, setIsPartClientSupplied] = useState(false);
  const [useManualPart, setUseManualPart] = useState(false);
  const [manualPartNameInput, setManualPartNameInput] = useState('');
  const [manualPartPriceInput, setManualPartPriceInput] = useState('');
  const [partOrigin, setPartOrigin] = useState<'estoque' | 'cliente' | 'terceiros'>('estoque');
  const [partSupplierName, setPartSupplierName] = useState('');
  const [partCostPrice, setPartCostPrice] = useState('');

  // Print/Share modal states
  const [activeOSForModal, setActiveOSForModal] = useState<OrdemServico | null>(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [whatsappTextCreated, setWhatsappTextCreated] = useState('');
  const [customSignName, setCustomSignName] = useState('');

  // AI Diagnostic output helper
  const [aiDiagnosticSummary, setAiDiagnosticSummary] = useState<any | null>(null);

  // Safe local date formatting without timezone-shifting
  const safeFormatLocalDate = (dateStr: string | undefined): string => {
    if (!dateStr) return 'vazio';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
        }
      }
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('pt-BR');
    } catch (e) {
      return dateStr || '';
    }
  };
  
  // Helper to check if a vehicle is within warranty return period
  const getWarrantyReturnInfo = (veiculoId: string, currentOsId?: string) => {
    if (!veiculoId) return null;
    const warrantyDays = company?.warrantyDays !== undefined ? company.warrantyDays : 90;
    
    // Find all finalized/delivered OSs for this vehicle, excluding current OS
    const priorOss = ordensServico.filter(os => 
      os.veiculoId === veiculoId && 
      (os.status === 'Finalizada' || os.status === 'Entregue') && 
      os.id !== currentOsId
    );
    
    if (priorOss.length === 0) return null;
    
    // Find the most recent finalized/delivered OS
    const sortedPrior = [...priorOss].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const latestOS = sortedPrior[0];
    const latestOSDate = new Date(latestOS.createdAt);
    const diffTime = Math.abs(new Date().getTime() - latestOSDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const isWithinWarranty = diffDays <= warrantyDays;
    
    return {
      isWithinWarranty,
      diffDays,
      warrantyDays,
      latestOS
    };
  };

  // Status Colors Mapping
  const statusColors: Record<string, string> = {
    'Agendada': 'border-purple-900 bg-purple-950/20 text-purple-400',
    'Aberta': 'border-blue-900 bg-blue-950/20 text-blue-400',
    'Em análise': 'border-yellow-900 bg-yellow-950/20 text-yellow-400',
    'Aguardando peça': 'border-orange-950 bg-orange-950/20 text-orange-400',
    'Em execução': 'border-red-950 bg-red-950/25 text-red-500 font-bold',
    'Finalizada': 'border-green-900 bg-green-950/20 text-green-400',
    'Entregue': 'border-emerald-600 bg-emerald-950/20 text-emerald-400',
    'Garantia Reaberta': 'border-purple-600 bg-purple-950/35 text-purple-400 font-extrabold shadow-[0_0_10px_rgba(168,85,247,0.2)]'
  };

  // Filter and sort OS list chronologically
  const filteredOS = ordensServico.filter(os => {
    const matchSearch = os.plate.toLowerCase().includes(searchPlate.toLowerCase()) || 
                        os.clienteName.toLowerCase().includes(searchPlate.toLowerCase()) ||
                        os.id.toLowerCase().includes(searchPlate.toLowerCase());
    const matchStatus = statusFilter === 'Todas' || os.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  // Call Gemini AI Auto Diagnosis
  const handleAiAutoDiagnosis = async () => {
    if (!selectedVehicle || !problemText) {
      alert("Por favor, selecione primeiro um Veículo de cliente e preencha o campo de Sinais/Problemas para que a inteligência do Gemini possa interpretar os erros!");
      return;
    }
    
    const specCar = `${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.year} - ${selectedVehicle.engine}`;
    
    let promptKMDetails = "";
    const currentKmParsed = parseInt(kmStr) || selectedVehicle.km || 0;
    const previousKmParsed = parseInt(kmAnteriorEtiquetaStr) || 0;

    if (currentKmParsed > 0 || previousKmParsed > 0) {
      promptKMDetails = `\n\n[MÉTRICAS DE QUILOMETRAGEM - ANÁLISE DE MANUTENÇÃO PREVENTIVA]:
- Quilometragem Atual do Odômetro: ${currentKmParsed.toLocaleString('pt-BR')} km
- Quilometragem da Última Etiqueta de Troca de Óleo / Revisão Registrada: ${previousKmParsed > 0 ? previousKmParsed.toLocaleString('pt-BR') + ' km' : 'Não informada'}`;

      if (currentKmParsed > 0 && previousKmParsed > 0) {
        const diffKm = currentKmParsed - previousKmParsed;
        promptKMDetails += `\n- Distância Percorrida (Rodado desde a última etiqueta): ${diffKm.toLocaleString('pt-BR')} km.
INSTRUÇÃO EXTRA AO GEMINI: Como o cliente rodou ${diffKm.toLocaleString('pt-BR')} km desde a última etiqueta de revisão, faça uma análise crítica detalhada sobre as peças que necessitam de MANUTENÇÃO PREVENTIVA IMEDIATA (como óleo do motor, filtro de óleo, filtro de cabine, filtro de ar, fluido de freio, jogo de velas, correia dentada/sincronizadora, discos/pastilhas) e inclua estas sugestões de peças e serviços de forma correspondente e proporcional nos campos JSON 'suggestedParts' e 'suggestedServices' recomendados!`;
      } else {
        promptKMDetails += `\nINSTRUÇÃO EXTRA AO GEMINI: Com base na Quilometragem Geral de ${currentKmParsed.toLocaleString('pt-BR')} km, sugira as manutenções preventivas padrões recomendadas pelas montadoras para esta faixa quilométrica nos campos JSON 'suggestedParts' e 'suggestedServices'.`;
      }
    }

    // Call Context API Gemini Endpoint
    const result = await getSmartDiagnosis("gemini-2.5-flash", selectedVehicle.plate, `Veículo: ${specCar}. Sintomas relatados: ${problemText}${promptKMDetails}`);
    
    if (result) {
      setAiDiagnosticSummary(result);
      setDiagnosisText(result.diagnosis || "Surgiram indicações de fadiga estrutural nos componentes mecânicos analisados.");
      
      // Inject suggested service if available
      if (result.suggestedServices && result.suggestedServices.length > 0) {
        const mappedSrvs: ServiceItem[] = result.suggestedServices.map((apiSrv: any, index: number) => ({
          id: "srv_ai_" + index,
          description: apiSrv.description || "Inspeção Mecânica Relacionada",
          price: parseFloat(String(apiSrv.estLaborCost).replace(/[^0-9.]/g, '')) || 90
        }));
        setServices(prev => [...prev, ...mappedSrvs]);
      }
    }
  };

  // Auto-select newly created vehicle in OS flow when veiculos array updates
  useEffect(() => {
    if (showQuickVehicle && !selectedVehicle && veiculos.length > 0 && selectedClient) {
      const clientVehicles = veiculos.filter(v => v.clienteId === selectedClient.id);
      if (clientVehicles.length > 0) {
        const lastCreated = clientVehicles[clientVehicles.length - 1];
        setSelectedVehicle(lastCreated);
      }
    }
  }, [veiculos]);

  const handleQuickVehicleAiFill = async () => {
    if (!quickModel) {
      alert("Por favor, digite o modelo do veículo (ex: Prisma, Corolla, Civic) para podermos analisar via IA.");
      return;
    }
    
    setQuickAiLoading(true);
    setQuickAiError(null);
    setQuickAiSpecs(null);
    setQuickAiIsFromCache(false);
    
    // 1. Check local cache first with flexible multi-tiered matching
    const cached = specsCache.get(quickModel, quickYear || '2022', "", true);
    if (cached) {
      setQuickAiSpecs(cached);
      setQuickAiIsFromCache(true);
      if (cached.brand) {
        setQuickBrand(cached.brand);
        const foundSug = AUTO_SUGGESTIONS.find(s => s.name.toLowerCase() === cached.brand.toLowerCase());
        if (foundSug) {
          setQuickModelsList(foundSug.models);
        }
      }
      if (cached.engine) {
        setQuickEngine(cached.engine);
      }
      setQuickAiFeedback("Ficha recuperada do cache local instantaneamente (offline)!");
      setTimeout(() => setQuickAiFeedback(null), 4000);
      setQuickAiLoading(false);
      return;
    }
    
    try {
      const resp = await fetch('/api/gemini/specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: quickModel,
          year: quickYear || '2022'
        })
      });
      
      let data;
      if (!resp.ok) {
        console.warn("Servidor retornado com erro, acionando fallback local no cliente.");
        const { getSimulatedSpecs } = await import('../lib/specsFallback');
        data = getSimulatedSpecs(quickModel, quickYear || '2022', "");
        setQuickAiFeedback("Ficha estimada localmente (offline)!");
        setQuickAiIsFromCache(true);
        setTimeout(() => setQuickAiFeedback(null), 4000);
      } else {
        data = await resp.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setQuickAiIsFromCache(false);
      }
      
      // Successfully got specifications!
      setQuickAiSpecs(data);
      
      // Save to cache
      specsCache.set(quickModel, quickYear || '2022', "", data);
      
      // Autofill fields
      if (data.brand) {
        setQuickBrand(data.brand);
        const foundSug = AUTO_SUGGESTIONS.find(s => s.name.toLowerCase() === data.brand.toLowerCase());
        if (foundSug) {
          setQuickModelsList(foundSug.models);
        }
      }
      
      if (data.engine) {
        setQuickEngine(data.engine);
      }
    } catch (err: any) {
      console.error("Erro na API, ativando fallback local:", err);
      try {
        const { getSimulatedSpecs } = await import('../lib/specsFallback');
        const fallbackData = getSimulatedSpecs(quickModel, quickYear || '2022', "");
        setQuickAiSpecs(fallbackData);
        setQuickAiIsFromCache(true);
        specsCache.set(quickModel, quickYear || '2022', "", fallbackData);
        setQuickAiFeedback("Ficha técnica estimada localmente (offline)!");
        setTimeout(() => setQuickAiFeedback(null), 4000);
        
        if (fallbackData.brand) {
          setQuickBrand(fallbackData.brand);
          const foundSug = AUTO_SUGGESTIONS.find(s => s.name.toLowerCase() === fallbackData.brand.toLowerCase());
          if (foundSug) {
            setQuickModelsList(foundSug.models);
          }
        }
        if (fallbackData.engine) {
          setQuickEngine(fallbackData.engine);
        }
      } catch (fallbackErr) {
        setQuickAiError(err?.message || 'Falha de comunicação com a IA.');
      }
    } finally {
      setQuickAiLoading(false);
    }
  };

  const handleQuickVehicleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) {
      alert("Por favor, selecione primeiro um cliente integrado.");
      return;
    }
    if (!quickPlate || !quickBrand || !quickModel) {
      alert("Preencha Placa, Marca e Modelo do carro.");
      return;
    }

    try {
      const newVehObj = {
        clienteId: selectedClient.id,
        brand: quickBrand,
        model: quickModel,
        year: quickYear || '2022',
        engine: quickEngine || '1.6 Flex',
        plate: quickPlate.toUpperCase().trim(),
        chassi: 'CADASTRO RÁPIDO OS',
        km: parseInt(quickKm) || 0
      };

      await addVeiculo(newVehObj);

      setQuickVehSuccess(`🎉 Veículo ${quickBrand} ${quickModel} (${quickPlate.toUpperCase()}) cadastrado e vinculado com sucesso!`);
      
      setQuickBrand('');
      setQuickModel('');
      setQuickPlate('');
      setQuickKm('');
      setQuickModelsList([]);
      setQuickAiSpecs(null);
      setQuickAiError(null);
      
      setTimeout(() => {
        setQuickVehSuccess(null);
        setShowQuickVehicle(false);
      }, 2500);
      
    } catch (err: any) {
      alert("Houve um problema ao cadastrar o veículo: " + (err.message || err));
    }
  };

  // Add Catalog service row
  const handleAddCatalogService = (srvId: string) => {
    if (!srvId) return;
    const srv = servicos.find(s => s.id === srvId);
    if (!srv) return;
    const item: ServiceItem = {
      id: "srv_cat_" + Math.random().toString(36).substr(2, 5),
      description: srv.name,
      price: srv.price
    };
    setServices(prev => [...prev, item]);
    setSelectedSrvId('');
  };

  // Add Manual service row
  const handleAddManualService = () => {
    if (!manualServiceDesc || !manualServicePrice) return;
    const item: ServiceItem = {
      id: "srv_" + Math.random().toString(36).substr(2, 5),
      description: manualServiceDesc,
      price: parseFloat(manualServicePrice) || 0
    };
    setServices(prev => [...prev, item]);
    setManualServiceDesc('');
    setManualServicePrice('');
  };

  // Add Part to OS
  const handleAddPartToOS = () => {
    const qty = parseInt(selectedProdQty) || 1;
    let item: PartUsed;

    const isSuppliedByClient = partOrigin === 'cliente';

    if (partOrigin === 'terceiros' && !partSupplierName.trim()) {
      alert("Por favor, insira o nome do fornecedor para a Compra de Terceiros.");
      return;
    }

    if (useManualPart) {
      if (!manualPartNameInput.trim()) {
        alert("Por favor, insira o nome da peça/material manualmente.");
        return;
      }
      
      let priceVal = 0;
      if (partOrigin === 'terceiros') {
        priceVal = parseFloat(partCostPrice) || 0;
      } else if (partOrigin === 'estoque') {
        priceVal = parseFloat(manualPartPriceInput) || 0;
      } // isSuppliedByClient is 0

      item = {
        id: `custom_part_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: manualPartNameInput.trim(),
        sellPrice: priceVal,
        quantity: qty,
        suppliedByClient: isSuppliedByClient,
        origin: partOrigin,
        supplierName: partOrigin === 'terceiros' ? partSupplierName.trim() : undefined
      };
    } else {
      if (!selectedProdId) {
        alert("Por favor, selecione uma peça do estoque ou ative a digitação manual de peças.");
        return;
      }
      const prod = produtos.find(p => p.id === selectedProdId);
      if (!prod) return;

      let priceVal = prod.sellPrice;
      if (partOrigin === 'terceiros') {
        priceVal = parseFloat(partCostPrice) || 0;
      } else if (isSuppliedByClient) {
        priceVal = 0;
      }

      item = {
        id: prod.id,
        name: prod.name,
        sellPrice: priceVal,
        quantity: qty,
        suppliedByClient: isSuppliedByClient,
        origin: partOrigin,
        supplierName: partOrigin === 'terceiros' ? partSupplierName.trim() : undefined
      };
    }

    setParts(prev => [...prev, item]);
    setSelectedProdId('');
    setSelectedProdQty('1');
    setManualPartNameInput('');
    setManualPartPriceInput('');
    setPartOrigin('estoque');
    setPartSupplierName('');
    setPartCostPrice('');
    setIsPartClientSupplied(false);
  };

  // Handle Checklist Status change click
  const toggleChecklistStatus = (index: number, nextStatus: 'ok' | 'fail' | 'na') => {
    setChecklist(prev => prev.map((item, idx) => 
      idx === index ? { ...item, status: nextStatus } : item
    ));
  };

  // Total current sum
  const osCalculatedTotal = () => {
    const srvTotal = services.reduce((sum, item) => sum + item.price, 0);
    const prtTotal = parts.reduce((sum, item) => sum + (item.suppliedByClient ? 0 : item.sellPrice * item.quantity), 0);
    return srvTotal + prtTotal;
  };

  // Save full Order Servico
  const handleSaveOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !selectedVehicle || !problemText) {
      alert("Campos Obrigatórios ausentes (Cliente, Veículo ou Descrição do Sintoma).");
      return;
    }

    const totalOS = osCalculatedTotal();

    if (faturamentoMode === 'A faturar') {
      const limit = selectedClient.limitAmount || 0;
      const status = selectedClient.limitStatus || 'Pendente';
      const used = selectedClient.usedLimit || 0;
      const available = limit - used;

      if (status !== 'Aprovado') {
        alert(`Não permitido: O cliente ${selectedClient.name} não possui limite de crédito de faturamento devidamente aprovado por um administrador.\n\nSituação atual: ${status === 'Pendente' ? '⏳ Pendente de Aprovação' : '🔴 Recusado pelo Administrador'}.`);
        return;
      }

      if (totalOS > available) {
        alert(`Saldo de Crédito Excedido: O valor total desta O.S. (R$ ${totalOS.toFixed(2)}) ultrapassa o saldo de faturamento disponível do cliente (R$ ${available.toFixed(2)}).\n\nLimite Cadastrado: R$ ${limit.toFixed(2)}\nSaldo Utilizado Atual: R$ ${used.toFixed(2)}\nSaldo Disponível Restante: R$ ${available.toFixed(2)}.`);
        return;
      }
    }

    const payload = {
      clienteId: selectedClient.id,
      clienteName: selectedClient.name,
      clientePhone: selectedClient.phone,
      veiculoId: selectedVehicle.id,
      veiculoInfo: `${selectedVehicle.brand} ${selectedVehicle.model} - (${selectedVehicle.plate})`,
      plate: selectedVehicle.plate,
      km: parseInt(kmStr) || selectedVehicle.km,
      kmAnteriorEtiqueta: parseInt(kmAnteriorEtiquetaStr) || undefined,
      problem: problemText,
      diagnosis: diagnosisText || (entryMode === 'agendada' ? `Serviço Agendado para ${safeFormatLocalDate(scheduledDate)} às ${scheduledTime}.` : "Aguardando diagnóstico mecânico detalhado."),
      status: (entryMode === 'agendada' ? "Agendada" : "Aberta") as any,
      mechanicId: "staff_2",
      mechanicName: assignedStaff,
      services: [...services],
      parts: [...parts],
      checklist: [...checklist],
      photoUrls: [...capturedPhotos],
      total: totalOS,
      reminderEnabled,
      vencimentoDays: Number(vencimentoDays),
      reminderDays: Number(reminderDays),
      faturamentoMode: faturamentoMode,
      priority: isOSPriority,
      scheduledDate: entryMode === 'agendada' ? (scheduledDate || new Date().toISOString().split('T')[0]) : undefined,
      scheduledTime: entryMode === 'agendada' ? scheduledTime : undefined
    };

    await addOS(payload);
    playSuccessSound();

    // If 'A faturar', increment used limit of client
    if (faturamentoMode === 'A faturar') {
      const currentUsed = selectedClient.usedLimit || 0;
      try {
        await editCliente(selectedClient.id, {
          usedLimit: currentUsed + totalOS
        });
      } catch (err) {
        console.error("Erro ao incrementar limite utilizado do cliente:", err);
      }
    }

    // Stop camera if active
    stopCamera();

    // Reset Form
    setSelectedClient(null);
    setSelectedVehicle(null);
    setProblemText('');
    setDiagnosisText('');
    setKmStr('');
    setKmAnteriorEtiquetaStr('');
    setServices([]);
    setParts([]);
    setCapturedPhotos([]);
    setReminderEnabled(true);
    setVencimentoDays(30);
    setReminderDays(3);
    setFaturamentoMode('Balcão');
    setIsOSPriority(false);
    setEntryMode('imediata');
    setScheduledDate('');
    setScheduledTime('09:00');
    setChecklist([
      { label: "Nível de Combustível", status: "ok" as const },
      { label: "Objetos no Carro", status: "ok" as const },
      { label: "Avarias Existentes", status: "na" as const },
      { label: "Nível de Óleo do Motor", status: "ok" as const },
      { label: "Nível do Fluido de Freio", status: "ok" as const },
      { label: "Inspeção de Pastilhas/Discos", status: "ok" as const },
      { label: "Luzes de Sinalização", status: "ok" as const },
      { label: "Água do Radiador", status: "ok" as const },
      { label: "Estado do Filtro de Cabine", status: "na" as const }
    ]);
    setAiDiagnosticSummary(null);
    setActiveTab('lista');
  };

  // Build WhatsApp template text link
  const createWhatsAppShare = (os: OrdemServico) => {
    const isReady = os.services.length > 0 || os.parts.length > 0;
    const trackingUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?osId=${os.id}`;
    const msg = `Olá *${os.clienteName}*! Tudo bem? 

Sua Ordem de Serviço *${os.id}* do veículo *${os.veiculoInfo}* foi avaliada por nossa equipe de mecânicos.

🔍 *Diagnóstico Técnico:*
"${os.problem}"

🛠️ *Serviços/Peças Propostos:*
${os.services.map(s => `- ${s.description}: R$ ${s.price.toFixed(2)}`).join('\n')}
${os.parts.map(p => `- Peça ${p.name} (x${p.quantity}): R$ ${(p.sellPrice * p.quantity).toFixed(2)}`).join('\n')}

💵 *Valor Total Orçado:*
*R$ ${os.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*

📈 *Acompanhe em Tempo Real:*
${trackingUrl}

Por gentileza, acesse o link acima ou responda essa mensagem para aprovar a execução dos serviços! Obrigado.`;

    setWhatsappTextCreated(msg);
    setActiveOSForModal(os);
  };

  // Execute client digital authorization footprint sign
  const handleDigitalSignOS = async () => {
    if (!activeOSForModal) return;
    const signString = `Assinado Digitalmente por ${customSignName || activeOSForModal.clienteName} em ${new Date().toLocaleString()} - IP Autorizado Token OS_SIGN_${Math.floor(100+Math.random()*900)}`;
    
    await editOS(activeOSForModal.id, { 
      signature: signString,
      status: "Em execução"
    });

    setCustomSignName('');
    setActiveOSForModal(null);
    alert("Ordem de serviço devidamente assinada! O status mudou automaticamente para 'Em execução'.");
  };

  // --- Orçamento Fácil Action Helper Callbacks ---
  const addEasyService = (desc: string, price: number) => {
    if (!desc || isNaN(price) || price <= 0) {
      alert("Por favor, informe uma descrição válida e um preço numérico maior que zero para a mão de obra.");
      return;
    }
    const newItem: ServiceItem = {
      id: `srv_easy_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      description: desc,
      price: price
    };
    setEasyServices([...easyServices, newItem]);
    setEasyManualSrvDesc('');
    setEasyManualSrvPrice('');
    setEasySelectedSrvId('');
  };

  const addEasyPart = (name: string, price: number, qty: number) => {
    if (!name || isNaN(price) || price <= 0 || isNaN(qty) || qty <= 0) {
      alert("Por favor, preencha o nome do material, o valor unitário e uma quantidade positiva.");
      return;
    }
    const newItem: PartUsed = {
      id: `prt_easy_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name,
      sellPrice: price,
      quantity: qty
    };
    setEasyParts([...easyParts, newItem]);
    setEasyManualPartName('');
    setEasyManualPartPrice('');
    setEasyManualPartQty('1');
    setEasySelectedProdId('');
  };

  const easyServicesTotal = easyServices.reduce((acc, s) => acc + s.price, 0);
  const easyPartsTotal = easyParts.reduce((acc, p) => acc + (p.sellPrice * p.quantity), 0);
  const easySubtotal = easyServicesTotal + easyPartsTotal;
  const easyTotal = Math.max(0, easySubtotal - easyDiscount);

  const handleEasyWhatsAppShare = () => {
    const srvLines = easyServices.map(s => `• Mão de Obra: *${s.description}* - R$ ${s.price.toFixed(2)}`).join('\n');
    const prtLines = easyParts.map(p => `• Peça: *${p.name}* (x${p.quantity}) - R$ ${(p.sellPrice * p.quantity).toFixed(2)}`).join('\n');
    
    let msg = `⚡ *ORÇAMENTO PARCIAL - ${company?.name || 'AutoPrecision Premium'}* ⚡\n\n`;
    if (easyClientName) {
      msg += `Prezado(a) *${easyClientName}*,\n`;
    } else {
      msg += `Prezado Cliente,\n`;
    }
    msg += `Abaixo enviamos a simulação detalhada de orçamento para o seu veículo${easyVehicleDesc ? ` *${easyVehicleDesc}*` : ''}${easyVehiclePlate ? ` (Placa: ${easyVehiclePlate.toUpperCase()})` : ''}.\n\n`;
    
    if (easyServices.length > 0) {
      msg += `🛠️ *MÃO DE OBRA / SERVIÇOS:*\n${srvLines}\n\n`;
    }
    if (easyParts.length > 0) {
      msg += `📦 *PEÇAS / MATERIAIS DE REPOSIÇÃO:*\n${prtLines}\n\n`;
    }
    
    msg += `------------------------------------\n`;
    msg += `• Custo operacional: R$ ${easySubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (easyDiscount > 0) {
      msg += `• Desconto aplicado: R$ ${easyDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    }
    msg += `💰 *VALOR TOTAL: R$ ${easyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n`;
    msg += `_Este orçamento fácil é provisório de pátio técnico e válido por 10 dias._\n\n`;
    msg += `Deseja aprovar e dar início à execução rápida? Fale conosco!`;
    
    try {
      navigator.clipboard.writeText(msg);
    } catch (e) {
      console.warn("Clipboard access not fully permitted under iframe environment.");
    }
    
    const cleanPhone = easyClientPhone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone || ''}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleEasyEmailShare = async () => {
    if (!easyClientEmail) {
      alert("Por favor, preencha o e-mail do cliente para realizar o envio.");
      return;
    }

    const srvTextLines = easyServices.map(s => `- Mão de Obra: ${s.description} - R$ ${s.price.toFixed(2)}`).join('\n');
    const prtTextLines = easyParts.map(p => `- Peça: ${p.name} (x${p.quantity}) - R$ ${(p.sellPrice * p.quantity).toFixed(2)}`).join('\n');

    const rawSubject = `Orçamento Rápido - ${easyVehicleDesc || 'Seu Veículo'} - ${company?.name || 'AutoPrecision'}`;
    let bodyText = `Olá${easyClientName ? ` ${easyClientName}` : ''},\n\n`;
    bodyText += `Seguem as tarifas e diagnósticos operacionais de orçamento provisório para o seu veículo${easyVehicleDesc ? ` (${easyVehicleDesc})` : ''}${easyVehiclePlate ? ` placa ${easyVehiclePlate.toUpperCase()}` : ''}.\n\n`;
    
    if (easyServices.length > 0) {
      bodyText += `--- SERVIÇOS E OPERAÇÕES ---\n${srvTextLines}\n\n`;
    }
    if (easyParts.length > 0) {
      bodyText += `--- PEÇAS E MATERIAIS DE REPOSIÇÃO ---\n${prtTextLines}\n\n`;
    }
    
    bodyText += `Subtotal: R$ ${easySubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (easyDiscount > 0) {
      bodyText += `Desconto Especial: R$ ${easyDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    }
    bodyText += `VALOR TOTAL ESTIMADO: R$ ${easyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n`;
    bodyText += `Responderemos imediatamente caso queira aprovar por este canal.\n\n`;
    bodyText += `Atenciosamente,\n${company?.name || 'AutoPrecision Premium'}\nContato Telefônico: ${company?.phone || '(11) 98765-4321'}`;

    // Rich HTML email design
    const srvHtmlLines = easyServices.map(s => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: sans-serif; font-size: 13px; color: #334155;">Mão de Obra: ${s.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: sans-serif; font-size: 13px; color: #334155; text-align: right;">R$ ${s.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    const prtHtmlLines = easyParts.map(p => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: sans-serif; font-size: 13px; color: #334155;">Peça: ${p.name} (x${p.quantity})</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: sans-serif; font-size: 13px; color: #334155; text-align: right;">R$ ${(p.sellPrice * p.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    const logoHtml = company?.logoUrl ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${company.logoUrl}" alt="Logo" style="max-height: 70px; border-radius: 8px;" /></div>` : '';

    const htmlContent = `
      <div style="background-color: #f8fafc; padding: 25px; font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
        ${logoHtml}
        <h2 style="color: #0f172a; border-bottom: 2px solid #ef4444; padding-bottom: 10px; font-family: sans-serif; text-transform: uppercase;">${company?.name || 'AutoPrecision'}</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">Olá <strong>${easyClientName || 'Cliente'}</strong>,</p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">Seguem as tarifas e diagnósticos operacionais de orçamento provisório para o seu veículo <strong>${easyVehicleDesc || 'não especificado'}</strong> ${easyVehiclePlate ? `(Placa: <strong>${easyVehiclePlate.toUpperCase()}</strong>)` : ''}.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 10px; text-align: left; font-size: 12px; color: #475569; text-transform: uppercase;">Serviço / Item</th>
              <th style="padding: 10px; text-align: right; font-size: 12px; color: #475569; text-transform: uppercase;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${srvHtmlLines}
            ${prtHtmlLines}
          </tbody>
        </table>

        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <table style="width: 100%;">
            <tr>
              <td style="font-size: 13px; color: #475569; font-family: sans-serif;">Subtotal:</td>
              <td style="font-size: 13px; color: #334155; text-align: right; font-family: sans-serif;">R$ ${easySubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
            ${easyDiscount > 0 ? `
            <tr>
              <td style="font-size: 13px; color: #16a34a; font-weight: bold; font-family: sans-serif;">Desconto:</td>
              <td style="font-size: 13px; color: #16a34a; font-weight: bold; text-align: right; font-family: sans-serif;">- R$ ${easyDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
            ` : ''}
            <tr style="border-top: 1px solid #cbd5e1;">
              <td style="font-size: 15px; color: #0f172a; font-weight: bold; padding-top: 10px; font-family: sans-serif;">Valor Total Geral:</td>
              <td style="font-size: 18px; color: #ef4444; font-weight: bold; text-align: right; padding-top: 10px; font-family: sans-serif;">R$ ${easyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          </table>
        </div>

        <p style="color: #475569; font-size: 12px; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-family: sans-serif;">
          Este documento constitui apenas uma estimativa provisória não vinculante.<br/>
          <strong>${company?.name || 'Oficina'}</strong> • Contato: ${company?.phone || ''}
        </p>
      </div>
    `;

    if (company?.smtpHost && company?.smtpUser && company?.smtpPass) {
      setIsSendingBudgetEmail(true);
      setEmailBudgetFeedback("Transmitindo via servidor SMTP de alta performance...");
      setEmailBudgetSuccess(null);
      try {
        const res = await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            smtpHost: company.smtpHost,
            smtpPort: company.smtpPort,
            smtpUser: company.smtpUser,
            smtpPass: company.smtpPass,
            smtpSecure: company.smtpSecure,
            to: easyClientEmail,
            subject: rawSubject,
            text: bodyText,
            html: htmlContent,
            fromName: company.name
          })
        });
        const data = await res.json();
        if (data.success) {
          setEmailBudgetSuccess(true);
          setEmailBudgetFeedback("✓ Orçamento enviado com sucesso via SMTP do Gmail!");
        } else {
          setEmailBudgetSuccess(false);
          setEmailBudgetFeedback(`⚠️ Falha SMTP: ${data.error}`);
        }
      } catch (err: any) {
        setEmailBudgetSuccess(false);
        setEmailBudgetFeedback(`⚠️ Falha de conexão: ${err.message || err}`);
      } finally {
        setIsSendingBudgetEmail(false);
      }
    } else {
      // Direct local mailto link redirection
      setEmailBudgetSuccess(true);
      setEmailBudgetFeedback("Direcionando para seu cliente de e-mail local...");
      const url = `mailto:${easyClientEmail}?subject=${encodeURIComponent(rawSubject)}&body=${encodeURIComponent(bodyText)}`;
      window.location.href = url;
      setTimeout(() => {
        setEmailBudgetFeedback(null);
        setEmailBudgetSuccess(null);
      }, 4000);
    }
  };

  const handleConvertEasyToOS = async () => {
    let clientToUseId = "";
    if (easyClientName) {
      const match = clientes.find(c => 
        c.name.toLowerCase().includes(easyClientName.toLowerCase()) || 
        (easyClientPhone && c.phone.replace(/[^0-9]/g, '') === easyClientPhone.replace(/[^0-9]/g, ''))
      );
      if (match) {
        clientToUseId = match.id;
      } else {
        clientToUseId = clientes[0]?.id || "client_temp_123";
      }
    } else {
      clientToUseId = clientes[0]?.id || "client_temp_123";
    }

    const clientNameSelected = easyClientName || "Cliente Particular";
    const clientPhoneSelected = easyClientPhone || "(11) 99999-9999";

    const payload = {
      clienteId: clientToUseId,
      clienteName: clientNameSelected,
      clientePhone: clientPhoneSelected,
      veiculoId: "veh_temp_quick",
      veiculoInfo: easyVehicleDesc ? `${easyVehicleDesc} (${easyVehiclePlate.toUpperCase() || 'S/ PLACA'})` : "Veículo Orçado Provisório",
      plate: easyVehiclePlate || "ORC-9999",
      km: 0,
      problem: "Orçamento Fácil instantâneo convertido em Ordem de Serviço de pátio.",
      diagnosis: "Orçamento de peças/mão de obra simplificado de pátio técnico.",
      status: "Aberta" as const,
      mechanicId: "staff_2",
      mechanicName: "Marcio Rezende",
      services: [...easyServices],
      parts: [...easyParts],
      checklist: [],
      total: easyTotal,
      reminderEnabled: false,
      vencimentoDays: 30,
      reminderDays: 3
    };

    await addOS(payload);
    playSuccessSound();
    alert("✔️ Orçamento instantâneo convertido com sucesso em uma Ordem de Serviço oficial! Veja-a na fila ativa.");
    
    // Reset easy states
    setEasyClientName('');
    setEasyClientPhone('');
    setEasyClientEmail('');
    setEasyVehicleDesc('');
    setEasyVehiclePlate('');
    setEasyServices([]);
    setEasyParts([]);
    setEasyDiscount(0);
    
    setActiveTab('lista');
  };

  const handlePrintEasyBudget = () => {
    const placeholderOS: OrdemServico = {
      id: `SIMUL-${Math.floor(1000 + Math.random() * 9000)}`,
      empresaId: company?.id || 'company_1',
      clienteId: 'temp_cliente',
      clienteName: easyClientName || 'Cliente Particular',
      clientePhone: easyClientPhone || 'Não Informado',
      veiculoId: 'temp_veiculo',
      veiculoInfo: easyVehicleDesc || 'Veículo Sob Regulação',
      plate: easyVehiclePlate || 'PREVENTIVO',
      km: 0,
      problem: `Cotação de Serviços e Peças de Pátio executada em ${new Date().toLocaleDateString('pt-BR')}`,
      diagnosis: 'Diagnóstico mecânico e materiais orçados através do assistente de orçamento rápido.',
      status: 'Aberta',
      mechanicId: 'temp_mechanic',
      mechanicName: 'Consultor Técnico',
      services: [...easyServices],
      parts: [...easyParts],
      checklist: [],
      total: easyTotal,
      createdAt: new Date().toISOString()
    };
    setPdfOSSelected(placeholderOS);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
            🛠️ ORDENS DE SERVIÇO (OS)
          </h1>
          <p className="text-xs text-gray-400 font-mono">Checklists de pátio, orçamentos, inteligência mecânica de diagnóstico e assinaturas.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-stretch sm:self-auto">
          {/* Imprimir O.S. Direto */}
          <button
            type="button"
            onClick={() => setIsPrintSelectorOpen(true)}
            className="px-4 py-2 bg-[#d97706]/20 border border-[#d97706]/40 text-[#f59e0b] hover:bg-[#d97706]/34 hover:text-amber-350 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all duration-150 font-mono"
            title="Escolher Ordem de Serviço para Gerar PDF ou Imprimir"
          >
            <Printer className="w-3.5 h-3.5" /> Gerar PDF / Imprimir
          </button>

          <div className="flex bg-[#080d19] p-1 rounded-xl border border-gray-800 [&>button]:px-3.5 [&>button]:py-1.5 [&>button]:text-xs [&>button]:font-mono [&>button]:rounded-lg">
            <button 
              onClick={() => setActiveTab('lista')}
              className={activeTab === 'lista' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
            >
              Fila Ativa de OS
            </button>
            <button 
              onClick={() => setActiveTab('nova')}
              className={activeTab === 'nova' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
            >
              + Abrir Nova OS
            </button>
            <button 
              onClick={() => setActiveTab('orcamento')}
              className={activeTab === 'orcamento' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
              id="tab-orcamento-facil"
            >
              ⚡ Orçamento Fácil
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'lista' && (
        <>
          {/* List filter tools */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#0a0f1d] p-4 rounded-xl border border-gray-900">
            <div className="relative md:col-span-6">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Pesquise por placa do carro, código de OS, ou nome do cliente..."
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value)}
                className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2 px-4 pl-10 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="md:col-span-3">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#080c16] border border-gray-800 py-2.5 px-3 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              >
                <option value="Todas">Status: Todas</option>
                <option value="Agendada">Agendada</option>
                <option value="Aberta">Aberta</option>
                <option value="Em análise">Em análise</option>
                <option value="Aguardando peça">Aguardando peça</option>
                <option value="Em execução">Em execução</option>
                <option value="Finalizada">Finalizada</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full bg-[#080c16] border border-gray-800 py-2.5 px-3 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              >
                <option value="asc">⏱️ Fila (Mais Antigas Primeiro)</option>
                <option value="desc">⏱️ Recentes (Mais Novas Primeiro)</option>
              </select>
            </div>
          </div>

          {/* Cronograma/Fila indicativo de exemplos */}
          <div className="bg-[#0b1324] border border-blue-950/40 rounded-xl p-4 text-xs font-sans text-gray-400 flex flex-col gap-2">
            <span className="font-bold text-[#f87171] flex items-center gap-1.5 uppercase font-mono text-[10px] tracking-wider">
              📋 FILA DE ATENDIMENTO OPERACIONAL (ORDEM CRONOLÓGICA)
            </span>
            <p className="leading-relaxed">
              As Ordens de Serviço (OS) ativas são priorizadas pelo <strong>tempo de permanência/espera</strong> no pátio. Os veículos com maior tempo desde a entrada de pátio ficam posicionados no topo para evitar atrasos na entrega técnica.
            </p>
            <div className="mt-1 pt-2 border-t border-gray-800 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
              <span className="font-extrabold text-gray-400">Exemplos de Fluxo FIFO:</span>
              <span className="text-red-400 font-mono">1º OS #1005 (Há 3 dias - Prioridade Máxima)</span>
              <span className="text-gray-600">➔</span>
              <span className="text-amber-400 font-mono">2º OS #1008 (Há 1 dia - Em Espera)</span>
              <span className="text-gray-600">➔</span>
              <span className="text-green-400 font-mono">3º OS #1012 (Há 20 min - Recém-Criada)</span>
            </div>
          </div>

          {/* MODO DE VISUALIZAÇÃO TOGGLE */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#0a0f1d] p-3 rounded-xl border border-gray-900 mt-4 mb-2">
            <div>
              <span className="text-xs font-mono font-bold text-gray-400 uppercase flex items-center gap-1.5">
                👁️ Painel Operacional:
              </span>
              <p className="text-[10px] text-gray-500 font-sans mt-0.5">Alterne entre a listagem tradicional e o Quadro Kanban interativo.</p>
            </div>
            <div className="flex bg-[#080d19] p-1 rounded-xl border border-gray-800 self-stretch sm:self-auto justify-stretch">
              <button
                type="button"
                onClick={() => setViewMode('lista')}
                className={`flex-grow sm:flex-grow-0 px-4 py-1.5 text-xs font-mono rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${viewMode === 'lista' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="w-3.5 h-3.5" /> Lista / Grade
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`flex-grow sm:flex-grow-0 px-4 py-1.5 text-xs font-mono rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${viewMode === 'kanban' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}`}
                id="btn-kanban-view"
              >
                <Kanban className="w-3.5 h-3.5" /> Quadro Kanban
              </button>
            </div>
          </div>

          {viewMode === 'lista' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredOS.map((os, index) => {
              const isManualPriority = os.priority === true;
              const isWarranty = os.status === 'Garantia Reaberta' || (os.reopenCount !== undefined && os.reopenCount > 0);
              const isActive = os.status !== 'Finalizada' && os.status !== 'Entregue';
              
              const diffMs = new Date().getTime() - new Date(os.createdAt).getTime();
              const isOverdue = isActive && (diffMs > 24 * 60 * 60 * 1000); // Mais de 24h ativa no pátio considera-se atrasada
              const warrantyInfo = getWarrantyReturnInfo(os.veiculoId, os.id);
              const isWarrantyReturn = warrantyInfo?.isWithinWarranty;
              const isPriorityOrDelayed = isManualPriority || isWarranty || isOverdue || isWarrantyReturn;

              return (
                <motion.div 
                  key={os.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.25) }}
                  className={`p-5 bg-[#0c1223] rounded-2xl border flex flex-col justify-between hover:border-red-500/20 transition-all text-left relative overflow-hidden ${
                    isPriorityOrDelayed 
                      ? isWarrantyReturn 
                        ? 'border-rose-500 bg-[#0f0e1c] shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                        : 'animate-pulse-glow border-red-500/60' 
                      : 'border-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-white tracking-widest">{os.id}</span>
                        <span className={`text-[9px] font-mono border px-1.5 py-0.5 rounded ${statusColors[os.status] || 'border-slate-800'}`}>
                          {os.status}
                        </span>
                        
                        {isWarrantyReturn && (
                          <span className="text-[8px] bg-rose-500/20 text-rose-450 border border-rose-500/30 px-1.5 py-0.5 rounded font-mono font-extrabold uppercase tracking-tight animate-bounce flex items-center gap-1">
                            ⚠️ RETORNO GARANTIA ({warrantyInfo?.diffDays}d)
                          </span>
                        )}
                        {isManualPriority && (
                          <span className="text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-tight animate-pulse">
                            ⚡ PRIORITÁRIA
                          </span>
                        )}
                        {isWarranty && (
                          <span className="text-[8px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-tight animate-pulse">
                            ⚙ REDIRECT GARANTIA
                          </span>
                        )}
                        {isOverdue && !isWarranty && (
                          <span className="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-tight animate-pulse">
                            ⏳ ATRASADA (DIAS +1)
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 block mt-1 font-sans font-semibold">🚙 {os.veiculoInfo}</span>
                      
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[10.5px]">
                        <span className="text-slate-400 font-sans">
                          📍 KM Entrada: <strong className="text-slate-200">{os.km ? os.km.toLocaleString('pt-BR') : '0'} km</strong>
                        </span>
                        {os.kmAnteriorEtiqueta ? (
                          <>
                            <span className="text-gray-500 font-mono">•</span>
                            <span className="text-slate-400 font-sans">
                              🏷️ Etiqueta Anterior: <strong className="text-slate-200">{os.kmAnteriorEtiqueta.toLocaleString('pt-BR')} km</strong>
                            </span>
                            <span className="text-gray-500 font-mono">•</span>
                            <span className="text-amber-400 font-sans font-medium">
                              🔄 Rodado: <strong>{(os.km - os.kmAnteriorEtiqueta).toLocaleString('pt-BR')} km</strong>
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-500 font-mono">•</span>
                            <span className="text-slate-500 font-sans italic">Sem etiqueta KM anterior</span>
                          </>
                        )}
                      </div>
                    <span className="text-[10px] text-gray-500 font-mono block mt-1 flex items-center gap-1">
                      <span>📅 Entrada:</span>
                      <strong className="text-gray-300">
                        {new Date(os.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </strong>
                      <span className="text-red-400/90 font-sans ml-1 text-[9px] font-bold uppercase p-0.5 px-1 bg-red-950/20 rounded border border-red-950/20">
                        {(() => {
                          const diffMs = new Date().getTime() - new Date(os.createdAt).getTime();
                          const diffMin = Math.floor(diffMs / 60000);
                          const diffHrs = Math.floor(diffMin / 60);
                          const diffDays = Math.floor(diffHrs / 24);
                          if (diffMin < 60) return `${diffMin}m atrás`;
                          if (diffHrs < 24) return `${diffHrs}h atrás`;
                          return `${diffDays}d atrás`;
                        })()}
                      </span>
                    </span>
                    {os.status === 'Agendada' && os.scheduledDate && (
                      <span className="text-[10px] text-purple-400 font-mono block mt-1.5 flex items-center gap-1 bg-purple-950/45 p-1 px-2.5 rounded-lg border border-purple-900/40 w-fit">
                        <span>📅 AGENDADO PARA:</span>
                        <strong className="text-purple-300">
                          {safeFormatLocalDate(os.scheduledDate)} às {os.scheduledTime || '09:00'}
                        </strong>
                      </span>
                    )}
                  </div>

                  <span className="text-sm font-mono font-extrabold text-white">
                    R$ {os.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="text-xs text-slate-400 line-clamp-2 my-2.5 italic border-l-2 border-red-500/30 pl-2">
                  "{os.problem}"
                </div>

                {isWarrantyReturn && warrantyInfo && (
                  <div className="my-2.5 p-3 rounded-xl border border-rose-500/35 bg-rose-950/20 text-rose-300 text-[10.5px] leading-relaxed flex flex-col gap-1 font-sans">
                    <span className="font-extrabold text-rose-400 uppercase tracking-wide flex items-center gap-1.5 animate-pulse">
                      ⚠️ MONITORAMENTO DE GARANTIA: RETORNO DETECTADO
                    </span>
                    <p className="text-gray-350 text-gray-300">
                      Este veículo retornou para revisão em <strong className="text-white">{warrantyInfo.diffDays} dias</strong>, que está dentro do intervalo de garantia estipulado de <strong className="text-white">{warrantyInfo.warrantyDays} dias</strong>.
                    </p>
                    <p className="text-slate-400 text-[9.5px]">
                      Vinculado à OS concluída anterior: <strong className="text-slate-200">#{warrantyInfo.latestOS.id}</strong> ({new Date(warrantyInfo.latestOS.createdAt).toLocaleDateString()}) - Diagnóstico anterior: "{warrantyInfo.latestOS.diagnosis}"
                    </p>
                  </div>
                )}

                {os.reopenCount !== undefined && os.reopenCount > 0 && (
                  <div className="my-2.5 p-2 px-3 rounded-xl border border-purple-500/30 bg-purple-950/20 text-purple-300 text-[10.5px] leading-relaxed">
                    <span className="font-extrabold flex items-center gap-1 uppercase tracking-wide">
                      🚨 OS Reaberta em Garantia ({os.reopenCount}ª Intervenção)
                    </span>
                    {os.reopenReason && (
                      <p className="mt-0.5 text-[10px] text-purple-400 italic font-medium">
                        "{os.reopenReason}"
                      </p>
                    )}
                    {os.reopenedAt && (
                      <span className="text-[9px] text-gray-500 block mt-0.5">
                        Última reabertura técnica: {new Date(os.reopenedAt).toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                )}

                {/* Sub features checklist indicators */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-500 my-2">
                  <span>Mecânico: <strong className="text-gray-300">{os.mechanicName}</strong></span>
                  <span>Clientes: <strong className="text-gray-300">{os.clienteName}</strong></span>
                  <span>Trocas/Peças: <strong className="text-gray-300">{os.parts.length} itens</strong></span>
                  <span>Serviços: <strong className="text-gray-300">{os.services.length}</strong></span>
                </div>

                {/* Status History Log */}
                <div className="mt-3 border border-gray-850 bg-slate-950/20 rounded-xl overflow-hidden p-2.5">
                  <span className="text-[9.5px] font-mono uppercase tracking-wider text-slate-400 font-extrabold flex items-center gap-1.5 select-none">
                    <History className="w-3.5 h-3.5 text-red-500" />
                    Histórico de Alterações de Status
                  </span>
                  
                  <div className="mt-2 pl-1.5 flex flex-col gap-2 max-h-[120px] overflow-y-auto font-mono text-[9.5px] border-l border-gray-800">
                    {os.statusHistory && os.statusHistory.length > 0 ? (
                      os.statusHistory.map((h, hIdx) => (
                        <div key={hIdx} className="relative flex flex-col gap-0.5">
                          <span className="absolute -left-[10px] top-[4px] w-1.5 h-1.5 rounded-full bg-red-500/85 border border-slate-950" />
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-gray-500 text-[8.5px] font-semibold">{new Date(h.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="px-1 py-[1px] bg-slate-900 text-slate-300 font-bold rounded uppercase border border-slate-800 text-[8px]">{h.status}</span>
                            <span className="text-gray-400">por {h.user}</span>
                          </div>
                          {h.notes && <span className="text-gray-500 italic text-[8.5px] mt-0.5">"{h.notes}"</span>}
                        </div>
                      ))
                    ) : (
                      <div className="relative flex flex-col gap-0.5">
                        <span className="absolute -left-[10px] top-[4px] w-1.5 h-1.5 rounded-full bg-red-500/85 border border-slate-950" />
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-gray-500 text-[8.5px] font-semibold">{new Date(os.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="px-1 py-[1px] bg-slate-900 text-slate-300 font-bold rounded uppercase border border-slate-800 text-[8px]">Aberta</span>
                          <span className="text-gray-400">por {os.mechanicName || 'Sistema'}</span>
                        </div>
                        <span className="text-gray-500 italic text-[8.5px] mt-0.5">"Abertura da Ordem de Serviço"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* WhatsApp Reminder configuration details */}
                {os.reminderEnabled && (
                  <div className="mt-2.5 p-2.5 bg-slate-950/40 border border-gray-850 rounded-xl flex items-center justify-between text-[10.5px] font-mono">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-purple-400" />
                      Lembrete: WhatsApp ({os.reminderDays}d antes)
                    </span>
                    <span className="text-purple-400 font-bold">
                      Disparo: {(() => {
                        const date = new Date(os.createdAt);
                        date.setDate(date.getDate() + (os.vencimentoDays || 30) - (os.reminderDays || 3));
                        return date.toLocaleDateString('pt-BR');
                      })()}
                    </span>
                  </div>
                )}

                {/* Pre-existing damage entry photos gallery */}
                {os.photoUrls && os.photoUrls.length > 0 && (
                  <div className="mt-2.5 p-2.5 bg-[#050810] border border-gray-850 rounded-xl flex flex-col gap-1.5 text-left">
                    <span className="text-[9.5px] font-mono uppercase tracking-wider text-orange-400 font-extrabold flex items-center gap-1">
                      📸 FOTOS DE VISTORIA / ENTRADA ({os.photoUrls.length})
                    </span>
                    <div className="flex gap-2.5 overflow-x-auto py-1 pr-1 scrollbar-thin">
                      {os.photoUrls.map((photo, pIdx) => (
                        <div 
                          key={pIdx} 
                          className="relative rounded border border-gray-800 hover:border-orange-500 h-11 aspect-square overflow-hidden shrink-0 cursor-pointer transition-all duration-150 transform hover:scale-105 shadow"
                          onClick={() => setActiveLightboxImage(photo)}
                          title="Clique para ampliar imagem da avaria"
                        >
                          <img src={photo} alt={`Avaria ${pIdx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer buttons of each card */}
                <div className="mt-4 pt-3 border-t border-gray-850 flex items-center justify-between gap-3 flex-wrap font-mono text-[10px]">
                  
                  <div>
                    {os.signature ? (
                      <span className="text-green-500 font-bold flex items-center gap-0.5">✓ ASSINADA</span>
                    ) : (
                      <span className="text-yellow-500">⚠ AGUARDANDO ASSINATURA</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button 
                      onClick={async () => {
                        await editOS(os.id, { priority: !os.priority });
                        playSuccessSound();
                      }}
                      className={`px-2 py-1 rounded bg-slate-900 border flex items-center gap-1 cursor-pointer transition-colors text-[9.5px] ${
                        os.priority 
                          ? 'border-red-500/40 text-red-400 hover:bg-red-500/10' 
                          : 'border-slate-850 text-gray-400 hover:hover:text-slate-350'
                      }`}
                      title={os.priority ? "Disparar baixa prioridade" : "Definir Alta Prioridade"}
                    >
                      ★ {os.priority ? "Prioridade Ativa" : "Priorizar"}
                    </button>

                    <button 
                      onClick={() => createWhatsAppShare(os)}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-green-400 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Compartilhar orçamento via WhatsApp"
                    >
                      <Phone className="w-3 h-3" /> Enviar Orçamento
                    </button>

                    <button 
                      onClick={() => setPdfOSSelected(os)}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-amber-400 flex items-center gap-1.5 cursor-pointer transition-colors font-bold"
                      title="Visualizar e Exportar PDF Simplificado"
                    >
                      <Printer className="w-3 h-3 text-amber-400 animate-pulse" /> Exportar PDF
                    </button>

                    <button 
                      onClick={() => {
                        const sampleUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?cpf=${os.clienteCpfCnpj || ''}&osId=${os.id}`;
                        navigator.clipboard.writeText(sampleUrl);
                        alert(`🔗 Link de acompanhamento copiado com sucesso!\n\n${sampleUrl}\n\nVocê já pode enviar este link para o cliente no WhatsApp para acompanhar a mão de obra em tempo real.`);
                      }}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-cyan-400 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copiar link de acompanhamento com CPF"
                    >
                      <Link className="w-3 h-3 text-cyan-400" /> Link de Acompanhamento
                    </button>

                    {/* Reabrir em Garantia button */}
                    {(os.status === 'Finalizada' || os.status === 'Entregue') && (
                      <button
                        type="button"
                        id={`btn-reopen-os-${os.id}`}
                        onClick={() => {
                          setReopenOSId(os.id);
                          setReopenReasonText('');
                        }}
                        className="px-2.5 py-1 rounded border border-purple-500 bg-purple-950/20 hover:bg-purple-900 hover:text-white text-purple-300 cursor-pointer font-bold transition-all uppercase flex items-center gap-1"
                        title="Reabrir a mesma mão de obra por garantia técnica"
                      >
                        <RefreshCw className="w-3 h-3 text-purple-400 animate-spin-hover" /> Reabrir Garantia
                      </button>
                    )}
                    
                    <select 
                      value={os.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        await editOS(os.id, { status: newStatus as any });
                        if (newStatus === 'Finalizada' || newStatus === 'Entregue') {
                          playSuccessSound();
                        }
                      }}
                      className="bg-[#050812] border border-gray-800 rounded px-2 py-1 text-[9px] font-mono text-slate-300"
                    >
                      <option value="Aberta">Mudar: Aberta</option>
                      <option value="Em análise">Mudar: Em análise</option>
                      <option value="Aguardando peça">Mudar: Em peça</option>
                      <option value="Em execução">Mudar: Em execução</option>
                      <option value="Finalizada">Mudar: Finalizada</option>
                      <option value="Entregue">Mudar: Entregue</option>
                      <option value="Garantia Reaberta">Mudar: Garantia Reaberta</option>
                    </select>

                    <button
                      type="button"
                      id={`btn-delete-os-${os.id}`}
                      onClick={async () => {
                        if (confirm(`Tem certeza que deseja excluir permanentemente a Ordem de Serviço #${os.id}?`)) {
                          await deleteOS(os.id);
                        }
                      }}
                      className="p-1.5 rounded bg-slate-900 border border-red-950 hover:bg-red-950/20 text-red-500 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                      title="Excluir OS"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                </div>

              </motion.div>
              );
            })}
            {filteredOS.length === 0 && (
              <div className="col-span-2 text-center py-20 text-gray-500">
                Nenhuma Ordem de Serviço conditizente localizada nesta consulta.
              </div>
            )}
          </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start mt-2 text-left">
              {['Aguardando', 'Em Execução', 'Finalizado'].map((colId) => {
                const columnItems = filteredOS.filter(os => {
                  if (colId === 'Em Execução') return os.status === 'Em execução';
                  if (colId === 'Finalizado') return os.status === 'Finalizada' || os.status === 'Entregue';
                  return os.status !== 'Em execução' && os.status !== 'Finalizada' && os.status !== 'Entregue';
                });

                const isDraggedOver = draggedOverColumn === colId;
                const colTitle = colId === 'Aguardando' ? '⏱️ Aguardando' : colId === 'Em Execução' ? '⚙️ Em Execução' : '✅ Finalizado';
                const colColor = colId === 'Aguardando' ? 'border-amber-500/20 text-amber-400 bg-amber-500/10' : colId === 'Em Execução' ? 'border-sky-500/20 text-sky-400 bg-sky-500/10' : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10';
                
                return (
                  <div
                    key={colId}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggedOverColumn !== colId) setDraggedOverColumn(colId as any);
                    }}
                    onDragLeave={() => {
                      setDraggedOverColumn(null);
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const osId = e.dataTransfer.getData('text/plain');
                      setDraggedOverColumn(null);
                      if (osId) {
                        const targetOS = ordensServico.find(o => o.id === osId);
                        if (targetOS) {
                          let newStatus: OSStatus = targetOS.status;
                          if (colId === 'Aguardando') {
                            const waitingStates = ['Agendada', 'Aberta', 'Em análise', 'Aguardando peça', 'Garantia Reaberta'];
                            if (!waitingStates.includes(targetOS.status)) {
                              newStatus = 'Aberta';
                            }
                          } else if (colId === 'Em Execução') {
                            newStatus = 'Em execução';
                          } else if (colId === 'Finalizado') {
                            newStatus = 'Finalizada';
                          }
                          if (targetOS.status !== newStatus) {
                            await editOS(osId, { status: newStatus });
                            if (newStatus === 'Finalizada') {
                              playSuccessSound();
                            }
                          }
                        }
                      }
                    }}
                    className={`flex flex-col rounded-2xl bg-[#090f1d] border p-4 min-h-[500px] transition-all duration-200 ${
                      isDraggedOver 
                        ? 'border-red-500 bg-red-950/10 shadow-[0_0_20px_rgba(239,68,68,0.25)] ring-2 ring-red-500/30' 
                        : 'border-gray-800'
                    }`}
                  >
                    {/* Header da coluna */}
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#151f38]">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${colColor}`}>
                          {colTitle}
                        </span>
                      </div>
                      <span className="text-gray-400 font-mono text-xs font-bold bg-[#0c1324] px-2 py-0.5 border border-gray-800 rounded">
                        {columnItems.length}
                      </span>
                    </div>

                    {/* Fila de cards */}
                    <div className="flex flex-col gap-3 overflow-y-auto max-h-[70vh] pr-0.5 custom-scrollbar flex-grow">
                      {columnItems.map((os) => {
                        const isManualPriority = os.priority === true;
                        const isWarranty = os.status === 'Garantia Reaberta' || (os.reopenCount !== undefined && os.reopenCount > 0);
                        const isActive = os.status !== 'Finalizada' && os.status !== 'Entregue';
                        const diffMs = new Date().getTime() - new Date(os.createdAt).getTime();
                        const isOverdue = isActive && (diffMs > 24 * 60 * 60 * 1000);
                        const warrantyInfo = getWarrantyReturnInfo(os.veiculoId, os.id);
                        const isWarrantyReturn = warrantyInfo?.isWithinWarranty;
                        const isPriorityOrDelayed = isManualPriority || isWarranty || isOverdue || isWarrantyReturn;

                        return (
                          <div
                            key={os.id}
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', os.id);
                              setDraggingOSId(os.id);
                            }}
                            onDragEnd={() => {
                              setDraggingOSId(null);
                              setDraggedOverColumn(null);
                            }}
                            className={`p-4 bg-[#0d152a] hover:bg-[#111c38] rounded-xl border transition-all text-left relative cursor-grab active:cursor-grabbing select-none group ${
                              draggingOSId === os.id ? 'opacity-40 border-dashed border-red-500' : ''
                            } ${
                              isPriorityOrDelayed 
                                ? isWarrantyReturn 
                                  ? 'border-rose-500/80 bg-[#120e18] shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                                  : 'animate-pulse-glow border-red-500/60' 
                                : 'border-gray-800 hover:border-gray-700'
                            }`}
                          >
                            {/* Card Body */}
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <span className="font-mono text-xs font-bold text-white tracking-widest bg-[#0a0f1d] px-1.5 py-0.5 border border-gray-800 rounded">
                                {os.id}
                              </span>
                              <span className="text-[11px] font-bold text-white font-mono shrink-0">
                                R$ {os.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>

                            <div className="flex flex-col gap-1 text-[11px]">
                              <span className="font-sans font-bold text-gray-200">🚙 {os.veiculoInfo}</span>
                              <span className="text-[#94a3b8] font-sans">👤 Cliente: <strong className="text-gray-300">{os.clienteName}</strong></span>
                              <span className="text-[#94a3b8] font-sans">🔧 Mecânico: <strong className="text-gray-300">{os.mechanicName || 'Sem atribuir'}</strong></span>
                              
                              <div className="mt-1.25 pt-1.25 border-t border-gray-800/60 flex flex-col gap-0.5 text-[10px] text-gray-400">
                                <div>📍 KM Entrada: <strong className="text-slate-200">{os.km ? os.km.toLocaleString('pt-BR') : '0'} km</strong></div>
                                {os.kmAnteriorEtiqueta ? (
                                  <>
                                    <div>🏷️ Etiqueta Anterior: <strong className="text-slate-200">{os.kmAnteriorEtiqueta.toLocaleString('pt-BR')} km</strong></div>
                                    <div className="text-amber-400 font-medium">🔄 Rodado: <strong>{(os.km - os.kmAnteriorEtiqueta).toLocaleString('pt-BR')} km</strong></div>
                                  </>
                                ) : (
                                  <div className="text-slate-500 italic">Sem etiqueta KM anterior</div>
                                )}
                              </div>
                            </div>

                            <p className="text-[10px] text-gray-500 line-clamp-2 italic border-l border-red-500/20 pl-1.5 mt-2">
                              "{os.problem}"
                            </p>

                            {/* Badge row details */}
                            <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-2.5 border-t border-gray-850">
                              {isWarrantyReturn && (
                                <span className="text-[7.5px] bg-rose-500/20 text-rose-450 border border-rose-500/30 px-1.5 py-0.5 rounded font-mono font-extrabold uppercase animate-bounce flex items-center gap-0.5">
                                  ⚠️ RETORNO GARANTIA ({warrantyInfo?.diffDays}d)
                                </span>
                              )}
                              {isManualPriority && (
                                <span className="text-[7.5px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase animate-pulse">
                                  ⚡ PRIO
                                </span>
                              )}
                              {isWarranty && (
                                <span className="text-[7.5px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase animate-pulse">
                                  ⚙ GARANTIA
                                </span>
                              )}
                              {isOverdue && !isWarranty && (
                                <span className="text-[7.5px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase animate-pulse">
                                  ⏳ ATRASADA
                                </span>
                              )}
                              <span className="text-[8px] bg-gray-900 border border-slate-800 text-gray-300 font-bold font-mono px-1.5 py-0.5 rounded uppercase">
                                {os.status}
                              </span>
                            </div>

                            {/* Mobile / Hover quick status action */}
                            <div className="flex items-center justify-between gap-1.5 mt-3 pt-2 border-t border-gray-850/40">
                              {/* Actions dropdown */}
                              <select
                                value={os.status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value;
                                  await editOS(os.id, { status: newStatus as any });
                                  if (newStatus === 'Finalizada' || newStatus === 'Entregue') {
                                    playSuccessSound();
                                  }
                                }}
                                className="bg-[#050812] border border-gray-800 rounded px-1 py-0.5 text-[8.5px] font-mono text-slate-300 w-full"
                              >
                                <option value="Aberta">Aberta</option>
                                <option value="Em análise">Em análise</option>
                                <option value="Aguardando peça">Aguardando peça</option>
                                <option value="Em execução">Em execução</option>
                                <option value="Finalizada">Finalizada</option>
                                <option value="Entregue">Entregue</option>
                                <option value="Garantia Reaberta">Garantia Reaberta</option>
                              </select>

                              {/* Prioritize button */}
                              <button 
                                onClick={async () => {
                                  await editOS(os.id, { priority: !os.priority });
                                  playSuccessSound();
                                }}
                                className={`px-1.5 py-0.5 rounded bg-slate-900 border cursor-pointer transition-colors text-[8.5px] shrink-0 ${
                                  os.priority 
                                    ? 'border-red-500/40 text-red-400 hover:bg-red-500/10 font-bold' 
                                    : 'border-slate-800 text-gray-400'
                                }`}
                                title="Prioridade de Serviço"
                              >
                                ★
                              </button>

                              {/* View / Export PDF */}
                              <button 
                                onClick={() => setPdfOSSelected(os)}
                                className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-800 text-[8.5px] shrink-0 font-bold"
                                title="Exportar PDF"
                              >
                                PDF
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {columnItems.length === 0 && (
                        <div className="text-center py-10 text-gray-600 text-[11px] font-mono border-2 border-dashed border-gray-850 rounded-xl">
                          Nenhuma O.S.
                          <p className="text-[9px] text-gray-700 mt-1">Arraste cards para cá</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'nova' && (
        <form onSubmit={handleSaveOS} className="bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6 w-full font-sans">
          <div className="border-b border-gray-850 pb-4">
            <h3 className="font-display font-extrabold text-white text-base">ABRIR NOVA ORDEM DE SERVIÇO</h3>
            <span className="text-xs text-gray-400 font-mono">Associe o cadastro de clientes, execute vistorias físicas e defina o pátio de execução.</span>
          </div>

          {/* MODO DE ENTRADA: IMEDIATA OU AGENDADA */}
          <div className="bg-[#080c16] border border-gray-850 p-4 rounded-xl flex flex-col gap-4 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-850/50 pb-3">
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">PLANEJAMENTO DE RECEPÇÃO</span>
                <h4 className="text-white text-sm font-bold flex items-center gap-1.5 mt-0.5">
                  Como o veículo está dando entrada?
                </h4>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setEntryMode('imediata')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                    entryMode === 'imediata'
                      ? 'bg-red-950/35 text-red-500 border-red-900 shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                      : 'bg-[#050810] text-gray-400 border-gray-850 hover:text-white hover:border-gray-700'
                  }`}
                >
                  🚀 EXECUÇÃO IMEDIATA
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEntryMode('agendada');
                    if (!scheduledDate) {
                      setScheduledDate(new Date().toISOString().split('T')[0]);
                    }
                  }}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                    entryMode === 'agendada'
                      ? 'bg-purple-950/35 text-purple-400 border-purple-900 shadow-[0_0_8px_rgba(168,85,247,0.15)]'
                      : 'bg-[#050810] text-gray-400 border-gray-850 hover:text-white hover:border-gray-700'
                  }`}
                >
                  📅 AGENDAMENTO FUTURO
                </button>
              </div>
            </div>

            {entryMode === 'agendada' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1 animate-fadeIn">
                {/* Inputs do Agendamento */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Selecione Data do Compromisso</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full bg-[#050810] border border-gray-800 rounded-lg py-2 px-3 text-xs text-white pl-9 font-mono cursor-pointer"
                        required={entryMode === 'agendada'}
                      />
                      <Calendar className="w-4 h-4 text-purple-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Selecione Horário</label>
                    <div className="relative">
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full bg-[#050810] border border-gray-800 rounded-lg py-2 px-3 text-xs text-white pl-9 font-mono cursor-pointer"
                        required={entryMode === 'agendada'}
                      />
                      <Clock className="w-4 h-4 text-purple-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div className="p-3 bg-purple-950/15 border border-purple-900/30 rounded-lg text-xs leading-relaxed text-purple-300">
                    <strong className="text-purple-200 block mb-1 font-sans">ℹ️ Fluxo de Agendamento Ativo:</strong>
                    A ordem de serviço será registrada no banco de dados com o status de <span className="font-bold bg-purple-950 text-purple-400 border border-purple-900/40 px-1 py-0.2 rounded font-mono">Agendada</span>. O cliente poderá acompanhar seu status e o agendamento será exibido na agenda de compromissos da oficina.
                  </div>
                </div>

                {/* Calendário Interativo Integrado */}
                <div className="lg:col-span-8 bg-[#050810] border border-gray-850 p-4 rounded-xl flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" /> Agenda de Ocupação da Oficina
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (currentCalendarMonth === 0) {
                            setCurrentCalendarMonth(11);
                            setCurrentCalendarYear(prev => prev - 1);
                          } else {
                            setCurrentCalendarMonth(prev => prev - 1);
                          }
                        }}
                        className="p-1 px-2 rounded bg-gray-900 hover:bg-gray-800 text-gray-300 text-[9px] uppercase font-mono cursor-pointer"
                      >
                        Anterior
                      </button>
                      <span className="text-xs font-mono text-white font-bold px-2 whitespace-nowrap">
                        {new Date(currentCalendarYear, currentCalendarMonth).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (currentCalendarMonth === 11) {
                            setCurrentCalendarMonth(0);
                            setCurrentCalendarYear(prev => prev + 1);
                          } else {
                            setCurrentCalendarMonth(prev => prev + 1);
                          }
                        }}
                        className="p-1 px-2 rounded bg-gray-900 hover:bg-gray-800 text-gray-300 text-[9px] uppercase font-mono cursor-pointer"
                      >
                        Próximo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] text-gray-500 uppercase tracking-wider font-extrabold border-b border-gray-850/50 pb-1.5">
                    <span>Dom</span>
                    <span>Seg</span>
                    <span>Ter</span>
                    <span>Qua</span>
                    <span>Qui</span>
                    <span>Sex</span>
                    <span>Sáb</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {/* Fillers for empty day start */}
                    {Array.from({ length: new Date(currentCalendarYear, currentCalendarMonth, 1).getDay() }).map((_, idx) => (
                      <div key={`filler-${idx}`} className="h-9" />
                    ))}

                    {/* True days */}
                    {Array.from({ length: new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate() }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const formattedDayString = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const isSelected = scheduledDate === formattedDayString;
                      
                      // Count OS entries scheduled or created on this day
                      const osEvents = ordensServico.filter(o => {
                        if (o.scheduledDate === formattedDayString) return true;
                        if (!o.createdAt) return false;
                        try {
                          const dateObj = new Date(o.createdAt);
                          if (isNaN(dateObj.getTime())) return false;
                          return dateObj.toISOString().split('T')[0] === formattedDayString;
                        } catch (e) {
                          return false;
                        }
                      });
                      const hasEvents = osEvents.length > 0;

                      return (
                        <button
                          key={`day-${dayNum}`}
                          type="button"
                          onClick={() => setScheduledDate(formattedDayString)}
                          className={`h-9 flex flex-col items-center justify-between py-1 px-0.5 rounded transition cursor-pointer relative ${
                            isSelected 
                              ? 'bg-purple-600 text-white font-bold border border-purple-500' 
                              : 'bg-slate-950 hover:bg-slate-900 text-gray-300 border border-slate-900'
                          }`}
                        >
                          <span className="text-[10px] leading-none">{dayNum}</span>
                          
                          {/* Event counter indicators */}
                          {hasEvents && (
                            <div className="flex gap-0.5 items-center justify-center mt-auto" style={{ minHeight: '4px' }}>
                              {osEvents.map((ev, evIdx) => {
                                if (evIdx > 2) return null; // cap visual count
                                const evColor = ev.status === 'Agendada' ? 'bg-purple-400' : 'bg-blue-400';
                                return (
                                  <span 
                                    key={ev.id} 
                                    className={`w-1 h-1 rounded-full ${evColor}`} 
                                    title={`OS: ${ev.id} (${ev.status})`}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Detalhes do dia selecionado */}
                  {scheduledDate && (
                    <div className="mt-2 pt-2 border-t border-gray-850/50 text-[10px] text-left">
                      <span className="text-gray-400 font-mono">📅 AGENDAMENTO EM {safeFormatLocalDate(scheduledDate)}:</span>
                      {(() => {
                        const dayEvents = ordensServico.filter(o => o.scheduledDate === scheduledDate);
                        if (dayEvents.length === 0) {
                          return <div className="text-emerald-400 mt-1 font-mono">✅ Nenhum agendamento prévio. Horários totalmente livres nesta data!</div>;
                        }
                        return (
                          <div className="flex flex-col gap-1 mt-1.5 max-h-[100px] overflow-y-auto scrollbar-thin">
                            {dayEvents.map(e => (
                              <div key={e.id} className="flex justify-between items-center bg-[#070b13] p-1.5 rounded border border-gray-900">
                                <span className="font-mono text-purple-400">🕒 {e.scheduledTime || '00:00'} - OS {e.id}</span>
                                <span className="text-gray-300 truncate max-w-[120px] sm:max-w-none">{e.clienteName} • {e.veiculoInfo}</span>
                                <span className="bg-purple-950/40 text-purple-400 border border-purple-900/40 text-[8px] px-1.5 py-0.2 rounded uppercase font-mono">{e.status}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* Passenger Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-gray-400 uppercase">1. ASSOCIE CLIENTE INTEGRADO</label>
              <select 
                value={selectedClient?.id || ''}
                onChange={(e) => {
                  const found = clientes.find(c => c.id === e.target.value);
                  setSelectedClient(found || null);
                }}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white"
                required
              >
                <option value="">-- Selecione Cliente --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.cpfCnpj})</option>
                ))}
              </select>
            </div>

            {/* Vehicle spec linkage */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-gray-400 uppercase">2. VINCULE O VEÍCULO DE ENTRADA</label>
                {selectedClient && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickVehicle(prev => !prev);
                      setQuickVehSuccess(null);
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer bg-red-950/10 hover:bg-red-950/20 py-1 px-2.5 rounded-lg border border-red-950/50"
                  >
                    {showQuickVehicle ? "✕ Cancelar Registro" : "+ Cadastrar Veículo Rápido"}
                  </button>
                )}
              </div>

              {showQuickVehicle ? (
                <div className="bg-[#050912]/90 border border-red-950/60 rounded-xl p-4 flex flex-col gap-3 text-left">
                  <div className="flex items-center gap-2 text-red-400 font-mono text-[10px] font-bold uppercase tracking-widest border-b border-red-950/40 pb-1.5">
                    <span>🚗 Novo Cadastro Integrado</span>
                  </div>

                  {quickVehSuccess && (
                    <div className="p-2.5 bg-green-950/30 border border-green-800 rounded-lg text-xs text-green-300 font-mono animate-fadeIn">
                      {quickVehSuccess}
                    </div>
                  )}

                  {!quickVehSuccess && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] text-gray-400 font-mono">PLACA *</label>
                            <button
                              type="button"
                              onClick={() => {
                                setPlateScannerTarget('quick');
                                setShowPlateScannerModal(true);
                                startPlateCamera();
                              }}
                              className="text-[9px] text-cyan-400 hover:text-cyan-300 font-mono font-bold flex items-center gap-1 cursor-pointer transition border border-transparent hover:border-cyan-500/20 px-1 py-0.5 rounded"
                            >
                              <Camera className="w-2.5 h-2.5" /> Escanear Placa
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="GOLF-2018"
                            value={quickPlate}
                            onChange={(e) => setQuickPlate(e.target.value.toUpperCase())}
                            maxLength={9}
                            className="bg-black/40 border border-gray-800 rounded-lg py-1.5 px-2.5 text-xs text-white uppercase outline-none focus:border-red-500 font-mono text-center"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-gray-400 font-mono">KM ATUAL</label>
                          <input
                            type="number"
                            placeholder="Ex: 50000"
                            value={quickKm}
                            onChange={(e) => setQuickKm(e.target.value)}
                            className="bg-black/40 border border-gray-800 rounded-lg py-1.5 px-2.5 text-xs text-white outline-none focus:border-red-550 font-mono text-center"
                          />
                        </div>
                      </div>

                      {/* Brand suggestions panel */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] text-gray-400 font-mono">MARCA *</label>
                          {quickBrand && (
                            <span className="text-[9px] text-red-400 font-mono font-bold uppercase">{quickBrand} selecionada</span>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Volkswagen"
                          value={quickBrand}
                          onChange={(e) => {
                            setQuickBrand(e.target.value);
                            const foundSug = AUTO_SUGGESTIONS.find(s => s.name.toLowerCase() === e.target.value.toLowerCase());
                            if (foundSug) {
                              setQuickModelsList(foundSug.models);
                            }
                          }}
                          className="bg-black/40 border border-gray-800 rounded-lg py-1.5 px-2.5 text-xs text-white outline-none focus:border-red-500"
                          required
                        />

                        {/* Brand quick pills */}
                        <div className="flex flex-wrap gap-1 mt-1 pb-1 max-h-24 overflow-y-auto pr-1">
                          {AUTO_SUGGESTIONS.map((sug) => (
                            <button
                              key={sug.name}
                              type="button"
                              onClick={() => {
                                setQuickBrand(sug.name);
                                setQuickModelsList(sug.models);
                                setQuickModel(''); // reset model when brand changes
                              }}
                              className={`px-2 py-1 rounded-lg text-[9.5px] font-medium font-sans transition-all flex items-center gap-1 cursor-pointer border ${
                                quickBrand === sug.name
                                  ? "bg-red-950/40 border-red-500/80 text-red-400 font-bold"
                                  : "bg-slate-900/60 border-gray-850 text-gray-400 hover:text-white hover:border-gray-750"
                              }`}
                            >
                              <span>{sug.emoji}</span> {sug.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Model suggestions panel */}
                      <div className="flex flex-col gap-1 mt-1">
                        <label className="text-[9px] text-gray-400 font-mono">MODELO *</label>
                        <input
                          type="text"
                          placeholder="Ex: Polo TSI"
                          value={quickModel}
                          onChange={(e) => setQuickModel(e.target.value)}
                          className="bg-black/40 border border-gray-800 rounded-lg py-1.5 px-2.5 text-xs text-white outline-none focus:border-red-500"
                          required
                        />

                        {/* Model suggestions pills */}
                        {quickModelsList.length > 0 && (
                          <div className="flex flex-col gap-1 mt-1.5">
                            <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">💡 Modelos Sugeridos para {quickBrand}:</span>
                            <div className="flex flex-wrap gap-1 max-h-18 overflow-y-auto pr-1">
                              {quickModelsList.map((md) => (
                                <button
                                  key={md}
                                  type="button"
                                  onClick={() => setQuickModel(md)}
                                  className={`px-2 py-0.5 rounded-md text-[9px] font-sans transition-all cursor-pointer border ${
                                    quickModel === md
                                      ? "bg-cyan-950/40 border-cyan-500/80 text-cyan-400 font-bold"
                                      : "bg-slate-950 border-gray-900 text-gray-500 hover:text-gray-300 hover:border-gray-800"
                                  }`}
                                >
                                  {md}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 mt-1">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-gray-400 font-mono">ANO FABR.</label>
                          <input
                            type="text"
                            placeholder="2022"
                            value={quickYear}
                            onChange={(e) => setQuickYear(e.target.value)}
                            className="bg-black/40 border border-gray-800 rounded-lg py-1.5 px-2.5 text-xs text-white outline-none focus:border-red-550 font-mono text-center"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] text-gray-400 font-mono">MOTORIZAÇÃO</label>
                          <input
                            type="text"
                            placeholder="2.0 Turbo"
                            value={quickEngine}
                            onChange={(e) => setQuickEngine(e.target.value)}
                            className="bg-black/40 border border-gray-800 rounded-lg py-1.5 px-2.5 text-xs text-white outline-none focus:border-red-550 font-mono text-center"
                          />
                        </div>
                      </div>

                      {/* AI Pre-fill Trigger Button */}
                      <div className="flex flex-col gap-1 mt-1">
                        {/* Cached models history to avoid redundancy */}
                        {(() => {
                          const cachedList = specsCache.getAllCached().slice(0, 4);
                          if (cachedList.length === 0) return null;
                          return (
                            <div className="flex flex-col gap-1 my-1.5 bg-black/25 p-1.5 rounded-lg border border-gray-950/60">
                              <span className="text-[8px] text-gray-400 font-mono uppercase tracking-wider flex items-center gap-1">
                                <span>📂</span> Fichas Salvas no Cache Local:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {cachedList.map((item, idx) => (
                                  <button
                                    type="button"
                                    key={idx}
                                    onClick={() => {
                                      setQuickModel(item.model);
                                      if (item.year) setQuickYear(item.year);
                                      if (item.motor) setQuickEngine(item.motor);
                                      setQuickAiSpecs(item.specs);
                                      setQuickAiIsFromCache(true);
                                      setQuickAiFeedback(`Carregado do cache: ${item.model}`);
                                      setTimeout(() => setQuickAiFeedback(null), 3000);
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-900/60 text-[8px] font-mono text-cyan-400 transition-all cursor-pointer truncate max-w-[150px]"
                                    title={`${item.model} (${item.year}) - Clique para preencher instantaneamente offline`}
                                  >
                                    {item.model} ({item.year})
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        <button
                          type="button"
                          disabled={quickAiLoading || !quickModel}
                          onClick={handleQuickVehicleAiFill}
                          className="py-2 px-3 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/80 disabled:opacity-45 hover:scale-[1.01] transition-all text-cyan-400 font-mono text-[10px] font-bold rounded-lg flex justify-center items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          {quickAiLoading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                              <span>CONSULTANDO REDE NEURAL DE ENGENHARIA...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                              <span>PREENCHER MOTORIZAÇÃO & FICHA TÉCNICA VIA IA</span>
                            </>
                          )
                          }
                        </button>
                      </div>

                      {quickAiSpecs && (
                        <div className="bg-[#030712] border border-cyan-950/60 rounded-xl p-3.5 flex flex-col gap-2.5 mt-1.5 text-xs">
                          <div className="flex justify-between items-center border-b border-cyan-950/40 pb-2">
                            <span className="text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
                              FICHA TÉCNICA SUGERIDA POR IA
                            </span>
                            {quickAiIsFromCache ? (
                              <span className="text-[8.5px] bg-emerald-950/40 border border-emerald-800/80 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wide">
                                ⚡ CACHED (Offline)
                              </span>
                            ) : (
                              <span className="text-[8.5px] bg-sky-950/40 border border-sky-800/80 text-sky-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wide">
                                🌐 LIVE API
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                            <div className="p-1.5 bg-black/40 rounded-lg border border-gray-900">
                              <span className="text-[8px] font-mono text-cyan-500 block uppercase">Viscosidade Óleo</span>
                              <span className="font-mono text-white text-xs font-bold">{quickAiSpecs.oilViscosity}</span>
                            </div>
                            <div className="p-1.5 bg-black/40 rounded-lg border border-gray-900">
                              <span className="text-[8px] font-mono text-cyan-500 block uppercase">Capacidade Cárter</span>
                              <span className="font-mono text-white text-xs font-bold">{quickAiSpecs.oilCapacity}</span>
                            </div>
                            <div className="p-1.5 bg-black/40 rounded-lg border border-gray-900 col-span-2">
                              <span className="text-[8px] font-mono text-cyan-500 block uppercase">Especificação da Montadora</span>
                              <span className="text-gray-200 text-xs font-mono">{quickAiSpecs.oilSpecification}</span>
                            </div>
                          </div>

                          <div className="p-1.5 bg-black/40 rounded-lg border border-gray-900 text-[10.5px]">
                            <span className="text-[8px] font-mono text-gray-500 block uppercase mb-0.5">Propriedades do Fluido</span>
                            <p className="text-gray-300 italic">{quickAiSpecs.oilAdditionalNotes}</p>
                          </div>

                          <div className="p-1.5 bg-black/40 rounded-lg border border-gray-900 text-[10.5px]">
                            <span className="text-[8px] font-mono text-gray-500 block uppercase mb-1">Dicas & Alertas Mecânicos</span>
                            <p className="text-gray-300 font-mono text-[10px] leading-relaxed">{quickAiSpecs.technicalNotes}</p>
                          </div>

                          {quickAiSpecs.commonParts && quickAiSpecs.commonParts.length > 0 && (
                            <div className="p-1.5 bg-black/40 rounded-lg border border-gray-900 text-[10.5px]">
                              <span className="text-[8px] font-mono text-gray-500 block uppercase mb-1">Peças Periódicas Homologadas</span>
                              <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
                                {quickAiSpecs.commonParts.map((pt: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center text-[9.5px] border-b border-gray-950/60 py-0.5 last:border-b-0">
                                    <div className="flex flex-col">
                                      <span className="text-gray-300 font-bold font-sans">{pt.name}</span>
                                      <span className="text-gray-500 font-mono text-[8.5px]">Ref: {pt.oemReference}</span>
                                    </div>
                                    <span className="text-cyan-400 bg-cyan-950/20 px-1 border border-cyan-950 rounded font-mono text-[8px] uppercase">{pt.category}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {quickAiFeedback && (
                            <div className="p-2.5 bg-emerald-950/40 border border-emerald-900/50 text-[10px] text-emerald-400 font-mono rounded-lg animate-pulse text-center col-span-2 mt-1">
                              🎉 {quickAiFeedback}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 mt-1 col-span-2">
                            <button
                              type="button"
                              onClick={() => {
                                let specsText = `[FICHA TÉCNICA SUGERIDA POR IA] - ${quickBrand} ${quickModel} (${quickYear})\n`;
                                specsText += `- Óleo Recomendado: ${quickAiSpecs.oilViscosity} (${quickAiSpecs.oilType || 'Sintético'})\n`;
                                specsText += `- Especificação / Norma: ${quickAiSpecs.oilSpecification}\n`;
                                specsText += `- Capacidade Cárter: ${quickAiSpecs.oilCapacity}\n`;
                                specsText += `- Notas de Engenharia: ${quickAiSpecs.oilAdditionalNotes}\n`;
                                specsText += `- Problemas/Recall conhecidos: ${quickAiSpecs.technicalNotes}`;
                                
                                setDiagnosisText(prev => prev ? prev + "\n\n" + specsText : specsText);
                                setQuickAiFeedback("Ficha técnica injetada com sucesso no campo de diagnóstico!");
                                setTimeout(() => setQuickAiFeedback(null), 4000);
                              }}
                              className="py-1.5 px-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 rounded text-[9.5px] font-bold font-sans text-cyan-400 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                            >
                              📋 INJETAR FICHA NA O.S.
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (quickAiSpecs.commonParts && quickAiSpecs.commonParts.length > 0) {
                                  // Map suggested parts to O.S. partsused format
                                  const partsToAdd = quickAiSpecs.commonParts.map((pt: any, idx: number) => ({
                                    id: "part_ai_" + idx + "_" + Date.now(),
                                    name: `${pt.name} (${quickModel} - ${pt.oemReference})`,
                                    sellPrice: 0, 
                                    quantity: 1
                                  }));
                                  setParts(prev => [...prev, ...partsToAdd]);
                                  setQuickAiFeedback("Peças recomendadas adicionadas ao orçamento de O.S.!");
                                  setTimeout(() => setQuickAiFeedback(null), 4000);
                                }
                              }}
                              className="py-1.5 px-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 rounded text-[9.5px] font-bold font-sans text-emerald-400 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                            >
                              🛒 ORÇAR PEÇAS DE FILTRO
                            </button>
                          </div>
                        </div>
                      )}

                      {quickAiError && (
                        <div className="p-2 bg-red-950/20 border border-red-900/60 text-[10px] text-red-400 font-mono rounded-lg">
                          ⚠️ {quickAiError}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleQuickVehicleSave}
                        className="py-2.5 px-4 bg-red-600 hover:bg-red-700 hover:scale-[1.01] transition-all text-white font-mono text-xs font-bold rounded-lg mt-2 flex justify-center items-center gap-2 cursor-pointer border border-transparent shadow-lg shadow-red-950/30"
                      >
                        ✅ SALVAR E ATRELAR AUTOMÓVEL
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <select 
                  value={selectedVehicle?.id || ''}
                  disabled={!selectedClient}
                  onChange={(e) => {
                    const found = veiculos.find(v => v.id === e.target.value);
                    setSelectedVehicle(found || null);
                  }}
                  className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white disabled:opacity-40 focus:outline-none focus:border-gray-700"
                  required
                >
                  <option value="">-- Selecione Automóvel --</option>
                  {veiculos
                    .filter(v => !selectedClient || v.clienteId === selectedClient.id)
                    .map(v => (
                      <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>
                    ))
                  }
                </select>
              )}
            </div>

            {selectedVehicle && (() => {
              const info = getWarrantyReturnInfo(selectedVehicle.id);
              if (info?.isWithinWarranty && info.latestOS) {
                return (
                  <div className="md:col-span-2 p-3.5 bg-rose-950/20 border-2 border-rose-500/50 rounded-xl leading-relaxed text-rose-300 text-xs font-sans animate-pulse flex flex-col gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                    <span className="font-extrabold text-[11px] text-rose-450 tracking-wider uppercase flex items-center gap-1.5">
                      ⚠️ ALERTA: RETORNO DE REVISÃO DENTRO DA GARANTIA
                    </span>
                    <p className="text-gray-305 text-gray-300">
                      O veículo <strong>{selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.plate})</strong> possui uma Ordem de Serviço anterior concluída há <strong>{info.diffDays} dias</strong>, o que está dentro do prazo mestre de garantia de <strong>{info.warrantyDays} dias</strong>.
                    </p>
                    <div className="p-2 border border-rose-950/45 bg-[#0e0c15] rounded-lg mt-0.5 font-mono text-[9.5px] text-slate-300 flex flex-col gap-0.5">
                      <div>• <strong>OS Origem:</strong> #{info.latestOS.id} em {new Date(info.latestOS.createdAt).toLocaleDateString()}</div>
                      <div>• <strong>Mecânico:</strong> {info.latestOS.mechanicName || 'Sem Atribuir'}</div>
                      <div>• <strong>Diagnóstico Anterior:</strong> "{info.latestOS.diagnosis}"</div>
                      <div>• <strong>Serviços:</strong> {info.latestOS.services.map(s => s.description).join(', ') || 'Nenhum'}</div>
                    </div>
                    <p className="text-[10px] text-rose-400 font-sans mt-0.5">
                      💡 <strong>Importante:</strong> Considere tratar esta nova intervenção técnica sob as regras de garantia para isenção técnica ou reabertura!
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            {/* Kilometer entry */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-gray-400">QUILOMETRAGEM ATUAL (KM)</label>
                  <input 
                    type="number"
                    placeholder="Ex: 68500"
                    value={kmStr}
                    onChange={(e) => setKmStr(e.target.value)}
                    className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-xs text-white font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-gray-400">ETIQUETA KM ANTERIOR</label>
                  <input 
                    type="number"
                    placeholder="Ex: 60000"
                    value={kmAnteriorEtiquetaStr}
                    onChange={(e) => setKmAnteriorEtiquetaStr(e.target.value)}
                    className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-xs text-white font-mono focus:border-red-500"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-gray-400">DEFINIR MECÂNICO ALOCADO</label>
                  <select 
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono"
                  >
                    <option value="Marcio Rezende">Marcio Rezende</option>
                    <option value="Gerson Geleia Souza">Gerson "Geleia" Souza</option>
                    <option value="Clécio Santos">Clécio Santos (Admin)</option>
                  </select>
                </div>

                <div className="flex justify-start sm:justify-end items-end pb-1.5">
                  <span className="text-[9px] text-gray-500 font-mono italic leading-tight">Análise preventiva ideal com base na diferença de KMs.</span>
                </div>
              </div>
            </div>

            {/* Symptoms Description */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-mono text-gray-400 uppercase">3. SINTOMAS E RECLAMAÇÃO DO CLIENTE</label>
              <textarea 
                rows={3}
                placeholder="Ex Nomeadamente: Ruído agudo ao frear em descidas acentuadas, luz do motor amarela acesa no painel do carro."
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                className="w-full bg-[#080c16] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>

            {/* DYNAMIC INTEGRATED AI ENGINE MODULE PREDICTION */}
            <div className="md:col-span-2 p-4.5 bg-red-950/10 border border-red-900/30 rounded-2xl flex flex-col gap-3 relative">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-red-950 pb-2.5">
                <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-semibold">
                  <Sparkles className="w-4 h-4 text-red-500 animate-spin" />
                  PREDIÇÃO MECÂNICA E ORÇAMENTAL POR IA (GEMINI 2.5 FLASH)
                </div>
                <button 
                  type="button"
                  onClick={handleAiAutoDiagnosis}
                  disabled={aiLoading}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white font-mono text-[10px] rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                >
                  {aiLoading ? "Carregando..." : "✨ ANALISAR SINTOMAS POR IA"}
                </button>
              </div>

              {aiDiagnosticSummary ? (
                <div className="text-xs transition-opacity duration-300">
                  <div className="bg-black/40 p-3 rounded-lg border border-red-950/30 mb-3 leading-relaxed">
                    <span className="font-bold text-red-400 block mb-1">Diagnóstico estimado pela IA:</span>
                    {aiDiagnosticSummary.diagnosis}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono mb-2">
                    <div className="bg-[#0b0c13] p-2.5 rounded border border-gray-900">
                      <span className="text-red-400 font-bold block mb-1">Peça Estimada Necessária:</span>
                      {aiDiagnosticSummary.suggestedParts?.[0]?.name || "Nenhuma peça específica sugerida"} ({aiDiagnosticSummary.suggestedParts?.[0]?.confidence || '90%'} confiança)
                    </div>
                    <div className="bg-[#0b0c13] p-2.5 rounded border border-gray-900">
                      <span className="text-cyan-400 font-bold block mb-1">Mão de obra média sugerida:</span>
                      {aiDiagnosticSummary.suggestedServices?.[0]?.description || "Diagnóstico Computorizado"} - {aiDiagnosticSummary.suggestedServices?.[0]?.estLaborCost || "R$ 150,00"}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 italic block font-sans">** Diagnóstico gerivo gerado por Inteligência Artificial baseado na biblioteca técnica do carro. Verifique fisicamente no elevador.</span>
                </div>
              ) : (
                <span className="text-[11px] text-gray-400 leading-relaxed font-sans">
                  Insira o modelo de carro e clique na análise inteligente para que o assistente Gemini AI calcule probabilidade de fadiga, consulte manuais de marcas oficiais e injete automaticamente serviços e peças recomendadas ao orçamento!
                </span>
              )}
            </div>

            {/* Quick Yard Check-in Checklist */}
            <div className="md:col-span-2 flex flex-col gap-3 p-4 bg-red-950/5 border border-red-900/10 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[12px]">📋</span>
                  <label className="text-[10.5px] font-mono font-bold text-red-400 uppercase tracking-wider">
                    4. VISTORIA RÁPIDA DE ENTRADA NO PÁTIO (CHECK-IN DE VEÍCULO)
                  </label>
                </div>
                <span className="px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-900/30 text-[9px] font-mono uppercase font-bold animate-pulse">
                  Recepção Segura
                </span>
              </div>
              
              <p className="text-[11px] text-gray-400 font-sans leading-normal -mt-1 mb-1">
                Vistoria de pátio indispensável para salvaguarda de integridade legal e jurídica de pátio técnico frente a reclamações posteriores.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {checklist.map((item, idx) => {
                  if (!["Nível de Combustível", "Objetos no Carro", "Avarias Existentes"].includes(item.label)) {
                    return null;
                  }

                  // Contextual guidance helper text based on label and active status
                  let guidanceText = "Aguardando Vistoria";
                  if (item.label === "Nível de Combustível") {
                    guidanceText = item.status === 'ok' ? 'Tanque Seguro (Acima de 1/4)' : item.status === 'fail' ? 'Atenção: Combustível na Reserva!' : 'Não avaliado no pátio';
                  } else if (item.label === "Objetos no Carro") {
                    guidanceText = item.status === 'ok' ? 'Sem pertences declarados' : item.status === 'fail' ? 'Possui pertences de valor declarados' : 'Não vistoriado';
                  } else if (item.label === "Avarias Existentes") {
                    guidanceText = item.status === 'ok' ? 'Veículo sem ranhuras ou riscos visíveis' : item.status === 'fail' ? 'Avarias/riscos catalogados' : 'Vistoria visual pendente';
                  }

                  return (
                    <div key={idx} className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-gray-900 bg-[#080c16] hover:border-gray-800 transition-all duration-200">
                      <div className="flex flex-col text-left">
                        <span className="text-[11px] text-gray-200 font-bold tracking-wider uppercase font-mono">{item.label}</span>
                        <span className="text-[9.5px] text-gray-400 font-sans mt-0.5 block italic">{guidanceText}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-1 bg-black/50 p-1 rounded-lg border border-gray-850">
                        <button 
                          type="button" 
                          onClick={() => toggleChecklistStatus(idx, 'ok')}
                          className={`text-[8.5px] font-bold py-1 px-1 rounded transition duration-150 uppercase tracking-tighter ${
                            item.status === 'ok' 
                              ? 'bg-green-600/90 text-white shadow-sm font-extrabold' 
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          {item.label === "Avarias Existentes" ? "INTEGRO" : item.label === "Nível de Combustível" ? "OK / CHEIO" : "RECOLHIDO"}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => toggleChecklistStatus(idx, 'fail')}
                          className={`text-[8.5px] font-bold py-1 px-1 rounded transition duration-150 uppercase tracking-tighter ${
                            item.status === 'fail' 
                              ? 'bg-red-650 bg-red-600 text-white shadow-sm font-extrabold' 
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          {item.label === "Avarias Existentes" ? "CONSTA RISCOS" : item.label === "Nível de Combustível" ? "RESERVA" : "TEM OBJETOS"}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => toggleChecklistStatus(idx, 'na')}
                          className={`text-[8.5px] font-bold py-1 px-1 rounded transition duration-150 uppercase tracking-tighter ${
                            item.status === 'na' 
                              ? 'bg-slate-700 text-white shadow-sm font-extrabold' 
                              : 'text-gray-505 text-gray-500 hover:text-gray-400'
                          }`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Camera Visual Capture Component */}
            <div className="md:col-span-2 flex flex-col gap-3 p-4 bg-orange-950/5 border border-orange-900/15 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[12px]">📸</span>
                  <label className="text-[10.5px] font-mono font-bold text-orange-400 uppercase tracking-wider">
                    4.1 REGISTRO FOTOGRÁFICO DE AVARIAS (IMAGEM DO VEÍCULO DE ENTRADA)
                  </label>
                </div>
                <span className="px-2 py-0.5 rounded bg-orange-950/40 text-orange-400 border border-orange-900/30 text-[9px] font-mono uppercase font-bold">
                  Laudo Visual de Pátio
                </span>
              </div>

              <p className="text-[11px] text-gray-400 font-sans leading-normal -mt-1 mb-1">
                Utilize a câmera de pátio ou anexe arquivos para salvaguardar o estado do veículo frente a ranhuras, riscos ou amassados pré-existentes no ato do check-in.
              </p>

              {cameraError && (
                <div className="p-2.5 bg-red-950/25 border border-red-900/50 rounded-xl text-red-400 font-mono text-[10px] text-left leading-normal">
                  ⚠️ {cameraError}
                </div>
              )}

              {/* Flexbox for Actions */}
              <div className="flex flex-wrap gap-2.5">
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="py-1.5 px-3 bg-orange-600 hover:bg-orange-700 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition duration-150 shadow"
                  >
                    <Camera className="w-4 h-4" /> Ativar Câmera do Dispositivo
                  </button>
                ) : (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="py-1.5 px-3.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition duration-150 shadow animate-pulse"
                    >
                      📸 TIRAR FOTO DO VEÍCULO
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="py-1.5 px-3 bg-slate-800 text-slate-300 font-mono text-xs font-semibold rounded-lg hover:bg-slate-700 cursor-pointer transition duration-150"
                    >
                      Desativar Câmera
                    </button>
                  </div>
                )}

                {/* Upload form element */}
                <label className="py-1.5 px-3 bg-slate-900 border border-gray-850 text-gray-300 font-mono text-xs font-semibold rounded-lg hover:text-white hover:border-gray-500 cursor-pointer flex items-center gap-1.5 transition">
                  📁 Escolher do Computador/Celular
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Camera view screen if active */}
              {cameraActive && (
                <div className="relative mt-2 rounded-xl overflow-hidden border border-orange-900/40 bg-black aspect-video max-w-lg mx-auto w-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/60 backdrop-blur-sm border border-gray-800 rounded-lg p-2 text-center text-[10px] text-gray-300 font-mono">
                    ⚠️ Posicione a avaria ou a dianteira do carro no campo de visão e tire a foto.
                  </div>
                </div>
              )}

              {/* Uploaded / Captured Photos Gallery */}
              {capturedPhotos.length > 0 && (
                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-900">
                  <span className="text-[10px] text-gray-400 font-mono uppercase font-bold text-left">📸 IMAGENS DE VISTORIA VINCULADAS AO CHECK-IN ({capturedPhotos.length}):</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5 mt-1">
                    {capturedPhotos.map((photo, index) => (
                      <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-800 aspect-square bg-slate-950">
                        <img src={photo} alt={`Pre-existing conditions ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => deleteCapturedPhoto(index)}
                          className="absolute top-1 right-1 bg-red-650/90 text-white rounded-full p-1 border border-red-500 hover:bg-red-700 transition"
                          title="Remover Imagem"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/75 text-[9px] text-orange-400 font-bold border border-orange-950">
                          FOTO {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Checklist of reception (Technical items) */}
            <div className="md:col-span-2 flex flex-col gap-2 bg-slate-900/10 p-4 rounded-2xl border border-gray-800">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
                5. INSPEÇÃO TÉCNICA DE RECEPÇÃO (SISTEMAS E FLUIDOS AUTOMOTIVOS)
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {checklist.map((item, idx) => {
                  if (["Nível de Combustível", "Objetos no Carro", "Avarias Existentes"].includes(item.label)) {
                    return null;
                  }
                  return (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-gray-900 bg-[#080c16]">
                      <span className="text-[11px] text-gray-300 font-medium ">{item.label}</span>
                      <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-gray-800">
                        <button 
                          type="button" 
                          onClick={() => toggleChecklistStatus(idx, 'ok')}
                          className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded ${item.status === 'ok' ? 'bg-green-600 text-white' : 'text-gray-500'}`}
                        >
                          OK
                        </button>
                        <button 
                          type="button" 
                          onClick={() => toggleChecklistStatus(idx, 'fail')}
                          className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded ${item.status === 'fail' ? 'bg-red-650 bg-red-600 text-white' : 'text-gray-500'}`}
                        >
                          REPR
                        </button>
                        <button 
                          type="button" 
                          onClick={() => toggleChecklistStatus(idx, 'na')}
                          className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded ${item.status === 'na' ? 'bg-slate-700 text-white' : 'text-gray-500'}`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Manual ADD Services proposed */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-gray-400 uppercase">6. DEFINE LABOR / MÃO DE OBRA ADICIONAL</label>
              <div className="bg-[#080c16] p-4 rounded-xl border border-gray-900 flex flex-col gap-3">
                
                {/* Cataloged predefined services */}
                <div className="border-b border-gray-850 pb-3 mb-1 flex flex-col gap-1.5">
                  <span className="text-[9px] font-mono text-gray-500 uppercase">SELECIONAR DE SERVIÇO DO CATÁLOGO</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={selectedSrvId}
                      onChange={(e) => setSelectedSrvId(e.target.value)}
                      className="flex-grow min-w-0 bg-[#050810] border border-gray-800 rounded py-1.5 px-2 text-xs text-white"
                    >
                      <option value="">-- Escolha um Serviço Pré-Cadastrado --</option>
                      {servicos.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (R$ {s.price.toFixed(2)})</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleAddCatalogService(selectedSrvId)}
                      className="px-4 py-1.5 bg-red-650 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded font-mono shrink-0 whitespace-nowrap cursor-pointer"
                    >
                      VINCULAR
                    </button>
                  </div>
                </div>

                <span className="text-[9px] font-mono text-gray-500 uppercase">OU REGISTRAR MÃO DE OBRA AVULSA</span>
                <input 
                  type="text" 
                  placeholder="Descrição do serviço (ex: Troca óleo motor)"
                  className="w-full bg-[#050810] border border-gray-800 rounded py-1.5 px-3 text-xs text-white"
                  value={manualServiceDesc}
                  onChange={(e) => setManualServiceDesc(e.target.value)}
                />
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Preço (R$)"
                    className="w-28 bg-[#050810] border border-gray-800 rounded py-1.5 px-3 text-xs text-white font-mono"
                    value={manualServicePrice}
                    onChange={(e) => setManualServicePrice(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={handleAddManualService}
                    className="flex-grow py-1.5 px-3 bg-slate-800 text-white text-xs font-semibold rounded hover:bg-slate-700 font-mono"
                  >
                    + ADICIONAR MÃO DE OBRA
                  </button>
                </div>

                {/* Services attached */}
                {services.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-2 bg-black/40 p-2.5 rounded border border-gray-950 font-mono text-[11px]">
                    <span className="font-bold text-gray-400 block mb-1">MÃOS DE OBRA INCLUSAS:</span>
                    {services.map((srv, idx) => (
                      <div key={srv.id} className="flex justify-between items-center text-slate-350 text-slate-300">
                        <span>• {srv.description}</span>
                        <div className="flex items-center gap-1">
                          <span>R$ {srv.price.toFixed(2)}</span>
                          <button 
                            type="button" 
                            onClick={() => setServices(prev => prev.filter(s => s.id !== srv.id))}
                            className="text-red-500 font-bold ml-1 hover:text-red-700 font-mono"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Select parts registered from Inventory or brought by client */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono text-gray-400 uppercase">7. VINCULAR PEÇAS DA ORDEM DE SERVIÇO</label>
              <div className="bg-[#080c16] p-4 rounded-xl border border-gray-900 flex flex-col gap-3 text-left">
                
                {/* Tab switch */}
                <div className="flex justify-between items-center bg-[#050812] p-1 rounded border border-gray-850">
                  <button
                    type="button"
                    onClick={() => {
                      setUseManualPart(false);
                      setPartOrigin('estoque');
                    }}
                    className={`flex-1 text-center py-1 rounded text-[10px] font-bold font-mono uppercase transition-all ${!useManualPart ? 'bg-slate-800 text-white' : 'text-gray-500 hover:text-slate-300'}`}
                  >
                    Estoque Interno
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseManualPart(true)}
                    className={`flex-1 text-center py-1 rounded text-[10px] font-bold font-mono uppercase transition-all ${useManualPart ? 'bg-slate-800 text-white' : 'text-gray-500 hover:text-slate-300'}`}
                  >
                    Peça Manual / Direta
                  </button>
                </div>

                {!useManualPart ? (
                  <select 
                    value={selectedProdId}
                    onChange={(e) => setSelectedProdId(e.target.value)}
                    className="w-full bg-[#050810] border border-gray-800 rounded py-1.5 px-2 text-xs text-white"
                  >
                    <option value="">-- Selecione Peça do Estoque --</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (R$ {p.sellPrice}) - Saldo: {p.quantity} un</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text" 
                      placeholder="Nome/Marca da Peça (Ex: Pastilha Dianteira Bosch)"
                      className="flex-grow bg-[#050810] border border-gray-800 rounded py-1.5 px-3 text-xs text-white font-mono"
                      value={manualPartNameInput}
                      onChange={(e) => setManualPartNameInput(e.target.value)}
                    />
                    {partOrigin === 'estoque' && (
                      <input 
                        type="number" 
                        placeholder="Preço R$"
                        step="0.01"
                        className="w-24 bg-[#050810] border border-gray-800 rounded py-1.5 px-3 text-xs text-white font-mono text-center"
                        value={manualPartPriceInput}
                        onChange={(e) => setManualPartPriceInput(e.target.value)}
                      />
                    )}
                  </div>
                )}

                {/* Part Origin Selection */}
                <div className="flex flex-col gap-1.5 bg-[#050812] border border-gray-850 p-3 rounded-lg">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Origem da Peça:</span>
                  <select
                    value={partOrigin}
                    onChange={(e) => {
                      const newOrigin = e.target.value as 'estoque' | 'cliente' | 'terceiros';
                      setPartOrigin(newOrigin);
                    }}
                    className="w-full bg-[#050810] border border-gray-800 rounded py-1.5 px-2 text-xs text-white font-mono cursor-pointer"
                  >
                    <option value="estoque">Estoque Próprio</option>
                    <option value="cliente">Cliente Trouxe (R$ 0,00)</option>
                    <option value="terceiros">Compra de Terceiros (Sem Margem de Lucro)</option>
                  </select>

                  {partOrigin === 'terceiros' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-850/50">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-mono text-amber-500 uppercase">Nome do Fornecedor:</label>
                        <input
                          type="text"
                          placeholder="Ex: Auto Peças Alvorada"
                          className="bg-[#050810] border border-gray-800 rounded py-1 px-2 text-xs text-white font-mono"
                          value={partSupplierName}
                          onChange={(e) => setPartSupplierName(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-mono text-amber-500 uppercase">Valor de Custo (Sem Margem):</label>
                        <input
                          type="number"
                          placeholder="R$ Preço de Custo"
                          step="0.01"
                          className="bg-[#050810] border border-gray-800 rounded py-1 px-2 text-xs text-white font-mono"
                          value={partCostPrice}
                          onChange={(e) => setPartCostPrice(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500 font-mono">Qtd:</span>
                    <input 
                      type="number" 
                      min="1" 
                      className="w-16 bg-[#050810] border border-gray-800 rounded py-1.5 px-2 text-xs text-white font-mono text-center"
                      value={selectedProdQty}
                      onChange={(e) => setSelectedProdQty(e.target.value)}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddPartToOS}
                    className="flex-grow py-1.5 px-3 bg-[#0a0f1d] hover:bg-slate-800 text-white text-xs font-semibold rounded font-mono uppercase border border-gray-800"
                  >
                    + associar {partOrigin === 'cliente' ? "peça do cliente" : partOrigin === 'terceiros' ? "peça de terceiros" : "peça"}
                  </button>
                </div>

                {/* Parts attached list */}
                {parts.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-2 bg-black/40 p-2.5 rounded border border-gray-950 font-mono text-[11px]">
                    <span className="font-bold text-gray-400 block mb-1">RELAÇÃO DE PEÇAS ASSOCIADAS À O.S.:</span>
                    {parts.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-300 border-b border-gray-900 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-left font-sans flex flex-col sm:flex-row sm:items-center gap-1">
                          <span>• ({p.quantity}x) {p.name}</span>
                          <span className="flex items-center gap-1">
                            {p.suppliedByClient && (
                              <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase font-bold font-mono">
                                Cliente Trouxe
                              </span>
                            )}
                            {p.origin === 'terceiros' && (
                              <span className="text-[8px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded uppercase font-bold font-mono">
                                Compra de Terceiros {p.supplierName ? `(${p.supplierName})` : ''}
                              </span>
                            )}
                            {p.origin === 'estoque' && (
                              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold font-mono">
                                Estoque Próprio
                              </span>
                            )}
                          </span>
                        </span>
                        <div className="flex items-center gap-1 shrink-0 font-mono">
                          <span>R$ {p.suppliedByClient ? "0,00" : (p.sellPrice * p.quantity).toFixed(2)}</span>
                          <button 
                            type="button" 
                            onClick={() => setParts(prev => prev.filter((it, index) => index !== idx))}
                            className="text-red-500 font-bold ml-1.5 hover:text-red-700 text-sm"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Total Budget calculation box */}
            <div className="md:col-span-2 bg-[#080d19] rounded-2xl border border-gray-800 p-4.5 flex justify-between items-center my-2">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 block font-mono">VALOR ESTIMADO DO ORÇAMENTO TRABALHOS:</span>
                <span className="text-[10px] text-gray-500 block">Calculado dinamicamente com base nas peças incluídas + serviços.</span>
              </div>
              <span className="text-xl sm:text-2xl font-display font-black text-white">R$ {osCalculatedTotal().toFixed(2)}</span>
            </div>

            {/* Manual Diagnosis */}
            <div className="flex flex-col gap-2 md:col-span-2 font-mono">
              <label className="text-[10px] font-mono text-gray-450 uppercase">8. DIAGNÓSTICO DO MECÂNICO E LAUDO FINAL</label>
              <textarea 
                rows={2}
                placeholder="Ex Nomeadamente: Constatado sulcos excessivos no disco de freio Fremax, obrigando lixamento ou substituição do par dianteiro."
                value={diagnosisText}
                onChange={(e) => setDiagnosisText(e.target.value)}
                className="w-full bg-[#080c16] border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            {/* 9. CONFIGURAÇÕES DE LEMBRETE DE WHATSAPP */}
            <div className="md:col-span-2 bg-[#09101f] border border-gray-800/80 rounded-2xl p-5 flex flex-col gap-4 font-sans text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-850 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className={`w-5 h-5 ${reminderEnabled ? 'text-red-500 animate-bounce' : 'text-gray-500'}`} />
                  <div>
                    <h4 className="text-sm font-semibold text-white uppercase font-display tracking-tight">9. Configurações de Lembrete</h4>
                    <p className="text-[11px] text-gray-400">Defina quantos dias antes do vencimento o cliente deve ser alertado via WhatsApp.</p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={reminderEnabled} 
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-950 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-550 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  <span className="ml-2.5 text-xs font-bold text-gray-300">{reminderEnabled ? "ATIVADO" : "DESATIVADO"}</span>
                </label>
              </div>

              {reminderEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Prazos */}
                  <div className="md:col-span-6 flex flex-col gap-1.5 text-xs text-gray-300">
                    <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">PRAZO DE VALIDADE DA ORDEM/GARANTIA</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[15, 30, 90].map((d) => (
                        <button 
                          key={d}
                          type="button"
                          onClick={() => setVencimentoDays(d)}
                          className={`py-2 px-3 border rounded-xl font-mono font-bold transition-all cursor-pointer ${
                            vencimentoDays === d 
                              ? 'bg-red-600/15 border-red-550 text-white' 
                              : 'bg-slate-950/40 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                          }`}
                        >
                          {d} dias
                        </button>
                      ))}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 font-mono">Ou dias personalizados:</span>
                      <input 
                        type="number" 
                        min="1"
                        value={vencimentoDays}
                        onChange={(e) => setVencimentoDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 bg-[#080c16] border border-gray-800 rounded-lg py-1 px-2 text-[11px] font-mono text-white text-center"
                      />
                    </div>
                  </div>

                  {/* Antecedência */}
                  <div className="md:col-span-6 flex flex-col gap-1.5 text-xs text-gray-300">
                    <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">ENVIAR DISPARO NO WHATSAPP QUANTO TEMPO ANTES?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 3, 5].map((d) => (
                        <button 
                          key={d}
                          type="button"
                          onClick={() => setReminderDays(d)}
                          className={`py-2 px-3 border rounded-xl font-mono font-bold transition-all cursor-pointer ${
                            reminderDays === d 
                              ? 'bg-purple-950/20 border-purple-500 text-white' 
                              : 'bg-slate-950/40 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                          }`}
                        >
                          {d} {d === 1 ? 'dia' : 'dias'} antes
                        </button>
                      ))}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 font-mono">Diferente antes:</span>
                      <input 
                        type="number" 
                        min="1"
                        max={vencimentoDays - 1}
                        value={reminderDays}
                        onChange={(e) => setReminderDays(Math.min(vencimentoDays - 1, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-16 bg-[#080c16] border border-gray-805 rounded-lg py-1 px-2 text-[11px] font-mono text-white text-center"
                      />
                    </div>
                  </div>

                  {/* Realtime scheduler calendar line */}
                  <div className="md:col-span-12 bg-slate-950/80 border border-gray-800/60 p-4 rounded-xl flex flex-col gap-2.5">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-extrabold flex items-center gap-1">
                      <CalendarRange className="w-3.5 h-3.5" />
                      CRONOGRAMA DE DISPAROS DE MONITORAMENTO ATUALIZADO
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 text-xs">
                      <div className="bg-[#0c1223] rounded-lg p-2.5 border border-gray-900 flex flex-col gap-0.5">
                        <span className="text-gray-500 block text-[9px] font-mono">Abertura OS (Hoje)</span>
                        <span className="font-mono text-white font-bold">{new Date().toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      <div className="bg-red-950/15 rounded-lg p-2.5 border border-red-900/30 flex flex-col gap-0.5">
                        <span className="text-red-400/80 block text-[9px] font-mono font-bold">🔔 Dia de Alerta WhatsApp</span>
                        <span className="font-mono text-white font-bold flex items-center gap-1 text-red-400">
                          {(() => {
                            const date = new Date();
                            date.setDate(date.getDate() + vencimentoDays - reminderDays);
                            return date.toLocaleDateString('pt-BR');
                          })()} 
                          <span className="text-[10px] text-gray-400 font-normal">({reminderDays}d antes)</span>
                        </span>
                      </div>
                      
                      <div className="bg-[#0b101d] rounded-lg p-2.5 border border-gray-850 flex flex-col gap-0.5">
                        <span className="text-gray-500 block text-[9px] font-mono font-bold">📅 Vencimento de Validade</span>
                        <span className="font-mono text-white font-bold text-gray-300">
                          {(() => {
                            const date = new Date();
                            date.setDate(date.getDate() + vencimentoDays);
                            return date.toLocaleDateString('pt-BR');
                          })()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-1 flex flex-col gap-1 border-t border-gray-900/60 pt-2.5">
                      <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-wider block">PREVIEW DO LEMBRETE AUTOMÁTICO</span>
                      <div className="p-2.5 bg-black/30 border border-gray-900 rounded-lg text-[11px] text-gray-300 leading-normal font-mono select-none">
                        "Prezado(a) *{selectedClient?.name || "Cliente Teste"}*, informamos que o orçamento ou os termos da garantia da sua *OS #{new Date().getFullYear() + "-XXXX"}* ({selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : "Veículo"}) expira em *{(() => {
                          const date = new Date();
                          date.setDate(date.getDate() + vencimentoDays);
                          return date.toLocaleDateString('pt-BR');
                        })()}* (vence em {reminderDays} {reminderDays === 1 ? 'dia' : 'dias'}). Favor entrar em contato para validação!"
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 10. REGIME DE FATURAMENTO DA ORDEM DE SERVIÇO */}
            <div className="md:col-span-2 bg-[#09101f] border border-gray-800/80 rounded-2xl p-5 flex flex-col gap-4 font-sans text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-850 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-red-500 animate-pulse" />
                  <div>
                    <h4 className="text-sm font-semibold text-white uppercase font-display tracking-tight">10. Regime de Cobrança / Faturamento</h4>
                    <p className="text-[11px] text-gray-400">Escolha como esta O.S. será cobrada do cliente no controle interno de recebíveis.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 text-xs text-gray-300">
                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">MÉTODO DE COBRANÇA</label>
                  <select
                    value={faturamentoMode}
                    onChange={(e) => setFaturamentoMode(e.target.value as any)}
                    className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono cursor-pointer focus:border-red-550 focus:outline-none"
                  >
                    <option value="Balcão">💵 Balcão / À Vista / PDV Imediato</option>
                    <option value="A faturar">💳 A Faturar (Descontar do Limite de Crédito)</option>
                  </select>
                </div>

                {selectedClient ? (
                  <div className="bg-slate-950/45 p-3 rounded-xl border border-gray-900 flex flex-col gap-1 font-mono text-[10px]">
                    <span className="text-red-400 font-bold uppercase text-[9px] flex items-center gap-1">💳 Limite de Crédito:</span>
                    <div>• Limite Cadastrado: R$ {(selectedClient.limitAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div>• Limite Utilizado: R$ {(selectedClient.usedLimit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div>
                      • Limite Disponível: {' '}
                      <span className="text-emerald-400 font-bold">
                        R$ {Math.max(0, (selectedClient.limitAmount || 0) - (selectedClient.usedLimit || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      • Status Liberação: {' '}
                      <span className={`font-bold px-1.5 py-0.2 rounded text-[9px] font-mono ${
                        selectedClient.limitStatus === 'Aprovado' ? 'bg-[#06180f] text-emerald-400 font-bold' :
                        selectedClient.limitStatus === 'Recusado' ? 'bg-[#180606] text-red-400' :
                        'bg-[#181106] text-amber-500'
                      }`}>
                        {selectedClient.limitStatus?.toUpperCase() || 'PENDENTE'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/20 p-3 rounded-xl border border-gray-900 flex items-center justify-center font-mono text-[10px] text-gray-400">
                    Selecione um cliente para visualizar o limite de crédito.
                  </div>
                )}
              </div>
            </div>

            {/* 11. PRIORIDADE DA ORDEM DE SERVIÇO */}
            <div className="md:col-span-2 bg-[#09101f] border border-gray-800/80 rounded-2xl p-5 flex flex-col gap-4 font-sans text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-850 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                  <div>
                    <h4 className="text-sm font-semibold text-white uppercase font-display tracking-tight">11. Prioridade e Urgência Visual</h4>
                    <p className="text-[11px] text-gray-400">Ative o realce visual de pulsação (glow effects) no fluxo de pátio.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#180d11]/80 border border-red-900/30 p-3 rounded-xl select-none">
                <input 
                  type="checkbox" 
                  id="isOSPriorityCheck"
                  checked={isOSPriority}
                  onChange={(e) => setIsOSPriority(e.target.checked)}
                  className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                />
                <label htmlFor="isOSPriorityCheck" className="text-xs text-red-400 font-mono font-bold tracking-tight cursor-pointer uppercase flex items-center gap-1.5">
                  🚨 Marcar esta O.S. como prioridade alta (Ativar pulsação visual no painel)
                </label>
              </div>
            </div>

          </div>

          <button 
            type="submit"
            className="w-full mt-4 py-4.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs sm:text-sm font-bold rounded-xl tracking-wider shadow-lg shadow-red-950/40"
          >
            💾 SALVAR E EMITIR ORDEM DE SERVIÇO
          </button>
        </form>
      )}

      {activeTab === 'orcamento' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
          
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6">
            
            {/* Section 1: Client and Vehicle details */}
            <div className="flex flex-col gap-4 text-left">
              <div className="border-b border-gray-850 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-extrabold text-white text-base">⚡ GERADOR DE ORÇAMENTO RÁPIDO</h3>
                  <span className="text-xs text-gray-400 font-mono">Peças, mão de obra e compartilhamento em instantes.</span>
                </div>
                <div className="bg-red-500/10 text-red-500 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-red-500/20">
                  Easy Mode
                </div>
              </div>

              {/* Quick lookup of existing registered customer */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-gray-500 uppercase">Preencher com Cliente Cadastrado (Opcional)</label>
                <select 
                  onChange={(e) => {
                    const found = clientes.find(c => c.id === e.target.value);
                    if (found) {
                      setEasyClientName(found.name);
                      setEasyClientPhone(found.phone);
                      setEasyClientEmail(found.email || '');
                      
                      // auto fetch corresponding vehicle if exists
                      const firstVeh = veiculos.find(v => v.clienteId === found.id);
                      if (firstVeh) {
                        setEasyVehicleDesc(`${firstVeh.brand} ${firstVeh.model} ${firstVeh.engine}`);
                        setEasyVehiclePlate(firstVeh.plate);
                      } else {
                        setEasyVehicleDesc('');
                        setEasyVehiclePlate('');
                      }
                    }
                  }}
                  className="bg-[#080c16] border border-gray-850 rounded-xl py-2 px-3 text-xs text-white cursor-pointer"
                >
                  <option value="">-- Puxar cliente cadastrado... --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">Nome do Cliente *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Clecio Tecnologia"
                    value={easyClientName}
                    onChange={(e) => setEasyClientName(e.target.value)}
                    className="bg-[#080c16] border border-gray-850 rounded-xl py-2.5 px-3 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">WhatsApp (Celular) *</label>
                  <input 
                    type="text" 
                    placeholder="Ex: (11) 98765-4321"
                    value={easyClientPhone}
                    onChange={(e) => setEasyClientPhone(e.target.value)}
                    className="bg-[#080c16] border border-gray-850 rounded-xl py-2.5 px-3 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono text-gray-400 uppercase">E-mail do Cliente</label>
                  <input 
                    type="email" 
                    placeholder="Ex: cleciotecnologia@gmail.com"
                    value={easyClientEmail}
                    onChange={(e) => setEasyClientEmail(e.target.value)}
                    className="bg-[#080c16] border border-gray-850 rounded-xl py-2.5 px-3 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Veículo *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Civic 2.0"
                      value={easyVehicleDesc}
                      onChange={(e) => setEasyVehicleDesc(e.target.value)}
                      className="bg-[#080c16] border border-gray-850 rounded-xl py-2.5 px-3 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono text-gray-400 uppercase">Placa</label>
                      <button
                        type="button"
                        onClick={() => {
                          setPlateScannerTarget('easy');
                          setShowPlateScannerModal(true);
                          startPlateCamera();
                        }}
                        className="text-[9px] text-cyan-400 hover:text-cyan-300 font-mono font-bold flex items-center gap-1 cursor-pointer transition border border-transparent hover:border-cyan-500/20 px-1 py-0.5 rounded"
                      >
                        <Camera className="w-2.5 h-2.5" /> Escanear Placa
                      </button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Ex: ABC-1234"
                      value={easyVehiclePlate}
                      onChange={(e) => setEasyVehiclePlate(e.target.value)}
                      className="bg-[#080c16] border border-gray-850 rounded-xl py-2.5 px-3 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Add services and labor */}
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-850 text-left">
              <h4 className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-red-500" /> 1. ADICIONAR MÃO DE OBRA / SERVIÇOS
              </h4>

              {/* Quick Select Catalogue */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-[#080c16] p-3 rounded-xl border border-gray-900">
                <div className="md:col-span-8 flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-gray-500">Selecionar do Catálogo de Serviços</span>
                  <select
                    value={easySelectedSrvId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setEasySelectedSrvId(id);
                      const found = servicos.find(s => s.id === id);
                      if (found) {
                        const newItem: ServiceItem = {
                          id: `srv_easy_${Date.now()}_${Math.floor(Math.random()*1000)}`,
                          description: found.name,
                          price: found.price
                        };
                        setEasyServices([...easyServices, newItem]);
                        setEasySelectedSrvId('');
                      }
                    }}
                    className="bg-[#04080e] border border-gray-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="">-- Escolher Serviço do Catálogo... --</option>
                    {servicos.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (R$ {s.price.toFixed(2)})</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-4 text-center">
                  <span className="text-[9px] text-gray-500 font-mono block mb-1">ou adicionar manual abaixo</span>
                </div>
              </div>

              {/* Manual input */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mt-1">
                <div className="md:col-span-8">
                  <input 
                    type="text" 
                    placeholder="Descrição do serviço manual..."
                    value={easyManualSrvDesc}
                    onChange={(e) => setEasyManualSrvDesc(e.target.value)}
                    className="w-full bg-[#080c16] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div className="md:col-span-3">
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Preço R$"
                    value={easyManualSrvPrice}
                    onChange={(e) => setEasyManualSrvPrice(e.target.value)}
                    className="w-full bg-[#080c16] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addEasyService(easyManualSrvDesc, parseFloat(easyManualSrvPrice))}
                  className="md:col-span-1 py-2.5 bg-red-600/20 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 font-bold rounded-lg cursor-pointer flex items-center justify-center transition-all text-xs"
                  title="Anexar Serviço"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Section 3: Add Parts */}
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-850 text-left">
              <h4 className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-red-500" /> 2. ADICIONAR PEÇAS / MATERIAIS
              </h4>

              {/* Selector from Stock */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-[#080c16] p-3 rounded-xl border border-gray-900">
                <div className="md:col-span-7 flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-gray-500">Puxar do Almoxarifado / Estoque</span>
                  <select
                    value={easySelectedProdId}
                    onChange={(e) => setEasySelectedProdId(e.target.value)}
                    className="bg-[#04080e] border border-gray-800 rounded-lg p-2 text-xs text-gray-300"
                  >
                    <option value="">-- Escolher Peça em Estoque... --</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Qtd: {p.quantity} | R$ {p.sellPrice.toFixed(2)})</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3 flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-gray-500">Qtd</span>
                  <input
                    type="number"
                    min="1"
                    value={easySelectedProdQty}
                    onChange={(e) => setEasySelectedProdQty(e.target.value)}
                    className="bg-[#04080e] border border-gray-800 rounded-lg p-1.5 text-xs text-white w-full text-center"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const found = produtos.find(p => p.id === easySelectedProdId);
                    if (found) {
                      addEasyPart(found.name, found.sellPrice, parseInt(easySelectedProdQty) || 1);
                    }
                  }}
                  className="md:col-span-2 py-2 px-3 bg-red-600/30 border border-red-500/40 hover:bg-red-600 text-white rounded-lg text-xs font-bold font-mono text-center cursor-pointer transition-all"
                >
                  Anexar
                </button>
              </div>

              {/* Manual input */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mt-1">
                <div className="md:col-span-6">
                  <input 
                    type="text" 
                    placeholder="Descrição da peça manual..."
                    value={easyManualPartName}
                    onChange={(e) => setEasyManualPartName(e.target.value)}
                    className="w-full bg-[#080c16] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div className="md:col-span-3">
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Valor R$"
                    value={easyManualPartPrice}
                    onChange={(e) => setEasyManualPartPrice(e.target.value)}
                    className="w-full bg-[#080c16] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <input 
                    type="number" 
                    min="1"
                    placeholder="Qtd"
                    value={easyManualPartQty}
                    onChange={(e) => setEasyManualPartQty(e.target.value)}
                    className="w-full bg-[#080c16] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 text-center font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addEasyPart(easyManualPartName, parseFloat(easyManualPartPrice), parseInt(easyManualPartQty) || 1)}
                  className="md:col-span-1 py-2.5 bg-red-600/20 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 font-bold rounded-lg cursor-pointer flex items-center justify-center transition-all text-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Section 4: Discount */}
            <div className="pt-4 border-t border-gray-850 flex flex-col gap-2 text-left">
              <label className="text-[10px] font-mono text-gray-400 uppercase">3. DESCONTO ESPECIAL ADICIONAL (R$)</label>
              <div className="relative max-w-[200px]">
                <span className="absolute left-3.5 top-3 text-xs text-gray-500 font-mono">R$</span>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  value={easyDiscount || ''}
                  onChange={(e) => setEasyDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#080c16] border border-gray-850 rounded-xl py-2 px-3 pl-9 text-xs text-white focus:outline-none focus:border-red-500 font-mono font-bold text-red-400"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Real-Time Virtual Ticket Receipt */}
          <div className="lg:col-span-5 bg-[#080d1a] border border-gray-850 rounded-2xl p-6 shadow-xl flex flex-col gap-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-gray-850 pb-3">
              <span className="font-mono text-xs font-bold text-amber-500 tracking-widest uppercase flex items-center gap-1">
                <Printer className="w-4 h-4 text-amber-500 animate-pulse" /> COMPROVANTE GERAL DE ENTRADA
              </span>
              <span className="text-[9px] font-mono bg-slate-900 border border-gray-800 text-gray-405 px-2 py-0.5 rounded uppercase">
                Cotação Provisória
              </span>
            </div>

            {/* Virtual Invoice */}
            <div className="bg-white text-black p-5 rounded-xl border border-gray-200 flex flex-col gap-4 font-mono text-[10.5px] shadow-inner text-left">
              
              {/* Ticket header details */}
              <div className="text-center border-b border-dashed border-gray-300 pb-3">
                <span className="font-sans font-extrabold text-xs block uppercase tracking-wide">{company?.name || 'AUTOPRECISION OFFICE'}</span>
                <span className="text-[8.5px] text-gray-500 block leading-tight">{company?.address || "Avenida das Nações Unidas, 1040 - SP"}</span>
                <span className="text-[8.5px] text-gray-500 block font-bold">ORÇAMENTO DE PREVENÇÃO #EASY-{new Date().getSeconds()}{Math.floor(Math.random()*90)}</span>
              </div>

              {/* Client specifications */}
              <div className="flex flex-col gap-0.5 border-b border-dashed border-gray-200 pb-2">
                <div><span className="text-gray-500 uppercase font-bold">CLIENTE:</span> <strong className="text-black text-[11px] font-sans">{easyClientName || 'Cliente Particular'}</strong></div>
                {easyClientPhone && <div><span className="text-gray-500 uppercase font-bold">TELEFONE:</span> <span className="text-black">{easyClientPhone}</span></div>}
                {easyClientEmail && <div><span className="text-gray-500 uppercase font-bold">E-MAIL:</span> <span className="text-black lowercase">{easyClientEmail}</span></div>}
                <div><span className="text-gray-500 uppercase font-bold">VEÍCULO:</span> <strong className="text-black uppercase">{easyVehicleDesc || 'Não especificado'}</strong></div>
                {easyVehiclePlate && <div><span className="text-gray-500 uppercase font-bold">PLACA CARRO:</span> <span className="bg-blue-100 text-blue-900 px-1 border border-blue-200 rounded text-[9px] font-bold inline-block uppercase mt-0.5">{easyVehiclePlate.toUpperCase()}</span></div>}
              </div>

              {/* Services List */}
              <div>
                <span className="text-[10px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">🛠️ SERVIÇOS DE MÃO DE OBRA</span>
                {easyServices.length > 0 ? (
                  <div className="flex flex-col gap-1 pr-1 max-h-36 overflow-y-auto">
                    {easyServices.map((srv) => (
                      <div key={srv.id} className="flex justify-between items-center text-black font-sans py-0.5 border-b border-gray-100 last:border-0">
                        <span className="font-medium text-left truncate max-w-[150px]">{srv.description}</span>
                        <div className="flex items-center gap-1 font-mono">
                          <strong className="text-black">R$ {srv.price.toFixed(2)}</strong>
                          <button 
                            type="button"
                            onClick={() => setEasyServices(easyServices.filter(s => s.id !== srv.id))}
                            className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer p-0.5 font-bold"
                            title="Remover serviço"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 italic block pl-1 text-[9.5px]">Nenhum serviço inserido ou programado.</span>
                )}
              </div>

              {/* Parts List */}
              <div className="mt-2 border-t border-gray-100 pt-2">
                <span className="text-[10px] font-bold text-gray-600 block mb-1 uppercase tracking-wider">📦 PEÇAS E MATERIAIS DE REPOSIÇÃO</span>
                {easyParts.length > 0 ? (
                  <div className="flex flex-col gap-1 pr-1 max-h-36 overflow-y-auto">
                    {easyParts.map((part) => (
                      <div key={part.id} className="flex justify-between items-center text-black font-sans py-0.5 border-b border-gray-100 last:border-0">
                        <div className="flex flex-col text-left">
                          <span className="font-medium truncate max-w-[150px]">{part.name}</span>
                          <span className="text-[8.5px] text-gray-500 italic block">{part.quantity} un. x R$ {part.sellPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono">
                          <strong className="text-black">R$ {(part.sellPrice * part.quantity).toFixed(2)}</strong>
                          <button 
                            type="button"
                            onClick={() => setEasyParts(easyParts.filter(p => p.id !== part.id))}
                            className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer p-0.5 font-bold"
                            title="Remover peça"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 italic block pl-1 text-[9.5px]">Nenhum componente ou óleo adicionado.</span>
                )}
              </div>

              {/* Totals Section */}
              <div className="border-t-2 border-black pt-3 mt-3 flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-gray-550">SUBTOTAL MÃO DE OBRA:</span>
                  <span>R$ {easyServicesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-550">SUBTOTAL PEÇAS/MATERIAIS:</span>
                  <span>R$ {easyPartsTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                {easyDiscount > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>DESCONTO APLICADO:</span>
                    <span>- R$ {easyDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-black font-extrabold text-xs border-t border-gray-300 pt-1.5 mt-1">
                  <span>TOTAL CONSOLIDADO:</span>
                  <span className="text-red-650 bg-yellow-105 bg-amber-100 border border-amber-300 px-1.5 rounded">R$ {easyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[7.5px] text-gray-400 text-center uppercase leading-tight mt-3">
                AUTOTECH FACILITADOR • ESTE DOCUMENTO CONSTITUI APENAS UMA ESTIMATIVA NÃO VINCULANTE.
              </p>

            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 font-mono text-xs">
              
              <button
                type="button"
                onClick={handleEasyWhatsAppShare}
                disabled={easyServices.length === 0 && easyParts.length === 0}
                className="py-3 px-3 duration-200 transition-all text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Phone className="w-4 h-4 text-white" /> WhatsApp Rápido
              </button>

              <button
                type="button"
                onClick={handleEasyEmailShare}
                disabled={easyServices.length === 0 && easyParts.length === 0}
                className="py-3 px-3 duration-200 transition-all text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Bell className="w-4 h-4 text-white" /> Enviar por E-mail
              </button>

              <button
                type="button"
                onClick={handlePrintEasyBudget}
                disabled={easyServices.length === 0 && easyParts.length === 0}
                className="py-3 px-3 bg-[#0c1223] border border-gray-800 text-amber-400 hover:bg-slate-900 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4 text-amber-400" /> PDF / Imprimir
              </button>

              <button
                type="button"
                onClick={handleConvertEasyToOS}
                disabled={easyServices.length === 0 && easyParts.length === 0}
                className="py-3 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase"
              >
                <FileCheck className="w-4 h-4 text-white" /> Converter em OS
              </button>

            </div>

            {emailBudgetFeedback && (
              <div className={`mt-3 p-3 rounded-lg border text-[11px] font-mono leading-relaxed flex flex-col gap-1 text-left ${
                emailBudgetSuccess === true 
                  ? 'bg-blue-950/25 border-blue-900/60 text-blue-400' 
                  : emailBudgetSuccess === false
                  ? 'bg-red-950/25 border-red-900/60 text-red-400'
                  : 'bg-slate-900/40 border-gray-850 text-gray-400'
              }`}>
                <span className="font-bold uppercase tracking-wider text-[9px] flex items-center gap-1 font-mono">
                  {isSendingBudgetEmail ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                  ) : emailBudgetSuccess === true ? (
                    "✓ Transmissão Concluída"
                  ) : "⚠️ Transmissão SMTP"}
                </span>
                <span>{emailBudgetFeedback}</span>
              </div>
            )}

          </div>

        </div>
      )}

      {/* WHATSAPP SHARE & DIGITAL SIGNATURE PORT MODAL DIALOG */}
      {activeOSForModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0c1223] border border-gray-800 text-white max-w-lg w-full rounded-2xl p-6 shadow-2xl relative text-left flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-gray-850 pb-3">
              <span className="font-display font-bold text-base text-white flex items-center gap-1.5">
                <MessageSquare className="w-5 h-5 text-green-500" /> APROVAÇÃO E ASSINATURA DIGITAL
              </span>
              <button 
                onClick={() => setActiveOSForModal(null)}
                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab 1: Whatsapp template copy */}
            <div className="flex flex-col gap-2 font-mono text-[11px]">
              <span className="text-gray-400 font-sans font-bold">DISPARAR ORÇAMENTO INTEGRADO VIA WHATSAPP CANAL:</span>
              <textarea 
                rows={6}
                className="w-full bg-[#080c16] border border-gray-800 rounded-lg p-3 text-xs text-slate-300 focus:outline"
                value={whatsappTextCreated}
                readOnly
              />
              
              <a 
                href={`https://wa.me/${activeOSForModal.clientePhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappTextCreated)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-center font-sans hover:scale-[1.01] transition-all"
              >
                💬 CLIQUE PARA ENVIAR ORÇAMENTO VIA WHATSAPP AGORA
              </a>
            </div>

            {/* Tab 2: Capture Digital Sign token footprint */}
            <div className="border-t border-gray-850 pt-4 flex flex-col gap-3 font-sans">
              <span className="text-xs text-gray-400 font-bold block bg-gray-950 p-2 border border-gray-900 rounded font-mono">
                🖋️ ASSINATURA DIGITAL DO CLIENTE (COLETA DE CONSENTIMENTO)
              </span>
              <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
                Ao prescrever o nome do cliente abaixo, o sistema valida a autorização e tokeniza o carimbo de IP e horário, permitindo o avanço e dedução imediata das peças do estoque para o pátio de execução do reparo.
              </p>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Nome do cliente completo autorizando..."
                  className="bg-[#080c16] border border-gray-800 rounded-lg py-2 px-3 text-xs text-white font-mono flex-grow focus:outline-none focus:border-red-500"
                  value={customSignName}
                  onChange={(e) => setCustomSignName(e.target.value)}
                />
                
                <button 
                  onClick={handleDigitalSignOS}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-bold font-mono text-white shrink-0"
                >
                  FILMAR CARIMBO
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🧾 OUTLINE PDF DOCUMENT EXPORT VIEW COMPONENT MODAL */}
      {pdfOSSelected && (() => {
        // Find active client object to detect customer state
        const clientObj = clientes.find(
          (c) =>
            c.id === pdfOSSelected.clienteId ||
            c.cpfCnpj === pdfOSSelected.clienteCpfCnpj ||
            c.name === pdfOSSelected.clienteName
        );

        const getClientUf = (address?: string) => {
          if (!address) return 'SP';
          const cleanAddress = address.toUpperCase();
          const states = [
            'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'
          ];
          const lastTwoMatch = cleanAddress.trim().match(/(?:\s|-|\/)([A-Z]{2})$/);
          if (lastTwoMatch && states.includes(lastTwoMatch[1])) {
            return lastTwoMatch[1];
          }
          for (const st of states) {
            if (cleanAddress.includes(` ${st}`) || cleanAddress.includes(`-${st}`) || cleanAddress.includes(`/${st}`)) {
              return st;
            }
          }
          return 'SP';
        };

        const clientUfValue = simulateUf || getClientUf(clientObj?.address);

        const getTaxRuleForUf = (uf: string) => {
          if (!company?.fiscalTaxRules) return null;
          let match = company.fiscalTaxRules.find((r) => r.uf === uf && r.isActive);
          if (match) return match;

          const isCompanySp = !company.address || company.address.toUpperCase().includes('SP');
          const isInside =
            (uf === 'SP' && isCompanySp) ||
            (company.address && company.address.toUpperCase().includes(uf));

          if (isInside) {
            match = company.fiscalTaxRules.find(
              (r) => r.uf.includes('Dentro do Estado') && r.isActive
            );
          } else {
            match = company.fiscalTaxRules.find(
              (r) => r.uf.includes('Fora do Estado') && r.isActive
            );
          }
          return match || null;
        };

        const activeTaxRule = getTaxRuleForUf(clientUfValue);
        
        // Default tax fallback values
        const cfopValue = activeTaxRule?.cfop || (clientUfValue === 'SP' ? '5102' : '6102');
        const icmsPercent = activeTaxRule?.icmsAliquota !== undefined ? activeTaxRule.icmsAliquota : 18;
        const ipiPercent = activeTaxRule?.ipiAliquota !== undefined ? activeTaxRule.ipiAliquota : 0;

        const partsList = pdfOSSelected.parts || [];
        const partsSubtotal = partsList.reduce(
          (acc, p) => acc + (p.suppliedByClient ? 0 : p.sellPrice * p.quantity),
          0
        );

        const osDiscount = (pdfOSSelected as any).discount || 0;
        const partsSubtotalWithIpi = partsSubtotal - osDiscount + (partsSubtotal * ipiPercent) / 100;
        const osDiscountForNfe = osDiscount;

        const icmsComputedVal = (partsSubtotal * icmsPercent) / 100;
        const ipiComputedVal = (partsSubtotal * ipiPercent) / 100;

        const servicesList = pdfOSSelected.services || [];
        const servicesTotal = servicesList.reduce((acc, s) => acc + s.price, 0);
        const issqnComputedVal = (servicesTotal * 5.0) / 100;

        // Generate stable, deterministic dummy NFe/NFS-e numbers and barcode parameters based on OS ID
        const numericId = parseInt(pdfOSSelected.id.replace(/\D/g, '')) || 1;
        const danfeNfeNumStr = String(100 + numericId).padStart(6, '0');
        const danfeNfseNumStr = String(10 + numericId).padStart(6, '0');
        const danfeSeriesStr = String(company?.fiscalSeriesList?.find(s => s.type === 'NF-e' && s.isActive)?.series || '1').padStart(3, '0');
        
        // Generate a 44-digit simulated Access Key
        const accessKeySimulated = `3526 06${company?.cnpj?.replace(/\D/g, '') || '12345678000190'} 5500 1000 ${danfeNfeNumStr} ${danfeSeriesStr}6 ${danfeNfeNumStr}2`;

        return (
          <div id="pdf-os-export-overlay" className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-start overflow-y-auto p-4 md:p-6 backdrop-blur-sm">
            
            {/* Print/Exit Toolbar (HIDDEN during window.print()) */}
            <div className="bg-[#0b1222] border border-gray-800 text-white max-w-4xl w-full rounded-2xl p-4 shadow-2xl mb-4 flex flex-col gap-4 font-sans no-print">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                    <FileText className="w-5 h-5 animate-pulse" />
                  </span>
                  <div className="text-left">
                    <span className="font-extrabold text-sm block tracking-wide uppercase">Visualizador de Documentos</span>
                    <span className="text-[10px] text-gray-400 block font-mono font-medium">Imprima ou simule a pré-visualização de DANFE (NF-e/NFS-e)</span>
                  </div>
                </div>

                {/* Mode switch pills */}
                <div className="flex bg-[#070c14] border border-gray-800 p-0.5 rounded-xl gap-0.5">
                  <button
                    type="button"
                    onClick={() => setPdfMode('os')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[10.5px] uppercase cursor-pointer transition-all ${
                      pdfMode === 'os' ? 'bg-red-650 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    📝 O.S. Original
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfMode('danfe-nfe');
                      setSimulateUf(clientUfValue);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[10.5px] uppercase cursor-pointer transition-all ${
                      pdfMode === 'danfe-nfe' ? 'bg-red-650 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    📦 DANFE NF-e (Peças)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfMode('danfe-nfse');
                      setSimulateUf(clientUfValue);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[10.5px] uppercase cursor-pointer transition-all ${
                      pdfMode === 'danfe-nfse' ? 'bg-red-650 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    💼 NFS-e (Serviço)
                  </button>
                </div>

                <div className="flex items-center gap-2 no-print">
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="py-2 px-4 rounded-xl bg-red-650 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition-all hover:scale-[1.02] no-print"
                  >
                    <Printer className="w-4 h-4 text-white" /> Imprimir
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfOSSelected(null);
                      setPdfMode('os');
                      setSimulateUf('');
                    }}
                    className="py-2 px-3 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:bg-slate-900 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              </div>

              {/* Dynamic Tax Simulator helper banner / settings */}
              {pdfMode !== 'os' && (
                <div className="border-t border-gray-850/60 pt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-2 font-mono">
                    <label className="text-[10px] text-gray-450 uppercase font-bold shrink-0">Simulador UF Cliente:</label>
                    <select
                      className="bg-[#080c16] border border-gray-850 rounded-lg py-1 px-2 text-white text-[11px] font-bold focus:outline-none focus:border-red-500 font-mono w-[80px] cursor-pointer"
                      value={clientUfValue}
                      onChange={(e) => setSimulateUf(e.target.value)}
                    >
                      {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5 text-[10px] ml-2">
                      <span className="text-gray-500">Regra tributária:</span>
                      {activeTaxRule ? (
                        <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                          ✓ {activeTaxRule.uf} (CFOP {cfopValue} / ICMS {icmsPercent}% / IPI {ipiPercent}%)
                        </span>
                      ) : (
                        <span className="bg-amber-950/40 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                          ⚠ Interestadual Padrão (CFOP {cfopValue} / ICMS {icmsPercent}% / IPI {ipiPercent}%)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[9.5px] text-gray-450 font-mono italic">
                    {pdfMode === 'danfe-nfe' 
                      ? '* O preenchimento detalhado do DANFE NF-e considera as peças adicionadas à O.S.'
                      : '* O Layout da NFS-e simula o Recibo Provisório e Alíquota de 5.00% do município prestador.'
                    }
                  </div>
                </div>
              )}
            </div>

            {/* 1. ORIGINAL O.S. DOCUMENT SHEET */}
            {pdfMode === 'os' && (
              <div 
                id="print-os-document-sheet" 
                className="print-container-target bg-white text-black max-w-4xl w-full rounded-2xl p-8 md:p-10 shadow-2xl relative text-left flex flex-col font-sans"
                style={{ minHeight: '297mm' }}
              >
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-black pb-5 gap-4">
                  <div className="flex gap-4 items-center">
                    {company?.logoUrl && (
                      <img 
                        src={company.logoUrl} 
                        alt="Logo" 
                        className="w-16 h-16 object-contain rounded-xl border border-gray-200"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="flex flex-col gap-1 text-left">
                      <h1 className="font-display font-extrabold text-lg sm:text-xl text-black leading-tight uppercase font-mono tracking-wide">
                        {company?.name || 'AutoPrecision Premium'}
                      </h1>
                      <p className="text-[10.5px] text-gray-700 leading-normal font-mono max-w-md">
                        {company?.address || "Avenida das Nações Unidas, 1040 - São Paulo, SP"}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        CNPJ: {company?.cnpj || "12.345.678/0001-90"} • Fone: {company?.phone || "(11) 98765-4321"}
                      </p>
                      {company?.email && (
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                          E-mail: {company.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end text-left md:text-right font-mono text-[10px] bg-gray-100 border border-gray-200 rounded-xl p-3 max-w-[280px] w-full md:w-auto">
                    <span className="font-sans font-extrabold text-xs block text-red-600 tracking-widest uppercase mb-1">
                      ORDEM DE SERVIÇO
                    </span>
                    <div>
                      <span className="text-gray-500 font-bold block uppercase text-[8px]">Protocolo ID:</span>
                      <strong className="text-black text-sm block mb-1">#{pdfOSSelected.id}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold block uppercase text-[8px]">Status Atual:</span>
                      <span className="bg-red-100 text-red-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-red-200 inline-block uppercase mb-1">
                        {pdfOSSelected.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold block uppercase text-[8px]">Data de Entrada:</span>
                      <span className="text-black font-semibold">
                        {new Date(pdfOSSelected.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Identification Area */}
                <div className="mt-6">
                  <h2 className="text-[11px] font-bold font-mono tracking-wider text-black bg-gray-100 px-3 py-1 text-left border-l-4 border-black uppercase mb-3">
                    1. DADOS DOS PARTICIPANTES E VEÍCULO
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 font-mono text-xs border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[9px] block">CLIENTE/PROPRIETÁRIO:</span>
                      <strong className="text-black text-[13px]">{pdfOSSelected.clienteName}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[9px] block">CPF / CNPJ:</span>
                      <span className="text-black font-semibold">{pdfOSSelected.clienteCpfCnpj || 'Não informado'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[9px] block">TELEFONE CONTATO:</span>
                      <span className="text-black font-semibold">{pdfOSSelected.clientePhone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[9px] block">MECÂNICO OPERADOR RESPONSÁVEL:</span>
                      <strong className="text-black">{pdfOSSelected.mechanicName}</strong>
                    </div>
                    <div className="col-span-2 border-t border-gray-200 pt-2 mt-1">
                      <span className="text-gray-500 font-bold uppercase text-[9px] block">VEÍCULO / COR / DETALHAMENTO:</span>
                      <strong className="text-black text-[12px]">{pdfOSSelected.veiculoInfo}</strong>
                    </div>
                    <div className="col-span-1">
                      <span className="text-gray-500 font-bold uppercase text-[9px] block font-mono">PLACA DO CARRO:</span>
                      <span className="text-xs font-bold font-mono bg-blue-100 text-blue-900 border border-blue-200 rounded px-1.5 py-0.5 inline-block uppercase mt-1">
                        {pdfOSSelected.plate.toUpperCase()}
                      </span>
                    </div>
                    <div className="col-span-1 border-l border-gray-200 pl-3">
                      <span className="text-gray-500 font-bold uppercase text-[9px] block">MTR. QUILOMETRAGEM / PREVENTIVA:</span>
                      <div className="text-[10px] text-black font-sans mt-1 leading-tight">
                        <div>Odômetro Entrada: <strong className="font-mono">{pdfOSSelected.km ? pdfOSSelected.km.toLocaleString('pt-BR') : '0'} km</strong></div>
                        {pdfOSSelected.kmAnteriorEtiqueta ? (
                          <>
                            <div className="mt-0.5">Etiqueta Anterior: <strong className="font-mono">{pdfOSSelected.kmAnteriorEtiqueta.toLocaleString('pt-BR')} km</strong></div>
                            <div className="mt-0.5 text-red-650 font-bold uppercase text-[9px] font-mono">🔄 Distância Rodada: {(pdfOSSelected.km - pdfOSSelected.kmAnteriorEtiqueta).toLocaleString('pt-BR')} km</div>
                          </>
                        ) : (
                          <div className="text-gray-400 italic mt-0.5">Etiqueta anterior não informada</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Problem Area */}
                <div className="mt-6">
                  <h2 className="text-[11px] font-bold font-mono tracking-wider text-black bg-gray-100 px-3 py-1 border-l-4 border-black uppercase mb-3 text-left">
                    2. SINTOMÁTICA RECOLHIDA E DIAGNÓSTICO
                  </h2>
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/20 font-mono text-xs">
                    <div className="mb-3">
                      <strong className="text-gray-500 block text-[9.5px] uppercase font-bold mb-1">🚨 SINAIS E RECLAMAÇÕES INICIAIS:</strong>
                      <p className="text-black italic pl-3 border-l-2 border-red-500 leading-relaxed font-sans font-medium">
                        "{pdfOSSelected.problem}"
                      </p>
                    </div>
                    {pdfOSSelected.diagnosis && (
                      <div className="pt-3 border-t border-gray-100">
                        <strong className="text-red-650 block text-[9.5px] uppercase font-bold mb-1">🔧 RESPALDO DA AVALIAÇÃO MECÂNICA:</strong>
                        <p className="text-black pl-3 border-l-2 border-black leading-relaxed font-sans">
                          {pdfOSSelected.diagnosis}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Checklist de Vistoria e Entrada */}
                {pdfOSSelected.checklist && pdfOSSelected.checklist.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-[11px] font-bold font-mono tracking-wider text-black bg-gray-100 px-3 py-1 border-l-4 border-black uppercase mb-3 text-left">
                      VISTORIA DE ENTRADA & INSPEÇÃO DE QUALIDADE
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[9px] text-black">
                      {pdfOSSelected.checklist.map((item, idx) => {
                        let statusLabel = 'N/A';
                        let statusStyle = 'bg-gray-100 text-gray-500 border border-gray-250';
                        
                        if (item.status === 'ok') {
                          statusStyle = 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold';
                          if (item.label === 'Avarias Existentes') statusLabel = 'SEM DANOS';
                          else if (item.label === 'Objetos no Carro') statusLabel = 'SEM PERTENCES';
                          else if (item.label === 'Nível de Combustível') statusLabel = 'CHEIO/SADIO';
                          else statusLabel = 'CONFORME';
                        } else if (item.status === 'fail') {
                          statusStyle = 'bg-red-50 text-red-900 border border-red-350 font-extrabold';
                          if (item.label === 'Avarias Existentes') statusLabel = 'AVARIADO';
                          else if (item.label === 'Objetos no Carro') statusLabel = 'CONSTA ITENS';
                          else if (item.label === 'Nível de Combustível') statusLabel = 'RESERVA';
                          else statusLabel = 'REPROVADO';
                        }
                        
                        return (
                          <div key={idx} className="border border-gray-200 bg-gray-50/20 rounded-lg p-2.5 flex items-center justify-between gap-1 leading-none">
                            <span className="text-gray-700 font-bold block truncate max-w-[150px]">{item.label}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase leading-none shrink-0 ${statusStyle}`}>
                              {statusLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Services Table */}
                <div className="mt-6">
                  <h2 className="text-[11px] font-bold font-mono tracking-wider text-black bg-gray-100 px-3 py-1 border-l-4 border-black uppercase mb-3 text-left">
                    3. DEMONSTRATIVO DE SERVIÇOS EFETUADOS
                  </h2>

                  {pdfOSSelected.services && pdfOSSelected.services.length > 0 ? (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full font-mono text-[11px]">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 text-left">
                            <th className="p-3">Descrição do Serviço / Mão de Obra</th>
                            <th className="p-3 text-right w-[155px]">Preço Líquido (R$)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {pdfOSSelected.services.map((srv, sIdx) => (
                            <tr key={srv.id || sIdx} className="text-black hover:bg-gray-50">
                              <td className="p-3 font-semibold text-left">{srv.description}</td>
                              <td className="p-3 text-right font-extrabold text-black">
                                R$ {srv.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic pl-3 font-mono">Nenhum serviço manual ou de catálogo anexado.</p>
                  )}
                </div>

                {/* Parts Table */}
                <div className="mt-6">
                  <h2 className="text-[11px] font-bold font-mono tracking-wider text-black bg-gray-100 px-3 py-1 border-l-4 border-black uppercase mb-3 text-left">
                    4. SUPRIMENTO DE PEÇAS E MATERIAIS
                  </h2>

                  {pdfOSSelected.parts && pdfOSSelected.parts.length > 0 ? (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full font-mono text-[11px]">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 text-left">
                            <th className="p-3">Componente Aplicado</th>
                            <th className="p-3 text-center w-[80px]">Quant.</th>
                            <th className="p-3 text-right w-[140px]">Unitário (R$)</th>
                            <th className="p-3 text-right w-[140px]">Subtotal (R$)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {pdfOSSelected.parts.map((part, pIdx) => (
                            <tr key={part.id || pIdx} className="text-black hover:bg-gray-50">
                              <td className="p-3 font-semibold text-left">
                                {part.name}
                                {part.suppliedByClient && (
                                  <span className="text-[8.5px] bg-amber-100 text-amber-850 border border-amber-300 px-1.5 py-0.5 rounded ml-1.5 uppercase font-bold font-sans">
                                    Peça do Cliente
                                  </span>
                                )}
                                {part.origin === 'terceiros' && (
                                  <span className="text-[8.5px] bg-blue-100 text-blue-800 border border-blue-300 px-1.5 py-0.5 rounded ml-1.5 uppercase font-bold font-sans">
                                    Compra de Terceiros {part.supplierName ? `(${part.supplierName})` : ''}
                                  </span>
                                )}
                                {part.origin === 'estoque' && (
                                  <span className="text-[8.5px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded ml-1.5 uppercase font-bold font-sans">
                                    Estoque Próprio
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center font-bold">{part.quantity}</td>
                              <td className="p-3 text-right">
                                R$ {part.suppliedByClient ? "0,00" : part.sellPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="p-3 text-right font-extrabold text-black">
                                R$ {part.suppliedByClient ? "0,00" : (part.sellPrice * part.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic pl-3 font-mono">Nenhuma peça do almoxarifado foi aplicada.</p>
                  )}
                </div>

                {/* Total Balance */}
                <div className="mt-6 p-4 border-2 border-black bg-gray-50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
                  <div className="flex gap-4 flex-wrap text-gray-600 text-[11px] text-left">
                    <div>
                      <span>Total Mão de Obra:</span>
                      <strong className="text-black block text-sm">
                        R$ {pdfOSSelected.services.reduce((acc, s) => acc + s.price, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                    <div className="border-l border-gray-300 pl-4">
                      <span>Total Sobressalentes:</span>
                      <strong className="text-black block text-sm">
                        R$ {pdfOSSelected.parts.reduce((acc, p) => acc + (p.suppliedByClient ? 0 : p.sellPrice * p.quantity), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>

                  <div className="text-center sm:text-right bg-black text-white p-2 px-4 rounded-lg">
                    <span className="text-[9px] uppercase tracking-wider block text-gray-400">VALOR TOTAL CONSOLIDADO:</span>
                    <strong className="text-lg text-red-500 font-extrabold block">
                      R$ {pdfOSSelected.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>

                {/* Signature Stamps */}
                <div className="mt-12">
                  {pdfOSSelected.signature ? (
                    <div className="border-t border-dashed border-gray-300 pt-6 flex flex-col items-center text-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-500 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold font-mono text-emerald-600 tracking-wider block uppercase">AUTORIZAÇÃO DIGITAL CONFIRMADA</span>
                        <p className="text-[10px] text-gray-600 leading-normal max-w-lg font-mono">
                          {pdfOSSelected.signature}
                        </p>
                        {pdfOSSelected.signedAt && (
                          <span className="text-[8.5px] text-gray-500 block mt-0.5 font-mono">
                            Armazenado e validado via token em {new Date(pdfOSSelected.signedAt).toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-dashed border-gray-300 pt-12 grid grid-cols-1 md:grid-cols-2 gap-10 font-mono text-[10px] text-center text-gray-600">
                      <div className="flex flex-col items-center">
                        <div className="w-full max-w-[280px] border-b border-black mb-1.5 h-[1px]"></div>
                        <span>Responsável Técnico / Oficina Autotech</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-full max-w-[280px] border-b border-black mb-1.5 h-[1px]"></div>
                        <span>Assinatura de Aprovação do Cliente</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Tracking Portal QR Code */}
                {(() => {
                  const trackingUrl = `${window.location.origin}${window.location.pathname}?cpf=${encodeURIComponent(pdfOSSelected.clienteCpfCnpj || pdfOSSelected.id)}&osId=${encodeURIComponent(pdfOSSelected.id)}`;
                  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(trackingUrl)}&color=0-0-0&bgcolor=255-255-255`;
                  return (
                    <div className="flex items-center gap-4 max-w-md mx-auto mt-8 border border-slate-200 border-dashed rounded-xl p-3 bg-slate-50">
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code Acompanhamento" 
                        className="w-16 h-16 bg-white p-1 border border-slate-300 rounded shadow-sm shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left font-sans">
                        <span className="text-[10px] font-bold text-slate-800 tracking-wider block uppercase mb-0.5">
                          Acompanhe seu Veículo Online
                        </span>
                        <p className="text-[9px] text-slate-600 leading-normal font-mono">
                          Aponte a câmera do seu celular para acompanhar o andamento da sua O.S., visualizar laudos de engenharia, fotos e aprovar orçamentos em tempo real.
                        </p>
                        <span className="text-[7.5px] text-slate-400 font-mono block mt-1 break-all select-all">
                          {trackingUrl}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Footer Rules */}
                <p className="text-[8px] text-gray-400 text-center font-mono mt-8 border-t border-gray-100 pt-3 self-center">
                  Este relatório é gerado em conformidade com as regras de orçamento técnico preventivo. A garantia legal para novos componentes aplicados é de 90 dias.
                </p>

              </div>
            )}

            {/* 2. DANFE NF-e (PRODUTOS / PEÇAS) */}
            {pdfMode === 'danfe-nfe' && (
              <div 
                id="print-danfe-nfe-sheet"
                className="print-container-target bg-white text-black max-w-4xl w-full rounded-2xl p-6 md:p-8 shadow-2xl relative text-left flex flex-col font-sans border-2 border-black"
                style={{ minHeight: '297mm' }}
              >
                {/* Visual stub / Recebimento canhão */}
                <div className="border border-black p-2.5 mb-4 text-[9px] relative font-sans leading-tight">
                  <div className="flex justify-between">
                    <div className="w-[82%] border-r border-black border-dashed pr-3 flex flex-col justify-between">
                      <span>
                        RECEBEMOS DE <strong className="uppercase">{company?.name || 'AutoPrecision Premium'}</strong> OS PRODUTOS E/OU SERVIÇOS CONSTANTES DA NOTA FISCAL ELETRÔNICA INDICADA AO LADO. DESTINATÁRIO: <strong className="uppercase">{pdfOSSelected.clienteName}</strong>
                      </span>
                      <div className="mt-2.5 grid grid-cols-2 gap-3 text-[8px] text-gray-700">
                        <div>DATA DE RECEBIMENTO: _________________________________</div>
                        <div>IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR: ______________________________________________</div>
                      </div>
                    </div>
                    <div className="w-[18%] pl-2 text-center flex flex-col justify-center font-bold">
                      <span className="text-[11px] block text-black">NF-e</span>
                      <span className="text-sm block font-mono">Nº {danfeNfeNumStr}</span>
                      <span className="text-[8.5px] block font-mono font-medium text-gray-800">SÉRIE: {danfeSeriesStr}</span>
                    </div>
                  </div>
                  <div className="text-[7.5px] text-gray-400 absolute -bottom-3.5 left-1/2 -translate-x-1/2 no-print select-none">
                    - - - - - - - - - - - - - - - - - - - - - - - CORTE NA LINHA PONTILHADA - - - - - - - - - - - - - - - - - - - - - - -
                  </div>
                </div>

                {/* EMITENTE, DANFE LABEL AND CHAVE DE ACESSO */}
                <div className="grid grid-cols-12 border border-black mt-1 font-sans text-xs">
                  <div className="col-span-5 p-2.5 border-r border-b border-black flex items-center gap-3">
                    {company?.logoUrl && (
                      <img 
                        src={company.logoUrl} 
                        alt="Logo" 
                        className="w-12 h-12 object-contain rounded border border-gray-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="flex flex-col text-left leading-tight">
                      <strong className="text-[11.5px] uppercase tracking-wide block">{company?.name || 'AutoPrecision Premium'}</strong>
                      <span className="text-[8.5px] text-gray-800 block mt-0.5">{company?.address || 'Endereço da oficina'}</span>
                      <span className="text-[8px] text-gray-600 block mt-0.5">Fone: {company?.phone || '(11) 98765-4321'}</span>
                    </div>
                  </div>

                  <div className="col-span-3 p-2.5 border-r border-b border-black text-center flex flex-col justify-center items-center leading-none">
                    <strong className="text-xs tracking-wide font-extrabold block">DANFE</strong>
                    <span className="text-[6.5px] block font-bold text-gray-700 uppercase mt-0.5 leading-tight text-center">Documento Auxiliar da<br />Nota Fiscal Eletrônica</span>
                    <div className="flex gap-2.5 border border-black rounded p-0.5 text-[8px] font-bold font-mono mt-1 px-1.5 leading-tight">
                      <span>0 - Entrada</span>
                      <span className="border-l border-black pl-1.5">1 - Saída <strong className="text-red-650 font-extrabold">[ 1 ]</strong></span>
                    </div>
                    <span className="text-[9.5px] uppercase font-bold mt-1.5 font-mono">
                      Nº {danfeNfeNumStr}
                    </span>
                    <span className="text-[8px] uppercase font-bold font-mono">
                      SÉRIE: {danfeSeriesStr}
                    </span>
                    <span className="text-[7px] text-gray-500 block font-mono mt-0.5">
                      FOLHA 1 / 1
                    </span>
                  </div>

                  <div className="col-span-4 p-2 border-b border-black flex flex-col justify-between items-stretch">
                    <div className="flex h-5 items-stretch justify-center bg-black/10 p-0.5 gap-[1px]">
                      {[1,3,1,1,2,3,1,2,1,1,3,1,2,1,1,3,1,2,1,1,2,2,3,1,1,3,1,2,1,1,3,2,1].map((w, bi) => (
                        <div 
                          key={bi} 
                          className="bg-black shrink-0" 
                          style={{ width: `${w * 1.5}px` }} 
                        />
                      ))}
                    </div>
                    <div className="text-[7.5px] uppercase mt-1 leading-none font-mono">
                      <span className="text-gray-500 font-bold block">Chave de Acesso:</span>
                      <span className="text-black font-extrabold block tracking-tight text-center">{accessKeySimulated}</span>
                    </div>
                    <div className="text-[7.5px] uppercase border-t border-black/40 pt-1 leading-none text-center block text-gray-800">
                      Consulta de autenticidade no portal nacional da NF-e ou site da Sefaz Autorizadora
                    </div>
                  </div>
                </div>

                {/* OPERACAO E PROTOCOLO */}
                <div className="grid grid-cols-12 border-x border-b border-black font-sans text-[8.5px] uppercase leading-tight">
                  <div className="col-span-6 p-1 border-r border-black">
                    <span className="text-[7px] text-gray-500 block font-bold">NATUREZA DA OPERAÇÃO</span>
                    <strong className="text-black text-[9px]">VENDA DE MERCADORIA AUTOMOTIVA / AUTOPEÇAS (UF {clientUfValue})</strong>
                  </div>
                  <div className="col-span-6 p-1 flex flex-col justify-center">
                    <span className="text-[7px] text-gray-500 block font-bold">PROTOCOLO DE AUTORIZAÇÃO DE USO</span>
                    <strong className="text-black text-[9px]">135260049281231 - {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')} (Simulado)</strong>
                  </div>
                </div>

                {/* IMPOSTOS E CNPJ EMITENTE */}
                <div className="grid grid-cols-12 border-x border-b border-black font-sans text-[8.5px] uppercase leading-tight">
                  <div className="col-span-4 p-1 border-r border-black">
                    <span className="text-[7px] text-gray-500 block font-bold">INSCRIÇÃO ESTADUAL</span>
                    <strong className="text-black text-[9px]">{company?.fiscalIE || '359.123.456.789'}</strong>
                  </div>
                  <div className="col-span-4 p-1 border-r border-black">
                    <span className="text-[7px] text-gray-500 block font-bold">INSCRIÇÃO ESTADUAL SUBST. TRIBUTÁRIA</span>
                    <strong className="text-black text-[9px]">ISENTO / NÃO CONTRIBUINTE</strong>
                  </div>
                  <div className="col-span-4 p-1">
                    <span className="text-[7px] text-gray-500 block font-bold">CNPJ EMITENTE</span>
                    <strong className="text-black text-[9px]">{company?.cnpj || '12.345.678/0001-90'}</strong>
                  </div>
                </div>

                {/* DESTINATÁRIO */}
                <div className="mt-3">
                  <strong className="text-[9px] uppercase font-bold tracking-wider block font-mono mb-1 text-black">DESTINATÁRIO / REMETENTE</strong>
                  <div className="border border-black font-sans text-[8.5px] uppercase leading-tight grid grid-cols-12">
                    <div className="col-span-7 p-1 border-r border-b border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">NOME / RAZÃO SOCIAL</span>
                      <strong className="text-black text-[9.5px]">{pdfOSSelected.clienteName}</strong>
                    </div>
                    <div className="col-span-3 p-1 border-r border-b border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">CPF / CNPJ DO CLIENTE</span>
                      <strong className="text-black text-[9.5px]">{pdfOSSelected.clienteCpfCnpj || 'ISENTO / NÃO INFORMADO'}</strong>
                    </div>
                    <div className="col-span-2 p-1 border-b border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">DATA DA EMISSÃO</span>
                      <strong className="text-black text-[9.5px]">{new Date().toLocaleDateString('pt-BR')}</strong>
                    </div>

                    <div className="col-span-6 p-1 border-r border-b border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">ENDEREÇO</span>
                      <strong className="text-black">{clientObj?.address || 'Não cadastrado'}</strong>
                    </div>
                    <div className="col-span-3 p-1 border-r border-b border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">BAIRRO / DISTRITO</span>
                      <strong className="text-black">CENTRO</strong>
                    </div>
                    <div className="col-span-2 p-1 border-r border-b border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">CEP</span>
                      <strong className="text-black">{clientObj?.cep || '01001-000'}</strong>
                    </div>
                    <div className="col-span-1 p-1 border-b border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">DATA DE SAÍDA</span>
                      <strong className="text-black">{new Date().toLocaleDateString('pt-BR')}</strong>
                    </div>

                    <div className="col-span-5 p-1 border-r border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">MUNICÍPIO prestação / entrega</span>
                      <strong className="text-black">SÃO PAULO</strong>
                    </div>
                    <div className="col-span-2 p-1 border-r border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">TELEFONE CONTATO</span>
                      <strong className="text-black">{pdfOSSelected.clientePhone}</strong>
                    </div>
                    <div className="col-span-1 p-1 border-r border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">UF</span>
                      <strong className="text-black font-extrabold">{clientUfValue}</strong>
                    </div>
                    <div className="col-span-3 p-1 border-r border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">INSCRIÇÃO ESTADUAL</span>
                      <strong className="text-black">ISENTO</strong>
                    </div>
                    <div className="col-span-1 p-1">
                      <span className="text-[6.5px] text-gray-500 block font-bold">HORA DE SAÍDA</span>
                      <strong className="text-black">{new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</strong>
                    </div>
                  </div>
                </div>

                {/* DUPLICATAS */}
                <div className="mt-3">
                  <strong className="text-[9px] uppercase font-bold tracking-wider block font-mono mb-1 text-black">DUPLICATAS E COBRANÇA</strong>
                  <div className="border border-black font-sans text-[8.5px] uppercase p-1.5 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-gray-550 font-bold block text-[6.5px]">Faturamento / Duplicata</span>
                      <span className="text-black font-extrabold text-[9px]">PARCELA ÚNICA - VENCIMENTO: Á VISTA</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-550 font-bold block text-[6.5px]">VALOR DO TÍTULO</span>
                      <strong className="text-red-650 font-extrabold text-xs">R$ {partsSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>
                </div>

                {/* IMPOSTOS */}
                <div className="mt-3">
                  <strong className="text-[9px] uppercase font-bold tracking-wider block font-mono mb-1 text-black">CÁLCULO DO IMPOSTO</strong>
                  <div className="border border-black font-sans text-[8px] uppercase leading-tight grid grid-cols-10">
                    <div className="col-span-2 p-1 border-r border-b border-black text-left">
                      <span className="text-[6px] text-gray-500 block font-bold">BASE DE CÁLCULO DO ICMS</span>
                      <strong className="text-black text-[9px]">R$ {partsSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="col-span-2 p-1 border-r border-b border-black text-left">
                      <span className="text-[6px] text-gray-500 block font-bold">VALOR DO ICMS ({icmsPercent}%)</span>
                      <strong className="text-cyan-700 text-[9px]">R$ {icmsComputedVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="col-span-2 p-1 border-r border-b border-black text-left">
                      <span className="text-[6px] text-gray-500 block font-bold">BASE DE CÁLCULO DO ICMS ST</span>
                      <strong className="text-black text-[9px]">R$ 0,00</strong>
                    </div>
                    <div className="col-span-2 p-1 border-r border-b border-black text-left">
                      <span className="text-[6px] text-gray-500 block font-bold">VALOR DO ICMS ST</span>
                      <strong className="text-black text-[9px]">R$ 0,00</strong>
                    </div>
                    <div className="col-span-2 p-1 border-b border-black text-left font-sans">
                      <span className="text-[6px] text-gray-500 block font-bold">VALOR COFINS</span>
                      <strong className="text-black text-[9px]">R$ 0,00</strong>
                    </div>

                    <div className="col-span-2 p-1 border-r border-black text-left">
                      <span className="text-[6px] text-gray-500 block font-bold">VALOR DO FRETE</span>
                      <strong className="text-black text-[9px]">R$ 0,00</strong>
                    </div>
                    <div className="col-span-2 p-1 border-r border-black text-left">
                      <span className="text-[6px] text-gray-500 block font-bold">VALOR DO SEGURO</span>
                      <strong className="text-black text-[9px]">R$ 0,00</strong>
                    </div>
                    <div className="col-span-2 p-1 border-r border-black text-left">
                      <span className="text-[6px] text-gray-500 block font-bold">DESCONTO OS PEÇAS</span>
                      <strong className="text-black text-[9px]">R$ {osDiscountForNfe.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="col-span-1 p-1 border-r border-black text-left font-sans">
                      <span className="text-[6px] text-gray-500 block font-bold">OUTROS</span>
                      <strong className="text-black text-[9px]">R$ 0,00</strong>
                    </div>
                    <div className="col-span-1 p-1 border-r border-black text-left">
                      <span className="text-[6px] text-gray-500 block font-bold">VLR IPI ({ipiPercent}%)</span>
                      <strong className="text-purple-700 text-[9px]">R$ {ipiComputedVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="col-span-2 p-1 text-left bg-gray-50">
                      <span className="text-[6px] text-gray-700 block font-extrabold uppercase">TOTAL DA NOTA</span>
                      <strong className="text-red-650 text-[11px] block font-extrabold">R$ {partsSubtotalWithIpi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>
                </div>

                {/* TRANSPORTADOR */}
                <div className="mt-3">
                  <strong className="text-[9px] uppercase font-bold tracking-wider block font-mono mb-1 text-black">TRANSPORTADOR / VOLUMES TRANSPORTADOS</strong>
                  <div className="border border-black font-sans text-[8.5px] uppercase leading-tight grid grid-cols-12">
                    <div className="col-span-5 p-1 border-r border-b border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">RAZÃO SOCIAL</span>
                      <strong className="text-black">SEM FRETE - RETIRADA NO EMITENTE</strong>
                    </div>
                    <div className="col-span-2 p-1 border-r border-b border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">FRETE POR CONTA</span>
                      <strong className="text-black">9 - SEM TRANSPORTE</strong>
                    </div>
                    <div className="col-span-2 p-1 border-r border-b border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">CÓDIGO ANTT</span>
                      <strong className="text-black">ISENTO</strong>
                    </div>
                    <div className="col-span-2 p-1 border-r border-b border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">PLACA DO VEÍCULO</span>
                      <strong className="text-black font-mono font-bold">{pdfOSSelected.plate.toUpperCase()}</strong>
                    </div>
                    <div className="col-span-1 p-1 border-b border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">UF</span>
                      <strong className="text-black font-bold">{clientUfValue}</strong>
                    </div>

                    <div className="col-span-5 p-1 border-r border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">ENDEREÇO</span>
                      <strong className="text-black">AVENIDA DAS NAÇÕES UNIDAS, 1040</strong>
                    </div>
                    <div className="col-span-3 p-1 border-r border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">MUNICÍPIO EMISSOR</span>
                      <strong className="text-black">SÃO PAULO</strong>
                    </div>
                    <div className="col-span-1 p-1 border-r border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">UF</span>
                      <strong className="text-black font-bold">SP</strong>
                    </div>
                    <div className="col-span-3 p-1">
                      <span className="text-[6.5px] text-gray-500 block font-bold">CNPJ TRANSPORTADOR</span>
                      <strong className="text-black">ISENTO</strong>
                    </div>
                  </div>
                </div>

                {/* ITENS DE PEÇAS TABLE */}
                <div className="mt-3 flex-grow">
                  <strong className="text-[9px] uppercase font-bold tracking-wider block font-mono mb-1 text-black">DADOS DOS PRODUTOS / SERVIÇOS (PEÇAS DA O.S.)</strong>
                  <div className="border border-black rounded-lg overflow-hidden font-sans text-[8px]">
                    <table className="w-full text-left uppercase leading-tight">
                      <thead>
                        <tr className="bg-gray-100 border-b border-black text-gray-700 font-bold">
                          <th className="p-1 border-r border-black w-[58px]">CÓD. PROD</th>
                          <th className="p-1 border-r border-black">DESCRIÇÃO DO PRODUTO</th>
                          <th className="p-1 border-r border-black w-[55px] text-center">NCM/SH</th>
                          <th className="p-1 border-r border-black w-[30px] text-center">CST</th>
                          <th className="p-1 border-r border-black w-[30px] text-center">CFOP</th>
                          <th className="p-1 border-r border-black w-[20px] text-center">UN</th>
                          <th className="p-1 border-r border-black w-[25px] text-center">QTD</th>
                          <th className="p-1 border-r border-black w-[55px] text-right">UNITÁRIO</th>
                          <th className="p-1 border-r border-black w-[55px] text-right">TOTAL</th>
                          <th className="p-1 border-r border-black w-[55px] text-right font-sans">B. CÁLC.</th>
                          <th className="p-1 border-r border-black w-[45px] text-right">V. ICMS</th>
                          <th className="p-1 border-r border-black w-[35px] text-right">V. IPI</th>
                          <th className="p-1 border-r border-black w-[30px] text-center">AL. ICMS</th>
                          <th className="p-1 text-center w-[30px]">AL. IPI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black font-mono">
                        {pdfOSSelected.parts && pdfOSSelected.parts.length > 0 ? (
                          pdfOSSelected.parts.map((p, idx) => {
                            const lineTotal = p.suppliedByClient ? 0 : p.sellPrice * p.quantity;
                            const lineBiIcms = icmsPercent > 0 ? lineTotal : 0;
                            const lineIcmsVal = (lineBiIcms * icmsPercent) / 100;
                            const lineIpiVal = (lineTotal * ipiPercent) / 100;
                            
                            let itemCst = '0102';
                            if (cfopValue === '5405' || cfopValue === '6404') {
                              itemCst = '0500';
                            }
                            
                            return (
                              <tr key={idx} className="hover:bg-gray-50 text-black leading-tight">
                                <td className="p-0.5 border-r border-black truncate font-bold text-gray-750">{p.id ? p.id.slice(0,6).toUpperCase() : 'PECA' + idx}</td>
                                <td className="p-0.5 border-r border-black font-sans font-bold text-left tracking-tight text-gray-800">{p.name} {p.suppliedByClient ? '(PEÇA DO CLIENTE)' : ''}</td>
                                <td className="p-0.5 border-r border-black text-center text-gray-700">8708.29.90</td>
                                <td className="p-0.5 border-r border-black text-center font-bold text-gray-800">{itemCst}</td>
                                <td className="p-0.5 border-r border-black text-center font-bold text-gray-800">{cfopValue}</td>
                                <td className="p-0.5 border-r border-black text-center">PC</td>
                                <td className="p-0.5 border-r border-black text-center font-extrabold">{p.quantity}</td>
                                <td className="p-0.5 border-r border-black text-right font-medium">R$ {p.suppliedByClient ? '0,00' : p.sellPrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                <td className="p-0.5 border-r border-black text-right font-bold">R$ {lineTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                <td className="p-0.5 border-r border-black text-right">R$ {lineBiIcms.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                <td className="p-0.5 border-r border-black text-right text-cyan-800 font-bold">R$ {lineIcmsVal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                <td className="p-0.5 border-r border-black text-right text-purple-800 font-bold">R$ {lineIpiVal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                                <td className="p-0.5 border-r border-black text-center text-cyan-800 font-bold">{icmsPercent}%</td>
                                <td className="p-0.5 text-center text-purple-800 font-bold">{ipiPercent}%</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={14} className="p-4 text-center text-gray-400 italic font-sans font-bold">
                              ⚠️ NENHUMA PEÇA/PRODUTO CADASTRADO NO ORÇAMENTO DESTA ORDEM DE SERVIÇO.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ADICIONAIS */}
                <div className="mt-4 border border-black font-sans text-[8px] uppercase leading-tight grid grid-cols-12 min-h-[90px]">
                  <div className="col-span-8 p-1.5 border-r border-black text-left">
                    <span className="text-[6.5px] text-gray-500 block font-bold">INFORMAÇÕES COMPLEMENTARES</span>
                    <p className="text-black font-semibold mt-1 font-mono text-[7.5px] leading-relaxed">
                      * DOCUMENTO GERADO EM AMBIENTE DE HOMOLOGAÇÃO DE ERP DA OFICINA - SEM VALOR DE CIRCULAÇÃO COMERCIAL.<br />
                      * REFERÊNCIA DE ACESSO EXCLUSIVO: ORDEM DE SERVIÇO DE ENTRADA Nº #{pdfOSSelected.id}<br />
                      * VEÍCULO VISTORIADO: {pdfOSSelected.veiculoInfo} | PLACA: {pdfOSSelected.plate.toUpperCase()} | KM DE PATIO: {pdfOSSelected.km} km.<br />
                      * MECÂNICO OPERADOR: {pdfOSSelected.mechanicName}<br />
                      * REGRA DE TRIBUTAÇÃO AUTOMÁTICA {clientUfValue} APLICADA: {activeTaxRule ? activeTaxRule.description : 'Simulação conforme regras fiscais síncronas'}.<br />
                      * Impostos Aproximados (Constitucional Lei 12.741/12): R$ {(icmsComputedVal + ipiComputedVal).toLocaleString('pt-BR', {minimumFractionDigits: 2})} aproximados na prestação do lote.
                    </p>
                  </div>
                  <div className="col-span-4 p-1.5 flex flex-col justify-between text-left">
                    <div>
                      <span className="text-[6.5px] text-gray-500 block font-bold">RESERVADO ADICIONAL FISCO</span>
                      <div className="text-[7px] text-gray-405 text-gray-500 font-mono mt-1 leading-tight text-center">
                        MODALIDADE HOMOLOGADA SEFAZ BRASIL<br />
                        VERSÃO DANFE 4.00 LOTE: 13
                      </div>
                    </div>
                    <div className="border-t border-black/30 pt-1 text-[6.5px] text-right text-gray-600 uppercase font-mono font-bold leading-none">
                      ASSM. DIGITAL CERTICATED XML CODE VERIFY
                    </div>
                  </div>
                </div>

                <p className="text-[7.5px] text-gray-400 text-center font-mono mt-6 border-t border-gray-150 pt-2 self-center block select-none">
                  Simulador de visualização DANFE Versão SEFAZ 4.0 - AutoSec © 2026. Todos os dados acima são simulações técnicas para homologação interna.
                </p>
              </div>
            )}

            {/* 3. NFS-e (MUNICIPAL / SERVIÇOS) */}
            {pdfMode === 'danfe-nfse' && (
              <div 
                id="print-danfe-nfse-sheet"
                className="print-container-target bg-white text-black max-w-4xl w-full rounded-2xl p-6 md:p-8 shadow-2xl relative text-left flex flex-col font-sans border-2 border-black"
                style={{ minHeight: '297mm' }}
              >
                <div className="flex border-b border-black pb-3 items-center">
                  <div className="w-[15%] border-r border-[#000] border-black pr-2.5 text-center flex flex-col justify-center shrink-0">
                    {company?.logoUrl ? (
                      <img 
                        src={company.logoUrl} 
                        alt="Logo" 
                        className="w-14 h-14 object-contain rounded mx-auto font-sans"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-xl">🏛️</span>
                    )}
                  </div>
                  <div className="w-[50%] border-r border-black pr-3 pl-3 text-left leading-normal font-sans">
                    <strong className="text-[11px] block">PREFEITURA DO MUNICÍPIO DE SÃO PAULO</strong>
                    <span className="text-[9px] text-gray-700 block">Secretaria Municipal da Fazenda</span>
                    <strong className="text-[11.5px] uppercase font-extrabold tracking-wide block text-red-650 mt-1 leading-tight">NOTA FISCAL ELETRÔNICA DE SERVIÇOS - NFS-e</strong>
                  </div>
                  <div className="w-[35%] pl-3 text-left font-mono text-[9px] uppercase leading-tight gap-1.5 flex flex-col justify-center">
                    <div>
                      <span className="text-gray-500 font-bold block text-[7.5px]">NÚMERO DA NOTA (NFS-e)</span>
                      <strong className="text-[11.5px] text-black">Nº {danfeNfseNumStr}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 font-bold block text-[7.5px]">CÓDIGO DE VERIFICAÇÃO</span>
                      <strong className="text-black text-[9px]">A9Z2-F7B6-{pdfOSSelected.id.slice(0,4).toUpperCase()}</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 border-x border-b border-black font-sans text-[8.5px] uppercase leading-tight">
                  <div className="col-span-6 p-2 border-r border-black">
                    <span className="text-[7px] text-gray-500 block font-bold">DATA E HORA DA EMISSÃO</span>
                    <strong className="text-black text-[9.5px]">{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</strong>
                  </div>
                  <div className="col-span-6 p-2">
                    <span className="text-[7px] text-gray-500 block font-bold">REGIME ESPECIAL DE TRIBUTAÇÃO</span>
                    <strong className="text-black text-[9.5px]">SIMPLES NACIONAL - MEI / MICROEMPRESA</strong>
                  </div>
                </div>

                <div className="mt-3">
                  <strong className="text-[9px] uppercase font-bold tracking-wider block font-mono mb-1 text-black">PRESTADOR DE SERVIÇOS (EMISSOR)</strong>
                  <div className="border border-black font-sans text-[8.5px] uppercase leading-normal grid grid-cols-12">
                    <div className="col-span-8 p-2 border-r border-b border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">RAZÃO SOCIAL</span>
                      <strong className="text-[10px] text-black">{company?.name || 'AutoPrecision Premium'}</strong>
                    </div>
                    <div className="col-span-4 p-2 border-b border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">CNPJ PRESTADOR</span>
                      <strong className="text-[10px] text-black">{company?.cnpj || '12.345.678/0001-90'}</strong>
                    </div>
                    <div className="col-span-6 p-2 border-r border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">ENDEREÇO PRESTADOR</span>
                      <strong className="text-black">{company?.address || 'Avenida das Nações Unidas, 1040'}</strong>
                    </div>
                    <div className="col-span-3 p-2 border-r border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">MUNICÍPIO / UF</span>
                      <strong className="text-black">SÃO PAULO / SP</strong>
                    </div>
                    <div className="col-span-3 p-2">
                      <span className="text-[6.5px] text-gray-500 block font-bold">INSCRIÇÃO MUNICIPAL</span>
                      <strong className="text-black">{company?.fiscalIM || '9.876.543-2'}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <strong className="text-[9px] uppercase font-bold tracking-wider block font-mono mb-1 text-black">TOMADOR DE SERVIÇOS (CLIENTE PARCEIRO)</strong>
                  <div className="border border-black font-sans text-[8.5px] uppercase leading-normal grid grid-cols-12">
                    <div className="col-span-8 p-2 border-r border-b border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">NOME DO CLIENTE / RAZÃO SOCIAL</span>
                      <strong className="text-[10px] text-black">{pdfOSSelected.clienteName}</strong>
                    </div>
                    <div className="col-span-4 p-2 border-b border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">CNPJ / CPF DO TOMADOR</span>
                      <strong className="text-[10px] text-black">{pdfOSSelected.clienteCpfCnpj || 'NÃO INFORMADO'}</strong>
                    </div>
                    <div className="col-span-6 p-2 border-r border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">ENDEREÇO TOMADOR</span>
                      <strong className="text-black">{clientObj?.address || 'Não informado'}</strong>
                    </div>
                    <div className="col-span-3 p-2 border-r border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">MUNICÍPIO TOMADOR</span>
                      <strong className="text-black">SÃO PAULO</strong>
                    </div>
                    <div className="col-span-1 p-2 border-r border-black">
                      <span className="text-[6.5px] text-gray-500 block font-bold">UF</span>
                      <strong className="text-black font-extrabold">{clientUfValue}</strong>
                    </div>
                    <div className="col-span-2 p-2">
                      <span className="text-[6.5px] text-gray-500 block font-bold">CEP</span>
                      <strong className="text-black">{clientObj?.cep || '01001-000'}</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 border-x border-b border-black font-sans text-[7.5px] uppercase p-1 leading-tight text-gray-650 block">
                  INTERMEDIÁRIO DE SERVIÇOS: NÃO HÁ INTERMEDIAÇÃO RECOLHIDA PARA ESTA TRANSAÇÃO DIRETO DA OFICINA.
                </div>

                <div className="mt-3 flex-grow border border-black font-sans text-[9px] leading-relaxed flex flex-col p-3 text-left">
                  <span className="text-[6.5px] text-gray-500 uppercase font-bold block mb-1 font-sans">DISCRIMINAÇÃO DOS SERVIÇOS PRESTADOS</span>
                  <div className="font-mono text-[8.5px] text-black leading-relaxed whitespace-pre-line flex-grow uppercase">
                    {pdfOSSelected.services && pdfOSSelected.services.length > 0 ? (
                      pdfOSSelected.services.map((s, idx) => {
                        return `${idx + 1}. ${s.description} — VALOR LÍQUIDO DO SERVIÇO: R$ ${s.price.toLocaleString('pt-BR', {minimumFractionDigits: 2})}\n`;
                      })
                    ) : (
                      '⚠️ NENHUM SERVIÇO DE LABOR OU MÃO DE OBRA ATRELADO A ESTA ORDEM DE SERVIÇO.'
                    )}
                    <br />
                    ------------------------------------------------------------------------------------------------------<br />
                    * OS VINCULADA PARA ANÁLISE DE DIAGNÓSTICO: #{pdfOSSelected.id}<br />
                    * VEÍCULO VISTORIADO: {pdfOSSelected.veiculoInfo} | PLACA DO AUTOMÓVEL: {pdfOSSelected.plate.toUpperCase()}<br />
                    * RESPONSÁVEL TÉCNICO INTERNO: {pdfOSSelected.mechanicName}<br />
                    * VALOR TOTAL SÓ DE SOBRESSALENTES APLICADOS (PRODUTOS): R$ {partsSubtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}<br />
                    * PAGAMENTO SOB CONDIÇÃO DE ORÇAMENTO TÉCNICO AUTORIZADO PELO PORTAL DE ACOMPANHAMENTO.
                  </div>
                </div>

                <div className="mt-3 border border-black grid grid-cols-5 font-sans text-[8px] uppercase leading-tight">
                  <div className="p-2 border-r border-b border-black text-left">
                    <span className="text-[6px] text-gray-500 block font-bold font-sans">VALOR TOTAL DO SERVIÇO</span>
                    <strong className="text-black text-[10px]">R$ {servicesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="p-2 border-r border-b border-black text-left">
                    <span className="text-[6px] text-gray-500 block font-bold font-sans">DEDUÇÕES DE BASE DE CÁLCULO</span>
                    <strong className="text-black text-[10px]">R$ 0,00</strong>
                  </div>
                  <div className="p-2 border-r border-b border-black text-left">
                    <span className="text-[6px] text-gray-500 block font-bold font-sans">DESCONTO INCONDICIONADO</span>
                    <strong className="text-black text-[10px]">R$ 0,00</strong>
                  </div>
                  <div className="p-2 border-r border-b border-black text-left">
                    <span className="text-[6px] text-gray-500 block font-bold font-sans">BASE DE CÁLCULO ISSQN</span>
                    <strong className="text-black text-[10px]">R$ {servicesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="p-2 border-b border-black text-left">
                    <span className="text-[6px] text-gray-500 block font-bold font-sans">ALÍQUOTA (%) ISSQN</span>
                    <strong className="text-red-650 text-[10px]">5,00 %</strong>
                  </div>

                  <div className="p-2 border-r border-black text-left font-sans">
                    <span className="text-[6px] text-gray-500 block font-bold font-sans">VALOR DO ISSQN COBRADO</span>
                    <strong className="text-red-650 text-[10px]">R$ {issqnComputedVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="p-2 border-r border-black text-left font-sans">
                    <span className="text-[6px] text-gray-500 block font-bold font-sans">PIS / COFINS RETIDOS</span>
                    <strong className="text-black text-[10px]">R$ 0,00</strong>
                  </div>
                  <div className="p-2 border-r border-black text-left font-sans">
                    <span className="text-[6px] text-gray-500 block font-bold font-sans">INSS / IR RETIDO FONTE</span>
                    <strong className="text-black text-[10px]">R$ 0,00</strong>
                  </div>
                  <div className="p-2 border-r border-black text-left font-sans">
                    <span className="text-[6px] text-gray-500 block font-bold font-sans">RETENÇÕES DIVERSAS</span>
                    <strong className="text-black text-[10px]">R$ 0,00</strong>
                  </div>
                  <div className="p-2 bg-gray-50 text-left font-sans">
                    <span className="text-[6px] text-gray-700 block font-extrabold font-sans">VALOR LÍQUIDO NFS-e</span>
                    <strong className="text-black text-[10.5px] block font-extrabold">R$ {servicesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>

                <div className="mt-3 border border-black font-sans text-[8px] p-2 leading-normal">
                  <div className="grid grid-cols-12 uppercase">
                    <div className="col-span-8 border-r border-black/40 pr-3">
                      <span className="text-[6px] text-gray-500 block font-bold">CÓDIGO DA ATIVIDADE DE PRESTAÇÃO DE SERVIÇO</span>
                      <strong className="text-black text-[7.5px]">14.01 - LUBRIFICAÇÃO, LIMPEZA, REVISÃO, MANUTENÇÃO, REPAROS E CONSERVAÇÃO DE VEÍCULOS AUTOMOTORES (SISTEMA INTEGRADO DE AUTOPEÇAS E MECÂNICA PREMIUM).</strong>
                    </div>
                    <div className="col-span-4 pl-3 font-sans">
                      <span className="text-[6px] text-gray-500 block font-bold">LEGISLAÇÃO / MUNICÍPIO EXECUTOR</span>
                      <strong className="text-black text-[7.5px]">CONFORME LEI COMPLEMENTAR FEDERAL 116/2003 E DECRETO MUNICIPAL DO SÃO PAULO.</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border border-black font-sans text-[7.5px] uppercase p-2 block text-left bg-gray-50 text-gray-600 leading-normal">
                  <strong>OUTRAS INFORMAÇÕES COMPLEMENTARES:</strong><br />
                  * DEMONSTRATIVO FISCAL NFS-e ANEXADO PARA PRÉ-VISUALIZAÇÃO TÉCNICA ANTES DO ENVIO AOS SERVIDORES DE HOMOLOGAÇÃO DA PREFEITURA.<br />
                  * EMISSÃO AUTOMÁTICA {company?.fiscalAutoEmitOnOSClose ? 'ATIVADA NO ERP' : 'ATUALMENTE DESATIVADA (PREVISÃO MANUAL)'} AO CONCLUIR ESTA OS NO PATIO.<br />
                  * VALORES APROXIMADOS DE TRIBUTOS ESTADUAIS/FEDERAIS PARCEIROS EM CONFORMIDADE COM A LEI DO IMPOSTO APROXIMADO: R$ {(issqnComputedVal).toLocaleString('pt-BR')} aproximados na cidade prestadora.
                </div>

                <p className="text-[7.5px] text-gray-400 text-center font-mono mt-6 border-t border-gray-150 pt-2 self-center block select-none">
                  Simulador de visualização NFS-e Municipal - AutoSec © 2026. Todos os dados acima são simulações técnicas para homologação interna de oficina mecânica.
                </p>
              </div>
            )}
          </div>
        );
      })()}

      {reopenOSId && (
        <div id="warranty-reopen-modal" className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-[#0c1223] border border-purple-500/30 text-white max-w-md w-full rounded-2xl p-6 shadow-2xl relative flex flex-col gap-4">
            
            <button 
              type="button"
              id="btn-close-reopen-modal"
              onClick={() => {
                setReopenOSId(null);
                setReopenReasonText('');
              }}
              className="absolute top-4 right-4 p-1 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-gray-850 pb-3 flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-950/55 border border-purple-800 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <RefreshCw className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <span className="font-display font-extrabold text-sm block tracking-widest text-purple-400 uppercase">REABRIR OS (GARANTIA TÉCNICA)</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Retornar mão de obra ao pátio para reincidência</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
              Esta ação colocará a Ordem de Serviço #<strong>{reopenOSId}</strong> de volta ao status de <strong>"Garantia Reaberta"</strong>. A mão de obra e as peças correspondentes ficarão disponíveis para edição, possibilitando novos diagnósticos sem finalizar a ordem de serviço.
            </p>

            <div className="flex flex-col gap-1.5 font-sans">
              <label htmlFor="reopen-reason-input" className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wider">Descrição Detalhada do Defeito Reincidente</label>
              <textarea
                id="reopen-reason-input"
                rows={3}
                placeholder="Exemplo: Veículo retornou apresentando o mesmo barulho na pinça de freio dianteira esquerda..."
                value={reopenReasonText}
                onChange={(e) => setReopenReasonText(e.target.value)}
                className="w-full bg-[#080c16] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 font-mono"
              />
              <span className="text-[9px] text-gray-500 font-sans block leading-normal">
                Esta justificativa será armazenada de forma permanente no log de auditorias e exibida para acompanhamento no link de pós-venda do cliente.
              </span>
            </div>

            <div className="flex gap-2 font-mono mt-2">
              <button 
                type="button"
                id="btn-reopen-confirm"
                onClick={async () => {
                  if (!reopenReasonText.trim()) {
                    alert("Por favor, descreva qual o defeito reincidente apresentado pelo cliente.");
                    return;
                  }
                  const foundOS = ordensServico.find(o => o.id === reopenOSId);
                  if (foundOS) {
                    await editOS(reopenOSId, {
                      status: 'Garantia Reaberta',
                      reopenCount: (foundOS.reopenCount || 0) + 1,
                      reopenedAt: new Date().toISOString(),
                      reopenReason: reopenReasonText
                    });
                    setReopenOSId(null);
                    setReopenReasonText('');
                    alert("Ordem de Serviço reaberta em Garantia com sucesso! O pátio técnico de mão de obra já foi atualizado.");
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-750 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all border-0"
              >
                <RefreshCw className="w-4 h-4 text-white" /> Confirmar Reabertura
              </button>
              <button 
                type="button"
                id="btn-reopen-cancel"
                onClick={() => {
                  setReopenOSId(null);
                  setReopenReasonText('');
                }}
                className="flex-1 py-1.5 px-2.5 rounded-xl border border-neutral-800 hover:bg-slate-900 text-xs text-neutral-300 font-semibold cursor-pointer transition-all text-center bg-transparent"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 📄 SELECTOR DIALOG FOR PRINT AND PDF EXPORT */}
      {isPrintSelectorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-[#0c1223] border border-amber-500/30 text-white max-w-xl w-full rounded-2xl p-6 shadow-2xl relative flex flex-col gap-4">
            
            <button 
              type="button"
              onClick={() => setIsPrintSelectorOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-gray-400 hover:text-white transition-colors cursor-pointer animate-none"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Printer className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-white">
                  GERAR PDF / IMPRIMIR ORDENS DE SERVIÇO
                </h3>
                <p className="text-[10px] text-gray-400 font-mono">
                  Selecione uma O.S. ativa para abrir a folha oficial de impressão do cliente.
                </p>
              </div>
            </div>

            {/* Quick search inside the selector */}
            <div className="relative mt-2">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
              <input 
                type="text"
                placeholder="Pesquisar por id, cliente, placa ou carro..."
                id="print-picker-search"
                className="w-full bg-[#050810] border border-gray-800 rounded-xl py-2 px-3 pl-9 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                onChange={(e) => {
                  const val = e.target.value.toLowerCase();
                  const items = document.querySelectorAll('.print-picker-item');
                  items.forEach((item: any) => {
                    const text = item.innerText.toLowerCase();
                    if (text.includes(val)) {
                      item.style.display = 'flex';
                    } else {
                      item.style.display = 'none';
                    }
                  });
                }}
              />
            </div>

            {/* List scroll container */}
            <div className="max-h-60 overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin">
              {ordensServico.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-xs font-mono">
                  Nenhuma Ordem de Serviço encontrada para impressão.
                </div>
              ) : (
                ordensServico.map((os) => (
                  <button
                    key={os.id}
                    type="button"
                    onClick={() => {
                      setPdfOSSelected(os);
                      setIsPrintSelectorOpen(false);
                    }}
                    className="print-picker-item w-full p-3 bg-slate-900/60 hover:bg-slate-800/80 border border-gray-850 hover:border-amber-500/40 rounded-xl flex items-center justify-between gap-3 text-left transition-all duration-150 group cursor-pointer"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-amber-400">#{os.id}</span>
                        <span className="text-[10px] text-gray-300 font-bold max-w-[200px] truncate">{os.clienteName}</span>
                      </div>
                      <div className="text-[9.5px] text-gray-400 font-mono flex items-center gap-1.5 flex-wrap">
                        <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-gray-850 uppercase text-amber-500/90 tracking-wide font-extrabold">{os.plate}</span>
                        <span className="truncate max-w-[200px]">{os.veiculoInfo}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 font-mono shrink-0">
                      <span className="text-[11px] font-bold text-white">R$ {os.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span className="text-[8px] text-gray-500">{new Date(os.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setIsPrintSelectorOpen(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-gray-400 hover:text-white rounded-xl text-xs font-semibold tracking-wider cursor-pointer border border-[#1e293b] transition-colors"
              >
                FECHAR
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Lightbox Zoom Overlay for Photos */}
      {activeLightboxImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setActiveLightboxImage(null)}
        >
          <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
            <span className="text-[10px] text-gray-400 font-mono">Clique em qualquer lugar para fechar</span>
            <button
              type="button"
              className="p-2 rounded-full bg-slate-900 border border-slate-800 text-gray-300 hover:text-white transition cursor-pointer"
              onClick={() => setActiveLightboxImage(null)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="max-w-4xl w-full max-h-[85vh] flex items-center justify-center relative" onClick={(e) => e.stopPropagation()}>
            <img 
              src={activeLightboxImage} 
              alt="Ampliação da vistoria do veículo" 
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl border border-gray-800" 
            />
          </div>
        </div>
      )}

      {/* License Plate Scanner Modal with Gemini AI */}
      {showPlateScannerModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-[#050912] border border-cyan-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col gap-4 animate-scaleUp">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-cyan-950/50 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-widest">Leitor de Placa Inteligente</h3>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5">Visão Computacional & IA do Gemini</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopPlateCamera();
                  setShowPlateScannerModal(false);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-gray-800 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error messaging */}
            {plateScannerError && (
              <div className="p-3 bg-red-950/20 border border-red-900/60 rounded-xl text-red-400 font-mono text-[10px] leading-relaxed">
                ⚠️ {plateScannerError}
              </div>
            )}

            {/* Live Camera Feed inside the modal */}
            {plateCameraActive && !plateScannerLoading && (
              <div className="relative rounded-xl overflow-hidden border border-cyan-900/40 bg-black aspect-video w-full flex items-center justify-center">
                <video
                  ref={plateVideoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm border border-cyan-500/20 rounded px-2 py-0.5 text-[8.5px] text-cyan-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  CÂMERA ATIVA
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/60 backdrop-blur-sm border border-gray-800 rounded p-1.5 text-center text-[9px] text-gray-300 font-mono leading-normal">
                  Centralize a placa do veículo na área visível com boa iluminação.
                </div>
              </div>
            )}

            {/* Current processing status feedback */}
            {plateScannerFeedback && (
              <div className="p-4 bg-cyan-950/25 border border-cyan-800/80 rounded-xl flex flex-col items-center justify-center text-center gap-2 animate-pulse">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                <span className="text-xs text-cyan-300 font-mono">{plateScannerFeedback}</span>
              </div>
            )}

            {/* Actions panel */}
            <div className="flex flex-col gap-3">
              {plateCameraActive && !plateScannerLoading && (
                <button
                  type="button"
                  onClick={handlePlateCaptureAndProcess}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold rounded-xl flex justify-center items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition"
                >
                  <Camera className="w-4 h-4" /> TIRAR FOTO & ANALISAR PLACA
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                {/* Fallback File Upload trigger */}
                <label className="py-2.5 px-3 bg-[#080c16] hover:bg-[#0e1629] border border-gray-800 hover:border-gray-700 text-gray-300 rounded-xl text-[11px] font-semibold text-center cursor-pointer flex items-center justify-center gap-1.5 transition">
                  📁 {plateCameraActive ? "Enviar Foto..." : "Escolher Imagem..."}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePlateFileUploadAndProcess}
                    className="hidden"
                    disabled={plateScannerLoading}
                  />
                </label>

                {/* Toggle/Retake Trigger */}
                {!plateCameraActive ? (
                  <button
                    type="button"
                    disabled={plateScannerLoading}
                    onClick={startPlateCamera}
                    className="py-2.5 px-3 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/60 hover:border-cyan-550 text-cyan-400 font-mono rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition"
                  >
                    <Camera className="w-4 h-4" /> Ativar Câmera
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={plateScannerLoading}
                    onClick={stopPlateCamera}
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-gray-800 hover:border-gray-700 text-gray-400 font-mono rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
                  >
                    Desativar Câmera
                  </button>
                )}
              </div>
            </div>

            {/* Footer tips */}
            <div className="text-[9px] text-gray-500 font-sans leading-normal border-t border-slate-900 pt-2.5 flex items-start gap-1 justify-center text-center">
              <span>💡</span>
              <span>DICA: Fotos de celular bem aproximadas, nítidas e horizontais garantem 100% de precisão de reconhecimento.</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
