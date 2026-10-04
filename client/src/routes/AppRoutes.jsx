import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout.jsx";

import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Clients from "../pages/Clients/Clients.jsx";
import ClientDetails from "../pages/Clients/ClientDetails.jsx";

import Matters from "../pages/Matters/Matters.jsx";
import MatterDetails from "../pages/Matters/MatterDetails.jsx";
import MatterIntake from "../pages/Intake/MatterIntake.jsx";

import Documents from "../pages/Documents/Documents.jsx";
import DocumentDetails from "../pages/Documents/DocumentDetails.jsx";

import Tasks from "../pages/Tasks/Tasks.jsx";
import TaskDetails from "../pages/Tasks/TaskDetails.jsx";

import Team from "../pages/Team/Team.jsx";
import AIWorkspace from "../pages/AI/AIWorkspace.jsx";

import Login from "../pages/Auth/Login.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected application */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<Dashboard />} />

            {/* Clients */}
            <Route path="/clients" element={<Clients />} />

            <Route path="/clients/:clientId" element={<ClientDetails />} />

            {/* Team */}
            <Route path="/team" element={<Team />} />

            {/* Matters */}
            <Route path="/matters" element={<Matters />} />

            <Route path="/matters/intake" element={<MatterIntake />} />

            <Route path="/matters/:matterId" element={<MatterDetails />} />

            {/* Documents */}
            <Route path="/documents" element={<Documents />} />

            <Route
              path="/documents/:documentId"
              element={<DocumentDetails />}
            />

            {/* Tasks */}
            <Route path="/tasks" element={<Tasks />} />

            <Route path="/tasks/:id" element={<TaskDetails />} />

            {/* AI */}
            <Route path="/ai" element={<AIWorkspace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
