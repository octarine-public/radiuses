import { Menu } from "github.com/octarine-public/wrapper/index"

export class TowerMenu {
	public readonly State: Menu.Toggle
	public readonly Team: Menu.Dropdown

	constructor(node: Menu.Node) {
		const menu = node.AddNode("Towers")
		this.State = menu.AddToggle("State", true)
		this.Team = menu.AddDropdown(
			"Team",
			["Allies and enemy", "Only enemy", "Only ally"],
			1
		)
	}
}
