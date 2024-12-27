import { useState, useEffect } from "react";

interface TypingInputProps {
  style: string;
  onChange: (value: string) => void;
  placeholders: string[];
}

const TypingInput = ({ style, onChange, placeholders }: TypingInputProps) => {
  const [currentText, setCurrentText] = useState("");
  const [index, setIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 2000;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      const currentWord = placeholders[index];
      if (isTyping) {
        if (currentText.length < currentWord.length) {
          timeoutId = setTimeout(() => {
            setCurrentText(currentWord.slice(0, currentText.length + 1));
          }, typingSpeed);
        } else {
          timeoutId = setTimeout(() => setIsTyping(false), pauseTime);
        }
      } else {
        if (currentText.length === 0) {
          setIndex((prev) => (prev + 1) % placeholders.length);
          setIsTyping(true);
        } else {
          timeoutId = setTimeout(() => {
            setCurrentText(currentText.slice(0, -1));
          }, deletingSpeed);
        }
      }
    };

    type();
    return () => clearTimeout(timeoutId);
  }, [currentText, isTyping, index]);

  return (
    <input
      type="text"
      placeholder={currentText}
      onChange={(e) => onChange?.(e.target.value)}
      className={style}
    />
  );
};

export default TypingInput;
