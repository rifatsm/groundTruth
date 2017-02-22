from django.http import JsonResponse
from django.http import HttpResponseNotFound, HttpResponse
from django.urls import reverse
from ground_truth.models import Investigation, Region, Subregion, Judgement
from django.shortcuts import get_object_or_404, render
import dateutil.parser
import datetime
from .util import isfloat, build_regions, build_sub_regions

from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def add_judgment(request):
    # TODO THIS IS NOT TESTED FULLY, NEED TO TEST
    post = request.POST
    if (u'judgment' in post and u'worker' in post and u'sub_region' in post
        and u'datetime' in post and u'duration' in post):

        sub_region = get_object_or_404(Subregion, pk=post[u'sub_region'].strip())

        judgement = 2 if request.POST[u"judgment"].strip() == "no" else 3

        date_time = post[u'datetime'].strip()

        # TODO i need a better way to do this
        try:
            dateutil.parser.parse(date_time)
        except ValueError:
            return HttpResponse(status=400)

        duration = post[u'duration'].strip()
        worker = post[u'worker'].strip()
        if duration.isdigit() and worker.isdigit():
            Judgement(subregion=sub_region, result=judgement, worker=worker, datetime_completed_str=date_time,
                      time_duration_ms=duration).save()
            return HttpResponse(status=200)
        else:
            return HttpResponse(status=400)
    else:
        return HttpResponse(status=400)


@csrf_exempt
def add_investigation(request):
    # TODO need to do the image upload
    # TODO im not happy with he helper function structure
    # TODO this could be much shorter

    SUB_REGION_SIZE = 5
    WIDTH = 0.02
    HEIGHT = 0.02

    post = request.POST

    """
    expect post to be composed like this:
    lat_start: #,
    lon_start: #,
    lat_end: #,
    lon_end: #,
    expert_id: #
    """

    if (u'lat_start' in post and u'lon_start' in post and u'lat_end' in post
        and u'lon_end' in post and u'expert_id' in post):

        lat_start = post[u'lat_start'].strip()
        lon_start = post[u'lon_start'].strip()

        lat_end = post[u'lat_end'].strip()
        lon_end = post[u'lon_end'].strip()

        expert_id = post[u'expert_id'].strip()

        if (isfloat(lat_start) and isfloat(lon_start) and isfloat(lon_end) and
                isfloat(lat_end) and expert_id.isdigit() and int(expert_id) > -1):

            lat_start = float(lat_start)
            lon_start = float(lon_start)

            lat_end = float(lat_end)
            lon_end = float(lon_end)

            expert_id = int(expert_id)

            investigation_height = abs(lat_start - lat_end)
            investigation_width = abs(lon_start - lon_end)

            # TODO unsure of behavior in other regions of the globe (written for north america)
            if investigation_width % WIDTH != 0:
                missing = float(investigation_width % WIDTH)
                expand = missing / 2.0

                lon_start =- expand
                lon_end =+ expand

            if investigation_height % HEIGHT != 0:
                missing = float(investigation_height % HEIGHT)
                expand = missing / 2.0

                lat_start =- expand
                lat_end =+ expand

            now = datetime.datetime.now()
            invest = Investigation(lat_start=lat_start, lon_start=lon_start, lat_end=lat_end, lon_end=lon_end,
                                   expert_id=expert_id, datetime_str=now.isoformat(), image="")
            invest.save()

            for region in build_regions(invest, HEIGHT, WIDTH):
                region.save()
                for sub_region in build_sub_regions(region, SUB_REGION_SIZE):
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
    region = get_object_or_404(Region, pk=region_id)

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
            }
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
