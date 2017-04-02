from django.http import JsonResponse
from django.http import HttpResponseNotFound, HttpResponse
from django.urls import reverse
from ground_truth.models import Investigation, Region, Subregion, Judgement, CompletedTasks
from django.shortcuts import get_object_or_404, render
import os
from django.http import HttpResponseRedirect
from django.contrib.auth.models import User


# How we handle logging in and logging out
def login_manager(request):
    post = request.POST
    try:
        expert = User.objects.get(username=post["username"])
        if expert.check_password(post["password"]):
            request.session["logged_in"] = True
            request.session['username'] = post["username"]
            return HttpResponseRedirect("/designate/")
        else:
            return HttpResponseRedirect("/")
    except User.DoesNotExist:
        return HttpResponseRedirect("/")


def logout_manager(request):
    try:
        del request.session["logged_in"]
        del request.session['username']
    except KeyError:
        pass
    return HttpResponseRedirect("/")


# Expert helper methods
def is_logged_in(request):
    try:
        return request.session["logged_in"]
    except KeyError:
        return False


def get_username(request):
    if is_logged_in(request):
        return request.session['username']
    else:
        return None


def is_expert(username):
    try:
        User.objects.get(username=username)
        return True
    except User.DoesNotExist:
        return False


def get_expert_object(username):
    if is_expert(username):
        return User.objects.get(username=username)
    else:
        return None


# add an expert
def add_expert(request):
    if is_logged_in(request):
        return HttpResponseRedirect("/")
    elif is_expert(request.POST["username"]):
        return login_manager(request)
    else:
        new_expert = User(username=request.POST["username"])
        new_expert.set_password(request.POST["password"])
        new_expert.save()
        return login_manager(request)
