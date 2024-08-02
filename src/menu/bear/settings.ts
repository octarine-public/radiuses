import { Color, ImageData, Menu } from "github.com/octarine-public/wrapper/index"

import { EMenuType, ETeam } from "../../enum"
import { RadiusesEvents } from "../../events"

export class AbilitySettings {
	public readonly Tree: Menu.Node
	public readonly Fill: Menu.Toggle
	public readonly Team: Menu.Dropdown
	public readonly Style: Menu.Dropdown
	public readonly Color: Menu.ColorPicker

	private readonly arrNames = [
		"Allies and enemies",
		"Only enemies",
		"Only allies",
		"Only controllable"
	]

	constructor(node: Menu.Node, abilityName: string, iconTexturePath: string) {
		this.Tree = node.AddNode(abilityName, iconTexturePath, undefined, 0)
		this.Tree.IsHidden = true

		this.Color = this.Tree.AddColorPicker("Color", Color.Green.SetA(255 / 2))
		this.Fill = this.Tree.AddToggle("Fill", false, "Fill radius insides color")
		this.Style = this.Tree.AddDropdown("Style", ["Default", "Rope"])
		this.Team = this.Tree.AddDropdown("Team", this.arrNames, ETeam.Controlable)

		this.Team.OnValue(() => this.EmitMenuChanged())
		this.Fill.OnValue(() => this.EmitMenuChanged())
		this.Style.OnValue(() => this.EmitMenuChanged())
		this.Color.OnValue(() => this.EmitMenuChanged())
	}

	public Destroy() {
		this.Tree.DetachFromParent()
	}

	public ResetSettings() {
		this.Team.SelectedID = this.Team.SelectedID
		this.Fill.value = this.Fill.defaultValue
		this.Style.SelectedID = this.Style.defaultValue
		this.Color.SelectedColor.CopyFrom(this.Color.defaultColor)
	}

	protected EmitMenuChanged() {
		RadiusesEvents.emit("MenuChanged", false, EMenuType.Bear)
	}
}

export class AttackSettings {
	public readonly Tree: Menu.Node
	public readonly Fill: Menu.Toggle
	public readonly Team: Menu.Dropdown
	public readonly Style: Menu.Dropdown
	public readonly Color: Menu.ColorPicker

	private readonly arrNames = [
		"Allies and enemies",
		"Only enemies",
		"Only allies",
		"Only controllable"
	]

	constructor(node: Menu.Node) {
		this.Tree = node.AddNode("Attack settings", ImageData.Paths.Icons.icon_damage)
		this.Tree.IsHidden = true

		this.Color = this.Tree.AddColorPicker("Color", Color.Green.SetA(255 / 2))
		this.Fill = this.Tree.AddToggle("Fill", true, "Fill radius insides color")
		this.Style = this.Tree.AddDropdown("Style", ["Default", "Rope"])
		this.Team = this.Tree.AddDropdown("Team", this.arrNames, 3)

		this.Team.OnValue(() => this.EmitMenuChanged())
		this.Fill.OnValue(() => this.EmitMenuChanged())
		this.Style.OnValue(() => this.EmitMenuChanged())
		this.Color.OnValue(() => this.EmitMenuChanged())
	}

	public Destroy() {
		this.Tree.DetachFromParent()
	}

	public ResetSettings() {
		this.Team.SelectedID = this.Team.SelectedID
		this.Fill.value = this.Fill.defaultValue
		this.Style.SelectedID = this.Style.defaultValue
		this.Color.SelectedColor.CopyFrom(this.Color.defaultColor)
	}

	protected EmitMenuChanged() {
		RadiusesEvents.emit("MenuChanged", false, EMenuType.Bear)
	}
}
