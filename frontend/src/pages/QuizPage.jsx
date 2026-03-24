import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API, useAuth } from '../App';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Award
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';

export default function QuizPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { token, refreshUser } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`${API}/lessons/${lessonId}/quiz`);
        setQuiz(response.data);
      } catch (e) {
        console.error('Failed to fetch quiz', e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [lessonId]);

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = async () => {
    if (!token || !quiz) return;
    
    setSubmitting(true);
    try {
      const response = await axios.post(`${API}/quizzes/submit`, {
        quiz_id: quiz.id,
        answers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(response.data);
      setSubmitted(true);
      await refreshUser();
      
      if (response.data.score >= 80) {
        toast.success(`Great job! ${response.data.score}% - You earned ${response.data.xp_earned} XP!`);
      } else {
        toast.info(`Score: ${response.data.score}%. Review the explanations and try again!`);
      }
    } catch (e) {
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-primary text-xl">Loading quiz...</div>
        </div>
      </Layout>
    );
  }

  if (!quiz) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Quiz not found</h1>
            <Link to="/academy">
              <Button>Back to Academy</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const allAnswered = quiz.questions.every(q => answers[q.id]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!submitted ? (
          <>
            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </span>
                <span className="text-sm text-primary font-medium">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </motion.div>

            {/* Question Card */}
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-card border-border mb-8">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl leading-relaxed">
                      {question.question}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[question.id] || ''}
                    onValueChange={(value) => handleAnswer(question.id, value)}
                    className="space-y-3"
                  >
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                          answers[question.id] === option
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-slate-600'
                        }`}
                        onClick={() => handleAnswer(question.id, option)}
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label 
                          htmlFor={`option-${index}`} 
                          className="flex-1 cursor-pointer text-slate-300"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                className="border-slate-700"
                onClick={() => setCurrentQuestion(prev => prev - 1)}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentQuestion < quiz.questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={!answers[question.id]}
                  className="bg-primary hover:bg-primary/90"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={submitQuiz}
                  disabled={!allAnswered || submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Question Navigator */}
            <div className="mt-8 flex flex-wrap gap-2 justify-center">
              {quiz.questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    index === currentQuestion
                      ? 'bg-primary text-white'
                      : answers[q.id]
                        ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                        : 'bg-muted text-slate-400 hover:bg-muted/80'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        ) : (
          /* Results */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Score Card */}
            <Card className={`border mb-8 ${results.score >= 80 ? 'border-green-500/30 bg-green-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
              <CardContent className="p-8 text-center">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  results.score >= 80 ? 'bg-green-500/20' : 'bg-amber-500/20'
                }`}>
                  {results.score >= 80 ? (
                    <Award className="w-10 h-10 text-green-500" />
                  ) : (
                    <HelpCircle className="w-10 h-10 text-amber-500" />
                  )}
                </div>
                <h2 className="font-heading text-3xl font-bold mb-2">
                  {results.score}%
                </h2>
                <p className="text-slate-400 mb-4">
                  {results.correct} of {results.total} correct
                </p>
                <p className="text-primary font-medium">
                  +{results.xp_earned} XP Earned
                </p>
              </CardContent>
            </Card>

            {/* Review Answers */}
            <h3 className="font-heading text-xl font-bold mb-4">Review Your Answers</h3>
            <div className="space-y-4 mb-8">
              {quiz.questions.map((q, index) => {
                const result = results.results.find(r => r.question_id === q.id);
                return (
                  <Card key={q.id} className={`border ${result.correct ? 'border-green-500/30' : 'border-red-500/30'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {result.correct ? (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-2">{q.question}</p>
                          <p className="text-sm text-slate-400 mb-1">
                            Your answer: <span className={result.correct ? 'text-green-500' : 'text-red-500'}>{answers[q.id]}</span>
                          </p>
                          {!result.correct && (
                            <p className="text-sm text-slate-400">
                              Correct answer: <span className="text-green-500">{result.correct_answer}</span>
                            </p>
                          )}
                          <p className="text-sm text-slate-500 mt-2 bg-muted p-2 rounded">
                            {result.explanation}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to={`/lesson/${lessonId}`}>
                <Button variant="outline" className="border-slate-700">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Lesson
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setResults(null);
                  setAnswers({});
                  setCurrentQuestion(0);
                }}
                variant="outline"
                className="border-slate-700"
              >
                Retake Quiz
              </Button>
              <Link to="/academy">
                <Button className="bg-primary hover:bg-primary/90">
                  Continue Learning
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
