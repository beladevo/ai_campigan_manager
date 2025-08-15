'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Campaign } from '@/types/campaign';

interface WebSocketHookReturn {
  socket: Socket | null;
  isConnected: boolean;
  joinUserRoom: (userId: string) => void;
  leaveUserRoom: (userId: string) => void;
}

interface CampaignUpdateData {
  campaignId: string;
  status: string;
  campaign: Campaign;
  timestamp: string;
}

interface CampaignCreatedData {
  campaignId: string;
  campaign: Campaign;
  timestamp: string;
}

interface CampaignErrorData {
  message: string;
  campaignId?: string;
  timestamp: string;
}

interface NotificationData {
  type: string;
  message: string;
  data?: unknown;
  timestamp: string;
}

interface UseWebSocketProps {
  onCampaignUpdate?: (data: CampaignUpdateData) => void;
  onCampaignCreated?: (data: CampaignCreatedData) => void;
  onCampaignError?: (data: CampaignErrorData) => void;
  onNotification?: (data: NotificationData) => void;
}

export const useWebSocket = ({
  onCampaignUpdate,
  onCampaignCreated,
  onCampaignError,
  onNotification,
}: UseWebSocketProps = {}): WebSocketHookReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Use refs to store callback functions to avoid re-creating the socket
  const onCampaignUpdateRef = useRef(onCampaignUpdate);
  const onCampaignCreatedRef = useRef(onCampaignCreated);
  const onCampaignErrorRef = useRef(onCampaignError);
  const onNotificationRef = useRef(onNotification);

  // Update refs when callbacks change
  useEffect(() => {
    onCampaignUpdateRef.current = onCampaignUpdate;
    onCampaignCreatedRef.current = onCampaignCreated;
    onCampaignErrorRef.current = onCampaignError;
    onNotificationRef.current = onNotification;
  }, [onCampaignUpdate, onCampaignCreated, onCampaignError, onNotification]);

  useEffect(() => {
    // Create socket connection
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔥 WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Campaign event handlers
    newSocket.on('campaign-update', (data: CampaignUpdateData) => {
      console.log('📡 Campaign update received:', data);
      onCampaignUpdateRef.current?.(data);
    });

    newSocket.on('campaign-created', (data: CampaignCreatedData) => {
      console.log('📡 Campaign created:', data);
      onCampaignCreatedRef.current?.(data);
    });

    newSocket.on('campaign-error', (data: CampaignErrorData) => {
      console.log('📡 Campaign error:', data);
      onCampaignErrorRef.current?.(data);
    });

    newSocket.on('notification', (data: NotificationData) => {
      console.log('📡 Notification received:', data);
      onNotificationRef.current?.(data);
    });

    newSocket.on('joined-room', (data) => {
      console.log('📡 Joined user room:', data);
    });

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, []); // Empty dependency array - only run once on mount

  const joinUserRoom = (userId: string) => {
    if (socket && isConnected) {
      console.log(`🚪 Joining room for user: ${userId}`);
      socket.emit('join-user-room', { userId });
    } else {
      console.warn('⚠️ Cannot join room - socket not connected');
    }
  };

  const leaveUserRoom = (userId: string) => {
    if (socket && isConnected) {
      console.log(`🚪 Leaving room for user: ${userId}`);
      socket.emit('leave-user-room', { userId });
    } else {
      console.warn('⚠️ Cannot leave room - socket not connected');
    }
  };

  return {
    socket,
    isConnected,
    joinUserRoom,
    leaveUserRoom,
  };
};