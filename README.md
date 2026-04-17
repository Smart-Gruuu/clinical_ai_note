# Clinical Encounter AI Assistant – MVP

AI co-pilot for the consultation room: generate SOAP notes from conversation, surface clinical insights and suggestions, and create patient-friendly summaries.

## Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Backend:** Node.js, Express, ES modules

## Quick start

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

API runs at **http://localhost:4000**.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:3000**.

### 3. Use the app

1. Open **http://localhost:3000** and click **Start consultation** (or go to `/consultation`).
2. Optionally pick a patient (P001 has visit history for insight demos).
3. Paste or type a conversation transcript (or leave the sample).
4. Click **Generate note & insights**.
5. Review the draft SOAP note (editable), **Insights & suggestions**, and **Patient summary** tabs.

## API (MVP)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notes/process` | Body: `{ transcript, patientId?, doctorName?, patientContext? }`. Returns SOAP note, insights, suggestions, patient summary. |
| GET | `/api/patients` | List mock patients. |
| GET | `/api/patients/:id` | Get one patient. |
| GET | `/api/patients/:id/history` | Get mock visit history (for inconsistency/trend insights). |

## MVP behavior

- **Note generation:** Rule-based extraction from transcript (symptoms, vitals, assessment, plan). Production would use STT + NLP/LLM.
- **Insights:** Mock logic (e.g. smoking status change, BP trend) using mock visit history.
- **Suggestions:** Deferential, rule-based (e.g. migraine diary, ANA recheck for fatigue).
- **Patient summary:** Bullet list derived from SOAP note.

## Privacy & compliance (product vision)

- No raw audio storage; encrypted processing; PHI in compliant infrastructure; audit trail. MVP does not handle real PHI/audio.

## License

MIT.
