import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, GraduationCap } from 'lucide-react';

// Coach tips for each lesson - personalized advice
const COACH_TIPS = {
  // Level 1 - Foundations
  'course-foundations-lesson-1': {
    en: "Remember: Bitcoin was created as a response to the 2008 financial crisis. Understanding this context will help you appreciate why decentralization matters so much in crypto.",
    fr: "Rappelle-toi : Bitcoin a été créé en réponse à la crise financière de 2008. Comprendre ce contexte t'aidera à apprécier pourquoi la décentralisation est si importante en crypto.",
    ar: "تذكر: تم إنشاء بيتكوين كرد فعل على الأزمة المالية لعام 2008. فهم هذا السياق سيساعدك على تقدير أهمية اللامركزية في العملات المشفرة."
  },
  'course-foundations-lesson-2': {
    en: "Pro tip: Always verify wallet addresses character by character before sending large amounts. One wrong character means lost funds forever!",
    fr: "Conseil pro : Vérifie toujours les adresses de portefeuille caractère par caractère avant d'envoyer de gros montants. Un seul caractère erroné signifie des fonds perdus à jamais !",
    ar: "نصيحة احترافية: تحقق دائمًا من عناوين المحفظة حرفًا بحرف قبل إرسال مبالغ كبيرة. حرف واحد خاطئ يعني خسارة الأموال للأبد!"
  },
  'course-foundations-lesson-3': {
    en: "Your seed phrase is your crypto lifeline. Write it on paper, store it in multiple secure locations, and NEVER store it digitally or share it with anyone.",
    fr: "Ta phrase de récupération est ta bouée de sauvetage crypto. Écris-la sur papier, stocke-la dans plusieurs endroits sécurisés, et ne la stocke JAMAIS numériquement ni ne la partage avec quiconque.",
    ar: "عبارة الاسترداد الخاصة بك هي شريان حياتك في العملات المشفرة. اكتبها على ورق، خزنها في أماكن آمنة متعددة، ولا تخزنها رقميًا أبدًا ولا تشاركها مع أي شخص."
  },
  'course-foundations-lesson-4': {
    en: "Security is not an option, it's a necessity. Enable 2FA on all your crypto accounts and use a password manager for unique, strong passwords.",
    fr: "La sécurité n'est pas une option, c'est une nécessité. Active le 2FA sur tous tes comptes crypto et utilise un gestionnaire de mots de passe pour des mots de passe uniques et forts.",
    ar: "الأمان ليس خيارًا، إنه ضرورة. قم بتفعيل المصادقة الثنائية على جميع حساباتك وaستخدم مدير كلمات المرور."
  },
  'course-foundations-lesson-5': {
    en: "Start with reputable exchanges (Binance, Coinbase, Kraken) and always withdraw your long-term holdings to a personal wallet. Not your keys, not your coins!",
    fr: "Commence avec des exchanges réputés (Binance, Coinbase, Kraken) et retire toujours tes avoirs à long terme vers un portefeuille personnel. Pas tes clés, pas tes coins !",
    ar: "ابدأ بمنصات تداول موثوقة وقم دائمًا بسحب ممتلكاتك طويلة الأجل إلى محفظة شخصية. ليست مفاتيحك، ليست عملاتك!"
  },
  'course-foundations-lesson-6': {
    en: "Stablecoins are your safe harbor during market volatility. Learn to use them strategically to protect profits and prepare for buying opportunities.",
    fr: "Les stablecoins sont ton refuge pendant la volatilité du marché. Apprends à les utiliser stratégiquement pour protéger tes profits et te préparer aux opportunités d'achat.",
    ar: "العملات المستقرة هي ملاذك الآمن خلال تقلبات السوق. تعلم استخدامها بشكل استراتيجي لحماية أرباحك."
  },
  'course-foundations-lesson-7': {
    en: "The best time to learn about crypto was yesterday. The second best time is now. Stay curious and never stop learning!",
    fr: "Le meilleur moment pour apprendre la crypto était hier. Le deuxième meilleur moment est maintenant. Reste curieux et n'arrête jamais d'apprendre !",
    ar: "أفضل وقت لتعلم العملات المشفرة كان بالأمس. ثاني أفضل وقت هو الآن. ابق فضوليًا ولا تتوقف عن التعلم!"
  },
  'course-foundations-lesson-8': {
    en: "You've completed the foundations! You now understand more about crypto than 95% of the population. Keep building on this knowledge.",
    fr: "Tu as terminé les fondamentaux ! Tu comprends maintenant plus sur la crypto que 95% de la population. Continue à construire sur ces connaissances.",
    ar: "لقد أكملت الأساسيات! أنت الآن تفهم العملات المشفرة أكثر من 95% من السكان. استمر في البناء على هذه المعرفة."
  },
  
  // Level 2 - Investor
  'course-investor-lesson-1': {
    en: "When evaluating altcoins, always check: team background, tokenomics, use case, community size, and GitHub activity. Due diligence saves portfolios!",
    fr: "Lors de l'évaluation des altcoins, vérifie toujours : l'équipe, la tokenomics, le cas d'usage, la taille de la communauté et l'activité GitHub. La due diligence sauve les portefeuilles !",
    ar: "عند تقييم العملات البديلة، تحقق دائمًا من: خلفية الفريق، اقتصاديات الرمز، حالة الاستخدام، حجم المجتمع، ونشاط GitHub."
  },
  'course-investor-lesson-2': {
    en: "Tokenomics is the DNA of a crypto project. Understand supply, distribution, vesting schedules, and utility before investing.",
    fr: "La tokenomics est l'ADN d'un projet crypto. Comprends l'offre, la distribution, les calendriers de vesting et l'utilité avant d'investir.",
    ar: "اقتصاديات الرمز هي الحمض النووي لمشروع العملات المشفرة. افهم العرض والتوزيع وجداول الاستحقاق والفائدة قبل الاستثمار."
  },
  'course-investor-lesson-3': {
    en: "DeFi is powerful but risky. Start with small amounts, use established protocols, and always check for audits before depositing funds.",
    fr: "La DeFi est puissante mais risquée. Commence avec de petits montants, utilise des protocoles établis et vérifie toujours les audits avant de déposer des fonds.",
    ar: "التمويل اللامركزي قوي لكنه محفوف بالمخاطر. ابدأ بمبالغ صغيرة، استخدم بروتوكولات راسخة، وتحقق دائمًا من عمليات التدقيق."
  },
  'course-investor-lesson-4': {
    en: "NFTs are more than JPEGs - they're programmable ownership. Focus on utility, community, and long-term vision when evaluating projects.",
    fr: "Les NFTs sont plus que des JPEGs - c'est la propriété programmable. Concentre-toi sur l'utilité, la communauté et la vision à long terme lors de l'évaluation des projets.",
    ar: "NFTs أكثر من مجرد صور - إنها ملكية قابلة للبرمجة. ركز على الفائدة والمجتمع والرؤية طويلة المدى."
  },
  'course-investor-lesson-5': {
    en: "On-chain data doesn't lie. Learn to read whale movements, exchange flows, and holder behavior to gain an edge in your analysis.",
    fr: "Les données on-chain ne mentent pas. Apprends à lire les mouvements des baleines, les flux d'exchange et le comportement des holders pour avoir un avantage dans ton analyse.",
    ar: "بيانات السلسلة لا تكذب. تعلم قراءة تحركات الحيتان وتدفقات المنصات وسلوك الحاملين للحصول على ميزة في تحليلك."
  },
  'course-investor-lesson-6': {
    en: "Markets move in cycles. Learn to identify accumulation, markup, distribution, and markdown phases to time your entries and exits better.",
    fr: "Les marchés évoluent en cycles. Apprends à identifier les phases d'accumulation, de markup, de distribution et de markdown pour mieux timer tes entrées et sorties.",
    ar: "الأسواق تتحرك في دورات. تعلم تحديد مراحل التراكم والارتفاع والتوزيع والانخفاض لتوقيت دخولك وخروجك بشكل أفضل."
  },
  'course-investor-lesson-7': {
    en: "Risk management is what separates successful traders from gamblers. Never invest more than you can afford to lose, and always have an exit strategy.",
    fr: "La gestion des risques est ce qui sépare les traders à succès des joueurs. N'investis jamais plus que ce que tu peux te permettre de perdre, et aie toujours une stratégie de sortie.",
    ar: "إدارة المخاطر هي ما يفصل المتداولين الناجحين عن المقامرين. لا تستثمر أبدًا أكثر مما يمكنك تحمل خسارته."
  },
  'course-investor-lesson-8': {
    en: "Layer 2 solutions are the future of blockchain scalability. Understanding them now will give you a significant advantage as adoption grows.",
    fr: "Les solutions Layer 2 sont l'avenir de la scalabilité blockchain. Les comprendre maintenant te donnera un avantage significatif avec la croissance de l'adoption.",
    ar: "حلول الطبقة الثانية هي مستقبل قابلية توسع البلوكتشين. فهمها الآن سيمنحك ميزة كبيرة مع نمو التبني."
  },
  
  // Level 3 - Strategist
  'course-strategist-lesson-1': {
    en: "Technical analysis is a tool, not a crystal ball. Combine it with fundamental analysis and market sentiment for the best results.",
    fr: "L'analyse technique est un outil, pas une boule de cristal. Combine-la avec l'analyse fondamentale et le sentiment du marché pour les meilleurs résultats.",
    ar: "التحليل الفني أداة، وليس كرة بلورية. ادمجه مع التحليل الأساسي ومشاعر السوق للحصول على أفضل النتائج."
  },
  'course-strategist-lesson-2': {
    en: "Your biggest enemy in trading is yourself. Master your emotions, stick to your strategy, and avoid FOMO and panic selling at all costs.",
    fr: "Ton plus grand ennemi en trading, c'est toi-même. Maîtrise tes émotions, respecte ta stratégie et évite le FOMO et la vente panique à tout prix.",
    ar: "أكبر عدو لك في التداول هو نفسك. تحكم في عواطفك، التزم باستراتيجيتك، وتجنب الخوف من الفوات والبيع المذعور."
  },
  'course-strategist-lesson-3': {
    en: "A well-diversified portfolio across different sectors (DeFi, L1s, L2s, Gaming) reduces risk while maintaining upside potential.",
    fr: "Un portefeuille bien diversifié à travers différents secteurs (DeFi, L1s, L2s, Gaming) réduit le risque tout en maintenant le potentiel de hausse.",
    ar: "محفظة متنوعة جيدًا عبر قطاعات مختلفة تقلل المخاطر مع الحفاظ على إمكانية الصعود."
  },
  'course-strategist-lesson-4': {
    en: "Macro trends drive crypto markets. Follow Fed policy, inflation data, and global liquidity to anticipate major market movements.",
    fr: "Les tendances macro dirigent les marchés crypto. Suis la politique de la Fed, les données d'inflation et la liquidité mondiale pour anticiper les mouvements majeurs.",
    ar: "الاتجاهات الكلية تحرك أسواق العملات المشفرة. تابع سياسة الفيدرالي وبيانات التضخم والسيولة العالمية."
  },
  'course-strategist-lesson-5': {
    en: "Advanced metrics like MVRV, SOPR, and NVT ratio can help you identify market tops and bottoms with higher accuracy than price alone.",
    fr: "Les métriques avancées comme MVRV, SOPR et le ratio NVT peuvent t'aider à identifier les sommets et les creux du marché avec plus de précision que le prix seul.",
    ar: "المقاييس المتقدمة مثل MVRV و SOPR و NVT يمكن أن تساعدك في تحديد قمم وقيعان السوق بدقة أعلى."
  },
  'course-strategist-lesson-6': {
    en: "Before investing in any project, spend at least a week researching. Read the whitepaper, join the Discord, and analyze the team's track record.",
    fr: "Avant d'investir dans un projet, passe au moins une semaine à rechercher. Lis le whitepaper, rejoins le Discord et analyse le parcours de l'équipe.",
    ar: "قبل الاستثمار في أي مشروع، اقضِ أسبوعًا على الأقل في البحث. اقرأ الورقة البيضاء، انضم إلى Discord، وحلل سجل الفريق."
  },
  'course-strategist-lesson-7': {
    en: "Congratulations, Coach! You've mastered the art and science of crypto investing. Now it's time to apply your knowledge and build your wealth. The future is decentralized!",
    fr: "Félicitations, Coach ! Tu as maîtrisé l'art et la science de l'investissement crypto. Il est maintenant temps d'appliquer tes connaissances et de construire ta richesse. L'avenir est décentralisé !",
    ar: "تهانينا، مدرب! لقد أتقنت فن وعلم الاستثمار في العملات المشفرة. حان الوقت الآن لتطبيق معرفتك وبناء ثروتك. المستقبل لامركزي!"
  }
};

// Default tip if lesson not found
const DEFAULT_TIP = {
  en: "Keep learning and stay curious! Every lesson brings you closer to crypto mastery. Remember: knowledge is your greatest investment.",
  fr: "Continue à apprendre et reste curieux ! Chaque leçon te rapproche de la maîtrise crypto. Rappelle-toi : la connaissance est ton meilleur investissement.",
  ar: "استمر في التعلم وابق فضوليًا! كل درس يقربك من إتقان العملات المشفرة. تذكر: المعرفة هي أفضل استثمار لك."
};

export function CoachTip({ lessonId, language = 'en' }) {
  const tip = COACH_TIPS[lessonId]?.[language] || COACH_TIPS[lessonId]?.['en'] || DEFAULT_TIP[language] || DEFAULT_TIP['en'];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="my-8 relative"
    >
      <div className="absolute -top-4 left-6 z-10">
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg">
          <GraduationCap className="w-5 h-5 text-white" />
          <span className="text-sm font-bold text-white">
            {language === 'fr' ? 'Conseil du Coach' : language === 'ar' ? 'نصيحة المدرب' : 'Coach\'s Tip'}
          </span>
        </div>
      </div>
      
      <div className="pt-6 p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-amber-500/30 rounded-2xl">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <p className={`text-slate-200 leading-relaxed text-lg ${language === 'ar' ? 'text-right' : ''}`}>
              "{tip}"
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">CC</span>
              </div>
              <span className="text-sm text-slate-400 font-medium">
                — CryptoCoach
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CoachTip;
