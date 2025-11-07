import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api';

function DoctorDashboard({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('patients');
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Hämta alla patienter
    useEffect(() => {
        if (activeTab === 'patients') {
            fetchPatients();
        } else if (activeTab === 'messages') {
            fetchMessages();
        }
    }, [activeTab]);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/patients`);
            if (response.ok) {
                const data = await response.json();
                setPatients(data);
            }
        } catch (error) {
            console.error('Fel vid hämtning av patienter:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        // Implementera meddelandehämtning
        setMessages([]);
    };

    const viewPatientDetails = async (patient) => {
        setSelectedPatient(patient);
        setActiveTab('patient-details');
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: '#f5f5f5',
        },
        header: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        nav: {
            background: 'white',
            padding: '0 40px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            gap: '20px'
        },
        navButton: (active) => ({
            padding: '15px 20px',
            background: 'none',
            border: 'none',
            borderBottom: active ? '3px solid #667eea' : '3px solid transparent',
            color: active ? '#667eea' : '#666',
            cursor: 'pointer',
            fontWeight: active ? '600' : '400',
            fontSize: '16px'
        }),
        content: {
            padding: '40px',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        card: {
            background: 'white',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        th: {
            textAlign: 'left',
            padding: '12px',
            borderBottom: '2px solid #ddd',
            fontWeight: '600',
            color: '#333'
        },
        td: {
            padding: '12px',
            borderBottom: '1px solid #eee'
        },
        button: {
            padding: '8px 16px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={{ margin: 0 }}>PatientSystem</h1>
                    <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
                        Inloggad som: {user.username} (Läkare)
                    </p>
                </div>
                <button
                    onClick={onLogout}
                    style={{
                        padding: '10px 20px',
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        border: '1px solid white',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Logga ut
                </button>
            </header>

            <nav style={styles.nav}>
                <button
                    style={styles.navButton(activeTab === 'patients')}
                    onClick={() => setActiveTab('patients')}
                >
                    Patienter
                </button>
                <button
                    style={styles.navButton(activeTab === 'messages')}
                    onClick={() => setActiveTab('messages')}
                >
                    Meddelanden
                </button>
            </nav>

            <div style={styles.content}>
                {activeTab === 'patients' && (
                    <div style={styles.card}>
                        <h2>Patientlista</h2>
                        {loading ? (
                            <p>Laddar patienter...</p>
                        ) : (
                            <table style={styles.table}>
                                <thead>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Förnamn</th>
                                    <th style={styles.th}>Efternamn</th>
                                    <th style={styles.th}>Personnummer</th>
                                    <th style={styles.th}>Åtgärder</th>
                                </tr>
                                </thead>
                                <tbody>
                                {patients.map(patient => (
                                    <tr key={patient.id}>
                                        <td style={styles.td}>{patient.id}</td>
                                        <td style={styles.td}>{patient.firstName}</td>
                                        <td style={styles.td}>{patient.lastName}</td>
                                        <td style={styles.td}>{patient.socialSecurityNumber}</td>
                                        <td style={styles.td}>
                                            <button
                                                style={styles.button}
                                                onClick={() => viewPatientDetails(patient)}
                                            >
                                                Visa detaljer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'patient-details' && selectedPatient && (
                    <PatientDetails patient={selectedPatient} onBack={() => setActiveTab('patients')} />
                )}

                {activeTab === 'messages' && (
                    <div style={styles.card}>
                        <h2>Meddelanden</h2>
                        <p>Här visas meddelanden från patienter</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function PatientDetails({ patient, onBack }) {
    const [observations, setObservations] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [encounters, setEncounters] = useState([]);
    const [showAddObservation, setShowAddObservation] = useState(false);
    const [showAddCondition, setShowAddCondition] = useState(false);

    useEffect(() => {
        fetchPatientData();
    }, [patient.id]);

    const fetchPatientData = async () => {
        try {
            const [obsRes, condRes, encRes] = await Promise.all([
                fetch(`http://localhost:8080/api/v1/clinical/patients/${patient.id}/observations`),
                fetch(`http://localhost:8080/api/v1/clinical/patients/${patient.id}/conditions`),
                fetch(`http://localhost:8080/api/v1/clinical/patients/${patient.id}/encounters`)
            ]);

            if (obsRes.ok) setObservations(await obsRes.json());
            if (condRes.ok) setConditions(await condRes.json());
            if (encRes.ok) setEncounters(await encRes.json());
        } catch (error) {
            console.error('Fel vid hämtning av patientdata:', error);
        }
    };

    const styles = {
        card: {
            background: 'white',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        },
        button: {
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
        }
    };

    return (
        <div>
            <button style={styles.button} onClick={onBack}>← Tillbaka</button>

            <div style={styles.card}>
                <h2>Patientinformation</h2>
                <p><strong>Namn:</strong> {patient.firstName} {patient.lastName}</p>
                <p><strong>Personnummer:</strong> {patient.socialSecurityNumber}</p>
                <p><strong>Födelsedatum:</strong> {patient.dateOfBirth}</p>
            </div>

            <div style={styles.card}>
                <h3>Observationer</h3>
                <button style={styles.button} onClick={() => setShowAddObservation(true)}>
                    + Lägg till observation
                </button>
                {observations.length === 0 ? (
                    <p>Inga observationer registrerade</p>
                ) : (
                    <ul>
                        {observations.map(obs => (
                            <li key={obs.id}>{obs.code}: {obs.valueText}</li>
                        ))}
                    </ul>
                )}
            </div>

            <div style={styles.card}>
                <h3>Diagnoser</h3>
                <button style={styles.button} onClick={() => setShowAddCondition(true)}>
                    + Lägg till diagnos
                </button>
                {conditions.length === 0 ? (
                    <p>Inga diagnoser registrerade</p>
                ) : (
                    <ul>
                        {conditions.map(cond => (
                            <li key={cond.id}>{cond.code}: {cond.display}</li>
                        ))}
                    </ul>
                )}
            </div>

            <div style={styles.card}>
                <h3>Besök</h3>
                {encounters.length === 0 ? (
                    <p>Inga besök registrerade</p>
                ) : (
                    <ul>
                        {encounters.map(enc => (
                            <li key={enc.id}>Besök: {new Date(enc.startTime).toLocaleString()}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default DoctorDashboard;