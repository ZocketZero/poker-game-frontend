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
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between bg-[#07090e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#07090e] to-black text-slate-100">
      {/* Top Header */}
      <Header />

      {/* Main Table Arena */}
      <main className="flex-1 min-h-0 w-full flex items-center justify-center p-1 sm:p-2 md:p-3 overflow-hidden relative">
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
