// components/forum.js 또는 .tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Board_update from './board_update';


const Board_detail = ({ postId, goBack, fetchGetData_board_list }) => {
    const [post, setPost] = useState(null);
    const [CommentContent, setCommentContent] = useState("");
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (postId) {
            fetchGetData();
        }
    }, [postId]);

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        // 여기에 삭제 로직을 구현합니다.
        console.log('게시물이 삭제되었습니다.');
        handleDeleteSubmit();
        setShowDeleteModal(false);
        goBack(); // 삭제 후 목록으로 돌아갑니다.
    };

    const handleDeleteSubmit = async () => {
        try {
            const token = Cookies.get('token');

            const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}` // 토큰을 헤더에 추가
                }
            });
            fetchGetData_board_list();
        }catch(error){
            console.error('Error submitting post:', error);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    // 게시물 상세 데이터를 불러오는 함수
    const fetchGetData = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/`);
            setPost(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching post data:', error);
        }
    };

    const toggleUpdateForm = () => {
        setShowUpdateForm(true);
    };

    const handleCancelUpdate = () => {
        setShowUpdateForm(false);
        fetchGetData(); // 데이터를 다시 불러옵니다.
    };

    if (showUpdateForm) {
        return (
            <Board_update
                onCancel={() => handleCancelUpdate}
                goBack={goBack}
                postId={postId}
                PostTitle={post.title} // 게시물 제목
                PostContent={post.content} // 게시물 내용
                fetchGetData_board_list={fetchGetData_board_list}
            />
        );
    }

    const handleCommentSubmit = async (event) => {
        event.preventDefault(); // 폼의 기본 제출 동작을 방지

        try {
            // JWT 토큰 가져오기 (예: localStorage에서)
            const token = Cookies.get('token');
            const user_id = Cookies.get('user_id');

            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/comment/`, {
                Post: postId,
                User: user_id,
                content: CommentContent,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}` // 토큰을 헤더에 추가
                }
            });

            console.log('Post submitted:', response.data);

            fetchGetData();
            setCommentContent("");
        }catch(error){
            console.error('Error submitting post:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
        {/* 뒤로가기 버튼 */}
        <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mb-4" onClick={goBack}>
            뒤로가기
        </button>

        {/* 상세 게시물 및 댓글 관련 내용 */}
        {/* post가 null이 아닐 때만 내용을 렌더링 */}
        {post && (
            <div>
                {/* 게시물 내용 */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <p className="text-gray-700 mb-2 text-lg font-bold"> {post.user_name}</p>
                    <p className="text-gray-700 mb-4 text-lg font-bold"> {post.created_at}</p>
                    </div>
                    <div><br></br></div>
                    <div className="text-gray-800">
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>
                    <div className="flex justify-end mt-4">
                        <button onClick={toggleUpdateForm} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mr-2">
                            수정하기
                        </button>
                        <button onClick={handleDeleteClick} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                            삭제하기
                        </button>
                    </div>

                    {/* 삭제 확인 모달 */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                            <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                <div className="mt-3 text-center">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">정말 삭제하시겠습니까?</h3>
                                    <div className="mt-2 px-7 py-3">
                                        <p className="text-sm text-gray-500">이 작업은 되돌릴 수 없습니다.</p>
                                    </div>
                                    <div className="items-center px-4 py-3">
                                        <button id="delete-button" className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-5/12 shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75" onClick={handleDeleteConfirm}>
                                            삭제
                                        </button>
                                        <button id="cancel-button" className="px-4 py-2 ml-3 bg-gray-400 text-white text-base font-medium rounded-md w-5/12 shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75" onClick={handleCancelDelete}>
                                            취소
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        

        {/* 댓글 테이블 */}
        {post && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <table className="min-w-full">
                    <caption className='text-left mb-4 text-gray-700'>댓글</caption>
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border-b-2 border-gray-200 p-4 text-center w-2/3">내용</th>
                            <th className="border-b-2 border-gray-200 p-4 text-center">작성자</th>
                            <th className="border-b-2 border-gray-200 p-4 text-center">작성일자</th>
                        </tr>
                    </thead>
                    <tbody>
                        {post.comment.map((comment) => (
                            <tr key={comment.id} className="cursor-pointer hover:bg-gray-50">
                                <td className="border-b border-gray-200 p-4 text-center">{comment.content}</td>
                                <td className="border-b border-gray-200 p-4 text-center">{comment.user_name}</td>
                                <td className="border-b border-gray-200 p-4 text-center">{comment.created_at}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            <br></br>
            <form onSubmit={handleCommentSubmit}>
                <input id='new_comment' type='text' value={CommentContent} onChange={(e) => setCommentContent(e.target.value)} className='w-5/6 mb-2 p-2 border border-gray-300' required placeholder='댓글 내용'/>
                {/* 댓글 작성하기 버튼 */}
                <button type="submit" className="ml-20 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                    작성하기
                </button>
            </form>
        </div>
        )}
        </div>

        
);
};

export default Board_detail;
