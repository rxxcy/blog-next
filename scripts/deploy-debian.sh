#!/usr/bin/env bash
set -Eeuo pipefail

log() {
  printf '[deploy] %s\n' "$*"
}

die() {
  printf '[deploy] ERROR: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Missing command: $1"
}

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
REMOTE="${REMOTE:-origin}"
ENV_FILE="${ENV_FILE:-.env.docker}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"

cd "$REPO_DIR"

require_command git
require_command docker

TARGET_BRANCH="${1:-}"
if [ -z "$TARGET_BRANCH" ]; then
  TARGET_BRANCH="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)"
fi
if [ -z "$TARGET_BRANCH" ]; then
  REMOTE_HEAD="$(git symbolic-ref --quiet --short "refs/remotes/$REMOTE/HEAD" 2>/dev/null || true)"
  TARGET_BRANCH="${REMOTE_HEAD#"$REMOTE/"}"
fi
[ -n "$TARGET_BRANCH" ] || die "Could not determine target branch. Pass the branch name as the first argument."

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  die "Missing docker compose. Install Docker Compose v2 or docker-compose."
fi

[ -f "$COMPOSE_FILE" ] || die "Missing $COMPOSE_FILE in $REPO_DIR"

DIRTY_TRACKED="$(git status --porcelain --untracked-files=no)"
if [ -n "$DIRTY_TRACKED" ]; then
  printf '%s\n' "$DIRTY_TRACKED" >&2
  die "Tracked files have local changes. Commit or stash them before deploy."
fi

if [ ! -f "$ENV_FILE" ]; then
  if [ -f .env.docker.example ]; then
    cp .env.docker.example "$ENV_FILE"
    log "Created $ENV_FILE from .env.docker.example"
  else
    : > "$ENV_FILE"
    log "Created empty $ENV_FILE"
  fi
fi

mkdir -p content/posts content/albums content/moments content/projects public/albums

log "Fetching $REMOTE"
git fetch --prune "$REMOTE"

CURRENT_BRANCH="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || true)"
if [ "$CURRENT_BRANCH" != "$TARGET_BRANCH" ]; then
  if git show-ref --verify --quiet "refs/heads/$TARGET_BRANCH"; then
    log "Switching branch to $TARGET_BRANCH"
    git checkout "$TARGET_BRANCH"
  elif git show-ref --verify --quiet "refs/remotes/$REMOTE/$TARGET_BRANCH"; then
    log "Creating local branch $TARGET_BRANCH from $REMOTE/$TARGET_BRANCH"
    git checkout -b "$TARGET_BRANCH" "$REMOTE/$TARGET_BRANCH"
  else
    die "Remote branch not found: $REMOTE/$TARGET_BRANCH"
  fi
fi

log "Pulling latest code from $REMOTE/$TARGET_BRANCH"
git pull --ff-only "$REMOTE" "$TARGET_BRANCH"

GIT_COMMIT_SHA="$(git rev-parse --short HEAD)"
GIT_COMMIT_COUNT="$(git rev-list --count HEAD)"
export GIT_COMMIT_SHA GIT_COMMIT_COUNT

log "Building commit $GIT_COMMIT_SHA (#$GIT_COMMIT_COUNT)"
if grep -q 'your-domain.com' "$ENV_FILE" 2>/dev/null; then
  log "Warning: $ENV_FILE still contains your-domain.com. Update SITE_URL and NEXT_PUBLIC_SITE_URL if needed."
fi

log "Rebuilding and starting containers"
"${COMPOSE[@]}" --env-file "$ENV_FILE" up -d --build --remove-orphans

log "Current container status"
"${COMPOSE[@]}" ps
