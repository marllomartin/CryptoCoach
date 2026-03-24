import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API, useAuth } from '../App';
import { toast } from 'sonner';
import { SubscriptionGate, useSubscriptionAccess } from '../components/SubscriptionGate';
import { 
  TrendingUp, 
  TrendingDown,
  Wallet,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PieChart
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

function SimulatorContent() {
  const { token } = useAuth();
  const [prices, setPrices] = useState({});
  const [portfolio, setPortfolio] = useState({ balance: 10000, portfolio: {} });
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('buy');
  const [trading, setTrading] = useState(false);

  const fetchPrices = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/simulator/prices`);
      setPrices(response.data.prices);
    } catch (e) {
      console.error('Failed to fetch prices', e);
    }
  }, []);

  const fetchPortfolio = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API}/simulator/portfolio`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPortfolio(response.data);
    } catch (e) {
      console.error('Failed to fetch portfolio', e);
    }
  }, [token]);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchPrices(), fetchPortfolio()]);
      setLoading(false);
    };
    init();

    // Refresh prices every 10 seconds
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, [fetchPrices, fetchPortfolio]);

  const executeTrade = async () => {
    if (!token || !amount || !selectedCrypto) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setTrading(true);
    try {
      const response = await axios.post(`${API}/simulator/trade`, {
        symbol: selectedCrypto,
        action,
        amount: numAmount,
        price: prices[selectedCrypto]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPortfolio({ balance: response.data.balance, portfolio: response.data.portfolio });
      setAmount('');
      toast.success(`Successfully ${action === 'buy' ? 'bought' : 'sold'} ${numAmount} ${selectedCrypto}`);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Trade failed');
    } finally {
      setTrading(false);
    }
  };

  const calculatePortfolioValue = () => {
    let total = portfolio.balance;
    Object.entries(portfolio.portfolio || {}).forEach(([symbol, amount]) => {
      if (prices[symbol]) {
        total += amount * prices[symbol];
      }
    });
    return total;
  };

  const calculatePnL = () => {
    const current = calculatePortfolioValue();
    const initial = 10000;
    return current - initial;
  };

  const cryptoList = Object.keys(prices);
  const pnl = calculatePnL();
  const totalValue = calculatePortfolioValue();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Trading <span className="text-primary">Simulator</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Practice trading strategies with virtual funds. No real money at risk.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2].map(i => (
                <Card key={i} className="bg-card border-border animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-40 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="bg-card border-border animate-pulse">
              <CardContent className="p-6">
                <div className="h-80 bg-muted rounded" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Portfolio Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-primary" />
                        Portfolio Overview
                      </span>
                      <Button variant="ghost" size="sm" onClick={fetchPortfolio}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-sm text-slate-400 mb-1">Total Value</div>
                        <div className="text-2xl font-heading font-bold">
                          ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-sm text-slate-400 mb-1">Cash Balance</div>
                        <div className="text-2xl font-heading font-bold">
                          ${portfolio.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-sm text-slate-400 mb-1">Total P&L</div>
                        <div className={`text-2xl font-heading font-bold flex items-center gap-1 ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {pnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          ${Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {/* Holdings */}
                    {Object.keys(portfolio.portfolio || {}).length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-slate-400 mb-3">Your Holdings</h4>
                        <div className="space-y-2">
                          {Object.entries(portfolio.portfolio).map(([symbol, amount]) => (
                            <div key={symbol} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-primary font-bold text-sm">{symbol.slice(0, 2)}</span>
                                </div>
                                <div>
                                  <div className="font-medium">{symbol}</div>
                                  <div className="text-sm text-slate-400">{amount.toFixed(4)} coins</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  ${(amount * (prices[symbol] || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className="text-sm text-slate-400">
                                  @ ${prices[symbol]?.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Market Prices */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Live Market Prices
                      </span>
                      <Button variant="ghost" size="sm" onClick={fetchPrices}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {cryptoList.map(symbol => (
                        <div 
                          key={symbol}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedCrypto === symbol 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-slate-600'
                          }`}
                          onClick={() => setSelectedCrypto(symbol)}
                        >
                          <div className="text-sm text-slate-400 mb-1">{symbol}</div>
                          <div className="text-lg font-bold">
                            ${prices[symbol]?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Trading Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card border-border sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    Trade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Buy/Sell Toggle */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={action === 'buy' ? 'default' : 'outline'}
                      className={action === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'border-slate-700'}
                      onClick={() => setAction('buy')}
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Buy
                    </Button>
                    <Button
                      variant={action === 'sell' ? 'default' : 'outline'}
                      className={action === 'sell' ? 'bg-red-600 hover:bg-red-700' : 'border-slate-700'}
                      onClick={() => setAction('sell')}
                    >
                      <ArrowDownRight className="w-4 h-4 mr-2" />
                      Sell
                    </Button>
                  </div>

                  {/* Crypto Selection */}
                  <div className="space-y-2">
                    <Label>Cryptocurrency</Label>
                    <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                      <SelectTrigger className="bg-muted border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cryptoList.map(symbol => (
                          <SelectItem key={symbol} value={symbol}>
                            {symbol} - ${prices[symbol]?.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label>Amount (coins)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-muted border-border"
                    />
                    {amount && prices[selectedCrypto] && (
                      <p className="text-sm text-slate-400">
                        Total: ${(parseFloat(amount) * prices[selectedCrypto]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>

                  {/* Quick Amounts */}
                  <div className="grid grid-cols-4 gap-2">
                    {[0.01, 0.1, 0.5, 1].map(val => (
                      <Button
                        key={val}
                        variant="outline"
                        size="sm"
                        className="border-slate-700"
                        onClick={() => setAmount(val.toString())}
                      >
                        {val}
                      </Button>
                    ))}
                  </div>

                  {/* Execute Button */}
                  <Button
                    className={`w-full ${action === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    disabled={!amount || trading}
                    onClick={executeTrade}
                  >
                    {trading ? 'Processing...' : `${action === 'buy' ? 'Buy' : 'Sell'} ${selectedCrypto}`}
                  </Button>

                  {/* Balance Info */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Available Balance</span>
                      <span className="font-medium">${portfolio.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    {portfolio.portfolio?.[selectedCrypto] > 0 && (
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-slate-400">{selectedCrypto} Owned</span>
                        <span className="font-medium">{portfolio.portfolio[selectedCrypto].toFixed(4)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-4 bg-muted/50 rounded-lg text-center text-sm text-slate-500"
        >
          <DollarSign className="w-5 h-5 inline mr-2" />
          This simulator uses virtual funds only. No real money is involved. Prices are simulated and may not reflect actual market values.
        </motion.div>
      </div>
    </Layout>
  );
}

export default function SimulatorPage() {
  const { canAccessSimulator } = useSubscriptionAccess();
  
  if (!canAccessSimulator) {
    return (
      <Layout>
        <SubscriptionGate 
          requiredTier="starter" 
          feature="Le Simulateur de Trading"
        />
      </Layout>
    );
  }
  
  return <SimulatorContent />;
}
