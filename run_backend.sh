#!/bin/bash
cd "$(dirname "$0")/geotech-pro-backend"
source venv/Scripts/activate
cd geotech_backend
python manage.py runserver