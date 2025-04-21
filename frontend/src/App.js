import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HelpRequestForm from "./components/HelpRequestForm";
import HelpRequestsPage from "./pages/HelpRequestsPage";
import Home from "./pages/Home";
import Login from "./pages/Login";
import './App.css';
import ViewHelp from "./pages/ViewHelp";
import CreateHelpPost from "./pages/CreateHelpPost";
import ViewMyHelp from "./pages/ViewMyHelp";
import Signup from "./pages/Signup";
import VerifyAccount from "./pages/VerifyUser";
import MyHelpOffers from "./pages/MyHelpOffers";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/viewhelp" element={<ViewHelp />} />
          <Route path="/reactassignment" element={<HelpRequestsPage />} />
          <Route path="/askhelp" element={<CreateHelpPost />} />
          <Route path="/viewmyhelprequests" element={<ViewMyHelp />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<VerifyAccount />} />
          <Route path="/my-offers" element={<MyHelpOffers />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;
