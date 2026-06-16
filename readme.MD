# Code Evaluator

A web-based code execution tool that allows users to write or paste code, select a language and version, and run it directly in the browser. Built with a FastAPI backend, a plain HTML/CSS/JS frontend, and a microservices-inspired runtime architecture containerized with Docker.

---

## Architecture Overview

Each language/version runs as its own isolated FastAPI service (a "runtime") inside a Docker container managed by Supervisor. The main app acts as an orchestrator — it receives the user's code and language selection, routes the request to the correct runtime via an internal HTTP call, and returns the result. Runtime services are not exposed outside the container, meaning only the main app is publicly accessible.

```
User (Browser)
    ↓
Frontend (HTML/CSS/JS) → localhost:3000
    ↓
Main App (FastAPI) → localhost:8000  [only port exposed outside Docker]
    ↓ internal HTTP PUT request
Runtime Services (inside Docker, not publicly accessible)
    ├── python313 runtime → localhost:8001
    └── node24 runtime   → localhost:8002
         ↓
    subprocess execution
         ↓
    stdout / stderr returned up the chain
```

---

## Features

- Execute Python and Node.js code directly in the browser
- Support for multiple language versions:
  - Python 3.13
  - Node.js 24
  - (More versions coming as additional runtimes are added)
- Isolated runtime services per language/version for improved security
- Execution history saved across sessions
- Label, favorite, and note individual runs
- Delete runs from history
- 5 second execution timeout to prevent infinite loops
- stdout and stderr captured and displayed separately
- Docker + Supervisor containerization manages all services

---

## Project Structure

```
FastAPI-Code-Reader/
├── Backend/
│   ├── main.py                  # FastAPI app setup, CORS, router registration
│   ├── Dockerfile               # Docker build configuration
│   ├── supervisord.conf         # Supervisor config — manages all runtime processes
│   ├── requirements.txt         # Main app dependencies
│   └── app/
│       ├── testing/
│       │   └── evaluate.py      # All endpoints — routes /execute to correct runtime
│       ├── schemas.py           # Pydantic request/response models
│       └── storage.py           # JSON file read/write for execution history
│   └── runtimes/
│       ├── python313/
│       │   ├── main.py          # Isolated FastAPI app for Python 3.13 execution
│       │   └── requirements.txt
│       └── node24/
│           ├── main.py          # Isolated FastAPI app for Node.js 24 execution
│           └── requirements.txt
└── Frontend/
    ├── index.html               # UI structure
    ├── style.css                # Styling
    └── script.js                # fetch() calls and DOM manipulation
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, Uvicorn |
| Runtime Isolation | Separate FastAPI services per language/version |
| Inter-service Communication | Python requests library (internal HTTP) |
| Process Management | Supervisor (supervisord) |
| Storage | JSON file (executions.json) |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Containerization | Docker + Ubuntu 22.04 |

---

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- A modern web browser
- For local development without Docker: Python 3.13+ and Node.js installed

---

## Running with Docker (Recommended)

**1. Clone the repository:**
```bash
git clone https://github.com/Kevin-Henned/your-repo-name.git
cd your-repo-name/Backend
```

**2. Build the Docker image:**
```bash
docker build -t code-evaluator .
```

**3. Run the container:**
```bash
docker run -p 8000:8000 code-evaluator
```

Only port 8000 is exposed. Runtime services on ports 8001 and 8002 are internal to the container only.

You should see Supervisor start all three services:
```
INFO success: mainapp entered RUNNING state
INFO success: python313 entered RUNNING state
INFO success: node24 entered RUNNING state
```

**4. Serve the frontend:**
```bash
cd ../Frontend
python3 -m http.server 3000
```

Then open `http://localhost:3000` in your browser.

**5. Test the API directly:**

Visit `http://localhost:8000/docs` for the Swagger UI.

---

## Running Locally (Without Docker)

Run each service in a separate terminal:

**Terminal 1 — python313 runtime:**
```bash
cd Backend/runtimes/python313
pip install -r requirements.txt
fastapi dev main.py --port 8001
```

**Terminal 2 — node24 runtime:**
```bash
cd Backend/runtimes/node24
pip install -r requirements.txt
fastapi dev main.py --port 8002
```

**Terminal 3 — main app:**
```bash
cd Backend
pip install -r requirements.txt
fastapi dev main.py --port 8000
```

**Terminal 4 — frontend:**
```bash
cd Frontend
python3 -m http.server 3000
```

> Note: Running locally requires the correct language versions installed on your machine. Node.js paths in `runtimes/node24/main.py` may need to be updated to match your local installation (`which node`).

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/evaluator` | Retrieve all execution history |
| `GET` | `/api/v1/evaluator/{run_id}` | Retrieve a single run by ID |
| `POST` | `/api/v1/evaluator/execute` | Execute code — routes to correct runtime internally |
| `PUT` | `/api/v1/evaluator/{run_id}` | Update label, favorite, or note on a run |
| `DELETE` | `/api/v1/evaluator/{run_id}` | Delete a run from history |

### Internal Runtime Endpoints (not publicly accessible)

| Method | Endpoint | Service | Description |
|---|---|---|---|
| `PUT` | `/execute` | python313 (port 8001) | Executes Python 3.13 code via subprocess |
| `PUT` | `/execute` | node24 (port 8002) | Executes Node.js 24 code via subprocess |

### Example Request

```bash
curl -X POST http://localhost:8000/api/v1/evaluator/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "print(\"hello world\")", "language": "python3.13"}'
```

### Example Response

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "output": "hello world\n",
  "error": "",
  "language": "python3.13",
  "label": null,
  "favorited": null,
  "note": null
}
```

---

## Security Notes

- Each language/version runs as an isolated process with its own working directory — exploiting one runtime does not give direct access to the main app's files or other runtimes
- Runtime ports (8001, 8002) are internal to the Docker container only — not accessible from outside
- All executions have a 5 second timeout to prevent infinite loops
- Stderr is captured and returned rather than crashing the server
- `allow_origins=["*"]` is set for development — restrict to your frontend URL in production

### Future Security Improvements
For a fully hardened production deployment:
- Move each runtime into its own separate Docker container with network policies
- Add per-execution memory and CPU resource limits
- Add rate limiting on the `/execute` endpoint
- Use a secrets manager for any sensitive configuration

---

## Adding New Language Versions

To add a new language/version (e.g. Python 3.11):

1. Create `runtimes/python311/main.py` with the subprocess logic for that version
2. Create `runtimes/python311/requirements.txt` with `fastapi` and `uvicorn`
3. Add a new port mapping in `evaluate.py` RUNTIME_PORTS
4. Add the new Language enum value in `schemas.py`
5. Add the new option to the dropdown in `index.html`
6. Add a new `[program:python311]` entry in `supervisord.conf`
7. Add the pip install step and language installation in `Dockerfile`
8. Rebuild Docker

---

## Future Improvements

- Additional language versions (Python 3.9, 3.11, 3.12, Node.js 18, 20)
- Java language support
- User input support via stdin
- React frontend
- Per-container runtime isolation (Docker Compose)
- Authentication for multi-user support
- Syntax highlighting in the code editor

---

