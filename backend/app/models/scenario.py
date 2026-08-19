from pydantic import BaseModel, Field

class Scenario(BaseModel):
    """A generated test scenario for evaluating Trasey reliability."""
    id: str = Field(..., description="Unique ID for the scenario")
    type: str = Field(..., description="Type (e.g., adversarial, normal, edge_case, tool_failure)")
    title: str = Field(..., description="Short descriptive title of the scenario")
    prompt: str = Field(..., description="The input prompt generated for Trasey to execute")
    expected_behavior: str = Field(..., description="Description of the expected correct or safe behavior of Trasey")
    severity: str = Field("medium", description="Severity level of the scenario (low, medium, high)")
