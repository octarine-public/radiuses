import {
	Ability,
	Color,
	Item,
	PARTICLE_RENDER,
	ParticleAttachment,
	ParticlesSDK,
	SpiritBear
} from "github.com/octarine-public/wrapper/index"

import { BearMenu } from "../menu/bear/index"
import { BaseUnitData } from "./base"

export class BearData extends BaseUnitData {
	constructor(public readonly Owner: SpiritBear) {
		super(Owner)
	}

	public Draw(pSDK: ParticlesSDK, menu: BearMenu) {
		this.UpdateAttackRangeCache(pSDK, menu)
	}

	public MenuChanged(pSDK: ParticlesSDK, menu: BearMenu) {
		this.UpdateAttackRadius(pSDK, menu)
		this.UpdateAbilitiesRadius(pSDK, menu)
	}

	public UnitPropertyChanged(pSDK: ParticlesSDK, menu: BearMenu): void {
		this.UpdateAttackRadius(pSDK, menu)
		this.UpdateAbilitiesRadius(pSDK, menu)
	}

	public LifeStateChanged(pSDK: ParticlesSDK, menu: BearMenu) {
		this.UpdateAttackRadius(pSDK, menu)
		this.UpdateAbilitiesRadius(pSDK, menu)
	}

	public UnitDestroyed(pSDK: ParticlesSDK, menu: BearMenu) {
		this.DestroyAttackRadius(pSDK)
		this.attackRangeCaches.delete(this.Owner)
		menu.DestroyBear()
	}

	public AbilityDestroyed(pSDK: ParticlesSDK, entity: Item | Ability) {
		this.DestroyAbilityRadius(pSDK, entity)

		if (entity instanceof Ability) {
			this.spells.remove(entity)
		}

		if (entity instanceof Item) {
			this.items.remove(entity)
		}
	}

	public UnitAbilitiesChanged(
		pSDK: ParticlesSDK,
		menu: BearMenu,
		abilities: Ability[]
	) {
		this.spells = abilities
		menu.SetAbilities(this.Owner, abilities)
		this.UpdateAbilitiesRadius(pSDK, menu)
	}

	public UnitItemsChanged(pSDK: ParticlesSDK, menu: BearMenu, newitems: Item[]) {
		this.ExceptItems(pSDK, newitems)
		this.items = newitems
		menu.SetAbilities(this.Owner, newitems)
		this.UpdateAbilitiesRadius(pSDK, menu)
	}

	public AbilityLevelChanged(pSDK: ParticlesSDK, menu: BearMenu, entity: Ability) {
		this.UpdateAbilityRadius(pSDK, menu, entity)
	}

	protected UpdateAttackRadius(pSDK: ParticlesSDK, baseMenu: BearMenu) {
		const owner = this.Owner
		const menu = baseMenu.Attack
		const stateAttack = baseMenu.IsEnabledAttack(owner)
		const stateOwner = owner.IsAlive && owner.IsVisible && owner.ShouldRespawn
		if (!baseMenu.FullState || !stateOwner || !stateAttack) {
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
		menu: BearMenu,
		ability: Item | Ability
	) {
		const owner = ability.Owner as Nullable<SpiritBear>
		if (owner === undefined) {
			return
		}
		const abilSettings = menu?.AbilitySettings.get(ability.Name)
		const stateOwner = owner.IsAlive && owner.IsVisible && owner.ShouldRespawn
		const stateSpells = ability.IsValid && menu.IsEnabledAbility(ability, owner)
		if (!menu.FullState || !stateOwner || !stateSpells) {
			this.DestroyAbilityRadius(pSDK, ability)
			return
		}
		pSDK.DrawCircle(this.KeyAbilityName(ability), owner, this.Radius(ability), {
			Fill: abilSettings?.Fill.value ?? false,
			Color: abilSettings?.Color.SelectedColor ?? Color.Aqua,
			Attachment: ParticleAttachment.PATTACH_ABSORIGIN_FOLLOW,
			RenderStyle: abilSettings?.Style.SelectedID ?? PARTICLE_RENDER.NORMAL
		})
	}

	protected UpdateAttackRangeCache(pSDK: ParticlesSDK, menu: BearMenu) {
		this.attackRangeCaches.forEach((oldRange, unit) => {
			const newAttackRange = unit.GetAttackRange()
			if (newAttackRange === oldRange) {
				return
			}
			this.UpdateAttackRadius(pSDK, menu)
			this.attackRangeCaches.set(unit, newAttackRange)
		})
	}
}
