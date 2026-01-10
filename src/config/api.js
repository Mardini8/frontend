import keycloak from './keycloak';

const API_CONFIG = {
    USER_SERVICE: process.env.REACT_APP_USER_SERVICE_URL || 'https://patientsystem-user.app.cloud.cbh.kth.se',

    MESSAGE_SERVICE: process.env.REACT_APP_MESSAGE_SERVICE_URL || 'https://patientsystem-message.app.cloud.cbh.kth.se',

    CLINICAL_SERVICE: process.env.REACT_APP_CLINICAL_SERVICE_URL || 'https://patientsystem-clinical.app.cloud.cbh.kth.se',

    IMAGE_SERVICE: process.env.REACT_APP_IMAGE_SERVICE_URL || 'https://patientsystem-image.app.cloud.cbh.kth.se',

    SEARCH_SERVICE: process.env.REACT_APP_SEARCH_SERVICE_URL || 'https://patientsystem-search.app.cloud.cbh.kth.se',
};

export const getApiUrl = (service) => {
    return API_CONFIG[service] || '';
};

export const fetchWithAuth = async (url, options = {}) => {
    try {
        await keycloak.updateToken(30);
    } catch (error) {
        console.error('Failed to refresh token:', error);
        keycloak.logout();
        throw new Error('Session expired');
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (keycloak.token) {
        headers['Authorization'] = `Bearer ${keycloak.token}`;
    }

    console.log('fetchWithAuth:', url, 'Token present:', !!keycloak.token);

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        console.error('401 Unauthorized - logging out');
        keycloak.logout();
        throw new Error('Unauthorized');
    }

    if (response.status === 403) {
        console.error('403 Forbidden - insufficient permissions');
        throw new Error('Access denied - insufficient permissions');
    }

    return response;
};

export const fetchWithAuthFormData = async (url, options = {}) => {
    try {
        await keycloak.updateToken(30);
    } catch (error) {
        console.error('Failed to refresh token:', error);
        keycloak.logout();
        throw new Error('Session expired');
    }

    const headers = {
        ...options.headers,
    };

    if (keycloak.token) {
        headers['Authorization'] = `Bearer ${keycloak.token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        keycloak.logout();
        throw new Error('Unauthorized');
    }

    return response;
};

export const endpoints = {
    // User Service endpoints
    login: () => `${API_CONFIG.USER_SERVICE}/api/users/login`,
    register: () => `${API_CONFIG.USER_SERVICE}/api/users/register`,
    users: () => `${API_CONFIG.USER_SERVICE}/api/users`,
    userById: (id) => `${API_CONFIG.USER_SERVICE}/api/users/${id}`,
    userByKeycloakId: (keycloakId) => `${API_CONFIG.USER_SERVICE}/api/users/keycloak/${keycloakId}`,
    setupProfile: () => `${API_CONFIG.USER_SERVICE}/api/users/setup-profile`,

    // Message Service endpoints
    messages: () => `${API_CONFIG.MESSAGE_SERVICE}/api/messages`,
    messagesByUser: (userId) => `${API_CONFIG.MESSAGE_SERVICE}/api/messages/user/${userId}`,
    conversation: (user1, user2) => `${API_CONFIG.MESSAGE_SERVICE}/api/messages/conversation/${user1}/${user2}`,

    // Clinical Service endpoints
    patients: () => `${API_CONFIG.CLINICAL_SERVICE}/api/patients`,
    patientById: (id) => `${API_CONFIG.CLINICAL_SERVICE}/api/patients/${id}`,
    patientByPersonnummer: (pnr) => `${API_CONFIG.CLINICAL_SERVICE}/api/patients/personnummer/${pnr}`,
    practitioners: () => `${API_CONFIG.CLINICAL_SERVICE}/api/practitioners`,
    practitionerById: (id) => `${API_CONFIG.CLINICAL_SERVICE}/api/practitioners/${id}`,
    observations: () => `${API_CONFIG.CLINICAL_SERVICE}/api/observations`,
    observationsByPatient: (patientId) => `${API_CONFIG.CLINICAL_SERVICE}/api/observations/patient/${patientId}`,
    conditions: () => `${API_CONFIG.CLINICAL_SERVICE}/api/conditions`,
    conditionsByPatient: (patientId) => `${API_CONFIG.CLINICAL_SERVICE}/api/conditions/patient/${patientId}`,
    encounters: () => `${API_CONFIG.CLINICAL_SERVICE}/api/encounters`,
    encountersByPatient: (patientId) => `${API_CONFIG.CLINICAL_SERVICE}/api/encounters/patient/${patientId}`,

    // Image Service endpoints
    imageUpload: () => `${API_CONFIG.IMAGE_SERVICE}/api/images/upload`,
    imageByFilename: (filename) => `${API_CONFIG.IMAGE_SERVICE}/api/images/${filename}`,
    imagesByPatient: (personnummer) => `${API_CONFIG.IMAGE_SERVICE}/api/images/patient/${personnummer}`,

    // Search Service endpoints
    search: () => `${API_CONFIG.SEARCH_SERVICE}/api/search`,
    searchPatients: (query) => `${API_CONFIG.SEARCH_SERVICE}/api/search/patients?q=${query}`,
};

export default API_CONFIG;