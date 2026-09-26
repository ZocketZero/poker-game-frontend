import React from 'react';
import { Header } from './components/layout/Header';
import { PokerTable } from './components/poker/PokerTable';
import { ActionBar } from './components/poker/ActionBar';
import { DevSimulatorToolbar } from './components/dev/DevSimulatorToolbar';
import { usePokerSocket } from './hooks/usePokerSocket';

export const App: React.FC = () => {
  // Initialize Socket.io connection hook (connects when mockMode is false)
  usePokerSocket('http://localhost:4000');

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#07090e] to-black text-slate-100 overflow-x-hidden">
      {/* Top Header */}
      <Header />

      {/* Main Table Arena */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden relative">
        <PokerTable />
      </main>

      {/* Interactive Bottom Action Bar */}
      <ActionBar />

      {/* Developer Testing / Simulation Toolbar */}
      <DevSimulatorToolbar />
    </div>
  );
};

export default App;
