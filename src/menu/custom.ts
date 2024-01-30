import { Menu } from "github.com/octarine-public/wrapper/index"

import { EMenuType } from "../enum"
import { BaseMenu } from "./base"

export class CustomRadiusMenu extends BaseMenu {
	private static readonly base = "github.com/octarine-public/radiuses/scripts_files/"
	private static readonly nodeIcon = this.base + "menu/icons/circle-plus.svg"

	public readonly RadiusesCount: Menu.Slider

	constructor(node: Menu.Node) {
		super(node, EMenuType.Custom, false, CustomRadiusMenu.nodeIcon)
		this.Tree.SortNodes = false
		this.Tree.SaveUnusedConfigs = true
		this.RadiusesCount = this.Tree.AddSlider("Count", 0, 0, 10)
	}
}
