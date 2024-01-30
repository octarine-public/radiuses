import {
	Ability,
	Entity,
	Hero,
	Item,
	Unit
} from "github.com/octarine-public/wrapper/index"

import { HeroData } from "../models/hero"
import { BaseUnitManager } from "./base"

export class HeroManager extends BaseUnitManager {
	private readonly heroes = new Map<Hero, HeroData>()

	protected get State() {
		return super.State && this.menu.HeroMenu.State.value
	}

	public Draw() {
		if (this.State) {
			this.heroes.forEach(data => data.Draw(this.pSDK, this.menu.HeroMenu))
		}
	}

	public MenuChanged(unit?: Unit) {
		if (unit instanceof Hero) {
			this.heroes.get(unit)?.MenuChanged(this.pSDK, this.menu.HeroMenu)
			return
		}
		this.heroes.forEach(data => data.MenuChanged(this.pSDK, this.menu.HeroMenu))
	}

	public EntityCreated(entity: Hero) {
		if (this.UnitShouldBeValid(entity)) {
			this.GetOrAddUnitData(entity)
		}
	}

	public AbilityLevelChanged(entity: Ability) {
		const owner = entity.Owner
		if (!(owner instanceof Hero) || !this.AbilityShouldBeValid(entity)) {
			return
		}
		this.GetOrAddUnitData(owner)?.AbilityLevelChanged(
			this.pSDK,
			this.menu.HeroMenu,
			entity
		)
	}

	public UnitPropertyChanged(entity: Hero) {
		if (this.UnitShouldBeValid(entity)) {
			this.GetOrAddUnitData(entity)
		}
	}

	public EntityDestroyed(entity: Hero | Ability) {
		if (entity instanceof Hero) {
			this.heroes.get(entity)?.UnitDestroyed(this.pSDK, this.menu.HeroMenu)
		}
		if (!(entity instanceof Item || entity instanceof Ability)) {
			return
		}
		this.DestroyAbilityRadius(entity)
		const owner = entity.Owner
		if (!(owner instanceof Hero)) {
			return
		}
		if (this.AbilityShouldBeValid(entity)) {
			this.heroes.get(owner)?.AbilityDestroyed(this.pSDK, entity)
		}
	}

	public LifeStateChanged(entity: Hero) {
		if (this.UnitShouldBeValid(entity)) {
			this.GetOrAddUnitData(entity)?.LifeStateChanged(this.pSDK, this.menu.HeroMenu)
		}
	}

	public UnitAbilitiesChanged(entity: Hero) {
		if (this.UnitShouldBeValid(entity)) {
			this.UpdateUnitDataSpells(this.GetOrAddUnitData(entity), this.menu.HeroMenu)
		}
	}

	public UnitItemsChanged(entity: Hero) {
		if (this.UnitShouldBeValid(entity)) {
			this.UpdateUnitDataItems(this.GetOrAddUnitData(entity), this.menu.HeroMenu)
		}
	}

	protected UnitShouldBeValid(entity: Nullable<Entity>): entity is Hero {
		if (!(entity instanceof Hero)) {
			return false
		}
		if (entity.IsClone) {
			return true
		}
		return !entity.IsIllusion
	}

	protected GetOrAddUnitData(entity: Hero) {
		if (!entity.IsValid || !this.UnitShouldBeValid(entity)) {
			return
		}
		let getUnitData = this.heroes.get(entity)
		if (getUnitData === undefined) {
			getUnitData = new HeroData(entity)
			this.heroes.set(entity, getUnitData)
			this.menu.HeroMenu.AddHero(entity)
			this.UpdateUnitDataAbilities(getUnitData, this.menu.HeroMenu)
			return getUnitData
		}
		return getUnitData
	}
}
