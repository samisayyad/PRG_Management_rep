#!/bin/bash

cd backend && python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

cd frontend && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

wait
