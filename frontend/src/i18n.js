import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        academy: 'Academy',
        pricing: 'Pricing',
        glossary: 'Glossary',
        insights: 'Insights',
        about: 'About',
        hub: 'Hub',
        signIn: 'Sign In',
        getStarted: 'Get Started',
        signOut: 'Sign Out',
        dashboard: 'Dashboard',
        tradingArena: 'Trading Arena',
        aiMentor: 'AI Mentor',
        simulator: 'Simulator',
        leaderboard: 'Leaderboard',
        certificates: 'Certificates'
      },
      // Homepage
      home: {
        trusted: 'Trusted by 10,000+ Students',
        title: 'Master Cryptocurrency, Blockchain & Digital Finance',
        subtitle: 'Elite cryptocurrency education from industry experts. Earn verified certifications, practice with our trading simulator, and learn from AI-powered mentorship.',
        startLearning: 'Start Learning Free',
        exploreCourses: 'Explore Courses',
        students: '10,000+ Students',
        lessons: '23 Expert Lessons',
        certifications: '3 Certifications'
      },
      // Homepage Extended
      homepage: {
        trustedBy: 'Trusted by 10,000+ Students',
        heroTitle1: 'Master ',
        heroTitleHighlight: 'Cryptocurrency',
        heroTitle2: ', Blockchain & Digital Finance',
        heroSubtitle: 'Elite cryptocurrency education from industry experts. Earn verified certifications, practice with our trading simulator, and learn from AI-powered mentorship.',
        startLearning: 'Start Learning Free',
        exploreCourses: 'Explore Courses',
        stats: {
          students: '10,000+ Students',
          lessons: '23 Expert Lessons',
          certifications: '3 Certifications'
        },
        featuresTitle: 'Everything You Need to ',
        featuresTitleHighlight: 'Succeed',
        featuresSubtitle: 'A complete platform designed to take you from beginner to expert',
        features: {
          academy: 'Structured Academy',
          academyDesc: 'Progress from foundations to advanced strategies with our 3-level curriculum',
          certifications: 'Verified Certifications',
          certificationsDesc: 'Earn industry-recognized certificates with QR verification',
          aiMentor: 'AI Crypto Mentor',
          aiMentorDesc: 'Get personalized guidance from CryptoCoach AI anytime',
          simulator: 'Trading Simulator',
          simulatorDesc: 'Practice strategies risk-free with virtual trading',
          security: 'Security Focus',
          securityDesc: 'Learn best practices to protect your digital assets',
          knowledge: 'Knowledge Base',
          knowledgeDesc: 'Access comprehensive glossary and educational resources'
        },
        coursesTitle: 'Structured Learning ',
        coursesTitleHighlight: 'Paths',
        coursesSubtitle: 'Progress through three levels of expertise, each building on the last',
        courses: {
          level1: 'Crypto Foundations',
          level1Desc: 'Master blockchain basics, Bitcoin, wallets, and security fundamentals',
          level2: 'Crypto Investor',
          level2Desc: 'Dive into DeFi, NFTs, tokenomics, and market analysis',
          level3: 'Advanced Strategist',
          level3Desc: 'Master trading strategies, portfolio management, and macro analysis',
          free: 'Free',
          starter: 'Starter',
          pro: 'Pro'
        },
        lessons: 'Lessons',
        viewCourse: 'View Course',
        founder: {
          meetInstructor: 'Meet Your Instructor',
          yearsInCrypto: 'Years in Crypto',
          description1: 'A seasoned cryptocurrency educator and digital finance entrepreneur with over a decade of experience in blockchain technology and digital assets.',
          description2: 'Mehdi founded TheCryptoCoach.io with a mission to democratize cryptocurrency education. His approach combines technical expertise with practical insights, making complex concepts accessible to everyone.',
          learnMore: 'Learn More About Mehdi'
        },
        testimonialsTitle: 'What Our ',
        testimonialsTitleHighlight: 'Students',
        testimonialsSubtitle: 'Join thousands of successful graduates',
        testimonials: {
          role1: 'Software Engineer',
          role2: 'Financial Analyst',
          role3: 'Entrepreneur',
          content1: 'TheCryptoCoach transformed my understanding of blockchain. The structured curriculum made complex concepts accessible.',
          content2: 'The certification program gave me the credentials I needed. Now I confidently advise clients on digital assets.',
          content3: "The AI mentor is incredible. It's like having a personal tutor available 24/7 to answer my questions."
        },
        ctaTitle: 'Start Your Crypto Education ',
        ctaTitleHighlight: 'Today',
        ctaSubtitle: 'Join thousands of students mastering cryptocurrency. Begin with free courses and progress at your own pace.',
        createAccount: 'Create Free Account',
        contactUs: 'Contact Us'
      },
      // Hub Page
      hub: {
        title: 'Hub',
        level: 'Level',
        xp: 'XP',
        towardsLevel: 'towards Level',
        streak: 'Streak',
        days: 'days',
        coins: 'Coins',
        achievements: 'Achievements',
        dailyQuests: 'Daily Quests',
        resetIn: 'Reset in',
        questProgress: 'Progress',
        quickActions: 'Quick Actions',
        continueLearning: 'Continue Learning',
        lessonsAvailable: 'lessons available',
        tradingArena: 'Trading Arena',
        proSimulator: 'Pro Simulator',
        classicSimulator: 'Classic Simulator',
        simpleMode: 'Simple mode',
        viewAllPlayers: 'View all players',
        topPlayers: 'Top Players',
        viewAll: 'View all',
        liveMarket: 'Live Market',
        myPortfolio: 'My Portfolio',
        totalValue: 'Total Value',
        availableCash: 'Available Cash',
        totalPnL: 'Total P&L',
        careerRank: 'Career Rank',
        trade: 'Trade',
        marketSentiment: 'Market sentiment',
        bullish: 'Bullish',
        bearish: 'Bearish'
      },
      // Trading Arena
      trading: {
        title: 'Trading Arena',
        subtitle: 'Professional trading simulator with live data',
        careerRank: 'Career Rank',
        totalValue: 'Total Value',
        cash: 'Cash',
        pnlTotal: 'Total P&L',
        roi: 'ROI',
        marketPrices: 'Market Prices',
        refresh: 'Refresh',
        myPositions: 'My Positions',
        crypto: 'Crypto',
        quantity: 'Quantity',
        currentPrice: 'Current Price',
        value: 'Value',
        pnl: 'P&L',
        tradeHistory: 'Trade History',
        noTrades: 'No trades executed',
        placeOrder: 'Place an Order',
        buy: 'Buy',
        sell: 'Sell',
        amount: 'Amount',
        estimatedTotal: 'Estimated Total',
        availableBalance: 'Available balance',
        resetPortfolio: 'Reset Portfolio',
        careerProgress: 'Career Progress',
        insufficientBalance: 'Insufficient balance',
        insufficientQuantity: 'Insufficient quantity',
        tradeSuccess: 'Trade executed successfully!',
        purchased: 'Purchased',
        sold: 'Sold'
      },
      // Quests
      quests: {
        lessonOfDay: 'Lesson of the Day',
        lessonDesc: 'Complete a lesson today',
        dailyQuiz: 'Daily Quiz',
        quizDesc: 'Pass a quiz with 70%+',
        tradeOfDay: 'Trade of the Day',
        tradeDesc: 'Execute 3 trades in the arena',
        noQuests: 'No active quests',
        comeBackTomorrow: 'Come back tomorrow for new quests!'
      },
      // Auth
      auth: {
        welcomeBack: 'Welcome Back',
        signInContinue: 'Sign in to continue your learning journey',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        fullName: 'Full Name',
        signIn: 'Sign In',
        createAccount: 'Create Account',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        createOne: 'Create one',
        termsAgree: 'By creating an account, you agree to our',
        terms: 'Terms',
        and: 'and',
        privacyPolicy: 'Privacy Policy',
        whatYouGet: "What you'll get:",
        freeAccess: 'Access to all free courses',
        trackProgress: 'Track your learning progress',
        earnCerts: 'Earn certificates',
        aiMentorship: 'AI-powered mentorship'
      },
      // Footer
      footer: {
        description: 'Your trusted source for cryptocurrency education. Master blockchain, DeFi, and digital assets with expert-led courses and certifications.',
        learn: 'Learn',
        legal: 'Legal',
        termsOfService: 'Terms of Service',
        privacyPolicy: 'Privacy Policy',
        riskDisclaimer: 'Risk Disclaimer',
        contactUs: 'Contact Us',
        allRights: 'All rights reserved.',
        riskNote: 'Cryptocurrency investments carry risk. This platform provides education, not financial advice.'
      },
      // Common
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        close: 'Close',
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit',
        search: 'Search',
        filter: 'Filter',
        all: 'All',
        none: 'None',
        yes: 'Yes',
        no: 'No',
        or: 'or',
        continue: 'Continue'
      },
      // Lesson Page
      lesson: {
        duration: 'Duration',
        minutes: 'min',
        completed: 'Completed',
        startLesson: 'Start Lesson',
        completeLesson: 'Complete Lesson',
        nextLesson: 'Next Lesson',
        previousLesson: 'Previous',
        backToCourse: 'Back to Course',
        audioMode: 'Audio Mode',
        readingMode: 'Reading Mode',
        tableOfContents: 'Table of Contents',
        keyTakeaways: 'Key Takeaways',
        quiz: 'Quiz',
        takeQuiz: 'Take Quiz',
        xpEarned: 'XP Earned',
        lessonCompleted: 'Lesson Completed!',
        congratulations: 'Congratulations! You earned',
        continueJourney: 'Continue your journey'
      },
      // Crypto Quest
      quest: {
        title: 'Crypto Quest',
        subtitle: 'Your journey to becoming a crypto master',
        chapter: 'Chapter',
        mission: 'Mission',
        locked: 'Locked',
        unlocked: 'Unlocked',
        completed: 'Completed',
        inProgress: 'In Progress',
        startMission: 'Start Mission',
        continueMission: 'Continue',
        completeChapter: 'Complete Chapter',
        reward: 'Reward',
        xpReward: 'XP Reward',
        coinsReward: 'Coins Reward',
        progress: 'Progress',
        chapters: {
          ch1: 'The Beginning',
          ch1Desc: 'Discover the world of cryptocurrency and blockchain',
          ch2: 'The Fundamentals',
          ch2Desc: 'Master the basics of Bitcoin and wallets',
          ch3: 'The Investor',
          ch3Desc: 'Learn DeFi, NFTs and market analysis',
          ch4: 'The Strategist',
          ch4Desc: 'Advanced trading and portfolio management',
          ch5: 'The Master',
          ch5Desc: 'Become a true crypto expert'
        }
      },
      // Pricing Page
      pricing: {
        title: 'Choose Your Path',
        subtitle: 'Flexible plans for all levels. Start free and evolve at your pace.',
        monthly: 'Monthly',
        annual: 'Annual',
        off: 'off',
        freeTrialBadge: '3 free lessons with premium video',
        subscribe: 'Subscribe',
        currentPlan: 'Current Plan',
        popular: 'Popular',
        bestValue: 'Best Value',
        couponPlaceholder: 'Enter coupon code',
        applyCoupon: 'Apply',
        couponApplied: 'Coupon applied!',
        invalidCoupon: 'Invalid coupon code',
        youSave: 'You save'
      },
      // Captcha
      captcha: {
        title: 'Security Check',
        placeholder: 'Your answer',
        verify: 'Verify',
        verified: 'Verified!',
        wrong: 'Wrong answer, try again',
        refresh: 'New question'
      },
      // Coach Tip
      coachTip: {
        title: "Coach's Tip"
      },
      // Certificate Progress
      certificate: {
        title: 'Your path to certification',
        remaining: 'lessons to certificate',
        complete: 'Ready for certification!',
        almostThere: 'Almost there!',
        takeExam: 'Take the exam'
      },
      // Newsletter
      newsletter: {
        title: 'Stay Ahead of the Market',
        description: 'Get weekly crypto insights, market analysis, and exclusive tips delivered to your inbox.',
        placeholder: 'Enter your email',
        subscribe: 'Subscribe',
        success: 'Successfully subscribed!',
        alreadySubscribed: 'You are already subscribed!',
        error: 'Failed to subscribe. Please try again.',
        subscribed: "You're subscribed!",
        subscribedDesc: 'Check your inbox for the latest crypto insights.',
        badge: 'Weekly Crypto Digest',
        feature1: 'Weekly Market Analysis',
        feature2: 'Trading Tips',
        feature3: 'No Spam, Unsubscribe Anytime'
      }
    }
  },
  fr: {
    translation: {
      // Navigation
      nav: {
        academy: 'Académie',
        pricing: 'Tarifs',
        glossary: 'Glossaire',
        insights: 'Actualités',
        about: 'À propos',
        hub: 'Hub',
        signIn: 'Connexion',
        getStarted: 'Commencer',
        signOut: 'Déconnexion',
        dashboard: 'Tableau de bord',
        tradingArena: 'Trading Arena',
        aiMentor: 'Mentor IA',
        simulator: 'Simulateur',
        leaderboard: 'Classement',
        certificates: 'Certificats'
      },
      // Homepage
      home: {
        trusted: 'Approuvé par 10 000+ étudiants',
        title: 'Maîtrisez la Crypto, la Blockchain et la Finance Digitale',
        subtitle: 'Formation crypto d\'élite par des experts de l\'industrie. Obtenez des certifications vérifiées, pratiquez avec notre simulateur de trading et apprenez grâce au mentorat IA.',
        startLearning: 'Commencer Gratuitement',
        exploreCourses: 'Explorer les Cours',
        students: '10 000+ Étudiants',
        lessons: '23 Leçons Expert',
        certifications: '3 Certifications'
      },
      // Homepage Extended
      homepage: {
        trustedBy: 'Approuvé par 10 000+ Étudiants',
        heroTitle1: 'Maîtrisez la ',
        heroTitleHighlight: 'Crypto',
        heroTitle2: ', la Blockchain et la Finance Digitale',
        heroSubtitle: 'Formation crypto d\'élite par des experts de l\'industrie. Obtenez des certifications vérifiées, pratiquez avec notre simulateur de trading et apprenez grâce au mentorat IA.',
        startLearning: 'Commencer Gratuitement',
        exploreCourses: 'Explorer les Cours',
        stats: {
          students: '10 000+ Étudiants',
          lessons: '23 Leçons Expert',
          certifications: '3 Certifications'
        },
        featuresTitle: 'Tout ce dont vous avez besoin pour ',
        featuresTitleHighlight: 'Réussir',
        featuresSubtitle: 'Une plateforme complète conçue pour vous faire passer de débutant à expert',
        features: {
          academy: 'Académie Structurée',
          academyDesc: 'Progressez des fondamentaux aux stratégies avancées avec notre programme en 3 niveaux',
          certifications: 'Certifications Vérifiées',
          certificationsDesc: 'Obtenez des certificats reconnus avec vérification QR',
          aiMentor: 'Mentor IA Crypto',
          aiMentorDesc: 'Recevez des conseils personnalisés de CryptoCoach IA à tout moment',
          simulator: 'Simulateur de Trading',
          simulatorDesc: 'Pratiquez des stratégies sans risque avec le trading virtuel',
          security: 'Focus Sécurité',
          securityDesc: 'Apprenez les meilleures pratiques pour protéger vos actifs numériques',
          knowledge: 'Base de Connaissances',
          knowledgeDesc: 'Accédez au glossaire complet et aux ressources éducatives'
        },
        coursesTitle: 'Parcours d\'Apprentissage ',
        coursesTitleHighlight: 'Structurés',
        coursesSubtitle: 'Progressez à travers trois niveaux d\'expertise, chacun construisant sur le précédent',
        courses: {
          level1: 'Fondamentaux Crypto',
          level1Desc: 'Maîtrisez les bases de la blockchain, Bitcoin, portefeuilles et sécurité',
          level2: 'Investisseur Crypto',
          level2Desc: 'Plongez dans la DeFi, les NFTs, la tokenomics et l\'analyse de marché',
          level3: 'Stratégiste Avancé',
          level3Desc: 'Maîtrisez les stratégies de trading, la gestion de portefeuille et l\'analyse macro',
          free: 'Gratuit',
          starter: 'Débutant',
          pro: 'Pro'
        },
        lessons: 'Leçons',
        viewCourse: 'Voir le Cours',
        founder: {
          meetInstructor: 'Rencontrez Votre Instructeur',
          yearsInCrypto: 'Ans en Crypto',
          description1: 'Un éducateur crypto chevronné et entrepreneur en finance digitale avec plus d\'une décennie d\'expérience en technologie blockchain et actifs numériques.',
          description2: 'Mehdi a fondé TheCryptoCoach.io avec la mission de démocratiser l\'éducation crypto. Son approche combine expertise technique et insights pratiques, rendant les concepts complexes accessibles à tous.',
          learnMore: 'En savoir plus sur Mehdi'
        },
        testimonialsTitle: 'Ce que disent nos ',
        testimonialsTitleHighlight: 'Étudiants',
        testimonialsSubtitle: 'Rejoignez des milliers de diplômés à succès',
        testimonials: {
          role1: 'Développeur Logiciel',
          role2: 'Analyste Financier',
          role3: 'Entrepreneur',
          content1: 'TheCryptoCoach a transformé ma compréhension de la blockchain. Le programme structuré a rendu les concepts complexes accessibles.',
          content2: 'Le programme de certification m\'a donné les références dont j\'avais besoin. Maintenant je conseille mes clients sur les actifs numériques en toute confiance.',
          content3: 'Le mentor IA est incroyable. C\'est comme avoir un tuteur personnel disponible 24/7 pour répondre à mes questions.'
        },
        ctaTitle: 'Commencez Votre Éducation Crypto ',
        ctaTitleHighlight: 'Aujourd\'hui',
        ctaSubtitle: 'Rejoignez des milliers d\'étudiants qui maîtrisent la crypto. Commencez avec des cours gratuits et progressez à votre rythme.',
        createAccount: 'Créer un Compte Gratuit',
        contactUs: 'Nous Contacter'
      },
      // Hub Page
      hub: {
        title: 'Hub',
        level: 'Niveau',
        xp: 'XP',
        towardsLevel: 'vers Niveau',
        streak: 'Série',
        days: 'jours',
        coins: 'Pièces',
        achievements: 'Succès',
        dailyQuests: 'Quêtes Quotidiennes',
        resetIn: 'Reset dans',
        questProgress: 'Progression',
        quickActions: 'Actions Rapides',
        continueLearning: 'Continuer l\'apprentissage',
        lessonsAvailable: 'leçons disponibles',
        tradingArena: 'Trading Arena',
        proSimulator: 'Simulateur Pro',
        classicSimulator: 'Simulateur Classic',
        simpleMode: 'Mode simple',
        viewAllPlayers: 'Voir tous les joueurs',
        topPlayers: 'Top Joueurs',
        viewAll: 'Voir tout',
        liveMarket: 'Marché en Direct',
        myPortfolio: 'Mon Portfolio',
        totalValue: 'Valeur Totale',
        availableCash: 'Cash Disponible',
        totalPnL: 'P&L Total',
        careerRank: 'Rang Carrière',
        trade: 'Trader',
        marketSentiment: 'Sentiment du marché',
        bullish: 'Haussier',
        bearish: 'Baissier'
      },
      // Trading Arena
      trading: {
        title: 'Trading Arena',
        subtitle: 'Simulateur de trading professionnel avec données live',
        careerRank: 'Rang Carrière',
        totalValue: 'Valeur Totale',
        cash: 'Cash',
        pnlTotal: 'P&L Total',
        roi: 'ROI',
        marketPrices: 'Prix du Marché',
        refresh: 'Actualiser',
        myPositions: 'Mes Positions',
        crypto: 'Crypto',
        quantity: 'Quantité',
        currentPrice: 'Prix Actuel',
        value: 'Valeur',
        pnl: 'P&L',
        tradeHistory: 'Historique des Trades',
        noTrades: 'Aucun trade effectué',
        placeOrder: 'Passer un Ordre',
        buy: 'Acheter',
        sell: 'Vendre',
        amount: 'Quantité',
        estimatedTotal: 'Total estimé',
        availableBalance: 'Solde disponible',
        resetPortfolio: 'Réinitialiser le portfolio',
        careerProgress: 'Progression Carrière',
        insufficientBalance: 'Solde insuffisant',
        insufficientQuantity: 'Quantité insuffisante',
        tradeSuccess: 'Trade effectué avec succès !',
        purchased: 'Achat de',
        sold: 'Vente de'
      },
      // Quests
      quests: {
        lessonOfDay: 'Leçon du Jour',
        lessonDesc: 'Complétez une leçon aujourd\'hui',
        dailyQuiz: 'Quiz Quotidien',
        quizDesc: 'Réussissez un quiz avec 70%+',
        tradeOfDay: 'Trade du Jour',
        tradeDesc: 'Effectuez 3 trades dans l\'arène',
        noQuests: 'Aucune quête active',
        comeBackTomorrow: 'Revenez demain pour de nouvelles quêtes !'
      },
      // Auth
      auth: {
        welcomeBack: 'Bon Retour',
        signInContinue: 'Connectez-vous pour continuer votre apprentissage',
        email: 'Email',
        password: 'Mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        fullName: 'Nom complet',
        signIn: 'Se connecter',
        createAccount: 'Créer un compte',
        noAccount: 'Pas encore de compte ?',
        hasAccount: 'Déjà un compte ?',
        createOne: 'Créer un compte',
        termsAgree: 'En créant un compte, vous acceptez nos',
        terms: 'Conditions',
        and: 'et',
        privacyPolicy: 'Politique de confidentialité',
        whatYouGet: 'Ce que vous obtenez :',
        freeAccess: 'Accès à tous les cours gratuits',
        trackProgress: 'Suivez votre progression',
        earnCerts: 'Obtenez des certificats',
        aiMentorship: 'Mentorat IA'
      },
      // Footer
      footer: {
        description: 'Votre source de confiance pour l\'éducation crypto. Maîtrisez la blockchain, la DeFi et les actifs numériques avec des cours et certifications d\'experts.',
        learn: 'Apprendre',
        legal: 'Légal',
        termsOfService: 'Conditions d\'utilisation',
        privacyPolicy: 'Politique de confidentialité',
        riskDisclaimer: 'Avertissement sur les risques',
        contactUs: 'Contactez-nous',
        allRights: 'Tous droits réservés.',
        riskNote: 'Les investissements crypto comportent des risques. Cette plateforme fournit de l\'éducation, pas des conseils financiers.'
      },
      // Common
      common: {
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        save: 'Enregistrer',
        delete: 'Supprimer',
        edit: 'Modifier',
        view: 'Voir',
        close: 'Fermer',
        next: 'Suivant',
        previous: 'Précédent',
        submit: 'Soumettre',
        search: 'Rechercher',
        filter: 'Filtrer',
        all: 'Tout',
        none: 'Aucun',
        yes: 'Oui',
        no: 'Non',
        or: 'ou',
        continue: 'Continuer'
      },
      // Lesson Page
      lesson: {
        duration: 'Durée',
        minutes: 'min',
        completed: 'Terminé',
        startLesson: 'Commencer la Leçon',
        completeLesson: 'Terminer la Leçon',
        nextLesson: 'Leçon Suivante',
        previousLesson: 'Précédent',
        backToCourse: 'Retour au Cours',
        audioMode: 'Mode Audio',
        readingMode: 'Mode Lecture',
        tableOfContents: 'Table des Matières',
        keyTakeaways: 'Points Clés',
        quiz: 'Quiz',
        takeQuiz: 'Passer le Quiz',
        xpEarned: 'XP Gagnés',
        lessonCompleted: 'Leçon Terminée !',
        congratulations: 'Félicitations ! Vous avez gagné',
        continueJourney: 'Continuez votre parcours'
      },
      // Crypto Quest
      quest: {
        title: 'Crypto Quest',
        subtitle: 'Votre parcours pour devenir un maître crypto',
        chapter: 'Chapitre',
        mission: 'Mission',
        locked: 'Verrouillé',
        unlocked: 'Déverrouillé',
        completed: 'Terminé',
        inProgress: 'En Cours',
        startMission: 'Démarrer la Mission',
        continueMission: 'Continuer',
        completeChapter: 'Compléter le Chapitre',
        reward: 'Récompense',
        xpReward: 'Récompense XP',
        coinsReward: 'Récompense Coins',
        progress: 'Progression',
        chapters: {
          ch1: 'Le Commencement',
          ch1Desc: 'Découvrez le monde de la crypto et de la blockchain',
          ch2: 'Les Fondamentaux',
          ch2Desc: 'Maîtrisez les bases du Bitcoin et des portefeuilles',
          ch3: 'L\'Investisseur',
          ch3Desc: 'Apprenez la DeFi, les NFTs et l\'analyse de marché',
          ch4: 'Le Stratège',
          ch4Desc: 'Trading avancé et gestion de portefeuille',
          ch5: 'Le Maître',
          ch5Desc: 'Devenez un véritable expert crypto'
        }
      },
      // Pricing Page
      pricing: {
        title: 'Choisissez Votre Parcours',
        subtitle: 'Des plans flexibles pour tous les niveaux. Commencez gratuitement et évoluez à votre rythme.',
        monthly: 'Mensuel',
        annual: 'Annuel',
        off: 'de réduction',
        freeTrialBadge: '3 premières leçons gratuites avec vidéo premium',
        subscribe: "S'abonner",
        currentPlan: 'Plan actuel',
        popular: 'Populaire',
        bestValue: 'Meilleur Rapport',
        couponPlaceholder: 'Entrez le code promo',
        applyCoupon: 'Appliquer',
        couponApplied: 'Code appliqué !',
        invalidCoupon: 'Code promo invalide',
        youSave: 'Vous économisez'
      },
      // Captcha
      captcha: {
        title: 'Vérification de sécurité',
        placeholder: 'Votre réponse',
        verify: 'Vérifier',
        verified: 'Vérifié !',
        wrong: 'Mauvaise réponse, réessayez',
        refresh: 'Nouvelle question'
      },
      // Coach Tip
      coachTip: {
        title: 'Conseil du Coach'
      },
      // Certificate Progress
      certificate: {
        title: 'Votre chemin vers la certification',
        remaining: 'leçons avant le certificat',
        complete: 'Prêt pour la certification !',
        almostThere: 'Presque terminé !',
        takeExam: "Passer l'examen"
      },
      // Newsletter
      newsletter: {
        title: 'Gardez une longueur d\'avance',
        description: 'Recevez des analyses crypto hebdomadaires, des insights de marché et des conseils exclusifs.',
        placeholder: 'Entrez votre email',
        subscribe: 'S\'abonner',
        success: 'Inscription réussie !',
        alreadySubscribed: 'Vous êtes déjà inscrit !',
        error: 'Échec de l\'inscription. Veuillez réessayer.',
        subscribed: 'Vous êtes inscrit !',
        subscribedDesc: 'Consultez votre boîte de réception pour les dernières actualités crypto.',
        badge: 'Digest Crypto Hebdomadaire',
        feature1: 'Analyse de marché hebdomadaire',
        feature2: 'Conseils de trading',
        feature3: 'Pas de spam, désabonnement à tout moment'
      }
    }
  },
  ar: {
    translation: {
      // Navigation
      nav: {
        academy: 'الأكاديمية',
        pricing: 'الأسعار',
        glossary: 'المصطلحات',
        insights: 'الأخبار',
        about: 'حولنا',
        hub: 'المركز',
        signIn: 'تسجيل الدخول',
        getStarted: 'ابدأ الآن',
        signOut: 'تسجيل الخروج',
        dashboard: 'لوحة التحكم',
        tradingArena: 'ساحة التداول',
        aiMentor: 'المرشد الذكي',
        simulator: 'المحاكي',
        leaderboard: 'الترتيب',
        certificates: 'الشهادات'
      },
      // Homepage
      home: {
        trusted: 'موثوق من قبل +10,000 طالب',
        title: 'أتقن العملات المشفرة والبلوكتشين والتمويل الرقمي',
        subtitle: 'تعليم العملات المشفرة من نخبة خبراء الصناعة. احصل على شهادات معتمدة، تدرب على محاكي التداول، وتعلم من المرشد الذكي.',
        startLearning: 'ابدأ التعلم مجاناً',
        exploreCourses: 'استكشف الدورات',
        students: '+10,000 طالب',
        lessons: '23 درس متخصص',
        certifications: '3 شهادات'
      },
      // Homepage Extended
      homepage: {
        trustedBy: 'موثوق من قبل +10,000 طالب',
        heroTitle1: 'أتقن ',
        heroTitleHighlight: 'العملات المشفرة',
        heroTitle2: ' والبلوكتشين والتمويل الرقمي',
        heroSubtitle: 'تعليم العملات المشفرة من نخبة خبراء الصناعة. احصل على شهادات معتمدة، تدرب على محاكي التداول، وتعلم من المرشد الذكي.',
        startLearning: 'ابدأ التعلم مجاناً',
        exploreCourses: 'استكشف الدورات',
        stats: {
          students: '+10,000 طالب',
          lessons: '23 درس متخصص',
          certifications: '3 شهادات'
        },
        featuresTitle: 'كل ما تحتاجه ',
        featuresTitleHighlight: 'للنجاح',
        featuresSubtitle: 'منصة كاملة مصممة لنقلك من مبتدئ إلى خبير',
        features: {
          academy: 'أكاديمية منظمة',
          academyDesc: 'تقدم من الأساسيات إلى الاستراتيجيات المتقدمة مع منهجنا من 3 مستويات',
          certifications: 'شهادات معتمدة',
          certificationsDesc: 'احصل على شهادات معترف بها مع رمز QR للتحقق',
          aiMentor: 'مرشد ذكي للكريبتو',
          aiMentorDesc: 'احصل على إرشادات مخصصة من CryptoCoach AI في أي وقت',
          simulator: 'محاكي التداول',
          simulatorDesc: 'تدرب على الاستراتيجيات بدون مخاطر مع التداول الافتراضي',
          security: 'التركيز على الأمان',
          securityDesc: 'تعلم أفضل الممارسات لحماية أصولك الرقمية',
          knowledge: 'قاعدة المعرفة',
          knowledgeDesc: 'الوصول إلى القاموس الشامل والموارد التعليمية'
        },
        coursesTitle: 'مسارات تعليمية ',
        coursesTitleHighlight: 'منظمة',
        coursesSubtitle: 'تقدم عبر ثلاثة مستويات من الخبرة، كل منها يبني على السابق',
        courses: {
          level1: 'أساسيات الكريبتو',
          level1Desc: 'أتقن أساسيات البلوكتشين، البيتكوين، المحافظ وأساسيات الأمان',
          level2: 'مستثمر الكريبتو',
          level2Desc: 'تعمق في DeFi، NFTs، اقتصاديات الرمز وتحليل السوق',
          level3: 'الاستراتيجي المتقدم',
          level3Desc: 'أتقن استراتيجيات التداول، إدارة المحفظة والتحليل الكلي',
          free: 'مجاني',
          starter: 'مبتدئ',
          pro: 'محترف'
        },
        lessons: 'دروس',
        viewCourse: 'عرض الدورة',
        founder: {
          meetInstructor: 'تعرف على معلمك',
          yearsInCrypto: 'سنوات في الكريبتو',
          description1: 'مدرب عملات مشفرة محنك ورائد أعمال في التمويل الرقمي مع أكثر من عقد من الخبرة في تقنية البلوكتشين والأصول الرقمية.',
          description2: 'أسس مهدي TheCryptoCoach.io بمهمة إضفاء الطابع الديمقراطي على تعليم العملات المشفرة. يجمع نهجه بين الخبرة التقنية والرؤى العملية، مما يجعل المفاهيم المعقدة في متناول الجميع.',
          learnMore: 'اعرف المزيد عن مهدي'
        },
        testimonialsTitle: 'ماذا يقول ',
        testimonialsTitleHighlight: 'طلابنا',
        testimonialsSubtitle: 'انضم إلى آلاف الخريجين الناجحين',
        testimonials: {
          role1: 'مهندس برمجيات',
          role2: 'محلل مالي',
          role3: 'رائد أعمال',
          content1: 'غير TheCryptoCoach فهمي للبلوكتشين. المنهج المنظم جعل المفاهيم المعقدة سهلة الفهم.',
          content2: 'أعطاني برنامج الشهادات المؤهلات التي أحتاجها. الآن أنصح عملائي بثقة حول الأصول الرقمية.',
          content3: 'المرشد الذكي مذهل. إنه مثل وجود معلم شخصي متاح على مدار الساعة للإجابة على أسئلتي.'
        },
        ctaTitle: 'ابدأ تعليمك في الكريبتو ',
        ctaTitleHighlight: 'اليوم',
        ctaSubtitle: 'انضم إلى آلاف الطلاب الذين يتقنون العملات المشفرة. ابدأ بدورات مجانية وتقدم بسرعتك الخاصة.',
        createAccount: 'إنشاء حساب مجاني',
        contactUs: 'اتصل بنا'
      },
      // Hub Page
      hub: {
        title: 'المركز',
        level: 'المستوى',
        xp: 'نقاط الخبرة',
        towardsLevel: 'نحو المستوى',
        streak: 'التتابع',
        days: 'أيام',
        coins: 'العملات',
        achievements: 'الإنجازات',
        dailyQuests: 'المهام اليومية',
        resetIn: 'إعادة التعيين خلال',
        questProgress: 'التقدم',
        quickActions: 'إجراءات سريعة',
        continueLearning: 'متابعة التعلم',
        lessonsAvailable: 'دروس متاحة',
        tradingArena: 'ساحة التداول',
        proSimulator: 'محاكي احترافي',
        classicSimulator: 'المحاكي الكلاسيكي',
        simpleMode: 'الوضع البسيط',
        viewAllPlayers: 'عرض جميع اللاعبين',
        topPlayers: 'أفضل اللاعبين',
        viewAll: 'عرض الكل',
        liveMarket: 'السوق المباشر',
        myPortfolio: 'محفظتي',
        totalValue: 'القيمة الإجمالية',
        availableCash: 'النقد المتاح',
        totalPnL: 'إجمالي الربح/الخسارة',
        careerRank: 'الرتبة المهنية',
        trade: 'تداول',
        marketSentiment: 'مزاج السوق',
        bullish: 'صعودي',
        bearish: 'هبوطي'
      },
      // Trading Arena
      trading: {
        title: 'ساحة التداول',
        subtitle: 'محاكي تداول احترافي ببيانات مباشرة',
        careerRank: 'الرتبة المهنية',
        totalValue: 'القيمة الإجمالية',
        cash: 'النقد',
        pnlTotal: 'إجمالي الربح/الخسارة',
        roi: 'العائد على الاستثمار',
        marketPrices: 'أسعار السوق',
        refresh: 'تحديث',
        myPositions: 'مراكزي',
        crypto: 'العملة',
        quantity: 'الكمية',
        currentPrice: 'السعر الحالي',
        value: 'القيمة',
        pnl: 'الربح/الخسارة',
        tradeHistory: 'سجل التداول',
        noTrades: 'لا توجد صفقات',
        placeOrder: 'إنشاء أمر',
        buy: 'شراء',
        sell: 'بيع',
        amount: 'الكمية',
        estimatedTotal: 'الإجمالي المقدر',
        availableBalance: 'الرصيد المتاح',
        resetPortfolio: 'إعادة تعيين المحفظة',
        careerProgress: 'التقدم المهني',
        insufficientBalance: 'رصيد غير كافٍ',
        insufficientQuantity: 'كمية غير كافية',
        tradeSuccess: 'تم تنفيذ الصفقة بنجاح!',
        purchased: 'تم شراء',
        sold: 'تم بيع'
      },
      // Quests
      quests: {
        lessonOfDay: 'درس اليوم',
        lessonDesc: 'أكمل درساً اليوم',
        dailyQuiz: 'اختبار اليوم',
        quizDesc: 'اجتز اختباراً بنسبة 70%+',
        tradeOfDay: 'صفقة اليوم',
        tradeDesc: 'نفذ 3 صفقات في الساحة',
        noQuests: 'لا توجد مهام نشطة',
        comeBackTomorrow: 'عد غداً لمهام جديدة!'
      },
      // Auth
      auth: {
        welcomeBack: 'مرحباً بعودتك',
        signInContinue: 'سجل دخولك لمتابعة رحلة التعلم',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        fullName: 'الاسم الكامل',
        signIn: 'تسجيل الدخول',
        createAccount: 'إنشاء حساب',
        noAccount: 'ليس لديك حساب؟',
        hasAccount: 'لديك حساب بالفعل؟',
        createOne: 'أنشئ حساباً',
        termsAgree: 'بإنشاء حساب، فإنك توافق على',
        terms: 'الشروط',
        and: 'و',
        privacyPolicy: 'سياسة الخصوصية',
        whatYouGet: 'ما ستحصل عليه:',
        freeAccess: 'الوصول لجميع الدورات المجانية',
        trackProgress: 'تتبع تقدمك',
        earnCerts: 'احصل على شهادات',
        aiMentorship: 'إرشاد بالذكاء الاصطناعي'
      },
      // Footer
      footer: {
        description: 'مصدرك الموثوق لتعليم العملات المشفرة. أتقن البلوكتشين والتمويل اللامركزي والأصول الرقمية مع دورات وشهادات من خبراء.',
        learn: 'تعلم',
        legal: 'قانوني',
        termsOfService: 'شروط الخدمة',
        privacyPolicy: 'سياسة الخصوصية',
        riskDisclaimer: 'إخلاء المسؤولية عن المخاطر',
        contactUs: 'اتصل بنا',
        allRights: 'جميع الحقوق محفوظة.',
        riskNote: 'استثمارات العملات المشفرة تحمل مخاطر. هذه المنصة توفر التعليم وليس النصائح المالية.'
      },
      // Common
      common: {
        loading: 'جارٍ التحميل...',
        error: 'خطأ',
        success: 'نجاح',
        cancel: 'إلغاء',
        confirm: 'تأكيد',
        save: 'حفظ',
        delete: 'حذف',
        edit: 'تعديل',
        view: 'عرض',
        close: 'إغلاق',
        next: 'التالي',
        previous: 'السابق',
        submit: 'إرسال',
        search: 'بحث',
        filter: 'تصفية',
        all: 'الكل',
        none: 'لا شيء',
        yes: 'نعم',
        no: 'لا',
        or: 'أو',
        continue: 'متابعة'
      },
      // Lesson Page
      lesson: {
        duration: 'المدة',
        minutes: 'دقيقة',
        completed: 'مكتمل',
        startLesson: 'ابدأ الدرس',
        completeLesson: 'أكمل الدرس',
        nextLesson: 'الدرس التالي',
        previousLesson: 'السابق',
        backToCourse: 'العودة للدورة',
        audioMode: 'وضع الصوت',
        readingMode: 'وضع القراءة',
        tableOfContents: 'جدول المحتويات',
        keyTakeaways: 'النقاط الرئيسية',
        quiz: 'اختبار',
        takeQuiz: 'خذ الاختبار',
        xpEarned: 'نقاط الخبرة المكتسبة',
        lessonCompleted: 'اكتمل الدرس!',
        congratulations: 'تهانينا! لقد ربحت',
        continueJourney: 'واصل رحلتك'
      },
      // Crypto Quest
      quest: {
        title: 'مهمة العملات المشفرة',
        subtitle: 'رحلتك لتصبح خبيراً في العملات المشفرة',
        chapter: 'الفصل',
        mission: 'المهمة',
        locked: 'مقفل',
        unlocked: 'مفتوح',
        completed: 'مكتمل',
        inProgress: 'قيد التنفيذ',
        startMission: 'ابدأ المهمة',
        continueMission: 'متابعة',
        completeChapter: 'أكمل الفصل',
        reward: 'المكافأة',
        xpReward: 'مكافأة XP',
        coinsReward: 'مكافأة العملات',
        progress: 'التقدم',
        chapters: {
          ch1: 'البداية',
          ch1Desc: 'اكتشف عالم العملات المشفرة والبلوكتشين',
          ch2: 'الأساسيات',
          ch2Desc: 'أتقن أساسيات البيتكوين والمحافظ',
          ch3: 'المستثمر',
          ch3Desc: 'تعلم DeFi و NFTs وتحليل السوق',
          ch4: 'الاستراتيجي',
          ch4Desc: 'التداول المتقدم وإدارة المحفظة',
          ch5: 'الخبير',
          ch5Desc: 'كن خبيراً حقيقياً في العملات المشفرة'
        }
      },
      // Pricing Page
      pricing: {
        title: 'اختر مسارك',
        subtitle: 'خطط مرنة لجميع المستويات. ابدأ مجانًا وتطور بسرعتك.',
        monthly: 'شهري',
        annual: 'سنوي',
        off: 'خصم',
        freeTrialBadge: '3 دروس مجانية مع فيديو مميز',
        subscribe: 'اشترك',
        currentPlan: 'الخطة الحالية',
        popular: 'الأكثر شعبية',
        bestValue: 'أفضل قيمة',
        couponPlaceholder: 'أدخل رمز القسيمة',
        applyCoupon: 'تطبيق',
        couponApplied: 'تم تطبيق القسيمة!',
        invalidCoupon: 'رمز قسيمة غير صالح',
        youSave: 'توفر'
      },
      // Captcha
      captcha: {
        title: 'فحص أمني',
        placeholder: 'إجابتك',
        verify: 'تحقق',
        verified: 'تم التحقق!',
        wrong: 'إجابة خاطئة، حاول مرة أخرى',
        refresh: 'سؤال جديد'
      },
      // Coach Tip
      coachTip: {
        title: 'نصيحة المدرب'
      },
      // Certificate Progress
      certificate: {
        title: 'طريقك للشهادة',
        remaining: 'درس للشهادة',
        complete: 'جاهز للشهادة!',
        almostThere: 'على وشك الانتهاء!',
        takeExam: 'قدم الامتحان'
      },
      // Newsletter
      newsletter: {
        title: 'ابق في المقدمة',
        description: 'احصل على تحليلات العملات المشفرة الأسبوعية والرؤى السوقية والنصائح الحصرية.',
        placeholder: 'أدخل بريدك الإلكتروني',
        subscribe: 'اشترك',
        success: 'تم الاشتراك بنجاح!',
        alreadySubscribed: 'أنت مشترك بالفعل!',
        error: 'فشل الاشتراك. يرجى المحاولة مرة أخرى.',
        subscribed: 'أنت مشترك!',
        subscribedDesc: 'تحقق من بريدك الوارد للحصول على أحدث رؤى العملات المشفرة.',
        badge: 'ملخص العملات الأسبوعي',
        feature1: 'تحليل السوق الأسبوعي',
        feature2: 'نصائح التداول',
        feature3: 'بدون رسائل مزعجة، إلغاء الاشتراك في أي وقت'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'ar'],
    
    detection: {
      order: ['navigator', 'localStorage', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false
    },
    
    react: {
      useSuspense: false
    }
  });

export default i18n;
