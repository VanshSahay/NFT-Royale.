import { http, cookieStorage, createConfig, createStorage } from "wagmi";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import { Chain } from "@rainbow-me/rainbowkit";

const neox = {
    id: 12227332,
    name: "NeoX T4",
    nativeCurrency: { name: "GAS", symbol: "GAS", decimals: 18 },
    rpcUrls: {
        default: { http: ["https://neoxt4seed1.ngd.network"] },
    },
    blockExplorers: {
        default: {
            name: "NEOX Chain Explorer",
            url: "https://xt4scan.ngd.network/",
        },
    },
    contracts: {
        multicall3: {
            address: "0xBe521F003F128BF04F24C5A719a0640b419B346d",
            blockCreated: 503142,
        },
    },
} as const satisfies Chain;

export function getConfig() {
    return createConfig({
        chains: [neox],
        connectors: [
            injected(),
            coinbaseWallet(),
            walletConnect({ projectId: "2863f663b8412a62861829f1fe2afa00" }),
        ],
        storage: createStorage({
            storage: cookieStorage,
        }),
        ssr: true,
        transports: {
            [neox.id]: http(),
        },
    });
}

declare module "wagmi" {
    interface Register {
        config: ReturnType<typeof getConfig>;
    }
}
