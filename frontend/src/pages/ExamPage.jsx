import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API, useAuth } from '../App';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { showAchievementToasts } from '../utils/achievementToast';
import { 
  Clock, 
  AlertTriangle,
  CheckCircle, 
  XCircle,
  Award,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

export default function ExamPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showStartDialog, setShowStartDialog] = useState(true);
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(`${API}/exams/${courseId}`);
        setExam(response.data);
        setTimeRemaining(response.data.time_limit_minutes * 60);
      } catch (e) {
        console.error('Failed to fetch exam', e);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [courseId]);

  // Timer
  useEffect(() => {
    if (!examStarted || submitted || timeRemaining === null) return;
    
    if (timeRemaining <= 0) {
      submitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, submitted, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitExam = async () => {
    if (!token || !exam) return;
    
    setSubmitting(true);
    try {
      const response = await axios.post(`${API}/exams/submit`, {
        exam_id: exam.id,
        answers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(response.data);
      setSubmitted(true);
      await refreshUser();
      
      if (response.data.passed) {
        toast.success(t('exam.toastPassed', { score: response.data.score }));
      } else {
        toast.error(t('exam.toastFailed', { score: response.data.score }));
      }
      showAchievementToasts(response.data?.new_achievements);
    } catch (e) {
      toast.error(t('exam.toastError'));
    } finally {
      setSubmitting(false);
    }
  };

  const startExam = () => {
    setShowStartDialog(false);
    setExamStarted(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-primary text-xl">{t('exam.loading')}</div>
        </div>
      </Layout>
    );
  }

  if (!exam) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t('exam.notFound')}</h1>
            <Link to="/academy">
              <Button>{t('exam.backToAcademy')}</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const examTitle = exam.title || '';
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / exam.questions.length) * 100;

  return (
    <Layout>
      {/* Start Dialog */}
      <AlertDialog open={showStartDialog && !examStarted}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-xl">
              {examTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-slate-400">
              <p>{t('exam.aboutToStart')}</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  {t('exam.questions', { count: exam.questions.length })}
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {t('exam.minutesLimit', { minutes: exam.time_limit_minutes })}
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  {t('exam.requiredToPass')}
                </li>
              </ul>
              <p className="text-amber-500 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {t('exam.timerWarning')}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => navigate('/academy')} className="border-slate-700">
              {t('exam.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={startExam} className="bg-primary">
              {t('exam.start')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {examStarted && !submitted && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-heading text-2xl font-bold">{examTitle}</h1>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeRemaining < 300 ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
              <span>{t('exam.answered', { answered: answeredCount, total: exam.questions.length })}</span>
              <span>{t('exam.complete', { percent: Math.round(progress) })}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </motion.div>

          {/* Questions */}
          <div className="space-y-6 mb-8">
            {exam.questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border ${answers[question.id] ? 'border-green-500/30' : 'border-border'}`}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-start gap-3">
                      <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{question.question}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onValueChange={(value) => handleAnswer(question.id, value)}
                      className="space-y-2"
                    >
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            answers[question.id] === option
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-slate-600'
                          }`}
                          onClick={() => handleAnswer(question.id, option)}
                        >
                          <RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} />
                          <Label 
                            htmlFor={`q${index}-opt${optIndex}`}
                            className="flex-1 cursor-pointer text-slate-300 text-sm"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={submitExam}
              disabled={answeredCount < exam.questions.length || submitting}
              className="bg-green-600 hover:bg-green-700 px-8"
            >
              {submitting ? t('exam.submitting') : t('exam.submit')}
              <CheckCircle className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {submitted && results && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={`border ${results.passed ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'} mb-8`}>
              <CardContent className="p-8 text-center">
                <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                  results.passed ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {results.passed ? (
                    <Award className="w-12 h-12 text-green-500" />
                  ) : (
                    <XCircle className="w-12 h-12 text-red-500" />
                  )}
                </div>
                
                <h2 className="font-heading text-4xl font-bold mb-2">
                  {results.score}%
                </h2>
                
                <p className={`text-xl font-medium mb-4 ${results.passed ? 'text-green-500' : 'text-red-500'}`}>
                  {results.passed ? t('exam.passed') : t('exam.notPassed')}
                </p>

                <p className="text-slate-400 mb-6">
                  {t('exam.correctAnswers', { correct: results.correct, total: results.total })}
                </p>

                {results.passed && results.certificate_id && (
                  <div className="bg-card border border-border rounded-lg p-4 mb-6">
                    <p className="text-sm text-slate-400 mb-2">{t('exam.certificateEarned')}</p>
                    <p className="font-heading font-bold text-lg text-primary">
                      {results.certificate_name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-4 justify-center">
              {results.passed ? (
                <>
                  <Link to="/certificates">
                    <Button className="bg-primary hover:bg-primary/90">
                      {t('exam.viewCertificates')}
                      <Award className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/academy">
                    <Button variant="outline" className="border-slate-700">
                      {t('exam.continueLearning')}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setResults(null);
                      setAnswers({});
                      setTimeRemaining(exam.time_limit_minutes * 60);
                      setShowStartDialog(true);
                      setExamStarted(false);
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {t('exam.retake')}
                  </Button>
                  <Link to="/academy">
                    <Button variant="outline" className="border-slate-700">
                      {t('exam.reviewLessons')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
