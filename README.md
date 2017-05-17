#GroundTruth

##Refer to the study specific branches for studies 1, 2 and 3
 
##Project
This is a python Django project. If you are unfamiliar with 
Django then this is a good starting point: 
https://docs.djangoproject.com/en/1.11/intro/tutorial01/

All development was done in PyCharm. Student licenses are free for the professional version.
I recommend the professional version because it includes database connectors and HTML/CSS/JS support.
https://www.jetbrains.com/pycharm/download/

###Database Schema
![Schema](schema.png?raw=true "Database Schema")

###Environment Variables
This project makes heavy use of environment variables. 
The environment variables for local builds and on Heroku differ.

#####Local Build Variables
Other variables may already exist if you are using pycharm. Just leave them. 
**DO NOT** use non-sandbox urs for local dev.
```bash
HITLayoutId = __the_mturk_layout_id_for_task__
MAGIC_PASS = __the_pass_for_making_an_account_on_the_signup_page__
DB_USER = __database_user_name__
USE_MTURK = False
HOST = mturk-requester-sandbox.us-east-1.amazonaws.com
SECRET_KEY = __aws_secret_key__ 
ACCESS_KEY = __aws_access_key__
DJANGO_SETTINGS_MODULE = geolocate.settings
endpoint = https://mturk-requester-sandbox.us-east-1.amazonaws.com
DB_PASS = __local_database_password__
HITTypeId = __mturk_hit_type_id__
```

#####Heroku Build Variables
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
```

###Project Notes:
* Python's decimal class is used liberally in this project. Use it wherever lat/lon needs to be represented.  
* Python's internal floating point percsion has trouble representing certain values. 
* URL's for the expert view, worker search view and MTURK vary across branches. 

###TODO'S
TODO's are use liberally in the JS and Python. Pycharm will automatically find all of them and allow
easy navigation to them. 

Some important ones:
* **DO NOT** publicly publish the project on Github until the Django secret key is an environment variable in settings.py
* The project does not work without debug mode turned on. Debug mode needs to be turned off. 