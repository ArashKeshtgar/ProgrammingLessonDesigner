import sqlite3

from .app import create_app
from .config import load_settings
from .db import SqliteProjects
from .models import StatusCounts
from .tokens import TokenService

# Composition root: the only place that knows which real implementations are used.
settings = load_settings()
conn = sqlite3.connect(settings["db_path"], check_same_thread=False)
projects = SqliteProjects(conn)


class CountQueries:
    def status(self) -> StatusCounts:
        (count,) = conn.execute("SELECT COUNT(*) FROM projects").fetchone()
        return StatusCounts(sent=count)


tokens = TokenService(settings["jwt_secret"], settings["jwt_refresh_secret"], lambda _id: None)
app = create_app(CountQueries(), projects, tokens)
