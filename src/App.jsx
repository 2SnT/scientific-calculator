import Calculator from './Calculator'
import './App.css'

function App() {
  const symbols = ['π', '∞', 'Σ', '∫', '√', '∑', '∆', 'e', 'x²', 'log', '∂', '±', '+', '-', '*', '/', '()', '^'];
  const numSymbols = 60; // Increase the number of floating symbols

  return (
    <div className="app">
      {/* Fullscreen Floating Symbols Background */}
      <div className="symbol-container">
        {Array.from({ length: numSymbols }).map((_, index) => (
          <span 
            key={index} 
            className="symbol"
            style={{ 
              left: `${Math.random() * 100}%`,  // Random horizontal start position
              top: `${Math.random() * 100}%`,   // Random vertical start position
              fontSize: `${Math.random() * 20 + 20}px`,  // Random size (20px - 40px)
              animationDuration: `${Math.random() * 10 + 5}s`,  // Random speed (5-15s)
              animationDelay: `${Math.random() * 5}s`,  // Stagger animations
              opacity: `${Math.random() * 0.5 + 0.3}`,  // Random opacity (0.3 - 0.8)
            }}
          >
            {symbols[Math.floor(Math.random() * symbols.length)]}
          </span>
        ))}
      </div>
      <div className="header">
        <h1>Scientific Calculator</h1>
        <p>By Ali & Apolinario</p>
      </div>
      <Calculator />
      {/* <p>By Ali & Apolinario</p> */}
    </div>
  )
}

export default App
