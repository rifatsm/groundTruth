#!/usr/bin/env bash
heroku run pip install Pillow --app=your-app
heroku run python manage.py migrate
heroku run python manage.py sqlmigrate ground_truth 0001
heroku run python manage.py migrate