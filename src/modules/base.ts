import {
	Ability,
	ability_capture,
	ability_lamp_use,
	ability_pluck_famango,
	DOTAScriptInventorySlot,
	Entity,
	generic_hidden,
	high_five,
	ParticlesSDK,
	plus_guild_banner,
	plus_high_five,
	twin_gate_portal_warp,
	Unit
} from "github.com/octarine-public/wrapper/index"

import { BaseMenu } from "../menu/base"
import { MenuManager } from "../menu/index"
import { BaseUnitData } from "../models/base"

export abstract class BaseManager {
	constructor(
		protected readonly menu: MenuManager,
		protected readonly pSDK: ParticlesSDK
	) {}

	protected get State() {
		return this.menu.State.value
	}

	public abstract MenuChanged(): void
	public abstract EntityCreated(entity: Entity): void
	public abstract EntityDestroyed(entity: Entity): void
}

export abstract class BaseUnitManager extends BaseManager {
	protected readonly excluded = new Set([
		"item_flask",
		"item_bfury",
		"item_branches",
		"item_tango",
		"item_clarity",
		"invoker_quas",
		"invoker_wex",
		"invoker_exort",
		"item_magic_stick",
		"item_magic_wand",
		"item_shadow_amulet",
		"item_quelling_blade",
		"item_enchanted_mango",
		"rubick_telekinesis_land",
		"rubick_telekinesis_land_self",
		"alchemist_unstable_concoction_throw"
	])

	public abstract EntityCreated(entity: Unit): void
	public abstract EntityDestroyed(entity: Unit | Ability): void

	public abstract UnitItemsChanged(entity: Unit): void
	public abstract UnitAbilitiesChanged(entity: Unit): void
	public abstract AbilityLevelChanged(entity: Ability): void

	protected abstract GetOrAddUnitData(entity: Unit): Nullable<BaseUnitData>
	protected abstract UnitShouldBeValid(entity: Nullable<Entity>): entity is Unit

	protected GetItems(unit: Nullable<Unit>) {
		if (unit === undefined || !unit.CanUseItems) {
			return []
		}
		const inventory = unit.Inventory
		const arr = inventory.GetItems(
			DOTAScriptInventorySlot.DOTA_ITEM_SLOT_1,
			DOTAScriptInventorySlot.DOTA_ITEM_SLOT_6
		)
		if (inventory.NeutralItem !== undefined) {
			arr.push(inventory.NeutralItem)
		}
		return arr
	}

	protected AbilityShouldBeValid(ability: Nullable<Ability>) {
		if (ability === undefined || this.AbilityExclude(ability)) {
			return false
		}
		return (
			ability.GetCastRangeForLevel(1) !== 0 ||
			ability.GetBaseAOERadiusForLevel(1) !== 0
		)
	}

	protected AbilityExclude(ability: Ability) {
		if (ability.IsPassive || ability.IsAttributes) {
			return true
		}
		if (this.excluded.has(ability.Name) || ability.MaxLevel === 0) {
			return true
		}
		return (
			ability.IsEmpty ||
			ability.Name.endsWith("_release") ||
			ability.Name.startsWith("seasonal_") ||
			ability instanceof high_five ||
			ability instanceof plus_high_five ||
			ability instanceof plus_guild_banner ||
			ability instanceof generic_hidden ||
			ability instanceof twin_gate_portal_warp ||
			ability instanceof ability_lamp_use ||
			ability instanceof ability_pluck_famango ||
			ability instanceof ability_capture
		)
	}

	protected UpdateUnitDataItems(unitData: Nullable<BaseUnitData>, menu: BaseMenu) {
		if (unitData === undefined) {
			return
		}
		const items = this.GetItems(unitData.Owner).filter(abil =>
			this.AbilityShouldBeValid(abil)
		)
		unitData?.UnitItemsChanged(this.pSDK, menu, items)
	}

	protected UpdateUnitDataSpells(unitData: Nullable<BaseUnitData>, menu: BaseMenu) {
		if (unitData === undefined) {
			return
		}
		const spells = unitData.Owner.Spells.filter(abil =>
			this.AbilityShouldBeValid(abil)
		) as Ability[]

		unitData.UnitAbilitiesChanged(this.pSDK, menu, spells)
	}

	protected UpdateUnitDataAbilities(
		unitData: BaseUnitData,
		menu: BaseMenu,
		updateItems: boolean = true,
		updateSpells: boolean = true
	) {
		if (!updateItems && !updateSpells) {
			return
		}
		if (updateItems) {
			this.UpdateUnitDataItems(unitData, menu)
		}
		if (updateSpells) {
			this.UpdateUnitDataSpells(unitData, menu)
		}
	}

	// hack destroy ability particles if entity is not exist
	protected DestroyAbilityRadius(ability: Ability) {
		const keyName = ability.Name + "_" + ability.Index
		this.pSDK.DestroyByKey(keyName)
	}
}
