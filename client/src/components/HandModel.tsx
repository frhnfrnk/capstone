"use client";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { Mesh } from "three";

interface AnimationAction {
  play: () => void;
  stop: () => void;
  reset: () => void;
}

interface HandModelProps {
  color?: string;
  animationName?: string;
  position?: [number, number, number];
  scale?: number;
}

export function HandModel({
  color = "#C0C0C0",
  animationName,
  ...props
}: HandModelProps) {
  const { scene, animations } = useGLTF("/models/test.glb");
  const { actions } = useAnimations(animations, scene);
  const activeActionRef = useRef<AnimationAction | null>(null);

  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.material.color.set(color);
        if (object.material.map) {
          object.material.map = null;
        }
      }
    });
  }, [scene, color]);

  useEffect(() => {
    if (actions) {
      if (animationName === "Stop Animation") {
        Object.values(actions).forEach((action) => {
          if (action) {
            action.stop();
          }
        });
        activeActionRef.current = null;
      } else {
        const action = animationName ? actions[animationName] : undefined;
        if (action) {
          if (activeActionRef.current) {
            activeActionRef.current.stop();
          }
          action.reset();
          action.play();
          activeActionRef.current = action;
        }
      }
    }
  }, [animationName]);

  return <primitive object={scene} {...props} rotation={[0, 0, 0]} />;
}

useGLTF.preload("/models/test.glb");
