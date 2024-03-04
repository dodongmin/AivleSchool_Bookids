// components/BookDetailComponent.js 또는 .tsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import AudioPlayer from 'react-audio-player';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import 'tailwindcss/tailwind.css'
import Cookies from 'js-cookie';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { bookid } = context.query;

  return {
    props: { bookid }, // 이 부분에서 bookid를 props로 전달합니다.
  };
};

const Quiz_image = ({ bookid }) => {
    const router = useRouter();
    const [book, setBook] = useState(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const audioRef = useRef();
    // const [ImagePath, setImagePath] = useState('https://health.chosun.com/site/data/img_dir/2023/06/20/2023062002262_0.jpg');
    const [ImagePath, setImagePath] = useState('');
    const [quiz, setQuiz] = useState('');
    const [quizAnswer, setQuizAnswer] = useState('');
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isQuizLoading, setQuizLoading] = useState(false);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
    
    useEffect(() => {
        fetchPostImageGenerate();
    }, []);

    const goToPrevPage = () => {
        router.back();
    };

    const goToMainPage = () => {
        fetchPostimageQuizSave();//종료전 이미지퀴즈추가
        fetchPostLearnimageQuizSave();//종료전 이미지퀴즈이력 남기기
        fetchPostSaveHistory(); // 종료전 이력 남기기
        router.replace('/');
    };

    const togglePlayPause = () => {
        if (audioRef.current) {
        const player = audioRef.current.audioEl.current;
        if (player.paused) {
            player.play();
        } else {
            player.pause();
        }
        }
    };
    const fetchPostimageQuizSave = async () => {
        try {
        const token = Cookies.get('token');
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/QuizList/`, {//현재는 api 미연결로 인해 quiz와 quizAnswer이 없어서 400 ERROR 발생
            BookList: bookid,
            category: 1,
            question: 'quiz_image', // Quiz_image 로 사용?
            answer: 'TrueAnswer',//사용자가 말한 Answer을 제외하고 다른 Answer을 찾을 수 없음(임시로 임의의 값을 넣어둠)
            
        },{
            headers: {
                'Authorization': `Bearer ${token}` // 토큰을 헤더에 추가
            }
        });
        const newQuizId = response.data.id;
        console.log('New Quiz ID:', newQuizId);
        await fetchPostLearnimageQuizSave(newQuizId);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPostLearnimageQuizSave = async (newQuizId) => {
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
        } catch (error) {
            console.error(error);
        }
    };
    const fetchPostSaveHistory = async () => {
        const token = Cookies.get('token');
        const user_id = Cookies.get('user_id')
        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ReadingStatus/`, {
            User: user_id,
            BookList: bookid,
        },{
            headers: {
                'Authorization': `Bearer ${token}` // 토큰을 헤더에 추가
            }
        })
            .then(response => {
                console.log(response);
            })
            .catch(error => {
                console.log(error);
            });
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

    // 이미지 생성 함수
    const fetchPostImageGenerate = async () => {
        setQuizLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stable/api/generate_quiz_image/`, {
            method: 'POST',
          });
  
          const data = await response.json();
          console.log(data);
          if (response.ok) {
            
            setImagePath(data.image_path);
            setQuiz('이 사진은 무엇인가요?');
            setQuizAnswer(data.quiz_answer);
            
          } else {
            console.error('Error fetching image:', data.error);
          }
        } catch (error) {
          console.error('Error fetching image:', error.message);
        }finally{
            setQuizLoading(false);
        }
    };

    const fetchPostFeedback = async () => {
        setIsFeedbackLoading(true);

        const token = Cookies.get('token');
    
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ChatGPT/Feedback/`, {
                // bookid: bookid,
                content: '사진에 대해서 무엇인지 맞추기',
                quiz: quiz,
                user_answer: userAnswer,
                quiz_answer: quizAnswer,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}` // 토큰을 헤더에 추가
                }
            });
    
            console.log(response);
            setFeedback(response.data.feedback);
        } catch (error) {
            console.log(error);
        } finally{
            setIsFeedbackLoading(false);
        }
    };
    function LoaderIcon(props) {
        return (
          <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" x2="12" y1="2" y2="6" />
            <line x1="12" x2="12" y1="18" y2="22" />
            <line x1="4.93" x2="7.76" y1="4.93" y2="7.76" />
            <line x1="16.24" x2="19.07" y1="16.24" y2="19.07" />
            <line x1="2" x2="6" y1="12" y2="12" />
            <line x1="18" x2="22" y1="12" y2="12" />
            <line x1="4.93" x2="7.76" y1="19.07" y2="16.24" />
            <line x1="16.24" x2="19.07" y1="7.76" y2="4.93" />
          </svg>
        )
      }
      

    return (
        <main className='bg-sky-100 justify-center items-center h-screen'>
            <div className="flex flex-row items-center justify-center h-full p-5 mx-10">
                <div className="flex flex-row items-start justify-center w-full">
                    {/* 이미지 섹션 */}
                    <div className="w-full lg:w-2/5 max-w-xl mr-10">
                        {isQuizLoading ? (
                            <div key="1" className="flex flex-col items-center justify-center w-full pt-32">
                                <div className="animate-spin">
                                <LoaderIcon className="w-20 h-20 text-blue-500" />
                                </div>
                                <h1 className="mt-5 text-3xl font-semibold text-gray-700">그림이 만들어지고 있어요!</h1>
                            </div>
                        ) : (
                            <img className="w-full h-auto object-cover rounded-lg shadow-lg" src={`${ImagePath}`} alt='Quiz Image'/>
                        )}
                    </div>
                    {/* 텍스트 및 버튼 섹션 */}
                    <div className="w-full lg:w-3/5 max-w-xl">
                        {/* 퀴즈 섹션 */}
                        <div className="mb-5">
                            <h2 className="text-white text-center mb-2.5 py-3 px-5 rounded-lg bg-blue-600 shadow-md font-bold text-lg">
                                <span className="mr-2 text-xl">&#x1F4DA;</span> 퀴즈
                            </h2>
                            <div className="p-6 text-center rounded-lg bg-white shadow-md">
                                <p>{quiz}</p>
                            </div>
                        </div>
                        
                        {/* 대답 섹션 */}
                        <div className="mb-5">
                            <h2 className="text-white text-center mb-2.5 py-3 px-5 rounded-lg bg-green-600 shadow-md font-bold text-lg">
                                <span className="mr-2 text-xl">&#x1F4AC;</span> 대답
                            </h2>
                            <div className="p-6 text-center rounded-lg bg-white shadow-md">
                                <p>{userAnswer}</p>
                            </div>
                        </div>

                        {/* 피드백 섹션 */}
                        <div className="mb-5">
                            <h2 className="text-white text-center mb-2.5 py-3 px-5 rounded-lg bg-yellow-600 shadow-md font-bold text-lg">
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

                        <AudioPlayer
                            ref={audioRef}
                            preload="none"
                            src="/audio/photo.mp3"
                            style={{
                            background: 'transparent',
                            width: '100%',
                            }}
                        />
                        {/* 버튼 컨테이너 */}
                        <div className="flex justify-between mt-6">
                            <div className="buttons-container flex justify-center mt-3">
                                <button onClick={goToPrevPage} className="flex items-center justify-center px-7 py-3 text-lg font-semibold cursor-pointer border-0 rounded-lg bg-blue-500 text-white shadow-md transition duration-300 hover:bg-blue-600 mr-3">
                                    <svg className="w-7 h-7 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    이전
                                </button>
                                <button onClick={togglePlayPause} className="flex items-center justify-center px-7 py-3 text-lg font-semibold cursor-pointer border-0 rounded-lg bg-green-500 text-white shadow-md transition duration-300 hover:bg-green-600 mr-3">
                                    <svg className="w-7 h-7 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                                    </svg>
                                    재생
                                </button>
                                <button onClick={handleMikeClick} className="flex items-center justify-center px-7 py-3 text-lg font-semibold cursor-pointer border-0 rounded-lg bg-red-500 text-white shadow-md transition duration-300 hover:bg-red-600 mr-3">
                                    <svg className="w-7 h-7 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                                    </svg>
                                    말하기
                                </button>
                                <button onClick={goToMainPage} className="flex items-center justify-center px-7 py-3 text-lg font-semibold cursor-pointer border-0 rounded-lg bg-gray-500 text-white shadow-md transition duration-300 hover:bg-gray-600">
                                    <span className="mr-2">종료</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Quiz_image;
