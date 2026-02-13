import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const questions = [
    {
        question: "What can I do in Leagues?",
        answer:
            "View live standings and team statistics for all five leagues. Filter by season and round range to track how form shifted throughout a campaign. See who climbed, who fell, and when the table told a different story.",
    },
    {
        question: "What can I do in Teams?",
        answer:
            "Compare teams across leagues and eras using raw stats or normalized per-game averages. Toggle to percentile rankings, or compare each team to their league average—see how much better or worse they performed relative to their competition. Understand if a 2.1 goals-per-game season was dominant or just above average.",
    },
    {
        question: "What can I do in Seasons?",
        answer:
            "Track how teams evolve across multiple seasons. Select any combination of teams and instantly see a Season Availability Matrix showing which seasons each team has data for. Below that, a Season Progression Chart lets you pick from 30+ metrics—points per game, win %, goals scored, clean sheet %, home/away splits—and visualize how each team's performance trended over time. Great for spotting dynasty runs, rebuilding years, or comparing trajectories across leagues.",
    },
    {
        question: "What stats are available?",
        answer:
            "Over 50 metrics across four categories: General, Attacking, Defensive, and Passing. Advanced stats like xG are available from the 2022-23 season onward. Everything is filterable by round range, season, and league.",
    },
    {
        question: "Which leagues are covered?",
        answer:
            "Five of Europe's top leagues: Premier League, La Liga, Bundesliga, Serie A, and Ligue 1—plus MLS. Eight seasons of historical data across 31,596 matches.",
    },
];

export default function FeatureGuide() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-16 sm:py-20 md:py-28">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
                <h2 className="mb-10 sm:mb-12 md:mb-16 text-center text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-50">
                    FAQ
                </h2>

                <div className="mx-auto max-w-3xl">
                    {questions.map((item, index) => (
                        <div
                            key={index}
                            className="border-t border-white/10 first:border-t-0"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex items-center justify-between py-5 sm:py-6 md:py-7 text-left cursor-pointer group"
                            >
                                <h3 className="text-base sm:text-lg md:text-xl font-medium text-slate-200 pr-8 group-hover:text-slate-50 transition-colors duration-200">
                                    {item.question}
                                </h3>
                                <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/15 flex items-center justify-center text-slate-400 group-hover:text-slate-200 group-hover:border-white/25 transition-all duration-200">
                                    {openIndex === index ? (
                                        <Minus className="w-4 h-4" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                </div>
                            </button>

                            <div
                                className={`grid transition-all duration-300 ease-out ${
                                    openIndex === index
                                        ? "grid-rows-[1fr] opacity-100"
                                        : "grid-rows-[0fr] opacity-0"
                                }`}
                            >
                                <div className="overflow-hidden">
                                    <p className="pb-5 sm:pb-6 md:pb-7 pr-12 text-sm sm:text-base text-slate-400 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
