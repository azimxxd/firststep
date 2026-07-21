"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, CircleHelp, Download, HeartHandshake,
  Eye, ListTodo, LockKeyhole, MessageCircle, Phone, RotateCcw, ShieldCheck, Sparkles,
  ShieldAlert, Timer, Wind,
} from "lucide-react";
import { supportResources } from "@/config/supportResources";
import type { ChatResponse, ConversationContext, Intent, InterventionType, Language, RiskLevel } from "@/types/safety";
import { FirstStepLogo } from "@/components/FirstStepLogo";

type Screen = "landing" | "onboarding" | "chat" | "support";
type ChatMessage = { role: "ai" | "user"; content: string };
const CLIENT_CHAT_TIMEOUT_MS = 20_000;

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
    supportTitle: "Помощь рядом",
    supportLead: "Не нужно объяснять всё идеально. Выбери один способ, который подходит тебе прямо сейчас.",
    trusted: "Написать человеку, которому я доверяю",
    trustedHint: "Откроется готовое сообщение — его можно изменить перед отправкой.",
    resources: "Посмотреть доступные линии помощи",
    danger: "Мне сейчас угрожает непосредственная опасность",
    back: "Назад к разговору",
    highRisk: "Похоже, тебе сейчас может быть очень тяжело. Не оставайся с этим в одиночку.",
    breathing: "60 секунд мягкого дыхания",
    breathingText: "Попробуй следовать ритму, если тебе комфортно. Это не лечение — только короткая пауза для внимания к себе.",
    breathLong: "Длинный выдох",
    breathLongPattern: "вдох 4 · выдох 6",
    breathBox: "Ровный квадрат",
    breathBoxPattern: "вдох 4 · пауза 4 · выдох 4 · пауза 4",
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
    studyReset: "Разгрузка 3–2–1",
    studyResetText: "Выгрузи мысли из головы: три дела, два дела, которые могут подождать, и одно действие на ближайшие пять минут.",
    studyResetThree: "3 дела, которые давят",
    studyResetTwo: "2 дела могут подождать",
    studyResetOne: "1 действие на пять минут",
    studyResetPlaceholder: "Коротко, своими словами",
    studyResetReady: "План готов. Начни только с последней строки — остальное пока не нужно решать.",
    exercisePrivacy: "Записи остаются только в этой вкладке.",
    screenBreak: "Перезагрузка 20–20–20",
    screenBreakText: "Отведи взгляд от экрана на предмет вдали примерно на 20 секунд и мягко расслабь плечи.",
    screenBreakStart: "Начать 20 секунд",
    screenBreakPause: "Пауза",
    screenBreakResume: "Продолжить",
    screenBreakDone: "Готово. Теперь вернись только к одному небольшому действию.",
    firstStepsOpen: "Выбрать первый шаг",
    firstStepsClose: "Скрыть варианты",
    firstStepsTitle: "Что поможет прямо сейчас?",
    firstStepsLead: "Можно выбрать упражнение самому — без нового сообщения и ожидания ответа.",
    firstStepCalm: "Снизить напряжение",
    firstStepCalmHint: "два ритма дыхания",
    firstStepFocus: "Вернуть фокус",
    firstStepFocusHint: "спринт на 15 минут",
    firstStepUnload: "Разгрузить голову",
    firstStepUnloadHint: "план 3–2–1",
    firstStepEyes: "Отдохнуть от экрана",
    firstStepEyesHint: "пауза 20–20–20",
    available: "доступно",
    needsSetup: "нужно настроить",
    otherTopics: "Другие темы",
    userLabel: "ты",
    composerSafety: "сообщение не сохраняется приложением",
    interventionTag: "ОДИН МАЛЕНЬКИЙ ШАГ",
    trustedMessage: "Мне сейчас непросто. Можешь побыть на связи?",
    resourcesHint: "Круглосуточная конфиденциальная помощь: 111",
    dangerHint: "При непосредственной опасности звони 112",
    resourceListTitle: "Куда обратиться в Казахстане",
    resourceListHint: "Звонок может стать первым шагом. Можно начать с фразы: «Мне нужна помощь, и я не знаю, как об этом рассказать».",
    officialSource: "официальный источник",
    call: "Позвонить",
    whatsapp: "Написать в WhatsApp",
    resourcesVerified: "Контакты проверены 21 июля 2026 года",
    supportFallback: "Если один номер не отвечает, попробуй другой или сразу обратись к взрослому рядом, которому доверяешь.",
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
    downloadChat: "Скачать переписку",
    chatDownloaded: "Переписка скачана на устройство",
    chatFileTitle: "сохранённая переписка",
    savedAt: "Сохранено",
    assistantLabel: "FirstStep",
    downloadPrivacy: "Файл создан только на этом устройстве. В нём нет session ID и технических данных.",
    privacyPolicy: "Конфиденциальность",
    termsOfUse: "Условия использования",
    skipToContent: "Перейти к содержанию",
    tourOpen: "Показать обучение",
    tourTitle: "Как пользоваться чатом",
    tourStep: "Шаг",
    tourSkip: "Пропустить обучение",
    tourBack: "Назад",
    tourNext: "Далее",
    tourDone: "Понятно, начать",
    tourPromptsTitle: "Можно начать без долгих объяснений",
    tourPromptsText: "Выбери готовую тему — она отправится как первое сообщение и поможет задать направление разговору.",
    tourPromptsActiveText: "Быстрые темы остаются доступны и после начала разговора — они помогают спокойно сменить направление.",
    tourComposerTitle: "Или напиши своими словами",
    tourComposerText: "Опиши ситуацию в поле внизу. Стрелка отправляет сообщение, Enter тоже отправляет, а Shift + Enter переносит строку.",
    tourToolkitTitle: "Первый шаг можно выбрать самому",
    tourToolkitText: "Здесь доступны дыхание, фокус-спринт, разгрузка 3–2–1 и пауза для глаз — они работают прямо в браузере.",
    tourDownloadTitle: "Сохрани разговор, если нужно",
    tourDownloadText: "Кнопка со стрелкой вниз скачивает переписку в TXT только на твоё устройство — без session ID и технических данных.",
    tourSupportTitle: "Помощь человека всегда рядом",
    tourSupportText: "Кнопка с телефоном открывает проверенные контакты Казахстана и готовое сообщение человеку, которому ты доверяешь.",
    loadingResponse: "FirstStep готовит ответ",
    cancelResponse: "Остановить ожидание",
    requestCancelled: "Ожидание остановлено. Сообщение можно отправить ещё раз.",
    requestTimedOut: "Ответ занял больше 20 секунд. Попробуй отправить сообщение ещё раз.",
    requestFailed: "Не удалось получить ответ. Попробуй ещё раз через несколько секунд.",
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
    supportTitle: "Көмек қасыңда",
    supportLead: "Бәрін мінсіз түсіндірудің қажеті жоқ. Дәл қазір саған сәйкес келетін бір жолды таңда.",
    trusted: "Сенетін адамыма жазу",
    trustedHint: "Дайын хабарлама ашылады — жібермес бұрын оны өзгертуге болады.",
    resources: "Қолжетімді көмек желілерін көру",
    danger: "Маған дәл қазір тікелей қауіп төніп тұр",
    back: "Әңгімеге оралу",
    highRisk: "Қазір саған өте ауыр болуы мүмкін. Мұны жалғыз көтерме.",
    breathing: "60 секунд жұмсақ тыныс алу",
    breathingText: "Ыңғайлы болса, ырғаққа еріп көр. Бұл ем емес — өзіңе назар аударуға арналған қысқа үзіліс.",
    breathLong: "Ұзақ дем шығару",
    breathLongPattern: "дем алу 4 · дем шығару 6",
    breathBox: "Біркелкі шаршы",
    breathBoxPattern: "дем алу 4 · үзіліс 4 · дем шығару 4 · үзіліс 4",
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
    studyReset: "3–2–1 жеңілдету",
    studyResetText: "Ойыңдағыны түсір: қысым жасап тұрған үш іс, күте алатын екі іс және келесі бес минуттағы бір әрекет.",
    studyResetThree: "Қысым жасап тұрған 3 іс",
    studyResetTwo: "Күте алатын 2 іс",
    studyResetOne: "Бес минутқа 1 әрекет",
    studyResetPlaceholder: "Қысқа, өз сөзіңмен",
    studyResetReady: "Жоспар дайын. Тек соңғы жолдан баста — қалғанын әзірге шешудің қажеті жоқ.",
    exercisePrivacy: "Жазбалар тек осы бетте қалады.",
    screenBreak: "20–20–20 үзілісі",
    screenBreakText: "Экраннан көзді алыстатып, шамамен 20 секунд алыс нысанға қара және иығыңды жайлап босат.",
    screenBreakStart: "20 секундты бастау",
    screenBreakPause: "Үзіліс",
    screenBreakResume: "Жалғастыру",
    screenBreakDone: "Дайын. Енді тек бір шағын әрекетке орал.",
    firstStepsOpen: "Бірінші қадамды таңдау",
    firstStepsClose: "Нұсқаларды жасыру",
    firstStepsTitle: "Дәл қазір не көмектеседі?",
    firstStepsLead: "Жаңа хабарлама жібермей және жауап күтпей, жаттығуды өзің таңдай аласың.",
    firstStepCalm: "Кернеуді азайту",
    firstStepCalmHint: "екі тыныс ырғағы",
    firstStepFocus: "Назарды қайтару",
    firstStepFocusHint: "15 минуттық спринт",
    firstStepUnload: "Ойды жеңілдету",
    firstStepUnloadHint: "3–2–1 жоспары",
    firstStepEyes: "Экраннан демалу",
    firstStepEyesHint: "20–20–20 үзілісі",
    available: "қолжетімді",
    needsSetup: "орнату қажет",
    otherTopics: "Басқа тақырыптар",
    userLabel: "сен",
    composerSafety: "хабарлама қолданбада сақталмайды",
    interventionTag: "БІР КІШКЕНТАЙ ҚАДАМ",
    trustedMessage: "Маған қазір қиын. Біраз байланыста бола аласың ба?",
    resourcesHint: "Тәулік бойы құпия көмек: 111",
    dangerHint: "Тікелей қауіп болса, 112 нөміріне қоңырау шал",
    resourceListTitle: "Қазақстанда қайда хабарласуға болады",
    resourceListHint: "Қоңырау алғашқы қадам бола алады. «Маған көмек керек, бірақ қалай айту керегін білмеймін» деп бастауға болады.",
    officialSource: "ресми дереккөз",
    call: "Қоңырау шалу",
    whatsapp: "WhatsApp-қа жазу",
    resourcesVerified: "Байланыстар 2026 жылғы 21 шілдеде тексерілді",
    supportFallback: "Бір нөмір жауап бермесе, басқасына хабарлас немесе қасыңдағы сенетін ересек адамға бірден айт.",
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
    downloadChat: "Әңгімені жүктеп алу",
    chatDownloaded: "Әңгіме құрылғыға жүктелді",
    chatFileTitle: "сақталған әңгіме",
    savedAt: "Сақталған уақыт",
    assistantLabel: "FirstStep",
    downloadPrivacy: "Файл тек осы құрылғыда жасалды. Онда session ID немесе техникалық деректер жоқ.",
    privacyPolicy: "Құпиялылық",
    termsOfUse: "Пайдалану шарттары",
    skipToContent: "Негізгі мазмұнға өту",
    tourOpen: "Нұсқаулықты көрсету",
    tourTitle: "Чатты қалай пайдалануға болады",
    tourStep: "Қадам",
    tourSkip: "Нұсқаулықты өткізу",
    tourBack: "Артқа",
    tourNext: "Келесі",
    tourDone: "Түсінікті, бастау",
    tourPromptsTitle: "Ұзақ түсіндірмей бастауға болады",
    tourPromptsText: "Дайын тақырыпты таңда — ол алғашқы хабарлама ретінде жіберіліп, әңгімеге бағыт береді.",
    tourPromptsActiveText: "Жылдам тақырыптар әңгіме басталғаннан кейін де қолжетімді — олар бағытты жайлап өзгертуге көмектеседі.",
    tourComposerTitle: "Немесе өз сөзіңмен жаз",
    tourComposerText: "Төмендегі өріске жағдайды жаз. Көрсеткі хабарламаны жібереді, Enter де жібереді, ал Shift + Enter жаңа жол ашады.",
    tourToolkitTitle: "Бірінші қадамды өзің таңдай аласың",
    tourToolkitText: "Мұнда тыныс алу, фокус-спринт, 3–2–1 жеңілдету және көзге арналған үзіліс бар — бәрі браузерде жұмыс істейді.",
    tourDownloadTitle: "Қажет болса, әңгімені сақта",
    tourDownloadText: "Төмен бағытталған көрсеткі әңгімені TXT түрінде тек құрылғыңа жүктейді — session ID мен техникалық деректерсіз.",
    tourSupportTitle: "Адам көмегі әрқашан жақын",
    tourSupportText: "Телефон батырмасы Қазақстандағы тексерілген байланыстарды және сенетін адамға арналған дайын хабарламаны ашады.",
    loadingResponse: "FirstStep жауап дайындап жатыр",
    cancelResponse: "Күтуді тоқтату",
    requestCancelled: "Күту тоқтатылды. Хабарламаны қайта жіберуге болады.",
    requestTimedOut: "Жауап 20 секундтан ұзаққа созылды. Хабарламаны қайта жіберіп көр.",
    requestFailed: "Қазір жауапты жүктеу мүмкін болмады. Бірнеше секундтан кейін қайта байқап көр.",
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

type PromptContext = "initial" | "anxious" | "lonely" | "studies" | "talk";
type QuickPrompt = { label: string; context: PromptContext };
type BreathingPattern = "long" | "box";

const breathingPatternPhases = {
  long: [
    { key: "inhale" as const, seconds: 4 },
    { key: "exhale" as const, seconds: 6 },
  ],
  box: [
    { key: "inhale" as const, seconds: 4 },
    { key: "hold" as const, seconds: 4 },
    { key: "exhale" as const, seconds: 4 },
    { key: "hold" as const, seconds: 4 },
  ],
} as const;

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
  const activeRequestRef = useRef<AbortController | null>(null);
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
    if (!trimmed || pending || activeRequestRef.current || !sessionId) return;
    const controller = new AbortController();
    activeRequestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort("timeout"), CLIENT_CHAT_TIMEOUT_MS);
    setInput("");
    setRetryMessage(null);
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setPending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        signal: controller.signal,
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
      if (activeRequestRef.current !== controller) return;
      setRetryMessage(trimmed);
      const errorMessage = controller.signal.reason === "user"
        ? t("requestCancelled")
        : controller.signal.reason === "timeout"
          ? t("requestTimedOut")
          : t("requestFailed");
      setMessages((current) => [
        ...current,
        {
          role: "ai",
          content: errorMessage,
        },
      ]);
    } finally {
      window.clearTimeout(timeout);
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
        setPending(false);
      }
    }
  };

  const cancelRequest = () => activeRequestRef.current?.abort("user");

  const restart = () => {
    activeRequestRef.current?.abort("user");
    activeRequestRef.current = null;
    setPending(false);
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
        {screen === "chat" && <Chat language={language} t={t} messages={messages} input={input} setInput={setInput} pending={pending} sendMessage={sendMessage} cancelRequest={cancelRequest} riskLevel={lastRisk} intervention={intervention} setIntervention={setIntervention} conversation={conversation} retryMessage={retryMessage} onSupport={() => setScreen("support")} />}
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
            <source src="/firststep-liquid-glass.mp4" type="video/mp4" />
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

function Chat({ language, t, messages, input, setInput, pending, sendMessage, cancelRequest, riskLevel, intervention, setIntervention, conversation, retryMessage, onSupport }: { language: Language; t: (key: keyof typeof copy.ru) => string; messages: ChatMessage[]; input: string; setInput: (value: string) => void; pending: boolean; sendMessage: (message?: string) => Promise<void>; cancelRequest: () => void; riskLevel: RiskLevel | null; intervention: InterventionType | null; setIntervention: (value: InterventionType | null) => void; conversation: ConversationContext | null; retryMessage: string | null; onSupport: () => void }) {
  const [promptContext, setPromptContext] = useState<PromptContext>("initial");
  const [downloaded, setDownloaded] = useState(false);
  const [firstStepPickerOpen, setFirstStepPickerOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem("firststep-product-tour-v1") !== "done";
    } catch {
      return true;
    }
  });
  const [tourStep, setTourStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const downloadStatusTimerRef = useRef<number | null>(null);
  const tourDialogRef = useRef<HTMLElement | null>(null);
  const tourOriginScrollRef = useRef(0);
  const quickPrompts = promptSets[language][promptContext];
  const tourSteps = [
    { target: "prompts", title: t("tourPromptsTitle"), text: messages.length > 1 ? t("tourPromptsActiveText") : t("tourPromptsText") },
    { target: "toolkit", title: t("tourToolkitTitle"), text: t("tourToolkitText") },
    { target: "composer", title: t("tourComposerTitle"), text: t("tourComposerText") },
    { target: "download", title: t("tourDownloadTitle"), text: t("tourDownloadText") },
    { target: "support", title: t("tourSupportTitle"), text: t("tourSupportText") },
  ] as const;
  const activeTourStep = tourSteps[tourStep];

  useEffect(() => {
    if (tourOpen) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, pending, intervention, tourOpen]);

  useEffect(() => () => {
    if (downloadStatusTimerRef.current) window.clearTimeout(downloadStatusTimerRef.current);
  }, []);

  useEffect(() => {
    if (!tourOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        try { window.localStorage.setItem("firststep-product-tour-v1", "done"); } catch { /* localStorage may be unavailable */ }
        setTourOpen(false);
        const top = tourOriginScrollRef.current;
        window.requestAnimationFrame(() => window.scrollTo({
          top,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        }));
        return;
      }
      if (event.key !== "Tab") return;
      const controls = tourDialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])");
      if (!controls?.length) return;
      const first = controls.item(0);
      const last = controls.item(controls.length - 1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    tourDialogRef.current?.focus();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      previousFocus?.focus();
    };
  }, [tourOpen]);

  useEffect(() => {
    if (!tourOpen) return;
    const frame = window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(`[data-tour-target="${activeTourStep.target}"]`);
      target?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: activeTourStep.target === "download" || activeTourStep.target === "support" ? "start" : "end",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeTourStep.target, tourOpen]);

  const openTour = () => {
    tourOriginScrollRef.current = window.scrollY;
    setTourStep(0);
    setTourOpen(true);
  };

  const closeTour = () => {
    try { window.localStorage.setItem("firststep-product-tour-v1", "done"); } catch { /* localStorage may be unavailable */ }
    setTourOpen(false);
    const top = tourOriginScrollRef.current;
    window.requestAnimationFrame(() => window.scrollTo({
      top,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    }));
  };

  const tourClass = (target: (typeof tourSteps)[number]["target"]) => tourOpen && activeTourStep.target === target ? " tour-target" : "";

  const downloadChat = () => {
    const savedAt = new Date();
    const locale = language === "kk" ? "kk-KZ" : "ru-RU";
    const transcript = messages.map((message) => {
      const speaker = message.role === "ai" ? t("assistantLabel") : t("userLabel");
      return `${speaker}\n${message.content}`;
    }).join("\n\n");
    const fileContent = [
      `FirstStep — ${t("chatFileTitle")}`,
      `${t("savedAt")}: ${new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" }).format(savedAt)}`,
      t("downloadPrivacy"),
      "────────────────────",
      transcript,
    ].join("\n\n");
    const blobUrl = URL.createObjectURL(new Blob(["\uFEFF", fileContent], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `firststep-chat-${savedAt.toISOString().slice(0, 16).replace(/[T:]/g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
    setDownloaded(true);
    if (downloadStatusTimerRef.current) window.clearTimeout(downloadStatusTimerRef.current);
    downloadStatusTimerRef.current = window.setTimeout(() => setDownloaded(false), 2600);
  };

  return (
    <div className="chat-layout section-wrap">
      <section className="chat-panel">
        <div className="chat-heading"><div><span className="eyebrow">{t("chatTitle")}</span><h1>{t("anonymous")}</h1></div><div className="chat-header-actions"><button className="support-icon-button tour-help-button" onClick={openTour} aria-label={t("tourOpen")} title={t("tourOpen")}><CircleHelp size={17} /></button><button data-tour-target="download" className={`support-icon-button ${downloaded ? "downloaded" : ""}${tourClass("download")}`} onClick={downloadChat} aria-label={t("downloadChat")} title={t("downloadChat")}>{downloaded ? <Check size={17} /> : <Download size={17} />}</button><button data-tour-target="support" className={`support-icon-button${tourClass("support")}`} onClick={onSupport} aria-label={t("urgent")} title={t("urgent")}><Phone size={17} /></button></div></div>
        <span className="sr-only" role="status" aria-live="polite">{downloaded ? t("chatDownloaded") : ""}</span>
        <div className="privacy-banner"><LockKeyhole size={14} /> {t("privacy")}</div>
        {conversation && conversation.topics.length > 0 && <aside className="context-map" aria-label={t("contextMap")}><span className="context-map-label"><Sparkles size={14} /> {t("contextMap")}</span><div className="context-topics">{conversation.topics.map((intent) => intentLabels[language][intent] && <span className={intent === conversation.primaryIntent ? "active" : ""} key={intent}>{intentLabels[language][intent]}</span>)}</div>{conversation.topicShift && <small>{t("contextShift")}</small>}</aside>}
        <div className="messages" aria-live="polite">
          {messages.map((message, index) => <div className={`message-row ${message.role}`} key={`${message.role}-${index}`}><div className="avatar">{message.role === "ai" ? <Sparkles size={14} /> : t("userLabel")}</div><div className="message-bubble">{message.content}</div></div>)}
          {pending && <div className="message-row ai"><div className="avatar"><Sparkles size={14} /></div><div className="message-bubble pending-bubble"><span className="typing-dots" role="status" aria-label={t("loadingResponse")}><i /><i /><i /></span><button type="button" className="cancel-request" onClick={cancelRequest}>{t("cancelResponse")}</button></div></div>}
          {riskLevel === "HIGH" && <button className="escalation-inline" onClick={onSupport}><span><Phone size={15} /> {t("highRisk")}</span><ChevronRight size={16} /></button>}
          {intervention && <InterventionCard type={intervention} t={t} onClose={() => setIntervention(null)} />}
          {retryMessage && !pending && <button className="retry-inline" onClick={() => void sendMessage(retryMessage)}><RotateCcw size={15} /> {t("retry")}</button>}
          <div ref={messagesEndRef} />
        </div>
        <div data-tour-target="prompts" className={`quick-prompts${tourClass("prompts")}`} aria-label={language === "ru" ? "Быстрые ответы" : "Жылдам жауаптар"}>
          {quickPrompts.map((prompt) => <button key={prompt.label} onClick={() => { setPromptContext(prompt.context); void sendMessage(prompt.label); }} disabled={pending}>{prompt.label}</button>)}
          {promptContext !== "initial" && <button className="quick-prompts-reset" onClick={() => setPromptContext("initial")} disabled={pending}>{t("otherTopics")}</button>}
        </div>
        <FirstStepPicker open={firstStepPickerOpen} onToggle={() => setFirstStepPickerOpen((value) => !value)} onSelect={(type) => { setIntervention(type); setFirstStepPickerOpen(false); }} disabled={pending} t={t} tourClass={tourClass("toolkit")} />
        <form data-tour-target="composer" className={`composer${tourClass("composer")}`} onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void sendMessage(); } }} placeholder={t("placeholder")} rows={1} maxLength={2000} disabled={pending} aria-label={t("placeholder")} /><button className="send-button" type="submit" disabled={!input.trim() || pending} aria-label={t("send")}><ArrowRight size={18} /></button></form>
        <div className="composer-foot"><span>⟡ {2000 - input.length}</span><span>{t("composerSafety")}</span></div>
        {tourOpen && typeof document !== "undefined" && createPortal(<><div className="tour-backdrop" aria-hidden="true" /><section ref={tourDialogRef} className={`product-tour tour-dialog-${activeTourStep.target}`} role="dialog" aria-modal="true" aria-labelledby="product-tour-title" aria-describedby="product-tour-description" tabIndex={-1}><div className="tour-topline"><span>{t("tourStep")} {tourStep + 1} / {tourSteps.length}</span><button type="button" onClick={closeTour}>{t("tourSkip")}</button></div><div className="tour-icon" aria-hidden="true"><CircleHelp size={20} /></div><span className="tour-eyebrow">{t("tourTitle")}</span><h2 id="product-tour-title">{activeTourStep.title}</h2><p id="product-tour-description" aria-live="polite">{activeTourStep.text}</p><div className="tour-progress" aria-hidden="true">{tourSteps.map((step, index) => <span className={index === tourStep ? "active" : ""} key={step.target} />)}</div><div className="tour-actions">{tourStep > 0 && <button type="button" className="secondary-button" onClick={() => setTourStep((value) => value - 1)}><ArrowLeft size={15} /> {t("tourBack")}</button>}<button type="button" className="primary-button" onClick={() => { if (tourStep === tourSteps.length - 1) closeTour(); else setTourStep((value) => value + 1); }}>{tourStep === tourSteps.length - 1 ? t("tourDone") : t("tourNext")} {tourStep < tourSteps.length - 1 && <ArrowRight size={15} />}</button></div></section></>, document.body)}
      </section>
    </div>
  );
}

function FirstStepPicker({ open, onToggle, onSelect, disabled, t, tourClass }: { open: boolean; onToggle: () => void; onSelect: (type: InterventionType) => void; disabled: boolean; t: (key: keyof typeof copy.ru) => string; tourClass: string }) {
  const options: Array<{ type: InterventionType; title: string; hint: string; icon: React.ReactNode }> = [
    { type: "BREATHING", title: t("firstStepCalm"), hint: t("firstStepCalmHint"), icon: <Wind size={16} /> },
    { type: "NEXT_STEP", title: t("firstStepFocus"), hint: t("firstStepFocusHint"), icon: <Timer size={16} /> },
    { type: "STUDY_RESET", title: t("firstStepUnload"), hint: t("firstStepUnloadHint"), icon: <ListTodo size={16} /> },
    { type: "SCREEN_BREAK", title: t("firstStepEyes"), hint: t("firstStepEyesHint"), icon: <Eye size={16} /> },
  ];

  return <section data-tour-target="toolkit" className={`first-step-picker${open ? " open" : ""}${tourClass}`} aria-labelledby="first-step-picker-title"><button type="button" className="first-step-picker-toggle" onClick={onToggle} disabled={disabled} aria-expanded={open}><span><Sparkles size={15} /> {open ? t("firstStepsClose") : t("firstStepsOpen")}</span><ChevronRight size={16} /></button>{open && <div className="first-step-picker-body"><div><h2 id="first-step-picker-title">{t("firstStepsTitle")}</h2><p>{t("firstStepsLead")}</p></div><div className="first-step-options">{options.map((option) => <button type="button" key={option.type} onClick={() => onSelect(option.type)}><span className="first-step-option-icon">{option.icon}</span><span><b>{option.title}</b><small>{option.hint}</small></span><ArrowRight size={15} /></button>)}</div></div>}</section>;
}

function InterventionCard({ type, t, onClose }: { type: InterventionType; t: (key: keyof typeof copy.ru) => string; onClose: () => void }) {
  const data: Record<InterventionType, { title: string; text: string }> = {
    BREATHING: { title: t("breathing"), text: t("breathingText") },
    GROUNDING: { title: t("grounding"), text: t("groundingText") },
    NEXT_STEP: { title: t("nextStep"), text: t("nextStepText") },
    STUDY_RESET: { title: t("studyReset"), text: t("studyResetText") },
    SCREEN_BREAK: { title: t("screenBreak"), text: t("screenBreakText") },
    REACH_OUT: { title: t("reachOut"), text: t("reachOutText") },
    REFLECTION: { title: t("reflection"), text: t("reflectionText") },
  };
  const item = data[type];
  return <div className="intervention-card"><div className="intervention-top"><span className="intervention-tag">{t("interventionTag")}</span><button onClick={onClose} className="close-button" aria-label={t("skip")}>×</button></div><h3>{item.title}</h3><p>{item.text}</p>{type === "BREATHING" ? <BreathingExercise t={t} /> : type === "NEXT_STEP" ? <FocusSprint t={t} /> : type === "STUDY_RESET" ? <StudyReset t={t} /> : type === "SCREEN_BREAK" ? <ScreenBreak t={t} /> : <button className="secondary-button" onClick={onClose}>{t("skip")} <Check size={15} /></button>}</div>;
}

function StudyReset({ t }: { t: (key: keyof typeof copy.ru) => string }) {
  const [entries, setEntries] = useState(["", "", ""]);
  const labels = [t("studyResetThree"), t("studyResetTwo"), t("studyResetOne")];
  const ready = entries.every((entry) => entry.trim());
  return <div className="study-reset"><div className="study-reset-fields">{labels.map((label, index) => <label key={label}><span>{label}</span><input value={entries[index]} onChange={(event) => setEntries((current) => current.map((entry, entryIndex) => entryIndex === index ? event.target.value : entry))} placeholder={t("studyResetPlaceholder")} maxLength={90} /></label>)}</div>{ready && <p className="study-reset-ready" role="status"><Check size={15} /> {t("studyResetReady")}</p>}<small>{t("exercisePrivacy")}</small></div>;
}

function ScreenBreak({ t }: { t: (key: keyof typeof copy.ru) => string }) {
  const [seconds, setSeconds] = useState(20);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setSeconds((value) => {
      if (value <= 1) {
        setActive(false);
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  return <div className="screen-break"><div className={`screen-break-orbit${active ? " active" : ""}`} aria-hidden="true"><Eye size={22} /><strong>{seconds}</strong></div><div><button type="button" className="secondary-button" onClick={() => { if (seconds === 0) setSeconds(20); setActive((value) => !value); }}>{active ? t("screenBreakPause") : seconds < 20 && seconds > 0 ? t("screenBreakResume") : t("screenBreakStart")}</button>{seconds === 0 && <p className="screen-break-done" role="status"><Check size={15} /> {t("screenBreakDone")}</p>}</div></div>;
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
  const [patternId, setPatternId] = useState<BreathingPattern>("long");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [seconds, setSeconds] = useState<number>(breathingPatternPhases.long[0].seconds);
  const [totalSeconds, setTotalSeconds] = useState(60);
  const phases = breathingPatternPhases[patternId];
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setTotalSeconds((value) => {
        if (value <= 1) {
          setActive(false);
          setPhaseIndex(0);
          setSeconds(phases[0].seconds);
          return 60;
        }
        return value - 1;
      });
      setSeconds((value) => {
        if (value <= 1) {
          setPhaseIndex((index) => (index + 1) % phases.length);
          return phases[(phaseIndex + 1) % phases.length].seconds;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active, phaseIndex, phases]);
  const phase = phases[phaseIndex];
  const patternLabel = patternId === "long" ? t("breathLongPattern") : t("breathBoxPattern");
  const selectPattern = (nextPattern: BreathingPattern) => {
    setActive(false);
    setPatternId(nextPattern);
    setPhaseIndex(0);
    setSeconds(breathingPatternPhases[nextPattern][0].seconds);
    setTotalSeconds(60);
  };
  return <div className="breathing-widget"><div className="breathing-patterns" aria-label={t("breathing")}><button type="button" className={patternId === "long" ? "active" : ""} onClick={() => selectPattern("long")}>{t("breathLong")}</button><button type="button" className={patternId === "box" ? "active" : ""} onClick={() => selectPattern("box")}>{t("breathBox")}</button></div><button type="button" className={`breath-circle ${active ? "breathing" : ""}`} style={{ animationDuration: `${phases.reduce((sum, item) => sum + item.seconds, 0)}s` }} onClick={() => { setTotalSeconds(60); setActive(true); }}><span>{active ? seconds : totalSeconds}</span><small>{active ? t(phase.key) : t("tryExercise")}</small></button><div className="breath-controls">{active && <button type="button" onClick={() => { setActive(false); setPhaseIndex(0); setSeconds(phases[0].seconds); setTotalSeconds(60); }}><RotateCcw size={13} /> {t("skip")}</button>}<span>{patternLabel}</span></div></div>;
}

function Support({ language, t, onBack }: { language: Language; t: (key: keyof typeof copy.ru) => string; onBack: () => void }) {
  const trustedMessage = t("trustedMessage");
  return (
    <div className="support-page section-wrap">
      <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> {t("back")}</button>
      <div className="support-hero">
        <div className="support-icon"><HeartHandshake size={28} /></div>
        <span className="eyebrow">HUMAN SUPPORT</span>
        <h1>{t("supportTitle")}</h1>
        <p>{t("supportLead")}</p>
      </div>

      <a className="trusted-contact-card" href={`sms:?body=${encodeURIComponent(trustedMessage)}`}>
        <span className="support-action-icon"><MessageCircle size={18} /></span>
        <span><b>{t("trusted")}</b><small>{t("trustedHint")}</small></span>
        <ChevronRight size={17} />
      </a>

      <section className="support-resource-list" aria-labelledby="support-resource-title">
        <div className="support-resource-heading">
          <div><h2 id="support-resource-title">{t("resourceListTitle")}</h2><p>{t("resourceListHint")}</p></div>
          <span>{t("resourcesVerified")}</span>
        </div>
        <div className="support-resource-grid">
          {supportResources.map((resource) => {
            const ResourceIcon = resource.kind === "talk" ? HeartHandshake : resource.kind === "protection" ? ShieldCheck : ShieldAlert;
            return (
              <article className={`support-resource-card ${resource.kind}`} key={resource.id}>
                <div className="support-resource-meta"><span><ResourceIcon size={15} /> {resource.category[language]}</span><small>{resource.availability[language]}</small></div>
                <h3>{resource.title[language]}</h3>
                <p>{resource.description[language]}</p>
                <div className="support-resource-actions">
                  <a className="resource-call" href={resource.href}><Phone size={16} /><span>{t("call")}</span><strong>{resource.contact}</strong></a>
                  {resource.secondaryContact && <a className="resource-message" href={resource.secondaryContact.href} target="_blank" rel="noreferrer"><MessageCircle size={16} /><span>{t("whatsapp")}</span></a>}
                </div>
                {resource.secondaryContact && <small className="resource-secondary-number">WhatsApp: {resource.secondaryContact.contact}</small>}
                <a className="resource-source" href={resource.sourceHref} target="_blank" rel="noreferrer">{t("officialSource")} ↗</a>
              </article>
            );
          })}
        </div>
        <p className="support-fallback-note">{t("supportFallback")}</p>
      </section>
    </div>
  );
}
