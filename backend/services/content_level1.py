# Premium Lesson Content - Level 1: Crypto Foundations
# Complete educational content in EN, FR, AR

LEVEL1_LESSONS = {
    "course-foundations-lesson-3": {
        "id": "course-foundations-lesson-3",
        "course_id": "course-foundations",
        "order": 2,
        "duration_minutes": 55,
        "difficulty": "beginner",
        "is_trial": True,
        "title": {
            "en": "How Cryptocurrency Works",
            "fr": "Comment Fonctionnent les Cryptomonnaies",
            "ar": "كيف تعمل العملات المشفرة",
            "pt": "Como Funciona a Criptomoeda"
        },
        "subtitle": {
            "en": "The mechanics of digital money",
            "fr": "La mécanique de l'argent numérique",
            "ar": "آليات المال الرقمي",
            "pt": "A mecânica do dinheiro digital"
        },
        "learning_objectives": {
            "en": [
                "Understand public-key cryptography and digital signatures",
                "Learn how transactions are verified on the network",
                "Grasp the concept of mining and consensus",
                "Know what transaction confirmations mean"
            ],
            "fr": [
                "Comprendre la cryptographie à clé publique et les signatures numériques",
                "Apprendre comment les transactions sont vérifiées sur le réseau",
                "Saisir le concept de minage et de consensus",
                "Savoir ce que signifient les confirmations de transaction"
            ],
            "ar": [
                "فهم التشفير بالمفتاح العام والتوقيعات الرقمية",
                "تعلم كيف يتم التحقق من المعاملات على الشبكة",
                "استيعاب مفهوم التعدين والإجماع",
                "معرفة ما تعنيه تأكيدات المعاملات"
            ],
            "pt": [
                "Entender a criptografia de chave pública e as assinaturas digitais",
                "Aprender como as transações são verificadas na rede",
                "Compreender o conceito de mineração e consenso",
                "Saber o que significam as confirmações de transação"
            ]
        },
        "content": {
            "en": """# The Mechanics of Cryptocurrency

Understanding how cryptocurrency actually works under the hood is essential for any serious investor or user. Let's demystify the technology.

## Public-Key Cryptography

At the heart of cryptocurrency security lies **asymmetric cryptography**, also known as public-key cryptography.

### Your Two Keys

Every cryptocurrency user has a pair of cryptographic keys:

**Public Key (Your Address)**
- Like your email address - safe to share
- Others use it to send you cryptocurrency
- Derived from your private key mathematically
- Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f...`

**Private Key (Your Password)**
- NEVER share this with anyone
- Used to sign transactions (prove ownership)
- If lost, your funds are gone forever
- If stolen, your funds can be taken
- Example: `5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd...`

### Digital Signatures

When you send cryptocurrency:
1. You create a transaction message
2. Your wallet signs it with your private key
3. Anyone can verify the signature using your public key
4. This proves you authorized the transaction

## Transaction Flow

### Step 1: Creating a Transaction

You specify:
- Recipient's address
- Amount to send
- Transaction fee (for miners)

### Step 2: Broadcasting

Your transaction is broadcast to the network. Thousands of nodes receive it within seconds.

### Step 3: Mempool

Unconfirmed transactions wait in the **mempool** (memory pool). Miners select transactions from here.

### Step 4: Verification

Nodes verify:
- Valid digital signature
- Sufficient balance (no double-spending)
- Proper transaction format

### Step 5: Block Inclusion

Miners/validators include your transaction in a new block.

### Step 6: Confirmation

Once the block is added to the chain, your transaction has 1 confirmation. Each subsequent block adds another confirmation.

## Mining and Consensus

### Proof of Work (Bitcoin)

Miners compete to solve a cryptographic puzzle:
- Find a number (nonce) that makes the block hash start with many zeros
- First to solve it broadcasts the block
- Other nodes verify the solution (easy to check)
- Winner receives block reward + transaction fees

**Energy Cost**: ~150 TWh/year (more than some countries)
**Security**: Extremely high - would cost billions to attack

### Proof of Stake (Ethereum)

Validators stake ETH as collateral:
- Randomly selected to propose blocks
- Other validators attest to validity
- Honest behavior rewarded, dishonest punished (slashing)
- Minimum 32 ETH to run a validator

**Energy Cost**: ~99.95% less than Proof of Work
**Security**: Economic security through staked capital

## Confirmations Explained

| Confirmations | Bitcoin Time | Security Level |
|---------------|--------------|----------------|
| 0 (unconfirmed) | - | Very Low |
| 1 | ~10 minutes | Low |
| 3 | ~30 minutes | Medium |
| 6 | ~1 hour | High (recommended) |
| 60+ | ~10 hours | Irreversible |

### Why Wait for Confirmations?

Each confirmation makes it exponentially harder to reverse a transaction. With 6 confirmations, reversing would require controlling >50% of network hashpower and spending billions.

## Transaction Fees

### How Fees Work

- You bid for block space
- Higher fee = faster confirmation
- Miners prioritize high-fee transactions
- Fees vary based on network congestion

### Fee Estimation

Most wallets automatically estimate appropriate fees based on:
- Current network congestion
- Desired confirmation speed
- Transaction size (in bytes)

## Key Takeaways

1. Public-key cryptography secures ownership
2. Digital signatures prove transaction authorization
3. Consensus mechanisms prevent double-spending
4. More confirmations = more security
5. Transaction fees incentivize miners/validators""",
            "fr": """# La Mécanique des Cryptomonnaies

Comprendre comment fonctionnent réellement les cryptomonnaies est essentiel pour tout investisseur ou utilisateur sérieux. Démystifions la technologie.

## Cryptographie à Clé Publique

Au cœur de la sécurité des cryptomonnaies se trouve la **cryptographie asymétrique**, aussi connue comme cryptographie à clé publique.

### Vos Deux Clés

Chaque utilisateur de cryptomonnaie possède une paire de clés cryptographiques :

**Clé Publique (Votre Adresse)**
- Comme votre adresse email - peut être partagée
- Les autres l'utilisent pour vous envoyer des cryptomonnaies
- Dérivée mathématiquement de votre clé privée
- Exemple : `0x742d35Cc6634C0532925a3b844Bc9e7595f...`

**Clé Privée (Votre Mot de Passe)**
- NE JAMAIS la partager avec quiconque
- Utilisée pour signer les transactions (prouver la propriété)
- Si perdue, vos fonds sont perdus pour toujours
- Si volée, vos fonds peuvent être pris
- Exemple : `5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd...`

### Signatures Numériques

Quand vous envoyez des cryptomonnaies :
1. Vous créez un message de transaction
2. Votre portefeuille le signe avec votre clé privée
3. N'importe qui peut vérifier la signature avec votre clé publique
4. Cela prouve que vous avez autorisé la transaction

## Flux de Transaction

### Étape 1 : Création d'une Transaction

Vous spécifiez :
- L'adresse du destinataire
- Le montant à envoyer
- Les frais de transaction (pour les mineurs)

### Étape 2 : Diffusion

Votre transaction est diffusée sur le réseau. Des milliers de nœuds la reçoivent en quelques secondes.

### Étape 3 : Mempool

Les transactions non confirmées attendent dans le **mempool** (pool de mémoire). Les mineurs sélectionnent les transactions ici.

### Étape 4 : Vérification

Les nœuds vérifient :
- La signature numérique valide
- Le solde suffisant (pas de double dépense)
- Le format de transaction correct

### Étape 5 : Inclusion dans un Bloc

Les mineurs/validateurs incluent votre transaction dans un nouveau bloc.

### Étape 6 : Confirmation

Une fois le bloc ajouté à la chaîne, votre transaction a 1 confirmation. Chaque bloc suivant ajoute une confirmation supplémentaire.

## Minage et Consensus

### Preuve de Travail (Bitcoin)

Les mineurs rivalisent pour résoudre un puzzle cryptographique :
- Trouver un nombre (nonce) qui fait commencer le hash du bloc par plusieurs zéros
- Le premier à résoudre diffuse le bloc
- Les autres nœuds vérifient la solution (facile à vérifier)
- Le gagnant reçoit la récompense de bloc + les frais de transaction

**Coût Énergétique** : ~150 TWh/an (plus que certains pays)
**Sécurité** : Extrêmement élevée - coûterait des milliards pour attaquer

### Preuve d'Enjeu (Ethereum)

Les validateurs mettent en jeu des ETH comme garantie :
- Sélectionnés aléatoirement pour proposer des blocs
- D'autres validateurs attestent de la validité
- Comportement honnête récompensé, malhonnête puni (slashing)
- Minimum 32 ETH pour faire tourner un validateur

**Coût Énergétique** : ~99,95% de moins que la Preuve de Travail
**Sécurité** : Sécurité économique par le capital mis en jeu

## Confirmations Expliquées

| Confirmations | Temps Bitcoin | Niveau de Sécurité |
|---------------|---------------|-------------------|
| 0 (non confirmé) | - | Très Bas |
| 1 | ~10 minutes | Bas |
| 3 | ~30 minutes | Moyen |
| 6 | ~1 heure | Élevé (recommandé) |
| 60+ | ~10 heures | Irréversible |

## Points Clés à Retenir

1. La cryptographie à clé publique sécurise la propriété
2. Les signatures numériques prouvent l'autorisation des transactions
3. Les mécanismes de consensus empêchent la double dépense
4. Plus de confirmations = plus de sécurité
5. Les frais de transaction incitent les mineurs/validateurs""",
            "ar": """# آليات العملات المشفرة

فهم كيفية عمل العملات المشفرة فعليًا أمر ضروري لأي مستثمر أو مستخدم جاد. دعونا نزيل الغموض عن التكنولوجيا.

## التشفير بالمفتاح العام

في قلب أمان العملات المشفرة يكمن **التشفير غير المتماثل**، المعروف أيضًا بتشفير المفتاح العام.

### مفتاحاك

كل مستخدم للعملات المشفرة لديه زوج من المفاتيح التشفيرية:

**المفتاح العام (عنوانك)**
- مثل عنوان بريدك الإلكتروني - آمن للمشاركة
- يستخدمه الآخرون لإرسال العملات المشفرة إليك
- مشتق رياضيًا من مفتاحك الخاص

**المفتاح الخاص (كلمة مرورك)**
- لا تشاركه أبدًا مع أي شخص
- يستخدم لتوقيع المعاملات (إثبات الملكية)
- إذا فُقد، ضاعت أموالك للأبد
- إذا سُرق، يمكن أخذ أموالك

### التوقيعات الرقمية

عندما ترسل عملات مشفرة:
1. تنشئ رسالة معاملة
2. محفظتك توقعها بمفتاحك الخاص
3. يمكن لأي شخص التحقق من التوقيع باستخدام مفتاحك العام
4. هذا يثبت أنك أذنت بالمعاملة

## تدفق المعاملة

### الخطوة 1: إنشاء معاملة

تحدد:
- عنوان المستلم
- المبلغ المراد إرساله
- رسوم المعاملة (للمعدنين)

### الخطوة 2: البث

تُبث معاملتك إلى الشبكة. تستقبلها آلاف العقد في غضون ثوان.

### الخطوة 3: مجمع الذاكرة

تنتظر المعاملات غير المؤكدة في **مجمع الذاكرة**. يختار المعدنون المعاملات من هنا.

### الخطوة 4: التحقق

تتحقق العقد من:
- صحة التوقيع الرقمي
- كفاية الرصيد (عدم الإنفاق المزدوج)
- تنسيق المعاملة الصحيح

### الخطوة 5: التضمين في كتلة

يضمّن المعدنون/المدققون معاملتك في كتلة جديدة.

### الخطوة 6: التأكيد

بمجرد إضافة الكتلة إلى السلسلة، تحصل معاملتك على تأكيد واحد.

## التعدين والإجماع

### إثبات العمل (بيتكوين)

يتنافس المعدنون لحل لغز تشفيري:
- إيجاد رقم يجعل هاش الكتلة يبدأ بعدة أصفار
- أول من يحل ينشر الكتلة
- العقد الأخرى تتحقق من الحل
- الفائز يحصل على مكافأة الكتلة + رسوم المعاملات

### إثبات الحصة (إيثريوم)

يراهن المدققون بـ ETH كضمان:
- يتم اختيارهم عشوائيًا لاقتراح الكتل
- مدققون آخرون يشهدون على الصحة
- السلوك الصادق يُكافأ، غير الصادق يُعاقب

## النقاط الرئيسية

1. التشفير بالمفتاح العام يؤمن الملكية
2. التوقيعات الرقمية تثبت إذن المعاملات
3. آليات الإجماع تمنع الإنفاق المزدوج
4. المزيد من التأكيدات = المزيد من الأمان
5. رسوم المعاملات تحفز المعدنين/المدققين""",
            "pt": """# A Mecânica das Criptomoedas

Entender como as criptomoedas realmente funcionam é essencial para qualquer investidor ou usuário sério. Vamos desmistificar a tecnologia.

## Criptografia de Chave Pública

No coração da segurança das criptomoedas está a **criptografia assimétrica**, também conhecida como criptografia de chave pública.

### Suas Duas Chaves

Todo usuário de criptomoeda possui um par de chaves criptográficas:

**Chave Pública (Seu Endereço)**
- Como seu endereço de e-mail — seguro para compartilhar
- Outros a usam para enviar criptomoedas a você
- Derivada matematicamente da sua chave privada
- Exemplo: `0x742d35Cc6634C0532925a3b844Bc9e7595f...`

**Chave Privada (Sua Senha)**
- NUNCA compartilhe com ninguém
- Usada para assinar transações (provar propriedade)
- Se perdida, seus fundos desaparecem para sempre
- Se roubada, seus fundos podem ser tomados
- Exemplo: `5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd...`

### Assinaturas Digitais

Quando você envia criptomoedas:
1. Você cria uma mensagem de transação
2. Sua carteira a assina com sua chave privada
3. Qualquer pessoa pode verificar a assinatura usando sua chave pública
4. Isso prova que você autorizou a transação

## Fluxo de uma Transação

### Passo 1: Criando a Transação

Você especifica:
- Endereço do destinatário
- Valor a enviar
- Taxa de transação (para os mineradores)

### Passo 2: Transmissão

Sua transação é transmitida à rede. Milhares de nós a recebem em segundos.

### Passo 3: Mempool

Transações não confirmadas aguardam na **mempool** (pool de memória). Os mineradores selecionam transações daqui.

### Passo 4: Verificação

Os nós verificam:
- Assinatura digital válida
- Saldo suficiente (sem gasto duplo)
- Formato correto da transação

### Passo 5: Inclusão no Bloco

Mineradores/validadores incluem sua transação em um novo bloco.

### Passo 6: Confirmação

Após o bloco ser adicionado à cadeia, sua transação tem 1 confirmação. Cada bloco subsequente adiciona mais uma confirmação.

## Mineração e Consenso

### Prova de Trabalho (Bitcoin)

Mineradores competem para resolver um quebra-cabeça criptográfico:
- Encontrar um número (nonce) que faça o hash do bloco começar com muitos zeros
- O primeiro a resolver transmite o bloco
- Outros nós verificam a solução (fácil de checar)
- O vencedor recebe a recompensa do bloco + taxas de transação

**Custo de Energia**: ~150 TWh/ano (mais do que alguns países)
**Segurança**: Extremamente alta — custaria bilhões para atacar

### Prova de Participação (Ethereum)

Validadores apostam ETH como garantia:
- Selecionados aleatoriamente para propor blocos
- Outros validadores atestam a validade
- Comportamento honesto recompensado, desonesto punido (slashing)
- Mínimo de 32 ETH para operar um validador

**Custo de Energia**: ~99,95% menos do que a Prova de Trabalho
**Segurança**: Segurança econômica por meio do capital apostado

## Confirmações Explicadas

| Confirmações | Tempo no Bitcoin | Nível de Segurança |
|--------------|------------------|--------------------|
| 0 (não confirmada) | — | Muito Baixo |
| 1 | ~10 minutos | Baixo |
| 3 | ~30 minutos | Médio |
| 6 | ~1 hora | Alto (recomendado) |
| 60+ | ~10 horas | Irreversível |

### Por que Esperar por Confirmações?

Cada confirmação torna exponencialmente mais difícil reverter uma transação. Com 6 confirmações, reverter exigiria controlar mais de 50% do hashrate da rede e gastar bilhões.

## Taxas de Transação

### Como as Taxas Funcionam

- Você oferece um lance pelo espaço no bloco
- Taxa maior = confirmação mais rápida
- Mineradores priorizam transações de taxa alta
- Taxas variam conforme o congestionamento da rede

## Principais Conclusões

1. A criptografia de chave pública protege a propriedade
2. As assinaturas digitais provam a autorização das transações
3. Os mecanismos de consenso evitam o gasto duplo
4. Mais confirmações = mais segurança
5. As taxas de transação incentivam mineradores/validadores"""
        },
        "summary": {
            "en": "Cryptocurrency uses public-key cryptography for security, digital signatures for authorization, and consensus mechanisms to prevent double-spending. Transactions become more secure with each confirmation.",
            "fr": "Les cryptomonnaies utilisent la cryptographie à clé publique pour la sécurité, les signatures numériques pour l'autorisation, et les mécanismes de consensus pour empêcher la double dépense.",
            "ar": "تستخدم العملات المشفرة التشفير بالمفتاح العام للأمان، والتوقيعات الرقمية للإذن، وآليات الإجماع لمنع الإنفاق المزدوج.",
            "pt": "As criptomoedas usam criptografia de chave pública para segurança, assinaturas digitais para autorização e mecanismos de consenso para evitar gastos duplos. As transações ficam mais seguras a cada confirmação."
        },
        "examples": {
            "en": [
                "Bitcoin miners competing to find valid block hashes",
                "Ethereum validators staking 32 ETH to participate in consensus",
                "Hardware wallets generating and storing private keys offline"
            ],
            "fr": [
                "Les mineurs Bitcoin en compétition pour trouver des hashes de bloc valides",
                "Les validateurs Ethereum mettant en jeu 32 ETH pour participer au consensus",
                "Les portefeuilles matériels générant et stockant les clés privées hors ligne"
            ],
            "ar": [
                "معدنو البيتكوين يتنافسون لإيجاد هاشات كتل صالحة",
                "مدققو الإيثريوم يراهنون بـ 32 ETH للمشاركة في الإجماع",
                "محافظ الأجهزة تولد وتخزن المفاتيح الخاصة دون اتصال"
            ],
            "pt": [
                "Mineradores de Bitcoin competindo para encontrar hashes de bloco válidos",
                "Validadores do Ethereum apostando 32 ETH para participar do consenso",
                "Carteiras de hardware gerando e armazenando chaves privadas offline"
            ]
        },
        "checkpoints": [
            {
                "id": "checkpoint-3-1",
                "position": 1,
                "question": {
                    "en": "What is used to prove you authorized a cryptocurrency transaction?",
                    "fr": "Qu'est-ce qui est utilisé pour prouver que vous avez autorisé une transaction ?",
                    "ar": "ما الذي يُستخدم لإثبات أنك أذنت بمعاملة عملة مشفرة؟",
                    "pt": "O que é usado para provar que você autorizou uma transação de criptomoeda?"
                },
                "options": {
                    "en": ["Password", "Digital signature", "Email verification", "Phone call"],
                    "fr": ["Mot de passe", "Signature numérique", "Vérification email", "Appel téléphonique"],
                    "ar": ["كلمة مرور", "توقيع رقمي", "التحقق بالبريد الإلكتروني", "مكالمة هاتفية"],
                    "pt": ["Senha", "Assinatura digital", "Verificação por e-mail", "Ligação telefônica"]
                },
                "correct_answer": 1,
                "explanation": {
                    "en": "Digital signatures created with your private key prove you authorized the transaction.",
                    "fr": "Les signatures numériques créées avec votre clé privée prouvent que vous avez autorisé la transaction.",
                    "ar": "التوقيعات الرقمية المنشأة بمفتاحك الخاص تثبت أنك أذنت بالمعاملة.",
                    "pt": "As assinaturas digitais criadas com sua chave privada provam que você autorizou a transação."
                }
            }
        ]
    },

    "course-foundations-lesson-4": {
        "id": "course-foundations-lesson-4",
        "course_id": "course-foundations",
        "order": 3,
        "duration_minutes": 45,
        "difficulty": "beginner",
        "title": {
            "en": "Crypto Wallets Explained",
            "fr": "Les Portefeuilles Crypto Expliqués",
            "ar": "شرح محافظ العملات المشفرة"
        },
        "subtitle": {
            "en": "Storing and managing your digital assets",
            "fr": "Stocker et gérer vos actifs numériques",
            "ar": "تخزين وإدارة أصولك الرقمية"
        },
        "learning_objectives": {
            "en": [
                "Distinguish between hot and cold wallet types",
                "Understand seed phrases and backup importance",
                "Learn wallet security best practices",
                "Choose the right wallet for your needs"
            ],
            "fr": [
                "Distinguer les types de portefeuilles chauds et froids",
                "Comprendre les phrases de récupération et l'importance de la sauvegarde",
                "Apprendre les meilleures pratiques de sécurité des portefeuilles",
                "Choisir le bon portefeuille selon vos besoins"
            ],
            "ar": [
                "التمييز بين أنواع المحافظ الساخنة والباردة",
                "فهم عبارات الاسترداد وأهمية النسخ الاحتياطي",
                "تعلم أفضل ممارسات أمان المحافظ",
                "اختيار المحفظة المناسبة لاحتياجاتك"
            ]
        },
        "content": {
            "en": """# Cryptocurrency Wallets

A crypto wallet is your gateway to the blockchain world. Understanding the different types and how to secure them is fundamental knowledge.

## What is a Crypto Wallet?

**Important Clarification**: A wallet doesn't actually "store" your cryptocurrency. Your coins exist on the blockchain. A wallet stores your **private keys** that give you control over those coins.

Think of it like this:
- Your crypto = money in a vault
- Your wallet = the key to that vault
- Blockchain = the vault itself

## Types of Wallets

### Hot Wallets (Connected to Internet)

**Mobile Wallets**
- Apps on your smartphone
- Examples: Trust Wallet, Coinbase Wallet, MetaMask Mobile
- Best for: Small amounts, daily transactions

*Pros*: Convenient, easy to use, always accessible
*Cons*: Vulnerable to phone malware, loss if phone stolen

**Desktop Wallets**
- Software installed on your computer
- Examples: Electrum (Bitcoin), Exodus, Atomic Wallet
- Best for: Medium amounts, regular trading

*Pros*: More features than mobile, better for larger screens
*Cons*: Vulnerable to computer viruses, keyloggers

**Web Wallets**
- Accessed through a browser
- Examples: MetaMask extension, MyEtherWallet
- Best for: DeFi interaction, dApp access

*Pros*: Easy access from any device, DeFi compatible
*Cons*: Phishing risks, browser extensions can be exploited

### Cold Wallets (Offline)

**Hardware Wallets**
- Physical devices that store keys offline
- Examples: Ledger Nano X, Trezor Model T, Coldcard
- Best for: Large amounts, long-term storage

*Pros*: Maximum security, immune to online attacks
*Cons*: Cost ($50-200), less convenient for frequent transactions

**Paper Wallets**
- Private keys printed on paper
- Best for: Cold storage archives

*Pros*: Completely offline, no electronic failure
*Cons*: Can be damaged, lost, or stolen physically

## Seed Phrases (Recovery Phrases)

When you create a wallet, you receive a **seed phrase** - typically 12 or 24 words that can restore your entire wallet.

### Example (NEVER use this):
```
abandon ability able about above absent absorb abstract absurd abuse access accident
```

### Critical Rules

1. **Write it on paper** - Never store digitally
2. **Multiple copies** - Store in different secure locations
3. **Never share** - No one legitimate will ever ask for it
4. **Test recovery** - Verify you can restore before large deposits

### Security Warning

Anyone with your seed phrase controls ALL your funds. Scammers will:
- Pose as "support" and ask for your seed
- Create fake wallet apps that steal your seed
- Send phishing emails requesting "verification"

**LEGITIMATE COMPANIES NEVER ASK FOR YOUR SEED PHRASE**

## Choosing the Right Wallet

### For Beginners
Start with a reputable mobile wallet like Trust Wallet or Coinbase Wallet. Keep small amounts only.

### For Regular Traders
Use a hardware wallet for savings, hot wallet for trading funds. Never keep more than you can afford to lose in hot wallets.

### For Long-Term Holders
Hardware wallet is essential. Consider multiple hardware wallets from different manufacturers for very large holdings.

### Security Setup Checklist

- [ ] Use a hardware wallet for significant amounts
- [ ] Write seed phrase on metal (fire/water resistant)
- [ ] Enable all security features (PIN, passphrase)
- [ ] Use a dedicated device for crypto (optional but recommended)
- [ ] Never store seed digitally (no photos, no cloud)
- [ ] Test recovery process before large deposits

## Key Takeaways

1. Wallets store private keys, not cryptocurrency itself
2. Hot wallets offer convenience, cold wallets offer security
3. Seed phrases can restore your entire wallet - protect them
4. Match your wallet choice to your security needs
5. Never share your seed phrase with anyone""",
            "fr": """# Les Portefeuilles Crypto

Un portefeuille crypto est votre porte d'entrée vers le monde de la blockchain. Comprendre les différents types et comment les sécuriser est une connaissance fondamentale.

## Qu'est-ce qu'un Portefeuille Crypto ?

**Clarification Importante** : Un portefeuille ne "stocke" pas réellement vos cryptomonnaies. Vos coins existent sur la blockchain. Un portefeuille stocke vos **clés privées** qui vous donnent le contrôle sur ces coins.

Pensez-y ainsi :
- Vos cryptos = argent dans un coffre
- Votre portefeuille = la clé de ce coffre
- Blockchain = le coffre lui-même

## Types de Portefeuilles

### Portefeuilles Chauds (Connectés à Internet)

**Portefeuilles Mobiles**
- Applications sur votre smartphone
- Exemples : Trust Wallet, Coinbase Wallet, MetaMask Mobile
- Idéal pour : Petits montants, transactions quotidiennes

*Avantages* : Pratique, facile à utiliser, toujours accessible
*Inconvénients* : Vulnérable aux malwares, perte si téléphone volé

**Portefeuilles Bureau**
- Logiciels installés sur votre ordinateur
- Exemples : Electrum (Bitcoin), Exodus, Atomic Wallet
- Idéal pour : Montants moyens, trading régulier

**Portefeuilles Web**
- Accessibles via un navigateur
- Exemples : Extension MetaMask, MyEtherWallet
- Idéal pour : Interaction DeFi, accès aux dApps

### Portefeuilles Froids (Hors Ligne)

**Portefeuilles Matériels**
- Appareils physiques stockant les clés hors ligne
- Exemples : Ledger Nano X, Trezor Model T
- Idéal pour : Gros montants, stockage long terme

*Avantages* : Sécurité maximale, immunisé contre les attaques en ligne
*Inconvénients* : Coût (50-200€), moins pratique pour transactions fréquentes

## Phrases de Récupération

Quand vous créez un portefeuille, vous recevez une **phrase de récupération** - typiquement 12 ou 24 mots qui peuvent restaurer l'intégralité de votre portefeuille.

### Règles Critiques

1. **Écrivez-la sur papier** - Jamais de stockage numérique
2. **Copies multiples** - Stockez dans différents endroits sécurisés
3. **Ne jamais partager** - Personne de légitime ne vous la demandera
4. **Testez la récupération** - Vérifiez que vous pouvez restaurer avant de gros dépôts

### Avertissement de Sécurité

Toute personne avec votre phrase de récupération contrôle TOUS vos fonds. Les escrocs vont :
- Se faire passer pour le "support" et demander votre phrase
- Créer de fausses applications qui volent votre phrase
- Envoyer des emails de phishing demandant une "vérification"

**LES ENTREPRISES LÉGITIMES NE DEMANDENT JAMAIS VOTRE PHRASE DE RÉCUPÉRATION**

## Points Clés à Retenir

1. Les portefeuilles stockent les clés privées, pas les cryptomonnaies
2. Les portefeuilles chauds offrent la commodité, les froids la sécurité
3. Les phrases de récupération peuvent restaurer votre portefeuille entier - protégez-les
4. Adaptez votre choix de portefeuille à vos besoins de sécurité
5. Ne partagez jamais votre phrase de récupération avec quiconque""",
            "ar": """# محافظ العملات المشفرة

محفظة العملات المشفرة هي بوابتك إلى عالم البلوكتشين. فهم الأنواع المختلفة وكيفية تأمينها هو معرفة أساسية.

## ما هي محفظة العملات المشفرة؟

**توضيح مهم**: المحفظة لا "تخزن" عملاتك المشفرة فعليًا. عملاتك موجودة على البلوكتشين. المحفظة تخزن **مفاتيحك الخاصة** التي تمنحك التحكم في تلك العملات.

فكر في الأمر هكذا:
- عملاتك المشفرة = أموال في خزنة
- محفظتك = مفتاح تلك الخزنة
- البلوكتشين = الخزنة نفسها

## أنواع المحافظ

### المحافظ الساخنة (متصلة بالإنترنت)

**محافظ الهاتف المحمول**
- تطبيقات على هاتفك الذكي
- أمثلة: Trust Wallet، Coinbase Wallet
- الأفضل لـ: المبالغ الصغيرة، المعاملات اليومية

### المحافظ الباردة (غير متصلة)

**محافظ الأجهزة**
- أجهزة مادية تخزن المفاتيح دون اتصال
- أمثلة: Ledger Nano X، Trezor Model T
- الأفضل لـ: المبالغ الكبيرة، التخزين طويل المدى

## عبارات الاسترداد

عند إنشاء محفظة، تتلقى **عبارة استرداد** - عادة 12 أو 24 كلمة يمكنها استعادة محفظتك بالكامل.

### قواعد حاسمة

1. **اكتبها على ورق** - لا تخزنها رقميًا أبدًا
2. **نسخ متعددة** - خزنها في أماكن آمنة مختلفة
3. **لا تشاركها أبدًا** - لا أحد شرعي سيطلبها منك
4. **اختبر الاسترداد** - تحقق من قدرتك على الاستعادة قبل الإيداعات الكبيرة

## النقاط الرئيسية

1. المحافظ تخزن المفاتيح الخاصة، وليس العملات المشفرة نفسها
2. المحافظ الساخنة توفر الراحة، الباردة توفر الأمان
3. عبارات الاسترداد يمكنها استعادة محفظتك بالكامل - احمها
4. طابق اختيار محفظتك مع احتياجاتك الأمنية
5. لا تشارك عبارة الاسترداد مع أي شخص أبدًا"""
        },
        "summary": {
            "en": "Crypto wallets store private keys that control your funds on the blockchain. Choose between hot wallets for convenience or cold wallets for security, and always protect your seed phrase.",
            "fr": "Les portefeuilles crypto stockent les clés privées qui contrôlent vos fonds sur la blockchain. Choisissez entre portefeuilles chauds pour la commodité ou froids pour la sécurité, et protégez toujours votre phrase de récupération.",
            "ar": "محافظ العملات المشفرة تخزن المفاتيح الخاصة التي تتحكم في أموالك على البلوكتشين. اختر بين المحافظ الساخنة للراحة أو الباردة للأمان، واحمِ دائمًا عبارة الاسترداد."
        },
        "examples": {
            "en": [
                "Using Ledger Nano X for Bitcoin savings",
                "MetaMask browser extension for DeFi interactions",
                "Trust Wallet for daily mobile transactions"
            ],
            "fr": [
                "Utiliser Ledger Nano X pour l'épargne Bitcoin",
                "Extension MetaMask pour les interactions DeFi",
                "Trust Wallet pour les transactions mobiles quotidiennes"
            ],
            "ar": [
                "استخدام Ledger Nano X لمدخرات البيتكوين",
                "إضافة MetaMask للتفاعلات مع DeFi",
                "Trust Wallet للمعاملات اليومية عبر الهاتف"
            ]
        },
        "checkpoints": [
            {
                "id": "checkpoint-4-1",
                "position": 1,
                "question": {
                    "en": "What does a crypto wallet actually store?",
                    "fr": "Que stocke réellement un portefeuille crypto ?",
                    "ar": "ماذا تخزن محفظة العملات المشفرة فعليًا؟"
                },
                "options": {
                    "en": ["Cryptocurrency coins", "Private keys", "Blockchain data", "Transaction history"],
                    "fr": ["Les cryptomonnaies", "Les clés privées", "Les données blockchain", "L'historique des transactions"],
                    "ar": ["عملات مشفرة", "مفاتيح خاصة", "بيانات البلوكتشين", "سجل المعاملات"]
                },
                "correct_answer": 1,
                "explanation": {
                    "en": "Wallets store private keys that give you control over your coins on the blockchain.",
                    "fr": "Les portefeuilles stockent les clés privées qui vous donnent le contrôle sur vos coins sur la blockchain.",
                    "ar": "المحافظ تخزن المفاتيح الخاصة التي تمنحك التحكم في عملاتك على البلوكتشين."
                }
            }
        ]
    },

    "course-foundations-lesson-5": {
        "id": "course-foundations-lesson-5",
        "course_id": "course-foundations",
        "order": 4,
        "duration_minutes": 50,
        "difficulty": "beginner",
        "title": {
            "en": "Private Keys and Security",
            "fr": "Clés Privées et Sécurité",
            "ar": "المفاتيح الخاصة والأمان"
        },
        "subtitle": {
            "en": "Protecting your digital wealth",
            "fr": "Protéger votre richesse numérique",
            "ar": "حماية ثروتك الرقمية"
        },
        "learning_objectives": {
            "en": [
                "Master private key management fundamentals",
                "Recognize common cryptocurrency scams",
                "Implement multi-layer security practices",
                "Understand the 'not your keys, not your coins' principle"
            ],
            "fr": [
                "Maîtriser les fondamentaux de la gestion des clés privées",
                "Reconnaître les arnaques crypto courantes",
                "Implémenter des pratiques de sécurité multi-couches",
                "Comprendre le principe 'pas vos clés, pas vos coins'"
            ],
            "ar": [
                "إتقان أساسيات إدارة المفاتيح الخاصة",
                "التعرف على عمليات الاحتيال الشائعة في العملات المشفرة",
                "تطبيق ممارسات الأمان متعددة الطبقات",
                "فهم مبدأ 'ليست مفاتيحك، ليست عملاتك'"
            ]
        },
        "content": {
            "en": """# Securing Your Cryptocurrency

In the crypto world, you are your own bank. This freedom comes with responsibility - security is entirely in your hands.

## The Golden Rule

**"Not your keys, not your coins."**

If someone else holds your private keys (like a centralized exchange), they technically control your funds. History is littered with exchange hacks and failures:

- **Mt. Gox (2014)**: 850,000 BTC lost
- **QuadrigaCX (2019)**: $190 million inaccessible
- **FTX (2022)**: $8 billion in customer funds missing

## Understanding Private Keys

### What is a Private Key?

A private key is a 256-bit random number, typically displayed as:
- 64 hexadecimal characters, or
- A 12-24 word seed phrase (easier to backup)

### The Math of Security

A 256-bit key has 2^256 possible combinations. That's:
```
115,792,089,237,316,195,423,570,985,008,687,907,853,269,984,665,640,564,039,457,584,007,913,129,639,936
```

It would take longer than the age of the universe to brute-force guess a private key, even with all the world's computers combined.

## Common Threats

### Phishing Attacks

**How it works**: Fake websites, emails, or support messages trick you into revealing your keys.

**Red flags**:
- Urgent language ("Act now or lose access!")
- Requests for seed phrases or private keys
- Misspelled URLs (metamask.lo instead of metamask.io)
- Unsolicited DMs offering "help"

**Protection**: Bookmark official sites, verify URLs character by character.

### Malware and Keyloggers

**How it works**: Malicious software records your keystrokes or scans for crypto-related files.

**Protection**:
- Use hardware wallets (keys never touch your computer)
- Dedicated device for crypto only
- Keep software updated
- Never download wallet software from unofficial sources

### Social Engineering

**How it works**: Scammers build trust then exploit it.

**Common scenarios**:
- "Support" on Discord/Telegram asking for screen share
- "Investment opportunities" from new online friends
- Fake giveaways ("Send 1 ETH, get 2 back!")

**Protection**: If it sounds too good to be true, it is.

### SIM Swapping

**How it works**: Attackers convince your phone carrier to transfer your number to their SIM.

**Why it matters**: SMS-based 2FA can be bypassed.

**Protection**:
- Use authenticator apps (Google Authenticator, Authy)
- Add PIN to carrier account
- Never use phone number for 2FA on crypto accounts

## Multi-Layer Security

### Layer 1: Strong Passwords
- Unique for each service
- Use a password manager (1Password, Bitwarden)
- Never reuse passwords

### Layer 2: Two-Factor Authentication (2FA)
- **Best**: Hardware keys (YubiKey)
- **Good**: Authenticator apps
- **Avoid**: SMS-based 2FA

### Layer 3: Hardware Wallets
- Keys generated and stored offline
- Transactions signed on the device
- Even if computer is compromised, keys are safe

### Layer 4: Operational Security
- Never discuss holdings publicly
- Use dedicated email for crypto
- Consider a dedicated phone/computer
- Be paranoid - it's appropriate in crypto

## Emergency Preparedness

### If Your Seed is Compromised
1. Immediately transfer funds to a new wallet
2. Do NOT use the compromised seed ever again
3. Investigate how it was exposed

### Inheritance Planning
- Consider a multisig setup requiring multiple keys
- Use a dead man's switch service
- Include crypto in your will with clear instructions
- Trusted family member with partial instructions

## Key Takeaways

1. "Not your keys, not your coins" - self-custody matters
2. Never share your seed phrase with anyone, ever
3. Use hardware wallets for significant holdings
4. Enable strong 2FA (authenticator apps, not SMS)
5. Stay paranoid - most attacks rely on human error""",
            "fr": """# Sécuriser Vos Cryptomonnaies

Dans le monde crypto, vous êtes votre propre banque. Cette liberté vient avec une responsabilité - la sécurité est entièrement entre vos mains.

## La Règle d'Or

**"Pas vos clés, pas vos coins."**

Si quelqu'un d'autre détient vos clés privées (comme un exchange centralisé), il contrôle techniquement vos fonds. L'histoire est jonchée de piratages et de faillites d'exchanges.

## Comprendre les Clés Privées

### Qu'est-ce qu'une Clé Privée ?

Une clé privée est un nombre aléatoire de 256 bits, typiquement affiché comme :
- 64 caractères hexadécimaux, ou
- Une phrase de récupération de 12-24 mots

## Menaces Courantes

### Attaques de Phishing

**Comment ça marche** : De faux sites, emails ou messages de support vous piègent pour révéler vos clés.

**Signaux d'alerte** :
- Langage urgent ("Agissez maintenant ou perdez l'accès !")
- Demandes de phrases de récupération ou clés privées
- URLs mal orthographiées
- DMs non sollicités offrant de "l'aide"

### Malware et Keyloggers

**Comment ça marche** : Un logiciel malveillant enregistre vos frappes ou scanne les fichiers liés aux cryptos.

**Protection** :
- Utilisez des portefeuilles matériels
- Appareil dédié uniquement pour les cryptos
- Gardez les logiciels à jour

### Ingénierie Sociale

**Comment ça marche** : Les escrocs construisent la confiance puis l'exploitent.

### SIM Swapping

**Comment ça marche** : Les attaquants convainquent votre opérateur de transférer votre numéro vers leur SIM.

## Sécurité Multi-Couches

### Couche 1 : Mots de Passe Forts
### Couche 2 : Authentification à Deux Facteurs (2FA)
### Couche 3 : Portefeuilles Matériels
### Couche 4 : Sécurité Opérationnelle

## Points Clés à Retenir

1. "Pas vos clés, pas vos coins" - l'auto-garde compte
2. Ne partagez jamais votre phrase de récupération
3. Utilisez des portefeuilles matériels pour les gros montants
4. Activez une 2FA forte (apps d'authentification, pas SMS)
5. Restez paranoïaque - la plupart des attaques reposent sur l'erreur humaine""",
            "ar": """# تأمين عملاتك المشفرة

في عالم العملات المشفرة، أنت بنكك الخاص. هذه الحرية تأتي مع مسؤولية - الأمان بالكامل في يديك.

## القاعدة الذهبية

**"ليست مفاتيحك، ليست عملاتك."**

إذا كان شخص آخر يحتفظ بمفاتيحك الخاصة (مثل بورصة مركزية)، فهو يتحكم تقنيًا في أموالك.

## فهم المفاتيح الخاصة

المفتاح الخاص هو رقم عشوائي من 256 بت.

## التهديدات الشائعة

### هجمات التصيد
### البرامج الضارة
### الهندسة الاجتماعية
### تبديل شريحة SIM

## الأمان متعدد الطبقات

1. كلمات مرور قوية
2. المصادقة الثنائية
3. محافظ الأجهزة
4. الأمان التشغيلي

## النقاط الرئيسية

1. "ليست مفاتيحك، ليست عملاتك" - الحفظ الذاتي مهم
2. لا تشارك عبارة الاسترداد أبدًا
3. استخدم محافظ الأجهزة للمبالغ الكبيرة
4. فعّل 2FA قوية
5. ابقَ حذرًا"""
        },
        "summary": {
            "en": "Self-custody of private keys is essential for true crypto ownership. Protect yourself with hardware wallets, strong 2FA, and vigilance against phishing and social engineering attacks.",
            "fr": "L'auto-garde des clés privées est essentielle pour une vraie propriété crypto. Protégez-vous avec des portefeuilles matériels, une 2FA forte, et la vigilance contre le phishing.",
            "ar": "الحفظ الذاتي للمفاتيح الخاصة ضروري للملكية الحقيقية للعملات المشفرة. احمِ نفسك بمحافظ الأجهزة و2FA قوية واليقظة ضد التصيد."
        },
        "examples": {
            "en": [
                "Mt. Gox hack losing 850,000 BTC in 2014",
                "Using YubiKey hardware 2FA for exchange accounts",
                "Recognizing fake MetaMask support scams on Discord"
            ],
            "fr": [
                "Le piratage Mt. Gox perdant 850,000 BTC en 2014",
                "Utiliser YubiKey 2FA matériel pour les comptes d'exchange",
                "Reconnaître les fausses arnaques support MetaMask sur Discord"
            ],
            "ar": [
                "اختراق Mt. Gox وخسارة 850,000 BTC في 2014",
                "استخدام YubiKey للمصادقة الثنائية لحسابات البورصات",
                "التعرف على عمليات احتيال دعم MetaMask المزيفة على Discord"
            ]
        },
        "checkpoints": [
            {
                "id": "checkpoint-5-1",
                "position": 1,
                "question": {
                    "en": "What is the safest form of two-factor authentication for crypto?",
                    "fr": "Quelle est la forme la plus sûre de 2FA pour les cryptos ?",
                    "ar": "ما هو أكثر أشكال المصادقة الثنائية أمانًا للعملات المشفرة؟"
                },
                "options": {
                    "en": ["SMS codes", "Email verification", "Hardware security keys", "Security questions"],
                    "fr": ["Codes SMS", "Vérification email", "Clés de sécurité matérielles", "Questions de sécurité"],
                    "ar": ["رموز SMS", "التحقق بالبريد الإلكتروني", "مفاتيح الأمان المادية", "أسئلة الأمان"]
                },
                "correct_answer": 2,
                "explanation": {
                    "en": "Hardware security keys like YubiKey are the most secure 2FA method as they can't be phished or SIM-swapped.",
                    "fr": "Les clés de sécurité matérielles comme YubiKey sont la méthode 2FA la plus sécurisée car elles ne peuvent pas être hameçonnées ou SIM-swappées.",
                    "ar": "مفاتيح الأمان المادية مثل YubiKey هي أكثر طرق 2FA أمانًا لأنها لا يمكن تصيدها أو تبديل SIM."
                }
            }
        ]
    }
}
