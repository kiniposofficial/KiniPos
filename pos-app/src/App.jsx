import React, { useState, useEffect } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import KasirView from './components/KasirView';
import LaporanView from './components/LaporanView';
import ProdukView from './components/ProdukView';
import PengaturanView from './components/PengaturanView';
import AuthModal from './components/AuthModal';
import PayModal from './components/PayModal';
import AddProductModal from './components/AddProductModal';
import SubscriptionModal from './components/SubscriptionModal';
import PaymentSuccessModal from './components/PaymentSuccessModal';
import InstallGuideModal from './components/InstallGuideModal';
import { supabase } from './supabase';
import Toast from './components/Toast';

const playSound = (type = 'click') => {
  if (localStorage.getItem('kinipos_sound_muted') === 'true') return;
  try {
    const soundPath = type === 'success' ? '/succes.mp3' : '/beep.wav';
    const audio = new Audio(soundPath);
    audio.volume = type === 'success' ? 0.7 : 0.4;
    audio.play().catch(() => {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(type === 'success' ? 880 : 520, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    });
  } catch (e) { }
};

const DEFAULT_CATEGORIES = ['Semua', 'Makanan', 'Minuman', 'Lainnya'];

const DEFAULT_PRODUCTS = [];

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('kinipos_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showNotification = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  const [viewMode, setViewMode] = useState(() => {
    const savedUser = localStorage.getItem('kinipos_user');
    if (savedUser) return 'pos';
    return localStorage.getItem('kinipos_mode') || 'landing';
  });
  const [storeName, setStoreName] = useState(() => localStorage.getItem('kinipos_store_name') || 'Usaha Saya');
  const [savedStoreName, setSavedStoreName] = useState(() => localStorage.getItem('kinipos_store_name') || 'Usaha Saya');
  const [qrisImage, setQrisImage] = useState(() => localStorage.getItem('kinipos_qris_image') || '');
  const [isSoundMuted, setIsSoundMuted] = useState(() => localStorage.getItem('kinipos_sound_muted') !== 'false');
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [cart, setCart] = useState([]);

  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState('CASH');
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [completedTx, setCompletedTx] = useState(null);
  const [waPhone, setWaPhone] = useState('');
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);

  const [history, setHistory] = useState([]);
  const [appTab, setAppTab] = useState('kasir');

  useEffect(() => {
    // Check if coming from email confirmation link
    const isEmailConfirm = window.location.hash && (
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('type=signup') ||
      window.location.hash.includes('type=email_change')
    );

    if (window.location.hash && window.location.hash.includes('type=recovery')) {
      setShowAuthModal(true);
      setAuthModalMode('reset');
    } else if (isEmailConfirm) {
      showNotification('Email berhasil dikonfirmasi! Selamat datang di KiniPos.', 'success');
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    // Process session from Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setViewMode('pos');
        localStorage.setItem('kinipos_mode', 'pos');
        localStorage.setItem('kinipos_user', JSON.stringify(session.user));
        const store = session.user.user_metadata?.store_name || session.user.email?.split('@')[0] || 'Usaha Saya';
        setStoreName(store);
        setSavedStoreName(store);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setViewMode('pos');
        localStorage.setItem('kinipos_mode', 'pos');
        localStorage.setItem('kinipos_user', JSON.stringify(session.user));
        const store = session.user.user_metadata?.store_name || session.user.email?.split('@')[0] || 'Usaha Saya';
        setStoreName(store);
        setSavedStoreName(store);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setViewMode('landing');
        localStorage.setItem('kinipos_mode', 'landing');
        setCart([]);
        localStorage.removeItem('kinipos_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCost, setNewProdCost] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Makanan');
  const [isUnlimitedStock, setIsUnlimitedStock] = useState(true);
  const [stockQty, setStockQty] = useState('');
  const [newProdImageFile, setNewProdImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmCancelTxId, setConfirmCancelTxId] = useState(null);
  const [targetTabPending, setTargetTabPending] = useState(null);
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [successAddedDays, setSuccessAddedDays] = useState(30);

  const getSubscriptionInfo = () => {
    if (!user) return { isSubscribed: false, isExpired: false, daysLeft: 30, text: 'Trial 30 Hari' };
    
    const now = new Date();
    const subscribedUntil = user.user_metadata?.subscribed_until;
    
    if (subscribedUntil) {
      const untilDate = new Date(subscribedUntil);
      if (untilDate > now) {
        const daysLeft = Math.ceil((untilDate - now) / (1000 * 60 * 60 * 24));
        return { isSubscribed: true, isExpired: false, daysLeft, text: `PRO • ${daysLeft} Hari` };
      } else {
        return { isSubscribed: false, isExpired: true, daysLeft: 0, text: 'Masa Pro Berakhir' };
      }
    }

    const createdAt = new Date(user.created_at || Date.now());
    const trialEndsAt = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (now >= trialEndsAt) {
      return { isSubscribed: false, isExpired: true, daysLeft: 0, text: 'Trial Berakhir' };
    } else {
      const daysLeft = Math.max(1, Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24)));
      return { isSubscribed: false, isExpired: false, daysLeft, text: `Trial • ${daysLeft} Hari` };
    }
  };

  const subInfo = getSubscriptionInfo();

  useEffect(() => {
    setCart([]);
    if (user?.id) {
      fetchDataFromSupabase(user);

      if (user.user_metadata?.qris_image) {
        setQrisImage(user.user_metadata.qris_image);
        localStorage.setItem('kinipos_qris_image', user.user_metadata.qris_image);
      }
      if (user.user_metadata?.store_name) {
        setStoreName(user.user_metadata.store_name);
        setSavedStoreName(user.user_metadata.store_name);
        localStorage.setItem('kinipos_store_name', user.user_metadata.store_name);
      }

      // Realtime listener for multi-device sync
      const channel = supabase
        .channel(`user-sync-${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `user_id=eq.${user.id}` }, () => {
          fetchDataFromSupabase(user);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, () => {
          fetchDataFromSupabase(user);
        })
        .subscribe();

      const handleFocus = () => {
        fetchDataFromSupabase(user);
      };
      window.addEventListener('focus', handleFocus);

      // Auto-activate subscription if returning from Midtrans Payment Link
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment') === 'success' || urlParams.get('order_id')) {
        const plan = urlParams.get('plan') || 'monthly';
        const addedDays = plan === 'yearly' ? 365 : 30;
        
        const now = new Date();
        const currentUntil = user?.user_metadata?.subscribed_until ? new Date(user.user_metadata.subscribed_until) : now;
        const baseDate = currentUntil > now ? currentUntil : now;
        baseDate.setDate(baseDate.getDate() + addedDays);

        supabase.auth.updateUser({
          data: { subscribed_until: baseDate.toISOString() }
        }).then(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
          setSuccessAddedDays(addedDays);
          setShowPaymentSuccessModal(true);
          playSound('success');
        });
      }

      return () => {
        supabase.removeChannel(channel);
        window.removeEventListener('focus', handleFocus);
      };
    } else {
      setProducts([]);
      setHistory([]);
      setIsDataLoaded(true);
    }
  }, [user]);



  const fetchDataFromSupabase = async (targetUser = user) => {
    if (!targetUser?.id) {
      setProducts([]);
      setHistory([]);
      setIsDataLoaded(true);
      return;
    }

    try {
      setIsDataLoaded(false);

      // Fetch products from Supabase (single source of truth)
      const { data: dbProducts, error: dbProdErr } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', targetUser.id);

      if (!dbProdErr && dbProducts) {
        setProducts(dbProducts);
      } else {
        console.log('Failed to fetch products:', dbProdErr);
        setProducts([]);
      }

      // Fetch transactions from Supabase (single source of truth)
      const { data: dbTx, error: dbTxErr } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', targetUser.id)
        .order('created_at', { ascending: false });

      if (!dbTxErr && dbTx) {
        const formattedDbTx = dbTx.map(t => ({
          id: t.id,
          created_at: t.created_at,
          timestamp: new Date(t.created_at).getTime(),
          date: new Date(t.created_at).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) + ' ' + new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          items: t.items || [],
          total: t.total,
          costTotal: t.cost_total,
          profit: t.profit,
          payMethod: t.pay_method,
          paid: t.paid,
          change: t.change,
          waPhone: t.wa_phone
        }));
        setHistory(formattedDbTx);
      } else {
        console.log('Failed to fetch transactions:', dbTxErr);
        setHistory([]);
      }

      // Clean up stale localStorage keys
      localStorage.removeItem('kinipos_products');
      localStorage.removeItem('kinipos_history');
      localStorage.removeItem(`kinipos_products_${targetUser.id}`);
      localStorage.removeItem(`kinipos_history_${targetUser.id}`);
      localStorage.removeItem('kinipos_deleted_products');
      localStorage.removeItem('kinipos_deleted_tx');
    } catch (e) {
      console.log('Error fetching user data', e);
    } finally {
      setIsDataLoaded(true);
    }
  };



  useEffect(() => {
    localStorage.setItem('kinipos_store_name', storeName);
  }, [storeName]);

  useEffect(() => {
    localStorage.setItem('kinipos_mode', viewMode);
  }, [viewMode]);

  const addToCart = (product) => {
    playSound('click');
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const currentQty = existing ? existing.qty : 0;

      // Cek stok terbatas: jangan melebihi stok yang tersedia
      if (!product.is_unlimited && product.stock !== null && product.stock !== undefined) {
        if (currentQty + 1 > product.stock) {
          showNotification(`Stok ${product.name} hanya tersisa ${product.stock}! ⚠️`, 'error');
          return prev;
        }
      }

      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    playSound('click');
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const setExactQty = (id, val) => {
    // Allow empty string while typing (will be fixed on blur)
    if (val === '') {
      setCart(prev => prev.map(item =>
        item.id === id ? { ...item, qty: '' } : item
      ));
      return;
    }
    const qty = parseInt(val, 10);
    if (!isNaN(qty) && qty > 0) {
      setCart(prev => prev.map(item =>
        item.id === id ? { ...item, qty } : item
      ));
    }
  };

  const fixQtyOnBlur = (id) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && (item.qty === '' || item.qty <= 0 || isNaN(item.qty))) {
        return { ...item, qty: 1 };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    playSound('click');
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    playSound('click');
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartCostTotal = cart.reduce((sum, item) => sum + ((item.cost || 0) * item.qty), 0);

  const handleOpenPayModal = () => {
    if (cart.length === 0) return;
    playSound('click');
    setPayMethod('CASH');
    setAmountPaidInput(cartTotal.toString());
    setWaPhone('');
    setShowPayModal(true);
  };

  const handleFinishTransaction = async () => {
    const paid = payMethod === 'QRIS' ? cartTotal : (parseFloat(amountPaidInput) || 0);
    if (payMethod === 'CASH' && paid < cartTotal) {
      const kurang = cartTotal - paid;
      showNotification(`Uang pembayaran kurang ${formatRp(kurang)}! ⚠️`, 'error');
      playSound('click');
      return;
    }

    const change = payMethod === 'QRIS' ? 0 : paid - cartTotal;
    const profit = cartTotal - cartCostTotal;

    const now = new Date();
    const txId = 'TX-' + now.getTime();
    const newTx = {
      id: txId,
      created_at: now.toISOString(),
      timestamp: now.getTime(),
      date: now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) + ' ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      total: cartTotal,
      costTotal: cartCostTotal,
      profit,
      payMethod,
      paid,
      change,
      waPhone: waPhone.trim()
    };

    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const itemInCart = cart.find(c => c.id === p.id);
        if (itemInCart && !p.is_unlimited && p.stock !== null && p.stock !== undefined) {
          const newStock = Math.max(0, p.stock - itemInCart.qty);
          supabase.from('products').update({ stock: newStock }).eq('id', p.id).then(() => { });
          return { ...p, stock: newStock };
        }
        return p;
      });
    });

    setHistory(prev => [newTx, ...prev]);
    setCompletedTx(newTx);
    playSound('success');

    try {
      await supabase.from('transactions').insert([{
        id: txId,
        total: cartTotal,
        cost_total: cartCostTotal,
        profit,
        pay_method: payMethod,
        paid,
        change,
        wa_phone: waPhone.trim(),
        items: cart,
        user_id: user?.id
      }]);
    } catch (e) {
      console.log('Saved to local storage, will sync later');
    }
  };

  const resetAllTx = () => {
    setCompletedTx(null);
    setShowPayModal(false);
    setCart([]);
    setAmountPaidInput('');
    setWaPhone('');
  };

  const formatRp = (num) => {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  };

  const sendWhatsappReceipt = (tx) => {
    let cleanPhone = tx.waPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    let msg = `*STRUK - ${storeName.toUpperCase()}*\n`;
    msg += `No: #${tx.id} | ${tx.date}\n`;
    msg += `Metode: ${tx.payMethod === 'QRIS' ? 'QRIS / Non-Tunai' : 'Tunai (Cash)'}\n`;
    msg += `----------------------------\n`;
    tx.items.forEach(item => {
      msg += `${item.name} x${item.qty} = ${formatRp(item.price * item.qty)}\n`;
    });
    msg += `----------------------------\n`;
    msg += `*TOTAL: ${formatRp(tx.total)}*\n`;
    if (tx.payMethod === 'CASH') {
      msg += `Bayar: ${formatRp(tx.paid)}\n`;
      msg += `Kembali: ${formatRp(tx.change)}\n`;
    }
    msg += `\nTerima Kasih 🙏`;

    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    window.open(url, '_blank');
  };

  const openAddProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setNewProdName(prod.name);
      setNewProdPrice(prod.price.toString());
      setNewProdCost(prod.cost ? prod.cost.toString() : '');
      setNewProdCategory(prod.category || 'Makanan');
      setIsUnlimitedStock(prod.is_unlimited ?? (prod.stock === undefined || prod.stock === null));
      setStockQty(prod.stock !== undefined && prod.stock !== null ? prod.stock.toString() : '');
    } else {
      setEditingProduct(null);
      setNewProdName('');
      setNewProdPrice('');
      setNewProdCost('');
      setNewProdCategory('Makanan');
      setIsUnlimitedStock(true);
      setStockQty('');
    }
    setNewProdImageFile(null);
    setShowAddProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    setUploadingImage(true);

    let imageUrl = editingProduct ? (editingProduct.image_url || '') : '';

    if (newProdImageFile) {
      try {
        const fileExt = newProdImageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, newProdImageFile);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

          imageUrl = publicUrlData?.publicUrl || '';
        }
      } catch (err) {
        console.error('Image upload failed', err);
      }
    }

    const finalStock = isUnlimitedStock ? null : (parseInt(stockQty, 10) || 0);

    if (editingProduct) {
      const updatedProd = {
        ...editingProduct,
        name: newProdName,
        price: parseFloat(newProdPrice),
        cost: parseFloat(newProdCost) || 0,
        category: newProdCategory,
        is_unlimited: isUnlimitedStock,
        stock: finalStock,
        image_url: imageUrl
      };

      setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProd : p));
      showNotification('Menu berhasil diperbarui! ✏️', 'success');

      try {
        const { error: updateErr } = await supabase.from('products').update({
          name: updatedProd.name,
          price: updatedProd.price,
          cost: updatedProd.cost,
          category: updatedProd.category,
          is_unlimited: updatedProd.is_unlimited,
          stock: updatedProd.stock,
          image_url: updatedProd.image_url
        }).eq('id', editingProduct.id);

        if (updateErr) {
          console.error('Failed updating product:', updateErr);
          showNotification(`Gagal update DB: ${updateErr.message} ⚠️`, 'error');
        }
      } catch (e) { }
    } else {
      const newProd = {
        id: Date.now().toString(),
        name: newProdName,
        price: parseFloat(newProdPrice),
        cost: parseFloat(newProdCost) || 0,
        category: newProdCategory,
        is_unlimited: isUnlimitedStock,
        stock: finalStock,
        image_url: imageUrl
      };

      setProducts(prev => [...prev, newProd]);
      showNotification('Menu baru berhasil ditambahkan! ✨', 'success');

      try {
        const { data: inserted, error: insertErr } = await supabase.from('products').insert([{
          name: newProd.name,
          price: newProd.price,
          cost: newProd.cost,
          category: newProd.category,
          is_unlimited: newProd.is_unlimited,
          stock: newProd.stock,
          image_url: newProd.image_url,
          user_id: user?.id
        }]).select();

        if (insertErr) {
          console.error('Failed inserting product:', insertErr);
          showNotification(`Gagal simpan DB: ${insertErr.message} ⚠️`, 'error');
        } else if (inserted && inserted[0]) {
          setProducts(prev => prev.map(p => p.id === newProd.id ? inserted[0] : p));
        }
      } catch (e) {
        console.error('Failed inserting product to Supabase', e);
      }
    }

    setNewProdName('');
    setNewProdPrice('');
    setNewProdCost('');
    setStockQty('');
    setIsUnlimitedStock(true);
    setNewProdImageFile(null);
    setEditingProduct(null);
    setUploadingImage(false);
    setShowAddProductModal(false);
    playSound('success');
  };

  const deleteProduct = async (id) => {
    // 1. Immediately remove from UI
    setProducts(prev => prev.filter(p => p.id !== id));
    playSound('click');
    showNotification('Menu berhasil dihapus 🗑️', 'info');

    // 2. Delete from Supabase (the single source of truth)
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (e) {
      console.error('Failed to delete product from Supabase:', e);
    }
  };

  const handleCancelTransaction = (txId) => {
    setConfirmCancelTxId(txId);
  };

  const executeCancelTransaction = async () => {
    if (!confirmCancelTxId) return;
    const txId = confirmCancelTxId;
    const txToCancel = history.find(t => t.id === txId);

    if (txToCancel) {
      // 1. Immediately remove from UI
      setHistory(prev => prev.filter(t => t.id !== txId));

      // 2. Restore stock if applicable
      if (txToCancel.items && txToCancel.items.length > 0) {
        setProducts(prevProducts => {
          return prevProducts.map(p => {
            const itemInTx = txToCancel.items.find(i => i.id === p.id);
            if (itemInTx && !p.is_unlimited && p.stock !== null && p.stock !== undefined) {
              const restoredStock = p.stock + itemInTx.qty;
              supabase.from('products').update({ stock: restoredStock }).eq('id', p.id).then(() => { });
              return { ...p, stock: restoredStock };
            }
            return p;
          });
        });
      }

      playSound('click');
      showNotification('Transaksi dibatalkan & stok dikembalikan! 🛑', 'info');

      // 3. Delete from Supabase (single source of truth)
      try {
        await supabase.from('transactions').delete().eq('id', txId);
      } catch (e) { }
    }

    setConfirmCancelTxId(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProducts([]);
    setHistory([]);
    setCart([]);
    setAppTab('kasir');
    localStorage.removeItem('kinipos_user');
    setViewMode('landing');
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    showNotification('Berhasil Keluar Akun 👋', 'info');
  };

  // Guard: jika user null tapi masih di dashboard, paksa kembali ke landing
  useEffect(() => {
    if (!user && viewMode !== 'landing') {
      setViewMode('landing');
    }
  }, [user, viewMode]);

  const filteredProducts = selectedCategory === 'Semua'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    setAuthModalMode('login');
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleOpenKasir = () => {
    if (!user) {
      setAuthModalMode('login');
      setShowAuthModal(true);
    } else {
      setViewMode('kasir');
    }
  };

  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage onOpenApp={handleOpenKasir} />
        <AuthModal
          isOpen={showAuthModal}
          initialMode={authModalMode}
          onClose={handleCloseAuthModal}
          onAuthSuccess={(authUser, store, msg) => {
            setUser(authUser);
            if (store) setStoreName(store);
            handleCloseAuthModal();
            setViewMode('kasir');
            showNotification(msg || 'Selamat Datang Kembali! 👋', 'success');
          }}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setAppTab('kasir')}>
          <img
            src="/kinipos_logo.png"
            alt="KiniPos Logo"
            className="w-7 h-7 object-contain"
          />
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">{storeName}</h1>
            <p className="text-[10px] text-slate-400 font-medium leading-tight">Kasir Digital</p>
          </div>
        </div>

        {/* Subscription / Trial Badge */}
        <div
          className={`px-3.5 py-1.5 rounded-full text-[11px] font-extrabold tracking-wide transition-all border flex items-center gap-1.5 shadow-sm ${
            subInfo.isSubscribed
              ? 'bg-white text-slate-900 border-slate-200'
              : subInfo.isExpired
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-white text-slate-900 border-slate-200'
          }`}
        >
          <img 
            src="/bell.png" 
            alt="PRO" 
            className="w-3.5 h-3.5 object-contain brightness-0" 
          />
          <span>{subInfo.text}</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-5 max-w-6xl w-full mx-auto pb-24">
        {appTab === 'kasir' && (
          <KasirView
            DEFAULT_CATEGORIES={DEFAULT_CATEGORIES}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            filteredProducts={filteredProducts}
            addToCart={addToCart}
            cart={cart}
            clearCart={() => setShowClearCartConfirm(true)}
            updateQty={updateQty}
            removeFromCart={removeFromCart}
            setExactQty={setExactQty}
            fixQtyOnBlur={fixQtyOnBlur}
            cartTotal={cartTotal}
            handleOpenPayModal={handleOpenPayModal}
            formatRp={formatRp}
          />
        )}

        {appTab === 'laporan' && (
          <LaporanView
            history={history}
            sendWhatsappReceipt={sendWhatsappReceipt}
            handleCancelTransaction={handleCancelTransaction}
            formatRp={formatRp}
          />
        )}

        {appTab === 'produk' && (
          <ProdukView
            products={products}
            formatRp={formatRp}
            openAddProductModal={openAddProductModal}
            deleteProduct={deleteProduct}
          />
        )}

        {appTab === 'pengaturan' && (
          <PengaturanView
            storeName={storeName}
            setStoreName={setStoreName}
            savedStoreName={savedStoreName}
            setSavedStoreName={setSavedStoreName}
            isSoundMuted={isSoundMuted}
            setIsSoundMuted={setIsSoundMuted}
            playSound={playSound}
            showNotification={showNotification}
            user={user}
            setShowAuthModal={setShowAuthModal}
            setAuthModalMode={setAuthModalMode}
            handleLogout={handleLogout}
            supabase={supabase}
            subInfo={subInfo}
            setShowSubscriptionModal={setShowSubscriptionModal}
            onOpenInstallGuide={() => setShowInstallGuideModal(true)}
            qrisImage={qrisImage}
            setQrisImage={setQrisImage}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex items-stretch shadow-lg safe-bottom">
        {[
          { key: 'kasir', label: 'Kasir', icon: '/cashier-machine.png' },
          { key: 'laporan', label: 'Omset', icon: '/omset.png' },
          { key: 'produk', label: 'Menu', icon: '/menu.png' },
          { key: 'pengaturan', label: 'Toko', icon: '/settings.png' },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            className={`flex-1 py-2 flex flex-col items-center justify-center gap-0.5 transition ${appTab === key ? 'text-slate-900 font-bold' : 'text-slate-400 font-semibold'
              }`}
            onClick={() => {
              if (appTab === 'pengaturan' && storeName !== savedStoreName) {
                setTargetTabPending(key);
              } else {
                setAppTab(key);
              }
            }}
          >
            <img src={icon} alt={label} className={`w-5 h-5 object-contain transition ${appTab === key ? 'opacity-100' : 'opacity-40'}`} />
            <span className="text-[10px]">{label}</span>
          </button>
        ))}
      </nav>

      {/* Modal Auth */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authModalMode}
        onClose={handleCloseAuthModal}
        onAuthSuccess={(authUser, store, notifMsg) => {
          setUser(authUser);
          localStorage.setItem('kinipos_user', JSON.stringify(authUser));
          if (store) {
            setStoreName(store);
            setSavedStoreName(store);
            localStorage.setItem('kinipos_store_name', store);
          }
          handleCloseAuthModal();
          showNotification(notifMsg || 'Berhasil Masuk Akun! 🔓', 'success');
        }}
      />

      {/* Modal Bayar */}
      <PayModal
        showPayModal={showPayModal}
        setShowPayModal={setShowPayModal}
        completedTx={completedTx}
        cartTotal={cartTotal}
        payMethod={payMethod}
        setPayMethod={setPayMethod}
        amountPaidInput={amountPaidInput}
        setAmountPaidInput={setAmountPaidInput}
        handleFinishTransaction={handleFinishTransaction}
        resetAllTx={resetAllTx}
        formatRp={formatRp}
        qrisImage={qrisImage}
        setQrisImage={setQrisImage}
        storeName={savedStoreName}
        setAppTab={setAppTab}
      />

      {/* Modal Add / Edit Product */}
      <AddProductModal
        showAddProductModal={showAddProductModal}
        setShowAddProductModal={setShowAddProductModal}
        editingProduct={editingProduct}
        handleSaveProduct={handleSaveProduct}
        newProdName={newProdName}
        setNewProdName={setNewProdName}
        newProdPrice={newProdPrice}
        setNewProdPrice={setNewProdPrice}
        newProdCost={newProdCost}
        setNewProdCost={setNewProdCost}
        newProdCategory={newProdCategory}
        setNewProdCategory={setNewProdCategory}
        isUnlimitedStock={isUnlimitedStock}
        setIsUnlimitedStock={setIsUnlimitedStock}
        stockQty={stockQty}
        setStockQty={setStockQty}
        setNewProdImageFile={setNewProdImageFile}
        uploadingImage={uploadingImage}
        DEFAULT_CATEGORIES={DEFAULT_CATEGORIES}
        formatRp={formatRp}
      />

      {/* Modal Batal Transaksi */}
      {confirmCancelTxId && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-center space-y-3 shadow-2xl">
            <img src="/bin.png" alt="Batal" className="w-12 h-12 mx-auto" />
            <h3 className="text-lg font-extrabold text-slate-900">Batalkan Transaksi?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Apakah Anda yakin ingin membatalkan transaksi ini? Sisa stok barang akan dikembalikan.
            </p>
            <div className="flex gap-2 pt-2">
              <button type="button" className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-sm hover:bg-slate-200 transition" onClick={() => setConfirmCancelTxId(null)}>
                Tidak, Batal
              </button>
              <button
                type="button"
                className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-red-600 transition"
                onClick={executeCancelTransaction}
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kosongkan Keranjang */}
      {showClearCartConfirm && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-center space-y-3 shadow-2xl">
            <img src="/shopping-cart.png" alt="Kosongkan" className="w-12 h-12 mx-auto opacity-40" />
            <h3 className="text-lg font-extrabold text-slate-900">Kosongkan Pesanan?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Semua item di keranjang akan dihapus. Lanjutkan?
            </p>
            <div className="flex gap-2 pt-2">
              <button type="button" className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-sm hover:bg-slate-200 transition" onClick={() => setShowClearCartConfirm(false)}>
                Batal
              </button>
              <button
                type="button"
                className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-red-600 transition"
                onClick={() => {
                  clearCart();
                  setShowClearCartConfirm(false);
                  showNotification('Keranjang dikosongkan', 'info');
                }}
              >
                Ya, Kosongkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Simpan Nama Toko saat Pindah Tab */}
      {targetTabPending && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-center space-y-3 shadow-2xl">
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-500 text-xl font-bold">
              💾
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Simpan Perubahan Nama Toko?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Anda mengubah nama toko menjadi <strong className="text-slate-900">"{storeName}"</strong>. Apakah Anda ingin menyimpannya?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs hover:bg-slate-200 transition"
                onClick={() => {
                  setStoreName(savedStoreName);
                  setAppTab(targetTabPending);
                  setTargetTabPending(null);
                }}
              >
                Abaikan & Pindah
              </button>
              <button
                type="button"
                className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-slate-700 transition"
                onClick={async () => {
                  if (storeName.trim()) {
                    localStorage.setItem('kinipos_store_name', storeName);
                    setSavedStoreName(storeName);
                    if (user) {
                      try {
                        await supabase.auth.updateUser({ data: { store_name: storeName } });
                      } catch (err) { }
                    }
                    playSound('success');
                    showNotification('Nama toko berhasil disimpan! 🏪', 'success');
                  }
                  setAppTab(targetTabPending);
                  setTargetTabPending(null);
                }}
              >
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal || subInfo.isExpired}
        isExpired={subInfo.isExpired}
        subInfo={subInfo}
        onClose={() => setShowSubscriptionModal(false)}
        user={user}
        onSubscriptionSuccess={(newUntilDate) => {
          showNotification('Berhasil Berlangganan KiniPos Pro! Terima kasih!', 'success');
          setUser(prev => ({
            ...prev,
            user_metadata: {
              ...prev?.user_metadata,
              subscribed_until: newUntilDate
            }
          }));
        }}
      />

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={showPaymentSuccessModal}
        onClose={() => setShowPaymentSuccessModal(false)}
        addedDays={successAddedDays}
      />

      {/* Install Guide Modal */}
      <InstallGuideModal
        isOpen={showInstallGuideModal}
        onClose={() => setShowInstallGuideModal(false)}
      />

      {/* Toast */}
      <Toast toast={toast} />
    </div>
  );
}
