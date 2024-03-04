import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const ChartPie = ({ data }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        // 차트 설정
        const configPie = {
            type: "pie",
            data: data,
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const labelIndex = context.dataIndex;
                                const data = context.dataset.data;
                                const total = data.reduce((acc, value) => acc + value, 0);
                                const percentage = ((data[labelIndex] / total) * 100).toFixed(1);
                                return `${percentage}%`;
                            },
                        },
                    },
                },
            },
        };

        // 이전 차트 리셋 또는 새로운 차트 생성
        if (chartRef.current) {
            chartRef.current.data = data;
            chartRef.current.update();
        } else {
            const canvas = document.getElementById("myPieChart");
            if (canvas) {
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    chartRef.current = new Chart(ctx, configPie);
                }
            }
        }

        // useEffect 종료 시점에서 차트 리셋
        return () => {
            if (chartRef.current) {
                chartRef.current.reset();
            }
        };
    }, [data]);

    return <canvas id="myPieChart" className="p-1" />;
};

export default ChartPie;
