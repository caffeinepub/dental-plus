import { Toaster } from "@/components/ui/sonner";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Clock,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Shield,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "./hooks/useActor";

// ─── Types ───────────────────────────────────────────────────────────────────
type FormStatus = "idle" | "loading" | "success" | "error";

interface ReservationForm {
  name: string;
  phone: string;
  service: string;
  message: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: Smile,
    title: "Limpieza Dental",
    desc: "Eliminamos sarro y placa bacteriana dejando tus dientes brillantes y saludables.",
    color: "teal",
  },
  {
    icon: Sparkles,
    title: "Blanqueamiento",
    desc: "Blanqueamiento profesional hasta 8 tonos más blanco. Resultados visibles desde la primera sesión.",
    color: "gold",
  },
  {
    icon: Activity,
    title: "Ortodoncia",
    desc: "Brackets metálicos y estéticos para corregir la posición de tus dientes. Sonrisa perfecta garantizada.",
    color: "teal",
  },
  {
    icon: Shield,
    title: "Implantes Dentales",
    desc: "Reemplazamos dientes perdidos con implantes de titanio de alta durabilidad y aspecto natural.",
    color: "gold",
  },
  {
    icon: Stethoscope,
    title: "Endodoncia (Conductos)",
    desc: "Tratamiento de canales con tecnología moderna. Salvamos tu diente sin dolor.",
    color: "teal",
  },
  {
    icon: Zap,
    title: "Emergencias 24h",
    desc: "Atendemos urgencias dentales las 24 horas, todos los días. ¡No esperes más para aliviar tu dolor!",
    color: "urgent",
  },
];

const TESTIMONIALS = [
  {
    name: "María G.",
    role: "Paciente desde 2022",
    text: "Excelente atención, muy profesionales y amables. ¡Mi sonrisa nunca se vio mejor! El personal es increíblemente atento y el consultorio está súper limpio.",
    stars: 5,
    service: "Blanqueamiento Dental",
  },
  {
    name: "Carlos R.",
    role: "Paciente frecuente",
    text: "Me atendieron a las 2am por una emergencia dental. Increíble servicio las 24 horas. El doctor fue muy profesional y alivió mi dolor inmediatamente.",
    stars: 5,
    service: "Emergencia 24h",
  },
  {
    name: "Ana P.",
    role: "Paciente desde 2023",
    text: "El blanqueamiento quedó perfecto, exactamente como lo esperaba. 100% recomendado para quien quiera mejorar su sonrisa. ¡Los resultados son espectaculares!",
    stars: 5,
    service: "Blanqueamiento",
  },
  {
    name: "Luis M.",
    role: "Paciente familiar",
    text: "Precios accesibles y calidad de primer nivel. Ya toda mi familia viene aquí. Los niños también se sienten cómodos porque el equipo es muy paciente y amable.",
    stars: 5,
    service: "Limpieza & Ortodoncia",
  },
];

const SERVICE_OPTIONS = [
  "Limpieza Dental",
  "Blanqueamiento",
  "Ortodoncia",
  "Implantes Dentales",
  "Endodoncia (Conductos)",
  "Emergencias 24h",
  "Consulta General",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STAR_POSITIONS = ["1st", "2nd", "3rd", "4th", "5th"] as const;

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {STAR_POSITIONS.slice(0, count).map((pos) => (
        <Star key={pos} className="w-4 h-4 fill-current star-filled" />
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { actor } = useActor();
  const [slots, setSlots] = useState<number | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Form state
  const [form, setForm] = useState<ReservationForm>({
    name: "",
    phone: "",
    service: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formError, setFormError] = useState("");

  // Fetch available slots when actor is ready
  useEffect(() => {
    if (!actor) return;
    const fetchSlots = async () => {
      try {
        const s = await actor.getAvailableSlots();
        setSlots(Number(s));
      } catch {
        setSlots(15);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [actor]);

  // Sticky nav scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.service) {
      setFormError("Por favor completa todos los campos obligatorios.");
      return;
    }
    if (!actor) {
      setFormError("La conexión no está lista. Por favor recarga la página.");
      return;
    }
    setFormError("");
    setFormStatus("loading");
    try {
      await actor.makeReservation(
        form.name.trim(),
        form.phone.trim(),
        form.service,
        form.message.trim(),
      );
      // Refresh slots
      const s = await actor.getAvailableSlots();
      setSlots(Number(s));
      setFormStatus("success");
      setForm({ name: "", phone: "", service: "", message: "" });
      toast.success("¡Reserva enviada! Te contactaremos pronto.");
    } catch {
      setFormStatus("error");
      setFormError(
        "Ocurrió un error al enviar la reserva. Inténtalo de nuevo.",
      );
      toast.error("Error al procesar la reserva.");
    }
  };

  const isUrgent = slots !== null && slots <= 3;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Toaster richColors position="top-right" />

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a href="#inicio" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-brand-teal flex items-center justify-center overflow-hidden shadow-teal">
                <img
                  src="/assets/generated/dental-logo-transparent.dim_200x200.png"
                  alt="Dental Plus logo"
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div>
                <span
                  className={`font-display font-bold text-lg leading-none block transition-colors ${
                    scrolled ? "text-brand-teal" : "text-white"
                  }`}
                >
                  DENTAL PLUS
                </span>
                <span
                  className={`text-xs font-medium tracking-wide transition-colors ${
                    scrolled ? "text-muted-foreground" : "text-white/70"
                  }`}
                >
                  San Martín de Porres
                </span>
              </div>
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {["Inicio", "Servicios", "Testimonios", "Reservar"].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className={`text-sm font-medium transition-colors hover:text-brand-teal ${
                      scrolled
                        ? "text-foreground"
                        : "text-white/90 hover:text-white"
                    }`}
                    data-ocid="nav.link"
                  >
                    {item}
                  </a>
                ),
              )}
              <button
                type="button"
                onClick={scrollToForm}
                className="btn-primary text-sm"
                data-ocid="nav.primary_button"
              >
                Reservar Ahora
              </button>
            </nav>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setNavOpen(!navOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled
                  ? "text-foreground hover:bg-muted"
                  : "text-white hover:bg-white/10"
              }`}
              aria-label="Menú"
            >
              {navOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <div className="flex flex-col gap-1.5 w-5">
                  <span className="block h-0.5 bg-current rounded" />
                  <span className="block h-0.5 bg-current rounded" />
                  <span className="block h-0.5 bg-current rounded" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {navOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-border shadow-lg"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
                {["Inicio", "Servicios", "Testimonios", "Reservar"].map(
                  (item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      onClick={() => setNavOpen(false)}
                      className="text-foreground font-medium py-2 hover:text-brand-teal transition-colors"
                    >
                      {item}
                    </a>
                  ),
                )}
                <button
                  type="button"
                  onClick={() => {
                    setNavOpen(false);
                    scrollToForm();
                  }}
                  className="btn-primary text-sm mt-2 text-center"
                  data-ocid="nav.primary_button"
                >
                  Reservar Ahora
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        id="inicio"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/assets/generated/dental-hero.dim_1200x600.jpg"
            alt="Dental Plus clínica"
            className="w-full h-full object-cover object-center"
          />
          <div className="hero-overlay absolute inset-0" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 right-8 w-64 h-64 rounded-full border border-white/10 opacity-40" />
        <div className="absolute bottom-1/4 left-8 w-40 h-40 rounded-full border border-white/10 opacity-30" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* Urgency badge */}
            <div className="flex justify-center mb-6">
              <div
                data-ocid="hero.panel"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg border-2 ${
                  isUrgent
                    ? "bg-brand-urgent text-white border-white/30 animate-pulse-urgent"
                    : "bg-brand-gold text-amber-900 border-amber-300/40"
                }`}
              >
                {loadingSlots ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando disponibilidad...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      ¡Solo <strong>{slots}</strong> cupos disponibles!
                    </span>
                  </>
                )}
              </div>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-6 text-balance">
              Tu Sonrisa,{" "}
              <span className="text-brand-gold italic">Nuestra Pasión</span>
            </h1>

            <p className="text-white/85 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Clínica dental de confianza en San Martín de Porres. Atendemos{" "}
              <strong className="text-white">las 24 horas</strong>, los 7 días
              de la semana. Especialistas en sonrisas perfectas con tecnología
              de vanguardia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={scrollToForm}
                className="btn-gold text-base px-8 py-4 shadow-gold"
                data-ocid="hero.primary_button"
              >
                Reservar Mi Cita Ahora
              </button>
              <a
                href="tel:+51954857715"
                className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white font-semibold rounded-full px-8 py-4 transition-all duration-200 border border-white/25"
                data-ocid="contact.link"
              >
                <Phone className="w-4 h-4" />
                +51 954 857 715
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-14 flex flex-wrap justify-center gap-6 text-white/75 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-gold" />
                <span>Más de 2,000 pacientes satisfechos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-gold" />
                <span>Atención 24/7 sin excepción</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-gold" />
                <span>Tecnología de última generación</span>
              </div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
            className="mt-16 flex justify-center"
          >
            <a
              href="#servicios"
              className="text-white/50 hover:text-white/80 transition-colors"
            >
              <ChevronDown className="w-7 h-7" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────────────── */}
      <section id="servicios" className="py-20 bg-background section-pattern">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="text-sm font-semibold text-brand-teal tracking-widest uppercase mb-3 block">
              Nuestros Tratamientos
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Servicios <span className="text-brand-teal italic">Dentales</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Ofrecemos una amplia gama de tratamientos con los más altos
              estándares de calidad y tecnología moderna.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((svc, i) => {
              const Icon = svc.icon;
              const isGold = svc.color === "gold";
              const isUrgentSvc = svc.color === "urgent";
              return (
                <motion.div
                  key={svc.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={`card-hover group bg-card rounded-2xl p-7 shadow-xs border border-border relative overflow-hidden cursor-pointer ${
                    isUrgentSvc ? "border-l-4 border-l-destructive" : ""
                  }`}
                >
                  {isUrgentSvc && (
                    <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                      24h
                    </div>
                  )}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                      isUrgentSvc
                        ? "bg-destructive/10"
                        : isGold
                          ? "bg-accent/20"
                          : "bg-secondary"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        isUrgentSvc
                          ? "text-destructive"
                          : isGold
                            ? "text-accent-foreground"
                            : "text-brand-teal"
                      }`}
                    />
                  </div>
                  <h3 className="font-display font-semibold text-xl text-card-foreground mb-2 group-hover:text-brand-teal transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {svc.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GALLERY ──────────────────────────────────────────────────────── */}
      <section className="py-20 gradient-section">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="text-sm font-semibold text-brand-gold tracking-widest uppercase mb-3 block">
              Nuestra Clínica
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Instalaciones de{" "}
              <span className="text-brand-gold italic">Alto Nivel</span>
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Equipos modernos y ambientes diseñados para tu comodidad y
              seguridad.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main featured image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:row-span-2 rounded-2xl overflow-hidden shadow-xl"
            >
              <img
                src="/assets/generated/dental-clinic-interior.dim_800x500.jpg"
                alt="Interior de la clínica Dental Plus"
                className="w-full h-full object-cover min-h-[300px]"
                loading="lazy"
              />
            </motion.div>

            {/* Second image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-2xl overflow-hidden shadow-xl"
            >
              <img
                src="/assets/generated/dental-smile.dim_600x400.jpg"
                alt="Sonrisa perfecta con Dental Plus"
                className="w-full h-full object-cover min-h-[200px]"
                loading="lazy"
              />
            </motion.div>

            {/* Stats card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-8 flex items-center"
            >
              <div className="grid grid-cols-2 gap-6 w-full">
                {[
                  { num: "2,000+", label: "Pacientes Satisfechos" },
                  { num: "24h", label: "Disponibilidad" },
                  { num: "10+", label: "Años de Experiencia" },
                  { num: "5★", label: "Calificación Promedio" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="font-display text-3xl font-bold text-brand-gold">
                      {stat.num}
                    </div>
                    <div className="text-white/70 text-xs mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section id="testimonios" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="text-sm font-semibold text-brand-teal tracking-widest uppercase mb-3 block">
              Lo Que Dicen Nuestros Pacientes
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Testimonios <span className="text-brand-teal italic">Reales</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Miles de familias en San Martín de Porres confían en nosotros. Lee
              sus experiencias.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                data-ocid={`testimonials.item.${i + 1}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-7 shadow-xs card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <StarRating count={t.stars} />
                  <span className="text-xs font-semibold text-brand-teal bg-secondary px-3 py-1 rounded-full">
                    {t.service}
                  </span>
                </div>
                <p className="text-card-foreground leading-relaxed mb-5 text-sm">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-teal flex items-center justify-center text-white font-bold font-display">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground text-sm">
                      {t.name}
                    </p>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESERVATION FORM ──────────────────────────────────────────────── */}
      <section id="reservar" className="py-20 gradient-section" ref={formRef}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              {/* Urgency */}
              <div className="inline-flex items-center gap-2 bg-white/15 text-white font-semibold text-sm px-5 py-2.5 rounded-full border border-white/25 mb-6">
                <AlertCircle className="w-4 h-4" />
                ¡Cupos Limitados! — Reserva hoy mismo
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
                Reserva tu <span className="text-brand-gold italic">Cita</span>
              </h2>
              <p className="text-white/75 text-lg">
                Completa el formulario y te contactamos en menos de 1 hora para
                confirmar tu cita.
              </p>

              {/* Slots counter */}
              {!loadingSlots && slots !== null && (
                <div
                  className={`mt-5 inline-flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-full ${
                    isUrgent
                      ? "bg-brand-urgent text-white animate-pulse-urgent"
                      : "bg-brand-gold text-amber-900"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {isUrgent
                    ? `¡ÚLTIMOS ${slots} CUPOS DISPONIBLES!`
                    : `${slots} cupos disponibles esta semana`}
                </div>
              )}
            </motion.div>

            {/* Form card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10"
            >
              <AnimatePresence mode="wait">
                {formStatus === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    data-ocid="reservation.success_state"
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                      ¡Reserva Confirmada!
                    </h3>
                    <p className="text-muted-foreground text-base mb-6">
                      Hemos recibido tu solicitud. Te contactaremos pronto al
                      número proporcionado para confirmar tu cita.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormStatus("idle")}
                      className="btn-primary text-sm"
                    >
                      Hacer otra reserva
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="res-name"
                        className="block text-sm font-semibold text-foreground mb-1.5"
                      >
                        Nombre Completo{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="res-name"
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="Tu nombre completo"
                        autoComplete="name"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                        data-ocid="reservation.input"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="res-phone"
                        className="block text-sm font-semibold text-foreground mb-1.5"
                      >
                        Teléfono / WhatsApp{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="res-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, phone: e.target.value }))
                        }
                        placeholder="+51 9XX XXX XXX"
                        autoComplete="tel"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                        data-ocid="reservation.phone.input"
                      />
                    </div>

                    {/* Service */}
                    <div>
                      <label
                        htmlFor="res-service"
                        className="block text-sm font-semibold text-foreground mb-1.5"
                      >
                        Servicio de Interés{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <select
                        id="res-service"
                        value={form.service}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, service: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm appearance-none cursor-pointer"
                        data-ocid="reservation.service.select"
                      >
                        <option value="">Selecciona un servicio...</option>
                        {SERVICE_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="res-message"
                        className="block text-sm font-semibold text-foreground mb-1.5"
                      >
                        Mensaje o Consulta{" "}
                        <span className="text-muted-foreground font-normal">
                          (opcional)
                        </span>
                      </label>
                      <textarea
                        id="res-message"
                        value={form.message}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, message: e.target.value }))
                        }
                        placeholder="Cuéntanos sobre tu consulta o cualquier detalle relevante..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm resize-none"
                        data-ocid="reservation.textarea"
                      />
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {(formError || formStatus === "error") && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          data-ocid="reservation.error_state"
                          className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/25 rounded-xl text-destructive text-sm"
                        >
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>
                            {formError ||
                              "Ocurrió un error. Por favor inténtalo de nuevo."}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={formStatus === "loading"}
                      className="w-full btn-gold text-base py-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      data-ocid="reservation.submit_button"
                    >
                      {formStatus === "loading" ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Enviando reserva...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Confirmar Reserva</span>
                        </>
                      )}
                    </button>

                    {/* Loading state indicator */}
                    {formStatus === "loading" && (
                      <div
                        data-ocid="reservation.loading_state"
                        className="text-center text-muted-foreground text-xs"
                      >
                        Procesando tu reserva...
                      </div>
                    )}

                    <p className="text-center text-xs text-muted-foreground">
                      Al enviar, aceptas que te contactemos por WhatsApp o
                      teléfono para confirmar tu cita.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="text-sm font-semibold text-brand-teal tracking-widest uppercase mb-3 block">
              Encuéntranos
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Visítanos o{" "}
              <span className="text-brand-teal italic">Llámanos</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Map placeholder */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl overflow-hidden border border-border shadow-xs min-h-[300px] bg-secondary flex flex-col items-center justify-center"
            >
              <iframe
                title="Dental Plus ubicación"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.6!2d-77.063!3d-12.018!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDAx!5e0!3m2!1ses!2spe!4v1"
                width="100%"
                height="100%"
                className="min-h-[300px]"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>

            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col gap-6 justify-center"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-brand-teal" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    Dirección
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Jr. Callao 474 / Av. Perú Cdra. 35
                    <br />
                    San Martín de Porres, Lima, Perú
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-brand-teal" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Teléfono</p>
                  <a
                    href="tel:+51954857715"
                    className="text-brand-teal font-semibold text-sm hover:text-brand-teal-mid transition-colors"
                    data-ocid="contact.link"
                  >
                    +51 954 857 715
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-brand-teal" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Horario</p>
                  <p className="text-muted-foreground text-sm">
                    Abierto las <strong>24 horas</strong> — 7 días a la semana
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Emergencias incluidas
                  </p>
                </div>
              </div>

              {/* WhatsApp button */}
              <a
                href="https://wa.me/51954857715?text=Hola%2C%20quisiera%20reservar%20una%20cita%20en%20Dental%20Plus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-[oklch(0.55_0.18_142)] hover:bg-[oklch(0.48_0.18_142)] text-white font-semibold rounded-xl px-6 py-4 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 w-full"
                data-ocid="contact.link"
              >
                <MessageCircle className="w-5 h-5" />
                Escribir por WhatsApp
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="gradient-section pt-14 pb-8 border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-10">
            {/* Brand */}
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold flex items-center justify-center overflow-hidden">
                  <img
                    src="/assets/generated/dental-logo-transparent.dim_200x200.png"
                    alt="Dental Plus"
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <span className="font-display text-xl font-bold text-white">
                  DENTAL PLUS
                </span>
              </div>
              <p className="text-white/60 text-sm max-w-xs">
                Tu clínica dental de confianza en San Martín de Porres. Sonrisas
                perfectas con tecnología de vanguardia.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <p className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">
                Navegación
              </p>
              <ul className="space-y-2">
                {["Inicio", "Servicios", "Testimonios", "Reservar"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href={`#${item.toLowerCase()}`}
                        className="text-white/60 hover:text-white text-sm transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Contact quick */}
            <div>
              <p className="font-semibold text-white mb-4 text-sm tracking-wide uppercase">
                Contacto
              </p>
              <div className="space-y-2 text-sm text-white/60">
                <p>+51 954 857 715</p>
                <p>San Martín de Porres, Lima</p>
                <p>Abierto 24 horas — Todos los días</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/45 text-xs">
            <p>
              © {new Date().getFullYear()} DENTAL PLUS. Todos los derechos
              reservados.
            </p>
            <p>
              Hecho con ❤️ usando{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/70 underline underline-offset-2 transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
