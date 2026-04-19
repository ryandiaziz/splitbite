import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { BillSplitter } from '../components/room/BillSplitter';
import { PaymentStatus } from '../components/room/PaymentStatus';
import { HostReceiptViewer } from '../components/room/HostReceiptViewer';

interface RoomDashboardProps {
  roomId: string;
  sessionId: string;
  myName: string;
  onLeave: () => void;
}

const RAW_FILE_LIMIT = 5 * 1024 * 1024; // 5MB raw input (will be compressed)
const MAX_DIMENSION = 800; // max width/height after resize
const JPEG_QUALITY = 0.5;  // aggressive compression for WebSocket transport

// Compress image using Canvas — returns a much smaller base64 string
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      
      // Scale down if larger than MAX_DIMENSION
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      
      const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      resolve(base64);
    };
    img.onerror = () => reject(new Error('Gagal memproses gambar'));
    img.src = URL.createObjectURL(file);
  });
}

// Currency formatters
const formatIDR = (val: string | number) => {
  if (!val && val !== 0) return '';
  const num = typeof val === 'string' ? val.replace(/\D/g, '') : val.toString();
  if (num === '') return '';
  return new Intl.NumberFormat('id-ID').format(parseInt(num));
};

const parseIDR = (val: string) => {
  return val.replace(/\./g, '');
};

// Timer formatter: returns "HH:MM:SS" or "MM:SS"
const formatTimeLeft = (millis: number) => {
  if (millis <= 0) return '00:00';
  const seconds = Math.floor((millis / 1000) % 60);
  const minutes = Math.floor((millis / (1000 * 60)) % 60);
  const hours = Math.floor((millis / (1000 * 60 * 60)) % 24);

  const pad = (n: number) => n.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

export const RoomDashboard: React.FC<RoomDashboardProps> = ({ roomId, sessionId, myName, onLeave }) => {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:9000';
  const { isConnected, sendMessage, lastMessage } = useWebSocket(`${wsUrl}/api/room/${roomId}/ws?session_id=${sessionId}`);
  
  const [newItem, setNewItem] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);
  
  const [taxInput, setTaxInput] = useState('');
  const [discountInput, setDiscountInput] = useState('');
  const [menuDescInput, setMenuDescInput] = useState('');

  const [copyFeedback, setCopyFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const [uploadingMenu, setUploadingMenu] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [showMenuLightbox, setShowMenuLightbox] = useState(false);

  // Edit order state (Host only)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState(1);

  const menuFileRef = useRef<HTMLInputElement>(null);
  const hostReceiptRef = useRef<HTMLInputElement>(null);

  const isHost = lastMessage?.hostId === sessionId;
  const participants = lastMessage?.participants || [];
  const isOrderLocked = lastMessage?.isOrderLocked || false;
  
  const me = participants.find((p: any) => p.sessionId === sessionId);
  const isApproved = isHost || me?.isApproved;
  const isRejected = me?.isRejected;

  useEffect(() => {
    if (isConnected) {
      sendMessage({ type: 'JOIN_PARTICIPANT', data: { name: myName }});
    }
  }, [isConnected, sendMessage, myName]);

  // Handle Room Deletion
  useEffect(() => {
    if (lastMessage?.type === 'ROOM_DELETED') {
      alert("Room telah ditutup oleh Host.");
      onLeave();
    }
  }, [lastMessage, onLeave]);

  // Expiration countdown
  useEffect(() => {
    if (!lastMessage?.expiresAt) return;

    const interval = setInterval(() => {
      const remaining = lastMessage.expiresAt - Date.now();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        alert("Waktu room telah habis.");
        onLeave();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastMessage?.expiresAt, onLeave]);

  const handleApprove = (targetSessionId: string) => {
    sendMessage({ type: 'APPROVE_PARTICIPANT', data: { targetSessionId }});
  };

  const handleReject = (targetSessionId: string) => {
    sendMessage({ type: 'REJECT_PARTICIPANT', data: { targetSessionId }});
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOrderLocked) return;
    if (newItem.trim()) {
      const item = { 
        name: newItem, 
        price: Number(newPrice) || 0, 
        quantity: newQuantity,
        note: newNote 
      };
      sendMessage({ type: 'ADD_ORDER', data: item });
      setNewItem('');
      setNewPrice('');
      setNewNote('');
      setNewQuantity(1);
    }
  };

  const handleUpdateFees = () => {
    sendMessage({ type: 'UPDATE_FEES', data: { additionalFees: Number(parseIDR(taxInput)) || 0, discount: Number(parseIDR(discountInput)) || 0 }});
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(roomId);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleUploadReceipt = (base64: string) => {
    sendMessage({ type: 'UPLOAD_RECEIPT', data: { receipt: base64 }});
  };

  const handleConfirmPayment = (targetSessionId: string) => {
    sendMessage({ type: 'CONFIRM_PAYMENT', data: { targetSessionId }});
  };

  const startEditingOrder = (order: any) => {
    setEditingOrderId(order.id);
    setEditPrice(order.price.toString());
    setEditName(order.itemName);
    setEditQuantity(order.quantity || 1);
  };

  const handleUpdateOrder = () => {
    if (editingOrderId) {
      sendMessage({
        type: 'UPDATE_ORDER',
        data: {
          orderId: editingOrderId,
          name: editName,
          price: Number(editPrice) || 0,
          quantity: editQuantity
        }
      });
      setEditingOrderId(null);
    }
  };

  const handleMenuUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > RAW_FILE_LIMIT) {
      alert("Gambar terlalu besar. Maksimal 5 MB.");
      return;
    }
    setUploadingMenu(true);
    try {
      const compressed = await compressImage(file);
      sendMessage({ type: 'UPDATE_MENU', data: { menuImage: compressed }});
      setTimeout(() => setUploadingMenu(false), 2000);
    } catch (err) {
      alert("Gagal memproses gambar. Coba lagi.");
      setUploadingMenu(false);
    }
    // Reset input so the same file can be re-selected
    if (menuFileRef.current) menuFileRef.current.value = '';
  };

  const handleMenuDescUpdate = () => {
    if (menuDescInput.trim()) {
      sendMessage({ type: 'UPDATE_MENU', data: { description: menuDescInput }});
    }
  };

  const handleHostReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > RAW_FILE_LIMIT) {
      alert("Gambar terlalu besar. Maksimal 5 MB.");
      return;
    }
    setUploadingReceipt(true);
    try {
      const compressed = await compressImage(file);
      sendMessage({ type: 'UPLOAD_HOST_RECEIPT', data: { receipt: compressed }});
      setTimeout(() => setUploadingReceipt(false), 2000);
    } catch (err) {
      alert("Gagal memproses gambar. Coba lagi.");
      setUploadingReceipt(false);
    }
    if (hostReceiptRef.current) hostReceiptRef.current.value = '';
  };


  const handleToggleLock = () => {
    sendMessage({ type: 'TOGGLE_ORDER_LOCK', data: {} });
  };

  const handleCloseRoom = () => {
    if (window.confirm("Apakah Anda yakin ingin menutup room dan HAPUS semua data pasanan? Tindakan ini tidak bisa dibatalkan.")) {
      sendMessage({ type: 'CLOSE_ROOM', data: {} });
    }
  };

  const globalTotal = participants.flatMap((p: any) => p.orders || []).reduce((a: number, o: any) => a + (o.price * (o.quantity || 1)), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:h-16 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-indigo-600 tracking-tight">SplitBite</h1>
            <div className="flex items-center gap-1 group">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-xs sm:text-sm rounded-md font-semibold border border-slate-200">
                #{roomId}
              </span>
              <button 
                onClick={handleCopyId}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition-colors relative"
                title="Copy Room ID"
              >
                {copyFeedback ? (
                  <span className="text-[10px] absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded whitespace-nowrap animate-bounce">Copied!</span>
                ) : null}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </button>
            </div>
            {timeLeft !== null && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100 animate-pulse">
                <span className="text-[10px] font-bold uppercase tracking-wider">Expires:</span>
                <span className="font-mono text-xs font-bold tabular-nums">{formatTimeLeft(timeLeft)}</span>
              </div>
            )}
            <div className="flex gap-1.5">
              {isHost && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] sm:text-xs font-bold rounded uppercase">Host</span>}
              {isOrderLocked && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] sm:text-xs font-bold rounded uppercase animate-pulse">
                  🔒 Pesanan Ditutup
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className="text-xs sm:text-sm font-medium text-slate-500">{isConnected ? 'Live Sync' : 'Reconnecting...'}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={onLeave} className="px-3 py-1">Leave</Button>
          </div>
        </div>
      </header>
      
      {!lastMessage ? (
        <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-64px)]">
           <div className="flex flex-col items-center gap-3 text-indigo-600 font-semibold">
              <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading room...</span>
           </div>
        </div>
      ) : isRejected ? (
        <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-64px)]">
          <GlassCard className="max-w-md w-full p-10 text-center border-rose-200 bg-rose-50/30">
            <div className="text-6xl mb-6">🚫</div>
            <h2 className="text-2xl font-bold text-rose-800 mb-4">Access Denied</h2>
            <p className="text-slate-600 mb-8">
              Sorry, your request to join was denied by the Host. 
              The room might be full or private.
            </p>
            <Button variant="primary" className="w-full" onClick={onLeave}>
              Back to Home
            </Button>
          </GlassCard>
        </div>
      ) : !isApproved ? (
        <div className="flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-64px)]">
           <GlassCard className="max-w-md w-full p-10 text-center animate-pulse">
              <div className="text-6xl mb-6">👋</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Hello, {myName}!</h2>
              <p className="text-slate-600 mb-8">
                Please wait! the Host is checking your join request. 
                This page will automatically open once you are approved.
              </p>
              <div className="flex items-center justify-center gap-3 text-indigo-600 font-semibold">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Waiting for approval...</span>
              </div>
           </GlassCard>
        </div>
      ) : (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Menu Overview — show uploaded image or upload area for host */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Menu Overview</h2>
            
            {uploadingMenu ? (
              <div className="aspect-video bg-indigo-50 rounded-xl border-2 border-indigo-300 flex flex-col items-center justify-center text-indigo-500 animate-pulse">
                <svg className="animate-spin h-8 w-8 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-semibold text-sm">Uploading menu...</span>
              </div>
            ) : lastMessage?.menuImageUrl ? (
              <div className="relative group cursor-zoom-in" onClick={() => setShowMenuLightbox(true)}>
                <img
                  src={lastMessage.menuImageUrl}
                  alt="Menu"
                  className="w-full rounded-xl border border-slate-200 object-contain max-h-[480px] transition-transform hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="bg-white/90 px-4 py-2 rounded-full text-xs font-bold shadow-lg">Click to Preview</span>
                </div>
              </div>
            ) : isHost ? (
              <div
                onClick={() => menuFileRef.current?.click()}
                className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all duration-200"
              >
                <span className="text-3xl mb-2">📷</span>
                <span className="font-semibold text-sm">Click to upload menu photo</span>
                <span className="text-xs mt-1 opacity-70">Max 1 MB • PNG, JPG, WebP</span>
              </div>
            ) : (
              <div className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                <span className="text-sm italic">Waiting for host to upload menu...</span>
              </div>
            )}

            {/* Menu description */}
            {lastMessage?.menuDescription && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">📝 Notes from Host</p>
                <p className="text-sm text-amber-900 whitespace-pre-wrap">{lastMessage.menuDescription}</p>
              </div>
            )}

            {/* Hidden file input */}
            <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" ref={menuFileRef} onChange={handleMenuUpload} />
          </div>

          {/* Host Controls */}
          {isHost && (
            <GlassCard className="p-6 bg-white border border-amber-200 shadow-amber-100/50" intensity="light">
              <h2 className="text-lg font-bold text-slate-800 mb-5 text-indigo-600">Host Dashboard</h2>

              {/* Join Requests */}
              {participants.some((p: any) => !p.isApproved && !p.isRejected) && (
                <div className="mb-6 bg-indigo-50/50 rounded-xl border border-indigo-100 p-4">
                  <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
                    Join Requests ({participants.filter((p: any) => !p.isApproved && !p.isRejected).length})
                  </h3>
                  <div className="space-y-3">
                    {participants.filter((p: any) => !p.isApproved && !p.isRejected).map((p: any) => (
                      <div key={p.sessionId} className="flex flex-col xs:flex-row items-center justify-between bg-white p-3 rounded-lg border border-indigo-100 shadow-sm gap-3">
                        <span className="font-bold text-slate-700">{p.name}</span>
                        <div className="flex gap-2 w-full xs:w-auto">
                          <button 
                            onClick={() => handleApprove(p.sessionId)}
                            className="flex-1 xs:flex-none bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-md transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleReject(p.sessionId)}
                            className="flex-1 xs:flex-none bg-rose-100 hover:bg-rose-200 text-rose-600 text-xs font-bold px-4 py-2 rounded-md transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Menu description input */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Menu Notes</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <textarea
                    value={menuDescInput}
                    onChange={e => setMenuDescInput(e.target.value)}
                    placeholder="e.g. Nasi goreng sold out, promo buy 2 get 1..."
                    rows={2}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                  />
                  <Button variant="secondary" size="sm" onClick={handleMenuDescUpdate} className="w-full sm:w-auto h-fit">Update</Button>
                </div>
              </div>

              {/* Re-upload menu button */}
              {lastMessage?.menuImageUrl && (
                <div className="mb-5">
                  <Button variant="secondary" size="sm" onClick={() => menuFileRef.current?.click()}>
                    📷 Change Menu Photo
                  </Button>
                </div>
              )}

              {/* Billing */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Billing</label>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="w-full sm:flex-1">
                    <label className="block text-[10px] text-slate-400 mb-1">Tax / Delivery</label>
                    <input type="text" value={formatIDR(taxInput)} onChange={e => setTaxInput(parseIDR(e.target.value))} placeholder="e.g. 15.000" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div className="w-full sm:flex-1">
                    <label className="block text-[10px] text-slate-400 mb-1">Total Discount</label>
                    <input type="text" value={formatIDR(discountInput)} onChange={e => setDiscountInput(parseIDR(e.target.value))} placeholder="e.g. 0" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <Button variant="primary" size="sm" onClick={handleUpdateFees} className="w-full sm:w-auto">Apply</Button>
                </div>
              </div>

              {/* Host receipt upload */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Original Receipt</label>
                <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" ref={hostReceiptRef} onChange={handleHostReceiptUpload} />
                <div className="flex items-center gap-3">
                  <Button variant="secondary" size="sm" disabled={uploadingReceipt} onClick={() => hostReceiptRef.current?.click()}>
                    {uploadingReceipt ? '⏳ Uploading...' : `🧾 ${lastMessage?.hostReceiptUrl ? 'Change Receipt' : 'Upload Receipt'}`}
                  </Button>
                  {lastMessage?.hostReceiptUrl && (
                    <span className="text-xs text-emerald-600 font-semibold">✓ Uploaded</span>
                  )}
                </div>
              </div>

              {/* Lock / Unlock Orders */}
              <div className="pt-4 border-t border-amber-200/60">
                <button
                  onClick={handleToggleLock}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                    isOrderLocked
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300 hover:bg-emerald-200'
                      : 'bg-rose-100 text-rose-700 border-2 border-rose-300 hover:bg-rose-200'
                  }`}
                >
                  {isOrderLocked ? '🔓 Re-open Orders' : '🔒 Lock Orders'}
                </button>
                <div className="mt-3 pt-3 border-t border-amber-200/40">
                   <Button 
                    variant="secondary" 
                    className="w-full bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100" 
                    size="sm"
                    onClick={handleCloseRoom}
                   >
                    🗑️ Tutup Room & Hapus Data
                   </Button>
                </div>
                <p className="text-xs text-slate-400 text-center mt-1.5">
                  {isOrderLocked ? 'Participants cannot add/edit orders right now.' : 'Click to lock once everyone has finished ordering.'}
                </p>
              </div>
            </GlassCard>
          )}

          {/* Global Order List */}
          <GlassCard className="p-6 bg-white border border-slate-200" intensity="light">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex justify-between items-center">
              Global Order List
              <span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-sm font-mono">
                Rp {globalTotal.toLocaleString()}
              </span>
            </h2>

            <div className="space-y-6">
              {participants.filter((p: any) => p.isApproved && !p.isRejected).length === 0 && <p className="text-slate-400 text-sm italic">No participants yet.</p>}
              
              {participants.filter((p: any) => p.isApproved && !p.isRejected).map((p: any, idx: number) => {
                const isMe = p.sessionId === sessionId;
                const pTotal = (p.orders || []).reduce((a: number, o: any) => a + (o.price * (o.quantity || 1)), 0);
                
                return (
                <div key={idx} className={`p-4 rounded-xl border ${isMe ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-700 tabular-nums">
                      {p.name} {isMe && <span className="text-xs font-normal bg-indigo-100 px-2 rounded-full text-indigo-700 ml-2">YOU</span>}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-slate-600">Rp {pTotal.toLocaleString()}</span>
                      {isHost && !isMe && pTotal > 0 && (
                        <PaymentStatus participant={p} isHost={isHost} onUploadReceipt={handleUploadReceipt} onConfirmPayment={handleConfirmPayment} />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {(p.orders || []).map((o: any, oIdx: number) => (
                      <div key={oIdx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm text-sm">
                        <div className="flex-1 max-w-full overflow-hidden">
                          {editingOrderId === o.id ? (
                            <div className="space-y-2 pr-2">
                               <label className="block text-[10px] font-bold text-slate-400 uppercase">Item Name</label>
                               <input 
                                type="text" 
                                value={editName} 
                                onChange={e => setEditName(e.target.value)}
                                className="w-full border-2 border-indigo-100 rounded-lg px-3 py-2 font-semibold focus:border-indigo-500 outline-none transition-all"
                                placeholder="Item Name..."
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <p className="font-semibold text-slate-800 break-words">
                                {o.itemName} 
                                {o.quantity > 1 && <span className="ml-1.5 text-indigo-600 font-bold">x{o.quantity}</span>}
                              </p>
                            </div>
                          )}
                          {o.note && <p className="text-xs text-slate-500 italic mt-0.5 break-words">Note: {o.note}</p>}
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0">
                          {editingOrderId === o.id ? (
                            <div className="flex flex-col items-end gap-2 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                              <div className="w-full">
                                <label className="block text-[10px] font-bold text-indigo-500 uppercase mb-1">Price (Rp)</label>
                                <input 
                                  type="text" 
                                  value={formatIDR(editPrice)} 
                                  onChange={e => setEditPrice(parseIDR(e.target.value))}
                                  className="w-32 border-2 border-white rounded-lg px-3 py-2 text-right font-mono font-bold text-indigo-700 focus:border-indigo-400 outline-none transition-all shadow-sm"
                                  placeholder="0"
                                />
                              </div>
                              <div className="w-full">
                                <label className="block text-[10px] font-bold text-indigo-500 uppercase mb-1">Qty</label>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))} className="w-8 h-8 flex items-center justify-center bg-white border border-indigo-200 rounded-md text-indigo-600 font-bold">-</button>
                                  <input 
                                    type="number" 
                                    value={editQuantity} 
                                    onChange={e => setEditQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-12 border-2 border-white rounded-lg py-1 text-center font-bold text-indigo-700 focus:border-indigo-400 outline-none transition-all shadow-sm"
                                  />
                                  <button onClick={() => setEditQuantity(editQuantity + 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-indigo-200 rounded-md text-indigo-600 font-bold">+</button>
                                </div>
                              </div>
                              <div className="flex gap-2 w-full">
                                <button 
                                  onClick={handleUpdateOrder} 
                                  className="flex-1 bg-emerald-500 text-white rounded-lg py-2 font-bold hover:bg-emerald-600 transition-all shadow-md active:scale-95"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditingOrderId(null)} 
                                  className="bg-white text-slate-500 border border-slate-200 rounded-lg px-4 py-2 font-bold hover:bg-slate-50 transition-all active:scale-95"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-right">
                                {o.price === 0 ? (
                                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">Waiting for price...</span>
                                ) : (
                                  <div className="flex flex-col items-end">
                                    <span className="font-mono text-slate-500 font-bold text-xs opacity-60">
                                      {o.quantity > 1 ? `${o.quantity} x Rp ${o.price.toLocaleString()}` : ''}
                                    </span>
                                    <span className="font-mono text-slate-700 font-bold">Rp {(o.price * (o.quantity || 1)).toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                              {isHost && (
                                <button 
                                  onClick={() => startEditingOrder(o)}
                                  className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 hover:text-white hover:bg-indigo-500 transition-all duration-300"
                                  title="Edit Price"
                                >
                                  ✎
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {(p.orders || []).length === 0 && <span className="text-xs text-slate-400 italic">Thinking...</span>}
                  </div>
                </div>
              )})}
            </div>
          </GlassCard>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Add My Order form */}
          <GlassCard className="p-6 bg-white shadow-lg border border-slate-200 relative overflow-hidden" intensity="light">
            {isOrderLocked ? (
              <div className="text-center py-6">
                <span className="text-4xl mb-3 block">🔒</span>
                <h2 className="text-slate-800 font-bold mb-2">Pesanan Ditutup</h2>
                <p className="text-sm text-slate-500">Host telah menutup pesanan.<br/>Tidak bisa menambah item baru.</p>
              </div>
            ) : (
              <>
                <h2 className="text-slate-800 font-bold mb-4">Add My Order</h2>
                <form onSubmit={handleAddItem} className="space-y-3">
                  <div className="flex gap-2">
                    <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Food name..." className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                    <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 px-1">
                      <button type="button" onClick={() => setNewQuantity(Math.max(1, newQuantity - 1))} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-indigo-600 font-bold transition-colors">-</button>
                      <span className="w-8 text-center text-sm font-bold text-slate-700">{newQuantity}</span>
                      <button type="button" onClick={() => setNewQuantity(newQuantity + 1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-indigo-600 font-bold transition-colors">+</button>
                    </div>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formatIDR(newPrice)} 
                      onChange={e => setNewPrice(parseIDR(e.target.value))} 
                      placeholder="Price (Rp) - Let empty if unknown" 
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                    {!newPrice && <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 italic">Optional</span>}
                  </div>
                  <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Note (e.g. No onion)" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                  <Button type="submit" variant="primary" className="w-full" size="sm">Add to Cart</Button>
                </form>
              </>
            )}
          </GlassCard>

          {lastMessage && <BillSplitter room={lastMessage} sessionId={sessionId} />}

          {/* Host Receipt Viewer — visible to ALL participants */}
          <HostReceiptViewer receiptUrl={lastMessage?.hostReceiptUrl} />

          {lastMessage?.participants.find((p:any) => p.sessionId === sessionId)?.orders?.length > 0 && (
             <PaymentStatus 
                participant={lastMessage.participants.find((p:any) => p.sessionId === sessionId)} 
                isHost={false} 
                onUploadReceipt={handleUploadReceipt} 
                onConfirmPayment={handleConfirmPayment} 
             />
          )}
        </div>
      </main>
      )}

      {/* Image Lightbox Modal */}
      {showMenuLightbox && lastMessage?.menuImageUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={() => setShowMenuLightbox(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all active:scale-90"
            onClick={() => setShowMenuLightbox(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img 
            src={lastMessage.menuImageUrl} 
            alt="Menu Full Preview" 
            className="max-w-full max-h-full rounded-lg shadow-2xl object-contain animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
