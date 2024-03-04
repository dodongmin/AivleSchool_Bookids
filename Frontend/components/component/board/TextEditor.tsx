// TextEditor.tsx
import React from 'react';
import { useRef } from 'react';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import Cookies from "js-cookie";
import ReactQuill from 'react-quill';


const TextEditor = ({ content, setContent }) => {
    const editorRef = useRef(null);

    const insertImage = (url) => {
        const range = editorRef.current.getEditor().getSelection();
        if (range) {
            // 현재 선택된 위치에 이미지 URL 삽입
            editorRef.current.getEditor().insertEmbed(range.index, 'image', url);
        }
    };
    
    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
    
        input.onchange = async () => {
            
            const file = input.files[0];
            if (!file){
                return;
            }
            // FormData를 사용하여 파일을 서버로 전송
            const formData = new FormData();
            formData.append('media_path', file);
    
            const token = Cookies.get('token');
            axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/media/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            }).then(response => {
                // 서버에서 반환된 이미지 URL을 받습니다.
                const imageUrl = response.data.media_path;
                console.log(imageUrl);
                insertImage(imageUrl);
            }).catch(error => {
                console.error('Error uploading image:', error);
            });
            
        };
    };

    const modules = React.useMemo(() => {
        return {
            toolbar: {
                container: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                    ['link', 'image'], // 'image' 버튼 추가
                    ['clean']
                ],
                handlers: {
                    'image': handleImageUpload, // 함수 참조를 전달
                },
            },
        };
      }, []);

    return (
        <div style={{ height: '400px', backgroundColor: '#FFFFFF'}}>
            <ReactQuill 
                ref={editorRef}
                value={content}
                onChange={setContent}
                theme="snow"
                modules={modules}
                style={{ height: '358px', backgroundColor: '#FFFFFF'}}
            />
        </div>
    );
};

export default TextEditor;