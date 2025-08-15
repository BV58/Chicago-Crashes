import { useEffect, useState } from 'react';
import config from '../config';

export default function CrashQuiz() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    useEffect(() => {
        const base = `http://${config.server_host}:${config.server_port}`;

        Promise.all([
            fetch(`${base}/crash_severity_index_per_city/2020`).then(res => res.json()),
            fetch(`${base}/average_age_of_vehicle/PASSENGER`).then(res => res.json()),
            fetch(`${base}/driver_age_groups_and_safety_equipment_effectiveness/SAFETY BELT NOT USED`).then(res => res.json()),
            fetch(`${base}/weather_conditions/2024`).then(res => res.json()),
            fetch(`${base}/total_crashes_and_fatalities/2017`).then(res => res.json())
        ]).then(([data1, data2, data3, data4, data5]) => {
            const qs = [
                {
                    question: 'Which city had the highest crash severity index in 2020?',
                    generate: () => {
                        const options = data1.slice(0, 4).map(item => item.city_name);
                        const answer = data1[0].city_name;
                        shuffle(options);
                        return { options, answer };
                    }
                },
                {
                    question: 'What vehicle age group had the most fatalities for Passenger vehicles?',
                    generate: () => {
                        const options = data2.slice(0, 4).map(item => item.vehicle_age);
                        const answer = data2[0].vehicle_age;
                        shuffle(options);
                        return { options, answer };
                    }
                },
                {
                    question: 'Which driver age group had the most fatalities when a safety belt was not used?',
                    generate: () => {
                        const options = [...data3].slice(0, 3).map(item => item.age_group);
                        const answer = data3[0].age_group;
                        shuffle(options);
                        return { options, answer };
                    }
                },
                {
                    question: 'Which weather condition had the highest number of crashes with fatalities in 2024?',
                    generate: () => {
                        const options = data4.slice(0, 4).map(item => item.weather_condition);
                        const answer = data4[0].weather_condition;
                        shuffle(options);
                        return { options, answer };
                    }
                },
                {
                    question: 'Which crash type had the highest percent fatalities in 2017?',
                    generate: () => {
                        const sorted = [...data5].sort((a, b) => b.fatality_rate_pct - a.fatality_rate_pct);
                        const options = sorted.slice(0, 4).map(item => item.crash_type);
                        const answer = sorted[0].crash_type;
                        shuffle(options);
                        return { options, answer };
                    }
                }
            ].map(q => {
                const { options, answer } = q.generate();
                return {
                    question: q.question,
                    options,
                    answer
                };
            });

            setQuestions(qs);
        });
    }, []);

    const handleAnswer = (option) => {
        if (option === questions[currentQuestion].answer) {
            setScore(prev => prev + 1);
        }
        if (currentQuestion + 1 < questions.length) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            setShowScore(true);
        }
    };

    if (!questions.length) {
        return <div className="flex items-center justify-center min-h-screen text-lg">Loading quiz...</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            {showScore ? (
                <div className="text-center">
                    <center><h1 className="text-2xl font-bold mb-4">Quiz Completed!</h1></center>
                    <center><p className="text-lg mb-4">Your score: {score} / {questions.length}</p></center>
                    <center><button
                        onClick={() => {
                            setShowScore(false);
                            setCurrentQuestion(0);
                            setScore(0);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Restart Quiz
                    </button></center>
                </div>
            ) : (
                <div className="max-w-xl w-full">
                    <center><h2 className="text-lg mb-2 text-center">Question {currentQuestion + 1} of {questions.length}</h2></center>
                    <center><p className="mb-4 font-medium text-center">{questions[currentQuestion].question}</p></center>
                    <center><div className="grid gap-2 justify-center">
                        {questions[currentQuestion].options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(option)}
                                className="px-4 py-2 border rounded hover:bg-gray-200"
                            >
                                {option}
                            </button>
                        ))}
                    </div></center>
                </div>
            )}
        </div>
    );
}
