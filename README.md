# FirstStep

FirstStep — анонимный AI-чат для студентов, которым тяжело из-за экзаменов, дедлайнов, нагрузки, одиночества или перемен в учебной жизни. Он помогает спокойно разобрать ситуацию и выбрать один посильный следующий шаг, а при признаках опасности сразу переводит пользователя к человеческой помощи.

**Production:** [firststep-rouge.vercel.app](https://firststep-rouge.vercel.app)

**Статус:** MVP для Tech Vision 2026 · Social & Human Capital

> FirstStep не ставит диагнозы, не назначает лечение и не заменяет психолога, врача или экстренную службу.

## Что умеет продукт

- ведёт связный разговор только о стрессе в учёбе и студенческой жизни;
- понимает свободный текст, а не воспроизводит заранее выбранный сценарий;
- предлагает быстрые темы, короткие упражнения и 15-минутный фокус-спринт;
- показывает понятное обучение интерфейсу при первом входе и по кнопке `?`;
- поддерживает русский и казахский языки;
- позволяет скачать переписку в TXT без session ID и технических данных;
- даёт проверенные контакты Казахстана: `150` — психологическая помощь, `111` — защита и поддержка, `112` — экстренная служба;
- не отправляет сообщения высокого риска генеративной модели.

## Как это работает

1. Локальный safety-router определяет риск и тему сообщения.
2. `HIGH`-risk запрос получает детерминированный кризисный ответ и human handoff.
3. `LOW`/`MEDIUM` запрос очищается от очевидных телефонов и email и передаётся AI-провайдеру вместе с ограниченным контекстом.
4. Ответ проверяется по длине, формату, релевантности и отсутствию скрытых рассуждений.
5. Upstash Redis ограничивает частоту запросов по краткоживущему HMAC-хешу адреса.

Production работает по принципу fail-closed: без AI credentials, Redis и `RATE_LIMIT_HASH_SECRET` чат возвращает `503`, а не запускается в небезопасном режиме.

## Safety и приватность

- история разговора хранится только в открытой вкладке;
- собственная база сообщений отсутствует;
- HIGH-risk текст не передаётся внешней LLM;
- клиентская история ограничивается шестью репликами и считается недоверенным transcript;
- телефон и email маскируются перед внешним AI-вызовом, но полная анонимизация не гарантируется;
- API использует `no-store`, лимиты размера запроса и распределённый rate limit;
- контакты помощи и privacy/terms доступны без аккаунта.

Перед университетским пилотом всё равно требуются независимые safety, legal, privacy и accessibility reviews.

## Стек

- Next.js 15, React 19, TypeScript;
- server-side API routes на Node.js runtime;
- Hugging Face Inference Providers, Groq или OpenAI;
- Upstash Redis через Vercel Marketplace;
- CSS без UI-фреймворка, Lucide icons;
- Vercel, GitHub Actions, CodeQL.

Приоритет AI-провайдеров: `HF_TOKEN` → `GROQ_API_KEY` → `AI_API_KEY`. Локальный demo-provider доступен только вне production.

## Быстрый запуск

Требования: Node.js 22–24 и pnpm 10–11.

```bash
pnpm install --frozen-lockfile
copy .env.example .env.local
pnpm dev
```

Откройте [http://localhost:3000](http://localhost:3000).

### Основные переменные окружения

| Переменная | Назначение |
|---|---|
| `HF_TOKEN` | server-side Hugging Face token |
| `HF_MODEL` | основная модель HF |
| `HF_FALLBACK_MODEL` | резервная модель HF |
| `GROQ_API_KEY` / `GROQ_MODEL` | альтернативный Groq provider |
| `AI_API_KEY` / `AI_MODEL` | OpenAI provider |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Vercel Marketplace aliases |
| `RATE_LIMIT_HASH_SECRET` | случайный секрет длиной 32+ символа |
| `REQUIRE_PRODUCTION_CONTROLS` | принудительный fail-closed gate вне Vercel |

Никогда не добавляйте server-side ключи в переменные с префиксом `NEXT_PUBLIC_` и не коммитьте `.env.local`.

## Проверка качества

```bash
pnpm check
pnpm build
```

`pnpm check` запускает ESLint, TypeScript, safety/PII evals и проверки production-конфигурации. GitHub дополнительно запускает CodeQL и Vercel Preview.

Health endpoint:

```text
GET /api/health
```

В production он должен возвращать `status: "ok"` и три активных контроля: AI provider, distributed rate limit и rate-limit hash secret.

## Деплой

1. Импортируйте GitHub-репозиторий в Vercel как Next.js project.
2. Добавьте один AI credential и Upstash Redis integration.
3. Создайте `RATE_LIMIT_HASH_SECRET` длиной не менее 32 символов.
4. Выполните production deploy и проверьте `/api/health`, обычный студенческий диалог и HIGH-risk маршрут.

Основная production-ветка — `main`; она защищена обязательными PR, `verify` и CodeQL.

## Ключевые файлы

```text
src/components/FirstStepApp.tsx   пользовательский путь, чат и обучение
src/app/api/chat/route.ts         API boundary и safety routing
src/lib/ai/provider.ts            AI-провайдеры и проверка ответа
src/lib/safety/                   intent/risk classifiers
src/lib/security/rateLimit.ts     Upstash rate limit
src/config/supportResources.ts    контакты 150/111/112
docs/evals/                       safety-наборы
```

Подробности: [техническое ревью](./TECHNICAL_REVIEW.md), [план развития MVP](./MVP_IMPROVEMENT_PLAN.md), [AI quality и fine-tuning](./docs/AI_QUALITY_AND_TUNING.md), [security policy](./SECURITY.md).

## Лицензия

[MIT](./LICENSE) — разрешает использовать и развивать проект при сохранении уведомления об авторстве и отказа от гарантий.
