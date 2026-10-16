export const CONFIG = {
  NAME: "69",
  TICKER: "$POV",
  CA: "",                                  // empty = pre-launch mode
  X_URL: "https://x.com/REPLACE_ME",
  TG_URL: "",                              // empty = no Telegram link
  SITE_URL: "https://REPLACE_ME",
};
export const PUMPFUN_URL = (ca) => `https://pump.fun/coin/${ca}`;
export const IS_LIVE = Boolean(CONFIG.CA && CONFIG.CA.trim());
