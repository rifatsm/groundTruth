from django.shortcuts import render
from django.http import HttpResponse
from .models import Region

# Create your views here.



def form(request):
	return render(request, "ground_truth/form.html", {})

def db_dump(request):
	all_records = Region.objects.all()
	print(all_records)
	return render(request, "ground_truth/db_dump.html", {'all_records': all_records})

def serach(request):
	return (render(request, "ground_truth/search.html", {}))