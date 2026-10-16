
import { EMenuType } from "../enum"
import { RadiusesIcons } from "../icons"
import { BaseMenu } from "./base"

export class RuneMenu extends BaseMenu {
	public readonly Color: Menu.ColorPicker

	constructor(node: Menu.Node) {
		super(
			node,
			EMenuType.Runes,
			false,
			RadiusesIcons.Runes,
			undefined,
			"Distance a rune can be picked up from,\naround every rune on the map"
		)
		this.Color = this.Tree.AddColorPicker(
			"Color",
			Color.Aqua,
			"Color of the pickup circle"
		)
		this.Color.IconPath = RadiusesIcons.Color
		this.Color.OnValue(() => this.EmitMenuChanged())
	}
}
