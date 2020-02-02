import React, { useCallback, useState, Ref } from "react";
import { css } from "@emotion/core";

export const Spectrum: React.FC<{
  anchorRef: Ref<HTMLCanvasElement>;
  defaultValue: number;
  height: number;
  onChange: (value: number) => void;
}> = props => {
  const [value, setValue] = useState(props.defaultValue);
  const { onChange } = props;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (e.buttons != 0) {
        const value = e.clientX - e.currentTarget.getBoundingClientRect().left;
        setValue(value);
        onChange(value);
      }
    },
    [onChange]
  );
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const value = e.clientX - e.currentTarget.getBoundingClientRect().left;
      setValue(value);
      onChange(value);
    },
    [onChange]
  );

  return (
    <div
      css={css`
        position: relative;
      `}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <canvas width={360} height={props.height} ref={props.anchorRef} />
      <svg
        width={360}
        height={props.height}
        css={css`
          position: absolute;
          left: 0;
        `}
      >
        <rect
          x={value}
          y={0}
          width={20}
          height={props.height}
          stroke="black"
          strokeWidth={2}
          fillOpacity={0}
        ></rect>
      </svg>
    </div>
  );
};
