import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './Pages/Welcome';
import Signup from './Pages/Signup';
import DeveloperDashboard from './Pages/DeveloperDashboard';
import TesterDashboard from './Pages/TesterDashboard';
import ReviewsPage from './Pages/ReviewsPage';
import ChatPage from './Pages/ChatPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Signup />} />
        <Route path="/dashboard" element={<DeveloperDashboard />} />
        <Route path="/tester-dashboard" element={<TesterDashboard />} />
        <Route path="/reviews/:appId" element={<ReviewsPage />} />
        <Route path="/chat/:userId" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
