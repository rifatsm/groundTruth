from django.http import JsonResponse
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import reverse
from ground_truth.models import Investigation, Region, Subregion, Judgement

def add(request):
	new_region = Region(lat = request.POST["lat"], lon =request.POST["lon"], regions=request.POST["grid"])
	new_region.save()
	return HttpResponseRedirect(reverse('ground_truth:db_dump'))

# def get_next(request):
