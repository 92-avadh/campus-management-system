import React from "react";
import { motion } from "framer-motion";

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }} // Starts slightly invisible and below
      animate={{ opacity: 1, y: 0 }}   // Slides up to its position
      exit={{ opacity: 0, y: -25 }}    // Fades out upward on leave
      transition={{ 
        duration: 0.8,                // Moderate appearance time
        ease: [0.22, 1, 0.36, 1]      // Custom smooth easing curve
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;