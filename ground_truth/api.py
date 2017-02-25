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
        and u'lon_end' in post and u'expert_id' in post and u'sub_region_width' in post
        and u'sub_region_height' in post and u'num_sub_regions_width' in post and u'num_sub_regions_height' in post):

        lat_start = post[u'lat_start'].strip()
        lon_start = post[u'lon_start'].strip()

        lat_end = post[u'lat_end'].strip()
        lon_end = post[u'lon_end'].strip()

        sub_region_width = post[u'sub_region_width'].strip()
        sub_region_height = post[u'sub_region_height'].strip()

        num_sub_regions_width = post[u'num_sub_regions_width'].strip()
        num_sub_regions_height = post[u'num_sub_regions_height'].strip()

        expert_id = post[u'expert_id'].strip()

        if (isfloat(lat_start) and isfloat(lon_start) and isfloat(lon_end) and
                isfloat(lat_end) and expert_id.isdigit() and int(expert_id) > -1
                and isfloat(sub_region_width) and isfloat(sub_region_height) and
                isfloat(num_sub_regions_width) and isfloat(num_sub_regions_height)):

            lat_start = round(float(lat_start), 6)
            lon_start = round(float(lon_start), 6)

            lat_end = round(float(lat_end), 6)
            lon_end = round(float(lon_end), 6)

            sub_region_width = round(float(sub_region_width), 6)
            sub_region_height = round(float(sub_region_height), 6)

            num_sub_regions_width = round(float(num_sub_regions_width), 6)
            num_sub_regions_height = round(float(num_sub_regions_height), 6)

            WIDTH = num_sub_regions_width * sub_region_width
            HEIGHT = num_sub_regions_height * sub_region_height

            expert_id = int(expert_id)

            investigation_height = abs(lat_start - lat_end)
            investigation_width = abs(lon_start - lon_end)

            if investigation_width % WIDTH != 0:
                missing = WIDTH - float(investigation_width % WIDTH)
                expand = missing / 2.0

                lon_start = round(lon_start - expand, 6)
                lon_end = round(lon_end + expand, 6)

                # print(abs(lon_start - lon_end) / WIDTH)
                # print(abs(lon_start - lon_end))

            if investigation_height % HEIGHT != 0:
                missing = HEIGHT - float(investigation_height % HEIGHT)
                expand = missing / 2.0

                lat_start = round(lat_start - expand, 6)
                lat_end = round(lat_end + expand, 6)

            now = datetime.datetime.now()
            invest = Investigation(lat_start=lat_start, lon_start=lon_start, lat_end=lat_end, lon_end=lon_end,
                                   expert_id=expert_id, datetime_str=now.isoformat(), image="")
            invest.save()

            regions = build_regions(invest, HEIGHT, WIDTH)

            for region in regions:
                region.save()
                print("helpppas fklasjfjlkasjflkasjflkasjlkfsjklfjklasklasdfjklasdf")
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
