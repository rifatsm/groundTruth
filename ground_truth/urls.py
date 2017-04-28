from django.conf.urls import url

from . import views
from . import api
from . import auth

app_name = 'ground_truth'

urlpatterns = [

    # map API endpoints
    url(r'^add_judgment/$', api.add_judgment, name='add_judgment'),
    url(r'^add_investigation/$', api.add_investigation, name="add_investigation"),
    url(r'^draw_investigation/$', api.draw_investigation, name="draw_investigation"),
    url(r'^region/$', api.get_region, name='get_region'),
    url(r'^get_code/$', api.get_code, name='get_code'),

    # expert API endpoints
    url(r'^login/$', auth.login_manager, name="login_manager"),
    url(r'^logout/$', auth.logout_manager, name="logout_manager"),
    url(r'^add_expert/$', auth.add_expert, name="add_expert"),
    url(r'^judgement/(\d+)/$', api.get_sub_region_status, name="judgement"),
    url(r'^investigation/(\d+)/$', api.get_investigation, name='gahhh'),

    # expert views
    url(r'designate/$', views.designate, name="designate"),
    url(r'^$', views.login_form, name="login"),
    # url(r'^user/investigations/$', views.my_investigations, name='my_investigations'),
    url(r'^signup/$', views.singup_form, name="signup"),
    url(r'^foundit/$', views.found_it, name="foundit"),
    url(r'^instructions/$', views.instructions, name="instructions"),
    url(r'^how_to/$', views.how_to, name="how_to"),

    # worker views
    url(r'^search/$', views.search, name="search"),

    # util
    url(r'^load_archive_task/$', api.load_archive_task, name="load_archive_task")
]
