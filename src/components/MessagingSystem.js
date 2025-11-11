import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api';

function MessagingSystem({ currentUser, patientId }) {
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [showNewMessageForm, setShowNewMessageForm] = useState(false);
    const [recipients, setRecipients] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [patientNames, setPatientNames] = useState({});
    const [practitionerNames, setPractitionerNames] = useState({});
    const [userNames, setUserNames] = useState({});

    useEffect(() => {
        fetchMessages();
        if (currentUser.role === 'PATIENT') {
            fetchRecipients();
        } else {
            fetchAllPatientNames();
        }
        fetchAllPractitionerNames();
        fetchUserNames();
    }, [currentUser, patientId]);

    const fetchAllPatientNames = async () => {
        try {
            const response = await fetch(`${API_URL}/patients`);
            if (response.ok) {
                const patients = await response.json();
                const names = {};
                patients.forEach(p => {
                    names[p.id] = `${p.firstName} ${p.lastName}`;
                });
                setPatientNames(names);
            }
        } catch (error) {
            console.error('Fel vid hämtning av patientnamn:', error);
        }
    };

    const fetchAllPractitionerNames = async () => {
        try {
            const response = await fetch(`${API_URL}/practitioners`);
            if (response.ok) {
                const practitioners = await response.json();
                const names = {};
                practitioners.forEach(p => {
                    names[p.id] = `${p.firstName} ${p.lastName}`;
                });
                setPractitionerNames(names);
            }
        } catch (error) {
            console.error('Fel vid hämtning av practitioner-namn:', error);
        }
    };

    const fetchUserNames = async () => {
        // Hämta namn för alla users baserat på deras foreignId och role
        const names = {};

        // För PATIENT users, använd patientNames
        // För DOCTOR/STAFF users, använd practitionerNames
        // Detta görs automatiskt när vi vet userId och role

        setUserNames(names);
    };

    const getUserDisplayName = (userId) => {
        // Hitta user info och returnera rätt namn
        // Detta är en förenkling - i praktiken skulle vi behöva en lookup
        return `Användare ${userId}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Europeiskt format: DD/MM/YYYY HH:MM
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const getConversationName = (conv) => {
        if (currentUser.role === 'PATIENT') {
            // Patient ser practitioner-namn
            // conv.otherUserId är practitioner's user ID, vi måste hitta practitioner ID
            // Enklare: använd namnet direkt från meddelandet om vi kan
            return practitionerNames[conv.otherUserId] || `Vårdpersonal`;
        } else {
            // Läkare/Personal ser patientnamn
            return patientNames[conv.patientId] || `Patient ${conv.patientId}`;
        }
    };

    const fetchMessages = async () => {
        setLoading(true);
        try {
            let url;
            if (currentUser.role === 'PATIENT') {
                url = `${API_URL}/v1/messages/patient/${patientId}`;
            } else {
                const [toMeRes, fromMeRes] = await Promise.all([
                    fetch(`${API_URL}/v1/messages/to-user/${currentUser.id}`),
                    fetch(`${API_URL}/v1/messages/from-user/${currentUser.id}`)
                ]);

                const toMe = toMeRes.ok ? await toMeRes.json() : [];
                const fromMe = fromMeRes.ok ? await fromMeRes.json() : [];

                const allMessages = [...toMe, ...fromMe].sort(
                    (a, b) => new Date(b.sentAt) - new Date(a.sentAt)
                );
                setMessages(allMessages);
                groupIntoConversations(allMessages);
                setLoading(false);
                return;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
                groupIntoConversations(data);
            }
        } catch (error) {
            console.error('Fel vid hämtning av meddelanden:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupIntoConversations = (msgs) => {
        const convMap = new Map();

        msgs.forEach(msg => {
            const otherUserId = msg.fromUserId === currentUser.id ? msg.toUserId : msg.fromUserId;
            const key = `${msg.patientId}-${otherUserId}`;

            if (!convMap.has(key)) {
                convMap.set(key, {
                    patientId: msg.patientId,
                    otherUserId: otherUserId,
                    messages: [],
                    lastMessage: null
                });
            }

            const conv = convMap.get(key);
            conv.messages.push(msg);
            if (!conv.lastMessage || new Date(msg.sentAt) > new Date(conv.lastMessage.sentAt)) {
                conv.lastMessage = msg;
            }
        });

        const convArray = Array.from(convMap.values()).sort(
            (a, b) => new Date(b.lastMessage.sentAt) - new Date(a.lastMessage.sentAt)
        );

        setConversations(convArray);
    };

    const fetchRecipients = async () => {
        try {
            const response = await fetch(`${API_URL}/practitioners`);
            if (response.ok) {
                const data = await response.json();
                console.log('Mottagare hämtade:', data);
                setRecipients(data);
            } else {
                console.error('Kunde inte hämta mottagare, status:', response.status);
            }
        } catch (error) {
            console.error('Fel vid hämtning av mottagare:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) {
            alert('Meddelandet får inte vara tomt');
            return;
        }

        let toUserId;
        let messagePatientId;

        if (currentUser.role === 'PATIENT') {
            // Om patient svarar i befintlig konversation
            if (selectedConversation) {
                toUserId = selectedConversation.otherUserId;
                messagePatientId = patientId;
            }
            // Om patient skriver nytt meddelande
            else if (selectedRecipient) {
                console.log('Söker användare med practitioner ID:', selectedRecipient);

                const userResponse = await fetch(`${API_URL}/v1/auth/user-by-foreign/${selectedRecipient}`);
                console.log('User lookup response status:', userResponse.status);

                if (!userResponse.ok) {
                    const errorText = await userResponse.text();
                    console.error('Fel vid hämtning av användar-ID:', errorText);
                    alert('Kunde inte hitta användar-ID för mottagaren. Se console för detaljer.');
                    return;
                }
                const recipientUser = await userResponse.json();
                console.log('Hittad user:', recipientUser);
                toUserId = recipientUser.id;
                messagePatientId = patientId;
            }
            // Varken konversation eller mottagare vald
            else {
                alert('Välj en mottagare');
                return;
            }
        } else {
            // Läkare/Personal måste ha vald konversation
            if (!selectedConversation) {
                alert('Välj en konversation att svara i');
                return;
            }
            toUserId = selectedConversation.otherUserId;
            messagePatientId = selectedConversation.patientId;
        }

        try {
            const response = await fetch(`${API_URL}/v1/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fromUserId: currentUser.id,
                    toUserId: toUserId,
                    patientId: messagePatientId,
                    content: newMessage,
                    sentAt: new Date().toISOString()
                })
            });

            if (response.ok) {
                setNewMessage('');
                setShowNewMessageForm(false);
                setSelectedRecipient(null);
                fetchMessages();
            } else {
                alert('Kunde inte skicka meddelandet');
            }
        } catch (error) {
            console.error('Fel vid skickande av meddelande:', error);
            alert('Kunde inte skicka meddelandet');
        }
    };

    const styles = {
        container: {
            display: 'flex',
            height: '600px',
            gap: '20px'
        },
        sidebar: {
            width: '300px',
            background: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflowY: 'auto'
        },
        mainPanel: {
            flex: 1,
            background: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column'
        },
        conversationItem: (isSelected) => ({
            padding: '15px',
            marginBottom: '10px',
            background: isSelected ? '#f0f0ff' : '#f9f9f9',
            borderRadius: '8px',
            cursor: 'pointer',
            borderLeft: isSelected ? '4px solid #667eea' : '4px solid transparent'
        }),
        messageList: {
            flex: 1,
            overflowY: 'auto',
            marginBottom: '20px',
            padding: '10px'
        },
        message: (isMine) => ({
            marginBottom: '15px',
            padding: '12px',
            background: isMine ? '#e3f2fd' : '#f5f5f5',
            borderRadius: '8px',
            maxWidth: '70%',
            marginLeft: isMine ? 'auto' : '0',
            marginRight: isMine ? '0' : 'auto'
        }),
        textarea: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box',
            minHeight: '100px',
            fontFamily: 'inherit',
            resize: 'vertical'
        },
        button: {
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px',
            fontSize: '14px'
        },
        select: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box',
            marginBottom: '15px'
        }
    };

    if (loading) {
        return <div>Laddar meddelanden...</div>;
    }

    return (
        <div>
            {currentUser.role === 'PATIENT' && (
                <div style={{ marginBottom: '20px' }}>
                    <button
                        style={styles.button}
                        onClick={() => {
                            console.log('Knapp klickad, showNewMessageForm:', !showNewMessageForm);
                            console.log('Mottagare:', recipients);
                            setShowNewMessageForm(!showNewMessageForm);
                        }}
                    >
                        {showNewMessageForm ? 'Avbryt' : '+ Nytt meddelande'}
                    </button>
                    {recipients.length === 0 && (
                        <p style={{ color: '#999', fontSize: '14px', marginTop: '10px' }}>
                            Laddar mottagare...
                        </p>
                    )}
                </div>
            )}

            {showNewMessageForm && currentUser.role === 'PATIENT' && (
                <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3>Nytt meddelande</h3>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Till:
                    </label>
                    <select
                        style={styles.select}
                        value={selectedRecipient || ''}
                        onChange={(e) => {
                            console.log('Vald mottagare:', e.target.value);
                            setSelectedRecipient(e.target.value);
                        }}
                    >
                        <option value="">Välj mottagare...</option>
                        {recipients.length === 0 ? (
                            <option value="" disabled>Inga mottagare tillgängliga</option>
                        ) : (
                            recipients.map(recipient => (
                                <option key={recipient.id} value={recipient.id}>
                                    {recipient.firstName} {recipient.lastName} ({recipient.title})
                                </option>
                            ))
                        )}
                    </select>
                    {recipients.length === 0 && (
                        <p style={{ color: '#e74c3c', fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>
                            Kunde inte ladda mottagare. Kontrollera att backend körs.
                        </p>
                    )}
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Meddelande:
                    </label>
                    <textarea
                        style={styles.textarea}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Skriv ditt meddelande här..."
                    />
                    <button style={styles.button} onClick={sendMessage}>
                        Skicka
                    </button>
                </div>
            )}

            <div style={styles.container}>
                <div style={styles.sidebar}>
                    <h3>Konversationer</h3>
                    {conversations.length === 0 ? (
                        <p style={{ color: '#666', fontSize: '14px' }}>Inga konversationer</p>
                    ) : (
                        conversations.map((conv, index) => (
                            <div
                                key={index}
                                style={styles.conversationItem(selectedConversation === conv)}
                                onClick={() => setSelectedConversation(conv)}
                            >
                                <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                                    {getConversationName(conv)}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    {conv.lastMessage.content.substring(0, 50)}
                                    {conv.lastMessage.content.length > 50 ? '...' : ''}
                                </div>
                                <div style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
                                    {formatDate(conv.lastMessage.sentAt)}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={styles.mainPanel}>
                    {selectedConversation ? (
                        <>
                            <h3 style={{ marginBottom: '20px' }}>
                                {currentUser.role === 'PATIENT'
                                    ? `Konversation med ${getConversationName(selectedConversation)}`
                                    : `Konversation med ${getConversationName(selectedConversation)}`
                                }
                            </h3>
                            <div style={styles.messageList}>
                                {selectedConversation.messages
                                    .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
                                    .map(msg => (
                                        <div
                                            key={msg.id}
                                            style={styles.message(msg.fromUserId === currentUser.id)}
                                        >
                                            <div style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>
                                                {msg.fromUserId === currentUser.id ? 'Du' :
                                                    (currentUser.role === 'PATIENT' ? 'Vårdpersonal' : 'Patient')
                                                } - {formatDate(msg.sentAt)}
                                            </div>
                                            <div>{msg.content}</div>
                                        </div>
                                    ))}
                            </div>
                            <div>
                                <textarea
                                    style={styles.textarea}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Skriv ditt svar här..."
                                />
                                <button style={styles.button} onClick={sendMessage}>
                                    Skicka svar
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: '#666'
                        }}>
                            Välj en konversation för att visa meddelanden
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MessagingSystem;