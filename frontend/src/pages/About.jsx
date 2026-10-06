import React from 'react'
import { assets } from '../assets/assets'

const WHY_CHOOSE = [
  {
    icon: '⚡',
    title: 'Efficient',
    subtitle: 'Streamlined Scheduling',
    desc: 'Book your specialist in under 60 seconds — no calls, no forms, no wait.',
    color: 'from-teal-400/20 to-cyan-400/10',
  },
  {
    icon: '🌐',
    title: 'Convenient',
    subtitle: 'Wide Network',
    desc: 'Access hundreds of verified specialists across every major medical field.',
    color: 'from-cyan-400/20 to-sky-400/10',
  },
  {
    icon: '✨',
    title: 'Personalised',
    subtitle: 'AI-Driven Care',
    desc: 'Our AI matches you with the right doctor based on your unique health profile.',
    color: 'from-emerald-400/20 to-teal-400/10',
  },
];

const About = () => {
  return (
    <div className="min-h-screen page-enter">

      {/* ── HERO SECTION ── */}
      <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
        <div className="hero-blob w-96 h-96 bg-teal-200/20 -top-24 -right-24" />
        <div className="hero-blob w-72 h-72 bg-cyan-200/15 bottom-0 -left-16" style={{ animationDelay: '3s' }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <div className="section-label mx-auto mb-4">💚 Our Story</div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
              About <span className="text-grad-primary">Mediversal</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-xl mx-auto mt-4 text-sm leading-relaxed">
              We believe quality healthcare should be accessible, compassionate, and seamless — 
              for every person, in every moment that matters.
            </p>
          </div>

          {/* Main about card */}
          <div className="wellness-card overflow-hidden md:flex">
            <div className="md:w-5/12 shrink-0">
              <img
                src={assets.about_image}
                alt="About Mediversal"
                className="w-full h-72 md:h-full object-cover"
              />
            </div>
            <div className="md:w-7/12 p-8 sm:p-10 flex flex-col justify-center gap-5">
              <div className="section-label">🏥 Who We Are</div>
              <p className="text-slate-700 leading-relaxed text-sm font-medium">
                Mediversal is your trusted partner in modern healthcare. We connect patients with
                board-certified specialists through a seamless, technology-forward platform —
                removing barriers and putting your wellbeing first.
              </p>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">
                From AI-powered report analysis to instant appointment booking, every feature
                is built with one goal: making exceptional care feel effortless.
              </p>

              {/* Vision */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-5 mt-2">
                <p className="text-teal-700 font-black text-sm mb-1.5">Our Vision</p>
                <p className="text-teal-600 text-xs font-medium leading-relaxed">
                  A world where geography, time, and complexity never stand between a patient and
                  the care they deserve — powered by empathy and intelligence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-label mx-auto mb-4">🌟 Our Advantage</div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
              Why Choose <span className="text-grad-primary">Us</span>
            </h2>
            <p className="text-slate-500 font-medium max-w-lg mx-auto mt-3 text-sm">
              We've reimagined every touchpoint of the healthcare experience — because you deserve more than average.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHY_CHOOSE.map(({ icon, title, subtitle, desc, color }) => (
              <div
                key={title}
                className={`wellness-card p-7 flex flex-col gap-4 group cursor-pointer`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} border border-teal-100/80
                                 flex items-center justify-center text-2xl
                                 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  {icon}
                </div>
                <div>
                  <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest mb-1">{subtitle}</p>
                  <h3 className="text-xl font-black text-slate-800 group-hover:text-teal-700 transition-colors">{title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium mt-2">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM STATS ── */}
      <section className="py-16 px-4 sm:px-6 mb-8">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-[2rem] p-10 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)' }}
          >
            <div className="hero-blob w-64 h-64 bg-white/10 -top-16 -left-16" />
            <div className="hero-blob w-48 h-48 bg-white/08 bottom-0 right-8" style={{ animationDelay: '2s' }} />
            <div className="relative z-10">
              <p className="text-white/70 font-semibold text-sm mb-6">Trusted by thousands across the country</p>
              <div className="flex flex-wrap justify-center gap-12">
                {[
                  { value: '100+', label: 'Verified Specialists' },
                  { value: '50k+', label: 'Patients Served'     },
                  { value: '4.9★', label: 'Patient Rating'      },
                  { value: '98%',  label: 'Satisfaction Rate'   },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-4xl font-black text-white">{value}</p>
                    <p className="text-white/60 text-[11px] font-semibold uppercase tracking-widest mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About;
