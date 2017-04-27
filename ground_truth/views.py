from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from .models import Region, Subregion, Judgement, CompletedTasks, Investigation
from .auth import is_logged_in, get_username, not_logged_in_redirect, get_expert_id
from django.http import HttpResponseRedirect

from django.views.decorators.csrf import csrf_exempt


# Create your views here.

def search(request):
    everything = request.GET.get("everything", '')
    everything = everything.split("_")

    # region_id = request.GET.get('region', '-1')
    worker_id = request.GET.get('workerId', '-1')

    if len(everything) == 2:
        region_id = everything[0]
        token = everything[1]
    else:
        return HttpResponse(status=400)

    if (region_id == "-1"):
        return (render(request, "ground_truth/no_search.html", {}))

    region = get_object_or_404(Region, pk=region_id)
    # token = request.GET.get('token', '-1')

    if region.access_token != token:
        return HttpResponse(status=400)

    ids = list(CompletedTasks.objects.values('worker'))
    for id in ids:
        if worker_id == id["worker"]:
            return (render(request, "ground_truth/no_search.html", {}))

    return (render(request, "ground_truth/Search.html", {}))


def designate(request):
    if is_logged_in(request):
        context = {"username": get_username(request)}
        return (render(request, "ground_truth/designate.html", context))
    else:
        return HttpResponseRedirect("/")


def login_form(request):
    if is_logged_in(request):
        return HttpResponseRedirect("/designate/")
    return render(request, "ground_truth/login.html", {})


def singup_form(request):
    if is_logged_in(request):
        return HttpResponseRedirect("/designate/")
    return render(request, "ground_truth/signup.html")


def my_investigations(request):
    if not is_logged_in(request):
        return HttpResponseRedirect(
            "/")  # TODO this will get you if you are not reading what is sent back to the client
    investigations = Investigation.objects.filter(expert_id=get_expert_id(request))
    if (len(investigations) == 0):
        return HttpResponse(status=404)
    context = {'investigations': investigations, "username": get_username(request)}
    return render(request, 'ground_truth/my_investigations.html', context)


@csrf_exempt
def found_it(request):
    if not is_logged_in(request):
        return HttpResponseRedirect("/")
    ground_image = request.GET.get('ground_image', '')
    diagram_image = request.GET.get('diagram_image', '')
    lat = float(request.GET.get('lat', "22.00"))
    lon = float(request.GET.get('lon', "22.00"))
    context = {"lat": lat,
               "lon": lon,
               "username": get_username(request),
               "ground_image": ground_image,
               "diagram_image": diagram_image
               }
    return render(request, 'ground_truth/found_it.html', context)

def instructions(request):
    return render(request, 'ground_truth/instructions.html')
