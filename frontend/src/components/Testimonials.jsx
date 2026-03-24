import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

// Testimonials for pricing page
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Alexandre M.',
    role: { en: 'Software Developer', fr: 'Développeur', ar: 'مطور برمجيات' },
    avatar: 'AM',
    rating: 5,
    text: {
      en: "CryptoCoach transformed my understanding of crypto. The structured lessons and quizzes helped me go from zero to confidently managing my portfolio in just 2 months.",
      fr: "CryptoCoach a transformé ma compréhension de la crypto. Les leçons structurées et les quiz m'ont permis de passer de zéro à la gestion confiante de mon portefeuille en seulement 2 mois.",
      ar: "غير CryptoCoach فهمي للعملات المشفرة. ساعدتني الدروس المنظمة والاختبارات على الانتقال من الصفر إلى إدارة محفظتي بثقة في شهرين فقط."
    },
    highlight: { en: 'From zero to confident', fr: 'De zéro à confiant', ar: 'من الصفر إلى الثقة' }
  },
  {
    id: 2,
    name: 'Sophie L.',
    role: { en: 'Marketing Manager', fr: 'Responsable Marketing', ar: 'مديرة تسويق' },
    avatar: 'SL',
    rating: 5,
    text: {
      en: "The AI mentor is incredible! Whenever I have a question about a concept, I get instant, clear explanations. It's like having a personal crypto tutor 24/7.",
      fr: "Le mentor IA est incroyable ! Chaque fois que j'ai une question sur un concept, j'obtiens des explications instantanées et claires. C'est comme avoir un tuteur crypto personnel 24/7.",
      ar: "المرشد الذكي مذهل! كلما كان لدي سؤال حول مفهوم، أحصل على تفسيرات فورية وواضحة. إنه مثل وجود معلم عملات مشفرة شخصي على مدار الساعة."
    },
    highlight: { en: 'Personal tutor 24/7', fr: 'Tuteur personnel 24/7', ar: 'معلم شخصي 24/7' }
  },
  {
    id: 3,
    name: 'Mohamed K.',
    role: { en: 'Entrepreneur', fr: 'Entrepreneur', ar: 'رائد أعمال' },
    avatar: 'MK',
    rating: 5,
    text: {
      en: "The trading simulator was a game-changer. I practiced strategies without risking real money, and when I started trading for real, I already knew what to do.",
      fr: "Le simulateur de trading a tout changé. J'ai pratiqué des stratégies sans risquer d'argent réel, et quand j'ai commencé à trader pour de vrai, je savais déjà quoi faire.",
      ar: "كان محاكي التداول نقطة تحول. مارست الاستراتيجيات دون المخاطرة بأموال حقيقية، وعندما بدأت التداول الحقيقي، كنت أعرف بالفعل ما يجب فعله."
    },
    highlight: { en: 'Risk-free practice', fr: 'Pratique sans risque', ar: 'تدريب بدون مخاطر' }
  }
];

export function Testimonials({ language = 'en' }) {
  const sectionTitle = {
    en: 'What our students say',
    fr: 'Ce que disent nos étudiants',
    ar: 'ماذا يقول طلابنا'
  };
  
  return (
    <div className="py-12">
      <h2 className="text-2xl font-bold text-center text-white mb-8">
        {sectionTitle[language] || sectionTitle.en}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="relative p-6 bg-card border border-border rounded-2xl"
          >
            {/* Quote icon */}
            <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
            
            {/* Rating */}
            <div className="flex gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            
            {/* Text */}
            <p className={`text-slate-300 text-sm leading-relaxed mb-4 ${language === 'ar' ? 'text-right' : ''}`}>
              "{testimonial.text[language] || testimonial.text.en}"
            </p>
            
            {/* Highlight */}
            <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/30 rounded-full mb-4">
              <span className="text-xs font-medium text-primary">
                {testimonial.highlight[language] || testimonial.highlight.en}
              </span>
            </div>
            
            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <span className="text-sm font-bold text-white">{testimonial.avatar}</span>
              </div>
              <div>
                <p className="font-medium text-white">{testimonial.name}</p>
                <p className="text-xs text-slate-400">
                  {testimonial.role[language] || testimonial.role.en}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Testimonials;
