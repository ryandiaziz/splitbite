export interface IOrder {
  id: string;
  itemName: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface IParticipant {
  sessionId: string;
  name: string;
  isApproved: boolean;
  isRejected: boolean;
  orders: IOrder[];
  receiptUrl?: string;
  isPaid?: boolean;
}

export interface IRoom {
  id: string;
  hostId: string;
  roomType: 'image' | 'structured';
  isOrderLocked: boolean;
  menuImageUrl?: string;
  menuDescription?: string;
  hostReceiptUrl?: string;
  expiresAt: number;
  participants: IParticipant[];
  additionalFees: number;
  discount: number;
}

export interface IRoomState {
  currentRoom: IRoom | null;
  isLoading: boolean;
  error: string | null;
}
