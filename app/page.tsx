"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Users,
  FileText,
  BookOpen,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex">
            <Image
              src="/smartreport.ai-logo.png"
              alt="Logo"
              width={150}
              height={150}
              priority
            />
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Features
              </a>
              <a
                href="#use-cases"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Use Cases
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                Pricing
              </a>
              <button className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/70 transition-colors cursor-pointer">
                Get Started
              </button>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden ml-4 p-2"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white backdrop-blur-md border-t border-border">
            <div className="px-6 py-4 space-y-4">
              <a
                href="#features"
                className="block text-muted-foreground hover:text-foreground transition-colors text-sm"
                onClick={() => setIsOpen(false)}
              >
                Features
              </a>
              <a
                href="#use-cases"
                className="block text-muted-foreground hover:text-foreground transition-colors text-sm"
                onClick={() => setIsOpen(false)}
              >
                Use Cases
              </a>
              <a
                href="#pricing"
                className="block text-muted-foreground hover:text-foreground transition-colors text-sm"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </a>
              <button className="w-full px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/70 transition-colors cursor-pointer">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Your grid */}
            <div
              className="absolute inset-0 h-[60vh] w-full"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 20%, transparent 90%)",
                maskImage:
                  "linear-gradient(to bottom, black 20%, transparent 90%)",
              }}
            ></div>
          </div>
          <div className="space-y-2">
            <motion.p
              className="text-sm font-medium text-primary bg-accent/40 inline-block px-4 py-1.5 rounded-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              Now Available for Students
            </motion.p>
            <motion.h1
              className="text-5xl md:text-6xl font-bold text-foreground leading-tight text-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              Create and communicate documents with AI
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            >
              Write better project reports, presentations, and school documents
              in minutes. Powered by intelligent document AI designed for
              student success.
            </motion.p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth/signup">
              <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/70 transition-colors flex items-center justify-center gap-2 cursor-pointer w-full">
                Start for Free
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <button className="px-8 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-border transition-colors cursor-pointer">
              View Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12">
            <div className="space-y-2">
              <p className="text-3xl font-bold text-foreground">10K+</p>
              <p className="text-sm text-muted-foreground">Students Trusted</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-foreground">2M+</p>
              <p className="text-sm text-muted-foreground">Documents Created</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-foreground">98%</p>
              <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-6 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafd_50%,#f0f5fb_100%)]"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <p className="text-sm font-medium text-primary">
              Powerful Features
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              Everything you need to write better
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                AI Writing Assistant
              </h3>
              <p className="text-muted-foreground">
                Get intelligent suggestions to improve clarity, tone, and
                structure. Write like a professional in minutes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Real-time Collaboration
              </h3>
              <p className="text-muted-foreground">
                Work together with classmates and professors. Share feedback and
                iterate in real time without hassle.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Ready-made Templates
              </h3>
              <p className="text-muted-foreground">
                Start with templates for research papers, lab reports,
                presentations, and more. Customize as you go.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Citation Management
              </h3>
              <p className="text-muted-foreground">
                Automatically format citations in APA, MLA, Chicago, and more.
                Stay academic integrity compliant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <p className="text-sm font-medium text-primary">Perfect For</p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              Every type of student project
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Project Reports",
                desc: "Structured format with data integration",
              },
              {
                title: "Research Papers",
                desc: "Academic formatting and citations",
              },
              {
                title: "Presentations",
                desc: "Convert to slides automatically",
              },
              { title: "Lab Reports", desc: "Scientific formatting support" },
              { title: "Case Studies", desc: "Analysis framework included" },
              { title: "Group Assignments", desc: "Collaborate seamlessly" },
            ].map((useCase, i) => (
              <div
                key={i}
                className="p-6 bg-card rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <h3 className="font-semibold text-foreground mb-2">
                  {useCase.title}
                </h3>
                <p className="text-sm text-muted-foreground">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafd_50%,#f0f5fb_100%)]">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
            Ready to write better?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of students already using DocuMind to create amazing
            documents.
          </p>
          <button className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-accent transition-colors inline-flex items-center gap-2 text-lg">
            Get Started for Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xs">
                  D
                </div>
                <span className="font-semibold text-foreground">DocuMind</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Making document writing effortless for students.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-4 text-sm">
                Product
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Templates
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-4 text-sm">
                Resources
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Guides
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-4 text-sm">Legal</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2025 DocuMind. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition-colors">
                Twitter
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                LinkedIn
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Discord
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
