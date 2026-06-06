import { onRequest, Request } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

// Initialize firebase admin, if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Endpoint: https://REGIAO-PROJETO.cloudfunctions.net/pixWebhook
 * Accepts POST webhook notifications from Efí / Asaas / Bank APIs
 */
export const pixWebhook = onRequest({ cors: true }, async (req: Request, res: any) => {
  // 1. Validate request method
  if (req.method !== 'POST') {
    res.status(405).send('Método Não Permitido. Utilize POST.');
    return;
  }

  // 2. Validate Security/Webhook Token/Signature in Headers
  const webhookToken = req.headers['x-pix-token'] || req.query.token;
  const expectedToken = process.env.PIX_WEBHOOK_SECRET_TOKEN || 'saas_erp_auth_token_secret_123';

  // Reject unauthorized calls to safeguard against shadow updates
  if (!webhookToken || webhookToken !== expectedToken) {
    res.status(401).send('Acesso não autorizado - Token de assinatura inválido.');
    return;
  }

  const db = admin.firestore();
  
  try {
    const payload = req.body;
    
    // Bank payload format typically has pix: [{txid: string, valor: number, horario: string}] or simple txid
    // Adapt to common standards: EFÍ, ASAAS or custom sandbox payloads
    const txid = payload.txid || (payload.pix && payload.pix[0]?.txid) || payload.pix_txid;
    const valorPago = parseFloat(payload.valor || (payload.pix && payload.pix[0]?.valor) || payload.amount || '0');
    const paymentTime = payload.horario || (payload.pix && payload.pix[0]?.horario) || new Date().toISOString();

    if (!txid) {
      res.status(400).send('Corpo de requisição inválido: txid ausente.');
      return;
    }

    // 1. Locate the financial record using txid query
    const financeiroRef = db.collection('financeiro');
    const finQuery = await financeiroRef.where('pixTxid', '==', txid).limit(1).get();

    if (finQuery.empty) {
      console.warn(`Cobrança com Pix TXID ${txid} não localizada.`);
      res.status(444).send(`Cobrança com Pix TXID ${txid} não cadastrada no ERP.`);
      return;
    }

    const finDoc = finQuery.docs[0];
    const finData = finDoc.data();
    const companyId = finData.empresaId || 'unknown_tenant';

    // Business Rules: Do not edit completed charges
    if (finData.status === 'PAGO' || finData.status === 'Pago') {
      console.info(`Cobrança com TXID ${txid} já consta como PAGA.`);
      res.status(200).send('Cobrança já processada anteriormente.');
      return;
    }

    const batch = db.batch();

    // 2. Update financial ledger record
    const nowTime = admin.firestore.Timestamp.now();
    batch.update(finDoc.ref, {
      status: 'PAGO',
      valorPago: valorPago || finData.amount,
      webhookRecebido: true,
      dataPagamento: paymentTime,
      updatedAt: nowTime,
    });

    // 3. Update related Ordem de Serviço
    if (finData.ordemServicoId) {
      const osRef = db.collection('ordens_servico').doc(finData.ordemServicoId);
      batch.update(osRef, {
        statusPagamento: 'PAGO',
        updatedAt: nowTime.toDate().toISOString(),
      });
    }

    // 4. Create Audit / Event Log in collection: pix_logs
    const logId = `log_${txid}_${Date.now()}`;
    const logRef = db.collection('pix_logs').doc(logId);
    batch.set(logRef, {
      id: logId,
      txid,
      empresaId: companyId,
      evento: 'PIX_CONFIRMADO_WEBHOOK',
      payload: payload,
      createdAt: nowTime,
    });

    // 5. Trigger Real-Time notification entry: notificacoes
    const notifId = `notif_${txid}_${Date.now()}`;
    const notifRef = db.collection('notificacoes').doc(notifId);
    batch.set(notifRef, {
      id: notifId,
      empresaId: companyId,
      titulo: 'Pagamento Recebido',
      mensagem: `PIX confirmado automaticamente no valor de R$ ${(valorPago || finData.amount).toFixed(2)}. ${finData.description ? `(Ref: ${finData.description})` : ''}`,
      tipo: 'financeiro',
      createdAt: nowTime,
    });

    // Commit changes atomically to safeguard relational integrity
    await batch.commit();

    console.log(`Sucesso: PIX TXID ${txid} liquidado com sucesso.`);
    res.status(200).send('Webhook processado com sucesso. Status atualizado!');
  } catch (error: any) {
    console.error('Erro ao processar Webhook do PIX:', error);
    res.status(500).send(`Erro interno ao processar o evento de webhook: ${error.message}`);
  }
});
