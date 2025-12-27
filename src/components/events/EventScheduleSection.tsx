import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import { Clock, Calendar, Timer, DoorOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EventScheduleSectionProps {
  event: {
    title: string;
    start_date: string;
    end_date?: string | null;
    is_all_day?: boolean | null;
    category?: string;
  };
}

/**
 * Event Timing & Schedule Block
 * Shows: gates open time, show start time, estimated duration
 * Google extracts time signals — they matter for snippets
 */
export const EventScheduleSection = ({ event }: EventScheduleSectionProps) => {
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;
  const isPastEvent = startDate < new Date();
  
  // Calculate duration
  const getDuration = () => {
    if (!endDate) {
      // Estimate based on category
      const category = event.category?.toLowerCase() || '';
      if (category.includes('concert') || category.includes('music')) return '2-3 hours';
      if (category.includes('comedy')) return '1.5-2 hours';
      if (category.includes('workshop')) return '2-4 hours';
      if (category.includes('festival')) return '4-8 hours';
      if (category.includes('exhibition')) return '2-3 hours';
      return '2-3 hours (estimated)';
    }
    
    const hours = differenceInHours(endDate, startDate);
    const minutes = differenceInMinutes(endDate, startDate) % 60;
    
    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
  };

  // Calculate gates open time (30 mins before)
  const gatesOpenTime = new Date(startDate.getTime() - 30 * 60 * 1000);

  const scheduleItems = [
    {
      icon: <DoorOpen className="w-5 h-5 text-primary" />,
      label: 'Gates Open',
      value: format(gatesOpenTime, 'h:mm a'),
      note: '30 minutes before start',
    },
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      label: 'Show Starts',
      value: format(startDate, 'h:mm a'),
      highlight: true,
    },
    {
      icon: <Timer className="w-5 h-5 text-primary" />,
      label: 'Estimated Duration',
      value: getDuration(),
    },
  ];

  if (endDate) {
    scheduleItems.push({
      icon: <Clock className="w-5 h-5 text-muted-foreground" />,
      label: 'Expected End',
      value: format(endDate, 'h:mm a'),
    });
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Event Timing & Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Header */}
        <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <p className="font-bold text-lg">{format(startDate, 'EEEE, MMMM d, yyyy')}</p>
            <p className="text-sm text-muted-foreground">
              {event.is_all_day ? 'All Day Event' : format(startDate, 'h:mm a')}
            </p>
          </div>
          {isPastEvent && (
            <Badge variant="secondary" className="ml-auto">Past</Badge>
          )}
        </div>

        {/* Schedule Timeline */}
        {!event.is_all_day && (
          <div className="space-y-3">
            {scheduleItems.map((item, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  item.highlight 
                    ? 'bg-primary/5 border-primary/30' 
                    : 'bg-muted/30 border-border/50'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className={`font-semibold ${item.highlight ? 'text-primary text-lg' : ''}`}>
                    {item.value}
                  </p>
                  {item.note && (
                    <p className="text-xs text-muted-foreground">{item.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pro Tip */}
        <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Pro Tip:</strong> Arrive 30 minutes early for smooth entry and to find parking. 
            Late arrivals may face delays during security checks.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventScheduleSection;
