import React, { useState, useEffect } from 'react';

function App() {
    // Ändra tillstånd för att lagra en lista av patientobjekt
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 1. Hämta datan från den nya slutpunkten
        fetch('http://localhost:8080/api/patients')
            .then(response => {
                if (!response.ok) {
                    // Kasta ett fel om statusen inte är 200-299
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json(); // Vi förväntar oss en JSON-lista
            })
            .then(data => {
                // 2. Uppdatera tillståndet med den hämtade listan
                setPatients(data);
                setError(null);
            })
            .catch(e => {
                console.error("Fel vid hämtning av patientdata:", e);
                setError("Kunde inte ansluta till backend eller hämta data.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    return (
        <div className="App" style={{ padding: '20px' }}>
            <h1>PatientSystem – Patientlista</h1>

            {isLoading && <p>Laddar patientdata...</p>}

            {error && <p style={{ color: 'red' }}>FEL: {error}</p>}

            {!isLoading && !error && (
                <>
                    <h2>Hämtade Patienter ({patients.length} st)</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr style={{ borderBottom: '2px solid #ccc' }}>
                            <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Förnamn</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Efternamn</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Personnummer</th>
                        </tr>
                        </thead>
                        <tbody>
                        {patients.map(patient => (
                            <tr key={patient.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px' }}>{patient.id}</td>
                                <td style={{ padding: '8px' }}>{patient.firstName}</td>
                                <td style={{ padding: '8px' }}>{patient.lastName}</td>
                                <td style={{ padding: '8px' }}>{patient.socialSecurityNumber}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}

export default App;