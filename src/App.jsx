import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { RotateCcw, CheckCircle, XCircle } from 'lucide-react'
import './App.css'

// Quiz Configuration
const quizConfig = {
  mainTitle: "BigQuery Pro Module 1 Quiz - You're in! First steps to data analysis",
  welcomeMessage: "It is time to put your new knowledge to the test! I don't have to, and there is no pressure, but we encourage you to take the quiz to make sure you understood and remember the key information we provided.",
  currentQuizText: "Module 1 Quiz:",
  questionsText: "Questions",
  multipleChoiceFormat: "", // Removed as requested
  startButton: "Start Quiz",
  quizResultsTitle: "Quiz Results",
  youScoredText: "You scored",
  yourAnswerText: "Your answer:",
  correctAnswerText: "Correct answer:",
  takeQuizAgainButton: "Take Quiz Again",
  questionPrefix: "Question",
  ofText: "of",
  progressText: "Progress:",
  restartQuizButton: "Restart Quiz",
  nextQuestionButton: "Next Question",
  finishQuizButton: "Finish Quiz",
};

// Simple CSV parser that handles quoted fields
const parseCSV = (csvText) => {
  const lines = csvText.split(/\r\n|\n/);
  const questions = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = [];
    let inQuote = false;
    let currentField = '';

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    values.push(currentField.trim()); // Add the last field

    if (values.length >= 6 && values[0]) {
      const options = [];
      const optionMap = {}; // To map 'a', 'b', 'c', 'd' to actual option text
      for (let k = 1; k <= 4; k++) { // Assuming options are in columns 1 to 4
        if (values[k] && values[k].trim()) {
          const optionText = values[k].trim();
          options.push(optionText);
          optionMap[String.fromCharCode(96 + k)] = optionText; // 'a' for 1, 'b' for 2, etc.
        }
      }

      const correctOptionsLetters = values[5].trim().split(',').map(s => s.trim());
      const correctOptionsText = correctOptionsLetters.map(letter => optionMap[letter]).filter(Boolean);

      questions.push({
        question: values[0].trim(),
        options: options,
        correct: correctOptionsText,
      });
    }
  }
  return questions;
};

function App() {
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState(new Set())
  const [answers, setAnswers] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)

  useEffect(() => {
    fetch("/assets/quiz_questions.csv")
      .then((response) => response.text())
      .then((csv) => {
        const newQuestions = parseCSV(csv);
        if (newQuestions.length > 0) {
          setQuestions(newQuestions);
        }
      })
      .catch((error) => console.error("Error loading CSV:", error));
  }, []);

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswers(new Set())
    setAnswers([])
    setShowResults(false)
    setQuizStarted(false)
  }

  const startQuiz = () => {
    setQuizStarted(true)
  }

  const handleAnswerSelect = (answer) => {
    setSelectedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(answer)) {
        newSet.delete(answer);
      } else {
        newSet.add(answer);
      }
      return newSet;
    });
  };

  const handleNextQuestion = () => {
    const currentQ = questions[currentQuestion];
    const isCorrect = currentQ.correct.every(ans => selectedAnswers.has(ans)) && selectedAnswers.size === currentQ.correct.length;

    const newAnswers = [...answers, {
      question: currentQ.question,
      selected: Array.from(selectedAnswers),
      correct: currentQ.correct,
      isCorrect: isCorrect
    }]
    setAnswers(newAnswers)

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswers(new Set())
    } else {
      setShowResults(true)
    }
  }

  const calculateScore = () => {
    return answers.filter(answer => answer.isCorrect).length
  }

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800 mb-4">
              {quizConfig.mainTitle}
            </CardTitle>
            <p className="text-gray-600 mb-6">
              {quizConfig.welcomeMessage}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700 mb-2">
                {quizConfig.currentQuizText} {questions.length} {quizConfig.questionsText}
              </p>
              {quizConfig.multipleChoiceFormat && (
                <p className="text-sm text-gray-500">
                  {quizConfig.multipleChoiceFormat}
                </p>
              )}
            </div>
            <Button
              onClick={startQuiz}
              className="w-full text-lg py-6 Button"
            >
              {quizConfig.startButton}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showResults) {
    const score = calculateScore()
    const total = questions.length
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800 mb-4">
              {quizConfig.quizResultsTitle}
            </CardTitle>
            <div className={`text-6xl font-bold mb-4 ${getScoreColor(score, total)}`}>
              {score}/{total}
            </div>
            <p className="text-xl text-gray-600">
              {quizConfig.youScoredText} {Math.round((score/total) * 100)}%
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              {answers.map((answer, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {answer.isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-2">
                        {index + 1}. {answer.question}
                      </p>
                      <p className="text-sm text-gray-600">
                        {quizConfig.yourAnswerText} <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {answer.selected.join(', ')}
                        </span>
                      </p>
                      {!answer.isCorrect && (
                        <p className="text-sm text-gray-600">
                          {quizConfig.correctAnswerText} <span className="text-green-600">{answer.correct.join(', ')}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={resetQuiz}
              className="w-full text-lg py-6 Button"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              {quizConfig.takeQuizAgainButton}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {quizConfig.questionPrefix} {currentQuestion + 1} {quizConfig.ofText} {questions.length}
            </CardTitle>
            <div className="text-sm text-gray-500">
              {quizConfig.progressText} {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {questions[currentQuestion].question}
            </h2>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    selectedAnswers.has(option)
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={resetQuiz}
              className="Button"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {quizConfig.restartQuizButton}
            </Button>
            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswers.size === 0}
              className="Button"
            >
              {currentQuestion + 1 === questions.length ? quizConfig.finishQuizButton : quizConfig.nextQuestionButton}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default App


