from django.http import JsonResponse
from django.http import HttpResponseNotFound, HttpResponse
from django.urls import reverse
from ground_truth.models import Investigation, Region, Subregion, Judgement, CompletedTasks
from django.shortcuts import get_object_or_404, render
import dateutil.parser
import datetime
import hashlib
import os
from .util import isfloat, build_regions, build_sub_regions, verify_in, snap
from .turk import add_mturk_task
from .region import add_region_url
from django.http import HttpResponseRedirect

from .auth import is_logged_in, get_expert_id, get_expert_object, get_username

from django.views.decorators.csrf import csrf_exempt

from decimal import *

# Expected fields for jsons
ADD_INVESTIGATION = [u'lat_start', u'lon_start', u'lat_end', u'lon_end', u'sub_region_width',
                     u'sub_region_height', u'num_sub_regions_width', u'num_sub_regions_height', u'ground_image',
                     u'diagram_image', u'zoom', u'is_tutorial', u"invest_name"]

DRAW_INVESTIGATION = [u'lat_start', u'lon_start', u'lat_end', u'lon_end', u'sub_region_width',
                      u'sub_region_height', u'num_sub_regions_width', u'num_sub_regions_height']


@csrf_exempt
def load_archive_task(request):
    """
    For loading completed past tasks into the database so that past workers cant to tasks again if databases change.
    Use the "load_with_null.py" script to do this. 
    :param request: 
    :return: 
    """
    post = request.POST
    if u'worker' in post and u'task' in post and u'hash_token' in post and u'comments' in post:
        task = post[u'task'].strip()
        token = post[u'hash_token'].strip()
        worker = post[u'worker'].strip()
        comment = post[u'comments'].strip()
        task = CompletedTasks(worker=worker, task_id=task, token=token, comment=comment)
        task.save()
        return HttpResponse(status=200)
    else:
        print("\nBad arguments for loading archived tasks")
        return HttpResponse(status=400)


@csrf_exempt
def get_code(request):
    """
    Generate codes for workers to put into mturk to say that they have completed a task. 
    :param request: 
    :return: 
    """
    post = request.POST
    hash_lib = hashlib.sha1()
    if (u'worker' in post and u'task' in post and u'token' in post and u'comments' in post and u'sub_region' in post):
        task = post[u'task'].strip()
        hash_lib.update(datetime.datetime.now().isoformat())
        worker = post[u'worker'].strip()
        token = post[u'token'].strip()
        comment = post[u'comments'].strip()

        # Load object from the database or return a 404 if not found (prevents internal server error)
        sub_region = get_object_or_404(Subregion, pk=post[u'sub_region'].strip())

        if sub_region.region.access_token != token:
            return HttpResponse(status=400)
        if len(comment) < 1:
            task = CompletedTasks(worker=worker, task_id=task, token=hash_lib.hexdigest())
        else:
            task = CompletedTasks(worker=worker, task_id=task, token=hash_lib.hexdigest(), comment=comment)
        task.save()
        return JsonResponse({"passcode": task.token})
    else:
        print("\nBad arguments for generating task codes")
        return HttpResponse(status=400)


@csrf_exempt
def add_judgment(request):
    """
    Restful code for when a crowd worker makes a judgement on a task. Stores judgement in the database. 
    :param request: 
    :return: 
    """
    # TODO This code does NOT prevent duplicate judgements from a worker on the same sub regions from being saved.
    # I recommend using sessions to resolve that issue

    post = request.POST

    if (u'judgment' in post and u'worker' in post and u'sub_region' in post
        and u'end_time' in post and u'start_time' in post and u'token' in post
        and u'task' in post and u"rotation" in post):

        token = post[u'token'].strip()

        # Load object from the database or return a 404 if not found (prevents internal server error)
        sub_region = get_object_or_404(Subregion, pk=post[u'sub_region'].strip())

        if sub_region.region.access_token != token:  # dont allow them to add a judgement if they don't have a token.
            print("Bad token")
            return HttpResponse(status=400)

        judgement = 2 if request.POST[u"judgment"].strip() == "no" else 3

        start_time_sec = post[u'start_time'].strip()
        end_time_sec = post[u'end_time'].strip()

        worker = post[u'worker'].strip()
        task = post[u'task'].strip()
        rotation = post[u'rotation'].strip()

        # verify that the values in the request are numbers for time
        if start_time_sec.isdigit() and end_time_sec.isdigit():

            Judgement(subregion=sub_region, result=judgement, worker=worker, start_time_sec=int(start_time_sec),
                      end_time_sec=int(end_time_sec), task_id=task, rotation=rotation).save()
            return HttpResponse(status=200)
        else:
            print("400 bad time objects")
            return HttpResponse(status=400)
    else:
        print("400 bad args")
        return HttpResponse(status=400)


@csrf_exempt
def draw_investigation(request):
    """
    Uses snap update what the expert sees on the map such that the 
    subdivision of worker area on the globe is even and perfect
    :param request: 
    :return: 
    """
    post = request.POST

    if not is_logged_in(request):
        HttpResponseRedirect("/")

    if verify_in(post, DRAW_INVESTIGATION):
        lat_start = post[u'lat_start'].strip()
        lon_start = post[u'lon_start'].strip()

        lat_end = post[u'lat_end'].strip()
        lon_end = post[u'lon_end'].strip()

        sub_region_width = post[u'sub_region_width'].strip()
        sub_region_height = post[u'sub_region_height'].strip()

        num_sub_regions_width = post[u'num_sub_regions_width'].strip()
        num_sub_regions_height = post[u'num_sub_regions_height'].strip()
        if (isfloat(lat_start) and isfloat(lon_start) and isfloat(lon_end) and
                isfloat(lat_end) and isfloat(sub_region_width) and isfloat(sub_region_height) and
                isfloat(num_sub_regions_width) and isfloat(num_sub_regions_height)):

            # expand the box that the expert drew on the screeen to fit an integral number of workers.
            lat_start, lon_start, lat_end, lon_end, WIDTH, HEIGHT = snap(lat_start, lon_start, lat_end, lon_end,
                                                                         sub_region_width, sub_region_height,
                                                                         num_sub_regions_width, num_sub_regions_height)

            # this is constructed so that regions can be built and displayed on the screen.
            invest = Investigation(lat_start=lat_start, lon_start=lon_start, lat_end=lat_end, lon_end=lon_end,
                                   expert_id=get_expert_object(request),
                                   datetime_str=datetime.datetime.now().isoformat(),
                                   ground_image="did you really try to save this?")
            regions = build_regions(invest, HEIGHT, WIDTH, -1)  # TODO please don't save this

            res = {
                'investigation_bounds': {
                    'lat_start': invest.lat_start,
                    'lon_start': invest.lon_start,
                    'lat_end': invest.lat_end,
                    'lon_end': invest.lon_end
                },

                # the regions are reported back to the client so they can be drawn on the screen.
                'regions': [
                    {'lat_start': region.lat_start, 'lon_start': region.lon_start, 'lat_end': region.lat_end,
                     'lon_end': region.lon_end} for region in regions
                ]

            }
            return JsonResponse(res)

        else:
            print("parsing problem")
            return HttpResponse(status=400)

    else:
        print("missing args for draw_investigation")
        return HttpResponse(status=400)


@csrf_exempt
def add_investigation(request):
    """
    creats a task for works to do in the database. if MTURK is active then tasks will be created for crowd workers. 
    :param request: 
    :return: 
    """

    post = request.POST
    # print "post: "
    # print post
    # print "ADD_INVESTIGATION: "
    # print ADD_INVESTIGATION

    if not is_logged_in(request):  # don't allow this unless logged in
        HttpResponseRedirect("/")

    if verify_in(post, ADD_INVESTIGATION):

        lat_start = post[u'lat_start'].strip()
        lon_start = post[u'lon_start'].strip()

        lat_end = post[u'lat_end'].strip()
        lon_end = post[u'lon_end'].strip()

        sub_region_width = post[u'sub_region_width'].strip()
        sub_region_height = post[u'sub_region_height'].strip()

        num_sub_regions_width = post[u'num_sub_regions_width'].strip()
        num_sub_regions_height = post[u'num_sub_regions_height'].strip()

        zoom = post[u'zoom']

        if (isfloat(lat_start) and isfloat(lon_start) and isfloat(lon_end) and
                isfloat(lat_end) and isfloat(sub_region_width) and isfloat(sub_region_height) and
                isfloat(num_sub_regions_width) and isfloat(num_sub_regions_height) and int(zoom) > 0):
            zoom = int(zoom)

            # this is the snapped out version of the box drawn by the expert
            # this is done because the work to be divided up among the crowd should be integral
            lat_start, lon_start, lat_end, lon_end, WIDTH, HEIGHT = snap(lat_start, lon_start, lat_end, lon_end,
                                                                         sub_region_width, sub_region_height,
                                                                         num_sub_regions_width, num_sub_regions_height)

            now = datetime.datetime.now()

            ground_image = post[u'ground_image']
            diagram_image = post[u'diagram_image']
            name = post[u"invest_name"].strip()

            # fix dropbox links if using them
            if "https://www.dropbox.com" in ground_image:
                ground_image = ground_image.replace("https://www.dropbox.com", "https://dl.dropboxusercontent.com")

            if "https://www.dropbox.com" in diagram_image:
                diagram_image = diagram_image.replace("https://www.dropbox.com", "https://dl.dropboxusercontent.com")

            # It might be advantageous to add investigations that do not have an expert associated with them them
            # if you would like to do so then allow this API end point to work with unauthenticated requests.
            expert = get_expert_object(request)
            if expert is not None:
                invest = Investigation(lat_start=lat_start, lon_start=lon_start, lat_end=lat_end, lon_end=lon_end,
                                       expert_id=expert, datetime_str=now.isoformat(),
                                       ground_image=ground_image, diagram_image=diagram_image,
                                       name=name)
            else:
                invest = Investigation(lat_start=lat_start, lon_start=lon_start, lat_end=lat_end, lon_end=lon_end,
                                       datetime_str=now.isoformat(), ground_image=ground_image,
                                       diagram_image=diagram_image, name=name)

            # @Ri
            # print "Invest: "
            # print invest
            # invest.save()
            # print "Post: ", post

            # tutorial mode is when a lat, long, diagram_image, ground_image and name are not set for an investigation
            # is_tutorial = True if post[u'is_tutorial'] == u"true" else False

            # @Ri is_tutorial is set to False to run the process
            is_tutorial = False # if post[u'is_tutorial'] == u"true" else False
            if not is_tutorial:
                # print "Invest save"
                invest.save()

            regions = build_regions(invest, HEIGHT, WIDTH, zoom)

            # @Ri
            # print regions

            sub_regions = []

            for region in regions:
                # @Ri
                # region.investigation = invest
                # region.save()

                if not is_tutorial:
                    region.save()
                    # print "Region Saved"
                    print "Region Pk & Access_Token: ", region.pk, region.access_token

                    # @Ri We don't need to call it from here. Rather we are creating an api to get the list of region and their associated workers in region.py
                    # if not add_region_url(region.pk, region.access_token):
                    #     print("failed to add regions to the url")
                    #     return HttpResponse(status=400)

                    # @deprecated This was in previous version. We are not using it for this version
                    # add each region as an MTURK task. (the underlying function handles the configuration)
                    # if not add_mturk_task(region.pk, region.access_token):
                    #     print("failed to add turk task")
                    #     return HttpResponse(status=400)

                for sub in build_sub_regions(region, num_sub_regions_height, num_sub_regions_width):
                    if not is_tutorial:
                        sub.save()
                        # print "Sub Region Saved"

                    sub_regions.append({'lat_start': sub.lat_start, 'lon_start': sub.lon_start, 'lat_end': sub.lat_end,
                                        'lon_end': sub.lon_end, 'id': sub.pk})

            res = {
                'datetime': invest.datetime_str,
                'status': invest.status,
                'ground_image': str(invest.ground_image), #@Ri
                'diagram_image': str(invest.diagram_image), #@Ri
                'bounds': {
                    'lat_start': invest.lat_start,
                    'lon_start': invest.lon_start,
                    'lat_end': invest.lat_end,
                    'lon_end': invest.lon_end
                },
                'sub_regions': sub_regions
            }
            if invest.expert_id != None:
                res['expert_id'] = invest.expert_id.pk
            return JsonResponse(res)

        else:
            print("wrong types")
            return HttpResponse(status=400)
    else:
        print("Debugging Info: query args are missing or are wrong for adding an investigation")
        return HttpResponse(status=400)


def get_sub_region_status(request, sub_region_id):
    """
    API endpoint for polling the status of sub regions that workers are analyzing
    :param request: 
    :param sub_region_id: 
    :return: 
    """

    # dont reveal our secrets
    if not is_logged_in(request):
        HttpResponseRedirect("/")

    judgments = Judgement.objects.filter(subregion_id=sub_region_id)
    if len(judgments) >= 3: # we need at least three to make a Statement (This was one orRachel'ss researchparameterss)
        yes = 0
        for judge in judgments:
            if judge.is_plausible():
                yes += 1 # TODO given that this site is RESTful we may have an instance where we have more than three
                # TODO judgements in the database. This is may occur if a worker refresed a page and then started over
                # TODO or many workers start a hit and then return it. The progress they have made will be stored.
                # TODO making sessions for workers would help with some of these problems. An extreme illustration of
                # TODO this would be 1000 no's and 1 yes. Depending on how the front end renders this it could show
                # TODO up as green.
        return JsonResponse({"status": yes, "sub_region_id": sub_region_id})

    return JsonResponse({"status": -1, "sub_region_id": sub_region_id})


def get_region(request):
    """
    loads a region to be shown to a worker. 
    :param request: 
    :return: 
    """
    PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
    region_id = request.GET.get('region', '-1')
    token = request.GET.get('token', '-1')
    region = get_object_or_404(Region, pk=region_id)

    if region.access_token != token:
        return HttpResponse(status=400)

    # TODO try catches are slow, i need a faster way to do this.
    try:
        subs = region.subregion_set.all()
        result = {
            'id': region_id,
            'investigation_id': region.investigation.pk,
            'bounds': {
                'lat_start': region.lat_start,
                'lon_start': region.lon_start,
                'lat_end': region.lat_end,
                'lon_end': region.lon_end
            },
            'img': os.path.join(PROJECT_ROOT, str(region.investigation.diagram_image)),
            'zoom': region.zoom
        }
        sub_regions = []
        for sub_region in subs:
            sub_regions.append({
                'region_id': region_id,
                'sub_region_id': sub_region.pk,
                'index': sub_region.index,
                'bounds': {
                    'lat_start': sub_region.lat_start,
                    'lon_start': sub_region.lon_start,
                    'lat_end': sub_region.lat_end,
                    'lon_end': sub_region.lon_end
                }

            })
        result['sub_regions'] = sub_regions
        return JsonResponse(result)

    except Region.DoesNotExist:
        print("\nA region was requested that does not exist\n")
        return HttpResponseNotFound("Sub_regions not found")
    except Region.MultipleObjectsReturned:
        print("\nMultiple Regions Exist\n")
        return HttpResponse(status=300)
