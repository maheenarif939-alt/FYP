import { BASE_URL } from './config';

// (BASE_URL se /api hata rahe hain)
export const MEDIA_URL = BASE_URL.replace(/\/api\/?$/, '');

async function getJson(path) {
  const res = await fetch(BASE_URL + path);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Request failed.');
  return data;
}

async function postJson(path, body) {
  const res = await fetch(BASE_URL + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Request failed.');
  return data;
}

// Auth
export const adminLogin = (email, password) =>
  postJson('/admin-login/', { email, password });

// Dashboard data
export const fetchStats = () => getJson('/admin/stats/');
export const fetchModeration = () => getJson('/admin/moderation/');
export const fetchPayments = () => getJson('/admin/payments/');
export const fetchDoctors = () => getJson('/admin/doctors/');
export const fetchPatients = () => getJson('/admin/patients/');
export const fetchAllCases = () => getJson('/all-cases/');
export const fetchAiAnalysis = () => getJson('/admin/ai-analysis/');

// Actions
export const approvePayment = (payment_id, case_id) =>
  postJson('/admin/payments/approve/', { payment_id, case_id });

export const moderationAction = (case_id, action) =>
  postJson('/admin/moderation/action/', { case_id, action });

export const toggleDoctor = (email) =>
  postJson('/admin/doctors/toggle/', { email });

export const deleteDoctor = (email) =>
  postJson('/admin/doctors/delete/', { email });

export const addDoctor = (doctor) =>
  postJson('/admin/doctors/add/', doctor);