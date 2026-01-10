import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProfileSetup from './components/ProfileSetup';
import PractitionerDashboard from './components/PractitionerDashboard';
import PatientDashboard from './components/PatientDashboard';

const LoadingScreen = () => (
    <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
    }}>
        <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '16px', fontSize: '18px' }}>Laddar...</p>
        <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
    </div>
);

const AppContent = () => {
    const { isLoading, isAuthenticated, needsProfileSetup, user, logout, hasRole } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <LoadingScreen />;
    }

    if (needsProfileSetup) {
        return <ProfileSetup />;
    }

    const dashboardUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        foreignId: user.foreignId,
    };

    if (hasRole('DOCTOR') || hasRole('STAFF')) {
        return <PractitionerDashboard user={dashboardUser} onLogout={logout} />;
    } else if (hasRole('PATIENT')) {
        return <PatientDashboard user={dashboardUser} onLogout={logout} />;
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            padding: '20px'
        }}>
            <h1>Något gick fel</h1>
            <p>Din roll kunde inte identifieras: {user?.role || 'okänd'}</p>
            <button
                onClick={logout}
                style={{
                    marginTop: '20px',
                    padding: '12px 24px',
                    background: 'white',
                    color: '#667eea',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer'
                }}
            >
                Logga ut
            </button>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;