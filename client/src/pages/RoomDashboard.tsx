import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useWebSocket } from '../hooks/useWebSocket';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { BillSplitter } from '../components/room/BillSplitter';
import { PaymentStatus } from '../components/room/PaymentStatus';
import { HostReceiptViewer } from '../components/room/HostReceiptViewer';

// New Components
import { RoomHeader } from '../components/room/RoomHeader';
import { MenuOverview } from '../components/room/MenuOverview';
import { HostControls } from '../components/room/HostControls';
import { GlobalOrderList } from '../components/room/GlobalOrderList';
import { AddOrderForm } from '../components/room/AddOrderForm';
import { Lightbox } from '../components/room/Lightbox';

// Utils & Types
import { RootState } from '../store';
import { setRoom, clearRoom } from '../store/slices/roomSlice';
import { parseIDR } from '../utils/formatters';
import { compressImage } from '../utils/image';

const RAW_FILE_LIMIT = 5 * 1024 * 1024; // 5MB

export const RoomDashboard: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { sessionId, myName } = useSelector((state: RootState) => state.auth);
  const currentRoom = useSelector((state: RootState) => state.room.currentRoom);
  
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:9000';
  const { isConnected, sendMessage, lastMessage } = useWebSocket(
    roomId ? `${wsUrl}/api/room/${roomId}/ws?session_id=${sessionId}` : null
  );
  
  // Local UI State
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
  const [showReceiptLightbox, setShowReceiptLightbox] = useState(false);
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);

  // Edit order state (Host only)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState(1);

  const menuFileRef = useRef<HTMLInputElement>(null);
  const hostReceiptRef = useRef<HTMLInputElement>(null);

  // Sync WebSocket message to Redux
  useEffect(() => {
    if (lastMessage) {
      dispatch(setRoom(lastMessage));
      // Pre-fill inputs if they are empty
      if (!taxInput && lastMessage.additionalFees) setTaxInput(lastMessage.additionalFees.toString());
      if (!discountInput && lastMessage.discount) setDiscountInput(lastMessage.discount.toString());
      if (!menuDescInput && lastMessage.menuDescription) setMenuDescInput(lastMessage.menuDescription);
    }
  }, [lastMessage, dispatch]);

  useEffect(() => {
    if (isConnected) {
      sendMessage({ type: 'JOIN_PARTICIPANT', data: { name: myName }});
    }
  }, [isConnected, sendMessage, myName]);

  // Handle Room Deletion
  useEffect(() => {
    if (lastMessage?.type === 'ROOM_DELETED') {
      alert("Room has been closed by the Host.");
      handleLeave();
    }
  }, [lastMessage]);

  // Expiration countdown
  useEffect(() => {
    if (!currentRoom?.expiresAt) return;

    const interval = setInterval(() => {
      const remaining = currentRoom.expiresAt - Date.now();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        alert("Room time has expired.");
        handleLeave();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRoom?.expiresAt]);

  const handleLeave = () => {
    dispatch(clearRoom());
    navigate('/');
  };

  const handleApprove = (targetSessionId: string) => {
    sendMessage({ type: 'APPROVE_PARTICIPANT', data: { targetSessionId }});
  };

  const handleReject = (targetSessionId: string) => {
    sendMessage({ type: 'REJECT_PARTICIPANT', data: { targetSessionId }});
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRoom?.isOrderLocked) return;
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
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
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
      alert("Image too large. Maximum 5 MB.");
      return;
    }
    setUploadingMenu(true);
    try {
      const compressed = await compressImage(file);
      sendMessage({ type: 'UPDATE_MENU', data: { menuImage: compressed }});
      setTimeout(() => setUploadingMenu(false), 2000);
    } catch (err) {
      alert("Failed to process image. Try again.");
      setUploadingMenu(false);
    }
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
      alert("Image too large. Maximum 5 MB.");
      return;
    }
    setUploadingReceipt(true);
    try {
      const compressed = await compressImage(file);
      sendMessage({ type: 'UPLOAD_HOST_RECEIPT', data: { receipt: compressed }});
      setTimeout(() => setUploadingReceipt(false), 2000);
    } catch (err) {
      alert("Failed to process image. Try again.");
      setUploadingReceipt(false);
    }
    if (hostReceiptRef.current) hostReceiptRef.current.value = '';
  };

  const handleOpenReceiptPreview = (url: string) => {
    setActiveReceiptUrl(url);
    setShowReceiptLightbox(true);
  };

  const handleToggleLock = () => {
    sendMessage({ type: 'TOGGLE_ORDER_LOCK', data: {} });
  };

  const handleCloseRoom = () => {
    if (window.confirm("Are you sure you want to close the room and DELETE all order data? This action cannot be undone.")) {
      sendMessage({ type: 'CLOSE_ROOM', data: {} });
    }
  };

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-screen">
         <div className="flex flex-col items-center gap-3 text-indigo-600 font-semibold">
            <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading room...</span>
         </div>
      </div>
    );
  }

  const isHost = currentRoom.hostId === sessionId;
  const participants = currentRoom.participants || [];
  const isOrderLocked = currentRoom.isOrderLocked || false;
  
  const me = participants.find((p) => p.sessionId === sessionId);
  const isApproved = isHost || me?.isApproved;
  const isRejected = me?.isRejected;

  if (isRejected) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-screen">
        <GlassCard className="max-w-md w-full p-10 text-center border-rose-200 bg-rose-50/30">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-2xl font-bold text-rose-800 mb-4">Access Denied</h2>
          <p className="text-slate-600 mb-8">
            Sorry, your request to join was denied by the Host. 
          </p>
          <Button variant="primary" className="w-full" onClick={handleLeave}>
            Back to Home
          </Button>
        </GlassCard>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-screen">
         <GlassCard className="max-w-md w-full p-10 text-center animate-pulse">
            <div className="text-6xl mb-6">👋</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Hello, {myName}!</h2>
            <p className="text-slate-600 mb-8">
              Please wait! the Host is checking your join request. 
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
    );
  }

  const globalTotal = participants.flatMap((p) => p.orders || []).reduce((a, o) => a + (o.price * (o.quantity || 1)), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <RoomHeader 
        roomId={roomId || ''} 
        isConnected={isConnected} 
        isHost={isHost} 
        isOrderLocked={isOrderLocked} 
        timeLeft={timeLeft}
        onLeave={handleLeave}
        onCopyId={handleCopyId}
        copyFeedback={copyFeedback}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <MenuOverview 
            menuImageUrl={currentRoom.menuImageUrl}
            menuDescription={currentRoom.menuDescription}
            isHost={isHost}
            uploadingMenu={uploadingMenu}
            onUploadClick={() => menuFileRef.current?.click()}
            onShowLightbox={() => setShowMenuLightbox(true)}
          />

          {isHost && (
            <HostControls 
              participants={participants}
              menuDescInput={menuDescInput}
              setMenuDescInput={setMenuDescInput}
              onMenuDescUpdate={handleMenuDescUpdate}
              onMenuFileClick={() => menuFileRef.current?.click()}
              hasMenuImage={!!currentRoom.menuImageUrl}
              taxInput={taxInput}
              setTaxInput={setTaxInput}
              discountInput={discountInput}
              setDiscountInput={setDiscountInput}
              onUpdateFees={handleUpdateFees}
              uploadingReceipt={uploadingReceipt}
              onHostReceiptClick={() => hostReceiptRef.current?.click()}
              hasHostReceipt={!!currentRoom.hostReceiptUrl}
              isOrderLocked={isOrderLocked}
              onToggleLock={handleToggleLock}
              onCloseRoom={handleCloseRoom}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}

          <GlobalOrderList 
            participants={participants}
            sessionId={sessionId || ''}
            isHost={isHost}
            globalTotal={globalTotal}
            editingOrderId={editingOrderId}
            editName={editName}
            setEditName={setEditName}
            editPrice={editPrice}
            setEditPrice={setEditPrice}
            editQuantity={editQuantity}
            setEditQuantity={setEditQuantity}
            onStartEdit={startEditingOrder}
            onUpdateOrder={handleUpdateOrder}
            onCancelEdit={() => setEditingOrderId(null)}
            onUploadReceipt={handleUploadReceipt}
            onConfirmPayment={handleConfirmPayment}
            onViewReceipt={handleOpenReceiptPreview}
          />
        </div>

        <div className="space-y-6">
          <AddOrderForm 
            isOrderLocked={isOrderLocked}
            newItem={newItem}
            setNewItem={setNewItem}
            newPrice={newPrice}
            setNewPrice={setNewPrice}
            newNote={newNote}
            setNewNote={setNewNote}
            newQuantity={newQuantity}
            setNewQuantity={setNewQuantity}
            onAddItem={handleAddItem}
          />

          <BillSplitter room={currentRoom} sessionId={sessionId || ''} />

          <HostReceiptViewer receiptUrl={currentRoom.hostReceiptUrl} />

          {me && me.orders.length > 0 && (
             <PaymentStatus 
                participant={me} 
                isHost={false} 
                onUploadReceipt={handleUploadReceipt} 
                onConfirmPayment={handleConfirmPayment} 
                onViewReceipt={handleOpenReceiptPreview}
             />
          )}
        </div>
      </main>

      <Lightbox 
        show={showReceiptLightbox} 
        onClose={() => setShowReceiptLightbox(false)} 
        imageUrl={activeReceiptUrl || ''} 
        alt="Payment Proof" 
        title="Payment Receipt"
        subtitle="Review the details before verifying."
      />

      <Lightbox 
        show={showMenuLightbox} 
        onClose={() => setShowMenuLightbox(false)} 
        imageUrl={currentRoom.menuImageUrl || ''} 
        alt="Menu Full Preview" 
      />

      {/* Hidden file inputs */}
      <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" ref={menuFileRef} onChange={handleMenuUpload} />
      <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" ref={hostReceiptRef} onChange={handleHostReceiptUpload} />
    </div>
  );
};
