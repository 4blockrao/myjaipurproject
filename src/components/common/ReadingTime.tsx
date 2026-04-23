import { Clock } from 'lucide-react';
import { stripHtml } from '@/utils/markdownToHtml';

export function getReadingTime(content?: string | null) {
  const words = stripHtml(content || '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function ReadingTime({ content }: { content?: string | null }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Clock className="h-4 w-4" />
      {getReadingTime(content)} min read
    </span>
  );
}
