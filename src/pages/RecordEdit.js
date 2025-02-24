import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { Container, Card, Form, Button, Spinner } from "react-bootstrap";
import { FaUser, FaCalendarAlt, FaFileAlt, FaSave, FaArrowLeft } from "react-icons/fa";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_KEY = process.env.REACT_APP_AZURE_FUNCTION_KEY;

function RecordEdit() {
    const { patient_id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchPatientRecord();
    }, []);

    const fetchPatientRecord = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/func-has-get-patient-info/${patient_id}`, {
                headers: { "x-functions-key": API_KEY },
            });
            debugger;
            const patientData = response.data;
            setName(patientData.patient_name);
            setDate(patientData.date);
            setDescription(patientData.description);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Failed to fetch patient details!",
                text: error.message,
                showConfirmButton: false,
                timer: 3000,
            });
            navigate("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);

        try {
            await axios.put(
                `${API_BASE_URL}/func-has-update-record/${patient_id}`,
                {
                    patient_name: name,
                    date: date,
                    description: description,
                },
                { headers: { "x-functions-key": API_KEY } }
            );

            Swal.fire({
                icon: "success",
                title: "Patient record updated successfully!",
                showConfirmButton: false,
                timer: 2000,
            });

            navigate("/dashboard");
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "An Error Occurred!",
                text: error.message,
                showConfirmButton: false,
                timer: 3000,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Container className="mt-5">
            <Card className="shadow-lg p-4">
                <Card.Header className="bg-warning text-dark text-center">
                    <h4>Edit Patient Record</h4>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border" />
                            <p>Loading patient data...</p>
                        </div>
                    ) : (
                        <Form>
                            {/* Patient Name */}
                            <Form.Group className="mb-3">
                                <Form.Label><FaUser className="me-2 text-warning" /> Patient Name</Form.Label>
                                <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
                            </Form.Group>

                            {/* Date */}
                            <Form.Group className="mb-3">
                                <Form.Label><FaCalendarAlt className="me-2 text-warning" /> Date</Form.Label>
                                <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                            </Form.Group>

                            {/* Description */}
                            <Form.Group className="mb-3">
                                <Form.Label><FaFileAlt className="me-2 text-warning" /> Description</Form.Label>
                                <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                            </Form.Group>

                            <Button variant="warning" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Spinner animation="border" size="sm" className="me-2" /> : <FaSave className="me-2" />} Update
                            </Button>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default RecordEdit;
