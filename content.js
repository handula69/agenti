/**
 * ============================================================================
 * SITE CONTENT — edit everything here, never touch index.html / styles.css
 * ============================================================================
 * This file is the single source of truth for every piece of text, contact
 * detail, and service on the site. Change a value below and the page updates
 * automatically — no HTML/CSS knowledge required.
 * ============================================================================
 */

window.SITE_CONTENT = {

  // --------------------------------------------------------------------
  // SITE-WIDE / BRAND
  // --------------------------------------------------------------------
  site: {
    companyName: "EDB Consultancy SEZC Ltd.",     // Shown in the nav bar, hero, and footer
    tagline: "Digital Asset Consultancy for Blockchain Funds & Infrastructure Providers",
    // Short line shown under the tagline in the hero section
    heroSubtext: "We provide digital asset strategy, financial structuring, and operational consultations to General Partners of blockchain funds, digital asset infrastructure companies, and blockchain consulting firms — serving Cayman Islands exempt companies and SEZCs, as well as businesses operating internationally.",
    // Text on the primary call-to-action button in the hero section
    ctaText: "Book a Consultation",
    // Which section the CTA button scrolls to (must match a section id in index.html)
    ctaTarget: "#contact",
  },

  // --------------------------------------------------------------------
  // NAVIGATION MENU — order here controls order in the nav bar
  // --------------------------------------------------------------------
  nav: [
    { label: "Home", target: "#home" },
    { label: "About Us", target: "#about" },
    { label: "Services", target: "#services" },
    { label: "Contact", target: "#contact" },
  ],

  // --------------------------------------------------------------------
  // ABOUT SECTION
  // --------------------------------------------------------------------
  about: {
    heading: "About EDB Consultancy",
    // Paragraphs are rendered in order; add/remove strings from this array
    // to add/remove paragraphs.
    paragraphs: [
      "EDB Consultancy SEZC Ltd. is a professional consultancy firm providing digital asset consultation services to General Partners of blockchain and digital asset funds, digital asset infrastructure companies — including validators, staking providers, and node operators — and blockchain consulting firms.",
      "We serve Cayman Islands exempt companies and Special Economic Zone Companies (SEZCs), as well as international businesses operating outside the Cayman Islands jurisdiction, offering digital asset strategy, operational, and financial structuring consultations tailored to the realities of blockchain-based business.",
    ],
    // Small credibility strip shown under the about text. These are
    // descriptive facts, not performance statistics — replace with real
    // figures (years in business, clients served, etc.) once available;
    // avoid publishing numbers that can't be backed up.
    stats: [
      { value: "SEZC", label: "Registered via Cayman Enterprise City" },
      { value: "GPs & Funds", label: "Serving blockchain fund General Partners" },
      { value: "Global", label: "Clients in and outside the Cayman Islands" },
    ],
  },

  // --------------------------------------------------------------------
  // SERVICES SECTION — add, remove, or reorder service objects freely.
  // "icon" refers to a simple built-in icon key rendered in script.js
  // (see ICONS in script.js): building, shield, chart, briefcase, globe, file
  // --------------------------------------------------------------------
  services: {
    heading: "Our Services",
    subheading: "Consultancy services for blockchain fund General Partners and digital asset infrastructure providers, from investment strategy through day-to-day operations.",
    items: [
      {
        icon: "chart",
        title: "Digital Assets Investment Advisory",
        description: "Investment strategy development, due diligence, and risk assessment for digital asset investments, plus market analysis and regulatory advisory across DeFi and blockchain sectors.",
      },
      {
        icon: "briefcase",
        title: "Finance Management",
        description: "Financial planning and forecasting, transaction monitoring, treasury management, and cross-jurisdictional tax consulting for blockchain funds, including investor and regulatory reporting.",
      },
      {
        icon: "globe",
        title: "Fundraising Services",
        description: "Capital raising strategy, investor relations, due diligence support, and regulatory compliance for blockchain funds and digital asset ventures.",
      },
      {
        icon: "file",
        title: "Sales & Marketing",
        description: "Business development, marketing strategy, event management, and digital presence support to help fund managers build market position.",
      },
      {
        icon: "shield",
        title: "Risk Management",
        description: "Operational risk assessment, cybersecurity consulting, compliance monitoring, and crisis management for digital asset custody and fund operations.",
      },
      {
        icon: "building",
        title: "Operations",
        description: "Process optimization, technology implementation, vendor management, and reporting systems to streamline fund operations and track performance.",
      },
    ],
  },

  // --------------------------------------------------------------------
  // CONTACT SECTION
  // --------------------------------------------------------------------
  contact: {
    heading: "Get in Touch",
    subheading: "Speak with our team about digital asset consultancy for your fund or infrastructure business.",

    // ------------------------------------------------------------------
    // FORMSPREE
    // ------------------------------------------------------------------
    // Submissions are delivered to the notification email(s) configured
    // on this form in the Formspree dashboard (formspree.io). To change
    // where they go, edit the form there — no code change needed here.
    formEndpoint: "https://formspree.io/f/xzebvbeq",

    // Contact details shown next to the form
    address: {
      line1: "PO Box CEC-352",
      line2: "George Town, Grand Cayman",
      line3: "Cayman Islands, KY1-9012",
    },
    phone: "+1 345 525 2419",
    // Leave blank until a company email is set up (e.g. on your own website
    // domain via Google Workspace, Microsoft 365, or Zoho Mail). The Email
    // row is automatically hidden on the page while this is empty.
    email: "",

    // Optional: set to true and provide embedUrl to show a Google Maps
    // embed instead of / alongside the plain-text address above. Note:
    // the address above is a PO Box, which Google Maps cannot pin — only
    // enable this if you add a physical/registered office address.
    showMap: false,
    mapEmbedUrl: "",
  },

  // --------------------------------------------------------------------
  // FOOTER
  // --------------------------------------------------------------------
  footer: {
    companyName: "EDB Consultancy SEZC Ltd.",
    tagline: "Digital asset consultancy in the Cayman Islands.",
    year: new Date().getFullYear(),
    // Change this if you'd rather hardcode a fixed year instead of "auto"
    copyrightText: "All rights reserved.",
  },
};
