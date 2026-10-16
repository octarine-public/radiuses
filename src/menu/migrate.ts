
import { EMenuType } from "../enum"
import { TowerTeamNames, UnitTeamNames } from "./team"

/** A team row that was a dropdown: the options it listed and the sides each one stands for now. */
interface ITeamRow {
	readonly names: readonly string[]
	readonly options: readonly string[]
	readonly sides: readonly (readonly number[])[]
}

const unitRow: ITeamRow = {
	names: UnitTeamNames,
	options: ["Allies and enemies", "Only enemies", "Only allies", "Only controllable"],
	sides: [[0, 1], [0], [1], [2]]
}

const towerRow: ITeamRow = {
	names: TowerTeamNames,
	options: ["Allies and enemies", "Only enemies", "Only allies"],
	sides: [[0, 1], [0], [1]]
}

function storedNode(value: unknown): Nullable<MenuSDK.ConfigObject> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
		? (value as MenuSDK.ConfigObject)
		: undefined
}

function teamTicks(row: ITeamRow, index: number): [string, boolean][] {
	const sides = row.sides[index]
	return row.names.map((name, side): [string, boolean] => [name, sides.includes(side)])
}

function migrateTeamRow(node: Nullable<MenuSDK.ConfigObject>, row: ITeamRow) {
	if (node === undefined) {
		return
	}
	const holder = storedNode(node.Team)
	const value = holder === undefined ? node.Team : holder.v
	if (typeof value !== "number" || row.sides[value] === undefined) {
		return
	}
	if (holder === undefined) {
		node.Team = teamTicks(row, value)
		return
	}
	holder.v = teamTicks(row, value)
	for (const key of ["hotkeys", "logic"]) {
		const drivers = holder[key]
		if (!Array.isArray(drivers)) {
			continue
		}
		for (const driver of drivers) {
			const record = storedNode(driver)
			const option = record?.value
			if (record === undefined || typeof option !== "string") {
				continue
			}
			const sides = row.sides[row.options.indexOf(option)] ?? []
			record.value = sides.map(side => row.names[side])
		}
	}
}

function migrateUnitRows(node: Nullable<MenuSDK.ConfigObject>, depth: number) {
	if (node === undefined) {
		return
	}
	if (depth === 0) {
		migrateTeamRow(node, unitRow)
		return
	}
	for (const value of Object.values(node)) {
		migrateUnitRows(storedNode(value), depth - 1)
	}
}

/**
 * Turns the team rows a config saved as dropdown indexes into the ticks of the multiselects now in
 * their place: the towers' row, and the attack and ability rows under every hero and the bear.
 * A row already saved as ticks is left as it is.
 */
export function MigrateConfig(stored: Nullable<MenuSDK.ConfigObject>) {
	if (stored === undefined) {
		return
	}
	migrateTeamRow(storedNode(stored[EMenuType.Towers]), towerRow)
	migrateUnitRows(storedNode(stored[EMenuType.Heroes]), 2)
	migrateUnitRows(storedNode(stored[EMenuType.Bear]), 1)
}
