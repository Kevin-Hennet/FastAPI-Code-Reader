from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional

#allowed languages 
class Language(str, Enum):
    python39 = "python3.9"
    python311 = "python3.11"
    python312 = "python3.12"
    python313 = "python3.13"
    node18 = "node18"
    node20 = "node20"
    node24 = "node24"
    java21 = "java21"
    php82 = "php8.2"
# how the user is supposed to enter the code (have to use \n line breaks to differientiate the lines of code)
class CodeRequest(BaseModel):
    code: str = Field(min_length=1)
    language: Language  
# used to update runs and add descriptions (add labels and favorites option)
class CodeClassification(BaseModel):
    label: Optional[str] = Field(default=None, max_length=100)
    favorited: Optional[bool] = None
    note: Optional[str] = Field(default=None, max_length=500)


# output format 
class ExecutionResult(BaseModel):
    id: str
    output: str
    error: str
    language: str
    label: Optional[str] = None
    favorited: Optional[bool] = None
    note: Optional[str] = None