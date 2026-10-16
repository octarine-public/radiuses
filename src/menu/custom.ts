
import { EMenuType } from "../enum"
import { RadiusesIcons } from "../icons"
import { BaseMenu } from "./base"

export class RadiusesMenu {
	public readonly State: Menu.Toggle
	public readonly Fill: Menu.Toggle
	public readonly Radius: Menu.Slider
	public readonly Color: Menu.ColorPicker
	public readonly Node: Menu.Node

	constructor(tree: Menu.Node, idx: number) {
		this.Node = tree.AddSettings(
			`Radius #${idx}`,
			RadiusesIcons.Radius,
			"A circle around your hero.\nRadius and fill are behind the gear"
		)
		this.State = this.Node.AddToggle("State", idx === 1)
		this.Node.HeaderControl = this.State
		this.Color = this.Node.AddColorPicker("Color", Color.Green)
		this.Node.PairColors(this.Color)
		this.Radius = this.Node.AddSlider(
			"Radius",
			1200 * (idx / 1.5),
			100,
			5000,
			0,
			"Radius of the circle in game units"
		)
		this.Radius.IconPath = RadiusesIcons.Size
		this.Fill = this.Node.AddToggle("Fill", false, "Fill the circle with its color")
		this.Fill.IconPath = RadiusesIcons.Fill
	}

	public MenuChanged(cb: () => void) {
		this.State.OnValue(() => cb())
		this.Fill.OnValue(() => cb())
		this.Radius.OnValue(() => cb())
		this.Color.OnValue(() => cb())
	}
}

export class CustomRadiusMenu extends BaseMenu {
	public readonly Nodes: RadiusesMenu[] = []
	constructor(node: Menu.Node) {
		super(
			node,
			EMenuType.Custom,
			false,
			RadiusesIcons.Custom,
			undefined,
			"Circles of a radius you set around your hero"
		)
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
