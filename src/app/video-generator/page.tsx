"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateVideoAction } from "@/lib/actions";
import { Loader2, Video, Download, Play, Pause, Volume2, VolumeX, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/context/auth-context";

interface VideoGenerationParams {
  prompt: string;
  duration: number;
  aspectRatio: string;
  style: string;
  quality: string;
}

interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  duration: number;
  aspectRatio: string;
  createdAt: Date;
}

export default function VideoGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(10);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [style, setStyle] = useState("realistic");
  const [quality, setQuality] = useState("standard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const { authStatus, user } = useAuth();

  // Cleanup uploaded video URL when component unmounts
  useEffect(() => {
    return () => {
      if (uploadedVideo) {
        URL.revokeObjectURL(uploadedVideo);
      }
    };
  }, [uploadedVideo]);

  const aspectRatioOptions = [
    { value: "16:9", label: "Landscape (16:9)" },
    { value: "9:16", label: "Portrait (9:16)" },
    { value: "1:1", label: "Square (1:1)" },
  ];

  const styleOptions = [
    { value: "realistic", label: "Realistic" },
    { value: "cinematic", label: "Cinematic" },
    { value: "animated", label: "Animated" },
    { value: "artistic", label: "Artistic" },
  ];

  const qualityOptions = [
    { value: "standard", label: "Standard" },
    { value: "high", label: "High Quality" },
    { value: "ultra", label: "Ultra HD" },
  ];

  const handleGenerateVideo = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (authStatus !== 'authenticated' || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate videos.",
        variant: "destructive",
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a video prompt.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedVideo(null);

    try {
      const token = await user.getIdToken();
      const result = await generateVideoAction({
        prompt,
        duration,
        aspectRatio: aspectRatio as "16:9" | "9:16" | "1:1",
        style: style as "realistic" | "cinematic" | "animated" | "artistic",
        quality: quality as "standard" | "high" | "ultra",
      }, token);

      if (result.success && result.data) {
        const video: GeneratedVideo = {
          id: result.data.videoId,
          url: result.data.videoUrl,
          prompt: result.data.prompt,
          duration: result.data.duration,
          aspectRatio: result.data.aspectRatio,
          createdAt: new Date(),
        };

        setGeneratedVideo(video);
        toast({
          title: "Success",
          description: "Video generated successfully using Veo 3 AI!",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate video.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedVideo) {
      const link = document.createElement('a');
      link.href = generatedVideo.url;
      link.download = `generated-video-${generatedVideo.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getVideoFormat = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const formatMap: { [key: string]: string } = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'wmv': 'video/x-ms-wmv',
      'flv': 'video/x-flv',
      '3gp': 'video/3gpp',
      '3g2': 'video/3gpp2',
      'mkv': 'video/x-matroska',
      'm4v': 'video/mp4',
      'mpg': 'video/mpeg',
      'mpeg': 'video/mpeg',
      'ts': 'video/mp2t',
      'mts': 'video/mp2t',
    };
    return formatMap[extension || ''] || 'video/mp4';
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's a video file
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid video file.",
          variant: "destructive",
        });
        return;
      }

      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a video file smaller than 100MB.",
          variant: "destructive",
        });
        return;
      }

      const videoUrl = URL.createObjectURL(file);
      setUploadedVideo(videoUrl);
      
      const mockVideo: GeneratedVideo = {
        id: `uploaded_${Date.now()}`,
        url: videoUrl,
        prompt: `Uploaded: ${file.name}`,
        duration: 0, // Will be updated when video loads
        aspectRatio: "16:9",
        createdAt: new Date(),
      };

      setGeneratedVideo(mockVideo);
      toast({
        title: "Video Uploaded",
        description: `Video uploaded successfully! Format: ${getVideoFormat(file.name)}`,
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Video Maker</h1>
        <p className="text-muted-foreground">Create educational videos using AI-powered Veo 3 technology.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Video /> Video Generation Settings
            </CardTitle>
            <CardDescription>Configure your video generation parameters.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateVideo} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">Video Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the video you want to generate... (e.g., A teacher explaining photosynthesis to 5th graders with animated diagrams)"
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="duration">Duration: {duration} seconds</Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">5s</span>
                  <Slider
                    id="duration"
                    value={[duration]}
                    onValueChange={(value) => setDuration(value[0])}
                    min={5}
                    max={25}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium">25s</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger id="aspect-ratio">
                    <SelectValue placeholder="Select aspect ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectRatioOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger id="style">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    {styleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">Quality</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger id="quality">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                disabled={isGenerating || authStatus !== 'authenticated'} 
                className="w-full"
              >
                {isGenerating && <Loader2 className="mr-2 animate-spin" />}
                {authStatus !== 'authenticated' ? "Please Log In" : isGenerating ? "Generating Video..." : "Generate Video"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Video /> Generated Video
            </CardTitle>
            <CardDescription>Your generated video will appear here.</CardDescription>
            <div className="flex gap-2 mt-2">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                id="video-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('video-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Video
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            {isGenerating && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Generating your video...</p>
                  <p className="text-sm text-muted-foreground mt-2">This may take a few minutes</p>
                </div>
              </div>
            )}

            {generatedVideo && !isGenerating && (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={generatedVideo.url}
                    className="w-full h-full object-contain"
                    controls
                    preload="metadata"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedMetadata={(e) => {
                      const video = e.target as HTMLVideoElement;
                      if (generatedVideo.prompt.startsWith('Uploaded:')) {
                        // Update duration for uploaded videos
                        setGeneratedVideo(prev => prev ? {
                          ...prev,
                          duration: Math.round(video.duration)
                        } : null);
                      }
                    }}
                    onError={(e) => {
                      console.error('Video playback error:', e);
                      toast({
                        title: "Video Playback Error",
                        description: "Unable to play this video format. Try downloading instead.",
                        variant: "destructive",
                      });
                    }}
                  >
                    {/* Support for all major video formats */}
                    <source src={generatedVideo.url} type="video/mp4" />
                    <source src={generatedVideo.url} type="video/webm" />
                    <source src={generatedVideo.url} type="video/ogg" />
                    <source src={generatedVideo.url} type="video/quicktime" />
                    <source src={generatedVideo.url} type="video/x-msvideo" />
                    <source src={generatedVideo.url} type="video/x-ms-wmv" />
                    <source src={generatedVideo.url} type="video/x-flv" />
                    <source src={generatedVideo.url} type="video/3gpp" />
                    <source src={generatedVideo.url} type="video/3gpp2" />
                    <source src={generatedVideo.url} type="video/x-matroska" />
                    <source src={generatedVideo.url} type="video/mpeg" />
                    <source src={generatedVideo.url} type="video/mp2t" />
                    
                    {/* Fallback message */}
                    <div className="text-white p-4 text-center">
                      <p>Your browser does not support video playback.</p>
                      <p className="mt-2">
                        <a 
                          href={generatedVideo.url} 
                          download 
                          className="text-blue-400 underline hover:text-blue-300"
                        >
                          Download the video
                        </a>
                      </p>
                    </div>
                  </video>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={toggleMute}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button onClick={handleDownload} variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p><strong>Prompt:</strong> {generatedVideo.prompt}</p>
                    <p><strong>Duration:</strong> {generatedVideo.duration} seconds</p>
                    <p><strong>Aspect Ratio:</strong> {generatedVideo.aspectRatio}</p>
                    <p><strong>Generated:</strong> {generatedVideo.createdAt.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {!isGenerating && !generatedVideo && (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <div>
                  <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>Your generated video will appear here.</p>
                  <p className="text-sm mt-2">Configure settings and click "Generate Video" to start.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 