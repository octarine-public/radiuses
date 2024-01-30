import {
	Ability,
	Color,
	Hero,
	Item,
	nevermore_shadowraze1,
	nevermore_shadowraze2,
	nevermore_shadowraze3,
	ParticleAttachment,
	ParticlesSDK,
	Unit
} from "github.com/octarine-public/wrapper/index"

import { HeroMenu } from "../menu/heroes/index"
import { HeroAbilitySettings } from "../menu/heroes/settings"
import { BaseUnitData } from "./base"

export class HeroData extends BaseUnitData {
	private readonly razes = new Set<Ability>()

	constructor(public readonly Owner: Hero) {
		super(Owner)
	}

	public Draw(pSDK: ParticlesSDK, menu: HeroMenu) {
		this.UpdateRazePosition(pSDK)
		this.UpdateAttackRangeCache(pSDK, menu)
	}

	public UnitItemsChanged(pSDK: ParticlesSDK, menu: HeroMenu, newitems: Item[]) {
		this.ExceptItems(pSDK, newitems)
		this.items = newitems
		menu.SetAbilities(this.Owner, newitems)
		this.UpdateAbilitiesRadius(pSDK, menu)
	}

	public UnitAbilitiesChanged(
		pSDK: ParticlesSDK,
		menu: HeroMenu,
		abilities: Ability[]
	) {
		this.spells = abilities
		menu.SetAbilities(this.Owner, abilities)
		this.UpdateAbilitiesRadius(pSDK, menu)
	}

	public LifeStateChanged(pSDK: ParticlesSDK, menu: HeroMenu) {
		this.UpdateAttackRadius(pSDK, menu)
		this.UpdateAbilitiesRadius(pSDK, menu)
	}

	public MenuChanged(pSDK: ParticlesSDK, menu: HeroMenu) {
		this.UpdateAttackRadius(pSDK, menu)
		this.UpdateAbilitiesRadius(pSDK, menu)
	}

	public UnitDestroyed(pSDK: ParticlesSDK, menu: HeroMenu) {
		this.DestroyAttackRadius(pSDK)
		this.attackRangeCaches.delete(this.Owner)
		menu.DestroyHero(this.Owner)
	}

	public AbilityDestroyed(pSDK: ParticlesSDK, entity: Item | Ability) {
		this.DestroyAbilityRadius(pSDK, entity)

		if (entity instanceof Ability) {
			this.razes.delete(entity)
			this.spells.remove(entity)
		}

		if (entity instanceof Item) {
			this.items.remove(entity)
		}
	}

	public AbilityLevelChanged(pSDK: ParticlesSDK, menu: HeroMenu, entity: Ability) {
		this.UpdateAbilityRadius(pSDK, menu, entity)
	}

	public UnitPropertyChanged(pSDK: ParticlesSDK, menu: HeroMenu) {
		this.UpdateAttackRadius(pSDK, menu)
		this.UpdateAbilitiesRadius(pSDK, menu)
	}

	protected UpdateAttackRadius(pSDK: ParticlesSDK, baseMenu: HeroMenu) {
		const owner = this.Owner
		const menu = baseMenu.AttackSettings(owner)
		if (menu === undefined) {
			return
		}
		const stateAttack = baseMenu.IsEnabledAttack(owner)
		if (!baseMenu.FullState || !owner.IsAlive || !stateAttack) {
			this.DestroyAttackRadius(pSDK)
			return
		}
		const attackRange = owner.GetAttackRange()
		pSDK.DrawCircle(this.KeyAttackName(), owner, attackRange, {
			Fill: menu.Fill.value,
			Color: menu.Color.SelectedColor,
			RenderStyle: menu.Style.SelectedID,
			Attachment: ParticleAttachment.PATTACH_ABSORIGIN_FOLLOW
		})
	}

	protected UpdateAbilityRadius(
		pSDK: ParticlesSDK,
		menu: HeroMenu,
		ability: Item | Ability
	) {
		const owner = ability.Owner
		if (owner === undefined) {
			return
		}
		const stateSpells = ability.IsValid && menu.IsEnabledAbility(ability)
		if (!menu.FullState || !owner.IsAlive || !stateSpells) {
			this.DestroyAbilityRadius(pSDK, ability)
			return
		}
		this.CreateAbilityCircle(pSDK, menu, owner, ability)
	}

	protected CreateAbilityCircle(
		pSDK: ParticlesSDK,
		menu: HeroMenu,
		owner: Unit,
		ability: Ability
	) {
		const node = menu.GetNode(owner)
		const abilSettings = node?.AbilitySettings.get(ability.Name)

		if (
			ability instanceof nevermore_shadowraze1 ||
			ability instanceof nevermore_shadowraze2 ||
			ability instanceof nevermore_shadowraze3
		) {
			this.CreateShadowRaze(pSDK, abilSettings, owner, ability)
			return
		}
		pSDK.DrawCircle(this.KeyAbilityName(ability), owner, this.Radius(ability), {
			Fill: abilSettings?.Fill.value ?? false,
			RenderStyle: abilSettings?.Style.SelectedID ?? 0,
			Color: abilSettings?.Color.SelectedColor ?? Color.Aqua,
			Attachment: ParticleAttachment.PATTACH_ABSORIGIN_FOLLOW
		})
	}

	protected CreateShadowRaze(
		pSDK: ParticlesSDK,
		abilSettings: Nullable<HeroAbilitySettings>,
		owner: Unit,
		ability: Ability
	) {
		this.razes.add(ability)
		const radiusByLevel = ability.GetBaseAOERadiusForLevel(1)
		const currRadius = ability.AOERadius
		const radius = currRadius < radiusByLevel ? radiusByLevel : currRadius
		pSDK.DrawCircle(this.KeyAbilityName(ability), owner, radius, {
			Fill: abilSettings?.Fill.value ?? true,
			RenderStyle: abilSettings?.Style.SelectedID ?? 0,
			Color: abilSettings?.Color.SelectedColor ?? Color.Aqua,
			Attachment: ParticleAttachment.PATTACH_CUSTOMORIGIN,
			Position: owner.InFront(ability.GetCastRangeForLevel(1))
		})
	}

	protected UpdateAttackRangeCache(pSDK: ParticlesSDK, menu: HeroMenu) {
		this.attackRangeCaches.forEach((oldRange, unit) => {
			const newAttackRange = unit.GetAttackRange()
			if (newAttackRange === oldRange) {
				return
			}
			this.UpdateAttackRadius(pSDK, menu)
			this.attackRangeCaches.set(unit, newAttackRange)
		})
	}

	protected UpdateRazePosition(pSDK: ParticlesSDK) {
		this.razes.forEach(abil => {
			if (abil.Owner !== undefined) {
				const position = abil.Owner.InFront(abil.GetCastRangeForLevel(1))
				pSDK.SetConstrolPointsByKey(this.KeyAbilityName(abil), [0, position])
				return
			}
			pSDK.DestroyByKey(this.KeyAbilityName(abil))
			this.razes.delete(abil)
		})
	}
}
