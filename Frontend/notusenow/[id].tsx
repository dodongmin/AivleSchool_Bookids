// pages/book/[id].js 또는 .tsx
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BookListComponent } from '@/pages/booklist';
import { Button } from "@/components/ui/button"

const BookPage = () => {
    const router = useRouter();
    const { id } = router.query; // URL에서 id 값을 추출
    const [book, setBook] = useState(null);
    // id를 사용하여 책에 대한 데이터를 가져오고, 책의 상세 정보를 렌더링합니다.
    // 예: API 요청을 통해 데이터를 가져오는 로직

    useEffect(() => {
        if (id) {
            axios.get(`http://127.0.0.1:8000/api/BookList/${id}`)
                .then(response => {
                    setBook(response.data);
                })
                .catch(error => {
                    console.error('Error fetching book data:', error);
                });
        }
    }, [id]);

    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    const goToNextPage = () => {
        if (currentPageIndex < book.BookDetail.length - 1) {
            setCurrentPageIndex(currentPageIndex + 1);
        }
    };
    const goToPreviousPage = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
        }
    };

    return (
        <div>
            {book ? (
                <div>
                    <h1>{book.book_name}</h1>
                    <p>저자: {book.author}</p>
                    <p>장르: {book.genre}</p>
                    <p>난이도: {book.level}</p>
                    {book.BookDetail && book.BookDetail.length > 0 && (
                        <p>내용: {book.BookDetail[currentPageIndex].content}</p>
                    )}
                    <Button onClick={goToPreviousPage}>이전 페이지</Button>
                    <Button onClick={goToNextPage}>다음 페이지</Button>
                    {/* ... 기타 책 정보 ... */}
                </div>
            ) : (
                <div>Loading...</div> // 데이터가 로드되기 전에 표시
            )}
        </div>
    );
};
export default BookPage;

// API 요청: 책의 상세 정보를 가져오기 위한 API 요청을 구현합니다. 이를 위해 fetch, axios 또는 다른 HTTP 클라이언트 라이브러리를 사용할 수 있습니다.

// 데이터 처리 및 상태 관리: API 요청으로부터 받은 데이터를 컴포넌트의 상태로 저장하고 관리합니다.

// UI 렌더링: API 요청으로부터 받은 데이터를 사용하여 UI를 렌더링합니다.import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';
// import axios from 'axios';

// const BookPage = () => {
//   const router = useRouter();
//   const { id } = router.query;
//   const [book, setBook] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (id) {
//       setLoading(true);
//       axios.get(`http://your-api-endpoint/books/${id}`)
//         .then(response => {
//           setBook(response.data);
//           setLoading(false);
//         })
//         .catch(error => {
//           console.error('There was an error fetching the book data:', error);
//           setError(error);
//           setLoading(false);
//         });
//     }
//   }, [id]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error loading book details.</div>;

//   return (
//     <div>
//       {book ? (
//         <div>
//           <h1>{book.title}</h1>
//           {/* 여기에 책에 대한 상세 정보를 렌더링 */}
//         </div>
//       ) : (
//         <div>책 정보를 불러올 수 없습니다.</div>
//       )}
//     </div>
//   );
// };

// export default BookPage;