# Code Evaluator

A web-based code execution tool that allows users to write or paste code, select a language and version, and run it directly in the browser. Built with a FastAPI backend and a plain HTML/CSS/JS frontend, containerized with Docker.

---

## Features

- Execute Python and Node.js code directly in the browser
- Support for multiple language versions:
  - Python 3.9, 3.11, 3.12, 3.13
  - Node.js 18, 20, 24
- Execution history saved across sessions
- Label, favorite, and note individual runs
- Delete runs from history
- 5 second execution timeout to prevent infinite loops
- Stderr and stdout captured and displayed separately
- Docker containerization guarantees all language versions are available

---

## Project Structure

```
FastAPI-Code-Reader/
├── Backend/
│   ├── main.py               # FastAPI app setup and middleware
│   ├── Dockerfile            # Docker configuration
│   ├── requirements.txt      # Python dependencies
│   └── app/
│       ├── testing/
│       │   └── evaluate.py   # Execution endpoints and subprocess logic
│       ├── schemas.py        # Pydantic request/response models
│       └── storage.py        # JSON file read/write for execution history
└── Frontend/
    ├── index.html            # UI structure
    ├── style.css             # Styling
    └── script.js             # fetch() calls and DOM manipulation
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, Uvicorn |
| Code Execution | Python subprocess module |
| Storage | JSON file (executions.json) |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Containerization | Docker |

---

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- A modern web browser
- For local development without Docker: Python 3.13+ and Node.js installed

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

**3. Run the container:**
```bash
docker run -p 8000:8000 code-evaluator
```

**4. Open the frontend:**

Open `Frontend/index.html` in your browser via a local server:
```bash
cd ../Frontend
python3 -m http.server 3000
```
Then visit `http://localhost:3000`

Or use the VS Code Live Server extension and open `index.html` directly.

**5. Test the API directly:**

Visit `http://localhost:8000/docs` for the Swagger UI.

---

## Running Locally (Without Docker)

**1. Create and activate a virtual environment:**
```bash
cd Backend
python3 -m venv .venv
source .venv/bin/activate
```

**2. Install dependencies:**
```bash
pip install -r requirements.txt
```

**3. Start the server:**
```bash
fastapi dev main.py
```

**4. Open the frontend:**
```bash
cd ../Frontend
python3 -m http.server 3000
```

> Note: Running locally requires all language versions to be installed on your machine. Node.js paths in `evaluate.py` may need to be updated to match your local installation (`which node`).

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/evaluator` | Retrieve all execution history |
| `GET` | `/api/v1/evaluator/{run_id}` | Retrieve a single run by ID |
| `POST` | `/api/v1/evaluator/execute` | Execute code and save result |
| `PUT` | `/api/v1/evaluator/{run_id}` | Update label, favorite, or note on a run |
| `DELETE` | `/api/v1/evaluator/{run_id}` | Delete a run from history |

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

- Code execution is sandboxed inside a Docker container
- All executions have a 5 second timeout to prevent infinite loops
- Stderr is captured and returned rather than crashing the server
- `allow_origins=["*"]` is set for development — restrict to your frontend URL in production

---

