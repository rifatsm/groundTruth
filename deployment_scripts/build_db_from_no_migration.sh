#!/usr/bin/env bash
python manage.py migrate
python manage.py makemigrations ground_truth
python manage.py sqlmigrate ground_truth 0001
python manage.py migrate