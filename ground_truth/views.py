from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from .models import Region, Subregion, Judgement, CompletedTasks, Investigation
from .auth import is_logged_in, get_username, not_logged_in_redirect, get_expert_id
from django.http import HttpResponseRedirect

from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from django.conf import settings

from django.views.decorators.clickjacking import xframe_options_exempt


# Create your views here.

@xframe_options_exempt
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

# for multiple expert designate views
def designate1(request):
    if is_logged_in(request):
        context = {"username": get_username(request)}
        return (render(request, "ground_truth/designate1.html", context))
    else:
        return HttpResponseRedirect("/")

def designate2(request):
    if is_logged_in(request):
        context = {"username": get_username(request)}
        return (render(request, "ground_truth/designate2.html", context))
    else:
        return HttpResponseRedirect("/")

def designate3(request):
    if is_logged_in(request):
        context = {"username": get_username(request)}
        return (render(request, "ground_truth/designate3.html", context))
    else:
        return HttpResponseRedirect("/")
# extra view in case of missing the first designate view
def designate4(request):
    if is_logged_in(request):
        context = {"username": get_username(request)}
        return (render(request, "ground_truth/designate4.html", context))
    else:
        return HttpResponseRedirect("/")


def login_form(request):
    if is_logged_in(request):
        return HttpResponseRedirect("/instructions/")
    return render(request, "ground_truth/login.html", {})


def singup_form(request):
    if is_logged_in(request):
        return HttpResponseRedirect("/experiment_choice/")
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


@xframe_options_exempt
@csrf_exempt
def found_it(request):

    # if not is_logged_in(request):
    #     return HttpResponseRedirect("/")
    # ground_image = request.GET.get('ground_image', '')
    # diagram_image = request.GET.get('diagram_image', '')
    # lat = float(request.GET.get('lat', "22.00"))
    # lon = float(request.GET.get('lon', "22.00"))
    # context = {"lat": lat,
    #            "lon": lon,
    #            "username": get_username(request),
    #            "ground_image": ground_image,
    #            "diagram_image": diagram_image
    #            }
    return render(request, 'ground_truth/found_it.html', context)

def instructions(request):
    return render(request, 'ground_truth/instructions.html', {})

def how_to(request):
    return render(request, 'ground_truth/how_to_do.html')

def experiment_choice(request):
    return render(request, 'ground_truth/experiment_choice.html')

@xframe_options_exempt
def tutorial(request):
    return render(request, 'ground_truth/tutorial_page.html')

# The following method uploads the file to the MEDIA_ROOT and returns image name to the same view
def image_upload1(request):
    if not is_logged_in(request):
        return HttpResponseRedirect("/")
    # Uploading GroundLevel Image
    if request.method == 'POST' and request.FILES['myfile_gl'] and request.FILES['myfile_di']:
        myfile_gl = request.FILES['myfile_gl']
        myfile_di = request.FILES['myfile_di']
        # fs = FileSystemStorage('/Users/annehoang12/ground-truth/ground_truth/static/ground_truth/img/expert1/ground_level_img/')
        fs = FileSystemStorage(location = settings.FS_IMAGE_UPLOADS, base_url= settings.FS_IMAGE_URL)
        if fs.exists("ground_level_img_1.jpg"):
            fs.delete("ground_level_img_1.jpg")
        filename = fs.save("ground_level_img_1.jpg", myfile_gl)
        # uploaded_file_url = fs.url(filename)
        # short_url = uploaded_file_url.rsplit('/', 1)[-1]
        fs_d = FileSystemStorage()
        if fs_d.exists("diagram_1.jpg"):
            fs_d.delete("diagram_1.jpg")
        filename = fs_d.save("diagram_1.jpg", myfile_di)
        return render(request, 'ground_truth/designate1.html')
    # Uploading Diagram Image
    # if request.method == 'POST' and request.FILES['myfile_di']:
    #     myfile_di = request.FILES['myfile_di']
    #     fs = FileSystemStorage()
    #     # filename = fs.save(myfile_di.name, myfile_di)
    #     filename = fs.save("diagram_1.jpg", myfile_di)
    #     uploaded_file_url = fs.url(filename)
    #     short_url = uploaded_file_url.rsplit('/', 1)[-1]
    #     return render(request, 'ground_truth/designate1.html', {
    #         'short_url': short_url
    #     })
    return render(request, 'ground_truth/image_upload1.html')
    #("<h1>Hello</h1>")

def image_upload2(request):
    if not is_logged_in(request):
        return HttpResponseRedirect("/")
    if request.method == 'POST' and request.FILES['myfile']:
        myfile = request.FILES['myfile']
        fs = FileSystemStorage()
        # filename = fs.save(myfile.name, myfile)
        if fs.exists("diagram_2.jpg"):
            fs.delete("diagram_2.jpg")
        filename = fs.save("diagram_2.jpg", myfile)
        uploaded_file_url = fs.url(filename)
        short_url = uploaded_file_url.rsplit('/', 1)[-1]
        return render(request, 'ground_truth/designate2.html', {
            'short_url': short_url
        })
    return render(request, 'ground_truth/image_upload2.html')

def image_upload3(request):
    if not is_logged_in(request):
        return HttpResponseRedirect("/")
    if request.method == 'POST' and request.FILES['myfile']:
        myfile = request.FILES['myfile']
        fs = FileSystemStorage()
        # filename = fs.save(myfile.name, myfile)
        if fs.exists("diagram_3.jpg"):
            fs.delete("diagram_3.jpg")
        filename = fs.save("diagram_3.jpg", myfile)
        uploaded_file_url = fs.url(filename)
        short_url = uploaded_file_url.rsplit('/', 1)[-1]
        return render(request, 'ground_truth/designate3.html', {
            'short_url': short_url
        })
    return render(request, 'ground_truth/image_upload3.html')

def image_upload4(request):
    if not is_logged_in(request):
        return HttpResponseRedirect("/")
    if request.method == 'POST':

        try:
            myfile = request.FILES['myfile']
        except KeyError:
            myfile = "Empty"
            return render(request, 'ground_truth/image_upload4.html')
        fs = FileSystemStorage()
        # filename = fs.save(myfile.name, myfile)
        if fs.exists("diagram_4.jpg"):
            fs.delete("diagram_4.jpg")
        if myfile != "Empty":
            filename = fs.save("diagram_4.jpg", myfile)
        uploaded_file_url = fs.url(filename)
        short_url = uploaded_file_url.rsplit('/', 1)[-1]
        return render(request, 'ground_truth/designate4.html', {
            'short_url': short_url
        })
    return render(request, 'ground_truth/image_upload4.html')