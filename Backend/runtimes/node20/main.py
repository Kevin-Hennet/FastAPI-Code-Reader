from fastapi import FastAPI
import subprocess
from pydantic import BaseModel
# for code input formatting 
class CodePayload(BaseModel):
    code: str
# app creation 
app = FastAPI()
# put endpoint getting the code which will eventually be sent to the post endpoint in evaluate.py 
@app.put("/execute")
def execute(payload: CodePayload):
    result = subprocess.run(
        ["/root/.nvm/versions/node/v20.20.2/bin/node", "-e", payload.code],
        capture_output=True, text=True, timeout=5
    )
    return {"output": result.stdout, "error": result.stderr}