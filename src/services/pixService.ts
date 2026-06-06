import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Financeiro } from '../types';

/**
 * Professional PIX SaaS Integration Service
 */

export interface CreatePixResponse {
  txid: string;
  qrcode: string;
  copiaECola: string;
}

/**
 * 1. Criar Cobrança PIX
 * Calls backend API, requests a dynamic PIX generation, and saves the document in Firestore
 */
export async function criarCobrancaPix(
  empresaId: string,
  clienteId: string,
  ordemServicoId: string,
  descricao: string,
  valor: number,
  dataVencimento: string
): Promise<CreatePixResponse> {
  try {
    // Call the full-stack server API to register the PIX transition with bank credentials safely
    const response = await fetch('/api/pix/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empresaId,
        clienteId,
        ordemServicoId,
        descricao,
        valor,
        dataVencimento,
      }),
    });

    if (!response.ok) {
      throw new Error('Falha de resposta da API do gateway de pagamento PIX.');
    }

    const result = await response.json();
    const { txid, qrcode, copiaECola } = result;

    // Save/update the record in financial ledger
    const financeiroId = `fin_pix_${txid}`;
    const financeiroDoc: Financeiro = {
      id: financeiroId,
      empresaId,
      clienteId,
      ordemServicoId,
      description: descricao,
      type: 'Receita',
      amount: valor,
      dueDate: dataVencimento,
      status: 'PENDENTE',
      category: 'Serviços/PIX',
      createdAt: new Date().toISOString(),
      pixTxid: txid,
      qrCode: qrcode,
      copiaECola: copiaECola,
      valorPago: 0,
      webhookRecebido: false,
    };

    // Store in Firestore securely
    await setDoc(doc(db, 'financeiro', financeiroId), financeiroDoc);

    // Link the Ordem de Serviço if present
    if (ordemServicoId) {
      await updateDoc(doc(db, 'ordens_servico', ordemServicoId), {
        statusPagamento: 'PENDENTE',
        financeiroId: financeiroId,
      } as any);
    }

    return { txid, qrcode, copiaECola };
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, 'financeiro');
  }
}

/**
 * 2. Consultar PIX status on bank API directly (Active polling / manual refresh fallback)
 */
export async function consultarPix(txid: string): Promise<any> {
  try {
    const response = await fetch(`/api/pix/status/${txid}`);
    if (!response.ok) {
      throw new Error(`Falha ao consultar transação PIX txid: ${txid}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching PIX status from API', error);
    throw error;
  }
}

/**
 * 3. Cancelar PIX cobranca
 */
export async function cancelarPix(financeiroId: string, txid: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/pix/cancel/${txid}`, { method: 'POST' });
    if (!response.ok) {
      throw new Error(`Falha ao cancelar PIX no gateway.`);
    }

    // Update in Firestore
    await updateDoc(doc(db, 'financeiro', financeiroId), {
      status: 'CANCELADO',
    });

    return true;
  } catch (error) {
    return handleFirestoreError(error, OperationType.UPDATE, `financeiro/${financeiroId}`);
  }
}

/**
 * 4. Gerar QRCode Data URL directly (Fallback client-side static generator)
 */
export async function gerarQRCode(texto: string): Promise<string> {
  try {
    const qrcodeModule = await import('qrcode');
    return await qrcodeModule.toDataURL(texto, {
      margin: 2,
      width: 400,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (error) {
    console.error('Falha ao gerar QR Code offline:', error);
    return '';
  }
}

/**
 * 5. Consultar Status from local Firestore copy instead of hitting Bank API (Low cost)
 */
export async function consultarStatus(financeiroId: string): Promise<'PENDENTE' | 'PAGO' | 'CANCELADO'> {
  try {
    const docSnap = await getDoc(doc(db, 'financeiro', financeiroId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.status || 'PENDENTE';
    }
    return 'PENDENTE';
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, `financeiro/${financeiroId}`);
  }
}
