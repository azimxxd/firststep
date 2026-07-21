"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, HeartHandshake,
  LockKeyhole, MessageCircle, Phone, RotateCcw, ShieldCheck, Sparkles,
  ShieldAlert,
} from "lucide-react";
import { supportResources } from "@/config/supportResources";
import type { ChatResponse, ConversationContext, Intent, InterventionType, Language, RiskLevel } from "@/types/safety";
import { FirstStepLogo } from "@/components/FirstStepLogo";

type Screen = "landing" | "onboarding" | "chat" | "support";
type ChatMessage = { role: "ai" | "user"; content: string };

const copy = {
  ru: {
    eyebrow: "FIRSTSTEP · АНОНИМНЫЙ ЧАТ",
    hero: "Когда учёба давит, можно начать с одного сообщения.",
    subtitle: "Чат для студентов: помогает разобрать стресс из-за экзаменов, дедлайнов, нагрузки и перемен — и выбрать один посильный шаг.",
    start: "Начать анонимно",
    urgent: "Нужна срочная помощь?",
    notice: "Это ИИ-сервис поддержки. Он не ставит диагнозы и не заменяет психолога или врача.",
    onboardingTitle: "Перед началом — важное",
    onboardingLead: "Ты общаешься с искусственным интеллектом.",
    onboardingBody: "FirstStep помогает только со стрессом в учёбе и студенческой жизни: назвать главное, попробовать короткую технику и выбрать следующий шаг.",
    onboardingBack: "назад",
    onboardingPoint1: "назвать, что именно давит в учёбе или студенческой жизни",
    onboardingPoint2: "попробовать одну простую технику самоподдержки",
    onboardingPoint3: "выбрать посильный шаг на ближайшие 5–15 минут",
    onboardingWarningTitle: "Если сейчас небезопасно",
    onboardingWarning: "Если тебе или кому-то рядом прямо сейчас угрожает опасность, не оставайся с этим один: обратись в экстренные службы или к человеку, которому доверяешь.",
    emergencyServices: "экстренные службы",
    trustedPerson: "человек, которому доверяешь",
    agree: "Я понимаю и хочу продолжить",
    continue: "Продолжить анонимно",
    chatTitle: "Стресс в учёбе",
    anonymous: "сессия без аккаунта",
    greeting: "Привет. Что сейчас сильнее всего давит: экзамен, дедлайн, нагрузка, усталость или перемены в студенческой жизни?",
    privacy: "Телефон и email скрываются перед отправкой AI-провайдеру; полная анонимизация не гарантируется.",
    placeholder: "Напиши, что происходит…",
    send: "Отправить",
    skip: "Пропустить",
    tryExercise: "Попробовать упражнение",
    supportTitle: "Ты не обязан(а) оставаться с этим один(а)",
    supportLead: "Если ситуация кажется опасной прямо сейчас, обратись к человеку рядом или в местные экстренные службы.",
    trusted: "Связаться с человеком, которому я доверяю",
    resources: "Посмотреть доступные линии помощи",
    danger: "Мне сейчас угрожает непосредственная опасность",
    back: "Назад к разговору",
    highRisk: "Похоже, тебе сейчас может быть очень тяжело. Не оставайся с этим в одиночку.",
    breathing: "60 секунд мягкого дыхания",
    breathingText: "Попробуй следовать ритму, если тебе комфортно. Это не лечение — только короткая пауза для внимания к себе.",
    inhale: "Вдох",
    hold: "Задержка",
    exhale: "Выдох",
    nextStep: "Один следующий шаг",
    nextStepText: "Выбери одну маленькую задачу, которую можно начать за 10 минут. Остальное пока можно отложить.",
    reachOut: "Один безопасный контакт",
    reachOutText: "Подумай об одном человеке, которому можно написать без длинных объяснений: «Мне непросто. Можешь немного побыть на связи?»",
    grounding: "Заземление 5–4–3–2–1",
    groundingText: "Назови 5 вещей, которые видишь, 4 — которых можешь коснуться, 3 звука, 2 запаха и 1 вкус.",
    reflection: "Короткая пауза",
    reflectionText: "Попробуй назвать: что я чувствую, что мне сейчас нужно и какой самый добрый шаг я могу сделать для себя?",
    available: "доступно",
    needsSetup: "нужно настроить",
    otherTopics: "Другие темы",
    userLabel: "ты",
    composerSafety: "сообщение не сохраняется приложением",
    interventionTag: "ОДИН МАЛЕНЬКИЙ ШАГ",
    breathPattern: "вдох 4 · пауза 2 · выдох 6",
    trustedMessage: "Мне сейчас непросто. Можешь побыть на связи?",
    resourcesHint: "Круглосуточная конфиденциальная помощь: 111",
    dangerHint: "При непосредственной опасности звони 112",
    resourceListTitle: "Проверенные ресурсы Казахстана",
    officialSource: "официальный источник",
    contextMap: "Карта давления",
    contextShift: "Новая тема учтена",
    focusTaskLabel: "На чём сфокусироваться",
    focusTaskPlaceholder: "Например: план проекта",
    focusStart: "Начать 15 минут",
    focusPause: "Пауза",
    focusResume: "Продолжить",
    focusReset: "Сбросить",
    focusComplete: "Спринт завершён. Теперь выбери: продолжить ещё 15 минут или сделать короткую паузу.",
    focusPrivacy: "Задача и таймер остаются только в этой вкладке.",
    retry: "Отправить ещё раз",
    privacyPolicy: "Конфиденциальность",
    termsOfUse: "Условия использования",
    skipToContent: "Перейти к содержанию",
  },
  kk: {
    eyebrow: "FIRSTSTEP · АНОНИМДІ ЧАТ",
    hero: "Оқу қысым жасаса, бір хабарламадан бастауға болады.",
    subtitle: "Студенттерге арналған чат: емтихан, дедлайн, жүктеме және өзгерістерден туған күйзелісті талдап, бір қолайлы қадамды таңдауға көмектеседі.",
    start: "Анонимді бастау",
    urgent: "Шұғыл көмек керек пе?",
    notice: "Бұл — AI қолдау қызметі. Ол диагноз қоймайды және психологты немесе дәрігерді алмастырмайды.",
    onboardingTitle: "Бастамас бұрын — маңызды",
    onboardingLead: "Сен жасанды интеллектпен сөйлесіп жатырсың.",
    onboardingBody: "FirstStep тек оқу мен студенттік өмірдегі күйзеліске көмектеседі: ең маңыздысын атап, қысқа тәсілді байқап, келесі қадамды таңдауға болады.",
    onboardingBack: "артқа",
    onboardingPoint1: "оқуда немесе студенттік өмірде не қысым жасайтынын атау",
    onboardingPoint2: "өзін-өзі қолдаудың бір қарапайым тәсілін байқап көру",
    onboardingPoint3: "алдағы 5–15 минутқа қолайлы бір қадам таңдау",
    onboardingWarningTitle: "Қазір қауіпсіз болмаса",
    onboardingWarning: "Егер саған немесе жаныңдағы адамға дәл қазір қауіп төніп тұрса, мұны жалғыз көтерме: жедел қызметке немесе сенетін адамыңа хабарлас.",
    emergencyServices: "жедел қызмет",
    trustedPerson: "сенетін адамың",
    agree: "Түсіндім, жалғастырғым келеді",
    continue: "Анонимді жалғастыру",
    chatTitle: "Оқудағы күйзеліс",
    anonymous: "аккаунтсыз сессия",
    greeting: "Сәлем. Қазір ең қатты не қысым жасайды: емтихан, дедлайн, жүктеме, шаршау әлде студенттік өмірдегі өзгерістер ме?",
    privacy: "Телефон мен email AI-провайдерге жіберілер алдында жасырылады; толық анонимдендіруге кепілдік берілмейді.",
    placeholder: "Не болып жатқанын жаз…",
    send: "Жіберу",
    skip: "Өткізу",
    tryExercise: "Жаттығуды байқап көру",
    supportTitle: "Мұны жалғыз көтеруге міндетті емессің",
    supportLead: "Егер жағдай дәл қазір қауіпті көрінсе, жаныңдағы адамға немесе жергілікті жедел қызметке хабарлас.",
    trusted: "Сенетін адамыма хабарласу",
    resources: "Қолжетімді көмек желілерін көру",
    danger: "Маған дәл қазір тікелей қауіп төніп тұр",
    back: "Әңгімеге оралу",
    highRisk: "Қазір саған өте ауыр болуы мүмкін. Мұны жалғыз көтерме.",
    breathing: "60 секунд жұмсақ тыныс алу",
    breathingText: "Ыңғайлы болса, ырғаққа еріп көр. Бұл ем емес — өзіңе назар аударуға арналған қысқа үзіліс.",
    inhale: "Дем ал",
    hold: "Ұста",
    exhale: "Дем шығар",
    nextStep: "Бір келесі қадам",
    nextStepText: "10 минутта бастауға болатын бір кішкентай тапсырманы таңда. Қалғанын әзірге кейінге қалдыруға болады.",
    reachOut: "Бір қауіпсіз байланыс",
    reachOutText: "Ұзақ түсіндірусіз жазуға болатын бір адамды ойла: «Маған қазір қиын. Біраз байланыста бола аласың ба?»",
    grounding: "5–4–3–2–1 әдісі",
    groundingText: "Көріп тұрған 5 нәрсені, ұстай алатын 4 нәрсені, 3 дыбысты, 2 иісті және 1 дәмді ата.",
    reflection: "Қысқа үзіліс",
    reflectionText: "Өзіңнен сұрап көр: қазір не сезіп тұрмын, маған не керек және өзіме жасай алатын ең мейірімді қадам қандай?",
    available: "қолжетімді",
    needsSetup: "орнату қажет",
    otherTopics: "Басқа тақырыптар",
    userLabel: "сен",
    composerSafety: "хабарлама қолданбада сақталмайды",
    interventionTag: "БІР КІШКЕНТАЙ ҚАДАМ",
    breathPattern: "дем алу 4 · үзіліс 2 · дем шығару 6",
    trustedMessage: "Маған қазір қиын. Біраз байланыста бола аласың ба?",
    resourcesHint: "Тәулік бойы құпия көмек: 111",
    dangerHint: "Тікелей қауіп болса, 112 нөміріне қоңырау шал",
    resourceListTitle: "Қазақстанның тексерілген ресурстары",
    officialSource: "ресми дереккөз",
    contextMap: "Қысым картасы",
    contextShift: "Жаңа тақырып ескерілді",
    focusTaskLabel: "Неге назар аударамыз",
    focusTaskPlaceholder: "Мысалы: жоба жоспары",
    focusStart: "15 минутты бастау",
    focusPause: "Үзіліс",
    focusResume: "Жалғастыру",
    focusReset: "Қалпына келтіру",
    focusComplete: "Спринт аяқталды. Енді тағы 15 минут жалғастыруды немесе қысқа үзілісті таңда.",
    focusPrivacy: "Тапсырма мен таймер тек осы бетте қалады.",
    retry: "Қайта жіберу",
    privacyPolicy: "Құпиялылық",
    termsOfUse: "Пайдалану шарттары",
    skipToContent: "Негізгі мазмұнға өту",
  },
} as const;

const intentLabels: Record<Language, Partial<Record<Intent, string>>> = {
  ru: {
    GENERAL_DISTRESS: "тяжёлое состояние",
    ANXIETY: "тревога",
    ACADEMIC_STRESS: "учебная нагрузка",
    LONELINESS: "одиночество",
    BULLYING: "небезопасное общение",
    FAMILY_PRESSURE: "давление семьи",
    PANIC: "сильная тревога",
    SELF_HARM_RISK: "нужна помощь сейчас",
  },
  kk: {
    GENERAL_DISTRESS: "ауыр күй",
    ANXIETY: "алаңдау",
    ACADEMIC_STRESS: "оқу жүктемесі",
    LONELINESS: "жалғыздық",
    BULLYING: "қауіпсіз емес қарым-қатынас",
    FAMILY_PRESSURE: "отбасы қысымы",
    PANIC: "қатты алаңдау",
    SELF_HARM_RISK: "қазір көмек керек",
  },
};

const breathingPhases = [
  { key: "inhale" as const, seconds: 4 },
  { key: "hold" as const, seconds: 2 },
  { key: "exhale" as const, seconds: 6 },
];

type PromptContext = "initial" | "anxious" | "lonely" | "studies" | "talk";
type QuickPrompt = { label: string; context: PromptContext };

const promptSets: Record<Language, Record<PromptContext, QuickPrompt[]>> = {
  ru: {
    initial: [
      { label: "Мне тревожно", context: "anxious" },
      { label: "Я чувствую себя одиноко", context: "lonely" },
      { label: "Проблемы с учёбой", context: "studies" },
      { label: "Хочу просто выговориться", context: "talk" },
    ],
    anxious: [
      { label: "Помоги мне успокоиться", context: "anxious" },
      { label: "Хочу понять, что меня тревожит", context: "anxious" },
      { label: "Мне нужен план на ближайший час", context: "anxious" },
    ],
    lonely: [
      { label: "Хочу рассказать, что происходит", context: "lonely" },
      { label: "Помоги мне написать близкому человеку", context: "lonely" },
      { label: "Мне сложно просить о поддержке", context: "lonely" },
    ],
    studies: [
      { label: "Помоги разложить всё по шагам", context: "studies" },
      { label: "Я не справляюсь с нагрузкой", context: "studies" },
      { label: "Хочу начать с маленькой задачи", context: "studies" },
    ],
    talk: [
      { label: "Я расскажу подробнее", context: "talk" },
      { label: "Помоги понять мои чувства", context: "talk" },
      { label: "Мне нужен следующий шаг", context: "talk" },
    ],
  },
  kk: {
    initial: [
      { label: "Маған алаң болып тұр", context: "anxious" },
      { label: "Өзімді жалғыз сезінемін", context: "lonely" },
      { label: "Оқуда қиындық бар", context: "studies" },
      { label: "Жай ғана ішімдегіні айтқым келеді", context: "talk" },
    ],
    anxious: [
      { label: "Тынышталуыма көмектесші", context: "anxious" },
      { label: "Мені не алаңдататынын түсінгім келеді", context: "anxious" },
      { label: "Келесі бір сағатқа жоспар керек", context: "anxious" },
    ],
    lonely: [
      { label: "Не болып жатқанын айтып бергім келеді", context: "lonely" },
      { label: "Жақын адамыма жазуға көмектесші", context: "lonely" },
      { label: "Көмек сұрау маған қиын", context: "lonely" },
    ],
    studies: [
      { label: "Бәрін қадамдарға бөліп берші", context: "studies" },
      { label: "Жүктемеге шыдай алмай жүрмін", context: "studies" },
      { label: "Кішкентай тапсырмадан бастағым келеді", context: "studies" },
    ],
    talk: [
      { label: "Толығырақ айтып беремін", context: "talk" },
      { label: "Сезімдерімді түсінуге көмектесші", context: "talk" },
      { label: "Келесі қадам керек", context: "talk" },
    ],
  },
};

const storyCopy = {
  ru: {
    eyebrow: "КАК ЭТО РАБОТАЕТ",
    title: "Сначала слова. Потом становится понятнее.",
    lead: "Напиши одну фразу — даже если она обрывочная. В диалоге можно назвать главное и выбрать шаг, который подходит именно сейчас.",
    inputHint: "Напиши, что происходит…",
    typing: "FirstStep печатает",
    status: "сейчас на связи",
    stages: [
      { title: "Скажи, как есть", body: "Не нужно подбирать правильные слова.", user: "Мне тяжело, но я не понимаю почему.", assistant: "Слышу. Давай начнём с того, что сейчас давит сильнее всего.", action: "Назвать главное" },
      { title: "Один вопрос за раз", body: "Спокойно отделим главное от остального.", user: "Учёба и тревога навалились вместе.", assistant: "Что из этого прямо сейчас забирает больше сил?", action: "Один вопрос — один ответ" },
      { title: "Выбери посильный шаг", body: "Упражнение, короткое дело или контакт с близким.", user: "Хочу немного облегчить этот день.", assistant: "Тогда выберем маленький шаг без требований к себе.", action: "10 минут на себя" },
    ],
    note: "Сервис не ставит диагнозов и не заменяет специалиста. Если станет небезопасно, сразу обратись к близкому или в экстренную помощь.",
  },
  kk: {
    eyebrow: "ҚАЛАЙ ЖҰМЫС ІСТЕЙДІ",
    title: "Алдымен сөз. Сосын бәрі түсініктірек болады.",
    lead: "Бір сөйлемнен баста. Диалогта ең маңыздысын атап, дәл қазір қолайлы болатын бір қадамды таңдауға болады.",
    inputHint: "Не болып жатқанын жаза аласың…",
    typing: "FirstStep жауап дайындап жатыр",
    status: "қазір байланыста",
    stages: [
      { title: "Қалай бар, солай жаз", body: "Дұрыс сөздерді іздеудің қажеті жоқ.", user: "Маған қиын, бірақ неге екенін түсінбеймін.", assistant: "Түсіндім. Қазір ең қатты қысым жасап тұрғанынан бастайық.", action: "Ең маңыздысын атау" },
      { title: "Бір сұрақтан бастау", body: "Ең маңыздысын қалғанынан жайлап ажыратамыз.", user: "Оқу мен мазасыздық қатар келді.", assistant: "Екеуінің қайсысы дәл қазір көбірек күш алып тұр?", action: "Бір сұрақ — бір жауап" },
      { title: "Қолайлы қадам таңдау", body: "Жаттығу, қысқа іс немесе жақын адаммен байланыс.", user: "Бүгінгі күнді сәл жеңілдеткім келеді.", assistant: "Онда өзіңе талап қоймайтын кішкентай қадамды таңдайық.", action: "Өзіңе 10 минут" },
    ],
    note: "Қызмет диагноз қоймайды және маманды алмастырмайды. Қауіп төнсе, сенетін адамға немесе жедел көмекке бірден жүгін.",
  },
} as const;

function newSessionId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `anon-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function FirstStepApp() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "ru";
    try {
      const stored = window.localStorage.getItem("firststep-language");
      return stored === "kk" ? "kk" : "ru";
    } catch {
      return "ru";
    }
  });
  const [screen, setScreen] = useState<Screen>("landing");
  const [agreed, setAgreed] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [lastRisk, setLastRisk] = useState<RiskLevel | null>(null);
  const [intervention, setIntervention] = useState<InterventionType | null>(null);
  const [conversation, setConversation] = useState<ConversationContext | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const t = (key: keyof typeof copy.ru) => copy[language][key];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = (next: Language) => {
    setLanguage(next);
    window.localStorage.setItem("firststep-language", next);
  };

  const continueAnonymously = () => {
    if (!agreed) return;
    setSessionId(newSessionId());
    setMessages([{ role: "ai", content: t("greeting") }]);
    setConversation(null);
    setRetryMessage(null);
    setScreen("chat");
  };

  const sendMessage = async (message = input) => {
    const trimmed = message.trim();
    if (!trimmed || pending || !sessionId) return;
    setInput("");
    setRetryMessage(null);
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setPending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          sessionId,
          language,
          history: messages.slice(-6).map((item) => ({ role: item.role === "ai" ? "assistant" : "user", content: item.content })),
        }),
      });
      const payload = (await response.json()) as ChatResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Request failed");
      setMessages((current) => [...current, { role: "ai", content: payload.message }]);
      setLastRisk(payload.safety.riskLevel);
      setIntervention(payload.intervention?.type || null);
      setConversation(payload.conversation);
    } catch {
      setRetryMessage(trimmed);
      setMessages((current) => [
        ...current,
        {
          role: "ai",
          content: language === "kk"
            ? "Қазір жауапты жүктеу мүмкін болмады. Қайтадан байқап көр."
            : "Не удалось получить ответ. Попробуй ещё раз через несколько секунд.",
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  const restart = () => {
    setScreen("landing");
    setAgreed(false);
    setSessionId("");
    setMessages([]);
    setLastRisk(null);
    setIntervention(null);
    setConversation(null);
    setRetryMessage(null);
    setInput("");
  };

  return (
    <main className={`app-shell ${screen === "chat" ? "chat-mode" : ""}`}>
      <a className="skip-link" href="#main-content">{t("skipToContent")}</a>
      <header className="topbar">
        <button className="brand" onClick={restart} aria-label="FirstStep home">
          <span className="brand-mark"><FirstStepLogo size={30} /></span>
          <span>FirstStep</span>
        </button>
        <div className="language-switcher" aria-label="Language switcher">
          <button className={language === "ru" ? "active" : ""} onClick={() => changeLanguage("ru")}>RU</button>
          <span>/</span>
          <button className={language === "kk" ? "active" : ""} onClick={() => changeLanguage("kk")}>KZ</button>
        </div>
      </header>

      <div id="main-content">
        {screen === "landing" && <Landing language={language} t={t} onStart={() => setScreen("onboarding")} onSupport={() => setScreen("support")} />}
        {screen === "onboarding" && <Onboarding language={language} t={t} agreed={agreed} setAgreed={setAgreed} onContinue={continueAnonymously} onBack={() => setScreen("landing")} />}
        {screen === "support" && <Support language={language} t={t} onBack={() => setScreen(sessionId ? "chat" : "landing")} />}
        {screen === "chat" && <Chat language={language} t={t} messages={messages} input={input} setInput={setInput} pending={pending} sendMessage={sendMessage} riskLevel={lastRisk} intervention={intervention} setIntervention={setIntervention} conversation={conversation} retryMessage={retryMessage} onSupport={() => setScreen("support")} />}
      </div>
    </main>
  );
}

function Landing({ language, t, onStart, onSupport }: { language: Language; t: (key: keyof typeof copy.ru) => string; onStart: () => void; onSupport: () => void }) {
  const story = storyCopy[language];
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.05 },
    );

    visibilityObserver.observe(video);

    return () => {
      visibilityObserver.disconnect();
    };
  }, []);

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-particle-frames" aria-hidden="true">
          <div className="hero-particle-fallback" />
          <video
            ref={heroVideoRef}
            className="hero-generated-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/firststep-particle-frame-01.webp"
          >
            <source src="/firststep-liquid-glass-pingpong.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero-vignette" aria-hidden="true" />
        <div className="hero-inner section-wrap">
          <div className="hero-copy">
            <span className="eyebrow">{t("eyebrow")}</span>
            <h1>{t("hero")}</h1>
            <p className="hero-subtitle">{t("subtitle")}</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={onStart}>{t("start")} <ArrowRight size={17} /></button>
              <button className="text-button urgent-link" onClick={onSupport}><Phone size={14} /> {t("urgent")}</button>
            </div>
            <div className="privacy-note"><ShieldCheck size={16} /><span>{t("notice")}</span></div>
          </div>
        </div>
      </section>
      <LandingStory language={language} story={story} />
      <footer className="landing-footer section-wrap"><span>© 2026 FirstStep</span><nav aria-label={language === "ru" ? "Правовые документы" : "Құқықтық құжаттар"}><a href="/privacy">{t("privacyPolicy")}</a><a href="/terms">{t("termsOfUse")}</a></nav></footer>
    </div>
  );
}

function LandingStory({ language, story }: { language: Language; story: (typeof storyCopy)[Language] }) {
  const [activeStage, setActiveStage] = useState(0);
  const [messageState, setMessageState] = useState<0 | 1 | 2 | 3>(0);
  const storyRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = storyRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let intervalId: number | null = null;
    const stopRotation = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };
    const startRotation = () => {
      if (intervalId !== null) return;
      intervalId = window.setInterval(() => {
        setActiveStage((currentStage) => (currentStage + 1) % story.stages.length);
      }, 5200);
    };
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startRotation() : stopRotation()),
      { threshold: 0.28 },
    );
    observer.observe(section);
    return () => {
      stopRotation();
      observer.disconnect();
    };
  }, [story.stages.length]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resetTimer = window.setTimeout(() => setMessageState(0), 80);
    const userTimer = window.setTimeout(() => setMessageState(reducedMotion ? 3 : 1), reducedMotion ? 100 : 320);
    if (reducedMotion) {
      return () => {
        window.clearTimeout(resetTimer);
        window.clearTimeout(userTimer);
      };
    }
    const typingTimer = window.setTimeout(() => setMessageState(2), 1080);
    const answerTimer = window.setTimeout(() => setMessageState(3), 1880);
    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(userTimer);
      window.clearTimeout(typingTimer);
      window.clearTimeout(answerTimer);
    };
  }, [activeStage, language]);

  const current = story.stages[activeStage];
  return (
    <section ref={storyRef} className="story-section section-wrap" aria-labelledby="story-title">
      <div className="story-intro">
        <span className="eyebrow">{story.eyebrow}</span>
        <h2 id="story-title">{story.title}</h2>
        <p>{story.lead}</p>
        <div className="story-note"><ShieldCheck size={15} /><span>{story.note}</span></div>
      </div>
      <div className="story-column">
        <div className="story-visual" aria-live="polite" aria-label={`${story.status}: ${current.title}`}>
          <div className="story-visual-grid" />
          <div className="story-visual-orbit story-visual-orbit-one" />
          <div className="story-visual-orbit story-visual-orbit-two" />
          <div className="story-conversation">
            <div className="story-caption"><span>FirstStep / chat</span><span className="story-status"><i />{story.status}</span></div>
            <div className="story-thread">
              <div className="story-message-slot story-user-slot">
                <div className={`story-bubble story-bubble-user story-transition ${messageState >= 1 ? "is-visible" : ""}`}>{current.user}</div>
              </div>
              <div className="story-message-slot story-typing-slot">
                <div className={`story-bubble story-bubble-ai story-typing-bubble story-transition ${messageState === 2 ? "is-visible" : ""}`} aria-label={story.typing}>
                  <span className="story-typing-label">{story.typing}</span>
                  <span className="story-typing-dots" aria-hidden="true"><i /><i /><i /></span>
                </div>
              </div>
              <div className="story-message-slot story-ai-slot">
                <div className={`story-bubble story-bubble-ai story-transition ${messageState >= 3 ? "is-visible" : ""}`}>{current.assistant}</div>
              </div>
            </div>
            <div className="story-action-slot">
              <div className={`story-action story-transition ${messageState >= 3 ? "is-visible" : ""}`}><span>{current.action}</span><ArrowRight size={14} /></div>
            </div>
            <div className="story-composer"><span>{story.inputHint}</span><span className="story-composer-mark">↗</span></div>
          </div>
          <div className="story-ambient-dot" />
        </div>
        <div className="story-stage-list">
          {story.stages.map((stage, index) => (
            <button
              className={`story-stage ${activeStage === index ? "active" : ""}`}
              key={stage.title}
              onClick={() => setActiveStage(index)}
              type="button"
            >
              <span className="story-stage-number">0{index + 1}</span>
              <span><strong>{stage.title}</strong><small>{stage.body}</small></span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Onboarding({ language, t, agreed, setAgreed, onContinue, onBack }: { language: Language; t: (key: keyof typeof copy.ru) => string; agreed: boolean; setAgreed: (value: boolean) => void; onContinue: () => void; onBack: () => void }) {
  return (
    <div className="center-page">
      <div className="onboarding-card">
        <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> {t("onboardingBack")}</button>
        <div className="notice-icon"><ShieldCheck size={24} /></div>
        <span className="eyebrow">SAFETY FIRST</span>
        <h1>{t("onboardingTitle")}</h1>
        <p className="onboarding-lead">{t("onboardingLead")}</p>
        <p>{t("onboardingBody")}</p>
        <div className="notice-list"><span>• {t("onboardingPoint1")}</span><span>• {t("onboardingPoint2")}</span><span>• {t("onboardingPoint3")}</span></div>
        <div className="warning-box" role="note">
          <div className="warning-box-head"><span className="warning-box-icon"><ShieldAlert size={16} /></span><strong>{t("onboardingWarningTitle")}</strong></div>
          <p>{t("onboardingWarning")}</p>
          <div className="warning-box-actions"><span><Phone size={13} /> {t("emergencyServices")}</span><span><HeartHandshake size={13} /> {t("trustedPerson")}</span></div>
        </div>
        <nav className="legal-inline" aria-label={language === "ru" ? "Правовые документы" : "Құқықтық құжаттар"}><a href="/privacy">{t("privacyPolicy")}</a><span>·</span><a href="/terms">{t("termsOfUse")}</a></nav>
        <label className="check-row"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /><span className="custom-check"><Check size={12} /></span><span>{t("agree")}</span></label>
        <button className="primary-button full" disabled={!agreed} onClick={onContinue}>{t("continue")} <ArrowRight size={17} /></button>
      </div>
    </div>
  );
}

function Chat({ language, t, messages, input, setInput, pending, sendMessage, riskLevel, intervention, setIntervention, conversation, retryMessage, onSupport }: { language: Language; t: (key: keyof typeof copy.ru) => string; messages: ChatMessage[]; input: string; setInput: (value: string) => void; pending: boolean; sendMessage: (message?: string) => Promise<void>; riskLevel: RiskLevel | null; intervention: InterventionType | null; setIntervention: (value: InterventionType | null) => void; conversation: ConversationContext | null; retryMessage: string | null; onSupport: () => void }) {
  const [promptContext, setPromptContext] = useState<PromptContext>("initial");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const quickPrompts = promptSets[language][promptContext];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, pending, intervention]);

  return (
    <div className="chat-layout section-wrap">
      <section className="chat-panel">
        <div className="chat-heading"><div><span className="eyebrow">{t("chatTitle")}</span><h1>{t("anonymous")}</h1></div><button className="support-icon-button" onClick={onSupport} aria-label={t("urgent")}><Phone size={17} /></button></div>
        <div className="privacy-banner"><LockKeyhole size={14} /> {t("privacy")}</div>
        {conversation && conversation.topics.length > 0 && <aside className="context-map" aria-label={t("contextMap")}><span className="context-map-label"><Sparkles size={14} /> {t("contextMap")}</span><div className="context-topics">{conversation.topics.map((intent) => intentLabels[language][intent] && <span className={intent === conversation.primaryIntent ? "active" : ""} key={intent}>{intentLabels[language][intent]}</span>)}</div>{conversation.topicShift && <small>{t("contextShift")}</small>}</aside>}
        <div className="messages" aria-live="polite">
          {messages.map((message, index) => <div className={`message-row ${message.role}`} key={`${message.role}-${index}`}><div className="avatar">{message.role === "ai" ? <Sparkles size={14} /> : t("userLabel")}</div><div className="message-bubble">{message.content}</div></div>)}
          {pending && <div className="message-row ai"><div className="avatar"><Sparkles size={14} /></div><div className="message-bubble typing"><i /><i /><i /></div></div>}
          {riskLevel === "HIGH" && <button className="escalation-inline" onClick={onSupport}><span><Phone size={15} /> {t("highRisk")}</span><ChevronRight size={16} /></button>}
          {intervention && <InterventionCard type={intervention} t={t} onClose={() => setIntervention(null)} />}
          {retryMessage && !pending && <button className="retry-inline" onClick={() => void sendMessage(retryMessage)}><RotateCcw size={15} /> {t("retry")}</button>}
          <div ref={messagesEndRef} />
        </div>
        <div className="quick-prompts" aria-label={language === "ru" ? "Быстрые ответы" : "Жылдам жауаптар"}>
          {quickPrompts.map((prompt) => <button key={prompt.label} onClick={() => { setPromptContext(prompt.context); void sendMessage(prompt.label); }} disabled={pending}>{prompt.label}</button>)}
          {promptContext !== "initial" && <button className="quick-prompts-reset" onClick={() => setPromptContext("initial")} disabled={pending}>{t("otherTopics")}</button>}
        </div>
        <form className="composer" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void sendMessage(); } }} placeholder={t("placeholder")} rows={1} maxLength={2000} disabled={pending} aria-label={t("placeholder")} /><button className="send-button" type="submit" disabled={!input.trim() || pending} aria-label={t("send")}><ArrowRight size={18} /></button></form>
        <div className="composer-foot"><span>⟡ {2000 - input.length}</span><span>{t("composerSafety")}</span></div>
      </section>
    </div>
  );
}

function InterventionCard({ type, t, onClose }: { type: InterventionType; t: (key: keyof typeof copy.ru) => string; onClose: () => void }) {
  const data: Record<InterventionType, { title: string; text: string }> = {
    BREATHING: { title: t("breathing"), text: t("breathingText") },
    GROUNDING: { title: t("grounding"), text: t("groundingText") },
    NEXT_STEP: { title: t("nextStep"), text: t("nextStepText") },
    REACH_OUT: { title: t("reachOut"), text: t("reachOutText") },
    REFLECTION: { title: t("reflection"), text: t("reflectionText") },
  };
  const item = data[type];
  return <div className="intervention-card"><div className="intervention-top"><span className="intervention-tag">{t("interventionTag")}</span><button onClick={onClose} className="close-button" aria-label={t("skip")}>×</button></div><h3>{item.title}</h3><p>{item.text}</p>{type === "BREATHING" ? <BreathingExercise t={t} /> : type === "NEXT_STEP" ? <FocusSprint t={t} /> : <button className="secondary-button" onClick={onClose}>{t("skip")} <Check size={15} /></button>}</div>;
}

function FocusSprint({ t }: { t: (key: keyof typeof copy.ru) => string }) {
  const [task, setTask] = useState("");
  const [seconds, setSeconds] = useState(15 * 60);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          setActive(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  const reset = () => {
    setActive(false);
    setSeconds(15 * 60);
  };
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return <div className="focus-sprint"><label htmlFor="focus-task">{t("focusTaskLabel")}</label><input id="focus-task" value={task} onChange={(event) => setTask(event.target.value)} placeholder={t("focusTaskPlaceholder")} maxLength={90} /><div className="focus-sprint-controls"><strong aria-live="polite">{time}</strong><button className="secondary-button" disabled={!task.trim()} onClick={() => { if (seconds === 0) setSeconds(15 * 60); setActive((value) => !value); }}>{active ? t("focusPause") : seconds < 15 * 60 && seconds > 0 ? t("focusResume") : t("focusStart")}</button>{seconds < 15 * 60 && <button className="focus-reset" onClick={reset}><RotateCcw size={14} /> {t("focusReset")}</button>}</div>{seconds === 0 && <p className="focus-complete"><Check size={15} /> {t("focusComplete")}</p>}<small>{t("focusPrivacy")}</small></div>;
}

function BreathingExercise({ t }: { t: (key: keyof typeof copy.ru) => string }) {
  const [active, setActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [seconds, setSeconds] = useState(breathingPhases[0].seconds);
  const [totalSeconds, setTotalSeconds] = useState(60);
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setTotalSeconds((value) => {
        if (value <= 1) {
          setActive(false);
          setPhaseIndex(0);
          setSeconds(breathingPhases[0].seconds);
          return 60;
        }
        return value - 1;
      });
      setSeconds((value) => {
        if (value <= 1) {
          setPhaseIndex((index) => (index + 1) % breathingPhases.length);
          return breathingPhases[(phaseIndex + 1) % breathingPhases.length].seconds;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active, phaseIndex]);
  const phase = breathingPhases[phaseIndex];
  return <div className="breathing-widget"><button className={`breath-circle ${active ? "breathing" : ""}`} onClick={() => { setTotalSeconds(60); setActive(true); }}><span>{active ? seconds : totalSeconds}</span><small>{active ? t(phase.key) : t("tryExercise")}</small></button><div className="breath-controls">{active && <button onClick={() => { setActive(false); setPhaseIndex(0); setSeconds(4); setTotalSeconds(60); }}><RotateCcw size={13} /> {t("skip")}</button>}<span>{t("breathPattern")}</span></div></div>;
}

function Support({ language, t, onBack }: { language: Language; t: (key: keyof typeof copy.ru) => string; onBack: () => void }) {
  const trustedMessage = t("trustedMessage");
  return <div className="support-page section-wrap"><button className="back-link" onClick={onBack}><ArrowLeft size={15} /> {t("back")}</button><div className="support-hero"><div className="support-icon"><HeartHandshake size={28} /></div><span className="eyebrow">HUMAN SUPPORT</span><h1>{t("supportTitle")}</h1><p>{t("supportLead")}</p></div><div className="support-actions"><a className="support-action" href={`sms:?body=${encodeURIComponent(trustedMessage)}`}><span className="support-action-icon"><MessageCircle size={18} /></span><span><b>{t("trusted")}</b><small>{trustedMessage}</small></span><ChevronRight size={17} /></a><a className="support-action" href="tel:111"><span className="support-action-icon"><Phone size={18} /></span><span><b>{t("resources")}</b><small>{t("resourcesHint")}</small></span><ChevronRight size={17} /></a><a className="support-action danger-action" href="tel:112"><span className="support-action-icon"><ShieldCheck size={18} /></span><span><b>{t("danger")}</b><small>{t("dangerHint")}</small></span><ChevronRight size={17} /></a></div><div className="resource-list"><h2>{t("resourceListTitle")}</h2>{supportResources.map((resource) => <div className="resource-row" key={resource.id}><div><b>{resource.title[language]}</b><p>{resource.description[language]}</p><a className="resource-source" href={resource.sourceHref} target="_blank" rel="noreferrer">{t("officialSource")}</a></div><a className="resource-contact" href={resource.href}>{resource.contact}</a></div>)}</div></div>;
}
