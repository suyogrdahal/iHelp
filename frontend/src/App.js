import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HelpRequestForm from "./components/HelpRequestForm";
import HelpRequestsPage from "./pages/HelpRequestsPage";
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/reactassignment" element={<HelpRequestsPage />} />
          <Route path="/create" element={<HelpRequestForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
