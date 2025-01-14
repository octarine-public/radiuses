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

	public Draw(pSDK: ParticlesSDK, _menu: HeroMenu) {
		this.UpdateRazePosition(pSDK)
	}

	public PostDataUpdate(pSDK: ParticlesSDK, menu: HeroMenu): void {
		this.UpdateCacheRadius(pSDK, menu)
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
		menu.DestroyHero(this.Owner)
	}

	public AbilityDestroyed(pSDK: ParticlesSDK, entity: Item | Ability) {
		this.DestroyAbilityRadius(pSDK, entity)
		if (entity instanceof Item) {
			this.items.remove(entity)
		}
		if (entity instanceof Ability) {
			this.razes.delete(entity)
			this.spells.remove(entity)
		}
	}

	public AbilityLevelChanged(pSDK: ParticlesSDK, menu: HeroMenu, entity: Ability) {
		this.UpdateAbilityRadius(pSDK, menu, entity)
	}

	public UnitPropertyChanged(pSDK: ParticlesSDK, menu: HeroMenu) {
		this.UpdateAttackRadius(pSDK, menu)
		this.UpdateAbilitiesRadius(pSDK, menu)
	}

	protected UpdateAttackRadius(
		pSDK: ParticlesSDK,
		baseMenu: HeroMenu,
		newAttackRange?: number
	) {
		const owner = this.Owner
		const menu = baseMenu.AttackSettings(owner)
		if (menu === undefined) {
			this.AttackRangeOld = 0
			return
		}
		const stateAttack = baseMenu.IsEnabledAttack(owner)
		if (!baseMenu.FullState || !owner.IsAlive || !stateAttack) {
			this.DestroyAttackRadius(pSDK)
			this.AttackRangeOld = 0
			return
		}
		const attackRange = newAttackRange ?? owner.GetAttackRange()
		pSDK.DrawCircle(this.KeyAttackName(), owner, attackRange, {
			Fill: menu.Fill.value,
			Color: menu.Color.SelectedColor,
			RenderStyle: menu.Style.SelectedID,
			Attachment: ParticleAttachment.PATTACH_ABSORIGIN_FOLLOW
		})
		this.AttackRangeOld = attackRange
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
		this.abilitiesRadiusCaches.set(ability, this.Radius(ability))
	}

	protected CreateShadowRaze(
		pSDK: ParticlesSDK,
		abilSettings: Nullable<HeroAbilitySettings>,
		owner: Unit,
		ability: Ability
	) {
		this.razes.add(ability)
		const currRadius = ability.AOERadius
		const radiusByLevel = ability.GetBaseAOERadiusForLevel(1)
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
		const newAttackRange = this.Owner.GetAttackRange()
		if (newAttackRange !== this.AttackRangeOld) {
			this.UpdateAttackRadius(pSDK, menu, newAttackRange)
		}
	}

	protected UpdateRazePosition(pSDK: ParticlesSDK) {
		this.razes.forEach(abil => {
			if (abil.Owner === undefined) {
				pSDK.DestroyByKey(this.KeyAbilityName(abil))
				this.razes.delete(abil)
				return
			}
			const castRangeByLevel = abil.GetBaseCastRangeForLevel(1)
			const position = abil.Owner.InFront(castRangeByLevel)
			pSDK.SetConstrolPointsByKey(this.KeyAbilityName(abil), [0, position])
		})
	}
}
