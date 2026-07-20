import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './component/Navbar/Navbar';
import { getAllLaundries } from './apicalls/laundry';
import { Domain } from './utels/const';
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
  ExternalLink
} from 'lucide-react';

function Home() {
  const [laundries, setLaundries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLaundries = async () => {
      try {
        setLoading(true);
        const res = await getAllLaundries(page, 9); // limit to 9 for a nice 3x3 grid

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
  }, [page]);

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
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pb-16">
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Store className="text-indigo-600" />
                <span>All Car Wash Laundries</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">Showing {laundries.length} of {total} registered wash centers</p>
            </div>
          </div>

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
            <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center max-w-lg mx-auto shadow-sm">
              <Store className="mx-auto text-gray-300 mb-4" size={56} />
              <h3 className="text-lg font-bold text-gray-800">No Laundries Found</h3>
              <p className="text-gray-500 text-sm mt-1">We couldn't find any registered laundries in our database.</p>
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
                      className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group hover:-translate-y-1"
                    >
                      {/* Card Header with Logo/Image & Status */}
                      <div className="p-6 pb-0 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                            {logoUrl ? (
                              <img src={logoUrl} alt={laundry.name} className="h-full w-full object-cover" />
                            ) : (
                              <Store className="text-indigo-600" size={26} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition duration-150 line-clamp-1">
                              {laundry.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={12}
                                    className={star <= Math.round(laundry.rating || 0) ? "fill-amber-400" : "text-gray-200"}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500 font-semibold">({laundry.totalReviews || 0})</span>
                            </div>
                          </div>
                        </div>

                        {/* Status tag */}
                        <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${laundry.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                          : 'bg-amber-50 text-amber-700 border border-amber-150'
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
                              {laundry.workingHours?.from || "09:00"} - {laundry.workingHours?.to || "22:00"}
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
    </>
  );
}

export default Home;
