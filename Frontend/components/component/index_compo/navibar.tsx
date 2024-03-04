
import { Button } from "@/components/ui/button"
import { SheetTrigger, SheetContent, Sheet } from "@/components/ui/sheet"
import React, { use, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Profile_hover from "@/components/component/index_compo/profile_hover"
import { motion } from "framer-motion";
import { NavigationMenuLink, NavigationMenuList, NavigationMenu } from "@/components/ui/navigation-menu"
import { useRouter } from "next/navigation";


interface User {
  id: number;
  username: string;
  email: string;
}

export function Navibar({ setSelecteCompoId }) {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const username = userInfo.name;
  const [CompoId, SetCompoId] = useState(0);



  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user_id");
    router.push("/");
  };

  useEffect(() => {
    SetCompoId(1);
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
    // 컴포넌트가 마운트될 때 'bookList'로 초기화
    // setSelectedMenu("bookList");
    if (userInfo.id) {
      const fetchUserStats = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/user/${userInfo.id}/`
          ); // 사용자 ID에 따라 수정
          const userData = response.data;


        } catch (error) {
          console.error("Error fetching user stats:", error);
        }
      };

      fetchUserStats();
    }
  }, [userInfo]);




  return (
    <div className="flex flex-col w-full">
      <header className="flex justify-between items-center bg-white dark:bg-gray-900">
        <Sheet>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-300">
            <SheetTrigger asChild>
              <Button size="icon" variant="outline">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          </div>

          {/* 이부분은 화면이 작아졌을때 */}
          <SheetContent side="left" className="fixed top-0 left-0 z-50 bg-white shadow-lg">
            <h2 className="text-2xl font-bold bg-clip-text justify-center text-transparent bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%">

              북키즈
            </h2>
            <div className="grid gap-4 py-12">
              <motion.div whileHover={{ scale: 1.1 }} onHoverStart={e => { }} whileTap={{ scale: 0.9 }}
                onHoverEnd={e => { }}>
                <Button className={`hover:border-black hover:border-2 flex w-full items-center py-4 justify-center text-lg font-semibold hover:bg-gray-100 hover:text-black rounded-lg ${CompoId===1 ? 'bg-gray-100 text-black border-2 border-black' : ''}`} onClick={() => {setSelecteCompoId(1); SetCompoId(1);}}>
                  북리스트
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} onHoverStart={e => { }} whileTap={{ scale: 0.9 }}
                onHoverEnd={e => { }}>
                <Button className={`hover:border-black hover:border-2 flex w-full items-center py-4 justify-center text-lg font-semibold hover:bg-gray-100 hover:text-black rounded-lg ${CompoId===3 ? 'bg-gray-100 text-black border-2 border-black' : ''}`} onClick={() => {setSelecteCompoId(3); SetCompoId(3);}}>
                  마이페이지
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} onHoverStart={e => { }} whileTap={{ scale: 0.9 }}
                onHoverEnd={e => { }}>
                <Button className={`hover:border-black hover:border-2 flex w-full items-center py-4 justify-center text-lg font-semibold hover:bg-gray-100 hover:text-black rounded-lg ${CompoId===12 ? 'bg-gray-100 text-black border-2 border-black' : ''}`} onClick={() => {setSelecteCompoId(12); SetCompoId(12);}}>
                  게시판 목록
                </Button>
              </motion.div>
           


            </div>

          </SheetContent>
        </Sheet>



        {/* 밑부분은 화면이 클때 */}


        <div className=" absolute left-1/2 transform -translate-x-1/2 text-4xl font-bold ">
          <h2 className="animated-gradient" onClick={() => {setSelecteCompoId(1); SetCompoId(1);}}>
            북키즈
          </h2>
        </div>


        <div className="flex  gap-1 text-blue-600 min-w-fit group pr-5">

          {userInfo.name && <Profile_hover setSelecteCompoId={setSelecteCompoId} username={username} className="basis-1/6 justify-items-center" />}


          <div className="flex items-center group-hover:opacity-100 min-w-15">
            <div>
              {userInfo.name}님
            </div>
          </div>



        </div>



      </header >




    </div >
  );
}


function MenuIcon(props) {
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
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}


function MountainIcon(props) {
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
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  )
}
