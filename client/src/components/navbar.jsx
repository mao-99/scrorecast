import { Button } from "./ui/button"
import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"


export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const navLinks = [
    { to: '/leagues', label: 'Leagues' },
    { to: '/teams', label: 'Teams' },
    { to: '/seasons', label: 'Seasons' },
  ]

  return (
    <>
      <header className="border-b border-white/10 py-4 lg:py-6 relative z-50 bg-inherit">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="text-xl lg:text-2xl font-bold tracking-tight text-slate-50">
              <Link to={'/'}>
                ScoreCast
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-4">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to}>
                  <Button 
                    size="lg" 
                    className={`bg-blue-900/30 border-blue-500/40 px-6 py-6 text-base shadow-lg transition-all hover:bg-blue-800/40 hover:text-blue-100 ${
                      location.pathname === link.to ? 'text-blue-100 bg-blue-800/40' : 'text-blue-300'
                    }`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button - Animated Hamburger */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden text-slate-50 focus:outline-none p-2 relative w-10 h-10 flex items-center justify-center"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span 
                  className={`w-full h-0.5 bg-current rounded-full transform transition-all duration-300 ease-out origin-center ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
                />
                <span 
                  className={`w-full h-0.5 bg-current rounded-full transition-all duration-200 ease-out ${
                    isMobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                  }`}
                />
                <span 
                  className={`w-full h-0.5 bg-current rounded-full transform transition-all duration-300 ease-out origin-center ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobileMenu}
      />

      {/* Mobile Navigation Drawer */}
      <nav 
        className={`fixed top-0 right-0 h-full w-72 bg-slate-900/95 backdrop-blur-md z-50 lg:hidden transform transition-transform duration-300 ease-out shadow-2xl ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            {/* <span className="text-lg font-semibold text-slate-50">Menu</span> */}
            <button
              onClick={toggleMobileMenu}
              className="text-slate-400 hover:text-slate-50 transition-colors p-2"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-4">
            {navLinks.map((link, index) => (
              <Link 
                key={link.to} 
                to={link.to}
                className={`block transition-all duration-300 ${
                  isMobileMenuOpen 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-8'
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? `${(index + 1) * 75}ms` : '0ms' }}
              >
                <div 
                  className={`mx-3 my-1 px-4 py-4 rounded-lg text-base font-medium transition-all duration-200 ${
                    location.pathname === link.to 
                      ? 'bg-blue-800/50 text-blue-100 border-blue-400' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-slate-50'
                  }`}
                >
                  {link.label}
                </div>
              </Link>
            ))}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-white/10">
            <Link to="/" className="block" onClick={() => {setIsMobileMenuOpen(false)}}>
              <div className="text-center py-3 text-slate-400 hover:text-slate-50 transition-colors text-sm">
                ← Back to Home
              </div>
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}