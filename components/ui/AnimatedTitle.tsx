import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnimatedTitleProps {
  title: string;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ title }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-2 text-lg font-bold text-yellow-300 bg-yellow-900/10 px-4 py-2 rounded-full border border-yellow-600/40"
    >
      <Sparkles className="w-5 h-5 animate-pulse" />
      {title}
    </motion.div>
  );
};