import { cn } from '@/lib/utils';

interface NewsStructuredContentProps {
  content: string;
  className?: string;
}

/**
 * Structured Article Content Renderer
 * Parses markdown-like content into elegant, professional article layout
 * Supports: headings, paragraphs, lists, blockquotes, bold, italic, links
 */
export const NewsStructuredContent = ({ content, className }: NewsStructuredContentProps) => {
  const renderContent = () => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let orderedListItems: string[] = [];
    let inBlockquote = false;
    let blockquoteContent: string[] = [];

    const flushList = (index: number) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="my-4 ml-6 space-y-2">
            {listItems.map((item, i) => (
              <li 
                key={i} 
                className="text-muted-foreground leading-relaxed flex items-start gap-2"
              >
                <span className="text-primary mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }} />
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const flushOrderedList = (index: number) => {
      if (orderedListItems.length > 0) {
        elements.push(
          <ol key={`olist-${index}`} className="my-4 ml-6 space-y-2 list-decimal list-outside">
            {orderedListItems.map((item, i) => (
              <li 
                key={i} 
                className="text-muted-foreground leading-relaxed pl-2"
                dangerouslySetInnerHTML={{ __html: processInlineFormatting(item) }}
              />
            ))}
          </ol>
        );
        orderedListItems = [];
      }
    };

    const flushBlockquote = (index: number) => {
      if (blockquoteContent.length > 0) {
        elements.push(
          <blockquote 
            key={`quote-${index}`} 
            className="my-6 border-l-4 border-primary pl-4 py-3 bg-muted/30 rounded-r-lg"
          >
            <p className="text-muted-foreground italic leading-relaxed text-lg">
              "{blockquoteContent.join(' ')}"
            </p>
          </blockquote>
        );
        blockquoteContent = [];
        inBlockquote = false;
      }
    };

    // Process inline formatting (bold, italic, links)
    const processInlineFormatting = (text: string): string => {
      let processed = text;
      // Links [text](url)
      processed = processed.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary font-medium underline underline-offset-2 hover:text-primary/80">$1</a>');
      // Bold **text**
      processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
      // Italic *text*
      processed = processed.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
      // Inline code `text`
      processed = processed.replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
      return processed;
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Empty line - flush all pending elements
      if (!trimmedLine) {
        flushList(index);
        flushOrderedList(index);
        flushBlockquote(index);
        return;
      }

      // H2 - Main sections (## Heading)
      if (trimmedLine.startsWith('## ')) {
        flushList(index);
        flushOrderedList(index);
        flushBlockquote(index);
        const heading = trimmedLine.replace('## ', '');
        elements.push(
          <h2 
            key={index} 
            className="text-2xl font-bold mt-10 mb-4 text-foreground border-b border-border pb-2 leading-tight"
          >
            {heading}
          </h2>
        );
        return;
      }

      // H3 - Subsections (### Heading)
      if (trimmedLine.startsWith('### ')) {
        flushList(index);
        flushOrderedList(index);
        flushBlockquote(index);
        const heading = trimmedLine.replace('### ', '');
        elements.push(
          <h3 
            key={index} 
            className="text-xl font-semibold mt-8 mb-3 text-foreground leading-tight"
          >
            {heading}
          </h3>
        );
        return;
      }

      // H4 - Minor headings (#### Heading)
      if (trimmedLine.startsWith('#### ')) {
        flushList(index);
        flushOrderedList(index);
        flushBlockquote(index);
        const heading = trimmedLine.replace('#### ', '');
        elements.push(
          <h4 
            key={index} 
            className="text-lg font-medium mt-6 mb-2 text-foreground"
          >
            {heading}
          </h4>
        );
        return;
      }

      // Horizontal rule (--- or ***)
      if (/^(-{3,}|\*{3,})$/.test(trimmedLine)) {
        flushList(index);
        flushOrderedList(index);
        flushBlockquote(index);
        elements.push(
          <hr key={index} className="my-8 border-border" />
        );
        return;
      }

      // Unordered list items (- or *)
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        flushOrderedList(index);
        flushBlockquote(index);
        listItems.push(trimmedLine.replace(/^[-*]\s/, ''));
        return;
      }

      // Ordered list items (1. 2. etc)
      if (/^\d+\.\s/.test(trimmedLine)) {
        flushList(index);
        flushBlockquote(index);
        orderedListItems.push(trimmedLine.replace(/^\d+\.\s/, ''));
        return;
      }

      // Blockquote (> text)
      if (trimmedLine.startsWith('> ')) {
        flushList(index);
        flushOrderedList(index);
        inBlockquote = true;
        blockquoteContent.push(trimmedLine.replace('> ', ''));
        return;
      }

      // Continue blockquote if already in one
      if (inBlockquote && !trimmedLine.startsWith('>')) {
        blockquoteContent.push(trimmedLine);
        return;
      }

      // Regular paragraph
      flushList(index);
      flushOrderedList(index);
      flushBlockquote(index);
      
      elements.push(
        <p 
          key={index} 
          className="mb-5 leading-relaxed text-muted-foreground text-base"
          dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedLine) }}
        />
      );
    });

    // Flush any remaining items at end of content
    flushList(lines.length);
    flushOrderedList(lines.length);
    flushBlockquote(lines.length);

    return elements;
  };

  return (
    <div className={cn('article-content', className)}>
      {renderContent()}
    </div>
  );
};

export default NewsStructuredContent;
