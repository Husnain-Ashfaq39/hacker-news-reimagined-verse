import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Twitter,
  Linkedin,
  Facebook,
  Link as LinkIcon,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';

interface ShareSummaryProps {
  summary$id: string;
  summaryText: string;
}

export function ShareSummary({ summary$id, summaryText }: ShareSummaryProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [showShareLink, setShowShareLink] = useState(false);
  
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/summary/${summary$id}`;
  
  // Clean summary text for sharing (strip HTML and limit length)
  const cleanText = summaryText.replace(/<[^>]*>/g, '')
    .substring(0, 150) // Limit length for social sharing
    .trim() + '...';
  
  const shareTitle = 'Tech News Summary from Hacker News Reimagined';
  
  // Prepare social media sharing URLs
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`Check out this tech news summary: ${shareUrl}`)}`;

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h4 className="text-sm font-medium">Share this summary:</h4>
        
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            {/* Twitter */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => window.open(twitterUrl, '_blank')}
                >
                  <Twitter className="h-3.5 w-3.5 text-blue-400" />
                  <span className="sr-only">Share on Twitter</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share on Twitter</p>
              </TooltipContent>
            </Tooltip>
            
            {/* LinkedIn */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => window.open(linkedinUrl, '_blank')}
                >
                  <Linkedin className="h-3.5 w-3.5 text-blue-700" />
                  <span className="sr-only">Share on LinkedIn</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share on LinkedIn</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Facebook */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => window.open(facebookUrl, '_blank')}
                >
                  <Facebook className="h-3.5 w-3.5 text-blue-600" />
                  <span className="sr-only">Share on Facebook</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share on Facebook</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Email */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => window.open(mailtoUrl, '_blank')}
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span className="sr-only">Share via Email</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share via Email</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Copy Link Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => setShowShareLink(!showShareLink)}
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">Get Shareable Link</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Get Shareable Link</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {showShareLink && (
        <div className="mt-3 flex gap-2 items-center">
          <Input 
            value={shareUrl} 
            readOnly 
            className="text-xs font-mono"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyShareLink}
            className="whitespace-nowrap"
          >
            {linkCopied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
                Copy
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 