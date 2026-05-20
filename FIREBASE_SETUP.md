# Firebase setup

1. Create a Firebase web app and enable Email/Password authentication.
2. Copy `.env.example` to `.env.local` and fill in the `VITE_FIREBASE_*` values from your Firebase project config.
3. When a user signs in for the first time, the app creates a Firestore profile document at `users/{uid}` automatically.

Auto-created profile:

```json
{
  "uid": "firebase-auth-uid",
  "name": "Academy user",
  "email": "user@example.com",
  "role": "student",
  "createdAt": "server timestamp"
}
```

Default first-login role is `student` so new accounts do not receive elevated access.

Admins can later edit user profiles in the app's Users screen or directly in Firestore:

Example admin profile:

```json
{
  "uid": "firebase-auth-uid",
  "email": "admin@example.com",
  "name": "Aarav Singh",
  "role": "admin",
  "createdAt": "server timestamp"
}
```

Example coach profile:

```json
{
  "uid": "firebase-auth-uid",
  "email": "coach@example.com",
  "name": "Maya Rao",
  "role": "coach",
  "createdAt": "server timestamp"
}
```

Example student profile:

```json
{
  "uid": "firebase-auth-uid",
  "email": "student@example.com",
  "name": "Isha Mehta",
  "role": "student",
  "studentId": "ST-104",
  "createdAt": "server timestamp"
}
```

The app reads roles from Firestore after Firebase Authentication succeeds, then redirects:

- `admin` -> `/admin/dashboard`
- `coach` -> `/coach/attendance`
- `student` -> `/student/overview`

Admins can manage student records in the `students` collection. Each student document uses the
student ID as the document ID and stores:

```json
{
  "id": "ST-107",
  "name": "Student Name",
  "parentName": "Parent Name",
  "parentPhoneNumber": "9876543210",
  "studentPhoneNumber": "9876543211",
  "batchId": "junior-a",
  "feeAmount": 2800,
  "joinDate": "2026-05-18",
  "feeStatus": "pending",
  "attendanceStatus": "present",
  "attendanceRate": 0,
  "createdAt": "server timestamp",
  "updatedAt": "server timestamp"
}
```

Admins and coaches can mark attendance in the `attendance` collection. Each document represents
one student on one date, using `{studentId}_{date}` as the document ID:

```json
{
  "studentId": "ST-107",
  "date": "2026-05-18",
  "status": "present",
  "markedAt": "server timestamp",
  "updatedAt": "server timestamp"
}
```

Admins and coaches can manage monthly fee records in the `fees` collection. Each document
represents one student for one month, using `{studentId}_{month}` as the document ID:

```json
{
  "studentId": "ST-107",
  "studentName": "Student Name",
  "month": "2026-05",
  "amount": 2800,
  "amountPaid": 2800,
  "dueAmount": 0,
  "status": "paid",
  "paymentDate": "2026-05-18",
  "notes": "UPI received",
  "updatedBy": "Admin Name",
  "timestamp": "server timestamp"
}
```

`firestore.rules` contains a starter role-based ruleset matching the UI access model.
Student accounts can use `studentId` to link the user profile to one document in the `students`
collection; if it is omitted, the student portal falls back to the Firebase Auth UID as the
student document ID.

For the first production admin, create or update `users/{uid}` manually in Firebase Console with
`role: "admin"` after that user signs in once. After that, use the app's Users screen to manage
roles.
