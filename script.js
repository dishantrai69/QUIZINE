const form = document.getElementById("quizForm");
const submitBtn = document.getElementById("submitBtn");
const restartBtn = document.getElementById("restartBtn");
const topicInput = document.getElementById("topicInput");
const generateBtn = document.getElementById("generateBtn");
const themeToggle = document.getElementById("themeToggle");

let quizData = [];
let isDark = false;

// Fetch quiz from backend
async function fetchQuiz(topic = "general knowledge", numQuestions = 5) {
  try {
    const res = await fetch("/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, numQuestions })
    });
    quizData = await res.json();
    renderQuiz();
  } catch (e) {
    console.error(e);
    form.innerHTML = "<p>Failed to load quiz. Please try again.</p>";
  }
}

// Render quiz questions
function renderQuiz() {
  form.innerHTML = "";
  quizData.forEach((q, i) => {
    const card = document.createElement("div");
    card.classList.add("question-card");

    const question = document.createElement("h3");
    question.textContent = `${i + 1}. ${q.question}`;
    card.appendChild(question);

    const optionsDiv = document.createElement("div");
    optionsDiv.classList.add("options");

    q.options.forEach(opt => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `question-${i}`;
      input.value = opt;
      label.appendChild(input);
      label.append(opt);
      optionsDiv.appendChild(label);
    });

    card.appendChild(optionsDiv);
    form.appendChild(card);
  });
}

// Submit answers
submitBtn.addEventListener("click", () => {
  let score = 0;
  quizData.forEach((q, i) => {
    const selected = form[`question-${i}`].value;
    if (selected === q.correctAnswer) score++;
  });
  alert(`Your score: ${score}/${quizData.length}`);
  launchConfetti();
});

// Restart
restartBtn.addEventListener("click", () => fetchQuiz(topicInput.value || "general knowledge"));

// Generate new quiz by topic
generateBtn.addEventListener("click", () => fetchQuiz(topicInput.value || "general knowledge"));

// Toggle dark mode
themeToggle.addEventListener("click", () => {
  isDark = !isDark;
  document.body.classList.toggle("dark", isDark);
  themeToggle.textContent = isDark ? "☀️" : "🌙";
});

// Confetti celebration
function launchConfetti() {
  const duration = 2 * 1000;
  const end = Date.now() + duration;
  const colors = ['#007aff','#ff2d55','#ff9500','#34c759','#af52de','#ff3b30'];

  (function frame() {
    const timeLeft = end - Date.now();
    const particleCount = Math.floor(50 * (timeLeft / duration));

    confetti({
      particleCount,
      angle: Math.random() * 120 + 60,
      spread: Math.random() * 80 + 40,
      origin: { x: Math.random(), y: Math.random() * 0.6 },
      colors,
      gravity: 0.6,
      scalar: Math.random() * 0.8 + 0.8,
      drift: (Math.random() - 0.5) * 2
    });

    if (timeLeft > 0) requestAnimationFrame(frame);
  })();
}

// Initial fetch
fetchQuiz();
