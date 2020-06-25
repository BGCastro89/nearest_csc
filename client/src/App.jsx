import React from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow
} from "@react-google-maps/api";

// import "@reach/combobox/styles.css";
import mapStyles from "./index.css";

// const libraries = ["places"];
const mapContainerStyle = {
  height: "100vh",
  width: "100vw"
};
const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true
};
//Approx Center of US (E. Kansas)
const center = {
  lat: 38.672,
  lng: -97.785
};

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    // libraries
  });
  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = React.useState(null);

  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(10);
  }, []);

  const onMapClick = React.useCallback(
    e => {
      // console.log(markers);
      setMarkers(current => {
        return [
          {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          }
        ];
      });
    },
    [markers]
  );

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback(
    map => {
      mapRef.current = map;
      Locate({ panTo });
    },
    [panTo]
  );

  if (loadError) return "Error";
  if (!isLoaded) return "Loading...";

  return (
    <div>
      <h1>
        Clear Dark Sky Finder{" "}
        <span role="img" aria-label="telescope">
          🔭
        </span>
      </h1>
      <p>
        Spot Selected:{" "}
        {markers[0]
          ? Number(markers[0].lat.toFixed(4)).toString() +
            ", " +
            Number(markers[0].lng.toFixed(4)).toString()
          : null}
      </p>

      <button onClick={ markers[0] ? () => 
        getCSC(markers[0].lat,markers[0].lng) : null}
      > Find nearest CSC
      </button>

      <GoogleMap
        id="map"
        mapContainerStyle={mapContainerStyle}
        zoom={4}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        {markers.map(marker => (
          <Marker
            key={`${marker.lat}-${marker.lng}`}
            position={{ lat: marker.lat, lng: marker.lng }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}

function Locate({ panTo }) {
  navigator.geolocation.getCurrentPosition(
    position => {
      panTo({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    },
    () => null
  );
}

function getCSC(lat, lng) {
  fetch(
    `https://us-central1-stargazr-ncc-2893.cloudfunctions.net/nearest_csc?lat=${lat}&lon=${lng}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      }
    }
  )
    .then(response => response.json())
    .then(json => {
      console.log(json)
    });
}
