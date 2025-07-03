import { useState } from 'react'
import SocketTest from "./components/SocketTest";
import QueueTest from './components/QueueTest';
import ServerScannerTest from './pages/ServerScannerTest';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
      {/* <SocketTest /> */}
      {/* <QueueTest/> */}
      <ServerScannerTest/>
    </div>
    </>
  )
}

export default App
