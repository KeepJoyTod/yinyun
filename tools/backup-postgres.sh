#!/bin/sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
OUTPUT_DIR="${OUTPUT_DIR:-backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"

mkdir -p "$OUTPUT_DIR"
BACKUP_FILE="$OUTPUT_DIR/camera_studio_$(date +%Y%m%d-%H%M%S).sql"

docker compose -f "$COMPOSE_FILE" exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > "$BACKUP_FILE"
find "$OUTPUT_DIR" -name "camera_studio_*.sql" -type f -mtime +"$KEEP_DAYS" -delete

echo "Backup created: $BACKUP_FILE"
