from django.shortcuts import render
import json
from .models import Post
from django.views import View
from django.http import JsonResponse
from rest_framework import viewsets, status
from .serializer import *
from rest_framework.response import Response
from rest_framework.generics import *
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import *
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework import status

# Create your views here.

