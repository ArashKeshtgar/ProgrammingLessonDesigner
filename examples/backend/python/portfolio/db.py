import sqlite3

from .models import ProjectRow

SCHEMA = """
CREATE TABLE IF NOT EXISTS projects (
    key TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    adapter_base_url TEXT NOT NULL
)"""


# #region repository
class SqliteProjects:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn
        conn.execute(SCHEMA)

    def find(self, key: str) -> ProjectRow | None:
        # ? placeholders: the driver sends the value separately, never as SQL text.
        row = self.conn.execute(
            "SELECT key, display_name, adapter_base_url FROM projects WHERE key = ?", (key,)
        ).fetchone()
        return ProjectRow(key=row[0], display_name=row[1], adapter_base_url=row[2]) if row else None

    def add(self, row: ProjectRow) -> None:
        with self.conn:  # commits on success, rolls back on an exception
            self.conn.execute(
                "INSERT INTO projects (key, display_name, adapter_base_url) VALUES (?, ?, ?)",
                (row.key, row.display_name, row.adapter_base_url),
            )
# #endregion
