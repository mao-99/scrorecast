export default function HomepageFeatures() {
    const features = [
        {
            icon: (
                <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
            ),
            title: "31,596 matches",
            description: "Every match. Every goal. Every card. Eight seasons across five leagues. This isn't a sample—it's the complete picture.",
        },
        {
            icon: (
                <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
            ),
            title: "50+ metrics",
            description: "Goals, xG, possession, passes, shots—everything that matters. Raw numbers and normalized rankings. No fluff. Just data that tells the story.",
        },
        {
            icon: (
                <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                </svg>
            ),
            title: "Filter everything",
            description: "Round ranges. Season comparisons. Raw or normalized. Cross-league analysis. Built for the questions no one else lets you ask.",
        },
    ];

    return (
        <section className="">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
                {/* Centered heading + subtitle (Meet Claude style) */}
                <div className="text-center mb-12 sm:mb-16 md:mb-20">
                    <h4 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-50 mb-4 sm:mb-6">
                        Meet ScoreCast
                    </h4>
                    <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-slate-400 font-light leading-relaxed">
                        A next generation soccer analytics platform built to help you see what the table doesn't show.
                    </p>
                </div>

                {/* Feature cards grid */}
                <div className="mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`group rounded-2xl bg-white/[0.03] p-6 sm:p-8 transition-all duration-300 hover:bg-white/[0.06] ${
                                index === features.length - 1 ? 'sm:col-span-2 sm:max-w-sm sm:mx-auto lg:col-span-1 lg:max-w-none' : ''
                            }`}
                        >
                            <div className="mb-5 sm:mb-6 inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-500/10 text-blue-400 transition-colors duration-300 group-hover:bg-blue-500/20">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl sm:text-2xl font-semibold text-slate-50 mb-2 sm:mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}