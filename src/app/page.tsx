"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Languages, ArrowRightLeft, History, Loader2, Volume2, Copy, Check, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Translation {
  id: string
  from: string
  to: string
  original: string
  translated: string
  timestamp: Date
}

const languages = [
  { code: "pt", name: "Português" },
  { code: "en", name: "Inglês" },
  { code: "es", name: "Espanhol" },
  { code: "fr", name: "Francês" },
  { code: "de", name: "Alemão" },
  { code: "it", name: "Italiano" },
  { code: "ja", name: "Japonês" },
  { code: "ko", name: "Coreano" },
  { code: "zh", name: "Chinês" },
  { code: "ar", name: "Árabe" },
  { code: "ru", name: "Russo" },
  { code: "hi", name: "Hindi" },
]

export default function TranslatorApp() {
  const [sourceText, setSourceText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [sourceLang, setSourceLang] = useState("pt")
  const [targetLang, setTargetLang] = useState("en")
  const [isTranslating, setIsTranslating] = useState(false)
  const [history, setHistory] = useState<Translation[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [copied, setCopied] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast.error("Digite um texto para traduzir")
      return
    }

    setIsTranslating(true)
    setApiError(null)
    
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setApiError(data.error || "Erro ao traduzir")
        toast.error(data.error || "Erro ao traduzir")
        return
      }

      setTranslatedText(data.translation)

      // Adicionar ao histórico
      const newTranslation: Translation = {
        id: Date.now().toString(),
        from: sourceLang,
        to: targetLang,
        original: sourceText,
        translated: data.translation,
        timestamp: new Date(),
      }
      setHistory([newTranslation, ...history.slice(0, 9)]) // Mantém últimas 10

      toast.success("Tradução concluída!")
    } catch (error) {
      const errorMsg = "Erro ao conectar com o servidor. Tente novamente."
      setApiError(errorMsg)
      toast.error(errorMsg)
      console.error(error)
    } finally {
      setIsTranslating(false)
    }
  }

  const swapLanguages = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setSourceText(translatedText)
    setTranslatedText(sourceText)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText)
    setCopied(true)
    toast.success("Texto copiado!")
    setTimeout(() => setCopied(false), 2000)
  }

  const speakText = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      speechSynthesis.speak(utterance)
    } else {
      toast.error("Seu navegador não suporta síntese de voz")
    }
  }

  const loadFromHistory = (item: Translation) => {
    setSourceLang(item.from)
    setTargetLang(item.to)
    setSourceText(item.original)
    setTranslatedText(item.translated)
    setShowHistory(false)
    toast.success("Tradução carregada do histórico")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Languages className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TravelTranslate
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Tradutor para Viajantes</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="gap-2"
          >
            <History className="w-4 h-4" />
            Histórico
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* API Error Alert */}
        {apiError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro de Configuração</AlertTitle>
            <AlertDescription>
              {apiError}
              {apiError.includes("OpenAI") && (
                <div className="mt-2 text-sm">
                  <p className="font-semibold">Como configurar:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Clique no banner laranja acima (se aparecer)</li>
                    <li>Adicione sua chave da OpenAI (OPENAI_API_KEY)</li>
                    <li>Obtenha sua chave em: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com/api-keys</a></li>
                  </ol>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Translator Card */}
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Tradução em Tempo Real</CardTitle>
            <CardDescription className="text-center">
              Traduza instantaneamente para qualquer idioma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Language Selectors */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">De:</label>
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={swapLanguages}
                className="mt-6 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all hover:scale-110"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </Button>

              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Para:</label>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Text Areas */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Texto Original</label>
                  {sourceText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText(sourceText, sourceLang)}
                      className="h-8 gap-1"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="Digite ou cole o texto aqui..."
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  className="min-h-[200px] resize-none text-base"
                />
                <div className="text-xs text-gray-500 text-right">
                  {sourceText.length} caracteres
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Tradução</label>
                  {translatedText && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speakText(translatedText, targetLang)}
                        className="h-8 gap-1"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        className="h-8 gap-1"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                <Textarea
                  placeholder="A tradução aparecerá aqui..."
                  value={translatedText}
                  readOnly
                  className="min-h-[200px] resize-none text-base bg-gray-50 dark:bg-gray-900"
                />
              </div>
            </div>

            {/* Translate Button */}
            <Button
              onClick={handleTranslate}
              disabled={isTranslating || !sourceText.trim()}
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Traduzindo...
                </>
              ) : (
                <>
                  <Languages className="w-5 h-5 mr-2" />
                  Traduzir
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* History Section */}
        {showHistory && history.length > 0 && (
          <Card className="mt-6 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico de Traduções
              </CardTitle>
              <CardDescription>
                Últimas {history.length} traduções realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-blue-600">
                          {languages.find((l) => l.code === item.from)?.name}
                        </span>
                        <ArrowRightLeft className="w-3 h-3" />
                        <span className="text-purple-600">
                          {languages.find((l) => l.code === item.to)?.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-gray-700 dark:text-gray-300 truncate">
                        {item.original}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 truncate">
                        {item.translated}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Languages className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">12+ Idiomas</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Suporte para os principais idiomas do mundo
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Pronúncia</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ouça a pronúncia correta em qualquer idioma
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Histórico</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Acesse suas traduções anteriores facilmente
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
