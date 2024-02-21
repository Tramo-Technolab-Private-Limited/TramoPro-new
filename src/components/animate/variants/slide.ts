// @types
import { VariantsType } from "../types";
//
import { varTranEnter, varTranExit } from "./transition";

// ----------------------------------------------------------------------

export const varSlide = (props?: VariantsType) => {
  const distance = props?.distance || 160;
  const durationIn = props?.durationIn;
  const durationOut = props?.durationOut;
  const easeIn = props?.easeIn;
  const easeOut = props?.easeOut;

  return {
    // IN
    inUp: {
      initial: { y: distance, opacity: 0 },
      animate: {
        y: 0,
        opacity: 1,
        transition: varTranEnter({ durationIn, easeIn }),
      },
      exit: {
        y: distance,
        opacity: 0,
        transition: varTranExit({ durationOut, easeOut }),
      },
    },
    inDown: {
      initial: { y: -distance, opacity: 0 },
      animate: {
        y: 0,
        opacity: 1,
        transition: varTranEnter({ durationIn, easeIn }),
      },
      exit: {
        y: -distance,
        opacity: 0,
        transition: varTranExit({ durationOut, easeOut }),
      },
    },
    inLeft: {
      initial: { x: -distance, opacity: 0 },
      animate: {
        x: 0,
        opacity: 1,
        transition: varTranEnter({ durationIn, easeIn }),
      },
      exit: {
        x: -distance,
        opacity: 0,
        transition: varTranExit({ durationOut, easeOut }),
      },
    },
    inRight: {
      initial: { x: distance, opacity: 0 },
      animate: {
        x: 0,
        opacity: 1,
        transition: varTranEnter({ durationIn, easeIn }),
      },
      exit: {
        x: distance,
        opacity: 0,
        transition: varTranExit({ durationOut, easeOut }),
      },
    },

    // OUT
    outUp: {
      initial: { y: 0 },
      animate: {
        y: -distance,
        transition: varTranEnter({ durationIn, easeIn }),
      },
      exit: { y: 0, transition: varTranExit({ durationOut, easeOut }) },
    },
    outDown: {
      initial: { y: 0 },
      animate: {
        y: distance,
        transition: varTranEnter({ durationIn, easeIn }),
      },
      exit: { y: 0, transition: varTranExit({ durationOut, easeOut }) },
    },
    outLeft: {
      initial: { x: 0 },
      animate: {
        x: -distance,
        transition: varTranEnter({ durationIn, easeIn }),
      },
      exit: { x: 0, transition: varTranExit({ durationOut, easeOut }) },
    },
    outRight: {
      initial: { x: 0 },
      animate: {
        x: distance,
        transition: varTranEnter({ durationIn, easeIn }),
      },
      exit: { x: 0, transition: varTranExit({ durationOut, easeOut }) },
    },
  };
};
