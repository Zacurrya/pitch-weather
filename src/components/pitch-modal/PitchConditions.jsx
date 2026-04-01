import { Droplets, Footprints, Gauge, Gamepad2, Wind, Orbit } from 'lucide-react';
import { conditionLabel } from '@utils/conditionUtils';
import './PitchConditions.css';

const clampPercent = (value) => Math.max(0, Math.min(100, Math.round(value)));
const clamp01 = (value) => Math.max(0, Math.min(1, value));

const metricComment = (value, higherIsBetter) => {
    if (value == null) return 'No data';
    if (higherIsBetter) {
        if (value >= 75) return 'Strong';
        if (value >= 55) return 'Solid';
        if (value >= 35) return 'Mixed';
        return 'Weak';
    }
    if (value <= 25) return 'Low';
    if (value <= 45) return 'Moderate';
    if (value <= 65) return 'Elevated';
    return 'High';
};

const buildSportInsights = (condition, weatherData) => {
    if (!condition) {
        return {
            footballBallPace: null,
            footballControlScore: null,
            cricketSwingAid: null,
            cricketSpinGrip: null,
        };
    }
    const wetness = condition.wetness ?? 0;
    const muddiness = condition.muddiness ?? 0;
    const humidity = weatherData?.main?.humidity ?? 55;
    const temp = weatherData?.main?.temp ?? 15;
    const wind = weatherData?.wind?.speed ?? 3;

    const dryness = clamp01(1 - ((wetness + muddiness) / 200));
    const firmness = clamp01(1 - (muddiness / 100));
    const humidityFactor = clamp01((humidity - 35) / 55);
    const windFactor = clamp01(wind / 12);
    const warmthFactor = clamp01((temp - 5) / 20);

    const footballBallPace = clampPercent((dryness * 100 * 0.55) + (firmness * 100 * 0.25) + (warmthFactor * 100 * 0.2));
    const footballControlScore = clampPercent((dryness * 100 * 0.45) + ((1 - windFactor) * 100 * 0.35) + ((1 - humidityFactor) * 100 * 0.2));

    const cricketSwingAid = clampPercent((humidityFactor * 100 * 0.45) + (windFactor * 100 * 0.45) + (wetness * 0.1));
    const cricketSpinGrip = clampPercent((dryness * 100 * 0.55) + ((1 - humidityFactor) * 100 * 0.3) + (warmthFactor * 100 * 0.15));

    return {
        footballBallPace,
        footballControlScore,
        cricketSwingAid,
        cricketSpinGrip,
    };
};

const PitchConditions = ({ condition, weatherData, venueType, verdict, wColor, mColor }) => {
    if (!condition) {
        return (
            <div className="pitch-modal__conditions">
                {[0, 1].map((i) => (
                    <div key={i} className="pitch-modal__skeleton-row">
                        <div className="pitch-modal__skeleton-icon" />
                        <div className="pitch-modal__skeleton-body">
                            <div className="pitch-modal__skeleton-text" />
                            <div className="pitch-modal__skeleton-bar" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const isFootball = venueType === 'football';
    const insights = buildSportInsights(condition, weatherData);

    const sportInsightItems = isFootball
        ? [
            {
                key: 'football-ball-pace',
                icon: Gauge,
                label: 'Football ball pace',
                value: insights.footballBallPace,
                higherIsBetter: true,
            },
            {
                key: 'football-control-score',
                icon: Gamepad2,
                label: 'Football control score',
                value: insights.footballControlScore,
                higherIsBetter: true,
            },
        ]
        : [
            {
                key: 'cricket-swing-aid',
                icon: Wind,
                label: 'Cricket swing aid',
                value: insights.cricketSwingAid,
                higherIsBetter: true,
            },
            {
                key: 'cricket-spin-grip',
                icon: Orbit,
                label: 'Cricket spin grip',
                value: insights.cricketSpinGrip,
                higherIsBetter: true,
            },
        ];

    return (
        <div className="pitch-modal__conditions">
            <div className={`pitch-modal__verdict ${verdict.bg}`}>
                <span className={`pitch-modal__verdict-label ${verdict.color}`}>{verdict.label}</span>
            </div>

            <div className="pitch-modal__condition-row">
                <Droplets className="pitch-modal__condition-icon pitch-modal__condition-icon--wetness" strokeWidth={2.5} />
                <div className="pitch-modal__condition-body">
                    <div className="pitch-modal__condition-header">
                        <span className="pitch-modal__condition-title">Wetness</span>
                        <span className={`pitch-modal__condition-value ${wColor.text}`}>
                            {conditionLabel(condition.wetness, 'wetness')} ({condition.wetness}%)
                        </span>
                    </div>
                    <progress
                        className={`pitch-modal__bar-progress ${wColor.bar}`}
                        value={condition.wetness}
                        max={100}
                    />
                </div>
            </div>

            <div className="pitch-modal__condition-row">
                <Footprints className="pitch-modal__condition-icon pitch-modal__condition-icon--muddiness" strokeWidth={2.5} />
                <div className="pitch-modal__condition-body">
                    <div className="pitch-modal__condition-header">
                        <span className="pitch-modal__condition-title">Muddiness</span>
                        <span className={`pitch-modal__condition-value ${mColor.text}`}>
                            {conditionLabel(condition.muddiness, 'muddiness')} ({condition.muddiness}%)
                        </span>
                    </div>
                    <progress
                        className={`pitch-modal__bar-progress ${mColor.bar}`}
                        value={condition.muddiness}
                        max={100}
                    />
                </div>
            </div>

            <div className={`pitch-modal__sport-insights ${isFootball ? 'pitch-modal__sport-insights--football' : 'pitch-modal__sport-insights--cricket'}`}>
                <p className="pitch-modal__sport-insights-title">Sport insights</p>
                <div className="pitch-modal__sport-insights-list">
                    {sportInsightItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.key}
                                className={`pitch-modal__sport-metric ${isFootball ? 'pitch-modal__sport-metric--football' : 'pitch-modal__sport-metric--cricket'}`}
                            >
                                <div className="pitch-modal__sport-metric-header">
                                    <p className={`pitch-modal__sport-metric-name ${isFootball ? 'pitch-modal__sport-metric-name--football' : 'pitch-modal__sport-metric-name--cricket'}`}>
                                        <Icon className="pitch-modal__sport-metric-icon" />
                                        {item.label}
                                    </p>
                                    <p className={`pitch-modal__sport-metric-score ${isFootball ? 'pitch-modal__sport-metric-score--football' : 'pitch-modal__sport-metric-score--cricket'}`}>
                                        {metricComment(item.value, item.higherIsBetter)} | {item.value ?? '-'}{item.value != null ? '%' : ''}
                                    </p>
                                </div>
                                <progress
                                    className={`pitch-modal__sport-progress ${isFootball ? 'pitch-modal__sport-progress--football' : 'pitch-modal__sport-progress--cricket'}`}
                                    value={item.value ?? 0}
                                    max={100}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PitchConditions;
