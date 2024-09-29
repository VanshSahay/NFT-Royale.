"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useRouter } from "next/navigation";
import React from "react";

export default function Component() {
    const sectionsRef = useRef<HTMLElement[]>([]);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        const sections = sectionsRef.current;
        const title = titleRef.current;
        const bg = bgRef.current;

        if (bg) {
            gsap.to(bg, {
                yPercent: 10,
                ease: "none",
                scrollTrigger: {
                    trigger: document.body,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true,
                },
            });
        }

        if (title) {
            gsap.from(title, {
                opacity: 0,
                duration: 1,
                ease: "power3.out",
            });
        }

        sections.forEach((section) => {
            const elements = section.querySelectorAll("h2, p, .content, li");
            gsap.from(elements, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",
                    end: "top 20%",
                    toggleActions: "play none none reverse",
                },
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
            });
        });

        const buttons = document.querySelectorAll("button, a");
        buttons.forEach((button) => {
            button.addEventListener("mouseenter", () => {
                gsap.to(button, {
                    scale: 1.05,
                    duration: 0.2,
                    ease: "power1.out",
                });
            });
            button.addEventListener("mouseleave", () => {
                gsap.to(button, { scale: 1, duration: 0.2, ease: "power1.in" });
            });
        });

        return () => {
            ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
            buttons.forEach((button) => {
                button.removeEventListener("mouseenter", () => {});
                button.removeEventListener("mouseleave", () => {});
            });
        };
    }, [isClient]);

    const scrollTo = (index: number) => {
        if (!isClient) return;
        gsap.to(window, {
            duration: 1,
            scrollTo: { y: sectionsRef.current[index], offsetY: 50 },
            ease: "power3.inOut",
        });
    };

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative">
            <div
                ref={bgRef}
                className="fixed inset-0 bg-gradient-to-b from-purple-900 via-blue-900 to-black opacity-50 z-0"
            ></div>
            <header className="fixed top-0 left-0 w-full z-50 bg-purple-900 bg-opacity-0 backdrop-blur-md">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 ref={titleRef} className="text-2xl font-bold text-blue-300">
                        NFT Royale
                    </h1>
                    <nav>
                        <button
                            onClick={() => scrollTo(3)}
                            className="mr-4 hover:text-blue-300 transition-colors"
                        >
                            Play Now
                        </button>
                        <button
                            onClick={() => scrollTo(2)}
                            className="hover:text-blue-300 transition-colors"
                        >
                            Rules
                        </button>
                    </nav>
                </div>
            </header>

            <main className="relative z-10">
                <section
                    ref={(el: any) => el && (sectionsRef.current[0] = el)}
                    className="min-h-screen flex flex-col justify-center items-center px-4 pt-16"
                >
                    <div className="text-center max-w-4xl mx-auto">
                        <h2 className="text-5xl md:text-6xl font-bold mb-4 text-purple-300">
                            Welcome to NFT Royale
                        </h2>
                        <p className="text-xl mb-8 text-blue-300">Battle. Solve. Mint.</p>
                        <button
                            onClick={() => scrollTo(3)}
                            className="inline-block px-8 py-3 bg-purple-600 text-white rounded-full text-lg font-semibold hover:bg-purple-500 transition-colors"
                        >
                            Start Playing
                        </button>
                    </div>
                </section>

                <section
                    ref={(el: any) => el && (sectionsRef.current[1] = el)}
                    className="min-h-screen flex items-center px-4"
                >
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-purple-300">
                            What is NFT Royale?
                        </h2>
                        <div className="content space-y-6 text-blue-200">
                            <p className="text-lg md:text-xl leading-relaxed">
                                NFT Royale is an exhilarating game where two
                                users engage in a battle of wits and speed. Your
                                mission is to solve a picture puzzle faster than
                                your opponent.
                            </p>
                            <p className="text-lg md:text-xl leading-relaxed">
                                The prize? The victorious player gets the solved
                                picture minted as an exclusive NFT on their
                                account. Are you ready to claim your digital
                                treasure?
                            </p>
                        </div>
                    </div>
                </section>

                <section
                    ref={(el: any) => el && (sectionsRef.current[2] = el)}
                    className="min-h-screen flex items-center px-4"
                >
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-purple-300">
                            How to Play
                        </h2>
                        <div className="content">
                            <ol className="text-lg md:text-xl leading-relaxed list-decimal list-inside space-y-4 text-blue-200">
                                <li>
                                    Join a game and get matched with an opponent
                                </li>
                                <li>
                                    A picture puzzle will be presented to both
                                    players
                                </li>
                                <li>
                                    Race to solve the puzzle before your
                                    opponent
                                </li>
                                <li>
                                    The first player to correctly solve the
                                    puzzle wins
                                </li>
                                <li>
                                    The winning player receives the picture as
                                    an NFT
                                </li>
                            </ol>
                        </div>
                    </div>
                </section>

                <section
                    ref={(el: any) => el && (sectionsRef.current[3] = el)}
                    className="min-h-screen flex items-center px-4"
                >
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-purple-300">
                            Ready to Play?
                        </h2>
                        <div className="content">
                            <p className="text-lg md:text-xl mb-8 text-blue-200">
                                Join the NFT Royale now and start your journey
                                to NFT mastery!
                            </p>
                            <div className="space-y-4 md:space-y-0 md:space-x-4">
                                <button
                                    onClick={() => router.push("/game")}
                                    className="inline-block px-8 py-3 bg-purple-600 text-white rounded-full text-lg font-semibold hover:bg-purple-500 transition-colors"
                                >
                                    Play Now
                                </button>
                                <button
                                    onClick={() => scrollTo(2)}
                                    className="inline-block px-8 py-3 border border-blue-400 text-blue-400 rounded-full text-lg font-semibold hover:bg-blue-400 hover:text-black transition-colors"
                                >
                                    Read Rules
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}