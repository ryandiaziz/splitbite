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

export const RoomDashboard: React.FC<RoomDashboardProps> = ({ roomId, sessionId, myName, onLeave }) => {
  const { isConnected, sendMessage, lastMessage } = useWebSocket(`ws://localhost:9000/api/room/${roomId}/ws?session_id=${sessionId}`);
  
  const [newItem, setNewItem] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newNote, setNewNote] = useState('');
  
  const [taxInput, setTaxInput] = useState('');
  const [discountInput, setDiscountInput] = useState('');
  const [menuDescInput, setMenuDescInput] = useState('');

  const [uploadingMenu, setUploadingMenu] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const menuFileRef = useRef<HTMLInputElement>(null);
  const hostReceiptRef = useRef<HTMLInputElement>(null);

  const isHost = lastMessage?.hostId === sessionId;
  const participants = lastMessage?.participants || [];
  const isOrderLocked = lastMessage?.isOrderLocked || false;

  useEffect(() => {
    if (isConnected) {
      sendMessage({ type: 'JOIN_PARTICIPANT', data: { name: myName }});
    }
  }, [isConnected, sendMessage, myName]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOrderLocked) return;
    if (newItem.trim() && newPrice.trim()) {
      const item = { 
        name: newItem, 
        price: Number(newPrice) || 0, 
        note: newNote 
      };
      sendMessage({ type: 'ADD_ORDER', data: item });
      setNewItem('');
      setNewPrice('');
      setNewNote('');
    }
  };

  const handleUpdateFees = () => {
    sendMessage({ type: 'UPDATE_FEES', data: { additionalFees: Number(taxInput) || 0, discount: Number(discountInput) || 0 }});
  };

  const handleUploadReceipt = (base64: string) => {
    sendMessage({ type: 'UPLOAD_RECEIPT', data: { receipt: base64 }});
  };

  const handleConfirmPayment = (targetSessionId: string) => {
    sendMessage({ type: 'CONFIRM_PAYMENT', data: { targetSessionId }});
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

  const globalTotal = participants.flatMap((p: any) => p.orders || []).reduce((a: number, o: any) => a + o.price, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">SplitBite</h1>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 font-mono text-sm rounded-md font-semibold border border-slate-200">
              #{roomId}
            </span>
            {isHost && <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded uppercase">Host</span>}
            {isOrderLocked && (
              <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded uppercase animate-pulse">
                🔒 Pesanan Ditutup
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className="text-sm font-medium text-slate-500 hidden sm:block">{isConnected ? 'Live Sync' : 'Reconnecting...'}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={onLeave}>Leave</Button>
          </div>
        </div>
      </header>

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
                <span className="font-semibold text-sm">Mengupload menu...</span>
              </div>
            ) : lastMessage?.menuImageUrl ? (
              <img
                src={lastMessage.menuImageUrl}
                alt="Menu restoran"
                className="w-full rounded-xl border border-slate-200 object-contain max-h-[480px]"
              />
            ) : isHost ? (
              <div
                onClick={() => menuFileRef.current?.click()}
                className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all duration-200"
              >
                <span className="text-3xl mb-2">📷</span>
                <span className="font-semibold text-sm">Klik untuk upload foto menu</span>
                <span className="text-xs mt-1 opacity-70">Max 1 MB • PNG, JPG, WebP</span>
              </div>
            ) : (
              <div className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                <span className="text-sm italic">Menunggu host upload menu...</span>
              </div>
            )}

            {/* Menu description */}
            {lastMessage?.menuDescription && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">📝 Catatan dari Host</p>
                <p className="text-sm text-amber-900 whitespace-pre-wrap">{lastMessage.menuDescription}</p>
              </div>
            )}

            {/* Hidden file input */}
            <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" ref={menuFileRef} onChange={handleMenuUpload} />
          </div>

          {/* Host Controls */}
          {isHost && (
            <GlassCard className="p-6 bg-white border border-amber-200 shadow-amber-100/50" intensity="light">
              <h2 className="text-lg font-bold text-slate-800 mb-5">Host Controls</h2>

              {/* Menu description input */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Catatan Menu</label>
                <div className="flex gap-2">
                  <textarea
                    value={menuDescInput}
                    onChange={e => setMenuDescInput(e.target.value)}
                    placeholder="Misal: Nasi goreng habis, promo beli 2 gratis 1..."
                    rows={2}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                  />
                  <div className="flex items-end">
                    <Button variant="secondary" size="sm" onClick={handleMenuDescUpdate}>Update</Button>
                  </div>
                </div>
              </div>

              {/* Re-upload menu button */}
              {lastMessage?.menuImageUrl && (
                <div className="mb-5">
                  <Button variant="secondary" size="sm" onClick={() => menuFileRef.current?.click()}>
                    📷 Ganti Foto Menu
                  </Button>
                </div>
              )}

              {/* Billing */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Billing</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-1">Tax / Delivery</label>
                    <input type="number" value={taxInput} onChange={e => setTaxInput(e.target.value)} placeholder="e.g. 15000" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-1">Total Discount</label>
                    <input type="number" value={discountInput} onChange={e => setDiscountInput(e.target.value)} placeholder="e.g. 0" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div className="flex items-end">
                    <Button variant="primary" size="sm" onClick={handleUpdateFees}>Apply</Button>
                  </div>
                </div>
              </div>

              {/* Host receipt upload */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Upload Kuitansi Asli</label>
                <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" ref={hostReceiptRef} onChange={handleHostReceiptUpload} />
                <div className="flex items-center gap-3">
                  <Button variant="secondary" size="sm" disabled={uploadingReceipt} onClick={() => hostReceiptRef.current?.click()}>
                    {uploadingReceipt ? '⏳ Mengupload...' : `🧾 ${lastMessage?.hostReceiptUrl ? 'Ganti Kuitansi' : 'Upload Kuitansi'}`}
                  </Button>
                  {lastMessage?.hostReceiptUrl && (
                    <span className="text-xs text-emerald-600 font-semibold">✓ Sudah diupload</span>
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
                  {isOrderLocked ? '🔓 Buka Pesanan Kembali' : '🔒 Tutup Pesanan'}
                </button>
                <p className="text-xs text-slate-400 text-center mt-1.5">
                  {isOrderLocked ? 'Peserta saat ini tidak bisa menambah/mengubah pesanan' : 'Klik untuk menutup pesanan setelah semua orang selesai memesan'}
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
              {participants.length === 0 && <p className="text-slate-400 text-sm italic">No participants yet.</p>}
              
              {participants.map((p: any, idx: number) => {
                const isMe = p.sessionId === sessionId;
                const pTotal = (p.orders || []).reduce((a: number, o: any) => a + o.price, 0);
                
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
                        <div>
                          <p className="font-semibold text-slate-800">{o.itemName}</p>
                          {o.note && <p className="text-xs text-slate-500 italic mt-0.5">Note: {o.note}</p>}
                        </div>
                        <span className="font-mono text-slate-500">Rp {o.price.toLocaleString()}</span>
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
                  <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Food name..." className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                  <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Price (Rp)" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
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
    </div>
  );
};
