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
    const [error, setError] = useState('');

    const patientId = user.foreignId;

    useEffect(() => {
        if (patientId) {
            fetchPatientData();
        } else {
            setError('Ingen patient kopplad till detta konto.');
        }
    }, [patientId]);

    const fetchPatientData = async () => {
        setLoading(true);
        setError('');

        try {
            const patientRes = await fetch(`${API_URL}/patients/${patientId}`);
            if (patientRes.ok) {
                const patientData = await patientRes.json();
                setPatientInfo(patientData);
            } else {
                setError('Kunde inte hämta patientinformation');
            }

            const [obsRes, condRes, encRes] = await Promise.all([
                fetch(`${API_URL}/v1/clinical/patients/${patientId}/observations`),
                fetch(`${API_URL}/v1/clinical/patients/${patientId}/conditions`),
                fetch(`${API_URL}/v1/clinical/patients/${patientId}/encounters`)
            ]);

            if (obsRes.ok) setObservations(await obsRes.json());
            if (condRes.ok) setConditions(await condRes.json());
            if (encRes.ok) setEncounters(await encRes.json());

            const msgRes = await fetch(`${API_URL}/v1/messages/patient/${patientId}`);
            if (msgRes.ok) setMessages(await msgRes.json());

        } catch (error) {
            console.error('Fel vid hämtning:', error);
            setError('Kunde inte ansluta till servern');
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
            fontSize: '16px',
            transition: 'all 0.3s'
        }),
        content: {
            padding: '40px',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        card: {
            background: 'white',
            borderRadius: '8px',
            padding: '30px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        },
        infoRow: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '15px 0',
            borderBottom: '1px solid #eee',
        },
        label: {
            fontWeight: '600',
            color: '#555',
            fontSize: '16px'
        },
        value: {
            color: '#333',
            fontSize: '16px'
        },
        summaryGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '20px'
        },
        summaryCard: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
        },
        summaryNumber: {
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '5px'
        },
        summaryLabel: {
            fontSize: '14px',
            opacity: 0.9
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
                {error && (
                    <div style={{
                        padding: '20px',
                        background: '#fee',
                        color: '#c33',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={styles.card}>
                        <p style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>
                            Laddar din information...
                        </p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <div>
                                {patientInfo ? (
                                    <>
                                        <div style={styles.card}>
                                            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>
                                                Min Information
                                            </h2>
                                            <div style={styles.infoRow}>
                                                <span style={styles.label}>Namn:</span>
                                                <span style={styles.value}>
                                                    {patientInfo.firstName} {patientInfo.lastName}
                                                </span>
                                            </div>
                                            <div style={styles.infoRow}>
                                                <span style={styles.label}>Personnummer:</span>
                                                <span style={styles.value}>
                                                    {patientInfo.socialSecurityNumber}
                                                </span>
                                            </div>
                                            <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
                                                <span style={styles.label}>Födelsedatum:</span>
                                                <span style={styles.value}>
                                                    {patientInfo.dateOfBirth}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={styles.card}>
                                            <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#333' }}>
                                                Sammanfattning
                                            </h3>
                                            <div style={styles.summaryGrid}>
                                                <div style={styles.summaryCard}>
                                                    <div style={styles.summaryNumber}>{observations.length}</div>
                                                    <div style={styles.summaryLabel}>Observationer</div>
                                                </div>
                                                <div style={styles.summaryCard}>
                                                    <div style={styles.summaryNumber}>{conditions.length}</div>
                                                    <div style={styles.summaryLabel}>Diagnoser</div>
                                                </div>
                                                <div style={styles.summaryCard}>
                                                    <div style={styles.summaryNumber}>{encounters.length}</div>
                                                    <div style={styles.summaryLabel}>Besök</div>
                                                </div>
                                                <div style={styles.summaryCard}>
                                                    <div style={styles.summaryNumber}>{messages.length}</div>
                                                    <div style={styles.summaryLabel}>Meddelanden</div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div style={styles.card}>
                                        <p>Ingen patientinformation hittades</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'observations' && (
                            <div style={styles.card}>
                                <h2 style={{ marginTop: 0 }}>Mina Observationer</h2>
                                {observations.length === 0 ? (
                                    <p style={{ color: '#666' }}>Inga observationer registrerade</p>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                                        <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd', fontWeight: '600' }}>
                                                Datum
                                            </th>
                                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd', fontWeight: '600' }}>
                                                Typ
                                            </th>
                                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd', fontWeight: '600' }}>
                                                Värde
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {observations.map(obs => (
                                            <tr key={obs.id}>
                                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                                    {new Date(obs.effectiveDateTime).toLocaleDateString('sv-SE')}
                                                </td>
                                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                                    {obs.code}
                                                </td>
                                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                                    {obs.valueText}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {activeTab === 'conditions' && (
                            <div style={styles.card}>
                                <h2 style={{ marginTop: 0 }}>Mina Diagnoser</h2>
                                {conditions.length === 0 ? (
                                    <p style={{ color: '#666' }}>Inga diagnoser registrerade</p>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                                        <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd', fontWeight: '600' }}>
                                                Datum
                                            </th>
                                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd', fontWeight: '600' }}>
                                                Kod
                                            </th>
                                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd', fontWeight: '600' }}>
                                                Beskrivning
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {conditions.map(cond => (
                                            <tr key={cond.id}>
                                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                                    {new Date(cond.assertedDate).toLocaleDateString('sv-SE')}
                                                </td>
                                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                                    {cond.code}
                                                </td>
                                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                                    {cond.display}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {activeTab === 'encounters' && (
                            <div style={styles.card}>
                                <h2 style={{ marginTop: 0 }}>Mina Besök</h2>
                                {encounters.length === 0 ? (
                                    <p style={{ color: '#666' }}>Inga besök registrerade</p>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                                        <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd', fontWeight: '600' }}>
                                                Starttid
                                            </th>
                                            <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd', fontWeight: '600' }}>
                                                Sluttid
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {encounters.map(enc => (
                                            <tr key={enc.id}>
                                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                                    {new Date(enc.startTime).toLocaleString('sv-SE')}
                                                </td>
                                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                                                    {enc.endTime ? new Date(enc.endTime).toLocaleString('sv-SE') : 'Pågående'}
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
                                <h2 style={{ marginTop: 0 }}>Meddelanden</h2>
                                <p style={{ color: '#666', marginBottom: '20px' }}>
                                    Här kan du se meddelanden från vårdpersonal
                                </p>
                                {messages.length === 0 ? (
                                    <div style={{
                                        padding: '40px',
                                        textAlign: 'center',
                                        background: '#f9f9f9',
                                        borderRadius: '8px',
                                        color: '#999'
                                    }}>
                                        <p style={{ fontSize: '18px', margin: '0 0 10px 0' }}>Inga meddelanden än</p>
                                        <p style={{ fontSize: '14px', margin: 0 }}>När vårdpersonal skickar meddelanden till dig visas de här</p>
                                    </div>
                                ) : (
                                    <div>
                                        {messages.map(msg => (
                                            <div key={msg.id} style={{
                                                padding: '20px',
                                                marginBottom: '15px',
                                                background: '#f9f9f9',
                                                borderRadius: '8px',
                                                borderLeft: '4px solid #667eea'
                                            }}>
                                                <p style={{
                                                    margin: '0 0 10px 0',
                                                    fontSize: '12px',
                                                    color: '#999'
                                                }}>
                                                    {new Date(msg.sentAt).toLocaleString('sv-SE')}
                                                </p>
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '16px',
                                                    color: '#333',
                                                    lineHeight: '1.6'
                                                }}>
                                                    {msg.content}
                                                </p>
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