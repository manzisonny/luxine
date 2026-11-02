import React from "react";
import { motion } from "motion/react";
import { Phone, Instagram, ExternalLink, Globe, Mail } from "lucide-react";

interface ContactDetailsProps {
  theme?: "light" | "dark";
}

export default function ContactDetails({ theme = "dark" }: ContactDetailsProps) {
  const isDark = theme === "dark";

  const socialLinks = [
    {
      name: "WhatsApp",
      handle: "+250 788 396 793",
      url: "https://wa.me/250788396793",
      icon: Phone,
      color: "from-emerald-500 to-teal-600",
      glow: "rgba(16, 185, 129, 0.2)",
      description: "Message Ella directly"
    },
    {
      name: "Instagram",
      handle: "@theyenvyluxine_",
      url: "https://www.instagram.com/theyenvyluxine_?igsh=bTllZ2xvNXpreXVm&utm_source=qr",
      icon: Instagram,
      color: "from-pink-500 via-red-500 to-yellow-500",
      glow: "rgba(236, 72, 153, 0.2)",
      description: "See her photos and updates"
    },
    {
      name: "TikTok",
      handle: "@luxine00",
      url: "https://www.tiktok.com/@luxine00?_r=1&_t=ZS-96ZVn1KPUQv",
      icon: Globe,
      color: "from-black via-gray-900 to-teal-500",
      glow: "rgba(20, 184, 166, 0.2)",
      description: "See her videos and updates"
    },
    {
      name: "Email",
      handle: "luxineiriza@gmail.com",
      url: "mailto:luxineiriza@gmail.com",
      icon: Mail,
      color: "from-[#bd001d] to-[#e8182c]",
      glow: "rgba(232, 24, 44, 0.2)",
      description: "Send Ella an email"
    }
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <div className="text-center md:text-left">
        <h1 className={isDark ? "mb-2 font-serif text-3xl font-bold italic text-[#ffb3ae] md:text-5xl" : "mb-2 font-serif text-3xl font-bold italic text-[#bd001d] md:text-5xl"}>
          Connect with Ella
        </h1>
        <p className={isDark ? "font-accent-italic text-lg italic text-[#d8c1c4]" : "font-accent-italic text-lg italic text-[#6c5a5d]"}>
          Reach out or follow along on her social channels.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {socialLinks.map((social, index) => {
          const Icon = social.icon;
          return (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={"group relative flex h-64 flex-col justify-between overflow-hidden rounded-[28px] border p-6 shadow-md " + (
                isDark
                  ? "border-red-950/10 bg-[#1E0D10] hover:border-[#e8182c]/30"
                  : "border-[#FFE4E4]/30 bg-white hover:border-[#e8182c]/40"
              )}
              style={{ boxShadow: "0 10px 30px -10px " + social.glow }}
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-br opacity-5 transition-opacity group-hover:opacity-10" />

              <div>
                <div className={"mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md " + social.color}>
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className={isDark ? "mb-1 font-serif text-xl font-bold italic text-[#fcf9f8]" : "mb-1 font-serif text-xl font-bold italic text-[#1c1b1b]"}>
                  {social.name}
                </h2>
                <p className={isDark ? "mb-3 font-sans text-xs font-semibold text-[#ffb3ae]" : "mb-3 font-sans text-xs font-semibold text-[#bd001d]"}>
                  {social.handle}
                </p>
                <p className={isDark ? "font-sans text-xs leading-relaxed text-[#926e6b]" : "font-sans text-xs leading-relaxed text-[#6c5a5d]"}>
                  {social.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 border-t border-[#FFE4E4]/10 pt-4 font-label-mono text-[10px] font-bold uppercase tracking-wider">
                <span className={isDark ? "text-[#d8c1c4] group-hover:text-[#ffb3ae]" : "text-[#6c5a5d] group-hover:text-[#bd001d]"}>
                  Open link
                </span>
                <ExternalLink className={isDark ? "h-3 w-3 text-[#926e6b] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" : "h-3 w-3 text-[#6c5a5d] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"} />
              </div>
            </motion.a>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={isDark ? "relative overflow-hidden rounded-[28px] border border-red-950/10 bg-[#180A0C]/50 p-6 text-center" : "relative overflow-hidden rounded-[28px] border border-[#FFE4E4]/40 bg-[#FFF5F5]/50 p-6 text-center"}
      >
        <p className={isDark ? "mx-auto max-w-xl font-accent-italic text-base italic leading-relaxed text-[#d8c1c4]" : "mx-auto max-w-xl font-accent-italic text-base italic leading-relaxed text-[#6c5a5d]"}>
          Thanks for stopping by. Use the links above to reach Ella or follow along.
        </p>
      </motion.div>
    </div>
  );
}
