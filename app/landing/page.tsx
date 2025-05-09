'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Sparkles,
  Zap,
  Lock,
  Globe,
  CheckCircle,
  ArrowRight,
  Send,
  Star,
  Menu,
  X,
  LucideSparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AutoChatDemo from '@/components/chat-demo';
import { useRouter } from 'next/navigation';

import {
  GlowingOrb,
  FloatingElement,
  FadeInView,
  TypewriterEffect,
  AnimatedCounter,
  ShimmerButton,
  ParallaxScroll,
} from '@/components/animations';
import { PlanSelector } from '@/components/subscription/plan-selector';
import type { SubscriptionPlan } from '@/lib/db/schema';

// Type definitions
interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
}
interface Testimonial {
  text: string;
  author: string;
  title: string;
}

interface Review {
  text: string;
  stars: number;
}

interface FaqItem {
  question: string;
  answer: string;
}

export default function Home(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [currentTestimonial, setCurrentTestimonial] = useState<number>(0);
  const [_isVisible, setIsVisible] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const features: Feature[] = [
    {
      icon: <MessageCircle className="h-6 w-6 text-indigo-500" />,
      title: 'Natural Conversations',
      description:
        'Chat with Lollichat about anything, just like talking to a friend. Enjoy natural, empathetic responses.',
    },
    {
      icon: <Sparkles className="h-6 w-6 text-indigo-500" />,
      title: 'AI-Powered Assistant',
      description:
        'Get help with tasks, brainstorm ideas, or simply enjoy a fun conversation with our advanced AI.',
    },
    {
      icon: <Zap className="h-6 w-6 text-indigo-500" />,
      title: 'Quick Responses',
      description:
        'Experience lightning-fast, thoughtful replies with optional text-to-speech functionality.',
    },
    {
      icon: <Lock className="h-6 w-6 text-indigo-500" />,
      title: 'Private & Secure',
      description:
        'All your conversations are private and confidential. We never sell your data.',
    },
    {
      icon: <Globe className="h-6 w-6 text-indigo-500" />,
      title: 'Topic Explorer',
      description:
        'Dive into fascinating topics with our curated conversation starters.',
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-indigo-500" />,
      title: 'Safe Content',
      description:
        'Lollichat filters inappropriate content to ensure a positive, helpful experience.',
    },
  ];

  const plans: SubscriptionPlan[] = [
    {
      id: 'd5b0b7b7-4147-4302-8638-e9695fa90e6c',
      name: 'Standard',
      description: 'Enhanced features for regular users',
      price: '19.99',
      features: [
        'Everything in Basic',
        'Advanced AI models',
        'Faster response time',
        'Priority email support',
        'Document generation',
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4181bf9c-4b42-4d4f-95b0-1895abadf054',
      name: 'Priority',
      description: 'Premium features for power users',
      price: '49.99',
      features: [
        'Everything in Standard',
        'Premium AI models',
        'Fastest response time',
        '24/7 priority support',
        'Advanced analytics',
        'Custom AI training',
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'f9f91a86-301a-45f2-8c35-0ac451c6d056',
      name: 'Standard Yearly',
      description: 'Enhanced features for regular users with yearly discount',
      price: '69.99',
      features: [
        'Everything in Basic',
        'Advanced AI models',
        'Faster response time',
        'Priority email support',
        'Document generation',
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'f78d46d5-f1d9-4b49-a0a6-44fa6c81ca98',
      name: 'Enterprise',
      description: 'Complete solution for businesses',
      price: '99.99',
      features: [
        'Everything in Priority',
        'Enterprise-grade security',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced analytics',
        'Team collaboration features',
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'fcd65a36-5c71-43f6-bc41-03e762e0d89b',
      name: 'Priority Yearly',
      description: 'Premium features for power users with yearly discount',
      price: '499.00',
      features: [
        'Everything in Standard',
        'Premium AI models',
        'Fastest response time',
        '24/7 priority support',
        'Advanced analytics',
        'Custom AI training',
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'bdedb56a-d577-470f-82ed-b34632216176',
      name: 'Enterprise Yearly',
      description: 'Complete solution for businesses with yearly discount',
      price: '999.00',
      features: [
        'Everything in Priority',
        'Enterprise-grade security',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced analytics',
        'Team collaboration features',
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const testimonials: Testimonial[] = [
    {
      text: 'Lollichat has become my go-to companion for brainstorming ideas. It&apos;s like having a brilliant friend who&apos;s always available.',
      author: 'Sarah K.',
      title: 'Creative Director',
    },
    {
      text: 'The natural conversation flow is incredible. I often forget I&apos;m talking to an AI because the responses are so thoughtful and human-like.',
      author: 'Michael T.',
      title: 'Software Engineer',
    },
    {
      text: 'I love using Lollichat to explore new topics. The curated conversation starters have introduced me to subjects I never knew I&apos;d be interested in!',
      author: 'Aisha R.',
      title: 'Graduate Student',
    },
  ];

  const reviews: Review[] = [
    {
      text: 'The text-to-speech feature is amazing. I often listen to Lollichat&apos;s responses while multitasking around the house.',
      stars: 5,
    },
    {
      text: 'Lollichat has helped me overcome writer&apos;s block so many times. It&apos;s like having a creative partner available 24/7.',
      stars: 5,
    },
    {
      text: 'I appreciate how Lollichat keeps conversations positive and appropriate. I feel comfortable letting my teenagers use it for homework help.',
      stars: 5,
    },
  ];

  const faqItems: FaqItem[] = [
    {
      question: 'What is Lollichat?',
      answer:
        'Lollichat is an AI personal assistant designed to have natural, empathetic conversations. You can chat about virtually any topic, get help with tasks, brainstorm ideas, or just enjoy a friendly chat.',
    },
    {
      question: 'Is my data secure?',
      answer:
        'Yes! We prioritize your privacy and security. We don&apos;t sell your data or conversations, and all information is kept confidential. You can also use the private chat feature for additional security.',
    },
    {
      question: 'What topics can Lollichat discuss?',
      answer:
        'Lollichat can discuss a wide range of topics, but is specifically designed to filter inappropriate content. It excels at creative brainstorming, information sharing, personal reflection, and friendly conversation.',
    },
    {
      question: 'How do I get started?',
      answer:
        'Simply create an account using your email or Google authentication, and you can start chatting right away with the free plan. You can upgrade to Premium or Business plans anytime.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
      <Head>
        <title>Lollichat - Your AI Personal Assistant</title>
        <meta
          name="description"
          content="Lollichat is your friendly AI companion for natural conversations, brainstorming, and more."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header/Navbar */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-indigo-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex flex-row gap-3 items-center">
              <LucideSparkles
                size={24}
                fill="currentColor"
                className="text-primary group-hover:scale-110 transition-transform duration-200"
              />
              <span className="winky-sans-bold text-3xl tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-300">
                Lollichat
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Features
              </Link>
              <Link
                href="#demo"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Demo
              </Link>
              <Link
                href="#pricing"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#testimonials"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Testimonials
              </Link>
              <Link
                href="#faq"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                FAQ
              </Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Log in
              </Link>
              <ShimmerButton
                onClick={() => router.push('/register')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all px-4 py-2 rounded-md"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4 inline" />
              </ShimmerButton>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden text-gray-500 hover:text-indigo-600 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden py-4"
              >
                <nav className="flex flex-col space-y-4">
                  <Link
                    href="#features"
                    className="text-gray-600 hover:text-indigo-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href="#demo"
                    className="text-gray-600 hover:text-indigo-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Demo
                  </Link>
                  <Link
                    href="#pricing"
                    className="text-gray-600 hover:text-indigo-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="#testimonials"
                    className="text-gray-600 hover:text-indigo-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Testimonials
                  </Link>
                  <Link
                    href="#faq"
                    className="text-gray-600 hover:text-indigo-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    FAQ
                  </Link>
                  <div className="pt-2 flex flex-col space-y-3">
                    <Link
                      href="/login"
                      className="text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      Log in
                    </Link>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 relative overflow-hidden">
          <div className="absolute w-full h-full top-0 left-0 overflow-hidden z-0">
            {/* Using GlowingOrb components for background effects */}
            <GlowingOrb
              color="indigo"
              size="xl"
              className="-top-24 -right-24"
            />
            <GlowingOrb
              color="purple"
              size="xl"
              delay={1}
              className="-bottom-24 -left-24"
            />
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="flex flex-col md:flex-row items-center">
              <FadeInView className="md:w-1/2 mb-10 md:mb-0" direction="left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 leading-tight">
                  Your AI Companion for{' '}
                  <span className="text-indigo-600">
                    Meaningful Conversations
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Experience natural, empathetic chats with our advanced AI
                  assistant. Get help, explore ideas, or simply enjoy a friendly
                  conversation.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <ShimmerButton
                    onClick={() => router.push('/register')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all rounded-md"
                  >
                    Start Chatting Now{' '}
                    <ArrowRight className="ml-2 h-5 w-5 inline" />
                  </ShimmerButton>
                  <Button
                    variant="outline"
                    className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-7 text-lg"
                  >
                    View Demo
                  </Button>
                </div>
              </FadeInView>

              <FloatingElement
                className="md:w-1/2 relative"
                delay={0.2}
                duration={4}
              >
                <div className="relative w-full max-w-md mx-auto">
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-indigo-100 rounded-full z-0" />
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-100 rounded-full z-0" />

                  {/* Chat UI Mockup */}
                  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-indigo-100 relative z-10">
                    <div className="bg-indigo-600 text-white p-4 flex items-center">
                      <div className="flex items-center">
                        <svg
                          className="w-6 h-6 text-white"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                        <span className="ml-2 font-semibold">Lollichat</span>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 h-72 overflow-y-auto space-y-4">
                      <div className="flex justify-end">
                        <div className="bg-indigo-100 rounded-lg p-3 max-w-xs">
                          <p className="text-gray-800">
                            Hello! Can you tell me something interesting about
                            space?
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm">
                          <p className="text-gray-800">
                            Sure! Did you know that a day on Venus is longer
                            than a year on Venus? It takes Venus 243 Earth days
                            to rotate once on its axis but only 225 Earth days
                            to orbit the Sun!
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-indigo-100 rounded-lg p-3 max-w-xs">
                          <p className="text-gray-800">
                            That&apos;s fascinating! Why does it rotate so
                            slowly?
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center mb-3">
                        <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm flex items-center space-x-2">
                          <div className="animate-pulse flex space-x-1">
                            <div className="h-2.5 w-2.5 bg-gray-400 rounded-full" />
                            <div className="h-2.5 w-2.5 bg-gray-300 rounded-full" />
                            <div className="h-2.5 w-2.5 bg-gray-200 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-200 flex items-center">
                      <input
                        type="text"
                        placeholder="Send a message..."
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        className="ml-2 bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700"
                        type="button"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </FloatingElement>
            </div>
            {/* Stats */}
            <FadeInView
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-center"
              direction="up"
              delay={0.4}
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-4xl font-bold text-indigo-600 mb-2">
                  <AnimatedCounter
                    from={0}
                    to={1000000}
                    formatter={(value) => Math.round(value / 1000)}
                  />
                  K+
                </h3>
                <p className="text-gray-600">Daily Conversations</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-4xl font-bold text-indigo-600 mb-2">
                  <AnimatedCounter
                    from={0}
                    to={500000}
                    formatter={(value) => Math.round(value / 1000)}
                  />
                  K+
                </h3>
                <p className="text-gray-600">Active Users</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-4xl font-bold text-indigo-600 mb-2">
                  <AnimatedCounter
                    from={0}
                    to={4.9}
                    formatter={(value) => Number(value.toFixed(1))}
                  />
                  /5
                </h3>
                <p className="text-gray-600">User Satisfaction</p>
              </div>
            </FadeInView>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section id="demo" className="py-16 md:py-24 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                <TypewriterEffect text="See Lollichat in Action" speed={80} />
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Watch how Lollichat responds with natural, helpful conversation
              </p>
            </div>

            {/* Automated Chat Demo */}
            <FadeInView direction="up" delay={0.2}>
              <AutoChatDemo />
            </FadeInView>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-16 md:py-24 px-4 bg-gradient-to-b from-white to-indigo-50"
        >
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Experience the Magic of Lollichat
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our AI assistant is designed to provide natural, helpful, and
                engaging conversations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FadeInView
                  key={`${index}-${feature.title}`}
                  direction="up"
                  delay={index * 0.1}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className="bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 md:py-24 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose the plan that works best for you, with no hidden fees or
                surprises.
              </p>
            </div>
            <PlanSelector
              plans={plans}
              activeSubscription={null}
              activePlan={null}
              hideButton={true}
            />
          </div>
        </section>
        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="py-16 md:py-24 px-4 bg-gradient-to-b from-indigo-50 to-white relative overflow-hidden"
        >
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-20" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-20" />

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                What Our Users Say
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join thousands of users who love chatting with Lollichat every
                day.
              </p>
            </div>

            <FadeInView
              direction="up"
              className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 relative"
            >
              <div className="absolute -top-3 -left-3">
                <svg
                  className="w-12 h-12 text-indigo-500 opacity-20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              <div className="relative z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    <p className="text-xl text-gray-700 italic mb-8">
                      &quot;{testimonials[currentTestimonial].text}&quot;
                    </p>
                    <div className="flex flex-col items-center">
                      <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mb-3">
                        <span className="text-indigo-600 font-bold text-xl">
                          {testimonials[currentTestimonial].author.charAt(0)}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">
                        {testimonials[currentTestimonial].author}
                      </h4>
                      <p className="text-gray-600">
                        {testimonials[currentTestimonial].title}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-8 flex justify-center space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    type="button"
                    key={`${index}-${testimonials[index].author}`}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentTestimonial
                        ? 'bg-indigo-600'
                        : 'bg-gray-300 hover:bg-indigo-300'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </FadeInView>

            {/* Additional testimonial cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {reviews.map((review, index) => (
                <FadeInView
                  key={`${index}-${reviews[index].text}`}
                  direction="up"
                  delay={0.1 + index * 0.1}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex mb-3">
                    {[...Array(review.stars)].map((_, i) => (
                      <Star
                        key={`${i}-${review.text}`}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700">&quot;{review.text}&quot;</p>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>
        {/* FAQ Section */}
        <section id="faq" className="py-16 md:py-24 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Got questions? We&apos;ve got answers.
              </p>
            </div>

            <div className="space-y-6">
              {faqItems.map((item, index) => (
                <FadeInView
                  key={`${index}-${item.question}`}
                  direction="up"
                  delay={0.1 + index * 0.1}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <details className="group">
                    <summary className="flex justify-between items-center p-6 cursor-pointer">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {item.question}
                      </h3>
                      <span className="transition-transform duration-300 group-open:rotate-180">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 9L12 15L18 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 pt-2 text-gray-600">
                      <p>{item.answer}</p>
                    </div>
                  </details>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <ParallaxScroll
          speed={0.2}
          className="py-16 md:py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <GlowingOrb
              color="indigo"
              size="xl"
              className="top-0 -right-24"
              delay={0.5}
            />
            <GlowingOrb
              color="purple"
              size="xl"
              className="-bottom-24 -left-24"
              delay={0.8}
            />
          </div>

          <div className="container mx-auto max-w-4xl relative z-10 text-center px-4">
            <FadeInView direction="up">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Start Chatting?
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join thousands of users who have discovered the joy of
                meaningful AI conversations with Lollichat.
              </p>
              <Button
                className="bg-white text-indigo-600 hover:bg-indigo-50 text-lg px-8 py-6 shadow-lg rounded-md"
                type="button"
              >
                Get Started for Free{' '}
                <ArrowRight className="ml-2 h-5 w-5 inline" />
              </Button>
              <p className="mt-6 text-indigo-200">No credit card required</p>
            </FadeInView>
          </div>
        </ParallaxScroll>
      </main>
    </div>
  );
}
