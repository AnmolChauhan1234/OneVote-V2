import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Quote, Star, Award } from "lucide-react";

// Environment variable for image display
const SHOW_IMAGES = process.env.NEXT_PUBLIC_SHOW_IMAGES === "true";

// Testimonial Card Component
export const TestimonialCard = ({
  testimonial,
  index,
}: {
  testimonial: any;
  index: number;
}) => {
  const [imageError, setImageError] = useState(false);

  if (SHOW_IMAGES) {
    // Enhanced version with background images
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        whileHover={{ y: -10 }}
        className="group relative h-[420px] rounded-sm overflow-hidden cursor-pointer"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          {!imageError ? (
            <Image
              src={testimonial.image}
              alt={testimonial.name}
              fill
              className="
                object-cover scale-105 opacity-60 
                group-hover:scale-100 group-hover:opacity-100 
                transition-all duration-700 ease-out
                "
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          )}
        </div>

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent
                      group-hover:from-black/80 transition-all duration-500"
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-6">
          {/* Organization Badge */}
          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-sm mb-3 w-fit backdrop-blur-sm">
            <Award className="w-3 h-3 text-white" />
            <span className="text-[9px] uppercase tracking-wider text-white/80 font-medium">
              {testimonial.organization}
            </span>
          </div>

          {/* Quote Icon */}
          <Quote className="w-6 h-6 text-white/20 mb-2" />

          {/* Content Text */}
          <p className="text-sm text-white/90 leading-relaxed mb-4 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
            "{testimonial.content}"
          </p>

          {/* Rating */}
          <div className="flex gap-1 mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-white text-white" />
            ))}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 pt-3 border-t border-white/10">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/20">
              {!imageError ? (
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm font-display">
                {testimonial.name}
              </h4>
              <p className="text-xs text-white/60">{testimonial.role}</p>
            </div>
          </div>
        </div>

        {/* Glow Border Effect */}
        <div className="absolute inset-0 rounded-sm border border-white/10 group-hover:border-white/30 transition-all duration-300 pointer-events-none" />
      </motion.div>
    );
  }

  // Simple version without images (fallback)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group relative bg-gradient-to-br from-white to-gray-50 border border-border rounded-sm p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      {/* Quote decoration */}
      <div className="absolute top-4 right-4 text-6xl text-black/5 font-display">
        "
      </div>

      {/* Organization Badge */}
      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-black/5 rounded-sm mb-6">
        <Award className="w-3 h-3 text-black" />
        <span className="text-[9px] uppercase tracking-wider text-black/70 font-medium">
          {testimonial.organization}
        </span>
      </div>

      {/* Testimonial Content */}
      <p className="text-secondary leading-relaxed mb-6 relative z-10">
        "{testimonial.content}"
      </p>

      {/* Star Rating */}
      <div className="flex gap-1 mb-6">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-black text-black" />
        ))}
      </div>

      {/* User Info */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-black/10 bg-black/5 flex items-center justify-center">
          <span className="text-black font-bold text-lg">
            {testimonial.name.charAt(0)}
          </span>
        </div>
        <div>
          <h4 className="font-semibold text-black font-display text-base">
            {testimonial.name}
          </h4>
          <p className="text-xs text-muted mt-0.5">{testimonial.role}</p>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 border-2 border-black/0 group-hover:border-black/5 transition-all duration-300 rounded-sm pointer-events-none" />
    </motion.div>
  );
};
