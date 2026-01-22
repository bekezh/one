import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'

export default function Home() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [document, setDocument] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'ru-RU'

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart + ' '
          } else {
            interimTranscript = transcriptPart
          }
        }

        setTranscript(prev => prev + finalTranscript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Ваш браузер не поддерживает распознавание речи. Используйте Chrome.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setTranscript('')
      setDocument('')
      setError('')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const generateDocument = async () => {
    if (!transcript.trim()) {
      setError('Сначала надиктуйте текст')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка генерации')
      }

      setDocument(data.document)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(document)
  }

  return (
    <>
      <Head>
        <title>JuriDoc — Юридические документы голосом</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="container">
        <header>
          <h1>JuriDoc</h1>
          <p className="tagline">Говорите — мы оформим документ</p>
        </header>

        <main>
          <section className="input-section">
            <button 
              className={`mic-button ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
            >
              <span className="mic-icon">
                {isListening ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                )}
              </span>
              <span className="mic-text">
                {isListening ? 'Остановить' : 'Начать запись'}
              </span>
            </button>

            {isListening && (
              <div className="listening-indicator">
                <span className="pulse"></span>
                <span>Слушаю...</span>
              </div>
            )}

            {transcript && (
              <div className="transcript-box">
                <h3>Ваш текст:</h3>
                <textarea 
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Или введите текст вручную..."
                />
              </div>
            )}

            {!isListening && transcript && (
              <button 
                className="generate-button"
                onClick={generateDocument}
                disabled={isGenerating}
              >
                {isGenerating ? 'Генерирую документ...' : 'Создать документ'}
              </button>
            )}
          </section>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {document && (
            <section className="document-section">
              <div className="document-header">
                <h3>Готовый документ</h3>
                <button className="copy-button" onClick={copyToClipboard}>
                  Копировать
                </button>
              </div>
              <div className="document-content">
                <pre>{document}</pre>
              </div>
            </section>
          )}
        </main>

        <footer>
          <p>© 2025 JuriDoc. MVP версия.</p>
        </footer>
      </div>

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        :global(body) {
          font-family: 'IBM Plex Sans', -apple-system, sans-serif;
          background: linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #0d1117 100%);
          min-height: 100vh;
          color: #e6edf3;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        header {
          text-align: center;
          margin-bottom: 60px;
        }

        h1 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 4rem;
          font-weight: 700;
          background: linear-gradient(135deg, #c9a227 0%, #f4d03f 50%, #c9a227 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        .tagline {
          font-size: 1.1rem;
          color: #8b949e;
          font-weight: 400;
        }

        main {
          flex: 1;
        }

        .input-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .mic-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 32px 48px;
          background: linear-gradient(145deg, #21262d 0%, #161b22 100%);
          border: 2px solid #30363d;
          border-radius: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #e6edf3;
        }

        .mic-button:hover {
          border-color: #c9a227;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(201, 162, 39, 0.15);
        }

        .mic-button.listening {
          border-color: #f85149;
          background: linear-gradient(145deg, #2d1b1b 0%, #1a1111 100%);
          animation: pulse-border 2s infinite;
        }

        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(248, 81, 73, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(248, 81, 73, 0); }
        }

        .mic-icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mic-icon svg {
          width: 48px;
          height: 48px;
        }

        .mic-button.listening .mic-icon {
          color: #f85149;
        }

        .mic-text {
          font-size: 1.1rem;
          font-weight: 500;
        }

        .listening-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #f85149;
          font-weight: 500;
        }

        .pulse {
          width: 12px;
          height: 12px;
          background: #f85149;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }

        .transcript-box {
          width: 100%;
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 16px;
          padding: 24px;
        }

        .transcript-box h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
          color: #c9a227;
          margin-bottom: 16px;
        }

        .transcript-box textarea {
          width: 100%;
          min-height: 120px;
          background: #0d1117;
          border: 1px solid #21262d;
          border-radius: 8px;
          padding: 16px;
          color: #e6edf3;
          font-family: inherit;
          font-size: 1rem;
          resize: vertical;
        }

        .transcript-box textarea:focus {
          outline: none;
          border-color: #c9a227;
        }

        .generate-button {
          padding: 16px 48px;
          background: linear-gradient(135deg, #c9a227 0%, #a8861a 100%);
          border: none;
          border-radius: 12px;
          color: #0d1117;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .generate-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(201, 162, 39, 0.3);
        }

        .generate-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-message {
          background: rgba(248, 81, 73, 0.1);
          border: 1px solid #f85149;
          border-radius: 12px;
          padding: 16px 24px;
          color: #f85149;
          margin-top: 24px;
          text-align: center;
        }

        .document-section {
          margin-top: 40px;
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 16px;
          overflow: hidden;
        }

        .document-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: #21262d;
          border-bottom: 1px solid #30363d;
        }

        .document-header h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
          color: #c9a227;
        }

        .copy-button {
          padding: 8px 20px;
          background: transparent;
          border: 1px solid #c9a227;
          border-radius: 8px;
          color: #c9a227;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .copy-button:hover {
          background: rgba(201, 162, 39, 0.1);
        }

        .document-content {
          padding: 24px;
        }

        .document-content pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 0.95rem;
          line-height: 1.7;
          color: #e6edf3;
        }

        footer {
          margin-top: 60px;
          text-align: center;
          color: #484f58;
          font-size: 0.9rem;
        }

        @media (max-width: 600px) {
          h1 {
            font-size: 2.5rem;
          }

          .mic-button {
            padding: 24px 36px;
          }

          .mic-icon {
            width: 48px;
            height: 48px;
          }

          .mic-icon svg {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </>
  )
}
