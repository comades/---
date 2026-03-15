
import React, { useState } from 'react';
import { ViewProps, ShopItem, Game, Course } from '../types';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Coins, CreditCard, Wallet, CheckCircle2, ArrowRight, Package, GraduationCap, Gamepad2, CheckCircle, BookOpen } from 'lucide-react';
import { Button } from '../components/Button';
import { motion, AnimatePresence } from 'motion/react';

export const Shop: React.FC<ViewProps> = ({ setView }) => {
  const { t } = useTranslation();
  const { games, courses, products, systemSettings, purchaseGame, purchaseCourse, purchaseProduct } = useGame();
  const { user, updateProfile } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'TICKETS' | 'GAMES' | 'COURSES' | 'PRODUCTS'>('TICKETS');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmPurchase, setConfirmPurchase] = useState<{ item: any, price: number } | null>(null);

  const ticketPacks = systemSettings?.ticketPacks || [
    { id: 't1', name: '新手禮包', description: '包含 100 張券', price: 0, cashPrice: 10, tickets: 100, icon: Coins },
    { id: 't2', name: '進階禮包', description: '包含 550 張券 (多送 50 張)', price: 0, cashPrice: 50, tickets: 550, icon: Coins },
    { id: 't3', name: '大師禮包', description: '包含 1200 張券 (多送 200 張)', price: 0, cashPrice: 100, tickets: 1200, icon: Coins },
  ];

  const handlePurchase = async (item: any) => {
    if (!user) {
      setView('LOGIN');
      return;
    }

    if (activeCategory === 'TICKETS') {
      setConfirmPurchase({ item, price: item.cashPrice });
    } else {
      const price = item.ticketPrice || item.price || 100;
      if ((user.points || 0) < price) {
        setSuccessMessage(t('shop.insufficient'));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        return;
      }
      setConfirmPurchase({ item, price });
    }
  };

  const executePurchase = async () => {
    if (!confirmPurchase || !user) return;
    const { item, price } = confirmPurchase;

    try {
      if (activeCategory === 'TICKETS') {
        await updateProfile({ points: (user.points || 0) + item.tickets });
        setSuccessMessage(t('shop.purchaseSuccess'));
      } else if (activeCategory === 'GAMES') {
        await purchaseGame(item.id);
        setSuccessMessage(t('shop.redeemSuccess'));
      } else if (activeCategory === 'COURSES') {
        await purchaseCourse(item.id);
        setSuccessMessage(t('shop.redeemSuccess'));
      } else if (activeCategory === 'PRODUCTS') {
        await purchaseProduct(item.id);
        setSuccessMessage(t('shop.redeemSuccess'));
      }
      
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
    }
    setConfirmPurchase(null);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-indigo-600 text-white pt-12 pb-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <ShoppingBag size={32} /> 羲光商店
            </h1>
            <p className="text-indigo-100">購買券數，兌換精彩遊戲與課程</p>
          </div>
          {user && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/20">
              <div className="flex flex-col">
                <span className="text-xs text-indigo-200 font-bold uppercase tracking-wider">我的餘額</span>
                <div className="flex items-center gap-2 text-2xl font-black">
                  <Coins className="text-yellow-400" /> {user.tickets || 0}
                </div>
              </div>
              <Button onClick={() => setActiveCategory('TICKETS')} variant="secondary" size="sm">儲值</Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-2 flex gap-2 border border-slate-200">
          <button 
            onClick={() => setActiveCategory('TICKETS')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeCategory === 'TICKETS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <CreditCard size={18} /> 票券
          </button>
          <button 
            onClick={() => setActiveCategory('GAMES')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeCategory === 'GAMES' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Gamepad2 size={18} /> 遊戲
          </button>
          <button 
            onClick={() => setActiveCategory('COURSES')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeCategory === 'COURSES' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <GraduationCap size={18} /> 課程
          </button>
          <button 
            onClick={() => setActiveCategory('PRODUCTS')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeCategory === 'PRODUCTS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Package size={18} /> 產品
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <AnimatePresence mode="wait">
          {activeCategory === 'TICKETS' && (
            <motion.div 
              key="tickets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {ticketPacks.map((pack: any) => (
                <div key={pack.id} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Coins size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{pack.name}</h3>
                  <p className="text-slate-500 text-sm mb-6">{pack.description}</p>
                  <div className="mt-auto">
                    <div className="flex items-center justify-center mb-4">
                      <span className="text-2xl font-black text-indigo-600">NT$ {pack.cashPrice}</span>
                    </div>
                    <Button fullWidth onClick={() => handlePurchase(pack)}>{t('shop.buyNow')}</Button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeCategory === 'GAMES' && (
            <motion.div 
              key="games"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {games.filter(g => g.status === 'published').map((game) => (
                <div key={game.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all h-full">
                  <div className="h-48 bg-slate-200 relative">
                    <img src={`https://picsum.photos/seed/${game.coverImageKeyword}/800/600`} alt={game.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold text-yellow-600 shadow-sm">
                      <Coins size={14} /> {game.ticketPrice || 100}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col h-full">
                    <h3 className="text-lg font-bold mb-2 line-clamp-1">{game.title}</h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{game.description}</p>
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Coins size={20} className="text-yellow-500" />
                        <span className="text-2xl font-black text-slate-900">{game.ticketPrice || 100}</span>
                    </div>
                    <div className="mt-auto">
                      <button className="w-full py-3 bg-indigo-600 text-white rounded-full font-bold" onClick={() => handlePurchase(game)}>兌換</button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeCategory === 'COURSES' && (
            <motion.div 
              key="courses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                  <div className="h-48 bg-slate-200 relative">
                    <img src={`https://picsum.photos/seed/${course.imageKeyword}/800/600`} alt={course.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold text-yellow-600 shadow-sm">
                      <Coins size={14} /> {course.ticketPrice || 50}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col h-full">
                    <h3 className="text-lg font-bold mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Coins size={20} className="text-yellow-500" />
                        <span className="text-2xl font-black text-slate-900">{course.ticketPrice || 50}</span>
                    </div>
                    <div className="mt-auto">
                      <Button fullWidth variant="primary" onClick={() => handlePurchase(course)}>兌換</Button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeCategory === 'PRODUCTS' && (
            <motion.div 
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
                  <div className="h-48 bg-slate-200 relative">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold text-yellow-600 shadow-sm">
                      <Coins size={14} /> {product.price}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold line-clamp-1">{product.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-400 font-bold uppercase">庫存: {product.quantity}</span>
                    </div>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Coins size={20} className="text-yellow-500" />
                        <span className="text-2xl font-black text-slate-900">{product.price}</span>
                    </div>
                    <div className="mt-auto">
                      <Button fullWidth variant="primary" onClick={() => handlePurchase(product)}>兌換</Button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {confirmPurchase && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('shop.confirmTitle')}</h3>
              <p className="text-slate-500 mb-8">
                {activeCategory === 'TICKETS' 
                  ? t('shop.confirmTicket', { price: confirmPurchase.price, tickets: confirmPurchase.item.tickets })
                  : t('shop.confirmRedeem', { price: confirmPurchase.price, item: confirmPurchase.item.title || confirmPurchase.item.name })
                }
              </p>
              <div className="flex gap-4">
                <Button fullWidth variant="outline" onClick={() => setConfirmPurchase(null)}>{t('common.cancel')}</Button>
                <Button fullWidth onClick={executePurchase}>{t('common.confirm')}</Button>
              </div>
            </motion.div>
          </div>
        )}

        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('shop.successTitle')}</h3>
              <p className="text-slate-500 mb-8">{successMessage}</p>
              <Button fullWidth onClick={() => setShowSuccess(false)}>{t('common.great')}</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
