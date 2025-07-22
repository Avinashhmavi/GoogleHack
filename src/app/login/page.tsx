"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookOpen, KeyRound, Phone } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GoogleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1H12.18V13.83H18.69C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5.03 16.25 5.03 12.55C5.03 8.85 8.34 5.82 12.19 5.82C14.03 5.82 15.63 6.42 16.89 7.57L19.31 5.18C17.22 3.23 14.81 2 12.19 2C6.92 2 2.73 6.38 2.73 11.99C2.73 17.6 6.92 22 12.19 22C17.6 22 21.54 18.33 21.54 12.25C21.54 11.88 21.49 11.49 21.35 11.1Z"></path></svg>;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [logoBounce, setLogoBounce] = useState(false);
  useEffect(() => {
    setLogoBounce(true);
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
        await signInWithPopup(auth, googleProvider);
        router.push('/');
    } catch (error: any) {
        toast({
            title: 'Google Sign-In Failed',
            description: error.message,
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  }

  const generateRecaptcha = () => {
    try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          }
        });
    } catch(e) {
        console.error("Error generating reCAPTCHA", e);
    }
  }

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPhoneLoading(true);
    generateRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    try {
        const result = await signInWithPhoneNumber(auth, `+${phone}`, appVerifier);
        setConfirmationResult(result);
        toast({ title: 'OTP Sent', description: 'Please check your phone for the verification code.' });
    } catch (error: any) {
        toast({
            title: 'Phone Sign-In Failed',
            description: error.message,
            variant: 'destructive',
        });
    } finally {
        setIsPhoneLoading(false);
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!confirmationResult) return;
      setIsOtpLoading(true);
      try {
          await confirmationResult.confirm(otp);
          router.push('/');
      } catch (error: any) {
          toast({
              title: 'OTP Verification Failed',
              description: error.message,
              variant: 'destructive',
          });
      } finally {
          setIsOtpLoading(false);
      }
  }


  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-lg shadow-2xl rounded-2xl border-0 bg-white/90 backdrop-blur-md transition-transform duration-300 ease-in-out hover:scale-105 animate-fade-in">
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <img src="/1753127637.jpeg" alt="Sahayak AI Logo" className={`w-24 h-24 mb-2 rounded-full shadow-lg border-4 border-blue-100 transition-transform duration-700 ${logoBounce ? 'animate-bounce' : ''}`} />
          <CardTitle className="text-3xl font-headline font-bold text-gray-800">Sahayak AI</CardTitle>
          <CardDescription className="text-base text-gray-500 mb-2">AI for Education</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email"><KeyRound className="mr-2" /> Email</TabsTrigger>
                <TabsTrigger value="phone"><Phone className="mr-2" /> Phone</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleEmailLogin} className="space-y-4 pt-4">
                    <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 animate-spin" />}
                    Login with Email
                    </Button>
                </form>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>
                 <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <GoogleIcon />}
                    Sign in with Google
                </Button>
            </TabsContent>
            <TabsContent value="phone">
                 {!confirmationResult ? (
                    <form onSubmit={handlePhoneSignIn} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" placeholder="e.g. 911234567890" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                             <p className="text-xs text-muted-foreground">Include country code without '+' sign.</p>
                        </div>
                        <Button type="submit" className="w-full" disabled={isPhoneLoading}>
                            {isPhoneLoading ? <Loader2 className="mr-2 animate-spin" /> : <Phone className="mr-2" />}
                            Send Verification Code
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">Verification Code</Label>
                            <Input id="otp" type="text" placeholder="Enter OTP" required value={otp} onChange={(e) => setOtp(e.target.value)} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isOtpLoading}>
                             {isOtpLoading ? <Loader2 className="mr-2 animate-spin" /> : <KeyRound className="mr-2" />}
                            Verify OTP & Login
                        </Button>
                    </form>
                )}
            </TabsContent>
          </Tabs>

          <div id="recaptcha-container"></div>
          
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// @ts-ignore
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}
