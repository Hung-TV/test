import { useEffect, useRef } from 'react';
import { useDictionaryI18n } from '../hooks/useDictionaryI18n';

const getLogicalPoint = (canvas, event) => {
  const rect = canvas.getBoundingClientRect();
  return {
    // Strokes dùng CSS pixels. DPR chỉ phục vụ độ nét bitmap, không nhân tọa độ.
    x: Math.min(rect.width, Math.max(0, event.clientX - rect.left)),
    y: Math.min(rect.height, Math.max(0, event.clientY - rect.top)),
    t: Date.now(),
  };
};

const drawStroke = (context, stroke) => {
  if (stroke.length === 0) return;

  context.beginPath();
  context.moveTo(stroke[0].x, stroke[0].y);

  if (stroke.length === 1) {
    context.lineTo(stroke[0].x + 0.01, stroke[0].y + 0.01);
  } else {
    stroke.slice(1).forEach((point) => {
      context.lineTo(point.x, point.y);
    });
  }

  context.stroke();
};

export default function HandwritingCanvas({
  strokes,
  currentStroke,
  startStroke,
  addPoint,
  endStroke,
  onStrokeEnd,
}) {
  const { messages } = useDictionaryI18n();
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const drawCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));

      const context = canvas.getContext('2d');
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.scale(pixelRatio, pixelRatio);

      // Grid luyện viết gồm một đường dọc và một đường ngang ở tâm ô.
      context.save();
      context.strokeStyle = 'rgba(117, 118, 130, 0.24)';
      context.lineWidth = 1;
      context.setLineDash([6, 6]);
      context.beginPath();
      context.moveTo(bounds.width / 2, 0);
      context.lineTo(bounds.width / 2, bounds.height);
      context.moveTo(0, bounds.height / 2);
      context.lineTo(bounds.width, bounds.height / 2);
      context.stroke();
      context.restore();

      context.strokeStyle = '#00236f';
      context.lineWidth = Math.max(5, bounds.width * 0.018);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      strokes.forEach((stroke) => drawStroke(context, stroke));
      drawStroke(context, currentStroke);
    };

    drawCanvas();
    const resizeObserver = new ResizeObserver(drawCanvas);
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [currentStroke, strokes]);

  const handlePointerDown = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    event.preventDefault();
    isDrawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    startStroke(getLogicalPoint(canvas, event));
  };

  const handlePointerMove = (event) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    event.preventDefault();
    addPoint(getLogicalPoint(canvasRef.current, event));
  };

  const finishStroke = (event) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    event.preventDefault();
    isDrawingRef.current = false;
    const committedStrokes = endStroke(getLogicalPoint(canvasRef.current, event));
    onStrokeEnd?.(committedStrokes);

    if (canvasRef.current.hasPointerCapture(event.pointerId)) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="handwriting-canvas"
      aria-label={messages.canvasLabel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishStroke}
      onPointerCancel={finishStroke}
    />
  );
}
