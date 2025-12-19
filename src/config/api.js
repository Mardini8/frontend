// API Configuration for CBH Cloud Production
// This file should be used for production deployment

const API_CONFIG = {
    // User Service - authentication and user management
    USER_SERVICE: process.env.REACT_APP_USER_SERVICE_URL || 'https://patientsystem-user.app.cloud.cbh.kth.se',

    // Message Service - messaging between users
    MESSAGE_SERVICE: process.env.REACT_APP_MESSAGE_SERVICE_URL || 'https://patientsystem-message.app.cloud.cbh.kth.se',

    // Clinical Service - FHIR resources (Patient, Practitioner, etc.)
    CLINICAL_SERVICE: process.env.REACT_APP_CLINICAL_SERVICE_URL || 'https://patientsystem-clinical.app.cloud.cbh.kth.se',

    // Image Service - medical image uploads and management
    IMAGE_SERVICE: process.env.REACT_APP_IMAGE_SERVICE_URL || 'https://patientsystem-image.app.cloud.cbh.kth.se',

    // Search Service - search functionality
    SEARCH_SERVICE: process.env.REACT_APP_SEARCH_SERVICE_URL || 'https://patientsystem-search.app.cloud.cbh.kth.se',
};

// Helper function to get base URLs
export const getApiUrl = (service) => {
    return API_CONFIG[service] || '';
};

// Endpoint helpers
export const endpoints = {
    // User Service endpoints
    login: () => `${API_CONFIG.USER_SERVICE}/api/users/login`,
    register: () => `${API_CONFIG.USER_SERVICE}/api/users/register`,
    users: () => `${API_CONFIG.USER_SERVICE}/api/users`,
    userById: (id) => `${API_CONFIG.USER_SERVICE}/api/users/${id}`,

    // Message Service endpoints
    messages: () => `${API_CONFIG.MESSAGE_SERVICE}/api/messages`,
    messagesByUser: (userId) => `${API_CONFIG.MESSAGE_SERVICE}/api/messages/user/${userId}`,
    conversation: (user1, user2) => `${API_CONFIG.MESSAGE_SERVICE}/api/messages/conversation/${user1}/${user2}`,

    // Clinical Service endpoints
    patients: () => `${API_CONFIG.CLINICAL_SERVICE}/api/patients`,
    patientById: (id) => `${API_CONFIG.CLINICAL_SERVICE}/api/patients/${id}`,
    patientByPersonnummer: (pnr) => `${API_CONFIG.CLINICAL_SERVICE}/api/patients/personnummer/${pnr}`,
    practitioners: () => `${API_CONFIG.CLINICAL_SERVICE}/api/practitioners`,
    observations: () => `${API_CONFIG.CLINICAL_SERVICE}/api/observations`,
    conditions: () => `${API_CONFIG.CLINICAL_SERVICE}/api/conditions`,
    encounters: () => `${API_CONFIG.CLINICAL_SERVICE}/api/encounters`,

    // Image Service endpoints
    imageUpload: () => `${API_CONFIG.IMAGE_SERVICE}/api/images/upload`,
    imageByFilename: (filename) => `${API_CONFIG.IMAGE_SERVICE}/api/images/${filename}`,
    imagesByPatient: (personnummer) => `${API_CONFIG.IMAGE_SERVICE}/api/images/patient/${personnummer}`,

    // Search Service endpoints
    search: () => `${API_CONFIG.SEARCH_SERVICE}/api/search`,
    searchPatients: (query) => `${API_CONFIG.SEARCH_SERVICE}/api/search/patients?q=${query}`,
};

export default API_CONFIG;