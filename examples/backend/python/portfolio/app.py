import logging
import uuid

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .models import CreateProject, ProjectRepository, ProjectRow, StatusQueries
from .tokens import AuthError, TokenService

logger = logging.getLogger(__name__)


# #region factory
def create_app(queries: StatusQueries, projects: ProjectRepository, tokens: TokenService) -> FastAPI:
    # Everything the app needs comes in as an argument, so a test can pass fakes.
    app = FastAPI()
    # #endregion

    # #region errors
    @app.exception_handler(RequestValidationError)
    async def invalid(_req: Request, exc: RequestValidationError):
        # FastAPI answers 422 by default; we answer 400 like the other three languages.
        errors = {".".join(str(p) for p in e["loc"][1:]) or "body": e["msg"] for e in exc.errors()}
        return JSONResponse({"error": "Invalid request.", "errors": errors}, status_code=400)

    @app.exception_handler(HTTPException)
    async def http_error(_req: Request, exc: HTTPException):
        return JSONResponse({"error": exc.detail}, status_code=exc.status_code)

    @app.exception_handler(Exception)
    async def unexpected(_req: Request, exc: Exception):
        # The details go to the log, never to the caller (they can name servers, users, SQL).
        trace_id = uuid.uuid4().hex
        logger.error("Unhandled error %s", trace_id, exc_info=exc)
        return JSONResponse({"error": "Something went wrong.", "trace_id": trace_id}, status_code=500)
    # #endregion

    # #region roles
    def require_role(*roles: str):
        def check(authorization: str | None = Header(default=None)) -> dict:
            if not authorization or not authorization.startswith("Bearer "):
                raise HTTPException(401, "Sign in first.")
            try:
                claims = tokens.verify_access(authorization.removeprefix("Bearer "))
            except AuthError as e:
                raise HTTPException(401, str(e)) from e
            if claims["role"] not in roles:
                raise HTTPException(403, "Not allowed for your role.")
            return claims

        return check
    # #endregion

    # #region routes
    @app.get("/status")
    def status():
        try:
            s = queries.status()
        except Exception:
            # Unhealthy is an answer, not an error: the dashboard shows it.
            return {"healthy": False, "error": "Database unreachable."}
        m = {k: v or 0 for k, v in s.model_dump().items()}
        summary = f"{m['sent']} sent, {m['interviewing']} interviewing, {m['followups_due']} follow-up(s) due"
        return {"healthy": True, "summary": summary, "metrics": m}

    @app.get("/projects/{key}")
    def get_project(key: str):
        row = projects.find(key)
        if row is None:
            raise HTTPException(404, f"Unknown project: {key}")
        return row

    @app.post("/projects", status_code=201, dependencies=[Depends(require_role("Admin"))])
    def create_project(body: CreateProject):
        if projects.find(body.key):
            raise HTTPException(409, f"Project {body.key} already exists.")
        row = ProjectRow(key=body.key, display_name=body.display_name, adapter_base_url=str(body.adapter_base_url))
        projects.add(row)
        return JSONResponse(row.model_dump(), status_code=201, headers={"Location": f"/projects/{row.key}"})
    # #endregion

    return app
