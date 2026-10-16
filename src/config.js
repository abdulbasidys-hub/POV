export const CONFIG = {
  NAME: "69",
  TICKER: "$POV",
  CA: "",                                  // empty = pre-launch mode
  X_URL: "https://x.com/REPLACE_ME",
  TG_URL: "",                              // empty = no Telegram link
  SITE_URL: "https://REPLACE_ME",
  MEME: "six-nine",                        // six-nine | sticks | mom-wow | pump-dump
  // TESTING ONLY: shows the bar for swiping between memes and switching side.
  // Set to false when testing is done.
  TEST_SWITCHER: true,
};
export const PUMPFUN_URL = (ca) => `https://pump.fun/coin/${ca}`;
export const IS_LIVE = Boolean(CONFIG.CA && CONFIG.CA.trim());
