import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { Domain } from "../utels/const";

// التحقق من كلمة المرور
function validatePassword(password) {
  const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}
// دالة التسجيل
export async function signup(e, name, password, email, setError, setLoading, Setemail, navigate) {
  e.preventDefault();
  setError("");

  if (!validatePassword(password)) {
    setError("Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.");
    return;
  }

  setLoading(true);
  try {
    const response = await fetch(
      `${Domain}/users/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullname: name, email, password }),
      }
    );

    setLoading(false);

    if (response.ok) {
      Setemail(email);
      toast.success("OTP has been sent to your email.", {
        icon: <FaCheckCircle color="green" />,
      });
      setTimeout(() => {
        navigate("/Verify");
      }, 1000);
    } else {
      const errorData = await response.json();
      toast.error(`Error during signup: ${errorData.message || "Unknown error"}`, {
        icon: <FaExclamationCircle color="red" />,
      });
    }
  } catch (error) {
    setLoading(false);
    setError("Error signing up. Please try again.");
  }
}

//تاكيد عمل الايميل 
export async function verify(e, email, setError, setLoading, otpCode, navigate, setOtpCode) {
  e.preventDefault();
  setError("");
  setLoading(true);
  const otpString = Array.isArray(otpCode) ? otpCode.join("") : otpCode; // تحويل المصفوفة إلى نص

  try {
    const response = await fetch(`${Domain}/users/verify-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          code: otpString,
        }),
      }
    );
    setLoading(false);
    if (response.ok) {
      toast.success("Email successfully verified", {
        icon: <FaCheckCircle color="green" />,
      });
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } else {
      const errorData = await response.json();
      if (typeof setOtpCode === "function") {
        setOtpCode(["", "", "", "", "", ""]);
        setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
      }
      toast.error(
        `Error during verification: ${errorData.message || "Unknown error"}`,
        { icon: <FaExclamationCircle color="red" /> }
      );
    }
  } catch (error) {
    setLoading(false);
    if (typeof setOtpCode === "function") {
      setOtpCode(["", "", "", "", "", ""]);
      setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
    }
    setError("Error verifying. Please try again.");
  }
}
// دالة التحقق من OTP عند نسيان كلمة المرور
export async function verifyForget(e, email, otpCode, setError, setLoading, navigate, setOtpCode) {
  e.preventDefault();
  setError("");
  setLoading(true);
  const otpString = Array.isArray(otpCode) ? otpCode.join("") : otpCode; // Convert array to string
  try {
    const response = await fetch(
      `${Domain}/users/verifyOtpForResetPassword`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      }
    );
    setLoading(false);

    if (response.ok) {
      toast.success("Email successfully verified", {
        icon: <FaCheckCircle color="green" />,
      });
      sessionStorage.setItem("resetOtp", otpString);
      setTimeout(() => {
        navigate("/changepass");
      }, 1000);
    } else {
      const errorData = await response.json();
      if (typeof setOtpCode === "function") {
        setOtpCode(["", "", "", "", "", ""]);
        setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
      }
      toast.error(`Error during verification: ${errorData.message || "Unknown error"}`, {
        icon: <FaExclamationCircle color="red" />,
      });
    }
  } catch (error) {
    setLoading(false);
    if (typeof setOtpCode === "function") {
      setOtpCode(["", "", "", "", "", ""]);
      setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
    }
    setError("Error verifying. Please try again.");
  }
}
// عند تسجيل الدخول دالة إعادة إرسال OTP
export async function resendOTPS(e, email, setError, setLoading, setOtpCode) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const response = await fetch(
      `${Domain}/users/Resend-otp-email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    setLoading(false);

    if (response.ok) {
      if (typeof setOtpCode === "function") {
        setOtpCode(["", "", "", "", "", ""]);
        setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
      }
      toast.success("OTP is resent successfully", {
        icon: <FaCheckCircle color="green" />,
      });
    } else {
      const errorData = await response.json();
      toast.error(`Error during verification: ${errorData.message || "Unknown error"}`, {
        icon: <FaExclamationCircle color="red" />,
      });
    }
  } catch (error) {
    setLoading(false);
    setError("Error verifying. Please try again.");
  }
}
// عند نسيان الباسورد الدخول دالة إعادة إرسال OTP
export async function ResendOTPF(e, email, setError, setLoading, setOtpCode) {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    const response = await fetch(`${Domain}/users/resendOtpForgetPassword`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      }
    );
    setLoading(false);
    if (response.ok) {
      if (typeof setOtpCode === "function") {
        setOtpCode(["", "", "", "", "", ""]);
        setTimeout(() => document.getElementById("otp-0")?.focus(), 100);
      }
      toast.success("Otp is resend successfully", {
        icon: <FaCheckCircle color="green" />,
      });
    } else {
      const errorData = await response.json();
      toast.error(
        `Error during verification: ${errorData.message || "Unknown error"}`,
        { icon: <FaExclamationCircle color="red" /> }
      );
    }
  } catch (error) {
    setLoading(false);
    setError("Error verifying. Please try again.");
  }
}
//تسجيل الدخول
export async function Login(e, password, email, setError, setLoading, Setemail, navigate) {
  e.preventDefault();
  setError("");

  if (!validatePassword(password)) {
    setError(
      "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character."
    );
    return;
  }
  setLoading(true);
  try {
    const response = await fetch(
      `${Domain}/users/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    setLoading(false);

    if (response.ok) {
      const res = await response.json();
      const data = res.data; // ✅ unwrap the nested data object
      Setemail(email);
      Cookies.set("token", data.token);
      Cookies.set("refreshToken", data.refreshToken);
      Cookies.set("userId", data.user.id);
      localStorage.setItem("userRole", data.user.role);
      toast.success("Logged in successfully", { icon: <FaCheckCircle color="green" /> });
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } else {
      const errorData = await response.json();
      // ✅ If email not verified, redirect to OTP page instead of showing error
      if (
        response.status === 401 &&
        errorData.message &&
        errorData.message.toLowerCase().includes("not verified")
      ) {
        Setemail(email);
        toast.info("Please verify your email first. Redirecting to OTP page...", {
          icon: <FaExclamationCircle color="orange" />,
        });
        setTimeout(() => {
          navigate("/Verify");
        }, 1500);
      } else {
        toast.error(`Error during login: ${errorData.message || "Unknown error"}`, {
          icon: <FaExclamationCircle color="red" />,
        });
      }
    }
  } catch (error) {
    setLoading(false);
    setError("Error logging in. Please try again.");
  } finally {
    setLoading(false);
  }
}

export async function ForgetPassword(e, email, setError, setLoading, Setemail, navigate) {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    const response = await fetch(
      `${Domain}/users/forgot-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    setLoading(false);
    if (response.ok) {
      Setemail(email)
      toast.success("OTP has been sent to your email.", {
        icon: <FaCheckCircle color="green" />,
      });

      setTimeout(() => {
        navigate("/Verifyforget"); // ✅ استخدام navigate بدلاً من Navigate()
      }, 1000);
    } else {
      const errorData = await response.json();
      toast.error(
        `Error during signup: ${errorData.message || "Unknown error"}`,
        { icon: <FaExclamationCircle color="red" /> }
      );
    }
  } catch (error) {
    setLoading(false);
    setError("Error signing up. Please try again.");
  }
}

export async function changePassword(e, oldpassword, confirmpassword, newpassword, email, setError, setLoading, navigate) {
  e.preventDefault();
  setError("");
  if (!validatePassword(newpassword)) {
    setError("Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.");
    return;
  }
  if (newpassword !== confirmpassword) {
    setError("Passwords do not match!");
    return;
  }
  setLoading(true);
  try {
    const response = await fetch(`${Domain}/users/change-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          newpass: newpassword,
          oldpass: oldpassword
        }),
      }
    );
    setLoading(false);
    if (response.ok) {
      toast.success("Your password is changed", {
        icon: <FaCheckCircle color="green" />,
      });
      setTimeout(() => navigate("/login"), 1000);
    } else {
      const errorData = await response.json();
      toast.error(`Error: ${errorData.message || "Unknown error"}`, {
        icon: <FaExclamationCircle color="red" />,
      });
    }
  } catch {
    setLoading(false);
    setError("Error signing up. Please try again.");
  }
}

//new
export async function resetpassword(e, otp, newPassword, setError, setLoading, navigate) {
  e.preventDefault();
  setError("");
  if (!validatePassword(newPassword)) {
    setError("Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.");
    return;
  }
  setLoading(true);
  try {
    const response = await fetch(`${Domain}/users/reset-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: otp,
          newPassword: newPassword
        }),
      }
    );
    setLoading(false);
    if (response.ok) {
      toast.success("Your password is changed", {
        icon: <FaCheckCircle color="green" />,
      });
      setTimeout(() => navigate("/login"), 1000);
    } else {
      const errorData = await response.json();
      toast.error(`Error: ${errorData.message || "Unknown error"}`, {
        icon: <FaExclamationCircle color="red" />,
      });
    }
  } catch {
    setLoading(false);
    setError("Error signing up. Please try again.");
  }
}

export async function Logout(e, setError, setLoading, navigate) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    Cookies.remove("token"); // احذف التوكن
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    setLoading(false);

    toast.success("Logged out successfully", {
      icon: <FaCheckCircle color="green" />,
    });
    setTimeout(() => {
      navigate("/login");
    }
      , 1000); // ✅ استخدم setTimeout لتأخير الانتقال
  } catch (error) {
    setLoading(false);
    setError("Error Logged out. Please try again.");
    toast.error(`Error: ${error.message || "Unknown error"}`, {
      icon: <FaExclamationCircle color="red" />,
    });
  }
}
