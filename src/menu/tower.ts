
import { EMenuType } from "../enum"
import { RadiusesIcons } from "../icons"
import { BaseMenu } from "./base"
import { AddTowerTeams, ETowerTeam } from "./team"

export class TowerMenu extends BaseMenu {
	public readonly Fill: Menu.Toggle
	public readonly Team: Menu.MultiSelect
	public readonly Target: Menu.Toggle

	public readonly AllyColor: Menu.ColorPicker
	public readonly EnemyColor: Menu.ColorPicker

	constructor(node: Menu.Node) {
		super(
			node,
			EMenuType.Towers,
			true,
			RadiusesIcons.Towers,
			undefined,
			"Attack range of the towers.\nAt night a tier 1 tower's circle shrinks to its night vision"
		)
		this.Target = this.Tree.AddToggle(
			"Target",
			true,
			"Line from a tower to the unit it attacks",
			-1,
			RadiusesIcons.Target
		)

		this.Team = AddTowerTeams(this.Tree)
		this.EnemyColor = this.Tree.AddColorPicker("Enemy color", Color.Red.SetA(255 / 2))
		this.AllyColor = this.Tree.AddColorPicker("Ally color", Color.Green.SetA(255 / 2))
		this.Team.PairColors(ETowerTeam.Enemies, this.EnemyColor)
		this.Team.PairColors(ETowerTeam.Allies, this.AllyColor)

		this.Fill = this.Tree.AddToggle("Fill", false, "Fill the circle with its color")
		this.Fill.IconPath = RadiusesIcons.Fill

		this.Fill.OnValue(() => this.EmitMenuChanged())
		this.Team.OnValue(() => this.EmitMenuChanged())
		this.Target.OnValue(() => this.EmitMenuChanged())
		this.AllyColor.OnValue(() => this.EmitMenuChanged())
		this.EnemyColor.OnValue(() => this.EmitMenuChanged())
	}
}
