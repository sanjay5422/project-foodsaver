import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '8px'
};

const defaultCenter = {
    lat: 20.5937, // Default center (e.g., center of India)
    lng: 78.9629
};

const MapComponent = ({ posts, onMarkerClick, selectedPostId }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
    });

    if (!isLoaded) return <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '8px' }}>Loading Map...</div>;

    // Calculate center based on posts if available
    const center = posts.length > 0 && posts[0].coordinates?.lat
        ? { lat: posts[0].coordinates.lat, lng: posts[0].coordinates.lng }
        : defaultCenter;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={posts.length > 0 ? 12 : 5}
            options={{
                disableDefaultUI: false,
                zoomControl: true,
            }}
        >
            {posts.map(post => {
                if (!post.coordinates?.lat || !post.coordinates?.lng) return null;

                return (
                    <Marker
                        key={post._id}
                        position={{ lat: post.coordinates.lat, lng: post.coordinates.lng }}
                        onClick={() => onMarkerClick(post)}
                        animation={selectedPostId === post._id ? window.google.maps.Animation.BOUNCE : null}
                        icon={selectedPostId === post._id ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'}
                    />
                );
            })}
        </GoogleMap>
    );
};

export default React.memo(MapComponent);
