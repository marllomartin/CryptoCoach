# Trial Content Service
# Built-in trial lessons (lessons 1–2): always accessible to every user

from typing import Dict, List, Optional
from datetime import datetime, timezone

# ============================================================
# COURSE STRUCTURE - 3 LEVELS, 23 LESSONS
# ============================================================

TRIAL_COURSES = {
    "course-foundations": {
        "id": "course-foundations",
        "title": {
            "en": "Crypto Foundations",
            "fr": "Fondamentaux Crypto",
            "ar": "أساسيات العملات المشفرة"
        },
        "description": {
            "en": "Master the fundamentals of blockchain and cryptocurrency. Perfect for beginners.",
            "fr": "Maîtrisez les fondamentaux de la blockchain et des cryptomonnaies. Parfait pour les débutants.",
            "ar": "أتقن أساسيات البلوكتشين والعملات المشفرة. مثالي للمبتدئين."
        },
        "level": 1,
        "duration_hours": 8,
        "lessons_count": 8,
        "icon": "foundation",
        "color": "#3B82F6"
    },
    "course-investor": {
        "id": "course-investor",
        "title": {
            "en": "Crypto Investor",
            "fr": "Investisseur Crypto",
            "ar": "مستثمر العملات المشفرة"
        },
        "description": {
            "en": "Deep dive into DeFi, NFTs, and investment analysis. For intermediate learners.",
            "fr": "Plongez dans la DeFi, les NFTs et l'analyse d'investissement. Pour niveau intermédiaire.",
            "ar": "تعمق في التمويل اللامركزي والرموز غير القابلة للاستبدال وتحليل الاستثمار. للمتعلمين المتوسطين."
        },
        "level": 2,
        "duration_hours": 10,
        "lessons_count": 8,
        "icon": "investor",
        "color": "#8B5CF6"
    },
    "course-strategist": {
        "id": "course-strategist",
        "title": {
            "en": "Advanced Crypto Strategist",
            "fr": "Stratège Crypto Avancé",
            "ar": "استراتيجي العملات المشفرة المتقدم"
        },
        "description": {
            "en": "Master advanced trading, portfolio management, and market psychology. Expert level.",
            "fr": "Maîtrisez le trading avancé, la gestion de portefeuille et la psychologie de marché. Niveau expert.",
            "ar": "أتقن التداول المتقدم وإدارة المحافظ وعلم نفس السوق. مستوى الخبراء."
        },
        "level": 3,
        "duration_hours": 12,
        "lessons_count": 7,
        "icon": "strategist",
        "color": "#F59E0B"
    }
}

# ============================================================
# COMPLETE LESSON CONTENT - LEVEL 1: FOUNDATIONS
# ============================================================

TRIAL_LESSONS = {
    # ==================== TRIAL LESSONS (Lessons 1–2) ====================
    "course-foundations-lesson-1": {
        "id": "course-foundations-lesson-1",
        "course_id": "course-foundations",
        "order": 0,
        "duration_minutes": 45,
        "difficulty": "beginner",
        "is_trial": True,
        "title": {
            "en": "What is Blockchain?",
            "fr": "Qu'est-ce que la Blockchain ?",
            "ar": "ما هي البلوكتشين؟",
            "pt": "O que é Blockchain?"
        },
        "subtitle": {
            "en": "The revolutionary technology behind cryptocurrencies",
            "fr": "La technologie révolutionnaire derrière les cryptomonnaies",
            "ar": "التكنولوجيا الثورية وراء العملات المشفرة",
            "pt": "A tecnologia revolucionária por trás das criptomoedas"
        },
        "learning_objectives": {
            "en": [
                "Understand what a distributed ledger is and how it works",
                "Learn how blocks are cryptographically linked together",
                "Grasp the concept of decentralization and its importance",
                "Identify real-world applications of blockchain technology"
            ],
            "fr": [
                "Comprendre ce qu'est un registre distribué et comment il fonctionne",
                "Apprendre comment les blocs sont liés cryptographiquement",
                "Saisir le concept de décentralisation et son importance",
                "Identifier les applications concrètes de la blockchain"
            ],
            "ar": [
                "فهم ما هو دفتر الأستاذ الموزع وكيف يعمل",
                "تعلم كيف ترتبط الكتل بشكل مشفر معًا",
                "استيعاب مفهوم اللامركزية وأهميتها",
                "تحديد التطبيقات الواقعية لتقنية البلوكتشين"
            ],
            "pt": [
                "Entender o que é um registro distribuído e como ele funciona",
                "Aprender como os blocos são ligados criptograficamente",
                "Compreender o conceito de descentralização e sua importância",
                "Identificar aplicações reais da tecnologia blockchain"
            ]
        },
        "content": {
            "en": """# Understanding Blockchain Technology

Blockchain is one of the most transformative technologies of the 21st century. It's the foundation upon which Bitcoin, Ethereum, and thousands of other cryptocurrencies are built. But blockchain's potential extends far beyond digital money.

## What is a Blockchain?

At its simplest, a blockchain is a **distributed digital ledger** that records transactions across many computers. Think of it as a shared Google Doc that thousands of people can view and verify, but no single person can secretly modify.

### The Key Innovation

Traditional databases are controlled by a central authority (like a bank). Blockchain eliminates this single point of control by distributing the database across a network of computers called **nodes**.

## How Blocks Work

### Block Structure

Each block contains:
- **Transaction Data**: The actual information being recorded
- **Timestamp**: When the block was created
- **Previous Block Hash**: A cryptographic fingerprint linking to the previous block
- **Nonce**: A number used in the mining process
- **Current Block Hash**: The block's unique fingerprint

### The Chain

When a new block is created, it includes the hash of the previous block. This creates an unbreakable chain where altering any past block would require recalculating every subsequent block—a computationally impossible task.

## Why Decentralization Matters

### The Problem with Centralization

When a single entity controls data:
- They can modify records without oversight
- A single hack compromises everything
- Users must trust the central authority
- Service can be denied arbitrarily

### The Blockchain Solution

With blockchain:
- No single point of failure
- Transparent and auditable by anyone
- Tamper-resistant through cryptography
- Operates 24/7 without downtime

## Real-World Applications

### Beyond Cryptocurrency

1. **Supply Chain**: Track products from manufacture to delivery
2. **Healthcare**: Secure, interoperable medical records
3. **Voting**: Transparent, verifiable election systems
4. **Real Estate**: Streamlined property transfers
5. **Identity**: Self-sovereign digital identity

## The Consensus Problem

How do thousands of computers agree on the true state of the ledger? This is solved through **consensus mechanisms**:

- **Proof of Work**: Miners compete to solve mathematical puzzles
- **Proof of Stake**: Validators stake cryptocurrency as collateral
- **Delegated Proof of Stake**: Token holders vote for validators

## Key Takeaways

1. Blockchain is a distributed, immutable ledger
2. Blocks are cryptographically linked in a chain
3. Decentralization eliminates single points of failure
4. Consensus mechanisms ensure network agreement
5. Applications extend far beyond cryptocurrency""",
            "fr": """# Comprendre la Technologie Blockchain

La blockchain est l'une des technologies les plus transformatrices du 21e siècle. C'est la fondation sur laquelle Bitcoin, Ethereum et des milliers d'autres cryptomonnaies sont construites. Mais le potentiel de la blockchain s'étend bien au-delà de l'argent numérique.

## Qu'est-ce qu'une Blockchain ?

Dans sa forme la plus simple, une blockchain est un **registre numérique distribué** qui enregistre les transactions sur de nombreux ordinateurs. Pensez-y comme un Google Doc partagé que des milliers de personnes peuvent consulter et vérifier, mais qu'aucune personne ne peut modifier secrètement.

### L'Innovation Clé

Les bases de données traditionnelles sont contrôlées par une autorité centrale (comme une banque). La blockchain élimine ce point de contrôle unique en distribuant la base de données sur un réseau d'ordinateurs appelés **nœuds**.

## Comment Fonctionnent les Blocs

### Structure d'un Bloc

Chaque bloc contient :
- **Données de Transaction** : Les informations réellement enregistrées
- **Horodatage** : Quand le bloc a été créé
- **Hash du Bloc Précédent** : Une empreinte cryptographique liant au bloc précédent
- **Nonce** : Un nombre utilisé dans le processus de minage
- **Hash du Bloc Actuel** : L'empreinte unique du bloc

### La Chaîne

Quand un nouveau bloc est créé, il inclut le hash du bloc précédent. Cela crée une chaîne incassable où modifier un bloc passé nécessiterait de recalculer tous les blocs suivants—une tâche computationnellement impossible.

## Pourquoi la Décentralisation est Importante

### Le Problème de la Centralisation

Quand une seule entité contrôle les données :
- Elle peut modifier les enregistrements sans supervision
- Un seul piratage compromet tout
- Les utilisateurs doivent faire confiance à l'autorité centrale
- Le service peut être refusé arbitrairement

### La Solution Blockchain

Avec la blockchain :
- Aucun point de défaillance unique
- Transparent et auditable par tous
- Résistant à la falsification grâce à la cryptographie
- Fonctionne 24h/24 sans interruption

## Applications Concrètes

### Au-delà des Cryptomonnaies

1. **Chaîne d'Approvisionnement** : Suivre les produits de la fabrication à la livraison
2. **Santé** : Dossiers médicaux sécurisés et interopérables
3. **Vote** : Systèmes électoraux transparents et vérifiables
4. **Immobilier** : Transferts de propriété simplifiés
5. **Identité** : Identité numérique auto-souveraine

## Le Problème du Consensus

Comment des milliers d'ordinateurs s'accordent-ils sur le vrai état du registre ? Cela est résolu par les **mécanismes de consensus** :

- **Preuve de Travail** : Les mineurs rivalisent pour résoudre des puzzles mathématiques
- **Preuve d'Enjeu** : Les validateurs mettent en jeu des cryptomonnaies comme garantie
- **Preuve d'Enjeu Déléguée** : Les détenteurs de tokens votent pour les validateurs

## Points Clés à Retenir

1. La blockchain est un registre distribué et immuable
2. Les blocs sont liés cryptographiquement en chaîne
3. La décentralisation élimine les points de défaillance uniques
4. Les mécanismes de consensus assurent l'accord du réseau
5. Les applications s'étendent bien au-delà des cryptomonnaies""",
            "pt": """# Entendendo a Tecnologia Blockchain

O blockchain é uma das tecnologias mais transformadoras do século XXI. É a base sobre a qual Bitcoin, Ethereum e milhares de outras criptomoedas são construídas. Mas o potencial do blockchain vai muito além do dinheiro digital.

## O que é um Blockchain?

Em sua forma mais simples, um blockchain é um **registro digital distribuído** que grava transações em muitos computadores. Pense nele como um Google Doc compartilhado que milhares de pessoas podem visualizar e verificar, mas que ninguém pode modificar secretamente.

### A Inovação Principal

Bancos de dados tradicionais são controlados por uma autoridade central (como um banco). O blockchain elimina esse ponto único de controle ao distribuir o banco de dados em uma rede de computadores chamados **nós**.

## Como os Blocos Funcionam

### Estrutura de um Bloco

Cada bloco contém:
- **Dados da Transação**: As informações reais sendo registradas
- **Carimbo de Tempo**: Quando o bloco foi criado
- **Hash do Bloco Anterior**: Uma impressão digital criptográfica ligando ao bloco anterior
- **Nonce**: Um número usado no processo de mineração
- **Hash do Bloco Atual**: A impressão digital única do bloco

### A Cadeia

Quando um novo bloco é criado, ele inclui o hash do bloco anterior. Isso cria uma cadeia inquebrável onde alterar qualquer bloco passado exigiria recalcular todos os blocos subsequentes — uma tarefa computacionalmente impossível.

## Por que a Descentralização Importa

### O Problema da Centralização

Quando uma única entidade controla os dados:
- Ela pode modificar registros sem supervisão
- Um único ataque compromete tudo
- Os usuários precisam confiar na autoridade central
- O serviço pode ser negado arbitrariamente

### A Solução Blockchain

Com o blockchain:
- Nenhum ponto único de falha
- Transparente e auditável por qualquer pessoa
- Resistente a adulterações graças à criptografia
- Funciona 24 horas por dia, sem interrupções

## Aplicações no Mundo Real

### Além das Criptomoedas

1. **Cadeia de Suprimentos**: Rastreie produtos da fabricação à entrega
2. **Saúde**: Prontuários médicos seguros e interoperáveis
3. **Votação**: Sistemas eleitorais transparentes e verificáveis
4. **Imóveis**: Transferências de propriedade simplificadas
5. **Identidade**: Identidade digital autossoberana

## O Problema do Consenso

Como milhares de computadores concordam com o estado verdadeiro do registro? Isso é resolvido por **mecanismos de consenso**:

- **Prova de Trabalho**: Mineradores competem para resolver quebra-cabeças matemáticos
- **Prova de Participação**: Validadores apostam criptomoedas como garantia
- **Prova de Participação Delegada**: Detentores de tokens votam em validadores

## Principais Conclusões

1. Blockchain é um registro distribuído e imutável
2. Os blocos são ligados criptograficamente em uma cadeia
3. A descentralização elimina pontos únicos de falha
4. Os mecanismos de consenso garantem o acordo da rede
5. As aplicações vão muito além das criptomoedas""",
            "ar": """# فهم تقنية البلوكتشين

البلوكتشين هي واحدة من أكثر التقنيات تحويلًا في القرن الحادي والعشرين. إنها الأساس الذي بُني عليه البيتكوين والإيثريوم وآلاف العملات المشفرة الأخرى. لكن إمكانات البلوكتشين تمتد إلى ما هو أبعد من المال الرقمي.

## ما هي البلوكتشين؟

في أبسط صورها، البلوكتشين هي **دفتر أستاذ رقمي موزع** يسجل المعاملات عبر العديد من أجهزة الكمبيوتر. فكر فيها كمستند Google مشترك يمكن لآلاف الأشخاص عرضه والتحقق منه، لكن لا يمكن لأي شخص تعديله سرًا.

### الابتكار الرئيسي

قواعد البيانات التقليدية تتحكم فيها سلطة مركزية (مثل البنك). تزيل البلوكتشين نقطة التحكم الفردية هذه من خلال توزيع قاعدة البيانات عبر شبكة من أجهزة الكمبيوتر تسمى **العقد**.

## كيف تعمل الكتل

### هيكل الكتلة

تحتوي كل كتلة على:
- **بيانات المعاملة**: المعلومات الفعلية المسجلة
- **الطابع الزمني**: متى تم إنشاء الكتلة
- **هاش الكتلة السابقة**: بصمة تشفيرية ترتبط بالكتلة السابقة
- **الرقم المستخدم**: رقم مستخدم في عملية التعدين
- **هاش الكتلة الحالية**: البصمة الفريدة للكتلة

### السلسلة

عندما يتم إنشاء كتلة جديدة، تتضمن هاش الكتلة السابقة. هذا يخلق سلسلة غير قابلة للكسر حيث أن تغيير أي كتلة سابقة سيتطلب إعادة حساب كل الكتل اللاحقة - مهمة مستحيلة حسابيًا.

## لماذا اللامركزية مهمة

### مشكلة المركزية

عندما تتحكم جهة واحدة في البيانات:
- يمكنها تعديل السجلات دون رقابة
- اختراق واحد يعرض كل شيء للخطر
- يجب على المستخدمين الوثوق بالسلطة المركزية
- يمكن رفض الخدمة تعسفيًا

### حل البلوكتشين

مع البلوكتشين:
- لا توجد نقطة فشل واحدة
- شفافة وقابلة للتدقيق من قبل أي شخص
- مقاومة للتلاعب من خلال التشفير
- تعمل على مدار الساعة دون توقف

## التطبيقات الواقعية

### ما وراء العملات المشفرة

1. **سلسلة التوريد**: تتبع المنتجات من التصنيع إلى التسليم
2. **الرعاية الصحية**: سجلات طبية آمنة وقابلة للتشغيل البيني
3. **التصويت**: أنظمة انتخابية شفافة وقابلة للتحقق
4. **العقارات**: نقل ملكية مبسط
5. **الهوية**: هوية رقمية ذاتية السيادة

## مشكلة الإجماع

كيف تتفق آلاف أجهزة الكمبيوتر على الحالة الحقيقية للسجل؟ يتم حل هذا من خلال **آليات الإجماع**:

- **إثبات العمل**: يتنافس المعدنون لحل الألغاز الرياضية
- **إثبات الحصة**: يراهن المدققون بالعملات المشفرة كضمان
- **إثبات الحصة المفوض**: يصوت حاملو الرموز للمدققين

## النقاط الرئيسية

1. البلوكتشين هي دفتر أستاذ موزع وغير قابل للتغيير
2. الكتل مرتبطة تشفيريًا في سلسلة
3. اللامركزية تزيل نقاط الفشل الفردية
4. آليات الإجماع تضمن اتفاق الشبكة
5. التطبيقات تمتد إلى ما هو أبعد من العملات المشفرة"""
        },
        "summary": {
            "en": "Blockchain is a distributed, immutable digital ledger that enables trustless transactions without intermediaries. Its decentralized nature provides security, transparency, and censorship resistance.",
            "fr": "La blockchain est un registre numérique distribué et immuable qui permet des transactions sans confiance et sans intermédiaires. Sa nature décentralisée offre sécurité, transparence et résistance à la censure.",
            "ar": "البلوكتشين هي دفتر أستاذ رقمي موزع وغير قابل للتغيير يمكّن من إجراء معاملات بدون وسطاء. طبيعتها اللامركزية توفر الأمان والشفافية ومقاومة الرقابة.",
            "pt": "Blockchain é um registro digital distribuído e imutável que permite transações sem necessidade de intermediários. Sua natureza descentralizada oferece segurança, transparência e resistência à censura."
        },
        "examples": {
            "en": [
                "Bitcoin transactions verified by thousands of nodes worldwide",
                "Walmart tracking food origins using blockchain for safety",
                "Estonia's digital identity system built on blockchain"
            ],
            "fr": [
                "Transactions Bitcoin vérifiées par des milliers de nœuds dans le monde",
                "Walmart suit l'origine des aliments avec la blockchain pour la sécurité",
                "Le système d'identité numérique de l'Estonie construit sur la blockchain"
            ],
            "ar": [
                "معاملات البيتكوين التي يتم التحقق منها بواسطة آلاف العقد حول العالم",
                "وول مارت تتبع أصول الغذاء باستخدام البلوكتشين للسلامة",
                "نظام الهوية الرقمية في إستونيا المبني على البلوكتشين"
            ],
            "pt": [
                "Transações de Bitcoin verificadas por milhares de nós ao redor do mundo",
                "Walmart rastreia a origem dos alimentos usando blockchain para segurança",
                "Sistema de identidade digital da Estônia construído sobre blockchain"
            ]
        },
        "recommended_readings": {
            "en": [
                "Bitcoin Whitepaper by Satoshi Nakamoto",
                "Mastering Bitcoin by Andreas Antonopoulos",
                "The Blockchain Revolution by Don Tapscott"
            ],
            "fr": [
                "Livre blanc Bitcoin par Satoshi Nakamoto",
                "Mastering Bitcoin par Andreas Antonopoulos",
                "The Blockchain Revolution par Don Tapscott"
            ],
            "ar": [
                "الورقة البيضاء للبيتكوين بواسطة ساتوشي ناكاموتو",
                "إتقان البيتكوين بواسطة أندرياس أنتونوبولوس",
                "ثورة البلوكتشين بواسطة دون تابسكوت"
            ],
            "pt": [
                "Whitepaper do Bitcoin por Satoshi Nakamoto",
                "Dominando o Bitcoin por Andreas Antonopoulos",
                "A Revolução do Blockchain por Don Tapscott"
            ]
        },
        "checkpoints": [
            {
                "id": "checkpoint-1-1",
                "position": 1,
                "question": {
                    "en": "What is the main innovation of blockchain technology?",
                    "fr": "Quelle est l'innovation principale de la technologie blockchain ?",
                    "ar": "ما هو الابتكار الرئيسي لتقنية البلوكتشين؟",
                    "pt": "Qual é a principal inovação da tecnologia blockchain?"
                },
                "options": {
                    "en": ["Faster transactions", "Decentralized control", "Lower fees", "Better graphics"],
                    "fr": ["Transactions plus rapides", "Contrôle décentralisé", "Frais réduits", "Meilleurs graphiques"],
                    "ar": ["معاملات أسرع", "تحكم لامركزي", "رسوم أقل", "رسومات أفضل"],
                    "pt": ["Transações mais rápidas", "Controle descentralizado", "Taxas menores", "Melhores gráficos"]
                },
                "correct_answer": 1,
                "explanation": {
                    "en": "The key innovation is decentralized control - no single entity owns or controls the network.",
                    "fr": "L'innovation clé est le contrôle décentralisé - aucune entité unique ne possède ou ne contrôle le réseau.",
                    "ar": "الابتكار الرئيسي هو التحكم اللامركزي - لا توجد جهة واحدة تمتلك أو تتحكم في الشبكة.",
                    "pt": "A inovação central é o controle descentralizado — nenhuma entidade única possui ou controla a rede."
                }
            },
            {
                "id": "checkpoint-1-2",
                "position": 2,
                "question": {
                    "en": "What links blocks together in a blockchain?",
                    "fr": "Qu'est-ce qui lie les blocs ensemble dans une blockchain ?",
                    "ar": "ما الذي يربط الكتل معًا في البلوكتشين؟",
                    "pt": "O que liga os blocos uns aos outros em um blockchain?"
                },
                "options": {
                    "en": ["Serial numbers", "Timestamps", "Cryptographic hashes", "IP addresses"],
                    "fr": ["Numéros de série", "Horodatages", "Hachages cryptographiques", "Adresses IP"],
                    "ar": ["أرقام تسلسلية", "طوابع زمنية", "هاشات تشفيرية", "عناوين IP"],
                    "pt": ["Números de série", "Carimbos de tempo", "Hashes criptográficos", "Endereços IP"]
                },
                "correct_answer": 2,
                "explanation": {
                    "en": "Each block contains the cryptographic hash of the previous block, creating an unbreakable chain.",
                    "fr": "Chaque bloc contient le hachage cryptographique du bloc précédent, créant une chaîne incassable.",
                    "ar": "كل كتلة تحتوي على الهاش التشفيري للكتلة السابقة، مما يخلق سلسلة غير قابلة للكسر.",
                    "pt": "Cada bloco contém o hash criptográfico do bloco anterior, criando uma cadeia inquebrável."
                }
            }
        ],
        "hero_image_prompt": "Modern flat design illustration of blockchain technology, showing interconnected glowing blue blocks forming a chain, digital nodes network in background, dark blue gradient background, professional educational style, clean minimalist design",
        "infographic_prompts": [
            "Infographic showing blockchain block structure with labeled components: transaction data, timestamp, previous hash, nonce, current hash. Clean flat design, blue color scheme, educational style",
            "Comparison infographic: Centralized vs Decentralized systems. Left side shows single server with clients, right side shows distributed network of nodes. Modern flat illustration style",
            "Step-by-step infographic showing how a blockchain transaction works: create, broadcast, validate, add to block, confirm. Horizontal flow, icons for each step, professional blue theme"
        ]
    },
    
    "course-foundations-lesson-2": {
        "id": "course-foundations-lesson-2",
        "course_id": "course-foundations",
        "order": 1,
        "duration_minutes": 50,
        "difficulty": "beginner",
        "is_trial": True,
        "title": {
            "en": "What is Bitcoin?",
            "fr": "Qu'est-ce que le Bitcoin ?",
            "ar": "ما هو البيتكوين؟",
            "pt": "O que é Bitcoin?"
        },
        "subtitle": {
            "en": "The world's first and most valuable cryptocurrency",
            "fr": "La première et plus précieuse cryptomonnaie au monde",
            "ar": "أول وأكثر عملة مشفرة قيمة في العالم",
            "pt": "A primeira e mais valiosa criptomoeda do mundo"
        },
        "learning_objectives": {
            "en": [
                "Understand Bitcoin's origin and the problem it solves",
                "Learn Bitcoin's key monetary properties",
                "Compare Bitcoin to traditional money and gold",
                "Understand the concept of digital scarcity"
            ],
            "fr": [
                "Comprendre l'origine du Bitcoin et le problème qu'il résout",
                "Apprendre les propriétés monétaires clés du Bitcoin",
                "Comparer le Bitcoin à l'argent traditionnel et à l'or",
                "Comprendre le concept de rareté numérique"
            ],
            "ar": [
                "فهم أصل البيتكوين والمشكلة التي يحلها",
                "تعلم الخصائص النقدية الرئيسية للبيتكوين",
                "مقارنة البيتكوين بالمال التقليدي والذهب",
                "فهم مفهوم الندرة الرقمية"
            ],
            "pt": [
                "Entender a origem do Bitcoin e o problema que ele resolve",
                "Aprender as principais propriedades monetárias do Bitcoin",
                "Comparar o Bitcoin com o dinheiro tradicional e o ouro",
                "Compreender o conceito de escassez digital"
            ]
        },
        "content": {
            "en": """# Bitcoin: Digital Gold for the Digital Age

Bitcoin is the world's first successful cryptocurrency, representing a fundamental breakthrough in how we think about money, value, and trust in the digital realm.

## The Genesis of Bitcoin

### The 2008 Financial Crisis

In 2008, the global financial system nearly collapsed. Banks that were "too big to fail" were bailed out with taxpayer money. Trust in financial institutions plummeted. It was in this environment that a mysterious figure emerged.

### Satoshi Nakamoto

On October 31, 2008, someone using the pseudonym "Satoshi Nakamoto" published a whitepaper titled "Bitcoin: A Peer-to-Peer Electronic Cash System." This 9-page document outlined a revolutionary system for digital money.

On January 3, 2009, the first Bitcoin block (the "Genesis Block") was mined. Embedded in it was a message: "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks" - a clear statement of Bitcoin's purpose.

## What Makes Bitcoin Unique

### Fixed Supply

Bitcoin has a hard cap of **21 million coins**. This limit is coded into the protocol and cannot be changed. Currently, about 19.5 million have been mined, with the last Bitcoin expected around the year 2140.

### Halving Events

Every 210,000 blocks (approximately 4 years), the reward for mining new blocks is cut in half:
- 2009: 50 BTC per block
- 2012: 25 BTC per block
- 2016: 12.5 BTC per block
- 2020: 6.25 BTC per block
- 2024: 3.125 BTC per block

### Decentralization

No company, government, or individual controls Bitcoin. It runs on a network of thousands of computers worldwide. Anyone can run a node and participate.

## Bitcoin vs Traditional Money

### Fiat Currency (USD, EUR, etc.)

| Property | Fiat | Bitcoin |
|----------|------|---------|
| Supply | Unlimited | 21 million max |
| Control | Central banks | Decentralized |
| Inflation | Designed to inflate | Deflationary |
| Seizure | Can be frozen | Cannot be seized |
| Borders | Restricted | Borderless |

### Bitcoin vs Gold

| Property | Gold | Bitcoin |
|----------|------|---------|
| Scarcity | Natural | Programmed |
| Portability | Heavy | Digital |
| Divisibility | Difficult | 100 million units |
| Verifiability | Requires expertise | Cryptographic |
| Storage | Physical vaults | Digital wallets |

## Bitcoin's Value Proposition

### Store of Value

Many view Bitcoin as "digital gold" - a hedge against inflation and currency debasement. Its fixed supply makes it attractive in a world of unlimited money printing.

### Medium of Exchange

Bitcoin enables peer-to-peer transactions without intermediaries. Send any amount, anywhere in the world, 24/7, for minimal fees.

### Unit of Account

While volatile currently, Bitcoin's smallest unit (1 satoshi = 0.00000001 BTC) allows for precise accounting.

## The Network Effect

Bitcoin's value grows as more people use it:
- More users = more demand
- More demand = higher price
- Higher price = more media attention
- More attention = more users

This creates a powerful feedback loop that has driven Bitcoin from worthless to over $100,000 per coin.

## Key Takeaways

1. Bitcoin was created in response to the 2008 financial crisis
2. Its 21 million supply cap creates digital scarcity
3. Decentralization means no single point of control or failure
4. Halving events reduce new supply every 4 years
5. Bitcoin combines the best properties of gold and digital payments""",
            "fr": """# Bitcoin : L'Or Numérique de l'Ère Digitale

Le Bitcoin est la première cryptomonnaie réussie au monde, représentant une avancée fondamentale dans notre façon de penser l'argent, la valeur et la confiance dans le monde numérique.

## La Genèse du Bitcoin

### La Crise Financière de 2008

En 2008, le système financier mondial a failli s'effondrer. Les banques "trop grandes pour faire faillite" ont été renflouées avec l'argent des contribuables. La confiance dans les institutions financières s'est effondrée. C'est dans cet environnement qu'une figure mystérieuse a émergé.

### Satoshi Nakamoto

Le 31 octobre 2008, quelqu'un utilisant le pseudonyme "Satoshi Nakamoto" a publié un livre blanc intitulé "Bitcoin : Un Système de Monnaie Électronique Pair-à-Pair". Ce document de 9 pages décrivait un système révolutionnaire pour l'argent numérique.

Le 3 janvier 2009, le premier bloc Bitcoin (le "Bloc Genesis") a été miné. Il contenait un message : "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks" - une déclaration claire de l'objectif du Bitcoin.

## Ce Qui Rend le Bitcoin Unique

### Offre Fixe

Le Bitcoin a un plafond strict de **21 millions de pièces**. Cette limite est codée dans le protocole et ne peut pas être modifiée. Actuellement, environ 19,5 millions ont été minés, le dernier Bitcoin étant prévu vers l'année 2140.

### Événements de Halving

Tous les 210 000 blocs (environ 4 ans), la récompense pour le minage de nouveaux blocs est réduite de moitié :
- 2009 : 50 BTC par bloc
- 2012 : 25 BTC par bloc
- 2016 : 12,5 BTC par bloc
- 2020 : 6,25 BTC par bloc
- 2024 : 3,125 BTC par bloc

### Décentralisation

Aucune entreprise, gouvernement ou individu ne contrôle le Bitcoin. Il fonctionne sur un réseau de milliers d'ordinateurs dans le monde. N'importe qui peut faire tourner un nœud et participer.

## Bitcoin vs Argent Traditionnel

### Monnaie Fiduciaire (USD, EUR, etc.)

| Propriété | Fiat | Bitcoin |
|-----------|------|---------|
| Offre | Illimitée | 21 millions max |
| Contrôle | Banques centrales | Décentralisé |
| Inflation | Conçue pour inflater | Déflationniste |
| Saisie | Peut être gelée | Ne peut être saisi |
| Frontières | Restreintes | Sans frontières |

### Bitcoin vs Or

| Propriété | Or | Bitcoin |
|-----------|-----|---------|
| Rareté | Naturelle | Programmée |
| Portabilité | Lourd | Numérique |
| Divisibilité | Difficile | 100 millions d'unités |
| Vérifiabilité | Requiert expertise | Cryptographique |
| Stockage | Coffres physiques | Portefeuilles numériques |

## La Proposition de Valeur du Bitcoin

### Réserve de Valeur

Beaucoup voient le Bitcoin comme "l'or numérique" - une protection contre l'inflation et la dévaluation monétaire. Son offre fixe le rend attractif dans un monde d'impression monétaire illimitée.

### Moyen d'Échange

Le Bitcoin permet des transactions pair-à-pair sans intermédiaires. Envoyez n'importe quel montant, partout dans le monde, 24h/24, pour des frais minimes.

### Unité de Compte

Bien que volatile actuellement, la plus petite unité du Bitcoin (1 satoshi = 0,00000001 BTC) permet une comptabilité précise.

## L'Effet Réseau

La valeur du Bitcoin croît à mesure que plus de personnes l'utilisent :
- Plus d'utilisateurs = plus de demande
- Plus de demande = prix plus élevé
- Prix plus élevé = plus d'attention médiatique
- Plus d'attention = plus d'utilisateurs

Cela crée une boucle de rétroaction puissante qui a fait passer le Bitcoin de sans valeur à plus de 100 000 $ par pièce.

## Points Clés à Retenir

1. Le Bitcoin a été créé en réponse à la crise financière de 2008
2. Son plafond de 21 millions crée une rareté numérique
3. La décentralisation signifie aucun point de contrôle ou de défaillance unique
4. Les halvings réduisent la nouvelle offre tous les 4 ans
5. Le Bitcoin combine les meilleures propriétés de l'or et des paiements numériques""",
            "ar": """# البيتكوين: الذهب الرقمي للعصر الرقمي

البيتكوين هي أول عملة مشفرة ناجحة في العالم، تمثل اختراقًا جوهريًا في طريقة تفكيرنا حول المال والقيمة والثقة في العالم الرقمي.

## نشأة البيتكوين

### الأزمة المالية لعام 2008

في عام 2008، كان النظام المالي العالمي على وشك الانهيار. تم إنقاذ البنوك التي كانت "أكبر من أن تفشل" بأموال دافعي الضرائب. انهارت الثقة في المؤسسات المالية. في هذه البيئة ظهرت شخصية غامضة.

### ساتوشي ناكاموتو

في 31 أكتوبر 2008، نشر شخص يستخدم الاسم المستعار "ساتوشي ناكاموتو" ورقة بيضاء بعنوان "بيتكوين: نظام نقدي إلكتروني من نظير إلى نظير". هذه الوثيقة المكونة من 9 صفحات حددت نظامًا ثوريًا للنقود الرقمية.

في 3 يناير 2009، تم تعدين أول كتلة بيتكوين ("كتلة التكوين"). كانت تحتوي على رسالة: "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks" - بيان واضح لهدف البيتكوين.

## ما الذي يجعل البيتكوين فريدًا

### العرض الثابت

للبيتكوين حد أقصى صارم يبلغ **21 مليون عملة**. هذا الحد مُشفر في البروتوكول ولا يمكن تغييره. حاليًا، تم تعدين حوالي 19.5 مليون، مع توقع آخر بيتكوين حوالي عام 2140.

### أحداث التنصيف

كل 210,000 كتلة (حوالي 4 سنوات)، يتم تقليل مكافأة تعدين الكتل الجديدة إلى النصف:
- 2009: 50 BTC لكل كتلة
- 2012: 25 BTC لكل كتلة
- 2016: 12.5 BTC لكل كتلة
- 2020: 6.25 BTC لكل كتلة
- 2024: 3.125 BTC لكل كتلة

### اللامركزية

لا توجد شركة أو حكومة أو فرد يتحكم في البيتكوين. يعمل على شبكة من آلاف أجهزة الكمبيوتر حول العالم. يمكن لأي شخص تشغيل عقدة والمشاركة.

## البيتكوين مقابل المال التقليدي

### العملة الورقية (USD، EUR، إلخ)

| الخاصية | العملة الورقية | البيتكوين |
|---------|---------------|-----------|
| العرض | غير محدود | 21 مليون كحد أقصى |
| التحكم | البنوك المركزية | لامركزي |
| التضخم | مصممة للتضخم | انكماشية |
| المصادرة | يمكن تجميدها | لا يمكن مصادرته |
| الحدود | مقيدة | بلا حدود |

### البيتكوين مقابل الذهب

| الخاصية | الذهب | البيتكوين |
|---------|------|-----------|
| الندرة | طبيعية | مبرمجة |
| قابلية النقل | ثقيل | رقمي |
| قابلية التقسيم | صعبة | 100 مليون وحدة |
| قابلية التحقق | تتطلب خبرة | تشفيرية |
| التخزين | خزائن مادية | محافظ رقمية |

## عرض قيمة البيتكوين

### مخزن للقيمة

يرى الكثيرون البيتكوين على أنه "الذهب الرقمي" - تحوط ضد التضخم وانخفاض قيمة العملة. عرضه الثابت يجعله جذابًا في عالم طباعة النقود غير المحدودة.

### وسيط للتبادل

يتيح البيتكوين معاملات من نظير إلى نظير دون وسطاء. أرسل أي مبلغ، إلى أي مكان في العالم، على مدار الساعة، برسوم ضئيلة.

### وحدة حساب

رغم التقلب الحالي، أصغر وحدة في البيتكوين (1 ساتوشي = 0.00000001 BTC) تسمح بمحاسبة دقيقة.

## تأثير الشبكة

تنمو قيمة البيتكوين مع زيادة عدد المستخدمين:
- المزيد من المستخدمين = المزيد من الطلب
- المزيد من الطلب = سعر أعلى
- سعر أعلى = المزيد من الاهتمام الإعلامي
- المزيد من الاهتمام = المزيد من المستخدمين

هذا يخلق حلقة تغذية راجعة قوية دفعت البيتكوين من لا قيمة إلى أكثر من 100,000 دولار للعملة الواحدة.

## النقاط الرئيسية

1. تم إنشاء البيتكوين استجابة للأزمة المالية لعام 2008
2. سقف الـ 21 مليون يخلق ندرة رقمية
3. اللامركزية تعني عدم وجود نقطة تحكم أو فشل واحدة
4. التنصيف يقلل العرض الجديد كل 4 سنوات
5. البيتكوين يجمع بين أفضل خصائص الذهب والمدفوعات الرقمية""",
            "pt": """# Bitcoin: Ouro Digital para a Era Digital

O Bitcoin é a primeira criptomoeda bem-sucedida do mundo, representando um avanço fundamental na forma como pensamos sobre dinheiro, valor e confiança no mundo digital.

## A Origem do Bitcoin

### A Crise Financeira de 2008

Em 2008, o sistema financeiro global quase entrou em colapso. Bancos considerados "grandes demais para falir" foram socorridos com dinheiro dos contribuintes. A confiança nas instituições financeiras despencou. Foi nesse contexto que uma figura misteriosa emergiu.

### Satoshi Nakamoto

Em 31 de outubro de 2008, alguém usando o pseudônimo "Satoshi Nakamoto" publicou um whitepaper intitulado "Bitcoin: Um Sistema de Dinheiro Eletrônico Ponto a Ponto". Esse documento de 9 páginas descrevia um sistema revolucionário para dinheiro digital.

Em 3 de janeiro de 2009, o primeiro bloco do Bitcoin (o "Bloco Gênesis") foi minerado. Nele estava incorporada a mensagem: "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks" — uma declaração clara do propósito do Bitcoin.

## O que Torna o Bitcoin Único

### Oferta Fixa

O Bitcoin tem um limite rígido de **21 milhões de moedas**. Esse limite está codificado no protocolo e não pode ser alterado. Atualmente, cerca de 19,5 milhões já foram minerados, com o último Bitcoin previsto para por volta do ano 2140.

### Eventos de Halving

A cada 210.000 blocos (aproximadamente 4 anos), a recompensa pela mineração de novos blocos é cortada pela metade:
- 2009: 50 BTC por bloco
- 2012: 25 BTC por bloco
- 2016: 12,5 BTC por bloco
- 2020: 6,25 BTC por bloco
- 2024: 3,125 BTC por bloco

### Descentralização

Nenhuma empresa, governo ou indivíduo controla o Bitcoin. Ele funciona em uma rede de milhares de computadores ao redor do mundo. Qualquer pessoa pode rodar um nó e participar.

## Bitcoin vs Dinheiro Tradicional

### Moeda Fiduciária (USD, BRL, EUR, etc.)

| Propriedade | Fiduciária | Bitcoin |
|-------------|------------|---------|
| Oferta | Ilimitada | Máx. 21 milhões |
| Controle | Bancos centrais | Descentralizado |
| Inflação | Projetada para inflacionar | Deflacionário |
| Apreensão | Pode ser congelada | Não pode ser apreendido |
| Fronteiras | Restrita | Sem fronteiras |

### Bitcoin vs Ouro

| Propriedade | Ouro | Bitcoin |
|-------------|------|---------|
| Escassez | Natural | Programada |
| Portabilidade | Pesado | Digital |
| Divisibilidade | Difícil | 100 milhões de unidades |
| Verificabilidade | Requer expertise | Criptográfica |
| Armazenamento | Cofres físicos | Carteiras digitais |

## A Proposta de Valor do Bitcoin

### Reserva de Valor

Muitos veem o Bitcoin como "ouro digital" — uma proteção contra inflação e desvalorização monetária. Sua oferta fixa o torna atraente em um mundo de impressão ilimitada de dinheiro.

### Meio de Troca

O Bitcoin permite transações ponto a ponto sem intermediários. Envie qualquer quantia, para qualquer lugar do mundo, 24 horas por dia, com taxas mínimas.

### Unidade de Conta

Embora ainda volátil, a menor unidade do Bitcoin (1 satoshi = 0,00000001 BTC) permite uma contabilidade precisa.

## O Efeito de Rede

O valor do Bitcoin cresce à medida que mais pessoas o utilizam:
- Mais usuários = mais demanda
- Mais demanda = preço mais alto
- Preço mais alto = mais atenção da mídia
- Mais atenção = mais usuários

Isso cria um poderoso ciclo de retroalimentação que levou o Bitcoin de não ter valor algum a superar US$ 100.000 por moeda.

## Principais Conclusões

1. O Bitcoin foi criado em resposta à crise financeira de 2008
2. Seu limite de 21 milhões cria escassez digital
3. A descentralização significa nenhum ponto único de controle ou falha
4. Os eventos de halving reduzem a nova oferta a cada 4 anos
5. O Bitcoin combina as melhores propriedades do ouro e dos pagamentos digitais"""
        },
        "summary": {
            "en": "Bitcoin is a decentralized digital currency with a fixed supply of 21 million coins, created as a response to the 2008 financial crisis. Its scarcity, decentralization, and borderless nature make it 'digital gold'.",
            "fr": "Le Bitcoin est une monnaie numérique décentralisée avec une offre fixe de 21 millions de pièces, créée en réponse à la crise financière de 2008. Sa rareté, sa décentralisation et sa nature sans frontières en font 'l'or numérique'.",
            "ar": "البيتكوين هي عملة رقمية لامركزية بعرض ثابت يبلغ 21 مليون عملة، تم إنشاؤها كاستجابة للأزمة المالية لعام 2008. ندرتها ولامركزيتها وطبيعتها العابرة للحدود تجعلها 'الذهب الرقمي'.",
            "pt": "O Bitcoin é uma moeda digital descentralizada com oferta fixa de 21 milhões de moedas, criada em resposta à crise financeira de 2008. Sua escassez, descentralização e natureza sem fronteiras fazem dele o 'ouro digital'."
        },
        "examples": {
            "en": [
                "El Salvador adopted Bitcoin as legal tender in 2021",
                "MicroStrategy holds over $4 billion in Bitcoin on its balance sheet",
                "The Lightning Network enables instant, near-free Bitcoin payments"
            ],
            "fr": [
                "El Salvador a adopté le Bitcoin comme monnaie légale en 2021",
                "MicroStrategy détient plus de 4 milliards de dollars en Bitcoin",
                "Le Lightning Network permet des paiements Bitcoin instantanés et quasi-gratuits"
            ],
            "ar": [
                "اعتمدت السلفادور البيتكوين كعملة قانونية في 2021",
                "تمتلك MicroStrategy أكثر من 4 مليارات دولار من البيتكوين",
                "شبكة Lightning تمكن من مدفوعات بيتكوين فورية وشبه مجانية"
            ],
            "pt": [
                "El Salvador adotou o Bitcoin como moeda de curso legal em 2021",
                "MicroStrategy detém mais de US$ 4 bilhões em Bitcoin em seu balanço",
                "A Lightning Network viabiliza pagamentos em Bitcoin instantâneos e quase gratuitos"
            ]
        },
        "recommended_readings": {
            "en": [
                "The Bitcoin Standard by Saifedean Ammous",
                "Digital Gold by Nathaniel Popper",
                "The Internet of Money by Andreas Antonopoulos"
            ],
            "fr": [
                "The Bitcoin Standard par Saifedean Ammous",
                "Digital Gold par Nathaniel Popper",
                "The Internet of Money par Andreas Antonopoulos"
            ],
            "ar": [
                "معيار البيتكوين بواسطة سيف الدين عموص",
                "الذهب الرقمي بواسطة ناثانيال بوبر",
                "إنترنت المال بواسطة أندرياس أنتونوبولوس"
            ],
            "pt": [
                "O Padrão Bitcoin por Saifedean Ammous",
                "Ouro Digital por Nathaniel Popper",
                "A Internet do Dinheiro por Andreas Antonopoulos"
            ]
        },
        "checkpoints": [
            {
                "id": "checkpoint-2-1",
                "position": 1,
                "question": {
                    "en": "What is the maximum supply of Bitcoin?",
                    "fr": "Quelle est l'offre maximale de Bitcoin ?",
                    "ar": "ما هو الحد الأقصى لعرض البيتكوين؟",
                    "pt": "Qual é a oferta máxima de Bitcoin?"
                },
                "options": {
                    "en": ["Unlimited", "21 million", "100 million", "1 billion"],
                    "fr": ["Illimitée", "21 millions", "100 millions", "1 milliard"],
                    "ar": ["غير محدود", "21 مليون", "100 مليون", "مليار واحد"],
                    "pt": ["Ilimitada", "21 milhões", "100 milhões", "1 bilhão"]
                },
                "correct_answer": 1,
                "explanation": {
                    "en": "Bitcoin has a hard cap of 21 million coins, making it a scarce digital asset.",
                    "fr": "Le Bitcoin a un plafond strict de 21 millions de pièces, en faisant un actif numérique rare.",
                    "ar": "للبيتكوين حد أقصى صارم يبلغ 21 مليون عملة، مما يجعلها أصلًا رقميًا نادرًا.",
                    "pt": "O Bitcoin tem um limite rígido de 21 milhões de moedas, tornando-o um ativo digital escasso."
                }
            },
            {
                "id": "checkpoint-2-2",
                "position": 2,
                "question": {
                    "en": "What happens during a Bitcoin halving?",
                    "fr": "Que se passe-t-il lors d'un halving Bitcoin ?",
                    "ar": "ماذا يحدث خلال تنصيف البيتكوين؟",
                    "pt": "O que acontece durante um halving do Bitcoin?"
                },
                "options": {
                    "en": ["Bitcoin price doubles", "Mining reward is cut in half", "Transaction fees double", "Network speed increases"],
                    "fr": ["Le prix du Bitcoin double", "La récompense de minage est divisée par deux", "Les frais de transaction doublent", "La vitesse du réseau augmente"],
                    "ar": ["يتضاعف سعر البيتكوين", "يتم تقليل مكافأة التعدين إلى النصف", "تتضاعف رسوم المعاملات", "تزداد سرعة الشبكة"],
                    "pt": ["O preço do Bitcoin dobra", "A recompensa de mineração é cortada pela metade", "As taxas de transação dobram", "A velocidade da rede aumenta"]
                },
                "correct_answer": 1,
                "explanation": {
                    "en": "Every ~4 years, the block reward for miners is cut in half, reducing new Bitcoin supply.",
                    "fr": "Tous les ~4 ans, la récompense de bloc pour les mineurs est divisée par deux, réduisant la nouvelle offre de Bitcoin.",
                    "ar": "كل ~4 سنوات، يتم تقليل مكافأة الكتلة للمعدنين إلى النصف، مما يقلل من العرض الجديد للبيتكوين.",
                    "pt": "A cada ~4 anos, a recompensa por bloco para os mineradores é cortada pela metade, reduzindo a nova oferta de Bitcoin."
                }
            }
        ],
        "hero_image_prompt": "Modern illustration of Bitcoin as digital gold, showing a glowing Bitcoin coin with golden digital particles, futuristic vault background with blockchain elements, dark blue and gold color scheme, professional educational style",
        "infographic_prompts": [
            "Bitcoin halving timeline infographic showing years 2009-2024 with block rewards decreasing: 50, 25, 12.5, 6.25, 3.125 BTC. Clean timeline design with Bitcoin icons, gold and dark blue colors",
            "Comparison chart: Bitcoin vs Gold vs Fiat Currency properties - scarcity, portability, divisibility, verifiability. Modern table design with icons, professional style",
            "Bitcoin network effect diagram showing circular flow: more users -> more demand -> higher price -> more attention -> more users. Clean infographic style"
        ]
    }
}

def get_localized_trial_lesson(lesson_id: str, language: str = "en") -> Optional[Dict]:
    """Get a trial lesson with content in the specified language"""
    if lesson_id not in TRIAL_LESSONS:
        return None

    lesson = TRIAL_LESSONS[lesson_id].copy()

    for field in ["title", "subtitle", "summary"]:
        if field in lesson and isinstance(lesson[field], dict):
            lesson[field] = lesson[field].get(language, lesson[field].get("en", ""))

    if "content" in lesson and isinstance(lesson["content"], dict):
        lesson["content"] = lesson["content"].get(language, lesson["content"].get("en", ""))

    for field in ["learning_objectives", "examples", "recommended_readings"]:
        if field in lesson and isinstance(lesson[field], dict):
            lesson[field] = lesson[field].get(language, lesson[field].get("en", []))

    if "checkpoints" in lesson:
        localized_checkpoints = []
        for cp in lesson["checkpoints"]:
            localized_cp = cp.copy()
            for field in ["question", "explanation"]:
                if field in localized_cp and isinstance(localized_cp[field], dict):
                    localized_cp[field] = localized_cp[field].get(language, localized_cp[field].get("en", ""))
            if "options" in localized_cp and isinstance(localized_cp["options"], dict):
                localized_cp["options"] = localized_cp["options"].get(language, localized_cp["options"].get("en", []))
            localized_checkpoints.append(localized_cp)
        lesson["checkpoints"] = localized_checkpoints

    return lesson

def get_localized_trial_course(course_id: str, language: str = "en") -> Optional[Dict]:
    """Get a trial course with content in the specified language"""
    if course_id not in TRIAL_COURSES:
        return None

    course = TRIAL_COURSES[course_id].copy()

    for field in ["title", "description"]:
        if field in course and isinstance(course[field], dict):
            course[field] = course[field].get(language, course[field].get("en", ""))

    return course

def get_all_trial_lessons_for_course(course_id: str, language: str = "en") -> List[Dict]:
    """Get all trial lessons for a course in the specified language"""
    lessons = []
    for lesson_id, lesson in TRIAL_LESSONS.items():
        if lesson.get("course_id") == course_id:
            localized = get_localized_trial_lesson(lesson_id, language)
            if localized:
                lessons.append(localized)

    return sorted(lessons, key=lambda x: x.get("order", 0))
