import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth, endpoints } from '../config/api';
import './ProfileSetup.css';

const ProfileSetup = () => {
    const { user, completeProfileSetup } = useAuth();
    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState('');
    const [persons, setPersons] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPersons = async () => {
            if (!selectedRole) return;

            setIsLoading(true);
            setError('');

            try {
                let response;
                if (selectedRole === 'patient') {
                    response = await fetchWithAuth(endpoints.patients());
                } else {
                    response = await fetchWithAuth(endpoints.practitioners());
                }

                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched persons:', data);
                    setPersons(data);
                } else {
                    setError('Could not fetch persons from database');
                }
            } catch (err) {
                console.error('Error fetching persons:', err);
                setError('An error occurred while fetching persons');
            } finally {
                setIsLoading(false);
            }
        };

        if (step === 2) {
            fetchPersons();
        }
    }, [selectedRole, step]);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setSelectedPerson(null);
        setStep(2);
    };

    const handlePersonSelect = (person) => {
        console.log('Selected person:', person);
        setSelectedPerson(person);
    };

    const handleComplete = async () => {
        if (!selectedRole || !selectedPerson) {
            setError('Please select both role and person');
            return;
        }

        setIsLoading(true);
        setError('');

        const foreignId = selectedPerson.socialSecurityNumber;
        console.log('Saving profile with foreignId:', foreignId);

        try {
            const response = await fetchWithAuth(endpoints.setupProfile(), {
                method: 'POST',
                body: JSON.stringify({
                    keycloakId: user.keycloakId || user.id,
                    email: user.email,
                    username: user.username,
                    role: selectedRole.toUpperCase(),
                    foreignId: foreignId,
                    firstName: user.firstName || selectedPerson.firstName,
                    lastName: user.lastName || selectedPerson.lastName,
                }),
            });

            if (response.ok) {
                const savedUser = await response.json();
                console.log('Profile saved:', savedUser);
                completeProfileSetup(selectedRole.toUpperCase(), foreignId);
            } else {
                const errorData = await response.text();
                if (errorData.includes('already registered')) {
                    setError('This person already has an account. Please select another person.');
                } else {
                    setError(errorData || 'Could not save profile');
                }
            }
        } catch (err) {
            console.error('Error saving profile:', err);
            setError('An error occurred while saving profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setStep(1);
        setSelectedPerson(null);
        setPersons([]);
    };

    const filteredPersons = persons.filter(person => {
        const fullName = `${person.firstName || ''} ${person.lastName || ''}`.toLowerCase();
        const ssn = person.socialSecurityNumber || '';
        return fullName.includes(searchTerm.toLowerCase()) ||
            ssn.includes(searchTerm);
    });

    return (
        <div className="profile-setup-container">
            <div className="profile-setup-card">
                <h1>Welcome, {user?.firstName || user?.username}!</h1>
                <p className="subtitle">Complete your profile to continue</p>

                {error && <div className="error-message">{error}</div>}

                {step === 1 && (
                    <div className="step-content">
                        <h2>Step 1: Select your role</h2>
                        <p>What is your role in the system?</p>

                        <div className="role-options">
                            <button
                                className={`role-button ${selectedRole === 'doctor' ? 'selected' : ''}`}
                                onClick={() => handleRoleSelect('doctor')}
                            >
                                <div>
                                    <span className="role-title">Doctor</span>
                                    <span className="role-description">Manage patients and medical records</span>
                                </div>
                            </button>

                            <button
                                className={`role-button ${selectedRole === 'staff' ? 'selected' : ''}`}
                                onClick={() => handleRoleSelect('staff')}
                            >
                                <div>
                                    <span className="role-title">Staff</span>
                                    <span className="role-description">Administrative access</span>
                                </div>
                            </button>

                            <button
                                className={`role-button ${selectedRole === 'patient' ? 'selected' : ''}`}
                                onClick={() => handleRoleSelect('patient')}
                            >
                                <div>
                                    <span className="role-title">Patient</span>
                                    <span className="role-description">View my medical records</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="step-content">
                        <h2>Step 2: Link to your profile</h2>
                        <p>
                            {selectedRole === 'patient'
                                ? 'Select your patient profile from the list'
                                : 'Select your staff profile from the list'}
                        </p>

                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search by name or social security number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {isLoading ? (
                            <div className="loading">Loading...</div>
                        ) : (
                            <div className="persons-list">
                                {filteredPersons.length === 0 ? (
                                    <p className="no-results">No persons found</p>
                                ) : (
                                    filteredPersons.map((person) => (
                                        <div
                                            key={person.socialSecurityNumber}
                                            className={`person-card ${selectedPerson?.socialSecurityNumber === person.socialSecurityNumber ? 'selected' : ''}`}
                                            onClick={() => handlePersonSelect(person)}
                                        >
                                            <div className="person-info">
                                                <span className="person-name">
                                                    {person.firstName} {person.lastName}
                                                </span>
                                                <span className="person-id">
                                                    {person.socialSecurityNumber
                                                        ? `${person.socialSecurityNumber.substring(0, 8)}...`
                                                        : 'No social security number'}
                                                </span>
                                            </div>
                                            {selectedPerson?.socialSecurityNumber === person.socialSecurityNumber && (
                                                <span className="checkmark">✓</span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        <div className="button-group">
                            <button className="back-button" onClick={handleBack}>
                                ← Back
                            </button>
                            <button
                                className="complete-button"
                                onClick={handleComplete}
                                disabled={!selectedPerson || isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Complete Setup'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSetup;