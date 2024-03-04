from rest_framework import serializers
from product.models import *

class BookDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookDetail
        fields = ['id', 'BookList', 'content', 'page', 'created_at']

class WordListSerializer(serializers.ModelSerializer):
    class Meta:
        model = WordList
        fields = ['id', 'QuizList', 'word_name', 'img_path', 'created_at']

class AiAudioListSerializer(serializers.ModelSerializer):
    class Meta:
        model = AiAudioList
        fields = ['id', 'QuizList', 'audio_path', 'created_at']

class QuizListSerializer(serializers.ModelSerializer):
    WordList = WordListSerializer(many=False, read_only=True)
    AiAudioList = AiAudioListSerializer(many=False, read_only=True)

    class Meta:
        model = QuizList
        fields = ['id', 'BookList', 'category', 'question', 'answer', 'created_at', 'WordList', 'AiAudioList']

class BookSerializer(serializers.ModelSerializer):
    BookDetail = BookDetailSerializer(many=True, read_only=True)
    QuizList = QuizListSerializer(many=True, read_only=True)
    
    class Meta:
        model = BookList
        fields = ['id', 'book_name', 'img_path', 'author', 'genre', 'level', 'created_at', 'BookDetail', 'QuizList']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'name', 'created_at')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password']
        )
    
class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ['id', 'media_path', 'created_at']
        
class commentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", default=timezone.now)
    class Meta:
        model = comment
        fields = ['id', 'Post', 'User', 'user_name', 'content', 'created_at']
        extra_kwargs = {
            'user_name': {'read_only': True}
        }

    def get_user_name(self, obj):
        return obj.User.name

class PostSerializer(serializers.ModelSerializer):
    Media=MediaSerializer(many=True, read_only=True)
    # User = UserSerializer(read_only=True)
    comment=commentSerializer(many=True, read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", default=timezone.now)
    user_name = serializers.SerializerMethodField()
    extra_kwargs = {
            'user_name': {'read_only': True}
    }
    
    class Meta:
        model = Post    
        fields = ['id', 'User', 'user_name', 'title', 'content', 'created_at', 'Media', 'comment']

    def get_user_name(self, obj):
        return obj.User.name
    
class LearningStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningStatus
        fields = ['id', 'User', 'QuizList', 'is_right', 'created_at']
        
class ReadingStatusSerializer(serializers.ModelSerializer):
    # book_name = serializers.SerializerMethodField()
    BookList=BookSerializer(many=False, read_only=True)
    class Meta:
        model = ReadingStatus
        fields = ['id', 'User', 'BookList', 'created_at']
        # extra_kwargs = {
        #     'book_name': {'read_only': True}
        # }

class ReadingStatusCreateSerializer(serializers.ModelSerializer):
    book_name = serializers.SerializerMethodField()
    class Meta:
        model = ReadingStatus
        fields = ['id', 'User', 'BookList', 'book_name', 'created_at']

    def get_book_name(self, obj):
        return obj.BookList.book_name
    
    def validate(self, data):
        User = data.get('User')
        BookList = data.get('BookList')
        if ReadingStatus.objects.filter(User=User, BookList=BookList).exists():
            raise serializers.ValidationError("이미 해당 User와 BookList 조합이 존재합니다.")
        return data
    
class LearningStatusCreateSerializer(serializers.ModelSerializer):
    # QuizList = serializers.SerializerMethodField()
    is_right = 1 # -> 현재는 모두 옳다고 넣지만 추후 옳다 틀리다의 기준이 명확해지면 변형 할 계획임
    class Meta:
        model = LearningStatus
        fields = ['id', 'User', 'created_at','QuizList','is_right']

    def get_QuizList(self, obj):
        return obj.LearningStatus.QuizList
    
    # def validate(self, data):
    #     User = data.get('User')
    #     QuizList = data.get('QuizList')
    #     if LearningStatus.objects.filter(User=User, QuizList=QuizList).exists():
    #         raise serializers.ValidationError("이미 해당 User와 QuizList 조합이 존재합니다.")
    #     return data