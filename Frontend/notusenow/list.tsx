"pages/list.tsx";

import { GetServerSideProps } from 'next';

interface ListPageProps {
  data: any; // 데이터의 타입은 실제 API 응답에 따라 정의되어야 합니다.
}

const OtherPage: React.FC<ListPageProps> = ({ data }) => {
  // data를 사용하여 UI를 렌더링
  // 컴포넌트화 필요!
  return (
    <div>
      {/* UI 구성 요소 */}
      <ul>
        {data.map((book) => (
          <li>
            <h3>
              {book.book_name}
            </h3>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<ListPageProps> = async () => {
  // 서버 측에서 API를 호출하여 데이터를 가져옴
  const res = await fetch('http://43.201.148.150/api/BookList/');
  const data = await res.json();

  console.log(data);

  return {
    props: {
      data,
    },
  };
};

export default OtherPage;
