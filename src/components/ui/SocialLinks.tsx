import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Social media configuration with proper URLs and platform-specific value props
 */
export const socialMediaLinks = [
  {
    platform: 'Instagram',
    url: 'https://www.instagram.com/myjaipurcircle/',
    icon: Instagram,
    ariaLabel: 'Follow JaipurCircle on Instagram',
    description: 'Local life, food, neighborhoods',
    hoverLabel: 'Follow JaipurCircle on Instagram'
  },
  {
    platform: 'YouTube',
    url: 'https://www.youtube.com/@jaipurcircle',
    icon: Youtube,
    ariaLabel: 'Watch Jaipur Stories on YouTube',
    description: 'City stories & guides',
    hoverLabel: 'Watch Jaipur Stories on YouTube'
  },
  {
    platform: 'Facebook',
    url: 'https://www.facebook.com/myjaipurcircle',
    icon: Facebook,
    ariaLabel: 'Join JaipurCircle on Facebook',
    description: 'Community updates',
    hoverLabel: 'Join JaipurCircle on Facebook'
  },
  {
    platform: 'X',
    url: 'https://x.com/jaipurcircle',
    icon: Twitter,
    ariaLabel: 'Follow JaipurCircle on X for live alerts',
    description: 'Live alerts & announcements',
    hoverLabel: 'Follow JaipurCircle on X'
  }
];

interface HeaderSocialIconsProps {
  className?: string;
}

/**
 * Subtle monochrome social icons for header placement
 * Purpose: credibility signal, not distraction
 */
export const HeaderSocialIcons = ({ className }: HeaderSocialIconsProps) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {socialMediaLinks.map((social) => (
        <a
          key={social.platform}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.ariaLabel}
          title={social.hoverLabel}
          className="p-1.5 rounded-full text-muted-foreground/70 hover:text-foreground hover:bg-muted/50 transition-all duration-200 group"
        >
          <social.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
        </a>
      ))}
    </div>
  );
};

interface FooterSocialSectionProps {
  className?: string;
}

/**
 * Primary SEO authority zone - dedicated social section for footer
 * Includes icons + platform names + benefit-based labels
 */
export const FooterSocialSection = ({ className }: FooterSocialSectionProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-semibold text-foreground">Connect with JaipurCircle</h3>
      <div className="grid grid-cols-2 gap-3">
        {socialMediaLinks.map((social) => (
          <a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.ariaLabel}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 border border-transparent hover:border-border/50 transition-all duration-200 group"
          >
            <div className="p-2 bg-background rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
              <social.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {social.platform}
              </span>
              <span className="block text-xs text-muted-foreground line-clamp-1">
                {social.description}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

interface AboutPageSocialSectionProps {
  className?: string;
}

/**
 * Social proof layer for About/Contact pages
 * Human-tone description with platform-specific value
 */
export const AboutPageSocialSection = ({ className }: AboutPageSocialSectionProps) => {
  return (
    <section className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Join the JaipurCircle Community
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Stay connected with what's happening in Jaipur. Follow us for local stories, 
          neighborhood updates, exclusive deals, and city guides curated just for you.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {socialMediaLinks.map((social) => (
          <a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.ariaLabel}
            className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/60 border border-border/50 hover:border-primary/30 transition-all duration-200 group"
          >
            <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
              <social.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block font-semibold text-foreground group-hover:text-primary transition-colors">
                {social.platform}
              </span>
              <span className="block text-sm text-muted-foreground">
                {social.description}
              </span>
            </div>
          </a>
        ))}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Be part of a growing community of Jaipur enthusiasts
      </p>
    </section>
  );
};

export default {
  HeaderSocialIcons,
  FooterSocialSection,
  AboutPageSocialSection,
  socialMediaLinks
};
