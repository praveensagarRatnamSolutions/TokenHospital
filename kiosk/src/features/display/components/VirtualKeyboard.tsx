import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, Space, ArrowBigUp, Check, X } from "lucide-react";

interface VirtualKeyboardProps {
  layout?: "default" | "numeric";
  onKeyPress: (key: string) => void;
  onClose: () => void;
  isVisible: boolean;
  lockLayout?: boolean;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  layout = "default",
  onKeyPress,
  onClose,
  isVisible,
  lockLayout = false,
}) => {
  const [isShift, setIsShift] = useState(false);

  const defaultLayout = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["shift", "z", "x", "c", "v", "b", "n", "m", "backspace"],
    ["123", "space", "enter"],
  ];

  const numericLayout = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["abc", "0", "backspace", "enter"],
  ];

  const [currentLayoutType, setCurrentLayoutType] = useState(layout);

  useEffect(() => {
    setCurrentLayoutType(layout);
  }, [layout]);

  const handleKeyClick = (key: string) => {
    if (key === "shift") {
      setIsShift(!isShift);
    } else if (key === "123") {
      setCurrentLayoutType("numeric");
    } else if (key === "abc") {
      setCurrentLayoutType("default");
    } else if (key === "enter") {
        onClose();
    } else {
      let output = key;
      if (key === "space") output = " ";
      if (isShift && key.length === 1) output = key.toUpperCase();
      onKeyPress(output);
    }
  };

  const currentLayout = currentLayoutType === "numeric" ? numericLayout : defaultLayout;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[100] bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-t border-slate-200 dark:border-white/10 p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.3)]"
        >
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/30">
                Virtual Keyboard
              </span>
              <button
                onClick={onClose}
                className="size-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/30 hover:bg-red-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {currentLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-2">
                {row.map((key) => {
                  let displayKey: React.ReactNode = key;
                  let customClass = "";

                  if (key === "shift") {
                    displayKey = <ArrowBigUp size={24} fill={isShift ? "currentColor" : "none"} />;
                    customClass = isShift ? "bg-sky-500 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white";
                  } else if (key === "backspace") {
                    displayKey = <Delete size={24} />;
                    customClass = "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white flex-[1.5]";
                  } else if (key === "space") {
                    displayKey = <Space size={24} />;
                    customClass = "flex-[4] bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white";
                  } else if (key === "enter") {
                    displayKey = <Check size={24} />;
                    customClass = "bg-sky-500 text-white flex-[1.5]";
                  } else if (key === "123" || key === "abc") {
                    if (lockLayout) return null;
                    displayKey = key === "123" ? "123" : "ABC";
                    customClass = "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black";
                  } else {
                    displayKey = isShift ? key.toUpperCase() : key;
                    customClass = "bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white";
                  }

                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleKeyClick(key)}
                      className={`
                        h-16 min-w-[3.5rem] rounded-2xl flex items-center justify-center text-xl font-bold transition-colors
                        ${customClass}
                        ${!customClass.includes("flex-") ? "flex-1" : ""}
                        border border-slate-200/50 dark:border-white/5
                      `}
                    >
                      {displayKey}
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VirtualKeyboard;
