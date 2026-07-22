import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  UserCheck,
  Store,
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
  FileText,
  Upload,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Phone,
  Mail,
  Car,
  Sparkles,
} from "lucide-react";

export default function Instructions() {
  const [activeTab, setActiveTab] = useState("customers");
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "كيف يمكنني طلب خدمة غسيل سيارة من المنصة؟",
      a: "يمكنك الدخول إلى قائمة المغاسل المتاحة، اختيار المغسلة الأقرب إليك، تحديد نوع سيارتك والخدمة المطلوبة، ثم تأكيد الطلب وسيقوم فريق المغسلة بتنفيذه في الوقت المحدد.",
    },
    {
      q: "ما هي المستندات المطلوبة لتفعيل حساب المغسلة للمالك؟",
      a: "يتطلب تفعيل المغسلة رفع 5 مستندات رسمية: البطاقة الضريبية، السجل التجاري، رخصة النشاط التجاري، وصورة بطاقة الرقم القومي (وجه وظهر). يتم مراجعتها وتوثيقها من قبل إدارة المنصة.",
    },
    {
      q: "ما هي صيغ وحجم الملفات المسموح برفعها للتوثيق؟",
      a: "يقبل النظام صيغ PDF، JPG، JPEG، و PNG بحجم لا يتجاوز 5 ميجابايت لكل مستند. يجب أن تكون المستندات واضحة وسارية المفعول.",
    },
    {
      q: "ماذا أفعل إذا تم رفض أحد المستندات المرفوعة للمغسلة؟",
      a: "سيظهر لك سبب الرفض المحدد من إدارة المنصة في نافذة التوثيق، ويمكنك الضغط على زر 'إعادة الرفع' لرفع نسخة جديدة ومصححة وسيتم مراجعتها مجدداً.",
    },
    {
      q: "كيف يمكن التواصل مع الدعم الفني في حال وجود استفسار؟",
      a: "يمكنك التواصل عبر أرقام الهاتف الموضحة في أسفل الصفحة أو عبر البريد الإلكتروني support@washcar.com طوال أيام الأسبوع.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dir-rtl pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/50 shadow-xl">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
            <Sparkles size={14} className="text-indigo-400" />
            مركز المساعدة والإرشادات
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            دليل التعليمات وإرشادات استخدام منصة <span className="text-indigo-400">واش كار</span>
          </h1>

          <p className="text-slate-300 max-w-2xl mx-auto text-sm leading-relaxed">
            كل ما تحتاج لمعرفته حول طريقة استخدام الخدمة للعملاء، شروط التوثيق لأصحاب المغاسل، ومعايير الأمان والجودة.
          </p>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition"
            >
              <ArrowRight size={14} />
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Navigation Tabs */}
        <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-200 flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setActiveTab("customers")}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === "customers"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <UserCheck size={18} />
            إرشادات العملاء
          </button>

          <button
            onClick={() => setActiveTab("owners")}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === "owners"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Store size={18} />
            إرشادات أصحاب المغاسل
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === "documents"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ShieldCheck size={18} />
            التوثيق والأمان
          </button>

          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === "faq"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <HelpCircle size={18} />
            الأسئلة الشائعة
          </button>
        </div>

        {/* Tab 1: Customer Guide */}
        {activeTab === "customers" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Car className="text-indigo-600" size={22} />
                دليل الخطوات لطلب خدمة غسيل سيارة
              </h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                خطوات بسيطة وسريعة لحجز أفضل خدمة غسيل وتلميع لسيارتك عبر المنصة:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center flex-shrink-0 text-sm">
                    1
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">اختيار المغسلة والخدمة</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      تصفح المغاسل المعتمدة القريبة منك، واطلع على تقييمات العملاء والخدمات المتاحة لكل نوع سيارة.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center flex-shrink-0 text-sm">
                    2
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">تحديد الموعد والتفاصيل</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      اختر الموعد المناسب لخدمتك وأضف أي ملاحظات خاصة بالسيارة قبل تأكيد الحجز.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center flex-shrink-0 text-sm">
                    3
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">متابعة حالة الطلب</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      يمكنك متابعة حالة الطلب مباشرة من قائمة "طلباتي" لمعرفة ما إذا كان الطلب قيد التنفيذ أو مكتمل.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex gap-4 items-start">
                  <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center flex-shrink-0 text-sm">
                    4
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">التقييم والملاحظات</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      بعد الانتهاء، يمكنك إضافة تقييمك للمغسلة ومشاركة تجربتك لمساعدة بقية المستخدمين.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Laundry Owners Guide */}
        {activeTab === "owners" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Store className="text-indigo-600" size={22} />
                دليل أصحاب المغاسل والتفعيل الرسمي
              </h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                انضم لشبكة مغاسل واش كار المعتمدة وقم بتوسيع قاعدة عملائك من خلال الخطوات التالية:
              </p>

              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                  <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl flex-shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">1. إضافة بيانات المغسلة</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      قم بإنشاء حسابك وإضافة اسم المغسلة والعنوان التفصيلي وأوقات العمل وأرقام التواصل.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                  <div className="p-3 bg-amber-100 text-amber-700 rounded-xl flex-shrink-0">
                    <Upload size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">2. رفع المستندات الرسمية الـ 5</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      لتفعيل المغسلة على المنصة، يتوجب رفع: البطاقة الضريبية، السجل التجاري، رخصة النشاط، وصورة بطاقة الرقم القومي وجه وظهر.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl flex-shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">3. توثيق ومراجعة الإدارة (Admin Review)</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      يقوم فريق الإدارة بمراجعة المستندات والتأكد من صحتها لتسريع قبول وتفعيل حساب مغسلتك في أقرب وقت.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Document Verification & Safety */}
        {activeTab === "documents" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" size={22} />
                شروط ومعايير التوثيق المعتمدة
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center">
                  <CheckCircle2 className="mx-auto text-emerald-600 mb-2" size={26} />
                  <h3 className="font-bold text-slate-900 text-sm mb-1">صيغ الملفات المقبولة</h3>
                  <p className="text-xs text-slate-600">PDF, JPG, JPEG, PNG</p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-center">
                  <FileText className="mx-auto text-indigo-600 mb-2" size={26} />
                  <h3 className="font-bold text-slate-900 text-sm mb-1">الحد الأقصى للحجم</h3>
                  <p className="text-xs text-slate-600">5 ميجابايت (5MB) لكل ملف</p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-center">
                  <AlertTriangle className="mx-auto text-amber-600 mb-2" size={26} />
                  <h3 className="font-bold text-slate-900 text-sm mb-1">وضوح المستندات</h3>
                  <p className="text-xs text-slate-600">يجب أن تكون النصوص والأرقام واضحة تماماً</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
                <p className="font-bold text-slate-800 text-sm">ملاحظة هامة بشأن الخصوصية:</p>
                <p>
                  جميع المستندات والأوراق الرسمية المرفوعة مشفرة ومحفوظة بأعلى درجات الأمان ولا يتم استخدامها إلا لغرض التحقق والتأكد من الهوية القانونية للمغسلة لضمان حقوق العميل والمالك.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: FAQ */}
        {activeTab === "faq" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <HelpCircle className="text-indigo-600" size={22} />
                الأسئلة الأكثر تكراراً (FAQ)
              </h2>
              <p className="text-sm text-slate-600">
                إجابات سريعة ومباشرة لأبرز الاستفسارات المتعلقة بالمنصة.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-5 text-right flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition text-sm sm:text-base"
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-extrabold flex items-center justify-center">
                          ؟
                        </span>
                        {faq.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp size={18} className="text-indigo-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contact Footer Banner */}
        <div className="mt-12 p-6 sm:p-8 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-right">
            <h3 className="font-bold text-lg">هل لديك استفسار آخر لم تجد إجابته؟</h3>
            <p className="text-xs text-indigo-200">فريق الدعم الفني جاهز لمساعدتك وإجابة جميع تساؤلاتك 24/7.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="mailto:support@washcar.com"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-950 font-bold text-xs rounded-xl hover:bg-indigo-50 transition shadow-sm"
            >
              <Mail size={16} />
              راسلنا إلكترونياً
            </a>
            <a
              href="tel:+201001234567"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-500 transition shadow-sm"
            >
              <Phone size={16} />
              اتصل بنا
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
