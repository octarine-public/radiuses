import {
	Ability,
	ImageData,
	Menu,
	SpiritBear
} from "github.com/octarine-public/wrapper/index"

import { EMenuType, ETeam } from "../../enum"
import { BaseMenu } from "../base"
import { AbilitySettings, AttackSettings } from "./settings"

export class BearMenu extends BaseMenu {
	public readonly Attack: AttackSettings
	public readonly AttackState: Menu.Toggle
	public readonly Abilities: Menu.ImageSelector
	public readonly AbilitySettings = new Map<string, AbilitySettings>()

	constructor(
		node: Menu.Node,
		private readonly baseState: Menu.Toggle
	) {
		super(node, EMenuType.Bear, false, ImageData.Paths.Icons.icon_svg_teddy_bear)
		this.Tree.SortNodes = false
		this.Tree.SaveUnusedConfigs = true

		this.AttackState = this.Tree.AddToggle("Attack", false)
		this.Attack = new AttackSettings(this.Tree)
		this.Abilities = this.Tree.AddImageSelector("RADIUSES_HIDDEN_TITLE", [])
		this.Abilities.IsHidden = true

		this.AttackState.OnValue(({ value }) => {
			this.Attack.Tree.IsHidden = !value
			this.Tree.Update()
			this.EmitMenuChanged()
		})

		this.Abilities.OnValue(call => {
			this.UpdateAbilitiesState(call)
			this.Tree.Update()
			this.EmitMenuChanged()
		})
	}

	public get FullState() {
		return this.baseState.value && this.State.value
	}

	public ResetSettings() {
		this.State.value = this.State.defaultValue
		this.Attack.ResetSettings()
		this.AbilitySettings.forEach(abil => abil.ResetSettings())
		this.Tree.Update()
		this.EmitMenuChanged()
	}

	public StateByTeam(owner: SpiritBear, eTeam: ETeam) {
		if (eTeam === ETeam.All) {
			return true
		}
		return (
			(eTeam === ETeam.Allies && !owner.IsEnemy()) ||
			(eTeam === ETeam.Enemies && owner.IsEnemy()) ||
			(eTeam === ETeam.Controlable && owner.IsControllable)
		)
	}

	public IsEnabledAbility(ability: Ability, owner: SpiritBear) {
		const abilSettings = this.AbilitySettings.get(ability.Name),
			eTeam = abilSettings?.Team.SelectedID ?? ETeam.Controlable
		const stateByTeam = this.StateByTeam(owner, eTeam)
		return this.Abilities.IsEnabled(ability.Name) && stateByTeam
	}

	public IsEnabledAttack(owner: SpiritBear) {
		const eTeam = this.Attack.Team.SelectedID
		const stateByTeam = this.StateByTeam(owner, eTeam)
		return this.AttackState.value && stateByTeam
	}

	public SetAbilities(hero: SpiritBear, abilities: Ability[]) {
		if (hero.IsValid) {
			this.AddAbilities(abilities)
		}
	}

	public DestroyBear() {
		this.AbilitySettings.forEach(node => node.Destroy())

		if (!this.AbilitySettings.size) {
			return
		}
		this.Abilities.values.clear()
		this.Abilities.IsHidden = true
		this.Abilities.Update()
	}

	protected AddAbilities(abilities: Ability[]) {
		for (let index = abilities.length - 1; index > -1; index--) {
			const ability = abilities[index]
			this.AddAbility(ability.Name, ability.TexturePath)
			this.Tree.Update()
		}
	}

	protected AddAbility(name: string, texturePath: string) {
		if (this.AbilitySettings.has(name)) {
			return
		}

		const newClass = new AbilitySettings(this.Tree, name, texturePath)
		this.AbilitySettings.set(name, newClass)
		newClass.Tree.IsHidden = false
		newClass.Tree.Update()

		this.Abilities.values.push(name)
		newClass.Tree.IsHidden = !this.Abilities.IsEnabled(name)
		this.Abilities.Update()
		this.Tree.Update()
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
