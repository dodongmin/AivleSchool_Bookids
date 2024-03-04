from django.urls import path, include
from rest_framework import routers
from .views import *
from product.views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from django.contrib.auth.views import LoginView

# router = routers.DefaultRouter()
# router.register('BookList', BookViewSet)
# router.register('BookDetail', BookDetailViewSet, basename='BookDetail')


urlpatterns = [
    
    path('BookList/', BookListView.as_view()),
    path('BookList/<int:pk>/', BookListDetailView.as_view()),

    path('BookDetail/<int:BookList_id>/', BookDetailView.as_view()),
    path('QuizList/', QuizListView.as_view()),
    path('WordList/', WordListView.as_view()),
    path('AiAudioList/', AiAudioListView.as_view()),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('user/<int:pk>/', GetUser.as_view(), name='login'),
    path('signup/', CreateUserView.as_view(), name='signup'),

    path('posts/', Postview.as_view()),
    path('posts/<int:pk>/', postRetrieveview.as_view()),
    path('posts/<int:pk>/comment/',commentuploadview.as_view()),
    path('posts/<int:pk>/', postRetrieveview.as_view()),
    path('comment/', CommentCreateView.as_view()),

    path('ChatGPT/Question/', ChatGPT_Question.as_view()),
    path('ChatGPT/Feedback/', ChatGPT_Feedback.as_view()),
    path('TextToSpeech/', TextToSpeech.as_view()),
    
    
    path('user/<int:pk>/learningstatus/', LearningStatusview.as_view()),
    path('user/<int:pk>/readingstatus/', ReadingStatusview.as_view()),
    path('ReadingStatus/', ReadingStatusCreateView.as_view()),
    path('posts/media/', PostMediaView.as_view()),
    path('LearningStatus/', LearningStatusCreateView.as_view())
]
