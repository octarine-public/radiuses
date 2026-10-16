
import { EMenuType } from "../enum"
import { RadiusesEvents } from "../events"
import { RadiusesIcons } from "../icons"
import { BearMenu } from "./bear/index"
import { CustomRadiusMenu } from "./custom"
import { HeroMenu } from "./heroes/index"
import { MigrateConfig } from "./migrate"
import { RuneMenu } from "./runes"
import { TowerMenu } from "./tower"

export class MenuManager {
	public readonly State: Menu.Toggle
	public readonly Style: Menu.Dropdown

	public readonly HeroMenu: HeroMenu
	public readonly BearMenu: BearMenu

	public readonly RuneMenu: RuneMenu
	public readonly TowerMenu: TowerMenu
	public readonly CustomRadiusMenu: CustomRadiusMenu

	private readonly tree: Menu.Node
	private readonly baseNode = Menu.AddEntry("Visual")
	private readonly styleNames: PARTICLE_RENDER_NAME[] = [
		PARTICLE_RENDER_NAME.NORMAL,
		PARTICLE_RENDER_NAME.ROPE
	]

	constructor() {
		this.tree = this.baseNode.AddNode(
			"Radiuses",
			RadiusesIcons.Radiuses,
			"Attack, ability, tower and rune radiuses in the world,\nand circles of your own around your hero"
		)
		this.tree.SortNodes = false
		MenuSDK.AddConfigMigration(raw =>
			MigrateConfig(MenuSDK.ConfigSubtreeOf(raw, this.tree.entry))
		)
		MigrateConfig(this.tree.entry.stored)

		this.State = this.tree.AddToggle("State", true)
		this.tree.HeaderControl = this.State
		this.tree.Gate = this.State

		this.Style = this.tree.AddDropdown(
			"Line style",
			this.styleNames,
			0,
			"How the line of every radius is drawn"
		)
		this.Style.IconPath = RadiusesIcons.Style

		this.HeroMenu = new HeroMenu(this.tree, this.State, this.Style)
		this.BearMenu = new BearMenu(this.tree, this.State, this.Style)

		this.TowerMenu = new TowerMenu(this.tree)
		this.RuneMenu = new RuneMenu(this.tree)
		this.CustomRadiusMenu = new CustomRadiusMenu(this.tree)

		this.State.OnValue(() => this.EmitMenuChanged())
		this.Style.OnValue(() => this.EmitMenuChanged())
	}

	private EmitMenuChanged() {
		RadiusesEvents.emit("MenuChanged", false, EMenuType.Base)
	}
}
