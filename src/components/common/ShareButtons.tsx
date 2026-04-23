import { Facebook, Send, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonsProps {
  title: string;
  url?: string;
  compact?: boolean;
}

export default function ShareButtons({ title, url, compact = false }: ShareButtonsProps) {
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://jaipurcircle.com/guides');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { label: 'WhatsApp', icon: Send, href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, primary: true },
    { label: 'Twitter', icon: Twitter, href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { label: 'Facebook', icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!compact && <span className="text-sm font-semibold text-muted-foreground">Share:</span>}
      {links.map(({ label, icon: Icon, href, primary }) => (
        <Button key={label} asChild size={compact ? 'icon' : 'sm'} variant={primary ? 'default' : 'outline'} className={primary ? 'bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90' : ''}>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${label}`}>
            <Icon className={compact ? 'h-4 w-4' : 'mr-2 h-4 w-4'} />
            {!compact && label}
          </a>
        </Button>
      ))}
    </div>
  );
}
