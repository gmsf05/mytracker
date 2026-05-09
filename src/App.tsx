import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./Pages/Welcome";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Analytics from "./Pages/Analytics";
import JumpRopeStats from "./Pages/JumpRopeStats";
import CheerStats from "./Pages/CheerStats";
import Settings from "./Pages/Settings"; // The import is here!
import PrivateRoute from "./components/PrivateRoute";
import GymStats from "./Pages/GymStats";
import ActivityStats from "./Pages/ActivityStats";

// Inside your <Routes> block:
<Route
  path="/gym-stats"
  element={
    <PrivateRoute>
      <GymStats />
    </PrivateRoute>
  }
/>;

import "bootstrap/dist/css/bootstrap.min.css";
import "./global.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Public Pages */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />

        {/* 2. Protected App Pages (Requires Login) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          }
        />
        <Route
          path="/jump-rope-stats"
          element={
            <PrivateRoute>
              <JumpRopeStats />
            </PrivateRoute>
          }
        />
        <Route
          path="/cheer-stats"
          element={
            <PrivateRoute>
              <CheerStats />
            </PrivateRoute>
          }
        />
        <Route
          path="/gym-stats"
          element={
            <PrivateRoute>
              <GymStats />
            </PrivateRoute>
          }
        />
        <Route
          path="/activity/:activityName"
          element={
            <PrivateRoute>
              <ActivityStats />
            </PrivateRoute>
          }
        />

        {/* 3. NEW: The Settings Page */}
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
