import java.util.ArrayList;
import java.util.List;
import java.util.Arrays; 
import java.util.stream.Collectors; 

public class ZoneCover {

    public static void main(String[] args) {
        GeoPoint[] list = new GeoPoint[4];
        list[0] = new GeoPoint(38.179221, -123.048947);
        list[1] = new GeoPoint(37.392936, -122.985316);
        list[2] = new GeoPoint(37.363880, -121.406919);
        list[3] = new GeoPoint(38.168864, -121.586248);

        double radiusMiles = 2;
        List<GeoPoint> ret = generateCircleCenters(list, radiusMiles);
        List<GeoPoint> uni = ret.stream() 
                            .distinct() 
                            .collect(Collectors.toList()); 

        for (GeoPoint g : uni) {
            System.out.println(g);
        }
    }

    public static class GeoPoint {
        double lat;
        double lon;

        public GeoPoint(double lat, double lon) {
            this.lat = lat;
            this.lon = lon;
        }

        @Override
        public String toString() {
            return  "[" + lon + ", " + lat + "],";
        }

        // @Override
        // public int compare(Object o) {
        //     GeoPoint geo = (GeoPoint)o;
        //     return (this.lat == geo.lat && this.lon == geo.lon) ? 0 : 1; 
        // }
    }

    public static List<GeoPoint> generateCircleCenters(GeoPoint[] quadrilateral, double radiusMiles) {
        List<GeoPoint> centers = new ArrayList<>();

        // Calculate the bounding box of the quadrilateral
        double minLat = Double.MAX_VALUE, maxLat = Double.MIN_VALUE;
        double minLon = Double.MAX_VALUE, maxLon = Double.MIN_VALUE;
        for (GeoPoint point : quadrilateral) {
            minLat = Math.min(minLat, point.lat);
            maxLat = Math.max(maxLat, point.lat);
            minLon = Math.min(minLon, point.lon);
            maxLon = Math.max(maxLon, point.lon);
        }

        // Convert radius in miles to degrees latitude and longitude
        double radiusLat = radiusMiles / 68.8636; // Convert miles to degrees latitude
        double avgLat = (minLat + maxLat) / 2;
        double radiusLon = radiusMiles / (68.8636 * Math.cos(Math.toRadians(avgLat))); // Convert miles to degrees longitude

        // Calculate the horizontal and vertical distances in the hexagonal grid
        double hexHeight = Math.sqrt(3) * radiusLat;
        double hexWidth = 2 * radiusLon;

        // Extend the bounding box by one radius in all directions
        minLat -= radiusLat;
        maxLat += radiusLat;
        minLon -= radiusLon;
        maxLon += radiusLon;

        // Iterate over the extended bounding box to generate points on the hexagonal grid
        for (double lat = minLat; lat <= maxLat + hexHeight; lat += hexHeight) {
            for (double lon = minLon; lon <= maxLon + hexWidth; lon += hexWidth) {
                GeoPoint center1 = new GeoPoint(lat, lon);
                if (isInsideQuadrilateral(center1, quadrilateral)) {
                    centers.add(center1);
                }

                // Add offset points for every other row
                GeoPoint center2 = new GeoPoint(lat + hexHeight / 2, lon + hexWidth / 2);
                if (isInsideQuadrilateral(center2, quadrilateral)) {
                    centers.add(center2);
                }
            }
        }

        return centers;
    }

    public static boolean isInsideQuadrilateral(GeoPoint p, GeoPoint[] quadrilateral) {
        // Ray-casting algorithm to check if a point is inside a polygon
        boolean result = false;
        int j = quadrilateral.length - 1;
        for (int i = 0; i < quadrilateral.length; i++) {
            if ((quadrilateral[i].lon > p.lon) != (quadrilateral[j].lon > p.lon) &&
                (p.lat < (quadrilateral[j].lat - quadrilateral[i].lat) * 
                (p.lon - quadrilateral[i].lon) / 
                (quadrilateral[j].lon - quadrilateral[i].lon) + quadrilateral[i].lat)) {
                result = !result;
            }
            j = i;
        }
        return result;
    }
}
