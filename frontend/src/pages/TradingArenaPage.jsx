import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, API } from '../App';
import Layout from '../components/Layout';
import axios from 'axios';
import { 
  TrendingUp, TrendingDown, Wallet, RefreshCw, History, 
  BarChart3, ArrowUp, ArrowDown, DollarSign, Activity,
  ChevronDown, Search, Clock, Award, Target
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

const TradingArenaPage = () => {
  const { user, token } = useAuth();
  const [prices, setPrices] = useState({});
  const [portfolio, setPortfolio] = useState(null);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeAction, setTradeAction] = useState('buy');
  const [loading, setLoading] = useState(true);
  const [trading, setTrading] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [careerLevels, setCareerLevels] = useState([]);

  const fetchData = useCallback(async () => {
    if (!user || !token) return;
    
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [pricesRes, portfolioRes, historyRes, careerRes] = await Promise.all([
        axios.get(`${API}/v2/trading/market/prices`).catch(() => null),
        axios.get(`${API}/v2/trading/portfolio/${user.id}`, { headers }).catch(() => null),
        axios.get(`${API}/v2/trading/trades/${user.id}?limit=20`, { headers }).catch(() => null),
        axios.get(`${API}/v2/trading/career/levels`).catch(() => null)
      ]);

      if (pricesRes?.data?.prices) setPrices(pricesRes.data.prices);
      if (portfolioRes?.data) setPortfolio(portfolioRes.data);
      if (historyRes?.data?.trades) setTradeHistory(historyRes.data.trades);
      if (careerRes?.data?.levels) setCareerLevels(careerRes.data.levels);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const executeTrade = async () => {
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }

    setTrading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(
        `${API}/v2/trading/trade/${user.id}`,
        {
          symbol: selectedCrypto,
          action: tradeAction,
          amount: parseFloat(tradeAmount)
        },
        { headers }
      );

      if (response.data.success) {
        toast.success(`${tradeAction === 'buy' ? 'Achat' : 'Vente'} de ${tradeAmount} ${selectedCrypto} effectué !`);
        setTradeAmount('');
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors du trade');
    } finally {
      setTrading(false);
    }
  };

  const resetPortfolio = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir réinitialiser votre portfolio ? Vous perdrez tous vos trades.')) {
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        `${API}/v2/trading/portfolio/${user.id}/reset`,
        { starting_capital: 10000 },
        { headers }
      );
      toast.success('Portfolio réinitialisé avec 10,000$ !');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la réinitialisation');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement de l'arène...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const currentPrice = prices[selectedCrypto]?.price || 0;
  const totalCost = parseFloat(tradeAmount || 0) * currentPrice;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-6" data-testid="trading-arena-page">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4" data-testid="trading-header">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3" data-testid="page-title">
                <BarChart3 className="w-8 h-8 text-primary" />
                Trading Arena
              </h1>
              <p className="text-gray-400 mt-1">Simulateur de trading professionnel avec données live</p>
            </div>
            
            {portfolio?.career_level && (
              <div className="bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30 rounded-xl px-4 py-2" data-testid="career-level-badge">
                <p className="text-xs text-gray-400">Rang Carrière</p>
                <p className="font-bold text-primary" data-testid="career-level-name">{portfolio.career_level.current?.name || 'Stagiaire'}</p>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left Column - Market & Trading */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Portfolio Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="portfolio-summary-cards">
                <SummaryCard 
                  icon={Wallet}
                  label="Valeur Totale"
                  value={`$${portfolio?.total_value?.toLocaleString(undefined, {maximumFractionDigits: 2}) || '10,000'}`}
                  color="blue"
                  testId="summary-total-value"
                />
                <SummaryCard 
                  icon={DollarSign}
                  label="Cash"
                  value={`$${portfolio?.balance?.toLocaleString(undefined, {maximumFractionDigits: 2}) || '10,000'}`}
                  color="green"
                  testId="summary-cash"
                />
                <SummaryCard 
                  icon={portfolio?.total_pnl >= 0 ? TrendingUp : TrendingDown}
                  label="P&L Total"
                  value={`${portfolio?.total_pnl >= 0 ? '+' : ''}$${portfolio?.total_pnl?.toLocaleString(undefined, {maximumFractionDigits: 2}) || '0'}`}
                  color={portfolio?.total_pnl >= 0 ? 'green' : 'red'}
                  testId="summary-pnl"
                />
                <SummaryCard 
                  icon={Activity}
                  label="ROI"
                  value={`${portfolio?.total_pnl_percent >= 0 ? '+' : ''}${portfolio?.total_pnl_percent?.toFixed(2) || '0'}%`}
                  color={portfolio?.total_pnl_percent >= 0 ? 'green' : 'red'}
                  testId="summary-roi"
                />
              </div>

              {/* Market Prices Grid */}
              <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-xl p-6" data-testid="market-prices-section">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Prix du Marché</h2>
                  <Button variant="ghost" size="sm" onClick={fetchData} data-testid="refresh-prices-btn">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualiser
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="price-cards-grid">
                  {Object.entries(prices).map(([symbol, data]) => (
                    <PriceCard 
                      key={symbol}
                      symbol={symbol}
                      data={data}
                      selected={selectedCrypto === symbol}
                      onClick={() => setSelectedCrypto(symbol)}
                    />
                  ))}
                </div>
              </div>

              {/* Holdings */}
              {portfolio?.holdings?.length > 0 && (
                <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-xl p-6" data-testid="holdings-section">
                  <h2 className="text-xl font-bold text-white mb-4">Mes Positions</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full" data-testid="holdings-table">
                      <thead>
                        <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                          <th className="pb-3">Crypto</th>
                          <th className="pb-3">Quantité</th>
                          <th className="pb-3">Prix Actuel</th>
                          <th className="pb-3">Valeur</th>
                          <th className="pb-3">P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolio.holdings.map((holding) => (
                          <tr key={holding.symbol} className="border-b border-gray-800/50">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{holding.symbol}</span>
                                <span className="text-gray-500 text-sm">{holding.name}</span>
                              </div>
                            </td>
                            <td className="py-3 text-white">{holding.amount.toFixed(6)}</td>
                            <td className="py-3 text-white">${holding.current_price?.toLocaleString()}</td>
                            <td className="py-3 text-white">${holding.value?.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                            <td className={`py-3 font-medium ${holding.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {holding.pnl >= 0 ? '+' : ''}{holding.pnl?.toFixed(2)}$
                              <span className="text-xs ml-1">({holding.pnl_percent?.toFixed(2)}%)</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Trade History */}
              <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-xl p-6" data-testid="trade-history-section">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Historique des Trades
                </h2>
                
                {tradeHistory.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto" data-testid="trade-history-list">
                    {tradeHistory.map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg" data-testid="trade-history-item">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            trade.action === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            {trade.action === 'buy' ? (
                              <ArrowUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {trade.action === 'buy' ? 'Achat' : 'Vente'} {trade.symbol}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(trade.timestamp).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white">{trade.amount.toFixed(6)} {trade.symbol}</p>
                          <p className="text-sm text-gray-400">@ ${trade.price?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun trade effectué</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Trade Panel */}
            <div className="space-y-6">
              
              {/* Trade Form */}
              <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-xl p-6 sticky top-6" data-testid="trade-form">
                <h2 className="text-xl font-bold text-white mb-4">Passer un Ordre</h2>
                
                {/* Selected Crypto Display */}
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4" data-testid="selected-crypto">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-white" data-testid="selected-symbol">{selectedCrypto}</p>
                      <p className="text-sm text-gray-400">{prices[selectedCrypto]?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white" data-testid="selected-price">
                        ${currentPrice?.toLocaleString(undefined, {maximumFractionDigits: currentPrice < 1 ? 4 : 2})}
                      </p>
                      <p className={`text-sm ${prices[selectedCrypto]?.change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {prices[selectedCrypto]?.change_24h >= 0 ? '+' : ''}{prices[selectedCrypto]?.change_24h?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buy/Sell Toggle */}
                <div className="grid grid-cols-2 gap-2 mb-4" data-testid="trade-action-toggle">
                  <button
                    onClick={() => setTradeAction('buy')}
                    data-testid="buy-button"
                    className={`py-3 rounded-lg font-bold transition-all ${
                      tradeAction === 'buy'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Acheter
                  </button>
                  <button
                    onClick={() => setTradeAction('sell')}
                    data-testid="sell-button"
                    className={`py-3 rounded-lg font-bold transition-all ${
                      tradeAction === 'sell'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Vendre
                  </button>
                </div>

                {/* Amount Input */}
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-2 block">Quantité ({selectedCrypto})</label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white text-lg"
                    data-testid="trade-amount-input"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[0.001, 0.01, 0.1, 1].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTradeAmount(amount.toString())}
                      className="py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-400 transition-colors"
                    >
                      {amount}
                    </button>
                  ))}
                </div>

                {/* Total */}
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4" data-testid="trade-total">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Total estimé</span>
                    <span>USD</span>
                  </div>
                  <p className="text-2xl font-bold text-white" data-testid="estimated-total">
                    ${totalCost.toLocaleString(undefined, {maximumFractionDigits: 2})}
                  </p>
                </div>

                {/* Execute Button */}
                <Button
                  onClick={executeTrade}
                  disabled={trading || !tradeAmount}
                  data-testid="execute-trade-btn"
                  className={`w-full py-6 text-lg font-bold ${
                    tradeAction === 'buy' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {trading ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      {tradeAction === 'buy' ? 'Acheter' : 'Vendre'} {selectedCrypto}
                    </>
                  )}
                </Button>

                {/* Available Balance */}
                <p className="text-center text-sm text-gray-500 mt-3" data-testid="available-balance">
                  Solde disponible: ${portfolio?.balance?.toLocaleString(undefined, {maximumFractionDigits: 2}) || '10,000'}
                </p>

                {/* Reset Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetPortfolio}
                  className="w-full mt-4 text-gray-500 hover:text-white"
                  data-testid="reset-portfolio-btn"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Réinitialiser le portfolio
                </Button>
              </div>

              {/* Career Progress */}
              {careerLevels.length > 0 && portfolio?.career_level && (
                <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-xl p-6" data-testid="career-progress-section">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Progression Carrière
                  </h3>
                  
                  <div className="space-y-2">
                    {careerLevels.slice(0, 5).map((level, index) => {
                      const currentLevel = portfolio.career_level.current?.level || 1;
                      const isUnlocked = currentLevel >= level.level;
                      const isCurrent = currentLevel === level.level;
                      
                      return (
                        <div 
                          key={level.level}
                          className={`p-3 rounded-lg ${
                            isCurrent ? 'bg-primary/20 border border-primary' :
                            isUnlocked ? 'bg-gray-800/50' : 'bg-gray-800/30 opacity-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg ${isCurrent ? 'text-primary' : isUnlocked ? 'text-green-500' : 'text-gray-500'}`}>
                                {isUnlocked ? '✓' : '🔒'}
                              </span>
                              <span className={`font-medium ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                                {level.name}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">${level.capital.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Sub-components
const SummaryCard = ({ icon: Icon, label, value, color, testId }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };
  
  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`} data-testid={testId}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
};

const PriceCard = ({ symbol, data, selected, onClick }) => {
  const isPositive = data.change_24h >= 0;
  
  return (
    <button
      onClick={onClick}
      data-testid={`price-card-${symbol}`}
      className={`w-full p-3 rounded-lg text-left transition-all ${
        selected 
          ? 'bg-primary/20 border-2 border-primary' 
          : 'bg-gray-800/50 border-2 border-transparent hover:border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-white">{symbol}</span>
        {isPositive ? (
          <ArrowUp className="w-3 h-3 text-green-500" />
        ) : (
          <ArrowDown className="w-3 h-3 text-red-500" />
        )}
      </div>
      <p className="text-lg font-medium text-white">
        ${data.price?.toLocaleString(undefined, {maximumFractionDigits: data.price < 1 ? 4 : 2})}
      </p>
      <p className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? '+' : ''}{data.change_24h?.toFixed(2)}%
      </p>
    </button>
  );
};

export default TradingArenaPage;
