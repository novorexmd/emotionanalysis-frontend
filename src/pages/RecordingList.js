import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { Table, Button, Container, Spinner, Badge } from "react-bootstrap";
import { FaEye, FaEdit, FaPlus } from "react-icons/fa";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_KEY = process.env.REACT_APP_AZURE_FUNCTION_KEY;

function RecordingList() {
    const navigate = useNavigate();
    const [patientList, setPatientList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
        fetchPatientList();
    }, [navigate]);

    const fetchPatientList = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/func-has-get-patients-list`, {
                headers: { "x-functions-key": API_KEY },
            });
            setPatientList(response.data);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Failed to fetch patient data!",
                text: error.message,
                showConfirmButton: false,
                timer: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    // ✅ Function to get status label
    const getStatusLabel = (status) => {
        switch (status) {
            case 1:
                return <Badge bg="warning" text="dark">In Progress</Badge>;
            case 2:
                return <Badge bg="success">Done</Badge>;
            case 3:
                return <Badge bg="danger">Error</Badge>;
            default:
                return <Badge bg="secondary">Unknown</Badge>;
        }
    };

    return (
        <Container className="mt-5">
            {/* ✅ Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Patient Recordings</h2>
                {/* 🔹 "Create New" Button */}
                <Button as={Link} to="/create" variant="primary">
                    <FaPlus className="me-2" /> Create New Record
                </Button>
            </div>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" />
                    <p>Loading patient records...</p>
                </div>
            ) : (
                <Table striped bordered hover className="shadow-sm">
                    <thead className="bg-primary text-white">
                        <tr>
                            <th>Patient Name</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Recording Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {patientList.length > 0 ? (
                            patientList.map((patient, key) => (
                                <tr key={key}>
                                    <td>{patient.patient_name}</td>
                                    <td>{patient.date}</td>
                                    <td>{patient.description}</td>
                                    <td>{getStatusLabel(patient.recording_status)}</td>
                                    <td className="d-flex gap-2">
                                        {/* Details Button */}
                                        {patient.recording_status === 2 && (
                                            <Button
                                                variant="info"
                                                as={Link}
                                                to={`/analysis/${patient.patient_id}`}
                                                size="sm"
                                            >
                                                <FaEye className="me-1" /> Details
                                            </Button>
                                        )}

                                        {/* Edit Button */}
                                        {/* <Button
                                            variant="warning"
                                            as={Link}
                                            to={`/edit/${patient.id}`}
                                            size="sm"
                                        >
                                            <FaEdit className="me-1" /> Edit
                                        </Button> */}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    No patient records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
        </Container>
    );
}

export default RecordingList;
