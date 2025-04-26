

import React, { useState, useEffect, useRef } from 'react';
import { useInView, useScroll, useTransform } from 'framer-motion'
import { motion } from 'framer-motion';
import { animate } from 'framer-motion';

export const GlowingOrb = ({ color = 'indigo', size = 'md', delay = 0, className = '' }) => {
  // Size mapping
  const sizeClass = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  }[size] || 'w-24 h-24';
  
  // Color mapping
  const colorClass = {
    indigo: 'bg-indigo-400',
    purple: 'bg-purple-400',
    pink: 'bg-pink-400'
  }[color] || 'bg-indigo-400';
  
  return (
    <motion.div 
      className={`${sizeClass} rounded-full ${colorClass} opacity-20 filter blur-3xl absolute ${className}`}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.1, 0.3, 0.1]
      }}
      transition={{
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
        delay
      }}
    />
  );
};



export const FloatingElement = ({ children, delay = 0, duration = 6, className = '' }) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -15, 0]
      }}
      transition={{
        duration,
        ease: "easeInOut",
        repeat: Infinity,
        delay
      }}
    >
      {children}
    </motion.div>
  );
};

// components/animations/FadeInView.js


export const FadeInView = ({ children, delay = 0, direction = 'up', className = '' }) => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });
    
    // Map direction to initial properties
    const directionMap = {
      up: { y: 20, opacity: 0 },
      down: { y: -20, opacity: 0 },
      left: { x: 20, opacity: 0 },
      right: { x: -20, opacity: 0 },
      fade: { opacity: 0 }
    };
    
    return (
      <motion.div
        ref={ref}
        initial={directionMap[direction]}
        animate={isInView ? { opacity: 1, x: 0, y: 0 } : directionMap[direction]}
        transition={{ duration: 0.5, delay }}
        className={className}
      >
        {children}
      </motion.div>
    );
  };
// components/animations/TextGlitch.js


export const TextGlitch = ({ text, interval = 70, iterations = 2, className = '' }) => {
  const [displayText, setDisplayText] = useState(text);
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  useEffect(() => {
    let timeout;
    let iteration = 0;
    let position = 0;
    
    const randomChar = () => characters.charAt(Math.floor(Math.random() * characters.length));
    
    const glitchText = () => {
      if (position < text.length) {
        // Create array from original text
        const textArray = text.split('');
        
        // Replace current position with random character
        if (iteration < iterations) {
          textArray[position] = randomChar();
          setDisplayText(textArray.join(''));
          timeout = setTimeout(glitchText, interval);
          iteration++;
        } else {
          // When done with iterations, set correct character and move to next position
          textArray[position] = text[position];
          setDisplayText(textArray.join(''));
          position++;
          iteration = 0;
          timeout = setTimeout(glitchText, interval);
        }
      } else {
        // Reset to original text when done
        setDisplayText(text);
      }
    };
    
    // Start the glitch effect
    timeout = setTimeout(glitchText, interval);
    
    return () => clearTimeout(timeout);
  }, [text, interval, iterations]);
  
  return <span className={className}>{displayText}</span>;
};



export const TypewriterEffect = ({ 
  text, 
  speed = 50, 
  delay = 0, 
  cursor = true,
  className = '' 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    let timeout;
    
    // Delay before starting
    if (!isTyping && currentIndex === 0) {
      timeout = setTimeout(() => {
        setIsTyping(true);
      }, delay);
      return () => clearTimeout(timeout);
    }
    
    // Start typing
    if (isTyping && currentIndex < text.length) {
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
    
  }, [text, speed, delay, currentIndex, isTyping]);
  
  return (
    <span className={className}>
      {displayText}
      {cursor && isTyping && currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
};



export const AnimatedCounter = ({ 
    from = 0, 
    to, 
    duration = 2, 
    delay = 0,
    formatter = (value) => Math.round(value),
    className = '' 
  }) => {
    const [count, setCount] = useState(from);
    const ref = React.useRef(null);
    const isInView = useInView(ref, { 
      once: true, 
      amount: 0.1 
    });
    
    useEffect(() => {
      if (isInView) {
        const timeout = setTimeout(() => {
          const controls = animate(from, to, {
            duration,
            onUpdate: (value) => {
              setCount(formatter(value));
            }
          });
          
          return () => controls.stop();
        }, delay * 1000);
        
        return () => clearTimeout(timeout);
      }
    }, [isInView, from, to, duration, delay, formatter]);
    
    return <span ref={ref} className={className}>{count}</span>;
  };



export const ShimmerButton = ({ 
  children, 
  onClick, 
  className = '',
  shimmerColor = 'rgba(255, 255, 255, 0.2)' 
}) => {
  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{ background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)` }}
        variants={{
          hover: {
            x: ['100%', '-100%'],
            transition: {
              repeat: Infinity,
              duration: 1.5
            }
          }
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};


export const ParallaxScroll = ({ 
  children, 
  speed = 0.5, 
  direction = 'up',
  className = '' 
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // Convert direction to actual transform
  const yRange = direction === 'up' ? [100, -100] : [-100, 100];
  
  // Adjust speed
  const adjustedYRange = [yRange[0] * speed, yRange[1] * speed];
  
  const y = useTransform(scrollYProgress, [0, 1], adjustedYRange);
  
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="w-full h-full">
        {children}
      </motion.div>
    </div>
  );
};
