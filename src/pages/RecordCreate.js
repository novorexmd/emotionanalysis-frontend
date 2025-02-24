import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { Container, Card, Form, Button, Spinner } from "react-bootstrap";
import { FaVideo, FaUser, FaCalendarAlt, FaFileAlt, FaUpload, FaSave, FaArrowLeft } from "react-icons/fa";
import { BlobServiceClient } from "@azure/storage-blob";

function RecordCreate() {
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const API_KEY = process.env.REACT_APP_AZURE_FUNCTION_KEY;
    const SAS_TOKEN = process.env.REACT_APP_SAS_TOKEN;

    useEffect(() => {
        if (localStorage.getItem("token") == null) {
            navigate("/");
        }
    }, [navigate]);

    const handleSave = async () => {
        setIsSaving(true);

        try {
            let videoUrl = "";

            // Step 1: Upload Video to Azure Storage
            if (videoFile) {
                const containerName = "consultation-videos";
                const accountName = "hasvideostorage";

                const blobServiceClient = new BlobServiceClient(
                    `https://${accountName}.blob.core.windows.net/?${SAS_TOKEN}`
                );
                const containerClient = blobServiceClient.getContainerClient(containerName);
                const blockBlobClient = containerClient.getBlockBlobClient(videoFile.name);

                await blockBlobClient.uploadBrowserData(videoFile, {
                    blobHTTPHeaders: { blobContentType: videoFile.type }
                });

                videoUrl = blockBlobClient.url;
            }

            // Step 2: Save Patient Data to API
            const insertResponse = await axios.post(
                `${API_BASE_URL}/func-has-insert-record`,
                {
                    patientName: name,
                    date: date,
                    description: description,
                    recordingURL: videoUrl,
                },
                { headers: { "x-functions-key": API_KEY } }
            );

            if (insertResponse.status === 201) {
                const { id } = insertResponse.data.record;

                // Step 3: Call Video Analysis API
                const analysisResponse = await axios.post(
                    `${API_BASE_URL}/func-has-video-processor`,
                    { patientId: id, url: videoUrl },
                    { headers: { "x-functions-key": API_KEY } }
                );

                if (analysisResponse.status === 200) {
                    Swal.fire({
                        icon: "success",
                        title: "Patient record saved & analysis started successfully!",
                        showConfirmButton: false,
                        timer: 2000,
                    });

                    setName("");
                    setDate("");
                    setDescription("");
                    setVideoFile(null);
                } else {
                    throw new Error("Failed to start video analysis.");
                }
            } else {
                throw new Error("Failed to save patient record.");
            }
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
                <Card.Header className="bg-primary text-white text-center">
                    <h4>
                        <FaVideo className="me-2" /> Upload New Recording
                    </h4>
                </Card.Header>
                <Card.Body>
                    <Form>
                        {/* Patient Name */}
                        <Form.Group className="mb-3">
                            <Form.Label>
                                <FaUser className="me-2 text-primary" /> Patient Name
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter patient name"
                            />
                        </Form.Group>

                        {/* Date */}
                        <Form.Group className="mb-3">
                            <Form.Label>
                                <FaCalendarAlt className="me-2 text-primary" /> Date
                            </Form.Label>
                            <Form.Control
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </Form.Group>

                        {/* Description */}
                        <Form.Group className="mb-3">
                            <Form.Label>
                                <FaFileAlt className="me-2 text-primary" /> Description
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter consultation details"
                            />
                        </Form.Group>

                        {/* Video Upload */}
                        <Form.Group className="mb-3">
                            <Form.Label>
                                <FaUpload className="me-2 text-primary" /> Upload Video
                            </Form.Label>
                            <Form.Control
                                type="file"
                                accept="video/*"
                                onChange={(e) => setVideoFile(e.target.files[0])}
                            />
                        </Form.Group>

                        {/* Buttons */}
                        <div className="d-flex justify-content-between">
                            <Button variant="secondary" as={Link} to="/dashboard">
                                <FaArrowLeft className="me-2" /> View All Recordings
                            </Button>

                            <Button
                                variant="primary"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="me-2" /> Save
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default RecordCreate;
