
import { RadiusesIcons } from "../icons"

/** The sides a hero's or a bear's team row ticks, in the order it lists them. */
export const enum EUnitTeam {
	Enemies,
	Allies,
	Controllable
}

/** The sides the towers' team row ticks, in the order it lists them. */
export const enum ETowerTeam {
	Enemies,
	Allies
}

export const UnitTeamNames = ["Enemies", "Allies", "Controllable"]
export const TowerTeamNames = ["Enemies", "Allies"]

export function AddUnitTeams(node: Menu.Node, defaultValue: EUnitTeam[]) {
	const teams = node.AddMultiSelect(
		"Team",
		UnitTeamNames,
		defaultValue.map(team => UnitTeamNames[team]),
		"Draw it for enemies, allies\nor units under your control"
	)
	teams.IconPath = RadiusesIcons.Team
	return teams
}

export function AddTowerTeams(node: Menu.Node) {
	const teams = node.AddMultiSelect(
		"Team",
		TowerTeamNames,
		[TowerTeamNames[ETowerTeam.Enemies]],
		"Whose towers to draw,\nin a color of each side's own"
	)
	teams.IconPath = RadiusesIcons.Team
	return teams
}

export function IsUnitTeamSelected(unit: Unit, teams: Menu.MultiSelect) {
	if (unit.IsControllable && teams.IsSelected(EUnitTeam.Controllable)) {
		return true
	}
	return teams.IsSelected(unit.IsEnemy() ? EUnitTeam.Enemies : EUnitTeam.Allies)
}
