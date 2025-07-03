// frontend/src/App.jsx
import { Routes, Route } from "react-router-dom"
import RemoteQueue from "./pages/RemoteQueue"
import SessionTest from "./pages/SessionTest"

function App() {
  return (
    <Routes>
      <Route path="/" element={<SessionTest />} />
      <Route path="/remote" element={<RemoteQueue />} />
    </Routes>
  )
}

export default App
