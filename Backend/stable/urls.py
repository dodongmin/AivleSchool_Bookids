from django.urls import path
from .views import *
 
urlpatterns = [
    path('api/generate_image/', generate_image, name='generate_image'),
    path('api/generate_quiz_image/', generate_quiz_image, name='generate_quiz_image'),
]