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
const spectrumHeight = 50;

const getContext = (ref: any): CanvasRenderingContext2D => {
  const canvas = ref.current as any;

  return canvas.getContext("2d");
};

export const App: React.FC = () => {
  const [light, setLight] = useState(80);
  const [hue, setHue] = useState(0);
  const [saturation] = useState(50);
  const forceUpdate = useForceUpdate();

  const canvasRef = useRef(null);

  const xmax = Math.floor(width / squareSize);
  const ymax = Math.floor(height / squareSize);

  useEffect(() => {
    const ctx = getContext(canvasRef);

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

  const hueSpectrumCanvas = useRef(null);
  useEffect(() => {
    const ctx = getContext(hueSpectrumCanvas);

    for (let x = 0; x < 360; x++) {
      ctx.fillStyle = hsluvToHex([x, saturation, light]);
      ctx.fillRect(x, 0, 1, spectrumHeight);
    }

    ctx.save();
  }, [light, saturation]);

  const saturationSpectrumCanvas = useRef(null);
  useEffect(() => {
    const ctx = getContext(saturationSpectrumCanvas);

    for (let x = 0; x < 100; x++) {
      ctx.fillStyle = hsluvToHex([hue, x, light]);
      ctx.fillRect(x, 0, 1, spectrumHeight);
    }

    ctx.save();
  }, [light, hue]);

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

  const handleHueSpectrumMouseMove = useCallback((e: React.MouseEvent) => {
    if (e.buttons != 0) {
      setHue(e.clientX - e.currentTarget.getBoundingClientRect().left);
    }
  }, []);
  const handleHueSpectrumClick = useCallback((e: React.MouseEvent) => {
    setHue(e.clientX - e.currentTarget.getBoundingClientRect().left);
  }, []);

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

      <div
        css={css`
          display: flex;
          margin: 1em 0;
        `}
      >
        <p
          css={css`
            margin-right: 0.5em;
          `}
        >
          Hue
        </p>
        <div
          css={css`
            position: relative;
          `}
          onMouseMove={handleHueSpectrumMouseMove}
          onClick={handleHueSpectrumClick}
        >
          <canvas width={360} height={spectrumHeight} ref={hueSpectrumCanvas} />
          <svg
            width={360}
            height={spectrumHeight}
            css={css`
              position: absolute;
              left: 0;
            `}
          >
            <rect
              x={hue}
              y={0}
              width={20}
              height={spectrumHeight}
              stroke="black"
              strokeWidth={2}
              fillOpacity={0}
            ></rect>
          </svg>
        </div>
        <p>{hue}</p>
      </div>
      <div
        css={css`
          display: flex;
          margin: 1em 0;
        `}
      >
        <p
          css={css`
            margin-right: 0.5em;
          `}
        >
          Saturation
        </p>
        <div
          css={css`
            position: relative;
          `}
        >
          <canvas
            width={360}
            height={spectrumHeight}
            ref={saturationSpectrumCanvas}
          />
          <svg
            width={360}
            height={spectrumHeight}
            css={css`
              position: absolute;
              left: 0;
            `}
          >
            <rect
              x={saturation}
              y={0}
              width={20}
              height={spectrumHeight}
              stroke="black"
              strokeWidth={2}
              fillOpacity={0}
            ></rect>
          </svg>
        </div>
        <p>{saturation}</p>
      </div>
      <form
        onChange={handleChange}
        css={css`
          margin: 1em 0;
        `}
      >
        <div>
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
        </div>
      </form>
    </>
  );
};
