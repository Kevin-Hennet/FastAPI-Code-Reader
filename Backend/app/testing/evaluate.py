from fastapi import APIRouter, HTTPException, status
import subprocess
from app.schemas import ExecutionResult, CodeRequest, CodeClassification
from app.storage import load_data, save_data
import uuid
import os 

# router setup
router = APIRouter(prefix="/api/v1/evaluator", tags=["Evaluate"])
# Helps compile the language chosen by the user to produce an output 
import os
# used to differientiate with different filepaths for nodejs
IS_DOCKER = os.environ.get("RUNNING_IN_DOCKER", False)
# language options (works with the schemas)
LANGUAGE_VERSIONS = {
    "python3.9": ["python3.9", "-c"],
    "python3.11": ["python3.11", "-c"],
    "python3.12": ["python3.12", "-c"],
    "python3.13": ["python3.13", "-c"],
    "node18": ["/root/.nvm/versions/node/v18.20.8/bin/node", "-e"],
    "node20": ["/root/.nvm/versions/node/v20.20.2/bin/node", "-e"],
    "node24": ["/root/.nvm/versions/node/v24.16.0/bin/node", "-e"],
}
# get all runs 
@router.get("", response_model=list[ExecutionResult])
def get_runs():
    history = load_data()
    return history
# get a specific run 
@router.get("/{run_id}", response_model=ExecutionResult)
def get_run(run_id: str):
    history = load_data()
    for run in history:
        if run["id"] == run_id:
            return run
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail="Run not found")

    

# post endpoint 
@router.post("/execute", response_model=ExecutionResult, status_code=status.HTTP_200_OK)
def execute_code(payload: CodeRequest):
    history = load_data()
    # recieves language chosen by the user 
    command = LANGUAGE_VERSIONS.get(payload.language)
    if command is None:
        raise HTTPException(status_code=400, detail="Unsupported language version")
    code = command + [payload.code]
    try:
        result = subprocess.run(
            code,
            capture_output=True,  # grab the output instead of printing to terminal
            text=True,            # return strings not bytes
            timeout=5             # kill it after 5 seconds
            )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Execution timed out after 5 seconds")
    #output 
    product = {
    "id": str(uuid.uuid4()),
    "output": result.stdout,
    "error": result.stderr,
    "language": payload.language
    }
    history.append(product)
    save_data(history)
    return product
# updating the run to add a label or favorite option 
@router.put("/{run_id}", response_model=ExecutionResult)
def update_run(run_id: str, payload: CodeClassification):
    history = load_data()
    for run in history:
        if run["id"] == run_id:
            if payload.label is not None:
                run["label"] = payload.label
            if payload.favorited is not None:
                run["favorited"] = payload.favorited
            if payload.note is not None:
                run["note"] = payload.note
            save_data(history)
            return run
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Run not found"
    )
# delete endpoint 
@router.delete("/{run_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_run(run_id: str):

    history = load_data()
    for i, run, in enumerate(history):
        if run["id"] == run_id:
            history.pop(i)
            save_data(history)
            return 
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Run not found"
    )
