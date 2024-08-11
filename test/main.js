import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {Feature} from 'ol';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import Circle from 'ol/geom/Circle';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import {fromLonLat} from 'ol/proj';

// Convert miles to meters (1 mile = 1609.34 meters)
const milesToMeters = (miles) => miles * 1609.34;

// Define the list of coordinates with [Longitude, Latitude]
const coordinatesList = [
  [-122.4194, 37.7749], // San Francisco
  [-74.0060, 40.7128],  // New York
  [-118.2437, 34.0522], // Los Angeles
];

// Define the radius in miles
const radiusInMiles = 2;

// Create an empty vector source to hold all features
const vectorSource = new VectorSource();

// Function to create features (dot and circle) for each coordinate
const createFeatures = (coordinates, radiusInMiles) => {
  const radiusInMeters = milesToMeters(radiusInMiles);
  const center = fromLonLat(coordinates);

  // Create a feature for the dot at the center
  const dotFeature = new Feature({
    geometry: new Point(center),
  });

  // Create a feature for the circle with the specified radius
  const circleFeature = new Feature({
    geometry: new Circle(center, radiusInMeters),
  });

  // Style for the dot
  dotFeature.setStyle(new Style({
    image: new Icon({
      src: 'https://upload.wikimedia.org/wikipedia/commons/1/11/BlackDot.svg',
      scale: 0.05,
    })
  }));

  // Style for the circle
  circleFeature.setStyle(new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 2,
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)',
    }),
  }));

  // Add features to the vector source
  vectorSource.addFeature(dotFeature);
  vectorSource.addFeature(circleFeature);
};

// Loop through the list of coordinates and create features for each
coordinatesList.forEach(coordinates => {
  createFeatures(coordinates, radiusInMiles);
});


// Function to create a bounding box from 4 points
const createBoundingBox = (points) => {
  // Convert the points from Lon/Lat to map projection (EPSG:3857)
  const transformedPoints = points.map(point => fromLonLat(point));

  // Ensure the points create a closed loop (first and last points are the same)
  transformedPoints.push(transformedPoints[0]);

  // Create a polygon feature for the bounding box
  const boundingBoxFeature = new Feature({
    geometry: new Polygon([transformedPoints]),
  });

  // Style for the bounding box
  boundingBoxFeature.setStyle(new Style({
    stroke: new Stroke({
      color: 'red',
      width: 2,
    }),
    fill: new Fill({
      color: 'rgba(255, 0, 0, 0.1)',
    }),
  }));

  // Add the bounding box feature to the vector source
  vectorSource.addFeature(boundingBoxFeature);
};

// Example points defining the bounding box (in [Longitude, Latitude] format)
const boundingBoxPoints = [
  [-125.0, 32.0], // Bottom-left corner
  [-115.0, 32.0], // Bottom-right corner
  [-115.0, 42.0], // Top-right corner
  [-125.0, 42.0], // Top-left corner
];

// Create the bounding box on the map
createBoundingBox(boundingBoxPoints);

// Create the vector layer with the vector source
const vectorLayer = new VectorLayer({
  source: vectorSource,
});

// Determine the initial view center and zoom level (optional)
// Here, we set it to the first location's center
const initialViewCenter = fromLonLat(coordinatesList[0]);

// Create the map with the OSM layer and the vector layer
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    vectorLayer,
  ],
  view: new View({
    center: initialViewCenter,
    zoom: 4,  // Adjust zoom level to better fit all the circles
  }),
});
