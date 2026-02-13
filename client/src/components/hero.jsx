import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'

export default function Hero() {
    const [displayText, setDisplayText] = useState('')
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isAnimated, setIsAnimated] = useState(false)

    const phrases = [
        "Advanced Soccer Analytics",
        "Big Leagues, Endless Insights",
        "For The Love Of The Beautiful Game"
    ]

    useEffect(() => {
        // Trigger entrance animations
        setIsAnimated(true)
    }, [])

    useEffect(() => {
        const currentPhrase = phrases[currentPhraseIndex]
        const typingSpeed = isDeleting ? 30 : 50
        const pauseDuration = 2000

        const handleTyping = () => {
            if (!isDeleting) {
                // Typing forward
                if (displayText.length < currentPhrase.length) {
                    setDisplayText(currentPhrase.substring(0, displayText.length + 1))
                } else {
                    // Phrase complete, pause then start deleting
                    setTimeout(() => setIsDeleting(true), pauseDuration)
                }
            } else {
                // Deleting backward
                if (displayText.length > 0) {
                    setDisplayText(currentPhrase.substring(0, displayText.length - 1))
                } else {
                    // Deletion complete, move to next phrase
                    setIsDeleting(false)
                    setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
                }
            }
        }

        const timer = setTimeout(handleTyping, typingSpeed)
        return () => clearTimeout(timer)
    }, [displayText, isDeleting, currentPhraseIndex])

    return (
        <section className="py-8 sm:py-14 md:py-16 lg:py-20 text-center overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
                {/* Animated Typewriter Heading - Fixed height container */}
                <div className="mb-6 sm:mb-8 md:mb-10 h-[100px] sm:h-[140px] md:h-[180px] lg:h-[200px] flex items-center justify-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        {displayText}
                        <span className="animate-pulse">|</span>
                    </h1>
                </div>

                {/* Subtitle with fade-in animation */}
                <p 
                    className={`pt-2 mx-auto mb-8 sm:mb-10 md:mb-12 max-w-2xl text-base sm:text-lg md:text-xl font-light text-slate-400 transition-all duration-500 ${
                        isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: '300ms' }}
                >
                    Uncover insights from 15,000+ matches across six elite leagues
                </p>

                {/* CTA Buttons - Responsive Layout */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto px-4 sm:px-0">
                    <Link 
                        to="/leagues" 
                        className={`w-full sm:w-auto transition-all duration-500 ${
                            isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                        style={{ transitionDelay: '400ms' }}
                    >
                        <Button 
                            size="lg" 
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white border-0 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        >
                            Explore Data
                        </Button>
                    </Link>
                    <Link 
                        to="/teams" 
                        className={`w-full sm:w-auto transition-all duration-500 ${
                            isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                        }`}
                        style={{ transitionDelay: '500ms' }}
                    >
                        <Button 
                            size="lg" 
                            className="w-full sm:w-auto bg-blue-900/30 hover:bg-blue-800/40 text-blue-300 hover:text-blue-100 border border-blue-500/40 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-lg transition-all hover:scale-105"
                        >
                            View Demo
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}