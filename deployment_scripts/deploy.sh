#!/usr/bin/env bash
heroku config:set DISABLE_COLLECTSTATIC=0
git push heroku rifatsm:master
heroku config:unset DISABLE_COLLECTSTATIC