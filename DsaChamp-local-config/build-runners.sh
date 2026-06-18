#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

docker build -t cpp-runner "$SCRIPT_DIR/cpp-runner"
docker build -t java-runner "$SCRIPT_DIR/java-runner"
docker build -t python-runner "$SCRIPT_DIR/python-runner"

