import { useState, useEffect, useRef } from "react";

interface TypingInputProps {
  style: string;
  onChange: (value: string) => void;
  placeholders: string[];
  handleKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const TypingInput = ({
  style,
  onChange,
  placeholders,
  handleKeyDown,
}: TypingInputProps) => {
  const [currentText, setCurrentText] = useState("");
  const [index, setIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 2000;

  // Ref to store the timeoutId so we don't trigger re-renders
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear the previous timeout when the component unmounts or before setting a new one
    const type = () => {
      const currentWord = placeholders[index];

      if (isTyping) {
        if (currentText.length < currentWord.length) {
          timeoutIdRef.current = setTimeout(() => {
            setCurrentText(currentWord.slice(0, currentText.length + 1));
          }, typingSpeed);
        } else {
          timeoutIdRef.current = setTimeout(() => setIsTyping(false), pauseTime);
        }
      } else {
        if (currentText.length === 0) {
          setIndex((prev) => (prev + 1) % placeholders.length);
          setIsTyping(true);
        } else {
          timeoutIdRef.current = setTimeout(() => {
            setCurrentText(currentText.slice(0, -1));
          }, deletingSpeed);
        }
      }
    };

    type();

    // Cleanup on unmount or before starting a new timeout
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [currentText, isTyping, index]);

  return (
    <input
      type="text"
      placeholder={currentText}
      onChange={(e) => onChange?.(e.target.value)}
      className={style}
      onKeyDown={handleKeyDown}
    />
  );
};

export default TypingInput;
