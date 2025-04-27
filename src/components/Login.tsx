import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

interface Login3Props {
  heading?: string;
  subheading?: string;
  logo: {
    url: string;
    src: string;
    alt: string;
  };
  googleText?: string;
}

const Login3 = ({
  heading = "Login",
  subheading = "Continue with Google",
  logo = {
    url: "#",
    src: "https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg",
    alt: "Logo",
  },
  googleText = "Log in with Google",
}: Login3Props) => {
  const { signInWithGoogle } = useAuthStore();

  const handleGoogleSignIn = async () => {
    try {
      // We only need to initiate Google OAuth flow here
      await signInWithGoogle();
      
      // Note: Google OAuth will redirect, so we don't need to handle the state here
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  return (
    <section className="py-4">
      <div className="flex flex-col items-center gap-4">
        <a href={logo.url} className="flex items-center gap-2 mb-4">
          <img src={logo.src} className="max-h-8" alt={logo.alt} />
        </a>
        <h1 className="text-2xl font-bold">{heading}</h1>
        <p className="text-muted-foreground">{subheading}</p>

        <Button
          variant="outline"
          className="w-full mt-6 flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
        >
          <FcGoogle className="h-5 w-5" />
          {googleText}
        </Button>
      </div>
    </section>
  );
};

export { Login3 };
