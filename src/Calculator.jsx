import { useState, useEffect, useCallback } from "react"
import "./Calculator.css"

function Calculator() {
  const [calc, setCalc] = useState("")
  const [result, setResult] = useState("")
  const [memory, setMemory] = useState(0)
  const [angleMode, setAngleMode] = useState("DEG") // DEG or RAD
  const [secondMode, setSecondMode] = useState(false) // For 2nd function key
  const [theme, setTheme] = useState("dark-theme") // dark-theme or light-theme
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  // Apply theme to body
  useEffect(() => {
    document.body.className = theme
  }, [theme])

  const operators = ["+", "-", "*", "/", "%"]

  const updateCals = (value) => {
    // Prevent invalid operator usage
    if (
      (operators.includes(value) && calc === "") ||
      (operators.includes(value) && operators.includes(calc.slice(-1)))
    ) {
      return
    }

    const newCalc = calc + value
    setCalc(newCalc)

    // Only try to calculate result if the expression might be complete
    if (isCompleteExpression(newCalc)) {
      try {
        const res = evaluateExpression(newCalc)
        setResult(res)
      } catch {
        setResult("")
      }
    }
  }

  // Check if an expression might be complete enough to evaluate
  const isCompleteExpression = (expr) => {
    // Check for balanced parentheses
    let openParens = 0
    for (const char of expr) {
      if (char === "(") openParens++
      if (char === ")") openParens--
    }

    // Don't evaluate if we have unbalanced parentheses
    if (openParens !== 0) return false

    // Don't evaluate if the expression ends with a function name or operator
    const functionNames = [
      "sin",
      "cos",
      "tan",
      "sinh",
      "cosh",
      "tanh",
      "asin",
      "acos",
      "atan",
      "asinh",
      "acosh",
      "atanh",
      "log",
      "ln",
      "log2",
      "sqrt",
      "cbrt",
      "rand",
    ]

    for (const func of functionNames) {
      if (expr.endsWith(func)) return false
    }

    if (operators.includes(expr.slice(-1))) return false

    // Don't evaluate if the expression ends with ^ (power)
    if (expr.endsWith("^")) return false

    return true
  }

  // Convert degrees to radians if needed
  const adjustAngle = (angle) => {
    return angleMode === "DEG" ? (angle * Math.PI) / 180 : angle
  }

  // Convert radians to degrees if needed for inverse functions
  const adjustAngleInverse = (angle) => {
    return angleMode === "DEG" ? (angle * 180) / Math.PI : angle
  }

  // Function to evaluate scientific expressions
  const evaluateExpression = useCallback(
    (expression) => {
      // First handle special exponential cases
      let processedExpr = expression
        .replace(/e\^(\d+|$$.*?$$)/g, "Math.pow(Math.E,$1)")
        .replace(/10\^(\d+|$$.*?$$)/g, "Math.pow(10,$1)")
        .replace(/2\^(\d+|$$.*?$$)/g, "Math.pow(2,$1)")

      // Then replace scientific notations with JavaScript equivalents
      processedExpr = processedExpr
        // Basic trig functions
        .replace(/sin\(/g, `sin(`)
        .replace(/cos\(/g, `cos(`)
        .replace(/tan\(/g, `tan(`)
        // Hyperbolic functions
        .replace(/sinh\(/g, "Math.sinh(")
        .replace(/cosh\(/g, "Math.cosh(")
        .replace(/tanh\(/g, "Math.tanh(")
        // Inverse trig functions
        .replace(/asin\(/g, `asin(`)
        .replace(/acos\(/g, `acos(`)
        .replace(/atan\(/g, `atan(`)
        // Inverse hyperbolic functions
        .replace(/asinh\(/g, `asinh(`)
        .replace(/acosh\(/g, `acosh(`)
        .replace(/atanh\(/g, `atanh(`)
        // Logarithmic functions
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/log2\(/g, "Math.log2(")
        // Square root and cube root
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/cbrt\(/g, "Math.cbrt(")
        // Constants
        .replace(/π/g, "Math.PI")
        .replace(/e/g, "Math.E")
        // Factorial
        .replace(/(\d+|\))!/g, "factorial($1)")
        // Percentage
        .replace(/(\d+|\))%/g, "$1/100")
        // Scientific notation (EE)
        .replace(/(\d+)EE(-?\d+)/g, "$1*Math.pow(10,$2)")
        // Random
        .replace(/rand$$$$/g, "Math.random()")

      // Handle power operations
      processedExpr = processedExpr
        .replace(/(\d+|\))²/g, "Math.pow($1,2)")
        .replace(/(\d+|\)|\w+\.\w+)\^(\d+|\()/g, "Math.pow($1,$2)")

      // Handle reciprocal
      processedExpr = processedExpr.replace(/1\/(\d+|\w+$$.*?$$)/g, "1/$1")

      console.log("Processed expression:", processedExpr)

      try {
        // Define custom functions
        const factorial = (n) => {
          if (n === 0 || n === 1) return 1
          return n * factorial(n - 1)
        }

        const sin = (x) => Math.sin(adjustAngle(x))
        const cos = (x) => Math.cos(adjustAngle(x))
        const tan = (x) => Math.tan(adjustAngle(x))

        const asin = (x) => adjustAngleInverse(Math.asin(x))
        const acos = (x) => adjustAngleInverse(Math.acos(x))
        const atan = (x) => adjustAngleInverse(Math.atan(x))

        const asinh = (x) => {
          console.log("asinh called with:", x)
          const result = Math.asinh(Number(x))
          console.log("asinh result:", result)
          return result
        }

        const acosh = (x) => {
          console.log("acosh called with:", x)
          const result = Math.acosh(Number(x))
          console.log("acosh result:", result)
          return result
        }

        const atanh = (x) => {
          console.log("atanh called with:", x)
          const result = Math.atanh(Number(x))
          console.log("atanh result:", result)
          return result
        }

        // Use Function constructor to evaluate the expression with custom functions
        const resultValue = new Function(
          "factorial",
          "sin",
          "cos",
          "tan",
          "asin",
          "acos",
          "atan",
          "asinh",
          "acosh",
          "atanh",
          `try {
            return ${processedExpr};
          } catch (error) {
            console.error("Error in function evaluation:", error);
            throw error;
          }`,
        )(factorial, sin, cos, tan, asin, acos, atan, asinh, acosh, atanh).toString()

        return resultValue
      } catch (error) {
        console.error("Evaluation error:", error, "Expression:", processedExpr)
        throw error
      }
    },
    [angleMode],
  )

  const calculate = () => {
    try {
      const resultValue = evaluateExpression(calc)

      // Add to history
      setHistory([{ expression: calc, result: resultValue }, ...history].slice(0, 10)) // Keep only the last 10 calculations

      setCalc(resultValue)
      setResult("")
    } catch (error) {
      console.error("Calculation error:", error)
      setCalc("Error")
      setResult("")
    }
  }

  const deleteLast = () => {
    if (calc === "") return
    const value = calc.slice(0, -1)
    setCalc(value)

    if (value === "") {
      setResult("")
    } else if (isCompleteExpression(value)) {
      try {
        setResult(evaluateExpression(value))
      } catch {
        setResult("")
      }
    } else {
      setResult("")
    }
  }

  const clearAll = () => {
    setCalc("")
    setResult("")
  }

  // Function to add a function with parenthesis
  const addFunction = (func) => {
    updateCals(`${func}(`)
  }

  // Memory functions
  const memoryClear = () => {
    setMemory(0)
  }

  const memoryAdd = () => {
    try {
      const currentValue = calc ? Number.parseFloat(evaluateExpression(calc)) : 0
      setMemory(memory + currentValue)
    } catch {
      // Do nothing if evaluation fails
    }
  }

  const memorySubtract = () => {
    try {
      const currentValue = calc ? Number.parseFloat(evaluateExpression(calc)) : 0
      setMemory(memory - currentValue)
    } catch {
      // Do nothing if evaluation fails
    }
  }

  const memoryRecall = () => {
    updateCals(memory.toString())
  }

  // Toggle between degrees and radians
  const toggleAngleMode = () => {
    setAngleMode(angleMode === "DEG" ? "RAD" : "DEG")
  }

  // Toggle 2nd function mode
  const toggleSecondMode = () => {
    setSecondMode(!secondMode)
  }

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark-theme" ? "light-theme" : "dark-theme")
  }

  // Toggle history panel
  const toggleHistory = () => {
    setShowHistory(!showHistory)
  }

  // Clear history
  const clearHistory = () => {
    setHistory([])
  }

  // Use a history item
  const useHistoryItem = (item) => {
    setCalc(item.result)
    setResult("")
  }

  // Special functions
  const square = () => {
    updateCals("²")
  }

  const reciprocal = () => {
    if (calc) {
      try {
        // Evaluate the current expression first
        const currentValue = evaluateExpression(calc)
        // Then set the reciprocal value
        setCalc((1 / Number.parseFloat(currentValue)).toString())
        setResult("")
      } catch (error) {
        console.error("Error calculating reciprocal:", error)
        setCalc("Error")
        setResult("")
      }
    }
  }

  const percentage = () => {
    updateCals("%")
  }

  const random = () => {
    updateCals("rand()")
  }

  const scientificNotation = () => {
    updateCals("EE")
  }

  const toggleSign = () => {
    if (calc) {
      // If the expression is a valid number, toggle its sign
      try {
        const currentValue = evaluateExpression(calc)
        setCalc((-1 * Number.parseFloat(currentValue)).toString())
        setResult("")
      } catch (error) {
        console.error("Error toggling sign:", error)
        setCalc("Error")
        setResult("")
      }
    }
  }
  

  return (
    <div className="calculator-container">
      <div className="calculator">
        <div className="display">
          {memory !== 0 && <div className="memory-indicator">M</div>}
          <div className="display-controls">
            <button className="theme-toggle-button" onClick={toggleTheme}
            title={theme === "dark-theme" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark-theme" ? "☀️" : "🌙"}
            </button>
            <button className="history-toggle-button" onClick={toggleHistory} 
            title={showHistory ? "Exit History" : "Show calculation history"}
            >
              {showHistory ? "×" : "📜"}
            </button>
          </div>
          <div className="expression-value">{calc || "0"}</div>
          <div className="display-value">{result || "0"}</div>
        </div>

        <div className="calculator-body">
          <div className="scientific-panel">
            <div className="memory-row">
              <button
                className={`memory-button ${secondMode ? "second-mode" : "first-mode"}`}
                onClick={toggleSecondMode}
              >
                {secondMode ? "1st" : "2nd"}
              </button>
              <button
                className={`memory-button ${angleMode === "DEG" ? "degree-mode" : "radian-mode"}`}
                onClick={toggleAngleMode}
              >
                {angleMode}
              </button>
              <button className="memory-button" onClick={memoryClear}>
                MC
              </button>
              <button className="memory-button" onClick={memoryRecall}>
                MR
              </button>
              <button className="memory-button" onClick={memoryAdd}>
                M+
              </button>
              <button className="memory-button" onClick={memorySubtract}>
                M-
              </button>
            </div>

            <div className="scientific-grid">
              <button className="scientific-button" onClick={() => toggleSign("±")}>
                ±
              </button>
              <button className="scientific-button" onClick={() => updateCals("π")}>
                π
              </button>
              <button className="scientific-button" onClick={() => updateCals("(")}>
                &#40;
              </button>
              <button className="scientific-button" onClick={() => updateCals(")")}>
                &#41;
              </button>
              <button className="scientific-button" onClick={percentage}>
                %
              </button>
              <button className="scientific-button" onClick={() => updateCals("e")}>
                e
              </button>
              <button className="scientific-button" onClick={() => updateCals("!")}>
                x!
              </button>
              <button className="scientific-button" onClick={() => addFunction("sqrt")}>
                √
              </button>
              <button className="scientific-button" onClick={() => updateCals("e^")}>
                eˣ
              </button>

              {secondMode ? (
                <>
                  <button className="scientific-button" onClick={() => addFunction("asin")}>
                    sin⁻¹
                  </button>
                  <button className="scientific-button" onClick={() => addFunction("acos")}>
                    cos⁻¹
                  </button>
                  <button className="scientific-button" onClick={() => addFunction("atan")}>
                    tan⁻¹
                  </button>
                  <button className="scientific-button" onClick={() => addFunction("log2")}>
                    log₂
                  </button>
                  <button className="scientific-button" onClick={() => updateCals("2^")}>
                    2ˣ
                  </button>
                  <button className="scientific-button" onClick={() => updateCals("10^")}>
                    10ˣ
                  </button>
                  <button className="scientific-button" onClick={reciprocal}>
                    1/x
                  </button>
                  <button className="scientific-button" onClick={scientificNotation}>
                    EE
                  </button>
                  <button className="scientific-button" onClick={random}>
                    Rand
                  </button>
                </>
              ) : (
                <>
                  <button className="scientific-button" onClick={() => addFunction("sin")}>
                    sin
                  </button>
                  <button className="scientific-button" onClick={() => addFunction("cos")}>
                    cos
                  </button>
                  <button className="scientific-button" onClick={() => addFunction("tan")}>
                    tan
                  </button>
                  <button className="scientific-button" onClick={() => addFunction("log")}>
                    log
                  </button>
                  <button className="scientific-button" onClick={() => addFunction("sinh")}>
                    sinh
                  </button>
                  <button className="scientific-button" onClick={() => addFunction("cosh")}>
                    cosh
                  </button>
                  <button className="scientific-button" onClick={() => addFunction("tanh")}>
                    tanh
                  </button>
                  <button className="scientific-button" onClick={() => addFunction("ln")}>
                    ln
                  </button>
                  <button className="scientific-button" onClick={square}>
                    x²
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="standard-panel">
            <div className="standard-grid">
              <div className="clear-row">
                <button className="clear-button" onClick={clearAll}>
                  AC
                </button>
                <button className="clear-button" onClick={deleteLast}>
                  DEL
                </button>
              </div>

              <div className="numpad-grid">
                <button className="number-button" onClick={() => updateCals("7")}>
                  7
                </button>
                <button className="number-button" onClick={() => updateCals("8")}>
                  8
                </button>
                <button className="number-button" onClick={() => updateCals("9")}>
                  9
                </button>
                <button className="operator-button" onClick={() => updateCals("/")}>
                  ÷
                </button>

                <button className="number-button" onClick={() => updateCals("4")}>
                  4
                </button>
                <button className="number-button" onClick={() => updateCals("5")}>
                  5
                </button>
                <button className="number-button" onClick={() => updateCals("6")}>
                  6
                </button>
                <button className="operator-button" onClick={() => updateCals("*")}>
                  ×
                </button>

                <button className="number-button" onClick={() => updateCals("1")}>
                  1
                </button>
                <button className="number-button" onClick={() => updateCals("2")}>
                  2
                </button>
                <button className="number-button" onClick={() => updateCals("3")}>
                  3
                </button>
                <button className="operator-button" onClick={() => updateCals("-")}>
                  −
                </button>

                <button className="number-button zero-button" onClick={() => updateCals("0")}>
                  0
                </button>
                <button className="number-button" onClick={() => updateCals(".")}>
                  .
                </button>
                <button className="operator-button" onClick={() => updateCals("+")}>
                  +
                </button>
              </div>

              <button className="equals-button" onClick={calculate}>
                =
              </button>
            </div>
          </div>
        </div>
      </div>

      {showHistory && (
        <div className="history-panel">
          <div className="history-header">
            <h2>History</h2>
            <button className="clear-history-button" onClick={clearHistory}>
              Clear History
            </button>
          </div>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="no-history">No calculations yet</div>
            ) : (
              history.map((item, index) => (
                <div key={index} className="history-item" onClick={() => useHistoryItem(item)}>
                  <div className="history-expression">{item.expression}</div>
                  <div className="history-result">{item.result}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Calculator