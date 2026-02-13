import styles from "./statSelect.module.css";

export default function StatSelect({ handleStatSelect, selectedStat }) {
    const stats = [
        { id: 'general', label: 'General' },
        { id: 'attacking', label: 'Attack' },
        { id: 'defensive', label: 'Defense' },
        { id: 'passing', label: 'Passing' },
    ];

    const currentStat = selectedStat || 'general';

    return (
        <div className={styles.buttonContainer}>
            {stats.map((stat) => (
                <button
                    key={stat.id}
                    className={`${styles.statButton} ${currentStat === stat.id ? styles.active : ''}`}
                    onClick={() => handleStatSelect(stat.id)}
                >
                    {stat.label}
                </button>
            ))}
        </div>
    );
}