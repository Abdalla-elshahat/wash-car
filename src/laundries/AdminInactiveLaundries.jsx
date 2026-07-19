import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Store,
  ExternalLink,
  ShieldCheck,
  Check,
} from "lucide-react";
import Navbar from "../component/Navbar/Navbar";
import { getInactiveLaundries, updateLaundryStatus } from "../apicalls/laundry";
import { Domain } from "../utels/const";
import { toast } from "react-toastify";

export default function AdminInactiveLaundries() {
  const [laundries, setLaundries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getInactiveLaundries();
        setLaundries(data);
      } catch (err) {
        setError(err.message || "Failed to load inactive laundries.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleActivate = async (id, name) => {
    try {
      setActionId(id);
      await updateLaundryStatus(id, "approved");
      toast.success(`"${name}" is now Active!`);
      // Remove from the inactive list
      setLaundries((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      toast.error(err.message || "Failed to activate laundry.");
    } finally {
      setActionId(null);
    }
  };

  const getLogoUrl = (logo) => {
    if (!logo) return null;
    if (logo.startsWith("http")) return logo;
    return `${Domain}/uploads/laundries/${logo}`;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-10 px-6 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2.5">
                <ShieldCheck className="text-red-500" size={32} />
                <span>Admin Panel: Inactive Laundries</span>
              </h1>
              <p className="text-gray-500 mt-1.5">
                Review and activate pending/inactive wash centers to display them on the homepage.
              </p>
            </div>
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-100 font-semibold text-sm flex items-center gap-2">
              <Store size={16} />
              <span>{laundries.length} Inactive Center{laundries.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Loader or Error */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={44} className="text-red-500 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Fetching inactive list...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 text-center max-w-md mx-auto my-12">
              <p className="font-semibold mb-2">Error Occurred</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : laundries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center max-w-lg mx-auto shadow-sm">
              <CheckCircle className="mx-auto text-emerald-400 mb-4" size={56} />
              <h3 className="text-lg font-bold text-gray-800">All Laundries Active</h3>
              <p className="text-gray-500 text-sm mt-1">Excellent! No inactive or pending car washes found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {laundries.map((laundry) => {
                const logoUrl = getLogoUrl(laundry.logo);
                return (
                  <div
                    key={laundry._id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col group"
                  >
                    {/* Header */}
                    <div className="p-6 pb-0 flex items-start gap-4 justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gray-150 flex items-center justify-center border border-gray-250 flex-shrink-0">
                          {logoUrl ? (
                            <img src={logoUrl} alt={laundry.name} className="h-full w-full object-cover rounded-xl" />
                          ) : (
                            <Store className="text-gray-400" size={22} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 truncate max-w-[160px]">{laundry.name}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={10}
                                  className={s <= Math.round(laundry.rating || 0) ? "fill-amber-400" : "text-gray-200"}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-gray-500">({laundry.totalReviews || 0})</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        {laundry.status || "pending"}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-6 flex-grow">
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
                        {laundry.description || "No description provided."}
                      </p>
                      
                      <div className="space-y-2 mt-4 text-xs text-gray-500 border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate">{laundry.address || "No address"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400 flex-shrink-0" />
                          <span>{laundry.phone || "No phone"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400 flex-shrink-0" />
                          <span>
                            {laundry.workingHours?.from || "09:00"} - {laundry.workingHours?.to || "22:00"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4 mt-auto">
                      <Link
                        to={`/laundries/${laundry._id}`}
                        className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-gray-800 transition duration-150"
                      >
                        <span>Preview Details</span>
                        <ExternalLink size={12} />
                      </Link>

                      <button
                        onClick={() => handleActivate(laundry._id, laundry.name)}
                        disabled={actionId === laundry._id}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm hover:shadow transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionId === laundry._id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Check size={13} />
                        )}
                        <span>Activate</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
