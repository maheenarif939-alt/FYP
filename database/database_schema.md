# DermaCareMe — Real Database Schema (matches actual backend code)

Ye schema aapke asli `views.py` se nikala gaya hai — koi assumption nahi, sirf wo cheezein jo code mein real hain.

---

## 1. `users` — Patient AUR Doctor dono isi collection mein (role field se pehchane jate hain)

| Field | Type | Kis role mein hota hai |
|---|---|---|
| `_id` | ObjectId | dono |
| `full_name` | string | dono |
| `email` | string | dono — **unique** |
| `password` | string (hashed) | dono |
| `role` | string | `"patient"` \| `"doctor"` |
| `email_verified` | bool | patient: shuru mein `false`, doctor: `true` (signup pe hi) |
| `age` | int / null | patient |
| `specialty` | string | doctor (default: "Dermatologist") |
| `phone` | string | doctor |
| `hospital` | string | doctor |
| `experience_years` | int | doctor |
| `is_doctor_approved` | bool | doctor |
| `is_active` | bool | doctor |
| `verification_doc_file_id` | string (GridFS ref) | doctor |
| `created_at` | datetime | dono |

**Note:** Field ka naam `password` hai, `password_hash` nahi.

---

## 2. `cases` — Payment bhi ISI ke andar embedded hai

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | auto |
| `patient_id` | ObjectId | ref → `users._id` |
| `case_number` | string/int | `next_case_number()` se generate hota hai |
| `image_file_id` | string (GridFS ref) | scan image |
| `status` | string | `uploaded` → `payment_pending` → `doctor_pending` → `approved` / `rejected` |
| `image_status` | string | `Pending Review` → (admin update karta hai) |
| `disease_detected` | string / null | AI se |
| `confidence` | float / null | AI se |
| `suggested_medicine` | string / null | |
| `doctor_note` | string / null | doctor verify karte waqt |
| `payment` | **embedded object** | `{transaction_id, method, amount, status, screenshot_file_id, submitted_at}` |
| `created_at` | datetime | |

**`payment` object ke andar:**
```
transaction_id: string
method: string ("jazzcash" etc.)
amount: int (CONSULTATION_FEE)
status: "Pending Verification" | (admin approve/reject karega)
screenshot_file_id: string (GridFS ref)
submitted_at: datetime
```

---

## 3. `email_verifications` — Signup ke baad email verify karne ke liye OTP

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | auto |
| `email` | string | |
| `role` | string | `"patient"` \| `"doctor"` |
| `code` | string | 6-digit OTP |
| `expires_at` | datetime | 10 min se expire (TTL index se auto-delete) |
| `created_at` | datetime | |

**Flow:** Patient signup karte waqt `email_verified: false` ke sath account banta hai, saath hi ek OTP is collection mein save hoke email pe bhej diya jata hai. `verify_email` endpoint code check karke `users.email_verified` ko `true` kar deta hai. Doctor signup pe seedha `email_verified: true` set hota hai (verify karne ki zaroorat nahi).

---

## 4. `password_resets` — OTP-based password reset

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | auto |
| `email` | string | |
| `role` | string | `"patient"` \| `"doctor"` |
| `code` | string | 6-digit OTP |
| `expires_at` | datetime | 10 min se expire |
| `created_at` | datetime | |

---

## 5. `admins` — Ab database-based hai (pehle sirf `.env` compare hota tha)

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | auto |
| `full_name` | string | |
| `email` | string | **unique** |
| `password` | string | **bcrypt** se hashed (users wale `password` field se alag hashing scheme, kyunki wo Django ka PBKDF2 use karte hain) |
| `is_active` | bool | |
| `created_at` | datetime | |

`add_admin.py` script se real admin add/update karein — password kabhi plain text mein save nahi hota.

**Zaroori:** Backend ka `admin_views.py` update karna hoga (neeche diya gaya code) taake ye `.env` ke fixed credentials ki jagah is collection ko check kare.

---

## 6. GridFS — Images (automatic, `fs.files` / `fs.chunks`)

3 jagah use hoti hai:
- `cases.image_file_id` — scan image
- `cases.payment.screenshot_file_id` — payment proof
- `users.verification_doc_file_id` — doctor ka verification document

---

## 7. `diseases` (optional — agar future mein AI results ko describe karne ke liye reference chahiye)

| Field | Type |
|---|---|
| `name` | string |
| `description` | string |
| `symptoms` | array[string] |
| `active` | bool |

Ye aapke asli code mein abhi kahin use nahi ho rahi — optional hai.

---

## Zaroori Indexes

- `users.email` → unique
- `cases.patient_id` → fast lookup
- `cases.status` → admin/doctor queue ke liye
- `password_resets.email` + `role` → fast lookup, aur `expires_at` pe TTL index (auto-delete expired codes)
