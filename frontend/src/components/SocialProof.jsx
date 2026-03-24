import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Clock, Award } from 'lucide-react';

// Social proof component - shows real-time stats
export function SocialProof({ stats, language = 'en' }) {
  const labels = {
    en: {
      students: 'students enrolled this week',
      courses: 'courses completed today',
      online: 'learners online now',
      certificates: 'certificates earned'
    },
    fr: {
      students: 'étudiants inscrits cette semaine',
      courses: 'cours terminés aujourd\'hui',
      online: 'apprenants en ligne',
      certificates: 'certificats obtenus'
    },
    ar: {
      students: 'طالب مسجل هذا الأسبوع',
      courses: 'دورة مكتملة اليوم',
      online: 'متعلم متصل الآن',
      certificates: 'شهادة حصل عليها'
    }
  };
  
  const t = labels[language] || labels.en;
  
  // Default stats if not provided
  const defaultStats = {
    studentsThisWeek: 127,
    coursesToday: 43,
    onlineNow: 28,
    certificatesTotal: 512
  };
  
  const data = stats || defaultStats;
  
  const items = [
    {
      icon: Users,
      value: data.studentsThisWeek,
      label: t.students,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: TrendingUp,
      value: data.coursesToday,
      label: t.courses,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: Clock,
      value: data.onlineNow,
      label: t.online,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      pulse: true
    },
    {
      icon: Award,
      value: data.certificatesTotal,
      label: t.certificates,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl ${item.bgColor} border border-border/50`}
          >
            <div className="flex items-center gap-3">
              <div className={`relative ${item.pulse ? 'animate-pulse' : ''}`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
                {item.pulse && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>
              <div>
                <p className={`text-2xl font-bold ${item.color}`}>
                  {item.value.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">{item.label}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Mini version for sidebars
export function SocialProofMini({ language = 'en' }) {
  const labels = {
    en: 'students enrolled this week',
    fr: 'étudiants inscrits cette semaine',
    ar: 'طالب مسجل هذا الأسبوع'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full"
    >
      <div className="flex -space-x-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-purple-500 border-2 border-background flex items-center justify-center"
          >
            <span className="text-[8px] text-white font-bold">
              {['JD', 'AS', 'MK'][i]}
            </span>
          </div>
        ))}
      </div>
      <span className="text-xs text-slate-300">
        <span className="font-bold text-primary">127+</span> {labels[language] || labels.en}
      </span>
    </motion.div>
  );
}

export default SocialProof;
