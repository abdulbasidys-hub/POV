export const CONFIG = {
  NAME: "69",
  TICKER: "$POV",
  // ==========================================================
  //   CONTRACT ADDRESS: paste it between the quotes below,
  //   e.g.  CA: "AbCd...pump",
  //   That's the only change needed at launch: it shows the CA on
  //   the site with a copy button, and turns on How to buy and the
  //   Buy buttons (pump.fun links).
  // ==========================================================
  CA: "",
  X_URL: "https://x.com/REPLACE_ME",
  TG_URL: "",                              // empty = no Telegram link
  COMMUNITY_URL: "",                       // X community / group; empty = TG_URL, then X_URL
  SITE_URL: "https://REPLACE_ME",
  MEME: "six-nine",                        // six-nine | sticks | mom-wow
  // TESTING ONLY: shows the bar for swiping between memes and switching side.
  // Set to false when testing is done.
  TEST_SWITCHER: true,
};
export const PUMPFUN_URL = (ca) => `https://pump.fun/coin/${ca}`;
export const IS_LIVE = Boolean(CONFIG.CA && CONFIG.CA.trim());
