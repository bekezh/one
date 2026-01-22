import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Ты — профессиональный юрист-документовед в Казахстане. Твоя задача — на основе устной речи пользователя создать правильно оформленный юридический документ.

ПРАВИЛА:
1. Определи тип документа по контексту (договор аренды, купли-продажи, расписка, заявление, доверенность и т.д.)
2. Оформи документ по стандартам Казахстана
3. Если данные неполные (например, нет ФИО или дат), оставь пропуски в формате [ФИО], [дата], [адрес] и т.д.
4. Используй язык, на котором говорит пользователь (русский или казахский)
5. Добавь все необходимые разделы: шапка, предмет, условия, реквизиты сторон, место для подписей
6. В конце добавь примечание если какие-то важные данные нужно заполнить

ФОРМАТ ОТВЕТА:
Выдай только готовый документ, без комментариев и объяснений.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text } = req.body

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Текст не может быть пустым' })
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Создай юридический документ на основе следующей речи:\n\n"${text}"`
        }
      ]
    })

    const document = message.content[0].text

    return res.status(200).json({ document })
  } catch (error) {
    console.error('Claude API error:', error)
    return res.status(500).json({ 
      error: 'Ошибка генерации документа. Проверьте API ключ.' 
    })
  }
}
