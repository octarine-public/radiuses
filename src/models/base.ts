import {
	Ability,
	Item,
	ParticlesSDK,
	Unit
} from "github.com/octarine-public/wrapper/index"

import { BaseMenu } from "../menu/base"

export abstract class BaseUnitData {
	protected items: Item[] = []
	protected spells: Ability[] = []
	protected AttackRangeOld = 0
	protected readonly abilitiesRadiusCaches = new Map<Ability, number>()

	constructor(public readonly Owner: Unit) {}

	public abstract Draw(pSDK: ParticlesSDK, menu: BaseMenu): void
	public abstract MenuChanged(pSDK: ParticlesSDK, menu: BaseMenu): void

	public abstract UnitDestroyed(pSDK: ParticlesSDK, menu: BaseMenu): void
	public abstract AbilityDestroyed(pSDK: ParticlesSDK, entity: Item | Ability): void

	protected abstract UpdateAbilityRadius(
		pSDK: ParticlesSDK,
		menu: BaseMenu,
		entity: Item | Ability
	): void

	public abstract AbilityLevelChanged(
		pSDK: ParticlesSDK,
		menu: BaseMenu,
		entity: Ability
	): void

	public abstract UnitAbilitiesChanged(
		pSDK: ParticlesSDK,
		menu: BaseMenu,
		abilities: Ability[]
	): void

	public abstract UnitItemsChanged(
		pSDK: ParticlesSDK,
		menu: BaseMenu,
		newitems: Item[]
	): void

	protected Radius(ability: Ability) {
		return ability.Level <= 0
			? ability.GetCastRangeForLevel(1) === 0
				? ability.GetBaseAOERadiusForLevel(1)
				: ability.GetCastRangeForLevel(1)
			: ability.CastRange === 0
				? ability.AOERadius
				: ability.CastRange
	}

	protected KeyAbilityName(ability: Ability) {
		return ability.Name + "_" + ability.Index
	}

	protected KeyAttackName() {
		return this.Owner.Name + "_" + this.Owner.Index + "_attack"
	}

	// Destroy attack radius
	protected DestroyAttackRadius(pSDK: ParticlesSDK) {
		pSDK.DestroyByKey(this.KeyAttackName())
	}

	// Destroy ability radius
	protected DestroyAbilityRadius(pSDK: ParticlesSDK, ability: Ability) {
		this.abilitiesRadiusCaches.delete(ability)
		pSDK.DestroyByKey(this.KeyAbilityName(ability))
	}

	protected UpdateAbilitiesRadius(pSDK: ParticlesSDK, menu: BaseMenu) {
		const abilities = this.spells.concat(this.items)
		for (let index = abilities.length - 1; index > -1; index--) {
			this.UpdateAbilityRadius(pSDK, menu, abilities[index])
		}
	}

	protected ExceptItems(pSDK: ParticlesSDK, newitems: Item[]) {
		const arr = this.items.except(newitems)
		for (let index = arr.length - 1; index > -1; index--) {
			const item = arr[index]
			this.DestroyAbilityRadius(pSDK, item)
		}
	}

	protected UpdateCacheRadius(pSDK: ParticlesSDK, menu: BaseMenu) {
		const findSpell = this.spells.concat(this.items).find(spell => {
			const cachedRadius = this.abilitiesRadiusCaches.get(spell)
			return cachedRadius !== undefined && cachedRadius !== this.Radius(spell)
		})
		if (findSpell !== undefined) {
			this.UpdateAbilityRadius(pSDK, menu, findSpell)
		}
	}
}
