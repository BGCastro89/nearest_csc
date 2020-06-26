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
  const [nearestSite, setNearestSite] = React.useState({});
  const [selectedSite, setSelectedSite] = React.useState({});

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

  const getCSC = (lat, lng) => {
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
        setNearestSite(json);
        setSelectedSite(json)
      });
  }

  return (
    <div>
      <div className="row-header">
        <div className="col-left">
          <h1>
            Clear Sky Chart Finder{" "}
          </h1>
          <p> Clear Sky Charts are weather forcasts designed for astronomy!  </p>
          <p> The charts are the work of by A. Danko, find out more at the <a href="http://www.cleardarksky.com/csk/">CSC website</a>.</p>
          <p> To find the nearest site, click the map to place a <span role="img" aria-label="telescope">🔭</span> and press the button! </p>
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
          > Find nearest CSC </button>

        </div>

        <div className="col-right">
            <div> Site: {nearestSite.name} </div>
            <div> Distance: {nearestSite.dist_km} Km from spot</div>
            <img src={nearestSite.full_img}/>
            {/* <span> {nearestSite.lon} </span>
            <span> {nearestSite.lat} </span>    */}
        </div>
      </div>

      <div>
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

          {selectedSite.lat ? (
            <InfoWindow
              position={{ lat: selectedSite.lat, lng: selectedSite.lon }}
              onCloseClick={() => {
                setSelectedSite({});
              }}
            >
              <div>
                <div className="popup-text" role="img" aria-label="telescope">🔭 is {selectedSite.dist_km} Km from {selectedSite.name} </div>
                <img src={selectedSite.mini_img} />
              </div>
            </InfoWindow>
          ) : null}
        </GoogleMap>
      </div>
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