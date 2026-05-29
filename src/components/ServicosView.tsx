import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Tag, 
  Clock, 
  TrendingUp, 
  Trash2, 
  Edit, 
  Layers,
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Servico } from '../types';

export const ServicosView: React.FC = () => {
  const { servicos, addServico, editServico, deleteServico, importStandardServices } = useApp();

  const [activeTab, setActiveTab] = useState<'geral' | 'cadastro'>('geral');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [isImporting, setIsImporting] = useState(false);

  // New service fields
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDuration, setNewDuration] = useState('1h');
  const [newCategory, setNewCategory] = useState('Mecânica');

  // Editing service state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState('');
  const [editingName, setEditingName] = useState('');

  // Categories preset
  const categoriesList = [
    'Todas', 
    'Revisão', 
    'Mecânica', 
    'Alinhamento', 
    'Elétrica', 
    'Injeção / Elétrica', 
    'Suspensão', 
    'Freios', 
    'Lubrificantes', 
    'Arrefecimento', 
    'Climatização', 
    'Motor', 
    'Transmissão', 
    'Diagnósticos'
  ];

  const handleImportStandardServices = async () => {
    setIsImporting(true);
    try {
      await importStandardServices();
    } catch (err) {
      console.error("Erro ao importar catálogo:", err);
    } finally {
      setIsImporting(false);
    }
  };

  // Filter services
  const filteredServices = servicos.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === 'Todas' || s.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  // Submit new service
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) {
      alert("Por favor, informe ao menos o Nome e Preço de Mão de Obra.");
      return;
    }

    const payload = {
      name: newName,
      description: newDesc || "Serviço padrão de pátio.",
      price: parseFloat(newPrice) || 0,
      duration: newDuration || "1h",
      category: newCategory
    };

    await addServico(payload);

    // Reset inputs
    setNewName('');
    setNewDesc('');
    setNewPrice('');
    setNewDuration('1h');
    setNewCategory('Mecânica');
    setActiveTab('geral');
  };

  // Quick inline update price / name
  const handleUpdateServiceSubmit = async (s: Servico) => {
    const priceNum = parseFloat(editingPrice);
    if (isNaN(priceNum) || !editingName.trim()) return;

    await editServico(s.id, { 
      name: editingName,
      price: priceNum 
    });

    setEditingId(null);
    setEditingPrice('');
    setEditingName('');
  };

  return (
    <div className="flex flex-col gap-6 text-left" id="servicos-catalogo-view">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
            🛠️ CATÁLOGO DE SERVIÇOS E MÃO DE OBRA
          </h1>
          <p className="text-xs text-gray-400 font-mono">
            Gerenciamento centralizado de serviços padronizados de pátio e tempos sugeridos de reparo mecânico.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-[#080d19] p-1 rounded-xl border border-gray-800 self-stretch sm:self-auto [&>button]:px-3 [&>button]:py-1.5 [&>button]:text-xs [&>button]:font-mono [&>button]:rounded-lg">
          <button 
            type="button"
            onClick={() => setActiveTab('geral')}
            className={activeTab === 'geral' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
          >
            Fichas de Serviços
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('cadastro')}
            className={activeTab === 'cadastro' ? 'bg-red-650 bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'}
          >
            + Registrar Serviço
          </button>
        </div>
      </div>

      {activeTab === 'geral' && (
        <>
          {/* BULK SEEDING ACTION CARD IF EMPTY */}
          {servicos.length === 0 && (
            <div className="bg-gradient-to-br from-[#0f172a] to-[#0a0f1d] border border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full filter blur-xl group-hover:bg-red-600/10 transition-all duration-500 pointer-events-none"></div>
              
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-red-500 font-mono text-[10px] font-bold tracking-wider uppercase">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow animate-pulse" />
                  <span>BANCO DE DADOS DETECTADO VAZIO</span>
                </div>
                <h3 className="text-white font-extrabold text-base sm:text-lg leading-snug font-display">
                  Pré-Cadastro de Serviços e Mão de Obras Padrão
                </h3>
                <p className="text-gray-400 text-xs font-sans leading-relaxed max-w-2xl">
                  Não gaste tempo digitando tudo do zero! Comece sua experiência imediatamente preenchendo sua oficina com mais de <strong>15 serviços automotivos pré-configurados</strong> com valores médios e tempos de pátio padrão de mercado (Mão de Obra de Revisão Geral, Alinhamento 3D, Troca de Correia, Higienização, Troca de Óleo, etc.).
                </p>
              </div>

              <button
                type="button"
                disabled={isImporting}
                onClick={handleImportStandardServices}
                className="w-full md:w-auto shrink-0 px-6 py-3.5 bg-red-650 hover:bg-red-700 bg-red-600 text-white font-mono text-xs font-bold rounded-xl shadow-lg hover:shadow-red-950/20 active:scale-[98.5%] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                {isImporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>IMPORTANDO...</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4 shrink-0 text-white" />
                    <span>CARREGAR MÃO DE OBRAS PADRÃO</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* SEARCH AND FILTERS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#0a0f1d] p-4 rounded-xl border border-gray-900">
            <div className="relative md:col-span-8">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Pesquise serviços por denominação, descrição técnica ou palavra-chave..."
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

          {/* SERVICES LIST TABLE */}
          <div className="bg-[#0c1223] rounded-2xl border border-gray-800 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#080d19] border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Serviço / Mão de Obra</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Descrição Base</th>
                  <th className="p-4 text-center">Tempo Est.</th>
                  <th className="p-4 text-center">Valor Padrão</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {filteredServices.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-950/20">
                    
                    <td className="p-4 max-w-[240px]">
                      {editingId === s.id ? (
                        <input 
                          type="text"
                          className="w-full bg-[#080c16] border border-gray-750 text-xs rounded py-1 px-2 text-white font-sans"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                        />
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-sans text-xs font-semibold text-white flex items-center gap-1.5">
                            {s.name}
                          </span>
                          <span className="text-[10px] text-gray-500">ID: {s.id}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-gray-300 font-sans">
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-sky-950/40 text-sky-400 border border-sky-900/30">
                        {s.category}
                      </span>
                    </td>
                    
                    <td className="p-4 max-w-[280px] text-slate-400 text-xs font-sans">
                      {s.description}
                    </td>

                    <td className="p-4 text-center text-slate-300 font-mono">
                      <div className="inline-flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>{s.duration || '1h'}</span>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      {editingId === s.id ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-gray-500 text-[10px]">R$</span>
                          <input 
                            type="number"
                            className="w-20 bg-[#080c16] border border-gray-700 rounded py-0.5 px-1 text-center text-white"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(e.target.value)}
                          />
                        </div>
                      ) : (
                        <span className="text-white font-black text-xs">
                          R$ {s.price.toFixed(2)}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      {editingId === s.id ? (
                        <div className="flex gap-2 justify-end">
                          <button 
                            type="button"
                            onClick={() => handleUpdateServiceSubmit(s)}
                            className="px-2 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold"
                          >
                            Salvar
                          </button>
                          <button 
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 rounded bg-gray-800 text-gray-400 text-[10px]"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button 
                            type="button"
                            onClick={() => {
                              setEditingId(s.id);
                              setEditingPrice(String(s.price));
                              setEditingName(s.name);
                            }}
                            className="p-1 px-2 text-[10px] font-semibold border border-gray-800 text-gray-300 rounded hover:border-red-500 hover:text-red-500 transition-colors"
                          >
                            Editar
                          </button>
                          <button 
                            type="button"
                            onClick={() => deleteServico(s.id)}
                            className="p-1 rounded text-gray-500 hover:text-red-500 hover:bg-red-950/15"
                            title="Remover serviço"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
            {filteredServices.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                Nenhum serviço catalogado com os critérios vigentes.
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'cadastro' && (
        <form onSubmit={handleCreateService} className="max-w-3xl mx-auto w-full bg-[#0c1223] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6">
          <div className="border-b border-gray-850 pb-4">
            <h3 className="font-display font-extrabold text-white text-base">CADASTRAR NOVO SERVIÇO DE OFICINA</h3>
            <span className="text-xs text-gray-400">
              Isso preenche a base central de serviços rápidos. Peças de material de reposição devem continuar registradas sob "Estoque de Peças".
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400">DESIGNAÇÃO DO SERVIÇO (EX: MÃO DE OBRA) *</label>
              <input 
                type="text"
                placeholder="Ex: Troca e Instalação de Amortecedores Dianteiros"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400">CATEGORIA DE MECÂNICA</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-3 px-3 text-xs text-white font-mono"
              >
                {categoriesList.filter(c => c !== 'Todas').map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400">TEMPO ESTIMADO DE REPARO</label>
              <input 
                type="text"
                placeholder="Ex: 1h 30min, 45min, 3h"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-gray-400">VALOR COBRADO (MÃO DE OBRA PADRÃO) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 text-xs font-semibold">R$</span>
                <input 
                  type="number"
                  step="0.01"
                  placeholder="EX: 150.00"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full bg-[#080c16] border border-gray-800 rounded-xl py-2.5 px-3 pl-8 text-xs text-white font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 md:col-span-3">
              <label className="text-[10px] font-mono text-gray-400">DESCRIÇÃO TÉCNICA E DETALHAMENTO DE PROCEDIMENTO</label>
              <textarea 
                rows={3}
                placeholder="Detalhe o escopo do serviço de pátio (equipamentos requeridos, fluidos retirados, etc.)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="bg-[#080c16] border border-gray-800 rounded-xl py-2 px-3 text-xs text-white resize-none font-sans"
              />
            </div>

          </div>

          <div className="flex justify-end gap-3 mt-4 border-t border-gray-850 pt-4">
            <button 
              type="submit"
              className="px-6 py-3 bg-red-650 hover:bg-red-700 bg-red-600 rounded-xl font-bold font-mono text-white text-xs tracking-wider"
            >
              📥 REGISTRAR NOVO SERVIÇO
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
