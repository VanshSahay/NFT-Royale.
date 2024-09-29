"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
    useWriteContract,
    useWaitForTransactionReceipt,
    useSendTransaction,
} from "wagmi";
import { abi, contractAddress } from "../../constants";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface NFTWinnerProps {
    imageUrl: string;
}

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
    className,
    ...props
}) => (
    <button
        className={`px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
        {...props}
    />
);

const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => <div className={`rounded-lg ${className}`} {...props} />;

const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => (
    <div className="p-6" {...props} />
);

const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
    className,
    ...props
}) => <h2 className={`text-2xl font-bold ${className}`} {...props} />;

const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => (
    <div className="p-6 pt-0" {...props} />
);

const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => (
    <div className="p-6 pt-0" {...props} />
);

export default function Component({
    imageUrl = "https://black-just-toucan-396.mypinata.cloud/ipfs/QmYAFE4UUgYdXkbMzFpZmKHM4i2MB4k3HT6qE2rum2dZy2",
}: any) {
    const [isMinting, setIsMinting] = useState(false);
    const [isMinted, setIsMinted] = useState(false);
    const [imageError, setImageError] = useState(false);
    const {
        writeContract,
        isPending: isWriteLoading,
        status: writeStatus,
        isError: isWriteError,
        data: hash,
        error,
        isPending,
    } = useWriteContract();

    const account = useAccount();

    let userAddress: any;

    if (account.status === "connected") {
        userAddress = account.address;
    }

    const { data, sendTransaction } = useSendTransaction();

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        });

    const handleMint = async () => {
        if (!userAddress) {
            console.error("User address not available");
            return;
        }

        try {
            const result: any = writeContract({
                address: contractAddress,
                abi,
                functionName: "mintNFT",
                args: [
                    userAddress,
                    "QmYAFE4UUgYdXkbMzFpZmKHM4i2MB4k3HT6qE2rum2dZy2",
                ],
            });

            if (result) {
                sendTransaction({
                    to: contractAddress,
                    data: result.data,
                });
            }
        } catch (err) {
            console.error("Error minting NFT:", err);
        }
    };

    useEffect(() => {
        if (writeStatus === "pending") {
            toast.loading("Started To Mint NFT", {
                duration: 3000,
            });
        } else if (
            writeStatus === "success" &&
            !isWriteLoading &&
            !isWriteError
        ) {
            setIsMinting(false);
        } else if (writeStatus === "error") {
            toast.error("Error While Minting NFT!");
            setIsMinting(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [writeStatus]);

    const bgRef = useRef(null);
    const titleRef = useRef(null);

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative">
            <div
                ref={bgRef}
                className="fixed inset-0 bg-gradient-to-b from-purple-900 via-blue-900 to-black opacity-50 z-0"
            ></div>
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
                <Card className="w-full max-w-lg bg-purple-900 bg-opacity-30 backdrop-blur-md rounded-xl shadow-2xl">
                    <CardHeader>
                        <h1
                            ref={titleRef}
                            className="text-4xl font-bold text-center text-blue-300"
                        >
                            Congratulations!
                        </h1>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-xl text-center text-blue-200">
                            You've won the puzzle and earned an exclusive NFT!
                        </p>
                        <div className="relative flex flex-col items-center justify-center">
                            <div className="mt-3 mb-7">
                                <ConnectButton />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 rounded-lg filter blur-3xl opacity-30"></div>
                            <motion.div
                                className="w-48 h-48 bg-gradient-to-br from-purple-500 via-blue-600 to-purple-700 rounded-lg shadow-lg overflow-hidden"
                                animate={{
                                    scale: [1, 1.05, 1],
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                }}
                            >
                                <div className="w-full h-full flex items-center justify-center">
                                    {/* Empty space for NFT */}
                                    <div className="w-40 h-40 rounded-lg border-2 border-dashed border-white/50 flex items-center justify-center">
                                        <img src={imageUrl} alt="dsa" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        <p className="text-lg text-center mx-2 text-blue-200">
                            Your NFT represents your victory in NFT Royale. It's
                            a unique digital asset that you can keep or trade.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button
                            onClick={handleMint}
                            className="bg-purple-600 m-5 hover:bg-purple-500 text-white font-semibold py-3 px-8 rounded-full transition-colors"
                        >
                            Claim Your NFT
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
