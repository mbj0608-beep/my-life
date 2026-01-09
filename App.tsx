
import React, { useState, useEffect } from 'react';
import { 
  Gender, 
  GameState, 
  Stats, 
  Relationship, 
  Asset, 
  Achievement, 
  GeminiEventResponse,
  StockHolding
} from './types';
import { 
  SURNAMES, 
  NAMES_MALE, 
  NAMES_FEMALE, 
  INITIAL_ACHIEVEMENTS,
  MARKET_HOUSES,
  MARKET_CARS,
  ACTIONS,
  STOCKS
} from './constants';
import { generateYearEvent, generateLifeSummary } from './geminiService';
import StatBar from './components/StatBar';
import EventModal from './components/EventModal';

const App: React.FC = () => {
  const [phase, setPhase] = useState<'START' | 'CREATION' | 'POINTS' | 'GAMEPLAY'>('START');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [creationData, setCreationData] = useState({ name: '', gender: Gender.MALE });
  const [allocPoints, setAllocPoints] = useState<Stats>({
    health: 50, intelligence: 50, charm: 50, happiness: 50,
    willpower: 50, finance: 50, social: 50, creativity: 50, luck: 50
  });
  const [remainingPoints, setRemainingPoints] = useState(30);

  const [currentEvent, setCurrentEvent] = useState<GeminiEventResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'assets' | 'social' | 'invest'>('status');
  const [lifeSummary, setLifeSummary] = useState<string | null>(null);
  const [stockPrices, setStockPrices] = useState<Record<string, number>>({});
  
  // Modals state
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);

  useEffect(() => {
    // Initialize stock prices
    const initialPrices: Record<string, number> = {};
    STOCKS.forEach(s => initialPrices[s.symbol] = s.price);
    setStockPrices(initialPrices);
  }, []);

  const handleCreateChar = () => {
    if (!creationData.name) return;
    setPhase('POINTS');
  };

  const handleFinalizePoints = () => {
    const newState: GameState = {
      age: 0,
      name: creationData.name,
      gender: creationData.gender,
      stats: { ...allocPoints },
      energy: 100,
      money: 5000,
      job: '婴儿',
      education: '无',
      history: ['开启了一段崭新的生命旅程。'],
      relationships: [
        { id: 'dad', name: creationData.name[0] + '大强', relation: '父亲', closeness: 80, status: '健康', age: 30 },
        { id: 'mom', name: '陈美玲', relation: '母亲', closeness: 90, status: '健康', age: 28 },
      ],
      assets: [],
      stocks: [],
      achievements: [...INITIAL_ACHIEVEMENTS],
      isDead: false,
    };
    setGameState(newState);
    setPhase('GAMEPLAY');
  };

  const adjustPoint = (key: keyof Stats, delta: number) => {
    if (delta > 0 && remainingPoints <= 0) return;
    if (delta < 0 && allocPoints[key] <= 0) return;
    setAllocPoints(prev => ({ ...prev, [key]: prev[key] + delta }));
    setRemainingPoints(prev => prev - delta);
  };

  const processYear = async () => {
    if (!gameState || gameState.isDead) return;
    setLoading(true);

    // Stock Market Volatility
    const newPrices = { ...stockPrices };
    Object.keys(newPrices).forEach(symbol => {
      const stock = STOCKS.find(s => s.symbol === symbol);
      const change = (Math.random() - 0.45) * (stock?.risk || 0.1) * 2;
      newPrices[symbol] = Math.max(1, Math.round(newPrices[symbol] * (1 + change)));
    });
    setStockPrices(newPrices);

    try {
      const event = await generateYearEvent(gameState);
      setCurrentEvent(event);
    } catch (error) {
      setCurrentEvent({
        title: "时光流逝",
        description: "这一年过得很快，没有什么波澜。",
        options: [{ text: "顺其自然", impactDescription: "平和", statsImpact: { happiness: 5 }, storyResult: "生活在平淡中继续。" }]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (option: GeminiEventResponse['options'][0]) => {
    if (!gameState) return;
    const newStats = { ...gameState.stats };
    Object.keys(option.statsImpact).forEach(key => {
      if (key !== 'money') {
        const k = key as keyof Stats;
        newStats[k] = Math.max(0, Math.min(100, newStats[k] + (option.statsImpact[k] || 0)));
      }
    });

    const newMoney = gameState.money + (option.statsImpact.money || 0) - gameState.assets.reduce((s, a) => s + a.upkeep, 0);
    const newAge = gameState.age + 1;
    const newHistory = [...gameState.history, `${newAge}岁：${option.storyResult}`];

    let newState: GameState = {
      ...gameState,
      age: newAge,
      stats: newStats,
      money: newMoney,
      history: newHistory,
      energy: 100,
      relationships: gameState.relationships.map(r => ({ ...r, age: r.age + 1, closeness: Math.max(0, r.closeness - 2) }))
    };

    if (newState.stats.health <= 0 || (newState.age > 60 && Math.random() < (newState.age - 60) * 0.05)) {
      newState.isDead = true;
      newState.deathReason = "生命耗尽。";
      setGameState(newState);
      const summary = await generateLifeSummary(newState);
      setLifeSummary(summary);
    } else {
      setGameState(newState);
    }
    setCurrentEvent(null);
  };

  const buyStock = (symbol: string) => {
    if (!gameState) return;
    const price = stockPrices[symbol];
    if (gameState.money < price) return;
    
    setGameState(prev => {
      if (!prev) return null;
      const stocks = [...prev.stocks];
      const idx = stocks.findIndex(s => s.symbol === symbol);
      if (idx > -1) {
        const old = stocks[idx];
        const newAvg = (old.avgPrice * old.amount + price) / (old.amount + 1);
        stocks[idx] = { ...old, amount: old.amount + 1, avgPrice: newAvg };
      } else {
        const name = STOCKS.find(s => s.symbol === symbol)?.name || symbol;
        stocks.push({ symbol, name, amount: 1, avgPrice: price });
      }
      return { ...prev, money: prev.money - price, stocks };
    });
  };

  const sellStock = (symbol: string) => {
    if (!gameState) return;
    const price = stockPrices[symbol];
    setGameState(prev => {
      if (!prev) return null;
      const stocks = [...prev.stocks];
      const idx = stocks.findIndex(s => s.symbol === symbol);
      if (idx === -1 || stocks[idx].amount <= 0) return prev;
      
      const newStocks = stocks.map((s, i) => i === idx ? { ...s, amount: s.amount - 1 } : s).filter(s => s.amount > 0);
      return { ...prev, money: prev.money + price, stocks: newStocks };
    });
  };

  const sellAsset = (id: string) => {
    setGameState(prev => {
      if (!prev) return null;
      const asset = prev.assets.find(a => a.id === id);
      if (!asset) return prev;
      return {
        ...prev,
        money: prev.money + Math.round(asset.value * 0.5),
        assets: prev.assets.filter(a => a.id !== id),
        history: [...prev.history, `${prev.age}岁：折价卖出了${asset.name}。`]
      };
    });
  };

  const buyMarketAsset = (item: any, type: 'HOUSE' | 'CAR') => {
    if (!gameState || gameState.money < item.price) return;
    const newAsset: Asset = { id: Math.random().toString(36).substr(2, 9), name: item.name, type, value: item.price, upkeep: item.upkeep };
    setGameState(prev => prev ? { ...prev, money: prev.money - item.price, assets: [...prev.assets, newAsset] } : null);
  };

  if (phase === 'START') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
        <h1 className="text-5xl font-black mb-8 tracking-tighter text-indigo-400">第二人生</h1>
        <button onClick={() => setPhase('CREATION')} className="bg-indigo-600 px-12 py-4 rounded-full font-bold text-xl hover:scale-105 transition shadow-lg shadow-indigo-500/50">开始模拟</button>
      </div>
    );
  }

  if (phase === 'CREATION') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 p-6 max-w-md mx-auto">
        <h2 className="text-3xl font-black text-gray-800 mb-8">设定你的初始信息</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">你的姓名</label>
            <input 
              type="text" 
              className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 outline-none transition" 
              placeholder="请输入名字"
              value={creationData.name}
              onChange={e => setCreationData({ ...creationData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">性别</label>
            <div className="flex gap-4">
              {[Gender.MALE, Gender.FEMALE].map(g => (
                <button 
                  key={g}
                  onClick={() => setCreationData({ ...creationData, gender: g })}
                  className={`flex-1 p-4 rounded-2xl font-bold transition ${creationData.gender === g ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-gray-100 text-gray-400'}`}
                >
                  {g === Gender.MALE ? '♂ 男' : '♀ 女'}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleCreateChar} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black mt-10">下一步：属性分配</button>
        </div>
      </div>
    );
  }

  if (phase === 'POINTS') {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 p-6 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-800">属性分配</h2>
          <div className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-sm font-bold">剩余：{remainingPoints}</div>
        </div>
        <div className="space-y-4 flex-1 overflow-y-auto pb-24">
          {Object.entries(allocPoints).map(([key, val]) => (
            <div key={key} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <span className="font-bold text-gray-600">{
                {health:'健康',intelligence:'智力',charm:'魅力',happiness:'快乐',willpower:'毅力',finance:'财商',social:'社交',creativity:'创造力',luck:'幸运'}[key]
              }</span>
              <div className="flex items-center gap-4">
                <button onClick={() => adjustPoint(key as keyof Stats, -5)} className="w-8 h-8 rounded-full border-2 border-gray-100 flex items-center justify-center font-bold text-gray-400">-</button>
                <span className="w-8 text-center font-bold text-indigo-600">{val}</span>
                <button onClick={() => adjustPoint(key as keyof Stats, 5)} className="w-8 h-8 rounded-full border-2 border-gray-100 flex items-center justify-center font-bold text-gray-400">+</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleFinalizePoints} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black mt-4">降临人世</button>
      </div>
    );
  }

  if (gameState?.isDead) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-900 text-white p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold text-center mt-10 mb-4 text-slate-400">墓志铭</h1>
        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl mb-8 text-center">
          <div className="text-6xl mb-4">🕯️</div>
          <h2 className="text-2xl font-bold mb-2">{gameState.name} 之墓</h2>
          <p className="text-slate-400 mb-6">{gameState.gender} · {gameState.age} 岁</p>
          <div className="prose prose-invert text-slate-300 italic leading-relaxed text-sm">
            {lifeSummary || "正在回放你的一生..."}
          </div>
        </div>
        <button onClick={() => window.location.reload()} className="bg-indigo-600 w-full py-4 rounded-2xl font-bold text-lg">开启下一轮人生</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-28 max-w-md mx-auto relative overflow-x-hidden">
      {/* HUD */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 p-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-gray-800">{gameState?.name}</h1>
            <p className="text-xs font-bold text-indigo-500">{gameState?.age}岁 · {gameState?.job}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-emerald-600">¥{gameState?.money.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatBar label="体力" value={gameState?.energy || 0} color="bg-orange-500" />
          <StatBar label="健康" value={gameState?.stats.health || 0} color="bg-rose-500" />
          <StatBar label="智力" value={gameState?.stats.intelligence || 0} color="bg-blue-500" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'status' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">年度生活计划</h2>
              <div className="grid grid-cols-1 gap-2">
                {ACTIONS.map(action => (
                  <button 
                    key={action.id}
                    disabled={gameState!.energy < action.energy || (action.cost > 0 && gameState!.money < action.cost)}
                    className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center active:bg-gray-50 disabled:opacity-50"
                    onClick={() => {
                      // Trigger mini-event for actions
                      setCurrentEvent({
                        title: action.name,
                        description: `你决定去${action.name}，生活可能会发生一些变化。`,
                        options: [{
                          text: "全力以赴",
                          impactDescription: action.desc,
                          statsImpact: { money: -action.cost }, // Mock impact
                          storyResult: `全身心地投入到了${action.name}中。`
                        }]
                      });
                      setGameState(p => p ? { ...p, energy: p.energy - action.energy } : null);
                    }}
                  >
                    <div>
                      <p className="font-bold text-sm text-gray-800">{action.name}</p>
                      <p className="text-[10px] text-gray-400">{action.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-black ${action.cost > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{action.cost > 0 ? `-¥${action.cost}` : `+¥${Math.abs(action.cost)}`}</p>
                      <p className="text-[10px] text-gray-400">⚡{action.energy}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">时光机</h2>
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                {gameState?.history.slice(-3).reverse().map((h, i) => <p key={i} className="text-sm text-gray-600 mb-2 border-l-2 border-indigo-200 pl-3">{h}</p>)}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-xs font-bold text-gray-400 mb-3 uppercase">已购资产</h2>
              {gameState?.assets.length === 0 ? <p className="text-center text-gray-300 py-8">身无分文，名下无房无车</p> : (
                gameState?.assets.map(a => (
                  <div key={a.id} className="bg-white p-4 rounded-2xl mb-2 flex justify-between items-center border border-gray-100">
                    <div><p className="font-bold text-sm">{a.name}</p><p className="text-[10px] text-gray-400">价值 ¥{a.value.toLocaleString()}</p></div>
                    <button onClick={() => sellAsset(a.id)} className="bg-rose-50 text-rose-500 px-4 py-1 rounded-full text-xs font-bold">5折卖出</button>
                  </div>
                ))
              )}
            </section>
            <section>
              <h2 className="text-xs font-bold text-gray-400 mb-3 uppercase">房产中心</h2>
              {MARKET_HOUSES.map(h => (
                <button key={h.name} onClick={() => buyMarketAsset(h, 'HOUSE')} disabled={gameState!.money < h.price} className="w-full bg-white p-4 rounded-2xl mb-2 border flex justify-between items-center disabled:opacity-50">
                  <div className="text-left"><p className="font-bold text-sm">{h.name}</p><p className="text-[10px] text-gray-400">{h.description}</p></div>
                  <p className="font-black text-indigo-600">¥{h.price.toLocaleString()}</p>
                </button>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'invest' && (
          <div className="space-y-6">
            <section>
              <h2 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">证劵交易中心</h2>
              <div className="grid grid-cols-1 gap-3">
                {STOCKS.map(s => (
                  <div key={s.symbol} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div><h3 className="font-black text-gray-800">{s.name}</h3><p className="text-xs text-gray-400">{s.symbol}</p></div>
                      <div className="text-right"><p className="text-xl font-black text-indigo-600">¥{stockPrices[s.symbol]}</p></div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => buyStock(s.symbol)} className="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-bold">买入</button>
                      <button onClick={() => sellStock(s.symbol)} className="flex-1 bg-rose-500 text-white py-2 rounded-xl font-bold">卖出</button>
                    </div>
                    {gameState?.stocks.find(h => h.symbol === s.symbol) && (
                      <div className="mt-3 text-[10px] text-gray-400 border-t pt-2 flex justify-between">
                        <span>持仓：{gameState.stocks.find(h => h.symbol === s.symbol)?.amount} 股</span>
                        <span className={stockPrices[s.symbol] > (gameState.stocks.find(h => h.symbol === s.symbol)?.avgPrice || 0) ? 'text-emerald-500' : 'text-rose-500'}>
                          盈亏：{Math.round((stockPrices[s.symbol] - (gameState.stocks.find(h => h.symbol === s.symbol)?.avgPrice || 0)) * (gameState.stocks.find(h => h.symbol === s.symbol)?.amount || 0))}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-4">
            {gameState?.relationships.map(rel => (
              <button key={rel.id} onClick={() => setSelectedRelationship(rel)} className="w-full bg-white p-4 rounded-2xl border flex justify-between items-center">
                <div className="text-left"><p className="font-bold text-gray-800">{rel.name}</p><p className="text-xs text-gray-400">{rel.relation} · {rel.age}岁</p></div>
                <div className="text-right"><p className="text-[10px] text-gray-400">亲密 {rel.closeness}%</p><div className="w-16 h-1 bg-rose-100 rounded-full overflow-hidden"><div className="h-full bg-rose-400" style={{width:`${rel.closeness}%`}}/></div></div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pb-8 pt-2 z-40 max-w-md mx-auto">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-1 gap-1">
            <button onClick={() => setActiveTab('status')} className={`flex-1 flex flex-col items-center py-2 rounded-xl ${activeTab === 'status' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400'}`}><span className="text-xl">🏠</span><span className="text-[10px] font-bold">状态</span></button>
            <button onClick={() => setActiveTab('invest')} className={`flex-1 flex flex-col items-center py-2 rounded-xl ${activeTab === 'invest' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400'}`}><span className="text-xl">📈</span><span className="text-[10px] font-bold">投资</span></button>
          </div>
          <button disabled={loading} onClick={processYear} className="w-20 h-20 bg-indigo-600 rounded-full shadow-2xl flex flex-col items-center justify-center text-white active:scale-95 transition -mt-10 border-4 border-white">
            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span className="text-sm font-black">下一年</span><span className="text-xs opacity-70">Next</span></>}
          </button>
          <div className="flex flex-1 gap-1">
            <button onClick={() => setActiveTab('assets')} className={`flex-1 flex flex-col items-center py-2 rounded-xl ${activeTab === 'assets' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400'}`}><span className="text-xl">🏢</span><span className="text-[10px] font-bold">资产</span></button>
            <button onClick={() => setActiveTab('social')} className={`flex-1 flex flex-col items-center py-2 rounded-xl ${activeTab === 'social' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400'}`}><span className="text-xl">👥</span><span className="text-[10px] font-bold">社交</span></button>
          </div>
        </div>
      </nav>

      {currentEvent && <EventModal event={currentEvent} onSelect={handleOptionSelect} />}
    </div>
  );
};

export default App;
