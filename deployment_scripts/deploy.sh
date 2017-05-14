#!/usr/bin/env bash
heroku config:set DISABLE_COLLECTSTATIC=0
git push heroku video:master
#heroku config:unset DISABLE_COLLECTSTATIC