import React, { useState, useRef, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API, useAuth } from '../App';
import { toast } from 'sonner';
import { SubscriptionGate, useSubscriptionAccess } from '../components/SubscriptionGate';
import { 
  Bot, 
  Send,
  User,
  Sparkles,
  Loader2,
  Trash2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';

function MentorContent() {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post(`${API}/ai/chat`, {
        message: userMessage,
        session_id: sessionId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSessionId(response.data.session_id);
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (e) {
      toast.error('Failed to get response. Please try again.');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error. Please try again or rephrase your question." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
  };

  const suggestedQuestions = [
    "What is blockchain technology?",
    "How do I safely store cryptocurrency?",
    "Explain DeFi in simple terms",
    "What are the risks of crypto investing?",
    "How do smart contracts work?"
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            CryptoCoach <span className="text-primary">AI</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Your personal AI mentor for cryptocurrency education. Ask anything about blockchain, trading, DeFi, and more.
          </p>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Chat with CryptoCoach AI
                </span>
                {messages.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearChat} className="text-slate-400">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-[400px] overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <Bot className="w-12 h-12 text-slate-500 mb-4" />
                    <p className="text-slate-400 mb-6">
                      Hi {user?.full_name?.split(' ')[0]}! I'm CryptoCoach AI. How can I help you learn about cryptocurrency today?
                    </p>
                    <div className="space-y-2 w-full max-w-md">
                      <p className="text-sm text-slate-500 mb-3">Try asking:</p>
                      {suggestedQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => setInput(question)}
                          className="w-full text-left p-3 rounded-lg bg-muted hover:bg-muted/80 text-sm text-slate-300 transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' ? 'bg-primary' : 'bg-slate-700'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <Bot className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                        <div className={`inline-block p-4 rounded-2xl max-w-[85%] ${
                          message.role === 'user' 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-muted text-slate-200 rounded-tl-none'
                        }`}>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
                
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-none p-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about cryptocurrency..."
                    className="min-h-[60px] max-h-[120px] bg-muted border-border resize-none"
                    disabled={loading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className="bg-primary hover:bg-primary/90 px-6"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-4 bg-muted/50 rounded-lg text-center text-sm text-slate-500"
        >
          CryptoCoach AI provides educational information only. It is not financial advice. Always do your own research before making investment decisions.
        </motion.div>
      </div>
    </Layout>
  );
}

export default function MentorPage() {
  const { canAccessAIMentor } = useSubscriptionAccess();
  
  if (!canAccessAIMentor) {
    return (
      <Layout>
        <SubscriptionGate 
          requiredTier="elite" 
          feature="L'AI Crypto Mentor (CryptoCoach AI)"
        />
      </Layout>
    );
  }
  
  return <MentorContent />;
}
