
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { PlusCircle, Trash2, Calendar as CalendarIcon, BookOpen, AlertTriangle, PartyPopper, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { addCalendarEventAction, getCalendarEventsAction, deleteCalendarEventAction } from "@/lib/actions";
import type { CalendarEvent } from "@/lib/firestore";

const eventTypeConfig = {
    Lesson: { icon: BookOpen, color: "bg-blue-500" },
    Deadline: { icon: AlertTriangle, color: "bg-red-500" },
    Event: { icon: PartyPopper, color: "bg-purple-500" },
    Holiday: { icon: PartyPopper, color: "bg-green-500" },
};

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchEvents() {
        setIsLoading(true);
        const result = await getCalendarEventsAction();
        if(result.success) {
            // Firestore timestamps need to be converted to Date objects
            const formattedEvents = result.data.map(event => ({
                ...event,
                date: new Date((event.date as any)._seconds * 1000),
            }));
            setEvents(formattedEvents);
        } else {
            toast({ title: "Error", description: result.error || "Could not fetch calendar events.", variant: "destructive" });
        }
        setIsLoading(false);
    }
    fetchEvents();
  }, [toast]);

  const addEvent = async (event: Omit<CalendarEvent, 'id' | 'uid'>) => {
    const result = await addCalendarEventAction(event);
    if (result.success) {
        const formattedEvents = result.data.map(event => ({
            ...event,
            date: new Date((event.date as any)._seconds * 1000),
        }));
        setEvents(formattedEvents);
        toast({ title: "Event Added", description: "The event has been added to your calendar." });
    } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };
  
  const deleteEvent = async (id: string) => {
    const result = await deleteCalendarEventAction(id);
    if (result.success) {
        const formattedEvents = result.data.map(event => ({
            ...event,
            date: new Date((event.date as any)._seconds * 1000),
        }));
        setEvents(formattedEvents);
        toast({ title: "Event Deleted" });
    } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };
  
  const eventsForSelectedDate = date ? events.filter(e => format(e.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Calendar & Scheduler</h1>
          <p className="text-muted-foreground">Manage your lessons, deadlines, and school events.</p>
        </div>
        <AddEventDialog onAddEvent={addEvent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-2">
            <CardContent className="p-2 md:p-6">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                    classNames={{
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                        day_today: "bg-accent text-accent-foreground",
                    }}
                    components={{
                        DayContent: ({ date, ...props }) => {
                           const dailyEvents = events.filter(e => format(e.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
                           return (
                             <div className="relative h-full w-full flex items-center justify-center">
                               <span>{date.getDate()}</span>
                               {dailyEvents.length > 0 && (
                                <div className="absolute bottom-1 flex space-x-0.5">
                                    {dailyEvents.slice(0, 3).map(event => {
                                        const config = eventTypeConfig[event.type];
                                        return <div key={event.id} className={cn("h-1 w-1 rounded-full", config.color)}></div>
                                    })}
                                </div>
                               )}
                             </div>
                           );
                        }
                    }}
                />
            </CardContent>
        </Card>

        <Card className="lg:sticky lg:top-8">
            <CardHeader>
                <CardTitle>
                    {date ? format(date, "PPP") : "No date selected"}
                </CardTitle>
                <CardDescription>Events for the selected date.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-4">
                    {eventsForSelectedDate.length > 0 ? (
                        eventsForSelectedDate.map(event => {
                            const config = eventTypeConfig[event.type];
                            const Icon = config.icon;
                            return(
                                <div key={event.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-semibold">{event.title}</p>
                                            <Badge variant="outline" className={cn(config.color, "text-white border-0")}>{event.type}</Badge>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => deleteEvent(event.id)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                        <span className="sr-only">Delete event</span>
                                    </Button>
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No events for this day.</p>
                    )}
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}


function AddEventDialog({ onAddEvent }: { onAddEvent: (event: Omit<CalendarEvent, 'id' | 'uid'>) => void }) {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [type, setType] = useState<CalendarEvent['type']>('Lesson');
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date) {
            toast({ title: "Missing fields", description: "Please provide a title and a date.", variant: "destructive" });
            return;
        }
        onAddEvent({ title, date, type });
        setTitle("");
        setDate(new Date());
        setType("Lesson");
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Add Event
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="font-headline">Add a New Calendar Event</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Title</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">Type</Label>
                             <Select onValueChange={(value: CalendarEvent['type']) => setType(value)} defaultValue={type}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Lesson">Lesson</SelectItem>
                                    <SelectItem value="Deadline">Deadline</SelectItem>
                                    <SelectItem value="Event">Event</SelectItem>
                                    <SelectItem value="Holiday">Holiday</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full col-span-3 justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Add Event</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
