import { useState } from 'react'
import SocketTest from "./components/SocketTest";
import QueueTest from './components/QueueTest';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
      {/* <SocketTest /> */}
      <QueueTest/>
    </div>
    </>
  )
}

export default App
