"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "react-spring";
import { socket } from "../../socket";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";

const GRID_SIZE = 3;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;

const IMAGE_URL =
    "https://black-just-toucan-396.mypinata.cloud/ipfs/QmYAFE4UUgYdXkbMzFpZmKHM4i2MB4k3HT6qE2rum2dZy2";

const ParallaxLayer = ({
    depth,
    children,
}: {
    depth: number;
    children: React.ReactNode;
}) => {
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX - window.innerWidth / 2) / (depth / 5);
            const y = (e.clientY - window.innerHeight / 2) / (depth / 5);
            setOffset({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [depth]);

    return (
        <div
            className="absolute inset-0"
            style={{
                transform: `translate(${offset.x}px, ${offset.y}px)`,
                transition: "transform 0.1s ease-out",
            }}
        >
            {children}
        </div>
    );
};

const Card = ({ className, children }) => (
    <div
        className={`bg-purple-900 bg-opacity-30 backdrop-blur-md rounded-xl shadow-2xl ${className}`}
    >
        {children}
    </div>
);

const CardHeader = ({ children }) => <div className="p-6">{children}</div>;

const CardContent = ({ children }) => (
    <div className="px-6 py-4">{children}</div>
);

const CardFooter = ({ children }) => (
    <div className="px-6 py-4">{children}</div>
);

// Simplified Button component
const Button = ({ onClick, className, children }) => (
    <button
        onClick={onClick}
        className={`bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-8 rounded-full transition-colors ${className}`}
    >
        {children}
    </button>
);

// Simplified Input component
const Input = ({ type, placeholder, value, onChange, className }) => (
    <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-purple-800 bg-opacity-50 text-blue-200 placeholder-blue-400 border-blue-400 rounded-md py-2 px-4 ${className}`}
    />
);

export default function CoolPuzzle() {
    const [tiles, setTiles] = useState(
        Array.from({ length: TILE_COUNT }, (_, i) => i)
    );
    const [isComplete, setIsComplete] = useState(false);
    const [showNumbers, setShowNumbers] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const [playerNumber, setPlayerNumber] = useState("gg");
    const [isStarted, setIsStarted] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (socket.connected) {
            onConnect();
        }

        const timeout = setTimeout(() => {
            socket.emit("getPlayerNumber");
        }, 100);

        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);

            socket.io.engine.on("upgrade", (transport) => {
                setTransport(transport.name);
            });
        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }

        socket.on("playerNumber", (playerNumber) => {
            setPlayerNumber(playerNumber);
        });

        socket.on("gametoast", (arg) => {
            setIsStarted(true);
            toast(arg);
        });

        socket.on("gameOver", (arg) => {
            toast(arg);
            router.push("/");
        });

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("create-room", (value) => {
            toast(value);
        });
        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            clearTimeout(timeout);
        };
    }, []);

    useEffect(() => {
        shuffleTiles();
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const { width, height } =
                    containerRef.current.getBoundingClientRect();
                const x = e.clientX / width;
                const y = e.clientY / height;
                setMousePosition({ x, y });
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    if (isComplete) {
        router.push("/mint");
    }

    const shuffleTiles = () => {
        let shuffled;
        do {
            shuffled = [...Array(TILE_COUNT).keys()].sort(
                () => Math.random() - 0.5
            );
        } while (!isSolvable(shuffled) || isArraySorted(shuffled));
        setTiles(shuffled);
        setIsComplete(false);
    };

    const isSolvable = (puzzle: number[]): boolean => {
        let inversions = 0;
        const puzzleWithoutBlank = puzzle.filter(
            (num) => num !== TILE_COUNT - 1
        );

        for (let i = 0; i < puzzleWithoutBlank.length; i++) {
            for (let j = i + 1; j < puzzleWithoutBlank.length; j++) {
                if (puzzleWithoutBlank[i] > puzzleWithoutBlank[j]) {
                    inversions++;
                }
            }
        }

        const blankRowFromBottom = Math.floor(
            (TILE_COUNT - 1 - puzzle.indexOf(TILE_COUNT - 1)) / GRID_SIZE
        );

        if (GRID_SIZE % 2 === 1) {
            return inversions % 2 === 0;
        } else {
            return (inversions + blankRowFromBottom) % 2 === 1;
        }
    };

    const isArraySorted = (arr: number[]): boolean => {
        return arr.every(
            (value, index) => index === TILE_COUNT - 1 || value === index
        );
    };

    const moveTile = (index: number) => {
        const emptyIndex = tiles.indexOf(TILE_COUNT - 1);
        if (isAdjacent(index, emptyIndex)) {
            const newTiles = [...tiles];
            [newTiles[index], newTiles[emptyIndex]] = [
                newTiles[emptyIndex],
                newTiles[index],
            ];
            setTiles(newTiles);
            checkWinCondition(newTiles);
        }
    };

    const isAdjacent = (index1: number, index2: number) => {
        const row1 = Math.floor(index1 / GRID_SIZE);
        const col1 = index1 % GRID_SIZE;
        const row2 = Math.floor(index2 / GRID_SIZE);
        const col2 = index2 % GRID_SIZE;
        return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
    };

    const checkWinCondition = (currentTiles: number[]) => {
        const isWin = currentTiles.every((tile, index) => tile === index);
        setIsComplete(isWin);
    };

    const toggleNumbers = () => {
        setShowNumbers(!showNumbers);
    };

    const springProps = useSpring({
        from: { opacity: 0, transform: "scale(0.8)" },
        to: { opacity: 1, transform: "scale(1)" },
        config: { tension: 300, friction: 10 },
    });

    const backgroundStyle = {
        background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
                 rgba(76, 29, 149, 0.7) 0%, 
                 rgba(124, 58, 237, 0.5) 30%, 
                 rgba(30, 58, 138, 0.3) 70%, 
                 rgba(30, 58, 138, 0.1) 100%)`,
    };

    const bgRef = useRef(null);
    const titleRef = useRef(null);
    const [username, setUsername] = useState("");

    return !isStarted ? (
        // <>
        //     {playerNumber}
        //     <br />
        //     <br />
        //     <button
        //         onClick={() => {
        //             if (playerNumber === "player2") {
        //                 socket.emit("startGame", socket.id);
        //             } else {
        //                 toast("Wait for another person to Join!");
        //             }
        //         }}
        //     >
        //         Start Game
        //     </button>
        // </>
        <div className="min-h-screen bg-black text-white overflow-hidden relative">
            <div
                ref={bgRef}
                className="fixed inset-0 bg-gradient-to-b from-purple-900 via-blue-900 to-black opacity-50 z-0"
            ></div>
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
                <Card className="w-96">
                    <CardHeader>
                        <h1
                            ref={titleRef}
                            className="text-3xl font-bold text-center text-blue-300"
                        >
                            NFT Royale
                        </h1>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <Input
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={``}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={() => {
                                if (playerNumber === "player2") {
                                    socket.emit("startGame", socket.id);
                                } else {
                                    toast("Wait for another person to Join!");
                                }
                            }}
                            className="w-full"
                        >
                            Join Game
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    ) : (
        <div
            ref={containerRef}
            className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gray-900"
        >
            <div className="absolute inset-0" style={backgroundStyle}></div>
            <ParallaxLayer depth={10}>
                <div className="absolute inset-0">
                    <div
                        className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full filter blur-3xl opacity-40"
                        style={{
                            transform: `translate(${mousePosition.x * 100}px, ${mousePosition.y * 100}px)`,
                        }}
                    />
                    <div
                        className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-20"
                        style={{
                            transform: `translate(${-mousePosition.x * 100}px, ${-mousePosition.y * 100}px)`,
                        }}
                    />
                </div>
            </ParallaxLayer>
            <ParallaxLayer depth={20}>
                <div className="absolute inset-0">
                    <div
                        className="absolute top-1/2 left-1/3 w-48 h-48 bg-purple-300 rounded-full filter blur-2xl opacity-10"
                        style={{
                            transform: `translate(${mousePosition.y * 50}px, ${mousePosition.x * 50}px)`,
                        }}
                    />
                    <div
                        className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-blue-200 rounded-full filter blur-2xl opacity-10"
                        style={{
                            transform: `translate(${-mousePosition.y * 50}px, ${-mousePosition.x * 50}px)`,
                        }}
                    />
                </div>
            </ParallaxLayer>
            <animated.div
                style={springProps}
                className="relative z-10 flex flex-col items-center"
            >
                <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl">
                    <img
                        src={IMAGE_URL}
                        alt="Complete puzzle"
                        className="w-48 h-48 object-cover"
                    />
                </div>
                <motion.div
                    className="grid gap-1.5 p-8 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl"
                    style={{
                        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                        width: `${GRID_SIZE * 100 + 64}px`,
                        height: `${GRID_SIZE * 100 + 64}px`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <AnimatePresence>
                        {tiles.map((tile, index) => (
                            <motion.div
                                key={tile}
                                layoutId={`tile-${tile}`}
                                className={`relative cursor-pointer ${
                                    tile === TILE_COUNT - 1 ? "invisible" : ""
                                }`}
                                onClick={() => moveTile(index)}
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    overflow: "hidden",
                                }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                }}
                                whileHover={{ scale: 1.05, zIndex: 1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <img
                                    src={IMAGE_URL}
                                    alt={`Tile ${tile + 1}`}
                                    className="absolute object-cover rounded-lg"
                                    style={{
                                        width: `${GRID_SIZE * 100}px`,
                                        height: `${GRID_SIZE * 100}px`,
                                        objectPosition: `${-(tile % GRID_SIZE) * 100}px ${-Math.floor(tile / GRID_SIZE) * 100}px`,
                                    }}
                                />
                                {showNumbers && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-purple-600 bg-opacity-80 text-blue-200 text-3xl font-bold backdrop-blur-sm rounded-lg">
                                        {tile + 1}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
                <AnimatePresence>
                    {isComplete && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            transition={{ duration: 0.5 }}
                            className="mt-10 text-3xl font-bold text-blue-200 bg-purple-600 bg-opacity-80 p-6 rounded-xl backdrop-blur-xl shadow-2xl"
                        >
                            Congratulations! You solved the puzzle!
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="mt-10 space-x-6">
                    <button
                        onClick={shuffleTiles}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full backdrop-blur-xl transition-all duration-300 shadow-2xl hover:shadow-purple-300/50"
                    >
                        Shuffle
                    </button>
                    <button
                        onClick={toggleNumbers}
                        className="bg-blue-400 hover:bg-blue-300 text-white font-bold py-3 px-8 rounded-full backdrop-blur-xl transition-all duration-300 shadow-2xl hover:shadow-blue-200/50"
                    >
                        {showNumbers ? "Hide Numbers" : "Show Numbers"}
                    </button>
                </div>
            </animated.div>
        </div>
    );
}
