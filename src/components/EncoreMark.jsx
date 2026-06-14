export default function EncoreMark({ size = 28, color = '#FF9900' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {/*
        300° clockwise arc. Center (16,16), radius 12.
        Start: 300° = (22, 5.6)  —  1 o'clock
        End:   240° = (10, 5.6)  — 11 o'clock
        60° gap sits at the top of the ring.
      */}
      <path
        d="M22 5.6 A12 12 0 1 1 10 5.6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/*
        Arrowhead — filled triangle, clearly visible in the gap.
        Tip at (14, 3): inside the gap, pointing toward the 1 o'clock start.
        Base straddles the arc endpoint (10, 5.6) so the arrow flows from the stroke.
        Direction tip→base-center = (−5, +3) → 31° above horizontal,
        matching the clockwise tangent at 240°.
        Wing A (10.5, 8.6) sits inside the ring; Wing B (7.5, 3.4) sits outside —
        classic arrowhead straddle at a circle terminus.
      */}
      <path d="M14 3 L10.5 8.6 L7.5 3.4 Z" fill={color} />
    </svg>
  )
}
