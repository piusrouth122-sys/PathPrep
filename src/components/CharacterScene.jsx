import React from "react";
import Spline from '@splinetool/react-spline';

export default function CharacterScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Spline scene="https://prod.spline.design/1Ji-8Etaeh1rxwiv/scene.splinecode" />
    </div>
  );
}