# План улучшения FirstStep MVP

## Текущее состояние

MVP уже имеет сильное архитектурное основание: PII scrubber, детерминированный HIGH-risk gate, отдельный human-support route, провайдерный fallback, RU/KK интерфейс и отсутствие хранения полного диалога приложением. Production build работает как один статический UI route и serverless `/api/chat`.

Основные риски аудита: слишком общий AI-контракт, доверие клиентским ролям history, непроверенные ранее контакты помощи, отсутствие автоматических safety-evals, устаревающий lint script, отсутствие Vercel health endpoint, частичная двуязычность support flow, неработающие contact CTA и отсутствие распределённого rate limit.

## P0 — до публичного deploy

### Выполнено в текущей итерации

- Узкий student-stress system contract и off-topic redirect.
- Intents и risk route передаются в модель.
- History ограничена и превращается в недоверенный transcript.
- Ограничены body, session ID, длина history и output.
- OpenAI-вариант использует Responses API, `store: false` и session-scoped safety identifier.
- Добавлены официальные `112` и `111` со ссылками gov.kz.
- Support CTA стали реальными `tel:`/`sms:` действиями; исправлен возврат в активный чат.
- Добавлены security headers, `no-store`, `/api/health`, Vercel ignore и function timeout.
- CI запускает ESLint, TypeScript, safety-evals и production build на Node 22.
- Исправлена RU/KK-паритетность ключевых support/onboarding элементов.

### Обязательно завершить перед реальными пользователями

- Safety-review classifier, промптов и кризисного текста независимым психологом/кризисным специалистом из Казахстана.
- Проверить номера и формулировки `112/111` непосредственно перед запуском; назначить владельца ежеквартальной проверки.
- [x] Подключить распределённый rate limit на `/api/chat`: Upstash REST transaction, HMAC-хеш адреса и fail-closed production gate.
- [x] Добавить отдельные `/privacy` и `/terms`: data flow, инфраструктурные/AI-провайдеры, хранение и конфиденциальный контакт.
- Провести ручной red-team минимум по 100 RU/KK кейсам, включая опечатки, транслит, длинные диалоги и indirect self-harm.
- [x] Настроить content-free observability: request ID, latency, provider/fallback, status, risk route и intent без текста сообщений, session ID, IP и PII.

## P1 — пилот на 20–50 студентов

- Добавить короткий входной выбор: экзамен / дедлайн / перегрузка / адаптация / отношения / другое.
- В конце ответа показывать один измеримый action chip: «10 минут начать», «написать человеку», «сделать паузу».
- После действия спрашивать только необязательную оценку «стало легче / без изменений / хуже»; не называть это клиническим эффектом.
- Ввести versioning промпта и модели в server-side telemetry.
- Создать response eval-набор с независимой двойной разметкой и согласием по спорным примерам.
- Проверить WCAG: клавиатура, focus states, screen reader, contrast, reduced motion, мобильные `tel:`/`sms:` ссылки.

Ключевые MVP-метрики: доля выбранных маленьких шагов, доля успешных переходов к human support при HIGH, self-reported change после шага, fallback/error rate и safety violations. Время в чате и число сообщений не должны быть целевой метрикой: продукт не должен удерживать уязвимого пользователя.

## P2 — модель и масштабирование

- При достаточном eval-наборе сравнить: локальный fallback, текущий Qwen + prompt, более сильная base model, few-shot и LoRA.
- Fine-tuning запускать только при измеримом повторяющемся дефекте; процесс описан в `docs/AI_QUALITY_AND_TUNING.md`.
- Добавить consent-based агрегированную аналитику без текста сообщений.
- Поддержать университетские ресурсы через проверяемую конфигурацию с датой, источником и владельцем.
- Провести юридическую и privacy-проверку перед партнёрством с университетом.

## Definition of done для публичного MVP

1. `pnpm check` и `pnpm build` зелёные.
2. `/api/health` отвечает `200` в Preview и Production.
3. HIGH-кейсы не вызывают ни HF, ни OpenAI.
4. Все контакты кликабельны и проверены по официальным источникам.
5. Секреты доступны только server-side.
6. Rate limit и privacy notice включены.
7. Safety-review и red-team задокументированы.
8. Есть rollback на локальный fallback без нового deploy.
