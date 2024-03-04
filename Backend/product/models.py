from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone

# Create your models here.
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser):
    email = models.EmailField(verbose_name='email address', max_length=255, unique=True)
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.name

class BookList(models.Model):
    book_name = models.CharField(max_length=100)
    img_path = models.ImageField(null=True)
    author = models.CharField(max_length=20)
    genre = models.CharField(max_length=20)
    level = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.book_name
    
class Post(models.Model):
    User = models.ForeignKey(User, related_name='Post', on_delete=models.CASCADE) #<-추가
    title = models.CharField(max_length=50)
    content = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

class comment(models.Model):
    Post = models.ForeignKey(Post, related_name='comment', on_delete=models.CASCADE)
    User = models.ForeignKey(User, related_name='comment', on_delete=models.CASCADE) #<-추가
    content = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    
class Media(models.Model):
    media_path = models.FileField(upload_to='post/')
    created_at = models.DateTimeField(auto_now_add=True)
    

    
class BookDetail(models.Model):
    BookList = models.ForeignKey(BookList, related_name='BookDetail', on_delete=models.CASCADE)
    content = models.TextField()
    page = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
class QuizList(models.Model):
    BookList = models.ForeignKey(BookList, related_name='QuizList', on_delete=models.CASCADE)
    category = models.CharField(max_length=20)
    question = models.TextField()
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class WordList(models.Model):
    QuizList = models.OneToOneField(QuizList, related_name='WordList', on_delete=models.CASCADE)
    word_name = models.CharField(max_length=30)
    img_path = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class UserAudioList(models.Model):
    User = models.ForeignKey(User, related_name='UserAudioList', on_delete=models.CASCADE)
    QuizList = models.OneToOneField(QuizList, related_name='UserAudioList', on_delete=models.CASCADE)
    audio_path = models.TextField()
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class AiAudioList(models.Model):
    QuizList = models.OneToOneField(QuizList, related_name='AiAudioList', on_delete=models.CASCADE)
    audio_path = models.FileField(upload_to='audio/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    
class LearningStatus(models.Model):
    User = models.ForeignKey(User, related_name='LearningStatus', on_delete=models.CASCADE)
    QuizList = models.OneToOneField(QuizList, related_name = 'LearningStatus', on_delete=models.CASCADE)
    is_right = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)
    
class ReadingStatus(models.Model):
    
    User = models.ForeignKey(User, related_name='ReadingStatus', on_delete=models.CASCADE)
    BookList = models.ForeignKey(BookList, related_name='ReadingStatus', on_delete=models.CASCADE) #포린키로 변경
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together =('User', 'BookList')