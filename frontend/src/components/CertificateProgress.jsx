import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, ChevronRight } from 'lucide-react';

// Progress to certificate bar
export function CertificateProgress({ completedLessons = 0, totalLessons = 23, language = 'en' }) {
  const progress = (completedLessons / totalLessons) * 100;
  const remaining = totalLessons - completedLessons;
  
  const labels = {
    en: {
      title: 'Your path to certification',
      remaining: 'lessons to certificate',
      complete: 'Ready for certification!',
      almostThere: 'Almost there!',
      takeExam: 'Take the exam'
    },
    fr: {
      title: 'Votre chemin vers la certification',
      remaining: 'leçons avant le certificat',
      complete: 'Prêt pour la certification !',
      almostThere: 'Presque terminé !',
      takeExam: 'Passer l\'examen'
    },
    ar: {
      title: 'طريقك للشهادة',
      remaining: 'درس للشهادة',
      complete: 'جاهز للشهادة!',
      almostThere: 'على وشك الانتهاء!',
      takeExam: 'قدم الامتحان'
    }
  };
  
  const t = labels[language] || labels.en;
  
  const isComplete = completedLessons >= totalLessons;
  const isAlmostThere = remaining <= 3 && !isComplete;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${
        isComplete 
          ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30' 
          : isAlmostThere 
            ? 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30'
            : 'bg-card border-border'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className={`w-5 h-5 ${isComplete ? 'text-green-400' : isAlmostThere ? 'text-amber-400' : 'text-primary'}`} />
          <span className="text-sm font-medium text-white">{t.title}</span>
        </div>
        
        {isComplete ? (
          <Link 
            to="/exam/final"
            className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 transition-colors"
          >
            {t.takeExam}
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className={`text-sm font-medium ${isAlmostThere ? 'text-amber-400' : 'text-slate-400'}`}>
            {isAlmostThere && t.almostThere + ' '}
            {remaining} {t.remaining}
          </span>
        )}
      </div>
      
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`absolute inset-y-0 left-0 rounded-full ${
            isComplete 
              ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
              : isAlmostThere
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-primary to-purple-500'
          }`}
        />
        
        {/* Milestone markers */}
        <div className="absolute inset-0 flex justify-between px-1">
          {[25, 50, 75].map((milestone) => (
            <div
              key={milestone}
              className={`w-0.5 h-full ${
                progress >= milestone ? 'bg-white/30' : 'bg-slate-600'
              }`}
              style={{ marginLeft: `${milestone}%` }}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-slate-500">
        <span>{completedLessons}/{totalLessons}</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </motion.div>
  );
}

export default CertificateProgress;
