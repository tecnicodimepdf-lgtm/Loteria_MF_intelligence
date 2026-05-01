
import React from 'react';

// Interfaces mockadas para o componente SimulationPanel
interface WheelAnalise {
  coberturaBefore: number;
  coberturaAfter: number;
  sobreposicaoBefore: number;
  sobreposicaoAfter: number;
  jogosMantidos: number;
}

export const SimulationPanel: React.FC = () => {
  const [useWheel, setUseWheel] = React.useState(false);
  const [wheelAnalise, setWheelAnalise] = React.useState<WheelAnalise | null>(null);

  return (
    <div className="simulation-panel">
      {/* Parâmetros existentes */}
      <div className="config-params">
        {/* Toggle para o Wheel Engine */}
        <div className="flex items-center gap-2 mb-4">
          <input 
            type="checkbox" 
            id="useWheel" 
            checked={useWheel} 
            onChange={(e) => setUseWheel(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500"
          />
          <label htmlFor="useWheel" className="text-sm font-bold text-slate-400">Ativar Wheel Engine (Otimizar Cobertura)</label>
        </div>
      </div>

      {/* Sugestões de jogos */}
      <div className="jogos-sugestões">
        {/* ... renderização dos jogos ... */}
      </div>

      {/* Bloco de métricas do Wheel Engine se estiver ativo */}
      {useWheel && wheelAnalise && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
          <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">Métricas de Cobertura (Wheel Engine)</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Dezenas Únicas (Antes):</p>
              <p className="font-bold text-white">{wheelAnalise.coberturaBefore}</p>
            </div>
            <div>
              <p className="text-slate-500">Dezenas Únicas (Depois):</p>
              <p className="font-bold text-green-400">{wheelAnalise.coberturaAfter}</p>
            </div>
            <div>
              <p className="text-slate-500">Sobreposição (Desperdício):</p>
              <p className="font-bold text-orange-400">{wheelAnalise.sobreposicaoAfter} slots</p>
            </div>
            <div>
              <p className="text-slate-500">Jogos Originais Mantidos:</p>
              <p className="font-bold text-slate-300">{wheelAnalise.jogosMantidos}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
