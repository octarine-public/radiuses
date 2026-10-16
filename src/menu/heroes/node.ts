
import { EMenuType } from "../../enum"
import { RadiusesEvents } from "../../events"
import { RadiusesIcons } from "../../icons"
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
		private readonly duplicate = 1
	) {
		this.Menu = root.AddNode(
			this.NodeName,
			hero.TexturePath(true),
			"Attack range and the abilities to draw for this hero"
		)

		this.Menu.Update()
		this.Menu.IsHidden = false
		this.Menu.SaveUnusedConfigs = true

		this.AttackState = this.Menu.AddToggle(
			"RADIUSES_ATTACK_TITLE",
			false,
			"Draw the attack range.\nFill and teams are behind the gear"
		)
		this.AttackState.IconPath = RadiusesIcons.Attack
		this.Abilities = this.Menu.AddImageSelector(
			"RADIUSES_HIDDEN_TITLE",
			[],
			undefined,
			"Click an ability to draw its radius"
		)

		this.AttackSettings = new HeroAttackSettings(
			this.hero,
			this.Menu,
			this.AttackState
		)

		this.AttackState.OnValue(() => this.EmitMenuChanged())

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
		if (this.duplicate > 1 && !this.hero.IsClone) {
			name += ` #${this.duplicate}`
		}
		return name
	}

	public get AttackStateByTeam() {
		return this.AttackSettings.StateByTeam
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
