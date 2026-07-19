import { useEffect } from "react";
import githubPhot from "../../assets/لقطة شاشة 2025-07-26 184056.png"; // استبدل 
import { jwtDecode } from "jwt-decode";


export default function SocialLogin() {
  useEffect(() => {
    // تحميل سكربت Google
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // دالة الكولباك عند تسجيل الدخول
    window.logincallback = (response) => {
      const idToken = response.credential;
      const userData = jwtDecode(idToken);
      // ممكن تستخدم userData.email، name، picture إلخ
    };

    // عند تحميل السكربت اعرض الزر
    script.onload = () => {
      if (window.google && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id:
            "856950354640-6hl37gk49cvrbh51gn9nruup1eh4sl24.apps.googleusercontent.com",
          callback: window.logincallback,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          {
            theme: "filled_black",
            size: "large",
            shape: "circle",
            type: "icon",
          }
        );

        // لو حابب يظهر الـ prompt تلقائيًا
        window.google.accounts.id.prompt();
      }
    };

    // تنظيف عند إلغاء تحميل الكمبوننت
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="mt-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-1/2 mx-auto border-t border-gray-400" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-700 text-xl">or</span>
        </div>
      </div>

      <div className="mt-3 flex gap-4 justify-center items-center">
        {/* زر تسجيل الدخول عبر Google */}
        <div id="google-signin-btn"></div>

        {/* زر GitHub لتوسيع المنصة مستقبلاً */}
        {/*
<button className="w-10 h-10">
<img src={githubPhot} alt="GitHub Login" className="w-full h-full" />
</button>
       */
        }
      </div>
    </div>
  );
}
