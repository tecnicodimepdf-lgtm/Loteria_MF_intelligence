# MiroFish Pro - Inteligência de Enxame para Loterias

MiroFish Pro é uma plataforma avançada de análise preditiva para loterias, baseada no conceito de **Inteligência de Enxame (Swarm Intelligence)** e simulação multiagente. O sistema utiliza algoritmos genéticos e modelos de linguagem de grande escala (LLM) para processar volumes massivos de dados históricos e gerar combinações com alta densidade estatística.

## 🚀 Características Principais

### 1. Motor de Inteligência de Enxame (Swarm Engine)
O coração do sistema é um debate dialético entre três perfis de agentes especializados:
*   **Agente Conservador (Ordem):** Foca na estabilidade estatística e na Lei dos Grandes Números.
*   **Agente Explorador (Caos):** Busca desvios, atrasos (Gap Analysis) e números "maduros" para retorno.
*   **Agente Híbrido (Equilíbrio):** Sintetiza correlações entre os mundos frequente e raro.

### 2. Estratégias de Universo Dinâmicas
O sistema oferece três modos de análise de dezenas:
*   **Opção A (Clássica):** Foco nos extremos (mais frequentes e maiores atrasos).
*   **Opção B (Enriquecida):** Adiciona Zona Morna, Repetentes do último concurso e Vizinhos Quentes.
*   **Opção C (Analítica):** Utiliza algoritmos de **Similitude/Clustering** para encontrar janelas históricas com comportamentos semelhantes ao estado atual do globo.

### 3. Cadeias de Markov e Análise Temporal
Implementação de modelos de transição de estado para prever a probabilidade do próximo sorteio baseada na configuração imediata anterior. O sistema calcula a "densidade de transição" para cada número no volante.

### 4. Ciclo de Aprendizado e Maturidade
A cada conferência de resultado real, o sistema evolui. O feedback de acertos/erros é injetado no processo de simulação, aumentando o nível de **Maturidade** do motor e refinando as próximas predições.

### 5. Filtros de Integridade Cartográfica (Blindagem)
Todas as sugestões passam por uma validação rigorosa de integridade:
*   **Equilíbrio Par/Ímpar:** Garantia de proporções estatisticamente ideais (3:3, 4:2, 2:4).
*   **Faixa de Entropia (Soma):** Validação de soma total das dezenas entre 150 e 220 (ponto ideal de 80% dos jogos vencedores).
*   **Distribuição por Quadrantes:** Verificação de dispersão geográfica no volante.
*   **Pre-Flight Backtesting:** Simulação interna contra o último resultado real antes da entrega final.

### 6. Portabilidade e Visualização
*   **Exportação CSV:** Exporte sugestões e logs para análise externa.
*   **Flexibilidade de Volume:** Escolha entre 5 ou 10 jogos otimizados por simulação.
*   **Heatmap Interativo:** Visualização de grafos de coocorrência e intensidades baseadas em Markov.

## 🛠️ Tecnologias Utilizadas
*   **Vite + React + TypeScript**
*   **Tailwind CSS + Framer Motion** (Interface UI/UX de alta fidelidade)
*   **Google Gemini AI SDK** (Motor Cognitivo)
*   **D3.js & Recharts** (Visualização de dados/grafos)
*   **Express** (Persistência e Backend)

## 📌 Como Usar
1.  Importe a base histórica de resultados via CSV.
2.  Configure sua Janela de Análise (ex: Últimos 500).
3.  Selecione a Estratégia de Universo (recomendado: Opção C).
4.  Gere as sugestões e, após o sorteio real, realize a conferência para alimentar o **Ciclo de Aprendizado**.

---
*MiroFish Pro: Quebrando a barreira da sorte com matemática e inteligência coletiva.*
