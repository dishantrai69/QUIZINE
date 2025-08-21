const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const API_KEY = "AIzaSyBIegE8t8lWsPbJzt-FHBx5DxpfWsjqF3g";

// Helper to generate fallback questions
function generateFallbackQuestions(topic, numQuestions) {
  const sampleOptions = [
    "Option A", "Option B", "Option C", "Option D"
  ];

  return Array.from({ length: numQuestions }, (_, i) => ({
    question: `Question ${i + 1} about ${topic}?`,
    options: sampleOptions.sort(() => Math.random() - 0.5), // shuffle options
    correctAnswer: sampleOptions[0] // first option is correct
  }));
}

app.post("/generate-quiz", async (req, res) => {
  const { topic, numQuestions, difficulty } = req.body;
  console.log("Quiz request:", topic, numQuestions, difficulty);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate exactly ${numQuestions} multiple-choice questions about "${topic}" with "${difficulty}" difficulty.
Return only a JSON array in this format: [{"question":"...","options":["..."],"correctAnswer":"..."}]. 
Do not include any extra text or explanation.`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    console.log("Gemini raw response:", data);

    if (data.candidates && data.candidates.length > 0) {
      let quizText = data.candidates[0].content.parts[0].text;
      quizText = quizText.replace(/^```json/, '').replace(/```$/, '').trim();

      try {
        const quiz = JSON.parse(quizText);
        return res.json(quiz);
      } catch (e) {
        console.error("Failed to parse AI response, using fallback:", e);
        return res.json(generateFallbackQuestions(topic, numQuestions));
      }
    }

    res.json(generateFallbackQuestions(topic, numQuestions));

  } catch (err) {
    console.error("Error generating quiz, using fallback:", err);
    res.json(generateFallbackQuestions(topic, numQuestions));
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
