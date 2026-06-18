from fastapi import FastAPI
import subprocess
from pydantic import BaseModel
# code formatting 
class CodePayload(BaseModel):
    code: str
# app creation 
app = FastAPI()

# put endpoint that will take the code and send it to the post endpoint in evaluate.py 
@app.put("/execute")
def execute(payload: CodePayload):
    result = subprocess.run(
        ["python3.11", "-c", payload.code],
        capture_output=True, text=True, timeout=5
    )
    return {"output": result.stdout, "error": result.stderr}