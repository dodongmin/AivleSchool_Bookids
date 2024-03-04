// components/WriteForm.js 또는 .tsx
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import axios from 'axios';
import Cookies from 'js-cookie';
import dynamic from 'next/dynamic';
const TextEditor = dynamic(() => import('./TextEditor'), { ssr: false });

const Board_update = ({ onCancel, goBack, postId, PostTitle, PostContent, fetchGetData_board_list}) => {
    const [postTitle, setPostTitle] = useState(PostTitle);
    const [postContent, setPostContent] = useState(PostContent);
    const [file, setFile] = useState(null);
    useEffect(() => {

    }, []);

    const handlePutSubmit = async (event) => {
        event.preventDefault(); // 폼의 기본 제출 동작을 방지

        try {
            // JWT 토큰 가져오기 (예: localStorage에서)
            const token = Cookies.get('token');
            
            const user_id = Cookies.get('user_id');
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/`, {
                id: postId,
                User: user_id,
                title: postTitle,
                content: postContent,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}` // 토큰을 헤더에 추가
                }
            });

            console.log('Post submitted:', response.data);
            fetchGetData_board_list();
            // 작성이 완료된 후 폼 닫기
            onCancel();
            goBack();
        }catch(error){
            console.error('Error submitting post:', error);
        }
    };
    
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
    }
    return (
        
        <div className='container mx-auto px-4'>
            {/* 뒤로가기 버튼 */}
            <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mb-4" onClick={onCancel()}>
                뒤로가기
            </button>
            <div className="flex justify-center">
                <h2 className="text-2xl font-bold mb-4">글 수정하기</h2>
            </div>
            
            <form onSubmit={handlePutSubmit}>
                {/* 제목 입력 */}
                <div className="mb-4">
                    <label htmlFor="postTitle" className="block text-xl mb-2">제목</label>
                    <input
                        id="postTitle"
                        type="text"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                {/* 내용 입력 */}
                <div className="mb-4 my-9">
                    <label htmlFor="postContent" className="block text-xl mb-2">내용</label>
                    <TextEditor content={postContent} setContent={setPostContent} />
                    
                </div>

                {/* 작성 완료 버튼 */}
                <div className='text-right my-6'>
                <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                >
                    수정하기
                </Button>
                </div>
            </form>
        </div>
    );
};
 
export default Board_update;
 