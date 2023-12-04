import { Menu } from "github.com/octarine-public/wrapper/index"

import { TowerMenu } from "./tower"

export class MenuManager {
	public readonly TowerMenu: TowerMenu

	constructor() {
		const mainNode = Menu.AddEntry("Visuals")
		const menu = mainNode.AddNode("Radiuses")

		this.TowerMenu = new TowerMenu(menu)
	}
}
