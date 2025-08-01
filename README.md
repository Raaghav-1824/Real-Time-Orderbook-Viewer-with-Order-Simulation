# Real-Time Orderbook Viewer with Order Simulation

A Next.js application that displays real-time orderbook data from multiple cryptocurrency exchanges (OKX, Bybit, and Deribit) with advanced order simulation capabilities. Users can simulate order placement, visualize market impact, and understand optimal trading timing across different venues.

![Orderbook Viewer](https://img.shields.io/badge/Next.js-15.4.4-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38bdf8) ![Real-time](https://img.shields.io/badge/Real--time-WebSocket-green)

## 🚀 Features

### Core Functionality
- **Multi-Venue Orderbook Display**: Real-time orderbooks from OKX, Bybit, and Deribit
- **15+ Price Levels**: Display best bids and asks with depth visualization
- **Real-time Updates**: WebSocket connections for live data streaming
- **Seamless Venue Switching**: Toggle between exchanges instantly
- **Order Simulation**: Advanced order placement simulation with impact analysis

### Order Simulation Form
- **Venue Selection**: Choose from OKX, Bybit, or Deribit
- **Symbol Input**: Support for major trading pairs (BTC-USD, ETH-USD, etc.)
- **Order Types**: Market and Limit order simulation
- **Side Selection**: Buy/Sell order simulation
- **Price Control**: Dynamic price input for limit orders
- **Quantity Input**: Flexible quantity specification
- **Timing Controls**: Simulate different execution timings (immediate, 5s, 10s, 30s delay)
- **Form Validation**: Comprehensive input validation with Zod schema

### Order Placement Visualization
- **Visual Order Positioning**: See exactly where your order sits in the orderbook
- **Impact Metrics Display**:
  - Estimated fill percentage
  - Market impact calculation
  - Slippage estimation
  - Time to fill estimation
  - Total cost calculation
- **Color-coded Indicators**: Visual feedback for order impact levels
- **Spread Visualization**: Real-time bid-ask spread with percentage display

### Market Depth Visualization
- **Interactive Charts**: Market depth visualization using Recharts
- **Cumulative Volume**: Bid/ask volume accumulation display
- **Mid-price Reference**: Clear market center indication
- **Responsive Design**: Optimized for both desktop and mobile

### Design & Performance
- **Responsive Layout**: Desktop grid and mobile tab-based navigation
- **Dark Trading Theme**: Professional trading interface
- **Real-time Animations**: Smooth price change indicators
- **Performance Optimized**: Throttled updates for high-frequency data
- **Error Handling**: Robust error management and fallback mechanisms

## 🛠 Tech Stack

### Frontend Framework
- **Next.js 15.4.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5.0** - Type safety and developer experience

### Styling & UI
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Tailwind Merge** - Conditional class merging
- **Lucide React** - Icon library
- **Framer Motion** - Animation library

### State Management & Forms
- **Zustand 5.0.6** - Lightweight state management
- **React Hook Form 7.61.1** - Form handling and validation
- **Zod 4.0.13** - Schema validation
- **@hookform/resolvers** - Form validation resolvers

### Data Visualization
- **Recharts 3.1.0** - Charting library for market depth
- **D3.js 7.9.0** - Data visualization utilities

### Real-time Communication
- **ws 8.18.3** - WebSocket client for real-time data
- **@types/ws** - TypeScript definitions for WebSocket

### HTTP Client & Utilities
- **Axios 1.11.0** - HTTP client for REST API calls
- **date-fns 4.1.0** - Date manipulation utilities
- **clsx 2.1.1** - Conditional class names

### Development Tools
- **ESLint 9.0** - Code linting
- **Prettier 3.6.2** - Code formatting
- **eslint-config-prettier** - ESLint-Prettier integration

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher) or **yarn** or **pnpm**
- **Git** for version control

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd orderbook-viewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Verify installation**
   ```bash
   npm run build
   ```

## 🚀 Running the Project Locally

### Development Mode
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

## 📱 Usage Instructions

### Getting Started
1. **Launch the application** in your browser
2. **Select a venue** (OKX, Bybit, or Deribit) from the venue selector
3. **Choose a trading symbol** (e.g., BTC-USDT, ETH-USDT)
4. **View real-time orderbook** data in the center panel

### Order Simulation
1. **Fill out the order form**:
   - Select venue and symbol
   - Choose order type (Market/Limit)
   - Select side (Buy/Sell)
   - Enter quantity
   - Set price (for limit orders)
   - Choose timing scenario

2. **Submit the simulation** to see:
   - Order placement in the orderbook
   - Visual highlighting of your order position
   - Detailed impact metrics
   - Market depth visualization

### Venue Switching
- Use the **venue selector** to switch between exchanges
- **Connection status** indicators show real-time connectivity
- **Refresh button** available for manual data updates

## 🔌 API Documentation References

### Exchange APIs Used

#### OKX API
- **Documentation**: [https://www.okx.com/docs-v5/](https://www.okx.com/docs-v5/)
- **WebSocket**: `wss://ws.okx.com:8443/ws/v5/public`
- **REST Endpoint**: `https://www.okx.com/api/v5/market/books`
- **Orderbook Channel**: `books5` (5 levels) and `books` (full depth)

#### Bybit API
- **Documentation**: [https://bybit-exchange.github.io/docs/v5/intro](https://bybit-exchange.github.io/docs/v5/intro)
- **WebSocket**: `wss://stream.bybit.com/v5/public/spot`
- **REST Endpoint**: `https://api.bybit.com/v5/market/orderbook`
- **Orderbook Channel**: `orderbook.{depth}.{symbol}`

#### Deribit API
- **Documentation**: [https://docs.deribit.com/](https://docs.deribit.com/)
- **WebSocket**: `wss://www.deribit.com/ws/api/v2`
- **REST Endpoint**: `https://www.deribit.com/api/v2/public/get_order_book`
- **Orderbook Channel**: `book.{instrument_name}.{interval}`

## ⚠️ Rate Limiting Considerations

### API Rate Limits
- **OKX**: 20 requests per 2 seconds for public endpoints
- **Bybit**: 120 requests per minute for public endpoints  
- **Deribit**: 20 requests per second for public endpoints

### WebSocket Connections
- **Connection Limits**: Each exchange allows multiple WebSocket connections
- **Subscription Limits**: Limited number of simultaneous subscriptions per connection
- **Reconnection Logic**: Automatic reconnection with exponential backoff

### Implementation Safeguards
- **Request Throttling**: Built-in request rate limiting
- **Connection Pooling**: Efficient WebSocket connection management
- **Error Handling**: Graceful degradation on rate limit hits
- **Fallback Mechanisms**: REST API fallback when WebSocket fails

### Best Practices
- **Minimal Subscriptions**: Only subscribe to actively viewed symbols
- **Connection Cleanup**: Proper WebSocket disconnection on component unmount
- **Caching Strategy**: Smart data caching to reduce API calls

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── button.tsx     # Button component
│   │   ├── card.tsx       # Card component
│   │   ├── input.tsx      # Input component
│   │   ├── tabs.tsx       # Tabs component
│   │   └── dropdown.tsx   # Dropdown component
│   ├── charts/            # Chart components
│   │   └── MarketDepthChart.tsx
│   ├── orderbook/         # Orderbook-related components
│   │   ├── OrderBookTable.tsx
│   │   ├── OrderbookDesktop.tsx
│   │   ├── OrderbookWithSimulation.tsx
│   │   └── OrderImpactPanel.tsx
│   ├── venue/             # Venue-related components
│   │   └── VenueSelector.tsx
│   └── OrderFormDesktop.tsx
├── hooks/                 # Custom React hooks
│   ├── use-orderbook.ts   # Orderbook data management
│   ├── use-order-simulation.ts # Order simulation logic
│   └── use-throttled-orderbook.ts # Performance optimization
├── lib/
│   ├── types/             # TypeScript type definitions
│   │   ├── orderbook.ts   # Orderbook data types
│   │   └── simulation.ts  # Simulation types
│   ├── utils/             # Utility functions
│   │   ├── utils.ts       # General utilities
│   │   └── orderbook-merger.ts # WebSocket data merging
│   ├── venue/             # Exchange integration
│   │   ├── base-venue.ts  # Abstract base class
│   │   ├── venue-config.ts # Exchange configurations
│   │   ├── venue-factory.ts # Factory pattern implementation
│   │   ├── oks-venue.ts   # OKX implementation
│   │   ├── byBit-venue.ts # Bybit implementation
│   │   └── deribit-venue.ts # Deribit implementation
│   ├── simulation/        # Order simulation engine
│   │   └── order-simulation-engine.ts
│   └── data/              # Mock and test data
│       └── mock-orderbook.ts
└── store/                 # Zustand state management
    ├── orderbookStore.ts  # Orderbook state
    └── simulationStore.ts # Simulation state
```

## 🔧 Key Assumptions Made

### Trading Assumptions
- **Symbol Formatting**: Standardized symbol format conversion (e.g., BTC-USDT ↔ BTCUSDT)
- **Price Precision**: 2-8 decimal places depending on asset type
- **Order Size Limits**: Minimum order sizes vary by exchange and symbol
- **Market Hours**: 24/7 trading availability for crypto markets

### Technical Assumptions
- **WebSocket Reliability**: Automatic reconnection handles temporary disconnections
- **Data Freshness**: 100-500ms latency acceptable for real-time display
- **Browser Compatibility**: Modern browsers with WebSocket and ES6+ support
- **Network Stability**: Reasonable internet connection for real-time data

### Exchange API Assumptions
- **Public Data Access**: All orderbook data is publicly available without authentication
- **Consistent Data Format**: Exchanges provide standardized orderbook structures
- **Rate Limit Compliance**: API usage stays within documented rate limits
- **Service Availability**: Exchange APIs maintain >99% uptime

### Simulation Assumptions
- **Market Impact Model**: Linear impact calculation for simplicity
- **Fill Time Estimation**: Based on current market depth and historical patterns
- **Slippage Calculation**: Simplified model without advanced market microstructure
- **No Latency Arbitrage**: Simulation doesn't account for cross-venue arbitrage

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow ESLint and Prettier configurations
2. **Type Safety**: Maintain strict TypeScript usage
3. **Component Structure**: Follow established patterns in `/components`
4. **State Management**: Use Zustand for global state, React hooks for local state
5. **Testing**: Add unit tests for new utility functions and components

### Adding New Exchanges
1. **Create venue implementation**: Extend `BaseVenueClient` class
2. **Add configuration**: Update `venue-config.ts`
3. **Register in factory**: Add to `venue-factory.ts`
4. **Update types**: Extend relevant TypeScript interfaces
5. **Test integration**: Verify WebSocket and REST API functionality

## 📄 License

This project is for educational and demonstration purposes. Please ensure compliance with exchange API terms of service.

## 🐛 Known Issues & Limitations

- **Rate Limiting**: Heavy usage may hit exchange rate limits
- **WebSocket Reconnection**: Brief data gaps during reconnection
- **Mobile Performance**: High-frequency updates may impact mobile performance
- **Cross-venue Latency**: Different exchanges have varying latency characteristics

## 📞 Support

For issues, questions, or contributions, please refer to the project repository or contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**