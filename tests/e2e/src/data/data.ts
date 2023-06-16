export enum Extension {
  specifiedExtensionUrl = "chrome-extension://",
  allExtensionsUrl = "chrome://extensions/",
  metamaskHomeHtml = "/home.html",
  metamaskInitialize = "#initialize/welcome",
  metamaskAdvSettings = "#settings/advanced",
  metamaskNetworkSettings = "#settings/networks",
}

export enum MetamaskWallet {
  mainWalletPassword = "Metamask1231",
  // depositWallet = "0x45E9a7CF8aA8e22801551c8b90E3447aC4359d92",
  // withdrawWallet = "0xd9d2d6d204b9227d98a54fd3e4390d2156a36df4",
  mainWallet = "0x586607935E1462ab762F438E0A7b2968A4158975",
  secondWallet = "0x26A4c5Dfe2cA3c9E7E8C417B689F41b6b5745C37",
  emptyWallet = "0xa9654a6f77bd36ac77201fe5e16afa97f53a4bdf",
}

export enum NetworkSwitcher {
  zkSyncEraGoerli = "/?network=goerli",
  goerliStage2 = "/?network=goerli-beta",
  zkSyncEraMainnet = "/?network=mainnet",
}

export enum SubDirectory {
  balances = "/",
  transfer = "/transfer",
  receive = "/receive",
  deposit = "/bridge",
  withdraw = "/bridge/withdraw",
  faucet = "/faucet",
}

export const mainWalletPhrase = [
  "brush",
  "chat",
  "grocery",
  "slam",
  "dirt",
  "bubble",
  "blossom",
  "swallow",
  "same",
  "dinosaur",
  "pistol",
  "inject",
];
export const secondWalletPhrase = [
  "royal",
  "praise",
  "much",
  "lesson",
  "omit",
  "raw",
  "broom",
  "girl",
  "opinion",
  "addict",
  "nest",
  "calm",
];
export const emptyWalletPhrase = [
  "island",
  "logic",
  "genre",
  "neither",
  "abuse",
  "inflict",
  "neglect",
  "raw",
  "elbow",
  "laptop",
  "funny",
  "approve",
];

export const depositWalletPhrase = [
  "head",
  "title",
  "first",
  "innocent",
  "sign",
  "left",
  "grab",
  "fantasy",
  "suggest",
  "depart",
  "elder",
  "crazy",
];

export const withdrawWalletPhrase = [
  "foster",
  "hotel",
  "hospital",
  "ill",
  "oyster",
  "enough",
  "mixture",
  "chaos",
  "clog",
  "fox",
  "predict",
  "assault",
];
