import { Color, ImageData, Menu } from "github.com/octarine-public/wrapper/index"

import { EMenuType, ETeam } from "../enum"
import { BaseMenu } from "./base"

export class TowerMenu extends BaseMenu {
	public readonly Fill: Menu.Toggle
	public readonly Team: Menu.Dropdown
	public readonly Style: Menu.Dropdown
	public readonly Target: Menu.Toggle

	public readonly AllyColor: Menu.ColorPicker
	public readonly EnemyColor: Menu.ColorPicker

	private readonly basePath = "github.com/octarine-public/radiuses/scripts_files/"
	private readonly arrNames = ["Allies and enemies", "Only enemies", "Only allies"]
	private readonly iconTarget = this.basePath + "menu/icons/target.svg"

	constructor(node: Menu.Node) {
		super(node, EMenuType.Towers, true, ImageData.Paths.Icons.icon_svg_tower)
		this.Fill = this.Tree.AddToggle("Fill", false, "Fill radius insides color")

		this.Target = this.Tree.AddToggle(
			"Target",
			true,
			"Show tower target",
			-1,
			this.iconTarget
		)
		this.Team = this.Tree.AddDropdown("Team", this.arrNames, 1)
		this.Style = this.Tree.AddDropdown("Style", ["Default", "Rope"])

		this.AllyColor = this.Tree.AddColorPicker("Ally color", Color.Green.SetA(255 / 2))
		this.EnemyColor = this.Tree.AddColorPicker("Enemy color", Color.Red.SetA(255 / 2))

		this.Fill.OnValue(() => this.EmitMenuChanged())
		this.Style.OnValue(() => this.EmitMenuChanged())
		this.Target.OnValue(() => this.EmitMenuChanged())
		this.AllyColor.OnValue(() => this.EmitMenuChanged())
		this.EnemyColor.OnValue(() => this.EmitMenuChanged())
		this.Team.OnValue(call => this.UpdateTeamMenu(call.SelectedID, true))
	}

	protected UpdateTeamMenu(team: ETeam, isEmit = false) {
		switch (team) {
			case ETeam.Allies:
				this.AllyColor.IsHidden = true
				this.EnemyColor.IsHidden = false
				break
			case ETeam.Enemies:
				this.AllyColor.IsHidden = false
				this.EnemyColor.IsHidden = true
				break
			default:
				this.EnemyColor.IsHidden = this.AllyColor.IsHidden = false
				break
		}
		if (isEmit) {
			this.EmitMenuChanged()
		}
		this.Tree.Update()
	}
}
