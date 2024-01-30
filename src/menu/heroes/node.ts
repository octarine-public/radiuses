import { Hero, Menu } from "github.com/octarine-public/wrapper/index"

import { EMenuType } from "../../enum"
import { RadiusesEvents } from "../../events"
import { HeroAbilitySettings, HeroAttackSettings } from "./settings"

export class NodeHero {
	public readonly Menu: Menu.Node
	public readonly AttackState: Menu.Toggle
	public readonly Abilities: Menu.ImageSelector

	public readonly AttackSettings: HeroAttackSettings
	public readonly AbilitySettings = new Map<string, HeroAbilitySettings>()

	constructor(
		root: Menu.Node,
		public readonly hero: Hero,
		private readonly existsByName = false
	) {
		this.Menu = root.AddNode(this.NodeName, hero.TexturePath(true))

		this.Menu.Update()
		this.Menu.IsHidden = false
		this.Menu.SaveUnusedConfigs = true

		this.AttackState = this.Menu.AddToggle("Attack", false)
		this.Abilities = this.Menu.AddImageSelector("RADIUSES_HIDDEN_TITLE", [])

		this.AttackSettings = new HeroAttackSettings(this.hero, this.Menu)

		this.AttackState.OnValue(({ value }) => {
			this.AttackSettings.Tree.IsHidden = !value
			this.Menu.Update()
			this.EmitMenuChanged()
		})

		this.Abilities.OnValue(call => {
			this.UpdateAbilitiesState(call)
			this.Menu.Update()
			this.EmitMenuChanged()
		})
	}

	protected get NodeName() {
		let name = Menu.Localization.Localize(this.hero.Name)
		if (this.hero.IsClone) {
			name += ` (${Menu.Localization.Localize("clone")})`
		}
		if (this.existsByName && !this.hero.IsClone) {
			name += ` (${this.hero.PlayerID})`
		}
		return name
	}

	public get AttackStateByTeam() {
		return this.AttackSettings.StateByTeam
	}

	public ResetSettings() {
		this.AttackState.value = this.AttackState.defaultValue
		this.AttackSettings.ResetSettings()
		this.AbilitySettings.forEach(abil => abil.ResetSettings())
	}

	public AbilityStateByTeam(abilName: string) {
		return this.AbilitySettings.get(abilName)?.StateByTeam ?? false
	}

	public AddAbility(name: string, texturePath: string, defaultValue = false) {
		if (!this.Abilities.enabledValues.has(name)) {
			this.Abilities.enabledValues.set(name, defaultValue)
		}

		if (!this.AbilitySettings.has(name)) {
			const newClass = new HeroAbilitySettings(
				this.hero,
				this.Menu,
				name,
				texturePath
			)
			this.AbilitySettings.set(name, newClass)
			newClass.Tree.IsHidden = !defaultValue || !this.Abilities.IsEnabled(name)
			newClass.Tree.Update()
		}

		this.Abilities.values.push(name)
		this.Abilities.Update()
		this.Menu.Update()
	}

	public DestroyAll() {
		this.DestroyAbilities()
		this.Menu.DetachFromParent()
		this.Abilities.DetachFromParent()
		this.Menu.Update()
	}

	protected DestroyAbilities() {
		this.Abilities.values.clear()
		this.AbilitySettings.forEach(menu => menu.Destroy())
		this.AbilitySettings.clear()
		this.Menu.Update()
	}

	protected EmitMenuChanged() {
		RadiusesEvents.emit("MenuChanged", false, EMenuType.Heroes, this.hero)
	}

	protected UpdateAbilitiesState(call: Menu.ImageSelector) {
		for (let index = call.values.length - 1; index > -1; index--) {
			const name = call.values[index]
			const abilSettings = this.AbilitySettings.get(name)
			if (abilSettings === undefined) {
				continue
			}
			const state = call.enabledValues.get(name) ?? true
			abilSettings.Tree.IsHidden = !state
		}
	}
}
