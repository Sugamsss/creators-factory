"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { getAvatar, updateAvatar } from "@/features/avatars/services/avatarApi";

interface PersonalityStepProps {
  avatarId: string;
}

export function PersonalityStep({ avatarId }: PersonalityStepProps) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    description: "",
    backstory: "",
    industry_id: "",
    role_paragraph: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAvatar = useCallback(async () => {
    try {
      const data = await getAvatar(Number(avatarId));
      setFormData({
        name: data.name || "",
        age: data.age?.toString() || "",
        description: data.description || "",
        backstory: data.backstory || "",
        industry_id: data.industry_id?.toString() || "",
        role_paragraph: data.role_paragraph || "",
      });
    } catch (error) {
      console.error("Failed to fetch avatar:", error);
    } finally {
      setIsLoading(false);
    }
  }, [avatarId]);

  useEffect(() => {
    fetchAvatar();
  }, [fetchAvatar]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAvatar(Number(avatarId), {
        ...formData,
        age: formData.age ? parseInt(formData.age, 10) : null,
        industry_id: formData.industry_id
          ? parseInt(formData.industry_id, 10)
          : null,
      });
      console.log("Avatar saved successfully");
    } catch (error) {
      console.error("Failed to save avatar:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#3c9f95] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 overflow-y-auto scrollbar-none relative">
      <div className="max-w-5xl mx-auto w-full space-y-10 pb-20">
        <header className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3c9f95]" />
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#3c9f95]">Stage 03: Cognition</p>
            </div>
            <h3 className="font-display text-3xl lg:text-4xl text-[#1a3a2a]">Defining Personality</h3>
            <p className="text-[12px] text-[#5c6d66] max-w-xl leading-relaxed font-medium">
              Define the soul of your avatar: their history, role, and voice.
            </p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 h-11 rounded-xl bg-[#1a3a2a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#3c9f95] transition-all disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Identity"}
            <span className="material-symbols-outlined !text-[16px]">save</span>
          </button>
        </header>

        {/* Identity Section */}
        <section className="bg-white rounded-[32px] border border-[#d6dbd4] p-8 shadow-xl shadow-black/5">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-xl bg-[#3c9f95]/10 text-[#3c9f95] flex items-center justify-center">
                <span className="material-symbols-outlined !text-[20px]">id_card</span>
              </span>
              <div>
                <h4 className="font-display text-xl text-[#1a3a2a]">Core Identity</h4>
                <p className="text-[10px] font-bold text-[#8ca1c5] uppercase tracking-widest mt-0.5">Basic info and origin story</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a3a2a] ml-1">Full Identity Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="E.G. JULIAN VANCE" 
                className="w-full rounded-[24px] border border-[#d6dbd4] bg-[#fafcfb] px-6 py-5 text-[14px] font-semibold text-[#1a3a2a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3c9f95]/20 transition-all placeholder:text-[#8ca1c5]"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a3a2a] ml-1">Perceived Chronological Age</label>
              <input 
                type="number" 
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="E.G. 32" 
                className="w-full rounded-[24px] border border-[#d6dbd4] bg-[#fafcfb] px-6 py-5 text-[14px] font-semibold text-[#1a3a2a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3c9f95]/20 transition-all placeholder:text-[#8ca1c5]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a3a2a] ml-1">Comprehensive Backstory</label>
            <textarea 
              name="backstory"
              value={formData.backstory}
              onChange={handleChange}
              rows={5}
              placeholder="WEAVE A TALE OF THEIR EXPERIENCES, THEIR VALUES, AND THE MOTIVATIONS THAT DRIVE THEM..." 
              className="w-full rounded-[32px] border border-[#d6dbd4] bg-[#fafcfb] px-6 py-6 text-[14px] font-semibold text-[#1a3a2a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3c9f95]/20 transition-all resize-none leading-relaxed placeholder:text-[#8ca1c5]"
            />
          </div>
        </section>

        {/* Industry & Role */}
        <section className="bg-white rounded-[32px] border border-[#d6dbd4] p-8 shadow-xl shadow-black/5">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-xl bg-[#3c9f95]/10 text-[#3c9f95] flex items-center justify-center">
                <span className="material-symbols-outlined !text-[20px]">work</span>
              </span>
              <div>
                <h4 className="font-display text-xl text-[#1a3a2a]">Industrial Context</h4>
                <p className="text-[10px] font-bold text-[#8ca1c5] uppercase tracking-widest mt-0.5">Professional positioning</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#1a3a2a] ml-1">Target Industry</label>
              <select 
                name="industry_id"
                value={formData.industry_id}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d6dbd4] bg-[#fafcfb] px-4 py-3 text-[13px] font-semibold text-[#1a3a2a] appearance-none cursor-pointer"
              >
                <option value="">Select Industry...</option>
                <option value="1">Education</option>
                <option value="2">Finance</option>
                <option value="3">Health & Wellness</option>
                <option value="4">Technology</option>
                <option value="5">Lifestyle</option>
                <option value="6">Business</option>
                <option value="7">Marketing</option>
                <option value="8">Customer Support</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#1a3a2a] ml-1">Functional Role</label>
              <input 
                type="text"
                name="role_paragraph"
                value={formData.role_paragraph}
                onChange={handleChange}
                placeholder="E.G. System Architect"
                className="w-full rounded-xl border border-[#d6dbd4] bg-[#fafcfb] px-4 py-3 text-[13px] font-semibold text-[#1a3a2a] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Voice Grid (Still semi-mocked but UI ready) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-xl bg-[#3c9f95]/10 text-[#3c9f95] flex items-center justify-center">
                <span className="material-symbols-outlined !text-[20px]">record_voice_over</span>
              </span>
              <div>
                <h4 className="font-display text-xl text-[#1a3a2a]">Vocal Signature</h4>
                <p className="text-[10px] font-bold text-[#8ca1c5] uppercase tracking-widest mt-0.5">Select a voice</p>
              </div>
            </div>
            <button className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#3c9f95] border border-[#3c9f95]/20 px-5 py-2 rounded-full hover:bg-[#3c9f95] hover:text-white transition-all">
              Custom Voice
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Serene Professional", archetype: "Calm, Mature", accent: "RP British", color: "#3c9f95" },
              { name: "Dynamic Innovator", archetype: "High Energy", accent: "Standard American", color: "#4a9e8a" },
              { name: "Trusted Advisor", archetype: "Empathetic, Soft", accent: "Australian", color: "#2f7a68" },
              { name: "Commanding Leader", archetype: "Authoritative", accent: "Transatlantic", color: "#1a3a2a" },
              { name: "Creative Visionary", archetype: "Playful, Airy", accent: "Midwestern", color: "#6bb8a3" },
              { name: "Technical Expert", archetype: "Precise, Clear", accent: "Singaporean", color: "#2d5a45" },
            ].map((voice, idx) => (
              <motion.div 
                key={voice.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-[#d6dbd4] rounded-[32px] p-6 hover:border-[#3c9f95] transition-all cursor-pointer group shadow-sm hover:shadow-2xl hover:shadow-[#3c9f95]/5 relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="h-12 w-12 rounded-full bg-[#f4f7f5] flex items-center justify-center text-[#3c9f95] group-hover:bg-[#1a3a2a] group-hover:text-white transition-all shadow-inner">
                    <span className="material-symbols-outlined !text-[24px]">play_circle</span>
                  </div>
                  <div className="h-6 w-6 rounded-full border-2 border-[#d6dbd4] group-hover:border-[#3c9f95] flex items-center justify-center transition-colors">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#3c9f95] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div>
                  <h5 className="text-[15px] font-bold text-[#1a3a2a] mb-1">{voice.name}</h5>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-[#f4f7f5] text-[#5c6d66] px-2.5 py-1 rounded-md">{voice.archetype}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-[#f4f7f5] text-[#5c6d66] px-2.5 py-1 rounded-md">{voice.accent}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
