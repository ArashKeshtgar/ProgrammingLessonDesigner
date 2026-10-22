# #region dockerfile
# Stage 1: install dependencies into a virtualenv.
FROM python:3.12-slim AS build
RUN python -m venv /venv
# requirements.txt first: this layer stays cached until the dependencies change.
COPY requirements.txt .
RUN /venv/bin/pip install --no-cache-dir -r requirements.txt

# Stage 2: only the venv and the code, no pip cache or build tools.
FROM python:3.12-slim
ENV PATH=/venv/bin:$PATH PYTHONUNBUFFERED=1 DB_PATH=/data/portfolio.db
COPY --from=build /venv /venv
WORKDIR /app
COPY portfolio ./portfolio
# Never run as root; /data is the only place the app writes.
RUN useradd --uid 10001 app && mkdir /data && chown app /data
USER app
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/status', timeout=2)"
CMD ["uvicorn", "portfolio.main:app", "--host", "0.0.0.0", "--port", "8080"]
# #endregion
