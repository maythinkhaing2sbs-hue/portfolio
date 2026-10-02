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
  styleUrls: ['./app.scss', './nav.scss', './hero.scss', './sections.scss', './closing.scss']
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
  menuOpen = false;
  emailCopied = false;
  activeSection = 'home';
  activeTestimonial = 0;
  activeProjectIndex = 0;

  readonly preloaderWords = ['May', 'Thin', 'Khaing'];
  readonly greetings = ['Hello!', 'Welcome'];

  /**
   * "UI/UX Designer" split into letters; `i` is the running index used to stagger effects.
   * Each letter leans a few degrees (`r`) and sits a hair up or down (`y`, em) — playful, but
   * kept small and on one baseline so the words still read at a glance.
   */
  readonly roleWords = (() => {
    const tilt = [-5, 4, 3, -4, 5, -5, 3, -4, 4, -3, 5, -4, 4];
    let i = 0;
    return ['UI/UX', 'Designer'].map((word) =>
      word.split('').map((ch) => ({ ch, r: tilt[i], y: i % 2 ? 0.025 : -0.025, i: i++ }))
    );
  })();

  private readonly yangonFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Yangon', hour: '2-digit', minute: '2-digit' });
  yangonTime = this.yangonFormat.format(new Date());
  private clockTimer?: number;

  readonly navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Work' },
    { id: 'experience', label: 'Experience' },
    { id: 'recommendations', label: 'Reviews' },
    { id: 'contact', label: 'Contact' }
  ];

  readonly aboutMeta = [
    {
      label: 'Based in',
      value: 'Yangon, Myanmar',
      accent: '#ff6b2b',
      paths: ['M12 21s-7-7.1-7-12a7 7 0 1 1 14 0c0 4.9-7 12-7 12z', 'M12 6.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2z']
    },
    {
      label: 'Languages',
      value: 'English, Burmese',
      accent: '#4aa3ff',
      paths: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M3 12h18', 'M12 3a14 14 0 0 1 0 18', 'M12 3a14 14 0 0 0 0 18']
    },
    {
      label: 'Currently',
      value: 'Systematic Solution',
      accent: '#22c55e',
      paths: ['M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z', 'M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M3 13h18']
    },
    {
      label: 'Focus',
      value: 'Product · Brand',
      accent: '#a78bfa',
      paths: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z', 'M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2z']
    }
  ];

  readonly aboutStats = [
    { value: '2', label: 'Years' },
    { value: '50', label: 'Projects' },
    { value: '40', label: 'Clients' }
  ];

  readonly services = [
    {
      title: 'UI Design',
      paths: ['M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M3 9h18', 'M9 20V9'],
      description: 'Clean, expressive interfaces with strong hierarchy, confident typography and pixel-level polish.',
      tags: ['Web apps', 'Dashboards', 'Visual design']
    },
    {
      title: 'UX Research',
      paths: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z', 'M21 21l-5-5', 'M8.5 11.5l1.8 1.8 3.4-3.6'],
      description: 'Interviews, usability testing and journey mapping that turn assumptions into evidence.',
      tags: ['Interviews', 'Usability', 'Journeys']
    },
    {
      title: 'Prototyping',
      paths: ['M4 4l7 17 2.5-7.5L21 11z', 'M14 14l6 6'],
      description: 'High-fidelity, interactive prototypes that let teams feel the product before it is built.',
      tags: ['Figma', 'Interactions', 'User flows']
    },
    {
      title: 'Design Systems',
      paths: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M17 14v6', 'M14 17h6'],
      description: 'Scalable component libraries and tokens that keep teams consistent and shipping faster.',
      tags: ['Components', 'Tokens', 'Docs']
    },
    {
      title: 'Mobile Design',
      paths: ['M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z', 'M11 18h2'],
      description: 'Native-feeling iOS and Android experiences designed for thumbs, not cursors.',
      tags: ['iOS', 'Android', 'Responsive']
    },
    {
      title: 'AI Prompt Engineering',
      paths: ['M12 3l1.8 4.9L19 9.7l-5.2 1.8L12 16.4l-1.8-4.9L5 9.7l5.2-1.8z', 'M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z'],
      description: 'Using AI thoughtfully to speed up research, content and ideation without losing the craft.',
      tags: ['Claude', 'Workflows', 'Ideation']
    }
  ];

  readonly skillShowcase = [
    {
      name: 'Figma',
      icon: 'icons/figma.svg'
    },
    {
      name: 'Framer',
      icon: 'icons/framer.svg'
    },
    {
      name: 'Notion',
      icon: 'icons/notion.svg'
    },
    {
      name: 'Canva',
      icon: 'icons/canva.svg'
    },
    {
      name: 'Claude AI',
      icon: 'icons/claude.svg'
    },
    {
      name: 'WordPress',
      icon: 'icons/wordpress.svg'
    },
    {
      name: 'Hostinger',
      icon: 'icons/hostinger.svg'
    },
    {
      name: 'VS Code',
      icon: 'icons/vscode.svg'
    },
    {
      name: 'Angular',
      icon: 'icons/angular.svg'
    }
  ];

  readonly timeline = [
    {
      period: '2025 - Present',
      start: '2025',
      end: 'Present',
      title: 'Mid UI/UX Designer',
      company: 'Systematic Business Solution Co., Ltd · Yangon',
      accent: '#ff6b2b',
      description: 'Designed intuitive user experiences and modern interfaces, collaborated closely with developers, ran usability tests and delivered visually engaging digital products.',
      tags: ['Design systems', 'User experience', 'Web · Mobile']
    },
    {
      period: '2024 - 2025',
      start: '2024',
      end: '2025',
      title: 'Junior UI/UX Designer',
      company: 'Systematic Business Solution Co., Ltd · Yangon',
      accent: '#4aa3ff',
      description: 'Created wireframes, user flows and interactive prototypes, conducted research, improved usability and supported senior designers across multiple projects.',
      tags: ['Wireframing', 'User flows', 'Mobile design']
    },
    {
      period: '2023 - 2024',
      start: '2023',
      end: '2024',
      title: 'Web Developer',
      company: 'Brycen Myanmar Co., Ltd',
      accent: '#8b5cf6',
      description: 'Developed HR products with Laravel, integrated backend features, fixed bugs and improved system performance.',
      tags: ['Laravel', 'API integration', 'MySQL']
    }
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

  readonly testimonials = [
    {
      name: 'Hnin Cherry',
      role: 'Senior UI/UX Designer',
      accent: '#ff6b2b',
      quote: "May is one of the most thoughtful designers I've worked with. She always asks the right questions before she starts, and her designs are clean, clear and easy to use. She makes the whole team better."
    },
    {
      name: 'Hpone Pyae Ko Ko',
      role: 'UI/UX Designer',
      accent: '#4aa3ff',
      quote: 'Working with May is easy. She explains her ideas clearly, listens to feedback without ego, and her Figma files are so well organised that anyone on the team can pick them up.'
    },
    {
      name: 'Khoon Sett Hein',
      role: 'Backend Developer',
      accent: '#22c55e',
      quote: 'As a developer, I really appreciate how May hands off her work. Every screen comes with clear specs and edge cases, so we spend less time guessing and more time building.'
    },
    {
      name: 'Phyu Phyu May Maung',
      role: 'Full Stack Developer',
      accent: '#a78bfa',
      quote: 'May cares about the small details that users actually notice. She replies quickly, stays calm when plans change, and always delivers on time.'
    }
  ].map((item) => ({
    ...item,
    words: item.quote.split(' '),
    initials: item.name.split(' ').map((part) => part[0]).slice(0, 2).join('')
  }));

  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);

    this.gsapContext = gsap.context(() => {
      this.setupSectionEntranceAnimations();
      this.setupHeroIntro();
      this.setupHeroScrollParallax();
      this.setupSectionTitleAnimations();
      this.setupAboutAnimations();
      this.setupServiceAnimations();
      this.setupExperienceAnimations();
      this.setupClosingAnimations();
    }, this.host.nativeElement);

    this.setupHoverEffects();
    this.setupSkillRibbonAnimation();
    this.setupProjectShowcaseAnimation();
    this.setupScrollProgress();
    this.setupMagneticButtons();
    this.setupCursorGlow();
    this.setupCustomCursor();
    this.setupStickyNav();
    this.setupActiveSectionTracking();
    this.setupHeroMouseParallax();
    this.setupServiceSpotlight();
    this.setupProofCard();
    this.setupAboutTilt();
    this.setupTimelineProgress();
    this.setupProjectLinkAnimation();

    // Triggers were created in code order, not page order; re-sort so pin spacing from the
    // project showcase is accounted for, and re-measure once web fonts have settled.
    this.startYangonClock();

    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
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

  private setupTimelineProgress(): void {
    const progress = this.host.nativeElement.querySelector('.timeline-progress') as HTMLElement | null;
    const timeline = this.host.nativeElement.querySelector('.experience-timeline') as HTMLElement | null;
    if (!progress || !timeline) return;

    const items = Array.from(timeline.querySelectorAll('.timeline-item')) as HTMLElement[];

    ScrollTrigger.create({
      trigger: timeline,
      start: 'top 70%',
      end: 'bottom 75%',
      scrub: 0.6,
      onUpdate: (self) => {
        progress.style.setProperty('--progress', String(self.progress));

        // Light each role up once the rail's fill has reached its node
        const filled = self.progress * timeline.offsetHeight;
        items.forEach((item) => item.classList.toggle('is-reached', item.offsetTop + 24 <= filled));
      }
    });
  }

  /**
   * Preloader → staged hero entrance. The hero timeline is built paused up front so every
   * element sits in its hidden start state underneath the preloader, then plays once the
   * preloader has finished and the portrait has loaded.
   */
  private setupHeroIntro(): void {
    const root = this.host.nativeElement as HTMLElement;
    const hero = root.querySelector('.hero') as HTMLElement | null;
    const preloader = root.querySelector('.preloader') as HTMLElement | null;
    if (!hero) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (preloader) preloader.style.display = 'none';
      return;
    }

    const q = gsap.utils.selector(hero);

    const heroTl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    heroTl
      .from(q('.hero-bg'), { autoAlpha: 0, duration: 1.6, ease: 'power2.out' }, 0)
      .from(q('.line-greeting .line-inner'), { yPercent: 115, rotate: 3, duration: 1.4 }, 0.18)
      .from(q('.rc'), {
        yPercent: 120,
        rotateX: -80,
        transformOrigin: '50% 100%',
        duration: 1.1,
        stagger: 0.035,
        clearProps: 'transform'
      }, 0.3)
      .add(() => {
        // idle: once the letters have landed, a slow, shallow wave rolls through them one by one —
        // small enough that the word stays easy to read.
        // Uses `transform`, so it never fights the hover lift on `translate`.
        this.gsapContext?.add(() => {
          gsap.to(q('.rc'), {
            yPercent: -4,
            duration: 2,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            stagger: 0.14
          });
        });
      }, 2.3)
      .from(q('.hero-arch'), { yPercent: 60, autoAlpha: 0, duration: 2, ease: 'expo.out' }, 0.55)
      .from(q('.hero-halo'), { scale: 0.3, autoAlpha: 0, duration: 2.2 }, 0.7)
      .fromTo(
        q('.hero-portrait, .hero-sheen'),
        { yPercent: 105, scale: 1.12, transformOrigin: '50% 100%' },
        { yPercent: 0, scale: 1, duration: 2.4, ease: 'expo.out' },
        0.75
      )
      .add(() => {
        // idle: a slow breathing float once the entrance has settled
        this.gsapContext?.add(() => {
          gsap.to(q('.hero-portrait, .hero-sheen'), { y: -10, scale: 1.012, duration: 3.2, ease: 'sine.inOut', repeat: -1, yoyo: true });
        });
      }, 3.2)
      .fromTo(
        q('.highlight-mark'),
        { clipPath: 'inset(0% 100% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.inOut' },
        1.0
      )
      .from(q('.highlight-spark'), { autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, 1.75)
      .from(root.querySelector('.site-nav'), { y: -30, autoAlpha: 0, duration: 1.1 }, 0.5)
      // the proof card's glass shell fades in together with its content, so it is never seen empty.
      // Opacity only: the card's `transform` belongs to the CSS cursor tilt (see hero.scss).
      .from(q('.hero-proof'), { autoAlpha: 0, duration: 0.9, ease: 'power2.out' }, 1.05)
      .from(q('.hero-intro > *, .hero-proof > *'), { y: 30, autoAlpha: 0, duration: 1, stagger: 0.08 }, 1.05);


    (q('.hero-count') as HTMLElement[]).forEach((el) => {
      const target = parseInt(el.dataset['count'] ?? '0', 10);
      const suffix = el.dataset['suffix'] ?? '';
      const counter = { value: 0 };
      el.textContent = `0${suffix}`;
      heroTl.to(counter, {
        value: target,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = `${Math.round(counter.value)}${suffix}`;
        }
      }, 1.2);
    });

    const portrait = q('.hero-portrait')[0] as HTMLImageElement | undefined;
    const imageReady = new Promise<void>((resolve) => {
      if (!portrait || portrait.complete) {
        resolve();
        return;
      }
      portrait.addEventListener('load', () => resolve(), { once: true });
      portrait.addEventListener('error', () => resolve(), { once: true });
      window.setTimeout(resolve, 4000);
    });

    let preloaderDone = Promise.resolve();
    if (preloader) {
      const pq = gsap.utils.selector(preloader);

      preloaderDone = new Promise<void>((resolve) => {
        const tl = gsap.timeline({ onComplete: resolve });

        // 1. Greetings cross-fade, Apple "hello" style
        tl.from(pq('.splash-aurora'), { autoAlpha: 0, scale: 1.2, duration: 1.6, ease: 'power2.out' }, 0);
        (pq('.splash-hello') as HTMLElement[]).forEach((el, i) => {
          const at = 0.2 + i * 0.85;
          tl.fromTo(el,
            { autoAlpha: 0, y: 40, scale: 0.94 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: 'expo.out' }, at)
            .to(el, { autoAlpha: 0, y: -40, scale: 1.04, duration: 0.6, ease: 'power2.inOut' }, at + 0.65);
        });

        // 2. The name: outline first, then the fill pours through in step with the loading bar
        tl.addLabel('name', 2.05)
          .from(pq('.pl-char'), { y: 40, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.035 }, 'name')
          .from(pq('.preloader-bar'), { scaleX: 0, autoAlpha: 0, duration: 0.6, ease: 'power2.out' }, 'name+=0.2')
          .from(pq('.preloader-caption'), { y: 10, autoAlpha: 0, duration: 0.6, ease: 'power2.out' }, 'name+=0.3')
          .to(pq('.preloader-bar span'), { scaleX: 1, duration: 1.5, ease: 'none' }, 'name+=0.45')
          .to(pq('.pl-char'), { backgroundPosition: '0% 0', duration: 0.3, ease: 'none', stagger: 0.1 }, 'name+=0.45');
      });
    }

    Promise.all([imageReady, preloaderDone]).then(() => {
      this.gsapContext?.add(() => {
        if (!preloader) {
          heroTl.play();
          return;
        }

        // 3. Hand over to the home page. Kept deliberately light — only opacity and small
        //    transforms, one thing at a time — so it stays smooth on slower machines: the camera
        //    flies through the name, the splash dissolves, and only then does the hero start building.
        const pq = gsap.utils.selector(preloader);
        gsap.timeline({ onComplete: () => { preloader.style.display = 'none'; } })
          .to(pq('.preloader-bar, .preloader-caption'), { autoAlpha: 0, duration: 0.4, ease: 'power2.out' }, 0)
          // fly through the name: .preloader-brand has will-change: transform, so the browser scales
          // its cached layer on the GPU instead of re-drawing the outlined text every frame
          .to(pq('.preloader-brand'), { scale: 10, duration: 1.25, ease: 'power3.in', force3D: true }, 0.1)
          .to(pq('.preloader-brand'), { autoAlpha: 0, duration: 0.45, ease: 'power1.in' }, 0.9)
          .to(preloader, { autoAlpha: 0, duration: 0.9, ease: 'power2.inOut' }, 0.95)
          .call(() => { heroTl.play(); }, [], 1.3);
      });
    });
  }

  private setupHeroScrollParallax(): void {
    const hero = this.host.nativeElement.querySelector('.hero') as HTMLElement | null;
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const q = gsap.utils.selector(hero);
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8
      }
    });

    // Transform the inner wrapper only: .hero-figure must stay free of transforms so its
    // layers can interleave with the headline (see hero.scss).
    scrollTl.to(q('.hero-portrait-wrap'), { y: 90, scale: 1.05, transformOrigin: '50% 100%', ease: 'none' }, 0);

    if (window.matchMedia('(min-width: 1080px)').matches) {
      scrollTl
        .to(q('.hero-head'), { yPercent: -40, autoAlpha: 0.15, ease: 'none' }, 0)
        .to(q('.hero-foot'), { y: -40, autoAlpha: 0, ease: 'none' }, 0);
    }
  }

  private setupHeroMouseParallax(): void {
    const hero = this.host.nativeElement.querySelector('.hero') as HTMLElement | null;
    if (!hero || window.matchMedia('(hover: none)').matches) return;

    const layers = Array.from(hero.querySelectorAll<HTMLElement>('[data-depth]')).map((el) => ({
      depth: parseFloat(el.dataset['depth'] ?? '0'),
      x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3.out' })
    }));

    const onMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      layers.forEach((layer) => {
        layer.x(nx * layer.depth);
        layer.y(ny * layer.depth);
      });
    };

    const onLeave = () => {
      layers.forEach((layer) => {
        layer.x(0);
        layer.y(0);
      });
    };

    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);

    this.hoverCleanupFns.push(() => {
      hero.removeEventListener('mousemove', onMove);
      hero.removeEventListener('mouseleave', onLeave);
    });
  }

  ngOnDestroy(): void {
    window.clearInterval(this.clockTimer);
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

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Masked line reveal for every `.section-title`, with its eyebrow rule drawing in. */
  private setupSectionTitleAnimations(): void {
    if (this.prefersReducedMotion()) return;

    const titles = this.host.nativeElement.querySelectorAll('.section-title') as NodeListOf<HTMLElement>;
    titles.forEach((title) => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: title, start: 'top 85%', once: true },
        defaults: { ease: 'expo.out' }
      });

      const eyebrow = title.previousElementSibling as HTMLElement | null;
      if (eyebrow?.classList.contains('section-eyebrow')) {
        tl.from(eyebrow, { x: -14, autoAlpha: 0, duration: 0.9 }, 0)
          .from(eyebrow.querySelector('.eyebrow-line'), { scaleX: 0, duration: 1.1 }, 0.1);
      }

      tl.from(title.querySelectorAll('.title-line'), { yPercent: 115, rotate: 2, duration: 1.3, stagger: 0.12 }, 0.1);
    });
  }

  private setupAboutAnimations(): void {
    const about = this.host.nativeElement.querySelector('.about') as HTMLElement | null;
    if (!about || this.prefersReducedMotion()) return;

    const q = gsap.utils.selector(about);

    // The image floats via CSS and tilts via .about-tilt, so the entrance animates other layers
    gsap.timeline({ scrollTrigger: { trigger: about, start: 'top 72%', once: true }, defaults: { ease: 'expo.out' } })
      .from(q('.about-glow'), { scale: 0.2, autoAlpha: 0, duration: 1.8 })
      .from(q('.about-visual'), { y: 90, autoAlpha: 0, duration: 1.6 }, 0.1)
      .from(q('.about-tilt'), { scale: 0.7, rotate: -8, duration: 1.8, ease: 'elastic.out(1, 0.75)' }, 0.2)
      .from(q('.about-spark'), { scale: 0, duration: 0.8, ease: 'back.out(3)', stagger: 0.15 }, 0.9);

    // Statement lights up word by word as it scrolls through the viewport
    const statement = q('.about-statement')[0] as HTMLElement | undefined;
    if (statement) {
      this.splitWords(statement);
      gsap.fromTo(statement.querySelectorAll('.word'), { opacity: 0.15 }, {
        opacity: 1,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: { trigger: statement, start: 'top 82%', end: 'bottom 50%', scrub: 0.6 }
      });
    }

    const statsTl = gsap.timeline({ scrollTrigger: { trigger: q('.about-stats')[0], start: 'top 85%', once: true } })
      .from(q('.about-stat, .about-actions'), { y: 36, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: 0.1 })
      .from(q('.stat-plus'), { scale: 0, rotate: -90, duration: 0.6, ease: 'back.out(3)', stagger: 0.12 }, 1.3);

    (q('.stat-count') as HTMLElement[]).forEach((el, i) => {
      const target = parseInt(el.dataset['count'] ?? '0', 10);
      const counter = { value: 0 };
      el.textContent = '0';
      statsTl.to(counter, {
        value: target,
        duration: 1.8,
        ease: 'power3.out',
        onUpdate: () => {
          el.textContent = String(Math.round(counter.value));
        }
      }, 0.15 + i * 0.1);
    });

    gsap.timeline({ scrollTrigger: { trigger: q('.about-meta')[0], start: 'top 88%', once: true } })
      .from(q('.about-meta-item'), { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.1 })
      .from(q('.meta-icon'), { scale: 0, rotate: -60, duration: 0.9, ease: 'back.out(2.5)', stagger: 0.1 }, 0.15)
      .from(q('.meta-underline'), { scaleX: 0, transformOrigin: 'left center', duration: 0.8, ease: 'expo.out', stagger: 0.1 }, 0.4);
  }

  /** The About illustration leans toward the cursor in 3D. */
  private setupAboutTilt(): void {
    const visual = this.host.nativeElement.querySelector('.about-visual') as HTMLElement | null;
    const tilt = visual?.querySelector('.about-tilt') as HTMLElement | null;
    if (!visual || !tilt || window.matchMedia('(hover: none)').matches || this.prefersReducedMotion()) return;

    gsap.set(tilt, { transformPerspective: 900 });
    const rotateX = gsap.quickTo(tilt, 'rotationX', { duration: 0.9, ease: 'power3.out' });
    const rotateY = gsap.quickTo(tilt, 'rotationY', { duration: 0.9, ease: 'power3.out' });

    const onMove = (e: MouseEvent) => {
      const rect = visual.getBoundingClientRect();
      rotateY(((e.clientX - rect.left) / rect.width - 0.5) * 16);
      rotateX(-((e.clientY - rect.top) / rect.height - 0.5) * 12);
    };
    const onLeave = () => {
      rotateX(0);
      rotateY(0);
    };

    visual.addEventListener('mousemove', onMove);
    visual.addEventListener('mouseleave', onLeave);
    this.hoverCleanupFns.push(() => {
      visual.removeEventListener('mousemove', onMove);
      visual.removeEventListener('mouseleave', onLeave);
    });
  }

  /** Wraps each word of an element's direct text in `.word` spans; inline children become one word each. */
  private splitWords(el: HTMLElement): void {
    const toWords = (text: string) => {
      const frag = document.createDocumentFragment();
      text.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.append(' ');
          return;
        }
        const word = document.createElement('span');
        word.className = 'word';
        word.textContent = part;
        frag.append(word);
      });
      return frag;
    };

    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.replaceWith(toWords(node.textContent ?? ''));
      } else if (node instanceof HTMLElement) {
        node.classList.add('word');
      }
    });
  }

  private setupServiceAnimations(): void {
    const services = this.host.nativeElement.querySelector('.services') as HTMLElement | null;
    if (!services || this.prefersReducedMotion()) return;

    const q = gsap.utils.selector(services);
    gsap.timeline({ scrollTrigger: { trigger: q('.service-grid')[0], start: 'top 80%', once: true } })
      .from(q('.services-intro'), { y: 24, autoAlpha: 0, duration: 1, ease: 'power3.out' })
      .from(q('.service-cell'), {
        y: 40,
        autoAlpha: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: { each: 0.08, grid: 'auto', from: 'start' }
      }, 0.1)
      .fromTo(q('.service-icon path'), { strokeDashoffset: 1 }, {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: 'power2.inOut',
        stagger: 0.04,
        clearProps: 'strokeDashoffset'
      }, 0.4);
  }

  /** The hero proof card leans toward the cursor in 3D and carries a spotlight under it (see hero.scss). */
  private setupProofCard(): void {
    const card = this.host.nativeElement.querySelector('.hero-proof') as HTMLElement | null;
    if (!card || window.matchMedia('(hover: none)').matches || this.prefersReducedMotion()) return;

    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
      card.style.setProperty('--ry', `${(px - 0.5) * 14}deg`);
      card.style.setProperty('--rx', `${-(py - 0.5) * 12}deg`);
    };
    const onLeave = () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    };

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    this.hoverCleanupFns.push(() => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
    });
  }

  /** Soft light that follows the cursor inside each service cell. */
  private setupServiceSpotlight(): void {
    if (window.matchMedia('(hover: none)').matches) return;

    const cells = this.host.nativeElement.querySelectorAll('.service-cell') as NodeListOf<HTMLElement>;
    cells.forEach((cell) => {
      const move = (e: MouseEvent) => {
        const rect = cell.getBoundingClientRect();
        cell.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        cell.style.setProperty('--my', `${e.clientY - rect.top}px`);
      };
      cell.addEventListener('mousemove', move);
      this.hoverCleanupFns.push(() => cell.removeEventListener('mousemove', move));
    });
  }

  private setupExperienceAnimations(): void {
    const experience = this.host.nativeElement.querySelector('.experience') as HTMLElement | null;
    if (!experience) return;

    if (this.prefersReducedMotion()) return;

    const items = experience.querySelectorAll('.timeline-item') as NodeListOf<HTMLElement>;

    gsap.from(experience.querySelector('.experience-timeline'), {
      y: 60,
      scale: 0.97,
      autoAlpha: 0,
      duration: 1.3,
      ease: 'expo.out',
      scrollTrigger: { trigger: experience.querySelector('.experience-timeline'), start: 'top 88%', once: true }
    });

    gsap.from(experience.querySelector('.experience-intro'), {
      y: 24,
      autoAlpha: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: experience, start: 'top 75%', once: true }
    });

    items.forEach((item) => {
      const iq = gsap.utils.selector(item);
      gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 85%', once: true }, defaults: { ease: 'expo.out' } })
        .from(iq('.timeline-when'), { x: -40, autoAlpha: 0, duration: 1.1 })
        .from(iq('.timeline-node'), { scale: 0, duration: 0.8, ease: 'back.out(2.5)' }, 0.1)
        .from(iq('.timeline-body > *'), { x: 40, autoAlpha: 0, duration: 1, stagger: 0.07 }, 0.15);
    });
  }

  private setupClosingAnimations(): void {
    if (this.prefersReducedMotion()) return;
    const root = this.host.nativeElement as HTMLElement;

    const testi = root.querySelector('.recommendations') as HTMLElement | null;
    if (testi) {
      const q = gsap.utils.selector(testi);
      gsap.timeline({ scrollTrigger: { trigger: testi, start: 'top 70%', once: true }, defaults: { ease: 'expo.out' } })
        .from(q('.testi-rating'), { y: 30, autoAlpha: 0, duration: 1 })
        .from(q('.testi-mark'), { scale: 0.4, rotate: -20, autoAlpha: 0, duration: 1.2 }, 0.1)
        .from(q('.testi-people'), { autoAlpha: 0, duration: 0.8 }, 0.3)
        .from(q('.testi-person'), { y: 30, duration: 0.9, stagger: 0.08 }, 0.3);
    }

    const contact = root.querySelector('.contact') as HTMLElement | null;
    if (contact) {
      const q = gsap.utils.selector(contact);
      gsap.timeline({ scrollTrigger: { trigger: contact, start: 'top 70%', once: true }, defaults: { ease: 'expo.out' } })
        .from(q('.contact-lead'), { y: 24, autoAlpha: 0, duration: 1 }, 0.3)
        .from(q('.contact-line'), { x: -30, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 0.4)
        .from(q('.cta-panel'), { y: 60, scale: 0.96, autoAlpha: 0, duration: 1.3 }, 0.3)
        .from(q('.cta-top, .cta-profile, .cta-pitch, .cta-primary, .cta-secondary'), { y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.6)
        .from(q('.site-footer'), { y: 20, autoAlpha: 0, duration: 0.9 }, 0.8);

      // Marquee drifts with scroll on top of its CSS loop
      gsap.fromTo(q('.contact-marquee'), { xPercent: 4 }, {
        xPercent: -4,
        ease: 'none',
        scrollTrigger: { trigger: contact, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }
  }

  private startYangonClock(): void {
    const tick = () => { this.yangonTime = this.yangonFormat.format(new Date()); };

    this.ngZone.runOutsideAngular(() => {
      this.clockTimer = window.setInterval(() => this.ngZone.run(tick), 30_000);
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    document.documentElement.style.overflow = this.menuOpen ? 'hidden' : '';
  }

  closeMenu(): void {
    if (!this.menuOpen) return;
    this.menuOpen = false;
    document.documentElement.style.overflow = '';
  }

  moveNavIndicator(event: MouseEvent): void {
    this.placeNavIndicator(event.currentTarget as HTMLElement);
  }

  resetNavIndicator(): void {
    const active = this.host.nativeElement.querySelector(
      `.nav-link[data-section="${this.activeSection}"]`
    ) as HTMLElement | null;
    this.placeNavIndicator(active);
  }

  /** Slides the pill behind the nav links to sit under the given link. */
  private placeNavIndicator(link: HTMLElement | null): void {
    const indicator = this.host.nativeElement.querySelector('.nav-indicator') as HTMLElement | null;
    if (!indicator || !link) return;

    gsap.to(indicator, {
      x: link.offsetLeft,
      width: link.offsetWidth,
      autoAlpha: 1,
      duration: 0.5,
      ease: 'power3.out'
    });
  }

  selectTestimonial(index: number): void {
    this.activeTestimonial = index;
  }

  /** Fired when the active person's progress bar completes. */
  nextTestimonial(): void {
    this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
  }

  copyEmail(): void {
    navigator.clipboard?.writeText('mtkhaing.psn17@gmail.com').then(() => {
      this.emailCopied = true;
      window.setTimeout(() => this.ngZone.run(() => { this.emailCopied = false; }), 2000);
    });
  }

  private setupSectionEntranceAnimations(): void {
    if (this.prefersReducedMotion()) return;

    const groups = [
      { root: '.skill-ribbon', targets: '.ribbon-item', start: 'top 88%', y: 20 },
      { root: '.project-showcase', targets: '.showcase-head, .showcase-stack', start: 'top 76%', y: 46 },
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

  private setupMagneticButtons(): void {
    const btns = this.host.nativeElement.querySelectorAll('.nav-cta') as NodeListOf<HTMLElement>;

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

  private setupCustomCursor(): void {
    const arrow = document.querySelector('.cursor-arrow') as HTMLElement | null;
    if (!arrow || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const root = document.documentElement;
    const interactive = 'a, button, [role="tab"], label, input, textarea';

    const onMove = (e: MouseEvent) => {
      // written directly, with no tween, so the arrow never lags behind the real pointer
      arrow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (!arrow.classList.contains('is-visible')) {
        // hide the native cursor only once ours is actually on screen
        arrow.classList.add('is-visible');
        root.classList.add('has-custom-cursor');
      }
    };
    const onOver = (e: MouseEvent) => {
      arrow.classList.toggle('is-hover', !!(e.target as Element | null)?.closest?.(interactive));
    };
    const onDown = () => arrow.classList.add('is-down');
    const onUp = () => arrow.classList.remove('is-down');
    const onLeave = () => arrow.classList.remove('is-visible');

    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('mousemove', onMove, { passive: true });
      document.addEventListener('mouseover', onOver, { passive: true });
      document.addEventListener('mousedown', onDown);
      document.addEventListener('mouseup', onUp);
      root.addEventListener('mouseleave', onLeave);
    });

    this.hoverCleanupFns.push(() => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      root.removeEventListener('mouseleave', onLeave);
      root.classList.remove('has-custom-cursor');
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
            this.resetNavIndicator();
          }
        });
      },
      { rootMargin: '-15% 0px -65% 0px', threshold: 0 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) this.sectionObserver!.observe(el);
    });

    // Initial placement once fonts have given the links their final widths
    document.fonts?.ready.then(() => this.resetNavIndicator());
  }
}
