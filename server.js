const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Use environment variable for API key
const API_KEY = "AIzaSyBIegE8t8lWsPbJzt-FHBx5DxpfWsjqF3g";

app.post("/generate-quiz", async (req, res) => {
  const { topic, numQuestions } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate exactly ${numQuestions} multiple-choice questions about "${topic}". 
Return only a JSON array in this format: [{"question":"...","options":["..."],"correctAnswer":"..."}]. 
Do not include any extra text or explanation.`
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      let quizText = data.candidates[0].content.parts[0].text;

      // Remove ```json ``` if AI wraps it
      quizText = quizText.replace(/```json|```/g, '').trim();

      try {
        const quiz = JSON.parse(quizText);
        return res.json(quiz);
      } catch (e) {
        console.error("Failed to parse AI response, sending fallback:", e);
      }
    }

    // Fallback
    res.json(Array.from({ length: numQuestions }, (_, i) => ({
      question: `Sample question ${i + 1}?`,
      options: ["Option 1","Option 2","Option 3","Option 4"],
      correctAnswer: "Option 1"
    })));

  } catch (err) {
    console.error("Error generating quiz:", err);
    res.json(Array.from({ length: numQuestions }, (_, i) => ({
      question: `Sample question ${i + 1}?`,
      options: ["Option 1","Option 2","Option 3","Option 4"],
      correctAnswer: "Option 1"
    })));
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Use Render port or default 5001
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
