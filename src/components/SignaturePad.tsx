"use client";
import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";

export interface SignaturePadHandle {
  isEmpty: () => boolean;
  toDataURL: (type?: string) => string;
  clear: () => void;
}

interface Props {
  height?: number;
}

export const SignaturePad = forwardRef<SignaturePadHandle, Props>(
  function SignaturePad({ height = 160 }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawing = useRef(false);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
      function resize() {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

        canvas.width = container.clientWidth;
        canvas.height = height;

        if (ctx && imageData) {
          ctx.putImageData(imageData, 0, 0);
        }

        if (ctx) {
          ctx.strokeStyle = "#1a1a2e";
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
        }
      }

      resize();
      const observer = new ResizeObserver(resize);
      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, [height]);

    function getPos(e: MouseEvent | TouchEvent) {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      if ("touches" in e) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      function startDraw(e: MouseEvent | TouchEvent) {
        e.preventDefault();
        isDrawing.current = true;
        const ctx = canvas!.getContext("2d")!;
        ctx.strokeStyle = "#1a1a2e";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      }

      function draw(e: MouseEvent | TouchEvent) {
        e.preventDefault();
        if (!isDrawing.current) return;
        const ctx = canvas!.getContext("2d")!;
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        setIsEmpty(false);
      }

      function stopDraw() {
        isDrawing.current = false;
      }

      canvas.addEventListener("mousedown", startDraw);
      canvas.addEventListener("mousemove", draw);
      canvas.addEventListener("mouseup", stopDraw);
      canvas.addEventListener("mouseleave", stopDraw);
      canvas.addEventListener("touchstart", startDraw, { passive: false });
      canvas.addEventListener("touchmove", draw, { passive: false });
      canvas.addEventListener("touchend", stopDraw);

      return () => {
        canvas.removeEventListener("mousedown", startDraw);
        canvas.removeEventListener("mousemove", draw);
        canvas.removeEventListener("mouseup", stopDraw);
        canvas.removeEventListener("mouseleave", stopDraw);
        canvas.removeEventListener("touchstart", startDraw);
        canvas.removeEventListener("touchmove", draw);
        canvas.removeEventListener("touchend", stopDraw);
      };
    }, []);

    useImperativeHandle(ref, () => ({
      isEmpty: () => isEmpty,
      toDataURL: (type = "image/png") => canvasRef.current?.toDataURL(type) ?? "",
      clear: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
      },
    }));

    return (
      <div ref={containerRef} style={{ width: "100%", height, background: "#fff", cursor: "crosshair" }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      </div>
    );
  }
);