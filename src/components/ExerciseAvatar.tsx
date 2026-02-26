import { useState } from "react";
import { findExerciseSpec } from "@/data/exerciseMovementSpecs";
import AnatomicalAvatar from "@/components/AnatomicalAvatar";
import LegacyExerciseAvatar from "@/components/LegacyExerciseAvatar";
import BreathingVisualizer from "@/components/BreathingVisualizer";

interface ExerciseAvatarProps {
  exerciseName: string;
  side?: "left" | "right" | null;
  isPlaying: boolean;
  className?: string;
  showMuscles?: boolean;
  showJointMarkers?: boolean;
  onCueChange?: (cue: string | null) => void;
}

const ExerciseAvatar = ({ exerciseName, side, isPlaying, className = "", showMuscles, showJointMarkers, onCueChange }: ExerciseAvatarProps) => {
  const n = exerciseName.toLowerCase();
  
  // Check if this is a breathwork / meditation exercise
  const isBreathwork = n.includes("breath") || n.includes("4-7-8") || n.includes("box") ||
    n.includes("calm") || n.includes("diaphragm") || n.includes("nostril") ||
    n.includes("alternate") || n.includes("coherent") || n.includes("cyclic") ||
    n.includes("meditation") || n.includes("sigh");

  // Try to find a detailed movement spec first
  const spec = findExerciseSpec(exerciseName);

  // If breathwork spec exists, use anatomical avatar (it handles rib expansion)
  // If breathwork but no spec, use BreathingVisualizer
  if (isBreathwork && !spec) {
    return (
      <div className={className}>
        <BreathingVisualizer exerciseName={exerciseName} isPlaying={isPlaying} />
      </div>
    );
  }

  // If we have a detailed spec, use the new anatomical system
  if (spec) {
    return (
      <AnatomicalAvatar
        spec={spec}
        isPlaying={isPlaying}
        side={side}
        className={className}
        showMuscles={showMuscles ?? true}
        showJointMarkers={showJointMarkers ?? false}
        showBreathIndicator={true}
        onCueChange={onCueChange}
      />
    );
  }

  // Fallback to legacy system
  return (
    <LegacyExerciseAvatar
      exerciseName={exerciseName}
      side={side}
      isPlaying={isPlaying}
      className={className}
    />
  );
};

export default ExerciseAvatar;
