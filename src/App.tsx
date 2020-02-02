import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo
} from "react";
import { hpluvToHex } from "hsluv";
import { css, Global } from "@emotion/core";
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

type Harmonics =
  | "single"
  | "complementary"
  | "analogous"
  | "triad"
  | "split-complementary"
  | "tetradic"
  | "square";

const getHarmonicsValues = (type: Harmonics, value: number, max: number) => {
  switch (type) {
    case "single":
      return [value];
    case "complementary":
      return [value, Math.floor(value + max / 2) % max];
    case "analogous":
      return [
        Math.floor(value + (11 * max) / 12) % max,
        value,
        Math.floor(value + max / 12) % max
      ];
    case "triad":
      return [
        Math.floor(value + (2 * max) / 3) % max,
        value,
        Math.floor(value + max / 3) % max
      ];
    case "split-complementary":
      return [
        Math.floor(value + max / 2 + (2 * max) / 3) % max,
        value,
        Math.floor(value + max / 3) % max
      ];
    case "tetradic":
      return [
        value,
        Math.floor(value + (max * 2) / 12) % max,
        Math.floor(value + (max * 6) / 12) % max,
        Math.floor(value + (max * 8) / 12) % max
      ];
    case "square":
      return [
        value,
        Math.floor(value + (max * 3) / 12) % max,
        Math.floor(value + (max * 6) / 12) % max,
        Math.floor(value + (max * 9) / 12) % max
      ];
  }
};

export const App: React.FC = () => {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(80);
  const [light, setLight] = useState(70);

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

        ctx.fillStyle = hpluvToHex([
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

    for (let x = 0; x < spectrumWidth / squareSize; x++) {
      ctx.fillStyle = hpluvToHex([
        x * squareSize * (360 / spectrumWidth),
        saturation,
        light
      ]);
      ctx.fillRect(x * squareSize, 0, squareSize, spectrumHeight);
    }

    ctx.save();
  }, [light, saturation]);

  const saturationSpectrumCanvas = useRef(null);
  useEffect(() => {
    const ctx = getContext(saturationSpectrumCanvas);

    for (let x = 0; x < spectrumWidth / squareSize; x++) {
      ctx.fillStyle = hpluvToHex([
        hue,
        x * squareSize * (100 / spectrumWidth),
        light
      ]);
      ctx.fillRect(x * squareSize, 0, squareSize, spectrumHeight);
    }

    ctx.save();
  }, [light, hue]);

  const lightSpectrumCanvas = useRef(null);
  useEffect(() => {
    const ctx = getContext(lightSpectrumCanvas);

    for (let x = 0; x < spectrumWidth / squareSize; x++) {
      ctx.fillStyle = hpluvToHex([
        hue,
        saturation,
        x * squareSize * (100 / spectrumWidth)
      ]);
      ctx.fillRect(x * squareSize, 0, squareSize, spectrumHeight);
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
    return hpluvToHex([hue, saturation, light]);
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

  const [harmonics, setHarmonics] = useState<Harmonics>("single");
  const handleChangeHarmonics = useCallback(e => {
    setHarmonics(e.currentTarget.value);
  }, []);

  const harmonicsColors = useMemo(() => {
    return getHarmonicsValues(harmonics, hue, 360).map(h =>
      hpluvToHex([h, saturation, light])
    );
  }, [harmonics, hue, saturation, light]);

  const harmonicsColorPoints = useMemo(() => {
    const scaler = (saturation / 100) * (width / 2);

    return getHarmonicsValues(harmonics, hue, 360)
      .filter(v => v != hue)
      .map(h => [
        width / 2 + scaler * Math.cos((h * Math.PI) / 180),
        height / 2 - scaler * Math.sin((h * Math.PI) / 180)
      ]);
  }, [harmonics, hue, saturation]);

  const [paletteSize, setPaletteSize] = useState(10);
  const [saturationVariation, setSaturationVariation] = useState(50);
  const [lightVariation, setLightVariation] = useState(55);
  const paletteColors = useMemo(() => {
    const colors = [];

    for (let i = 0; i < paletteSize; i++) {
      const row = [];
      for (let j = 0; j < paletteSize; j++) {
        row.push(
          hpluvToHex([
            Math.floor(hue + (360 / paletteSize) * (j - paletteSize / 2)) % 360,
            Math.min(
              Math.floor(
                saturation +
                  (saturationVariation / (paletteSize + 1)) *
                    (i + 1 - paletteSize / 2)
              ),
              100
            ),
            Math.min(
              Math.floor(
                light -
                  (lightVariation / (paletteSize + 1)) *
                    (i + 1 - paletteSize / 2)
              ),
              100
            )
          ])
        );
      }
      colors.push(row);
    }

    return colors;
  }, [
    hue,
    saturation,
    light,
    paletteSize,
    saturationVariation,
    lightVariation
  ]);

  const handlePaletteFormChange = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      const form = new FormData(event.currentTarget);
      const input = Object.fromEntries(form);

      setPaletteSize(parseInt(input["palette-size"] as string, 10));
      setLightVariation(parseInt(input["light-variation"] as string, 10));
      setSaturationVariation(
        parseInt(input["saturation-variation"] as string, 10)
      );
    },
    []
  );

  return (
    <>
      <Global
        styles={css`
          body {
            width: 1024px;
            margin: 0 auto;
            padding: 2rem 0;

            background-color: #f9f9f9;
            color: #393939;
          }

          h2 {
            font-size: larger;
          }

          a {
            text-decoration: none;
            color: #2d9455;
          }
        `}
      />

      <h1>LUV Color Picker</h1>

      <div
        css={css`
          display: flex;

          & > div {
            margin-right: 4em;
          }
        `}
      >
        <div>
          <h2>HPLuv Color Circle</h2>
          <p>
            <a href="http://www.hsluv.org/math/">http://www.hsluv.org/math/</a>
          </p>

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

              {harmonicsColorPoints.map((p, i) => (
                <circle
                  key={i}
                  cx={p[0]}
                  cy={p[1]}
                  r={5}
                  stroke="grey"
                  strokeWidth={2}
                  fillOpacity={0}
                />
              ))}
            </svg>
          </div>
        </div>

        <div>
          <header>
            <h2>Color Adjustment</h2>
          </header>

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
                    defaultValue={light / 100}
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
        </div>
      </div>

      <div>
        <header>
          <h2>Color Harmonics</h2>
        </header>
        <p>
          <a href="https://www.tigercolor.com/color-lab/color-theory/color-harmonies.htm">
            https://www.tigercolor.com/color-lab/color-theory/color-harmonies.htm
          </a>
        </p>
        <select
          name="harmonics"
          onChange={handleChangeHarmonics}
          defaultValue={harmonics}
        >
          <option value="single">Single</option>
          <option value="complementary">Complementary</option>
          <option value="analogous">Analogous</option>
          <option value="triad">Triad</option>
          <option value="split-complementary">Split Complementary</option>
          <option value="tetradic">Tetradic</option>
          <option value="square">Square</option>
        </select>

        <div
          css={css`
            display: flex;
          `}
        >
          {harmonicsColors.map((c, i) => (
            <div
              key={i}
              css={css`
                background-color: ${c};
                width: 100px;
                height: 100px;
              `}
            >
              {c}
            </div>
          ))}
        </div>
      </div>

      <div>
        <header>
          <h2>Color Palette</h2>
        </header>

        <form onChange={handlePaletteFormChange}>
          <table>
            <tbody>
              <tr>
                <td>Palette Size</td>
                <td>
                  <input
                    type="number"
                    name="palette-size"
                    defaultValue={paletteSize}
                    min={1}
                    max={100}
                  />
                </td>
              </tr>
              <tr>
                <td>Saturation Variation</td>
                <td>
                  <input
                    name="saturation-variation"
                    type="number"
                    defaultValue={saturationVariation}
                    min={0}
                    max={100}
                  />
                </td>
              </tr>
              <tr>
                <td>Light Variation</td>
                <td>
                  <input
                    name="light-variation"
                    type="number"
                    defaultValue={lightVariation}
                    min={0}
                    max={100}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>

        {paletteColors.map((row, i) => (
          <div
            key={i}
            css={css`
              display: flex;
              flex-direction: row;
              margin: -0.25em;

              & > div {
                margin: 0.25em;
              }
            `}
          >
            {row.map((color, i) => (
              <div
                key={i}
                css={css`
                  width: 100px;
                  height: 50px;
                  background-color: ${color};
                `}
              >
                {color}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};
