import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import PractitionerDashboard from './components/PractitionerDashboard';
import PatientDashboard from './components/PatientDashboard';

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [showRegister, setShowRegister] = useState(false);

    const handleLogout = () => {
        setCurrentUser(null);
    };

    // Om användaren är inloggad, visa rätt dashboard
    if (currentUser) {
        // DOCTOR och STAFF använder samma PractitionerDashboard
        if (currentUser.role === 'DOCTOR' || currentUser.role === 'STAFF') {
            return <PractitionerDashboard user={currentUser} onLogout={handleLogout} />;
        } else if (currentUser.role === 'PATIENT') {
            return <PatientDashboard user={currentUser} onLogout={handleLogout} />;
        }
    }

    // Annars visa login/register
    return (
        <div className="App" style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            {showRegister ? (
                <Register
                    onRegisterSuccess={() => setShowRegister(false)}
                    onBackToLogin={() => setShowRegister(false)}
                />
            ) : (
                <Login
                    onLoginSuccess={setCurrentUser}
                    onShowRegister={() => setShowRegister(true)}
                />
            )}
        </div>
    );
}

export default App;