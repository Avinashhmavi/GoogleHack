
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { appChatbotAction } from '@/lib/actions';
import { Bot, Send, Loader2, User, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// Function to find URLs and internal paths and convert them to appropriate links
const renderContentWithLinks = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g; // Matches http/https URLs
    const pathRegex = /(\/[a-z0-9-]+)/g; // Matches internal paths like /quiz-generator

    // Combine regexes for splitting
    const combinedRegex = new RegExp(`(${urlRegex.source}|${pathRegex.source})`, 'g');

    const parts = content.split(combinedRegex);
    
    return parts.map((part, index) => {
        if (!part) return null;

        if (part.match(urlRegex)) {
            return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300">{part}</a>;
        }
        
        if (part.trim().match(/^\/[a-z0-9-]+$/)) {
             const path = part.trim();
             return (
                 <Link key={index} href={path} className="underline text-blue-400 hover:text-blue-300">
                    {path}
                 </Link>
             );
        }
        
        return part;
    });
};


export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm Sahayak's assistant. How can I help you navigate the app today?" },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  const speechRecognition = useSpeechRecognition({
    lang: language,
    onResult: setInput,
    onError: (error) => {
        toast({ title: "Speech Recognition Error", description: error, variant: "destructive" });
    }
  });


  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[style*="overflow: scroll"]');
        if (viewport) {
            viewport.scrollTo({
                top: viewport.scrollHeight,
                behavior: 'smooth'
            });
        }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(speechRecognition.isListening) speechRecognition.stopListening();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let history = newMessages.slice(0, -1).map(msg => ({
      role: (msg.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
      content: [{text: msg.content}]
    }));

    if (history.length > 0 && history[0].role === 'model') {
      history = history.slice(1);
    }

    const result = await appChatbotAction({ query: input, history, studentRoster: [] });

    if (result.success) {
      const assistantMessage: Message = { role: 'assistant', content: result.data.response };
      setMessages((prev) => [...prev, assistantMessage]);
    } else {
      toast({
        title: 'Chatbot Error',
        description: result.error || 'Something went wrong.',
        variant: 'destructive',
      });
       const lastMessage = messages[messages.length - 1];
       if(lastMessage.role === 'user') {
         setMessages(prev => prev.slice(0, -1));
       }
    }
    setIsLoading(false);
  };
  
  const toggleListening = () => {
    if (speechRecognition.isListening) {
        speechRecognition.stopListening();
    } else {
        speechRecognition.startListening();
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50"
          size="icon"
        >
          <Bot className="h-8 w-8" />
          <span className="sr-only">Open Chatbot</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-80 h-[500px] flex flex-col p-0 mr-4 mb-2"
      >
        <div className="p-4 border-b">
          <h3 className="font-semibold text-center font-headline">App Assistant</h3>
        </div>
        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                       <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
                    </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  )}
                >
                  {renderContentWithLinks(message.content)}
                </div>
                 {message.role === 'user' && (
                    <Avatar className="h-8 w-8 bg-muted">
                        <AvatarFallback><User className="w-5 h-5"/></AvatarFallback>
                    </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
                 <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                       <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
                    </Avatar>
                    <div className="bg-secondary rounded-lg px-3 py-2 flex items-center">
                        <Loader2 className="w-5 h-5 animate-spin"/>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="p-4 border-t flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about features..."
            disabled={isLoading}
            autoComplete='off'
          />
          {speechRecognition.hasPermission && (
            <Button type="button" size="icon" variant={speechRecognition.isListening ? "destructive" : "outline"} onClick={toggleListening}>
                {speechRecognition.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                <span className="sr-only">Toggle voice input</span>
            </Button>
          )}
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
