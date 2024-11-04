"use client";
import { useGLTF, useAnimations } from "@react-three/drei";
import { act, useEffect, useRef, useState } from "react";
import { LoopOnce, Mesh } from "three";

interface AnimationAction {
  play: () => void;
  stop: () => void;
  reset: () => void;
}

interface HandModelProps {
  color?: string;
  animationName?: string;
  trigger?: number;
  position?: [number, number, number];
  scale?: number;
}

export function HandModel({
  animationName,
  trigger,
  ...props
}: HandModelProps) {
  const { scene, animations } = useGLTF("/models/modelfix2glb.glb");
  const { actions } = useAnimations(animations, scene);
  const activeActionRef = useRef<AnimationAction | null>(null);

  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    if (actions) {
      if (animationName === "Stop Animation") {
        Object.values(actions).forEach((action) => {
          if (action) action.stop();
        });
        activeActionRef.current = null;
      } else {
        const action = animationName ? actions[animationName] : undefined;
        if (action) {
          if (activeActionRef.current) activeActionRef.current.stop();
          action.reset();
          action.setLoop(LoopOnce, 1);
          action.setDuration(3);
          action.clampWhenFinished = true;
          action.play();
          activeActionRef.current = action;
        }
      }
    }
  }, [animationName, trigger]);

  return <primitive object={scene} {...props} rotation={[0, 0, 0]} />;
}

useGLTF.preload("/models/modelfix2glb.glb");
