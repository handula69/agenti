/**
 * ============================================================================
 * SITE CONTENT — edit everything here, never touch index.html / styles.css
 * ============================================================================
 * This file is the single source of truth for every piece of text, contact
 * detail, and service on the site. Change a value below and the page updates
 * automatically — no HTML/CSS knowledge required.
 *
 * NOTE: All values in this file are PLACEHOLDER content for a fictional
 * company, written so you can see the site fully populated. Replace them
 * with your real company details before publishing.
 * ============================================================================
 */

window.SITE_CONTENT = {

  // --------------------------------------------------------------------
  // SITE-WIDE / BRAND
  // --------------------------------------------------------------------
  site: {
    companyName: "Meridian Cayman Partners",     // Shown in the nav bar, hero, and footer
    tagline: "Corporate & Fiduciary Services, Grounded in Cayman Islands Expertise",
    // Short line shown under the tagline in the hero section
    heroSubtext: "We help funds, corporations, and private clients structure, register, and administer their Cayman Islands entities with precision and discretion.",
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
    heading: "About Meridian Cayman Partners",
    // Paragraphs are rendered in order; add/remove strings from this array
    // to add/remove paragraphs.
    paragraphs: [
      "Meridian Cayman Partners is an independent corporate services provider based in George Town, Grand Cayman. For over a decade we have supported investment funds, holding companies, and private clients with the formation and ongoing administration of Cayman Islands entities.",
      "Our team combines local regulatory knowledge with an international outlook, giving clients a trusted single point of contact for company formation, fund administration, trust structuring, and compliance support — delivered with the discretion and reliability the jurisdiction is known for.",
    ],
    // Small stat/credibility strip shown under the about text
    stats: [
      { value: "500+", label: "Entities under administration" },
      { value: "12+", label: "Years serving Cayman clients" },
      { value: "30+", label: "Jurisdictions represented" },
    ],
  },

  // --------------------------------------------------------------------
  // SERVICES SECTION — add, remove, or reorder service objects freely.
  // "icon" refers to a simple built-in icon key rendered in script.js
  // (see ICONS in script.js): building, shield, chart, briefcase, globe, file
  // --------------------------------------------------------------------
  services: {
    heading: "Our Services",
    subheading: "A full suite of corporate and fiduciary services for entities operating in and through the Cayman Islands.",
    items: [
      {
        icon: "building",
        title: "Company Formation",
        description: "Incorporation of exempted companies, LLCs, and foundation companies, handled end-to-end with local regulatory filings.",
      },
      {
        icon: "chart",
        title: "Fund Administration",
        description: "NAV calculation, investor services, and reporting for hedge funds, private equity, and venture capital vehicles.",
      },
      {
        icon: "shield",
        title: "Trust & Wealth Structuring",
        description: "Establishment and administration of trusts and private trust companies for succession and asset protection planning.",
      },
      {
        icon: "briefcase",
        title: "Registered Office Services",
        description: "Statutory registered office and agent services, ensuring your entity remains in good standing with local authorities.",
      },
      {
        icon: "file",
        title: "Compliance & AML Support",
        description: "Ongoing AML/KYC support, economic substance filings, and regulatory reporting to keep your entity fully compliant.",
      },
      {
        icon: "globe",
        title: "Corporate Secretarial",
        description: "Minute-book maintenance, resolutions, and corporate governance support for boards and directors.",
      },
    ],
  },

  // --------------------------------------------------------------------
  // CONTACT SECTION
  // --------------------------------------------------------------------
  contact: {
    heading: "Get in Touch",
    subheading: "Speak with our team about your Cayman Islands structuring needs.",

    // ------------------------------------------------------------------
    // FORMSPREE — REQUIRED SETUP BEFORE GOING LIVE
    // ------------------------------------------------------------------
    // 1. Go to https://formspree.io and create a free account.
    // 2. Create a new form and copy the endpoint it gives you
    //    (it looks like: https://formspree.io/f/abcdwxyz)
    // 3. Paste that endpoint below, replacing the placeholder.
    // Until you do this, the contact form will not deliver submissions.
    formEndpoint: "https://formspree.io/f/YOUR_FORM_ID",

    // Contact details shown next to the form
    address: {
      line1: "89 Nexus Way, Camana Bay",
      line2: "Grand Cayman, KY1-9006",
      line3: "Cayman Islands",
    },
    phone: "+1 (345) 555-0148",
    email: "info@meridiancaymanpartners.ky",

    // Optional: set to true and provide embedUrl to show a Google Maps
    // embed instead of / alongside the plain-text address above.
    // Get an embed URL from Google Maps: Share > Embed a map > copy the src.
    showMap: false,
    mapEmbedUrl: "",
  },

  // --------------------------------------------------------------------
  // FOOTER
  // --------------------------------------------------------------------
  footer: {
    companyName: "Meridian Cayman Partners",
    tagline: "Corporate & fiduciary services in the Cayman Islands.",
    year: new Date().getFullYear(),
    // Change this if you'd rather hardcode a fixed year instead of "auto"
    copyrightText: "All rights reserved.",
  },
};
