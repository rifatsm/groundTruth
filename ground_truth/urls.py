from django.conf.urls import url

from . import views
from . import api
from . import auth
from . import region

app_name = 'ground_truth'

urlpatterns = [

    # map API endpoints
    url(r'^add_judgment/$', api.add_judgment, name='add_judgment'),
    url(r'^add_investigation/$', api.add_investigation, name="add_investigation"),
    url(r'^draw_investigation/$', api.draw_investigation, name="draw_investigation"),
    url(r'^region/$', api.get_region, name='get_region'),
    url(r'^region_url/$', region.get_region, name='region'),
    url(r'^tutorial/$', views.tutorial, name='tutorial'),
    url(r'^preview_instructions/$', views.preview_instructions, name='preview_instructions'),
    url(r'^waiting/$', views.waiting, name='waiting'),
    url(r'^get_code/$', api.get_code, name='get_code'),

    # expert API endpoints
    url(r'^login/$', auth.login_manager, name="login_manager"),
    url(r'^logout/$', auth.logout_manager, name="logout_manager"),
    url(r'^add_expert/$', auth.add_expert, name="add_expert"),
    url(r'^judgement/(\d+)/$', api.get_sub_region_status, name="judgement"),

    # expert views
    url(r'^$', views.login_form, name="login"),

    url(r'experiment_choice/$', views.experiment_choice, name="experiment_choice"),

    url(r'designate1/$', views.designate1, name="designate1"),
    url(r'designate2/$', views.designate2, name="designate2"),
    url(r'designate3/$', views.designate3, name="designate3"),
    url(r'designate4/$', views.designate4, name="designate4"),

    url(r'^image_upload1/$', views.image_upload1, name="image_upload1"),
    url(r'^image_upload2/$', views.image_upload2, name="image_upload2"),
    url(r'^image_upload3/$', views.image_upload3, name="image_upload3"),
    url(r'^image_upload4/$', views.image_upload4, name="image_upload4"),

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
