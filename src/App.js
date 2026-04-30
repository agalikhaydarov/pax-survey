import { BrowserRouter, Routes, Route } from "react-router-dom";
import Clients from "./surveys/clients";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/clients" element={<Clients />} />
        <Route path="/" element={<Clients />} />
      </Routes>
    </BrowserRouter>
  );
}
