
"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import  LoadingPage  from '@/components/component/index_compo/loading-page';
// import Booklist from '@/pages/booklist';
export default function Home() {
    const router = useRouter();

    // 페이지가 로드될 때 /first 경로로 리다이렉트
    useEffect(() => {
        router.push('/first');
    }, [router]);

    // 리다이렉트 중이거나 리다이렉트 전에 보여줄 컴포넌트 또는 로딩 인디케이터
    return (
        <div>
            <LoadingPage />
        </div>
    );
}