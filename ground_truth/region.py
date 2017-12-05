from django.shortcuts import get_object_or_404, redirect, render
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

    region = Region.objects.filter(workers__lte=3)[0]
    param = str(region.pk) + "_" + str(region.access_token)

    task_link = 'https://ground-truth-experts-study.herokuapp.com/search/?everything=' + param
    print task_link

    Region.objects.filter(pk=region.pk).update(workers=F("workers") + 1)

    return render(request, "ground_truth/_region.html", {
        'task_link': task_link
    })
    # return redirect("https://google.com")