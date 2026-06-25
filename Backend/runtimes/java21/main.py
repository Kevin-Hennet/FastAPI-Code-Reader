from fastapi import FastAPI
import subprocess
from pydantic import BaseModel
import  uuid 
import shutil 
import re 
import os 
# code formatting 
class CodePayload(BaseModel):
    code: str
# app creation 
app = FastAPI()

# put endpoint that will take the code and send it to the post endpoint in evaluate.py 
@app.put("/execute")
def execute(payload: CodePayload):
    # find the classname the user used (public classname)
    # and the classname will become the filename 
    match = re.search(r'public\s+class\s+(\w+)', payload.code)
    if not match: 
        return {"output": "", "error": "No public class found. make sure class is declared as 'public class ClassName'"}
    classname = match.group(1)
    filename = f"{classname}.java"
    # create directory for the files 
    exec_dir = f"/tmp/{uuid.uuid4()}"
    os.makedirs(exec_dir)
    # complies the java code first 
    try:
        with open(f"{exec_dir}/{filename}", "w") as f:
            f.write(payload.code)
        
        compile = subprocess.run(
            ["javac", f"{exec_dir}/{filename}"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if compile.returncode != 0:
            return {"output": "", "error": compile.stderr}
        # now runs the complied code 
        run = subprocess.run(
            ["java", "-cp", exec_dir, classname],
            capture_output=True,
            text=True,
            timeout=5
        )
        return {"output": run.stdout, "error": run.stderr}
    
    except subprocess.TimeoutExpired:
        return {"output": "", "error": "Execution timed out"}
    # delete the newly created directories so unneeded files do not take up storage 
    finally:
        shutil.rmtree(exec_dir, ignore_errors=True)