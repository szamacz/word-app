document.addEventListener('DOMContentLoaded', () => {
  const questionElement = document.getElementById('question');
  const answerInput = document.getElementById('answer');
  const submitButton = document.getElementById('submit');
  const resultElement = document.getElementById('result');
  const scoreElement = document.getElementById('score');
  const remainingElement = document.getElementById('remaining'); // Element do wyświetlania pozostałych pytań
  const quizElement = document.getElementById('quiz');
  const summaryElement = document.getElementById('summary');
  const correctAnswersElement = document.getElementById('correct-answers');
  const incorrectAnswersElement = document.getElementById('incorrect-answers');
  const finalScoreElement = document.getElementById('final-score');
  const restartButton = document.getElementById('restart');

  let words = [];
  let currentQuestionIndex = 0;
  let score = 0;
  let questions = [];
  let incorrectAnswersList = []; // Przechowuje błędne odpowiedzi

  fetch('/api/words')  // Poprawny endpoint
    .then(response => response.json())
    .then(data => {
      words = data;
      generateQuestions();
      displayQuestion();
    })
    .catch(error => console.error('Błąd podczas ładowania słówek:', error));

  function generateQuestions() {
    words.forEach(word => {
      questions.push({ type: 'en-pl', question: word.key, answer: word.value });
      questions.push({ type: 'pl-en', question: word.value, answer: word.key });
    });
    questions = shuffleArray(questions);
  }

  function displayQuestion() {
    if (currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      questionElement.textContent = `Przetłumacz: ${currentQuestion.question}`;
      resultElement.textContent = '';
      answerInput.value = '';
      submitButton.disabled = false; // Włącz przycisk "Wyślij" dla nowego pytania
      updateRemaining(); // Aktualizuj liczbę pozostałych pytań
    } else {
      showSummary();
    }
  }

  // Funkcja do aktualizacji liczby pozostałych pytań
  function updateRemaining() {
    const remainingQuestions = questions.length - currentQuestionIndex;
    remainingElement.textContent = `Pozostało pytań: ${remainingQuestions}`;
  }

  // Funkcja do usuwania polskich znaków specjalnych
  function removePolishChars(text) {
    return text
      .toLowerCase()
      .replace(/[ąćęłńóśźż]/g, (char) => {
        const polishChars = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' };
        return polishChars[char] || char;
      });
  }

  submitButton.addEventListener('click', () => {
    const userAnswer = removePolishChars(answerInput.value.trim()); // Usuń polskie znaki i zamień na małe litery
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = removePolishChars(currentQuestion.answer); // Usuń polskie znaki i zamień na małe litery

    submitButton.disabled = true; // Wyłącz przycisk "Wyślij" po kliknięciu

    if (userAnswer === correctAnswer) {
      resultElement.textContent = 'Gratulacje, to jest poprawna odpowiedź!';
      resultElement.className = 'correct';
      score++;
    } else {
      resultElement.textContent = `Niestety, to nie jest prawidłowa odpowiedź. Prawidłowa odpowiedź to: ${currentQuestion.answer}`;
      resultElement.className = 'incorrect';
      // Dodaj błędną odpowiedź do listy
      incorrectAnswersList.push({
        question: currentQuestion.question,
        userAnswer: answerInput.value.trim(),
        correctAnswer: currentQuestion.answer
      });
    }

    currentQuestionIndex++;
    updateScore();
    updateRemaining(); // Aktualizuj liczbę pozostałych pytań

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

    // Dodajemy specjalny komunikat, jeśli wszystkie odpowiedzi są poprawne
    if (correctAnswers === totalQuestions) {
      const perfectScoreMessage = document.createElement('p');
      perfectScoreMessage.textContent = 'Brawo! Udzieliłeś poprawnie odpowiedzi na wszystkie pytania!';
      perfectScoreMessage.style.color = '#4CAF50';
      perfectScoreMessage.style.fontSize = '28px';
      perfectScoreMessage.style.marginTop = '20px';
      summaryElement.insertBefore(perfectScoreMessage, restartButton);
    }

    // Wyświetl listę błędnych odpowiedzi
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
    incorrectAnswersList = []; // Wyczyść listę błędnych odpowiedzi
    questions = shuffleArray(questions);
    quizElement.style.display = 'block';
    summaryElement.style.display = 'none';
    updateScore();
    updateRemaining(); // Zresetuj licznik pozostałych pytań
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
