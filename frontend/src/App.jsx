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
import UserProfile from "./pages/Profile";
import { Forecast } from "./pages/Forecast";
import SignUp from "./pages/SignUp";


function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<UserProfile />} />

                        <Route path="/transactions" element={<Transactions />} />
                            <Route path="/transactions/:id" element={<TransactionDetails />} />

                        <Route path="/budgets" element={<Budgets />} />
                            <Route path="/budgets/:id" element={<BudgetDetails />} />

                        <Route path="/financial-goals" element={<Goals />} />
                            <Route path="/financial-goals/:id" element={<GoalDetails />} />

                        <Route path="/forecast" element={<Forecast />} />


                    </Route>
              </Route>
          </Routes>
      </Router>
  );
}

export default App;
