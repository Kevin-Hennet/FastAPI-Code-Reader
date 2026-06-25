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
    ├── python39  runtime → localhost:8001
    ├── python311 runtime → localhost:8002
    ├── python312 runtime → localhost:8003
    ├── python313 runtime → localhost:8004
    ├── node18    runtime → localhost:8005
    ├── node20    runtime → localhost:8006
    └── node24    runtime → localhost:8007
    └── java21    runtime → localhost:8008
    └── php82     runtime → localhost:8008
         ↓
    subprocess execution
         ↓
    stdout / stderr returned up the chain
```

---

## Features

- Execute Python and Node.js code directly in the browser
- Support for multiple language versions:
  - Python 3.9, 3.11, 3.12, 3.13
  - Node.js 18, 20, 24
  - Java 21
  - PHP 8.2
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
│   ├── app/
│   │   ├── testing/
│   │   │   └── evaluate.py      # All endpoints — routes /execute to correct runtime
│   │   ├── schemas.py           # Pydantic request/response models
│   │   └── storage.py           # JSON file read/write for execution history
│   └── runtimes/
│       ├── python39/
│       │   ├── main.py          # Isolated FastAPI app for Python 3.9 execution
│       │   └── requirements.txt
│       ├── python311/
│       │   ├── main.py
│       │   └── requirements.txt
│       ├── python312/
│       │   ├── main.py
│       │   └── requirements.txt
│       ├── python313/
│       │   ├── main.py
│       │   └── requirements.txt
│       ├── node18/
│       │   ├── main.py
│       │   └── requirements.txt
│       ├── node20/
│       │   ├── main.py
│       │   └── requirements.txt
│       ├── node24/
│       │   ├── main.py
│       │   └── requirements.txt
│       ├── java21/
│       │   ├── main.py
│       │   └── requirements.txt
│       └── php82/
│           ├── main.py
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
- For local development without Docker: the relevant Python/Node versions installed locally

---

## Running with Docker (Recommended)

**1. Clone the repository:**
```bash
git clone https://github.com/Kevin-Hennet/your-repo-name.git
cd your-repo-name/Backend
```

**2. Build the Docker image:**
```bash
docker build -t code-evaluator .
```

> Note: This build installs four Python versions, three Node versions, and Supervisor — expect the first build to take a few minutes.

**3. Run the container:**
```bash
docker run -p 8000:8000 code-evaluator
```

Only port 8000 is exposed. All runtime services (ports 8001–8007) are internal to the container only.

You should see Supervisor start all eight services:
```
INFO success: mainapp entered RUNNING state
INFO success: python39 entered RUNNING state
INFO success: python311 entered RUNNING state
INFO success: python312 entered RUNNING state
INFO success: python313 entered RUNNING state
INFO success: node18 entered RUNNING state
INFO success: node20 entered RUNNING state
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

Running all seven runtimes locally requires every corresponding Python/Node version installed on your machine, and each runtime's Node path updated to your local install location (`which node`). This is significantly more setup than Docker, so Docker is the recommended path for full version coverage.

To test a single runtime locally (e.g. python313):

**Terminal 1 — python313 runtime:**
```bash
cd Backend/runtimes/python313
pip install -r requirements.txt
fastapi dev main.py --port 8004
```

**Terminal 2 — main app:**
```bash
cd Backend
pip install -r requirements.txt
fastapi dev main.py --port 8000
```

**Terminal 3 — frontend:**
```bash
cd Frontend
python3 -m http.server 3000
```

> Note: `RUNTIME_PORTS` in `evaluate.py` must match the ports you're running locally for any languages you want to test outside Docker.

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

| Method | Endpoint | Service | Port |
|---|---|---|---|
| `PUT` | `/execute` | python39 | 8001 |
| `PUT` | `/execute` | python311 | 8002 |
| `PUT` | `/execute` | python312 | 8003 |
| `PUT` | `/execute` | python313 | 8004 |
| `PUT` | `/execute` | node18 | 8005 |
| `PUT` | `/execute` | node20 | 8006 |
| `PUT` | `/execute` | node24 | 8007 |
| `PUT` | `/execute` | java21 | 8008 |
| `PUT` | `/execute` | php82  | 8009 |

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
- Runtime ports (8001–8007) are internal to the Docker container only — not accessible from outside
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

To add a new language/version (e.g. C++ 26):

1. Create `runtimes/{version}/main.py` with the execution logic for that version
2. Create `runtimes/{version}/requirements.txt` with `fastapi` and `uvicorn`
3. Add a new port mapping in `evaluate.py`'s `RUNTIME_PORTS`
4. Add the new Language enum value in `schemas.py`
5. Add the new option to the dropdown in `index.html`
6. Add a new `[program:{version}]` entry in `supervisord.conf` with a unique port
7. Add the language installation and `pip install -r` step in the Dockerfile
8. Rebuild Docker and verify the new service enters RUNNING state in the logs

---

## Future Improvements

- User input support via stdin
- React frontend
- Per-container runtime isolation (Docker Compose)
- Authentication for multi-user support
- Syntax highlighting in the code editor

---

