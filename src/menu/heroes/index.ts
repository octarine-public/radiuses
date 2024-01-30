import { Ability, Hero, Menu, Unit } from "github.com/octarine-public/wrapper/index"

import { EMenuType } from "../../enum"
import { BaseMenu } from "../base"
import { NodeHero } from "../heroes/node"

export class HeroMenu extends BaseMenu {
	private readonly hodeHeroes = new Map<Unit, NodeHero>()
	private readonly defaultState = ["item_blink"]

	constructor(
		node: Menu.Node,
		private readonly baseState: Menu.Toggle
	) {
		super(node, EMenuType.Heroes, false, "menu/icons/juggernaut.svg")
		this.Tree.SortNodes = false
		this.Tree.SaveUnusedConfigs = true
	}

	public get FullState() {
		return this.baseState.value && this.State.value
	}

	public ResetSettings(): void {
		this.State.value = this.State.defaultValue
		this.hodeHeroes.forEach(hero => hero.ResetSettings())
		this.Tree.Update()
		this.EmitMenuChanged()
	}

	public IsEnabledAbility(ability: Ability) {
		const owner = ability.Owner
		if (owner === undefined) {
			return false
		}
		const abilName = ability.Name
		const node = this.GetNode(owner)
		const teamState = node?.AbilityStateByTeam(abilName) ?? false
		const abilState = node?.Abilities.IsEnabled(abilName) ?? false
		return abilState && teamState
	}

	public IsEnabledAttack(hero: Hero) {
		const node = this.GetNode(hero)
		const attackState = node?.AttackState.value ?? false
		const teamState = this.AttackSettings(hero)?.StateByTeam ?? false
		return attackState && teamState
	}

	public GetNode(hero: Unit) {
		return this.hodeHeroes.get(hero)
	}

	public AttackSettings(hero: Unit) {
		return this.hodeHeroes.get(hero)?.AttackSettings
	}

	public AddHero(hero: Hero) {
		if (!hero.IsValid || hero.IsIllusion) {
			return
		}
		const heroMenu = this.hodeHeroes.get(hero)
		if (heroMenu !== undefined) {
			heroMenu.Menu.IsHidden = false
			heroMenu.Menu.Update()
			this.Tree.Update()
			return
		}
		const node = new NodeHero(this.Tree, hero, this.hasHeroByName(hero.Name))
		this.hodeHeroes.set(hero, node)
		node.Menu.IsHidden = false
		node.Menu.Update()
		this.Tree.Update()
	}

	public SetAbilities(hero: Nullable<Hero>, abilities: Ability[]) {
		if (hero !== undefined && hero.IsValid) {
			this.AddAbilities(this.GetNode(hero), abilities)
		}
	}

	public DestroyHero(hero: Hero) {
		if (hero.IsValid) {
			return
		}
		const heroMenu = this.hodeHeroes.get(hero)
		if (heroMenu?.hero === hero) {
			heroMenu.DestroyAll()
			this.Tree.Update()
			this.hodeHeroes.delete(hero)
		}
	}

	protected AddAbilities(node: Nullable<NodeHero>, abilities: Ability[]) {
		for (let index = abilities.length - 1; index > -1; index--) {
			const ability = abilities[index]
			if (node === undefined || node.hero !== ability.Owner) {
				continue
			}
			if (node.Abilities.values.includes(ability.Name)) {
				continue
			}
			node.AddAbility(
				ability.Name,
				ability.TexturePath,
				this.defaultState.includes(ability.Name)
			)
			this.Tree.Update()
		}
	}

	protected hasHeroByName(name: string) {
		return Array.from(this.hodeHeroes.keys()).some(hero => hero.Name === name)
	}
}
