#!/bin/bash
# AI Growth Systems - Dev Launch Wrapper
# Routes to the primary Unix start.sh script

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
bash "$DIR/start.sh"
