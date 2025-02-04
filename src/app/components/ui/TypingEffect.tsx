import { useState, useEffect } from "react";

const TypingEffect = ({
  text,
  speed = 50,
  className = "",
  onComplete = () => {},
}: {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete();
    }
  }, [currentIndex, speed, text, isComplete, onComplete]);

  return (
    <div className={`font-mono ${className}`}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </div>
  );
};

export default TypingEffect;
