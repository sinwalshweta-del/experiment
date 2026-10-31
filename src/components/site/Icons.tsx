import { ArrowLeft, ArrowRight, List, X } from "@phosphor-icons/react/dist/ssr";

/**
 * The site's one icon set: Phosphor, bold weight (taste audit 2, board 25).
 * Use these instead of drawing SVG paths by hand.
 */
type P = { size?: number; className?: string };

export const IconArrowRight = ({ size = 18, className }: P) => <ArrowRight size={size} weight="bold" className={className} aria-hidden />;
export const IconArrowLeft = ({ size = 18, className }: P) => <ArrowLeft size={size} weight="bold" className={className} aria-hidden />;
export const IconClose = ({ size = 20, className }: P) => <X size={size} weight="bold" className={className} aria-hidden />;
export const IconMenu = ({ size = 24, className }: P) => <List size={size} weight="bold" className={className} aria-hidden />;
