import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

export const API_BASE_URL = 'http://192.168.100.109:8000/api';

const SESSION_KEY = 'session';

let accessToken = null;
let refreshToken = null;
let currentUser = null;
let sessionLoaded = false;

export async function loadSession() {
  if (sessionLoaded) return;
  try {
    const stored = await AsyncStorage.getItem(SESSION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      accessToken = parsed.accessToken ?? null;
      refreshToken = parsed.refreshToken ?? null;
      currentUser = parsed.currentUser ?? null;
    }
  } catch (e) {
    console.log('Session load error:', e);
  } finally {
    sessionLoaded = true;
  }
}

export async function setSession(tokens, user) {
  accessToken = tokens?.access ?? null;
  refreshToken = tokens?.refresh ?? null;
  currentUser = user ?? null;

  try {
    await AsyncStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ accessToken, refreshToken, currentUser })
    );
  } catch (e) {
    console.log('Session save error:', e);
  }
}

export function getCurrentUser() {
  return currentUser;
}

export function getAccessToken() {
  return accessToken;
}

export function isLoggedIn() {
  return !!accessToken;
}

export async function clearSession() {
  accessToken = null;
  refreshToken = null;
  currentUser = null;
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.log('Session clear error:', e);
  }
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  if (auth && !accessToken) {
    throw new Error('You are not logged in. Please log in first.');
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    console.log('NETWORK ERROR:', networkError.message, 'URL:', `${API_BASE_URL}${path}`);
    throw new Error('Could not connect to the server. Please check your internet connection.');
  }

  const rawText = await response.text();
  let data = null;
  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.log('Non-JSON response from', path, ':', rawText);
    }
  }

  if (!response.ok) {
    const firstError = data && (data.detail || Object.values(data)[0]);
    const message = Array.isArray(firstError) ? firstError[0] : firstError;
    throw new Error(message || `Server error (status ${response.status})`);
  }

  return data;
}

async function uploadFile(path, fileUri, fieldName, extraFields = {}) {
  let result;
  try {
    result = await FileSystem.uploadAsync(`${API_BASE_URL}${path}`, fileUri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName,
      mimeType: 'image/jpeg',
      parameters: extraFields,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
  } catch (networkError) {
    console.log('NETWORK ERROR:', networkError.message, 'URL:', `${API_BASE_URL}${path}`);
    throw new Error('Could not connect to the server. Please check your internet connection.');
  }

  let data = null;
  try {
    data = JSON.parse(result.body);
  } catch (e) {
    console.log('Non-JSON upload response:', result.body);
  }

  if (result.status < 200 || result.status >= 300) {
    const firstError = data && (data.detail || Object.values(data)[0]);
    const message = Array.isArray(firstError) ? firstError[0] : firstError;
    throw new Error(message || `Server error (status ${result.status})`);
  }

  return data;
}

// Accounts 
export function signupPatient({ full_name, email, age, password, password2 }) {
  return request('/accounts/signup/', {
    method: 'POST',
    body: { full_name, email, age: age ? Number(age) : null, password, password2 },
  });
}

export function doctorSignup(payload) {
  return request('/accounts/doctor-signup/', { method: 'POST', body: payload });
}

export function loginUser({ email, password, role }) {
  return request('/accounts/login/', { method: 'POST', body: { email, password, role } });
}

export function getProfile() {
  return request('/accounts/profile/', { auth: true });
}

export function updateProfileInfo(fields) {
  return request('/accounts/profile/update/', { method: 'PATCH', auth: true, body: fields });
}

export function uploadVerificationDocument(fileUri) {
  return uploadFile('/accounts/verification-document/', fileUri, 'document');
}

export function forgotPassword({ email, role }) {
  return request('/accounts/forgot-password/', { method: 'POST', body: { email, role } });
}

export function resetPassword({ email, role, code, new_password, new_password2 }) {
  return request('/accounts/reset-password/', {
    method: 'POST',
    body: { email, role, code, new_password, new_password2 },
  });
}

//  Cases 
export function uploadCaseImage(imageUri) {
  return uploadFile('/cases/upload/', imageUri, 'image');
}

export function getMyCases() {
  return request('/cases/mine/', { auth: true });
}

export function getCaseDetail(id) {
  return request(`/cases/${id}/`, { auth: true });
}

export function analyzeCase(id) {
  return request(`/cases/${id}/analyze/`, { method: 'POST', auth: true });
}

export function getPendingCases() {
  return request('/cases/pending/', { auth: true });
}

export function getApprovedCases() {
  return request('/cases/approved/', { auth: true });
}

export function getAllCases() {
  return request('/cases/all/', { auth: true });
}

export function verifyCase(id, { action, doctor_note, medicine }) {
  return request(`/cases/${id}/verify/`, {
    method: 'POST',
    auth: true,
    body: { action, doctor_note, medicine },
  });
}

export function deleteCase(id) {
  return request(`/cases/${id}/delete/`, { method: 'DELETE', auth: true });
}

// Payment
export function submitPayment(caseId, { transaction_id, method, screenshotUri }) {
  return uploadFile(`/payments/${caseId}/submit/`, screenshotUri, 'screenshot', {
    transaction_id,
    method,
  });
}