"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Heart, Shield, Lock, FileText } from "lucide-react";

import { SocialIcons } from "./SocialIcons";
import { SecondaryButton } from "../buttons/SecondaryButton";
import { Input } from "./input";

const currentYear = new Date().getFullYear();

const footerLinks = {
  product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Security", href: "/security" },
    { label: "Enterprise", href: "/enterprise" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
  ],
  resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Help Center", href: "/help" },
    { label: "API Status", href: "/status" },
    { label: "Community", href: "/community" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Licenses", href: "/licenses" },
  ],
};

const socialLinks = [
  { icon: SocialIcons.Github, href: "https://github.com", label: "GitHub" },
  { icon: SocialIcons.Twitter, href: "https://twitter.com", label: "Twitter" },
  {
    icon: SocialIcons.Linkedin,
    href: "https://linkedin.com",
    label: "LinkedIn",
  },
  { icon: Mail, href: "mailto:hello@example.com", label: "Email" },
];

const trustBadges = [
  { icon: Shield, label: "GDPR Compliant" },
  { icon: Lock, label: "256-bit SSL" },
  { icon: FileText, label: "ISO 27001" },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link href="/" className="inline-block">
                <h3 className="text-xl font-medium tracking-tight text-black">
                  Brand<span className="text-muted">.</span>
                </h3>
              </Link>
              <p className="mt-4 text-sm text-secondary leading-relaxed">
                Secure identity verification platform for modern businesses.
              </p>

              {/* Trust Badges */}
              <div className="mt-6 flex flex-wrap gap-3">
                {trustBadges.map((badge, idx) => (
                  <motion.div
                    key={badge.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-1.5 px-2 py-1 bg-soft rounded-sm"
                  >
                    <badge.icon className="w-3 h-3 text-muted" />
                    <span className="text-[9px] uppercase tracking-wider text-muted">
                      {badge.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 lg:col-span-3">
            {Object.entries(footerLinks).map(([category, links], idx) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted mb-4 hover:underline cursor-pointer">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-secondary hover:text-black transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Newsletter Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted mb-4">
              Stay Updated
            </h4>
            <p className="text-sm text-secondary mb-4">
              Get the latest updates on security and features.
            </p>
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                variant="light"
                type="email"
                placeholder="Enter your email"
                className="px-3 py-2 text-sm border border-border bg-white rounded-sm focus:outline-none focus:border-black transition-colors"
              />
              <SecondaryButton
                type="submit"
                className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] bg-black text-white hover:bg-black/85 transition-all duration-300 rounded-sm"
              >
                Subscribe
              </SecondaryButton>
            </form>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-border"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
              © {currentYear} Brand. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-black transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-4 h-4" />
                  <span className="sr-only">{social.label}</span>
                </motion.a>
              ))}
            </div>

            {/* Made with love */}
            <div className="flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-muted">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 animate-pulse" />
              <span>for security</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
