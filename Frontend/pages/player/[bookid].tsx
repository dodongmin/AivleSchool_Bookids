import HTMLFlipBook from 'react-pageflip';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CardHeader, CardContent, Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation';
import '../globals.css'
import 'react-h5-audio-player/lib/styles.css';
import { GetServerSideProps } from 'next';
import Cookies from "js-cookie";
import AudioPlayer from 'react-h5-audio-player';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { bookid } = context.query;

  return {
    props: { bookid }, // 이 부분에서 bookid를 props로 전달합니다.
  };
};

//페이지 커버,페이지 내용 관리
const Page = React.forwardRef(({ children, image, pageNumber }, ref) => {
  const isEvenPage = pageNumber % 2 === 0;

  return (
    <div className="h-screen" ref={ref}>
      {isEvenPage ? (
        image ? (
          // 짝수 페이지이고 이미지가 있는 경우 이미지 표시
          
            <img src={image} alt="Page content" className="w-full h-full object-cover" />
          
        ) : (
          // 짝수 페이지이지만 이미지가 없는 경우 로딩 화면 표시
          <div className="flex flex-col items-center justify-center w-full h-screen bg-white">
            <div className="animate-spin">
              <LoaderIcon className="w-20 h-20 text-blue-500" />
            </div>
            <h1 className="mt-5 text-3xl font-semibold text-gray-700">그림이 만들어지고 있어요!</h1>
          </div>
        )
      ) : (
        // 홀수 페이지의 경우 children 표시
        <p>{children}</p>
      )}
    </div>
  );
});
const PageCover = React.forwardRef((props, ref) => {
  return (
    <div className="page" ref={ref} data-density="hard">
      <div className="page-content">
        <h2>{props.children}</h2>
        <img className='justify-center items-center h-screen p-10 border-2 border-black-100' src={props.coverImage} alt="Cover" />
      </div>
    </div>
  );
});



function MyBook(props) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageContent, setPageContent] = useState({});
  const [audioContent, setAudioContent] = useState({});
  const [pageCount, setPageCount] = useState(0); // 페이지 수를 저장할 상태
  const Bookid = props.bookid;
  // 오디오 상태관리
  const audioPlayerRef = useRef(null);
  const [audioPath, setAudioPath] = useState('');
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);

  //미정리 상태관리
  const [book, setBook] = useState([]);
  const [nextPageAnimation, setNextPageAnimation] = useState('');
  const [prevPageAnimation, setPrevPageAnimation] = useState('');
  const [showTextLayer, setShowTextLayer] = useState(false);
  const [nextContent, setNextContent] = useState('');
  const [imagePath, setImagePath] = useState('');
  const mouseMoveTimer = useRef(null);
  const [isLoading, setLoading] = useState(false); // 책 들어가서 이미지, 오디오 생성하는 동안 로딩하기 위한 변수
  const flipBookRef = useRef(null);

  useEffect(() => {
    const fetchAllPageContent = async () => {
      try {
        setLoading(true) // 로딩 시작
        // 페이지 수를 가져오는 API 요청
        const pageCountResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/BookDetail/${Bookid}`);
        const totalPageCount = pageCountResponse.data.count;
        const realPageCount = Math.ceil(totalPageCount / 2); // 전체 페이지 수의 절반 계산
        setPageCount(totalPageCount * 2); // 총 페이지 수 설정

        // 홀수 페이지에 대한 API 요청 생성
        const requests = [...Array(totalPageCount)].map((_, index) => {
          const pageNumber = index + 1; // 홀수 페이지 번호 계산
          return axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/BookDetail/${Bookid}?page=${pageNumber}`);
        });

        // 모든 요청 병렬 처리
        const responses = await Promise.all(requests);

        // 상태 업데이트
        const newPageContent = responses.reduce((content, response, index) => {
          const pageNumber = index + 1;
          content[pageNumber * 2 - 1] = response.data.results[0].content;


          return content;
        }, {});
        setPageContent(newPageContent);

        // 짝수 페이지에 대한 이미지 생성 요청
        for (let i = 2; i <= totalPageCount * 2; i += 2) {
          const textContent = newPageContent[i - 1]; // 홀수 페이지의 텍스트 콘텐츠를 가져옴
          console.log(textContent);
          if (textContent) {
            await fetchImage(textContent, i, i); // 텍스트 콘텐츠를 사용하여 이미지 생성 요청
          }

        }
      } catch (error) {
        console.error('Error fetching page content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPageContent();
  }, [Bookid]);

  useEffect(() => {
    // 현재 페이지에 대한 오디오 경로를 설정
    if (audioContent[currentPage]) {
      setAudioPath(audioContent[currentPage]);
      const timer = setTimeout(() => {
        setIsReadyToPlay(true);
        if (audioPlayerRef.current) {
          audioPlayerRef.current.audio.current.play();
        }
      }, 1000); // 2초 뒤에 재생 시작
      return () => clearTimeout(timer);
    }
  }, [currentPage, pageContent]);

  // 마우스를 버튼 위에 올렸을 때
  const handleMouseMove = () => {
    clearTimeout(mouseMoveTimer.current); // 이미 실행 중인 타이머가 있다면 초기화
    setIsPlayerVisible(true);

    mouseMoveTimer.current = setTimeout(() => {
      setIsPlayerVisible(false);
    }, 2500);
  };


  //이미지 요청
  const fetchImage = async (content, pageNumber, audioNumber) => {
    try {
      const formData = new FormData();
      formData.append('content', content);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stable/api/generate_image/`, {
        method: 'POST',
        body: formData,
      });

      const img_data = await response.json();
      if (response.ok) {
        const audioPath = await fetchPostSpeech(content); // 오디오 파일 경로 받기
        console.log(img_data.image_path);

        // 이미지 경로와 오디오 경로를 상태에 저장
        setPageContent(prevContent => ({
          ...prevContent,
          [pageNumber]: img_data.image_path
        }));
        
        if (audioPath) {
          setAudioContent(prevAudio => ({
            ...prevAudio,
            [audioNumber]: audioPath
          }));
        }

      } else {
        console.error('Error fetching image:', img_data.error);
      }
    } catch (error) {
      console.error('Error fetching image:', error.message);
    }
  };

  const NextPage = () => {
    if (isLoading) return;
    // 애니메이션 시간과 일치
    audioPlayerRef.current.audio.current.pause();
    if (currentPage >= pageCount) {
      // 마지막 페이지일 경우 특정 경로로 리디렉션
      router.push(`/quiz/${props.bookid}`);

    } else {
      // 아닐 경우 다음 페이지로 넘김
      if (flipBookRef.current) {
        flipBookRef.current.pageFlip().flipNext();
      }
    };
  }

  const PrevPage = () => {
    if (currentPage <= 1) return;
    if (isLoading) return;
    audioPlayerRef.current.audio.current.pause();

    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const handlePageChange = (e) => {
    if (isLoading) {
      // 로딩 중이면 페이지 변경 로직을 실행하지 않음
      return;
    }

    setCurrentPage(e.data + 1);
  };

  const fetchPostSpeech = async (content) => {
    const token = Cookies.get('token');
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/TextToSpeech/`, {
        content: content,
      }, {
        headers: {
          'Authorization': `Bearer ${token}` // 토큰을 헤더에 추가
        }
      });

      const audioPath = response.data.file_path;
      console.log(audioPath);

      return audioPath; // 오디오 경로 반환
    } catch (error) {
      console.error('Error in fetchPostSpeech:', error);
      return null; // 오류 발생 시 null 반환
    }
  };

  const handleMoveMainPage = () => {
    // '/mainpage'로 이동하면서 뒤로 가기로 못돌아가게 함
    router.replace('/mainpage', undefined);
  };



  return (
    <div className="container" onMouseMove={handleMouseMove}>
      <button onClick={handleMoveMainPage}
        className={`bg-transparent fixed top-0 pt-5 pl-5 duration-1000 transition-opacity ease-in-out ${isPlayerVisible ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: 2 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
        </svg>
      </button>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center w-full h-screen bg-white">
          <div className="animate-spin">
            <LoaderIcon className="w-20 h-20 text-blue-500" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-gray-700">그림과 음성이 만들어지고 있어요!</h1>
        </div>
      ) : (
        <HTMLFlipBook
          ref={flipBookRef}
          width={550}
          height={500}
          size="stretch"
          minWidth={315}
          maxWidth={1200}
          minHeight={400}
          maxHeight={800}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true} 
          onFlip={handlePageChange}
          >
            

          <PageCover coverImage='http://127.0.0.1:8000/media/book/%EC%8B%9C%EA%B3%A8%EC%A5%90%20%EC%84%9C%EC%9A%B8%EA%B5%AC%EA%B2%BD.png' isLoading={isLoading}></PageCover>

          {[...Array(pageCount)].map((_, index) => {
            const pageNumber = index + 1;
            const pageImage = pageContent[pageNumber];
            return (
              <Page key={pageNumber} pageNumber={pageNumber} image={pageImage}>

                {pageNumber % 2 === 1
                  ? <aside className="w-full h-screen p-5 overflow-hidden"
                    style={{ transformStyle: 'preserve-3d', animation: prevPageAnimation, transformOrigin: 'right', zIndex: prevPageAnimation ? 1 : 0 }}>
                    <Card className="h-full rounded-md bg-white border-2 shadow-lg">
                      <CardContent className="flex flex-col h-full p-4">
                        <ScrollArea className="flex-1 mt-6 w-full rounded-md border max-h-full overflow-auto">
                          <div className="p-1 text-sm">
                            <p className="mt-4 text-3xl tracking-wide px-5" style={{ lineHeight: '2.5em' }}>
                              &nbsp;&nbsp;&nbsp; {pageContent[pageNumber]}
                            </p>
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </aside>
                  || 'Loading...' // 로딩 화면
                  : <></>
                }
              </Page>
            );
          })}
        </HTMLFlipBook>
      )} 
      
      <div className={`flex items-center justify-center ${isLoading ? 'invisible' : 'visible'}`}>
        <div
          className={`w-full md:w-full fixed bottom-0 left-0 bg-white duration-1000 transition-opacity ease-in-out ${isPlayerVisible && currentPage !== 1? 'opacity-100' : 'opacity-0'}`}>

          <AudioPlayer
            ref={audioPlayerRef}
            src={audioPath}
            autoPlay={isReadyToPlay}
            showJumpControls={false}
            preload="none"
            onEnded={NextPage}
            onClickNext={NextPage}
            onClickPrevious={PrevPage}
            showSkipControls={true}
            autoPlayAfterSrcChange={false}
          // autoPlay={false}
          // customAdditionalControls={[]} // 추가 컨트롤을 빈 배열로 설정하여 숨김
          // 필요한 경우 다른 props 추가
          />
        </div>
      </div>
    </div>
  );
}

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

export default MyBook;