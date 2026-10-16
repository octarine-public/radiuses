
import { EMenuType } from "../../enum"
import { RadiusesIcons } from "../../icons"
import { BaseMenu } from "../base"
import { IsUnitTeamSelected } from "../team"
import { AbilitySettings, AttackSettings } from "./settings"

export class BearMenu extends BaseMenu {
	public readonly Attack: AttackSettings
	public readonly AttackState: Menu.Toggle
	public readonly Abilities: Menu.ImageSelector
	public readonly AbilitySettings = new Map<string, AbilitySettings>()

	constructor(
		node: Menu.Node,
		private readonly baseState: Menu.Toggle,
		public readonly Style: Menu.Dropdown
	) {
		super(
			node,
			EMenuType.Bear,
			false,
			RadiusesIcons.Bear,
			undefined,
			"Attack and ability radiuses of the Spirit Bear.\nShown while a bear is in the game"
		)
		this.Tree.SortNodes = false
		this.Tree.SaveUnusedConfigs = true
		this.Tree.IsHidden = true

		this.AttackState = this.Tree.AddToggle(
			"RADIUSES_ATTACK_TITLE",
			false,
			"Draw the attack range.\nFill and teams are behind the gear"
		)
		this.AttackState.IconPath = RadiusesIcons.Attack
		this.Attack = new AttackSettings(this.Tree, this.AttackState)
		this.Abilities = this.Tree.AddImageSelector(
			"RADIUSES_HIDDEN_TITLE",
			[],
			undefined,
			"Click an ability to draw its radius"
		)
		this.Abilities.IsHidden = true

		this.AttackState.OnValue(() => this.EmitMenuChanged())

		this.Abilities.OnValue(call => {
			this.UpdateAbilitiesState(call)
			this.Tree.Update()
			this.EmitMenuChanged()
		})
	}

	public get FullState() {
		return this.baseState.value && this.State.value
	}

	/** Shows the card while a Spirit Bear is in the game and folds it away once none is left. */
	public SetVisible(visible: boolean) {
		if (this.Tree.IsHidden === !visible) {
			return
		}
		this.Tree.IsHidden = !visible
		this.Tree.Update()
	}

	public IsEnabledAbility(ability: Ability, owner: SpiritBear) {
		const abilSettings = this.AbilitySettings.get(ability.Name)
		const stateByTeam =
			abilSettings === undefined
				? owner.IsControllable
				: IsUnitTeamSelected(owner, abilSettings.Team)
		return this.Abilities.IsEnabled(ability.Name) && stateByTeam
	}

	public IsEnabledAttack(owner: SpiritBear) {
		return this.AttackState.value && IsUnitTeamSelected(owner, this.Attack.Team)
	}

	public SetAbilities(hero: SpiritBear, abilities: Ability[]) {
		if (hero.IsValid) {
			this.AddAbilities(abilities)
		}
	}

	public DestroyBear() {
		if (!this.AbilitySettings.size) {
			return
		}
		this.AbilitySettings.forEach(node => node.Destroy())
		this.AbilitySettings.clear()
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
		this.Abilities.IsHidden = false
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
