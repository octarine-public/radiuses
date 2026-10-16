import { Paths } from "./paths"

const icon = (name: string) => `${Paths.Icons}/${name}.svg`

/** Outline glyphs of the menu: the SDK set where it has one, our own next to it otherwise. */
export const RadiusesIcons = {
	/** The page itself: rings around a point. */
	Radiuses: icon("radiuses"),
	Heroes: icon("heroes"),
	Bear: icon("bear"),
	Towers: icon("tower"),
	Runes: icon("runes"),
	/** A drafting compass: the circles the player draws by hand. */
	Custom: icon("compass"),
	/** One circle of the player's own, its radius drawn in. */
	Radius: icon("radius"),
	Attack: icon("sword"),
	AttackSettings: Menu.Icons.Settings2,
	Target: icon("crosshair"),
	Fill: Menu.Icons.PaintRoller,
	Style: Menu.Icons.PillDash,
	Team: Menu.Icons.ListFilter,
	Color: Menu.Icons.Pipette,
	Size: Menu.Icons.Expand
} as const
