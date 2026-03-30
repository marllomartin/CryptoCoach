import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Input } from './ui/input';

// Simple math CAPTCHA - no external dependencies
export function SimpleCaptcha({ onVerify }) {
  const { t } = useTranslation();
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(false);
  
  const generateQuestion = useCallback(() => {
    const operators = ['+', '-', '×'];
    const op = operators[Math.floor(Math.random() * operators.length)];
    let n1, n2;
    
    if (op === '+') {
      n1 = Math.floor(Math.random() * 20) + 1;
      n2 = Math.floor(Math.random() * 20) + 1;
    } else if (op === '-') {
      n1 = Math.floor(Math.random() * 20) + 10;
      n2 = Math.floor(Math.random() * n1);
    } else {
      n1 = Math.floor(Math.random() * 10) + 1;
      n2 = Math.floor(Math.random() * 10) + 1;
    }
    
    setNum1(n1);
    setNum2(n2);
    setOperator(op);
    setUserAnswer('');
    setError(false);
    setIsVerified(false);
  }, []);
  
  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);
  
  const getCorrectAnswer = () => {
    switch (operator) {
      case '+': return num1 + num2;
      case '-': return num1 - num2;
      case '×': return num1 * num2;
      default: return 0;
    }
  };
  
  const handleVerify = () => {
    const correct = getCorrectAnswer();
    if (parseInt(userAnswer) === correct) {
      setIsVerified(true);
      setError(false);
      onVerify(true);
    } else {
      setError(true);
      setIsVerified(false);
      onVerify(false);
      setTimeout(() => {
        generateQuestion();
      }, 1500);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };
  
  if (isVerified) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="text-green-400 font-medium">{t('captcha.verified')}</span>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-muted/50 border border-border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">{t('captcha.title')}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={generateQuestion}
          className="h-8 px-2"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg border border-border">
          <span className="text-xl font-mono font-bold text-primary">
            {num1} {operator} {num2} = ?
          </span>
        </div>
        
        <Input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('captcha.placeholder')}
          className={`w-24 text-center ${error ? 'border-red-500' : ''}`}
          data-testid="captcha-input"
        />
        
        <Button
          type="button"
          onClick={handleVerify}
          disabled={!userAnswer}
          size="sm"
          data-testid="captcha-verify-btn"
        >
          {t('captcha.verify')}
        </Button>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <XCircle className="w-4 h-4" />
          {t('captcha.wrong')}
        </div>
      )}
    </div>
  );
}

export default SimpleCaptcha;
