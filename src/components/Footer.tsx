
import { Link } from "react-router-dom";
import { Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-8 mt-12">
      <div className="container">
        <div className="flex flex-col md:flex-row md:justify-between gap-6">
          <div className="md:max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-hn-orange text-white font-bold h-6 w-6 rounded flex items-center justify-center text-sm">
                HN
              </div>
              <span className="font-semibold">Hacker News</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A modern UI redesign of Hacker News, focused on readability and usability while maintaining the simplicity of the original.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Browse</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-muted-foreground hover:text-hn-orange">Home</Link></li>
                <li><Link to="/newest" className="text-muted-foreground hover:text-hn-orange">New</Link></li>
                <li><Link to="/ask" className="text-muted-foreground hover:text-hn-orange">Ask</Link></li>
                <li><Link to="/show" className="text-muted-foreground hover:text-hn-orange">Show</Link></li>
                <li><Link to="/jobs" className="text-muted-foreground hover:text-hn-orange">Jobs</Link></li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">About</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-hn-orange">Original HN</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-hn-orange">Guidelines</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-hn-orange">FAQ</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-hn-orange">API</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-hn-orange">Security</a></li>
              </ul>
            </div>
            
            <div className="space-y-3 col-span-2 md:col-span-1">
              <h4 className="font-medium">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="#" 
                    className="text-muted-foreground hover:text-hn-orange inline-flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="text-muted-foreground hover:text-hn-orange inline-flex items-center gap-2"
                  >
                    <Twitter className="h-4 w-4" />
                    <span>Twitter</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
          <p>This is a redesign concept. Original Hacker News content is owned and operated by Y Combinator.</p>
          <p className="mt-1">© {new Date().getFullYear()} Hacker News</p>
        </div>
      </div>
    </footer>
  );
}
