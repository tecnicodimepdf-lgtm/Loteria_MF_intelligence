import * as d3 from 'd3';

export interface LotteryResult {
  concurso: number;
  data: string;
  dezenas: number[];
}

export interface GameSuggestion {
  id: string;
  timestamp: number;
  games: number[][]; // Exactly 5 games per suggestion
  concurso_alvo?: string;
  actual_result?: number[]; // User provided result for comparison
  insights?: string;
  simulation_log?: string;
  hit_distribution?: {
    low: number; // 0-2 hits
    mid: number; // 3 hits
    high: number; // 4+ hits
  };
}

export interface GraphNode extends d3.SimulationNodeDatum {
  id: number;
  label: string;
  frequency: number;
  delay: number;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: number | GraphNode;
  target: number | GraphNode;
  weight: number; // Co-occurrence strength
}

export interface SwarmGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface SwarmResponse {
  simulation_metadata: {
    cycles_completed: number;
    agents_active: string[];
    convergence_rate: string;
  };
  debate: {
    conservador: string;
    explorador: string;
    hibrido: string;
  };
  prediction: {
    concurso_alvo: string;
    sugestoes: number[][]; // Exactly 5 games
    analise_de_risco: string;
    probabilidade_calculada: string;
    insights_aprendizado: string;
    otimizacao_meta: string;
  };
}

export interface SystemState {
  results: LotteryResult[];
  suggestions: GameSuggestion[];
  parameters: {
    maturity: number;
    last_update: string;
    persistence_limit_mb: number;
  };
}

export interface PersistenceStatus {
  last_save: string;
  record_count: number;
  file_size_bytes: number;
  usage_percent: number;
  limit_mb: number;
}
