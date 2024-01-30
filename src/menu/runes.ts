import { Color, ImageData, Menu } from "github.com/octarine-public/wrapper/index"

import { EMenuType } from "../enum"
import { BaseMenu } from "./base"

export class RuneMenu extends BaseMenu {
	public readonly Color: Menu.ColorPicker

	constructor(node: Menu.Node) {
		super(
			node,
			EMenuType.Runes,
			false,
			ImageData.GetRuneTexture("bounty", true),
			0,
			"Pickup distance"
		)
		this.Color = this.Tree.AddColorPicker("Color", Color.Aqua)
		this.Color.OnValue(() => this.EmitMenuChanged())
	}

	public ResetSettings() {
		super.ResetSettings()
		this.Color.SelectedColor.CopyFrom(this.Color.defaultColor)
		this.EmitMenuChanged()
	}
}
