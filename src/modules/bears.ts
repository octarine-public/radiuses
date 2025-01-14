import {
	Ability,
	Entity,
	Item,
	SpiritBear
} from "github.com/octarine-public/wrapper/index"

import { BearData } from "../models/bear"
import { BaseUnitManager } from "./base"

export class BearManager extends BaseUnitManager {
	private readonly bears = new Map<SpiritBear, BearData>()

	protected get State() {
		return super.State && this.menu.BearMenu.State.value
	}

	public PostDataUpdate(): void {
		if (this.State) {
			this.bears.forEach(data => data.PostDataUpdate(this.pSDK, this.menu.BearMenu))
		}
	}

	public MenuChanged() {
		this.bears.forEach(data => data.MenuChanged(this.pSDK, this.menu.BearMenu))
	}

	public AbilityLevelChanged(entity: Ability): void {
		const owner = entity.Owner
		if (!(owner instanceof SpiritBear) || !this.AbilityShouldBeValid(entity)) {
			return
		}
		this.GetOrAddUnitData(owner)?.AbilityLevelChanged(
			this.pSDK,
			this.menu.BearMenu,
			entity
		)
	}

	public EntityCreated(entity: SpiritBear): void {
		if (this.UnitShouldBeValid(entity)) {
			this.GetOrAddUnitData(entity)
		}
	}

	public EntityDestroyed(entity: SpiritBear | Ability): void {
		if (entity instanceof SpiritBear) {
			this.bears.get(entity)?.UnitDestroyed(this.pSDK, this.menu.BearMenu)
		}
		if (!(entity instanceof Item || entity instanceof Ability)) {
			return
		}
		this.DestroyAbilityRadius(entity)
		const owner = entity.Owner
		if (!(owner instanceof SpiritBear)) {
			return
		}
		if (this.AbilityShouldBeValid(entity)) {
			this.bears.get(owner)?.AbilityDestroyed(this.pSDK, entity)
		}
	}

	public UnitPropertyChanged(entity: SpiritBear): void {
		if (this.UnitShouldBeValid(entity)) {
			this.GetOrAddUnitData(entity)?.UnitPropertyChanged(
				this.pSDK,
				this.menu.BearMenu
			)
		}
	}

	public UnitAbilitiesChanged(entity: SpiritBear): void {
		if (this.UnitShouldBeValid(entity)) {
			this.UpdateUnitDataSpells(this.GetOrAddUnitData(entity), this.menu.BearMenu)
		}
	}

	public UnitItemsChanged(entity: SpiritBear): void {
		if (this.UnitShouldBeValid(entity)) {
			this.UpdateUnitDataItems(this.GetOrAddUnitData(entity), this.menu.BearMenu)
		}
	}

	public LifeStateChanged(entity: SpiritBear) {
		if (this.UnitShouldBeValid(entity)) {
			this.GetOrAddUnitData(entity)?.LifeStateChanged(this.pSDK, this.menu.BearMenu)
		}
	}

	protected UnitShouldBeValid(entity: Nullable<Entity>): entity is SpiritBear {
		return entity instanceof SpiritBear && entity.ShouldRespawn && !entity.IsIllusion
	}

	protected GetOrAddUnitData(entity: SpiritBear): Nullable<BearData> {
		if (!entity.IsValid || !this.UnitShouldBeValid(entity)) {
			return
		}
		let getUnitData = this.bears.get(entity)
		if (getUnitData === undefined) {
			getUnitData = new BearData(entity)
			this.bears.set(entity, getUnitData)
			this.UpdateUnitDataAbilities(getUnitData, this.menu.BearMenu)
			return getUnitData
		}
		return getUnitData
	}
}
