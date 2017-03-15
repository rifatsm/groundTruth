from django.conf.urls import url

from . import views
from . import api

app_name = 'ground_truth'

urlpatterns = [
    url(r'^add_judgment/$', api.add_judgment, name='add_judgment'),
    url(r'add_investigation/$', api.add_investigation, name="add_investigation"),
    url(r'^region/$', api.get_region, name='get_region'),
    url(r'^$', views.search, name="search"),
    url(r'^get_code/', api.get_code, name='get_code')
]
