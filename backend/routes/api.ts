
import { Router } from "express";
import { z } from "zod";
import { aplicarWheel } from "../services/wheelEngine";

const router = Router();

// Schema de validação para simulação já existente
export const SimulateSchema = z.object({
  concursos: z.number().int().min(10).max(1000).default(50),
  strategy: z.enum(["A", "B", "C"]).default("B"),
  useWheel: z.boolean().default(false), // Adição do Wheel Engine - não altera nenhum código acima
});

router.post("/simulate", async (req, res) => {
  const result = SimulateSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json(result.error);

  const { useWheel } = result.data;

  // Bloco original de geração de sugestões (exemplo hipotético)
  const sugestoes: number[][] = [[1, 2, 3, 4, 5, 6], [10, 11, 12, 13, 14, 15]]; 
  const filterConfig = { 
    sumMin: 150, 
    sumMax: 220, 
    allowedEvenOdd: ["3:3", "4:2", "2:4"] 
  };

  // Adição do Wheel Engine — não altera nenhum código acima ou abaixo
  if (useWheel) {
    const wheelResult = aplicarWheel({ jogos: sugestoes, filterConfig });
    return res.json({ sugestoes, wheelResult });
  }

  res.json({ sugestoes });
});

export default router;
