from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from .models import Region, Subregion, Judgement


# Create your views here.

def serach(request):
    return (render(request, "ground_truth/search.html", {}))


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
