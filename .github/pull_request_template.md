## Что изменилось

<!-- Коротко опишите пользовательский или инженерный эффект. -->

## Проверка

- [ ] `pnpm install --frozen-lockfile --ignore-scripts`
- [ ] `pnpm exec tsc --noEmit --incremental false`
- [ ] `pnpm exec next build`
- [ ] Проверен HIGH-risk маршрут и отсутствие вызова AI
- [ ] В diff нет `.env.local`, токенов и персональных данных

## Safety / privacy

- [ ] Изменение не ослабляет детерминированный HIGH-risk route
- [ ] Текст UI не обещает диагностику или лечение
- [ ] Новые контакты помощи проверены по официальному источнику
