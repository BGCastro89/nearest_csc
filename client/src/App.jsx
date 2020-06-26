import React from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow
} from "@react-google-maps/api";

import mapStyles from "./mapStyle";

const mapContainerStyle = {
  height: "75vh",
  width: "98vw"
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

const white_telescope_url = "https://upload.wikimedia.org/wikipedia/commons/f/fe/Telescope_mark_white.svg"
const black_telescope_url = "https://upload.wikimedia.org/wikipedia/commons/d/d6/Telescope_mark.svg"

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
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
      setMarkers(() => {
        return [
          {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          }
        ];
      });
    },
    []
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
          <p> To find the nearest site, click the map to place a <img alt="" className="inline-img" src={white_telescope_url}/> and press the button! </p>
          <p>
            Spot Selected:{" "}
            {markers[0]
              ? Number(markers[0].lat.toFixed(4)).toString() +
                ", " +
                Number(markers[0].lng.toFixed(4)).toString()
              : null}
          </p>

          <button className="big-button"
            onClick={ markers[0] ? () =>
            getCSC(markers[0].lat,markers[0].lng) : null}
          > Find nearest CSC </button>

          <p>c.2020 Brian Castro</p>

        </div>

        <div className="col-right">
        { nearestSite.name ? (
          <div>
            <div> Site: {nearestSite.name} </div>
            <div> Distance: {nearestSite.dist_km} Km from spot</div>
            <img alt="" src={nearestSite.full_img}/>
          </div>
        ) :  
        <div>
          <div> {nearestSite.status_msg} </div>
        </div>
        }
        </div>
      </div>

      <div className="mapContainer">
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
              icon={{
                url: white_telescope_url,
                scaledSize: new window.google.maps.Size(35, 35)
              }}
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
                <div className="popup-text"> <img className="inline-img" alt="you found the secret message!" src={black_telescope_url}/> is {selectedSite.dist_km} Km from <a target="_blank" href={`http://www.cleardarksky.com/c/${selectedSite.id}key.html`}>{selectedSite.name}</a> </div>
                <img alt="" src={selectedSite.mini_img} />
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