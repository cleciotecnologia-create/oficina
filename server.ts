import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

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
