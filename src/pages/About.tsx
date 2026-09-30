import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { resolveIcon } from "@/lib/iconMap";

const About = () => {
  const { language } = useLanguage();
  const { settings } = useSiteSettings();
  const copy = language === "ar" ? settings.about.ar : settings.about.en;
  const body = copy.body.replace(/\{brand\}/g, settings.brand.name);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-20">
        <section className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-widest text-primary uppercase">
              {copy.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold text-foreground md:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{body}</p>
          </div>
        </section>

        <section className="container mx-auto mt-16 grid max-w-5xl gap-6 px-4 md:grid-cols-3">
          {copy.steps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <p className="text-sm font-semibold text-primary">0{index + 1}</p>
              <h2 className="mt-3 font-display text-xl font-semibold text-foreground">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </article>
          ))}
        </section>

        <section className="container mx-auto mt-16 max-w-5xl px-4">
          <h2 className="font-display text-3xl font-bold text-foreground text-center">
            {copy.audiencesTitle}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {copy.audiences.map((item, index) => {
              const Icon = resolveIcon(settings.icons.aboutAudiences[index]);
              return (
                <article
                  key={item.title}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto mt-16 max-w-3xl px-4 text-center">
          <div className="rounded-3xl border border-border bg-card px-6 py-10 shadow-soft">
            <h2 className="font-display text-3xl font-bold text-foreground">{copy.ctaTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{copy.ctaBody}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="hero" asChild>
                <Link to="/templates">
                  {copy.ctaPrimary}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/pricing">{copy.ctaSecondary}</Link>
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
