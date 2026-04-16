"use client";

import clsx from "clsx";
import { useCallback, useEffect, useRef } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent,
  ReactNode,
} from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

const MD_OR_LOWER_QUERY = "(max-width: 1023px)";

const isMdOrLowerScreen = () =>
  typeof window !== "undefined" && window.matchMedia(MD_OR_LOWER_QUERY).matches;

export function TiltCard({ children, className, maxTilt = 12 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isTouchActiveRef = useRef(false);
  const lastPointerTypeRef = useRef<string | null>(null);

  const lockTouchScroll = useCallback(() => {
    if (!isMdOrLowerScreen()) return;

    document.body.dataset.tiltScrollLocked = "true";
  }, []);

  const unlockTouchScroll = useCallback(() => {
    delete document.body.dataset.tiltScrollLocked;
  }, []);

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

      if (event.pointerType === "touch" && isMdOrLowerScreen()) {
        event.preventDefault();
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
      lastPointerTypeRef.current = event.pointerType;

      if (event.pointerType === "touch") {
        isTouchActiveRef.current = true;
        lockTouchScroll();
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
      }

      handlePointerMove(event);
    },
    [handlePointerMove, lockTouchScroll],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "touch") {
        isTouchActiveRef.current = false;
        unlockTouchScroll();

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }

      resetTilt();
    },
    [resetTilt, unlockTouchScroll],
  );

  const handlePointerLeave = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "touch") {
        isTouchActiveRef.current = false;
        unlockTouchScroll();
      }

      resetTilt();
    },
    [resetTilt, unlockTouchScroll],
  );

  const handleContextMenu = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      // Evita el menu nativo de long-press sobre imagenes en mobile/tablet.
      if (lastPointerTypeRef.current === "touch" || isMdOrLowerScreen()) {
        event.preventDefault();
      }
    },
    [],
  );

  useEffect(() => {
    return () => unlockTouchScroll();
  }, [unlockTouchScroll]);

  return (
    <div
      ref={cardRef}
      className={clsx("tilt-card", "cursor-crosshair", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={handleContextMenu}
    >
      <div className="tilt-card__inner">{children}</div>
    </div>
  );
}
