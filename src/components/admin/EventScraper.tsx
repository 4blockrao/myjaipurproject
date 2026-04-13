import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  SkipForward,
  Calendar,
  MapPin,
  Tag,
  FileEdit,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScrapedEvent {
  title: string;
  venue: string;
  category: string;
  price: string;
  imageUrl: string;
  eventUrl: string;
  eventId: string;
  date?: string;
}

interface ImportResult {
  title: string;
  status: 'imported' | 'skipped' | 'failed' | 'would-import';
  slug?: string;
  reason?: string;
  error?: string;
  locality?: string;
  category?: string;
}

export function EventScraper() {
  const [url, setUrl] = useState('https://in.bookmyshow.com/explore/events-jaipur');
  const [isLoading, setIsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [dryRun, setDryRun] = useState(false);
  const [scrapedEvents, setScrapedEvents] = useState<ScrapedEvent[]>([]);
  const [importResults, setImportResults] = useState<{
    total: number;
    imported: number;
    skipped: number;
    failed: number;
    details: ImportResult[];
  } | null>(null);

  const handleScrape = async () => {
    setIsScraping(true);
    setScrapedEvents([]);
    setImportResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-bookmyshow-events', {
        body: {
          action: 'scrape',
          url,
        },
      });

      if (error) throw error;

      if (data.success && data.events) {
        setScrapedEvents(data.events);
        toast.success(`Found ${data.events.length} events from BookMyShow`);
      } else {
        toast.error(data.error || 'Failed to scrape events');
      }
    } catch (err) {
      console.error('Scrape error:', err);
      toast.error('Failed to scrape events. Check console for details.');
    } finally {
      setIsScraping(false);
    }
  };

  const handleImport = async () => {
    if (scrapedEvents.length === 0) {
      toast.error('No events to import. Scrape first.');
      return;
    }

    setIsImporting(true);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-bookmyshow-events', {
        body: {
          action: 'import',
          events: scrapedEvents,
          dryRun,
          editorialStatus: 'draft',
          isIndexable: false,
        },
      });

      if (error) throw error;

      if (data.success && data.results) {
        setImportResults(data.results);
        toast.success(
          dryRun
            ? `Dry run complete: ${data.results.imported} would be imported as drafts`
            : `Imported ${data.results.imported} events as drafts, skipped ${data.results.skipped}`
        );
      } else {
        toast.error(data.error || 'Import failed');
      }
    } catch (err) {
      console.error('Import error:', err);
      toast.error('Failed to import events');
    } finally {
      setIsImporting(false);
    }
  };

  const handleScrapeAndImport = async () => {
    setIsLoading(true);
    setScrapedEvents([]);
    setImportResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-bookmyshow-events', {
        body: {
          action: 'scrape-and-import',
          url,
          dryRun,
          editorialStatus: 'draft',
          isIndexable: false,
        },
      });

      if (error) throw error;

      if (data.success && data.results) {
        setImportResults(data.results);
        toast.success(
          dryRun
            ? `Dry run: ${data.results.imported} events would be imported as drafts`
            : `Imported ${data.results.imported} new draft events`
        );
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (err) {
      console.error('Operation error:', err);
      toast.error('Failed to scrape and import');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            BookMyShow Event Scraper
          </CardTitle>
          <CardDescription>
            Scrape events from BookMyShow and bring them into admin as <strong>draft</strong> records for review.
            Admin should enrich locality, venue, categories, artists, SEO, and publish later.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="scrape-url">BookMyShow URL</Label>
            <Input
              id="scrape-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://in.bookmyshow.com/explore/events-jaipur"
            />
            <p className="text-xs text-muted-foreground">
              Use an events listing page URL for the city or feed you want to scrape.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="dry-run"
              checked={dryRun}
              onCheckedChange={setDryRun}
            />
            <Label htmlFor="dry-run" className="flex flex-col">
              <span>Dry Run Mode</span>
              <span className="text-xs text-muted-foreground font-normal">
                Preview imports without creating any records.
              </span>
            </Label>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleScrape}
              disabled={isScraping || isLoading}
              variant="outline"
            >
              {isScraping ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Scrape Events
                </>
              )}
            </Button>

            <Button
              onClick={handleImport}
              disabled={isImporting || scrapedEvents.length === 0 || isLoading}
              variant="outline"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Import {scrapedEvents.length > 0 ? `(${scrapedEvents.length})` : ''}
                </>
              )}
            </Button>

            <Button
              onClick={handleScrapeAndImport}
              disabled={isLoading || isScraping || isImporting}
              className="bg-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Scrape & Import as Drafts
                </>
              )}
            </Button>
          </div>

          {scrapedEvents.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium">Scraped Events ({scrapedEvents.length})</h4>
              <ScrollArea className="h-64 rounded-md border">
                <div className="p-4 space-y-3">
                  {scrapedEvents.map((event, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      {event.imageUrl ? (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                      ) : null}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.venue}
                        </p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {event.category}
                          </Badge>
                          {event.price ? (
                            <Badge variant="outline" className="text-xs">
                              {event.price}
                            </Badge>
                          ) : null}
                          <Badge variant="outline" className="text-xs">
                            Draft on import
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : null}

          {importResults ? (
            <div className="space-y-3">
              <h4 className="font-medium">Import Results</h4>

              <div className="grid grid-cols-4 gap-3">
                <Card className="p-3">
                  <p className="text-2xl font-bold">{importResults.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </Card>

                <Card className="p-3 bg-green-500/10 border-green-500/20">
                  <p className="text-2xl font-bold text-green-600">{importResults.imported}</p>
                  <p className="text-xs text-muted-foreground">
                    {dryRun ? 'Would Import' : 'Imported'}
                  </p>
                </Card>

                <Card className="p-3 bg-yellow-500/10 border-yellow-500/20">
                  <p className="text-2xl font-bold text-yellow-600">{importResults.skipped}</p>
                  <p className="text-xs text-muted-foreground">Skipped</p>
                </Card>

                <Card className="p-3 bg-red-500/10 border-red-500/20">
                  <p className="text-2xl font-bold text-red-600">{importResults.failed}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </Card>
              </div>

              <ScrollArea className="h-64 rounded-md border">
                <div className="p-4 space-y-2">
                  {importResults.details.map((result, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-2 rounded ${
                        result.status === 'imported' || result.status === 'would-import'
                          ? 'bg-green-500/10'
                          : result.status === 'skipped'
                          ? 'bg-yellow-500/10'
                          : 'bg-red-500/10'
                      }`}
                    >
                      {result.status === 'imported' || result.status === 'would-import' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      ) : result.status === 'skipped' ? (
                        <SkipForward className="h-4 w-4 text-yellow-600 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{result.title}</p>
                        {result.slug ? (
                          <p className="text-xs text-muted-foreground truncate">
                            /events/{result.slug}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex gap-1 flex-wrap">
                        {result.category ? (
                          <Badge variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {result.category}
                          </Badge>
                        ) : null}
                        {result.locality ? (
                          <Badge variant="secondary" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" />
                            {result.locality}
                          </Badge>
                        ) : null}
                        {(result.status === 'imported' || result.status === 'would-import') ? (
                          <Badge variant="outline" className="text-xs">
                            Draft
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Import Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <span><strong>Draft-first workflow:</strong> imported events should be reviewed before publishing.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <span><strong>SEO enrichment:</strong> admin should complete locality, venue, categories, artists, and metadata in the event editor.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <span><strong>Duplicate protection:</strong> importer should continue to avoid duplicate events where possible.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <span><strong>Source retention:</strong> keep source URL and scraped provenance where available.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
