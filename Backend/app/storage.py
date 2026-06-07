from pathlib import Path
import json
# creating folder and file for all data 
DATA_DIR = Path("data")
DATA_FILE = DATA_DIR / "executions.json"

# loading all the past runs via the file read method 
def load_data():
    if DATA_FILE.exists():
        with open(DATA_FILE, "r") as f:
            content = f.read()
            if content.strip():
                return json.loads(content)
    return []

# adding new runs to the file via the file write method 
def save_data(data):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)