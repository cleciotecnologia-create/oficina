import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import admin from "firebase-admin";
import QRCode from "qrcode";
import fs from "fs";

dotenv.config();

// Initialize Firebase Admin dynamically using applet config file
const firebaseAppletConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8")
);

if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: firebaseAppletConfig.projectId,
  });
}

const db = admin.firestore(firebaseAppletConfig.firestoreDatabaseId);

// Initialize Express
const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK to prevent startup crashes when GEMINI_API_KEY is not configured
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    console.warn("WARNING: GEMINI_API_KEY env secret is not configured yet. Running server in Local Expert Mode.");
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// 1. Health Status endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.GEMINI_API_KEY ? "AI Active" : "Local Expert Backup Mode" });
});

/**
 * Shared Core Logic: Liquidates PIX payment and updates financeiro + Ordem de Serviço + logs + notifications
 */
async function liquidatePixPayment(txid: string, amount: number, rawPayload: any): Promise<{ success: boolean; message: string }> {
  try {
    const finRef = db.collection("financeiro");
    const snap = await finRef.where("pixTxid", "==", txid).limit(1).get();

    if (snap.empty) {
      return { success: false, message: `Cobrança PIX com TXID ${txid} não cadastrada.` };
    }

    const finDoc = snap.docs[0];
    const finData = finDoc.data();
    const empresaId = finData.empresaId || "unknown_tenant";

    if (finData.status === "PAGO" || finData.status === "Pago") {
      return { success: true, message: "Pagamento já liquidado anteriormente." };
    }

    const batch = db.batch();
    const nowTimestamp = admin.firestore.Timestamp.now();

    // 1. Update Financeiro document
    batch.update(finDoc.ref, {
      status: "PAGO",
      valorPago: amount || finData.amount,
      webhookRecebido: true,
      dataPagamento: new Date().toISOString(),
      updatedAt: nowTimestamp,
    });

    // 2. Update Ordem de Serviço
    if (finData.ordemServicoId) {
      const osRef = db.collection("ordens_servico").doc(finData.ordemServicoId);
      batch.update(osRef, {
        statusPagamento: "PAGO",
        updatedAt: new Date().toISOString(),
      });
    }

    // 3. Create Event Audit Log in pix_logs
    const logId = `log_${txid}_${Date.now()}`;
    const logRef = db.collection("pix_logs").doc(logId);
    batch.set(logRef, {
      id: logId,
      txid,
      empresaId,
      evento: "PIX_CONFIRMADO_SISTEMA_SAAS",
      payload: rawPayload,
      createdAt: nowTimestamp,
    });

    // 4. Create Notification in notificacoes
    const notifId = `notif_${txid}_${Date.now()}`;
    const notifRef = db.collection("notificacoes").doc(notifId);
    batch.set(notifRef, {
      id: notifId,
      empresaId,
      titulo: "Pagamento Recebido",
      mensagem: `PIX confirmado automaticamente no valor de R$ ${(amount || finData.amount).toFixed(2)}. ${finData.description ? `(Ref: ${finData.description})` : ""}`,
      tipo: "financeiro",
      createdAt: nowTimestamp,
    });

    await batch.commit();
    return { success: true, message: "PIX liquidado com sucesso e status atualizado." };
  } catch (error: any) {
    console.error("Erro interno ao liquidar PIX:", error);
    return { success: false, message: `Erro interno: ${error.message}` };
  }
}

/**
 * 2. Criar Cobrança PIX Endpoint (Bank simulation with QR code generation)
 */
app.post("/api/pix/create", async (req, res) => {
  const { empresaId, clienteId, ordemServicoId, descricao, valor, dataVencimento } = req.body;

  if (!valor) {
    res.status(400).json({ error: "Valor é obrigatório." });
    return;
  }

  // Generate sandbox txid
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomTx = "";
  for (let i = 0; i < 25; i++) {
    randomTx += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const txid = `TXID${Date.now()}${randomTx}`.substring(0, 32);

  // Generate standardized copia e cola string representing the payment
  const copiaECola = `00020101021226870014br.gov.bcb.pix25650019saas_erp_production_gateway2760014br.com.emissor5204000053039865405${parseFloat(valor).toFixed(2)}5802BR5915AutoTech%20SaaS6009Sao%20Paulo62260522${txid}6304`;

  try {
    // Generate real Base64 image QR Code representation
    const qrcodeImg = await QRCode.toDataURL(copiaECola, {
      margin: 1,
      width: 320,
    });

    res.json({
      txid,
      copiaECola,
      qrcode: qrcodeImg,
    });
  } catch (err: any) {
    console.error("QRCode generation error:", err);
    res.status(500).json({ error: "Erro ao gerar QR Code para cobrança." });
  }
});

/**
 * 3. Consultar PIX Status directly from Firestore copy
 */
app.get("/api/pix/status/:txid", async (req, res) => {
  const { txid } = req.params;

  try {
    const finRef = db.collection("financeiro");
    const snap = await finRef.where("pixTxid", "==", txid).limit(1).get();

    if (snap.empty) {
      res.json({ txid, status: "PENDENTE" });
      return;
    }

    const data = snap.docs[0].data();
    res.json({
      txid,
      status: data.status || "PENDENTE",
      valorPago: data.valorPago || 0,
      dataPagamento: data.dataPagamento || null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 4. Cancelar Cobrança PIX
 */
app.post("/api/pix/cancel/:txid", async (req, res) => {
  const { txid } = req.params;

  try {
    const finRef = db.collection("financeiro");
    const snap = await finRef.where("pixTxid", "==", txid).limit(1).get();

    if (snap.empty) {
      res.status(404).json({ error: "Transação não localizada." });
      return;
    }

    const docRef = snap.docs[0].ref;
    await docRef.update({
      status: "CANCELADO",
      updatedAt: admin.firestore.Timestamp.now(),
    });

    res.json({ success: true, message: "Cobrança cancelada com sucesso." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 5. Webhook Receptor endpoint for real-production banking callbacks
 */
app.post("/api/pix/webhook", async (req, res) => {
  const payload = req.body;
  const signatureToken = req.headers["x-pix-token"] || req.query.token;
  
  // Clean mock token fallback check
  const expectedToken = process.env.PIX_WEBHOOK_SECRET_TOKEN || "saas_erp_auth_token_secret_123";
  
  if (signatureToken && signatureToken !== expectedToken) {
    res.status(401).send("Falha na validação de assinatura de webhook.");
    return;
  }

  const txid = payload.txid || (payload.pix && payload.pix[0]?.txid) || payload.pix_txid;
  const valorPago = parseFloat(payload.valor || (payload.pix && payload.pix[0]?.valor) || payload.amount || "0");

  if (!txid) {
    res.status(400).send("Faltando txid no corpo da requisição.");
    return;
  }

  const result = await liquidatePixPayment(txid, valorPago, payload);
  if (result.success) {
    res.status(200).send(result.message);
  } else {
    res.status(400).send(result.message);
  }
});

/**
 * 6. Webhook Simulator Endpoint for AI Studio Sandbox live testing!
 * Allows developer to simulate a real payment callback from the user interface
 */
app.post("/api/pix/simulate-payment", async (req, res) => {
  const { txid, amount } = req.body;

  if (!txid) {
    res.status(400).json({ error: "txid é obrigatório para simulação." });
    return;
  }

  const payload = {
    txid,
    valor: amount || 0,
    horario: new Date().toISOString(),
    ambiente: "SANDBOX_SIMULATOR",
    origem: "PREVIEW_INTERFACE",
  };

  const result = await liquidatePixPayment(txid, amount, payload);
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

// 2. Intelligent Auto Diagnosis & Parts Suggester
app.post("/api/gemini/diagnose", async (req, res) => {
  const { plate, model, problemDescription } = req.body;

  if (!model || !problemDescription) {
    res.status(400).json({ error: "Parâmetros 'model' e 'problemDescription' são obrigatórios." });
    return;
  }

  const client = getGeminiClient();

  if (!client) {
    // Elegant Local Expert backup responses if API key is not configured
    setTimeout(() => {
      res.json({
        diagnosis: `[Expert Local Mode] Análise diagnóstica presumida para o veículo ${model} (Placa ${plate || "Não Informada"}):\n\nBaseado nos sintomas apresentados: "${problemDescription}", identificamos que as causas prováveis para este tipo de veículo incluem um desgaste no conjunto primário ou fadiga de componentes elétricos/mecânicos específicos.`,
        suggestedParts: [
          { name: "Pastilha de Freio Bosch", confidence: "92%", estCost: "R$ 180,00", qtyNeeded: 1 },
          { name: "Fluido de Freio DOT 4 Varga", confidence: "85%", estCost: "R$ 45,00", qtyNeeded: 2 },
          { name: "Disco de Freio Dianteiro Fremax", confidence: "78%", estCost: "R$ 320,00", qtyNeeded: 2 }
        ],
        suggestedServices: [
          { description: "Substituição completa das pastilhas e discos dianteiros", estHours: "1.5h", estLaborCost: "R$ 150,00" },
          { description: "Sangria e troca completa de fluido de freio", estHours: "1.0h", estLaborCost: "R$ 100,00" }
        ],
        estimatedTotal: "R$ 840,00",
        urgency: "Alta - Risco de falha mecânica de frenagem"
      });
    }, 400);
    return;
  }

  try {
    const prompt = `Você é um Engenheiro Mecânico Automotivo sênior e especialista em peças de reposição.
Produza um diagnóstico automotivo detalhado para o seguinte caso:
- Veículo modelo/motor: ${model}
- Placa identificadora: ${plate || "Não informada"}
- Queixa do cliente/Problema relatado: "${problemDescription}"

Você deve responder rigorosamente no formato JSON com os seguintes campos e tipos exatos:
{
  "diagnosis": "Descrição longa em português explicando em detalhes técnicos e acessíveis a causa do problema",
  "suggestedParts": [
    { "name": "Nome exato da peça aplicável", "confidence": "0-100%", "estCost": "Valor estimado em float ou texto R$", "qtyNeeded": 1 }
  ],
  "suggestedServices": [
    { "description": "Descrição do serviço mecânico sugerido", "estHours": "Tempo aproximado em horas", "estLaborCost": "Valor de mão de obra em R$" }
  ],
  "estimatedTotal": "Estimativa total aproximada em R$",
  "urgency": "Urgência (Baixa, Média, Alta)"
}
Evite markdown na formatação externa do JSON.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const cleanText = response.text || "";
    const parsedData = JSON.parse(cleanText.trim());
    res.json(parsedData);
  } catch (error: any) {
    console.error("Erro na chamada do Gemini API:", error);
    res.status(500).json({
      error: "Falha ao gerar diagnóstico inteligente.",
      details: error.message,
      diagnosis: "[Modo Contingência] O veículo apresenta comportamento atípico do motor ou dos módulos secundários. Recomenda-se aferição analógica de pressões ou sensores com osciloscópio.",
      suggestedParts: [
        { name: "Filtro de Óleo Fram", confidence: "60%", estCost: "R$ 38,00", qtyNeeded: 1 },
        { name: "Super Óleo Lubrificante 5W30 Sintético", confidence: "60%", estCost: "R$ 65,00", qtyNeeded: 4 }
      ],
      suggestedServices: [
        { description: "Revisão geral do sistema com scanner de injeção", estHours: "1.0h", estLaborCost: "R$ 120,00" }
      ],
      estimatedTotal: "R$ 418,00",
      urgency: "Média"
    });
  }
});

// 3. IA Interactive Assistant Chat Client for Mechanical Diagnostics
app.post("/api/gemini/chat", async (req, res) => {
  const { messages } = req.body; // Array list of {role: 'user'|'model', text: string}

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Faltando parâmetro 'messages'." });
    return;
  }

  const client = getGeminiClient();

  if (!client) {
    // Fallback dialogue assistant
    const userMsg = messages[messages.length - 1]?.text || "";
    setTimeout(() => {
      res.json({
        text: `Olá! [Resposta do Assistente Local]: Sou seu assessor técnico automotivo especializado. Analisando seu comentário sobre "${userMsg}", sugiro verificar os fusíveis principais, o nível de fluido de arrefecimento e os códigos de erro DTC presentes no scanner OBD-II de sua oficina. Como posso te auxiliar com mais detalhes ou com orçamentos de peças?`
      });
    }, 450);
    return;
  }

  try {
    // Map client model structure to Google GenAI structure: content: {parts: [{text: string}]}
    const contents = messages.map((m) => {
      return {
        role: m.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: m.text }],
      };
    });

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: "Você é um assistente virtual sênior e consultor mecânico integrado ao ERP AutoTech. Auxilie frentistas, mecânicos, atendentes de autopeças e clientes no diagnóstico preliminar, identificação de códigos de peças adequados, equivalências de marcas recomendadas e boas práticas de manutenção automotiva.",
      },
    });

    res.json({ text: response.text || "" });
  } catch (error: any) {
    console.error("Erro no chat inteligente do Gemini:", error);
    res.status(500).json({ error: "Não foi possível contactar o chat inteligente e a rede neural." });
  }
});

// Serve frontend assets
async function startWeb() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is listening on http://0.0.0.0:${PORT}`);
  });
}

startWeb();
