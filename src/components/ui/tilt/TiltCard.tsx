"use client";

import clsx from "clsx";
import { useCallback, useRef } from "react";
import type { PointerEvent, ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export function TiltCard({ children, className, maxTilt = 12 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isTouchActiveRef = useRef(false);

  const setTilt = useCallback((tiltX: number, tiltY: number, scale: number) => {
    const node = cardRef.current;
    if (!node) return;

    // Actualizamos las variables CSS para evitar estilos inline en JSX.
    node.style.setProperty("--tilt-x", `${tiltX}deg`);
    node.style.setProperty("--tilt-y", `${tiltY}deg`);
    node.style.setProperty("--tilt-scale", `${scale}`);
  }, []);

  const setActive = useCallback((active: boolean) => {
    const node = cardRef.current;
    if (!node) return;

    if (active) {
      node.dataset.tiltActive = "true";
    } else {
      delete node.dataset.tiltActive;
    }
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const node = cardRef.current;
      if (!node) return;

      // En mobile, solo movemos cuando el usuario mantiene presionado.
      if (event.pointerType === "touch" && !isTouchActiveRef.current) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const percentX = (x / rect.width) * 2 - 1;
      const percentY = (y / rect.height) * 2 - 1;
      const tiltX = percentX * maxTilt;
      const tiltY = -percentY * maxTilt;

      setActive(true);
      setTilt(tiltX, tiltY, 1.02);
    },
    [maxTilt, setActive, setTilt],
  );

  const resetTilt = useCallback(() => {
    setActive(false);
    setTilt(0, 0, 1);
  }, [setActive, setTilt]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "touch") {
        isTouchActiveRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      }

      handlePointerMove(event);
    },
    [handlePointerMove],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "touch") {
        isTouchActiveRef.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      resetTilt();
    },
    [resetTilt],
  );

  return (
    <div
      ref={cardRef}
      className={clsx("tilt-card", "cursor-crosshair", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="tilt-card__inner">{children}</div>
    </div>
  );
}
