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