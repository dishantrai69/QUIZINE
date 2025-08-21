const form = document.getElementById("quizForm");
const resultDiv = document.getElementById("quizResult");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultDiv.innerHTML = "Generating quiz...";

  const topic = document.getElementById("topic").value;
  const numQuestions = parseInt(document.getElementById("numQuestions").value);

  try {
    const response = await fetch("/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, numQuestions })
    });

    const quiz = await response.json();

    // Clear previous results
    resultDiv.innerHTML = "";

    quiz.forEach((q, index) => {
      const questionDiv = document.createElement("div");
      questionDiv.classList.add("question-block");

      const questionTitle = document.createElement("h3");
      questionTitle.textContent = `${index + 1}. ${q.question}`;
      questionDiv.appendChild(questionTitle);

      q.options.forEach((opt) => {
        const optionLabel = document.createElement("label");
        optionLabel.style.display = "block";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = `q${index}`;
        radio.value = opt;

        optionLabel.appendChild(radio);
        optionLabel.appendChild(document.createTextNode(opt));
        questionDiv.appendChild(optionLabel);
      });

      // Show correct answer (optional)
      const answerBtn = document.createElement("button");
      answerBtn.textContent = "Show Answer";
      answerBtn.addEventListener("click", () => {
        alert(`Correct Answer: ${q.correctAnswer}`);
      });
      questionDiv.appendChild(answerBtn);

      resultDiv.appendChild(questionDiv);
      resultDiv.appendChild(document.createElement("hr"));
    });

  } catch (err) {
    console.error("Error fetching quiz:", err);
    resultDiv.innerHTML = "Failed to generate quiz. Try again.";
  }
});
