export const getOffsetTarget = (target, latitudeOffset = 0, longitudeOffset = 0) => {
    if (!target || typeof target.lat !== 'number' || typeof target.lng !== 'number') {
        return null;
    }

    return {
        lat: target.lat + latitudeOffset,
        lng: target.lng + longitudeOffset,
    };
};

export const panToTargetWithOffset = (map, target, latitudeOffset = 0, longitudeOffset = 0) => {
    if (!map) return;

    const offsetTarget = getOffsetTarget(target, latitudeOffset, longitudeOffset);
    if (!offsetTarget) return;

    map.panTo(offsetTarget);
};
