
users

_id: ObjectId
full_name: string
email: string
password: string (hashed)
role: "patient" | "doctor"
email_verified: bool
age: int | null
specialty: string
phone: string
hospital: string
experience_years: int
is_doctor_approved: bool
is_active: bool
verification_doc_file_id: string
created_at: datetime



cases

_id: ObjectId
patient_id: ObjectId
case_number: string | int
image_file_id: string
status: uploaded | payment_pending | doctor_pending | approved | rejected
image_status: Pending Review
disease_detected: string | null
confidence: float | null
suggested_medicine: string | null
doctor_note: string | null
payment: object
created_at: datetime



payment

transaction_id: string
method: string
amount: int
status: Pending Verification
screenshot_file_id: string
submitted_at: datetime



email_verifications

_id: ObjectId
email: string
role: "patient" | "doctor"
code: string
expires_at: datetime
created_at: datetime



password_resets

_id: ObjectId
email: string
role: "patient" | "doctor"
code: string
expires_at: datetime
created_at: datetime



admins

_id: ObjectId
full_name: string
email: string
password: string
is_active: bool
created_at: datetime



GridFS

fs.files
fs.chunks

cases.image_file_id
cases.payment.screenshot_file_id
users.verification_doc_file_id



diseases

name: string
description: string
symptoms: array[string]
active: bool



Indexes

users.email
cases.patient_id
cases.status
password_resets.email
password_resets.role
password_resets.expires_at

