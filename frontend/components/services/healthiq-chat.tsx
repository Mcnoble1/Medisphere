"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  MessageCircle,
  Send,
  Mic,
  Upload,
  Loader2,
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  Menu,
  Plus,
  MoreVertical,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    confidence?: number
    analysisType?: string
    recommendations?: string[]
  }
}

interface Conversation {
  _id: string
  title: string
  lastMessageAt: Date
  messageCount: number
  lastMessage?: {
    role: string
    content: string
    timestamp: Date
  }
}

interface HealthIQChatProps {
  apiUrl?: string
  token?: string
}

export default function HealthIQChat({ apiUrl = '/api/healthiq', token }: HealthIQChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [showDataUpload, setShowDataUpload] = useState(false)
  const [showConversations, setShowConversations] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Health data form state
  const [healthData, setHealthData] = useState({
    bloodPressure: "",
    heartRate: "",
    weight: "",
    height: "",
    sleepHours: "",
    exerciseMinutes: "",
    symptoms: "",
    temperature: "",
    oxygenSaturation: "",
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    if (!token) return

    try {
      const response = await fetch(`${apiUrl}/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (err) {
      console.error('Error loading conversations:', err)
    }
  }

  const loadConversation = async (conversationId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${apiUrl}/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.conversation.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
        setCurrentConversationId(conversationId)
        setShowConversations(false)
      }
    } catch (err) {
      console.error('Error loading conversation:', err)
      setError('Failed to load conversation')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: currentConversationId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      if (data.success) {
        setMessages(prev => [...prev, {
          id: data.message._id,
          role: data.message.role,
          content: data.message.content,
          timestamp: new Date(data.message.timestamp),
          metadata: data.message.metadata
        }])

        if (!currentConversationId) {
          setCurrentConversationId(data.conversationId)
        }

        loadConversations()
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message. Please try again.')
      // Remove the user message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  const uploadHealthData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${apiUrl}/health-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(healthData)
      })

      if (!response.ok) {
        throw new Error('Failed to upload health data')
      }

      const data = await response.json()
      if (data.success) {
        setShowDataUpload(false)
        setHealthData({
          bloodPressure: "",
          heartRate: "",
          weight: "",
          height: "",
          sleepHours: "",
          exerciseMinutes: "",
          symptoms: "",
          temperature: "",
          oxygenSaturation: "",
        })

        // Add a system message about data upload
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          content: 'Health data uploaded successfully. You can now ask me questions about your health trends.',
          timestamp: new Date()
        }])
      }
    } catch (err) {
      console.error('Error uploading health data:', err)
      setError('Failed to upload health data')
    } finally {
      setIsLoading(false)
    }
  }

  const startNewConversation = () => {
    setMessages([])
    setCurrentConversationId(null)
    setShowConversations(false)
  }

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`${apiUrl}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        loadConversations()
        if (currentConversationId === conversationId) {
          startNewConversation()
        }
      }
    } catch (err) {
      console.error('Error deleting conversation:', err)
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex flex-col h-[600px] md:h-[700px] max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 h-full overflow-hidden">
        {/* Sidebar - Conversations (Mobile: Drawer, Desktop: Sidebar) */}
        <div className={cn(
          "md:w-80 flex-shrink-0",
          showConversations ? "block" : "hidden md:block"
        )}>
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={startNewConversation}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 md:hidden"
                    onClick={() => setShowConversations(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>Chat history</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-4">
                <div className="space-y-2 pb-4">
                  {conversations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No conversations yet. Start chatting!
                    </p>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv._id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors",
                          currentConversationId === conv._id && "bg-accent"
                        )}
                        onClick={() => loadConversation(conv._id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{conv.title}</p>
                            {conv.lastMessage && (
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {conv.lastMessage.content.substring(0, 60)}...
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTimestamp(new Date(conv.lastMessageAt))}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteConversation(conv._id)
                                }}
                                className="text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 md:hidden"
                    onClick={() => setShowConversations(true)}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  <div className="min-w-0">
                    <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                      <Brain className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">AI Health Assistant</span>
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Ask about your health data and get personalized insights
                    </CardDescription>
                  </div>
                </div>
                <Dialog open={showDataUpload} onOpenChange={setShowDataUpload}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-shrink-0">
                      <Upload className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Upload Data</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Upload Health Data</DialogTitle>
                      <DialogDescription>
                        Add your latest health measurements for AI analysis
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="blood-pressure">Blood Pressure (mmHg)</Label>
                          <Input
                            id="blood-pressure"
                            placeholder="120/80"
                            value={healthData.bloodPressure}
                            onChange={(e) => setHealthData({ ...healthData, bloodPressure: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
                          <Input
                            id="heart-rate"
                            type="number"
                            placeholder="72"
                            value={healthData.heartRate}
                            onChange={(e) => setHealthData({ ...healthData, heartRate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            placeholder="70"
                            value={healthData.weight}
                            onChange={(e) => setHealthData({ ...healthData, weight: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">Height (cm)</Label>
                          <Input
                            id="height"
                            type="number"
                            placeholder="175"
                            value={healthData.height}
                            onChange={(e) => setHealthData({ ...healthData, height: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sleep">Sleep Hours</Label>
                          <Input
                            id="sleep"
                            type="number"
                            step="0.5"
                            placeholder="7.5"
                            value={healthData.sleepHours}
                            onChange={(e) => setHealthData({ ...healthData, sleepHours: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="exercise">Exercise (minutes)</Label>
                          <Input
                            id="exercise"
                            type="number"
                            placeholder="30"
                            value={healthData.exerciseMinutes}
                            onChange={(e) => setHealthData({ ...healthData, exerciseMinutes: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="temperature">Temperature (°C)</Label>
                          <Input
                            id="temperature"
                            type="number"
                            step="0.1"
                            placeholder="36.6"
                            value={healthData.temperature}
                            onChange={(e) => setHealthData({ ...healthData, temperature: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="oxygen">Oxygen Saturation (%)</Label>
                          <Input
                            id="oxygen"
                            type="number"
                            placeholder="98"
                            value={healthData.oxygenSaturation}
                            onChange={(e) => setHealthData({ ...healthData, oxygenSaturation: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="symptoms">Symptoms or Notes</Label>
                        <Textarea
                          id="symptoms"
                          placeholder="Any symptoms, concerns, or additional notes..."
                          rows={3}
                          value={healthData.symptoms}
                          onChange={(e) => setHealthData({ ...healthData, symptoms: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDataUpload(false)}>
                        Cancel
                      </Button>
                      <Button onClick={uploadHealthData} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          'Upload Data'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Error Alert */}
              {error && (
                <div className="mx-4 mb-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-6 w-6"
                    onClick={() => setError(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Messages Area */}
              <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
                <div className="space-y-4 pb-4">
                  {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-4">
                      <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Welcome to HealthIQ</h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        I'm your AI health assistant. Ask me about your health data, symptoms, or get personalized
                        health insights. I can analyze your health records and provide evidence-based recommendations.
                      </p>
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                        <Button
                          variant="outline"
                          className="justify-start text-left h-auto p-3"
                          onClick={() => setInputMessage("What does my blood pressure trend indicate?")}
                        >
                          <TrendingUp className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-xs">Analyze my blood pressure</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-start text-left h-auto p-3"
                          onClick={() => setInputMessage("Give me personalized health recommendations")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-xs">Get health recommendations</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] sm:max-w-[75%] rounded-lg p-3 sm:p-4",
                          msg.role === 'user'
                            ? "bg-primary text-primary-foreground"
                            : msg.role === 'system'
                            ? "bg-muted/50 text-muted-foreground border"
                            : "bg-muted text-foreground"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                          <span className="text-xs opacity-70">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.metadata?.confidence && (
                            <Badge variant="secondary" className="text-xs">
                              {msg.metadata.confidence}% confident
                            </Badge>
                          )}
                        </div>
                        {msg.metadata?.recommendations && msg.metadata.recommendations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-xs font-semibold mb-2">Recommendations:</p>
                            <ul className="text-xs space-y-1">
                              {msg.metadata.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-green-500" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-foreground rounded-lg p-3 sm:p-4">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">AI is analyzing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask about your health data..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    className="min-h-[60px] max-h-[120px] resize-none"
                    disabled={isLoading}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsListening(!isListening)}
                      className={cn(isListening && "text-red-500")}
                      disabled={isLoading}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      size="icon"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
