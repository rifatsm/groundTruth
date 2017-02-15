from django.conf.urls import url

from . import views
from . import api

app_name = 'ground_truth'

urlpatterns = [
	# url(r'^$', views.form, name='form'),
	url(r'^add/$',api.add, name='add'),
	url(r'^$', views.serach, name="search")
]