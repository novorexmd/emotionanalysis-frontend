import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Container, Card, Button, Spinner, ListGroup, Badge } from "react-bootstrap";
import { FaRegSmile, FaRegFrown, FaRegMeh, FaFileAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_KEY = process.env.REACT_APP_AZURE_FUNCTION_KEY;

function PatientAnalysis() {
    const { patient_id } = useParams();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPatientAnalysis();
    }, []);

    const fetchPatientAnalysis = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/func-has-get-patient-info/${patient_id}`, {
                headers: { "x-functions-key": API_KEY },
            });
            setAnalysis(response.data);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Failed to fetch analysis!",
                text: error.message,
                showConfirmButton: false,
                timer: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">
                <FaFileAlt className="text-primary" /> Patient Analysis
            </h2>

            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : analysis ? (
                <Card className="p-4 shadow-lg">
                    <h4 className="text-info">📊 Patient’s Emotional Shifts</h4>
                    <ListGroup className="mb-4">
                        {analysis.patientEmotionalShifts.map((shift, index) => (
                            <ListGroup.Item key={index}>
                                <strong>{shift.timestamp} sec:</strong> 
                                <Badge bg="secondary" className="ms-2">{shift.emotion}</Badge> 
                                <br />{shift.details}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    <h4 className="text-warning">💬 Key Discussion Topics & Reactions</h4>
                    <ListGroup className="mb-4">
                        {analysis.keyDiscussionReactions.map((topic, index) => (
                            <ListGroup.Item key={index}>
                                <strong>{topic.topic}:</strong> {topic.reaction}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    <h4 className="text-success">✅ Doctor’s Effectiveness</h4>
                    <p>
                        <FaRegMeh className="text-warning" /> <strong>Before:</strong> {analysis.doctorEffectiveness.before}
                    </p>
                    <p>
                        <FaRegSmile className="text-success" /> <strong>After:</strong> {analysis.doctorEffectiveness.after}
                    </p>

                    <h4 className="text-danger">⚠️ Predicted Future Concerns</h4>
                    <ListGroup className="mb-4">
                        {analysis.predictedFutureConcerns.map((concern, index) => (
                            <ListGroup.Item key={index}>
                                <FaExclamationTriangle className="text-danger me-2" /> {concern}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    <h4 className="text-primary">🛤️ Overall Emotional Journey</h4>
                    <p><FaRegFrown className="text-danger" /> <strong>Start:</strong> {analysis.highLevelEmotionalJourney.start}</p>
                    <p><FaRegMeh className="text-warning" /> <strong>Middle:</strong> {analysis.highLevelEmotionalJourney.middle}</p>
                    <p><FaRegSmile className="text-success" /> <strong>End:</strong> {analysis.highLevelEmotionalJourney.end}</p>

                    <div className="text-center mt-3">
                        <Button variant="primary" href={analysis.reportUrl} target="_blank">
                            <FaFileAlt className="me-2" /> View Full Report
                        </Button>
                    </div>
                </Card>
            ) : (
                <p className="text-center text-danger">No analysis found.</p>
            )}
        </Container>
    );
}

export default PatientAnalysis;
