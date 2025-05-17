import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare, X, Send } from "lucide-react";
import { feedbackService } from "@/services/feedbackService";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export const FeedbackForm = () => {
    const [feedbackText, setFeedbackText] = useState("");
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1); // 1 = rating, 2 = feedback text

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast({
                title: "Rating Required",
                description: "Please select a rating before submitting feedback",
                variant: "destructive",
            });
            return;
        }

        if (feedbackText.trim().length < 5) {
            toast({
                title: "Feedback Too Short",
                description: "Please provide more detailed feedback",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await feedbackService.submitFeedback(feedbackText, rating);
            toast({
                title: "Thank You!",
                description: "Your feedback has been submitted successfully.",
            });
            setFeedbackText("");
            setRating(0);
            setStep(1);
            
            // Delay closing to show success animation
            setTimeout(() => {
                setIsOpen(false);
            }, 1000);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast({
                title: "Submission Failed",
                description: "There was an error submitting your feedback. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleFeedback = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setStep(1);
        }
    };
    
    const nextStep = () => {
        if (rating === 0) {
            toast({
                title: "Rating Required",
                description: "Please select a rating before continuing",
                variant: "destructive",
            });
            return;
        }
        setStep(2);
    };
    
    const prevStep = () => {
        setStep(1);
    };

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <AnimatePresence>
                {!isOpen ? (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        <Button
                            onClick={toggleFeedback}
                            className="bg-hn-orange hover:bg-hn-orange-dark text-white rounded-full shadow-lg flex items-center gap-2 px-4 py-6"
                        >
                            <MessageSquare className="h-5 w-5" />
                            <span>Feedback</span>
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ y: 20, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 20, opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="bg-card rounded-lg border shadow-xl p-5 w-80 backdrop-blur-sm bg-opacity-95"
                        style={{
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                        }}
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-medium text-lg">
                                    {step === 1 ? "How was your experience?" : "Tell us more"}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleFeedback}
                                    className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <AnimatePresence mode="wait">
                                {step === 1 ? (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex justify-center">
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <motion.button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setRating(star)}
                                                        onMouseEnter={() => setHoveredRating(star)}
                                                        onMouseLeave={() => setHoveredRating(0)}
                                                        className="focus:outline-none"
                                                        whileHover={{ scale: 1.2 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <Star
                                                            className={`h-8 w-8 transition-all duration-200 ${
                                                                star <= (hoveredRating || rating)
                                                                    ? "fill-hn-orange text-hn-orange"
                                                                    : "text-gray-300"
                                                            }`}
                                                        />
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="text-center text-sm text-muted-foreground">
                                            {rating === 0 && "Select a rating"}
                                            {rating === 1 && "Poor - Needs significant improvement"}
                                            {rating === 2 && "Fair - Could be better"}
                                            {rating === 3 && "Good - Meets expectations"}
                                            {rating === 4 && "Great - Exceeded expectations"}
                                            {rating === 5 && "Excellent - Outstanding experience!"}
                                        </div>
                                        
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            className="w-full bg-hn-orange hover:bg-hn-orange-dark text-white"
                                        >
                                            Continue
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-center justify-center mb-2">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`h-4 w-4 ${
                                                            star <= rating
                                                                ? "fill-hn-orange text-hn-orange"
                                                                : "text-gray-300"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="feedback" className="block text-sm mb-1 font-medium">
                                                Please share your thoughts
                                            </label>
                                            <Textarea
                                                id="feedback"
                                                placeholder="What did you like? What could be improved?"
                                                value={feedbackText}
                                                onChange={(e) => setFeedbackText(e.target.value)}
                                                className="min-h-24 resize-none focus:ring-hn-orange focus:border-hn-orange"
                                            />
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={prevStep}
                                                className="flex-1"
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="flex-1 bg-hn-orange hover:bg-hn-orange-dark text-white flex items-center justify-center gap-2"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                                        <span>Sending</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4" />
                                                        <span>Submit</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}; 