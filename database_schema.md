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

## 3. `password_resets` — OTP-based password reset

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | auto |
| `email` | string | |
| `role` | string | `"patient"` \| `"doctor"` |
| `code` | string | 6-digit OTP |
| `expires_at` | datetime | 10 min se expire |
| `created_at` | datetime | |

---

## 4. Admin — Database collection NAHI hai (abhi tak confirm nahi)

`settings.py` mein `ADMIN_EMAIL` aur `ADMIN_PASSWORD` environment variables hain — is se lagta hai admin login `.env` ke fixed credentials se compare hota hai, database query se nahi.

**Confirm karna baqi hai:** `admin_views.py` (ya jahan bhi `admin-login/` URL handle hoti hai) ka code dekh kar pata chalega — agar wahan `db.something.find_one(...)` use ho raha hai, to koi collection hai; agar sirf `if email == settings.ADMIN_EMAIL` jaisa check hai, to koi collection nahi hai.

---

## 5. GridFS — Images (automatic, `fs.files` / `fs.chunks`)

3 jagah use hoti hai:
- `cases.image_file_id` — scan image
- `cases.payment.screenshot_file_id` — payment proof
- `users.verification_doc_file_id` — doctor ka verification document

---

## 6. `diseases` (optional — agar future mein AI results ko describe karne ke liye reference chahiye)

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
