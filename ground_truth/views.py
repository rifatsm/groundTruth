from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from .models import Region, Subregion, Judgement, CompletedTasks, Investigation
from .auth import is_logged_in, get_username
from django.http import HttpResponseRedirect


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


def my_investigations(request, expert_id):
    if not is_logged_in(request):
        return HttpResponseRedirect(
            "/")  # TODO this will get you if you are not reading what is sent back to the client
    investigations = Investigation.objects.filter(expert_id=expert_id)
    if (len(investigations) == 0):
        return HttpResponse(status=404)
    context = {'investigations': investigations}
    return render(request, 'ground_truth/my_investigations.html', context)
