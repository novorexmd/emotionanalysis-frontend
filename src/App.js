import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import RecordingList from "./pages/RecordingList"
import RecordCreate from "./pages/RecordCreate"
import ProjectEdit from "./pages/RecordEdit"
import ProjectShow from "./pages/ProjectShow"
import Login from "./pages/Login"
import Registration from "./pages/Registration"
import PatientAnalysis from "./pages/PatientAnalysis"

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/signup" element={<Registration />} />
        <Route exact path="/dashboard" element={<RecordingList />} />
        <Route path="/create" element={<RecordCreate />} />
        <Route path="/edit/:patient_id" element={<ProjectEdit />} />
        <Route path="/show/:id" element={<ProjectShow />} />
        <Route path="/analysis/:patient_id" element={<PatientAnalysis />} />
      </Routes>
    </Router>
  );
}

export default App;