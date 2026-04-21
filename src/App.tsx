import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell
} from 'recharts';
import { 
  LayoutDashboard, Database, Activity, Cpu, Settings, TrendingUp, 
  Users, Package, DollarSign, AlertCircle, Play, RefreshCcw,
  ChevronRight, Brain, Zap, Target, BarChart3, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenAI } from "@google/genai";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- TYPES ---
interface BusinessData {
  name: string;
  revenue: number;
  cost: number;
  stock: number;
  efficiency: number;
  satisfaction: number;
}

interface SimulationParams {
  priceAdjust: number;
  marketingSpend: number;
  staffingLevel: number;
  inventoryBuffer: number;
}

// --- MOCK DATA GENERATOR ---
const generateBaseData = (): BusinessData[] => [
  { name: 'Mon', revenue: 4200, cost: 2800, stock: 85, efficiency: 88, satisfaction: 92 },
  { name: 'Tue', revenue: 3800, cost: 2600, stock: 78, efficiency: 85, satisfaction: 90 },
  { name: 'Wed', revenue: 4500, cost: 3100, stock: 72, efficiency: 82, satisfaction: 88 },
  { name: 'Thu', revenue: 5100, cost: 3400, stock: 65, efficiency: 90, satisfaction: 91 },
  { name: 'Fri', revenue: 5800, cost: 3900, stock: 58, efficiency: 94, satisfaction: 93 },
  { name: 'Sat', revenue: 6200, cost: 4200, stock: 50, efficiency: 96, satisfaction: 95 },
  { name: 'Sun', revenue: 5400, cost: 3600, stock: 95, efficiency: 89, satisfaction: 94 },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [backendData, setBackendData] = useState<BusinessData[]>(generateBaseData());
  const [simulatedEvents, setSimulatedEvents] = useState<{id: number, type: string, status: string}[]>([]);

  // Simulation States
  const [params, setParams] = useState<SimulationParams>({
    priceAdjust: 1.0,
    marketingSpend: 1500,
    staffingLevel: 12,
    inventoryBuffer: 20,
  });

  // Training Config
  const [trainingGoal, setTrainingGoal] = useState<'profit' | 'satisfaction' | 'balanced'>('balanced');

  // Fetch simulation data from backend
  const fetchSimulation = async (p: SimulationParams) => {
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });
      const data = await res.json();
      setBackendData(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const runOptimizer = async () => {
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/optimize', { method: 'POST' });
      const { bestParams } = await res.json();
      setParams(bestParams);
      await fetchSimulation(bestParams);
    } catch (err) {
      console.error("Optimization error:", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const startTraining = async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    // Simulate a training loop with user feedback
    for (let i = 1; i <= 10; i++) {
      await new Promise(r => setTimeout(r, 800));
      setTrainingProgress(i * 10);
      
      // Randomly perturb params during training to show "exploration"
      setParams(p => ({
        ...p,
        priceAdjust: Math.max(0.5, Math.min(2.0, p.priceAdjust + (Math.random() - 0.5) * 0.1)),
        marketingSpend: Math.max(0, Math.min(10000, p.marketingSpend + (Math.random() - 0.5) * 500)),
      }));
    }
    
    setIsTraining(false);
    generateRecommendation();
  };

  // Real-time event simulation for "Digital Twinning"
  useEffect(() => {
    const interval = setInterval(() => {
      const types = ['Order', 'Inventory Log', 'Staff Check', 'Customer Feedback'];
      const statuses = ['Processing', 'Completed', 'Alert', 'Synced'];
      const newEvent = {
        id: Date.now(),
        type: types[Math.floor(Math.random() * types.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)]
      };
      setSimulatedEvents(prev => [newEvent, ...prev].slice(0, 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchSimulation(params);
  }, [params]);

  // Stats computed from backend data
  const stats = useMemo(() => {
    const totalRevenue = backendData.reduce((acc, d) => acc + d.revenue, 0);
    const totalCost = backendData.reduce((acc, d) => acc + d.cost, 0);
    const avgEfficiency = backendData.reduce((acc, d) => acc + d.efficiency, 0) / backendData.length;
    const avgSatisfaction = backendData.reduce((acc, d) => acc + d.satisfaction, 0) / backendData.length;

    return [
      { label: 'Weekly Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+12.5%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { label: 'Net Profit', value: `$${(totalRevenue - totalCost).toLocaleString()}`, change: '+8.2%', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { label: 'Avg Efficiency', value: `${Math.round(avgEfficiency)}%`, change: '+2.1%', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
      { label: 'Customer CSAT', value: `${Math.round(avgSatisfaction)}%`, change: '-0.5%', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ];
  }, [backendData]);

  // AI Recommendation Logic
  const generateRecommendation = async () => {
    if (!process.env.GEMINI_API_KEY) {
      setAiRecommendation("AI Analysis requires a GEMINI_API_KEY. Please configure it in the Secrets panel.");
      return;
    }

    setIsGeneratingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const totalRevenue = backendData.reduce((acc, d) => acc + d.revenue, 0);
      const totalCost = backendData.reduce((acc, d) => acc + d.cost, 0);
      const profit = totalRevenue - totalCost;

      const prompt = `As a Business Intelligence AI for the MistInTunnel Cognitive Digital Twin, analyze the current simulation parameters and results:
      - Pricing Adjustment: ${params.priceAdjust}x
      - Marketing Spend: $${params.marketingSpend}
      - Staffing Level: ${params.staffingLevel} FTE
      - Weekly Revenue: $${totalRevenue}
      - Weekly Profit: $${profit}
      - Avg Efficiency: ${stats[2].value}
      - Avg Satisfaction: ${stats[3].value}

      Provide a concise (2-3 sentences) strategic recommendation for an MSME to optimize these results. Focus on the trade-off between pricing, marketing, and operational efficiency.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAiRecommendation(response.text || "Unable to generate recommendation at this time.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiRecommendation("The AI engine is currently recalibrating. Based on historical patterns, consider balancing marketing spend with staffing capacity to avoid efficiency bottlenecks.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      generateRecommendation();
    }, 1000);
    return () => clearTimeout(timer);
  }, [params, backendData]);

  const handleSync = () => {
    setIsSyncing(true);
    fetchSimulation(params).finally(() => setIsSyncing(false));
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#16191E] border-r border-white/5 flex flex-col z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Brain className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">MistInTunnel</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-semibold">Cognitive Twin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="Executive Overview" />
          <NavItem active={activeTab === 'lab'} onClick={() => setActiveTab('lab')} icon={<Activity size={20}/>} label="Simulation Lab" />
          <NavItem active={activeTab === 'training'} onClick={() => setActiveTab('training')} icon={<Target size={20}/>} label="RL Training Center" />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20}/>} label="System Config" />
        </nav>

        <div className="p-6">
          <div className="bg-[#1C2128] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("w-2 h-2 rounded-full", isSyncing ? "bg-amber-500 animate-pulse" : "bg-emerald-500")}></div>
              <span className="text-xs font-medium text-slate-300">{isSyncing ? "Syncing ERP..." : "Twin Synchronized"}</span>
            </div>
            <div className="space-y-2">
              {simulatedEvents.map(event => (
                <div key={event.id} className="flex justify-between items-center text-[9px]">
                  <span className="text-slate-400">{event.type}</span>
                  <span className={cn(
                    "font-bold",
                    event.status === 'Alert' ? "text-red-400" : "text-emerald-400"
                  )}>{event.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64 min-h-screen">
        <header className="sticky top-0 bg-[#0F1115]/80 backdrop-blur-md border-bottom border-white/5 p-8 flex justify-between items-center z-40">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {activeTab === 'dashboard' && "Decision Intelligence Hub"}
              {activeTab === 'lab' && "Process Simulation Lab"}
              {activeTab === 'training' && "Cognitive Training Center"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500">MSME Optimization Framework</span>
              <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
              <span className="text-xs text-blue-400 font-medium">v2.5.0-cognitive-lab</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 bg-[#1C2128] border border-white/10 px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#252B35] transition-all disabled:opacity-50"
            >
              <RefreshCcw size={16} className={cn(isSyncing && "animate-spin")} />
              {isSyncing ? "Syncing..." : "Refresh Twin"}
            </button>
            {activeTab === 'training' ? (
              <button 
                onClick={startTraining}
                disabled={isTraining}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50"
              >
                {isTraining ? <RefreshCcw size={16} className="animate-spin" /> : <Play size={16} />}
                {isTraining ? `Training (${trainingProgress}%)` : "Start Training Cycle"}
              </button>
            ) : (
              <button 
                onClick={runOptimizer}
                disabled={isOptimizing}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50"
              >
                {isOptimizing ? <RefreshCcw size={16} className="animate-spin" /> : <Cpu size={16} />}
                {isOptimizing ? "Optimizing..." : "Run RL Optimizer"}
              </button>
            )}
          </div>
        </header>

        <div className="p-8 pt-0 space-y-8">
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="bg-[#16191E] p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                        <stat.icon size={24} />
                      </div>
                      <div className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-lg",
                        stat.change.startsWith('+') ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {stat.change}
                      </div>
                    </div>
                    <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</h3>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Forecasting View */}
                <div className="lg:col-span-2 bg-[#16191E] p-8 rounded-[2rem] border border-white/5">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-white">Cognitive Performance Forecast</h3>
                      <p className="text-xs text-slate-500 mt-1">Simulated impact on core business metrics</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Op. Cost</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={backendData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1C2128', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: '16px',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
                          }}
                          itemStyle={{ color: '#fff', fontSize: '12px' }}
                          labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#3b82f6" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorRev)" 
                          animationDuration={1000}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="cost" 
                          stroke="#475569" 
                          strokeWidth={2} 
                          fill="transparent" 
                          strokeDasharray="6 6" 
                          animationDuration={1000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Simulation Controls */}
                <div className="bg-[#16191E] p-8 rounded-[2rem] border border-white/5 flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Cpu className="text-blue-400" size={20} />
                    </div>
                    <h3 className="font-bold text-white">Simulation Engine</h3>
                  </div>

                  <div className="space-y-8 flex-1">
                    <SimulationSlider 
                      label="Pricing Strategy" 
                      value={params.priceAdjust} 
                      min={0.5} max={2.0} step={0.05} 
                      suffix="x"
                      onChange={(v) => setParams(p => ({ ...p, priceAdjust: v }))} 
                    />
                    <SimulationSlider 
                      label="Marketing Budget" 
                      value={params.marketingSpend} 
                      min={0} max={10000} step={100} 
                      prefix="$"
                      onChange={(v) => setParams(p => ({ ...p, marketingSpend: v }))} 
                    />
                    <SimulationSlider 
                      label="Workforce Capacity" 
                      value={params.staffingLevel} 
                      min={1} max={50} step={1} 
                      suffix=" FTE"
                      onChange={(v) => setParams(p => ({ ...p, staffingLevel: v }))} 
                    />
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="bg-blue-500/5 rounded-2xl p-5 border border-blue-500/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Brain size={48} className="text-blue-400" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="text-blue-400" size={14} />
                        <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">AI Recommendation</h4>
                      </div>
                      <AnimatePresence mode="wait">
                        {isGeneratingAi ? (
                          <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex gap-1 mt-2"
                          >
                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                          </motion.div>
                        ) : (
                          <motion.p 
                            key="text"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-slate-400 leading-relaxed italic"
                          >
                            "{aiRecommendation || "Adjust parameters to receive a cognitive strategy recommendation."}"
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'lab' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[#16191E] p-8 rounded-[2rem] border border-white/5 min-h-[500px] flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-white">Visual Process Simulation</h3>
                    <p className="text-xs text-slate-500 mt-1">Real-time animation of business throughput</p>
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    Live Stream
                  </div>
                </div>
                
                <div className="flex-1 border border-white/5 rounded-2xl bg-[#0F1115] relative overflow-hidden flex items-center justify-center">
                  <ProcessAnimation staffing={params.staffingLevel} />
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-[#16191E] p-8 rounded-[2rem] border border-white/5">
                  <h3 className="font-bold text-white mb-6">Throughput Metrics</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-bold uppercase">Units Processed</span>
                      <span className="text-xl font-bold text-white">1,248</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-bold uppercase">Cycle Time</span>
                      <span className="text-xl font-bold text-blue-400">4.2s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-bold uppercase">Error Rate</span>
                      <span className="text-xl font-bold text-red-400">0.8%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#16191E] p-8 rounded-[2rem] border border-white/5">
                  <h3 className="font-bold text-white mb-6">Digital Twin Sync Status</h3>
                  <div className="space-y-4">
                    {['Sales Model', 'Inventory Model', 'HR Model', 'Finance Model'].map((model, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-xs text-slate-300 font-medium">{model}</span>
                        <span className="ml-auto text-[10px] text-slate-500 font-bold">ACTIVE</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'training' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[#16191E] p-8 rounded-[2rem] border border-white/5 min-h-[500px]">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-white">RL Training Visualization</h3>
                    <p className="text-xs text-slate-500 mt-1">Stochastic Policy Search Progress</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setTrainingGoal('profit')}
                      className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all", trainingGoal === 'profit' ? "bg-emerald-500 text-white" : "bg-white/5 text-slate-500")}
                    >
                      Max Profit
                    </button>
                    <button 
                      onClick={() => setTrainingGoal('satisfaction')}
                      className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all", trainingGoal === 'satisfaction' ? "bg-purple-500 text-white" : "bg-white/5 text-slate-500")}
                    >
                      Max CSAT
                    </button>
                    <button 
                      onClick={() => setTrainingGoal('balanced')}
                      className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all", trainingGoal === 'balanced' ? "bg-blue-500 text-white" : "bg-white/5 text-slate-500")}
                    >
                      Balanced
                    </button>
                  </div>
                </div>

                <div className="h-[400px] w-full bg-[#0F1115] rounded-2xl border border-white/5 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={backendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1C2128', border: 'none', borderRadius: '12px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={isTraining ? 1 : 3} 
                        dot={false} 
                        strokeOpacity={isTraining ? 0.3 : 1}
                      />
                      {isTraining && (
                        <Line 
                          type="monotone" 
                          dataKey="cost" 
                          stroke="#ef4444" 
                          strokeWidth={2} 
                          dot={false} 
                          strokeDasharray="5 5"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-[#16191E] p-8 rounded-[2rem] border border-white/5">
                  <h3 className="font-bold text-white mb-6">Training Parameters</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>Learning Rate</span>
                        <span>0.001</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-blue-500"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>Exploration Factor</span>
                        <span>0.25</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-1/4 h-full bg-amber-500"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#16191E] p-8 rounded-[2rem] border border-white/5">
                  <h3 className="font-bold text-white mb-4">Human-in-the-Loop</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">
                    The cognitive model learns from your feedback. Adjust the weights to guide the RL agent's reward function.
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-emerald-500/10 text-emerald-500 py-2 rounded-xl text-[10px] font-bold uppercase border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                      Reward State
                    </button>
                    <button className="flex-1 bg-red-500/10 text-red-400 py-2 rounded-xl text-[10px] font-bold uppercase border border-red-500/20 hover:bg-red-500/20 transition-all">
                      Penalize State
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const ProcessAnimation: React.FC<{ staffing: number }> = ({ staffing }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-12">
      <div className="relative w-full max-w-2xl h-64 border-b-4 border-slate-800 flex items-end justify-around">
        {/* Conveyor Belt */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-700"></div>
        
        {/* Animated Items */}
        {[0, 1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            initial={{ x: -100, opacity: 0 }}
            animate={{ 
              x: 800, 
              opacity: [0, 1, 1, 0],
              rotate: [0, 0, 10, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              delay: i * 0.8,
              ease: "linear"
            }}
            className="absolute bottom-4 w-12 h-12 bg-blue-600 rounded-lg shadow-lg flex items-center justify-center"
          >
            <Package size={20} className="text-white/50" />
          </motion.div>
        ))}

        {/* Processing Station */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-32 h-40 bg-[#1C2128] border-x-2 border-t-2 border-white/5 rounded-t-3xl flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
            <Cpu className="text-blue-400 animate-spin-slow" size={32} />
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, Math.floor(staffing / 5)) }).map((_, i) => (
              <div key={i} className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-12 grid grid-cols-3 gap-12 w-full max-w-2xl">
        <div className="text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Input Rate</div>
          <div className="text-xl font-bold text-white">24 u/m</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Processing</div>
          <div className="text-xl font-bold text-blue-400">Active</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Output Rate</div>
          <div className="text-xl font-bold text-white">22 u/m</div>
        </div>
      </div>
    </div>
  );
};


const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group",
      active 
        ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
    )}
  >
    <span className={cn("transition-transform group-hover:scale-110", active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")}>
      {icon}
    </span>
    <span className="font-semibold text-sm tracking-tight">{label}</span>
    {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
  </button>
);

const SimulationSlider: React.FC<{ label: string, value: number, min: number, max: number, step: number, prefix?: string, suffix?: string, onChange: (v: number) => void }> = ({ label, value, min, max, step, prefix, suffix, onChange }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-end">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      <span className="text-sm font-mono font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-lg border border-blue-400/20">
        {prefix}{value}{suffix}
      </span>
    </div>
    <input 
      type="range" 
      min={min} max={max} step={step} 
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-[#1C2128] rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
    />
  </div>
);

const ResourceBar: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300">{value}%</span>
    </div>
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={cn("h-full rounded-full", color)}
      />
    </div>
  </div>
);

export default App;
