#!/bin/bash
set -e
python manage.py migrate --noinput
exec gunicorn ecommerce_backend.wsgi --bind 0.0.0.0:${PORT:-8000}
