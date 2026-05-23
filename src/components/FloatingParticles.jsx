import React from 'react';
import { motion } from "framer-motion";

const FloatingParticles = () => {
  const particles = Array.from({ length: 30 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => {
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        const randomDuration = Math.random() * 10 + 10;
        const randomDelay = Math.random() * 5;
        const randomSize = Math.random() * 4 + 2;

        return (
          <motion.div
            key={i}
            className="absolute bg-blue-400 rounded-full blur-[1px]"
            style={{
              width: randomSize,
              height: randomSize,
              left: `${randomX}vw`,
              top: `${randomY}vh`,
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 0.5, 0],
              y: -100,
              x: (Math.random() - 0.5) * 50
            }}
            transition={{
              duration: randomDuration,
              delay: randomDelay,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        );
      })}
    </div>
  );
};

export default FloatingParticles;