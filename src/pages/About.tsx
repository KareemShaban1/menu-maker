import { Link } from "react-router-dom";
import { ArrowRight, Languages, QrCode, Store, UtensilsCrossed } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { brand } from "@/lib/brand";

const About = () => {
  const { language } = useLanguage();
  const ar = language === "ar";

  const steps = ar
    ? [
        ["اختر تصميماً", "قوالب مأخوذة من قوائم حقيقية: بطاقة طعام، سبورة مقهى، قائمة نبيذ، أو ورقة أسعار."],
        ["اكتب قائمتك", "عدّل الاسم والوصف والسعر من المعاينة. أضف صفحات، عملة، ونصاً عربياً من اليمين لليسار."],
        ["انشر الرابط", "الضيف يفتح القائمة على الموبايل، يبدل اللغة، ويحمّل نسخة PDF."],
      ]
    : [
        ["Pick a design", "Templates drawn from real menus: a dining card, a café board, a wine list, or a price sheet."],
        ["Write the menu", "Edit names, descriptions, and prices from the preview. Add pages, a currency, and Arabic text that reads right to left."],
        ["Publish the link", "Guests open the menu on a phone, switch language, and download a PDF."],
      ];

  const audiences = ar
    ? [
        [UtensilsCrossed, "مطاعم", "أقسام المقبلات والأطباق والحلويات على أكثر من صفحة."],
        [Store, "مقاهٍ ومخابز وأسواق", "سبورة اليوم، بطاقة الحلويات، وبطاقات أسعار الرف."],
        [Languages, "عربي وإنجليزي", "كل قائمة يمكن أن تُقرأ بالاتجاه المناسب للغة الضيف."],
        [QrCode, "رابط واحد", "نفس العنوان يبقى على الطاولة. الحفظ يحدّث ما يراه الضيف."],
      ]
    : [
        [UtensilsCrossed, "Restaurants", "Appetizers, mains, and desserts laid out across more than one page."],
        [Store, "Cafés, bakeries, and markets", "A board for today, a pastry card, or shelf price tags."],
        [Languages, "Arabic and English", "Each menu can be read in the direction that matches the guest’s language."],
        [QrCode, "One link", "The same address stays on the table. Saving updates what the guest sees."],
      ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-20">
        <section className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-widest text-primary uppercase">
              {ar ? "من نحن" : "About"}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold text-foreground md:text-5xl">
              {ar ? "قوائم رقمية تشبه الورق الذي يضعه المطعم على الطاولة" : "Digital menus that look like the card on the table"}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {ar
                ? `${brand.name} للعالم كله: صاحب مطعم أو مقهى أو مخبز أو متجر. تختار شكلاً تعرفه، تكتب الأطباق بالعربية أو الإنجليزية، وتنشر رابطاً يفتحه الضيف من هاتفه.`
                : `${brand.name} is for restaurants, cafés, bakeries, and shops anywhere. You pick a layout you already know, write the dishes in Arabic or English, and publish a link guests open on their phone.`}
            </p>
          </div>
        </section>

        <section className="container mx-auto mt-16 grid max-w-5xl gap-6 px-4 md:grid-cols-3">
          {steps.map(([title, body], index) => (
            <article key={title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <p className="text-sm font-semibold text-primary">0{index + 1}</p>
              <h2 className="mt-3 font-display text-xl font-semibold text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </section>

        <section className="container mx-auto mt-16 max-w-5xl px-4">
          <h2 className="font-display text-3xl font-bold text-foreground text-center">
            {ar ? "لمن صُممت" : "Who it is for"}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {audiences.map(([Icon, title, body]) => (
              <article key={String(title)} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="container mx-auto mt-16 max-w-3xl px-4 text-center">
          <div className="rounded-3xl border border-border bg-card px-6 py-10 shadow-soft">
            <h2 className="font-display text-3xl font-bold text-foreground">
              {ar ? "ابدأ من قالب" : "Start from a template"}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              {ar
                ? "اختر نوع النشاط، عدّل النصوص، واحفظ. الرابط يصبح قائمة الضيوف."
                : "Choose a business type, edit the words, and save. The link becomes the guest menu."}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="hero" asChild>
                <Link to="/templates">
                  {ar ? "عرض القوالب" : "View templates"}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/pricing">{ar ? "الأسعار" : "Pricing"}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
