import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const COURSE_LEVELS = {
  'course-foundations': 1,
  'course-investor': 2,
  'course-strategist': 3,
};

// Progress to certificate bar
export function CertificateProgress({ completedLessons = 0, totalLessons = 23, courseId }) {
  const { t } = useTranslation();
  const progress = (completedLessons / totalLessons) * 100;
  const examLevel = courseId ? (COURSE_LEVELS[courseId] ?? 1) : 1;
  const examLink = `/exam/${examLevel}`;
  const remaining = totalLessons - completedLessons;
  
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
          <span className="text-sm font-medium text-white">{t('certificate.title')}</span>
        </div>
        
        {isComplete ? (
          <Link
            to={examLink}
            className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 transition-colors"
          >
            {t('certificate.takeExam')}
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className={`text-sm font-medium ${isAlmostThere ? 'text-amber-400' : 'text-slate-400'}`}>
            {isAlmostThere && t('certificate.almostThere') + ' '}
            {remaining} {t('certificate.remaining')}
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
