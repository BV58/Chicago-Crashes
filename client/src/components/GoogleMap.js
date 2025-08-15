"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";

export default function GoogleMap({ lat, lng, height = "300px" }) {
  const position = { lat: parseFloat(lat), lng: parseFloat(lng) };

  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <div style={{ height, width: "100%" }}>
        <Map
          zoom={14}
          defaultCenter={position}
          mapId={process.env.REACT_APP_GOOGLE_MAP_ID}
        >
          <AdvancedMarker position={position}></AdvancedMarker>
        </Map>
      </div>
    </APIProvider>
  );
}
