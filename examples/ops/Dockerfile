# Ubuntu 24.04 like the VPS, with bash, PowerShell 7 and Python 3.12 side by side and
# what the scripts drive: sshd, git, sqlite3, curl, flock. Runs every example's tests:
#   docker build -t lessons-ops examples/ops && docker run --rm lessons-ops
FROM ubuntu:24.04

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl git openssh-client openssh-server python3 sqlite3 \
 && curl -fsSL -o /tmp/microsoft.deb https://packages.microsoft.com/config/ubuntu/24.04/packages-microsoft-prod.deb \
 && dpkg -i /tmp/microsoft.deb && rm /tmp/microsoft.deb \
 && apt-get update && apt-get install -y --no-install-recommends powershell \
 && rm -rf /var/lib/apt/lists/*

# sshd -t and -T want host keys and their runtime folder; there is no systemd to make them.
RUN ssh-keygen -A && mkdir -p /run/sshd
RUN git config --global user.name ops && git config --global user.email ops@example.com \
 && git config --global init.defaultBranch main && git config --global advice.detachedHead false

ENV POWERSHELL_TELEMETRY_OPTOUT=1 POWERSHELL_UPDATECHECK=Off
WORKDIR /ops
COPY . .
CMD ["bash", "tests/run.sh"]
