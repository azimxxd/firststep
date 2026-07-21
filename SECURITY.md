# Security policy

FirstStep технически подготовлен к контролируемому production deploy, но не является клинически валидированной системой поддержки. Публичный университетский пилот требует независимой safety, accessibility, privacy и legal проверки.

## Не публиковать

- `.env.local` и любые HF/OpenAI tokens;
- сырые ответы Google Form;
- имена, email, телефоны, адреса, названия школ и идентификаторы участников;
- скриншоты или логи, по которым можно восстановить личность пользователя.

## Сообщить об уязвимости

Не создавайте публичный issue с персональными данными или секретом. Передайте описание владельцу репозитория приватным каналом GitHub Security Advisories или через контакт команды, указанный в заявке хакатона.

В сообщении укажите:

1. короткое описание;
2. шаги воспроизведения;
3. потенциальное влияние;
4. минимальный безопасный способ проверки.

## Включённые GitHub-защиты

По состоянию на 21.07.2026 для `azimxxd/firststep` включены:

- Dependabot vulnerability alerts и security updates;
- secret scanning и push protection;
- private vulnerability reporting;
- CodeQL default setup для Actions, JavaScript и TypeScript с еженедельным запуском;
- Actions policy `selected`: GitHub-owned/verified actions и SHA-pinned `pnpm/action-setup`;
- обязательный SHA pinning для GitHub Actions;
- защита `main`: Pull Request, успешный `CI / verify`, актуальная ветка, linear history, запрет force-push и удаления, обязательное разрешение conversations.

Для solo-репозитория обязательное число approvals равно 0: Pull Request и CI обязательны, но владелец не блокируется отсутствием второго участника.

## Ограничения плана GitHub

В user-owned public repository GitHub не разрешил включить non-provider secret patterns и validity checks: эти функции требуют GitHub Secret Protection для организации/Enterprise. Базовые secret scanning и push protection при этом активны.

## Базовые правила перед публичным пилотом

- отозвать токен при любом подозрении на утечку;
- перепроверить `112` и `111` по сохранённым официальным ссылкам в `src/config/supportResources.ts` и зафиксировать дату проверки;
- отдельно проверить условия передачи текста внешнему AI-провайдеру;
- проверить fail-closed distributed rate limit `/api/chat` на реальном Upstash Redis и настроить alert на `503/429`;
- проверить опубликованные `/privacy` и `/terms`, фактический AI-провайдер и сроки хранения его аккаунта;
- провести privacy, accessibility и safety review.

## Граница ответственности

Keyword-based classifier — только MVP safety gate, а не клиническая оценка. При непосредственной опасности пользователь должен обратиться к местным экстренным службам или человеку рядом.
