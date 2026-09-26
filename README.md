# ♠️ Texas Hold'em Poker Frontend

A real-time Texas Hold'em poker web application built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Socket.io**.

---

## 🚀 Quick Start

### 1. Install dependencies (Already installed)
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for production
```bash
npm run build
```

---

## 🕹️ Features Included

1. **Realistic Poker Table & Felt**:
   - Casino green felt oval table with leather bumper rail, inner shadow, and centered community board.
   - Proportional 6-seat table layout (expandable to 9-seat).
2. **Cards & Chips**:
   - Vector-rendered cards with face-up, face-down (intricate patterned card back), and winner highlight states.
   - **4-Color Deck Toggle** (Spades: Black, Hearts: Red, Clubs: Green, Diamonds: Blue) accessible directly from the top bar.
   - Realistic poker chip stacks with denomination color palettes and auto-formatting.
3. **Player Seats**:
   - Avatars, chip counts, current bets.
   - Active turn pulse rings and countdown timer indicator.
   - Dealer button (`D`), Small Blind (`SB`), Big Blind (`BB`) badges.
   - Interactive empty seat slots ("Sit" button).
4. **Action Controls (Action Bar)**:
   - Dynamic buttons: Fold, Check, Call (with amount), Bet / Raise.
   - Raise slider with quick preset buttons: `Min`, `2.5x`, `3x`, `Pot`, and `All-In`.
   - Pre-action check/fold checkboxes when waiting for other players.
5. **Real-time Socket Layer**:
   - Clean `SocketService` class with automatic reconnect and event handlers.
   - `usePokerSocket` React hook for easy synchronization with any backend.
6. **Built-in Dev Simulator Toolbar**:
   - Floating drawer on the right side of the screen.
   - Fast-forward game streets (`Pre-flop` ➔ `Flop` ➔ `Turn` ➔ `River` ➔ `Showdown`).
   - Trigger Showdown & celebration confetti.
   - Simulate opponent bot actions (Call, Raise, Fold) to test turn rotations.
   - Switch between **Mock Mode** and **Live Socket Mode** with one click.

---

## 🔌 Connecting to Your Backend

### Event Contract Reference

All type definitions are located in [`src/types/poker.ts`](./src/types/poker.ts).

#### Inbound Events (Server ➔ Client):
| Event Name | Payload | Description |
| :--- | :--- | :--- |
| `game_state` | `GameState` | Full state of the table (cards, pot, players, turn) |
| `player_joined` | `Player` | Broadcast when a player sits at a seat |
| `player_left` | `{ playerId: string }` | Broadcast when a player leaves or disconnects |
| `player_acted` | `PlayerActionPayload` | Broadcast when a player folds, calls, raises |
| `hand_completed`| `WinningHand` | Winning player IDs, hand name, and pot won |
| `chat_message` | `{ sender, text, timestamp }` | Table chat message |

#### Outbound Events (Client ➔ Server):
| Event Name | Payload | Description |
| :--- | :--- | :--- |
| `join_table` | `{ tableId, seatIndex, buyIn }` | Request to sit at a specific seat |
| `leave_table` | `{ tableId }` | Stand up / leave the table |
| `player_action`| `{ tableId, playerId, action, amount }` | Perform Fold / Check / Call / Raise / All-in |
| `send_chat` | `{ tableId, text }` | Send a chat message to the table |

### Where to configure your backend URL:
Open [`src/App.tsx`](./src/App.tsx) and update the socket URL:
```typescript
usePokerSocket('http://localhost:4000'); // Replace with your backend URL/port
```
Or set it dynamically via an `.env` file (`VITE_SOCKET_URL=http://localhost:4000`).

---

## 📁 Directory Structure

```
poker-front/
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx                     # Main app layout
    ├── index.css                   # Global styles & card animations
    ├── main.tsx                    # React DOM entry
    ├── components/
    │   ├── dev/
    │   │   └── DevSimulatorToolbar.tsx # Game street simulator & bot turn tester
    │   ├── layout/
    │   │   └── Header.tsx          # Top bar (mode, sound, 4-color deck toggle)
    │   └── poker/
    │       ├── ActionBar.tsx       # Fold, Call, Raise slider & action buttons
    │       ├── Card.tsx            # Card component (face-up/down, 4-color)
    │       ├── ChipStack.tsx       # Bet piles & pot chip visualization
    │       ├── CommunityCards.tsx  # Board cards (Flop, Turn, River)
    │       ├── PlayerSeat.tsx      # Player avatar, bankroll, turn timers
    │       ├── PokerTable.tsx      # Felt table layout & seat positions
    │       └── PotDisplay.tsx      # Main pot & side pot values
    ├── hooks/
    │   └── usePokerSocket.ts       # Socket.io connection hook
    ├── services/
    │   └── socketService.ts        # Socket client abstraction & emitters
    ├── store/
    │   └── usePokerStore.ts        # Zustand store managing poker state
    ├── types/
    │   └── poker.ts                # TypeScript interfaces & socket events
    └── utils/
        └── mockData.ts             # Sample game states for testing
```
