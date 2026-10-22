from typing import Protocol

from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field


class ProjectRow(BaseModel):
    key: str
    display_name: str
    adapter_base_url: str


# #region validation
class CreateProject(BaseModel):
    # Unknown fields are an error, not silently dropped (like Nest's whitelist + forbid).
    model_config = ConfigDict(extra="forbid")

    key: str = Field(pattern=r"^[a-z0-9-]{1,40}$")
    display_name: str = Field(min_length=1, max_length=100)
    adapter_base_url: AnyHttpUrl
# #endregion


class StatusCounts(BaseModel):
    # SUM over no rows is NULL in SQL, so every count may arrive as None.
    sent: int | None = None
    interviewing: int | None = None
    followups_due: int | None = None
    drafts: int | None = None


# #region ports
class StatusQueries(Protocol):
    def status(self) -> StatusCounts: ...


class ProjectRepository(Protocol):
    def find(self, key: str) -> ProjectRow | None: ...
    def add(self, row: ProjectRow) -> None: ...
# #endregion


class InMemoryProjects:
    def __init__(self) -> None:
        self.rows: dict[str, ProjectRow] = {}

    def find(self, key: str) -> ProjectRow | None:
        return self.rows.get(key)

    def add(self, row: ProjectRow) -> None:
        self.rows[row.key] = row
