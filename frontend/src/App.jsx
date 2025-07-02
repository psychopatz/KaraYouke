import { useState } from 'react'
import SocketTest from "./components/SocketTest";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
      <SocketTest />
    </div>
    </>
  )
}

export default App
