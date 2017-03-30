from django.http import JsonResponse
from django.http import HttpResponseNotFound, HttpResponse
from django.urls import reverse
from ground_truth.models import Investigation, Region, Subregion, Judgement, CompletedTasks
from django.shortcuts import get_object_or_404, render
import dateutil.parser
import datetime
import hashlib
from .util import isfloat, build_regions, build_sub_regions, verify_in

from django.views.decorators.csrf import csrf_exempt

from decimal import *

ADD_INVESTIGATION = [u'lat_start', u'lon_start', u'lat_end', u'lon_end', u'expert_id', u'sub_region_width',
                     u'sub_region_height', u'num_sub_regions_width', u'num_sub_regions_height', u'img', u'zoom']

DRAW_INVESTIGATION = [u'lat_start', u'lon_start', u'lat_end', u'lon_end', u'sub_region_width',
                      u'sub_region_height', u'num_sub_regions_width', u'num_sub_regions_height']


@csrf_exempt
def get_code(request):
    post = request.POST

    hash_lib = hashlib.sha1()

    if (u'worker' in post and u'task' in post and u'token' in post and u'comments' in post and u'sub_region' in post):
        task = post[u'task'].strip()
        hash_lib.update(datetime.datetime.now().isoformat())
        worker = post[u'worker'].strip()
        token = post[u'token'].strip()
        comment = post[u'comments'].strip()
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
        return HttpResponse(status=400)


@csrf_exempt
def add_judgment(request):
    # TODO THIS IS NOT TESTED FULLY, NEED TO TEST

    post = request.POST

    if (u'judgment' in post and u'worker' in post and u'sub_region' in post
        and u'end_time' in post and u'start_time' in post and u'token' in post
        and u'task' in post and u"rotation" in post):

        token = post[u'token'].strip()

        sub_region = get_object_or_404(Subregion, pk=post[u'sub_region'].strip())

        if sub_region.region.access_token != token:
            print("Bad token")
            return HttpResponse(status=400)

        judgement = 2 if request.POST[u"judgment"].strip() == "no" else 3

        start_time_sec = post[u'start_time'].strip()
        end_time_sec = post[u'end_time'].strip()

        worker = post[u'worker'].strip()
        task = post[u'task'].strip()
        rotation = post[u'rotation'].strip()
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
    post = request.POST
    """
    expect post to be composed like this:
    lat_start: #,
    lon_start: #,
    lat_end: #,
    lon_end: #,
    sub_region_width: #,
    sub_region_height: #,
    num_sub_regions_width: #,
    num_sub_regions_height: #,
    """
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

            lat_start = Decimal(lat_start).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)
            lon_start = Decimal(lon_start).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)

            lat_end = Decimal(lat_end).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)
            lon_end = Decimal(lon_end).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)

            sub_region_width = Decimal(sub_region_width).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)
            sub_region_height = Decimal(sub_region_height).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)

            num_sub_regions_width = Decimal(num_sub_regions_width).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)
            num_sub_regions_height = Decimal(num_sub_regions_height).quantize(Decimal('.000001'),
                                                                              rounding=ROUND_HALF_UP)

            WIDTH = num_sub_regions_width * sub_region_width
            HEIGHT = num_sub_regions_height * sub_region_height

            investigation_height = (
                Decimal(abs(lat_start - lat_end)).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))
            investigation_width = (
                Decimal(abs(lon_start - lon_end)).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))

            if investigation_width % WIDTH != 0.0:
                missing = WIDTH - (
                    Decimal(investigation_width % WIDTH).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))
                expand = missing / (Decimal(2.0).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))

                lon_start = lon_start - expand
                lon_end = lon_end + expand

            if investigation_height % HEIGHT != 0.0:
                missing = HEIGHT - (
                    Decimal(investigation_height % HEIGHT).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))
                expand = missing / (Decimal(2.0).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))

                lat_start = lat_start - expand
                lat_end = lat_end + expand

            invest = Investigation(lat_start=lat_start, lon_start=lon_start, lat_end=lat_end, lon_end=lon_end,
                                   expert_id="-1", datetime_str=datetime.datetime.now().isoformat(),
                                   image="did you really try to save this?")
            regions = build_regions(invest, HEIGHT, WIDTH, -1)  # TODO please dont save this

            res = {
                'investigation_bounds': {
                    'lat_start': invest.lat_start,
                    'lon_start': invest.lon_start,
                    'lat_end': invest.lat_end,
                    'lon_end': invest.lon_end
                },
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
    # TODO im not happy with he helper function structure
    # TODO this could be much shorter

    post = request.POST

    """
    expect post to be composed like this:
    lat_start: #,
    lon_start: #,
    lat_end: #,
    lon_end: #,
    expert_id: #,
    sub_region_width: #,
    sub_region_height: #,
    num_sub_regions_width: #,
    num_sub_regions_height: #,
    zoom: #,
    is_dropbox, # this is optional, if not pressent we assume that you are using dropbox
    img: image_url in dopbox
    
    """
    if verify_in(post, ADD_INVESTIGATION):

        lat_start = post[u'lat_start'].strip()
        lon_start = post[u'lon_start'].strip()

        lat_end = post[u'lat_end'].strip()
        lon_end = post[u'lon_end'].strip()

        sub_region_width = post[u'sub_region_width'].strip()
        sub_region_height = post[u'sub_region_height'].strip()

        num_sub_regions_width = post[u'num_sub_regions_width'].strip()
        num_sub_regions_height = post[u'num_sub_regions_height'].strip()

        expert_id = post[u'expert_id'].strip()

        zoom = post[u'zoom']

        if (isfloat(lat_start) and isfloat(lon_start) and isfloat(lon_end) and
                isfloat(lat_end) and expert_id.isdigit() and int(expert_id) > -1
            and isfloat(sub_region_width) and isfloat(sub_region_height) and
                isfloat(num_sub_regions_width) and isfloat(num_sub_regions_height) and int(zoom) > 0):

            lat_start = Decimal(lat_start).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)
            lon_start = Decimal(lon_start).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)

            lat_end = Decimal(lat_end).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)
            lon_end = Decimal(lon_end).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)

            sub_region_width = Decimal(sub_region_width).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)
            sub_region_height = Decimal(sub_region_height).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)

            num_sub_regions_width = Decimal(num_sub_regions_width).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP)
            num_sub_regions_height = Decimal(num_sub_regions_height).quantize(Decimal('.000001'),
                                                                              rounding=ROUND_HALF_UP)

            WIDTH = num_sub_regions_width * sub_region_width
            HEIGHT = num_sub_regions_height * sub_region_height

            expert_id = int(expert_id)

            zoom = int(zoom)

            investigation_height = (
                Decimal(abs(lat_start - lat_end)).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))
            investigation_width = (
                Decimal(abs(lon_start - lon_end)).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))

            if investigation_width % WIDTH != 0.0:
                missing = WIDTH - (
                    Decimal(investigation_width % WIDTH).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))
                expand = missing / (Decimal(2.0).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))

                lon_start = lon_start - expand
                lon_end = lon_end + expand

            if investigation_height % HEIGHT != 0.0:
                missing = HEIGHT - (
                    Decimal(investigation_height % HEIGHT).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))
                expand = missing / (Decimal(2.0).quantize(Decimal('.000001'), rounding=ROUND_HALF_UP))

                lat_start = lat_start - expand
                lat_end = lat_end + expand

            now = datetime.datetime.now()

            img_url = post[u'img']

            if (u'is_dropbox' in post and (post[u'is_dropbox'] or post[u'is_dropbox'].strip() == u'true'
                                           or post[u'is_dropbox'].strip() == u'True')) or u'is_dropbox' not in post:
                # TODO the default is to assume usig dropbox
                # TODO the user could not be smart and click that box and not have it be a dropbox url, lets fix that here as well
                img_url = img_url.replace("https://www.dropbox.com", "https://dl.dropboxusercontent.com")

            invest = Investigation(lat_start=lat_start, lon_start=lon_start, lat_end=lat_end, lon_end=lon_end,
                                   expert_id=expert_id, datetime_str=now.isoformat(), image=img_url)
            invest.save()

            regions = build_regions(invest, HEIGHT, WIDTH, zoom)

            for region in regions:
                region.save()
                for sub_region in build_sub_regions(region, num_sub_regions_height, num_sub_regions_width):
                    sub_region.save()

            res = {
                'id': invest.pk,
                'expert_id': invest.expert_id,
                'datetime': invest.datetime_str,
                'status': invest.status,
                'image': invest.image,
                'bounds': {
                    'lat_start': invest.lat_start,
                    'lon_start': invest.lon_start,
                    'lat_end': invest.lat_end,
                    'lon_end': invest.lon_end
                }
            }
            return JsonResponse(res)

        else:
            return HttpResponse(status=400)
    else:
        return HttpResponse(status=400)


def get_region(request):
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
            'img': region.investigation.image,
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
        return HttpResponseNotFound("Sub_regions not found")
    except Region.MultipleObjectsReturned:
        return HttpResponse(status=300)
