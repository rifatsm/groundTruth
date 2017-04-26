#!/usr/bin/env bash
heroku run python manage.py migrate
heroku run python manage.py sqlmigrate ground_truth 0001
heroku run python manage.py migrate