"use client";

import React, { useState, useRef, useEffect } from "react";
import Login from "@/components/component/index_compo/login";
import { Signup } from "@/components/component/index_compo/signup";
import './globals.css';
import './swiper-bundle.min.css';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper/modules';


export default function Index() {
  const [showLogin, setShowLogin] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [showContent, setShowContent] = useState(false);
  useEffect(() => {
    setShowContent(true);
  }, []);

  const backgroundStyle: React.CSSProperties = {
    backgroundImage: 'url("/field.jpg")',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: '100%',
  };

  const screenStyle: React.CSSProperties = {
    height: '500px',
    margin: '0',
  }

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-cover bg-center relative" style={backgroundStyle}>
      <div className="text-center mb-3">
        <h2 className="text-5xl font-bold text-gray-800">
          북키즈
        </h2>
      </div>

      <div className="lg:flex justify-between h-fit">
        {showSignup ? (
          <Signup setShowSignup={setShowSignup} />
        ) : (
          <>
            <div className="lg:w-3/4 justify-start bg-blue-100/50 rounded-lg flex items-center place-content-center relative overflow-hidden m-8">
              <>
                <Swiper
                    slidesPerView={1}
                    spaceBetween={55}
                    loop={true}
                    pagination={{
                        clickable: true,
                    }}
                    navigation={true}
                    modules={[Pagination, Navigation]}
                    className="mySwiper"
                    style={{ minHeight: "90%", alignItems: "center" }}
                >
                    <SwiperSlide style={{ textAlign: 'left' }}>
                        <h1 className="text-3xl font-bold mb-4 mx-4 inset-y-0 left-0">
                            서비스 소개
                        </h1>
                        <p className="text-lg leading-loose inset-y-0 left-0">
                            유아시기는 만3세~만5세인데, 유아기의 아이가
                            언어를 배우는 시기의 뇌는 스펀지와 같다고 한다.<br />
                            스펀지가 물을 흡수하는 것처럼 언어를 흡수하게
                            된다는 것이다. 이순영 고려대 국어교육과 교수는
                            미취학 아동의 시기가 독서 관심도의 차이를
                            결정하는 골든타임이라고 말했다.<br /> 
                            그래서 아이의 흥미를 이끌고 독서 습관을 자연스럽게 체득할 수
                            있게 도움을 주는 서비스를 제공하고자 한다.
                        </p>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="flex">
                            <img src="/booklist.png" alt="Slide 2" style={{ maxWidth: '70%', maxHeight: '50%', marginTop: '-5%' }}/>
                            <p className="text-xl leading-loose justify-center content-center m-8">
                                아이들에게 맞는 다양한 동화책 선정<br />

                                
                            </p>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="flex items-center justify-center">
                            <img src="/bookread.png" alt="Slide 3" style={{ width: '70%', maxHeight: '50%', marginTop: '-5%' }}/>
                            <p className="text-lg leading-loose ml-4">
                                STT를 통한 동화책 읽어주기<br />
                            </p>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="flex items-center justify-center">
                            <img src="/quiz_1.png" alt="Slide 4" style={{ width: '70%', maxHeight: '50%' }}/>
                            <p className="text-lg leading-loose ml-4">
                                동화책 기반 문제 제공<br />
                            </p>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="flex items-center justify-center">
                            <img src="/bookhistory.png" alt="Slide 5" style={{ width: '80%', maxHeight: '60%', marginTop: '-5%' }}/>
                            <p className="text-lg leading-loose ml-4">
                                마이페이지에서 읽은 책 목록 확인<br />
                            </p>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="flex items-center justify-center">
                            <img src="/mypage_study.png" alt="Slide 6" style={{ width: '80%', maxHeight: '60%', marginTop: '-5%' }}/>
                            <p className="text-lg leading-loose ml-4">
                                학습 현황에서 읽은 책 수 및 퀴즈 수 확인<br />
                                원하는 테마색 변경 가능
                            </p>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="flex items-center justify-center">
                            <img src="/board.png" alt="Slide 7" style={{ width: '70%', maxHeight: '50%', marginTop: '-5%' }}/>
                            <p className="text-lg leading-loose ml-4">
                                모두와 대화할 수 있는 게시판
                            </p>
                        </div>
                    </SwiperSlide>
                    {/* <SwiperSlide>Slide 8</SwiperSlide>
                    <SwiperSlide>Slide 9</SwiperSlide> */}
                </Swiper>
              </>
            </div>
            <div className="lg:w-1/5 lg:flex justify-center">
              {showSignup ? (
                <Signup setShowSignup={setShowSignup} />
              ) : (
                <>
                  <Login setShowLogin={setShowLogin} setShowSignup={setShowSignup}/>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const token = context.req.cookies.token;

  if (token) {
    return {
      redirect: {
        destination: '/mainpage',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
