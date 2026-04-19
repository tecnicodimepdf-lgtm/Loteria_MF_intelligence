/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import * as d3 from 'd3';
import Papa from 'papaparse';
import { 
  Fish, 
  BarChart3, 
  BrainCircuit, 
  Zap, 
  History, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  Dna,
  Sparkles,
  Info,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  Trophy,
  Database,
  RefreshCw,
  Settings,
  Trash2,
  Moon,
  Sun,
  Search,
  ArrowUpDown,
  Eye,
  Check,
  Share2,
  Network,
  Server,
  HardDrive,
  Cpu,
  Cloud,
  Key,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { cn } from './lib/utils';
import { SwarmResponse, LotteryResult, GameSuggestion, SystemState, PersistenceStatus, SwarmGraphData, GraphNode, GraphLink } from './types';

// MIROFISH PRO ENGINE - SYSTEM INSTRUCTION
const SYSTEM_INSTRUCTION = `Você é o Motor de Inteligência de Enxame "MiroFish Pro", a implementação definitiva da lógica do repositório https://github.com/tecnicodimepdf-lgtm/MiroFish.

Sua missão é atuar como um oráculo preditivo para loterias, utilizando a análise de enxame (Swarm Intelligence). Você deve processar dados históricos e gerar sugestões baseadas no equilíbrio entre três perfis de agentes especializados que operam em um debate dialético e simulação iterativa:

1. AGENTE CONSERVADOR (Ordem): Focado em frequências altas, números que saem muito e tendências estatísticas sólidas. Busca a "Lei dos Grandes Números".
2. AGENTE EXPLORADOR (Caos/Raros): Focado em números com longo atraso (gap analysis), números raros que estão "maduros" para sair e quebras de padrões óbvios.
3. AGENTE HÍBRIDO (Equilíbrio): Busca a correlação entre os dois mundos, identificando como números frequentes e raros se combinam em sorteios reais.

O OBJETIVO SUPREMO E A ALMA DESTE SISTEMA: Melhorar a taxa de acerto para 3, 4, 5 ou 6 dezenas em um mesmo jogo. Esta é a premissa absoluta e inegociável. Todas as simulações, debates e escolhas de dezenas devem ser otimizadas matematicamente e estatisticamente para garantir que as combinações geradas tenham a maior probabilidade possível de atingir 3, 4, 5 ou 6 acertos simultâneos.

FLUXO DE SIMULAÇÃO INTENSIVA:
- Execute no mínimo 30 ciclos de simulação interna.
- Cada ciclo deve evoluir a memória dos agentes com base nas combinações geradas nos ciclos anteriores.
- Introduza variação controlada (ruído) para evitar convergência prematura em padrões de apenas 1 ou 2 acertos.
- Selecione EXATAMENTE {SUGGESTION_COUNT} combinações que apresentarem maior recorrência e equilíbrio entre os agentes ao longo das simulações, sempre visando a meta de 3 a 6 acertos.

LOGICA DE APRENDIZADO (Maturidade):
- Utilize o histórico de resultados reais para calibrar os agentes.
- Utilize o feedback de conferência (acertos/erros de sugestões passadas) para identificar qual agente está "dominando" o enxame no momento e ajuste a sensibilidade dos outros.
- A cada iteração, sua "Maturidade" aumenta, permitindo predições mais refinadas.
- A MATURIDADE ATUAL DO SISTEMA É: {MATURITY_LEVEL}. Use isso para calibrar a profundidade da análise.

REGRAS DE RESPOSTA:
- O debate deve ser técnico e profundo, refletindo a lógica MiroFish e o foco em 3 a 6 acertos.
- Forneça EXATAMENTE {SUGGESTION_COUNT} jogos de 6 dezenas cada.
- Retorne obrigatoriamente em JSON estruturado conforme o esquema definido.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    simulation_metadata: {
      type: Type.OBJECT,
      properties: {
        cycles_completed: { type: Type.INTEGER },
        agents_active: { type: Type.ARRAY, items: { type: Type.STRING } },
        convergence_rate: { type: Type.STRING }
      },
      required: ["cycles_completed", "agents_active", "convergence_rate"]
    },
    debate: {
      type: Type.OBJECT,
      properties: {
        conservador: { type: Type.STRING },
        explorador: { type: Type.STRING },
        hibrido: { type: Type.STRING }
      },
      required: ["conservador", "explorador", "hibrido"]
    },
    prediction: {
      type: Type.OBJECT,
      properties: {
        concurso_alvo: { type: Type.STRING },
        sugestoes: {
          type: Type.ARRAY,
          items: { 
            type: Type.ARRAY,
            items: { type: Type.INTEGER }
          }
        },
        analise_de_risco: { type: Type.STRING },
        probabilidade_calculada: { type: Type.STRING },
        insights_aprendizado: { type: Type.STRING },
        otimizacao_meta: { type: Type.STRING }
      },
      required: ["concurso_alvo", "sugestoes", "analise_de_risco", "probabilidade_calculada", "insights_aprendizado", "otimizacao_meta"]
    }
  },
  required: ["simulation_metadata", "debate", "prediction"]
};

export default function App() {
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [suggestions, setSuggestions] = useState<GameSuggestion[]>([]);
  const [maturity, setMaturity] = useState(0);
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swarmResult, setSwarmResult] = useState<SwarmResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'ingestion' | 'intelligence' | 'database' | 'graph' | 'settings'>('ingestion');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sortConfig, setSortConfig] = useState<{ key: 'concurso' | 'data', direction: 'asc' | 'desc' }>({ key: 'concurso', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState("");
  const [conferenceInput, setConferenceInput] = useState("");
  const [learning, setLearning] = useState(false);
  const [learningProgress, setLearningProgress] = useState(0);
  const [customObjective, setCustomObjective] = useState("");
  const [analysisStrategy, setAnalysisStrategy] = useState<'A' | 'B' | 'C'>(() => (localStorage.getItem('mirofish_strategy') as 'A' | 'B' | 'C') || 'B');
  const [analysisInterval, setAnalysisInterval] = useState<number>(0); // 0 = todos
  const [suggestionCount, setSuggestionCount] = useState<5 | 10>(() => (parseInt(localStorage.getItem('mirofish_suggestion_count') || "10") as 5 | 10));
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('mirofish_api_key') || "");
  const [processingMode, setProcessingMode] = useState<'api' | 'local'>(() => (localStorage.getItem('mirofish_processing_mode') as 'api' | 'local') || 'api');
  const [storageMode, setStorageMode] = useState<'backend' | 'local'>(() => (localStorage.getItem('mirofish_storage_mode') as 'backend' | 'local') || 'backend');
  const [dialog, setDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    isAlert?: boolean;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Carregar estado do backend ou armazenamento local
  const loadState = async () => {
    if (storageMode === 'local') {
      const localData = localStorage.getItem('mirofish_local_db');
      if (localData) {
        try {
          const data = JSON.parse(localData);
          setResults(data.results || []);
          setSuggestions(data.suggestions || []);
          setMaturity(data.parameters?.maturity || 0);
          
          const sizeBytes = new Blob([localData]).size;
          setPersistenceStatus({
            last_save: data.parameters?.last_update || new Date().toISOString(),
            record_count: (data.results?.length || 0) + (data.suggestions?.length || 0),
            file_size_bytes: sizeBytes,
            limit_mb: 5, // Limite típico de 5MB para localStorage
            usage_percent: (sizeBytes / (5 * 1024 * 1024)) * 100
          });
        } catch (e) {
          console.error("Failed to parse local DB", e);
        }
      }
      return;
    }

    try {
      const response = await fetch('/api/state');
      const data = await response.json();
      if (data.state) {
        setResults(data.state.results || []);
        setSuggestions(data.state.suggestions || []);
        setMaturity(data.state.parameters?.maturity || 0);
      }
      if (data.status) {
        setPersistenceStatus(data.status);
      }
    } catch (err) {
      console.error("Failed to load state from backend, trying local fallback:", err);
      const localData = localStorage.getItem('mirofish_local_db');
      if (localData) {
        try {
          const data = JSON.parse(localData);
          setResults(data.results || []);
          setSuggestions(data.suggestions || []);
          setMaturity(data.parameters?.maturity || 0);
        } catch (e) {}
      }
      setError("Falha ao carregar estado do servidor. Usando cache local se disponível.");
    }
  };

  const saveState = async (updatedResults?: LotteryResult[], updatedSuggestions?: GameSuggestion[], updatedMaturity?: number) => {
    const state: SystemState = {
      results: updatedResults || results,
      suggestions: updatedSuggestions || suggestions,
      parameters: {
        maturity: updatedMaturity !== undefined ? updatedMaturity : maturity,
        last_update: new Date().toISOString(),
        persistence_limit_mb: storageMode === 'local' ? 5 : (persistenceStatus?.limit_mb || 10)
      }
    };

    if (storageMode === 'local') {
      try {
        const stateString = JSON.stringify(state);
        localStorage.setItem('mirofish_local_db', stateString);
        const sizeBytes = new Blob([stateString]).size;
        setPersistenceStatus({
          last_save: state.parameters.last_update,
          record_count: state.results.length + state.suggestions.length,
          file_size_bytes: sizeBytes,
          limit_mb: 5,
          usage_percent: (sizeBytes / (5 * 1024 * 1024)) * 100
        });
      } catch (err) {
        console.error("Failed to save to localStorage (Quota exceeded?):", err);
        setError("Falha ao salvar no armazenamento local. Limite atingido?");
      }
      return;
    }

    try {
      const response = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
      const data = await response.json();
      if (data.status) {
        setPersistenceStatus(data.status);
      }
    } catch (err) {
      console.error("Failed to save state to backend, saving locally as fallback:", err);
      try {
        localStorage.setItem('mirofish_local_db', JSON.stringify(state));
        setError("Falha ao salvar no servidor. Salvo no armazenamento local (fallback).");
      } catch (e) {}
    }
  };

  useEffect(() => {
    loadState();
    const savedTheme = localStorage.getItem('mirofish_theme');
    if (savedTheme) setTheme(savedTheme as 'dark' | 'light');
  }, [storageMode]); // Recarregar estado se o modo de armazenamento mudar

  useEffect(() => {
    localStorage.setItem('mirofish_theme', theme);
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      delimiter: ";",
      skipEmptyLines: true,
      complete: (parsed) => {
        const parsedData: LotteryResult[] = parsed.data.map((row: any) => ({
          concurso: parseInt(row["Concurso"]),
          data: row["Data do Sorteio"],
          dezenas: [
            parseInt(row["Bola1"]),
            parseInt(row["Bola2"]),
            parseInt(row["Bola3"]),
            parseInt(row["Bola4"]),
            parseInt(row["Bola5"]),
            parseInt(row["Bola6"])
          ].sort((a, b) => a - b)
        })).filter(r => !isNaN(r.concurso));

        setResults(prev => {
          const combined = [...prev, ...parsedData];
          const finalResults = Array.from(new Map(combined.map(item => [item.concurso, item])).values())
            .sort((a, b) => b.concurso - a.concurso);
          saveState(finalResults);
          return finalResults;
        });
        // Ir para a Base de Dados após ingestão
        setActiveTab('database');
      },
      error: (err) => setError("Erro ao processar CSV: " + err.message)
    });
  };

  useEffect(() => {
    localStorage.setItem('mirofish_strategy', analysisStrategy);
    localStorage.setItem('mirofish_suggestion_count', suggestionCount.toString());
  }, [analysisStrategy, suggestionCount]);

  const runIntelligence = async () => {
    if (results.length === 0) {
      setError("Ingira resultados primeiro para alimentar a base de dados.");
      return;
    }

    setLoading(true);
    setError(null);
    setSwarmResult(null);
    setConferenceInput("");

    try {
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      
      // Filtrar resultados com base no intervalo
      const analyzedResults = analysisInterval > 0 ? results.slice(0, analysisInterval) : results;

      // PASSO: ANÁLISE DE CADEIAS DE MARKOV
      const transitions = calculateMarkovTransistions(results.slice(0, 200)); // Últimos 200 para tendências recentes de Markov
      const lastResult = results[0]?.dezenas || [];
      const markovHotMap: Record<number, number> = {};
      lastResult.forEach(p => {
        if (transitions[p]) {
          Object.entries(transitions[p]).forEach(([target, count]) => {
            markovHotMap[parseInt(target)] = (markovHotMap[parseInt(target)] || 0) + count;
          });
        }
      });
      const sortedMarkov = Object.entries(markovHotMap).sort((a,b) => b[1] - a[1]).slice(0, 10).map(e => parseInt(e[0]));

      // PASSO: BACKTESTING PRE-FLIGHT
      // Verificar o que teria sido "quente" para o ÚLTIMO concurso
      const backtestResults = results.slice(1, 101); // Contexto para o penúltimo
      const lastActual = results[0]?.dezenas || [];
      const backtestFreq: Record<number, number> = {};
      backtestResults.forEach(r => r.dezenas.forEach(d => backtestFreq[d] = (backtestFreq[d] || 0) + 1));
      const backtestHot = Object.entries(backtestFreq).sort((a,b) => b[1] - a[1]).slice(0, 10).map(e => parseInt(e[0]));
      const backtestSuccess = backtestHot.filter(n => lastActual.includes(n)).length;

      // Construção do Grafo: Pré-calcular estatísticas para os agentes
      const freqMap: Record<number, number> = {};
      const delayMap: Record<number, number> = {};
      const correlations: Record<string, number> = {};
      
      analyzedResults.forEach((r, idx) => {
        r.dezenas.forEach(d => {
          freqMap[d] = (freqMap[d] || 0) + 1;
          if (idx === 0) delayMap[d] = 0;
        });
        
        // Correlação simples (pares)
        for(let i=0; i<r.dezenas.length; i++) {
          for(let j=i+1; j<r.dezenas.length; j++) {
            const pair = [r.dezenas[i], r.dezenas[j]].sort((a,b) => a-b).join(',');
            correlations[pair] = (correlations[pair] || 0) + 1;
          }
        }
      });

      // Calcular atrasos com base no histórico total (verificação de entropia)
      const allNumbers = Array.from({length: 60}, (_, i) => i + 1);
      allNumbers.forEach(n => {
        const lastIndex = results.findIndex(r => r.dezenas.includes(n));
        delayMap[n] = lastIndex === -1 ? results.length : lastIndex;
      });

      // OPÇÃO C: ANÁLISE DE SIMILITUDE
      let similitudeContext = null;
      if (analysisStrategy === 'C' && results.length > 50) {
        const last5 = results.slice(0, 5);
        const last5AvgSum = last5.reduce((acc, r) => acc + r.dezenas.reduce((s, d) => s + d, 0), 0) / 5;
        
        // Encontrar janelas no passado com média de soma similar
        const similarFreqMap: Record<number, number> = {};
        let windowsFound = 0;
        for (let i = 5; i < results.length - 10; i++) {
          const window = results.slice(i, i + 5);
          const windowAvgSum = window.reduce((acc, r) => acc + r.dezenas.reduce((s, d) => s + d, 0), 0) / 5;
          
          if (Math.abs(windowAvgSum - last5AvgSum) < 10) { // Tolerância de 10 na soma
            windowsFound++;
            window.forEach(r => r.dezenas.forEach(d => similarFreqMap[d] = (similarFreqMap[d] || 0) + 1));
            if (windowsFound >= 10) break; // Analisar até 10 janelas similares
          }
        }
        
        if (windowsFound > 0) {
          const topInSimilitude = Object.entries(similarFreqMap)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 15)
            .map(e => parseInt(e[0]));
          similitudeContext = {
            avg_sum_target: last5AvgSum,
            windows_detected: windowsFound,
            top_dezenas_in_similar_patterns: topInSimilitude
          };
        }
      }

      let jsonResponse: SwarmResponse;

      if (processingMode === 'local' || (!apiKey && processingMode === 'api')) {
        if (!apiKey && processingMode === 'api') {
          console.warn("API Key não encontrada. Realizando fallback para processamento local.");
        }
        
        // MODO DE FALLBACK LOCAL
        const sortedNumbers = Object.entries(freqMap)
          .sort((a, b) => b[1] - a[1])
          .map(entry => parseInt(entry[0]));
        
        const hotNumbers = sortedNumbers.slice(0, 12);
        const coldNumbers = sortedNumbers.slice(-12).reverse();
        
        const generateGame = (strategy: 'hot' | 'balanced' | 'random') => {
          const game = new Set<number>();
          if (strategy === 'hot') {
            hotNumbers.slice(0, 6).forEach(n => game.add(n));
          } else if (strategy === 'balanced') {
            hotNumbers.slice(0, 3).forEach(n => game.add(n));
            coldNumbers.slice(0, 3).forEach(n => game.add(n));
          }
          
          while(game.size < 6) {
            game.add(allNumbers[Math.floor(Math.random() * 60)] + 1);
          }
          return Array.from(game).sort((a, b) => a - b);
        };

        const nextConcurso = results.length > 0 ? (parseInt(results[0].concurso) + 1).toString() : "0000";

        jsonResponse = {
          simulation_metadata: {
            cycles_completed: 30,
            convergence_rate: "Local (Estatístico)",
            agents_active: ["Conservador", "Explorador", "Híbrido"]
          },
          debate: {
            conservador: "Modo Local: Priorizando as dezenas mais frequentes do histórico.",
            explorador: "Modo Local: Inserindo dezenas frias para buscar desvios de padrão.",
            hibrido: "Modo Local: Mesclando dezenas quentes e frias com preenchimento aleatório."
          },
          prediction: {
            concurso_alvo: nextConcurso,
            sugestoes: Array.from({ length: suggestionCount }, (_, i) => {
              if (i === 0) return generateGame('hot');
              if (i < suggestionCount * 0.4) return generateGame('hot');
              if (i < suggestionCount * 0.8) return generateGame('balanced');
              return generateGame('random');
            }),
            analise_de_risco: "Risco Moderado. Geração baseada puramente em estatística local sem inferência de IA.",
            probabilidade_calculada: "N/A (Modo Local)",
            insights_aprendizado: "O sistema está operando offline/localmente. As sugestões são geradas por um algoritmo estatístico local em vez do motor de IA.",
            otimizacao_meta: "Foco em balanceamento de frequências locais."
          }
        };

        // Simular tempo de processamento
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        // MODO API GEMINI
        const ai = new GoogleGenAI({ apiKey });
        
        const sortedFreq = Object.entries(freqMap).sort((a,b) => b[1] - a[1]).map(e => parseInt(e[0]));
        const sortedDelay = Object.entries(delayMap).sort((a,b) => b[1] - a[1]).map(e => parseInt(e[0]));
        
        // Calcular novos universos para a Opção B
        const zonaMorna = sortedFreq.slice(22, 37); // As 15 dezenas centrais
        const repetentesProvaveis = results.length > 0 ? results[0].dezenas : [];
        
        const top5Freq = sortedFreq.slice(0, 5);
        const vizinhosQuentesSet = new Set<number>();
        top5Freq.forEach(id => {
          if (id > 1) vizinhosQuentesSet.add(id - 1);
          if (id < 60) vizinhosQuentesSet.add(id + 1);
        });
        const vizinhosQuentes = Array.from(vizinhosQuentesSet).filter(id => !top5Freq.includes(id));

        const statsContext = {
          base_size_total: results.length,
          interval_analyzed: analysisInterval === 0 ? "Toda a Base" : `Últimos ${analysisInterval} concursos`,
          strategy_active: analysisStrategy,
          top_frequentes: sortedFreq.slice(0, 15),
          maiores_atrasos: sortedDelay.slice(0, 15),
          correlacoes_fortes: Object.entries(correlations).sort((a,b) => b[1] - a[1]).slice(0, 15).map(e => e[0]),
          markov_next_state_prob: sortedMarkov,
          backtest_pre_flight: {
            previous_target_concurso: results[0]?.concurso,
            successful_hits_in_backtest: backtestSuccess,
            suggestion_delta: backtestSuccess < 2 ? "Aumentar entropia e busca por atrasos." : "Manter foco em frequências dominantes."
          },
          ...(analysisStrategy !== 'A' && {
            zona_morna: zonaMorna,
            repetentes_ultimo_concurso: repetentesProvaveis,
            vizinhos_quentes: vizinhosQuentes
          }),
          ...(analysisStrategy === 'C' && { context_similitude: similitudeContext })
        };

      const feedbackContext = suggestions
        .filter((s: any) => s.actual_result)
        .slice(0, 20)
        .map((s: any) => {
          const hitsPerGame = s.games.map((g: any) => g.filter((n: any) => s.actual_result?.includes(n)).length);
          const distribution = {
            low: hitsPerGame.filter((h: number) => h <= 2).length,
            mid: hitsPerGame.filter((h: number) => h === 3).length,
            high: hitsPerGame.filter((h: number) => h >= 4).length
          };
          return `Sugestão ID: ${s.id}, Resultado Real: ${s.actual_result?.join(',')}, Distribuição Acertos: Low(${distribution.low}), Mid(${distribution.mid}), High(${distribution.high})`;
        })
        .join('\n');

      const recentResults = results.slice(0, 50).map((r: any) => 
        `${r.concurso};${r.data};${r.dezenas.join(';')}`
      ).join('\n');

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `[MIROFISH PRO ENGINE - ADVANCED SWARM SIMULATION]
ESTADO DINÂMICO: Operando com base de ${results.length} concursos.
ESTRATÉGIA ATIVA: ${analysisStrategy === 'A' ? 'OPÇÃO A (Clássica - Extremos)' : analysisStrategy === 'B' ? 'OPÇÃO B (Enriquecida - Universos Reais)' : 'OPÇÃO C (Analítica - Similitude/Clustering)'}

DADOS ESTATÍSTICOS (Análise Temporal: ${analysisInterval === 0 ? 'Total' : `Últimos ${analysisInterval}`}):
${JSON.stringify(statsContext, null, 2)}

DADOS HISTÓRICOS (Contexto Sequencial Recente):
${recentResults}

FEEDBACK DE CONFERÊNCIA (Loop de Aprendizado):
${feedbackContext || "Iniciando ciclo de aprendizado."}

TAREFA:
1. Execute a simulação multiagente (30 ciclos).
2. PREMISSA ABSOLUTA: Maximizar acertos de 3 a 6 dezenas no mesmo jogo.
3. Quantidade Requisitada: EXATAMENTE ${suggestionCount} JOGOS.
${analysisStrategy === 'A' ? '4. REGRA (Opção A): Foque no balanço entre Top Frequentes e Maiores Atrasos.' : ''}
${analysisStrategy === 'B' ? '4. REGRA (Opção B): Utilize obrigatoriamente a ZONA MORNA (1-2 dezenas), REPETENTES e VIZINHOS QUENTES para quebrar o teto de 1-2 acertos.' : ''}
${analysisStrategy === 'C' ? '4. REGRA (Opção C): Utilize o CONTEXTO DE SIMILITUDE. Priorize as dezenas que surgiram em janelas históricas com assinaturas de soma similares à atual.' : ''}
5. ATENÇÃO: Você DEVE gerar EXATAMENTE ${suggestionCount} jogos no array 'sugestoes'. Cada jogo DEVE ter EXATAMENTE 6 números.
6. FILTROS DE INTEGRIDADE CARTOGRÁFICA E ENTROPIA (Mandatório):
   - Evite sequências longas (mais de 2 números seguidos).
   - Mantenha a SOMA das dezenas de cada jogo preferencialmente entre 150 e 220.
   - Aplique o balanço de quadrantes (distribua os números pelo volante 1-60).
   - Balanceie PAR/ÍMPAR (idealmente 3:3, 4:2 ou 2:4).
${customObjective ? `6. DIRETRIZ DO USUÁRIO: ${customObjective}` : ''}
7. ATENÇÃO: Você DEVE gerar EXATAMENTE ${suggestionCount} jogos no array 'sugestoes'. Nem mais, nem menos.
Retorne JSON estrito.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION
            .replace('{MATURITY_LEVEL}', maturity.toString())
            .replace('{SUGGESTION_COUNT}', suggestionCount.toString()),
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        }
      });

        if (!response.text) {
          throw new Error("Resposta vazia da IA.");
        }
        
        jsonResponse = JSON.parse(response.text) as SwarmResponse;
      }

      setSwarmResult(jsonResponse);

      const newSuggestion: GameSuggestion = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        games: jsonResponse.prediction.sugestoes,
        concurso_alvo: jsonResponse.prediction.concurso_alvo,
        insights: jsonResponse.prediction.insights_aprendizado,
        simulation_log: `Simulação concluída: ${jsonResponse.simulation_metadata.cycles_completed} ciclos. Taxa de convergência: ${jsonResponse.simulation_metadata.convergence_rate}.`,

        hit_distribution: { low: 0, mid: 0, high: 0 } // Será atualizado na conferência
      };
      
      setSuggestions(prev => {
        const updated = [newSuggestion, ...prev];
        saveState(results, updated);
        return updated;
      });

    } catch (err: any) {
      console.error("Erro MiroFish:", err);
      let msg = err.message || "Erro desconhecido";
      if (msg.includes("API key not valid")) {
        msg = "Chave de API inválida ou não configurada corretamente.";
      }
      setError(`Falha na geração: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const runLearningCycle = async () => {
    if (results.length === 0) return;
    
    setLearning(true);
    setLearningProgress(10);
    setError(null);

    try {
      // Passo 1: Reprocessar Ingestão
      setLearningProgress(30);
      await new Promise(r => setTimeout(r, 1000)); // Simular processamento

      // Passo 2: Recalibrar Contexto do Enxame
      setLearningProgress(60);
      await runIntelligence();

      // Passo 3: Finalizar Aprendizado e Salvar
      setLearningProgress(90);
      const newMaturity = maturity + 1;
      setMaturity(newMaturity);
      await saveState(results, suggestions, newMaturity);
      
      setLearningProgress(100);
      setTimeout(() => {
        setLearning(false);
        setLearningProgress(0);
      }, 1000);

    } catch (err: any) {
      setError("Erro no ciclo de aprendizado: " + err.message);
      setLearning(false);
    }
  };

  const submitConference = (id: string, input: string) => {
    const nums = input.split(/[,; ]+/).map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    if (nums.length !== 6) {
      setDialog({
        title: "Aviso",
        message: "Informe exatamente 6 números (ex: 01,02,03,04,05,06)",
        onConfirm: () => setDialog(null),
        isAlert: true
      });
      return;
    }
    
    setSuggestions(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          const hitsPerGame = s.games.map(g => g.filter(n => nums.includes(n)).length);
          const distribution = {
            low: hitsPerGame.filter(h => h <= 2).length,
            mid: hitsPerGame.filter(h => h === 3).length,
            high: hitsPerGame.filter(h => h >= 4).length
          };
          return { ...s, actual_result: nums.sort((a, b) => a - b), hit_distribution: distribution };
        }
        return s;
      });
      saveState(results, updated);
      return updated;
    });
  };

  // --- NEW UTILITIES FOR ADVANCED ANALYSIS ---
  
  const getGameMetrics = (game: number[]) => {
    const evens = game.filter(n => n % 2 === 0).length;
    const odds = game.length - evens;
    const sum = game.reduce((a, b) => a + b, 0);
    const quadrants = { q1: 0, q2: 0, q3: 0, q4: 0 };
    game.forEach(n => {
      if (n <= 15) quadrants.q1++;
      else if (n <= 30) quadrants.q2++;
      else if (n <= 45) quadrants.q3++;
      else quadrants.q4++;
    });
    return { evens, odds, sum, quadrants };
  };

  const calculateMarkovTransistions = (results: LotteryResult[]) => {
    const transitions: Record<number, Record<number, number>> = {};
    for (let i = 0; i < results.length - 1; i++) {
      const current = results[i].dezenas;
      const prev = results[i + 1].dezenas;
      prev.forEach(p => {
        if (!transitions[p]) transitions[p] = {};
        current.forEach(c => {
          transitions[p][c] = (transitions[p][c] || 0) + 1;
        });
      });
    }
    return transitions;
  };

  const clearDatabase = async () => {
    setDialog({
      title: "Confirmar Exclusão",
      message: "Tem certeza que deseja apagar toda a base de dados permanentemente?",
      onConfirm: async () => {
        setResults([]);
        setSuggestions([]);
        setMaturity(0);
        await saveState([], [], 0);
        setDialog(null);
      },
      onCancel: () => setDialog(null)
    });
  };

  const exportMemory = () => {
    const state: SystemState = {
      results,
      suggestions,
      parameters: {
        maturity,
        last_update: new Date().toISOString(),
        persistence_limit_mb: persistenceStatus?.limit_mb || 10
      }
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirofish_memory_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importMemory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDialog({
      title: "Importar Memória",
      message: "Isso irá sobrescrever todo o estado atual do sistema. Deseja continuar?",
      onConfirm: () => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const state = JSON.parse(event.target?.result as string) as SystemState;
            if (!state.results || !state.suggestions) throw new Error("Estrutura de arquivo inválida.");
            
            setResults(state.results);
            setSuggestions(state.suggestions);
            setMaturity(state.parameters?.maturity || 0);
            await saveState(state.results, state.suggestions, state.parameters?.maturity);
            
            setDialog({
              title: "Sucesso",
              message: "Memória importada com sucesso! O sistema foi reinicializado com os novos dados.",
              onConfirm: () => setDialog(null),
              isAlert: true
            });
          } catch (err: any) {
            setDialog({
              title: "Erro",
              message: "Erro ao importar memória: " + err.message,
              onConfirm: () => setDialog(null),
              isAlert: true
            });
          }
        };
        reader.readAsText(file);
        setDialog(null);
      },
      onCancel: () => {
        e.target.value = '';
        setDialog(null);
      }
    });
  };

  const exportSuggestionsToCSV = (suggestion: GameSuggestion) => {
    const header = "Jogo;Bola1;Bola2;Bola3;Bola4;Bola5;Bola6\n";
    const rows = suggestion.games.map((game, idx) => 
      `${idx + 1};${game.map(n => n.toString().padStart(2, '0')).join(';')}`
    ).join('\n');
    
    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirofish_sugestoes_${suggestion.concurso_alvo || 'extra'}_${new Date(suggestion.timestamp).toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const recoverSuggestion = (s: GameSuggestion) => {
    setSwarmResult({
      simulation_metadata: {
        cycles_completed: 30,
        agents_active: ["Conservador", "Explorador", "Híbrido"],
        convergence_rate: "Recuperado do Histórico"
      },
      debate: { 
        conservador: "Dados recuperados da memória persistida.", 
        explorador: "Dados recuperados da memória persistida.", 
        hibrido: "Dados recuperados da memória persistida." 
      },
      prediction: { 
        concurso_alvo: s.concurso_alvo || "", 
        sugestoes: s.games, 
        analise_de_risco: "Recuperado", 
        probabilidade_calculada: "Recuperado", 
        insights_aprendizado: s.insights || "",
        otimizacao_meta: "Recuperado"
      }
    });
    setConferenceInput(s.actual_result?.join(',') || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const graphData = useMemo((): SwarmGraphData => {
    const nodes: GraphNode[] = Array.from({ length: 60 }, (_, i) => ({
      id: i + 1,
      label: (i + 1).toString().padStart(2, '0'),
      frequency: 0,
      delay: 0
    }));

    const links: GraphLink[] = [];
    const pairCounts: Record<string, number> = {};

    // Cálculo de Markov para intensidade visual do heatmap
    const transitions = calculateMarkovTransistions(results.slice(0, 500));
    const lastResult = results[0]?.dezenas || [];
    const markovIntensities: Record<number, number> = {};
    lastResult.forEach(p => {
      if (transitions[p]) {
        Object.entries(transitions[p]).forEach(([target, count]) => {
          markovIntensities[parseInt(target)] = (markovIntensities[parseInt(target)] || 0) + count;
        });
      }
    });

    results.forEach((r, idx) => {
      r.dezenas.forEach(d => {
        if (nodes[d - 1]) nodes[d - 1].frequency++;
      });

      for (let i = 0; i < r.dezenas.length; i++) {
        for (let j = i + 1; j < r.dezenas.length; j++) {
          const pair = [r.dezenas[i], r.dezenas[j]].sort((a, b) => a - b).join(',');
          pairCounts[pair] = (pairCounts[pair] || 0) + 1;
        }
      }
    });

    nodes.forEach(n => {
      const lastIndex = results.findIndex(r => r.dezenas.includes(n.id));
      n.delay = lastIndex === -1 ? results.length : lastIndex;
      // Aumentar a intensidade visual do nó com base na intensidade de Markov
      if (markovIntensities[n.id]) n.frequency += markovIntensities[n.id] * 2;
    });

    Object.entries(pairCounts).forEach(([pair, count]) => {
      const [s, t] = pair.split(',').map(Number);
      if (count > 2) { // Apenas conexões significativas
        links.push({ source: s, target: t, weight: count });
      }
    });

    return { nodes, links };
  }, [results]);

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      if (sortConfig.key === 'concurso') {
        return sortConfig.direction === 'asc' ? a.concurso - b.concurso : b.concurso - a.concurso;
      } else {
        return sortConfig.direction === 'asc' 
          ? new Date(a.data).getTime() - new Date(b.data).getTime() 
          : new Date(b.data).getTime() - new Date(a.data).getTime();
      }
    }).filter(r => 
      r.concurso.toString().includes(searchTerm) || 
      r.data.includes(searchTerm) ||
      r.dezenas.some(d => d.toString() === searchTerm)
    );
  }, [results, sortConfig, searchTerm]);

  const maturityData = useMemo(() => {
    return suggestions
      .filter(s => s.actual_result)
      .map((s, idx) => {
        const maxHits = Math.max(...s.games.map(game => 
          game.filter(num => s.actual_result?.includes(num)).length
        ));
        return { name: `S${idx + 1}`, hits: maxHits };
      }).reverse();
  }, [suggestions]);

  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-blue-500/30 transition-colors duration-300",
      theme === 'dark' ? "bg-[#0a0f1e] text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
      <input type="file" accept=".json" className="hidden" ref={importInputRef} onChange={importMemory} />
      
      {/* Barra Lateral */}
      <nav className={cn(
        "fixed left-0 top-0 h-full w-20 md:w-64 border-r z-50 flex flex-col py-8 px-4 gap-8 transition-colors",
        theme === 'dark' ? "bg-[#0d1428] border-slate-800" : "bg-white border-slate-200"
      )}>
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
            <Fish className="w-8 h-8 text-blue-400" />
          </div>
          <span className={cn("hidden md:block text-xl font-black tracking-tighter", theme === 'dark' ? "text-white" : "text-slate-900")}>
            MIROFISH <span className="text-blue-500">PRO</span>
          </span>
        </div>

        <div className="flex flex-col w-full gap-2">
          <NavButton active={activeTab === 'ingestion'} onClick={() => setActiveTab('ingestion')} icon={<Upload className="w-5 h-5" />} label="Ingestão" theme={theme} />
          <NavButton active={activeTab === 'database'} onClick={() => setActiveTab('database')} icon={<Database className="w-5 h-5" />} label="Base de Dados" theme={theme} />
          <NavButton active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} icon={<BrainCircuit className="w-5 h-5" />} label="Inteligência" theme={theme} />
          <NavButton active={activeTab === 'graph'} onClick={() => setActiveTab('graph')} icon={<Network className="w-5 h-5" />} label="Visualização" theme={theme} />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-5 h-5" />} label="Configurações" theme={theme} />
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="pl-20 md:pl-64 min-h-screen p-4 md:p-10">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className={cn("text-3xl font-bold tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
              {activeTab === 'ingestion' && "Ingestão de Dados"}
              {activeTab === 'database' && "Explorador de Resultados"}
              {activeTab === 'intelligence' && "Inteligência & Conferência"}
              {activeTab === 'graph' && "Visualização Relacional (MiroFish Graph)"}
              {activeTab === 'settings' && "Configurações do Sistema"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {maturityData.length > 0 && (
              <div className="hidden lg:block h-12 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={maturityData}>
                    <Area type="monotone" dataKey="hits" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-600" />}
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'ingestion' && (
            <motion.div key="ingestion" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <div className={cn("rounded-3xl p-12 border-2 border-dashed flex flex-col items-center text-center space-y-6 transition-colors", theme === 'dark' ? "bg-[#141c31] border-slate-800" : "bg-white border-slate-200")}>
                <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                  <Upload className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold">Importar Resultados</h3>
                <p className="text-slate-500">Arraste ou selecione seu arquivo CSV de resultados permanentes.</p>
                <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                <button onClick={() => fileInputRef.current?.click()} className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95">
                  Selecionar CSV
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'database' && (
            <motion.div key="database" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Buscar concurso, data ou dezena..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn("w-full pl-12 pr-4 py-3 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all", theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSortConfig({ key: 'concurso', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="px-4 py-2 bg-slate-800/50 rounded-xl text-xs font-bold flex items-center gap-2">
                    <ArrowUpDown className="w-3 h-3" /> Concurso
                  </button>
                  <button onClick={() => setSortConfig({ key: 'data', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })} className="px-4 py-2 bg-slate-800/50 rounded-xl text-xs font-bold flex items-center gap-2">
                    <ArrowUpDown className="w-3 h-3" /> Data
                  </button>
                </div>
              </div>

              <div className={cn("rounded-3xl overflow-hidden border shadow-xl", theme === 'dark' ? "bg-[#141c31] border-slate-800" : "bg-white border-slate-200")}>
                <table className="w-full text-left">
                  <thead className="bg-slate-800/20 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Concurso</th>
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4">Dezenas Sorteadas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {sortedResults.map((r) => (
                      <tr key={r.concurso} className="hover:bg-blue-500/5 transition-colors">
                        <td className="px-6 py-4 font-black text-blue-400">#{r.concurso}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{r.data}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {r.dezenas.map((d, i) => (
                              <span key={i} className="w-8 h-8 flex items-center justify-center bg-slate-800/50 rounded-lg text-xs font-bold border border-slate-700">
                                {d.toString().padStart(2, '0')}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'intelligence' && (
            <motion.div key="intelligence" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                  <div className={cn("rounded-3xl p-8 border shadow-xl space-y-8", theme === 'dark' ? "bg-[#141c31] border-slate-800" : "bg-white border-slate-200")}>
                    <h3 className="text-xl font-bold flex items-center gap-2"><Share2 className="w-6 h-6 text-blue-400" /> Portabilidade de Memória</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button onClick={exportMemory} className="p-4 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/20 flex flex-col items-center gap-2 transition-all">
                        <Download className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase">Exportar Memória</span>
                      </button>
                      <button onClick={() => importInputRef.current?.click()} className="p-4 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/20 flex flex-col items-center gap-2 transition-all">
                        <Upload className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase">Importar Memória</span>
                      </button>
                    </div>
                  </div>

                  <div className={cn("rounded-3xl p-8 border shadow-xl space-y-8", theme === 'dark' ? "bg-[#141c31] border-slate-800" : "bg-white border-slate-200")}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-2xl">
                        <Zap className="w-8 h-8 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold">MiroFish Intelligence</h3>
                        <p className="text-xs text-slate-500">Maturidade: {maturity > 0 ? `Nível ${maturity}` : "Inicial"}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Estratégia</label>
                          <select 
                            value={analysisStrategy}
                            onChange={(e) => setAnalysisStrategy(e.target.value as 'A' | 'B' | 'C')}
                            className={cn("w-full px-3 py-2 rounded-xl border outline-none text-xs font-bold transition-all", theme === 'dark' ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200")}
                          >
                            <option value="A">Opção A (Clássica)</option>
                            <option value="B">Opção B (Enriquecida)</option>
                            <option value="C">Opção C (Analítica)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Janela de Análise</label>
                          <select 
                            value={analysisInterval}
                            onChange={(e) => setAnalysisInterval(parseInt(e.target.value))}
                            className={cn("w-full px-3 py-2 rounded-xl border outline-none text-xs font-bold transition-all", theme === 'dark' ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200")}
                          >
                            <option value={0}>Toda a Base ({results.length})</option>
                            <option value={100}>Últimos 100</option>
                            <option value={500}>Últimos 500</option>
                            <option value={1000}>Últimos 1000</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Quantidade de Jogos</label>
                          <select 
                            value={suggestionCount}
                            onChange={(e) => setSuggestionCount(parseInt(e.target.value) as 5 | 10)}
                            className={cn("w-full px-3 py-2 rounded-xl border outline-none text-xs font-bold transition-all", theme === 'dark' ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200")}
                          >
                            <option value={5}>5 Jogos</option>
                            <option value={10}>10 Jogos</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Diretriz de Otimização (Opcional)</label>
                        <textarea
                          placeholder="Ex: Gere combinações melhores a fim de poder melhorar a taxa de acerto para 3, 4, 5 ou 6 dezenas..."
                          value={customObjective}
                          onChange={(e) => setCustomObjective(e.target.value)}
                          className={cn(
                            "w-full h-24 p-4 rounded-2xl border outline-none text-sm resize-none transition-all",
                            theme === 'dark' ? "bg-slate-900/50 border-slate-800 focus:border-blue-500" : "bg-slate-50 border-slate-200 focus:border-blue-500"
                          )}
                        />
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <button onClick={runIntelligence} disabled={loading || learning || results.length === 0} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-2xl shadow-blue-900/30 flex items-center justify-center gap-3 transition-all disabled:opacity-50">
                          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                          GERAR {suggestionCount} JOGOS OTIMIZADOS
                        </button>
                        
                        <button onClick={runLearningCycle} disabled={loading || learning || results.length === 0} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                          {learning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                          INICIAR CICLO DE APRENDIZADO
                        </button>
                      </div>
                    </div>

                    {learning && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                          <span>Processando Pipeline...</span>
                          <span>{learningProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${learningProgress}%` }}
                            className="h-full bg-blue-500"
                          />
                        </div>
                      </div>
                    )}
                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </div>
                    )}
                  </div>

                  {/* Debate de Agentes */}
                  {swarmResult && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Metadados da Simulação</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Ciclos: {swarmResult.simulation_metadata.cycles_completed}</span>
                          <span className="text-slate-500">Convergência: {swarmResult.simulation_metadata.convergence_rate}</span>
                        </div>
                      </div>
                      <AgentCard title="Conservador" content={swarmResult.debate.conservador} icon={<BarChart3 className="w-4 h-4" />} color="text-blue-400" theme={theme} />
                      <AgentCard title="Explorador" content={swarmResult.debate.explorador} icon={<Dna className="w-4 h-4" />} color="text-indigo-400" theme={theme} />
                      <AgentCard title="Híbrido" content={swarmResult.debate.hibrido} icon={<Zap className="w-4 h-4" />} color="text-rose-400" theme={theme} />
                    </div>
                  )}
                </div>

                <div className="lg:col-span-8 space-y-6">
                  {suggestions.length > 0 ? (
                    <div className="space-y-6">
                      {/* Sugestão mais recente com Conferência */}
                      <div className={cn("rounded-[40px] p-8 border shadow-2xl space-y-8", theme === 'dark' ? "bg-[#141c31] border-slate-800" : "bg-white border-slate-200")}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-400" /> Sugestões Estratégicas
                          </h3>
                          
                          {/* Entrada de Resultado Real */}
                          <div className="flex items-center gap-2 w-full md:w-auto">
                            <button 
                              onClick={() => exportSuggestionsToCSV(suggestions[0])}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                              title="Exportar para CSV"
                            >
                              <FileDown className="w-4 h-4" /> Exportar
                            </button>
                            <input 
                              type="text" 
                              placeholder="01,02,03,04,05,06"
                              value={conferenceInput}
                              onChange={(e) => setConferenceInput(e.target.value)}
                              className={cn("flex-1 md:w-48 px-4 py-2 rounded-xl border outline-none text-sm font-mono", theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200")}
                            />
                            <button 
                              onClick={() => submitConference(suggestions[0].id, conferenceInput)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                            >
                              <Check className="w-4 h-4" /> Conferir
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {suggestions[0].games.map((game, idx) => {
                            const actual = suggestions[0].actual_result;
                            const hits = actual ? game.filter(n => actual.includes(n)) : [];
                            return (
                              <div key={idx} className={cn(
                                "flex flex-col gap-3 p-5 rounded-2xl border transition-all relative overflow-hidden",
                                theme === 'dark' ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"
                              )}>
                                <div className="flex items-center justify-between w-full mb-2">
                                  <div className="flex items-center gap-3">
                                    <span className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-black uppercase">Jogo {idx + 1}</span>
                                    {actual && (
                                      <span className="text-xs font-black text-green-400 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> {hits.length} ACERTOS
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Crachás de Métricas */}
                                  <div className="flex gap-2">
                                    {(() => {
                                      const { evens, odds, sum } = getGameMetrics(game);
                                      return (
                                        <>
                                          <span className="text-[9px] px-2 py-0.5 bg-slate-800 rounded-full text-slate-400 border border-slate-700">P/I: {evens}/{odds}</span>
                                          <span className={cn(
                                            "text-[9px] px-2 py-0.5 rounded-full border",
                                            sum >= 150 && sum <= 220 
                                              ? "bg-green-500/10 text-green-400 border-green-500/20" 
                                              : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                          )}>SOMA: {sum}</span>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                  {game.map((num, i) => (
                                    <span key={i} className={cn(
                                      "w-12 h-12 flex items-center justify-center rounded-xl font-black shadow-lg transition-all",
                                      actual?.includes(num) 
                                        ? "bg-green-500 text-white scale-110 shadow-green-500/40" 
                                        : theme === 'dark' ? "bg-white text-slate-900" : "bg-white text-slate-900 border border-slate-200"
                                    )}>
                                      {num.toString().padStart(2, '0')}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {suggestions[0].insights && (
                          <div className="space-y-4">
                            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> Insights do Enxame
                              </p>
                              <p className="text-xs text-slate-400 italic leading-relaxed">"{suggestions[0].insights}"</p>
                            </div>
                            {swarmResult?.prediction.otimizacao_meta && (
                              <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                                <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                  <TrendingUp className="w-3 h-3" /> Otimização por Meta
                                </p>
                                <p className="text-xs text-slate-400 italic leading-relaxed">"{swarmResult.prediction.otimizacao_meta}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Log de Histórico */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Log de Evolução MiroFish</h4>
                        <div className="space-y-3">
                          {suggestions.slice(1).map((s) => {
                            const maxHits = s.actual_result ? Math.max(...s.games.map(g => g.filter(n => s.actual_result?.includes(n)).length)) : null;
                            return (
                              <div key={s.id} className={cn("p-4 rounded-2xl border flex items-center justify-between", theme === 'dark' ? "bg-slate-900/30 border-slate-800" : "bg-white border-slate-200")}>
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                                    <History className="w-5 h-5 text-slate-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold">Sugestão #{s.id.slice(0, 4)}</p>
                                    <p className="text-[10px] text-slate-500">{new Date(s.timestamp).toLocaleDateString()} {new Date(s.timestamp).toLocaleTimeString()}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {s.actual_result ? (
                                    <div className="text-right">
                                      <p className="text-xs font-black text-green-400">{maxHits} Acertos Máx.</p>
                                      {s.hit_distribution && (
                                        <div className="flex gap-1 mt-1">
                                          <span className="text-[8px] px-1 bg-slate-800 rounded text-slate-500">L:{s.hit_distribution.low}</span>
                                          <span className="text-[8px] px-1 bg-blue-500/20 rounded text-blue-400">M:{s.hit_distribution.mid}</span>
                                          <span className="text-[8px] px-1 bg-green-500/20 rounded text-green-400">H:{s.hit_distribution.high}</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Pendente</span>
                                  )}
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => exportSuggestionsToCSV(s)}
                                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500"
                                      title="Exportar CSV"
                                    >
                                      <FileDown className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => recoverSuggestion(s)}
                                      className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                                      title="Visualizar/Recuperar"
                                    >
                                      <Eye className="w-4 h-4 text-blue-400" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-slate-900/10 rounded-[40px] border-2 border-dashed border-slate-800">
                      <BrainCircuit className="w-16 h-16 text-slate-700 mb-4" />
                      <h3 className="text-xl font-bold text-slate-500">Aguardando Simulação</h3>
                      <p className="text-sm text-slate-600 mt-2">Gere sugestões para iniciar o processo de conferência e aprendizado.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'graph' && (
            <motion.div key="graph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[700px] w-full">
              <div className={cn("h-full w-full rounded-[40px] border shadow-2xl relative overflow-hidden", theme === 'dark' ? "bg-[#0d1428] border-slate-800" : "bg-white border-slate-200")}>
                <div className="absolute top-6 left-6 z-10 space-y-2">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Network className="w-6 h-6 text-blue-400" /> Grafo de Memória MiroFish</h3>
                  <p className="text-xs text-slate-500">Representação em tempo real das relações e frequências.</p>
                </div>
                <SwarmGraph data={graphData} theme={theme} />
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8">
              {/* Processing Mode Configuration */}
              <div className={cn("rounded-3xl p-8 border shadow-xl space-y-6", theme === 'dark' ? "bg-[#141c31] border-slate-800" : "bg-white border-slate-200")}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Cpu className="w-6 h-6 text-blue-400" /> Motor de Processamento</h3>
                </div>
                <p className="text-xs text-slate-500">Escolha como o MiroFish deve gerar as previsões. O processamento via API (Nuvem) utiliza o Gemini para simulações complexas. O processamento Local utiliza estatística determinística sem custo de API.</p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setProcessingMode('api');
                      localStorage.setItem('mirofish_processing_mode', 'api');
                    }}
                    className={cn(
                      "flex-1 p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                      processingMode === 'api' ? "bg-blue-500/20 border-blue-500 text-blue-400" : (theme === 'dark' ? "bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100")
                    )}
                  >
                    <Cloud className="w-6 h-6" />
                    <span className="text-sm font-bold">API Nuvem (Gemini)</span>
                  </button>
                  <button 
                    onClick={() => {
                      setProcessingMode('local');
                      localStorage.setItem('mirofish_processing_mode', 'local');
                    }}
                    className={cn(
                      "flex-1 p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                      processingMode === 'local' ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : (theme === 'dark' ? "bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100")
                    )}
                  >
                    <Cpu className="w-6 h-6" />
                    <span className="text-sm font-bold">Processamento Local</span>
                  </button>
                </div>

                {processingMode === 'api' && (
                  <div className="pt-4 border-t border-slate-800/50">
                    <h4 className="text-sm font-bold mb-2 flex items-center gap-2"><Key className="w-4 h-4 text-slate-400" /> API Key do Gemini</h4>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={customApiKey}
                      onChange={(e) => {
                        setCustomApiKey(e.target.value);
                        localStorage.setItem('mirofish_api_key', e.target.value);
                      }}
                      className={cn("w-full px-4 py-3 rounded-xl border outline-none font-mono text-sm transition-all", theme === 'dark' ? "bg-slate-900 border-slate-800 focus:border-blue-500" : "bg-slate-50 border-slate-200 focus:border-blue-500")}
                    />
                    <p className="text-[10px] text-slate-500 mt-2">A chave é salva apenas localmente no seu navegador. Se deixada em branco, o sistema tentará usar a chave de ambiente.</p>
                  </div>
                )}
              </div>

              {/* Storage Mode Configuration */}
              <div className={cn("rounded-3xl p-8 border shadow-xl space-y-6", theme === 'dark' ? "bg-[#141c31] border-slate-800" : "bg-white border-slate-200")}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2"><HardDrive className="w-6 h-6 text-blue-400" /> Base de Conhecimento e Dados</h3>
                </div>
                <p className="text-xs text-slate-500">Escolha onde a base de dados (resultados) e a base de conhecimento (memória do enxame) devem ser salvas.</p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setStorageMode('backend');
                      localStorage.setItem('mirofish_storage_mode', 'backend');
                    }}
                    className={cn(
                      "flex-1 p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                      storageMode === 'backend' ? "bg-blue-500/20 border-blue-500 text-blue-400" : (theme === 'dark' ? "bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100")
                    )}
                  >
                    <Server className="w-6 h-6" />
                    <span className="text-sm font-bold">Servidor Backend</span>
                  </button>
                  <button 
                    onClick={() => {
                      setStorageMode('local');
                      localStorage.setItem('mirofish_storage_mode', 'local');
                    }}
                    className={cn(
                      "flex-1 p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                      storageMode === 'local' ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : (theme === 'dark' ? "bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100")
                    )}
                  >
                    <HardDrive className="w-6 h-6" />
                    <span className="text-sm font-bold">Arquivo Local (Navegador)</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-800/50 flex gap-4">
                  <button onClick={exportMemory} className="flex-1 p-3 bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                    <Download className="w-4 h-4" /> Baixar Base de Conhecimento
                  </button>
                  <button onClick={() => importInputRef.current?.click()} className="flex-1 p-3 bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                    <Upload className="w-4 h-4" /> Carregar Base de Conhecimento
                  </button>
                </div>
              </div>

              {/* Persistence Monitor */}
              <div className={cn("rounded-3xl p-8 border shadow-xl space-y-6", theme === 'dark' ? "bg-[#141c31] border-slate-800" : "bg-white border-slate-200")}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Database className="w-6 h-6 text-blue-400" /> Memória Persistida</h3>
                  {persistenceStatus && (
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      persistenceStatus.usage_percent > 90 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                    )}>
                      {persistenceStatus.usage_percent > 90 ? "ALERTA: Limite Próximo" : "Sistema Saudável"}
                    </span>
                  )}
                </div>

                {persistenceStatus ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Último Salvamento</p>
                        <p className="text-sm font-mono">{new Date(persistenceStatus.last_save).toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Registros Totais</p>
                        <p className="text-sm font-mono">{persistenceStatus.record_count}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Uso da Memória: {persistenceStatus.usage_percent.toFixed(1)}%</span>
                        <span className="text-slate-400">{(persistenceStatus.file_size_bytes / (1024 * 1024)).toFixed(2)}MB de {persistenceStatus.limit_mb}MB</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${persistenceStatus.usage_percent}%` }}
                          className={cn(
                            "h-full transition-colors",
                            persistenceStatus.usage_percent > 90 ? "bg-red-500" : "bg-blue-500"
                          )}
                        />
                      </div>
                    </div>

                    {persistenceStatus.usage_percent > 90 && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-red-400">Limite de Armazenamento Atingido</p>
                          <p className="text-[10px] text-red-400/70 mt-1">O arquivo de estado está próximo do limite de {persistenceStatus.limit_mb}MB. Considere limpar a base de dados ou compactar os registros para garantir a integridade do aprendizado.</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <p className="text-[10px] text-green-400 font-bold uppercase tracking-tight">Estado salvo com sucesso no MiroFish Pro Engine</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                  </div>
                )}
              </div>

              <div className={cn("rounded-3xl p-8 border shadow-xl space-y-8", theme === 'dark' ? "bg-[#141c31] border-slate-800" : "bg-white border-slate-200")}>
                <h3 className="text-xl font-bold flex items-center gap-2"><Settings className="w-6 h-6" /> Preferências do Sistema</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-2xl border border-slate-800">
                    <div>
                      <p className="font-bold">Modo de Tema</p>
                      <p className="text-xs text-slate-500">Alternar entre interface clara e escura</p>
                    </div>
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
                      {theme === 'dark' ? "Mudar para Claro" : "Mudar para Escuro"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                    <div>
                      <p className="font-bold text-red-400">Limpar Base de Dados</p>
                      <p className="text-xs text-slate-500">Apagar permanentemente todos os registros e sugestões</p>
                    </div>
                    <button onClick={clearDatabase} className="px-6 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl text-xs font-bold border border-red-500/30 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Apagar Tudo
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Dialog Modal */}
        <AnimatePresence>
          {dialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={cn(
                  "w-full max-w-md rounded-3xl p-8 shadow-2xl border flex flex-col gap-6",
                  theme === 'dark' ? "bg-[#141c31] border-slate-800" : "bg-white border-slate-200"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-2xl", dialog.isAlert ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400")}>
                    {dialog.isAlert ? <AlertCircle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                  </div>
                  <h3 className="text-xl font-bold">{dialog.title}</h3>
                </div>
                <p className={cn("text-sm", theme === 'dark' ? "text-slate-300" : "text-slate-600")}>
                  {dialog.message}
                </p>
                <div className="flex justify-end gap-3 mt-4">
                  {dialog.onCancel && (
                    <button
                      onClick={dialog.onCancel}
                      className={cn(
                        "px-6 py-3 rounded-xl text-sm font-bold transition-colors",
                        theme === 'dark' ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      )}
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={dialog.onConfirm}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
                  >
                    {dialog.isAlert ? "OK" : "Confirmar"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SwarmGraph({ data, theme }: { data: SwarmGraphData, theme: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Comportamento de zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<any>(data.nodes)
      .force("link", d3.forceLink<any, any>(data.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-150))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    const link = g.append("g")
      .attr("stroke", theme === 'dark' ? "#1e293b" : "#e2e8f0")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.weight));

    const node = g.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("r", d => 10 + (d.frequency / 10))
      .attr("fill", d => {
        if (d.delay === 0) return "#3b82f6";
        if (d.delay < 5) return "#60a5fa";
        return theme === 'dark' ? "#1e293b" : "#f1f5f9";
      })
      .attr("stroke", theme === 'dark' ? "#334155" : "#cbd5e1")
      .attr("stroke-width", 2);

    node.append("text")
      .text(d => d.label)
      .attr("x", 0)
      .attr("y", 4)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", d => {
        if (d.delay < 5) return "white";
        return theme === 'dark' ? "#94a3b8" : "#475569";
      });

    node.append("title")
      .text(d => `Dezena: ${d.label}\nFrequência: ${d.frequency}\nAtraso: ${d.delay} concursos`);

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as GraphNode).x!)
        .attr("y1", d => (d.source as GraphNode).y!)
        .attr("x2", d => (d.target as GraphNode).x!)
        .attr("y2", d => (d.target as GraphNode).y!);

      node
        .attr("transform", d => `translate(${d.x!},${d.y!})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop();
  }, [data, theme]);

  return <svg ref={svgRef} className="w-full h-full cursor-move" />;
}

function NavButton({ active, onClick, icon, label, theme }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, theme: string }) {
  return (
    <button onClick={onClick} className={cn(
      "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group",
      active 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
        : theme === 'dark' ? "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
    )}>
      <div className={cn("transition-transform group-hover:scale-110", active ? "text-white" : "text-slate-500")}>{icon}</div>
      <span className="hidden md:block font-bold text-sm">{label}</span>
      {active && <motion.div layoutId="nav-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-white hidden md:block" />}
    </button>
  );
}

function AgentCard({ title, content, icon, color, theme }: { title: string, content: string, icon: React.ReactNode, color: string, theme: string }) {
  return (
    <div className={cn("rounded-3xl p-6 border space-y-3", theme === 'dark' ? "bg-[#141c31] border-slate-800" : "bg-white border-slate-200")}>
      <div className={cn("flex items-center gap-2 font-bold text-xs uppercase tracking-widest", color)}>
        {icon}
        {title}
      </div>
      <p className="text-xs text-slate-400 leading-relaxed italic">"{content}"</p>
    </div>
  );
}
