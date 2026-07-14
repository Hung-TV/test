import { useCallback, useRef, useState } from 'react';

export function useHandwritingCanvas() {
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const strokesRef = useRef([]);
  const currentStrokeRef = useRef([]);

  const startStroke = useCallback((point) => {
    const nextStroke = [point];
    currentStrokeRef.current = nextStroke;
    setCurrentStroke(nextStroke);
  }, []);

  const addPoint = useCallback((point) => {
    const nextStroke = [...currentStrokeRef.current, point];
    currentStrokeRef.current = nextStroke;
    setCurrentStroke(nextStroke);
  }, []);

  const endStroke = useCallback((finalPoint) => {
    const completedStroke = finalPoint
      ? [...currentStrokeRef.current, finalPoint]
      : currentStrokeRef.current;
    const nextStrokes = completedStroke.length > 0
      ? [...strokesRef.current, completedStroke]
      : strokesRef.current;

    strokesRef.current = nextStrokes;
    currentStrokeRef.current = [];
    setStrokes(nextStrokes);
    setCurrentStroke([]);
    return nextStrokes;
  }, []);

  const clearStrokes = useCallback(() => {
    strokesRef.current = [];
    currentStrokeRef.current = [];
    setStrokes([]);
    setCurrentStroke([]);
  }, []);

  const undoStroke = useCallback(() => {
    const nextStrokes = strokesRef.current.slice(0, -1);
    strokesRef.current = nextStrokes;
    currentStrokeRef.current = [];
    setCurrentStroke([]);
    setStrokes(nextStrokes);
    return nextStrokes;
  }, []);

  return {
    strokes,
    currentStroke,
    clearStrokes,
    undoStroke,
    hasStrokes: strokes.length > 0 || currentStroke.length > 0,
    startStroke,
    addPoint,
    endStroke,
  };
}
