import React from "react";
import { motion } from "motion/react";
import { MessageSquare, Phone, Instagram, Send, ExternalLink, Globe } from "lucide-react";

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
      description: "Chat directly or send birthday wishes"
    },
    {
      name: "Instagram",
      handle: "@theyenvyluxine_",
      url: "https://www.instagram.com/theyenvyluxine_?igsh=bTllZ2xvNXpreXVm&utm_source=qr",
      icon: Instagram,
      color: "from-pink-500 via-red-500 to-yellow-500",
      glow: "rgba(236, 72, 153, 0.2)",
      description: "Explore her curated visuals and stories"
    },
    {
      name: "TikTok",
      handle: "@luxine00",
      url: "https://www.tiktok.com/@luxine00?_r=1&_t=ZS-96ZVn1KPUQv",
      icon: Globe,
      color: "from-black via-gray-900 to-teal-500",
      glow: "rgba(20, 184, 166, 0.2)",
      description: "Watch her latest trends and updates"
    }
  ];

  return (
    <div className="space-y-8 pb-32 max-w-4xl mx-auto">
      {/* Header section */}
      <div className="text-center md:text-left">
        <h1 className={`font-serif text-3xl md:text-5xl font-bold italic mb-2 ${isDark ? "text-[#ffb3ae]" : "text-[#bd001d]"}`}>
          Connect with Ella
        </h1>
        <p className={`font-accent-italic text-lg italic ${isDark ? "text-[#d8c1c4]" : "text-[#6c5a5d]"}`}>
          Reach out, stay updated, or say hello on her official spaces.
        </p>
      </div>

      {/* Grid of luxury social link cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              className={`p-6 rounded-[28px] border flex flex-col justify-between h-64 relative overflow-hidden shadow-md group ${
                isDark 
                  ? "bg-[#1E0D10] border-red-950/10 hover:border-[#e8182c]/30" 
                  : "bg-white border-[#FFE4E4]/30 hover:border-[#e8182c]/40"
              }`}
              style={{
                boxShadow: `0 10px 30px -10px ${social.glow}`
              }}
            >
              {/* Card visual elements */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity rounded-bl-full" />
              
              <div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${social.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <h3 className={`font-serif text-xl font-bold italic mb-1 ${isDark ? "text-[#fcf9f8]" : "text-[#1c1b1b]"}`}>
                  {social.name}
                </h3>
                
                <p className={`font-sans text-xs mb-3 font-semibold ${isDark ? "text-[#ffb3ae]" : "text-[#bd001d]"}`}>
                  {social.handle}
                </p>
                
                <p className={`font-sans text-xs leading-relaxed ${isDark ? "text-[#926e6b]" : "text-[#6c5a5d]"}`}>
                  {social.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 font-label-mono text-[10px] uppercase font-bold tracking-wider pt-4 border-t border-[#FFE4E4]/10">
                <span className={isDark ? "text-[#d8c1c4] group-hover:text-[#ffb3ae]" : "text-[#6c5a5d] group-hover:text-[#bd001d]"}>
                  Go to space
                </span>
                <ExternalLink className={`w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${isDark ? "text-[#926e6b]" : "text-[#6c5a5d]"}`} />
              </div>
            </motion.a>
          );
        })}
      </div>

      {/* Decorative Interactive Note */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={`p-6 rounded-[28px] border text-center relative overflow-hidden ${
          isDark 
            ? "bg-[#180A0C]/50 border-red-950/10" 
            : "bg-[#FFF5F5]/50 border-[#FFE4E4]/40"
        }`}
      >
        <p className={`font-accent-italic text-base italic leading-relaxed max-w-xl mx-auto ${isDark ? "text-[#d8c1c4]" : "text-[#6c5a5d]"}`}>
          "Thank you for being part of my digital capsule. Your presence here makes this world complete."
        </p>
        <span className={`inline-block font-label-mono text-[9px] uppercase tracking-widest mt-4 font-bold ${isDark ? "text-[#ffb3ae]" : "text-[#bd001d]"}`}>
          ✦ Luxine ✦
        </span>
      </motion.div>
    </div>
  );
}
