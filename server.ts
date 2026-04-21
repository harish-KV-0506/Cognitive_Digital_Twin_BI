import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- BUSINESS ENVIRONMENT (Digital Twin Logic) ---
interface BusinessData {
  name: string;
  revenue: number;
  cost: number;
  stock: number;
  efficiency: number;
  satisfaction: number;
}

const BASE_DATA = [
  { name: 'Mon', revenue: 4200, cost: 2800, stock: 85, efficiency: 88, satisfaction: 92 },
  { name: 'Tue', revenue: 3800, cost: 2600, stock: 78, efficiency: 85, satisfaction: 90 },
  { name: 'Wed', revenue: 4500, cost: 3100, stock: 72, efficiency: 82, satisfaction: 88 },
  { name: 'Thu', revenue: 5100, cost: 3400, stock: 65, efficiency: 90, satisfaction: 91 },
  { name: 'Fri', revenue: 5800, cost: 3900, stock: 58, efficiency: 94, satisfaction: 93 },
  { name: 'Sat', revenue: 6200, cost: 4200, stock: 50, efficiency: 96, satisfaction: 95 },
  { name: 'Sun', revenue: 5400, cost: 3600, stock: 95, efficiency: 89, satisfaction: 94 },
];

function simulate(priceAdjust: number, marketingSpend: number, staffingLevel: number) {
  return BASE_DATA.map(d => {
    const volumeFactor = Math.max(0.5, 1.5 - (priceAdjust - 1) * 2);
    const revenue = d.revenue * priceAdjust * volumeFactor * (1 + (marketingSpend / 10000));
    const variableCost = (d.cost * 0.4 * volumeFactor) + (marketingSpend / 7) + (staffingLevel * 150);
    const cost = (d.cost * 0.6) + variableCost;
    const efficiency = Math.min(100, d.efficiency * (staffingLevel / 10) / volumeFactor);
    const satisfaction = Math.min(100, d.satisfaction * (1 / priceAdjust) * (efficiency / 90));

    return {
      ...d,
      revenue: Math.round(revenue),
      cost: Math.round(cost),
      efficiency: Math.round(efficiency),
      satisfaction: Math.round(satisfaction),
    };
  });
}

function calculateReward(priceAdjust: number, marketingSpend: number, staffingLevel: number) {
  const data = simulate(priceAdjust, marketingSpend, staffingLevel);
  const totalRevenue = data.reduce((acc, d) => acc + d.revenue, 0);
  const totalCost = data.reduce((acc, d) => acc + d.cost, 0);
  const avgSatisfaction = data.reduce((acc, d) => acc + d.satisfaction, 0) / data.length;
  
  // Reward is Profit + Satisfaction bonus (to avoid burning out customers)
  return (totalRevenue - totalCost) + (avgSatisfaction * 100);
}

// --- REINFORCEMENT LEARNING AGENT (Stochastic Hill Climbing / Policy Search) ---
async function runRLOptimization(iterations = 50) {
  let bestParams = { priceAdjust: 1.0, marketingSpend: 1500, staffingLevel: 12 };
  let bestReward = calculateReward(bestParams.priceAdjust, bestParams.marketingSpend, bestParams.staffingLevel);
  
  const history = [];

  for (let i = 0; i < iterations; i++) {
    // Explore: Randomly perturb parameters
    const nextParams = {
      priceAdjust: Math.max(0.5, Math.min(2.0, bestParams.priceAdjust + (Math.random() - 0.5) * 0.2)),
      marketingSpend: Math.max(0, Math.min(10000, bestParams.marketingSpend + (Math.random() - 0.5) * 1000)),
      staffingLevel: Math.max(1, Math.min(50, Math.round(bestParams.staffingLevel + (Math.random() - 0.5) * 4)))
    };

    const reward = calculateReward(nextParams.priceAdjust, nextParams.marketingSpend, nextParams.staffingLevel);

    if (reward > bestReward) {
      bestReward = reward;
      bestParams = nextParams;
    }

    history.push({ iteration: i, reward, params: { ...bestParams } });
  }

  return { bestParams, bestReward, history };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/simulate", (req, res) => {
    const { priceAdjust, marketingSpend, staffingLevel } = req.body;
    const data = simulate(priceAdjust || 1.0, marketingSpend || 1500, staffingLevel || 12);
    res.json(data);
  });

  app.post("/api/optimize", async (req, res) => {
    const result = await runRLOptimization(100);
    res.json(result);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
