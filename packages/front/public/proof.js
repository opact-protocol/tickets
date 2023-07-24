import { debounce } from "../src/utils/debounce";
import { plonk } from "snarkjs";

self.addEventListener("message", async (event) => {
  console.log('BUILDING NOW')

  try {
    const { payload, verifierUrl, circuitUrl } = event.data.input;

    self.postMessage({
      type: "progress",
      payload: 'start'
    })

    /**
     * When is the first hit of IP on circuit.zkey, vercel returns 502. We retry to continue withdraw
     */
    try {
      const res = await plonk.fullProve(
        payload,
        verifierUrl,
        circuitUrl,
        {
          debug: debounce((message) => {
            self.postMessage({
              type: "progress",
              payload: message
            })

            return message
          }, 100)
        }
      );

      self.postMessage(
        {
          type: "done",
          payload: res
        }
      );
    } catch (e) {
      console.warn(e);

      const res = await plonk.fullProve(
        payload,
        verifierUrl,
        circuitUrl,
        {
          debug: debounce((message) => {
            self.postMessage({
              type: "progress",
              payload: message
            })

            return message
          }, 100)
        }
      );

      self.postMessage(
        {
          type: "done",
          payload: res
        }
      );
    }
  } catch (error) {
    self.postMessage(
      {
        type: "error",
        payload: {
          error
        }
      }
    );
  }
});

export {};
