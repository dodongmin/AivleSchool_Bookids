from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets
from product.models import *
from .serializer import *
from rest_framework.generics import *
from django.views.generic.list import BaseListView
from django.views.generic.detail import BaseDetailView
from rest_framework.response import Response
from django.http import HttpResponse, JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import *
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.filters import OrderingFilter
import requests
from datetime import datetime, timedelta

import io
from PIL import Image
from django.core.files.base import ContentFile
from io import BytesIO
import json
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter
import random
from .api import *

class PostCustomPagination(PageNumberPagination):
    page_size = 7
    max_page_size = 100

class BookDetailCustomPagination(PageNumberPagination):
    page_size = 1
    max_page_size = 100

class TextToSpeech(APIView):
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def post(self, request):
        

        # ChatGPT API 사용하는 부분
        
        file_path = TTS(request.data['content'])
        
        return Response({"file_path": file_path})

class ChatGPT_Question(APIView):
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def post(self, request):
        # 랜덤 줄거리를 가지고 오는 부분
        bookid = request.data['bookid']
        bookDetail = BookDetail.objects.filter(BookList=bookid)
        content_list = [book.content for book in bookDetail]
        random_content = random.choice(content_list)

        response = ChatGPT("""
                           너는 아이들을 사랑하는 가정교사야. 
                           아이들의 눈높이에 맞춰서 대답을 해줘야해. 
                           아이들이 맞출 수 있는 문제를 내줘야해. 
                           5, 6, 7세 아이가 맞출 수 있는 문제를 내줘. 
                           형식: 문제: question 정답: answer
                           """, 
                           "이 줄거리에 대해서 문제를 하나 내줘",
                           random_content)
        
        response_split = response.choices[0].message.content.split('정답: ')
        qustion = response_split[0].split('문제: ')[1]
        quiz_answer = response_split[1]
        return Response({"question": qustion,
                         "quiz_answer": quiz_answer,
                         "content": random_content})

class ChatGPT_Feedback(APIView):
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def post(self, request):
        content = request.data['user_answer'] # 줄거리 데이터
        quiz = request.data['quiz'] # 퀴즈 데이터
        user_answer = request.data['user_answer'] # 대답 데이터
        quiz_answer = request.data['quiz_answer'] # 퀴즈 정답 데이터

        response = ChatGPT("""
                           너는 아이들을 사랑하는 가정교사야. 
                           아이들의 눈높이에 맞춰서 대답을 해줘야해. 
                           아이들에게 맞춘 피드백을 해줘야 해.
                           5, 6, 7세 아이에게 필요한 피드백이 필요해.
                           간단하게 피드백을 해줘야해.
                           """, 
                           " 다음과 같이 대답을 했을 때 피드백을 해줘",
                           "줄거리 : " + content + " 퀴즈 : " + quiz + 
                           " 퀴즈 정답 : " + quiz_answer + 
                           " 대답 : " + user_answer)

        feedback = response.choices[0].message.content
        return Response({"feedback": feedback, })

class BookListView(ListCreateAPIView):
    queryset = BookList.objects.all()
    serializer_class = BookSerializer
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

class BookListDetailView(CreateAPIView):
    queryset = BookDetail.objects.all()
    serializer_class = BookDetailSerializer
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]   

class BookDetailView(ListCreateAPIView):
    serializer_class = BookDetailSerializer
    authentication_classes = [BasicAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        bookList = get_object_or_404(BookList, pk=self.kwargs['BookList_id'])
        return BookDetail.objects.filter(BookList=bookList.id)

    def paginate_queryset(self, queryset):
        # 'all' 쿼리 파라미터를 확인
        if self.request.query_params.get('all') == 'true':
            return None  # 페이지네이션 적용 안함
        return super().paginate_queryset(queryset)  # 기본 페이지네이션 로직 수행

    pagination_class = BookDetailCustomPagination

class QuizListView(ListCreateAPIView):
    queryset = QuizList.objects.all()
    serializer_class = QuizListSerializer
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

class WordListView(ListCreateAPIView):
    queryset = WordList.objects.all()
    serializer_class = WordListSerializer
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

class AiAudioListView(ListCreateAPIView):
    queryset = AiAudioList.objects.all()
    serializer_class = AiAudioListSerializer
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

class CreateUserView(ListCreateAPIView):
    queryset = User.objects.all()
    model = User
    serializer_class = UserSerializer

class GetUser(RetrieveAPIView):
    queryset = User.objects.all()
    model = User
    serializer_class = UserSerializer

class Postview(ListCreateAPIView):
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Post.objects.all()
    serializer_class=PostSerializer
    pagination_class = PostCustomPagination
    filter_backends = [OrderingFilter, SearchFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    search_fields = ['title', 'content']
    
class postRetrieveview(APIView):
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    def get_object(self, pk):
        try:
            return Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            raise Http404
    
    # 조회
    def get(self, request, pk, format=None):
        book = self.get_object(pk)
        serializer = PostSerializer(book)
        return Response(serializer.data)


    # 수정
    def put(self, request, pk, format=None):
        book = self.get_object(pk)
        serializer = PostSerializer(book, data=request.data) 
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data) 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 삭제
    def delete(self, request, pk, format=None):
        book = self.get_object(pk)
        book.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)      
    
class commentuploadview(APIView):
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    def get_object(self, pk):
        try:
            return comment.objects.get(pk=pk)
        except comment.DoesNotExist:
            raise Http404
    
    # 조회
    def get(self, request, pk, format=None):
        book = self.get_object(pk=pk)
        serializer = commentSerializer(book)
        return Response(serializer.data)

    # 등록
    def post(self, request, pk, format=None):
        book = self.get_object(pk)
        serializer = commentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 수정
    def put(self, request, pk, id, format=None):
        book = self.get_object(id)
        serializer = commentSerializer(book, data=request.data) 
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data) 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # 삭제
    def delete(self, request, id, format=None):
        book = self.get_object(id)
        book.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class LearningStatusview(APIView):
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    def get_object(self, pk):
        return LearningStatus.objects.filter(User=pk)
        
    def get(self, request, pk, format=None):
        learning_statuses = self.get_object(pk)
        serializer = LearningStatusSerializer(learning_statuses, many=True)
        wrong_list = [i for i in serializer.data if not i['is_right']] #is_right가 false인 것들에 대해 틀린것 리스트로 받아옴
        wrongpercentage = round((len(wrong_list) / len(serializer.data)) * 100, 2) #오답률을 나타냄
        grouped_data={}
        now=datetime.now() #현재 시간(local)
        month=[]
        month_data=[0,0,0,0,0,0,0] #일주일 내 각 요일마다 푼 퀴즈수 저장용
        for i in serializer.data:
            date_str=i['created_at']
            created_at = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S.%f')
            thedate = created_at
            if (now-timedelta(days=7))<thedate: #일주일 내에 푼 퀴즈 들만 가져오기 위함
                month.append(thedate)
        for i in range(len(month)):
            month_data[month[i].weekday()]+=1 #푼 퀴즈 수에 대해 카운트
        grouped_data=['월','화','수','목','금','토','일']
        numdata=len(serializer.data)
        return Response({'User' : pk, 'wrongpercentage' : wrongpercentage, 'numdata' : numdata, 'grouped_data': grouped_data ,'month_data' : month_data})
    
class ReadingStatusview(APIView):
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    def get_object(self, pk):
        return ReadingStatus.objects.filter(User=pk)
        
        
    def get(self, request, pk, format=None):
        book=self.get_object(pk)
        serializer = ReadingStatusSerializer(book,many=True)
        read_list = [i for i in serializer.data]
        readbook = len(read_list)
        return Response({'User' : pk, 'readbook' : read_list, 'readbooknum' : readbook})
    
class ReadingStatusCreateView(ListCreateAPIView):
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = ReadingStatus.objects.all()
    model = ReadingStatus
    serializer_class = ReadingStatusCreateSerializer

class CommentCreateView(CreateAPIView):
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = comment.objects.all()
    model = comment
    serializer_class = commentSerializer

class PostMediaView(ListCreateAPIView):
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Media.objects.all()
    serializer_class = MediaSerializer

    def resize_image(self, image, size=(300, 300)):
        """ 이미지 크기를 조절하는 함수 """
        img = Image.open(image)
        img.convert('RGB')
        img.thumbnail(size, Image.Resampling.LANCZOS)

        temp_file = BytesIO()
        img.save(temp_file, 'JPEG')
        temp_file.seek(0)

        return ContentFile(temp_file.read(), name=image.name)

    def perform_create(self, serializer):
        media_file = serializer.validated_data.get('media_path')
        if media_file and hasattr(media_file, 'content_type') and media_file.content_type.startswith('image/'):
            resized_image = self.resize_image(media_file)
            serializer.save(media_path=resized_image)
        else:
            serializer.save()

class LearningStatusCreateView(ListCreateAPIView):
    authentication_classes = [BasicAuthentication, SessionAuthentication, JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = LearningStatus.objects.all()
    model = LearningStatus
    serializer_class = LearningStatusCreateSerializer
    
    
        