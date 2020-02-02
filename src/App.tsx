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

const width = 300;
const height = 300;
const squareSize = 4;
const spectrumHeight = 30;
const spectrumWidth = 300;

const getContext = (ref: any): CanvasRenderingContext2D => {
  const canvas = ref.current as any;

  return canvas.getContext("2d");
};

export const App: React.FC = () => {
  const [light, setLight] = useState(80);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(50);

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

    for (let x = 0; x < spectrumWidth; x++) {
      ctx.fillStyle = hsluvToHex([
        x * (360 / spectrumWidth),
        saturation,
        light
      ]);
      ctx.fillRect(x, 0, 1, spectrumHeight);
    }

    ctx.save();
  }, [light, saturation]);

  const saturationSpectrumCanvas = useRef(null);
  useEffect(() => {
    const ctx = getContext(saturationSpectrumCanvas);

    for (let x = 0; x < spectrumWidth; x++) {
      ctx.fillStyle = hsluvToHex([hue, x * (100 / spectrumWidth), light]);
      ctx.fillRect(x, 0, 1, spectrumHeight);
    }

    ctx.save();
  }, [light, hue]);

  const lightSpectrumCanvas = useRef(null);
  useEffect(() => {
    const ctx = getContext(lightSpectrumCanvas);

    for (let x = 0; x < spectrumWidth; x++) {
      ctx.fillStyle = hsluvToHex([hue, saturation, x * (100 / spectrumWidth)]);
      ctx.fillRect(x, 0, 1, spectrumHeight);
    }

    ctx.save();
  }, [hue, saturation]);

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

  const handleChangeHue = useCallback(value => {
    setHue(Math.floor(value * 360));
  }, []);
  const handleChangeSaturation = useCallback(value => {
    setSaturation(Math.floor(value * 100));
  }, []);
  const handleChangeLight = useCallback(value => {
    setLight(Math.floor(value * 100));
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

      <table>
        <tbody>
          <tr>
            <td>Hue</td>
            <td>
              <Spectrum
                width={spectrumWidth}
                anchorRef={hueSpectrumCanvas}
                defaultValue={hue / 360}
                height={spectrumHeight}
                onChange={handleChangeHue}
              />
            </td>
            <td>{hue}</td>
          </tr>
          <tr>
            <td>Saturation</td>
            <td>
              <Spectrum
                width={spectrumWidth}
                anchorRef={saturationSpectrumCanvas}
                defaultValue={saturation / 100}
                height={spectrumHeight}
                onChange={handleChangeSaturation}
              />
            </td>
            <td>{saturation}</td>
          </tr>
          <tr>
            <td>Light</td>
            <td>
              <Spectrum
                width={spectrumWidth}
                anchorRef={lightSpectrumCanvas}
                defaultValue={saturation / 100}
                height={spectrumHeight}
                onChange={handleChangeLight}
              />
            </td>
            <td>{light}</td>
          </tr>
          <tr>
            <td>Color</td>
            <td>
              <div
                css={css`
                  background-color: ${pointingRgb};
                  width: 100px;
                  height: 100px;
                `}
              />
            </td>
            <td>{pointingRgb}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
