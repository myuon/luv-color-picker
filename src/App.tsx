import React, { useRef, useEffect, useCallback, useState } from "react";
import { hsluvToRgb } from "hsluv";
import { css } from "@emotion/core";

const range = (n: number) => Array.from({ length: n }, (v, k) => k);

const vecToArg = (xy: [number, number]) => {
  const [x, y] = xy;
  const h = (Math.atan2(y, x) * 180) / Math.PI;
  return (360 + h) % 360;
};

const vecSize = (xy: [number, number]) =>
  Math.sqrt(xy[0] * xy[0] + xy[1] * xy[1]);

const useForceUpdate = () => {
  const [, setState] = useState();
  return setState;
};

export const App: React.FC = () => {
  const [light, setLight] = useState(50);
  const forceUpdate = useForceUpdate();

  const canvasRef = useRef(null);
  const getContext = (): CanvasRenderingContext2D => {
    const canvas = canvasRef.current as any;

    return canvas.getContext("2d");
  };
  const width = 300;
  const height = 300;

  useEffect(() => {
    const ctx = getContext();

    // x: hue
    // y: saturation
    range(width).forEach(x => {
      range(height).forEach(y => {
        const pv: [number, number] = [
          x / (width / 2) - 1,
          -y / (height / 2) + 1
        ];
        const pvSize = vecSize(pv);
        if (pvSize <= 1.0) {
          const h = vecToArg(pv);
          const [r, g, b] = hsluvToRgb([h, pvSize * 100, light]);

          ctx.fillStyle = `rgb(${r * 255}, ${g * 255}, ${b * 255})`;
          ctx.fillRect(x, y, 1, 1);
        }
      });
    });

    ctx.save();
  }, [light]);

  const handleChange = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const form = new FormData(event.currentTarget);
      const input = Object.fromEntries(form);
      setLight(parseInt(input["light"] as string, 10));
      forceUpdate(true);
    },
    [forceUpdate]
  );

  return (
    <>
      <h1>LUV Color Picker</h1>
      <canvas width={width} height={height} ref={canvasRef} />

      <form
        onChange={handleChange}
        css={css`
          margin: 1em 0;
        `}
      >
        <label
          htmlFor="light"
          css={css`
            margin-right: 0.5em;
          `}
        >
          Light
        </label>
        <input type="number" name="light" max={100} min={0} defaultValue={50} />
      </form>
    </>
  );
};
