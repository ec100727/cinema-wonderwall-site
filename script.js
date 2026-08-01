// 질문 데이터
const questions = [
    {
        id: 1,
        question: "당신의 성격은?",
        choices: [
            { text: "내향적이고 조용함", value: "introvert" },
            { text: "외향적이고 활발함", value: "extrovert" },
            { text: "둘 다 아님", value: "neutral" }
        ]
    },
    {
        id: 2,
        question: "좋아하는 장르는?",
        choices: [
            { text: "액션/스릴러", value: "action" },
            { text: "드라마/로맨스", value: "drama" },
            { text: "코미디/판타지", value: "comedy" }
        ]
    },
    {
        id: 3,
        question: "영화 선호 분위기는?",
        choices: [
            { text: "밝고 긍정적", value: "bright" },
            { text: "어둡고 신비로움", value: "dark" },
            { text: "상관없음", value: "any" }
        ]
    }
];

// 영화 데이터
const movies = {
    introvert_action_dark: {
        title: "섀도우 에이전트",
        poster: "https://via.placeholder.com/300x400?text=Shadow+Agent",
        recommendation: "조용하지만 강렬한 당신을 위한 영화입니다."
    },
    introvert_drama_dark: {
        title: "나의 감정",
        poster: "https://via.placeholder.com/300x400?text=My+Emotion",
        recommendation: "내면의 깊이를 탐색하는 영화입니다."
    },
    introvert_comedy_bright: {
        title: "혼자의 시간",
        poster: "https://via.placeholder.com/300x400?text=Alone+Time",
        recommendation: "따뜻한 유머로 위로받는 영화입니다."
    },
    extrovert_action_bright: {
        title: "폭발하는 영웅",
        poster: "https://via.placeholder.com/300x400?text=Explosion+Hero",
        recommendation: "신나고 재미있는 모험을 경험하세요."
    },
    extrovert_drama_any: {
        title: "함께라는 것",
        poster: "https://via.placeholder.com/300x400?text=Together",
        recommendation: "사람들과의 관계를 그린 영화입니다."
    },
    extrovert_comedy_bright: {
        title: "웃음의 축제",
        poster: "https://via.placeholder.com/300x400?text=Laughter+Festival",
        recommendation: "즐거움으로 가득한 영화입니다."
    },
    neutral_action_any: {
        title: "균형잡힌 여정",
        poster: "https://via.placeholder.com/300x400?text=Balanced+Journey",
        recommendation: "모든 요소가 조화로운 영화입니다."
    },
    neutral_drama_dark: {
        title: "진리의 탐구",
        poster: "https://via.placeholder.com/300x400?text=Quest+Truth",
        recommendation: "사유하게 만드는 깊이 있는 영화입니다."
    },
    neutral_comedy_bright: {
        title: "일상의 기쁨",
        poster: "https://via.placeholder.com/300x400?text=Daily+Joy",
        recommendation: "따뜻하고 긍정적인 영화입니다."
    }
};

let currentQuestionIndex = 0;
let userAnswers = {};

// 시작
function startQuiz() {
    currentQuestionIndex = 0;
    userAnswers = {};
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('questionScreen').classList.remove('hidden');
    showQuestion();
}

// 질문 표시
function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResult();
        return;
    }

    const question = questions[currentQuestionIndex];
    const questionContent = document.getElementById('questionContent');
    
    let html = `<h2>${question.question}</h2>`;
    html += '<div>';
    question.choices.forEach(choice => {
        html += `<button onclick="answerQuestion('${choice.value}')">${choice.text}</button>`;
    });
    html += '</div>';
    
    questionContent.innerHTML = html;
}

// 질문 답변
function answerQuestion(value) {
    const question = questions[currentQuestionIndex];
    userAnswers[`q${currentQuestionIndex + 1}`] = value;
    currentQuestionIndex++;
    showQuestion();
}

// 결과 표시
function showResult() {
    const key = `${userAnswers.q1}_${userAnswers.q2}_${userAnswers.q3}`;
    const movie = movies[key] || {
        title: "당신의 선택",
        poster: "https://via.placeholder.com/300x400?text=Your+Choice",
        recommendation: "모든 영화는 좋습니다."
    };

    document.getElementById('questionScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');
    document.getElementById('movieTitle').textContent = movie.title;
    document.getElementById('moviePoster').innerHTML = `<img src="${movie.poster}" alt="${movie.title}">`;
    document.getElementById('recommendation').textContent = movie.recommendation;
}

// 다시 시작
function restartQuiz() {
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('questionScreen').classList.add('hidden');
}
