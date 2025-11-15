import {
	Color,
	Menu,
	PARTICLE_RENDER_NAME
} from "github.com/octarine-public/wrapper/index"

import { EMenuType } from "../enum"
import { BaseMenu } from "./base"

export class RadiusesMenu {
	public readonly State: Menu.Toggle
	public readonly Fill: Menu.Toggle
	public readonly Radius: Menu.Slider
	public readonly Style: Menu.Dropdown
	public readonly Color: Menu.ColorPicker
	public readonly Node: Menu.Node

	private readonly pNames: PARTICLE_RENDER_NAME[] = [
		PARTICLE_RENDER_NAME.NORMAL,
		PARTICLE_RENDER_NAME.ROPE
	]

	constructor(tree: Menu.Node, idx: number) {
		this.Node = tree.AddNode(`Radius #${idx}`)
		this.State = this.Node.AddToggle("State", idx === 1)
		this.Fill = this.Node.AddToggle("Fill", false, "Fill radius insides color")
		this.Radius = this.Node.AddSlider("Radius", 1200 * (idx / 1.5), 100, 5000)
		this.Style = this.Node.AddDropdown("Style", this.pNames)
		this.Color = this.Node.AddColorPicker("Color", Color.Green)
	}

	public MenuChanged(cb: () => void) {
		this.State.OnValue(() => cb())
		this.Fill.OnValue(() => cb())
		this.Radius.OnValue(() => cb())
		this.Style.OnValue(() => cb())
		this.Color.OnValue(() => cb())
	}
}

export class CustomRadiusMenu extends BaseMenu {
	public readonly Nodes: RadiusesMenu[] = []
	private static readonly base = "github.com/octarine-public/radiuses/scripts_files/"
	private static readonly nodeIcon = this.base + "menu/icons/circle-plus.svg"

	constructor(node: Menu.Node) {
		super(node, EMenuType.Custom, false, CustomRadiusMenu.nodeIcon)
		this.Tree.SortNodes = false
		for (let i = 1; i < 6; i++) {
			this.Nodes.push(new RadiusesMenu(this.Tree, i))
		}
		Menu.Localization.AddLocalizationUnit("russian", this.GetLocalization)
	}
	public MenuChanged(cb: () => void) {
		for (let i = this.Nodes.length - 1; i > -1; i--) {
			this.Nodes[i].MenuChanged(cb)
		}
	}
	protected get GetLocalization(): Map<string, string> {
		const map = new Map<string, string>()
		for (let i = 1; i < 6; i++) {
			map.set(`Radius #${i}`, `Радиус #${i}`)
		}
		return map
	}
}
