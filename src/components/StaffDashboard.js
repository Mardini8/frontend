import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api';

function StaffDashboard({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('patients');
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showCreatePatient, setShowCreatePatient] = useState(false);
    const [loading, setLoading] = useState(false);

    // Formulärdata för ny patient
    const [newPatient, setNewPatient] = useState({
        firstName: '',
        lastName: '',
        socialSecurityNumber: '',
        dateOfBirth: ''
    });

    useEffect(() => {
        if (activeTab === 'patients') {
            fetchPatients();
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

    const handleCreatePatient = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/patients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPatient)
            });

            if (response.ok) {
                alert('Patient skapad!');
                setShowCreatePatient(false);
                setNewPatient({
                    firstName: '',
                    lastName: '',
                    socialSecurityNumber: '',
                    dateOfBirth: ''
                });
                fetchPatients();
            } else {
                alert('Fel vid skapande av patient');
            }
        } catch (error) {
            console.error('Fel vid skapande av patient:', error);
            alert('Kunde inte skapa patient');
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
        button: {
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '20px'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        th: {
            textAlign: 'left',
            padding: '12px',
            borderBottom: '2px solid #ddd',
            fontWeight: '600'
        },
        td: {
            padding: '12px',
            borderBottom: '1px solid #eee'
        },
        input: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box',
            marginBottom: '15px'
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div>
                    <h1 style={{ margin: 0 }}>PatientSystem - Personal</h1>
                    <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
                        Inloggad som: {user.username} (Personal)
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
                    <div>
                        {showCreatePatient ? (
                            <div style={styles.card}>
                                <h2>Skapa ny patient</h2>
                                <form onSubmit={handleCreatePatient}>
                                    <label>
                                        Förnamn:
                                        <input
                                            type="text"
                                            style={styles.input}
                                            value={newPatient.firstName}
                                            onChange={(e) => setNewPatient({...newPatient, firstName: e.target.value})}
                                            required
                                        />
                                    </label>

                                    <label>
                                        Efternamn:
                                        <input
                                            type="text"
                                            style={styles.input}
                                            value={newPatient.lastName}
                                            onChange={(e) => setNewPatient({...newPatient, lastName: e.target.value})}
                                            required
                                        />
                                    </label>

                                    <label>
                                        Personnummer (ÅÅÅÅMMDDXXXX):
                                        <input
                                            type="text"
                                            style={styles.input}
                                            value={newPatient.socialSecurityNumber}
                                            onChange={(e) => setNewPatient({...newPatient, socialSecurityNumber: e.target.value})}
                                            required
                                        />
                                    </label>

                                    <label>
                                        Födelsedatum:
                                        <input
                                            type="date"
                                            style={styles.input}
                                            value={newPatient.dateOfBirth}
                                            onChange={(e) => setNewPatient({...newPatient, dateOfBirth: e.target.value})}
                                            required
                                        />
                                    </label>

                                    <button type="submit" style={styles.button}>
                                        Skapa patient
                                    </button>
                                    <button
                                        type="button"
                                        style={{...styles.button, background: '#999', marginLeft: '10px'}}
                                        onClick={() => setShowCreatePatient(false)}
                                    >
                                        Avbryt
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div style={styles.card}>
                                <button style={styles.button} onClick={() => setShowCreatePatient(true)}>
                                    + Skapa ny patient
                                </button>

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
                                            <th style={styles.th}>Födelsedatum</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {patients.map(patient => (
                                            <tr key={patient.id}>
                                                <td style={styles.td}>{patient.id}</td>
                                                <td style={styles.td}>{patient.firstName}</td>
                                                <td style={styles.td}>{patient.lastName}</td>
                                                <td style={styles.td}>{patient.socialSecurityNumber}</td>
                                                <td style={styles.td}>{patient.dateOfBirth}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
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

export default StaffDashboard;