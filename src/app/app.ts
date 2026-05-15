import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ProjectLink {
  label: string;
  host: string;
  url: string;
}

interface ProjectCard {
  theme: string;
  accent: string;
  category: string;
  titleStart: string;
  titleAccent: string;
  titleEnd: string;
  description: string;
  modules: string[];
  tags: string[];
  imageDesktop: string;
  actionLabel: string;
  date: string;
  link?: string;
  links?: ProjectLink[];
  appStore?: string;
  playStore?: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly ngZone = inject(NgZone);
  private readonly hoverCleanupFns: Array<() => void> = [];
  private gsapContext?: gsap.Context;
  private ribbonTween?: gsap.core.Tween;
  private projectScrollTrigger?: ScrollTrigger;
  private scrollProgressTrigger?: ScrollTrigger;
  private navScrollListener?: () => void;
  private sectionObserver?: IntersectionObserver;

  isScrolled = false;
  activeSection = 'home';
  activeProjectIndex = 0;

  readonly aboutStats = [
    { value: '110', suffix: '+', label: 'Projects', note: 'Shipped end-to-end' },
    { value: '40', suffix: '+', label: 'Clients', note: 'Across 12 countries' },
    { value: '2', suffix: '+', label: 'Years', note: 'Designing products' }
  ];

  readonly aboutMeta = [
    { label: 'Based in', value: 'Yangon, Myanmar' },
    { label: 'Languages', value: 'English, Burmese' },
    { label: 'Currently', value: 'Systematic Solution' },
    { label: 'Focus', value: 'Product · Brand' }
  ];

  readonly services = [
    {
      icon: '🎯',
      title: 'UI Design',
      progress: 95
    },
    {
      icon: '🧭',
      title: 'UX Research',
      progress: 88
    },
    {
      icon: '🧪',
      title: 'Prototyping',
      progress: 82
    },
    {
      icon: '🧱',
      title: 'Design Systems',
      progress: 90
    },
    {
      icon: '📱',
      title: 'Mobile Design',
      progress: 85
    },
    {
      icon: '🤖',
      title: 'AI Prompt Engineering',
      progress: 93
    }
  ];

  readonly skillShowcase = [
    {
      name: 'Figma',
      icon: 'https://cdn.simpleicons.org/figma/F24E1E'
    },
    {
      name: 'Framer',
      icon: 'https://cdn.simpleicons.org/framer/ffffff'
    },
    {
      name: 'Notion',
      icon: 'https://cdn.simpleicons.org/notion/ffffff'
    },
    {
      name: 'Canva',
      icon: 'https://cdn.simpleicons.org/canva/00C4CC'
    },
    {
      name: 'Claude AI',
      icon: 'https://cdn.simpleicons.org/anthropic/ffffff'
    },
    {
      name: 'WordPress',
      icon: 'https://cdn.simpleicons.org/wordpress/21759B'
    },
    {
      name: 'Hostinger',
      icon: 'https://cdn.simpleicons.org/hostinger/673DE6'
    },
    {
      name: 'VS Code',
      icon: 'https://cdn.simpleicons.org/visualstudiocode/007ACC'
    },
    {
      name: 'Angular',
      icon: 'https://cdn.simpleicons.org/angular/DD0031'
    }
  ];

  readonly timeline = [
    {
      period: '2025 - Present',
      index: '01 / 04',
      initial: 'S',
      title: 'Mid UI/UX Designer',
      company: 'Systematic Business Solution Co.,Ltd · Yangon',
      accent: '#ff6b2b',
      description: 'Designed intuitive user experiences, developed modern interfaces, collaborated with developers,conducted usability testing, and delivered visually engaging digital products.',
      tags: ['Design system', 'UserExperience', 'Web · Mobile']
    },
    {
      period: '2024 - 2025',
      index: '02 / 04',
      initial: 'L',
      title: 'Junior UI/UX Designer',
      company: 'Systematic Business Solution Co.,Ltd · Yangon',
      accent: '#4aa3ff',
      description: 'Created wireframes, user flows, and interactive prototypes, conducted research, improved usability, and supported senior designers on multiple projects.',
      tags: ['Wireframing ', 'User flows', 'Mobile Design']
    },
    {
      period: '2023 - 2024',
      index: '03 / 04',
      initial: 'B',
      title: 'Web Developer',
      company: 'Brycen Myanmar Co.,Ltd',
      accent: '#8b5cf6',
      description: 'Developed HR products with Laravel, integrated backend features, fixed bugs, and improved system performance.',
      tags: ['Laravel', 'API integration', 'MYSQL']
    },
  ];

  readonly projects: ProjectCard[] = [
    {
      theme: 'green',
      accent: '#22c55e',
      category: 'Web Product',
      titleStart: 'Streamlined',
      titleAccent: 'HR',
      titleEnd: 'Platform',
      description: 'An end-to-end HR management suite focused on clarity, speed, and accessibility for distributed teams.',
      modules: ['Employee Management', 'Attendance Tracking', 'Payroll & Salary'],
      tags: ['UI/UX', 'Web App', 'Design System'],
      imageDesktop: 'images/SmartHR.png',
      actionLabel: 'View case study',
      date: '2024',
      link: 'https://www.smarticwork.com/smart-hr'
    },
    {
      theme: 'blue',
      accent: '#2f80ed',
      category: 'Enterprise Product',
      titleStart: 'Unified',
      titleAccent: 'ERP',
      titleEnd: 'Operations',
      description: 'A robust ERP dashboard covering inventory, finance, and supply chain workflows with role-based control.',
      modules: ['Inventory Flow', 'Finance & Reports', 'Supply Chain'],
      tags: ['ERP', 'Dashboard', 'Enterprise UX'],
      imageDesktop: 'images/SmartERP.png',
      actionLabel: 'View case study',
      date: '2024',
      link: 'https://www.smarticwork.com/smart-erp'
    },
    {
      theme: 'orange',
      accent: '#f97316',
      category: 'Website Portfolio',
      titleStart: 'Premium',
      titleAccent: 'Web',
      titleEnd: 'Experiences',
      description: 'High-fidelity website portfolio designs with modern typography, confident spacing, and immersive interactions.',
      modules: ['Landing Showcase', 'Brand Story', 'Responsive Systems'],
      tags: ['Luxury UI', 'Marketing Site', 'Motion Design'],
      imageDesktop: 'images/SmartWeb.png',
      actionLabel: 'View case study',
      date: '2025',
      links: [
        { label: 'AMA Myanmar', host: 'ama-mm.com', url: 'https://ama-mm.com/' },
        { label: 'Smart Landing', host: 'smarticwork.com/smart-landing', url: 'https://www.smarticwork.com/smart-landing' }
      ]
    },
    {
      theme: 'purple',
      accent: '#a855f7',
      category: 'Mobile Suite',
      titleStart: 'Business',
      titleAccent: 'Mobile',
      titleEnd: 'Suite',
      description: 'Native-feel mobile apps for HR and ERP tools, presented with polished device mockups and seamless UX.',
      modules: ['HR Mobile', 'ERP Mobile', 'Cross-device Continuity'],
      tags: ['iOS/Android', 'Responsive UX', 'Business Apps'],
      imageDesktop: 'images/SmartMobile.png',
      actionLabel: 'View case study',
      date: '2025',
      appStore: 'https://apps.apple.com/us/app/smart-hr-pro/id6752917496',
      playStore: 'https://play.google.com/store/apps/details?id=com.systematic.pro_smart_duty'
    }
  ];

  readonly recommendationStats = [
    { value: '5.0', label: 'Avg. rating' },
    { value: '98%', label: 'Repeat clients' },
    { value: '40+', label: 'Endorsements' }
  ];

  readonly recommendations = [
    {
      quote: "May has a rare ability to translate fuzzy product strategy into interfaces that feel inevitable. Her craft and calm raised the bar for our entire team.",
      name: 'Hpone Pyae Ko Ko',
      role: 'UI/UX Designer',
      accent: '#ff6b2b',
      avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=120&q=80'
    },
    {
      quote: 'Working with May was the most productive design partnership we have had. She thinks in systems, ships pixel-perfect work, and pushes us to be better.',
      name: 'Khoon Sett Hein',
      role: 'Backend Developer',
      accent: '#4aa3ff',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'
    },
    {
      quote: 'She brought clarity to a product that had been drifting for months. Two sprints in, our funnel jumped 28%. Truly thoughtful, end-to-end design.',
      name: 'Phyu Phyu May Maung',
      role: 'Full Stack Developer',
      accent: '#a78bfa',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80'
    }
  ];

  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);

    this.gsapContext = gsap.context(() => {
      this.setupSectionEntranceAnimations();
      this.setupCounterAnimations();
      this.setupProgressBarAnimations();
      

      gsap.to('.hero-image', {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }, this.host.nativeElement);

    this.setupHoverEffects();
    this.setupSkillRibbonAnimation();
    this.setupProjectShowcaseAnimation();
    this.setupScrollProgress();
    this.setupMagneticButtons();
    this.setupCursorGlow();
    this.setupStickyNav();
    this.setupActiveSectionTracking();
    this.setupAboutCardGlow();
    this.setupHeroChipReveal();
    this.setupTimelineProgress();
    this.setupAboutPhotoAnimation();
    this.setupProjectLinkAnimation();
  }

  private setupProjectLinkAnimation(): void {
    const links = this.host.nativeElement.querySelectorAll('.project-link') as NodeListOf<HTMLElement>;
    if (!links.length) return;

    links.forEach((link) => {
      gsap.from(link, {
        autoAlpha: 0,
        y: 18,
        scale: 0.94,
        duration: 0.9,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: link,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      });

      const arrow = link.querySelector('.project-link-arrow') as HTMLElement | null;
      if (!arrow) return;

      const enter = () => gsap.to(arrow, { y: -2, duration: 0.3, ease: 'power2.out' });
      const leave = () => gsap.to(arrow, { y: 0, duration: 0.4, ease: 'power2.out' });

      link.addEventListener('mouseenter', enter);
      link.addEventListener('mouseleave', leave);

      this.hoverCleanupFns.push(() => {
        link.removeEventListener('mouseenter', enter);
        link.removeEventListener('mouseleave', leave);
      });
    });
  }

  private setupAboutPhotoAnimation(): void {
    const frame = this.host.nativeElement.querySelector('.about-photo-frame') as HTMLElement | null;
    const photo = this.host.nativeElement.querySelector('.about-photo') as HTMLElement | null;
    if (!frame || !photo) return;

    const intro = gsap.timeline({
      scrollTrigger: {
        trigger: frame,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      defaults: { ease: 'power3.out' }
    });

    intro
      .from(frame, { autoAlpha: 0, scale: 0.92, y: 50, duration: 1.1 })
      .from(photo, { autoAlpha: 0, y: 40, scale: 1.06, duration: 1.2 }, '-=0.85');

    gsap.to(photo, {
      yPercent: -6,
      ease: 'none',
      scrollTrigger: {
        trigger: frame,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });

    if (window.matchMedia('(hover: none)').matches) return;

    const onMove = (e: MouseEvent) => {
      const rect = frame.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      gsap.to(photo, { x: x * 10, y: y * 8, duration: 0.6, ease: 'power3.out' });
    };

    const onLeave = () => {
      gsap.to(photo, { x: 0, y: 0, duration: 0.9, ease: 'power3.out' });
    };

    frame.addEventListener('mousemove', onMove);
    frame.addEventListener('mouseleave', onLeave);

    this.hoverCleanupFns.push(() => {
      frame.removeEventListener('mousemove', onMove);
      frame.removeEventListener('mouseleave', onLeave);
    });
  }

  private setupTimelineProgress(): void {
    const progress = this.host.nativeElement.querySelector('.timeline-progress') as HTMLElement | null;
    const timeline = this.host.nativeElement.querySelector('.experience-timeline') as HTMLElement | null;
    if (!progress || !timeline) return;

    ScrollTrigger.create({
      trigger: timeline,
      start: 'top 70%',
      end: 'bottom 75%',
      scrub: 0.6,
      onUpdate: (self) => {
        progress.style.setProperty('--progress', String(self.progress));
      }
    });
  }

  private setupHeroChipReveal(): void {
    const chips = this.host.nativeElement.querySelectorAll('.hero-chip') as NodeListOf<HTMLElement>;
    if (!chips.length) return;

    gsap.from(chips, {
      autoAlpha: 0,
      scale: 0.85,
      y: 12,
      duration: 0.7,
      ease: 'back.out(1.6)',
      stagger: 0.18,
      delay: 0.9
    });
  }

  ngOnDestroy(): void {
    this.hoverCleanupFns.forEach((cleanup) => cleanup());
    this.ribbonTween?.kill();
    this.projectScrollTrigger?.kill();
    this.scrollProgressTrigger?.kill();
    this.gsapContext?.revert();
    if (this.navScrollListener) {
      window.removeEventListener('scroll', this.navScrollListener);
    }
    this.sectionObserver?.disconnect();
  }

  protected readonly currentYear = new Date().getFullYear();

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private setupSectionEntranceAnimations(): void {
    gsap.from('.top-nav-wrap', {
      y: -18,
      autoAlpha: 0,
      duration: 0.75,
      ease: 'power3.out'
    });

    const groups = [
      { root: '.hero', targets: '.hero-tag, .hero h1, .hero-meta, .hero-copy, .hero-actions, .hero-stat, .hero-image-frame, .status-card', start: 'top 82%', y: 44 },
      { root: '.skill-ribbon', targets: '.ribbon-item', start: 'top 88%', y: 20 },
      { root: '.about', targets: '.about-head, .about-photo-wrap, .about-content > *, .about-meta-grid .about-meta-item', start: 'top 70%', y: 54 },
      { root: '.services', targets: '.services-head, .service-card', start: 'top 72%', y: 42 },
      { root: '.project-showcase', targets: '.showcase-head, .showcase-stack', start: 'top 76%', y: 46 },
      { root: '.experience', targets: '.experience-head, .experience-card', start: 'top 72%', y: 42 },
      { root: '.recommendations', targets: '.recommendation-head, .recommendation-feature, .recommendation-card', start: 'top 72%', y: 42 },
      { root: '.contact', targets: '.contact-head, .contact-email, .contact-chips, .social-row', start: 'top 78%', y: 36 }
    ];

    groups.forEach(({ root, targets, start, y }) => {
      const section = this.host.nativeElement.querySelector(root);
      if (!section) {
        return;
      }

      gsap.from(section.querySelectorAll(targets), {
        y,
        autoAlpha: 0,
        filter: 'blur(8px)',
        duration: 0.95,
        ease: 'power3.out',
        stagger: 0.12,
        clearProps: 'filter',
        scrollTrigger: {
          trigger: section,
          start,
          toggleActions: 'play none none reverse'
        }
      });
    });
  }

  private setupHoverEffects(): void {
    const hostElement = this.host.nativeElement as HTMLElement;
    const interactiveItems = hostElement.querySelectorAll(
      '.cta-btn, .case-btn'
    ) as NodeListOf<HTMLElement>;

    interactiveItems.forEach((item) => {
      const enter = () => {
        gsap.to(item, {
          y: -6,
          scale: 1.02,
          boxShadow: '0 22px 45px rgba(255, 87, 34, 0.28)',
          duration: 0.25,
          ease: 'power2.out'
        });
      };

      const leave = () => {
        gsap.to(item, {
          y: 0,
          scale: 1,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
          duration: 0.25,
          ease: 'power2.out'
        });
      };

      item.addEventListener('mouseenter', enter);
      item.addEventListener('mouseleave', leave);

      this.hoverCleanupFns.push(() => {
        item.removeEventListener('mouseenter', enter);
        item.removeEventListener('mouseleave', leave);
      });
    });
  }

  private setupSkillRibbonAnimation(): void {
    const track = this.host.nativeElement.querySelector('.skill-ribbon-track') as HTMLElement | null;
    if (!track) {
      return;
    }

    const singleRunWidth = track.scrollWidth / 2;

    this.ribbonTween = gsap.to(track, {
      x: -singleRunWidth,
      duration: 26,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: (x) => `${parseFloat(x) % -singleRunWidth}px`
      }
    });

    ScrollTrigger.create({
      trigger: '.skill-ribbon',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        if (this.ribbonTween) {
          this.ribbonTween.timeScale(1 + Math.abs(self.getVelocity()) / 2500);
        }
      }
    });
  }

  private setupProjectShowcaseAnimation(): void {
    const cards = gsap.utils.toArray<HTMLElement>('.showcase-card');
    if (!cards.length) {
      return;
    }

    if (window.matchMedia('(max-width: 991px)').matches) {
      cards.forEach((card) => {
        card.classList.add('is-active');
        card.style.zIndex = '';
      });
      return;
    }

    const stackGap = window.matchMedia('(max-width: 640px)').matches ? 26 : 34;
    const settledY = (offset: number) => offset * stackGap;

    gsap.set(cards, {
      opacity: 1,
      yPercent: 118,
      y: 0,
      scale: 0.96,
      filter: 'brightness(0.92)'
    });

    gsap.set(cards[0], {
      yPercent: 0,
      y: 0,
      scale: 1,
      filter: 'brightness(1)'
    });
    this.updateShowcaseStates(cards, 0);

    const timeline = gsap.timeline({ defaults: { ease: 'power3.inOut' } });

    cards.forEach((card, index) => {
      if (index === 0) {
        return;
      }

      timeline.to(
        card,
        {
          yPercent: 0,
          y: 0,
          scale: 1,
          filter: 'brightness(1)',
          duration: 1
        },
        index - 0.08
      );

      cards.slice(0, index).forEach((stackedCard, stackedIndex) => {
        const depth = index - stackedIndex;
        timeline.to(
          stackedCard,
          {
            y: settledY(depth),
            scale: 1 - depth * 0.018,
            filter: 'brightness(0.82)',
            duration: 1
          },
          index - 0.08
        );
      });
    });

    this.projectScrollTrigger?.kill();
    this.projectScrollTrigger = ScrollTrigger.create({
      trigger: '.showcase-stack',
      start: 'top top+=7.5%',
      end: `+=${cards.length * 640}`,
      scrub: 1,
      pin: '.showcase-stack',
      anticipatePin: 1,
      animation: timeline,
      onUpdate: (self) => {
        const nextIndex = Math.min(
          cards.length - 1,
          Math.max(0, Math.round(self.progress * (cards.length - 1)))
        );
        this.updateShowcaseStates(cards, nextIndex);
      }
    });
  }

  private updateShowcaseStates(cards: HTMLElement[], activeIndex: number): void {
    if (this.activeProjectIndex !== activeIndex) {
      this.ngZone.run(() => { this.activeProjectIndex = activeIndex; });
    }

    cards.forEach((card, index) => {
      const isActive = index === activeIndex;
      const isStacked = index < activeIndex;
      const isUpcoming = index > activeIndex;

      card.classList.toggle('is-active', isActive);
      card.classList.toggle('is-stacked', isStacked);
      card.classList.toggle('is-upcoming', isUpcoming);

      if (isActive) {
        card.style.zIndex = '20';
      } else if (isUpcoming) {
        card.style.zIndex = '15';
      } else {
        card.style.zIndex = '10';
      }
    });
  }

  formatHost(url: string): string {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
  }

  onProjectImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const fallback = 'images/SmartHR.png';
    if (!img.src.endsWith(fallback)) {
      img.src = fallback;
    }
  }

  goToProject(index: number): void {
    const trigger = this.projectScrollTrigger;
    if (!trigger) return;
    const cards = gsap.utils.toArray<HTMLElement>('.showcase-card');
    if (!cards.length) return;

    const progress = cards.length > 1 ? index / (cards.length - 1) : 0;
    const target = trigger.start + (trigger.end - trigger.start) * progress;
    window.scrollTo({ top: target, behavior: 'smooth' });
  }

  private setupScrollProgress(): void {
    const bar = document.querySelector('.scroll-progress') as HTMLElement | null;
    if (!bar) return;

    this.scrollProgressTrigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        gsap.set(bar, { scaleX: self.progress, transformOrigin: 'left center' });
      }
    });
  }

  private setupCounterAnimations(): void {
    const counters = this.host.nativeElement.querySelectorAll('.stat-count') as NodeListOf<HTMLElement>;

    counters.forEach((el) => {
      const target = parseInt(el.dataset['count'] ?? '0', 10);
      const suffix = el.dataset['suffix'] ?? '';

      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          const obj = { value: 0 };
          gsap.to(obj, {
            value: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.round(obj.value) + suffix;
            }
          });
        }
      });
    });
  }

  private setupProgressBarAnimations(): void {
    const cards = this.host.nativeElement.querySelectorAll('.service-card') as NodeListOf<HTMLElement>;

    cards.forEach((card) => {
      const bar = card.querySelector('.progress-track span') as HTMLElement | null;
      if (!bar) return;

      const targetWidth = bar.style.width;
      gsap.set(bar, { width: 0 });

      ScrollTrigger.create({
        trigger: card,
        start: 'top 86%',
        once: true,
        onEnter: () => {
          gsap.to(bar, { width: targetWidth, duration: 1.3, ease: 'power3.out', delay: 0.1 });
        }
      });
    });
  }

  private setupMagneticButtons(): void {
    const btns = this.host.nativeElement.querySelectorAll('.hire-btn') as NodeListOf<HTMLElement>;

    btns.forEach((btn) => {
      const move = (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.24, y: y * 0.24, duration: 0.35, ease: 'power2.out' });
      };

      const reset = () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.4)' });
      };

      btn.addEventListener('mousemove', move);
      btn.addEventListener('mouseleave', reset);

      this.hoverCleanupFns.push(() => {
        btn.removeEventListener('mousemove', move);
        btn.removeEventListener('mouseleave', reset);
      });
    });
  }

  private setupAboutCardGlow(): void {
    if (window.matchMedia('(hover: none)').matches) return;

    const cards = this.host.nativeElement.querySelectorAll(
      '.about-stat-card, .service-card'
    ) as NodeListOf<HTMLElement>;

    cards.forEach((card) => {
      const move = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', `${x}%`);
        card.style.setProperty('--my', `${y}%`);
      };

      card.addEventListener('mousemove', move);
      this.hoverCleanupFns.push(() => card.removeEventListener('mousemove', move));
    });
  }

  private setupCursorGlow(): void {
    const glow = document.querySelector('.cursor-glow') as HTMLElement | null;
    if (!glow || window.matchMedia('(hover: none)').matches) return;

    const onMove = (e: MouseEvent) => {
      gsap.to(glow, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.7,
        ease: 'power2.out'
      });
    };

    document.addEventListener('mousemove', onMove);
    this.hoverCleanupFns.push(() => document.removeEventListener('mousemove', onMove));
  }

  private setupStickyNav(): void {
    this.ngZone.runOutsideAngular(() => {
      this.navScrollListener = () => {
        const scrolled = window.scrollY > 80;
        if (scrolled !== this.isScrolled) {
          this.ngZone.run(() => { this.isScrolled = scrolled; });
        }
      };
      window.addEventListener('scroll', this.navScrollListener, { passive: true });
    });
  }

  private setupActiveSectionTracking(): void {
    const sectionIds = ['home', 'about', 'projects', 'experience', 'recommendations', 'contact'];

    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.ngZone.run(() => { this.activeSection = entry.target.id; });
          }
        });
      },
      { rootMargin: '-15% 0px -65% 0px', threshold: 0 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) this.sectionObserver!.observe(el);
    });
  }
}
