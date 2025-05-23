import React, { useEffect, useState } from "react";
import MapComponent from "../components/MapComponent";
import { MapWrapper } from "../components/MapWrapper";
const map = ({ setMarkerPosition, customStyles }) => {
    const [marker, setMarker] = useState(null);
    const handleMapClick = (position) => {
        setMarker(position);
        setMarkerPosition(position);
    };
    return (
        <div>
            <MapWrapper>
                <MapComponent
                    markerPosition={marker}
                    onMapClick={handleMapClick}
                    customStyles={customStyles}
                />
            </MapWrapper>
        </div>
    );
};

export default map;
