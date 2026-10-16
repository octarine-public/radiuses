
import { EMenuType } from "../../enum"
import { RadiusesEvents } from "../../events"
import { RadiusesIcons } from "../../icons"
import { AddUnitTeams, EUnitTeam, IsUnitTeamSelected } from "../team"

export class HeroAttackSettings {
	public readonly Tree: Menu.Node
	public readonly Fill: Menu.Toggle
	public readonly Team: Menu.MultiSelect
	public readonly Color: Menu.ColorPicker

	constructor(
		private readonly hero: Hero,
		node: Menu.Node,
		state: Menu.Toggle
	) {
		this.Tree = node.AddSubSettings(
			state,
			"Attack settings",
			RadiusesIcons.AttackSettings
		)

		this.Color = this.Tree.AddColorPicker("Color", Color.Green.SetA(255 / 2))
		state.PairColors(this.Color)
		this.Fill = this.Tree.AddToggle("Fill", false, "Fill the circle with its color")
		this.Fill.IconPath = RadiusesIcons.Fill
		this.Team = AddUnitTeams(this.Tree, [EUnitTeam.Controllable])

		this.Team.OnValue(() => this.EmitMenuChanged())
		this.Fill.OnValue(() => this.EmitMenuChanged())
		this.Color.OnValue(() => this.EmitMenuChanged())
	}

	public Destroy() {
		this.Tree.DetachFromParent()
	}

	public get StateByTeam() {
		return IsUnitTeamSelected(this.hero, this.Team)
	}

	protected EmitMenuChanged() {
		RadiusesEvents.emit("MenuChanged", false, EMenuType.Heroes, this.hero)
	}
}

export class HeroAbilitySettings {
	public readonly Tree: Menu.Node
	public readonly Fill: Menu.Toggle
	public readonly Team: Menu.MultiSelect
	public readonly Color: Menu.ColorPicker

	constructor(
		private readonly hero: Hero,
		node: Menu.Node,
		abilityName: string,
		iconTexturePath: string
	) {
		this.Tree = node.AddSettings(
			abilityName,
			iconTexturePath,
			"Radius of this ability.\nFill and teams are behind the gear"
		)
		this.Tree.IconRound = 0
		this.Tree.IsHidden = true

		this.Color = this.Tree.AddColorPicker("Color", Color.Green.SetA(255 / 2))
		this.Tree.PairColors(this.Color)
		this.Fill = this.Tree.AddToggle("Fill", true, "Fill the circle with its color")
		this.Fill.IconPath = RadiusesIcons.Fill
		this.Team = AddUnitTeams(this.Tree, [EUnitTeam.Controllable])

		this.Team.OnValue(() => this.EmitMenuChanged())
		this.Fill.OnValue(() => this.EmitMenuChanged())
		this.Color.OnValue(() => this.EmitMenuChanged())
	}

	public get StateByTeam() {
		return IsUnitTeamSelected(this.hero, this.Team)
	}

	public Destroy() {
		this.Tree.DetachFromParent()
	}

	protected EmitMenuChanged() {
		RadiusesEvents.emit("MenuChanged", false, EMenuType.Heroes, this.hero)
	}
}
