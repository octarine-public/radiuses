import { Menu } from "github.com/octarine-public/wrapper/index"

import { EMenuType } from "../enum"
import { RadiusesEvents } from "../events"
import { BearMenu } from "./bear/index"
import { CustomRadiusMenu } from "./custom"
import { HeroMenu } from "./heroes/index"
import { RuneMenu } from "./runes"
import { TowerMenu } from "./tower"

export class MenuManager {
	public readonly State: Menu.Toggle

	public readonly HeroMenu: HeroMenu
	public readonly BearMenu: BearMenu

	public readonly RuneMenu: RuneMenu
	public readonly TowerMenu: TowerMenu
	public readonly CustomRadiusMenu: CustomRadiusMenu

	private readonly tree: Menu.Node
	private readonly reset: Menu.Button
	private readonly baseNode = Menu.AddEntry("Visual")
	public readonly basePath = "github.com/octarine-public/radiuses/scripts_files/"
	private readonly nodeIcon = this.basePath + "menu/icons/bullseye.svg"

	constructor() {
		this.tree = this.baseNode.AddNode("Radiuses", this.nodeIcon)
		this.tree.SortNodes = false

		this.State = this.tree.AddToggle("State", true)
		this.HeroMenu = new HeroMenu(this.tree, this.State)
		this.BearMenu = new BearMenu(this.tree, this.State)

		this.TowerMenu = new TowerMenu(this.tree)
		this.RuneMenu = new RuneMenu(this.tree)
		this.CustomRadiusMenu = new CustomRadiusMenu(this.tree)

		this.State.OnValue(() => this.EmitMenuChanged())
		this.reset = this.tree.AddButton("Reset settings", "Reset settings to default")
		this.reset.OnValue(() => this.ResetSettings())
	}

	public ResetSettings() {
		this.State.value = this.State.defaultValue
		this.RuneMenu.ResetSettings()
		this.HeroMenu.ResetSettings()
		this.BearMenu.ResetSettings()
		this.TowerMenu.ResetSettings()
		this.CustomRadiusMenu.ResetSettings()
	}

	private EmitMenuChanged() {
		RadiusesEvents.emit("MenuChanged", false, EMenuType.Base)
	}
}
