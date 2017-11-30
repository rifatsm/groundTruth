import requests  # pip install requests
from django.shortcuts import get_object_or_404, get_list_or_404, render
from django.http import HttpResponseRedirect
from .models import Region
from django.db.models import F


# @Ri

# @deprecated
def add_region_url(region_pk, access_token):

    #TODO use the region and access_token to route crowdworkers
    param = str(region_pk) + "_" + str(access_token)
    request_parameters = '"https://groundtruth-study3.herokuapp.com/search/?everything=' + param + '"}],'

    #TODO read Region model to get the workers' count
    # region = get_object_or_404(Region, pk=region_pk)

    regions = get_object_or_404(Region)
    for region in regions:
        print region

    return True


def get_region(request):

    #TODO read Region model to get all of the regions

    regions = get_list_or_404(Region)
    for region in regions:
        print str(region.pk) + " -> " + str(region)
        worker = region.workers_count()
        if worker < 3:
            print "worker assigned\n"
            # worker += 1
            Region.objects.filter(pk=region.pk).update(workers=F("workers") + 1)
        else:
            Region.objects.filter(pk=region.pk).update(workers=0)
    print "# After assigning workers:"
    regions = get_list_or_404(Region)
    for region in regions:
        print str(region.pk) + " -> " + str(region)
    return render(request, "ground_truth/_region.html", {})
