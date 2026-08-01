import * as XLSX from 'xlsx';
import { Produto, Financeiro, Cliente, OrdemServico } from '../types';

/**
 * Downloads data as a Microsoft Excel (.xlsx) file
 */
export function exportToExcel(data: Record<string, any>[], filename: string, sheetName = 'Dados') {
  if (!data || data.length === 0) {
    throw new Error('Não há dados disponíveis para exportar.');
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths dynamically based on content length
  const keys = Object.keys(data[0] || {});
  const colWidths = keys.map(key => {
    let maxLen = key.length;
    data.forEach(row => {
      const valStr = row[key] !== null && row[key] !== undefined ? String(row[key]) : '';
      if (valStr.length > maxLen) maxLen = valStr.length;
    });
    return { wch: Math.min(Math.max(maxLen + 3, 12), 50) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  const cleanFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, cleanFilename);
}

/**
 * Downloads data as a CSV (.csv) file with UTF-8 BOM for Excel compatibility
 */
export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) {
    throw new Error('Não há dados disponíveis para exportar.');
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvContent = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' }); // Use ';' separator for PT-BR Excel compatibility

  // Prepend UTF-8 BOM so Excel opens PT-BR accented characters properly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Data Formatters for Relatórios Export
 */

export function formatEstoqueExportData(produtos: Produto[]) {
  return produtos.map(p => {
    const cost = p.costPrice || 0;
    const sell = p.sellPrice || 0;
    const qty = p.quantity || 0;
    const margin = cost > 0 ? (((sell - cost) / cost) * 100).toFixed(1) + '%' : 'N/A';

    return {
      'Código SKU / Código de Barras': p.internalSku || p.barcode || p.id,
      'Descrição do Produto': p.name,
      'Marca / Fabricante': `${p.brand || ''} ${p.manufacturer || ''}`.trim() || 'Geral',
      'Categoria': p.category || 'Geral',
      'Compatibilidade Veicular': p.compatibility || 'Universal',
      'Preço de Custo (R$)': cost.toFixed(2),
      'Preço de Venda (R$)': sell.toFixed(2),
      'Margem Bruta (%)': margin,
      'Quantidade em Estoque': qty,
      'Estoque Mínimo': p.minStock || 0,
      'Status Nível': qty <= (p.minStock || 0) ? 'ALERTA / REPOSIÇÃO' : 'NORMAL',
      'Custo Total Estocado (R$)': (cost * qty).toFixed(2),
      'Valor Venda Estocado (R$)': (sell * qty).toFixed(2)
    };
  });
}

export function formatFinanceiroExportData(financeiro: Financeiro[]) {
  return financeiro.map(f => {
    return {
      'ID Lançamento': f.id,
      'Descrição': f.description,
      'Tipo': f.type,
      'Categoria': f.category || 'Outros',
      'Valor (R$)': (f.amount || 0).toFixed(2),
      'Status': f.status,
      'Data de Vencimento': f.dueDate ? new Date(f.dueDate).toLocaleDateString('pt-BR') : 'N/A',
      'Data de Pagamento': f.dataPagamento ? new Date(f.dataPagamento).toLocaleDateString('pt-BR') : (f.status === 'Pago' || f.status === 'PAGO' ? 'Pago' : 'Pendente'),
      'Nota Fiscal / Doc': f.invoiceNumber || 'Não Informado',
      'Fornecedor / Origem': f.supplierName || 'Geral'
    };
  });
}

export function formatClientesExportData(clientes: Cliente[], ordensServico: OrdemServico[]) {
  return clientes.map(c => {
    const clientOS = ordensServico.filter(os => os.clienteId === c.id || os.clienteName?.toLowerCase() === c.name.toLowerCase());
    const totalOS = clientOS.length;
    const totalGasto = clientOS.reduce((sum, os) => sum + (os.total || 0), 0);
    const pendingOS = clientOS.filter(os => os.statusPagamento === 'PENDENTE' || os.faturamentoMode === 'A faturar');
    const totalPendente = pendingOS.reduce((sum, os) => sum + (os.total || 0), 0);

    return {
      'ID Cliente': c.id,
      'Nome Completo / Razão Social': c.name,
      'CPF / CNPJ': c.cpfCnpj || 'Não Informado',
      'Telefone / WhatsApp': c.phone || 'Não Informado',
      'E-mail': c.email || 'Não Informado',
      'Endereço': c.address || 'Não Informado',
      'Total de OSs Realizadas': totalOS,
      'Total Histórico Gasto (R$)': totalGasto.toFixed(2),
      'Débito Pendente (R$)': totalPendente.toFixed(2),
      'Situação do Cliente': totalPendente > 0 ? 'EM ATRASO / COBRANÇA' : 'EM DIA / REGULAR'
    };
  });
}

export function formatOrdensServicoExportData(ordensServico: OrdemServico[]) {
  return ordensServico.map(os => {
    const servicesStr = os.services.map(s => s.description).join(' + ');
    const partsStr = os.parts.map(p => `${p.quantity}x ${p.name}`).join(' + ');

    return {
      'Número OS': os.id,
      'Cliente': os.clienteName || 'Balcão',
      'Telefone Cliente': os.clientePhone || 'N/A',
      'Veículo / Placa': `${os.veiculoInfo || ''} (${os.plate || ''})`,
      'Quilometragem (KM)': os.km || 0,
      'Mecânico Responsável': os.mechanicName || 'Não atribuído',
      'Problema Relatado': os.problem || 'Revisão',
      'Serviços Prestados': servicesStr || 'Nenhum',
      'Peças Utilizadas': partsStr || 'Nenhuma',
      'Valor Total (R$)': (os.total || 0).toFixed(2),
      'Status da OS': os.status,
      'Status do Pagamento': os.statusPagamento || (os.status === 'Finalizada' ? 'PAGO' : 'PENDENTE'),
      'Data Agendada': os.scheduledDate ? `${os.scheduledDate} ${os.scheduledTime || ''}` : 'Não Agendado',
      'Box / Elevador': os.elevadorBox || 'Elevador 1',
      'Data Criação': new Date(os.createdAt).toLocaleDateString('pt-BR')
    };
  });
}
