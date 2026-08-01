import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { OrdemServico, OSStatus } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter, 
  Wrench, 
  Clock, 
  User, 
  Car, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Settings, 
  Grid, 
  Flame, 
  LayoutGrid, 
  X, 
  Eye, 
  RefreshCw, 
  AlertCircle,
  Move,
  ArrowRight,
  ShieldAlert,
  Layers,
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface PatioAgendaViewProps {
  onNavigateToOS?: (osId?: string) => void;
}

const DEFAULT_ELEVATOR_NAMES = [
  'Elevador 1 (4 Toneladas)',
  'Elevador 2 (Hydraulic Lift)',
  'Elevador 3 (Alinhamento 3D)',
  'Elevador 4 (Serviço Rápido)',
  'Elevador 5 (Pneumático)',
  'Elevador 6 (Box Injeção)',
  'Elevador 7 (Box Elétrica)',
  'Elevador 8 (Funilaria)'
];

export const PatioAgendaView: React.FC<PatioAgendaViewProps> = ({ onNavigateToOS }) => {
  const { ordensServico, editOS, company, updateCompany, user } = useApp();

  // Date Navigation State
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'matrix'>('month');

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mechanicFilter, setMechanicFilter] = useState<string>('all');
  const [elevatorFilter, setElevatorFilter] = useState<string>('all');

  // Elevator Capacity Config State
  const [numElevators, setNumElevators] = useState<number>(() => company?.totalElevators || 4);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Drag and Drop & Interactivity State
  const [draggedOS, setDraggedOS] = useState<OrdemServico | null>(null);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Selected OS Modal State
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);
  const [isQuickScheduleOpen, setIsQuickScheduleOpen] = useState(false);
  const [quickScheduleOSId, setQuickScheduleOSId] = useState<string>('');
  const [quickDate, setQuickDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [quickTime, setQuickTime] = useState<string>('09:00');
  const [quickElevator, setQuickElevator] = useState<string>('Elevador 1');

  // Helper Toast trigger
  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4500);
  };

  // Generate Elevator Names list up to numElevators
  const elevatorList = useMemo(() => {
    const list: string[] = [];
    for (let i = 1; i <= numElevators; i++) {
      list.push(`Elevador ${i}`);
    }
    return list;
  }, [numElevators]);

  // Handle saving Elevator configuration to company settings
  const handleSaveElevatorConfig = async (newVal: number) => {
    setNumElevators(newVal);
    try {
      await updateCompany({ totalElevators: newVal });
      showToast(`⚙️ Configuração atualizada: ${newVal} elevadores/boxes cadastrados no pátio!`, 'info');
    } catch (err) {
      console.error(err);
    }
    setIsConfigOpen(false);
  };

  // Helper to format date strings (YYYY-MM-DD)
  const formatYmd = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Filter OS list according to search & status filters
  const filteredOSList = useMemo(() => {
    return ordensServico.filter(os => {
      // Exclude cancelled if any, or match search
      const matchesSearch = 
        !searchQuery.trim() ||
        os.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        os.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (os.clienteName && os.clienteName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (os.veiculoInfo && os.veiculoInfo.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || os.status === statusFilter;
      const matchesMechanic = mechanicFilter === 'all' || os.mechanicId === mechanicFilter || os.mechanicName === mechanicFilter;
      const matchesElevator = elevatorFilter === 'all' || (os.elevadorBox && os.elevadorBox.includes(elevatorFilter));

      return matchesSearch && matchesStatus && matchesMechanic && matchesElevator;
    });
  }, [ordensServico, searchQuery, statusFilter, mechanicFilter, elevatorFilter]);

  // List of Unscheduled OSs (no scheduledDate or empty)
  const unscheduledOSList = useMemo(() => {
    return ordensServico.filter(os => !os.scheduledDate && os.status !== 'Finalizada' && os.status !== 'Entregue');
  }, [ordensServico]);

  // Compute Occupancy per Day for current view
  const getDayOccupancy = (dateYmd: string) => {
    const dayOSList = ordensServico.filter(os => os.scheduledDate === dateYmd && os.status !== 'Finalizada' && os.status !== 'Entregue');
    const count = dayOSList.length;
    const ratio = Math.min(100, Math.round((count / numElevators) * 100));
    const isHighOccupancy = count >= numElevators || ratio >= 75;
    return {
      count,
      ratio,
      isHighOccupancy,
      dayOSList
    };
  };

  // Calendar Days calculation for Month view
  const monthCalendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    const daysInMonth = lastDayOfMonth.getDate();

    const days = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        ymd: formatYmd(prevDate)
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const thisDate = new Date(year, month, day);
      days.push({
        date: thisDate,
        isCurrentMonth: true,
        ymd: formatYmd(thisDate)
      });
    }

    // Next month padding days to fill 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remainingCells; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        ymd: formatYmd(nextDate)
      });
    }

    return days;
  }, [currentDate]);

  // Week Days calculation for Week view
  const weekCalendarDays = useMemo(() => {
    const days = [];
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay(); // 0 = Sun
    const sunday = new Date(curr);
    sunday.setDate(curr.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      days.push({
        date: d,
        isCurrentMonth: d.getMonth() === currentDate.getMonth(),
        ymd: formatYmd(d)
      });
    }
    return days;
  }, [currentDate]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalScheduled = ordensServico.filter(os => !!os.scheduledDate).length;
    const todayYmd = formatYmd(new Date());
    const todayOSCount = ordensServico.filter(os => os.scheduledDate === todayYmd).length;
    
    // Count days with high occupancy in current month
    let highOccupancyDaysCount = 0;
    monthCalendarDays.forEach(cell => {
      if (cell.isCurrentMonth) {
        const occ = getDayOccupancy(cell.ymd);
        if (occ.isHighOccupancy) highOccupancyDaysCount++;
      }
    });

    const unscheduledCount = unscheduledOSList.length;

    return {
      totalScheduled,
      todayOSCount,
      highOccupancyDaysCount,
      unscheduledCount
    };
  }, [ordensServico, monthCalendarDays, numElevators, unscheduledOSList]);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, os: OrdemServico) => {
    setDraggedOS(os);
    e.dataTransfer.setData('text/plain', os.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCell !== targetId) {
      setDragOverCell(targetId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCell(null);
  };

  const handleDropOnDate = async (e: React.DragEvent, targetYmd: string) => {
    e.preventDefault();
    setDragOverCell(null);

    if (!draggedOS) return;

    // Check target date occupancy warning
    const occ = getDayOccupancy(targetYmd);
    let autoElevator = draggedOS.elevadorBox || `Elevador 1`;

    if (occ.count >= numElevators) {
      showToast(`⚠️ Alerta: O pátio em ${targetYmd.split('-').reverse().join('/')} já atingiu a capacidade máxima (${occ.count}/${numElevators} Elevadores). Agendado sob aviso de sobrecarga!`, 'warning');
    }

    try {
      await editOS(draggedOS.id, {
        scheduledDate: targetYmd,
        elevadorBox: autoElevator,
        status: draggedOS.status === 'Aberta' ? 'Agendada' : draggedOS.status
      });

      const formattedDateStr = new Date(targetYmd + 'T00:00:00').toLocaleDateString('pt-BR');
      showToast(`📅 O.S. #${draggedOS.id} reagendada para ${formattedDateStr} (${autoElevator})`, 'success');
    } catch (err) {
      console.error(err);
      showToast(`❌ Falha ao re-agendar a O.S. #${draggedOS.id}`, 'warning');
    } finally {
      setDraggedOS(null);
    }
  };

  const handleDropOnElevator = async (e: React.DragEvent, targetElevator: string) => {
    e.preventDefault();
    setDragOverCell(null);

    if (!draggedOS) return;

    const todayYmd = formatYmd(currentDate);
    const targetDate = draggedOS.scheduledDate || todayYmd;

    try {
      await editOS(draggedOS.id, {
        scheduledDate: targetDate,
        elevadorBox: targetElevator,
        status: draggedOS.status === 'Aberta' ? 'Agendada' : draggedOS.status
      });

      showToast(`🔧 O.S. #${draggedOS.id} transferida para ${targetElevator}`, 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setDraggedOS(null);
    }
  };

  // Submit quick schedule modal
  const handleConfirmQuickSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickScheduleOSId) return;

    const osToSchedule = ordensServico.find(o => o.id === quickScheduleOSId);
    if (!osToSchedule) return;

    try {
      await editOS(quickScheduleOSId, {
        scheduledDate: quickDate,
        scheduledTime: quickTime,
        elevadorBox: quickElevator,
        status: osToSchedule.status === 'Aberta' ? 'Agendada' : osToSchedule.status
      });

      const formattedDate = new Date(quickDate + 'T00:00:00').toLocaleDateString('pt-BR');
      showToast(`✅ O.S. #${quickScheduleOSId} agendada para ${formattedDate} às ${quickTime} no ${quickElevator}`, 'success');
      setIsQuickScheduleOpen(false);
      setQuickScheduleOSId('');
    } catch (err) {
      console.error(err);
    }
  };

  // Format Status Badge
  const getStatusBadge = (status: OSStatus) => {
    switch (status) {
      case 'Em execução':
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-blue-950/80 text-blue-400 border border-blue-800/60 shrink-0">⚡ Em execução</span>;
      case 'Aguardando peça':
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-950/80 text-amber-400 border border-amber-800/60 shrink-0">⚠️ Ag. Peça</span>;
      case 'Agendada':
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60 shrink-0">📅 Agendada</span>;
      case 'Finalizada':
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shrink-0">✔️ Finalizada</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800 shrink-0">{status}</span>;
    }
  };

  const todayYmdStr = formatYmd(new Date());

  return (
    <div className="flex-1 bg-[#060913] text-gray-100 p-4 lg:p-6 font-sans flex flex-col gap-6 overflow-x-hidden min-h-screen">
      
      {/* 🔔 FLOATING FEEDBACK TOAST */}
      {feedbackToast && (
        <div className={`fixed bottom-6 right-6 z-[80] p-4 rounded-2xl shadow-2xl backdrop-blur-md border animate-fade-in font-mono text-xs font-bold max-w-md flex items-center gap-3 ${
          feedbackToast.type === 'warning' 
            ? 'bg-amber-950/95 text-amber-300 border-amber-500/80 shadow-amber-950/50' 
            : feedbackToast.type === 'info'
            ? 'bg-blue-950/95 text-blue-300 border-blue-500/80 shadow-blue-950/50'
            : 'bg-emerald-950/95 text-emerald-300 border-emerald-500/80 shadow-emerald-950/50'
        }`}>
          <Sparkles className="w-5 h-5 shrink-0 animate-pulse" />
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#090f1e] p-5 rounded-2xl border border-gray-850 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-950/30 text-red-500 rounded-xl border border-red-900/40">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight">Agenda & Controle de Pátio</h1>
              <span className="bg-red-950/50 text-red-400 border border-red-800/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-widest">
                {numElevators} ELEVADORES
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Planejamento visual de ordens de serviço, alocação de elevadores e monitoramento de saturação do pátio.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsConfigOpen(true)}
            className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-gray-800 text-gray-300 font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Configurar Elevadores ({numElevators})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setQuickScheduleOSId(unscheduledOSList[0]?.id || ordensServico[0]?.id || '');
              setIsQuickScheduleOpen(true);
            }}
            className="py-2 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-mono text-xs font-bold rounded-xl shadow-lg shadow-red-950/40 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Agendar O.S. no Pátio</span>
          </button>
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        
        {/* Card 1: Elevadores Ativos */}
        <div className="p-4 bg-[#080d1a] border border-gray-850 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Boxes & Elevadores</span>
            <span className="p-1.5 bg-blue-950/40 text-blue-400 rounded-lg border border-blue-900/30">
              <Wrench className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-white font-mono">{numElevators}</span>
            <span className="text-[10px] text-gray-500 block font-mono mt-0.5">Elevadores cadastrados</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-blue-500 h-full w-full"></div>
          </div>
        </div>

        {/* Card 2: Agendadas no Pátio */}
        <div className="p-4 bg-[#080d1a] border border-gray-850 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">O.S. Agendadas</span>
            <span className="p-1.5 bg-purple-950/40 text-purple-400 rounded-lg border border-purple-900/30">
              <CalendarIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-white font-mono">{stats.totalScheduled}</span>
            <span className="text-[10px] text-gray-500 block font-mono mt-0.5">Com data e box definidos</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-purple-500 h-full" style={{ width: `${Math.min(100, stats.totalScheduled * 10)}%` }}></div>
          </div>
        </div>

        {/* Card 3: Dias de Alta Ocupação */}
        <div className={`p-4 border rounded-2xl flex flex-col justify-between relative overflow-hidden group transition-all ${
          stats.highOccupancyDaysCount > 0 
            ? 'bg-gradient-to-br from-red-950/30 via-[#080d1a] to-[#080d1a] border-red-900/50 shadow-lg shadow-red-950/20' 
            : 'bg-[#080d1a] border-gray-850'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Dias em Alta Ocupação</span>
            <span className="p-1.5 bg-red-950/40 text-red-400 rounded-lg border border-red-900/30">
              <Flame className="w-4 h-4 animate-bounce" />
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">{stats.highOccupancyDaysCount}</span>
              <span className="text-xs font-mono text-red-400 font-bold">dias com &ge;75%</span>
            </div>
            <span className="text-[10px] text-gray-400 block font-mono mt-0.5">Risco de sobrecarga do pátio</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-red-500 h-full" style={{ width: `${Math.min(100, stats.highOccupancyDaysCount * 25)}%` }}></div>
          </div>
        </div>

        {/* Card 4: Fila de Espera / Não Agendadas */}
        <div className="p-4 bg-[#080d1a] border border-gray-850 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Sem Data / Fila</span>
            <span className="p-1.5 bg-amber-950/40 text-amber-400 rounded-lg border border-amber-900/30">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-400 font-mono">{stats.unscheduledCount}</span>
            <span className="text-[10px] text-gray-500 block font-mono mt-0.5">Aguardando alocação no pátio</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-amber-500 h-full" style={{ width: `${Math.min(100, stats.unscheduledCount * 15)}%` }}></div>
          </div>
        </div>

      </div>

      {/* FILTER & VIEW MODE TOOLBAR */}
      <div className="bg-[#080d19] p-4 rounded-2xl border border-gray-850 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        
        {/* Left: Search & Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisar Placa, Cliente, O.S..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#040711] border border-gray-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-mono transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-gray-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#040711] border border-gray-800 text-gray-300 rounded-xl py-2 px-3 text-xs font-mono focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">Status: Todos</option>
            <option value="Em execução">⚡ Em execução</option>
            <option value="Aguardando peça">⚠️ Aguardando peça</option>
            <option value="Agendada">📅 Agendada</option>
            <option value="Aberta">📝 Aberta</option>
            <option value="Finalizada">✔️ Finalizada</option>
          </select>

          {/* Elevator Filter */}
          <select
            value={elevatorFilter}
            onChange={(e) => setElevatorFilter(e.target.value)}
            className="bg-[#040711] border border-gray-800 text-gray-300 rounded-xl py-2 px-3 text-xs font-mono focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">Elevador: Todos</option>
            {elevatorList.map(elev => (
              <option key={elev} value={elev}>{elev}</option>
            ))}
          </select>
        </div>

        {/* Right: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#040711] p-1 rounded-xl border border-gray-800 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'month' ? 'bg-red-650 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Mensal</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'week' ? 'bg-red-650 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Semanal</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'matrix' ? 'bg-red-650 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Pátio Vivo (Boxes)</span>
          </button>
        </div>

      </div>

      {/* DATE NAVIGATION BAR */}
      <div className="bg-[#080d19] px-5 py-3 rounded-2xl border border-gray-850 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const newD = new Date(currentDate);
              if (viewMode === 'month') newD.setMonth(newD.getMonth() - 1);
              else if (viewMode === 'week') newD.setDate(newD.getDate() - 7);
              else newD.setDate(newD.getDate() - 1);
              setCurrentDate(newD);
            }}
            className="p-2 bg-[#040711] hover:bg-slate-800 text-gray-300 rounded-xl border border-gray-800 transition active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 bg-[#040711] hover:bg-slate-800 text-gray-300 font-mono text-xs font-bold rounded-xl border border-gray-800 transition active:scale-95 cursor-pointer"
          >
            Hoje
          </button>

          <button
            type="button"
            onClick={() => {
              const newD = new Date(currentDate);
              if (viewMode === 'month') newD.setMonth(newD.getMonth() + 1);
              else if (viewMode === 'week') newD.setDate(newD.getDate() + 7);
              else newD.setDate(newD.getDate() + 1);
              setCurrentDate(newD);
            }}
            className="p-2 bg-[#040711] hover:bg-slate-800 text-gray-300 rounded-xl border border-gray-800 transition active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-base font-extrabold text-white font-mono ml-2">
            {currentDate.toLocaleString('pt-BR', { 
              month: 'long', 
              year: 'numeric',
              ...(viewMode === 'matrix' ? { day: 'numeric', weekday: 'short' } : {}) 
            }).toUpperCase()}
          </span>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Baixa ocupação (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Média (50%-75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-red-400 font-bold">ALTA OCUPAÇÃO (&ge;75%)</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA: CALENDAR / MATRIX + UNSCHEDULED SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* MAIN CALENDAR GRID VIEW (COL 9 or 12) */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          
          {/* 1. MONTH VIEW */}
          {viewMode === 'month' && (
            <div className="bg-[#080d19] rounded-2xl border border-gray-850 p-4 shadow-xl overflow-hidden">
              
              {/* Day Name Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                <div className="py-1 text-red-400">Dom</div>
                <div className="py-1">Seg</div>
                <div className="py-1">Ter</div>
                <div className="py-1">Qua</div>
                <div className="py-1">Qui</div>
                <div className="py-1">Sex</div>
                <div className="py-1 text-blue-400">Sáb</div>
              </div>

              {/* Month Grid Cells */}
              <div className="grid grid-cols-7 gap-1.5">
                {monthCalendarDays.map((cell, idx) => {
                  const occ = getDayOccupancy(cell.ymd);
                  const isToday = cell.ymd === todayYmdStr;
                  const isDragOver = dragOverCell === cell.ymd;

                  return (
                    <div
                      key={idx}
                      onDragOver={(e) => handleDragOver(e, cell.ymd)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDropOnDate(e, cell.ymd)}
                      className={`min-h-[120px] p-2 rounded-xl border flex flex-col justify-between transition-all relative ${
                        !cell.isCurrentMonth ? 'bg-[#04060e]/50 border-gray-900/60 opacity-40' : 'bg-[#050914]'
                      } ${
                        isToday ? 'border-red-500/80 shadow-md shadow-red-950/30' : 'border-gray-850/80 hover:border-gray-700'
                      } ${
                        occ.isHighOccupancy && cell.isCurrentMonth ? 'bg-gradient-to-b from-red-950/25 via-[#050914] to-[#050914] border-red-900/60' : ''
                      } ${
                        isDragOver ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-950/20 scale-[1.02] z-10' : ''
                      }`}
                    >
                      {/* Cell Header: Day Number + Occupancy Badge */}
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-mono font-bold ${
                          isToday ? 'bg-red-650 text-white px-1.5 py-0.5 rounded-md' : 'text-gray-300'
                        }`}>
                          {cell.date.getDate()}
                        </span>

                        {cell.isCurrentMonth && (
                          <div className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-extrabold flex items-center gap-1 ${
                            occ.isHighOccupancy 
                              ? 'bg-red-950/80 text-red-400 border border-red-800/60 animate-pulse' 
                              : occ.ratio >= 50 
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60' 
                              : 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/40'
                          }`}>
                            {occ.isHighOccupancy && <Flame className="w-2.5 h-2.5 text-red-400" />}
                            <span>{occ.count}/{numElevators} ({occ.ratio}%)</span>
                          </div>
                        )}
                      </div>

                      {/* OS Cards List inside Date Cell */}
                      <div className="flex flex-col gap-1 my-1.5 flex-1 max-h-[85px] overflow-y-auto pr-0.5 scrollbar-thin">
                        {occ.dayOSList.map(os => (
                          <div
                            key={os.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, os)}
                            onClick={() => setSelectedOS(os)}
                            className="p-1.5 bg-[#0a1122] hover:bg-[#101b36] border border-gray-800 hover:border-red-500/50 rounded-lg cursor-grab active:cursor-grabbing transition-all text-left group shadow-sm flex flex-col gap-0.5"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[9.5px] font-mono font-extrabold text-white truncate max-w-[80px]">
                                #{os.id.substring(os.id.length - 6)}
                              </span>
                              <span className="text-[8px] font-mono text-amber-400 bg-amber-950/40 px-1 py-0.2 rounded border border-amber-900/30">
                                {os.elevadorBox || 'Elevador 1'}
                              </span>
                            </div>
                            <div className="text-[9px] text-gray-300 font-sans truncate font-bold">
                              {os.plate} • {os.clienteName || 'Sem cliente'}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Drop Zone Footer Hint */}
                      <div className="text-[7.5px] font-mono text-gray-600 text-center uppercase tracking-wider border-t border-gray-900 pt-0.5">
                        {occ.isHighOccupancy ? '🔥 Pátio Lotado' : 'Arraste para agendar'}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* 2. WEEK VIEW */}
          {viewMode === 'week' && (
            <div className="bg-[#080d19] rounded-2xl border border-gray-850 p-4 shadow-xl overflow-hidden">
              <div className="grid grid-cols-7 gap-2">
                {weekCalendarDays.map((cell, idx) => {
                  const occ = getDayOccupancy(cell.ymd);
                  const isToday = cell.ymd === todayYmdStr;
                  const isDragOver = dragOverCell === cell.ymd;

                  return (
                    <div
                      key={idx}
                      onDragOver={(e) => handleDragOver(e, cell.ymd)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDropOnDate(e, cell.ymd)}
                      className={`min-h-[400px] p-3 rounded-xl border flex flex-col gap-2 transition-all ${
                        isToday ? 'border-red-500 bg-[#081024]' : 'bg-[#050914] border-gray-850'
                      } ${
                        occ.isHighOccupancy ? 'bg-gradient-to-b from-red-950/20 via-[#050914] to-[#050914] border-red-900/60' : ''
                      } ${
                        isDragOver ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-950/20 scale-[1.01]' : ''
                      }`}
                    >
                      {/* Week Header */}
                      <div className="pb-2 border-b border-gray-850 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-mono text-gray-500 uppercase block font-bold">
                            {cell.date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                          </span>
                          <span className={`text-base font-mono font-extrabold ${isToday ? 'text-red-500' : 'text-white'}`}>
                            {cell.date.getDate()}
                          </span>
                        </div>

                        <div className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold ${
                          occ.isHighOccupancy ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-900 text-gray-400'
                        }`}>
                          {occ.count}/{numElevators}
                        </div>
                      </div>

                      {/* OS Cards in Week Day Column */}
                      <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[350px] pr-1">
                        {occ.dayOSList.map(os => (
                          <div
                            key={os.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, os)}
                            onClick={() => setSelectedOS(os)}
                            className="p-2.5 bg-[#0a1122] hover:bg-[#111e3b] border border-gray-800 hover:border-red-500/50 rounded-xl cursor-grab active:cursor-grabbing transition-all text-left flex flex-col gap-1.5 shadow-md"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-mono font-bold text-white">#{os.id}</span>
                              {getStatusBadge(os.status)}
                            </div>

                            <div className="text-xs text-gray-200 font-bold truncate">
                              🚗 {os.veiculoInfo || os.plate}
                            </div>

                            <div className="text-[10px] text-gray-400 truncate">
                              👤 {os.clienteName || 'Sem cliente'}
                            </div>

                            <div className="flex justify-between items-center pt-1.5 border-t border-gray-850/80 text-[9px] font-mono text-gray-400">
                              <span>⏰ {os.scheduledTime || '08:00'}</span>
                              <span className="text-amber-400 font-bold">{os.elevadorBox || 'Elevador 1'}</span>
                            </div>
                          </div>
                        ))}

                        {occ.dayOSList.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center p-4 text-center text-gray-600 font-mono text-[10px]">
                            <Clock className="w-5 h-5 mb-1 text-gray-700" />
                            <span>Livre para agendamentos</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. PÁTIO VIVO MATRIX VIEW (ELEVATOR BAY COLUMNS FOR SELECTED DATE) */}
          {viewMode === 'matrix' && (
            <div className="bg-[#080d19] rounded-2xl border border-gray-850 p-5 shadow-xl flex flex-col gap-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-850">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-red-500" />
                    <span>Visão Física de Boxes & Elevadores — {currentDate.toLocaleDateString('pt-BR')}</span>
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-sans">
                    Alocação de veículos por elevador em tempo real. Arraste O.S. de um elevador para outro para remanejar o pátio.
                  </p>
                </div>

                <div className="text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-900/40 px-3 py-1 rounded-xl font-bold">
                  Data: {formatYmd(currentDate)}
                </div>
              </div>

              {/* Columns for each Elevator */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {elevatorList.map((elevName, elevIdx) => {
                  const dayYmd = formatYmd(currentDate);
                  const osInElevator = ordensServico.filter(os => 
                    os.scheduledDate === dayYmd && 
                    (os.elevadorBox === elevName || (!os.elevadorBox && elevIdx === 0))
                  );

                  const isOccupied = osInElevator.some(o => o.status === 'Em execução' || o.status === 'Aguardando peça');
                  const isDragOver = dragOverCell === elevName;

                  return (
                    <div
                      key={elevName}
                      onDragOver={(e) => handleDragOver(e, elevName)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDropOnElevator(e, elevName)}
                      className={`p-4 rounded-2xl border flex flex-col gap-3 min-h-[350px] transition-all ${
                        isOccupied ? 'bg-[#081024] border-blue-900/60' : 'bg-[#050914] border-gray-850'
                      } ${
                        isDragOver ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-950/20 scale-[1.01]' : ''
                      }`}
                    >
                      {/* Elevator Header */}
                      <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                        <div>
                          <span className="text-xs font-bold font-mono text-white block">{elevName}</span>
                          <span className="text-[9px] text-gray-500 font-mono">
                            {DEFAULT_ELEVATOR_NAMES[elevIdx] || 'Box de Atendimento Geral'}
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          isOccupied ? 'bg-blue-950 text-blue-400 border border-blue-800 animate-pulse' : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                        }`}>
                          {isOccupied ? 'OCUPADO' : 'LIVRE'}
                        </span>
                      </div>

                      {/* OSs list in this Elevator */}
                      <div className="flex-1 flex flex-col gap-2.5">
                        {osInElevator.map(os => (
                          <div
                            key={os.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, os)}
                            onClick={() => setSelectedOS(os)}
                            className="p-3 bg-[#0a1122] hover:bg-[#121f3f] border border-gray-800 hover:border-red-500/50 rounded-xl cursor-grab active:cursor-grabbing transition-all text-left flex flex-col gap-2 shadow-lg group relative"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-mono font-bold text-white">#{os.id}</span>
                              {getStatusBadge(os.status)}
                            </div>

                            <div className="text-xs text-gray-100 font-bold">
                              🚗 {os.veiculoInfo || os.plate}
                            </div>

                            <div className="text-[10px] text-gray-400">
                              👤 Cliente: <strong className="text-gray-200">{os.clienteName || 'N/A'}</strong>
                            </div>

                            <div className="p-2 bg-[#040711] rounded-lg text-[9.5px] font-mono text-gray-400 flex flex-col gap-0.5 border border-gray-850">
                              <div>🔧 Mecânico: {os.mechanicName || 'Não atribuído'}</div>
                              <div>⏰ Horário: {os.scheduledTime || '08:00'}</div>
                            </div>
                          </div>
                        ))}

                        {osInElevator.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-600 font-mono text-xs border-2 border-dashed border-gray-850/60 rounded-xl">
                            <Wrench className="w-6 h-6 mb-1 text-gray-700" />
                            <span>Box Disponível</span>
                            <span className="text-[9px] text-gray-600 mt-1">Arraste uma O.S. aqui para alocar neste elevador</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* UNSCHEDULED OS SIDEBAR (COL 3) */}
        <div className="lg:col-span-3 bg-[#080d19] p-4 rounded-2xl border border-gray-850 shadow-xl flex flex-col gap-4">
          
          <div className="flex justify-between items-center pb-2 border-b border-gray-850">
            <div>
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Fila Sem Data ({unscheduledOSList.length})</span>
              </h3>
              <p className="text-[9px] text-gray-400 mt-0.5">
                Arraste qualquer O.S. abaixo diretamente para o calendário para agendar!
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[600px] overflow-y-auto pr-1">
            {unscheduledOSList.map(os => (
              <div
                key={os.id}
                draggable
                onDragStart={(e) => handleDragStart(e, os)}
                onClick={() => setSelectedOS(os)}
                className="p-3 bg-[#050914] hover:bg-[#0c162e] border border-amber-900/30 hover:border-amber-500/60 rounded-xl cursor-grab active:cursor-grabbing transition-all text-left flex flex-col gap-1.5 shadow-md group relative"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-amber-400">#{os.id}</span>
                  <Move className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400 transition-colors" />
                </div>

                <div className="text-xs text-white font-bold truncate">
                  🚗 {os.veiculoInfo || os.plate}
                </div>

                <div className="text-[10px] text-gray-400 truncate">
                  👤 {os.clienteName || 'Sem cliente'}
                </div>

                <div className="text-[9px] font-mono text-gray-500 truncate">
                  💬 {os.problem || 'Revisão geral'}
                </div>

                <div className="pt-1 flex justify-between items-center text-[8.5px] font-mono text-amber-500 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/30">
                  <span>Arrastar para agendar</span>
                  <span>R$ {os.total.toFixed(2)}</span>
                </div>
              </div>
            ))}

            {unscheduledOSList.length === 0 && (
              <div className="p-6 text-center text-gray-500 font-mono text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <span>Todas as O.S. abertas já possuem data e elevador agendados!</span>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ⚙️ ELEVATOR CONFIGURATION MODAL */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#090f1f] border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-left font-sans">
            <div className="flex justify-between items-start border-b border-gray-850 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Configurar Elevadores do Pátio</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Defina a quantidade total de elevadores/boxes disponíveis na sua oficina para cálculo de capacidade e alerta de sobrecarga.
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono font-bold text-gray-300">Quantidade de Elevadores/Boxes</label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5, 6, 8, 10, 12].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleSaveElevatorConfig(num)}
                    className={`py-3 rounded-xl border font-mono font-bold text-sm transition cursor-pointer ${
                      numElevators === num
                        ? 'bg-red-650 text-white border-red-500 shadow-lg'
                        : 'bg-[#040711] text-gray-300 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {num} Boxes
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl text-[10px] font-mono text-amber-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Sempre que agendamentos em um mesmo dia atingirem ou superarem este número, a data será marcada em vermelho como <strong>ALTA OCUPAÇÃO DE ELEVADORES</strong>.
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-gray-200 font-mono text-xs font-bold rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⏱️ QUICK SCHEDULE MODAL */}
      {isQuickScheduleOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleConfirmQuickSchedule} className="bg-[#090f1f] border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 text-left font-sans">
            <div className="flex justify-between items-start border-b border-gray-850 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">Agendar O.S. no Pátio</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickScheduleOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-gray-300">Selecione a Ordem de Serviço</label>
              <select
                value={quickScheduleOSId}
                onChange={(e) => setQuickScheduleOSId(e.target.value)}
                className="bg-[#040711] border border-gray-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                required
              >
                <option value="">Selecione a O.S...</option>
                {ordensServico.map(os => (
                  <option key={os.id} value={os.id}>
                    #{os.id} — {os.plate} ({os.clienteName || 'Sem cliente'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-gray-300">Data do Agendamento</label>
                <input
                  type="date"
                  value={quickDate}
                  onChange={(e) => setQuickDate(e.target.value)}
                  className="bg-[#040711] border border-gray-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-gray-300">Horário Previsto</label>
                <input
                  type="time"
                  value={quickTime}
                  onChange={(e) => setQuickTime(e.target.value)}
                  className="bg-[#040711] border border-gray-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-gray-300">Elevador / Box de Atendimento</label>
              <select
                value={quickElevator}
                onChange={(e) => setQuickElevator(e.target.value)}
                className="bg-[#040711] border border-gray-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
              >
                {elevatorList.map(elev => (
                  <option key={elev} value={elev}>{elev}</option>
                ))}
              </select>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-red-650 hover:bg-red-600 text-white font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer"
              >
                Salvar Agendamento
              </button>
              <button
                type="button"
                onClick={() => setIsQuickScheduleOpen(false)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-gray-300 font-mono text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🔍 INSPECTION MODAL FOR SELECTED OS */}
      {selectedOS && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#090f1f] border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 text-left font-sans animate-fade-in">
            <div className="flex justify-between items-start border-b border-gray-850 pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest">Detalhes da O.S. no Pátio</span>
                <h3 className="text-lg font-black text-white font-mono mt-0.5">#{selectedOS.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOS(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#040711] border border-gray-850 rounded-xl">
                <span className="text-[9px] font-mono text-gray-500 uppercase font-bold block">Veículo / Placa</span>
                <span className="text-white font-bold block mt-1">{selectedOS.veiculoInfo || selectedOS.plate}</span>
                <span className="text-amber-400 font-mono text-[10px]">KM: {selectedOS.km || 'N/I'}</span>
              </div>

              <div className="p-3 bg-[#040711] border border-gray-850 rounded-xl">
                <span className="text-[9px] font-mono text-gray-500 uppercase font-bold block">Cliente</span>
                <span className="text-white font-bold block mt-1">{selectedOS.clienteName || 'Não Informado'}</span>
                <span className="text-gray-400 text-[10px]">{selectedOS.clientePhone || 'N/I'}</span>
              </div>
            </div>

            <div className="p-3 bg-[#040711] border border-gray-850 rounded-xl flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-gray-400 font-bold">Agendamento Atual:</span>
                <span className="text-amber-400 font-mono font-bold">
                  {selectedOS.scheduledDate ? new Date(selectedOS.scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Sem data'} às {selectedOS.scheduledTime || '08:00'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-gray-400 font-bold">Elevador/Box:</span>
                <span className="text-blue-400 font-mono font-bold">{selectedOS.elevadorBox || 'Elevador 1'}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-gray-400 font-bold">Status:</span>
                <div>{getStatusBadge(selectedOS.status)}</div>
              </div>
            </div>

            <div className="p-3 bg-[#040711] border border-gray-850 rounded-xl text-xs">
              <span className="text-[9px] font-mono text-gray-500 uppercase font-bold block">Queixa / Diagnóstico</span>
              <p className="text-gray-300 mt-1 text-[11px] leading-relaxed">
                {selectedOS.diagnosis || selectedOS.problem || 'Diagnóstico padrão em andamento.'}
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              {onNavigateToOS && (
                <button
                  type="button"
                  onClick={() => {
                    const osId = selectedOS.id;
                    setSelectedOS(null);
                    onNavigateToOS(osId);
                  }}
                  className="flex-1 py-2.5 bg-red-650 hover:bg-red-600 text-white font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Abrir O.S. Completa</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedOS(null)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-gray-300 font-mono text-xs font-bold rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
