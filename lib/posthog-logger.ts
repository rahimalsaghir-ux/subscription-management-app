import { posthog } from "@/lib/posthog";

export const posthogLogger = {
  signInSucceeded() {
    posthog?.logger.info("authentication completed", { flow: "sign_in" });
  },
  signUpVerificationSent() {
    posthog?.logger.info("verification email dispatched", {
      flow: "sign_up",
    });
  },
  signUpCompleted() {
    posthog?.logger.info("authentication completed", { flow: "sign_up" });
  },
};
