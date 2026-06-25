from fastapi import FastAPI
import subprocess
from pydantic import BaseModel
import uuid 
import shutil
import os 
# code formatting 
class CodePayload(BaseModel):
    code: str
# app creation 
app = FastAPI()

# put endpoint that will take the code and send it to the post endpoint in evaluate.py 
@app.put("/execute")
def execute(payload: CodePayload):
    # complile the php code into a script so it can be executed 
    # similar to java but the filename doesn't have to match the classname 
    filename = "script.php"
    exec_dir = f"/tmp/{uuid.uuid4()}"
    os.makedirs(exec_dir)
    try: 
        with open(f"{exec_dir}/{filename}", "w") as f: 
            f.write(payload.code)
        # run the script 
        run = subprocess.run(
            ["php", f"{exec_dir}/{filename}"],
            capture_output=True,
            text=True,
            timeout=5
        )
        # output 
        return {"output": run.stdout, "error": run.stderr}
    except subprocess.TimeoutExpired:
        return {"output": "", "error": "Execution timed out"}
    finally: 
        # delete the script so random files do not fill the storage 
        shutil.rmtree(exec_dir, ignore_errors=True)

    