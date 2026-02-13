import { useState, useEffect, useRef } from "react";
import premierLeague from "../assets/new-premier-league-2016-17-seeklogo.svg";
import laLiga from "../assets/la-liga-seeklogo.png";
import bundesliga from "../assets/bundesliga-seeklogo.png";
import serieA from "../assets/lega-serie-a-seeklogo.png";
import ligue1 from "../assets/ligue-1-seeklogo.png";
import mls from "../assets/mls-seeklogo.png";

const leagues = [
  {
    name: "Premier League",
    logo: premierLeague,
    country: "England",
    teams: 20,
    matches: "2.8K",
  },
  {
    name: "La Liga",
    logo: laLiga,
    country: "Spain",
    teams: 20,
    matches: "2.7K",
  },
  {
    name: "Bundesliga",
    logo: bundesliga,
    country: "Germany",
    teams: 18,
    matches: "2.4K",
  },
  {
    name: "Serie A",
    logo: serieA,
    country: "Italy",
    teams: 20,
    matches: "2.8K",
  },
  {
    name: "Ligue 1",
    logo: ligue1,
    country: "France",
    teams: 18,
    matches: "2.4K",
  },
  {
    name: "MLS",
    logo: mls,
    country: "USA",
    teams: 29,
    matches: "1.9K",
  },
];

export default function LeaguesSlider() {
    const [activeCardIndex, setActiveCardIndex] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const cardRefs = useRef([]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Tap/click to activate a card — tap again or tap another to switch
    const handleCardInteraction = (index) => {
        if (!isMobile) return;
        setActiveCardIndex(prev => prev === index ? null : index);
    };

    return (
        <section className="overflow-hidden py-8 pb-32">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="slideshow-container relative mx-auto max-w-6xl overflow-visible">
                <div className="slideshow-track flex items-center">
                {[...leagues, ...leagues].map((league, index) => (
                    <div
                    key={index}
                    ref={(el) => (cardRefs.current[index] = el)}
                    className={`league-slide mx-4 sm:mx-6 flex-none transition-all duration-500 ${
                        isMobile && activeCardIndex === index
                            ? 'league-slide-active-mobile'
                            : ''
                    }`}
                    onClick={() => handleCardInteraction(index)}
                    >
                    <div className="league-logo-display mb-4 flex justify-center">
                        <img
                        src={league.logo}
                        alt={league.name}
                        className="h-20 w-20 sm:h-24 sm:w-24 object-contain transition-all duration-500"
                        />
                    </div>
                    <div className="league-name mb-2 text-center text-xl sm:text-2xl font-bold text-slate-50">
                        {league.name}
                    </div>
                    <div className="league-country mb-4 text-center text-sm sm:text-base text-slate-400">
                        {league.country}
                    </div>
                    <div className="league-stats flex justify-around border-t border-white/10 pt-4 sm:pt-5">
                        <div className="stat text-center">
                        <div className="stat-value text-xl sm:text-2xl font-bold text-blue-400">
                            {league.teams}
                        </div>
                        <div className="stat-label mt-1 text-xs uppercase tracking-wider text-slate-600">
                            Teams
                        </div>
                        </div>
                        <div className="stat text-center">
                        <div className="stat-value text-xl sm:text-2xl font-bold text-blue-400">
                            {league.matches}
                        </div>
                        <div className="stat-label mt-1 text-xs uppercase tracking-wider text-slate-600">
                            Matches
                        </div>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            </div>
        </section>
    )
}