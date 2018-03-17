# GroundTruth

## Refer to the study specific branches for studies 1, 2 and 3
 
## Project
This is a python Django project. If you are unfamiliar with 
Django then this is a good starting point: 
https://docs.djangoproject.com/en/1.11/intro/tutorial01/

All development was done in PyCharm. Student licenses are free for the professional version.
I recommend the professional version because it includes database connectors and HTML/CSS/JS support.
https://www.jetbrains.com/pycharm/download/

### Database Schema
![Schema](schema.png?raw=true "Database Schema")

### Environment Variables
This project makes heavy use of environment variables. 
The environment variables for local builds and on Heroku differ.

##### Local Build Variables
Other variables may already exist if you are using pycharm. Just leave them. 
**DO NOT** use non-sandbox urs for local dev.
```bash
HITLayoutId = __the_mturk_layout_id_for_task__
MAGIC_PASS = __the_pass_for_making_an_account_on_the_signup_page__
DB_USER = __database_user_name__
USE_MTURK = False # this not being present or any other value than True will not use Mturk apis. 
HOST = mturk-requester-sandbox.us-east-1.amazonaws.com
SECRET_KEY = __aws_secret_key__ 
ACCESS_KEY = __aws_access_key__
DJANGO_SETTINGS_MODULE = geolocate.settings
endpoint = https://mturk-requester-sandbox.us-east-1.amazonaws.com
DB_PASS = __local_database_password__
HITTypeId = __mturk_hit_type_id__
```

##### Heroku Build Variables
```bash
ACCESS_KEY = __aws_access_key__
DATABASE_URL = __heroku_will_add_this_you_dont_need_to__
endpoint = https://mturk-requester.us-east-1.amazonaws.com
HITLayoutId = __the_mturk_layout_id_for_task__
HITTypeId = __mturk_hit_type_id__
HOST = mturk-requester.us-east-1.amazonaws.com
MAGIC_PASS = __the_pass_for_making_an_account_on_the_signup_page__
PAPERTRAIL_API_TOKEN = __heroku_will_make_and_set_this_for_you__
SECRET_KEY = __aws_secret_key__ 
DISABLE_COLLECTSTATIC = __the_deployment_scripts_set_this__
USE_MTURK = True
```

### Deployment
For local builds Pycharm should automatically detect that it is a Django project. If it does hit the 'play' button to run.
To make database management easier `build_db_from_migration.sh` and `build_db_from_no_migration.sh` have been provided.

`build_db_from_no_migration.sh` assumes that a database called `ground_truth` exists. It assumes that not migrations 
exist in the `ground_truth/migrations` directory. It will make a new 0001.

`build_db_from_migration.sh` creates a database from an existing migration. It assumes that an empty `ground_truth`
database exists. It is written to use the 0001 migration. It has not been tested with other migrations. 

To deploy on heroku use `deploy.sh`. Note, you need to have the correct heroku project set for the heroku CLI and the 
script needs to have the correct local branch set. 

It is **NOT** recommended to change the database scheme on heroku. `heroku_build_db.sh` will setup all the tables from an empty database. 
Use that script when first setting up the project on heroku or when deleting and making a new database.

### Project Notes:
* Python's decimal class is used liberally in this project. Use it wherever lat/lon needs to be represented.  
* Python's internal floating point precession has trouble representing certain values. 
* URL's for the expert view, worker search view and MTURK vary across branches. 

### URLS
The expert URL is: 
`http://your_domein/designate/?ground_image=__ground_image_url__&diagram_image=__diagram_image_url__&lat=__number__&lon=__numer__3&name=name`

The worker UrL is:
`http://domain/search/?everything=regionId_regionToken&workerId=__worker_id__&hitId=__task_id__&acceptTime=__provided_by_mturk__`

The url that is given to Mturk:
An underscore is used instead of & because mturk does not allow that character. 
The keyword `everythin=` has a vlaue of `"region_id"_"token"` for the task that a worker is complete. if the token does not
match the region then it cannot be completed. 

### TODO'S
TODO's are use liberally in the JS and Python. Pycharm will automatically find all of them and allow
easy navigation to them. 

Some important ones:
* **DO NOT** publicly publish the project on Github until the Django secret key is an environment variable in settings.py
* The project does not work without debug mode turned on. Debug mode needs to be turned off.


### @Ri:
# Git: https://github.com/crowd-lab/ground-truth.git

# For an existing Heroku app:
(Reference: https://devcenter.heroku.com/articles/git)
heroku git:remote -a <app_name>
heroku git:remote -a ground-truth-experts-study

### Git push from 'rifatsm' branch to Heroku:
heroku config:set DISABLE_COLLECTSTATIC=0
git push heroku rifatsm:master
heroku config:unset DISABLE_COLLECTSTATIC


# WebLink: https://ground-truth-experts-study.herokuapp.com/



# psql with postgres user:
psql -U postgres

### Push local DB to heroku ###
# 1. Emptying the heroku DB:
heroku pg:reset --confirm ground-truth-experts-study
# 2. Push DB from local to heroku:
heroku pg:push ground_truth_experts_study2 postgresql-curved-84557 --app ground-truth-experts-study

### Pull heroku DB to local ###
# Local database to pull heroku database: ground_truth_experts_study2
# 1. Completely delete local database: dropdb ground_truth_experts_study2
# 2. Pull DB from heroku to local:
heroku pg:pull postgresql-curved-84557 ground_truth_experts_study2 --app ground-truth-experts-study