from django.shortcuts import get_object_or_404, redirect, render
from .models import Region
from django.db.models import F

from django.views.decorators.clickjacking import xframe_options_exempt

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

@xframe_options_exempt
def get_region(request):

    #TODO read Region model to get all of the regions


    hit_id = request.GET.get('hitId')
    worker_id = request.GET.get('workerId')
    assignment_id = request.GET.get('assignmentId')

    if Region.objects.filter(workers__lte=2).exists():

        region = Region.objects.filter(workers__lte=2)[0]
        param = str(region.pk) + "_" + str(region.access_token)

        task_param = '&hitId=' + str(hit_id) + '&workerId=' + str(worker_id) + '&assignmentId=' + str(assignment_id)

        # task_link = 'https://ground-truth-experts-study.herokuapp.com/search/?everything=' + param + task_param
        task_link = 'https://ground-truth-mock.herokuapp.com/search/?everything=' + param + task_param
        # print task_link

        Region.objects.filter(pk=region.pk).update(workers=F("workers") + 1)

        return render(request, "ground_truth/_region.html", {
            'task_link': task_link,
            'hit_id': hit_id,
            'worker_id': worker_id,
            'assignment_id': assignment_id,
            'task_param': task_param
        })
    else:
        # task_link = "NA"
        return render(request, "ground_truth/_no_region.html"
                    )
    # return redirect("https://google.com")