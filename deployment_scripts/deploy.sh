#!/usr/bin/env bash
heroku config:set DISABLE_COLLECTSTATIC=0
git push heroku master:master
heroku config:unset DISABLE_COLLECTSTATIC