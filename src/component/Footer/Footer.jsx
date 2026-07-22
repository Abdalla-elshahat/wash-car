import React from "react";
import { Link } from "react-router-dom";
import {
  Car,
  Phone,
  Mail,
  MapPin,
  Clock,
  BookOpen,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">

          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30">
                <Car size={26} />
              </div>
              <div>
                <span className="font-extrabold text-2xl text-white tracking-wide">
                  Wash<span className="text-indigo-400">Car</span>
                </span>
                <span className="block text-[11px] text-slate-400 font-semibold tracking-wider uppercase">
                  واش كار لخدمات السيارات
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              منصتك الأولى لحجز وتنسيق خدمات غسيل ورعاية السيارات مع أفضل المغاسل المعتمدة بأعلى معايير الجودة والأمان.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition duration-200"
                title="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white transition duration-200"
                title="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition duration-200"
                title="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition duration-200"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://wa.me/201000000000"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition duration-200"
                title="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-400" />
              روابط سريعة
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition flex items-center gap-1.5">
                  <ChevronRight size={14} className="text-indigo-500" />
                  الصفحة الرئيسية
                </Link>
              </li>
              {localStorage.getItem("userRole") === "Admin" && (
                <li>
                  <Link to="/clients" className="hover:text-indigo-400 transition flex items-center gap-1.5">
                    <ChevronRight size={14} className="text-indigo-500" />
                    قائمة المغاسل والعملاء
                  </Link>
                </li>
              )}
              {localStorage.getItem("userRole") === "laundry_owner" && (
                <li>
                  <Link to="/orders" className="hover:text-indigo-400 transition flex items-center gap-1.5">
                    <ChevronRight size={14} className="text-indigo-500" />
                    الطلبات والحجوزات
                  </Link>
                </li>
              )}
              {localStorage.getItem("userRole") === "laundry_owner" && (
                <li>
                  <Link to="/laundries/owner" className="hover:text-indigo-400 transition flex items-center gap-1.5">
                    <ChevronRight size={14} className="text-indigo-500" />
                    مغاسلي (لأصحاب المغاسل)
                  </Link>
                </li>
              )}
              <li>
                <Link to="/profile" className="hover:text-indigo-400 transition flex items-center gap-1.5">
                  <ChevronRight size={14} className="text-indigo-500" />
                  الملف الشخصي
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Guidelines & Help Page */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-400" />
              دليل الإرشادات والتعليمات
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              تعرّف على كيفية استخدام المنصة، شروط التوثيق لأصحاب المغاسل، خطوات طلب الخدمة للعملاء، والأسئلة الشائعة.
            </p>
            <Link
              to="/instructions"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition transform hover:-translate-y-0.5"
            >
              <BookOpen size={16} />
              صفحة الإرشادات الشاملة
            </Link>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <Phone size={18} className="text-indigo-400" />
              تواصل معنا
            </h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="dir-ltr text-right">
                  <p className="font-semibold text-slate-200">+20 100 123 4567</p>
                  <p className="text-xs text-slate-400">+20 122 987 6543</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-indigo-400 flex-shrink-0" />
                <a href="mailto:support@washcar.com" className="hover:text-indigo-400 transition text-xs font-medium">
                  support@washcar.com
                </a>
              </li>
              {/* <li className="flex items-start gap-3 text-xs">
                <MapPin size={18} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>مصر - القاهرة / المنصورة، جمهورية مصر العربية</span>
              </li> */}
              <li className="flex items-center gap-3 text-xs">
                <Clock size={18} className="text-indigo-400 flex-shrink-0" />
                <span>دعم فني متواصل 24 ساعة / 7 أيام</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} WashCar (واش كار). جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-6">
            <Link to="/instructions" className="hover:text-slate-200 transition">
              سياسة الخصوصية
            </Link>
            <span>&bull;</span>
            <Link to="/instructions" className="hover:text-slate-200 transition">
              الشروط والأحكام
            </Link>
            <span>&bull;</span>
            <Link to="/instructions" className="hover:text-slate-200 transition flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-400" />
              معايير الأمان
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
