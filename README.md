# AI-Powered Executive Assistant (Local, n8n)

## 1. Overview

This repository documents the design, architecture, data model, and working implementation of a **local AI-powered Executive Assistant** built using **n8n (Community Edition)** on Windows.

UI polish is explicitly out of scope.

---

## ⚡ Quick Start & Installation Guide

Follow these steps to set up the system locally.

### 1. Prerequisites
- **n8n**: Install [n8n](https://docs.n8n.io/hosting/installation/) locally (via `npm install n8n -g` or Docker).
- **PostgreSQL**: Install PostgreSQL (Local or Docker container) and ensure it's running.
- **API Keys**:
  - **Mistral AI**: Get an API key from [console.mistral.ai](https://console.mistral.ai/).
  - **Google Cloud Console**: Enable Gmail API & Google Calendar API.
    - Create OAuth credentials (Client ID & Secret).
    - Add `https://oauth.n8n.io/v2/` (for cloud) or your local redirect URL to Authorized Redirect URIs.

### 2. Database Setup
1. Create a new PostgreSQL database named `AI_Executive_Assistant_Database`.
2. Open the SQL initialization script: `docs/AI-Assistant-Database.sql`.
3. Run the script in your database (tool like pgAdmin, DBeaver, or psql) to create the necessary tables:
   - `emails_raw`
   - `emails_ai`
   - `tasks`
   - `calendar_events`
   - `daily_digest`

### 3. n8n Workflow Setup
1. Start n8n:
   ```cmd
   n8n start
   ```
2. Open [http://localhost:5678](http://localhost:5678).
3. **Import Workflows**:
   - Go to **Workflows** > **Import**.
   - Select `workflow/Email and calender summarizer workflow.json` & `workflow/Webhook-workflow v2.json`.
4. **Configure Credentials**:
   - Open the "Summarizer" workflow.
   - Update **Postgres** node credentials (Host, User, Password, Database).
   - Update **Gmail** & **Mistral Cloud** credentials.
   - Repeat for the "Webhook/Chat" workflow.

### 4. Frontend Connection
1. In n8n, open `Webhook-workflow v2`.
2. Locate the **Webhook** node (start node).
3. Copy the **Production URL** (or Test URL for debugging).
4. Open the file `AI-Executive-Assitant/script.js` in your code editor.
5. Find line 7:
   ```javascript
   const WEBHOOK_URL = 'http://localhost:5678/webhook-test/...';
   ```
6. Replace the URL with your copied n8n Webhook URL.

### 5. Running the Assistant
1. **Ingest Data**: Manually execute the `AI-Assitant-Executive` workflow (or set it to active) to fetch emails/events and populate the DB.
2. **Launch UI**: Open `AI-Executive-Assitant/index.html` in your browser.
3. **Interact**: Type "Show me my daily digest" or "What are my tasks?" to see the AI response.

---

## 2. Objective Alignment

This implementation satisfies all stated objectives:

- ✅ Extract emails and calendar events  
- ✅ Summarize and classify importance using AI  
- ✅ Identify and deduplicate action items  
- ✅ Generate a daily Morning Digest / planner  
- ✅ Deliver output via a simulated chat / web UI  
- ✅ Local, n8n-based, push-only MVP  

---

## 3. Scope & Constraints Compliance

| Requirement | Status | Notes |
|------------|-------|-------|
| n8n Community Edition (local) | ✅ | Running locally on Windows |
| Gmail + Google Calendar | ✅ | OAuth-based Gmail & Calendar nodes |
| Free / trial LLM | ✅ | Mistral (Cloud) Chat Model |
| Local DB | ✅ | PostgreSQL (AI_Executive_Assistant_Database) |
| Morning digest only | ✅ | Single daily compilation |
| No WhatsApp / paid APIs | ✅ | Webhook-based UI used |
| Push-only | ✅ | No conversational loop |

---

## 4. High-Level Architecture

### 4.1 Architectural Philosophy

The system is designed as **loosely coupled pipelines**:

- Ingestion workflows are independent of AI logic  
- AI processing operates on normalized data  
- Storage acts as the contract between workflows  
- Digest compilation is isolated and idempotent  

This enables easy future extension to **Outlook, Slack, Teams, or WhatsApp** without redesigning core logic.

### 4.2 Logical Architecture (Textual Diagram)

Gmail + Google Calendar
│
▼
[Ingestion Workflows]
│
▼
PostgreSQL (raw + structured data)
│
▼
[AI Processing Workflows]
│
▼
PostgreSQL (tasks, summaries)
│
▼
[Planner / Digest Compiler]
│
▼
HTML Digest
│
▼
Webhook → Web Chat UI

yaml
Copy code

---

## 5. n8n Workflows

### 5.1 Workflow 1 – Email & Calendar Ingestion

**Purpose**  
Collect raw data from Google services and normalize it for downstream processing.

**Key Steps**
- Triggered manually or by a scheduler  
- Fetch Gmail messages (last 24 hours)  
- Fetch Google Calendar events (next 7 days)  
- Normalize fields (IDs, timestamps, links)  
- Insert into PostgreSQL  

**Tables Written**
- `emails_raw`
- `calendar_events`

**Design Rationale**
- Raw data is preserved for traceability  
- No AI processing at ingestion time  

---

### 5.2 Workflow 2 – AI Summarization & Structuring

**Purpose**  
Convert raw emails into structured intelligence using an LLM.

**Key Steps**
- Read new/unprocessed emails from DB  
- Aggregate context where required  
- Send content to Mistral Cloud Chat Model  
- Extract:
  - Summary  
  - Importance  
  - Urgency  
  - Category  
  - Action items  
- Store structured output  

**Tables Written**
- `emails_ai`

**AI Responsibilities**
- Natural-language summarization  
- Task extraction  
- Semantic tagging  

---

### 5.3 Workflow 3 – Task Generation & Prioritization

**Purpose**  
Create a unified task list from emails and calendar context.

**Key Steps**
- Read `emails_ai` and `calendar_events`  
- Deduplicate similar action items  
- Apply simple priority logic  
- Assign due dates (explicit or inferred)  
- Insert actionable tasks  

**Tables Written**
- `tasks`

**Priority Logic (MVP)**
- **P1**: Security, deadlines today, explicit urgency  
- **P2**: Work follow-ups, meeting preparation  
- **P3**: Informational / low urgency  

---

### 5.4 Workflow 4 – Morning Digest Compiler

**Purpose**  
Generate a single, executive-friendly Morning Digest.

**Key Steps**
- Query:
  - Important emails  
  - Today / upcoming meetings  
  - Open tasks  
- Format content into structured HTML  
- Insert snapshot into daily digest table  

**Tables Written**
- `daily_digest`

---

### 5.5 Workflow 5 – Delivery (Webhook Chat UI)

**Purpose**  
Deliver the digest via a simulated chat interface.

**Key Steps**
- Webhook receives request  
- Fetch latest digest from DB  
- Return rendered HTML  
- Display inside lightweight web UI  

**Why this channel**
- Free  
- No external dependencies  
- Demonstrates chat-style delivery  
- Easily replaceable by Email / Slack / Teams  

---

## 6. Data Model

### 6.1 Tables Overview

#### `emails_raw`
Stores raw Gmail data.

| Column | Description |
|------|-------------|
| id | Internal ID |
| message_id | Gmail message ID |
| subject | Email subject |
| sender | Sender |
| body | Raw body |
| created_at | Ingest time |
| message_id_url | Direct Gmail link |

---

#### `emails_ai`
Structured AI output for emails.

| Column | Description |
|------|-------------|
| id | Internal ID |
| summary | AI summary |
| importance | High / Medium / Low |
| urgency | Today / Soon / Later |
| category | Work / Personal / Security |
| action_items | Extracted tasks (JSON / text) |
| created_at | AI processing time |
| message_id_url | Traceability to Gmail |

---

#### `calendar_events`
Normalized calendar events.

| Column | Description |
|------|-------------|
| id | Internal ID |
| event_id | Google event ID |
| title | Meeting title |
| description | Event description |
| start_time | Start |
| end_time | End |
| html_link | Google Calendar link |
| created_at | Ingest time |

---

#### `tasks`
Unified action items.

| Column | Description |
|------|-------------|
| id | Task ID |
| description | Task text |
| due_date | Due date |
| priority | 1 / 2 / 3 |
| created_at | Creation time |

---

#### `daily_digest`
Snapshot of the generated Morning Digest.

| Column | Description |
|------|-------------|
| id | Digest ID |
| digest_date | Date |
| content | HTML content |
| generated_at | Generation timestamp |

---

## 7. Output Format – Morning Digest

The digest is **HTML-based**, optimized for executives:

- Clear title and date  
- Sections:
  - Important Emails (with reason)  
  - Extracted Tasks (priority-tagged)  
  - Upcoming Meetings  
- Minimal verbosity  
- Clickable source links  

The same HTML can be reused for **email delivery** without modification.

---

## 8. LLM Choice

**Model Used:** Mistral Cloud Chat Model

**Reasoning**
- Free / trial-friendly  
- Good instruction-following  
- Low latency  
- Sufficient quality for summarization & extraction  

The architecture is **model-agnostic** and can switch to:
- Gemini  
- OpenAI  
- Local Ollama  

with minimal changes.

---

## 9. Extensibility & Future Scale

### 9.1 Adding Outlook
- Replace Gmail + Calendar nodes  
- Keep DB schema unchanged  

### 9.2 Adding Slack / Teams / WhatsApp (Conceptual)
- Replace Delivery Workflow  
- Use same `daily_digest.content`  
- Render as message blocks  

### 9.3 Production Improvements (Next Steps)
- Incremental ingestion (cursor-based)  
- Better task deduplication (semantic similarity)  
- User preferences (working hours, priorities)  
- Feedback loop for task completion  
- Multi-day planner  
- Email delivery with inline HTML  

---

## 10. Conclusion

This implementation demonstrates:

- Strong modular architecture in n8n  
- Practical AI integration  
- Clean separation of ingestion, intelligence, and delivery  
- A realistic executive assistant workflow  

The system is **production-directional**, **extensible**, and fulfills the assignment’s intent of evaluating **AI automation architecture and execution quality**.