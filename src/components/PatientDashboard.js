import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api';

function PatientDashboard({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [patientInfo, setPatientInfo] = useState(null);
    const [observations, setObservations] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [encounters, setEncounters] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    // OBS: I en riktig app skulle vi koppla User till Patient via databas
    // För nu antar vi att user.id motsvarar patient.id
    const patientId = user.id;

    useEffect(() => {
        fetchPatientData();
    }, [patientId]);

    const fetchPatientData = async () => {
        setLoading(true);
        try {
            // Hämta patientinformation
            const patientRes = await fetch(`${API_URL}/patients/${patientId}`);
            if (patientRes.ok) {
                setPatientInfo(await patientRes.json());
            }

            // Hämta klinisk data
            const [obsRes, condRes, encRes] = await Promise.all([
                fetch(`${API_URL}/v1/clinical/patients/${patientId}/observations`),
                fetch(`${API_URL}/v1/clinical/patients/${patientId}/conditions`),
                fetch(`${API_URL}/v1/clinical/patients/${patientId}/encounters`)
            ]);

            if (obsRes.ok) setObservations(await obsRes.json());
            if (condRes.ok) setConditions(await condRes.json());
            if (encRes.ok) setEncounters(await encRes.json());

            // Hämta meddelanden
            const msgRes = await fetch(`${API_URL}/v1/messages/patient/${patientId}`);
            if (msgRes.ok) setMessages(await msgRes.json());

        } catch (error) {
            console.error('Fel vid hämtning av patientdata:', error);
        } finally {
            setLoading(false);
        }
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
        infoRow: {
            padding: '10px 0',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between'
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={{ margin: 0 }}>Min Journal</h1>
                    <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
                        Inloggad som: {user.username}
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
                    style={styles.navButton(activeTab === 'overview')}
                    onClick={() => setActiveTab('overview')}
                >
                    Översikt
                </button>
                <button
                    style={styles.navButton(activeTab === 'observations')}
                    onClick={() => setActiveTab('observations')}
                >
                    Observationer
                </button>
                <button
                    style={styles.navButton(activeTab === 'conditions')}
                    onClick={() => setActiveTab('conditions')}
                >
                    Diagnoser
                </button>
                <button
                    style={styles.navButton(activeTab === 'encounters')}
                    onClick={() => setActiveTab('encounters')}
                >
                    Besök
                </button>
                <button
                    style={styles.navButton(activeTab === 'messages')}
                    onClick={() => setActiveTab('messages')}
                >
                    Meddelanden
                </button>
            </nav>

            <div style={styles.content}>
                {loading ? (
                    <div style={styles.card}>
                        <p>Laddar...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && patientInfo && (
                            <div>
                                <div style={styles.card}>
                                    <h2>Min Information</h2>
                                    <div style={styles.infoRow}>
                                        <strong>Namn:</strong>
                                        <span>{patientInfo.firstName} {patientInfo.lastName}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <strong>Personnummer:</strong>
                                        <span>{patientInfo.socialSecurityNumber}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <strong>Födelsedatum:</strong>
                                        <span>{patientInfo.dateOfBirth}</span>
                                    </div>
                                </div>

                                <div style={styles.card}>
                                    <h3>Sammanfattning</h3>
                                    <p><strong>Observationer:</strong> {observations.length} st</p>
                                    <p><strong>Diagnoser:</strong> {conditions.length} st</p>
                                    <p><strong>Besök:</strong> {encounters.length} st</p>
                                    <p><strong>Meddelanden:</strong> {messages.length} st</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'observations' && (
                            <div style={styles.card}>
                                <h2>Mina Observationer</h2>
                                {observations.length === 0 ? (
                                    <p>Inga observationer registrerade</p>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Datum</th>
                                            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Typ</th>
                                            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Värde</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {observations.map(obs => (
                                            <tr key={obs.id}>
                                                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                                    {new Date(obs.effectiveDateTime).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{obs.code}</td>
                                                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{obs.valueText}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {activeTab === 'conditions' && (
                            <div style={styles.card}>
                                <h2>Mina Diagnoser</h2>
                                {conditions.length === 0 ? (
                                    <p>Inga diagnoser registrerade</p>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Datum</th>
                                            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Kod</th>
                                            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Beskrivning</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {conditions.map(cond => (
                                            <tr key={cond.id}>
                                                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                                    {new Date(cond.assertedDate).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{cond.code}</td>
                                                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{cond.display}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {activeTab === 'encounters' && (
                            <div style={styles.card}>
                                <h2>Mina Besök</h2>
                                {encounters.length === 0 ? (
                                    <p>Inga besök registrerade</p>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Starttid</th>
                                            <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Sluttid</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {encounters.map(enc => (
                                            <tr key={enc.id}>
                                                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                                    {new Date(enc.startTime).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                                                    {enc.endTime ? new Date(enc.endTime).toLocaleString() : 'Pågående'}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {activeTab === 'messages' && (
                            <div style={styles.card}>
                                <h2>Meddelanden</h2>
                                <p>Här kan du skicka och ta emot meddelanden från vårdpersonal</p>
                                {messages.length === 0 ? (
                                    <p>Inga meddelanden</p>
                                ) : (
                                    <div>
                                        {messages.map(msg => (
                                            <div key={msg.id} style={{
                                                padding: '15px',
                                                marginBottom: '10px',
                                                background: '#f9f9f9',
                                                borderRadius: '8px',
                                                borderLeft: '4px solid #667eea'
                                            }}>
                                                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>
                                                    {new Date(msg.sentAt).toLocaleString()}
                                                </p>
                                                <p style={{ margin: 0 }}>{msg.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default PatientDashboard;