import { useEffect, useState } from 'react';
import { pokerWsClient, WsStatus } from '../services/pokerWebSocket';
import { usePokerStore } from '../store/usePokerStore';
import { apiClient } from '../services/apiClient';

export function usePokerSocket() {
  const [status, setStatus] = useState<WsStatus>('disconnected');

  const auth = usePokerStore((state) => state.auth);
  const setIsConnected = usePokerStore((state) => state.setIsConnected);

  const applyTableState = usePokerStore((state) => state.applyTableState);
  const applyHoleCards = usePokerStore((state) => state.applyHoleCards);
  const applyYourTurn = usePokerStore((state) => state.applyYourTurn);
  const applyGameEvent = usePokerStore((state) => state.applyGameEvent);
  const applyPlayerJoined = usePokerStore((state) => state.applyPlayerJoined);
  const applyPlayerLeft = usePokerStore((state) => state.applyPlayerLeft);
  const applyPlayerEliminated = usePokerStore((state) => state.applyPlayerEliminated);
  const applyTournamentEnded = usePokerStore((state) => state.applyTournamentEnded);
  const applyServerError = usePokerStore((state) => state.applyServerError);

  useEffect(() => {
    // If without token, do not connect
    if (!auth.token) {
      setIsConnected(false);
      setStatus('disconnected');
      pokerWsClient.disconnect();
      return;
    }

    const wsUrl = apiClient.getWsUrl();
    pokerWsClient.connect(wsUrl, auth.token);

    const unsubStatus = pokerWsClient.onStatusChange((newStatus) => {
      setStatus(newStatus);
      setIsConnected(newStatus === 'connected');
    });

    const unsubTableList = pokerWsClient.onTableList((msg) => {
      usePokerStore.setState({ tables: msg.tables });
    });

    const unsubTableState = pokerWsClient.onTableState((msg) => {
      applyTableState(msg);
    });

    const unsubHoleCards = pokerWsClient.onHoleCards((msg) => {
      applyHoleCards(msg.cards);
    });

    const unsubYourTurn = pokerWsClient.onYourTurn((msg) => {
      applyYourTurn(msg.legal_actions);
    });

    const unsubGameEvent = pokerWsClient.onGameEvent((msg) => {
      applyGameEvent(msg.event);
    });

    const unsubPlayerJoined = pokerWsClient.onPlayerJoined((msg) => {
      applyPlayerJoined(msg);
    });

    const unsubPlayerLeft = pokerWsClient.onPlayerLeft((msg) => {
      applyPlayerLeft(msg);
    });

    const unsubPlayerEliminated = pokerWsClient.onPlayerEliminated((msg) => {
      applyPlayerEliminated(msg);
    });

    const unsubTournamentEnded = pokerWsClient.onTournamentEnded((msg) => {
      applyTournamentEnded(msg);
    });

    const unsubError = pokerWsClient.onError((msg) => {
      applyServerError(msg.message);
    });

    return () => {
      unsubStatus();
      unsubTableList();
      unsubTableState();
      unsubHoleCards();
      unsubYourTurn();
      unsubGameEvent();
      unsubPlayerJoined();
      unsubPlayerLeft();
      unsubPlayerEliminated();
      unsubTournamentEnded();
      unsubError();
      pokerWsClient.disconnect();
    };
  }, [
    auth.token,
    setIsConnected,
    applyTableState,
    applyHoleCards,
    applyYourTurn,
    applyGameEvent,
    applyPlayerJoined,
    applyPlayerLeft,
    applyPlayerEliminated,
    applyTournamentEnded,
    applyServerError,
  ]);

  return {
    status,
    isConnected: status === 'connected',
    pokerWsClient,
  };
}
