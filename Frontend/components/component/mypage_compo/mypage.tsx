 // components/component/mypage_compo/mypage.tsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import BookHistory from "@/components/component/mypage_compo/book_history";
import ChartPie from "@/components/ui/piechart";
import { uselearningHistory } from "./uselearninghistory";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  import { Bar } from 'react-chartjs-2';
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  export const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '일주일 간 푼 퀴즈 수',
      },
    },
  };

  const themeBackgroundClasses = {
    white: "bg-gray-200/90",
    cyan: "bg-lime-100/90",
    sky: "bg-sky-100/90",
    indigo: "bg-indigo-100/90",
    pink: "bg-pink-100/90",
};

const Mypage = ({
    setSelecteCompoId,
}: {
    setSelecteCompoId: (id: string) => void;
}) => {
    const [userInfo, setUserInfo] = useState({ name: "", email: "" }); // 초기값을 빈 문자열로 설정
    const [selectedMenu, setSelectedMenu] =
        useState("bookList"); /*클릭하면 나오도록*/
    const [readBookCount, setReadBookCount] = useState(0); // 읽은 책 수
    const [quizCount, setQuizCount] = useState(0); // 푼 퀴즈 수
    // const [correct, setCorrect] = useState(0); // 맞은 퀴즈 수 => 이거 알면 정답률 계산 가능
    const [bookList, setBookList] = useState([]);
    const [wrongpercentage, setWrongPercentage] = useState(0);  // 오답율
    // const [lastLearningDate, setLastLearningDate] = useState('');   // 마지막 학습 날짜
    const [selectedTheme, setSelectedTheme] = useState("white");
    const [countdata, setcountdata ] = useState();
    const [monthdata, setmonthdata ] = useState();
    const [hoveredItem, setHoveredItem] = useState(null);

    useEffect(() => {
        // 쿠키에서 user_id 읽기
        const userId = Cookies.get("user_id");
        if (userId) {
            axios
                .get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/${userId}`)
                .then((response) => {
                    setUserInfo(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching user data:", error);
                });
        }
    }, []);

    useEffect(() => {
        // 컴포넌트가 마운트될 때 저장된 테마 값 확인
        const savedTheme = localStorage.getItem("selectedTheme");
        if (savedTheme) {
          setSelectedTheme(savedTheme);
        }
      }, []);

    const handleMenuClick = (menu) => {
        setSelectedMenu(menu);
    };

    const handleThemeChange = (theme) => {
        setSelectedTheme(theme);
        // 선택한 테마를 로컬 스토리지에 저장
        localStorage.setItem("selectedTheme", theme);
    };
    const onMouseEnter = (item) => {
        setHoveredItem(item);
    };

    const onMouseLeave = () => {
        setHoveredItem(null);
    };

    useEffect(() => {
        // 컴포넌트가 마운트될 때 'bookList'로 초기화
        // setSelectedMenu("bookList");
        if (userInfo.id) {
            const fetchUserStats = async () => {
                try {
                    const response = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/user/${userInfo.id}/`
                    ); // 사용자 ID에 따라 수정
                    const userData = response.data;

                    const bookListResponse = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/user/${userData.id}/learningstatus`
                    );
                    const userBookList = bookListResponse.data;

                    const readingResponse = await axios.get(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/user/${userData.id}/readingstatus`
                    );
                    const readingList = readingResponse.data;
                    // 상태 업데이트
                    setReadBookCount(readingList.readbooknum);
                    setQuizCount(userBookList.numdata);
                    setWrongPercentage(userBookList.wrongpercentage);
                    setBookList(userBookList);
                    setcountdata(userBookList.grouped_data);
                    setmonthdata(userBookList.month_data);
                    // const correct = userBookList.filter(item => item.is_right === 1);
                } catch (error) {
                    console.error("Error fetching user stats:", error);
                }
            };

            fetchUserStats();
        }
    }, [userInfo]);
      const PER_PAGE = 8;
      console.log(countdata)
    const labels = countdata;
    const data = {
        labels,
        datasets: [
          {
            label: '푼 퀴즈 수',
            data: monthdata,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
        ],
      };

      const backgroundClass = themeBackgroundClasses[selectedTheme] || "bg-gray-200/80";

    return (
        <div
            style={{
                display: "flex",
                height: "580px",
                backgroundColor:
                    selectedTheme === "white"
                        ? "#ffffff"
                        : selectedTheme === "cyan"
                            ? "#f3ffe3"
                            : selectedTheme === "sky"
                                ? "#ebf8ff"
                                : selectedTheme === "indigo"
                                    ? "#eef2ff"
                                    : selectedTheme === "pink"
                                        ? "#fff5f7"
                                        : "#ffffff",
                borderRadius: "20px",
                overflow: "hidden",
            }}
        >
            {/* 프로필 & 메뉴 섹션 */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100%",
                    justifyContent: "space-between",
                    padding: "20px",
                    paddingBottom: "40px", // 바닥여백
                    minHeight: "600px", // 필요에 따라 조정
                    borderRadius: "20px",
                    overflow: "hidden",
                    backgroundColor:
                        selectedTheme === "white"
                            ? "#ffffff"
                            : selectedTheme === "cyan"
                                ? "#f3ffe3"
                                : selectedTheme === "sky"
                                    ? "#ebf8ff"
                                    : selectedTheme === "indigo"
                                        ? "#eef2ff"
                                        : selectedTheme === "pink"
                                            ? "#fff5f7"
                                            : "#ffffff",
                }}
            >
                {/* 프로필 영역 */}
                <div
                    className="text-center mb-10"
                    style={{ width: "100%" }}
                >
                    {" "}
                    {/* 여기서 마진 탑 조정 */}
                    <div
                        className="rounded-full overflow-hidden mx-auto mb-20"
                        style={{
                            width: "180px",
                            height: "180px",
                            marginBottom: "30px",
                        }}
                    >

                        {/* 동그라미 크기 고정. marginBottom: '30px'은 이름과 사진 사이의 거리 */}
                        <img
                            src="/bookpanda.jpg"
                            className="object-cover w-full h-full rounded-full snap-center"
                        />
                    </div>
                    <h2 className="text-xl font-semibold">{userInfo.name}</h2>
                    <p className="text-gray-500 mb-1">{userInfo.email}</p>
                </div>

                {/* 메뉴 영역 */}
                <ul
                    style={{
                        listStyle: "none",
                        padding: 0,
                        width: "100%",
                        display: "flex", // 플렉스박스 설정
                        flexDirection: "column", // 아이템들을 세로로 정렬
                        justifyContent: "flex-start", // 세로축에서 위쪽 정렬
                        height: "100%", // 전체 높이 설정
                        marginTop: "20px", // 여백을 줄이기 위해 추가 또는 수정
                        width: "100%",
                    }}
                >
                    {["bookList", "menu1"].map((menu) => (
                        <li
                            key={menu}
                            onClick={() => handleMenuClick(menu)}
                            onMouseEnter={() => onMouseEnter(menu)}
                            onMouseLeave={onMouseLeave}
                            style={{
                                cursor: "pointer",
                                padding: "10px",
                                textAlign: "center",
                                backgroundColor:
                                    selectedMenu === menu
                                        ? "#3b82f6"
                                        : hoveredItem === menu
                                            ? "#d6eaf8" // 마우스 호버 상태일 때의 색상 (밝은 파란색)
                                            : "#ffffff", // 기본 배경 색상
                                color:
                                    selectedMenu === menu
                                        ? "#ffffff"
                                        : "#1f2937",
                                marginBottom: "5px",
                                borderRadius: "5px",
                                transition: "background-color 0.2s ease-in-out",
                            }}
                        >
                            {menu === "bookList" ? "내 책 목록" : "학습 현황"}
                        </li>
                    ))}
                </ul>
                <form>
                    <legend> Choose a theme: </legend>
                    <div className="flex justify-between">
                        {["white", "cyan", "sky", "indigo", "pink"].map((theme) => (
                            <label key={theme} className="flex items-center">
                                <input
                                    type="radio"
                                    className="appearance-none"
                                    checked={selectedTheme === theme}
                                    onChange={() => handleThemeChange(theme)}
                                />
                                <div
                                    className={`h-6 w-6 rounded-full border border-gray-300 hover:border-gray-400 cursor-pointer flex items-center justify-center relative`}
                                    style={{
                                        backgroundColor: theme === "white" ? "#ffffff"
                                        : theme === "cyan" ? "#f3ffe3"
                                        : theme === "sky" ? "#e0f2fe"
                                        : theme === "indigo" ? "#e0e7ff"
                                        : theme === "pink" ? "#fce7f3"
                                        : "white", // 기본값
                                        border: theme === "white" ? "1px solid #ccc" : "" // 하얀색 테마에 대한 경계선 추가
                                    }}
                                    title={theme.charAt(0).toUpperCase() + theme.slice(1)}
                                >
                                    {selectedTheme === theme && (
                                        <div className={`h-4 w-4 rounded-full ${selectedTheme === theme ? `bg-${theme}-500` : "bg-gray-300"} absolute`}></div>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                </form>
            </div>


            {/* 콘텐츠 섹션 */}
            <div className={`flex-1 p-8 ${backgroundClass}`} style={{ height: '600px', overflow: 'hidden' }}>
                {/* '내 책 목록' 선택 시 표시될 내용 - 추가된 로직 */}
                {selectedMenu === "bookList" && (
                    <div className="h-full border-2 border-dashed border-gray-300 rounded">
                        <div className="flex h-full items-center justify-center">
                            {/* Booklist 컴포넌트에 북리스트 전달 */}
                            <BookHistory setSelecteCompoId={setSelecteCompoId} />
                        </div>
                    </div>
                )}

                {/* '학습현황' 선택 시 표시될 내용 - 추가된 로직 */}
                {selectedMenu === "menu1" && (
                    <div className="h-full border-2 border-dashed border-gray-300 rounded">
                        <div className="h-full justify-center">
                            <div className="h-full">
                                <div className="text-gray-500 mt-4 mb-2 ml-4 mr-4">
                                    {/* 여기에 "학습현황" 컨텐츠가 표시됩니다.<br /> */}
                                </div>
                                <div className="flex">
                                    <div className="w-2/3 mt-2 mb-4 ml-4 mr-4 h-96">
                                        <Bar options={options} data={data}/>
                                    </div>
                                    <div className="w-1/3 mt-2 mb-4 ml-4 mr-4">
                                    {/* 파이 차트 추가 */}
                                        <div className="shadow-lg rounded-lg overflow-hidden w-80">
                                            <div className="py-3 px-5 bg-gray-50">
                                            읽은 책 수: {readBookCount}<br />
                                            푼 퀴즈 수: {quizCount}<br />
                                            정답율: {100 - wrongpercentage}%<br />
                                            </div>
                                            {/* ChartPie 컴포넌트 불러오기 */}
                                            <ChartPie
                                                data={{
                                                    labels: ["정답율", "오답율"],
                                                    datasets: [
                                                        {
                                                            data: [100-wrongpercentage, wrongpercentage],
                                                            backgroundColor: [
                                                                "rgb(000, 204, 255)",
                                                                "rgb(255, 153, 204)",
                                                            ],
                                                            hoverOffset: 4,
                                                        },
                                                    ],
                                                }}
                                                
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Mypage;