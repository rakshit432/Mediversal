import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'

const Contact = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    toast.success('Message sent! We\'ll get back to you within 24 hours. 💚');
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="min-h-screen page-enter">

      {/* ── PAGE HEADER ── */}
      <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
        <div className="hero-blob w-96 h-96 bg-teal-200/15 -top-24 right-0" />
        <div className="hero-blob w-72 h-72 bg-cyan-200/10 bottom-0 -left-16" style={{ animationDelay: '3s' }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <div className="section-label mx-auto mb-4">📬 Contact Us</div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
              We'd Love to <span className="text-grad-primary">Hear From You</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-lg mx-auto mt-4 text-sm leading-relaxed">
              Whether you have a question, partnership idea, or just want to say hello —
              our team is always here for you.
            </p>
          </div>

          {/* Main contact card */}
          <div className="wellness-card overflow-hidden md:flex">

            {/* Left — image + info */}
            <div className="md:w-5/12 shrink-0 relative">
              <img
                className="w-full h-60 md:h-full object-cover"
                src={assets.contact_image}
                alt="Contact Mediversal"
              />
              {/* Gradient overlay with info */}
              <div className="absolute inset-0 flex flex-col justify-end p-6
                              bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent">
                <div className="flex flex-col gap-2">
                  {[
                    { icon: '📞', text: 'Tel: (415) 555-0199'         },
                    { icon: '✉️', text: 'office@mediversal.com'        },
                    { icon: '📍', text: '54709 Willms Station, Suite 350, Washington, USA' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2">
                      <span>{icon}</span>
                      <p className="text-white text-xs font-semibold">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — form + careers */}
            <div className="md:w-7/12 p-8 sm:p-10 flex flex-col gap-7">

              {/* Quick contact form */}
              <div>
                <h2 className="text-xl font-black text-slate-800 mb-1">Send Us a Message</h2>
                <p className="text-slate-400 text-xs font-medium mb-5">We typically respond within 24 hours</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Name</label>
                      <input
                        className="input-wellness"
                        type="text"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Email</label>
                      <input
                        className="input-wellness"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Message</label>
                    <textarea
                      className="input-wellness resize-none"
                      rows={4}
                      placeholder="How can we help you today?"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary text-[11px] w-fit">
                    {sent ? '✓ Message Sent!' : 'SEND MESSAGE →'}
                  </button>
                </form>
              </div>

              {/* Careers */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-5">
                <p className="text-sm font-black text-slate-800 mb-1">Careers at Mediversal</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                  Passionate about healthcare technology? Join our mission to make quality care universally accessible.
                </p>
                <button
                  className="btn-outline text-[10px] py-2 px-5"
                  onClick={() => toast.info('Opening job listings... 🚀')}
                >
                  EXPLORE OPPORTUNITIES
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
