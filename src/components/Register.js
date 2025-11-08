import React, { useState } from 'react';

const API_URL = 'http://localhost:8080/api';
const AUTH_URL = 'http://localhost:8080/api/v1/auth';

function Register({ onRegisterSuccess, onBackToLogin }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('PATIENT');

    // Personuppgifter
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [socialSecurityNumber, setSocialSecurityNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');

    // För Practitioner
    const [title, setTitle] = useState('Staff'); // 'Doctor' eller 'Staff'

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let foreignId = null;

            // Steg 1: Skapa Patient eller Practitioner först
            if (role === 'PATIENT') {
                // Skapa Patient
                const patientResponse = await fetch(`${API_URL}/patients`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        firstName,
                        lastName,
                        socialSecurityNumber,
                        dateOfBirth
                    })
                });

                if (!patientResponse.ok) {
                    throw new Error('Kunde inte skapa patient');
                }

                const patient = await patientResponse.json();
                foreignId = patient.id;

            } else if (role === 'DOCTOR' || role === 'STAFF') {
                // Skapa Practitioner
                const practitionerResponse = await fetch(`${API_URL}/practitioners`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        firstName,
                        lastName,
                        socialSecurityNumber,
                        dateOfBirth,
                        title: role === 'DOCTOR' ? 'Doctor' : 'Staff'
                    })
                });

                if (!practitionerResponse.ok) {
                    throw new Error('Kunde inte skapa practitioner');
                }

                const practitioner = await practitionerResponse.json();
                foreignId = practitioner.id;
            }

            // Steg 2: Skapa User med foreignId
            const userResponse = await fetch(`${AUTH_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    role,
                    foreignId
                })
            });

            if (userResponse.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onRegisterSuccess();
                }, 2000);
            } else {
                const errorData = await userResponse.text();
                setError(errorData || 'Registrering misslyckades');
            }
        } catch (err) {
            setError(err.message || 'Kunde inte ansluta till servern');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                width: '100%',
                maxWidth: '500px',
                textAlign: 'center'
            }}>
                <h2 style={{ color: '#4caf50' }}>✓ Registrering lyckades!</h2>
                <p>Ditt konto har skapats. Du omdirigeras till inloggningssidan...</p>
            </div>
        );
    }

    return (
        <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
                Skapa konto
            </h2>

            <form onSubmit={handleSubmit}>
                {/* Roll */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Användartyp *
                    </label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                    >
                        <option value="PATIENT">Patient</option>
                        <option value="DOCTOR">Läkare</option>
                        <option value="STAFF">Övrig personal</option>
                    </select>
                </div>

                <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />

                <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Personuppgifter</h3>

                {/* Förnamn */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Förnamn *
                    </label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Efternamn */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Efternamn *
                    </label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Personnummer */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Personnummer (ÅÅÅÅMMDD-XXXX) *
                    </label>
                    <input
                        type="text"
                        value={socialSecurityNumber}
                        onChange={(e) => setSocialSecurityNumber(e.target.value)}
                        placeholder="19900101-1234"
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Födelsedatum */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Födelsedatum *
                    </label>
                    <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />

                <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Kontoinformation</h3>

                {/* Användarnamn */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Användarnamn *
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* E-post */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        E-post *
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Lösenord */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Lösenord *
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '16px',
                            boxSizing: 'border-box'
                        }}
                    />
                    <small style={{ color: '#666', fontSize: '12px' }}>
                        Minst 6 tecken
                    </small>
                </div>

                {error && (
                    <div style={{
                        padding: '10px',
                        marginBottom: '20px',
                        background: '#fee',
                        color: '#c33',
                        borderRadius: '6px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: loading ? '#ccc' : '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'background 0.3s'
                    }}
                >
                    {loading ? 'Registrerar...' : 'Registrera'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                    onClick={onBackToLogin}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#667eea',
                        cursor: 'pointer',
                        fontSize: '14px',
                        textDecoration: 'underline'
                    }}
                >
                    Tillbaka till inloggning
                </button>
            </div>
        </div>
    );
}

export default Register;