"use client";

import React, { useState, useEffect } from "react";
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

    const handleImageError = () => {
        setImageError(true);
        console.error("Failed to load image:", imageUrl);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-purple-500 opacity-10 blur-3xl"></div>
            <ConnectButton />
            <Card className="w-full max-w-md bg-gray-800/50 shadow-xl backdrop-blur-sm border border-gray-700">
                <CardHeader>
                    <CardTitle className="text-center text-gray-100">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            Congratulations!
                        </motion.div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    <p className="text-center text-gray-300">
                        You've won an exclusive NFT!
                    </p>
                    <div className="w-64 h-64 rounded-lg overflow-hidden shadow-lg bg-gray-700 flex items-center justify-center">
                        {imageError ? (
                            <p className="text-gray-400 text-center">
                                Failed to load NFT image
                            </p>
                        ) : (
                            <Image
                                src={imageUrl}
                                alt="Your NFT"
                                width={256}
                                height={256}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                                unoptimized // Disable Next.js image optimization for external URLs
                            />
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center m-5">
                    <Button
                        onClick={handleMint}
                        disabled={isMinting || isMinted}
                        className="w-full max-w-xs bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isMinting
                            ? "Minting..."
                            : isMinted
                              ? "NFT Minted!"
                              : "Mint Your NFT"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
