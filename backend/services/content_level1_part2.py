# Premium Lesson Content - Level 1: Foundations (Lessons 6-8)
# Complete educational content in EN, FR, AR

LEVEL1_LESSONS_PART2 = {
    "course-foundations-lesson-6": {
        "id": "course-foundations-lesson-6",
        "course_id": "course-foundations",
        "order": 5,
        "duration_minutes": 50,
        "difficulty": "beginner",
        "title": {
            "en": "Centralized vs Decentralized Exchanges",
            "fr": "Exchanges Centralisés vs Décentralisés",
            "ar": "البورصات المركزية مقابل اللامركزية"
        },
        "subtitle": {
            "en": "Where and how to trade cryptocurrency",
            "fr": "Où et comment échanger des cryptomonnaies",
            "ar": "أين وكيف تتداول العملات المشفرة"
        },
        "learning_objectives": {
            "en": [
                "Understand the difference between CEX and DEX",
                "Learn the pros and cons of each type",
                "Know how to evaluate exchange security",
                "Understand trading pairs and liquidity"
            ],
            "fr": [
                "Comprendre la différence entre CEX et DEX",
                "Apprendre les avantages et inconvénients de chaque type",
                "Savoir évaluer la sécurité d'un exchange",
                "Comprendre les paires de trading et la liquidité"
            ],
            "ar": [
                "فهم الفرق بين CEX و DEX",
                "تعلم إيجابيات وسلبيات كل نوع",
                "معرفة كيفية تقييم أمان البورصة",
                "فهم أزواج التداول والسيولة"
            ]
        },
        "content": {
            "en": """# Centralized vs Decentralized Exchanges

Exchanges are the marketplaces of the crypto world. Understanding the different types is crucial for any crypto investor.

## Centralized Exchanges (CEX)

### How They Work

Centralized exchanges operate like traditional stock exchanges:
- A company runs the platform
- You deposit funds into their custody
- They match buy and sell orders
- They verify your identity (KYC)

### Popular Centralized Exchanges

| Exchange | Founded | Daily Volume | Notable Features |
|----------|---------|--------------|------------------|
| Binance | 2017 | $15B+ | Largest, most pairs |
| Coinbase | 2012 | $2B+ | US-regulated, beginner-friendly |
| Kraken | 2011 | $1B+ | Strong security record |
| OKX | 2017 | $3B+ | Derivatives trading |

### Advantages of CEX

**User-Friendly**
- Intuitive interfaces
- Customer support available
- Fiat on/off ramps (buy with credit card)
- Mobile apps

**High Liquidity**
- Large order books
- Minimal slippage on trades
- Fast execution

**Advanced Features**
- Margin trading
- Futures and options
- Staking services
- Earn programs

### Disadvantages of CEX

**Custody Risk**
- "Not your keys, not your coins"
- Exchange hacks have lost billions
- Can freeze your account
- Bankruptcy risk (FTX collapse)

**Privacy Concerns**
- KYC requirements
- Transaction monitoring
- Data breaches possible

**Centralization**
- Single point of failure
- Can be shut down by regulators
- May delist tokens without notice

## Decentralized Exchanges (DEX)

### How They Work

DEXs operate through smart contracts:
- No central company
- You keep custody of your funds
- Trades execute via automated market makers (AMMs)
- No KYC required

### Popular Decentralized Exchanges

| DEX | Blockchain | Type | Notable Features |
|-----|------------|------|------------------|
| Uniswap | Ethereum | AMM | Largest DEX |
| PancakeSwap | BNB Chain | AMM | Lower fees |
| dYdX | StarkEx | Order Book | Perpetuals |
| Curve | Ethereum | AMM | Stablecoin swaps |

### How AMMs Work

Instead of order books, AMMs use liquidity pools:

1. Liquidity providers deposit token pairs
2. Prices determined by mathematical formula (x * y = k)
3. Traders swap against the pool
4. Providers earn fees from trades

### Advantages of DEX

**Self-Custody**
- Your keys, your coins
- Funds never leave your wallet
- No withdrawal limits

**Privacy**
- No KYC required
- Pseudonymous trading
- No personal data collected

**Censorship Resistance**
- Can't be shut down easily
- Access to any token
- 24/7 availability

### Disadvantages of DEX

**Complexity**
- Steeper learning curve
- Must manage own wallet
- Gas fees can be high

**Lower Liquidity**
- Larger trades may have slippage
- Less trading pairs
- No fiat support

**Smart Contract Risk**
- Bugs can drain funds
- Exploits have occurred
- No customer support

## Choosing the Right Exchange

### Use a CEX When:
- You're a beginner
- Trading large amounts (need liquidity)
- Want fiat on/off ramps
- Need customer support

### Use a DEX When:
- Privacy is important
- Trading newer/smaller tokens
- Want full custody
- Avoiding KYC requirements

### Hybrid Approach

Many experienced traders use both:
- CEX for fiat conversion and major trades
- DEX for DeFi interactions and new tokens
- Hardware wallet for long-term storage

## Security Best Practices

### For CEX Users
1. Enable all security features (2FA, withdrawal whitelist)
2. Don't keep large amounts on exchange
3. Use unique, strong passwords
4. Verify exchange legitimacy before depositing

### For DEX Users
1. Verify contract addresses before trading
2. Start with small test transactions
3. Understand gas fees before confirming
4. Revoke token approvals after use

## Key Takeaways

1. CEXs offer convenience but require trust
2. DEXs offer control but require knowledge
3. Both have their place in a crypto strategy
4. Security practices are essential for both
5. Never keep more on exchanges than necessary""",
            "fr": """# Exchanges Centralisés vs Décentralisés

Les exchanges sont les places de marché du monde crypto. Comprendre les différents types est crucial pour tout investisseur.

## Exchanges Centralisés (CEX)

### Comment Ils Fonctionnent

Les exchanges centralisés fonctionnent comme les bourses traditionnelles :
- Une entreprise gère la plateforme
- Vous déposez vos fonds en leur garde
- Ils matchent les ordres d'achat et de vente
- Ils vérifient votre identité (KYC)

### Avantages des CEX

**Convivialité**
- Interfaces intuitives
- Support client disponible
- Rampes fiat (achat par carte bancaire)
- Applications mobiles

**Haute Liquidité**
- Carnets d'ordres importants
- Slippage minimal sur les trades
- Exécution rapide

### Inconvénients des CEX

**Risque de Garde**
- "Pas vos clés, pas vos coins"
- Les piratages d'exchanges ont coûté des milliards
- Peuvent geler votre compte
- Risque de faillite (effondrement FTX)

## Exchanges Décentralisés (DEX)

### Comment Ils Fonctionnent

Les DEX fonctionnent via des smart contracts :
- Pas d'entreprise centrale
- Vous gardez la custody de vos fonds
- Les trades s'exécutent via des AMMs
- Pas de KYC requis

### Comment Fonctionnent les AMMs

Au lieu de carnets d'ordres, les AMMs utilisent des pools de liquidité :

1. Les fournisseurs de liquidité déposent des paires de tokens
2. Les prix sont déterminés par une formule mathématique
3. Les traders échangent contre le pool
4. Les fournisseurs gagnent des frais sur les trades

### Avantages des DEX

**Auto-Garde**
- Vos clés, vos coins
- Les fonds ne quittent jamais votre portefeuille
- Pas de limites de retrait

**Confidentialité**
- Pas de KYC requis
- Trading pseudonyme

### Inconvénients des DEX

**Complexité**
- Courbe d'apprentissage plus raide
- Doit gérer son propre portefeuille
- Les frais de gas peuvent être élevés

## Choisir le Bon Exchange

### Utilisez un CEX Quand :
- Vous êtes débutant
- Vous tradez de gros montants
- Vous voulez des rampes fiat
- Vous avez besoin de support client

### Utilisez un DEX Quand :
- La confidentialité est importante
- Vous tradez des tokens plus petits/nouveaux
- Vous voulez la custody complète

## Points Clés à Retenir

1. Les CEX offrent la commodité mais requièrent la confiance
2. Les DEX offrent le contrôle mais requièrent les connaissances
3. Les deux ont leur place dans une stratégie crypto
4. Les pratiques de sécurité sont essentielles pour les deux
5. Ne gardez jamais plus que nécessaire sur les exchanges""",
            "ar": """# البورصات المركزية مقابل اللامركزية

البورصات هي أسواق عالم العملات المشفرة. فهم الأنواع المختلفة أمر حاسم لأي مستثمر.

## البورصات المركزية (CEX)

### كيف تعمل

تعمل البورصات المركزية مثل البورصات التقليدية:
- شركة تدير المنصة
- تودع أموالك في حفظهم
- يطابقون أوامر الشراء والبيع
- يتحققون من هويتك (KYC)

### مزايا CEX

**سهولة الاستخدام**
- واجهات بديهية
- دعم العملاء متاح
- طرق الدفع بالعملة الورقية

**سيولة عالية**
- دفاتر أوامر كبيرة
- انزلاق سعري ضئيل
- تنفيذ سريع

### عيوب CEX

**مخاطر الحفظ**
- "ليست مفاتيحك، ليست عملاتك"
- الاختراقات كلفت مليارات
- يمكنهم تجميد حسابك

## البورصات اللامركزية (DEX)

### كيف تعمل

تعمل DEX من خلال العقود الذكية:
- لا شركة مركزية
- تحتفظ بحفظ أموالك
- تنفذ الصفقات عبر AMMs
- لا حاجة لـ KYC

### مزايا DEX

**الحفظ الذاتي**
- مفاتيحك، عملاتك
- الأموال لا تغادر محفظتك أبدًا

**الخصوصية**
- لا حاجة لـ KYC
- تداول مستعار

### عيوب DEX

**التعقيد**
- منحنى تعلم أكثر حدة
- يجب إدارة محفظتك الخاصة
- رسوم الغاز قد تكون مرتفعة

## النقاط الرئيسية

1. CEX توفر الراحة لكن تتطلب الثقة
2. DEX توفر التحكم لكن تتطلب المعرفة
3. كلاهما له مكانه في استراتيجية العملات المشفرة
4. ممارسات الأمان ضرورية لكليهما
5. لا تحتفظ أبدًا بأكثر من اللازم في البورصات"""
        },
        "summary": {
            "en": "CEXs offer user-friendly trading with fiat support but require trusting a third party. DEXs provide full custody and privacy but demand more technical knowledge. Most traders benefit from using both.",
            "fr": "Les CEX offrent un trading convivial avec support fiat mais nécessitent de faire confiance à un tiers. Les DEX offrent custody complète et confidentialité mais demandent plus de connaissances techniques.",
            "ar": "CEX توفر تداولًا سهل الاستخدام مع دعم العملة الورقية لكن تتطلب الثقة بطرف ثالث. DEX توفر حفظًا كاملاً وخصوصية لكن تتطلب معرفة تقنية أكثر."
        },
        "checkpoints": [
            {
                "id": "checkpoint-6-1",
                "position": 1,
                "question": {
                    "en": "What is the main advantage of a DEX over a CEX?",
                    "fr": "Quel est l'avantage principal d'un DEX par rapport à un CEX ?",
                    "ar": "ما هي الميزة الرئيسية لـ DEX على CEX؟"
                },
                "options": {
                    "en": ["Lower fees", "Better customer support", "Self-custody of funds", "More trading pairs"],
                    "fr": ["Frais plus bas", "Meilleur support client", "Auto-garde des fonds", "Plus de paires de trading"],
                    "ar": ["رسوم أقل", "دعم عملاء أفضل", "الحفظ الذاتي للأموال", "أزواج تداول أكثر"]
                },
                "correct_answer": 2,
                "explanation": {
                    "en": "DEXs let you maintain custody of your funds - your coins never leave your wallet during trades.",
                    "fr": "Les DEX vous permettent de garder la custody de vos fonds - vos coins ne quittent jamais votre portefeuille pendant les trades.",
                    "ar": "DEX تتيح لك الحفاظ على حفظ أموالك - عملاتك لا تغادر محفظتك أبدًا أثناء الصفقات."
                }
            }
        ]
    },

    "course-foundations-lesson-7": {
        "id": "course-foundations-lesson-7",
        "course_id": "course-foundations",
        "order": 6,
        "duration_minutes": 40,
        "difficulty": "beginner",
        "title": {
            "en": "Understanding Stablecoins",
            "fr": "Comprendre les Stablecoins",
            "ar": "فهم العملات المستقرة"
        },
        "subtitle": {
            "en": "The bridge between crypto and traditional finance",
            "fr": "Le pont entre crypto et finance traditionnelle",
            "ar": "الجسر بين العملات المشفرة والتمويل التقليدي"
        },
        "learning_objectives": {
            "en": [
                "Understand what stablecoins are and why they exist",
                "Learn the different types of stablecoins",
                "Evaluate the risks of each stablecoin type",
                "Know when and how to use stablecoins"
            ],
            "fr": [
                "Comprendre ce que sont les stablecoins et pourquoi ils existent",
                "Apprendre les différents types de stablecoins",
                "Évaluer les risques de chaque type de stablecoin",
                "Savoir quand et comment utiliser les stablecoins"
            ],
            "ar": [
                "فهم ما هي العملات المستقرة ولماذا توجد",
                "تعلم أنواع العملات المستقرة المختلفة",
                "تقييم مخاطر كل نوع من العملات المستقرة",
                "معرفة متى وكيف تستخدم العملات المستقرة"
            ]
        },
        "content": {
            "en": """# Understanding Stablecoins

Stablecoins are cryptocurrencies designed to maintain a stable value, usually pegged to a fiat currency like the US dollar.

## Why Stablecoins Exist

### The Volatility Problem

Bitcoin and other cryptocurrencies are highly volatile:
- BTC can move 10%+ in a single day
- Makes everyday transactions impractical
- Hard to price goods and services
- Stressful for risk-averse users

### The Solution

Stablecoins provide:
- Price stability (usually $1.00)
- Fast, global transactions
- 24/7 availability
- Programmability of crypto

## Types of Stablecoins

### 1. Fiat-Collateralized

**How it works**: Each stablecoin is backed 1:1 by dollars in a bank account.

**Examples**:
- **USDT (Tether)**: Largest stablecoin, $80B+ market cap
- **USDC (Circle)**: US-regulated, transparent reserves
- **BUSD (Binance/Paxos)**: Exchange-backed

**Pros**:
- Simple to understand
- Stable peg
- Easy to redeem

**Cons**:
- Centralized (can freeze funds)
- Must trust the issuer
- Regulatory risk

### 2. Crypto-Collateralized

**How it works**: Backed by other cryptocurrencies, over-collateralized to absorb volatility.

**Examples**:
- **DAI (MakerDAO)**: Backed by ETH and other crypto
- **LUSD (Liquity)**: ETH-only backing, no governance

**How DAI Works**:
1. Deposit $150 of ETH as collateral
2. Borrow up to $100 of DAI
3. If ETH price drops, add more collateral or get liquidated
4. Pay back DAI + fee to retrieve ETH

**Pros**:
- Decentralized
- Transparent on-chain
- No trusted third party

**Cons**:
- Capital inefficient (over-collateralized)
- Can lose peg in extreme volatility
- Complex mechanisms

### 3. Algorithmic Stablecoins

**How it works**: Use algorithms and incentives to maintain the peg, often without collateral.

**Warning**: Many have failed spectacularly.

**The UST/LUNA Collapse (2022)**:
- UST was an algorithmic stablecoin on Terra
- Lost its peg and crashed to near zero
- $40 billion in value destroyed
- Highlighted risks of "algo stables"

**Surviving Examples**:
- FRAX (partial collateral + algorithmic)
- Some new designs with better mechanisms

**Pros**:
- Capital efficient
- Potentially more scalable

**Cons**:
- High failure rate
- Death spiral risk
- Complex to understand

## Stablecoin Comparison

| Stablecoin | Type | Market Cap | Risk Level |
|------------|------|------------|------------|
| USDT | Fiat-backed | $83B | Medium |
| USDC | Fiat-backed | $25B | Low |
| DAI | Crypto-backed | $5B | Medium |
| FRAX | Hybrid | $1B | Medium-High |

## Use Cases for Stablecoins

### Trading
- Park profits during volatility
- Quote currency for trading pairs
- Move between exchanges quickly

### DeFi
- Provide liquidity to earn yield
- Collateral for borrowing
- Payments in smart contracts

### Remittances
- Send money globally
- Avoid forex fees
- Faster than wire transfers

### Savings
- Earn yield on stablecoin deposits
- Hedge against local currency inflation
- Access USD from anywhere

## Risks to Consider

### Depegging
All stablecoins can lose their peg:
- USDT briefly dropped to $0.95 in 2022
- DAI has traded at $0.97-$1.03
- UST collapsed entirely

### Regulatory Risk
- Governments may restrict or ban
- Issuers can freeze addresses
- Future regulations uncertain

### Smart Contract Risk
- Bugs can drain funds
- Upgradeable contracts add risk
- DeFi hacks have affected stables

## Key Takeaways

1. Stablecoins bridge volatile crypto and stable fiat
2. Fiat-backed are simplest but centralized
3. Crypto-backed are decentralized but complex
4. Algorithmic stables carry high risk
5. Diversify across multiple stablecoins""",
            "fr": """# Comprendre les Stablecoins

Les stablecoins sont des cryptomonnaies conçues pour maintenir une valeur stable, généralement indexée sur une monnaie fiduciaire comme le dollar américain.

## Pourquoi les Stablecoins Existent

### Le Problème de la Volatilité

Bitcoin et autres cryptomonnaies sont très volatiles :
- BTC peut bouger de 10%+ en une seule journée
- Rend les transactions quotidiennes impraticables
- Difficile de fixer les prix des biens et services

### La Solution

Les stablecoins offrent :
- Stabilité des prix (généralement 1,00$)
- Transactions rapides et mondiales
- Disponibilité 24h/24
- Programmabilité de la crypto

## Types de Stablecoins

### 1. Collatéralisés par Fiat

**Comment ça marche** : Chaque stablecoin est soutenu 1:1 par des dollars sur un compte bancaire.

**Exemples** :
- **USDT (Tether)** : Plus grand stablecoin, 80B$+ de capitalisation
- **USDC (Circle)** : Régulé aux US, réserves transparentes
- **BUSD (Binance/Paxos)** : Soutenu par un exchange

**Avantages** : Simple à comprendre, peg stable, facile à racheter
**Inconvénients** : Centralisé, doit faire confiance à l'émetteur

### 2. Collatéralisés par Crypto

**Comment ça marche** : Soutenu par d'autres cryptomonnaies, sur-collatéralisé pour absorber la volatilité.

**Exemples** :
- **DAI (MakerDAO)** : Soutenu par ETH et autres cryptos
- **LUSD (Liquity)** : Backing ETH uniquement

**Avantages** : Décentralisé, transparent on-chain
**Inconvénients** : Inefficace en capital, peut perdre le peg

### 3. Stablecoins Algorithmiques

**Comment ça marche** : Utilisent des algorithmes et incitations pour maintenir le peg, souvent sans collatéral.

**Avertissement** : Beaucoup ont échoué spectaculairement.

**L'Effondrement UST/LUNA (2022)** :
- UST était un stablecoin algorithmique sur Terra
- A perdu son peg et s'est effondré à presque zéro
- 40 milliards de dollars de valeur détruits

## Cas d'Usage des Stablecoins

### Trading
- Mettre les profits à l'abri pendant la volatilité
- Monnaie de cotation pour les paires de trading
- Se déplacer entre exchanges rapidement

### DeFi
- Fournir de la liquidité pour gagner du rendement
- Collatéral pour emprunter
- Paiements dans les smart contracts

### Transferts
- Envoyer de l'argent mondialement
- Éviter les frais de change
- Plus rapide que les virements bancaires

## Points Clés à Retenir

1. Les stablecoins font le pont entre crypto volatile et fiat stable
2. Les fiat-backed sont les plus simples mais centralisés
3. Les crypto-backed sont décentralisés mais complexes
4. Les algorithmiques comportent un risque élevé
5. Diversifiez entre plusieurs stablecoins""",
            "ar": """# فهم العملات المستقرة

العملات المستقرة هي عملات مشفرة مصممة للحفاظ على قيمة ثابتة، عادة مرتبطة بعملة ورقية مثل الدولار الأمريكي.

## لماذا توجد العملات المستقرة

### مشكلة التقلب

البيتكوين والعملات المشفرة الأخرى متقلبة للغاية:
- BTC يمكن أن يتحرك 10%+ في يوم واحد
- يجعل المعاملات اليومية غير عملية

### الحل

توفر العملات المستقرة:
- استقرار الأسعار (عادة 1.00$)
- معاملات سريعة وعالمية
- توفر على مدار الساعة

## أنواع العملات المستقرة

### 1. المدعومة بالعملة الورقية

كل عملة مستقرة مدعومة 1:1 بدولارات في حساب بنكي.

**أمثلة**: USDT، USDC، BUSD

### 2. المدعومة بالعملات المشفرة

مدعومة بعملات مشفرة أخرى، مفرطة الضمان لامتصاص التقلب.

**أمثلة**: DAI، LUSD

### 3. العملات المستقرة الخوارزمية

تستخدم خوارزميات وحوافز للحفاظ على الربط.

**تحذير**: الكثير منها فشل بشكل مذهل.

## حالات الاستخدام

- التداول
- DeFi
- التحويلات المالية
- الادخار

## النقاط الرئيسية

1. العملات المستقرة تربط بين العملات المشفرة المتقلبة والعملات الورقية المستقرة
2. المدعومة بالعملة الورقية هي الأبسط لكنها مركزية
3. المدعومة بالعملات المشفرة لامركزية لكنها معقدة
4. الخوارزمية تحمل مخاطر عالية
5. نوّع بين عدة عملات مستقرة"""
        },
        "summary": {
            "en": "Stablecoins maintain a stable value, usually $1, through various mechanisms. Fiat-backed are simplest, crypto-backed are decentralized, and algorithmic carry the most risk.",
            "fr": "Les stablecoins maintiennent une valeur stable, généralement 1$, via divers mécanismes. Les fiat-backed sont les plus simples, les crypto-backed sont décentralisés, et les algorithmiques comportent le plus de risques.",
            "ar": "العملات المستقرة تحافظ على قيمة ثابتة، عادة 1$، من خلال آليات مختلفة. المدعومة بالعملة الورقية هي الأبسط، المدعومة بالعملات المشفرة لامركزية، والخوارزمية تحمل أكبر المخاطر."
        },
        "checkpoints": [
            {
                "id": "checkpoint-7-1",
                "position": 1,
                "question": {
                    "en": "What caused the UST stablecoin to collapse?",
                    "fr": "Qu'est-ce qui a causé l'effondrement du stablecoin UST ?",
                    "ar": "ما الذي تسبب في انهيار العملة المستقرة UST؟"
                },
                "options": {
                    "en": ["Bank run on reserves", "Algorithmic mechanism failure", "Hack of smart contracts", "Government seizure"],
                    "fr": ["Ruée bancaire sur les réserves", "Échec du mécanisme algorithmique", "Piratage des smart contracts", "Saisie gouvernementale"],
                    "ar": ["هروب من الاحتياطيات", "فشل الآلية الخوارزمية", "اختراق العقود الذكية", "مصادرة حكومية"]
                },
                "correct_answer": 1,
                "explanation": {
                    "en": "UST was an algorithmic stablecoin that relied on arbitrage incentives to maintain its peg. When confidence was lost, the mechanism failed catastrophically.",
                    "fr": "UST était un stablecoin algorithmique qui s'appuyait sur des incitations d'arbitrage pour maintenir son peg. Quand la confiance a été perdue, le mécanisme a échoué de manière catastrophique.",
                    "ar": "كانت UST عملة مستقرة خوارزمية تعتمد على حوافز المراجحة للحفاظ على ربطها. عندما فُقدت الثقة، فشلت الآلية بشكل كارثي."
                }
            }
        ]
    },

    "course-foundations-lesson-8": {
        "id": "course-foundations-lesson-8",
        "course_id": "course-foundations",
        "order": 7,
        "duration_minutes": 45,
        "difficulty": "beginner",
        "title": {
            "en": "Buying Crypto Safely",
            "fr": "Acheter des Cryptos en Sécurité",
            "ar": "شراء العملات المشفرة بأمان"
        },
        "subtitle": {
            "en": "Your first crypto purchase step by step",
            "fr": "Votre premier achat crypto étape par étape",
            "ar": "أول عملية شراء للعملات المشفرة خطوة بخطوة"
        },
        "learning_objectives": {
            "en": [
                "Choose a reputable exchange for your region",
                "Complete KYC verification successfully",
                "Make your first cryptocurrency purchase",
                "Transfer crypto to your own wallet"
            ],
            "fr": [
                "Choisir un exchange réputé pour votre région",
                "Compléter la vérification KYC avec succès",
                "Faire votre premier achat de cryptomonnaie",
                "Transférer des cryptos vers votre propre portefeuille"
            ],
            "ar": [
                "اختيار بورصة موثوقة لمنطقتك",
                "إكمال التحقق من الهوية بنجاح",
                "إجراء أول عملية شراء للعملات المشفرة",
                "نقل العملات المشفرة إلى محفظتك الخاصة"
            ]
        },
        "content": {
            "en": """# Buying Cryptocurrency Safely

Ready to make your first crypto purchase? This guide walks you through the process step by step.

## Step 1: Choose an Exchange

### For Beginners

| Exchange | Best For | Supported Countries |
|----------|----------|---------------------|
| Coinbase | US, UK, EU beginners | 100+ countries |
| Kraken | Security-conscious | US, EU, UK, CA |
| Binance | Low fees, variety | Global (not US) |
| Gemini | US regulated | US, UK, EU |

### What to Consider

**Regulation & Reputation**
- Is it licensed in your country?
- How long has it operated?
- Any security incidents?

**Fees**
- Deposit fees (often free for bank transfer)
- Trading fees (0.1% - 1.5% typical)
- Withdrawal fees (varies by crypto)

**Payment Methods**
- Bank transfer (cheapest)
- Debit/credit card (instant but ~3% fee)
- Apple/Google Pay
- Wire transfer (for large amounts)

## Step 2: Create Your Account

### Registration Process

1. Go to the official website (verify URL carefully!)
2. Enter email and create strong password
3. Verify email address
4. Set up two-factor authentication (2FA)

### Security Checklist

- [ ] Use unique email for crypto accounts
- [ ] Enable authenticator app 2FA (not SMS)
- [ ] Use a password manager
- [ ] Write down recovery codes

## Step 3: Complete KYC Verification

### What is KYC?

**K**now **Y**our **C**ustomer - identity verification required by law for financial services.

### Required Documents

**Level 1 (Basic)**
- Full name
- Date of birth
- Address
- Phone number

**Level 2 (Full)**
- Government ID (passport, driver's license)
- Selfie with ID
- Proof of address (utility bill, bank statement)

### Tips for Fast Approval

1. Use good lighting for photos
2. Ensure all text is clearly visible
3. Match name exactly as on ID
4. Use recent proof of address (< 3 months)

### Verification Times

- Automated: Minutes to hours
- Manual review: 1-3 business days
- Peak times: May take longer

## Step 4: Deposit Funds

### Bank Transfer (Recommended)

**Pros**: Lowest fees, higher limits
**Cons**: Takes 1-3 days

**Process**:
1. Go to "Deposit" section
2. Select bank transfer
3. Note the exchange's bank details
4. Transfer from your bank account
5. Include reference number if provided

### Card Payment (Instant)

**Pros**: Immediate
**Cons**: 2-4% fee, lower limits

**Process**:
1. Go to "Deposit" or "Buy Crypto"
2. Select card payment
3. Enter card details
4. Complete 3D Secure verification

## Step 5: Make Your First Purchase

### Market Order vs Limit Order

**Market Order**
- Buys immediately at current price
- Simple for beginners
- May pay slightly more in volatile markets

**Limit Order**
- Sets your desired price
- Only executes if price reached
- Better for larger purchases

### Example: Buying Bitcoin

1. Navigate to BTC/USD (or your currency)
2. Click "Buy"
3. Enter amount (in USD or BTC)
4. Review fees and total
5. Confirm purchase

### Start Small

- Begin with an amount you can afford to lose
- $50-$100 is fine for learning
- You can always buy more later

## Step 6: Withdraw to Your Wallet

### Why Withdraw?

Remember: "Not your keys, not your coins"

Exchange custody is convenient but risky. For any significant amount, transfer to your own wallet.

### Withdrawal Process

1. Get your wallet address (from your hardware/software wallet)
2. On exchange, go to "Withdraw"
3. Select the cryptocurrency
4. Paste your wallet address (triple-check!)
5. Enter amount
6. Confirm via email/2FA
7. Wait for blockchain confirmation

### Critical: Verify Address

**ALWAYS send a test transaction first!**

1. Withdraw small amount ($5-10)
2. Verify it arrives in your wallet
3. Then send the rest

Wrong address = lost funds. There's no customer support for blockchain.

## Common Mistakes to Avoid

### 1. Sharing Account Details
- Never give anyone your password or 2FA codes
- "Support" will never ask for this

### 2. Using Wrong Network
- Sending ETH on BNB Chain won't arrive
- Always match the network

### 3. FOMO Buying
- Don't buy because price is pumping
- Have a plan, stick to it

### 4. Keeping Large Amounts on Exchange
- Only keep what you're actively trading
- Withdraw the rest to cold storage

## Key Takeaways

1. Choose a regulated, reputable exchange
2. Complete KYC before you need to trade urgently
3. Start with bank transfer for lowest fees
4. Make a small test purchase first
5. Withdraw to your own wallet for security""",
            "fr": """# Acheter des Cryptomonnaies en Sécurité

Prêt pour votre premier achat crypto ? Ce guide vous accompagne étape par étape.

## Étape 1 : Choisir un Exchange

### Pour les Débutants

| Exchange | Idéal Pour | Pays Supportés |
|----------|------------|----------------|
| Coinbase | Débutants US, UK, EU | 100+ pays |
| Kraken | Sécurité | US, EU, UK, CA |
| Binance | Frais bas, variété | Global |
| Gemini | Régulé US | US, UK, EU |

### Ce qu'il Faut Considérer

**Régulation & Réputation**
- Est-il licencié dans votre pays ?
- Depuis combien de temps opère-t-il ?
- Y a-t-il eu des incidents de sécurité ?

**Frais**
- Frais de dépôt
- Frais de trading (0,1% - 1,5% typique)
- Frais de retrait

## Étape 2 : Créer Votre Compte

1. Allez sur le site officiel (vérifiez l'URL attentivement !)
2. Entrez email et créez un mot de passe fort
3. Vérifiez l'adresse email
4. Configurez la 2FA

## Étape 3 : Compléter la Vérification KYC

### Qu'est-ce que le KYC ?

**K**now **Y**our **C**ustomer - vérification d'identité requise par la loi.

### Documents Requis

- Pièce d'identité gouvernementale
- Selfie avec la pièce d'identité
- Justificatif de domicile

## Étape 4 : Déposer des Fonds

### Virement Bancaire (Recommandé)

**Avantages** : Frais les plus bas, limites plus élevées
**Inconvénients** : Prend 1-3 jours

### Paiement par Carte (Instantané)

**Avantages** : Immédiat
**Inconvénients** : Frais de 2-4%

## Étape 5 : Faire Votre Premier Achat

### Ordre au Marché vs Ordre Limite

**Ordre au Marché** : Achète immédiatement au prix actuel
**Ordre Limite** : Définit votre prix souhaité

### Commencez Petit

- Commencez avec un montant que vous pouvez vous permettre de perdre
- 50-100€ suffit pour apprendre

## Étape 6 : Retirer vers Votre Portefeuille

### Pourquoi Retirer ?

Rappelez-vous : "Pas vos clés, pas vos coins"

### Processus de Retrait

1. Obtenez votre adresse de portefeuille
2. Sur l'exchange, allez dans "Retrait"
3. Sélectionnez la cryptomonnaie
4. Collez votre adresse (vérifiez trois fois !)
5. Confirmez via email/2FA

### CRITIQUE : Vérifiez l'Adresse

**Envoyez TOUJOURS une transaction test d'abord !**

## Erreurs Courantes à Éviter

1. Partager les détails de son compte
2. Utiliser le mauvais réseau
3. Acheter par FOMO
4. Garder de gros montants sur l'exchange

## Points Clés à Retenir

1. Choisissez un exchange régulé et réputé
2. Complétez le KYC avant d'avoir besoin de trader en urgence
3. Commencez par virement bancaire pour les frais les plus bas
4. Faites un petit achat test d'abord
5. Retirez vers votre propre portefeuille pour la sécurité""",
            "ar": """# شراء العملات المشفرة بأمان

هل أنت مستعد لأول عملية شراء للعملات المشفرة؟ هذا الدليل يرشدك خطوة بخطوة.

## الخطوة 1: اختيار بورصة

اختر بورصة موثوقة ومرخصة في بلدك.

## الخطوة 2: إنشاء حسابك

1. اذهب إلى الموقع الرسمي
2. أدخل البريد الإلكتروني وكلمة مرور قوية
3. تحقق من البريد الإلكتروني
4. قم بإعداد المصادقة الثنائية

## الخطوة 3: إكمال التحقق من الهوية

### الوثائق المطلوبة

- هوية حكومية
- صورة ذاتية مع الهوية
- إثبات العنوان

## الخطوة 4: إيداع الأموال

### التحويل البنكي (موصى به)

رسوم أقل، حدود أعلى

### الدفع بالبطاقة (فوري)

فوري لكن رسوم 2-4%

## الخطوة 5: إجراء أول عملية شراء

ابدأ بمبلغ صغير يمكنك تحمل خسارته.

## الخطوة 6: السحب إلى محفظتك

تذكر: "ليست مفاتيحك، ليست عملاتك"

**أرسل دائمًا معاملة اختبارية أولاً!**

## النقاط الرئيسية

1. اختر بورصة منظمة وموثوقة
2. أكمل KYC قبل الحاجة للتداول بشكل عاجل
3. ابدأ بالتحويل البنكي لأقل الرسوم
4. قم بعملية شراء اختبارية صغيرة أولاً
5. اسحب إلى محفظتك الخاصة للأمان"""
        },
        "summary": {
            "en": "Buying crypto safely involves choosing a reputable exchange, completing KYC, starting small, and withdrawing to your own wallet. Always verify addresses and send test transactions first.",
            "fr": "Acheter des cryptos en sécurité implique de choisir un exchange réputé, compléter le KYC, commencer petit, et retirer vers son propre portefeuille. Vérifiez toujours les adresses et envoyez des transactions test d'abord.",
            "ar": "شراء العملات المشفرة بأمان يتضمن اختيار بورصة موثوقة، إكمال KYC، البدء بمبلغ صغير، والسحب إلى محفظتك الخاصة. تحقق دائمًا من العناوين وأرسل معاملات اختبارية أولاً."
        },
        "checkpoints": [
            {
                "id": "checkpoint-8-1",
                "position": 1,
                "question": {
                    "en": "What should you ALWAYS do before withdrawing a large amount to a new wallet?",
                    "fr": "Que devez-vous TOUJOURS faire avant de retirer un gros montant vers un nouveau portefeuille ?",
                    "ar": "ما الذي يجب عليك فعله دائمًا قبل سحب مبلغ كبير إلى محفظة جديدة؟"
                },
                "options": {
                    "en": ["Wait 24 hours", "Send a test transaction", "Contact support", "Share the address on social media"],
                    "fr": ["Attendre 24 heures", "Envoyer une transaction test", "Contacter le support", "Partager l'adresse sur les réseaux sociaux"],
                    "ar": ["الانتظار 24 ساعة", "إرسال معاملة اختبارية", "الاتصال بالدعم", "مشاركة العنوان على وسائل التواصل"]
                },
                "correct_answer": 1,
                "explanation": {
                    "en": "Always send a small test transaction first to verify the address is correct. Crypto sent to wrong addresses is lost forever.",
                    "fr": "Envoyez toujours une petite transaction test d'abord pour vérifier que l'adresse est correcte. Les cryptos envoyées à de mauvaises adresses sont perdues pour toujours.",
                    "ar": "أرسل دائمًا معاملة اختبارية صغيرة أولاً للتحقق من صحة العنوان. العملات المشفرة المرسلة إلى عناوين خاطئة تُفقد للأبد."
                }
            }
        ]
    }
}
