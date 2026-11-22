const common = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' }

export function ProductVisual({ type, className = '' }) {
  const art = {
    lamp: <g {...common} strokeWidth="5"><path d="M97 211h86"/><path d="M140 211V106"/><path d="m140 107 59-53"/><path d="M184 46h48c10 0 18 8 18 18v20h-84V64c0-10 8-18 18-18Z"/><path d="M194 84v19"/></g>,
    headphones: <g {...common} strokeWidth="8"><path d="M74 144v-25a66 66 0 0 1 132 0v25"/><rect x="57" y="133" width="39" height="73" rx="18"/><rect x="184" y="133" width="39" height="73" rx="18"/><path d="M96 190c19 23 69 23 88 0"/></g>,
    bag: <g {...common} strokeWidth="6"><path d="M56 102h168l-13 110H69L56 102Z"/><path d="M105 104V84c0-28 70-28 70 0v20"/><path d="M57 122h166"/><path d="M89 102v110M191 102v110"/></g>,
    speaker: <g {...common} strokeWidth="5"><rect x="64" y="48" width="152" height="172" rx="43"/><circle cx="140" cy="141" r="48"/><circle cx="140" cy="141" r="12"/><path d="M112 79h56"/></g>,
    carafe: <g {...common} strokeWidth="5"><path d="M104 47h65v38c0 18 24 24 24 48v78H80v-78c0-24 24-30 24-48V47Z"/><path d="M105 70h64"/><path d="M193 144h25v66h-25"/><path d="M80 144H55v66h25"/></g>,
    notebook: <g {...common} strokeWidth="5"><path d="M64 48h140v170H64z"/><path d="M85 48v170"/><path d="M111 82h64M111 109h64M111 136h45"/><path d="M74 70h20M74 101h20M74 132h20M74 163h20M74 194h20"/></g>,
    mug: <g {...common} strokeWidth="6"><path d="M84 60h103l-8 155H92L84 60Z"/><path d="M105 60V40h61v20"/><path d="M88 89h95"/><path d="M113 119h44"/></g>,
    tray: <g {...common} strokeWidth="5"><path d="m52 105 88-48 88 48-88 48-88-48Z"/><path d="m52 105 4 65 84 48 84-48 4-65"/><path d="M140 153v65"/><path d="m91 83 92 49"/></g>,
  }

  return (
    <svg className={className} viewBox="0 0 280 270" role="img" aria-label={`${type} illustration`}>
      <circle cx="140" cy="137" r="108" fill="currentColor" opacity=".08" />
      {art[type]}
    </svg>
  )
}
