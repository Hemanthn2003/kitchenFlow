import React from "react";

const Icon = ({
  name,
  size = 20,
  strokeWidth = 1.8,
}) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (name) {
    case "menu":
      return (
        <svg {...common}>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      );

    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5L12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M9 21v-7h6v7" />
        </svg>
      );

    case "orders":
      return (
        <svg {...common}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="16" x2="13" y2="16" />
        </svg>
      );

    case "menuItems":
      return (
        <svg {...common}>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
          <circle cx="8" cy="6" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="11" cy="18" r="1.5" />
        </svg>
      );

    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="7" r="4" />
          <path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7" />
        </svg>
      );

    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3 20c0-3.8 2.5-6 6-6s6 2.2 6 6" />
          <path d="M15 14c3 0 5 1.8 5 5" />
        </svg>
      );

    case "chef":
      return (
        <svg {...common}>
          <path d="M7 10V8a5 5 0 0110 0v2" />
          <path d="M5 10h14v4H5z" />
          <path d="M7 14v6h10v-6" />
          <path d="M9 17h6" />
        </svg>
      );

    case "table":
      return (
        <svg {...common}>
          <rect x="4" y="6" width="16" height="7" rx="1" />
          <path d="M7 13v5" />
          <path d="M17 13v5" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 00-14-5L4 8" />
          <path d="M4 4v4h4" />
          <path d="M4 13a8 8 0 0014 5l2-2" />
          <path d="M20 20v-4h-4" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M21 19V5a2 2 0 00-2-2h-5" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "activity":
      return (
        <svg {...common}>
          <polyline points="3 12 7 12 10 5 14 19 17 12 21 12" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12l2.5 2.5L16 9" />
        </svg>
      );

    case "edit":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 013 3L8 18l-4 1 1-4L16.5 3.5z" />
        </svg>
      );

    case "plus":
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
      );

    default:
      return null;
  }
};

export default Icon;