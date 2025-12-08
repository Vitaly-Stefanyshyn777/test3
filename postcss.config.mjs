const plugins = {
  "@tailwindcss/postcss": {},
  "postcss-functions": {
    functions: {
      vw: (value) => {
        const px = parseFloat(String(value));
        if (Number.isNaN(px)) return String(value);
        return `${(px / 1920) * 100}vw`;
      },
      mvw: (value) => {
        const px = parseFloat(String(value));
        if (Number.isNaN(px)) return String(value);
        return `${(px / 375) * 100}vw`;
      },
    },
  },
  "postcss-px-to-viewport-8-media-screen": {
    unitToConvert: "px",
    viewportWidth: 1920, // дефолт для десктопа
    unitPrecision: 5,
    propList: ["*"],
    viewportUnit: "vw",
    fontViewportUnit: "vw",
    selectorBlackList: [".no-vw"],
    minPixelValue: 1,
    mediaQuery: true,
    replace: true,
    exclude: [/node_modules/],
    include: [/src/],
    landscape: false,
    // 👇 ключове — тут описуєш, яка ширина для якого @media
    mediaScreen: {
      "(max-width: 1024px)": 375,
      "(max-width: 480px)": 375,
      "(max-width: 430px)": 375,
    },
  },
};

export default { plugins };
