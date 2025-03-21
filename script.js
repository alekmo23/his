document.addEventListener('DOMContentLoaded', initQuiz);

const quizState = {
    currentScore: 0,
    timeLeft: 300,
    timerId: null,
    correctAnswers: 0,
    wrongAnswers: 0,
    soundEnabled: true
};

const quizData = {
    dates: [
        {
            question: "Год призвания варягов?",
            answers: ["862", "882", "912", "945"],
            correct: 0
        },
        {
            question: "Крещение Руси состоялось в...",
            answers: ["988", "1015", "1054", "1111"],
            correct: 0
        },
        {
            question: "Ледовое побоище произошло в...",
            answers: ["1242", "1223", "1237", "1380"],
            correct: 0
        },
        {
            question: "Год Куликовской битвы?",
            answers: ["1380", "1240", "1480", "1547"],
            correct: 0
        },
        {
            question: "Основание Санкт-Петербурга",
            answers: ["1703", "1712", "1698", "1721"],
            correct: 0
        }
    ],
    
    persons: [
        {
            question: "Креститель Руси",
            answers: ["Владимир Святославич", "Ярослав Мудрый", "Олег Вещий", "Святослав Игоревич"],
            correct: 0
        },
        {
            question: "Первый царь всея Руси",
            answers: ["Иван IV Грозный", "Пётр I", "Александр Невский", "Михаил Романов"],
            correct: 0
        },
        {
            question: "Реформатор 1860-х",
            answers: ["Александр II", "Николай I", "Екатерина II", "Пётр Столыпин"],
            correct: 0
        },
        {
            question: "Генералиссимус Великой Отечественной",
            answers: ["Сталин", "Жуков", "Рокоссовский", "Хрущёв"],
            correct: 0
        },
        {
            question: "Автор 'Повести временных лет'",
            answers: ["Нестор Летописец", "Митрополит Иларион", "Александр Невский", "Иван Фёдоров"],
            correct: 0
        }
    ],

    truefalse: [
        {
            question: "Санкт-Петербург был столицей 200 лет",
            correct: true
        },
        {
            question: "Иван Грозный убил своего сына",
            correct: true
        },
        {
            question: "Наполеон захватил Москву",
            correct: true
        },
        {
            question: "СССР участвовал в Первой мировой войне",
            correct: false
        },
        {
            question: "Пётр I основал первый университет",
            correct: false
        }
    ],

    images: [
        {
            image: "tsar-bell.jpg",
            question: "Что изображено на фото?",
            answers: ["Царь-пушка", "Царь-колокол", "Колокольня Ивана Великого"],
            correct: 1
        },
        {
            image: "saint-basil.jpg",
            question: "Как называется этот собор?",
            answers: ["Храм Христа Спасителя", "Покровский собор", "Успенский собор"],
            correct: 1
        },
        {
            image: "amber-room.jpg",
            question: "Что изображено?",
            answers: ["Янтарная комната", "Золотая кладовая", "Библиотека Ивана Грозного"],
            correct: 0
        },
        {
            image: "lenin.jpg",
            question: "Кто этот человек?",
            answers: ["Сталин", "Ленин", "Троцкий"],
            correct: 1
        },
        {
            image: "victory-banner.jpg",
            question: "Что это за знамя?",
            answers: ["Знамя Победы", "Флаг СССР", "Андреевский флаг"],
            correct: 0
        }
    ]
};

// ================= CORE FUNCTIONS =================
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initializeQuizData() {
    Object.keys(quizData).forEach(quizType => {
        const section = document.getElementById(quizType);
        section.innerHTML = '';
        
        shuffleArray(quizData[quizType]).forEach((q, index) => {
            if (quizType === 'truefalse') {
                q.answers = ["Правда", "Ложь"];
                q.correct = q.correct ? 0 : 1;
            }

            const answers = quizType === 'truefalse' ? q.answers : shuffleArray([...q.answers]);
            const correctIndex = answers.indexOf(q.answers[q.correct]);

            const questionHTML = `
                <div class="question">
                    <h3>${index + 1}. ${q.question}</h3>
                    ${q.image ? `<img src="images/${q.image}" alt="Изображение" style="max-width: 300px;">` : ''}
                    <div class="answers-grid">
                        ${answers.map((answer, i) => `
                            <div class="answer" data-correct="${i === correctIndex}">${answer}</div>
                        `).join('')}
                    </div>
                </div>
            `;
            section.insertAdjacentHTML('beforeend', questionHTML);
        });
    });
}

// ================= EVENT HANDLERS =================
function handleTabClick() {
    document.querySelectorAll('.quiz-tab, .quiz-section').forEach(el => {
        el.classList.remove('active');
    });
    this.classList.add('active');
    document.getElementById(this.dataset.quiz).classList.add('active');
}

function handleAnswerClick(e) {
    const answer = e.target;
    if (!answer.classList.contains('answer') || answer.classList.contains('disabled')) return;

    const isCorrect = answer.dataset.correct === 'true';
    
    // Блокировка всех ответов в вопросе
    answer.closest('.answers-grid').querySelectorAll('.answer').forEach(a => {
        a.classList.add('disabled');
        if (a.dataset.correct === 'true') a.classList.add('correct');
        else if (a === answer && !isCorrect) a.classList.add('wrong');
    });

    answer.classList.add(isCorrect ? 'correct' : 'wrong');
    processAnswer(isCorrect);
}

// ================= GAME LOGIC =================
function processAnswer(isCorrect) {
    if (isCorrect) {
        quizState.correctAnswers++;
        quizState.currentScore += 10;
        playSound('correct');
    } else {
        quizState.wrongAnswers++;
        playSound('wrong');
    }
    
    updateUI();
    checkAchievements();
    checkGameEnd();
}

function updateUI() {
    document.getElementById('score').textContent = quizState.currentScore;
    updateProgressBar();
}

function updateProgressBar() {
    const totalAnswered = quizState.correctAnswers + quizState.wrongAnswers;
    const totalQuestions = Object.values(quizData).reduce((sum, arr) => sum + arr.length, 0);
    const progress = (totalAnswered / totalQuestions) * 100;
    document.querySelector('.progress').style.width = `${progress}%`;
}

function checkAchievements() {
    const achievements = {
        ach1: 5,
        ach2: 15,
        ach3: 30
    };
    
    Object.entries(achievements).forEach(([id, req]) => {
        if (quizState.correctAnswers >= req) {
            document.getElementById(id).classList.add('unlocked');
        }
    });
}

function checkGameEnd() {
    const totalQuestions = Object.values(quizData).reduce((sum, arr) => sum + arr.length, 0);
    if ((quizState.correctAnswers + quizState.wrongAnswers) >= totalQuestions) {
        endQuiz();
    }
}

// ================= TIMER =================
function updateTimer() {
    quizState.timeLeft--;
    document.getElementById('time').textContent = quizState.timeLeft;
    
    if (quizState.timeLeft <= 0) {
        endQuiz();
    }
}

function endQuiz() {
    clearInterval(quizState.timerId);
    document.getElementById('finalScreen').style.display = 'block';
    document.getElementById('finalCorrect').textContent = quizState.correctAnswers;
    document.getElementById('finalWrong').textContent = quizState.wrongAnswers;
    document.getElementById('finalScore').textContent = quizState.currentScore;
}

// ================= INITIALIZATION =================
function initQuiz() {
    initializeQuizData();
    quizState.timerId = setInterval(updateTimer, 1000);
    
    // Обработчики событий
    document.querySelectorAll('.quiz-tab').forEach(tab => {
        tab.addEventListener('click', handleTabClick);
    });
    
    document.querySelectorAll('.quiz-section').forEach(section => {
        section.addEventListener('click', handleAnswerClick);
    });
}

// ================= UTILITIES =================
function playSound(type) {
    if (!quizState.soundEnabled) return;
    try {
        const audio = new Audio(`sounds/${type}.mp3`);
        audio.play();
    } catch (e) {
        console.error('Ошибка воспроизведения звука:', e);
    }
}

window.restartQuiz = () => location.reload();

window.toggleSound = function() {
    quizState.soundEnabled = !quizState.soundEnabled;
    document.getElementById('soundIcon').src = 
        quizState.soundEnabled ? 'images/sound-on.png' : 'images/sound-off.png';
};