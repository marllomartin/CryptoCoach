import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle, Lightbulb, Brain, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export function LessonCheckpoint({ checkpoint, onComplete }) {
  const { t } = useTranslation();
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const isCorrect = selectedAnswer === checkpoint.answer;

  const handleAnswer = (index) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    setShowExplanation(true);
    
    if (onComplete) {
      onComplete(checkpoint.id, index === checkpoint.answer);
    }
  };

  const getIcon = () => {
    switch (checkpoint.type) {
      case 'quiz': return <Brain className="w-5 h-5" />;
      case 'reflection': return <Lightbulb className="w-5 h-5" />;
      case 'simulation': return <Target className="w-5 h-5" />;
      case 'interactive': return <HelpCircle className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (checkpoint.type) {
      case 'quiz': return t('checkpoint.quizCheckpoint');
      case 'reflection': return t('checkpoint.reflectionPoint');
      case 'simulation': return t('checkpoint.simulation');
      case 'interactive': return t('checkpoint.interactiveExercise');
      default: return 'Checkpoint';
    }
  };

  // Reflection type - no right/wrong answer
  if (checkpoint.type === 'reflection') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-8"
      >
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-amber-500 mb-4">
              <Lightbulb className="w-5 h-5" />
              <span className="font-semibold text-sm uppercase tracking-wide">
                {getTypeLabel()}
              </span>
            </div>
            
            <p className="text-lg font-medium text-foreground mb-4">
              {checkpoint.question}
            </p>
            
            {checkpoint.hint && (
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="text-amber-500"
                >
                  {showHint ? t('checkpoint.hideHint') : t('checkpoint.showHint')}
                </Button>
                
                <AnimatePresence>
                  {showHint && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-slate-400 mt-2 italic"
                    >
                      💡 {checkpoint.hint}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Simulation/Interactive type
  if (checkpoint.type === 'simulation' || checkpoint.type === 'interactive') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-8"
      >
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-purple-500 mb-4">
              {getIcon()}
              <span className="font-semibold text-sm uppercase tracking-wide">
                {checkpoint.title || getTypeLabel()}
              </span>
            </div>
            
            <p className="text-lg font-medium text-foreground mb-4">
              {checkpoint.scenario || checkpoint.question}
            </p>
            
            {checkpoint.options && (
              <div className="space-y-2">
                {checkpoint.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={answered}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      answered
                        ? index === checkpoint.correct
                          ? 'bg-green-500/20 border-green-500 text-green-400'
                          : selectedAnswer === index
                          ? 'bg-red-500/20 border-red-500 text-red-400'
                          : 'bg-muted/50 text-slate-500'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    } border ${
                      answered && index === checkpoint.correct
                        ? 'border-green-500'
                        : answered && selectedAnswer === index
                        ? 'border-red-500'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-background/50 flex items-center justify-center text-sm">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                      {answered && index === checkpoint.correct && (
                        <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                      )}
                      {answered && selectedAnswer === index && index !== checkpoint.correct && (
                        <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            <AnimatePresence>
              {showExplanation && checkpoint.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-background/50 rounded-lg"
                >
                  <p className="text-slate-300">
                    <strong>{t('checkpoint.explanation')}:</strong> {checkpoint.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Quiz type (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-8"
      data-testid={`checkpoint-${checkpoint.id}`}
    >
      <Card className={`border-2 transition-colors ${
        answered 
          ? isCorrect 
            ? 'bg-green-500/5 border-green-500/50' 
            : 'bg-red-500/5 border-red-500/50'
          : 'bg-primary/5 border-primary/30'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-primary mb-4">
            {getIcon()}
            <span className="font-semibold text-sm uppercase tracking-wide">
              {getTypeLabel()}
            </span>
            {answered && (
              <span className={`ml-auto flex items-center gap-1 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {isCorrect ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {t('checkpoint.correct')}
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    {t('checkpoint.incorrect')}
                  </>
                )}
              </span>
            )}
          </div>
          
          <p className="text-lg font-medium text-foreground mb-4">
            {checkpoint.question}
          </p>
          
          <div className="space-y-2">
            {checkpoint.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={answered}
                data-testid={`checkpoint-option-${index}`}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  answered
                    ? index === checkpoint.answer
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : selectedAnswer === index
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-muted/50 text-slate-500'
                    : 'bg-muted hover:bg-muted/80 text-foreground hover:border-primary/50'
                } border ${
                  answered && index === checkpoint.answer
                    ? 'border-green-500'
                    : answered && selectedAnswer === index
                    ? 'border-red-500'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                    answered && index === checkpoint.answer
                      ? 'bg-green-500 text-white'
                      : answered && selectedAnswer === index
                      ? 'bg-red-500 text-white'
                      : 'bg-background/50'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {answered && index === checkpoint.answer && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {answered && selectedAnswer === index && index !== checkpoint.answer && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <AnimatePresence>
            {showExplanation && checkpoint.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`mt-4 p-4 rounded-lg ${
                  isCorrect ? 'bg-green-500/10' : 'bg-blue-500/10'
                }`}
              >
                <p className="text-slate-300">
                  <strong className={isCorrect ? 'text-green-400' : 'text-blue-400'}>
                    {isCorrect ? '✓ ' : '💡 '}
                  </strong>
                  {checkpoint.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default LessonCheckpoint;
