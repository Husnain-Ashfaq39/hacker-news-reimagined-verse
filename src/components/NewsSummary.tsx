import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Story } from '@/services/hnService';
import { GroqService } from '@/services/groqService';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { Sparkles, RefreshCw, AlertCircle, Copy, CheckCircle2, Lock } from 'lucide-react';
import { ShareSummary } from '@/components/ShareSummary';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';

interface NewsSummaryProps {
  stories: Story[];
}

export function NewsSummary({ stories }: NewsSummaryProps) {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<string>('');
  const [summary$id, setSummary$id] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{currentCount: number; dailyLimit: number} | null>(null);

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

  // Check user's daily usage limit
  const checkUsageLimit = async () => {
    if (!user || !user.$id) {
      return false;
    }
    
    try {
      const { limitReached, currentCount } = await GroqService.checkDailyLimit(user.$id);
      setUsageInfo({
        currentCount,
        dailyLimit: 10 // Should match the limit in GroqService
      });
      return !limitReached;
    } catch (err) {
      console.error('Error checking usage limit:', err);
      return false;
    }
  };

  const generateSummary = async () => {
    if (stories.length === 0) {
      setError('No stories available to summarize.');
      return;
    }

    // Check if user is logged in
    if (!user) {
      setError('Please log in to generate summaries.');
      return;
    }

    // Check usage limit
    const canGenerate = await checkUsageLimit();
    if (!canGenerate) {
      setError(`You've reached your daily limit of 10 summaries. Please try again tomorrow.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await GroqService.generateNewsSummary(stories, user.$id);
      console.log(response);
      
      if (response.status === 'success') {
        setSummary(response.summary);
        setIsLoading(false);
        
        // Refresh usage count after generating summary
        await checkUsageLimit();
        
        // Save summary ID for sharing
        if (response.$id) {
          setSummary$id(response.$id);
        }
      } else {
        setError(response.message || 'Failed to generate summary.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred while generating the summary.');
      console.error('Summary generation error:', err);
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      // Strip HTML tags for clean clipboard text
      const cleanText = summary.replace(/<[^>]*>/g, '');
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-hn-orange/10 to-blue-500/10 hover:from-hn-orange/20 hover:to-blue-500/20"
          onClick={() => {
            if (!user) {
              // Show login requirement
              setError('Please log in to generate summaries.');
              setIsOpen(true);
            } else if (!summary) {
              generateSummary();
              setIsOpen(true);
            } else {
              setIsOpen(true);
            }
          }}
        >
          <Sparkles className="h-4 w-4 text-hn-orange" />
          <span>Generate Summary Using Our AI</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] w-[95vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-hn-orange" />
            News Summary
          </DialogTitle>
          {usageInfo && user && (
            <DialogDescription className="text-xs mt-1">
              You've used {usageInfo.currentCount} of {usageInfo.dailyLimit} summaries today
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-hn-orange mb-4" />
              <p className="text-sm text-muted-foreground">Generating summary with AI...</p>
              <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex flex-col items-start gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">Error generating summary</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
              
              {!user && (
                <div className="w-full mt-2 p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Lock className="h-4 w-4" />
                    <span>Authentication Required</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Please log in to generate summaries. Each user can generate up to 10 summaries per day.
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link to="/login">Log in with Google</Link>
                  </Button>
                </div>
              )}
              
              {user && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3" 
                  onClick={generateSummary}
                >
                  Try Again
                </Button>
              )}
            </div>
          ) : summary ? (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatSummary(summary) }} />
              
              <div className="mt-6 text-xs text-muted-foreground">
                <p className="italic">Summary generated based on current news stories</p>
              </div>
              
              {/* Share section */}
              {summary$id && (
                <>
                  <ShareSummary summary$id={summary$id} summaryText={summary} />
                  <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 p-2 rounded-md flex items-start">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                    <span>
                      Shared links with Friends and Social Media.
                    </span>
                  </div>
                </>
              )}
              
              <div className="mt-4 flex flex-wrap gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1" 
                  onClick={copyToClipboard}
                  disabled={copied}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1" 
                  onClick={generateSummary}
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              {user ? (
                <>
                  <p className="text-sm text-muted-foreground">Click generate to summarize the current news stories</p>
                  <Button 
                    className="mt-4" 
                    onClick={generateSummary}
                  >
                    Generate Summary
                  </Button>
                </>
              ) : (
                <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-md">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Lock className="h-4 w-4" />
                    <span>Authentication Required</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Please log in to generate summaries. Each user can generate up to 10 summaries per day.
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link to="/login">Log in with Google</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 