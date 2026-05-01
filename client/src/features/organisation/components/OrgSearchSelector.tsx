"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Check, ChevronDown, Building2, Loader2 } from "lucide-react";
import { useOrganisations } from "../hooks/organisation.hooks";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";

interface OrgSearchSelectorProps {
  onSelect: (orgId: string, orgName: string) => void;
  error?: string;
  label?: string;
}

export function OrgSearchSelector({ onSelect, error, label }: OrgSearchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { data: organisations, isLoading } = useOrganisations(debouncedSearch);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (orgId: string, orgName: string) => {
    setSelectedName(orgName);
    onSelect(orgId, orgName);
    setIsOpen(false);
  };

  return (
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      {label && (
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/50 ml-1">
          {label}
        </label>
      )}

      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-3 
          bg-white border transition-all duration-200 cursor-pointer
          ${error ? "border-red-500" : "border-black/10 hover:border-black"}
          ${isOpen ? "border-black ring-1 ring-black/5" : ""}
        `}
      >
        <div className="flex items-center gap-3">
          <Building2 size={16} className={selectedName ? "text-black" : "text-black/20"} />
          <span className={`text-sm ${selectedName ? "text-black font-medium" : "text-black/40"}`}>
            {selectedName || "Select Organization"}
          </span>
        </div>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-black shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-black/5 flex items-center gap-3 bg-black/5">
              <Search size={14} className="text-black/40" />
              <input
                type="text"
                placeholder="Search organizations..."
                className="w-full bg-transparent border-none outline-none text-xs font-medium placeholder:text-black/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              {isLoading && <Loader2 size={14} className="animate-spin text-black/40" />}
            </div>

            {/* Results List */}
            <div className="max-h-[250px] overflow-y-auto">
              {organisations?.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-xs text-black/40 font-medium italic">No organizations found.</p>
                </div>
              ) : (
                organisations?.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => handleSelect(org.id, org.name)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-black hover:text-white cursor-pointer transition-colors group"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold tracking-tight">{org.name}</p>
                      <p className="text-[9px] uppercase tracking-wider opacity-60 font-medium">{org.type}</p>
                    </div>
                    {selectedName === org.name && <Check size={14} />}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-wider">{error}</p>}
    </div>
  );
}
