#!/usr/bin/env bash
# Run from the /backend directory
# pip install -r requirements.txt
uvicorn main:app --reload --port 8000
