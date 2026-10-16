
import { EMenuType } from "../../enum"
import { RadiusesIcons } from "../../icons"
import { BaseMenu } from "../base"
import { NodeHero } from "../heroes/node"

/** Where a hero stands in the list: under your hero, the allies or the enemies. */
const enum EHeroGroup {
	Yours,
	Allies,
	Enemies
}

export class HeroMenu extends BaseMenu {
	private readonly hodeHeroes = new Map<Unit, NodeHero>()
	private readonly defaultState = ["item_blink"]
	private readonly groups: Menu.ShortDescription[]

	constructor(
		node: Menu.Node,
		private readonly baseState: Menu.Toggle,
		public readonly Style: Menu.Dropdown
	) {
		super(
			node,
			EMenuType.Heroes,
			false,
			RadiusesIcons.Heroes,
			undefined,
			"Attack and ability radiuses of the heroes in the game.\nEvery hero keeps settings of its own"
		)
		this.Tree.SortNodes = true
		this.Tree.SaveUnusedConfigs = true
		this.groups = ["Your hero", "Allies", "Enemies"].map((name, group) => {
			const header = this.Tree.AddSectionHeader(name)
			header.Priority = group * 2
			header.IsHidden = true
			return header
		})
	}

	public get FullState() {
		return this.baseState.value && this.State.value
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
			this.UpdateGroups()
			return
		}
		const node = new NodeHero(this.Tree, hero, this.countHeroesByName(hero.Name) + 1)
		this.hodeHeroes.set(hero, node)
		node.Menu.IsHidden = false
		this.UpdateGroups()
	}

	/** Files every hero under its group and shows the headings of the groups that have one. */
	public UpdateGroups() {
		const filled = this.groups.map(() => false)
		for (const node of this.hodeHeroes.values()) {
			const group = this.groupOf(node.hero)
			node.Menu.Priority = group * 2 + 1
			filled[group] = true
		}
		for (let i = 0; i < this.groups.length; i++) {
			this.groups[i].IsHidden = !filled[i]
		}
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
			this.hodeHeroes.delete(hero)
			this.UpdateGroups()
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

	protected countHeroesByName(name: string) {
		let count = 0
		for (const hero of this.hodeHeroes.keys()) {
			if (hero.Name === name && !hero.IsClone) {
				count++
			}
		}
		return count
	}

	private groupOf(hero: Unit) {
		if (hero.IsEnemy()) {
			return EHeroGroup.Enemies
		}
		return hero.IsMyHero || (hero.IsClone && hero.IsControllable)
			? EHeroGroup.Yours
			: EHeroGroup.Allies
	}
}
