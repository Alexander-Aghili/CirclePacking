class GeoPoint {
    constructor(lat, lon) {
        this.lat = lat;
        this.lon = lon;
    }

}

function generateCircleCenters(quadrilateral, radiusMiles) {
    const centers = [];

    // Calculate the bounding box of the quadrilateral
    let minLat = Infinity, maxLat = -Infinity;
    let minLon = Infinity, maxLon = -Infinity;

    quadrilateral.forEach(point => {
        minLat = Math.min(minLat, point.lat);
        maxLat = Math.max(maxLat, point.lat);
        minLon = Math.min(minLon, point.lon);
        maxLon = Math.max(maxLon, point.lon);
    });

    // Convert radius in miles to degrees latitude and longitude
    const radiusLat = radiusMiles / 87.5; // Convert miles to degrees latitude
    const avgLat = (minLat + maxLat) / 2;
    const radiusLon = radiusMiles / (60 * Math.cos(avgLat * Math.PI / 180)); // Convert miles to degrees longitude

    // Calculate the horizontal and vertical distances in the hexagonal grid
    const hexHeight = Math.sqrt(3) * radiusLat;
    const hexWidth = 2 * radiusLon;

    // Iterate over the extended bounding box to generate points on the hexagonal grid
    for (let lat = minLat; lat <= maxLat + hexHeight; lat += hexHeight) {
        for (let lon = minLon; lon <= maxLon + hexWidth; lon += hexWidth) {
            const center1 = new GeoPoint(lat, lon);
            if (isInsideQuadrilateral(center1, quadrilateral)) {
                centers.push(center1);
            }

            // Add offset points for every other row
            const center2 = new GeoPoint(lat + hexHeight / 2, lon + hexWidth / 2);
            if (isInsideQuadrilateral(center2, quadrilateral)) {
                centers.push(center2);
            }
        }
    }

    // Remove duplicate points
    const uniqueCenters = Array.from(new Set(centers.map(JSON.stringify))).map(JSON.parse);

    return uniqueCenters;
}

function isInsideQuadrilateral(p, quadrilateral) {
    let result = false;
    let j = quadrilateral.length - 1;
    
    for (let i = 0; i < quadrilateral.length; i++) {
        if ((quadrilateral[i].lon > p.lon) !== (quadrilateral[j].lon > p.lon) &&
            (p.lat < (quadrilateral[j].lat - quadrilateral[i].lat) * 
            (p.lon - quadrilateral[i].lon) / 
            (quadrilateral[j].lon - quadrilateral[i].lon) + quadrilateral[i].lat)) {
            result = !result;
        }
        j = i;
    }

    return result;
}

function toArray(geopoint) {
    return [geopoint.lon, geopoint.lat];
}

function convertPointsToList(points) {
    return points.map(point => toArray(point));
}

export function get_points() {

    // Example usage
    const list = [
        new GeoPoint(38.179221, -123.048947),
        new GeoPoint(37.392936, -122.985316),
        new GeoPoint(37.363880, -121.406919),
        new GeoPoint(38.168864, -121.586248)
    ];

    const radiusMiles = 2;
    const ret = generateCircleCenters(list, radiusMiles);

    // Convert points to the desired list format
    const listFormat = convertPointsToList(ret);
    return listFormat
}



