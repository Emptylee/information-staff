import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import { AccessGuard } from "@/components/AccessGuard";

export default function App() {
  return (
    <Router>
      <AccessGuard>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </AccessGuard>
    </Router>
  );
}