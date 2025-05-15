import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { GroqService } from '@/services/groqService';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, Share2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShareSummary } from '@/components/ShareSummary';

export function SharedSummary() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<string>('');
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSummary = async () => {
      if (!id) {
        setError('Invalid summary ID');
        setLoading(false);
        return;
      }
      
      try {
        // Attempt to retrieve the summary
        const summaryData = await GroqService.getSummaryById(id);
        
        if (summaryData) {
          setSummary(summaryData.summary);
          setTimestamp(summaryData.timestamp);
          setLoading(false);
        } else {
          // If summary not found, provide a more detailed error message
          setError(
            'Summary not found. It may have expired or been removed. ' +
            'If you received this link from someone, ask them to regenerate the summary.'
          );
          setLoading(false);
        }
      } catch (err) {
        console.error('Error retrieving summary:', err);
        setError('An error occurred while retrieving the summary.');
        setLoading(false);
      }
    };
    
    fetchSummary();
  }, [id]);
  
  // Format the summary text to improve readability
  const formatSummary = (text: string) => {
    if (!text) return '';
    
    // Remove the introduction paragraph without removing Overall Summary section
    let formatted = text;
    
    // Remove only intro texts like "Here is the summary:" 
    // but stop before removing "Overall Summary:" section
    formatted = formatted.replace(/^Here is (?:a |the )?(?:concise )?summary(?:\s?of[^:]*)?:(?:(?!Overall Summary:)[\s\S])*?(?=Overall Summary:|Key Trends:)/i, '');
    
    // Remove any other generic intro text that appears before the first section 
    // but make sure to preserve the section headers
    formatted = formatted.replace(/^(?:(?!Overall Summary:|Key Trends:|Most Significant).)*?(?=Overall Summary:|Key Trends:|Most Significant)/s, '');
    
    // Remove asterisks from section headers
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '$1');
    
    // Make section headers bold with more spacing
    formatted = formatted.replace(/(Overall Summary:|Key Trends:|Most Significant Developments:|Connections and Patterns:)/g, 
      '<h3 class="font-bold text-lg mt-6 mb-3">$1</h3>');
    
    // Format numbered points with better spacing and styling
    formatted = formatted.replace(/(\d+)\.\s+(.*?)(?=(\d+\.|$))/gs, 
      '<div class="mb-4"><span class="font-medium">$1.</span> $2</div>');
    
    // Add spacing between paragraphs
    formatted = formatted.replace(/\n\n/g, '<div class="my-3"></div>');
    
    // Replace single line breaks with spacing
    formatted = formatted.replace(/\n/g, '<br class="my-1" />');
    
    return formatted;
  };
  
  // Format timestamp (handles both seconds and milliseconds)
  const formatDate = (timestamp: number) => {
    // Check if timestamp is in seconds (less than year 2100 in seconds)
    // or milliseconds (current timestamp in ms is around 13 digits)
    const isMilliseconds = timestamp > 4000000000;
    
    // Convert seconds to milliseconds for Date constructor if needed
    const date = new Date(isMilliseconds ? timestamp : timestamp * 1000);
    return date.toLocaleString();
  };
  
  return (
    <PageLayout>
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Hacker News
            </Link>
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold flex items-center">
                  <Share2 className="h-5 w-5 mr-2 text-hn-orange" />
                  Shared Tech Summary
                </h1>
                {timestamp && (
                  <div className="text-xs text-muted-foreground">
                    Generated: {formatDate(timestamp)}
                  </div>
                )}
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-hn-orange border-r-transparent" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">Loading summary...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex flex-col items-start gap-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Error loading summary</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4 w-full justify-center sm:justify-start">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/')}
                      className="flex items-center gap-1.5"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Return to Home
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="flex items-center gap-1.5 bg-hn-orange hover:bg-hn-orange/90"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <div 
                    className="whitespace-pre-wrap" 
                    dangerouslySetInnerHTML={{ __html: formatSummary(summary) }} 
                  />
                  
                  <div className="mt-6 text-xs text-muted-foreground">
                    <p className="italic">Summary generated based on Hacker News stories</p>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t">
                    <ShareSummary summary$id={id || ''} summaryText={summary} />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Want to generate your own tech news summaries?</p>
            <Button asChild variant="link" className="mt-1">
              <Link to="/">
                Visit Hacker News Reimagined
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 