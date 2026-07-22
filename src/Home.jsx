import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './component/Navbar/Navbar';
import { getAllLaundries } from './apicalls/laundry';
import { Domain, formatTime12H } from './utels/const';
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Store,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  Settings,
  User,
  ExternalLink,
  Filter,
  X,
  Search,
  Compass,
  RotateCcw
} from 'lucide-react';

function Home() {
  const [laundries, setLaundries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [locating, setLocating] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    phone: '',
    address: '',
    rating: '',
    lat: '',
    lng: '',
    maxDistance: 10, // Default 10km
    time: '',
  });
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    const fetchLaundries = async () => {
      try {
        setLoading(true);
        const res = await getAllLaundries(page, 9, activeFilters); // limit to 9 for a nice 3x3 grid

        // Match response structure
        const laundryList = res.data || [];
        setLaundries(laundryList);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      } catch (err) {
        setError('Failed to fetch laundries. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLaundries();
  }, [page, activeFilters]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    setActiveFilters({ ...filters });
  };

  const handleClearFilters = () => {
    const cleared = {
      name: '',
      phone: '',
      address: '',
      rating: '',
      lat: '',
      lng: '',
      maxDistance: 10,
      time: '',
    };
    setFilters(cleared);
    setPage(1);
    setActiveFilters(cleared);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("الجيولكيشن غير مدعوم في متصفحك الحالي.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFilters((prev) => ({
          ...prev,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      (error) => {
        console.error(error);
        alert("فشل تحديد الموقع. يرجى إدخال الإحداثيات يدويًا.");
        setLocating(false);
      }
    );
  };

  const handleSetCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setFilters((prev) => ({
      ...prev,
      time: `${hours}:${minutes}`,
    }));
  };

  const getLogoUrl = (logo) => {
    if (!logo) return null;
    if (logo.startsWith('http')) return logo;
    return `${Domain}/uploads/laundries/${logo}`;
  };

  const getOwnerAvatar = (owner) => {
    if (!owner || !owner.profileImage) return 'https://www.w3schools.com/howto/img_avatar.png';
    if (owner.profileImage.startsWith('http')) return owner.profileImage;
    return `${Domain}/uploads/users/${owner.profileImage}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 pb-16 transition-colors duration-200">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white py-12 px-6 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
                Premium Car Wash Dashboard
              </h1>
              <p className="text-lg text-indigo-100 max-w-xl">
                Browse our registered premium car washes, track your requests, and manage clients efficiently.
              </p>
            </div>
            {/* Quick Actions at the top */}
            {localStorage.getItem("userRole") === "Admin" ? (
              <div className="flex flex-wrap gap-4 justify-center md:justify-end" >
                <Link to="/clients" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl border border-white/10 backdrop-blur-sm transition duration-200 shadow-sm">
                  <Users size={18} />
                  <span>العملاء</span>
                </Link>
              </div>
            ) : localStorage.getItem("userRole") === "laundry_owner" ? (
              <div className="flex flex-wrap gap-4 justify-center md:justify-end" >
                <Link to="/orders" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl border border-white/10 backdrop-blur-sm transition duration-200 shadow-sm">
                  <FileText size={18} />
                  <span>الطلبات</span>
                </Link>
                <Link to="/laundries/owner" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl border border-white/10 backdrop-blur-sm transition duration-200 shadow-sm">
                  <Settings size={18} />
                  <span>خدمات</span>
                </Link>
              </div>
            ) : (
              null
            )}

          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 mt-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Store className="text-indigo-600 dark:text-indigo-400" />
                <span>All Car Wash Laundries</span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Showing {laundries.length} of {total} registered wash centers</p>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border transition duration-200 shadow-sm ${
                showFilters || Object.values(activeFilters).some(v => v !== undefined && v !== null && v !== '')
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <Filter size={16} className={showFilters ? 'fill-indigo-600 dark:fill-indigo-400' : ''} />
              <span>البحث والتصفية / Filters</span>
              {Object.entries(activeFilters).filter(([k, v]) => k !== 'maxDistance' && v !== undefined && v !== null && v !== '').length > 0 && (
                <span className="flex items-center justify-center bg-indigo-600 text-white rounded-full text-xs h-5 w-5 font-bold">
                  {Object.entries(activeFilters).filter(([k, v]) => k !== 'maxDistance' && v !== undefined && v !== null && v !== '').length}
                </span>
              )}
            </button>
          </div>

          {/* Collapsible Filter Panel */}
          {showFilters && (
            <form onSubmit={handleApplyFilters} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 mb-8 shadow-sm transition-all duration-300">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-150 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">البحث والتصفية / Search & Filter</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Name Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    الاسم / Name
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="ابحث باسم المغسلة..."
                      value={filters.name}
                      onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-255 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition outline-none"
                    />
                  </div>
                </div>

                {/* Phone Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    رقم الهاتف / Phone
                  </label>
                  <input
                    type="text"
                    placeholder="رقم الهاتف..."
                    value={filters.phone}
                    onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-255 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition outline-none"
                  />
                </div>

                {/* Address Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    العنوان / Address
                  </label>
                  <input
                    type="text"
                    placeholder="العنوان (مثلا: القاهرة)..."
                    value={filters.address}
                    onChange={(e) => setFilters({ ...filters, address: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-255 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition outline-none"
                  />
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    التقييم الأدنى / Minimum Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFilters({ ...filters, rating: filters.rating === star ? '' : star })}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold border flex items-center justify-center gap-1 transition ${
                          Number(filters.rating) >= star
                            ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold'
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <Star size={14} className={Number(filters.rating) >= star ? 'fill-amber-500 text-amber-500' : ''} />
                        <span>{star}+</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Map Location Coordinates */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      الموقع من الخريطة / Location (Coordinates)
                    </label>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={locating}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 flex items-center gap-1"
                    >
                      <Compass size={12} className={locating ? 'animate-spin' : ''} />
                      <span>{locating ? "جاري التحديد..." : "موقعي الحالي"}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude (خط العرض)"
                      value={filters.lat}
                      onChange={(e) => setFilters({ ...filters, lat: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-255 bg-gray-50/50 focus:bg-white text-xs outline-none transition"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitude (خط الطول)"
                      value={filters.lng}
                      onChange={(e) => setFilters({ ...filters, lng: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-255 bg-gray-50/50 focus:bg-white text-xs outline-none transition"
                    />
                  </div>
                  {filters.lat && filters.lng && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Distance (القطر):</span>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={filters.maxDistance}
                        onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
                        className="flex-1 accent-indigo-600 h-1 bg-gray-200 rounded-lg cursor-pointer"
                      />
                      <span className="text-xs font-bold text-indigo-700">{filters.maxDistance} km</span>
                    </div>
                  )}
                </div>

                {/* Working Hours Filter */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ساعات العمل / Working Hours
                    </label>
                    <button
                      type="button"
                      onClick={handleSetCurrentTime}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Clock size={12} />
                      <span>الوقت الحالي / Open Now</span>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={filters.time}
                      onChange={(e) => setFilters({ ...filters, time: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-gray-255 bg-gray-50/50 focus:bg-white text-sm outline-none transition"
                    />
                    {filters.time && (
                      <button
                        type="button"
                        onClick={() => setFilters({ ...filters, time: '' })}
                        className="px-3 bg-red-50 border border-red-150 text-red-600 hover:bg-red-100 transition rounded-xl"
                        title="إلغاء تصفية الوقت"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-150">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm flex items-center gap-2 transition"
                >
                  <RotateCcw size={14} />
                  <span>إعادة تعيين / Reset</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/10 flex items-center gap-2 transition"
                >
                  <Search size={14} />
                  <span>تطبيق الفلاتر / Apply Filters</span>
                </button>
              </div>
            </form>
          )}

          {/* Active Filter Tags */}
          {Object.entries(activeFilters).some(([k, v]) => k !== 'maxDistance' && v !== undefined && v !== null && v !== '') && (
            <div className="flex flex-wrap items-center gap-2 mb-6 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-4">
              <span className="text-xs font-bold text-indigo-800/60 uppercase tracking-wider">الفلاتر المطبقة / Active:</span>
              {activeFilters.name && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-150 text-indigo-700 rounded-full text-xs font-semibold shadow-sm">
                  <span>Name: "{activeFilters.name}"</span>
                  <button type="button" onClick={() => {
                    const updated = { ...filters, name: '' };
                    setFilters(updated);
                    setActiveFilters(updated);
                  }} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                </span>
              )}
              {activeFilters.phone && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-150 text-indigo-700 rounded-full text-xs font-semibold shadow-sm">
                  <span>Phone: {activeFilters.phone}</span>
                  <button type="button" onClick={() => {
                    const updated = { ...filters, phone: '' };
                    setFilters(updated);
                    setActiveFilters(updated);
                  }} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                </span>
              )}
              {activeFilters.address && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-150 text-indigo-700 rounded-full text-xs font-semibold shadow-sm">
                  <span>Address: "{activeFilters.address}"</span>
                  <button type="button" onClick={() => {
                    const updated = { ...filters, address: '' };
                    setFilters(updated);
                    setActiveFilters(updated);
                  }} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                </span>
              )}
              {activeFilters.rating && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-150 text-indigo-700 rounded-full text-xs font-semibold shadow-sm">
                  <span className="flex items-center gap-0.5">Rating: {activeFilters.rating} <Star size={10} className="fill-amber-500 text-amber-500" />+</span>
                  <button type="button" onClick={() => {
                    const updated = { ...filters, rating: '' };
                    setFilters(updated);
                    setActiveFilters(updated);
                  }} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                </span>
              )}
              {activeFilters.lat && activeFilters.lng && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-150 text-indigo-700 rounded-full text-xs font-semibold shadow-sm">
                  <span>Near: {activeFilters.lat}, {activeFilters.lng} ({activeFilters.maxDistance}km)</span>
                  <button type="button" onClick={() => {
                    const updated = { ...filters, lat: '', lng: '' };
                    setFilters(updated);
                    setActiveFilters(updated);
                  }} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                </span>
              )}
              {activeFilters.time && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-150 text-indigo-700 rounded-full text-xs font-semibold shadow-sm">
                  <span>Open At: {activeFilters.time}</span>
                  <button type="button" onClick={() => {
                    const updated = { ...filters, time: '' };
                    setFilters(updated);
                    setActiveFilters(updated);
                  }} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                </span>
              )}
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline ml-2 transition"
              >
                مسح الكل / Clear All
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-500 font-medium">Fetching active laundries...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 text-center max-w-md mx-auto my-12">
              <p className="font-semibold mb-2">Error Occurred</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : laundries.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-150 dark:border-slate-700 p-12 text-center max-w-lg mx-auto shadow-sm">
              <Store className="mx-auto text-gray-300 dark:text-slate-600 mb-4" size={56} />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">No Laundries Found</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">We couldn't find any registered laundries in our database.</p>
            </div>
          ) : (
            <>
              {/* Laundries Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {laundries.map((laundry) => {
                  const logoUrl = getLogoUrl(laundry.logo);
                  const owner = laundry.ownerId || {};

                  return (
                    <div
                      key={laundry._id}
                      className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-150 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group hover:-translate-y-1"
                    >
                      {/* Card Header with Logo/Image & Status */}
                      <div className="p-6 pb-0 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-slate-600">
                            {logoUrl ? (
                              <img src={logoUrl} alt={laundry.name} className="h-full w-full object-cover" />
                            ) : (
                              <Store className="text-indigo-600 dark:text-indigo-400" size={26} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition duration-150 line-clamp-1">
                              {laundry.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={12}
                                    className={star <= Math.round(laundry.rating || 0) ? "fill-amber-400" : "text-gray-200 dark:text-slate-600"}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold">({laundry.totalReviews || 0})</span>
                            </div>
                          </div>
                        </div>

                        {/* Status tag */}
                        <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${laundry.status === 'approved'
                          ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-150 dark:border-emerald-500/30'
                          : 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-150 dark:border-amber-500/30'
                        }`}>
                          {laundry.status || 'pending'}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="px-6 pt-4 flex-grow">
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {laundry.description || "No description provided by owner."}
                        </p>

                        {/* Attributes list */}
                        <div className="space-y-2 mt-4 text-xs text-gray-500 border-t border-gray-100 pt-4">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-indigo-500 flex-shrink-0" />
                            <span className="truncate">{laundry.address || "No address listed"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-indigo-500 flex-shrink-0" />
                            <span>{laundry.phone || "No phone listed"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-indigo-500 flex-shrink-0" />
                            <span>
                              {formatTime12H(laundry.workingHours?.from || "09:00")} - {formatTime12H(laundry.workingHours?.to || "22:00")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Owner Info & Action */}
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4 mt-6">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={getOwnerAvatar(owner)}
                            alt={owner.fullname || 'Owner'}
                            className="h-8 w-8 rounded-full border border-gray-200 object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400 font-medium">Owner</p>
                            <p className="text-xs font-bold text-gray-700 truncate">{owner.fullname || 'Unknown'}</p>
                          </div>
                        </div>

                        <Link
                          to={`/laundries/${laundry._id}`}
                          className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition duration-150"
                        >
                          <span>Details</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-12">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    className="p-2.5 rounded-xl border border-gray-250 bg-white text-gray-700 hover:bg-gray-50 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-semibold text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    className="p-2.5 rounded-xl border border-gray-250 bg-white text-gray-700 hover:bg-gray-50 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
  );
}

export default Home;
