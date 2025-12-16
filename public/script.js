import words from './data/words.json';
import { inject } from '@vercel/analytics';

// Initialize Vercel Analytics
inject();

document.addEventListener('DOMContentLoaded', () => {
    // Disable context menu
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    const questionElement = document.getElementById('question');
    const answerInput = document.getElementById('answer');
    const submitButton = document.getElementById('submit');
    const resultElement = document.getElementById('result');
    const scoreElement = document.getElementById('score');
    const remainingElement = document.getElementById('remaining');
    const quizElement = document.getElementById('quiz');
    const summaryElement = document.getElementById('summary');
    const correctAnswersElement = document.getElementById('correct-answers');
    const incorrectAnswersElement = document.getElementById('incorrect-answers');
    const finalScoreElement = document.getElementById('final-score');
    const restartButton = document.getElementById('restart');

    let currentQuestionIndex = 0;
    let score = 0;
    let questions = [];
    let incorrectAnswersList = [];

    generateQuestions();
    displayQuestion();

    submitButton.disabled = true;

    answerInput.addEventListener('input', () => {
        submitButton.disabled = answerInput.value.trim() === '';
    });

    answerInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !submitButton.disabled) {
            event.preventDefault(); // Prevent default form submission behavior
            submitButton.click(); // Trigger the click event on the "Wyślij" button
        }
    });

    function generateQuestions() {
        words.forEach(word => {
            questions.push({ type: 'pl-en', question: word.value, answer: word.key });
            //questions.push({ type: 'en-pl', question: word.key, answer: word.value });
        });
        questions = shuffleArray(questions);
    }

    function displayQuestion() {
        if (currentQuestionIndex < questions.length) {
            const currentQuestion = questions[currentQuestionIndex];
            questionElement.textContent = `Przetłumacz: ${currentQuestion.question}`;
            resultElement.textContent = '';
            answerInput.value = '';
            submitButton.disabled = true; // Disable the button for the new question
            updateRemaining();
        } else {
            showSummary();
        }
    }

    function updateRemaining() {
        const remainingQuestions = questions.length - currentQuestionIndex;
        remainingElement.textContent = `Pozostało pytań: ${remainingQuestions}`;
    }

    function removePolishChars(text) {
        return text
            .toLowerCase()
            .replace(/[ąćęłńóśźż]/g, (char) => {
                const polishChars = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' };
                return polishChars[char] || char;
            });
    }

    submitButton.addEventListener('click', () => {
        const userAnswer = removePolishChars(answerInput.value.trim());
        const currentQuestion = questions[currentQuestionIndex];
        const correctAnswer = removePolishChars(currentQuestion.answer);

        submitButton.disabled = true;

        if (userAnswer === correctAnswer) {
            resultElement.textContent = 'Gratulacje, to jest poprawna odpowiedź!';
            resultElement.className = 'correct';
            score++;
        } else {
            resultElement.textContent = `Niestety, to nie jest prawidłowa odpowiedź. Prawidłowa odpowiedź to: ${currentQuestion.answer}`;
            resultElement.className = 'incorrect';
            incorrectAnswersList.push({
                question: currentQuestion.question,
                userAnswer: answerInput.value.trim(),
                correctAnswer: currentQuestion.answer
            });
        }

        currentQuestionIndex++;
        updateScore();
        updateRemaining();

        if (currentQuestionIndex < questions.length) {
            setTimeout(() => {
                displayQuestion();
            }, userAnswer === correctAnswer ? 2000 : 5000);
        } else {
            setTimeout(() => {
                showSummary();
            }, userAnswer === correctAnswer ? 2000 : 5000);
        }
    });

    function updateScore() {
        scoreElement.textContent = `Punkty: ${score}`;
    }

    function showSummary() {
        quizElement.style.display = 'none';
        summaryElement.style.display = 'block';

        const totalQuestions = questions.length;
        const correctAnswers = score;
        const incorrectAnswers = totalQuestions - correctAnswers;
        const percentage = ((correctAnswers / totalQuestions) * 100).toFixed(2);

        correctAnswersElement.textContent = `Poprawne odpowiedzi: ${correctAnswers}`;
        incorrectAnswersElement.textContent = `Błędne odpowiedzi: ${incorrectAnswers}`;
        finalScoreElement.textContent = `Wynik: ${score} punktów (${percentage}%)`;

        if (correctAnswers === totalQuestions) {
            const perfectScoreMessage = document.createElement('p');
            perfectScoreMessage.textContent = 'Brawo! Udzieliłeś poprawnie odpowiedzi na wszystkie pytania!';
            perfectScoreMessage.style.color = '#4CAF50';
            perfectScoreMessage.style.fontSize = '28px';
            perfectScoreMessage.style.marginTop = '20px';
            summaryElement.insertBefore(perfectScoreMessage, restartButton);
        }

        if (incorrectAnswersList.length > 0) {
            const incorrectAnswersContainer = document.createElement('div');
            incorrectAnswersContainer.innerHTML = `
          <h3>Błędne odpowiedzi:</h3>
          <ul>
            ${incorrectAnswersList.map(item => `
              <li>
                <strong>Pytanie:</strong> ${item.question}<br>
                <strong>Twoja odpowiedź:</strong> ${item.userAnswer}<br>
                <strong>Poprawna odpowiedź:</strong> ${item.correctAnswer}
              </li>
            `).join('')}
          </ul>
        `;
            summaryElement.insertBefore(incorrectAnswersContainer, restartButton);
        }
    }

    restartButton.addEventListener('click', () => {
        currentQuestionIndex = 0;
        score = 0;
        incorrectAnswersList = [];
        questions = shuffleArray(questions);
        quizElement.style.display = 'block';
        summaryElement.style.display = 'none';
        updateScore();
        updateRemaining();
        displayQuestion();
    });

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});
