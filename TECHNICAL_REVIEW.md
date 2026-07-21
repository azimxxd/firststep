# Technical review — FirstStep

Дата: 21.07.2026
Проверенный репозиторий: `C:\projects\techvision`
Ветка на момент начала аудита: `main`, `61102d3`

## Вердикт

- Hackathon demo: готов после успешного финального build/smoke.
- Vercel Preview: архитектурно готов.
- Публичный пилот с реальными студентами: пока не готов из-за отсутствия distributed rate limit, privacy notice, независимого safety-review и расширенного RU/KK red-team.
- Клинический или медицинский продукт: не является и не должен так позиционироваться.

## Что уже сделано хорошо

- HIGH-risk определяется до генеративного AI и полностью запрещает model call.
- AI provider имеет deterministic local fallback.
- Полные чаты не сохраняются приложением; базы данных нет.
- PII scrubber стоит до provider call.
- UI поддерживает русский и казахский языки, reduced motion и мобильную компоновку.
- Секреты server-side, `.env.local` игнорируется Git.
- GitHub security controls, protected main и CI уже были настроены.
- Зависимостей мало, surface area небольшой, Next.js build подходит Vercel без adapter.

## Найденные проблемы и статус

| Приоритет | Проблема | Влияние | Статус |
|---|---|---|---|
| P0 | Клиент мог прислать произвольную history с ролью `assistant` | role spoofing и усиление prompt injection | исправлено: history ограничена и упакована как untrusted transcript |
| P0 | AI-помощник был описан слишком широко | чат уходил от темы студенческого стресса | исправлено доменным contract и off-topic redirect |
| P0 | Контакты помощи были placeholders, CTA не выполняли действий | опасный dead end в кризисном flow | исправлено: официальные `112/111`, `tel:`/`sms:` и gov.kz sources |
| P0 | API принимал почти любой session ID и необрезанную history | token/cost abuse и непредсказуемый контекст | исправлено body/session/history limits |
| P0 | Нет distributed rate limit | публичный endpoint можно массово вызывать | исправлено: Upstash REST transaction, HMAC IP hash и fail-closed production gate; нужен smoke с реальными credentials |
| P0 | Нет privacy notice и provider data review | пользователь не знает полный data flow | исправлено в продукте страницами `/privacy` и `/terms`; независимый legal/privacy review остаётся внешним gate |
| P1 | Safety classifier основан на regex | false negative/false positive на сложных формулировках | частично: расширены RU/KK/EN patterns и добавлены regression evals |
| P1 | Output guard был ограничен длиной и несколькими словами | reasoning leak, клиническая или dependency лексика | усилено, но не заменяет moderation и human review |
| P1 | `next lint` deprecated, CI не запускал lint | будущая поломка Next 16 и незамеченные regressions | исправлено: ESLint CLI и единый `check` |
| P1 | Support/onboarding частично оставались на русском в KK режиме | нарушенная локализация | исправлено для ключевого flow; нужен review носителем языка |
| P1 | Support screen возвращал на landing даже из активного чата | пользователь терял путь назад к разговору | исправлено |
| P1 | Упражнение «60 секунд» работало бесконечно | ложный UX-контракт | исправлено автоостановкой |
| P1 | Не было health endpoint и явного function budget | слабый deploy smoke и timeout risk | исправлено `/api/health`, `maxDuration=30`, bounded provider timeouts |
| P2 | `FirstStepApp.tsx` и `globals.css` монолитны | сложнее тестировать и менять UI | оставить до стабилизации MVP, затем разделить по экранам/модулям |
| P2 | Нет content-free telemetry | нельзя измерить latency, fallback и safety routes | добавить до пилота без логирования текста |
| P2 | Runtime schema validation написана вручную | сложнее эволюционировать API contract | для MVP допустимо; при росте добавить schema library и contract tests |

## AI-архитектура после ревью

- Основной HF provider остаётся первым, OpenAI Responses API — альтернативой, local scenarios — обязательным fallback.
- OpenAI request использует `store: false`, ограниченный output и session-scoped safety identifier.
- Intents и risk route входят в system contract, но внутренние labels запрещено показывать пользователю.
- HIGH не попадает ни в HF, ни в OpenAI.
- Fine-tuned endpoint можно подключить переменными, но обучение не является частью Vercel deploy.

## Качество кода

Сильные стороны: strict TypeScript, маленькое число runtime dependencies, ясное разделение privacy/safety/provider, отсутствие преждевременной базы данных. Главный долг — почти весь UI и copy находятся в одном client component, а CSS состоит из крупных однострочных блоков. Это ухудшает maintainability, но сейчас менее опасно, чем safety/data gaps; рефакторинг до завершения пилотного поведения создаст лишний риск.

## Что проверять перед каждым релизом

```bash
pnpm check
pnpm build
```

После deploy:

1. `GET /api/health` → `200`.
2. Academic LOW → `ACADEMIC_STRESS`, один следующий шаг.
3. Anxiety MEDIUM → мягкая поддержка и intervention.
4. Self-harm HIGH → `HUMAN_ESCALATION`, никакого provider call.
5. Off-topic → граница student-stress scope.
6. RU и KK support links → корректные `111/112`.

## Следующий технический рубеж

Не fine-tuning, а доказуемое качество: расширенный eval-набор, независимая разметка, rate limit, privacy notice и content-free observability. После этого сравнить base model + prompt, few-shot и LoRA на одном holdout. План находится в `MVP_IMPROVEMENT_PLAN.md`, модельный процесс — в `docs/AI_QUALITY_AND_TUNING.md`.
