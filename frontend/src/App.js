import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { AppProvider } from "./context/AppContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Insights from "./pages/Insights";
import Budget from "./pages/Budget";
import Goals from "./pages/Goals";
import Investment from "./pages/Investments";
import Reports from "./pages/Reports";
import Search from "./pages/Search";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Security from "./pages/Security";

function App() {
  return (
    <AppProvider>   {/* ✅ ADD HERE */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />

          <Route path="/accounts" element={<Layout><Accounts /></Layout>} />

          <Route
            path="/transactions"
            element={<Layout><Transactions /></Layout>}
          />

          <Route
            path="/insights"
            element={<Layout><Insights /></Layout>}
          />

          <Route
            path="/budget"
            element={<Layout><Budget /></Layout>}
          />

          <Route
            path="/goals"
            element={<Layout><Goals /></Layout>}
          />

          <Route
            path="/Investments"
            element={<Layout><Investment /></Layout>}
          />

          <Route
            path="/reports"
            element={<Layout><Reports /></Layout>}
          />

          <Route
            path="/search"
            element={<Layout><Search /></Layout>}
          />

          <Route
            path="/alerts"
            element={<Layout><Alerts /></Layout>}
          />

          <Route
            path="/settings"
            element={<Layout><Settings /></Layout>}
          />

          <Route
            path="/security"
            element={<Layout><Security /></Layout>}
          />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={2000}
          theme="colored"
        />
      </BrowserRouter>
    </AppProvider>  
  );
}


export default App;