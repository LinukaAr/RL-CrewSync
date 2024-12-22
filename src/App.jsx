import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>
          <button onClick={() => setCount((count) => count + 1)}>
            Count is {count}
          </button>
        </p>
        <p>
          Learn React with Vite!
        </p>
      </header>
    </div>
  );
}

export default App;
