import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    const onMouseMove = (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };
    
    window.addEventListener('mousemove', onMouseMove);
    
    const loop = () => {
      const delay = 6;
      cursorPos.x += (mousePos.x - cursorPos.x) / delay;
      cursorPos.y += (mousePos.y - cursorPos.y) / delay;
      gsap.set(cursor, { x: cursorPos.x, y: cursorPos.y });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div 
      ref={cursorRef} 
      className="fixed top-[-25px] left-[-25px] w-[50px] h-[50px] rounded-full pointer-events-none z-[9999] bg-[#e6c3ff] mix-blend-difference shadow-[0_0_30px_rgb(175,131,255)]"
    />
  );
}