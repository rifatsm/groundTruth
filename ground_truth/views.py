from django.shortcuts import render
from django.http import HttpResponse
from .models import Region

# Create your views here.

def serach(request):
	return (render(request, "ground_truth/search.html", {}))