import React from "react";
import type { SVGProps } from "react";

function EditIcon({ active }: any) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      cursor={active ? "pointer" : "not-allowed"}
    >
      <mask
        id="mask0_1071_22103"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="13"
        height="13"
      >
        <rect x="0.5" y="0.5" width="12" height="12" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_1071_22103)">
        <path
          d="M1.5 12.5V10.5H11.5V12.5H1.5ZM2.5 9.49998V7.62498L7.025 3.09998L8.9 4.97498L4.375 9.49998H2.5ZM3.5 8.49998H3.95L7.5 4.97498L7.025 4.49998L3.5 8.04998V8.49998ZM9.4625 4.42498L7.5875 2.54998L8.4875 1.64998C8.57917 1.54998 8.69583 1.50206 8.8375 1.50623C8.97917 1.5104 9.09583 1.55831 9.1875 1.64998L10.3625 2.82498C10.4542 2.91665 10.5 3.03123 10.5 3.16873C10.5 3.30623 10.4542 3.42498 10.3625 3.52498L9.4625 4.42498Z"
          fill={active ? "#1C1B1F" : "#1C1B1F40"}
        />
      </g>
    </svg>
  );
}

export default EditIcon;
