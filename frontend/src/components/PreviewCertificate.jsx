// Preview Certificate Component
// Shows a "Level 1 in progress" certificate to motivate users

import React from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, Target, Star, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export function PreviewCertificate({ 
  courseName = "Crypto Foundations",
  completedLessons = 0,
  totalLessons = 8,
  userName = "Apprenant",
  isLocked = true
}) {
  const navigate = useNavigate();
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {/* Certificate Card */}
      <div className={`relative bg-gradient-to-br from-amber-900/30 via-amber-800/20 to-yellow-900/30 border-2 ${isLocked ? 'border-amber-500/30' : 'border-amber-500'} rounded-2xl p-8 overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-500/10 rounded-full translate-x-1/2 translate-y-1/2" />
        
        {/* Lock overlay for incomplete */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
            <div className="text-center">
              <Lock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <p className="text-amber-300 font-medium">Terminez le cours pour débloquer</p>
              <p className="text-sm text-amber-400/70 mt-1">{completedLessons}/{totalLessons} leçons complétées</p>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="relative text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-amber-100">Certificat de Réussite</h3>
          <p className="text-amber-400/80 text-sm mt-1">TheCryptoCoach Academy</p>
        </div>
        
        {/* Body */}
        <div className="relative text-center space-y-4">
          <p className="text-amber-200/70">Ce certificat atteste que</p>
          <p className="text-3xl font-bold text-white">{userName}</p>
          <p className="text-amber-200/70">a complété avec succès le cours</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="text-lg font-semibold text-amber-200">{courseName}</span>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="relative mt-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-amber-400/70">Progression</span>
            <span className="text-amber-300 font-medium">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-amber-900/50 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <div className="flex items-center justify-center gap-1 mt-3">
            {[...Array(totalLessons)].map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full ${i < completedLessons ? 'bg-amber-400' : 'bg-amber-800'}`}
              />
            ))}
          </div>
        </div>
        
        {/* Stars decoration */}
        <div className="absolute top-4 right-4 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < Math.ceil(progressPercent / 33) ? 'text-amber-400 fill-amber-400' : 'text-amber-700'}`} 
            />
          ))}
        </div>
      </div>
      
      {/* CTA for locked certificate */}
      {isLocked && progressPercent < 100 && (
        <div className="mt-4 text-center">
          <Button 
            onClick={() => navigate('/academy')}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:opacity-90"
          >
            <Target className="w-4 h-4 mr-2" />
            Continuer le cours
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// Mini version for sidebar or dashboard
export function MiniCertificateProgress({ 
  courseName = "Crypto Foundations",
  completedLessons = 0,
  totalLessons = 8
}) {
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);
  
  return (
    <div className="p-4 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <Award className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="font-medium text-amber-100">{courseName}</p>
          <p className="text-xs text-amber-400/70">Certificat en cours</p>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-amber-400/70">{completedLessons}/{totalLessons} leçons</span>
          <span className="text-amber-300">{progressPercent}%</span>
        </div>
        <div className="h-1.5 bg-amber-900/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default PreviewCertificate;
