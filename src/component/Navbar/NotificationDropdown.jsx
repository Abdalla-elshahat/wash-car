import React from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  Info,
  ShieldCheck,
  ShoppingBag,
  Store,
  AlertCircle,
  CheckCheck,
  Settings,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown({
  notifications,
  loading,
  activeTab,
  onTabChange,
  onMarkAsRead,
  onMarkAllAsRead,
  onOpenPreferences,
  onLoadMore,
  hasMore,
  onClose,
}) {
  const navigate = useNavigate();

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "منذ لحظات / Just now";
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة / ${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة / ${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getNotificationIcon = (title = "", type = "") => {
    const lower = (title + " " + type).toLowerCase();
    if (lower.includes("order") || lower.includes("placed")) {
      return <ShoppingBag className="w-5 h-5 text-indigo-500" />;
    }
    if (lower.includes("laundry") || lower.includes("application")) {
      return <Store className="w-5 h-5 text-emerald-500" />;
    }
    if (lower.includes("paid") || lower.includes("payment")) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
    if (lower.includes("approved")) {
      return <ShieldCheck className="w-5 h-5 text-teal-500" />;
    }
    if (lower.includes("rejected") || lower.includes("cancelled")) {
      return <AlertCircle className="w-5 h-5 text-rose-500" />;
    }
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  const handleItemClick = (item) => {
    const id = item._id || item.id;
    if (!item.isRead) {
      onMarkAsRead(id);
    }
    if (item.link) {
      onClose();
      navigate(item.link);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const tabs = [
    { id: "all", label: "الكل (All)" },
    { id: "order", label: "الطلبات" },
    { id: "payment", label: "المدفوعات" },
    { id: "laundry", label: "المغاسل" },
    { id: "system", label: "النظام" },
  ];

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-[420px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden transform transition-all duration-200 animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-750 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Notifications / الإشعارات</h3>
            {unreadCount > 0 && (
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/40 rounded-lg transition flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>قراءة الكل</span>
            </button>
          )}

          <button
            onClick={onOpenPreferences}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            title="Notification Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-3 py-2 bg-gray-50/60 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
              activeTab === t.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-750">
        {loading && notifications.length === 0 ? (
          <div className="py-10 text-center text-gray-400 dark:text-gray-500 text-sm flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin" /> Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-750 text-gray-400 dark:text-gray-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No notifications found</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">لا توجد إشعارات حالياً</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item._id || item.id}
              onClick={() => handleItemClick(item)}
              className={`p-4 transition-colors duration-150 cursor-pointer flex items-start gap-3 relative hover:bg-indigo-50/40 dark:hover:bg-gray-750 ${
                !item.isRead ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-700/60 shrink-0 shadow-sm">
                {getNotificationIcon(item.title, item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p
                    className={`text-xs font-bold truncate ${
                      !item.isRead ? "text-indigo-950 dark:text-indigo-300" : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {item.title}
                  </p>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {formatTimeAgo(item.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>
                {item.link && (
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    <span>عرض التفاصيل (View)</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>
              {!item.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 mt-1 shadow-sm animate-pulse" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer / Load More */}
      {hasMore && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition py-1 px-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "جاري التحميل..." : "تحميل المزيد (Load More)"}
          </button>
        </div>
      )}
    </div>
  );
}
