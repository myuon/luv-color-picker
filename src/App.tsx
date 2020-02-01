import React, { useRef, useEffect, useCallback, useState } from "react";
import { hsluvToHex } from "hsluv";
import { css } from "@emotion/core";

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

const width = 300;
const height = 300;
const squareSize = 4;

export const App: React.FC = () => {
  const [light, setLight] = useState(80);
  const forceUpdate = useForceUpdate();

  const canvasRef = useRef(null);
  const getContext = (): CanvasRenderingContext2D => {
    const canvas = canvasRef.current as any;

    return canvas.getContext("2d");
  };

  const xmax = Math.floor(width / squareSize);
  const ymax = Math.floor(height / squareSize);

  useEffect(() => {
    const ctx = getContext();

    // x: hue
    // y: saturation
    for (let x = 0; x < xmax; x++) {
      for (let y = 0; y < ymax; y++) {
        const pv: [number, number] = [x / (xmax / 2) - 1, -y / (ymax / 2) + 1];
        const pvSize = vecSize(pv);

        ctx.fillStyle = hsluvToHex([
          vecToArg(pv),
          Math.min(pvSize * 100, 100),
          light
        ]);
        ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
      }
    }

    ctx.save();
  }, [light, xmax, ymax]);

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
      <div
        css={css`
          position: relative;
        `}
      >
        <canvas width={width} height={height} ref={canvasRef} />
        <svg
          width={width}
          height={height}
          css={css`
            position: absolute;
            top: 0;
            left: 0;
          `}
        >
          <circle
            cx={width / 2}
            cy={height / 2}
            r={width / 2}
            stroke="white"
            strokeWidth={2}
            fillOpacity={0}
          />

          <circle
            cx={width / 2}
            cy={height / 2}
            r={2}
            stroke="white"
            strokeWidth={2}
            fill="white"
          />
        </svg>
      </div>

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
        <input
          type="number"
          name="light"
          max={100}
          min={0}
          defaultValue={light}
        />
      </form>
    </>
  );
};
