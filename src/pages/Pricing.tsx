import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS, type PlanId } from "@/lib/plans";

const Pricing = () => {
  const { language, t } = useLanguage();
  const ar = language === "ar";
  const { isAuthenticated } = useAuth();

  const planMeta: Record<
    PlanId,
    { detailEn: string; detailAr: string; ctaEn: string; ctaAr: string; highlighted: boolean }
  > = {
    free: {
      detailEn: "Publish one menu and put it in front of guests.",
      detailAr: "لمن يريد نشر قائمة واحدة وتجربتها مع الضيوف.",
      ctaEn: "Start free",
      ctaAr: "ابدأ مجاناً",
      highlighted: false,
    },
    restaurant: {
      detailEn: "For a venue that changes prices and sections every week.",
      detailAr: "للفرع الذي يحدّث أسعاره وقوائمه كل أسبوع.",
      ctaEn: "Choose this plan",
      ctaAr: "اختر هذه الخطة",
      highlighted: true,
    },
    business: {
      detailEn: "For a group of branches that should look like one brand.",
      detailAr: "لمجموعة فروع تريد نفس الهوية على كل قائمة.",
      ctaEn: "Choose Business",
      ctaAr: "اختر الأعمال",
      highlighted: false,
    },
  };

  const faqs = ar
    ? [
        ["هل أحتاج بطاقة للبدء؟", "لا. الخطة المجانية تفتح من القوالب مباشرة، بدون دفع."],
        ["هل القائمة تعمل على الموبايل؟", "نعم. صفحة الضيف مصممة للهاتف، والضيف يبدل بين العربي والإنجليزي من أعلى الصفحة."],
        ["هل أقدر أغيّر العملة؟", "نعم. من صفحة التصميم تختار الجنيه أو الدولار أو الريال وغيرها، وتظهر على كل الأسعار."],
        ["متى يتحدث السعر عند الضيف؟", "بمجرد حفظ القائمة. الرابط نفسه يعرض آخر نسخة محفوظة."],
        ["كيف أرقّي الاشتراك؟", "من صفحة الملف الشخصي اختر الخطة. حدود القوائم تُطبَّق فوراً."],
      ]
    : [
        ["Do I need a card to start?", "No. The free plan opens from the templates, with nothing to pay."],
        ["Does the menu work on a phone?", "Yes. The guest page is built for phones, and guests can switch between Arabic and English from the top bar."],
        ["Can I change the currency?", "Yes. In the builder you pick EGP, USD, SAR, and others, and every price uses that code."],
        ["When do guests see a new price?", "As soon as you save. The same link shows the latest saved menu."],
        ["How do I upgrade?", "Open your profile and pick a plan. Menu limits apply immediately."],
      ];

  const planHref = (planId: PlanId) => {
    if (!isAuthenticated) {
      return `/register?next=${encodeURIComponent(`/profile?plan=${planId}`)}`;
    }
    return `/profile?plan=${planId}#plans`;
  };

  return (
    <div className="min-h-screen bg-background paper-grain">
      <Header />
      <main className="pt-28 pb-20">
        <section className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="overline-label text-primary">
              {ar ? "الأسعار" : "Pricing"}
            </p>
            <h1 className="mt-3 font-display text-5xl md:text-6xl tracking-[0.04em] text-foreground">
              {ar ? "قائمة رقمية بسعر واضح" : "A digital menu with a clear price"}
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              {ar
                ? "ابدأ مجاناً بقائمة واحدة. رقِّ عندما تحتاج أكثر من فرع أو أكثر من تصميم."
                : "Start free with one menu. Move up when you need more branches or more designs."}
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
            {PLANS.map((plan) => {
              const meta = planMeta[plan.id];
              return (
                <article
                  key={plan.id}
                  className={`flex flex-col rounded-xl border-2 border-foreground p-6 shadow-offset ${
                    meta.highlighted ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
                  }`}
                >
                  {meta.highlighted && (
                    <span className="chip-retro !bg-accent !text-foreground self-start mb-3 !py-1 !px-3 !text-xs">
                      {ar ? "الأكثر اختياراً" : "Most popular"}
                    </span>
                  )}
                  <h2 className="font-display text-2xl tracking-[0.04em]">
                    {ar ? plan.nameAr : plan.nameEn}
                  </h2>
                  <p className={`mt-2 text-sm leading-relaxed ${meta.highlighted ? "text-primary-foreground/85" : "text-muted-foreground"}`}>
                    {ar ? meta.detailAr : meta.detailEn}
                  </p>
                  <p className="mt-6 font-display text-5xl tracking-[0.04em]">
                    {ar ? plan.priceAr : plan.priceEn}
                    <span className={`ms-2 text-sm font-bold uppercase tracking-[0.06em] ${meta.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {ar ? plan.periodAr : plan.periodEn}
                    </span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-3">
                    {(ar ? plan.featuresAr : plan.featuresEn).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${meta.highlighted ? "text-accent" : "text-primary"}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={meta.highlighted ? "outline" : "hero"}
                    className={`mt-8 ${meta.highlighted ? "bg-card text-foreground hover:bg-muted" : ""}`}
                    asChild
                  >
                    <Link to={planHref(plan.id)}>
                      {ar ? meta.ctaAr : meta.ctaEn}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Link>
                  </Button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto mt-20 max-w-3xl px-4">
          <h2 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-foreground text-center">
            {ar ? "أسئلة شائعة" : "Common questions"}
          </h2>
          <div className="mt-8 space-y-4">
            {faqs.map(([question, answer]) => (
              <div key={question} className="rounded-xl border-2 border-foreground bg-card p-5 shadow-offset">
                <h3 className="font-display text-xl tracking-[0.04em] text-foreground">{question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{answer}</p>
              </div>
            ))}
          </div>
          {!isAuthenticated && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              {t("auth.hasAccount")}{" "}
              <Link to="/login?next=/profile" className="text-primary font-bold uppercase tracking-[0.04em] hover:underline">
                {t("nav.signIn")}
              </Link>
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
