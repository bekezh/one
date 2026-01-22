# JuriDoc

Голосовой помощник для создания юридических документов. Говорите — получаете оформленный документ.

## Быстрый старт (деплой на Vercel)

### 1. Создайте репозиторий на GitHub

1. Зайдите на [github.com/new](https://github.com/new)
2. Назовите репозиторий `juridoc`
3. Оставьте Public
4. Нажмите "Create repository"

### 2. Загрузите код в GitHub

```bash
# В терминале на вашем компьютере:
git clone https://github.com/YOUR_USERNAME/juridoc.git
cd juridoc

# Скопируйте все файлы проекта в эту папку, затем:
git add .
git commit -m "Initial commit"
git push origin main
```

### 3. Деплой на Vercel

1. Зайдите на [vercel.com](https://vercel.com) и войдите через GitHub
2. Нажмите "Add New Project"
3. Выберите репозиторий `juridoc`
4. В разделе "Environment Variables" добавьте:
   - Name: `ANTHROPIC_API_KEY`
   - Value: ваш API ключ (начинается с `sk-ant-`)
5. Нажмите "Deploy"

Через 1-2 минуты ваше приложение будет доступно по адресу типа `juridoc-xxx.vercel.app`

## Как использовать

1. Откройте приложение в Chrome (важно для голосового ввода)
2. Нажмите "Начать запись"
3. Скажите что вам нужно, например:
   - "Хочу составить договор аренды квартиры. Я, Иванов Петр, сдаю квартиру по адресу Алматы, Абая 100 сроком на год за 150 тысяч тенге в месяц"
   - "Нужна расписка о получении денег в долг 500 тысяч тенге"
4. Нажмите "Остановить"
5. Нажмите "Создать документ"
6. Скопируйте готовый документ

## Технологии

- Next.js 14
- Claude API (Anthropic)
- Web Speech API (распознавание речи в браузере)

## Локальная разработка

```bash
npm install
cp .env.example .env.local
# Добавьте ваш ANTHROPIC_API_KEY в .env.local
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)
