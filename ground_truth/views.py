from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from .models import Region, Subregion, Judgement, CompletedTasks, Investigation


# Create your views here.

def search(request):
    region_id = request.GET.get('region', '-1')
    worker_id = request.GET.get('workerId', '0')

    if (region_id == "-1"):
        return (render(request, "ground_truth/no_search.html", {}))

    region = get_object_or_404(Region, pk=region_id)
    token = request.GET.get('token', '-1')

    if region.access_token != token:
        return HttpResponse(status=400)

    ids = list(CompletedTasks.objects.values('worker'))
    for id in ids:
        if worker_id == id["worker"]:
            return (render(request, "ground_truth/no_search.html", {}))

    return (render(request, "ground_truth/search.html", {}))


def designate(request):
    return (render(request, "ground_truth/designate.html", {}))


def my_investigations(request, expert_id):
    investigations = Investigation.objects.filter(expert_id=expert_id)
    if (len(investigations) == 0):
        return HttpResponse(status=404)
    context = {'investigations': investigations}
    return render(request, 'ground_truth/my_investigations.html', context)
