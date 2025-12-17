import { cn } from '@/lib/utils';

interface NewsStructuredContentProps {
  content: string;
  className?: string;
}

/**
 * Structured Article Content Renderer
 * Enforces article structure: What happened, Why it matters, Who is affected, What next
 * Renders markdown-like content with proper semantic HTML
 */
export const NewsStructuredContent = ({ content, className }: NewsStructuredContentProps) => {
  const renderContent = () => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let inBlockquote = false;
    let blockquoteContent: string[] = [];

    const flushList = (index: number) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
            {listItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const flushBlockquote = (index: number) => {
      if (blockquoteContent.length > 0) {
        elements.push(
          <blockquote 
            key={`quote-${index}`} 
            className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground bg-muted/30 py-2 rounded-r"
          >
            {blockquoteContent.join(' ')}
          </blockquote>
        );
        blockquoteContent = [];
        inBlockquote = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        flushList(index);
        flushBlockquote(index);
        return;
      }

      // H2 - Main sections
      if (trimmedLine.startsWith('## ')) {
        flushList(index);
        flushBlockquote(index);
        const heading = trimmedLine.replace('## ', '');
        elements.push(
          <h2 key={index} className="text-xl font-bold mt-8 mb-4 text-foreground">
            {heading}
          </h2>
        );
        return;
      }

      // H3 - Subsections
      if (trimmedLine.startsWith('### ')) {
        flushList(index);
        flushBlockquote(index);
        const heading = trimmedLine.replace('### ', '');
        elements.push(
          <h3 key={index} className="text-lg font-semibold mt-6 mb-3 text-foreground">
            {heading}
          </h3>
        );
        return;
      }

      // H4 - Minor headings
      if (trimmedLine.startsWith('#### ')) {
        flushList(index);
        flushBlockquote(index);
        const heading = trimmedLine.replace('#### ', '');
        elements.push(
          <h4 key={index} className="text-base font-medium mt-4 mb-2 text-foreground">
            {heading}
          </h4>
        );
        return;
      }

      // List items
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        flushBlockquote(index);
        listItems.push(trimmedLine.replace(/^[-*]\s/, ''));
        return;
      }

      // Blockquote
      if (trimmedLine.startsWith('> ')) {
        flushList(index);
        inBlockquote = true;
        blockquoteContent.push(trimmedLine.replace('> ', ''));
        return;
      }

      // Regular paragraph
      flushList(index);
      flushBlockquote(index);
      
      // Handle bold and italic text
      let processedLine = trimmedLine;
      processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      processedLine = processedLine.replace(/\*(.+?)\*/g, '<em>$1</em>');
      
      elements.push(
        <p 
          key={index} 
          className="mb-4 leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    });

    // Flush any remaining items
    flushList(lines.length);
    flushBlockquote(lines.length);

    return elements;
  };

  return (
    <div className={cn('prose prose-sm max-w-none dark:prose-invert', className)}>
      {renderContent()}
    </div>
  );
};

export default NewsStructuredContent;
