import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import { useBookList } from '@/components/component/book_compo/usebooklist';
import { useRouter } from 'next/navigation';
import { CSSTransition } from 'react-transition-group';
import { motion } from "framer-motion";
const PER_PAGE = 8;

export default function Book_list({ setSelecteCompoId, setSelectedBookId }) {


  const PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const { bookList } = useBookList();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const showBookDetails = (bookid) => {
    if(bookid === 1 || bookid === 2){
      router.push(`/player/${bookid}`);
    }
    else {
      setShowModal(true);
    }
  };
  const currentBooks = bookList ? bookList.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE) : [];
  const totalPages = bookList ? Math.ceil(bookList.length / PER_PAGE) : 0;
  return (
    <div className="mx-3 my-3 p-3 bg-slate-200/90 rounded-lg">
      <div className=" mx-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 " style={{ minHeight: '464px', }}>
        
        {/* 책 목록 렌더링 */}
        {currentBooks.map(book => (
          <button>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} key={book.id}

              className="relative group overflow-hidden rounded-lg"
              onClick={() => showBookDetails(book.id)}>

              {/* 책 정보 렌더링 */}
              <Card className="border-4 p-4 border-black-300 border-double" style={{
                backgroundImage: `url(${book.img_path})`,
                backgroundOrigin: 'content-box',
                backgroundSize: 'cover',
                backgroundPosition: 'center', // 이미지 중앙 정렬
                backgroundRepeat: 'no-repeat',
                minHeight: '220px',

              }}>
                <CardHeader>
                  <Avatar className="w-12 h-12" src="/placeholder.svg?height=100&width=100" />
                </CardHeader>
                <CardContent>
                  {/* 여기에 추가 정보 표시 */}
                </CardContent>
              </Card>

              {/* 밑은 호버 띄우기 */}
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() =>
                  showBookDetails(book.id)
                }>
                <h3 className="text-white text-lg font-bold">
                  {book.book_name}
                </h3>
                <h1 className="text-white text-lg">
                  {book.author}
                </h1>
              </motion.div>
            </motion.div>
          </button>
        ))}
      </div >
      {/* 페이지네이션 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '30px' }}>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>이전 페이지</Button>
        </motion.div>
        <span className="items-center p-2"> {currentPage} / {totalPages}</span>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>다음 페이지</Button>
        </motion.div>
      </div>
      {/* 모달창 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            {/* 모달 내용 */}
            <p className='mb-3'>서비스 준비중입니다.</p>
            <Button className='w-full' onClick={() => setShowModal(false)}>
              닫기
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
// 북리스트 가져오기 위한 인터페이스

interface BookListComponentProps {
  bookId: number;
  infoType: 'book_name' | 'author'; // 여기에 필요한 다른 정보 타입을 추가할 수 있습니다.
}

function BookListComponent({ bookId, infoType }: BookListComponentProps) {
  const { bookList, isLoading, isError } = useBookList();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data</div>;

  // 특정 ID의 책 찾기
  const book = bookList.find(book => book.id === bookId);

  // 원하는 정보 반환
  return (
    <div>
      {book ? (
        <p>{book[infoType]}</p> // infoType에 따라 다른 정보 표시
      ) : (
        <p>책을 찾을 수 없습니다.</p>
      )}
    </div>
  );
}