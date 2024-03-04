'use client';

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import Cookies from "js-cookie";
import {jwtDecode} from 'jwt-decode';

export default function Login({ setShowLogin, setShowSignup }) {
    
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/token/`,
                {
                    // API 경로는 제작후 넣을것
                    email,
                    password,
                }
            );
            const token = response.data.access;
            const decoded_token = jwtDecode(token);
            Cookies.set("token", token);
            Cookies.set('user_id', decoded_token.user_id);
            router.push('/mainpage');
        } catch (error) {
            console.error("An error occurred:", error);
            setError("아이디 또는 비밀번호를 확인하세요.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6">
            <form onSubmit={handleSubmit} className="w-full max-w-md">
                <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="block text-sm font-bold mb-2"
                    >
                        아이디
                    </label>
                    <input
                        id="email"
                        type="text"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-6">
                    <label
                        htmlFor="pw"
                        className="block text-sm font-bold mb-2"
                    >
                        비밀번호
                    </label>
                    <input
                        id="pw"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    {error && <p className="text-red-500">{error}</p>}
                </div>
                
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        로그인
                    </button>
                    <button
                        onClick={() => {
                            setShowLogin(false);
                            setShowSignup(true);

                        }}
                        // type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        회원가입하기
                    </button>
                    {/* 임시 땜빵용 이 부분은 회원가입 호출 연결로 바꿔야 함 */}

                </div>
                
            </form>
        </div>
    );
}
