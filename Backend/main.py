from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.testing.evaluate import router as code_router
# app creation 
app = FastAPI(
    title="Code analyzer API",
    version="0.2.0",
    description="Users can input their code and select a specific language and version and the API will provide an output"
)
# for future when a front end is made for better ui 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend's origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# connects to the evlaute.py file router 
app.include_router(code_router)

# access by running docker build -t code-evaluator . and docker run -p 8000:8000 code-evaluator 
# more specific instructions in the readme file 