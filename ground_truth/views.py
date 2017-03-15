from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from .models import Region, Subregion, Judgement, CompletedTasks


# Create your views here.

def search(request):
    region_id = request.GET.get('region', '-1')
    worker_id = request.GET.get('workerId', '0')
    region = get_object_or_404(Region, pk=region_id)
    token = request.GET.get('token', '-1')

    if region.access_token != token:
        return HttpResponse(status=400)

    ids = list(CompletedTasks.objects.values('worker'))
    for id in ids:
        if worker_id == id["worker"]:
            return (render(request, "ground_truth/no_search.html", {}))



    # TODO we need to check that works are not doing tasks twice. send them a different view.

    return (render(request, "ground_truth/Search.html", {}))


# def region_search(request, digit):
#     region = get_object_or_404(Region, pk=digit)
#     subs = region.subregion_set.all()
#     context = {
#         'id': digit,
#         'region': region,
#         'sub_regions': subs
#
#     }
#     return (render(request, "ground_truth/region_search.html", context))
