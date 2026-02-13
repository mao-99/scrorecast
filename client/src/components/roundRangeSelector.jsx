import { useState, useEffect } from "react";

export default function RoundRangeSelector({ onRangeChange, maxRounds = 38 }) {
    const [roundStart, setRoundStart] = useState(1);
    const [roundEnd, setRoundEnd] = useState(maxRounds);

    // Generate array of round numbers
    const rounds = Array.from({ length: maxRounds }, (_, i) => i + 1);

    const handleStartChange = (e) => {
        const newStart = parseInt(e.target.value);
        setRoundStart(newStart);
        
        // Ensure end is always >= start
        if (newStart > roundEnd) {
            setRoundEnd(newStart);
            onRangeChange({ start: newStart, end: newStart });
        } else {
            onRangeChange({ start: newStart, end: roundEnd });
        }
    };

    const handleEndChange = (e) => {
        const newEnd = parseInt(e.target.value);
        setRoundEnd(newEnd);
        
        // Ensure start is always <= end
        if (newEnd < roundStart) {
            setRoundStart(newEnd);
            onRangeChange({ start: newEnd, end: newEnd });
        } else {
            onRangeChange({ start: roundStart, end: newEnd });
        }
    };

    // Notify parent on initial mount
    useEffect(() => {
        onRangeChange({ start: roundStart, end: roundEnd });
    }, []);

    return (
        <div className="round-range-container">
            <div className="round-selector">
                <label htmlFor="round-start" className="round-label">From Round</label>
                <select
                    id="round-start"
                    value={roundStart}
                    onChange={handleStartChange}
                >
                    {rounds.map((round) => (
                        <option key={round} value={round}>
                            {round}
                        </option>
                    ))}
                </select>
            </div>

            <div className="round-selector">
                <label htmlFor="round-end" className="round-label">To Round</label>
                <select
                    id="round-end"
                    value={roundEnd}
                    onChange={handleEndChange}
                >
                    {rounds.map((round) => (
                        <option key={round} value={round}>
                            {round}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
