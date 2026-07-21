import { useEffect, useState, useRef } from "react";
import { MapPin, Search, Navigation, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function MapPicker({ initialLat, initialLng, onSelect, onClose }) {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const latVal = parseFloat(initialLat) || 30.0444; // Default to Cairo
  const lngVal = parseFloat(initialLng) || 31.2357;

  useEffect(() => {
    // 1. Load Leaflet CSS dynamically
    const linkId = "leaflet-css";
    let link = document.getElementById(linkId);
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // 2. Load Leaflet JS dynamically
    const scriptId = "leaflet-js";
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const checkLeafletLoaded = setInterval(() => {
      if (window.L) {
        clearInterval(checkLeafletLoaded);
        initializeMap();
      }
    }, 100);

    return () => {
      clearInterval(checkLeafletLoaded);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapContainerRef.current || mapRef.current) return;

    const L = window.L;

    // Fix default marker icon issues in Webpack/React
    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // Create map
    const map = L.map(mapContainerRef.current).setView([latVal, lngVal], 13);
    mapRef.current = map;

    // Add Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Add Draggable Marker
    const marker = L.marker([latVal, lngVal], { draggable: true }).addTo(map);
    markerRef.current = marker;

    // Handle Drag Events
    marker.on("dragend", () => {
      const position = marker.getLatLng();
      onSelect(position.lat.toFixed(6), position.lng.toFixed(6));
    });

    // Handle Click Events on Map
    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      onSelect(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
    });

    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const newLat = parseFloat(result.lat);
        const newLng = parseFloat(result.lon);

        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([newLat, newLng], 14);
          markerRef.current.setLatLng([newLat, newLng]);
          onSelect(newLat.toFixed(6), newLng.toFixed(6));
        }
      } else {
        toast.error("لم يتم العثور على هذا الموقع. يرجى تجربة اسم آخر.");
      }
    } catch (err) {
      console.error("Search failed:", err);
      toast.error("فشل في البحث عن الموقع.");
    } finally {
      setSearching(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("متصفحك لا يدعم تحديد الموقع الجغرافي.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([latitude, longitude], 15);
          markerRef.current.setLatLng([latitude, longitude]);
          onSelect(latitude.toFixed(6), longitude.toFixed(6));
          toast.success("تم تحديد موقعك الحالي بنجاح.");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("فشل في تحديد موقعك الحالي. يرجى التأكد من تفعيل الـ GPS.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div
      style={styles.backdrop}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MapPin className="text-indigo-600 animate-bounce" size={22} />
            <h3 style={styles.title}>اختر موقع المغسلة من الخريطة</h3>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="ابحث عن مدينة، شارع، أو منطقة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" style={styles.searchBtn} disabled={searching}>
            {searching ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Search size={16} />
            )}
            <span>بحث</span>
          </button>
        </form>

        {/* Map Area */}
        <div style={styles.mapWrapper}>
          <div ref={mapContainerRef} style={styles.mapContainer} />
          {loading && (
            <div style={styles.mapLoader}>
              <Loader2 className="animate-spin text-indigo-600" size={36} />
              <p style={{ marginTop: 12, fontWeight: 500, color: "#4f46e5" }}>جاري تحميل الخريطة...</p>
            </div>
          )}
          
          {/* Quick Action Buttons on Map */}
          {!loading && (
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              style={styles.gpsBtn}
              title="تحديد موقعي الحالي"
            >
              <Navigation size={18} />
              <span>موقعي الحالي</span>
            </button>
          )}
        </div>

        {/* Info & Footer */}
        <div style={styles.footer}>
          <div style={styles.coordDisplay}>
            <div>
              <span style={styles.coordLabel}>خط العرض (Lat):</span>{" "}
              <span style={styles.coordVal}>{latVal.toFixed(6)}</span>
            </div>
            <div>
              <span style={styles.coordLabel}>خط الطول (Lng):</span>{" "}
              <span style={styles.coordVal}>{lngVal.toFixed(6)}</span>
            </div>
          </div>
          <button onClick={onClose} style={styles.confirmBtn}>
            تأكيد الموقع
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "20px",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "680px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#0f172a",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s, color 0.2s",
  },
  searchForm: {
    display: "flex",
    gap: "8px",
    padding: "16px 24px",
    borderBottom: "1px solid #f1f5f9",
    backgroundColor: "#f8fafc",
  },
  searchInput: {
    flexGrow: 1,
    padding: "10px 16px",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s",
    textAlign: "right",
  },
  searchBtn: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "10px 20px",
    fontSize: "0.9rem",
    fontWeight: 650,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "background-color 0.2s",
  },
  mapWrapper: {
    position: "relative",
    height: "360px",
    width: "100%",
  },
  mapContainer: {
    height: "100%",
    width: "100%",
    zIndex: 1,
  },
  mapLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9,
  },
  gpsBtn: {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    backgroundColor: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: "14px",
    padding: "8px 14px",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#1e293b",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    zIndex: 999,
    transition: "transform 0.2s, background-color 0.2s",
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    flexWrap: "wrap",
    gap: "12px",
  },
  coordDisplay: {
    display: "flex",
    gap: "16px",
    fontSize: "0.85rem",
    color: "#475569",
  },
  coordLabel: {
    fontWeight: 500,
  },
  coordVal: {
    fontWeight: 700,
    fontFamily: "monospace",
    color: "#0f172a",
  },
  confirmBtn: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "10px 24px",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};
