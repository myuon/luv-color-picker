import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo
} from "react";
import { hsluvToHex } from "hsluv";
import { css } from "@emotion/core";
import { Spectrum } from "./components/Spectrum";

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
  const [saturation, setSaturation] = useState(50);
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

  const pointingPosition = useMemo(() => {
    const scaler = (saturation / 100) * (width / 2);

    return [
      width / 2 + scaler * Math.cos((hue * Math.PI) / 180),
      height / 2 - scaler * Math.sin((hue * Math.PI) / 180)
    ];
  }, [hue, saturation]);
  const pointingRgb = useMemo(() => {
    return hsluvToHex([hue, saturation, light]);
  }, [hue, saturation, light]);

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

          <circle
            cx={pointingPosition[0]}
            cy={pointingPosition[1]}
            r={5}
            stroke="black"
            strokeWidth={2}
            fillOpacity={0}
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
        <Spectrum
          anchorRef={hueSpectrumCanvas}
          defaultValue={hue}
          height={spectrumHeight}
          onChange={setHue}
        />
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
        <Spectrum
          anchorRef={saturationSpectrumCanvas}
          defaultValue={saturation}
          height={spectrumHeight}
          onChange={setSaturation}
        />
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

      <div
        css={css`
          display: flex;
          margin: 1em 0;
          & > div {
            margin: 0 1em;
          }
        `}
      >
        <p>Color</p>
        <div
          css={css`
            background-color: ${pointingRgb};
            width: 100px;
            height: 100px;
          `}
        ></div>
        <p>{pointingRgb}</p>
      </div>
    </>
  );
};
