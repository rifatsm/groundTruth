from django.http import JsonResponse
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import reverse
from ground_truth.models import Investigation, Region, Subregion, Judgement
from django.shortcuts import get_object_or_404, render

from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def add(request):

    sub = get_object_or_404(Subregion, pk=2)

    judge = 2 if request.POST[u"judgment"] == "no" else 3
    region = Judgement(subregion=sub,
                       result=judge,
                       worker=request.POST[u'worker'],
                       time_duration=request.POST[u'time'])
    region.save()
    return HttpResponse("return this string")

# def get_next(request):
