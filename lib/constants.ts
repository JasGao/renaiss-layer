export const DEMO_USER_WALLET = "0x7a3f8c2e1b9d4a6f5e8c0b2d1a9f8e7c6b5a4932";

export const PROTOCOL_ADDRESSES = {
  collectibleManager: "0xCollect1bleManager000000000000000000000001",
  nftContract: "0xRena1ssCollect1bles00000000000000000000001",
} as const;

export const VAULTS = {
  hongKong: {
    id: "vault-hk",
    name: "YamaCardo Vault",
    countryCode: "HK",
    address: "Unit 1204, K11 Atelier, Victoria Dockside, Tsim Sha Tsui",
    safeAddress: "0xVaultHK00000000000000000000000000000001",
  },
  singapore: {
    id: "vault-sg",
    name: "Collector Crypt Vault",
    countryCode: "SG",
    address: "10 Collyer Quay, Ocean Financial Centre, Level 40",
    safeAddress: "0xVaultSG00000000000000000000000000000001",
  },
} as const;

export const NAV_ITEMS = [
  { href: "/cards", label: "My Cards", icon: "cards" as const },
  { href: "/deposit", label: "Deposit", icon: "deposit" as const },
  { href: "/redeem", label: "Redeem", icon: "redeem" as const },
  { href: "/settings", label: "Settings", icon: "settings" as const },
] as const;
