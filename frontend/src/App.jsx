import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import FinancialGoals from "./pages/FinancialGoals";
import ProtectedRoute from "./utility/ProtectedRoute";

import "./App.css";
import DashboardLayout from "./components/DashboardLayout";


function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/budgets" element={<Budgets />} />
                        <Route path="/financial-goals" element={<FinancialGoals />} />
                    </Route>
              </Route>
          </Routes>
      </Router>
  );
}

export default App;
