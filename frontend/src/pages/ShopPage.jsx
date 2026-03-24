import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API } from '../App';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import axios from 'axios';
import { 
  Store, Zap, Snowflake, Scissors, FastForward, Lightbulb,
  User, Square, Award, Image, Edit, RefreshCw, ShoppingCart,
  Coins, Check, Lock, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const ICON_MAP = {
  zap: Zap,
  snowflake: Snowflake,
  scissors: Scissors,
  'fast-forward': FastForward,
  lightbulb: Lightbulb,
  user: User,
  square: Square,
  award: Award,
  image: Image,
  edit: Edit,
  'refresh-cw': RefreshCw,
  coins: Coins
};

const ShopPage = () => {
  const { user, token } = useAuth();
  const { t, i18n } = useTranslation();
  const [shopItems, setShopItems] = useState({});
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [activeTab, setActiveTab] = useState('boosters');

  const fetchData = useCallback(async () => {
    try {
      const [itemsRes, inventoryRes] = await Promise.all([
        axios.get(`${API}/v2/shop/items`),
        user ? axios.get(`${API}/v2/shop/inventory/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }) : null
      ]);

      setShopItems(itemsRes.data.items || {});
      if (inventoryRes) setInventory(inventoryRes.data);
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const purchaseItem = async (itemId) => {
    if (!user) {
      toast.error('Please login to purchase');
      return;
    }

    setPurchasing(itemId);
    try {
      const response = await axios.post(
        `${API}/v2/shop/purchase/${user.id}`,
        { item_id: itemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Purchased successfully! New balance: ${response.data.new_balance} coins`);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const getLocalizedName = (item) => {
    if (i18n.language === 'fr' && item.name_fr) return item.name_fr;
    if (i18n.language === 'ar' && item.name_ar) return item.name_ar;
    return item.name;
  };

  const getLocalizedDesc = (item) => {
    if (i18n.language === 'fr' && item.description_fr) return item.description_fr;
    if (i18n.language === 'ar' && item.description_ar) return item.description_ar;
    return item.description;
  };

  const categories = [
    { id: 'boosters', name: 'Boosters', icon: Zap },
    { id: 'quiz_powerups', name: 'Quiz Power-ups', icon: Lightbulb },
    { id: 'cosmetics', name: 'Cosmetics', icon: Sparkles },
    { id: 'special', name: 'Special', icon: Award }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-full mb-4">
              <Store className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-500 font-medium">Shop</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">CryptoCoach Shop</h1>
            <p className="text-gray-400">Spend your coins on boosters, power-ups, and cosmetics</p>
          </div>

          {/* Balance Card */}
          {inventory && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-yellow-500/30 rounded-xl flex items-center justify-center">
                    <Coins className="w-7 h-7 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Your Balance</p>
                    <p className="text-3xl font-bold text-white">{inventory.coins.toLocaleString()} <span className="text-yellow-500">Coins</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Active Boosters: {inventory.active_boosters?.length || 0}</p>
                  <p className="text-sm text-gray-400">Streak Freezes: {inventory.streak_freezes || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === cat.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Items Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(shopItems[activeTab] || []).map((item) => {
              const Icon = ICON_MAP[item.icon] || Sparkles;
              const owned = inventory?.inventory?.[item.id] || 0;
              const isCosmetic = item.category === 'cosmetics';
              const alreadyOwned = isCosmetic && inventory?.owned_cosmetics?.includes(item.id);
              const canAfford = inventory ? inventory.coins >= item.price : false;
              const maxReached = item.max_owned && owned >= item.max_owned;

              return (
                <div
                  key={item.id}
                  className={`bg-gray-900/60 border rounded-xl p-5 transition-all ${
                    alreadyOwned ? 'border-green-500/30 bg-green-500/5' :
                    !canAfford ? 'border-gray-800 opacity-60' :
                    'border-gray-800 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      alreadyOwned ? 'bg-green-500/20' : 'bg-primary/20'
                    }`}>
                      <Icon className={`w-6 h-6 ${alreadyOwned ? 'text-green-500' : 'text-primary'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">{getLocalizedName(item)}</h3>
                      <p className="text-sm text-gray-400 mb-3">{getLocalizedDesc(item)}</p>
                      
                      {owned > 0 && !isCosmetic && (
                        <p className="text-xs text-primary mb-2">Owned: {owned}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-yellow-500 font-bold">
                          <Coins className="w-4 h-4" />
                          {item.price}
                        </div>

                        {alreadyOwned ? (
                          <span className="flex items-center gap-1 text-green-500 text-sm">
                            <Check className="w-4 h-4" />
                            Owned
                          </span>
                        ) : maxReached ? (
                          <span className="text-gray-500 text-sm">Max owned</span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => purchaseItem(item.id)}
                            disabled={!canAfford || purchasing === item.id}
                            className={canAfford ? '' : 'opacity-50'}
                          >
                            {purchasing === item.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : !canAfford ? (
                              <><Lock className="w-4 h-4 mr-1" /> Locked</>
                            ) : (
                              <><ShoppingCart className="w-4 h-4 mr-1" /> Buy</>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Boosters */}
          {inventory?.active_boosters?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-white mb-4">Active Boosters</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {inventory.active_boosters.map((booster, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap className="w-6 h-6 text-primary" />
                        <div>
                          <p className="font-medium text-white">{booster.item_id}</p>
                          <p className="text-xs text-gray-400">
                            Expires: {new Date(booster.expires_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-primary font-bold">
                        {booster.effect.xp_multiplier ? `${booster.effect.xp_multiplier}x XP` : ''}
                        {booster.effect.coins_multiplier ? `${booster.effect.coins_multiplier}x Coins` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ShopPage;
