// components/BookDetailComponent.js 또는 .tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Router } from 'lucide-react';
import { useRouter } from 'next/navigation';
import 'tailwindcss/tailwind.css'
import { GetServerSideProps } from 'next';
import Cookies from 'js-cookie';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { bookid } = context.query;

  return {
    props: { bookid }, // 이 부분에서 bookid를 props로 전달합니다.
  };
};

const Quiz = ({ bookid }) => {
    const router = useRouter();
    const [userAnswer, setUserAnswer] = useState('');
    const [quiz, setQuiz] = useState('');
    const [quizAnswer, setQuizAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [content, setContent] = useState('');
    const [isQuizLoading, setQuizLoading] = useState(false);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
    console.log(bookid)

    useEffect(() => {
        fetchPostQuiz();
    }, []);

    const fetchPostQuiz = async () => {
        setQuizLoading(true); // 로딩 시작
        const token = Cookies.get('token');

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ChatGPT/Question/`, {
                bookid: bookid,
            },{
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log(response);
            setQuiz(response.data.question);
            setContent(response.data.content);
            setQuizAnswer(response.data.quiz_answer);
        } catch (error) {
            console.log(error);
        } finally {
            setQuizLoading(false); // 로딩 완료
        }
    };

    const fetchPostFeedback = async () => {

        setTimeout(() => {
            setIsFeedbackLoading(true); // 1초 후 로딩 시작
        }, 1000);
        
        const token = Cookies.get('token');

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ChatGPT/Feedback/`, {
                // bookid: bookid,
                content: content,
                quiz: quiz,
                user_answer: userAnswer,
                quiz_answer: quizAnswer,
            },{
                headers: {
                    'Authorization': `Bearer ${token}` // 토큰을 헤더에 추가
                }
            });

            console.log(response);
            setFeedback(response.data.feedback);
        } catch (error) {
            console.log(error);
        } finally {
            setIsFeedbackLoading(false); // 로딩 완료
        }
    };
    
    const fetchPostQuizSave = async () => {
        try {
        const token = Cookies.get('token');
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/QuizList/`, {//현재는 api 미연결로 인해 quiz와 quizAnswer이 없어서 400 ERROR 발생
            BookList: bookid,
            category: 0,
            question: quiz,
            answer: quizAnswer,
            
        },{
            headers: {
                'Authorization': `Bearer ${token}` // 토큰을 헤더에 추가
            }
        });
        const newQuizId = response.data.id;
        console.log('New Quiz ID:', newQuizId);
        setFeedback(response.data.feedback);
        await fetchPostLearnQuizSave(newQuizId);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPostLearnQuizSave = async (newQuizId) => {
        try {
            const token = Cookies.get('token');
            const userId = Cookies.get('user_id');
            console.log(newQuizId)
            // newQuizId를 이용하여 LearningStatus에 데이터 추가
            const learnResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/LearningStatus/`,
                {
                    User: userId,
                    QuizList: newQuizId,
                    is_right: 1,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
    
            console.log(learnResponse);
            setFeedback(learnResponse.data.feedback);
        } catch (error) {
            console.error(error);
        }
    };

    async function handleMikeClick() {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/recognize_speech/`);
            console.log(response.data.text);
    
            if (response.data.text === undefined) {
                setUserAnswer("말하기 버튼을 누른 후 다시 말해주세요");
            } else {
                setUserAnswer(response.data.text);
                fetchPostFeedback(); // 피드백 추가
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const goToNextPage = () => {
        fetchPostQuizSave(); //quizdata 저장
        router.push(`/quiz_image/${bookid}`)
    };

    const goToPreviousPage = () => {
        router.back();
    };

    return (
        <main className='bg-sky-100 justify-center items-center h-screen'>
            <div className="flex flex-row items-center justify-center h-full p-5 mx-10">
                
                {/* 이미지 섹션 */}
                <div className="w-full lg:w-1/2 xl:w-1/2 mb-6 lg:mb-0">
                    <img className="max-w-screen-sm object-cover rounded-lg shadow-lg" src='https://www.hdec.kr/FileContents/EditorImg/20220303/%ED%80%B4%EC%A6%88%20%EC%9D%BC%EB%9F%AC%EC%8A%A4%ED%8A%B8%20-%20%EA%B2%8C%ED%8B%B0%EC%9D%B4%EB%AF%B8%EC%A7%80.jpg' alt='Quiz Image'/>
                </div>

                {/* 텍스트 및 버튼 섹션 */}
                <div className="w-full lg:w-2/5 max-w-xl">
                    {/* 퀴즈 섹션 */}
                    <div className="mb-5">
                        <h2 className="text-white text-center mb-2.5 py-3 px-5 rounded-lg bg-blue-600 shadow-md text-lg">
                            <span className="mr-2 text-xl">&#x1F4DA;</span> 퀴즈
                        </h2>
                        <div className="p-6 text-center rounded-lg bg-white shadow-md">
                        {isQuizLoading ? (
                            <p>퀴즈 생성중...</p> // 여기에 로딩 애니메이션 또는 로딩 표시를 추가하세요.
                        ) : (
                            <p>{quiz}</p>
                        )}
                        </div>
                    </div>
                    
                    {/* 대답 섹션 */}
                    <div className="mb-5">
                        <h2 className="text-white text-center mb-2.5 py-3 px-5 rounded-lg bg-green-600 shadow-md text-lg">
                            <span className="mr-2 text-xl">&#x1F4AC;</span> 대답
                        </h2>
                        <div className="p-6 text-center rounded-lg bg-white shadow-md">
                            <p>{userAnswer}</p>
                        </div>
                    </div>

                    {/* 피드백 섹션 */}
                    <div className="mb-5">
                        <h2 className="text-white text-center mb-2.5 py-3 px-5 rounded-lg bg-yellow-600 shadow-md text-lg">
                            <span className="mr-2 text-xl">&#x1F4A1;</span> 선생님의 조언
                        </h2>
                        <div className="p-6 text-center rounded-lg bg-white shadow-md">
                            {isFeedbackLoading ? (
                                <div>선생님의 조언 생성중...</div> // 로딩
                            ) : (
                                <p>{feedback}</p>
                            )}
                        </div>
                    </div>
        
                    {/* 버튼 컨테이너 */}
                    <div className="flex justify-between mt-6">
                        <div className="buttons-container flex justify-center mt-3">
                            <button onClick={goToPreviousPage} className="flex items-center justify-center px-7 py-3 text-lg font-semibold cursor-pointer border-0 rounded-lg bg-blue-500 text-white shadow-md transition duration-300 hover:bg-blue-600 mr-1">
                                <svg className="w-7 h-7 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                이전
                            </button>
                            <button className="flex items-center justify-center px-7 py-3 text-lg font-semibold cursor-pointer border-0 rounded-lg bg-green-500 text-white shadow-md transition duration-300 hover:bg-green-600 mr-1">
                                <svg className="w-7 h-7 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                                </svg>
                                재생
                            </button>
                            <button onClick={handleMikeClick} className="flex items-center justify-center px-7 py-3 text-lg font-semibold cursor-pointer border-0 rounded-lg bg-red-500 text-white shadow-md transition duration-300 hover:bg-red-600 mr-1">
                                <svg className="w-7 h-7 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                                </svg>
                                말하기
                            </button>
                            <button onClick={goToNextPage} className="flex items-center justify-center px-7 py-3 text-lg font-semibold cursor-pointer border-0 rounded-lg bg-blue-500 text-white shadow-md transition duration-300 hover:bg-blue-600">
                                <span className="mr-2">다음</span>
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Quiz;
