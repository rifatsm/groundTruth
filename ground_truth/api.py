from django.http import JsonResponse
from django.http import HttpResponseNotFound, HttpResponse
from django.urls import reverse
from ground_truth.models import Investigation, Region, Subregion, Judgement, CompletedTasks
from django.shortcuts import get_object_or_404, render
import dateutil.parser
import datetime
import hashlib
from .util import isfloat, build_regions, build_sub_regions, verify_in
from .turk import add_mturk_task
from django.http import HttpResponseRedirect

from .auth import is_logged_in, get_expert_id, get_expert_object, get_username, backdoor_valnerabilty

from django.views.decorators.csrf import csrf_exempt

from decimal import *

ADD_INVESTIGATION = [u'lat_start', u'lon_start', u'lat_end', u'lon_end', u'sub_region_width',
                     u'sub_region_height', u'num_sub_regions_width', u'num_sub_regions_height', u'ground_image',
                     u'diagram_image', u'zoom', u'is_tutorial']

DRAW_INVESTIGATION = [u'lat_start', u'lon_start', u'lat_end', u'lon_end', u'sub_region_width',
                      u'sub_region_height', u'num_sub_regions_width', u'num_sub_regions_height']


@csrf_exempt
def load_archive_task(request):
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
        print("bad args")
        return HttpResponse(status=400)


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

    if not is_logged_in(request):
        HttpResponseRedirect("/")

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
                                   expert_id=get_expert_object(request),
                                   datetime_str=datetime.datetime.now().isoformat(),
                                   ground_image="did you really try to save this?")
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

    # TODO If you miss the old version of this function then go find it on github cause im changing it.

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
    zoom: #,
    is_dropbox, # this is optional, if not pressent we assume that you are using dropbox
    img: image_url in dopbox
    
    """

    if not is_logged_in(request):
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

            ground_image = post[u'ground_image']
            diagram_image = post[u'diagram_image']

            if "https://www.dropbox.com" in ground_image:
                ground_image = ground_image.replace("https://www.dropbox.com", "https://dl.dropboxusercontent.com")

            if "https://www.dropbox.com" in diagram_image:
                diagram_image = diagram_image.replace("https://www.dropbox.com", "https://dl.dropboxusercontent.com")

            # TODO Take out
            use_me = backdoor_valnerabilty(1)


            invest = Investigation(lat_start=lat_start, lon_start=lon_start, lat_end=lat_end, lon_end=lon_end,

                                   # expert_id=get_expert_object(request),
                                   expert_id =use_me,
                                   datetime_str=now.isoformat(),
                                   ground_image=ground_image, diagram_image=diagram_image,
                                   name=post[u"invest_name"].strip()) # TODO fix this shit

            is_tutorial = True if post[u'is_tutorial'] == u"true" else False
            if not is_tutorial:
                invest.save()

            regions = build_regions(invest, HEIGHT, WIDTH, zoom)

            sub_regions = []

            for region in regions:
                if not is_tutorial:
                    region.save()
                    if not add_mturk_task(region.pk, region.access_token):
                        print("failed to add turk task")
                        return HttpResponse(status=400)

                for sub in build_sub_regions(region, num_sub_regions_height, num_sub_regions_width):
                    if not is_tutorial:
                        sub.save()

                    sub_regions.append({'lat_start': sub.lat_start, 'lon_start': sub.lon_start, 'lat_end': sub.lat_end,
                                        'lon_end': sub.lon_end, 'id': sub.pk})

            res = {
                'expert_id': invest.expert_id.pk,
                'datetime': invest.datetime_str,
                'status': invest.status,
                'ground_image': invest.ground_image,
                'diagram_image': invest.diagram_image,
                'bounds': {
                    'lat_start': invest.lat_start,
                    'lon_start': invest.lon_start,
                    'lat_end': invest.lat_end,
                    'lon_end': invest.lon_end
                },
                'sub_regions': sub_regions
            }
            return JsonResponse(res)

        else:
            print("wrong types")
            return HttpResponse(status=400)
    else:
        print("missing args or they are wrong")
        return HttpResponse(status=400)


def get_sub_region_status(request, sub_region_id):
    if not is_logged_in(request):
        HttpResponseRedirect("/")

    judgments = Judgement.objects.filter(subregion_id=sub_region_id)
    if len(judgments) == 3:
        yes = 0
        for judge in judgments:
            if judge.is_plausible():
                yes += 1
        return JsonResponse({"status": yes, "sub_region_id": sub_region_id})
    return JsonResponse({"status": len(judgments), "sub_region_id": sub_region_id})


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
            'img': region.investigation.diagram_image,
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

def get_investigation(request, id):
    invest = get_object_or_404(Investigation, pk=id)
    subs = []
    try:
        regions = invest.region_set.all()

        for region in regions:
            go = Subregion.objects.filter(region_id=region.pk)
            for sub in go:
                subs.append({
                    "lat_start": sub.lat_start,
                    "lon_start": sub.lon_start,
                    "lat_end": sub.lat_end,
                    "lon_end": sub.lon_end,
                    "id": sub.pk
                })
        res = {
            "diagram_image": invest.diagram_image,
            "ground_image": invest.ground_image,
            "sub_regions": subs
        }
        return JsonResponse(res)
    except:
        print('we shit the bed')
        return HttpResponse(status=500)


