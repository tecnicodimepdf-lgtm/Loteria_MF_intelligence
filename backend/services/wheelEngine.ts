
/**
 * MiroFish Pro v2 - Wheel Engine
 * Reorganiza a distribuição das dezenas para maximizar a cobertura.
 */

export interface FilterConfig {
  sumMin: number;
  sumMax: number;
  allowedEvenOdd: string[]; // ex: ["3:3", "4:2", "2:4"]
}

export interface WheelInput {
  jogos: number[][]; // jogos vindos do motor (cada um com 6 dezenas)
  filterConfig: FilterConfig;
}

export interface WheelOutput {
  jogosOriginais: number[][];
  jogosOtimizados: number[][];
  analise: {
    coberturaBefore: number;   // dezenas únicas antes
    coberturaAfter: number;    // dezenas únicas depois
    sobreposicaoBefore: number; // slots desperdiçados antes
    sobreposicaoAfter: number;  // slots desperdiçados depois
    jogosMantidos: number;     // jogos que não mudaram (falha no filtro)
  };
}

/**
 * Identifica a frequência de cada dezena e separa em núcleo e complementos.
 */
export function analisarSobreposicao(jogos: number[][]): {
  frequencia: Map<number, number>;
  nucleo: number[];
  complementos: number[];
  desperdicioTotal: number;
} {
  const frequencia = new Map<number, number>();
  let totalSlots = 0;

  jogos.forEach(jogo => {
    jogo.forEach(num => {
      frequencia.set(num, (frequencia.get(num) || 0) + 1);
      totalSlots++;
    });
  });

  const nucleo: number[] = [];
  const complementos: number[] = [];
  const dezenasUnicas = frequencia.size;

  frequencia.forEach((count, num) => {
    if (count >= 2) {
      nucleo.push(num);
    } else {
      complementos.push(num);
    }
  });

  // Desperdício = total de slots ocupados - total de dezenas únicas
  const desperdicioTotal = totalSlots - dezenasUnicas;

  return {
    frequencia,
    nucleo,
    complementos,
    desperdicioTotal
  };
}

/**
 * Valida os filtros de integridade de um jogo.
 */
function validarJogo(jogo: number[], config: FilterConfig): boolean {
  // 1. Soma
  const soma = jogo.reduce((a, b) => a + b, 0);
  if (soma < config.sumMin || soma > config.sumMax) return false;

  // 2. Par/Ímpar
  const pares = jogo.filter(n => n % 2 === 0).length;
  const impares = 6 - pares;
  const ratio = `${pares}:${impares}`;
  if (!config.allowedEvenOdd.includes(ratio)) return false;

  // 3. Quadrantes (1-15, 16-30, 31-45, 46-60)
  const q = [false, false, false, false];
  jogo.forEach(n => {
    if (n >= 1 && n <= 15) q[0] = true;
    else if (n >= 16 && n <= 30) q[1] = true;
    else if (n >= 31 && n <= 45) q[2] = true;
    else if (n >= 46 && n <= 60) q[3] = true;
  });
  if (q.some(v => v === false)) return false;

  return true;
}

/**
 * Aplica a redistribuição Wheel para maximizar a cobertura.
 */
export function aplicarWheel(input: WheelInput): WheelOutput {
  const { jogos, filterConfig } = input;
  const analiseBefore = analisarSobreposicao(jogos);
  
  // Pool total de dezenas (exatamente o que veio na entrada)
  const pool: number[] = [];
  jogos.forEach(j => pool.push(...j));

  const frequencia = analiseBefore.frequencia;
  const nucleo = [...analiseBefore.nucleo].sort((a, b) => (frequencia.get(b) || 0) - (frequencia.get(a) || 0));
  const complementos = [...analiseBefore.complementos];

  // Algoritmo de redistribuição determinístico
  // Tentamos criar novos jogos priorizando dezenas que ainda não apareceram no jogo atual
  const novosJogos: number[][] = Array.from({ length: jogos.length }, () => []);
  
  // Estratégia de distribuição:
  // 1. Garantir que cada jogo tenha 6 dezenas.
  // 2. Distribuir o núcleo (que deve aparecer em pelo menos 2 jogos).
  // 3. Preencher com complementos.
  
  // Vamos usar uma abordagem de "bucket filling"
  const slotsDisponiveis = pool.length; // deve ser jogos.length * 6
  const usedInWheelPool = new Map<number, number>(); // dezena -> quantas vezes foi usada na redistribuição
  
  // Pré-requisito: distribuir o núcleo
  // Cada número do núcleo deve aparecer exatamente o mesmo número de vezes que no original
  // para manter a fidelidade estatística, mas em jogos diferentes se possível.
  
  const dezenasRestantes = [...pool].sort((a, b) => {
    // Ordenar por: Frequência descendente (núcleo primeiro)
    const freqA = frequencia.get(a) || 0;
    const freqB = frequencia.get(b) || 0;
    if (freqA !== freqB) return freqB - freqA;
    return a - b;
  });

  // Distribuição Round-Robin
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < novosJogos.length; j++) {
      // Pegar a melhor dezena disponível que não esteja no jogo j
      let index = -1;
      for (let k = 0; k < dezenasRestantes.length; k++) {
        const candidate = dezenasRestantes[k];
        if (!novosJogos[j].includes(candidate)) {
          index = k;
          break;
        }
      }

      // Se não houver dezena que não esteja no jogo, pega a primeira disponível (caso raro de pool pequeno)
      if (index === -1) index = 0;

      const selected = dezenasRestantes.splice(index, 1)[0];
      novosJogos[j].push(selected);
    }
  }

  // Ordenar dezenas nos jogos
  novosJogos.forEach(j => j.sort((a, b) => a - b));

  // Validação e Fallback
  let jogosMantidos = 0;
  const jogosOtimizadosFinal = novosJogos.map((novoJogo, idx) => {
    if (validarJogo(novoJogo, filterConfig)) {
      return novoJogo;
    } else {
      jogosMantidos++;
      return [...jogos[idx]].sort((a, b) => a - b);
    }
  });

  const analiseAfter = analisarSobreposicao(jogosOtimizadosFinal);

  return {
    jogosOriginais: jogos,
    jogosOtimizados: jogosOtimizadosFinal,
    analise: {
      coberturaBefore: analiseBefore.frequencia.size,
      coberturaAfter: analiseAfter.frequencia.size,
      sobreposicaoBefore: analiseBefore.desperdicioTotal,
      sobreposicaoAfter: analiseAfter.desperdicioTotal,
      jogosMantidos
    }
  };
}
