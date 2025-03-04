import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import ProtectedRoute from "./utility/ProtectedRoute";

import "./App.css";
import DashboardLayout from "./components/DashboardLayout";
import TransactionDetails from "./pages/TransactionDetails";
import BudgetDetails from "./pages/BudgetDetails";
import GoalDetails from "./pages/GoalDetails";


function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />

                        <Route path="/transactions" element={<Transactions />} />
                            <Route path="/transactions/:id" element={<TransactionDetails />} />

                        <Route path="/budgets" element={<Budgets />} />
                            <Route path="/budgets/:id" element={<BudgetDetails />} />

                        <Route path="/financial-goals" element={<Goals />} />
                            <Route path="/financial-goals/:id" element={<GoalDetails />} />

                    </Route>
              </Route>
          </Routes>
      </Router>
  );
}

export default App;
