export const products = [
  {
    id: 'school-erp',
    name: 'NovaScholar ERP',
    tagline: 'AI-powered School Management ERP',
    category: 'ERP Solutions',
    accent: '#00f0ff',
    glyph: '01',
    description:
      'A complete academic operating system — admissions, attendance, fee management, transport, examinations, parent communication, and AI-driven analytics for every school.',
    highlights: [
      'Real-time attendance via biometric & RFID',
      'Online admissions with intelligent shortlisting',
      'Automated fee collection with reminders',
      'Parent & teacher mobile apps',
      'AI grading insights and report cards',
    ],
    tech: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'AWS'],
    plans: [
      { name: 'Starter', price: 4999, period: 'mo', users: 'Up to 500 students' },
      { name: 'Growth', price: 9999, period: 'mo', users: 'Up to 2,000 students', featured: true },
      { name: 'Enterprise', price: 'Custom', period: '', users: 'Unlimited' },
    ],
  },
  {
    id: 'apartment-erp',
    name: 'Habitat ERP',
    tagline: 'Smart Apartment & Community Management',
    category: 'ERP Solutions',
    accent: '#b537ff',
    glyph: '02',
    description:
      'Run an entire residential community from one futuristic dashboard — society billing, visitor management, complaints, amenities booking, security gate pass, and resident communication.',
    highlights: [
      'Maintenance billing & online payments',
      'Visitor pre-approval and QR gate pass',
      'Amenities booking with smart scheduling',
      'Complaints & helpdesk workflow',
      'Society announcements & polls',
    ],
    tech: ['React Native', 'Node.js', 'MongoDB', 'Razorpay'],
    plans: [
      { name: 'Basic', price: 2499, period: 'mo', users: 'Up to 100 flats' },
      { name: 'Pro', price: 5999, period: 'mo', users: 'Up to 500 flats', featured: true },
      { name: 'Enterprise', price: 'Custom', period: '', users: 'Unlimited towers' },
    ],
  },
  {
    id: 'ecommerce',
    name: 'Pulse Commerce',
    tagline: 'Next-Gen E-commerce Platform',
    category: 'E-commerce Solutions',
    accent: '#39ff14',
    glyph: '03',
    description:
      'Launch a blazing-fast storefront in days. Pulse Commerce blends a headless backend with AI-powered merchandising, omnichannel inventory, and built-in marketing automation.',
    highlights: [
      'Drag-and-drop storefront builder',
      'AI product recommendations',
      'Multi-channel inventory sync',
      'Built-in marketing automation',
      'Integrated payments & shipping',
    ],
    tech: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe'],
    plans: [
      { name: 'Launch', price: 3499, period: 'mo', users: 'Up to 1,000 SKUs' },
      { name: 'Scale', price: 8999, period: 'mo', users: 'Up to 10,000 SKUs', featured: true },
      { name: 'Enterprise', price: 'Custom', period: '', users: 'Unlimited' },
    ],
  },
  {
    id: 'crm',
    name: 'Orbit CRM',
    tagline: 'Customer Relationship Intelligence',
    category: 'CRM Software',
    accent: '#ff2bd1',
    glyph: '04',
    description:
      'A futuristic CRM with a single, unified customer timeline. Capture leads, automate follow-ups, score opportunities with AI, and close more deals — beautifully.',
    highlights: [
      'Unified customer 360° timeline',
      'AI lead scoring & pipeline forecasting',
      'WhatsApp, Email & SMS automation',
      'Quote, invoice and contract workflow',
      'Mobile field-sales companion',
    ],
    tech: ['React', 'Node.js', 'PostgreSQL', 'OpenAI'],
    plans: [
      { name: 'Solo', price: 999, period: 'user/mo', users: '1 seat' },
      { name: 'Team', price: 2499, period: 'user/mo', users: '5+ seats', featured: true },
      { name: 'Enterprise', price: 'Custom', period: '', users: 'Unlimited' },
    ],
  },
  {
    id: 'inventory',
    name: 'Vector Inventory',
    tagline: 'Inventory & Warehouse Intelligence',
    category: 'ERP Solutions',
    accent: '#3a8dff',
    glyph: '05',
    description:
      'Track every SKU in real time across warehouses, stores and channels. Forecast demand with ML, automate purchase orders, and never run out of stock again.',
    highlights: [
      'Multi-warehouse tracking',
      'Barcode & QR scanning',
      'Auto-reorder with ML demand forecasts',
      'Supplier and PO management',
      'Real-time stock dashboards',
    ],
    tech: ['React', 'Node.js', 'TimescaleDB', 'TensorFlow'],
    plans: [
      { name: 'Starter', price: 1999, period: 'mo', users: '1 warehouse' },
      { name: 'Growth', price: 4999, period: 'mo', users: '5 warehouses', featured: true },
      { name: 'Enterprise', price: 'Custom', period: '', users: 'Unlimited' },
    ],
  },
  {
    id: 'billing-pos',
    name: 'Flux POS',
    tagline: 'Billing & Point-of-Sale Suite',
    category: 'POS & Billing Systems',
    accent: '#ffb627',
    glyph: '06',
    description:
      'Lightning-fast billing for retail, F&B and services. Offline-first POS, GST-ready invoicing, loyalty programs, and a beautiful tablet interface your cashiers will love.',
    highlights: [
      'Offline-first POS with auto-sync',
      'GST & e-invoice compliance',
      'Loyalty, gift cards & coupons',
      'Kitchen display & order management',
      'Multi-store and franchise mode',
    ],
    tech: ['React', 'Electron', 'SQLite', 'Node.js'],
    plans: [
      { name: 'Single Store', price: 1499, period: 'mo', users: '1 outlet' },
      { name: 'Chain', price: 3999, period: 'mo', users: '5 outlets', featured: true },
      { name: 'Franchise', price: 'Custom', period: '', users: 'Unlimited' },
    ],
  },
  {
    id: 'hospital',
    name: 'CareGrid HMS',
    tagline: 'Hospital Management Suite',
    category: 'ERP Solutions',
    accent: '#00f0ff',
    glyph: '07',
    description:
      'A connected hospital management system — OPD, IPD, pharmacy, labs, billing, insurance, and AI-assisted diagnostics, all in one futuristic command center.',
    highlights: [
      'OPD / IPD / Pharmacy / Lab modules',
      'Insurance & TPA workflow',
      'Electronic Health Records (EHR)',
      'Telemedicine & video consultations',
      'AI triage & diagnostic assistance',
    ],
    tech: ['React', 'Node.js', 'PostgreSQL', 'FHIR'],
    plans: [
      { name: 'Clinic', price: 5999, period: 'mo', users: 'Up to 10 doctors' },
      { name: 'Hospital', price: 14999, period: 'mo', users: 'Up to 100 beds', featured: true },
      { name: 'Enterprise', price: 'Custom', period: '', users: 'Multi-hospital' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom Software',
    tagline: 'Bespoke Software Engineering',
    category: 'Custom Software Solutions',
    accent: '#b537ff',
    glyph: '08',
    description:
      'Have a unique idea? Our engineering pod will design and build a tailor-made web, mobile, or SaaS product — from discovery to deployment.',
    highlights: [
      'Discovery workshops & wireframes',
      'Modern stack — React, Node, Python, Go',
      'Cloud-native on AWS / Azure / GCP',
      'AI / ML integrations',
      'Long-term maintenance & support',
    ],
    tech: ['React', 'Node.js', 'Python', 'AWS', 'Kubernetes'],
    plans: [
      { name: 'MVP', price: 'On request', period: '', users: '6–10 weeks' },
      { name: 'Product', price: 'On request', period: '', users: '12–20 weeks', featured: true },
      { name: 'Enterprise', price: 'On request', period: '', users: 'Long engagement' },
    ],
  },
];

export const categories = [
  'All',
  'ERP Solutions',
  'E-commerce Solutions',
  'CRM Software',
  'POS & Billing Systems',
  'Custom Software Solutions',
];

export const stats = [
  { value: 120, suffix: '+', label: 'Enterprise Clients' },
  { value: 8, suffix: '', label: 'Flagship Products' },
  { value: 99.9, suffix: '%', label: 'Uptime Guarantee' },
  { value: 24, suffix: '/7', label: 'Support Coverage' },
];

export const testimonials = [
  {
    name: 'Aarti Mehta',
    role: 'Principal, Sunrise International School',
    quote:
      'NovaScholar transformed how we run admissions and fees. What used to take weeks is now automated end-to-end. The dashboard feels like science fiction.',
    accent: '#00f0ff',
  },
  {
    name: 'Rajeev Kapoor',
    role: 'Secretary, Skyline Towers',
    quote:
      'Habitat ERP gave our residents a beautiful app for everything — payments, visitors, amenities. Complaints dropped by 60% in the first quarter.',
    accent: '#b537ff',
  },
  {
    name: 'Priya Shah',
    role: 'CEO, Lumen Retail',
    quote:
      'Pulse Commerce launched our D2C brand in 18 days. The AI recommendations alone lifted AOV by 22%. Best investment we made this year.',
    accent: '#39ff14',
  },
  {
    name: 'Dr. Imran Khan',
    role: 'Director, MedFirst Hospital',
    quote:
      'CareGrid unified our OPD, lab and pharmacy in one place. The AI triage flags critical cases before clinicians even open a chart.',
    accent: '#ff2bd1',
  },
];

export const clientLogos = ['EDUNEXT', 'SKYLINE', 'LUMEN', 'MEDFIRST', 'ORION', 'NEBULA', 'HELIX', 'VECTOR'];

export const faqs = [
  {
    q: 'Do you provide hosted (SaaS) deployments?',
    a: 'Yes. Every product ships as a managed SaaS by default — we handle servers, backups, scaling and uptime. We also offer on-premise and private-cloud deployments for enterprise customers under separate contracts.',
  },
  {
    q: 'Can I get a customized version of a product?',
    a: 'Absolutely. Most modules can be configured from the admin panel. For deeper changes — custom modules, branding, integrations — our engineering team builds against a fixed-scope statement of work.',
  },
  {
    q: 'What about data security and compliance?',
    a: 'All products use TLS in transit and AES-256 at rest. Role-based access, audit logs, MFA, and regular pen-tests are standard. We can sign DPAs and support SOC2 / ISO27001 controls for enterprise plans.',
  },
  {
    q: 'How does the free trial work?',
    a: 'Most products include a 14-day full-feature trial — no credit card required. After trial you can choose a subscription, request a custom quote, or simply walk away with your data exported.',
  },
  {
    q: 'Do you offer training and onboarding?',
    a: 'Yes — every plan includes structured onboarding, training sessions, and a dedicated customer success manager on Growth and above plans.',
  },
];
