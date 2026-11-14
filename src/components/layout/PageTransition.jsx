/** Route content stays stationary; individual titles own their CSS entry cue. */
export default function PageTransition({ children }) {
  return <div className="page-transition">{children}</div>;
}
