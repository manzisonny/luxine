import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Rocket, Heart, Star, Compass, Award, ShieldAlert, Sparkles, Check, ChevronUp, ChevronDown } from "lucide-react";

interface Milestone {
  id: number;
  date: string;
  title: string;
  desc: string;
  details?: string;
  category: "personal" | "career" | "milestone" | "birthday";
}

const MILESTONES: Milestone[] = [
  {
    id: 1,
    date: "May 30, 2026",
    title: "The Golden Birthday Universe Launch",
    desc: "Happy birthday, Luxine! Today, this digital universe is handed over as an immortal, breathing memory capsule.",
    details: "Built under specific design languages, showcasing her high-passion editorial images, custom Letters guestbook, and private Cinema Watchlist.",
    category: "birthday"
  },
  {
    id: 2,
    date: "May 29, 2025",
    title: "One Year Curation Core Completed",
    desc: "A year of dedicated memories cataloged seamlessly across continents.",
    details: "Milan runway shows, private fitting studios, and quiet seaside sunbaths compiled under the curated Space archive.",
    category: "milestone"
  },
  {
    id: 3,
    date: "December 20, 2024",
    title: "First Milan Editorial Campaign",
    desc: "Luxine coordinates the aesthetic profile for a high-end Milan apparel shoot.",
    details: "This signature look integrated deep blood-red velvet accents and dramatic shadows, giving birth to the brand themes you celebrate today.",
    category: "career"
  },
  {
    id: 4,
    date: "January 10, 2024",
    title: "Seeds Planted: Initial Digital Blueprint",
    desc: "First thoughts of compiling a private digital home of pure high fidelity design are written down.",
    details: "A beautiful rebellion against standard commercial feed clutter—curating an honest, protected sanctuary.",
    category: "personal"
  }
];

export default function StoryInsights() {
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(1);
  const [hoveredGridTile, setHoveredGridTile] = useState<{ day: number; week: number; count: number } | null>(null);

  // Generate 7 rows x 52 columns pseudo activity commits for the GitHub-style Memory Density Grid
  const generateGridData = () => {
    const grid: number[][] = [];
    for (let row = 0; row < 7; row++) {
      const rowData: number[] = [];
      for (let col = 0; col < 52; col++) {
        // Deterministic but highly realistic activity nodes
        let count = 0;
        const seedValue = (row * 3 + col * 7) % 19;
        if (seedValue === 0) count = 3 + (col % 3);
        else if (seedValue < 5) count = 1;
        else if (seedValue < 9) count = 2;
        rowData.push(count);
      }
      grid.push(rowData);
    }
    return grid;
  };

  const activityGrid = generateGridData();
  const totalCommits = activityGrid.flat().reduce((sum, val) => sum + val, 0);

  const getOpacityClass = (count: number) => {
    if (count === 0) return "bg-[#FFF5F5] dark:bg-[#180A0C]/40 border-[#FFE4E4]/10";
    if (count === 1) return "bg-[#bd001d]/20 border-[#bd001d]/10 text-white";
    if (count === 2) return "bg-[#bd001d]/40 border-[#bd001d]/20 text-white";
    if (count === 3) return "bg-[#bd001d]/60 border-[#bd001d]/30 text-white";
    return "bg-[#bd001d] border-[#bd001d]/40 text-white animate-pulse";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "birthday": return <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case "milestone": return <Compass className="w-5 h-5 text-[#e8182c]" />;
      case "career": return <Award className="w-5 h-5 text-blue-500" />;
      default: return <Rocket className="w-5 h-5 text-[#926e6b]" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Narrative Page Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-5xl font-bold italic text-[#bd001d] dark:text-[#ffb3ae] mb-2 font-headline-serif">
          Her Story
        </h1>
        <p className="font-accent-italic text-lg text-[#6c5a5d] dark:text-[#d8c1c4] italic mb-1">
          "A universe of her own making." Tracing the creative narrative and footprint density.
        </p>
      </div>

      {/* 1. Memory commit Grid - Footprint Density Indicator */}
      <section className="bg-white dark:bg-[#1E0D10] p-6 rounded-[28px] shadow-sm border border-[#FFE4E4]/10 dark:border-red-950/5">
        <div className="border-b border-[#FFE4E4]/10 pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <span className="font-label-mono text-[9px] text-[#e8182c] font-bold">Footprint Analysis</span>
            <h3 className="font-serif text-lg font-bold text-[#1c1b1b] dark:text-[#fcf9f8] italic mt-0.5">
              Capsule Memory Density Grid
            </h3>
          </div>
          <span className="font-label-mono text-[9px] text-[#926e6b] font-bold">
            Total historical checkpoints compiled: <span className="text-[#e8182c] font-black">{totalCommits} days</span>
          </span>
        </div>

        {/* Outer grid wrapper with horizontal scrolling auto safety */}
        <div className="w-full overflow-x-auto hide-scrollbar pb-4 relative">
          <div className="min-w-[700px] flex flex-col gap-1.5 p-1">
            {activityGrid.map((row, rowIdx) => (
              <div key={`row_${rowIdx}`} className="flex gap-1.5 justify-between">
                {row.map((count, colIdx) => (
                  <div
                    key={`col_${colIdx}`}
                    onMouseEnter={() => setHoveredGridTile({ day: rowIdx, week: colIdx, count })}
                    onMouseLeave={() => setHoveredGridTile(null)}
                    className={`h-4 flex-1 aspect-square rounded-[3px] border cursor-pointer transition-all duration-300 transform hover:scale-125 hover:rotate-12 ${getOpacityClass(count)}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Interactive Tooltip Hover state HUD overlay */}
          <AnimatePresence>
            {hoveredGridTile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-[-44px] left-1/2 -translate-x-1/2 bg-[#bd001d] text-white px-4 py-2 rounded-xl text-[10px] font-label-mono font-bold uppercase tracking-wider shadow-md pointer-events-none"
              >
                {hoveredGridTile.count === 0
                  ? "Quiet reflection day · 0 records"
                  : hoveredGridTile.count === 1
                  ? "1 precious memory written"
                  : `Curated ${hoveredGridTile.count} beautiful moments`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Legend strip */}
        <div className="flex justify-end gap-1.5 items-center font-label-mono text-[9px] text-[#926e6b] font-bold mt-2">
          <span>Less reflective</span>
          <div className="h-3.5 w-3.5 rounded-[3px] bg-[#FFF5F5] dark:bg-[#180A0C] border border-[#FFE4E4]/10" />
          <div className="h-3.5 w-3.5 rounded-[3px] bg-[#bd001d]/20 border border-[#bd001d]/10" />
          <div className="h-3.5 w-3.5 rounded-[3px] bg-[#bd001d]/60 border border-[#bd001d]/30" />
          <div className="h-3.5 w-3.5 rounded-[3px] bg-[#bd001d] border border-[#bd001d]/50" />
          <span>More glowing</span>
        </div>
      </section>

      {/* 2. Custom Vertical milestone Timeline */}
      <section className="bg-white dark:bg-[#1E0D10] p-6 rounded-[28px] shadow-sm border border-[#FFE4E4]/10 dark:border-red-950/5">
        <div className="border-b border-[#FFE4E4]/10 pb-4 mb-6">
          <span className="font-label-mono text-[9px] text-[#e8182c] font-bold">Unfolding story</span>
          <h3 className="font-serif text-lg font-bold text-[#1c1b1b] dark:text-[#fcf9f8] italic mt-0.5">
            Milestones of Curation
          </h3>
        </div>

        {/* Visual vertical nodes lines */}
        <div className="relative border-l border-[#FFE4E4] dark:border-red-950/40 pl-6 ml-4 space-y-6">
          {MILESTONES.map((stone) => {
            const isExpanded = expandedMilestone === stone.id;
            const Icon = getCategoryIcon(stone.category);
            return (
              <div key={stone.id} className="relative group">
                {/* Node icon bulb */}
                <span className="absolute left-[-37px] top-1 bg-[#fcf9f8] dark:bg-[#0f0507] p-1.5 rounded-full border border-[#FFE4E4] dark:border-red-950/50 z-10">
                  {Icon}
                </span>

                <div className="bg-[#fcf9f8] dark:bg-[#180a0c] rounded-2xl p-5 border border-[#FFE4E4]/10 hover:shadow-2xs transition-shadow duration-300">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-label-mono text-[10px] text-[#926e6b] font-bold">
                      {stone.date}
                    </span>
                    <button
                      onClick={() => setExpandedMilestone(isExpanded ? null : stone.id)}
                      className="p-1 rounded-full text-[#926e6b] hover:bg-[#FFE4E4]/30 cursor-pointer transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  <h4 className="font-serif text-lg font-bold text-[#1c1b1b] dark:text-[#fcf9f8] italic mb-2">
                    {stone.title}
                  </h4>

                  <p className="font-sans text-sm text-[#6c5a5d] dark:text-[#d8c1c4] leading-relaxed">
                    {stone.desc}
                  </p>

                  {/* Expandable details panel */}
                  <AnimatePresence>
                    {isExpanded && stone.details && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4 border-t border-[#FFE4E4]/15 pt-4"
                      >
                        <p className="font-accent-italic text-sm text-[#926e6b] tracking-wide leading-relaxed italic pl-1 border-l border-[#bd001d]/60">
                          {stone.details}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
