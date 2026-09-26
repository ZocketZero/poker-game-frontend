import { useEffect, useState } from 'react';
import { socketService, SocketStatus } from '../services/socketService';
import { usePokerStore } from '../store/usePokerStore';
import confetti from 'canvas-confetti';

export function usePokerSocket(serverUrl?: string) {
  const [status, setStatus] = useState<SocketStatus>('disconnected');
  const setGameState = usePokerStore((state) => state.setGameState);
  const setIsConnected = usePokerStore((state) => state.setIsConnected);
  const isMockMode = usePokerStore((state) => state.isMockMode);

  useEffect(() => {
    // If mock mode is active, don't initiate socket connection
    if (isMockMode || !serverUrl) {
      setIsConnected(false);
      setStatus('disconnected');
      return;
    }

    socketService.connect(serverUrl);

    const unsubStatus = socketService.onStatusChange((newStatus) => {
      setStatus(newStatus);
      setIsConnected(newStatus === 'connected');
    });

    const unsubGameState = socketService.onGameState((newState) => {
      setGameState(newState);
    });

    const unsubWinner = socketService.onWinner((result) => {
      console.log('[PokerSocket] Winner declared:', result);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    });

    return () => {
      unsubStatus();
      unsubGameState();
      unsubWinner();
      socketService.disconnect();
    };
  }, [serverUrl, isMockMode, setGameState, setIsConnected]);

  return {
    status,
    isConnected: status === 'connected',
    socketService,
  };
}
